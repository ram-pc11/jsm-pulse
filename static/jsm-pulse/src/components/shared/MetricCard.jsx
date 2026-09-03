const COLOR_STYLES = {
  slate: 'border-slate-300 bg-slate-50',
  blue: 'border-blue-300 bg-blue-50',
  green: 'border-emerald-300 bg-emerald-50',
  amber: 'border-amber-300 bg-amber-50',
  orange: 'border-orange-300 bg-orange-50',
  red: 'border-red-300 bg-red-50',
  purple: 'border-purple-300 bg-purple-50',
}

const MetricCard = ({ label, value, sublabel, accent = false, color = 'slate' }) => {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${COLOR_STYLES[color] ?? COLOR_STYLES.slate}`}>
      <p className="text-base font-medium text-black">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${accent ? 'text-accent' : 'text-slate-900'}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-700">{sublabel}</p>}
    </div>
  )
}

export default MetricCard
