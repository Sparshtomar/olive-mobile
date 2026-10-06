import type { ViewStyle } from 'react-native';

/**
 * Olive's colour tokens. Dark-first: a neutral near-black page, cards one step
 * lighter with a 1px border, white text, and a mint accent for "good". Over-target
 * is orange rather than red so it reads as information, not alarm.
 */
const dark = {
  bg: '#0F0F11',
  surface: '#1A1A1D',
  surfaceMuted: '#26262A',
  /** One more step up: a selected control on a muted track, icon wells inside cards. */
  surfaceRaised: '#323237',
  border: '#2A2A2F',
  borderStrong: '#3E3E45',

  text: '#F5F5F7',
  textMuted: '#A1A1A8',
  textFaint: '#6E6E76',
  textOnPrimary: '#0B1F12',

  primary: '#8CE8A8',
  primarySoft: '#1A3324',
  /** Barely-there tint for selected cards and previews. */
  primaryTint: '#152319',

  warm: '#FF9A62',
  warmSoft: '#3A2416',
  warmBorder: '#5A3620',

  danger: '#FF7A6E',
  dangerSoft: '#3B1E1B',

  /** Informational callouts (insights, info toasts). */
  info: '#7FAEFF',
  infoSoft: '#1A2740',
  /** Tips and advice (marker explanations). */
  tip: '#F5C451',
  tipSoft: '#332A14',
  tipBorder: '#4D3E1C',

  protein: '#F28B6B',
  carbs: '#F5C451',
  fat: '#7FAEFF',

  overlay: 'rgba(0, 0, 0, 0.7)',
};

export type ColorToken = keyof typeof dark;
export type Colors = Record<ColorToken, string>;

/** Same structure in light: white cards on a cool grey page, accents darkened for contrast. */
const light: Colors = {
  bg: '#F4F4F6',
  surface: '#FFFFFF',
  surfaceMuted: '#ECECF0',
  surfaceRaised: '#FFFFFF',
  border: '#E4E4E9',
  borderStrong: '#CFCFD6',

  text: '#121214',
  textMuted: '#65656D',
  textFaint: '#9A9AA2',
  textOnPrimary: '#FFFFFF',

  primary: '#157A42',
  primarySoft: '#DFF3E6',
  primaryTint: '#F1FAF4',

  warm: '#D4652F',
  warmSoft: '#FCEADF',
  warmBorder: '#F3C9AF',

  danger: '#BE3A32',
  dangerSoft: '#FAE3E1',

  info: '#3F6FD1',
  infoSoft: '#E6EEFC',
  tip: '#B07E0C',
  tipSoft: '#FBF2DC',
  tipBorder: '#F0DDAD',

  protein: '#D4652F',
  carbs: '#B07E0C',
  fat: '#3F6FD1',

  overlay: 'rgba(18, 18, 20, 0.45)',
};

/** A `#RRGGBB` token at the given opacity, for translucent fills derived from the palette. */
export const alpha = (hex: string, opacity: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
};

type Shadow = Pick<ViewStyle, 'shadowColor' | 'shadowOpacity' | 'shadowRadius' | 'shadowOffset' | 'elevation'>;

const shadowLevel = (color: string, opacity: number, radius: number, y: number, elevation: number): Shadow => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: y },
  elevation,
});

// On a black page shadows barely read; borders and lighter surfaces carry the depth.
const darkShadow = {
  /** Lifts a selected segment off its track. */
  raised: shadowLevel('#000000', 0.3, 4, 1, 1),
  card: shadowLevel('#000000', 0.2, 10, 3, 1),
  floating: shadowLevel('#000000', 0.5, 24, 10, 10),
};

export type Shadows = Record<keyof typeof darkShadow, Shadow>;

const lightShadow: Shadows = {
  raised: shadowLevel('#000000', 0.06, 4, 1, 1),
  card: shadowLevel('#121214', 0.05, 12, 4, 2),
  floating: shadowLevel('#121214', 0.14, 24, 10, 10),
};

export type ColorScheme = 'light' | 'dark';

export interface Theme {
  scheme: ColorScheme;
  colors: Colors;
  shadow: Shadows;
}

export const themes: Record<ColorScheme, Theme> = {
  light: { scheme: 'light', colors: light, shadow: lightShadow },
  dark: { scheme: 'dark', colors: dark, shadow: darkShadow },
};

/** Olive the mascot's own palette - illustration colours, the same in both schemes. */
export const mascot = {
  stem: '#4F9E6A',
  leaf: '#8DD4A0',
  leafLight: '#A9E2B7',
  body: '#9CD6AC',
  bodyHighlight: '#B6E4C2',
  cheek: '#F0A58A',
  ink: '#12221A',
  eyeGlint: '#FFFFFF',
  mouth: '#6E3F31',
  sparkle: '#F5C451',
} as const;

/** Drawn over photos, which look the same in both schemes. */
export const media = {
  tint: alpha(dark.primary, 0.14),
  scanLine: dark.primary,
  glow: dark.primary,
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

/** Layout switches from phone to desktop patterns at this width. */
export const WIDE_BREAKPOINT = 900;

/** Bottom space phone screens leave so content clears the floating tab bar. */
export const TAB_BAR_CLEARANCE = 112;
