import MetricCard from './MetricCard.jsx'
import DonutChart from './DonutChart.jsx'

// Generic per-section dashboard strip: a row of metric cards (real counts
// from a resolver's approximate-count-backed summary) plus an optional
// distribution chart card (e.g. priority breakdown), shown as one unit.
const SectionSummary = ({ metrics, distribution, distributionLabel }) => {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} sublabel={metric.sublabel} accent={metric.accent} />
      ))}
      {distribution && (
        <div className="col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-slate-500">{distributionLabel ?? 'Distribution'}</p>
          <DonutChart distribution={distribution} />
        </div>
      )}
    </div>
  )
}

export default SectionSummary
