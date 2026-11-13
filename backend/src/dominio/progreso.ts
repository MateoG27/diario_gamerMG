// Dominio de progreso semanal (E2). Solo firmas: la lógica se implementa en T-03.

export const ZONA = 'America/Guayaquil';

export interface PartidaConDuracion {
  fecha: Date;
  duracionMinutos: number;
}

export interface PartidaConFecha {
  fecha: Date;
}

export interface MetaCalculo {
  horasSemana: number;
  diasSemana: number;
}

export interface SemanaEcuador {
  inicio: string;
  fin: string;
}

export interface ProgresoSemanal {
  horasJugadas: number;
  diasJugados: number;
  porcentajeHoras: number | null;
  cumplida: boolean | null;
}

export interface Racha {
  actual: number;
  mejor: number;
}

export interface EstadoHito {
  porcentaje: number;
  alcanzado: boolean;
}

const NO_IMPLEMENTADO = 'No implementado (T-03)';

export function diaEcuador(fecha: Date): string {
  throw new Error(NO_IMPLEMENTADO);
}

export function semanaEcuador(ahora: Date): SemanaEcuador {
  throw new Error(NO_IMPLEMENTADO);
}

export function calcularProgresoSemanal(
  partidas: PartidaConDuracion[],
  meta: MetaCalculo | null,
  ahora: Date
): ProgresoSemanal {
  throw new Error(NO_IMPLEMENTADO);
}

export function calcularRacha(partidas: PartidaConFecha[], ahora: Date): Racha {
  throw new Error(NO_IMPLEMENTADO);
}

export function estadoHitos(hitos: number[], avanceActual: number): EstadoHito[] {
  throw new Error(NO_IMPLEMENTADO);
}
