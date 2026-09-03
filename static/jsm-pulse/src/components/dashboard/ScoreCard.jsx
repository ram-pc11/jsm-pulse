const GRADE_COLORS = {
  A: 'text-grade-a',
  B: 'text-grade-b',
  C: 'text-grade-c',
  D: 'text-grade-d',
  F: 'text-grade-f',
}

const ScoreCard = ({ score, grade, severity }) => {
  return (
    <div className="flex items-center gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`text-5xl font-bold ${GRADE_COLORS[grade] ?? 'text-slate-900'}`}>{grade}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">JSM Health Score</p>
        <p className="text-3xl font-semibold text-slate-900">{score}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{severity} severity</p>
      </div>
    </div>
  )
}

export default ScoreCard
