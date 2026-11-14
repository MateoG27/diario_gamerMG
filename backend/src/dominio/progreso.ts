// Dominio de progreso semanal (E2). Funciones puras: no leen el reloj ni la base de datos.
// La zona horaria (America/Guayaquil) se resuelve solo aquí; la hora actual entra como `ahora`.

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

const MS_POR_DIA = 86_400_000;

const formateadorDia = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function partesDia(dia: string): [number, number, number] {
  const [y, m, d] = dia.split('-').map(Number);
  return [y, m, d];
}

// Número de día de calendario (aritmética sobre fechas AAAA-MM-DD, sin reloj).
function numeroDia(dia: string): number {
  const [y, m, d] = partesDia(dia);
  return Date.UTC(y, m - 1, d) / MS_POR_DIA;
}

function sumarDias(dia: string, n: number): string {
  const [y, m, d] = partesDia(dia);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function diaEcuador(fecha: Date): string {
  const partes = formateadorDia.formatToParts(fecha);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  return `${valor('year')}-${valor('month')}-${valor('day')}`;
}

export function semanaEcuador(ahora: Date): SemanaEcuador {
  const hoy = diaEcuador(ahora);
  const [y, m, d] = partesDia(hoy);
  const diaSemana = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
  const inicio = sumarDias(hoy, -((diaSemana + 6) % 7));
  return { inicio, fin: sumarDias(inicio, 6) };
}

export function calcularProgresoSemanal(
  partidas: PartidaConDuracion[],
  meta: MetaCalculo | null,
  ahora: Date
): ProgresoSemanal {
  const { inicio, fin } = semanaEcuador(ahora);
  let minutos = 0;
  const dias = new Set<string>();

  for (const partida of partidas) {
    const dia = diaEcuador(partida.fecha);
    if (dia >= inicio && dia <= fin) {
      minutos += partida.duracionMinutos;
      dias.add(dia);
    }
  }

  const horasJugadas = Math.round((minutos / 60) * 10) / 10;
  const diasJugados = dias.size;

  if (!meta) {
    return { horasJugadas, diasJugados, porcentajeHoras: null, cumplida: null };
  }

  const minutosMeta = meta.horasSemana * 60;
  return {
    horasJugadas,
    diasJugados,
    porcentajeHoras: Math.min(100, Math.floor((minutos * 100) / minutosMeta)),
    cumplida: minutos >= minutosMeta && diasJugados >= meta.diasSemana,
  };
}

export function calcularRacha(partidas: PartidaConFecha[], ahora: Date): Racha {
  const dias = [...new Set(partidas.map((p) => numeroDia(diaEcuador(p.fecha))))].sort(
    (a, b) => a - b
  );
  if (dias.length === 0) return { actual: 0, mejor: 0 };

  let mejor = 1;
  let corrida = 1;
  for (let i = 1; i < dias.length; i++) {
    corrida = dias[i] - dias[i - 1] === 1 ? corrida + 1 : 1;
    if (corrida > mejor) mejor = corrida;
  }

  // `corrida` es ahora la racha que termina en el último día jugado.
  const hoy = numeroDia(diaEcuador(ahora));
  const ultimo = dias[dias.length - 1];
  const actual = hoy - ultimo <= 1 ? corrida : 0;

  return { actual, mejor: Math.max(mejor, actual) };
}

export function estadoHitos(hitos: number[], avanceActual: number): EstadoHito[] {
  return [...hitos]
    .sort((a, b) => a - b)
    .map((porcentaje) => ({ porcentaje, alcanzado: avanceActual >= porcentaje }));
}
