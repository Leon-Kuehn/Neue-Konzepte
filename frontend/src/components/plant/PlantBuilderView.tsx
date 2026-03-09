import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { moduleDefinitionMap, modulePalette } from '../../config/modules'
import { usePlantStore } from '../../store/plantStore'
import type { ModuleDefinition, ModuleType, PlacedModule, Rotation } from '../../types/modules'
import type { IconName } from '../../types/devices'
import { useModuleSignal } from '../../hooks/useModuleSignal'
import { NamedIcon } from '../common/Icon'
import { isActiveValue } from '../../utils/deviceState'
import { getDefaultTopicsForModule, getTopicOptionsForModule, getValueLabelsForTopic, mqttTopicOptions } from '../../config/mqttTopics'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const snap = (value: number, step = 2) => Math.round(value / step) * step
const nextRotation = (rotation: Rotation): Rotation => {
  const order: Rotation[] = [0, 90, 180, 270]
  const idx = order.indexOf(rotation)
  return order[(idx + 1) % order.length]
}

const formatValue = (value: string | number | undefined, moduleType?: ModuleType, topic?: string) => {
  if (value === undefined || value === null) return '–'
  const labelsFromTopic = getValueLabelsForTopic(topic)
  const labelsFromDefinition = moduleType ? moduleDefinitionMap[moduleType]?.valueLabels : undefined
  const lookup = labelsFromTopic ?? labelsFromDefinition
  if (lookup) {
    const mapped = lookup[String(value)]
    if (mapped !== undefined) return mapped
  }
  return value
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
              <span
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-lg text-white ring-1 ring-red-100',
                  `bg-gradient-to-br ${module.color}`
                )}
              >
                <NamedIcon name={module.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{module.label}</p>
                <p className="text-xs text-slate-500">{module.description}</p>
                <p className="text-[11px] text-slate-500">Kategorie: {module.category}</p>
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
  onRotate: (id: string, rotation: Rotation) => void
  onRemove: (id: string) => void
  onConfigure: (id: string) => void
  canvasRect?: DOMRect
}

function ModuleBlock({ module, definition, onSelect, onMove, selected, canvasRect, onRotate, onRemove, onConfigure }: ModuleBlockProps) {
  const { active, lastValue, recent, lastMessageAt, stateTopic, metaTopic } = useModuleSignal(module.id)
  const isUnconfigured = (!stateTopic && !metaTopic) || !lastMessageAt
  const color = isUnconfigured ? 'bg-amber-300' : active ? 'bg-emerald-500' : 'bg-slate-300'
  const [showMoveHint, setShowMoveHint] = useState(false)
  const displayValue = formatValue(lastValue, module.type, stateTopic)

  const onHandleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canvasRect) return
    e.preventDefault()
    e.stopPropagation()
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
    <div
      onClick={() => onSelect(module.id)}
      style={{ left: `${module.x}%`, top: `${module.y}%`, transform: `translate(-50%, -50%) rotate(${module.rotation}deg)` }}
      className={clsx(
        'absolute flex h-16 w-24 flex-col justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-white shadow-lg ring-2 ring-black/5 transition focus:outline-none focus:ring-4 focus:ring-red-300',
        color,
        selected ? 'ring-4 ring-red-400' : isUnconfigured ? 'shadow-amber-300/50' : active ? 'shadow-emerald-300/50' : 'shadow-slate-200'
      )}
      aria-label={module.label}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
          <NamedIcon name={definition.icon} className="h-4 w-4" />
        </span>
        <div className="flex items-center gap-1">
          <span className="truncate">{module.label}</span>
          <button
            title="Bewegen (Drag über Griff)"
            aria-label="Modul verschieben"
            className={clsx(
              'flex h-7 w-7 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-[10px] font-bold leading-none text-white transition hover:bg-white/20',
              showMoveHint && 'ring-2 ring-white'
            )}
            onMouseDown={onHandleMouseDown}
          >
            ⇕
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono">{displayValue}</span>
        <span className={clsx('h-2.5 w-2.5 rounded-full', recent ? 'bg-white animate-pulse' : 'bg-white/60')} title="MQTT Signal" />
      </div>
      {selected && (
        <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 p-2 text-[11px] text-slate-700 shadow-lg backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-red-700">Aktionen</p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button
              className="rounded-lg border border-slate-200 px-2 py-1 font-semibold text-slate-700 hover:border-red-200 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation()
                setShowMoveHint(true)
                setTimeout(() => setShowMoveHint(false), 1200)
              }}
            >
              Move (Griff)
            </button>
            <button
              className="rounded-lg border border-slate-200 px-2 py-1 font-semibold text-slate-700 hover:border-red-200 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation()
                onRotate(module.id, nextRotation(module.rotation))
              }}
            >
              Rotieren
            </button>
            <button
              className="rounded-lg border border-slate-200 px-2 py-1 font-semibold text-slate-700 hover:border-red-200 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation()
                onConfigure(module.id)
              }}
            >
              Binding konfigurieren
            </button>
            <button
              className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 font-semibold text-rose-700 hover:bg-rose-100"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(module.id)
              }}
            >
              Löschen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

type PlantCanvasProps = {
  modules: PlacedModule[]
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (id: string, pos: { x: number; y: number }) => void
  onCreate: (type: ModuleType, position: { x: number; y: number }) => void
  onRotate: (id: string, rotation: Rotation) => void
  onRemove: (id: string) => void
  onConfigure: (id: string) => void
}

function PlantCanvas({ modules, selectedId, onSelect, onMove, onCreate, onRotate, onRemove, onConfigure }: PlantCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasRect, setCanvasRect] = useState<DOMRect>()
  const definitionMap = useMemo<Partial<Record<ModuleType, ModuleDefinition>>>(() => moduleDefinitionMap, [])

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
          const fallback: ModuleDefinition = {
            type: module.type,
            label: module.label,
            icon: 'status' as IconName,
            color: 'from-slate-500 to-slate-600',
            category: 'logical',
          }
          const definition = definitionMap[module.type] ?? fallback
          return (
            <ModuleBlock
              key={module.id}
              module={module}
              definition={definition}
              selected={selectedId === module.id}
              onSelect={onSelect}
              onMove={onMove}
              onRotate={onRotate}
              onRemove={onRemove}
              onConfigure={onConfigure}
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
  onBindingChange: (id: string, patch: { stateTopic?: string; metaTopic?: string; deviceType?: 'sensor' | 'actuator' | 'logical' }) => void
  configRef?: React.RefObject<HTMLDivElement | null>
}

function ModuleDetailPanel({ module, onRotate, onRemove, onLabelChange, onBindingChange, configRef }: ModuleDetailProps) {
  const { binding, lastValue, metaValue, lastMessageAt } = useModuleSignal(module?.id ?? '')
  const definition = module ? moduleDefinitionMap[module.type] : undefined
  const stateOptions = module ? getTopicOptionsForModule(module.type, 'state') : []
  const metaOptions = module ? getTopicOptionsForModule(module.type, 'meta') : []
  const defaults = module ? getDefaultTopicsForModule(module.type) : {}
  const displayState = formatValue(lastValue, module?.type, binding?.stateTopic ?? defaults.stateTopic)
  const displayMeta = formatValue(metaValue, module?.type, binding?.metaTopic ?? defaults.metaTopic)
  const moduleCategory: 'sensor' | 'actuator' | 'logical' = definition?.category ?? 'sensor'
  const resolveTopicId = (id: string) => mqttTopicOptions.find((opt) => opt.id === id)?.topic ?? id

  if (!module) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">
        Wähle ein Modul im Canvas, um Details, Topics und Status zu sehen.
      </div>
    )
  }

  const rotation = nextRotation(module.rotation)
  const stateTopicValue = binding?.stateTopic ?? defaults.stateTopic ?? ''
  const metaTopicValue = binding?.metaTopic ?? defaults.metaTopic ?? ''

  return (
    <div ref={configRef} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Modul</p>
          <p className="text-lg font-semibold text-slate-900">{module.label}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">{module.type}</span>
            <span className="rounded-full bg-red-50 px-2 py-1 font-semibold text-red-700">{moduleCategory.toUpperCase()}</span>
            {definition?.description && <span className="text-slate-500">{definition.description}</span>}
          </div>
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

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Logischer Typ</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{definition?.label ?? module.type}</p>
          <p className="text-[11px] text-slate-500">
            Kategorie: {moduleCategory === 'logical' ? 'Logik' : moduleCategory === 'actuator' ? 'Aktor' : 'Sensor'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-xs font-semibold text-slate-500">
          State-Topic
          <select
            value={stateTopicValue}
            onChange={(e) => onBindingChange(module.id, { stateTopic: e.target.value, deviceType: moduleCategory })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
          >
            <option value="">State-Topic auswählen</option>
            {stateOptions.map((option) => (
              <option key={option.id} value={option.topic}>
                {option.label} — {option.topic}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">Aus den bekannten Topics der DHBW-Logistikstrecke.</p>
        </label>

        <label className="block text-xs font-semibold text-slate-500">
          Meta-Topic (optional)
          <select
            value={metaTopicValue}
            onChange={(e) => onBindingChange(module.id, { metaTopic: e.target.value, deviceType: moduleCategory })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
          >
            <option value="">Meta-Topic auswählen</option>
            {metaOptions.map((option) => (
              <option key={option.id} value={option.topic}>
                {option.label} — {option.topic}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">Zusatzinfos wie Position oder NFC-Metadaten.</p>
        </label>
      </div>

      {definition?.expectedTopics && (
        <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Erwartete Topics</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(definition.expectedTopics.state ?? []).map((topicId) => (
              <span key={topicId} className="rounded-full bg-white px-3 py-1 font-mono text-[11px] text-slate-700">
                {resolveTopicId(topicId)}
              </span>
            ))}
            {(definition.expectedTopics.meta ?? []).map((topicId) => (
              <span key={topicId} className="rounded-full bg-white px-3 py-1 font-mono text-[11px] text-slate-700">
                {resolveTopicId(topicId)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {moduleCategory === 'actuator' ? (isActiveValue(lastValue) ? 'Aktiv' : 'Inaktiv') : displayState}
          </p>
          <p className="text-[11px] text-slate-500">Letzte Nachricht: {lastMessageAt?.toLocaleTimeString() ?? '–'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">State</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{displayState}</p>
          <p className="text-[11px] text-slate-500 break-all">{binding?.stateTopic || defaults.stateTopic || 'kein Topic gesetzt'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Meta</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{displayMeta}</p>
          <p className="text-[11px] text-slate-500 break-all">{binding?.metaTopic || defaults.metaTopic || 'kein Topic gesetzt'}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        Dashboard ist read-only: es werden nur MQTT-Werte aus den echten Topics angezeigt, keine Kommandos gesendet.
      </div>
    </div>
  )
}

export function PlantBuilderView() {
  const { state, addModule, updateModule, updateBinding, removeModule, reset, save } = usePlantStore()
  const [selectedId, setSelectedId] = useState<string | null>(state.modules[0]?.id ?? null)
  const configPanelRef = useRef<HTMLDivElement | null>(null)
  const effectiveSelectedId = useMemo(() => {
    if (selectedId && state.modules.some((m) => m.id === selectedId)) return selectedId
    return state.modules[0]?.id ?? null
  }, [selectedId, state.modules])

  const selectedModule = useMemo(() => state.modules.find((m) => m.id === effectiveSelectedId), [effectiveSelectedId, state.modules])

  const handleCreate = (type: ModuleType, position: { x: number; y: number }) => {
    const definition = modulePalette.find((m) => m.type === type)
    const id = addModule(type, position, definition?.defaultRotation, definition?.label)
    setSelectedId(id)
  }

  const handleConfigure = (id: string) => {
    setSelectedId(id)
    configPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          <button
            onClick={() => save()}
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            Layout speichern
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
        <ModulePalette onAdd={(type) => handleCreate(type, { x: 50, y: 50 })} />
        <PlantCanvas
          modules={state.modules}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedId}
          onMove={(id, pos) => updateModule(id, pos)}
          onCreate={handleCreate}
          onRotate={(id, rotation) => updateModule(id, { rotation })}
          onRemove={(id) => {
            removeModule(id)
            setSelectedId((prev) => (prev === id ? null : prev))
          }}
          onConfigure={handleConfigure}
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
        configRef={configPanelRef}
      />

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">Verschieben per Griff + Raster-Snap (2%)</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Signal-Dot blinkt bei neuen MQTT-Messages</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Persistenz via LocalStorage (später ersetzbar durch Backend)</span>
      </div>
    </section>
  )
}
