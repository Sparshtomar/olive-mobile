import type { MarkerStatus } from '@sparshtomar/olive-shared';

type Tone = 'good' | 'warm' | 'neutral';

export const STATUS_LABEL: Record<MarkerStatus, string> = { low: 'Low', normal: 'In range', high: 'High' };

export const statusTone = (status: MarkerStatus | null): Tone =>
  status === null ? 'neutral' : status === 'normal' ? 'good' : 'warm';
