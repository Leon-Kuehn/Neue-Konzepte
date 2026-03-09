export type IconName =
  | 'temperature'
  | 'humidity'
  | 'light'
  | 'soil'
  | 'energy'
  | 'pump'
  | 'streetlight'
  | 'ventilation'
  | 'status'
  | 'heartbeat'
  | 'kpi'
  | 'conveyor'
  | 'motor'
  | 'presence'
  | 'position'
  | 'nfc'

export type DeviceType = 'sensor' | 'actuator'

export type MqttTopics = {
  valueTopic?: string
  stateTopic?: string
  commandTopic?: string
}

export type BaseDevice = {
  id: string
  name: string
  description?: string
  type: DeviceType
  icon: IconName
  unit?: string
  valueType?: 'number' | 'string' | 'json'
  topics: MqttTopics
  accent?: string
}

export type ActuatorControl =
  | { type: 'toggle'; onLabel?: string; offLabel?: string }
  | { type: 'select'; options: { label: string; value: string }[] }
  | { type: 'slider'; min: number; max: number; step?: number }

export type ActuatorDevice = BaseDevice & {
  type: 'actuator'
  control: ActuatorControl
}

export type SensorKind = 'presence' | 'position' | 'nfc' | 'environment'

export type SensorDevice = BaseDevice & {
  type: 'sensor'
  kind?: SensorKind
}

export type DeviceDefinition = ActuatorDevice | SensorDevice
