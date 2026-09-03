// No resolver backs per-agent workload aggregation yet (README §4 does not
// spec an assignee-aggregation endpoint). Stubbed rather than fabricating data
// -- wire this up once an agent-workload resolver exists.
const AgentWorkload = () => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold text-slate-800">Agent Workload</h2>
      <p className="text-sm text-slate-400">Not available yet — no backing resolver for per-agent ticket counts.</p>
    </div>
  )
}

export default AgentWorkload
