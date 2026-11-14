# Diario de Progreso Gamer

## Idea del Proyecto

Diario de Progreso Gamer es una aplicación web para llevar el registro de los videojuegos que se juegan y de cada sesión de juego (partida). Para cada videojuego se guarda su plataforma, género, estado (jugando, pausado, completado o abandonado) y una lista de logros. Para cada partida se registra la fecha, cuántos minutos se jugó, el porcentaje de avance alcanzado y notas opcionales. Con esta información la aplicación calcula un resumen del progreso de cada juego.

Tecnologías: TypeScript, Node.js, Express y Mongoose (MongoDB) en el backend; React con Vite en el frontend.

## Diseño de Esquemas y Justificación

### `Videojuego` (colección principal)

Campos: `nombre`, `plataforma`, `genero`, `estado`, `logros` y marcas de tiempo (`createdAt`, `updatedAt`).

### `logros` → EMBEBIDO dentro de `Videojuego`

Los logros se guardan como un arreglo de sub-documentos (`{ nombre, obtenido }`) dentro del propio videojuego, porque:

- **Se leen siempre junto con el juego:** nunca se consulta un logro sin su videojuego, así que un solo documento evita consultas adicionales.
- **No tienen entidad propia:** un logro no existe fuera de un juego y no se relaciona con otras colecciones.
- **Es una lista corta y acotada:** un juego tiene un número limitado de logros, por lo que el documento no crece de forma peligrosa (muy por debajo del límite de 16 MB de MongoDB).

### `Partida` → REFERENCIADA a `Videojuego`

Cada partida es un documento en su propia colección con el campo `videojuego` (`ObjectId`, `ref: "Videojuego"`), porque:

- **Puede crecer sin límite con el tiempo:** cada sesión de juego agrega una partida nueva; embeberlas haría crecer el documento del videojuego indefinidamente.
- **Se consulta de forma independiente:** se necesitan listados, filtros por fecha y agregaciones sobre las partidas sin cargar todo el videojuego.

Se define además el índice `{ videojuego: 1, fecha: -1 }` para obtener rápidamente las partidas de un juego ordenadas de la más reciente a la más antigua.

## Fórmula del Resumen

El endpoint de resumen de un videojuego toma todas las partidas que referencian a ese `videojuego` y calcula:

| Campo | Cálculo |
| --- | --- |
| `totalPartidas` | Cantidad de partidas (conteo de documentos). |
| `horasTotales` | Suma de `duracionMinutos` de todas las partidas dividida entre 60. |
| `ultimaPartida` | Valor de `fecha` más reciente entre las partidas (máximo de `fecha`). |
| `porcentajeAvanceActual` | `porcentajeAvance` de la partida más reciente (la de mayor `fecha`). |

Ejemplo de respuesta:

```json
{
  "totalPartidas": 3,
  "horasTotales": 4.5,
  "ultimaPartida": "2026-10-20T20:00:00.000Z",
  "porcentajeAvanceActual": 55
}
```

Si el videojuego no tiene partidas, el resumen devuelve `totalPartidas: 0`, `horasTotales: 0`, `ultimaPartida: null` y `porcentajeAvanceActual: 0`.

## Endpoint de Progreso Semanal (épica E2)

`GET /api/videojuegos/:id/progreso-semanal`

Devuelve el progreso del videojuego frente a su meta semanal, la racha y el estado de los hitos. La semana va de lunes a domingo en la zona `America/Guayaquil`. Todo se calcula al leer; no se guarda ningún dato derivado. No recibe cuerpo ni parámetros.

Ejemplo de respuesta (200):

```json
{
  "videojuego": "<id>",
  "zona": "America/Guayaquil",
  "hoy": "2026-11-12",
  "semana": { "inicio": "2026-11-09", "fin": "2026-11-15" },
  "meta": { "_id": "<metaId>", "horasSemana": 5, "diasSemana": 3 },
  "horasJugadas": 7,
  "diasJugados": 2,
  "porcentajeHoras": 100,
  "cumplida": false,
  "racha": { "actual": 2, "mejor": 6 },
  "avanceActual": 60,
  "hitos": [
    { "porcentaje": 25, "alcanzado": true },
    { "porcentaje": 50, "alcanzado": true },
    { "porcentaje": 75, "alcanzado": false }
  ]
}
```

| Campo | Descripción |
| --- | --- |
| `hoy`, `semana.inicio`, `semana.fin` | Fechas `AAAA-MM-DD` en Ecuador. La semana incluye lunes y domingo. |
| `meta` | Meta activa del videojuego, o `null` si no tiene. |
| `horasJugadas` | Horas reales de la semana, con un decimal y sin tope. |
| `diasJugados` | Días distintos con partidas en la semana. |
| `porcentajeHoras` | Entero de 0 a 100 (redondeado hacia abajo y con tope en 100), o `null` sin meta. |
| `cumplida` | `true` solo si se alcanzan las horas **y** los días de la meta; `null` sin meta. |
| `racha` | `actual` (días seguidos que terminan hoy o ayer) y `mejor` (histórica), por videojuego. |
| `avanceActual` | Porcentaje de avance de la última partida (0 si no hay partidas). |
| `hitos` | Porcentajes de la meta ordenados de menor a mayor, con `alcanzado` calculado en cada lectura. Lista vacía si no hay meta. |

Si el videojuego no tiene meta activa, `meta`, `porcentajeHoras` y `cumplida` son `null` y `hitos` es una lista vacía; la racha se calcula igual.

Errores (formato `{ "error": string, "requestId": string }`):

- `400` `Identificador inválido`.
- `404` `Videojuego no encontrado`.

## Cómo trabajamos con el agente

### Harness

- **Hooks** (`.claude/settings.json`):
  - `bloquear-env.mjs` (PreToolUse) impide leer o modificar archivos `.env`; solo se permite `.env.example`.
  - `formatear.mjs` (PostToolUse) formatea los archivos que edita el agente.
- **`.cursorignore`**: mantiene los archivos `.env` fuera del contexto del agente.
- **Reglas del proyecto**: `AGENTS.md` define el stack, la estructura, las convenciones y las reglas (por ejemplo, no agregar dependencias sin permiso).

### Flujo de trabajo

PRD -> Backlog -> Specs -> Tests -> Código

1. El **PRD** define el producto y las reglas de negocio.
2. El **backlog** lo baja a historias, criterios de aceptación y tickets.
3. Cada funcionalidad se detalla en una **spec** antes de programarla.
4. Primero se escribe el **test** y luego el **código**, en commits separados (`test (E2): T-xx`, `feat (E2): T-xx`, `fix (deuda): D-x`).

### Documentos (`docs/`)

| Documento | Contenido |
| --- | --- |
| `prd/prd-diario-gamer.md` | PRD y reglas de negocio (RN-01 a RN-14). |
| `backlog/epicas.md` | Listado de épicas. |
| `backlog/E2-metas-y-rachas.md` | Historias, criterios (CA-01 a CA-30) y tickets de E2. |
| `specs/E2-backend-meta-progreso.md` | Spec del backend de E2. |
| `specs/E2-frontend-progreso-meta.md` | Spec del frontend de E2. |
| `diagnostico.md` | Diagnóstico inicial del proyecto. |
| `AUDITORIA.md` | Auditoría de los criterios CA-01 a CA-30. |
| `pruebas-backend.md` | Evidencia de pruebas manuales del backend. |
| `bitacora-agente.md` | Bitácora del trabajo con el agente, por fases. |

### Variables de entorno

Cada paquete tiene su plantilla `.env.example`. Copia el archivo a `.env` y completa los valores:

- `backend/.env.example`: `MONGODB_URI`, `MONGODB_DB` y `PORT`.
- `frontend/.env.example`: `VITE_API_URL`.
