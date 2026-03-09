import type { ModuleBinding, ModuleDefinition, PlacedModule } from '../types/modules'

export const modulePalette: ModuleDefinition[] = [
  {
    type: 'conveyor',
    label: 'Gerades Förderband',
    description: 'Lineares Band für den Materialfluss',
    icon: 'conveyor',
  },
  {
    type: 'turntable',
    label: 'Drehteller / Kurve',
    description: 'Rotierendes Modul für Richtungswechsel',
    icon: 'motor',
  },
  {
    type: 'pump',
    label: 'Pumpe / Füller',
    description: 'Flüssigkeits- oder Kugel-Förderung',
    icon: 'pump',
  },
  {
    type: 'motor',
    label: 'Motor / Antrieb',
    description: 'Generischer Motor oder Hubwerk',
    icon: 'motor',
  },
  {
    type: 'sensor',
    label: 'Binärsensor',
    description: 'Lichtschranke, Endschalter, Präsenz',
    icon: 'presence',
  },
  {
    type: 'nfc',
    label: 'NFC / RFID Leser',
    description: 'Chip- oder ID-Erkennung',
    icon: 'nfc',
  },
]

export const defaultModules: PlacedModule[] = [
  { id: 'conv-main', type: 'conveyor', x: 14, y: 58, rotation: 0, label: 'Förderband Eingang' },
  { id: 'sensor-entry', type: 'sensor', x: 25, y: 52, rotation: 0, label: 'Lichtschranke' },
  { id: 'turn-1', type: 'turntable', x: 42, y: 50, rotation: 90, label: 'Drehteller' },
  { id: 'pump-1', type: 'pump', x: 66, y: 60, rotation: 0, label: 'Pumpe / Befüllung' },
  { id: 'nfc-1', type: 'nfc', x: 58, y: 40, rotation: 0, label: 'NFC Reader' },
  { id: 'conv-out', type: 'conveyor', x: 78, y: 48, rotation: 270, label: 'Auslauf Förderband' },
  { id: 'motor-elevator', type: 'motor', x: 48, y: 28, rotation: 0, label: 'Hub-Motor' },
]

export const defaultBindings: Record<string, ModuleBinding> = {
  'conv-main': {
    deviceType: 'actuator',
    commandTopic: 'dhbw/iot/actuators/conveyor/set',
    stateTopic: 'dhbw/iot/actuators/conveyor/state',
  },
  'turn-1': {
    deviceType: 'actuator',
    commandTopic: 'dhbw/iot/actuators/rotary/set',
    stateTopic: 'dhbw/iot/actuators/rotary/state',
  },
  'pump-1': {
    deviceType: 'actuator',
    commandTopic: 'dhbw/iot/actuators/pump/set',
    stateTopic: 'dhbw/iot/actuators/pump/state',
  },
  'motor-elevator': {
    deviceType: 'actuator',
    commandTopic: 'dhbw/iot/actuators/motor/set',
    stateTopic: 'dhbw/iot/actuators/motor/state',
  },
  'sensor-entry': {
    deviceType: 'sensor',
    stateTopic: 'dhbw/iot/sensors/presence/belt',
  },
  'nfc-1': {
    deviceType: 'sensor',
    stateTopic: 'dhbw/iot/sensors/nfc',
    metaTopic: 'dhbw/iot/sensors/nfc/meta',
  },
  'conv-out': {
    deviceType: 'actuator',
    commandTopic: 'dhbw/iot/actuators/outfeed/set',
    stateTopic: 'dhbw/iot/actuators/outfeed/state',
  },
}
