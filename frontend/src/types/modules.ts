export type ModuleType =
  | 'conveyor-infeed'
  | 'conveyor-transfer'
  | 'conveyor-outfeed'
  | 'turntable-diverter'
  | 'lift'
  | 'warehouse-axis'
  | 'warehouse-slot'
  | 'presence-sensor'
  | 'position-sensor'
  | 'nfc-reader'
  | 'energy-sensor'
  | 'temperature-sensor'

export type Rotation = 0 | 90 | 180 | 270

import type { IconName } from './devices'

export type ModuleCategory = 'actuator' | 'sensor' | 'logical'

export type ValueLabels = Record<string, string>

export type ModuleDefinition = {
  type: ModuleType
  label: string
  description?: string
  icon: IconName
  color: string
  category: ModuleCategory
  expectedTopics?: {
    state?: string[]
    meta?: string[]
  }
  valueLabels?: ValueLabels
  defaultRotation?: Rotation
}

export type PlacedModule = {
  id: string
  type: ModuleType
  x: number
  y: number
  rotation: Rotation
  label: string
}

export type ModuleBinding = {
  deviceType: 'sensor' | 'actuator' | 'logical'
  stateTopic?: string
  commandTopic?: string
  metaTopic?: string
}

export type PlantState = {
  modules: PlacedModule[]
  bindings: Record<string, ModuleBinding>
}
