import clsx from 'clsx'
import type { PlantComponent } from '../../types/plant'

type ComponentDetailsPanelProps = {
  component?: PlantComponent
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))

export function ComponentDetailsPanel({ component }: ComponentDetailsPanelProps) {
  if (!component) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-card">
        Wähle eine Kachel oder ein SVG-Element, um Details zu sehen.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{component.type}</p>
            <h4 className="text-xl font-semibold text-slate-900">{component.name}</h4>
            <p className="text-xs text-slate-400">ID: {component.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                component.online ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              )}
            >
              <span className={clsx('h-2 w-2 rounded-full', component.online ? 'bg-emerald-500' : 'bg-slate-400')} />
              {component.online ? 'Online' : 'Offline'}
            </span>
            <span
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white',
                component.status === 'on' ? 'bg-emerald-600' : 'bg-slate-500'
              )}
            >
              <span className="h-2 w-2 rounded-full bg-white" />
              {component.status === 'on' ? 'Aktiv' : 'Aus'}
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live-Status</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Typ</span>
                <span className="font-semibold text-slate-800">{component.type}</span>
              </li>
              <li className="flex justify-between">
                <span>Status</span>
                <span className="font-semibold text-slate-800">{component.status === 'on' ? 'Ein' : 'Aus'}</span>
              </li>
              <li className="flex justify-between">
                <span>Zuletzt geändert</span>
                <span className="font-semibold text-slate-800">{formatDate(component.lastChanged)}</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kennzahlen</p>
            <ul className="mt-2 space-y-1 text-sm">
              {component.stats.cycles !== undefined && (
                <li className="flex justify-between">
                  <span>Schaltungen</span>
                  <span className="font-semibold text-slate-800">{component.stats.cycles}</span>
                </li>
              )}
              {component.stats.uptimeHours !== undefined && (
                <li className="flex justify-between">
                  <span>Laufzeit</span>
                  <span className="font-semibold text-slate-800">{component.stats.uptimeHours} h</span>
                </li>
              )}
              {component.stats.cycles === undefined && component.stats.uptimeHours === undefined && (
                <li className="text-slate-500">Keine Kennzahlen hinterlegt.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Historische Daten (REST API) – TODO</p>
          <p className="mt-2 text-sm text-slate-600">REST-Endpunkte werden angebunden, um Verlaufswerte dieses Gerätes zu laden.</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trenddiagramm – Platzhalter</p>
          <p className="mt-2 text-sm text-slate-600">Zeitreihenvisualisierung folgt. Aktuell Platzhalter für Sparkline/Chart.</p>
        </div>
      </div>
    </div>
  )
}
