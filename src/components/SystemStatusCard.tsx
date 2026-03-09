import { systemTopics } from '../config/devices'
import { useTopicHistory } from '../hooks/useTopicHistory'
import { useMqttContext } from '../mqtt/MqttProvider'
import { mqttConfig } from '../mqtt/mqttConfig'
import { MqttStatusBadge } from './MqttStatusBadge'
import { NamedIcon } from './Icon'

const formatDateTime = (date?: Date) =>
  date ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'medium' }).format(date) : '–'

export function SystemStatusCard() {
  const { status, lastMessageAt } = useMqttContext()
  const { latest: statusMsg } = useTopicHistory(systemTopics.status)
  const { latest: heartbeatMsg } = useTopicHistory(systemTopics.heartbeat)

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
            <NamedIcon name="status" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Systemstatus</p>
            <p className="text-xl font-semibold text-slate-900">MQTT Broker &amp; Heartbeat</p>
          </div>
        </div>
        <MqttStatusBadge status={status} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Broker</p>
          <p className="text-sm font-semibold text-slate-900">{mqttConfig.url}</p>
          <p className="text-xs text-slate-500">Username: {mqttConfig.username ?? '–'}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Heartbeat</p>
          <p className="text-lg font-semibold text-slate-900">{heartbeatMsg?.value ?? '—'}</p>
          <p className="text-xs text-slate-500">Letzter Empfang: {formatDateTime(heartbeatMsg?.timestamp)}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">System</p>
          <p className="text-lg font-semibold text-slate-900">{statusMsg?.value ?? 'OK'}</p>
          <p className="text-xs text-slate-500">Letzte MQTT-Nachricht: {formatDateTime(lastMessageAt)}</p>
        </div>
      </div>
    </div>
  )
}
