import mqtt from "mqtt";
import { env } from "../config/env.js";
import { processMqttMessage } from "./messageProcessor.js";
import { subscribedTopics } from "./topics.js";

const mqttState = {
  connected: false,
  subscribedTopics
};

export function getMqttState() {
  return {
    connected: mqttState.connected,
    mqttUrl: env.mqttUrl,
    subscribedTopics: mqttState.subscribedTopics
  };
}

export function startMqttClient() {
  const client = mqtt.connect(env.mqttUrl, {
    clientId: `movilidad-backend-${Date.now()}`,
    reconnectPeriod: 2000
  });

  client.on("connect", () => {
    mqttState.connected = true;
    console.log(`[mqtt] conectado a broker MQTT: ${env.mqttUrl}`);

    for (const topic of subscribedTopics) {
      client.subscribe(topic, (error) => {
        if (error) {
          console.error(`[mqtt] error al suscribirse a ${topic}:`, error.message);
          return;
        }

        console.log(`[mqtt] suscrito a ${topic}`);
      });
    }
  });

  client.on("reconnect", () => {
    console.log("[mqtt] intentando reconectar al broker MQTT...");
  });

  client.on("close", () => {
    mqttState.connected = false;
    console.log("[mqtt] conexion con broker MQTT cerrada.");
  });

  client.on("error", (error) => {
    mqttState.connected = false;
    console.error("[mqtt] error de conexion:", error.message);
  });

  client.on("message", async (topic, message) => {
    try {
      await processMqttMessage(topic, message);
    } catch (error) {
      console.error(`[mqtt] error procesando mensaje en ${topic}:`, error);
    }
  });

  return client;
}
