# DESIGN.md — Identidad visual de Diario de Progreso Gamer

Tema oscuro con acentos púrpura (primario) y cian (acento). Los tokens viven en `@theme` dentro de `frontend/src/index.css`.

## 1. Principios

- Oscuro y sobrio: el contenido (horas, metas, rachas) manda; los acentos guían la mirada.
- Cálido y sin culpa: el diario acompaña, no juzga.
- Accesible por defecto: contraste, foco visible y estados que no dependen solo del color.

## 2. Paleta de tokens semánticos

| Token | Hex | Clases Tailwind | Uso |
|---|---|---|---|
| `--color-fondo` | `#09090b` | `bg-fondo`, `ring-offset-fondo` | Fondo de la página |
| `--color-superficie` | `#18181b` | `bg-superficie` | Tarjetas, paneles, campos, diálogos |
| `--color-borde` | `#3f3f46` | `border-borde`, `divide-borde` | Bordes y pistas de barras |
| `--color-texto` | `#f4f4f5` | `text-texto` | Texto principal |
| `--color-texto-suave` | `#a1a1aa` | `text-texto-suave` | Texto secundario, ayudas, etiquetas |
| `--color-primario` | `#9333ea` | `bg-primario`, `border-primario`, `ring-primario` | Acción principal, foco, énfasis |
| `--color-acento` | `#22d3ee` | `text-acento`, `border-acento` | Acción secundaria, iconos, datos destacados |
| `--color-exito` | `#34d399` | `text-exito`, `bg-exito/10` | Meta cumplida, logro obtenido, jugando |
| `--color-aviso` | `#fbbf24` | `text-aviso`, `bg-aviso/10` | Pausado, atención, meta cerca |
| `--color-peligro` | `#ef4444` | `text-peligro`, `bg-peligro/10` | Errores y acciones destructivas |

**Regla:** el código nuevo de E2 usa clases como `bg-superficie`, `text-texto` y `border-borde`. **Nunca** colores fijos `zinc-*`, `purple-*`, `cyan-*`, `emerald-*`, `amber-*` o `red-*`. Las variantes con opacidad usan el token (`bg-primario/10`, `border-exito/50`). El código existente se migra aparte (deuda), no en E2.

## 3. Tipografía y espaciado

- Fuente: la del sistema (sin fuentes externas).
- Escala:
  - Título de página (h1): `text-3xl font-extrabold tracking-tight text-texto`.
  - Sección (h2): `text-xl font-bold text-texto`.
  - Cuerpo: `text-base text-texto`.
  - Auxiliar: `text-sm text-texto-suave`.
  - Etiqueta de dato: `text-xs font-medium uppercase tracking-wider text-texto-suave`.
- Espaciado en múltiplos de 4 px:
  - Entre secciones: `space-y-8`.
  - Grillas: `gap-4` (tarjetas) y `gap-8` (columnas).
  - Elementos en línea: `gap-2`.
  - Relleno: `p-4` (ítems), `p-5` (tarjetas), `p-6` (paneles).
- Radios: `rounded-lg` (botones, campos), `rounded-xl` (tarjetas), `rounded-2xl` (paneles), `rounded-full` (insignias, barras).

## 4. Componentes

### Botones
Base: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition duration-200`, con `focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-fondo` y `disabled:opacity-50 disabled:cursor-not-allowed`.

- **Primario:** `bg-primario text-texto hover:bg-primario/85 focus-visible:ring-primario`.
- **Secundario:** `border border-acento/50 text-acento hover:bg-acento/10 focus-visible:ring-acento`.
- **Peligro:** `border border-peligro/50 text-peligro hover:bg-peligro/15 focus-visible:ring-peligro`.
- Los botones solo con icono llevan `aria-label` y `title`. Altura táctil mínima de 44 px en móvil.

### Campos de formulario
- `label` visible (`text-sm font-medium text-texto-suave`) enlazada con `htmlFor`; si no hay etiqueta visible, `aria-label`.
- Campo: `w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-texto placeholder:text-texto-suave focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario`.
- Error: borde `border-peligro`, `aria-invalid="true"`, `aria-describedby` apuntando a un mensaje con icono y texto (`text-peligro`). El mensaje dice qué pasó y cómo corregirlo.
- Ayudas en `text-sm text-texto-suave`.

### Tarjetas
`rounded-xl border border-borde bg-superficie p-5`. Hover opcional: `hover:border-primario/60`. Un título (h2/h3) por tarjeta.

### Insignias
`rounded-full border px-2.5 py-0.5 text-xs font-medium`, con fondo al 10 % y borde al 50 % del token. Siempre llevan texto (y opcionalmente icono):

- Jugando / obtenido: `border-exito/50 bg-exito/10 text-exito`.
- Pausado: `border-aviso/50 bg-aviso/10 text-aviso`.
- Completado: `border-acento/50 bg-acento/10 text-acento`.
- Neutra: `border-borde bg-superficie text-texto-suave`.

### Barra de progreso
```tsx
<div
  role="progressbar"
  aria-label="Progreso de la meta semanal"
  aria-valuenow={6}
  aria-valuemin={0}
  aria-valuemax={8}
  aria-valuetext="6 h de 8 h esta semana"
  className="h-2.5 overflow-hidden rounded-full bg-borde"
>
  <div className="h-full rounded-full bg-primario" style={{ width: '75%' }} />
</div>
```
- Atributos ARIA obligatorios: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, y `aria-label` o `aria-labelledby`. Se añade `aria-valuetext` cuando el número solo no se entiende.
- Relleno `bg-primario` (puede ir de `primario` a `acento`). Al cumplir la meta pasa a `bg-exito` y se muestra el texto «¡Meta cumplida!» con icono.
- Siempre se acompaña de un valor en texto visible (ej. «6 h de 8 h»), no solo de la barra.
- Los cambios de progreso se anuncian en una región `aria-live="polite"`.
- La transición de ancho solo se anima si no hay `prefers-reduced-motion`.

### Diálogos de confirmación
- Contenedor: `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` (título) y `aria-describedby` (descripción). Panel `bg-superficie border-borde rounded-2xl p-6` sobre un velo `bg-fondo/80`.
- Foco inicial en la opción segura («Mantener»); el foco queda atrapado dentro y vuelve al elemento que abrió el diálogo al cerrar.
- `Esc` cancela. Clic en el velo no confirma acciones destructivas.
- Dos botones con texto explícito: secundario («Mantener») y peligro («Eliminar meta»). Nunca «Sí» / «No».
- Texto de ejemplo: «¿Eliminar esta meta? Tus partidas se conservan; solo se quita la meta semanal.»

## 5. Tono de los textos de UI

Segunda persona, cálido y sin culpa. Se dice lo que sigue, no lo que falló.

| Sí | No |
|---|---|
| Te faltan 1,5 h para tu meta | No cumpliste tu meta |
| Llevas 3 días seguidos, ¡buen ritmo! | Perdiste tu racha |
| Retoma cuando quieras: tu racha empieza hoy | Estás atrasado |
| No pudimos guardar tu partida. Inténtalo de nuevo | Error al guardar |
| Alcanzaste tu hito de 50 h | Hito desbloqueado (sin contexto) |

- Frases cortas, verbos claros, sin mayúsculas gritando ni signos de exclamación en exceso.
- Los errores explican qué pasó y qué puede hacer la persona.
- Los estados vacíos invitan a empezar («Aún no tienes partidas: registra la primera»).

## 6. Accesibilidad

- **Contraste (WCAG 2.1 AA):**
  - `texto` sobre `fondo` o `superficie`: contraste muy alto.
  - `texto-suave` sobre `superficie`: ≈ 6,9:1 (cumple).
  - `texto` sobre `bg-primario`: ≈ 5,4:1 (cumple).
  - `primario` sobre `fondo`: ≈ 3,7:1; solo para iconos, bordes y texto grande, **nunca** texto pequeño. Para texto sobre fondo oscuro se usa `acento` o `texto`.
  - `borde` sobre `fondo`: ≈ 1,9:1, es decorativo; cada campo debe tener además etiqueta y foco visible.
  - `exito`, `aviso`, `peligro` y `acento` cumplen sobre `fondo` y `superficie`.
- **Foco visible** en todo elemento interactivo (`focus-visible:ring-2`).
- **ARIA:**
  - `role="alert"` para errores.
  - `aria-live="polite"` para cambios de progreso.
  - `aria-label` en botones solo con icono.
  - `aria-hidden="true"` en iconos decorativos.
  - `aria-invalid` y `aria-describedby` en campos con error.
- **El color nunca es el único canal:** todo estado lleva texto y/o icono (✓ «Obtenido», ⚠ error, «Pausado»).
- **Movimiento:** respetar `prefers-reduced-motion`; sin animaciones esenciales para entender la interfaz.
- Navegación completa por teclado; HTML semántico (`header`, `main`, `section`, `ul`, `button`).

## 7. Librerías autorizadas

- **Tailwind v4** (tokens en `@theme`).
- **`lucide-react`** para iconos.
- **GSAP** (con `@gsap/react`) solo para animaciones de entrada, siempre detrás de una guarda `prefers-reduced-motion` (ver `animacionesReducidas()` en `frontend/src/utils/estilos.ts`).

Cualquier otra librería (UI, animación, iconos, fuentes) requiere permiso previo.

## 8. No hacemos

- No usamos colores fijos (`zinc-*`, `purple-*`, etc.) ni hex sueltos en código nuevo de E2.
- No agregamos librerías de UI, animación o iconos fuera de las autorizadas.
- No usamos un tono culpabilizador ni castigamos rachas rotas.
- No comunicamos estados solo con color.
- No hacemos animaciones continuas ni que ignoren `prefers-reduced-motion`.
- No hay modo claro ni sombras de neón excesivas.
- No usamos `confirm()`/`alert()` nativos del navegador.
- No dejamos diálogos sin gestión de foco.
- No dejamos barras de progreso sin atributos ARIA ni sin valor en texto.
- No usamos fuentes externas.
