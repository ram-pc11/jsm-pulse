import MetricCard from './MetricCard.jsx'
import DistributionBar from './DistributionBar.jsx'

// Generic per-section dashboard strip: a row of metric cards plus an optional
// priority/status distribution bar, computed client-side from the items
// PaginatedList already fetched -- no extra resolver calls.
const SectionSummary = ({ metrics, distribution, distributionLabel }) => {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} sublabel={metric.sublabel} accent={metric.accent} />
        ))}
      </div>
      {distribution && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">{distributionLabel ?? 'Distribution'}</h2>
          <DistributionBar distribution={distribution} />
        </div>
      )}
    </div>
  )
}

export default SectionSummary
