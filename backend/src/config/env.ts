import 'dotenv/config';
/** Único lugar que lee el entorno. Nunca registrar la URI en logs. */
export function leerEnv() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  const port = Number(process.env.PORT ?? 3000);
  if (!uri) throw new Error('Falta MONGODB_URI en backend/.env');
  if (!dbName || !/^parcial_(e[0-9]{3,4}|piloto_[ab])$/.test(dbName)) throw new Error('Usa la base de examen asignada: parcial_eNNN');
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Puerto inválido');
  return { uri, dbName, port };
}
