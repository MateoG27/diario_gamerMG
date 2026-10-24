import mongoose from 'mongoose';
import { leerEnv } from './config/env';
mongoose.set('bufferCommands', false);
/** Un pool por proceso, no una conexión nueva por petición. */
export async function conectarDB() {
  const { uri, dbName } = leerEnv();
  await mongoose.connect(uri, { dbName, maxPoolSize: 3, minPoolSize: 0,
    serverSelectionTimeoutMS: 6000, connectTimeoutMS: 6000, socketTimeoutMS: 10000, autoIndex: false });
}
export async function cerrarDB() { await mongoose.disconnect(); }
