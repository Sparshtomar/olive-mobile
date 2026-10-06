// Per-weight imports: the package roots would bundle every weight of each family.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import type { TextStyle } from 'react-native';

/** Every font file the app uses, loaded once before the splash screen hides. */
export const fontAssets = { Fraunces_600SemiBold, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold };

/**
 * Fraunces for display type, DM Sans for everything else. Each weight is its own font
 * file, so choose the weight here and never add `fontWeight` on top.
 */
export const fonts = {
  display: 'Fraunces_600SemiBold',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
} as const satisfies Record<string, keyof typeof fontAssets>;

/** Text styles for `<Text variant>`. Colour comes from the theme, never from here. */
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: -0.5 },
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.3 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  subheading: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  buttonLarge: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20, letterSpacing: 0.2 },
  button: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 18, letterSpacing: 0.2 },
  label: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  labelSmall: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.2 },
  micro: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 14 },
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase' },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/** Text styles for `TextInput`. No lineHeight: it misaligns single-line input text on iOS. */
export const inputType = {
  body: { fontFamily: fonts.regular, fontSize: 16 },
  title: { fontFamily: fonts.display, fontSize: 24 },
  numeric: { fontFamily: fonts.bold, fontSize: 17 },
} as const satisfies Record<string, TextStyle>;
