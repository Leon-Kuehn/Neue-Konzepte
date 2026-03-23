import mqtt, { type MqttClient } from "mqtt";
import type { MqttSettings } from "../types/MqttSettings";

let client: MqttClient | null = null;

export function getClient(): MqttClient | null {
  return client;
}

export async function connect(settings: MqttSettings): Promise<void> {
  if (client) {
    await disconnect();
  }

  const url = `${settings.protocol}://${settings.host}:${settings.port}/mqtt`;

  const options: mqtt.IClientOptions = {
    clientId: settings.clientId,
    clean: true,
    connectTimeout: 5000,
    reconnectPeriod: 3000,
  };

  if (settings.username) {
    options.username = settings.username;
  }
  if (settings.password) {
    options.password = settings.password;
  }

  return new Promise<void>((resolve, reject) => {
    client = mqtt.connect(url, options);

    const timeout = setTimeout(() => {
      reject(new Error("Connection timeout"));
    }, 10000);

    client.on("connect", () => {
      clearTimeout(timeout);
      resolve();
    });

    client.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export async function disconnect(): Promise<void> {
  if (!client) return;
  return new Promise<void>((resolve) => {
    client!.end(false, {}, () => {
      client = null;
      resolve();
    });
  });
}

export async function subscribe(topic: string): Promise<void> {
  if (!client) throw new Error("Not connected");
  return new Promise<void>((resolve, reject) => {
    client!.subscribe(topic, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function publish(
  topic: string,
  payload: string,
  options?: { retain?: boolean; qos?: 0 | 1 | 2 },
): Promise<void> {
  if (!client || !client.connected) {
    throw new Error("Not connected");
  }

  return new Promise<void>((resolve, reject) => {
    client!.publish(
      topic,
      payload,
      {
        retain: options?.retain ?? false,
        qos: options?.qos ?? 0,
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

export function onMessage(
  callback: (topic: string, payload: string) => void
): void {
  if (!client) return;
  client.on("message", (topic, message) => {
    callback(topic, message.toString());
  });
}

const SETTINGS_KEY = "mqtt-settings";

export function loadSettings(): MqttSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MqttSettings;
  } catch {
    return null;
  }
}

export function saveSettings(settings: MqttSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function generateClientId(): string {
  return `plant-admin-${Math.random().toString(36).substring(2, 10)}`;
}
