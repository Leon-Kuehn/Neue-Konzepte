import type { LogisticsModuleType } from './logistics'

export type LogisticsLayoutItem = {
  id: string
  type: LogisticsModuleType
  x: number
  y: number
  width: number
  height: number
  rotation?: number
}
