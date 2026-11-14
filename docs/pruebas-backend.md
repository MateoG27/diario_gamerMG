# Evidencia de Pruebas Manuales (Backend)

| Criterio / Caso | Método y Endpoint | Resultado (HTTP Status) | Fecha de prueba |
| :--- | :--- | :--- | :--- |
| CA-01 (Crear meta válida) | POST /api/videojuegos/123/metas | 201 Created | Hoy |
| CA-02 (Límites 0 y 101 horas) | POST /api/videojuegos/123/metas | 400 Bad Request | Hoy |
| CA-03 (Meta activa duplicada) | POST /api/videojuegos/123/metas | 409 Conflict | Hoy |
| CA-16 (Sexto hito rechazado) | POST /api/videojuegos/123/metas | 400 Bad Request | Hoy |
| CA-17 (Porcentajes repetidos) | POST /api/videojuegos/123/metas | 400 Bad Request | Hoy |
| CA-24 (Juego terminado/abandonado)| POST /api/videojuegos/123/metas | 400 Bad Request | Hoy |
| CA-26 (Borrar juego con partidas) | DELETE /api/videojuegos/123 | 409 Conflict | Hoy |
| CA-27 (Borrar juego sin partidas) | DELETE /api/videojuegos/456 | 200 OK (Metas borradas) | Hoy |