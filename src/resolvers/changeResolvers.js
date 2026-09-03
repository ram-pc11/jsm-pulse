import { searchIssues } from './clients/jiraSearchClient.js';
import { getRequestApprovals } from './clients/jsmClient.js';

const APPROVAL_LOOKUP_CONCURRENCY = 5;

function summarizeApprovalStatus(approvalResponse) {
  const values = approvalResponse?.values ?? [];
  if (values.length === 0) return 'No approvals';

  const latest = values[0];
  return latest.finalDecision ?? latest.status ?? 'Pending';
}

async function withApprovalStatus(issues) {
  const results = [];

  for (let i = 0; i < issues.length; i += APPROVAL_LOOKUP_CONCURRENCY) {
    const batch = issues.slice(i, i + APPROVAL_LOOKUP_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (issue) => {
        try {
          const approvals = await getRequestApprovals(issue.key);
          return { ...issue, approvalStatus: summarizeApprovalStatus(approvals) };
        } catch {
          return { ...issue, approvalStatus: 'Unavailable' };
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

export async function getChanges({ payload }) {
  const { cursor = null, pageSize = 25 } = payload;

  const jql = 'issuetype = Change ORDER BY priority DESC, created DESC';
  const result = await searchIssues({ jql, cursor, pageSize });

  const items = await withApprovalStatus(result.issues.map(mapIssue));

  return {
    items,
    nextCursor: result.nextPageToken ?? null,
    isLast: !result.nextPageToken,
  };
}
