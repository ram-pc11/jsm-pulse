import { invokeResolver } from './invokeClient.js';
import { withCache } from './resultCache.js';

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_MAX_PAGES = 20; // safety cap -- never loop unbounded

// Cached per (resolverKey, pageSize, maxPages, extraParams) so revisiting a
// section (e.g. switching sidebar tabs) does not re-invoke the resolver --
// the cache persists until the page is reloaded.
export function invokePaginated(resolverKey, { pageSize = DEFAULT_PAGE_SIZE, maxPages = DEFAULT_MAX_PAGES, extraParams = {} } = {}, onProgress) {
  return withCache(`paginated:${resolverKey}`, { pageSize, maxPages, extraParams }, async () => {
    let cursor = null;
    let isLast = false;
    let page = 0;
    const allItems = [];

    while (!isLast && page < maxPages) {
      const result = await invokeResolver(resolverKey, { cursor, pageSize, ...extraParams });
      allItems.push(...result.items);
      cursor = result.nextCursor;
      isLast = result.isLast;
      page += 1;
      onProgress?.(allItems.length);
    }

    if (!isLast) {
      console.warn(`invokePaginated(${resolverKey}) stopped after ${maxPages} pages -- data may be incomplete`);
    }

    return allItems;
  });
}
