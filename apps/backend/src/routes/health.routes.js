import { Router } from "express";
import { env } from "../config/env.js";
import { getDatabase } from "../db/database.js";
import { getMqttState } from "../mqtt/mqttClient.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res, next) => {
  try {
    await getDatabase();
    const mqtt = getMqttState();

    res.json({
      status: "ok",
      service: "backend",
      database: {
        connected: true,
        file: env.databaseFile
      },
      mqtt: {
        connected: mqtt.connected,
        mqttUrl: mqtt.mqttUrl,
        subscribedTopics: mqtt.subscribedTopics
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});
