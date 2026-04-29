import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");

const databaseFile = process.env.DATABASE_FILE || "../../data/movilidad.sqlite";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  host: process.env.BACKEND_HOST || "localhost",
  port: Number(process.env.BACKEND_PORT || 3001),
  databaseFile: path.resolve(backendRoot, databaseFile),
  mqttUrl: process.env.MQTT_URL || "mqtt://localhost:1883"
};
