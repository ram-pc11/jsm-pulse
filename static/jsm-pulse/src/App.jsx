import { useState } from 'react'
import TopBar from './components/layout/TopBar.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import DashboardView from './components/sections/DashboardView.jsx'
import IncidentsView from './components/sections/IncidentsView.jsx'
import ProblemsView from './components/sections/ProblemsView.jsx'
import ChangesView from './components/sections/ChangesView.jsx'
import SlaView from './components/sections/SlaView.jsx'
import ProjectsView from './components/sections/ProjectsView.jsx'
import SettingsView from './components/settings/SettingsView.jsx'
import JsmPulseAgentView from './components/agents/JsmPulseAgentView.jsx'

const VIEWS = {
  dashboard: DashboardView,
  jsmPulseAgent: JsmPulseAgentView,
  incidents: IncidentsView,
  problems: ProblemsView,
  changes: ChangesView,
  sla: SlaView,
  projects: ProjectsView,
  settings: SettingsView,
}

const App = () => {
  const [activeView, setActiveView] = useState('dashboard')
  const ActiveViewComponent = VIEWS[activeView] ?? DashboardView

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <main className="flex-1 overflow-y-auto p-6">
          <ActiveViewComponent />
        </main>
      </div>
    </div>
  )
}

export default App