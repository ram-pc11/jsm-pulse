const RecommendationsPanel = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-slate-800">Recommendations</h2>
        <p className="text-sm text-slate-700">No recommendations right now.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-black">Recommendations</h2>
      <ul className="flex flex-col gap-3">
        {recommendations.map((recommendation) => (
          <li key={recommendation.id} className="rounded-md bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-800">{recommendation.title}</p>
            <p className="mt-0.5 text-xs text-slate-700">{recommendation.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RecommendationsPanel
