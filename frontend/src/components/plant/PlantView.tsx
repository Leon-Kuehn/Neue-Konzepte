import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { layoutLegend, layoutNodes } from '../../config/layout'
import { actuatorDevices, devices, sensorDevices } from '../../config/devices'
import type { ActuatorDevice, DeviceDefinition, SensorDevice } from '../../types/devices'
import { useDeviceStatus } from '../../hooks/useDeviceStatus'
import { NamedIcon } from '../common/Icon'
import { useActuatorControl } from '../../hooks/useActuatorControl'
import { isActiveValue } from '../../utils/deviceState'

const formatTime = (date?: Date) => (date ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date) : '–')

type PlantNodeProps = {
  device: DeviceDefinition
  x: number
  y: number
  label?: string
  onSelect: (deviceId: string) => void
}

function PlantNode({ device, x, y, label, onSelect }: PlantNodeProps) {
  const status = useDeviceStatus(device)
  const active = isActiveValue(status.state ?? status.lastValue)
  const warn = !status.isConnected
  const color = warn ? 'bg-amber-400' : active ? 'bg-emerald-500' : 'bg-slate-300'

  return (
    <button
      onClick={() => onSelect(device.id)}
      className={clsx(
        'group absolute flex flex-col rounded-xl px-3 py-2 text-left text-xs text-white shadow-lg ring-2 ring-black/5 transition hover:scale-105',
        color,
        warn ? 'shadow-amber-300/40' : active ? 'shadow-emerald-300/40' : 'shadow-slate-200'
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={device.name}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20">
          <NamedIcon name={device.icon} className="h-4 w-4" />
        </span>
        <span className="font-semibold">{label ?? device.name}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px]">
        <span className="rounded-full bg-white/20 px-2 py-0.5">{status.state ?? status.lastValue ?? '—'}</span>
        <span
          className={clsx('h-2 w-2 rounded-full', status.recent ? 'bg-white animate-pulse' : 'bg-white/60')}
          title="MQTT Signal"
          aria-label={status.recent ? 'MQTT Signal: aktiv' : 'MQTT Signal: keine neuen Nachrichten'}
        />
      </div>
    </button>
  )
}

type ActuatorPanelProps = {
  device: ActuatorDevice
  onClose: () => void
}

function ActuatorDetailPanel({ device, onClose }: ActuatorPanelProps) {
  const status = useDeviceStatus(device)
  const stateTopic = device.topics.stateTopic ?? device.topics.valueTopic
  const commandTopic = device.topics.commandTopic ?? device.topics.stateTopic
  const { latest, publishCommand, isSending, error, lastCommand } = useActuatorControl(stateTopic, commandTopic)
  const currentValue = latest?.value ?? status.state ?? status.lastValue ?? '—'

  const send = async (value: string | number) => {
    await publishCommand(value)
  }

  const renderControl = () => {
    const control = device.control
    if (control.type === 'toggle') {
      const isOn = isActiveValue(currentValue)
      return (
        <button
          onClick={() => send(isOn ? 'OFF' : 'ON')}
          disabled={isSending}
          className={clsx(
            'w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition',
            isOn ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
            isSending && 'opacity-70'
          )}
        >
          {isSending ? 'Sende…' : isOn ? control.onLabel ?? 'AN' : control.offLabel ?? 'AUS'}
        </button>
      )
    }
    if (control.type === 'select') {
      return (
        <div className="grid grid-cols-3 gap-2">
          {control.options.map((opt) => {
            const active = String(currentValue).toUpperCase() === String(opt.value).toUpperCase()
            return (
              <button
                key={opt.value}
                onClick={() => send(opt.value)}
                disabled={isSending}
                className={clsx(
                  'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                  active
                    ? 'border-red-200 bg-red-50 text-red-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  isSending && 'opacity-70'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )
    }
    if (control.type === 'slider') {
      const min = control.min
      const max = control.max
      const step = control.step ?? 1
      const value = typeof currentValue === 'number' ? currentValue : Number(currentValue) || 0
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => send(Number(e.target.value))}
            disabled={isSending}
            className="w-full accent-red-600"
          />
          <div className="text-xs text-slate-500">
            Zielwert: <strong className="text-slate-800">{value}</strong>
            {device.unit}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
            <NamedIcon name={device.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Aktor</p>
            <p className="text-lg font-semibold text-slate-900">{device.name}</p>
            <p className="text-xs text-slate-500">{device.description}</p>
          </div>
        </div>
        <button className="text-xs text-slate-500 hover:text-slate-700" onClick={onClose}>
          Schließen
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <span className="font-semibold text-slate-900">{isActiveValue(currentValue) ? 'AN' : 'AUS'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Verbunden:</span>
          <span className="font-semibold text-slate-900">{status.isConnected ? 'Ja' : 'Nein'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Zuletzt geschaltet:</span>
          <span className="font-semibold text-slate-900">{formatTime(status.lastSeenAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Command-Topic:</span>
          <span className="font-mono text-xs text-slate-700">{commandTopic ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>State-Topic:</span>
          <span className="font-mono text-xs text-slate-700">{stateTopic ?? '—'}</span>
        </div>
      </div>

      <div className="mt-4">{renderControl()}</div>

      <div className="mt-3 text-xs text-slate-500">
        <p>
          Letztes Kommando: <span className="font-semibold text-slate-800">{lastCommand ?? '–'}</span>
        </p>
        {error && <p className="mt-1 text-rose-600">Fehler: {error}</p>}
      </div>
    </div>
  )
}

type SensorDetailPanelProps = {
  device: SensorDevice
  onClose: () => void
}

function SensorDetailPanel({ device, onClose }: SensorDetailPanelProps) {
  const status = useDeviceStatus(device)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
            <NamedIcon name={device.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Sensor</p>
            <p className="text-lg font-semibold text-slate-900">{device.name}</p>
            <p className="text-xs text-slate-500">{device.description}</p>
          </div>
        </div>
        <button className="text-xs text-slate-500 hover:text-slate-700" onClick={onClose}>
          Schließen
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Aktueller Wert:</span>
          <span className="font-semibold text-slate-900">
            {status.lastValue ?? '—'}
            {device.unit}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <span className="font-semibold text-slate-900">{status.isConnected ? 'Verbunden' : 'Keine Daten'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Letzte Nachricht:</span>
          <span className="font-semibold text-slate-900">{formatTime(status.lastSeenAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Topic:</span>
          <span className="font-mono text-xs text-slate-700">{status.valueTopic ?? '—'}</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Historie</p>
        <div className="mt-2 space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 max-h-32 overflow-auto">
          {status.valueHistory.length === 0 && <p className="text-slate-500">Noch keine Werte empfangen.</p>}
          {status.valueHistory.slice(0, 10).map((entry) => (
            <div key={entry.timestamp.getTime()} className="flex items-center justify-between">
              <span>{formatTime(entry.timestamp)}</span>
              <span className="font-mono">{entry.raw}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PlantView() {
  // Falls kein Layout konfiguriert ist, bleibt selectedId null und Panel zeigt Platzhalter.
  const [selectedId, setSelectedId] = useState<string | null>(layoutNodes[0]?.deviceId ?? null)
  const selectedDevice = useMemo(() => devices.find((d) => d.id === selectedId), [selectedId])

  return (
    <section id="plant" className="mt-10 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Anlagenansicht</p>
          <h3 className="text-2xl font-semibold text-slate-900">Schaltplan / Top-Down Layout</h3>
          <p className="text-xs text-slate-500">Klick auf Bauteil für Details &amp; MQTT-Steuerung.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {layoutLegend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1 text-xs text-slate-600">
              <span className={clsx('h-3 w-3 rounded-full', item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="relative h-[520px] overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-card">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(198,0,31,0.05),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.05),transparent_40%)]" />
          <div className="relative h-full w-full">
            <div className="absolute left-[10%] top-[45%] h-1 w-3/4 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 rounded-full opacity-60" />
            {layoutNodes.map((node) => {
              const device = devices.find((d) => d.id === node.deviceId)
              if (!device) return null
              return <PlantNode key={node.deviceId} device={device} x={node.x} y={node.y} label={node.label} onSelect={setSelectedId} />
            })}
          </div>
        </div>

        <div className="space-y-3">
          {selectedDevice ? (
            selectedDevice.type === 'actuator' ? (
              <ActuatorDetailPanel device={selectedDevice} onClose={() => setSelectedId(null)} />
            ) : (
              <SensorDetailPanel device={selectedDevice} onClose={() => setSelectedId(null)} />
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">
              Wähle ein Gerät-Icon im Schaltplan, um Details zu sehen.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {sensorDevices.length} Sensoren / {actuatorDevices.length} Aktoren
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Signal-Dot pulsiert bei neuen MQTT-Messages</span>
      </div>
    </section>
  )
}
