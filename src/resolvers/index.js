import Resolver from '@forge/resolver';

import { getIncidents } from './incidentResolvers.js';
import { getProblems } from './problemResolvers.js';
import { getChanges } from './changeResolvers.js';
import { getServiceRequests, getServiceDesks, getQueues } from './serviceRequestResolvers.js';
import { getSlaSummary, getSlaOverview } from './slaResolvers.js';
import {
  getDashboardSummary,
  getGradeSeverityDistribution,
  getAiInsights,
  getRecommendations,
} from './dashboardResolvers.js';

const resolver = new Resolver();

resolver.define('getIncidents', getIncidents);
resolver.define('getProblems', getProblems);
resolver.define('getChanges', getChanges);
resolver.define('getServiceRequests', getServiceRequests);
resolver.define('getServiceDesks', getServiceDesks);
resolver.define('getQueues', getQueues);
resolver.define('getSlaSummary', getSlaSummary);
resolver.define('getSlaOverview', getSlaOverview);
resolver.define('getDashboardSummary', getDashboardSummary);
resolver.define('getGradeSeverityDistribution', getGradeSeverityDistribution);
resolver.define('getAiInsights', getAiInsights);
resolver.define('getRecommendations', getRecommendations);

export const handler = resolver.getDefinitions();
