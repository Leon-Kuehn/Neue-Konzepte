export type MqttEnvironmentConfig = {
  url: string
  username?: string
  password?: string
}

export const mqttConfig: MqttEnvironmentConfig = {
  url: import.meta.env.VITE_MQTT_URL || 'ws://localhost:9001',
  username: import.meta.env.VITE_MQTT_USERNAME,
  password: import.meta.env.VITE_MQTT_PASSWORD,
}

// Topics und Auth lassen sich hier zentral anpassen. Für produktive Szenarien
// können weitere Optionen (TLS, andere Ports) ergänzt werden.
