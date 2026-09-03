import MetricCard from '../shared/MetricCard.jsx'

const SlaTicketMetrics = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <MetricCard label="Total Tickets" value={metrics.incidents + metrics.problems + metrics.changes} />
      <MetricCard label="SLA Breach Rate" value={`${Math.round(metrics.slaBreachRate * 100)}%`} accent />
      <MetricCard label="SLA Met Rate" value={`${Math.round((1 - metrics.slaBreachRate) * 100)}%`} />
    </div>
  )
}

export default SlaTicketMetrics
