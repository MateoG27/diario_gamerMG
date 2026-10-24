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
