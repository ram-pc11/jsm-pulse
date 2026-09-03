import MetricCard from './MetricCard.jsx'
import DonutChart from './DonutChart.jsx'

const CARD_COLOR_CYCLE = ['blue', 'purple', 'amber', 'green']

// Generic per-section dashboard strip: a row of metric cards (real counts
// from a resolver's approximate-count-backed summary) plus an optional
// distribution chart card (e.g. priority breakdown), shown as one unit.
const MAX_COLUMNS = 4

const SectionSummary = ({ metrics, distribution, distributionLabel, stackDistribution = false }) => {
  const columnCount = stackDistribution
    ? Math.min(metrics.length, MAX_COLUMNS)
    : Math.min(metrics.length + (distribution ? 1 : 0), MAX_COLUMNS)

  const distributionCard = distribution && (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-base font-medium text-black">{distributionLabel ?? 'Distribution'}</p>
      <DonutChart distribution={distribution} />
    </div>
  )

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            sublabel={metric.sublabel}
            accent={metric.accent}
            color={metric.color ?? CARD_COLOR_CYCLE[index % CARD_COLOR_CYCLE.length]}
          />
        ))}
        {!stackDistribution && distributionCard}
      </div>
      {stackDistribution && distributionCard && (
        <div className="grid grid-cols-2 gap-4">{distributionCard}</div>
      )}
    </div>
  )
}

export default SectionSummary
