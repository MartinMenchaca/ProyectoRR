import { AlertTriangle, RefreshCw } from "lucide-react";

export default function MobileShell({ title, subtitle, error, onRetry, children }) {
  return (
    <main className="app-screen">
      <div className="ambient-grid" />
      <div className="mobile-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">POC · Sistemas Distribuidos · ITSON</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="header-right">
            <div className="header-live-badge">
              <span className="live-dot" />
              LIVE
            </div>
          </div>
        </header>

        {error ? (
          <div className="error-banner" role="alert">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>{error}</span>
            {onRetry ? (
              <button type="button" onClick={onRetry} className="error-retry-btn">
                <RefreshCw size={14} />
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
