import { useMemo, useState } from 'react'
import clsx from 'clsx'
import type { ActuatorDevice } from '../../types/devices'
import { useActuatorControl } from '../../hooks/useActuatorControl'
import { NamedIcon } from '../common/Icon'
import { isActiveValue } from '../../utils/deviceState'

const formatTimestamp = (date?: Date) => (date ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(date) : '–')

type ActuatorCardProps = {
  actuator: ActuatorDevice
}

export function ActuatorCard({ actuator }: ActuatorCardProps) {
  const stateTopic = actuator.topics.stateTopic ?? actuator.topics.valueTopic
  const commandTopic = actuator.topics.commandTopic ?? actuator.topics.stateTopic
  const { latest, publishCommand, isSending, error, lastCommand } = useActuatorControl(stateTopic, commandTopic)
  const [localSlider, setLocalSlider] = useState<number | null>(null)

  const currentValue = useMemo(() => latest?.value ?? '—', [latest])
  const effectiveSliderValue =
    actuator.control.type === 'slider'
      ? localSlider ?? (typeof latest?.value === 'number' ? latest.value : Number(latest?.value) || 0)
      : undefined

  const send = async (value: string | number) => {
    await publishCommand(value)
    if (actuator.control.type === 'slider') {
      setLocalSlider(null)
    }
  }

  const renderControl = () => {
    const control = actuator.control
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
      const value = effectiveSliderValue ?? 0
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setLocalSlider(Number(e.target.value))}
            onMouseUp={() => send(value)}
            onTouchEnd={() => send(value)}
            disabled={isSending}
            className="w-full accent-red-600"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Zielwert: <strong className="text-slate-800">{value}</strong>
              {actuator.unit}
            </span>
            <button
              onClick={() => send(value)}
              disabled={isSending}
              className="rounded-lg bg-red-600 px-3 py-1 text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
            >
              Senden
            </button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <NamedIcon name={actuator.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Aktor</p>
            <p className="text-lg font-semibold text-slate-900">{actuator.name}</p>
            <p className="text-xs text-slate-500">{actuator.description}</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{commandTopic ?? 'kein Command-Topic'}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-slate-900">{currentValue}</p>
        {actuator.unit && <span className="text-sm text-slate-500">{actuator.unit}</span>}
        <span className="text-xs text-slate-500">Status {formatTimestamp(latest?.timestamp)}</span>
      </div>

      {renderControl()}

      <div className="text-xs text-slate-500">
        <p>
          Letztes Kommando: <span className="font-semibold text-slate-800">{lastCommand ?? '–'}</span>
        </p>
        {error && <p className="mt-1 text-rose-600">Fehler: {error}</p>}
      </div>
    </div>
  )
}
