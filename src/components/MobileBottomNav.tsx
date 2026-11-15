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
import { useAppLanguage } from '../utils/translations';

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
    label: 'Medication & Prescriptions',
    subtitle: 'Prescription studio & adherence tracker',
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
  // Unified native Android-style experience across Phone, Tablet, and Windows/Desktop views (no sidebar anywhere).
  return typeof window !== 'undefined';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
}) => {
  const [, , t] = useAppLanguage();
  const [isAllowedDevice, setIsAllowedDevice] = useState<boolean>(() => typeof window !== 'undefined');

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
  const [appCardMode, setAppCardMode] = useState<'grid' | 'detailed'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const openAppsCard = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.mode === 'detailed' || detail?.mode === 'grid') {
        setAppCardMode(detail.mode);
      }
      setIsSwitcherOpen(true);
      setIsCornerDocked(false);
    };
    const closeAppsCard = () => setIsSwitcherOpen(false);
    window.addEventListener('doctorian-open-apps-card', openAppsCard);
    window.addEventListener('doctorian-close-apps-card', closeAppsCard);
    return () => {
      window.removeEventListener('doctorian-open-apps-card', openAppsCard);
      window.removeEventListener('doctorian-close-apps-card', closeAppsCard);
    };
  }, []);

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
      {/* 1. Bottom Card for App Buttons Anchored at Footer Side */}
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
            className="fixed inset-0 z-[135] bg-[#020817]/70 backdrop-blur-md cursor-pointer"
          />
        )}
        {isSwitcherOpen && (
          <motion.div
            key="switcher-bottom-card"
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="fixed inset-x-0 bottom-[62px] sm:bottom-[66px] z-[138] pointer-events-none flex flex-col items-center justify-end px-2.5 sm:px-5"
          >
            <div className="pointer-events-auto w-full max-w-2xl mx-auto doctorian-thick-card bg-[#071530]/96 dark:bg-[#051026]/98 border-cyan-500/40 p-3 sm:p-4 shadow-[0_-14px_42px_rgba(0,180,255,0.22)] max-h-[54vh] flex flex-col overflow-hidden">
              {/* Top Drag Handle + Card Title */}
              <div className="w-9 h-1 rounded-full bg-cyan-400/40 mx-auto mb-2 shrink-0" />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md border border-cyan-300/40">
                    <LayoutGrid size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
                      {t('All Clinical Apps')} <span className="text-cyan-400">({CLINICAL_MODULES_REGISTRY.length})</span>
                    </h3>
                    <p className="text-[10px] text-slate-300 font-semibold">
                      {t('Quick Actions')} · {t('Tap a clinical module')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Switch between Compact App Grid & Full App Hub */}
                  <div className="flex items-center p-0.5 rounded-xl bg-[#040c1e] border border-blue-900/60">
                    <button
                      type="button"
                      onClick={() => setAppCardMode('grid')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        appCardMode === 'grid'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {t('Grid')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppCardMode('detailed')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        appCardMode === 'detailed'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {t('All Details')}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      setSearchQuery('');
                    }}
                    className="h-8 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-b-2 border-slate-600/80 text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
                    title={t('Close')}
                  >
                    <X size={13} />
                    <span>{t('Close')}</span>
                  </button>
                </div>
              </div>

              {appCardMode === 'grid' && (
                <div className="relative mb-2 shrink-0">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/75 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('Search 16 clinical apps...')}
                    className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#040c1e]/90 border border-cyan-500/30 text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-cyan-400 shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Scrollable Compact Thick App Buttons Grid or Detailed Hub */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                {appCardMode === 'detailed' ? (
                  <AndroidAppButtons
                    currentView={currentView}
                    onNavigate={(viewId) => {
                      onNavigate(viewId);
                    }}
                    onItemClick={() => {
                      setIsSwitcherOpen(false);
                      setSearchQuery('');
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2 py-0.5">
                    {CLINICAL_MODULES_REGISTRY.filter((btn) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase().trim();
                      return (
                        btn.label.toLowerCase().includes(q) ||
                        t(btn.label).toLowerCase().includes(q) ||
                        btn.subtitle.toLowerCase().includes(q) ||
                        btn.categoryLabel.toLowerCase().includes(q)
                      );
                    }).map((btn, index) => {
                      const isActive = currentView === btn.id;
                      const IconComp = btn.icon;

                      return (
                        <motion.button
                          key={`bottom-app-${btn.id}`}
                          type="button"
                          initial={{ opacity: 0, scale: 0.92, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{
                            type: 'spring',
                            damping: 22,
                            stiffness: 360,
                            delay: Math.min(index * 0.012, 0.16),
                          }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            onNavigate(btn.id);
                            setIsSwitcherOpen(false);
                            setSearchQuery('');
                          }}
                          className={`group flex flex-col items-center justify-center p-2 rounded-xl border-2 border-b-[3px] transition-all cursor-pointer select-none relative ${
                            isActive
                              ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_6px_16px_rgba(0,210,255,0.3)]'
                              : 'bg-[#0b1b3a]/90 hover:bg-[#10254f] border-blue-800/70 hover:border-cyan-400/70 shadow-md'
                          }`}
                        >
                          <div className="relative mb-1.5">
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${btn.theme.iconGradient} text-white flex items-center justify-center shadow-[0_6px_14px_rgba(0,0,0,0.35)] border border-white/25 transition-transform duration-200 group-hover:scale-105`}
                            >
                              <IconComp size={18} className="text-white drop-shadow-sm" />
                            </div>
                            {btn.isUrgent ? (
                              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-500 text-[7px] font-black text-white uppercase shadow animate-pulse">
                                SOS
                              </span>
                            ) : btn.badge ? (
                              <span className="absolute -top-1 -right-1.5 px-1 py-0.2 rounded-full bg-slate-950/90 text-[6.5px] font-black text-cyan-300 uppercase border border-cyan-400/40 shadow">
                                {btn.badge.replace(' FREE', '').replace(' AI', '').replace(' LIVE', '').slice(0, 6)}
                              </span>
                            ) : null}
                          </div>

                          <span className="text-[10px] font-extrabold text-white text-center leading-tight line-clamp-1">
                            {t(btn.label)}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
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
          /* Unified Native Bottom Dock Card for Android, Tablet, and Desktop */
          <motion.nav
            key="bottom-flat-nav"
            role="navigation"
            aria-label="Primary App Dock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-[140] w-full select-none"
          >
            <div className="bg-white/96 dark:bg-[#05122c]/96 text-slate-900 dark:text-slate-100 border-t-2 border-slate-200 dark:border-cyan-500/45 shadow-[0_-10px_28px_rgba(15,23,42,0.12)] dark:shadow-[0_-10px_32px_rgba(0,190,255,0.2)] backdrop-blur-2xl min-h-[54px] sm:min-h-[58px] pb-[env(safe-area-inset-bottom,0px)] px-2 sm:px-5 flex items-center justify-around max-w-xl sm:max-w-2xl mx-auto md:rounded-t-2xl md:border-x-2">

              {/* 1. Home Button */}
              <button
                type="button"
                onClick={() => {
                  setIsSwitcherOpen(false);
                  onNavigate('home');
                }}
                aria-label={t('Home')}
                className="group relative flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0"
              >
                <div
                  className={`w-9.5 h-6.5 sm:w-10.5 sm:h-7 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                    isHomeActive
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border border-b-2 border-cyan-300/60 shadow-[0_4px_12px_rgba(14,165,233,0.4)]'
                      : 'text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100/80 dark:group-hover:bg-white/10'
                  }`}
                >
                  <Home size={16} strokeWidth={isHomeActive ? 2.6 : 2} />
                </div>
                <span
                  className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isHomeActive
                      ? 'font-black text-cyan-600 dark:text-cyan-300'
                      : 'font-semibold text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('Home')}
                </span>
              </button>

              {/* 2. Health Button */}
              <button
                type="button"
                onClick={() => {
                  setIsSwitcherOpen(false);
                  onNavigate('vitality');
                }}
                aria-label={t('Health')}
                className="group relative flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0"
              >
                <div
                  className={`w-9.5 h-6.5 sm:w-10.5 sm:h-7 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                    isHealthActive
                      ? 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white border border-b-2 border-rose-300/60 shadow-[0_4px_12px_rgba(244,63,94,0.4)]'
                      : 'text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100/80 dark:group-hover:bg-white/10'
                  }`}
                >
                  <Heart size={16} strokeWidth={isHealthActive ? 2.6 : 2} />
                  <span className="absolute top-0.5 right-0.5 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                  </span>
                </div>
                <span
                  className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isHealthActive
                      ? 'font-black text-rose-500 dark:text-rose-400'
                      : 'font-semibold text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('Health')}
                </span>
              </button>

              {/* 3. Center Promoted Sleek App Buttons Card Launcher */}
              <div className="relative shrink-0 px-1 flex flex-col items-center justify-center">
                <div className="absolute -inset-1 top-0 rounded-full bg-cyan-500/25 blur-sm -z-10 animate-pulse" />
                <button
                  type="button"
                  onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                  title={`${t('Apps')} (+16)`}
                  aria-label={`${t('Apps')} (+16)`}
                  className="w-11 h-11 sm:w-12 sm:h-12 -mt-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(0,210,255,0.48)] active:scale-95 hover:scale-105 transition-all cursor-pointer border-2 border-b-[3px] border-cyan-200/70 ring-2 ring-white dark:ring-[#05122c] group relative"
                >
                  {isSwitcherOpen ? (
                    <div className="flex flex-col items-center justify-center">
                      <X size={17} className="text-white drop-shadow-sm" />
                      <span className="text-[7px] font-black uppercase text-cyan-100 leading-none mt-0.5">
                        {t('Close')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <LayoutGrid size={17} strokeWidth={2.5} className="text-white drop-shadow-sm" />
                      <span className="text-[7px] font-black uppercase text-cyan-100 leading-none mt-0.5">
                        {t('Apps')}
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {/* 4. Records Button */}
              <button
                type="button"
                onClick={() => {
                  setIsSwitcherOpen(false);
                  onNavigate('records');
                }}
                aria-label={t('Records')}
                className="group relative flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0"
              >
                <div
                  className={`w-9.5 h-6.5 sm:w-10.5 sm:h-7 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                    isRecordsActive
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white border border-b-2 border-emerald-300/60 shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                      : 'text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100/80 dark:group-hover:bg-white/10'
                  }`}
                >
                  <Folder size={16} strokeWidth={isRecordsActive ? 2.6 : 2} />
                </div>
                <span
                  className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isRecordsActive
                      ? 'font-black text-emerald-600 dark:text-emerald-400'
                      : 'font-semibold text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('Records')}
                </span>
              </button>

              {/* 5. Profile / Settings Button */}
              <button
                type="button"
                onClick={() => {
                  setIsSwitcherOpen(false);
                  onNavigate('settings');
                }}
                aria-label={t('Profile')}
                className="group relative flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-95 cursor-pointer min-w-0"
              >
                <div
                  className={`w-9.5 h-6.5 sm:w-10.5 sm:h-7 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                    isProfileActive || currentView === 'settings'
                      ? 'bg-gradient-to-tr from-indigo-500 to-blue-600 text-white border border-b-2 border-indigo-300/60 shadow-[0_4px_12px_rgba(99,102,241,0.4)]'
                      : 'text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100/80 dark:group-hover:bg-white/10'
                  }`}
                >
                  <User size={16} strokeWidth={isProfileActive || currentView === 'settings' ? 2.6 : 2} />
                </div>
                <span
                  className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isProfileActive || currentView === 'settings'
                      ? 'font-black text-indigo-600 dark:text-indigo-400'
                      : 'font-semibold text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('Profile')}
                </span>
              </button>

            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};
