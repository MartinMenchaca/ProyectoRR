import { Wrench } from "lucide-react";

export default function MaintenancePanel({ reports, loading, error }) {
  return (
    <section className="operations-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Mantenimiento</p>
          <h2>Reportes operativos</h2>
        </div>
        <Wrench size={20} />
      </div>

      <div className="operations-list">
        {loading && reports.length === 0 ? <SkeletonRows /> : null}
        {error ? <p className="empty-text">{error}</p> : null}
        {!loading && !error && reports.length === 0 ? (
          <p className="empty-text">Sin reportes de mantenimiento.</p>
        ) : null}

        {reports.slice(0, 8).map((report) => (
          <article className="operation-item operation-item--maintenance" key={report.id || `${report.vehicleId}-${report.timestamp}`}>
            <div>
              <strong>{report.vehicleId || report.vehicle_id || "n/d"}</strong>
              <span>{report.type || "preventive_check"}</span>
            </div>
            <div>
              <strong>{report.severity || "medium"}</strong>
              <span>{report.status || "open"}</span>
            </div>
            <p>{report.description || "Reporte simulado de mantenimiento."}</p>
            <time>{formatDate(report.timestamp || report.created_at)}</time>
          </article>
        ))}
      </div>
    </section>
  );
}

function SkeletonRows() {
  return (
    <div className="timeline-skeleton">
      <span />
      <span />
    </div>
  );
}

function formatDate(value) {
  if (!value) return "n/d";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "n/d" : date.toLocaleTimeString("es-MX");
}
