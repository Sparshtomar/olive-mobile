# 0007 - First-run hints are declared as data next to each screen

**Status:** Accepted

## Context

New users land on Today, Ask and Reports with no idea what the ring, the orb or a
marker card does. The usual fixes are a swipeable intro deck (skipped, forgotten) or
tooltips hand-placed in each screen (every screen re-implements measuring, dimming,
pacing and "seen" bookkeeping, and they drift apart).

## Decision

`src/features/hints` owns the mechanism; screens own only the words.

- A screen declares its tour as data: `{ id, steps: [{ target, title, body }] }`.
- Anything on screen becomes a target by wrapping it in `<HintTarget id>`; the
  wrapper measures itself in window coordinates and registers the rectangle in a store.
- `<HintTour tour>` does the rest: waits for the screen to be focused and the splash
  to finish, drops steps whose target never rendered, cuts a spotlight through a
  dimmed layer, places the card inside the safe area (below, above, or floating over
  a target taller than the screen), and records the tour as seen once.
- The tab bar's Log and Ask buttons are targets too, so Today's tour can point at
  navigation without the shell knowing about tours.
- "Replay the tips" in the goal sheet clears the seen set.

## Consequences

- Adding a hint is one object in the screen's `TOUR` and one wrapper; adding a tour to
  a new screen is the same plus `<HintTour tour={TOUR} />`. No new component code.
- Only one tour runs at a time, and a tour whose targets are all missing (empty
  state) marks itself seen rather than nagging later.
- Placement maths lives in a pure module with unit tests; the component is thin.
- Trigger to revisit: hints that depend on state rather than first visit (for
  example "you have been over target three days running") want a rules engine, not a
  seen-set. That would be a new trigger type on the same tour data.
