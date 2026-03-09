export type ModuleType = 'conveyor' | 'turntable' | 'pump' | 'motor' | 'sensor' | 'nfc'

export type Rotation = 0 | 90 | 180 | 270

import type { IconName } from './devices'

export type ModuleDefinition = {
  type: ModuleType
  label: string
  description?: string
  icon: IconName
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
  deviceType: 'sensor' | 'actuator'
  stateTopic?: string
  commandTopic?: string
  metaTopic?: string
}

export type PlantState = {
  modules: PlacedModule[]
  bindings: Record<string, ModuleBinding>
}
