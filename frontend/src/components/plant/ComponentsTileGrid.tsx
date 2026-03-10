import clsx from 'clsx'
import type { PlantComponent } from '../../types/plant'

type ComponentsTileGridProps = {
  components: PlantComponent[]
  selectedId?: string
  onSelect: (componentId: string) => void
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))

const statusTone = (status: PlantComponent['status']) => (status === 'on' ? 'bg-emerald-500' : 'bg-slate-400')

export function ComponentsTileGrid({ components, selectedId, onSelect }: ComponentsTileGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {components.map((component) => (
        <button
          key={component.id}
          onClick={() => onSelect(component.id)}
          className={clsx(
            'group flex flex-col rounded-2xl border bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lg',
            selectedId === component.id
              ? 'border-red-200 ring-2 ring-red-100'
              : 'border-slate-100 hover:border-red-100'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{component.type}</p>
              <h4 className="text-lg font-semibold text-slate-900">{component.name}</h4>
              <p className="text-[11px] text-slate-400">ID: {component.id}</p>
            </div>
            <span
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                component.online ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              )}
            >
              <span className={clsx('h-2 w-2 rounded-full', component.online ? 'bg-emerald-500' : 'bg-slate-400')} />
              {component.online ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className={clsx('flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white', component.status === 'on' ? 'bg-emerald-600' : 'bg-slate-400')}>
              <span className={clsx('h-2 w-2 rounded-full', statusTone(component.status))} />
              {component.status === 'on' ? 'Aktiv' : 'Aus'}
            </span>
            <span className="text-xs text-slate-500">Zuletzt geändert: {formatDate(component.lastChanged)}</span>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
            {component.stats.cycles !== undefined && <span>Schaltungen: {component.stats.cycles}</span>}
            {component.stats.uptimeHours !== undefined && <span>Laufzeit: {component.stats.uptimeHours} h</span>}
          </div>
        </button>
      ))}
    </div>
  )
}
