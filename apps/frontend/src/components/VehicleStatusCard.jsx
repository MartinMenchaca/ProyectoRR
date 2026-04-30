import { Battery, CreditCard, Gauge, Navigation, Signal, Wrench } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

export default function VehicleStatusCard({
  vehicle,
  actionState,
  onSimulatePayment,
  onSimulateMaintenance
}) {
  if (!vehicle) {
    return (
      <section className="vehicle-card empty-card">
        <p className="section-kicker">Vehiculo activo</p>
        <h2>Sin datos disponibles</h2>
        <p>El backend no ha recibido telemetria de ningun vehiculo.</p>
      </section>
    );
  }

  const battery = Number(vehicle.battery || 0);
  const speed = Number(vehicle.speed || 0);

  return (
    <section className="vehicle-card">
      <div className="vehicle-card__top">
        <div>
          <p className="section-kicker">Vehiculo activo</p>
          <h2>{vehicle.id}</h2>
          <p>{vehicle.name || "Unidad sin nombre"}</p>
        </div>
        <StatusBadge label={isOnline(vehicle) ? "Online" : "Offline"} active={isOnline(vehicle)} />
      </div>

      <div className="metric-ring">
        <div>
          <span>{Math.round(speed)}</span>
          <small>km/h</small>
        </div>
      </div>

      <div className="vehicle-meta">
        <Meta icon={Navigation} label="Tipo" value={vehicle.type || "n/d"} />
        <Meta icon={Signal} label="Estado" value={vehicle.status || "n/d"} />
        <Meta icon={Gauge} label="ETA" value={getEta(speed)} />
        <Meta icon={Battery} label="Distancia" value={getDistance(vehicle)} />
      </div>

      <div className="battery-track">
        <div className="battery-track__label">
          <span>Bateria</span>
          <strong>{Math.round(battery)}%</strong>
        </div>
        <div className="battery-bar">
          <span style={{ width: `${Math.max(0, Math.min(100, battery))}%` }} />
        </div>
      </div>

      <dl className="coordinate-list">
        <div>
          <dt>Latitud</dt>
          <dd>{formatCoordinate(vehicle.current_lat)}</dd>
        </div>
        <div>
          <dt>Longitud</dt>
          <dd>{formatCoordinate(vehicle.current_lng)}</dd>
        </div>
        <div>
          <dt>Ultima actualizacion</dt>
          <dd>{formatDate(vehicle.updated_at)}</dd>
        </div>
      </dl>

      <div className="vehicle-action-row">
        <button
          type="button"
          onClick={onSimulatePayment}
          disabled={actionState?.status === "loading"}
        >
          <CreditCard size={17} />
          {actionState?.type === "payment" && actionState?.status === "loading"
            ? "Procesando..."
            : "Simular pago"}
        </button>
        <button
          type="button"
          onClick={onSimulateMaintenance}
          disabled={actionState?.status === "loading"}
        >
          <Wrench size={17} />
          {actionState?.type === "maintenance" && actionState?.status === "loading"
            ? "Procesando..."
            : "Reportar mantenimiento"}
        </button>
      </div>

      {actionState?.message ? (
        <p className={`action-feedback is-${actionState.status}`}>{actionState.message}</p>
      ) : null}
    </section>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="meta-item">
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function isOnline(vehicle) {
  if (!vehicle?.updated_at) return false;
  const updatedAt = new Date(vehicle.updated_at).getTime();
  return Number.isFinite(updatedAt) && Date.now() - updatedAt < 15000;
}

function getEta(speed) {
  if (!speed) return "Calculando";
  const minutes = Math.max(2, Math.round(18 - Math.min(speed, 60) / 5));
  return `${minutes} min`;
}

function getDistance(vehicle) {
  const speed = Number(vehicle.speed || 0);
  const distance = Math.max(0.6, speed / 18).toFixed(1);
  return `${distance} km`;
}

function formatCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(5) : "n/d";
}

function formatDate(value) {
  if (!value) return "n/d";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "n/d" : date.toLocaleTimeString("es-MX");
}
