import { View } from 'react-native';
import { Button } from './Button';
import { Sheet } from './Sheet';
import { Text } from './Text';
import { space } from './theme';

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation for irreversible actions — a sheet on phones, a dialog on desktop. */
export const ConfirmSheet = ({
  visible,
  title,
  body,
  confirmLabel,
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) => (
  <Sheet visible={visible} onClose={onCancel} title={title} dismissible={!loading}>
    {body ? <Text tone="muted">{body}</Text> : null}
    <View style={{ gap: space.sm, marginTop: space.sm }}>
      <Button
        label={confirmLabel}
        variant={destructive ? 'danger' : 'primary'}
        size="lg"
        onPress={onConfirm}
        loading={loading}
        fullWidth
      />
      <Button label="Cancel" variant="ghost" size="lg" onPress={onCancel} disabled={loading} fullWidth />
    </View>
  </Sheet>
);
