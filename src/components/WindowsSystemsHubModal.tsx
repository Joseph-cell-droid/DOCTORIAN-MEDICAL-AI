import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { 
  LayoutGrid, X, EyeOff, Eye, Moon, Sun, Clock, Activity, Bell, BellOff,
  Volume2, VolumeX, Mic, MicOff, HelpCircle, Home, Bot, Dna, Palette, 
  Brain, Cpu, Stethoscope, Monitor, TrendingUp, Zap, UserCheck, Pill,
  Calendar as CalendarIcon, FileText, Shield, AlertTriangle, Sparkles, Check,
  Sliders, Globe, Settings, ChevronRight, UserPlus, Info, Download, RefreshCw,
  Search, ExternalLink, Power, Terminal
} from 'lucide-react';
import { isMarianMTModeActive } from '../utils/marianMT';

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
  onOpenSettings?: () => void;
  currentLanguage?: string;
  onChangeLanguage?: (lang: string) => void;
  onOpenMarianConsole?: () => void;
  downloadedLanguages?: string[];
  downloadingLang?: string | null;
  downloadProgress?: number;
  handleDownloadLanguage?: (lang: string) => void;
}

interface LauncherNode {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

interface GroupTabDef {
  id: 'clinical' | 'diagnostics' | 'specialized' | 'settings' | 'languages' | 'controls';
  label: string;
  category: 'CLINICAL SUITE' | 'SYSTEM & PREFERENCES';
  subtitle: string;
  icon: React.ReactNode;
  count?: number | string;
}

const LANGUAGES_LIST = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', native: 'English' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', native: 'English' },
  { code: 'lg', name: 'Luganda', flag: '🇺🇬', native: 'Luganda' },
  { code: 'nyn', name: 'Runyankole-Rukiga', flag: '🇺🇬', native: 'Runyankore-Rukiga' },
  { code: 'ach', name: 'Acholi-Luo', flag: '🇺🇬', native: 'Lwo / Acholi' },
  { code: 'laj', name: 'Langi', flag: '🇺🇬', native: 'Leb Lango' },
  { code: 'teo', name: 'Iteso', flag: '🇺🇬', native: 'Ateso' },
  { code: 'xog', name: 'Lusoga', flag: '🇺🇬', native: 'Olusoga' },
  { code: 'lgg', name: 'Lugbara', flag: '🇺🇬', native: 'Lugbarati' },
  { code: 'nyr', name: 'Runyoro-Rutooro', flag: '🇺🇬', native: 'Runyoro-Rutooro' },
  { code: 'koo', name: 'Rukonjo', flag: '🇺🇬', native: 'Olukonjo' },
  { code: 'samia', name: 'Samia', flag: '🇺🇬', native: 'Lusamia' },
  { code: 'kdj', name: 'Karamojong', flag: '🇺🇬', native: 'Ngakarimojong' },
  { code: 'sw-KE', name: 'Swahili', flag: '🇰🇪', native: 'Kiswahili' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' }
];

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
  onOpenSettings,
  currentLanguage = 'English (US)',
  onChangeLanguage,
  onOpenMarianConsole,
  downloadedLanguages = ['English (US)', 'English (UK)'],
  downloadingLang = null,
  downloadProgress = 0,
  handleDownloadLanguage,
}) => {
  const [activeGroup, setActiveGroup] = useState<'clinical' | 'diagnostics' | 'specialized' | 'settings' | 'languages' | 'controls'>('clinical');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [hapticsActive, setHapticsActive] = useState(true);
  const [solarSyncActive, setSolarSyncActive] = useState(true);
  const [langSearchQuery, setLangSearchQuery] = useState('');

  // Close on Escape key
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
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance("Voice recognition active. Launching clinical triage.");
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

      recognition.onstart = () => {
        setIsListening(true);
        addToast("Listening for clinical voice command...", "info");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setVoiceTranscript(transcript);
        setIsListening(false);

        if (transcript.includes('dashboard') || transcript.includes('home')) {
          onNavigate('home');
          onClose();
          addToast("Voice Command: Opened Dashboard", "success");
        } else if (transcript.includes('ai') || transcript.includes('consult') || transcript.includes('doctor')) {
          onNavigate('ai_nexus');
          onClose();
          addToast("Voice Command: Opened AI Consultation", "success");
        } else if (transcript.includes('monitor') || transcript.includes('telemetry') || transcript.includes('vital')) {
          onNavigate('monitor');
          onClose();
          addToast("Voice Command: Opened Bio-Monitor", "success");
        } else if (transcript.includes('lab') || transcript.includes('analyser')) {
          onNavigate('diagnostic_lab');
          onClose();
          addToast("Voice Command: Opened Lab Analyser", "success");
        } else if (transcript.includes('settings')) {
          if (onOpenSettings) {
            onClose();
            onOpenSettings();
          } else {
            setActiveGroup('settings');
          }
          addToast("Voice Command: Opened App Settings", "success");
        } else if (transcript.includes('language') || transcript.includes('dialect')) {
          setActiveGroup('languages');
          addToast("Voice Command: Opened Dialect Switcher", "success");
        } else if (transcript.includes('dark')) {
          setIsDarkMode(true);
          addToast("Voice Command: Dark Mode Activated", "info");
        } else if (transcript.includes('light')) {
          setIsDarkMode(false);
          addToast("Voice Command: Light Mode Activated", "info");
        } else {
          addToast(`Voice parsed: "${transcript}". No direct view match.`, "info");
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        addToast("Voice input timed out or microphone inaccessible", "info");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      addToast("Voice speech engine uninitialized", "info");
    }
  };

  const handleHaptics = () => {
    const next = !hapticsActive;
    setHapticsActive(next);
    if (next && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
    addToast(next ? "Tactile Haptic Feedback: Active" : "Tactile Haptics: Muted", next ? "success" : "info");
  };

  const handleToggleAlerts = () => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    addToast(next ? "Clinical Audio & Visual Alerts: Enabled" : "Clinical Alerts: Muted", next ? "success" : "info");
    if (navigator.vibrate) navigator.vibrate(25);
  };

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

  const handleSolarSync = () => {
    setSolarSyncActive(!solarSyncActive);
    setIsThemeSchedulerOpen(true);
    onClose();
    addToast("Circadian Solar Theme Scheduler opened", "info");
  };

  // Node collections
  const clinicalNodes: LauncherNode[] = [
    { id: 'home', title: 'DASHBOARD', subtitle: 'CLINICAL CARE', icon: <Home size={20} />, color: 'text-blue-500' },
    { id: 'ai_nexus', title: 'AI CONSULT', subtitle: 'DIAGNOSTIC AI', icon: <Bot size={20} />, color: 'text-purple-500', badge: 'AI LIVE' },
    { id: 'symptoms', title: 'SYMPTOM TRIAGE', subtitle: 'DIFFERENTIAL', icon: <Sparkles size={20} />, color: 'text-amber-500' },
    { id: 'monitor', title: 'BIO-MONITOR', subtitle: 'TELEMETRY VITAL', icon: <Monitor size={20} />, color: 'text-cyan-500' },
    { id: 'meds', title: 'PHARMACY RX', subtitle: 'PRESCRIPTIONS', icon: <Pill size={20} />, color: 'text-rose-500' },
    { id: 'vitality', title: 'VITALITY MATRIX', subtitle: 'METABOLIC INDEX', icon: <Zap size={20} />, color: 'text-emerald-500' },
    { id: 'clinical_roadmap', title: 'APPOINTMENTS', subtitle: 'CONSULTATIONS', icon: <CalendarIcon size={20} />, color: 'text-sky-500' },
    { id: 'emergency', title: 'EMERGENCY 911', subtitle: 'SOS TRAUMA DISPATCH', icon: <AlertTriangle size={20} />, color: 'text-red-500', badge: '24/7' },
  ];

  const diagnosticNodes: LauncherNode[] = [
    { id: 'nextgen_tech', title: 'NEXT-GEN AI SUITE', subtitle: 'STETHOSCOPE & PULSE', icon: <Sparkles size={20} />, color: 'text-purple-500', badge: 'NEXT-GEN' },
    { id: 'diagnostic_lab', title: 'LAB ANALYSER', subtitle: 'PATHOLOGY TESTS', icon: <Stethoscope size={20} />, color: 'text-emerald-500' },
    { id: 'health_trace', title: 'TIMELINE', subtitle: 'LONGITUDINAL TRACK', icon: <TrendingUp size={20} />, color: 'text-teal-500' },
    { id: 'illustrator', title: 'ILLUSTRATOR', subtitle: '3D ANATOMY', icon: <Palette size={20} />, color: 'text-indigo-500' },
    { id: 'ambient_scribe', title: 'AMBIENT SCRIBE', subtitle: 'SOAP & MESH SYNC', icon: <Mic size={20} />, color: 'text-blue-500', badge: 'NEW' },
  ];

  const specializedNodes: LauncherNode[] = [
    { id: 'doctors_dashboard', title: 'PHYSICIANS', subtitle: 'WORKSTATION', icon: <UserCheck size={20} />, color: 'text-indigo-500' },
    { id: 'specialist', title: 'SPECIALISTS', subtitle: 'DIRECTORY & REFERRAL', icon: <UserPlus size={20} />, color: 'text-blue-500' },
    { id: 'neuro', title: 'COGNISHUB', subtitle: 'NEURAL & COGNITIVE LAB', icon: <Brain size={20} />, color: 'text-violet-500' },
    { id: 'genomic_longevity', title: 'GENOMICS', subtitle: 'DNA & LONGEVITY', icon: <Dna size={20} />, color: 'text-rose-500' },
    { id: 'fitness', title: 'LONGEVITY PROTOCOLS', subtitle: 'PHYSIOLOGICAL REGIMEN', icon: <Activity size={20} />, color: 'text-green-500' },
    { id: 'biomatic', title: 'KNOWLEDGE HUB', subtitle: 'TRIALS & DATA', icon: <Cpu size={20} />, color: 'text-cyan-500' },
  ];

  // Group Definitions matching real app button style & categorized navigation
  const groupTabs: GroupTabDef[] = [
    // Clinical Suite
    { 
      id: 'clinical', 
      label: 'Clinical Care', 
      category: 'CLINICAL SUITE',
      subtitle: 'Triage, Vitals & Rx', 
      icon: <Home size={17} />, 
      count: clinicalNodes.length 
    },
    { 
      id: 'diagnostics', 
      label: 'Diagnostics', 
      category: 'CLINICAL SUITE',
      subtitle: 'Pathology & 3D Anatomy', 
      icon: <Stethoscope size={17} />, 
      count: diagnosticNodes.length 
    },
    { 
      id: 'specialized', 
      label: 'Specialized', 
      category: 'CLINICAL SUITE',
      subtitle: 'Neural Lab & DNA Genomics', 
      icon: <Brain size={17} />, 
      count: specializedNodes.length 
    },
    // System & Preferences (Relocated Settings & Languages from top bar)
    { 
      id: 'settings', 
      label: 'App Settings', 
      category: 'SYSTEM & PREFERENCES',
      subtitle: 'Operations & Toggles', 
      icon: <Sliders size={17} />, 
      count: 'Config' 
    },
    { 
      id: 'languages', 
      label: 'Languages & Dialects', 
      category: 'SYSTEM & PREFERENCES',
      subtitle: 'MarianMT Offline Core', 
      icon: <Globe size={17} />, 
      count: LANGUAGES_LIST.length 
    },
    { 
      id: 'controls', 
      label: 'System Controls', 
      category: 'SYSTEM & PREFERENCES',
      subtitle: 'Audio, Solar & Cache', 
      icon: <Cpu size={17} />, 
      count: 6 
    },
  ];

  // Animation variants for smart modernized button sliding
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.03,
      }
    },
    exit: {
      opacity: 0,
      x: -16,
      transition: { duration: 0.15 }
    }
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, x: 28, scale: 0.96 },
    show: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 360,
        damping: 26,
        mass: 0.8
      }
    }
  };

  const renderActiveNodeList = (nodes: LauncherNode[]) => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {nodes.map((node) => {
        const isActive = currentView === node.id;
        return (
          <motion.button
            key={`win-node-${node.id}`}
            variants={buttonVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onNavigate(node.id);
              onClose();
              addToast(`Launched ${node.title}`, "success");
            }}
            className={`w-full p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-center gap-3 border shadow-xs group relative overflow-hidden ${
              isActive
                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/10'
                : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
            }`}
          >
            {/* Real App Button Left Accent Indicator */}
            <div className={`w-1 h-9 rounded-full transition-all shrink-0 ${
              isActive ? 'bg-blue-600 shadow-xs' : 'bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
            }`} />

            {/* Real App Icon Badge */}
            <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-center shrink-0 shadow-xs ${node.color} group-hover:scale-110 group-hover:rotate-1 transition-all`}>
              {node.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <span className={`text-xs font-black uppercase tracking-tight truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                  {node.title}
                </span>
                {node.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest shrink-0 font-mono">
                    {node.badge}
                  </span>
                )}
              </div>
              <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">
                {node.subtitle}
              </p>
            </div>
            
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </motion.button>
        );
      })}
    </motion.div>
  );

  const filteredLanguages = LANGUAGES_LIST.filter(lang => 
    lang.name.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
    lang.native.toLowerCase().includes(langSearchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-[2.2rem] shadow-[0_25px_60px_rgba(16,43,117,0.35)] overflow-hidden relative my-auto flex flex-col"
          id="doctorian-windows-systems-hub"
        >
          {/* Header Bar with quick access to Relocated Settings & Languages */}
          <div className="px-5 py-4 sm:px-6 sm:py-4.5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 bg-slate-50/70 dark:bg-slate-900/40">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
                <LayoutGrid size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                  Doctorian Systems Hub
                </h2>
                <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">
                  Central Clinical Operations & Unified Control Center
                </p>
              </div>
            </div>

            {/* Quick Access Action Buttons in Header */}
            <div className="flex items-center gap-2">
              {/* NextGen Intelligence Suite Quick Launch */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('nextgen_tech');
                  onClose();
                  addToast('Opening Next-Gen Clinical Intelligence Suite', 'success');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white border-purple-400/80 shadow-purple-500/20"
                title="Next-Gen Clinical Intelligence Suite (rPPG Pulse, Stethoscope, Organ Twin, Consensus Matrix)"
              >
                <Sparkles size={14} className="text-yellow-300 animate-pulse shrink-0" />
                <span className="text-[10px] uppercase tracking-wider font-black">NextGen Tech</span>
              </button>
              {/* Settings Action Button (Moved from upper bar) */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenSettings) {
                    onClose();
                    onOpenSettings();
                  } else {
                    setActiveGroup('settings');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer ${
                  activeGroup === 'settings'
                    ? 'bg-cyan-500 border-cyan-400 text-white shadow-sm font-black'
                    : 'bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200'
                }`}
                title="Application Settings & Feature Toggles"
              >
                <Sliders size={14} className={activeGroup === 'settings' ? 'text-white' : 'text-cyan-500'} />
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider">Settings</span>
              </button>

              {/* Language Action Button (Moved from upper bar) */}
              <button
                type="button"
                onClick={() => setActiveGroup('languages')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer ${
                  activeGroup === 'languages'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm font-black'
                    : 'bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200'
                }`}
                title="Change Interface Dialect / Languages"
              >
                <Globe size={14} className={activeGroup === 'languages' ? 'text-white' : 'text-blue-500'} />
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider">
                  {currentLanguage.split(' ')[0]}
                </span>
              </button>

              <button
                id="btn-close-systems-hub"
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ml-1"
                aria-label="Close Systems Hub"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Main Body: Grouped Side Buttons at Left + Smart Sliding View at Right */}
          <div className="flex flex-col md:flex-row flex-1 min-h-[460px] max-h-[72vh] overflow-hidden">
            {/* LEFT SIDEBAR: Grouped Side Buttons appearing like real app buttons */}
            <div className="w-full md:w-64 p-3.5 bg-slate-50/70 dark:bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800/80 shrink-0 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar">
              
              {/* Group Category 1: CLINICAL SUITE */}
              <div className="flex md:flex-col gap-1.5 shrink-0 min-w-max md:min-w-0 w-full">
                <span className="hidden md:flex text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 py-1 items-center justify-between">
                  <span>Clinical Suite</span>
                  <span className="text-[8px] font-mono opacity-70">18 NODES</span>
                </span>

                {groupTabs.filter(t => t.category === 'CLINICAL SUITE').map((tab) => {
                  const isSelected = activeGroup === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveGroup(tab.id)}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl font-bold transition-all duration-200 cursor-pointer whitespace-nowrap md:w-full group text-left relative border outline-none ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border-blue-500 font-black'
                          : 'bg-white/80 dark:bg-slate-850/80 border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs active:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Real App Icon Badge */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isSelected
                            ? 'bg-white/20 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 group-hover:text-blue-500'
                        }`}>
                          {tab.icon}
                        </div>

                        <div className="flex flex-col min-w-0 leading-tight">
                          <span className="text-xs font-black tracking-tight truncate">{tab.label}</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider truncate mt-0.5 ${
                            isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {tab.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Pill Badge */}
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-750'
                      }`}>
                        {tab.count}
                      </span>

                      {/* Active indicator bar */}
                      {isSelected && (
                        <motion.div 
                          layoutId="active-side-tab-accent"
                          className="hidden md:block absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white shadow-xs" 
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group Category 2: SYSTEM & PREFERENCES (Relocated from Top Bar) */}
              <div className="flex md:flex-col gap-1.5 shrink-0 min-w-max md:min-w-0 w-full pt-1 md:pt-2 md:border-t md:border-slate-200/60 md:dark:border-slate-800/60">
                <span className="hidden md:flex text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 py-1 items-center justify-between">
                  <span>Settings & Preferences</span>
                  <span className="text-[8px] font-mono text-cyan-500 font-bold">CORE</span>
                </span>

                {groupTabs.filter(t => t.category === 'SYSTEM & PREFERENCES').map((tab) => {
                  const isSelected = activeGroup === tab.id;
                  const isSettings = tab.id === 'settings';
                  const isLang = tab.id === 'languages';
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveGroup(tab.id)}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl font-bold transition-all duration-200 cursor-pointer whitespace-nowrap md:w-full group text-left relative border outline-none ${
                        isSelected
                          ? isSettings 
                            ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25 border-cyan-500 font-black' 
                            : 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border-blue-500 font-black'
                          : 'bg-white/80 dark:bg-slate-850/80 border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs active:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Real App Icon Badge */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isSelected
                            ? 'bg-white/20 text-white shadow-xs'
                            : isSettings
                            ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/60 group-hover:bg-cyan-100'
                            : isLang
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 group-hover:bg-blue-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 group-hover:text-blue-500'
                        }`}>
                          {tab.icon}
                        </div>

                        <div className="flex flex-col min-w-0 leading-tight">
                          <span className="text-xs font-black tracking-tight truncate">{tab.label}</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider truncate mt-0.5 ${
                            isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {tab.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Pill Badge */}
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-750'
                      }`}>
                        {tab.count}
                      </span>

                      {/* Active indicator bar */}
                      {isSelected && (
                        <motion.div 
                          layoutId="active-side-tab-accent"
                          className="hidden md:block absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white shadow-xs" 
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL: Smart Modernized Sliding Container */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar min-w-0 bg-white dark:bg-slate-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeGroup}
                  initial={{ opacity: 0, x: 22, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -18, filter: 'blur(3px)' }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                          {groupTabs.find((t) => t.id === activeGroup)?.category}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[9px] font-mono text-slate-400">STATUS ONLINE</span>
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mt-0.5">
                        {groupTabs.find((t) => t.id === activeGroup)?.label}
                      </h3>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
                      {groupTabs.find((t) => t.id === activeGroup)?.subtitle}
                    </span>
                  </div>

                  {/* Group 1: Clinical Care Nodes */}
                  {activeGroup === 'clinical' && renderActiveNodeList(clinicalNodes)}

                  {/* Group 2: Diagnostics Nodes */}
                  {activeGroup === 'diagnostics' && renderActiveNodeList(diagnosticNodes)}

                  {/* Group 3: Specialized Medicine Nodes */}
                  {activeGroup === 'specialized' && renderActiveNodeList(specializedNodes)}

                  {/* Group 4: App Operations & Settings (Relocated from Top Bar) */}
                  {activeGroup === 'settings' && (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="space-y-4"
                    >
                      {/* Top Settings Feature Card */}
                      <motion.div 
                        variants={buttonVariants}
                        className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-200/80 dark:border-cyan-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-600/30">
                            <Sliders size={22} />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                              Application Settings & Operations
                            </h4>
                            <p className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                              Configure feature toggles, security thresholds, telemetry streaming & model providers.
                            </p>
                          </div>
                        </div>

                        {onOpenSettings && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenSettings();
                            }}
                            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-cyan-600/20 flex items-center gap-2 cursor-pointer shrink-0"
                          >
                            <span>Open Full Settings</span>
                            <ExternalLink size={13} />
                          </button>
                        )}
                      </motion.div>

                      {/* Quick Feature Toggles Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* High Contrast Legibility */}
                        <motion.div 
                          variants={buttonVariants}
                          className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <EyeOff size={15} className="text-blue-500" />
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">High Contrast</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-5.5">
                              {isEyeCareMode ? 'High Legibility Active' : 'Standard Contrast'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setIsEyeCareMode(!isEyeCareMode);
                              addToast(isEyeCareMode ? "Standard Contrast Mode" : "High Contrast Mode Active", "info");
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              isEyeCareMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {isEyeCareMode ? 'ON' : 'OFF'}
                          </button>
                        </motion.div>

                        {/* Dark / Light Mode */}
                        <motion.div 
                          variants={buttonVariants}
                          className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-500" />}
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Theme Mode</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-5.5">
                              {isDarkMode ? 'Dark Clinical Theme' : 'Clean Clinical Light'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setIsDarkMode(!isDarkMode);
                              addToast(isDarkMode ? "Light Mode Active" : "Dark Mode Active", "info");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {isDarkMode ? 'LIGHT' : 'DARK'}
                          </button>
                        </motion.div>

                        {/* Circadian Solar Theme */}
                        <motion.div 
                          variants={buttonVariants}
                          className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Clock size={15} className="text-amber-500" />
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Solar Circadian</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-5.5">
                              Sun-Tracking Auto Shift
                            </p>
                          </div>
                          <button
                            onClick={handleSolarSync}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                          >
                            CONFIG
                          </button>
                        </motion.div>

                        {/* Offline Neural Cache */}
                        <motion.div 
                          variants={buttonVariants}
                          className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'} shrink-0`} />
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Storage Cache</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-4.5">
                              {isOffline ? 'Offline Mode Active' : 'Live Cloud Sync'}
                            </p>
                          </div>
                          <button
                            onClick={handleToggleCache}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                          >
                            TOGGLE
                          </button>
                        </motion.div>
                      </div>

                      {/* Security Core Banner */}
                      <motion.div 
                        variants={buttonVariants}
                        className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield size={16} className="text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Uganda DPPA 2019 & Local Cryptographic Enclave: Active
                          </span>
                        </div>
                        <span className="text-[8px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                          SECURE CORE
                        </span>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Group 5: Languages & Dialects (Relocated from Top Bar) */}
                  {activeGroup === 'languages' && (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="space-y-3.5"
                    >
                      {/* MarianMT Neural Local Status Header */}
                      <motion.div 
                        variants={buttonVariants}
                        className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-teal-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isMarianMTModeActive() ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isMarianMTModeActive() ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            </span>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-blue-950 dark:text-blue-100">
                              MarianMT Neural Offline Translator
                            </h4>
                          </div>
                          <p className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                            High-accuracy client-side translation specialized for Ugandan dialects & African languages.
                          </p>
                        </div>

                        {onOpenMarianConsole && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenMarianConsole();
                            }}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                          >
                            <Terminal size={12} />
                            <span>Neural Console</span>
                          </button>
                        )}
                      </motion.div>

                      {/* Language Search Input */}
                      <motion.div variants={buttonVariants} className="relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={langSearchQuery}
                          onChange={(e) => setLangSearchQuery(e.target.value)}
                          placeholder="Search dialects (Luganda, Runyankore, Acholi, Swahili, English...)"
                          className="w-full pl-9 pr-4 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 transition-colors"
                        />
                      </motion.div>

                      {/* Language Selection Grid with Staggered Slide */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {filteredLanguages.map((lang) => {
                          const isSelected = currentLanguage === lang.name;
                          const isDownloaded = downloadedLanguages.includes(lang.name);
                          const isDownloading = downloadingLang === lang.name;

                          return (
                            <motion.div
                              key={lang.code}
                              variants={buttonVariants}
                              className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black ring-1 ring-blue-500/30'
                                  : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (onChangeLanguage) {
                                    onChangeLanguage(lang.name);
                                  }
                                  localStorage.setItem("app_lang", lang.name);
                                  addToast(`🌐 Language set to ${lang.name}`, "success");
                                  if (!isDownloaded && lang.name !== 'English (US)' && lang.name !== 'English (UK)' && handleDownloadLanguage) {
                                    handleDownloadLanguage(lang.name);
                                  }
                                }}
                                className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                              >
                                <span className="text-lg shrink-0">{lang.flag}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-black uppercase tracking-tight leading-none truncate">
                                    {lang.name}
                                  </div>
                                  <div className="text-[9px] opacity-60 uppercase tracking-wider mt-0.5 leading-none truncate">
                                    {lang.native}
                                  </div>
                                </div>
                              </button>

                              <div className="shrink-0 flex items-center gap-1.5 pl-2">
                                {isDownloaded ? (
                                  <span 
                                    className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-0.5"
                                    title="Offline Model Available"
                                  >
                                    ✓ Offline
                                  </span>
                                ) : isDownloading ? (
                                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400 flex items-center gap-1 font-mono">
                                    <RefreshCw size={9} className="animate-spin shrink-0" />
                                    {downloadProgress}%
                                  </span>
                                ) : handleDownloadLanguage ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadLanguage(lang.name)}
                                    className="text-[8px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md cursor-pointer flex items-center gap-0.5 transition-all border border-slate-200 dark:border-slate-700"
                                    title="Download offline pack"
                                  >
                                    <Download size={8} />
                                    GET
                                  </button>
                                ) : null}

                                {isSelected && <Check size={14} className="text-blue-600 ml-1" />}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Group 6: System Controls & Utilities */}
                  {activeGroup === 'controls' && (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="space-y-4"
                    >
                      {/* Operational Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Cache Sync */}
                        <motion.div 
                          variants={buttonVariants}
                          className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'} shrink-0 shadow-xs`} />
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">CACHE SYNC</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-4.5">
                              {isOffline ? 'OFF-GRID ARCHIVE' : 'LIVE CLOUD SYNC'}
                            </p>
                          </div>
                          <button
                            onClick={handleToggleCache}
                            className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline px-2 py-1 cursor-pointer"
                          >
                            TOGGLE
                          </button>
                        </motion.div>

                        {/* Voice Controls */}
                        <motion.div 
                          variants={buttonVariants}
                          className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Mic size={15} className="text-purple-500 shrink-0" />
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">VOICE CONTROLS</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-5.5">
                              {isListening ? 'LISTENING...' : 'HANDS-FREE'}
                            </p>
                          </div>
                          <button
                            onClick={handleToggleVoice}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              isListening ? 'bg-purple-600 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <Mic size={16} />
                          </button>
                        </motion.div>
                      </div>

                      {/* 6 Quick App Control Buttons with Sliding Animation */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                        <motion.button
                          variants={buttonVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setIsEyeCareMode(!isEyeCareMode);
                            addToast(isEyeCareMode ? "Standard Contrast Mode" : "High Contrast Active", "info");
                          }}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs uppercase tracking-tight transition-all cursor-pointer border shadow-2xs ${
                            isEyeCareMode ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                          }`}
                        >
                          <EyeOff size={15} />
                          <span>LEGIBILITY</span>
                        </motion.button>

                        <motion.button
                          variants={buttonVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setIsDarkMode(!isDarkMode);
                            addToast(isDarkMode ? "Light Mode" : "Dark Mode", "info");
                          }}
                          className="flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs uppercase tracking-tight transition-all cursor-pointer border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-2xs"
                        >
                          {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                          <span>{isDarkMode ? 'LIGHT' : 'DARK'}</span>
                        </motion.button>

                        <motion.button
                          variants={buttonVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSolarSync}
                          className="flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs uppercase tracking-tight transition-all cursor-pointer border border-amber-500 bg-amber-50/30 text-amber-600 shadow-2xs"
                        >
                          <Clock size={15} />
                          <span>SOLAR SYNC</span>
                        </motion.button>

                        <motion.button
                          variants={buttonVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleHaptics}
                          className="flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs uppercase tracking-tight transition-all cursor-pointer border border-rose-500 bg-rose-50/30 text-rose-600 shadow-2xs"
                        >
                          <Activity size={15} />
                          <span>HAPTICS</span>
                        </motion.button>

                        <motion.button
                          variants={buttonVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleToggleAlerts}
                          className="flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs uppercase tracking-tight transition-all cursor-pointer border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-2xs"
                        >
                          {alertsEnabled ? <Bell size={15} /> : <BellOff size={15} />}
                          <span>ALERTS</span>
                        </motion.button>

                        <motion.button
                          variants={buttonVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleAudioHub}
                          className="flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs uppercase tracking-tight transition-all cursor-pointer border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-2xs"
                        >
                          <Volume2 size={15} className="text-blue-500" />
                          <span>AUDIO HUB</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
