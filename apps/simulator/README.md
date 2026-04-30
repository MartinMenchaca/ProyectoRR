# Simulador IoT

Proceso Node.js independiente que simula vehiculos de movilidad inteligente publicando eventos MQTT al broker local.

## Que simula

- `BUS-001`: bus de la Ruta Centro.
- `TAXI-001`: Taxi Eléctrico Norte.
- `SCOOTER-001`: scooter de plaza.

Cada vehiculo avanza por una ruta predefinida, cambia su velocidad, reduce bateria gradualmente y mantiene estado `in_route`.

El simulador no publica mantenimientos automaticos. Los reportes de mantenimiento de la POC se crean manualmente desde la interfaz o con `POST /api/maintenance/simulate`.

## Topicos MQTT

Telemetria:

```txt
movilidad/vehicles/BUS-001/telemetry
movilidad/vehicles/TAXI-001/telemetry
movilidad/vehicles/SCOOTER-001/telemetry
```

Los topicos de mantenimiento siguen existiendo en el backend, pero este simulador ya no los publica automaticamente.

## Ejecucion

Desde la raiz del proyecto:

```bash
npm run simulate
```

O en modo desarrollo:

```bash
npm run dev:simulator
```

Desde esta carpeta:

```bash
npm run simulate
```

## Configuracion

Por defecto se conecta a:

```txt
mqtt://localhost:1883
```

Puedes cambiarlo con:

```bash
MQTT_URL=mqtt://localhost:1883
```

## Como comprobar que el backend recibe mensajes

1. Inicia el broker:

```bash
npm run dev:broker
```

2. Inicia el backend:

```bash
npm run dev:backend
```

3. Inicia el simulador:

```bash
npm run simulate
```

4. Consulta el backend:

```bash
curl http://localhost:3001/api/vehicles
curl http://localhost:3001/api/events
```

En PowerShell:

```powershell
Invoke-RestMethod http://localhost:3001/api/vehicles
Invoke-RestMethod http://localhost:3001/api/events
```
