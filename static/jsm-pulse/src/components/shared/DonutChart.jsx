const SEGMENT_COLORS = {
  Highest: '#DC2626',
  High: '#EA580C',
  Medium: '#F59E0B',
  Low: '#60A5FA',
  Lowest: '#CBD5E1',
}

const FALLBACK_COLORS = ['#0C66E4', '#22A06B', '#E2B203', '#E56910', '#C9372C', '#60A5FA', '#94A3B8']

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Compact SVG donut chart for embedding inside a metric card -- shows a
// distribution (e.g. priority breakdown) as a ring plus a small legend.
const DonutChart = ({ distribution }) => {
  const entries = Object.entries(distribution).filter(([, count]) => count > 0)
  const total = entries.reduce((sum, [, count]) => sum + count, 0)

  if (total === 0) {
    return <p className="text-xs text-slate-400">No data.</p>
  }

  let offset = 0
  const segments = entries.map(([label, count], index) => {
    const fraction = count / total
    const dash = fraction * CIRCUMFERENCE
    const segment = {
      label,
      count,
      color: SEGMENT_COLORS[label] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      dashArray: `${dash} ${CIRCUMFERENCE - dash}`,
      dashOffset: -offset,
    }
    offset += dash
    return segment
  })

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-20 w-20 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#F1F5F9" strokeWidth="14" />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={segment.color}
            strokeWidth="14"
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
          />
        ))}
      </svg>
      <ul className="flex flex-col gap-1 text-xs text-slate-500">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
            {segment.label} ({segment.count})
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DonutChart
