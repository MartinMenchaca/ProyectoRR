import { Cpu, Database, MonitorSmartphone, RadioTower, Server } from "lucide-react";

const nodes = [
  { label: "Simulador IoT", detail: "Node.js", icon: Cpu },
  { label: "Broker MQTT", detail: "Aedes", icon: RadioTower },
  { label: "Backend", detail: "Express", icon: Server },
  { label: "SQLite", detail: "SQL/SQLite", icon: Database },
  { label: "Frontend", detail: "React + Vite", icon: MonitorSmartphone }
];

const links = ["MQTT", "Publish/Subscribe", "SQL/SQLite", "HTTP/REST"];

export default function CommunicationFlow() {
  return (
    <section className="flow-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Flujo de comunicaciones</p>
          <h2>Arquitectura distribuida</h2>
        </div>
      </div>

      <div className="flow-track">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <div className="flow-group" key={node.label}>
              <div className="flow-node">
                <Icon size={20} />
                <strong>{node.label}</strong>
                <span>{node.detail}</span>
              </div>
              {links[index] ? <div className="flow-link">{links[index]}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
