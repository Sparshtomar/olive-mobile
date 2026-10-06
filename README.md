# Olive, a personal health assistant

Snap, say or type what you ate. Olive works out the nutrition, tracks it against a goal, and connects it to your lab reports: if your LDL is high, Olive turns that into a daily saturated-fat budget and tracks it as you log.

Runs on **Android, iOS and the web** (desktop gets a sidebar and dialogs, phones get a tab bar and bottom sheets) from one Expo codebase. The backend lives in [olive-server](https://github.com/Sparshtomar/olive-server).

> **Try it in 5 seconds:** on the welcome screen tap **Explore with demo data**. Olive creates a fresh demo user (Riya) with two weeks of meals and two lab reports four months apart, so every screen has something real to show.

---

## Product thinking

**The problem.** Calorie apps mostly fail in week two: logging is tedious, and the numbers never say what to do next. Lab reports sit in a drawer, disconnected from what people eat every day.

**The bet.** Make logging take under 15 seconds, and make the data answer one question: _how am I doing, and what should I change?_ The full plan is in [docs/PRODUCT.md](docs/PRODUCT.md).

### The five flows I built (and why these)

| Flow                                                             | Why it's core                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Goal setup**                                                | Every number in the app is relative to a goal. The target is shown with its math (BMR → activity → deficit) so it's never a black box, with a safety floor and a warning for aggressive paces.                                                                                                                                  |
| **2. Log a meal**: photo / voice / text → AI → **review** → save | The habit loop. Most of the polish went here. AI proposes, the user confirms: portion steppers (½×, 1½×…), calorie override that rescales macros, "Olive isn't sure" flags, add-a-missed-item, and "leaves 340 kcal for today" before saving.                                                                                   |
| **3. Today**                                                     | Calorie ring, macros, meal timeline, 7-day trend, streak, and **insights** ("Dinner made up 60% of the overshoot"). Olive's face summarises the day at a glance.                                                                                                                                                                |
| **4. Health reports**                                            | Upload a PDF/photo → AI extracts values → **user verifies** → markers normalised (units, aliases) and trended. Out-of-range markers become **daily nutrient targets on Today**. This link between reports and plate is the differentiator.                                                                                      |
| **5. Ask Olive**                                                 | A chat that knows the user: every answer is grounded in their profile, today's meals and every lab marker - rendered to text by the server, quoted by the model - so \"what does my LDL mean for dinner?\" gets _their_ LDL. Photo attachments, persisted history, data-aware opening questions, an animated orb as the way in. |

### What I deliberately cut

- **Login**: not the problem being evaluated. The device keeps an anonymous user id; the API has a single `current-user` plugin where real auth would slot in.
- **Profile screen**: goal editing lives in a sheet on Today; nothing else is a setting worth a screen.
- **A chatbot that doesn't know you**: Ask Olive only exists because every answer is grounded in the user's own data; an ungrounded assistant was not worth a tab.
- **Water / sleep / steps / barcode**: they dilute the food + reports story.

### Decisions worth calling out

- **Insights are rule-based, not LLM-generated.** Deterministic, unit-tested, free, and they can't hallucinate about someone's health. The engine always keeps one positive insight if there is one: a coach, not a critic.
- **Tracked markers use one reference range per marker** (in canonical units), so a trend across two labs or mg/dL vs mmol/L stays comparable. The lab's printed range is still shown on the report.
- **Calm, not clinical.** Dark, quiet surfaces with one mint accent; over-target is orange, never red. Being 80 kcal over is information, not failure.
- **Demo users are created per tap**, not shared, so reviewers never see each other's edits.
- **First-run hints are data, not screens.** Each screen declares its tour as a list of `{ target, title, body }`; anything on screen can be a target. One component spotlights, paces and remembers. Steps whose target did not render are skipped, so a tour never points at nothing ([ADR 0007](docs/adr/0007-declarative-hints.md)).

### Edge cases handled

No food in the photo · blurry / unrelated image · empty or too-short voice note · mic / camera permission asked in-app first, then the OS prompt, then _Open Settings_ once it can't be re-asked · offline (cached data stays readable, logging is disabled with an explanation) · AI rate-limited (automatic model fallback, then a friendly retry) · AI timeout · double-tap / retried save (idempotent `clientId`) · editing and deleting meals (optimistic delete with rollback) · logging for a past day · leaving with unsaved changes (confirm, incl. Android back) · not a lab report · password-protected PDF · file too large · unknown units (kept, not tracked, so a value is never off by 38×) · VLDL/Non-HDL not mistaken for LDL/HDL · future report dates · server forgot the device (falls back to onboarding) · a render crash (friendly screen with retry instead of a blank one).

---

## Architecture

**Stack:** Expo SDK 57 · Expo Router · TanStack Query · Zustand · Reanimated · Vitest

```
src/
  app/        routes only: each file re-exports one feature screen
  features/   onboarding · today · meals · reports · goal · chat · hints · shell
                index.ts     the feature's public API, the only thing other code imports
                screens/     route-level components
                components/  feature-private UI
                stores/      client-only state (zustand)
                lib/         pure logic, unit-tested
  api/        server state: typed requests + React Query hooks, one file per backend module
  ui/         design system: tokens, Sheet, Button, Olive mascot… (no data access)
  lib/        infrastructure: HTTP client, query cache, session, photos, error copy
```

Looking for `services/`, `models/`, a `store/`? [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) maps every conventional layer to its folder here, traces one tap end to end, and ends with a **scaling plan** - each change paired with the signal that would trigger it. The reasoning behind the big calls (TanStack Query + Zustand rather than Redux, the shared Zod contract, feature slices, the adaptive sheet, dark-first tokens, browser smoke tests) is in [docs/adr/](docs/adr/README.md).

Server data shared by several features (the user, a day's summary) lives in `api/`, not inside one feature, so features never depend on each other for data. The few UI dependencies between features (Today opens the goal sheet and the log sheet) go through their `index.ts` and form no cycles.

- **One contract with the server:** schemas, nutrition targets and lab-marker logic come from [`@sparshtomar/olive-shared`](https://www.npmjs.com/package/@sparshtomar/olive-shared), published from the server repo. Forms validate with the same schemas the API uses, and the report review screen shows High/Low chips live while you edit values, using the exact logic the server stores.
- **Server state:** TanStack Query, persisted to AsyncStorage. The app opens instantly with last-known data, and works read-only offline.
- **Adaptive UI:** one `Sheet` component is a draggable bottom sheet on phones and a centred dialog on wide screens; navigation is a floating tab bar on phones and a sidebar on desktop.
- **Dark-first theming:** the native app is dark; web follows the browser. Colour tokens come in a dark and a light palette (`ui/theme.ts`), type styles live in `ui/typography.ts`, and components read the active theme through `useTheme()` and `makeStyles()`. A test keeps body text at WCAG AA contrast in both palettes. Loading states are per-screen skeletons shaped like the content they stand in for, with a shimmer sweep.
- **Bundle discipline:** icons are imported per-file (Metro doesn't tree-shake; the package root pulled ~1,500 icons), fonts per-weight, photos resized on-device before upload, APK built for arm64 with R8 + resource shrinking.

### Architecture rules (enforced, not just documented)

| Rule                                                                                       | Enforced by                                                                       |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Layers: `app → features → api → lib`; `ui` is domain-free                                  | ESLint `no-restricted-imports` ([eslint.config.mjs](eslint.config.mjs))           |
| A feature is used only through its `index.ts`; relative imports never leave a feature      | ESLint                                                                            |
| Only `src/api` talks to the HTTP client; screens never fetch                               | ESLint                                                                            |
| No import cycles                                                                           | ESLint `import/no-cycle`                                                          |
| No `any`, no `@ts-ignore`, no floating promises, no `console`, no file over 300 lines      | ESLint + `strict` TypeScript                                                      |
| Colours come from design tokens and follow the active theme                                | ESLint (no hex or rgb literals outside `ui/theme.ts`; no direct `useColorScheme`) |
| Feature anatomy, thin routes, naming, no `helpers`/`utils` grab-bags, no `V2`/`Old` copies | Architecture tests ([test/architecture.test.ts](test/architecture.test.ts))       |
| No unused files, exports or dependencies                                                   | knip                                                                              |
| New logic ships with tests (70% of changed lines, per PR)                                  | Diff coverage ([scripts/check-coverage.mjs](scripts/check-coverage.mjs))          |
| Android JS bundle stays under 7 MB                                                         | CI budget check on the exported Hermes bundle                                     |
| No high/critical advisories or copyleft licences in the shipped tree                       | Weekly audit ([dependency-audit.yml](.github/workflows/dependency-audit.yml))     |

Every rule runs on commit (lint-staged), on push (typecheck + knip) and in [CI](.github/workflows/ci.yml), which also runs the tests, gates diff coverage, checks Expo SDK alignment and bundles the Android JavaScript against a size budget. Every CI step runs even when an earlier one fails, so one push reports every problem. Checks that change when someone else publishes (vulnerabilities, licences, expo-doctor) run weekly instead of on PRs. There are no baselines or grandfathered violations.

---

## Running locally

Requirements: Node 22+ (see `.nvmrc`), and the API from [olive-server](https://github.com/Sparshtomar/olive-server#running-locally) running on the same machine.

```bash
npm install
npm start          # press a for Android, w for web
```

In development the app talks to the API on the same machine as Metro, so a phone on the same Wi-Fi works without config.

### Building the APK

Release builds bake in the API URL at build time:

```bash
cp .env.example .env     # set EXPO_PUBLIC_API_URL to the deployed API
npx expo run:android --variant release
```

On launch the app pings `/health`, so a sleeping free-tier server starts waking before the first real request.

### Tests

```bash
npm test         # unit and architecture tests
npm run check    # everything CI runs: format, lint (incl. architecture rules), types, dead code, tests
npm run e2e      # browser smoke test: the core flows, dark and light, screenshots in e2e/screenshots/
```

The unit tests cover the logic behind the review screens (portion steps, calorie override, "leaves X kcal"), onboarding validation, lab-value parsing and error copy, theme contrast, plus the architecture rules. UI components stay thin on top of this logic. `npm run e2e` is the user-like layer: Playwright drives the real web build through onboarding → demo data → the first-run walkthrough → typing and saving a meal → goal sheet → reports → a marker → asking Olive, in both colour schemes, against a running API (local with `AI_PROVIDER=mock`, or the deployed one via `API_URL`). It uses your installed Chrome, so there is no browser download ([ADR 0006](docs/adr/0006-browser-smoke-test.md)). The API's integration tests live in [olive-server](https://github.com/Sparshtomar/olive-server#tests).

---

## What I'd do next

Real auth (JWT behind the existing `current-user` plugin) · push reminders tuned to each user's usual meal times · "repeat yesterday's breakfast" quick-log · weekly email summary · sending the lab report to a doctor · an in-app light/dark override.
