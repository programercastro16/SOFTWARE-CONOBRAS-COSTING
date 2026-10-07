import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Share2,
  Check,
  Building2,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Cotizacion, ConfiguracionEmpresa } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProposalPdfModalProps {
  quote: Cotizacion;
  config: ConfiguracionEmpresa;
  onClose: () => void;
}

export const ProposalPdfModal: React.FC<ProposalPdfModalProps> = ({
  quote,
  config,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Cálculos financieros
  const partidasCalculadas = quote.partidas.map(p => {
    const subtotal = p.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
    return { ...p, subtotal };
  });

  const costoDirectoTotal = partidasCalculadas.reduce((sum, p) => sum + p.subtotal, 0);
  const montoImprevistos = costoDirectoTotal * (quote.porcentajeImprevistos / 100);
  const montoGastosGenerales = costoDirectoTotal * (quote.porcentajeGastosGenerales / 100);
  const subtotalOperativo = costoDirectoTotal + montoImprevistos + montoGastosGenerales;
  const montoHonorarios = subtotalOperativo * (quote.porcentajeHonorarios / 100);
  const subtotalAntesIva = subtotalOperativo + montoHonorarios;
  const montoIva = quote.aplicaIva ? subtotalAntesIva * (quote.porcentajeIva / 100) : 0;
  const totalFinal = subtotalAntesIva + montoIva;

  const formatMoneda = (valor: number) => {
    return `${quote.moneda} ${valor.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Exportar PDF directo con alta resolución
  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);

    try {
      // Si está en Electron con API nativa
      if (window.electronAPI?.exportPdf) {
        const path = await window.electronAPI.exportPdf(null);
        if (path) {
          alert(`PDF exportado exitosamente en: ${path}`);
          setIsGeneratingPdf(false);
          return;
        }
      }

      // Generación mediante html2canvas + jsPDF en frontend
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // 300 DPI equivalency
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Cotizacion_${quote.codigo}_${quote.proyecto.slice(0, 20)}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      // Fallback a print nativo
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Compartir por WhatsApp
  const handleShareWhatsApp = () => {
    const cleanPhone = quote.telefono.replace(/\D/g, '');
    const message =
      `*PROPUESTA ECONÓMICA DE OBRA - CONOBRAS*\n` +
      `*Folio:* ${quote.codigo}\n` +
      `*Proyecto:* ${quote.proyecto}\n` +
      `*Cliente:* ${quote.cliente}\n` +
      `*Ubicación:* ${quote.ubicacion}\n\n` +
      `*Inversión Total Estimada:* ${formatMoneda(totalFinal)}\n` +
      `*Vigencia:* ${quote.validezDias} días a partir del ${quote.fecha}.\n\n` +
      `_Emitido por: ${config.arquitecto} | Conobras Construcción + Arquitectura_\n` +
      `Quedamos a su disposición para coordinar la revisión del proyecto.`;

    const encoded = encodeURIComponent(message);
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-[#0E121A] border border-[#252D3D] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">

        {/* HEADER DE CONTROL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252D3D] bg-[#12161F] no-print shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#D4AF37] font-bold bg-[#1A202C] px-2.5 py-1 rounded border border-[#D4AF37]/30">
              {quote.codigo}
            </span>
            <span className="text-sm font-semibold text-white truncate max-w-md">
              Vista Previa de Propuesta Institucional
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-medium transition-all"
              title="Compartir resumen por WhatsApp"
            >
              <Send size={13} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A202C] hover:bg-[#252D3D] border border-[#252D3D] text-xs text-[#8A94A6] hover:text-white transition-all"
            >
              <Printer size={13} />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8820] text-black font-semibold text-xs shadow-md shadow-[#D4AF37]/20 active:scale-95 transition-all"
            >
              <Download size={14} />
              <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8A94A6] hover:text-white hover:bg-[#1A202C] rounded-lg ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENEDOR DEL DOCUMENTO TIPO HOJA A4 IMPRESA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#07090C] flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-[800px] bg-white text-[#1A202C] p-8 sm:p-12 shadow-2xl rounded-sm print:shadow-none print:p-0 print:m-0"
            style={{ minHeight: '1050px', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            {/* MEMBRETE INSTITUCIONAL CONOBRAS */}
            <div className="flex justify-between items-start border-b-2 border-[#1A202C] pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-24 p-1 flex items-center justify-center">
                  <img
                    src="./assets/conobras-logo.png"
                    alt="Conobras"
                    className="max-h-full max-w-full object-contain filter drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-[#1A202C] uppercase">
                    CONOBRAS
                  </h1>
                  <p className="text-[10px] tracking-widest text-[#718096] uppercase font-semibold flex items-center gap-1">
                    CONSTRUCCIÓN + ARQUITECTURA
                    <span className="text-[#48BB78]">●</span>
                  </p>
                  <p className="text-[11px] text-[#4A5568] mt-1">
                    {config.direccion} • {config.telefono}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-bold tracking-widest text-[#AA8820] block">
                  PROPUESTA TÉCNICA Y ECONÓMICA
                </span>
                <span className="text-xl font-mono font-bold text-[#1A202C] block mt-0.5">
                  {quote.codigo}
                </span>
                <div className="text-xs text-[#718096] mt-1 space-y-0.5">
                  <div>Fecha: <strong className="text-[#1A202C]">{quote.fecha}</strong></div>
                  <div>Vigencia: <strong className="text-[#1A202C]">{quote.validezDias} días</strong></div>
                </div>
              </div>
            </div>

            {/* DATOS DEL CLIENTE Y PROYECTO */}
            <div className="grid grid-cols-2 gap-6 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg p-4 mb-6 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
                  DATOS DEL CLIENTE
                </span>
                <div className="font-bold text-sm text-[#1A202C]">{quote.cliente}</div>
                {quote.telefono && <div className="text-[#4A5568] mt-0.5">Tel: {quote.telefono}</div>}
                {quote.email && <div className="text-[#4A5568]">{quote.email}</div>}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
                  UBICACIÓN Y ALCANCE DE OBRA
                </span>
                <div className="font-bold text-sm text-[#1A202C]">{quote.proyecto}</div>
                <div className="text-[#4A5568] mt-0.5">{quote.ubicacion}</div>
              </div>
            </div>

            {/* DESGLOSE DE PARTIDAS Y CONCEPTOS */}
            <div className="space-y-5 mb-6">
              {partidasCalculadas.map((partida, pIdx) => (
                <div key={partida.id} className="border border-[#E2E8F0] rounded-md overflow-hidden">
                  <div className="bg-[#EDF2F7] px-3 py-2 flex justify-between items-center text-xs font-bold text-[#1A202C] border-b border-[#E2E8F0]">
                    <span>{partida.titulo}</span>
                    <span className="font-mono text-[#AA8820]">{formatMoneda(partida.subtotal)}</span>
                  </div>

                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-[#718096] uppercase bg-white border-b border-[#E2E8F0] text-[9px] tracking-wider">
                        <th className="py-1.5 px-3 w-8">#</th>
                        <th className="py-1.5 px-3">Concepto de Obra</th>
                        <th className="py-1.5 px-3 w-16 text-center">Unidad</th>
                        <th className="py-1.5 px-3 w-16 text-right">Cant.</th>
                        <th className="py-1.5 px-3 w-24 text-right">P. Unitario</th>
                        <th className="py-1.5 px-3 w-24 text-right">Importe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {partida.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 text-[#A0AEC0] font-mono">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-medium text-[#2D3748]">{item.descripcion}</td>
                          <td className="py-1.5 px-3 text-center text-[#718096] font-mono">{item.unidad}</td>
                          <td className="py-1.5 px-3 text-right font-mono">{item.cantidad}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-[#4A5568]">
                            {formatMoneda(item.precioUnitario)}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-semibold text-[#1A202C]">
                            {formatMoneda(item.cantidad * item.precioUnitario)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* RESUMEN FINANCIERO Y LIQUIDACIÓN */}
            <div className="grid grid-cols-2 gap-6 mb-8 pt-2">
              <div className="text-xs text-[#4A5568] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
                  TÉRMINOS Y CONDICIONES
                </span>
                <p className="whitespace-pre-line text-[11px] leading-relaxed bg-[#F7FAFC] p-3 rounded border border-[#E2E8F0]">
                  {quote.notas || 'No se han especificado condiciones adicionales.'}
                </p>
              </div>

              <div className="bg-[#F7FAFC] p-4 rounded-lg border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex justify-between text-[#4A5568]">
                  <span>Subtotal Costo Directo:</span>
                  <span className="font-mono font-medium">{formatMoneda(costoDirectoTotal)}</span>
                </div>
                <div className="flex justify-between text-[#4A5568]">
                  <span>Imprevistos de Obra ({quote.porcentajeImprevistos}%):</span>
                  <span className="font-mono">{formatMoneda(montoImprevistos)}</span>
                </div>
                <div className="flex justify-between text-[#4A5568]">
                  <span>Gastos Generales y Adm. ({quote.porcentajeGastosGenerales}%):</span>
                  <span className="font-mono">{formatMoneda(montoGastosGenerales)}</span>
                </div>
                <div className="flex justify-between text-[#AA8820] font-semibold border-t border-b border-[#E2E8F0] py-1.5 my-1">
                  <span>Honorarios de Diseño & Dirección ({quote.porcentajeHonorarios}%):</span>
                  <span className="font-mono">{formatMoneda(montoHonorarios)}</span>
                </div>
                {quote.aplicaIva && (
                  <div className="flex justify-between text-[#4A5568]">
                    <span>I.V.A. ({quote.porcentajeIva}%):</span>
                    <span className="font-mono">{formatMoneda(montoIva)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t-2 border-[#1A202C]">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[#1A202C] text-xs block">
                      TOTAL PRESUPUESTO:
                    </span>
                    <span className="text-[10px] text-[#718096]">Moneda nacional</span>
                  </div>
                  <span className="text-xl font-mono font-extrabold text-[#1A202C]">
                    {formatMoneda(totalFinal)}
                  </span>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE FIRMAS */}
            <div className="grid grid-cols-2 gap-12 pt-8 border-t border-[#E2E8F0] text-center text-xs text-[#4A5568]">
              <div>
                <div className="h-14 border-b border-[#A0AEC0] mb-2 flex items-end justify-center pb-1">
                  <span className="text-[10px] text-[#A0AEC0] italic font-serif">Firma autorizada</span>
                </div>
                <div className="font-bold text-[#1A202C]">{config.arquitecto}</div>
                <div className="text-[10px] text-[#718096]">
                  {config.cedulaProfesional ? `Cédula: ${config.cedulaProfesional}` : 'Arquitecto Titular'}
                </div>
                <div className="text-[10px] text-[#AA8820] font-semibold">Conobras Construcción + Arquitectura</div>
              </div>

              <div>
                <div className="h-14 border-b border-[#A0AEC0] mb-2 flex items-end justify-center pb-1">
                  <span className="text-[10px] text-[#A0AEC0] italic font-serif">Aceptación de propuesta</span>
                </div>
                <div className="font-bold text-[#1A202C]">{quote.cliente}</div>
                <div className="text-[10px] text-[#718096]">Firma de Conformidad del Cliente</div>
                <div className="text-[10px] text-[#A0AEC0]">Fecha: ____ / ____ / ________</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
