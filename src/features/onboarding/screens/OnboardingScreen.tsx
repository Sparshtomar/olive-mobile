import { profileFieldsSchema, type ProfileInput } from '@sparshtomar/olive-shared';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, type TextInput, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateDemoUser, useCreateUser } from '@/api';
import { ActivityPicker, GoalPicker, TargetPreview } from '@/features/goal';
import { errorMessage } from '@/lib/errors';
import { haptics } from '@/lib/haptics';
import { useIsOnline } from '@/lib/network';
import { Button, Field, IconButton, Olive, Segmented, Text, makeStyles, space, toast, useLayout } from '@/ui';
import { ArrowLeft, Sparkles } from '@/ui/icons';
import { STEPS, parseNumber, validateStep, type Draft, type FieldErrors, type Step } from '../lib/steps';

export const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();
  const styles = useStyles();
  const online = useIsOnline();
  const [step, setStep] = useState<Step>('intro');
  const [draft, setDraft] = useState<Draft>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  // Number inputs keep their raw text so "65." can be typed on the way to "65.5".
  const [raw, setRaw] = useState({ age: '', heightCm: '', weightKg: '' });
  const setNumber = (key: keyof typeof raw) => (text: string) => {
    setRaw((r) => ({ ...r, [key]: text }));
    update({ [key]: parseNumber(text) });
  };
  const createUser = useCreateUser();
  const createDemo = useCreateDemoUser();
  const ageRef = useRef<TextInput>(null);
  const heightRef = useRef<TextInput>(null);
  const weightRef = useRef<TextInput>(null);

  const index = STEPS.indexOf(step);
  const update = (patch: Draft) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch) as (keyof ProfileInput)[]) delete next[k];
      return next;
    });
  };

  const next = () => {
    if (step === 'intro') return setStep('name');
    const stepErrors = validateStep(step, draft);
    if (Object.keys(stepErrors).length) {
      haptics.warning();
      return setErrors(stepErrors);
    }
    haptics.tap();
    if (step === 'goal') return submit();
    setStep(STEPS[index + 1]!);
  };

  const back = () => setStep(STEPS[Math.max(0, index - 1)]!);

  const submit = () =>
    createUser.mutate(draft as ProfileInput, {
      onSuccess: () => haptics.success(),
      onError: (err) => toast.error("Couldn't save your profile", errorMessage(err)),
    });

  const startDemo = () =>
    createDemo.mutate(undefined, {
      onSuccess: () => toast.success('Meet Riya', 'Two weeks of meals and two lab reports are loaded. Poke around!'),
      onError: (err) => toast.error("Couldn't load the demo", errorMessage(err)),
    });

  const completeProfile = profileFieldsSchema.safeParse(draft).success ? (draft as ProfileInput) : null;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.frame, { paddingTop: insets.top + space.md }, isWide && styles.frameWide]}>
        {step !== 'intro' ? (
          <View style={styles.topBar}>
            <IconButton icon={ArrowLeft} label="Back" onPress={back} size={38} />
            <View style={styles.dots} accessibilityLabel={`Step ${index} of ${STEPS.length - 1}`}>
              {STEPS.slice(1).map((s, i) => (
                <View key={s} style={[styles.dot, i < index && styles.dotOn]} />
              ))}
            </View>
            <View style={{ width: 38 }} />
          </View>
        ) : null}

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View
            key={step}
            entering={FadeInRight.duration(260)}
            exiting={FadeOutLeft.duration(160)}
            style={{ gap: space.lg, flex: step === 'intro' ? 1 : undefined }}
          >
            {step === 'intro' ? (
              <View style={styles.intro}>
                <Olive size={150} mood="happy" />
                <Text variant="display" align="center">
                  Hi, I'm Olive
                </Text>
                <Text tone="muted" align="center" style={{ maxWidth: 340 }}>
                  Snap, say or type what you eat — I'll do the counting, and connect it to what your lab reports say.
                </Text>
              </View>
            ) : null}

            {step === 'name' ? (
              <>
                <Heading title="What should I call you?" />
                <Field
                  placeholder="Your first name"
                  value={draft.name ?? ''}
                  onChangeText={(name) => update({ name })}
                  autoFocus
                  autoCapitalize="words"
                  autoComplete="given-name"
                  returnKeyType="next"
                  onSubmitEditing={next}
                  maxLength={40}
                  error={errors.name}
                  accessibilityLabel="First name"
                />
              </>
            ) : null}

            {step === 'body' ? (
              <>
                <Heading
                  title={`Nice to meet you, ${draft.name}`}
                  subtitle="A few basics to work out how much energy your body uses."
                />
                <View style={{ gap: space.xs }}>
                  <Segmented
                    accessibilityLabel="Sex"
                    value={draft.sex}
                    onChange={(sex) => update({ sex })}
                    options={[
                      { value: 'female', label: 'Female' },
                      { value: 'male', label: 'Male' },
                    ]}
                  />
                  {errors.sex ? (
                    <Text variant="caption" tone="danger">
                      {errors.sex}
                    </Text>
                  ) : null}
                </View>
                <Field
                  ref={ageRef}
                  label="Age"
                  suffix="years"
                  keyboardType="number-pad"
                  value={raw.age}
                  onChangeText={setNumber('age')}
                  returnKeyType="next"
                  onSubmitEditing={() => heightRef.current?.focus()}
                  maxLength={3}
                  error={errors.age}
                />
                <Field
                  ref={heightRef}
                  label="Height"
                  suffix="cm"
                  keyboardType="decimal-pad"
                  value={raw.heightCm}
                  onChangeText={setNumber('heightCm')}
                  returnKeyType="next"
                  onSubmitEditing={() => weightRef.current?.focus()}
                  maxLength={5}
                  error={errors.heightCm}
                />
                <Field
                  ref={weightRef}
                  label="Weight"
                  suffix="kg"
                  keyboardType="decimal-pad"
                  value={raw.weightKg}
                  onChangeText={setNumber('weightKg')}
                  returnKeyType="done"
                  onSubmitEditing={next}
                  maxLength={5}
                  error={errors.weightKg}
                />
              </>
            ) : null}

            {step === 'activity' ? (
              <>
                <Heading title="How active is a normal week?" subtitle="Be honest — you can change this anytime." />
                <ActivityPicker value={draft.activityLevel} onChange={(activityLevel) => update({ activityLevel })} />
                {errors.activityLevel ? (
                  <Text variant="caption" tone="danger">
                    {errors.activityLevel}
                  </Text>
                ) : null}
              </>
            ) : null}

            {step === 'goal' ? (
              <>
                <Heading title="What are we working towards?" />
                <GoalPicker
                  goalType={draft.goalType}
                  pace={draft.paceKgPerWeek}
                  onChange={(goalType, paceKgPerWeek) => update({ goalType, paceKgPerWeek })}
                />
                {errors.goalType ? (
                  <Text variant="caption" tone="danger">
                    {errors.goalType}
                  </Text>
                ) : null}
                {completeProfile ? <TargetPreview profile={completeProfile} /> : null}
              </>
            ) : null}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
          {step === 'intro' ? (
            <>
              <Button label="Set my goal" size="lg" onPress={next} fullWidth />
              <Button
                label="Explore with demo data"
                icon={Sparkles}
                variant="ghost"
                size="lg"
                onPress={startDemo}
                loading={createDemo.isPending}
                disabled={!online}
                fullWidth
                accessibilityHint="Loads two weeks of a sample user's meals and lab reports"
              />
              {!online ? (
                <Text variant="caption" tone="warm" align="center">
                  You're offline. Olive needs a connection to get started.
                </Text>
              ) : null}
            </>
          ) : (
            <Button
              label={step === 'goal' ? "Let's go" : 'Continue'}
              size="lg"
              onPress={next}
              loading={createUser.isPending}
              disabled={step === 'goal' && !online}
              fullWidth
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const Heading = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={{ gap: space.xs }}>
    <Text variant="title" accessibilityRole="header">
      {title}
    </Text>
    {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
  </View>
);

const useStyles = makeStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.bg },
  frame: { flex: 1, width: '100%', alignSelf: 'center', paddingHorizontal: space.xl },
  frameWide: { maxWidth: 520 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 24, height: 5, borderRadius: 3, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.primary },
  scroll: { flexGrow: 1, paddingBottom: space.xl },
  intro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  footer: { gap: space.sm, paddingTop: space.md },
}));
