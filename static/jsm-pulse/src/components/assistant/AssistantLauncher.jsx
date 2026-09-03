import { useState } from 'react'
import ChatPanel from './ChatPanel.jsx'

const AssistantLauncher = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg"
        style={open ? { display: 'none' } : undefined}
      >
        💬
      </button>
    </>
  )
}

export default AssistantLauncher
