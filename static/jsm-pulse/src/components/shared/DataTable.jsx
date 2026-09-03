// Presentational table for an already-fetched, in-memory row set -- pairs
// with PaginatedList, which fetches everything up front. For server-paged
// data, use ServerPaginatedTable instead.
const DataTable = ({ columns, rows, rowKey }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="max-h-128 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-2 text-left font-medium text-slate-black">
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
    </div>
  )
}

export default DataTable
