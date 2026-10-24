import { Schema, model, type HydratedDocument } from 'mongoose';

// Constantes reutilizables (validación en rutas, formularios, etc.)
export const PLATAFORMAS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Movil'] as const;
export const GENEROS = ['accion', 'rol', 'estrategia', 'puzzle', 'deportes', 'otro'] as const;
export const ESTADOS = ['jugando', 'pausado', 'completado', 'abandonado'] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type Estado = (typeof ESTADOS)[number];

export interface ILogro {
  nombre: string;
  obtenido: boolean;
}

export interface IVideojuego {
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: ILogro[];
  createdAt: Date;
  updatedAt: Date;
}

export type VideojuegoDocumento = HydratedDocument<IVideojuego>;

// Sub-documento embebido (se mantiene _id por defecto para poder actualizar un logro puntual)
const logroSchema = new Schema<ILogro>({
  nombre: { type: String, required: true, trim: true },
  obtenido: { type: Boolean, default: false },
});

const videojuegoSchema = new Schema<IVideojuego>(
  {
    nombre: { type: String, required: true, trim: true },
    plataforma: { type: String, enum: PLATAFORMAS, required: true },
    genero: { type: String, enum: GENEROS, required: true },
    estado: { type: String, enum: ESTADOS, required: true },
    logros: { type: [logroSchema], default: [] },
  },
  { timestamps: true },
);

export const Videojuego = model<IVideojuego>('Videojuego', videojuegoSchema);
