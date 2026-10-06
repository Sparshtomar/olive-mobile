import type { DaySummary, MarkerTrend } from '@sparshtomar/olive-shared';
import { describe, expect, it } from 'vitest';
import { parseInline, parseMarkdownLite, previewOf } from '@/features/chat/lib/markdown';
import { suggestionsFor } from '@/features/chat/lib/suggestions';

describe('markdown-lite', () => {
  it('splits bold spans and leaves unbalanced markers alone', () => {
    expect(parseInline('Your **LDL** was high')).toEqual([
      { text: 'Your ', bold: false },
      { text: 'LDL', bold: true },
      { text: ' was high', bold: false },
    ]);
    expect(parseInline('a ** b')).toEqual([{ text: 'a ** b', bold: false }]);
  });

  it('turns blank-line-separated text into paragraphs and bullet runs into lists', () => {
    const blocks = parseMarkdownLite('Lead in.\n\n• one\n- two\n3) three\n\nAfter.');
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'bullets', 'paragraph']);
    expect(blocks[1]).toEqual({
      type: 'bullets',
      items: [[{ text: 'one', bold: false }], [{ text: 'two', bold: false }], [{ text: 'three', bold: false }]],
    });
  });

  it('keeps a lead-in sentence above bullets in the same chunk', () => {
    const blocks = parseMarkdownLite('Try these:\n• dal\n• curd');
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'bullets']);
  });

  it('joins soft-wrapped lines into one paragraph and drops empty input', () => {
    expect(parseMarkdownLite('one\ntwo')).toEqual([{ type: 'paragraph', runs: [{ text: 'one two', bold: false }] }]);
    expect(parseMarkdownLite('   \n\n')).toEqual([]);
  });

  it('previews without markup and truncates with an ellipsis', () => {
    expect(previewOf('• **Dal** is great\nmore')).toBe('Dal is great more');
    expect(previewOf('x'.repeat(100), 10)).toBe('xxxxxxxxx…');
  });
});

const marker = (name: string, status: MarkerTrend['latest']['status']): MarkerTrend => ({
  key: 'ldl',
  name,
  unit: 'mg/dL',
  range: {},
  latest: { value: 1, status, date: '2026-01-01', reportId: 'r' },
  history: [],
  tip: null,
});

const day = (calories: number, protein: number, meals: number): DaySummary =>
  ({
    date: '2026-10-06',
    targets: { calories: 1600, protein: 90, carbs: 180, fat: 50 },
    totals: { calories, protein, carbs: 0, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, sodiumMg: 0 },
    meals: Array.from({ length: meals }, () => ({}) as DaySummary['meals'][number]),
    focus: [],
  }) as unknown as DaySummary;

describe('suggestions', () => {
  it('leads with flagged markers, at most two', () => {
    const s = suggestionsFor({
      markers: [
        marker('LDL cholesterol', 'high'),
        marker('HDL', 'low'),
        marker('TSH', 'normal'),
        marker('Vitamin D', 'low'),
      ],
    });
    expect(s.slice(0, 2)).toEqual([
      'What does high ldl cholesterol mean for what I eat?',
      'What does low hdl mean for what I eat?',
    ]);
    expect(s).toHaveLength(4);
  });

  it("reflects today's situation: over target, little left, nothing logged, protein gap", () => {
    expect(suggestionsFor({ day: day(1700, 80, 3) })[0]).toMatch(/gone over/);
    expect(suggestionsFor({ day: day(1200, 80, 2) })[0]).toBe('I have about 400 kcal left - ideas for a light dinner?');
    expect(suggestionsFor({ day: day(0, 0, 0) })[0]).toMatch(/good breakfast/);
    expect(suggestionsFor({ day: day(600, 20, 1) })).toContain('How do I get 70 g more protein today?');
  });

  it('fills with general questions and never exceeds four', () => {
    const s = suggestionsFor({});
    expect(s).toHaveLength(4);
    expect(s[0]).toBe('Plan a high-protein vegetarian dinner for me');
  });
});
