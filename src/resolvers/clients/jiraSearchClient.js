// Wraps the platform issue-search endpoint (POST /rest/api/3/search/jql).
// This endpoint is cursor-based (nextPageToken) rather than startAt-based.
import api, { route } from '@forge/api';

const DEFAULT_FIELDS = ['priority', 'status', 'assignee', 'created', 'summary', 'issuelinks'];

export async function searchIssues({ jql, cursor, pageSize, fields = DEFAULT_FIELDS }) {
  const body = {
    jql,
    maxResults: pageSize,
    fields,
    ...(cursor ? { nextPageToken: cursor } : {}),
  };

  const response = await api.asApp().requestJira(route`/rest/api/3/search/jql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Jira search failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export async function getIssue(issueIdOrKey, fields) {
  const params = new URLSearchParams();
  if (fields) params.set('fields', fields.join(','));

  const response = await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueIdOrKey}?${params}`
  );

  if (!response.ok) {
    throw new Error(`Jira get issue failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}
