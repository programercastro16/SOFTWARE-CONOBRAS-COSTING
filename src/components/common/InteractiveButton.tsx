import React, { useState, MouseEvent } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'glass' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shimmer?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  variant = 'gold',
  size = 'md',
  shimmer = false,
  glow = false,
  children,
  icon,
  className = '',
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  // Variantes de estilo de diseño
  const variantStyles = {
    gold: 'bg-gradient-to-r from-[#D4AF37] via-[#E2BF48] to-[#AA8820] text-[#111622] font-bold shadow-md shadow-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/45 hover:brightness-105 border border-[#FFF0A0]/60',
    glass: 'bg-white/90 hover:bg-white text-[#111622] border border-[#B4B7BC] hover:border-[#D4AF37] shadow-sm backdrop-blur-md font-semibold',
    outline: 'bg-transparent text-[#9E7A18] border border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#AA8820] shadow-sm font-semibold',
    ghost: 'bg-transparent text-[#586274] hover:text-[#111622] hover:bg-[#DDE1E6]',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-300 hover:border-red-400 font-medium'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs rounded-xl gap-2 font-semibold',
    lg: 'px-5 py-2.5 text-sm rounded-xl gap-2.5 font-bold'
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative overflow-hidden inline-flex items-center justify-center 
        transition-all duration-200 transform 
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
        select-none cursor-pointer
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${glow ? 'gold-glow' : ''}
        ${className}
      `}
      {...props}
    >
      {/* SHIMMER LIGHT BEAM EFFECT */}
      {shimmer && (
        <span 
          className="absolute inset-0 pointer-events-none w-[200%] -translate-x-[100%] hover:animate-none animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/30 to-transparent" 
        />
      )}

      {/* RIPPLE EFFECT ON CLICK */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ripple bg-white/40"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}

      {/* ICON & TEXT CONTENT */}
      {icon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </button>
  );
};
