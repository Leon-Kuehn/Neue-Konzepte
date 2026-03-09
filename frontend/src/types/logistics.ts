export type LogisticsModuleType =
  | 'InputStation'
  | 'ProductSensor'
  | 'ConveyorLong'
  | 'ConveyorShort'
  | 'ConveyorTurntable'
  | 'FillingUnit'
  | 'Lift'
  | 'WarehouseColumn'
  | 'BinarySensor'
  | 'NfcSensor'

export type LogisticsModule = {
  id: string
  name: string
  type: LogisticsModuleType
  position: { x: number; y: number }
  rotation?: number
  stateTopic: string
  metaTopic?: string
}
