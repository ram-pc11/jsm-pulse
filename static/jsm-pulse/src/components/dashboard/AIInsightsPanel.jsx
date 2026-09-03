import SeverityPill from '../shared/SeverityPill.jsx'

const AIInsightsPanel = ({ insights }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">AI Insights</h2>
      <ul className="flex flex-col gap-3">
        {insights.map((insight) => (
          <li key={insight.id} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-slate-600">{insight.message}</span>
            <SeverityPill value={insight.severity} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AIInsightsPanel
