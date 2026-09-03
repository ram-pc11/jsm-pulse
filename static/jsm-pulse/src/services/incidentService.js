import { invokeResolver, invokeResolverCached } from './invokeClient.js';

const PAGE_SIZE = 25;

export const fetchIncidentsPage = (cursor) => invokeResolver('getIncidents', { cursor, pageSize: PAGE_SIZE });

export const fetchIncidentsSummary = () => invokeResolverCached('getIncidentsSummary');
