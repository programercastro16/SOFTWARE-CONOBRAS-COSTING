import React from 'react';
import { 
  Calculator, 
  Layers, 
  History, 
  Settings, 
  Briefcase, 
  Building,
  CheckCircle2
} from 'lucide-react';

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
      description: 'Presupuestos y APU',
      icon: Calculator,
      badge: null
    },
    {
      id: 'materiales' as ActiveTab,
      label: 'Catálogo de Insumos',
      description: 'Precios, M.O. y Equipos',
      icon: Layers,
      badge: materialsCount > 0 ? materialsCount : null
    },
    {
      id: 'historial' as ActiveTab,
      label: 'Historial',
      description: 'Cotizaciones emitidas',
      icon: History,
      badge: quotesCount > 0 ? quotesCount : null
    },
    {
      id: 'configuracion' as ActiveTab,
      label: 'Estudio & Marca',
      description: 'Datos Conobras y perfil',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-[#0E121A] border-r border-[#252D3D] flex flex-col justify-between select-none shrink-0 no-print">
      {/* BRANDING HEADER CON LOGO OFICIAL CONOBRAS */}
      <div>
        <div className="p-5 border-b border-[#252D3D] bg-gradient-to-b from-[#141923] to-[#0E121A]">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Contenedor del Logo Dorado con Glow destacado */}
            <div className="relative group mb-2.5 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#D4AF37]/25 blur-xl rounded-full scale-110 pointer-events-none group-hover:bg-[#D4AF37]/35 transition-all duration-500"></div>
              
              <div className="relative h-20 w-36 flex items-center justify-center p-1 transition-transform duration-300 group-hover:scale-105">
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
              <span className="font-extrabold text-base tracking-[0.2em] text-white uppercase font-sans">
                CONOBRAS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-mono font-bold border border-[#D4AF37]/40 shadow-sm">
                QUOTE
              </span>
            </div>

            <div className="text-[10px] text-[#8A94A6] tracking-wider uppercase font-semibold flex items-center gap-1.5 mt-1">
              <span>Construcción</span>
              <span className="text-[#D4AF37] font-bold">•</span>
              <span>Arquitectura</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#48BB78] ml-0.5 inline-block shadow-[0_0_6px_#48BB78]"></span>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="p-3 space-y-1.5 mt-2">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#8A94A6]">
            Módulos del Sistema
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left ${
                  isActive 
                    ? 'bg-[#1A202C] text-white border border-[#D4AF37]/40 shadow-md gold-glow-sm' 
                    : 'text-[#8A94A6] hover:text-[#F3F5F8] hover:bg-[#141822] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-[#8A94A6]'}`}>
                    <Icon size={18} />
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
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#D4AF37] text-black font-bold' : 'bg-[#1A202C] text-[#8A94A6]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* FOOTER LOCAL DESKTOP STATUS */}
      <div className="p-4 border-t border-[#252D3D] bg-[#0A0D12]">
        <div className="flex items-center justify-between text-[11px] text-[#8A94A6]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#48BB78] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#48BB78]"></span>
            </span>
            <span className="text-[10px] font-mono">SQLite Local • Offline</span>
          </div>
          <span className="text-[10px] text-[#D4AF37] font-mono font-bold">PRO</span>
        </div>
        <div className="mt-2 text-[10px] text-[#8A94A6]/70 truncate">
          Uso personal exclusivo
        </div>
      </div>
    </aside>
  );
};
