import { countIssues } from './clients/jiraSearchClient.js';
import { getServiceDesks, getQueues } from './clients/jsmClient.js';
import { getSlaOverview } from './slaResolvers.js';
import { getProjectsSummary, getTicketsByRequestType } from './projectResolvers.js';
import { computeCompositeScore } from './utils/scoring.js';

const PRIORITIES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

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

// Combines Projects section data for the dashboard: total project count,
// total tickets across all JSM projects, tickets-per-project distribution,
// and site-wide tickets-by-request-type distribution (see
// projectResolvers.getTicketsByRequestType for how request types are
// resolved -- it's an approximation based on merging request types that
// share an underlying issue type).
export async function getDashboardProjectsOverview() {
  const [projectsSummary, requestTypeBreakdown] = await Promise.all([
    getProjectsSummary(),
    getTicketsByRequestType(),
  ]);

  return {
    totalProjects: projectsSummary.totalProjects,
    totalTickets: projectsSummary.totalTickets,
    busiestProjectName: projectsSummary.busiestProjectName,
    ticketsByProject: projectsSummary.distribution,
    ticketsByRequestType: requestTypeBreakdown.distribution,
  };
}

// Real per-priority counts via approximate-count -- a single sorted/capped
// search would skew toward whichever priority sorts first (e.g. ORDER BY
// priority DESC + a 100-item cap returns only Highest-priority tickets when
// there are more than 100 total), so each priority is counted independently.
export async function getGradeSeverityDistribution() {
  const counts = await Promise.all(
    PRIORITIES.map((priority) => countIssues(`issuetype in (Incident, Problem, Change) AND priority = "${priority}"`))
  );

  const distribution = Object.fromEntries(PRIORITIES.map((priority, i) => [priority, counts[i]]));

  return { distribution };
}

export async function getAiInsights() {
  const [summary, projectsOverview] = await Promise.all([getDashboardSummary(), getDashboardProjectsOverview()]);

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

  const projectTicketCounts = Object.values(projectsOverview.ticketsByProject);
  const maxProjectTickets = projectTicketCounts.length > 0 ? Math.max(...projectTicketCounts) : 0;
  if (
    projectsOverview.totalTickets > 0 &&
    maxProjectTickets / projectsOverview.totalTickets > 0.5 &&
    projectsOverview.totalProjects > 1
  ) {
    insights.push({
      id: 'project-concentration-high',
      severity: 'moderate',
      message: `${projectsOverview.busiestProjectName} accounts for over half of all tickets across ${projectsOverview.totalProjects} projects -- consider whether workload should be rebalanced.`,
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
