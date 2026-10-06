import { useState } from 'react';
import { Image, Platform, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { haptics } from '@/lib/haptics';
import { pickPhoto, prepareForAnalysis } from '@/lib/photos';
import { IconButton, PressableScale, Text, inputType, makeStyles, radius, space, toast, useTheme } from '@/ui';
import { Camera, ImagePlus, Send, X } from '@/ui/icons';

export interface ComposerProps {
  onSend: (text: string, imageUri?: string) => void;
  sending: boolean;
  /** Text to start with (a tapped suggestion). */
  initialText?: string;
}

const MAX_LENGTH = 2000;

/** Text plus an optional photo. The photo is resized on-device before it leaves the phone. */
export const Composer = ({ onSend, sending, initialText = '' }: ComposerProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const [text, setText] = useState(initialText);
  const [image, setImage] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const canSend = !sending && !preparing && (text.trim().length > 0 || !!image);

  const attach = async (source: 'camera' | 'library') => {
    haptics.tap();
    const result = await pickPhoto(source);
    if (result.status === 'denied') {
      toast.error(
        source === 'camera' ? 'Olive needs your camera' : 'Olive needs your photos',
        'Allow access in Settings to attach a photo.',
      );
      return;
    }
    if (result.status !== 'picked') return;
    setPreparing(true);
    try {
      setImage(await prepareForAnalysis(result.uri));
    } finally {
      setPreparing(false);
    }
  };

  const send = () => {
    if (!canSend) return;
    haptics.tap();
    onSend(text.trim(), image ?? undefined);
    setText('');
    setImage(null);
  };

  return (
    <View style={styles.wrap}>
      {image ? (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.preview}>
          <Image source={{ uri: image }} style={styles.thumb} accessibilityLabel="Photo to send" />
          <Text variant="caption" tone="muted" style={{ flex: 1 }}>
            Photo attached - Olive will look at it with your question.
          </Text>
          <IconButton icon={X} label="Remove photo" size={30} onPress={() => setImage(null)} />
        </Animated.View>
      ) : null}
      <View style={styles.row}>
        <IconButton icon={Camera} label="Take a photo" size={40} tone="plain" onPress={() => void attach('camera')} />
        <IconButton
          icon={ImagePlus}
          label="Attach a photo"
          size={40}
          tone="plain"
          onPress={() => void attach('library')}
        />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask Olive anything…"
          placeholderTextColor={colors.textFaint}
          multiline
          maxLength={MAX_LENGTH}
          style={[styles.input, { color: colors.text }]}
          accessibilityLabel="Message Olive"
          returnKeyType={Platform.OS === 'web' ? undefined : 'send'}
          blurOnSubmit={Platform.OS !== 'web'}
          onSubmitEditing={Platform.OS === 'web' ? undefined : send}
        />
        <PressableScale
          onPress={send}
          disabled={!canSend}
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel="Send"
          accessibilityState={{ disabled: !canSend }}
          style={[styles.send, { backgroundColor: canSend ? colors.primary : colors.surfaceMuted }]}
        >
          <Send size={18} color={canSend ? colors.textOnPrimary : colors.textFaint} strokeWidth={2.4} />
        </PressableScale>
      </View>
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  wrap: { gap: space.sm },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingLeft: space.xs,
    paddingRight: space.xs,
    paddingVertical: space.xs,
  },
  input: {
    flex: 1,
    ...inputType.body,
    maxHeight: 120,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    paddingHorizontal: space.sm,
    // The border shows focus; the web focus ring would double it.
    outlineWidth: 0,
  },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
}));
