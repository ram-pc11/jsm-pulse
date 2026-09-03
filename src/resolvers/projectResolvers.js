import { getServiceDesks as getServiceDesksClient } from './clients/jsmClient.js';
import { countIssues } from './clients/jiraSearchClient.js';

const TICKET_COUNT_CONCURRENCY = 5;

function mapProject(desk) {
  return {
    serviceDeskId: desk.id,
    projectId: desk.projectId,
    projectKey: desk.projectKey,
    projectName: desk.projectName,
  };
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
  const allProjects = [];
  let cursor = null;
  let isLast = false;
  while (!isLast) {
    const result = await getServiceDesksClient({ cursor, pageSize: 50 });
    allProjects.push(...result.values.map(mapProject));
    cursor = result.nextCursor;
    isLast = result.isLast;
  }

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
