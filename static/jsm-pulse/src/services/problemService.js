import { invokeResolver, invokeResolverCached } from './invokeClient.js';

const PAGE_SIZE = 25;

export const fetchProblemsPage = (cursor) => invokeResolver('getProblems', { cursor, pageSize: PAGE_SIZE });

export const fetchProblemsSummary = () => invokeResolverCached('getProblemsSummary');
