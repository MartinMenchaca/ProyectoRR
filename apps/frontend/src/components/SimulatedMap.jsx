import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, CreditCard, MapPin, Wrench } from "lucide-react";
import VehicleMarker from "./VehicleMarker.jsx";
import {
  cityBlocks,
  intersections,
  landmarks,
  roads,
  trafficLights
} from "./map/cityMapConfig.js";
import { vehicleRoutes } from "./map/routesConfig.js";
import { getRouteSample, pointsToPath } from "./map/mapUtils.js";

export default function SimulatedMap({
  vehicles,
  selectedVehicle,
  selectedVehicleId,
  onSelectVehicle,
  loading = false,
  actionState,
  onSimulatePayment,
  onSimulateMaintenance
}) {
  const [sheetExpanded, setSheetExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 760;
  });

  // Vehicle DOM refs are updated at 60fps without React re-renders.
  const vehiclePositionRefs = useRef({});

  // 60fps animation loop: writes positions directly to DOM
  useEffect(() => {
    if (vehicles.length === 0) return;

    let frameId;

    function tick() {
      const now = Date.now();

      vehicles.forEach((vehicle) => {
        const route = vehicleRoutes[vehicle.id];
        const el = vehiclePositionRefs.current[vehicle.id];
        if (!route || !el) return;

        const pos = getRouteSample(route, now + getVehicleOffset(vehicle.id));
        el.style.left = `${pos.x}%`;
        el.style.top = `${pos.y}%`;
        el.style.setProperty("--vehicle-angle", `${pos.angle}deg`);
      });

      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [vehicles]);

  return (
    <section className="map-card">
      <div className="map-card__header">
        <div>
          <p className="section-kicker">Mapa simulado</p>
          <h2>Red urbana operativa</h2>
        </div>
        <span className="map-chip">
          <MapPin size={14} />
          Distrito Centro
        </span>
      </div>

      <div className="map-stage">
        <div className="map-canvas">
          <svg viewBox="0 0 100 100" className="map-svg" aria-hidden="true">
            <defs>
              <linearGradient id="busRoute" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="taxiRoute" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="scooterRoute" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <filter id="glowSoft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* City zone fills */}
            <g className="zone-fills">
              <rect x="51" y="23" width="28" height="44" rx="1.5" fill="rgba(59,130,246,0.045)" />
              <rect x="22" y="46" width="27" height="21" rx="1.5" fill="rgba(16,185,129,0.04)" />
              <rect x="22" y="23" width="27" height="22" rx="1.5" fill="rgba(245,158,11,0.03)" />
              {/* Park / green area */}
              <rect x="36" y="70" width="12" height="8" rx="2" fill="rgba(16,185,129,0.1)" />
              <rect x="36.5" y="70.5" width="11" height="7" rx="1.5" fill="none" stroke="rgba(16,185,129,0.22)" strokeWidth="0.3" />
            </g>

            <g className="urban-blocks">
              {cityBlocks.map((block, index) => (
                <rect key={index} x={block.x} y={block.y} width={block.width} height={block.height} rx="1.4" />
              ))}
            </g>

            {/* Primary road halos for depth */}
            <g className="road-halos">
              {roads
                .filter((r) => r.type === "primary")
                .map((road) => (
                  <line
                    key={`halo-${road.id}`}
                    x1={road.from.x}
                    y1={road.from.y}
                    x2={road.to.x}
                    y2={road.to.y}
                    stroke="rgba(148,163,184,0.06)"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                ))}
            </g>

            <g className="roads-layer">
              {roads.map((road) => (
                <line
                  key={road.id}
                  className={`road-line road-line--${road.type}`}
                  x1={road.from.x}
                  y1={road.from.y}
                  x2={road.to.x}
                  y2={road.to.y}
                />
              ))}
            </g>

            {/* Center dashes on primary roads */}
            <g className="road-center-lines" opacity="0.28">
              {roads
                .filter((r) => r.type === "primary")
                .map((road) => (
                  <line
                    key={`center-${road.id}`}
                    x1={road.from.x}
                    y1={road.from.y}
                    x2={road.to.x}
                    y2={road.to.y}
                    stroke="rgba(226,232,240,0.6)"
                    strokeWidth="0.4"
                    strokeDasharray="2 2.5"
                    strokeLinecap="round"
                  />
                ))}
            </g>

            <g className="intersections-layer">
              {intersections.map((intersection) => (
                <circle key={intersection.id} className="intersection-node" cx={intersection.x} cy={intersection.y} r="1.35" />
              ))}
            </g>

            <g className="route-layer">
              {Object.entries(vehicleRoutes).map(([vehicleId, route]) => (
                <path
                  key={vehicleId}
                  className={`vehicle-route ${vehicleId === selectedVehicleId ? "is-active" : ""}`}
                  d={pointsToPath(route.points)}
                  style={{ "--route-color": route.color }}
                />
              ))}
            </g>

            <g className="traffic-layer">
              {trafficLights.map((light) => (
                <g key={light.id} className={`traffic-light phase-${light.phase}`} transform={`translate(${light.x} ${light.y})`}>
                  <line x1="0" y1="3.2" x2="0" y2="5.8" stroke="rgba(148,163,184,0.55)" strokeWidth="0.35" strokeLinecap="round" />
                  <circle cx="0" cy="5.8" r="0.4" fill="rgba(148,163,184,0.45)" />
                  <rect x="-1.25" y="-3.2" width="2.5" height="6.4" rx="0.8" />
                  <circle className="light-red" cx="0" cy="-1.9" r="0.55" />
                  <circle className="light-yellow" cx="0" cy="0" r="0.55" />
                  <circle className="light-green" cx="0" cy="1.9" r="0.55" />
                </g>
              ))}
            </g>

            <g className="landmark-layer">
              {landmarks.map((landmark) => (
                <g key={landmark.id} transform={`translate(${landmark.x} ${landmark.y})`}>
                  <circle r="1.6" fill="rgba(59,130,246,0.18)" stroke="rgba(59,130,246,0.55)" strokeWidth="0.45" />
                  <circle r="0.7" fill="rgba(255,255,255,0.9)" />
                  <text className="landmark-label" x="2.4" y="0.9">{landmark.name}</text>
                </g>
              ))}
            </g>

            <g className="road-label-layer">
              {roads
                .filter((road) => road.label)
                .map((road) => (
                  <text
                    key={road.id}
                    className={`road-label road-label--${road.orientation}`}
                    x={road.label.x}
                    y={road.label.y}
                    transform={road.orientation === "vertical" ? `rotate(90 ${road.label.x} ${road.label.y})` : undefined}
                  >
                    {road.name}
                  </text>
                ))}
            </g>

            {/* Park label */}
            <text x="42" y="74.8" fill="rgba(16,185,129,0.65)" fontSize="1.8" fontWeight="700" textAnchor="middle">
              Parque Central
            </text>

            {/* Compass rose */}
            <g transform="translate(91,88)">
              <text fill="rgba(255,255,255,0.45)" fontSize="2" textAnchor="middle" fontWeight="900" y="-0.5">N</text>
              <line x1="0" y1="1" x2="0" y2="3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.35" strokeLinecap="round" />
              <polygon points="0,-0.5 0.7,0.8 0,0.4 -0.7,0.8" fill="rgba(255,255,255,0.6)" />
            </g>

            {/* Scale bar */}
            <g transform="translate(10,91)">
              <line x1="0" y1="0" x2="8" y2="0" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" />
              <line x1="0" y1="-0.8" x2="0" y2="0.8" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" />
              <line x1="8" y1="-0.8" x2="8" y2="0.8" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" />
              <text x="4" y="-1.2" fill="rgba(255,255,255,0.38)" fontSize="1.5" textAnchor="middle" fontWeight="700">500m</text>
            </g>
          </svg>

          {/* Vehicle marker positions are updated at 60fps via DOM refs. */}
          {vehicles.map((vehicle) => {
            const route = vehicleRoutes[vehicle.id];
            if (!route) return null;

            const initialPos = getRouteSample(route, Date.now() + getVehicleOffset(vehicle.id));

            return (
              <VehicleMarker
                key={vehicle.id}
                ref={(el) => { vehiclePositionRefs.current[vehicle.id] = el; }}
                vehicle={vehicle}
                initialPosition={initialPos}
                selected={vehicle.id === selectedVehicleId}
                onSelect={onSelectVehicle}
              />
            );
          })}
        </div>

        {loading && vehicles.length === 0 ? (
          <div className="map-loading">
            <span />
            Cargando telemetria urbana...
          </div>
        ) : null}

        {!loading && vehicles.length === 0 ? (
          <div className="empty-map">Sin vehiculos reportando telemetria.</div>
        ) : null}

        <div className={`map-bottom-sheet ${sheetExpanded ? "is-expanded" : "is-collapsed"}`}>
          {selectedVehicle ? (
            sheetExpanded ? (
              <>
                <button
                  className="sheet-collapse-button"
                  type="button"
                  onClick={() => setSheetExpanded(false)}
                  aria-label="Minimizar detalles del vehiculo"
                >
                  <span className="sheet-handle" />
                  <span>Minimizar</span>
                  <ChevronDown size={16} />
                </button>
                <div className="sheet-main">
                  <div>
                    <p className="section-kicker">Unidad en seguimiento</p>
                    <h3>{selectedVehicle.id}</h3>
                    <span>{selectedVehicle.name || selectedVehicle.type || "Vehiculo"}</span>
                  </div>
                  <div className="sheet-speed">
                    <strong>{Math.round(Number(selectedVehicle.speed || 0))}</strong>
                    <span>km/h</span>
                  </div>
                </div>
                <div className="sheet-stats">
                  <span>{selectedVehicle.status || "n/d"}</span>
                  <span>{Math.round(Number(selectedVehicle.battery || 0))}% bateria</span>
                  <span>{formatTime(selectedVehicle.updated_at)}</span>
                </div>
                <div className="sheet-actions">
                  <button
                    type="button"
                    onClick={() => onSimulatePayment(selectedVehicle.id)}
                    disabled={actionState?.status === "loading"}
                  >
                    <CreditCard size={17} />
                    {actionState?.type === "payment" && actionState?.status === "loading"
                      ? "Procesando..."
                      : "Simular pago"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSimulateMaintenance(selectedVehicle.id)}
                    disabled={actionState?.status === "loading"}
                  >
                    <Wrench size={17} />
                    {actionState?.type === "maintenance" && actionState?.status === "loading"
                      ? "Procesando..."
                      : "Reportar mantenimiento"}
                  </button>
                </div>
                {actionState?.message ? (
                  <p className={`sheet-message is-${actionState.status}`}>{actionState.message}</p>
                ) : null}
              </>
            ) : (
              <button
                className="sheet-compact-button"
                type="button"
                onClick={() => setSheetExpanded(true)}
                aria-label="Desplegar detalles del vehiculo"
              >
                <span className="compact-status-dot" />
                <span className="compact-vehicle">
                  <strong>{selectedVehicle.id}</strong>
                  <small>{selectedVehicle.status || "en ruta"} - tocar para ver detalles</small>
                </span>
                <span className="compact-speed">
                  {Math.round(Number(selectedVehicle.speed || 0))}
                  <small>km/h</small>
                </span>
                <ChevronUp size={17} />
              </button>
            )
          ) : sheetExpanded ? (
            <>
              <button
                className="sheet-collapse-button"
                type="button"
                onClick={() => setSheetExpanded(false)}
                aria-label="Minimizar controles del mapa"
              >
                <span className="sheet-handle" />
                <span>Minimizar</span>
                <ChevronDown size={16} />
              </button>
              <p className="empty-text">Esperando telemetria para activar controles.</p>
            </>
          ) : (
            <button
              className="sheet-compact-button"
              type="button"
              onClick={() => setSheetExpanded(true)}
              aria-label="Desplegar controles del mapa"
            >
              <span className="compact-status-dot is-muted" />
              <span className="compact-vehicle">
                <strong>Sin unidad</strong>
                <small>tocar para ver controles</small>
              </span>
              <ChevronUp size={17} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function getVehicleOffset(vehicleId) {
  if (vehicleId === "TAXI-001") return 5200;
  if (vehicleId === "SCOOTER-001") return 9100;
  return 0;
}

function formatTime(value) {
  if (!value) return "sin actualizacion";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "sin actualizacion" : date.toLocaleTimeString("es-MX");
}
