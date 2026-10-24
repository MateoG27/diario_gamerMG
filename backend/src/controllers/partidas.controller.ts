import type { Request, Response, NextFunction } from 'express';
import * as partidas from '../services/partidas.service';

export async function listar(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await partidas.listar());
  } catch (e) {
    next(e);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(201).json(await partidas.crear(req.body));
  } catch (e) {
    next(e);
  }
}

export async function eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eliminada = await partidas.eliminar(req.params.id);
    res.json({ mensaje: 'Partida eliminada', partida: eliminada });
  } catch (e) {
    next(e);
  }
}
