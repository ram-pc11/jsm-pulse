import { useMemo, useState } from 'react'
import PaginatedList from '../shared/PaginatedList.jsx'
import DataTable from '../shared/DataTable.jsx'
import ServiceDeskPicker from '../shared/ServiceDeskPicker.jsx'
import SectionSummary from '../shared/SectionSummary.jsx'
import { fetchSlaOverview } from '../../services/slaService.js'
import { fetchAllQueues } from '../../services/queueService.js'

const SLA_COLUMNS = [
  { key: 'queueName', header: 'Queue' },
  { key: 'tracked', header: 'Tracked', render: (row) => row.sla?.tracked ?? '—' },
  { key: 'breached', header: 'Breached', render: (row) => row.sla?.breached ?? '—' },
  {
    key: 'breachRate',
    header: 'Breach Rate',
    render: (row) => {
      if (!row.sla) return <span className="text-slate-400">Unavailable</span>
      return (
        <span className={row.sla.breachRate > 0.2 ? 'font-medium text-red-600' : 'text-slate-700'}>
          {Math.round(row.sla.breachRate * 100)}%
          {row.sla.isSampled && <span className="ml-1 text-xs text-slate-500">(sampled)</span>}
        </span>
      )
    },
  },
]

const BACKLOG_COLUMNS = [
  { key: 'name', header: 'Queue' },
  { key: 'issueCount', header: 'Open Issues', render: (row) => row.issueCount ?? '—' },
]

const JsmPulseAgentReports = () => {
  const [serviceDeskId, setServiceDeskId] = useState(null)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <span className="text-sm text-black">Service desk:</span>
        <ServiceDeskPicker value={serviceDeskId} onChange={setServiceDeskId} />
      </div>

      {!serviceDeskId ? (
        <p className="text-sm text-slate-700">Select a service desk to view reports.</p>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-base font-semibold text-black">SLA Breach Report</h2>
            <PaginatedList
              fetchAll={(onProgress) => fetchSlaOverview(serviceDeskId, onProgress)}
              loadingLabel="Sampling SLA data..."
              deps={[serviceDeskId]}
            >
              {(items) => <SlaReportContent items={items} />}
            </PaginatedList>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">Queue Backlog Report</h2>
            <PaginatedList
              fetchAll={(onProgress) => fetchAllQueues(serviceDeskId, onProgress)}
              loadingLabel="Loading queues..."
              deps={[serviceDeskId]}
            >
              {(items) => <DataTable columns={BACKLOG_COLUMNS} rows={items} rowKey="id" />}
            </PaginatedList>
          </section>
        </>
      )}
    </div>
  )
}

const SlaReportContent = ({ items }) => {
  const metrics = useMemo(() => {
    const withSla = items.filter((item) => item.sla)
    const totalTracked = withSla.reduce((sum, item) => sum + item.sla.tracked, 0)
    const totalBreached = withSla.reduce((sum, item) => sum + item.sla.breached, 0)
    const overallBreachRate = totalTracked > 0 ? totalBreached / totalTracked : 0
    const worstQueue = withSla.reduce((max, item) => (item.sla.breachRate > (max?.sla.breachRate ?? -1) ? item : max), null)

    return [
      { label: 'Queues Sampled', value: items.length },
      { label: 'Overall Breach Rate', value: `${Math.round(overallBreachRate * 100)}%`, accent: true },
      { label: 'Total Breached (sampled)', value: totalBreached },
      { label: 'Highest-Risk Queue', value: worstQueue?.queueName ?? '—' },
    ]
  }, [items])

  return (
    <>
      <SectionSummary metrics={metrics} />
      <DataTable columns={SLA_COLUMNS} rows={items} rowKey="queueId" />
    </>
  )
}

export default JsmPulseAgentReports
