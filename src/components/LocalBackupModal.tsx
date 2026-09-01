import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Clock, 
  Lock, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileText, 
  Database, 
  Sliders, 
  Zap,
  HardDrive
} from 'lucide-react';
import { 
  getBackupConfig, 
  updateBackupConfig, 
  downloadEncryptedBackupFile, 
  restoreDataFromEncryptedBackup, 
  collectAllUserLocalHealthData,
  BackupConfig,
  BackupDataSummary
} from '../utils/secureStorageBackup';

interface LocalBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const LocalBackupModal: React.FC<LocalBackupModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [config, setConfig] = useState<BackupConfig>(getBackupConfig());
  const [summary, setSummary] = useState<BackupDataSummary | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'settings'>('backup');
  
  // Restore State
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [restoreFileContent, setRestoreFileContent] = useState<string | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; msg?: string; summary?: BackupDataSummary } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getBackupConfig());
      const { summary: currentSummary } = collectAllUserLocalHealthData();
      setSummary(currentSummary);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateInterval = (hours: number) => {
    const updated = updateBackupConfig({ intervalHours: hours, autoBackupEnabled: hours > 0 });
    setConfig(updated);
    if (showToast) {
      showToast(
        hours > 0 
          ? `Periodic encrypted backup interval set to every ${hours} hours.` 
          : 'Periodic automatic backup disabled.',
        'info'
      );
    }
  };

  const handleToggleAutoDownload = () => {
    const updated = updateBackupConfig({ autoDownload: !config.autoDownload });
    setConfig(updated);
  };

  const handleManualExport = async () => {
    setIsExporting(true);
    try {
      const { filename, summary: exportedSummary } = await downloadEncryptedBackupFile(passphrase || undefined);
      setSummary(exportedSummary);
      setConfig(getBackupConfig());
      if (showToast) {
        showToast(`Secure backup file '${filename}' encrypted & downloaded!`, 'success');
      }
    } catch (err: any) {
      if (showToast) {
        showToast(`Backup generation error: ${err.message}`, 'error');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRestoreFileContent(text);
      setRestoreStatus(null);
    };
    reader.readAsText(file);
  };

  const handlePerformRestore = async () => {
    if (!restoreFileContent) return;
    setIsRestoring(true);
    setRestoreStatus(null);

    try {
      const result = await restoreDataFromEncryptedBackup(restoreFileContent, restorePassphrase || undefined);
      setRestoreStatus({
        success: true,
        msg: 'All local health records, chat histories, and vitals restored successfully!',
        summary: result.summary
      });
      if (showToast) {
        showToast('Local database restored from encrypted backup file.', 'success');
      }
      // Refresh local summary
      const { summary: currentSummary } = collectAllUserLocalHealthData();
      setSummary(currentSummary);
    } catch (err: any) {
      setRestoreStatus({
        success: false,
        msg: err.message || 'Decryption or restore failed. Check your passphrase/PIN.'
      });
      if (showToast) {
        showToast(`Restore Error: ${err.message}`, 'error');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSavePin = () => {
    if (pinCode.length > 0 && pinCode.length < 4) {
      if (showToast) showToast('PIN must be at least 4 digits.', 'warning');
      return;
    }
    const updated = updateBackupConfig({ pinCode, storageVaultLocked: pinCode.length >= 4 });
    setConfig(updated);
    if (showToast) {
      showToast(pinCode ? 'Vault PIN set & storage access locked.' : 'Vault PIN removed.', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Periodic Encrypted Local Backup & Vault
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AES-256-GCM
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated offline JSON backups & secure device database encryption
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download size={14} />
            <span>Periodic Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('restore')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'restore'
                ? 'bg-slate-900 text-indigo-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload size={14} />
            <span>Decrypt & Restore</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-purple-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={14} />
            <span>Storage Security & PIN</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: PERIODIC BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              
              {/* Local Storage Summary */}
              {summary && (
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-lg font-black text-cyan-400 block">{summary.recordCount}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Health Records</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-lg font-black text-indigo-400 block">{summary.chatLogCount}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">AI Chat Logs</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-lg font-black text-purple-400 block">{summary.patientCount}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Patients</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-lg font-black text-emerald-400 block">
                      {(summary.totalSizeBytes / 1024).toFixed(1)} KB
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Payload Size</span>
                  </div>
                </div>
              )}

              {/* Periodic Schedule Interval Selection */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-cyan-400" />
                  <span>Automated Periodic Download Frequency</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Every 12 Hours', hours: 12 },
                    { label: 'Every 24 Hours', hours: 24 },
                    { label: 'Every 7 Days', hours: 168 },
                    { label: 'Disabled', hours: 0 }
                  ].map((opt, _idx_268) => (
                    <button
                      key={`backup-interval-opt-${opt.hours}-${_idx_268}`}
                      onClick={() => handleUpdateInterval(opt.hours)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        config.intervalHours === opt.hours
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-mono pt-1">
                  {config.lastBackupTime ? (
                    <>Last Automated Backup: <span className="text-cyan-400">{new Date(config.lastBackupTime).toLocaleString()}</span></>
                  ) : (
                    'No automated backup recorded yet.'
                  )}
                </p>
              </div>

              {/* Optional Passphrase Protection for Export */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Key size={14} className="text-purple-400" />
                    <span>Backup Encryption Passphrase (Optional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Leave blank for device key</span>
                </div>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter passphrase to encrypt export file..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Manual Immediate Download Trigger */}
              <button
                onClick={handleManualExport}
                disabled={isExporting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isExporting ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
                <span>{isExporting ? 'Generating Encrypted Backup...' : 'Download Immediate Encrypted JSON Backup'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: DECRYPT & RESTORE */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Upload size={14} />
                  <span>Encrypted JSON Backup Import Protocol</span>
                </p>
                <p className="text-[11px] text-indigo-200/80">
                  Select a previously exported encrypted JSON backup file (`doctorian_encrypted_health_backup_*.json`). The engine will verify the SHA-256 checksum and AES-256-GCM signature before safely merging your health records into storage.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Select Backup JSON File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
                {restoreFileName && (
                  <p className="text-[11px] text-cyan-400 font-mono font-bold pt-1">
                    Selected File: {restoreFileName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Decryption Passphrase / PIN (If standard file, leave empty)
                </label>
                <input
                  type="password"
                  value={restorePassphrase}
                  onChange={(e) => setRestorePassphrase(e.target.value)}
                  placeholder="Enter decryption passphrase..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {restoreStatus && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  restoreStatus.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <p className="font-bold flex items-center gap-2">
                    {restoreStatus.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>{restoreStatus.msg}</span>
                  </p>
                  {restoreStatus.summary && (
                    <div className="text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-800 grid grid-cols-2 gap-2">
                      <span>Records Restored: {restoreStatus.summary.recordCount}</span>
                      <span>Chat Logs Restored: {restoreStatus.summary.chatLogCount}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handlePerformRestore}
                disabled={!restoreFileContent || isRestoring}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isRestoring ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                <span>{isRestoring ? 'Decrypting & Restoring Database...' : 'Execute Decryption & Restore Database'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: STORAGE SECURITY & PIN */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs text-purple-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>Enhanced Device Storage Access Security</span>
                </p>
                <p className="text-[11px] text-purple-200/80">
                  All local health data, tokens, and offline patient records are automatically protected with Web Crypto AES-256-GCM device keying. Setting a Vault PIN adds an extra layer of access authorization before records can be decrypted or queried.
                </p>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Device Storage Vault Security PIN</h4>
                    <p className="text-[11px] text-slate-400">Lock offline records access with a 4-digit PIN</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono ${
                    config.pinCode 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {config.pinCode ? 'Vault PIN Active' : 'No PIN Set'}
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4-6 digit Security PIN..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono tracking-widest text-center"
                  />
                </div>

                <button
                  onClick={handleSavePin}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock size={14} />
                  <span>{config.pinCode ? 'Update Vault PIN Settings' : 'Save & Lock Vault with PIN'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Storage Encryption Protocol:</span>
                  <span className="text-cyan-400 font-mono font-bold">AES-256-GCM + PBKDF2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Integrity Checksum:</span>
                  <span className="text-indigo-400 font-mono font-bold">SHA-256 Checksum Verification</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Offline Storage Isolation:</span>
                  <span className="text-emerald-400 font-mono font-bold">Scoped IndexedDB Vault</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
