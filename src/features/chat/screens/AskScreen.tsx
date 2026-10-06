import type { ChatConversation } from '@sparshtomar/olive-shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useConversations, useDay, useDeleteConversation, useMarkers } from '@/api';
import { errorMessage } from '@/lib/errors';
import { todayKey } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import {
  Button,
  ConfirmSheet,
  IconButton,
  ListGroup,
  ListRow,
  Screen,
  SectionHeader,
  Skeleton,
  TAB_BAR_CLEARANCE,
  Text,
  radius,
  space,
  toast,
} from '@/ui';
import { MessageCircle, Plus, Trash2 } from '@/ui/icons';
import { OliveOrb } from '../components/OliveOrb';
import { SuggestionChips } from '../components/SuggestionChips';
import { previewOf } from '../lib/markdown';
import { suggestionsFor } from '../lib/suggestions';

const openChat = (id: string, q?: string) => router.push({ pathname: '/chat/[id]', params: q ? { id, q } : { id } });

/** The Ask tab: a way in, questions that fit today, and every past conversation. */
export const AskScreen = () => {
  const conversations = useConversations();
  const markers = useMarkers();
  const day = useDay(todayKey());
  const remove = useDeleteConversation();
  const [toDelete, setToDelete] = useState<ChatConversation | null>(null);

  const refresh = () => Promise.all([conversations.refetch(), markers.refetch()]);
  const suggestions = suggestionsFor({ markers: markers.data, day: day.data });

  return (
    <>
      <Screen
        onRefresh={refresh}
        refreshing={conversations.isRefetching}
        bottomInset={TAB_BAR_CLEARANCE}
        maxWidth={720}
      >
        <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.lg }}>
          <OliveOrb size={88} />
          <Text variant="title" align="center" accessibilityRole="header">
            Ask Olive
          </Text>
          <Text tone="muted" align="center" style={{ maxWidth: 360 }}>
            She knows your meals, your targets and every lab marker you've uploaded - ask about any of it, or send a
            photo of a plate.
          </Text>
          <Button label="New chat" icon={Plus} onPress={() => openChat('new')} />
        </View>

        <View style={{ gap: space.md }}>
          <SectionHeader title="Try asking" subtitle="Based on your reports and today" />
          <SuggestionChips suggestions={suggestions} onPick={(q) => openChat('new', q)} />
        </View>

        <View style={{ gap: space.md }}>
          <SectionHeader
            title="Recent chats"
            subtitle={conversations.data?.length ? `${conversations.data.length} saved` : 'Saved to your account'}
          />
          {conversations.isLoading && !conversations.data ? (
            <View style={{ gap: space.sm }}>
              <Skeleton height={64} rounded={radius.lg} />
              <Skeleton height={64} rounded={radius.lg} />
            </View>
          ) : conversations.data?.length ? (
            <ListGroup>
              {conversations.data.map((c) => (
                <ListRow
                  key={c.id}
                  icon={MessageCircle}
                  title={c.title}
                  subtitle={c.lastMessage ? previewOf(c.lastMessage) : 'No messages yet'}
                  onPress={() => openChat(c.id)}
                  accessibilityHint="Opens this conversation"
                  trailing={
                    <IconButton
                      icon={Trash2}
                      label={`Delete chat ${c.title}`}
                      size={32}
                      onPress={() => setToDelete(c)}
                    />
                  }
                />
              ))}
            </ListGroup>
          ) : (
            <Text variant="caption" tone="faint">
              Your conversations will appear here.
            </Text>
          )}
        </View>
      </Screen>

      <ConfirmSheet
        visible={!!toDelete}
        title="Delete this chat?"
        body="Olive will forget this conversation. Your meals and reports are not affected."
        confirmLabel="Delete chat"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          toDelete &&
          remove.mutate(toDelete.id, {
            onSuccess: () => {
              haptics.success();
              setToDelete(null);
            },
            onError: (err) => toast.error("Couldn't delete", errorMessage(err)),
          })
        }
        onCancel={() => setToDelete(null)}
      />
    </>
  );
};
