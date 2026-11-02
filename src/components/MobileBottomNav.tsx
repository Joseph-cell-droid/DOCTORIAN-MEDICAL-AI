import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Heart,
  Folder,
  User,
  Sparkles,
  Bot,
  Monitor,
  Pill,
  Activity,
  Calendar,
  AlertTriangle,
  FlaskConical,
  ShieldCheck,
  ChevronsRight,
  ChevronsLeft,
  X,
  Search,
  Layers,
  ArrowRightLeft,
  HardDrive,
  LayoutGrid,
  Mic,
} from 'lucide-react';
import { AndroidAppButtons, CLINICAL_MODULES_REGISTRY } from './AndroidAppButtons';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMenu?: () => void;
}

export interface PageItem {
  id: string;
  label: string;
  subtitle: string;
  category: 'core' | 'diag' | 'specialized';
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

/**
 * Registry of all Doctorian clinical pages and modules.
 */
export const ALL_APP_PAGES: PageItem[] = [
  // Core Care Views
  {
    id: 'home',
    label: 'Clinical Dashboard',
    subtitle: 'Overview of your health',
    category: 'core',
    icon: <Home size={20} className="text-blue-600" />,
  },
  {
    id: 'ai_nexus',
    label: 'AI Consultation',
    subtitle: 'Chat with AI doctor',
    category: 'core',
    icon: <Bot size={20} className="text-purple-600" />,
    badge: 'NEW',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  {
    id: 'symptoms',
    label: 'Symptom Triage',
    subtitle: 'Analyze your symptoms',
    category: 'core',
    icon: <Sparkles size={20} className="text-emerald-500" />,
  },
  {
    id: 'monitor',
    label: 'Bio-Telemetry Monitor',
    subtitle: 'Real-time health tracking',
    category: 'core',
    icon: <Monitor size={20} className="text-amber-500" />,
    badge: 'LIVE',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    id: 'meds',
    label: 'Precision Pharmacy',
    subtitle: 'AI-powered medication guidance',
    category: 'core',
    icon: <Pill size={20} className="text-blue-600" />,
  },
  {
    id: 'vitality',
    label: 'Vitality Matrix',
    subtitle: 'Track your wellness score',
    category: 'core',
    icon: <Activity size={20} className="text-rose-500" />,
  },
  {
    id: 'clinical_roadmap',
    label: 'Appointments & Visits',
    subtitle: 'Manage your schedule',
    category: 'core',
    icon: <Calendar size={20} className="text-sky-500" />,
  },
  {
    id: 'storage_vault',
    label: '1GB Cloud Storage',
    subtitle: 'Free 1GB vault for files & docs',
    category: 'core',
    icon: <HardDrive size={20} className="text-indigo-600" />,
    badge: '1GB FREE',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  {
    id: 'app_medics',
    label: 'App Medics (Uganda)',
    subtitle: 'Drugs & pharmacy prices in Uganda',
    category: 'core',
    icon: <Pill size={20} className="text-emerald-500" />,
    badge: 'UG RX',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },

  // Diagnostics & Pathology
  {
    id: 'ambient_scribe',
    label: 'Ambient SOAP Scribe',
    subtitle: 'Multilingual speech-to-SOAP notes & mesh sync',
    category: 'diag',
    icon: <Mic size={20} className="text-blue-600" />,
    badge: 'NEW',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    id: 'diagnostic_lab',
    label: 'Laboratory Analyser',
    subtitle: 'Advanced lab analysis',
    category: 'diag',
    icon: <FlaskConical size={20} className="text-purple-600" />,
  },
  {
    id: 'records',
    label: 'Medical Records',
    subtitle: 'Patient charts & clinical notes',
    category: 'diag',
    icon: <Folder size={20} className="text-blue-600" />,
  },
  {
    id: 'health_trace',
    label: 'Genomic Matrix',
    subtitle: 'DNA and longevity markers',
    category: 'diag',
    icon: <Activity size={20} className="text-teal-600" />,
  },
  {
    id: 'neuro',
    label: 'Neural Synthesis',
    subtitle: 'Cognitive state & neuro-mapping',
    category: 'diag',
    icon: <Monitor size={20} className="text-indigo-600" />,
  },

  // Specialized & Management
  {
    id: 'profile',
    label: 'Profile & Settings',
    subtitle: 'Account & biometric parameters',
    category: 'specialized',
    icon: <User size={20} className="text-blue-600" />,
  },
  {
    id: 'features',
    label: 'Clinical Station Hub',
    subtitle: 'Telemetry alarm and simulator',
    category: 'specialized',
    icon: <Layers size={20} className="text-cyan-600" />,
  },
  {
    id: 'admin',
    label: 'Hospital Administration',
    subtitle: 'Registry and triage management',
    category: 'specialized',
    icon: <ShieldCheck size={20} className="text-slate-600" />,
  },
];

/**
 * Strict Android Phone Detection:
 * ONLY appears on real Android phones and never on another devices.
 * Explicitly excludes:
 *  - iPhones, iPads, iPods (Apple iOS/iPadOS)
 *  - Laptops, Desktops (Mac, Windows, Linux, Chromebooks)
 *  - Tablets (iPad, Android tablets without mobile phone user agents)
 *  - Resized desktop browsers or non-Android devices
 */
export function isAndroidOrTabletDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Optional developer simulation override via URL search query (?device=android_phone) or session storage for testing
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('device') === 'android_phone') return true;
    if (sessionStorage.getItem('doctorian_force_android_phone') === 'true') return true;
  } catch {}

  const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();

  // 1. MUST be an Android operating system
  const isAndroid = ua.includes('android');
  if (!isAndroid) {
    return false;
  }

  // 2. EXCLUDE all Apple devices (iPhone, iPad, iPod, Mac)
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod') || ua.includes('macintosh')) {
    return false;
  }

  // 3. EXCLUDE tablets (Android tablets have "Android" but DO NOT include "Mobile", or explicitly specify "Tablet")
  const isExplicitTablet = ua.includes('tablet') || ua.includes('playbook') || ua.includes('silk');
  if (isExplicitTablet) {
    return false;
  }

  // 4. Standard Chrome/Firefox/Samsung Internet on Android:
  // Android smartphones explicitly contain the token "Mobile" (e.g. "Linux; Android 14; ... Mobile Safari/537.36")
  // Android tablets omit the "Mobile" token.
  const hasMobileToken = ua.includes('mobile');
  if (!hasMobileToken) {
    return false;
  }

  // 5. Verify screen geometry: handheld smartphone screens (min dimension < 820px)
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  if (minDimension >= 820) {
    return false; // Tablet / large display
  }

  return true;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
}) => {
  // Only show on Androids and tablets, never on laptops and desktops
  const [isAllowedDevice, setIsAllowedDevice] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isAndroidOrTabletDevice();
  });

  useEffect(() => {
    const updateDeviceCheck = () => {
      setIsAllowedDevice(isAndroidOrTabletDevice());
    };

    updateDeviceCheck();
    window.addEventListener('resize', updateDeviceCheck, { passive: true });
    window.addEventListener('orientationchange', updateDeviceCheck, { passive: true });

    let mqlWidth: MediaQueryList | null = null;
    let mqlPointer: MediaQueryList | null = null;
    let mqlHover: MediaQueryList | null = null;

    if (typeof window.matchMedia === 'function') {
      try {
        mqlWidth = window.matchMedia('(max-width: 1023px)');
        mqlPointer = window.matchMedia('(pointer: fine)');
        mqlHover = window.matchMedia('(hover: hover)');

        mqlWidth.addEventListener?.('change', updateDeviceCheck);
        mqlPointer.addEventListener?.('change', updateDeviceCheck);
        mqlHover.addEventListener?.('change', updateDeviceCheck);
      } catch {
        mqlWidth?.addListener?.(updateDeviceCheck);
        mqlPointer?.addListener?.(updateDeviceCheck);
        mqlHover?.addListener?.(updateDeviceCheck);
      }
    }

    return () => {
      window.removeEventListener('resize', updateDeviceCheck);
      window.removeEventListener('orientationchange', updateDeviceCheck);
      if (mqlWidth) {
        try {
          mqlWidth.removeEventListener?.('change', updateDeviceCheck);
          mqlPointer?.removeEventListener?.('change', updateDeviceCheck);
          mqlHover?.removeEventListener?.('change', updateDeviceCheck);
        } catch {
          mqlWidth.removeListener?.(updateDeviceCheck);
          mqlPointer?.removeListener?.(updateDeviceCheck);
          mqlHover?.removeListener?.(updateDeviceCheck);
        }
      }
    };
  }, []);

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent dock state: corner collapsed vs expanded card
  const [isCornerDocked, setIsCornerDocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('doctorian_bottom_nav_corner') === 'true';
    } catch {
      return false;
    }
  });

  // Corner side: 'right' | 'left'
  const [dockSide, setDockSide] = useState<'right' | 'left'>(() => {
    try {
      return (localStorage.getItem('doctorian_bottom_nav_side') as 'right' | 'left') || 'right';
    } catch {
      return 'right';
    }
  });

  const activePageMeta = useMemo(() => {
    return ALL_APP_PAGES.find((p) => p.id === currentView) || ALL_APP_PAGES[0];
  }, [currentView]);

  const toggleCornerDock = (side?: 'right' | 'left') => {
    const nextDocked = !isCornerDocked;
    const targetSide = side || dockSide;
    setIsCornerDocked(nextDocked);
    if (side) setDockSide(targetSide);
    try {
      localStorage.setItem('doctorian_bottom_nav_corner', String(nextDocked));
      if (side) localStorage.setItem('doctorian_bottom_nav_side', targetSide);
    } catch {}
  };

  const switchDockSide = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSide = dockSide === 'right' ? 'left' : 'right';
    setDockSide(nextSide);
    try {
      localStorage.setItem('doctorian_bottom_nav_side', nextSide);
    } catch {}
  };

  // If not on Android or Tablet, or in the dedicated full-screen AI Consultation view,
  // do not render the bottom bar (all hooks have already executed above).
  if (!isAllowedDevice || currentView === 'ai_nexus') {
    return null;
  }

  const isHomeActive = currentView === 'home';
  const isHealthActive = currentView === 'monitor' || currentView === 'vitality';
  const isRecordsActive = currentView === 'records' || currentView === 'health_trace';
  const isProfileActive = currentView === 'profile' || currentView === 'admin';

  return (
    <>
      {/* 1. Floating App Buttons in Transparent Background (No Enclosing Card) */}
      <AnimatePresence>
        {isSwitcherOpen && (
          <motion.div
            key="switcher-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsSwitcherOpen(false);
              setSearchQuery('');
            }}
            className="fixed inset-0 z-[135] bg-slate-950/50 dark:bg-slate-950/75 backdrop-blur-xl cursor-pointer"
          />
        )}
        {isSwitcherOpen && (
          <motion.div
            key="switcher-floating-content"
            initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              className="fixed inset-x-0 bottom-24 sm:bottom-28 z-[138] pointer-events-none flex flex-col items-center justify-end px-3 sm:px-6 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar"
            >
              <div className="pointer-events-auto w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center pb-2">
                {/* Floating Header Chip & Search Bar (Transparent Glass) */}
                <div className="w-full flex items-center justify-between gap-2.5 mb-3 px-1">
                  <div className="relative flex-1">
                    <Search
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 16 clinical apps..."
                      className="w-full pl-9 pr-8 py-2 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/55 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400/70 shadow-lg"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      setSearchQuery('');
                    }}
                    className="h-8.5 px-3.5 rounded-full bg-white/15 dark:bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95 shrink-0"
                    title="Close Floating Apps"
                  >
                    <X size={14} />
                    <span>Close</span>
                  </button>
                </div>

                {/* Floating App Buttons Grid - 4 Columns floating freely on transparent background */}
                <div className="w-full grid grid-cols-4 gap-y-3.5 sm:gap-y-5 gap-x-2 sm:gap-x-4 px-1 py-1">
                  {CLINICAL_MODULES_REGISTRY.filter((btn) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase().trim();
                    return (
                      btn.label.toLowerCase().includes(q) ||
                      btn.subtitle.toLowerCase().includes(q) ||
                      btn.categoryLabel.toLowerCase().includes(q)
                    );
                  }).map((btn, index) => {
                    const isActive = currentView === btn.id;
                    const IconComp = btn.icon;

                    return (
                      <motion.button
                        key={`floating-app-${btn.id}`}
                        type="button"
                        initial={{ opacity: 0, scale: 0.55, y: 25 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7, y: 15 }}
                        transition={{
                          type: 'spring',
                          damping: 18,
                          stiffness: 350,
                          delay: Math.min(index * 0.02, 0.25),
                        }}
                        whileHover={{ scale: 1.12, y: -4 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          onNavigate(btn.id);
                          setIsSwitcherOpen(false);
                          setSearchQuery('');
                        }}
                        className="group flex flex-col items-center justify-start cursor-pointer select-none focus:outline-none relative py-1"
                      >
                        {/* 1. Floating Icon Squircle */}
                        <div className="relative">
                          <div
                            className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl sm:rounded-[1.35rem] bg-gradient-to-tr ${btn.theme.iconGradient} text-white flex items-center justify-center shadow-[0_8px_22px_rgba(0,0,0,0.4)] ring-1 ring-white/35 backdrop-blur-xs transition-all duration-200 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)] group-hover:ring-white/70`}
                          >
                            {/* Glassy reflection sheen */}
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl sm:rounded-t-[1.35rem] pointer-events-none" />

                            <IconComp
                              size={22}
                              className="text-white drop-shadow-sm transition-transform duration-200 group-hover:scale-110 sm:w-6 sm:h-6"
                            />

                            {/* Floating Micro-Badge */}
                            {btn.isUrgent ? (
                              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-[7.5px] font-black text-white uppercase tracking-wider shadow-md ring-1.5 ring-black/40 animate-pulse">
                                SOS
                              </span>
                            ) : btn.badge ? (
                              <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-slate-950/75 backdrop-blur-md text-[7px] font-bold text-white uppercase tracking-tight ring-1 ring-white/25 shadow-md">
                                {btn.badge.replace(' FREE', '').replace(' AI', '').replace(' LIVE', '')}
                              </span>
                            ) : null}

                            {/* Active Glow Ring */}
                            {isActive && (
                              <span className="absolute -inset-1.5 rounded-[1.3rem] sm:rounded-[1.55rem] ring-2 ring-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.7)] animate-pulse" />
                            )}
                          </div>
                        </div>

                        {/* 2. Floating Title Underneath */}
                        <span className="text-[10.5px] sm:text-[11px] font-bold text-white/95 text-center mt-1.5 leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] line-clamp-1 max-w-[74px] sm:max-w-[84px] group-hover:text-white transition-colors">
                          {btn.label}
                        </span>
                        <span className="text-[8.5px] text-white/70 text-center leading-none tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] line-clamp-1 max-w-[74px] sm:max-w-[84px] mt-0.5">
                          {btn.categoryLabel}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Pill Bottom Bar (Matching Image 2 Bottom) */}
      <AnimatePresence mode="wait">
        {isCornerDocked ? (
          /* Collapsed Floating Corner Pill */
          <motion.div
            key="corner-docked-pill"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350 }}
            className={`fixed bottom-4 z-[140] ${
              dockSide === 'right' ? 'right-4' : 'left-4'
            }`}
          >
            <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-full shadow-2xl backdrop-blur-xl p-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleCornerDock()}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                title="Expand Navigation Bar"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <LayoutGrid size={16} strokeWidth={2.4} />
                </div>
                <div className="flex flex-col pr-1">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {activePageMeta.label.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                    Apps • Tap to expand
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={switchDockSide}
                title={`Switch to ${dockSide === 'right' ? 'left' : 'right'} side`}
                className="p-2 rounded-full text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <ArrowRightLeft size={14} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Flat Rectangular Navigation Bar for Android & Mobile (No Bent Edges) */
          <motion.nav
            key="bottom-flat-nav"
            role="navigation"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-[140] w-full select-none"
          >
            {/* Flat Rectangular Bar: Edge-to-edge, smart, high-contrast, no curved or bent corners */}
            <div className="bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-slate-100 border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl h-16 sm:h-17 px-3 sm:px-8 flex items-center justify-around rounded-none">

              {/* 1. Home Button - Latest Capsule Squircle Look */}
              <button
                type="button"
                onClick={() => onNavigate('home')}
                aria-label="Home Overview"
                className="group relative flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0"
              >
                <div
                  className={`w-10 h-7.5 sm:w-11 sm:h-8 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                    isHomeActive
                      ? 'bg-blue-500/15 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30 dark:ring-blue-400/30 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:bg-slate-100/80 dark:group-hover:bg-slate-800/50'
                  }`}
                >
                  <Home
                    size={19}
                    strokeWidth={isHomeActive ? 2.5 : 2}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isHomeActive ? 'scale-105' : ''
                    }`}
                  />
                  {isHomeActive && (
                    <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600" />
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isHomeActive
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : 'font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                >
                  Home
                </span>
                {isHomeActive ? (
                  <motion.span
                    layoutId="activeDockDot"
                    className="w-4 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-1 shadow-[0_1px_5px_rgba(37,99,235,0.4)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                ) : (
                  <span className="w-4 h-1 mt-1 opacity-0" />
                )}
              </button>

              {/* 2. Health Button (Direct to Monitor / Vitality) - Latest Capsule Squircle Look */}
              <button
                type="button"
                onClick={() => onNavigate('monitor')}
                aria-label="Health Bio-Telemetry"
                className="group relative flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0"
              >
                <div
                  className={`w-10 h-7.5 sm:w-11 sm:h-8 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                    isHealthActive
                      ? 'bg-rose-500/15 dark:bg-rose-400/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30 dark:ring-rose-400/30 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:bg-slate-100/80 dark:group-hover:bg-slate-800/50'
                  }`}
                >
                  <Heart
                    size={19}
                    strokeWidth={isHealthActive ? 2.5 : 2}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isHealthActive ? 'scale-105 fill-rose-500/20' : ''
                    }`}
                  />
                  {/* Micro Live Telemetry Pulse Beacon */}
                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                  </span>
                </div>
                <span
                  className={`text-[10px] sm:text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isHealthActive
                      ? 'font-bold text-rose-600 dark:text-rose-400'
                      : 'font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                >
                  Health
                </span>
                {isHealthActive ? (
                  <motion.span
                    layoutId="activeDockDot"
                    className="w-4 h-1 rounded-full bg-rose-600 dark:bg-rose-400 mt-1 shadow-[0_1px_5px_rgba(225,29,72,0.4)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                ) : (
                  <span className="w-4 h-1 mt-1 opacity-0" />
                )}
              </button>

              {/* 3. Center Promoted Elevated Circular App Buttons Launcher */}
              <div className="relative shrink-0 px-1 flex flex-col items-center justify-center">
                {/* Glowing Concentric Halo Effect */}
                <div className="absolute -inset-2 top-0 rounded-full bg-blue-500/25 blur-md -z-10 animate-pulse" />
                <div className="p-1 rounded-full bg-gradient-to-b from-blue-500/15 to-transparent">
                  <button
                    type="button"
                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                    title="Clinical App Buttons & All Modules Hub (16 Apps)"
                    aria-label="Clinical App Buttons & All Modules Hub"
                    className="w-13 h-13 sm:w-15 sm:h-15 -mt-5 sm:-mt-6 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center shadow-[0_8px_25px_rgba(37,99,235,0.5)] active:scale-95 hover:scale-105 transition-all cursor-pointer ring-4 ring-white dark:ring-slate-900 group relative"
                  >
                    {isSwitcherOpen ? (
                      <div className="flex flex-col items-center justify-center">
                        <X
                          size={22}
                          className="text-white drop-shadow-sm group-hover:rotate-90 transition-transform duration-300"
                        />
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-wider uppercase text-blue-100 leading-none mt-0.5">
                          Close
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {/* 4-App Square Grid Symbol representing App Buttons with +16 Counter */}
                        <div className="relative flex items-center justify-center">
                          <LayoutGrid
                            size={20}
                            strokeWidth={2.4}
                            className="text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                          />
                          {/* Mini "+16" indicator badge indicating all app buttons inside */}
                          <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full bg-cyan-400 text-blue-950 font-black text-[7px] leading-tight shadow-sm border border-white/60 tracking-tighter">
                            +16
                          </span>
                        </div>
                        {/* Clear text indicator right on the button face */}
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-wider uppercase text-blue-100 leading-none mt-1 font-mono">
                          Apps
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Subtitle label underneath aligned with Home, Health, Records, Profile */}
                <span
                  className={`text-[10px] sm:text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isSwitcherOpen
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : 'font-medium text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Apps
                </span>
                {isSwitcherOpen ? (
                  <motion.span
                    layoutId="activeDockDot"
                    className="w-4 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-1 shadow-[0_1px_5px_rgba(37,99,235,0.4)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                ) : (
                  <span className="w-4 h-1 mt-1 opacity-0" />
                )}
              </div>

              {/* 4. Records Button - Latest Capsule Squircle Look */}
              <button
                type="button"
                onClick={() => onNavigate('records')}
                aria-label="Medical Records & Vault"
                className="group relative flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0"
              >
                <div
                  className={`w-10 h-7.5 sm:w-11 sm:h-8 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                    isRecordsActive
                      ? 'bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 dark:ring-emerald-400/30 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:bg-slate-100/80 dark:group-hover:bg-slate-800/50'
                  }`}
                >
                  <Folder
                    size={19}
                    strokeWidth={isRecordsActive ? 2.5 : 2}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isRecordsActive ? 'scale-105' : ''
                    }`}
                  />
                  {isRecordsActive && (
                    <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isRecordsActive
                      ? 'font-bold text-emerald-600 dark:text-emerald-400'
                      : 'font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                >
                  Records
                </span>
                {isRecordsActive ? (
                  <motion.span
                    layoutId="activeDockDot"
                    className="w-4 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1 shadow-[0_1px_5px_rgba(5,150,105,0.4)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                ) : (
                  <span className="w-4 h-1 mt-1 opacity-0" />
                )}
              </button>

              {/* 5. Profile Button - Latest Capsule Squircle Look */}
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                aria-label="User Profile & Settings"
                className="group relative flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0"
              >
                <div
                  className={`w-10 h-7.5 sm:w-11 sm:h-8 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                    isProfileActive
                      ? 'bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 dark:ring-indigo-400/30 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:bg-slate-100/80 dark:group-hover:bg-slate-800/50'
                  }`}
                >
                  <User
                    size={19}
                    strokeWidth={isProfileActive ? 2.5 : 2}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isProfileActive ? 'scale-105' : ''
                    }`}
                  />
                  {isProfileActive && (
                    <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-600" />
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isProfileActive
                      ? 'font-bold text-indigo-600 dark:text-indigo-400'
                      : 'font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                >
                  Profile
                </span>
                {isProfileActive ? (
                  <motion.span
                    layoutId="activeDockDot"
                    className="w-4 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1 shadow-[0_1px_5px_rgba(79,70,229,0.4)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                ) : (
                  <span className="w-4 h-1 mt-1 opacity-0" />
                )}
              </button>

            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};
