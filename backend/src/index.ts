import { conectarDB,cerrarDB } from './conexionDB';
import { leerEnv } from './config/env';
import { crearApp } from './app';
async function main() {
  const {port,dbName}=leerEnv();await conectarDB();
  const server=crearApp().listen(port,()=>console.log(`API lista en http://127.0.0.1:${port} · ${dbName}`));
  server.on('error',()=>{console.error('No se pudo abrir el puerto');void cerrarDB().finally(()=>{process.exitCode=1;});});
  const salir=()=>{server.close(()=>{void cerrarDB();});};process.on('SIGINT',salir);process.on('SIGTERM',salir);
}
main().catch(()=>{console.error('Inicio fallido. Revisar entorno, usuario, permisos, IP y disponibilidad de Atlas. No publicar la URI.');process.exitCode=1;});
