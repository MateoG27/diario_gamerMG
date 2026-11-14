import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Info, Plus, Save, X } from 'lucide-react';
import { mensajeError } from '../api/cliente';
import { metasApi, type Meta, type MetaDatos } from '../api/metasApi';
import { videojuegosApi, type Videojuego } from '../api/videojuegosApi';
import {
  botonPeligroE2,
  botonPrimarioE2,
  botonSecundarioE2,
  campoConErrorE2,
  campoE2,
  etiquetaCampoE2,
  insigniaNeutraE2,
  mensajeErrorE2,
  tarjetaE2,
  textoAuxiliarE2,
} from '../utils/estilosE2';

type Modo = 'nueva' | 'editar' | 'reemplazar';

const MAX_HITOS = 5;

const MSG_HORAS =
  'Las horas por semana deben ser mayores que 0 y no más de 100. Corrige el valor e inténtalo de nuevo.';
const MSG_DIAS =
  'Los días por semana deben ser un número entero entre 1 y 7. Corrige el valor e inténtalo de nuevo.';
const MSG_HITO_RANGO = 'Cada hito debe ser un número entero entre 1 y 100.';
const MSG_HITO_MAXIMO = 'Una meta admite como máximo 5 hitos.';
const MSG_HITO_REPETIDO = 'Ese porcentaje ya está en tus hitos. Elige otro.';
const MSG_JUEGO_FINALIZADO =
  'Este videojuego ya no está en curso, así que no puede tener una meta semanal.';
const MSG_YA_ACTIVA =
  'Este videojuego ya tiene una meta activa. Puedes editarla o reemplazarla.';
const MSG_SIN_ACTIVA = 'Este videojuego no tiene una meta activa.';
const MSG_REEMPLAZO = 'Tu meta actual pasará al historial y no se podrá reactivar.';

// Clases locales: solo tokens semánticos de DESIGN.md.
const panel = 'mx-auto max-w-xl rounded-2xl border border-borde bg-superficie p-6';
const tituloPagina = 'text-3xl font-extrabold tracking-tight text-texto';
const enlaceVolver =
  'inline-flex items-center gap-1 rounded-lg text-sm text-texto-suave transition duration-200 hover:text-acento ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-fondo';
const cajaAviso =
  'flex items-start gap-2 rounded-xl border border-aviso/50 bg-aviso/10 px-4 py-3 text-sm text-texto';
const cajaAlerta =
  'flex items-start gap-2 rounded-xl border border-peligro/50 bg-peligro/10 px-4 py-3 text-sm text-texto';

function modoDesdeRuta(pathname: string): Modo {
  if (pathname.endsWith('/meta/editar')) return 'editar';
  if (pathname.endsWith('/meta/reemplazar')) return 'reemplazar';
  return 'nueva';
}

function ordenar(hitos: number[]): number[] {
  return [...hitos].sort((a, b) => a - b);
}

/** Crea, edita o reemplaza la meta semanal de un videojuego y gestiona sus hitos. */
export default function MetaForm() {
  const { id } = useParams<{ id: string }>();
  const videojuegoId = id ?? '';
  const { pathname } = useLocation();
  const modo = modoDesdeRuta(pathname);
  const navegar = useNavigate();

  const [videojuego, setVideojuego] = useState<Videojuego | null>(null);
  const [activa, setActiva] = useState<Meta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [horas, setHoras] = useState('');
  const [dias, setDias] = useState('');
  const [hitos, setHitos] = useState<number[]>([]);
  const [hitoTexto, setHitoTexto] = useState('');

  const [errorHoras, setErrorHoras] = useState<string | null>(null);
  const [errorDias, setErrorDias] = useState<string | null>(null);
  const [errorHito, setErrorHito] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Al reemplazar, si la creación falla la meta anterior ya quedó desactivada.
  const [anteriorDesactivada, setAnteriorDesactivada] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setErrorCarga(null);
    Promise.all([
      videojuegosApi.obtener(videojuegoId),
      metasApi.listarPorVideojuego(videojuegoId),
    ])
      .then(([v, metas]) => {
        if (!activo) return;
        const metaActiva = metas.find((m) => m.activa) ?? null;
        setVideojuego(v);
        setActiva(metaActiva);
        if (modo === 'editar' && metaActiva) {
          setHoras(String(metaActiva.horasSemana));
          setDias(String(metaActiva.diasSemana));
          setHitos(ordenar(metaActiva.hitos));
        }
      })
      .catch((e: unknown) => {
        if (activo) setErrorCarga(mensajeError(e));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [videojuegoId, modo]);

  function agregarHito() {
    const texto = hitoTexto.trim();
    const valor = Number(texto);
    if (texto === '' || !Number.isInteger(valor) || valor < 1 || valor > 100) {
      setErrorHito(MSG_HITO_RANGO);
      return;
    }
    if (hitos.length >= MAX_HITOS) {
      setErrorHito(MSG_HITO_MAXIMO);
      return;
    }
    if (hitos.includes(valor)) {
      setErrorHito(MSG_HITO_REPETIDO);
      return;
    }
    setHitos(ordenar([...hitos, valor]));
    setHitoTexto('');
    setErrorHito(null);
  }

  function alPulsarHito(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    agregarHito();
  }

  function quitarHito(porcentaje: number) {
    setHitos(hitos.filter((h) => h !== porcentaje));
    setErrorHito(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErrorEnvio(null);

    const horasNum = Number(horas);
    const diasNum = Number(dias);
    const horasValidas =
      horas.trim() !== '' &&
      Number.isFinite(horasNum) &&
      horasNum > 0 &&
      horasNum <= 100;
    const diasValidos =
      dias.trim() !== '' &&
      Number.isInteger(diasNum) &&
      diasNum >= 1 &&
      diasNum <= 7;
    setErrorHoras(horasValidas ? null : MSG_HORAS);
    setErrorDias(diasValidos ? null : MSG_DIAS);
    if (!horasValidas || !diasValidos) return;

    const datos: MetaDatos = {
      horasSemana: horasNum,
      diasSemana: diasNum,
      hitos,
    };

    setEnviando(true);
    let desactivada = anteriorDesactivada;
    try {
      if (modo === 'editar' && activa) {
        await metasApi.actualizar(activa._id, datos);
      } else if (modo === 'reemplazar' && activa) {
        if (!desactivada) {
          await metasApi.desactivar(activa._id);
          desactivada = true;
          setAnteriorDesactivada(true);
        }
        await metasApi.crear(videojuegoId, datos);
      } else {
        await metasApi.crear(videojuegoId, datos);
      }
      navegar(`/videojuegos/${videojuegoId}`);
    } catch (err) {
      const mensaje = mensajeError(err);
      setErrorEnvio(
        modo === 'reemplazar' && desactivada
          ? `Tu meta anterior ya quedó desactivada y está en el historial. No pudimos guardar la nueva: ${mensaje}. Inténtalo de nuevo.`
          : mensaje
      );
      setEnviando(false);
    }
  }

  const volver = (
    <p className="mt-6 text-center">
      <Link to={`/videojuegos/${videojuegoId}`} className={enlaceVolver}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al videojuego
      </Link>
    </p>
  );

  function pantallaAviso(contenido: ReactNode, acciones?: ReactNode) {
    return (
      <section>
        <div className={`${tarjetaE2} mx-auto max-w-xl space-y-4`}>
          <p className="flex items-start gap-2 text-texto">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-acento" aria-hidden="true" />
            <span>{contenido}</span>
          </p>
          {acciones && <div className="flex flex-wrap gap-3">{acciones}</div>}
        </div>
        {volver}
      </section>
    );
  }

  if (cargando) {
    return (
      <section>
        <p role="status" className={`${textoAuxiliarE2} text-center`}>
          Cargando tu meta...
        </p>
      </section>
    );
  }

  if (errorCarga || !videojuego) {
    return (
      <section>
        <p role="alert" className={`${cajaAlerta} mx-auto max-w-xl`}>
          <AlertTriangle className="h-5 w-5 shrink-0 text-peligro" aria-hidden="true" />
          No pudimos cargar los datos: {errorCarga ?? 'Videojuego no encontrado'}.
          Inténtalo de nuevo.
        </p>
        {volver}
      </section>
    );
  }

  const enCurso =
    videojuego.estado !== 'completado' && videojuego.estado !== 'abandonado';

  if (modo !== 'editar' && !enCurso) {
    return pantallaAviso(MSG_JUEGO_FINALIZADO);
  }

  if (modo === 'nueva' && activa) {
    return pantallaAviso(
      MSG_YA_ACTIVA,
      <>
        <Link
          to={`/videojuegos/${videojuegoId}/meta/editar`}
          className={botonSecundarioE2}
        >
          Editar meta
        </Link>
        <Link
          to={`/videojuegos/${videojuegoId}/meta/reemplazar`}
          className={botonSecundarioE2}
        >
          Reemplazar meta
        </Link>
      </>
    );
  }

  if (modo !== 'nueva' && !activa) {
    return pantallaAviso(
      MSG_SIN_ACTIVA,
      enCurso ? (
        <Link
          to={`/videojuegos/${videojuegoId}/meta/nueva`}
          className={botonPrimarioE2}
        >
          Definir meta
        </Link>
      ) : undefined
    );
  }

  const titulo =
    modo === 'editar'
      ? 'Editar meta semanal'
      : modo === 'reemplazar'
        ? 'Reemplazar meta semanal'
        : 'Definir meta semanal';

  return (
    <section>
      <div className={panel}>
        <h1 className={tituloPagina}>{titulo}</h1>
        <p className={`${textoAuxiliarE2} mb-6 mt-1`}>{videojuego.nombre}</p>

        {modo === 'reemplazar' && !anteriorDesactivada && (
          <p className={`${cajaAviso} mb-5`}>
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-aviso" aria-hidden="true" />
            {MSG_REEMPLAZO}
          </p>
        )}

        <form noValidate onSubmit={(e) => void enviar(e)} className="space-y-5">
          <div>
            <label htmlFor="meta-horas" className={etiquetaCampoE2}>
              Horas por semana
            </label>
            <input
              id="meta-horas"
              type="number"
              inputMode="decimal"
              step="any"
              value={horas}
              onChange={(e) => {
                setHoras(e.target.value);
                setErrorHoras(null);
              }}
              placeholder="Ej: 5"
              aria-invalid={errorHoras ? true : undefined}
              aria-describedby={errorHoras ? 'meta-horas-error' : undefined}
              className={errorHoras ? campoConErrorE2 : campoE2}
            />
            {errorHoras && (
              <p id="meta-horas-error" className={`${mensajeErrorE2} mt-1.5`}>
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {errorHoras}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="meta-dias" className={etiquetaCampoE2}>
              Días por semana
            </label>
            <input
              id="meta-dias"
              type="number"
              inputMode="numeric"
              step={1}
              value={dias}
              onChange={(e) => {
                setDias(e.target.value);
                setErrorDias(null);
              }}
              placeholder="Ej: 3"
              aria-invalid={errorDias ? true : undefined}
              aria-describedby={errorDias ? 'meta-dias-error' : undefined}
              className={errorDias ? campoConErrorE2 : campoE2}
            />
            {errorDias && (
              <p id="meta-dias-error" className={`${mensajeErrorE2} mt-1.5`}>
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {errorDias}
              </p>
            )}
          </div>

          <fieldset className="space-y-3">
            <legend className={etiquetaCampoE2}>Hitos de avance (opcional)</legend>
            <p id="meta-hitos-ayuda" className={textoAuxiliarE2}>
              Hasta 5 porcentajes de avance del videojuego. Se ordenan de menor a mayor.
            </p>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="meta-hito" className={etiquetaCampoE2}>
                  Nuevo hito (%)
                </label>
                <input
                  id="meta-hito"
                  type="number"
                  inputMode="numeric"
                  step={1}
                  value={hitoTexto}
                  onChange={(e) => {
                    setHitoTexto(e.target.value);
                    setErrorHito(null);
                  }}
                  onKeyDown={alPulsarHito}
                  placeholder="Ej: 50"
                  aria-invalid={errorHito ? true : undefined}
                  aria-describedby={
                    errorHito ? 'meta-hito-error' : 'meta-hitos-ayuda'
                  }
                  className={errorHito ? campoConErrorE2 : campoE2}
                />
              </div>
              <button
                type="button"
                onClick={agregarHito}
                className={botonSecundarioE2}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Agregar hito
              </button>
            </div>
            {errorHito && (
              <p id="meta-hito-error" role="alert" className={mensajeErrorE2}>
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {errorHito}
              </p>
            )}
            {hitos.length === 0 ? (
              <p className={textoAuxiliarE2}>
                Aún no tienes hitos: agrega el primero si quieres marcar tu avance.
              </p>
            ) : (
              <ul aria-label="Hitos de la meta" className="space-y-2">
                {hitos.map((h) => (
                  <li
                    key={h}
                    className="flex items-center justify-between gap-2 rounded-lg border border-borde px-4 py-2"
                  >
                    <span className="flex items-center gap-2 text-texto">
                      Hito de {h} %
                    </span>
                    <button
                      type="button"
                      onClick={() => quitarHito(h)}
                      aria-label={`Quitar hito de ${h} %`}
                      title={`Quitar hito de ${h} %`}
                      className={botonPeligroE2}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <span className={insigniaNeutraE2} aria-live="polite">
              {hitos.length} de {MAX_HITOS} hitos
            </span>
          </fieldset>

          {errorEnvio && (
            <p role="alert" className={cajaAlerta}>
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-peligro" aria-hidden="true" />
              {errorEnvio}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={enviando} className={botonPrimarioE2}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {enviando ? 'Guardando...' : 'Guardar meta'}
            </button>
            <Link to={`/videojuegos/${videojuegoId}`} className={botonSecundarioE2}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
