import { useMemo } from 'react'
import { useMqttContext } from '../mqtt/MqttProvider'

const topicTone = (topic: string) => {
  if (topic.includes('/sensors/')) return 'text-sky-700 bg-sky-50'
  if (topic.includes('/actuators/')) return 'text-red-700 bg-red-50'
  return 'text-slate-700 bg-slate-50'
}

export function MessageLog() {
  const { messageLog } = useMqttContext()
  const log = useMemo(() => messageLog.slice(0, 12), [messageLog])

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">MQTT Log</p>
          <p className="text-lg font-semibold text-slate-900">Letzte Nachrichten</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{log.length} Einträge</span>
      </div>
      <div className="divide-y divide-slate-100">
        {log.length === 0 && <p className="py-4 text-sm text-slate-500">Noch keine MQTT-Nachrichten empfangen.</p>}
        {log.map((entry) => (
          <div key={`${entry.topic}-${entry.timestamp.getTime()}`} className="flex items-start gap-3 py-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${topicTone(entry.topic)}`}>{entry.topic}</span>
                <span className="text-xs text-slate-500">
                  {new Intl.DateTimeFormat('de-DE', { timeStyle: 'medium' }).format(entry.timestamp)}
                </span>
              </div>
              <p className="mt-1 rounded-md bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">{entry.payload}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
