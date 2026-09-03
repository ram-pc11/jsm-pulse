import { searchIssues } from './clients/jiraSearchClient.js';

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
