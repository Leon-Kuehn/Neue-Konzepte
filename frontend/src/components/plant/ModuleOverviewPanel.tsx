import { NamedIcon } from '../common/Icon'
import { useModuleSignal } from '../../hooks/useModuleSignal'
import type { ModuleDefinition, PlacedModule } from '../../types/modules'
import { isActiveValue } from '../../utils/deviceState'
import { clsx } from 'clsx'

const formatTime = (date?: Date) => (date ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date) : '–')

type ModuleOverviewPanelProps = {
  module: PlacedModule
  definition: ModuleDefinition
}

export function ModuleOverviewPanel({ module, definition }: ModuleOverviewPanelProps) {
  const { lastValue, metaValue, lastMessageAt, binding, stateHistory, metaHistory } = useModuleSignal(module.id)
  const active = isActiveValue(lastValue)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
            <NamedIcon name={definition.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{module.type}</p>
            <p className="text-lg font-semibold text-slate-900">{module.label}</p>
            <p className="text-xs text-slate-500">Rotation: {module.rotation}°</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">State</p>
          <p className={clsx('mt-1 text-lg font-semibold', active ? 'text-emerald-700' : 'text-slate-900')}>{lastValue ?? '–'}</p>
          <p className="text-[11px] text-slate-500 break-all">{binding?.stateTopic || 'kein Topic gesetzt'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Meta</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{metaValue ?? '–'}</p>
          <p className="text-[11px] text-slate-500 break-all">{binding?.metaTopic || 'kein Topic gesetzt'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Letzte Nachricht</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatTime(lastMessageAt)}</p>
          <p className="text-[11px] text-slate-500">{binding?.deviceType === 'actuator' ? 'Aktor' : 'Sensor'}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">State Historie</p>
          <div className="mt-2 max-h-32 space-y-1 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700">
            {stateHistory.length === 0 && <p className="text-slate-500">Noch keine Werte empfangen.</p>}
            {stateHistory.slice(0, 10).map((entry, idx) => (
              <div key={`${entry.timestamp.getTime()}-${idx}`} className="flex items-center justify-between">
                <span>{formatTime(entry.timestamp)}</span>
                <span className="font-mono">{entry.raw}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meta Historie</p>
          <div className="mt-2 max-h-32 space-y-1 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700">
            {metaHistory.length === 0 && <p className="text-slate-500">Noch keine Werte empfangen.</p>}
            {metaHistory.slice(0, 10).map((entry, idx) => (
              <div key={`${entry.timestamp.getTime()}-${idx}`} className="flex items-center justify-between">
                <span>{formatTime(entry.timestamp)}</span>
                <span className="font-mono">{entry.raw}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
