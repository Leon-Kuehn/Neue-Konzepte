import type { ActuatorDevice, DeviceDefinition, SensorDevice } from '../types/devices'

export const sensorDevices: SensorDevice[] = [
  {
    id: 'temperature',
    type: 'sensor',
    name: 'Temperatur',
    icon: 'temperature',
    unit: '°C',
    valueType: 'number',
    kind: 'environment',
    accent: 'from-red-500 to-orange-500',
    topics: { valueTopic: 'iot-logistikmodel/telemetry/environment/temperature' },
    description: 'Umgebungstemperatur der Anlage',
  },
  {
    id: 'energy',
    type: 'sensor',
    name: 'Energieverbrauch',
    icon: 'energy',
    unit: 'kWh',
    valueType: 'number',
    kind: 'environment',
    accent: 'from-indigo-500 to-purple-500',
    topics: { valueTopic: 'iot-logistikmodel/telemetry/energy/total' },
    description: 'Aktueller Verbrauch',
  },
  {
    id: 'presence-infeed',
    type: 'sensor',
    name: 'Lichtschranke Eingang',
    icon: 'presence',
    kind: 'presence',
    topics: { valueTopic: 'dhbw-hbs/sensors/presence/infeed' },
    description: 'Objekt erkannt / frei',
  },
  {
    id: 'presence-outfeed',
    type: 'sensor',
    name: 'Lichtschranke Ausgang',
    icon: 'presence',
    kind: 'presence',
    topics: { valueTopic: 'dhbw-hbs/sensors/presence/outfeed' },
    description: 'Werkstück bereit zur Entnahme',
  },
  {
    id: 'position-upper',
    type: 'sensor',
    name: 'Lift oben',
    icon: 'position',
    kind: 'position',
    topics: { valueTopic: 'dhbw-hbs/sensors/position/lift-upper' },
    description: 'Obere Endlage erreicht',
  },
  {
    id: 'position-lower',
    type: 'sensor',
    name: 'Lift unten',
    icon: 'position',
    kind: 'position',
    topics: { valueTopic: 'dhbw-hbs/sensors/position/lift-lower' },
    description: 'Untere Endlage erreicht',
  },
  {
    id: 'nfc-reader',
    type: 'sensor',
    name: 'NFC / Chip Reader',
    icon: 'nfc',
    valueType: 'string',
    kind: 'nfc',
    topics: { valueTopic: 'iot-logistikmodel/sensors/nfc/tag' },
    description: 'Chip-ID oder Typ des aufgelegten Objekts',
  },
]

export const actuatorDevices: ActuatorDevice[] = [
  {
    id: 'conveyor-infeed',
    type: 'actuator',
    name: 'Eingangsförderband',
    icon: 'conveyor',
    topics: {
      stateTopic: 'dhbw-hbs/line/infeed/state',
    },
    description: 'Motorstatus des Eingangsförderers',
    control: { type: 'toggle', onLabel: 'Start', offLabel: 'Stop' },
  },
  {
    id: 'conveyor-transfer',
    type: 'actuator',
    name: 'Transferband',
    icon: 'conveyor',
    topics: {
      stateTopic: 'dhbw-hbs/line/transfer/state',
    },
    description: 'Segment zwischen Zuführung und Verteiler',
    control: { type: 'toggle', onLabel: 'Start', offLabel: 'Stop' },
  },
  {
    id: 'conveyor-outfeed',
    type: 'actuator',
    name: 'Ausgangsförderband',
    icon: 'conveyor',
    topics: {
      stateTopic: 'dhbw-hbs/line/outfeed/state',
    },
    description: 'Richtung Entnahme',
    control: { type: 'toggle', onLabel: 'Start', offLabel: 'Stop' },
  },
  {
    id: 'turntable-diverter',
    type: 'actuator',
    name: 'Drehteller / Verteiler',
    icon: 'motor',
    topics: {
      stateTopic: 'dhbw-hbs/diverter/turntable/state',
    },
    description: 'Stellung 0/1 (read-only)',
    control: { type: 'toggle', onLabel: '1', offLabel: '0' },
  },
  {
    id: 'lift',
    type: 'actuator',
    name: 'Lift Bewegung',
    icon: 'motor',
    topics: {
      stateTopic: 'iot-logistikmodel/warehouse/lift/state',
    },
    description: 'Hub fährt / ruht',
    control: { type: 'toggle', onLabel: 'Fährt', offLabel: 'Stop' },
  },
]

export const devices: DeviceDefinition[] = [...sensorDevices, ...actuatorDevices]

export const systemTopics = {
  status: 'dhbw/iot/system/status',
  heartbeat: 'dhbw/iot/system/heartbeat',
}
