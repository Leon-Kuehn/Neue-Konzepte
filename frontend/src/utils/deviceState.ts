import type { DeviceDefinition } from '../types/devices'

export const isActiveValue = (value?: string | number) => {
  if (value === undefined) return false
  const normalized = String(value).toUpperCase()
  if (normalized === '' || normalized === 'OFF' || normalized === '0' || normalized === 'FALSE') return false
  return true
}

export const getDeviceById = <T extends DeviceDefinition>(list: T[], id: string, fallback: T): T => {
  return list.find((d) => d.id === id) ?? fallback
}
