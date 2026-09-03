import { invokePaginated } from './paginate.js';
import { invokeResolverCached } from './invokeClient.js';

export const fetchSlaSummary = (serviceDeskId, queueId) =>
  invokeResolverCached('getSlaSummary', { serviceDeskId, queueId });

export const fetchSlaOverview = (serviceDeskId, onProgress) =>
  invokePaginated('getSlaOverview', { extraParams: { serviceDeskId } }, onProgress);
