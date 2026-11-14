export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Valor inicial para `<input type="datetime-local">` (hora local actual). */
export function ahoraLocalInput(): string {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 16);
}

/** Horas con coma decimal y unidad: `1,5 h`, `6 h`. */
export function formatearHoras(horas: number): string {
  const redondeado = Math.round(horas * 100) / 100;
  return `${String(redondeado).replace('.', ',')} h`;
}

const MESES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

/**
 * Fecha de calendario `AAAA-MM-DD` -> `9 nov 2026`.
 * No usa `new Date(...)` para que no se desplace un día por la zona horaria (H10).
 */
export function formatearFechaCalendario(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  const nombreMes = MESES[Number(mes) - 1];
  if (!anio || !nombreMes || !dia) return fecha;
  return `${Number(dia)} ${nombreMes} ${anio}`;
}
