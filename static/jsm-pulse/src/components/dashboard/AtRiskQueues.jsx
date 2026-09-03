import { useEffect, useState } from 'react'
import LoadingState from '../shared/LoadingState.jsx'
import { fetchSlaOverview } from '../../services/slaService.js'

// Ranks queues by sampled SLA breach rate (see resolvers/slaResolvers.js
// getSlaOverview -- breach % is sampled per queue, not a full-backlog scan).
const AtRiskQueues = ({ serviceDeskId }) => {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!serviceDeskId) return
    let cancelled = false

    fetchSlaOverview(serviceDeskId)
      .then((overview) => {
        if (!cancelled) {
          setRows(
            overview.items
              .filter((q) => q.sla)
              .sort((a, b) => b.sla.breachRate - a.sla.breachRate)
              .slice(0, 5)
          )
        }
      })
      .catch((err) => !cancelled && setError(err))

    return () => {
      cancelled = true
    }
  }, [serviceDeskId])

  if (!serviceDeskId) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-slate-800">At-Risk Queues</h2>
        <p className="text-sm text-slate-4=700">Select a service desk to view queue risk.</p>
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load queue SLA data: {error.message}</p>
  }

  if (rows === null) return <LoadingState label="Loading queue risk..." />

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-black">At-Risk Queues</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-700">No queues found.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((queue) => (
            <li key={queue.queueId} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{queue.queueName}</span>
              <span className="font-medium text-orange-600">
                {Math.round(queue.sla.breachRate * 100)}% breach
                {queue.sla.isSampled && <span className="ml-1 text-xs text-slate-500">(sampled)</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AtRiskQueues
