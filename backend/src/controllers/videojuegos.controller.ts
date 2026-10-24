import type { Request, Response, NextFunction } from 'express';
import * as videojuegos from '../services/videojuegos.service';
import * as partidas from '../services/partidas.service';
import { queryTexto } from '../validacion';
import { ApiError } from '../apiError';

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await videojuegos.listar(queryTexto(req.query.filtro)));
  } catch (e) {
    next(e);
  }
}

export async function obtener(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await videojuegos.obtener(req.params.id));
  } catch (e) {
    next(e);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(201).json(await videojuegos.crear(req.body));
  } catch (e) {
    next(e);
  }
}

export async function actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await videojuegos.actualizar(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
}

export async function eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eliminado = await videojuegos.eliminar(req.params.id);
    res.json({ mensaje: 'Videojuego eliminado', videojuego: eliminado });
  } catch (e) {
    next(e);
  }
}

export async function obtenerResumen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await videojuegos.obtenerResumen(req.params.id));
  } catch (e) {
    next(e);
  }
}

/** PATCH /:id/logros — cuerpo: { nombre: string, obtenido: boolean } */
export async function marcarLogro(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body: unknown = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Se requiere un objeto JSON');
    const { nombre, obtenido, ...extra } = body as Record<string, unknown>;
    if (Object.keys(extra).length) throw new ApiError(400, 'Campos no permitidos en el cuerpo');
    if (typeof nombre !== 'string' || !nombre.trim()) throw new ApiError(400, 'Falta el campo nombre');
    if (typeof obtenido !== 'boolean') throw new ApiError(400, 'obtenido debe ser booleano');
    res.json(await videojuegos.marcarLogro(req.params.id, nombre.trim(), obtenido));
  } catch (e) {
    next(e);
  }
}

export async function listarPartidas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await partidas.listarPorVideojuego(req.params.id));
  } catch (e) {
    next(e);
  }
}
