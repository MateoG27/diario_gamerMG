/** Clases Tailwind de E2: solo tokens semánticos de DESIGN.md. */

const botonBase =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 ' +
  'min-h-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-fondo ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export const botonPrimarioE2 =
  `${botonBase} bg-primario text-texto hover:bg-primario/85 focus-visible:ring-primario`;

export const botonSecundarioE2 =
  `${botonBase} border border-acento/50 text-acento hover:bg-acento/10 focus-visible:ring-acento`;

export const botonPeligroE2 =
  `${botonBase} border border-peligro/50 text-peligro hover:bg-peligro/15 focus-visible:ring-peligro`;

export const campoE2 =
  'w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-texto placeholder:text-texto-suave ' +
  'focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario';

export const campoConErrorE2 = `${campoE2} !border-peligro`;

export const etiquetaCampoE2 = 'mb-1.5 block text-sm font-medium text-texto-suave';

export const mensajeErrorE2 =
  'flex items-start gap-2 text-sm text-peligro';

export const tarjetaE2 = 'rounded-xl border border-borde bg-superficie p-5';

export const tituloSeccionE2 = 'text-xl font-bold text-texto';

export const etiquetaDatoE2 =
  'text-xs font-medium uppercase tracking-wider text-texto-suave';

export const textoAuxiliarE2 = 'text-sm text-texto-suave';

const insigniaBase = 'rounded-full border px-2.5 py-0.5 text-xs font-medium';

export const insigniaExitoE2 =
  `${insigniaBase} inline-flex items-center gap-1 border-exito/50 bg-exito/10 text-exito`;

export const insigniaNeutraE2 =
  `${insigniaBase} inline-flex items-center gap-1 border-borde bg-superficie text-texto-suave`;
