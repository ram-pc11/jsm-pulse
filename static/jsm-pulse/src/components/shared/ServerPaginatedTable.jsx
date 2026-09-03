import { useEffect, useRef, useState } from 'react'
import LoadingState from './LoadingState.jsx'

const PAGE_SIZE = 25

// Fetches exactly one page per request -- Next/Previous each trigger a fresh
// resolver call rather than paging through a client-side cache of everything.
// `fetchPage(cursor)` must return { items, nextCursor, isLast }.
// `deps` identifies what the table is scoped to (e.g. a selected service
// desk) -- when any dep changes, the table resets to page 1.
const ServerPaginatedTable = ({ fetchPage, columns, rowKey, deps = [] }) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [rows, setRows] = useState(null)
  const [nextCursor, setNextCursor] = useState(null)
  const [isLast, setIsLast] = useState(true)
  const [error, setError] = useState(null)
  // cursorStack[i] is the cursor used to fetch page i -- lets Previous go
  // back without re-deriving cursors from scratch.
  const cursorStack = useRef([null])
  const depsKey = JSON.stringify(deps)

  useEffect(() => {
    cursorStack.current = [null]
    setPageIndex(0)
    let cancelled = false
    setRows(null)
    setError(null)

    fetchPage(null)
      .then((result) => {
        if (cancelled) return
        setRows(result.items)
        setNextCursor(result.nextCursor)
        setIsLast(result.isLast)
      })
      .catch((err) => !cancelled && setError(err))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey])

  const goToPage = (index, cursor) => {
    let cancelled = false
    setRows(null)
    setError(null)

    fetchPage(cursor ?? null)
      .then((result) => {
        if (cancelled) return
        setPageIndex(index)
        setRows(result.items)
        setNextCursor(result.nextCursor)
        setIsLast(result.isLast)
      })
      .catch((err) => !cancelled && setError(err))

    return () => {
      cancelled = true
    }
  }

  const goNext = () => {
    if (isLast) return
    cursorStack.current[pageIndex + 1] = nextCursor
    goToPage(pageIndex + 1, nextCursor)
  }

  const goPrevious = () => {
    if (pageIndex === 0) return
    const previousCursor = cursorStack.current[pageIndex - 1]
    goToPage(pageIndex - 1, previousCursor)
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">Failed to load data: {error.message}</p>
  }

  if (rows === null) {
    return <LoadingState label="Loading page..." />
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="max-h-128 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-2 text-left font-medium text-black">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-black">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row[rowKey]} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-2 text-black">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-sm text-slate-500">
        <span>Page {pageIndex + 1}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrevious}
            disabled={pageIndex === 0}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={isLast}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServerPaginatedTable
export { PAGE_SIZE }
