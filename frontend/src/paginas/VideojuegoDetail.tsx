import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Gamepad2,
  ListOrdered,
  Monitor,
  Pencil,
  Plus,
  Smartphone,
  Sparkles,
  ToggleLeft,
  TrendingUp,
  Trophy,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { videojuegosApi, type Plataforma, type Resumen, type Videojuego } from '../api/videojuegosApi';
import type { Partida } from '../api/partidasApi';
import { mensajeError } from '../api/cliente';
import { EstadoCarga } from '../components/EstadoCarga';
import { formatearFecha } from '../utils/formato';
import {
  animacionesReducidas,
  botonPrimario,
  botonSecundario,
  claseEstado,
  enlaceVolver,
  insignia,
  tarjeta,
} from '../utils/estilos';

gsap.registerPlugin(useGSAP);

interface Datos {
  videojuego: Videojuego;
  resumen: Resumen;
  partidas: Partida[];
}

function iconoPlataforma(plataforma: Plataforma): LucideIcon {
  switch (plataforma) {
    case 'PC':
      return Monitor;
    case 'PlayStation':
    case 'Xbox':
      return Gamepad2;
    case 'Switch':
      return ToggleLeft;
    case 'Movil':
      return Smartphone;
  }
}

function Estadistica({ icono: Icono, etiqueta, valor }: { icono: LucideIcon; etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50">
      <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
        <Icono className="h-4 w-4 text-cyan-400" />
        {etiqueta}
      </p>
      <p className="text-2xl font-bold text-white">{valor}</p>
    </div>
  );
}

export default function VideojuegoDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const [datos, setDatos] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorLogro, setErrorLogro] = useState<string | null>(null);
  const contenedor = useRef<HTMLElement>(null);

  const cargar = useCallback(async (): Promise<Datos> => {
    const [videojuego, resumen, partidas] = await Promise.all([
      videojuegosApi.obtener(id),
      videojuegosApi.obtenerResumen(id),
      videojuegosApi.listarPartidas(id),
    ]);
    return { videojuego, resumen, partidas };
  }, [id]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    cargar()
      .then(d => {
        if (activo) setDatos(d);
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
  }, [cargar]);

  // Fade-in suave del resumen y las listas (solo al terminar la carga, no al marcar logros).
  useGSAP(
    () => {
      if (cargando || !contenedor.current || animacionesReducidas()) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', clearProps: 'opacity,transform' } });
      tl.from('.anim-resumen', { opacity: 0, y: 20, duration: 0.7 }).from(
        '.anim-lista',
        { opacity: 0, y: 20, duration: 0.5, stagger: 0.15 },
        '-=0.3',
      );
    },
    { scope: contenedor, dependencies: [cargando] },
  );

  async function alternarLogro(nombre: string, obtenido: boolean) {
    setErrorLogro(null);
    try {
      await videojuegosApi.marcarLogro(id, nombre, obtenido);
      setDatos(await cargar()); // refresca videojuego, resumen y partidas
    } catch (e) {
      setErrorLogro(mensajeError(e));
    }
  }

  if (cargando || error || !datos) {
    return (
      <section>
        <EstadoCarga cargando={cargando} error={error} vacio={!cargando && !error && !datos} />
        <p className="mt-6">
          <Link to="/" className={enlaceVolver}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </p>
      </section>
    );
  }

  const { videojuego, resumen, partidas } = datos;
  const Icono = iconoPlataforma(videojuego.plataforma);
  const logrosObtenidos = videojuego.logros.filter(l => l.obtenido).length;

  return (
    <section ref={contenedor} className="space-y-8">
      <Link to="/" className={enlaceVolver}>
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-3 text-purple-300 shadow-[0_0_20px_rgb(168_85_247/0.4)]">
            <Icono className="h-8 w-8" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{videojuego.nombre}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`${insignia} border-zinc-500/50 bg-zinc-500/10 text-zinc-300`}>{videojuego.plataforma}</span>
              <span className={`${insignia} border-purple-400/50 bg-purple-400/10 text-purple-300`}>{videojuego.genero}</span>
              <span className={`${insignia} ${claseEstado(videojuego.estado)}`}>{videojuego.estado}</span>
            </div>
          </div>
        </div>
        <Link to={`/videojuegos/${videojuego._id}/editar`} className={botonSecundario}>
          <Pencil className="h-4 w-4" />
          Editar
        </Link>
      </header>

      {/* Resumen calculado: panel destacado (funcionalidad principal) */}
      <div className="anim-resumen relative overflow-hidden rounded-2xl border border-purple-500/60 bg-gradient-to-br from-purple-950/70 via-zinc-900 to-cyan-950/50 p-6 shadow-[0_0_45px_rgb(168_85_247/0.35)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
        <h2 className="relative mb-5 flex items-center gap-2 text-xl font-bold text-white">
          <Sparkles className="h-5 w-5 text-purple-300" />
          Resumen Calculado
        </h2>
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Estadistica icono={ListOrdered} etiqueta="Total de partidas" valor={String(resumen.totalPartidas)} />
          <Estadistica icono={Clock} etiqueta="Horas totales" valor={`${resumen.horasTotales} h`} />
          <Estadistica
            icono={CalendarClock}
            etiqueta="Última partida"
            valor={resumen.ultimaPartida ? formatearFecha(resumen.ultimaPartida) : 'Sin partidas'}
          />
          <Estadistica icono={TrendingUp} etiqueta="Avance actual" valor={`${resumen.porcentajeAvanceActual}%`} />
        </div>
        <div
          className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-zinc-800"
          role="progressbar"
          aria-valuenow={resumen.porcentajeAvanceActual}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_12px_rgb(34_211_238/0.8)] transition-all duration-700"
            style={{ width: `${resumen.porcentajeAvanceActual}%` }}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="anim-lista">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <Trophy className="h-5 w-5 text-amber-300" />
            Logros
            {videojuego.logros.length > 0 && (
              <span className="text-sm font-normal text-zinc-400">
                ({logrosObtenidos}/{videojuego.logros.length})
              </span>
            )}
          </h2>
          {errorLogro && (
            <p
              role="alert"
              className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-300"
            >
              <AlertTriangle className="h-5 w-5 shrink-0" />
              No se pudo actualizar el logro: {errorLogro}
            </p>
          )}
          {videojuego.logros.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-zinc-400">
              Este videojuego no tiene logros registrados.
            </p>
          ) : (
            <ul className="space-y-2">
              {videojuego.logros.map(l => (
                <li key={l._id}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                      l.obtenido
                        ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200 hover:shadow-emerald-500/20'
                        : 'border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-emerald-400/40 hover:shadow-emerald-500/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={l.obtenido}
                      onChange={e => void alternarLogro(l.nombre, e.target.checked)}
                      className="h-5 w-5 cursor-pointer accent-emerald-400"
                    />
                    <span className="flex-1">{l.nombre}</span>
                    {l.obtenido && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="anim-lista">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Clock className="h-5 w-5 text-cyan-300" />
              Partidas
            </h2>
            <Link to={`/partidas/nueva?videojuego=${videojuego._id}`} className={botonPrimario}>
              <Plus className="h-4 w-4" />
              Registrar partida
            </Link>
          </div>
          {partidas.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-zinc-400">
              Aún no hay partidas registradas para este videojuego.
            </p>
          ) : (
            <ul className="space-y-3">
              {partidas.map(p => (
                <li key={p._id} className={`${tarjeta} !p-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-white">{formatearFecha(p.fecha)}</span>
                    <span className="text-sm text-cyan-300">
                      {p.duracionMinutos} min · {p.porcentajeAvance}%
                    </span>
                  </div>
                  {p.notas && <p className="mt-2 text-sm text-zinc-400">{p.notas}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
