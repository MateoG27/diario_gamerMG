import { randomUUID } from 'node:crypto';
import { RequestHandler } from 'express';
declare global { namespace Express { interface Request { id: string; } } }
export const requestId: RequestHandler = (req,res,next) => { req.id=randomUUID(); res.setHeader('X-Request-Id',req.id); next(); };
