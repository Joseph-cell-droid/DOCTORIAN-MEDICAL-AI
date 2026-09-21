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
    id: 'emergency',
    label: 'Emergency SOS 911',
    subtitle: 'Get immediate help',
    category: 'core',
    icon: <AlertTriangle size={20} className="text-red-500" />,
    badge: 'SOS',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },

  // Diagnostics & Pathology
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
 * Checks if the current client is an Android device, a tablet (iPad, Android tablet),
 * or viewed in a mobile/tablet viewport or iframe preview.
 */
export function isAndroidOrTabletDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();

  // 1. Android Detection (All Android phones, foldables, and tablets)
  const isAndroid = ua.includes('android');

  // 2. iPad Detection (including iPadOS where Safari identifies as MacIntel with multi-touch)
  const isIPad =
    ua.includes('ipad') ||
    (platform.includes('macintel') && navigator.maxTouchPoints > 1 && !ua.includes('iphone'));

  // 3. Dedicated Tablet Detection (Android Tablets, Kindle Fire, Silk, PlayBook)
  const isGenericTablet = /(tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua);

  // 4. Other Mobile Phones (iPhone, iPod, handheld mobile browsers)
  const isMobileHandheld = /(mobi|iphone|ipod|blackberry|iemobile|opera mini)/i.test(ua);

  const width = window.innerWidth;
  const isInIframe = window.self !== window.top;

  // If in an iframe preview (such as AI Studio preview) or width <= 1280px, allow preview
  if (isInIframe && width <= 1280) {
    return true;
  }

  // If confirmed Android (phone or tablet) -> Show
  if (isAndroid) {
    return true;
  }

  // If confirmed iPad or Tablet -> Show
  if (isIPad || isGenericTablet) {
    return true;
  }

  // If mobile handheld -> Show
  if (isMobileHandheld) {
    return true;
  }

  // If viewport is mobile/tablet size (< 1024px) -> Show
  if (width < 1024) {
    return true;
  }

  // Laptops and desktops with large screens -> Hide
  return false;
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

  // If not on Android or Tablet, do not render the bottom bar at all
  if (!isAllowedDevice) {
    return null;
  }

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

  const activePageMeta = useMemo(() => {
    return ALL_APP_PAGES.find((p) => p.id === currentView) || ALL_APP_PAGES[0];
  }, [currentView]);

  const isHomeActive = currentView === 'home';
  const isHealthActive = currentView === 'monitor' || currentView === 'vitality';
  const isRecordsActive = currentView === 'records' || currentView === 'health_trace';
  const isProfileActive = currentView === 'profile' || currentView === 'admin';

  // In the dedicated full-screen AI Consultation view, hide MobileBottomNav
  // so it never blocks or overlaps the chatbot's bottom text card and input controls.
  if (currentView === 'ai_nexus') {
    return null;
  }

  return (
    <>
      {/* 1. App Buttons Full Drawer / Modal (Matching Image 1 and Image 2) */}
      <AnimatePresence>
        {isSwitcherOpen && (
          <div className="fixed inset-0 z-[150] flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSwitcherOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal / Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-2xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800 rounded-t-[2.2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Top Handle */}
              <div className="w-full pt-3 pb-1.5 flex justify-center shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Sheet Header - Modern Doctorian Look */}
              <div className="px-5 sm:px-6 pb-3 pt-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <LayoutGrid size={15} strokeWidth={2.4} />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                      Clinical App Buttons & Hub
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 font-mono">
                      16 Modules
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tap any app button below to navigate between diagnostic modules & tools
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSwitcherOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Navigation Drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sheet Body with Intelligent Non-Repeating App Buttons & Directory */}
              <div className="p-4 sm:p-5 overflow-y-auto no-scrollbar">
                <AndroidAppButtons
                  currentView={currentView}
                  onNavigate={onNavigate}
                  onItemClick={() => setIsSwitcherOpen(false)}
                />
              </div>
            </motion.div>
          </div>
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
          /* The Curved Floating Navigation Bar (Image 2) */
          <motion.nav
            key="bottom-floating-nav"
            role="navigation"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 340 }}
            className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-[140] w-auto max-w-lg sm:max-w-xl select-none"
          >
            {/* The Main Curved Capsule */}
            <div className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-full shadow-[0_16px_40px_-10px_rgba(0,0,0,0.16)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl h-17 sm:h-19 px-2 sm:px-4 flex items-center justify-between gap-1">
              {/* Sleek Mini Left Slide Trigger */}
              <button
                type="button"
                onClick={() => toggleCornerDock('left')}
                title="Slide to left corner (<<)"
                className="w-6 h-9 rounded-full bg-slate-100/60 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <ChevronsLeft size={15} className="stroke-[2.5]" />
              </button>

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
                        {/* 4-App Square Grid Symbol representing App Buttons */}
                        <div className="relative">
                          <LayoutGrid
                            size={21}
                            strokeWidth={2.4}
                            className="text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                          />
                          {/* Mini indicator dot showing more app buttons inside */}
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 border border-blue-600" />
                          </span>
                        </div>
                        {/* Clear text indicator right on the button face */}
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-wider uppercase text-blue-100 leading-none mt-0.5 font-mono">
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

              {/* Sleek Mini Right Slide Trigger */}
              <button
                type="button"
                onClick={() => toggleCornerDock('right')}
                title="Slide to right corner (>>)"
                className="w-6 h-9 rounded-full bg-slate-100/60 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <ChevronsRight size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};
