import { toDateKey, type ProfileInput, type ProfileUpdate, type User } from '@sparshtomar/olive-shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '@/lib/http';
import { useSession } from '@/lib/session';
import { invalidateProgress, qk } from './query-keys';

export const useMe = () => {
  const userId = useSession((s) => s.userId);
  return useQuery({ queryKey: qk.me, queryFn: () => request<User>('/me'), enabled: !!userId });
};

export const useCreateUser = () => {
  const signIn = useSession((s) => s.signIn);
  const client = useQueryClient();
  return useMutation({
    mutationFn: (profile: ProfileInput) => request<User>('/users', { method: 'POST', body: profile }),
    onSuccess: (user) => {
      client.clear();
      client.setQueryData(qk.me, user);
      signIn(user.id);
    },
  });
};

export const useCreateDemoUser = () => {
  const signIn = useSession((s) => s.signIn);
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => {
      const now = new Date();
      return request<User>('/users/demo', {
        method: 'POST',
        body: {
          today: toDateKey(now),
          hour: now.getHours(),
          utcOffsetMinutes: -now.getTimezoneOffset(),
        },
        timeoutMs: 45_000,
      });
    },
    onSuccess: (user) => {
      client.clear();
      client.setQueryData(qk.me, user);
      signIn(user.id);
    },
  });
};

export const useUpdateProfile = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfileUpdate) => request<User>('/me', { method: 'PATCH', body: patch }),
    onSuccess: (user) => {
      client.setQueryData(qk.me, user);
      // Targets changed: every progress view needs fresh numbers.
      void invalidateProgress(client);
    },
  });
};

export const useResetProfile = () => {
  const signOut = useSession((s) => s.signOut);
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => request<void>('/me', { method: 'DELETE' }),
    onSuccess: () => {
      client.clear();
      signOut();
    },
  });
};
