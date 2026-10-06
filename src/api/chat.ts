import type { ChatConversation, ChatMessage, ChatReply, SendChatMessageInput } from '@sparshtomar/olive-shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiUrl, appendFile, request } from '@/lib/http';
import { qk } from './query-keys';

/** A model turn, with history and maybe a photo, can take a while. */
const REPLY_TIMEOUT = 60_000;

export type SendTurn = SendChatMessageInput & {
  /** Local URI of an already-resized JPEG to attach. */
  imageUri?: string;
};

export const sendChatMessage = async ({ imageUri, ...input }: SendTurn): Promise<ChatReply> => {
  if (!imageUri) {
    return request<ChatReply>('/chat/messages', { method: 'POST', body: input, timeoutMs: REPLY_TIMEOUT });
  }
  const form = new FormData();
  form.append('text', input.text);
  form.append('today', input.today);
  if (input.conversationId) form.append('conversationId', input.conversationId);
  await appendFile(form, 'file', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' });
  return request<ChatReply>('/chat/messages/photo', { method: 'POST', form, timeoutMs: REPLY_TIMEOUT });
};

/** Absolute URL of a message's attached image (the API returns it as a relative path). */
export const chatImageUrl = (message: Pick<ChatMessage, 'imageUrl'>) =>
  message.imageUrl ? apiUrl(message.imageUrl) : null;

export const useConversations = () =>
  useQuery({ queryKey: qk.chats, queryFn: () => request<ChatConversation[]>('/chat') });

export const useChatMessages = (conversationId: string | undefined) =>
  useQuery({
    queryKey: qk.chat(conversationId ?? 'new'),
    queryFn: () => request<ChatMessage[]>(`/chat/${conversationId}/messages`),
    enabled: !!conversationId,
  });

/** Sends a turn; the reply appends both messages to the thread cache and refreshes the list. */
export const useSendMessage = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (reply) => {
      client.setQueryData<ChatMessage[]>(qk.chat(reply.conversation.id), (old) => [
        ...(old ?? []),
        reply.userMessage,
        reply.assistantMessage,
      ]);
      return client.invalidateQueries({ queryKey: qk.chats });
    },
  });
};

export const useDeleteConversation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<void>(`/chat/${id}`, { method: 'DELETE' }),
    onSuccess: (_void, id) => {
      client.removeQueries({ queryKey: qk.chat(id) });
      return client.invalidateQueries({ queryKey: qk.chats });
    },
  });
};
