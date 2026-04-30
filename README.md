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

Fases implementadas:

- Estructura base del proyecto.
- Broker MQTT independiente con Aedes.
- Backend Express.
- Conexion SQLite.
- Creacion automatica de tablas.
- Endpoints iniciales:
  - `GET /api/health`
  - `GET /api/vehicles`
  - `GET /api/events`
- Conexion del backend al broker MQTT.
- Suscripcion a topicos MQTT:
  - `movilidad/vehicles/+/telemetry`
  - `movilidad/vehicles/+/maintenance`
  - `movilidad/alerts/operator`
- Persistencia de mensajes MQTT validos en `events`.
- Persistencia de telemetria en `telemetry`.
- Creacion/actualizacion automatica de vehiculos al recibir telemetria.
- Simulador IoT independiente en `apps/simulator`.
- Publicacion periodica de telemetria para `BUS-001`, `TAXI-001` y `SCOOTER-001`.
- Publicacion ocasional de eventos de mantenimiento por MQTT.
- Frontend React + Vite en `apps/frontend`.
- Interfaz visual tipo app movil usando REST con polling cada 2 segundos.
- WebSocket con Socket.IO para actualizaciones en vivo desde el backend.
- REST permanece como respaldo para carga inicial y recuperacion.
- Pagos simulados desde la interfaz.
- Reportes de mantenimiento simulados desde la interfaz.

Todavia no incluye pagos reales, autenticacion ni servicios externos.

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

Terminal 3:

```bash
npm run simulate
```

Terminal 4:

```bash
npm run dev:frontend
```

Por defecto:

- Broker MQTT: `mqtt://localhost:1883`
- Backend REST local: `http://localhost:3001`
- Backend REST en red local: `http://IP-DE-TU-PC:3001`
- Socket.IO: `http://localhost:3001`
- Frontend local: `http://localhost:5173`
- Frontend en celular: `http://IP-DE-TU-PC:5173`
- SQLite: `data/movilidad.sqlite`

Para abrir la app desde un celular, usa la IP de tu computadora en la misma red Wi-Fi. El frontend ajusta automaticamente la URL del backend al mismo host con puerto `3001`.

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
Invoke-RestMethod http://localhost:3001/api/payments
Invoke-RestMethod http://localhost:3001/api/maintenance
```

El endpoint `/api/health` tambien muestra el estado de WebSocket:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

Busca:

```txt
websocket.enabled
websocket.connectedClients
```

## Prueba de pagos y mantenimiento

Con broker, backend, simulador y frontend ejecutandose:

1. Abre `http://localhost:5173`.
2. Selecciona `BUS-001`, `TAXI-001` o `SCOOTER-001`.
3. Presiona `Simular pago`.
4. Verifica la confirmacion visual, la seccion `Pagos recientes` y el timeline.
5. Presiona `Reportar mantenimiento`.
6. Verifica la alerta visual, la seccion `Mantenimiento` y el timeline.

Tambien puedes probar por REST:

```powershell
Invoke-RestMethod http://localhost:3001/api/payments/simulate -Method Post -ContentType "application/json" -Body '{"vehicleId":"BUS-001"}'
Invoke-RestMethod http://localhost:3001/api/maintenance/simulate -Method Post -ContentType "application/json" -Body '{"vehicleId":"BUS-001"}'
```

Eventos Socket.IO emitidos:

```txt
payment:created
maintenance:reported
event:created
```

## Prueba manual MQTT

Con el broker y backend ejecutandose, publica telemetria manual:

```bash
npx mqtt pub -h localhost -p 1883 -t movilidad/vehicles/BUS-001/telemetry -m "{\"lat\":27.4831,\"lng\":-109.9308,\"speed\":32,\"battery\":91,\"status\":\"in_route\",\"timestamp\":\"2026-04-29T08:00:00.000Z\"}"
```

En PowerShell, tambien puedes publicar usando Node para evitar problemas de comillas:

```powershell
node --input-type=module -e "import mqtt from 'mqtt'; const client = mqtt.connect('mqtt://localhost:1883'); client.on('connect', () => { client.publish('movilidad/vehicles/BUS-001/telemetry', JSON.stringify({ lat: 27.4831, lng: -109.9308, speed: 32, battery: 91, status: 'in_route', timestamp: '2026-04-29T08:00:00.000Z' }), {}, () => client.end()); });"
```

Tambien puedes publicar un evento de mantenimiento:

```bash
npx mqtt pub -h localhost -p 1883 -t movilidad/vehicles/BUS-001/maintenance -m "{\"type\":\"battery_check\",\"severity\":\"low\",\"description\":\"Revision preventiva simulada\"}"
```

Despues consulta:

```bash
curl http://localhost:3001/api/vehicles
curl http://localhost:3001/api/events
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
