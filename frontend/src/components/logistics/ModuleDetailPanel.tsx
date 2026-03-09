import { XMarkIcon } from '@heroicons/react/24/outline'
import type { LogisticsModule } from '../../types/logistics'
import { isActiveValue } from '../../utils/deviceState'

type ModuleDetailPanelProps = {
  module: LogisticsModule
  stateValue?: string | number
  metaValue?: string | number
  lastMessageAt?: Date
  statusLabel: string
  onClose: () => void
}

const stateLabelByType: Partial<Record<LogisticsModule['type'], { active: string; inactive: string }>> = {
  InputStation: { active: 'belegt', inactive: 'frei' },
  ProductSensor: { active: 'anwesend', inactive: 'leer' },
  ConveyorLong: { active: 'läuft', inactive: 'steht' },
  ConveyorShort: { active: 'läuft', inactive: 'steht' },
  ConveyorTurntable: { active: 'aktiv', inactive: 'inaktiv' },
  FillingUnit: { active: 'füllt', inactive: 'bereit' },
  Lift: { active: 'in Bewegung', inactive: 'bereit' },
  WarehouseColumn: { active: 'belegt', inactive: 'frei' },
  BinarySensor: { active: 'Signal', inactive: 'kein Signal' },
  NfcSensor: { active: 'Tag erkannt', inactive: 'kein Tag' },
}

const formatStateValue = (module: LogisticsModule, value?: string | number) => {
  const labels = stateLabelByType[module.type]
  if (!labels) return value ?? '–'
  const active = isActiveValue(value)
  return active ? labels.active : labels.inactive
}

const formatLastUpdated = (date?: Date) => {
  if (!date) return 'keine Daten'
  return `${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString('de-DE')}`
}

export function ModuleDetailPanel({ module, stateValue, metaValue, lastMessageAt, statusLabel, onClose }: ModuleDetailPanelProps) {
  return (
    <div className="fixed right-4 top-24 z-30 w-80 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{module.type}</p>
          <h3 className="text-xl font-bold text-slate-900">{module.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Panel schließen"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span className="text-slate-600">Status</span>
          <span className="font-semibold text-slate-900">{statusLabel}</span>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">MQTT Topics</p>
          <dl className="mt-2 space-y-1 text-xs text-slate-700">
            <div className="flex justify-between">
              <dt className="text-slate-500">State</dt>
              <dd className="ml-2 break-all text-right">{module.stateTopic}</dd>
            </div>
            {module.metaTopic && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Meta</dt>
                <dd className="ml-2 break-all text-right">{module.metaTopic}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Live-Daten</p>
          <dl className="mt-2 space-y-1 text-sm text-slate-800">
            <div className="flex justify-between">
              <dt className="text-slate-600">State</dt>
              <dd className="font-semibold">{formatStateValue(module, stateValue)}</dd>
            </div>
            {metaValue !== undefined && (
              <div className="flex justify-between text-xs">
                <dt className="text-slate-600">Meta</dt>
                <dd className="font-mono text-slate-800">{String(metaValue)}</dd>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-500">
              <dt>Letzte Aktualisierung</dt>
              <dd>{formatLastUpdated(lastMessageAt)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
