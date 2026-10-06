import { requireOptionalNativeModule } from 'expo';
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { alpha, radius, useTheme } from '@/ui';

/**
 * Blur needs expo-blur's native code. A client built before it was added (or Expo Go
 * without it) would crash on the view, so fall back to a plain translucent pill there.
 */
const canBlur = Platform.OS === 'web' || requireOptionalNativeModule('ExpoBlur') !== null;

/**
 * A floating pill of frosted glass: the content behind it blurs through a translucent
 * surface with a hairline highlight edge. The shadow lives on an outer wrapper because
 * the blur layer has to clip its corners.
 */
export const GlassPill = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => {
  const { colors, scheme, shadow } = useTheme();
  const dark = scheme === 'dark';
  const fill = (
    <View
      style={[
        styles.fill,
        {
          // Without blur the surface has to carry more of the weight.
          backgroundColor: alpha(colors.surface, canBlur ? 0.88 : 0.96),
          borderColor: alpha(colors.text, dark ? 0.1 : 0.08),
        },
      ]}
    >
      {children}
    </View>
  );
  return (
    <View style={[styles.shadow, shadow.floating, style]}>
      {canBlur ? (
        <BlurView
          intensity={dark ? 45 : 70}
          tint={dark ? 'dark' : 'light'}
          experimentalBlurMethod="dimezisBlurView"
          style={styles.blur}
        >
          {fill}
        </BlurView>
      ) : (
        <View style={styles.blur}>{fill}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: { borderRadius: radius.pill },
  blur: { borderRadius: radius.pill, overflow: 'hidden' },
  fill: { borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row' },
});
