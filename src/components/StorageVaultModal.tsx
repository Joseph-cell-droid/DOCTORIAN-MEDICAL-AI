import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Check,
  Zap,
  Copy,
  History,
  Activity,
  FileCheck,
  Shield,
  Layers,
  Clock,
  Globe,
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
  quickUnlockVault,
  syncClinicalRecordToVault,
  generateSampleVaultFile,
  getVaultAuditLogs,
  getVaultStatus,
  AuditLogEntry,
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
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Clinical Actions State
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [isSyncingEHR, setIsSyncingEHR] = useState(false);

  // Audit Logs State
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

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
  const [deviceStorage, setDeviceStorage] = useState<{ usage: number; quota: number; persisted?: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real device/browser hardware storage estimate
  const refreshDeviceStorage = () => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage !== undefined && est.quota !== undefined) {
          if (navigator.storage.persisted) {
            navigator.storage.persisted().then((persisted) => {
              setDeviceStorage({ usage: est.usage || 0, quota: est.quota || 0, persisted });
            }).catch(() => {
              setDeviceStorage({ usage: est.usage || 0, quota: est.quota || 0 });
            });
          } else {
            setDeviceStorage({ usage: est.usage || 0, quota: est.quota || 0 });
          }
        }
      }).catch(() => {});
    }
  };

  useEffect(() => {
    refreshDeviceStorage();
  }, [authStep]);

  // Compute live breakdown by clinical category
  const storageBreakdown = useMemo(() => {
    const counts = {
      document: 0,
      scan: 0,
      lab_report: 0,
      user_data: 0,
      media: 0,
    };
    const bytes = {
      document: 0,
      scan: 0,
      lab_report: 0,
      user_data: 0,
      media: 0,
    };

    files.forEach((f) => {
      const cat = f.category as keyof typeof counts;
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
        bytes[cat] += f.size || 0;
      } else {
        counts.document += 1;
        bytes.document += f.size || 0;
      }
    });

    return { counts, bytes };
  }, [files]);

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

  // Quick Unlock via Active Verified Session
  const handleQuickUnlock = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await quickUnlockVault('active_session');
      setVaultToken(res.vaultToken);
      setQuota(res.quota);
      setAuthStep('unlocked');
      loadVaultContent(res.vaultToken);
      if (onShowToast) {
        onShowToast('1GB Free Cloud Vault unlocked via active verified session!', 'success');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Quick unlock failed. Please use account password.');
    } finally {
      setIsAuthenticating(false);
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
    setShowAuditLogs(false);
    if (onShowToast) onShowToast('1GB Cloud Vault locked securely.', 'info');
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

    // Dangerous extension check on frontend
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.vbs', '.scr'];
    const hasBadExt = dangerousExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (hasBadExt) {
      if (onShowToast) {
        onShowToast(`Security restriction: Executable files (${file.name}) are blocked from the medical storage vault.`, 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

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
    setUploadProgress(25);

    try {
      setUploadProgress(65);
      const res = await uploadVaultFile(vaultToken, file, uploadCategory);
      setUploadProgress(100);
      setFiles((prev) => [res.file, ...prev]);
      setQuota(res.quota);
      if (onShowToast) {
        onShowToast(`"${file.name}" saved with SHA-256 cryptographic verification!`, 'success');
      }
    } catch (err: any) {
      if (err.quotaExceeded || err.requiresBilling) {
        setPendingFile(file);
        setShowStorageBilling(true);
        setBillingReason('upload_overflow');
        if (onShowToast) {
          onShowToast('Storage quota exceeded! Billing opened automatically for expansion purchase.', 'error');
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

  // Generate Sample Clinical Test File
  const handleGenerateSample = async (sampleType: 'dicom_mri' | 'lab_panel' | 'cardiac_ecg') => {
    setIsGeneratingSample(true);
    try {
      const res = await generateSampleVaultFile(vaultToken, sampleType);
      setFiles((prev) => [res.file, ...prev]);
      setQuota(res.quota);
      if (onShowToast) {
        onShowToast(res.message || 'Sample clinical file generated and stored with SHA-256 hash!', 'success');
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Failed to generate sample file', 'error');
    } finally {
      setIsGeneratingSample(false);
    }
  };

  // Sync Clinical Records & Telemetry
  const handleSyncClinicalTelemetry = async () => {
    setIsSyncingEHR(true);
    try {
      const ehrSnapshot = {
        app: 'Doctorian Cloud Medical AI',
        user: {
          email: user?.email,
          displayName: user?.displayName,
          role: user?.role,
        },
        timestamp: new Date().toISOString(),
        vitalsTelemetry: localStorage.getItem('doctorian_live_vitals') || '{}',
        medicalRecords: localStorage.getItem('doctorian_medical_records') || '[]',
        registeredPatients: localStorage.getItem('doctorian_registered_patients') || '[]',
        clinicalRoadmap: localStorage.getItem('doctorian_treatment_plans') || '[]',
        securityCompliance: 'HIPAA & GDPR Encrypted Cloud Isolation',
      };

      const title = `EHR_Clinical_Snapshot_${new Date().toISOString().slice(0, 10)}`;
      const res = await syncClinicalRecordToVault(vaultToken, title, ehrSnapshot, 'clinical_telemetry');

      setFiles((prev) => [res.file, ...prev]);
      setQuota(res.quota);
      if (onShowToast) {
        onShowToast('Clinical telemetry & EHR snapshot synced into your 1GB vault!', 'success');
      }
    } catch (err: any) {
      if (err.quotaExceeded || err.requiresBilling) {
        setShowStorageBilling(true);
        setBillingReason('quota_full');
        if (onShowToast) {
          onShowToast('Storage full! Billing opened automatically to purchase extra storage.', 'error');
        }
      } else {
        if (onShowToast) onShowToast(err.message || 'Sync failed', 'error');
      }
    } finally {
      setIsSyncingEHR(false);
    }
  };

  // Open Security Audit Logs
  const handleOpenAuditLogs = async () => {
    setShowAuditLogs(true);
    setIsLoadingAudit(true);
    try {
      const logs = await getVaultAuditLogs(vaultToken);
      setAuditLogs(logs);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setIsLoadingAudit(false);
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
      if (onShowToast) onShowToast(`"${fileName}" deleted. Storage reclaimed!`, 'info');
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Failed to delete file', 'error');
    }
  };

  // Copy SHA-256 hash to clipboard
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    if (onShowToast) onShowToast('SHA-256 hash copied to clipboard!', 'info');
    setTimeout(() => setCopiedHash(null), 2000);
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
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* ========================================================= */}
        {/* MODAL HEADER WITH CLOUD COMPUTING METRICS */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  1GB Cloud Computing Storage Vault
                </h3>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Real 1GB Free Quota
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                SHA-256 Bit-Level Verification • AES-256-GCM Military Encryption • Isolated Tenant Namespace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authStep === 'unlocked' && (
              <button
                type="button"
                onClick={handleLockVault}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
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
        {/* MODAL BODY */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* ---------------------------------------------------- */}
            {/* STEP 1: PASSWORD & QUICK UNLOCK GATEWAY */}
            {/* ---------------------------------------------------- */}
            {authStep === 'password' && (
              <motion.div
                key="password_step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto py-6 sm:py-8 space-y-5"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold tracking-tight">Security Checkpoint</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Your account has been allocated <strong className="text-indigo-600 dark:text-indigo-400 font-bold">1GB of free real cloud storage</strong>. Unlock below to access your files and diagnostic data.
                  </p>
                </div>

                {/* QUICK UNLOCK: Active Verified Session */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50/50 to-emerald-50/40 dark:from-indigo-950/40 dark:via-slate-850 dark:to-emerald-950/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Active Verified Session
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {user?.email || 'Logged in user'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickUnlock}
                    disabled={isAuthenticating}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                    <span>Quick Unlock</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                    Or Verify With Password & 2FA
                  </span>
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
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-slate-700"
                  >
                    {isAuthenticating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Verifying Password...
                      </>
                    ) : (
                      <>
                        Continue to Two-Factor Verification
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
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
                className="max-w-md mx-auto py-6 sm:py-8 space-y-5"
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
                {/* MODERN REAL STORAGE & HARDWARE TELEMETRY SUITE */}
                <div
                  className={`p-4 sm:p-6 rounded-3xl border shadow-xl space-y-5 transition-all ${
                    quota.isFull || quota.percentUsed >= 100
                      ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-amber-950/20 border-rose-500/50 shadow-rose-900/20 ring-2 ring-rose-500/20'
                      : 'bg-gradient-to-br from-slate-900 via-[#0a1428] to-slate-900 text-slate-100 border-slate-750 shadow-2xl'
                  }`}
                >
                  {/* Top Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg relative ${
                          quota.isFull || quota.percentUsed >= 100 
                            ? 'bg-rose-600 shadow-rose-500/30' 
                            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/25'
                        }`}
                      >
                        <Server className="w-6 h-6 stroke-[2.2]" />
                        <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                          quota.isFull || quota.percentUsed >= 100
                            ? 'bg-rose-400 animate-ping'
                            : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                        }`} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
                            {quota.totalQuotaBytes > FREE_STORAGE_QUOTA_BYTES
                              ? `Expanded Cloud Vault (${formatBytes(quota.totalQuotaBytes)})`
                              : 'Real 1.00 GB Cloud Vault'}
                          </h4>
                          {(quota.isFull || quota.percentUsed >= 100) ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                              100% Full
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Free Tier Active
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded-full">
                            SHA-256 Bit-Level Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          <span className="text-white font-bold">{formatBytes(quota.usedBytes)}</span> used of{' '}
                          <span className="text-slate-300">{formatBytes(quota.totalQuotaBytes)}</span> •{' '}
                          <span className="text-emerald-400 font-bold">{formatBytes(quota.freeBytes)} available</span> ({quota.percentUsed}% consumed)
                        </p>
                      </div>
                    </div>

                    {/* Quick Utility Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleSimulateFullToggle}
                        disabled={isSimulatingFull}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          quota.isFull || quota.percentUsed >= 100
                            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                            : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-750'
                        }`}
                        title="Simulate 100% full storage to test automatic billing"
                      >
                        {isSimulatingFull ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : quota.isFull || quota.percentUsed >= 100 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{quota.isFull || quota.percentUsed >= 100 ? 'Reset Quota' : 'Test Full Quota'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowStorageBilling((prev) => !prev);
                          setBillingReason('manual');
                        }}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 ${
                          showStorageBilling
                            ? 'bg-slate-750 text-white border border-slate-600'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{showStorageBilling ? 'Close Billing' : 'Expand Storage'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Multi-Segment Real Cloud Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner flex">
                      {quota.isFull || quota.percentUsed >= 100 ? (
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-rose-500 to-red-600 animate-pulse" />
                      ) : (
                        <>
                          {/* Diagnostic Scans */}
                          <div 
                            className="h-full rounded-l-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, (storageBreakdown.bytes.scan / quota.totalQuotaBytes) * 100))}%` }}
                            title={`Diagnostic Scans: ${formatBytes(storageBreakdown.bytes.scan)}`}
                          />
                          {/* Clinical Documents */}
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, (storageBreakdown.bytes.document / quota.totalQuotaBytes) * 100))}%` }}
                            title={`Clinical Records: ${formatBytes(storageBreakdown.bytes.document)}`}
                          />
                          {/* Lab Reports */}
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, (storageBreakdown.bytes.lab_report / quota.totalQuotaBytes) * 100))}%` }}
                            title={`Lab Reports: ${formatBytes(storageBreakdown.bytes.lab_report)}`}
                          />
                          {/* User Data / Vitals */}
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, (storageBreakdown.bytes.user_data / quota.totalQuotaBytes) * 100))}%` }}
                            title={`User Vitals Data: ${formatBytes(storageBreakdown.bytes.user_data)}`}
                          />
                        </>
                      )}
                    </div>

                    {/* Categorical Breakdown Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">Scans & DICOM</p>
                          <p className="text-xs font-mono font-bold text-white truncate">{formatBytes(storageBreakdown.bytes.scan)}</p>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">EHR Records</p>
                          <p className="text-xs font-mono font-bold text-white truncate">{formatBytes(storageBreakdown.bytes.document)}</p>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">Lab Reports</p>
                          <p className="text-xs font-mono font-bold text-white truncate">{formatBytes(storageBreakdown.bytes.lab_report)}</p>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">User Vitals</p>
                          <p className="text-xs font-mono font-bold text-white truncate">{formatBytes(storageBreakdown.bytes.user_data)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real Hardware & Device Storage Sub-Card */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-slate-950/80 via-blue-950/20 to-slate-950/80 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <HardDrive size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Device Hardware Storage:</span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            {deviceStorage ? `${formatBytes(deviceStorage.usage)} Cache & DB` : 'Online Browser DB'}
                          </span>
                          {deviceStorage?.persisted && (
                            <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.2 rounded font-mono">
                              Persisted
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-400">
                          {deviceStorage?.quota 
                            ? `${formatBytes(deviceStorage.quota)} local drive quota allocated to Doctorian offline models & encrypted IndexedDB.`
                            : 'Encrypted IndexedDB & offline Service Worker cache active.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        refreshDeviceStorage();
                        if (onShowToast) onShowToast('Local device storage verified & synchronized.', 'info');
                      }}
                      className="px-2.5 py-1.2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-[11px] border border-slate-700 transition-colors self-end sm:self-center shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw size={11} />
                      <span>Sync Hardware DB</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* INTELLIGENT SYSTEM ACTION DECK: SQUARE BUTTONS IN 2 COLUMNS */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Square Button 1: Upload File (Indigo / Blue Accent) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || quota.isFull || quota.freeBytes <= 0}
                    className="group relative p-4 sm:p-5 rounded-2xl bg-transparent hover:bg-indigo-500/[0.05] dark:hover:bg-indigo-400/[0.06] border-2 border-indigo-200/80 dark:border-indigo-900/60 hover:border-indigo-500 dark:hover:border-indigo-400 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between aspect-square sm:aspect-[4/3] disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        SHA-256 Checksum
                      </span>
                    </div>
                    <div className="space-y-1 mt-2">
                      <h5 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Upload Clinical File
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        Store diagnostic scans, lab reports, EHR PDFs and health records securely.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                      <span>Select file from device</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Square Button 2: Generate Sample Clinical Scan (Emerald / Mint Accent) */}
                  <div className="group relative p-4 sm:p-5 rounded-2xl bg-transparent hover:bg-emerald-500/[0.05] dark:hover:bg-emerald-400/[0.06] border-2 border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-500 dark:hover:border-emerald-400 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between aspect-square sm:aspect-[4/3]">
                    <div className="flex items-start justify-between w-full">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        <Activity className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Instant Cloud Test
                      </span>
                    </div>
                    <div className="space-y-1 mt-2">
                      <h5 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Deploy Clinical Sample
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        Generate verified DICOM MRI, CMP-14 Blood Panel or Holter ECG with real checksum.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                      <button
                        type="button"
                        disabled={isGeneratingSample}
                        onClick={() => handleGenerateSample('dicom_mri')}
                        className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors"
                      >
                        + MRI Scan
                      </button>
                      <button
                        type="button"
                        disabled={isGeneratingSample}
                        onClick={() => handleGenerateSample('lab_panel')}
                        className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold hover:bg-emerald-200 transition-colors"
                      >
                        + Lab Panel
                      </button>
                      <button
                        type="button"
                        disabled={isGeneratingSample}
                        onClick={() => handleGenerateSample('cardiac_ecg')}
                        className="px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-[11px] font-bold hover:bg-teal-200 transition-colors"
                      >
                        + ECG
                      </button>
                    </div>
                  </div>

                  {/* Square Button 3: Sync Clinical Telemetry & EHR (Purple / Violet Accent) */}
                  <button
                    type="button"
                    onClick={handleSyncClinicalTelemetry}
                    disabled={isSyncingEHR || isUploading || quota.isFull || quota.freeBytes <= 0}
                    className="group relative p-4 sm:p-5 rounded-2xl bg-transparent hover:bg-purple-500/[0.05] dark:hover:bg-purple-400/[0.06] border-2 border-purple-200/80 dark:border-purple-900/60 hover:border-purple-500 dark:hover:border-purple-400 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between aspect-square sm:aspect-[4/3] disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        <Database className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Telemetry Snapshot
                      </span>
                    </div>
                    <div className="space-y-1 mt-2">
                      <h5 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Sync Clinical Telemetry
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        Snapshot patient vitals, diagnosis notes, and EHR telemetry into your cloud vault.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 pt-2 border-t border-purple-100 dark:border-purple-900/40">
                      {isSyncingEHR ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Syncing Telemetry...</span>
                        </>
                      ) : (
                        <>
                          <span>Trigger Cloud Snapshot</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>

                  {/* Square Button 4: Security Audit & Integrity Logs (Amber / Orange Accent) */}
                  <button
                    type="button"
                    onClick={handleOpenAuditLogs}
                    className="group relative p-4 sm:p-5 rounded-2xl bg-transparent hover:bg-amber-500/[0.05] dark:hover:bg-amber-400/[0.06] border-2 border-amber-200/80 dark:border-amber-900/60 hover:border-amber-500 dark:hover:border-amber-400 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between aspect-square sm:aspect-[4/3] cursor-pointer"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        <History className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Audit Ledger
                      </span>
                    </div>
                    <div className="space-y-1 mt-2">
                      <h5 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Security Audit Logs
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        Inspect verified 2FA attempts, client IP addresses, file operations & SHA-256 hashes.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 pt-2 border-t border-amber-100 dark:border-amber-900/40">
                      <span>View Security Trail</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>

                {/* ========================================================= */}
                {/* AUTOMATIC STORAGE BILLING & EXPANSION PURCHASE SECTION */}
                {/* ========================================================= */}
                <AnimatePresence>
                  {showStorageBilling && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      className="rounded-3xl border-2 border-rose-500/80 dark:border-rose-600 bg-gradient-to-b from-rose-50/95 via-white to-indigo-50/30 dark:from-rose-950/40 dark:via-slate-900 dark:to-indigo-950/20 p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-5"
                    >
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
                              className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between ${
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
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
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

                {/* FILE SEARCH & CATEGORY FILTER */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {[
                      { id: 'all', label: 'All Files' },
                      { id: 'document', label: 'Documents' },
                      { id: 'scan', label: 'Scans' },
                      { id: 'lab_report', label: 'Lab Reports' },
                      { id: 'user_data', label: 'Telemetry & Data' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedCategory(tab.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                          selectedCategory === tab.id
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar & Upload Category Selector */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-52">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files by name..."
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    </div>

                    <select
                      value={uploadCategory}
                      onChange={(e: any) => setUploadCategory(e.target.value)}
                      className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                    >
                      <option value="document">Doc Format</option>
                      <option value="scan">DICOM Scan</option>
                      <option value="lab_report">Lab Panel</option>
                      <option value="user_data">Telemetry Data</option>
                    </select>
                  </div>
                </div>

                {/* UPLOAD PROGRESS INDICATION */}
                {isUploading && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">Encrypting & computing SHA-256 integrity hash...</p>
                      {uploadProgress !== null && (
                        <div className="w-full bg-indigo-200 dark:bg-indigo-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
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
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-sm">
                  {isLoadingFiles ? (
                    <div className="py-16 text-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                      <p className="text-xs text-slate-500">Retrieving encrypted cloud records...</p>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="py-16 px-4 text-center space-y-3">
                      <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto">
                        <FilePlus className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {searchQuery ? 'No matching files found' : 'Your 1GB Cloud Vault is ready'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                          1.00 GB (1,073,741,824 bytes) free storage allocated. Use the square action buttons above to upload files or deploy sample diagnostics.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 shadow-2xs">
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
                              <div className="flex items-center gap-2">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {file.name}
                                </p>
                                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                                  {file.category.replace('_', ' ')}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(file.size)}</span>
                                <span>•</span>
                                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                {file.sha256 && (
                                  <>
                                    <span>•</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyHash(file.sha256!)}
                                      className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                                      title="Copy SHA-256 Checksum"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                      <span>SHA-256: {file.sha256.slice(0, 8)}...</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewFileItem(file)}
                              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                              title="Preview Details & SHA-256 Proof"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadVaultFile(vaultToken, file)}
                              className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              title="Download File"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file.id, file.name)}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete File & Reclaim Space"
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
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Every registered account receives 1.00 GB (1,073,741,824 bytes) of free high-availability cloud storage.</span>
                  </div>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">
                    AES-256-GCM + SHA-256 Verified
                  </span>
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                  <h5 className="font-bold text-sm truncate">{previewFileItem.name}</h5>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewFileItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 font-mono">
                  <span className="text-slate-500">File Size:</span>
                  <span className="font-bold">{formatBytes(previewFileItem.size)} ({previewFileItem.size.toLocaleString()} bytes)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 font-mono">
                  <span className="text-slate-500">MIME Format:</span>
                  <span>{previewFileItem.mimeType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 font-mono">
                  <span className="text-slate-500">Category:</span>
                  <span className="capitalize font-semibold text-indigo-600 dark:text-indigo-400">{previewFileItem.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 font-mono">
                  <span className="text-slate-500">Uploaded On:</span>
                  <span>{new Date(previewFileItem.createdAt).toLocaleString()}</span>
                </div>
                {previewFileItem.sha256 && (
                  <div className="py-1.5 border-b border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono">Cryptographic SHA-256 Checksum:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(previewFileItem.sha256!)}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="font-mono text-[10px] p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 break-all select-all">
                      {previewFileItem.sha256}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadVaultFile(vaultToken, previewFileItem)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFileItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECURITY AUDIT LOGS SUB-MODAL */}
        {/* ========================================================= */}
        {showAuditLogs && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-xl w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Security Audit Trail</h5>
                    <p className="text-[11px] text-slate-400">Cryptographic audit logging for compliance</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuditLogs(false)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
                {isLoadingAudit ? (
                  <div className="py-12 text-center space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-500 mx-auto" />
                    <p className="text-xs text-slate-400">Loading audit events...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <p className="text-center text-slate-400 py-10">No recent security events logged.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase">
                          {log.action}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{log.details}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                        <span>IP: {log.ip}</span>
                        <span>•</span>
                        <span className="truncate max-w-[240px]">Client: {log.userAgent}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAuditLogs(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
