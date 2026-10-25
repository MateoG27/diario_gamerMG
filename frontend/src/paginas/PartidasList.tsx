import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertTriangle, CalendarClock, Clock, Plus, Trash2, TrendingUp } from 'lucide-react';
import { partidasApi, type PartidaPopulada } from '../api/partidasApi';
import { mensajeError } from '../api/cliente';
import { EstadoCarga } from '../components/EstadoCarga';
import { formatearFecha } from '../utils/formato';
import { animacionesReducidas, botonPeligro, botonPrimario, tarjeta, titulo } from '../utils/estilos';

gsap.registerPlugin(useGSAP);

export default function PartidasList() {
  const [partidas, setPartidas] = useState<PartidaPopulada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);
  const contenedor = useRef<HTMLElement>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    partidasApi
      .listar()
      .then(datos => {
        if (activo) setPartidas(datos);
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
  }, [recarga]);

  useGSAP(
    () => {
      if (cargando || animacionesReducidas()) return;
      gsap.from('.item-anim', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: contenedor, dependencies: [cargando, partidas] },
  );

  async function eliminar(p: PartidaPopulada) {
    if (!window.confirm('¿Eliminar esta partida?')) return;
    setErrorEliminar(null);
    try {
      await partidasApi.eliminar(p._id);
      setRecarga(n => n + 1);
    } catch (e) {
      setErrorEliminar(mensajeError(e));
    }
  }

  return (
    <section ref={contenedor}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className={titulo}>
          Historial de <span className="text-cyan-400">Partidas</span>
        </h1>
        <Link to="/partidas/nueva" className={botonPrimario}>
          <Plus className="h-4 w-4" />
          Nueva partida
        </Link>
      </div>

      {errorEliminar && (
        <p
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-300"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          No se pudo eliminar: {errorEliminar}
        </p>
      )}

      <EstadoCarga cargando={cargando} error={error} vacio={!cargando && !error && partidas.length === 0} />

      {!cargando && !error && partidas.length > 0 && (
        <ul className="space-y-3">
          {partidas.map(p => (
            <li key={p._id} className={`item-anim ${tarjeta} !p-4`}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="min-w-0 flex-1 basis-48">
                  <strong className="block truncate text-lg text-white">
                    {p.videojuego?.nombre ?? '(videojuego no disponible)'}
                  </strong>
                  {p.notas && <p className="mt-1 text-sm text-zinc-400">{p.notas}</p>}
                </div>
                <span className="flex items-center gap-1.5 text-sm text-zinc-300">
                  <CalendarClock className="h-4 w-4 text-cyan-400" />
                  {formatearFecha(p.fecha)}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-zinc-300">
                  <Clock className="h-4 w-4 text-purple-400" />
                  {p.duracionMinutos} min
                </span>
                <span className="flex items-center gap-2 text-sm text-emerald-300">
                  <TrendingUp className="h-4 w-4" />
                  {p.porcentajeAvance}%
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
                    <span
                      className="block h-full rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153)]"
                      style={{ width: `${p.porcentajeAvance}%` }}
                    />
                  </span>
                </span>
                <button type="button" onClick={() => void eliminar(p)} className={botonPeligro}>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
