---
name: nueva-spec
description: Crea una spec en docs/specs/ con la plantilla del proyecto.
disable-model-invocation: true
---

# Nueva spec

Genera `docs/specs/<nombre>.md` con la plantilla del proyecto. No escribas código, solo la spec.

## Pasos

1. Toma el nombre de `$ARGUMENTS`. Si falta, pídelo al usuario y espera la respuesta antes de seguir.
2. Convierte el nombre a kebab-case en minúsculas y sin tildes (por ejemplo `racha-semanal`).
3. Si `docs/specs/<nombre>.md` ya existe, avisa y no lo sobrescribas.
4. Lee `docs/diagnostico.md` y, si existen, los archivos de `docs/prd/` y `docs/backlog/` para completar el contexto con datos reales. No inventes requisitos: si algo falta, déjalo como pregunta abierta.
5. Crea el archivo con la plantilla de abajo, en español.

## Plantilla

```markdown
# Spec: <nombre>

## Contexto
Historia o ticket que origina la spec y por qué se necesita.

## Reglas
### DEBE
- ...

### NO DEBE
- ...

## Contrato
(Solo si aplica; si no, escribe "No aplica".)
- Endpoint: `MÉTODO /api/...`
- Request: campos y tipos.
- Response: campos y tipos.
- Errores: código HTTP y mensaje en español.

## Criterio -> verificación
| id | criterio | verificación |
|---|---|---|
| CA-01 | ... | Prueba Vitest en `backend/src/...` |
| CA-02 | ... | ... |

## Ticket -> archivos
| ticket | archivos |
|---|---|
| T-01 | `backend/src/...` |
```

## Reglas de la plantilla

- Cada criterio tiene un id `CA-xx` único y consecutivo, y se puede verificar con una prueba o una revisión concreta.
- Cada ticket lista los archivos que tocará, sin tocar los que no aparecen en la tabla.
- Al terminar, muestra la ruta del archivo creado y lista las preguntas abiertas, si las hay.
