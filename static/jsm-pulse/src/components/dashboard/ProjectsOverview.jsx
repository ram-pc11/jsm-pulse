import MetricCard from '../shared/MetricCard.jsx'
import DonutChart from '../shared/DonutChart.jsx'

const ProjectsOverview = ({ overview }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total Projects" value={overview.totalProjects} />
        <MetricCard label="Total Tickets" value={overview.totalTickets} accent />
        <MetricCard label="Busiest Project" value={overview.busiestProjectName ?? '—'} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-slate-500">Tickets by Project</p>
          <DonutChart distribution={overview.ticketsByProject} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm font-medium text-slate-500">Tickets by Request Type</p>
          <p className="mb-2 text-xs text-slate-400">
            Site-wide, from every service desk. Request types in the same project that share an underlying issue
            type can't be distinguished by JQL and are merged.
          </p>
          <DonutChart distribution={overview.ticketsByRequestType} />
        </div>
      </div>
    </div>
  )
}

export default ProjectsOverview
