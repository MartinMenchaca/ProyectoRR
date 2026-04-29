import "dotenv/config";
import aedes from "aedes";
import net from "node:net";

const broker = aedes();
const host = process.env.MQTT_HOST || "localhost";
const port = Number(process.env.MQTT_PORT || 1883);

const server = net.createServer(broker.handle);

broker.on("client", (client) => {
  console.log(`[broker] cliente conectado: ${client?.id}`);
});

broker.on("clientDisconnect", (client) => {
  console.log(`[broker] cliente desconectado: ${client?.id}`);
});

broker.on("publish", (packet, client) => {
  if (!client) return;
  console.log(`[broker] publish ${packet.topic} desde ${client.id}`);
});

server.listen(port, host, () => {
  console.log(`[broker] MQTT escuchando en mqtt://${host}:${port}`);
});

const shutdown = () => {
  console.log("[broker] cerrando servicio MQTT...");
  server.close(() => broker.close());
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
