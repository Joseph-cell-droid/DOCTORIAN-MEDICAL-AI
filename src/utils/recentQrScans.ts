import { MedicalProfileData } from '../components/MedicalQrScannerModal';

export interface ScannedQrHistoryItem {
  id: string;
  timestamp: number;
  formattedDate: string;
  patientId: string;
  patientName: string;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  hospital: string;
  fullProfile: MedicalProfileData;
}

export const QR_HISTORY_STORAGE_KEY = 'doctorian_recent_qr_scans';
export const QR_HISTORY_EVENT = 'doctorian_qr_history_updated';
const MAX_HISTORY_ITEMS = 5;

/**
 * Format relative or localized time string
 */
function formatScanTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Retrieve the last 5 scanned QR codes from localStorage
 */
export function getRecentQrScans(): ScannedQrHistoryItem[] {
  try {
    const raw = localStorage.getItem(QR_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_HISTORY_ITEMS);
    }
  } catch (e) {
    console.error("Failed to parse recent QR scans from localStorage:", e);
  }
  return [];
}

/**
 * Save a new medical profile to the history, keeping at most the last 5 items
 */
export function saveQrScanToHistory(profile: MedicalProfileData): ScannedQrHistoryItem[] {
  const current = getRecentQrScans();
  const patientId = profile.user.id;
  const now = Date.now();

  const newItem: ScannedQrHistoryItem = {
    id: `scan-${patientId}-${now}`,
    timestamp: now,
    formattedDate: formatScanTime(now),
    patientId: profile.user.id,
    patientName: profile.user.displayName || "Patient " + patientId.slice(-4),
    bloodGroup: profile.user.bloodGroup || "O+",
    allergies: profile.user.allergies || "None Recorded",
    conditions: profile.user.conditions || "None Declared",
    hospital: profile.user.hospitalPreference || "Mulago Referral Hospital",
    fullProfile: profile
  };

  // Remove existing entry for the same patient ID to deduplicate and move to top
  const filtered = current.filter(item => item.patientId !== patientId);
  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(QR_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(QR_HISTORY_EVENT, { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error("Failed to save QR scan to localStorage:", e);
  }

  return updated;
}

/**
 * Remove a single item from the scan history
 */
export function removeQrScanItem(id: string): ScannedQrHistoryItem[] {
  const current = getRecentQrScans();
  const updated = current.filter(item => item.id !== id);

  try {
    localStorage.setItem(QR_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(QR_HISTORY_EVENT, { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}

  return updated;
}

/**
 * Clear all scanned QR items
 */
export function clearQrScansHistory(): void {
  try {
    localStorage.removeItem(QR_HISTORY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(QR_HISTORY_EVENT, { detail: [] }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
}
