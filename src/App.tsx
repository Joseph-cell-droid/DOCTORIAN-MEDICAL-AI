/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ErrorInfo, Suspense, lazy } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SEARCHABLE_ITEMS, HEALTH_TIPS } from './constants';
import { Dashboard } from './components/Dashboard';
import { VoiceCommandToggle } from './components/VoiceCommandToggle';

const MedicalIllustrator = lazy(() => import("./components/MedicalIllustrator").then(m => ({ default: m.MedicalIllustrator })));
const NeuralVoiceCall = lazy(() => import("./components/NeuralVoiceCall").then(m => ({ default: m.NeuralVoiceCall })));
const ImageGenerator = lazy(() => import("./components/ImageGenerator").then(m => ({ default: m.ImageGenerator })));
const ChatInterface = lazy(() => import("./components/ChatInterface").then(m => ({ default: m.ChatInterface })));
const MedicalAI = lazy(() => import("./components/MedicalAI").then(m => ({ default: m.MedicalAI })));
const CognisHub = lazy(() => import("./components/CognisHub").then(m => ({ default: m.CognisHub })));
const BioSimulation = lazy(() => import("./components/BioSimulation"));
const PatientMonitor = lazy(() => import("./components/PatientMonitor").then(m => ({ default: m.PatientMonitor })));
const Features = lazy(() => import("./components/Features").then(m => ({ default: m.Features })));
const About = lazy(() => import("./components/About").then(m => ({ default: m.About })));
const HealthRecords = lazy(() => import("./components/HealthRecords").then(m => ({ default: m.HealthRecords })));
const ProfileSettings = lazy(() => import("./components/ProfileSettings").then(m => ({ default: m.ProfileSettings })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AccessRestriction = lazy(() => import("./components/AccessRestriction").then(m => ({ default: m.AccessRestriction })));
const SpecialistFinder = lazy(() => import("./components/SpecialistFinder").then(m => ({ default: m.SpecialistFinder })));
const VitalityMatrix = lazy(() => import("./components/VitalityMatrix").then(m => ({ default: m.VitalityMatrix })));
const SymptomChecker = lazy(() => import("./components/SymptomChecker").then(m => ({ default: m.SymptomChecker })));
const DiagnosticLab = lazy(() => import("./components/DiagnosticLab").then(m => ({ default: m.DiagnosticLab })));
const EmergencyRegistry = lazy(() => import("./components/EmergencyRegistry").then(m => ({ default: m.EmergencyRegistry })));
const Billing = lazy(() => import("./components/Billing").then(m => ({ default: m.Billing })));
const MedicationTracker = lazy(() => import("./components/MedicationTracker").then(m => ({ default: m.MedicationTracker })));
const WorkoutTracker = lazy(() => import("./components/WorkoutTracker").then(m => ({ default: m.WorkoutTracker })));
const BioSecurity = lazy(() => import("./components/BioSecurity").then(m => ({ default: m.BioSecurity })));
const DeveloperPortal = lazy(() => import("./components/DeveloperPortal").then(m => ({ default: m.DeveloperPortal })));
const BMICalculator = lazy(() => import("./components/BMICalculator").then(m => ({ default: m.BMICalculator })));
const LearnMore = lazy(() => import("./components/LearnMore").then(m => ({ default: m.LearnMore })));
const AuthModal = lazy(() => import("./components/AuthModal").then(m => ({ default: m.AuthModal })));
const AdminInfoModal = lazy(() => import("./components/AdminInfoModal").then(m => ({ default: m.AdminInfoModal })));
const Footer = lazy(() => import("./components/Footer").then(m => ({ default: m.Footer })));
const BiomaticSandbox = lazy(() => import("./components/BiomaticSandbox").then(m => ({ default: m.BiomaticSandbox })));
const ClinicalProtocols = lazy(() => import("./components/Tasks").then(m => ({ default: m.ClinicalProtocols })));
const NeuralTrainingHub = lazy(() => import("./components/NeuralTrainingHub").then(m => ({ default: m.NeuralTrainingHub })));

import { HealthTip } from "./components/HealthTipModal";
const HealthTipModal = lazy(() => import("./components/HealthTipModal").then(m => ({ default: m.HealthTipModal })));
const HealthProgressTracker = lazy(() => import("./components/HealthProgressTracker").then(m => ({ default: m.HealthProgressTracker })));
import { HelpCenter, PrivacyVault, TermsAndData } from "./components/SystemsHubViews";

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
import { api, User } from './api';
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

export default function App() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentView, _setCurrentView] = useState<'home' | 'monitor' | 'features' | 'about' | 'learn_more' | 'records' | 'profile' | 'admin' | 'specialist' | 'neuro' | 'vitality' | 'meds' | 'fitness' | 'symptoms' | 'biosecurity' | 'ai_nexus' | 'illustrator' | 'diagnostic_lab' | 'emergency' | 'training' | 'tasks' | 'clinical_roadmap' | 'anomaly_detail' | 'health_matrix' | 'autonomous_sync' | 'dev_portal' | 'billing' | 'health_trace' | 'biomatic' | ResourceType>('home');
  const [isDoctorVerifyOpen, setIsDoctorVerifyOpen] = useState(false);
  const [pendingView, setPendingView] = useState<any>(null);

  const setCurrentView = (view: any) => {
    _setCurrentView(view);
  };

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasNotification, setHasNotification] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isBMIModalOpen, setIsBMIModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [dailyTip, setDailyTip] = useState<HealthTip>(HEALTH_TIPS[0]);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);

  const arduino = useArduinoContext();
  useMedicationReminders(user);
  const isAdmin = true;
  const isDoctor = true;

  const handleNeuralCoreAccess = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminAccess = () => {
    if (!isAdmin) {
      addToast("Unauthorized tactical access attempt detected.", "error");
      return;
    }
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setShowAdminLogin(true);
    }
  };

  const verifyAdminAuth = () => {
    // Administrative passkey validation
    if (adminPassInput === "Haxzy20Joseph21") {
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
        if (error.message === 'Unauthorized' || error.status === 401) {
          console.log("[Doctorian] Session expired. Synchronizing to Guest Mode.");
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
    const fetchWeather = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const data = await res.json();
          setWeatherData({
            temp: data.current_weather.temperature,
            condition: data.current_weather.weathercode,
            latitude,
            longitude
          });
        } catch (err) {
          console.error("App-level weather fetch failed:", err);
        }
      });
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
    window.addEventListener('offline_action_queued', handleActionQueued);
    window.addEventListener('offline_actions_synced', handleActionsSynced);
    
    // Also trigger initial sync check on mount if online
    if (navigator.onLine) {
      import('./api').then(({ syncOfflineActions }) => {
        syncOfflineActions();
      }).catch(console.error);
    }

    return () => {
      window.removeEventListener('offline_action_queued', handleActionQueued);
      window.removeEventListener('offline_actions_synced', handleActionsSynced);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth Synchronization Timeout")), 45000)
      );

      let attempts = 0;
      const maxAttempts = 2;
      let authenticatedUser: User | null = null;

      while (attempts < maxAttempts) {
        try {
          authenticatedUser = await Promise.race([
            api.auth.me(),
            timeoutPromise
          ]) as User | null;
          
          console.log("[Doctorian] Identity verified:", authenticatedUser ? authenticatedUser.email : "Guest");
          setUser(authenticatedUser);
          setIsAuthReady(true);
          console.log("[Doctorian] Neural Interface Ready.");
          return; // Success, exit completely
        } catch (error: any) {
          attempts++;
          console.error(`[Doctorian] Auth Error (Attempt ${attempts}):`, error);
          if (attempts === maxAttempts) {
            setAuthError(error.message || "Neural link synchronization failure");
            setUser(null);
            setIsAuthReady(true);
            console.log("[Doctorian] Neural Interface Ready (Offline/Guest mode).");
          } else {
            // Wait a bit before retry
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const restrictedViews = ['admin'];
    if (restrictedViews.includes(currentView) && isAuthReady && user && !isAdmin) {
      console.error("[Doctorian] Security Breach Attempt: Unauthorized access to restricted view", currentView);
    }
  }, [currentView, isAdmin, user, isAuthReady]);

  useEffect(() => {
    if (arduino.healthStatus?.overall === 'critical' && user) {
      const lastAutoSOSAt = localStorage.getItem('medical_last_auto_sos_at');
      const now = Date.now();
      
      if (!lastAutoSOSAt || now - parseInt(lastAutoSOSAt) > 5 * 60 * 1000) {
        localStorage.setItem('medical_last_auto_sos_at', now.toString());
        
        const autoTriggerSOS = async () => {
          try {
            await arduino.triggerAlarm('emergency');
            const msg = `URGENT SOS [MTN RELAY: 0787674140]: for ${user.displayName || user.email}: CRITICAL Vitals Detected! HR: ${arduino.vitals?.heartRate}, SpO2: ${arduino.vitals?.spo2}. Immediate assistance required.`;
            
            if ('speechSynthesis' in window && user.subscriptionTier !== 'free') {
              const utterance = new SpeechSynthesisUtterance("EMERGENCY. Critical vital baseline reached. Automated SOS protocols active. Contacting clinical nodes immediately.");
              utterance.rate = 0.9;
              utterance.pitch = 0.8;
              window.speechSynthesis.speak(utterance);
            }

            await api.alerts.sendSms(msg, user.doctorPhone, user.mentorPhone);
            const hospitalName = user?.hospitalPreference || 'Mulago National Referral Hospital';
            const callMessage = `Hello! This is the Doctorian AI Clinical Guardian, an automated patient monitoring intelligence system. We are calling to report an automated physiological crisis update from ${hospitalName}. Patient: ${user.displayName || user.email} has reached a critical biometric vital baseline. The heart rate is recorded at ${arduino.vitals?.heartRate || 0} beats per minute and the blood oxygen saturation level is at ${arduino.vitals?.spo2 || 0} percent. Immediate clinical intervention is required at ${hospitalName}. Please review the patient's telemetry and check on them immediately!`;
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

      const response = await api.ai.aiChat(
        [{ role: "user", text: prompt }], 
        "You are a helpful medical assistant specialized in wellness and preventive longevity protocols.",
        "gemma-2-27b-it", 
        0.7
      );
      
      const responseText = response.text;
      if (responseText) {
        setAiInsight(responseText);
        setLastInsightFetchAt(Date.now());
      } else {
        throw new Error("Empty response");
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      const isQuotaError = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');
      const isTransientError = errorMsg.includes('500') || errorMsg.includes('503') || errorMsg.includes('fetch') || errorMsg.includes('NetworkError');

      if (isTransientError && retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAiInsight(retryCount + 1);
      }

      console.warn("Failed to fetch AI insight, using local fallbacks.", err);
      // Fallback tips
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
        { id: 'home', label: 'Dashboard', icon: <Home size={15} /> },
        { id: 'ai_nexus', label: 'Doctorian Neural Core', icon: <Bot size={15} /> },
        { id: 'voice_call', label: 'Neural Voice Consultation', icon: <Phone size={15} />, action: () => setIsVoiceCallOpen(true) },
        { id: 'illustrator', label: 'Medical Illustrator', icon: <Palette size={15} /> },
        { id: 'neuro', label: 'CognisHub Node', icon: <Brain size={15} /> },
        { id: 'biomatic', label: 'Biomatic Sandbox', icon: <Cpu size={15} /> },
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
        { id: 'diagnostic_lab', label: 'Diagnostic Lab', icon: <Stethoscope size={15} /> },
        { id: 'monitor', label: 'Bio-Monitor Console', icon: <Monitor size={15} /> },
        { id: 'health_trace', label: 'Health Progress Trace', icon: <TrendingUp size={15} /> },
        { id: 'vitality', label: 'Vitality Matrix', icon: <Zap size={15} /> },
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
        { id: 'meds', label: 'Bio-Pharmacy Depot', icon: <Pill size={15} /> },
        { id: 'specialist', label: 'Connect Specialists', icon: <Stethoscope size={15} /> },
        { id: 'about', label: 'Systems Information', icon: <Info size={15} /> },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Command Matrix', icon: <Shield size={15} />, action: handleAdminAccess }] : [])
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

  const mobileNavLinks = navLinks.slice(0, 5);


  return (
    <ErrorBoundary>
      <div id="app-root-container" className="h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors duration-300 flex flex-col lg:flex-row overflow-hidden">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[150] focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:rounded-2xl focus:font-black focus:shadow-2xl"
      >
        Skip to main content
      </a>
      
      {/* Sidebar - Desktop/Tablet Landscape */}
      {user && (
        <aside 
          className="hidden lg:flex flex-col w-[210px] xl:w-[230px] bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800/80 shrink-0 transition-all duration-300 ease-in-out z-[110] relative"
          aria-label="Sidebar navigation"
        >
          <div className="flex flex-col h-full py-6">
            <div className="w-full mb-6 px-4 flex items-center gap-3 shrink-0 border-b border-slate-50 dark:border-slate-900 pb-5">
              <Logo size="sm" showText={false} className="shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-[0.12em] leading-none">CLINICAL CORE</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">SYS ONLINE</span>
                </div>
              </div>
            </div>

            <nav className="flex-1 w-full px-3 flex flex-col gap-5 overflow-y-auto no-scrollbar smooth-scroll pr-1 pb-6" aria-label="Main navigation">
              {sidebarSections.map((section) => (
                <div key={section.title} className="flex flex-col gap-1.5 shrink-0">
                  <div className="px-3 pb-0.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase select-none">
                      {section.title}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {section.items.map((link) => {
                      const isActive = currentView === link.id;
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
                          className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative text-left outline-none ${
                            isActive 
                              ? section.accent.active
                              : section.accent.hover
                          }`}
                        >
                          <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                            {React.cloneElement(link.icon as any, { 
                              size: 18, 
                              className: `w-[18px] h-[18px] transition-colors ${
                                isActive 
                                  ? section.accent.iconActive 
                                  : section.accent.iconInactive
                              }` 
                            })}
                          </div>

                          <span className="text-sm font-bold truncate flex-1 leading-none tracking-tight">
                            {link.label}
                          </span>

                          {isActive && (
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
                  onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                  className={`flex items-center gap-3 w-full px-3.5 py-2 text-left rounded-xl transition-all duration-200 group ${
                    isResourcesOpen 
                      ? "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold border-l-4 border-slate-400 dark:border-slate-600 rounded-l-none"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-1"
                  }`}
                  aria-label="Toggle Clinical Resources"
                >
                  <motion.div
                    animate={isResourcesOpen ? { rotate: 90, scale: 1.1 } : { rotate: 0, scale: 1 }}
                    className="shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                  >
                    <LayoutGrid size={18} className={`w-[18px] h-[18px] transition-colors ${isResourcesOpen ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                  </motion.div>

                  <span className="text-sm font-semibold truncate flex-1 leading-none tracking-tight">
                    Systems Hub
                  </span>
                </button>

                {/* Modern Inline Dropdown Menu */}
                <AnimatePresence>
                  {isResourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden flex flex-col gap-1 mt-1.5 pl-4 ml-2 border-l-2 border-slate-100 dark:border-slate-800/80"
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
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => {
                              setCurrentView(res.id as any);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 tracking-tight group/sub ${
                              isSubActive
                                ? "bg-slate-100 dark:bg-slate-900 text-slate-950 dark:text-slate-100"
                                : `text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 ${res.color} hover:translate-x-0.5`
                            }`}
                          >
                            <div className={`shrink-0 transition-transform group-hover/sub:scale-105 ${isSubActive ? "text-slate-950 dark:text-slate-100" : "text-slate-400 dark:text-slate-500 group-hover/sub:text-current"}`}>
                              {res.icon}
                            </div>
                            <span className="truncate flex-1 text-left leading-none">{res.label}</span>
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
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all text-xs font-bold uppercase tracking-widest shadow-lg"
                  >
                    <Download size={16} />
                    <span>Install App</span>
                  </button>
                )}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100/50 dark:border-slate-800/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Secure Core</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" title="System Online" />
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active</span>
                  </div>
                </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Bottom Navigation - User Focused */}
      {user && (
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] sm:w-[400px] h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-2xl flex items-center justify-around px-4">
          {navLinks.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentView === item.id 
                  ? 'text-blue-600' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${currentView === item.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                {React.cloneElement(item.icon as any, { size: 20 })}
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
            </button>
          ))}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-1 transition-all ${
              isMobileMenuOpen 
                ? 'text-blue-600' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isMobileMenuOpen ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
               <LayoutGrid size={20} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter">Systems</span>
          </button>
        </nav>
      )}

      {/* Mobile/Tablet Header & Bottom Nav */}
      <div id="app-main-layout-wrapper" className="flex-1 flex flex-col h-full min-h-0 relative bg-slate-50 dark:bg-slate-950 overflow-hidden">


        <div id="app-scroll-viewport" className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
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
          layout
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
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-8">
            <div className="flex items-center py-3 sm:py-4 gap-2 sm:gap-4 w-full">
              <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                <motion.button 
                  layout
                  className="flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0 p-1"
                  onClick={() => setCurrentView('home')}
                  aria-label="Go to Home"
                >
                  <Logo size="sm" className="scale-[0.8] sm:scale-90 lg:scale-100 shrink-0 [&_.logo-text]:hidden sm:[&_.logo-text]:flex" />
                </motion.button>
              </div>

              <div className="flex flex-1 justify-center px-1 sm:px-4 items-center gap-1.5 sm:gap-4 overflow-visible min-w-0">
                <motion.button 
                  layout
                  onClick={() => setIsSearchOpen(true)}
                  className="flex flex-1 md:w-full md:max-w-md items-center gap-2 sm:gap-3 bg-slate-100 dark:bg-slate-800/90 p-2 sm:px-4 sm:py-2.5 rounded-xl text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-750 transition-all border border-slate-300/80 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 min-w-[85px] h-11 sm:h-auto shadow-sm"
                  aria-label="Open search"
                >
                  <Search aria-hidden="true" size={16} className="text-slate-800 dark:text-slate-100 shrink-0 font-bold" />
                  <span className="text-[10px] sm:text-xs font-black md:inline text-high-visibility truncate uppercase tracking-widest hidden sm:block">Search System...</span>
                  <span className="text-[10px] font-black sm:hidden truncate uppercase tracking-widest text-slate-900 dark:text-slate-100">Search</span>
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
                  className={`flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border transition-all cursor-pointer active:scale-95 shrink-0 ${
                    isOffline
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                  title={isOffline ? "Currently running on secure local cache. Click to return online." : "Connected to secure cloud. Click to simulate secure offline mode."}
                >
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${isOffline ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap shrink-0">
                    {isOffline ? 'Cache Core' : 'Active System'}
                  </span>
                </button>

                <VoiceCommandToggle onNavigate={setCurrentView} />

                <motion.button
                  layout
                  onClick={() => setIsEyeCareMode(!isEyeCareMode)}
                  className={`p-2 sm:p-3 rounded-xl transition-all flex items-center gap-2 border shadow-sm shrink-0 w-11 sm:w-auto h-11 sm:h-auto justify-center ${
                    isEyeCareMode 
                      ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-950 dark:border-amber-600 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-amber-100' 
                      : 'bg-slate-100 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750'
                  }`}
                  aria-label={isEyeCareMode ? "Disable Legibility Mode" : "Enable Legibility Mode"}
                  aria-pressed={isEyeCareMode}
                  title={isEyeCareMode ? "Disable Legibility Mode" : "Enable Legibility Mode"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={isEyeCareMode ? 'eye' : 'eye-off'}
                      initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.8, rotate: 15, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2"
                    >
                      {isEyeCareMode ? <Eye aria-hidden="true" size={18} className="shrink-0 text-amber-900 dark:text-amber-300" /> : <EyeOff aria-hidden="true" size={18} className="shrink-0" />}
                    </motion.div>
                  </AnimatePresence>
                  <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline text-high-visibility whitespace-nowrap shrink-0">Legibility Mode</span>
                </motion.button>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-4 ml-auto shrink-0">
              {isAuthReady && (
                user ? (
                  <div className="flex items-center gap-1.5 sm:gap-3 relative shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800 shrink-0">
                      <Zap size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-[10px] sm:text-xs font-black text-blue-700 dark:text-blue-300 shrink-0">{Math.round(user.credits || 0)}</span>
                    </div>
                    <div className="relative shrink-0">
                      <button 
                        className="group flex items-center gap-1.5 pl-1 pr-2 sm:pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer active:scale-95 shrink-0 min-h-[40px]"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        aria-label="User profile menu"
                        aria-haspopup="true"
                        aria-expanded={isProfileOpen}
                      >
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 overflow-hidden flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-blue-500/50 transition-all">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={`Profile of ${user.displayName || user.email}`} className="w-full h-full object-cover shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-[10px] sm:text-xs shrink-0">
                              {user.displayName?.[0] || user.email[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="hidden sm:flex flex-col items-start leading-tight">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white truncate max-w-[80px] uppercase tracking-tighter">
                            {user.displayName?.split(' ')[0] || 'User'}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                            {user.subscriptionTier || 'Free'} Core
                          </span>
                        </div>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
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
                                      animate={{ width: `${Math.min(Math.round(user.credits || 0) / 4, 100)}%` }}
                                      className="h-full bg-blue-600"
                                    />
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-blue-600 uppercase">{Math.round(user.credits || 0)} Neural Energy</span>
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
                                    <span className="font-black uppercase tracking-tight text-left">Doctorian Neural Core</span>
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
              {user && (
                <>
                  <motion.button 
                    layout
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 sm:p-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
                    aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={isDarkMode ? 'sun' : 'moon'}
                        initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center justify-center"
                      >
                        {isDarkMode ? <Sun aria-hidden="true" size={18} className="shrink-0 text-amber-500" /> : <Moon aria-hidden="true" size={18} className="shrink-0 text-indigo-400" />}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                  <button 
                    onClick={handleOpenAdminInfo}
                    className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-900 transition-colors relative group shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
                    aria-label={hasNotification ? "View notifications (new available)" : "View notifications"}
                    title="Notifications"
                  >
                    <motion.div
                      animate={hasNotification ? { 
                        rotate: [0, -10, 10, -10, 10, 0],
                        scale: [1, 1.1, 1.1, 1.1, 1.1, 1]
                      } : {}}
                      transition={{ repeat: hasNotification ? Infinity : 0, duration: 0.5 }}
                    >
                      <Bell aria-hidden="true" size={18} className={`shrink-0 ${hasNotification ? "text-blue-600" : ""}`} />
                    </motion.div>
                    {hasNotification && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-white bg-rose-500 shrink-0" aria-hidden="true"></span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>
      </div>

      <main className="flex-1 pb-20 relative flex flex-col pt-0 w-full" id="main-content">
          <div className="flex-1 flex flex-col items-center relative py-6 w-full max-w-7xl mx-auto">
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
            />
          ) : currentView === 'ai_nexus' ? (
            <MedicalAI 
              user={user} 
              onUpdate={(u) => setUser(u)} 
              onRefreshUser={refreshUser} 
              onNavigate={setCurrentView} 
              arduino={arduino} 
              onUpgradeRequested={() => setIsSubscriptionModalOpen(true)}
            />
          ) : currentView === 'specialist' ? (
            <motion.div
              role="main"
              key="specialist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
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
          >
            <HealthRecords />
          </motion.div>
        ) : currentView === 'vitality' ? (
          <motion.div
            key="vitality"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <VitalityMatrix />
          </motion.div>
        ) : currentView === 'diagnostic_lab' ? (
          <motion.div
            key="diagnostic_lab"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
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
          >
            <SymptomChecker user={user} onUpdateUser={setUser} />
          </motion.div>
        ) : currentView === 'meds' ? (
          <motion.div
            key="meds"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <MedicationTracker />
          </motion.div>
        ) : currentView === 'fitness' ? (
          <motion.div
            key="fitness"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
          >
            <WorkoutTracker user={user} />
          </motion.div>
        ) : currentView === 'about' ? (
          <motion.div
            key="about"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <About />
          </motion.div>
        ) : currentView === 'learn_more' ? (
          <motion.div
            key="learn_more"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <LearnMore onBack={() => setCurrentView('home')} />
          </motion.div>
        ) : currentView === 'health_trace' ? (
          <motion.div
            key="health_trace"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <HealthProgressTracker user={user} />
          </motion.div>
        ) : currentView === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProfileSettings 
              user={user} 
              onUpdate={(updatedUser) => setUser(updatedUser)} 
              onLogout={handleLogout}
              onBack={() => setCurrentView('home')}
              onNavigate={setCurrentView}
            />
          </motion.div>
        ) : currentView === 'admin' ? (
          isAdmin ? (
            isAdmin && isAdminAuthenticated ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
              >
                <AdminDashboard addToast={addToast} />
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                 <div className="w-24 h-24 bg-red-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center">
                   <Shield size={48} className="text-rose-600" />
                 </div>
                 <div className="space-y-2">
                   <h2 className="text-2xl font-black uppercase tracking-tighter">Security Protocol Active</h2>
                   <p className="text-slate-500 font-medium max-w-sm">Administrative terminal requires high-level neural authorization for biometric validation.</p>
                 </div>
                 <button 
                  onClick={handleAdminAccess}
                  className="px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                 >
                   Inhibit Lockdown
                 </button>
              </div>
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
            className="max-w-7xl mx-auto px-4 py-12"
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
              className="max-w-7xl mx-auto px-4 py-12 text-left"
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
        ) : currentView === 'help' ? (
          <motion.div
            key="help"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
          >
            <HelpCenter user={user} onNavigate={setCurrentView} onStartTutorial={() => setIsTutorialOpen(true)} />
          </motion.div>
        ) : currentView === 'privacy' ? (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
          >
            <PrivacyVault user={user} onNavigate={setCurrentView} />
          </motion.div>
        ) : currentView === 'terms' ? (
          <motion.div
            key="terms"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
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
          _setCurrentView(pendingView);
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
    <AnimatePresence>
      {isVoiceCallOpen && (
        <NeuralVoiceCall 
          onClose={() => setIsVoiceCallOpen(false)}
          user={user}
          vitals={arduino.vitals}
          healthStatus={arduino.healthStatus}
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
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{section.title}</h4>
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
                          <div className={`p-2.5 rounded-xl shrink-0 transition-all ${
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
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-black leading-tight uppercase tracking-tight line-clamp-2 transition-colors">
                              {item.label.split(' Hub')[0].split(' Node')[0].split(' Console')[0].split(' Trace')[0].split(' Core')[0].split(' Depot')[0]}
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
            <div className="flex-grow" />
            <Suspense fallback={<div className="h-20" />}>
              <Footer onNavigate={(view) => setCurrentView(view)} />
            </Suspense>
      </div>
    </div>
  </div>
</ErrorBoundary>
  );
}

