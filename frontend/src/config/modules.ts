import type { ModuleBinding, ModuleDefinition, ModuleType, PlacedModule } from '../types/modules'
import { getDefaultTopicsForModule } from './mqttTopics'

export const moduleDefinitions: ModuleDefinition[] = [
  {
    type: 'conveyor-infeed',
    label: 'Eingangsförderband',
    description: 'Zuführung aus dem Puffer ins Modell',
    icon: 'conveyor',
    color: 'from-indigo-500 to-blue-500',
    category: 'actuator',
    expectedTopics: { state: ['conveyor-infeed-state'], meta: ['presence-infeed'] },
    valueLabels: { '0': 'steht', '1': 'läuft' },
  },
  {
    type: 'conveyor-transfer',
    label: 'Transferband',
    description: 'Segment zwischen Zuführung und Verteiler',
    icon: 'conveyor',
    color: 'from-blue-500 to-cyan-500',
    category: 'actuator',
    expectedTopics: { state: ['conveyor-transfer-state'] },
    valueLabels: { '0': 'steht', '1': 'läuft' },
  },
  {
    type: 'turntable-diverter',
    label: 'Drehteller / Verteiler',
    description: 'Logistik-Distributor mit 0/1 Stellung',
    icon: 'motor',
    color: 'from-amber-500 to-orange-500',
    category: 'actuator',
    expectedTopics: { state: ['diverter-turntable-state'] },
    valueLabels: { '0': 'Grundstellung', '1': 'gedreht' },
  },
  {
    type: 'conveyor-outfeed',
    label: 'Ausgangsförderband',
    description: 'Abtransport zur Entnahme',
    icon: 'conveyor',
    color: 'from-emerald-500 to-teal-500',
    category: 'actuator',
    expectedTopics: { state: ['conveyor-outfeed-state'], meta: ['presence-outfeed'] },
    valueLabels: { '0': 'steht', '1': 'läuft' },
  },
  {
    type: 'lift',
    label: 'Hub / Lift',
    description: 'Hochregallift, vertikale Achse',
    icon: 'motor',
    color: 'from-purple-500 to-indigo-500',
    category: 'actuator',
    expectedTopics: { state: ['lift-state'], meta: ['warehouse-axis-z'] },
    valueLabels: { '0': 'ruht', '1': 'fährt' },
  },
  {
    type: 'warehouse-axis',
    label: 'Hochregal Achse',
    description: 'X-Achse / Shuttle des Hochregals',
    icon: 'position',
    color: 'from-slate-500 to-slate-600',
    category: 'logical',
    expectedTopics: { meta: ['warehouse-axis-x'] },
  },
  {
    type: 'warehouse-slot',
    label: 'Lagerplatz',
    description: 'Belegung eines Regalplatzes',
    icon: 'position',
    color: 'from-slate-500 to-slate-700',
    category: 'logical',
    expectedTopics: { state: ['warehouse-slot-occupied'] },
    valueLabels: { '0': 'frei', '1': 'belegt' },
  },
  {
    type: 'presence-sensor',
    label: 'Präsenzsensor',
    description: 'Lichtschranke / Gabellichtschranke',
    icon: 'presence',
    color: 'from-cyan-500 to-blue-500',
    category: 'sensor',
    expectedTopics: { state: ['presence-infeed', 'presence-outfeed'] },
    valueLabels: { '0': 'frei', '1': 'Werkstück erkannt' },
  },
  {
    type: 'position-sensor',
    label: 'Positionssensor',
    description: 'Endschalter / Nullpunkt',
    icon: 'position',
    color: 'from-amber-500 to-yellow-500',
    category: 'sensor',
    expectedTopics: { state: ['position-lift-upper', 'position-lift-lower'] },
    valueLabels: { '0': 'nicht erreicht', '1': 'aktiv' },
  },
  {
    type: 'nfc-reader',
    label: 'NFC / RFID Leser',
    description: 'UID der Palette lesen',
    icon: 'nfc',
    color: 'from-rose-500 to-pink-500',
    category: 'sensor',
    expectedTopics: { state: ['nfc-tag'], meta: ['nfc-meta'] },
  },
  {
    type: 'energy-sensor',
    label: 'Energiezähler',
    description: 'Energieverbrauch des Modells',
    icon: 'energy',
    color: 'from-emerald-500 to-green-500',
    category: 'sensor',
    expectedTopics: { state: ['energy-total'] },
  },
  {
    type: 'temperature-sensor',
    label: 'Temperatursensor',
    description: 'Umgebung des Modells',
    icon: 'temperature',
    color: 'from-red-500 to-orange-500',
    category: 'sensor',
    expectedTopics: { state: ['temperature-ambient'] },
  },
]

export const modulePalette = moduleDefinitions

export const moduleDefinitionMap: Record<ModuleType, ModuleDefinition> = Object.fromEntries(
  moduleDefinitions.map((def) => [def.type, def])
) as Record<ModuleType, ModuleDefinition>

export const defaultModules: PlacedModule[] = [
  { id: 'conv-in', type: 'conveyor-infeed', x: 14, y: 62, rotation: 0, label: 'Eingang' },
  { id: 'presence-in', type: 'presence-sensor', x: 24, y: 58, rotation: 0, label: 'Lichtschranke Eingang' },
  { id: 'conv-transfer', type: 'conveyor-transfer', x: 34, y: 62, rotation: 0, label: 'Transferband' },
  { id: 'turntable-1', type: 'turntable-diverter', x: 48, y: 58, rotation: 0, label: 'Verteiler' },
  { id: 'lift-1', type: 'lift', x: 52, y: 36, rotation: 0, label: 'Lift' },
  { id: 'axis-x', type: 'warehouse-axis', x: 66, y: 32, rotation: 0, label: 'X-Achse' },
  { id: 'slot-a1', type: 'warehouse-slot', x: 82, y: 32, rotation: 0, label: 'Lagerplatz A1' },
  { id: 'conv-out', type: 'conveyor-outfeed', x: 68, y: 62, rotation: 0, label: 'Ausgang' },
  { id: 'presence-out', type: 'presence-sensor', x: 78, y: 58, rotation: 0, label: 'Lichtschranke Ausgang' },
  { id: 'position-top', type: 'position-sensor', x: 52, y: 26, rotation: 0, label: 'Lift oben' },
  { id: 'nfc-1', type: 'nfc-reader', x: 36, y: 44, rotation: 0, label: 'NFC Leser' },
  { id: 'energy-1', type: 'energy-sensor', x: 16, y: 32, rotation: 0, label: 'Energie' },
  { id: 'temp-1', type: 'temperature-sensor', x: 24, y: 28, rotation: 0, label: 'Temperatur' },
]

export const bindingForModuleType = (type: ModuleType): ModuleBinding => {
  const topics = getDefaultTopicsForModule(type)
  const definition = moduleDefinitionMap[type]
  return {
    deviceType: definition?.category ?? 'sensor',
    stateTopic: topics.stateTopic,
    metaTopic: topics.metaTopic,
  }
}

export const defaultBindings: Record<string, ModuleBinding> = Object.fromEntries(
  defaultModules.map((module) => [module.id, bindingForModuleType(module.type)])
)
