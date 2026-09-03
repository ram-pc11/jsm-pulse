// Keys mirror App.jsx's VIEWS keys. No entry for 'jsmPulseAgent' (already has
// its own full chat page) or 'settings' (no data to ask about) -- the
// launcher renders nothing on those views.
export const SECTION_ASSISTANTS = {
  dashboard: {
    label: 'Dashboard',
    welcomeText: "Hi! I'm the Dashboard Assistant. Ask me about overall JSM health across incidents, problems, changes, SLA, and projects.",
    suggestedPrompts: [
      'How many incidents, problems, and changes are currently open?',
      "What's the overall SLA breach rate?",
      'Which project has the most tickets?',
    ],
  },
  projects: {
    label: 'Projects',
    welcomeText: "Hi! I'm the Projects Assistant. Ask me about your JSM projects and service desks.",
    suggestedPrompts: [
      'Which project has the most open tickets?',
      'List all service desks',
      'How many tickets does the IT Service Management project have?',
    ],
  },
  incidents: {
    label: 'Incidents',
    welcomeText: "Hi! I'm the Incidents Assistant. Ask me about incident tickets.",
    suggestedPrompts: [
      'How many open incidents are there?',
      'List the highest priority incidents',
      'Which incidents are unassigned?',
    ],
  },
  problems: {
    label: 'Problems',
    welcomeText: "Hi! I'm the Problems Assistant. Ask me about problem tickets.",
    suggestedPrompts: [
      'How many open problems are there?',
      'List problems created in the last 30 days',
      'Which problems are unassigned?',
    ],
  },
  changes: {
    label: 'Changes',
    welcomeText: "Hi! I'm the Changes Assistant. Ask me about change tickets.",
    suggestedPrompts: [
      'How many changes are pending?',
      'List changes created in the last 7 days',
      'Which changes are unassigned?',
    ],
  },
  sla: {
    label: 'SLA',
    welcomeText: "Hi! I'm the SLA Assistant. Ask me about SLA breach risk across your queues.",
    suggestedPrompts: [
      'Which queue has the worst SLA breach rate?',
      'List all service desks',
      'Which queue has the most tracked SLA tickets?',
    ],
  },
}
