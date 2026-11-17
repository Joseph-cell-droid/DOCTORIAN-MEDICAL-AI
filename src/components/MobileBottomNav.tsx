import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Folder,
  User as UserIcon,
  Sparkles,
  Bot,
  Monitor,
  Pill,
  Activity,
  Calendar,
  FlaskConical,
  ShieldCheck,
  X,
  Search,
  Layers,
  HardDrive,
  LayoutGrid,
  Mic,
  MessageSquare,
  PhoneCall,
  Bell,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sun,
  Moon,
  LogOut,
  LogIn
} from 'lucide-react';
import { AndroidAppButtons, CLINICAL_MODULES_REGISTRY } from './AndroidAppButtons';
import { useAppLanguage, SUPPORTED_LANGUAGES, normalizeLanguageCode, setAppLanguage } from '../utils/translations';
import type { User } from '../api';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMenu?: () => void;
  user?: User | null;
  unreadAlertsCount?: number;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  onGoPrev?: () => void;
  onGoNext?: () => void;
  onOpenSearch?: () => void;
  onOpenVoiceCall?: () => void;
  onOpenVault?: () => void;
  onOpenAlerts?: () => void;
  onOpenProfileModal?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  currentLanguage?: string;
  onChangeLanguage?: (lang: string) => void;
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

export const ALL_APP_PAGES: PageItem[] = [
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
    badge: 'AI',
  },
  {
    id: 'server_network',
    label: 'SMS Hub & Care Mesh',
    subtitle: 'Friend requests & commercial SMS',
    category: 'core',
    icon: <MessageSquare size={20} className="text-cyan-600" />,
    badge: 'SMS',
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
  },
  {
    id: 'meds',
    label: 'Medication & Prescriptions',
    subtitle: 'Prescription studio & adherence',
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
    subtitle: 'Encrypted files & records',
    category: 'core',
    icon: <HardDrive size={20} className="text-indigo-600" />,
  },
  {
    id: 'app_medics',
    label: 'App Medics (Uganda)',
    subtitle: 'E-pharmacy & deliveries',
    category: 'core',
    icon: <Pill size={20} className="text-emerald-500" />,
  },
  {
    id: 'ambient_scribe',
    label: 'Ambient SOAP Scribe',
    subtitle: 'Multilingual speech-to-SOAP notes',
    category: 'diag',
    icon: <Mic size={20} className="text-blue-600" />,
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
    subtitle: 'Cognitive neuro-mapping',
    category: 'diag',
    icon: <Monitor size={20} className="text-indigo-600" />,
  },
  {
    id: 'profile',
    label: 'Profile & Settings',
    subtitle: 'Account & biometric parameters',
    category: 'specialized',
    icon: <UserIcon size={20} className="text-blue-600" />,
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

export function isAndroidOrTabletDevice(): boolean {
  return typeof window !== 'undefined';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  user,
  unreadAlertsCount = 0,
  canGoPrev = false,
  canGoNext = false,
  onGoPrev,
  onGoNext,
  onOpenSearch,
  onOpenVoiceCall,
  onOpenVault,
  onOpenAlerts,
  onOpenProfileModal,
  onOpenAuth,
  onLogout,
  isDarkMode = true,
  onToggleTheme,
  currentLanguage = 'English',
  onChangeLanguage,
}) => {
  const [, , t] = useAppLanguage();
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
    };
    const closeAppsCard = () => setIsSwitcherOpen(false);
    window.addEventListener('doctorian-open-apps-card', openAppsCard);
    window.addEventListener('doctorian-close-apps-card', closeAppsCard);
    return () => {
      window.removeEventListener('doctorian-open-apps-card', openAppsCard);
      window.removeEventListener('doctorian-close-apps-card', closeAppsCard);
    };
  }, []);

  if (typeof window === 'undefined' || currentView === 'ai_nexus') {
    return null;
  }

  const isHomeActive = currentView === 'home';
  const isAiActive = currentView === 'ai_nexus' || currentView === 'symptoms';
  const isSmsActive = currentView === 'server_network' || currentView === 'gsm_sms_gateway';
  const isAccountActive = currentView === 'profile' || currentView === 'settings' || currentView === 'billing' || currentView === 'admin';

  const closeSheetAndRun = (fn?: () => void) => {
    setIsSwitcherOpen(false);
    setSearchQuery('');
    fn?.();
  };

  return (
    <>
      {/* Expandable Smart App Hub & Command Drawer (Houses smart actions cleanly without crowding top bar) */}
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
            className="fixed inset-0 z-[135] bg-slate-950/65 backdrop-blur-sm cursor-pointer"
          />
        )}
        {isSwitcherOpen && (
          <motion.div
            key="switcher-bottom-card"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-x-0 bottom-[74px] sm:bottom-[78px] z-[138] pointer-events-none flex flex-col items-center justify-end px-2.5 sm:px-5"
          >
            <div className="pointer-events-auto w-full max-w-2xl mx-auto rounded-3xl bg-white/98 dark:bg-[#07132c]/98 border border-slate-200 dark:border-cyan-500/35 p-3.5 sm:p-4 shadow-2xl max-h-[72vh] flex flex-col overflow-hidden text-slate-900 dark:text-white">
              {/* Top Handle & Smart Account Summary */}
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-cyan-400/35 mx-auto mb-2.5 shrink-0" />

              <div className="flex items-center justify-between gap-2 pb-3 mb-2.5 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => closeSheetAndRun(onOpenProfileModal)}
                  className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'DR'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-cyan-500">
                      {user?.displayName || 'Doctorian Member'}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {user?.role || 'guest'} · {user?.smsCredits ?? 25} SMS credits
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onGoPrev && (
                    <button
                      type="button"
                      disabled={!canGoPrev}
                      onClick={() => closeSheetAndRun(onGoPrev)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        canGoPrev
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white cursor-pointer hover:border-cyan-400'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Previous Page"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={15} />
                    </button>
                  )}
                  {onGoNext && (
                    <button
                      type="button"
                      disabled={!canGoNext}
                      onClick={() => closeSheetAndRun(onGoNext)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        canGoNext
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white cursor-pointer hover:border-cyan-400'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Next Page"
                      aria-label="Next Page"
                    >
                      <ChevronRight size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                    aria-label={t('Close')}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Quick Smart Actions Strip (Replaces Upper Bar Functions Cleanly) */}
              <div className="grid grid-cols-4 gap-1.5 mb-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => closeSheetAndRun(onOpenAlerts)}
                  className="relative p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/15 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Bell size={15} className={unreadAlertsCount > 0 ? 'text-rose-500' : 'text-cyan-600 dark:text-cyan-400'} />
                  <span className="text-[10px] font-bold truncate max-w-full">Live Alerts</span>
                  {unreadAlertsCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center tabular-nums">
                      {unreadAlertsCount > 99 ? '99+' : unreadAlertsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => closeSheetAndRun(onOpenVoiceCall)}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/15 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <PhoneCall size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-bold truncate max-w-full">Call &amp; SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => closeSheetAndRun(onOpenVault)}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/15 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <HardDrive size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] font-bold truncate max-w-full">1GB Vault</span>
                </button>

                <button
                  type="button"
                  onClick={() => closeSheetAndRun(onOpenSearch)}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/15 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Search size={15} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-bold truncate max-w-full">Search App</span>
                </button>
              </div>

              {/* Compact Preferences Row: Language, Theme, Auth Switch */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 px-1 shrink-0" data-no-translate>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex items-center">
                    <Globe size={12} className="absolute left-2.5 text-cyan-500 pointer-events-none" />
                    <select
                      aria-label="Language"
                      value={normalizeLanguageCode(currentLanguage)}
                      onChange={(e) => {
                        const canonical = setAppLanguage(e.target.value);
                        onChangeLanguage?.(canonical);
                      }}
                      className="pl-7 pr-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-800 dark:text-white cursor-pointer focus:outline-none"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                          {lang.nativeLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {onToggleTheme && (
                    <button
                      type="button"
                      onClick={onToggleTheme}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {isDarkMode ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} className="text-indigo-500" />}
                      <span>{isDarkMode ? 'Light' : 'Dark'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAppCardMode(appCardMode === 'grid' ? 'detailed' : 'grid')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    {appCardMode === 'grid' ? 'Detailed List' : 'Compact Grid'}
                  </button>
                  {user && user.role !== 'guest' && onLogout ? (
                    <button
                      type="button"
                      onClick={() => closeSheetAndRun(onLogout)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut size={12} />
                      <span>Sign Out</span>
                    </button>
                  ) : onOpenAuth ? (
                    <button
                      type="button"
                      onClick={() => closeSheetAndRun(onOpenAuth)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogIn size={12} />
                      <span>Sign In</span>
                    </button>
                  ) : null}
                </div>
              </div>

              {appCardMode === 'grid' && (
                <div className="relative mb-2 shrink-0">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('Filter clinical apps...')}
                    className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-cyan-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Clinical Modules Grid or Detailed List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                {appCardMode === 'detailed' ? (
                  <AndroidAppButtons
                    currentView={currentView}
                    onNavigate={(viewId) => onNavigate(viewId)}
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
                        btn.subtitle.toLowerCase().includes(q)
                      );
                    }).map((btn) => {
                      const isActive = currentView === btn.id;
                      const IconComp = btn.icon;
                      return (
                        <button
                          key={`bottom-app-${btn.id}`}
                          type="button"
                          onClick={() => {
                            onNavigate(btn.id);
                            setIsSwitcherOpen(false);
                            setSearchQuery('');
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                            isActive
                              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300'
                              : 'bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/70'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${btn.theme.iconGradient} text-white flex items-center justify-center shadow-sm mb-1`}
                          >
                            <IconComp size={17} />
                          </div>
                          <span className="text-[10px] font-bold text-center leading-tight line-clamp-1">
                            {t(btn.label)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Uncrowded Floating Bottom App Navigation Bar */}
      <nav
        role="navigation"
        aria-label="Modern App Navigation"
        className="fixed bottom-2.5 sm:bottom-3.5 left-2.5 right-2.5 z-[140] pointer-events-none select-none pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="pointer-events-auto max-w-lg mx-auto rounded-2xl bg-white/95 dark:bg-[#06132b]/95 border border-slate-200/90 dark:border-cyan-500/35 shadow-[0_12px_36px_rgba(2,12,35,0.2)] dark:shadow-[0_12px_38px_rgba(0,180,255,0.2)] backdrop-blur-2xl px-2 py-1.5 flex items-center justify-between gap-1">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => {
              setIsSwitcherOpen(false);
              onNavigate('home');
            }}
            aria-label={t('Home')}
            className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <div
              className={`w-9 h-6 rounded-lg flex items-center justify-center transition-colors ${
                isHomeActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Home size={16} strokeWidth={isHomeActive ? 2.5 : 2} />
            </div>
            <span
              className={`text-[10px] leading-none whitespace-nowrap ${
                isHomeActive ? 'font-black text-blue-600 dark:text-cyan-300' : 'font-semibold text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('Home')}
            </span>
          </button>

          {/* 2. Care AI */}
          <button
            type="button"
            onClick={() => {
              setIsSwitcherOpen(false);
              onNavigate('ai_nexus');
            }}
            aria-label={t('Care AI')}
            className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <div
              className={`w-9 h-6 rounded-lg flex items-center justify-center transition-colors ${
                isAiActive
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Bot size={16} strokeWidth={isAiActive ? 2.5 : 2} />
            </div>
            <span
              className={`text-[10px] leading-none whitespace-nowrap ${
                isAiActive ? 'font-black text-violet-600 dark:text-violet-300' : 'font-semibold text-slate-600 dark:text-slate-300'
              }`}
            >
              Care AI
            </span>
          </button>

          {/* 3. Center Smart Hub Button */}
          <div className="relative px-1 flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setIsSwitcherOpen((o) => !o)}
              aria-label={t('Menu')}
              aria-expanded={isSwitcherOpen}
              className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 shadow-lg ${
                isSwitcherOpen
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white'
              }`}
            >
              {isSwitcherOpen ? <X size={17} strokeWidth={2.5} /> : <LayoutGrid size={17} strokeWidth={2.5} />}
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">
                {isSwitcherOpen ? t('Close') : t('Menu')}
              </span>
            </button>
            {unreadAlertsCount > 0 && !isSwitcherOpen && (
              <span className="absolute -top-1 right-0 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#06132b] tabular-nums pointer-events-none">
                {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
              </span>
            )}
          </div>

          {/* 4. SMS Hub */}
          <button
            type="button"
            onClick={() => {
              setIsSwitcherOpen(false);
              onNavigate('server_network');
            }}
            aria-label="SMS Hub"
            className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <div
              className={`w-9 h-6 rounded-lg flex items-center justify-center transition-colors ${
                isSmsActive
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <MessageSquare size={16} strokeWidth={isSmsActive ? 2.5 : 2} />
            </div>
            <span
              className={`text-[10px] leading-none whitespace-nowrap ${
                isSmsActive ? 'font-black text-cyan-600 dark:text-cyan-300' : 'font-semibold text-slate-600 dark:text-slate-300'
              }`}
            >
              SMS Hub
            </span>
          </button>

          {/* 5. Account */}
          <button
            type="button"
            onClick={() => {
              setIsSwitcherOpen(false);
              onNavigate('settings');
            }}
            aria-label="Account"
            className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <div
              className={`w-9 h-6 rounded-lg flex items-center justify-center transition-colors ${
                isAccountActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <UserIcon size={16} strokeWidth={isAccountActive ? 2.5 : 2} />
            </div>
            <span
              className={`text-[10px] leading-none whitespace-nowrap ${
                isAccountActive ? 'font-black text-indigo-600 dark:text-indigo-300' : 'font-semibold text-slate-600 dark:text-slate-300'
              }`}
            >
              Account
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
