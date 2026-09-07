import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  HardDrive,
  Key,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  X,
  CheckCircle,
  AlertTriangle,
  Database,
  Search,
  ArrowRight,
  Sparkles,
  FilePlus,
  Server,
  Fingerprint,
  ShoppingCart,
  CreditCard,
  ChevronRight,
  Sparkle,
  Check,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  formatBytes,
  requestStorage2FA,
  verifyStorage2FA,
  listVaultFiles,
  uploadVaultFile,
  saveVaultUserData,
  deleteVaultFile,
  downloadVaultFile,
  FREE_STORAGE_QUOTA_BYTES,
  StorageQuota,
  VaultFile,
  StoragePlan,
  STORAGE_EXPANSION_PLANS,
  fetchStoragePlans,
  purchaseStorageExpansion,
  simulateStorageFullStatus,
} from '../utils/storageVaultApi';

interface StorageVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigateToBilling?: (tab?: 'storage' | 'plans') => void;
}

export const StorageVaultModal: React.FC<StorageVaultModalProps> = ({
  isOpen,
  onClose,
  user,
  onShowToast,
  onNavigateToBilling,
}) => {
  // Authentication & 2FA State
  const [authStep, setAuthStep] = useState<'password' | '2fa' | 'unlocked'>('password');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [challengeId, setChallengeId] = useState<string | undefined>();
  const [maskedEmail, setMaskedEmail] = useState('');
  const [demoCodeHint, setDemoCodeHint] = useState<string | undefined>();
  const [timerSeconds, setTimerSeconds] = useState(600);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Vault Content State
  const [vaultToken, setVaultToken] = useState<string>('');
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [quota, setQuota] = useState<StorageQuota>({
    totalQuotaBytes: FREE_STORAGE_QUOTA_BYTES,
    usedBytes: 0,
    freeBytes: FREE_STORAGE_QUOTA_BYTES,
    fileCount: 0,
    percentUsed: 0,
  });
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'document' | 'scan' | 'lab_report' | 'user_data' | 'media'>('document');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewFileItem, setPreviewFileItem] = useState<VaultFile | null>(null);

  // Storage Quota Full & Automatic Billing States
  const [showStorageBilling, setShowStorageBilling] = useState<boolean>(false);
  const [billingReason, setBillingReason] = useState<'quota_full' | 'upload_overflow' | 'manual' | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [storagePlans, setStoragePlans] = useState<StoragePlan[]>(STORAGE_EXPANSION_PLANS);
  const [selectedStorageTier, setSelectedStorageTier] = useState<string>('storage_20gb');
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<'momo' | 'flutterwave' | 'neural'>('momo');
  const [billingMomoPhone, setBillingMomoPhone] = useState<string>(user?.phone || '');
  const [isPurchasingStorage, setIsPurchasingStorage] = useState<boolean>(false);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);
  const [isSimulatingFull, setIsSimulatingFull] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available expansion plans on mount
  useEffect(() => {
    fetchStoragePlans()
      .then((plans) => {
        if (plans && plans.length > 0) setStoragePlans(plans);
      })
      .catch(() => {});
  }, []);

  // Check if already unlocked in this browser session
  useEffect(() => {
    if (isOpen) {
      const savedToken = sessionStorage.getItem('doctorian_vault_token');
      const savedEmail = sessionStorage.getItem('doctorian_vault_user_email');
      const currentEmail = user?.email || 'user@example.com';

      if (savedToken && savedEmail === currentEmail) {
        setVaultToken(savedToken);
        setAuthStep('unlocked');
        loadVaultContent(savedToken);
      } else {
        setAuthStep('password');
        setPassword('');
        setTwoFactorCode('');
        setAuthError(null);
      }
    }
  }, [isOpen, user?.email]);

  // AUTOMATIC BILLING TRIGGER: Whenever storage is detected as 100% full or quota exceeded
  useEffect(() => {
    if (authStep === 'unlocked' && quota) {
      const isFull = Boolean(
        quota.isFull ||
        quota.usedBytes >= quota.totalQuotaBytes ||
        quota.percentUsed >= 100 ||
        quota.freeBytes <= 0
      );
      if (isFull) {
        setShowStorageBilling(true);
        setBillingReason((prev) => prev || 'quota_full');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('doctorian_storage_full', { detail: { quota } }));
        }
      }
    }
  }, [quota, authStep]);

  // Timer countdown for 2FA code
  useEffect(() => {
    let timer: any;
    if (authStep === '2fa' && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, timerSeconds]);

  // Load vault files and quota
  const loadVaultContent = async (token: string) => {
    setIsLoadingFiles(true);
    try {
      const result = await listVaultFiles(token);
      setFiles(result.files);
      setQuota(result.quota);
      if (
        result.quota &&
        (result.quota.isFull ||
          result.quota.usedBytes >= result.quota.totalQuotaBytes ||
          result.quota.percentUsed >= 100)
      ) {
        setShowStorageBilling(true);
        setBillingReason('quota_full');
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message, 'error');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Step 1: Submit password to request 2FA challenge
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setAuthError('Please enter your account password.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    const email = user?.email || 'demo@doctorian.com';

    try {
      const res = await requestStorage2FA(email, password);
      setChallengeId(res.challengeId);
      setMaskedEmail(res.maskedEmail || email);
      setDemoCodeHint(res.demoCode);
      setTimerSeconds(res.expiresInSeconds || 600);
      setAuthStep('2fa');
      if (onShowToast) {
        onShowToast('Password verified. Security code dispatched!', 'success');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Incorrect password. Please verify credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Step 2: Submit 2FA code to unlock vault
  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setAuthError('Please enter the 6-digit security code.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    const email = user?.email || 'demo@doctorian.com';

    try {
      const res = await verifyStorage2FA(email, password, twoFactorCode, challengeId);
      setVaultToken(res.vaultToken);
      setQuota(res.quota);
      setAuthStep('unlocked');
      loadVaultContent(res.vaultToken);
      if (onShowToast) {
        onShowToast('1GB Free Cloud Vault Unlocked!', 'success');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Lock the vault
  const handleLockVault = () => {
    sessionStorage.removeItem('doctorian_vault_token');
    sessionStorage.removeItem('doctorian_vault_user_email');
    setVaultToken('');
    setAuthStep('password');
    setPassword('');
    setTwoFactorCode('');
    setShowStorageBilling(false);
    if (onShowToast) onShowToast('1GB Vault successfully locked.', 'info');
  };

  // Simulate full storage status (for immediate testing of automatic billing)
  const handleSimulateFullToggle = async () => {
    setIsSimulatingFull(true);
    try {
      const willBeFull = !quota.isFull && quota.percentUsed < 100;
      const res = await simulateStorageFullStatus(vaultToken, willBeFull, user?.email);
      setQuota(res.quota);
      if (willBeFull) {
        setShowStorageBilling(true);
        setBillingReason('quota_full');
        if (onShowToast) {
          onShowToast('Storage simulated as 100% full! Billing opened automatically for purchase.', 'info');
        }
      } else {
        setShowStorageBilling(false);
        setBillingReason(null);
        if (onShowToast) {
          onShowToast('Storage reset to standard quota.', 'success');
        }
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Failed to simulate storage state', 'error');
    } finally {
      setIsSimulatingFull(false);
    }
  };

  // Handle storage expansion purchase
  const handlePurchaseStorage = async () => {
    setIsPurchasingStorage(true);
    setPurchaseSuccessMessage(null);
    try {
      const res = await purchaseStorageExpansion(
        vaultToken,
        selectedStorageTier,
        billingPaymentMethod,
        billingMomoPhone,
        `TX-VAULT-${Date.now()}`,
        user?.email
      );

      setQuota(res.quota);
      setPurchaseSuccessMessage(res.message);
      if (onShowToast) onShowToast(res.message, 'success');

      // If pending file exists and can now fit in quota, attempt auto-upload
      if (pendingFile && res.quota.freeBytes >= pendingFile.size) {
        try {
          setIsUploading(true);
          const upRes = await uploadVaultFile(vaultToken, pendingFile, uploadCategory);
          setFiles((prev) => [upRes.file, ...prev]);
          setQuota(upRes.quota);
          const uploadedName = pendingFile.name;
          setPendingFile(null);
          if (onShowToast) {
            onShowToast(`"${uploadedName}" automatically uploaded to your expanded vault!`, 'success');
          }
        } catch (upErr: any) {
          console.warn('Pending file auto-upload failed:', upErr);
        } finally {
          setIsUploading(false);
        }
      }

      // Close billing overlay after brief confirmation
      setTimeout(() => {
        setShowStorageBilling(false);
        setBillingReason(null);
      }, 2500);
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Storage purchase failed', 'error');
    } finally {
      setIsPurchasingStorage(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check size against remaining quota
    if (quota.usedBytes + file.size > quota.totalQuotaBytes || quota.freeBytes < file.size) {
      setPendingFile(file);
      setShowStorageBilling(true);
      setBillingReason('upload_overflow');
      if (onShowToast) {
        onShowToast(
          `Storage full! "${file.name}" requires ${formatBytes(file.size)} (${formatBytes(quota.freeBytes)} available). Billing opened automatically to purchase storage.`,
          'error'
        );
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      setUploadProgress(60);
      const res = await uploadVaultFile(vaultToken, file, uploadCategory);
      setUploadProgress(100);
      setFiles((prev) => [res.file, ...prev]);
      setQuota(res.quota);
      if (onShowToast) {
        onShowToast(`"${file.name}" saved to your cloud vault!`, 'success');
      }
    } catch (err: any) {
      if (err.quotaExceeded || err.requiresBilling) {
        setPendingFile(file);
        setShowStorageBilling(true);
        setBillingReason('upload_overflow');
        if (onShowToast) {
          onShowToast(
            'Storage quota exceeded! Billing opened automatically for expansion purchase.',
            'error'
          );
        }
      } else {
        if (onShowToast) onShowToast(err.message || 'Upload failed', 'error');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Backup current health & telemetry data to 1GB Vault
  const handleBackupHealthData = async () => {
    setIsUploading(true);
    try {
      const backupPayload = {
        app: 'Doctorian Medical AI',
        user: {
          email: user?.email,
          displayName: user?.displayName,
          role: user?.role,
        },
        timestamp: new Date().toISOString(),
        backupType: 'Full Telemetry & Clinical Snapshot',
        healthRecords: localStorage.getItem('doctorian_medical_records') || '[]',
        vitalsTelemetry: localStorage.getItem('doctorian_live_vitals') || '{}',
        registeredPatients: localStorage.getItem('doctorian_registered_patients') || '[]',
      };

      const filename = `Clinical_Snapshot_${new Date().toISOString().slice(0, 10)}.json`;
      const res = await saveVaultUserData(vaultToken, filename, backupPayload, 'user_data');

      setFiles((prev) => [res.file, ...prev]);
      setQuota(res.quota);
      if (onShowToast) {
        onShowToast('Health data snapshot saved to your 1GB Vault!', 'success');
      }
    } catch (err: any) {
      if (err.quotaExceeded || err.requiresBilling) {
        setShowStorageBilling(true);
        setBillingReason('quota_full');
        if (onShowToast) {
          onShowToast('Storage full! Billing opened automatically to purchase extra storage.', 'error');
        }
      } else {
        if (onShowToast) onShowToast(err.message, 'error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This will reclaim its storage space.`)) {
      return;
    }

    try {
      const updatedQuota = await deleteVaultFile(vaultToken, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setQuota(updatedQuota);
      if (onShowToast) onShowToast(`"${fileName}" deleted. Space reclaimed!`, 'info');
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Failed to delete file', 'error');
    }
  };

  // Filtered files
  const filteredFiles = files.filter((file) => {
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      file.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* ========================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  1GB Free Cloud Storage Vault
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Real 1GB Quota
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Military-grade encrypted files, documents & user health data storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authStep === 'unlocked' && (
              <button
                type="button"
                onClick={handleLockVault}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                title="Lock Vault"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock Vault</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY: GATEWAY (PASSWORD + 2FA) OR UNLOCKED VAULT */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {/* ---------------------------------------------------- */}
            {/* STEP 1: PASSWORD GATEWAY */}
            {/* ---------------------------------------------------- */}
            {authStep === 'password' && (
              <motion.div
                key="password_step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto py-6 sm:py-10 space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold tracking-tight">Security Checkpoint</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Your account has been granted <strong className="text-indigo-600 dark:text-indigo-400 font-bold">1GB of free real cloud storage</strong>. To access your files, documents, and medical data, verify your identity.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                    {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {user?.displayName || 'Registered Account'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || 'demo@doctorian.com'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    <Key className="w-3 h-3" /> Step 1 of 2
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Account Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your account password"
                        className="w-full px-3.5 py-2.5 pl-10 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Verifying Password...
                      </>
                    ) : (
                      <>
                        Continue to Two-Way Verification
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
                    Two-way multi-factor security mandated for all medical storage vaults
                  </p>
                </div>
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* STEP 2: TWO-WAY VERIFICATION CODE */}
            {/* ---------------------------------------------------- */}
            {authStep === '2fa' && (
              <motion.div
                key="2fa_step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto py-6 sm:py-10 space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <Key className="w-8 h-8 animate-pulse" />
                  </div>
                  <h4 className="text-xl font-bold tracking-tight">Two-Way Verification</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    A 6-digit one-time security code has been dispatched to:
                  </p>
                  <p className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 py-1 px-3 rounded-lg inline-block border border-indigo-200 dark:border-indigo-800">
                    {maskedEmail}
                  </p>
                </div>

                {/* Demo / Live Code Quick-Fill Banner */}
                {demoCodeHint && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Security Passcode (Live Dispatch):</p>
                      <p className="font-mono text-sm tracking-widest font-extrabold">{demoCodeHint}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactorCode(demoCodeHint)}
                      className="px-2.5 py-1 bg-amber-200 dark:bg-amber-800/60 rounded-lg font-bold text-[11px] hover:bg-amber-300 transition-colors"
                    >
                      Autofill Code
                    </button>
                  </div>
                )}

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                    <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
                      <span>Expires in: {Math.floor(timerSeconds / 60)}:{('0' + (timerSeconds % 60)).slice(-2)}</span>
                      <button
                        type="button"
                        onClick={handlePasswordSubmit}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthStep('password')}
                      className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isAuthenticating || twoFactorCode.length < 6}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAuthenticating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Unlock 1GB Vault
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* STEP 3: UNLOCKED 1GB CLOUD STORAGE VAULT */}
            {/* ---------------------------------------------------- */}
            {authStep === 'unlocked' && (
              <motion.div
                key="unlocked_vault"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* 1GB STORAGE METRIC BANNER */}
                <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-4 transition-all ${
                  quota.isFull || quota.percentUsed >= 100
                    ? 'bg-gradient-to-br from-rose-50 via-white to-amber-50/50 dark:from-rose-950/40 dark:via-slate-800/60 dark:to-amber-950/20 border-rose-400 dark:border-rose-800 ring-2 ring-rose-500/20'
                    : 'bg-gradient-to-br from-indigo-50/90 via-slate-50 to-purple-50/50 dark:from-indigo-950/30 dark:via-slate-800/40 dark:to-purple-950/20 border-indigo-200/80 dark:border-indigo-800/50'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shadow ${
                        quota.isFull || quota.percentUsed >= 100 ? 'bg-rose-600' : 'bg-indigo-600'
                      }`}>
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {quota.totalQuotaBytes > FREE_STORAGE_QUOTA_BYTES
                              ? `Expanded Cloud Vault (${formatBytes(quota.totalQuotaBytes)})`
                              : 'Real 1GB Account Allocation'}
                          </h4>
                          {(quota.isFull || quota.percentUsed >= 100) && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                              Full
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatBytes(quota.usedBytes)} used of {formatBytes(quota.totalQuotaBytes)} ({quota.percentUsed}% filled)
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Interactive Simulation Button for Testing */}
                      <button
                        type="button"
                        onClick={handleSimulateFullToggle}
                        disabled={isSimulatingFull}
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1 ${
                          quota.isFull || quota.percentUsed >= 100
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                        }`}
                        title="Simulate 100% full storage or reset to test automatic billing"
                      >
                        {isSimulatingFull ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : quota.isFull || quota.percentUsed >= 100 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{quota.isFull || quota.percentUsed >= 100 ? 'Reset Quota' : 'Simulate 100% Full'}</span>
                      </button>

                      {/* Manual trigger for billing view */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowStorageBilling((prev) => !prev);
                          setBillingReason('manual');
                        }}
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 ${
                          showStorageBilling
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                            : quota.isFull || quota.percentUsed >= 100
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm animate-pulse'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{showStorageBilling ? 'Hide Billing' : 'Buy Storage'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBackupHealthData}
                        disabled={isUploading || quota.isFull || quota.freeBytes <= 0}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-40"
                        title="Snapshot current medical vitals & patient profile"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Backup Health</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-600/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                          quota.isFull || quota.percentUsed >= 100
                            ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.max(2, Math.min(100, quota.percentUsed))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span>Used: {formatBytes(quota.usedBytes)}</span>
                      <span className={`font-semibold ${
                        quota.isFull || quota.freeBytes <= 0
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        Remaining: {formatBytes(quota.freeBytes)}
                      </span>
                    </div>
                  </div>

                  {/* 4 Stat Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Total Stored</p>
                        <p className="text-xs font-bold">{quota.fileCount} items</p>
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Documents</p>
                        <p className="text-xs font-bold">
                          {files.filter((f) => f.category === 'document').length} files
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Scans & Labs</p>
                        <p className="text-xs font-bold">
                          {files.filter((f) => f.category === 'scan' || f.category === 'lab_report').length} files
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
                      {quota.isFull || quota.percentUsed >= 100 ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      )}
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                        <p className={`text-xs font-bold ${
                          quota.isFull || quota.percentUsed >= 100
                            ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {quota.isFull || quota.percentUsed >= 100 ? 'Storage Full' : '2FA Verified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* AUTOMATIC STORAGE BILLING & EXPANSION PURCHASE SECTION */}
                {/* Appears automatically whenever storage is full or overflow occurs */}
                {/* ========================================================= */}
                <AnimatePresence>
                  {showStorageBilling && (
                    <motion.div
                      initial={{ opacity: 0, y: -12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      className="rounded-2xl sm:rounded-3xl border-2 border-rose-500/80 dark:border-rose-600 bg-gradient-to-b from-rose-50/95 via-white to-indigo-50/30 dark:from-rose-950/40 dark:via-slate-900 dark:to-indigo-950/20 p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-5"
                    >
                      {/* Alert Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Storage Full • Automatic Billing Activated</span>
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            Purchase Additional Cloud Storage
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {billingReason === 'upload_overflow' && pendingFile ? (
                              <>
                                Your storage quota cannot fit{' '}
                                <strong className="text-rose-600 dark:text-rose-400 font-semibold">
                                  {pendingFile.name}
                                </strong>{' '}
                                ({formatBytes(pendingFile.size)}). You currently have only{' '}
                                <strong className="font-semibold">{formatBytes(quota.freeBytes)}</strong> remaining of your{' '}
                                {formatBytes(quota.totalQuotaBytes)} quota.
                              </>
                            ) : (
                              <>
                                Your account cloud storage is{' '}
                                <strong className="text-rose-600 dark:text-rose-400 font-bold">100% full</strong> (
                                {formatBytes(quota.usedBytes)} of {formatBytes(quota.totalQuotaBytes)} used). Select a
                                storage expansion pack below to immediately continue storing files.
                              </>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start">
                          {onNavigateToBilling && (
                            <button
                              type="button"
                              onClick={() => onNavigateToBilling('storage')}
                              className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Open dedicated Full Billing page"
                            >
                              <span>Full Billing Hub</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setShowStorageBilling(false);
                              setBillingReason(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Dismiss billing for now"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Plan Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {storagePlans.map((plan) => {
                          const isSelected = selectedStorageTier === plan.id;
                          return (
                            <div
                              key={plan.id}
                              onClick={() => setSelectedStorageTier(plan.id)}
                              className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-indigo-500/20'
                                  : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                                    +{plan.formattedSize}
                                  </span>
                                  {plan.isPopular && (
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{plan.name}</h5>
                                <div className="my-2 flex items-baseline gap-1">
                                  <span className="text-base font-black text-slate-900 dark:text-white">
                                    {plan.amount.toLocaleString()} UGX
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{plan.period}</span>
                                </div>
                                <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 my-2">
                                  {plan.features.slice(0, 2).map((feat, idx) => (
                                    <li key={idx} className="flex items-center gap-1 truncate">
                                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                      <span className="truncate">{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                                <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                  {isSelected ? '✓ Selected' : 'Select Pack'}
                                </span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Checkout & Payment Options Bar */}
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Payment Gateway</p>
                            <p className="text-[11px] text-slate-400">Choose mobile money or card settlement</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setBillingPaymentMethod('momo')}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                billingPaymentMethod === 'momo'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              MTN MoMo
                            </button>
                            <button
                              type="button"
                              onClick={() => setBillingPaymentMethod('flutterwave')}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                billingPaymentMethod === 'flutterwave'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              Card / Flutterwave
                            </button>
                            <button
                              type="button"
                              onClick={() => setBillingPaymentMethod('neural')}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                billingPaymentMethod === 'neural'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              Neural Units
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          {billingPaymentMethod === 'momo' ? (
                            <div className="flex-1 w-full">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                MTN Mobile Money Number
                              </label>
                              <input
                                type="tel"
                                value={billingMomoPhone}
                                onChange={(e) => setBillingMomoPhone(e.target.value)}
                                placeholder="e.g. 077XXXXXXX or 078XXXXXXX"
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                              />
                            </div>
                          ) : (
                            <div className="flex-1 w-full text-xs text-slate-500 dark:text-slate-400">
                              {billingPaymentMethod === 'flutterwave'
                                ? 'Instant payment processing via Flutterwave 3DS secure channel.'
                                : 'Instantly debited from your clinical Neural Energy quota.'}
                            </div>
                          )}

                          <div className="w-full sm:w-auto flex items-center gap-2 pt-1 sm:pt-4">
                            <button
                              type="button"
                              onClick={handlePurchaseStorage}
                              disabled={isPurchasingStorage}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-indigo-700 hover:from-rose-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                            >
                              {isPurchasingStorage ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Activating Storage...</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>
                                    Authorize & Purchase +
                                    {storagePlans.find((p) => p.id === selectedStorageTier)?.formattedSize || 'Storage'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {purchaseSuccessMessage && (
                          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{purchaseSuccessMessage}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* HIDDEN FILE INPUT */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="*/*"
                />

                {/* UPLOAD & CONTROLS TOOLBAR */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                    {[
                      { id: 'all', label: 'All Files' },
                      { id: 'document', label: 'Documents' },
                      { id: 'scan', label: 'Scans' },
                      { id: 'lab_report', label: 'Lab Reports' },
                      { id: 'user_data', label: 'User Data' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedCategory(tab.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                          selectedCategory === tab.id
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar & Category Picker for Upload */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>

                    <select
                      value={uploadCategory}
                      onChange={(e: any) => setUploadCategory(e.target.value)}
                      className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                    >
                      <option value="document">Category: Doc</option>
                      <option value="scan">Category: Scan</option>
                      <option value="lab_report">Category: Lab</option>
                      <option value="user_data">Category: Data</option>
                      <option value="media">Category: Media</option>
                    </select>
                  </div>
                </div>

                {/* UPLOAD PROGRESS INDICATION */}
                {isUploading && (
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">Encrypting & writing into your 1GB free storage...</p>
                      {uploadProgress !== null && (
                        <div className="w-full bg-indigo-200 dark:bg-indigo-800 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FILE LIST VIEW */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-sm">
                  {isLoadingFiles ? (
                    <div className="py-16 text-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                      <p className="text-xs text-slate-500">Loading your secure documents...</p>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="py-16 px-4 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto">
                        <FilePlus className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {searchQuery ? 'No matching files found' : 'Your 1GB Vault is ready'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                          You have 1.00 GB of free storage allocated. Upload your medical scans, clinical reports, or click "Backup Health Data" above.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm inline-flex items-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Upload First Document
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                              {file.category === 'scan' ? (
                                <Eye className="w-5 h-5 text-purple-500" />
                              ) : file.category === 'lab_report' ? (
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                              ) : file.category === 'user_data' ? (
                                <Database className="w-5 h-5 text-amber-500" />
                              ) : (
                                <FileText className="w-5 h-5 text-blue-500" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="font-mono font-medium">{formatBytes(file.size)}</span>
                                <span>•</span>
                                <span className="capitalize">{file.category.replace('_', ' ')}</span>
                                <span>•</span>
                                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewFileItem(file)}
                              className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                              title="Preview Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadVaultFile(vaultToken, file)}
                              className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              title="Download File"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file.id, file.name)}
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* STORAGE FOOTNOTE */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Every registered user account is allocated 1GB (1,073,741,824 bytes) of free storage.</span>
                  </div>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">AES-256 Cloud Vault</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================= */}
        {/* PREVIEW SUB-MODAL */}
        {/* ========================================================= */}
        {previewFileItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h5 className="font-bold text-sm truncate pr-2">{previewFileItem.name}</h5>
                <button
                  type="button"
                  onClick={() => setPreviewFileItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Size:</span>
                  <span className="font-mono font-bold">{formatBytes(previewFileItem.size)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">MIME Type:</span>
                  <span className="font-mono">{previewFileItem.mimeType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Category:</span>
                  <span className="capitalize font-semibold">{previewFileItem.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Created:</span>
                  <span>{new Date(previewFileItem.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadVaultFile(vaultToken, previewFileItem)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFileItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
