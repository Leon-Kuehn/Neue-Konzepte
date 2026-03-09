import './index.css'
import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { PlantView } from './components/plant/PlantView'
import { KpiCard } from './components/devices/KpiCard'
import { SensorCard } from './components/devices/SensorCard'
import { ActuatorCard } from './components/devices/ActuatorCard'
import { SystemStatusCard } from './components/status/SystemStatusCard'
import { MessageLog } from './components/status/MessageLog'
import { useMqttContext } from './mqtt/MqttProvider'
import { actuatorDevices, sensorDevices } from './config/devices'
import { useDeviceStatus } from './hooks/useDeviceStatus'
import { getDeviceById, isActiveValue } from './utils/deviceState'

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

  const sensorFallback =
    sensorDevices[0] ??
    ({
      id: 'sensor-fallback',
      type: 'sensor',
      name: 'Sensor',
      icon: 'status',
      topics: {},
    } as const)
  const actuatorFallback =
    actuatorDevices[0] ??
    ({
      id: 'actuator-fallback',
      type: 'actuator',
      name: 'Aktor',
      icon: 'status',
      topics: {},
      control: { type: 'toggle' },
    } as const)

  const temperatureStatus = useDeviceStatus(getDeviceById(sensorDevices, 'temperature', sensorFallback))
  const soilStatus = useDeviceStatus(getDeviceById(sensorDevices, 'soil', sensorFallback))
  const energyStatus = useDeviceStatus(getDeviceById(sensorDevices, 'energy', sensorFallback))
  const humidityStatus = useDeviceStatus(getDeviceById(sensorDevices, 'humidity', sensorFallback))

  const pumpStatus = useDeviceStatus(getDeviceById(actuatorDevices, 'pump', actuatorFallback))
  const conveyorStatus = useDeviceStatus(getDeviceById(actuatorDevices, 'conveyor-main', actuatorFallback))
  const rotaryStatus = useDeviceStatus(getDeviceById(actuatorDevices, 'rotary-table', actuatorFallback))

  const activeActuators = useMemo(() => {
    const states = [pumpStatus.state ?? pumpStatus.lastValue, conveyorStatus.state ?? conveyorStatus.lastValue, rotaryStatus.state ?? rotaryStatus.lastValue]
    return states.filter((value) => isActiveValue(value)).length
  }, [
    pumpStatus.lastValue,
    pumpStatus.state,
    conveyorStatus.lastValue,
    conveyorStatus.state,
    rotaryStatus.lastValue,
    rotaryStatus.state,
  ])

  return (
    <div className="flex bg-slate-50">
      <Sidebar />
      <main className="min-h-screen flex-1 px-4 pb-16 lg:ml-64 lg:px-8">
        <Header status={status} lastMessageAt={lastMessageAt} />

        <PlantView />

        <section id="overview" className="mt-10 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Temperatur" value={formatNumber(temperatureStatus.lastValue)} unit="°C" helper="dhbw/iot/sensors/temperature" />
            <KpiCard title="Bodenfeuchte" value={formatNumber(soilStatus.lastValue)} unit="%" helper="dhbw/iot/sensors/soil" />
            <KpiCard title="Energieverbrauch" value={formatNumber(energyStatus.lastValue)} unit="kWh" helper="dhbw/iot/sensors/energy" icon="energy" />
            <KpiCard title="Aktive Aktoren" value={activeActuators} unit="" tone="neutral" helper="Status via .../state Topics" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <MiniHistory title="Verlauf Temperatur" unit="°C" history={temperatureStatus.valueHistory.map((h) => ({ value: h.value, timestamp: h.timestamp }))} />
            <MiniHistory title="Verlauf Luftfeuchte" unit="%" history={humidityStatus.valueHistory.map((h) => ({ value: h.value, timestamp: h.timestamp }))} />
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
            {sensorDevices.map((sensor) => (
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
            {actuatorDevices.map((actuator) => (
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
