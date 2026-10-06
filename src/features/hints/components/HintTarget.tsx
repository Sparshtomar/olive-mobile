import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useHints } from '../stores/hints';

export interface HintTargetProps {
  /** Referenced by a tour step's `target`. Namespace by screen: "today.goal", "nav.log". */
  id: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Marks something a hint can point at. Measures itself in window coordinates on layout
 * and again whenever a tour starts (content may have scrolled), and forgets itself on
 * unmount so a tour never points at a ghost.
 */
export const HintTarget = ({ id, children, style }: HintTargetProps) => {
  const ref = useRef<View>(null);
  const setTarget = useHints((s) => s.setTarget);
  const active = useHints((s) => s.active);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) setTarget(id, { x, y, width, height });
    });
  }, [id, setTarget]);

  useEffect(() => {
    if (active) measure();
  }, [active, measure]);

  useEffect(() => () => setTarget(id, null), [id, setTarget]);

  return (
    <View ref={ref} onLayout={measure} style={style} collapsable={false}>
      {children}
    </View>
  );
};
