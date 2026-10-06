import type { ViewStyle } from 'react-native';

/**
 * Olive's colour tokens. Calm and warm: cream surfaces, one sage accent, and
 * terracotta instead of red so "over target" reads as information, not alarm.
 * Dark mode keeps the warmth (brown-black, not grey) and lifts the accents so
 * they hold contrast on dark surfaces.
 */
const light = {
  bg: '#FBF7F0',
  surface: '#FFFFFF',
  surfaceMuted: '#F4EEE4',
  /** A selected control sitting on a muted track (segmented control, active sidebar item). */
  surfaceRaised: '#FFFFFF',
  border: '#ECE4D6',
  borderStrong: '#DCD1BF',

  text: '#2B2722',
  textMuted: '#756C60',
  textFaint: '#A3998B',
  textOnPrimary: '#FFFFFF',

  primary: '#4F7A5A',
  primarySoft: '#E4EDE2',
  /** Barely-there sage for selected cards and previews. */
  primaryTint: '#F7FAF5',

  warm: '#D9825B',
  warmSoft: '#FAE8DD',
  warmBorder: '#F0CDB8',

  danger: '#B5523F',
  dangerSoft: '#F6E0DA',

  /** Informational callouts (insights, info toasts). */
  info: '#6F93B3',
  infoSoft: '#E7EEF4',
  /** Tips and advice (marker explanations). */
  tip: '#D9A441',
  tipSoft: '#FBF3E2',
  tipBorder: '#F3E5C4',

  protein: '#C46F4E',
  carbs: '#D9A441',
  fat: '#6F93B3',

  overlay: 'rgba(43, 39, 34, 0.42)',
};

export type ColorToken = keyof typeof light;
export type Colors = Record<ColorToken, string>;

const dark: Colors = {
  bg: '#171512',
  surface: '#211E1A',
  surfaceMuted: '#2B2722',
  surfaceRaised: '#3A352E',
  border: '#35302A',
  borderStrong: '#4A443B',

  text: '#F3EDE3',
  textMuted: '#B5AB9C',
  textFaint: '#887E71',
  textOnPrimary: '#13201A',

  primary: '#8DBB98',
  primarySoft: '#253429',
  primaryTint: '#1C241E',

  warm: '#E3906A',
  warmSoft: '#3A2820',
  warmBorder: '#5C3D2C',

  danger: '#EB8571',
  dangerSoft: '#3E231D',

  info: '#8FB0CE',
  infoSoft: '#1E2832',
  tip: '#E2B456',
  tipSoft: '#2F2919',
  tipBorder: '#4A3F24',

  protein: '#DE8C69',
  carbs: '#E2B456',
  fat: '#8FB0CE',

  overlay: 'rgba(0, 0, 0, 0.6)',
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

const lightShadow = {
  /** Lifts a selected segment off its track. */
  raised: shadowLevel('#000000', 0.06, 4, 1, 1),
  card: shadowLevel('#5A4A32', 0.06, 12, 4, 2),
  floating: shadowLevel('#5A4A32', 0.16, 20, 8, 8),
};

export type Shadows = Record<keyof typeof lightShadow, Shadow>;

// On dark surfaces shadows barely read; borders and lighter surfaces carry the depth.
const darkShadow: Shadows = {
  raised: shadowLevel('#000000', 0.3, 4, 1, 1),
  card: shadowLevel('#000000', 0.25, 12, 4, 2),
  floating: shadowLevel('#000000', 0.5, 20, 8, 8),
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

/** Olive the mascot's own palette — illustration colours, the same in both schemes. */
export const mascot = {
  stem: '#4F7A5A',
  leaf: '#8DB48E',
  leafLight: '#A5C6A3',
  body: '#9CC09B',
  bodyHighlight: '#B3D1B0',
  cheek: '#E9A88A',
  ink: '#2B2722',
  eyeGlint: '#FFFFFF',
  mouth: '#7A4A3A',
  sparkle: '#D9A441',
} as const;

/** Drawn over photos, which look the same in both schemes. */
export const media = {
  tint: alpha(light.primary, 0.12),
  scanLine: light.primarySoft,
  glow: light.primary,
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

/** Layout switches from phone to desktop patterns at this width. */
export const WIDE_BREAKPOINT = 900;

/** Bottom space phone screens leave so content clears the floating tab bar. */
export const TAB_BAR_CLEARANCE = 96;
