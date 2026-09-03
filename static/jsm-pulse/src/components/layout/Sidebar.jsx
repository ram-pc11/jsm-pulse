import { useState } from 'react'

const JSM_SUBITEMS = [
  { key: 'incidents', label: 'Incidents' },
  { key: 'problems', label: 'Problems' },
  { key: 'changes', label: 'Changes' },
  { key: 'sla', label: 'SLA' },
  { key: 'projects', label: 'Projects' },
]

const NavItem = ({ label, active, onClick, pill }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
      active ? 'bg-accent/10 font-medium text-accent' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <span>{label}</span>
    {pill && (
      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">{pill}</span>
    )}
  </button>
)

const Sidebar = ({ activeView, onNavigate }) => {
  const [jsmExpanded, setJsmExpanded] = useState(true)

  return (
    <nav className="flex w-60 shrink-0 flex-col gap-6 border-r border-slate-200 bg-white p-4">
      <NavItem label="Dashboard" active={activeView === 'dashboard'} onClick={() => onNavigate('dashboard')} />

      <div>
        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Pulse AI Agents</p>
        <NavItem
          label="JSM Pulse Agent"
          pill="New"
          active={activeView === 'jsmPulseAgent'}
          onClick={() => onNavigate('jsmPulseAgent')}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setJsmExpanded((prev) => !prev)}
          className="mb-1 flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wide text-slate-400"
        >
          <span>JSM</span>
          <span>{jsmExpanded ? '−' : '+'}</span>
        </button>
        {jsmExpanded && (
          <div className="flex flex-col gap-0.5">
            {JSM_SUBITEMS.map((item) => (
              <NavItem
                key={item.key}
                label={item.label}
                active={activeView === item.key}
                onClick={() => onNavigate(item.key)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <NavItem label="Settings" active={activeView === 'settings'} onClick={() => onNavigate('settings')} />
      </div>
    </nav>
  )
}

export default Sidebar
