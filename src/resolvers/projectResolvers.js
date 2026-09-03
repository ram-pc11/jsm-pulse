import { getServiceDesks as getServiceDesksClient, getRequestTypes } from './clients/jsmClient.js';
import { countIssues } from './clients/jiraSearchClient.js';

const TICKET_COUNT_CONCURRENCY = 5;
const REQUEST_TYPE_COUNT_CONCURRENCY = 5;

function mapProject(desk) {
  return {
    serviceDeskId: desk.id,
    projectId: desk.projectId,
    projectKey: desk.projectKey,
    projectName: desk.projectName,
  };
}

async function fetchAllProjects() {
  const allProjects = [];
  let cursor = null;
  let isLast = false;
  while (!isLast) {
    const result = await getServiceDesksClient({ cursor, pageSize: 50 });
    allProjects.push(...result.values.map(mapProject));
    cursor = result.nextCursor;
    isLast = result.isLast;
  }
  return allProjects;
}

async function fetchAllRequestTypesFor(serviceDeskId) {
  const allTypes = [];
  let cursor = null;
  let isLast = false;
  while (!isLast) {
    const result = await getRequestTypes({ serviceDeskId, cursor, pageSize: 50 });
    allTypes.push(...result.values);
    cursor = result.nextCursor;
    isLast = result.isLast;
  }
  return allTypes;
}

// Only JSM (service desk) projects -- not a generic Jira project directory.
// Each service desk maps 1:1 to a JSM project.
export async function getProjects({ payload }) {
  const { cursor = null, pageSize = 25 } = payload;

  const result = await getServiceDesksClient({ cursor, pageSize });
  const projects = result.values.map(mapProject);

  const withTicketCounts = [];
  for (let i = 0; i < projects.length; i += TICKET_COUNT_CONCURRENCY) {
    const batch = projects.slice(i, i + TICKET_COUNT_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (project) => {
        if (!project.projectKey) return { ...project, ticketCount: null };
        try {
          const ticketCount = await countIssues(`project = "${project.projectKey}"`);
          return { ...project, ticketCount };
        } catch {
          return { ...project, ticketCount: null };
        }
      })
    );
    withTicketCounts.push(...batchResults);
  }

  return {
    items: withTicketCounts,
    nextCursor: result.nextCursor,
    isLast: result.isLast,
  };
}

// Real counts via approximate-count -- total JSM projects (fetched in full,
// not capped at one page, since this is meant to be a complete total) plus
// total tickets across all of them.
export async function getProjectsSummary() {
  const allProjects = await fetchAllProjects();

  const ticketCounts = [];
  for (let i = 0; i < allProjects.length; i += TICKET_COUNT_CONCURRENCY) {
    const batch = allProjects.slice(i, i + TICKET_COUNT_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (project) => {
        if (!project.projectKey) return { projectName: project.projectName, count: null };
        try {
          const count = await countIssues(`project = "${project.projectKey}"`);
          return { projectName: project.projectName, count };
        } catch {
          return { projectName: project.projectName, count: null };
        }
      })
    );
    ticketCounts.push(...batchResults);
  }

  const totalTickets = ticketCounts.reduce((sum, p) => sum + (p.count ?? 0), 0);
  const busiestProject = ticketCounts.reduce((max, p) => ((p.count ?? 0) > (max?.count ?? -1) ? p : max), null);

  const distribution = Object.fromEntries(
    ticketCounts.filter((p) => p.count !== null).map((p) => [p.projectName, p.count])
  );

  return {
    totalProjects: allProjects.length,
    totalTickets,
    busiestProjectName: busiestProject?.projectName ?? null,
    distribution,
  };
}

// Site-wide ticket count per request type. There is no working site-wide
// request-type list endpoint from Forge -- GET /rest/servicedeskapi/requesttype
// is marked experimental and rejects Forge calls with a 412, so this
// enumerates every project's request types individually via
// GET .../servicedesk/{id}/requesttype instead.
//
// Counting is JQL-based (issuetype = <id>, scoped to the request type's
// owning project via project = <key>) since there is no direct
// "Request Type" JQL field confirmed safe to query by name. Two request
// types in the SAME project that share an issue type cannot be
// distinguished by JQL and are merged into one bucket -- this is an inherent
// JSM/JQL limitation, not a shortcut taken here.
export async function getTicketsByRequestType() {
  const allProjects = await fetchAllProjects();

  const requestTypesByProject = await Promise.all(
    allProjects.map(async (project) => {
      try {
        const types = await fetchAllRequestTypesFor(project.serviceDeskId);
        return { project, types };
      } catch {
        return { project, types: [] };
      }
    })
  );

  // Key by (issueTypeId, projectKey) so request types with the same issue
  // type in DIFFERENT projects still get separate, accurate counts.
  const buckets = new Map();
  for (const { project, types } of requestTypesByProject) {
    for (const requestType of types) {
      const issueTypeId = requestType.issueTypeId;
      if (!issueTypeId) continue;

      const bucketKey = `${issueTypeId}:${project.projectKey ?? ''}`;
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, {
          name: requestType.name ?? `Type ${issueTypeId}`,
          issueTypeId,
          projectKey: project.projectKey ?? null,
        });
      }
    }
  }

  const entries = Array.from(buckets.values());
  const counts = [];
  for (let i = 0; i < entries.length; i += REQUEST_TYPE_COUNT_CONCURRENCY) {
    const batch = entries.slice(i, i + REQUEST_TYPE_COUNT_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async ({ name, issueTypeId, projectKey }) => {
        const jql = projectKey
          ? `project = "${projectKey}" AND issuetype = ${issueTypeId}`
          : `issuetype = ${issueTypeId}`;
        try {
          const count = await countIssues(jql);
          return { name, count };
        } catch {
          return { name, count: null };
        }
      })
    );
    counts.push(...batchResults);
  }

  // Same-name request types across different projects (or the same-issue-
  // type merge above) are summed into one label for the chart.
  const distribution = {};
  for (const { name, count } of counts) {
    if (count === null) continue;
    distribution[name] = (distribution[name] ?? 0) + count;
  }

  return { distribution };
}
