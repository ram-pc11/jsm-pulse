const Callouts = ({ insights }) => {
  const critical = insights.filter((insight) => insight.severity === 'high' || insight.severity === 'critical')

  if (critical.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {critical.map((insight) => (
        <div key={insight.id} className="rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          {insight.message}
        </div>
      ))}
    </div>
  )
}

export default Callouts
