# 0005 - Design tokens with a light and a dark palette; dark first

**Status:** Accepted

## Context

Colour and type were constants imported everywhere. Dark mode needed every component
to read the active theme, and the visual direction moved to a near-black, card-based
look where the mascot is the only brand colour that stays fixed.

## Decision

- `ui/theme.ts` holds two palettes under identical token names (`bg`, `surface`,
  `surfaceMuted`, `surfaceRaised`, `text`, `textMuted`, `primary`, `warm`, …). The
  type system fails if one gains a token the other lacks. Shadows have a level per
  palette; the mascot has its own fixed palette.
- `ui/typography.ts` holds the font assets and every named text style. Screens pick a
  variant; they never set a font size.
- `useTheme()` reads the device scheme without a provider, so modals and the error
  boundary see the same theme; `makeStyles()` is a cached, themed `StyleSheet.create`.
- The native app is dark by default; web follows the browser. A test keeps body-text
  pairs at WCAG AA in both palettes.
- Lint bans hex and `rgb()` literals and direct `useColorScheme` outside `ui/theme.ts`.

## Consequences

- A palette change is one file; a new component cannot hard-code a colour.
- Loading states are per-screen skeletons shaped like their content, built from the
  same tokens, so they match in both schemes for free.
- Light mode exists and passes contrast but is not the designed-for experience.

## Revisit when

Users ask for an in-app override independent of the system setting. The hook is the
one place to add a stored preference.
