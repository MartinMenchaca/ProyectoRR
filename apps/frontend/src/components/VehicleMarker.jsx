import { Bus, CarTaxiFront, Bike } from "lucide-react";

const iconByType = {
  bus: Bus,
  electric_taxi: CarTaxiFront,
  scooter: Bike
};

export default function VehicleMarker({ vehicle, position, selected, onSelect }) {
  const Icon = iconByType[vehicle.type] || Bus;

  return (
    <button
      className={`vehicle-marker ${selected ? "is-selected" : ""}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        "--vehicle-angle": `${position.angle || 0}deg`
      }}
      onClick={() => onSelect(vehicle.id)}
      title={vehicle.id}
      type="button"
    >
      <span className="marker-trail" />
      <span className="marker-pulse" />
      <span className="marker-core">
        <Icon size={16} />
      </span>
      <span className="marker-label">{vehicle.id}</span>
    </button>
  );
}
