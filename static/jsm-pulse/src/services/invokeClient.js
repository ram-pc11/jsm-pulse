import { invoke } from '@forge/bridge';
import { withCache } from './resultCache.js';

async function callResolver(resolverKey, payload) {
  try {
    return await invoke(resolverKey, payload);
  } catch (error) {
    console.error(`Resolver call failed: ${resolverKey}`, error);
    throw error;
  }
}

// Used directly by paginate.js (each page call must NOT be cached individually --
// only the assembled full-list result is). Section services that make a single,
// non-paginated call should use invokeResolverCached instead.
export function invokeResolver(resolverKey, payload = {}) {
  return callResolver(resolverKey, payload);
}

// Caches the result for the lifetime of the page -- use for one-shot
// (non-paginated) resolver calls like the dashboard summary/insights.
export function invokeResolverCached(resolverKey, payload = {}) {
  return withCache(`single:${resolverKey}`, payload, () => callResolver(resolverKey, payload));
}
