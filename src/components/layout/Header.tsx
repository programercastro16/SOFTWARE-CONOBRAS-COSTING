import React from 'react';
import { Plus, Database, Sparkles, FolderOpen } from 'lucide-react';

interface HeaderProps {
  onNewQuote: () => void;
  onOpenCatalog: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewQuote, onOpenCatalog }) => {
  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-16 border-b border-[#252D3D] bg-[#0E121A]/80 backdrop-blur-md px-6 flex items-center justify-between no-print z-10">
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#8A94A6] capitalize font-medium">
          {currentDate}
        </span>
        <span className="text-[#252D3D]">•</span>
        <span className="text-xs text-[#D4AF37] font-medium flex items-center gap-1.5">
          <Sparkles size={13} />
          Estudio de Arquitectura
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCatalog}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141822] hover:bg-[#1A202C] border border-[#252D3D] text-xs text-[#8A94A6] hover:text-white transition-all"
        >
          <FolderOpen size={14} className="text-[#D4AF37]" />
          <span>Insumos Rápidos</span>
        </button>

        <button
          onClick={onNewQuote}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8820] hover:from-[#E6C65A] hover:to-[#D4AF37] text-black font-semibold text-xs transition-all shadow-md shadow-[#D4AF37]/20 active:scale-95"
        >
          <Plus size={15} />
          <span>Nueva Cotización</span>
        </button>
      </div>
    </header>
  );
};
