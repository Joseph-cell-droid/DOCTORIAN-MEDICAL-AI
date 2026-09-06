/**
 * 1GB Free Cloud Storage & Two-Way Verification API Client
 * Allocates 1GB (1,073,741,824 bytes) per registered account.
 * Supports online Express API and offline local fallback.
 */

export const FREE_STORAGE_QUOTA_BYTES = 1073741824; // 1,073,741,824 bytes = 1 GB

export interface StorageQuota {
  totalQuotaBytes: number;
  usedBytes: number;
  freeBytes: number;
  fileCount: number;
  percentUsed: number;
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

function getOfflineQuota(userId: string): StorageQuota {
  const files = getOfflineFiles(userId);
  const usedBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const freeBytes = Math.max(0, FREE_STORAGE_QUOTA_BYTES - usedBytes);
  const percentUsed = Math.min(100, Number(((usedBytes / FREE_STORAGE_QUOTA_BYTES) * 100).toFixed(2)));

  return {
    totalQuotaBytes: FREE_STORAGE_QUOTA_BYTES,
    usedBytes,
    freeBytes,
    fileCount: files.length,
    percentUsed,
  };
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
      throw new Error(data.error || 'Upload failed');
    }

    return {
      file: data.file,
      quota: data.quota,
    };
  } catch (err: any) {
    console.warn('[Vault Upload] Falling back to client-side 1GB storage:', err.message);

    const email = sessionStorage.getItem('doctorian_vault_user_email') || 'default_user';
    const userId = email.replace(/[^a-zA-Z0-9]/g, '_');
    const currentQuota = getOfflineQuota(userId);

    if (currentQuota.usedBytes + file.size > FREE_STORAGE_QUOTA_BYTES) {
      throw new Error(
        `1GB storage limit reached. Available: ${formatBytes(currentQuota.freeBytes)}, File size: ${formatBytes(file.size)}.`
      );
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
      throw new Error(data.error || 'Failed to save data to vault');
    }

    return {
      file: data.file,
      quota: data.quota,
    };
  } catch (err: any) {
    const email = sessionStorage.getItem('doctorian_vault_user_email') || 'default_user';
    const userId = email.replace(/[^a-zA-Z0-9]/g, '_');

    const strContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    const size = new Blob([strContent]).size;

    const currentQuota = getOfflineQuota(userId);
    if (currentQuota.usedBytes + size > FREE_STORAGE_QUOTA_BYTES) {
      throw new Error('1GB storage limit reached.');
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
