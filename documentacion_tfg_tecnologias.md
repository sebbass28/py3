# Memoria Técnica TFG: Tecnologías e Implementación de DentaLinkLab

Este documento consolida la base técnica y narrativa para la memoria del TFG, alineando el contexto de `README.md` y `guia_maestra_tecnica.md` en un formato académico.

---

## 1. RESUMEN / ABSTRACT

### Resumen (Castellano)
DentaLinkLab es una plataforma de vanguardia diseñada para transformar la interacción profesional en el sector odontológico. Este proyecto de Desarrollo de Aplicaciones Web (DAW) presenta un ecosistema B2B donde las clínicas dentales pueden gestionar pedidos protésicos de forma 100% digital. La piedra angular técnica es la integración de un visor 3D nativo que permite la supervisión técnica de archivos STL antes de su fabricación física, reduciendo costes y errores. El sistema se apoya en una arquitectura desacoplada con un backend robusto en Django y un frontend reactivo en React, asegurando una experiencia de usuario fluida y segura.

### Abstract (English)
DentaLinkLab is a cutting-edge platform designed to transform professional interaction in the dental sector. This Web Application Development (DAW) project presents a B2B ecosystem where dental clinics can manage prosthetic orders 100% digitally. The technical cornerstone is the integration of a native 3D viewer that allows technical supervision of STL files before physical manufacturing, reducing costs and errors. The system relies on a decoupled architecture with a robust Django backend and a reactive React frontend, ensuring a smooth and secure user experience.

---

## 2. JUSTIFICACION DEL PROYECTO

La motivacion de DentaLinkLab nace de la ineficiencia logistica observada en laboratorios de protesis reales. Actualmente, muchas clinicas envian impresiones digitales por email o aplicaciones de mensajeria instantanea, lo que genera perdida de trazabilidad legal y tecnica. Como solucion, el proyecto propone una herramienta web que centraliza el flujo de trabajo, aporta seguridad juridica mediante facturacion estructurada y mejora la calidad clinica gracias a la visualizacion 3D previa.

---

## 3. OBJETIVOS Y ALCANCE

### 3.1 Objetivos tecnicos (especificos de DAW)
- **Modularidad:** Construir una arquitectura de componentes reutilizables en React.
- **Rendimiento:** Optimizar la carga de modelos 3D pesados mediante lazy-loading y tecnicas de compresion de mallas.
- **Seguridad:** Implementar autenticacion stateless con JWT para proteger datos sensibles.
- **Interoperabilidad:** Exponer una API REST consumible por sistemas externos de gestion clinica.

### 3.2 Alcance funcional
- Gestion completa de pedidos entre clinicas y laboratorios.
- Separacion de roles con paneles dedicados.
- Visualizacion de modelos STL en entorno web.
- Base para integracion futura con logistica, pagos y pasaporte digital del tratamiento.

---

## 4. STACK TECNOLOGICO

### 4.1 Frontend
- React (SPA orientada a componentes).
- Three.js + `@react-three/fiber` para visualizacion 3D.
- Tailwind CSS para diseno responsivo.
- Axios para comunicacion con API y manejo de tokens.

### 4.2 Backend
- Django como nucleo de negocio y seguridad.
- Django REST Framework para serializacion y exposicion API.
- SimpleJWT para autenticacion basada en tokens.
- WhiteNoise para servir activos estaticos.

### 4.3 Datos e infraestructura
- PostgreSQL en produccion.
- SQLite en desarrollo.
- Docker para contenerizacion.
- Despliegue compatible con estrategia de build frontend y servicio desde backend.

---

## 5. DISENO DE LA ARQUITECTURA DE SOFTWARE

### 5.1 Arquitectura desacoplada
La solucion adopta un modelo API-first:
- El backend actua como fuente unica de verdad de datos y reglas.
- El frontend consume JSON, gestiona estado y renderiza la experiencia de usuario y el visor 3D.

### 5.2 Documentacion del modelo entidad-relacion
Para garantizar la escalabilidad, se define un esquema relacional normalizado que separa identidades, pedidos, productos y ficheros tecnicos.

`[INSERTAR DIAGRAMA ER AQUI]`

---

## 6. IMPLEMENTACION DEL FRONTEND

### 6.1 Sistema de rutas y navegacion protegida
La proteccion en cliente se gestiona mediante un componente `PrivateRoute` que verifica sesion activa y rol de usuario.

```jsx
// frontend/src/App.js (extracto)
const PrivateRoute = ({ children, roleRequired }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};
```

Esta estrategia impide accesos cruzados entre vistas de clinica y laboratorio, reforzando privacidad y aislamiento de procesos.

### 6.2 Integracion del visor 3D
El uso de `react-three-fiber` permite definir la escena como componentes React declarativos, facilitando mantenimiento y evolucion.

```jsx
// frontend/src/components/ThreeModel.js
const DentalMaterial = ({ geometry }) => (
  <mesh geometry={geometry}>
    <meshStandardMaterial
      color="#fcfcfc"
      roughness={0.1}
      metalness={0.05}
      envMapIntensity={1}
    />
  </mesh>
);
```

Se incorporan luces de entorno para mejorar la lectura de superficie y detalle en piezas dentales digitalizadas.

---

## 7. IMPLEMENTACION DEL BACKEND

### 7.1 API REST y serializacion
El backend se comporta como servicio headless. Los serializadores de DRF transforman entidades complejas en estructuras JSON optimizadas.

```python
# marketplace/serializers.py (extracto)
class OrderSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.__str__', read_only=True)
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'patient_name', 'product_details', 'scan_url', 'created_at']
```

---

## 8. MANUAL DE USUARIO (RESUMIDO)

### 8.1 Flujo de pedido para clinica dental
`[INSERTAR CAPTURA DASHBOARD CLINICA]`

1. **Acceso:** Inicio de sesion con credenciales corporativas.
2. **Ficha de paciente:** Registro de datos basicos e identificador externo.
3. **Marketplace:** Seleccion de producto protetico segun precio y plazo.
4. **Carga STL:** Subida del escaneado 3D para revision y produccion.

---

## 9. DESPLIEGUE (DEVOPS)

### 9.1 Entorno de produccion con Docker
La contenerizacion garantiza paridad entre desarrollo y explotacion.

```yaml
# docker-compose.yml (extracto)
services:
  web:
    build: .
    volumes:
      - ./media:/app/media
    env_file: .env
    ports:
      - "8000:8000"
```

Este aislamiento reduce errores de entorno y facilita actualizaciones controladas.

---

## 10. ANEXOS

### Anexo A: Diccionario de datos (tabla maestra)
| Campo | Tipo | Nulable | Descripcion |
| :--- | :--- | :--- | :--- |
| `vat_id` | Char | No | CIF/NIF oficial para facturacion legal |
| `role` | Enum | No | `clinic` (cliente) o `lab` (proveedor) |
| `status` | Char | No | Estado del flujo de pedido |
| `design_url` | URL | Si | Enlace al prototipo 3D para validacion |

### Anexo B: Inventario de librerias
- Frontend: React, Three.js, React Router, Axios.
- Backend: Django, Django REST Framework, SimpleJWT.
- Utilidades: `xhtml2pdf`, `qrcode`.

---

`[FIN DEL DOCUMENTO INTEGRAL DAW]`
