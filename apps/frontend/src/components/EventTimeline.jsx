import { Radio, Server } from "lucide-react";

export default function EventTimeline({ events, loading = false, error = "" }) {
  return (
    <section className="timeline-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Logs de eventos</p>
          <h2>Actividad reciente</h2>
        </div>
        <Server size={20} />
      </div>

      <div className="timeline-list">
        {loading && events.length === 0 ? (
          <div className="timeline-skeleton">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {error ? <p className="empty-text">{error} Reintentando conexion...</p> : null}
        {!loading && !error && events.length === 0 ? <p className="empty-text">Sin eventos registrados.</p> : null}
        {events.slice(0, 12).map((event) => (
          <article className="timeline-event" key={event.id}>
            <div className="timeline-icon">
              <Radio size={15} />
            </div>
            <div>
              <div className="timeline-event__top">
                <strong>{event.event_type || "evento"}</strong>
                <time>{formatDate(event.created_at)}</time>
              </div>
              <p>
                {event.vehicle_id || "sistema"} - {event.channel || "n/d"}
              </p>
              {event.topic ? <code>{event.topic}</code> : null}
              <small>{summarizePayload(event.payload)}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function summarizePayload(payload) {
  if (!payload) return "Sin payload disponible.";

  const parts = [];
  if (payload.status) parts.push(`estado ${payload.status}`);
  if (payload.speed !== undefined) parts.push(`${payload.speed} km/h`);
  if (payload.battery !== undefined) parts.push(`bateria ${payload.battery}%`);
  if (payload.type) parts.push(payload.type);
  if (payload.description) parts.push(payload.description);

  return parts.length ? parts.join(" - ") : JSON.stringify(payload).slice(0, 120);
}

function formatDate(value) {
  if (!value) return "n/d";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "n/d" : date.toLocaleTimeString("es-MX");
}
