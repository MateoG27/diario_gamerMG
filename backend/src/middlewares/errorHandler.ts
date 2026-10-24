import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../apiError';
/** Cuatro parámetros identifican al manejador central de errores. */
export const errorHandler: ErrorRequestHandler = (err: unknown,req,res,next) => {
  if (res.headersSent) { next(err); return; }
  let status=500, error='Error interno del servidor';
  if (err instanceof ApiError) { status=err.status; error=err.message; }
  else if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError || err instanceof mongoose.Error.StrictModeError) { status=400;error=err.message; }
  else if (err instanceof SyntaxError && 'status' in err && (err as {status:unknown}).status===400) { status=400;error='JSON malformado'; }
  if (status===500) console.error({requestId:req.id,nombreError:err instanceof Error?err.name:'Unknown'});
  res.status(status).json({error,requestId:req.id});
};
