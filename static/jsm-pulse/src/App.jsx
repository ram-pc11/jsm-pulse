import { useState } from 'react'
import TopBar from './components/layout/TopBar.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import DashboardView from './components/sections/DashboardView.jsx'
import IncidentsView from './components/sections/IncidentsView.jsx'
import ProblemsView from './components/sections/ProblemsView.jsx'
import ChangesView from './components/sections/ChangesView.jsx'
import ServiceRequestsView from './components/sections/ServiceRequestsView.jsx'
import SlaView from './components/sections/SlaView.jsx'
import SettingsView from './components/settings/SettingsView.jsx'
import AssistantLauncher from './components/assistant/AssistantLauncher.jsx'

const VIEWS = {
  dashboard: DashboardView,
  incidents: IncidentsView,
  problems: ProblemsView,
  changes: ChangesView,
  serviceRequests: ServiceRequestsView,
  sla: SlaView,
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
      <AssistantLauncher />
    </div>
  )
}

export default App