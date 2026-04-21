# Scrum en GitHub para DentaLinkLab

Esta guia define un flujo simple y demostrable para evidenciar trabajo Scrum en GitHub.

## 1) Estructura base
- Backlog en Issues usando plantilla `User Story`.
- Desglose tecnico en Issues tipo `Task`.
- Incidencias con plantilla `Bug Report`.
- Desarrollo en ramas por issue y PR con plantilla estandar.

## 2) Convencion de ramas
- `feature/us-<id>-<slug>`
- `fix/bug-<id>-<slug>`
- `chore/task-<id>-<slug>`

Ejemplo:
`feature/us-42-chat-clinica-lab`

## 3) Ciclo de Sprint (2 semanas sugerido)
1. Sprint Planning:
   - Mover historias de `Backlog` a `Sprint`.
   - Estimar Story Points.
2. Daily:
   - Actualizar estado de issues (`status:in-progress`).
3. Review:
   - PR vinculadas a historias/tareas.
4. Retro:
   - Crear issue de mejoras de proceso.

## 4) Estados recomendados (labels)
- `status:backlog`
- `status:in-progress`
- `status:review`
- `status:done`

- `type:user-story`
- `type:task`
- `type:bug`
- `priority:high|medium|low`

## 5) Definicion de Done
- Criterios de aceptacion cumplidos.
- PR revisada y mergeada.
- Sin errores de lint.
- Documentacion actualizada.

## 6) Evidencia para memoria TFG
- Capturas del board por sprint.
- Issues enlazadas con PRs.
- Burndown simple (issues cerradas por fecha).
- Release notes por iteracion.
