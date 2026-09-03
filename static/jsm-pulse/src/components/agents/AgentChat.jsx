import { useEffect, useState } from 'react'
import { askAgent, pollAgentJob, getSiteUrl } from '../../services/agentService.js'
import DataTable from '../shared/DataTable.jsx'

const THINKING_TEXT = 'Thinking...'
const MAX_HISTORY_TURNS = 3 // last N user+assistant exchanges sent as context

const buildResultColumns = (siteUrl) => [
  {
    key: 'key',
    header: 'Key',
    render: (row) =>
      siteUrl ? (
        <a
          href={`${siteUrl}/browse/${row.key}`}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-accent hover:underline"
        >
          {row.key}
        </a>
      ) : (
        row.key
      ),
  },
  { key: 'summary', header: 'Summary' },
  { key: 'project', header: 'Project' },
  { key: 'assignee', header: 'Assignee' },
  { key: 'priority', header: 'Priority' },
  { key: 'type', header: 'Type' },
]

const AgentResultsTable = ({ results, siteUrl }) => (
  <div className="mt-3 w-full space-y-2">
    <DataTable columns={buildResultColumns(siteUrl)} rows={results.issues} rowKey="key" />
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>
        Showing {results.issues.length}
        {typeof results.totalCount === 'number' ? ` of ${results.totalCount.toLocaleString()}` : ''} results
      </span>
      {siteUrl && results.jql && (
        <a
          href={`${siteUrl}/issues/?jql=${encodeURIComponent(results.jql)}`}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-accent hover:underline"
        >
          View all in Jira →
        </a>
      )}
    </div>
  </div>
)

// Reusable chat core -- embedded full-width on the dedicated JSM Pulse Agent
// page (as a bordered card) and inside the per-section slide-over panel (bare,
// flexing to fill the panel's height) via the `bare` prop.
const AgentChat = ({ welcomeText, suggestedPrompts, section = null, bare = false }) => {
  const welcomeMessage = { id: 'welcome', from: 'assistant', text: welcomeText }
  const [messages, setMessages] = useState([welcomeMessage])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [siteUrl, setSiteUrl] = useState(null)

  useEffect(() => {
    getSiteUrl().then(setSiteUrl).catch(() => {})
  }, [])

  const sendText = async (text) => {
    const question = text.trim()
    if (!question || busy) return

    // Prior turns only -- excludes the welcome message and this new exchange,
    // so a follow-up like "list some of them" can resolve "them" from context.
    const history = messages
      .filter((message) => message.id !== 'welcome')
      .slice(-MAX_HISTORY_TURNS * 2)
      .map((message) => ({ role: message.from === 'user' ? 'user' : 'assistant', content: message.text }))

    const thinkingId = `a-${Date.now()}`
    setBusy(true)
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, from: 'user', text: question },
      { id: thinkingId, from: 'assistant', text: THINKING_TEXT },
    ])

    const updateMessage = (patch) =>
      setMessages((prev) => prev.map((message) => (message.id === thinkingId ? { ...message, ...patch } : message)))

    try {
      const { jobId } = await askAgent(question, history, section)
      const job = await pollAgentJob(jobId)

      if (job.status === 'done') {
        updateMessage({ text: job.answer, results: job.results })
      } else {
        updateMessage({ text: `Something went wrong answering that: ${job.error}` })
      }
    } catch (error) {
      updateMessage({ text: `Something went wrong answering that: ${error.message}` })
    } finally {
      setBusy(false)
    }
  }

  const handleSend = () => {
    sendText(draft)
    setDraft('')
  }

  const handleClear = () => {
    setMessages([welcomeMessage])
    setDraft('')
  }

  return (
    <div
      className={`flex flex-col ${
        bare ? 'h-full' : 'h-[32rem] rounded-lg border border-slate-200 bg-white shadow-sm'
      }`}
    >
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${message.results ? 'w-full' : 'max-w-[85%]'} ${
              message.from === 'assistant' ? 'bg-slate-50 text-slate-700' : 'ml-auto bg-accent text-white'
            }`}
          >
            {message.text}
            {message.results && <AgentResultsTable results={message.results} siteUrl={siteUrl} />}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendText(prompt)}
                disabled={busy}
                className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleClear}
          disabled={busy || messages.length === 1}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
          placeholder="Ask about tickets, queues, or SLA..."
          disabled={busy}
          className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:bg-slate-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={busy}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default AgentChat
