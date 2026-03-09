import './index.css'
import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { PlantView } from './components/plant/PlantView'
import { PlantBuilderView } from './components/plant/PlantBuilderView'
import { WarehouseView } from './components/warehouse/WarehouseView'
import { KpiCard } from './components/devices/KpiCard'
import { SensorCard } from './components/devices/SensorCard'
import { ActuatorCard } from './components/devices/ActuatorCard'
import { SystemStatusCard } from './components/status/SystemStatusCard'
import { MessageLog } from './components/status/MessageLog'
import { useMqttContext } from './mqtt/MqttProvider'
import { actuatorDevices, sensorDevices } from './config/devices'
import { useDeviceStatus } from './hooks/useDeviceStatus'
import { getDeviceById, isActiveValue } from './utils/deviceState'
import { SettingsView } from './components/settings/SettingsView'
import { useTheme } from './hooks/useTheme'

const formatNumber = (value?: string | number, digits = 1) => {
  if (value === undefined) return '–'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)
  return numeric.toFixed(digits)
}

const formatPresence = (value?: string | number, activeLabel = 'belegt', inactiveLabel = 'frei') => {
  if (value === undefined) return '–'
  return isActiveValue(value) ? activeLabel : inactiveLabel
}

type TabKey = 'overview' | 'builder' | 'warehouse' | 'status' | 'settings'

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
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabKey>('builder')

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
  const energyStatus = useDeviceStatus(getDeviceById(sensorDevices, 'energy', sensorFallback))
  const presenceInStatus = useDeviceStatus(getDeviceById(sensorDevices, 'presence-infeed', sensorFallback))

  const infeedStatus = useDeviceStatus(getDeviceById(actuatorDevices, 'conveyor-infeed', actuatorFallback))
  const transferStatus = useDeviceStatus(getDeviceById(actuatorDevices, 'conveyor-transfer', actuatorFallback))
  const outfeedStatus = useDeviceStatus(getDeviceById(actuatorDevices, 'conveyor-outfeed', actuatorFallback))
  const turntableStatus = useDeviceStatus(getDeviceById(actuatorDevices, 'turntable-diverter', actuatorFallback))
  const liftStatus = useDeviceStatus(getDeviceById(actuatorDevices, 'lift', actuatorFallback))

  const activeActuators = useMemo(() => {
    const states = [
      infeedStatus.state ?? infeedStatus.lastValue,
      transferStatus.state ?? transferStatus.lastValue,
      outfeedStatus.state ?? outfeedStatus.lastValue,
      turntableStatus.state ?? turntableStatus.lastValue,
      liftStatus.state ?? liftStatus.lastValue,
    ]
    return states.filter((value) => isActiveValue(value)).length
  }, [
    infeedStatus.lastValue,
    infeedStatus.state,
    transferStatus.lastValue,
    transferStatus.state,
    outfeedStatus.lastValue,
    outfeedStatus.state,
    turntableStatus.lastValue,
    turntableStatus.state,
    liftStatus.lastValue,
    liftStatus.state,
  ])

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'builder', label: 'Plant Builder' },
    { key: 'warehouse', label: 'Warehouse' },
    { key: 'status', label: 'MQTT & Status' },
    { key: 'settings', label: 'Settings' },
  ] as const satisfies { key: TabKey; label: string }[]

  return (
    <div className="flex bg-slate-50" data-theme={theme}>
      <Sidebar active={activeTab} onSelect={(key) => setActiveTab(key as TabKey)} />
      <main className="min-h-screen flex-1 px-4 pb-16 lg:ml-64 lg:px-8">
        <Header status={status} lastMessageAt={lastMessageAt} />

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                activeTab === tab.key ? 'bg-red-600 text-white' : 'bg-white text-slate-700 hover:bg-red-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-10">
            <PlantView />

            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  title="Temperatur"
                  value={formatNumber(temperatureStatus.lastValue)}
                  unit="°C"
                  helper="iot-logistikmodel/telemetry/environment/temperature"
                />
                <KpiCard
                  title="Energieverbrauch"
                  value={formatNumber(energyStatus.lastValue)}
                  unit="kWh"
                  helper="iot-logistikmodel/telemetry/energy/total"
                  icon="energy"
                />
                <KpiCard
                  title="Zuführung"
                  value={formatPresence(presenceInStatus.lastValue, 'Werkstück', 'frei')}
                  helper="dhbw-hbs/sensors/presence/infeed"
                  icon="presence"
                  tone="neutral"
                />
                <KpiCard title="Aktive Aktoren" value={activeActuators} unit="" tone="neutral" helper="Status via echte /state Topics" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <MiniHistory title="Verlauf Temperatur" unit="°C" history={temperatureStatus.valueHistory.map((h) => ({ value: h.value, timestamp: h.timestamp }))} />
                <MiniHistory title="Verlauf Energie" unit="kWh" history={energyStatus.valueHistory.map((h) => ({ value: h.value, timestamp: h.timestamp }))} />
              </div>
            </section>

            <section className="space-y-4">
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

            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Aktoren</p>
                  <h3 className="text-2xl font-semibold text-slate-900">States (read-only)</h3>
                </div>
                <p className="text-xs text-slate-500">Nur Anzeige der echten /state Topics, keine Kommandos.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {actuatorDevices.map((actuator) => (
                  <ActuatorCard key={actuator.id} actuator={actuator} />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'builder' && <PlantBuilderView />}
        {activeTab === 'warehouse' && <WarehouseView />}
        {activeTab === 'status' && (
          <section className="space-y-4">
            <SystemStatusCard />
            <MessageLog />
          </section>
        )}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}

export default App
