import { invokePaginated } from './paginate.js';

export const fetchAllChanges = (onProgress) => invokePaginated('getChanges', {}, onProgress);
