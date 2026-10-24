import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IPartida {
  videojuego: Types.ObjectId;
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PartidaDocumento = HydratedDocument<IPartida>;

const partidaSchema = new Schema<IPartida>(
  {
    videojuego: { type: Schema.Types.ObjectId, ref: 'Videojuego', required: true },
    fecha: { type: Date, required: true },
    duracionMinutos: { type: Number, required: true },
    porcentajeAvance: { type: Number, required: true, min: 0, max: 100 },
    notas: { type: String, required: false, trim: true },
  },
  { timestamps: true },
);

// Acelera la consulta de partidas de un juego ordenadas por fecha (usada en el resumen)
partidaSchema.index({ videojuego: 1, fecha: -1 });

export const Partida = model<IPartida>('Partida', partidaSchema);
