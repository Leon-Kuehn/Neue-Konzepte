import { useEffect, useMemo, useState } from 'react'
import { usePlantStore } from '../store/plantStore'
import { useTopicHistory } from './useTopicHistory'
import { isActiveValue } from '../utils/deviceState'

export const useModuleSignal = (moduleId: string) => {
  const { state } = usePlantStore()
  const binding = state.bindings[moduleId]

  const stateTopic = binding?.stateTopic ?? binding?.commandTopic
  const commandTopic = binding?.commandTopic

  const stateData = useTopicHistory(stateTopic)
  const metaData = useTopicHistory(binding?.metaTopic)

  const lastMessageAt = useMemo(() => {
    const timestamps = [stateData.latest?.timestamp, metaData.latest?.timestamp].filter(Boolean) as Date[]
    return timestamps.length > 0 ? new Date(Math.max(...timestamps.map((t) => t.getTime()))) : undefined
  }, [metaData.latest?.timestamp, stateData.latest?.timestamp])

  const [recent, setRecent] = useState(false)
  useEffect(() => {
    if (!lastMessageAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- MQTT updates kommen außerhalb von React, State wird hier bewusst synchronisiert
      setRecent(false)
      return
    }
    setRecent(true)
    const t = setTimeout(() => setRecent(false), 12_000)
    return () => clearTimeout(t)
  }, [lastMessageAt])

  return {
    binding,
    stateTopic,
    commandTopic,
    lastValue: stateData.latest?.value,
    metaValue: metaData.latest?.value,
    lastMessageAt,
    recent,
    active: isActiveValue(stateData.latest?.value),
    stateHistory: stateData.history,
    metaHistory: metaData.history,
  }
}
