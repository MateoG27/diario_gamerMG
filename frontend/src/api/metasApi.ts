import { solicitar } from './cliente';

/** Meta semanal tal como la devuelve el servidor (ObjectId y Date llegan como texto). */
export interface Meta {
  _id: string;
  videojuego: string;
  horasSemana: number;
  diasSemana: number;
  /** Porcentajes de menor a mayor. */
  hitos: number[];
  activa: boolean;
  desactivadaEn: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Único cuerpo que el frontend envía al crear o editar una meta. */
export interface MetaDatos {
  horasSemana: number;
  diasSemana: number;
  hitos?: number[];
}

export interface HitoProgreso {
  porcentaje: number;
  alcanzado: boolean;
}

/** Respuesta de GET /api/videojuegos/:id/progreso-semanal. Todo lo calcula el servidor. */
export interface ProgresoSemanal {
  videojuego: string;
  zona: string;
  /** Fechas de calendario `AAAA-MM-DD` (no pasarlas por `new Date`). */
  hoy: string;
  semana: { inicio: string; fin: string };
  meta: { _id: string; horasSemana: number; diasSemana: number } | null;
  horasJugadas: number;
  diasJugados: number;
  porcentajeHoras: number | null;
  cumplida: boolean | null;
  racha: { actual: number; mejor: number };
  avanceActual: number;
  hitos: HitoProgreso[];
}

const RUTA_VIDEOJUEGOS = '/api/videojuegos';
const RUTA_METAS = '/api/metas';
const json = (metodo: string, cuerpo: unknown): RequestInit => ({
  method: metodo,
  body: JSON.stringify(cuerpo),
});

// No hay funciones para consultar por id, reactivar ni eliminar metas (RN-12, RN-13).
export const metasApi = {
  obtenerProgreso: (videojuegoId: string) =>
    solicitar<ProgresoSemanal>(
      `${RUTA_VIDEOJUEGOS}/${videojuegoId}/progreso-semanal`
    ),

  /** Historial del videojuego, de la meta más reciente a la más antigua. */
  listarPorVideojuego: (videojuegoId: string) =>
    solicitar<Meta[]>(`${RUTA_VIDEOJUEGOS}/${videojuegoId}/metas`),

  crear: (videojuegoId: string, datos: MetaDatos) =>
    solicitar<Meta>(
      `${RUTA_VIDEOJUEGOS}/${videojuegoId}/metas`,
      json('POST', datos)
    ),

  actualizar: (metaId: string, datos: Partial<MetaDatos>) =>
    solicitar<Meta>(`${RUTA_METAS}/${metaId}`, json('PATCH', datos)),

  desactivar: (metaId: string) =>
    solicitar<Meta>(`${RUTA_METAS}/${metaId}/desactivar`, { method: 'POST' }),
};
