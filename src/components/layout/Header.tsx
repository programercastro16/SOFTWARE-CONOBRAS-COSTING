import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, Sparkles, Clock } from 'lucide-react';
import { InteractiveButton } from '../common/InteractiveButton';
import { TypewriterHeadline, ShimmerBadge } from '../common/AnimatedText';

interface HeaderProps {
  onNewQuote: () => void;
  onOpenCatalog: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNewQuote, 
  onOpenCatalog
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="h-16 border-b border-[#252D3D] bg-[#0E121A]/90 backdrop-blur-xl px-6 flex items-center justify-between no-print z-10 select-none">
      {/* SECCIÓN IZQUIERDA: SLOGAN DINÁMICO ANIMADO Y FECHA/HORA DE ESTUDIO */}
      <div className="flex items-center gap-4">
        {/* Reloj de Precisión de Obra */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#8A94A6] font-mono bg-[#141822]/70 px-2.5 py-1 rounded-lg border border-[#252D3D]">
          <Clock size={12} className="text-[#D4AF37]" />
          <span className="capitalize">{currentDate}</span>
          <span className="text-[#D4AF37]">•</span>
          <span className="text-white font-bold">{timeStr}</span>
        </div>

        {/* Separador */}
        <span className="hidden sm:inline text-[#252D3D]">•</span>

        {/* Headline Dinámico con Efecto Typewriter */}
        <div className="hidden md:block">
          <TypewriterHeadline 
            prefix="CONOBRAS •"
            typingSpeed={40}
            pauseTime={2500}
          />
        </div>
      </div>

      {/* SECCIÓN DERECHA: ACCIONES RÁPIDAS CON BOTONES INTERACTIVOS 3D */}
      <div className="flex items-center gap-3">
        <ShimmerBadge variant="gold" icon={<Sparkles size={11} className="animate-spin-slow-3d" />}>
          Estudio de Arquitectura
        </ShimmerBadge>

        <InteractiveButton
          variant="glass"
          size="sm"
          onClick={onOpenCatalog}
          icon={<FolderOpen size={14} className="text-[#38BDF8]" />}
        >
          Insumos Rápidos
        </InteractiveButton>

        <InteractiveButton
          variant="gold"
          size="sm"
          shimmer={true}
          glow={true}
          onClick={onNewQuote}
          icon={<Plus size={15} />}
        >
          Nueva Cotización
        </InteractiveButton>
      </div>
    </header>
  );
};
