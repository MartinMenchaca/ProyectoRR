# Resumen de Entrega — Movilidad Inteligente POC

## Resumen ejecutivo

**Movilidad Inteligente POC** es un sistema de monitoreo de transporte urbano en tiempo real construido como prueba de concepto académica. Demuestra la integración de tres protocolos de comunicación distribuida (MQTT, REST HTTP y WebSocket/Socket.IO) en una arquitectura de cuatro servicios independientes: broker de mensajería, backend con persistencia, simulador IoT y frontend interactivo.

El sistema permite visualizar en un mapa urbano animado el recorrido en tiempo real de tres vehículos (autobús, taxi eléctrico y scooter), consultar el estado de cada unidad, simular pagos de pasajeros y generar reportes de mantenimiento, todo integrado a una base de datos SQLite y actualizado sin recarga de página mediante Socket.IO.

---

## Funcionalidades implementadas

### Comunicación y protocolos

- [x] Broker MQTT embebido con Aedes (sin dependencias externas).
- [x] Publicación de telemetría MQTT cada 1800 ms por tres vehículos simulados.
- [x] Publicación automática de reportes de mantenimiento MQTT por umbral de ticks.
- [x] Suscripción del backend a topics MQTT con wildcard (`+`).
- [x] Servidor Socket.IO integrado en el mismo proceso HTTP del backend.
- [x] Cliente Socket.IO en el frontend con reconexión automática.
- [x] API REST completa con Express (6 endpoints funcionales).
- [x] Polling REST periódico (2s) como canal de respaldo al WebSocket.

### Persistencia

- [x] Base de datos SQLite con 5 tablas: `vehicles`, `telemetry`, `payments`, `maintenance_reports`, `events`.
- [x] Registro automático de vehículos al recibir primera telemetría (upsert).
- [x] Historial de posiciones GPS en tabla `telemetry`.
- [x] Registro unificado de eventos MQTT y REST en tabla `events`.

### Simulación IoT

- [x] Tres vehículos con rutas GPS circulares (7 waypoints cada uno).
- [x] Velocidad variable con onda sinusoidal + jitter aleatorio.
- [x] Batería con drenaje diferenciado por tipo de vehículo.
- [x] Alertas automáticas: `battery_low` (batería ≤ 35%) y `preventive_check`.

### Frontend / Interfaz

- [x] Mapa SVG urbano completamente responsive sin librería de mapas externa.
- [x] Animación de marcadores de vehículos a 60 fps con `requestAnimationFrame`.
- [x] Calles (primarias/secundarias), intersecciones, semáforos, puntos de interés y rosa de los vientos.
- [x] Panel de estado de comunicaciones con indicadores en tiempo real.
- [x] Tarjeta de detalle por vehículo (velocidad, batería, estado, última actualización).
- [x] Selector de vehículo con orden preferido (BUS-001 → TAXI-001 → SCOOTER-001).
- [x] Panel de operador con vista tabular de toda la flota.
- [x] Panel de pagos simulados con historial.
- [x] Panel de reportes de mantenimiento.
- [x] Línea de tiempo de eventos ordenados cronológicamente.
- [x] Diagrama explicativo del flujo de comunicación (componente `CommunicationFlow`).
- [x] Bottom sheet desplegable en el mapa con acciones del vehículo seleccionado.
- [x] Alertas en tiempo real para pagos y mantenimiento (4.2 segundos visibles).
- [x] Manejo de errores de carga con mensajes descriptivos y reintentos automáticos.

---

## Evidencia de módulos principales

| Módulo | Archivo principal | Estado |
|--------|------------------|--------|
| Broker MQTT | `apps/broker/src/index.js` | Funcional |
| Backend Express | `apps/backend/src/index.js` | Funcional |
| Cliente MQTT backend | `apps/backend/src/mqtt/mqttClient.js` | Funcional |
| Procesador de mensajes | `apps/backend/src/mqtt/messageProcessor.js` | Funcional |
| Servidor Socket.IO | `apps/backend/src/sockets/socketServer.js` | Funcional |
| Schema base de datos | `apps/backend/src/db/schema.sql` | Completo |
| API vehicles | `apps/backend/src/routes/vehicles.routes.js` | Funcional |
| API payments | `apps/backend/src/routes/payments.routes.js` | Funcional |
| API maintenance | `apps/backend/src/routes/maintenance.routes.js` | Funcional |
| API health | `apps/backend/src/routes/health.routes.js` | Funcional |
| Simulador IoT | `apps/simulator/src/index.js` | Funcional |
| Definición de vehículos | `apps/simulator/src/routes/vehicles.js` | Completo |
| Frontend App | `apps/frontend/src/App.jsx` | Funcional |
| Mapa urbano | `apps/frontend/src/components/SimulatedMap.jsx` | Funcional |
| Config mapa | `apps/frontend/src/components/map/cityMapConfig.js` | Completo |
| Config rutas | `apps/frontend/src/components/map/routesConfig.js` | Completo |

---

## Fases del proyecto

### Fase 1 — Estructura base
Configuración del monorepo npm workspaces con cuatro aplicaciones. Definición de la estructura de carpetas y archivos de configuración base.

### Fase 2 — Broker MQTT
Implementación del broker Aedes con servidor TCP. Conexión y prueba básica de publicación/suscripción.

### Fase 3 — Backend y base de datos
API REST con Express, inicialización de SQLite con schema completo, cliente MQTT suscriptor, procesador de mensajes con persistencia.

### Fase 4 — Simulador IoT
Definición de tres vehículos con rutas GPS reales. Loop de publicación de telemetría con velocidad y batería simuladas. Publicación automática de mantenimiento.

### Fase 5 — Frontend base
Estructura React con Vite, integración de API REST, primer renderizado del mapa SVG, componentes de estado del sistema.

### Fase 6 — Tiempo real, pagos y mantenimiento
Integración de Socket.IO en frontend y backend. Simulación de pagos y mantenimiento desde la interfaz. Animación 60 fps del mapa. Refinamiento visual y de UX.

### Fase 7 — Documentación y UML
Documentación técnica completa en `docs/`. Diagramas UML en Mermaid.

---

## Trabajo futuro

- Autenticación con JWT en la API REST.
- Historial de trayectoria visible en el mapa por vehículo.
- Estado de semáforos sincronizado con el backend.
- Soporte para registro dinámico de vehículos (no hardcodeados).
- Gráficas de telemetría histórica (velocidad y batería en el tiempo).
- Despliegue con Docker Compose.
- Migración a PostgreSQL para mayor capacidad.
- Pruebas unitarias e integración.

---

## Conclusión técnica

El proyecto demuestra de forma funcional que MQTT, REST y WebSocket pueden coexistir en una arquitectura Node.js para cubrir los tres patrones de comunicación más relevantes en sistemas IoT:

- **MQTT**: comunicación ligera, orientada a eventos, muchos-a-muchos (publish/subscribe). Ideal para telemetría de dispositivos con recursos limitados.
- **REST HTTP**: comunicación síncrona petición-respuesta para consulta y acciones. Ideal para operaciones de negocio y carga inicial de datos.
- **WebSocket / Socket.IO**: notificaciones push desde servidor a cliente sin polling. Ideal para actualización de UI en tiempo real.

La separación en cuatro servicios independientes (broker, backend, simulador, frontend) modela fielmente la separación de responsabilidades que existe en sistemas de movilidad inteligente reales, aunque a escala reducida y sin necesidad de infraestructura externa.
