import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { haptics } from '@/lib/haptics';
import { useIsOnline } from '@/lib/network';
import { pickPhoto, prepareDocumentPhoto } from '@/lib/photos';
import { Button, Sheet, StateView, Text, space } from '@/ui';
import { Camera, FileText } from '@/ui/icons';
import { useReportDraft } from '../stores/report-draft';

const MAX_MB = 15;

export const UploadReportSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const start = useReportDraft((s) => s.start);
  const online = useIsOnline();
  const [problem, setProblem] = useState<{ title: string; body: string; settings?: boolean } | null>(null);

  const close = () => {
    setProblem(null);
    onClose();
  };

  const go = (file: { uri: string; name: string; mimeType: string }) => {
    start(file);
    close();
    router.push('/report/new');
  };

  const fromCamera = async () => {
    haptics.tap();
    const result = await pickPhoto('camera');
    if (result.status === 'denied') {
      return setProblem({
        title: 'Olive needs your camera',
        body: result.canAskAgain
          ? 'Allow camera access to photograph your report.'
          : 'Camera access is off. Turn it on in Settings, or upload the PDF instead.',
        settings: !result.canAskAgain,
      });
    }
    if (result.status === 'picked') {
      go({ uri: await prepareDocumentPhoto(result.uri), name: 'report.jpg', mimeType: 'image/jpeg' });
    }
  };

  const fromFiles = async () => {
    haptics.tap();
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;
    if (asset.size && asset.size > MAX_MB * 1024 * 1024) {
      return setProblem({
        title: 'That file is too big',
        body: `Reports up to ${MAX_MB} MB work. Try exporting just the results pages.`,
      });
    }
    go({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/pdf' });
  };

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title="Add a lab report"
      subtitle="Blood tests, lipid profile, HbA1c, thyroid, vitamins…"
    >
      {!online ? (
        <StateView
          title="You're offline"
          body="Reading a report needs a connection. Your saved reports are still here."
        />
      ) : problem ? (
        <StateView
          title={problem.title}
          body={problem.body}
          action={
            problem.settings
              ? { label: 'Open Settings', onPress: () => void Linking.openSettings() }
              : { label: 'Try again', onPress: () => setProblem(null) }
          }
        />
      ) : (
        <View style={{ gap: space.sm }}>
          <Button label="Upload PDF or image" icon={FileText} size="lg" onPress={fromFiles} fullWidth />
          <Button label="Take a photo" icon={Camera} variant="secondary" size="lg" onPress={fromCamera} fullWidth />
          <Text variant="caption" tone="faint" align="center" style={{ marginTop: space.sm }}>
            Olive reads the values, then you check them before anything is saved. Olive isn't a doctor - talk to yours
            about results.
          </Text>
        </View>
      )}
    </Sheet>
  );
};
