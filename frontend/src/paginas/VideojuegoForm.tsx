import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react';
import {
  ESTADOS,
  GENEROS,
  PLATAFORMAS,
  videojuegosApi,
  type Estado,
  type Genero,
  type Plataforma,
} from '../api/videojuegosApi';
import { mensajeError } from '../api/cliente';
import { EstadoCarga } from '../components/EstadoCarga';
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

gsap.registerPlugin(useGSAP);

/** Crea (`/videojuegos/nuevo`) o edita (`/videojuegos/:id/editar`) un videojuego. */
export default function VideojuegoForm() {
  const { id } = useParams<{ id: string }>();
  const editando = id !== undefined;
  const navegar = useNavigate();
  const contenedor = useRef<HTMLDivElement>(null);

  const [nombre, setNombre] = useState('');
  const [plataforma, setPlataforma] = useState<Plataforma>(PLATAFORMAS[0]);
  const [genero, setGenero] = useState<Genero>(GENEROS[0]);
  const [estado, setEstado] = useState<Estado>(ESTADOS[0]);

  const [cargando, setCargando] = useState(editando);
  const [error, setError] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (id === undefined) return;
    let activo = true;
    setCargando(true);
    setError(null);
    videojuegosApi
      .obtener(id)
      .then(v => {
        if (!activo) return;
        setNombre(v.nombre);
        setPlataforma(v.plataforma);
        setGenero(v.genero);
        setEstado(v.estado);
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
      if (cargando || error || !contenedor.current || animacionesReducidas()) return;
      gsap.from(contenedor.current, { opacity: 0, y: 24, duration: 0.5, ease: 'power2.out', clearProps: 'opacity,transform' });
    },
    { dependencies: [cargando, error] },
  );

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErrorEnvio(null);
    setEnviando(true);
    try {
      const datos = { nombre: nombre.trim(), plataforma, genero, estado };
      const guardado = editando ? await videojuegosApi.actualizar(id, datos) : await videojuegosApi.crear(datos);
      navegar(`/videojuegos/${guardado._id}`);
    } catch (err) {
      setErrorEnvio(mensajeError(err));
      setEnviando(false);
    }
  }

  if (cargando || error) {
    return (
      <section>
        <EstadoCarga cargando={cargando} error={error} />
        <p className="mt-6">
          <Link to="/" className={enlaceVolver}>
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
          {editando ? 'Editar' : 'Nuevo'} <span className="text-purple-400">videojuego</span>
        </h1>
        <form onSubmit={e => void enviar(e)} className="space-y-5">
          <div>
            <label htmlFor="nombre" className={etiqueta}>
              Nombre
            </label>
            <input
              id="nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              maxLength={120}
              placeholder="Ej: The Legend of Zelda"
              className={campo}
            />
          </div>
          <div>
            <label htmlFor="plataforma" className={etiqueta}>
              Plataforma
            </label>
            <select
              id="plataforma"
              value={plataforma}
              onChange={e => setPlataforma(e.target.value as Plataforma)}
              className={campo}
            >
              {PLATAFORMAS.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="genero" className={etiqueta}>
              Género
            </label>
            <select id="genero" value={genero} onChange={e => setGenero(e.target.value as Genero)} className={campo}>
              {GENEROS.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="estado" className={etiqueta}>
              Estado
            </label>
            <select id="estado" value={estado} onChange={e => setEstado(e.target.value as Estado)} className={campo}>
              {ESTADOS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
              {enviando ? 'Guardando...' : 'Guardar'}
            </button>
            <Link to={editando ? `/videojuegos/${id}` : '/'} className={botonSecundario}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
