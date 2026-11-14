import { ApiError } from '../apiError';
import { idValido } from '../validacion';
import { Meta, MAX_HITOS, type MetaDocumento } from '../modelos/Meta.model';
import { Videojuego } from '../modelos/Videojuego.model';

const CAMPOS = ['horasSemana', 'diasSemana', 'hitos'] as const;

interface DatosMeta {
  horasSemana?: number;
  diasSemana?: number;
  hitos?: number[];
}

const esEntero = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

/**
 * Valida el cuerpo de crear y editar. Los campos numéricos y arreglos se validan aquí
 * (el helper `cuerpo` solo admite texto). Con `obligatorios` exige horasSemana y diasSemana.
 */
function validarCuerpo(body: unknown, obligatorios: boolean): DatosMeta {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new ApiError(400, 'Se requiere un objeto JSON');
  const datos = body as Record<string, unknown>;

  if (Object.keys(datos).some((k) => !(CAMPOS as readonly string[]).includes(k)))
    throw new ApiError(400, 'Campos no permitidos en el cuerpo');
  if (!obligatorios && !Object.keys(datos).length)
    throw new ApiError(400, 'El cuerpo no puede estar vacío');

  const { horasSemana, diasSemana, hitos } = datos;
  const resultado: DatosMeta = {};

  if (obligatorios) {
    if (horasSemana === undefined || horasSemana === null)
      throw new ApiError(400, 'Falta el campo horasSemana');
    if (diasSemana === undefined || diasSemana === null)
      throw new ApiError(400, 'Falta el campo diasSemana');
  }

  if (horasSemana !== undefined) {
    if (
      typeof horasSemana !== 'number' ||
      !Number.isFinite(horasSemana) ||
      horasSemana <= 0 ||
      horasSemana > 100
    )
      throw new ApiError(400, 'horasSemana debe ser mayor que 0 y no más de 100');
    resultado.horasSemana = horasSemana;
  }

  if (diasSemana !== undefined) {
    if (!esEntero(diasSemana, 1, 7))
      throw new ApiError(400, 'diasSemana debe ser un entero entre 1 y 7');
    resultado.diasSemana = diasSemana;
  }

  if (hitos !== undefined) {
    if (!Array.isArray(hitos)) throw new ApiError(400, 'hitos debe ser un arreglo');
    if (!hitos.every((h) => esEntero(h, 1, 100)))
      throw new ApiError(400, 'Cada hito debe ser un entero entre 1 y 100');
    if (hitos.length > MAX_HITOS)
      throw new ApiError(400, `Una meta admite como máximo ${MAX_HITOS} hitos`);
    if (new Set(hitos).size !== hitos.length)
      throw new ApiError(400, 'Los hitos no pueden repetir porcentaje');
    // Se guardan de menor a mayor (RN-10).
    resultado.hitos = [...(hitos as number[])].sort((a, b) => a - b);
  }

  return resultado;
}

export async function crear(
  videojuegoId: string,
  body: unknown
): Promise<MetaDocumento> {
  idValido(videojuegoId);
  const datos = validarCuerpo(body, true);

  const videojuego = await Videojuego.findById(videojuegoId);
  if (!videojuego) throw new ApiError(404, 'Videojuego no encontrado');
  if (videojuego.estado === 'completado' || videojuego.estado === 'abandonado')
    throw new ApiError(
      409,
      'No se puede crear una meta en un videojuego completado o abandonado'
    );
  if (await Meta.exists({ videojuego: videojuegoId, activa: true }))
    throw new ApiError(409, 'El videojuego ya tiene una meta activa');

  // Si dos peticiones simultáneas llegan aquí, el índice único lanza 11000 y el errorHandler responde 409.
  return Meta.create({ videojuego: videojuegoId, ...datos });
}

export async function listarPorVideojuego(
  videojuegoId: string
): Promise<MetaDocumento[]> {
  idValido(videojuegoId);
  if (!(await Videojuego.exists({ _id: videojuegoId })))
    throw new ApiError(404, 'Videojuego no encontrado');
  return Meta.find({ videojuego: videojuegoId }).sort({ createdAt: -1 });
}

export async function obtener(metaId: string): Promise<MetaDocumento> {
  const meta = await Meta.findById(idValido(metaId));
  if (!meta) throw new ApiError(404, 'Meta no encontrada');
  return meta;
}

export async function actualizar(
  metaId: string,
  body: unknown
): Promise<MetaDocumento> {
  idValido(metaId);
  const datos = validarCuerpo(body, false);

  // Atómico: solo modifica si sigue activa.
  const meta = await Meta.findOneAndUpdate(
    { _id: metaId, activa: true },
    { $set: datos },
    { new: true, runValidators: true }
  );
  if (meta) return meta;
  if (!(await Meta.exists({ _id: metaId })))
    throw new ApiError(404, 'Meta no encontrada');
  throw new ApiError(409, 'La meta está desactivada y no se puede modificar');
}

export async function desactivar(metaId: string): Promise<MetaDocumento> {
  idValido(metaId);
  const meta = await Meta.findOneAndUpdate(
    { _id: metaId, activa: true },
    { $set: { activa: false, desactivadaEn: new Date() } },
    { new: true }
  );
  if (meta) return meta;
  if (!(await Meta.exists({ _id: metaId })))
    throw new ApiError(404, 'Meta no encontrada');
  throw new ApiError(409, 'La meta ya está desactivada');
}
