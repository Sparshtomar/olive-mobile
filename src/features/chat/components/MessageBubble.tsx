import type { ChatMessage } from '@sparshtomar/olive-shared';
import { Image, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { chatImageUrl } from '@/api';
import { Text, fonts, makeStyles, radius, space } from '@/ui';
import { parseMarkdownLite, type Run } from '../lib/markdown';
import { OliveOrb } from './OliveOrb';

/** A message not yet confirmed by the server: shown immediately while the reply is on its way. */
export interface PendingMessage {
  id: 'pending';
  pending: true;
  role: 'user';
  content: string;
  imageUri?: string;
}

const isPending = (m: ChatMessage | PendingMessage): m is PendingMessage => 'pending' in m;

export const MessageBubble = ({ message }: { message: ChatMessage | PendingMessage }) => {
  const styles = useStyles();
  const isUser = message.role === 'user';
  const imageUri = isPending(message) ? message.imageUri : chatImageUrl(message);

  return (
    <Animated.View entering={FadeInDown.duration(220)} style={[styles.row, isUser && styles.rowUser]}>
      {!isUser ? <OliveOrb size={30} animated={false} /> : null}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} accessibilityLabel="Photo you sent" />
        ) : null}
        {message.content ? (
          isUser ? (
            <Text tone="inverse">{message.content}</Text>
          ) : (
            <RichText text={message.content} />
          )
        ) : null}
      </View>
    </Animated.View>
  );
};

const Runs = ({ runs }: { runs: Run[] }) => (
  <>
    {runs.map((r, i) =>
      r.bold ? (
        <Text key={i} style={{ fontFamily: fonts.semibold }}>
          {r.text}
        </Text>
      ) : (
        <Text key={i}>{r.text}</Text>
      ),
    )}
  </>
);

/** Assistant prose: paragraphs and bullets from the markdown-lite dialect, nothing else. */
const RichText = ({ text }: { text: string }) => {
  const styles = useStyles();
  return (
    <View style={{ gap: space.sm }}>
      {parseMarkdownLite(text).map((block, i) =>
        block.type === 'paragraph' ? (
          <Text key={i}>
            <Runs runs={block.runs} />
          </Text>
        ) : (
          <View key={i} style={{ gap: 4 }}>
            {block.items.map((item, j) => (
              <View key={j} style={styles.bullet}>
                <Text tone="primary">•</Text>
                <Text style={{ flex: 1 }}>
                  <Runs runs={item} />
                </Text>
              </View>
            ))}
          </View>
        ),
      )}
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, maxWidth: '100%' },
  rowUser: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: space.sm,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 6,
  },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  image: { width: 220, height: 165, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  bullet: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
}));
