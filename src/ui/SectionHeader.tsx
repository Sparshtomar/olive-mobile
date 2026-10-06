import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChevronRight } from './icons';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { space } from './theme';
import { useTheme } from './use-theme';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Makes the header a link into the full section, with a chevron. */
  onPress?: () => void;
  accessibilityHint?: string;
  /** Something on the right (a count, a small button). Ignored when `onPress` is set. */
  trailing?: ReactNode;
}

/** Title + muted subtitle above a group of content. */
export const SectionHeader = ({ title, subtitle, onPress, accessibilityHint, trailing }: SectionHeaderProps) => {
  const { colors } = useTheme();
  const body = (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.titleRow}>
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
          {onPress ? <ChevronRight size={20} color={colors.textMuted} strokeWidth={2.4} /> : null}
        </View>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {!onPress && trailing ? trailing : null}
    </View>
  );
  return onPress ? (
    <PressableScale
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
    >
      {body}
    </PressableScale>
  ) : (
    body
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
