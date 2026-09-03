import { useState } from 'react'
import PageHead from '../layout/PageHead.jsx'
import JsmPulseAgentChat from './JsmPulseAgentChat.jsx'
import JsmPulseAgentReports from './JsmPulseAgentReports.jsx'

const TABS = [
  { key: 'chat', label: 'Chat' },
  { key: 'reports', label: 'Reports' },
]

const JsmPulseAgentView = () => {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <div className="">
      <PageHead title="JSM Pulse Agent" description="SLA risk, queue backlogs, and workload across your service desks." />

      <div className="mb-4 flex gap-6 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium cursor-pointer transition-colors ${
              activeTab === tab.key
                ? 'border-accent text-accent'
                : 'border-transparent text-black hover:text-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'chat' ? <JsmPulseAgentChat /> : <JsmPulseAgentReports />}
    </div>
  )
}

export default JsmPulseAgentView
