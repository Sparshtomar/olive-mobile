import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { haptics } from '@/lib/haptics';
import { Button, PressableScale, Text, makeStyles, space, useTheme } from '@/ui';
import { Mic, Square } from '@/ui/icons';

const MAX_SECONDS = 30;
const MIN_MILLIS = 1200;

/** Speech doesn't need studio quality: mono 64 kbps keeps a 30 s note under 250 KB. */
const VOICE_PRESET: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  bitRate: 64_000,
  isMeteringEnabled: true,
};

export interface VoiceRecorderProps {
  onRecorded: (uri: string, mimeType: string) => void;
  onPermissionDenied: (canAskAgain: boolean) => void;
  onCancel: () => void;
}

export const VoiceRecorder = ({ onRecorded, onPermissionDenied, onCancel }: VoiceRecorderProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const recorder = useAudioRecorder(VOICE_PRESET);
  const state = useAudioRecorderState(recorder, 100);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const stopping = useRef(false);

  const seconds = Math.floor(state.durationMillis / 1000);
  // Metering is in dBFS (-160…0). Speech sits roughly between -50 and -10.
  const level = state.isRecording ? Math.min(Math.max(((state.metering ?? -60) + 50) / 40, 0), 1) : 0;

  const start = async () => {
    setError(null);
    setStarting(true);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) return onPermissionDenied(permission.canAskAgain);
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      haptics.impact();
    } catch {
      setError("Couldn't start the microphone. Try again, or type it instead.");
    } finally {
      setStarting(false);
    }
  };

  const stop = async () => {
    if (stopping.current) return;
    stopping.current = true;
    const duration = state.durationMillis;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      haptics.tap();
      if (duration < MIN_MILLIS || !recorder.uri) {
        setError('That was a bit short - hold on and describe your meal.');
        return;
      }
      onRecorded(recorder.uri, Platform.OS === 'web' ? 'audio/webm' : 'audio/mp4');
    } finally {
      stopping.current = false;
    }
  };

  // Hard stop so a forgotten recording can't run forever.
  useEffect(() => {
    if (state.isRecording && state.durationMillis >= MAX_SECONDS * 1000) void stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isRecording, state.durationMillis]);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 + level * 0.45, { damping: 12, stiffness: 180 }) }],
    opacity: state.isRecording ? 0.35 : 0,
  }));

  return (
    <View style={styles.wrap}>
      <Text variant="heading" align="center">
        {state.isRecording ? 'Listening…' : 'Tell Olive what you ate'}
      </Text>
      <Text tone="muted" align="center" style={{ maxWidth: 320 }}>
        {state.isRecording
          ? `0:${String(seconds).padStart(2, '0')} / 0:${MAX_SECONDS} · tap to finish`
          : '"Two rotis, a bowl of dal and some curd" - portions help.'}
      </Text>

      <View style={styles.micArea}>
        <Animated.View style={[styles.ring, ring]} />
        <PressableScale
          onPress={state.isRecording ? stop : start}
          disabled={starting}
          scaleTo={0.92}
          style={[styles.mic, state.isRecording && { backgroundColor: colors.warm }]}
          accessibilityRole="button"
          accessibilityLabel={state.isRecording ? 'Stop recording' : 'Start recording'}
        >
          {state.isRecording ? (
            <Square size={30} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
          ) : (
            <Mic size={36} color={colors.textOnPrimary} strokeWidth={2.2} />
          )}
        </PressableScale>
      </View>

      {error ? (
        <Text tone="warm" align="center" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      <Button label="Back" variant="ghost" onPress={onCancel} disabled={state.isRecording} />
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  wrap: { alignItems: 'center', gap: space.sm, paddingVertical: space.md },
  micArea: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginVertical: space.lg },
  ring: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: colors.warm },
  mic: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
