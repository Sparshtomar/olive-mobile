import type { TargetRect } from '../stores/hints';

/** One hint in a tour: what to point at, and what to say about it. */
export interface HintStep {
  /** Id of a `HintTarget` on the screen. A step whose target is not on screen is skipped. */
  target: string;
  title: string;
  body: string;
}

/** A screen's tour, declared next to the screen. */
export interface HintTour {
  id: string;
  steps: HintStep[];
}

export type Placement = 'above' | 'below' | 'over';

export interface SafeArea {
  top: number;
  bottom: number;
}

/** Keeps a tour's steps to the targets that actually rendered, in the declared order. */
export const availableSteps = (tour: HintTour, targets: Record<string, TargetRect>): HintStep[] =>
  tour.steps.filter((s) => targets[s.target] !== undefined);

/**
 * Below the target if it fits above the bottom inset, else above it if that clears the top
 * inset, else floating over the target (a target taller than the screen leaves no room).
 */
export const placementFor = (
  rect: TargetRect,
  screenHeight: number,
  cardHeight: number,
  safe: SafeArea,
  gap = 12,
): Placement => {
  if (rect.y + rect.height + gap + cardHeight <= screenHeight - safe.bottom) return 'below';
  if (rect.y - gap - cardHeight >= safe.top) return 'above';
  return 'over';
};

/** Top edge of the card for a placement, kept inside the safe area. */
export const cardTopFor = (
  placement: Placement,
  rect: TargetRect,
  screenHeight: number,
  cardHeight: number,
  safe: SafeArea,
  gap = 12,
): number => {
  const min = safe.top + gap;
  const max = screenHeight - safe.bottom - gap - cardHeight;
  const wanted =
    placement === 'below'
      ? rect.y + rect.height + gap
      : placement === 'above'
        ? rect.y - gap - cardHeight
        : rect.y + rect.height / 2 - cardHeight / 2;
  return Math.min(Math.max(wanted, min), Math.max(min, max));
};

/** Pads the target so the cutout breathes, clamped to the screen. */
export const spotlightFor = (rect: TargetRect, pad: number, screenWidth: number, screenHeight: number): TargetRect => {
  const x = Math.max(0, rect.x - pad);
  const y = Math.max(0, rect.y - pad);
  return {
    x,
    y,
    width: Math.min(screenWidth - x, rect.width + pad * 2),
    height: Math.min(screenHeight - y, rect.height + pad * 2),
  };
};
