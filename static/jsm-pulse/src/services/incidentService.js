import { invokePaginated } from './paginate.js';

export const fetchAllIncidents = (onProgress) => invokePaginated('getIncidents', {}, onProgress);
