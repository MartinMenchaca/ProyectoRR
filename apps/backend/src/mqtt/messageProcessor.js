import { getDatabase } from "../db/database.js";
import { emitSocketEvent } from "../sockets/socketServer.js";
import { parseVehicleTopic } from "./topics.js";

export async function processMqttMessage(topic, rawMessage) {
  let payload;

  try {
    payload = JSON.parse(rawMessage.toString("utf8"));
  } catch (error) {
    console.error(`[mqtt] JSON invalido en ${topic}: ${rawMessage.toString("utf8")}`);
    return;
  }

  console.log(`[mqtt] mensaje recibido en ${topic}`);

  const database = await getDatabase();
  const { vehicleId, messageType } = parseVehicleTopic(topic);
  const eventType = getEventType(topic, messageType);
  const now = new Date().toISOString();

  if (vehicleId) {
    await ensureVehicleExists(database, vehicleId, payload, now);
  }

  const createdAt = payload.timestamp || now;
  const eventInsert = await database.run(
    `INSERT INTO events (vehicle_id, event_type, channel, topic, payload_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      vehicleId,
      eventType,
      "mqtt",
      topic,
      JSON.stringify(payload),
      createdAt
    ]
  );

  console.log(`[mqtt] evento guardado en base de datos: ${eventType}`);
  emitSocketEvent("event:created", {
    id: eventInsert.lastID,
    vehicle_id: vehicleId,
    event_type: eventType,
    channel: "mqtt",
    topic,
    payload_json: JSON.stringify(payload),
    payload,
    created_at: createdAt
  });

  if (messageType === "telemetry") {
    const telemetry = await saveTelemetry(database, vehicleId, payload, now);

    if (telemetry) {
      emitSocketEvent("vehicle:locationUpdated", telemetry);
    }
  }

  if (messageType === "maintenance") {
    console.log("[mqtt] mantenimiento recibido como evento MQTT; no se registra reporte manual.");
  }
}

function getEventType(topic, messageType) {
  if (messageType === "telemetry") return "vehicle.telemetry";
  if (messageType === "maintenance") return "vehicle.maintenance";
  if (topic === "movilidad/alerts/operator") return "operator.alert";
  return "mqtt.message";
}

async function saveTelemetry(database, vehicleId, payload, now) {
  if (!vehicleId) {
    console.error("[mqtt] telemetria ignorada: no se pudo identificar el vehiculo desde el topico.");
    return null;
  }

  const lat = Number(payload.lat);
  const lng = Number(payload.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error(`[mqtt] telemetria invalida para ${vehicleId}: lat/lng requeridos.`);
    return null;
  }

  const speed = Number.isFinite(Number(payload.speed)) ? Number(payload.speed) : 0;
  const battery = Number.isFinite(Number(payload.battery)) ? Number(payload.battery) : 100;
  const status = payload.status || "in_route";
  const timestamp = payload.timestamp || now;

  await database.run(
    `INSERT INTO telemetry (vehicle_id, lat, lng, speed, battery, status, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [vehicleId, lat, lng, speed, battery, status, "mqtt", timestamp]
  );

  await database.run(
    `UPDATE vehicles
     SET current_lat = ?,
         current_lng = ?,
         speed = ?,
         battery = ?,
         status = ?,
         updated_at = ?
     WHERE id = ?`,
    [lat, lng, speed, battery, status, timestamp, vehicleId]
  );

  console.log(`[mqtt] telemetria guardada y vehiculo actualizado: ${vehicleId}`);

  return {
    vehicleId,
    name: payload.name || vehicleId,
    type: payload.type || "vehicle",
    lat,
    lng,
    speed,
    battery,
    status,
    timestamp
  };
}

async function ensureVehicleExists(database, vehicleId, payload, now) {
  await database.run(
    `INSERT OR IGNORE INTO vehicles
      (id, name, type, plate, status, battery, current_lat, current_lng, speed, created_at, updated_at)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vehicleId,
      payload.name || vehicleId,
      payload.type || "vehicle",
      payload.plate || null,
      payload.status || "idle",
      Number.isFinite(Number(payload.battery)) ? Number(payload.battery) : 100,
      Number.isFinite(Number(payload.lat)) ? Number(payload.lat) : null,
      Number.isFinite(Number(payload.lng)) ? Number(payload.lng) : null,
      Number.isFinite(Number(payload.speed)) ? Number(payload.speed) : 0,
      payload.timestamp || now,
      payload.timestamp || now
    ]
  );
}
