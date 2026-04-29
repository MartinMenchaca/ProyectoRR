import { useCallback, useEffect, useMemo, useState } from "react";
import { getEvents, getHealth, getVehicles } from "./api/http.js";
import MobileShell from "./components/MobileShell.jsx";
import SystemStatus from "./components/SystemStatus.jsx";
import SimulatedMap from "./components/SimulatedMap.jsx";
import VehicleStatusCard from "./components/VehicleStatusCard.jsx";
import VehicleSelector from "./components/VehicleSelector.jsx";
import OperatorPanel from "./components/OperatorPanel.jsx";
import EventTimeline from "./components/EventTimeline.jsx";
import CommunicationFlow from "./components/CommunicationFlow.jsx";

const preferredVehicleOrder = ["BUS-001", "TAXI-001", "SCOOTER-001"];

export default function App() {
  const [health, setHealth] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("BUS-001");
  const [loadErrors, setLoadErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadData = useCallback(async () => {
    const [healthResult, vehiclesResult, eventsResult] = await Promise.allSettled([
      getHealth(),
      getVehicles(),
      getEvents()
    ]);

    const nextErrors = {};

    if (healthResult.status === "fulfilled") {
      setHealth(healthResult.value);
    } else {
      nextErrors.health = "No se pudo conectar con el backend.";
    }

    if (vehiclesResult.status === "fulfilled") {
      setVehicles(vehiclesResult.value);
      setSelectedVehicleId((currentId) => {
        if (vehiclesResult.value.some((vehicle) => vehicle.id === currentId)) {
          return currentId;
        }

        const nextSelected =
          vehiclesResult.value.find((vehicle) => preferredVehicleOrder.includes(vehicle.id)) ||
          vehiclesResult.value[0];

        return nextSelected?.id || currentId;
      });
    } else {
      nextErrors.vehicles = "No se pudieron cargar los vehiculos.";
    }

    if (eventsResult.status === "fulfilled") {
      setEvents(eventsResult.value);
    } else {
      nextErrors.events = "No se pudieron cargar los eventos recientes.";
    }

    setLoadErrors(nextErrors);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    async function guardedLoad() {
      if (!active) return;
      await loadData();
    }

    guardedLoad();
    const timer = window.setInterval(guardedLoad, 2000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [loadData]);

  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const indexA = preferredVehicleOrder.indexOf(a.id);
      const indexB = preferredVehicleOrder.indexOf(b.id);

      if (indexA === -1 && indexB === -1) return a.id.localeCompare(b.id);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [vehicles]);

  const selectedVehicle =
    sortedVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ||
    sortedVehicles.find((vehicle) => preferredVehicleOrder.includes(vehicle.id)) ||
    null;
  const routedVehicles = sortedVehicles.filter((vehicle) => preferredVehicleOrder.includes(vehicle.id));
  const globalError =
    loadErrors.health && loadErrors.vehicles
      ? "No se pudo conectar con el backend. Reintentando conexion..."
      : "";

  return (
    <MobileShell
      title="Movilidad Inteligente"
      subtitle="Monitoreo urbano en tiempo real"
      error={globalError}
      onRetry={loadData}
    >
      <SystemStatus
        health={health}
        error={globalError}
        loadErrors={loadErrors}
        loading={loading}
        lastRefresh={lastRefresh}
      />

      <SimulatedMap
        vehicles={routedVehicles}
        selectedVehicle={selectedVehicle}
        selectedVehicleId={selectedVehicle?.id}
        onSelectVehicle={setSelectedVehicleId}
        loading={loading}
      />

      <section className="detail-grid">
        <VehicleStatusCard vehicle={selectedVehicle} />
        <VehicleSelector
          vehicles={routedVehicles}
          selectedVehicleId={selectedVehicle?.id}
          onSelectVehicle={setSelectedVehicleId}
        />
      </section>

      <OperatorPanel vehicles={sortedVehicles} selectedVehicleId={selectedVehicle?.id} />

      <EventTimeline events={events} loading={loading} error={loadErrors.events} />

      <CommunicationFlow />
    </MobileShell>
  );
}
