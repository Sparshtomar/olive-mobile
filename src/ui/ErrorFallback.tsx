import { StyleSheet, View } from 'react-native';
import { Olive } from './Olive';
import { StateView } from './StateView';
import { colors, space } from './theme';

export interface ErrorFallbackProps {
  error: Error;
  retry: () => void | Promise<void>;
}

/**
 * Last line of defence for a render error: a calm screen with a way back, instead of a
 * white screen. Saved data lives on the server and in the query cache, so nothing is lost.
 */
export const ErrorFallback = ({ error, retry }: ErrorFallbackProps) => (
  <View style={styles.wrap}>
    <StateView
      art={<Olive mood="concerned" size={110} animated={false} />}
      title="Something broke on Olive's side"
      body={__DEV__ ? error.message : 'Your data is safe. Try again, and if it keeps happening, restart the app.'}
      action={{ label: 'Try again', onPress: () => void retry() }}
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', backgroundColor: colors.bg, padding: space.lg },
});
