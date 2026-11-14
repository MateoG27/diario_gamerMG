// Hook PostToolUse: formatea con Prettier el archivo recién editado.
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const EXTENSIONES = ['.ts', '.tsx', '.css', '.json', '.md'];

try {
  const entrada = JSON.parse(readFileSync(0, 'utf8'));
  const archivo = entrada?.tool_input?.file_path;

  if (typeof archivo === 'string') {
    const normalizada = archivo.replace(/\\/g, '/');
    const ignorado = /(^|\/)(node_modules|dist)\//.test(normalizada);
    const valida = EXTENSIONES.some((ext) => normalizada.endsWith(ext));

    if (valida && !ignorado && existsSync(archivo)) {
      const raiz = process.env.CLAUDE_PROJECT_DIR || process.cwd();
      spawnSync(`npx prettier --write "${archivo}"`, {
        cwd: raiz,
        shell: true,
        stdio: 'ignore',
      });
    }
  }
} catch {
  // Un fallo de formato nunca debe bloquear al agente.
}

process.exit(0);
