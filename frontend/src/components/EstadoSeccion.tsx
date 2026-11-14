import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { botonSecundarioE2, textoAuxiliarE2 } from '../utils/estilosE2';

type Props =
  | { tipo: 'cargando'; mensaje?: string }
  | { tipo: 'error'; mensaje: string; onReintentar: () => void }
  | { tipo: 'vacio'; titulo: string; texto?: string; acciones?: ReactNode };

/** Carga, error con «Reintentar» y vacío de una sección. Solo tokens de DESIGN.md. */
export function EstadoSeccion(props: Props) {
  if (props.tipo === 'cargando') {
    return (
      <p
        role="status"
        className={`${textoAuxiliarE2} flex items-center justify-center gap-3 py-8`}
      >
        <Loader2
          className="h-5 w-5 text-acento motion-safe:animate-spin"
          aria-hidden="true"
        />
        {props.mensaje ?? 'Cargando tu progreso...'}
      </p>
    );
  }

  if (props.tipo === 'error') {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-peligro/50 bg-peligro/10 px-4 py-3 text-sm text-texto"
      >
        <p className="flex items-start gap-2">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-peligro"
            aria-hidden="true"
          />
          No pudimos cargar tu progreso: {props.mensaje}. Inténtalo de nuevo.
        </p>
        <button
          type="button"
          onClick={props.onReintentar}
          className={botonSecundarioE2}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-borde px-4 py-6 text-center">
      <Inbox className="h-8 w-8 text-texto-suave" aria-hidden="true" />
      <p className="text-base text-texto">{props.titulo}</p>
      {props.texto && <p className={textoAuxiliarE2}>{props.texto}</p>}
      {props.acciones && (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {props.acciones}
        </div>
      )}
    </div>
  );
}
