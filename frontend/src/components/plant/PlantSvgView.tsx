import { type ComponentType, type SVGProps, useEffect, useMemo, useRef } from 'react'
import type { PlantComponent } from '../../types/plant'
// @ts-expect-error – vite/react plugin enables ?react for SVGs
import PlantSvg from '../../../../svg/TopDown.drawio.svg?react'

type PlantSvgViewProps = {
  components: PlantComponent[]
  selectedId?: string
  onSelect: (componentId: string) => void
}

const highlightSvgElement = (root: SVGSVGElement | null, selectedId?: string) => {
  if (!root) return
  const nodes = root.querySelectorAll<HTMLElement>('[data-component-id]')
  nodes.forEach((node) => node.classList.remove('component-active'))
  if (!selectedId) return
  const target = root.querySelector<HTMLElement>(`[data-component-id="${selectedId}"]`)
  if (target) {
    target.classList.add('component-active')
  }
}

export function PlantSvgView({ components, selectedId, onSelect }: PlantSvgViewProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const SvgComponent = useMemo(() => PlantSvg as unknown as ComponentType<SVGProps<SVGSVGElement>>, [])

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement
      const componentId = target.closest<HTMLElement>('[data-component-id]')?.getAttribute('data-component-id')
      if (componentId) {
        onSelect(componentId)
      }
    }
    svgEl.addEventListener('click', handleClick)
    return () => {
      svgEl.removeEventListener('click', handleClick)
    }
  }, [onSelect])

  useEffect(() => {
    highlightSvgElement(svgRef.current, selectedId)
  }, [selectedId])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Top-Down Ansicht</p>
          <h3 className="text-2xl font-bold text-slate-900">Digitale Anlage</h3>
          <p className="text-sm text-slate-500">Klicke auf Segmente oder Stationen, um Details anzuzeigen.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> aktiv
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-slate-300" /> offline
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-red-600" /> selektiert
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-card">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(198,0,31,0.05),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.05),transparent_40%)]" />
        <div className="relative">
          <SvgComponent ref={svgRef} className="h-full w-full" role="img" aria-label="Top-Down Anlagenübersicht" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {components.map((component) => (
          <span
            key={component.id}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
              selectedId === component.id ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-white'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${component.online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {component.name}
          </span>
        ))}
      </div>
    </div>
  )
}
