import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { alpha, radius, useTheme } from '@/ui';

/**
 * A floating pill of frosted glass: the content behind it blurs through a translucent
 * surface with a hairline highlight edge. The shadow lives on an outer wrapper because
 * the blur layer has to clip its corners.
 */
export const GlassPill = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => {
  const { colors, scheme, shadow } = useTheme();
  const dark = scheme === 'dark';
  return (
    <View style={[styles.shadow, shadow.floating, style]}>
      <BlurView
        intensity={dark ? 45 : 70}
        tint={dark ? 'dark' : 'light'}
        experimentalBlurMethod="dimezisBlurView"
        style={styles.blur}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: alpha(colors.surface, dark ? 0.72 : 0.78),
              borderColor: alpha(colors.text, dark ? 0.1 : 0.08),
            },
          ]}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: { borderRadius: radius.pill },
  blur: { borderRadius: radius.pill, overflow: 'hidden' },
  fill: { borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row' },
});
