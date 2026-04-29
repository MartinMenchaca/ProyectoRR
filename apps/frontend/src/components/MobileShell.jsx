import { Activity, AlertTriangle } from "lucide-react";

export default function MobileShell({ title, subtitle, error, onRetry, children }) {
  return (
    <main className="app-screen">
      <div className="ambient-grid" />
      <div className="mobile-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">POC Sistemas Distribuidos</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="header-orbit" aria-hidden="true">
            <Activity size={22} />
          </div>
        </header>

        {error ? (
          <div className="error-banner">
            <AlertTriangle size={18} />
            <span>{error}</span>
            {onRetry ? (
              <button type="button" onClick={onRetry}>
                Reintentar
              </button>
            ) : null}
          </div>
        ) : null}

        {children}
      </div>
    </main>
  );
}
