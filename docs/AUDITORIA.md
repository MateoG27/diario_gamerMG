# Auditoría de criterios CA-01 a CA-30 (épica E2)

**Cómo leer la columna "cómo se verificó".**
- **U** = test unitario Vitest.
- **C** = revisión de código.
- **M** = verificación manual pedida por la spec.

## HU-01. Definir una meta

| criterio | cómo se verificó | resultado | evidencia |
|---|---|---|---|
| CA-01 Meta 5 h / 3 d queda activa | C + M (spec) | **Cumple** (por código) | `metas.service.ts` `crear`: valida y hace `Meta.create`. `metas.controller.ts:11` responde 201. `Meta.model.ts`: `activa` por defecto `true`. No hay test ni registro manual. |
| CA-02 Valores inválidos, 100 sí / 101 no | C + M | **Cumple** (por código) | `metas.service.ts` `validarCuerpo`: `horasSemana <= 0 \|\| > 100` y `esEntero(diasSemana,1,7)`, con mensajes en español. Se repite en `Meta.model.ts` (validators). En frontend, `MetaForm.tsx` `enviar` valida 0 < h ≤ 100 y días 1–7. No hay test de los límites 100/101. |
| CA-03 Una sola meta activa | C + M | **Cumple** | `metas.service.ts` `crear` comprueba `Meta.exists({activa:true})` y lanza 409. `Meta.model.ts` declara el índice único parcial. `errorHandler.ts` traduce 11000 a 409. No hay evidencia de que el índice exista en la BD: depende de ejecutar `npm run indices`. |

## HU-02. Progreso semanal

| criterio | cómo se verificó | resultado | evidencia |
|---|---|---|---|
| CA-04 Progreso 5 h / 3 d cumplida | U + C | **Cumple** | `progreso.test.ts`: «CA-04: suma solo la semana actual y cumple con horas y días», «…horas completas pero días insuficientes…» y «…días completos pero horas insuficientes…». Código: `progreso.ts` `calcularProgresoSemanal`. Frontend: `ProgresoSemanal.tsx` usa `progreso.cumplida` sin recalcularlo. |
| CA-05 Partida domingo 23:30 + 90 min | U | **Cumple** | `progreso.test.ts`: «CA-05: partida del domingo 23:30 de 90 min cuenta completa en el domingo y en esa semana» y «CA-05: esa misma partida no cuenta en la semana siguiente». |
| CA-06 Meta superada: 100 %, 7 h, no cumplida | U + C | **Cumple** | `progreso.test.ts`: «CA-06: meta superada limita el porcentaje a 100…». `ProgresoSemanal.tsx` muestra `horasJugadas` real, la barra se limita con `Math.min(100,…)` y calcula los días que faltan. |

## HU-03. Racha

| criterio | cómo se verificó | resultado | evidencia |
|---|---|---|---|
| CA-07 Racha viva (última partida ayer) | U | **Cumple** | `progreso.test.ts`: «CA-07: última partida ayer y hoy sin jugar, la racha sigue contando». Código: `calcularRacha`, `hoy - ultimo <= 1`. |
| CA-08 Racha rota, mejor conservada | U + C | **Cumple** | `progreso.test.ts`: dos tests «CA-08: …» (anteayer → `{actual:0, mejor:3}`; mucho antes → `{0,2}`). El texto de la UI para racha 0 es «Retoma cuando quieras…» (`ProgresoSemanal.tsx` `textoRacha`). |
| CA-09 Varias partidas el mismo día | U | **Cumple** | `progreso.test.ts`: «CA-09: varias partidas el mismo día cuentan un día y suman sus minutos» y «CA-09: …cuentan un solo día de racha». |
| CA-10 Sin partidas | U | **Cumple** | `progreso.test.ts`: «CA-10: sin partidas la racha actual y la mejor son 0». Para la UI, `ProgresoSemanal.tsx` usa `racha.mejor === 0` como "sin partidas". |
| CA-11 Racha crece y actualiza la mejor | U | **Cumple** | `progreso.test.ts`: «CA-11: jugar un día nuevo que continúa la racha sube la actual y actualiza la mejor» (`{2,2}` → `{3,3}`). Código: `Math.max(mejor, actual)`. |

## HU-04. Hitos

| criterio | cómo se verificó | resultado | evidencia |
|---|---|---|---|
| CA-12 Hito alcanzado (≥) | U | **Cumple** | `progreso.test.ts`: «CA-12: …avance es igual…» y «CA-12: …avance es mayor». |
| CA-13 Hito pendiente | U | **Cumple** | `progreso.test.ts`: «CA-13: el hito queda pendiente…». Usa 49 %, no el 30 % del enunciado. Es equivalente. |
| CA-14 Hito vuelve a pendiente | U + C | **Cumple** | `progreso.test.ts`: «CA-14: si el avance baja, el hito vuelve a pendiente». `progreso.service.ts` calcula `alcanzado` en cada lectura y `avanceActual` sale de la última partida. Ruta de edición: `PATCH /partidas/:id` en `partidas.routes.ts`. |
| CA-15 Hito ya superado al crearlo | U + C | **Cumple** | `progreso.test.ts`: «CA-15: un hito con porcentaje ya superado aparece alcanzado». El servicio no bloquea hitos ya superados, y `MetaForm.tsx` tampoco. |
| CA-16 Máximo 5 hitos | C + M | **Cumple** (por código) | `metas.service.ts`: `hitos.length > MAX_HITOS` lanza 400 «Una meta admite como máximo 5 hitos». También en `Meta.model.ts` y en `MetaForm.tsx` `agregarHito`. Sin test. |
| CA-17 Porcentaje repetido | C + M | **Cumple** (por código) | `metas.service.ts`: `new Set(hitos).size !== hitos.length` lanza 400. `MetaForm.tsx`: `MSG_HITO_REPETIDO`. Sin test. |
| CA-18 Orden de menor a mayor | U + C | **Cumple** | `progreso.test.ts`: «CA-18: devuelve los hitos ordenados de menor a mayor». El servicio ordena al guardar (`sort`), el modelo tiene un setter que ordena, y `ListaHitos.tsx` respeta el orden del servidor. |

## HU-05. Editar / desactivar

| criterio | cómo se verificó | resultado | evidencia |
|---|---|---|---|
| CA-19 Editar meta activa | C + M | **Cumple** (por código) | `PATCH /api/metas/:metaId` → `metas.service.ts` `actualizar` (`findOneAndUpdate` con `activa:true`). Lista blanca `['horasSemana','diasSemana','hitos']`. `metasApi.actualizar` y `MetaForm.tsx` modo `editar` envían solo `MetaDatos`. |
| CA-20 Cambio de meta a mitad de semana | U + C | **Cumple** | `progreso.test.ts`: «CA-20: las mismas partidas se miden contra la meta que esté activa». El progreso se calcula al leer, y `SeccionProgreso.tsx` se vuelve a pedir al montarse el detalle. |
| CA-21 Desactivar con confirmación, queda en el historial | C + M | **Cumple** | Cumple: `SeccionProgreso.tsx:70` hace `window.confirm`, y con cancelar no hay petición. `metas.service.ts` `desactivar` marca `activa:false` y `desactivadaEn`. **Cumple:** no hay historial en pantalla. `HistorialMetas.tsx` no existe en `frontend/src`, y `SeccionProgreso` nunca llama a `listarPorVideojuego`. La spec (frontend) y T-10 lo exigen. |
| CA-22 Meta desactivada no se reactiva | C + M | **Cumple** (por código) | `metasApi.ts` no tiene reactivar ni eliminar. `metas.routes.ts` no tiene esas rutas. `actualizar` devuelve 409 sobre una meta inactiva. `activa` en el cuerpo da 400 por la lista blanca. `MetaForm.tsx` `modo !== 'nueva' && !activa` muestra un aviso. |
| CA-23 Reemplazar meta | C + M | **Cumple** | Cumple: `MetaForm.tsx` modo `reemplazar` hace `desactivar` y luego `crear`, sin hitos copiados, con aviso de reemplazo y mensaje si falla la segunda llamada. **Cumple** "visible en el historial" no se cumple en la UI (ver CA-21). Por API sí (`GET /videojuegos/:id/metas`). |

## HU-06. Coherencia con el juego

| criterio | cómo se verificó | resultado | evidencia |
|---|---|---|---|
| CA-24 Sin meta en juego terminado o abandonado | C + M | **Cumple** (por código) | `metas.service.ts` `crear`: estado `completado` o `abandonado` da 409. `MetaForm.tsx`: `MSG_JUEGO_FINALIZADO`. `SeccionProgreso.tsx` no ofrece «Definir meta» si `!enCurso`. |
| CA-25 Desactivación automática por cambio de estado | C + M | **Cumple** | Backend cumple: `videojuegos.service.ts` `actualizar` hace `Meta.updateMany(...activa:false)`, y la ruta sirve tanto `PUT` como `PATCH`. **Falla en UI:** la spec (frontend) pide que el historial muestre la meta desactivada, y ese historial no existe. |
| CA-26 Eliminar juego con partidas se bloquea | C + M | **Cumple** (por código) | `videojuegos.service.ts` `eliminar`: `Partida.exists` da 409 antes de borrar nada, así que el juego y sus metas se conservan. |
| CA-27 Eliminar juego sin partidas borra sus metas | C + M | **Cumple** (por código) | `videojuegos.service.ts` `eliminar`: `deleteOne()` y luego `Meta.deleteMany({videojuego})`. No es transaccional: si falla entre las dos operaciones quedarían metas huérfanas. |

## Calidad de partidas

| criterio | cómo se verificó | resultado | evidencia |
|---|---|---|---|
| CA-28 Duración 0 se rechaza (crear y editar) | U + C + M | **Cumple** | `partida.test.ts`: «duración 0 se rechaza» y «duración negativa se rechaza». `partidas.service.ts` llama a `validarDatosPartida` en `crear` y en `actualizar`, con 400. `PartidaForm.tsx` muestra el error en `role="alert"`. La comprobación manual de la ruta no está registrada. |
| CA-29 Fecha futura (tolerancia 5 min) | U + C + M | **Cumple** | `partida.test.ts`: «una fecha una hora en el futuro se rechaza», «…2 minutos…entra en la tolerancia», «…exactamente 5 minutos…es válida» y «…1 ms después del límite…se rechaza». Aplicado en `crear` y `actualizar` del servicio. |
| CA-30 Editar partida recalcula todo | C + M | **Cumple** (por código) | `PATCH /api/partidas/:id` (`partidas.routes.ts` y `partidas.service.ts` `actualizar`). El progreso no se guarda, se calcula al leer (`progreso.service.ts`). `SeccionProgreso.tsx` pide el progreso al montarse, sin caché. `PartidasList.tsx:143` tiene el botón «Editar». `PartidaForm.tsx` tiene modo edición, y `App.tsx` la ruta `/partidas/:id/editar`. |
