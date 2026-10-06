import type { ReactNode } from 'react';
import { KeyboardAvoidingView, RefreshControl, ScrollView, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from './theme';
import { useLayout } from './use-layout';
import { makeStyles, useTheme } from './use-theme';

export interface ScreenProps {
  children: ReactNode;
  /** Pull-to-refresh handler. */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Content pinned below the scroll area (e.g. a save bar). */
  footer?: ReactNode;
  maxWidth?: number;
  scrollProps?: ScrollViewProps;
  /** Extra bottom space so content clears a floating tab bar. */
  bottomInset?: number;
}

/** Scrollable page with safe areas and a readable max width on desktop. */
export const Screen = ({
  children,
  onRefresh,
  refreshing = false,
  footer,
  maxWidth = 1120,
  scrollProps,
  bottomInset = 0,
}: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();
  const { colors } = useTheme();
  const styles = useStyles();
  // Edge-to-edge Android does not resize the window for the keyboard, so pad for it here on every platform.
  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <ScrollView
        {...scrollProps}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (isWide ? space.xxl : space.md),
            paddingBottom: (footer ? space.lg : insets.bottom + space.xxl) + bottomInset,
            paddingHorizontal: isWide ? space.xxxl : space.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          ) : undefined
        }
      >
        <View style={[styles.inner, { maxWidth }]}>{children}</View>
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1 },
  inner: { width: '100%', alignSelf: 'center', gap: space.lg },
}));
