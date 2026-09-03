import { invoke, view } from '@forge/bridge'

// Deliberately bypasses invokeClient.js's cached wrappers -- polling the same
// jobId must hit the resolver fresh each time, not replay a cached "pending".
export const askAgent = (question, history = []) => invoke('askJsmPulseAgent', { question, history })

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

export async function pollAgentJob(jobId, { intervalMs = 1500, timeoutMs = 90000 } = {}) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const job = await invoke('getJsmPulseAgentJobResult', { jobId })
    if (job.status !== 'pending') return job
    await delay(intervalMs)
  }

  throw new Error('Timed out waiting for the agent to respond.')
}
