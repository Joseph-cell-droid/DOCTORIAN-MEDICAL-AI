import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Package,
  CheckCircle2,
  RefreshCw,
  Wifi,
  WifiOff,
  HardDrive,
  ShieldCheck
} from 'lucide-react';
import {
  APP_INSTALL_PACKAGES,
  type AppInstallPackageId,
  type AppInstallPackageSpec,
  detectRecommendedPackageId,
  downloadDevicePackage,
  getInstalledPackageSummary,
  syncCompleteOfflineApp
} from '../utils/offlinePackageBuilder';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
}

type CategoryFilter = 'all' | 'computer' | 'mobile' | 'tablet' | 'portable';

function getPackageIcon(pkg: AppInstallPackageSpec) {
  if (pkg.id === 'windows' || pkg.id === 'linux') return Monitor;
  if (pkg.id === 'macos') return Laptop;
  if (pkg.id === 'tablet_android' || pkg.id === 'windows_tablet') return Tablet;
  if (pkg.id === 'offline_suite') return Package;
  return Smartphone;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  onInstalled
}) => {
  const {
    canPromptNatively,
    triggerInstall,
    markInstalled,
    isInstalled,
    installedPackage
  } = usePWAInstall();

  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [activeDownloadId, setActiveDownloadId] = useState<AppInstallPackageId | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineSummary, setOfflineSummary] = useState(() => getInstalledPackageSummary());
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);

  const recommendedId = detectRecommendedPackageId();
  const recommendedPkg =
    APP_INSTALL_PACKAGES.find((p) => p.id === recommendedId) || APP_INSTALL_PACKAGES[0];

  useEffect(() => {
    if (!isOpen) return;
    setOfflineSummary(getInstalledPackageSummary());

    const onOnlineStatus = () => setIsOnline(navigator.onLine);
    const onInstallUpdated = () => setOfflineSummary(getInstalledPackageSummary());
    window.addEventListener('online', onOnlineStatus);
    window.addEventListener('offline', onOnlineStatus);
    window.addEventListener('doctorian-install-updated', onInstallUpdated);
    return () => {
      window.removeEventListener('online', onOnlineStatus);
      window.removeEventListener('offline', onOnlineStatus);
      window.removeEventListener('doctorian-install-updated', onInstallUpdated);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredPackages = APP_INSTALL_PACKAGES.filter((pkg) =>
    filter === 'all' ? true : pkg.category === filter
  );

  const handleInstallPackage = async (pkg: AppInstallPackageSpec, alsoTryNativePrompt = false) => {
    if (activeDownloadId || isSyncingOffline) return;
    setActiveDownloadId(pkg.id);
    setProgressPercent(4);
    setProgressStage(`Preparing ${pkg.name} (${pkg.sizeLabel})...`);

    try {
      if (alsoTryNativePrompt && canPromptNatively) {
        await triggerInstall();
      }
      const result = await downloadDevicePackage(pkg.id, {
        onProgress: (pct, stage) => {
          setProgressPercent(pct);
          setProgressStage(stage);
        }
      });
      markInstalled(result.pkg);
      setOfflineSummary(getInstalledPackageSummary());
      setProgressStage(
        result.source === 'offline_builder'
          ? `Offline package installed · ${result.pkg.sizeLabel} saved`
          : `Installed cleanly · ${result.pkg.sizeLabel}`
      );
      onInstalled?.();
    } catch {
      setProgressStage('Offline fallback cache ready. Try downloading again.');
    } finally {
      window.setTimeout(() => {
        setActiveDownloadId(null);
      }, 900);
    }
  };

  const handlePrepareOfflineApp = async () => {
    if (isSyncingOffline || activeDownloadId) return;
    setIsSyncingOffline(true);
    setProgressPercent(5);
    setProgressStage('Caching app UI, clinical database & offline routes...');
    try {
      const res = await syncCompleteOfflineApp((pct, stage) => {
        setProgressPercent(pct);
        setProgressStage(stage);
      });
      setOfflineSummary(getInstalledPackageSummary());
      setProgressStage(
        `Offline mode ready · ${res.cachedCount} modules verified`
      );
    } finally {
      setIsSyncingOffline(false);
    }
  };

  const RecommendedIcon = getPackageIcon(recommendedPkg);
  const displayedInstalledSize = isInstalled
    ? installedPackage.sizeLabel
    : recommendedPkg.sizeLabel;

  return (
    <AnimatePresence>
      <div
        id="download-modal-backdrop"
        className="fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-4xl my-auto rounded-3xl bg-white dark:bg-[#071127] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="px-5 py-4 sm:px-7 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src="/logo-96.png"
                alt="Doctorian"
                className="w-11 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 object-cover shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate">
                  Install Doctorian App
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  Works completely offline once installed · {isOnline ? 'Fast online sync' : 'Offline installer active'}
                </p>
              </div>
            </div>

            <button
              id="close-download-modal-btn"
              type="button"
              onClick={onClose}
              aria-label="Close installation center"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Primary Recommended Action for Current Device */}
            <section className="rounded-2xl bg-slate-50 dark:bg-[#0c1a3a] border border-slate-200 dark:border-cyan-500/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <RecommendedIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-600 dark:text-cyan-400">
                    <span>Recommended for this device</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{recommendedPkg.sizeLabel}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">
                    {recommendedPkg.name} ({recommendedPkg.extension})
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                    {recommendedPkg.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <button
                  type="button"
                  disabled={Boolean(activeDownloadId || isSyncingOffline)}
                  onClick={() => void handleInstallPackage(recommendedPkg, true)}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 shadow-lg shadow-blue-600/20 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {activeDownloadId === recommendedPkg.id
                      ? `Installing ${progressPercent}%`
                      : `Install ${recommendedPkg.shortLabel} · ${recommendedPkg.sizeLabel}`}
                  </span>
                </button>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {isInstalled
                    ? `Installed footprint: ${displayedInstalledSize}`
                    : `Exact package footprint: ${recommendedPkg.sizeLabel}`}
                </span>
              </div>
            </section>

            {/* Offline Sync + Progress Status Bar */}
            <section className="rounded-2xl bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                    {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Offline App Engine &amp; Fast Cache</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {offlineSummary.cachedCount}
                      </span>{' '}
                      cached modules · Android{' '}
                      <span className="font-mono tabular-nums font-semibold">70.0 MB</span> · Windows{' '}
                      <span className="font-mono tabular-nums font-semibold">86.4 MB</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSyncingOffline || Boolean(activeDownloadId)}
                  onClick={() => void handlePrepareOfflineApp()}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOffline ? 'animate-spin' : ''}`} />
                  <span>{isSyncingOffline ? `Syncing ${progressPercent}%` : 'Sync Offline Storage'}</span>
                </button>
              </div>

              {(progressStage || isSyncingOffline || activeDownloadId) && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium truncate">{progressStage}</span>
                    <span className="font-mono tabular-nums font-bold shrink-0">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-cyan-400 transition-all duration-150"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Filter Controls for All Devices */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold tracking-tight">Choose Device Installer</h3>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All Devices' },
                    { id: 'computer', label: 'Computers' },
                    { id: 'mobile', label: 'Phones' },
                    { id: 'tablet', label: 'Tablets' },
                    { id: 'portable', label: 'Offline Kit' }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      filter === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Modern Multi-Device Install Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredPackages.map((pkg) => {
                const Icon = getPackageIcon(pkg);
                const isBusy = activeDownloadId === pkg.id;
                const isCurrentlyInstalled = isInstalled && offlineSummary.pkg.id === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    className="rounded-2xl bg-slate-50 dark:bg-[#0c1630] border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                            {pkg.sizeLabel}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {pkg.platform}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {pkg.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {pkg.description}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {pkg.architecture} · Offline ready · {pkg.extension}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={Boolean(activeDownloadId || isSyncingOffline)}
                      onClick={() => void handleInstallPackage(pkg, pkg.id === recommendedId)}
                      className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
                        isCurrentlyInstalled
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : pkg.id === 'windows' || pkg.id === 'windows_tablet'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-blue-600 text-white'
                      } disabled:opacity-60`}
                    >
                      {isCurrentlyInstalled ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <Download className="w-4 h-4 shrink-0" />
                      )}
                      <span>
                        {isBusy
                          ? `${progressPercent}% Installing...`
                          : isCurrentlyInstalled
                          ? `Reinstall · ${pkg.sizeLabel}`
                          : `Install ${pkg.shortLabel} · ${pkg.sizeLabel}`}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="px-5 py-3.5 sm:px-7 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#050d20] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 shrink-0">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>
                  Installed size:{' '}
                  <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                    {displayedInstalledSize}
                  </strong>
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Offline execution enabled across all devices</span>
              </span>
            </div>

            <span className="text-[11px] font-medium">
              {isOnline ? 'Online + Offline Sync Active' : 'Building Locally Offline'}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
