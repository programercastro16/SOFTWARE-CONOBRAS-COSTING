import React, { useState, useEffect } from 'react';

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
}

export const AnimatedGradientText: React.FC<AnimatedGradientTextProps> = ({
  children,
  className = '',
  from = '#FFFFFF',
  via = '#F3C769',
  to = '#D4AF37'
}) => {
  return (
    <span
      className={`inline-block font-extrabold bg-gradient-to-r from-white via-[#F3C769] to-[#AA8820] bg-clip-text text-transparent animate-gradient-text tracking-wide ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${from}, ${via}, ${to}, ${from})`
      }}
    >
      {children}
    </span>
  );
};

interface TypewriterHeadlineProps {
  phrases?: string[];
  typingSpeed?: number;
  pauseTime?: number;
  className?: string;
  prefix?: string;
}

export const TypewriterHeadline: React.FC<TypewriterHeadlineProps> = ({
  phrases = [
    'Presupuestos Arquitectónicos de Alta Precisión',
    'Cómputos Métricos y APU en Tiempo Real',
    'Ingeniería de Costos y Control de Obras',
    'Visualización Tridimensional y Estructura BIM'
  ],
  typingSpeed = 45,
  pauseTime = 2200,
  className = '',
  prefix = ''
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = phrases[currentPhraseIndex];
    let timer: number;

    if (!isDeleting && currentText.length < fullText.length) {
      timer = window.setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && currentText.length === fullText.length) {
      timer = window.setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
    } else if (isDeleting && currentText.length > 0) {
      timer = window.setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      }, typingSpeed / 2);
    } else if (isDeleting && currentText.length === 0) {
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex, phrases, typingSpeed, pauseTime]);

  return (
    <div className={`flex items-center gap-1.5 font-mono text-xs text-[#8A94A6] ${className}`}>
      {prefix && <span className="text-[#D4AF37] font-semibold">{prefix}</span>}
      <span className="text-white/90 font-medium">
        {currentText}
      </span>
      <span className="inline-block w-1.5 h-3.5 bg-[#D4AF37] animate-pulse rounded-sm" />
    </div>
  );
};

interface ShimmerBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'gold' | 'cyan' | 'emerald';
  className?: string;
}

export const ShimmerBadge: React.FC<ShimmerBadgeProps> = ({
  children,
  icon,
  variant = 'gold',
  className = ''
}) => {
  const colorMap = {
    gold: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/35 shadow-[#D4AF37]/20',
    cyan: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/35 shadow-[#38BDF8]/20',
    emerald: 'bg-[#48BB78]/10 text-[#48BB78] border-[#48BB78]/35 shadow-[#48BB78]/20'
  };

  return (
    <span
      className={`
        relative overflow-hidden inline-flex items-center gap-1.5 px-2.5 py-1 
        rounded-full text-[11px] font-mono font-semibold border backdrop-blur-md shadow-sm
        ${colorMap[variant]}
        ${className}
      `}
    >
      <span className="absolute inset-0 w-[200%] -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </span>
  );
};
