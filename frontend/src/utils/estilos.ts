/** Clases Tailwind compartidas (tema oscuro con acentos neón). */

const botonBase =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 ' +
  'hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

export const botonPrimario =
  `${botonBase} bg-purple-600 text-white shadow-[0_0_15px_rgb(168_85_247/0.45)] ` +
  'hover:bg-purple-500 hover:shadow-[0_0_28px_rgb(168_85_247/0.8)] focus-visible:ring-purple-400';

export const botonSecundario =
  `${botonBase} border border-cyan-400/50 text-cyan-300 ` +
  'hover:border-cyan-300 hover:bg-cyan-400/10 hover:shadow-[0_0_18px_rgb(34_211_238/0.35)] focus-visible:ring-cyan-400';

export const botonPeligro =
  `${botonBase} border border-red-500/50 text-red-400 ` +
  'hover:border-red-400 hover:bg-red-500/15 hover:shadow-[0_0_18px_rgb(239_68_68/0.35)] focus-visible:ring-red-400';

export const campo =
  'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 transition ' +
  'hover:border-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500';

export const etiqueta = 'mb-1.5 block text-sm font-medium text-zinc-300';

export const tarjeta =
  'rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-black/40 backdrop-blur transition duration-300 ' +
  'hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/20';

export const panelFormulario =
  'mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl shadow-black/50 backdrop-blur';

export const titulo = 'text-3xl font-extrabold tracking-tight text-white';

export const enlaceVolver =
  'inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:-translate-x-1 hover:text-cyan-300';

export const insignia = 'rounded-full border px-2.5 py-0.5 text-xs font-medium';

export function claseEstado(estado: string): string {
  switch (estado) {
    case 'jugando':
      return 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300';
    case 'pausado':
      return 'border-amber-400/50 bg-amber-400/10 text-amber-300';
    case 'completado':
      return 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300';
    default:
      return 'border-zinc-500/50 bg-zinc-500/10 text-zinc-300';
  }
}

/** Respeta la preferencia del sistema de reducir animaciones. */
export function animacionesReducidas(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
