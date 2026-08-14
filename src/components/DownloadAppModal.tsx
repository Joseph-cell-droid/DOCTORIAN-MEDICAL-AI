import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Zap, WifiOff, Lock, Check } from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose, onInstalled }) => {
  const [statusMessage, setStatusMessage] = useState<{ text: string; icon: string } | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const ANDROID_PLAY_URL = "https://play.google.com/store/apps/details?id=com.doctorian.medicalai";
  const WINDOWS_DOWNLOAD_URL = "/downloads/Doctorian-Setup.exe";

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredPWAInstallPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showStatus = (text: string, icon: string = '⚡') => {
    setStatusMessage({ text, icon });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // 1. Android Installation
  const handleAndroidInstall = () => {
    showStatus("Opening Google Play Store...", "🤖");

    // Also trigger PWA prompt if available on mobile
    const promptEvent = installPrompt || (window as any).deferredPWAInstallPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
      } catch (err) {
        console.log("PWA Prompt not available, opening Play Store URL");
      }
    }

    setTimeout(() => {
      window.open(ANDROID_PLAY_URL, '_blank', 'noopener,noreferrer');
      if (onInstalled) onInstalled();
    }, 600);
  };

  // 2. Windows Download
  const handleWindowsDownload = () => {
    showStatus("Preparing Doctorian for Windows...", "📥");

    try {
      const link = document.createElement("a");
      link.href = WINDOWS_DOWNLOAD_URL;
      link.download = "Doctorian-Setup.exe";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onInstalled) onInstalled();
    } catch (err) {
      window.location.href = WINDOWS_DOWNLOAD_URL;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="download-modal-backdrop"
        className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl my-auto rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-white via-[#f8faff] to-[#edf4ff] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-[0_25px_70px_rgba(16,43,117,0.22)] overflow-hidden p-6 sm:p-10 md:p-12 text-center"
        >
          {/* Close Button */}
          <button
            id="close-download-modal-btn"
            onClick={onClose}
            aria-label="Close download modal"
            className="absolute top-5 right-5 sm:top-7 sm:right-7 p-2.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer z-20 shadow-sm"
          >
            <X size={20} />
          </button>

          {/* Ambient Glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* SECTION HEADER */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Doctorian Logo */}
            <div className="relative mb-4 group">
              <img
                src="/logo.svg"
                alt="Doctorian Medical AI Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] sm:rounded-[26px] object-cover shadow-[0_12px_30px_rgba(16,43,117,0.22)] border-2 border-white/80 dark:border-slate-700 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>

            {/* Brand Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#102b75] dark:text-white tracking-tight leading-none mb-3">
              Doctorian
            </h1>

            {/* Tagline with accent lines */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="w-8 sm:w-14 h-0.5 bg-gradient-to-r from-transparent to-blue-500 rounded-full" />
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#2563eb] dark:text-blue-400 tracking-tight">
                Your AI Medical Assistant
              </span>
              <div className="w-8 sm:w-14 h-0.5 bg-gradient-to-l from-transparent to-blue-500 rounded-full" />
            </div>

            {/* Subtitle Description */}
            <p className="max-w-2xl text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-10 font-normal">
              Install Doctorian on your device and experience intelligent, personalized healthcare – anytime, anywhere.
            </p>
          </div>

          {/* TWO PLATFORM CARDS */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-8 sm:mb-10 text-left">
            
            {/* ANDROID CARD */}
            <div className="relative rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 bg-white/95 dark:bg-slate-800/90 border border-[#e5ecf8] dark:border-slate-700/80 shadow-[0_15px_40px_rgba(16,43,117,0.08)] dark:shadow-none hover:shadow-[0_22px_50px_rgba(16,43,117,0.15)] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between group">
              
              {/* Subtle Android Robot Watermark in Background */}
              <svg 
                className="absolute -top-3 -left-4 w-32 h-32 text-emerald-500/[0.07] dark:text-emerald-400/[0.05] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
              </svg>

              <div>
                {/* Header Group */}
                <div className="flex items-center gap-4 sm:gap-5 mb-6 relative z-10">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
                    <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#15803d] dark:text-emerald-400 tracking-tight leading-none mb-1">
                      Android
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">
                      Smartphones & Tablets
                    </p>
                  </div>
                </div>

                {/* Google Play Action Button */}
                <button
                  id="install-android-btn"
                  onClick={handleAndroidInstall}
                  className="w-full rounded-2xl py-4 px-5 sm:px-6 bg-gradient-to-r from-[#16a34a] to-[#15803d] hover:from-[#22c55e] hover:to-[#16a34a] text-white font-bold shadow-[0_12px_28px_rgba(22,163,74,0.32)] hover:shadow-[0_16px_36px_rgba(22,163,74,0.45)] transition-all duration-200 active:scale-[0.98] flex items-center justify-between gap-3 cursor-pointer group/btn"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Google Play Triangle Logo */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 512 512" fill="none">
                        <path d="M52.7 27.2C49.3 30.9 47.3 36.6 47.3 43.8V468.2C47.3 475.4 49.3 481.1 52.7 484.8L54.7 486.6L298.8 242.5V237.5L54.7 25.4L52.7 27.2Z" fill="#2196F3"/>
                        <path d="M380.2 323.9L298.8 242.5V237.5L380.2 156.1L382.4 157.4L478.8 212.2C486.2 216.4 490.7 224.2 490.7 232.8C490.7 241.4 486.2 249.2 478.8 253.4L382.4 322.6L380.2 323.9Z" fill="#FFC107"/>
                        <path d="M382.4 322.6L298.8 239L52.7 485.1C59.9 492.8 71.9 493.7 85.1 486.2L382.4 322.6Z" fill="#4CAF50"/>
                        <path d="M382.4 157.4L85.1 23.8C71.9 16.3 59.9 17.2 52.7 24.9L298.8 271L382.4 157.4Z" fill="#F44336"/>
                      </svg>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/90">
                        INSTALL ON ANDROID
                      </span>
                      <span className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                        Google Play
                      </span>
                    </div>
                  </div>

                  <span className="text-2xl font-light text-white/80 group-hover/btn:translate-x-1 transition-transform">
                    ›
                  </span>
                </button>
              </div>

              {/* Security Tagline */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 mt-5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-500" />
                  Safe & Secure
                </span>
                <span className="w-1 h-3 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check size={15} className="font-bold stroke-[3]" />
                  Official Release
                </span>
              </div>

            </div>


            {/* WINDOWS CARD */}
            <div className="relative rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 bg-white/95 dark:bg-slate-800/90 border border-[#e5ecf8] dark:border-slate-700/80 shadow-[0_15px_40px_rgba(16,43,117,0.08)] dark:shadow-none hover:shadow-[0_22px_50px_rgba(16,43,117,0.15)] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between group">
              
              {/* Subtle Windows Logo Watermark in Background */}
              <svg 
                className="absolute -top-3 -right-4 w-32 h-32 text-blue-500/[0.07] dark:text-blue-400/[0.05] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110" 
                viewBox="0 0 88 88" 
                fill="currentColor"
              >
                <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.001 46.126zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 45.474v41.534l-47.318-6.685-.015-34.962z"/>
              </svg>

              <div>
                {/* Header Group */}
                <div className="flex items-center gap-4 sm:gap-5 mb-6 relative z-10">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 88 88" fill="currentColor">
                      <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.001 46.126zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 45.474v41.534l-47.318-6.685-.015-34.962z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d4ed8] dark:text-blue-400 tracking-tight leading-none mb-1">
                      Windows
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">
                      PC & Laptop
                    </p>
                  </div>
                </div>

                {/* Windows Download Action Button */}
                <button
                  id="download-windows-btn"
                  onClick={handleWindowsDownload}
                  className="w-full rounded-2xl py-4 px-5 sm:px-6 bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white font-bold shadow-[0_12px_28px_rgba(29,78,216,0.32)] hover:shadow-[0_16px_36px_rgba(29,78,216,0.45)] transition-all duration-200 active:scale-[0.98] flex items-center justify-between gap-3 cursor-pointer group/btn"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Down Arrow in Tray Icon */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/90">
                        DOWNLOAD FOR WINDOWS
                      </span>
                      <span className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                        Download Doctorian
                      </span>
                    </div>
                  </div>

                  <span className="text-2xl font-light text-white/80 group-hover/btn:translate-x-1 transition-transform">
                    ›
                  </span>
                </button>
              </div>

              {/* Security Tagline */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 mt-5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Check size={15} className="font-bold stroke-[3]" />
                  Safe & Secure
                </span>
                <span className="w-1 h-3 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <span className="flex items-center gap-1.5">
                  Offline Installer
                </span>
              </div>

            </div>

          </div>

          {/* BOTTOM FEATURES PILL BAR */}
          <div className="relative z-10 max-w-4xl mx-auto bg-white/90 dark:bg-slate-800/80 border border-[#e4ebf8] dark:border-slate-700/70 rounded-full sm:rounded-full py-3.5 px-6 sm:px-8 flex flex-wrap items-center justify-around gap-4 sm:gap-6 shadow-[0_8px_25px_rgba(0,40,100,0.06)] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold">
            
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>100% Secure</span>
            </div>

            <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Fast Installation</span>
            </div>

            <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <WifiOff size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Works Offline</span>
            </div>

            <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <Lock size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Your Data, Your Control</span>
            </div>

          </div>

          {/* FLOATING STATUS TOAST */}
          <AnimatePresence>
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[250] bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 font-semibold text-sm"
              >
                <span className="text-lg">{statusMessage.icon}</span>
                <span>{statusMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
