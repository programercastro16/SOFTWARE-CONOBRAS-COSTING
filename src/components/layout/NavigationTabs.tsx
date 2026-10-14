import React from 'react';
import { 
  Calculator, 
  Layers, 
  History, 
  Settings, 
  Activity
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  quotesCount: number;
  materialsCount: number;
  currentQuoteCode?: string;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  quotesCount,
  materialsCount,
  currentQuoteCode
}) => {
  const tabs = [
    {
      id: 'cotizador' as ActiveTab,
      label: 'Cotizador de Obra',
      shortLabel: 'Cotizador',
      icon: Calculator,
      badge: null,
      glowColor: 'rgba(212, 175, 55, 0.4)'
    },
    {
      id: 'materiales' as ActiveTab,
      label: 'Catálogo de Insumos',
      shortLabel: 'Catálogo Insumos',
      icon: Layers,
      badge: materialsCount > 0 ? materialsCount : null,
      glowColor: 'rgba(56, 189, 248, 0.4)'
    },
    {
      id: 'historial' as ActiveTab,
      label: 'Historial de Obras',
      shortLabel: 'Historial Obras',
      icon: History,
      badge: quotesCount > 0 ? quotesCount : null,
      glowColor: 'rgba(167, 139, 250, 0.4)'
    },
    {
      id: 'configuracion' as ActiveTab,
      label: 'Estudio & Marca',
      shortLabel: 'Estudio & Marca',
      icon: Settings,
      badge: null,
      glowColor: 'rgba(72, 187, 120, 0.4)'
    }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-1 no-print select-none">
      {/* TABS CONTAINER CON GLASSMORPHISM FLOTANTE Y EFECTO DOCK */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/85 border border-[#C5CAD2] backdrop-blur-xl shadow-md relative overflow-hidden">
        {/* Sutil brillo de fondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-[#B4B7BC]/10 pointer-events-none" />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold
                transition-all duration-300 ease-out cursor-pointer transform
                ${isActive 
                  ? 'text-[#111622] bg-white border border-[#B4B7BC] shadow-sm gold-glow-sm -translate-y-0.5 font-bold' 
                  : 'text-[#586274] hover:text-[#111622] hover:bg-white/60 border border-transparent hover:-translate-y-0.5'
                }
              `}
            >
              {/* INDICADOR ACTIVO INFERIOR */}
              {isActive && (
                <span className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full shadow-[0_0_10px_#D4AF37]" />
              )}

              {/* ICONO CON MICRO-ANIMACIÓN */}
              <div 
                className={`p-1 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  isActive ? 'bg-[#D4AF37]/20 text-[#AA8820]' : 'text-[#586274] group-hover:text-[#111622]'
                }`}
              >
                <Icon size={15} />
              </div>

              {/* TEXTO */}
              <span className="tracking-wide">
                {tab.shortLabel}
              </span>

              {/* BADGE NUMÉRICO */}
              {tab.badge !== null && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold transition-all shadow-sm ${
                  isActive 
                    ? 'bg-[#D4AF37] text-black ring-2 ring-[#D4AF37]/30' 
                    : 'bg-[#EEF1F5] text-[#586274] border border-[#C5CAD2]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ACCIONES DEL DOCK DERECHO: BADGE DE COTIZACIÓN ACTIVA */}
      {currentQuoteCode && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-[#C5CAD2] text-[11px] font-mono text-[#586274] shadow-sm">
          <Activity size={12} className="text-[#16A34A] animate-pulse" />
          <span>OBRA ACTIVA:</span>
          <span className="text-[#AA8820] font-bold">{currentQuoteCode}</span>
        </div>
      )}
    </div>
  );
};
