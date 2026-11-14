import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react';
import { videojuegosApi, type Videojuego } from '../api/videojuegosApi';
import { partidasApi } from '../api/partidasApi';
import { mensajeError } from '../api/cliente';
import { EstadoCarga } from '../components/EstadoCarga';
import { ahoraLocalInput } from '../utils/formato';
import {
  animacionesReducidas,
  botonPrimario,
  botonSecundario,
  campo,
  enlaceVolver,
  etiqueta,
  panelFormulario,
  titulo,
} from '../utils/estilos';
import { etiquetaCampoE2 } from '../utils/estilosE2';

gsap.registerPlugin(useGSAP);

// Clases de lo nuevo en modo edición: solo tokens semánticos de DESIGN.md.
const enlaceVolverE2 =
  'inline-flex items-center gap-1 rounded-lg text-sm text-texto-suave transition duration-200 hover:text-acento ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-fondo';
const datoSoloLecturaE2 =
  'w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-texto';

/** ISO con zona -> valor local para `<input type="datetime-local">` (mismo criterio que `ahoraLocalInput`). */
function isoALocalInput(iso: string): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/** Crea (`/partidas/nueva`) o edita (`/partidas/:id/editar`) una partida. */
export default function PartidaForm() {
  const { id } = useParams<{ id: string }>();
  const editando = id !== undefined;
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const contenedor = useRef<HTMLDivElement>(null);

  const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Videojuego de la partida en edición: solo se muestra, no se puede cambiar.
  const [juegoEdicion, setJuegoEdicion] = useState<string>('');

  const [videojuego, setVideojuego] = useState(params.get('videojuego') ?? '');
  const [fecha, setFecha] = useState(ahoraLocalInput);
  const [duracionMinutos, setDuracionMinutos] = useState('');
  const [porcentajeAvance, setPorcentajeAvance] = useState('');
  const [notas, setNotas] = useState('');

  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Modo edición: el backend no tiene GET /api/partidas/:id, así que se busca en el listado.
  useEffect(() => {
    if (id === undefined) return;
    let activo = true;
    setCargando(true);
    setError(null);
    partidasApi
      .listar()
      .then((partidas) => {
        if (!activo) return;
        const p = partidas.find((x) => x._id === id);
        if (!p) {
          setError('Partida no encontrada');
          return;
        }
        setJuegoEdicion(
          p.videojuego
            ? `${p.videojuego.nombre} (${p.videojuego.plataforma})`
            : '(videojuego no disponible)'
        );
        setFecha(isoALocalInput(p.fecha));
        setDuracionMinutos(String(p.duracionMinutos));
        setPorcentajeAvance(String(p.porcentajeAvance));
        setNotas(p.notas ?? '');
      })
      .catch((e: unknown) => {
        if (activo) setError(mensajeError(e));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  useEffect(() => {
    if (id !== undefined) return;
    let activo = true;
    videojuegosApi
      .listar()
      .then((datos) => {
        if (!activo) return;
        setVideojuegos(datos);
        // Si el ID de la URL no existe o no vino, se selecciona el primero.
        setVideojuego((actual) =>
          datos.some((v) => v._id === actual) ? actual : (datos[0]?._id ?? '')
        );
      })
      .catch((e: unknown) => {
        if (activo) setError(mensajeError(e));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  useGSAP(
    () => {
      if (cargando || error || !contenedor.current || animacionesReducidas())
        return;
      gsap.from(contenedor.current, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { dependencies: [cargando, error] }
  );

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErrorEnvio(null);
    setEnviando(true);
    try {
      const notasLimpias = notas.trim();
      if (editando) {
        // Nunca se envía `videojuego`; notas vacías borran las notas.
        await partidasApi.actualizar(id, {
          fecha: new Date(fecha).toISOString(),
          duracionMinutos: Number(duracionMinutos),
          porcentajeAvance: Number(porcentajeAvance),
          notas: notasLimpias,
        });
      } else {
        await partidasApi.crear({
          videojuego,
          fecha: new Date(fecha).toISOString(),
          duracionMinutos: Number(duracionMinutos),
          porcentajeAvance: Number(porcentajeAvance),
          ...(notasLimpias ? { notas: notasLimpias } : {}),
        });
      }
      navegar('/partidas');
    } catch (err) {
      setErrorEnvio(mensajeError(err));
      setEnviando(false);
    }
  }

  if (editando && error) {
    return (
      <section>
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-peligro/50 bg-peligro/10 px-4 py-3 text-sm text-texto"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-peligro"
            aria-hidden="true"
          />
          {error}
        </p>
        <p className="mt-6">
          <Link to="/partidas" className={enlaceVolverE2}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al historial
          </Link>
        </p>
      </section>
    );
  }

  if (cargando || error || (!editando && videojuegos.length === 0)) {
    return (
      <section>
        <EstadoCarga cargando={cargando} error={error} />
        {!cargando && !error && (
          <p className="py-10 text-center text-zinc-300">
            Primero debes{' '}
            <Link
              to="/videojuegos/nuevo"
              className="text-cyan-300 underline hover:text-cyan-200"
            >
              registrar un videojuego
            </Link>{' '}
            para poder crear partidas.
          </p>
        )}
        <p className="mt-6">
          <Link to="/partidas" className={enlaceVolver}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <div ref={contenedor} className={panelFormulario}>
        <h1 className={`${titulo} mb-6`}>
          {editando ? 'Editar' : 'Nueva'}{' '}
          <span className="text-cyan-400">partida</span>
        </h1>
        <form onSubmit={(e) => void enviar(e)} className="space-y-5">
          {editando ? (
            <div>
              <p className={etiquetaCampoE2}>Videojuego</p>
              <p className={datoSoloLecturaE2}>{juegoEdicion}</p>
            </div>
          ) : (
            <div>
              <label htmlFor="videojuego" className={etiqueta}>
                Videojuego
              </label>
              <select
                id="videojuego"
                value={videojuego}
                onChange={(e) => setVideojuego(e.target.value)}
                required
                className={campo}
              >
                {videojuegos.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.nombre} ({v.plataforma})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="fecha" className={etiqueta}>
              Fecha
            </label>
            <input
              id="fecha"
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className={campo}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="duracion" className={etiqueta}>
                Duración (minutos)
              </label>
              <input
                id="duracion"
                type="number"
                min={0}
                step={1}
                value={duracionMinutos}
                onChange={(e) => setDuracionMinutos(e.target.value)}
                required
                placeholder="60"
                className={campo}
              />
            </div>
            <div>
              <label htmlFor="avance" className={etiqueta}>
                Porcentaje de avance (0–100)
              </label>
              <input
                id="avance"
                type="number"
                min={0}
                max={100}
                step={1}
                value={porcentajeAvance}
                onChange={(e) => setPorcentajeAvance(e.target.value)}
                required
                placeholder="25"
                className={campo}
              />
            </div>
          </div>
          <div>
            <label htmlFor="notas" className={etiqueta}>
              Notas (opcional)
            </label>
            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="¿Qué lograste en esta sesión?"
              className={campo}
            />
          </div>
          {errorEnvio && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-300"
            >
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Error: {errorEnvio}
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={enviando} className={botonPrimario}>
              <Save className="h-4 w-4" />
              {enviando
                ? 'Guardando...'
                : editando
                  ? 'Guardar cambios'
                  : 'Guardar partida'}
            </button>
            <Link to="/partidas" className={botonSecundario}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
