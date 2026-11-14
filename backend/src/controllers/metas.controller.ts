import type { Request, Response, NextFunction } from 'express';
import * as metas from '../services/metas.service';

/** POST /videojuegos/:id/metas */
export async function crear(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.status(201).json(await metas.crear(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
}

/** GET /videojuegos/:id/metas */
export async function listarPorVideojuego(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json(await metas.listarPorVideojuego(req.params.id));
  } catch (e) {
    next(e);
  }
}

/** GET /metas/:metaId */
export async function obtener(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json(await metas.obtener(req.params.metaId));
  } catch (e) {
    next(e);
  }
}

/** PATCH /metas/:metaId */
export async function actualizar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json(await metas.actualizar(req.params.metaId, req.body));
  } catch (e) {
    next(e);
  }
}

/** POST /metas/:metaId/desactivar */
export async function desactivar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json(await metas.desactivar(req.params.metaId));
  } catch (e) {
    next(e);
  }
}
