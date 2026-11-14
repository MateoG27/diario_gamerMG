import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Pencil,
  Plus,
  PowerOff,
  RefreshCw,
  Repeat,
} from 'lucide-react';
import { mensajeError } from '../api/cliente';
import {
  metasApi,
  type Meta,
  type ProgresoSemanal as Progreso,
} from '../api/metasApi';
import type { Estado } from '../api/videojuegosApi';
import {
  botonPeligroE2,
  botonPrimarioE2,
  botonSecundarioE2,
  tarjetaE2,
  tituloSeccionE2,
} from '../utils/estilosE2';
import { EstadoSeccion } from './EstadoSeccion';
import { HistorialMetas } from './HistorialMetas';
import { ProgresoSemanal } from './ProgresoSemanal';

interface Props {
  videojuegoId: string;
  estado: Estado;
}

const TEXTO_CONFIRMAR =
  '¿Desactivar esta meta? Tus partidas se conservan. La meta queda en tu historial y no se puede reactivar.';

/**
 * Contenedor del progreso semanal. Pide los datos al servidor cada vez que se monta
 * (sin caché ni sondeo) y descarta las respuestas de peticiones viejas. Si la carga
 * falla, solo esta sección muestra el error: el resto del detalle sigue funcionando.
 */
export function SeccionProgreso({ videojuegoId, estado }: Props) {
  const [progreso, setProgreso] = useState<Progreso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desactivando, setDesactivando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);
  // Identifica la última petición vigente; las anteriores se descartan.
  const peticion = useRef(0);

  const cargar = useCallback(
    async (conservarDatos: boolean) => {
      const actual = ++peticion.current;
      if (!conservarDatos) {
        setProgreso(null);
        setMetas([]);
        setCargando(true);
      }
      setError(null);
      setErrorHistorial(null);
      // Progreso e historial se piden en paralelo y fallan por separado.
      const [resProgreso, resMetas] = await Promise.allSettled([
        metasApi.obtenerProgreso(videojuegoId),
        metasApi.listarPorVideojuego(videojuegoId),
      ]);
      if (actual !== peticion.current) return;

      if (resProgreso.status === 'fulfilled') setProgreso(resProgreso.value);
      else setError(mensajeError(resProgreso.reason));

      // Si el historial falla se conserva la lista anterior.
      if (resMetas.status === 'fulfilled') setMetas(resMetas.value);
      else setErrorHistorial(mensajeError(resMetas.reason));

      setCargando(false);
    },
    [videojuegoId]
  );

  // Se ejecuta al montar y al cambiar de videojuego. Al desmontar invalida lo pendiente.
  useEffect(() => {
    void cargar(false);
    return () => {
      peticion.current++;
    };
  }, [cargar]);

  async function desactivar(metaId: string) {
    if (!window.confirm(TEXTO_CONFIRMAR)) return;
    setErrorAccion(null);
    setDesactivando(true);
    try {
      await metasApi.desactivar(metaId);
      // Conserva lo que hay en pantalla mientras llega el progreso nuevo.
      await cargar(true);
    } catch (e) {
      setErrorAccion(mensajeError(e));
    } finally {
      setDesactivando(false);
    }
  }

  const enCurso = estado !== 'completado' && estado !== 'abandonado';
  const meta = progreso?.meta ?? null;
  // La meta activa se toma de `progreso.meta` (servidor); del listado solo salen las inactivas.
  const inactivas = useMemo(() => metas.filter((m) => !m.activa), [metas]);

  return (
    <section aria-labelledby="titulo-progreso-semanal" className={tarjetaE2}>
      <h2 id="titulo-progreso-semanal" className={`${tituloSeccionE2} mb-5`}>
        Progreso semanal
      </h2>

      {cargando && !progreso && <EstadoSeccion tipo="cargando" />}

      {error && !progreso && (
        <EstadoSeccion
          tipo="error"
          mensaje={error}
          onReintentar={() => void cargar(false)}
        />
      )}

      {progreso && (
        <div className="space-y-5">
          {error && (
            <EstadoSeccion
              tipo="error"
              mensaje={error}
              onReintentar={() => void cargar(true)}
            />
          )}

          <ProgresoSemanal progreso={progreso} estado={estado} />

          {errorAccion && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-peligro/50 bg-peligro/10 px-4 py-3 text-sm text-texto"
            >
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-peligro"
                aria-hidden="true"
              />
              No pudimos desactivar tu meta: {errorAccion}. Inténtalo de nuevo.
            </p>
          )}

          {(meta || enCurso) && (
            <div className="flex flex-wrap gap-3">
              {!meta && enCurso && (
                <Link
                  to={`/videojuegos/${videojuegoId}/meta/nueva`}
                  className={botonPrimarioE2}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Definir meta
                </Link>
              )}
              {meta && (
                <>
                  <Link
                    to={`/videojuegos/${videojuegoId}/meta/editar`}
                    className={botonSecundarioE2}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Editar meta
                  </Link>
                  <Link
                    to={`/videojuegos/${videojuegoId}/meta/reemplazar`}
                    className={botonSecundarioE2}
                  >
                    <Repeat className="h-4 w-4" aria-hidden="true" />
                    Reemplazar meta
                  </Link>
                  <button
                    type="button"
                    onClick={() => void desactivar(meta._id)}
                    disabled={desactivando}
                    className={botonPeligroE2}
                  >
                    <PowerOff className="h-4 w-4" aria-hidden="true" />
                    {desactivando ? 'Desactivando...' : 'Desactivar meta'}
                  </button>
                </>
              )}
            </div>
          )}

          {errorHistorial && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-peligro/50 bg-peligro/10 px-4 py-3 text-sm text-texto"
            >
              <p className="flex items-start gap-2">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-peligro"
                  aria-hidden="true"
                />
                No pudimos cargar tu historial de metas: {errorHistorial}.
                Inténtalo de nuevo.
              </p>
              <button
                type="button"
                onClick={() => void cargar(true)}
                className={botonSecundarioE2}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reintentar
              </button>
            </div>
          )}

          <HistorialMetas metas={inactivas} />
        </div>
      )}
    </section>
  );
}
