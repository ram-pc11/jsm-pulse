import { countIssues, searchIssues } from './clients/jiraSearchClient.js';
import { getServiceDesks, getQueues } from './clients/jsmClient.js';
import { getSlaOverview } from './slaResolvers.js';
import { computeCompositeScore, buildSeverityDistribution } from './utils/scoring.js';

// "Open" excludes Resolved/Closed/Done, matching IncidentsView's client-side
// definition -- kept in sync so the two views never disagree on what counts
// as open.
const OPEN_STATUS_EXCLUSION = 'status not in (Resolved, Closed, Done)';

// Samples SLA breach rate from the first service desk's queues (via
// slaResolvers.getSlaOverview, which samples up to 25 tickets per queue --
// see that file for why this isn't a full-backlog scan or JQL-based count).
async function sampleDashboardSla() {
  const serviceDesksResult = await getServiceDesks({ cursor: null, pageSize: 1 });
  const serviceDesk = serviceDesksResult.values?.[0];
  if (!serviceDesk) return { breached: 0, tracked: 0 };

  const overview = await getSlaOverview({ payload: { serviceDeskId: serviceDesk.id, cursor: null, pageSize: 10 } });

  let breached = 0;
  let tracked = 0;
  for (const { sla } of overview.items) {
    if (!sla) continue;
    breached += sla.breached;
    tracked += sla.tracked;
  }

  return { breached, tracked };
}

export async function getDashboardSummary() {
  const [incidents, openIncidents, problems, changes, slaSample] = await Promise.all([
    countIssues('issuetype = Incident'),
    countIssues(`issuetype = Incident AND ${OPEN_STATUS_EXCLUSION}`),
    countIssues('issuetype = Problem'),
    countIssues('issuetype = Change'),
    sampleDashboardSla(),
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
      openIncidents,
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
