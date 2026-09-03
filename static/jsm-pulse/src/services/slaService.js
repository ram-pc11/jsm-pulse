import { invokePaginated } from './paginate.js';
import { invokeResolver, invokeResolverCached } from './invokeClient.js';

const PAGE_SIZE = 10; // small -- each item fans out into per-ticket SLA sampling

export const fetchSlaSummary = (serviceDeskId, queueId) =>
  invokeResolverCached('getSlaSummary', { serviceDeskId, queueId });

export const fetchSlaOverviewPage = (serviceDeskId, cursor) =>
  invokeResolver('getSlaOverview', { cursor, pageSize: PAGE_SIZE, serviceDeskId });

// Dashboard's AtRiskQueues needs the full ranked list, so this stays a fetch-all.
export const fetchSlaOverview = (serviceDeskId, onProgress) =>
  invokePaginated('getSlaOverview', { extraParams: { serviceDeskId } }, onProgress);
