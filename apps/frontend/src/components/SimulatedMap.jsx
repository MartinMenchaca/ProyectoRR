import { useEffect, useState } from "react";
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
  loading = false
}) {
  const [actionMessage, setActionMessage] = useState("");
  const [mapTime, setMapTime] = useState(() => Date.now());
  const [sheetExpanded, setSheetExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 760;
  });

  useEffect(() => {
    let frameId;
    let lastUpdate = 0;

    function tick(now) {
      if (now - lastUpdate > 50) {
        setMapTime(Date.now());
        lastUpdate = now;
      }

      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  function handlePreparedAction(type) {
    const label = type === "payment" ? "Pago simulado" : "Reporte de mantenimiento";
    setActionMessage(`${label} preparado para la siguiente fase.`);
    window.setTimeout(() => setActionMessage(""), 2600);
  }

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
            </defs>

            <g className="urban-blocks">
              {cityBlocks.map((block, index) => (
                <rect key={index} x={block.x} y={block.y} width={block.width} height={block.height} rx="1.4" />
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
                  <circle className="landmark-dot" r="1.25" />
                  <text className="landmark-label" x="2.2" y="0.9">
                    {landmark.name}
                  </text>
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
          </svg>

          {vehicles.map((vehicle) => {
            const route = vehicleRoutes[vehicle.id];
            if (!route) return null;

            const position = getRouteSample(route, mapTime + getVehicleOffset(vehicle.id));
            return (
              <VehicleMarker
                key={vehicle.id}
                vehicle={vehicle}
                position={position}
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
                  <button type="button" onClick={() => handlePreparedAction("payment")}>
                    <CreditCard size={17} />
                    Simular pago
                  </button>
                  <button type="button" onClick={() => handlePreparedAction("maintenance")}>
                    <Wrench size={17} />
                    Reportar mantenimiento
                  </button>
                </div>
                {actionMessage ? <p className="sheet-message">{actionMessage}</p> : null}
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
