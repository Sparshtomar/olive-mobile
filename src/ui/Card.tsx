import { View, type ViewProps } from 'react-native';
import { radius, space } from './theme';
import { makeStyles } from './use-theme';

export const Card = ({ style, ...rest }: ViewProps) => {
  const styles = useStyles();
  return <View {...rest} style={[styles.card, style]} />;
};

const useStyles = makeStyles(({ colors, shadow }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
}));
