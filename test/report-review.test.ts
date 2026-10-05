import { describe, expect, it } from 'vitest';
import {
  isValidMarkerValue,
  parseMarkerValue,
  reportDateError,
  savedReportMessage,
  trackedFirst,
} from '@/features/reports/lib/review';
import { statusTone } from '@/features/reports/lib/status';

describe('lab value input', () => {
  it('accepts a decimal comma, as printed on many lab reports', () => {
    expect(parseMarkerValue('5,2')).toBe(5.2);
    expect(isValidMarkerValue('5,2')).toBe(true);
  });

  it('never reads a blank value as zero', () => {
    expect(isValidMarkerValue('')).toBe(false);
    expect(isValidMarkerValue('  ')).toBe(false);
  });

  it('rejects text', () => expect(isValidMarkerValue('high')).toBe(false));
});

describe('report date', () => {
  const today = '2026-10-04';
  it('requires YYYY-MM-DD', () => expect(reportDateError('04/10/2026', today)).toBe('Use the format YYYY-MM-DD'));
  it('rejects future dates', () => expect(reportDateError('2026-10-05', today)).toMatch(/future/));
  it('accepts today and earlier', () => {
    expect(reportDateError(today, today)).toBeUndefined();
    expect(reportDateError('2025-01-31', today)).toBeUndefined();
  });
});

describe('review list', () => {
  it('puts tracked markers first and keeps the lab order within each group', () => {
    const rows = [
      { key: null, name: 'MCV' },
      { key: 'ldl', name: 'LDL' },
      { key: null, name: 'MCH' },
      { key: 'hdl', name: 'HDL' },
    ];
    expect(trackedFirst(rows).map((r) => r.name)).toEqual(['LDL', 'HDL', 'MCV', 'MCH']);
  });

  it('only uses the warm tone for out-of-range values', () => {
    expect(statusTone('normal')).toBe('good');
    expect(statusTone('high')).toBe('warm');
    expect(statusTone(null)).toBe('neutral');
  });
});

describe('save confirmation', () => {
  it('names the nutrients Olive will start tracking', () => {
    expect(savedReportMessage([{ nutrient: 'saturatedFat' }, { nutrient: 'fiber' }], 2)).toMatch(
      /^Olive will now track saturated fat and fiber/,
    );
  });

  it('falls back to the out-of-range count, then to good news', () => {
    expect(savedReportMessage([], 1)).toBe('1 marker out of range.');
    expect(savedReportMessage([], 3)).toBe('3 markers out of range.');
    expect(savedReportMessage([], 0)).toMatch(/in range/);
  });
});
