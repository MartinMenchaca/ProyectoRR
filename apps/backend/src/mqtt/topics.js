export const subscribedTopics = [
  "movilidad/vehicles/+/telemetry",
  "movilidad/vehicles/+/maintenance",
  "movilidad/alerts/operator"
];

export function parseVehicleTopic(topic) {
  const parts = topic.split("/");

  if (parts.length !== 4) {
    return { vehicleId: null, messageType: null };
  }

  const [domain, resource, vehicleId, messageType] = parts;

  if (domain !== "movilidad" || resource !== "vehicles") {
    return { vehicleId: null, messageType: null };
  }

  return { vehicleId, messageType };
}
