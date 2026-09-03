// Shared cursor helpers. Every resolver exposes the same
// { cursor, pageSize } in / { items, nextCursor, isLast } out contract,
// regardless of the native pagination style of the underlying Jira/JSM API.

export function toStartAt(cursor) {
  return cursor ? Number(cursor) : 0;
}

export function fromStartAt(start, pageSize, isLastPage) {
  return isLastPage ? null : String(start + pageSize);
}
