import { Router } from "express";
import { getDatabase } from "../db/database.js";
import { emitSocketEvent } from "../sockets/socketServer.js";

export const paymentsRouter = Router();

paymentsRouter.get("/payments", async (_req, res, next) => {
  try {
    const database = await getDatabase();
    const payments = await database.all(
      `SELECT id, vehicle_id, passenger_name, amount, method, status, created_at
       FROM payments
       ORDER BY created_at DESC, id DESC
       LIMIT 50`
    );

    res.json({ data: payments.map(normalizePayment) });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post("/payments/simulate", async (req, res, next) => {
  try {
    const database = await getDatabase();
    const now = new Date().toISOString();
    const vehicleId = await resolveVehicleId(database, req.body?.vehicleId);
    const amount = getAmount(req.body?.amount);
    const method = req.body?.method || "card";
    const passengerName = req.body?.passengerName || "Usuario demo";
    const status = "completed";

    const paymentInsert = await database.run(
      `INSERT INTO payments (vehicle_id, passenger_name, amount, method, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vehicleId, passengerName, amount, method, status, now]
    );

    const payment = {
      id: paymentInsert.lastID,
      vehicleId,
      vehicle_id: vehicleId,
      passengerName,
      passenger_name: passengerName,
      amount,
      method,
      status,
      created_at: now,
      timestamp: now
    };

    const event = await createEvent(database, {
      vehicleId,
      eventType: "payment.created",
      payload: payment,
      createdAt: now
    });

    emitSocketEvent("payment:created", payment);
    emitSocketEvent("event:created", event);

    console.log(`[payments] pago simulado creado para ${vehicleId}: $${amount}`);

    res.status(201).json({ data: payment });
  } catch (error) {
    next(error);
  }
});

function getAmount(value) {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && numericValue > 0) {
    return Number(numericValue.toFixed(2));
  }

  return Number((14 + Math.random() * 18).toFixed(2));
}

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

function normalizePayment(payment) {
  return {
    ...payment,
    vehicleId: payment.vehicle_id,
    passengerName: payment.passenger_name,
    timestamp: payment.created_at
  };
}
