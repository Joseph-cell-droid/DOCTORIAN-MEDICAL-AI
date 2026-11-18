import { useState, useEffect, useCallback } from 'react';
import {
  APP_INSTALL_PACKAGES,
  PACKAGE_BY_ID,
  detectRecommendedPackageId,
  getInstalledPackageSummary,
  persistInstalledPackageState,
  type AppInstallPackageSpec
} from '../utils/offlinePackageBuilder';

export type DevicePlatformFamily = 'windows' | 'android' | 'tablet' | 'ios' | 'desktop';

export interface AppDownloadState {
  isInstalled: boolean;
  hasSeenOnce: boolean;
  canPromptNatively: boolean;
  isIOS: boolean;
  isInIframe: boolean;
  platformFamily: DevicePlatformFamily;
  platformLabel: string;
  recommendedPackage: AppInstallPackageSpec;
  installedPackage: AppInstallPackageSpec;
  markInstalled: (pkg?: AppInstallPackageSpec) => void;
  markSeenOnce: (hideImmediately?: boolean) => void;
  triggerInstall: () => Promise<'accepted' | 'dismissed' | 'manual_guide'>;
}

const INSTALLED_STORAGE_KEY = 'doctorian_pwa_installed_flag';
const INSTALL_SEEN_ONCE_KEY = 'doctorian_install_icon_seen_once_v1';

function detectInstalledShell(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if ((window as any).electronAPI || (window as any).__TAURI__) return true;
    if ((window as any).Capacitor?.isNativePlatform?.()) return true;
    if (window.matchMedia?.('(display-mode: standalone)')?.matches) return true;
    if (window.matchMedia?.('(display-mode: minimal-ui)')?.matches) return true;
    if (window.matchMedia?.('(display-mode: window-controls-overlay)')?.matches) return true;
    if ((window.navigator as any).standalone === true) return true;
    if (document.referrer.includes('android-app://')) return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') === 'pwa' || params.get('source') === 'desktop') return true;
  } catch {
    // ignore
  }
  return false;
}

function detectPlatformFamily(): DevicePlatformFamily {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  if (/ipad|tablet|playbook|silk/.test(ua) || (ua.includes('android') && !ua.includes('mobile')) || (width >= 768 && width <= 1180 && 'ontouchstart' in window)) {
    return 'tablet';
  }
  if (ua.includes('android')) return 'android';
  if (/iphone|ipod/.test(ua)) return 'ios';
  if (ua.includes('win')) return 'windows';
  return 'desktop';
}

export function usePWAInstall(): AppDownloadState {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() =>
    typeof window !== 'undefined' ? (window as any).deferredPWAInstallPrompt || null : null
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return detectInstalledShell() || localStorage.getItem(INSTALLED_STORAGE_KEY) === 'true';
  });
  const [hasSeenOnce, setHasSeenOnce] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem(INSTALL_SEEN_ONCE_KEY) === 'true' ||
      localStorage.getItem(INSTALLED_STORAGE_KEY) === 'true' ||
      detectInstalledShell()
    );
  });
  const [installedPackage, setInstalledPackage] = useState<AppInstallPackageSpec>(
    () => getInstalledPackageSummary().pkg
  );

  const recommendedPackage = PACKAGE_BY_ID[detectRecommendedPackageId()] || APP_INSTALL_PACKAGES[0];

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const platformFamily = detectPlatformFamily();
  const platformLabel = `${recommendedPackage.shortLabel} · ${recommendedPackage.sizeLabel}`;

  useEffect(() => {
    let mounted = true;

    const evaluateInstallStatus = async () => {
      if (detectInstalledShell()) {
        persistInstalledPackageState(recommendedPackage);
        if (mounted) {
          setIsInstalled(true);
          setHasSeenOnce(true);
          setInstalledPackage(getInstalledPackageSummary().pkg);
        }
        return;
      }

      try {
        const getRelated = (navigator as any).getInstalledRelatedApps;
        if (typeof getRelated === 'function') {
          const apps = await getRelated.call(navigator);
          if (Array.isArray(apps) && apps.length > 0) {
            persistInstalledPackageState(recommendedPackage);
            if (mounted) {
              setIsInstalled(true);
              setHasSeenOnce(true);
              setInstalledPackage(getInstalledPackageSummary().pkg);
            }
          }
        }
      } catch {
        // unsupported context
      }
    };

    void evaluateInstallStatus();

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPWAInstallPrompt = e;
      if (mounted) {
        setDeferredPrompt(e);
      }
    };

    const onAppInstalled = () => {
      persistInstalledPackageState(recommendedPackage);
      (window as any).deferredPWAInstallPrompt = null;
      if (mounted) {
        setIsInstalled(true);
        setHasSeenOnce(true);
        setDeferredPrompt(null);
        setInstalledPackage(getInstalledPackageSummary().pkg);
      }
    };

    const onInstallMetaUpdated = () => {
      if (mounted) {
        const summary = getInstalledPackageSummary();
        setIsInstalled(summary.isInstalled);
        setInstalledPackage(summary.pkg);
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    window.addEventListener('doctorian-install-updated', onInstallMetaUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('doctorian-install-updated', onInstallMetaUpdated);
    };
  }, [recommendedPackage]);

  const markSeenOnce = useCallback((hideImmediately = false) => {
    try {
      localStorage.setItem(INSTALL_SEEN_ONCE_KEY, 'true');
    } catch {}
    if (hideImmediately) {
      setHasSeenOnce(true);
    }
  }, []);

  const markInstalled = useCallback((pkg?: AppInstallPackageSpec) => {
    const targetPkg = pkg || recommendedPackage;
    persistInstalledPackageState(targetPkg);
    setInstalledPackage(targetPkg);
    setIsInstalled(true);
    setHasSeenOnce(true);
  }, [recommendedPackage]);

  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual_guide'> => {
    const promptObj = deferredPrompt || (typeof window !== 'undefined' ? (window as any).deferredPWAInstallPrompt : null);
    if (promptObj && !isInIframe) {
      try {
        await promptObj.prompt();
        const choice = await promptObj.userChoice;
        if (choice?.outcome === 'accepted') {
          markInstalled(recommendedPackage);
          setDeferredPrompt(null);
          (window as any).deferredPWAInstallPrompt = null;
          return 'accepted';
        }
        markSeenOnce(true);
        return 'dismissed';
      } catch {
        return 'manual_guide';
      }
    }
    return 'manual_guide';
  }, [deferredPrompt, isInIframe, markInstalled, markSeenOnce, recommendedPackage]);

  return {
    isInstalled,
    hasSeenOnce,
    canPromptNatively: Boolean(deferredPrompt && !isInIframe),
    isIOS,
    isInIframe,
    platformFamily,
    platformLabel,
    recommendedPackage,
    installedPackage,
    markInstalled,
    markSeenOnce,
    triggerInstall
  };
}
