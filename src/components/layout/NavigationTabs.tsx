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
    <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-1 border-b border-[#252D3D]/70 no-print select-none">
      {/* TABS CONTAINER CON GLASSMORPHISM FLOTANTE Y EFECTO DOCK */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0E121A]/85 border border-[#252D3D] backdrop-blur-xl shadow-lg relative overflow-hidden">
        {/* Sutil brillo de fondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-[#38BDF8]/5 pointer-events-none" />

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
                  ? 'text-white bg-gradient-to-r from-[#1C2333] via-[#1E273A] to-[#151D2C] border border-[#D4AF37]/50 shadow-md gold-glow-sm -translate-y-0.5' 
                  : 'text-[#8A94A6] hover:text-[#F3F5F8] hover:bg-[#141822]/70 border border-transparent hover:-translate-y-0.5'
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
                  isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-[#8A94A6] group-hover:text-white'
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
                    : 'bg-[#1C2230] text-[#8A94A6] border border-[#252D3D]'
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121620]/80 border border-[#252D3D] text-[11px] font-mono text-[#8A94A6]">
          <Activity size={12} className="text-[#48BB78] animate-pulse" />
          <span>OBRA ACTIVA:</span>
          <span className="text-[#D4AF37] font-bold">{currentQuoteCode}</span>
        </div>
      )}
    </div>
  );
};
