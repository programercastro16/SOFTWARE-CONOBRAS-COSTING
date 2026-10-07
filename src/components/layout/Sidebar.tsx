import React from 'react';
import { 
  Calculator, 
  Layers, 
  History, 
  Settings, 
  Box,
  Compass,
  Cpu,
  Database,
  Sparkles,
  Zap
} from 'lucide-react';
import { Mini3DGyro } from '../common/Mini3DGyro';
import { TiltCard } from '../common/TiltCard';

export type ActiveTab = 'cotizador' | 'materiales' | 'historial' | 'configuracion';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  quotesCount: number;
  materialsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  quotesCount,
  materialsCount
}) => {
  const navItems = [
    {
      id: 'cotizador' as ActiveTab,
      label: 'Cotizador de Obra',
      description: 'Presupuestos & APU',
      icon: Calculator,
      badge: null,
      color: '#D4AF37'
    },
    {
      id: 'materiales' as ActiveTab,
      label: 'Catálogo de Insumos',
      description: 'Materiales & M.O.',
      icon: Layers,
      badge: materialsCount > 0 ? materialsCount : null,
      color: '#38BDF8'
    },
    {
      id: 'historial' as ActiveTab,
      label: 'Historial de Obras',
      description: 'Cotizaciones emitidas',
      icon: History,
      badge: quotesCount > 0 ? quotesCount : null,
      color: '#A78BFA'
    },
    {
      id: 'configuracion' as ActiveTab,
      label: 'Estudio & Marca',
      description: 'Perfil y parámetros',
      icon: Settings,
      badge: null,
      color: '#48BB78'
    }
  ];

  return (
    <aside className="w-64 bg-[#0E121A]/95 backdrop-blur-xl border-r border-[#252D3D] flex flex-col justify-between select-none shrink-0 no-print z-20 relative">
      {/* SUTIL RAYO DE LUZ VERTICAL */}
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-[#D4AF37]/30 via-[#38BDF8]/20 to-transparent pointer-events-none" />

      {/* SECCIÓN SUPERIOR: BRANDING CON TILT 3D Y NAVEGACIÓN */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* BRANDING OFICIAL CONOBRAS CON EFECTO HOLOGRÁFICO */}
        <div className="p-4 border-b border-[#252D3D] bg-gradient-to-b from-[#151A24] to-[#0E121A] relative overflow-hidden">
          {/* Shimmer sweep en el header de marca */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent pointer-events-none animate-shimmer-sweep" />

          <TiltCard maxTilt={8} lift={true} className="w-full">
            <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-[#12161F]/60 border border-[#252D3D]/50 hover:border-[#D4AF37]/40 transition-colors">
              {/* Contenedor del Logo Conobras con Glow */}
              <div className="relative mb-2 flex items-center justify-center cursor-pointer">
                <div className="absolute inset-0 bg-[#D4AF37]/25 blur-xl rounded-full scale-110 pointer-events-none animate-pulse-slow" />
                
                <div className="relative h-16 w-32 flex items-center justify-center p-1 transition-transform duration-300 group-hover:scale-105">
                  <img 
                    src="./assets/conobras-logo.png" 
                    alt="Conobras - Logo Oficial" 
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_14px_rgba(212,175,55,0.45)]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Tipografía de la marca */}
              <div className="flex items-center gap-1.5 justify-center">
                <span className="font-extrabold text-sm tracking-[0.22em] text-white uppercase font-sans">
                  CONOBRAS
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-mono font-bold border border-[#D4AF37]/40 shadow-sm">
                  QUOTE
                </span>
              </div>

              <div className="text-[9px] text-[#8A94A6] tracking-wider uppercase font-semibold flex items-center gap-1 mt-1">
                <span>Construcción</span>
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>Arquitectura</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#48BB78] ml-0.5 inline-block shadow-[0_0_6px_#48BB78]" />
              </div>
            </div>
          </TiltCard>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="p-3 space-y-1.5 mt-2">
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-[#8A94A6] flex items-center justify-between">
            <span>Módulos de Sistema</span>
            <span className="text-[9px] text-[#D4AF37] font-mono">v1.2</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer group
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#1C2333] to-[#141923] text-white border border-[#D4AF37]/50 shadow-md gold-glow-sm translate-x-1' 
                    : 'text-[#8A94A6] hover:text-[#F3F5F8] hover:bg-[#141822] hover:translate-x-0.5 border border-transparent'
                  }
                `}
              >
                {/* Active indicator bar on the left */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#D4AF37] rounded-r-full shadow-[0_0_8px_#D4AF37]" />
                )}

                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm' : 'text-[#8A94A6]'
                  }`}>
                    <Icon size={17} />
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-[#F3F5F8]'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#8A94A6] leading-tight">
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge !== null && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold transition-all ${
                    isActive ? 'bg-[#D4AF37] text-black shadow-sm' : 'bg-[#1A202C] text-[#8A94A6]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* WIDGET 3D ORIENTACIÓN BIM (MINI GYRO COMPASS) */}
        <div className="p-3">
          <Mini3DGyro size={48} label="ORIENTACIÓN CAD" />
        </div>
      </div>

      {/* FOOTER LOCAL DESKTOP STATUS CON RADAR DE ESTADO */}
      <div className="p-3.5 border-t border-[#252D3D] bg-[#0A0D12]">
        <div className="p-2 rounded-xl bg-[#12161F]/80 border border-[#252D3D]/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#8A94A6]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#48BB78] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#48BB78]"></span>
              </span>
              <span className="text-[10px] font-mono font-medium text-white/90">SQLite Local Engine</span>
            </div>
            <span className="text-[9px] text-[#D4AF37] font-mono font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/35">
              PRO
            </span>
          </div>

          <div className="text-[9px] text-[#8A94A6] flex items-center justify-between font-mono pt-1 border-t border-[#252D3D]/40">
            <span>MODO OFFLINE</span>
            <span className="text-[#38BDF8]">CAD / 3D ACTIVO</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
