import { useEffect, useMemo, useState } from 'react'
import { logisticsModules } from '../../config/logisticsModules'
import type { LogisticsModule } from '../../types/logistics'
import { useTopicHistory } from '../../hooks/useTopicHistory'
import { isActiveValue } from '../../utils/deviceState'
import { ModuleIcon } from './ModuleIcon'
import { ModuleDetailPanel } from './ModuleDetailPanel'

const STALE_AFTER_MS = 20_000

type ModuleData = {
  module: LogisticsModule
  stateValue?: string | number
  metaValue?: string | number
  lastMessageAt?: Date
  status: 'unknown' | 'active' | 'inactive' | 'stale'
}

const legendEntries: { type: LogisticsModule['type']; label: string }[] = [
  { type: 'InputStation', label: 'Input Station' },
  { type: 'ProductSensor', label: 'Produkt / Box' },
  { type: 'ConveyorShort', label: 'Conveyor Short' },
  { type: 'ConveyorLong', label: 'Conveyor Long' },
  { type: 'ConveyorTurntable', label: 'Turntable Conveyor' },
  { type: 'FillingUnit', label: 'Pneumatic Filling' },
  { type: 'Lift', label: 'Lift' },
  { type: 'WarehouseColumn', label: 'High-Bay Column' },
  { type: 'BinarySensor', label: 'Binary Sensor' },
  { type: 'NfcSensor', label: 'NFC Sensor' },
]

const statusClasses: Record<ModuleData['status'], { dot: string; label: string }> = {
  unknown: { dot: 'bg-slate-300', label: 'keine Daten' },
  inactive: { dot: 'bg-slate-400', label: 'inaktiv' },
  active: { dot: 'bg-emerald-500', label: 'aktiv' },
  stale: { dot: 'bg-amber-400', label: 'veraltet' },
}

const useModuleData = (module: LogisticsModule): ModuleData => {
  const stateData = useTopicHistory(module.stateTopic)
  const metaData = useTopicHistory(module.metaTopic)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 5_000)
    return () => window.clearInterval(id)
  }, [])

  const lastMessageAt = useMemo(() => {
    const stamps = [stateData.latest?.timestamp, metaData.latest?.timestamp].filter(Boolean) as Date[]
    if (stamps.length === 0) return undefined
    return new Date(Math.max(...stamps.map((d) => d.getTime())))
  }, [metaData.latest?.timestamp, stateData.latest?.timestamp])

  const stale = lastMessageAt ? now - lastMessageAt.getTime() > STALE_AFTER_MS : false
  const active = isActiveValue(stateData.latest?.value)

  let status: ModuleData['status'] = 'unknown'
  if (!lastMessageAt) {
    status = 'unknown'
  } else if (stale) {
    status = 'stale'
  } else if (active) {
    status = 'active'
  } else {
    status = 'inactive'
  }

  const data: ModuleData = {
    module,
    stateValue: stateData.latest?.value,
    metaValue: metaData.latest?.value,
    lastMessageAt,
    status,
  }

  return data
}

const ModuleCard = ({
  module,
  onSelect,
}: {
  module: LogisticsModule
  onSelect: (module: LogisticsModule) => void
}) => {
  const data = useModuleData(module)

  const statusStyle = statusClasses[data.status]

  return (
    <button
      className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/80 p-2 shadow-card ring-1 ring-slate-200 transition hover:-translate-y-[55%] hover:shadow-xl"
      style={{ left: module.position.x, top: module.position.y }}
      onClick={() => onSelect(module)}
      aria-label={module.name}
    >
      <span className={`absolute right-1 top-1 h-3 w-3 rounded-full ring-2 ring-white ${statusStyle.dot}`} aria-hidden title={statusStyle.label} />
      <ModuleIcon type={module.type} rotation={module.rotation} />
      <p className="mt-1 text-xs font-semibold text-slate-700">{module.name}</p>
    </button>
  )
}

const SelectedModulePanel = ({ module, onClose }: { module: LogisticsModule; onClose: () => void }) => {
  const data = useModuleData(module)

  return (
    <ModuleDetailPanel
      module={module}
      stateValue={data.stateValue}
      metaValue={data.metaValue}
      lastMessageAt={data.lastMessageAt}
      statusLabel={statusClasses[data.status].label}
      onClose={onClose}
    />
  )
}

export function LogisticsModelView() {
  const [selectedId, setSelectedId] = useState<string>()
  const selectedModule = logisticsModules.find((m) => m.id === selectedId)

  const zones = [
    { label: 'Entry Route', x: 40, y: 460, width: 960, height: 140 },
    { label: 'High Bay Storage', x: 960, y: 80, width: 220, height: 420 },
  ]

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Overview</p>
            <h2 className="text-2xl font-bold text-slate-900">Logistics Model</h2>
            <p className="text-xs text-slate-500">Feste Anordnung basierend auf dem Logistik-Layout. Zustände kommen live via MQTT.</p>
          </div>
          <div className="hidden text-right text-xs text-slate-500 md:block">
            <p>Grün = aktiv</p>
            <p>Orange = veraltet</p>
            <p>Grau = inaktiv/keine Daten</p>
          </div>
        </div>

        <div className="relative mt-4 h-[660px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {zones.map((zone) => (
            <div
              key={zone.label}
              className="pointer-events-none absolute rounded-xl border border-dashed border-slate-300 bg-white/40 px-3 py-2 text-xs font-semibold text-slate-600"
              style={{ left: zone.x, top: zone.y, width: zone.width, height: zone.height }}
            >
              {zone.label}
            </div>
          ))}

          <div className="absolute left-[44%] top-0 h-full w-px bg-slate-200" aria-hidden />
          <div className="absolute left-[85%] top-0 h-full w-px bg-slate-200" aria-hidden />

          {logisticsModules.map((module) => (
            <ModuleCard key={module.id} module={module} onSelect={(m) => setSelectedId(m.id)} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Glossar</p>
        <h3 className="text-xl font-bold text-slate-900">Module &amp; Sensoren</h3>

        <div className="mt-4 space-y-3">
          {legendEntries.map((entry) => (
            <div key={entry.type} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-2">
              <div className="flex items-center justify-center rounded-md bg-white p-2 shadow-sm ring-1 ring-slate-100">
                <ModuleIcon type={entry.type} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{entry.label}</p>
                <p className="text-xs text-slate-500">{entry.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedModule && <SelectedModulePanel module={selectedModule} onClose={() => setSelectedId(undefined)} />}
    </div>
  )
}
