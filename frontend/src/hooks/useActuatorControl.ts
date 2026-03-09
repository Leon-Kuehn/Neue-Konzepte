import { useState } from 'react'
import { useMqttPublish } from '../mqtt/useMqtt'
import { useTopicHistory } from './useTopicHistory'

export const useActuatorControl = (stateTopic?: string, commandTopic?: string) => {
  const { latest, history, isStale } = useTopicHistory(stateTopic, { limit: 30 })
  const { send, isSending, error } = useMqttPublish()
  const [lastCommand, setLastCommand] = useState<string | number>()

  const publishCommand = async (value: string | number) => {
    if (!commandTopic) return
    await send(commandTopic, value)
    setLastCommand(value)
  }

  return {
    latest,
    history,
    isStale,
    publishCommand,
    isSending,
    error,
    lastCommand,
  }
}
