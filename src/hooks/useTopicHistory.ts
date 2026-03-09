import { useEffect, useMemo, useState } from 'react'
import { useMqttSubscription } from '../mqtt/useMqtt'

export type TopicHistoryEntry = {
  topic: string
  value: string | number
  raw: string
  timestamp: Date
}

type UseTopicHistoryOptions = {
  limit?: number
  numeric?: boolean
}

export const useTopicHistory = (topic: string, options?: UseTopicHistoryOptions) => {
  const message = useMqttSubscription(topic)
  const limit = options?.limit ?? 20
  const numeric = options?.numeric ?? false
  const [history, setHistory] = useState<TopicHistoryEntry[]>([])

  useEffect(() => {
    if (!message) return
    const parsed = numeric ? Number(message.payload) : message.payload
    // State wird hier bewusst aus einer externen MQTT-Nachricht aktualisiert.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- externe Updates sind hier gewollt
    setHistory((prev) => {
      const next = [
        {
          topic: message.topic,
          value: Number.isNaN(parsed) ? message.payload : parsed,
          raw: message.payload,
          timestamp: message.timestamp,
        },
        ...prev,
      ]
      return next.slice(0, limit)
    })
  }, [limit, message, numeric])

  const latest = history[0]
  const isStale = useMemo(() => !latest, [latest])

  return { latest, history, isStale }
}
