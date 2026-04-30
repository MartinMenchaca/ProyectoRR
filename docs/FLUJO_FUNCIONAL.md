# Flujo Funcional del Sistema

## 1. Cómo funciona la simulación

El simulador IoT (`apps/simulator`) es un proceso Node.js independiente que imita el comportamiento de dispositivos embarcados en vehículos. Al arrancar, establece una conexión MQTT con el broker y cada 1800 ms ejecuta un ciclo de publicación para todos los vehículos registrados.

### Ciclo por tick

Para cada vehículo en cada tick:

1. **Posición GPS**: Se toma el punto de la ruta en el índice `routeIndex` actual. El índice avanza en cada tick y se reinicia al llegar al último punto (`routeIndex % route.length`), creando un recorrido circular continuo.

2. **Velocidad**: Se calcula como `baseSpeed + onda_sinusoidal + jitter_aleatorio`. La onda usa `Math.sin(tick / 2) * 4` para simular variaciones naturales de aceleración. El jitter agrega ±2 km/h de variación aleatoria. El resultado mínimo es 5 km/h.

3. **Batería**: Decrece `batteryDrain` por tick. El mínimo es 15%. No se recarga en esta versión.

4. **Mantenimiento automático**: Si `tick % maintenanceEveryTicks === 0` (y tick > 0), el simulador publica también un mensaje de mantenimiento. El tipo depende del nivel de batería:
   - `battery_low` si batería ≤ 35%
   - `preventive_check` en cualquier otro caso

---

## 2. Cómo se mueven los vehículos

### En el simulador (coordenadas GPS)

Cada vehículo tiene una ruta de 7 puntos GPS reales aproximados a la zona de Ciudad Obregón, Sonora. El simulador avanza de punto en punto secuencialmente y publica la posición actual por MQTT. Estas coordenadas se almacenan en la base de datos como `current_lat` / `current_lng`.

| Vehículo | Zona aproximada |
|----------|----------------|
| BUS-001 | Centro urbano (lat ~27.483, lng ~-109.931) |
| TAXI-001 | Zona norte (lat ~27.489, lng ~-109.937) |
| SCOOTER-001 | Zona plaza (lat ~27.481, lng ~-109.928) |

### En el mapa del frontend (coordenadas SVG)

El mapa frontend **no usa las coordenadas GPS del backend** para animar los marcadores. En su lugar, usa rutas propias definidas en `routesConfig.js` como coordenadas porcentuales (x%, y%) dentro del viewport SVG de 100×100 unidades.

La animación funciona así:

1. Un loop de `requestAnimationFrame` se ejecuta a 60 fps desde que el componente `SimulatedMap` se monta.
2. En cada frame, se llama a `getRouteSample(route, Date.now() + offset)`.
3. `getRouteSample` calcula la posición exacta interpolando entre los segmentos de la ruta según el progreso temporal (`timestamp % durationMs`).
4. La posición resultante `{x, y, angle}` se escribe directamente en `el.style.left`, `el.style.top` y `--vehicle-angle` del nodo DOM del marcador (sin pasar por React state).

Este diseño garantiza animación fluida a 60 fps sin el costo de re-renderizado de React.

### Offset de inicio por vehículo

Para evitar que todos los vehículos empiecen desde la misma posición temporal:

| Vehículo | Offset (ms) |
|----------|------------|
| BUS-001 | 0 |
| TAXI-001 | 5200 ms |
| SCOOTER-001 | 9100 ms |

---

## 3. Cómo se representan las rutas

Las rutas en el mapa SVG están definidas en `routesConfig.js` con estas propiedades:

| Campo | Descripción |
|-------|-------------|
| `color` | Color hexadecimal de la línea de ruta |
| `durationMs` | Tiempo en ms para completar un ciclo completo |
| `points` | Array de `{x, y}` en coordenadas porcentuales SVG |

Las rutas se dibujan como `<path>` SVG con la función `pointsToPath()`, que convierte el array de puntos en instrucciones `M`/`L` de SVG. La ruta del vehículo actualmente seleccionado se resalta con la clase CSS `is-active`.

| Vehículo | Color | Ciclo |
|----------|-------|-------|
| BUS-001 | Verde `#10B981` | 26 segundos |
| TAXI-001 | Azul `#3B82F6` | 18 segundos |
| SCOOTER-001 | Ámbar `#F59E0B` | 13 segundos |

---

## 4. Cómo se muestran los estados

### Estado del sistema (`SystemStatus`)

El componente consulta periódicamente `GET /api/health` y muestra indicadores para:

- **API REST** (Express): verde si el backend responde con `status: "ok"`.
- **Base de datos** (SQLite): verde si `health.database.connected === true`.
- **MQTT Broker** (Aedes): verde si el cliente MQTT del backend está conectado al broker.
- **Topics activos**: cantidad de topics MQTT suscritos.
- **WebSocket** (Socket.IO): verde/rojo según el estado real de la conexión Socket.IO del frontend.

El strip de topics muestra las cadenas exactas de los topics MQTT suscritos y la URL del socket.

### Estado de un vehículo

Cada vehículo tiene un campo `status` con posibles valores: `idle`, `in_route`. Los datos mostrados en la tarjeta incluyen velocidad actual (km/h), porcentaje de batería y timestamp de última actualización.

### Alertas en tiempo real

Cuando llega un evento `payment:created` o `maintenance:reported` por Socket.IO, se activa una alerta `liveAlert` visible en la interfaz durante 4.2 segundos.

---

## 5. Cómo se interpreta el mapa

El mapa SVG representa una ciudad ficticia con las siguientes capas (de atrás hacia adelante):

1. **Zonas coloreadas**: áreas semitransparentes que sugieren distritos (comercial, residencial, universitario).
2. **Manzanas urbanas** (`cityBlocks`): rectángulos grises que representan edificios.
3. **Halos de calles primarias**: sombras suaves para dar profundidad.
4. **Calles** (`roads`): líneas blancas/grises diferenciadas por tipo (primaria/secundaria).
5. **Líneas centrales punteadas**: guías en calles primarias.
6. **Intersecciones** (`intersections`): nodos circulares en cada cruce.
7. **Rutas de vehículos** (`vehicleRoutes`): líneas de color con la ruta de cada unidad.
8. **Semáforos** (`trafficLights`): iconos SVG con luces roja/amarilla/verde.
9. **Puntos de interés** (`landmarks`): Terminal Centro, Campus, Plaza Norte, Clínica Urbana.
10. **Etiquetas de calles**: textos con nombres de vías.
11. **Marcadores de vehículos**: componentes React superpuestos sobre el SVG.
12. **Rosa de los vientos** y **barra de escala**: elementos de referencia cartográfica.

### Calles del mapa

| ID | Nombre | Tipo | Orientación |
|----|--------|------|-------------|
| blvd-norte | Blvd. Norte | Primaria | Horizontal |
| av-central | Av. Central | Primaria | Horizontal |
| av-universidad | Av. Universidad | Primaria | Horizontal |
| calle-reforma | Calle Reforma | Primaria | Vertical |
| av-tecnologico | Av. Tecnológico | Primaria | Vertical |
| calle-juarez | Calle Juárez | Primaria | Vertical |
| calle-hidalgo | Calle Hidalgo | Secundaria | Horizontal |
| calle-morelos | Calle Morelos | Secundaria | Horizontal |
| calle-plaza | Calle Plaza | Secundaria | Vertical |
| calle-mercado | Calle Mercado | Secundaria | Vertical |

---

## 6. Tipos de vehículo y su comportamiento

### BUS-001 — "Ruta Centro" (bus)

- Velocidad base: 38 km/h (la más moderada de los tres).
- Batería: drenaje más lento (0.35%/tick). Está pensado para representar un vehículo de mayor autonomía.
- Mantenimiento automático cada 12 ticks (~21.6 segundos).
- Ruta SVG: recorrido rectangular amplio que cubre el cuadrante oeste y norte del mapa.
- Color en mapa: verde.

### TAXI-001 — "Taxi Eléctrico Norte" (electric_taxi)

- Velocidad base: 46 km/h (la más alta).
- Batería: drenaje intermedio (0.45%/tick).
- Mantenimiento automático cada 15 ticks (~27 segundos).
- Ruta SVG: recorrido en el cuadrante este del mapa.
- Color en mapa: azul.

### SCOOTER-001 — "Scooter Plaza" (scooter)

- Velocidad base: 22 km/h (la más baja, coherente con el tipo de vehículo).
- Batería: drenaje más alto (0.55%/tick). Al ser el de menor autonomía, es el primero en generar alertas `battery_low`.
- Mantenimiento automático cada 18 ticks (~32.4 segundos).
- Ruta SVG: recorrido compacto en la zona de la plaza central.
- Color en mapa: ámbar.

---

## 7. Flujo de datos completo

```
Simulador IoT
└── Lee ruta GPS de vehicles.js
└── Calcula posición, velocidad y batería
└── Publica MQTT → movilidad/vehicles/{id}/telemetry
                 → movilidad/vehicles/{id}/maintenance

Broker MQTT (Aedes)
└── Recibe publicación
└── Reenvía a suscriptores

Backend — Cliente MQTT
└── Recibe mensaje MQTT
└── Parsea JSON
└── Upsert vehículo en SQLite
└── Registra evento en SQLite
└── Si telemetría:
    └── Guarda en tabla telemetry
    └── Actualiza tabla vehicles (lat, lng, speed, battery)
    └── Emite "vehicle:locationUpdated" por Socket.IO
└── Si mantenimiento:
    └── Guarda en tabla maintenance_reports
    └── Emite "maintenance:reported" por Socket.IO

Frontend
├── Socket.IO:
│   └── Recibe vehicle:locationUpdated → actualiza estado React → mueve marcador
│   └── Recibe event:created → agrega a EventTimeline
│   └── Recibe payment:created → agrega a PaymentsPanel + muestra liveAlert
│   └── Recibe maintenance:reported → agrega a MaintenancePanel + muestra liveAlert
└── Polling REST (cada 2s):
    └── GET /vehicles → sincroniza estado completo
    └── GET /events → sincroniza historial
    └── GET /payments → sincroniza pagos
    └── GET /maintenance → sincroniza reportes
```
