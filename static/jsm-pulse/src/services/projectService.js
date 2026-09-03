import { invokeResolver, invokeResolverCached } from './invokeClient.js';

const PAGE_SIZE = 25;

export const fetchProjectsPage = (cursor) => invokeResolver('getProjects', { cursor, pageSize: PAGE_SIZE });

export const fetchProjectsSummary = () => invokeResolverCached('getProjectsSummary');
