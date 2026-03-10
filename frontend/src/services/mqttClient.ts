export type MqttSettings = {
  host: string
  port: number
  useTLS: boolean
  clientId: string
  username?: string
  password?: string
}

export type MqttConnectionState = 'disconnected' | 'connected'

const SETTINGS_KEY = 'plant-mqtt-settings'

export const defaultMqttSettings: MqttSettings = {
  host: 'localhost',
  port: 1883,
  useTLS: false,
  clientId: `plant-ui-${Math.random().toString(36).slice(2, 8)}`,
  username: '',
  password: '',
}

let currentSettings: MqttSettings = defaultMqttSettings
let connected = false
type MessageHandler = (topic: string, payload: unknown) => void

let messageHandler: MessageHandler | null = null
let mockMessageIntervalId: number | null = null
const subscriptions = new Set<string>()

const stopSimulator = () => {
  if (mockMessageIntervalId !== null && typeof window !== 'undefined') {
    window.clearInterval(mockMessageIntervalId)
  }
  mockMessageIntervalId = null
}

const emitMockMessage = () => {
  if (!connected || !messageHandler || subscriptions.size === 0) return
  const topics = Array.from(subscriptions)
  const topic = topics[Math.floor(Math.random() * topics.length)]
  const componentId = topic.split('/')[1] ?? 'component'
  const now = new Date()
  messageHandler(topic, {
    id: componentId,
    status: Math.random() > 0.35 ? 'on' : 'off',
    online: Math.random() > 0.1,
    lastChanged: now.toISOString(),
    stats: { cycles: Math.floor(Math.random() * 1200), uptimeHours: Math.floor(Math.random() * 2000) },
  })
}

const startSimulator = () => {
  if (typeof window === 'undefined') return
  stopSimulator()
  mockMessageIntervalId = window.setInterval(emitMockMessage, 6500)
}

export const loadMqttSettings = (): MqttSettings => {
  try {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(SETTINGS_KEY) : null
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultMqttSettings, ...parsed }
    }
  } catch (error) {
    console.warn('Could not load MQTT settings', error)
  }
  return defaultMqttSettings
}

export const persistMqttSettings = (settings: MqttSettings) => {
  currentSettings = settings
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    }
  } catch (error) {
    console.warn('Could not save MQTT settings', error)
  }
}

export async function connect(settings: MqttSettings): Promise<void> {
  currentSettings = settings
  persistMqttSettings(settings)
  connected = true
  startSimulator()
}

export async function disconnect(): Promise<void> {
  connected = false
  stopSimulator()
}

export async function subscribe(topic: string): Promise<void> {
  subscriptions.add(topic)
}

export function onMessage(callback: MessageHandler): void {
  messageHandler = callback
}

export const getConnectionState = (): MqttConnectionState => (connected ? 'connected' : 'disconnected')

export const getCurrentSettings = () => currentSettings
