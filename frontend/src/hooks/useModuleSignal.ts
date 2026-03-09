import { useEffect, useMemo, useState } from 'react'
import { usePlantStore } from '../store/plantStore'
import { useTopicHistory } from './useTopicHistory'
import { isActiveValue } from '../utils/deviceState'
import { getDefaultTopicsForModule } from '../config/mqttTopics'

const RECENT_SIGNAL_TIMEOUT_MS = 12_000

export const useModuleSignal = (moduleId: string) => {
  const { state } = usePlantStore()
  const binding = state.bindings[moduleId]
  const module = state.modules.find((m) => m.id === moduleId)
  const defaults = module ? getDefaultTopicsForModule(module.type) : {}

  const stateTopic = binding?.stateTopic ?? defaults.stateTopic
  const commandTopic = binding?.commandTopic
  const metaTopic = binding?.metaTopic ?? defaults.metaTopic

  const stateData = useTopicHistory(stateTopic)
  const metaData = useTopicHistory(metaTopic)

  const lastMessageAt = useMemo(() => {
    const timestamps = [stateData.latest?.timestamp, metaData.latest?.timestamp].filter(Boolean) as Date[]
    return timestamps.length > 0 ? new Date(Math.max(...timestamps.map((t) => t.getTime()))) : undefined
  }, [metaData.latest?.timestamp, stateData.latest?.timestamp])

  const [recent, setRecent] = useState(false)
  useEffect(() => {
    if (!lastMessageAt) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- toggling visual pulse flag based on external MQTT timing
    setRecent(true)
    const t = setTimeout(() => setRecent(false), RECENT_SIGNAL_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [lastMessageAt])

  return {
    binding,
    stateTopic,
    commandTopic,
    metaTopic,
    lastValue: stateData.latest?.value,
    metaValue: metaData.latest?.value,
    lastMessageAt,
    recent,
    active: isActiveValue(stateData.latest?.value),
    stateHistory: stateData.history,
    metaHistory: metaData.history,
  }
}
