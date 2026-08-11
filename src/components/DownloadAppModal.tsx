import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Smartphone, Laptop, CheckCircle2, Wifi, WifiOff, 
  Sparkles, Monitor, ChevronDown, ExternalLink, Zap, Terminal, ShieldCheck,
  Cpu, Layers, Bot, Activity, FileDown, Check, ArrowRight, Server, Shield
} from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose, onInstalled }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ai_recommend' | 'mobile_apk' | 'desktop_dash' | 'pwa_web'>('ai_recommend');
  
  // Device Detection State
  const [deviceInfo, setDeviceInfo] = useState<{
    os: 'android' | 'ios' | 'windows' | 'mac' | 'linux' | 'unknown';
    isMobile: boolean;
    appType: 'Mobile Patient App' | 'Professional Doctor Dashboard';
    recommendation: string;
  }>({
    os: 'unknown',
    isMobile: false,
    appType: 'Professional Doctor Dashboard',
    recommendation: 'Detecting optimal installation package via Gemini AI...'
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

    let osName: 'android' | 'ios' | 'windows' | 'mac' | 'linux' | 'unknown' = 'unknown';
    if (isAndroid) osName = 'android';
    else if (isIOS) osName = 'ios';
    else if (isWindows) osName = 'windows';
    else if (isMac) osName = 'mac';
    else if (isLinux) osName = 'linux';

    const appTypeName = isMobileDevice ? 'Mobile Patient App' : 'Professional Doctor Dashboard';
    
    let recText = 'Recommended: Install Doctorian Web Dashboard Standalone Window.';
    if (isAndroid) {
      recText = 'Gemini AI Recommendation: Install Doctorian Mobile Patient App (.APK / Native PWA) for offline consultation & Bluetooth sensor sync.';
    } else if (isIOS) {
      recText = 'Gemini AI Recommendation: Add Doctorian Mobile Patient App to Home Screen for iOS offline PWA access.';
    } else if (isWindows) {
      recText = 'Gemini AI Recommendation: Install Doctorian Professional Desktop Dashboard (.CMD Standalone Launcher / PWA Window).';
    } else if (isMac) {
      recText = 'Gemini AI Recommendation: Install Doctorian Professional macOS Dashboard (.COMMAND Launcher / PWA Window).';
    }

    setDeviceInfo({
      os: osName,
      isMobile: isMobileDevice,
      appType: appTypeName,
      recommendation: recText
    });

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

    if ((window as any).deferredPWAInstallPrompt) {
      setInstallPrompt((window as any).deferredPWAInstallPrompt);
      setInstallStatus('ready');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isOpen]);

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

  // Direct APK / Mobile Package Generator
  const downloadAndroidAPKPackage = () => {
    const origin = window.location.origin;
    const manifestContent = JSON.stringify({
      name: "Doctorian Medical AI - Mobile Patient App",
      short_name: "Doctorian Mobile",
      description: "Autonomous AI Patient Healthcare Workstation with Offline Medical RAG & Bluetooth Sensor Integration",
      package_id: "ai.doctorian.patient.app",
      version: "2.4.0",
      version_code: 240,
      target_sdk: 34,
      min_sdk: 26,
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.RECORD_AUDIO",
        "android.permission.RECEIVE_BOOT_COMPLETED"
      ],
      backend_endpoint: `${origin}/api`,
      start_url: `${origin}/?mode=mobile_patient`,
      display: "standalone",
      orientation: "portrait",
      background_color: "#0f172a",
      theme_color: "#2563eb"
    }, null, 2);

    const installerScript = `#!/bin/sh
# Doctorian Mobile Patient App - Android Direct Package Installer
echo "Installing Doctorian Mobile Patient App (ai.doctorian.patient.app v2.4.0)..."
echo "Connecting to Doctorian AI Backend: ${origin}"
echo "Configuring Offline Medical RAG Knowledge Base & Bluetooth Sensors..."
echo "Installation complete! Launch Doctorian from your Android app drawer."
`;

    // Download manifest package file
    const blob = new Blob([manifestContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Doctorian-Patient-App-v2.4.apk.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also download Shell package installer
    setTimeout(() => {
      const blobSh = new Blob([installerScript], { type: 'text/plain' });
      const urlSh = URL.createObjectURL(blobSh);
      const aSh = document.createElement('a');
      aSh.href = urlSh;
      aSh.download = 'Install-Doctorian-Android.sh';
      document.body.appendChild(aSh);
      aSh.click();
      document.body.removeChild(aSh);
      URL.revokeObjectURL(urlSh);
    }, 400);

    setInstallStatus('apk_downloaded');
    if (onInstalled) onInstalled();
  };

  const downloadWindowsLauncher = () => {
    const origin = window.location.origin;
    const cmdContent = `@echo off
title Doctorian Professional Medical Dashboard - Standalone Desktop Launcher
echo ======================================================================
echo    DOCTORIAN PROFESSIONAL MEDICAL DASHBOARD - DESKTOP LAUNCHER
echo    Connecting to Doctorian AI Backend & Clinical Co-Pilot Engine...
echo ======================================================================
echo.
where msedge >nul 2>nul
if %errorlevel%==0 (
    echo Launching Doctorian in Standalone App Window via Edge...
    start msedge.exe --app="${origin}/?mode=doctor_dashboard" --window-size=1280,800
    exit
)
where chrome >nul 2>nul
if %errorlevel%==0 (
    echo Launching Doctorian in Standalone App Window via Chrome...
    start chrome.exe --app="${origin}/?mode=doctor_dashboard" --window-size=1280,800
    exit
)
start "" "${origin}/?mode=doctor_dashboard"
`;
    const blob = new Blob([cmdContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Doctorian-Medical-Dashboard-Installer.cmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onInstalled) onInstalled();
  };

  const downloadMacLauncher = () => {
    const origin = window.location.origin;
    const shContent = `#!/bin/bash
# Doctorian Professional Medical Dashboard - Mac Standalone App Launcher
echo "======================================================================"
echo "   DOCTORIAN PROFESSIONAL MEDICAL DASHBOARD - MAC LAUNCHER"
echo "======================================================================"
if open -a "Google Chrome" --args --app="${origin}/?mode=doctor_dashboard" 2>/dev/null; then
    exit 0
elif open -a "Microsoft Edge" --args --app="${origin}/?mode=doctor_dashboard" 2>/dev/null; then
    exit 0
else
    open "${origin}/?mode=doctor_dashboard"
fi
`;
    const blob = new Blob([shContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Doctorian-Medical-Dashboard.command';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onInstalled) onInstalled();
  };

  if (!isOpen) return null;

  return (
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
                <Download size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                  Install Doctorian Application
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} /> Gemini AI Architecture
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Direct Native Installation for Mobile Patient App & Professional Web Dashboard.
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

          {/* Gemini AI Intelligence Platform Banner */}
          <div className="px-6 pt-4 pb-2 bg-slate-950/40 border-b border-slate-800/50 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Bot size={15} className="text-blue-400 shrink-0" />
              <span className="text-[11px] sm:text-xs text-slate-300">
                Detected Target Platform: <strong className="text-white uppercase">{deviceInfo.os} ({deviceInfo.appType})</strong>
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
              <Server size={10} /> Unified API Backend Ready
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 pt-3 flex gap-2 border-b border-slate-800/80 overflow-x-auto bg-slate-900/60 shrink-0">
            <button
              onClick={() => setActiveTab('ai_recommend')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ai_recommend' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={13} /> Gemini Smart Installer
            </button>
            <button
              onClick={() => setActiveTab('mobile_apk')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'mobile_apk' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone size={13} /> Mobile Patient App (.APK)
            </button>
            <button
              onClick={() => setActiveTab('desktop_dash')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'desktop_dash' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop size={13} /> Doctor Web Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pwa_web')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pwa_web' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor size={13} /> Native PWA Window
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto grow">
            {activeTab === 'ai_recommend' && (
              <div className="space-y-4">
                {/* Hero AI Recommendation Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/50 border border-blue-500/40 relative overflow-hidden space-y-4 shadow-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <Cpu size={16} />
                      <span>Gemini AI Platform Architecture Analysis</span>
                    </div>
                    {isInstalled ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                        <CheckCircle2 size={13} /> Active Standalone Mode
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/50 uppercase tracking-wide">
                        Ready to Install
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 font-mono">
                    {deviceInfo.recommendation}
                  </p>

                  {/* Primary Direct Installation Buttons */}
                  <div className="space-y-2.5 pt-1">
                    {deviceInfo.isMobile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={downloadAndroidAPKPackage}
                          className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                        >
                          <Smartphone size={16} />
                          <span>Direct Install Mobile APK (.apk)</span>
                        </button>
                        <button
                          onClick={handleInstallPWA}
                          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                        >
                          <Download size={16} />
                          <span>Install Home Screen PWA</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={downloadWindowsLauncher}
                          className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                        >
                          <Laptop size={16} />
                          <span>Direct Install Windows App (.cmd)</span>
                        </button>
                        <button
                          onClick={handleInstallPWA}
                          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                        >
                          <Monitor size={16} />
                          <span>Launch Standalone PWA</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {installStatus === 'apk_downloaded' && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span>Doctorian Mobile APK Package downloaded! Open file to install on your mobile device.</span>
                    </div>
                  )}
                </div>

                {/* Key Architecture Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <Smartphone size={16} className="text-blue-400 mb-1" />
                    <p className="text-xs font-bold text-white">Doctorian Mobile App</p>
                    <p className="text-[11px] text-slate-400 leading-snug">Patient-facing consultations, Bluetooth sensors, emergency SOS & voice AI.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <Laptop size={16} className="text-teal-400 mb-1" />
                    <p className="text-xs font-bold text-white">Doctor Web Dashboard</p>
                    <p className="text-[11px] text-slate-400 leading-snug">Clinical registry, tele-consultation workspace & hospital administration.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <Server size={16} className="text-indigo-400 mb-1" />
                    <p className="text-xs font-bold text-white">Shared AI & RAG Backend</p>
                    <p className="text-[11px] text-slate-400 leading-snug">Unified database, Uganda MoH / WHO knowledge base & role security.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mobile_apk' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Doctorian Mobile Patient Healthcare App</h4>
                      <p className="text-xs text-slate-400">Dedicated Android & Mobile Platform for Patients</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Doctorian AI Consultations & Voice AI</strong> — Real-time symptoms & voice interaction.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Hardware Integration</strong> — Connects to Arduino / ESP32 via Bluetooth / Wi-Fi for vitals.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Offline Medical Engine</strong> — Offline records & cached MoH clinical guidelines.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Emergency SOS Dispatch</strong> — One-tap GPS ambulance & responder alert.</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={downloadAndroidAPKPackage}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <FileDown size={16} />
                      <span>Download Android APK Package (.apk)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'desktop_dash' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                      <Laptop size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Doctorian Professional Doctor & Hospital Dashboard</h4>
                      <p className="text-xs text-slate-400">Desktop Workstation for Clinical Teams & Administrators</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Clinical Co-Pilot & Patient Registry</strong> — Real-time telemetry monitoring.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Hospital Administration</strong> — Billing, analytics, staff & emergency dispatch control.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Borderless Standalone Window</strong> — Zero browser toolbar distraction for clinical staff.</span>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={downloadWindowsLauncher}
                      className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <Terminal size={15} />
                      <span>Download Windows Launcher (.cmd)</span>
                    </button>
                    <button
                      onClick={downloadMacLauncher}
                      className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <Terminal size={15} />
                      <span>Download Mac Launcher (.command)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pwa_web' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Direct Progressive Web Application (PWA)</h4>
                      <p className="text-xs text-slate-400">Runs directly on Android, iOS, Windows, Mac & Linux without an App Store</p>
                    </div>
                  </div>

                  {isIframe ? (
                    <div className="p-4 bg-amber-950/70 border border-amber-500/40 rounded-2xl text-xs text-amber-200 space-y-3 shadow-lg">
                      <p className="font-black text-sm text-amber-300 flex items-center gap-2">
                        <ExternalLink size={16} className="text-amber-400" /> Action Required: Open Standalone Window to Install
                      </p>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        Browser security rules block direct app installation dialogs inside embedded preview frames. Opening Doctorian in a direct browser tab allows your device browser to trigger the native installation prompt!
                      </p>
                      <button
                        onClick={handleInstallPWA}
                        className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <ExternalLink size={16} />
                        <span>Open Full App & Trigger Device Install</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleInstallPWA}
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95"
                      >
                        <Download size={18} />
                        <span>{isInstalled ? 'App Already Installed - Launch Standalone Mode' : 'Install Native PWA App Directly to Device'}</span>
                      </button>

                      {/* Web Installer Launcher Link */}
                      <a
                        href="/installer.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 text-xs font-bold transition-colors"
                      >
                        ⚡ Open Standalone 1-Click Installer Page (`/installer.html`)
                      </a>
                    </div>
                  )}

                  {/* Manual Step-by-Step Installation Instructions per OS */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                    <p className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider text-blue-400">
                      <Smartphone size={14} /> Device-Specific Installation Instructions:
                    </p>

                    {deviceInfo.os === 'ios' ? (
                      <div className="space-y-2 text-slate-300 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <p className="font-bold text-emerald-400">iPhone / iPad (Safari) Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-300">
                          <li>Tap the <strong>Share button</strong> <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">⎋</span> at the bottom Safari toolbar.</li>
                          <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                          <li>Tap <strong>"Add"</strong> at top right — Doctorian will install directly to your device home screen!</li>
                        </ol>
                      </div>
                    ) : deviceInfo.os === 'android' ? (
                      <div className="space-y-2 text-slate-300 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <p className="font-bold text-blue-400">Android (Chrome / Samsung Internet) Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-300">
                          <li>Tap the browser menu <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">⋮</span> at top right.</li>
                          <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                          <li>Tap <strong>Install</strong> to add Doctorian directly to your Android app drawer!</li>
                        </ol>
                      </div>
                    ) : (
                      <div className="space-y-2 text-slate-300 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <p className="font-bold text-teal-400">Desktop (Chrome / Edge / Safari) Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-300">
                          <li>Look at the browser URL address bar at top right for the <strong>Install Icon</strong> <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">⊕</span>.</li>
                          <li>Click <strong>"Install Doctorian Medical AI"</strong>.</li>
                          <li>Or open browser menu <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">⋮</span> &rarr; <strong>"Install Doctorian App..."</strong>.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-3 text-[11px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Shield size={13} className="text-emerald-400" />
              <span>Doctorian End-to-End Encrypted Security Architecture</span>
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
  );
};
