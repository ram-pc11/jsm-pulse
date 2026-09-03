import MetricCard from '../shared/MetricCard.jsx'

const MetricsRow = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <MetricCard
        label="Open Incidents"
        value={metrics.openIncidents}
        sublabel={`${metrics.incidents} total`}
        color="red"
      />
      <MetricCard label="Total Problems" value={metrics.problems} color="orange" />
      <MetricCard label="Total Changes" value={metrics.changes} color="blue" />
      <MetricCard
        label="SLA Breach Rate"
        value={`${Math.round(metrics.slaBreachRate * 100)}%`}
        sublabel="Time to resolution"
        accent
        color="amber"
      />
    </div>
  )
}

export default MetricsRow
