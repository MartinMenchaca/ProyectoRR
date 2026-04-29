import mqtt from "mqtt";
import { env } from "./config/env.js";
import { vehicles } from "./routes/vehicles.js";

const client = mqtt.connect(env.mqttUrl, {
  clientId: `movilidad-simulator-${Date.now()}`,
  reconnectPeriod: 2000
});

const stateByVehicle = new Map(
  vehicles.map((vehicle) => [
    vehicle.vehicleId,
    {
      routeIndex: 0,
      battery: 92,
      tick: 0
    }
  ])
);

let publishTimer;

client.on("connect", () => {
  console.log(`[simulator] conectado al broker MQTT: ${env.mqttUrl}`);
  console.log(`[simulator] publicando cada ${env.publishIntervalMs} ms`);

  if (!publishTimer) {
    publishTimer = setInterval(publishAllVehicles, env.publishIntervalMs);
    publishAllVehicles();
  }
});

client.on("reconnect", () => {
  console.log("[simulator] intentando reconectar al broker MQTT...");
});

client.on("error", (error) => {
  console.error("[simulator] error de conexion MQTT:", error.message);
});

client.on("close", () => {
  console.log("[simulator] conexion MQTT cerrada.");
});

function publishAllVehicles() {
  for (const vehicle of vehicles) {
    publishTelemetry(vehicle);
    maybePublishMaintenance(vehicle);
  }
}

function publishTelemetry(vehicle) {
  const state = stateByVehicle.get(vehicle.vehicleId);
  const point = vehicle.route[state.routeIndex];
  const speed = calculateSpeed(vehicle.baseSpeed, state.tick);
  const battery = Math.max(15, Number((state.battery - vehicle.batteryDrain).toFixed(2)));
  const timestamp = new Date().toISOString();

  state.battery = battery;
  state.tick += 1;
  state.routeIndex = (state.routeIndex + 1) % vehicle.route.length;

  const payload = {
    vehicleId: vehicle.vehicleId,
    name: vehicle.name,
    type: vehicle.type,
    lat: point.lat,
    lng: point.lng,
    speed,
    battery,
    status: "in_route",
    timestamp
  };

  const topic = `movilidad/vehicles/${vehicle.vehicleId}/telemetry`;
  client.publish(topic, JSON.stringify(payload), { qos: 0 }, (error) => {
    if (error) {
      console.error(`[simulator] error publicando telemetria de ${vehicle.vehicleId}:`, error.message);
      return;
    }

    console.log(`[simulator] publicando telemetria de ${vehicle.vehicleId}`);
  });
}

function maybePublishMaintenance(vehicle) {
  const state = stateByVehicle.get(vehicle.vehicleId);

  if (state.tick === 0 || state.tick % vehicle.maintenanceEveryTicks !== 0) {
    return;
  }

  const payload = {
    vehicleId: vehicle.vehicleId,
    type: state.battery <= 35 ? "battery_low" : "preventive_check",
    severity: state.battery <= 35 ? "medium" : "low",
    description:
      state.battery <= 35
        ? "Nivel de batería bajo detectado por el dispositivo IoT simulado."
        : "Revision preventiva generada por el dispositivo IoT simulado.",
    status: "open",
    timestamp: new Date().toISOString()
  };

  const topic = `movilidad/vehicles/${vehicle.vehicleId}/maintenance`;
  client.publish(topic, JSON.stringify(payload), { qos: 0 }, (error) => {
    if (error) {
      console.error(`[simulator] error publicando mantenimiento de ${vehicle.vehicleId}:`, error.message);
      return;
    }

    console.log(`[simulator] publicando mantenimiento de ${vehicle.vehicleId}`);
  });
}

function calculateSpeed(baseSpeed, tick) {
  const wave = Math.sin(tick / 2) * 4;
  const jitter = Math.random() * 4 - 2;
  return Math.max(5, Math.round(baseSpeed + wave + jitter));
}

function shutdown() {
  console.log("[simulator] deteniendo simulador IoT...");

  if (publishTimer) {
    clearInterval(publishTimer);
  }

  client.end(false, () => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
