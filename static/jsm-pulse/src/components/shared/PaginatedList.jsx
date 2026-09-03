import { useEffect, useState } from 'react'
import LoadingState from './LoadingState.jsx'

// Thin wrapper: takes a fetchAll service function, shows a loading spinner
// while paging through the resolver, then renders children with the items.
const PaginatedList = ({ fetchAll, children, loadingLabel = 'Loading data...' }) => {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    setItems(null)
    setError(null)
    setLoadedCount(0)

    fetchAll((count) => {
      if (!cancelled) setLoadedCount(count)
    })
      .then((result) => {
        if (!cancelled) setItems(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })

    return () => {
      cancelled = true
    }
  }, [fetchAll])

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">Failed to load data: {error.message}</p>
  }

  if (items === null) {
    return <LoadingState label={`${loadingLabel}${loadedCount > 0 ? ` (${loadedCount} loaded)` : ''}`} />
  }

  return children(items)
}

export default PaginatedList
