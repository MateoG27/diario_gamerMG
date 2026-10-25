import type { FilterQuery } from 'mongoose';
import { ApiError } from '../apiError';
import { idValido, cuerpo } from '../validacion';
import {
  Videojuego,
  ESTADOS,
  PLATAFORMAS,
  GENEROS,
  type IVideojuego,
  type ILogro,
  type Estado,
  type Plataforma,
  type Genero,
  type VideojuegoDocumento,
} from '../modelos/Videojuego.model';
import { Partida } from '../modelos/Partida.model';

const CAMPOS = ['nombre', 'plataforma', 'genero', 'estado'] as const;
const OBLIGATORIOS = CAMPOS;

type DatosVideojuego = Partial<Pick<IVideojuego, 'nombre' | 'plataforma' | 'genero' | 'estado'>>;

/**
 * `cuerpo` solo admite valores de tipo texto, por lo que `logros` (arreglo de objetos)
 * se valida aparte, sin modificar el helper.
 */
function parsearLogros(valor: unknown): ILogro[] {
  if (!Array.isArray(valor)) throw new ApiError(400, 'logros debe ser un arreglo');
  return valor.map((item: unknown): ILogro => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new ApiError(400, 'Cada logro debe ser un objeto');
    }
    const { nombre, obtenido, ...extra } = item as Record<string, unknown>;
    if (Object.keys(extra).length) throw new ApiError(400, 'Campos no permitidos en logros');
    if (typeof nombre !== 'string' || !nombre.trim()) throw new ApiError(400, 'Cada logro requiere un nombre');
    if (obtenido !== undefined && typeof obtenido !== 'boolean') {
      throw new ApiError(400, 'obtenido debe ser booleano');
    }
    return { nombre: nombre.trim(), obtenido: obtenido ?? false };
  });
}

function construirFiltro(filtro?: string): FilterQuery<IVideojuego> {
  if (!filtro) return {};
  if ((ESTADOS as readonly string[]).includes(filtro)) return { estado: filtro as Estado };
  if ((PLATAFORMAS as readonly string[]).includes(filtro)) return { plataforma: filtro as Plataforma };
  if ((GENEROS as readonly string[]).includes(filtro)) return { genero: filtro as Genero };
  throw new ApiError(400, 'Filtro inválido: use un estado, plataforma o género válido');
}

export async function listar(filtro?: string): Promise<VideojuegoDocumento[]> {
  return Videojuego.find(construirFiltro(filtro)).sort({ nombre: 1 });
}

export async function obtener(id: string): Promise<VideojuegoDocumento> {
  const videojuego = await Videojuego.findById(idValido(id));
  if (!videojuego) throw new ApiError(404, 'Videojuego no encontrado');
  return videojuego;
}

export async function crear(body: unknown): Promise<VideojuegoDocumento> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Se requiere un objeto JSON');
  const { logros, ...resto } = body as Record<string, unknown>;
  const datos = cuerpo(resto, CAMPOS, OBLIGATORIOS) as DatosVideojuego;
  return Videojuego.create({
    ...datos,
    ...(logros !== undefined ? { logros: parsearLogros(logros) } : {}),
  });
}

export async function actualizar(id: string, body: unknown): Promise<VideojuegoDocumento> {
  const datos = cuerpo(body, CAMPOS) as DatosVideojuego;
  const videojuego = await Videojuego.findByIdAndUpdate(idValido(id), datos, {
    new: true,
    runValidators: true,
  });
  if (!videojuego) throw new ApiError(404, 'Videojuego no encontrado');
  return videojuego;
}

export async function eliminar(id: string): Promise<VideojuegoDocumento> {
  idValido(id);
  const videojuego = await Videojuego.findById(id);
  if (!videojuego) throw new ApiError(404, 'Videojuego no encontrado');
  if (await Partida.exists({ videojuego: videojuego._id })) {
    throw new ApiError(409, 'No se puede eliminar: el videojuego tiene partidas registradas');
  }
  await videojuego.deleteOne();
  return videojuego;
}

export interface ResumenVideojuego {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: Date | null;
  porcentajeAvanceActual: number;
}

export async function obtenerResumen(id: string): Promise<ResumenVideojuego> {
  idValido(id);
  if (!(await Videojuego.exists({ _id: id }))) throw new ApiError(404, 'Videojuego no encontrado');

  // Más reciente primero; createdAt desempata partidas con la misma fecha.
  const partidas = await Partida.find({ videojuego: id }).sort({ fecha: -1, createdAt: -1 });
  if (partidas.length === 0) {
    return { totalPartidas: 0, horasTotales: 0, ultimaPartida: null, porcentajeAvanceActual: 0 };
  }

  const ultima = partidas[0];
  const minutosTotales = partidas.reduce((suma, p) => suma + p.duracionMinutos, 0);
  return {
    totalPartidas: partidas.length,
    horasTotales: Number((minutosTotales / 60).toFixed(1)),
    ultimaPartida: ultima.fecha,
    porcentajeAvanceActual: ultima.porcentajeAvance,
  };
}

export async function agregarLogro(id: string, nombre: string): Promise<VideojuegoDocumento> {
  idValido(id);
  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) throw new ApiError(400, 'Falta el campo nombre');
  // Una sola operación atómica: si el juego no existe, devuelve null.
  const videojuego = await Videojuego.findByIdAndUpdate(
    id,
    { $push: { logros: { nombre: nombreLimpio, obtenido: false } } },
    { new: true, runValidators: true },
  );
  if (!videojuego) throw new ApiError(404, 'Videojuego no encontrado');
  return videojuego;
}

export async function eliminarLogro(id: string, nombreLogro: string): Promise<VideojuegoDocumento> {
  idValido(id);
  const videojuego = await Videojuego.findOneAndUpdate(
    { _id: id, 'logros.nombre': nombreLogro },
    { $pull: { logros: { nombre: nombreLogro } } },
    { new: true },
  );
  if (videojuego) return videojuego;
  // No hubo coincidencia: distinguir entre juego inexistente y logro inexistente.
  if (!(await Videojuego.exists({ _id: id }))) throw new ApiError(404, 'Videojuego no encontrado');
  throw new ApiError(404, 'Logro no encontrado');
}

export async function marcarLogro(id: string, nombreLogro: string, obtenido: boolean): Promise<VideojuegoDocumento> {
  idValido(id);
  const videojuego = await Videojuego.findOneAndUpdate(
    { _id: id, 'logros.nombre': nombreLogro },
    { $set: { 'logros.$.obtenido': obtenido } },
    { new: true, runValidators: true },
  );
  if (videojuego) return videojuego;
  // No hubo coincidencia: distinguir entre juego inexistente y logro inexistente.
  if (!(await Videojuego.exists({ _id: id }))) throw new ApiError(404, 'Videojuego no encontrado');
  throw new ApiError(404, 'Logro no encontrado');
}
