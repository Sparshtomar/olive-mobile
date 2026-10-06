import { StyleSheet, useColorScheme } from 'react-native';
import { themes, type ColorScheme, type Theme } from './theme';

/**
 * The active theme, following the device's light/dark setting. Read from the device
 * rather than a provider so it also works outside the tree: the root error boundary,
 * and `Modal`s.
 */
export const useTheme = (): Theme => themes[useColorScheme() === 'dark' ? 'dark' : 'light'];

/**
 * A themed `StyleSheet.create`. Styles are built once per colour scheme and reused.
 *
 *   const useStyles = makeStyles(({ colors }) => ({ card: { backgroundColor: colors.surface } }));
 *   const Card = () => { const styles = useStyles(); … };
 */
export const makeStyles = <T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) => {
  const cache: Partial<Record<ColorScheme, T>> = {};
  const useStyles = (): T => {
    const theme = useTheme();
    return (cache[theme.scheme] ??= StyleSheet.create(factory(theme)));
  };
  return useStyles;
};
