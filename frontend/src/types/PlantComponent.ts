export type Role = "sensor" | "actuator";
export type Category =
  | "conveyor"
  | "rotating-conveyor"
  | "press"
  | "pusher"
  | "inductive-sensor"
  | "rfid-sensor"
  | "optical-sensor"
  | "pneumatic-unit"
  | "crane"
  | "storage"
  | "deposit-place"
  | "input";

export interface PlantComponent {
  id: string;
  name: string;
  role: Role;          // sensor vs actuator
  category: Category;  // Art der Komponente
  status: "on" | "off";
  online: boolean;
  lastChanged: string;
  stats: {
    cycles?: number;
    uptimeHours?: number;
    lastValue?: number | boolean;
  };
  healthStatus?: "ok" | "error" | "offline";
  faultMessage?: string;
  rotationDeg?: number;
  mqttTopics: {
    status: string;
    command?: string;
    telemetry?: string;
  };
}
