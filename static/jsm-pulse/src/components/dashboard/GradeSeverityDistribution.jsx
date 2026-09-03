import DistributionBar from '../shared/DistributionBar.jsx'

const GradeSeverityDistribution = ({ distribution }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">Priority Distribution</h2>
      <DistributionBar distribution={distribution} />
    </div>
  )
}

export default GradeSeverityDistribution
