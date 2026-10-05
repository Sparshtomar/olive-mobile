import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { Text } from './Text';
import { space } from './theme';

export interface StateViewProps {
  art?: ReactNode;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
}

/** Shared layout for empty, error and permission states. */
export const StateView = ({ art, title, body, action, secondaryAction }: StateViewProps) => (
  <View style={styles.wrap}>
    {art}
    <Text variant="heading" align="center">
      {title}
    </Text>
    {body ? (
      <Text tone="muted" align="center" style={styles.body}>
        {body}
      </Text>
    ) : null}
    {action || secondaryAction ? (
      <View style={styles.actions}>
        {action ? <Button label={action.label} onPress={action.onPress} /> : null}
        {secondaryAction ? (
          <Button label={secondaryAction.label} onPress={secondaryAction.onPress} variant="ghost" />
        ) : null}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: space.xxl, paddingHorizontal: space.lg, gap: space.sm },
  body: { maxWidth: 340 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, marginTop: space.md },
});
