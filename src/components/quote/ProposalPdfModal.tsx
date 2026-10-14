import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Building2,
  Send,
  FileText
} from 'lucide-react';
import { Cotizacion, ConfiguracionEmpresa } from '../../types';
import { DEFAULT_CONFIG } from '../../data/seedData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProposalPdfModalProps {
  quote: Cotizacion;
  config?: ConfiguracionEmpresa | null;
  onClose: () => void;
}

interface PageSection {
  pageNumber: number;
  partidas: Array<{
    id: string;
    titulo: string;
    subtotal: number;
    items: Array<{
      id: string;
      descripcion: string;
      unidad: string;
      cantidad: number;
      precioUnitario: number;
    }>;
  }>;
  showFullHeader: boolean;
  showClientBox: boolean;
  showTotalsAndTerms: boolean;
  showSignatures: boolean;
}

export const ProposalPdfModal: React.FC<ProposalPdfModalProps> = ({
  quote,
  config,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Configuracion segura garantizada
  const safeConfig: ConfiguracionEmpresa = {
    ...DEFAULT_CONFIG,
    ...(config || {})
  };

  // Cotización segura garantizada
  const safeQuote: Cotizacion = {
    ...quote,
    codigo: quote?.codigo || 'CNB-001',
    cliente: quote?.cliente || 'Cliente General',
    telefono: quote?.telefono || '',
    email: quote?.email || '',
    proyecto: quote?.proyecto || 'Obra Sin Nombre',
    ubicacion: quote?.ubicacion || '',
    fecha: quote?.fecha || new Date().toISOString().split('T')[0],
    validezDias: Number(quote?.validezDias) || 15,
    moneda: quote?.moneda || '$',
    porcentajeImprevistos: Number(quote?.porcentajeImprevistos) || 0,
    porcentajeGastosGenerales: Number(quote?.porcentajeGastosGenerales) || 0,
    porcentajeHonorarios: Number(quote?.porcentajeHonorarios) || 0,
    aplicaIva: Boolean(quote?.aplicaIva),
    porcentajeIva: Number(quote?.porcentajeIva) || 16,
    partidas: Array.isArray(quote?.partidas) ? quote.partidas : [],
    notas: quote?.notas || ''
  };

  // Cálculos financieros
  const partidasCalculadas = safeQuote.partidas.map(p => {
    const items = Array.isArray(p?.items) ? p.items : [];
    const subtotal = items.reduce((sum, item) => sum + (Number(item?.cantidad || 0) * Number(item?.precioUnitario || 0)), 0);
    return { ...p, items, subtotal };
  });

  const costoDirectoTotal = partidasCalculadas.reduce((sum, p) => sum + p.subtotal, 0);
  const montoImprevistos = costoDirectoTotal * (safeQuote.porcentajeImprevistos / 100);
  const montoGastosGenerales = costoDirectoTotal * (safeQuote.porcentajeGastosGenerales / 100);
  const subtotalOperativo = costoDirectoTotal + montoImprevistos + montoGastosGenerales;
  const montoHonorarios = subtotalOperativo * (safeQuote.porcentajeHonorarios / 100);
  const subtotalAntesIva = subtotalOperativo + montoHonorarios;
  const montoIva = safeQuote.aplicaIva ? subtotalAntesIva * (safeQuote.porcentajeIva / 100) : 0;
  const totalFinal = subtotalAntesIva + montoIva;

  const formatMoneda = (valor: number) => {
    return `${safeQuote.moneda} ${(valor || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // División modular y limpia en hojas A4 según partidas
  const buildPages = (): PageSection[] => {
    const totalItems = partidasCalculadas.reduce((acc, p) => acc + p.items.length, 0);
    
    // Si tiene 3 o menos partidas y pocos items, cabe todo en 1 hoja
    if (partidasCalculadas.length <= 3 && totalItems <= 6) {
      return [
        {
          pageNumber: 1,
          partidas: partidasCalculadas,
          showFullHeader: true,
          showClientBox: true,
          showTotalsAndTerms: true,
          showSignatures: true,
        }
      ];
    }

    // Estructura en 2 hojas (Hojas 1 a 4 en Página 1, Hoja 5+ en Página 2 con términos y firmas)
    if (partidasCalculadas.length <= 7) {
      return [
        {
          pageNumber: 1,
          partidas: partidasCalculadas.slice(0, 4),
          showFullHeader: true,
          showClientBox: true,
          showTotalsAndTerms: false,
          showSignatures: false,
        },
        {
          pageNumber: 2,
          partidas: partidasCalculadas.slice(4),
          showFullHeader: false,
          showClientBox: false,
          showTotalsAndTerms: true,
          showSignatures: true,
        }
      ];
    }

    // Estructura multihoja para más de 7 partidas
    const pages: PageSection[] = [];
    pages.push({
      pageNumber: 1,
      partidas: partidasCalculadas.slice(0, 4),
      showFullHeader: true,
      showClientBox: true,
      showTotalsAndTerms: false,
      showSignatures: false,
    });

    let remaining = partidasCalculadas.slice(4);
    let curPage = 2;
    while (remaining.length > 3) {
      pages.push({
        pageNumber: curPage,
        partidas: remaining.slice(0, 4),
        showFullHeader: false,
        showClientBox: false,
        showTotalsAndTerms: false,
        showSignatures: false,
      });
      remaining = remaining.slice(4);
      curPage++;
    }

    pages.push({
      pageNumber: curPage,
      partidas: remaining,
      showFullHeader: false,
      showClientBox: false,
      showTotalsAndTerms: true,
      showSignatures: true,
    });

    return pages;
  };

  const pages = buildPages();

  // Exportar PDF hoja por hoja garantizando que todas salgan completas y nítidas
  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const pageElements = printRef.current.querySelectorAll<HTMLElement>('[data-pdf-page="true"]');
      if (!pageElements || pageElements.length === 0) return;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF',
          windowWidth: 800,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeightMm, pdfHeight), undefined, 'FAST');
      }

      const cleanCode = (safeQuote.codigo || 'CNB').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Cotizacion_Conobras_${cleanCode}.pdf`;

      // Si está en Electron, usar diálogo nativo de guardar archivo
      if (window.electronAPI?.savePdfFile) {
        const base64Data = pdf.output('datauristring').split(',')[1];
        const savedPath = await window.electronAPI.savePdfFile({ filename, base64Data });
        if (savedPath) {
          alert(`PDF guardado exitosamente en: ${savedPath}`);
          return;
        }
      } else {
        // Descarga directa en navegador
        pdf.save(filename);
      }
    } catch (err) {
      console.error('Error al generar PDF:', err);
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
    const cleanPhone = (safeQuote.telefono || '').replace(/\D/g, '');
    const message =
      `*PROPUESTA ECONÓMICA DE OBRA - CONOBRAS*\n` +
      `*Folio:* ${safeQuote.codigo}\n` +
      `*Proyecto:* ${safeQuote.proyecto}\n` +
      `*Cliente:* ${safeQuote.cliente}\n` +
      `*Ubicación:* ${safeQuote.ubicacion}\n\n` +
      `*Inversión Total Estimada:* ${formatMoneda(totalFinal)}\n` +
      `*Vigencia:* ${safeQuote.validezDias} días a partir del ${safeQuote.fecha}.\n\n` +
      `_Emitido por: ${safeConfig.arquitecto} | Conobras Construcción + Arquitectura_\n` +
      `Quedamos a su disposición para coordinar la revisión del proyecto.`;

    const encoded = encodeURIComponent(message);
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
          }
          [data-pdf-page="true"], [data-pdf-page="true"] * {
            visibility: visible !important;
          }
          [data-pdf-page="true"] {
            position: relative !important;
            margin: 0 0 20mm 0 !important;
            box-shadow: none !important;
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>

      <div className="bg-white border border-[#C5CAD2] rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">

        {/* HEADER DE CONTROL SUPERIOR */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#C5CAD2] bg-[#EEF1F5] no-print shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#9E7A18] font-bold bg-[#D4AF37]/15 px-2.5 py-1 rounded border border-[#D4AF37]/40">
              {safeQuote.codigo}
            </span>
            <span className="text-sm font-semibold text-[#111622] truncate max-w-md">
              Vista Previa de Propuesta Institucional ({pages.length} {pages.length === 1 ? 'Página' : 'Páginas'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#128C7E] text-xs font-semibold transition-all cursor-pointer"
              title="Compartir resumen por WhatsApp"
            >
              <Send size={13} />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#E5E9EE] border border-[#C5CAD2] text-xs text-[#586274] hover:text-[#111622] shadow-sm transition-all cursor-pointer"
            >
              <Printer size={13} />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8820] text-black font-semibold text-xs shadow-md shadow-[#D4AF37]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              <Download size={14} />
              <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#586274] hover:text-[#111622] hover:bg-[#E2E6EC] rounded-lg ml-2 cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENEDOR TIPO VISOR DE HOJAS A4 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center gap-8" style={{ backgroundColor: '#C8CDD5' }}>
          <div ref={printRef} className="flex flex-col items-center gap-8 w-full">
            {pages.map((page) => (
              <div key={`page-wrapper-${page.pageNumber}`} className="flex flex-col items-center w-full">
                {/* Indicador de página en visor */}
                <div className="flex items-center gap-2 mb-2 no-print text-xs font-mono text-[#475569] font-medium">
                  <FileText size={12} className="text-[#9E7A18]" />
                  <span>Hoja {page.pageNumber} de {pages.length}</span>
                </div>

                {/* Hoja A4 Estricta */}
                <div
                  data-pdf-page="true"
                  className="w-full max-w-[800px] bg-white text-[#1A202C] shadow-2xl print:shadow-none"
                  style={{
                    width: '800px',
                    minHeight: '1130px',
                    boxSizing: 'border-box',
                    padding: '36px 44px',
                    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '4px',
                  }}
                >
                  {/* CONTENIDO PRINCIPAL DE LA HOJA */}
                  <div style={{ flex: 1 }}>

                    {/* ENCABEZADO: COMPLETO EN HOJA 1, COMPACTO EN HOJA 2+ */}
                    {page.showFullHeader ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1A202C', paddingBottom: '20px', marginBottom: '20px', backgroundColor: '#FFFFFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ height: '60px', width: '84px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src="./assets/conobras-logo.png"
                              alt="Conobras"
                              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#1A202C', textTransform: 'uppercase', margin: 0 }}>
                              CONOBRAS
                            </h1>
                            <p style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#718096', textTransform: 'uppercase', fontWeight: 600, margin: '2px 0 0 0' }}>
                              CONSTRUCCIÓN + ARQUITECTURA <span style={{ color: '#48BB78' }}>●</span>
                            </p>
                            <p style={{ fontSize: '11px', color: '#4A5568', margin: '3px 0 0 0' }}>
                              {safeConfig.direccion} • {safeConfig.telefono}
                            </p>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.12em', color: '#AA8820', display: 'block' }}>
                            PROPUESTA TÉCNICA Y ECONÓMICA
                          </span>
                          <span style={{ fontSize: '19px', fontFamily: 'monospace', fontWeight: 700, color: '#1A202C', display: 'block', marginTop: '2px' }}>
                            {safeQuote.codigo}
                          </span>
                          <div style={{ fontSize: '11px', color: '#718096', marginTop: '3px' }}>
                            <div>Fecha: <strong style={{ color: '#1A202C' }}>{safeQuote.fecha}</strong></div>
                            <div>Vigencia: <strong style={{ color: '#1A202C' }}>{safeQuote.validezDias} días</strong></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #D4AF37', paddingBottom: '10px', marginBottom: '18px', backgroundColor: '#FFFFFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A202C', borderRadius: '4px' }}>
                            <Building2 size={18} color="#D4AF37" />
                          </div>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1A202C', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                              CONOBRAS
                            </span>
                            <span style={{ fontSize: '9px', color: '#718096', marginLeft: '6px', fontWeight: 600 }}>
                              CONSTRUCCIÓN + ARQUITECTURA
                            </span>
                            <div style={{ fontSize: '10px', color: '#4A5568', marginTop: '1px' }}>
                              Continuación Propuesta Técnica y Económica • Folio: <strong style={{ color: '#1A202C' }}>{safeQuote.codigo}</strong>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '10px', color: '#718096' }}>
                          <div>Cliente: <strong style={{ color: '#1A202C' }}>{safeQuote.cliente}</strong></div>
                          <div>Fecha: <strong style={{ color: '#1A202C' }}>{safeQuote.fecha}</strong></div>
                        </div>
                      </div>
                    )}

                    {/* DATOS DEL CLIENTE Y PROYECTO (SOLO HOJA 1) */}
                    {page.showClientBox && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '14px', marginBottom: '18px', fontSize: '11px' }}>
                        <div>
                          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#718096', display: 'block', marginBottom: '3px' }}>
                            DATOS DEL CLIENTE
                          </span>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#1A202C' }}>{safeQuote.cliente}</div>
                          {safeQuote.telefono && <div style={{ color: '#4A5568', marginTop: '2px' }}>Tel: {safeQuote.telefono}</div>}
                          {safeQuote.email && <div style={{ color: '#4A5568' }}>{safeQuote.email}</div>}
                        </div>

                        <div>
                          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#718096', display: 'block', marginBottom: '3px' }}>
                            UBICACIÓN Y ALCANCE DE OBRA
                          </span>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#1A202C' }}>{safeQuote.proyecto}</div>
                          <div style={{ color: '#4A5568', marginTop: '2px' }}>{safeQuote.ubicacion}</div>
                        </div>
                      </div>
                    )}

                    {/* DESGLOSE DE PARTIDAS Y CONCEPTOS CON ALINEACIÓN ESTRICTA */}
                    <div style={{ marginBottom: '16px' }}>
                      {page.partidas.map((partida) => (
                        <div key={partida.id} style={{ border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px', backgroundColor: '#FFFFFF' }}>
                          {/* Barra de título de Partida */}
                          <div style={{ backgroundColor: '#F8FAFC', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 700, color: '#1A202C', borderBottom: '1px solid #E2E8F0' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37' }}></span>
                              {partida.titulo}
                            </span>
                            <span style={{ fontFamily: 'monospace', color: '#AA8820', fontWeight: 700 }}>{formatMoneda(partida.subtotal)}</span>
                          </div>

                          {/* Tabla con ancho fijo estricto para que todas las columnas coincidan 100% */}
                          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', backgroundColor: '#FFFFFF' }}>
                            <colgroup>
                              <col style={{ width: '36px' }} />
                              <col style={{ width: '330px' }} />
                              <col style={{ width: '60px' }} />
                              <col style={{ width: '54px' }} />
                              <col style={{ width: '105px' }} />
                              <col style={{ width: '115px' }} />
                            </colgroup>
                            <thead>
                              <tr style={{ color: '#718096', textTransform: 'uppercase', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', fontSize: '8.5px', letterSpacing: '0.08em' }}>
                                <th style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 600 }}>#</th>
                                <th style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 600 }}>Concepto de Obra</th>
                                <th style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 600 }}>Unidad</th>
                                <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600 }}>Cant.</th>
                                <th style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600 }}>P. Unitario</th>
                                <th style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600 }}>Importe</th>
                              </tr>
                            </thead>
                            <tbody>
                              {partida.items.map((item, idx) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #F0F4F8', backgroundColor: '#FFFFFF' }}>
                                  <td style={{ padding: '5px 4px', textAlign: 'center', color: '#A0AEC0', fontFamily: 'monospace', fontSize: '10.5px' }}>
                                    {idx + 1}
                                  </td>
                                  <td style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 500, color: '#2D3748', fontSize: '10.5px', wordBreak: 'break-word', lineHeight: '1.3' }}>
                                    {item.descripcion}
                                  </td>
                                  <td style={{ padding: '5px 4px', textAlign: 'center', color: '#718096', fontFamily: 'monospace', fontSize: '10.5px' }}>
                                    {item.unidad}
                                  </td>
                                  <td style={{ padding: '5px 6px', textAlign: 'right', fontFamily: 'monospace', color: '#1A202C', fontSize: '10.5px' }}>
                                    {item.cantidad}
                                  </td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#4A5568', fontSize: '10.5px', whiteSpace: 'nowrap' }}>
                                    {formatMoneda(item.precioUnitario)}
                                  </td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#1A202C', fontSize: '10.5px', whiteSpace: 'nowrap' }}>
                                    {formatMoneda(item.cantidad * item.precioUnitario)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>

                    {/* RESUMEN FINANCIERO Y TÉRMINOS (EN LA ÚLTIMA HOJA) */}
                    {page.showTotalsAndTerms && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', backgroundColor: '#FFFFFF' }}>
                        {/* Términos y Condiciones */}
                        <div style={{ fontSize: '11px', color: '#4A5568' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#718096', display: 'block', marginBottom: '6px' }}>
                            TÉRMINOS Y CONDICIONES
                          </span>
                          <p style={{ whiteSpace: 'pre-line', fontSize: '10px', lineHeight: '1.5', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', margin: 0 }}>
                            {safeQuote.notas || 'FORMA DE PAGO:\n• 40% de anticipo para formalizar la contratación y compra inicial de materiales.\n• 40% mediante acta de avance de obra parcial, al 50% de ejecución.\n• 20% saldo restante contra acta de entrega y satisfacción total.\n\nCONDICIONES TÉCNICAS Y EXCLUSIONES:\n• Tiempo estimado de ejecución: 45 días hábiles a partir del anticipo.\n• Los precios no incluyen permisos de curaduría ni trámites notariales.\n• Cualquier modificación sobre el diseño será de mutuo acuerdo.'}
                          </p>
                        </div>

                        {/* Liquidación de Costos */}
                        <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '11px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4A5568', marginBottom: '5px' }}>
                            <span>Subtotal Costo Directo:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatMoneda(costoDirectoTotal)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4A5568', marginBottom: '5px' }}>
                            <span>Imprevistos de Obra ({safeQuote.porcentajeImprevistos}%):</span>
                            <span style={{ fontFamily: 'monospace' }}>{formatMoneda(montoImprevistos)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4A5568', marginBottom: '5px' }}>
                            <span>Gastos Generales y Adm. ({safeQuote.porcentajeGastosGenerales}%):</span>
                            <span style={{ fontFamily: 'monospace' }}>{formatMoneda(montoGastosGenerales)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#AA8820', fontWeight: 600, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '5px 0', margin: '3px 0' }}>
                            <span>Honorarios de Diseño & Dirección ({safeQuote.porcentajeHonorarios}%):</span>
                            <span style={{ fontFamily: 'monospace' }}>{formatMoneda(montoHonorarios)}</span>
                          </div>
                          {safeQuote.aplicaIva && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4A5568', marginBottom: '5px' }}>
                              <span>I.V.A. ({safeQuote.porcentajeIva}%):</span>
                              <span style={{ fontFamily: 'monospace' }}>{formatMoneda(montoIva)}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '6px', borderTop: '2px solid #1A202C', marginTop: '4px' }}>
                            <div>
                              <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1A202C', fontSize: '11px', display: 'block' }}>
                                TOTAL PRESUPUESTO:
                              </span>
                              <span style={{ fontSize: '9px', color: '#718096' }}>Moneda nacional</span>
                            </div>
                            <span style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 800, color: '#1A202C' }}>
                              {formatMoneda(totalFinal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECCIÓN DE FIRMAS (EN LA ÚLTIMA HOJA) */}
                    {page.showSignatures && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '11px', color: '#4A5568', backgroundColor: '#FFFFFF', marginBottom: '16px' }}>
                        <div>
                          <div style={{ height: '44px', borderBottom: '1px solid #A0AEC0', marginBottom: '6px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '3px' }}>
                            <span style={{ fontSize: '9.5px', color: '#A0AEC0', fontStyle: 'italic' }}>Firma autorizada</span>
                          </div>
                          <div style={{ fontWeight: 700, color: '#1A202C' }}>{safeConfig.arquitecto}</div>
                          <div style={{ fontSize: '9.5px', color: '#718096' }}>
                            {safeConfig.cedulaProfesional ? `Cédula: ${safeConfig.cedulaProfesional}` : 'Arquitecto Titular'}
                          </div>
                          <div style={{ fontSize: '9.5px', color: '#AA8820', fontWeight: 600 }}>Conobras Construcción + Arquitectura</div>
                        </div>

                        <div>
                          <div style={{ height: '44px', borderBottom: '1px solid #A0AEC0', marginBottom: '6px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '3px' }}>
                            <span style={{ fontSize: '9.5px', color: '#A0AEC0', fontStyle: 'italic' }}>Aceptación de propuesta</span>
                          </div>
                          <div style={{ fontWeight: 700, color: '#1A202C' }}>{safeQuote.cliente}</div>
                          <div style={{ fontSize: '9.5px', color: '#718096' }}>Firma de Conformidad del Cliente</div>
                          <div style={{ fontSize: '9.5px', color: '#A0AEC0' }}>Fecha: ____ / ____ / ________</div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* PIE DE PÁGINA INSTITUCIONAL DE CADA HOJA */}
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#718096' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#1A202C' }}>CONOBRAS CONSTRUCCIÓN + ARQUITECTURA</span>
                      {safeConfig.direccion && <span> • {safeConfig.direccion}</span>}
                      {safeConfig.telefono && <span> • Tel: {safeConfig.telefono}</span>}
                    </div>
                    <div style={{ fontWeight: 600, color: '#AA8820' }}>
                      Página {page.pageNumber} de {pages.length}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
