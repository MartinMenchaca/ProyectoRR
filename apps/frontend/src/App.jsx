import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getEvents,
  getHealth,
  getMaintenance,
  getPayments,
  getVehicles,
  simulateMaintenance,
  simulatePayment
} from "./api/http.js";
import { createSocket, SOCKET_URL } from "./api/socket.js";
import MobileShell from "./components/MobileShell.jsx";
import SystemStatus from "./components/SystemStatus.jsx";
import SimulatedMap from "./components/SimulatedMap.jsx";
import VehicleStatusCard from "./components/VehicleStatusCard.jsx";
import VehicleSelector from "./components/VehicleSelector.jsx";
import OperatorPanel from "./components/OperatorPanel.jsx";
import EventTimeline from "./components/EventTimeline.jsx";
import CommunicationFlow from "./components/CommunicationFlow.jsx";
import PaymentsPanel from "./components/PaymentsPanel.jsx";
import MaintenancePanel from "./components/MaintenancePanel.jsx";

const preferredVehicleOrder = ["BUS-001", "TAXI-001", "SCOOTER-001"];

export default function App() {
  const [health, setHealth] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenanceReports, setMaintenanceReports] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("BUS-001");
  const [loadErrors, setLoadErrors] = useState({});
  const [actionState, setActionState] = useState({ type: "", status: "idle", message: "" });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [liveAlert, setLiveAlert] = useState("");
  const alertTimerRef = useRef(null);

  const loadData = useCallback(async () => {
    const [healthResult, vehiclesResult, eventsResult, paymentsResult, maintenanceResult] = await Promise.allSettled([
      getHealth(),
      getVehicles(),
      getEvents(),
      getPayments(),
      getMaintenance()
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

    if (paymentsResult.status === "fulfilled") {
      setPayments(paymentsResult.value);
    } else {
      nextErrors.payments = "No se pudieron cargar los pagos recientes.";
    }

    if (maintenanceResult.status === "fulfilled") {
      setMaintenanceReports(maintenanceResult.value);
    } else {
      nextErrors.maintenance = "No se pudieron cargar los reportes de mantenimiento.";
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

  useEffect(() => {
    const socket = createSocket();

    socket.on("connect", () => {
      setSocketStatus("connected");
    });

    socket.on("disconnect", () => {
      setSocketStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setSocketStatus("disconnected");
    });

    socket.io.on("reconnect_attempt", () => {
      setSocketStatus("reconnecting");
    });

    socket.io.on("reconnect", () => {
      setSocketStatus("connected");
    });

    socket.on("vehicle:locationUpdated", (payload) => {
      setVehicles((currentVehicles) => upsertVehicleFromTelemetry(currentVehicles, payload));
    });

    socket.on("event:created", (event) => {
      setEvents((currentEvents) => mergeEvent(currentEvents, event));
    });

    socket.on("payment:created", (payment) => {
      setPayments((currentPayments) => mergeById(currentPayments, normalizePayment(payment)));
      const vehicleId = payment?.vehicleId || payment?.vehicle_id || "unidad";
      setLiveAlert(`Pago simulado registrado para ${vehicleId}.`);

      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
      }

      alertTimerRef.current = window.setTimeout(() => {
        setLiveAlert("");
      }, 4200);
    });

    socket.on("maintenance:reported", (maintenance) => {
      const vehicleId = maintenance?.vehicleId || maintenance?.vehicle_id || "unidad";
      setMaintenanceReports((currentReports) => mergeById(currentReports, normalizeMaintenance(maintenance)));
      setLiveAlert(`Mantenimiento reportado para ${vehicleId}.`);

      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
      }

      alertTimerRef.current = window.setTimeout(() => {
        setLiveAlert("");
      }, 4200);
    });

    socket.connect();

    return () => {
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
      }

      socket.disconnect();
    };
  }, []);

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

  const handleSimulatePayment = useCallback(async () => {
    if (!selectedVehicle) return;

    setActionState({ type: "payment", status: "loading", message: "Procesando pago simulado..." });

    try {
      const payment = await simulatePayment({
        vehicleId: selectedVehicle.id,
        method: "card",
        passengerName: "Usuario demo"
      });

      setPayments((currentPayments) => mergeById(currentPayments, normalizePayment(payment)));
      setActionState({ type: "payment", status: "success", message: "Pago simulado completado." });
      window.setTimeout(() => setActionState({ type: "", status: "idle", message: "" }), 2600);
    } catch {
      setActionState({ type: "payment", status: "error", message: "No se pudo simular el pago." });
    }
  }, [selectedVehicle]);

  const handleSimulateMaintenance = useCallback(async () => {
    if (!selectedVehicle) return;

    setActionState({
      type: "maintenance",
      status: "loading",
      message: "Reportando mantenimiento simulado..."
    });

    try {
      const report = await simulateMaintenance({
        vehicleId: selectedVehicle.id,
        type: "battery_low",
        severity: "medium",
        description: "Nivel de bateria bajo detectado en prueba de concepto.",
        status: "open"
      });

      setMaintenanceReports((currentReports) => mergeById(currentReports, normalizeMaintenance(report)));
      setActionState({ type: "maintenance", status: "success", message: "Mantenimiento reportado." });
      window.setTimeout(() => setActionState({ type: "", status: "idle", message: "" }), 2600);
    } catch {
      setActionState({
        type: "maintenance",
        status: "error",
        message: "No se pudo reportar mantenimiento."
      });
    }
  }, [selectedVehicle]);

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
        socketStatus={socketStatus}
        socketUrl={SOCKET_URL}
      />

      {liveAlert ? <div className="live-alert">{liveAlert}</div> : null}

      <SimulatedMap
        vehicles={routedVehicles}
        selectedVehicle={selectedVehicle}
        selectedVehicleId={selectedVehicle?.id}
        onSelectVehicle={setSelectedVehicleId}
        loading={loading}
        actionState={actionState}
        onSimulatePayment={handleSimulatePayment}
        onSimulateMaintenance={handleSimulateMaintenance}
      />

      <section className="detail-grid">
        <VehicleStatusCard
          vehicle={selectedVehicle}
          actionState={actionState}
          onSimulatePayment={handleSimulatePayment}
          onSimulateMaintenance={handleSimulateMaintenance}
        />
        <VehicleSelector
          vehicles={routedVehicles}
          selectedVehicleId={selectedVehicle?.id}
          onSelectVehicle={setSelectedVehicleId}
        />
      </section>

      <OperatorPanel vehicles={sortedVehicles} selectedVehicleId={selectedVehicle?.id} />

      <section className="operations-grid">
        <PaymentsPanel payments={payments} loading={loading} error={loadErrors.payments} />
        <MaintenancePanel reports={maintenanceReports} loading={loading} error={loadErrors.maintenance} />
      </section>

      <EventTimeline events={events} loading={loading} error={loadErrors.events} />

      <CommunicationFlow />
    </MobileShell>
  );
}

function upsertVehicleFromTelemetry(currentVehicles, payload) {
  if (!payload?.vehicleId) return currentVehicles;

  const nextVehicle = {
    id: payload.vehicleId,
    name: payload.name || payload.vehicleId,
    type: payload.type || "vehicle",
    status: payload.status || "in_route",
    battery: payload.battery ?? 100,
    current_lat: payload.lat,
    current_lng: payload.lng,
    speed: payload.speed ?? 0,
    updated_at: payload.timestamp || new Date().toISOString()
  };

  const exists = currentVehicles.some((vehicle) => vehicle.id === nextVehicle.id);

  if (!exists) {
    return [...currentVehicles, nextVehicle];
  }

  return currentVehicles.map((vehicle) =>
    vehicle.id === nextVehicle.id
      ? {
          ...vehicle,
          ...nextVehicle
        }
      : vehicle
  );
}

function mergeEvent(currentEvents, event) {
  if (!event) return currentEvents;

  const normalizedEvent = {
    ...event,
    payload: event.payload || parsePayload(event.payload_json)
  };

  const alreadyExists = currentEvents.some((currentEvent) => {
    if (normalizedEvent.id && currentEvent.id) {
      return currentEvent.id === normalizedEvent.id;
    }

    return (
      currentEvent.topic === normalizedEvent.topic &&
      currentEvent.created_at === normalizedEvent.created_at &&
      currentEvent.event_type === normalizedEvent.event_type
    );
  });

  if (alreadyExists) return currentEvents;

  return [normalizedEvent, ...currentEvents].slice(0, 100);
}

function mergeById(currentItems, item) {
  if (!item) return currentItems;

  if (!item.id) {
    return [item, ...currentItems].slice(0, 50);
  }

  const exists = currentItems.some((currentItem) => currentItem.id === item.id);
  if (exists) return currentItems;
  return [item, ...currentItems].slice(0, 50);
}

function normalizePayment(payment) {
  if (!payment) return payment;

  return {
    ...payment,
    vehicleId: payment.vehicleId || payment.vehicle_id,
    passengerName: payment.passengerName || payment.passenger_name,
    timestamp: payment.timestamp || payment.created_at
  };
}

function normalizeMaintenance(report) {
  if (!report) return report;

  return {
    ...report,
    vehicleId: report.vehicleId || report.vehicle_id,
    timestamp: report.timestamp || report.created_at
  };
}

function parsePayload(payloadJson) {
  if (!payloadJson) return null;

  try {
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}
