# 0001 - Server state in TanStack Query, UI state in Zustand, no Redux

**Status:** Accepted

## Context

Almost all of the app's state is a copy of what the server knows: the user, a day's
meals, trends, reports. A little is genuinely client-side: which sheet is open, the meal
being drafted before analysis finishes, the picked report file. Redux is the default
answer many teams reach for, and it was considered.

## Decision

Two tools, split by the _kind_ of state, not by feature:

- **TanStack Query** owns server state. It is the cache, the loading/error state, the
  retry policy and the invalidation after a write. The cache is persisted to
  AsyncStorage so the app opens instantly with last-known data and reads offline.
- **Zustand** owns the handful of UI-state stores (`features/*/stores`). Each is a few
  lines, has no boilerplate, and can be read outside React (the toast API does this).

No Redux. The Redux maintainers' own guidance is that server data belongs in RTK
Query or React Query, not in hand-written slices; a `mealsSlice` beside `useMeals()`
would be two caches for one truth, with the invalidation bugs that implies.

## Consequences

- Fetching, caching, offline reads and optimistic invalidation are configuration, not
  code we maintain.
- There is no global store to inspect in one place. The query devtools cover server
  state; the Zustand stores are small enough to read.
- New contributors used to Redux need the one-paragraph explanation above, which is
  why it is written down.

## Revisit when

Client-side state grows complex enough to need time-travel debugging or a single
serialisable snapshot (an offline _write_ queue with conflict resolution is the likely
first case). Zustand's middleware covers persistence and devtools before a migration
would be warranted.
