import { useState } from 'react'
import { useMqttContext } from '../../mqtt/MqttProvider'
import { useTheme } from '../../hooks/useTheme'
import { usePlantStore } from '../../store/plantStore'

export function SettingsView() {
  const { config, setConfig } = useMqttContext()
  const { reset } = usePlantStore()
  const { theme, toggle } = useTheme()

  const [url, setUrl] = useState(config.url)
  const [username, setUsername] = useState(config.username ?? '')
  const [password, setPassword] = useState(config.password ?? '')

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Einstellungen</p>
        <h3 className="text-2xl font-bold text-slate-900">MQTT, Layout &amp; Theme</h3>
        <p className="text-sm text-slate-500">MQTT-URL anpassen, Layout löschen, Dark Mode schalten.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">MQTT-Verbindung</p>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">URL (WebSocket)</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="ws://localhost:9001"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Username (optional)</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Passwort (optional)</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                />
              </label>
            </div>
            <button
              onClick={() => setConfig({ url, username, password })}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Verbindung aktualisieren
            </button>
            <p className="text-xs text-slate-500">Einstellungen werden im Browser gespeichert (LocalStorage).</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Layout &amp; Bindings</p>
            <p className="text-sm text-slate-600">Löscht alle Module und Topics und setzt die Standardkonfiguration.</p>
            <button
              onClick={() => reset()}
              className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Layout zurücksetzen
            </button>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Theme</p>
            <p className="text-sm text-slate-600">Zwischen hellem und dunklem Modus wechseln.</p>
            <button
              onClick={toggle}
              className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-red-200 hover:text-red-700"
            >
              {theme === 'light' ? 'Dark Mode aktivieren' : 'Light Mode aktivieren'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
