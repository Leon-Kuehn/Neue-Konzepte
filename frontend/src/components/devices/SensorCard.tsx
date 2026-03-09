import { NamedIcon } from '../common/Icon'
import type { SensorDevice } from '../../types/devices'
import { useDeviceStatus } from '../../hooks/useDeviceStatus'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const formatTime = (date?: Date) => (date ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(date) : '—')

type SensorCardProps = {
  sensor: SensorDevice
}

export function SensorCard({ sensor }: SensorCardProps) {
  const { valueHistory: history, lastValue, lastSeenAt, isConnected, valueTopic } = useDeviceStatus(sensor)
  const chartData =
    history.length > 0
      ? [...history].reverse().map((entry) => ({
          value: typeof entry.value === 'number' ? entry.value : Number(entry.value) || 0,
          time: entry.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        }))
      : []

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${sensor.accent ?? 'from-slate-200 to-slate-300'} text-slate-800`}>
            <NamedIcon name={sensor.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Sensor</p>
            <p className="text-lg font-semibold text-slate-900">{sensor.name}</p>
            <p className="text-xs text-slate-500">{sensor.description}</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{valueTopic ?? 'kein Topic'}</span>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-4xl font-semibold text-slate-900">
          {lastValue ?? '—'}
          <span className="text-lg font-medium text-slate-500">{sensor.unit}</span>
        </span>
        <span className="text-xs text-slate-500">zuletzt {formatTime(lastSeenAt)}</span>
        {!isConnected && <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-800">Wartet auf Daten</span>}
      </div>

      <div className="mt-4 h-28 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }}
                formatter={(val) => [`${val} ${sensor.unit}`, sensor.name]}
              />
              <Line type="monotone" dataKey="value" stroke="#c6001f" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            Noch keine MQTT-Werte empfangen
          </div>
        )}
      </div>
    </div>
  )
}
