import { useState, useEffect, useCallback } from 'react';

export type DevicePlatformFamily = 'windows' | 'android' | 'tablet' | 'ios' | 'desktop';

export interface AppDownloadState {
  isInstalled: boolean;
  hasSeenOnce: boolean;
  canPromptNatively: boolean;
  isIOS: boolean;
  isInIframe: boolean;
  platformFamily: DevicePlatformFamily;
  platformLabel: string;
  markInstalled: () => void;
  markSeenOnce: (hideImmediately?: boolean) => void;
  triggerInstall: () => Promise<'accepted' | 'dismissed' | 'manual_guide'>;
}

const INSTALLED_STORAGE_KEY = 'doctorian_pwa_installed_flag';
const INSTALL_SEEN_ONCE_KEY = 'doctorian_install_icon_seen_once_v1';

function detectInstalledShell(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Native Electron, Tauri, or Capacitor wrapper
    if ((window as any).electronAPI || (window as any).__TAURI__) return true;
    if ((window as any).Capacitor?.isNativePlatform?.()) return true;
    // Standalone installed app launch contexts
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

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const platformFamily = detectPlatformFamily();

  const platformLabel = (() => {
    switch (platformFamily) {
      case 'windows':
        return 'Windows App (.EXE)';
      case 'android':
        return 'Android App (.APK)';
      case 'tablet':
        return 'Tablet HD Suite';
      case 'ios':
        return 'iPad / Mobile Suite';
      default:
        return 'Windows & Android';
    }
  })();

  useEffect(() => {
    let mounted = true;

    const evaluateInstallStatus = async () => {
      if (detectInstalledShell()) {
        localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
        localStorage.setItem(INSTALL_SEEN_ONCE_KEY, 'true');
        if (mounted) {
          setIsInstalled(true);
          setHasSeenOnce(true);
        }
        return;
      }

      try {
        const getRelated = (navigator as any).getInstalledRelatedApps;
        if (typeof getRelated === 'function') {
          const apps = await getRelated.call(navigator);
          if (Array.isArray(apps) && apps.length > 0) {
            localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
            localStorage.setItem(INSTALL_SEEN_ONCE_KEY, 'true');
            if (mounted) {
              setIsInstalled(true);
              setHasSeenOnce(true);
            }
            return;
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
      localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
      localStorage.setItem(INSTALL_SEEN_ONCE_KEY, 'true');
      (window as any).deferredPWAInstallPrompt = null;
      if (mounted) {
        setIsInstalled(true);
        setHasSeenOnce(true);
        setDeferredPrompt(null);
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      mounted = false;
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const markSeenOnce = useCallback((hideImmediately = false) => {
    try {
      localStorage.setItem(INSTALL_SEEN_ONCE_KEY, 'true');
    } catch {}
    if (hideImmediately) {
      setHasSeenOnce(true);
    }
  }, []);

  const markInstalled = useCallback(() => {
    try {
      localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
      localStorage.setItem(INSTALL_SEEN_ONCE_KEY, 'true');
    } catch {}
    setIsInstalled(true);
    setHasSeenOnce(true);
  }, []);

  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual_guide'> => {
    const promptObj = deferredPrompt || (typeof window !== 'undefined' ? (window as any).deferredPWAInstallPrompt : null);
    if (promptObj && !isInIframe) {
      try {
        await promptObj.prompt();
        const choice = await promptObj.userChoice;
        if (choice?.outcome === 'accepted') {
          markInstalled();
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
  }, [deferredPrompt, isInIframe, markInstalled, markSeenOnce]);

  return {
    isInstalled,
    hasSeenOnce,
    canPromptNatively: Boolean(deferredPrompt && !isInIframe),
    isIOS,
    isInIframe,
    platformFamily,
    platformLabel,
    markInstalled,
    markSeenOnce,
    triggerInstall
  };
}
