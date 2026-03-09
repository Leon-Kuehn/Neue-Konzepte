import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { layoutLegend } from '../../config/layout'
import { modulePalette } from '../../config/modules'
import type { ModuleDefinition, PlacedModule } from '../../types/modules'
import { NamedIcon } from '../common/Icon'
import { usePlantStore } from '../../store/plantStore'
import { useModuleSignal } from '../../hooks/useModuleSignal'
import { ModuleOverviewPanel } from './ModuleOverviewPanel'

type PlantNodeProps = {
  module: PlacedModule
  definition: ModuleDefinition
  onSelect: (moduleId: string) => void
}

function PlantNode({ module, definition, onSelect }: PlantNodeProps) {
  const signal = useModuleSignal(module.id)
  const active = signal.active
  const warn = !signal.binding?.stateTopic && !signal.binding?.commandTopic
  const color = warn ? 'bg-amber-400' : active ? 'bg-emerald-500' : 'bg-slate-300'

  return (
    <button
      onClick={() => onSelect(module.id)}
      className={clsx(
        'group absolute flex flex-col rounded-xl px-3 py-2 text-left text-xs text-white shadow-lg ring-2 ring-black/5 transition hover:scale-105',
        color,
        warn ? 'shadow-amber-300/40' : active ? 'shadow-emerald-300/40' : 'shadow-slate-200'
      )}
      style={{ left: `${module.x}%`, top: `${module.y}%`, transform: `translate(-50%, -50%) rotate(${module.rotation}deg)` }}
      aria-label={module.label}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20">
          <NamedIcon name={definition.icon} className="h-4 w-4" />
        </span>
        <span className="font-semibold">{module.label}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px]">
        <span className="rounded-full bg-white/20 px-2 py-0.5">{signal.lastValue ?? '—'}</span>
        <span
          className={clsx('h-2 w-2 rounded-full', signal.recent ? 'bg-white animate-pulse' : 'bg-white/60')}
          title="MQTT Signal"
          aria-label={signal.recent ? 'MQTT Signal: aktiv' : 'MQTT Signal: keine neuen Nachrichten'}
        />
      </div>
    </button>
  )
}

export function PlantView() {
  const { state } = usePlantStore()
  const [selectedId, setSelectedId] = useState<string | null>(state.modules[0]?.id ?? null)
  const definitionMap = useMemo<Record<string, ModuleDefinition>>(
    () => Object.fromEntries(modulePalette.map((m) => [m.type, m])),
    []
  )
  const selectedModule = useMemo(() => state.modules.find((m) => m.id === selectedId), [selectedId, state.modules])

  return (
    <section id="plant" className="mt-10 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Anlagenansicht</p>
          <h3 className="text-2xl font-semibold text-slate-900">Schaltplan / Top-Down Layout</h3>
          <p className="text-xs text-slate-500">
            Diese Ansicht zeigt das aktuelle Layout aus dem Plant Builder. Änderungen bitte im Plant-Builder-Tab vornehmen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {layoutLegend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1 text-xs text-slate-600">
              <span className={clsx('h-3 w-3 rounded-full', item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="relative h-[520px] overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-card">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(198,0,31,0.05),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.05),transparent_40%)]" />
          <div className="relative h-full w-full">
            {state.modules.map((module) => {
              const definition = definitionMap[module.type] ?? { type: module.type, label: module.label, icon: 'status' }
              return <PlantNode key={module.id} module={module} definition={definition} onSelect={setSelectedId} />
            })}
            {state.modules.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                Noch kein Layout vorhanden. Bitte im Plant Builder konfigurieren.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {selectedModule ? (
            <ModuleOverviewPanel module={selectedModule} definition={definitionMap[selectedModule.type] ?? { type: selectedModule.type, label: selectedModule.label, icon: 'status' }} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">
              Wähle ein Gerät-Icon im Schaltplan, um Details zu sehen.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">Signal-Dot pulsiert bei neuen MQTT-Messages</span>
      </div>
    </section>
  )
}
