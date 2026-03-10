import { useState } from 'react'
import {
  connect,
  disconnect,
  getConnectionState,
  loadMqttSettings,
  persistMqttSettings,
  type MqttConnectionState,
  type MqttSettings,
} from '../services/mqttClient'

const statusTone = (status: MqttConnectionState) =>
  status === 'connected' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'

export function MqttSettingsPage() {
  const [form, setForm] = useState<MqttSettings>(() => loadMqttSettings())
  const [status, setStatus] = useState<MqttConnectionState>(() => getConnectionState())

  const handleChange = (key: keyof MqttSettings, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'useTLS' && value === true && prev.port === 1883 ? { port: 8883 } : {}),
    }))
  }

  const handlePersist = () => {
    persistMqttSettings(form)
  }

  const handleConnect = async () => {
    await connect(form)
    setStatus('connected')
  }

  const handleDisconnect = async () => {
    await disconnect()
    setStatus('disconnected')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-red-700">MQTT Settings</p>
          <h2 className="text-3xl font-bold text-slate-900">Broker Konfiguration</h2>
          <p className="text-sm text-slate-500">Admin-Formular mit Lokalspeicherung, TLS-Support und Connect/Disconnect Aktionen.</p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusTone(status)}`}>
          <span className={`h-2 w-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {status === 'connected' ? 'Verbunden' : 'Getrennt'}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Broker</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              <span className="text-xs font-semibold text-slate-500">Host</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                value={form.host}
                onChange={(event) => handleChange('host', event.target.value)}
                placeholder="broker.example.com"
              />
            </label>
            <label className="text-sm text-slate-700">
              <span className="text-xs font-semibold text-slate-500">Port</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                value={form.port}
                type="number"
                onChange={(event) => handleChange('port', Number(event.target.value))}
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.useTLS}
                onChange={(event) => handleChange('useTLS', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-xs font-semibold text-slate-600">TLS aktivieren (wss)</span>
            </label>
            <label className="text-sm text-slate-700">
              <span className="text-xs font-semibold text-slate-500">Client ID</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                value={form.clientId}
                onChange={(event) => handleChange('clientId', event.target.value)}
              />
            </label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              <span className="text-xs font-semibold text-slate-500">Username (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                value={form.username}
                onChange={(event) => handleChange('username', event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700">
              <span className="text-xs font-semibold text-slate-500">Passwort (optional)</span>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handlePersist}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-red-200 hover:text-red-700"
            >
              Einstellungen speichern
            </button>
            <button
              onClick={handleConnect}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Connect
            </button>
            <button
              onClick={handleDisconnect}
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Disconnect
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Einstellungen werden in LocalStorage persistiert. PlantOverview nutzt diese Daten, um Topics wie plant/&lt;id&gt;/status zu abonnieren.
          </p>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-2 text-sm text-slate-600">
              Aktueller Zustand: {status === 'connected' ? 'Verbunden zum Broker (Mock)' : 'Keine aktive Verbindung'}.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Status wird vom MQTT Client Service gelesen. Aktueller gespeicherter Zustand: {getConnectionState()}.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hinweis</p>
            <p className="mt-2 text-sm text-slate-600">
              Diese UI agiert als MQTT-Client. Es wird kein eigener Broker gehostet. TLS setzt wss und Port 8883 als Default.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
