# Spec: E2-backend-meta-progreso

## Contexto

Esta spec cubre el backend de la épica E2 (Metas y rachas): el modelo y la gestión de la **meta semanal** por videojuego, el cálculo del **progreso semanal** (horas, días, racha e hitos) y las dos deudas de la fase 8 que lo alimentan (validar y editar partidas). Los tickets T-08 a T-13 (frontend, seed, README y despliegue) quedan fuera de esta spec.

Fuentes:

- Producto: [`docs/prd/prd-diario-gamer.md`](../prd/prd-diario-gamer.md), reglas RN-01 a RN-14.
- Backlog: [`docs/backlog/E2-metas-y-rachas.md`](../backlog/E2-metas-y-rachas.md), historias HU-01 a HU-06, criterios CA-01 a CA-30 y tickets T-01 a T-07, D-1 y D-2.
- Diagnóstico: [`docs/diagnostico.md`](../diagnostico.md), hallazgos H01, H03, H04 y H10.

Historias que cubre (todos los criterios aplican al backend, total o parcialmente):

| historia | tema | criterios | tickets |
|---|---|---|---|
| HU-01 | Definir una meta semanal | CA-01 a CA-03 | T-04, T-05 |
| HU-02 | Ver horas y días de la semana frente a la meta | CA-04 a CA-06 | T-02, T-03, T-06 |
| HU-03 | Ver racha actual y mejor racha | CA-07 a CA-11 | T-02, T-03, T-06 |
| HU-04 | Ver hitos alcanzados | CA-12 a CA-18 | T-02 a T-06 |
| HU-05 | Editar o desactivar la meta | CA-19 a CA-23 | T-05, T-06 |
| HU-06 | Metas coherentes con el estado y la eliminación del juego | CA-24 a CA-27 | T-05, T-07 |
| Calidad de partidas | Partidas válidas y editables | CA-28 a CA-30 | D-1, D-2 |

### Decisiones definitivas

Producto:

- La semana va de lunes a domingo en hora de Ecuador.
- La semana está cumplida solo si se alcanzan las horas Y los días.
- La racha es por videojuego.
- Editar una meta modifica la meta activa en el lugar. Reemplazar una meta no tiene ruta propia: es llamar a desactivar la meta actual y luego crear una nueva. La meta nueva no copia hitos y tiene solo los que se envíen.
- El porcentaje de un hito se mide sobre el avance del videojuego, tomado de la última partida.
- `horasSemana` va de más de 0 hasta 100. Los hitos son enteros de 1 a 100, hasta 5.
- La tolerancia de fecha futura de una partida es de 5 minutos (D-1).
- Los días por semana de la meta van de 1 a 7.
- Las partidas con fecha futura que ya existan no se filtran del cálculo.
- El progreso no incluye `porcentajeDias`. Quien lo muestre lo calcula con `diasJugados` y `diasSemana`.

Técnicas:

- La base de datos guarda las fechas en UTC. La zona horaria se resuelve exclusivamente en el dominio (T-03), con `Intl.DateTimeFormat` y la zona `America/Guayaquil`. Esta spec no agrega criterios sobre fechas sin zona.
- Se asume que las fechas de las partidas llegan como instantes, como las envía hoy la interfaz.
- Dependencia nueva autorizada: solo `vitest`, como dependencia de desarrollo.
- Vitest se usa estrictamente para las funciones puras de `backend/src/dominio/`: el cálculo de progreso, rachas e hitos en `progreso.ts` (T-02 y T-03) y la función `validarDatosPartida` en `partida.ts` (D-1). Estas pruebas no tocan la base de datos.
- Todo lo demás se verifica a mano con curl o Thunder Client: modelos, CRUD, rutas, controladores y servicios (T-04, T-05, T-06, T-07 y D-2), además de la comprobación de las rutas de partidas de D-1.
- La validación de una partida vive en la función pura `validarDatosPartida`. El servicio la invoca al crear (D-1) y al editar (D-2) y convierte sus mensajes en un 400.

## Reglas

### DEBE

Tiempo y zona horaria

- DEBE calcular la semana en `America/Guayaquil`, de lunes a domingo, usando `Intl.DateTimeFormat` con `timeZone: 'America/Guayaquil'`, sin fijar un desfase a mano.
- DEBE resolver la zona horaria solo dentro de `backend/src/dominio/progreso.ts`. Servicios, controladores y modelos trabajan con instantes en UTC.
- DEBE asignar cada partida al día en que inicia, medido en `America/Guayaquil`, y contar todos sus minutos en la semana de ese día (RN-03).
- DEBE recibir la hora actual como parámetro (`ahora`) en todas las funciones de dominio. El servicio es quien obtiene la hora y se la pasa.

Progreso semanal

- DEBE calcular el progreso al leer, con la meta activa en ese momento (RN-04). No se guarda ningún dato derivado.
- DEBE sumar los minutos de todas las partidas de la semana, y contar cada día con partidas una sola vez (RN-02).
- DEBE limitar `porcentajeHoras` a 100 y devolver `horasJugadas` con el valor real acumulado (RN-05).
- DEBE calcular `porcentajeHoras` como número entero, redondeado hacia abajo, para que solo llegue a 100 cuando se alcanzan las horas.
- DEBE marcar `cumplida` como verdadera solo si se cumplen las horas Y los días de la meta. La comparación usa los minutos exactos, no el valor redondeado.
- DEBE responder el progreso aunque el videojuego no tenga meta activa. En ese caso `meta`, `porcentajeHoras` y `cumplida` son `null`, y `hitos` es una lista vacía. La racha se calcula igual.

Racha

- DEBE contar la racha actual como los días seguidos jugados que terminan hoy o ayer (RN-01).
- DEBE devolver la racha actual en 0 cuando el último día jugado es anterior a ayer, y conservar la mejor racha histórica (RN-01).
- DEBE calcular la mejor racha sobre todas las partidas del videojuego. Si la racha actual la supera o la iguala, la mejor racha toma ese valor.
- DEBE devolver racha actual y mejor racha en 0 si no hay partidas.

Hitos

- DEBE calcular `alcanzado` en cada lectura como `avanceActual >= porcentaje` (RN-06, RN-11).
- DEBE tomar `avanceActual` de la partida más reciente (por fecha, y por fecha de creación en caso de empate), igual que el resumen del videojuego. Sin partidas es 0.
- DEBE guardar y devolver los hitos ordenados de menor a mayor (RN-10).
- DEBE aceptar un hito cuyo porcentaje ya está superado por el avance actual (RN-11).
- DEBE rechazar más de 5 hitos y porcentajes repetidos (RN-10).
- DEBE exigir que cada hito sea un entero entre 1 y 100.

Metas

- DEBE permitir como máximo una meta activa por videojuego, tanto con una verificación previa como con un índice único parcial (RN-14).
- DEBE exigir `horasSemana` mayor que 0 y no mayor que 100, y `diasSemana` entero entre 1 y 7.
- DEBE rechazar crear una meta en un videojuego completado o abandonado (RN-07).
- DEBE desactivar la meta activa de un videojuego cuando este pasa a completado o abandonado, ya sea por `PUT` o por `PATCH` (RN-07).
- DEBE conservar las metas desactivadas como historial, con la fecha de desactivación (RN-12).
- DEBE rechazar toda modificación sobre una meta desactivada (RN-13).
- DEBE permitir reemplazar una meta como dos pasos independientes: desactivar la actual y crear una nueva (RN-12).
- DEBE eliminar todas las metas, activas e inactivas, al eliminar un videojuego sin partidas (RN-08).
- DEBE seguir bloqueando la eliminación de un videojuego con partidas, y conservar sus metas (RN-08).

Partidas (deudas D-1 y D-2)

- DEBE validar los datos de una partida con la función pura `validarDatosPartida`, ubicada en `backend/src/dominio/partida.ts`, que recibe la hora actual como parámetro y devuelve los mensajes de error en español (lista vacía si los datos son válidos).
- DEBE rechazar partidas con `duracionMinutos` menor o igual que 0 al crear y al editar (RN-09).
- DEBE rechazar partidas con fecha posterior a la hora actual más 5 minutos de tolerancia, al crear y al editar (RN-09). Una fecha igual a la hora actual más 5 minutos exactos se acepta.
- DEBE validar solo los campos que llegan al editar (D-2): una edición que no envía `fecha` no revisa la fecha.
- DEBE permitir editar solo `fecha`, `duracionMinutos`, `porcentajeAvance` y `notas`, con las mismas validaciones que al crear.

Errores y mensajes

- DEBE responder los errores de validación con 400, los recursos inexistentes con 404 y los conflictos de estado o duplicados con 409, siempre con mensajes en español.
- DEBE traducir el error 11000 (clave duplicada) a 409 en el manejador central de errores, con un mensaje fijo y sin exponer el contenido de la clave.
- DEBE usar `ApiError`, el flujo controlador -> servicio -> modelo y la lista blanca de campos del proyecto. Los campos numéricos y arreglos se validan en el servicio, sin modificar `cuerpo`.
- DEBE escribir las pruebas unitarias de T-02 antes del código de T-03, y las de `validarDatosPartida` antes del código de D-1, siempre en commits separados.
- DEBE verificar a mano los tickets de modelos, CRUD y rutas (T-04, T-05, T-06, T-07 y D-2) antes de su commit, sin tests automatizados.
- DEBE verificar D-1 con pruebas unitarias de `validarDatosPartida` Y con una comprobación manual de que las rutas de partidas responden 400.
- DEBE ejecutar `npm test` y `npm run check` antes de cada commit.

### NO DEBE

- NO DEBE guardar el estado alcanzado de un hito. El modelo solo guarda los porcentajes, y `alcanzado` se calcula en cada lectura (RN-06).
- NO DEBE leer la fecha actual (`new Date()`) dentro de las funciones de dominio. Tampoco `Date.now()` ni ningún otro reloj. Los tests pasan la fecha como parámetro.
- NO DEBE importar mongoose, express ni modelos en `backend/src/dominio`. El dominio no accede a la base de datos.
- NO DEBE convertir zonas horarias fuera del dominio, ni guardar fechas en una zona distinta de UTC.
- NO DEBE guardar la racha, el progreso ni el porcentaje de cumplimiento en la base de datos.
- NO DEBE crear una ruta para reemplazar metas. Reemplazar es desactivar y luego crear.
- NO DEBE permitir reactivar una meta desactivada, ni editarla, ni desactivarla otra vez (RN-13).
- NO DEBE ofrecer el borrado de una meta individual. Las metas solo se eliminan en cascada con su videojuego (RN-08 y RN-12).
- NO DEBE aceptar el campo `activa`, `desactivadaEn` ni `videojuego` en el cuerpo al editar una meta.
- NO DEBE dejar dos metas activas en el mismo videojuego, ni siquiera por peticiones simultáneas.
- NO DEBE cambiar la política de eliminación de partidas (se borran una por una) ni la de eliminación de videojuegos con partidas.
- NO DEBE permitir cambiar el videojuego de una partida al editarla.
- NO DEBE agregar dependencias distintas de `vitest`. En particular, ni `mongodb-memory-server`, ni `supertest`, ni librerías de fechas.
- NO DEBE usar Vitest fuera de `backend/src/dominio/`. Los modelos, el CRUD, las rutas, los controladores y los servicios no llevan tests automatizados.
- NO DEBE programar pruebas automatizadas de integración ni pruebas que usen `fetch` contra la aplicación o la base de datos.
- NO DEBE leer la fecha actual dentro de `validarDatosPartida`. La hora actual entra como parámetro, como en las demás funciones de dominio.
- NO DEBE leer ni modificar archivos `.env`.

## Contrato

Todas las respuestas de error tienen la forma `{ "error": string, "requestId": string }`. Los identificadores se validan con `idValido`. Los bloques siguientes usan `<id>` para el identificador del videojuego y `<metaId>` para el de la meta.

### Modelo Meta

| campo | tipo | notas |
|---|---|---|
| `_id` | texto | generado |
| `videojuego` | texto (id) | obligatorio, referencia al videojuego |
| `horasSemana` | número | mayor que 0 y hasta 100 |
| `diasSemana` | entero | de 1 a 7 |
| `hitos` | lista de enteros | hasta 5, de 1 a 100, sin repetir, guardada de menor a mayor |
| `activa` | booleano | por defecto `true` |
| `desactivadaEn` | fecha o `null` | se completa al desactivar |
| `createdAt`, `updatedAt` | fecha | automáticos |

Índice único parcial sobre `videojuego` donde `activa` es `true`. Un segundo índice `{ videojuego: 1, createdAt: -1 }` sirve al historial. Como el proyecto mantiene la creación automática de índices desactivada, los índices se crean con la sincronización de T-01.

### Rutas de metas

**Crear meta** — `POST /api/videojuegos/<id>/metas`

- Request: `{ "horasSemana": number, "diasSemana": number, "hitos"?: number[] }`. Todos los campos extra se rechazan.
- Response 201: la meta creada.
- Errores:
  - 400 `Identificador inválido`, `Falta el campo horasSemana`, `Falta el campo diasSemana`, `horasSemana debe ser mayor que 0 y no más de 100`, `diasSemana debe ser un entero entre 1 y 7`, `Cada hito debe ser un entero entre 1 y 100`, `Una meta admite como máximo 5 hitos`, `Los hitos no pueden repetir porcentaje`, `Campos no permitidos en el cuerpo`.
  - 404 `Videojuego no encontrado`.
  - 409 `El videojuego ya tiene una meta activa`.
  - 409 `No se puede crear una meta en un videojuego completado o abandonado`.

**Listar metas (historial)** — `GET /api/videojuegos/<id>/metas`

- Response 200: lista de metas del videojuego, activas e inactivas, de la más reciente a la más antigua.
- Errores: 400 `Identificador inválido`, 404 `Videojuego no encontrado`.

**Consultar meta por id** — `GET /api/metas/<metaId>`

- Response 200: la meta.
- Errores: 400 `Identificador inválido`, 404 `Meta no encontrada`.

**Actualizar meta (edición en el lugar)** — `PATCH /api/metas/<metaId>`

- Request: cualquier subconjunto de `{ "horasSemana", "diasSemana", "hitos" }`. Si se envía `hitos`, la lista reemplaza por completo a la anterior.
- Response 200: la meta actualizada.
- Errores:
  - 400 los mismos de crear, y `Campos no permitidos en el cuerpo` si se envía `activa`, `desactivadaEn` o `videojuego`.
  - 404 `Meta no encontrada`.
  - 409 `La meta está desactivada y no se puede modificar`.

**Desactivar meta** — `POST /api/metas/<metaId>/desactivar`

- Request: sin cuerpo.
- Response 200: la meta con `activa: false` y `desactivadaEn` con la fecha.
- Errores: 400 `Identificador inválido`, 404 `Meta no encontrada`, 409 `La meta ya está desactivada`.

**Reemplazar una meta** no tiene ruta. Se hace con dos llamadas: `POST /api/metas/<metaId>/desactivar` y luego `POST /api/videojuegos/<id>/metas`. Si la segunda falla, la meta anterior queda desactivada y el jugador puede volver a intentar la creación.

**No existen** rutas para reactivar ni para borrar una meta. Una petición a una ruta así recibe el 404 general de rutas no encontradas.

### Cambios sobre rutas existentes

| ruta | cambio | errores nuevos |
|---|---|---|
| `PUT` y `PATCH /api/videojuegos/<id>` | Si el estado resultante es `completado` o `abandonado`, desactiva la meta activa del juego. | ninguno |
| `DELETE /api/videojuegos/<id>` | Sin partidas: elimina el juego y todas sus metas. Con partidas: sigue respondiendo 409 `No se puede eliminar: el videojuego tiene partidas registradas`. | ninguno |
| `POST /api/partidas` | Valida con `validarDatosPartida`: duración mayor que 0 y fecha no futura (tolerancia de 5 minutos). | 400 `duracionMinutos debe ser mayor que 0`, 400 `La fecha de la partida no puede ser futura` |
| `PATCH /api/partidas/<id>` (nueva, D-2) | Edita `fecha`, `duracionMinutos`, `porcentajeAvance` y `notas`. Response 200: la partida actualizada. | 400 `Identificador inválido`, 400 `Campos no permitidos en el cuerpo` (incluye `videojuego`), 400 las validaciones de `validarDatosPartida` (D-1), 404 `Partida no encontrada` |

El manejador central de errores responde 409 con `Registro duplicado` ante el error 11000, sin incluir `keyValue`.

### Progreso semanal

**Consultar progreso** — `GET /api/videojuegos/<id>/progreso-semanal`

- Request: sin cuerpo ni parámetros. La hora actual la obtiene el servicio.
- Response 200:

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

| campo | tipo | notas |
|---|---|---|
| `hoy`, `semana.inicio`, `semana.fin` | texto `AAAA-MM-DD` | fechas de calendario en Ecuador. La semana va de lunes a domingo, ambos incluidos |
| `meta` | objeto o `null` | `null` si no hay meta activa |
| `horasJugadas` | número | horas reales de la semana, con un decimal, sin tope |
| `diasJugados` | entero | días distintos con partidas en la semana, sin tope |
| `porcentajeHoras` | entero de 0 a 100 o `null` | `floor(minutosSemana / (horasSemana * 60) * 100)` con tope en 100 |
| `cumplida` | booleano o `null` | verdadero solo si se alcanzan horas y días |
| `racha.actual`, `racha.mejor` | enteros | por videojuego, en días |
| `avanceActual` | entero de 0 a 100 | avance de la última partida, 0 sin partidas |
| `hitos` | lista | ordenada de menor a mayor, vacía si no hay meta |

- Errores: 400 `Identificador inválido`, 404 `Videojuego no encontrado`.

### Funciones de dominio (`backend/src/dominio/`)

Funciones puras, sin acceso a la base de datos, que reciben `ahora: Date` cuando lo necesitan. Son lo único que se prueba con pruebas automatizadas (Vitest).

**`backend/src/dominio/progreso.ts`** (T-02 y T-03)

| función | entrada | salida |
|---|---|---|
| `diaEcuador` | `fecha: Date` | día `AAAA-MM-DD` en `America/Guayaquil` |
| `semanaEcuador` | `ahora: Date` | `{ inicio, fin }` del lunes al domingo que contiene a `ahora` |
| `calcularProgresoSemanal` | `partidas: { fecha, duracionMinutos }[]`, `meta: { horasSemana, diasSemana } o null`, `ahora` | `horasJugadas`, `diasJugados`, `porcentajeHoras`, `cumplida` |
| `calcularRacha` | `partidas: { fecha }[]`, `ahora` | `{ actual, mejor }` |
| `estadoHitos` | `hitos: number[]`, `avanceActual: number` | `{ porcentaje, alcanzado }[]` ordenada |

**`backend/src/dominio/partida.ts`** (D-1)

| función | entrada | salida |
|---|---|---|
| `validarDatosPartida` | `datos: { fecha?: Date, duracionMinutos?: number }`, `ahora: Date` | lista de mensajes de error en español, vacía si los datos son válidos |

- Si `duracionMinutos` viene y es menor o igual que 0, devuelve `duracionMinutos debe ser mayor que 0`.
- Si `fecha` viene y es posterior a `ahora` más 5 minutos, devuelve `La fecha de la partida no puede ser futura`. Una fecha igual a `ahora` más 5 minutos exactos es válida.
- Los campos que no vienen no se validan, para que la edición parcial de D-2 use la misma función.
- La tolerancia de 5 minutos es una constante del módulo.
- El servicio de partidas invoca la función con la hora actual y lanza un 400 con el primer mensaje.

Instantes de referencia para los casos límite de las pruebas (Ecuador es UTC-5 todo el año):

| instante UTC | hora en Ecuador |
|---|---|
| `2026-11-13T02:00:00Z` | jueves 12 de noviembre, 21:00 (el día UTC ya es el 13) |
| `2026-11-16T04:59:59Z` | domingo 15 de noviembre, 23:59:59 (último segundo de la semana) |
| `2026-11-16T05:00:00Z` | lunes 16 de noviembre, 00:00 (primer segundo de la semana siguiente) |

## Criterio -> verificación

Tipos de verificación:

- **Unitaria:** prueba Vitest automatizada de una función pura de `backend/src/dominio/` (`progreso.ts` en T-02 y `partida.ts` en D-1), sin base de datos y con `ahora` fijo. Es el único uso de Vitest.
- **Manual:** la prueba la hace el equipo con curl o Thunder Client sobre la ruta indicada, contra una base de desarrollo. Antes de probar los criterios que dependen del índice único parcial (CA-03), se ejecuta la sincronización de índices de T-01.
- **Revisión:** revisión de código o de la pantalla, cuando el criterio no es una llamada a la API.

| id | criterio | tipo de verificación | dónde se probará |
|---|---|---|---|
| CA-01 | Meta válida de 5 horas en 3 días queda activa | Manual | `POST /api/videojuegos/<id>/metas` con `{ "horasSemana": 5, "diasSemana": 3 }`: 201 y `activa: true` |
| CA-02 | Horas 0, negativas, mayores que 100, o días 0 o mayores que 7, se rechazan con 400 y mensaje en español | Manual | `POST /api/videojuegos/<id>/metas` con cada valor inválido |
| CA-03 | Segunda meta activa en el mismo juego se rechaza con 409 | Manual | Dos `POST /api/videojuegos/<id>/metas` seguidos al mismo juego: el segundo da 409 |
| CA-04 | Progreso de la semana lunes a domingo en Ecuador, cumplida solo con horas y días, sin sumar semanas anteriores | Unitaria y manual | `backend/src/dominio/progreso.test.ts` y `GET /api/videojuegos/<id>/progreso-semanal` con partidas de ejemplo |
| CA-05 | Partida del domingo 23:30 de 90 minutos cuenta completa en el domingo y en esa semana | Unitaria | `backend/src/dominio/progreso.test.ts` |
| CA-06 | Meta superada: `porcentajeHoras` 100, `horasJugadas` real y `cumplida` falsa si faltan días | Unitaria y manual | `backend/src/dominio/progreso.test.ts` y `GET /api/videojuegos/<id>/progreso-semanal` |
| CA-07 | Última partida ayer y hoy sin jugar: la racha sigue contando | Unitaria y manual | `backend/src/dominio/progreso.test.ts` y `GET /api/videojuegos/<id>/progreso-semanal` |
| CA-08 | Última partida anteayer o antes: racha actual 0 y mejor racha conservada | Unitaria y manual | `backend/src/dominio/progreso.test.ts` y `GET /api/videojuegos/<id>/progreso-semanal` |
| CA-09 | Varias partidas el mismo día cuentan un día, y sus minutos se suman | Unitaria y manual | `backend/src/dominio/progreso.test.ts` y `GET /api/videojuegos/<id>/progreso-semanal` |
| CA-10 | Sin partidas, racha actual y mejor racha en 0 | Unitaria y manual | `backend/src/dominio/progreso.test.ts` y `GET /api/videojuegos/<id>/progreso-semanal` |
| CA-11 | Jugar un día nuevo que continúa la racha sube la actual y actualiza la mejor | Unitaria | `backend/src/dominio/progreso.test.ts` |
| CA-12 | Hito alcanzado si el avance es igual o mayor que su porcentaje | Unitaria y manual | `backend/src/dominio/progreso.test.ts` y `GET /api/videojuegos/<id>/progreso-semanal` |
| CA-13 | Hito pendiente si el avance es menor | Unitaria y manual | `backend/src/dominio/progreso.test.ts` y `GET /api/videojuegos/<id>/progreso-semanal` |
| CA-14 | Si el avance baja al borrar o editar una partida, el hito vuelve a pendiente | Unitaria y manual | `backend/src/dominio/progreso.test.ts` (`estadoHitos` con un avance menor) y `GET /api/videojuegos/<id>/progreso-semanal` después de `DELETE /api/partidas/<id>` y de `PATCH /api/partidas/<id>` (D-2) |
| CA-15 | Un hito con porcentaje ya superado se crea y aparece alcanzado | Unitaria y manual | `backend/src/dominio/progreso.test.ts` (alcanzado) y `POST /api/videojuegos/<id>/metas` seguido de `GET /api/videojuegos/<id>/progreso-semanal` |
| CA-16 | Un sexto hito se rechaza con 400 | Manual | `POST /api/videojuegos/<id>/metas` y `PATCH /api/metas/<metaId>` con 6 hitos |
| CA-17 | Un porcentaje de hito repetido se rechaza con 400 | Manual | `POST /api/videojuegos/<id>/metas` y `PATCH /api/metas/<metaId>` con `hitos: [50, 50]` |
| CA-18 | Los hitos se guardan y se devuelven de menor a mayor | Unitaria y manual | `backend/src/dominio/progreso.test.ts` (`estadoHitos` ordenada) y `GET /api/videojuegos/<id>/metas` después de crear con `hitos: [75, 25, 50]` |
| CA-19 | Editar horas y días de la meta activa la actualiza y sigue siendo la única activa | Manual | `PATCH /api/metas/<metaId>` y luego `GET /api/videojuegos/<id>/metas` |
| CA-20 | Cambiar la meta a mitad de semana muestra el progreso contra la meta nueva | Unitaria y manual | `backend/src/dominio/progreso.test.ts` (mismas partidas con dos metas distintas) y `PATCH /api/metas/<metaId>` seguido de `GET /api/videojuegos/<id>/progreso-semanal` |
| CA-21 | Desactivar deja la meta inactiva con fecha y en el historial. La confirmación en pantalla se verifica en T-10, fuera de esta spec | Manual y revisión | `POST /api/metas/<metaId>/desactivar` y luego `GET /api/videojuegos/<id>/metas` |
| CA-22 | Una meta desactivada no se reactiva ni se edita: 409 al editar y 400 si se envía `activa` | Manual | `PATCH /api/metas/<metaId>` sobre una meta inactiva, `PATCH` con `activa: true` y una petición a una ruta de reactivar (404) |
| CA-23 | Reemplazar deja la anterior inactiva en el historial y la nueva activa | Manual | `POST /api/metas/<metaId>/desactivar`, luego `POST /api/videojuegos/<id>/metas` y `GET /api/videojuegos/<id>/metas` |
| CA-24 | No se crea meta en un videojuego completado o abandonado: 409 | Manual | `POST /api/videojuegos/<id>/metas` sobre un juego completado y sobre uno abandonado |
| CA-25 | Pasar a completado o abandonado desactiva la meta activa, por `PUT` y por `PATCH` | Manual | `PUT` y `PATCH /api/videojuegos/<id>` con el estado nuevo, y luego `GET /api/videojuegos/<id>/metas` |
| CA-26 | Eliminar un juego con partidas se bloquea con 409 y conserva el juego y sus metas | Manual | `DELETE /api/videojuegos/<id>` con partidas, y luego `GET /api/videojuegos/<id>/metas` |
| CA-27 | Eliminar un juego sin partidas elimina todas sus metas, activas e inactivas | Manual | `DELETE /api/videojuegos/<id>` sin partidas y luego `GET /api/metas/<metaId>` con el id de cada meta anterior (activa e inactiva): ambas responden 404 |
| CA-28 | Una partida con duración 0 se rechaza con 400 al crear y al editar | Unitaria y manual | `backend/src/dominio/partida.test.ts` (duración 0, negativa y válida) y `POST /api/partidas` con `duracionMinutos: 0`: 400 con mensaje en español. La rama de edición se confirma con `PATCH /api/partidas/<id>` cuando D-2 esté hecho |
| CA-29 | Una partida con fecha futura se rechaza con 400 al crear y al editar, y se acepta dentro de los 5 minutos de tolerancia | Unitaria y manual | `backend/src/dominio/partida.test.ts` (fecha pasada, presente, futura, dentro de la tolerancia y en el límite exacto de 5 minutos) y `POST /api/partidas` con una fecha a 1 hora (400) y con una a 2 minutos en el futuro (201). La rama de edición se confirma con `PATCH /api/partidas/<id>` cuando D-2 esté hecho |
| CA-30 | Al editar una partida, el progreso, la racha y los hitos se recalculan | Manual | `PATCH /api/partidas/<id>` seguido de `GET /api/videojuegos/<id>/progreso-semanal` |

Prueba de soporte que no corresponde a un criterio:

| prueba | tipo | dónde |
|---|---|---|
| Las funciones de `progreso.ts` no usan el reloj: con el reloj del sistema fijado en otra fecha con `vi.setSystemTime`, el resultado depende solo de `ahora` | Unitaria | `backend/src/dominio/progreso.test.ts` |
| `validarDatosPartida` no usa el reloj: con el reloj del sistema fijado en otra fecha, el resultado depende solo de `ahora` | Unitaria | `backend/src/dominio/partida.test.ts` |

Notas sobre la verificación manual:

- El error 11000 se verifica junto con CA-03. Si dos peticiones simultáneas intentan crear la meta activa, una responde 409 `Registro duplicado` o `El videojuego ya tiene una meta activa`, y nunca 500.
- La sincronización de índices (T-01) se verifica comprobando en la base de desarrollo que existen el índice de partidas y el índice único parcial de metas.

## Ticket -> archivos

T-01 es `chore` y se entrega en un solo commit. T-02 y T-03 siguen el ciclo test primero, código después, en commits separados (`test (E2): T-02` y `feat (E2): T-03`). D-1 sigue el mismo ciclo: un commit de test y luego `fix (deuda): D-1`. Los demás tickets (T-04, T-05, T-06, T-07 y D-2) se verifican a mano y se entregan en un solo commit `feat (E2): T-xx` o `fix (deuda): D-2`. Un ticket no puede tocar archivos que no aparezcan en su fila.

Vitest se usa solo en `backend/src/dominio/`. Por eso solo T-02 y D-1 tienen archivo de prueba.

| ticket | prueba automatizada | código |
|---|---|---|
| T-01 | ninguna | `backend/package.json`, `backend/package-lock.json`, `backend/src/sincronizarIndices.ts` |
| T-02 | `backend/src/dominio/progreso.test.ts` | ninguno |
| T-03 | ninguna (usa las de T-02) | `backend/src/dominio/progreso.ts` |
| T-04 | ninguna (verificación manual) | `backend/src/modelos/Meta.model.ts`, `backend/src/sincronizarIndices.ts` |
| T-05 | ninguna (verificación manual) | `backend/src/middlewares/errorHandler.ts`, `backend/src/services/metas.service.ts`, `backend/src/controllers/metas.controller.ts`, `backend/src/routes/metas.routes.ts`, `backend/src/app.ts` |
| T-06 | ninguna (verificación manual) | `backend/src/services/progreso.service.ts`, `backend/src/controllers/videojuegos.controller.ts`, `backend/src/routes/videojuegos.routes.ts` |
| T-07 | ninguna (verificación manual) | `backend/src/services/videojuegos.service.ts` |
| D-1 | `backend/src/dominio/partida.test.ts` | `backend/src/dominio/partida.ts`, `backend/src/services/partidas.service.ts` |
| D-2 | ninguna (verificación manual) | `backend/src/services/partidas.service.ts`, `backend/src/controllers/partidas.controller.ts`, `backend/src/routes/partidas.routes.ts` |

Notas sobre los archivos:

- **T-01:** agrega `vitest` como dependencia de desarrollo (`npm i -D vitest`) y los scripts `test` e `indices` (sincronización de índices con `tsx`). El script `test` es `vitest run --passWithNoTests`, para que `npm test` termine sin error mientras T-02 no haya agregado pruebas. No hay prueba de ejemplo, porque Vitest se usa solo en `backend/src/dominio/`. Vitest descarta `dist` por defecto, así que no hace falta un archivo de configuración. `backend/src/sincronizarIndices.ts` queda dentro de `src` para compilarse y poder ejecutarse en producción sin `tsx`. `backend/src/conexionDB.ts` no se modifica y sigue con `autoIndex: false`.
- **T-02 y T-03:** las pruebas importan de `backend/src/dominio/progreso.ts`. En T-02 el archivo no existe todavía y las pruebas fallan por eso. T-03 lo implementa hasta que pasen.
- **T-04:** solo agrega a `backend/src/sincronizarIndices.ts` la importación del modelo Meta.
- **T-05:** el `app.ts` solo registra el nuevo enrutador de metas, montado sobre `/api`. `metas.routes.ts` define tanto las rutas anidadas (`/videojuegos/<id>/metas`) como las de `/metas/<metaId>`, por lo que no se toca `backend/src/routes/videojuegos.routes.ts` en este ticket. El manejo del 11000 va en `errorHandler.ts`.
- **T-06:** la ruta de progreso se agrega antes de `/:id` en `backend/src/routes/videojuegos.routes.ts`, junto a `/:id/resumen`. El servicio obtiene la hora con `new Date()` y se la pasa al dominio.
- **T-07:** `backend/src/services/videojuegos.service.ts` importa el modelo Meta y modifica `actualizar` y `eliminar`. No se toca `obtenerResumen`.
- **D-1:** `backend/src/dominio/partida.ts` contiene `validarDatosPartida`. El servicio de partidas la invoca al crear. `backend/src/modelos/Partida.model.ts` no se modifica: la validación no se duplica en el modelo. La prueba de `partida.test.ts` se escribe y se confirma en rojo antes del código, en commits separados.
- **D-1 y D-2** comparten `backend/src/services/partidas.service.ts`. D-2 agrega la función de edición reutilizando `validarDatosPartida` sin modificarla.
- No se modifica `backend/src/validacion.ts`, siguiendo el patrón actual de validar números y arreglos en el servicio.
- CA-14 al editar y CA-30 dependen de que D-2 esté hecho. El resto de CA-14 se verifica con T-06.

## Preguntas abiertas

Ninguna. Las decisiones definitivas están en la sección de contexto.
