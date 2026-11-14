import { PowerOff } from 'lucide-react';
import type { Meta } from '../api/metasApi';
import {
  etiquetaDatoE2,
  insigniaNeutraE2,
  textoAuxiliarE2,
} from '../utils/estilosE2';
import { formatearFecha, formatearHoras } from '../utils/formato';

interface Props {
  /** Metas inactivas del videojuego, en el orden del servidor (de la más reciente a la más antigua). */
  metas: Meta[];
}

/** Historial de metas desactivadas. Solo lectura: no ofrece acciones (RN-12, RN-13). */
export function HistorialMetas({ metas }: Props) {
  return (
    <section
      aria-labelledby="titulo-historial-metas"
      className="border-t border-borde pt-5"
    >
      <h3 id="titulo-historial-metas" className={`${etiquetaDatoE2} mb-3`}>
        Historial de metas
      </h3>

      {metas.length === 0 ? (
        <p className={textoAuxiliarE2}>
          Cuando desactives o reemplaces una meta, quedará aquí.
        </p>
      ) : (
        <ul className="space-y-2">
          {metas.map((m) => (
            <li
              key={m._id}
              className="space-y-3 rounded-lg border border-borde p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-texto">
                  {formatearHoras(m.horasSemana)} por semana en {m.diasSemana}{' '}
                  {m.diasSemana === 1 ? 'día' : 'días'}
                </p>
                <span className={insigniaNeutraE2}>
                  <PowerOff className="h-3.5 w-3.5" aria-hidden="true" />
                  Desactivada
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={etiquetaDatoE2}>Hitos</span>
                {m.hitos.length === 0 ? (
                  <span className={textoAuxiliarE2}>Sin hitos</span>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {m.hitos.map((h) => (
                      <li key={h} className={insigniaNeutraE2}>
                        {h} %
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {m.desactivadaEn && (
                <p className={textoAuxiliarE2}>
                  Desactivada el{' '}
                  <time dateTime={m.desactivadaEn} className="text-texto">
                    {formatearFecha(m.desactivadaEn)}
                  </time>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
