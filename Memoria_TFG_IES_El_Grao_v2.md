# DentaLinkLab - Memoria del Modulo de Proyecto (Version Ampliada)

Autor: Juan Sebastian Agudelo Castrillon  
Ciclo Formativo: Desarrollo de Aplicaciones Web (DAW)  
Centro: IES El Grao  
Curso: 2024-2025  
Tutor/a: Paula Carolina Martinez Perea

---

## Indice paginado

1. Resumen (castellano e ingles)  
2. Justificacion del proyecto  
3. Objetivos  
4. Planificacion  
5. Desarrollo  
   5.1 Revision bibliografica y fundamentacion teorica  
   5.2 Materiales y metodos  
   5.3 Resultados y analisis  
6. Conclusiones  
7. Lineas de investigacion futuras  
8. Bibliografia  
   8.1 Referencias citadas  
   8.2 Bibliografia complementaria

---

## 1. Resumen (castellano e ingles)

### 1.1 Resumen (castellano)

DentaLinkLab es una aplicacion web desarrollada para mejorar la coordinacion entre clinicas dentales y laboratorios de protesis en un entorno digital. El problema de partida detectado fue la fragmentacion del flujo de trabajo: la informacion de un mismo caso se distribuia en canales no estructurados (llamadas, mensajes, correo), dificultando la trazabilidad de decisiones, la gestion de estados y el control de tiempos de produccion.

La solucion propuesta centraliza los procesos principales en una unica plataforma: gestion de pacientes, creacion y seguimiento de pedidos, comunicacion operativa con adjuntos, timeline de eventos, notificaciones y paneles de gestion por rol. El sistema se implementa con una arquitectura desacoplada basada en React para frontend y Django REST Framework para backend, con autenticacion JWT y despliegue en contenedores Docker sobre infraestructura cloud.

Durante el proyecto se incorporaron mejoras iterativas sobre funcionalidades nucleares y experiencia de usuario. Se implementaron modulos de cola de laboratorio, exportacion de datos en CSV, gestion de integraciones externas MVP, finder publico de clinicas y recuperacion de contrasena funcional. Tambien se reforzo la seguridad en puntos sensibles de la API con validaciones de pertenencia y control de acceso por contexto.

Como resultado, se obtuvo una plataforma operativa y demostrable, con despliegue real, flujo de trabajo trazable y base tecnica para evolucion futura. El proyecto cumple los objetivos academicos del ciclo DAW al integrar analisis, diseno, implementacion full-stack, pruebas, despliegue y documentacion.

### 1.2 Abstract (english)

DentaLinkLab is a web application developed to improve collaboration between dental clinics and prosthetic laboratories in a digital environment. The initial problem identified was workflow fragmentation: data from the same case was spread across unstructured communication channels, making traceability, state management, and production timing difficult.

The proposed solution centralizes key processes in a single platform: patient management, order lifecycle tracking, operational chat with attachments, event timeline, notifications, and role-based dashboards. The system uses a decoupled architecture with React on the frontend and Django REST Framework on the backend, secured with JWT authentication and deployed through Docker containers in cloud infrastructure.

During development, iterative improvements were applied to both core functionality and user experience. Advanced modules were added, including laboratory queue management, CSV export, MVP external integrations, a public clinic finder, and a fully functional password recovery flow. Security was also reinforced in sensitive API areas through tenant-aware validations and contextual access control.

The final outcome is an operational and deployable platform with real traceability and a strong technical foundation for future growth. The project meets DAW learning objectives by combining analysis, design, full-stack implementation, testing, deployment, and technical documentation.

---

## 2. Justificacion del proyecto

La motivacion principal de DentaLinkLab nace de una observacion practica: en gran parte de pequenas y medianas clinicas y laboratorios, la colaboracion diaria no esta soportada por herramientas especificamente disenadas para el dominio dental. Aunque existen soluciones parciales para gestion interna o facturacion, es frecuente que la comunicacion del caso (indicaciones, cambios, urgencias, confirmaciones) ocurra fuera del sistema principal.

Este escenario provoca cuatro efectos directos:

- **Perdida de contexto:** mensajes y archivos quedan fuera del pedido, dificultando revisar el historial completo.
- **Ambiguedad operativa:** no siempre queda claro quien debe actuar y en que estado se encuentra el caso.
- **Dependencia de personas concretas:** la informacion reside en conversaciones individuales y no en el sistema.
- **Escasa capacidad de analisis:** sin datos estructurados, resulta complejo medir carga de trabajo, tiempos y cuellos de botella.

El proyecto se justifica, por tanto, como una propuesta de digitalizacion integral orientada a proceso real, no solo a presentacion visual. La idea central fue construir una plataforma donde cada pedido tuviera:

1. datos clinicos estructurados,
2. comunicacion asociada al contexto,
3. estados de ciclo de vida claros,
4. evidencia de cambios y decisiones.

Desde el punto de vista formativo, la propuesta tiene alto valor para DAW porque obliga a resolver un caso completo de software:

- modelado de dominio,
- diseno API,
- frontend por componentes,
- autenticacion y permisos,
- despliegue cloud con Docker,
- mantenimiento y evolucion incremental.

La eleccion del proyecto tambien responde a su viabilidad de continuidad. No se trata de un ejercicio cerrado, sino de una base que puede crecer en areas con demanda real (integraciones, pagos, realtime, observabilidad, BI).

---

## 3. Objetivos

### 3.1 Objetivo general

Desarrollar una aplicacion web full-stack, segura y escalable, que centralice la colaboracion entre clinicas dentales y laboratorios de protesis, mejorando la trazabilidad, la comunicacion operativa y el control del ciclo de vida del pedido.

### 3.2 Objetivos especificos

1. Diseñar un modelo de datos capaz de representar pacientes, pedidos, mensajes, eventos y notificaciones.
2. Implementar autenticacion JWT y control de acceso por rol para separar zonas funcionales.
3. Crear endpoints REST para operaciones clinicas y de laboratorio con validaciones de negocio.
4. Incorporar un sistema de chat asociado a pedidos con soporte de adjuntos.
5. Implementar timeline de eventos para trazabilidad del caso.
6. Construir panel de produccion para laboratorio con filtros por estado, tecnico y vencimiento.
7. Añadir metricas operativas y exportacion CSV de pedidos.
8. Implementar buscador publico de clinicas con filtros y ordenacion.
9. Desarrollar recuperacion de contrasena funcional de extremo a extremo.
10. Desplegar en cloud con Docker y pipeline de actualizacion continua.
11. Documentar el proceso Scrum en GitHub mediante ramas, PR y evidencias de sprint.

### 3.3 Criterios de cumplimiento

Para considerar cumplidos los objetivos se definieron criterios observables:

- funcionalidad disponible en entorno local y cloud,
- flujo de login y permisos operativos sin accesos cruzados,
- operaciones de negocio ejecutables desde interfaz,
- ausencia de errores bloqueantes en check/build,
- evidencia de despliegue y merge en rama principal.

---

## 4. Planificacion

La planificacion se organizo en iteraciones, con una estrategia incremental: primero consolidar base tecnica y despues ampliar funcionalidades y UX.

### 4.1 Estrategia de fases

**Fase 1 - Analisis inicial y alcance**  
Se delimito el problema, los actores (clinica/laboratorio), el alcance MVP y las entidades base del dominio.

**Fase 2 - Arquitectura y backend inicial**  
Se construyo la estructura principal de API, autenticacion y operaciones CRUD nucleares.

**Fase 3 - Frontend base y rutas protegidas**  
Se implemento la estructura de navegacion, paneles por rol y consumo inicial de endpoints.

**Fase 4 - Funcionalidad operativa avanzada**  
Se añadieron chat, eventos, notificaciones, gestion de pacientes y tablero de laboratorio.

**Fase 5 - Finder publico e integraciones MVP**  
Se amplió el alcance con buscador de clinicas e interoperabilidad inicial.

**Fase 6 - Hardening, UX y cierre**  
Mejoras de usabilidad, flujo de recuperacion de contrasena, ajustes de despliegue y documentacion final.

### 4.2 Metodologia de trabajo (Scrum)

Se aplico una adaptacion de Scrum para el contexto academico:

- backlog en GitHub Issues,
- descomposicion en tareas tecnicas,
- desarrollo por ramas,
- pull requests para integracion,
- cierre por sprint con evidencia.

#### 4.2.1 Artefactos usados

- historias de usuario y tareas,
- etiquetas por estado (`backlog`, `in-progress`, `review`, `done`),
- convencion de ramas por funcionalidad,
- PR con resumen y plan de pruebas.

#### 4.2.2 Ejemplo de sprint

En `Sprint-3-ChatUX` se concentraron mejoras en:

- rediseño de chat,
- conversacion conjunta clinica-laboratorio,
- recordarme funcional,
- recuperacion de contrasena completa,
- mejoras visuales de formularios de acceso.

### 4.3 Riesgos identificados y mitigacion

| Riesgo | Impacto | Mitigacion aplicada |
| --- | --- | --- |
| Divergencia entre entorno local y cloud | Alto | Docker + comandos de smoke |
| Configuracion incompleta de correo | Medio | Variables de entorno y pruebas en MailHog/SMTP real |
| Crecimiento de complejidad frontend | Medio | Modularizacion por paginas/contextos |
| Errores por permisos cruzados | Alto | Validaciones backend por rol y pertenencia |
| Cambios sin trazabilidad | Medio | Uso de ramas y PR por bloque |

### 4.4 Cronograma resumido

El proyecto se distribuyo en bloques de trabajo con entregables parciales:

- semanas iniciales: base de autenticacion y dominio,
- bloque medio: operaciones de pedido, chat y pacientes,
- bloque final: finder publico, integraciones, UX y cierre.

---

## 5. Desarrollo

### 5.1 Revision bibliografica, fundamentacion teorica

#### 5.1.1 Arquitectura web desacoplada

La literatura tecnica actual recomienda desacoplar frontend y backend en aplicaciones con evolucion funcional continua. Este enfoque permite:

- escalar interfaz y API de forma independiente,
- reducir acoplamiento entre presentacion y negocio,
- mejorar mantenibilidad y capacidad de test.

En DentaLinkLab, esta decision fue especialmente util porque el frontend requirio varias iteraciones de UX sin necesidad de reescribir reglas de dominio en backend.

#### 5.1.2 API-first y consistencia de dominio

Trabajar API-first obliga a formalizar contratos de datos (serializacion, validaciones, errores).  
Para un dominio como este, con multiples acciones sobre pedido, este enfoque reduce ambiguedad y facilita integracion futura.

#### 5.1.3 Seguridad en aplicaciones web

A nivel teorico-practico, la seguridad relevante en este proyecto se centra en:

- autenticacion fiable,
- autorizacion contextual,
- minimizacion de exposicion de datos,
- control de abuso en endpoints.

No basta con ocultar botones en frontend: las validaciones definitivas deben estar en servidor.  
Esta premisa se aplico de forma sistematica en acciones de pedido, chat, pacientes e integraciones.

#### 5.1.4 Fundamento de trazabilidad operativa

En sistemas colaborativos, el registro de eventos y cambios no es accesorio; es parte del valor del producto.  
Por ello se incluyo una capa de `OrderEvent` para documentar hitos del caso y mejorar auditabilidad.

#### 5.1.5 Integracion en el sector dental

Aunque el proyecto no implementa un ecosistema de interoperabilidad total, se construyo un MVP realista:

- API keys por conexion,
- endpoint de importacion de pedidos,
- endpoint de sincronizacion de estado,
- logs de sincronizacion.

Esto se alinea con una evolucion pragmatica: primero estabilizar dominio interno, despues expandir integraciones.

---

### 5.2 Materiales y metodos

#### 5.2.1 Materiales de software

**Backend**
- Python
- Django
- Django REST Framework
- SimpleJWT
- django-storages y boto3 (soporte media remoto)

**Frontend**
- React
- React Router
- Tailwind CSS
- Axios

**Infraestructura**
- Docker
- Coolify
- AWS

**Utilidades**
- Scripts de smoke local
- MailHog/SMTP para pruebas de correo

#### 5.2.2 Metodologia de implementacion tecnica

Se aplico una metodologia incremental orientada a entregables funcionales:

1. construir minima vertical funcional (auth + pedidos basicos),
2. validar flujo extremo a extremo,
3. ampliar con modulos de valor (chat, eventos, notificaciones),
4. reforzar seguridad y despliegue,
5. mejorar UX sin romper dominio.

Cada bloque se cerraba tras:

- comprobacion de endpoints,
- test/buildup basico,
- verificacion manual del flujo.

#### 5.2.3 Estructura de backend

El backend se organizo por apps con separacion de responsabilidades:

- `users`: autenticacion, perfil y directorio clinico.
- `marketplace`: pedidos, mensajes, eventos, notificaciones, integraciones.

Se usaron viewsets y acciones custom para operaciones de negocio que van mas alla de CRUD.

#### 5.2.4 Estructura de frontend

Frontend organizado por:

- contextos globales (`AuthContext`, `ToastContext`),
- paginas por modulo (`Dashboard`, `Patients`, `ClinicFinder`, etc.),
- componentes reutilizables.

Este enfoque permitio iterar estilos y comportamientos sin rehacer logica de datos.

#### 5.2.5 Metodo de validacion

Se combinaron tres niveles:

- **tecnico basico:** `manage.py check` + build frontend.
- **funcional dirigido:** pruebas de flujos criticos (auth, pedidos, chat, finder).
- **operacional cloud:** revision de logs de deploy y comandos en entorno remoto.

#### 5.2.6 Metodo de despliegue

Pipeline de despliegue orientado a estabilidad:

- build de imagen docker,
- migraciones,
- arranque del contenedor nuevo,
- retirada del contenedor anterior (rolling update).

Esta estrategia redujo riesgo de parada y facilito iteraciones de mejora.

---

### 5.3 Resultados y analisis

#### 5.3.1 Resultados funcionales por modulo

**Autenticacion y acceso**
- login por JWT,
- zonas protegidas,
- comportamiento recordarme/no recordarme,
- flujo de recuperacion de contrasena operativo.

**Gestion de pacientes**
- alta y edicion de ficha,
- consulta de pedidos asociados,
- anonimizado con controles de seguridad.

**Gestion de pedidos**
- creacion de casos,
- actualizacion de estados,
- acciones de laboratorio para planificacion.

**Comunicacion operativa**
- chat por pedido con adjuntos,
- lectura y estado de mensajes,
- modo conversacion clinica-laboratorio agrupada.

**Trazabilidad**
- timeline de eventos de pedido,
- notificaciones in-app para cambios relevantes.

**Analitica operativa**
- metricas de pedidos,
- exportacion CSV para analisis externo.

**Finder publico**
- busqueda por texto,
- filtros por precio/rating,
- ordenacion y representacion combinada de fuentes.

**Integraciones MVP**
- conexiones con API key,
- importacion de pedidos externos,
- sincronizacion de estados y logs.

#### 5.3.2 Resultados tecnicos

Se logro un sistema con:

- arquitectura coherente y extensible,
- validaciones de seguridad en servidor,
- despliegue cloud funcional,
- base documental para iteraciones futuras.

El codigo evoluciono de una version inicial mas basica a una capa de dominio mas rica, especialmente en:

- eventos,
- notificaciones,
- integraciones,
- privacidad de pacientes.

#### 5.3.3 Analisis de calidad del producto

Puntos fuertes:

- trazabilidad clara de pedido y comunicacion;
- mejora de visibilidad operativa para laboratorio;
- separacion de responsabilidades en arquitectura.

Puntos mejorables:

- realtime nativo (websocket);
- mayor cobertura E2E automatizada;
- estandarizacion adicional de mensajes de error.

#### 5.3.4 Analisis del proceso de proyecto

El uso de flujo Scrum/GitHub permitio:

- mejor control del alcance por sprint,
- trazabilidad de cambios,
- revision incremental con PR.

La integracion con despliegue cloud anadio una capa de realismo y obligo a resolver configuraciones de entorno, lo cual incrementa valor academico del trabajo.

#### 5.3.5 Evidencias de despliegue y operacion

Durante los despliegues se verificaron:

- build de imagen correcto,
- migraciones aplicadas,
- actualizacion de contenedores sin interrupcion critica,
- validacion de comandos post-deploy.

Se detectaron advertencias no bloqueantes (por ejemplo, configuracion de staticfiles) y se documentaron para ajuste de hardening.

#### 5.3.6 Valor obtenido respecto al problema inicial

Comparando con el escenario de partida:

- antes: informacion dispersa y baja trazabilidad;
- despues: flujo centralizado y contexto por pedido.

La mejora principal es la capacidad de entender y justificar cada caso con evidencia estructurada.

---

## 6. Conclusiones

La realizacion de DentaLinkLab confirma que una plataforma web bien estructurada puede transformar de manera significativa la colaboracion entre clinicas y laboratorios.  

El proyecto cumple con los objetivos definidos:

- implementa flujo de trabajo completo por roles,
- ofrece trazabilidad mediante eventos y chat contextual,
- incorpora capacidades de analisis basico,
- y esta desplegado en un entorno cloud real.

Desde la perspectiva academica del modulo de proyecto, se han trabajado de forma integrada las capacidades clave:

- analisis y diseno de solucion,
- organizacion y ejecucion de desarrollo,
- iniciativa para resolver incidencias de integracion/despliegue,
- autonomia en iteracion y mejora continua.

La conclusion principal es que el sistema no se queda en demostracion visual, sino que establece una base funcional, mantenible y evolutiva para uso real.

---

## 7. Lineas de investigacion futuras

1. **Realtime con WebSockets:** sustituir polling en chat/notificaciones por canales en tiempo real.
2. **Pasarela de pagos:** integrar Stripe para cerrar flujo economico de pedidos.
3. **Analitica avanzada:** paneles KPI por periodo, carga y rendimiento por laboratorio.
4. **Automatizacion E2E:** aumentar cobertura con pruebas de interfaz multi-rol.
5. **Interoperabilidad ampliada:** conectores estandarizados con software dental externo.
6. **Gobierno del dato:** politicas de retencion y auditoria mas avanzadas en produccion.
7. **Observabilidad:** logs estructurados y alertas operativas para incidencias criticas.

---

## 8. Bibliografia

### 8.1 Referencias citadas

- Django Software Foundation. (2026). *Django documentation*. https://docs.djangoproject.com/
- Encode OSS. (2026). *Django REST framework documentation*. https://www.django-rest-framework.org/
- React Team. (2026). *React documentation*. https://react.dev/
- Three.js Authors. (2026). *Three.js documentation*. https://threejs.org/docs/
- OWASP Foundation. (2026). *OWASP Top 10*. https://owasp.org/www-project-top-ten/
- Docker Inc. (2026). *Docker documentation*. https://docs.docker.com/
- PostgreSQL Global Development Group. (2026). *PostgreSQL documentation*. https://www.postgresql.org/docs/

### 8.2 Bibliografia complementaria

- Fowler, M. (2018). *Refactoring: Improving the Design of Existing Code*. Addison-Wesley.
- Newman, S. (2021). *Building Microservices* (2nd ed.). O'Reilly.
- Richardson, L., Amundsen, M., & Ruby, S. (2013). *RESTful Web APIs*. O'Reilly.
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns*. Addison-Wesley.
- Norman, D. (2013). *The Design of Everyday Things* (Revised and expanded). Basic Books.

