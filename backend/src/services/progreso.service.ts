import { ApiError } from '../apiError';
import { idValido } from '../validacion';
import { Videojuego } from '../modelos/Videojuego.model';
import { Meta } from '../modelos/Meta.model';
import { Partida } from '../modelos/Partida.model';
import {
  ZONA,
  diaEcuador,
  semanaEcuador,
  calcularProgresoSemanal,
  calcularRacha,
  estadoHitos,
  type EstadoHito,
  type SemanaEcuador,
} from '../dominio/progreso';

export interface ProgresoSemanalRespuesta {
  videojuego: string;
  zona: string;
  hoy: string;
  semana: SemanaEcuador;
  meta: { _id: string; horasSemana: number; diasSemana: number } | null;
  horasJugadas: number;
  diasJugados: number;
  porcentajeHoras: number | null;
  cumplida: boolean | null;
  racha: { actual: number; mejor: number };
  avanceActual: number;
  hitos: EstadoHito[];
}

export async function obtenerProgresoSemanal(
  id: string
): Promise<ProgresoSemanalRespuesta> {
  idValido(id);
  if (!(await Videojuego.exists({ _id: id })))
    throw new ApiError(404, 'Videojuego no encontrado');

  // Única lectura del reloj: el dominio recibe `ahora` como parámetro.
  const ahora = new Date();

  const meta = await Meta.findOne({ videojuego: id, activa: true });
  // Más reciente primero; createdAt desempata partidas con la misma fecha.
  const partidas = await Partida.find({ videojuego: id }).sort({
    fecha: -1,
    createdAt: -1,
  });

  const progreso = calcularProgresoSemanal(partidas, meta, ahora);
  const racha = calcularRacha(partidas, ahora);
  const avanceActual = partidas[0]?.porcentajeAvance ?? 0;

  return {
    videojuego: id,
    zona: ZONA,
    hoy: diaEcuador(ahora),
    semana: semanaEcuador(ahora),
    meta: meta
      ? {
          _id: String(meta._id),
          horasSemana: meta.horasSemana,
          diasSemana: meta.diasSemana,
        }
      : null,
    horasJugadas: progreso.horasJugadas,
    diasJugados: progreso.diasJugados,
    porcentajeHoras: progreso.porcentajeHoras,
    cumplida: progreso.cumplida,
    racha,
    avanceActual,
    hitos: meta ? estadoHitos(meta.hitos, avanceActual) : [],
  };
}
