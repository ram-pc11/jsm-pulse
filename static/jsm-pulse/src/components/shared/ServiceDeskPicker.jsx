import { useEffect, useState } from 'react'
import { fetchAllServiceDesks } from '../../services/queueService.js'

const ServiceDeskPicker = ({ value, onChange }) => {
  const [desks, setDesks] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchAllServiceDesks()
      .then((result) => {
        if (cancelled) return
        setDesks(result.items)
        if (!value && result.items.length > 0) onChange(result.items[0].id)
      })
      .catch(() => !cancelled && setDesks([]))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (desks === null) {
    return <p className="text-sm text-slate-700">Loading service desks...</p>
  }

  if (desks.length === 0) {
    return <p className="text-sm text-slate-700">No service desks found.</p>
  }

  return (
    <select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
    >
      {desks.map((desk) => (
        <option key={desk.id} value={desk.id}>
          {desk.projectName ?? desk.id}
        </option>
      ))}
    </select>
  )
}

export default ServiceDeskPicker
