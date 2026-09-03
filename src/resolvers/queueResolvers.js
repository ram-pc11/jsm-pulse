import { getServiceDesks as getServiceDesksClient, getQueues as getQueuesClient } from './clients/jsmClient.js';

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
