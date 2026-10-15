import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Eye, 
  Copy, 
  Trash2, 
  Calendar, 
  User, 
  MapPin, 
  FileText, 
  DollarSign,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  FolderCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { Cotizacion, EstadoCotizacion } from '../../types';
import { storageService } from '../../services/storageService';
import { TiltCard } from '../common/TiltCard';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { ShimmerBadge } from '../common/AnimatedText';

interface QuoteHistoryProps {
  quotes: Cotizacion[];
  onSelectQuote: (quote: Cotizacion) => void;
  onPreviewPdf: (quote: Cotizacion) => void;
  onRefresh: () => void;
}

export const QuoteHistory: React.FC<QuoteHistoryProps> = ({
  quotes,
  onSelectQuote,
  onPreviewPdf,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  const calculateTotal = (quote: Cotizacion) => {
    const partidas = Array.isArray(quote?.partidas) ? quote.partidas : [];
    const costoDirecto = partidas.reduce((sumP, p) => {
      const items = Array.isArray(p?.items) ? p.items : [];
      return sumP + items.reduce((sumI, i) => sumI + (Number(i?.cantidad || 0) * Number(i?.precioUnitario || 0)), 0);
    }, 0);

    const imprevistos = costoDirecto * (Number(quote?.porcentajeImprevistos || 0) / 100);
    const gastosGrales = costoDirecto * (Number(quote?.porcentajeGastosGenerales || 0) / 100);
    const subtotalOp = costoDirecto + imprevistos + gastosGrales;
    const honorarios = subtotalOp * (Number(quote?.porcentajeHonorarios || 0) / 100);
    const subtotalSinIva = subtotalOp + honorarios;
    const iva = quote?.aplicaIva ? subtotalSinIva * (Number(quote?.porcentajeIva || 0) / 100) : 0;
    return subtotalSinIva + iva;
  };

  // Estadísticas KPI acumuladas
  const stats = useMemo(() => {
    let totalMonto = 0;
    let aprobadas = 0;
    let presentadas = 0;

    (quotes || []).forEach(q => {
      totalMonto += calculateTotal(q);
      if (q.estado === 'APROBADA') aprobadas++;
      if (q.estado === 'PRESENTADA') presentadas++;
    });

    return { totalMonto, aprobadas, presentadas, totalQuotes: (quotes || []).length };
  }, [quotes]);

  const filteredQuotes = (quotes || []).filter(q => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (q.codigo || '').toLowerCase().includes(term) ||
                          (q.proyecto || '').toLowerCase().includes(term) ||
                          (q.cliente || '').toLowerCase().includes(term) ||
                          (q.ubicacion || '').toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'TODOS' || q.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = async (quote: Cotizacion) => {
    const duplicated: Cotizacion = {
      ...quote,
      id: `cot-${Date.now()}`,
      codigo: `${quote.codigo}-COPIA`,
      proyecto: `${quote.proyecto} (Copia)`,
      estado: 'BORRADOR',
      fecha: new Date().toISOString().split('T')[0],
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };
    await storageService.saveQuote(duplicated);
    onRefresh();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar permanentemente esta cotización de la base de datos local?')) {
      await storageService.deleteQuote(id);
      onRefresh();
    }
  };

  const getStatusBadge = (estado: EstadoCotizacion) => {
    switch (estado) {
      case 'BORRADOR':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-300 font-semibold">Borrador</span>;
      case 'PRESENTADA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-300 font-semibold">Presentada</span>;
      case 'APROBADA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">Aprobada</span>;
      case 'RECHAZADA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-red-50 text-red-700 border border-red-300 font-semibold">Rechazada</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE HISTORIAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#C5CAD2] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <History className="text-[#9E7A18]" size={22} />
            <h2 className="text-lg font-bold text-[#111622] tracking-wide uppercase">
              Historial de Presupuestos & Obras
            </h2>
          </div>
          <p className="text-xs text-[#586274] mt-0.5">
            Registro local de propuestas económicas, presupuestos emitidos y análisis de costos <span className="font-brand font-bold lowercase text-xs">conobras</span>
          </p>
        </div>

        <ShimmerBadge variant="gold" icon={<Building2 size={13} />}>
          {quotes.length} {quotes.length === 1 ? 'Obra Registrada' : 'Obras Registradas'}
        </ShimmerBadge>
      </div>

      {/* TARJETAS DE MÉTRICAS KPI ACUMULADAS CON 3D TILT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Cartera */}
        <TiltCard maxTilt={5}>
          <div className="p-5 rounded-2xl bg-white border border-[#C5CAD2] hover:border-[#D4AF37]/50 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-[#586274] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Cartera Presupuestada</span>
              <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#9E7A18]">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#111622]">
              <AnimatedCounter 
                value={stats.totalMonto} 
                prefix="$ " 
                className="bg-gradient-to-r from-[#111622] to-[#9E7A18] bg-clip-text text-transparent"
              />
            </div>
            <div className="text-[10px] font-mono text-[#8E99A8] mt-1">
              Suma de todas las cotizaciones emitidas
            </div>
          </div>
        </TiltCard>

        {/* Obras Aprobadas */}
        <TiltCard maxTilt={5}>
          <div className="p-5 rounded-2xl bg-white border border-[#C5CAD2] hover:border-[#16A34A]/50 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-[#586274] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Obras Aprobadas</span>
              <div className="p-1.5 rounded-lg bg-[#16A34A]/15 text-[#15803D]">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#15803D]">
              <AnimatedCounter value={stats.aprobadas} decimals={0} />
            </div>
            <div className="text-[10px] font-mono text-[#8E99A8] mt-1">
              Presupuestos listos para ejecución de obra
            </div>
          </div>
        </TiltCard>

        {/* Total Cotizaciones Activas */}
        <TiltCard maxTilt={5}>
          <div className="p-5 rounded-2xl bg-white border border-[#C5CAD2] hover:border-[#0284C7]/50 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-[#586274] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Propuestas Presentadas</span>
              <div className="p-1.5 rounded-lg bg-[#0284C7]/15 text-[#0369A1]">
                <FolderCheck size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0369A1]">
              <AnimatedCounter value={stats.presentadas} decimals={0} />
            </div>
            <div className="text-[10px] font-mono text-[#8E99A8] mt-1">
              En revisión o negociación con cliente
            </div>
          </div>
        </TiltCard>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-[#8E99A8]" />
          <input
            type="text"
            placeholder="Buscar por folio, cliente, nombre de obra o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#C8CDD5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#111622] placeholder-[#8E99A8] focus:outline-none focus:border-[#D4AF37] transition-colors shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['TODOS', 'BORRADOR', 'PRESENTADA', 'APROBADA'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-colors border cursor-pointer ${
                filterStatus === st
                  ? 'bg-white text-[#9E7A18] border-[#D4AF37] font-bold shadow-sm'
                  : 'bg-white/80 text-[#586274] border-[#C5CAD2] hover:text-[#111622] hover:bg-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE COTIZACIONES CON ENTRADA ANIMADA Y 3D TILT */}
      {filteredQuotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#C5CAD2] text-[#586274] shadow-sm">
          No se encontraron cotizaciones con el criterio de búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map((quote, idx) => {
            const total = calculateTotal(quote);
            const totalPartidas = quote.partidas.length;
            const totalItems = quote.partidas.reduce((acc, p) => acc + p.items.length, 0);

            return (
              <div 
                key={quote.id} 
                className={`animate-fade-in-up stagger-${Math.min(idx + 1, 5)}`}
              >
                <TiltCard maxTilt={5} className="h-full">
                  <div
                    onClick={() => onSelectQuote(quote)}
                    className="h-full group p-5 rounded-2xl bg-white border border-[#C5CAD2] hover:border-[#D4AF37]/60 transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Top: Folio y Estado */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold text-[#9E7A18] bg-[#F5F6F9] px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
                          {quote.codigo}
                        </span>
                        {getStatusBadge(quote.estado)}
                      </div>

                      {/* Nombre de Obra */}
                      <h3 className="text-sm font-bold text-[#111622] group-hover:text-[#9E7A18] transition-colors line-clamp-2 mb-2">
                        {quote.proyecto || 'Obra Sin Nombre'}
                      </h3>

                      {/* Cliente y Ubicación */}
                      <div className="space-y-1.5 text-xs text-[#586274] mb-4">
                        <div className="flex items-center gap-2 truncate">
                          <User size={13} className="text-[#8E99A8] shrink-0" />
                          <span className="truncate">{quote.cliente || 'Sin cliente asignado'}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <MapPin size={13} className="text-[#8E99A8] shrink-0" />
                          <span className="truncate">{quote.ubicacion || 'Ubicación no especificada'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-[#8E99A8] shrink-0" />
                          <span>{quote.fecha}</span>
                          <span>•</span>
                          <span>{totalPartidas} partidas ({totalItems} conceptos)</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Total Financiero y Acciones */}
                    <div className="pt-3 border-t border-[#E2E6EB] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8E99A8] uppercase tracking-wider block font-semibold">Presupuesto</span>
                        <div className="text-base font-mono font-bold text-[#111622] group-hover:text-[#9E7A18] transition-colors">
                          <AnimatedCounter 
                            value={total} 
                            prefix={`${quote.moneda} `}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 relative z-30" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectQuote(quote);
                          }}
                          title="Editar en Cotizador"
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/35 text-[#9E7A18] border border-[#D4AF37]/50 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onPreviewPdf(quote);
                          }}
                          title="Ver Propuesta PDF"
                          className="p-1.5 text-[#586274] hover:text-[#9E7A18] hover:bg-[#EEF1F5] rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDuplicate(quote);
                          }}
                          title="Duplicar Cotización"
                          className="p-1.5 text-[#586274] hover:text-[#111622] hover:bg-[#EEF1F5] rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(quote.id, e)}
                          title="Eliminar de base de datos"
                          className="p-1.5 text-[#586274] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
