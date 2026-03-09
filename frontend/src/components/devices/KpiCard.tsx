import clsx from 'clsx'
import { NamedIcon } from '../common/Icon'
import type { IconName } from '../../types/devices'

type KpiCardProps = {
  title: string
  value?: string | number
  unit?: string
  icon?: IconName
  tone?: 'primary' | 'neutral'
  helper?: string
}

export function KpiCard({ title, value, unit, icon = 'kpi', tone = 'primary', helper }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span
          className={clsx(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            tone === 'primary' ? 'bg-red-50 text-dhbw-dark' : 'bg-slate-100 text-slate-600'
          )}
        >
          <NamedIcon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-slate-900">{value ?? '–'}</span>
        {unit && <span className="text-base text-slate-500">{unit}</span>}
      </div>
      {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
    </div>
  )
}
