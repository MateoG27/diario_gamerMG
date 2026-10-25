export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Valor inicial para `<input type="datetime-local">` (hora local actual). */
export function ahoraLocalInput(): string {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 16);
}
