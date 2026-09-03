const SEGMENT_COLORS = {
  Highest: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-amber-400',
  Low: 'bg-blue-400',
  Lowest: 'bg-slate-300',
}

const DistributionBar = ({ distribution }) => {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0) || 1

  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
        {Object.entries(distribution).map(([label, count]) => (
          count > 0 && (
            <div
              key={label}
              className={SEGMENT_COLORS[label] ?? 'bg-slate-300'}
              style={{ width: `${(count / total) * 100}%` }}
              title={`${label}: ${count}`}
            />
          )
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black">
        {Object.entries(distribution).map(([label, count]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${SEGMENT_COLORS[label] ?? 'bg-slate-300'}`} />
            {label} ({count})
          </span>
        ))}
      </div>
    </div>
  )
}

export default DistributionBar
