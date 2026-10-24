import { ApiError } from '../apiError';
import { idValido, cuerpo } from '../validacion';
import { Partida, type PartidaDocumento } from '../modelos/Partida.model';
import { Videojuego } from '../modelos/Videojuego.model';

/** `cuerpo` solo admite texto: los campos numéricos se validan aparte, sin modificar el helper. */
function numero(valor: unknown, campo: string): number {
  if (valor === undefined || valor === null || valor === '') throw new ApiError(400, `Falta el campo ${campo}`);
  if (typeof valor !== 'number' || !Number.isFinite(valor)) throw new ApiError(400, `${campo} debe ser un número`);
  return valor;
}

export async function listar(): Promise<PartidaDocumento[]> {
  return Partida.find().sort({ fecha: -1 }).populate('videojuego');
}

export async function listarPorVideojuego(videojuegoId: string): Promise<PartidaDocumento[]> {
  idValido(videojuegoId);
  if (!(await Videojuego.exists({ _id: videojuegoId }))) throw new ApiError(404, 'Videojuego no encontrado');
  return Partida.find({ videojuego: videojuegoId }).sort({ fecha: -1 });
}

export async function crear(body: unknown): Promise<PartidaDocumento> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Se requiere un objeto JSON');
  const { duracionMinutos, porcentajeAvance, ...resto } = body as Record<string, unknown>;
  const datos = cuerpo(resto, ['videojuego', 'fecha', 'notas'], ['videojuego', 'fecha']) as {
    videojuego: string;
    fecha: string;
    notas?: string;
  };

  const duracion = numero(duracionMinutos, 'duracionMinutos');
  const avance = numero(porcentajeAvance, 'porcentajeAvance');
  if (duracion < 0) throw new ApiError(400, 'duracionMinutos no puede ser negativo');

  const fecha = new Date(datos.fecha);
  if (Number.isNaN(fecha.getTime())) throw new ApiError(400, 'fecha inválida');

  // Las referencias no se validan en MongoDB: se comprueba manualmente que el juego exista.
  idValido(datos.videojuego);
  if (!(await Videojuego.exists({ _id: datos.videojuego }))) throw new ApiError(404, 'Videojuego no encontrado');

  return Partida.create({
    videojuego: datos.videojuego,
    fecha,
    duracionMinutos: duracion,
    porcentajeAvance: avance,
    ...(datos.notas !== undefined ? { notas: datos.notas } : {}),
  });
}

export async function eliminar(id: string): Promise<PartidaDocumento> {
  const partida = await Partida.findByIdAndDelete(idValido(id));
  if (!partida) throw new ApiError(404, 'Partida no encontrada');
  return partida;
}
