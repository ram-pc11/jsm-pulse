import { useMemo, useState } from 'react'
import PageHead from '../layout/PageHead.jsx'
import PaginatedList from '../shared/PaginatedList.jsx'
import DataTable from '../shared/DataTable.jsx'
import ServiceDeskPicker from '../shared/ServiceDeskPicker.jsx'
import SectionSummary from '../shared/SectionSummary.jsx'
import { fetchSlaOverview } from '../../services/slaService.js'

const COLUMNS = [
  { key: 'queueName', header: 'Queue' },
  {
    key: 'tracked',
    header: 'Tracked',
    render: (row) => row.sla?.tracked ?? '—',
  },
  {
    key: 'untracked',
    header: 'Untracked',
    render: (row) => row.sla?.untracked ?? '—',
  },
  {
    key: 'breached',
    header: 'Breached',
    render: (row) => row.sla?.breached ?? '—',
  },
  {
    key: 'breachRate',
    header: 'Breach Rate',
    render: (row) => {
      if (!row.sla) return <span className="text-slate-400">Unavailable</span>
      return (
        <span className={row.sla.breachRate > 0.2 ? 'font-medium text-red-600' : 'text-slate-700'}>
          {Math.round(row.sla.breachRate * 100)}%
          {row.sla.isSampled && <span className="ml-1 text-xs text-slate-400">(sampled)</span>}
        </span>
      )
    },
  },
]

const SlaView = () => {
  const [serviceDeskId, setServiceDeskId] = useState(null)

  return (
    <div>
      <PageHead title="SLA" description="SLA breach rates sampled per queue across a service desk." />

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-slate-500">Service desk:</span>
        <ServiceDeskPicker value={serviceDeskId} onChange={setServiceDeskId} />
      </div>

      {serviceDeskId ? (
        <PaginatedList fetchAll={(onProgress) => fetchSlaOverview(serviceDeskId, onProgress)} loadingLabel="Sampling SLA data...">
          {(items) => <SlaContent items={items} />}
        </PaginatedList>
      ) : (
        <p className="text-sm text-slate-400">Select a service desk to view SLA data.</p>
      )}
    </div>
  )
}

const SlaContent = ({ items }) => {
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
      <DataTable columns={COLUMNS} rows={items} rowKey="queueId" />
    </>
  )
}

export default SlaView
