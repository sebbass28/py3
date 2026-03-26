# Arquitectura de Seguridad: JWT y Gestión de Roles

## 1. Tecnología JWT (JSON Web Token)
Usamos el estándar de la industria para autenticación desacoplada entre React y Django.
- **Firma:** Los tokens están firmados con una clave secreta para evitar manipulaciones.
- **Stateless:** El servidor no guarda sesiones, lo que permite escalabilidad total.

## 2. Gestión de Roles (Clínica vs Laboratorio)
- **Custom Claims:** Inyectamos el rol directamente en el token JWT.
- **AuthContext:** El frontend gestiona el estado global del usuario según su identidad.
- **Seguridad en API:** Los endpoints de Django verifican el rol antes de permitir acciones (ej: solo clínicas pueden crear pedidos).

## 3. Flujo de Autenticación
1. Usuario envía credenciales.
2. Backend genera `access` y `refresh` token con rol incluido.
3. Frontend almacena `access_token` en `localStorage` y configura Axios.
4. Las peticiones subsiguientes envían el token en el header `Authorization: Bearer <token>`.
