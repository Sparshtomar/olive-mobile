import { profileInputSchema, type ProfileInput, type User } from '@sparshtomar/olive-shared';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useResetProfile, useUpdateProfile } from '@/api';
import { errorMessage } from '@/lib/errors';
import { haptics } from '@/lib/haptics';
import { Button, ConfirmSheet, Field, Sheet, Text, space, toast } from '@/ui';
import { ActivityPicker, GoalPicker } from './GoalFields';
import { TargetPreview } from './TargetPreview';

const pickProfile = (u: User): ProfileInput => ({
  name: u.name,
  sex: u.sex,
  age: u.age,
  heightCm: u.heightCm,
  weightKg: u.weightKg,
  activityLevel: u.activityLevel,
  goalType: u.goalType,
  paceKgPerWeek: u.paceKgPerWeek,
});

/** Goal editing lives here instead of a profile screen — it's the only setting that matters day to day. */
export const GoalSheet = ({ user, visible, onClose }: { user: User; visible: boolean; onClose: () => void }) => {
  const [draft, setDraft] = useState<ProfileInput>(pickProfile(user));
  const [weightText, setWeightText] = useState(String(user.weightKg));
  const [confirmReset, setConfirmReset] = useState(false);
  const update = useUpdateProfile();
  const reset = useResetProfile();

  useEffect(() => {
    if (visible) {
      setDraft(pickProfile(user));
      setWeightText(String(user.weightKg));
    }
  }, [visible, user]);

  const valid = profileInputSchema.safeParse(draft);
  const weightError =
    Number.isFinite(draft.weightKg) && draft.weightKg >= 30 && draft.weightKg <= 250
      ? undefined
      : 'Enter a weight between 30 and 250 kg';

  const save = () => {
    if (!valid.success) return;
    update.mutate(
      {
        weightKg: draft.weightKg,
        activityLevel: draft.activityLevel,
        goalType: draft.goalType,
        paceKgPerWeek: draft.paceKgPerWeek,
      },
      {
        onSuccess: (u) => {
          haptics.success();
          toast.success('Goal updated', `New daily target: ${u.targets.calories} kcal`);
          onClose();
        },
        onError: (err) => toast.error("Couldn't update", errorMessage(err)),
      },
    );
  };

  return (
    <>
      <Sheet
        visible={visible && !confirmReset}
        onClose={onClose}
        title="Your goal"
        subtitle="Changes apply to today and every day after."
      >
        <Field
          label="Current weight"
          suffix="kg"
          keyboardType="decimal-pad"
          value={weightText}
          onChangeText={(t) => {
            setWeightText(t);
            setDraft((d) => ({ ...d, weightKg: Number(t.replace(',', '.')) }));
          }}
          maxLength={5}
          error={weightError}
        />
        <Text variant="label" tone="muted" style={{ marginTop: space.sm }}>
          Activity
        </Text>
        <ActivityPicker
          value={draft.activityLevel}
          onChange={(activityLevel) => setDraft((d) => ({ ...d, activityLevel }))}
        />
        <Text variant="label" tone="muted" style={{ marginTop: space.sm }}>
          Goal
        </Text>
        <GoalPicker
          goalType={draft.goalType}
          pace={draft.paceKgPerWeek}
          onChange={(goalType, paceKgPerWeek) => setDraft((d) => ({ ...d, goalType, paceKgPerWeek }))}
        />
        {valid.success ? <TargetPreview profile={valid.data} /> : null}
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          <Button
            label="Save goal"
            size="lg"
            onPress={save}
            loading={update.isPending}
            disabled={!valid.success}
            fullWidth
          />
          <Button
            label={user.isDemo ? 'Exit demo' : 'Start over'}
            variant="ghost"
            onPress={() => setConfirmReset(true)}
            fullWidth
          />
        </View>
      </Sheet>
      <ConfirmSheet
        visible={confirmReset}
        title={user.isDemo ? 'Exit the demo?' : 'Start over?'}
        body={
          user.isDemo
            ? "Riya's sample data will be cleared and you can set up your own profile."
            : 'This permanently deletes your profile, meals and reports from Olive.'
        }
        confirmLabel={user.isDemo ? 'Exit demo' : 'Delete everything'}
        destructive
        loading={reset.isPending}
        onConfirm={() =>
          reset.mutate(undefined, {
            onError: (err) => toast.error("Couldn't reset", errorMessage(err)),
          })
        }
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
};
