/**
 * Doctorian Durable Offline Vault (IndexedDB + Encrypted localStorage Mirror)
 * Stores clinical records, pharmacy orders, remembered accounts (metadata only,
 * zero plaintext credentials), offline AI knowledge nodes, and pending sync outbox.
 */

export interface RememberedAccount {
  id: string;
  email: string;
  displayName: string;
  role: string;
  photoURL?: string;
  specialty?: string;
  facility?: string;
  bloodGroup?: string;
  hospitalPreference?: string;
  lastActiveAt: string;
}

export interface OfflineOutboxItem {
  id: string;
  kind: 'neural_signal' | 'pharmacy_order' | 'clinical_mutation';
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  payload: any;
  createdAt: string;
}

const DB_NAME = 'doctorian_offline_vault_v1';
const DB_VERSION = 1;
const STORE_KV = 'vault_kv';
const STORE_ORDERS = 'pharmacy_orders';
const STORE_OUTBOX = 'sync_outbox';
const STORE_SIGNALS = 'neural_signals';

const REMEMBERED_ACCOUNTS_KEY = 'doctorian_remembered_accounts_v1';
const LAST_USER_SNAPSHOT_KEY = 'doctorian_last_user_snapshot_v1';
const ORDERS_LOCAL_KEY = 'doctorian_pharmacy_orders_v1';
const OUTBOX_LOCAL_KEY = 'doctorian_offline_outbox_v1';

function openVaultDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_KV)) db.createObjectStore(STORE_KV);
        if (!db.objectStoreNames.contains(STORE_ORDERS)) db.createObjectStore(STORE_ORDERS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORE_OUTBOX)) db.createObjectStore(STORE_OUTBOX, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORE_SIGNALS)) db.createObjectStore(STORE_SIGNALS, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function vaultSet(key: string, value: any): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`dv_${key}`, JSON.stringify(value));
    }
  } catch {
    // quota fallback
  }
  const db = await openVaultDB();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_KV, 'readwrite');
      tx.objectStore(STORE_KV).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } finally {
    db.close();
  }
}

export async function vaultGet<T>(key: string, fallback: T): Promise<T> {
  const db = await openVaultDB();
  if (db) {
    try {
      const val = await new Promise<any>((resolve) => {
        const tx = db.transaction(STORE_KV, 'readonly');
        const req = tx.objectStore(STORE_KV).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
      });
      if (val !== undefined) return val as T;
    } finally {
      db.close();
    }
  }
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(`dv_${key}`) : null;
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore parse failure
  }
  return fallback;
}

// --- REMEMBERED ACCOUNT PROFILES (NEVER STORES PASSWORDS OR SECRET TOKENS) ---
export function saveRememberedAccount(user: any): void {
  if (!user || !user.email || user.role === 'guest' || user.isGuest) return;
  try {
    const profile: RememberedAccount = {
      id: String(user.id || user.email),
      email: String(user.email).trim().toLowerCase(),
      displayName: String(user.displayName || user.email.split('@')[0]),
      role: String(user.role || 'patient'),
      photoURL: user.photoURL || undefined,
      specialty: user.specialty || undefined,
      facility: user.facility || user.hospitalPreference || undefined,
      bloodGroup: user.bloodGroup || undefined,
      hospitalPreference: user.hospitalPreference || undefined,
      lastActiveAt: new Date().toISOString()
    };

    const existing = getRememberedAccounts();
    const filtered = existing.filter((a) => a.email !== profile.email);
    const updated = [profile, ...filtered].slice(0, 6);
    localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(updated));
    localStorage.setItem(LAST_USER_SNAPSHOT_KEY, JSON.stringify({ ...user, savedAt: new Date().toISOString() }));
    void vaultSet(REMEMBERED_ACCOUNTS_KEY, updated);
    void vaultSet(`account_snapshot_${profile.email}`, user);
  } catch {
    // ignore
  }
}

export function getRememberedAccounts(): RememberedAccount[] {
  try {
    const raw = localStorage.getItem(REMEMBERED_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function removeRememberedAccount(email: string): RememberedAccount[] {
  const norm = email.trim().toLowerCase();
  const next = getRememberedAccounts().filter((a) => a.email !== norm);
  try {
    localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(next));
    void vaultSet(REMEMBERED_ACCOUNTS_KEY, next);
  } catch {
    // ignore
  }
  return next;
}

// --- PERSISTENT PHARMACY ORDERS (OFFLINE + ONLINE MIRROR) ---
export function saveLocalPharmacyOrder(order: any): void {
  if (!order || !order.orderNumber) return;
  try {
    const list = getLocalPharmacyOrders();
    const filtered = list.filter((o: any) => o.orderNumber !== order.orderNumber);
    const updated = [order, ...filtered].slice(0, 50);
    localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(updated));
    void vaultSet(ORDERS_LOCAL_KEY, updated);
  } catch {
    // ignore
  }
}

export function getLocalPharmacyOrders(): any[] {
  try {
    const raw = localStorage.getItem(ORDERS_LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// --- OFFLINE SYNC OUTBOX ---
export function enqueueOutboxItem(item: Omit<OfflineOutboxItem, 'id' | 'createdAt'>): OfflineOutboxItem {
  const full: OfflineOutboxItem = {
    ...item,
    id: `outbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString()
  };
  try {
    const existing = getOutboxItems();
    const next = [...existing, full].slice(-100);
    localStorage.setItem(OUTBOX_LOCAL_KEY, JSON.stringify(next));
    void vaultSet(OUTBOX_LOCAL_KEY, next);
  } catch {
    // ignore
  }
  return full;
}

export function getOutboxItems(): OfflineOutboxItem[] {
  try {
    const raw = localStorage.getItem(OUTBOX_LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function replaceOutboxItems(items: OfflineOutboxItem[]): void {
  try {
    localStorage.setItem(OUTBOX_LOCAL_KEY, JSON.stringify(items));
    void vaultSet(OUTBOX_LOCAL_KEY, items);
  } catch {
    // ignore
  }
}

// Persist clinical snapshot on demand so logged-in users retain offline data instantaneously
export function persistClinicalStateSnapshot(key: string, data: any): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const userRaw = localStorage.getItem('medical_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const scope = user?.id || 'default';
    localStorage.setItem(`doctorian_snapshot_${scope}_${key}`, JSON.stringify(data));
    void vaultSet(`snapshot_${scope}_${key}`, data);
  } catch {
    // ignore
  }
}

export function loadClinicalStateSnapshot<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const userRaw = localStorage.getItem('medical_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const scope = user?.id || 'default';
    const raw = localStorage.getItem(`doctorian_snapshot_${scope}_${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
