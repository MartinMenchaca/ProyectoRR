import { Server } from "socket.io";
import { corsOptions } from "../config/cors.js";

let io;
let connectedClients = 0;

export function initializeSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: corsOptions
  });

  io.on("connection", (socket) => {
    connectedClients += 1;
    console.log(`[websocket] cliente conectado: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      connectedClients = Math.max(0, connectedClients - 1);
      console.log(`[websocket] cliente desconectado: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function emitSocketEvent(eventName, payload) {
  if (!io) return;

  io.emit(eventName, payload);
  console.log(`[websocket] evento emitido ${eventName}`);
}

export function getSocketState() {
  return {
    enabled: Boolean(io),
    connectedClients
  };
}
