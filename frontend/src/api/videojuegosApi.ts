import { solicitar } from './cliente';
import type { Partida } from './partidasApi';

export const PLATAFORMAS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Movil'] as const;
export const GENEROS = ['accion', 'rol', 'estrategia', 'puzzle', 'deportes', 'otro'] as const;
export const ESTADOS = ['jugando', 'pausado', 'completado', 'abandonado'] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type Estado = (typeof ESTADOS)[number];

export interface Logro {
  _id: string;
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  _id: string;
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: Logro[];
  createdAt: string;
  updatedAt: string;
}

export interface Resumen {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}

/** Campos editables desde el formulario (el backend rechaza cualquier otro). */
export interface VideojuegoDatos {
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: Estado;
}

const RUTA = '/api/videojuegos';
const json = (metodo: string, cuerpo: unknown): RequestInit => ({ method: metodo, body: JSON.stringify(cuerpo) });

export const videojuegosApi = {
  listar: (filtro?: string) =>
    solicitar<Videojuego[]>(filtro ? `${RUTA}?filtro=${encodeURIComponent(filtro)}` : RUTA),

  obtener: (id: string) => solicitar<Videojuego>(`${RUTA}/${id}`),

  crear: (datos: VideojuegoDatos) => solicitar<Videojuego>(RUTA, json('POST', datos)),

  actualizar: (id: string, datos: Partial<VideojuegoDatos>) =>
    solicitar<Videojuego>(`${RUTA}/${id}`, json('PUT', datos)),

  eliminar: (id: string) =>
    solicitar<{ mensaje: string; videojuego: Videojuego }>(`${RUTA}/${id}`, { method: 'DELETE' }),

  obtenerResumen: (id: string) => solicitar<Resumen>(`${RUTA}/${id}/resumen`),

  marcarLogro: (id: string, nombre: string, obtenido: boolean) =>
    solicitar<Videojuego>(`${RUTA}/${id}/logros`, json('PATCH', { nombre, obtenido })),

  listarPartidas: (id: string) => solicitar<Partida[]>(`${RUTA}/${id}/partidas`),
};
