export interface PlantComponent {
  id: string;
  name: string;
  type: "sensor" | "actuator" | "segment" | "station" | string;
  status: "on" | "off";
  online: boolean;
  lastChanged: string;
  stats: { cycles?: number; uptimeHours?: number };
}
