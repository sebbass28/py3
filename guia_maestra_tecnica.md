# Guía Técnica Maestra: Plataforma Dental Integral

Esta es la documentación arquitectónica de **alto nivel de detalle** para programadores y arquitectos de software. Describe *exactamente* cómo orquestar las piezas (React, Three.js, Django, S3, APIs) sin mostrar código, pero sí la lógica de implementación paso a paso.

---

## 1. MÓDULO VISOR 3D: React-Three-Fiber (R3F)
Este módulo debe ser de carga dinámica para no penalizar el peso del dashboard principal.

### 1.1. Arquitectura de Componentes
Tu front-end (React) debe separar estrictamente UI de Canvas 3D.
*   **Componente `ViewerContext`**: Un proveedor de estado puro (sin DOM) que guarda: *File URL, Material Activo, Visibilidad del Grid, Coordenadas de Anotaciones*.
*   **Componente `OverlayUI`**: Botones HTML estándar flotantes (Z-Index sobre el canvas) para "Resetear Cámara", "Cambiar Material", "Añadir Marcador".
*   **Componente `Canvas3D`**: Solo expone el elemento `<Canvas>` de R3F.

### 1.2. Flujo de Carga Óptima (El Cuello de Botella)
Los modelos 3D pesan megabytes. Si no lo haces así, la pestaña se congelará.
1.  **Suspense Boundary**: Envuelve el componente que carga el modelo (ej. `<ModelLoader />`) en un `<React.Suspense fallback={<ProgressBar />}>`.
2.  **Web Workers y Draco**:
    *   No cargues STLs crudos si es posible en producción; el backend debería convertirlos a `.GLB` con compresión *Draco* o *Meshopt*.
    *   Usa `useGLTF(url)` de `@react-three/drei`. Por debajo, esto pasará la data comprimida a un Worker en otro hilo del procesador. El `main thread` sigue libre para que la UI responda.
3.  **Centrado Universal**: Un escaneo de la boca a veces está "lejos del centro (0,0,0)". Para que la cámara no apunte a la nada, envuelve el modelo en `<Center>` (de *Drei*).

### 1.3. Manejo de Metadatos (Notas Visuales)
Cómo hacer el sistema de comentarios:
*   Usar un `<Raycaster>` automático de R3F (evento `onPointerDown` en el *Mesh*).
*   Al hacer clic, R3F te da el objeto `intersect.point` (Vector3 con X,Y,Z).
*   Guarda este Vector3 en Zustand o tu estado React.
*   Renderiza elementos dinámicos `<Html center position={[X,Y,Z]}>` (de *Drei*). Esto dibuja un `div` normal de React que "persigue" ese punto 3D aunque la cámara rote.

### 1.4. Visualización Médica (TAC/DICOM)
Si se requiere, no uses el pipeline anterior.
*   Instala `ami.js`. Es un motor escrito sobre Three.js puro.
*   Crea un wrapper de React: pasa una referencia (`useRef`) a un `div` vacío y deja que el `VolumeLoader` de AMI inyecte su `<canvas>` allí. Utiliza la clase `Widgets.Voxel` de AMI para dibujar planos de corte (malla ortogonal).

---

## 2. MÓDULO BACKEND: Django y Archivos Pesados

Django orquesta la seguridad, pero **nunca manipula los archivos binarios directamente** en su hilo web (Gunicorn).

### 2.1. Gestión de Almacenamiento (Amazon S3 / Google Cloud)
1.  **Direct Upload (La clave)**:
    *   La clínica sube un archivo de 200MB.
    *   React hace GET `api/v1/storage/upload-url/`.
    *   Django responde con un **Pre-signed URL** de AWS S3 que caduca en 15 minutos (Librería `boto3.client('s3').generate_presigned_post()`).
    *   React envía el archivo directamente a AWS S3. Django nunca "toca" esos 200MB.
2.  **Webhook de Confirmación**: AWS S3 notifica a Django (o React envía el S3 Key final) y Django guarda el registro en la tabla `ScanFile(url="s3://...")`.

### 2.2. Procesadores en Segundo Plano (Celery + Redis)
El archivo DICOM (.zip) subido necesita procesamiento.
1.  React notifica la subida exitosa.
2.  Django lanza en Celery: `task_extract_dicom_metadata.delay(file_id)`.
3.  El *Worker* de Celery descarga el archivo, usa la librería `pydicom`, extrae el `PatientName`, `StudyDate` y anota estos metadatos en Django. Opcionalmente extrae el volumen ISO-surface usando la librería `vtk` y guarda un `.glb` simplificado de nuevo en S3.

---

## 3. MÓDULO ESTRATÉGICO: Integración Dentalink (PMS)

El flujo para convertir a Dentalink en tu fuente de verdad.

### 3.1. Handshake y Autenticación
*   Solicita la documentación API (REST) de Dentalink. Te darán un Bearer Token o API Key. Almacena las credenciales encriptadas en la configuración de la Clínica en Django.

### 3.2. Flujo Inbound (Dentalink -> Marketplace)
*   **Triggers (Cronjobs o Webhooks)**:
    *   Si Dentalink tiene webhooks, suscríbete a `tratamiento_creado`.
    *   Si no, usa Celery Beat para hacer un polling cada X horas: `GET /api/v1/tratamientos/?estado=aprobado`.
*   **Mapeo de Datos**: Si un tratamiento detectado es "Implante", mapea el `DienteID` y los detalles del `PacienteID`. Django crea una fila en borrador en tu tabla [Order()](file:///c:/Users/Apliquem/Desktop/py3/marketplace/models.py#57-87).

### 3.3. Flujo Outbound (Marketplace -> Dentalink)
*   **El Evento de Tránsito**: El Laboratorio pulsa "Enviar". El evento en tu backend lanza un trigger.
*   **La Llamada Externa**: Tu sistema hace un `POST` a la API de Dentalink (Ej: `POST /api/v1/citas/`) creando una cita tentativa para el paciente, 2 días después del tiempo de entrega estimado, bajo el motivo "Prueba de Estructura / Entrega Laboratorio".

---

## 4. MÓDULO LOGÍSTICO: "El Amazon Dental" (Sendcloud/Packlink)

No firmes contratos con 10 empresas. Usa un Agregador (API First).

### 4.1. Configuración de API Logística
*   **Aprovisionamiento**: Registra tu plataforma en Sendcloud. En el panel, conectas tus contratos de SEUR, Correos Express, etc.
*   **Librería Python**: Usa `requests` u otra librería HTTTP estándar.

### 4.2. Flujo "1-Click Shipping"
1.  **Tarificación en origen**: Al hacer el pedido, tu Django llama al endpoint de cotización pasándole los Códigos Postales. Te devuelve: "SEUR: 5€, Correos: 4€". Permites elegir.
2.  **Creación de Etiqueta (Label Creation)**: Cuando el laboratorio finaliza la pieza, Django hace un `POST /api/v2/parcels` con remitente, destinatario y peso.
3.  **PDF Inmediato**: La API devuelve la URL de un PDF. Muestras ese PDF en el dashboard del Laboratorio en un `<iframe src="...">`. Lo imprime y lo pega en la caja.

### 4.3. Monitorización Automática de Estados
*   **Suscripción a Webhooks**: En el panel del agregador, registras tu ruta `https://tu-api.com/webhooks/logistics/`.
*   **Estados Clave**: Cada evento (En camino, Entregado, Incidencia), la logística hace un PUSH a Django.
*   **Consecuencia**: Ganas trazabilidad perfecta en el frontend sin tener que enviar peticiones costosas cada vez que el usuario carga la página.

---

## 5. MÓDULO FINANCIERO: Escrow y Comisiones (Stripe Connect)

La arquitectura para mover dinero legalmente (el Marketplace no "toca" dinero ajeno de forma directa, es un Custodio Técnico).

### 5.1. Topología del Escrow (Destination Charges)
Utilizarás la topología de `Destination Charges` de Stripe Connect (Express o Custom).
1.  **Laboratorios = Connect Accounts**: Cada laboratorio tiene su propio identificador bancario en Stripe.
2.  **La Plataforma = Main Account**: Cobra la comisión (`application_fee_amount`).

### 5.2. Ciclo de Vida del Pago Retenido
1.  **Autorización Previa (PaymentIntent)**:
    *   La clínica paga 100€ + IVA por un pedido.
    *   Llamada: `stripe.PaymentIntent.create(amount=10000, transfer_data={"destination": "{LAB_ACC_ID}"}, capture_method="manual")`.
    *   La tarjeta se bloquea (saldo reservado).
2.  **Captura del Pago**:
    *   Si el laboratorio revisa el STL y *acepta* el pedido, haces un `payment_intent.capture()`.
    *   Ahora Stripe tiene el dinero, pero lo deja en **Hold** gracias al flujo Escrow.
3.  **Hito de Liberación Automática (Payout)**:
    *   *(Recuerda el Webhook logístico del punto 4)*. Cuando Django recibe `status="Delivered"`, llama a la función de liberación de pago hacia el Laboratorio.
    *   El laboratorio recibe 92€ en su balance. Tú recibes los 8€ en el saldo de la plataforma de forma automática y contablemente segura.

---

## 6. MÓDULO PASAPORTE DIGITAL (Toda la Trazabilidad)

El "Killer Feature" es una consecuencia de unir los datos de los 5 módulos anteriores.

### 6.1. Estructura de la Base de Datos Transaccional
Para componer un pasaporte rico, el modelo de datos final del pedido ([Order](file:///c:/Users/Apliquem/Desktop/py3/marketplace/models.py#57-87)) está ligado a:
*   `Material_Batch_Number` (Introducido por Laboratorio, crucial para MDR).
*   `Dentalink_Patient_ID` (La persona).
*   `S3_STL_URL` (El Escaneado original de "antes").
*   `Warranty_Expiry_Date` (Calculado dinámicamente según la familia de materiales).

### 6.2. Generación del Activo Público
1.  Cuando se cierra el pedido y la pieza llega, Django genera un Hash Seguro (`UUIDv4`).
2.  Crea un enrutador público (React o Django Views) tipo: `https://app.tuweb.com/passport/{uuid}`.
3.  Aquí se despliega el resumen higienizado del tratamiento: Fecha, Laboratorio creador, Material y Garantía. (Sin precios, para que el paciente pueda verlo).
4.  Django genera por código un QR de esa URL (librería `qrcode` en Python) que la Clínica puede vincular a la ficha o enviarlo por email al paciente.
