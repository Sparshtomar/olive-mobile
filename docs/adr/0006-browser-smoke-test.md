# 0006 - User-like testing drives the web build in a real browser

**Status:** Accepted

## Context

Unit tests cover the logic the screens sit on (portions, calorie overrides, marker
parsing, onboarding validation, error copy, theme contrast, architecture rules). They
cannot tell you a sheet will not open or a screen renders blank. The options for that
were a React Native renderer (`jest-expo` + testing-library), a device farm (Maestro,
Detox), or driving the web build in a browser.

## Decision

`npm run e2e` runs `e2e/smoke.mjs`: Playwright drives the real web build through the
core flows - onboarding, demo data, logging a typed meal end to end, the goal sheet,
reports, a marker - in dark and light, screenshotting each step, against a real API
(local with the mock AI provider, or the deployed one). It uses the system Chrome via
`playwright-core`, so there is no browser download and it runs on any laptop with
Chrome.

## Consequences

- The whole product is exercised the way a user meets it, in under a minute, with
  pictures. This is how every visual change in this repo was verified.
- It is a smoke test, not a spec: it asserts flows complete, not pixel output.
- Native-only behaviour (camera, microphone, haptics) is out of its reach and stays a
  manual device pass before a release.
- Not in CI yet: it needs the API running, which is a second repo. The script is
  CI-shaped (exit codes, no interactivity) for when a compose-based job is worth it.

## Revisit when

A regression ships that a renderer test would have caught in a component - then
`jest-expo` for that component. Or a release cadence that justifies an emulator job -
then Maestro, driving the same flows on the APK.
