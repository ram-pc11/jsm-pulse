import { searchIssues, countIssues } from './clients/jiraSearchClient.js';

const OPEN_STATUS_EXCLUSION = 'status not in (Resolved, Closed, Done)';
const PRIORITIES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

function mapIssue(issue) {
  return {
    key: issue.key,
    summary: issue.fields.summary ?? '',
    priority: issue.fields.priority?.name ?? 'Unknown',
    status: issue.fields.status?.name ?? 'Unknown',
    assignee: issue.fields.assignee?.displayName ?? 'Unassigned',
    created: issue.fields.created,
  };
}

export async function getIncidents({ payload }) {
  const { cursor = null, pageSize = 25 } = payload;

  const jql = 'issuetype = Incident ORDER BY priority DESC, created DESC';
  const result = await searchIssues({ jql, cursor, pageSize });

  return {
    items: result.issues.map(mapIssue),
    nextCursor: result.nextPageToken ?? null,
    isLast: !result.nextPageToken,
  };
}

// Real counts via approximate-count -- not derived from a capped item list.
export async function getIncidentsSummary() {
  const [total, open, resolved, unassigned, priorityCounts] = await Promise.all([
    countIssues('issuetype = Incident'),
    countIssues(`issuetype = Incident AND ${OPEN_STATUS_EXCLUSION}`),
    countIssues('issuetype = Incident AND status in (Resolved, Closed, Done)'),
    countIssues('issuetype = Incident AND assignee is EMPTY'),
    Promise.all(PRIORITIES.map((priority) => countIssues(`issuetype = Incident AND priority = "${priority}"`))),
  ]);

  const distribution = Object.fromEntries(PRIORITIES.map((priority, i) => [priority, priorityCounts[i]]));

  return { total, open, resolved, unassigned, distribution };
}
