import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Box, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Compass, 
  Sparkles,
  RefreshCw,
  Sun,
  Scan,
  Maximize2
} from 'lucide-react';

export type ModelType = 'frame' | 'tower' | 'villa' | 'dome' | 'terrain';

interface Point3D {
  x: number;
  y: number;
  z: number;
  category?: 'col' | 'beam' | 'slab' | 'terrain';
}

interface Edge3D {
  p1: number;
  p2: number;
  color?: string;
  width?: number;
}

interface Architectural3DViewerProps {
  className?: string;
  compact?: boolean;
  onClose?: () => void;
}

export const Architectural3DViewer: React.FC<Architectural3DViewerProps> = ({
  className = '',
  compact = false,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estados de control de cámara y modelo
  const [modelType, setModelType] = useState<ModelType>('frame');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 25, y: -45 });
  const [zoom, setZoom] = useState<number>(compact ? 180 : 230);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scanActive, setScanActive] = useState<boolean>(true);
  const [stats, setStats] = useState<{ nodes: number; edges: number; fps: number }>({ nodes: 0, edges: 0, fps: 60 });
  const [sunAngle, setSunAngle] = useState<number>(45);

  // Animación loop ref
  const animFrameRef = useRef<number | null>(null);
  const rotRef = useRef(rotation);
  rotRef.current = rotation;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const scanActiveRef = useRef(scanActive);
  scanActiveRef.current = scanActive;
  const sunAngleRef = useRef(sunAngle);
  sunAngleRef.current = sunAngle;

  // Generadores de geometría 3D arquitectónica
  const generateModel = useCallback((type: ModelType): { points: Point3D[]; edges: Edge3D[] } => {
    const points: Point3D[] = [];
    const edges: Edge3D[] = [];

    if (type === 'frame') {
      // Estructura Porticada de Concreto / Acero (3 niveles x 3 vanos)
      const cols = 3;
      const bays = 3;
      const floors = 4;
      const spacingX = 1.2;
      const spacingZ = 1.2;
      const floorH = 0.9;

      const offsetX = ((cols - 1) * spacingX) / 2;
      const offsetZ = ((bays - 1) * spacingZ) / 2;
      const offsetY = ((floors - 1) * floorH) / 2;

      // Nodos
      for (let f = 0; f < floors; f++) {
        for (let cz = 0; cz < bays; cz++) {
          for (let cx = 0; cx < cols; cx++) {
            points.push({
              x: cx * spacingX - offsetX,
              y: f * floorH - offsetY,
              z: cz * spacingZ - offsetZ,
              category: f === 0 ? 'col' : 'beam'
            });
          }
        }
      }

      const getIdx = (f: number, cz: number, cx: number) => f * (cols * bays) + cz * cols + cx;

      // Columnas (verticales doradas)
      for (let f = 0; f < floors - 1; f++) {
        for (let cz = 0; cz < bays; cz++) {
          for (let cx = 0; cx < cols; cx++) {
            edges.push({
              p1: getIdx(f, cz, cx),
              p2: getIdx(f + 1, cz, cx),
              color: '#D4AF37',
              width: 2.4
            });
          }
        }
      }

      // Vigas X y Z
      for (let f = 0; f < floors; f++) {
        for (let cz = 0; cz < bays; cz++) {
          for (let cx = 0; cx < cols; cx++) {
            if (cx < cols - 1) {
              edges.push({
                p1: getIdx(f, cz, cx),
                p2: getIdx(f, cz, cx + 1),
                color: f === 0 ? '#38BDF8' : '#F3C769',
                width: 1.6
              });
            }
            if (cz < bays - 1) {
              edges.push({
                p1: getIdx(f, cz, cx),
                p2: getIdx(f, cz + 1, cx),
                color: f === 0 ? '#38BDF8' : '#F3C769',
                width: 1.6
              });
            }
          }
        }
      }

      // Arriostramientos diagonales
      for (let f = 0; f < floors - 1; f++) {
        edges.push({
          p1: getIdx(f, 0, 0),
          p2: getIdx(f + 1, 0, 1),
          color: 'rgba(212, 175, 55, 0.4)',
          width: 0.9
        });
        edges.push({
          p1: getIdx(f, 0, cols - 1),
          p2: getIdx(f + 1, 0, cols - 2),
          color: 'rgba(212, 175, 55, 0.4)',
          width: 0.9
        });
      }
    } else if (type === 'tower') {
      // Torre Arquitectónica Torsional Helicoide
      const floors = 9;
      const sides = 6;
      const radius = 1.35;
      const floorH = 0.45;
      const totalH = floors * floorH;

      for (let f = 0; f < floors; f++) {
        const twistAngle = (f / floors) * Math.PI * 0.9;
        const currentR = radius * (1 - (f / floors) * 0.28);
        const y = f * floorH - totalH / 2;

        for (let s = 0; s < sides; s++) {
          const theta = (s / sides) * Math.PI * 2 + twistAngle;
          points.push({
            x: Math.cos(theta) * currentR,
            y: y,
            z: Math.sin(theta) * currentR,
            category: 'beam'
          });
        }
      }

      const getIdx = (f: number, s: number) => f * sides + (s % sides);

      // Anillos horizontales
      for (let f = 0; f < floors; f++) {
        for (let s = 0; s < sides; s++) {
          edges.push({
            p1: getIdx(f, s),
            p2: getIdx(f, (s + 1) % sides),
            color: '#38BDF8',
            width: 1.6
          });
        }
      }

      // Columnas y diagrid
      for (let f = 0; f < floors - 1; f++) {
        for (let s = 0; s < sides; s++) {
          edges.push({
            p1: getIdx(f, s),
            p2: getIdx(f + 1, s),
            color: '#D4AF37',
            width: 2.2
          });
          edges.push({
            p1: getIdx(f, s),
            p2: getIdx(f + 1, (s + 1) % sides),
            color: 'rgba(212, 175, 55, 0.45)',
            width: 0.9
          });
        }
      }
    } else if (type === 'villa') {
      // Residencia Minimalista Contemporánea (Voladizo, losas y alberca)
      // Planta baja
      const basePoints: [number, number, number][] = [
        // Base / Cimentación
        [-1.6, -1.0, -1.2], [1.2, -1.0, -1.2], [1.2, -1.0, 1.2], [-1.6, -1.0, 1.2],
        // Nivel 1
        [-1.6, 0.0, -1.2], [1.2, 0.0, -1.2], [1.2, 0.0, 1.2], [-1.6, 0.0, 1.2],
        // Nivel 2 (Voladizo frontal hacia X positivo)
        [-1.2, 0.0, -1.0], [1.8, 0.0, -1.0], [1.8, 0.0, 0.8], [-1.2, 0.0, 0.8],
        // Cubierta Nivel 2
        [-1.2, 0.9, -1.0], [1.8, 0.9, -1.0], [1.8, 0.9, 0.8], [-1.2, 0.9, 0.8],
        // Alberca / Espejo de agua
        [-1.4, -1.0, 1.4], [-0.2, -1.0, 1.4], [-0.2, -1.0, 2.1], [-1.4, -1.0, 2.1]
      ];

      basePoints.forEach(([x, y, z]) => points.push({ x, y, z }));

      const connectBox = (start: number, col: string) => {
        // Base
        edges.push({ p1: start, p2: start + 1, color: col, width: 2 });
        edges.push({ p1: start + 1, p2: start + 2, color: col, width: 2 });
        edges.push({ p1: start + 2, p2: start + 3, color: col, width: 2 });
        edges.push({ p1: start + 3, p2: start, color: col, width: 2 });
        // Tapa
        edges.push({ p1: start + 4, p2: start + 5, color: col, width: 2 });
        edges.push({ p1: start + 5, p2: start + 6, color: col, width: 2 });
        edges.push({ p1: start + 6, p2: start + 7, color: col, width: 2 });
        edges.push({ p1: start + 7, p2: start + 4, color: col, width: 2 });
        // Columnas verticales
        edges.push({ p1: start, p2: start + 4, color: '#D4AF37', width: 2.5 });
        edges.push({ p1: start + 1, p2: start + 5, color: '#D4AF37', width: 2.5 });
        edges.push({ p1: start + 2, p2: start + 6, color: '#D4AF37', width: 2.5 });
        edges.push({ p1: start + 3, p2: start + 7, color: '#D4AF37', width: 2.5 });
      };

      connectBox(0, '#38BDF8');
      connectBox(8, '#F3C769');

      // Conexión alberca
      edges.push({ p1: 16, p2: 17, color: '#38BDF8', width: 1.8 });
      edges.push({ p1: 17, p2: 18, color: '#38BDF8', width: 1.8 });
      edges.push({ p1: 18, p2: 19, color: '#38BDF8', width: 1.8 });
      edges.push({ p1: 19, p2: 16, color: '#38BDF8', width: 1.8 });

    } else if (type === 'dome') {
      // Domo Geodésico Icosaédrico Paramétrico
      const rings = 5;
      const rad = 1.4;
      for (let r = 0; r <= rings; r++) {
        const phi = (r / rings) * (Math.PI / 2.3);
        const y = Math.cos(phi) * rad - 0.5;
        const ringRad = Math.sin(phi) * rad;
        const segments = Math.max(4, r * 4 + 4);

        for (let s = 0; s < segments; s++) {
          const theta = (s / segments) * Math.PI * 2;
          points.push({
            x: Math.cos(theta) * ringRad,
            y: y,
            z: Math.sin(theta) * ringRad,
            category: 'beam'
          });
        }
      }

      // Conectar aristas perimetrales del domo
      let startIdx = 0;
      for (let r = 0; r <= rings; r++) {
        const segments = Math.max(4, r * 4 + 4);
        for (let s = 0; s < segments; s++) {
          edges.push({
            p1: startIdx + s,
            p2: startIdx + ((s + 1) % segments),
            color: '#38BDF8',
            width: 1.4
          });
        }
        startIdx += segments;
      }

      // Enlaces radiales
      for (let i = 0; i < Math.min(points.length - 8, 36); i += 2) {
        edges.push({
          p1: i,
          p2: Math.min(points.length - 1, i + 6),
          color: '#D4AF37',
          width: 1.2
        });
      }

    } else {
      // Malla Topográfica y Plataforma de Cimentación
      const size = 7;
      const step = 0.55;
      const offset = ((size - 1) * step) / 2;

      for (let z = 0; z < size; z++) {
        for (let x = 0; x < size; x++) {
          const posX = x * step - offset;
          const posZ = z * step - offset;
          const posY = Math.sin(posX * 1.6) * Math.cos(posZ * 1.6) * 0.4 - 0.5;
          points.push({ x: posX, y: posY, z: posZ, category: 'terrain' });
        }
      }

      const getIdx = (z: number, x: number) => z * size + x;

      for (let z = 0; z < size; z++) {
        for (let x = 0; x < size; x++) {
          if (x < size - 1) {
            edges.push({
              p1: getIdx(z, x),
              p2: getIdx(z, x + 1),
              color: '#48BB78',
              width: 1.2
            });
          }
          if (z < size - 1) {
            edges.push({
              p1: getIdx(z, x),
              p2: getIdx(z + 1, x),
              color: '#38BDF8',
              width: 1.2
            });
          }
        }
      }

      // Núcleo de Cimentación
      const c1 = points.length;
      points.push({ x: -0.7, y: 0.5, z: -0.7 });
      points.push({ x: 0.7, y: 0.5, z: -0.7 });
      points.push({ x: 0.7, y: 0.5, z: 0.7 });
      points.push({ x: -0.7, y: 0.5, z: 0.7 });

      edges.push({ p1: c1, p2: c1 + 1, color: '#D4AF37', width: 2.4 });
      edges.push({ p1: c1 + 1, p2: c1 + 2, color: '#D4AF37', width: 2.4 });
      edges.push({ p1: c1 + 2, p2: c1 + 3, color: '#D4AF37', width: 2.4 });
      edges.push({ p1: c1 + 3, p2: c1, color: '#D4AF37', width: 2.4 });
    }

    return { points, edges };
  }, []);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let { points, edges } = generateModel(modelType);
    setStats({ nodes: points.length, edges: edges.length, fps: 60 });

    let scanY = 0;
    let frameCount = 0;
    let fpsTimer = performance.now();

    const render = () => {
      const now = performance.now();
      frameCount++;
      if (now - fpsTimer >= 1000) {
        setStats(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        fpsTimer = now;
      }

      if (autoRotateRef.current) {
        setRotation(prev => ({
          ...prev,
          y: (prev.y + 0.35) % 360
        }));
      }

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const radX = (rotRef.current.x * Math.PI) / 180;
      const radY = (rotRef.current.y * Math.PI) / 180;
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);

      const fov = 400;
      const currentZoom = zoomRef.current;

      const projectedPoints: { x: number; y: number; z: number; scale: number; origY: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        const x1 = p.x * cosY + p.z * sinY;
        const y1 = p.y;
        const z1 = -p.x * sinY + p.z * cosY;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const cameraDistance = 5.0;
        const zFinal = z2 + cameraDistance;
        const scale = fov / Math.max(zFinal, 0.1);

        projectedPoints.push({
          x: cx + x2 * (currentZoom * 0.8),
          y: cy - y2 * (currentZoom * 0.8),
          z: zFinal,
          scale: scale,
          origY: p.y
        });
      }

      // Plano base reticulado
      ctx.save();
      ctx.strokeStyle = 'rgba(37, 45, 61, 0.35)';
      ctx.lineWidth = 1;
      const gSize = 2.4;
      const gSteps = 6;
      for (let gx = -gSize; gx <= gSize; gx += gSize / gSteps) {
        const pA = projectPoint(gx, -1.8, -gSize, cosX, sinX, cosY, sinY, cx, cy, currentZoom);
        const pB = projectPoint(gx, -1.8, gSize, cosX, sinX, cosY, sinY, cx, cy, currentZoom);
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();

        const pC = projectPoint(-gSize, -1.8, gx, cosX, sinX, cosY, sinY, cx, cy, currentZoom);
        const pD = projectPoint(gSize, -1.8, gx, cosX, sinX, cosY, sinY, cx, cy, currentZoom);
        ctx.beginPath();
        ctx.moveTo(pC.x, pC.y);
        ctx.lineTo(pD.x, pD.y);
        ctx.stroke();
      }
      ctx.restore();

      // Láser escáner vertical
      if (scanActiveRef.current) {
        scanY = (scanY + 1.2) % height;
        const scanGrad = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
        scanGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
        scanGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.25)');
        scanGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 12, width, 24);

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
      }

      // Aristas con profundidad y brillo
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const p1 = projectedPoints[edge.p1];
        const p2 = projectedPoints[edge.p2];
        if (!p1 || !p2) continue;

        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.2, Math.min(1.0, 1.2 - avgZ * 0.15));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = edge.color || '#D4AF37';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = edge.width || 1.5;
        ctx.stroke();

        if (edge.color === '#D4AF37' && edge.width && edge.width > 2.0) {
          ctx.save();
          ctx.shadowColor = 'rgba(212, 175, 55, 0.45)';
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1.0;

      // Nodos luminosos
      for (let i = 0; i < projectedPoints.length; i++) {
        const p = projectedPoints[i];
        const nodeRadius = Math.max(2, 4.2 - p.z * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeRadius + 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Widget de coordenadas XYZ
      drawAxisWidget(ctx, cosX, sinX, cosY, sinY, 40, height - 40);

      animFrameRef.current = requestAnimationFrame(render);
    };

    function projectPoint(
      px: number, py: number, pz: number,
      cX: number, sX: number, cY: number, sY: number,
      centerX: number, centerY: number, zoomLvl: number
    ) {
      const x1 = px * cY + pz * sY;
      const y1 = py;
      const z1 = -px * sY + pz * cY;
      const x2 = x1;
      const y2 = y1 * cX - z1 * sX;
      return {
        x: centerX + x2 * (zoomLvl * 0.8),
        y: centerY - y2 * (zoomLvl * 0.8)
      };
    }

    function drawAxisWidget(
      context: CanvasRenderingContext2D,
      cX: number, sX: number, cY: number, sY: number,
      originX: number, originY: number
    ) {
      const len = 24;
      const axes = [
        { x: 1, y: 0, z: 0, label: 'X', color: '#EF4444' },
        { x: 0, y: 1, z: 0, label: 'Y', color: '#48BB78' },
        { x: 0, y: 0, z: 1, label: 'Z', color: '#38BDF8' }
      ];

      axes.forEach(axis => {
        const x1 = axis.x * cY + axis.z * sY;
        const y1 = axis.y;
        const z1 = -axis.x * sY + axis.z * cY;
        const x2 = x1;
        const y2 = y1 * cX - z1 * sX;

        const targetX = originX + x2 * len;
        const targetY = originY - y2 * len;

        context.beginPath();
        context.moveTo(originX, originY);
        context.lineTo(targetX, targetY);
        context.strokeStyle = axis.color;
        context.lineWidth = 2;
        context.stroke();

        context.font = '10px monospace';
        context.fillStyle = axis.color;
        context.fillText(axis.label, targetX + 3, targetY + 3);
      });
    }

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [modelType, generateModel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;

    setRotation(prev => ({
      x: Math.max(-80, Math.min(80, prev.x - dy * 0.5)),
      y: (prev.y + dx * 0.5) % 360
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(80, Math.min(450, prev - e.deltaY * 0.25)));
  };

  const resetCamera = () => {
    setRotation({ x: 25, y: -45 });
    setZoom(compact ? 180 : 230);
    setAutoRotate(true);
  };

  const models: { id: ModelType; label: string }[] = [
    { id: 'frame', label: 'Pórtico' },
    { id: 'villa', label: 'Residencia' },
    { id: 'tower', label: 'Torre BIM' },
    { id: 'dome', label: 'Cúpula' },
    { id: 'terrain', label: 'Topografía' }
  ];

  return (
    <div 
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 bg-gradient-to-b from-[#121620] via-[#0D1017] to-[#080B10] shadow-2xl flex flex-col ${className}`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* HUD HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0E121A]/95 backdrop-blur-md border-b border-[#252D3D] z-10 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm animate-pulse-slow">
            <Box size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">
                VISOR BIM 3D DE OBRA
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-mono border border-[#D4AF37]/40 font-semibold">
                CONOBRAS ENGINE
              </span>
            </div>
            <div className="text-[10px] text-[#8A94A6] font-mono">
              Renderizado Wireframe Isométrico Interactivo
            </div>
          </div>
        </div>

        {/* SELECTOR DE MODELO Y CONTROLES */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#141822] p-0.5 rounded-lg border border-[#252D3D]">
            {models.map(m => (
              <button
                key={m.id}
                onClick={() => setModelType(m.id)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                  modelType === m.id
                    ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setScanActive(!scanActive)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              scanActive
                ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                : 'bg-[#141822] border-[#252D3D] text-[#8A94A6] hover:text-white'
            }`}
            title={scanActive ? 'Desactivar escáner láser' : 'Activar escáner láser'}
          >
            <Scan size={14} />
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              autoRotate
                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                : 'bg-[#141822] border-[#252D3D] text-[#8A94A6] hover:text-white'
            }`}
            title={autoRotate ? 'Pausar auto-rotación' : 'Activar auto-rotación'}
          >
            <RotateCw size={14} className={autoRotate ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
          </button>

          <button
            onClick={resetCamera}
            className="p-1.5 rounded-lg bg-[#141822] border border-[#252D3D] text-[#8A94A6] hover:text-white transition-all cursor-pointer"
            title="Resetear Cámara"
          >
            <RefreshCw size={14} />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 rounded-lg bg-[#141822] hover:bg-red-500/20 text-[#8A94A6] hover:text-red-400 border border-[#252D3D] text-xs transition-all ml-1 cursor-pointer font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* LIENZO 3D INTERACTIVO */}
      <div 
        className="relative flex-1 w-full min-h-[260px] cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block"
        />

        {/* HUD TELEMETRY OVERLAY */}
        <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1 font-mono text-[10px] text-[#8A94A6]/80 bg-[#0A0D12]/75 backdrop-blur-sm p-2 rounded-lg border border-[#252D3D]/60 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-semibold">ROTACIÓN:</span>
            <span>X: {Math.round(rotation.x)}° | Y: {Math.round(rotation.y)}°</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#38BDF8] font-semibold">ZOOM:</span>
            <span>{Math.round(zoom)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#48BB78] font-semibold">ELEMENTOS:</span>
            <span>{stats.nodes} Nodos • {stats.edges} Elementos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">FPS:</span>
            <span>{stats.fps} fps</span>
          </div>
        </div>

        {/* INSTRUCCIONES RÁPIDAS */}
        <div className="absolute bottom-3 right-3 pointer-events-none text-[9px] font-sans text-[#8A94A6]/70 bg-[#0A0D12]/70 px-2.5 py-1 rounded-md border border-[#252D3D]/50 flex items-center gap-2">
          <span>Arrastra para rotar libre</span>
          <span>•</span>
          <span>Rueda de ratón para Zoom</span>
        </div>

        {/* BOTONES DE ZOOM */}
        <div className="absolute bottom-3 left-16 flex items-center gap-1 bg-[#141822]/80 backdrop-blur-sm p-1 rounded-lg border border-[#252D3D]">
          <button
            onClick={() => setZoom(prev => Math.min(450, prev + 25))}
            className="p-1 text-[#8A94A6] hover:text-white transition-colors cursor-pointer"
            title="Acercar"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(80, prev - 25))}
            className="p-1 text-[#8A94A6] hover:text-white transition-colors cursor-pointer"
            title="Alejar"
          >
            <ZoomOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
