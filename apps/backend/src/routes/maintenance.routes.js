import { Router } from "express";
import { getDatabase } from "../db/database.js";
import { emitSocketEvent } from "../sockets/socketServer.js";

export const maintenanceRouter = Router();

maintenanceRouter.get("/maintenance", async (_req, res, next) => {
  try {
    const database = await getDatabase();
    const reports = await database.all(
      `SELECT id, vehicle_id, type, severity, description, status, created_at, resolved_at
       FROM maintenance_reports
       ORDER BY created_at DESC, id DESC
       LIMIT 50`
    );

    res.json({ data: reports.map(normalizeMaintenance) });
  } catch (error) {
    next(error);
  }
});

maintenanceRouter.post("/maintenance/simulate", async (req, res, next) => {
  try {
    const database = await getDatabase();
    const now = new Date().toISOString();
    const vehicleId = await resolveVehicleId(database, req.body?.vehicleId);
    const type = req.body?.type || "battery_low";
    const severity = req.body?.severity || "medium";
    const description =
      req.body?.description || "Nivel de bateria bajo detectado en prueba de concepto.";
    const status = req.body?.status || "open";

    const reportInsert = await database.run(
      `INSERT INTO maintenance_reports (vehicle_id, type, severity, description, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vehicleId, type, severity, description, status, now]
    );

    const report = {
      id: reportInsert.lastID,
      vehicleId,
      vehicle_id: vehicleId,
      type,
      severity,
      description,
      status,
      created_at: now,
      timestamp: now
    };

    const event = await createEvent(database, {
      vehicleId,
      eventType: "maintenance.created",
      payload: report,
      createdAt: now
    });

    emitSocketEvent("maintenance:reported", report);
    emitSocketEvent("event:created", event);

    console.log(`[maintenance] reporte simulado creado para ${vehicleId}: ${type}`);

    res.status(201).json({ data: report });
  } catch (error) {
    next(error);
  }
});

async function resolveVehicleId(database, requestedVehicleId) {
  if (requestedVehicleId) {
    await ensureVehicleExists(database, requestedVehicleId);
    return requestedVehicleId;
  }

  const vehicle = await database.get("SELECT id FROM vehicles ORDER BY updated_at DESC, id ASC LIMIT 1");
  const vehicleId = vehicle?.id || "BUS-001";
  await ensureVehicleExists(database, vehicleId);
  return vehicleId;
}

async function ensureVehicleExists(database, vehicleId) {
  const now = new Date().toISOString();

  await database.run(
    `INSERT OR IGNORE INTO vehicles
      (id, name, type, plate, status, battery, current_lat, current_lng, speed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [vehicleId, vehicleId, "vehicle", null, "idle", 100, null, null, 0, now, now]
  );
}

async function createEvent(database, { vehicleId, eventType, payload, createdAt }) {
  const payloadJson = JSON.stringify(payload);
  const eventInsert = await database.run(
    `INSERT INTO events (vehicle_id, event_type, channel, topic, payload_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [vehicleId, eventType, "rest", null, payloadJson, createdAt]
  );

  return {
    id: eventInsert.lastID,
    vehicle_id: vehicleId,
    event_type: eventType,
    channel: "rest",
    topic: null,
    payload_json: payloadJson,
    payload,
    created_at: createdAt
  };
}

function normalizeMaintenance(report) {
  return {
    ...report,
    vehicleId: report.vehicle_id,
    timestamp: report.created_at
  };
}
