import { useEffect, useState } from 'react'
import PageHead from '../layout/PageHead.jsx'
import ServerPaginatedTable from '../shared/ServerPaginatedTable.jsx'
import SeverityPill from '../shared/SeverityPill.jsx'
import SectionSummary from '../shared/SectionSummary.jsx'
import LoadingState from '../shared/LoadingState.jsx'
import { fetchIncidentsPage, fetchIncidentsSummary } from '../../services/incidentService.js'

const COLUMNS = [
  { key: 'key', header: 'Key' },
  { key: 'summary', header: 'Summary' },
  { key: 'priority', header: 'Priority', render: (row) => <SeverityPill value={row.priority} kind="priority" /> },
  { key: 'status', header: 'Status' },
  { key: 'assignee', header: 'Assignee' },
]

const IncidentsView = () => {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchIncidentsSummary()
      .then((result) => !cancelled && setSummary(result))
      .catch((err) => !cancelled && setError(err))
    return () => {
      cancelled = true
    }
  }, [])

  const metrics = summary && [
    { label: 'Total Incidents', value: summary.total },
    { label: 'Open', value: summary.open, accent: true },
    { label: 'Resolved', value: summary.resolved },
    { label: 'Unassigned', value: summary.unassigned },
  ]

  return (
    <div>
      <PageHead title="Incidents" description="All open and recent incidents across your JSM projects." />

      {error && <p className="mb-4 text-sm text-red-600">Failed to load summary: {error.message}</p>}
      {!error && !summary && <LoadingState label="Loading summary..." />}
      {summary && (
        <SectionSummary metrics={metrics} distribution={summary.distribution} distributionLabel="Priority Distribution" />
      )}

      <ServerPaginatedTable fetchPage={fetchIncidentsPage} columns={COLUMNS} rowKey="key" />
    </div>
  )
}

export default IncidentsView
