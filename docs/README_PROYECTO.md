# Movilidad Inteligente — Prueba de Concepto

## Nombre del proyecto

**Movilidad Inteligente POC** (`movilidad-inteligente-poc`)

---

## Descripción general

Sistema de monitoreo urbano en tiempo real que demuestra comunicaciones distribuidas aplicadas al transporte inteligente. Integra un broker MQTT, un backend con API REST y WebSockets, un simulador IoT de vehículos y un frontend web interactivo con mapa urbano animado.

---

## Objetivo del sistema

Demostrar de forma didáctica y funcional cómo los protocolos MQTT, REST y WebSocket pueden coexistir en una arquitectura distribuida para transmitir y visualizar telemetría de vehículos urbanos en tiempo real.

---

## Problema que resuelve

Las ciudades modernas requieren sistemas capaces de integrar múltiples canales de comunicación para monitorear flotas de transporte. Este proyecto modela ese escenario con tres tipos de vehículos (autobús, taxi eléctrico y scooter) que reportan posición, velocidad, batería y alertas de mantenimiento de forma continua.

---

## Alcance

- Simulación de tres vehículos con rutas fijas sobre un mapa urbano ficticio.
- Publicación de telemetría vía MQTT cada 1.8 segundos.
- Persistencia de eventos, posiciones, pagos y mantenimiento en base de datos SQLite.
- API REST para consulta de datos históricos y acciones simuladas (pagos, mantenimiento).
- Actualización en tiempo real en el frontend mediante Socket.IO.
- Mapa SVG animado a 60 fps con calles, intersecciones, semáforos y puntos de interés.

---

## Tecnologías utilizadas

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React | 19.x |
| Frontend | Vite | 6.x |
| Frontend | socket.io-client | 4.x |
| Frontend | lucide-react | 0.468.x |
| Backend | Node.js | ≥18 |
| Backend | Express | 4.x |
| Backend | Socket.IO (servidor) | 4.x |
| Backend | sqlite / sqlite3 | 5.x |
| Backend | mqtt (cliente) | 5.x |
| Broker | Aedes | — |
| Simulador | mqtt (cliente) | 5.x |
| Base de datos | SQLite | — |
| Comunicación | MQTT (TCP 1883) | — |
| Comunicación | HTTP REST (3001) | — |
| Comunicación | WebSocket / Socket.IO (3001) | — |

---

## Estructura del proyecto

```
ProyectoRR/
├── apps/
│   ├── broker/               # Broker MQTT (Aedes, puerto 1883)
│   │   └── src/index.js
│   ├── backend/              # API REST + Socket.IO + cliente MQTT
│   │   └── src/
│   │       ├── index.js
│   │       ├── config/       # Variables de entorno y CORS
│   │       ├── db/           # Inicialización SQLite y schema
│   │       ├── mqtt/         # Cliente MQTT, procesador de mensajes, topics
│   │       ├── routes/       # Endpoints REST (vehicles, events, payments, maintenance, health)
│   │       └── sockets/      # Servidor Socket.IO
│   ├── frontend/             # React + Vite
│   │   └── src/
│   │       ├── App.jsx       # Componente raíz y orquestador de estado
│   │       ├── api/          # Cliente HTTP y cliente Socket.IO
│   │       ├── components/   # Componentes de UI
│   │       │   └── map/      # Configuración del mapa, rutas y utilidades
│   │       ├── styles/       # CSS global
│   │       └── main.jsx
│   └── simulator/            # Simulador IoT (publica MQTT)
│       └── src/
│           ├── index.js      # Loop de publicación MQTT
│           ├── config/       # Variables de entorno
│           └── routes/vehicles.js  # Definición de vehículos y rutas GPS
├── data/
│   └── movilidad.sqlite      # Base de datos SQLite
├── docs/                     # Documentación técnica
├── .env.example              # Variables de entorno del proyecto
└── package.json              # Workspace raíz (npm workspaces)
```

---

## Cómo ejecutar el proyecto

### Prerequisitos

- Node.js 18 o superior.
- npm 8 o superior.

### Instalación de dependencias

```bash
# Desde la raíz del proyecto
npm run install:all
```

### Ejecución (cuatro terminales en paralelo)

```bash
# Terminal 1 — Broker MQTT
npm run dev:broker

# Terminal 2 — Backend
npm run dev:backend

# Terminal 3 — Simulador IoT
npm run dev:simulator

# Terminal 4 — Frontend
npm run dev:frontend
```

El frontend queda disponible en `http://localhost:5173`.

---

## Servicios necesarios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Broker MQTT | 1883 (TCP) | Punto central de mensajería |
| Backend HTTP / WS | 3001 | API REST y WebSocket |
| Frontend | 5173 (dev) | Interfaz web |

---

## Variables de configuración importantes

### Raíz del proyecto (`.env`)

| Variable | Por defecto | Descripción |
|----------|------------|-------------|
| `MQTT_HOST` | `localhost` | Host del broker |
| `MQTT_PORT` | `1883` | Puerto TCP del broker |
| `MQTT_URL` | `mqtt://localhost:1883` | URL completa del broker |
| `BACKEND_HOST` | `0.0.0.0` | Interfaz de escucha del backend |
| `BACKEND_PORT` | `3001` | Puerto HTTP/WS del backend |
| `DATABASE_FILE` | `../../data/movilidad.sqlite` | Ruta del archivo SQLite |

### Frontend (`apps/frontend/.env`)

| Variable | Por defecto | Descripción |
|----------|------------|-------------|
| `VITE_API_URL` | `http://localhost:3001/api` | URL base de la API REST |
| `VITE_SOCKET_URL` | `http://localhost:3001` | URL del servidor Socket.IO |

> Si se accede desde un dispositivo móvil en la misma red, dejar `VITE_API_URL` sin definir para que el frontend resuelva automáticamente la IP del servidor.
