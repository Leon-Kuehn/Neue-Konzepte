import { useCallback, useEffect, useState } from 'react'
import { useMqttContext, type MqttMessage } from './MqttProvider'
import type { IClientPublishOptions } from 'mqtt'

export const useMqttSubscription = (topic?: string) => {
  const { subscribe } = useMqttContext()
  const [message, setMessage] = useState<MqttMessage>()

  useEffect(() => {
    if (!topic) return
    const unsubscribe = subscribe(topic, (payload, rawTopic) => {
      setMessage({
        topic: rawTopic,
        payload,
        timestamp: new Date(),
      })
    })
    return () => {
      unsubscribe()
    }
  }, [subscribe, topic])

  return message
}

export const useMqttPublish = () => {
  const { publish } = useMqttContext()
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    async (topic: string, payload: string | number | Record<string, unknown>, options?: IClientPublishOptions) => {
      setIsSending(true)
      setError(null)
      try {
        await publish(topic, payload, options)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsSending(false)
      }
    },
    [publish]
  )

  return { send, isSending, error }
}
