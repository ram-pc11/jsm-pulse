// Wraps /rest/servicedeskapi/* calls. This API's native pagination style
// (start/limit/isLastPage) is translated to the shared { nextCursor, isLast }
// shape by each function below, via utils/pagination.js.
import api, { route } from '@forge/api';
import { toStartAt, fromStartAt } from '../utils/pagination.js';

async function getJson(response, label) {
  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

export async function getServiceDesks({ cursor, pageSize }) {
  const start = toStartAt(cursor);
  const params = new URLSearchParams({ start: String(start), limit: String(pageSize) });

  const response = await api.asApp().requestJira(route`/rest/servicedeskapi/servicedesk?${params}`);
  const data = await getJson(response, 'JSM service desk list fetch');

  return {
    values: data.values,
    nextCursor: fromStartAt(start, pageSize, data.isLastPage),
    isLast: data.isLastPage,
  };
}

export async function getQueues({ serviceDeskId, cursor, pageSize }) {
  const start = toStartAt(cursor);
  const params = new URLSearchParams({ start: String(start), limit: String(pageSize) });

  const response = await api.asApp().requestJira(
    route`/rest/servicedeskapi/servicedesk/${serviceDeskId}/queue?${params}`
  );
  const data = await getJson(response, 'JSM queue list fetch');

  return {
    values: data.values,
    nextCursor: fromStartAt(start, pageSize, data.isLastPage),
    isLast: data.isLastPage,
  };
}

export async function getQueueIssues({ serviceDeskId, queueId, cursor, pageSize }) {
  const start = toStartAt(cursor);
  const params = new URLSearchParams({ start: String(start), limit: String(pageSize) });

  const response = await api.asApp().requestJira(
    route`/rest/servicedeskapi/servicedesk/${serviceDeskId}/queue/${queueId}/issue?${params}`
  );
  const data = await getJson(response, 'JSM queue issue fetch');

  return {
    values: data.values,
    nextCursor: fromStartAt(start, pageSize, data.isLastPage),
    isLast: data.isLastPage,
  };
}

export async function getRequests({ cursor, pageSize }) {
  const start = toStartAt(cursor);
  const params = new URLSearchParams({ start: String(start), limit: String(pageSize) });

  const response = await api.asApp().requestJira(route`/rest/servicedeskapi/request?${params}`);
  const data = await getJson(response, 'JSM request list fetch');

  return {
    values: data.values,
    nextCursor: fromStartAt(start, pageSize, data.isLastPage),
    isLast: data.isLastPage,
  };
}

export async function getRequestApprovals(issueIdOrKey) {
  const response = await api.asApp().requestJira(
    route`/rest/servicedeskapi/request/${issueIdOrKey}/approval`
  );

  if (response.status === 404) return { values: [] };

  return getJson(response, 'JSM approval fetch');
}

export async function getRequestSla(issueIdOrKey) {
  const response = await api.asApp().requestJira(
    route`/rest/servicedeskapi/request/${issueIdOrKey}/sla`
  );

  if (response.status === 404) return { values: [] };

  return getJson(response, 'JSM SLA fetch');
}

