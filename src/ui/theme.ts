/**
 * Olive's design tokens. Calm and warm: cream surfaces, one sage accent, and
 * terracotta instead of red so "over target" reads as information, not alarm.
 */
export const colors = {
  bg: '#FBF7F0',
  surface: '#FFFFFF',
  surfaceMuted: '#F4EEE4',
  border: '#ECE4D6',
  borderStrong: '#DCD1BF',

  text: '#2B2722',
  textMuted: '#756C60',
  textFaint: '#A3998B',
  textOnPrimary: '#FFFFFF',

  primary: '#4F7A5A',
  primaryPressed: '#41664B',
  primarySoft: '#E4EDE2',
  /** Barely-there sage for selected cards and previews. */
  primaryTint: '#F7FAF5',

  warm: '#D9825B',
  warmSoft: '#FAE8DD',
  warmBorder: '#F0CDB8',

  /** Informational callouts (insights). */
  infoSoft: '#E7EEF4',
  /** Tips and advice (marker explanations). */
  tipSoft: '#FBF3E2',
  tipBorder: '#F3E5C4',

  danger: '#B5523F',
  dangerSoft: '#F6E0DA',

  protein: '#C46F4E',
  carbs: '#D9A441',
  fat: '#6F93B3',

  overlay: 'rgba(43, 39, 34, 0.42)',
  shadow: '#000000',
} as const;

/** Olive the mascot's own palette — illustration colours, not UI colours. */
export const mascot = {
  leaf: '#8DB48E',
  leafLight: '#A5C6A3',
  body: '#9CC09B',
  bodyHighlight: '#B3D1B0',
  cheek: '#E9A88A',
  eyeGlint: '#FFFFFF',
  mouth: '#7A4A3A',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
} as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: -0.5 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase' },
} as const;

export const shadow = {
  card: {
    shadowColor: '#5A4A32',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#5A4A32',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

/** Layout switches from phone to desktop patterns at this width. */
export const WIDE_BREAKPOINT = 900;

/** Bottom space phone screens leave so content clears the floating tab bar. */
export const TAB_BAR_CLEARANCE = 96;
