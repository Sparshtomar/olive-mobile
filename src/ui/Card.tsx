import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, shadow, space } from './theme';

export const Card = ({ style, ...rest }: ViewProps) => <View {...rest} style={[styles.card, style]} />;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
});
