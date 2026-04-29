import { Database, RadioTower, RefreshCw, Server } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

export default function SystemStatus({ health, error, loadErrors = {}, loading, lastRefresh }) {
  const backendActive = health?.status === "ok" && !error;
  const databaseActive = Boolean(health?.database?.connected);
  const mqttActive = Boolean(health?.mqtt?.connected);

  return (
    <section className="system-card">
      <div className="system-card__header">
        <div>
          <p className="section-kicker">Estado de comunicaciones</p>
          <h2>Centro operativo</h2>
        </div>
        <div className="refresh-pill">
          <RefreshCw size={14} />
          {loading ? "Cargando..." : lastRefresh ? lastRefresh.toLocaleTimeString("es-MX") : "Sin lectura"}
        </div>
      </div>

      <div className="status-grid">
        <StatusItem icon={Server} label="REST activo" active={backendActive} />
        <StatusItem icon={Server} label="Backend activo" active={backendActive} />
        <StatusItem icon={Database} label="Base de datos activa" active={databaseActive} />
        <StatusItem icon={RadioTower} label="MQTT conectado" active={mqttActive} />
      </div>

      <div className="topic-strip">
        {(health?.mqtt?.subscribedTopics || []).map((topic) => (
          <span key={topic}>{topic}</span>
        ))}
      </div>

      {Object.keys(loadErrors).length ? (
        <div className="soft-warning">
          {Object.values(loadErrors).join(" ")} Reintentando conexion...
        </div>
      ) : null}
    </section>
  );
}

function StatusItem({ icon: Icon, label, active }) {
  return (
    <div className="status-item">
      <Icon size={17} />
      <StatusBadge label={label} active={active} />
    </div>
  );
}
