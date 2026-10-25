import { solicitar } from './cliente';
import type { Videojuego } from './videojuegosApi';

/** Partida tal como la devuelve el backend por defecto: `videojuego` es solo el ID. */
export interface Partida {
  _id: string;
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

/** Partida devuelta por `GET /api/partidas` (con `populate('videojuego')`). */
export type PartidaPopulada = Omit<Partida, 'videojuego'> & { videojuego: Videojuego };

export interface PartidaDatos {
  videojuego: string;
  /** Cadena de fecha (ISO). */
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
}

const RUTA = '/api/partidas';

export const partidasApi = {
  listar: () => solicitar<PartidaPopulada[]>(RUTA),

  crear: (datos: PartidaDatos) =>
    solicitar<Partida>(RUTA, { method: 'POST', body: JSON.stringify(datos) }),

  eliminar: (id: string) =>
    solicitar<{ mensaje: string; partida: Partida }>(`${RUTA}/${id}`, { method: 'DELETE' }),
};
