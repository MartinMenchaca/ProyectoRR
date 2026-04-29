import { Router } from "express";
import { getDatabase } from "../db/database.js";

export const eventsRouter = Router();

eventsRouter.get("/events", async (_req, res, next) => {
  try {
    const database = await getDatabase();
    const events = await database.all(
      `SELECT id, vehicle_id, event_type, channel, topic, payload_json, created_at
       FROM events
       ORDER BY created_at DESC, id DESC
       LIMIT 100`
    );

    res.json({
      data: events.map((event) => ({
        ...event,
        payload: JSON.parse(event.payload_json)
      }))
    });
  } catch (error) {
    next(error);
  }
});
