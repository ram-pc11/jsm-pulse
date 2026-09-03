import { useState } from 'react'
import PageHead from '../layout/PageHead.jsx'
import ServerPaginatedTable from '../shared/ServerPaginatedTable.jsx'
import ServiceDeskPicker from '../shared/ServiceDeskPicker.jsx'
import { fetchSlaOverviewPage } from '../../services/slaService.js'

const COLUMNS = [
  { key: 'queueName', header: 'Queue' },
  {
    key: 'tracked',
    header: 'Tracked (sampled)',
    render: (row) => row.sla?.tracked ?? '—',
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
          {row.sla.isSampled && <span className="ml-1 text-xs text-slate-500">(sampled)</span>}
        </span>
      )
    },
  },
]

const SlaView = () => {
  const [serviceDeskId, setServiceDeskId] = useState(null)

  return (
    <div>
      <PageHead
        title="SLA"
        description="SLA breach rate per queue, sampled from up to 25 tickets per queue. See the Dashboard's At-Risk Queues for a ranked view across the whole desk."
      />

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-black">Service desk:</span>
        <ServiceDeskPicker value={serviceDeskId} onChange={setServiceDeskId} />
      </div>

      {serviceDeskId ? (
        <ServerPaginatedTable
          fetchPage={(cursor) => fetchSlaOverviewPage(serviceDeskId, cursor)}
          columns={COLUMNS}
          rowKey="queueId"
          deps={[serviceDeskId]}
        />
      ) : (
        <p className="text-sm text-slate-700">Select a service desk to view SLA data.</p>
      )}
    </div>
  )
}

export default SlaView
