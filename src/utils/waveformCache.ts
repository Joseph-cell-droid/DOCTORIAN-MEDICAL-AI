/**
 * 24-Hour Offline Telemetry & Waveform Caching Engine
 * Caches raw ECG, SpO2, and Heart Rate telemetry buffer logs in IndexedDB
 * for offline ward round reviews without cloud database dependencies.
 */

export interface TelemetryFrame {
  id?: string;
  timestamp: number; // Date.now()
  isoTime: string;
  heartRate: number;
  spo2: number;
  sysBP: number;
  diaBP: number;
  respiratoryRate: number;
  ecgPoint: number;
  arrhythmiaFlag?: string;
}

const DB_NAME = 'DoctorianWaveformCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'telemetry_waveform_buffers';

function openWaveformDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cache a raw telemetry snapshot frame into IndexedDB and clean logs older than 24h
 */
export async function cacheTelemetryFrame(frame: Omit<TelemetryFrame, 'id'>): Promise<void> {
  try {
    const db = await openWaveformDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.add(frame);

    // Prune entries older than 24 hours (86,400,000 ms)
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    const index = store.index('timestamp');
    const range = IDBKeyRange.upperBound(cutoff);
    const cursorReq = index.openCursor(range);

    cursorReq.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  } catch (err) {
    // Fallback to localStorage if IndexedDB encounters permissions error
    try {
      const key = 'doctorian_telemetry_24h_buffer';
      const raw = localStorage.getItem(key);
      const existing: TelemetryFrame[] = raw ? JSON.parse(raw) : [];
      existing.push({ ...frame, id: 'frame-' + Date.now() });

      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      const filtered = existing.filter(f => f.timestamp > cutoff);
      localStorage.setItem(key, JSON.stringify(filtered.slice(-500))); // keep latest 500 frames
    } catch (e) {}
  }
}

/**
 * Retrieve 24-hour historical telemetry buffer frames for offline trend reviews
 */
export async function get24HourTelemetryFrames(): Promise<TelemetryFrame[]> {
  try {
    const db = await openWaveformDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    const range = IDBKeyRange.lowerBound(cutoff);

    return new Promise((resolve) => {
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    // Fallback read from localStorage
    try {
      const key = 'doctorian_telemetry_24h_buffer';
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      const parsed: TelemetryFrame[] = JSON.parse(raw);
      return parsed.filter(f => f.timestamp > cutoff);
    } catch (e) {
      return [];
    }
  }
}
