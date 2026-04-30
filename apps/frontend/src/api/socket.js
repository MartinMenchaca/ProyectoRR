import { io } from "socket.io-client";

const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL;

function resolveSocketUrl() {
  if (typeof window === "undefined") {
    return configuredSocketUrl || "http://localhost:3001";
  }

  const { protocol, hostname } = window.location;
  const localHostnames = ["localhost", "127.0.0.1", "::1"];
  const fallbackUrl = `${protocol}//${hostname}:3001`;

  if (!configuredSocketUrl) {
    return fallbackUrl;
  }

  try {
    const parsed = new URL(configuredSocketUrl);
    const configuredIsLocal = localHostnames.includes(parsed.hostname);
    const browserIsLocal = localHostnames.includes(hostname);

    if (configuredIsLocal && !browserIsLocal) {
      parsed.hostname = hostname;
      return parsed.toString().replace(/\/$/, "");
    }

    return configuredSocketUrl.replace(/\/$/, "");
  } catch {
    return fallbackUrl;
  }
}

export const SOCKET_URL = resolveSocketUrl();

export function createSocket() {
  return io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1200,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"]
  });
}
