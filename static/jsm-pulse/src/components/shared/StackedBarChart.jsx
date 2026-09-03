const SEGMENT_COLORS = [
  'bg-accent',
  'bg-green-500',
  'bg-amber-400',
  'bg-orange-500',
  'bg-red-500',
  'bg-blue-400',
  'bg-slate-400',
  'bg-purple-400',
]

// Two-dimensional breakdown: one horizontal bar per row (e.g. request type),
// each segmented by a second dimension (e.g. status). `data` is
// [{ label, segments: { statusLabel: count } }], `segmentLabels` is the
// stable ordered list of all statuses so colors/legend stay consistent
// across rows.
const StackedBarChart = ({ data, segmentLabels }) => {
  const colorFor = (label) => SEGMENT_COLORS[segmentLabels.indexOf(label) % SEGMENT_COLORS.length]

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">No data to display.</p>
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {data.map((row) => {
          const total = Object.values(row.segments).reduce((sum, count) => sum + count, 0) || 1

          return (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">{row.label}</span>
                <span>{total} total</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                {Object.entries(row.segments).map(
                  ([label, count]) =>
                    count > 0 && (
                      <div
                        key={label}
                        className={colorFor(label)}
                        style={{ width: `${(count / total) * 100}%` }}
                        title={`${label}: ${count}`}
                      />
                    )
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {segmentLabels.map((label) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${colorFor(label)}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default StackedBarChart
