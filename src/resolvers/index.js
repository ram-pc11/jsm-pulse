import Resolver from '@forge/resolver';

import { getIncidents, getIncidentsSummary } from './incidentResolvers.js';
import { getProblems, getProblemsSummary } from './problemResolvers.js';
import { getChanges, getChangesSummary } from './changeResolvers.js';
import { getServiceDesks, getQueues } from './queueResolvers.js';
import { getSlaSummary, getSlaOverview } from './slaResolvers.js';
import { getProjects, getProjectsSummary } from './projectResolvers.js';
import {
  getDashboardSummary,
  getGradeSeverityDistribution,
  getAiInsights,
  getRecommendations,
} from './dashboardResolvers.js';
import { askJsmPulseAgent, getJsmPulseAgentJobResult } from './jsmPulseAgentResolvers.js';

const resolver = new Resolver();

resolver.define('getIncidents', getIncidents);
resolver.define('getIncidentsSummary', getIncidentsSummary);
resolver.define('getProblems', getProblems);
resolver.define('getProblemsSummary', getProblemsSummary);
resolver.define('getChanges', getChanges);
resolver.define('getChangesSummary', getChangesSummary);
resolver.define('getServiceDesks', getServiceDesks);
resolver.define('getQueues', getQueues);
resolver.define('getSlaSummary', getSlaSummary);
resolver.define('getSlaOverview', getSlaOverview);
resolver.define('getProjects', getProjects);
resolver.define('getProjectsSummary', getProjectsSummary);
resolver.define('getDashboardSummary', getDashboardSummary);
resolver.define('getGradeSeverityDistribution', getGradeSeverityDistribution);
resolver.define('getAiInsights', getAiInsights);
resolver.define('getRecommendations', getRecommendations);
resolver.define('askJsmPulseAgent', askJsmPulseAgent);
resolver.define('getJsmPulseAgentJobResult', getJsmPulseAgentJobResult);

export const handler = resolver.getDefinitions();
