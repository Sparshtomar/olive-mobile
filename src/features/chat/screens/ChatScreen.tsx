import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatMessages, useDay, useMarkers, useSendMessage } from '@/api';
import { errorMessage } from '@/lib/errors';
import { todayKey } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { IconButton, Skeleton, Text, makeStyles, radius, space, toast, useLayout } from '@/ui';
import { ArrowLeft } from '@/ui/icons';
import { Composer } from '../components/Composer';
import { MessageBubble, type PendingMessage } from '../components/MessageBubble';
import { OliveOrb } from '../components/OliveOrb';
import { SuggestionChips } from '../components/SuggestionChips';
import { TypingIndicator } from '../components/TypingIndicator';
import { suggestionsFor } from '../lib/suggestions';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/ask'));

const HINTS = ['Reading your reports…', 'Checking today’s meals…', 'Thinking it through…'];

/**
 * One conversation. `id` is "new" until the first reply, then the route params are
 * updated in place so the screen never remounts and the thread stays scrolled.
 */
export const ChatScreen = () => {
  const { id, q } = useLocalSearchParams<{ id: string; q?: string }>();
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();
  const styles = useStyles();
  const [conversationId, setConversationId] = useState<string | undefined>(id === 'new' ? undefined : id);
  const messages = useChatMessages(conversationId);
  const send = useSendMessage();
  const markers = useMarkers();
  const day = useDay(todayKey());
  const [pending, setPending] = useState<PendingMessage | null>(null);
  const [hint, setHint] = useState(HINTS[0]!);
  const scroll = useRef<ScrollView>(null);
  const autoSent = useRef(false);

  const ask = (text: string, imageUri?: string) => {
    setPending({ id: 'pending', pending: true, role: 'user', content: text, imageUri });
    send.mutate(
      { conversationId, text, today: todayKey(), imageUri },
      {
        onSuccess: (reply) => {
          haptics.tap();
          setPending(null);
          if (!conversationId) {
            setConversationId(reply.conversation.id);
            router.setParams({ id: reply.conversation.id, q: undefined });
          }
        },
        onError: (err) => {
          setPending(null);
          toast.error("Olive couldn't answer", errorMessage(err) ?? 'Please try again');
        },
      },
    );
  };

  // A suggestion tapped on the Ask tab or Today arrives as `q` and is asked straight away.
  useEffect(() => {
    if (q && !autoSent.current && id === 'new') {
      autoSent.current = true;
      ask(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, id]);

  // Rotate the "thinking" line so a long answer never looks stuck.
  useEffect(() => {
    if (!send.isPending) return;
    let i = 0;
    const timer = setInterval(() => setHint(HINTS[(i = (i + 1) % HINTS.length)]!), 2200);
    return () => clearInterval(timer);
  }, [send.isPending]);

  const thread = messages.data ?? [];
  const empty = !conversationId && !pending;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <IconButton icon={ArrowLeft} label="Back" onPress={goBack} />
        <OliveOrb size={36} animated={send.isPending} />
        <View style={{ flex: 1 }}>
          <Text variant="subheading" accessibilityRole="header">
            Olive
          </Text>
          <Text variant="caption" tone="muted">
            {send.isPending ? 'Thinking…' : 'Knows your reports and meals'}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scroll}
        contentContainerStyle={[styles.thread, { paddingHorizontal: isWide ? space.xxxl : space.lg }]}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inner, isWide && { maxWidth: 760 }]}>
          {empty ? (
            <View style={styles.empty}>
              <OliveOrb size={72} />
              <Text variant="heading" align="center">
                What would you like to know?
              </Text>
              <Text tone="muted" align="center" style={{ maxWidth: 340 }}>
                Ask about a lab value, today's meals, or send a photo of a plate.
              </Text>
              <SuggestionChips
                suggestions={suggestionsFor({ markers: markers.data, day: day.data })}
                onPick={(s) => ask(s)}
              />
            </View>
          ) : null}
          {conversationId && messages.isLoading && !messages.data ? (
            <View style={{ gap: space.md }}>
              <Skeleton width="70%" height={56} rounded={radius.lg} />
              <Skeleton width="55%" height={44} rounded={radius.lg} style={{ alignSelf: 'flex-end' }} />
              <Skeleton width="80%" height={90} rounded={radius.lg} />
            </View>
          ) : null}
          {thread.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {pending ? <MessageBubble message={pending} /> : null}
          {send.isPending ? <TypingIndicator hint={hint} /> : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.composer,
          { paddingBottom: insets.bottom + space.sm, paddingHorizontal: isWide ? space.xxxl : space.md },
        ]}
      >
        <View style={[styles.inner, isWide && { maxWidth: 760 }]}>
          <Composer onSend={ask} sending={send.isPending} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thread: { flexGrow: 1, paddingVertical: space.lg },
  inner: { width: '100%', alignSelf: 'center', gap: space.md },
  empty: { alignItems: 'center', gap: space.md, paddingTop: space.xl, paddingBottom: space.lg },
  composer: { paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
}));
