import { MqttStatusBadge } from '../status/MqttStatusBadge'
import type { ConnectionStatus } from '../../mqtt/MqttProvider'

const formatDate = (date?: Date) => (date ? new Intl.DateTimeFormat('de-DE', { timeStyle: 'medium' }).format(date) : '—')

type HeaderProps = {
  status: ConnectionStatus
  lastMessageAt?: Date
}

export function Header({ status, lastMessageAt }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 mb-6 flex flex-col gap-4 bg-gradient-to-r from-white via-white/70 to-red-50/60 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-red-700">DHBW IoT Monitoring Dashboard</p>
          <h2 className="text-3xl font-bold text-slate-900">Digital Twin Builder &amp; Live Monitoring</h2>
          <p className="text-sm text-slate-500">
            Fördertechnik, Pumpen, Sensoren &amp; Hochregallager als digitale Zwillinge – verbunden per MQTT.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <MqttStatusBadge status={status} />
          <p className="text-xs text-slate-500">Letzte Nachricht: {formatDate(lastMessageAt)}</p>
        </div>
      </div>
    </header>
  )
}
