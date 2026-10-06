# Architecture

Where each conventional layer lives, how a tap becomes a saved meal, and the rules that
keep it that way. The reasoning is in [adr/](adr/README.md).

## If you are looking for…

The code is grouped **by feature** ([ADR 0003](adr/0003-feature-slices.md)), so the usual
layer names are folders _inside_ a feature or a sibling layer, not top-level buckets.

| Conventional name      | Here                                                                   | Notes                                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screens / pages        | `src/features/<name>/screens/*Screen.tsx`                              | Route files in `src/app/` are one-line re-exports.                                                                                                                                       |
| Components             | `src/features/<name>/components/`                                      | Private to the feature.                                                                                                                                                                  |
| Shared components / DS | `src/ui/`                                                              | Tokens, typography, `Text`, `Sheet`, `Button`, skeletons, mascot.                                                                                                                        |
| Services / data access | `src/api/*.ts`                                                         | TanStack Query hooks + the fetch calls behind them. Only layer that touches HTTP.                                                                                                        |
| State management       | TanStack Query (server) · `src/features/*/stores` (UI, Zustand)        | [ADR 0001](adr/0001-state-management.md). No Redux, on purpose.                                                                                                                          |
| DTOs / models / types  | `@sparshtomar/olive-shared` (Zod schemas, inferred types)              | [ADR 0002](adr/0002-shared-zod-contract.md). Validated at runtime.                                                                                                                       |
| Domain logic           | `src/features/<name>/lib/` and the shared package                      | Pure, unit-tested: portions, review math, marker parsing, steps.                                                                                                                         |
| Infrastructure         | `src/lib/`                                                             | HTTP client, query cache + persister, session, photos, haptics, network, error copy.                                                                                                     |
| Config / constants     | `src/lib/config.ts`, `src/ui/theme.ts`, `src/api/query-keys.ts`        | Next to what uses them. No `constants/` bucket (the architecture test forbids one).                                                                                                      |
| AI chat                | `src/features/chat/`                                                   | Ask tab, thread, composer with photo; answers grounded server-side ([olive-server ADR 0007](https://github.com/Sparshtomar/olive-server/blob/main/docs/adr/0007-grounded-assistant.md)). |
| Navigation             | `src/app/_layout.tsx` (composition root), `features/shell`             | Expo Router; auth guard via `Stack.Protected`.                                                                                                                                           |
| Error handling         | `src/lib/errors.ts` → copy + recovery per API code; `ui/ErrorFallback` | One error shape from the API, mapped once.                                                                                                                                               |
| Theming                | `src/ui/theme.ts`, `typography.ts`, `use-theme.ts`                     | [ADR 0005](adr/0005-design-tokens.md).                                                                                                                                                   |
| Tests                  | `test/*.test.ts` (unit + architecture), `e2e/smoke.mjs` (browser)      | [ADR 0006](adr/0006-browser-smoke-test.md).                                                                                                                                              |

## A tap, end to end

```
"Snap it" on the log sheet
  │
  ├─ features/meals/components/LogSheet      picks the photo (lib/photos: permission, resize)
  ├─ features/meals/stores/meal-draft        holds the capture; router.push('/meal/new')
  ├─ features/meals/screens/NewMealScreen    useMutation(analyzeMeal) → AnalyzingView while it runs
  │     └─ api/meals.analyzeMeal              multipart POST; response parsed with the shared schema
  ├─ features/meals/components/MealEditor    user corrects items (features/meals/lib/portions, review)
  └─ api/meals.useCreateMeal                 POST with a client id (idempotent); invalidates day/trends/insights
        └─ ui/Toast                          "Lunch logged · 540 kcal" - Today re-renders from the cache
```

Every arrow crosses a boundary ESLint knows about: routes only re-export, features
reach data through `api`, `api` and `ui` never import a feature.

## Dependency direction

```
            app/ (routes)          one line each; _layout.tsx is the composition root
                 │
            features/*             use each other only via index.ts
            ┌────┴────┐
          api/       ui/            server state · design system (domain-free)
            └────┬────┘
               lib/                 infrastructure; imports nothing above
```

Enforced by [eslint.config.mjs](../eslint.config.mjs) (layers, public APIs, colour
tokens, no cycles) and [test/architecture.test.ts](../test/architecture.test.ts)
(feature anatomy, thin routes, naming, no grab-bags, no versioned copies).

## Resilience

- **Opens offline:** the query cache is persisted; last-known data renders instantly.
- **Offline banner:** reads stay available; actions that need the network say so.
- **Idempotent saves:** one client id per review session - a retried tap creates one meal.
- **Error boundary:** render errors land on a calm screen with a retry, not a white screen.
- **Back-guard:** leaving an edited meal or report asks first.
- **Bundle discipline:** per-file icon imports, per-weight fonts, on-device photo
  resize; CI fails if the Hermes bundle passes 7 MB.

## Scaling plan

Each change paired with the signal that would trigger it. Until then the simpler
design is the correct one.

| Trigger                                              | Change                                                                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Users log without signal and lose entries            | Offline **write** queue in a Zustand store with persistence; replay on reconnect; conflicts resolved by `clientId` idempotency. |
| A second device per user                             | Real auth behind the existing `current-user` plugin; the header swap is one function in `lib/http`.                             |
| Fixing a bug means waiting for store review          | Enable `expo-updates` (OTA) - currently off to keep the submission build deterministic.                                         |
| > a few hundred users                                | Crash + analytics SDK behind one `lib/telemetry` seam; `ErrorFallback` and `lib/errors` already funnel every failure.           |
| Logging drops off after week two                     | Push reminders tuned to each user's usual meal times (server knows them).                                                       |
| A non-English market                                 | i18n; every string is already in components, none in `lib`.                                                                     |
| A component regresses in a way the smoke test misses | `jest-expo` renderer tests for that component ([ADR 0006](adr/0006-browser-smoke-test.md)).                                     |
