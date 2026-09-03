import { invoke, view } from '@forge/bridge'

// Deliberately bypasses invokeClient.js's cached wrappers -- polling the same
// jobId must hit the resolver fresh each time, not replay a cached "pending".
export const askAgent = (question, history = [], section = null) =>
  invoke('askJsmPulseAgent', { question, history, section })

// Custom UI is served from a Forge CDN origin, not the Jira site -- the real
// site URL (for "View all in Jira" links) only comes from view.getContext().
let siteUrlPromise = null
export const getSiteUrl = () => {
  if (!siteUrlPromise) {
    siteUrlPromise = view.getContext().then((context) => context.siteUrl)
  }
  return siteUrlPromise
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// timeoutMs stays under the consumer's 180s manifest timeout (see
// manifest.yml's agent-consumer function) with headroom for polling overhead.
export async function pollAgentJob(jobId, { intervalMs = 1500, timeoutMs = 170000 } = {}) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const job = await invoke('getJsmPulseAgentJobResult', { jobId })
    if (job.status !== 'pending') return job
    await delay(intervalMs)
  }

  throw new Error('Timed out waiting for the agent to respond.')
}
