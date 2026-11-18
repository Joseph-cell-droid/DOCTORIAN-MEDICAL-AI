import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Smartphone, Monitor, Tablet, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SmartInstallButtonProps {
  onOpenFullModal?: () => void;
  onInstalledToast?: (msg: string) => void;
  hidden?: boolean;
}

export const SmartInstallButton: React.FC<SmartInstallButtonProps> = ({
  onOpenFullModal,
  hidden = false
}) => {
  const {
    isInstalled,
    hasSeenOnce,
    platformFamily,
    recommendedPackage,
    markSeenOnce
  } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Persist first impression so page refreshes never repeatedly show this floating trigger
  useEffect(() => {
    if (isInstalled || hasSeenOnce || isDismissed || hidden) return;
    const timer = window.setTimeout(() => {
      markSeenOnce(false);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [isInstalled, hasSeenOnce, isDismissed, hidden, markSeenOnce]);

  if (isInstalled || hasSeenOnce || isDismissed || hidden) {
    return null;
  }

  const PlatformIcon =
    platformFamily === 'windows' || platformFamily === 'desktop'
      ? Monitor
      : platformFamily === 'tablet'
      ? Tablet
      : Smartphone;

  const handleOpenInstaller = () => {
    markSeenOnce(true);
    setIsDismissed(true);
    onOpenFullModal?.();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    markSeenOnce(true);
    setIsDismissed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 12 }}
      transition={{ duration: 0.2 }}
      className="fixed right-3 sm:right-5 bottom-[74px] sm:bottom-6 z-40 flex items-center gap-1.5"
      aria-label="Install Doctorian App"
    >
      <button
        type="button"
        onClick={handleOpenInstaller}
        title={`Install Doctorian (${recommendedPackage.shortLabel} · ${recommendedPackage.sizeLabel})`}
        aria-label={`Install Doctorian (${recommendedPackage.shortLabel} · ${recommendedPackage.sizeLabel})`}
        className="min-h-[44px] pl-3.5 pr-4 rounded-2xl bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 border border-slate-700/60 dark:border-cyan-300 shadow-[0_12px_28px_rgba(2,12,35,0.28)] flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform whitespace-nowrap shrink-0"
      >
        <PlatformIcon className="w-4 h-4 shrink-0" />
        <span className="text-xs font-bold tracking-tight">Install App</span>
        <span className="text-[11px] font-semibold font-mono tabular-nums opacity-85">
          {recommendedPackage.sizeLabel}
        </span>
        <Download className="w-3.5 h-3.5 shrink-0" />
      </button>

      <button
        type="button"
        onClick={handleDismiss}
        title="Dismiss install button"
        aria-label="Dismiss install button"
        className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center shadow-md cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
