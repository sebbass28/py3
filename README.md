# 🦷 DentalLinkLab: Marketplace Odontológico con Visor 3D

DentalLinkLab es una plataforma B2B diseñada para conectar clínicas dentales y laboratorios de prótesis de forma digital, eficiente y segura.

---

## 🚀 Propuesta de Valor
- **Visualización 3D Avanzada:** Integración de archivos STL profesionales directamente en la Landing Page y el Dashboard.
- **Flujo de Trabajo Digital:** Eliminación de errores de comunicación mediante una interfaz especializada en odontología.
- **Fintech Integrada:** Sistema de comisiones automatizado y pagos aplazados (BNPL) para facilitar la compra de tratamientos costosos.

## 💻 Stack Tecnológico (MVT Desacoplado)

### **Frontend (Visualización & UI)**
- **React 19:** Lógica de interfaz moderna y escalable.
- **Three.js + @react-three/fiber:** Motor de rénder 3D reactivo para modelos STL.
- **Tailwind CSS:** Diseño responsivo y de alto rendimiento.

### **Backend (Lógica & API)**
- **Django + DRF:** API REST robusta y segura.
- **PostgreSQL:** Almacenamiento de datos relacionales de grado industrial.
- **WhiteNoise:** Servicio eficiente de modelos 3D y activos estáticos.

### **Infraestructura & DevOps**
- **Docker + Coolify:** Contenerización y despliegue automático.
- **Hybrid Build Strategy:** Compilación local de activos pesados para optimizar el rendimiento de servidores AWS de bajos recursos.

## 🛠️ Guía de Instalación y Despliegue

### Entorno de Desarrollo
```bash
# Backend
pip install -r requirements.txt
python manage.py runserver

# Frontend
cd frontend
npm install
npm start
```

### Proceso de Actualización (Hybrid Build)
Para actualizar la web en vivo sin colapsar el servidor:
1. `cd frontend && npm run build`
2. `git add . && git commit -m "update" && git push`
3. El servidor AWS servirá automáticamente los nuevos archivos estáticos.

## 🔮 Hoja de Ruta (Futuro e Innovación)
1. **Inteligencia Artificial:** Detección automática de errores en escaneos STL intraorales.
2. **Realidad Aumentada:** Prueba virtual de prótesis para pacientes directos.
3. **Traceabilidad IoT:** Seguimiento por código QR en cajas físicas de transporte.
4. **Almacenamiento Elástico:** Migración a AWS S3 para archivos STL masivos.

---
*Este proyecto ha sido desarrollado como una solución técnica real para la transformación digital del sector dental.*
