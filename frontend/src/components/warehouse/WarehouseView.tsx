import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import clsx from 'clsx'
import { warehouseDimensions, warehouseSlots } from '../../config/warehouse'
import { useTopicHistory } from '../../hooks/useTopicHistory'
import { isActiveValue } from '../../utils/deviceState'

type SlotState = { occupied: boolean; lastChange?: Date; raw?: string }

type SlotProps = {
  id: string
  row: number
  col: number
  topic: string
  label?: string
  onUpdate: (id: string, state: SlotState) => void
}

function WarehouseSlot({ id, row, col, topic, label, onUpdate }: SlotProps) {
  const { latest } = useTopicHistory(topic)
  const occupied = isActiveValue(latest?.value)

  useEffect(() => {
    if (!latest) return
    onUpdate(id, { occupied, lastChange: latest.timestamp, raw: String(latest.raw) })
  }, [id, latest, occupied, onUpdate])

  return (
    <div
      className={clsx(
        'relative flex h-20 flex-col justify-between rounded-xl border px-3 py-2 text-xs transition',
        occupied ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700'
      )}
      style={{ gridRow: row + 1, gridColumn: col + 1 }}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{label ?? id}</span>
        <span className={clsx('h-2 w-2 rounded-full', occupied ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300')} />
      </div>
      <div className="text-[11px] text-slate-500">
        <p className="font-mono text-[11px]">{topic}</p>
        <p className="mt-1 text-[11px] text-slate-500">{latest ? (occupied ? 'Belegt' : 'Frei') : 'keine Daten'}</p>
      </div>
    </div>
  )
}

type HistoryEntry = { id: string; occupied: boolean; timestamp: Date; raw?: string }

export function WarehouseView() {
  const [slotsState, setSlotsState] = useState<Record<string, SlotState>>({})
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const handleUpdate = useCallback((id: string, state: SlotState) => {
    setSlotsState((prev) => ({ ...prev, [id]: state }))
    if (state.lastChange) {
      setHistory((prev) => [{ id, occupied: state.occupied, timestamp: state.lastChange!, raw: state.raw }, ...prev].slice(0, 12))
    }
  }, [])

  const stats = useMemo(() => {
    const occupied = Object.values(slotsState).filter((s) => s.occupied).length
    const total = warehouseSlots.length
    return { occupied, free: total - occupied, total }
  }, [slotsState])

  const chartData = [
    { name: 'Belegt', value: stats.occupied, color: '#c6001f' },
    { name: 'Frei', value: stats.free, color: '#e5e7eb' },
  ]

  const lastMove = history[0]

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Hochregallager</p>
          <h3 className="text-2xl font-bold text-slate-900">Fächer-Übersicht &amp; Statistik</h3>
          <p className="text-sm text-slate-500">Slots sind an Topics gebunden (0/1). Belegt vs. frei wird live angezeigt.</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
          {stats.occupied} / {stats.total} belegt
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-5 shadow-card">
          <div
            className="grid gap-3"
            style={{ gridTemplateRows: `repeat(${warehouseDimensions.rows}, minmax(70px, 1fr))`, gridTemplateColumns: `repeat(${warehouseDimensions.cols}, minmax(70px, 1fr))` }}
          >
            {warehouseSlots.map((slot) => (
              <WarehouseSlot key={slot.id} {...slot} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Belegung</p>
            <div className="mt-2 h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip formatter={(value, name) => [`${value as number} Slots`, name as string]} />
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={2}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-sm text-slate-600">
              <p>
                Belegt: <span className="font-semibold text-slate-900">{stats.occupied}</span>
              </p>
              <p>
                Frei: <span className="font-semibold text-slate-900">{stats.free}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Letzte Bewegungen</p>
            <div className="mt-2 space-y-2 text-xs text-slate-600">
              {history.length === 0 && <p className="text-slate-500">Noch keine Meldungen.</p>}
              {history.map((entry) => (
                <div key={entry.timestamp.getTime() + entry.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-slate-800">
                    {entry.id} → {entry.occupied ? 'Belegt' : 'Frei'}
                  </span>
                  <span className="text-[11px] text-slate-500">{entry.timestamp.toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            {lastMove && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                Letzte Bewegung: {lastMove.id} ({lastMove.occupied ? 'Belegt' : 'Frei'})
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
