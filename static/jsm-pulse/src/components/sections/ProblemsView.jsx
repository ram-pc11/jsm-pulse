import { useEffect, useState } from 'react'
import PageHead from '../layout/PageHead.jsx'
import ServerPaginatedTable from '../shared/ServerPaginatedTable.jsx'
import SeverityPill from '../shared/SeverityPill.jsx'
import SectionSummary from '../shared/SectionSummary.jsx'
import LoadingState from '../shared/LoadingState.jsx'
import { fetchProblemsPage, fetchProblemsSummary } from '../../services/problemService.js'

const COLUMNS = [
  { key: 'key', header: 'Key' },
  { key: 'summary', header: 'Summary' },
  { key: 'priority', header: 'Priority', render: (row) => <SeverityPill value={row.priority} kind="priority" /> },
  { key: 'status', header: 'Status' },
  {
    key: 'linkedIncidentCount',
    header: 'Linked Incidents',
    render: (row) => (row.linkedIncidentCount === null ? '—' : row.linkedIncidentCount),
  },
]

const ProblemsView = () => {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchProblemsSummary()
      .then((result) => !cancelled && setSummary(result))
      .catch((err) => !cancelled && setError(err))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHead title="Problems" description="Root-cause problem records and their linked incidents." />

      {error && <p className="mb-4 text-sm text-red-600">Failed to load summary: {error.message}</p>}
      {!error && !summary && <LoadingState label="Loading summary..." />}
      {summary && (
        <SectionSummary
          metrics={[{ label: 'Total Problems', value: summary.total, accent: true }]}
          distribution={summary.distribution}
          distributionLabel="Priority Distribution"
        />
      )}

      <ServerPaginatedTable fetchPage={fetchProblemsPage} columns={COLUMNS} rowKey="key" />
    </div>
  )
}

export default ProblemsView
