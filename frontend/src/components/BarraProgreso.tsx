import { etiquetaDatoE2 } from '../utils/estilosE2';

interface Props {
  /** Nombre accesible y visible de la barra (ej. "Horas"). */
  etiqueta: string;
  /** Porcentaje de relleno; se limita a 0-100. */
  porcentaje: number;
  /** Valor en texto visible (ej. "6 h de 8 h"). */
  textoValor: string;
  /** Texto para lectores de pantalla (ej. "6 h de 8 h esta semana"). */
  textoAccesible: string;
  /** Pasa el relleno a `bg-exito`. */
  completa?: boolean;
}

export function BarraProgreso({
  etiqueta,
  porcentaje,
  textoValor,
  textoAccesible,
  completa = false,
}: Props) {
  const valor = Math.min(100, Math.max(0, Math.round(porcentaje)));

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className={etiquetaDatoE2}>{etiqueta}</span>
        <span className="text-base font-semibold text-texto">{textoValor}</span>
      </div>
      <div
        role="progressbar"
        aria-label={`Progreso de ${etiqueta.toLowerCase()} de la meta semanal`}
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={textoAccesible}
        className="h-2.5 overflow-hidden rounded-full bg-borde"
      >
        <div
          className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 ${
            completa ? 'bg-exito' : 'bg-primario'
          }`}
          style={{ width: `${valor}%` }}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {textoAccesible}
      </p>
    </div>
  );
}
