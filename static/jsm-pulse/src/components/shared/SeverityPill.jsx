const SEVERITY_STYLES = {
  low: 'bg-green-100 text-green-700',
  moderate: 'bg-blue-100 text-blue-700',
  elevated: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const PRIORITY_STYLES = {
  Highest: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-blue-100 text-blue-700',
  Lowest: 'bg-slate-100 text-slate-600',
}

const SeverityPill = ({ value, kind = 'severity' }) => {
  const styles = kind === 'priority' ? PRIORITY_STYLES : SEVERITY_STYLES
  const className = styles[value] ?? 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {value}
    </span>
  )
}

export default SeverityPill
