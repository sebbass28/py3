# Retención y Privacidad de Datos

Este documento define una política operativa mínima para gestión de datos clínicos en DentalLinkLab.

## Objetivo

- Mantener trazabilidad de pedidos e historial técnico.
- Reducir exposición de datos identificativos cuando ya no son necesarios.
- Permitir cumplimiento progresivo de LOPD/GDPR para un proyecto realista.

## Reglas operativas actuales

- Un paciente puede anonimizarse desde la API:
  - `POST /api/patients/<id>/anonymize/`
- La anonimización:
  - reemplaza `first_name`, `last_name`, `external_id`,
  - limpia `birth_date` y `gender`,
  - conserva la relación de pedidos para auditoría y métricas.
- Si el paciente tiene pedidos activos, la API bloquea por defecto.
  - Para forzar en casos excepcionales: `{"force": true}`.

## Recomendaciones de despliegue

- Restringir acceso al endpoint a perfiles clínicos autorizados.
- Registrar en `OrderEvent`/auditoría cada anonimización con actor y timestamp.
- Definir ventana de retención por contrato (ej. 5 años facturación, 2 años actividad clínica).
- Integrar procedimiento de exportación y derecho de acceso del paciente.
