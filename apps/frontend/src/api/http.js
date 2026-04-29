const configuredApiUrl = import.meta.env.VITE_API_URL;

function resolveApiUrl() {
  if (typeof window === "undefined") {
    return configuredApiUrl || "http://localhost:3001/api";
  }

  const { protocol, hostname } = window.location;
  const localHostnames = ["localhost", "127.0.0.1", "::1"];
  const fallbackUrl = `${protocol}//${hostname}:3001/api`;

  if (!configuredApiUrl) {
    return fallbackUrl;
  }

  try {
    const parsed = new URL(configuredApiUrl);
    const configuredIsLocal = localHostnames.includes(parsed.hostname);
    const browserIsLocal = localHostnames.includes(hostname);

    if (configuredIsLocal && !browserIsLocal) {
      parsed.hostname = hostname;
      return parsed.toString().replace(/\/$/, "");
    }

    return configuredApiUrl.replace(/\/$/, "");
  } catch {
    return fallbackUrl;
  }
}

const API_URL = resolveApiUrl();

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al consultar ${path}`);
  }

  return response.json();
}

export async function getHealth() {
  return request("/health");
}

export async function getVehicles() {
  const result = await request("/vehicles");
  return result.data || [];
}

export async function getEvents() {
  const result = await request("/events");
  return result.data || [];
}

export { API_URL };
