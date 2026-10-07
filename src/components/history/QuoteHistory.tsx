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
    const costoDirecto = quote.partidas.reduce((sumP, p) => {
      return sumP + p.items.reduce((sumI, i) => sumI + (i.cantidad * i.precioUnitario), 0);
    }, 0);

    const imprevistos = costoDirecto * (quote.porcentajeImprevistos / 100);
    const gastosGrales = costoDirecto * (quote.porcentajeGastosGenerales / 100);
    const subtotalOp = costoDirecto + imprevistos + gastosGrales;
    const honorarios = subtotalOp * (quote.porcentajeHonorarios / 100);
    const subtotalSinIva = subtotalOp + honorarios;
    const iva = quote.aplicaIva ? subtotalSinIva * (quote.porcentajeIva / 100) : 0;
    return subtotalSinIva + iva;
  };

  // Estadísticas KPI acumuladas
  const stats = useMemo(() => {
    let totalMonto = 0;
    let aprobadas = 0;
    let presentadas = 0;

    quotes.forEach(q => {
      totalMonto += calculateTotal(q);
      if (q.estado === 'APROBADA') aprobadas++;
      if (q.estado === 'PRESENTADA') presentadas++;
    });

    return { totalMonto, aprobadas, presentadas, totalQuotes: quotes.length };
  }, [quotes]);

  const filteredQuotes = quotes.filter(q => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = q.codigo.toLowerCase().includes(term) ||
                          q.proyecto.toLowerCase().includes(term) ||
                          q.cliente.toLowerCase().includes(term) ||
                          q.ubicacion.toLowerCase().includes(term);
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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">Borrador</span>;
      case 'PRESENTADA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">Presentada</span>;
      case 'APROBADA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#48BB78]/15 text-[#48BB78] border border-[#48BB78]/30">Aprobada</span>;
      case 'RECHAZADA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-red-500/15 text-red-400 border border-red-500/30">Rechazada</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE HISTORIAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12161F] border border-[#252D3D] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <History className="text-[#D4AF37]" size={22} />
            <h2 className="text-lg font-bold text-white tracking-wide uppercase">
              Historial de Presupuestos & Obras
            </h2>
          </div>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            Registro local de propuestas económicas, presupuestos emitidos y análisis de costos Conobras
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
          <div className="p-5 rounded-2xl bg-[#12161F] border border-[#252D3D] hover:border-[#D4AF37]/40 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-[#8A94A6] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Cartera Presupuestada</span>
              <div className="p-1.5 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter 
                value={stats.totalMonto} 
                prefix="$ " 
                className="bg-gradient-to-r from-white to-[#D4AF37] bg-clip-text text-transparent"
              />
            </div>
            <div className="text-[10px] font-mono text-[#8A94A6] mt-1">
              Suma de todas las cotizaciones emitidas
            </div>
          </div>
        </TiltCard>

        {/* Obras Aprobadas */}
        <TiltCard maxTilt={5}>
          <div className="p-5 rounded-2xl bg-[#12161F] border border-[#252D3D] hover:border-[#48BB78]/40 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-[#8A94A6] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Obras Aprobadas</span>
              <div className="p-1.5 rounded-lg bg-[#48BB78]/15 text-[#48BB78]">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#48BB78]">
              <AnimatedCounter value={stats.aprobadas} decimals={0} />
            </div>
            <div className="text-[10px] font-mono text-[#8A94A6] mt-1">
              Presupuestos listos para ejecución de obra
            </div>
          </div>
        </TiltCard>

        {/* Total Cotizaciones Activas */}
        <TiltCard maxTilt={5}>
          <div className="p-5 rounded-2xl bg-[#12161F] border border-[#252D3D] hover:border-[#38BDF8]/40 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-[#8A94A6] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Propuestas Presentadas</span>
              <div className="p-1.5 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8]">
                <FolderCheck size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#38BDF8]">
              <AnimatedCounter value={stats.presentadas} decimals={0} />
            </div>
            <div className="text-[10px] font-mono text-[#8A94A6] mt-1">
              En revisión o negociación con cliente
            </div>
          </div>
        </TiltCard>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-[#8A94A6]" />
          <input
            type="text"
            placeholder="Buscar por folio, cliente, nombre de obra o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#12161F] border border-[#252D3D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['TODOS', 'BORRADOR', 'PRESENTADA', 'APROBADA'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-colors border cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#1A202C] text-[#D4AF37] border-[#D4AF37]/40 font-semibold shadow-sm'
                  : 'bg-[#12161F] text-[#8A94A6] border-[#252D3D] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE COTIZACIONES CON ENTRADA ANIMADA Y 3D TILT */}
      {filteredQuotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#12161F] border border-[#252D3D] text-[#8A94A6]">
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
                    className="h-full group p-5 rounded-2xl bg-[#12161F] border border-[#252D3D] hover:border-[#D4AF37]/50 transition-all cursor-pointer flex flex-col justify-between shadow-xl hover:shadow-[#D4AF37]/10"
                  >
                    <div>
                      {/* Top: Folio y Estado */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold text-[#D4AF37] bg-[#1A202C] px-2.5 py-0.5 rounded border border-[#D4AF37]/20">
                          {quote.codigo}
                        </span>
                        {getStatusBadge(quote.estado)}
                      </div>

                      {/* Nombre de Obra */}
                      <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2 mb-2">
                        {quote.proyecto || 'Obra Sin Nombre'}
                      </h3>

                      {/* Cliente y Ubicación */}
                      <div className="space-y-1.5 text-xs text-[#8A94A6] mb-4">
                        <div className="flex items-center gap-2 truncate">
                          <User size={13} className="text-[#8A94A6] shrink-0" />
                          <span className="truncate">{quote.cliente || 'Sin cliente asignado'}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <MapPin size={13} className="text-[#8A94A6] shrink-0" />
                          <span className="truncate">{quote.ubicacion || 'Ubicación no especificada'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-[#8A94A6] shrink-0" />
                          <span>{quote.fecha}</span>
                          <span>•</span>
                          <span>{totalPartidas} partidas ({totalItems} conceptos)</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Total Financiero y Acciones */}
                    <div className="pt-3 border-t border-[#252D3D] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block">Presupuesto</span>
                        <div className="text-base font-mono font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                          <AnimatedCounter 
                            value={total} 
                            prefix={`${quote.moneda} `}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectQuote(quote)}
                          title="Editar en Cotizador"
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => onPreviewPdf(quote)}
                          title="Ver Propuesta PDF"
                          className="p-1.5 text-[#8A94A6] hover:text-[#D4AF37] hover:bg-[#1A202C] rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(quote)}
                          title="Duplicar Cotización"
                          className="p-1.5 text-[#8A94A6] hover:text-white hover:bg-[#1A202C] rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(quote.id, e)}
                          title="Eliminar de base de datos"
                          className="p-1.5 text-[#8A94A6] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
