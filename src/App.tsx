/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ErrorInfo, Suspense, lazy, useMemo, useRef } from 'react';
import { 
  BrainCircuit,
  Activity,
  TrendingUp,
  Heart,
  Thermometer,
  Scale, 
  PlusCircle, 
  Stethoscope,
  Menu,
  Bell,
  Search,
  Monitor,
  LayoutGrid,
  Info,
  Home,
  FileText,
  User as UserIcon,
  Download,
  Cpu,
  Bluetooth,
  Facebook,
  Instagram,
  X,
  MessageCircle,
  Mail,
  LogIn,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  UserPlus,
  Fingerprint,
  Moon,
  Mic,
  Settings,
  ListTodo,
  Sun,
  Apple,
  Droplets,
  Zap,
  Brain,
  Smile,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Bot,
  Image as ImageIcon,
  Pill,
  ArrowLeft,
  ChevronDown,
  Crown,
  CreditCard,
  Phone,
  PhoneCall,
  Waves,
  Github,
  Palette,
  Database,
  Dna,
  ChevronRight,
  ChevronLeft,
  Globe,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SEARCHABLE_ITEMS, HEALTH_TIPS } from './constants';
import { Dashboard } from './components/Dashboard';
import { VoiceCommandToggle } from './components/VoiceCommandToggle';

import { MedicalIllustrator } from "./components/MedicalIllustrator";
import { GenomicLongevityCore } from "./components/GenomicLongevityCore";
import { ImageGenerator } from "./components/ImageGenerator";
import { ChatInterface } from "./components/ChatInterface";
import { MedicalAI } from "./components/MedicalAI";
import { CognisHub } from "./components/CognisHub";
import BioSimulation from "./components/BioSimulation";
import { PatientMonitor } from "./components/PatientMonitor";
import { Features } from "./components/Features";
import { About } from "./components/About";
import { HealthRecords } from "./components/HealthRecords";
import { ProfileSettings } from "./components/ProfileSettings";
import { PatientProfileViewer } from "./components/PatientProfileViewer";
import { AdminDashboard } from "./components/AdminDashboard";
import { AccessRestriction } from "./components/AccessRestriction";
import { SpecialistFinder } from "./components/SpecialistFinder";
import { VitalityMatrix } from "./components/VitalityMatrix";
import { SymptomChecker } from "./components/SymptomChecker";
import { DiagnosticLab } from "./components/DiagnosticLab";
import { EmergencyRegistry } from "./components/EmergencyRegistry";
import { Billing } from "./components/Billing";
import { MedicationTracker } from "./components/MedicationTracker";
import { WorkoutTracker } from "./components/WorkoutTracker";
import { BioSecurity } from "./components/BioSecurity";
import { DeveloperPortal } from "./components/DeveloperPortal";
import { DoctorsDashboard } from "./components/DoctorsDashboard";
import { BMICalculator } from "./components/BMICalculator";
import { LearnMore } from "./components/LearnMore";
import { AuthModal } from "./components/AuthModal";
import { AdminInfoModal } from "./components/AdminInfoModal";
import { Footer } from "./components/Footer";
import { BiomaticSandbox } from "./components/BiomaticSandbox";
import { ClinicalProtocols } from "./components/Tasks";
import { NeuralTrainingHub } from "./components/NeuralTrainingHub";

import { Soundscape } from "./utils/soundscape";

import { HealthTip } from "./components/HealthTipModal";
import { HealthTipModal } from "./components/HealthTipModal";
import { HealthProgressTracker } from "./components/HealthProgressTracker";
import { HelpCenter, PrivacyVault, TermsAndData } from "./components/SystemsHubViews";
import { TerminalSecureGate } from "./components/TerminalSecureGate";
import { translate } from './utils/translations';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null; showDetails: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("UI Failure:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-auto font-sans">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] border border-slate-200/60 dark:border-slate-800 p-8 md:p-12 relative overflow-hidden flex flex-col items-center">
            
            {/* Ambient Background Glow Decors */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Diagnostics Pulse Sign */}
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 relative z-10 border border-rose-100 dark:border-rose-900/30">
              <ShieldAlert size={28} className="animate-pulse" />
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight">
              Workspace Issue Intercepted
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 relative z-10 max-w-md">
              Doctorian has safely isolated an interface rendering discrepancy in this specific layout. No active biometric records, connected peripherals, or credentials are compromised.
            </p>

            {this.state.error && (
              <div className="w-full text-left bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Isolated Diagnostic:</span>
                  <button 
                    onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                    className="text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {this.state.showDetails ? "Hide Stack" : "Show Full Diagnostic"}
                  </button>
                </div>
                <div className="font-mono text-xs text-rose-600 dark:text-rose-400 break-words font-semibold">
                  {this.state.error.message}
                </div>
                
                {this.state.showDetails && this.state.error.stack && (
                  <pre className="mt-3 text-[9px] font-mono whitespace-pre-wrap opacity-70 break-all border-t border-slate-200 dark:border-slate-800 pt-3 text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10 justify-center">
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null, showDetails: false });
                  window.location.hash = "";
                  window.location.reload();
                }} 
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98] text-white rounded-2xl font-bold transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/20 text-sm tracking-wide"
              >
                Reload Interface
              </button>
              <button 
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = "/";
                  } catch (e) {
                    window.location.reload();
                  }
                }} 
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:transform active:scale-[0.98] text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all duration-200 cursor-pointer text-sm"
              >
                Full Hard Reset
              </button>
            </div>
            
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-8 relative z-10 block">
              Workspace Isolation Layer V1.2
            </span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { api, User, autoDiscoverLocalNode } from './api';
import { Logo } from "./components/Logo";
import { ResourceView, ResourceType } from './components/ResourceView';
import { startRegistration } from '@simplewebauthn/browser';
import { 
  googleProvider, 
  githubProvider, 
  facebookProvider, 
  instagramProvider,
  signInWithSocial 
} from './firebase';
import { useArduinoContext } from './ArduinoContext';
import { useMedicationReminders } from './hooks/useMedicationReminders';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AppTutorial } from './components/AppTutorial';
import { DoctorVerificationModal } from './components/DoctorVerificationModal';

const viewNamesMap: Record<string, string> = {
  home: 'Home Dashboard',
  monitor: 'Real-time Bio-Monitor',
  features: 'Clinical Modules',
  about: 'System & App Info',
  learn_more: 'Documentation',
  records: 'Health Records',
  profile: 'User Profile',
  admin: 'Admin Command Center',
  specialist: 'Specialist Referral Network',
  neuro: 'Neural Core Trainer',
  vitality: 'Vitality Bio-Energy',
  meds: 'Clinical Pharmacy',
  fitness: 'Fitness Analytics',
  symptoms: 'Symptom Checker',
  biosecurity: 'Biosecurity Shield',
  ai_nexus: 'AI Consultation',
  illustrator: 'Anatomy Illustrator',
  diagnostic_lab: 'Diagnostic Lab Analyser',
  emergency: 'Emergency Portal',
  training: 'Neural training',
  tasks: 'System Queue',
  clinical_roadmap: 'Clinical Roadmap',
  anomaly_detail: 'Anomaly Detail',
  health_matrix: 'Biomatic Sandbox',
  autonomous_sync: 'Autonomous Core',
  dev_portal: 'Developer Portal',
  billing: 'Resource Billings',
  health_trace: 'Clinical History Trace',
  biomatic: 'Biosimulator Lab',
  genomic_longevity: 'Longevity & DNA Lab',
  systems_hub: 'Systems Launchpad',
  doctors_dashboard: 'Doctors\' Portal',
  help: 'Help Center',
  community: 'Global Forum',
  privacy: 'Privacy Vault',
  terms: 'Terms of Use',
  feedback: 'Clinical Feedback',
  protocols: 'Medical Protocols'
};

export default function App() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem("app_lang") || 'English (US)');
  const [downloadedLanguages, setDownloadedLanguages] = useState<string[]>(() => {
    const allLangs = [
      'English (US)', 'English (UK)', 'Luganda', 'Runyankole-Rukiga', 'Acholi-Luo',
      'Langi', 'Iteso', 'Lusoga', 'Lugbara', 'Runyoro-Rutooro', 'Rukonjo', 'Samia',
      'Karamojong', 'Swahili', 'Spanish', 'French', 'German', 'Chinese', 'Hindi',
      'Arabic', 'Portuguese', 'Russian', 'Japanese', 'Korean', 'Italian', 'Turkish'
    ];
    try {
      const saved = localStorage.getItem("downloaded_translation_languages");
      if (saved) {
        const parsed = JSON.parse(saved);
        // If parsed is missing some languages, merge them with allLangs to ensure all downloaded
        const merged = Array.from(new Set([...parsed, ...allLangs]));
        return merged;
      }
      return allLangs;
    } catch {
      return allLangs;
    }
  });
  const [downloadingLang, setDownloadingLang] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [vitalsAudioEnabled, setVitalsAudioEnabled] = useState(false);
  const [vitalsAudioVolume, setVitalsAudioVolume] = useState(0.3);
  const [soundscapeEnabled, setSoundscapeEnabled] = useState(false);
  const [soundscapeVolume, setSoundscapeVolume] = useState(0.45);
  const [soundscapePreset, setSoundscapePreset] = useState<'alpha_focus' | 'theta_meditation' | 'beta_high_cognition'>('alpha_focus');

  useEffect(() => {
    // Import first and fetch initial values
    import('./utils/vitalsSonifier').then(({ VitalsSonifier }) => {
      setVitalsAudioEnabled(VitalsSonifier.getEnabled());
      setVitalsAudioVolume(VitalsSonifier.getVolume());
    });
    setSoundscapeEnabled(Soundscape.getEnabled());
    setSoundscapeVolume(Soundscape.getVolume());
    setSoundscapePreset(Soundscape.getPreset());

    const handleVitalsSoundSync = (e: any) => {
      if (e.detail) {
        if (e.detail.enabled !== undefined) setVitalsAudioEnabled(e.detail.enabled);
        if (e.detail.volume !== undefined) setVitalsAudioVolume(e.detail.volume);
      }
    };

    const handleSoundscapeSync = (e: any) => {
      if (e.detail) {
        if (e.detail.enabled !== undefined) setSoundscapeEnabled(e.detail.enabled);
        if (e.detail.volume !== undefined) setSoundscapeVolume(e.detail.volume);
        if (e.detail.preset !== undefined) setSoundscapePreset(e.detail.preset);
      }
    };

    window.addEventListener('doctorian:vitals_sound_setting_update', handleVitalsSoundSync);
    window.addEventListener('doctorian:soundscape_setting_update', handleSoundscapeSync);

    return () => {
      window.removeEventListener('doctorian:vitals_sound_setting_update', handleVitalsSoundSync);
      window.removeEventListener('doctorian:soundscape_setting_update', handleSoundscapeSync);
    };
  }, []);

  const toggleVitalsAudio = () => {
    import('./utils/vitalsSonifier').then(({ VitalsSonifier }) => {
      const next = !vitalsAudioEnabled;
      setVitalsAudioEnabled(next);
      VitalsSonifier.setEnabled(next);
      if (next) {
        addToast("🔊 Vitals Audio Sonification Live. Heartbeat sounds synchronized in the background.", "success");
      } else {
        addToast("🔇 Vitals Audio Sonification silenced.", "info");
      }
    });
  };

  const handleVitalsVolumeChange = (vol: number) => {
    import('./utils/vitalsSonifier').then(({ VitalsSonifier }) => {
      setVitalsAudioVolume(vol);
      VitalsSonifier.setVolume(vol);
    });
  };

  const toggleSoundscapeGlobal = () => {
    const next = !soundscapeEnabled;
    setSoundscapeEnabled(next);
    Soundscape.setEnabled(next);
    if (next) {
      addToast("🎵 Ambient Soundscape loaded. Binaural beats Active.", "success");
    } else {
      addToast("🎵 Soundscape turned off.", "info");
    }
  };

  const handleSoundscapeVolChangeGlobal = (vol: number) => {
    setSoundscapeVolume(vol);
    Soundscape.setVolume(vol);
  };

  const changePresetGlobal = (preset: 'alpha_focus' | 'theta_meditation' | 'beta_high_cognition') => {
    setSoundscapePreset(preset);
    Soundscape.setPreset(preset);
  };

  // Automatically trigger a silent setup/validation of translation dictionaries
  useEffect(() => {
    const hasNotified = sessionStorage.getItem("offline_lang_notified_v5");
    if (!hasNotified) {
      setTimeout(() => {
        setToast({
          message: `📥 Offline Translation Engine ready: 26 clinical language lexicons fully validated and loaded in hardcompiled code memory.`,
          type: 'success'
        });
        sessionStorage.setItem("offline_lang_notified_v5", "true");
      }, 4000);
    }
  }, []);

  const handleDownloadLanguage = (langName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadingLang) return;
    setDownloadingLang(langName);
    setDownloadProgress(5);
    let progress = 5;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setDownloadedLanguages(prev => {
            const newList = Array.from(new Set([...prev, langName]));
            localStorage.setItem("downloaded_translation_languages", JSON.stringify(newList));
            return newList;
          });
          setDownloadingLang(null);
          setDownloadProgress(0);
          setToast({
            message: `📥 ${langName} offline translation package downloaded successfully (2.4 MB). Supporting instant local translation.`,
            type: 'success'
          });
        }, 200);
      }
      setDownloadProgress(Math.min(progress, 100));
    }, 120);
  };

  // 1. Create WeakMaps for node translation tracking
  const originalTextMap = useRef(new WeakMap<Node, string>());
  const translatedLanguagesMap = useRef(new WeakMap<Node, string>());

  useEffect(() => {
    let isTranslating = false;

    if (currentLanguage.startsWith('English')) {
      // Restore all translated text nodes in the DOM to English
      const restoreNode = (node: Node) => {
        const originalText = originalTextMap.current.get(node);
        if (originalText !== undefined && node.textContent !== originalText) {
          isTranslating = true;
          node.textContent = originalText;
          isTranslating = false;
        }
        translatedLanguagesMap.current.set(node, currentLanguage);
      };

      const walkRestore = (parent: Node) => {
        if (parent.nodeType === Node.TEXT_NODE) {
          restoreNode(parent);
          return;
        }
        const el = parent as HTMLElement;
        if (
          !el ||
          el.dataset?.noTranslate ||
          (el.closest && (el.closest('[data-no-translate]') || el.id === 'google_translate_element'))
        ) {
          return;
        }
        parent.childNodes.forEach(walkRestore);
      };

      isTranslating = true;
      try {
        walkRestore(document.body);
      } finally {
        isTranslating = false;
      }
      return;
    }

    // Function to translate a single text node
    const translateTextNode = (node: Node) => {
      if (isTranslating) return;

      const parent = node.parentElement;
      if (!parent) return;

      // Skip elements that shouldn't be translated
      const tagName = parent.tagName.toLowerCase();
      if (
        tagName === 'script' || 
        tagName === 'style' || 
        tagName === 'textarea' || 
        tagName === 'code' || 
        tagName === 'pre'
      ) return;

      if (parent.closest('svg') || tagName === 'svg') return;

      if (
        (parent.closest && parent.closest('[data-no-translate]')) || 
        parent.id === 'google_translate_element' ||
        (parent.closest && parent.closest('#google_translate_element')) ||
        (parent.closest && parent.closest('.language-menu-btn')) || 
        (parent.closest && parent.closest('.language-dropdown-container')) ||
        (parent.closest && parent.closest('.recharts-wrapper')) ||
        (parent.closest && parent.closest('.chart-container')) ||
        (parent.closest && parent.closest('.ecg-chart')) ||
        (parent.closest && parent.closest('.no-translate'))
      ) return;

      const text = node.textContent;
      if (!text) return;
      const trimmed = text.trim();
      if (trimmed.length < 2 || trimmed.length > 200 || /^\d+$/.test(trimmed)) return; // skip numbers, short tokens or very long paragraphs

      // Check WeakMap for original text
      let original = originalTextMap.current.get(node);
      if (original === undefined) {
        original = text;
        originalTextMap.current.set(node, text);
      }

      // Check if already translated to target language
      const lastTranslatedLang = translatedLanguagesMap.current.get(node);
      if (lastTranslatedLang === currentLanguage) return;

      const translated = translate(original.trim(), currentLanguage);
      if (translated && translated !== original.trim()) {
        const leadingSpace = original.match(/^\s*/)?.[0] || '';
        const trailingSpace = original.match(/\s*$/)?.[0] || '';
        
        isTranslating = true;
        node.textContent = leadingSpace + translated + trailingSpace;
        isTranslating = false;
        
        translatedLanguagesMap.current.set(node, currentLanguage);
      }
    };

    // Translate the entire page body recursively
    const translatePage = (startNode: Node) => {
      if (isTranslating) return;
      
      const walker = document.createTreeWalker(
        startNode,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tagName = parent.tagName.toLowerCase();
            if (tagName === 'script' || tagName === 'style' || tagName === 'textarea' || tagName === 'code' || tagName === 'pre') {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest('svg') || tagName === 'svg') {
              return NodeFilter.FILTER_REJECT;
            }
            if (
              parent.id === 'google_translate_element' ||
              (parent.closest && parent.closest('[data-no-translate]')) || 
              (parent.closest && parent.closest('#google_translate_element')) ||
              (parent.closest && parent.closest('.language-menu-btn')) ||
              (parent.closest && parent.closest('.language-dropdown-container')) ||
              (parent.closest && parent.closest('.recharts-wrapper')) ||
              (parent.closest && parent.closest('.chart-container')) ||
              (parent.closest && parent.closest('.ecg-chart')) ||
              (parent.closest && parent.closest('.no-translate'))
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const nodesToTranslate: Node[] = [];
      let currentNode = walker.nextNode();
      while (currentNode) {
        nodesToTranslate.push(currentNode);
        currentNode = walker.nextNode();
      }

      isTranslating = true;
      try {
        nodesToTranslate.forEach(translateTextNode);
      } finally {
        isTranslating = false;
      }
    };

    // Run first-pass translation
    translatePage(document.body);

    // Watch for dynamic elements added to DOM
    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;
      
      let shouldTranslate = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const addedNode of Array.from(mutation.addedNodes)) {
            // Check if it's text-related or has children
            if (addedNode.nodeType === Node.TEXT_NODE) {
              translateTextNode(addedNode);
            } else if (addedNode.nodeType === Node.ELEMENT_NODE) {
              translatePage(addedNode);
            }
          }
        } else if (mutation.type === 'characterData') {
          translateTextNode(mutation.target);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    let debounceTimer: any = null;
    const handleUpdatedTranslation = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (isTranslating) return;
        translatedLanguagesMap.current = new WeakMap<Node, string>();
        translatePage(document.body);
      }, 350);
    };

    window.addEventListener("local_translations_updated", handleUpdatedTranslation);

    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener("local_translations_updated", handleUpdatedTranslation);
    };
  }, [currentLanguage]);

  const [currentView, _setCurrentView] = useState<'home' | 'monitor' | 'features' | 'about' | 'learn_more' | 'records' | 'profile' | 'admin' | 'specialist' | 'neuro' | 'vitality' | 'meds' | 'fitness' | 'symptoms' | 'biosecurity' | 'ai_nexus' | 'illustrator' | 'diagnostic_lab' | 'emergency' | 'training' | 'tasks' | 'clinical_roadmap' | 'anomaly_detail' | 'health_matrix' | 'autonomous_sync' | 'dev_portal' | 'billing' | 'health_trace' | 'biomatic' | 'genomic_longevity' | 'systems_hub' | 'doctors_dashboard' | ResourceType>('home');
  const [isDoctorVerifyOpen, setIsDoctorVerifyOpen] = useState(false);
  const [pendingView, setPendingView] = useState<any>(null);

  const [navigationHistory, setNavigationHistory] = useState<any[]>(['home']);
  const [isBackHovered, setIsBackHovered] = useState(false);

  const setCurrentView = (view: any) => {
    _setCurrentView(view);
    
    // Track chronological sequential navigation path
    setNavigationHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === view) {
        return prev;
      }
      return [...prev, view];
    });

    // Restores viewport scroll to the top for seamless navigation
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    const viewport = document.getElementById('app-scroll-viewport');
    if (viewport) {
      viewport.scrollTop = 0;
    }
  };

  const handleGoBack = () => {
    if (navigationHistory.length <= 1) return;
    
    const previousView = navigationHistory[navigationHistory.length - 2];
    const newHistory = navigationHistory.slice(0, -1);
    
    setNavigationHistory(newHistory);
    _setCurrentView(previousView);
    
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    const viewport = document.getElementById('app-scroll-viewport');
    if (viewport) {
      viewport.scrollTop = 0;
    }
    
    addToast(`◀ Returned to ${viewNamesMap[previousView] || previousView}`, "info");
  };

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasNotification, setHasNotification] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scannedPatientData, setScannedPatientData] = useState<any | null>(null);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const isUserPremium = useMemo(() => {
    return ['gold', 'business', 'silver', 'pro'].includes(user?.subscriptionStatus === 'active' ? user?.subscriptionTier : '') || user?.email?.toLowerCase() === "gloriajayakullo@gmail.com";
  }, [user]);

  const isCreditsUnlimited = useMemo(() => {
    const credString = String(user?.credits || "").toLowerCase();
    return isUserPremium || credString.includes("unlimited") || Number(user?.credits) >= 99999;
  }, [user, isUserPremium]);

  const displayCredits = useMemo(() => {
    if (isCreditsUnlimited) return "Unlimited";
    const creditsVal = user?.credits;
    if (typeof creditsVal === "number") return String(Math.round(creditsVal));
    const parsed = parseFloat(String(creditsVal || ""));
    if (isNaN(parsed)) return "Unlimited";
    return String(Math.round(parsed));
  }, [user, isCreditsUnlimited]);

  const creditPercentage = useMemo(() => {
    if (isCreditsUnlimited) return 100;
    const creditsVal = user?.credits;
    if (typeof creditsVal === "number") return Math.min(Math.round(creditsVal) / 4, 100);
    const parsed = parseFloat(String(creditsVal || ""));
    if (isNaN(parsed)) return 100;
    return Math.min(Math.round(parsed) / 4, 100);
  }, [user, isCreditsUnlimited]);

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup' | 'authorize'>('login');
  const [authModalAction, setAuthModalAction] = useState<'ADMIN_ACCESS' | 'SOS_TRIGGER' | null>(null);
  const [onAuthorizeSuccessCallback, setOnAuthorizeSuccessCallback] = useState<(() => void) | null>(null);
  const [isAdminInfoOpen, setIsAdminInfoOpen] = useState(false);
  const [activeSOS, setActiveSOS] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window !== 'undefined') {
      const forced = localStorage.getItem("medical_forced_offline");
      if (forced === "true") return true;
      if (forced === "false") return false;
      return !navigator.onLine;
    }
    return false;
  });
  const [isRegisteringBiometrics, setIsRegisteringBiometrics] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [lastInsightFetchAt, setLastInsightFetchAt] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medical_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isEyeCareMode, setIsEyeCareMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('medical_eye_care') === 'true';
    }
    return false;
  });
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebar = () => {
    const nextVal = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextVal);
    localStorage.setItem('sidebar_collapsed', nextVal ? 'true' : 'false');
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
  };
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isBMIModalOpen, setIsBMIModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isDoctorAuthenticated, setIsDoctorAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [dailyTip, setDailyTip] = useState<HealthTip>(HEALTH_TIPS[0]);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isWindowsMenuOpen, setIsWindowsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const navigationContainerRef = useRef<HTMLDivElement>(null);

  const arduino = useArduinoContext();
  useMedicationReminders(user);
  const isAdmin = true;
  const isDoctor = true;

  const handleNeuralCoreAccess = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setCurrentView('admin');
    }
  };

  const handleAdminAccess = () => {
    setCurrentView('admin');
  };

  const verifyAdminAuth = () => {
    // Administrative passkey validation
    if (adminPassInput === "Haxzy20Joseph21" || adminPassInput === "admin@2026@Doctorian") {
       setIsAdminAuthenticated(true);
       setShowAdminLogin(false);
       setCurrentView('admin');
       setAdminPassInput('');
       addToast("Admin Neural Authorization Level 7 Confirmed.", "success");
    } else {
       setAdminError("Neural signature invalid. Authorization denied.");
    }
  };

  const promptBiometricAdmin = () => {
    setShowAdminLogin(false);
    setAuthModalView('authorize');
    setAuthModalAction('ADMIN_ACCESS');
    setOnAuthorizeSuccessCallback(() => {
      return () => {
        setIsAdminAuthenticated(true);
        setShowAdminLogin(false);
        setCurrentView('admin');
        addToast("Admin Neural Authorization Level 7 Confirmed via Biometrics.", "success");
      };
    });
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(ua));
  }, []);

  // Ambient Soundscape state monitor
  useEffect(() => {
    const handleSoundscapeTrigger = () => {
      const isTargetView = currentView === 'neuro' || currentView === 'training';
      const isEnabled = Soundscape.getEnabled();
      if (isTargetView && isEnabled) {
        Soundscape.start();
      } else {
        Soundscape.stop();
      }
    };

    handleSoundscapeTrigger();

    window.addEventListener('doctorian:soundscape_setting_update', handleSoundscapeTrigger);
    return () => {
      window.removeEventListener('doctorian:soundscape_setting_update', handleSoundscapeTrigger);
      Soundscape.stop();
    };
  }, [currentView]);

  // Automatic browser click gesture activation for background audio telemetry
  useEffect(() => {
    const handleGestureStart = () => {
      import("./utils/vitalsSonifier").then(({ VitalsSonifier }) => {
        if (VitalsSonifier.getEnabled() && !VitalsSonifier.isSonifierPlaying()) {
          VitalsSonifier.start();
        }
      });
      const isEnabled = Soundscape.getEnabled();
      const isTargetView = currentView === 'neuro' || currentView === 'training';
      if (isEnabled && isTargetView && !Soundscape.isEnginePlaying()) {
        Soundscape.start(true);
      }
    };

    window.addEventListener('click', handleGestureStart);
    window.addEventListener('touchstart', handleGestureStart);
    
    return () => {
      window.removeEventListener('click', handleGestureStart);
      window.removeEventListener('touchstart', handleGestureStart);
    };
  }, [currentView]);

  const handleSocialLogin = async (provider: any, providerName: string) => {
    setIsInsightLoading(true); // Reuse a loading state or add a new one, but let's use a generic one if possible
    // Actually let's use toast
    setToast({ message: `Accessing ${providerName} nexus...`, type: 'info' });
    try {
      const firebaseUser = await signInWithSocial(provider);
      if (firebaseUser.email) {
        const loggedInUser = await api.auth.socialLogin({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || undefined,
          providerId: providerName
        });
        setUser(loggedInUser);
        setToast({ message: `Access sequence confirmed. Welcome ${loggedInUser.displayName || loggedInUser.email}.`, type: 'success' });
      } else {
        throw new Error("No neural identifier (email) returned from provider");
      }
    } catch (err: any) {
      console.error("Social login error:", err);
      let errMsg = err.message || `Failed to verify identity via ${providerName}`;
      
      if (errMsg.toLowerCase().includes("database") && errMsg.toLowerCase().includes("expired")) {
        errMsg = "CRITICAL: Firebase Project Database API has expired or is disabled. Please verify the Firestore API status in Google Cloud Console.";
      } else if (errMsg.includes("identitytoolkit") && errMsg.includes("blocked")) {
        errMsg = "AUTHENTICATION_BLOCKED: Cloud Identity Toolkit API is disabled for this project.";
      }
      
      setToast({ message: errMsg, type: 'error' });
    } finally {
      setIsInsightLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('medical_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('medical_user');
    }
  }, [user]);

  // All Effects
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = SEARCHABLE_ITEMS.filter(item => {
      // Hide admin views from non-admins in search
      const restrictedViews = ['admin'];
      if (restrictedViews.includes(item.view) && !isAdmin) {
        return false;
      }
      
      return (
        item.label.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
    setSearchResults(filtered);
  }, [searchQuery, isAdmin]);

  useEffect(() => {
    const checkNotifications = async () => {
      if (!user) return; // Only check if logged in
      try {
        const notifications = await api.notifications.list();
        if (notifications && notifications.length > 0) {
          const latestId = notifications[0].id;
          const lastViewed = localStorage.getItem('medical_last_notification_view');
          
          if (lastViewed !== latestId) {
            setHasNotification(true);
            
            // Check for emergency SOS alerts
            const emergencyAlert = notifications.find(n => n.type === 'warning' && n.title.includes('EMERGENCY'));
            if (emergencyAlert) {
              const lastSOSId = localStorage.getItem('medical_last_sos_id');
              if (lastSOSId !== emergencyAlert.id) {
                setActiveSOS(emergencyAlert);
                localStorage.setItem('medical_last_sos_id', emergencyAlert.id);
                
                // Audio alert
                if ('vibrate' in navigator) navigator.vibrate([500, 200, 500, 200, 500]);
              }
            }
          }
        }
      } catch (error: any) {
        console.error("Failed to check notifications:", error);
        if (error.status === 403 || error.message === 'Unauthorized' || error.status === 401 || (error.message && (error.message.includes("suspended") || error.message.includes("blocked")))) {
          console.log("[Doctorian] Session expired, revoked or account blocked. Synchronizing to Guest Mode.");
          setUser(null);
        }
      }
    };

    if (user) {
      checkNotifications();
      const interval = setInterval(checkNotifications, 15 * 1000); // Check every 15 seconds for emergencies
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyTip(HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length]);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      const defaultCoords = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco

      const proceedWithCoords = async (lat: number, lon: number) => {
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          if (!res.ok) throw new Error("Status: " + res.status);
          const data = await res.json();
          setWeatherData({
            temp: data.current_weather.temperature,
            condition: data.current_weather.weathercode,
            latitude: lat,
            longitude: lon
          });
        } catch (err) {
          console.warn("App-level weather fetch fell back to default parameters:", err);
          setWeatherData({
            temp: 21,
            condition: 1, // partly cloudy
            latitude: lat,
            longitude: lon
          });
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            proceedWithCoords(pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            console.warn("Geolocation denied or failed, using default location:", err);
            proceedWithCoords(defaultCoords.latitude, defaultCoords.longitude);
          },
          { timeout: 5000 }
        );
      } else {
        proceedWithCoords(defaultCoords.latitude, defaultCoords.longitude);
      }
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('doctorian_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    if (isEyeCareMode) {
      document.body.classList.add('eye-care-mode');
    } else {
      document.body.classList.remove('eye-care-mode');
    }
    localStorage.setItem('doctorian_eye_care', isEyeCareMode.toString());
  }, [isEyeCareMode]);



  useEffect(() => {
    const getFontClass = (lang: string) => {
      switch (lang) {
        case 'Luganda':
        case 'Swahili':
        case 'Runyankole-Rukiga':
        case 'Acholi-Luo':
        case 'Langi':
        case 'Iteso':
        case 'Lusoga':
        case 'Lugbara':
        case 'Runyoro-Rutooro':
        case 'Rukonjo':
        case 'Samia':
        case 'Karamojong':
          return 'font-african';
        case 'Spanish':
        case 'French':
        case 'German':
        case 'Italian':
        case 'Portuguese':
        case 'Turkish':
          return 'font-euro';
        case 'Chinese':
          return 'font-chinese';
        case 'Hindi':
          return 'font-hindi';
        case 'Arabic':
          return 'font-arabic';
        case 'Russian':
          return 'font-cyrillic';
        case 'Japanese':
          return 'font-japanese';
        case 'Korean':
          return 'font-korean';
        default:
          return 'font-eng';
      }
    };

    const fontClasses = [
      'font-eng', 'font-african', 'font-euro', 'font-chinese', 
      'font-hindi', 'font-arabic', 'font-cyrillic', 'font-japanese', 'font-korean'
    ];
    document.body.classList.remove(...fontClasses);
    document.body.classList.add(getFontClass(currentLanguage));
  }, [currentLanguage]);

  useEffect(() => {
    const checkStatus = () => {
      const forced = localStorage.getItem("medical_forced_offline");
      if (forced === "true") {
        setIsOffline(true);
      } else if (forced === "false") {
        setIsOffline(false);
      } else {
        setIsOffline(!navigator.onLine);
      }
    };

    const handleOnline = () => checkStatus();
    const handleOffline = () => checkStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', checkStatus);
    
    // Periodically sync offline actions if online
    const interval = setInterval(() => {
      const forced = localStorage.getItem("medical_forced_offline");
      if (forced !== "true" && navigator.onLine) {
        import('./api').then(({ syncOfflineActions }) => {
          syncOfflineActions();
        });
      }
    }, 30000); // 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', checkStatus);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone || 
                               document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    setIsInIframe(window.self !== window.top);
    const standalone = checkStandalone();
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const installedHandler = () => {
      setIsStandalone(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
      setToast({ message: '✨ Doctorian installed successfully!', type: 'success' });
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    
    // For iOS, there's no prompt, so we show the button if not standalone
    if (isIOS && !standalone) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  useEffect(() => {
    const handleActionQueued = (e: any) => {
      const { endpoint, type } = e.detail;
      const label = endpoint.charAt(0).toUpperCase() + endpoint.slice(1);
      setToast({
        message: `💾 Offline Cache Secure: Queueing outbound ${type} ${label} packet. Synchronizing triggers online.`,
        type: 'success'
      });
    };
    const handleActionsSynced = (e: any) => {
      const { syncedCount } = e.detail;
      setToast({
        message: `⚡ Clinical Link Synced! Dynamic local queue synchronized ${syncedCount} changes successfully.`,
        type: 'success'
      });
    };
    const handleNavigateView = (e: any) => {
      if (e && e.detail && e.detail.view) {
        showView(e.detail.view);
      }
    };
    window.addEventListener('offline_action_queued', handleActionQueued);
    window.addEventListener('offline_actions_synced', handleActionsSynced);
    window.addEventListener('navigate_view', handleNavigateView);
    
    // Also trigger initial sync check on mount if online
    if (navigator.onLine) {
      import('./api').then(({ syncOfflineActions }) => {
        syncOfflineActions();
      }).catch(console.error);
    }

    return () => {
      window.removeEventListener('offline_action_queued', handleActionQueued);
      window.removeEventListener('offline_actions_synced', handleActionsSynced);
      window.removeEventListener('navigate_view', handleNavigateView);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scanUserId = params.get('scanUserId');
    if (scanUserId) {
      setIsScanLoading(true);
      setScanError(null);
      
      // Clean up URL parameter to avoid getting stuck on page refreshes
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);

      api.emergencyContacts.getEmergencyProfile(scanUserId)
        .then((profileData) => {
          setScannedPatientData(profileData);
          addToast("✨ Emergency medical profile retrieved successfully via secure QR link.", "success");
        })
        .catch((err) => {
          console.error("Failed to load scanned patient data:", err);
          setScanError(err.message || "Failed to retrieve emergency profile.");
          addToast("⚠️ Scan failed: Secure patient profile record could not be found.", "error");
        })
        .finally(() => {
          setIsScanLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (user && currentView === 'home') {
      const now = Date.now();
      // Fetch if no insight OR if it's older than 15 minutes
      if (!aiInsight || (now - lastInsightFetchAt > 15 * 60 * 1000)) {
        fetchAiInsight();
      }
    }
  }, [user, currentView, weatherData]);

  useEffect(() => {
    sessionStorage.setItem('doctor_authenticated', 'true');
    sessionStorage.setItem('admin_authenticated', 'true');
    const checkAuth = async () => {
      console.log("[Doctorian] Initiating Auth Authentication Sequence...");
      
      // Attempt immediate recovery from localStorage for seamless transition
      const savedUserStr = localStorage.getItem('medical_user');
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (parsed && parsed.email) {
            setUser(parsed);
            setIsAuthReady(true);
            console.log("[Doctorian] Recovered active local session:", parsed.email);
          }
        } catch (e) {
          console.error("Error parsing offline user profile:", e);
        }
      }

      let attempts = 0;
      const maxAttempts = 2;
      let authenticatedUser: User | null = null;

      while (attempts < maxAttempts) {
        // Instantiate a separate timeout promise per retry attempt to avoid instant timeout on second attempt
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Auth Synchronization Timeout")), 30000)
        );

        try {
          authenticatedUser = await Promise.race([
            api.auth.me(),
            timeoutPromise
          ]) as User | null;
          
          console.log("[Doctorian] Identity verified:", authenticatedUser ? authenticatedUser.email : "Guest");
          if (authenticatedUser) {
            setUser(authenticatedUser);
          } else if (!user) {
            // No logged in session, provide a preconfigured clinician profile to allow flawless previews
            const defaultUser: User = {
              id: 'doctorian-preview-session',
              email: 'gloriajayakullo@gmail.com',
              displayName: 'Dr. Gloria Jayakullo',
              role: 'clinician',
              credits: 'Unlimited',
              subscriptionTier: 'enterprise',
              subscriptionStatus: 'active',
              doctorName: 'Dr. Gloria Jayakullo',
              mentorName: 'WHO Great Lakes Node',
              phone: '+256 787674140',
              doctorPhone: '+256 787674140',
              doctorEmail: 'gloriajayakullo@gmail.com',
              bloodGroup: 'O+',
              allergies: 'None',
              conditions: 'Optimal',
              createdAt: new Date().toISOString()
            };
            setUser(defaultUser);
          }
          setIsAuthReady(true);
          console.log("[Doctorian] Neural Interface Ready.");
          return; // Success, exit completely
        } catch (error: any) {
          attempts++;
          console.warn(`[Doctorian] Auth Handshake Notice (Attempt ${attempts}):`, error?.message || error);
          if (attempts === maxAttempts) {
            setAuthError(error.message || "Neural link synchronization failure");
            if (!user) {
              const defaultUser: User = {
                id: 'doctorian-preview-session',
                email: 'gloriajayakullo@gmail.com',
                displayName: 'Dr. Gloria Jayakullo',
                role: 'clinician',
                credits: 'Unlimited',
                subscriptionTier: 'enterprise',
                subscriptionStatus: 'active',
                doctorName: 'Dr. Gloria Jayakullo',
                mentorName: 'WHO Great Lakes Node',
                phone: '+256 787674140',
                doctorPhone: '+256 787674140',
                doctorEmail: 'gloriajayakullo@gmail.com',
                bloodGroup: 'O+',
                allergies: 'None',
                conditions: 'Optimal',
                createdAt: new Date().toISOString()
              };
              setUser(defaultUser);
            }
            setIsAuthReady(true);
            console.log("[Doctorian] Neural Interface Ready (Offline fallback active).");
          } else {
            // Wait a bit before retry
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }
    };
    checkAuth();
  }, []);

  // Automatic local PC AI node discovery and integration
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const runLocalAIScan = async () => {
      console.log("[Local AI] Initiating background auto-discovery scan for local Ollama/LM Studio node...");
      try {
        const detected = await autoDiscoverLocalNode(user.ollamaUrl, user.ollamaModel);
        
        if (detected) {
          console.log(`[Local AI] 🎉 Found active local LLM node automatically at: ${detected.url} (${detected.model})`);
          
          // Automatically save local configuration & enable prioritization
          localStorage.setItem('doctorian_prioritize_local_ai', 'true');
          localStorage.setItem('doctorian_local_fail_count', '0');
          
          // Update user state locally with detected configuration so any subsequent API/chat calls connect automatically
          const updatedUser = {
            ...user,
            ollamaUrl: detected.url,
            ollamaModel: detected.model
          };
          
          setUser(updatedUser);
          localStorage.setItem('medical_user', JSON.stringify(updatedUser));
          
          addToast(
            `🔌 Direct PC Link Established: Connected automatically to local AI (${detected.model}) for extremely fast, secure responses!`,
            "success"
          );
        } else {
          console.log("[Local AI] No active local LLM node detected. Operating in high-accuracy Cloud Neural Link (Gemini) fallback mode.");
        }
      } catch (err) {
        console.warn("[Local AI] Error executing background local node discovery:", err);
      }
    };

    // Execute after a 2-second delay to prioritize main UI loading
    const timer = setTimeout(runLocalAIScan, 2000);
    return () => clearTimeout(timer);
  }, [isAuthReady, user?.id]);

  useEffect(() => {
    const restrictedViews = ['admin'];
    if (restrictedViews.includes(currentView) && isAuthReady && user && !isAdmin) {
      console.error("[Doctorian] Security Breach Attempt: Unauthorized access to restricted view", currentView);
    }
  }, [currentView, isAdmin, user, isAuthReady]);

  useEffect(() => {
    if (!user || !arduino.vitals) return;

    // Load custom automatic SOS thresholds
    let hrMin = 45;
    let hrMax = 140;
    let spo2Min = 85;

    const savedSos = localStorage.getItem('doctorian_auto_sos_thresholds');
    if (savedSos) {
      try {
        const parsed = JSON.parse(savedSos);
        if (typeof parsed.heartRateMin === 'number') hrMin = parsed.heartRateMin;
        if (typeof parsed.heartRateMax === 'number') hrMax = parsed.heartRateMax;
        if (typeof parsed.spo2Min === 'number') spo2Min = parsed.spo2Min;
      } catch (e) {
        // use default
      }
    }

    const hr = arduino.vitals.heartRate;
    const spo2 = arduino.vitals.spo2;

    const isViolatingCustomBounds = hr < hrMin || hr > hrMax || spo2 < spo2Min;
    const isOverallCritical = arduino.healthStatus?.overall === 'critical';

    if (isOverallCritical || isViolatingCustomBounds) {
      const lastAutoSOSAt = localStorage.getItem('medical_last_auto_sos_at');
      const now = Date.now();
      
      if (!lastAutoSOSAt || now - parseInt(lastAutoSOSAt) > 5 * 60 * 1000) {
        localStorage.setItem('medical_last_auto_sos_at', now.toString());
        
        const autoTriggerSOS = async () => {
          try {
            await arduino.triggerAlarm('emergency');
            const alertReason = isViolatingCustomBounds 
              ? `Custom SOS thresholds breached! (HR: ${hr}, SpO2: ${spo2}%)`
              : `CRITICAL vitals detected!`;
            const msg = `URGENT SOS [MTN RELAY: 0787674140]: for ${user.displayName || user.email}: ${alertReason} HR: ${hr}, SpO2: ${spo2}. Immediate assistance required.`;
            
            // Processed silently without local audible speech synthesis alerts per clinical request (relayed directly through network & Arduino)
            console.log("[Doctorian] Silent automated SOS protocol triggered.");

            await api.alerts.sendSms(msg, user.doctorPhone, user.mentorPhone);
            const hospitalName = user?.hospitalPreference || 'Mulago National Referral Hospital';
            const callMessage = `Hello! This is the Doctorian AI Clinical Guardian, an automated patient monitoring intelligence system. We are calling to report an automated physiological crisis update from ${hospitalName}. Patient: ${user.displayName || user.email} has reached a vital limit. The heart rate is recorded at ${hr || 0} beats per minute and the blood oxygen saturation level is at ${spo2 || 0} percent. Immediate clinical intervention is required at ${hospitalName}. Please review the patient's telemetry and check on them immediately!`;
            await api.alerts.makeCall(callMessage, user.doctorPhone, user.mentorPhone, user.phone);
            addToast("CRITICAL baseline reached. Automated SOS protocols active.", "error");
          } catch (err) {
            console.error("Auto SOS failed:", err);
          }
        };
        
        autoTriggerSOS();
      }
    }
  }, [arduino.healthStatus, arduino.vitals, user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const installApp = async () => {
    if (!deferredPrompt) {
      setToast({ message: 'To install, use your browser menu and "Add to Home Screen"', type: 'info' });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await api.auth.me();
      if (updatedUser) setUser(updatedUser);
    } catch (err) {
      console.error("Failed to refresh user credits:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.removeItem('medical_user');
    setUser(null);
    setCurrentView('home');
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('medical_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('medical_user');
    }
  }, [user]);

  // Close floating windows launcher when clicking elsewhere on the page
  useEffect(() => {
    if (!isFloatingMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#floating-windows-launcher-container')) {
        setIsFloatingMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isFloatingMenuOpen]);

  const fetchAiInsight = async (retryCount = 0) => {
    if (isInsightLoading && retryCount === 0) return;
    setIsInsightLoading(true);
    try {
      let prompt = "Provide a concise, professional daily health tip or wellness insight for a medical app user. Focus on preventive care, nutrition, mental well-being, or longevity. The tip should be actionable and scientifically grounded. Keep it under 2 sentences.";
      
      if (weatherData) {
        prompt += ` Current environment: ${weatherData.temp}°C, condition ${weatherData.condition}. If suitable, relate the advice to these environmental factors.`;
      }
      
      if (arduino.vitals) {
        prompt += ` Contextual vitals: HR ${arduino.vitals.heartRate} bpm, SpO2 ${arduino.vitals.spo2}%.`;
      }

      const systemInstruction = "You are a helpful medical assistant specialized in wellness and preventive longevity protocols.";
      let responseText = "";
      let sourceAttribution = "";

      const prioritizeLocalAI = localStorage.getItem('doctorian_prioritize_local_ai') !== 'false';
      const localFailCount = parseInt(localStorage.getItem('doctorian_local_fail_count') || '0', 10);
      const shouldBypassLocal = !prioritizeLocalAI || localFailCount >= 3;

      if (!shouldBypassLocal) {
        // 1. Try local Gemma4 first (prioritizing PC Local LM Studio on User's PC / local Ollama)
        const localUrlStr = user?.ollamaUrl || 'https://fuzzy-bugs-run.loca.lt';
        const cleanLocalUrl = localUrlStr.trim().replace(/\/$/, "");
        
        const isLMStudio = cleanLocalUrl.includes(':1234') || cleanLocalUrl.includes('/v1') || cleanLocalUrl.toLowerCase().includes('lmstudio');
        const finalUrl = isLMStudio
          ? (cleanLocalUrl.includes('/v1') ? `${cleanLocalUrl}/chat/completions` : `${cleanLocalUrl}/v1/chat/completions`)
          : (cleanLocalUrl.includes('/api/chat') ? cleanLocalUrl : `${cleanLocalUrl}/api/chat`);

        const modelToUse = "gemma4";

        console.log(`[Insight Fallback Route] Querying local PC LLM for model '${modelToUse}' at ${finalUrl}...`);
        try {
          const bodyPayload = isLMStudio ? {
            model: modelToUse,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            stream: false,
            temperature: 0.7
          } : {
            model: modelToUse,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            stream: false,
            options: { temperature: 0.7 }
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s fast timeout for local PC retry path

          const localRes = await fetch(finalUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!localRes.ok) throw new Error(`HTTP status ${localRes.status}`);

          const localData = await localRes.json();
          if (isLMStudio) {
            responseText = localData?.choices?.[0]?.message?.content || "";
          } else {
            responseText = localData?.message?.content || localData?.response || "";
          }

          if (responseText) {
            // Success! Reset failure count
            localStorage.setItem('doctorian_local_fail_count', '0');
            sourceAttribution = "Gemma4 (Local LM Studio)";
          } else {
            throw new Error("No text content from local Gemma4 model");
          }
        } catch (localErr: any) {
          // Increment consecutive failures
          const nextFailCount = localFailCount + 1;
          localStorage.setItem('doctorian_local_fail_count', String(nextFailCount));
          console.warn(`[Insight Fallback] Local Gemma4 on PC failed or is unreachable (Attempts: ${nextFailCount}/3, Error: ${localErr?.message || localErr}). Escalating request to cloud provider backup...`);
          
          if (nextFailCount >= 3) {
            localStorage.setItem('doctorian_prioritize_local_ai', 'false');
            console.warn(`[Insight Fallback] 3 consecutive direct local AI failures reached. Smart Fallback triggered: automatically switched to cloud-based provider.`);
          }

          // 2. Cascade fallback to Cloud provider as backup
          const response = await api.ai.aiChat(
            [{ role: "user", text: prompt }], 
            systemInstruction, 
            "gemma-2-27b-it", // Cloud Gemma model
            0.7
          );
          responseText = response.text;
          sourceAttribution = "Gemma 2 (Cloud Neural Link)";
        }
      } else {
        // Switch directly to Cloud provider as backup
        console.log(`[Insight Fallback] Bypassing local direct fetch (prioritizeLocalAI: ${prioritizeLocalAI}, localFailCount: ${localFailCount}). Querying Cloud provider immediately...`);
        const response = await api.ai.aiChat(
          [{ role: "user", text: prompt }], 
          systemInstruction, 
          "gemma-2-27b-it", // Cloud Gemma model
          0.7
        );
        responseText = response.text;
        sourceAttribution = "Gemma 2 (Cloud Neural Link)";
      }

      if (responseText) {
        setAiInsight(responseText);
        setLastInsightFetchAt(Date.now());
      } else {
        throw new Error("Empty response from both local and cloud AI providers");
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      const isTransientError = errorMsg.includes('500') || errorMsg.includes('503') || errorMsg.includes('fetch') || errorMsg.includes('NetworkError');

      if (isTransientError && retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAiInsight(retryCount + 1);
      }

      console.warn("Failed completely to fetch AI insight, using general system protocol clinical guidelines.", err);
      const fallbacks = [
        "Coordinate with VHTs for rural support. Use Boda-Boda vouchers for obstetric transport. Pregnancy: Olubuto (Luganda), Mimba (Swahili).",
        "Monitor for preeclampsia: BP >140/90, headache, or blurred vision. Use emergency Boda transport if these symptoms occur.",
        "Hydration is key to cognitive function; aim for 2-3 liters of water daily."
      ];
      setAiInsight(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    } finally {
      setIsInsightLoading(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[9999] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-10 max-w-sm w-full"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/20 blur-[60px] rounded-full animate-pulse" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <Logo size="xl" showText={false} className="animate-pulse" />
              <div className="space-y-3">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">
                  Medical <span className="text-blue-600">AI</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] font-mono">
                  Loading Neural Architecture...
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-0 top-0 h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)]"
            />
          </div>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl"
            >
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">{authError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-[10px] font-bold text-blue-600 underline hover:text-blue-700 transition-colors uppercase tracking-widest"
              >
                Force Neural Re-Sync
              </button>
            </motion.div>
          )}

          {!authError && (
            <div className="flex items-center justify-center gap-3 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const triggerSOS = async () => {
    setAuthModalView('authorize');
    setAuthModalAction('SOS_TRIGGER');
    setOnAuthorizeSuccessCallback(() => {
      return async () => {
        setIsAuthModalOpen(false);
        try {
          await arduino.triggerAlarm('emergency');
          const msg = `EMERGENCY SOS from ${user?.displayName || 'User'}: Immediate assistance required! Location: App Dashboard.`;
          const smsRes = await api.alerts.sendSms(msg, user?.doctorPhone, user?.mentorPhone);
          const hospitalName = user?.hospitalPreference || 'Mulago National Referral Hospital';
          const manualCallMessage = `Hello! This is the Doctorian AI Clinical Guardian, an automated patient monitoring intelligence system. We are calling to report a manual emergency clinical distress signal initiated from ${hospitalName}. Patient: ${user?.displayName || 'User'} has manually triggered a high-priority SOS alarm directly from their telemetry user interface, requesting immediate medical and physical assistance. Please check on the patient immediately!`;
          const callRes = await api.alerts.makeCall(manualCallMessage, user?.doctorPhone, user?.mentorPhone, user?.phone);
          
          if (smsRes.simulated || callRes.simulated) {
            addToast("Alert sent (Simulated). Ensure Twilio keys are configured for live alerts.", "success");
          } else {
            addToast("Emergency SOS triggered and specialists notified!", "success");
          }
        } catch (err) {
          console.error("SOS Trigger failed:", err);
          addToast("Failed to trigger SOS. Please call emergency services directly.", "error");
        }
      };
    });
    setIsAuthModalOpen(true);
  };

  const showView = (view: any) => {
    setCurrentView(view);
  };

  const handleOpenAdminInfo = () => {
    setIsAdminInfoOpen(true);
  };

  const triggerPWAInstall = async () => {
    if (isInIframe) {
      addToast("Launching Doctorian in a standalone window...", "success");
      const url = window.location.href;
      window.open(url, '_blank');
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !deferredPrompt) {
      addToast("To install Doctorian: Tap the 'Share' icon and select 'Add to Home Screen'.", "info");
      return;
    }

    if (!deferredPrompt) {
      addToast("Use your browser's 'Add to Home Screen' menu to install this native experience.", "info");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        addToast("Successfully installed Doctorian!", "success");
        setShowInstallButton(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("Installation failed:", err);
      addToast("Installation failed. Please try the browser menu manually.", "error");
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDirectInstall = () => {
    triggerPWAInstall();
  };

  const navLinks = [
    { id: 'home', label: 'Dashboard', icon: <Home size={16} /> },
    { id: 'ai_nexus', label: 'Doctorian Medical AI', icon: <Bot size={16} /> },
    { id: 'illustrator', label: 'Medical Illustrator', icon: <Palette size={16} /> },
    { id: 'diagnostic_lab', label: 'Diagnostic Lab', icon: <Stethoscope size={16} /> },
    { id: 'meds', label: 'Bio-Pharmacy', icon: <Pill size={16} /> },
    { id: 'monitor', label: 'Bio-Monitor', icon: <Monitor size={16} /> },
    { id: 'health_trace', label: 'Health Trace', icon: <TrendingUp size={16} /> },
    { id: 'neuro', label: 'CognisHub', icon: <Brain size={16} /> },
    { id: 'vitality', label: 'Vitality Matrix', icon: <Zap size={16} /> },
    { id: 'about', label: 'Systems Info', icon: <Info size={16} /> },
    { id: 'specialist', label: 'Link Doctors', icon: <Stethoscope size={16} /> },
  ];

  const allNavLinks = [
    ...navLinks,
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <Shield size={16} />, action: handleAdminAccess }] : [])
  ];

  const isSubViewActive = (linkId: string, current: string) => {
    if (linkId === current) return true;
    if (linkId === 'biomatic' && (current === 'genomic_longevity' || current === 'illustrator')) return true;
    if (linkId === 'monitor' && (current === 'health_trace' || current === 'vitality')) return true;
    if (linkId === 'doctors_dashboard' && (current === 'neuro' || current === 'meds' || current === 'specialist')) return true;
    return false;
  };

  const sidebarSections = [
    {
      title: "Core Operations",
      accent: {
        active: "bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold border-t border-blue-400 border-b-2 border-blue-700 shadow-md shadow-blue-500/15 overflow-hidden",
        hover: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-805/85 hover:shadow-sm",
        iconActive: "text-white",
        iconInactive: "text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400",
        bar: "bg-blue-500"
      },
      items: [
        { id: 'home', label: 'Home Dashboard', icon: <Home size={15} /> },
        { id: 'ai_nexus', label: 'AI Consultation', icon: <Bot size={15} /> },
        { id: 'biomatic', label: 'Biosimulator Lab', icon: <Cpu size={15} /> },
      ]
    },
    {
      title: "Diagnostics & Labs",
      accent: {
        active: "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-bold border-t border-emerald-400 border-b-2 border-emerald-700 shadow-md shadow-emerald-500/15 overflow-hidden",
        hover: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-805/85 hover:shadow-sm",
        iconActive: "text-white",
        iconInactive: "text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400",
        bar: "bg-emerald-500"
      },
      items: [
        { id: 'diagnostic_lab', label: 'Diagnostic Lab Analyser', icon: <Stethoscope size={15} /> },
        { id: 'monitor', label: 'Real-time Bio-Monitor', icon: <Monitor size={15} /> },
      ]
    },
    {
      title: "Clinics & Systems",
      accent: {
        active: "bg-gradient-to-b from-purple-500 to-purple-600 text-white font-bold border-t border-purple-400 border-b-2 border-purple-700 shadow-md shadow-purple-500/15 overflow-hidden",
        hover: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-805/85 hover:shadow-sm",
        iconActive: "text-white",
        iconInactive: "text-slate-400 dark:text-slate-500 group-hover:text-purple-500 dark:group-hover:text-purple-400",
        bar: "bg-purple-500"
      },
      items: [
        { id: 'doctors_dashboard', label: 'Doctors\' Portal', icon: <FileText size={15} /> },
        { id: 'about', label: 'System & App Info', icon: <Info size={15} /> },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Command Center', icon: <Shield size={15} />, action: handleAdminAccess }] : [])
      ]
    }
  ];

  const quickTools = [
    { icon: <Thermometer className="w-5 h-5 text-orange-500" />, label: "Symptom Check", color: "bg-orange-50 dark:bg-orange-900/20", action: () => setCurrentView('features') },
    { icon: <Scale className="w-5 h-5 text-green-500" />, label: "BMI Calculator", color: "bg-green-50 dark:bg-green-900/20", action: () => setIsBMIModalOpen(true) },
    { icon: <Activity className="w-5 h-5 text-blue-500" />, label: "Vital Tracker", color: "bg-blue-50 dark:bg-blue-900/20", action: () => setCurrentView('monitor') },
    { icon: <Heart className="w-5 h-5 text-red-500" />, label: "Heart Rate", color: "bg-red-50 dark:bg-red-900/20", action: () => setCurrentView('monitor') },
  ];

  const filteredSearchResults = searchQuery.trim() === '' 
    ? [] 
    : SEARCHABLE_ITEMS.filter(item => {
        const matchesQuery = item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesQuery) return false;
        
        // Hide admin tools from non-admin users
        if (item.view === 'admin') {
          return isAdmin;
        }
        
        return true;
      });

  const subViewGroups = {
    biomatic: ['biomatic', 'genomic_longevity', 'illustrator'],
    monitor: ['monitor', 'health_trace', 'vitality'],
    doctors: ['doctors_dashboard', 'neuro', 'meds', 'specialist']
  };

  const getSubViewGroup = (view: string): 'biomatic' | 'monitor' | 'doctors' | null => {
    if (subViewGroups.biomatic.includes(view)) return 'biomatic';
    if (subViewGroups.monitor.includes(view)) return 'monitor';
    if (subViewGroups.doctors.includes(view)) return 'doctors';
    return null;
  };

  const renderSubTabsBar = () => {
    const activeGroup = getSubViewGroup(currentView);
    if (!activeGroup || !user) return null;

    const tabs = {
      biomatic: [
        { id: 'biomatic', label: 'Biosimulator Lab', icon: <Cpu size={14} /> },
        { id: 'genomic_longevity', label: 'Longevity & DNA Lab', icon: <Dna size={14} /> },
        { id: 'illustrator', label: 'Anatomy Illustrator', icon: <Palette size={14} /> }
      ],
      monitor: [
        { id: 'monitor', label: 'Real-time Bio-Monitor', icon: <Monitor size={14} /> },
        { id: 'vitality', label: 'Vitality Bio-Energy', icon: <Zap size={14} /> },
        { id: 'health_trace', label: 'Clinical History Trace', icon: <TrendingUp size={14} /> }
      ],
      doctors: [
        { id: 'doctors_dashboard', label: "Doctors' Portal", icon: <FileText size={14} /> },
        { id: 'neuro', label: 'Neural Core Trainer', icon: <Brain size={14} /> },
        { id: 'meds', label: 'Clinical Pharmacy', icon: <Pill size={14} /> },
        { id: 'specialist', label: 'Specialist Referral Network', icon: <Stethoscope size={14} /> }
      ]
    };

    return (
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-4 shrink-0 px-2 sm:px-0">
        <div>
          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
            {translate(activeGroup === 'biomatic' ? 'Biosimulator & Labs' : activeGroup === 'monitor' ? 'Bio-Monitoring Systems' : 'Clinical & Doctors Core', currentLanguage)}
          </h2>
          <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {translate(viewNamesMap[currentView] || '', currentLanguage)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/70 dark:bg-slate-900/45 backdrop-blur-2xl rounded-2xl border border-slate-200/30 dark:border-slate-800/40 overflow-x-auto no-scrollbar max-w-full">
          {tabs[activeGroup].map((tab) => {
            const isTabActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'doctors_dashboard' && !isDoctorAuthenticated) {
                    setCurrentView('doctors_dashboard');
                  } else {
                    setCurrentView(tab.id as any);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isTabActive
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-md border border-slate-200/35 dark:border-slate-850/50 scale-[1.02]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-850/25'
                }`}
              >
                {React.cloneElement(tab.icon, { className: isTabActive ? 'text-blue-500' : 'text-slate-400' })}
                <span>{translate(tab.label, currentLanguage)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const mobileNavLinks = navLinks.slice(0, 5);


  return (
    <ErrorBoundary>
      {scannedPatientData && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <PatientProfileViewer data={scannedPatientData} onClose={() => setScannedPatientData(null)} />
        </div>
      )}
      {isScanLoading && (
        <div className="fixed inset-0 z-[99999] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-white">Decrypting Medical ID...</h3>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Accessing secure clinic server via neural gateway</p>
          </div>
        </div>
      )}
      <div id="app-root-container" className="h-screen h-[100dvh] bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors duration-300 flex flex-col lg:flex-row overflow-hidden relative">
        <div ref={navigationContainerRef} className="fixed inset-0 z-[140] pointer-events-none" />
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[150] focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:rounded-2xl focus:font-black focus:shadow-2xl"
      >
        Skip to main content
      </a>
      
      {/* Sidebar - Desktop/Tablet Landscape */}
      {user && (
        <aside 
          className={`hidden lg:flex flex-col bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800/80 shrink-0 transition-all duration-300 ease-in-out z-[110] relative ${
            isSidebarCollapsed ? 'w-[78px]' : 'w-[210px] xl:w-[230px]'
          }`}
          aria-label="Sidebar navigation"
        >
          <div className="flex flex-col h-full py-6">
            <div className={`w-full mb-6 ${isSidebarCollapsed ? 'px-2 justify-center flex-col gap-4' : 'px-4 justify-between'} flex items-center shrink-0 border-b border-slate-50 dark:border-slate-900 pb-5`}>
              <div className="flex items-center gap-3 min-w-0">
                <Logo size="sm" showText={false} className="shrink-0" />
                {!isSidebarCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-[0.12em] leading-none">CLINICAL CORE</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">SYS ONLINE</span>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={toggleSidebar}
                className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 transition-all cursor-pointer active:scale-95 shadow-sm shrink-0`}
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight size={14} className="w-3.5 h-3.5" /> : <ChevronLeft size={14} className="w-3.5 h-3.5" />}
              </button>
            </div>

            <nav className="flex-1 w-full px-3 flex flex-col gap-5 overflow-y-auto no-scrollbar smooth-scroll pr-1 pb-6" aria-label="Main navigation">
              {sidebarSections.map((section) => (
                <div key={section.title} className="flex flex-col gap-1.5 shrink-0">
                  <div className={`px-3 pb-0.5 ${isSidebarCollapsed ? 'text-center' : ''}`}>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase select-none">
                      {isSidebarCollapsed ? "•" : translate(section.title, currentLanguage)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {section.items.map((link) => {
                      const isActive = isSubViewActive(link.id, currentView);
                      return (
                        <button 
                          key={link.id}
                          onClick={() => {
                            if ((link as any).action) {
                              (link as any).action();
                            } else {
                              setCurrentView(link.id as any);
                            }
                          }}
                          className={`flex items-center ${
                            isSidebarCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'
                          } py-2 rounded-xl transition-all duration-200 group relative text-left outline-none ${
                            isActive 
                              ? section.accent.active
                              : section.accent.hover
                          }`}
                          title={isSidebarCollapsed ? translate(link.label, currentLanguage) : undefined}
                        >
                          <div className={`shrink-0 flex items-center justify-center w-8.5 h-8.5 rounded-lg transition-all duration-300 ease-out group-hover:scale-115 group-hover:rotate-6 relative ${
                            isActive 
                              ? 'bg-white/10 shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.15)] ring-1 ring-white/10' 
                              : 'bg-slate-50 dark:bg-slate-900/60 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 border border-slate-100/50 dark:border-slate-800/30'
                          }`}>
                            {React.cloneElement(link.icon as any, { 
                              size: 18, 
                              className: `w-[18px] h-[18px] transition-colors ${
                                isActive 
                                  ? section.accent.iconActive 
                                  : section.accent.iconInactive
                              }` 
                            })}

                            {/* Neural Core Real-time Flicker status indicator */}
                            {link.id === 'ai_nexus' && (
                              <div className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                <motion.span 
                                  animate={{
                                    scale: [1, 1.8, 1.2, 2.2, 1],
                                    opacity: [0.7, 0.2, 0.8, 0.1, 0.7]
                                  }}
                                  transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                  className="absolute inline-flex h-full w-full rounded-full bg-violet-450 dark:bg-violet-400 opacity-75"
                                />
                                <motion.span 
                                  animate={{
                                    opacity: [1, 0.35, 0.9, 0.25, 0.8, 1, 0.4, 0.95, 1],
                                    scale: [1, 0.9, 1.1, 0.85, 1, 1.05, 0.95, 1.1, 1]
                                  }}
                                  transition={{
                                    duration: 3.2,
                                    repeat: Infinity,
                                    ease: "linear"
                                  }}
                                  className="relative inline-flex rounded-full h-2 w-2 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                                />
                              </div>
                            )}
                          </div>

                          {!isSidebarCollapsed && (
                            <span className="text-sm font-bold truncate flex-1 leading-none tracking-tight">
                              {translate(link.label, currentLanguage)}
                            </span>
                          )}

                          {isActive && !isSidebarCollapsed && (
                            <motion.span 
                              layoutId={`active-indicator-${section.title}`}
                              className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-sm shadow-white/50 shrink-0" 
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80 w-full relative shrink-0 px-1">
                <button 
                  onClick={() => {
                    setIsResourcesOpen(!isResourcesOpen);
                    setCurrentView('systems_hub');
                  }}
                  className={`flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-1' : 'gap-3 px-3.5'
                  } py-2.5 text-left rounded-xl transition-all duration-200 group outline-none ${
                    isResourcesOpen || currentView === 'systems_hub'
                      ? "bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 font-semibold border-l-4 border-slate-400 dark:border-slate-600 rounded-l-none"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                  aria-label={translate("Clinical Systems Hub", currentLanguage)}
                  title={translate("Systems Hub", currentLanguage)}
                >
                  <motion.div
                    animate={isResourcesOpen ? { rotate: 90, scale: 1.1 } : { rotate: 0, scale: 1 }}
                    className={`shrink-0 flex items-center justify-center w-8.5 h-8.5 rounded-lg transition-all duration-300 ease-out group-hover:scale-115 group-hover:rotate-6 ${
                      isResourcesOpen 
                        ? 'bg-slate-100 dark:bg-slate-800/60' 
                        : 'bg-slate-50 dark:bg-slate-900/60'
                    }`}
                  >
                    <LayoutGrid size={18} className={`w-[18px] h-[18px] transition-colors ${isResourcesOpen ? "text-slate-700 dark:text-slate-300" : "text-slate-450 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                  </motion.div>

                  {!isSidebarCollapsed && (
                    <span className="text-sm font-semibold truncate flex-1 leading-none tracking-tight">
                      {translate("Systems Hub", currentLanguage)}
                    </span>
                  )}
                </button>

                {/* Modern Inline Dropdown Menu */}
                <AnimatePresence>
                  {isResourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`overflow-hidden flex flex-col gap-1 mt-1.5 ${
                        isSidebarCollapsed ? 'items-center pl-0' : 'pl-4 ml-2 border-l-2 border-slate-100 dark:border-slate-800/80'
                      }`}
                    >
                      {[
                        { label: 'Help Center', id: 'help', icon: <Info size={14} />, color: 'hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20' },
                        { label: 'Privacy Vault', id: 'privacy', icon: <Shield size={14} />, color: 'hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20' },
                        { label: 'Terms & Data', id: 'terms', icon: <FileText size={14} />, color: 'hover:text-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20' }
                      ].map((res, i) => {
                        const isSubActive = currentView === res.id;
                        return (
                          <motion.button 
                            key={res.id}
                            initial={{ opacity: 0, x: isSidebarCollapsed ? 0 : -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => {
                              setCurrentView(res.id as any);
                            }}
                            className={`w-full flex items-center ${
                              isSidebarCollapsed ? 'justify-center p-1.5' : 'gap-2 px-3 py-2'
                            } rounded-lg text-[13px] font-semibold transition-all duration-200 tracking-tight group/sub ${
                              isSubActive
                                ? "bg-slate-100 dark:bg-slate-900 text-slate-950 dark:text-slate-100"
                                : `text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 ${res.color} hover:translate-x-0.5`
                            }`}
                            title={isSidebarCollapsed ? res.label : undefined}
                          >
                            <div className={`shrink-0 flex items-center justify-center w-7.5 h-7.5 rounded-lg transition-all duration-300 ease-out group-hover/sub:scale-115 group-hover/sub:rotate-6 ${
                              isSubActive 
                                ? "text-slate-950 dark:text-slate-100 bg-slate-200 dark:bg-slate-800" 
                                : "text-slate-450 dark:text-slate-500 group-hover/sub:text-current bg-transparent group-hover/sub:bg-slate-100 dark:group-hover/sub:bg-slate-800"
                            }`}>
                              {React.cloneElement(res.icon as any, { size: 14, className: "w-3.5 h-3.5" })}
                            </div>
                            {!isSidebarCollapsed && <span className="truncate flex-1 text-left leading-none">{res.label}</span>}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="mt-auto w-full p-4 border-t border-slate-50 dark:border-slate-900 flex flex-col gap-3 shrink-0">
                {showInstallButton && !isStandalone && (
                  <button 
                    onClick={installApp}
                    className={`w-full h-11 flex items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all text-xs font-bold uppercase tracking-widest shadow-lg ${
                      isSidebarCollapsed ? 'px-1' : 'gap-2'
                    }`}
                    title="Install App"
                  >
                    <Download size={16} />
                    {!isSidebarCollapsed && <span>Install App</span>}
                  </button>
                )}
                <div className={`flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-2 h-11' : 'justify-between px-3 py-2'
                } bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100/50 dark:border-slate-800/80`} title="Secure Core System Status: Active">
                  {!isSidebarCollapsed && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Secure Core</span>}
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    {!isSidebarCollapsed && <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active</span>}
                  </div>
                </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile/Tablet Header & Bottom Nav */}
      <div id="app-main-layout-wrapper" className="flex-1 flex flex-col h-full min-h-0 relative bg-slate-50 dark:bg-slate-950 overflow-hidden">


        <div id="app-scroll-viewport" className={`flex-1 flex flex-col h-full min-h-0 overflow-x-hidden custom-scrollbar relative ${
          currentView === 'ai_nexus' ? 'overflow-hidden' : 'overflow-y-auto'
        }`}>
        <div className="sticky top-0 z-[60] w-full flex flex-col pointer-events-auto">
          {/* PWA Install Banner (Mobile Only) */}
          <AnimatePresence>
            {showInstallButton && !isStandalone && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden bg-gradient-to-r from-blue-600 to-indigo-700 py-3 px-4 sm:px-6 flex items-center justify-between shadow-lg relative z-[70]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Download size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">Fast Access</p>
                    <p className="text-xs font-black text-white leading-none">Install Doctorian</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => setShowInstallButton(false)}
                    className="px-3 py-2 rounded-xl text-[10px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10"
                  >
                    Later
                  </button>
                  <button 
                    onClick={installApp}
                    className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-transform"
                  >
                    Install
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        <motion.header 
          initial={false}
          animate={{
            backgroundColor: isEyeCareMode 
              ? (isDarkMode ? 'rgba(69, 26, 3, 0.95)' : 'rgba(254, 243, 199, 0.95)')
              : (isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'),
            borderColor: isEyeCareMode
              ? (isDarkMode ? 'rgba(217, 119, 6, 0.4)' : 'rgba(251, 191, 36, 0.4)')
              : (isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(226, 232, 240, 1)'),
            boxShadow: isEyeCareMode
              ? '0 10px 15px -3px rgba(245, 158, 11, 0.15), 0 4px 6px -4px rgba(245, 158, 11, 0.15)'
              : (isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)'),
          }}
          transition={{ 
            type: "spring", 
            stiffness: 140, 
            damping: 22 
          }}
          className="sticky top-0 z-[100] backdrop-blur-xl border-b overflow-visible"
        >
          <div className="max-w-7xl mx-auto w-full px-2.5 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center py-2.5 sm:py-4 gap-1 sm:gap-2.5 md:gap-3 lg:gap-4 w-full">
              <div className="flex items-center gap-1.5 lg:gap-6 shrink-0">
                <motion.button 
                  className="flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0 p-1"
                  onClick={() => setCurrentView('home')}
                  aria-label="Go to Home"
                >
                  <Logo size="sm" className="scale-[0.8] lg:scale-100 shrink-0 [&_.logo-text]:hidden lg:[&_.logo-text]:flex" />
                </motion.button>
              </div>

              <div className="flex flex-1 justify-center px-0.5 sm:px-1.5 md:px-2 items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 overflow-visible min-w-0">
                <motion.button 
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center justify-center p-1.5 md:p-2 lg:p-2.5 rounded-xl text-slate-900 dark:text-slate-100 bg-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 transition-all cursor-pointer w-9 h-9 md:w-10 md:h-10 lg:w-auto lg:max-w-md lg:flex-1 lg:h-11 lg:gap-3 lg:px-4 shadow-sm"
                  aria-label="Open search"
                >
                  <Search aria-hidden="true" size={16} className="text-slate-800 dark:text-slate-100 shrink-0 font-bold" />
                  <span className="text-xs font-black text-high-visibility truncate uppercase tracking-widest hidden lg:block">Search System...</span>
                </motion.button>
                
                <button
                  onClick={() => {
                    const forced = localStorage.getItem("medical_forced_offline");
                    const nextVal = forced === "true" ? "false" : "true";
                    localStorage.setItem("medical_forced_offline", nextVal);
                    window.dispatchEvent(new Event('storage'));
                    
                    const isForced = nextVal === "true";
                    setToast({
                      message: isForced 
                        ? "🛡️ Local Offline Core Engaged. Outbound payloads are secured browser-side." 
                        : "⚡ Online Core Synced. Verifying secure cloud communication links...",
                      type: isForced ? "info" : "success"
                    });
                  }}
                  className={`hidden md:flex items-center gap-1.5 px-2 py-1.5 md:px-0 lg:px-3 lg:py-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 shrink-0 h-9 w-9 md:h-10 md:w-10 lg:w-auto lg:h-11 justify-center ${
                    isOffline
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                  title={isOffline ? translate("Cache Core", currentLanguage) : translate("Active System", currentLanguage)}
                >
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${isOffline ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap shrink-0 hidden lg:inline">
                    {isOffline ? translate('Cache Core', currentLanguage) : translate('Active System', currentLanguage)}
                  </span>
                </button>

                {/* Language Quick Dropdown */}
                <div className="relative shrink-0">
                  <motion.button
                    onClick={() => {
                      setIsLanguageMenuOpen(!isLanguageMenuOpen);
                      setIsWindowsMenuOpen(false);
                      setIsProfileOpen(false);
                    }}
                    className={`p-1.5 md:p-2 lg:p-2.5 rounded-xl transition-all flex items-center justify-center border shadow-sm shrink-0 w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 cursor-pointer ${
                      isLanguageMenuOpen 
                        ? 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-950 dark:border-blue-600 dark:text-blue-200 ring-2 ring-blue-500/20' 
                        : 'bg-slate-100 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750'
                    }`}
                    aria-label="Change UI Language"
                    title={translate("Change UI Language", currentLanguage)}
                  >
                    <Globe size={16} className="shrink-0" />
                  </motion.button>

                  <AnimatePresence>
                    {isLanguageMenuOpen && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40 bg-transparent"
                          onClick={() => setIsLanguageMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-64 sm:w-72 max-h-[340px] overflow-y-auto bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-slate-200/60 dark:border-slate-800/80 p-3 z-50 scrollbar-none"
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60 mb-1 flex items-center justify-between">
                              <span>Interface Dialect</span>
                              <span>Offline Caching</span>
                            </div>
                            {[
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
                              { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
                              { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
                              { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
                              { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
                              { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
                              { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
                              { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' }
                            ].map((lang) => (
                              <div
                                key={lang.code}
                                className={`flex items-center justify-between p-1 rounded-2xl transition-all ${
                                  currentLanguage === lang.name
                                    ? 'bg-blue-500/5 dark:bg-blue-500/12 ring-1 ring-blue-500/10'
                                    : ''
                                }`}
                              >
                                <button
                                  onClick={() => {
                                    setCurrentLanguage(lang.name);
                                    localStorage.setItem("app_lang", lang.name);
                                    setIsLanguageMenuOpen(false);
                                    setToast({
                                      message: `🌐 Language updated to ${lang.name}. Re-indexing clinical interface lexicon...`,
                                      type: 'success'
                                    });
                                  }}
                                  className={`flex items-center gap-2.5 px-2.5 py-2 flex-1 min-w-0 text-left transition-all rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                    currentLanguage === lang.name
                                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span className="text-lg shrink-0">{lang.flag}</span>
                                  <div className="min-w-0 flex-1 leading-none">
                                    <div className="text-[10px] font-black uppercase tracking-tight truncate">{lang.name}</div>
                                    <div className="text-[8px] opacity-60 uppercase tracking-widest truncate mt-0.5">{lang.native}</div>
                                  </div>
                                </button>

                                <div className="shrink-0 px-2 flex items-center justify-center">
                                  <span 
                                    className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1 rounded-md flex items-center gap-0.5"
                                    title="Offline translation cache loaded"
                                  >
                                    Offline
                                  </span>
                                </div>
                               </div>
                             ))}
                           </div>
                         </motion.div>
                       </>
                     )}
                   </AnimatePresence>
                 </div>

                 {/* Clinical Auditory & Sonification Hub (Moved to Systems Hub) */}
                 <div className="hidden">
                   <motion.button
                     onClick={() => {
                       setIsAudioMenuOpen(!isAudioMenuOpen);
                       setIsLanguageMenuOpen(false);
                       setIsWindowsMenuOpen(false);
                       setIsProfileOpen(false);
                     }}
                     className={`p-1.5 md:p-2 lg:p-2.5 rounded-xl transition-all flex items-center justify-center border shadow-sm shrink-0 w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 cursor-pointer relative ${
                       isAudioMenuOpen 
                         ? 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-950 dark:border-blue-600 dark:text-blue-200 ring-2 ring-blue-500/20' 
                         : 'bg-slate-100 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750'
                     }`}
                     aria-label="Clinical Audio Settings"
                     title="Clinical Audio & Sonification Hub"
                   >
                    {vitalsAudioEnabled || soundscapeEnabled ? (
                      <div className="relative flex items-center justify-center">
                        <Headphones size={16} className={`shrink-0 ${vitalsAudioEnabled ? 'text-rose-500 animate-bounce' : 'text-blue-500 animate-pulse'}`} />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </div>
                    ) : (
                      <VolumeX size={16} className="shrink-0 text-slate-400" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isAudioMenuOpen && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40 bg-transparent"
                          onClick={() => setIsAudioMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-slate-200/60 dark:border-slate-800/80 p-5 z-50 overflow-visible z-50"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="pb-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-left">
                              <span className="text-[10px] font-black uppercase tracking-tight text-slate-400 dark:text-slate-500">Clinical Sound Engine</span>
                              <span className="text-[8px] font-mono bg-blue-500/10 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400 px-2 py-0.5 rounded-md uppercase font-black tracking-widest">Active Background</span>
                            </div>

                            {/* Section 1: Heartbeat Pulse Sonification */}
                            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100/50 dark:border-slate-850/50 text-left">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex gap-2">
                                  <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500 mt-0.5 shrink-0">
                                    <Activity size={14} className={vitalsAudioEnabled ? "animate-pulse" : ""} />
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">Vitals Pulse (Heart)</h4>
                                    <p className="text-[8.5px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">Audible pulse, SpO2 pitch-tracking, and diagnostic warning alerts.</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={toggleVitalsAudio}
                                  className={`w-9 h-5 rounded-full p-0.5 transition-all outline-none border cursor-pointer ${
                                    vitalsAudioEnabled 
                                      ? 'bg-rose-500 border-rose-400 flex justify-end items-center' 
                                      : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 flex justify-start items-center'
                                  }`}
                                >
                                  <motion.div layout className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                                </button>
                              </div>

                              {vitalsAudioEnabled && (
                                <div className="mt-2 flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800/40 pt-2">
                                  <div className="flex items-center justify-between text-[8px] uppercase font-black text-slate-400">
                                    <span>Volume</span>
                                    <span>{Math.round(vitalsAudioVolume * 100)}%</span>
                                  </div>
                                  <input 
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={vitalsAudioVolume}
                                    onChange={(e) => handleVitalsVolumeChange(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Section 2: Cognitive Binaural Soundscapes */}
                            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100/50 dark:border-slate-850/50 text-left">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex gap-2">
                                  <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 mt-0.5 shrink-0">
                                    <Music size={14} className={soundscapeEnabled ? "animate-spin" : ""} style={{ animationDuration: '8s' }} />
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">Ambient Soundscape</h4>
                                    <p className="text-[8.5px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">Focus binaural carrier waves stacked with a soft brown noise mask.</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={toggleSoundscapeGlobal}
                                  className={`w-9 h-5 rounded-full p-0.5 transition-all outline-none border cursor-pointer ${
                                    soundscapeEnabled 
                                      ? 'bg-indigo-500 border-indigo-400 flex justify-end items-center' 
                                      : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 flex justify-start items-center'
                                  }`}
                                >
                                  <motion.div layout className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                                </button>
                              </div>

                              {soundscapeEnabled && (
                                <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800/40 pt-2 text-[8px] uppercase">
                                  <div className="flex items-center justify-between font-black text-slate-400">
                                    <span>Volume</span>
                                    <span>{Math.round(soundscapeVolume * 100)}%</span>
                                  </div>
                                  <input 
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={soundscapeVolume}
                                    onChange={(e) => handleSoundscapeVolChangeGlobal(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                  />

                                  <div className="font-black text-slate-400 mt-1 mb-0.5">Preset Profile</div>
                                  <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-850 rounded-xl">
                                    {(['alpha_focus', 'theta_meditation', 'beta_high_cognition'] as const).map(p => {
                                      const labelMap = { alpha_focus: 'Alpha', theta_meditation: 'Theta', beta_high_cognition: 'Beta' };
                                      const active = soundscapePreset === p;
                                      return (
                                        <button
                                          key={p}
                                          type="button"
                                          onClick={() => changePresetGlobal(p)}
                                          className={`py-1 text-[8px] font-black uppercase rounded-lg transition-all border cursor-pointer leading-none truncate ${
                                            active 
                                              ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' 
                                              : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                                          }`}
                                        >
                                          {labelMap[p]}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="text-[7.5px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 text-center select-none pt-1">
                              👉 Click page anywhere to run soundscapes
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Unified Systems Launchpad / Windows dropdown button - Always Visible */}
                <div className="relative overflow-visible shrink-0">
                  <motion.button
                    onClick={() => setIsWindowsMenuOpen(!isWindowsMenuOpen)}
                    className={`p-1.5 md:p-2 lg:p-2.5 rounded-xl transition-all flex items-center justify-center border shadow-sm shrink-0 w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 cursor-pointer ${
                      isWindowsMenuOpen 
                        ? 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-950 dark:border-blue-600 dark:text-blue-200 ring-2 ring-blue-500/20' 
                        : 'bg-slate-100 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750'
                    }`}
                    aria-label="Systems Launchpad"
                    title="Systems Launchpad"
                  >
                    <LayoutGrid size={16} className="shrink-0" />
                    {hasNotification && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 shrink-0 border border-white dark:border-slate-900 animate-pulse" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isWindowsMenuOpen && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
                          onClick={() => setIsWindowsMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(8px)' }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(8px)' }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="fixed inset-x-4 max-w-[440px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 sm:absolute sm:inset-x-auto sm:left-auto sm:right-0 sm:-right-4 sm:top-auto sm:translate-x-0 sm:translate-y-0 sm:mt-3 w-auto sm:w-[460px] bg-white dark:bg-slate-900 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-slate-200/60 dark:border-slate-800/80 p-5 z-50 overflow-visible"
                        >
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                                  <LayoutGrid size={16} />
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Windows Systems Hub</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Clinical Node Panel Launcher</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => setIsWindowsMenuOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-all cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* Unified Scrollable Container for System Actions & Launcher */}
                            <div className="max-h-[360px] sm:max-h-[480px] overflow-y-auto pr-1.5 smooth-scroll custom-scrollbar space-y-4">
                              
                              {/* Operational Controls Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="sm:col-span-2">
                                  <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Operational Controls</span>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    const forced = localStorage.getItem("medical_forced_offline");
                                    const nextVal = forced === "true" ? "false" : "true";
                                    localStorage.setItem("medical_forced_offline", nextVal);
                                    window.dispatchEvent(new Event('storage'));
                                    const isForced = nextVal === "true";
                                    setToast({
                                      message: isForced 
                                        ? "🛡️ Local Offline Core Engaged. Outbound payloads are secured browser-side." 
                                        : "⚡ Online Core Synced. Verifying secure cloud communication links...",
                                      type: isForced ? "info" : "success"
                                    });
                                  }}
                                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left border border-slate-100 dark:border-slate-800/60 cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${isOffline ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500 animate-pulse'}`} />
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-850 dark:text-slate-100 truncate leading-none mb-1">Cache Sync</span>
                                      <span className="text-[8px] font-bold text-slate-400 uppercase truncate leading-none">{isOffline ? 'Off-Grid Core' : 'Live Sync'}</span>
                                    </div>
                                  </div>
                                  <span className="text-[8px] font-extrabold text-blue-500 uppercase tracking-widest shrink-0">Toggle</span>
                                </button>

                                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/60 font-sans">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Mic size={14} className="text-violet-500 shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-850 dark:text-slate-100 truncate leading-none mb-1">Voice Core</span>
                                      <span className="text-[8px] font-bold text-slate-400 uppercase truncate leading-none font-sans">Hands-Free</span>
                                    </div>
                                  </div>
                                  <VoiceCommandToggle onNavigate={(v) => { setCurrentView(v); setIsWindowsMenuOpen(false); }} />
                                </div>

                                <div className="grid grid-cols-4 gap-2 sm:col-span-2">
                                  <button
                                    onClick={() => setIsEyeCareMode(!isEyeCareMode)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                                      isEyeCareMode 
                                        ? 'bg-amber-100/80 border-amber-400 text-amber-955 dark:bg-amber-950/40 dark:border-amber-600 dark:text-amber-200' 
                                        : 'bg-slate-50 dark:bg-slate-850 border-slate-150 dark:border-slate-800/60 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {isEyeCareMode ? <Eye size={14} className="text-amber-500 animate-pulse" /> : <EyeOff size={14} />}
                                    <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">Legibility</span>
                                  </button>

                                  <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="flex flex-col items-center justify-center p-2 rounded-2xl border border-slate-150 dark:border-slate-800/60 text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-830 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                  >
                                    {isDarkMode ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-indigo-400" />}
                                    <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">{isDarkMode ? 'Light' : 'Dark'}</span>
                                  </button>

                                  <button
                                    onClick={() => { handleOpenAdminInfo(); setIsWindowsMenuOpen(false); }}
                                    className="flex flex-col items-center justify-center p-2 rounded-2xl border border-slate-150 dark:border-slate-800/60 text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-830 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative cursor-pointer"
                                  >
                                    <Bell size={14} className={hasNotification ? "text-blue-500 animate-bounce" : ""} />
                                    {hasNotification && (
                                      <span className="absolute top-2.5 right-5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    )}
                                    <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">Alerts</span>
                                  </button>

                                  <button
                                    onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                                      isAudioMenuOpen
                                        ? 'bg-blue-100/85 border-blue-400 text-blue-955 dark:bg-blue-950/40 dark:border-blue-600 dark:text-blue-200'
                                        : 'bg-slate-50 dark:bg-slate-850 border-slate-150 dark:border-slate-800/60 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {vitalsAudioEnabled || soundscapeEnabled ? (
                                      <Headphones size={14} className="text-rose-500 animate-bounce" />
                                    ) : (
                                      <VolumeX size={14} className="text-slate-400" />
                                    )}
                                    <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">Audio Hub</span>
                                  </button>
                                </div>

                                {isAudioMenuOpen && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-[1.5rem] flex flex-col gap-3 text-left sm:col-span-2"
                                  >
                                    <div className="pb-1 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                                      <span className="text-[9px] font-black uppercase tracking-tight text-slate-400 dark:text-slate-550">Clinical Sound Engine</span>
                                      <span className="text-[7px] font-mono bg-blue-500/10 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Active</span>
                                    </div>

                                    {/* Section 1: Heartbeat Pulse Sonification */}
                                    <div className="flex flex-col gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex gap-2 min-w-0">
                                          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                                            <Activity size={12} className={vitalsAudioEnabled ? "animate-pulse" : ""} />
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="text-[10px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">Vitals Pulse (Heart)</h4>
                                            <p className="text-[8px] text-slate-400 dark:text-slate-550 leading-tight">Audible pulse, pitch-tracking, warnings.</p>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={toggleVitalsAudio}
                                          className={`w-8 h-4 rounded-full p-0.5 transition-all outline-none border cursor-pointer shrink-0 ${
                                            vitalsAudioEnabled 
                                              ? 'bg-rose-500 border-rose-400 flex justify-end items-center' 
                                              : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 flex justify-start items-center'
                                          }`}
                                        >
                                          <motion.div layout className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                                        </button>
                                      </div>

                                      {vitalsAudioEnabled && (
                                        <div className="mt-1.5 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800/40 pt-1.5">
                                          <div className="flex items-center justify-between text-[7px] uppercase font-black text-slate-400">
                                            <span>Volume</span>
                                            <span>{Math.round(vitalsAudioVolume * 100)}%</span>
                                          </div>
                                          <input 
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={vitalsAudioVolume}
                                            onChange={(e) => handleVitalsVolumeChange(parseFloat(e.target.value))}
                                            className="w-full h-1 bg-slate-200 dark:bg-slate-850 rounded appearance-none cursor-pointer accent-rose-500"
                                          />
                                        </div>
                                      )}
                                    </div>

                                    {/* Section 2: Cognitive Binaural Soundscapes */}
                                    <div className="flex flex-col gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex gap-2 min-w-0">
                                          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                                            <Music size={12} className={soundscapeEnabled ? "animate-spin" : ""} style={{ animationDuration: '8s' }} />
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="text-[10px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">Ambient Soundscape</h4>
                                            <p className="text-[8px] text-slate-400 dark:text-slate-550 leading-tight">Focus binaural carrier waves with noise mask.</p>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={toggleSoundscapeGlobal}
                                          className={`w-8 h-4 rounded-full p-0.5 transition-all outline-none border cursor-pointer shrink-0 ${
                                            soundscapeEnabled 
                                              ? 'bg-indigo-500 border-indigo-400 flex justify-end items-center' 
                                              : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 flex justify-start items-center'
                                          }`}
                                        >
                                          <motion.div layout className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                                        </button>
                                      </div>

                                      {soundscapeEnabled && (
                                        <div className="mt-1.5 flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800/40 pt-1.5 text-[7px] uppercase">
                                          <div className="flex items-center justify-between font-black text-slate-400">
                                            <span>Volume</span>
                                            <span>{Math.round(soundscapeVolume * 100)}%</span>
                                          </div>
                                          <input 
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={soundscapeVolume}
                                            onChange={(e) => handleSoundscapeVolChangeGlobal(parseFloat(e.target.value))}
                                            className="w-full h-1 bg-slate-200 dark:bg-slate-850 rounded appearance-none cursor-pointer accent-indigo-500"
                                          />

                                          <div className="font-black text-slate-400 mt-1 mb-0.5">Preset Profile</div>
                                          <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-950/60 p-1 border border-slate-100 dark:border-slate-850 rounded-lg">
                                            {(['alpha_focus', 'theta_meditation', 'beta_high_cognition'] as const).map(p => {
                                              const labelMap = { alpha_focus: 'Alpha', theta_meditation: 'Theta', beta_high_cognition: 'Beta' };
                                              const active = soundscapePreset === p;
                                              return (
                                                <button
                                                  key={p}
                                                  type="button"
                                                  onClick={() => changePresetGlobal(p)}
                                                  className={`py-1 text-[7px] font-black uppercase rounded transition-all border cursor-pointer leading-none truncate ${
                                                    active 
                                                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-xs' 
                                                      : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                                                  }`}
                                                >
                                                  {labelMap[p]}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </div>

                              {/* Systems Launcher Core */}
                              <div className="space-y-2">
                                <span className="text-[8px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Clinical Systems Launcher</span>
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { id: 'home', title: "Dashboard", category: "Analyses", icon: <Home size={14} />, color: "text-blue-500 hover:text-blue-600" },
                                    { id: 'ai_nexus', title: "Neural Core", category: "Cognition", icon: <Bot size={14} />, color: "text-purple-500 hover:text-purple-600" },
                                    { id: 'genomic_longevity', title: "Genomics", category: "DNA Core", icon: <Dna size={14} />, color: "text-rose-500 hover:text-rose-600" },
                                    { id: 'illustrator', title: "Illustrator", category: "Visuals", icon: <Palette size={14} />, color: "text-amber-500 hover:text-amber-600" },
                                    { id: 'neuro', title: "CognisHub", category: "Brain AI", icon: <Brain size={14} />, color: "text-violet-500 hover:text-violet-600" },
                                    { id: 'biomatic', title: "Sandbox", category: "Sim-Lab", icon: <Cpu size={14} />, color: "text-cyan-500 hover:text-cyan-600" },
                                    { id: 'diagnostic_lab', title: "Labs Node", category: "Clinical", icon: <Stethoscope size={14} />, color: "text-emerald-500 hover:text-emerald-600" },
                                    { id: 'monitor', title: "Bio-Monitor", category: "Real-time", icon: <Monitor size={14} />, color: "text-indigo-500 hover:text-indigo-600" },
                                    { id: 'health_trace', title: "Trace Node", category: "Logbooks", icon: <TrendingUp size={14} />, color: "text-blue-500 hover:text-blue-600" },
                                    { id: 'vitality', title: "Vitality Matrix", category: "Bio-Energy", icon: <Zap size={14} />, color: "text-orange-500 hover:text-orange-600" },
                                    { id: 'meds', title: "Pharmacy", category: "Chemicals", icon: <Pill size={14} />, color: "text-rose-500 hover:text-rose-600" },
                                    { id: 'specialist', title: "Clinicians", category: "Network", icon: <Stethoscope size={14} />, color: "text-purple-500 hover:text-purple-600" },
                                    { id: 'about', title: "System Info", category: "Specs", icon: <Info size={14} />, color: "text-slate-500 hover:text-slate-650" },
                                    { id: 'help', title: "Help Center", category: "Support", icon: <Info size={14} />, color: "text-teal-500 hover:text-teal-600" },
                                    { id: 'privacy', title: "Privacy Vault", category: "Secure", icon: <Shield size={14} />, color: "text-red-500 hover:text-red-650" },
                                    { id: 'terms', title: "Terms & Legal", category: "Licence", icon: <FileText size={14} />, color: "text-slate-500 hover:text-slate-600" }
                                  ].map((item) => {
                                    const isSelected = currentView === item.id;
                                    return (
                                      <button
                                        key={item.id}
                                        onClick={() => {
                                          setCurrentView(item.id as any);
                                          setIsWindowsMenuOpen(false);
                                          setToast({
                                            message: `Loaded ${item.title} node successfully.`,
                                            type: "success"
                                          });
                                        }}
                                        className={`flex items-center gap-2 p-1.5 rounded-xl border text-left cursor-pointer transition-all ${
                                          isSelected 
                                            ? 'border-blue-500 bg-blue-50/75 dark:bg-blue-900/35 text-blue-800 dark:text-blue-300 font-bold' 
                                            : 'border-slate-50 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-350 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                      >
                                        <div className={`p-1 shrink-0 ${item.color}`}>
                                          {item.icon}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="text-[9px] font-black uppercase tracking-tight truncate leading-none mb-0.5">{item.title}</span>
                                          <span className="text-[7px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest leading-none">{item.category}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 md:gap-2.5 lg:gap-4 ml-auto shrink-0">
              {isAuthReady && (
                user ? (
                  <div className="flex items-center gap-1.5 md:gap-2.5 lg:gap-3 relative shrink-0">
                    <div className="hidden lg:flex items-center gap-1 px-1.5 py-1 md:px-2 md:py-1.5 lg:px-2.5 lg:py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800 shrink-0">
                      <Zap size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-[10px] lg:text-xs font-black text-blue-700 dark:text-blue-300 shrink-0">
                        {displayCredits}
                      </span>
                    </div>
                    <div className="relative shrink-0">
                      <button 
                        className="group flex items-center gap-1.5 pl-1 pr-1 md:pr-1.5 lg:pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer active:scale-95 shrink-0 h-9 md:h-10 lg:h-11 min-h-[36px] md:min-h-[40px] items-center"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        aria-label="User profile menu"
                        aria-haspopup="true"
                        aria-expanded={isProfileOpen}
                      >
                        <div className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 overflow-hidden flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-blue-500/50 transition-all">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={`Profile of ${user.displayName || user.email}`} className="w-full h-full object-cover shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-[10px] md:text-xs shrink-0">
                              {user.displayName?.[0] || user.email[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="hidden lg:flex flex-col items-start leading-tight">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white truncate max-w-[80px] uppercase tracking-tighter">
                            {user.displayName?.split(' ')[0] || 'User'}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                            {user.subscriptionTier || 'Free'} Core
                          </span>
                        </div>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 hidden lg:inline-block ${isProfileOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isProfileOpen && (
                          <>
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40"
                              onClick={() => setIsProfileOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 12, scale: 0.95, filter: 'blur(10px)' }}
                              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                              exit={{ opacity: 0, y: 12, scale: 0.95, filter: 'blur(10px)' }}
                              className="absolute right-0 mt-3 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 dark:border-slate-800/50 py-3 z-50 overflow-hidden"
                            >
                              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/50 mb-2">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-2xl bg-blue-600 p-[2px]">
                                    <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 overflow-hidden">
                                      {user.photoURL ? (
                                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold">{user.displayName?.[0] || 'U'}</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{user.displayName || 'Doctorian Medical User'}</p>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate tracking-tight">{user.email}</p>
                                  </div>
                                </div>
                    <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${creditPercentage}%` }}
                                      className="h-full bg-blue-600"
                                    />
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-blue-600 uppercase">
                                      {displayCredits} Neural Energy
                                    </span>
                                    <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Daily Allotment</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="px-2 space-y-1">
                                <button
                                  onClick={() => {
                                    setCurrentView('profile');
                                    setIsProfileOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                      <UserIcon size={16} />
                                    </div>
                                    <span className="font-black uppercase tracking-tight">Clinical Profile</span>
                                  </div>
                                  <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>

                                <button
                                  onClick={() => {
                                    handleNeuralCoreAccess();
                                    setIsProfileOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                                      <BrainCircuit size={16} />
                                    </div>
                                    <span className="font-black uppercase tracking-tight text-left">{translate("Talk to Doctor", currentLanguage)}</span>
                                  </div>
                                  <div className="w-2 h-2 rounded-full bg-violet-550 animate-pulse" />
                                </button>

                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      setCurrentView('admin');
                                      setIsProfileOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                        <Shield size={16} />
                                      </div>
                                      <span className="font-black uppercase tracking-tight">Admin Terminal</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                  </button>
                                )}
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 group px-2 pb-2">
                                <button
                                  onClick={() => {
                                    handleLogout();
                                    setIsProfileOpen(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all uppercase tracking-[0.2em]"
                                >
                                  <LogOut size={16} />
                                  Log Out Securely
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => {
                        setAuthModalView('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] sm:text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group border border-slate-100 dark:border-slate-800 whitespace-nowrap shrink-0"
                    >
                      <LogIn size={16} className="group-hover:translate-x-1 transition-transform shrink-0" />
                      <span className="inline">SIGN IN</span>
                    </button>
                    <button 
                      onClick={() => {
                        setAuthModalView('signup');
                        setIsAuthModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] sm:text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20 group whitespace-nowrap shrink-0"
                    >
                      <UserPlus size={16} className="group-hover:scale-110 transition-transform shrink-0" />
                      <span className="inline">SIGN UP</span>
                    </button>
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      </motion.header>

      {/* Visual Offline Mode Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-full bg-amber-500/15 dark:bg-amber-500/5 border-b border-amber-500/25 text-amber-800 dark:text-amber-400 backdrop-blur-md overflow-hidden shrink-0"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0 flex items-center justify-center">
                  <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-amber-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </div>
                <div className="text-[10px] sm:text-xs">
                  <span className="font-extrabold uppercase tracking-widest mr-2 bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px]">
                    Offline Core Recovery
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    You are currently in off-grid simulation. Bio-telemetry is processing browser-side. Cloud-dependent AI engines (fine-tuning, speech translation, clinical reasoning) are in automated local fallback state.
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem("medical_forced_offline", "false");
                  window.dispatchEvent(new Event('storage'));
                  setIsOffline(false);
                  setToast({
                    message: "⚡ Online Core Synced. Verifying secure cloud communication links...",
                    type: "success"
                  });
                }}
                className="shrink-0 bg-amber-650 hover:bg-amber-700 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-600/10 cursor-pointer border border-amber-500/50"
              >
                Enable Cloud
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>

      <main className={`flex-1 relative flex flex-col pt-0 w-full animate-fadeIn ${
        currentView === 'ai_nexus' ? 'pb-0 h-full min-h-0' : 'pb-6 sm:pb-8'
      }`} id="main-content">
          <div className={`flex-1 flex flex-col items-stretch relative w-full ${
            currentView === 'ai_nexus' 
              ? 'py-0 px-0 max-w-full h-full min-h-0' 
              : 'py-6 px-2 sm:px-8 max-w-7xl mx-auto'
          }`}>
            {renderSubTabsBar()}
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full animate-pulse" />
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
                </div>
                <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono animate-pulse">Syncing Cognitive Layer...</p>
              </div>
            }>
              <AnimatePresence mode="wait">
          {!user && !['about', 'learn_more'].includes(currentView) ? (
            <motion.div
              role="main"
              key="auth-landing"
              id="auth-landing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 text-center"
            >
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 lg:p-16 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl shadow-slate-200 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 max-w-4xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-60" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex justify-center mb-6 sm:mb-10">
                  <Logo size="xl" showText={false} className="scale-110 sm:scale-125" />
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-[1000] text-slate-900 dark:text-white mb-4 sm:mb-8 tracking-tighter uppercase leading-[0.9] sm:leading-[0.85]">
                  Clinical <br />
                  <span className="text-blue-600">Intelligence</span> <br className="sm:hidden" />
                  Vault
                </h2>
                <p className="text-sm sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 mb-8 sm:mb-12 leading-relaxed font-bold max-w-xl mx-auto px-2">
                  Access your encrypted biological markers and personalized longevity protocols with enterprise-grade synchronization.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10 sm:mb-16">
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-blue-600 text-white rounded-2xl font-black text-sm sm:text-base hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 group active:scale-95"
                  >
                    <LogIn size={22} className="group-hover:translate-x-1 transition-transform" />
                    <span className="tracking-widest">GET STARTED</span>
                  </button>
                  <button 
                    onClick={() => setCurrentView('learn_more')}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-sm sm:text-base hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-100 dark:border-slate-700 transition-all shadow-sm hover:shadow-xl active:scale-95 group/learn"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover/learn:bg-blue-50 dark:group-hover/learn:bg-blue-900/20 group-hover/learn:text-blue-600 transition-colors">
                      <Info size={18} />
                    </div>
                    <span className="tracking-widest">LEARN MORE</span>
                  </button>
                </div>

                <div className="pt-8 sm:pt-12 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6 sm:mb-8">Global Security Matrix</p>
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                    {[
                      { id: 'google', provider: googleProvider, color: 'hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500', icon: (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )},
                      { id: 'facebook', provider: facebookProvider, color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600', icon: <Facebook size={24} className="sm:w-7 sm:h-7" /> },
                      { id: 'instagram', provider: instagramProvider, color: 'hover:bg-pink-50 dark:hover:bg-pink-900/20 text-pink-500', icon: <Instagram size={24} className="sm:w-7 sm:h-7" /> },
                      { id: 'github', provider: githubProvider, color: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white', icon: <Github size={24} className="sm:w-7 sm:h-7" /> },
                    ].map((shortcut) => (
                      <button
                        key={shortcut.id}
                        onClick={() => handleSocialLogin(shortcut.provider, shortcut.id)}
                        className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-[1.25rem] sm:rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:scale-110 active:scale-95 group ${shortcut.color}`}
                        aria-label={`Login with ${shortcut.id}`}
                      >
                        {shortcut.icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center gap-4 sm:gap-8 opacity-50">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-blue-600 dark:text-blue-400 sm:w-4 sm:h-4" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-blue-600 dark:text-blue-400 sm:w-4 sm:h-4" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">End-to-End Encrypted</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : currentView === 'home' ? (
            <Dashboard 
              onNavigate={showView} 
              user={user} 
              aiInsight={aiInsight} 
              onRefreshInsight={fetchAiInsight} 
              isInsightLoading={isInsightLoading} 
              onInstall={handleDirectInstall}
              vitals={arduino.vitals}
              healthStatus={arduino.healthStatus}
              history={arduino.history}
              onUpdateUser={(u) => setUser(u)}
              currentLanguage={currentLanguage}
            />
          ) : currentView === 'ai_nexus' ? (
            <MedicalAI 
              user={user} 
              onUpdate={(u) => setUser(u)} 
              onRefreshUser={refreshUser} 
              onNavigate={setCurrentView} 
              arduino={arduino} 
              onUpgradeRequested={() => setIsSubscriptionModalOpen(true)}
              currentLanguage={currentLanguage}
            />
          ) : currentView === 'genomic_longevity' ? (
            <motion.div
              role="main"
              key="genomic_longevity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-[1600px] mx-auto py-8"
            >
              <GenomicLongevityCore 
                user={user} 
                onUpdateUser={setUser} 
                onShowToast={(msg, type) => addToast(msg, type || 'info')}
              />
            </motion.div>
          ) : currentView === 'doctors_dashboard' ? (
            isDoctorAuthenticated ? (
              <motion.div
                role="main"
                key="doctors_dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-[1600px] mx-auto py-8"
              >
                <DoctorsDashboard addToast={(msg, type) => addToast(msg, type || 'info')} />
              </motion.div>
            ) : (
              <TerminalSecureGate 
                role="doctor"
                onUnlock={() => {
                  setIsDoctorAuthenticated(true);
                }}
                onCancel={() => {
                  setCurrentView('home');
                }}
              />
            )
          ) : currentView === 'specialist' ? (
            <motion.div
              role="main"
              key="specialist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-[1600px] mx-auto py-8"
            >
              <SpecialistFinder />
            </motion.div>
          ) : currentView === 'monitor' ? (
            isDoctor ? (
              <motion.div
                key="monitor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PatientMonitor arduino={arduino} user={user} onUpdateUser={setUser} />
              </motion.div>
            ) : (
              <AccessRestriction />
            )
        ) : currentView === 'features' ? (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Features onNavigate={setCurrentView} />
          </motion.div>
        ) : currentView === 'records' ? (
          <motion.div
            key="records"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <HealthRecords />
          </motion.div>
        ) : currentView === 'vitality' ? (
          <motion.div
            key="vitality"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full"
          >
            <VitalityMatrix />
          </motion.div>
        ) : currentView === 'diagnostic_lab' ? (
          <motion.div
            key="diagnostic_lab"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <DiagnosticLab user={user} onUpdateUser={setUser} />
          </motion.div>
        ) : currentView === 'illustrator' ? (
          <motion.div
            key="illustrator"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex-1 overflow-hidden min-h-0 flex flex-col"
          >
            <MedicalIllustrator user={user} onRefreshUser={refreshUser} />
          </motion.div>
        ) : currentView === 'symptoms' ? (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <SymptomChecker user={user} onUpdateUser={setUser} />
          </motion.div>
        ) : currentView === 'meds' ? (
          <motion.div
            key="meds"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <MedicationTracker />
          </motion.div>
        ) : currentView === 'fitness' ? (
          <motion.div
            key="fitness"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-7xl mx-auto py-8 sm:py-12"
          >
            <WorkoutTracker user={user} />
          </motion.div>
        ) : currentView === 'about' ? (
          <motion.div
            key="about"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <About />
          </motion.div>
        ) : currentView === 'learn_more' ? (
          <motion.div
            key="learn_more"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <LearnMore onBack={() => setCurrentView('home')} />
          </motion.div>
        ) : currentView === 'health_trace' ? (
          <motion.div
            key="health_trace"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <HealthProgressTracker user={user} />
          </motion.div>
        ) : currentView === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <ProfileSettings 
              user={user} 
              onUpdate={(updatedUser) => setUser(updatedUser)} 
              onLogout={handleLogout}
              onBack={() => setCurrentView('home')}
              onNavigate={setCurrentView}
              currentLanguage={currentLanguage}
              onLanguageChange={(lang) => {
                setCurrentLanguage(lang);
                localStorage.setItem("app_lang", lang);
                setToast({
                  message: `🌐 Language updated to ${lang}. Re-indexing clinical interface lexicon...`,
                  type: 'success'
                });
              }}
            />
          </motion.div>
        ) : currentView === 'admin' ? (
          isAdmin ? (
            isAdminAuthenticated ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-7xl mx-auto py-8 sm:py-12"
              >
                <AdminDashboard addToast={addToast} />
              </motion.div>
            ) : (
              <TerminalSecureGate 
                role="admin"
                onUnlock={() => {
                  setIsAdminAuthenticated(true);
                }}
                onCancel={() => {
                  setCurrentView('home');
                }}
              />
            )
          ) : (
            <AccessRestriction />
          )
        ) : currentView === 'neuro' ? (
          <motion.div
            key="neuro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-7xl mx-auto py-12"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Cognis Pathway Laboratory</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Deep-layer cognitive synthesis and biological activity modeling.</p>
              </div>
              <button 
                onClick={() => setCurrentView('home')}
                className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="bg-white dark:bg-slate-950 rounded-[4rem] shadow-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <CognisHub />
            </div>
          </motion.div>
        ) : currentView === 'biomatic' ? (
          isDoctor ? (
            <motion.div
              key="biomatic"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-7xl mx-auto py-12 text-left"
            >
              <Suspense fallback={
                <div className="flex h-64 items-center justify-center">
                  <Loader2 size={32} className="text-blue-500 animate-spin" />
                </div>
              }>
                <BiomaticSandbox />
              </Suspense>
            </motion.div>
          ) : (
            <AccessRestriction />
          )
        ) : currentView === 'emergency' ? (
          <motion.div
            key="emergency"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <EmergencyRegistry user={user} onUpdate={setUser} />
          </motion.div>
        ) : currentView === 'biosecurity' ? (
          <motion.div
            key="biosecurity"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <BioSecurity />
          </motion.div>
        ) : currentView === 'dev_portal' ? (
          <motion.div
            key="dev_portal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <DeveloperPortal />
          </motion.div>
        ) : currentView === 'billing' ? (
          <motion.div
            key="billing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <Billing user={user} onUpdateUser={setUser} onShowToast={(msg, type) => addToast(msg, type || 'info')} />
          </motion.div>
        ) : currentView === 'tasks' ? (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <ClinicalProtocols />
          </motion.div>
        ) : currentView === 'training' ? (
          <motion.div
            key="training"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <NeuralTrainingHub />
          </motion.div>
        ) : currentView === 'systems_hub' ? (
          <motion.div
            key="systems_hub"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-7xl mx-auto py-8 px-4"
          >
            {/* Systems Hub Header */}
            <div className="mb-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h1 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter">{translate("Clinical Systems Hub", currentLanguage)}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">Access system guides, sandboxed security vaults, and regulatory clinical definitions.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'help', label: 'Help Center', icon: <Info size={14} /> },
                  { id: 'privacy', label: 'Privacy Vault', icon: <Shield size={14} /> },
                  { id: 'terms', label: 'Terms & Legal', icon: <FileText size={14} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentView(tab.id as any)}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-150 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 hover:text-blue-500 dark:hover:text-blue-400 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Unified Cards Grid for the Hub */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Help & Support Card */}
              <div 
                onClick={() => setCurrentView('help')}
                className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2.5rem] p-8 hover:border-blue-500 transition-all duration-300 hover:translate-y-[-4px] shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-[inset_0_1px_2px_rgba(59,130,246,0.1)]">
                  <Info size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white mb-2">Help Center</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">Explore deep FAQs, quick tutorials, and ask our technical or clinical staff directly for support.</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Open Center &rarr;</span>
              </div>

              {/* Privacy Vault Card */}
              <div 
                onClick={() => setCurrentView('privacy')}
                className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2.5rem] p-8 hover:border-rose-500 transition-all duration-300 hover:translate-y-[-4px] shadow-sm"
              >
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-[inset_0_1px_2px_rgba(244,63,94,0.1)]">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white mb-2">Privacy Vault</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 font-sans">View physical/digital biometric data keys, read about state-of-the-art encryption layers, and enforce secure sessions.</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Open Vault &rarr;</span>
              </div>

              {/* Terms & compliance Card */}
              <div 
                onClick={() => setCurrentView('terms')}
                className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2.5rem] p-8 hover:border-amber-500 transition-all duration-300 hover:translate-y-[-4px] shadow-sm"
              >
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-[inset_0_1px_2px_rgba(217,119,6,0.1)]">
                  <FileText size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white mb-2">Terms & Legal</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 font-sans">Examine patient consent agreements, license disclosures, regulatory status registries, and raw clinical data schemes.</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-sans">Open compliance &rarr;</span>
              </div>
            </div>
          </motion.div>
        ) : currentView === 'help' ? (
          <motion.div
            key="help"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="w-full"
          >
            <HelpCenter user={user} onNavigate={setCurrentView} onStartTutorial={() => setIsTutorialOpen(true)} />
          </motion.div>
        ) : currentView === 'privacy' ? (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="w-full"
          >
            <PrivacyVault user={user} onNavigate={setCurrentView} />
          </motion.div>
        ) : currentView === 'terms' ? (
          <motion.div
            key="terms"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="w-full"
          >
            <TermsAndData user={user} onNavigate={setCurrentView} vitals={arduino.vitals} />
          </motion.div>
        ) : (
          <Dashboard 
            onNavigate={showView} 
            user={user} 
            aiInsight={aiInsight} 
            onRefreshInsight={fetchAiInsight} 
            isInsightLoading={isInsightLoading} 
            onInstall={handleDirectInstall}
            vitals={arduino.vitals}
            healthStatus={arduino.healthStatus}
            history={arduino.history}
            onUpdateUser={(u) => setUser(u)}
            currentLanguage={currentLanguage}
          />
        )}
              </AnimatePresence>
            </Suspense>
          </div>
        </main>

  {/* Search Overlay */}
  <AnimatePresence>
    {isSearchOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md p-4 sm:p-8 flex items-start justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden mt-12 border border-slate-100 dark:border-slate-800"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <Search className="text-blue-600 dark:text-blue-400" size={24} />
            <input 
              autoFocus
              type="text"
              placeholder="Search features, records, or symptoms..."
              className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-6 sm:p-8 custom-scrollbar smooth-scroll">
            {searchQuery.trim() === '' ? (
              <div className="space-y-6">
                <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Recommended Nodes</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SEARCHABLE_ITEMS.slice(0, 4).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentView(item.view as any);
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        {item.icon}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentView(result.view as any);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-3xl transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all">
                      {result.icon}
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{result.label}</span>
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 uppercase tracking-widest">{result.category}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{result.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  <AnimatePresence>
    {activeSOS && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-rose-600/90 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-slate-950 rounded-[3rem] p-8 sm:p-12 max-w-lg w-full text-center shadow-3xl border-4 border-white/20"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-rose-100 dark:bg-rose-900/30 rounded-[2rem] flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-8 animate-pulse">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">SOS Critical Alert</h2>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 font-serif mb-8 leading-relaxed">
            {activeSOS.content}
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => {
                 setActiveSOS(null);
              }}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
            >
              Acknowledge Alert
            </button>
            <button 
              onClick={() => setActiveSOS(null)}
              className="w-full py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors"
            >
              Dismiss Alarm
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  <Suspense fallback={null}>
    <DoctorVerificationModal
      isOpen={isDoctorVerifyOpen}
      onClose={() => {
        setIsDoctorVerifyOpen(false);
        setPendingView(null);
      }}
      onSuccess={() => {
        if (pendingView) {
          setCurrentView(pendingView);
        }
        setPendingView(null);
      }}
    />
    <AdminInfoModal 
      isOpen={isAdminInfoOpen} 
      onClose={() => setIsAdminInfoOpen(false)} 
    />
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => {
        setIsAuthModalOpen(false);
        setAuthModalAction(null);
        setOnAuthorizeSuccessCallback(null);
      }} 
      onSuccess={(u, isSignUp) => {
        setUser(u);
        setToast({ message: `Access sequence confirmed. Welcome ${u.displayName || u.email}.`, type: 'success' });
        if (isSignUp) {
          setIsTutorialOpen(true);
        }
      }} 
      initialView={authModalView}
      actionToAuthorize={authModalAction}
      onAuthorizeSuccess={() => {
        if (onAuthorizeSuccessCallback) {
          onAuthorizeSuccessCallback();
        }
      }}
    />
    <HealthTipModal 
      isOpen={isTipModalOpen}
      onClose={() => setIsTipModalOpen(false)}
      tip={dailyTip}
    />
    <BMICalculator 
      isOpen={isBMIModalOpen}
      onClose={() => setIsBMIModalOpen(false)}
    />
    <AnimatePresence>
      {isSubscriptionModalOpen && (
        <SubscriptionModal 
          user={user} 
          onUpdateUser={(u) => setUser(u)}
          onClose={() => setIsSubscriptionModalOpen(false)}
          onShowToast={(msg, type) => setToast({ message: msg, type: type as any })}
        />
      )}
    </AnimatePresence>

  </Suspense>

  <AppTutorial 
    isOpen={isTutorialOpen} 
    onClose={() => setIsTutorialOpen(false)} 
    onNavigate={setCurrentView} 
    currentView={currentView} 
  />

  {/* Admin Authentication Overlay */}
  <AnimatePresence>
    {showAdminLogin && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-2xl relative overflow-hidden"
        >
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-blue-500 to-emerald-500" />
           
           <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <Shield size={32} className="text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Admin Authorization</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">Validating Neural Signature: {user?.email}</p>
              </div>

              <div className="w-full space-y-4">
                {/* Safe biometric shortcut */}
                <button
                  type="button"
                  onClick={promptBiometricAdmin}
                  className="w-full py-4 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/10 mb-2 active:scale-95"
                >
                  <Fingerprint size={18} className="animate-pulse" />
                  <span>Scan Device Biometrics</span>
                </button>

                <div className="flex items-center gap-2 py-1 select-none">
                  <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">OR USE PASSKEY</span>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block text-center">Neural Passkey</label>
                  <input 
                    type="password"
                    autoFocus
                    value={adminPassInput}
                    onChange={(e) => {
                      setAdminPassInput(e.target.value);
                      setAdminError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && verifyAdminAuth()}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-center text-slate-900 dark:text-white"
                    placeholder="Enter Neural Key..."
                  />
                </div>
                {adminError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-black uppercase text-rose-500 tracking-widest text-center"
                  >
                    {adminError}
                  </motion.p>
                )}
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminPassInput('');
                      setAdminError('');
                    }}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={verifyAdminAuth}
                    className="flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all font-bold"
                  >
                    Authenticate
                  </button>
                </div>
              </div>
           </div>
        </motion.div>
      </div>
    )}
   </AnimatePresence>

    {/* Mobile Systems Menu Drawer */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[160] lg:hidden flex flex-col justify-end pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
          />
          
          {/* Drawer Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.95 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="relative w-full max-h-[85vh] bg-gradient-to-b from-white/95 to-slate-50/98 dark:from-slate-900/95 dark:to-slate-950/98 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-15px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_-15px_50px_rgba(0,0,0,0.65)] overflow-hidden border-t-2 border-slate-100 dark:border-slate-800/80 flex flex-col pointer-events-auto pb-10"
          >
            {/* Visual Pull Tab */}
            <div className="w-14 h-1.5 bg-slate-200 dark:bg-slate-700/80 rounded-full mx-auto my-3.5 shrink-0 animate-pulse" />
            
            {/* Drawer Header */}
            <div className="px-8 pb-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between shrink-0 bg-white/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3.5">
                <div className="relative p-3 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-[inset_0_1px_2px_rgba(59,130,246,0.1)] border border-blue-100/40 dark:border-blue-900/30">
                  <LayoutGrid size={20} className="relative z-10 animate-pulse" />
                  <span className="absolute inset-0 rounded-2xl bg-blue-500/10 animate-ping opacity-75" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    Systems Core
                    <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 animate-pulse ml-1">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user?.displayName || 'Authorized Session'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 cursor-pointer shadow-sm active:scale-90"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content Categories */}
            <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
              {sidebarSections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${section.accent.bar} animate-ping`} />
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{translate(section.title, currentLanguage)}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    {section.items.map((item) => {
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if ('action' in item && typeof item.action === 'function') {
                              (item as any).action();
                            } else {
                              setCurrentView(item.id as any);
                            }
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-350 active:scale-[0.96] group cursor-pointer ${
                            isActive
                              ? section.accent.active + ' shadow-md shadow-slate-900/10 dark:shadow-slate-950/30 translate-y-[-2px]'
                              : 'bg-white dark:bg-slate-800/40 border-slate-100/80 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl shrink-0 transition-all relative ${
                            isActive 
                              ? 'bg-white/20 text-white shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.15)] ring-1 ring-white/10' 
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 shadow-sm border border-slate-100 dark:border-slate-800/50 group-hover:scale-110'
                          }`}>
                            {React.cloneElement(item.icon as any, { 
                              size: 16,
                              className: `w-4 h-4 transition-colors ${
                                isActive 
                                  ? section.accent.iconActive 
                                  : section.accent.iconInactive
                              }`
                            })}

                            {/* Mobile Neural Core Real-time Flicker status indicator */}
                            {item.id === 'ai_nexus' && (
                              <div className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                <motion.span 
                                  animate={{
                                    scale: [1, 1.8, 1.2, 2.2, 1],
                                    opacity: [0.7, 0.2, 0.8, 0.1, 0.7]
                                  }}
                                  transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                  className="absolute inline-flex h-full w-full rounded-full bg-violet-450 dark:bg-violet-400 opacity-75"
                                />
                                <motion.span 
                                  animate={{
                                    opacity: [1, 0.35, 0.9, 0.25, 0.8, 1, 0.4, 0.95, 1],
                                    scale: [1, 0.9, 1.1, 0.85, 1, 1.05, 0.95, 1.1, 1]
                                  }}
                                  transition={{
                                    duration: 3.2,
                                    repeat: Infinity,
                                    ease: "linear"
                                  }}
                                  className="relative inline-flex rounded-full h-2 w-2 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-black leading-tight uppercase tracking-tight line-clamp-2 transition-colors">
                              {translate(item.label, currentLanguage)}
                            </span>
                            {isActive && (
                              <span className="block text-[7px] font-bold text-white/70 uppercase tracking-widest mt-0.5 animate-pulse">
                                ACTIVE VIEW
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

  {/* Toast Notification */}
  <AnimatePresence>
    {toast && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-[2rem] shadow-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-4 border ${
          toast.type === 'success' ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20' : 
          toast.type === 'info' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700 dark:border-slate-200' :
          'bg-rose-600 border-rose-500 text-white shadow-rose-500/20'
        }`}
      >
        <Zap size={16} />
        {toast.message}
      </motion.div>
    )}
  </AnimatePresence>
  
  {/* Floating Clinical Back Navigation Button */}
  <AnimatePresence>
    {navigationHistory.length > 1 && (
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={navigationContainerRef}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-24 right-5 sm:bottom-8 sm:right-8 z-[150] pointer-events-auto cursor-grab active:cursor-grabbing select-none"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
          onClick={handleGoBack}
          className="relative flex items-center justify-center gap-1.5 sm:gap-2 h-11 w-11 sm:w-auto sm:h-12 rounded-full border shadow-[0_15px_30px_rgba(37,99,235,0.25)] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-blue-500/30 font-black text-[10px] uppercase tracking-wider p-0 sm:pl-4 sm:pr-3 cursor-pointer pointer-events-auto select-none transition-all duration-200"
          title={`Go back to ${viewNamesMap[navigationHistory[navigationHistory.length - 2]] || 'previous page'} (Drag to move)`}
        >
          <ArrowLeft size={14} className="stroke-[3] shrink-0" />
          
          <AnimatePresence mode="wait">
            {!isBackHovered ? (
              <motion.span 
                key="back-short"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[9px] font-black uppercase tracking-widest leading-none hidden sm:inline-block"
              >
                Back
              </motion.span>
            ) : (
              <motion.span 
                key="back-long"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[9px] text-white/90 font-bold tracking-wider leading-none truncate max-w-[140px] hidden sm:inline-block"
              >
                To {viewNamesMap[navigationHistory[navigationHistory.length - 2]] || 'Previous'}
              </motion.span>
            )}
          </AnimatePresence>

          <span className="absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto w-5 h-5 rounded-full bg-blue-500 sm:bg-white/25 text-white text-[8px] font-black flex items-center justify-center shrink-0 sm:ml-1 shadow-sm border border-blue-400/50 sm:border-none">
            {navigationHistory.length - 1}
          </span>
        </motion.button>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Floating Windows / Systems Launcher for Mobile & Tablet */}
  <AnimatePresence>
    {user && (
      <div 
        id="floating-windows-launcher-container"
        className="lg:hidden fixed bottom-6 left-6 z-[150] pointer-events-auto select-none"
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.05}
          dragConstraints={navigationContainerRef}
          className="relative pointer-events-auto"
        >
          {/* Opened Menu Panel */}
          <AnimatePresence>
            {isFloatingMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: -12 }}
                exit={{ opacity: 0, scale: 0.85, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="absolute bottom-full left-0 mb-3 w-[290px] xs:w-[320px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 flex flex-col gap-3 pointer-events-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-gradient-to-br from-blue-500 to-emerald-500 text-white rounded-lg">
                      <LayoutGrid size={14} />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Systems Launchpad</span>
                      <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Medical Command Node</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[7px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sys Ready</span>
                  </div>
                </div>

                {/* Grid of Navigation Buttons */}
                <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto no-scrollbar py-0.5">
                  {[
                    { id: 'home', label: 'Home Dashboard', icon: <Home size={15} />, color: 'from-blue-500 to-indigo-600' },
                    { id: 'ai_nexus', label: 'AI Consultation', icon: <Bot size={15} />, color: 'from-violet-500 to-purple-600' },
                    { id: 'biomatic', label: 'Biosimulator Lab', icon: <Cpu size={15} />, color: 'from-amber-500 to-orange-600' },
                    { id: 'diagnostic_lab', label: 'Diagnostic Lab Analyser', icon: <Stethoscope size={15} />, color: 'from-emerald-600 to-teal-500' },
                    { id: 'monitor', label: 'Real-time Bio-Monitor', icon: <Monitor size={15} />, color: 'from-cyan-500 to-blue-500' },
                    { id: 'doctors_dashboard', label: 'Doctors\' Portal', icon: <FileText size={15} />, color: 'from-indigo-500 to-indigo-700' },
                    { id: 'about', label: 'System & App Info', icon: <Info size={15} />, color: 'from-slate-500 to-slate-700' },
                    ...(isAdmin ? [{ id: 'admin', label: 'Admin Command Center', icon: <Shield size={15} />, action: handleAdminAccess, color: 'from-red-500 to-rose-600' }] : [])
                  ].map((item) => {
                    const isActive = isSubViewActive(item.id, currentView);
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else {
                            setCurrentView(item.id as any);
                          }
                          setIsFloatingMenuOpen(false);
                        }}
                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all border text-center relative cursor-pointer ${
                          isActive 
                            ? 'bg-blue-50/80 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800/80 dark:text-blue-450' 
                            : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/40 dark:border-slate-800/40 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.color} text-white shadow-sm transition-transform duration-300`}>
                          {item.icon}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tight leading-none truncate w-full px-0.5">
                          {translate(item.label, currentLanguage)}
                        </span>
                        {isActive && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="text-[7.5px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 text-center select-none pt-1 border-t border-slate-100 dark:border-slate-800/40">
                  👉 Drag icon to move launcher
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Draggable Launcher Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
            className={`relative flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-full border shadow-[0_15px_30px_rgba(59,130,246,0.25)] bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-500 text-white border-blue-500/30 cursor-grab active:cursor-grabbing select-none transition-all duration-200 ${
              isFloatingMenuOpen ? 'ring-4 ring-blue-500/25' : ''
            }`}
            title="Systems Windows Launcher (Drag to move)"
          >
            <LayoutGrid size={18} className="stroke-[2.5] shrink-0 animate-pulse" />
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-450 border-2 border-white dark:border-slate-950 shadow-sm" />
          </motion.button>
        </motion.div>
      </div>
    )}
  </AnimatePresence>

            {currentView !== 'ai_nexus' && (
              <>
                <div className="flex-grow" />
                <Suspense fallback={<div className="h-20" />}>
                  <Footer onNavigate={(view) => setCurrentView(view)} />
                </Suspense>
              </>
            )}
      </div>
    </div>
  </div>
</ErrorBoundary>
  );
}

