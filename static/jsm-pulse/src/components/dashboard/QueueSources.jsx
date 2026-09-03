import { useEffect, useState } from 'react'
import LoadingState from '../shared/LoadingState.jsx'
import { fetchAllQueues } from '../../services/serviceRequestService.js'

const QueueSources = ({ serviceDeskId }) => {
  const [queues, setQueues] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!serviceDeskId) return
    let cancelled = false

    fetchAllQueues(serviceDeskId)
      .then((result) => !cancelled && setQueues(result))
      .catch((err) => !cancelled && setError(err))

    return () => {
      cancelled = true
    }
  }, [serviceDeskId])

  if (!serviceDeskId) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-slate-800">Queue Sources</h2>
        <p className="text-sm text-slate-400">Select a service desk to view queues.</p>
      </div>
    )
  }

  if (error) return <p className="text-sm text-red-600">Failed to load queues: {error.message}</p>
  if (queues === null) return <LoadingState label="Loading queues..." />

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">Queue Sources</h2>
      <ul className="flex flex-col gap-2">
        {queues.map((queue) => (
          <li key={queue.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-700">{queue.name}</span>
            <span className="text-slate-400">{queue.issueCount ?? '—'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default QueueSources
