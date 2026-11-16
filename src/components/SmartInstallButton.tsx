import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, Monitor, Tablet, X, WifiOff, PackageCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SmartInstallButtonProps {
  onOpenFullModal?: () => void;
  onInstalledToast?: (msg: string) => void;
}

export const SmartInstallButton: React.FC<SmartInstallButtonProps> = ({
  onOpenFullModal,
  onInstalledToast
}) => {
  const { isInstalled, platformFamily, platformLabel, markInstalled } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showQuickPackages, setShowQuickPackages] = useState<boolean>(false);

  // Auto-hide cleanly when running inside the installed native/standalone app
  if (isInstalled || isDismissed) {
    return null;
  }

  const PlatformIcon =
    platformFamily === 'windows' || platformFamily === 'desktop'
      ? Monitor
      : platformFamily === 'tablet'
      ? Tablet
      : Smartphone;

  const handleDownloadClick = () => {
    if (onOpenFullModal) {
      onOpenFullModal();
    } else {
      setShowQuickPackages(true);
    }
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
      <motion.div
        initial={{ opacity: 0, x: 28, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 28, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed right-3 sm:right-5 bottom-24 z-40 flex items-center"
        aria-label="Download Doctorian Native App"
      >
        <div className="group flex items-center bg-[#091834] text-white rounded-2xl border border-cyan-400/45 shadow-[0_14px_34px_rgba(6,182,212,0.26)] hover:border-cyan-300 transition-colors overflow-hidden">
          <button
            type="button"
            onClick={handleDownloadClick}
            className="flex items-center gap-2.5 pl-3 pr-3 py-2.5 cursor-pointer text-left active:scale-[0.98] transition-transform"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0 text-slate-950">
              <Download className="w-4 h-4 stroke-[2.5]" />
            </span>

            <span className="flex flex-col leading-tight min-w-0">
              <span className="text-xs font-extrabold tracking-tight text-white whitespace-nowrap flex items-center gap-1.5">
                <span>Download App</span>
                <PlatformIcon className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              </span>
              <span className="text-[10px] font-medium text-cyan-200/90 whitespace-nowrap flex items-center gap-1 mt-0.5">
                <WifiOff className="w-2.5 h-2.5 shrink-0" />
                <span>{platformLabel} · All Packages</span>
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="self-stretch px-2.5 border-l border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
            title="Hide download button"
            aria-label="Hide download button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

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
