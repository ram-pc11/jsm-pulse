import { invokeResolverCached } from './invokeClient.js';

export const fetchDashboardSummary = () => invokeResolverCached('getDashboardSummary');
export const fetchGradeSeverityDistribution = () => invokeResolverCached('getGradeSeverityDistribution');
export const fetchAiInsights = () => invokeResolverCached('getAiInsights');
export const fetchRecommendations = () => invokeResolverCached('getRecommendations');
