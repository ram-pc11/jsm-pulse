import { useState } from 'react'

// Stubbed client-side chat -- no resolver/AI backend is in scope for this build.
const ChatPanel = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 'welcome', from: 'assistant', text: 'Hi! I\'m the JSM Pulse Agent. This is a preview -- responses are stubbed for now.' },
  ])
  const [draft, setDraft] = useState('')

  const handleSend = () => {
    if (!draft.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: `u-${prev.length}`, from: 'user', text: draft },
      { id: `a-${prev.length}`, from: 'assistant', text: 'This assistant is not yet connected to a backend.' },
    ])
    setDraft('')
  }

  return (
    <div className="fixed bottom-6 right-6 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-semibold text-slate-800">JSM Pulse Agent</span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              message.from === 'assistant' ? 'bg-slate-100 text-slate-700' : 'ml-auto bg-accent text-white'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t border-slate-200 p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
          placeholder="Ask something..."
          className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={handleSend}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatPanel
