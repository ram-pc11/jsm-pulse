import { searchIssues, getIssue } from './clients/jiraSearchClient.js';

const LINK_LOOKUP_CONCURRENCY = 5;

function countLinkedIncidents(issuelinks = []) {
  return issuelinks.filter((link) => {
    const linkedIssue = link.outwardIssue ?? link.inwardIssue;
    return linkedIssue?.fields?.issuetype?.name === 'Incident';
  }).length;
}

async function withLinkedIncidentCounts(issues) {
  const results = [];

  for (let i = 0; i < issues.length; i += LINK_LOOKUP_CONCURRENCY) {
    const batch = issues.slice(i, i + LINK_LOOKUP_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (issue) => {
        try {
          const detail = await getIssue(issue.key, ['issuelinks']);
          return { ...issue, linkedIncidentCount: countLinkedIncidents(detail.fields?.issuelinks) };
        } catch {
          return { ...issue, linkedIncidentCount: null };
        }
      })
    );
    results.push(...batchResults);
  }

  return results;
}

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

export async function getProblems({ payload }) {
  const { cursor = null, pageSize = 25 } = payload;

  const jql = 'issuetype = Problem ORDER BY priority DESC, created DESC';
  const result = await searchIssues({ jql, cursor, pageSize });

  const items = await withLinkedIncidentCounts(result.issues.map(mapIssue));

  return {
    items,
    nextCursor: result.nextPageToken ?? null,
    isLast: !result.nextPageToken,
  };
}
