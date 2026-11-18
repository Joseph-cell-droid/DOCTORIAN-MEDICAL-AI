export type ScrollDirection = 'up' | 'down' | 'none';

export interface TopBarScrollState {
  lastScrollTop: number;
  targetOffset: number; // 0 (fully visible) down to -maxHidePx (hidden above viewport)
  committedDir: ScrollDirection;
  reversalAccum: number;
  maxScrollSeen: number;
}

export interface TopBarScrollConfig {
  maxHidePx: number;
  topPinThresholdPx: number;
  noiseFloorPx: number;
  reversalDeadzonePx: number;
}

export const DEFAULT_TOPBAR_SCROLL_CONFIG: TopBarScrollConfig = {
  maxHidePx: 96,
  topPinThresholdPx: 16,
  noiseFloorPx: 1.5,
  reversalDeadzonePx: 14
};

export function createInitialTopBarScrollState(initialScrollTop = 0): TopBarScrollState {
  return {
    lastScrollTop: Math.max(0, initialScrollTop),
    targetOffset: 0,
    committedDir: 'none',
    reversalAccum: 0,
    maxScrollSeen: Math.max(0, initialScrollTop)
  };
}

export function clampOffset(value: number, maxHidePx: number): number {
  return Math.max(-maxHidePx, Math.min(0, value));
}

/**
 * Computes the next scroll-linked target vertical offset without flickering on slow
 * micro-movements, while keeping the top bar always visible at the top of the page
 * and completely stable whenever scrolling stops.
 */
export function updateTopBarScrollState(
  prev: TopBarScrollState,
  rawScrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  popoverOpen: boolean,
  cfg: TopBarScrollConfig = DEFAULT_TOPBAR_SCROLL_CONFIG
): { state: TopBarScrollState; shouldClosePopover: boolean } {
  const maxScrollable = Math.max(0, scrollHeight - clientHeight);
  // Clamp against iOS/macOS elastic overscroll bounce at top and bottom
  const safeTop = Math.max(0, Math.min(rawScrollTop, maxScrollable > 0 ? maxScrollable : rawScrollTop));
  const delta = safeTop - prev.lastScrollTop;

  // Always remain visible at the very top of the page or if page cannot scroll
  if (safeTop <= cfg.topPinThresholdPx || maxScrollable <= 24) {
    return {
      state: {
        lastScrollTop: safeTop,
        targetOffset: 0,
        committedDir: 'none',
        reversalAccum: 0,
        maxScrollSeen: safeTop
      },
      shouldClosePopover: false
    };
  }

  // Ignore bottom rubber-band rebound when user hits the end of the page
  if (rawScrollTop > maxScrollable && delta < 0) {
    return {
      state: {
        ...prev,
        lastScrollTop: safeTop
      },
      shouldClosePopover: false
    };
  }

  // Filter out sub-pixel / tiny hand-tremor movements while scrolling slowly
  if (Math.abs(delta) < cfg.noiseFloorPx) {
    return {
      state: {
        ...prev,
        lastScrollTop: safeTop
      },
      shouldClosePopover: false
    };
  }

  const stepDir: ScrollDirection = delta > 0 ? 'down' : 'up';
  let nextDir = prev.committedDir;
  let nextReversalAccum = prev.reversalAccum;
  let nextOffset = prev.targetOffset;
  let shouldClosePopover = false;

  if (popoverOpen) {
    // Keep open menus pinned unless user makes a deliberate downward scroll > 28px
    if (stepDir === 'down') {
      nextReversalAccum = prev.committedDir === 'down' ? prev.reversalAccum + delta : delta;
      if (nextReversalAccum >= 28) {
        shouldClosePopover = true;
        nextDir = 'down';
        nextOffset = clampOffset(prev.targetOffset - (nextReversalAccum - 28), cfg.maxHidePx);
        nextReversalAccum = 0;
      } else {
        return {
          state: {
            ...prev,
            lastScrollTop: safeTop,
            targetOffset: 0,
            reversalAccum: nextReversalAccum
          },
          shouldClosePopover: false
        };
      }
    } else {
      return {
        state: {
          ...prev,
          lastScrollTop: safeTop,
          targetOffset: 0,
          reversalAccum: 0
        },
        shouldClosePopover: false
      };
    }
  } else if (nextDir === 'none') {
    // Require deliberate travel past deadzone before first hide when leaving top
    if (stepDir === 'down') {
      nextReversalAccum += delta;
      if (nextReversalAccum >= cfg.reversalDeadzonePx) {
        nextDir = 'down';
        const excess = nextReversalAccum - cfg.reversalDeadzonePx;
        nextOffset = clampOffset(prev.targetOffset - excess, cfg.maxHidePx);
        nextReversalAccum = 0;
      }
    } else {
      nextDir = 'up';
      nextReversalAccum = 0;
      nextOffset = clampOffset(prev.targetOffset - delta, cfg.maxHidePx);
    }
  } else if (stepDir === nextDir) {
    // Continuing cleanly in committed direction: progressive 1:1 tracking (clamped)
    nextReversalAccum = 0;
    nextOffset = clampOffset(prev.targetOffset - delta, cfg.maxHidePx);
  } else {
    // Moving opposite to committed direction: buffer small movements in deadzone to prevent flicker
    nextReversalAccum += delta;
    if (Math.abs(nextReversalAccum) >= cfg.reversalDeadzonePx) {
      nextDir = stepDir;
      const excess =
        stepDir === 'down'
          ? nextReversalAccum - cfg.reversalDeadzonePx
          : nextReversalAccum + cfg.reversalDeadzonePx;
      nextOffset = clampOffset(prev.targetOffset - excess, cfg.maxHidePx);
      nextReversalAccum = 0;
    }
  }

  return {
    state: {
      lastScrollTop: safeTop,
      targetOffset: nextOffset,
      committedDir: nextDir,
      reversalAccum: nextReversalAccum,
      maxScrollSeen: Math.max(prev.maxScrollSeen, safeTop)
    },
    shouldClosePopover
  };
}

/**
 * Frame-rate-independent exponential smoothing step so fast scroll flicks
 * respond smoothly instead of snapping in a single frame, and settle cleanly when stopped.
 */
export function stepSmoothOffset(current: number, target: number, dtSeconds: number, speed = 15): number {
  const diff = target - current;
  if (Math.abs(diff) <= 0.25) return target;
  const clampedDt = Math.min(0.05, Math.max(0.001, dtSeconds));
  const alpha = 1 - Math.exp(-speed * clampedDt);
  return current + diff * alpha;
}
