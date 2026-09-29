export type InsumoCategoria = 'MATERIAL' | 'MANO_DE_OBRA' | 'EQUIPO' | 'SUBCONTRATO';

export interface Insumo {
  id: string;
  codigo: string;
  descripcion: string;
  categoria: InsumoCategoria;
  unidad: string; // m2, ml, m3, kg, pza, glb, jor, etc.
  precioUnitario: number;
  fechaActualizacion: string;
}

export interface ItemPartida {
  id: string;
  insumoId?: string;
  descripcion: string;
  categoria: InsumoCategoria;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Partida {
  id: string;
  titulo: string;
  items: ItemPartida[];
}

export interface CalculosPresupuesto {
  partidasCalculadas: Array<Partida & { subtotal: number }>;
  costoDirectoTotal: number;
  montoImprevistos: number;
  montoGastosGenerales: number;
  subtotalOperativo: number;
  montoHonorarios: number;
  subtotalAntesIva: number;
  montoIva: number;
  totalFinal: number;
}

export type EstadoCotizacion = 'BORRADOR' | 'PRESENTADA' | 'APROBADA' | 'RECHAZADA';

export interface Cotizacion {
  id: string;
  codigo: string;
  cliente: string;
  telefono: string;
  email: string;
  proyecto: string;
  ubicacion: string;
  fecha: string;
  validezDias: number;
  moneda: string;
  
  // Parámetros porcentuales
  porcentajeImprevistos: number;
  porcentajeGastosGenerales: number;
  porcentajeHonorarios: number; // Honorarios de diseño & dirección técnica
  aplicaIva: boolean;
  porcentajeIva: number;
  
  partidas: Partida[];
  notas: string;
  estado: EstadoCotizacion;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  empresa?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
}

export interface ConfiguracionEmpresa {
  nombreEmpresa: string;
  eslogan: string;
  arquitecto: string;
  cedulaProfesional?: string;
  telefono: string;
  email: string;
  direccion: string;
  sitioWeb?: string;
  monedaSimbolo: string;
  porcentajeImprevistosDefault: number;
  porcentajeGastosGeneralesDefault: number;
  porcentajeHonorariosDefault: number;
  porcentajeIvaDefault: number;
}
