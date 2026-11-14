import { conectarDB, cerrarDB } from './conexionDB';
import { Partida } from './modelos/Partida.model';
import { Videojuego } from './modelos/Videojuego.model';
import { Meta } from './modelos/Meta.model';

/**
 * Sincroniza los índices de cada modelo con la base de datos.
 * Es necesario porque conexionDB usa `autoIndex: false`.
 * Requiere una conexión ya abierta.
 */
export async function sincronizarIndices() {
  const modelos = [Partida, Videojuego, Meta];
  const resultado: Record<string, string[]> = {};
  for (const modelo of modelos) {
    resultado[modelo.modelName] = await modelo.syncIndexes();
  }
  return resultado;
}

async function main() {
  await conectarDB();
  try {
    const resultado = await sincronizarIndices();
    console.log('Índices sincronizados:', resultado);
  } finally {
    await cerrarDB();
  }
}

// Solo se ejecuta al invocarlo como script (npm run indices o node dist/sincronizarIndices.js).
if (require.main === module) {
  main().catch(() => {
    console.error(
      'No se pudieron sincronizar los índices. Revisar entorno, permisos y disponibilidad de Atlas. No publicar la URI.'
    );
    process.exitCode = 1;
  });
}
