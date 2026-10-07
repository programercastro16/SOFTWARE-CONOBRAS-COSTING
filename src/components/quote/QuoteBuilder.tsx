import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  Save, 
  MapPin, 
  User, 
  Calendar, 
  Layers, 
  Check, 
  Sparkles,
  BookOpen,
  DollarSign,
  Phone,
  Mail,
  Edit3
} from 'lucide-react';
import { 
  Cotizacion, 
  Partida, 
  ItemPartida, 
  Insumo, 
  InsumoCategoria, 
  ConfiguracionEmpresa,
  EstadoCotizacion
} from '../../types';
import { storageService } from '../../services/storageService';
import { TiltCard } from '../common/TiltCard';
import { InteractiveButton } from '../common/InteractiveButton';
import { AnimatedCounter } from '../common/AnimatedCounter';

// Componente numérico de alta precisión para evitar bloqueos al borrar o escribir decimales
interface NumericInputProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
}

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '0',
  min = 0
}) => {
  const [text, setText] = useState<string>(value !== undefined && value !== null ? String(value) : '');
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setText(value !== undefined && value !== null ? String(value) : '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Permitir dígitos, un punto decimal o vacío
    if (/^[0-9]*\.?[0-9]*$/.test(val) || val === '') {
      setText(val);
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        onChange(parsed);
      } else if (val === '') {
        onChange(0);
      }
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    const parsed = parseFloat(text);
    if (isNaN(parsed) || text.trim() === '') {
      setText('0');
      onChange(0);
    } else {
      setText(String(parsed));
      onChange(parsed);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onFocus={() => { isFocusedRef.current = true; }}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
};

interface QuoteBuilderProps {
  currentQuote: Cotizacion;
  config: ConfiguracionEmpresa;
  materials: Insumo[];
  onQuoteSaved: () => void;
  onOpenPdf: (quote: Cotizacion) => void;
  onUpdateCurrentQuote?: (quote: Cotizacion) => void;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  currentQuote,
  config,
  materials,
  onQuoteSaved,
  onOpenPdf,
  onUpdateCurrentQuote
}) => {
  const [quote, setQuote] = useState<Cotizacion>(currentQuote);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Selector rápido de insumos desde catálogo
  const [activeCatalogPicker, setActiveCatalogPicker] = useState<{
    partidaId: string;
    itemId: string;
  } | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Sincronizar SOLO cuando cambia el ID de la cotización externa (ej. al abrir otra del historial)
  useEffect(() => {
    if (currentQuote && currentQuote.id !== quote.id) {
      setQuote(currentQuote);
    }
  }, [currentQuote.id]);

  // Notificar al componente superior cuando cambie localmente
  const updateQuote = (newQuote: Cotizacion) => {
    setQuote(newQuote);
    if (onUpdateCurrentQuote) {
      onUpdateCurrentQuote(newQuote);
    }
  };

  // Cálculos matemáticos en tiempo real
  const calculos = useMemo(() => {
    const partidasCalculadas = quote.partidas.map(p => {
      const subtotal = p.items.reduce((sum, item) => sum + (Number(item.cantidad || 0) * Number(item.precioUnitario || 0)), 0);
      return { ...p, subtotal };
    });

    const costoDirectoTotal = partidasCalculadas.reduce((sum, p) => sum + p.subtotal, 0);
    const montoImprevistos = costoDirectoTotal * (Number(quote.porcentajeImprevistos || 0) / 100);
    const montoGastosGenerales = costoDirectoTotal * (Number(quote.porcentajeGastosGenerales || 0) / 100);
    const subtotalOperativo = costoDirectoTotal + montoImprevistos + montoGastosGenerales;
    const montoHonorarios = subtotalOperativo * (Number(quote.porcentajeHonorarios || 0) / 100);
    const subtotalAntesIva = subtotalOperativo + montoHonorarios;
    const montoIva = quote.aplicaIva ? subtotalAntesIva * (Number(quote.porcentajeIva || 0) / 100) : 0;
    const totalFinal = subtotalAntesIva + montoIva;

    return {
      partidasCalculadas,
      costoDirectoTotal,
      montoImprevistos,
      montoGastosGenerales,
      subtotalOperativo,
      montoHonorarios,
      subtotalAntesIva,
      montoIva,
      totalFinal
    };
  }, [quote]);

  // Guardar en la base de datos local SQLite
  const handleSave = async () => {
    await storageService.saveQuote(quote);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    onQuoteSaved();
  };

  // Manipulación de Partidas
  const handleAddPartida = () => {
    const newPartida: Partida = {
      id: `partida-${Date.now()}`,
      titulo: `${quote.partidas.length + 1}. PARTIDA DE OBRA`,
      items: []
    };
    updateQuote({ ...quote, partidas: [...quote.partidas, newPartida] });
  };

  const handleRemovePartida = (partidaId: string) => {
    updateQuote({
      ...quote,
      partidas: quote.partidas.filter(p => p.id !== partidaId)
    });
  };

  const handleUpdatePartidaTitulo = (partidaId: string, titulo: string) => {
    updateQuote({
      ...quote,
      partidas: quote.partidas.map(p => p.id === partidaId ? { ...p, titulo } : p)
    });
  };

  // Manipulación de Ítems
  const handleAddItem = (partidaId: string) => {
    const newItem: ItemPartida = {
      id: `item-${Date.now()}`,
      descripcion: '',
      categoria: 'MATERIAL',
      unidad: 'm2',
      cantidad: 1,
      precioUnitario: 0
    };
    updateQuote({
      ...quote,
      partidas: quote.partidas.map(p => {
        if (p.id === partidaId) {
          return { ...p, items: [...p.items, newItem] };
        }
        return p;
      })
    });
  };

  const handleUpdateItem = (partidaId: string, itemId: string, field: keyof ItemPartida, value: any) => {
    updateQuote({
      ...quote,
      partidas: quote.partidas.map(p => {
        if (p.id === partidaId) {
          return {
            ...p,
            items: p.items.map(item => {
              if (item.id === itemId) {
                return { ...item, [field]: value };
              }
              return item;
            })
          };
        }
        return p;
      })
    });
  };

  const handleRemoveItem = (partidaId: string, itemId: string) => {
    updateQuote({
      ...quote,
      partidas: quote.partidas.map(p => {
        if (p.id === partidaId) {
          return { ...p, items: p.items.filter(i => i.id !== itemId) };
        }
        return p;
      })
    });
  };

  // Selección de Insumo desde el catálogo preexistente
  const handleSelectFromCatalog = (insumo: Insumo) => {
    if (!activeCatalogPicker) return;
    const { partidaId, itemId } = activeCatalogPicker;

    updateQuote({
      ...quote,
      partidas: quote.partidas.map(p => {
        if (p.id === partidaId) {
          return {
            ...p,
            items: p.items.map(item => {
              if (item.id === itemId) {
                return {
                  ...item,
                  insumoId: insumo.id,
                  descripcion: insumo.descripcion,
                  categoria: insumo.categoria,
                  unidad: insumo.unidad,
                  precioUnitario: insumo.precioUnitario
                };
              }
              return item;
            })
          };
        }
        return p;
      })
    });

    setActiveCatalogPicker(null);
    setCatalogSearch('');
  };

  const filteredCatalog = materials.filter(m => 
    m.descripcion.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    m.codigo.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const formatMoneda = (valor: number) => {
    return `${quote.moneda} ${valor.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      
      {/* BARRA SUPERIOR: BRANDING, ESTADO Y ACCIONES PRINCIPALES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#12161F] border border-[#252D3D] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-24 rounded-xl bg-[#0E121A] border border-[#D4AF37]/50 p-2 flex items-center justify-center shadow-lg shadow-black/60 shrink-0">
            <img 
              src="./assets/conobras-logo.png" 
              alt="Conobras" 
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.45)]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Presupuesto y Cómputo Métrico
              </h2>
              <select
                value={quote.estado}
                onChange={(e) => updateQuote({ ...quote, estado: e.target.value as EstadoCotizacion })}
                className="bg-[#1A202C] text-[11px] font-mono font-bold text-[#D4AF37] border border-[#D4AF37]/40 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                <option value="BORRADOR">BORRADOR</option>
                <option value="PRESENTADA">PRESENTADA</option>
                <option value="APROBADA">APROBADA</option>
                <option value="RECHAZADA">RECHAZADA</option>
              </select>
            </div>
            <p className="text-xs text-[#8A94A6]">
              Haz clic en cualquier campo para editar textos, conceptos y precios unitarios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-[#48BB78] bg-[#48BB78]/10 px-3 py-1.5 rounded-lg border border-[#48BB78]/30 animate-in fade-in">
              <Check size={14} />
              <span>Guardado en SQLite</span>
            </div>
          )}

          <InteractiveButton
            variant="glass"
            size="md"
            onClick={handleSave}
            icon={<Save size={15} className="text-[#D4AF37]" />}
          >
            Guardar Local
          </InteractiveButton>

          <InteractiveButton
            variant="gold"
            size="md"
            shimmer={true}
            glow={true}
            onClick={() => onOpenPdf(quote)}
            icon={<Download size={15} />}
          >
            Propuesta Institucional / PDF
          </InteractiveButton>
        </div>
      </div>

      {/* METADATOS DEL PROYECTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Proyecto & Ubicación */}
        <div className="h-full p-5 rounded-2xl bg-[#12161F] border border-[#252D3D] space-y-3 hover:border-[#D4AF37]/40 transition-colors shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
            <Building2 size={14} />
            <span>Obra & Ubicación</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Nombre del Proyecto</label>
              <input 
                type="text" 
                value={quote.proyecto || ''} 
                onChange={(e) => updateQuote({ ...quote, proyecto: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 transition-all select-text"
                placeholder="Ej. Casa Habitación Santa Fe"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Ubicación de Obra</label>
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-2.5 text-[#8A94A6] pointer-events-none" />
                <input 
                  type="text" 
                  value={quote.ubicacion || ''} 
                  onChange={(e) => updateQuote({ ...quote, ubicacion: e.target.value })}
                  className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 transition-all select-text"
                  placeholder="Dirección, lote o municipio"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cliente & Contacto */}
        <div className="h-full p-5 rounded-2xl bg-[#12161F] border border-[#252D3D] space-y-3 hover:border-[#D4AF37]/40 transition-colors shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
            <User size={14} />
            <span>Cliente</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Cliente / Propietario</label>
              <input 
                type="text" 
                value={quote.cliente || ''} 
                onChange={(e) => updateQuote({ ...quote, cliente: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 transition-all select-text"
                placeholder="Nombre del cliente o empresa"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#8A94A6] block mb-1">Teléfono / WhatsApp</label>
                <input 
                  type="text" 
                  value={quote.telefono || ''} 
                  onChange={(e) => updateQuote({ ...quote, telefono: e.target.value })}
                  className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 transition-all select-text"
                  placeholder="+52 ..."
                />
              </div>
              <div>
                <label className="text-[11px] text-[#8A94A6] block mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={quote.email || ''} 
                  onChange={(e) => updateQuote({ ...quote, email: e.target.value })}
                  className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 transition-all select-text"
                  placeholder="cliente@correo.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emisión y Moneda */}
        <div className="h-full p-5 rounded-2xl bg-[#12161F] border border-[#252D3D] space-y-3 hover:border-[#D4AF37]/40 transition-colors shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
            <Calendar size={14} />
            <span>Condiciones de Emisión</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Folio Cotización</label>
              <input 
                type="text" 
                value={quote.codigo || ''} 
                onChange={(e) => updateQuote({ ...quote, codigo: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs font-mono text-[#D4AF37] font-bold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 select-text"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Fecha Emisión</label>
              <input 
                type="date" 
                value={quote.fecha || ''} 
                onChange={(e) => updateQuote({ ...quote, fecha: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 select-text"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Vigencia (Días)</label>
              <NumericInput 
                value={quote.validezDias}
                onChange={(val) => updateQuote({ ...quote, validezDias: val })}
                className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 select-text"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Moneda</label>
              <select 
                value={quote.moneda}
                onChange={(e) => updateQuote({ ...quote, moneda: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40"
              >
                <option value="$">$ (Pesos / Dólares)</option>
                <option value="USD $">USD $</option>
                <option value="€">EUR €</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* PARTIDAS DE OBRA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#D4AF37]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Partidas y Desglose de Costo Directo
            </h3>
          </div>
          <InteractiveButton
            variant="glass"
            size="sm"
            onClick={handleAddPartida}
            icon={<Plus size={14} className="text-[#D4AF37]" />}
          >
            Añadir Partida
          </InteractiveButton>
        </div>

        {calculos.partidasCalculadas.length === 0 ? (
          <div className="p-10 rounded-xl bg-[#12161F] border border-dashed border-[#252D3D] text-center flex flex-col items-center justify-center space-y-4 shadow-inner">
            <div className="h-14 w-14 rounded-full bg-[#1A202C] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Layers size={24} />
            </div>
            <div className="max-w-md">
              <h4 className="text-sm font-semibold text-white mb-1">Cotización lista para comenzar</h4>
              <p className="text-xs text-[#8A94A6] leading-relaxed">
                No hay partidas registradas en este presupuesto. Agrega tu primera partida para comenzar a desglosar conceptos y cómputos métricos a tu gusto.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddPartida}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8820] hover:from-[#E6C65A] hover:to-[#D4AF37] text-black font-semibold text-xs shadow-lg shadow-[#D4AF37]/20 transition-all active:scale-95"
              >
                <Plus size={15} />
                <span>Añadir Primera Partida</span>
              </button>
            </div>
          </div>
        ) : (
          calculos.partidasCalculadas.map((partida) => (
          <div 
            key={partida.id} 
            className="rounded-xl bg-[#12161F] border border-[#252D3D] overflow-hidden shadow-xl"
          >
            {/* Header de Partida */}
            <div className="flex items-center justify-between bg-[#161C27] px-5 py-3 border-b border-[#252D3D]">
              <div className="flex-1 mr-4">
                <input 
                  type="text" 
                  value={partida.titulo} 
                  placeholder="Título de la partida (ej. 1. TRABAJOS PRELIMINARES)"
                  onChange={(e) => handleUpdatePartidaTitulo(partida.id, e.target.value)}
                  className="w-full bg-transparent font-bold text-xs uppercase tracking-wider text-[#F3F5F8] placeholder-[#8A94A6]/50 focus:outline-none focus:bg-[#1A202C] px-2 py-1 rounded transition-colors"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block">Subtotal Partida</span>
                  <span className="text-xs font-mono font-bold text-[#D4AF37]">
                    {formatMoneda(partida.subtotal)}
                  </span>
                </div>
                <button 
                  onClick={() => handleRemovePartida(partida.id)}
                  className="p-1 text-[#8A94A6] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Eliminar Partida"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Tabla de Conceptos */}
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#8A94A6] uppercase border-b border-[#252D3D]/60 pb-2">
                    <th className="pb-2 w-8 font-mono">#</th>
                    <th className="pb-2">Concepto / Insumo</th>
                    <th className="pb-2 w-32">Tipo</th>
                    <th className="pb-2 w-20 text-center">Unidad</th>
                    <th className="pb-2 w-24 text-right">Cantidad</th>
                    <th className="pb-2 w-28 text-right">P. Unitario</th>
                    <th className="pb-2 w-32 text-right">Importe</th>
                    <th className="pb-2 w-16 text-center">Catálogo</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252D3D]/40">
                  {partida.items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-7 text-center text-[#8A94A6]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-xs">Esta partida no tiene conceptos aún.</span>
                            <button
                              type="button"
                              onClick={() => handleAddItem(partida.id)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1A202C] hover:bg-[#252D3D] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-medium transition-all"
                            >
                              <Plus size={13} />
                              <span>Agregar Concepto</span>
                            </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    partida.items.map((item, itemIdx) => {
                    const importe = Number(item.cantidad || 0) * Number(item.precioUnitario || 0);
                    return (
                      <tr key={item.id} className="hover:bg-[#1A202C]/40 transition-colors">
                        <td className="py-2.5 text-[#8A94A6] font-mono text-[11px]">{itemIdx + 1}</td>
                        <td className="py-2.5 pr-2">
                          <input 
                            type="text" 
                            value={item.descripcion}
                            onChange={(e) => handleUpdateItem(partida.id, item.id, 'descripcion', e.target.value)}
                            placeholder="Descripción del concepto de obra..."
                            className="w-full bg-[#161C27] hover:bg-[#1A202C] focus:bg-[#1A202C] text-[#F3F5F8] border border-transparent focus:border-[#D4AF37]/60 focus:outline-none px-2.5 py-1.5 rounded text-xs transition-colors"
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <select 
                            value={item.categoria}
                            onChange={(e) => handleUpdateItem(partida.id, item.id, 'categoria', e.target.value as InsumoCategoria)}
                            className="w-full bg-[#1A202C] border border-[#252D3D] text-[11px] rounded px-2 py-1.5 text-[#8A94A6] focus:outline-none focus:border-[#D4AF37]"
                          >
                            <option value="MATERIAL">Material</option>
                            <option value="MANO_DE_OBRA">Mano de Obra</option>
                            <option value="EQUIPO">Equipo</option>
                            <option value="SUBCONTRATO">Subcontrato</option>
                          </select>
                        </td>
                        <td className="py-2.5 pr-2 text-center">
                          <input 
                            type="text" 
                            value={item.unidad}
                            onChange={(e) => handleUpdateItem(partida.id, item.id, 'unidad', e.target.value)}
                            className="w-14 bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded px-2 py-1.5 text-center font-mono text-[11px] text-white focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 pr-2 text-right">
                          <NumericInput 
                            value={item.cantidad}
                            onChange={(val) => handleUpdateItem(partida.id, item.id, 'cantidad', val)}
                            className="w-20 bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded px-2 py-1.5 text-right font-mono text-[11px] text-white focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 pr-2 text-right">
                          <NumericInput 
                            value={item.precioUnitario}
                            onChange={(val) => handleUpdateItem(partida.id, item.id, 'precioUnitario', val)}
                            className="w-24 bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded px-2 py-1.5 text-right font-mono text-[11px] text-[#D4AF37] font-semibold focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 text-right font-mono font-medium text-white text-[11px]">
                          {formatMoneda(importe)}
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setActiveCatalogPicker({ partidaId: partida.id, itemId: item.id })}
                            title="Seleccionar insumo desde el catálogo preexistente"
                            className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/15 rounded transition-colors"
                          >
                            <BookOpen size={14} />
                          </button>
                        </td>
                        <td className="py-2.5 text-center">
                          <button 
                            onClick={() => handleRemoveItem(partida.id, item.id)}
                            className="p-1.5 text-[#8A94A6] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>

              <div className="mt-3 pt-3 border-t border-[#252D3D]/50 flex justify-between items-center">
                <button 
                  onClick={() => handleAddItem(partida.id)}
                  className="flex items-center gap-1.5 text-xs text-[#8A94A6] hover:text-[#D4AF37] transition-colors py-1 px-2 rounded hover:bg-[#1A202C]"
                >
                  <Plus size={13} />
                  <span>Agregar Concepto</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
      </div>

      {/* LIQUIDACIÓN DE COSTOS, INDIRECTOS Y HONORARIOS CON PERSPECTIVA 3D */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Términos de pago y condiciones */}
        <div className="lg:col-span-6 h-full">
          <TiltCard maxTilt={5} className="h-full">
            <div className="h-full p-6 rounded-2xl bg-[#12161F] border border-[#252D3D] flex flex-col justify-between shadow-xl hover:border-[#D4AF37]/30 transition-colors">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">
                  <FileText size={14} />
                  <span>Condiciones Comerciales & Esquema de Pago</span>
                </div>
                <textarea 
                  rows={6}
                  value={quote.notas}
                  onChange={(e) => updateQuote({ ...quote, notas: e.target.value })}
                  className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-xl p-3 text-xs text-[#F3F5F8] focus:outline-none resize-none leading-relaxed transition-all"
                  placeholder="Especifica anticipos, estimaciones por avance de obra, exclusiones o condiciones técnicas..."
                />
              </div>
              <div className="mt-4 p-3 rounded-xl bg-[#0A0D12] border border-[#252D3D] flex items-center gap-3">
                <Sparkles size={16} className="text-[#D4AF37] shrink-0" />
                <p className="text-[11px] text-[#8A94A6]">
                  Todos los cálculos se actualizan automáticamente en tiempo real con precisión decimal arquitectónica.
                </p>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Liquidación Matemática */}
        <div className="lg:col-span-6 h-full">
          <TiltCard maxTilt={5} className="h-full">
            <div className="h-full p-6 rounded-2xl bg-[#12161F] border border-[#D4AF37]/30 shadow-2xl space-y-4 hover:border-[#D4AF37]/60 transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center justify-between border-b border-[#252D3D] pb-3">
                <span>Liquidación del Presupuesto de Obra</span>
                <span className="font-mono text-[10px] text-[#8A94A6]">ARQUITECTURA DE COSTOS</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Costo Directo */}
                <div className="flex justify-between items-center text-[#8A94A6]">
                  <span>Costo Directo Total (Mano de Obra + Materiales + Equipos)</span>
                  <AnimatedCounter 
                    value={calculos.costoDirectoTotal} 
                    prefix={`${quote.moneda} `} 
                    className="font-mono font-medium text-white" 
                  />
                </div>

                {/* Imprevistos */}
                <div className="flex justify-between items-center text-[#8A94A6]">
                  <div className="flex items-center gap-2">
                    <span>Imprevistos / Contingencias</span>
                    <div className="flex items-center bg-[#1A202C] border border-[#252D3D] focus-within:border-[#D4AF37] rounded-lg px-2 py-0.5">
                      <NumericInput 
                        value={quote.porcentajeImprevistos}
                        onChange={(val) => updateQuote({ ...quote, porcentajeImprevistos: val })}
                        className="w-12 bg-transparent text-right font-mono text-[11px] text-white focus:outline-none"
                      />
                      <span className="text-[10px] text-[#8A94A6] ml-1">%</span>
                    </div>
                  </div>
                  <AnimatedCounter 
                    value={calculos.montoImprevistos} 
                    prefix={`${quote.moneda} `} 
                    className="font-mono text-white/90" 
                  />
                </div>

                {/* Gastos Generales */}
                <div className="flex justify-between items-center text-[#8A94A6]">
                  <div className="flex items-center gap-2">
                    <span>Gastos Generales & Administración</span>
                    <div className="flex items-center bg-[#1A202C] border border-[#252D3D] focus-within:border-[#D4AF37] rounded-lg px-2 py-0.5">
                      <NumericInput 
                        value={quote.porcentajeGastosGenerales}
                        onChange={(val) => updateQuote({ ...quote, porcentajeGastosGenerales: val })}
                        className="w-12 bg-transparent text-right font-mono text-[11px] text-white focus:outline-none"
                      />
                      <span className="text-[10px] text-[#8A94A6] ml-1">%</span>
                    </div>
                  </div>
                  <AnimatedCounter 
                    value={calculos.montoGastosGenerales} 
                    prefix={`${quote.moneda} `} 
                    className="font-mono text-white/90" 
                  />
                </div>

                {/* Honorarios de Arquitectura */}
                <div className="flex justify-between items-center text-[#D4AF37] bg-[#D4AF37]/10 p-2.5 rounded-xl border border-[#D4AF37]/30">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Honorarios de Diseño & Dirección (Utilidad)</span>
                    <div className="flex items-center bg-[#1A202C] border border-[#D4AF37]/40 focus-within:border-[#D4AF37] rounded-lg px-2 py-0.5">
                      <NumericInput 
                        value={quote.porcentajeHonorarios}
                        onChange={(val) => updateQuote({ ...quote, porcentajeHonorarios: val })}
                        className="w-12 bg-transparent text-right font-mono text-[11px] text-[#D4AF37] focus:outline-none font-bold"
                      />
                      <span className="text-[10px] text-[#D4AF37] ml-1">%</span>
                    </div>
                  </div>
                  <AnimatedCounter 
                    value={calculos.montoHonorarios} 
                    prefix={`${quote.moneda} `} 
                    className="font-mono font-bold text-sm text-[#D4AF37]" 
                  />
                </div>

                {/* IVA */}
                <div className="flex justify-between items-center text-[#8A94A6] pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={quote.aplicaIva}
                      onChange={(e) => updateQuote({ ...quote, aplicaIva: e.target.checked })}
                      className="accent-[#D4AF37] rounded cursor-pointer"
                    />
                    <span>Aplicar Impuesto al Valor Agregado (IVA {quote.porcentajeIva}%)</span>
                  </label>
                  <AnimatedCounter 
                    value={calculos.montoIva} 
                    prefix={`${quote.moneda} `} 
                    className="font-mono text-white/90" 
                  />
                </div>

                {/* Inversión Total */}
                <div className="pt-4 border-t-2 border-[#252D3D] flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#8A94A6] block">
                      Inversión Total de la Obra
                    </span>
                    <span className="text-[10px] text-[#D4AF37] font-medium">Presupuesto Integral Conobras</span>
                  </div>
                  <AnimatedCounter 
                    value={calculos.totalFinal} 
                    prefix={`${quote.moneda} `} 
                    className="text-3xl font-mono font-bold bg-gradient-to-r from-white via-[#FFF2B2] to-[#D4AF37] bg-clip-text text-transparent animate-gradient-text" 
                  />
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>

      {/* MODAL PICKER DE INSUMOS DESDE CATÁLOGO */}
      {activeCatalogPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#252D3D] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-[#252D3D] bg-[#161C27] flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-[#D4AF37]" />
                <span>Seleccionar Insumo del Catálogo</span>
              </h4>
              <button 
                onClick={() => setActiveCatalogPicker(null)}
                className="text-[#8A94A6] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-[#252D3D]">
              <input 
                type="text"
                placeholder="Filtrar por nombre (ej. concreto, varilla, cuadrilla)..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                autoFocus
                className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white placeholder-[#8A94A6] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#252D3D]/50 p-2">
              {filteredCatalog.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8A94A6]">
                  No se encontraron insumos.
                </div>
              ) : (
                filteredCatalog.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFromCatalog(item)}
                    className="p-3 hover:bg-[#1A202C] rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{item.descripcion}</div>
                      <div className="text-[10px] text-[#8A94A6] font-mono mt-0.5">
                        {item.codigo} • {item.categoria} • Unidad: {item.unidad}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-[#D4AF37] text-right">
                      $ {item.precioUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
