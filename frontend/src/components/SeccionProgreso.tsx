import { useEffect, useState } from 'react';
import { metasApi, type ProgresoSemanal as Progreso } from '../api/metasApi';
import { tarjetaE2, tituloSeccionE2 } from '../utils/estilosE2';
import { ProgresoSemanal } from './ProgresoSemanal';

interface Props {
  videojuegoId: string;
}

/**
 * Contenedor del progreso semanal. Pide los datos al servidor cada vez que se monta
 * (sin caché). En T-09 solo cubre el caso con datos: carga y error son de T-11.
 */
export function SeccionProgreso({ videojuegoId }: Props) {
  const [progreso, setProgreso] = useState<Progreso | null>(null);

  useEffect(() => {
    let activo = true;
    setProgreso(null);
    metasApi
      .obtenerProgreso(videojuegoId)
      .then((p) => {
        if (activo) setProgreso(p);
      })
      .catch(() => {
        // T-11 agrega el estado de error con «Reintentar». El resto del detalle sigue funcionando.
      });
    return () => {
      activo = false;
    };
  }, [videojuegoId]);

  if (!progreso) return null;

  return (
    <section aria-labelledby="titulo-progreso-semanal" className={tarjetaE2}>
      <h2 id="titulo-progreso-semanal" className={`${tituloSeccionE2} mb-5`}>
        Progreso semanal
      </h2>
      <ProgresoSemanal progreso={progreso} />
    </section>
  );
}
