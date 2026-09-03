// In-memory cache, module-scoped so it survives component unmount/remount
// (e.g. switching sidebar tabs) but is cleared on a real page reload. Keyed
// by resolver name + stable-stringified params.
const cache = new Map()

function buildKey(namespace, params) {
  return `${namespace}:${JSON.stringify(params, Object.keys(params).sort())}`
}

// Dedupes concurrent calls for the same key and caches the resolved value
// for the lifetime of the page.
export function withCache(namespace, params, loader) {
  const key = buildKey(namespace, params)

  if (cache.has(key)) {
    return cache.get(key)
  }

  const promise = loader().catch((error) => {
    cache.delete(key) // don't cache failures -- allow retry
    throw error
  })

  cache.set(key, promise)
  return promise
}

export function clearCache() {
  cache.clear()
}
