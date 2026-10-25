const BASE: string = import.meta.env.VITE_API_URL ?? '';

/** Único punto donde se usa `fetch`: lanza Error si la respuesta no es 2xx. */
export async function solicitar<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${ruta}`, {
    ...init,
    headers: init.body ? { 'Content-Type': 'application/json', ...init.headers } : init.headers,
  });
  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const datos = (await res.json()) as { error?: string };
      if (datos.error) mensaje = datos.error;
    } catch {
      // la respuesta no era JSON: se conserva el mensaje genérico
    }
    throw new Error(mensaje);
  }
  return (await res.json()) as T;
}

export function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}
