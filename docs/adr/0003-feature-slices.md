# 0003 - Features own their screens; `ui` and `lib` are domain-free

**Status:** Accepted

## Context

The alternative layouts were by kind (`screens/`, `components/`, `hooks/`,
`services/`, `constants/`) or by feature. By kind is familiar and, past a dozen
screens, means every change fans out across the tree and nothing stops a screen from
importing another feature's internals.

## Decision

```
app/        Expo Router files: one line each, re-export a feature screen
features/   today, meals, reports, goal, onboarding, shell
              screens/ components/ stores/ lib/  + index.ts (the public API)
api/        server state: TanStack Query hooks and the HTTP calls behind them
ui/         the design system: tokens, Text, Sheet, Button, Olive… (no data access)
lib/        infrastructure: http client, query cache, session, photos, haptics
```

The layer order is `app → features → api → lib`, with `ui` beside `api`. A feature is
used by another only through its `index.ts`. `ui` and `lib` know nothing about meals
or reports. Constants live next to what uses them (`ui/theme.ts`, `api/query-keys.ts`,
`lib/config.ts`); there is no `constants/` or `utils/` bucket, and the architecture
test rejects one.

All of it is enforced: ESLint `no-restricted-imports` for the layer rules,
`test/architecture.test.ts` for feature anatomy, thin routes and naming.

## Consequences

- A feature is one folder; the Today screen's components cannot be used by Reports
  by accident, only on purpose through an export.
- The design system can be reasoned about - and themed - without reading any feature.
- Readers looking for `services/` or `models/` need the map in `docs/ARCHITECTURE.md`.

## Revisit when

A feature grows past the four standard folders (the test will say so). That is the
signal to split it, not to add a fifth folder.
