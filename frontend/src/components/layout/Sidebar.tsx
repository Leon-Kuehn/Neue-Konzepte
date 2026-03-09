import clsx from 'clsx'

type SidebarProps = {
  active: string
  onSelect: (key: string) => void
}

const navItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'builder', label: 'Plant Builder' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'status', label: 'MQTT & Status' },
  { key: 'settings', label: 'Settings' },
]

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-100 bg-white/90 px-6 py-8 backdrop-blur lg:flex">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-700">DHBW</p>
        <h1 className="text-xl font-bold text-slate-900">IoT Monitoring Dashboard</h1>
        <p className="text-xs text-slate-500">Smart-Village / Smart-Campus Demo</p>
      </div>

      <div className="mt-8">
        <label className="text-xs font-medium text-slate-500">Projekt</label>
        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          DHBW Musterprojekt
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Platzhalter für Projektauswahl / Auth.</p>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={clsx(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition',
              active === item.key ? 'bg-red-50 text-red-700 ring-1 ring-red-100' : 'hover:bg-red-50 hover:text-red-700'
            )}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
