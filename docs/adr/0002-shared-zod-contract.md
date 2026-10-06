# 0002 - The shared Zod package is the DTO layer

**Status:** Accepted

## Context

The app needs types for every request and response, plus the nutrition math and the
lab-marker catalogue that the review screens use live. Writing `interface Meal {…}`
here and again on the server means they drift; generating a client from OpenAPI adds a
build step and a generated blob nobody reads.

## Decision

Install `@sparshtomar/olive-shared` from npm. Its Zod schemas are the DTOs: the API
validates requests with them, the app validates responses with them, and every type in
`src/api` is inferred from them. Domain logic the UI needs (`computeTargets`,
`evaluateMarker`, `deriveNutritionFocus`) comes from the same package, so the goal
preview and the report review show the exact numbers the server will store.

## Consequences

- One definition of every shape, executable at runtime on both sides. A malformed
  response fails at the boundary with a message instead of deep in a screen.
- Upgrading the contract is deliberate: bump the version, read the diff, fix the
  callers. CI fails if the app disagrees with the schema it installed.
- The package must stay free of React and server code; lint enforces that imports
  come from its root, not its internals.

## Revisit when

A third consumer appears with its own release cadence - then OpenAPI-generated clients
earn their build step.
