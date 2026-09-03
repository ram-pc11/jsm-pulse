import { kvs } from '@forge/kvs';
import { runAgentTurn } from './clients/openaiClient.js';
import { AGENT_TOOLS, executeAgentTool } from './jsmPulseAgentResolvers.js';

const jobKey = (jobId) => `agent-job:${jobId}`;

const SYSTEM_PROMPT = `You are the JSM Pulse Agent, answering questions about Jira Service Management
data (tickets, queues, SLAs, approvals) using the provided tools. Prefer JQL search/count for
ticket-level questions -- the correct JQL field for issue type is "issuetype" (not "type"), and
priority values are typically Highest, High, Medium, Low, Lowest (compare as bare words, e.g.
priority = Highest, no quotes needed). Always call at least one tool before answering unless the
question needs no data lookup. Give a concise, direct answer in plain language -- do not describe
your tool calls.

This app has ONE fixed definition of "open" used everywhere in its dashboard and reports: NOT in a
Resolved/Closed/Done status. When a question asks about open tickets (of any issue type), you MUST
use exactly this JQL clause: status not in (Resolved, Closed, Done). Do NOT use "status = Open" or
any other status name -- that is a different, narrower thing and will disagree with the numbers
already shown elsewhere in this app. Likewise "resolved"/"closed" tickets means: status in
(Resolved, Closed, Done).

If a tool result is an object containing an "error" field, that call FAILED -- it does not mean zero
or empty results. Never report a count or list as though it succeeded when the underlying tool
errored. When you see an error, either retry the same tool once with corrected arguments (e.g. fixed
JQL), or if you can't recover, tell the user the lookup failed and briefly why.

Conversation history may be provided for context (e.g. resolving "them" or "that" in a follow-up
question) -- use it only to understand what the user means, not as a source of factual data; always
verify facts via tools.`;

// Runs off the async event queue (up to 900s), not the ~25s synchronous
// resolver window -- see manifest.yml's consumer module for jsm-pulse-agent-queue.
export async function handler(event) {
  const { question, history = [], sectionHint = null } = event.body;

  const systemPrompt = sectionHint
    ? `${SYSTEM_PROMPT}\n\nThe user is currently viewing the following section: ${sectionHint}. Prefer tools/JQL relevant to it unless the question clearly asks about something else.`
    : SYSTEM_PROMPT;

  try {
    const { answer, results } = await runAgentTurn({
      question,
      history,
      systemPrompt,
      tools: AGENT_TOOLS,
      executeTool: executeAgentTool,
    });

    await kvs.set(jobKey(event.jobId), { status: 'done', answer, results, completedAt: Date.now() });
  } catch (error) {
    await kvs.set(jobKey(event.jobId), { status: 'error', error: error.message, completedAt: Date.now() });
  }
}
