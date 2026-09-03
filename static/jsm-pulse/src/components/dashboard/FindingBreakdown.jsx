import SeverityPill from '../shared/SeverityPill.jsx'

const FindingBreakdown = ({ insights }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">Finding Breakdown</h2>
      <div className="flex flex-col gap-2">
        {insights.map((insight) => (
          <div key={insight.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
            <span className="text-slate-600">{insight.message}</span>
            <SeverityPill value={insight.severity} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FindingBreakdown
