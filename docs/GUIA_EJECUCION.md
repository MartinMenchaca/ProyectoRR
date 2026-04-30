# Guía de Ejecución

## 1. Requisitos previos

| Requisito | Versión mínima | Cómo verificar |
|-----------|---------------|----------------|
| Node.js | 18.x | `node --version` |
| npm | 8.x | `npm --version` |
| Git | cualquier | `git --version` |

> No se requiere ningún servicio externo (ni Mosquitto, ni Docker, ni base de datos externa). Todo corre en Node.js localmente.

---

## 2. Instalación

```bash
# 1. Clonar el repositorio (si no se tiene ya)
git clone <url-del-repositorio>
cd ProyectoRR

# 2. Instalar dependencias de todos los workspaces
npm run install:all
```

Este comando instala las dependencias de `apps/broker`, `apps/backend`, `apps/frontend` y `apps/simulator` en un solo paso.

---

## 3. Configuración de variables de entorno (opcional)

El proyecto ya incluye valores por defecto para desarrollo local. Sólo es necesario configurar variables si se cambia el puerto, el host, o se accede desde un dispositivo móvil.

### Proyecto raíz

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Variables del archivo `.env` raíz (usadas por broker, backend y simulador):

```env
NODE_ENV=development
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_URL=mqtt://localhost:1883
BACKEND_HOST=0.0.0.0
BACKEND_PORT=3001
DATABASE_FILE=../../data/movilidad.sqlite
```

### Frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Variables del frontend:

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

> **Acceso desde celular en la misma red**: dejar `VITE_API_URL` y `VITE_SOCKET_URL` sin definir (o eliminar el archivo `.env` del frontend). El frontend detectará automáticamente la IP del servidor.

---

## 4. Ejecución del sistema

Se requieren **cuatro terminales** abiertas en la raíz del proyecto:

### Terminal 1 — Broker MQTT

```bash
npm run dev:broker
```

Salida esperada:
```
[broker] MQTT escuchando en mqtt://localhost:1883
```

### Terminal 2 — Backend

```bash
npm run dev:backend
```

Salida esperada:
```
[backend] HTTP escuchando en http://0.0.0.0:3001
[backend] SQLite en .../data/movilidad.sqlite
[backend] MQTT configurado en mqtt://localhost:1883
[backend] WebSocket Socket.IO habilitado
[mqtt] conectado a broker MQTT: mqtt://localhost:1883
[mqtt] suscrito a movilidad/vehicles/+/telemetry
[mqtt] suscrito a movilidad/vehicles/+/maintenance
[mqtt] suscrito a movilidad/alerts/operator
```

### Terminal 3 — Simulador IoT

```bash
npm run dev:simulator
```

Salida esperada:
```
[simulator] conectado al broker MQTT: mqtt://localhost:1883
[simulator] publicando cada 1800 ms
[simulator] publicando telemetria de BUS-001
[simulator] publicando telemetria de TAXI-001
[simulator] publicando telemetria de SCOOTER-001
```

### Terminal 4 — Frontend

```bash
npm run dev:frontend
```

Salida esperada:
```
  VITE v6.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

## 5. Cómo probar el sistema

### Verificación básica

1. Abrir `http://localhost:5173` en el navegador.
2. El panel **"Centro operativo"** debe mostrar todos los indicadores en verde: API REST, Base de datos, MQTT Broker, Topics activos, WebSocket.
3. El mapa debe mostrar los tres vehículos (bus verde, taxi azul, scooter ámbar) moviéndose continuamente.

### Probar datos en tiempo real

1. Observar la **línea de eventos** en la parte inferior: debe actualizarse cada ~1.8 segundos con nuevos eventos de telemetría.
2. Seleccionar un vehículo haciendo clic en su marcador o en la lista de unidades.
3. La tarjeta de vehículo debe mostrar velocidad (km/h) y batería actualizados.

### Probar pago simulado

1. Seleccionar un vehículo.
2. Hacer clic en **"Simular pago"** (en la bottom sheet del mapa o en la tarjeta de vehículo).
3. Debe aparecer una alerta temporal con el mensaje de confirmación.
4. El pago debe aparecer en el panel **"Pagos simulados"**.

### Probar mantenimiento simulado

1. Seleccionar un vehículo.
2. Hacer clic en **"Reportar mantenimiento"**.
3. Debe aparecer una alerta temporal.
4. El reporte debe aparecer en el panel **"Mantenimiento"**.

### Verificar la API REST directamente

```bash
# Health
curl http://localhost:3001/api/health

# Vehículos
curl http://localhost:3001/api/vehicles

# Eventos
curl http://localhost:3001/api/events

# Pagos
curl http://localhost:3001/api/payments

# Mantenimiento
curl http://localhost:3001/api/maintenance
```

---

## 6. Errores comunes y solución

### Error: "No se pudo conectar con el backend"

**Síntoma:** El panel de estado muestra API REST y Base de datos en rojo.

**Causas y solución:**
- El backend no está corriendo → Revisar Terminal 2.
- Puerto 3001 ocupado → Cambiar `BACKEND_PORT` en `.env`.
- CORS bloqueando → El frontend y el backend deben estar en el mismo host o configurar CORS correctamente.

---

### Error: "MQTT Broker" en rojo

**Síntoma:** El indicador de MQTT Broker aparece inactivo en el panel de estado.

**Causas y solución:**
- El broker no está corriendo → Iniciar Terminal 1 primero.
- Puerto 1883 ocupado por otro proceso (Mosquitto instalado localmente) → Detener el servicio conflictivo o cambiar `MQTT_PORT`.

---

### Los vehículos no aparecen en el mapa

**Síntoma:** El mapa carga pero está vacío.

**Causas y solución:**
- El simulador no está corriendo → Iniciar Terminal 3.
- El simulador no puede conectar al broker → Verificar que el broker esté activo.
- Esperar ~5 segundos tras iniciar el simulador para que los primeros datos lleguen al backend.

---

### La animación del mapa no se mueve

**Síntoma:** Los marcadores aparecen estáticos.

**Causas y solución:**
- El navegador puede estar bloqueando animaciones (modo ahorro de energía). Recargar la página.
- El componente recibe `vehicles.length === 0`. Verificar que el simulador esté activo.

---

### Error de base de datos al iniciar el backend

**Síntoma:** El backend se cae con error sobre SQLite.

**Causas y solución:**
- La carpeta `data/` no existe → Crear manualmente: `mkdir data` desde la raíz.
- Permisos de escritura insuficientes en la ruta del archivo SQLite.

---

### Socket.IO en estado "reconectando"

**Síntoma:** El indicador de WebSocket oscila entre conectado y reconectando.

**Causas y solución:**
- El backend se reinició (modo `--watch` lo hace al detectar cambios). Comportamiento normal en desarrollo.
- Si persiste, verificar que el backend esté activo y sin errores en la Terminal 2.

---

## 7. Verificar que no se rompió nada

```bash
# Verificar que el frontend compila sin errores
npm run build --workspace apps/frontend

# Verificar el health del backend mientras corre
curl -s http://localhost:3001/api/health | node -e "process.stdin.pipe(require('fs').createWriteStream('/dev/stdout'))"

# Ver los últimos 5 vehículos registrados en la DB (requiere sqlite3 CLI)
sqlite3 data/movilidad.sqlite "SELECT id, status, battery, updated_at FROM vehicles LIMIT 5;"

# Ver los últimos 5 eventos
sqlite3 data/movilidad.sqlite "SELECT id, event_type, vehicle_id, created_at FROM events ORDER BY id DESC LIMIT 5;"
```

---

## 8. Orden correcto de inicio

El orden importa: el broker debe estar listo antes de que el backend y el simulador intenten conectarse.

```
1. Broker MQTT   → debe arrancar primero
2. Backend       → se conecta al broker al iniciar
3. Simulador     → se conecta al broker al iniciar
4. Frontend      → se conecta al backend (HTTP + WS)
```

Si se inicia en orden incorrecto, los servicios reintentan la conexión automáticamente (reconnect period: 2 segundos en todos los clientes MQTT; reintentos automáticos en Socket.IO con backoff hasta 5 segundos).
