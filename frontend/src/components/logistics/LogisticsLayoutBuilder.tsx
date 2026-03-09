import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import type { LogisticsModuleType } from '../../types/logistics'
import type { LogisticsLayoutItem } from '../../types/logisticsLayout'
import { ModuleIcon } from './ModuleIcon'

const GRID_SIZE = 40
const CANVAS_WIDTH = 2000
const CANVAS_HEIGHT = 1200

type DraggingState =
  | { mode: 'move'; id: string; offsetX: number; offsetY: number }
  | { mode: 'resize'; id: string; startX: number; startY: number; startWidth: number; startHeight: number }

const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE

const paletteItems: { type: LogisticsModuleType; label: string; defaultSize: { width: number; height: number } }[] = [
  { type: 'InputStation', label: 'Input Station', defaultSize: { width: 160, height: 120 } },
  { type: 'ConveyorShort', label: 'Conveyor Belt Small', defaultSize: { width: 180, height: 100 } },
  { type: 'ConveyorLong', label: 'Conveyor Belt Large', defaultSize: { width: 360, height: 120 } },
  { type: 'ConveyorTurntable', label: 'Turntable', defaultSize: { width: 160, height: 160 } },
  { type: 'FillingUnit', label: 'Filling Unit', defaultSize: { width: 160, height: 140 } },
  { type: 'WarehouseColumn', label: 'High-Bay Storage', defaultSize: { width: 200, height: 300 } },
  { type: 'BinarySensor', label: 'Binary Sensor', defaultSize: { width: 80, height: 80 } },
  { type: 'NfcSensor', label: 'NFC Sensor', defaultSize: { width: 80, height: 80 } },
]

export function LogisticsLayoutBuilder() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<LogisticsLayoutItem[]>([])
  const [dragging, setDragging] = useState<DraggingState | null>(null)
  const [exportText, setExportText] = useState('')

  const startDragFromPalette = (type: LogisticsModuleType) => (event: React.DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData('application/x-logistics-type', type)
    event.dataTransfer.effectAllowed = 'copy'
  }

  const addItemAt = useCallback(
    (type: LogisticsModuleType, clientX: number, clientY: number) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const palette = paletteItems.find((p) => p.type === type)
      const width = palette?.defaultSize.width ?? 160
      const height = palette?.defaultSize.height ?? 120
      const x = snap(clientX - rect.left - width / 2)
      const y = snap(clientY - rect.top - height / 2)
      setItems((prev) => [
        ...prev,
        {
          id: `${type}-${crypto.randomUUID()}`,
          type,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: snap(width),
          height: snap(height),
          rotation: 0,
        },
      ])
    },
    []
  )

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/x-logistics-type') as LogisticsModuleType
    if (type) addItemAt(type, event.clientX, event.clientY)
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!dragging || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      if (dragging.mode === 'move') {
        const nextX = snap(event.clientX - rect.left - dragging.offsetX)
        const nextY = snap(event.clientY - rect.top - dragging.offsetY)
        setItems((prev) =>
          prev.map((item) => (item.id === dragging.id ? { ...item, x: Math.max(0, nextX), y: Math.max(0, nextY) } : item))
        )
      }
      if (dragging.mode === 'resize') {
        const deltaX = event.clientX - dragging.startX
        const deltaY = event.clientY - dragging.startY
        const newWidth = snap(Math.max(80, dragging.startWidth + deltaX))
        const newHeight = snap(Math.max(80, dragging.startHeight + deltaY))
        setItems((prev) => prev.map((item) => (item.id === dragging.id ? { ...item, width: newWidth, height: newHeight } : item)))
      }
    },
    [dragging]
  )

  const stopDragging = useCallback(() => setDragging(null), [])

  const startMove = (event: React.MouseEvent, item: LogisticsLayoutItem) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const offsetX = event.clientX - (rect.left + item.x)
    const offsetY = event.clientY - (rect.top + item.y)
    setDragging({ mode: 'move', id: item.id, offsetX, offsetY })
  }

  const startResize = (event: React.MouseEvent, item: LogisticsLayoutItem) => {
    event.stopPropagation()
    setDragging({
      mode: 'resize',
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: item.width,
      startHeight: item.height,
    })
  }

  const rotateItem = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, rotation: ((item.rotation ?? 0) + 90) % 360 } : item)))
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const exportLayout = () => {
    setExportText(JSON.stringify(items, null, 2))
  }

  const importLayout = () => {
    try {
      const parsed = JSON.parse(exportText) as LogisticsLayoutItem[]
      if (Array.isArray(parsed)) {
        setItems(parsed)
      } else {
        console.error('Layout JSON is not an array')
      }
    } catch (error) {
      console.error('Invalid JSON in layout import', error)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Palette</p>
            <h3 className="text-lg font-bold text-slate-900">Module</h3>
          </div>
          <span className="text-xs text-slate-500">Drag &amp; Drop</span>
        </div>
        <div className="mt-3 space-y-2">
          {paletteItems.map((item) => (
            <button
              key={item.type}
              draggable
              onDragStart={startDragFromPalette(item.type)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-red-200 hover:bg-red-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white ring-1 ring-slate-200">
                <ModuleIcon type={item.type} />
              </div>
              <div>
                <p>{item.label}</p>
                <p className="text-xs text-slate-500">
                  {item.defaultSize.width}×{item.defaultSize.height}px
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={exportLayout}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >
              Export JSON
            </button>
            <button
              onClick={importLayout}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Import JSON
            </button>
          </div>
          <textarea
            value={exportText}
            onChange={(e) => setExportText(e.target.value)}
            className="h-32 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-700 focus:border-red-300 focus:outline-none"
            placeholder="Paste layout JSON here..."
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Canvas</p>
            <h3 className="text-lg font-bold text-slate-900">Logistics Layout Builder</h3>
          </div>
          <p className="text-xs text-slate-500">2000×1200 px • Grid {GRID_SIZE}px</p>
        </div>

        <div className="mt-3 h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50">
          <div
            ref={canvasRef}
            className="relative"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              backgroundImage:
                'linear-gradient(to right, rgba(203,213,225,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(203,213,225,0.4) 1px, transparent 1px)',
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onMouseMove={onMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="group absolute cursor-move rounded-lg border border-slate-300 bg-white/90 p-2 shadow-sm ring-1 ring-slate-100"
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                }}
                onMouseDown={(e) => startMove(e, item)}
              >
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">{item.type}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        rotateItem(item.id)
                      }}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      ↻
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeItem(item.id)
                      }}
                      className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex h-full items-center justify-center">
                  <div className="pointer-events-none" style={{ transform: `rotate(${item.rotation ?? 0}deg)` }}>
                    <ModuleIcon type={item.type} />
                  </div>
                </div>
                <button
                  type="button"
                  className="absolute bottom-1 right-1 h-4 w-4 cursor-se-resize rounded bg-slate-200 opacity-0 transition group-hover:opacity-100"
                  onMouseDown={(e) => startResize(e, item)}
                  aria-label="Resize handle"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
