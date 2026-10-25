import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Gamepad2, Library, History } from 'lucide-react';
import VideojuegosList from './paginas/VideojuegosList';
import VideojuegoDetail from './paginas/VideojuegoDetail';
import VideojuegoForm from './paginas/VideojuegoForm';
import PartidasList from './paginas/PartidasList';
import PartidaForm from './paginas/PartidaForm';
import { botonSecundario } from './utils/estilos';

const enlaceBase =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 hover:scale-105 hover:text-cyan-300';
const enlaceActivo = 'bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgb(34_211_238/0.3)] ring-1 ring-cyan-400/50';
const enlaceInactivo = 'text-zinc-300 hover:bg-white/5';

function Navbar() {
  const { pathname } = useLocation();
  const enVideojuegos = pathname === '/' || pathname.startsWith('/videojuegos');
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
          <Gamepad2 className="h-6 w-6 text-purple-400 drop-shadow-[0_0_8px_rgb(168_85_247)]" />
          <span className="hidden sm:inline">
            Diario <span className="text-purple-400">Gamer</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={`${enlaceBase} ${enVideojuegos ? enlaceActivo : enlaceInactivo}`}>
            <Library className="h-4 w-4" />
            Mis Videojuegos
          </NavLink>
          <NavLink
            to="/partidas"
            className={({ isActive }) => `${enlaceBase} ${isActive ? enlaceActivo : enlaceInactivo}`}
          >
            <History className="h-4 w-4" />
            Historial de Partidas
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route path="/" element={<VideojuegosList />} />
            <Route path="/videojuegos/nuevo" element={<VideojuegoForm />} />
            <Route path="/videojuegos/:id" element={<VideojuegoDetail />} />
            <Route path="/videojuegos/:id/editar" element={<VideojuegoForm />} />
            <Route path="/partidas" element={<PartidasList />} />
            <Route path="/partidas/nueva" element={<PartidaForm />} />
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center gap-4 py-16 text-zinc-300">
                  <p className="text-xl">Página no encontrada.</p>
                  <Link to="/" className={botonSecundario}>
                    Volver
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
