import { invokeResolver, invokeResolverCached } from './invokeClient.js';

const PAGE_SIZE = 25;

export const fetchChangesPage = (cursor) => invokeResolver('getChanges', { cursor, pageSize: PAGE_SIZE });

export const fetchChangesSummary = () => invokeResolverCached('getChangesSummary');
