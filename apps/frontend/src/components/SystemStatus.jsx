import { Database, Hash, RadioTower, Server } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

export default function SystemStatus({
  health,
  error,
  loadErrors = {},
  loading,
  lastRefresh,
  socketStatus = "disconnected",
  socketUrl = ""
}) {
  const backendActive = health?.status === "ok" && !error;
  const databaseActive = Boolean(health?.database?.connected);
  const mqttActive = Boolean(health?.mqtt?.connected);
  const topicCount = health?.mqtt?.subscribedTopics?.length ?? 0;
  const socketActive = socketStatus === "connected";

  const hasErrors = Object.keys(loadErrors).length > 0;

  return (
    <section className="system-card">
      <div className="system-card__header">
        <div>
          <p className="section-kicker">Estado de comunicaciones</p>
          <h2>Centro operativo</h2>
        </div>
        <div className={`refresh-pill ${loading ? "is-loading" : ""}`}>
          <span className={`refresh-dot ${backendActive ? "is-online" : "is-offline"}`} />
          {loading ? "Conectando..." : lastRefresh ? lastRefresh.toLocaleTimeString("es-MX") : "Sin lectura"}
        </div>
      </div>

      <div className="status-grid">
        <StatusItem icon={Server} label="API REST" sublabel="Express" active={backendActive} />
        <StatusItem icon={Database} label="Base de datos" sublabel="SQLite" active={databaseActive} />
        <StatusItem icon={RadioTower} label="MQTT Broker" sublabel="Aedes" active={mqttActive} />
        <StatusItem icon={Hash} label="Topics activos" sublabel={`${topicCount} suscritos`} active={topicCount > 0} />
        <StatusItem
          icon={RadioTower}
          label="WebSocket"
          sublabel={getSocketLabel(socketStatus)}
          active={socketActive}
          tone="blue"
        />
      </div>

      {((health?.mqtt?.subscribedTopics ?? []).length > 0 || socketUrl) && (
        <div className="topic-strip">
          {(health?.mqtt?.subscribedTopics ?? []).map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
          {socketUrl ? <span>Socket.IO {socketUrl}</span> : null}
          {health?.websocket ? <span>{health.websocket.connectedClients} clientes WebSocket</span> : null}
        </div>
      )}

      {hasErrors && (
        <div className="soft-warning">
          {Object.values(loadErrors).join(" ")}
          {" "}Reintentando conexion cada 2s...
        </div>
      )}
    </section>
  );
}

function StatusItem({ icon: Icon, label, sublabel, active, tone = "green" }) {
  return (
    <div className={`status-item ${active ? "is-active" : ""}`}>
      <Icon size={16} />
      <div style={{ minWidth: 0 }}>
        <StatusBadge label={label} active={active} tone={tone} />
        {sublabel && <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "2px" }}>{sublabel}</div>}
      </div>
    </div>
  );
}

function getSocketLabel(status) {
  if (status === "connected") return "conectado";
  if (status === "reconnecting") return "reconectando";
  if (status === "connecting") return "conectando";
  return "desconectado";
}
