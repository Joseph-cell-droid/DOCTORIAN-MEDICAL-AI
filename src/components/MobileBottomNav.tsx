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
} from 'lucide-react';
import { AndroidAppButtons } from './AndroidAppButtons';

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
              className="relative w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
            >
              {/* Top Handle */}
              <div className="w-full pt-3 pb-2 flex justify-center shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Sheet Header */}
              <div className="px-5 sm:px-6 pb-3 pt-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                    App Buttons & Clinical Pages
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Quickly switch across medical monitoring & triage modules
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSwitcherOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sheet Body with App Buttons */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 no-scrollbar">
                {/* Horizontal Squircle Buttons Row (Image 2 Top) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Quick Access
                    </span>
                    <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                      Tap any to open
                    </span>
                  </div>
                  <AndroidAppButtons
                    variant="horizontal_row"
                    currentView={currentView}
                    onNavigate={onNavigate}
                    onItemClick={() => setIsSwitcherOpen(false)}
                  />
                </div>

                {/* Vertical App Buttons List (Image 1) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      All Clinical Modules
                    </span>
                  </div>
                  <AndroidAppButtons
                    variant="vertical_list"
                    currentView={currentView}
                    onNavigate={onNavigate}
                    onItemClick={() => setIsSwitcherOpen(false)}
                  />
                </div>
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
                  <Sparkles size={16} />
                </div>
                <div className="flex flex-col pr-1">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {activePageMeta.label.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                    Tap to expand
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
            <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-full shadow-[0_12px_45px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.7)] backdrop-blur-2xl h-16 sm:h-18 px-3 sm:px-5 flex items-center justify-between gap-1 sm:gap-2">
              {/* Optional Mini Left Slide Trigger */}
              <button
                type="button"
                onClick={() => toggleCornerDock('left')}
                title="Slide to left corner (<<)"
                className="p-1.5 rounded-full text-slate-300 hover:text-blue-600 dark:text-slate-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <ChevronsLeft size={16} className="stroke-[2.5]" />
              </button>

              {/* 1. Home Button */}
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className={`flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0 ${
                  isHomeActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Home size={22} className="shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 leading-none">
                  Home
                </span>
                {isHomeActive ? (
                  <motion.span
                    layoutId="activeDockDot"
                    className="w-3.5 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-1"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                ) : (
                  <span className="w-3.5 h-1 mt-1 opacity-0" />
                )}
              </button>

              {/* 2. Health Button (Direct to Monitor / Vitality) */}
              <button
                type="button"
                onClick={() => onNavigate('monitor')}
                className={`flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0 ${
                  isHealthActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Heart size={22} className="shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 leading-none">
                  Health
                </span>
                {isHealthActive ? (
                  <motion.span
                    layoutId="activeDockDot"
                    className="w-3.5 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-1"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                ) : (
                  <span className="w-3.5 h-1 mt-1 opacity-0" />
                )}
              </button>

              {/* 3. Center Promoted Elevated Circular Sparkle Button (Image 2) */}
              <div className="relative shrink-0 px-1">
                {/* Glowing Concentric Halo Effect */}
                <div className="absolute -inset-2 rounded-full bg-blue-500/20 blur-md -z-10 animate-pulse" />
                <div className="p-1 rounded-full bg-gradient-to-b from-blue-500/10 to-transparent">
                  <button
                    type="button"
                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                    title="Open App Buttons Drawer"
                    className="w-13 h-13 sm:w-15 sm:h-15 -mt-5 sm:-mt-6 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,99,235,0.5)] active:scale-95 hover:scale-105 transition-all cursor-pointer ring-4 ring-white dark:ring-slate-900 group"
                  >
                    <Sparkles
                      size={24}
                      className="text-white drop-shadow-sm group-hover:rotate-12 transition-transform duration-300"
                    />
                  </button>
                </div>
              </div>

              {/* 4. Records Button */}
              <button
                type="button"
                onClick={() => onNavigate('records')}
                className={`flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0 ${
                  isRecordsActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Folder size={22} className="shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 leading-none">
                  Records
                </span>
                {isRecordsActive ? (
                  <motion.span
                    layoutId="activeDockDot"
                    className="w-3.5 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-1"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                ) : (
                  <span className="w-3.5 h-1 mt-1 opacity-0" />
                )}
              </button>

              {/* 5. Profile Button */}
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className={`flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0 ${
                  isProfileActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <User size={22} className="shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 leading-none">
                  Profile
                </span>
                {isProfileActive ? (
                  <motion.span
                    layoutId="activeDockDot"
                    className="w-3.5 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-1"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                ) : (
                  <span className="w-3.5 h-1 mt-1 opacity-0" />
                )}
              </button>

              {/* Optional Mini Right Slide Trigger */}
              <button
                type="button"
                onClick={() => toggleCornerDock('right')}
                title="Slide to right corner (>>)"
                className="p-1.5 rounded-full text-slate-300 hover:text-blue-600 dark:text-slate-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <ChevronsRight size={16} className="stroke-[2.5]" />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};
