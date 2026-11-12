# Épicas del Diario de Progreso Gamer

## E1. Registro de videojuegos y partidas (ya construido en P3)

**Objetivo.** Llevar un diario personal de los videojuegos que el jugador tiene y de las sesiones que juega.

**Lo que ya existe:**

- Catálogo de videojuegos, con filtros por estado, plataforma y género.
- Alta, edición y eliminación de videojuegos. Un videojuego con partidas no se puede eliminar.
- Registro, listado y eliminación de partidas de cada videojuego.
- Resumen de cada videojuego: total de partidas, horas totales, última partida y avance actual.
- Logros por videojuego: agregar, marcar como obtenido y quitar.
- Pantallas con estados de carga, error y vacío, y confirmación antes de eliminar.

**Limitaciones conocidas** (resumidas del diagnóstico del proyecto):

- Las partidas no se pueden corregir una vez creadas.
- Una partida acepta duración 0 y fecha futura, lo que distorsiona las horas totales y el avance.
- Los días y las horas no tienen una zona horaria definida de forma explícita.

Estas limitaciones afectan a E2, porque el progreso y las rachas se derivan de las partidas. Por eso E2 las trata como prerrequisitos.

## E2. Metas y rachas

**Objetivo.** Convertir el diario en una herramienta de constancia, para que el jugador sostenga el hábito de jugar y termine los juegos que empieza.

**Alcance:**

- Meta semanal por videojuego, con horas por semana y días por semana. Como máximo una meta activa por juego.
- Progreso de la semana en hora de Ecuador, de lunes a domingo, en horas y en días jugados.
- Racha actual de días jugados y mejor racha histórica.
- Hasta 5 hitos por meta, medidos como porcentaje de avance del videojuego.
- Reemplazo de metas con el historial conservado.
- Partidas válidas: duración mayor que cero y sin fecha futura.

**Fuera de alcance:**

- Gráficos e historial visual por semana.
- Cálculo automático de la métrica de éxito.
- Reactivar metas desactivadas.
- Cuentas de usuario y competencia entre jugadores.
- Rediseño visual y recordatorios fuera de la aplicación.

**Criterio de éxito.** El jugador cumple su meta semanal en 3 de cada 4 semanas, según la métrica del documento de producto. En esta versión la evaluación se hace de forma manual.

**Reglas de negocio aplicables.** Las definiciones completas están en el documento de producto.

| Regla | Tema |
|---|---|
| RN-01 | Racha y día de hoy |
| RN-02 | Varias partidas el mismo día |
| RN-03 | Partida que cruza la medianoche |
| RN-04 | Cambio de meta a mitad de semana |
| RN-05 | Meta superada |
| RN-06 | Hito ya alcanzado |
| RN-07 | Juego completado o abandonado |
| RN-08 | Eliminar un videojuego que tiene metas |
| RN-09 | Partidas válidas |
| RN-10 | Hitos de una meta |
| RN-11 | Hito ya superado al crearlo |
| RN-12 | Reemplazar una meta |
| RN-13 | Meta desactivada |
| RN-14 | Una meta activa por videojuego |

**Prerrequisitos de producto:**

- Partidas válidas, con duración mayor que cero y sin fecha futura.
- Partidas que el jugador pueda corregir, porque varias reglas dependen de que el avance cambie al editar.
- Día y semana definidos en hora de Ecuador de forma consistente en toda la aplicación.

**Puntos abiertos.** Están detallados en el documento de producto: condición de meta cumplida, tolerancia de fecha futura, límites de la meta, hitos al reemplazar una meta y alcance de la racha.
