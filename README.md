# 🦷 DentalLinkLab: Marketplace Odontológico con Visor 3D

DentalLinkLab es una plataforma B2B de vanguardia diseñada para digitalizar la comunicación y gestión de pedidos entre clínicas dentales y laboratorios de prótesis.

---

## 🚀 1. Propuesta de Valor y Objetivos
- **Reducción de Errores:** Validación visual en 3D antes de la fabricación física.
- **Eficiencia Logística:** Trazabilidad total del pedido mediante códigos QR.
- **Democratización Tecnológica:** Acceso a herramientas de visualización avanzada para pequeñas clínicas.

## 💰 2. Modelo de Negocio y Monetización
Para asegurar la rentabilidad y escalabilidad de la plataforma, se han diseñado tres vías de ingreso principales:

### **A. Comisiones por Transacción (Marketplace Fee)**
- La plataforma cobra una comisión de gestión (8-12%) por cada pedido completado con éxito, automatizado mediante **Stripe Connect**.

### **B. Pagos a Plazos (Buy Now Pay Later - BNPL)**
- Integración con servicios como **Klarna** o **Affirm** para permitir que las clínicas financien sus facturas, mientras el laboratorio cobra al instante. Se puede cobrar una tasa adicional por la gestión de la financiación.

### **C. Suscripciones para Laboratorios (SaaS)**
- Niveles de visibilidad en el marketplace para laboratorios, permitiéndoles destacar sus productos o aparecer en los primeros resultados.

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
