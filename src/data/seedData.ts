import { Insumo, ConfiguracionEmpresa, Cotizacion } from '../types';

export const DEFAULT_CONFIG: ConfiguracionEmpresa = {
  nombreEmpresa: 'Conobras',
  eslogan: 'Construcción + Arquitectura',
  arquitecto: 'Arq. Thomas Castro',
  cedulaProfesional: 'CED-ARQ-893421',
  telefono: '+52 55 4123 9876',
  email: 'contacto@conobras.com',
  direccion: 'Av. Arquitectura 1050, Suite 4B',
  sitioWeb: 'www.conobras.com',
  monedaSimbolo: '$',
  porcentajeImprevistosDefault: 5,
  porcentajeGastosGeneralesDefault: 8,
  porcentajeHonorariosDefault: 15,
  porcentajeIvaDefault: 16
};

export const SEED_INSUMOS: Insumo[] = [
  // MATERIALES
  {
    id: 'mat-001',
    codigo: 'MAT-CEM-01',
    descripcion: 'Cemento Gris Portland CPC 30R (Saco 50 kg)',
    categoria: 'MATERIAL',
    unidad: 'saco',
    precioUnitario: 245.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'mat-002',
    codigo: 'MAT-VAR-03',
    descripcion: 'Varilla Corrugada #3 (3/8") Grado 42',
    categoria: 'MATERIAL',
    unidad: 'tramo',
    precioUnitario: 168.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'mat-003',
    codigo: 'MAT-VAR-04',
    descripcion: 'Varilla Corrugada #4 (1/2") Grado 42',
    categoria: 'MATERIAL',
    unidad: 'tramo',
    precioUnitario: 295.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'mat-004',
    codigo: 'MAT-ARE-01',
    descripcion: 'Arena gruesa de mina triturada',
    categoria: 'MATERIAL',
    unidad: 'm3',
    precioUnitario: 480.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'mat-005',
    codigo: 'MAT-GRA-01',
    descripcion: 'Grava triturada 3/4" de mina',
    categoria: 'MATERIAL',
    unidad: 'm3',
    precioUnitario: 520.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'mat-006',
    codigo: 'MAT-CONC-250',
    descripcion: 'Concreto Premezclado f\'c=250 kg/cm2 t.m.a 3/4" bombeable',
    categoria: 'MATERIAL',
    unidad: 'm3',
    precioUnitario: 2850.00,
    fechaActualizacion: '2026-09-15'
  },
  {
    id: 'mat-007',
    codigo: 'MAT-TAB-ROJO',
    descripcion: 'Tabique rojo recocido artesanal 7x14x28 cm',
    categoria: 'MATERIAL',
    unidad: 'millar',
    precioUnitario: 4200.00,
    fechaActualizacion: '2026-09-10'
  },
  {
    id: 'mat-008',
    codigo: 'MAT-PORC-MAR',
    descripcion: 'Porcelanato rectificado importado 60x120 cm Calacatta Gold',
    categoria: 'MATERIAL',
    unidad: 'm2',
    precioUnitario: 780.00,
    fechaActualizacion: '2026-09-20'
  },
  {
    id: 'mat-009',
    codigo: 'MAT-YESO-01',
    descripcion: 'Yeso supremo para acabados interiores (Bulto 40 kg)',
    categoria: 'MATERIAL',
    unidad: 'bulto',
    precioUnitario: 125.00,
    fechaActualizacion: '2026-09-05'
  },
  {
    id: 'mat-010',
    codigo: 'MAT-PINT-VIN',
    descripcion: 'Pintura Vinil-Acrílica satinada lavable alta gama (Cubeta 19L)',
    categoria: 'MATERIAL',
    unidad: 'cubeta',
    precioUnitario: 2650.00,
    fechaActualizacion: '2026-09-18'
  },

  // MANO DE OBRA / CUADRILLAS
  {
    id: 'mo-001',
    codigo: 'MO-CUAD-01',
    descripcion: 'Cuadrilla #1 (1 Oficial Albañil + 1 Peón)',
    categoria: 'MANO_DE_OBRA',
    unidad: 'jornal',
    precioUnitario: 1150.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'mo-002',
    codigo: 'MO-CUAD-02',
    descripcion: 'Cuadrilla #2 (1 Oficial Fierrero + 1 Ayudante)',
    categoria: 'MANO_DE_OBRA',
    unidad: 'jornal',
    precioUnitario: 1200.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'mo-003',
    codigo: 'MO-CUAD-03',
    descripcion: 'Cuadrilla #3 (1 Oficial Yesero / Tablarroquero + 1 Ayudante)',
    categoria: 'MANO_DE_OBRA',
    unidad: 'jornal',
    precioUnitario: 1250.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'mo-004',
    codigo: 'MO-CUAD-04',
    descripcion: 'Cuadrilla #4 (1 Oficial Electricista especialista)',
    categoria: 'MANO_DE_OBRA',
    unidad: 'jornal',
    precioUnitario: 950.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'mo-005',
    codigo: 'MO-PEON-01',
    descripcion: 'Peón general de apoyo y acarreos',
    categoria: 'MANO_DE_OBRA',
    unidad: 'jornal',
    precioUnitario: 450.00,
    fechaActualizacion: '2026-09-01'
  },

  // EQUIPOS Y MAQUINARIA
  {
    id: 'eq-001',
    codigo: 'EQ-REV-01',
    descripcion: 'Revolvedora de concreto 1 saco con motor a gasolina 9HP',
    categoria: 'EQUIPO',
    unidad: 'semana',
    precioUnitario: 2200.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'eq-002',
    codigo: 'EQ-AND-01',
    descripcion: 'Andamio tubular estándar marco y tijera (renta semanal)',
    categoria: 'EQUIPO',
    unidad: 'semana',
    precioUnitario: 180.00,
    fechaActualizacion: '2026-09-01'
  },
  {
    id: 'eq-003',
    codigo: 'EQ-RET-VOLT',
    descripcion: 'Camión de volteo 7m3 para desalojo de escombros a tiro oficial',
    categoria: 'EQUIPO',
    unidad: 'viaje',
    precioUnitario: 1450.00,
    fechaActualizacion: '2026-09-12'
  },

  // SUBCONTRATOS / ESPECIALIDADES
  {
    id: 'sub-001',
    codigo: 'SUB-CANC-ALUM',
    descripcion: 'Cancelería de aluminio línea Eurovent serie 70 con cristal templado 6mm',
    categoria: 'SUBCONTRATO',
    unidad: 'm2',
    precioUnitario: 3400.00,
    fechaActualizacion: '2026-09-15'
  },
  {
    id: 'sub-002',
    codigo: 'SUB-CARP-CLOSET',
    descripcion: 'Carpintería fina en madera de nogal y chapa natural según diseño arquitectónico',
    categoria: 'SUBCONTRATO',
    unidad: 'ml',
    precioUnitario: 6800.00,
    fechaActualizacion: '2026-09-20'
  }
];

export const SAMPLE_COTIZACION: Cotizacion = {
  id: 'cot-001',
  codigo: 'CNB-2026-001',
  cliente: 'Ing. Rodrigo Mendoza',
  telefono: '+52 55 3344 5566',
  email: 'r.mendoza@inmobiliariaprimus.mx',
  proyecto: 'Residencia Vista Bosque - Ampliación & Terraza Roof Garden',
  ubicacion: 'Privada Cumbres #108, Huixquilucan',
  fecha: new Date().toISOString().split('T')[0],
  validezDias: 15,
  moneda: '$',
  porcentajeImprevistos: 5,
  porcentajeGastosGenerales: 8,
  porcentajeHonorarios: 15,
  aplicaIva: false,
  porcentajeIva: 16,
  notas: '1. Los precios se mantendrán fijos durante el periodo de vigencia indicado.\n2. Incluye mano de obra calificada, equipo de protección, limpieza diaria y retiro de escombros.\n3. Esquema de pago: 40% Anticipo a la firma de contrato, 50% en 4 estimaciones quincenales según avance físico, 10% Finiquito contra entrega de obra.',
  estado: 'PRESENTADA',
  creadoEn: '2026-09-25T10:00:00.000Z',
  actualizadoEn: '2026-09-25T14:30:00.000Z',
  partidas: [
    {
      id: 'part-01',
      titulo: '1. TRABAJOS PRELIMINARES Y DEMOLICIÓN',
      items: [
        {
          id: 'item-1',
          insumoId: 'mo-001',
          descripcion: 'Trazo, nivelación topográfica y protección perimetral con plástico negro y triplay',
          categoria: 'MANO_DE_OBRA',
          unidad: 'm2',
          cantidad: 85,
          precioUnitario: 65.00
        },
        {
          id: 'item-2',
          insumoId: 'mo-005',
          descripcion: 'Demolición controlada de piso de concreto existente e=10cm a mano y marro',
          categoria: 'MANO_DE_OBRA',
          unidad: 'm2',
          cantidad: 42,
          precioUnitario: 145.00
        },
        {
          id: 'item-3',
          insumoId: 'eq-003',
          descripcion: 'Retiro y desalojo de escombro producto de demolición en camión volteo 7m3',
          categoria: 'EQUIPO',
          unidad: 'viaje',
          cantidad: 2,
          precioUnitario: 1450.00
        }
      ]
    },
    {
      id: 'part-02',
      titulo: '2. ESTRUCTURA METÁLICA Y LOSA ALIGERADA',
      items: [
        {
          id: 'item-4',
          insumoId: 'mat-003',
          descripcion: 'Suministro y habilitado de perfil IPR 8"x4" para columnas y vigas de soporte',
          categoria: 'MATERIAL',
          unidad: 'kg',
          cantidad: 950,
          precioUnitario: 48.00
        },
        {
          id: 'item-5',
          insumoId: 'mat-006',
          descripcion: 'Firme de concreto premezclado f\'c=250 kg/cm2 bombeado con losacero cal. 22',
          categoria: 'MATERIAL',
          unidad: 'm2',
          cantidad: 45,
          precioUnitario: 1120.00
        }
      ]
    },
    {
      id: 'part-03',
      titulo: '3. ACABADOS ARQUITECTÓNICOS DE ALTA GAMA',
      items: [
        {
          id: 'item-6',
          insumoId: 'mat-008',
          descripcion: 'Suministro e instalación de porcelanato rectificado 60x120cm Calacatta Gold sobre adhesivo PSP',
          categoria: 'MATERIAL',
          unidad: 'm2',
          cantidad: 45,
          precioUnitario: 1250.00
        },
        {
          id: 'item-7',
          insumoId: 'sub-001',
          descripcion: 'Cancelería perimetral de cristal templado 10mm con herrajes de acero inoxidable satinado',
          categoria: 'SUBCONTRATO',
          unidad: 'ml',
          cantidad: 14.5,
          precioUnitario: 3800.00
        }
      ]
    }
  ]
};
