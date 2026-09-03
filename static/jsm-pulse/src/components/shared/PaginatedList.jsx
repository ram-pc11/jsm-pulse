import { useEffect, useState } from 'react'
import LoadingState from './LoadingState.jsx'

// Fetches the full result set via `fetchAll(onProgress)` before rendering --
// used where children need every row up front (e.g. computing aggregate
// metrics), unlike ServerPaginatedTable which pages incrementally.
// `deps` identifies what the fetch is scoped to (e.g. a selected service
// desk) -- when any dep changes, the fetch re-runs.
const PaginatedList = ({ fetchAll, loadingLabel = 'Loading...', deps = [], children }) => {
  const [items, setItems] = useState(null)
  const [count, setCount] = useState(0)
  const [error, setError] = useState(null)
  const depsKey = JSON.stringify(deps)

  useEffect(() => {
    let cancelled = false
    setItems(null)
    setCount(0)
    setError(null)

    fetchAll((loaded) => !cancelled && setCount(loaded))
      .then((result) => !cancelled && setItems(result.items))
      .catch((err) => !cancelled && setError(err))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey])

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">Failed to load data: {error.message}</p>
  }

  if (items === null) {
    return <LoadingState label={count > 0 ? `${loadingLabel} (${count} loaded)` : loadingLabel} />
  }

  return children(items)
}

export default PaginatedList
