# PRD: Diario de Progreso Gamer, expansión E2 "Metas y rachas"

## 1. Problema

Muchos jugadores empiezan videojuegos y los abandonan por falta de constancia. El diario actual les permite anotar lo que jugaron, pero no les da un objetivo que cumplir ni les muestra si van bien o mal. Sin una meta, es fácil dejar pasar días, perder el hilo y dejar el juego sin terminar.

E2 convierte el diario en una herramienta de constancia. El jugador fija cuánto quiere jugar cada semana, ve cómo avanza y recibe señales de logro mientras mantiene el hábito.

## 2. Usuarios

- **Jugador individual** que ya registra sus partidas en el diario y quiere jugar con más regularidad o terminar los juegos que empieza.
- Es una aplicación personal, de una sola persona. No hay cuentas ni jugadores que se comparen entre sí.
- Todo el producto se usa en español y con la hora de Ecuador.

## 3. Objetivo y métrica de éxito

**Objetivo.** Que el jugador sostenga el hábito de jugar a lo largo de las semanas, apoyado en tres elementos: una meta semanal por videojuego, una racha de días jugados e hitos de avance.

**Métrica de éxito.** El jugador cumple su meta semanal en 3 de cada 4 semanas.

**Cómo se mide en esta versión.** La evaluación se hace de forma manual y queda fuera del alcance de E2. Esta versión no ofrece gráficos ni consulta del historial por semana, así que el producto no calcula la métrica por sí solo.

## 4. Alcance

E2 incluye:

1. **Meta semanal por videojuego.** El jugador define cuántas horas quiere jugar por semana y en cuántos días distintos de la semana. Cada videojuego puede tener como máximo una meta activa. La meta admite hasta 100 horas por semana y de 1 a 7 días por semana.
2. **Progreso semanal.** El jugador ve cuánto lleva en la semana actual frente a su meta, tanto en horas como en días jugados. La semana va de lunes a domingo, en hora de Ecuador.
3. **Racha de días jugados.** El jugador ve su racha actual y su mejor racha histórica.
4. **Hitos de avance.** El jugador puede definir hasta 5 hitos por meta, como porcentajes enteros del avance del videojuego, entre 1 y 100. Cada hito se muestra como alcanzado o pendiente según el avance actual del juego.
5. **Reemplazo de metas.** El jugador puede cambiar su meta. La meta anterior pasa a inactiva y se conserva en su historial.
6. **Calidad de las partidas.** Para que el progreso y las rachas sean confiables, las partidas deben tener una duración mayor que cero y no pueden tener fecha futura.

## 5. No-alcance

E2 no incluye:

- Gráficos ni vista histórica del cumplimiento por semana.
- Cálculo automático de la métrica de éxito.
- Reactivar una meta que ya fue desactivada.
- Cuentas de usuario, inicio de sesión o competencia entre jugadores.
- Rediseño visual de la aplicación.
- Notificaciones o recordatorios fuera de la aplicación.
- Puntos que ya se decidió posponer: evitar videojuegos duplicados, fijar un máximo de duración por partida y mejorar el manejo de logros.

## 6. Reglas de negocio

Todas las reglas usan la hora de Ecuador para decidir a qué día y a qué semana pertenece una partida.

### RN-01. Racha y día de hoy

La racha actual sigue viva si el jugador jugó hoy o ayer. Se rompe y vuelve a 0 cuando el último día jugado es anterior a ayer. La mejor racha histórica se conserva siempre.

*Ejemplo:* si la última partida fue el martes y hoy es miércoles, la racha sigue viva. Si hoy es jueves y no jugó el miércoles, la racha vuelve a 0, pero la mejor racha no cambia.

### RN-02. Varias partidas el mismo día

Varias partidas en un mismo día cuentan como un solo día jugado para la meta y para la racha. Sus minutos sí se suman al total de horas de la semana.

*Ejemplo:* dos partidas de 30 minutos el lunes suman 1 día jugado y 1 hora acumulada.

### RN-03. Partida que cruza la medianoche

Cada partida pertenece al día en que empieza. Todos sus minutos cuentan completos en la semana de ese día.

*Ejemplo:* una partida que empieza el domingo a las 23:30 y dura 90 minutos cuenta por completo en el domingo y en esa semana, aunque termine el lunes.

### RN-04. Cambio de meta a mitad de semana

El progreso de la semana se calcula siempre contra la meta activa en ese momento. Si el jugador cambia su meta a mitad de semana, el progreso se muestra de inmediato contra la meta nueva, con todo lo jugado en la semana.

### RN-05. Meta superada

El porcentaje de cumplimiento de horas se muestra como máximo en 100%. Las horas jugadas muestran siempre el valor real acumulado.

*Ejemplo:* con una meta de 5 horas y 7 jugadas, el cumplimiento se ve como 100% y las horas jugadas se ven como 7.

### RN-06. Hito ya alcanzado

El estado de cada hito se recalcula siempre según el avance actual del videojuego. Si el avance baja porque el jugador edita o borra partidas, un hito que estaba alcanzado vuelve a pendiente.

### RN-07. Juego completado o abandonado

- No se puede crear una meta activa para un videojuego que esté completado o abandonado.
- Si un videojuego con meta activa pasa a completado o abandonado, su meta activa se desactiva automáticamente.

### RN-08. Eliminar un videojuego que tiene metas

- Si el videojuego tiene partidas, no se puede eliminar.
- Si no tiene partidas, se puede eliminar y se eliminan junto con él todas sus metas, activas e inactivas.

### RN-09. Partidas válidas

No se permiten partidas con duración 0 ni con fecha futura. El jugador recibe un mensaje claro en español que le indica el problema.

### RN-10. Hitos de una meta

Una meta tiene como máximo 5 hitos. No puede haber dos hitos con el mismo porcentaje. Los hitos se muestran siempre ordenados de menor a mayor porcentaje.

### RN-11. Hito ya superado al crearlo

Se puede crear un hito cuyo porcentaje ya esté superado por el avance actual. En ese caso aparece como alcanzado desde el primer momento.

### RN-12. Reemplazar una meta

Al reemplazar una meta, la anterior pasa a inactiva y se conserva en el historial del videojuego. Una nueva meta nunca borra a la anterior.

### RN-13. Meta desactivada

Una meta desactivada no se reactiva. Si el jugador quiere volver a una meta anterior, crea una nueva.

### RN-14. Una meta activa por videojuego

Cada videojuego tiene como máximo una meta activa a la vez. Puede tener varias metas inactivas en su historial.

## 7. Supuestos

- El día y la semana se miden en hora de Ecuador, que no cambia durante el año.
- La semana empieza el lunes y termina el domingo.
- El porcentaje de un hito se mide sobre el avance del videojuego, que va de 0 a 100, según la última partida registrada. Los hitos son porcentajes enteros de 1 a 100. No se mide sobre el cumplimiento de la meta semanal.
- Cuando el jugador edita una partida, no puede cambiarla a otro videojuego.
- La aplicación es de un solo jugador, por lo que no hay que separar datos entre personas.

## 8. Puntos abiertos

No hay puntos abiertos. Los que quedaban se resolvieron así:

1. **Meta cumplida en la semana.** La semana está cumplida solo si se alcanzan las horas Y los días de la meta.
2. **Tolerancia de "fecha futura".** Se acepta hasta 5 minutos de diferencia entre el reloj del jugador y el del sistema.
3. **Límites de la meta.** Las horas por semana van de más de 0 hasta 100 como máximo. Los días por semana van de 1 a 7.
4. **Hitos al reemplazar una meta.** La meta nueva no copia los hitos de la anterior. Empieza con los hitos que el jugador defina.
5. **Alcance de la racha.** La racha es de cada videojuego.
6. **Corrección de partidas.** Varias reglas, como RN-04 y RN-06, suponen que el jugador puede corregir sus partidas. La edición de partidas se entrega como mejora de la fase final de E2, junto con la validación de partidas. Hasta entonces, las reglas se cumplen con las partidas que el jugador crea o borra.
