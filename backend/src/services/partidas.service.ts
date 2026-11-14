import { ApiError } from '../apiError';
import { idValido, cuerpo } from '../validacion';
import { validarDatosPartida } from '../dominio/partida';
import { Partida, type PartidaDocumento } from '../modelos/Partida.model';
import { Videojuego } from '../modelos/Videojuego.model';

/** `cuerpo` solo admite texto: los campos numéricos se validan aparte, sin modificar el helper. */
function numero(valor: unknown, campo: string): number {
  if (valor === undefined || valor === null || valor === '')
    throw new ApiError(400, `Falta el campo ${campo}`);
  if (typeof valor !== 'number' || !Number.isFinite(valor))
    throw new ApiError(400, `${campo} debe ser un número`);
  return valor;
}

export async function listar(): Promise<PartidaDocumento[]> {
  return Partida.find().sort({ fecha: -1 }).populate('videojuego');
}

export async function listarPorVideojuego(
  videojuegoId: string
): Promise<PartidaDocumento[]> {
  idValido(videojuegoId);
  if (!(await Videojuego.exists({ _id: videojuegoId })))
    throw new ApiError(404, 'Videojuego no encontrado');
  return Partida.find({ videojuego: videojuegoId }).sort({ fecha: -1 });
}

export async function crear(body: unknown): Promise<PartidaDocumento> {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new ApiError(400, 'Se requiere un objeto JSON');
  const { duracionMinutos, porcentajeAvance, ...resto } = body as Record<
    string,
    unknown
  >;
  const datos = cuerpo(
    resto,
    ['videojuego', 'fecha', 'notas'],
    ['videojuego', 'fecha']
  ) as {
    videojuego: string;
    fecha: string;
    notas?: string;
  };

  const duracion = numero(duracionMinutos, 'duracionMinutos');
  const avance = numero(porcentajeAvance, 'porcentajeAvance');

  const fecha = new Date(datos.fecha);
  if (Number.isNaN(fecha.getTime())) throw new ApiError(400, 'fecha inválida');

  const errores = validarDatosPartida(
    { fecha, duracionMinutos: duracion },
    new Date()
  );
  if (errores.length) throw new ApiError(400, errores[0]);

  // Las referencias no se validan en MongoDB: se comprueba manualmente que el juego exista.
  idValido(datos.videojuego);
  if (!(await Videojuego.exists({ _id: datos.videojuego })))
    throw new ApiError(404, 'Videojuego no encontrado');

  return Partida.create({
    videojuego: datos.videojuego,
    fecha,
    duracionMinutos: duracion,
    porcentajeAvance: avance,
    ...(datos.notas !== undefined ? { notas: datos.notas } : {}),
  });
}

/** Edición parcial (D-2): solo se validan los campos que llegan. La partida no cambia de videojuego. */
export async function actualizar(
  id: string,
  body: unknown
): Promise<PartidaDocumento> {
  idValido(id);
  const datos = cuerpo(body, [
    'fecha',
    'duracionMinutos',
    'porcentajeAvance',
    'notas',
  ]) as {
    fecha?: string | null;
    duracionMinutos?: number;
    porcentajeAvance?: number;
    notas?: string | null;
  };

  const cambios: {
    fecha?: Date;
    duracionMinutos?: number;
    porcentajeAvance?: number;
    notas?: string | null;
  } = {};

  if ('fecha' in datos) {
    const fecha = datos.fecha ? new Date(datos.fecha) : null;
    if (!fecha || Number.isNaN(fecha.getTime()))
      throw new ApiError(400, 'fecha inválida');
    cambios.fecha = fecha;
  }
  if (datos.duracionMinutos !== undefined)
    cambios.duracionMinutos = datos.duracionMinutos;
  if (datos.porcentajeAvance !== undefined)
    cambios.porcentajeAvance = datos.porcentajeAvance;
  if (datos.notas !== undefined) cambios.notas = datos.notas;

  const errores = validarDatosPartida(
    { fecha: cambios.fecha, duracionMinutos: cambios.duracionMinutos },
    new Date()
  );
  if (errores.length) throw new ApiError(400, errores[0]);

  const partida = await Partida.findByIdAndUpdate(id, cambios, {
    new: true,
    runValidators: true,
  });
  if (!partida) throw new ApiError(404, 'Partida no encontrada');
  return partida;
}

export async function eliminar(id: string): Promise<PartidaDocumento> {
  const partida = await Partida.findByIdAndDelete(idValido(id));
  if (!partida) throw new ApiError(404, 'Partida no encontrada');
  return partida;
}
