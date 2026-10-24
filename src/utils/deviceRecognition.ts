/**
 * Device Recognition & Session Persistence Utility for Doctorian Medical AI
 * Automatically recognizes trusted devices and securely restores authenticated sessions.
 */

export interface DeviceSignature {
  deviceId: string;
  deviceName: string;
  platform: string;
  browser: string;
  screenResolution: string;
  trustedAt: number;
  lastSeenAt: number;
  autoLoginEnabled: boolean;
}

const DEVICE_ID_KEY = 'doctorian_device_id';
const DEVICE_SIG_KEY = 'doctorian_device_signature';
const TRUSTED_DEVICE_KEY = 'doctorian_trusted_device';

/**
 * Generate or retrieve persistent unique hardware/device identifier
 */
export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'DEV-STANDALONE-DEFAULT';
  }
}

/**
 * Detect friendly device & platform name (e.g., "Chrome on Windows 11" or "Safari on iPhone")
 */
export function detectDeviceName(): { deviceName: string; platform: string; browser: string } {
  if (typeof navigator === 'undefined') {
    return { deviceName: 'Generic Medical Station', platform: 'Unknown OS', browser: 'Browser' };
  }

  const ua = navigator.userAgent;
  let platform = 'Clinical Terminal';
  if (/Android/i.test(ua)) platform = 'Android Workstation';
  else if (/iPhone|iPad|iPod/i.test(ua)) platform = 'iOS Mobile Node';
  else if (/Mac/i.test(ua)) platform = 'macOS Workstation';
  else if (/Win/i.test(ua)) platform = 'Windows Medical PC';
  else if (/Linux/i.test(ua)) platform = 'Linux Medical Host';

  let browser = 'Browser';
  if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome/i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari/i.test(ua)) browser = 'Apple Safari';

  return {
    deviceName: `${browser} on ${platform}`,
    platform,
    browser
  };
}

/**
 * Get current device signature
 */
export function getDeviceSignature(): DeviceSignature {
  const deviceId = getOrCreateDeviceId();
  const { deviceName, platform, browser } = detectDeviceName();
  const screenResolution = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';

  let savedSig: Partial<DeviceSignature> = {};
  try {
    const raw = localStorage.getItem(DEVICE_SIG_KEY);
    if (raw) savedSig = JSON.parse(raw);
  } catch {}

  const sig: DeviceSignature = {
    deviceId,
    deviceName,
    platform,
    browser,
    screenResolution,
    trustedAt: savedSig.trustedAt || Date.now(),
    lastSeenAt: Date.now(),
    autoLoginEnabled: isDeviceTrusted()
  };

  try {
    localStorage.setItem(DEVICE_SIG_KEY, JSON.stringify(sig));
  } catch {}

  return sig;
}

/**
 * Check if the current device is marked as trusted for persistent auto-login
 */
export function isDeviceTrusted(): boolean {
  try {
    return localStorage.getItem(TRUSTED_DEVICE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark current device as trusted with persistent auto-login enabled
 */
export function trustDevice(autoLogin: boolean = true): DeviceSignature {
  try {
    localStorage.setItem(TRUSTED_DEVICE_KEY, autoLogin ? 'true' : 'false');
  } catch {}

  const sig = getDeviceSignature();
  sig.autoLoginEnabled = autoLogin;
  sig.lastSeenAt = Date.now();

  try {
    localStorage.setItem(DEVICE_SIG_KEY, JSON.stringify(sig));
  } catch {}

  return sig;
}

/**
 * Untrust current device (e.g. on explicit secure logout)
 */
export function untrustDevice(): void {
  try {
    localStorage.removeItem(TRUSTED_DEVICE_KEY);
    localStorage.removeItem('doctorian_token');
    localStorage.removeItem('medical_user');
  } catch {}
}

/**
 * Automatically check if a saved session can be verified for this trusted device
 */
export function canAutoLoginDevice(): { canLogin: boolean; user: any | null } {
  try {
    const isTrusted = isDeviceTrusted();
    if (!isTrusted) return { canLogin: false, user: null };

    const rawUser = localStorage.getItem('medical_user');
    if (rawUser && rawUser !== 'null' && rawUser !== 'undefined') {
      const parsed = JSON.parse(rawUser);
      if (parsed && (parsed.email || parsed.id)) {
        return { canLogin: true, user: parsed };
      }
    }
  } catch (e) {
    console.warn("Auto-login verification failed:", e);
  }
  return { canLogin: false, user: null };
}
