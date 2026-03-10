import { useCallback, useEffect, useMemo, useState } from 'react'
import { PlantSvgView } from '../components/plant/PlantSvgView'
import { ComponentsTileGrid } from '../components/plant/ComponentsTileGrid'
import { ComponentDetailsPanel } from '../components/plant/ComponentDetailsPanel'
import { plantComponents as mockPlantComponents } from '../config/plantComponents'
import type { PlantComponent } from '../types/plant'
import type { MqttConnectionState, MqttSettings } from '../services/mqttClient'
import { connect, disconnect, loadMqttSettings, onMessage, subscribe } from '../services/mqttClient'

type IncomingPayload = {
  id?: string
  status?: PlantComponent['status']
  online?: boolean
  lastChanged?: string
  stats?: Partial<PlantComponent['stats']>
}

const formatStatusLabel = (state: MqttConnectionState) => (state === 'connected' ? 'Verbunden' : 'Getrennt')

export function PlantOverviewPage() {
  const [components, setComponents] = useState<PlantComponent[]>(mockPlantComponents)
  const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>(mockPlantComponents[0]?.id)
  const [connectionState, setConnectionState] = useState<MqttConnectionState>('disconnected')
  const [settings] = useState<MqttSettings>(() => loadMqttSettings())

  const selectedComponent = useMemo(
    () => components.find((component) => component.id === selectedComponentId),
    [components, selectedComponentId]
  )

  const handleIncoming = useCallback((topic: string, payload: unknown) => {
    const normalized: IncomingPayload =
      typeof payload === 'string'
        ? (() => {
            try {
              return JSON.parse(payload) as IncomingPayload
            } catch (error) {
              console.warn('Kann MQTT Payload nicht parsen', error)
              return {}
            }
          })()
        : (payload as IncomingPayload | undefined) ?? {}
    const idFromTopic = normalized.id ?? topic.split('/')[1]
    if (!idFromTopic) return
    setComponents((prev) =>
      prev.map((component) =>
        component.id === idFromTopic
          ? {
              ...component,
              status: normalized.status ?? component.status,
              online: normalized.online ?? component.online,
              lastChanged: normalized.lastChanged ?? component.lastChanged,
              stats: {
                cycles: normalized.stats?.cycles ?? component.stats.cycles,
                uptimeHours: normalized.stats?.uptimeHours ?? component.stats.uptimeHours,
              },
            }
          : component
      )
    )
  }, [])

  useEffect(() => {
    onMessage(handleIncoming)
  }, [handleIncoming])

  useEffect(() => {
    const setup = async () => {
      try {
        await connect(settings)
        await Promise.all(mockPlantComponents.map((component) => subscribe(`plant/${component.id}/status`)))
        setConnectionState('connected')
      } catch (error) {
        console.warn('MQTT Verbindung fehlgeschlagen (Mock)', error)
        setConnectionState('disconnected')
      }
    }
    setup()

    return () => {
      disconnect().finally(() => setConnectionState('disconnected'))
    }
  }, [settings])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-red-700">Plant Overview</p>
          <h2 className="text-3xl font-bold text-slate-900">Digitale Anlage mit SVG-Zwilling</h2>
          <p className="text-sm text-slate-500">
            DHBW-inspiriertes Admin-Layout mit interaktiver SVG, Kacheln und MQTT-Live-Daten (Mock).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              connectionState === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connectionState === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {formatStatusLabel(connectionState)}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm ring-1 ring-slate-100">
            Broker: {settings.useTLS ? 'wss' : 'ws'}://{settings.host}:{settings.port}
          </span>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <PlantSvgView components={components} selectedId={selectedComponentId} onSelect={setSelectedComponentId} />
        </div>
        <div className="space-y-4">
          <ComponentDetailsPanel component={selectedComponent} />
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">MQTT Subscription</p>
            <p className="mt-2 text-sm text-slate-600">
              Abonniert plant/&lt;componentId&gt;/status. Eingehende Nachrichten aktualisieren Status, Online-Flag und Kennzahlen der
              Kacheln sowie die Hervorhebung im SVG.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Komponenten</p>
            <h3 className="text-xl font-semibold text-slate-900">Tiles &amp; Details</h3>
          </div>
          <span className="text-xs text-slate-500">
            {components.filter((component) => component.online).length} / {components.length} online
          </span>
        </div>
        <ComponentsTileGrid components={components} selectedId={selectedComponentId} onSelect={setSelectedComponentId} />
      </section>
    </div>
  )
}
