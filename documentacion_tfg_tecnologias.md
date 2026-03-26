# Memoria Técnica: Ecosistema DentalLink (Marketplace 3D)

Este documento resume el stack tecnológico y las decisiones de arquitectura tomadas para el desarrollo de la plataforma, ideal para incluir en la sección de "Tecnologías" e "Implementación" del TFG.

---

## 🏗️ 1. Arquitectura de Software
Se ha optado por una arquitectura **Desacoplada (Decoupled)**:
- **Backend:** Actúa como una API robusta y segura (Single Source of Truth).
- **Frontend:** Aplicación de una sola página (SPA) que consume los datos y renderiza gráficos pesados en el cliente.

## 💻 2. Stack Tecnológico (The Stack)

### Frontend (User Interface & 3D)
- **React.js:** Framework principal para la lógica de la interfaz.
- **Three.js + @react-three/fiber:** Motor de renderizado 3D para la visualización de archivos STL (coronas, puentes, escaneos).
- **Tailwind CSS:** Framework de utilidades para un diseño moderno, responsivo y de alto rendimiento.
- **Axios:** Gestión de peticiones asíncronas a la API con interceptores para seguridad (JWT).

### Backend (Business Logic & API)
- **Django (Python):** Framework "con baterías incluidas" para una gestión rápida y segura de la base de datos.
- **Django REST Framework (DRF):** Capa encargada de transformar los modelos de base de datos en JSON para el frontend.
- **SimpleJWT:** Implementación de autenticación basada en tokens (JSON Web Tokens) para sesiones seguras sin estado.
- **WhiteNoise:** Librería para servir archivos estáticos (CSS, JS, 3D Models) de forma eficiente desde el propio servidor Python.

### Base de Datos
- **PostgreSQL:** Base de datos relacional de nivel empresarial para producción (escalable y robusta).
- **SQLite:** Usada en el entorno de desarrollo por su ligereza.

## 🚀 3. Infraestructura y DevOps (La Clave del TFG)
Este es uno de los puntos con más "peso académico" del proyecto debido a la solución de problemas reales:

- **Docker:** Contenerización de toda la aplicación para asegurar que funcione igual en tu ordenador que en la nube de AWS.
- **Coolify:** PaaS (Platform as a Service) auto-alojado que gestiona el despliegue automático desde GitHub.
- **Estrategia de Despliegue Híbrido:** Debido a las limitaciones de memoria RAM de los micro-servidores de AWS, se implementó una estrategia donde la web se **compila localmente** (Build) y se sube el resultado final. Esto garantiza un tiempo de despliegue de segundos y una estabilidad del 100%.

## 🦷 4. Retos Técnicos Superados
1. **Gestión de Memoria 3D:** Optimización de la carga de archivos STL pesados mediante la asignación correcta de rutas estáticas y manejo de buffers en el navegador.
2. **Seguridad Cross-Origin:** Configuración de CORS y CSRF para permitir la comunicación segura entre el dominio de la API y el de la web.
3. **Escalabilidad de Almacenamiento:** Diseño preparado para conectar con AWS S3 para el almacenamiento masivo de diseños dentales de laboratorios.

---
*Este stack asegura que la plataforma no solo sea "una web", sino un sistema industrial capaz de manejar datos sensibles y archivos 3D de alta precisión.*
