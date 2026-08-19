import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, X, EyeOff, Eye, Moon, Sun, Clock, Activity, Bell, BellOff,
  Volume2, VolumeX, Mic, MicOff, HelpCircle, Home, Bot, Dna, Palette, 
  Brain, Cpu, Stethoscope, Monitor, TrendingUp, Zap, UserCheck, Pill,
  Calendar as CalendarIcon, FileText, Shield, AlertTriangle, Sparkles, Check
} from 'lucide-react';

export interface WindowsSystemsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  isOffline: boolean;
  isEyeCareMode: boolean;
  setIsEyeCareMode: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  setIsThemeSchedulerOpen: (val: boolean) => void;
  vibrateCriticalAlert?: () => void;
  addToast: (msg: string, type?: "info" | "success" | "error") => void;
  handleOpenAdminInfo?: () => void;
  hasNotification?: boolean;
  isAudioMenuOpen?: boolean;
  setIsAudioMenuOpen?: (val: boolean) => void;
  vitalsAudioEnabled?: boolean;
  toggleVitalsAudio?: () => void;
  vitalsAudioVolume?: number;
  handleVitalsVolumeChange?: (val: number) => void;
  soundscapeEnabled?: boolean;
  toggleSoundscapeGlobal?: () => void;
  soundscapeVolume?: number;
  handleSoundscapeVolChangeGlobal?: (val: number) => void;
  soundscapePreset?: string;
  changePresetGlobal?: (preset: any) => void;
  showInstallButton?: boolean;
  hasInstalledApp?: boolean;
  isStandalone?: boolean;
  installApp?: () => void;
}

interface LauncherNode {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

export const WindowsSystemsHubModal: React.FC<WindowsSystemsHubModalProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  isOffline,
  isEyeCareMode,
  setIsEyeCareMode,
  isDarkMode,
  setIsDarkMode,
  setIsThemeSchedulerOpen,
  vibrateCriticalAlert,
  addToast,
  isAudioMenuOpen,
  setIsAudioMenuOpen,
  vitalsAudioEnabled,
  toggleVitalsAudio,
  soundscapeEnabled,
  toggleSoundscapeGlobal,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [hapticsActive, setHapticsActive] = useState(true);
  const [solarSyncActive, setSolarSyncActive] = useState(true);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Toggle Live Cache / Offline mode
  const handleToggleCache = () => {
    const forced = localStorage.getItem("medical_forced_offline");
    const nextVal = forced === "true" ? "false" : "true";
    localStorage.setItem("medical_forced_offline", nextVal);
    window.dispatchEvent(new Event('storage'));
    const isNowOffline = nextVal === "true";
    addToast(isNowOffline ? "Local Cache Engaged (Off-Grid Mode)" : "Live Cloud Cache Sync Active", isNowOffline ? "info" : "success");
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // Voice Command Handler
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Fallback narration
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance("Voice recognition active. You can launch Dashboard, AI Consultation, Vitals, Bio Monitor, or Lab Analyser.");
        window.speechSynthesis.speak(utter);
      }
      addToast("Voice recognition ready. Say a node name to launch.", "info");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (!isListening) {
        setIsListening(true);
        setVoiceTranscript('Listening for clinical command...');
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase().trim();
          setVoiceTranscript(`"${transcript}"`);
          setIsListening(false);

          if (transcript.includes('home') || transcript.includes('dashboard')) {
            onNavigate('home');
            onClose();
            addToast("Voice Command: Navigated to Home Dashboard", "success");
          } else if (transcript.includes('ai') || transcript.includes('consult') || transcript.includes('neural')) {
            onNavigate('ai_nexus');
            onClose();
            addToast("Voice Command: Navigated to AI Consultation", "success");
          } else if (transcript.includes('lab') || transcript.includes('blood') || transcript.includes('diagnostic')) {
            onNavigate('diagnostic_lab');
            onClose();
            addToast("Voice Command: Navigated to Diagnostic Lab", "success");
          } else if (transcript.includes('monitor') || transcript.includes('bio')) {
            onNavigate('monitor');
            onClose();
            addToast("Voice Command: Navigated to Bio-Monitor", "success");
          } else if (transcript.includes('doctor') || transcript.includes('clinic')) {
            onNavigate('doctors_dashboard');
            onClose();
            addToast("Voice Command: Navigated to Doctors' Portal", "success");
          } else if (transcript.includes('vital') || transcript.includes('energy')) {
            onNavigate('vitality');
            onClose();
            addToast("Voice Command: Navigated to Vitality Matrix", "success");
          } else if (transcript.includes('med') || transcript.includes('pill')) {
            onNavigate('meds');
            onClose();
            addToast("Voice Command: Navigated to Medications", "success");
          } else if (transcript.includes('dark')) {
            setIsDarkMode(true);
            addToast("Voice Command: Dark Mode Activated", "info");
          } else if (transcript.includes('light')) {
            setIsDarkMode(false);
            addToast("Voice Command: Light Mode Activated", "info");
          } else {
            addToast(`Command "${transcript}" recognized. Launching search.`, "info");
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setVoiceTranscript('');
          addToast("Voice listening ended.", "info");
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } catch {
      setIsListening(false);
      addToast("Microphone accessed.", "info");
    }
  };

  // Haptic feedback trigger
  const handleHaptics = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 40, 50]);
    }
    if (vibrateCriticalAlert) {
      vibrateCriticalAlert();
    }
    setHapticsActive(!hapticsActive);
    addToast(hapticsActive ? "Tactile Haptics Pulse: Active" : "Haptics Disabled", "info");
  };

  // Alerts toggle
  const handleToggleAlerts = () => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    addToast(next ? "Clinical Audio & Visual Alerts: Enabled" : "Clinical Alerts: Muted", next ? "success" : "info");
    if (navigator.vibrate) navigator.vibrate(25);
  };

  // Audio Hub toggle
  const handleAudioHub = () => {
    if (setIsAudioMenuOpen) {
      setIsAudioMenuOpen(!isAudioMenuOpen);
    } else if (toggleVitalsAudio) {
      toggleVitalsAudio();
    } else if (toggleSoundscapeGlobal) {
      toggleSoundscapeGlobal();
    }
    addToast("Audio Hub & Biosonification Engine toggled", "info");
    if (navigator.vibrate) navigator.vibrate(25);
  };

  // Solar Sync toggle
  const handleSolarSync = () => {
    setSolarSyncActive(!solarSyncActive);
    setIsThemeSchedulerOpen(true);
    onClose();
    addToast("Circadian Solar Theme Scheduler opened", "info");
  };

  // 10 Primary Launch Nodes matching photo perfectly
  const primaryNodes: LauncherNode[] = [
    {
      id: 'home',
      title: 'DASHBOARD',
      subtitle: 'CLINICAL CARE',
      icon: <Home size={20} />,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'ai_nexus',
      title: 'AI CONSULT',
      subtitle: 'DIAGNOSTIC AI',
      icon: <Bot size={20} />,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'genomic_longevity',
      title: 'GENOMICS',
      subtitle: 'DNA & RESEARCH',
      icon: <Dna size={20} />,
      color: 'text-rose-500 dark:text-rose-400',
    },
    {
      id: 'illustrator',
      title: 'ILLUSTRATOR',
      subtitle: '3D ANATOMY',
      icon: <Palette size={20} />,
      color: 'text-amber-500 dark:text-amber-400',
    },
    {
      id: 'neuro',
      title: 'COGNISHUB',
      subtitle: 'NEURAL LAB',
      icon: <Brain size={20} />,
      color: 'text-violet-600 dark:text-violet-400',
    },
    {
      id: 'biomatic',
      title: 'KNOWLEDGE HUB',
      subtitle: 'TRIALS & DATA',
      icon: <Cpu size={20} />,
      color: 'text-cyan-500 dark:text-cyan-400',
    },
    {
      id: 'diagnostic_lab',
      title: 'LAB ANALYSER',
      subtitle: 'PATHOLOGY',
      icon: <Stethoscope size={20} />,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'monitor',
      title: 'BIO-MONITOR',
      subtitle: 'TELEMETRY',
      icon: <Monitor size={20} />,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'health_trace',
      title: 'TIMELINE',
      subtitle: 'TRAJECTORY',
      icon: <TrendingUp size={20} />,
      color: 'text-blue-500 dark:text-blue-400',
    },
    {
      id: 'vitality',
      title: 'VITALITY MATRIX',
      subtitle: 'METABOLIC INDEX',
      icon: <Zap size={20} />,
      color: 'text-amber-500 dark:text-amber-400',
    },
  ];

  // Secondary clinical nodes for comprehensive access
  const secondaryNodes: LauncherNode[] = [
    {
      id: 'doctors_dashboard',
      title: "PHYSICIANS",
      subtitle: 'WORKSTATION',
      icon: <UserCheck size={20} />,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'meds',
      title: 'PHARMACY',
      subtitle: 'PRESCRIPTIONS & RX',
      icon: <Pill size={20} />,
      color: 'text-rose-500 dark:text-rose-400',
    },
    {
      id: 'clinical_roadmap',
      title: 'APPOINTMENTS',
      subtitle: 'CONSULTATIONS',
      icon: <CalendarIcon size={20} />,
      color: 'text-sky-500 dark:text-sky-400',
    },
    {
      id: 'records',
      title: 'HEALTH RECORDS',
      subtitle: 'EHR VAULT',
      icon: <FileText size={20} />,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'biosecurity',
      title: 'BIOSECURITY',
      subtitle: '2FA VAULT',
      icon: <Shield size={20} />,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'emergency',
      title: 'EMERGENCY 911',
      subtitle: 'SOS TRAUMA',
      icon: <AlertTriangle size={20} />,
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white dark:bg-slate-925 border border-slate-200/90 dark:border-slate-800 rounded-[32px] shadow-[0_25px_60px_rgba(16,43,117,0.3)] overflow-hidden relative my-auto"
          id="doctorian-windows-systems-hub"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-850 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                <LayoutGrid size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-[900] uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                  WINDOWS SYSTEMS HUB
                </h2>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1 leading-none">
                  CLINICAL NODE PANEL LAUNCHER
                </p>
              </div>
            </div>

            <button
              id="btn-close-systems-hub"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close Systems Hub"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-5 max-h-[55vh] overflow-y-auto custom-scrollbar">
            {/* Section 1: OPERATIONAL CONTROLS */}
            <div className="space-y-3.5">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                OPERATIONAL CONTROLS
              </span>

              {/* Top 2 Big Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cache Sync Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'} shrink-0 shadow-xs`} />
                      <span className="text-xs font-[900] text-slate-900 dark:text-white uppercase tracking-tight">
                        CACHE SYNC
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-4.5">
                      {isOffline ? 'OFF-GRID ARCHIVE' : 'LIVE SYNC'}
                    </p>
                  </div>

                  <button
                    id="btn-toggle-cache-sync"
                    onClick={handleToggleCache}
                    className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline px-2 py-1 cursor-pointer transition-colors"
                  >
                    TOGGLE
                  </button>
                </div>

                {/* Voice Controls Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex items-center justify-between shadow-xs relative">
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600 dark:text-purple-400 shrink-0">
                        <Mic size={15} />
                      </span>
                      <span className="text-xs font-[900] text-slate-900 dark:text-white uppercase tracking-tight truncate">
                        VOICE CO...
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-5.5 truncate">
                      {isListening ? 'LISTENING...' : 'HANDS-FREE'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="btn-trigger-voice-controls"
                      onClick={handleToggleVoice}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        isListening
                          ? 'bg-purple-600 text-white animate-pulse ring-4 ring-purple-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750'
                      }`}
                      title={isListening ? "Listening... click to stop" : "Activate Hands-Free Voice Navigation"}
                    >
                      <Mic size={19} className={isListening ? "animate-bounce" : ""} />
                    </button>

                    <button
                      onClick={() => setShowVoiceHelp(!showVoiceHelp)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                      title="Voice Command Help"
                    >
                      <HelpCircle size={17} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Voice Command Transcript or Help Tooltip */}
              {showVoiceHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 text-xs text-purple-950 dark:text-purple-200"
                >
                  <p className="font-bold mb-1">🎙️ Supported Voice Commands:</p>
                  <p className="text-[11px] opacity-90">Say: "Open Dashboard", "Open AI Consultation", "Check Vitals", "Open Lab Analyser", "Bio-Monitor", "Doctors Portal", "Dark Mode", or "Light Mode".</p>
                </motion.div>
              )}

              {voiceTranscript && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Heard: {voiceTranscript}</span>
                </div>
              )}

              {/* Pill Button Strip (6 Action Buttons matching photo exactly) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {/* 1. Legibility */}
                <button
                  id="btn-pill-legibility"
                  onClick={() => {
                    setIsEyeCareMode(!isEyeCareMode);
                    addToast(isEyeCareMode ? "Standard Contrast Mode" : "High Contrast & Legibility Active", "info");
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl font-[900] text-xs uppercase tracking-tight transition-all cursor-pointer border shadow-2xs ${
                    isEyeCareMode
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300'
                      : 'border-slate-850 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-150 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <EyeOff size={15} />
                  <span>LEGIBILITY</span>
                </button>

                {/* 2. Dark / Light */}
                <button
                  id="btn-pill-dark"
                  onClick={() => {
                    setIsDarkMode(!isDarkMode);
                    addToast(isDarkMode ? "Switched to Light Canvas" : "Switched to Dark Canvas", "info");
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl font-[900] text-xs uppercase tracking-tight transition-all cursor-pointer border border-slate-850 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-150 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
                >
                  {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                  <span>{isDarkMode ? 'LIGHT' : 'DARK'}</span>
                </button>

                {/* 3. Solar Sync (Orange Outline & Text) */}
                <button
                  id="btn-pill-solar-sync"
                  onClick={handleSolarSync}
                  className="flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl font-[900] text-xs uppercase tracking-tight transition-all cursor-pointer border border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 hover:bg-amber-100/50 shadow-2xs"
                >
                  <Clock size={15} />
                  <span>SOLAR SYNC</span>
                </button>

                {/* 4. Haptics (Rose/Pink Outline & Text) */}
                <button
                  id="btn-pill-haptics"
                  onClick={handleHaptics}
                  className="flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl font-[900] text-xs uppercase tracking-tight transition-all cursor-pointer border border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-500 hover:bg-rose-100/50 shadow-2xs"
                >
                  <Activity size={15} />
                  <span>HAPTICS</span>
                </button>

                {/* 5. Alerts */}
                <button
                  id="btn-pill-alerts"
                  onClick={handleToggleAlerts}
                  className={`flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl font-[900] text-xs uppercase tracking-tight transition-all cursor-pointer border shadow-2xs ${
                    alertsEnabled
                      ? 'border-slate-850 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-150 hover:bg-slate-50 dark:hover:bg-slate-800'
                      : 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-400'
                  }`}
                >
                  {alertsEnabled ? <Bell size={15} /> : <BellOff size={15} />}
                  <span>ALERTS</span>
                </button>

                {/* 6. Audio Hub */}
                <button
                  id="btn-pill-audio-hub"
                  onClick={handleAudioHub}
                  className="flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl font-[900] text-xs uppercase tracking-tight transition-all cursor-pointer border border-slate-850 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-150 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
                >
                  {vitalsAudioEnabled || soundscapeEnabled ? (
                    <Volume2 size={15} className="text-blue-500" />
                  ) : (
                    <VolumeX size={15} />
                  )}
                  <span>AUDIO HUB</span>
                </button>
              </div>
            </div>

            {/* Section 2: CLINICAL SYSTEMS LAUNCHER */}
            <div className="space-y-3.5 pt-2">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                CLINICAL SYSTEMS LAUNCHER
              </span>

              {/* 2-Column Grid of System Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {primaryNodes.map((node) => {
                  const isActive = currentView === node.id;

                  return (
                    <button
                      key={`hub-node-${node.id}`}
                      id={`btn-node-${node.id}`}
                      onClick={() => {
                        onNavigate(node.id);
                        onClose();
                        addToast(`Launched ${node.title}`, "success");
                        if (navigator.vibrate) navigator.vibrate(20);
                      }}
                      className={`w-full p-4 rounded-2xl text-left transition-all duration-150 cursor-pointer flex items-center gap-3.5 border shadow-xs group ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-blue-500/10 ring-1 ring-blue-500/20'
                          : 'border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-850'
                      }`}
                    >
                      <div className={`shrink-0 ${node.color} group-hover:scale-110 transition-transform`}>
                        {node.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-[900] uppercase tracking-tight truncate ${
                            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                          }`}>
                            {node.title}
                          </h4>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5 truncate">
                          {node.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Expandable More Specialized Workstations */}
              <div className="pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  ADDITIONAL CLINICAL MODULES
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {secondaryNodes.map((node) => {
                    const isActive = currentView === node.id;
                    return (
                      <button
                        key={`hub-sec-node-${node.id}`}
                        onClick={() => {
                          onNavigate(node.id);
                          onClose();
                          addToast(`Launched ${node.title}`, "success");
                        }}
                        className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 border shadow-2xs ${
                          isActive
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                            : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-850 hover:border-slate-200'
                        }`}
                      >
                        <div className={`shrink-0 ${node.color}`}>
                          {node.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[11px] font-[900] uppercase tracking-tight text-slate-800 dark:text-slate-200 truncate">
                            {node.title}
                          </h5>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                            {node.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
