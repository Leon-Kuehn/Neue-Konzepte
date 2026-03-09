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
    topics: { valueTopic: 'dhbw/iot/sensors/temperature' },
    description: 'Umgebungstemperatur der Anlage',
  },
  {
    id: 'humidity',
    type: 'sensor',
    name: 'Luftfeuchtigkeit',
    icon: 'humidity',
    unit: '%',
    valueType: 'number',
    kind: 'environment',
    accent: 'from-sky-500 to-cyan-500',
    topics: { valueTopic: 'dhbw/iot/sensors/humidity' },
    description: 'Relative Luftfeuchte',
  },
  {
    id: 'soil',
    type: 'sensor',
    name: 'Bodenfeuchte',
    icon: 'soil',
    unit: '%',
    valueType: 'number',
    kind: 'environment',
    accent: 'from-emerald-500 to-green-600',
    topics: { valueTopic: 'dhbw/iot/sensors/soil' },
    description: 'Feuchtegehalt im Substrat',
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
    topics: { valueTopic: 'dhbw/iot/sensors/energy' },
    description: 'Aktueller Verbrauch',
  },
  {
    id: 'presence-belt',
    type: 'sensor',
    name: 'Lichtschranke Förderband',
    icon: 'presence',
    kind: 'presence',
    topics: { valueTopic: 'dhbw/iot/sensors/presence/belt' },
    description: 'Objekt erkannt / frei',
  },
  {
    id: 'position-rotary',
    type: 'sensor',
    name: 'Positionssensor Drehteller',
    icon: 'position',
    kind: 'position',
    topics: { valueTopic: 'dhbw/iot/sensors/position/rotary' },
    description: 'Endlage / Segment',
  },
  {
    id: 'nfc-reader',
    type: 'sensor',
    name: 'NFC / Chip Reader',
    icon: 'nfc',
    valueType: 'string',
    kind: 'nfc',
    topics: { valueTopic: 'dhbw/iot/sensors/nfc' },
    description: 'Chip-ID oder Typ des aufgelegten Objekts',
  },
]

export const actuatorDevices: ActuatorDevice[] = [
  {
    id: 'conveyor-main',
    type: 'actuator',
    name: 'Förderband',
    icon: 'conveyor',
    topics: {
      stateTopic: 'dhbw/iot/actuators/conveyor/state',
      commandTopic: 'dhbw/iot/actuators/conveyor/set',
    },
    description: 'Start/Stop Förderband, Richtung optional',
    control: { type: 'toggle', onLabel: 'Start', offLabel: 'Stop' },
  },
  {
    id: 'pump',
    type: 'actuator',
    name: 'Pumpe / Ventil',
    icon: 'pump',
    topics: {
      stateTopic: 'dhbw/iot/actuators/pump/state',
      commandTopic: 'dhbw/iot/actuators/pump/set',
    },
    description: 'Bewässerung an/aus',
    control: { type: 'toggle', onLabel: 'AN', offLabel: 'AUS' },
  },
  {
    id: 'rotary-table',
    type: 'actuator',
    name: 'Drehteller / Motor',
    icon: 'motor',
    unit: '%',
    topics: {
      stateTopic: 'dhbw/iot/actuators/rotary/state',
      commandTopic: 'dhbw/iot/actuators/rotary/set',
    },
    description: 'Drehzahl / Geschwindigkeit 0–100%',
    control: { type: 'slider', min: 0, max: 100, step: 10 },
  },
  {
    id: 'light-street',
    type: 'actuator',
    name: 'Straßenlicht',
    icon: 'streetlight',
    topics: {
      stateTopic: 'dhbw/iot/actuators/light-street/state',
      commandTopic: 'dhbw/iot/actuators/light-street/set',
    },
    description: 'AUTO / EIN / AUS',
    control: {
      type: 'select',
      options: [
        { label: 'Auto', value: 'AUTO' },
        { label: 'Ein', value: 'ON' },
        { label: 'Aus', value: 'OFF' },
      ],
    },
  },
]

export const devices: DeviceDefinition[] = [...sensorDevices, ...actuatorDevices]

export const systemTopics = {
  status: 'dhbw/iot/system/status',
  heartbeat: 'dhbw/iot/system/heartbeat',
}
