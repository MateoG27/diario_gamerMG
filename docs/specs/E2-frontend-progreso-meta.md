# Spec: E2-frontend-progreso-meta

## Contexto

Esta spec cubre el frontend de la épica E2 (Metas y rachas), pantalla **Progreso y meta**: la sección de progreso semanal en el detalle del videojuego (horas y días frente a la meta, racha actual, mejor racha e hitos), el formulario para definir, editar y reemplazar la meta, la desactivación con confirmación, el historial de metas y los estados de carga, error y vacío. Incluye también la parte de frontend de la deuda **D-2** (editar partidas), que reutiliza `PartidaForm.tsx`.

Consume la API descrita en [`docs/specs/E2-backend-meta-progreso.md`](./E2-backend-meta-progreso.md), que cubre los tickets T-01 a T-07, D-1 y D-2 del backend. Esta spec cubre T-08 a T-11 y el frontend de D-2. T-12 (seed y README) y T-13 (despliegue) quedan fuera.

Fuentes:

- Producto: [`docs/prd/prd-diario-gamer.md`](../prd/prd-diario-gamer.md), reglas RN-01 a RN-14.
- Backlog: [`docs/backlog/E2-metas-y-rachas.md`](../backlog/E2-metas-y-rachas.md), historias, criterios CA-01 a CA-30 y tickets T-08 a T-11 y D-2.
- Identidad visual: [`DESIGN.md`](../../DESIGN.md).
- Diagnóstico: [`docs/diagnostico.md`](../diagnostico.md), hallazgos H10 (zona horaria), H14 (colores fijos heredados), H19 (edición de partidas) y H20 (el detalle del videojuego concentra demasiadas responsabilidades).

Historias que cubre en pantalla:

| historia | tema | criterios en pantalla | tickets |
|---|---|---|---|
| [HU-01](../backlog/E2-metas-y-rachas.md#hu-01-definir-una-meta-semanal-para-un-videojuego) | Definir una meta semanal | CA-01 a CA-03 | T-10 |
| [HU-02](../backlog/E2-metas-y-rachas.md#hu-02-ver-mis-horas-y-días-jugados-de-la-semana-frente-a-la-meta) | Ver horas y días de la semana frente a la meta | CA-04 a CA-06 | T-08, T-09 |
| [HU-03](../backlog/E2-metas-y-rachas.md#hu-03-ver-mi-racha-actual-y-mi-mejor-racha) | Ver racha actual y mejor racha | CA-07 a CA-11 | T-08, T-09, T-11 |
| [HU-04](../backlog/E2-metas-y-rachas.md#hu-04-ver-qué-hitos-de-avance-he-alcanzado) | Definir y ver hitos | CA-12 a CA-18 | T-09, T-10 |
| [HU-05](../backlog/E2-metas-y-rachas.md#hu-05-editar-o-desactivar-mi-meta) | Editar, desactivar o reemplazar la meta | CA-19 a CA-23 | T-10, T-11 |
| [HU-06](../backlog/E2-metas-y-rachas.md#hu-06-que-mi-meta-se-mantenga-coherente-si-cambio-o-elimino-el-juego) | Metas coherentes con el estado del juego | CA-24 y CA-25 | T-10, T-11 |
| Calidad de las partidas | Corregir una partida y ver mensajes de validación | CA-28 a CA-30 | T-11, D-2 |

Los criterios CA-26 y CA-27 no cambian ninguna pantalla de esta spec. Se explican en "Criterios que no aplican a esta spec".

### Decisiones de esta spec

- **El servidor calcula, la pantalla muestra.** El frontend no calcula progreso, racha ni hitos. Muestra los valores de `GET /api/videojuegos/<id>/progreso-semanal`.
- **Dónde vive cada cosa.** La sección de progreso se agrega al detalle del videojuego como un solo componente contenedor (`SeccionProgreso`). `VideojuegoDetail.tsx` solo lo monta y no se reorganiza (H20).
- **Formulario de meta en su propia ruta**, igual que el resto de formularios de la aplicación (`VideojuegoForm`, `PartidaForm`): `/videojuegos/<id>/meta/nueva`, `/videojuegos/<id>/meta/editar` y `/videojuegos/<id>/meta/reemplazar`. Un solo componente de página atiende las tres rutas.
- **Reemplazar** es, en pantalla, desactivar la meta activa y luego crear la nueva, porque el backend no tiene ruta de reemplazo. Los hitos de la meta anterior no se copian. Reemplazar no abre ningún diálogo de confirmación: lo cubre un texto de advertencia visible en el formulario.
- **Desactivar una meta exige `window.confirm`**, el mismo patrón que usan `PartidasList` y `VideojuegosList` (Proyecto 3). Es una excepción documentada a `DESIGN.md` (sección «Diálogos de confirmación» y sección «No hacemos», que prohíben `confirm()`): en E2 no se crea un diálogo propio.
- **Juego "en curso".** Un videojuego está en curso en cualquier estado activo (hoy `jugando` y `pausado`). Solo `completado` y `abandonado` impiden tener una meta activa, igual que en el backend (409).
- **El progreso se actualiza al montar el detalle.** Las partidas se crean, borran y editan en otras páginas (`PartidaForm`, `PartidasList`), y el estado del juego y la meta se cambian en otras rutas (`VideojuegoForm`, `MetaForm`). Al volver al detalle, `SeccionProgreso` se monta de nuevo y pide los datos al servidor. No hay caché, sondeo ni suscripciones. Dentro del detalle solo se vuelve a pedir el progreso después de desactivar una meta o al reintentar tras un error.
- **Editar una partida reutiliza `PartidaForm`.** El mismo formulario atiende crear y editar, con el patrón de `VideojuegoForm`. La ruta es `/partidas/<id>/editar`. El backend no tiene `GET /api/partidas/<id>`, así que el modo edición carga la lista con `partidasApi.listar()` y busca la partida por id. El videojuego de la partida no se puede cambiar. Al guardar, vuelve a `/partidas`, como al crear.
- **Estilos.** `frontend/src/utils/estilos.ts` usa colores fijos heredados (H14) y no se modifica. El código nuevo de E2 usa solo los tokens de `DESIGN.md`, con clases propias en `frontend/src/utils/estilosE2.ts`. Los cambios de D-2 en `PartidaForm.tsx` y `PartidasList.tsx` reutilizan las clases que esos archivos ya usan, para mantener la coherencia visual con lo existente. Migrarlos a tokens es deuda aparte.
- **Verificación sin pruebas automatizadas.** El frontend no tiene framework de pruebas y esta spec no agrega dependencias. Se verifica con `npm run check`, `npm run build`, revisión de código, flujos manuales en el navegador y revisión de diseño con captura. Vitest sigue limitado a `backend/src/dominio/`.

## Reglas

### DEBE

Datos y API

- DEBE hacer todas las peticiones con `solicitar` de `frontend/src/api/cliente.ts`. No se usa `fetch` en otro lugar.
- DEBE concentrar las llamadas de metas y de progreso en `frontend/src/api/metasApi.ts`, con tipos alineados a las respuestas del servidor: crear, editar, desactivar, listar el historial y obtener el progreso.
- DEBE tomar del servidor `cumplida`, `porcentajeHoras`, `racha`, `avanceActual`, `alcanzado` de cada hito y el orden de los hitos. No los recalcula.
- DEBE mostrar `horasJugadas` con su valor real aunque `porcentajeHoras` sea 100 (RN-05).
- DEBE limitarse, para los textos, a estos únicos valores derivados: las horas y los días que faltan (`máximo(0, meta - jugado)`) y la proporción de días para la barra de días. Nunca decide con ellos si la semana está cumplida.
- DEBE mostrar `semana.inicio`, `semana.fin` y `hoy` (cadenas `AAAA-MM-DD`, fechas de calendario en Ecuador) sin pasarlas por `new Date(...)`, para que no se desplacen un día por la zona horaria (H10). Se formatean a partir de la cadena.
- DEBE mostrar las horas con coma decimal y la unidad, por ejemplo `1,5 h`.
- DEBE tratar el progreso como independiente del resto de la pantalla: si la carga del progreso falla, el resto del detalle del videojuego sigue funcionando.

Sección de progreso (T-09)

- DEBE mostrar, con la meta activa: horas jugadas frente a las horas de la meta, días jugados frente a los días de la meta, el cumplimiento de horas limitado a 100 %, racha actual, mejor racha y los hitos.
- DEBE mostrar «¡Meta cumplida!» con icono solo cuando `cumplida` sea `true`. Con la meta superada en horas pero con días faltantes (CA-06), la barra muestra 100 %, las horas muestran el valor real y el texto indica cuántos días faltan.
- DEBE mostrar la racha también cuando no hay meta activa.
- DEBE mostrar cada hito con su porcentaje y una insignia con texto e icono: «Alcanzado» o «Pendiente».
- DEBE mostrar el avance actual del videojuego junto a los hitos.
- DEBE respetar `prefers-reduced-motion`: la transición de ancho de las barras solo se anima si no está activo.
- DEBE anunciar los cambios de progreso en una región `aria-live="polite"`.

Formulario de meta y desactivación (T-10)

- DEBE validar en el formulario, antes de enviar: horas mayores que 0 y no mayores que 100, días enteros de 1 a 7, hitos enteros de 1 a 100, hasta 5 y sin repetir. La validación del cliente es una ayuda: el servidor sigue siendo la fuente de verdad.
- DEBE mostrar los errores del servidor en español, en un mensaje con `role="alert"`, y conservar lo que el jugador escribió.
- DEBE mostrar los hitos ordenados de menor a mayor, tanto en el formulario como en la sección de progreso y en el historial.
- DEBE aceptar un hito cuyo porcentaje ya está superado por el avance (RN-11), sin advertencia ni bloqueo.
- DEBE pedir confirmación con `window.confirm` antes de desactivar una meta, con el texto de la tabla de textos. Si el jugador cancela, no se envía ninguna petición y no cambia nada. Si acepta, se desactiva y se vuelve a pedir el progreso y el historial.
- DEBE mostrar el historial de metas del videojuego (activas e inactivas, de la más reciente a la más antigua), con las horas, los días, los hitos y la fecha de desactivación de las inactivas.
- DEBE resolver reemplazar en dos llamadas, desactivar y luego crear, sin diálogo de confirmación. Si la creación falla, DEBE avisar que la meta anterior ya quedó desactivada, mantener el formulario con los datos escritos y permitir reintentar.
- DEBE mostrar en el formulario de reemplazo un texto visible que diga que la meta actual pasará al historial y no se podrá reactivar.
- DEBE no ofrecer la acción de definir una meta cuando el videojuego está `completado` o `abandonado`, y explicar el motivo en español. En cualquier otro estado sí la ofrece.
- DEBE no ofrecer la acción de definir una meta nueva cuando ya existe una activa. Ofrece editar o reemplazar.

Progreso al día y estados (T-11)

- DEBE pedir el progreso al servidor cada vez que se monta `SeccionProgreso`, es decir, cada vez que el jugador abre el detalle del videojuego, sin caché. Así, al volver de crear, borrar o editar una partida, de cambiar el estado del juego o de guardar la meta, los valores están actualizados sin recargar el navegador.
- DEBE volver a pedir el progreso y el historial, dentro de la misma pantalla, solo después de desactivar una meta y al pulsar «Reintentar».
- DEBE conservar los datos anteriores en pantalla mientras se recarga después de desactivar, sin parpadeo, y descartar las respuestas de peticiones viejas (al desmontar o al cambiar de videojuego).
- DEBE mostrar estado de carga, de error con botón «Reintentar» y de vacío, con mensajes del tono de `DESIGN.md`:
  - Vacío sin meta activa: invita a definir una.
  - Vacío sin partidas: invita a registrar la primera.
  - Vacío de juego completado o abandonado: explica que ya no está en curso.

Editar una partida (D-2)

- DEBE reutilizar `PartidaForm.tsx` para crear y editar. Es modo edición cuando la URL trae el `id` de la partida (`/partidas/<id>/editar`) y modo crear en los demás casos, con el patrón de `VideojuegoForm.tsx`.
- DEBE cargar la partida en modo edición con `partidasApi.listar()` y buscarla por id. Si no existe, muestra el error «Partida no encontrada» con enlace para volver al historial.
- DEBE precargar en edición la fecha, la duración, el avance y las notas de la partida. La fecha se convierte a la hora local del navegador para el campo `datetime-local`, con el mismo criterio con el que crear obtiene la hora actual.
- DEBE mostrar el videojuego en edición como dato que no se puede cambiar, y no enviarlo.
- DEBE enviar con `PATCH /api/partidas/<id>` solo `fecha` (ISO con zona, con `toISOString()`), `duracionMinutos`, `porcentajeAvance` y `notas` (puede ir vacía para borrarlas).
- DEBE mostrar los errores del servidor al crear y al editar en el mensaje con `role="alert"` que `PartidaForm` ya tiene, conservando lo escrito. Incluye los mensajes de duración y de fecha futura (CA-28 y CA-29).
- DEBE usar en edición el título «Editar partida» y el botón «Guardar cambios». El modo crear conserva «Nueva partida» y «Guardar partida».
- DEBE volver a `/partidas` al guardar con éxito, y «Cancelar» vuelve a `/partidas`.
- DEBE agregar en `PartidasList.tsx` un botón «Editar» en cada partida que lleve a `/partidas/<id>/editar`.
- DEBE dejar sin cambios el comportamiento de crear una partida.

Diseño y accesibilidad

- DEBE usar solo los tokens de `DESIGN.md` en los archivos nuevos (`bg-superficie`, `text-texto`, `border-borde`, etc.), sin colores fijos ni hex sueltos.
- DEBE usar solo Tailwind v4 y `lucide-react`. Cualquier animación de entrada con GSAP va detrás de la guarda `animacionesReducidas()`.
- DEBE seguir los componentes de `DESIGN.md`: botones, campos con etiqueta y error, tarjetas, insignias y barra de progreso con ARIA. La confirmación de desactivar es la excepción documentada.
- DEBE cumplir la tabla de tono de `DESIGN.md`: segunda persona, cálido y sin culpa.
- DEBE comunicar cada estado con texto o icono, no solo con color.
- DEBE permitir completar todos los flujos solo con teclado, con foco visible.
- DEBE ejecutar `npm run check` y `npm run build` en `frontend` antes de cada commit.
- DEBE entregar cada ticket T-xx en un solo commit `feat (E2): T-xx`, y la parte de frontend de D-2 en un commit `fix (deuda): D-2`, después de que el `PATCH /api/partidas/<id>` del backend esté verificado.

### NO DEBE

- NO DEBE calcular en el frontend el progreso, la racha, el cumplimiento, la semana ni el estado de los hitos.
- NO DEBE convertir zonas horarias para decidir el día o la semana de una partida. Eso es del backend.
- NO DEBE incluir botón, ruta ni función para reactivar una meta desactivada, ni para editar una meta desactivada, ni para borrar una meta (RN-13 y RN-12).
- NO DEBE exponer en `metasApi.ts` funciones de reactivar ni de eliminar metas.
- NO DEBE enviar `activa`, `desactivadaEn` ni `videojuego` en el cuerpo al editar una meta.
- NO DEBE copiar los hitos de la meta anterior al reemplazar.
- NO DEBE incluir gráficos ni una vista del cumplimiento por semana. El historial muestra metas, no cumplimiento (no-alcance del PRD).
- NO DEBE crear un componente de diálogo propio. La única confirmación nueva es el `window.confirm` de desactivar una meta.
- NO DEBE pedir confirmación al reemplazar una meta ni al crear o editar una.
- NO DEBE usar `alert()` ni ningún otro `confirm()` en las pantallas nuevas. El único `window.confirm` permitido es el de desactivar la meta.
- NO DEBE usar mensajes que culpen al jugador («No cumpliste tu meta», «Perdiste tu racha»). Una racha en 0 se comunica de forma cálida.
- NO DEBE agregar sondeo periódico, caché global ni suscripciones para actualizar el progreso.
- NO DEBE permitir cambiar el videojuego de una partida al editarla, ni enviar `videojuego` en el `PATCH`.
- NO DEBE crear un archivo de formulario aparte para editar partidas: se reutiliza `PartidaForm.tsx`.
- NO DEBE modificar `frontend/src/utils/estilos.ts`, `frontend/src/components/EstadoCarga.tsx`, `frontend/src/index.css`, `frontend/src/api/cliente.ts`, `frontend/src/api/videojuegosApi.ts`, `frontend/src/paginas/VideojuegoForm.tsx`, `frontend/src/paginas/VideojuegosList.tsx` ni `frontend/package.json`.
- NO DEBE reorganizar `VideojuegoDetail.tsx`. Solo agrega el montaje de la sección y la propiedad que esta necesita (H20).
- NO DEBE agregar dependencias, ni de pruebas, ni de UI, ni de fechas.
- NO DEBE migrar a tokens el código heredado (H14). Se hace aparte.
- NO DEBE tocar el backend ni leer o modificar archivos `.env`.

## Contrato

### Endpoints que consume el frontend

Los detalles de request, response y errores están en el contrato de [`E2-backend-meta-progreso.md`](./E2-backend-meta-progreso.md). Aquí solo se listan las llamadas del frontend.

| función | endpoint | se usa en |
|---|---|---|
| `metasApi.obtenerProgreso(videojuegoId)` | `GET /api/videojuegos/<id>/progreso-semanal` | `SeccionProgreso` |
| `metasApi.listarPorVideojuego(videojuegoId)` | `GET /api/videojuegos/<id>/metas` | `SeccionProgreso` (historial) y `MetaForm` (meta activa) |
| `metasApi.crear(videojuegoId, datos)` | `POST /api/videojuegos/<id>/metas` | `MetaForm` (crear y reemplazar) |
| `metasApi.actualizar(metaId, datos)` | `PATCH /api/metas/<metaId>` | `MetaForm` (editar) |
| `metasApi.desactivar(metaId)` | `POST /api/metas/<metaId>/desactivar` | `SeccionProgreso` (desactivar) y `MetaForm` (reemplazar) |
| `partidasApi.listar()` (existente) | `GET /api/partidas` | `PartidaForm` (cargar la partida en modo edición) |
| `partidasApi.actualizar(id, datos)` (nueva, D-2) | `PATCH /api/partidas/<id>` | `PartidaForm` (modo edición) |

No existen funciones para consultar una meta por id, reactivar ni eliminar. El formulario de edición de la meta obtiene la meta activa del listado.

### Tipos

| tipo | archivo | campos |
|---|---|---|
| `Meta` | `metasApi.ts` | `_id`, `videojuego` (id), `horasSemana` (número), `diasSemana` (entero), `hitos` (lista de enteros, de menor a mayor), `activa` (booleano), `desactivadaEn` (texto de fecha o `null`), `createdAt`, `updatedAt` |
| `MetaDatos` | `metasApi.ts` | `horasSemana` (número), `diasSemana` (entero), `hitos` (lista de enteros, opcional). Es lo único que el frontend envía al crear o editar una meta |
| `ProgresoSemanal` | `metasApi.ts` | `videojuego`, `zona`, `hoy`, `semana` (`inicio` y `fin`), `meta` (`_id`, `horasSemana`, `diasSemana`, o `null`), `horasJugadas`, `diasJugados`, `porcentajeHoras` (entero o `null`), `cumplida` (booleano o `null`), `racha` (`actual` y `mejor`), `avanceActual`, `hitos` (lista de `porcentaje` y `alcanzado`) |
| `PartidaEdicion` | `partidasApi.ts` | `fecha` (texto ISO), `duracionMinutos`, `porcentajeAvance`, `notas`, todos opcionales. Nunca incluye `videojuego`. Es lo único que el frontend envía al editar una partida |

### Rutas del frontend

| ruta | página | qué hace |
|---|---|---|
| `/videojuegos/:id` | `VideojuegoDetail` (existente) | Muestra `SeccionProgreso` |
| `/videojuegos/:id/meta/nueva` | `MetaForm` | Crea la meta del videojuego |
| `/videojuegos/:id/meta/editar` | `MetaForm` | Edita en el lugar la meta activa |
| `/videojuegos/:id/meta/reemplazar` | `MetaForm` | Desactiva la meta activa y crea una nueva |
| `/partidas/:id/editar` | `PartidaForm` (existente, D-2) | Edita fecha, duración, avance y notas de la partida |

Al guardar una meta con éxito, `MetaForm` vuelve a `/videojuegos/:id`. Al guardar una partida, `PartidaForm` vuelve a `/partidas`.

### Mensajes de la validación del cliente

Los mensajes dicen qué corregir. Los errores que devuelve el servidor se muestran tal cual.

| situación | mensaje |
|---|---|
| Horas vacías, 0, negativas o mayores que 100 | Las horas por semana deben ser mayores que 0 y no más de 100. Corrige el valor e inténtalo de nuevo. |
| Días vacíos, no enteros, 0 o mayores que 7 | Los días por semana deben ser un número entero entre 1 y 7. Corrige el valor e inténtalo de nuevo. |
| Hito no entero, menor que 1 o mayor que 100 | Cada hito debe ser un número entero entre 1 y 100. |
| Sexto hito | Una meta admite como máximo 5 hitos. |
| Hito repetido | Ese porcentaje ya está en tus hitos. Elige otro. |
| Juego completado o abandonado | Este videojuego ya no está en curso, así que no puede tener una meta semanal. |
| Ya existe una meta activa (en la ruta de crear) | Este videojuego ya tiene una meta activa. Puedes editarla o reemplazarla. |
| Falla la creación al reemplazar | Tu meta anterior ya quedó desactivada y está en el historial. No pudimos guardar la nueva: {mensaje}. Inténtalo de nuevo. |
| No existe la partida (modo edición) | Partida no encontrada |

Los formularios de partida no validan en el cliente la duración mayor que 0 ni la fecha futura: muestran los mensajes que devuelve el servidor (`duracionMinutos debe ser mayor que 0` y `La fecha de la partida no puede ser futura`).

### Textos de la sección de progreso

| situación | texto de referencia |
|---|---|
| Horas | `6 h de 8 h` con barra de horas |
| Horas que faltan | Te faltan 1,5 h para tu meta |
| Días | `2 de 3 días` |
| Días que faltan | Te falta 1 día para completar tu meta |
| Semana cumplida | ¡Meta cumplida! |
| Racha viva | Llevas 3 días seguidos, ¡buen ritmo! |
| Racha en 0 | Retoma cuando quieras: tu racha empieza hoy |
| Hito | `Hito de 50 %` con insignia «Alcanzado» o «Pendiente» |
| Sin meta activa | Aún no tienes una meta semanal para este videojuego |
| Sin partidas | Aún no tienes partidas: registra la primera |
| Confirmación de desactivar (`window.confirm`) | ¿Desactivar esta meta? Tus partidas se conservan. La meta queda en tu historial y no se puede reactivar. |
| Advertencia del formulario de reemplazo | Tu meta actual pasará al historial y no se podrá reactivar. |

Los botones del `window.confirm` son los del navegador.

## Criterio -> verificación

Tipos de verificación:

- **Manual:** flujo en el navegador con `npm run dev` del frontend y el backend de desarrollo en marcha (T-06 y T-07 listos, y D-2 del backend para los casos de edición de partidas). Se comprueba el comportamiento y, en la pestaña Red del navegador, la petición enviada y la respuesta del servidor. Los datos de ejemplo se crean desde la interfaz (`PartidaForm` permite elegir la fecha) o con curl o Thunder Client.
- **Revisión de código:** se revisa que el código cumpla la regla, sin ejecutar nada.
- **Revisión manual + captura:** comprobación visual con captura de pantalla. Se detalla en la tabla "Revisión de diseño" y aquí se referencia por su id `RD-xx`.

Además, todo ticket se verifica con `npm run check` y `npm run build` sin errores.

| id | criterio (en pantalla) | verificación |
|---|---|---|
| CA-01 | Definir una meta de 5 horas en 3 días la deja activa | Manual: en `/videojuegos/<id>/meta/nueva` guardar 5 y 3. La petición es `POST /api/videojuegos/<id>/metas` con `{ horasSemana: 5, diasSemana: 3 }`, responde 201, vuelve al detalle y la sección muestra la meta de 5 h y 3 días. Visual: RD-01 y RD-09 |
| CA-02 | Con horas 0, negativas, mayores que 100, días 0 o mayores que 7, no se crea la meta y se indica qué corregir. 100 horas se acepta y 101 no | Manual: probar cada valor. No se envía ninguna petición (pestaña Red) y aparece el mensaje de la tabla de mensajes. Con 100 h se envía y responde 201. Revisión de código: los límites del formulario coinciden con el contrato. Visual: RD-09 |
| CA-03 | Si ya hay meta activa, no se puede crear otra y se informa | Manual: con meta activa, la sección no ofrece «Definir meta», y abrir `/videojuegos/<id>/meta/nueva` muestra el aviso de la tabla de mensajes. Con dos pestañas, crear la meta en una y enviar el formulario en la otra muestra el 409 del servidor en el `role="alert"`. Visual: RD-09 |
| CA-04 | Con 2 h el lunes, 2 h el miércoles y 1 h el viernes y una meta de 5 h en 3 días, se ven 5 h, 3 días y la semana cumplida. Con solo horas o solo días, no | Manual: crear esas partidas y abrir el detalle. Los valores de pantalla coinciden con la respuesta de `progreso-semanal` y aparece «¡Meta cumplida!». Quitar una partida del miércoles deja la semana sin cumplir. Revisión de código: `cumplida` viene del servidor. Visual: RD-01, RD-02 y RD-04 |
| CA-05 | Partida del domingo 23:30 de 90 min cuenta completa en esa semana | Manual: registrar la partida con la hora de Ecuador. Las horas y días de pantalla coinciden con la respuesta y la semana mostrada (`semana.inicio` a `semana.fin`) no está corrida un día. Revisión de código: las fechas de calendario no pasan por `new Date(...)`. Visual: RD-04 |
| CA-06 | Meta de 5 h en 3 días con 7 h en 2 días: 100 %, 7 h y no cumplida | Manual: crear ese caso. La barra marca 100 %, el texto dice `7 h de 5 h`, no aparece «¡Meta cumplida!» y se indica que falta 1 día. Visual: RD-02 y RD-03 |
| CA-07 | Última partida ayer y hoy sin jugar: la racha sigue contando | Manual: registrar una partida con fecha de ayer y ninguna hoy. La racha actual es la de la respuesta del servidor, no 0. Visual: RD-05 |
| CA-08 | Última partida anteayer o antes: racha actual 0 y mejor racha conservada | Manual: partidas de varios días seguidos y luego una pausa de dos días o más. Actual en 0, mejor racha conservada, con el texto cálido de la tabla de textos. Visual: RD-05 y RD-17 |
| CA-09 | Varias partidas el mismo día cuentan un día y suman sus minutos | Manual: dos partidas de 30 min el mismo día. La sección muestra 1 día jugado y 1 h. Revisión de código: no se cuentan días en el cliente. Visual: RD-04 |
| CA-10 | Sin partidas, racha actual y mejor racha en 0 | Manual: videojuego sin partidas. Racha en 0 y el estado de vacío de partidas (T-11). Visual: RD-05 y RD-13 |
| CA-11 | Jugar un día nuevo que continúa la racha sube la actual y la mejor | Manual: con racha actual igual a la mejor, registrar una partida de un día nuevo que continúe la racha y volver al detalle. Ambas suben en uno, sin recargar el navegador. Visual: RD-05 |
| CA-12 | Hito alcanzado con avance igual o mayor | Manual: hito de 50 % con avance de 60 % y con exactamente 50 %. Aparece «Alcanzado». Visual: RD-06 |
| CA-13 | Hito pendiente con avance menor | Manual: hito de 50 % con avance de 30 %. Aparece «Pendiente». Visual: RD-06 |
| CA-14 | Si el avance baja al borrar o editar una partida, el hito vuelve a pendiente | Manual: con hito de 50 % alcanzado por avance 60 %, (a) borrar en `/partidas` la partida más reciente y (b) en otra prueba, editarla en `/partidas/<id>/editar` bajando su avance a 40 %. En ambos casos, al abrir el detalle el hito está «Pendiente», sin recargar el navegador. Visual: RD-06 |
| CA-15 | Un hito ya superado al crearlo aparece alcanzado | Manual: con avance de 70 %, crear una meta con hito en 50 %. Se acepta sin advertencia y el detalle lo muestra «Alcanzado». Visual: RD-06 |
| CA-16 | Un sexto hito no se agrega y se informa que el máximo es 5 | Manual: intentar agregar un sexto hito. No se agrega y aparece el mensaje de la tabla de mensajes. Visual: RD-10 |
| CA-17 | Un porcentaje de hito repetido no se agrega y se informa | Manual: agregar 50 dos veces. El segundo no se agrega y aparece el mensaje de la tabla de mensajes. Visual: RD-10 |
| CA-18 | Los hitos se ven de menor a mayor | Manual: agregar 75, 25 y 50. Se ven 25, 50 y 75 en el formulario, en la sección de progreso y en el historial. Revisión de código: el orden de la sección viene del servidor. Visual: RD-06 y RD-10 |
| CA-19 | Editar la meta activa de 5 h en 3 días a 8 h en 4 días | Manual: en `/videojuegos/<id>/meta/editar` cambiar y guardar. La petición es `PATCH /api/metas/<metaId>` sin `activa`, `desactivadaEn` ni `videojuego`, y el detalle muestra 8 h y 4 días como única meta activa. Visual: RD-01 |
| CA-20 | Cambiar la meta a mitad de semana muestra el progreso contra la meta nueva | Manual: con 3 h jugadas en 2 días y meta de 5 h, editar a 10 h. Al volver, el detalle muestra `3 h de 10 h`, sin recargar el navegador. Visual: RD-02 y RD-13 |
| CA-21 | Desactivar pide confirmación. Al confirmar queda inactiva y en el historial. Si se cancela, sigue activa | Manual: pulsar «Desactivar meta». Aparece el `window.confirm` con el texto de la tabla. Con Cancelar no se envía ninguna petición (pestaña Red) y la meta sigue activa. Con Aceptar se envía `POST /api/metas/<metaId>/desactivar`, la meta sale de la sección activa y aparece en el historial con su fecha de desactivación. Revisión de código: es el único `confirm(` de los archivos nuevos. Visual: RD-11 y RD-12 |
| CA-22 | Una meta desactivada no se reactiva | Manual: en el historial, las metas inactivas no tienen ninguna acción, y abrir `/videojuegos/<id>/meta/editar` sin meta activa muestra un aviso y la opción de definir una nueva. Revisión de código: `metasApi.ts` no exporta funciones de reactivar ni eliminar y no existe ruta ni botón para ello. Visual: RD-12 |
| CA-23 | Reemplazar deja la anterior inactiva en el historial y la nueva activa | Manual: en `/videojuegos/<id>/meta/reemplazar` guardar valores nuevos, sin diálogo de confirmación. Se envían `POST .../desactivar` y luego `POST .../metas` (sin hitos de la anterior). El detalle muestra la nueva como activa y la anterior en el historial. Forzar un error en la segunda llamada (por ejemplo, horas inválidas saltando la validación del cliente con DevTools) muestra el aviso de la tabla de mensajes y conserva el formulario. Visual: RD-09 y RD-12 |
| CA-24 | No se ofrece crear meta en un juego completado o abandonado | Manual: con el juego completado y con el abandonado, la sección no ofrece «Definir meta» y muestra el texto de la tabla de mensajes. Abrir `/videojuegos/<id>/meta/nueva` muestra el mismo aviso y no el formulario. Con el juego en `jugando` y en `pausado` sí se ofrece. Visual: RD-13 |
| CA-25 | Al pasar el juego a completado o abandonado, la meta activa se desactiva y queda en el historial | Manual: con meta activa, editar el juego a «completado» desde `VideojuegoForm` y volver al detalle. La sección ya no muestra meta activa y el historial la muestra desactivada. Visual: RD-12 y RD-13 |
| CA-28 | Una partida con duración 0 no se guarda y se muestra un mensaje en español, al crear y al editar | Manual: en `/partidas/nueva` y en `/partidas/<id>/editar`, guardar con duración 0. La petición (`POST` o `PATCH`) responde 400, se muestra `duracionMinutos debe ser mayor que 0` en el `role="alert"`, la pantalla no navega y conserva lo escrito. Visual: RD-18 |
| CA-29 | Una partida con fecha futura (más allá de 5 minutos) no se guarda y se muestra un mensaje en español, al crear y al editar | Manual: en `/partidas/nueva` y en `/partidas/<id>/editar`, guardar con una fecha una hora en el futuro: 400 y se muestra `La fecha de la partida no puede ser futura`. Con una fecha 2 minutos en el futuro se guarda. Visual: RD-18 |
| CA-30 | Al corregir o cambiar partidas, el progreso, la racha y los hitos se muestran de inmediato con el dato corregido | Manual: crear una partida desde `PartidaForm`, borrar otra desde `/partidas` y editar la duración o la fecha de otra desde `/partidas/<id>/editar`. Tras cada cambio, al abrir el detalle los valores corresponden a la respuesta actual de `progreso-semanal`, sin recargar el navegador ni datos viejos. Revisión de código: `SeccionProgreso` pide el progreso al montarse y no usa caché. Visual: RD-13 |

### Revisión de diseño

Cada fila se verifica con **Revisión manual + captura**, a 1280 px de ancho salvo que se indique otra cosa. Las filas que piden dos estados llevan una captura por estado.

| id | elemento | referencia en `DESIGN.md` | qué se revisa | verificación |
|---|---|---|---|---|
| RD-01 | Sección de progreso con meta activa | §3 y Tarjetas | Tarjeta `rounded-xl border-borde bg-superficie p-5`, título h2 «Progreso semanal», espaciado `space-y-8` entre secciones, solo tokens | Revisión manual + captura |
| RD-02 | Barra de horas | Barra de progreso | `role="progressbar"` con `aria-valuenow` (porcentaje), `aria-valuemin`, `aria-valuemax`, `aria-label` y `aria-valuetext` (`6 h de 8 h esta semana`). Valor en texto visible. Relleno `bg-primario`. Al cumplir pasa a `bg-exito` con «¡Meta cumplida!» e icono. Captura con la meta sin cumplir y con la meta cumplida | Revisión manual + captura |
| RD-03 | Meta superada en horas pero con días faltantes | Barra de progreso y Tono | Barra llena, texto `7 h de 5 h`, sin «¡Meta cumplida!» y con el texto de días que faltan | Revisión manual + captura |
| RD-04 | Horas, días y semana | §3 y §5 | Etiqueta de dato `text-xs uppercase tracking-wider text-texto-suave`, valores legibles, días como `2 de 3 días`, rango de la semana sin desfase de un día | Revisión manual + captura |
| RD-05 | Racha actual y mejor racha | §5 y Tono | Dos datos claros. Racha viva con texto motivador y racha en 0 con «Retoma cuando quieras: tu racha empieza hoy». Sin palabras culpabilizadoras. Captura con racha viva y con racha en 0 | Revisión manual + captura |
| RD-06 | Lista de hitos | Insignias y §6 | Orden ascendente. Insignia «Alcanzado» (`border-exito/50 bg-exito/10 text-exito`, con icono) e insignia «Pendiente» (neutra, con icono). Avance actual visible. Captura con hitos en ambos estados | Revisión manual + captura |
| RD-07 | Movimiento reducido | §6 y Barra de progreso | Con `prefers-reduced-motion: reduce` emulado en DevTools, la barra cambia de ancho sin transición. Captura de la emulación activa y de la barra actualizada | Revisión manual + captura |
| RD-08 | Región de anuncios | §6 | La región `aria-live="polite"` existe y su texto cambia al actualizarse el progreso. Captura del DOM o del panel de accesibilidad con el valor anunciado | Revisión manual + captura |
| RD-09 | Formulario de meta | Campos de formulario y Botones | `label` visible enlazada con `htmlFor`, campos con el estilo del diseño, foco visible, botón primario «Guardar meta» y botón secundario «Cancelar». Con error: `border-peligro`, `aria-invalid`, `aria-describedby`, mensaje con icono y texto en `role="alert"`. Captura en estado normal y con error. En el modo reemplazar, el texto de advertencia visible | Revisión manual + captura |
| RD-10 | Hitos dentro del formulario | Campos, Botones y §6 | Campo y botón para agregar un hito, lista ordenada, máximo 5, botón de quitar solo con icono con `aria-label` y `title`, altura táctil mínima de 44 px en móvil. Captura con 5 hitos y con el mensaje de límite | Revisión manual + captura |
| RD-11 | Confirmación de desactivar | Excepción documentada | Aparece el `window.confirm` nativo con el texto de la tabla de textos, desde el botón «Desactivar meta» (botón de peligro con texto explícito). Captura del diálogo abierto | Revisión manual + captura |
| RD-12 | Historial de metas | Tarjetas e Insignias | Metas inactivas de la más reciente a la más antigua, con horas, días, hitos y fecha de desactivación. Insignia neutra «Desactivada». Sin botones de acción. Captura con al menos una meta desactivada y una activa | Revisión manual + captura |
| RD-13 | Estados de la sección | §5 y §6 | Estado de carga (`role="status"`), de error (`role="alert"`, con botón «Reintentar»), vacío sin meta (invita a definir una), vacío sin partidas (invita a registrar la primera) y vacío de juego completado o abandonado (explica el motivo). Una captura por estado | Revisión manual + captura |
| RD-14 | Adaptación a pantalla | §3 y Botones | A 375 px y a 1280 px no hay desborde horizontal, las tarjetas se apilan y los botones miden al menos 44 px de alto en móvil. Captura de la sección y del formulario de meta en ambos anchos | Revisión manual + captura |
| RD-15 | Teclado y foco | §6 | Con solo `Tab`, `Shift+Tab`, `Enter` y `Espacio` se completa crear, editar, reemplazar y desactivar una meta, y editar una partida. El foco es visible en todo elemento interactivo. Captura de una secuencia del foco sobre la sección y el formulario | Revisión manual + captura |
| RD-16 | El color no es el único canal | §6 | Con la pantalla en escala de grises (DevTools, emulación de visión), se distingue cumplida de no cumplida y alcanzado de pendiente por texto o icono. Captura en escala de grises | Revisión manual + captura |
| RD-17 | Tono de los textos | §5 | Todos los textos nuevos de pantalla, mensajes y estados, revisados contra la tabla «Sí / No» de `DESIGN.md`. Captura de cada texto revisado | Revisión manual + captura |
| RD-18 | Formulario de partida en modo edición | Campos de formulario | Título «Editar partida», datos precargados, videojuego visible y no editable, botón «Guardar cambios» y «Cancelar». Con error del servidor (duración 0 o fecha futura), mensaje en `role="alert"`. Es coherente con el modo crear, que no cambia. Captura en estado normal y con error | Revisión manual + captura |
| RD-19 | Botón «Editar» en el historial de partidas | Botones | Cada partida tiene el botón «Editar» con texto, junto a «Eliminar», con foco visible. Captura del listado | Revisión manual + captura |

### Comprobaciones de código

Se hacen antes de cada commit y se anotan en el mensaje de entrega del ticket.

| id | comprobación | verificación |
|---|---|---|
| CC-01 | Los archivos nuevos (marcados como «nuevo» en la tabla "Ticket -> archivos") no contienen colores fijos (`zinc-`, `purple-`, `cyan-`, `emerald-`, `amber-`, `red-`, `white`, `black` ni hex sueltos) | Revisión de código: búsqueda de esos patrones en esos archivos |
| CC-02 | No hay `fetch` ni `alert(` en los archivos nuevos o modificados, y el único `confirm(` nuevo es el de desactivar la meta en `SeccionProgreso.tsx` | Revisión de código: búsqueda de esos patrones |
| CC-03 | `package.json` y `package-lock.json` del frontend no cambian | Revisión de código: `git diff` de esos archivos vacío |
| CC-04 | Los archivos que la sección "NO DEBE" protege no aparecen en el commit y cada commit solo toca los archivos de su fila | Revisión de código: `git diff --name-only` contra la tabla "Ticket -> archivos" |

### Criterios que no aplican a esta spec

| id | motivo |
|---|---|
| CA-26 | Eliminar un juego con partidas: lo decide el backend (T-07). `VideojuegosList` ya muestra el error del servidor en un `role="alert"` y no se toca. Se verifica en la spec del backend |
| CA-27 | Eliminar un juego sin partidas elimina sus metas: es solo del backend (T-07). Se verifica en la spec del backend. Esta spec no agrega pantallas ni botones de eliminación |

## Ticket -> archivos

T-08 a T-11 se entregan en un solo commit `feat (E2): T-xx`, y D-2 en un commit `fix (deuda): D-2`, sin pruebas automatizadas. Un ticket no puede tocar archivos que no aparezcan en su fila. Los archivos nuevos se marcan con (nuevo).

| ticket | archivos |
|---|---|
| T-08 | `frontend/src/api/metasApi.ts` (nuevo) |
| T-09 | `frontend/src/components/SeccionProgreso.tsx` (nuevo), `frontend/src/components/ProgresoSemanal.tsx` (nuevo), `frontend/src/components/BarraProgreso.tsx` (nuevo), `frontend/src/components/ListaHitos.tsx` (nuevo), `frontend/src/utils/estilosE2.ts` (nuevo), `frontend/src/utils/formato.ts`, `frontend/src/paginas/VideojuegoDetail.tsx` |
| T-10 | `frontend/src/paginas/MetaForm.tsx` (nuevo), `frontend/src/components/HistorialMetas.tsx` (nuevo), `frontend/src/components/SeccionProgreso.tsx`, `frontend/src/App.tsx`, `frontend/src/paginas/VideojuegoDetail.tsx` |
| T-11 | `frontend/src/components/EstadoSeccion.tsx` (nuevo), `frontend/src/components/SeccionProgreso.tsx`, `frontend/src/components/ProgresoSemanal.tsx` |
| D-2 | `frontend/src/paginas/PartidaForm.tsx`, `frontend/src/api/partidasApi.ts`, `frontend/src/paginas/PartidasList.tsx`, `frontend/src/App.tsx` |

Notas sobre los archivos:

- **T-08:** `metasApi.ts` exporta los tipos `Meta`, `MetaDatos` y `ProgresoSemanal` y el objeto `metasApi` con `obtenerProgreso`, `listarPorVideojuego`, `crear`, `actualizar` y `desactivar`. Usa `solicitar` de `cliente.ts` y sigue el patrón de `videojuegosApi.ts` (ruta base y cuerpo en JSON). No se modifica `videojuegosApi.ts`.
- **T-09:**
  - `SeccionProgreso` es el contenedor: recibe `videojuegoId`, pide el progreso con `metasApi.obtenerProgreso` al montarse y lo entrega a `ProgresoSemanal`. En este ticket solo cubre el caso con datos.
  - `ProgresoSemanal` muestra las horas, los días, el cumplimiento, la racha, el avance y los hitos.
  - `BarraProgreso` implementa la barra con ARIA de `DESIGN.md` y la región `aria-live="polite"`.
  - `ListaHitos` muestra los hitos y su insignia «Alcanzado» o «Pendiente».
  - `estilosE2.ts` reúne las clases con tokens (botones, campos, tarjetas, insignias, etiquetas) y es lo que reutilizan T-10 y T-11. No reemplaza ni modifica `estilos.ts`.
  - `formato.ts` agrega `formatearHoras` (coma decimal y unidad) y un formateador de fechas de calendario `AAAA-MM-DD` que no pasa por `new Date(...)`. No cambia `formatearFecha` ni `ahoraLocalInput`.
  - `VideojuegoDetail.tsx` solo monta `<SeccionProgreso />` entre el panel de resumen y la grilla de logros y partidas, sin tocar lo demás (H20).
- **T-10:**
  - `MetaForm` atiende las tres rutas (crear, editar y reemplazar). Carga el videojuego (`videojuegosApi.obtener`, sin modificarlo) y el listado de metas para decidir el modo y los avisos. Los hitos se agregan uno por uno.
  - `HistorialMetas` muestra las metas del listado, sin acciones.
  - `SeccionProgreso` agrega los botones «Definir meta», «Editar meta», «Reemplazar meta» y «Desactivar meta» (con el `window.confirm`) y el historial. Recibe además `estado` del videojuego.
  - `App.tsx` solo agrega las tres rutas de `MetaForm`.
  - `VideojuegoDetail.tsx` solo pasa `estado` a `SeccionProgreso`.
- **T-11:**
  - `EstadoSeccion` muestra carga (`role="status"`), error con «Reintentar» (`role="alert"`) y vacío, con tokens. Reemplaza en esta sección a `EstadoCarga`, que tiene colores heredados y no se modifica.
  - `SeccionProgreso` agrega los estados, el conservar datos mientras recarga después de desactivar y el descartar respuestas viejas. Sigue pidiendo el progreso al montarse: no usa caché ni sondeo.
  - `ProgresoSemanal` agrega las variantes sin meta y sin partidas.
  - `VideojuegoDetail.tsx` no se toca en este ticket: como el progreso se pide al montar, no necesita más propiedades.
- **D-2 (frontend):**
  - `PartidaForm.tsx` es el archivo principal: agrega el modo edición (`useParams`, carga con `partidasApi.listar()`, precarga, videojuego no editable, textos de título y botón, envío con `partidasApi.actualizar`). Conserva el modo crear. La conversión de la fecha ISO al valor local del campo vive dentro de este archivo.
  - `partidasApi.ts` agrega `actualizar(id, datos)` y el tipo `PartidaEdicion`. No cambia las funciones existentes.
  - `PartidasList.tsx` agrega el botón «Editar» en cada partida, con las clases que ya usa el archivo.
  - `App.tsx` agrega la ruta `/partidas/:id/editar` apuntando a `PartidaForm`. Si T-10 ya modificó este archivo, D-2 solo suma esa ruta.
  - Los archivos de D-2 son heredados (H14): lo agregado reutiliza las clases existentes de esos archivos y no se migra a tokens.
- **No se modifican** `frontend/src/api/cliente.ts`, `frontend/src/api/videojuegosApi.ts`, `frontend/src/utils/estilos.ts`, `frontend/src/components/EstadoCarga.tsx`, `frontend/src/index.css`, `frontend/src/paginas/VideojuegoForm.tsx`, `frontend/src/paginas/VideojuegosList.tsx` ni `frontend/package.json`.
- **Dependencias entre tickets:** T-08 depende de T-06 del backend. T-09 y T-10 dependen de T-08, y T-11 de T-09. T-10 necesita además que T-05 y T-07 estén hechos para probar los flujos de meta y estado. D-2 (frontend) va en la fase 8, después del despliegue, y depende de que D-1 y D-2 del backend estén hechos.
