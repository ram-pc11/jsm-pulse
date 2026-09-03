const SlaRatios = ({ metrics }) => {
  const breachRate = metrics.slaBreachRate
  const metRate = 1 - breachRate

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-black">SLA Ratios</h2>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="bg-green-500" style={{ width: `${metRate * 100}%` }} />
        <div className="bg-red-500" style={{ width: `${breachRate * 100}%` }} />
      </div>
      <div className="mt-3 flex gap-4 text-xs text-black">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Met ({Math.round(metRate * 100)}%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Breached ({Math.round(breachRate * 100)}%)
        </span>
      </div>
    </div>
  )
}

export default SlaRatios
