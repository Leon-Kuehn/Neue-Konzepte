import type { ModuleType } from '../types/modules'

export type TopicKind = 'state' | 'meta'

export type MqttTopicOption = {
  id: string
  label: string
  topic: string
  moduleTypes: ModuleType[]
  kind: TopicKind
  description?: string
  valueLabels?: Record<string, string>
}

export const mqttTopicOptions: MqttTopicOption[] = [
  {
    id: 'conveyor-infeed-state',
    label: 'Eingangsförderband',
    topic: 'dhbw-hbs/line/infeed/state',
    moduleTypes: ['conveyor-infeed'],
    kind: 'state',
    description: 'Motorstatus des Eingangsförderers',
    valueLabels: { '0': 'steht', '1': 'läuft' },
  },
  {
    id: 'conveyor-transfer-state',
    label: 'Transferband Mitte',
    topic: 'dhbw-hbs/line/transfer/state',
    moduleTypes: ['conveyor-transfer'],
    kind: 'state',
    description: 'Segment zwischen Zuführung und Verteiler',
    valueLabels: { '0': 'steht', '1': 'läuft' },
  },
  {
    id: 'conveyor-outfeed-state',
    label: 'Ausgangsförderband',
    topic: 'dhbw-hbs/line/outfeed/state',
    moduleTypes: ['conveyor-outfeed'],
    kind: 'state',
    description: 'Abtransport Richtung Ausgabe',
    valueLabels: { '0': 'steht', '1': 'läuft' },
  },
  {
    id: 'diverter-turntable-state',
    label: 'Drehteller / Verteiler',
    topic: 'dhbw-hbs/diverter/turntable/state',
    moduleTypes: ['turntable-diverter'],
    kind: 'state',
    description: 'Verteilt Werkstücke (0/1 = Stellung)',
    valueLabels: { '0': 'Grundstellung', '1': 'gedreht' },
  },
  {
    id: 'lift-state',
    label: 'Hochregallift Bewegung',
    topic: 'iot-logistikmodel/warehouse/lift/state',
    moduleTypes: ['lift'],
    kind: 'state',
    description: 'Bewegt sich / ruht',
    valueLabels: { '0': 'ruht', '1': 'fährt' },
  },
  {
    id: 'warehouse-axis-x',
    label: 'Hochregal X-Position',
    topic: 'iot-logistikmodel/warehouse/axis/x/position',
    moduleTypes: ['warehouse-axis'],
    kind: 'meta',
    description: 'Schlittenposition X-Achse (mm)',
  },
  {
    id: 'warehouse-axis-z',
    label: 'Hochregal Z-Position',
    topic: 'iot-logistikmodel/warehouse/axis/z/position',
    moduleTypes: ['warehouse-axis', 'lift'],
    kind: 'meta',
    description: 'Hubhöhe des Lifts (mm)',
  },
  {
    id: 'warehouse-slot-occupied',
    label: 'Lagerplatz Belegung',
    topic: 'iot-logistikmodel/warehouse/slot/occupied',
    moduleTypes: ['warehouse-slot'],
    kind: 'state',
    description: '0 = frei, 1 = belegt',
    valueLabels: { '0': 'frei', '1': 'belegt' },
  },
  {
    id: 'presence-infeed',
    label: 'Lichtschranke Zuführung',
    topic: 'dhbw-hbs/sensors/presence/infeed',
    moduleTypes: ['presence-sensor', 'conveyor-infeed'],
    kind: 'state',
    description: 'Werkstück erkannt am Eingang',
    valueLabels: { '0': 'frei', '1': 'Werkstück erkannt' },
  },
  {
    id: 'presence-outfeed',
    label: 'Lichtschranke Ausgang',
    topic: 'dhbw-hbs/sensors/presence/outfeed',
    moduleTypes: ['presence-sensor', 'conveyor-outfeed'],
    kind: 'state',
    description: 'Werkstück bereit zur Entnahme',
    valueLabels: { '0': 'frei', '1': 'Werkstück anwesend' },
  },
  {
    id: 'position-lift-upper',
    label: 'Lift Endlage oben',
    topic: 'dhbw-hbs/sensors/position/lift-upper',
    moduleTypes: ['position-sensor', 'lift'],
    kind: 'state',
    description: 'Obere Endlage erreicht',
    valueLabels: { '0': 'nicht oben', '1': 'oben' },
  },
  {
    id: 'position-lift-lower',
    label: 'Lift Endlage unten',
    topic: 'dhbw-hbs/sensors/position/lift-lower',
    moduleTypes: ['position-sensor', 'lift'],
    kind: 'state',
    description: 'Untere Endlage erreicht',
    valueLabels: { '0': 'nicht unten', '1': 'unten' },
  },
  {
    id: 'nfc-tag',
    label: 'NFC UID',
    topic: 'iot-logistikmodel/sensors/nfc/tag',
    moduleTypes: ['nfc-reader'],
    kind: 'state',
    description: 'Tag/UID der Palette',
  },
  {
    id: 'nfc-meta',
    label: 'NFC Meta',
    topic: 'iot-logistikmodel/sensors/nfc/meta',
    moduleTypes: ['nfc-reader'],
    kind: 'meta',
    description: 'Typ / Zusatzinformationen',
  },
  {
    id: 'energy-total',
    label: 'Energieverbrauch',
    topic: 'iot-logistikmodel/telemetry/energy/total',
    moduleTypes: ['energy-sensor'],
    kind: 'state',
    description: 'kWh Gesamtverbrauch',
  },
  {
    id: 'temperature-ambient',
    label: 'Umgebungstemperatur',
    topic: 'iot-logistikmodel/telemetry/environment/temperature',
    moduleTypes: ['temperature-sensor'],
    kind: 'state',
    description: 'Temperatur am Modell (°C)',
  },
]

const defaultTopicByModule: Partial<Record<ModuleType, { stateTopic?: string; metaTopic?: string }>> = {
  'conveyor-infeed': { stateTopic: 'dhbw-hbs/line/infeed/state' },
  'conveyor-transfer': { stateTopic: 'dhbw-hbs/line/transfer/state' },
  'conveyor-outfeed': { stateTopic: 'dhbw-hbs/line/outfeed/state' },
  'turntable-diverter': { stateTopic: 'dhbw-hbs/diverter/turntable/state' },
  lift: { stateTopic: 'iot-logistikmodel/warehouse/lift/state', metaTopic: 'iot-logistikmodel/warehouse/axis/z/position' },
  'warehouse-axis': { metaTopic: 'iot-logistikmodel/warehouse/axis/x/position' },
  'warehouse-slot': { stateTopic: 'iot-logistikmodel/warehouse/slot/occupied' },
  'presence-sensor': { stateTopic: 'dhbw-hbs/sensors/presence/infeed' },
  'position-sensor': { stateTopic: 'dhbw-hbs/sensors/position/lift-upper' },
  'nfc-reader': { stateTopic: 'iot-logistikmodel/sensors/nfc/tag', metaTopic: 'iot-logistikmodel/sensors/nfc/meta' },
  'energy-sensor': { stateTopic: 'iot-logistikmodel/telemetry/energy/total' },
  'temperature-sensor': { stateTopic: 'iot-logistikmodel/telemetry/environment/temperature' },
}

export const getTopicOptionsForModule = (moduleType: ModuleType, kind: TopicKind) =>
  mqttTopicOptions.filter((opt) => opt.kind === kind && opt.moduleTypes.includes(moduleType))

export const getDefaultTopicsForModule = (moduleType: ModuleType) => defaultTopicByModule[moduleType] ?? {}

const valueLabelsByTopic = new Map<string, Record<string, string>>(
  mqttTopicOptions
    .filter((opt): opt is MqttTopicOption & { valueLabels: Record<string, string> } => Boolean(opt.valueLabels))
    .map((opt) => [opt.topic, opt.valueLabels])
)

export const getValueLabelsForTopic = (topic?: string) => (topic ? valueLabelsByTopic.get(topic) : undefined)
