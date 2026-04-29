import { Router } from "express";
import { getDatabase } from "../db/database.js";

export const vehiclesRouter = Router();

vehiclesRouter.get("/vehicles", async (_req, res, next) => {
  try {
    const database = await getDatabase();
    const vehicles = await database.all(
      `SELECT id, name, type, plate, status, battery, current_lat, current_lng, speed, created_at, updated_at
       FROM vehicles
       ORDER BY id ASC`
    );

    res.json({ data: vehicles });
  } catch (error) {
    next(error);
  }
});
