import { CreditCard } from "lucide-react";

export default function PaymentsPanel({ payments, loading, error }) {
  return (
    <section className="operations-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Pagos recientes</p>
          <h2>Transacciones simuladas</h2>
        </div>
        <CreditCard size={20} />
      </div>

      <div className="operations-list">
        {loading && payments.length === 0 ? <SkeletonRows /> : null}
        {error ? <p className="empty-text">{error}</p> : null}
        {!loading && !error && payments.length === 0 ? (
          <p className="empty-text">Aun no hay pagos simulados.</p>
        ) : null}

        {payments.slice(0, 8).map((payment) => (
          <article className="operation-item" key={payment.id || `${payment.vehicleId}-${payment.timestamp}`}>
            <div>
              <strong>{payment.vehicleId || payment.vehicle_id || "n/d"}</strong>
              <span>{payment.passengerName || payment.passenger_name || "Usuario demo"}</span>
            </div>
            <div>
              <strong>{formatCurrency(payment.amount)}</strong>
              <span>{payment.method || "card"} - {payment.status || "completed"}</span>
            </div>
            <time>{formatDate(payment.timestamp || payment.created_at)}</time>
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

function formatCurrency(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : "$0.00";
}

function formatDate(value) {
  if (!value) return "n/d";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "n/d" : date.toLocaleTimeString("es-MX");
}
