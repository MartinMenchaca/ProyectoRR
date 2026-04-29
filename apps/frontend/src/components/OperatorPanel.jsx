export default function OperatorPanel({ vehicles, selectedVehicleId }) {
  return (
    <section className="operator-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Panel de operador</p>
          <h2>Vehiculos activos</h2>
        </div>
      </div>

      <div className="operator-table">
        <div className="operator-row operator-row--head">
          <span>ID</span>
          <span>Tipo</span>
          <span>Estado</span>
          <span>Bateria</span>
          <span>Velocidad</span>
          <span>Actualizacion</span>
          <span>Coordenadas</span>
        </div>

        {vehicles.length === 0 ? (
          <div className="operator-empty">No hay vehiculos reportando.</div>
        ) : null}

        {vehicles.map((vehicle) => (
          <div
            className={`operator-row ${vehicle.id === selectedVehicleId ? "is-selected" : ""}`}
            key={vehicle.id}
          >
            <strong>{vehicle.id}</strong>
            <span>{vehicle.type || "n/d"}</span>
            <span>{vehicle.status || "n/d"}</span>
            <span>{formatPercent(vehicle.battery)}</span>
            <span>{formatSpeed(vehicle.speed)}</span>
            <span>{formatDate(vehicle.updated_at)}</span>
            <span>{formatCoordinates(vehicle)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatPercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number)}%` : "n/d";
}

function formatSpeed(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number)} km/h` : "n/d";
}

function formatDate(value) {
  if (!value) return "n/d";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "n/d" : date.toLocaleTimeString("es-MX");
}

function formatCoordinates(vehicle) {
  const lat = Number(vehicle.current_lat);
  const lng = Number(vehicle.current_lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "n/d";
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
