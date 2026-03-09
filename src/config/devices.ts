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

export type SensorDefinition = {
  id: string
  name: string
  topic: string
  unit: string
  icon: IconName
  color: string
  description?: string
}

export type ActuatorControl =
  | { type: 'toggle'; onLabel?: string; offLabel?: string }
  | { type: 'select'; options: { label: string; value: string }[] }
  | { type: 'slider'; min: number; max: number; step?: number }

export type ActuatorDefinition = {
  id: string
  name: string
  topic: string
  setTopic: string
  icon: IconName
  description?: string
  unit?: string
  control: ActuatorControl
}

export const sensors: SensorDefinition[] = [
  {
    id: 'temperature',
    name: 'Temperatur',
    topic: 'dhbw/iot/sensors/temperature',
    unit: '°C',
    icon: 'temperature',
    color: 'from-red-500 to-orange-500',
    description: 'Aktuelle Umgebungstemperatur',
  },
  {
    id: 'humidity',
    name: 'Luftfeuchtigkeit',
    topic: 'dhbw/iot/sensors/humidity',
    unit: '%',
    icon: 'humidity',
    color: 'from-sky-500 to-cyan-500',
    description: 'Rel. Luftfeuchte im Messbereich',
  },
  {
    id: 'light',
    name: 'Lichtstärke',
    topic: 'dhbw/iot/sensors/light',
    unit: 'lx',
    icon: 'light',
    color: 'from-amber-400 to-yellow-500',
    description: 'Helligkeit für Außen-/Innenbereiche',
  },
  {
    id: 'soil',
    name: 'Bodenfeuchte',
    topic: 'dhbw/iot/sensors/soil',
    unit: '%',
    icon: 'soil',
    color: 'from-emerald-500 to-green-600',
    description: 'Feuchtegehalt im Boden / Pflanzkasten',
  },
  {
    id: 'energy',
    name: 'Energieverbrauch',
    topic: 'dhbw/iot/sensors/energy',
    unit: 'kWh',
    icon: 'energy',
    color: 'from-indigo-500 to-purple-500',
    description: 'Aktueller Energieverbrauch',
  },
]

export const actuators: ActuatorDefinition[] = [
  {
    id: 'pump',
    name: 'Pumpe',
    topic: 'dhbw/iot/actuators/pump',
    setTopic: 'dhbw/iot/actuators/pump/set',
    icon: 'pump',
    description: 'Bewässerung steuern (ON/OFF)',
    control: { type: 'toggle', onLabel: 'AN', offLabel: 'AUS' },
  },
  {
    id: 'light-street',
    name: 'Straßenlicht',
    topic: 'dhbw/iot/actuators/light-street',
    setTopic: 'dhbw/iot/actuators/light-street/set',
    icon: 'streetlight',
    description: 'AUTO / EIN / AUS für Straßenbeleuchtung',
    control: {
      type: 'select',
      options: [
        { label: 'Auto', value: 'AUTO' },
        { label: 'Ein', value: 'ON' },
        { label: 'Aus', value: 'OFF' },
      ],
    },
  },
  {
    id: 'ventilation',
    name: 'Belüftung',
    topic: 'dhbw/iot/actuators/ventilation',
    setTopic: 'dhbw/iot/actuators/ventilation/set',
    unit: '%',
    icon: 'ventilation',
    description: '0–100% Ventilationssteuerung',
    control: { type: 'slider', min: 0, max: 100, step: 5 },
  },
]

export const systemTopics = {
  status: 'dhbw/iot/system/status',
  heartbeat: 'dhbw/iot/system/heartbeat',
}

export const kpiTopics = {
  temperature: 'dhbw/iot/sensors/temperature',
  soil: 'dhbw/iot/sensors/soil',
  energy: 'dhbw/iot/sensors/energy',
}

// Hinweis: Neue Sensoren/Aktoren können über die obigen Arrays ergänzt werden.
// Die Komponenten lesen das Schema dynamisch aus, so dass keine weiteren
// Stellen angepasst werden müssen, solange Topic & Typ definiert sind.
