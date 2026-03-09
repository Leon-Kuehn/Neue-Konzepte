import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import mqtt from 'mqtt'
import type { IClientPublishOptions, MqttClient } from 'mqtt'
import { mqttConfig } from './mqttConfig'

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline'

export type MqttMessage = {
  topic: string
  payload: string
  timestamp: Date
  qos?: number
}

type SubscribeHandler = (payload: string, rawTopic: string) => void

type MqttContextValue = {
  status: ConnectionStatus
  lastMessageAt?: Date
  messageLog: MqttMessage[]
  subscribe: (topic: string, handler: SubscribeHandler) => () => void
  publish: (topic: string, payload: string | number | Record<string, unknown>, options?: IClientPublishOptions) => Promise<void>
  config: typeof mqttConfig
  setConfig: (config: typeof mqttConfig) => void
}

const MqttContext = createContext<MqttContextValue | undefined>(undefined)

const matchesTopic = (subscription: string, incoming: string) => {
  if (subscription === incoming) return true
  const regex = subscription
    .replace(/[-/\\^$+?.()|\\[\\]{}]/g, '\\$&')
    .replace(/\\\+/g, '[^/]+')
    .replace(/\\#/g, '.*')
  return new RegExp(`^${regex}$`).test(incoming)
}

const decodePayload = (payload: Uint8Array) => {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(payload)
  }
  return Array.from(payload)
    .map((b) => String.fromCharCode(b))
    .join('')
}

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [messageLog, setMessageLog] = useState<MqttMessage[]>([])
  const [lastMessageAt, setLastMessageAt] = useState<Date>()
  const [config, setConfigState] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('mqtt-settings') : null
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed.url === 'string') {
          return { ...mqttConfig, ...parsed }
        }
      }
    } catch (err) {
      console.warn('Konnte MQTT Settings nicht laden', err)
    }
    return mqttConfig
  })
  const clientRef = useRef<MqttClient | null>(null)

  useEffect(() => {
    const client = mqtt.connect(config.url, {
      reconnectPeriod: 3000,
      username: config.username,
      password: config.password,
      clean: true,
      keepalive: 60,
    })

    clientRef.current = client

    client.on('connect', () => setStatus('connected'))
    client.on('reconnect', () => setStatus('reconnecting'))
    client.on('close', () => setStatus('offline'))
    client.on('end', () => setStatus('offline'))
    client.on('error', () => setStatus('offline'))

    const handleMessage = (topic: string, payload: Uint8Array) => {
      const decoded = decodePayload(payload)
      const timestamp = new Date()
      setLastMessageAt(timestamp)
      setMessageLog((prev) => [{ topic, payload: decoded, timestamp }, ...prev].slice(0, 50))
    }

    client.on('message', handleMessage)

    return () => {
      client.off('message', handleMessage)
      client.end(true)
      clientRef.current = null
    }
  }, [config.password, config.url, config.username])

  const subscribe = useCallback(
    (topic: string, handler: SubscribeHandler) => {
      const client = clientRef.current
      if (!client) return () => {}

      const onMessage = (incomingTopic: string, payload: Uint8Array) => {
        if (!matchesTopic(topic, incomingTopic)) return
        handler(decodePayload(payload), incomingTopic)
      }

      client.subscribe(topic)
      client.on('message', onMessage)

      return () => {
        client.off('message', onMessage)
        client.unsubscribe(topic)
      }
    },
    []
  )

  const publish = useCallback(
    (topic: string, payload: string | number | Record<string, unknown>, options?: IClientPublishOptions) => {
      const client = clientRef.current
      if (!client) return Promise.reject(new Error('MQTT client not connected'))

      const normalizedPayload = typeof payload === 'string' ? payload : JSON.stringify(payload)

      return new Promise<void>((resolve, reject) => {
        client.publish(topic, normalizedPayload, options ?? { qos: 0 }, (error) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        })
      })
    },
    []
  )

  const value = useMemo(
    () => ({
      status,
      lastMessageAt,
      messageLog,
      publish,
      subscribe,
      config,
      setConfig: (cfg: typeof mqttConfig) => {
        setConfigState(cfg)
        try {
          window.localStorage.setItem('mqtt-settings', JSON.stringify(cfg))
        } catch (err) {
          console.warn('Konnte MQTT Settings nicht speichern', err)
        }
        setMessageLog([])
      },
    }),
    [config, lastMessageAt, messageLog, publish, status, subscribe]
  )

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMqttContext() {
  const ctx = useContext(MqttContext)
  if (!ctx) {
    throw new Error('useMqttContext must be used within a MqttProvider')
  }
  return ctx
}
