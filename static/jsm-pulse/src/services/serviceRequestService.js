import { invokePaginated } from './paginate.js';

export const fetchAllServiceRequests = (onProgress) => invokePaginated('getServiceRequests', {}, onProgress);

export const fetchAllServiceDesks = (onProgress) => invokePaginated('getServiceDesks', {}, onProgress);

export const fetchAllQueues = (serviceDeskId, onProgress) =>
  invokePaginated('getQueues', { extraParams: { serviceDeskId } }, onProgress);
