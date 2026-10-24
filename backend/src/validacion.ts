import { ApiError } from './apiError';

export function idValido(id: string) {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new ApiError(400, 'Identificador inválido');
  return id;
}

/** Lista blanca: impide operadores y campos internos enviados por el cliente. */
export function cuerpo(body: unknown, campos: readonly string[], obligatorios: readonly string[] = []) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Se requiere un objeto JSON');
  const datos = body as Record<string, unknown>;
  
  if (!Object.keys(datos).length) throw new ApiError(400, 'El cuerpo no puede estar vacío');
  if (Object.keys(datos).some(k => !campos.includes(k))) throw new ApiError(400, 'Campos no permitidos en el cuerpo');
  
  for (const k of obligatorios) {
    if (!(k in datos) || datos[k] === '' || datos[k] === null) throw new ApiError(400, `Falta el campo ${k}`);
  }
  
  for (const [k, v] of Object.entries(datos)) {
    if (k === 'logros') {
      if (!Array.isArray(v)) throw new ApiError(400, 'logros debe ser un arreglo');
    } else if (k === 'duracionMinutos' || k === 'porcentajeAvance') {
      if (typeof v !== 'number' || !Number.isFinite(v)) throw new ApiError(400, `${k} debe ser un número`);
    } else if (k === 'obtenido') {
      if (typeof v !== 'boolean') throw new ApiError(400, `${k} debe ser un booleano`);
    } else if (typeof v !== 'string' && v !== undefined && v !== null) {
      throw new ApiError(400, `${k} debe ser texto`);
    }
  }
  return datos;
}

export function queryTexto(value: unknown) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new ApiError(400, 'Filtro inválido');
  return value || undefined;
}