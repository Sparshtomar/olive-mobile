import { MEAL_SLOTS, MEAL_SLOT_LABEL, slotForTime, type MealSlot } from '@sparshtomar/olive-shared';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import type { MealCapture } from '@/api';
import { relativeDay, todayKey } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useIsOnline } from '@/lib/network';
import { pickPhoto } from '@/lib/photos';
import {
  Button,
  Chip,
  Field,
  PressableScale,
  Sheet,
  StateView,
  Text,
  alpha,
  makeStyles,
  radius,
  space,
  useTheme,
} from '@/ui';
import { Camera, ImageIcon, Keyboard, Mic, WifiOff, type LucideIcon } from '@/ui/icons';
import { useLogSheet } from '../stores/log-sheet';
import { useMealDraft } from '../stores/meal-draft';
import { VoiceRecorder } from './VoiceRecorder';

type Mode = 'choose' | 'voice' | 'text' | { denied: 'camera' | 'photos' | 'microphone'; canAskAgain: boolean };

const TEXT_EXAMPLES = ['2 idli with sambar', 'Chicken biryani, half plate', 'Masala chai and 2 biscuits'];

export const LogSheet = () => {
  const { open, hide, slot: presetSlot, date, startWithText } = useLogSheet();
  const startDraft = useMealDraft((s) => s.start);
  const online = useIsOnline();
  const { colors } = useTheme();
  const styles = useStyles();
  const [mode, setMode] = useState<Mode>('choose');
  const [slot, setSlot] = useState<MealSlot>(slotForTime(new Date()));
  const [text, setText] = useState('');

  // Fresh state every time the sheet opens.
  useEffect(() => {
    if (!open) return;
    setMode(startWithText ? 'text' : 'choose');
    setText('');
    setSlot(presetSlot ?? slotForTime(new Date()));
  }, [open, presetSlot, startWithText]);

  const day = date ?? todayKey();

  const go = (capture: MealCapture) => {
    startDraft(capture, { slot, date: day });
    hide();
    router.push('/meal/new');
  };

  const fromPhoto = async (source: 'camera' | 'library') => {
    haptics.tap();
    const result = await pickPhoto(source);
    if (result.status === 'picked') go({ kind: 'photo', uri: result.uri });
    if (result.status === 'denied')
      setMode({ denied: source === 'camera' ? 'camera' : 'photos', canAskAgain: result.canAskAgain });
  };

  const submitText = () => {
    if (text.trim().length < 2) return;
    go({ kind: 'text', text: text.trim() });
  };

  const title = mode === 'text' ? 'Type what you ate' : mode === 'voice' ? undefined : 'Log a meal';
  const subtitle =
    typeof mode === 'string' && mode !== 'voice' ? `${MEAL_SLOT_LABEL[slot]} · ${relativeDay(day)}` : undefined;

  return (
    <Sheet visible={open} onClose={hide} title={title} subtitle={subtitle}>
      {!online ? (
        <StateView
          art={<WifiOff size={36} color={colors.textMuted} />}
          title="You're offline"
          body="Olive needs a connection to understand your meal. Everything you've logged is still here."
          action={{ label: 'OK', onPress: hide }}
        />
      ) : typeof mode === 'object' ? (
        <StateView
          title={`Olive needs your ${mode.denied}`}
          body={
            mode.canAskAgain
              ? `Allow ${mode.denied} access to log meals this way. Or type it - that works too.`
              : `${mode.denied[0]!.toUpperCase()}${mode.denied.slice(1)} access is turned off for Olive. You can turn it on in Settings.`
          }
          action={
            mode.canAskAgain
              ? { label: 'Try again', onPress: () => setMode('choose') }
              : { label: 'Open Settings', onPress: () => void Linking.openSettings() }
          }
          secondaryAction={{ label: 'Type instead', onPress: () => setMode('text') }}
        />
      ) : mode === 'voice' ? (
        <VoiceRecorder
          onRecorded={(uri, mimeType) => go({ kind: 'voice', uri, mimeType })}
          onPermissionDenied={(canAskAgain) => setMode({ denied: 'microphone', canAskAgain })}
          onCancel={() => setMode('choose')}
        />
      ) : mode === 'text' ? (
        <View style={{ gap: space.md }}>
          <Field
            placeholder="e.g. 2 rotis, dal and a bowl of curd"
            value={text}
            onChangeText={setText}
            autoFocus
            multiline
            maxLength={500}
            onSubmitEditing={submitText}
            blurOnSubmit
            returnKeyType="send"
            style={{ minHeight: 72, textAlignVertical: 'top' }}
            accessibilityLabel="What did you eat?"
          />
          <View style={styles.wrapRow}>
            {TEXT_EXAMPLES.map((e) => (
              <Chip key={e} label={e} onPress={() => setText(e)} />
            ))}
          </View>
          <Button label="Analyse" size="lg" onPress={submitText} disabled={text.trim().length < 2} fullWidth />
          <Button label="Back" variant="ghost" onPress={() => setMode('choose')} />
        </View>
      ) : (
        <View style={{ gap: space.lg }}>
          <View style={styles.wrapRow} accessibilityRole="radiogroup" accessibilityLabel="Meal">
            {MEAL_SLOTS.map((s) => (
              <Chip key={s} label={MEAL_SLOT_LABEL[s]} selected={slot === s} onPress={() => setSlot(s)} />
            ))}
          </View>
          <View style={styles.grid}>
            <Tile
              icon={Camera}
              title="Snap it"
              hint="Photo of your plate"
              onPress={() => fromPhoto('camera')}
              primary
            />
            <Tile icon={Mic} title="Say it" hint="Describe it out loud" onPress={() => setMode('voice')} />
            <Tile icon={ImageIcon} title="From gallery" hint="A photo you took" onPress={() => fromPhoto('library')} />
            <Tile icon={Keyboard} title="Type it" hint="A quick sentence" onPress={() => setMode('text')} />
          </View>
          <Text variant="caption" tone="faint" align="center">
            Olive estimates portions and nutrition. You'll review everything before it's saved.
          </Text>
        </View>
      )}
    </Sheet>
  );
};

const Tile = ({
  icon: Icon,
  title,
  hint,
  onPress,
  primary,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  onPress: () => void;
  primary?: boolean;
}) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.tile, primary && styles.tilePrimary]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}`}
    >
      <View style={[styles.tileIcon, primary && { backgroundColor: alpha(colors.textOnPrimary, 0.18) }]}>
        <Icon size={22} color={primary ? colors.textOnPrimary : colors.primary} strokeWidth={2.2} />
      </View>
      <Text variant="bodyStrong" tone={primary ? 'inverse' : 'default'}>
        {title}
      </Text>
      <Text variant="caption" style={{ color: primary ? alpha(colors.textOnPrimary, 0.8) : colors.textMuted }}>
        {hint}
      </Text>
    </PressableScale>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 120,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 2,
  },
  tilePrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
}));
