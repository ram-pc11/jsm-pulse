import { invokePaginated } from './paginate.js';

// Service desk picker needs the full list to populate a dropdown, so this
// stays as a fetch-all (service desks are typically few per site).
export const fetchAllServiceDesks = (onProgress) => invokePaginated('getServiceDesks', {}, onProgress);

// Dashboard's AtRiskQueues/QueueSources need the full queue list for a
// service desk to rank/list them all, so this stays as a fetch-all.
export const fetchAllQueues = (serviceDeskId, onProgress) =>
  invokePaginated('getQueues', { extraParams: { serviceDeskId } }, onProgress);
