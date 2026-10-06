// Per-weight imports: the package root would bundle every weight of the family.
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import type { TextStyle } from 'react-native';

/** Every font file the app uses, loaded once before the splash screen hides. */
export const fontAssets = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
};

/**
 * One geometric sans at four weights. Each weight is its own font file, so choose
 * the weight here and never add `fontWeight` on top.
 */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const satisfies Record<string, keyof typeof fontAssets>;

/** Text styles for `<Text variant>`. Colour comes from the theme, never from here. */
export const type = {
  hero: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 46, letterSpacing: -1 },
  display: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  subheading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  buttonLarge: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
  button: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  labelSmall: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14 },
  micro: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 14 },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/** Text styles for `TextInput`. No lineHeight: it misaligns single-line input text on iOS. */
export const inputType = {
  body: { fontFamily: fonts.regular, fontSize: 16 },
  title: { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.5 },
  numeric: { fontFamily: fonts.semibold, fontSize: 17 },
} as const satisfies Record<string, TextStyle>;
