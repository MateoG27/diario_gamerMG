// Hook PreToolUse: bloquea el acceso a archivos .env (excepto .env.example).
import { readFileSync } from 'node:fs';

const CAMPOS = ['file_path', 'path', 'notebook_path', 'filePath'];

function esEnvProhibido(ruta) {
  const nombre = String(ruta).replace(/\\/g, '/').split('/').pop() ?? '';
  if (nombre === '.env.example') return false;
  return nombre === '.env' || nombre.startsWith('.env.');
}

let entrada;
try {
  entrada = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const params = entrada?.tool_input ?? {};
for (const campo of CAMPOS) {
  const valor = params[campo];
  if (typeof valor === 'string' && esEnvProhibido(valor)) {
    process.stderr.write(
      `Bloqueado: no se puede acceder a "${valor}". Los archivos .env son privados; usa solo .env.example.\n`
    );
    process.exit(2);
  }
}

process.exit(0);
