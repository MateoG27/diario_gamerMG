import 'dotenv/config';

/** Único lugar que lee el entorno. Nunca registrar la URI en logs. */
export function leerEnv() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  const port = Number(process.env.PORT ?? 3000);
  
  if (!uri) throw new Error('Falta MONGODB_URI en backend/.env');
  if (!dbName) throw new Error('Falta MONGODB_DB en backend/.env');
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Puerto inválido');
  
  return { uri, dbName, port };
}