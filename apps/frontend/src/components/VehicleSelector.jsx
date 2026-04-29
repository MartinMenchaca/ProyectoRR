import { Bike, Bus, CarTaxiFront } from "lucide-react";

const iconByType = {
  bus: Bus,
  electric_taxi: CarTaxiFront,
  scooter: Bike
};

export default function VehicleSelector({ vehicles, selectedVehicleId, onSelectVehicle }) {
  return (
    <section className="selector-card">
      <div className="selector-card__header">
        <p className="section-kicker">Selector de vehiculos</p>
        <span>{vehicles.length} activos</span>
      </div>
      <div className="vehicle-selector">
        {vehicles.length === 0 ? <p className="empty-text">Sin unidades disponibles.</p> : null}
        {vehicles.map((vehicle) => {
          const Icon = iconByType[vehicle.type] || Bus;
          return (
            <button
              key={vehicle.id}
              type="button"
              className={vehicle.id === selectedVehicleId ? "selector-option is-active" : "selector-option"}
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              <Icon size={18} />
              <span>
                <strong>{vehicle.id}</strong>
                <small>{vehicle.name || vehicle.type || "Unidad"}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
