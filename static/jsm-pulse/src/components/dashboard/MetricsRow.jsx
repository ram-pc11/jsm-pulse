import MetricCard from '../shared/MetricCard.jsx'

const MetricsRow = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <MetricCard label="Open Incidents" value={metrics.incidents} />
      <MetricCard label="Open Problems" value={metrics.problems} />
      <MetricCard label="Open Changes" value={metrics.changes} />
      <MetricCard
        label="SLA Breach Rate"
        value={`${Math.round(metrics.slaBreachRate * 100)}%`}
        sublabel="Sampled tickets"
        accent
      />
    </div>
  )
}

export default MetricsRow
