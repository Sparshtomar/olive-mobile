import { describe, expect, it } from 'vitest';
import { availableSteps, cardTopFor, placementFor, spotlightFor, type HintTour } from '@/features/hints/lib/steps';

const tour: HintTour = {
  id: 'today',
  steps: [
    { target: 'today.strip', title: 'Week', body: '' },
    { target: 'today.ring', title: 'Ring', body: '' },
    { target: 'nav.log', title: 'Log', body: '' },
  ],
};
const rect = (y: number, height = 40) => ({ x: 20, y, width: 100, height });

describe('hint steps', () => {
  it('keeps only steps whose target rendered, in declared order', () => {
    const steps = availableSteps(tour, { 'nav.log': rect(700), 'today.strip': rect(100) });
    expect(steps.map((s) => s.target)).toEqual(['today.strip', 'nav.log']);
    expect(availableSteps(tour, {})).toEqual([]);
  });

  const safe = { top: 48, bottom: 24 };

  it('places the card below the target unless that runs into the bottom inset', () => {
    expect(placementFor(rect(100), 800, 150, safe)).toBe('below');
    expect(placementFor(rect(700), 800, 150, safe)).toBe('above');
    expect(placementFor(rect(614, 0), 800, 150, safe)).toBe('below'); // exactly fits above the inset
    expect(placementFor(rect(615, 0), 800, 150, safe)).toBe('above');
  });

  it('floats over a target that leaves no room on either side', () => {
    expect(placementFor(rect(60, 700), 800, 150, safe)).toBe('over');
  });

  it('keeps the card inside the safe area', () => {
    expect(cardTopFor('below', rect(100), 800, 150, safe)).toBe(152);
    expect(cardTopFor('above', rect(700), 800, 150, safe)).toBe(538);
    // A target hugging the status bar: "above" would be negative, so it clamps to the top inset.
    expect(cardTopFor('above', rect(0, 10), 800, 150, safe)).toBe(60);
    // "Below" a target at the very bottom clamps to the bottom inset.
    expect(cardTopFor('below', rect(780, 20), 800, 150, safe)).toBe(614);
    // Floating centres on the target and still clamps.
    expect(cardTopFor('over', rect(60, 700), 800, 150, safe)).toBe(335);
  });

  it('pads the spotlight and clamps it to the screen', () => {
    expect(spotlightFor({ x: 20, y: 100, width: 100, height: 40 }, 8, 390, 800)).toEqual({
      x: 12,
      y: 92,
      width: 116,
      height: 56,
    });
    expect(spotlightFor({ x: 2, y: 790, width: 388, height: 40 }, 8, 390, 800)).toEqual({
      x: 0,
      y: 782,
      width: 390,
      height: 18,
    });
  });
});
