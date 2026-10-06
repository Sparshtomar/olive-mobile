import { Children, Fragment, type ReactNode } from 'react';
import { View } from 'react-native';
import type { LucideIcon } from './icons';
import { ChevronRight } from './icons';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { radius, space } from './theme';
import { makeStyles, useTheme } from './use-theme';

/** Rows in one bordered container, separated by hairlines. */
export const ListGroup = ({ children }: { children: ReactNode }) => {
  const styles = useStyles();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.group}>
      {rows.map((row, i) => (
        <Fragment key={i}>
          {i > 0 ? <View style={styles.divider} /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
};

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Shown on the right. Replaced by a chevron when `onPress` is set and nothing is passed. */
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const ListRow = ({
  title,
  subtitle,
  icon: Icon,
  trailing,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: ListRowProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const main = (
    <>
      {Icon ? (
        <View style={styles.iconWell}>
          <Icon size={20} color={colors.text} strokeWidth={2} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </>
  );
  // The trailing control is a sibling of the pressable, never inside it: a button inside a button is invalid HTML.
  return (
    <View style={styles.row}>
      {onPress ? (
        <PressableScale
          onPress={onPress}
          scaleTo={0.99}
          style={styles.main}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}, ${subtitle}` : title)}
          accessibilityHint={accessibilityHint}
        >
          {main}
        </PressableScale>
      ) : (
        <View style={styles.main}>{main}</View>
      )}
      {trailing}
      {onPress ? <ChevronRight size={20} color={colors.textMuted} /> : null}
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    minHeight: 60,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
