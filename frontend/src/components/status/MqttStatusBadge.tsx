import clsx from 'clsx'
import type { ConnectionStatus } from '../../mqtt/MqttProvider'

const statusConfig: Record<
  ConnectionStatus,
  { label: string; className: string; dot: string }
> = {
  connected: { label: 'Verbunden', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  reconnecting: { label: 'Reconnecting', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  connecting: { label: 'Verbinden…', className: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500 animate-pulse' },
  offline: { label: 'Offline', className: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
}

export function MqttStatusBadge({ status }: { status: ConnectionStatus }) {
  const config = statusConfig[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
        config.className
      )}
    >
      <span className={clsx('h-2.5 w-2.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
