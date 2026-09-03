import { useEffect, useMemo, useState } from 'react'

const PAGE_SIZE = 25

const DataTable = ({ columns, rows, rowKey }) => {
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  // Reset to page 0 whenever the underlying row set changes (e.g. a fresh
  // fetch after switching sections) so a stale page index isn't kept.
  useEffect(() => {
    setPage(0)
  }, [rows])

  const pageRows = useMemo(() => rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE), [rows, page])

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No records found.</p>
  }

  const startIndex = page * PAGE_SIZE + 1
  const endIndex = Math.min(rows.length, startIndex + PAGE_SIZE - 1)

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="max-h-128 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-2 text-left font-medium text-slate-500">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.map((row) => (
              <tr key={row[rowKey]} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2 text-slate-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-sm text-slate-500">
        <span>
          {startIndex}–{endIndex} of {rows.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-400">
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataTable
