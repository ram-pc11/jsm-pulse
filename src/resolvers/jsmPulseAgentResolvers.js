import { Queue } from '@forge/events';
import { kvs } from '@forge/kvs';
import { searchIssues, countIssues } from './clients/jiraSearchClient.js';
import { getServiceDesks, getQueues, getRequestApprovals, getRequestSla } from './clients/jsmClient.js';
import { getSlaOverview } from './slaResolvers.js';
import { getProjectsSummary } from './projectResolvers.js';

const queue = new Queue({ key: 'jsm-pulse-agent-queue' });

const jobKey = (jobId) => `agent-job:${jobId}`;

export const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_issues',
      description:
        'Search Jira/JSM issues with a JQL query. Use this for any question about specific tickets, ' +
        'including "list"/"show" requests. Returns up to 50 issues plus the total matching count. The ' +
        'issues are already shown to the user in a table by the UI -- do not re-list them in your text reply.',
      parameters: {
        type: 'object',
        properties: {
          jql: { type: 'string', description: 'A valid JQL query.' },
        },
        required: ['jql'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'count_issues',
      description: 'Get an approximate count of issues matching a JQL query. Use for "how many" questions.',
      parameters: {
        type: 'object',
        properties: {
          jql: { type: 'string', description: 'A valid JQL query.' },
        },
        required: ['jql'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_service_desks',
      description: 'List all JSM service desks (projects) available.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_projects_summary',
      description:
        'Get ticket counts per JSM project in ONE call, plus total projects, total tickets, and the ' +
        'busiest project. Always use this for "which project has the most/fewest tickets" or "how many ' +
        'tickets per project" questions -- do NOT call count_issues once per project, that is much slower.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_queues',
      description: 'List the queues for a given service desk, including open issue counts.',
      parameters: {
        type: 'object',
        properties: {
          serviceDeskId: { type: 'string', description: 'The service desk ID, from list_service_desks.' },
        },
        required: ['serviceDeskId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_queue_sla_overview',
      description: 'Get sampled SLA breach rates per queue for a service desk. Use for SLA/breach-risk questions.',
      parameters: {
        type: 'object',
        properties: {
          serviceDeskId: { type: 'string', description: 'The service desk ID, from list_service_desks.' },
        },
        required: ['serviceDeskId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_request_approvals',
      description: 'Get approval status for a single request/issue by key.',
      parameters: {
        type: 'object',
        properties: {
          issueKey: { type: 'string', description: 'The issue key, e.g. SD-123.' },
        },
        required: ['issueKey'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_request_sla',
      description: 'Get SLA goal/cycle status for a single request/issue by key.',
      parameters: {
        type: 'object',
        properties: {
          issueKey: { type: 'string', description: 'The issue key, e.g. SD-123.' },
        },
        required: ['issueKey'],
      },
    },
  },
];

const SEARCH_RESULT_PAGE_SIZE = 50;
const SEARCH_RESULT_FIELDS = ['summary', 'project', 'assignee', 'priority', 'issuetype'];

function mapIssueForDisplay(issue) {
  return {
    key: issue.key,
    summary: issue.fields.summary,
    project: issue.fields.project?.name ?? '—',
    assignee: issue.fields.assignee?.displayName ?? 'Unassigned',
    priority: issue.fields.priority?.name ?? '—',
    type: issue.fields.issuetype?.name ?? '—',
  };
}

export async function executeAgentTool(name, args) {
  switch (name) {
    case 'search_issues': {
      const [searchResult, totalCount] = await Promise.all([
        searchIssues({ jql: args.jql, cursor: null, pageSize: SEARCH_RESULT_PAGE_SIZE, fields: SEARCH_RESULT_FIELDS }),
        countIssues(args.jql).catch(() => null),
      ]);
      return { issues: searchResult.issues.map(mapIssueForDisplay), totalCount, jql: args.jql };
    }
    case 'count_issues':
      return { count: await countIssues(args.jql) };
    case 'list_service_desks':
      return getServiceDesks({ cursor: null, pageSize: 50 });
    case 'get_projects_summary':
      return getProjectsSummary();
    case 'list_queues':
      return getQueues({ serviceDeskId: args.serviceDeskId, cursor: null, pageSize: 50 });
    case 'get_queue_sla_overview':
      return getSlaOverview({ payload: { serviceDeskId: args.serviceDeskId, cursor: null, pageSize: 25 } });
    case 'get_request_approvals':
      return getRequestApprovals(args.issueKey);
    case 'get_request_sla':
      return getRequestSla(args.issueKey);
    default:
      return { error: true, message: `Unknown tool: ${name}` };
  }
}

// Mirrors static/jsm-pulse/src/components/agents/sectionAssistants.js's keys.
// The client only ever sends a key (e.g. "projects") -- never trust a raw
// client string into the system prompt, only this server-side looked-up text.
const SECTION_HINTS = {
  dashboard: 'the Dashboard -- overall JSM health across incidents, problems, changes, SLA, and projects',
  projects: 'Projects -- JSM projects and service desks; use get_projects_summary for per-project ticket counts',
  incidents: 'Incidents -- issues with issuetype = Incident',
  problems: 'Problems -- issues with issuetype = Problem',
  changes: 'Changes -- issues with issuetype = Change',
  sla: 'SLA -- SLA breach risk and queue-level SLA data',
};

const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 4000;

// Re-validates history sent from the client rather than trusting it, since it
// flows straight into the OpenAI messages array on the consumer side.
function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((entry) => (entry?.role === 'user' || entry?.role === 'assistant') && typeof entry.content === 'string')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((entry) => ({ role: entry.role, content: entry.content.slice(0, MAX_MESSAGE_LENGTH) }));
}

export async function askJsmPulseAgent({ payload }) {
  const question = payload?.question?.trim();
  if (!question) {
    throw new Error('question is required');
  }

  const history = sanitizeHistory(payload?.history);
  const sectionHint = SECTION_HINTS[payload?.section] ?? null;

  const { jobId } = await queue.push({ body: { question, history, sectionHint } });
  return { jobId };
}

export async function getJsmPulseAgentJobResult({ payload }) {
  const job = await kvs.get(jobKey(payload.jobId));
  return job ?? { status: 'pending' };
}
