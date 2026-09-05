import PageHead from '../layout/PageHead.jsx'
import JsmPulseAgentChat from './JsmPulseAgentChat.jsx'

const JsmPulseAgentView = () => {
  return (
    <div className="">
      <PageHead title="JSM AI Agent" description="SLA risk, queue backlogs, and workload across your service desks." />

      <JsmPulseAgentChat />
    </div>
  )
}

export default JsmPulseAgentView
