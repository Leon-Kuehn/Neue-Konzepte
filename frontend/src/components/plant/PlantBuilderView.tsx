import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { modulePalette } from '../../config/modules'
import { usePlantStore } from '../../store/plantStore'
import type { ModuleDefinition, ModuleType, PlacedModule, Rotation } from '../../types/modules'
import type { IconName } from '../../types/devices'
import { useModuleSignal } from '../../hooks/useModuleSignal'
import { NamedIcon } from '../common/Icon'
import { useActuatorControl } from '../../hooks/useActuatorControl'
import { isActiveValue } from '../../utils/deviceState'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const snap = (value: number, step = 2) => Math.round(value / step) * step
const nextRotation = (rotation: Rotation): Rotation => {
  const order: Rotation[] = [0, 90, 180, 270]
  const idx = order.indexOf(rotation)
  return order[(idx + 1) % order.length]
}

type PaletteProps = {
  onAdd: (type: ModuleType) => void
}

function ModulePalette({ onAdd }: PaletteProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Bausteine</p>
          <p className="text-lg font-semibold text-slate-900">Palette</p>
          <p className="text-xs text-slate-500">Per Drag &amp; Drop auf die Fläche ziehen oder per Klick hinzufügen.</p>
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        {modulePalette.map((module) => (
          <div
            key={module.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('module-type', module.type)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            className="group flex cursor-grab items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-red-700 ring-1 ring-red-100">
                <NamedIcon name={module.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{module.label}</p>
                <p className="text-xs text-slate-500">{module.description}</p>
              </div>
            </div>
            <button
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
              onClick={() => onAdd(module.type)}
            >
              Platzieren
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

type ModuleBlockProps = {
  module: PlacedModule
  definition: ModuleDefinition
  selected: boolean
  onSelect: (id: string) => void
  onMove: (id: string, pos: { x: number; y: number }) => void
  canvasRect?: DOMRect
}

function ModuleBlock({ module, definition, onSelect, onMove, selected, canvasRect }: ModuleBlockProps) {
  const { active, lastValue, recent, binding, lastMessageAt } = useModuleSignal(module.id)
  const warn = (!binding?.stateTopic && !binding?.commandTopic) || !lastMessageAt
  const color = warn ? 'bg-amber-300' : active ? 'bg-emerald-500' : 'bg-slate-300'

  const onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canvasRect) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startPos = { x: module.x, y: module.y }

    const handleMove = (ev: MouseEvent) => {
      const dx = ((ev.clientX - startX) / canvasRect.width) * 100
      const dy = ((ev.clientY - startY) / canvasRect.height) * 100
      const x = clamp(snap(startPos.x + dx, 2), 2, 96)
      const y = clamp(snap(startPos.y + dy, 2), 2, 96)
      onMove(module.id, { x, y })
    }

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  return (
    <button
      onMouseDown={onMouseDown}
      onClick={() => onSelect(module.id)}
      style={{ left: `${module.x}%`, top: `${module.y}%`, transform: `translate(-50%, -50%) rotate(${module.rotation}deg)` }}
      className={clsx(
        'absolute flex h-16 w-24 cursor-grab flex-col justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-white shadow-lg ring-2 ring-black/5 transition focus:outline-none focus:ring-4 focus:ring-red-300',
        color,
        selected ? 'ring-4 ring-red-400' : warn ? 'shadow-amber-300/50' : active ? 'shadow-emerald-300/50' : 'shadow-slate-200'
      )}
      aria-label={module.label}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
          <NamedIcon name={definition.icon} className="h-4 w-4" />
        </span>
        <span className="truncate">{module.label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono">{lastValue ?? '–'}</span>
        <span className={clsx('h-2.5 w-2.5 rounded-full', recent ? 'bg-white animate-pulse' : 'bg-white/60')} title="MQTT Signal" />
      </div>
    </button>
  )
}

type PlantCanvasProps = {
  modules: PlacedModule[]
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (id: string, pos: { x: number; y: number }) => void
  onCreate: (type: ModuleType, position: { x: number; y: number }) => void
}

function PlantCanvas({ modules, selectedId, onSelect, onMove, onCreate }: PlantCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasRect, setCanvasRect] = useState<DOMRect>()
  const definitionMap = useMemo<Partial<Record<ModuleType, ModuleDefinition>>>(() => Object.fromEntries(modulePalette.map((m) => [m.type, m])), [])

  const refreshRect = () => {
    if (containerRef.current) {
      setCanvasRect(containerRef.current.getBoundingClientRect())
    }
  }

  useEffect(() => {
    refreshRect()
    window.addEventListener('resize', refreshRect)
    return () => window.removeEventListener('resize', refreshRect)
  }, [])

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!canvasRect) return
    const type = e.dataTransfer.getData('module-type') as ModuleType
    if (!type) return
    const x = clamp(snap(((e.clientX - canvasRect.left) / canvasRect.width) * 100, 2), 4, 96)
    const y = clamp(snap(((e.clientY - canvasRect.top) / canvasRect.height) * 100, 2), 4, 96)
    onCreate(type, { x, y })
  }

  return (
    <div
      ref={containerRef}
      onLoad={refreshRect}
      onPointerEnter={refreshRect}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative h-[520px] overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-card"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(198,0,31,0.05),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.05),transparent_40%)]" />
      <div className="relative h-full w-full">
        {modules.map((module) => {
          const fallback: ModuleDefinition = { type: module.type, label: module.label, icon: 'status' as IconName }
          const definition = definitionMap[module.type] ?? fallback
          return (
            <ModuleBlock
              key={module.id}
              module={module}
              definition={definition}
              selected={selectedId === module.id}
              onSelect={onSelect}
              onMove={onMove}
              canvasRect={canvasRect}
            />
          )
        })}
        {modules.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
            Palette öffnen und Module hineinziehen, um loszulegen.
          </div>
        )}
      </div>
    </div>
  )
}

type ModuleDetailProps = {
  module: PlacedModule | undefined
  onRotate: (id: string, rotation: Rotation) => void
  onRemove: (id: string) => void
  onLabelChange: (id: string, label: string) => void
  onBindingChange: (id: string, patch: { stateTopic?: string; commandTopic?: string; metaTopic?: string; deviceType?: 'sensor' | 'actuator' }) => void
}

function ModuleDetailPanel({ module, onRotate, onRemove, onLabelChange, onBindingChange }: ModuleDetailProps) {
  const { binding, lastValue, metaValue, lastMessageAt, commandTopic, stateTopic } = useModuleSignal(module?.id ?? '')
  const { publishCommand, isSending } = useActuatorControl(binding?.stateTopic ?? stateTopic, binding?.commandTopic ?? commandTopic)

  if (!module) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">
        Wähle ein Modul im Canvas, um Details, Topics und Status zu sehen.
      </div>
    )
  }

  const rotation = nextRotation(module.rotation)

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Modul</p>
          <p className="text-lg font-semibold text-slate-900">{module.label}</p>
          <p className="text-xs text-slate-500">Typ: {module.type}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onRotate(module.id, rotation)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-red-200 hover:text-red-700"
          >
            Rotieren 90°
          </button>
          <button
            onClick={() => onRemove(module.id)}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            Entfernen
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-xs font-semibold text-slate-500">
          Anzeigename
          <input
            type="text"
            value={module.label}
            onChange={(e) => onLabelChange(module.id, e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
          />
        </label>

        <label className="block text-xs font-semibold text-slate-500">
          Gerätetyp
          <select
            value={binding?.deviceType ?? 'sensor'}
            onChange={(e) => onBindingChange(module.id, { deviceType: e.target.value as 'sensor' | 'actuator' })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
          >
            <option value="sensor">Sensor</option>
            <option value="actuator">Aktor</option>
          </select>
        </label>

        <label className="block text-xs font-semibold text-slate-500">
          State-Topic
          <input
            type="text"
            value={binding?.stateTopic ?? ''}
            onChange={(e) => onBindingChange(module.id, { stateTopic: e.target.value })}
            placeholder="z.B. dhbw/iot/sensors/..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
          />
        </label>

        <label className="block text-xs font-semibold text-slate-500">
          Command-Topic (Aktor)
          <input
            type="text"
            value={binding?.commandTopic ?? ''}
            onChange={(e) => onBindingChange(module.id, { commandTopic: e.target.value })}
            placeholder="z.B. dhbw/iot/actuators/.../set"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
          />
        </label>

        <label className="block text-xs font-semibold text-slate-500">
          Meta-Topic (optional)
          <input
            type="text"
            value={binding?.metaTopic ?? ''}
            onChange={(e) => onBindingChange(module.id, { metaTopic: e.target.value })}
            placeholder="NFC / Zusatzinfos"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {binding?.deviceType === 'actuator' ? (isActiveValue(lastValue) ? 'Aktiv' : 'Inaktiv') : lastValue ?? '–'}
          </p>
          <p className="text-[11px] text-slate-500">Letzte Nachricht: {lastMessageAt?.toLocaleTimeString() ?? '–'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">State</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{lastValue ?? '–'}</p>
          <p className="text-[11px] text-slate-500 break-all">{binding?.stateTopic || 'kein Topic gesetzt'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Meta</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{metaValue ?? '–'}</p>
          <p className="text-[11px] text-slate-500 break-all">{binding?.metaTopic || 'kein Topic gesetzt'}</p>
        </div>
      </div>

      {binding?.deviceType === 'actuator' && (binding.commandTopic || binding.stateTopic) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => publishCommand(isActiveValue(lastValue) ? '0' : '1')}
            disabled={isSending}
            className={clsx(
              'rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition',
              isActiveValue(lastValue) ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-500 text-white hover:bg-emerald-600',
              isSending && 'opacity-70'
            )}
          >
            {isSending ? 'Sende…' : isActiveValue(lastValue) ? 'AUS schalten' : 'EIN schalten'}
          </button>
          <div className="text-xs text-slate-500">
            Kommandos gehen an <span className="font-mono">{binding.commandTopic ?? '–'}</span> / State von{' '}
            <span className="font-mono">{binding.stateTopic ?? '–'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function PlantBuilderView() {
  const { state, addModule, updateModule, updateBinding, removeModule, reset } = usePlantStore()
  const [selectedId, setSelectedId] = useState<string | null>(state.modules[0]?.id ?? null)

  const selectedModule = useMemo(() => state.modules.find((m) => m.id === selectedId), [selectedId, state.modules])

  const handleCreate = (type: ModuleType, position: { x: number; y: number }) => {
    const definition = modulePalette.find((m) => m.type === type)
    const id = addModule(type, position, definition?.defaultRotation, definition?.label)
    setSelectedId(id)
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Plant Builder</p>
          <h3 className="text-2xl font-bold text-slate-900">Digitale Zwillinge zeichnen &amp; an MQTT binden</h3>
          <p className="text-sm text-slate-500">
            Module platzieren, Topics hinterlegen, Live-Status direkt im Canvas sehen. Layout &amp; Bindings werden lokal gespeichert.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => reset()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-red-200 hover:text-red-700"
          >
            Layout zurücksetzen
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
        <ModulePalette onAdd={(type) => handleCreate(type, { x: 50, y: 50 })} />
        <PlantCanvas
          modules={state.modules}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={(id, pos) => updateModule(id, pos)}
          onCreate={handleCreate}
        />
      </div>

      <ModuleDetailPanel
        module={selectedModule}
        onRotate={(id, rotation) => updateModule(id, { rotation })}
        onRemove={(id) => {
          removeModule(id)
          setSelectedId((prev) => (prev === id ? null : prev))
        }}
        onLabelChange={(id, label) => updateModule(id, { label })}
        onBindingChange={(id, patch) => updateBinding(id, patch)}
      />

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">Drag &amp; Drop + Raster-Snap (2%)</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Signal-Dot blinkt bei neuen MQTT-Messages</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Persistenz via LocalStorage (später ersetzbar durch Backend)</span>
      </div>
    </section>
  )
}
