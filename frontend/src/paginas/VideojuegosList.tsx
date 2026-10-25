import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Monitor, Gamepad2, ToggleLeft, Smartphone, Plus, Pencil, Trash2, Filter, AlertTriangle, type LucideIcon } from 'lucide-react';
import { ESTADOS, videojuegosApi, type Plataforma, type Videojuego } from '../api/videojuegosApi';
import { mensajeError } from '../api/cliente';
import { EstadoCarga } from '../components/EstadoCarga';
import {
  animacionesReducidas,
  botonPeligro,
  botonPrimario,
  botonSecundario,
  campo,
  claseEstado,
  insignia,
  tarjeta,
  titulo,
} from '../utils/estilos';

gsap.registerPlugin(useGSAP);

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

export default function VideojuegosList() {
  const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
  const [estado, setEstado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);
  const contenedor = useRef<HTMLElement>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    videojuegosApi
      .listar(estado || undefined)
      .then(datos => {
        if (activo) setVideojuegos(datos);
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
  }, [estado, recarga]);

  // Entrada escalonada de las tarjetas cada vez que se carga una lista nueva.
  useGSAP(
    () => {
      if (cargando || animacionesReducidas()) return;
      gsap.from('.item-anim', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: contenedor, dependencies: [cargando, videojuegos] },
  );

  async function eliminar(v: Videojuego) {
    if (!window.confirm(`¿Eliminar "${v.nombre}"?`)) return;
    setErrorEliminar(null);
    try {
      await videojuegosApi.eliminar(v._id);
      setRecarga(n => n + 1);
    } catch (e) {
      setErrorEliminar(mensajeError(e));
    }
  }

  return (
    <section ref={contenedor}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className={titulo}>
          Mis <span className="text-purple-400">Videojuegos</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <Filter className="h-4 w-4 text-cyan-400" />
            Filtrar por estado:
            <select value={estado} onChange={e => setEstado(e.target.value)} className={`${campo} w-auto`}>
              <option value="">Todos</option>
              {ESTADOS.map(e => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
          <Link to="/videojuegos/nuevo" className={botonPrimario}>
            <Plus className="h-4 w-4" />
            Nuevo videojuego
          </Link>
        </div>
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

      <EstadoCarga cargando={cargando} error={error} vacio={!cargando && !error && videojuegos.length === 0} />

      {!cargando && !error && videojuegos.length > 0 && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videojuegos.map(v => {
            const Icono = iconoPlataforma(v.plataforma);
            return (
              <li key={v._id} className={`item-anim flex flex-col gap-4 ${tarjeta}`}>
                <Link to={`/videojuegos/${v._id}`} className="group flex items-start gap-3">
                  <span className="rounded-lg border border-purple-500/40 bg-purple-500/10 p-2.5 text-purple-300 transition group-hover:shadow-[0_0_18px_rgb(168_85_247/0.6)]">
                    <Icono className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-lg text-white transition group-hover:text-purple-300">
                      {v.nombre}
                    </strong>
                    <span className="text-sm text-zinc-400">{v.plataforma}</span>
                  </span>
                </Link>
                <div className="flex flex-wrap gap-2">
                  <span className={`${insignia} border-purple-400/50 bg-purple-400/10 text-purple-300`}>{v.genero}</span>
                  <span className={`${insignia} ${claseEstado(v.estado)}`}>{v.estado}</span>
                </div>
                <div className="mt-auto flex gap-2 pt-1">
                  <Link to={`/videojuegos/${v._id}/editar`} className={botonSecundario}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                  <button type="button" onClick={() => void eliminar(v)} className={botonPeligro}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
