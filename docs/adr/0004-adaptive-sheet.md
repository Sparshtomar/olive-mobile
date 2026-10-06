# 0004 — One `Sheet`: bottom sheet on phones, dialog on desktop

**Status:** Accepted

## Context

The brief asks for good UI patterns on both mobile and desktop — a bottom sheet on a
phone, a modal on a wide screen. The naive version branches on platform at every call
site.

## Decision

A single `Sheet` component owns the decision. Below the wide breakpoint it is a
draggable bottom sheet with a grabber and dismiss-by-swipe; above it, a centred dialog
with a scale-in. Callers pass `visible`, `onClose`, `title`, children — and never ask
what platform they are on. `ConfirmSheet` builds on it for destructive actions. The
same rule drives navigation: a floating tab bar on phones, a sidebar on desktop, both
from one `TabsLayout`.

## Consequences

- Every sheet in the app behaves identically, and a fix lands everywhere.
- Features cannot drift into platform-specific layouts; `useLayout()` is the one place
  that knows the breakpoint.
- A sheet that truly needs a different desktop shape would need a new primitive, not a
  prop.

## Revisit when

A flow needs a multi-step sheet with its own navigation stack. That is a different
component, not a mode of this one.
