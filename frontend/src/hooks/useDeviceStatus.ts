import type { DeviceDefinition } from '../types/devices'
import { useEffect, useMemo, useState } from 'react'
import { useTopicHistory } from './useTopicHistory'

export type DeviceStatus = {
  lastValue?: string | number
  state?: string | number
  lastSeenAt?: Date
  isConnected: boolean
  recent: boolean
  valueHistory: ReturnType<typeof useTopicHistory>['history']
  stateHistory: ReturnType<typeof useTopicHistory>['history']
  valueTopic?: string
  stateTopic?: string
}

export const useDeviceStatus = (device: DeviceDefinition): DeviceStatus => {
  const valueData = useTopicHistory(device.topics.valueTopic, { numeric: device.valueType === 'number' })
  const stateData = useTopicHistory(device.topics.stateTopic)

  const lastSeenAt = useMemo(() => {
    const timestamps = [valueData.latest?.timestamp, stateData.latest?.timestamp].filter(Boolean) as Date[]
    return timestamps.length > 0 ? new Date(Math.max(...timestamps.map((t) => t.getTime()))) : undefined
  }, [stateData.latest?.timestamp, valueData.latest?.timestamp])
  const lastValue = valueData.latest?.value ?? stateData.latest?.value
  const state = stateData.latest?.value

  const isConnected = Boolean(lastSeenAt)
  const [recent, setRecent] = useState(false)

  useEffect(() => {
    if (!lastSeenAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derived from external MQTT timing
      setRecent(false)
      return
    }
    setRecent(true)
    const timer = setTimeout(() => setRecent(false), 20_000)
    return () => clearTimeout(timer)
  }, [lastSeenAt])

  return {
    lastValue,
    state,
    lastSeenAt,
    isConnected,
    recent,
    valueHistory: valueData.history,
    stateHistory: stateData.history,
    valueTopic: device.topics.valueTopic,
    stateTopic: device.topics.stateTopic,
  }
}
