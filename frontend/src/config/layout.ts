export type LayoutNode = {
  deviceId: string
  x: number // Prozent
  y: number // Prozent
  area?: string
  label?: string
}

export const layoutNodes: LayoutNode[] = [
  { deviceId: 'conveyor-main', x: 15, y: 40, area: 'Förderstrecke', label: 'Förderband' },
  { deviceId: 'presence-belt', x: 30, y: 38, area: 'Förderstrecke', label: 'Lichtschranke' },
  { deviceId: 'rotary-table', x: 55, y: 45, area: 'Drehteller', label: 'Drehteller' },
  { deviceId: 'position-rotary', x: 55, y: 30, area: 'Drehteller', label: 'Positionssensor' },
  { deviceId: 'pump', x: 75, y: 55, area: 'Flüssigkeiten', label: 'Pumpe' },
  { deviceId: 'light-street', x: 10, y: 15, area: 'Umfeld', label: 'Licht' },
  { deviceId: 'nfc-reader', x: 45, y: 65, area: 'Sortierung', label: 'NFC Reader' },
  { deviceId: 'temperature', x: 82, y: 18, area: 'Umwelt', label: 'Temp' },
  { deviceId: 'humidity', x: 88, y: 28, area: 'Umwelt', label: 'Hum' },
]

export const layoutLegend = [
  { label: 'Grün = aktiv', className: 'bg-emerald-500' },
  { label: 'Grau = inaktiv', className: 'bg-slate-300' },
  { label: 'Orange = Warnung/keine Daten', className: 'bg-amber-400' },
]
