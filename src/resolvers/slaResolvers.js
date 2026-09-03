import { getQueues as getQueuesClient, getQueueIssues, getRequestSla } from './clients/jsmClient.js';

const SLA_SAMPLE_SIZE = 25;
const SLA_LOOKUP_CONCURRENCY = 5;
const QUEUE_CONCURRENCY = 3;

// Aggregates SLA breach % for a single queue. There is no queue-level SLA
// aggregate endpoint and no reliable JQL breach predicate confirmed against
// this instance, so this samples up to SLA_SAMPLE_SIZE tickets from the
// queue and checks each ticket's SLA fields individually -- it does not scan
// an entire 1000+ ticket backlog.
async function sampleQueueSla(serviceDeskId, queueId) {
  const queueIssuesResult = await getQueueIssues({
    serviceDeskId,
    queueId,
    cursor: null,
    pageSize: SLA_SAMPLE_SIZE,
  });

  const sampledIssues = queueIssuesResult.values ?? [];

  let breached = 0;
  let tracked = 0;
  let untracked = 0;

  for (let i = 0; i < sampledIssues.length; i += SLA_LOOKUP_CONCURRENCY) {
    const batch = sampledIssues.slice(i, i + SLA_LOOKUP_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (issue) => {
        try {
          const sla = await getRequestSla(issue.issueKey ?? issue.key);
          return sla?.values ?? [];
        } catch {
          return null;
        }
      })
    );

    for (const slaValues of batchResults) {
      if (slaValues === null || slaValues.length === 0) {
        untracked += 1;
        continue;
      }
      tracked += 1;
      const anyBreached = slaValues.some(
        (goal) => goal.ongoingCycle?.breached === true || goal.completedCycles?.some((c) => c.breached)
      );
      if (anyBreached) breached += 1;
    }
  }

  const sampleSize = sampledIssues.length;

  return {
    sampleSize,
    tracked,
    untracked,
    breached,
    breachRate: tracked > 0 ? breached / tracked : 0,
    isSampled: sampleSize >= SLA_SAMPLE_SIZE,
  };
}

export async function getSlaSummary({ payload }) {
  const { serviceDeskId, queueId } = payload;
  return sampleQueueSla(serviceDeskId, queueId);
}

// Fetches every queue in a service desk and samples SLA breach rate for each,
// so the SLA view can show a full breakdown without the caller needing to
// pick a queue first. Queue-level sampling is concurrency-capped since this
// fans out queues x per-queue ticket SLA lookups.
export async function getSlaOverview({ payload }) {
  const { serviceDeskId, cursor = null, pageSize = 25 } = payload;

  const queuesResult = await getQueuesClient({ serviceDeskId, cursor, pageSize });
  const queues = queuesResult.values ?? [];

  const items = [];
  for (let i = 0; i < queues.length; i += QUEUE_CONCURRENCY) {
    const batch = queues.slice(i, i + QUEUE_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (queue) => {
        try {
          const sla = await sampleQueueSla(serviceDeskId, queue.id);
          return { queueId: queue.id, queueName: queue.name, sla };
        } catch {
          return { queueId: queue.id, queueName: queue.name, sla: null };
        }
      })
    );
    items.push(...batchResults);
  }

  return {
    items,
    nextCursor: queuesResult.nextCursor,
    isLast: queuesResult.isLast,
  };
}
