import AgentChat from './AgentChat.jsx'
import { SECTION_ASSISTANTS } from './sectionAssistants.js'

const SectionAssistantPanel = ({ sectionKey, onClose }) => {
  const section = SECTION_ASSISTANTS[sectionKey]
  if (!section) return null

  return (
    <div className="fixed bottom-0 right-0 top-14 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-semibold text-slate-800">Ask {section.label} Assistant</span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <AgentChat welcomeText={section.welcomeText} suggestedPrompts={section.suggestedPrompts} section={sectionKey} bare />
      </div>
    </div>
  )
}

export default SectionAssistantPanel
