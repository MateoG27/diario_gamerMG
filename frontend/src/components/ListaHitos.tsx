import { CheckCircle2, Circle } from 'lucide-react';
import type { HitoProgreso } from '../api/metasApi';
import {
  etiquetaDatoE2,
  insigniaExitoE2,
  insigniaNeutraE2,
  textoAuxiliarE2,
} from '../utils/estilosE2';

interface Props {
  /** Hitos tal como los entrega el servidor (ya ordenados y con `alcanzado`). */
  hitos: HitoProgreso[];
  avanceActual: number;
}

export function ListaHitos({ hitos, avanceActual }: Props) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={etiquetaDatoE2}>Tus hitos</h3>
        <p className={textoAuxiliarE2}>
          Tu avance actual: <span className="text-texto">{avanceActual} %</span>
        </p>
      </div>
      {hitos.length === 0 ? (
        <p className={textoAuxiliarE2}>
          Esta meta aún no tiene hitos. Puedes agregarlos cuando quieras.
        </p>
      ) : (
        <ul className="space-y-2">
          {hitos.map((h) => (
            <li
              key={h.porcentaje}
              className="flex items-center justify-between gap-2 rounded-lg border border-borde px-4 py-3"
            >
              <span className="text-texto">Hito de {h.porcentaje} %</span>
              {h.alcanzado ? (
                <span className={insigniaExitoE2}>
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Alcanzado
                </span>
              ) : (
                <span className={insigniaNeutraE2}>
                  <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                  Pendiente
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
