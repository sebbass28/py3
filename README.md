# 🦷 DentalLinkLab: Marketplace Odontológico con Visor 3D

DentalLinkLab es una plataforma B2B de vanguardia diseñada para digitalizar la comunicación y gestión de pedidos entre clínicas dentales y laboratorios de prótesis.

---

## 🚀 1. Propuesta de Valor y Objetivos
- **Reducción de Errores:** Validación visual en 3D antes de la fabricación física.
- **Eficiencia Logística:** Trazabilidad total del pedido mediante códigos QR.
- **Democratización Tecnológica:** Acceso a herramientas de visualización avanzada para pequeñas clínicas.

## 💻 2. Stack Tecnológico (Industrial Grade)

### **Frontend (Visualización & UI)**
- **React 19:** Biblioteca principal para la construcción de interfaces reactivas.
- **Three.js + @react-three/fiber:** Motor de rénder 3D declarativo para modelos STL.
- **Tailwind CSS:** Framework de diseño basado en utilidades para una UI premium.
- **CRACO:** Optimización de la configuración de compilación de React.

### **Backend (Lógica & Seguridad)**
- **Django 6.0 + DRF:** Framework robusto para el tratamiento de datos y seguridad.
- **SimpleJWT:** Autenticación basada en tokens para sesiones seguras y sin estado.
- **PostgreSQL:** Base de datos relacional para la persistencia masiva de pedidos.
- **WhiteNoise:** Servicio de activos estáticos y modelos 3D con optimización de caché.

---

## 📂 3. Estructura del Proyecto

```text
py3/
├── talento360/          # Configuración core del proyecto Django
│   ├── settings.py      # Ajustes de DB, Static, Security y Apps
│   └── urls.py          # Enrutador principal (API + Frontend catch-all)
├── marketplace/         # App de lógica de negocio (Pedidos, Productos)
│   ├── models.py        # Definición de Order, Product, Lab, Clinic
│   └── serializers.py   # Traducción de Modelos a JSON (API)
├── users/               # Gestión de usuarios personalizados (Auth)
├── frontend/            # Código fuente de la interfaz React
│   ├── public/models/   # Modelos 3D de demostración (.stl)
│   ├── src/
│   │   ├── components/  # Componentes reutilizables (Viewer3D, Card)
│   │   ├── pages/       # Vistas principales (Landing, Dashboard)
│   │   └── api.js       # Cliente Axios centralizado
│   └── build/           # Activos compilados listos para producción
├── Dockerfile           # Configuración de contenedorización AWS
└── README.md            # Esta documentación
```

---

## 🏗️ 4. Arquitectura y Decisiones de Ingeniería

### **Modelo MVT Desacoplado**
A diferencia del Django tradicional, este proyecto utiliza un patrón **API-First**:
- El Backend expone datos puros en formato **JSON**.
- El Frontend (React) actúa como cliente inteligente, gestionando el estado y la renderización 3D.

### **Estrategia de Despliegue Híbrido**
Para superar las limitaciones de 1GB de RAM en servidores micro de AWS:
1. **Build Local:** Se compila el frontend en el entorno de desarrollo.
2. **Push de Build:** Se sube la carpeta `/build` al repositorio.
3. **Serving:** El servidor Django sirve los archivos terminados, evitando el colapso del servidor durante el despliegue.

---

## 🔒 5. Seguridad y API

### **Autenticación JWT**
- Cada usuario recibe un **Access Token** corto y un **Refresh Token** largo.
- Esto protege las rutas de la API de accesos no autorizados.

### **CORS & Headers**
- Configuración estricta de `django-cors-headers` para permitir solo comunicaciones desde dominios autorizados.
- Cabeceras de seguridad activas para prevenir ataques XSS e Inyección.

---

## 🛠️ 6. Guía de Instalación

### Entorno de Desarrollo
```bash
# 1. Preparar el Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 2. Preparar el Frontend
cd frontend
npm install
npm start
```

### Protocolo de Despliegue
Para actualizar la web en vivo:
1. Actualizar el código y archivos STL.
2. Ejecutar `npm run build` en la carpeta `frontend`.
3. Sincronizar con GitHub: `git push`.
4. Coolify realizará el despliegue automático en segundos.

---

## 🔮 7. Hoja de Ruta (Innovación TFG)
- **IA de Diagnóstico:** Validación automática de mallas STL.
- **Realidad Aumentada:** Superposición del diseño 3D en la boca del paciente mediante WebXR.
- **Pasarela Fintech:** Implementación de Stripe Connect para cobro de comisiones y pagos a plazos (Buy Now Pay Later).

---
**Desarrollado como Proyecto de Fin de Grado (TFG).**
*Este documento constituye la base de la memoria técnica del proyecto.*
