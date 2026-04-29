export default function StatusBadge({ label, active, tone = "green" }) {
  const className = active ? `status-badge is-${tone}` : "status-badge is-muted";

  return (
    <span className={className}>
      <span className="status-dot" />
      {label}
    </span>
  );
}
