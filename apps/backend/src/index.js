import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { initializeDatabase } from "./db/database.js";
import { healthRouter } from "./routes/health.routes.js";
import { vehiclesRouter } from "./routes/vehicles.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { startMqttClient } from "./mqtt/mqttClient.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", vehiclesRouter);
app.use("/api", eventsRouter);

app.use((error, _req, res, _next) => {
  console.error("[backend] error:", error);
  res.status(500).json({
    error: "internal_server_error",
    message: "Ocurrio un error interno en el backend."
  });
});

await initializeDatabase();
startMqttClient();

app.listen(env.port, env.host, () => {
  console.log(`[backend] HTTP escuchando en http://${env.host}:${env.port}`);
  console.log(`[backend] SQLite en ${env.databaseFile}`);
  console.log(`[backend] MQTT configurado en ${env.mqttUrl}`);
});
