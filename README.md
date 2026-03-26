# 🦷 DentalLinkLab: Marketplace Odontológico con Visor 3D

DentalLinkLab es una plataforma B2B de vanguardia diseñada para digitalizar la comunicación y gestión de pedidos entre clínicas dentales y laboratorios de prótesis.

---

## 🚀 1. Propuesta de Valor y Objetivos
- **Reducción de Errores:** Validación visual en 3D antes de la fabricación física.
- **Plataforma Multipestaña:** Dashboard independiente para Clínicas y Laboratorios.
- **Eficiencia Logística:** Trazabilidad total del pedido mediante códigos QR.
- **Democratización Tecnológica:** Acceso a herramientas de visualización avanzada para pequeñas clínicas.

---

## 📚 2. Documentación Estratégica y Técnica
Para profundizar en la lógica del proyecto y su valor de mercado, consulta los siguientes documentos:
- 📊 **[Análisis del Sector y Soluciones](docs/analisis_problemas_sector.md):** Cómo resolvemos los problemas reales de los dentistas.
- 🔐 **[Arquitectura de Seguridad y Roles](docs/seguridad_jwt_roles.md):** Explicación técnica de JWT y la distinción Clínica/Lab.

---

## 🛠️ 3. El Enfoque DentalLinkLab: Solución a Problemas Reales

DentalLinkLab no es solo una web de ventas; es una herramienta de ingeniería diseñada para eliminar los 5 mayores "puntos de dolor" del sector:

- **🚫 Contra el "Teléfono Escacharrado":** Casi todos siguen usando WhatsApp o papel para las instrucciones. Centralizamos todo (3D, fotos, notas) en una **ficha única e inmutable** por pedido.
- **🚫 Contra la "Caja Perdida":** Eliminamos la incertidumbre de la clínica sobre el estado de sus trabajos con una **barra de progreso en tiempo real** (como Domino's Pizza, pero para prótesis).
- **🚫 Contra el "Error de Diseño":** El dentista **aprueba el diseño 3D** antes de que el laboratorio gaste material y tiempo de fresado, ahorrando miles de euros en repeticiones innecesarias.
- **🚫 Contra la "Piratería de Datos":** Olvida enviar archivos de 100MB por canales inseguros. Gestionamos la transferencia de archivos STL de forma **nativa, cifrada y segura**.
- **🚫 Contra la "Inseguridad de Cobro":** Eliminamos el miedo del laboratorio a no cobrar mediante un **sistema de retención (Escrow)** y financiación integrada (BNPL).

## 💰 3. Modelo de Negocio y Monetización
Para asegurar la rentabilidad y escalabilidad de la plataforma, se han diseñado tres vías de ingreso principales:

### **A. Comisiones por Transacción (Marketplace Fee)**
- La plataforma cobra una comisión de gestión (8-12%) por cada pedido completado con éxito, automatizado mediante **Stripe Connect**.

### **B. Pagos a Plazos (Buy Now Pay Later - BNPL)**
- Integración con servicios como **Klarna** o **Affirm** para permitir que las clínicas financien sus facturas, mientras el laboratorio cobra al instante. Se puede cobrar una tasa adicional por la gestión de la financiación.

### **C. Suscripciones para Laboratorios (SaaS)**
- Niveles de visibilidad en el marketplace para laboratorios, permitiéndoles destacar sus productos o aparecer en los primeros resultados.

### **D. Logística e Integración de Mensajería**
- **Sincronización con Transportistas:** Integración con agregadores como **Packlink PRO** o **Sendcloud**, que permiten comparar precios entre MRW, SEUR o Correos Express y generar las etiquetas de envío automáticamente desde el panel de control.
- **Trazabilidad en Tiempo Real:** Los Webhooks de la mensajería actualizan el estado del pedido en la web (ej: "En reparto", "Entregado"), liberando los fondos del laboratorio sin intervención manual.

---

## 💻 3. Stack Tecnológico (Industrial Grade)

### **Frontend (Visualización & UI)**
- **React 19:** Biblioteca principal para la construcción de interfaces reactivas.
- **Three.js + @react-three/fiber:** Motor de rénder 3D declarativo para modelos STL.
- **Tailwind CSS:** Framework de diseño basado en utilidades para una UI premium.
- **Axios:** Gestión de peticiones asíncronas seguras con el backend.

### **Backend (Lógica & Seguridad)**
- **Django 6.0 + DRF:** Framework robusto para el tratamiento de datos y seguridad.
- **SimpleJWT:** Autenticación basada en JSON Web Tokens para sesiones seguras.
- **PostgreSQL:** Base de datos relacional para la persistencia masiva de pedidos.
- **WhiteNoise:** Servicio de activos estáticos y modelos 3D con optimización de caché.

---

## 🏗️ 4. Arquitectura y Decisiones de Ingeniería

### **Modelo MVT Desacoplado (API-First)**
- El Backend expone datos puros en formato **JSON**.
- El Frontend (React) actúa como cliente inteligente, gestionando el estado y la renderización 3D por separado.

### **Estrategia de Despliegue Híbrido**
Debido a las limitaciones de RAM (1GB) en servidores AWS de bajos recursos, se implementó:
1. **Build Local:** Se compila el frontend en el entorno de desarrollo.
2. **Push de Build:** Se sube la carpeta `/build` al repositorio.
3. **Serving:** El servidor Django sirve los activos terminados, garantizando 0 errores de memoria en el despliegue.

---

## 🔮 5. Hoja de Ruta de Innovación (Roadmap)

### **Fase 1: Inteligencia Artificial (IA Dental)**
- Implementación de algoritmos de visión artificial para validar la calidad de la malla STL subida y detectar inconsistencias automáticamente.

### **Fase 2: Realidad Aumentada (AR)**
- Uso de **WebXR** para permitir al dentista superponer el diseño 3D de la prótesis sobre la boca del paciente en una tablet comercial.

### **Fase 3: Trazabilidad IoT e Infraestructura**
- Generación automática de etiquetas QR para logística física.
- Migración del almacenamiento de archivos STL masivos a **AWS S3** usando `django-storages`.
- Notificaciones en tiempo real mediante **WebSockets** con `Django Channels`.

### **Fase 4: Tecnologías Disruptivas de Excelencia**
- **Blockchain de Trazabilidad:** Pasaporte de producto inmutable para certificar el origen y calidad de los materiales.
- **Mantenimiento Preventivo (IoT):** Alertas inteligentes para el cambio de fresas en maquinaria CNC basadas en el uso acumulado.
- **Revisiones en Realidad Virtual (VR):** Entorno inmersivo para la inspección de casos complejos de rehabilitación oral completa.
- **Inteligencia de Negocio (BI):** Dashboards de rentabilidad neta por clínica para laboratorios.

---

## 🛠️ 6. Guía de Instalación y Librerías

### Librerías Clave a Investigar:
- **Codificación QR:** `qrcode` (Python) / `react-qr-code` (React).
- **Generación PDF:** `WeasyPrint` (Transformación de HTML a etiquetas/facturas PDF).
- **Gráficos Dashboard:** `Recharts` para analíticas de ventas del laboratorio.

### Comandos de Desarrollo:
```bash
# 1. Preparar el Backend
pip install -r requirements.txt
python manage.py runserver

# 2. Preparar el Frontend
cd frontend
npm install
npm start
```

---
**Desarrollado como Proyecto de Fin de Grado (TFG) por [Tu Nombre].**
*Este documento constituye la base de la memoria técnica del proyecto.*
