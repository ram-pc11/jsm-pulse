import { invokePaginated } from './paginate.js';

export const fetchAllProblems = (onProgress) => invokePaginated('getProblems', {}, onProgress);
