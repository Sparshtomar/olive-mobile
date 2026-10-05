import { useMutation } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { analyzeReport, useMe } from '@/api';
import { describeError } from '@/lib/errors';
import { IconButton, Olive, Screen, StateView, Text, space } from '@/ui';
import { ArrowLeft } from '@/ui/icons';
import { AnalyzingReport } from '../components/AnalyzingReport';
import { ReportReview } from '../components/ReportReview';
import { useReportDraft } from '../stores/report-draft';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/reports'));

/** Upload → AI extraction → review. The picked file arrives through the draft store, not route params. */
export const NewReportScreen = () => {
  const file = useReportDraft((s) => s.file);
  const me = useMe();
  const analysis = useMutation({ mutationFn: analyzeReport });
  const started = useRef(false);

  useEffect(() => {
    if (file && !started.current) {
      started.current = true;
      analysis.mutate(file);
    }
  }, [file, analysis]);

  if (!file) return <Redirect href="/reports" />;

  if (analysis.isSuccess && me.data) {
    return <ReportReview draft={analysis.data} sex={me.data.sex} onLeave={goBack} />;
  }

  const error = analysis.isError ? describeError(analysis.error) : null;
  return (
    <Screen maxWidth={640}>
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} label="Back" onPress={goBack} />
        <Text variant="heading">{error ? 'Not quite' : 'Reading your report'}</Text>
      </View>
      {error ? (
        <StateView
          art={<Olive mood={error.mood} size={110} />}
          title={error.title}
          body={error.body}
          action={
            error.retryable
              ? { label: 'Try again', onPress: () => analysis.mutate(file) }
              : { label: 'Choose another file', onPress: goBack }
          }
        />
      ) : (
        <AnalyzingReport />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
