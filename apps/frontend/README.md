# Frontend Movilidad Inteligente

Interfaz React + Vite para visualizar la prueba de concepto de Movilidad Inteligente.

## Que hace

- Consulta el backend por REST.
- Se conecta al backend por Socket.IO para eventos en vivo.
- Muestra estado de Backend, SQLite y MQTT.
- Visualiza vehiculos en un mapa simulado con SVG/CSS.
- Renderiza una red urbana estructurada con avenidas, calles, intersecciones, semaforos y rutas por vehiculo.
- Permite seleccionar `BUS-001`, `TAXI-001` y `SCOOTER-001`.
- Muestra tarjeta del vehiculo activo.
- Muestra panel de operador con unidades activas.
- Muestra logs recientes de eventos MQTT registrados en SQLite.
- Muestra el flujo de comunicaciones distribuidas.

No usa Google Maps, Mapbox, Firebase, WebSocket, autenticacion ni pasarelas de pago.

## Endpoints consumidos

```txt
GET /api/health
GET /api/vehicles
GET /api/events
```

La app usa estos endpoints para carga inicial y respaldo. Ademas escucha por Socket.IO:

```txt
vehicle:locationUpdated
maintenance:reported
event:created
```

El polling REST sigue activo como fallback si WebSocket se desconecta.

## Mapa simulado

El mapa se define desde datos estructurados:

- `src/components/map/cityMapConfig.js`: calles, intersecciones, semaforos, puntos de referencia y bloques urbanos.
- `src/components/map/routesConfig.js`: rutas visuales de `BUS-001`, `TAXI-001` y `SCOOTER-001`.
- `src/components/map/mapUtils.js`: interpolacion de posicion y orientacion sobre rutas.

La telemetria del backend mantiene estado, velocidad, bateria y frescura de datos. La posicion visual se proyecta sobre rutas urbanas coherentes para que los vehiculos circulen sobre calles simuladas.

## Configuracion

Crea un `.env` local si necesitas cambiar la URL del backend:

```txt
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

Si abres la app desde un celular usando la IP de tu computadora, por ejemplo:

```txt
http://192.168.100.4:5173
```

puedes dejar `VITE_API_URL` sin definir. El frontend detecta automaticamente el host y consulta:

```txt
http://192.168.100.4:3001/api
```

El backend debe estar escuchando en `0.0.0.0` o en la IP de tu computadora para que otro dispositivo de la red pueda conectarse.

## Instalacion

Desde la raiz del proyecto:

```bash
npm install
```

O desde esta carpeta:

```bash
npm install
```

## Ejecucion

Desde la raiz:

```bash
npm run dev:frontend
```

Desde esta carpeta:

```bash
npm run dev
```

Por defecto Vite levanta la app en:

```txt
http://localhost:5173
```

## Relacion con la POC

El frontend representa el nodo visual de la arquitectura:

```txt
Simulador IoT -> Broker MQTT -> Backend -> SQLite -> Frontend
Backend -> Socket.IO -> Frontend
```

El frontend consume REST para estado inicial y usa Socket.IO para actualizaciones en vivo.
