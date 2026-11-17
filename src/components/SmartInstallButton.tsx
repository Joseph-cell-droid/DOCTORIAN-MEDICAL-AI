import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, Monitor, Tablet, X, PackageCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SmartInstallButtonProps {
  onOpenFullModal?: () => void;
  onInstalledToast?: (msg: string) => void;
  hidden?: boolean;
}

export const SmartInstallButton: React.FC<SmartInstallButtonProps> = ({
  onOpenFullModal,
  onInstalledToast,
  hidden = false
}) => {
  const { isInstalled, hasSeenOnce, platformFamily, platformLabel, markInstalled, markSeenOnce } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showQuickPackages, setShowQuickPackages] = useState<boolean>(false);

  // Record in localStorage after brief presentation so future page refreshes do NOT show the floating icon repeatedly.
  useEffect(() => {
    if (isInstalled || hasSeenOnce || isDismissed || hidden) return;
    const timer = window.setTimeout(() => {
      markSeenOnce(false);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [isInstalled, hasSeenOnce, isDismissed, hidden, markSeenOnce]);

  if ((isInstalled || hasSeenOnce || isDismissed || hidden) && !showQuickPackages) {
    return null;
  }

  const PlatformIcon =
    platformFamily === 'windows' || platformFamily === 'desktop'
      ? Monitor
      : platformFamily === 'tablet'
      ? Tablet
      : Smartphone;

  const handleDownloadClick = () => {
    markSeenOnce(true);
    setIsDismissed(true);
    if (onOpenFullModal) {
      onOpenFullModal();
    } else {
      setShowQuickPackages(true);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    markSeenOnce(true);
    setIsDismissed(true);
  };

  const triggerPackageDownload = (url: string, filename: string, label: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    markInstalled();
    setShowQuickPackages(false);
    onInstalledToast?.(`${label} package download started with offline clinical modules!`);
  };

  return (
    <>
      {!isInstalled && !hasSeenOnce && !isDismissed && !hidden && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed right-3 sm:right-5 bottom-[74px] sm:bottom-6 z-40 group"
          aria-label="Download Doctorian Native App"
        >
          {/* Compact Hover Label (Desktop only, non-blocking) */}
          <div className="pointer-events-none hidden sm:flex items-center gap-1.5 absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-[#091834]/95 border border-cyan-400/35 text-[11px] font-bold text-white whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <PlatformIcon className="w-3.5 h-3.5 text-cyan-300" />
            <span>Install ({platformLabel})</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={handleDownloadClick}
              title={`Download Doctorian App (${platformLabel})`}
              aria-label={`Download Doctorian App (${platformLabel})`}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 border border-white/40 shadow-[0_10px_24px_rgba(6,182,212,0.35)] flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Micro corner dismiss button */}
            <button
              type="button"
              onClick={handleDismiss}
              title="Dismiss install button"
              aria-label="Dismiss install button"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow cursor-pointer"
            >
              <X className="w-2.5 h-2.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showQuickPackages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowQuickPackages(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#091834] border border-cyan-500/35 rounded-3xl p-6 shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src="/logo-96.png" alt="Doctorian App" className="w-11 h-11 rounded-2xl border border-cyan-500/30 object-cover" />
                  <div>
                    <h3 className="text-base font-bold">Download Doctorian App</h3>
                    <p className="text-xs text-slate-400">Real installers with offline packages included</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickPackages(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerPackageDownload('/downloads/Doctorian-Windows-Setup.exe', 'Doctorian-Windows-Setup.exe', 'Windows Desktop App')
                  }
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-blue-600 border border-slate-800 text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span>Windows Workstation Setup (.exe)</span>
                  </span>
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerPackageDownload('/downloads/Doctorian-MedicalAI-Android.apk', 'Doctorian-MedicalAI-Android.apk', 'Android Phone App')
                  }
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-emerald-600 border border-slate-800 text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Android Smartphone Package (.apk)</span>
                  </span>
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerPackageDownload('/downloads/Doctorian-Tablet-HD.apk', 'Doctorian-Tablet-HD.apk', 'Tablet HD App')
                  }
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-indigo-600 border border-slate-800 text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Tablet className="w-4 h-4 text-indigo-400" />
                    <span>Tablet HD Multi-Pane Package (.apk)</span>
                  </span>
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerPackageDownload('/downloads/Doctorian-Offline-Package-Suite.json', 'Doctorian-Offline-Package-Suite.json', 'Offline Medical Package Suite')
                  }
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-cyan-700 border border-slate-800 text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <PackageCheck className="w-4 h-4 text-cyan-300" />
                    <span>All Offline Clinical Data Packages (.json)</span>
                  </span>
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
