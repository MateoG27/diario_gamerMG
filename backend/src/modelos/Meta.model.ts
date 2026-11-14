import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export const MAX_HITOS = 5;

export interface IMeta {
  videojuego: Types.ObjectId;
  horasSemana: number;
  diasSemana: number;
  hitos: number[];
  activa: boolean;
  desactivadaEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type MetaDocumento = HydratedDocument<IMeta>;

const esEnteroEntre = (valor: unknown, min: number, max: number) =>
  typeof valor === 'number' && Number.isInteger(valor) && valor >= min && valor <= max;

const metaSchema = new Schema<IMeta>(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: 'Videojuego',
      required: true,
    },
    horasSemana: {
      type: Number,
      required: true,
      validate: {
        validator: (v: number) => Number.isFinite(v) && v > 0 && v <= 100,
        message: 'horasSemana debe ser mayor que 0 y no más de 100',
      },
    },
    diasSemana: {
      type: Number,
      required: true,
      validate: {
        validator: (v: number) => esEnteroEntre(v, 1, 7),
        message: 'diasSemana debe ser un entero entre 1 y 7',
      },
    },
    hitos: {
      type: [Number],
      default: [],
      // Se guardan de menor a mayor (RN-10). Solo se guardan los porcentajes; "alcanzado" se calcula al leer (RN-06).
      set: (v: unknown) =>
        Array.isArray(v) ? [...v].sort((a: number, b: number) => a - b) : v,
      validate: [
        {
          validator: (v: number[]) => v.length <= MAX_HITOS,
          message: `Una meta admite como máximo ${MAX_HITOS} hitos`,
        },
        {
          validator: (v: number[]) => v.every((h) => esEnteroEntre(h, 1, 100)),
          message: 'Cada hito debe ser un entero entre 1 y 100',
        },
        {
          validator: (v: number[]) => new Set(v).size === v.length,
          message: 'Los hitos no pueden repetir porcentaje',
        },
      ],
    },
    activa: { type: Boolean, default: true },
    desactivadaEn: { type: Date, default: null },
  },
  { timestamps: true }
);

// Una sola meta activa por videojuego (RN-14), incluso con peticiones simultáneas.
metaSchema.index(
  { videojuego: 1 },
  { unique: true, partialFilterExpression: { activa: true } }
);

// Historial de metas de un juego, de la más reciente a la más antigua.
metaSchema.index({ videojuego: 1, createdAt: -1 });

export const Meta = model<IMeta>('Meta', metaSchema);
