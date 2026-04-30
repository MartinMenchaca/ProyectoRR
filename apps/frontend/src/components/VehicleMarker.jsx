import { forwardRef } from "react";

const vehicleColors = {
  bus: {
    glow: "rgba(16, 185, 129, 0.75)",
    trail: "rgba(16, 185, 129, 0.6)"
  },
  electric_taxi: {
    glow: "rgba(59, 130, 246, 0.75)",
    trail: "rgba(59, 130, 246, 0.6)"
  },
  scooter: {
    glow: "rgba(245, 158, 11, 0.75)",
    trail: "rgba(245, 158, 11, 0.6)"
  }
};

function BusVehicle() {
  return (
    <svg viewBox="0 0 52 30" width="52" height="30" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="48" height="22" rx="4" fill="white" fillOpacity="0.95" />
      <rect x="38" y="7" width="7" height="7" rx="1.5" fill="#7DD3FC" fillOpacity="0.88" />
      <rect x="38" y="16" width="7" height="7" rx="1.5" fill="#7DD3FC" fillOpacity="0.88" />
      <rect x="26" y="7" width="8" height="7" rx="1.5" fill="#7DD3FC" fillOpacity="0.82" />
      <rect x="26" y="16" width="8" height="7" rx="1.5" fill="#7DD3FC" fillOpacity="0.82" />
      <rect x="13" y="7" width="9" height="7" rx="1.5" fill="#7DD3FC" fillOpacity="0.75" />
      <rect x="13" y="16" width="9" height="7" rx="1.5" fill="#7DD3FC" fillOpacity="0.75" />
      <rect x="2" y="14" width="48" height="2" rx="1" fill="rgba(0,0,0,0.08)" />
      <circle cx="50" cy="9" r="2.5" fill="#FDE68A" />
      <circle cx="50" cy="21" r="2.5" fill="#FDE68A" />
      <circle cx="2" cy="9" r="2" fill="#FCA5A5" />
      <circle cx="2" cy="21" r="2" fill="#FCA5A5" />
    </svg>
  );
}

function CarVehicle() {
  return (
    <svg viewBox="0 0 42 24" width="42" height="24" fill="none" aria-hidden="true">
      <path d="M2 12 Q3 5 10 5 L32 5 Q40 5 40 12 Q40 19 32 19 L10 19 Q3 19 2 12Z" fill="white" fillOpacity="0.95" />
      <path d="M12 6.5 L30 6.5 Q36 7 36 12 Q36 17 30 17.5 L12 17.5 Q8 17 8 12 Q8 7 12 6.5Z" fill="#7DD3FC" fillOpacity="0.7" />
      <ellipse cx="40" cy="9" rx="1.5" ry="2.5" fill="#FDE68A" />
      <ellipse cx="40" cy="15" rx="1.5" ry="2.5" fill="#FDE68A" />
      <ellipse cx="2" cy="9" rx="1.5" ry="2" fill="#FCA5A5" fillOpacity="0.9" />
      <ellipse cx="2" cy="15" rx="1.5" ry="2" fill="#FCA5A5" fillOpacity="0.9" />
    </svg>
  );
}

function ScooterVehicle() {
  return (
    <svg viewBox="0 0 36 20" width="36" height="20" fill="none" aria-hidden="true">
      <path d="M8 10 Q10 5 18 6 L26 7 Q32 8 32 10 Q32 12 26 13 L18 14 Q10 15 8 10Z" fill="white" fillOpacity="0.9" />
      <circle cx="30" cy="10" r="5" fill="none" stroke="white" strokeWidth="2.5" strokeOpacity="0.9" />
      <circle cx="30" cy="10" r="2" fill="white" fillOpacity="0.75" />
      <circle cx="6" cy="10" r="5" fill="none" stroke="white" strokeWidth="2.5" strokeOpacity="0.9" />
      <circle cx="6" cy="10" r="2" fill="white" fillOpacity="0.75" />
      <circle cx="35" cy="10" r="2" fill="#FDE68A" />
      <line x1="26" y1="6.5" x2="28.5" y2="3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  );
}

const vehicleIcons = {
  bus: BusVehicle,
  electric_taxi: CarVehicle,
  scooter: ScooterVehicle
};

const VehicleMarker = forwardRef(function VehicleMarker(
  { vehicle, initialPosition, selected, onSelect },
  ref
) {
  const config = vehicleColors[vehicle.type] || vehicleColors.bus;
  const VehicleIcon = vehicleIcons[vehicle.type] || BusVehicle;

  return (
    <button
      ref={ref}
      className={`vehicle-marker ${selected ? "is-selected" : ""}`}
      style={{
        left: `${initialPosition.x}%`,
        top: `${initialPosition.y}%`,
        "--vehicle-angle": `${initialPosition.angle ?? 0}deg`,
        "--marker-glow": config.glow,
        "--marker-trail": config.trail
      }}
      onClick={() => onSelect(vehicle.id)}
      title={vehicle.id}
      type="button"
    >
      <span className="vehicle-trail" />
      <span className="vehicle-shadow" />
      <span className="vehicle-body">
        <VehicleIcon />
      </span>
      <span className="vehicle-label">{vehicle.id}</span>
    </button>
  );
});

export default VehicleMarker;
