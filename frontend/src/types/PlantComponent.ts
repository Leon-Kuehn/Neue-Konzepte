export type Role = "sensor" | "actuator";
export type Category =
  | "conveyor"
  | "rotating-conveyor"
  | "press"
  | "inductive-sensor"
  | "rfid-sensor"
  | "optical-sensor"
  | "pneumatic-unit"
  | "crane"
  | "storage"
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
  mqttTopics: {
    status: string;
    command?: string;
    telemetry?: string;
  };
}
