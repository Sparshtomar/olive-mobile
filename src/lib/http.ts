import { USER_ID_HEADER, type ApiErrorBody } from '@sparshtomar/olive-shared';
import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { ApiError } from './api-error';
import { API_URL } from './config';
import { useSession } from './session';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  form?: FormData;
  timeoutMs?: number;
}

export const request = async <T>(
  path: string,
  { method = 'GET', body, form, timeoutMs = 20_000 }: RequestOptions = {},
) => {
  const userId = useSession.getState().userId;
  const headers: Record<string, string> = { accept: 'application/json' };
  if (userId) headers[USER_ID_HEADER] = userId;
  if (body !== undefined) headers['content-type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted)
      throw new ApiError('TIMEOUT', 'That took too long. Check your connection and try again.');
    throw new ApiError('NETWORK', "Can't reach Olive. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) return undefined as T;
  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (json as ApiErrorBody | null)?.error;
    throw new ApiError(error?.code ?? 'INTERNAL', error?.message ?? 'Something went wrong', response.status);
  }
  return json as T;
};

/** Absolute URL for API-relative paths like `/meals/:id/photo`. */
export const apiUrl = (path: string) => `${API_URL}${path}`;

/** Appends a local file to FormData in the shape each platform's fetch expects. */
export const appendFile = async (form: FormData, field: string, file: { uri: string; name: string; type: string }) => {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    form.append(field, blob, file.name);
  } else {
    // expo/fetch serialises a part that is a string, a Blob, or an object with `bytes()`. React
    // Native's `{ uri }` parts are not accepted, and this SDK's File has arrayBuffer() but not
    // bytes(), so read the file and hand over the smallest object the serialiser understands.
    const bytes = new Uint8Array(await new File(file.uri).arrayBuffer());
    const part = { name: file.name, type: file.type, size: bytes.byteLength, bytes: async () => bytes };
    form.append(field, part as unknown as Blob, file.name);
  }
};
