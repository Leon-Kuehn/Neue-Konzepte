import type { ActuatorDevice } from '../../types/devices'
import { useActuatorControl } from '../../hooks/useActuatorControl'
import { NamedIcon } from '../common/Icon'

const formatTimestamp = (date?: Date) => (date ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(date) : '–')

type ActuatorCardProps = {
  actuator: ActuatorDevice
}

export function ActuatorCard({ actuator }: ActuatorCardProps) {
  const stateTopic = actuator.topics.stateTopic ?? actuator.topics.valueTopic
  const commandTopic = actuator.topics.commandTopic ?? actuator.topics.stateTopic
  const { latest } = useActuatorControl(stateTopic, commandTopic)

  const currentValue = latest?.value ?? '—'

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <NamedIcon name={actuator.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Aktor</p>
            <p className="text-lg font-semibold text-slate-900">{actuator.name}</p>
            <p className="text-xs text-slate-500">{actuator.description}</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{commandTopic ?? 'kein Command-Topic'}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-slate-900">{currentValue}</p>
        {actuator.unit && <span className="text-sm text-slate-500">{actuator.unit}</span>}
        <span className="text-xs text-slate-500">Status {formatTimestamp(latest?.timestamp)}</span>
      </div>

      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">Read-only Monitoring</p>
        <p className="mt-1">
          Kommandos werden nicht gesendet. Der aktuelle Zustand wird ausschließlich über das State-Topic{' '}
          <span className="font-mono">{stateTopic ?? '–'}</span> angezeigt.
        </p>
      </div>
    </div>
  )
}
