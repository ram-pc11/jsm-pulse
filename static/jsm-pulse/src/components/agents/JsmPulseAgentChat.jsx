import AgentChat from './AgentChat.jsx'

const WELCOME_TEXT =
  "Hi! I'm the JSM Pulse Agent. Ask me anything about your tickets, queues, or SLA breach risk — I can search issues with JQL, list queues and service desks, check SLA and approval status, and answer directly."

const SUGGESTED_PROMPTS = [
  'How many open incidents are there right now?',
  'Which queue has the worst SLA breach rate?',
  'List all service desks',
  'What is the SLA status for SD-123?',
]

const JsmPulseAgentChat = () => (
  <AgentChat welcomeText={WELCOME_TEXT} suggestedPrompts={SUGGESTED_PROMPTS} section={null} />
)

export default JsmPulseAgentChat
