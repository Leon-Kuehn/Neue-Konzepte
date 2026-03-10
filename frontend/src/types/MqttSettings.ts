export interface MqttSettings {
  protocol: "ws" | "wss";
  host: string;
  port: number;
  clientId: string;
  username: string;
  password: string;
  useTls: boolean;
}

export type ConnectionStatus = "Connected" | "Disconnected" | "Error";
