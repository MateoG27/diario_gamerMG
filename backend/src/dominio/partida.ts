/** Margen permitido para fechas ligeramente adelantadas (desfase de reloj entre cliente y servidor). */
const TOLERANCIA_FUTURO_MS = 5 * 60 * 1000;

export interface DatosPartida {
  fecha?: Date;
  duracionMinutos?: number;
}

/**
 * Valida los datos de una partida. Solo revisa los campos presentes, de modo que
 * sirve tanto para crear como para editar parcialmente.
 * Devuelve los mensajes de error en español; lista vacía si los datos son válidos.
 */
export function validarDatosPartida(datos: DatosPartida, ahora: Date): string[] {
  const errores: string[] = [];

  if (datos.duracionMinutos !== undefined && datos.duracionMinutos <= 0)
    errores.push('duracionMinutos debe ser mayor que 0');

  if (
    datos.fecha !== undefined &&
    datos.fecha.getTime() > ahora.getTime() + TOLERANCIA_FUTURO_MS
  )
    errores.push('La fecha de la partida no puede ser futura');

  return errores;
}
