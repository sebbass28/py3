# Checklist Release (Sin Pagos)

Checklist práctico para validar una entrega funcional de DentalLinkLab sin pasarela de pago.

## 1) Infraestructura y entorno

- [ ] Variables de entorno cargadas (`.env.local` o entorno cloud).
- [ ] Si usas media remota: `USE_S3_MEDIA=True` + variables `AWS_*` completas.
- [ ] Migraciones al día: `python manage.py migrate`.
- [ ] Dependencias instaladas: `pip install -r requirements.txt` y `npm install`.

## 2) Validación técnica mínima

- [ ] `python manage.py check`
- [ ] `python manage.py test marketplace.tests`
- [ ] `cd frontend && npm run build`
- [ ] Ejecutar smoke script unificado:
  - `powershell -ExecutionPolicy Bypass -File .\scripts\smoke_local.ps1`

## 3) Flujo funcional core

- [ ] Registro/Login de clínica y laboratorio.
- [ ] Clínica crea paciente y pedido.
- [ ] Laboratorio ve pedido en cola/kanban y cambia estado.
- [ ] Chat clínica-lab con imagen adjunta funciona.
- [ ] Timeline y notificaciones se actualizan.
- [ ] Factura PDF se genera y descarga.
- [ ] Export CSV descarga correctamente.
- [ ] Finder de clínicas filtra por texto, precio, rating y orden.

## 4) Integraciones externas

- [ ] Conexión creada en `/integrations` con API key.
- [ ] `import-order` crea pedido externo.
- [ ] `order-status` actualiza estado válido.
- [ ] Logs de sincronización reflejan éxito/error.
- [ ] Se verifica aislamiento entre clínicas (no cross-tenant updates).

## 5) Privacidad y seguridad operativa

- [ ] Endpoint de anonimización de paciente validado (`patients/<id>/anonymize/`).
- [ ] Throttling activo para integraciones y endpoint de test email.
- [ ] No se exponen secretos en repo (`.env.local` ignorado).
- [ ] Revisión manual de permisos por rol en endpoints sensibles.

## 6) Criterio de salida (Go/No-Go)

Solo marcar **GO** si:

- Smoke script pasa en verde.
- Flujo funcional core pasa sin bloqueos.
- Integraciones básicas pasan.
- No hay regresiones críticas en UI/API.
