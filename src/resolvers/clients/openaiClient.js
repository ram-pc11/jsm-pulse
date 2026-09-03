// Raw fetch to OpenAI's Chat Completions API -- Node 24's global fetch is
// available in the Forge runtime, so no SDK dependency is needed.
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o';
const MAX_TOOL_ITERATIONS = 6;

async function callOpenAi(messages, tools) {
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools,
      tool_choice: 'auto',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${body}`);
  }

  return response.json();
}

// Runs the tool-calling loop: ask the model, execute any tool calls it
// requests via executeTool, feed the results back, repeat until it answers
// with plain content (or MAX_TOOL_ITERATIONS is hit, to bound cost/time).
// Returns { answer, results } -- results is the most recent search_issues
// tool result (issues/totalCount/jql), for the UI to render as a table
// alongside the model's prose, independent of what the model says.
export async function runAgentTurn({ question, history = [], systemPrompt, tools, executeTool }) {
  const messages = [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: question }];
  let results;

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
    const completion = await callOpenAi(messages, tools);
    const message = completion.choices[0].message;

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return { answer: message.content ?? '', results };
    }

    messages.push(message);

    // Tool calls within one model turn are independent (read-only) requests --
    // run them concurrently instead of one-at-a-time, since a question like
    // "which project has the most tickets" can fan out into many calls.
    const toolResults = await Promise.all(
      message.tool_calls.map(async (toolCall) => {
        try {
          const args = JSON.parse(toolCall.function.arguments || '{}');
          return { toolCall, result: await executeTool(toolCall.function.name, args) };
        } catch (error) {
          return { toolCall, result: { error: true, message: error.message } };
        }
      })
    );

    for (const { toolCall, result } of toolResults) {
      if (toolCall.function.name === 'search_issues' && !result?.error) {
        results = result;
      }
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error(`Agent did not produce a final answer within ${MAX_TOOL_ITERATIONS} tool-call iterations`);
}
