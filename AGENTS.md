# Diario de Progreso Gamer

Épica E2: meta semanal, progreso, racha e hitos por videojuego.

## Stack
- Backend: Node 20, Express, TypeScript, Mongoose, MongoDB Atlas, Vitest.
- Frontend: React 18, Vite, TypeScript, Tailwind v4, despliegue en Render.

## Estructura
- `backend/src/`: `routes`, `controllers`, `services`, `modelos`, `middlewares`, `config`, `dominio` (se crea en E2).
- `frontend/src/`: `api`, `components`, `paginas`, `utils`.
- `docs/`: `specs/`, `prd/`, `backlog/`, `diagnostico.md`.

## Comandos
- Backend (`cd backend`): `npm run dev | check | test | build` (`test` se crea en E2).
- Frontend (`cd frontend`): `npm run dev | check | build`.

## Convenciones
- Español en el dominio y en la UI. TypeScript estricto.
- Capas: controlador -> servicio -> modelo.
- Cálculo puro en `src/dominio`, sin acceso a BD.
- Errores con `ApiError` y `errorHandler`.
- Commits:
  - `docs (E2):`
  - `chore (harness):`
  - `test (E2): T-xx`
  - `feat (E2): T-xx`
  - `fix (deuda): D-x`

## Frontend
- La identidad visual y los componentes están en `DESIGN.md`.
- No usar colores ni librerías no autorizadas.

## Reglas
1. Nunca leer ni modificar `.env`; solo `.env.example`.
2. Ninguna funcionalidad sin spec en `docs/specs/`.
3. Ejecutar los tests antes de terminar.
4. Primero el test y luego el código, en commits separados.
5. No agregar dependencias sin permiso.
6. Detenerse y avisar si el código y la spec discrepan.
