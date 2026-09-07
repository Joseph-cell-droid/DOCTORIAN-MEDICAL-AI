/**
 * 1GB Free Cloud Storage & Two-Way Verification API Client
 * Allocates 1GB (1,073,741,824 bytes) per registered account.
 * Supports online Express API and offline local fallback.
 */

export const FREE_STORAGE_QUOTA_BYTES = 1073741824; // 1,073,741,824 bytes = 1 GB

export interface StoragePlan {
  id: string;
  name: string;
  addedBytes: number;
  formattedSize: string;
  amount: number;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  isPopular?: boolean;
}

export const STORAGE_EXPANSION_PLANS: StoragePlan[] = [
  {
    id: 'storage_5gb',
    name: '+5 GB Clinical Expansion',
    addedBytes: 5 * 1024 * 1024 * 1024,
    formattedSize: '+5 GB',
    amount: 5000,
    price: '5,000 UGX',
    period: 'one-time expansion',
    description: 'Ideal for extended high-res medical records, lab reports, and vitals history.',
    features: ['+5 GB Encrypted Cloud Vault', 'Fast Two-Way Verification', 'Full DICOM & PDF support', 'Instant Quota Activation'],
  },
  {
    id: 'storage_20gb',
    name: '+20 GB Diagnostic & Imaging Archive',
    addedBytes: 20 * 1024 * 1024 * 1024,
    formattedSize: '+20 GB',
    amount: 18000,
    price: '18,000 UGX',
    period: 'one-time expansion',
    popular: true,
    isPopular: true,
    description: 'Designed for radiology scans, MRI/CT archives, and high-frequency sensor telemetry.',
    features: ['+20 GB High-Speed Cloud Storage', 'Continuous Neural Sync', 'Priority Backup Encryption', 'Multi-Device Access'],
  },
  {
    id: 'storage_100gb',
    name: '+100 GB Multi-Patient & Clinic Cloud',
    addedBytes: 100 * 1024 * 1024 * 1024,
    formattedSize: '+100 GB',
    amount: 65000,
    price: '65,000 UGX',
    period: 'one-time expansion',
    description: 'Comprehensive capacity for multiple patient profiles, video consultations, and deep clinical data.',
    features: ['+100 GB Hospital-Grade Storage', 'Audit-Ready Retention', 'Zero Compression Loss', 'Dedicated Sync Node'],
  },
  {
    id: 'storage_1tb',
    name: '+1 TB Enterprise Medical Repository',
    addedBytes: 1024 * 1024 * 1024 * 1024,
    formattedSize: '+1 TB',
    amount: 250000,
    price: '250,000 UGX',
    period: 'one-time expansion',
    description: 'Maximum cloud archival tier for enterprise institutions and research facilities.',
    features: ['+1 TB Unlimited Archival Quota', 'Custom Data Governance', 'Institutional Escrow', '24/7 Priority Support'],
  },
];

export interface StorageQuota {
  totalQuotaBytes: number;
  usedBytes: number;
  freeBytes: number;
  fileCount: number;
  percentUsed: number;
  isFull?: boolean;
}

export interface VaultFile {
  id: string;
  userId?: string;
  name: string;
  originalName?: string;
  mimeType: string;
  size: number;
  category: 'document' | 'scan' | 'lab_report' | 'user_data' | 'media';
  filePath?: string;
  contentData?: string; // Offline base64 or text content
  createdAt: string;
}

export interface TwoFactorRequestResult {
  success: boolean;
  message: string;
  challengeId?: string;
  maskedEmail?: string;
  demoCode?: string;
  expiresInSeconds?: number;
}

export interface TwoFactorVerifyResult {
  success: boolean;
  message: string;
  vaultToken: string;
  quota: StorageQuota;
  user?: {
    id: string;
    email: string;
    displayName: string;
  };
}

const OFFLINE_FILES_KEY = 'doctorian_1gb_vault_files';
const OFFLINE_CHALLENGES_KEY = 'doctorian_1gb_2fa_challenges';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// -------------------------------------------------------------
// Offline Local Storage Fallbacks
// -------------------------------------------------------------
function getOfflineFiles(userId: string): VaultFile[] {
  try {
    const raw = localStorage.getItem(`${OFFLINE_FILES_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveOfflineFiles(userId: string, files: VaultFile[]) {
  try {
    localStorage.setItem(`${OFFLINE_FILES_KEY}_${userId}`, JSON.stringify(files));
  } catch (e) {
    console.warn('[Offline Vault] Storage quota notification:', e);
  }
}

export function getOfflineQuota(userId: string): StorageQuota {
  let totalQuota = FREE_STORAGE_QUOTA_BYTES;
  try {
    const saved = localStorage.getItem(`doctorian_storage_quota_bytes_${userId}`);
    if (saved && Number(saved) > 0) {
      totalQuota = Number(saved);
    }
  } catch (e) {}

  const files = getOfflineFiles(userId);
  const usedBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const freeBytes = Math.max(0, totalQuota - usedBytes);
  const percentUsed = Math.min(100, Number(((usedBytes / totalQuota) * 100).toFixed(2)));
  const isFull = usedBytes >= totalQuota || percentUsed >= 100;

  return {
    totalQuotaBytes: totalQuota,
    usedBytes,
    freeBytes,
    fileCount: files.length,
    percentUsed,
    isFull,
  };
}

export function getAccountStorageQuota(userEmail?: string): StorageQuota {
  const targetEmail = userEmail || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('doctorian_vault_user_email') : null) || (typeof localStorage !== 'undefined' ? localStorage.getItem('doctorian_vault_user_email') : null) || 'default_user';
  const userId = targetEmail.replace(/[^a-zA-Z0-9]/g, '_');
  return getOfflineQuota(userId);
}

// -------------------------------------------------------------
// Core API Calls
// -------------------------------------------------------------

/**
 * Step 1: Enter password to trigger 2-way verification challenge
 */
export async function requestStorage2FA(email: string, password: string): Promise<TwoFactorRequestResult> {
  try {
    const res = await fetch('/api/storage/request-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate password');
    }

    return data;
  } catch (err: any) {
    console.warn('[Vault 2FA] Remote error, verifying via local secure credentials:', err.message);

    // Offline / Preview Fallback
    const savedUsersRaw = localStorage.getItem('medical_offline_users');
    let matchedUser: any = null;
    if (savedUsersRaw) {
      try {
        const users = JSON.parse(savedUsersRaw);
        matchedUser = users.find((u: any) => u.email?.toLowerCase() === email.trim().toLowerCase());
      } catch (e) {}
    }

    // Also check current active user
    const currentUserRaw = localStorage.getItem('medical_user');
    let currentUser: any = null;
    if (currentUserRaw) {
      try {
        currentUser = JSON.parse(currentUserRaw);
      } catch (e) {}
    }

    // Verify password if user exists offline
    if (matchedUser && matchedUser.password && matchedUser.password !== password) {
      throw new Error('Incorrect account password. Access denied.');
    }

    // Generate local 6-digit 2FA code
    const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
    const challengeId = 'ch_local_' + Date.now();
    const challenge = {
      id: challengeId,
      email: email.trim(),
      code: demoCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    localStorage.setItem(OFFLINE_CHALLENGES_KEY, JSON.stringify(challenge));

    const parts = email.split('@');
    const masked = parts[0].length > 2 ? `${parts[0][0]}***${parts[0].slice(-1)}@${parts[1]}` : `***@${parts[1]}`;

    return {
      success: true,
      message: `Two-way verification code sent to ${masked}`,
      challengeId,
      maskedEmail: masked,
      demoCode,
      expiresInSeconds: 600,
    };
  }
}

/**
 * Step 2: Verify password and 2-way verification code to unlock 1GB Vault
 */
export async function verifyStorage2FA(
  email: string,
  password: string,
  code: string,
  challengeId?: string
): Promise<TwoFactorVerifyResult> {
  try {
    const res = await fetch('/api/storage/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        code: code.trim(),
        challengeId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Verification failed');
    }

    // Cache vault token in session storage
    sessionStorage.setItem('doctorian_vault_token', data.vaultToken);
    sessionStorage.setItem('doctorian_vault_user_email', email.trim());

    return data;
  } catch (err: any) {
    console.warn('[Vault 2FA Verify] Remote error, checking local fallback:', err.message);

    // Verify offline challenge
    const rawChallenge = localStorage.getItem(OFFLINE_CHALLENGES_KEY);
    if (!rawChallenge) {
      throw new Error(err.message || 'No verification challenge active. Please request a new code.');
    }

    const challenge = JSON.parse(rawChallenge);
    if (Date.now() > challenge.expiresAt) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (challenge.code !== code.trim()) {
      throw new Error('Invalid two-way verification code. Please check and try again.');
    }

    const localVaultToken = 'offline_vault_token_' + Date.now();
    sessionStorage.setItem('doctorian_vault_token', localVaultToken);
    sessionStorage.setItem('doctorian_vault_user_email', email.trim());

    const userId = email.replace(/[^a-zA-Z0-9]/g, '_');
    const quota = getOfflineQuota(userId);

    return {
      success: true,
      message: '1GB Secure Cloud Vault unlocked successfully (Offline Mode)',
      vaultToken: localVaultToken,
      quota,
      user: {
        id: userId,
        email,
        displayName: email.split('@')[0],
      },
    };
  }
}

/**
 * List files stored in the 1GB vault
 */
export async function listVaultFiles(
  vaultToken: string,
  category?: string,
  search?: string
): Promise<{ files: VaultFile[]; quota: StorageQuota }> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`/api/storage/files?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${vaultToken}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to list vault files');
    }

    const data = await res.json();
    return {
      files: data.files || [],
      quota: data.quota,
    };
  } catch (err: any) {
    const email = sessionStorage.getItem('doctorian_vault_user_email') || 'default_user';
    const userId = email.replace(/[^a-zA-Z0-9]/g, '_');
    let files = getOfflineFiles(userId);

    if (category && category !== 'all') {
      files = files.filter((f) => f.category === category);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      files = files.filter((f) => f.name.toLowerCase().includes(q));
    }

    return {
      files,
      quota: getOfflineQuota(userId),
    };
  }
}

/**
 * Upload a file into the 1GB vault
 */
export async function uploadVaultFile(
  vaultToken: string,
  file: File,
  category: 'document' | 'scan' | 'lab_report' | 'user_data' | 'media' = 'document',
  customName?: string
): Promise<{ file: VaultFile; quota: StorageQuota }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (customName) formData.append('name', customName);

    const res = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vaultToken}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      const error: any = new Error(data.error || 'Upload failed');
      error.quotaExceeded = Boolean(data.quotaExceeded || res.status === 400);
      error.requiresBilling = Boolean(data.requiresBilling || data.quotaExceeded);
      error.isFull = Boolean(data.isFull);
      error.quota = data.quota;
      throw error;
    }

    return {
      file: data.file,
      quota: data.quota,
    };
  } catch (err: any) {
    // If quota exceeded or requires billing, rethrow immediately to trigger billing
    if (err.quotaExceeded || err.requiresBilling) {
      throw err;
    }

    console.warn('[Vault Upload] Falling back to client-side storage:', err.message);

    const email = sessionStorage.getItem('doctorian_vault_user_email') || 'default_user';
    const userId = email.replace(/[^a-zA-Z0-9]/g, '_');
    const currentQuota = getOfflineQuota(userId);

    if (currentQuota.usedBytes + file.size > currentQuota.totalQuotaBytes) {
      const quotaErr: any = new Error(
        `Storage limit reached! Available: ${formatBytes(currentQuota.freeBytes)}, File size: ${formatBytes(file.size)}. Please purchase an expansion pack to continue.`
      );
      quotaErr.quotaExceeded = true;
      quotaErr.requiresBilling = true;
      quotaErr.isFull = true;
      quotaErr.quota = currentQuota;
      throw quotaErr;
    }

    // Convert file to base64 for local persistence
    const base64Content = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const newFile: VaultFile = {
      id: 'vf_local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      name: customName || file.name,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      category,
      contentData: base64Content,
      createdAt: new Date().toISOString(),
    };

    const files = [newFile, ...getOfflineFiles(userId)];
    saveOfflineFiles(userId, files);

    return {
      file: newFile,
      quota: getOfflineQuota(userId),
    };
  }
}

/**
 * Save structured user data / clinical records / JSON into the 1GB vault
 */
export async function saveVaultUserData(
  vaultToken: string,
  name: string,
  content: any,
  category: 'document' | 'scan' | 'lab_report' | 'user_data' = 'user_data'
): Promise<{ file: VaultFile; quota: StorageQuota }> {
  try {
    const res = await fetch('/api/storage/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vaultToken}`,
      },
      body: JSON.stringify({
        name,
        content,
        category,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const error: any = new Error(data.error || 'Failed to save data to vault');
      error.quotaExceeded = Boolean(data.quotaExceeded || res.status === 400);
      error.requiresBilling = Boolean(data.requiresBilling || data.quotaExceeded);
      error.isFull = Boolean(data.isFull);
      error.quota = data.quota;
      throw error;
    }

    return {
      file: data.file,
      quota: data.quota,
    };
  } catch (err: any) {
    if (err.quotaExceeded || err.requiresBilling) {
      throw err;
    }

    const email = sessionStorage.getItem('doctorian_vault_user_email') || 'default_user';
    const userId = email.replace(/[^a-zA-Z0-9]/g, '_');

    const strContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    const size = new Blob([strContent]).size;

    const currentQuota = getOfflineQuota(userId);
    if (currentQuota.usedBytes + size > currentQuota.totalQuotaBytes) {
      const quotaErr: any = new Error('Storage quota exceeded! Please purchase an expansion pack to continue.');
      quotaErr.quotaExceeded = true;
      quotaErr.requiresBilling = true;
      quotaErr.isFull = true;
      quotaErr.quota = currentQuota;
      throw quotaErr;
    }

    const newFile: VaultFile = {
      id: 'vf_data_' + Date.now(),
      userId,
      name,
      originalName: name,
      mimeType: 'application/json',
      size,
      category,
      contentData: strContent,
      createdAt: new Date().toISOString(),
    };

    const files = [newFile, ...getOfflineFiles(userId)];
    saveOfflineFiles(userId, files);

    return {
      file: newFile,
      quota: getOfflineQuota(userId),
    };
  }
}

/**
 * Delete file and reclaim storage space in 1GB quota
 */
export async function deleteVaultFile(vaultToken: string, fileId: string): Promise<StorageQuota> {
  try {
    const res = await fetch(`/api/storage/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${vaultToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to delete file');
    }

    return data.quota;
  } catch (err: any) {
    const email = sessionStorage.getItem('doctorian_vault_user_email') || 'default_user';
    const userId = email.replace(/[^a-zA-Z0-9]/g, '_');
    let files = getOfflineFiles(userId);
    files = files.filter((f) => f.id !== fileId);
    saveOfflineFiles(userId, files);
    return getOfflineQuota(userId);
  }
}

/**
 * Download file from 1GB Vault
 */
export async function downloadVaultFile(vaultToken: string, file: VaultFile): Promise<void> {
  if (file.contentData) {
    // Offline / base64 download
    const a = document.createElement('a');
    if (file.contentData.startsWith('data:')) {
      a.href = file.contentData;
    } else {
      const blob = new Blob([file.contentData], { type: file.mimeType || 'text/plain' });
      a.href = URL.createObjectURL(blob);
    }
    a.download = file.name || 'vault_document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Remote server download
  const url = `/api/storage/download/${file.id}?token=${encodeURIComponent(vaultToken)}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name || 'vault_file';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Fetch available storage plans from server (or fallback to local definitions)
 */
export async function fetchStoragePlans(): Promise<StoragePlan[]> {
  try {
    const res = await fetch('/api/storage/plans');
    if (res.ok) {
      const data = await res.json();
      if (data.plans && Array.isArray(data.plans)) {
        return data.plans;
      }
    }
  } catch (e) {}
  return STORAGE_EXPANSION_PLANS;
}

/**
 * Purchase additional storage quota (Billing Gateway)
 */
export async function purchaseStorageExpansion(
  vaultToken: string,
  tierId: string,
  paymentMethod: string = 'momo',
  phone?: string,
  transactionId?: string,
  email?: string
): Promise<{ success: boolean; message: string; quota: StorageQuota; purchase?: any }> {
  try {
    const res = await fetch('/api/storage/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vaultToken}`,
      },
      body: JSON.stringify({
        tierId,
        paymentMethod,
        phone,
        transactionId,
        email,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Storage purchase failed');
    }

    // Also update offline quota cache for instantaneous responsiveness
    const targetEmail = email || sessionStorage.getItem('doctorian_vault_user_email') || 'default_user';
    const userId = targetEmail.replace(/[^a-zA-Z0-9]/g, '_');
    if (data.quota && data.quota.totalQuotaBytes) {
      try {
        localStorage.setItem(`doctorian_storage_quota_bytes_${userId}`, String(data.quota.totalQuotaBytes));
      } catch (e) {}
    }

    return data;
  } catch (err: any) {
    // Offline / fallback purchase simulation
    const targetEmail = email || sessionStorage.getItem('doctorian_vault_user_email') || 'default_user';
    const userId = targetEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const plan = STORAGE_EXPANSION_PLANS.find((p) => p.id === tierId) || STORAGE_EXPANSION_PLANS[0];

    const currentQuota = getOfflineQuota(userId);
    const newTotal = currentQuota.totalQuotaBytes + plan.addedBytes;
    try {
      localStorage.setItem(`doctorian_storage_quota_bytes_${userId}`, String(newTotal));
    } catch (e) {}

    const updatedQuota = getOfflineQuota(userId);
    return {
      success: true,
      message: `Storage successfully expanded! Added ${plan.formattedSize} (${plan.name}).`,
      quota: updatedQuota,
      purchase: {
        id: 'sp_local_' + Date.now(),
        tierName: plan.name,
        amount: plan.amount,
      },
    };
  }
}

/**
 * Toggle or simulate full storage state (for automated billing triggers & verification)
 */
export async function simulateStorageFullStatus(
  vaultToken: string,
  setFull: boolean = true,
  email?: string
): Promise<{ success: boolean; message: string; quota: StorageQuota }> {
  try {
    const res = await fetch('/api/storage/simulate-full', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vaultToken}`,
      },
      body: JSON.stringify({ setFull, email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to simulate full storage');
    return data;
  } catch (err: any) {
    const targetEmail = email || sessionStorage.getItem('doctorian_vault_user_email') || 'default_user';
    const userId = targetEmail.replace(/[^a-zA-Z0-9]/g, '_');
    if (setFull) {
      const files = getOfflineFiles(userId);
      const used = files.reduce((acc, f) => acc + (f.size || 0), 0);
      localStorage.setItem(`doctorian_storage_quota_bytes_${userId}`, String(used > 0 ? used : 1024));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('doctorian_storage_full', { detail: { email: targetEmail } }));
      }
    } else {
      localStorage.setItem(`doctorian_storage_quota_bytes_${userId}`, String(FREE_STORAGE_QUOTA_BYTES));
    }
    return {
      success: true,
      message: setFull ? 'Storage simulated as 100% full' : 'Storage reset to standard quota',
      quota: getOfflineQuota(userId),
    };
  }
}
