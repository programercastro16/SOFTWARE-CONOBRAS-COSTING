import React, { useEffect, useRef } from 'react';

// Tipos de geometrías 3D que vuelan en el espacio
type ShapeType = 'cube' | 'tetrahedron' | 'octahedron' | 'prism' | 'icosahedron';

interface Vertex3D {
  x: number;
  y: number;
  z: number;
}

interface Edge3D {
  a: number;
  b: number;
}

interface Floating3DObject {
  // Posición en el espacio 3D (X, Y, Z)
  x: number;
  y: number;
  z: number;
  // Velocidades en el espacio
  vx: number;
  vy: number;
  vz: number;
  // Ángulos de rotación y velocidades de rotación en 3 ejes
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  // Escala y estilo
  size: number;
  type: ShapeType;
  color: string;
  wireColor: string;
  fillAlpha: number;
  // Geometría pre-calculada
  vertices: Vertex3D[];
  edges: Edge3D[];
  faces: number[][];
}

// Generadores de formas tridimensionales
function createShapeGeometry(type: ShapeType, size: number): { vertices: Vertex3D[]; edges: Edge3D[]; faces: number[][] } {
  if (type === 'cube') {
    const s = size;
    const vertices: Vertex3D[] = [
      { x: -s, y: -s, z: -s },
      { x: s, y: -s, z: -s },
      { x: s, y: s, z: -s },
      { x: -s, y: s, z: -s },
      { x: -s, y: -s, z: s },
      { x: s, y: -s, z: s },
      { x: s, y: s, z: s },
      { x: -s, y: s, z: s }
    ];
    const edges: Edge3D[] = [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 0 },
      { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 4 },
      { a: 0, b: 4 }, { a: 1, b: 5 }, { a: 2, b: 6 }, { a: 3, b: 7 }
    ];
    const faces = [
      [0, 1, 2, 3], [4, 5, 6, 7],
      [0, 1, 5, 4], [2, 3, 7, 6],
      [1, 2, 6, 5], [0, 3, 7, 4]
    ];
    return { vertices, edges, faces };
  }

  if (type === 'octahedron') {
    const s = size * 1.3;
    const vertices: Vertex3D[] = [
      { x: 0, y: -s, z: 0 },
      { x: s, y: 0, z: 0 },
      { x: 0, y: 0, z: s },
      { x: -s, y: 0, z: 0 },
      { x: 0, y: 0, z: -s },
      { x: 0, y: s, z: 0 }
    ];
    const edges: Edge3D[] = [
      { a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 },
      { a: 5, b: 1 }, { a: 5, b: 2 }, { a: 5, b: 3 }, { a: 5, b: 4 },
      { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }, { a: 4, b: 1 }
    ];
    const faces = [
      [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
      [5, 1, 2], [5, 2, 3], [5, 3, 4], [5, 4, 1]
    ];
    return { vertices, edges, faces };
  }

  if (type === 'tetrahedron') {
    const s = size * 1.4;
    const vertices: Vertex3D[] = [
      { x: s, y: s, z: s },
      { x: -s, y: -s, z: s },
      { x: -s, y: s, z: -s },
      { x: s, y: -s, z: -s }
    ];
    const edges: Edge3D[] = [
      { a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 },
      { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 1 }
    ];
    const faces = [
      [0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 2, 3]
    ];
    return { vertices, edges, faces };
  }

  if (type === 'prism') {
    const s = size;
    const h = size * 1.5;
    const vertices: Vertex3D[] = [
      // Base inferior (triángulo)
      { x: 0, y: -h, z: s * 1.2 },
      { x: s, y: -h, z: -s * 0.6 },
      { x: -s, y: -h, z: -s * 0.6 },
      // Base superior (triángulo)
      { x: 0, y: h, z: s * 1.2 },
      { x: s, y: h, z: -s * 0.6 },
      { x: -s, y: h, z: -s * 0.6 }
    ];
    const edges: Edge3D[] = [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 0 },
      { a: 3, b: 4 }, { a: 4, b: 5 }, { a: 5, b: 3 },
      { a: 0, b: 3 }, { a: 1, b: 4 }, { a: 2, b: 5 }
    ];
    const faces = [
      [0, 1, 2], [3, 4, 5],
      [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]
    ];
    return { vertices, edges, faces };
  }

  // Icosaedro simplificado (Diamante Arquitectónico)
  const phi = (1 + Math.sqrt(5)) / 2;
  const s = size * 0.8;
  const vertices: Vertex3D[] = [
    { x: -s, y: phi * s, z: 0 },
    { x: s, y: phi * s, z: 0 },
    { x: -s, y: -phi * s, z: 0 },
    { x: s, y: -phi * s, z: 0 },
    { x: 0, y: -s, z: phi * s },
    { x: 0, y: s, z: phi * s },
    { x: 0, y: -s, z: -phi * s },
    { x: 0, y: s, z: -phi * s },
    { x: phi * s, y: 0, z: -s },
    { x: phi * s, y: 0, z: s },
    { x: -phi * s, y: 0, z: -s },
    { x: -phi * s, y: 0, z: s }
  ];
  const edges: Edge3D[] = [
    { a: 0, b: 11 }, { a: 0, b: 5 }, { a: 0, b: 1 }, { a: 0, b: 7 }, { a: 0, b: 10 },
    { a: 1, b: 5 }, { a: 5, b: 11 }, { a: 11, b: 10 }, { a: 10, b: 7 }, { a: 7, b: 1 },
    { a: 3, b: 9 }, { a: 3, b: 4 }, { a: 3, b: 2 }, { a: 3, b: 6 }, { a: 3, b: 8 },
    { a: 4, b: 9 }, { a: 9, b: 8 }, { a: 8, b: 6 }, { a: 6, b: 2 }, { a: 2, b: 4 },
    { a: 4, b: 5 }, { a: 5, b: 9 }, { a: 9, b: 1 }, { a: 1, b: 8 }, { a: 8, b: 7 },
    { a: 7, b: 6 }, { a: 6, b: 10 }, { a: 10, b: 2 }, { a: 2, b: 11 }, { a: 11, b: 4 }
  ];
  return { vertices, edges, faces: [] };
}

export const AmbientBackground3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalizar coordenadas del cursor entre -1 y 1
      mouseRef.current.targetX = (e.clientX / width - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / height - 0.5) * 2;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 1. ESTRELLAS / PARTÍCULAS ESPACIALES ARQUITECTÓNICAS (Polvo flotante)
    const starCount = 65;
    const stars: { x: number; y: number; z: number; size: number; alpha: number; color: string }[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1200,
        z: Math.random() * 900 + 100,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.4 + 0.2,
        color: Math.random() > 0.55 ? '#D4AF37' : '#38BDF8'
      });
    }

    // 2. OBJETOS 3D VOLANDO EN EL ESPACIO ARQUITECTÓNICO
    const types: ShapeType[] = ['cube', 'octahedron', 'tetrahedron', 'prism', 'icosahedron'];
    const colors = [
      { wire: '#D4AF37', fill: 'rgba(212, 175, 55, 0.04)' }, // Oro Conobras
      { wire: '#38BDF8', fill: 'rgba(56, 189, 248, 0.04)' }, // Cian Arquitectura
      { wire: '#F3C769', fill: 'rgba(243, 199, 105, 0.03)' }, // Ámbar
      { wire: '#A78BFA', fill: 'rgba(167, 139, 250, 0.03)' }  // Titanio
    ];

    const objects: Floating3DObject[] = [];
    const numObjects = 16; // Objetos 3D flotando a diferentes profundidades

    for (let i = 0; i < numObjects; i++) {
      const type = types[i % types.length];
      const colorScheme = colors[i % colors.length];
      const size = Math.random() * 24 + 22; // Tamaño geométrico
      const { vertices, edges, faces } = createShapeGeometry(type, size);

      objects.push({
        x: (Math.random() - 0.5) * 1400,
        y: (Math.random() - 0.5) * 1000,
        z: Math.random() * 800 + 150, // Profundidad Z en el espacio
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.5,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.009,
        vRotY: (Math.random() - 0.5) * 0.011,
        vRotZ: (Math.random() - 0.5) * 0.008,
        size,
        type,
        color: colorScheme.fill,
        wireColor: colorScheme.wire,
        fillAlpha: 0.04,
        vertices,
        edges,
        faces
      });
    }

    // Parámetros de cámara 3D
    const fov = 420;
    let cameraAngleX = 0;
    let cameraAngleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Inercia de cámara con seguimiento suave del ratón
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      cameraAngleY = mouseRef.current.x * 0.25; // Ángulo de giro horizontal
      cameraAngleX = -mouseRef.current.y * 0.2; // Ángulo de giro vertical

      const cosCamY = Math.cos(cameraAngleY);
      const sinCamY = Math.sin(cameraAngleY);
      const cosCamX = Math.cos(cameraAngleX);
      const sinCamX = Math.sin(cameraAngleX);

      const cx = width / 2;
      const cy = height / 2;

      // 1. DIBUJAR ESTRELLAS Y POLVO CÓSMICO EN PROFUNDIDAD
      stars.forEach((star) => {
        // Mover lentamente las estrellas hacia la pantalla
        star.z -= 0.35;
        if (star.z < 60) star.z = 950;

        // Rotación con cámara
        const x1 = star.x * cosCamY + star.z * sinCamY;
        const z1 = -star.x * sinCamY + star.z * cosCamY;
        const y1 = star.y * cosCamX - z1 * sinCamX;
        const z2 = star.y * sinCamX + z1 * cosCamX;

        if (z2 > 50) {
          const scale = fov / z2;
          const px = cx + x1 * scale;
          const py = cy + y1 * scale;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const alpha = Math.min(star.alpha, (1 - z2 / 1000) * 0.6);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = Math.max(0.08, alpha);
            ctx.beginPath();
            ctx.arc(px, py, star.size * scale * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // 2. ACTUALIZAR Y DIBUJAR OBJETOS 3D VOLANDO
      // Ordenar por profundidad Z (Pintor: los más lejanos primero)
      objects.sort((a, b) => b.z - a.z);

      objects.forEach((obj) => {
        // Movimiento físico espacial y rebote suave en bordes tridimensionales
        obj.x += obj.vx;
        obj.y += obj.vy;
        obj.z += obj.vz;

        if (obj.x < -800 || obj.x > 800) obj.vx *= -1;
        if (obj.y < -600 || obj.y > 600) obj.vy *= -1;
        if (obj.z < 120 || obj.z > 950) obj.vz *= -1;

        // Rotación continua en sus 3 ejes espaciales
        obj.rotX += obj.vRotX;
        obj.rotY += obj.vRotY;
        obj.rotZ += obj.vRotZ;

        const cosX = Math.cos(obj.rotX);
        const sinX = Math.sin(obj.rotX);
        const cosY = Math.cos(obj.rotY);
        const sinY = Math.sin(obj.rotY);
        const cosZ = Math.cos(obj.rotZ);
        const sinZ = Math.sin(obj.rotZ);

        // Proyectar vértices del objeto en el espacio
        const projectedVertices: { px: number; py: number; z: number }[] = [];

        for (let i = 0; i < obj.vertices.length; i++) {
          const v = obj.vertices[i];

          // Rotación intrínseca del objeto (Pitch, Yaw, Roll)
          // Rotación X
          const y1 = v.y * cosX - v.z * sinX;
          const z1 = v.y * sinX + v.z * cosX;
          // Rotación Y
          const x2 = v.x * cosY + z1 * sinY;
          const z2 = -v.x * sinY + z1 * cosY;
          // Rotación Z
          const x3 = x2 * cosZ - y1 * sinZ;
          const y3 = x2 * sinZ + y1 * cosZ;

          // Posición global en el mundo
          const worldX = obj.x + x3;
          const worldY = obj.y + y3;
          const worldZ = obj.z + z2;

          // Transformación de cámara espacial (Parallax del cursor)
          const camX = worldX * cosCamY + worldZ * sinCamY;
          const camZ1 = -worldX * sinCamY + worldZ * cosCamY;
          const camY = worldY * cosCamX - camZ1 * sinCamX;
          const camZFinal = worldY * sinCamX + camZ1 * cosCamX;

          if (camZFinal > 40) {
            const scale = fov / camZFinal;
            projectedVertices.push({
              px: cx + camX * scale,
              py: cy + camY * scale,
              z: camZFinal
            });
          }
        }

        if (projectedVertices.length < obj.vertices.length) return;

        // Transparencia por distancia cósmica
        const depthFactor = Math.max(0.15, Math.min(1.0, 1.1 - obj.z / 950));
        const edgeAlpha = depthFactor * 0.45;
        const nodeAlpha = depthFactor * 0.75;

        // A. Caras sombreadas translúcidas
        if (obj.faces.length > 0) {
          ctx.fillStyle = obj.color;
          ctx.globalAlpha = depthFactor * 0.05;
          obj.faces.forEach((face) => {
            if (face.length >= 3) {
              ctx.beginPath();
              ctx.moveTo(projectedVertices[face[0]].px, projectedVertices[face[0]].py);
              for (let f = 1; f < face.length; f++) {
                ctx.lineTo(projectedVertices[face[f]].px, projectedVertices[face[f]].py);
              }
              ctx.closePath();
              ctx.fill();
            }
          });
        }

        // B. Aristas 3D luminosas (Wireframe)
        ctx.strokeStyle = obj.wireColor;
        ctx.globalAlpha = edgeAlpha;
        ctx.lineWidth = Math.max(0.8, 1.8 * depthFactor);

        obj.edges.forEach((edge) => {
          const p1 = projectedVertices[edge.a];
          const p2 = projectedVertices[edge.b];
          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        });

        // C. Nodos / Vértices brillantes con halos de luz
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = nodeAlpha;
        projectedVertices.forEach((p) => {
          const nodeRadius = Math.max(1.2, 2.8 * depthFactor);
          ctx.beginPath();
          ctx.arc(p.px, p.py, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none">
      {/* AURORA GLOW AMBIENTAL: Nebulosa de fondo dorado y cian */}
      <div 
        className="absolute -top-[25%] -left-[15%] w-[65vw] h-[65vw] rounded-full bg-[#D4AF37]/5 blur-[140px] animate-pulse-slow pointer-events-none"
      />
      <div 
        className="absolute top-[35%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-[#38BDF8]/4 blur-[150px] pointer-events-none"
      />
      <div 
        className="absolute -bottom-[20%] left-[25%] w-[70vw] h-[70vw] rounded-full bg-[#D4AF37]/4 blur-[160px] animate-pulse-slow pointer-events-none"
      />

      {/* LIENZO 3D DEL ESPACIO CON OBJETOS GEOMÉTRICOS VOLANDO */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-90" 
      />
    </div>
  );
};
