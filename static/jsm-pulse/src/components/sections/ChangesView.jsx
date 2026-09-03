import { useMemo } from 'react'
import PageHead from '../layout/PageHead.jsx'
import PaginatedList from '../shared/PaginatedList.jsx'
import DataTable from '../shared/DataTable.jsx'
import SeverityPill from '../shared/SeverityPill.jsx'
import SectionSummary from '../shared/SectionSummary.jsx'
import { fetchAllChanges } from '../../services/changeService.js'
import { countBy } from '../../utils/aggregate.js'

const COLUMNS = [
  { key: 'key', header: 'Key' },
  { key: 'summary', header: 'Summary' },
  { key: 'priority', header: 'Priority', render: (row) => <SeverityPill value={row.priority} kind="priority" /> },
  { key: 'status', header: 'Status' },
  { key: 'approvalStatus', header: 'Approval Status' },
]

const ChangesView = () => {
  return (
    <div>
      <PageHead title="Changes" description="Change requests with current approval status." />
      <PaginatedList fetchAll={fetchAllChanges} loadingLabel="Loading changes...">
        {(items) => <ChangesContent items={items} />}
      </PaginatedList>
    </div>
  )
}

const ChangesContent = ({ items }) => {
  const { metrics, distribution } = useMemo(() => {
    const approved = items.filter((item) => item.approvalStatus === 'approved' || item.approvalStatus === 'Approved').length
    const pending = items.filter((item) => item.approvalStatus === 'Pending').length

    return {
      metrics: [
        { label: 'Total Changes', value: items.length },
        { label: 'Approved', value: approved, accent: true },
        { label: 'Pending Approval', value: pending },
        { label: 'No Approvals', value: items.filter((item) => item.approvalStatus === 'No approvals').length },
      ],
      distribution: countBy(items, (item) => item.approvalStatus),
    }
  }, [items])

  return (
    <>
      <SectionSummary metrics={metrics} distribution={distribution} distributionLabel="Approval Status" />
      <DataTable columns={COLUMNS} rows={items} rowKey="key" />
    </>
  )
}

export default ChangesView
