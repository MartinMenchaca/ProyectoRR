# Movilidad Inteligente POC

Prueba de concepto escolar para la materia Sistemas Distribuidos.

El objetivo final es demostrar comunicaciones distribuidas en un sistema de movilidad inteligente:

- Simulador IoT Node.js publicando eventos por MQTT.
- Broker MQTT independiente en `apps/broker`.
- Backend Node.js + Express recibiendo datos y exponiendo REST.
- Persistencia en SQLite.
- Frontend React + Vite con apariencia de app movil.
- Actualizaciones en tiempo real con Socket.IO.
- Documentacion UML en PlantUML.

## Estado actual

Fase 1 implementada:

- Estructura base del proyecto.
- Broker MQTT independiente con Aedes.
- Backend Express.
- Conexion SQLite.
- Creacion automatica de tablas.
- Endpoints iniciales:
  - `GET /api/health`
  - `GET /api/vehicles`
  - `GET /api/events`

Todavia no incluye frontend, simulador, Socket.IO, pagos ni mantenimiento.

## Requisitos

- Node.js 20 o superior recomendado.
- npm.

## Instalacion

```bash
npm install
```

## Ejecucion

Terminal 1:

```bash
npm run dev:broker
```

Terminal 2:

```bash
npm run dev:backend
```

Por defecto:

- Broker MQTT: `mqtt://localhost:1883`
- Backend REST: `http://localhost:3001`
- SQLite: `data/movilidad.sqlite`

## Pruebas rapidas

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/vehicles
curl http://localhost:3001/api/events
```

En PowerShell:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
Invoke-RestMethod http://localhost:3001/api/vehicles
Invoke-RestMethod http://localhost:3001/api/events
```

## Estructura

```txt
apps/
  broker/
  backend/
  frontend/
  simulator/

docs/
  component-diagram.puml
  deployment-diagram.puml
  README.md

data/
  movilidad.sqlite

README.md
.env.example
```
