import express from "express";
import cors from "cors";
import http from "node:http";
import { env } from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import { initializeDatabase } from "./db/database.js";
import { healthRouter } from "./routes/health.routes.js";
import { vehiclesRouter } from "./routes/vehicles.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { startMqttClient } from "./mqtt/mqttClient.js";
import { initializeSocketServer } from "./sockets/socketServer.js";

const app = express();
const httpServer = http.createServer(app);

app.use(cors(corsOptions));
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
initializeSocketServer(httpServer);
startMqttClient();

httpServer.listen(env.port, env.host, () => {
  console.log(`[backend] HTTP escuchando en http://${env.host}:${env.port}`);
  console.log(`[backend] SQLite en ${env.databaseFile}`);
  console.log(`[backend] MQTT configurado en ${env.mqttUrl}`);
  console.log("[backend] WebSocket Socket.IO habilitado");
});
