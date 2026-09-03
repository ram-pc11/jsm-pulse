import { useMemo, useState } from 'react'
import PageHead from '../layout/PageHead.jsx'
import PaginatedList from '../shared/PaginatedList.jsx'
import DataTable from '../shared/DataTable.jsx'
import ServiceDeskPicker from '../shared/ServiceDeskPicker.jsx'
import SectionSummary from '../shared/SectionSummary.jsx'
import StackedBarChart from '../shared/StackedBarChart.jsx'
import { fetchAllServiceRequests, fetchAllQueues } from '../../services/serviceRequestService.js'
import { countByTwoDimensions } from '../../utils/aggregate.js'

const REQUEST_COLUMNS = [
  { key: 'key', header: 'Key' },
  { key: 'summary', header: 'Summary' },
  { key: 'requestType', header: 'Request Type' },
  { key: 'status', header: 'Status' },
]

const QUEUE_COLUMNS = [
  { key: 'name', header: 'Queue' },
  { key: 'issueCount', header: 'Ticket Count', render: (row) => row.issueCount ?? '—' },
]

const ServiceRequestsView = () => {
  const [serviceDeskId, setServiceDeskId] = useState(null)

  return (
    <div>
      <PageHead title="Service Requests" description="Customer requests, queues, and SLA health." />

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-slate-500">Service desk:</span>
        <ServiceDeskPicker value={serviceDeskId} onChange={setServiceDeskId} />
      </div>

      {serviceDeskId && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Queues</h2>
          <PaginatedList fetchAll={(onProgress) => fetchAllQueues(serviceDeskId, onProgress)} loadingLabel="Loading queues...">
            {(items) => <QueuesContent items={items} />}
          </PaginatedList>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-800">All Requests</h2>
        <PaginatedList fetchAll={fetchAllServiceRequests} loadingLabel="Loading service requests...">
          {(items) => <RequestsContent items={items} />}
        </PaginatedList>
      </div>
    </div>
  )
}

const QueuesContent = ({ items }) => {
  const metrics = useMemo(() => {
    const totalTickets = items.reduce((sum, queue) => sum + (queue.issueCount ?? 0), 0)
    const busiest = items.reduce((max, queue) => ((queue.issueCount ?? 0) > (max?.issueCount ?? 0) ? queue : max), null)

    return [
      { label: 'Total Queues', value: items.length },
      { label: 'Total Tickets', value: totalTickets, accent: true },
      { label: 'Busiest Queue', value: busiest?.name ?? '—' },
    ]
  }, [items])

  return (
    <>
      <SectionSummary metrics={metrics} />
      <DataTable columns={QUEUE_COLUMNS} rows={items} rowKey="id" />
    </>
  )
}

const RequestsContent = ({ items }) => {
  const { metrics, typeByStatus } = useMemo(() => {
    const uniqueTypes = new Set(items.map((item) => item.requestType)).size

    return {
      metrics: [
        { label: 'Total Requests', value: items.length },
        { label: 'Request Types', value: uniqueTypes, accent: true },
      ],
      typeByStatus: countByTwoDimensions(items, (item) => item.requestType, (item) => item.status),
    }
  }, [items])

  return (
    <>
      <SectionSummary metrics={metrics} />
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Request Types by Status</h2>
        <StackedBarChart data={typeByStatus.rows} segmentLabels={typeByStatus.segmentLabels} />
      </div>
      <DataTable columns={REQUEST_COLUMNS} rows={items} rowKey="key" />
    </>
  )
}

export default ServiceRequestsView
