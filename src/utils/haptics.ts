/**
 * Doctorian Medical AI - Mobile Haptics & Vibration Utility
 * Handles tactile feedback for critical physiological thresholds, SOS alerts,
 * clinical warnings, and user UI interactions across mobile & web environments.
 */

export interface HapticsOptions {
  enabled?: boolean;
}

const HAPTICS_PREF_KEY = 'doctorian_haptics_enabled';

/**
 * Check if the current browser environment supports the Vibration API
 */
export const isHapticsSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function';
};

/**
 * Get whether haptics are enabled in user settings
 */
export const isHapticsEnabled = (): boolean => {
  if (typeof localStorage === 'undefined') return true;
  try {
    const saved = localStorage.getItem(HAPTICS_PREF_KEY);
    return saved === null ? true : saved === 'true';
  } catch (e) {
    return true;
  }
};

/**
 * Toggle or set haptics setting in local storage
 */
export const setHapticsEnabled = (enabled: boolean): void => {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(HAPTICS_PREF_KEY, enabled.toString());
    } catch (e) {
      console.warn('[Haptics] Local storage error:', e);
    }
  }
};

/**
 * Generic safe wrapper around navigator.vibrate with error handling
 * (prevents exceptions in iframe or restricted security contexts)
 */
export const vibrate = (pattern: number | number[], force: boolean = false): boolean => {
  if (!isHapticsSupported()) return false;
  if (!force && !isHapticsEnabled()) return false;

  try {
    const result = navigator.vibrate(pattern);
    return result;
  } catch (err) {
    console.warn('[Haptics] Vibration call blocked or failed:', err);
    return false;
  }
};

/**
 * Stop any currently running vibration pattern
 */
export const stopVibration = (): boolean => {
  return vibrate(0, true);
};

/**
 * Distinct Morse Code SOS Haptic Sequence: (... --- ...)
 * Short pulses (200ms) for 'S', Long pulses (500ms) for 'O'
 */
export const vibrateSOS = (): boolean => {
  const sosPattern = [
    // S: . . .
    150, 100, 150, 100, 150, 300,
    // O: - - -
    400, 100, 400, 100, 400, 300,
    // S: . . .
    150, 100, 150, 100, 150
  ];
  return vibrate(sosPattern, true); // Force true for true SOS emergency
};

/**
 * Critical physiological alert threshold breach haptic pattern
 * High-intensity repeating pulse pattern
 */
export const vibrateCriticalAlert = (): boolean => {
  const criticalPattern = [350, 100, 350, 100, 350, 200, 600, 150, 600];
  return vibrate(criticalPattern, true);
};

/**
 * Vital sign warning / elevated threshold breach haptic pattern
 */
export const vibrateWarning = (): boolean => {
  return vibrate([200, 100, 200]);
};

/**
 * Subtle success or confirmation haptic pulse
 */
export const vibrateSuccess = (): boolean => {
  return vibrate([50, 50, 50]);
};

/**
 * Brief single tap for UI interactions (e.g. keypress, button tap)
 */
export const vibratePulse = (durationMs: number = 80): boolean => {
  return vibrate(durationMs);
};
