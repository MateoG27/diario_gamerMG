import { RequestHandler } from 'express';
export const logger: RequestHandler = (req,res,next) => {
  const inicio=Date.now();
  res.once('finish',()=>console.log(JSON.stringify({ id:req.id, metodo:req.method, ruta:req.path, status:res.statusCode, ms:Date.now()-inicio })));
  next();
};
