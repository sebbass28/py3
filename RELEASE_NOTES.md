# Release Notes - DentalLinkLab (TFG)

## Estado general

Release funcional sin pagos, orientada a demo académica y operación local/cloud controlada.

## Backend

- Flujo completo de pedidos clínica-laboratorio con estados y auditoría (`OrderEvent`).
- Chat por pedido con adjuntos y SLA de respuesta.
- Notificaciones in-app + marcado global de leídas.
- Cola de laboratorio avanzada:
  - asignación de técnico,
  - vencimientos y prioridad,
  - endpoint `lab_queue` con filtros (`status`, `assigned_technician`, `due_bucket`),
  - enriquecimiento `due_state`.
- Métricas y exportación:
  - `orders/metrics/`
  - `orders/export_csv/`
- Integraciones externas MVP:
  - conexiones con API key,
  - `integrations/import-order/`,
  - `integrations/order-status/`,
  - logs de sync.
- Seguridad y hardening:
  - throttling global + scopes específicos,
  - validaciones extra multi-tenant en endpoints de integración.
- Privacidad:
  - endpoint `patients/<id>/anonymize/` con control por casos activos (`force=true`).
- Media storage:
  - soporte local y remoto S3-compatible (`USE_S3_MEDIA`).

## Frontend

- Dashboard por rol con filtros avanzados.
- Kanban de producción para laboratorio con drag & drop por estado.
- Gestión de pacientes:
  - alta,
  - edición,
  - ficha con pedidos asociados,
  - anonimización.
- Finder público de clínicas:
  - búsqueda flexible,
  - filtros de precio/rating,
  - ordenamiento.
- Integraciones:
  - página privada de conexiones, keys y logs.
- UX:
  - toasts globales para feedback de acciones (en reemplazo progresivo de alerts).

## Calidad y validación

- Tests backend (`marketplace.tests`) cubriendo:
  - cola lab y filtros,
  - métricas/export CSV,
  - paciente->pedidos por rol,
  - anonimización,
  - seguridad en integraciones,
  - chat/notificaciones.
- Smoke script:
  - `scripts/smoke_local.ps1` (check + tests + build).
- Checklist de entrega:
  - `docs/checklist_release_sin_pagos.md`.

## Pendiente fuera de esta release

- Pasarela de pagos (Stripe/Connect) y webhooks de cobro.
- WebSockets para notificaciones en tiempo real (actualmente polling).
- Cobertura E2E más amplia con tests de UI automatizados.
