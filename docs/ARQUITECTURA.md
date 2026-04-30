# Arquitectura del Sistema

## Visión general

El sistema está organizado como un monorepo de npm workspaces con cuatro aplicaciones independientes que se comunican por tres protocolos distintos: MQTT (telemetría IoT), REST HTTP (consulta y simulación) y WebSocket / Socket.IO (notificaciones en tiempo real al cliente).

```
┌─────────────┐   MQTT pub   ┌──────────────┐   MQTT sub   ┌──────────────┐
│  Simulador  │─────────────▶│  Broker MQTT │◀────────────▶│   Backend    │
│  (IoT fake) │              │   (Aedes)    │              │  (Express)   │
└─────────────┘              └──────────────┘              │              │
                                                           │  SQLite DB   │
                                                           │              │
┌─────────────┐   HTTP REST  │              │              │  Socket.IO   │
│  Frontend   │◀────────────▶│              │              │              │
│  (React)    │   WebSocket  └──────────────┘              └──────────────┘
└─────────────┘
```

---

## Módulo 1: Broker MQTT (`apps/broker`)

**Tecnología:** Node.js + Aedes (TCP nativo)

**Responsabilidad:** Punto central de mensajería. Recibe publicaciones del simulador y las reenvía a todos los suscriptores, incluyendo el backend.

**Puerto:** 1883 (TCP)

**Comportamiento:**
- Acepta conexiones de múltiples clientes MQTT.
- No filtra ni transforma mensajes; actúa como relay.
- Registra en consola cada conexión, desconexión y publicación.
- Soporta apagado graceful ante `SIGINT` / `SIGTERM`.

---

## Módulo 2: Backend (`apps/backend`)

**Tecnología:** Node.js + Express 4 + Socket.IO + mqtt client + sqlite/sqlite3

**Puerto:** 3001 (HTTP y WebSocket compartidos en el mismo servidor)

**Responsabilidades:**

### 2.1 API REST

Expone los siguientes endpoints bajo el prefijo `/api`:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado de todos los servicios (DB, MQTT, WebSocket) |
| GET | `/vehicles` | Lista de vehículos registrados |
| GET | `/events` | Historial de eventos MQTT y REST |
| GET | `/payments` | Últimos 50 pagos simulados |
| POST | `/payments/simulate` | Crear un pago simulado para un vehículo |
| GET | `/maintenance` | Últimos 50 reportes de mantenimiento |
| POST | `/maintenance/simulate` | Crear un reporte de mantenimiento simulado |

### 2.2 Cliente MQTT

Se suscribe a tres topics:
- `movilidad/vehicles/+/telemetry`
- `movilidad/vehicles/+/maintenance`
- `movilidad/alerts/operator`

Al recibir un mensaje:
1. Valida y parsea el JSON del payload.
2. Crea o actualiza el vehículo en la tabla `vehicles` (upsert con `INSERT OR IGNORE`).
3. Guarda un registro en la tabla `events`.
4. Si es telemetría: persiste en `telemetry`, actualiza posición/velocidad/batería en `vehicles` y emite `vehicle:locationUpdated` por Socket.IO.
5. Si es mantenimiento: persiste en `maintenance_reports` y emite `maintenance:reported` por Socket.IO.

### 2.3 Servidor Socket.IO

Corre sobre el mismo servidor HTTP que Express. Emite los siguientes eventos a todos los clientes conectados:

| Evento | Cuándo se emite |
|--------|----------------|
| `vehicle:locationUpdated` | Al procesar telemetría MQTT |
| `event:created` | Al guardar cualquier evento nuevo |
| `payment:created` | Al crear un pago simulado (REST o MQTT) |
| `maintenance:reported` | Al guardar un reporte de mantenimiento |

### 2.4 Base de datos SQLite

Archivo: `data/movilidad.sqlite`

Tablas:

| Tabla | Contenido |
|-------|-----------|
| `vehicles` | Registro maestro de vehículos con posición y estado actual |
| `telemetry` | Historial de posiciones (lat, lng, speed, battery, status) |
| `payments` | Pagos simulados por vehículo |
| `maintenance_reports` | Alertas de mantenimiento por vehículo |
| `events` | Registro de todos los mensajes recibidos (canal, topic, payload) |

---

## Módulo 3: Simulador IoT (`apps/simulator`)

**Tecnología:** Node.js + mqtt client

**Responsabilidad:** Imitar el comportamiento de dispositivos IoT embarcados en vehículos.

**Frecuencia de publicación:** 1800 ms (configurable con `SIMULATOR_INTERVAL_MS`)

**Vehículos simulados:**

| ID | Tipo | Velocidad base | Drenaje batería | Intervalo mantenimiento |
|----|------|---------------|----------------|------------------------|
| BUS-001 | bus | 38 km/h | 0.35%/tick | cada 12 ticks |
| TAXI-001 | electric_taxi | 46 km/h | 0.45%/tick | cada 15 ticks |
| SCOOTER-001 | scooter | 22 km/h | 0.55%/tick | cada 18 ticks |

**Lógica de simulación:**
- Cada tick avanza al siguiente punto GPS de la ruta circular (7 waypoints).
- La velocidad incorpora una onda sinusoidal y jitter aleatorio para simular variación real.
- La batería disminuye progresivamente hasta un mínimo de 15%.
- El simulador publica automáticamente un reporte de mantenimiento cuando se alcanza el intervalo configurado. El tipo es `battery_low` si batería ≤ 35%, o `preventive_check` en caso contrario.

**Topics publicados:**
- `movilidad/vehicles/{vehicleId}/telemetry`
- `movilidad/vehicles/{vehicleId}/maintenance`

---

## Módulo 4: Frontend (`apps/frontend`)

**Tecnología:** React 19 + Vite 6 + socket.io-client + lucide-react

**Puerto de desarrollo:** 5173

**Responsabilidad:** Interfaz de monitoreo urbano. Muestra el estado del sistema, el mapa animado con vehículos, estadísticas por vehículo, pagos, mantenimiento y la línea de tiempo de eventos.

### Componentes principales

| Componente | Responsabilidad |
|-----------|----------------|
| `App.jsx` | Estado global, polling REST, conexión Socket.IO, coordinación de componentes |
| `MobileShell.jsx` | Estructura de página (hero, layout, scroll, error global) |
| `SystemStatus.jsx` | Panel de estado de comunicaciones (API, DB, MQTT, WebSocket, topics) |
| `SimulatedMap.jsx` | Mapa SVG con calles, semáforos, rutas y marcadores de vehículos animados a 60 fps |
| `VehicleMarker.jsx` | Marcador individual de vehículo con ícono según tipo y selección |
| `VehicleStatusCard.jsx` | Tarjeta de detalle del vehículo seleccionado |
| `VehicleSelector.jsx` | Lista de vehículos disponibles para selección |
| `OperatorPanel.jsx` | Panel con vista tabular de todos los vehículos del sistema |
| `EventTimeline.jsx` | Línea de tiempo de eventos MQTT/REST ordenados cronológicamente |
| `CommunicationFlow.jsx` | Diagrama visual explicativo del flujo de comunicación |
| `PaymentsPanel.jsx` | Lista de pagos simulados con detalles |
| `MaintenancePanel.jsx` | Lista de reportes de mantenimiento activos |
| `StatusBadge.jsx` | Componente de indicador visual de estado |

### Módulos de mapa

| Archivo | Contenido |
|---------|-----------|
| `cityMapConfig.js` | Calles, intersecciones, semáforos, puntos de interés, manzanas urbanas |
| `routesConfig.js` | Rutas en coordenadas porcentuales SVG (x%, y%) con color y duración de ciclo |
| `mapUtils.js` | Interpolación de posición en ruta y construcción de path SVG |

### Estrategia de actualización de datos

El frontend usa dos canales en paralelo:

1. **Polling REST** cada 2 segundos: obtiene el estado completo de vehículos, eventos, pagos y mantenimiento.
2. **Socket.IO**: recibe actualizaciones incrementales en tiempo real (posiciones, nuevos eventos, pagos, mantenimiento).

El mapa anima los marcadores a 60 fps usando `requestAnimationFrame` con escritura directa al DOM (vía refs), sin pasar por el ciclo de renderizado de React.

---

## Flujo de comunicación

```
Simulador           Broker MQTT       Backend            Frontend
    │                   │                │                  │
    │── publish ────────▶│                │                  │
    │ movilidad/vehicles │                │                  │
    │ /BUS-001/telemetry │                │                  │
    │                   │── message ─────▶│                  │
    │                   │                │── persist DB      │
    │                   │                │── emit socket ───▶│
    │                   │                │   vehicle:         │
    │                   │                │   locationUpdated  │
    │                   │                │                  │── update state
    │                   │                │                  │── re-render map
    │                   │                │                  │
    │                   │         (every 2s)                │
    │                   │                │◀── GET /vehicles ─│
    │                   │                │─── 200 JSON ─────▶│
```

---

## Decisiones técnicas importantes

1. **Aedes como broker MQTT embebido**: Elimina la dependencia de Mosquitto o EMQX externos, facilitando la ejecución local del proyecto completo.

2. **SQLite como base de datos**: Apropiado para una POC escolar; no requiere servidor de base de datos. El archivo reside en `data/movilidad.sqlite`.

3. **Dual-channel en frontend**: El polling REST garantiza consistencia en reconexiones; Socket.IO garantiza latencia mínima durante operación normal.

4. **Animación a 60 fps sin re-renders de React**: Los marcadores de vehículos se actualizan escribiendo directamente a `style.left/top` mediante refs, evitando el costo de re-renderizado de React en cada frame.

5. **Mapa SVG puro**: La representación del mapa no depende de ninguna librería de mapas externa (sin Leaflet, sin Google Maps). Usa coordenadas porcentuales para ser completamente responsive.

6. **Simulador autónomo**: Corre independientemente del frontend. El backend puede operar sin simulador (simplemente no recibirá nuevos datos MQTT).

---

## Posibles mejoras futuras

- Autenticación y autorización en la API REST.
- Historial de rutas por vehículo con visualización en el mapa.
- Persistencia de semáforos con estado real sincronizado.
- Soporte para más vehículos dinámicos (no hardcodeados).
- Dashboard de métricas con gráficas de velocidad y batería por tiempo.
- Despliegue en contenedores Docker con docker-compose.
- Migración a PostgreSQL para mayor escalabilidad.
