import { useMemo } from 'react'
import PageHead from '../layout/PageHead.jsx'
import PaginatedList from '../shared/PaginatedList.jsx'
import DataTable from '../shared/DataTable.jsx'
import SeverityPill from '../shared/SeverityPill.jsx'
import SectionSummary from '../shared/SectionSummary.jsx'
import { fetchAllProblems } from '../../services/problemService.js'
import { countBy } from '../../utils/aggregate.js'

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
  return (
    <div>
      <PageHead title="Problems" description="Root-cause problem records and their linked incidents." />
      <PaginatedList fetchAll={fetchAllProblems} loadingLabel="Loading problems...">
        {(items) => <ProblemsContent items={items} />}
      </PaginatedList>
    </div>
  )
}

const ProblemsContent = ({ items }) => {
  const { metrics, distribution } = useMemo(() => {
    const withLinks = items.filter((item) => (item.linkedIncidentCount ?? 0) > 0).length
    const totalLinkedIncidents = items.reduce((sum, item) => sum + (item.linkedIncidentCount ?? 0), 0)

    return {
      metrics: [
        { label: 'Total Problems', value: items.length },
        { label: 'With Linked Incidents', value: withLinks, accent: true },
        { label: 'Total Linked Incidents', value: totalLinkedIncidents },
        { label: 'No Links Yet', value: items.length - withLinks },
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

export default ProblemsView
