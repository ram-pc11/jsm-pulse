import { getServiceDesks as getServiceDesksClient, getQueues as getQueuesClient, getRequests } from './clients/jsmClient.js';

function mapRequest(request) {
  return {
    key: request.issueKey,
    summary: request.requestFieldValues?.find((field) => field.fieldId === 'summary')?.value ?? '',
    requestType: request.requestType?.name ?? 'Unknown',
    status: request.currentStatus?.status ?? 'Unknown',
    createdDate: request.createdDate?.iso8601 ?? null,
  };
}

export async function getServiceRequests({ payload }) {
  const { cursor = null, pageSize = 25 } = payload;

  const result = await getRequests({ cursor, pageSize });

  return {
    items: result.values.map(mapRequest),
    nextCursor: result.nextCursor,
    isLast: result.isLast,
  };
}

export async function getServiceDesks({ payload }) {
  const { cursor = null, pageSize = 25 } = payload;

  const result = await getServiceDesksClient({ cursor, pageSize });

  return {
    items: result.values.map((desk) => ({
      id: desk.id,
      projectId: desk.projectId,
      projectName: desk.projectName,
    })),
    nextCursor: result.nextCursor,
    isLast: result.isLast,
  };
}

export async function getQueues({ payload }) {
  const { serviceDeskId, cursor = null, pageSize = 25 } = payload;

  const result = await getQueuesClient({ serviceDeskId, cursor, pageSize });

  return {
    items: result.values.map((queue) => ({
      id: queue.id,
      name: queue.name,
      jql: queue.jql,
      issueCount: queue.issueCount ?? null,
    })),
    nextCursor: result.nextCursor,
    isLast: result.isLast,
  };
}
