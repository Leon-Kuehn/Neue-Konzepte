const navItems = [
  { href: '#overview', label: 'Übersicht' },
  { href: '#plant', label: 'Anlagenansicht (Schaltplan)' },
  { href: '#sensors', label: 'Sensoren' },
  { href: '#actuators', label: 'Aktoren' },
  { href: '#system', label: 'Systemstatus' },
]

export function Sidebar() {
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
          <a
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
