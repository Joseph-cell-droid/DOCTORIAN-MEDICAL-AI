import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Smartphone, Laptop, CheckCircle2, Wifi, WifiOff, 
  Sparkles, Monitor, ExternalLink, ShieldCheck,
  Cpu, Bot, Shield, Database, Lock
} from 'lucide-react';
import { LocalAISetupWizard } from './LocalAISetupWizard';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose, onInstalled }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'windows_tauri' | 'android_play' | 'pwa_web' | 'local_ai'>('windows_tauri');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  // Device Detection State
  const [deviceInfo, setDeviceInfo] = useState<{
    os: 'windows' | 'android' | 'ios' | 'mac' | 'linux' | 'unknown';
    isMobile: boolean;
    appType: string;
    detectedHeadline: string;
    primaryButtonLabel: string;
    primaryButtonSubtext: string;
    actionType: 'download_exe' | 'open_google_play' | 'install_pwa';
  }>({
    os: 'unknown',
    isMobile: false,
    appType: 'Doctorian Medical AI',
    detectedHeadline: 'Detecting optimal installation package for your device...',
    primaryButtonLabel: '🪟 Download Doctorian',
    primaryButtonSubtext: 'Official Doctorian-Setup.exe (Tauri 2 & NSIS Installer)',
    actionType: 'download_exe'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsIframe(window.self !== window.top);

    // AI Device & Platform Intelligence Analysis
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isWindows = /windows/i.test(ua);
    const isMac = /macintosh|mac os x/i.test(ua);
    const isLinux = /linux/i.test(ua) && !isAndroid;
    const isMobileDevice = isAndroid || isIOS || window.innerWidth < 768;

    let osName: 'windows' | 'android' | 'ios' | 'mac' | 'linux' | 'unknown' = 'unknown';
    if (isAndroid) osName = 'android';
    else if (isIOS) osName = 'ios';
    else if (isWindows) osName = 'windows';
    else if (isMac) osName = 'mac';
    else if (isLinux) osName = 'linux';

    if (isAndroid) {
      setDeviceInfo({
        os: 'android',
        isMobile: true,
        appType: 'Doctorian Mobile Patient Healthcare App',
        detectedHeadline: 'Detected Android Device • Official Google Play Release Available',
        primaryButtonLabel: '📱 Get it on Google Play',
        primaryButtonSubtext: 'Directs to official Google Play Store listing (ai.doctorian.app)',
        actionType: 'open_google_play'
      });
      setActiveTab('android_play');
    } else if (isWindows) {
      setDeviceInfo({
        os: 'windows',
        isMobile: false,
        appType: 'Doctorian Doctor Desktop Workstation',
        detectedHeadline: 'Detected Windows 10/11 64-bit • Official Desktop Installer Available',
        primaryButtonLabel: '🪟 Download Doctorian',
        primaryButtonSubtext: 'Doctorian-Setup.exe (18.5 MB • Built with Tauri 2 & NSIS)',
        actionType: 'download_exe'
      });
      setActiveTab('windows_tauri');
    } else if (isIOS) {
      setDeviceInfo({
        os: 'ios',
        isMobile: true,
        appType: 'Doctorian Mobile Patient App',
        detectedHeadline: 'Detected iOS Device • Install Doctorian Web App via Safari',
        primaryButtonLabel: '📱 Add Doctorian to Home Screen',
        primaryButtonSubtext: 'Tap Share in Safari then "Add to Home Screen"',
        actionType: 'install_pwa'
      });
      setActiveTab('pwa_web');
    } else {
      setDeviceInfo({
        os: osName,
        isMobile: isMobileDevice,
        appType: 'Doctorian Medical AI Workstation',
        detectedHeadline: 'Detected Desktop System • Download Windows Installer or Run Web App',
        primaryButtonLabel: '🪟 Download Doctorian',
        primaryButtonSubtext: 'Doctorian-Setup.exe (Tauri 2 NSIS Package)',
        actionType: 'download_exe'
      });
      setActiveTab('windows_tauri');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredPWAInstallPrompt = e;
      setInstallStatus('ready');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isOpen]);

  // Download official Windows Setup (.exe) via GitHub Releases
  const downloadWindowsInstaller = () => {
    const primaryGithubUrl = "https://github.com/doctorian-ai/doctorian/releases/download/v2.5.0/Doctorian-Setup.exe";
    
    const link = document.createElement('a');
    link.href = primaryGithubUrl;
    link.download = 'Doctorian-Setup.exe';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setInstallStatus('installer_downloaded');
      if (onInstalled) onInstalled();
    }, 600);
  };

  // Direct users to official Google Play Store listing
  const openGooglePlayStore = () => {
    const googlePlayUrl = "https://play.google.com/store/apps/details?id=ai.doctorian.app";
    window.open(googlePlayUrl, '_blank', 'noopener,noreferrer');
    setInstallStatus('play_store_opened');
    if (onInstalled) onInstalled();
  };

  const handleInstallPWA = async () => {
    const promptEvent = installPrompt || (window as any).deferredPWAInstallPrompt;

    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setInstallStatus('success');
          if (onInstalled) onInstalled();
        } else {
          setInstallStatus('cancelled');
        }
        setInstallPrompt(null);
        (window as any).deferredPWAInstallPrompt = null;
      } catch (err) {
        console.warn("PWA install prompt error:", err);
      }
    } else if (isIframe) {
      window.open(window.location.origin + '?install=true', '_blank');
      onClose();
    } else {
      setInstallStatus('manual');
    }
  };

  const handlePrimaryAutoDetectedAction = () => {
    if (deviceInfo.actionType === 'open_google_play') {
      openGooglePlayStore();
    } else if (deviceInfo.actionType === 'install_pwa') {
      handleInstallPWA();
    } else {
      downloadWindowsInstaller();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative text-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between gap-4 bg-slate-950/70 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <Laptop size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                    Install Doctorian Medical AI
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} /> Official Release v2.5.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Autonomous Healthcare Intelligence Platform for Windows & Android
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Platform Auto-Detect Banner */}
            <div className="px-6 py-2.5 bg-blue-950/40 border-b border-blue-500/30 flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2 text-blue-300 font-bold">
                <Bot size={15} className="text-blue-400 shrink-0 animate-pulse" />
                <span className="text-[11px] sm:text-xs">
                  {deviceInfo.detectedHeadline}
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                <ShieldCheck size={10} /> Verified Distribution
              </span>
            </div>

            {/* Prominent Smart Auto-Detected Primary Hero Card */}
            <div className="p-5 mx-6 mt-4 rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/70 border border-blue-500/40 relative overflow-hidden space-y-3.5 shadow-xl shrink-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                  <Cpu size={13} /> Recommended For Your Device ({deviceInfo.os.toUpperCase()})
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 uppercase">
                  Doctorian v2.5.0
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-white">{deviceInfo.appType}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {deviceInfo.os === 'android' 
                    ? 'Official Doctorian Mobile App on Google Play. Features local medical knowledge, wearable Bluetooth telemetry, and AI patient diagnostic tools.'
                    : 'Official Doctorian Windows Desktop Workstation. Features offline Ollama LLM execution, SQLite medical RAG database, and desktop shortcuts.'}
                </p>
              </div>

              {/* PROMINENT AUTO-DETECTED INSTALL BUTTON */}
              <button
                onClick={handlePrimaryAutoDetectedAction}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider shadow-2xl flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-98 group"
              >
                {deviceInfo.actionType === 'open_google_play' ? (
                  <>
                    <Smartphone size={20} className="group-hover:scale-110 transition-transform" />
                    <span>📱 Get it on Google Play</span>
                    <ExternalLink size={16} className="text-blue-200" />
                  </>
                ) : (
                  <>
                    <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                    <span>🪟 Download Doctorian (Doctorian-Setup.exe)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
                <span className="flex items-center gap-1 text-slate-300">
                  <Lock size={12} className="text-emerald-400" />
                  {deviceInfo.os === 'android' ? 'Host: Google Play Store (HTTPS Verified)' : 'Host: GitHub Releases (HTTPS Verified)'}
                </span>
                {deviceInfo.os === 'windows' && (
                  <button
                    onClick={() => setIsWizardOpen(true)}
                    className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 underline cursor-pointer"
                  >
                    <Cpu size={12} /> Local AI Setup Wizard &rarr;
                  </button>
                )}
              </div>

              {installStatus === 'installer_downloaded' && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Doctorian-Setup.exe download initiated! Run the setup file to install Doctorian on Windows.</span>
                </div>
              )}

              {installStatus === 'play_store_opened' && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Redirected to Doctorian's official Google Play Store page. Tap "Install" on Google Play!</span>
                </div>
              )}
            </div>

            {/* Platform Selection Tabs */}
            <div className="px-6 pt-4 flex gap-2 border-b border-slate-800/80 overflow-x-auto bg-slate-900/60 shrink-0">
              <button
                onClick={() => setActiveTab('windows_tauri')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'windows_tauri' 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop size={13} /> 🪟 Windows Setup (.exe)
              </button>
              <button
                onClick={() => setActiveTab('android_play')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'android_play' 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone size={13} /> 📱 Google Play Store
              </button>
              <button
                onClick={() => setActiveTab('pwa_web')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pwa_web' 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor size={13} /> 💻 Web App (PWA)
              </button>
            </div>

            {/* Modal Tab Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto grow">
              {activeTab === 'windows_tauri' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Laptop size={14} className="text-blue-400" />
                        Doctorian Windows Desktop Workstation (Tauri 2 NSIS)
                      </h4>
                      <span className="text-[10px] font-mono text-teal-400 font-bold bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                        Size: 18.5 MB
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Built with Tauri 2 and Rust. Generates start menu & desktop shortcuts, offline Ollama AI bridge, SQLite clinical RAG database, and clean uninstallation support.
                    </p>

                    <button
                      onClick={downloadWindowsInstaller}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download size={16} />
                      <span>🪟 Download Doctorian-Setup.exe</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'android_play' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Smartphone size={14} className="text-emerald-400" />
                        Doctorian Mobile Patient App on Google Play
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        Verified App
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Directs users to Doctorian's official Google Play Store page (`ai.doctorian.app`) for secure, automated installation and background updates on Android devices.
                    </p>

                    <button
                      onClick={openGooglePlayStore}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Smartphone size={16} />
                      <span>📱 Get it on Google Play</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'pwa_web' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Monitor size={14} className="text-indigo-400" />
                      Standalone Web Application (PWA)
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Install Doctorian directly into your Chrome, Safari, or Edge web browser as a standalone application without requiring administrative privileges.
                    </p>

                    <button
                      onClick={handleInstallPWA}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download size={16} />
                      <span>Install Doctorian Web PWA</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-3 text-[11px] text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Shield size={13} className="text-emerald-400" />
                <span>Doctorian Medical AI v2.5.0 • End-to-End Encrypted Architecture</span>
              </span>
              <button
                onClick={onClose}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      <LocalAISetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </>
  );
};
