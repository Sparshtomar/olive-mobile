import { describe, expect, it } from 'vitest';
import { alpha, themes, type ColorToken, type Colors } from '@/ui/theme';

/** WCAG 2 contrast ratio between two `#RRGGBB` colours. */
const contrast = (a: string, b: string) => {
  const luminance = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, bl] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

/** Body text on the surfaces it sits on. Each must meet WCAG AA (4.5:1) in both schemes. */
const BODY_TEXT: [ColorToken, ColorToken][] = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['text', 'surfaceMuted'],
  ['textMuted', 'bg'],
  ['textMuted', 'surface'],
  ['textOnPrimary', 'primary'],
  ['primary', 'bg'],
  ['primary', 'surface'],
  ['danger', 'bg'],
  ['danger', 'surface'],
];

describe.each(Object.values(themes))('$scheme theme', ({ colors }: { colors: Colors }) => {
  it.each(BODY_TEXT)('%s on %s meets WCAG AA', (fg, bg) => {
    expect(contrast(colors[fg], colors[bg])).toBeGreaterThanOrEqual(4.5);
  });
});

describe('alpha', () => {
  it('turns a hex token into a translucent rgba colour', () => {
    expect(alpha(themes.light.colors.primary, 0.12)).toMatch(/^rgba\(79, 122, 90, 0\.12\)$/);
  });
});
