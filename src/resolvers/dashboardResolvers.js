import { searchIssues } from './clients/jiraSearchClient.js';
import { getServiceDesks, getQueues, getQueueIssues, getRequestSla } from './clients/jsmClient.js';
import { computeCompositeScore, buildSeverityDistribution } from './utils/scoring.js';

const SUMMARY_SAMPLE_SIZE = 50;
const SLA_LOOKUP_CONCURRENCY = 5;

async function countIssuesFor(jql) {
  const result = await searchIssues({ jql, cursor: null, pageSize: 1 });
  return result.total ?? result.issues?.length ?? 0;
}

async function sampleSlaBreach() {
  const serviceDesksResult = await getServiceDesks({ cursor: null, pageSize: 1 });
  const serviceDesk = serviceDesksResult.values?.[0];
  if (!serviceDesk) return { breached: 0, tracked: 0 };

  const queuesResult = await getQueues({ serviceDeskId: serviceDesk.id, cursor: null, pageSize: 1 });
  const queue = queuesResult.values?.[0];
  if (!queue) return { breached: 0, tracked: 0 };

  const queueIssuesResult = await getQueueIssues({
    serviceDeskId: serviceDesk.id,
    queueId: queue.id,
    cursor: null,
    pageSize: SUMMARY_SAMPLE_SIZE,
  });
  const sampledIssues = queueIssuesResult.values ?? [];

  let breached = 0;
  let tracked = 0;

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
      if (!slaValues || slaValues.length === 0) continue;
      tracked += 1;
      const anyBreached = slaValues.some(
        (goal) => goal.ongoingCycle?.breached === true || goal.completedCycles?.some((c) => c.breached)
      );
      if (anyBreached) breached += 1;
    }
  }

  return { breached, tracked };
}

export async function getDashboardSummary() {
  const [incidents, problems, changes, slaSample] = await Promise.all([
    countIssuesFor('issuetype = Incident'),
    countIssuesFor('issuetype = Problem'),
    countIssuesFor('issuetype = Change'),
    sampleSlaBreach(),
  ]);

  const { score, grade, severity } = computeCompositeScore({
    incidents,
    problems,
    changes,
    breachedSlaCount: slaSample.breached,
    totalSlaTracked: slaSample.tracked,
  });

  return {
    score,
    grade,
    severity,
    metrics: {
      incidents,
      problems,
      changes,
      slaBreachRate: slaSample.tracked > 0 ? slaSample.breached / slaSample.tracked : 0,
    },
  };
}

export async function getGradeSeverityDistribution() {
  const jql = 'issuetype in (Incident, Problem, Change) ORDER BY priority DESC';
  const result = await searchIssues({ jql, cursor: null, pageSize: 100, fields: ['priority'] });

  const issues = result.issues.map((issue) => ({ priority: issue.fields.priority?.name }));

  return { distribution: buildSeverityDistribution(issues) };
}

export async function getAiInsights() {
  const summary = await getDashboardSummary();

  const insights = [];

  if (summary.metrics.slaBreachRate > 0.2) {
    insights.push({
      id: 'sla-breach-high',
      severity: 'high',
      message: `SLA breach rate is elevated at ${Math.round(summary.metrics.slaBreachRate * 100)}% of sampled tickets.`,
    });
  }

  if (summary.metrics.incidents > summary.metrics.problems * 3 && summary.metrics.problems > 0) {
    insights.push({
      id: 'incident-to-problem-ratio',
      severity: 'moderate',
      message: 'Incident volume is high relative to logged problems -- consider reviewing root-cause tracking.',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'no-findings',
      severity: 'low',
      message: 'No significant anomalies detected in current ticket data.',
    });
  }

  return { insights };
}

export async function getRecommendations() {
  const summary = await getDashboardSummary();
  const recommendations = [];

  if (summary.metrics.slaBreachRate > 0.2) {
    recommendations.push({
      id: 'reduce-sla-breach',
      title: 'Reduce SLA breaches',
      description: 'Review queues with the highest breach rate and rebalance agent workload.',
    });
  }

  if (summary.grade === 'D' || summary.grade === 'F') {
    recommendations.push({
      id: 'improve-composite-score',
      title: 'Address open incidents and problems',
      description: 'Composite health score is below target -- prioritize triage on open Incidents and Problems.',
    });
  }

  return { recommendations };
}
