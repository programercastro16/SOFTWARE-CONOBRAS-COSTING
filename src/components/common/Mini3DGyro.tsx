import React, { useEffect, useRef, useState } from 'react';
import { Compass, RotateCw } from 'lucide-react';

interface Mini3DGyroProps {
  size?: number;
  className?: string;
  label?: string;
}

export const Mini3DGyro: React.FC<Mini3DGyroProps> = ({
  size = 64,
  className = '',
  label = 'BIM COMPASS'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angles, setAngles] = useState({ pitch: 22, yaw: -35, roll: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let autoRotateAngle = 0;

    const render = () => {
      if (!isDraggingRef.current) {
        autoRotateAngle += 0.008;
      }

      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.42;

      // Ángulos en radianes
      const yaw = ((angles.yaw + (isDraggingRef.current ? 0 : autoRotateAngle * 25)) * Math.PI) / 180;
      const pitch = (angles.pitch * Math.PI) / 180;

      // Anillo exterior base (Horizonte)
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Función de proyección 3D simple
      const project = (x: number, y: number, z: number) => {
        // Rotación Y (yaw)
        const x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
        const z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
        // Rotación X (pitch)
        const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
        const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);

        const scale = (r * 1.5) / (2.2 + z2 * 0.4);
        return {
          px: cx + x1 * scale,
          py: cy - y2 * scale,
          depth: z2
        };
      };

      // Dibujar Ejes 3D (X: Rojo/Naranja, Y: Verde, Z: Dorado/Cian)
      const axes = [
        { label: 'E', x: 1, y: 0, z: 0, color: '#F87171' }, // Este / X
        { label: 'Z', x: 0, y: 1, z: 0, color: '#4ADE80' }, // Cenit / Y
        { label: 'N', x: 0, y: 0, z: 1, color: '#D4AF37' }, // Norte / Z
        { label: 'S', x: 0, y: 0, z: -1, color: '#38BDF8' }  // Sur
      ];

      // Centro
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();

      axes.forEach((axis) => {
        const p = project(axis.x, axis.y, axis.z);

        ctx.strokeStyle = axis.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.px, p.py);
        ctx.stroke();

        // Letra del eje
        ctx.fillStyle = axis.color;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(axis.label, p.px, p.py);
      });

      // Anillo de inclinación interior
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.2) {
        const p = project(Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7);
        if (a === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      }
      ctx.closePath();
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [angles, size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    setAngles((prev) => ({
      ...prev,
      yaw: (prev.yaw + dx * 1.5) % 360,
      pitch: Math.max(-80, Math.min(80, prev.pitch - dy * 1.5))
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAngles({ pitch: 22, yaw: -35, roll: 0 });
  };

  return (
    <div
      className={`relative flex items-center gap-2.5 p-2 rounded-xl bg-[#0A0D12]/90 border border-[#252D3D] select-none group ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      title="Orientación 3D del Estudio (Arrastra para rotar o haz clic en Norte)"
    >
      <div className="relative cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-full shadow-inner bg-[#12161F]"
        />
        <div className="absolute inset-0 rounded-full border border-[#D4AF37]/20 pointer-events-none group-hover:border-[#D4AF37]/50 transition-colors" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-1">
            <Compass size={11} className="text-[#D4AF37] animate-spin-slow-3d" />
            {label}
          </span>
          <button
            onClick={resetView}
            title="Centrar Norte"
            className="text-[#8A94A6] hover:text-[#D4AF37] p-0.5 rounded transition-colors"
          >
            <RotateCw size={10} />
          </button>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] text-[#8A94A6] mt-0.5">
          <span>Y: {Math.round(angles.yaw)}°</span>
          <span>•</span>
          <span>P: {Math.round(angles.pitch)}°</span>
        </div>
        <div className="text-[8px] font-mono text-[#48BB78] flex items-center gap-1 mt-0.5">
          <span className="w-1 h-1 rounded-full bg-[#48BB78] animate-ping inline-block" />
          <span>Eje CAD Activo</span>
        </div>
      </div>
    </div>
  );
};
