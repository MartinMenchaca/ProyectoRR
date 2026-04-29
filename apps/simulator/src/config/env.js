import "dotenv/config";

export const env = {
  mqttUrl: process.env.MQTT_URL || "mqtt://localhost:1883",
  publishIntervalMs: Number(process.env.SIMULATOR_INTERVAL_MS || 1800)
};
