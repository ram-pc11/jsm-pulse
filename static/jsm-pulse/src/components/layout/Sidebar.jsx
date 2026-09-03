import { useState } from 'react'

// Public-folder assets must be resolved against the app's actual base URL --
// Forge Custom UI serves the build from a nested, non-root path, so a
// hardcoded "/icons/..." string (unlike paths in index.html) is never
// rewritten by Vite's `base` config and 404s once deployed.
const asset = (path) => `${import.meta.env.BASE_URL}${path}`

const ICONS = {
  brand: asset('icons/jsm-pulse.svg'),
  dashboard: asset('icons/dashboard.svg'),
  projects: asset('icons/projects.svg'),
  incidents: asset('icons/incidents.svg'),
  problems: asset('icons/problems.svg'),
  changes: asset('icons/changes.svg'),
  sla: asset('icons/sla.svg'),
  settings: asset('icons/settings.svg'),
}

const JSM_SUBITEMS = [
  { key: 'projects', label: 'Projects', icon: ICONS.projects },
  { key: 'incidents', label: 'Incidents', icon: ICONS.incidents },
  { key: 'problems', label: 'Problems', icon: ICONS.problems },
  { key: 'changes', label: 'Changes', icon: ICONS.changes },
  { key: 'sla', label: 'SLA', icon: ICONS.sla },
]

const NavItem = ({ label, active, onClick, pill, icon, collapsed }) => (
  <div className="group relative">
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md py-2 cursor-pointer text-left text-[15px] font-medium text-black transition-colors ${
        collapsed ? 'justify-center px-0' : 'px-3'
      } ${active ? 'bg-accent/10' : collapsed ? '' : 'hover:bg-slate-100'}`}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className={`shrink-0 object-contain ${collapsed ? 'h-6 w-6' : 'h-5 w-5'}`}
        />
      )}
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && pill && (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">{pill}</span>
      )}
    </button>
    {collapsed && (
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    )}
  </div>
)

const Sidebar = ({ activeView, onNavigate }) => {
  const [jsmExpanded, setJsmExpanded] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <nav
      className={`relative flex shrink-0 flex-col gap-6 border-r border-slate-200 bg-white p-3 pt-6 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-62'
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3 top-0 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-black shadow-sm transition-colors hover:bg-slate-100"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`h-3.5 w-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
        >
          <path
            d="M12.5 4 7 10l5.5 6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={`flex items-center gap-2 border-b border-slate-200 pb-4 ${collapsed ? 'justify-center' : 'px-1'}`}>
        <img src={ICONS.brand} alt="Service Management Lens" className="h-7 w-7 shrink-0" />
        {!collapsed && <span className="text-[15px] font-semibold text-black">Service Management Lens</span>}
      </div>

      <NavItem
        label="Dashboard"
        icon={ICONS.dashboard}
        active={activeView === 'dashboard'}
        onClick={() => onNavigate('dashboard')}
        collapsed={collapsed}
      />

      <div>
        {!collapsed && (
          <p className="mb-1 px-3 text-[15px] font-semibold uppercase tracking-wide text-gray-800">Pulse AI Agents</p>
        )}
        <NavItem
          label="JSM Pulse Agent"
          pill="New"
          active={activeView === 'jsmPulseAgent'}
          onClick={() => onNavigate('jsmPulseAgent')}
          collapsed={collapsed}
        />
      </div>

      <div>
        {collapsed ? (
          <div className="flex flex-col gap-0.5">
            {JSM_SUBITEMS.map((item) => (
              <NavItem
                key={item.key}
                label={item.label}
                icon={item.icon}
                active={activeView === item.key}
                onClick={() => onNavigate(item.key)}
                collapsed={collapsed}
              />
            ))}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setJsmExpanded((prev) => !prev)}
              className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1 cursor-pointer text-base font-semibold uppercase tracking-wide text-gray-800 transition-colors hover:text-black"
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
                    collapsed={collapsed}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-auto">
        <NavItem
          label="Settings"
          icon={ICONS.settings}
          active={activeView === 'settings'}
          onClick={() => onNavigate('settings')}
          collapsed={collapsed}
        />
      </div>
    </nav>
  )
}

export default Sidebar
