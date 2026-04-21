# API de Integraciones Externas (MVP)

Este documento describe el flujo técnico para conectar un PMS/ERP de clínica o laboratorio con DentalLinkLab sin duplicar toda la base de datos.

## 1) Crear conexión y obtener API Key

Endpoint autenticado (usuario logueado en la app):

- `POST /api/integration-connections/`

Body:

```json
{
  "name": "PMS Clinica Centro",
  "external_system": "DentSoftX"
}
```

Respuesta:

```json
{
  "id": 3,
  "name": "PMS Clinica Centro",
  "external_system": "DentSoftX",
  "api_key": "...."
}
```

## 2) Importar pedido externo

Endpoint:

- `POST /api/integrations/import-order/`

Autenticación:

- Header `X-Integration-Key: <API_KEY>`

Ejemplo `curl`:

```bash
curl -X POST "http://localhost:8000/api/integrations/import-order/" \
  -H "Content-Type: application/json" \
  -H "X-Integration-Key: TU_API_KEY" \
  -d '{
    "external_order_id": "EXT-2026-001",
    "product_id": 5,
    "lab_id": 9,
    "teeth_numbers": "11,12",
    "shade": "A2",
    "notes": "Caso importado desde PMS",
    "scan_url": "https://storage.example.com/scan1.stl",
    "due_date": "2026-04-30",
    "priority": true,
    "patient": {
      "external_patient_id": "PAT-445",
      "first_name": "Ana",
      "last_name": "Gomez",
      "gender": "F"
    }
  }'
```

## 3) Sincronizar estado de pedido

Endpoint:

- `POST /api/integrations/order-status/`

Autenticación:

- Header `X-Integration-Key: <API_KEY>`

Ejemplo `curl`:

```bash
curl -X POST "http://localhost:8000/api/integrations/order-status/" \
  -H "Content-Type: application/json" \
  -H "X-Integration-Key: TU_API_KEY" \
  -d '{
    "external_order_id": "EXT-2026-001",
    "status": "production",
    "design_url": "https://storage.example.com/design-proposal.stl"
  }'
```

## 4) Ver logs de sincronización

Endpoint autenticado:

- `GET /api/integration-logs/`

Uso:

- Auditar éxitos/errores inbound y outbound por conexión.
