import { useMemo } from 'react'
import PageHead from '../layout/PageHead.jsx'
import PaginatedList from '../shared/PaginatedList.jsx'
import DataTable from '../shared/DataTable.jsx'
import SeverityPill from '../shared/SeverityPill.jsx'
import SectionSummary from '../shared/SectionSummary.jsx'
import { fetchAllIncidents } from '../../services/incidentService.js'
import { countBy } from '../../utils/aggregate.js'

const COLUMNS = [
  { key: 'key', header: 'Key' },
  { key: 'summary', header: 'Summary' },
  { key: 'priority', header: 'Priority', render: (row) => <SeverityPill value={row.priority} kind="priority" /> },
  { key: 'status', header: 'Status' },
  { key: 'assignee', header: 'Assignee' },
]

const IncidentsView = () => {
  return (
    <div>
      <PageHead title="Incidents" description="All open and recent incidents across your JSM projects." />
      <PaginatedList fetchAll={fetchAllIncidents} loadingLabel="Loading incidents...">
        {(items) => <IncidentsContent items={items} />}
      </PaginatedList>
    </div>
  )
}

const IncidentsContent = ({ items }) => {
  const { metrics, distribution } = useMemo(() => {
    const resolved = items.filter((item) => item.status === 'Resolved' || item.status === 'Closed' || item.status === 'Done').length
    const unassigned = items.filter((item) => item.assignee === 'Unassigned').length

    return {
      metrics: [
        { label: 'Total Incidents', value: items.length },
        { label: 'Open', value: items.length - resolved, accent: true },
        { label: 'Resolved', value: resolved },
        { label: 'Unassigned', value: unassigned },
      ],
      distribution: countBy(items, (item) => item.priority),
    }
  }, [items])

  return (
    <>
      <SectionSummary metrics={metrics} distribution={distribution} distributionLabel="Priority Distribution" />
      <DataTable columns={COLUMNS} rows={items} rowKey="key" />
    </>
  )
}

export default IncidentsView
