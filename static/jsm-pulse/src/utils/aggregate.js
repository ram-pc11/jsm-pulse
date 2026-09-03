// Client-side aggregation over already-fetched item lists -- no resolver calls.
export function countBy(items, getKey) {
  const counts = {}
  for (const item of items) {
    const key = getKey(item) ?? 'Unknown'
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

// Two-dimensional count: rows grouped by getRowKey, each row segmented by
// getSegmentKey. Returns { rows: [{ label, segments }], segmentLabels }
// shaped for StackedBarChart, with segmentLabels stable across rows so
// colors/legend line up.
export function countByTwoDimensions(items, getRowKey, getSegmentKey) {
  const rowMap = new Map()
  const segmentLabelSet = new Set()

  for (const item of items) {
    const rowLabel = getRowKey(item) ?? 'Unknown'
    const segmentLabel = getSegmentKey(item) ?? 'Unknown'
    segmentLabelSet.add(segmentLabel)

    if (!rowMap.has(rowLabel)) rowMap.set(rowLabel, {})
    const segments = rowMap.get(rowLabel)
    segments[segmentLabel] = (segments[segmentLabel] ?? 0) + 1
  }

  const rows = Array.from(rowMap.entries())
    .map(([label, segments]) => ({ label, segments }))
    .sort((a, b) => {
      const totalA = Object.values(a.segments).reduce((sum, count) => sum + count, 0)
      const totalB = Object.values(b.segments).reduce((sum, count) => sum + count, 0)
      return totalB - totalA
    })

  return { rows, segmentLabels: Array.from(segmentLabelSet) }
}
