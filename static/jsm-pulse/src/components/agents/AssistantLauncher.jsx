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
        <div className="group fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Ask ${section.label} Assistant`}
            className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-accent text-white opacity-80 shadow-lg transition-opacity duration-200 hover:opacity-100"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-70" />
            <svg viewBox="0 0 24 24" fill="none" className="relative h-5 w-5">
              <path
                d="M12 3l1.7 4.9L18.6 9l-4.9 1.7L12 15.6l-1.7-4.9L5.4 9l4.9-1.7L12 3z"
                fill="currentColor"
              />
              <path
                d="M18.5 14l.9 2.6L22 17.5l-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z"
                fill="currentColor"
              />
            </svg>
          </button>
          <span className="pointer-events-none absolute right-full top-1/2 z-50 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
            Ask {section.label} Assistant
          </span>
        </div>
      )}
    </>
  )
}

export default AssistantLauncher
