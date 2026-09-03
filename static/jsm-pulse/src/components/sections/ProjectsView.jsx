import { useEffect, useState } from 'react'
import PageHead from '../layout/PageHead.jsx'
import ServerPaginatedTable from '../shared/ServerPaginatedTable.jsx'
import SectionSummary from '../shared/SectionSummary.jsx'
import LoadingState from '../shared/LoadingState.jsx'
import { fetchProjectsPage, fetchProjectsSummary } from '../../services/projectService.js'

const COLUMNS = [
  { key: 'projectName', header: 'Project' },
  { key: 'projectKey', header: 'Key' },
  {
    key: 'ticketCount',
    header: 'Ticket Count',
    render: (row) => (row.ticketCount === null ? '—' : row.ticketCount),
  },
]

const ProjectsView = () => {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchProjectsSummary()
      .then((result) => !cancelled && setSummary(result))
      .catch((err) => !cancelled && setError(err))
    return () => {
      cancelled = true
    }
  }, [])

  const metrics = summary && [
    { label: 'Total Projects', value: summary.totalProjects },
    { label: 'Total Tickets', value: summary.totalTickets, accent: true },
    { label: 'Busiest Project', value: summary.busiestProjectName ?? '—' },
  ]

  return (
    <div>
      <PageHead title="Projects" description="JSM (service desk) projects and their ticket volume." />

      {error && <p className="mb-4 text-sm text-red-600">Failed to load summary: {error.message}</p>}
      {!error && !summary && <LoadingState label="Loading summary..." />}
      {summary && (
        <SectionSummary
          metrics={metrics}
          distribution={summary.distribution}
          distributionLabel="Tickets by Project"
          stackDistribution
        />
      )}

      <ServerPaginatedTable fetchPage={fetchProjectsPage} columns={COLUMNS} rowKey="serviceDeskId" />
    </div>
  )
}

export default ProjectsView
