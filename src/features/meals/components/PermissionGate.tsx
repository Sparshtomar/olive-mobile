import { useEffect, useState, type ReactNode } from 'react';
import { Linking, View } from 'react-native';
import { haptics } from '@/lib/haptics';
import { Button, Olive, Text, space } from '@/ui';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

export interface PermissionGateProps {
  /** Reads the current state without prompting. */
  check: () => Promise<PermissionStatus>;
  /** Shows the OS prompt. */
  request: () => Promise<PermissionStatus>;
  /** "your microphone" */
  what: string;
  /** One sentence on why Olive needs it. */
  reason: string;
  onCancel: () => void;
  /** Rendered once permission is granted. */
  children: ReactNode;
}

/** After this many refusals in the app, the OS will not prompt again, so point at Settings. */
const MAX_IN_APP_ASKS = 2;

/**
 * Asks in the app before the OS does. The user sees why Olive wants the permission
 * and taps Allow themselves; only then does the system dialog appear. A refusal brings
 * them back here with a second chance; after that (or when the OS says it will not ask
 * again) the only way forward is Settings, and the gate says so plainly.
 */
export const PermissionGate = ({ check, request, what, reason, onCancel, children }: PermissionGateProps) => {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [asks, setAsks] = useState(0);

  useEffect(() => {
    let live = true;
    void check().then((s) => live && setStatus(s));
    return () => {
      live = false;
    };
  }, [check]);

  if (status === null) return null;
  if (status.granted) return <>{children}</>;

  const exhausted = !status.canAskAgain || asks >= MAX_IN_APP_ASKS;

  const ask = async () => {
    haptics.tap();
    const next = await request();
    setAsks((n) => n + 1);
    setStatus(next);
    if (!next.granted && !next.canAskAgain) haptics.warning();
  };

  return (
    <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.lg }}>
      <Olive mood={exhausted ? 'concerned' : 'curious'} size={96} />
      <Text variant="heading" align="center">
        {exhausted ? `${capitalise(what)} is turned off for Olive` : `Olive needs ${what}`}
      </Text>
      <Text tone="muted" align="center" style={{ maxWidth: 320 }}>
        {exhausted
          ? `Turn it on in Settings and come back - or type your meal instead.`
          : asks === 0
            ? reason
            : `Without ${what} Olive can't hear you. Allow it to use this, or type your meal instead.`}
      </Text>
      <View style={{ gap: space.sm, alignSelf: 'stretch', marginTop: space.sm }}>
        {exhausted ? (
          <Button label="Open Settings" size="lg" onPress={() => void Linking.openSettings()} fullWidth />
        ) : (
          <Button label={asks === 0 ? 'Allow' : 'Allow this time'} size="lg" onPress={() => void ask()} fullWidth />
        )}
        <Button label="Type it instead" variant="ghost" size="lg" onPress={onCancel} fullWidth />
      </View>
    </View>
  );
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
