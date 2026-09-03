import { useState } from 'react'
import SectionAssistantPanel from './SectionAssistantPanel.jsx'
import { SECTION_ASSISTANTS } from './sectionAssistants.js'

const AssistantLauncher = ({ activeView }) => {
  const [open, setOpen] = useState(false)
  const section = SECTION_ASSISTANTS[activeView]

  if (!section) return null

  return (
    <>
      {open && <SectionAssistantPanel key={activeView} sectionKey={activeView} onClose={() => setOpen(false)} />}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:opacity-90"
        >
          Ask {section.label} Assistant
        </button>
      )}
    </>
  )
}

export default AssistantLauncher
