import { useWindowDimensions } from 'react-native';
import { WIDE_BREAKPOINT } from './theme';

/** Phone vs desktop presentation: bottom sheets vs dialogs, bottom bar vs sidebar. */
export const useLayout = () => {
  const { width, height } = useWindowDimensions();
  return { width, height, isWide: width >= WIDE_BREAKPOINT };
};
