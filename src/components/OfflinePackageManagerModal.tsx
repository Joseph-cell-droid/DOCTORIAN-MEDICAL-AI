import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  HardDrive,
  CheckCircle2,
  X,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import {
  APP_INSTALL_PACKAGES,
  type AppInstallPackageId,
  detectRecommendedPackageId,
  downloadDevicePackage,
  getInstalledPackageSummary,
  syncCompleteOfflineApp
} from '../utils/offlinePackageBuilder';

interface OfflinePackageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onDirectInstall?: () => void;
  isStandalone?: boolean;
}

export const OfflinePackageManagerModal: React.FC<OfflinePackageManagerModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onDirectInstall,
  isStandalone = false
}) => {
  const [activeId, setActiveId] = useState<AppInstallPackageId | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLine, setStatusLine] = useState('');
  const [summary, setSummary] = useState(() => getInstalledPackageSummary());

  const recommendedId = detectRecommendedPackageId();
  const recommendedPkg =
    APP_INSTALL_PACKAGES.find((p) => p.id === recommendedId) || APP_INSTALL_PACKAGES[0];

  useEffect(() => {
    if (!isOpen) return;
    setSummary(getInstalledPackageSummary());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncOffline = async () => {
    if (isSyncing || activeId) return;
    setIsSyncing(true);
    setProgress(8);
    setStatusLine('Synchronizing offline clinical corpus & interface modules...');
    try {
      const res = await syncCompleteOfflineApp((pct, stage) => {
        setProgress(pct);
        setStatusLine(stage);
      });
      setSummary(getInstalledPackageSummary());
      setStatusLine(`Verified ${res.cachedCount} offline assets cleanly.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInstallTarget = async (id: AppInstallPackageId) => {
    if (isSyncing || activeId) return;
    setActiveId(id);
    setProgress(5);
    try {
      const promptEvent = deferredPrompt || (window as any).deferredPWAInstallPrompt;
      if (id === recommendedId && promptEvent) {
        try {
          await promptEvent.prompt();
          await promptEvent.userChoice;
        } catch {
          onDirectInstall?.();
        }
      }
      const res = await downloadDevicePackage(id, {
        onProgress: (pct, stage) => {
          setProgress(pct);
          setStatusLine(stage);
        }
      });
      setSummary(getInstalledPackageSummary());
      setStatusLine(`${res.pkg.name} (${res.pkg.sizeLabel}) saved cleanly.`);
    } finally {
      window.setTimeout(() => setActiveId(null), 700);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-2xl bg-white dark:bg-[#081228] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-white"
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <HardDrive size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Device App &amp; Offline Manager</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Installed footprint:{' '}
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                  {summary.pkg.sizeLabel}
                </span>{' '}
                · {summary.cachedCount} modules offline
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close offline manager"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-cyan-400">
                <ShieldCheck size={15} />
                <span>{isStandalone || summary.isInstalled ? 'App Installed' : 'Ready for Offline Install'}</span>
              </div>
              <h4 className="text-sm font-bold">
                {recommendedPkg.name} ·{' '}
                <span className="font-mono tabular-nums">{recommendedPkg.sizeLabel}</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Android standard package is 70.0 MB; Windows workstation installer is 86.4 MB with desktop runtime.
              </p>
            </div>

            <button
              type="button"
              disabled={isSyncing || Boolean(activeId)}
              onClick={() => void handleSyncOffline()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? `Syncing ${progress}%` : 'Sync Offline Engine'}</span>
            </button>
          </div>

          {statusLine && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>{statusLine}</span>
                <span className="font-mono tabular-nums font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-cyan-400 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {APP_INSTALL_PACKAGES.slice(0, 6).map((pkg) => {
              const Icon =
                pkg.id === 'windows' || pkg.id === 'linux'
                  ? Monitor
                  : pkg.id === 'macos'
                  ? Laptop
                  : pkg.id === 'tablet_android' || pkg.id === 'windows_tablet'
                  ? Tablet
                  : Smartphone;
              const isSelected = summary.isInstalled && summary.pkg.id === pkg.id;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  disabled={Boolean(activeId || isSyncing)}
                  onClick={() => void handleInstallTarget(pkg.id)}
                  className="min-h-[56px] p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0d1730] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left flex items-center justify-between gap-3 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{pkg.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {pkg.platform} · {pkg.extension}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {pkg.sizeLabel}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <Download size={15} className="text-blue-600 dark:text-cyan-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
