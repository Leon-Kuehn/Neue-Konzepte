import './index.css'
import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { KpiCard } from './components/KpiCard'
import { sensors, actuators, kpiTopics } from './config/devices'
import { SensorCard } from './components/SensorCard'
import { ActuatorCard } from './components/ActuatorCard'
import { SystemStatusCard } from './components/SystemStatusCard'
import { MessageLog } from './components/MessageLog'
import { useTopicHistory } from './hooks/useTopicHistory'
import { useMqttContext } from './mqtt/MqttProvider'

const formatNumber = (value?: string | number, digits = 1) => {
  if (value === undefined) return '–'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)
  return numeric.toFixed(digits)
}

const MiniHistory = ({
  title,
  unit,
  history,
}: {
  title: string
  unit?: string
  history: { value: string | number; timestamp: Date }[]
}) => {
  const data =
    history.length > 0
      ? [...history].reverse().map((entry) => ({
          value: typeof entry.value === 'number' ? entry.value : Number(entry.value) || 0,
          time: entry.timestamp.toLocaleTimeString('de-DE', { minute: '2-digit', second: '2-digit' }),
        }))
      : []
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <span className="text-xs text-slate-400">{history.length} Werte</span>
      </div>
      <div className="mt-2 h-32">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip formatter={(val) => [`${val} ${unit ?? ''}`, title]} />
              <Line type="monotone" dataKey="value" stroke="#c6001f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            Noch keine Historie
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const { status, lastMessageAt } = useMqttContext()

  const temperature = useTopicHistory(kpiTopics.temperature, { numeric: true })
  const soil = useTopicHistory(kpiTopics.soil, { numeric: true })
  const energy = useTopicHistory(kpiTopics.energy, { numeric: true })
  const humidity = useTopicHistory('dhbw/iot/sensors/humidity', { numeric: true })

  const pumpState = useTopicHistory(actuators.find((a) => a.id === 'pump')?.topic ?? '')
  const streetState = useTopicHistory(actuators.find((a) => a.id === 'light-street')?.topic ?? '')
  const ventilationState = useTopicHistory(actuators.find((a) => a.id === 'ventilation')?.topic ?? '', { numeric: true })

  const activeActuators = useMemo(() => {
    const states = [pumpState.latest?.value, streetState.latest?.value, ventilationState.latest?.value]
    return states.filter((value) => {
      if (value === undefined) return false
      if (typeof value === 'number') return value > 0
      const normalized = String(value).toUpperCase()
      return normalized !== 'OFF' && normalized !== '0'
    }).length
  }, [pumpState.latest?.value, streetState.latest?.value, ventilationState.latest?.value])

  return (
    <div className="flex bg-slate-50">
      <Sidebar />
      <main className="min-h-screen flex-1 px-4 pb-16 lg:ml-64 lg:px-8">
        <Header status={status} lastMessageAt={lastMessageAt} />

        <section id="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Temperatur" value={formatNumber(temperature.latest?.value)} unit="°C" helper="dhbw/iot/sensors/temperature" />
            <KpiCard title="Bodenfeuchte" value={formatNumber(soil.latest?.value)} unit="%" helper="dhbw/iot/sensors/soil" />
            <KpiCard
              title="Energieverbrauch"
              value={formatNumber(energy.latest?.value)}
              unit="kWh"
              helper="dhbw/iot/sensors/energy"
              icon="energy"
            />
            <KpiCard title="Aktive Aktoren" value={activeActuators} unit="" tone="neutral" helper="Status via .../state Topics" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <MiniHistory title="Verlauf Temperatur" unit="°C" history={temperature.history.map((h) => ({ value: h.value, timestamp: h.timestamp }))} />
            <MiniHistory title="Verlauf Luftfeuchte" unit="%" history={humidity.history.map((h) => ({ value: h.value, timestamp: h.timestamp }))} />
          </div>
        </section>

        <section id="sensors" className="mt-10 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Sensoren</p>
              <h3 className="text-2xl font-semibold text-slate-900">Live-Werte &amp; Historie</h3>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sensors.map((sensor) => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        </section>

        <section id="actuators" className="mt-10 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Aktoren</p>
              <h3 className="text-2xl font-semibold text-slate-900">Steuerung &amp; States</h3>
            </div>
            <p className="text-xs text-slate-500">Kommandos werden an .../set Topics gesendet, States via .../state gelesen.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actuators.map((actuator) => (
              <ActuatorCard key={actuator.id} actuator={actuator} />
            ))}
          </div>
        </section>

        <section id="system" className="mt-10 space-y-4">
          <SystemStatusCard />
          <MessageLog />
        </section>
      </main>
    </div>
  )
}

export default App
