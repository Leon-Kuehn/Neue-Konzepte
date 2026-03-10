export type PlantComponentType = 'sensor' | 'actuator' | 'segment' | 'station'

export type PlantComponentStatus = 'on' | 'off'

export type PlantComponentStats = {
  cycles?: number
  uptimeHours?: number
}

export type PlantComponent = {
  id: string
  name: string
  type: PlantComponentType
  status: PlantComponentStatus
  online: boolean
  lastChanged: string
  stats: PlantComponentStats
}
