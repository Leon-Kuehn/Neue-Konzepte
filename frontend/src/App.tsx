import './index.css'
import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { PlantBuilderView } from './components/plant/PlantBuilderView'
import { WarehouseView } from './components/warehouse/WarehouseView'
import { SystemStatusCard } from './components/status/SystemStatusCard'
import { MessageLog } from './components/status/MessageLog'
import { useMqttContext } from './mqtt/MqttProvider'
import { useTheme } from './hooks/useTheme'
import { PlantOverviewPage } from './pages/PlantOverviewPage'
import { MqttSettingsPage } from './pages/MqttSettingsPage'

type TabKey = 'plant-overview' | 'builder' | 'warehouse' | 'status' | 'mqtt-settings'

function App() {
  const { status, lastMessageAt } = useMqttContext()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabKey>('plant-overview')

  const tabs = [
    { key: 'plant-overview', label: 'Plant Overview' },
    { key: 'builder', label: 'Plant Builder' },
    { key: 'warehouse', label: 'Warehouse' },
    { key: 'status', label: 'Status & Logs' },
    { key: 'mqtt-settings', label: 'MQTT Settings' },
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

        {activeTab === 'plant-overview' && <PlantOverviewPage />}
        {activeTab === 'builder' && <PlantBuilderView />}
        {activeTab === 'warehouse' && <WarehouseView />}
        {activeTab === 'status' && (
          <section className="space-y-4">
            <SystemStatusCard />
            <MessageLog />
          </section>
        )}
        {activeTab === 'mqtt-settings' && <MqttSettingsPage />}
      </main>
    </div>
  )
}

export default App
