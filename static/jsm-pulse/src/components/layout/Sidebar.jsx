import { useState } from 'react'

const IconDashboard = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const IconProjects = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <path
      d="M2.5 6a1.5 1.5 0 0 1 1.5-1.5h3l1.5 2h7A1.5 1.5 0 0 1 17 8v6.5A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

const IconIncidents = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <path
      d="M10 2.5 2.5 16h15z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M10 8v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="13.5" r="0.9" fill="currentColor" />
  </svg>
)

const IconProblems = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="13" r="0.9" fill="currentColor" />
  </svg>
)

const IconChanges = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <path d="M4 7h9.5l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 13H6.5L9 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconSla = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconSettings = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M10 3v1.6M10 15.4V17M17 10h-1.6M4.6 10H3M14.9 5.1l-1.13 1.13M6.23 13.67 5.1 14.9M14.9 14.9l-1.13-1.13M6.23 6.23 5.1 5.1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const JSM_SUBITEMS = [
  { key: 'projects', label: 'Projects', icon: IconProjects },
  { key: 'incidents', label: 'Incidents', icon: IconIncidents },
  { key: 'problems', label: 'Problems', icon: IconProblems },
  { key: 'changes', label: 'Changes', icon: IconChanges },
  { key: 'sla', label: 'SLA', icon: IconSla },
]

const NavItem = ({ label, active, onClick, pill, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
      active ? 'bg-accent/10 font-medium text-accent' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {Icon && <Icon />}
    <span className="flex-1">{label}</span>
    {pill && (
      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">{pill}</span>
    )}
  </button>
)

const Sidebar = ({ activeView, onNavigate }) => {
  const [jsmExpanded, setJsmExpanded] = useState(true)

  return (
    <nav className="flex w-60 shrink-0 flex-col gap-6 border-r border-slate-200 bg-white p-4">
      <NavItem
        label="Dashboard"
        icon={IconDashboard}
        active={activeView === 'dashboard'}
        onClick={() => onNavigate('dashboard')}
      />

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
          className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
                icon={item.icon}
                active={activeView === item.key}
                onClick={() => onNavigate(item.key)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <NavItem
          label="Settings"
          icon={IconSettings}
          active={activeView === 'settings'}
          onClick={() => onNavigate('settings')}
        />
      </div>
    </nav>
  )
}

export default Sidebar
