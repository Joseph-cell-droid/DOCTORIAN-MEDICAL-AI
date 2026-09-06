import React from 'react';
import {
  Home,
  Bot,
  Sparkles,
  Monitor,
  Pill,
  Activity,
  Calendar,
  AlertTriangle,
  FlaskConical,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  HardDrive,
} from 'lucide-react';

export interface AppButtonItem {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: {
    bg: string;
    text: string;
    darkBg: string;
    darkText: string;
    ring?: string;
  };
  hasNotificationDot?: boolean;
  isUrgent?: boolean;
  section?: 'main' | 'diagnostics';
}

export const APP_BUTTONS_CONFIG: AppButtonItem[] = [
  {
    id: 'home',
    label: 'Clinical Dashboard',
    subtitle: 'Overview of your health',
    icon: Home,
    color: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      darkBg: 'dark:bg-blue-950/40',
      darkText: 'dark:text-blue-400',
    },
    section: 'main',
  },
  {
    id: 'ai_nexus',
    label: 'AI Consultation',
    subtitle: 'Chat with AI doctor',
    icon: Bot,
    color: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      darkBg: 'dark:bg-purple-950/40',
      darkText: 'dark:text-purple-400',
    },
    hasNotificationDot: true,
    section: 'main',
  },
  {
    id: 'symptoms',
    label: 'Symptom Triage',
    subtitle: 'Analyze your symptoms',
    icon: Sparkles,
    color: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-500',
      darkBg: 'dark:bg-emerald-950/40',
      darkText: 'dark:text-emerald-400',
    },
    section: 'main',
  },
  {
    id: 'monitor',
    label: 'Bio-Telemetry Monitor',
    subtitle: 'Real-time health tracking',
    icon: Monitor,
    color: {
      bg: 'bg-amber-50',
      text: 'text-amber-500',
      darkBg: 'dark:bg-amber-950/40',
      darkText: 'dark:text-amber-400',
    },
    section: 'main',
  },
  {
    id: 'meds',
    label: 'Precision Pharmacy',
    subtitle: 'AI-powered medication guidance',
    icon: Pill,
    color: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      darkBg: 'dark:bg-blue-950/40',
      darkText: 'dark:text-blue-400',
    },
    section: 'main',
  },
  {
    id: 'vitality',
    label: 'Vitality Matrix',
    subtitle: 'Track your wellness score',
    icon: Activity,
    color: {
      bg: 'bg-rose-50',
      text: 'text-rose-500',
      darkBg: 'dark:bg-rose-950/40',
      darkText: 'dark:text-rose-400',
    },
    section: 'main',
  },
  {
    id: 'clinical_roadmap',
    label: 'Appointments & Visits',
    subtitle: 'Manage your schedule',
    icon: Calendar,
    color: {
      bg: 'bg-sky-50',
      text: 'text-sky-500',
      darkBg: 'dark:bg-sky-950/40',
      darkText: 'dark:text-sky-400',
    },
    section: 'main',
  },
  {
    id: 'storage_vault',
    label: '1GB Cloud Storage',
    subtitle: 'Free 1GB vault for files & docs',
    icon: HardDrive,
    color: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      darkBg: 'dark:bg-indigo-950/40',
      darkText: 'dark:text-indigo-400',
    },
    section: 'main',
  },
  {
    id: 'emergency',
    label: 'Emergency SOS 911',
    subtitle: 'Get immediate help',
    icon: AlertTriangle,
    color: {
      bg: 'bg-red-50',
      text: 'text-red-500',
      darkBg: 'dark:bg-red-950/40',
      darkText: 'dark:text-red-400',
    },
    isUrgent: true,
    section: 'main',
  },
  {
    id: 'diagnostic_lab',
    label: 'Laboratory Analyser',
    subtitle: 'Advanced lab analysis',
    icon: FlaskConical,
    color: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      darkBg: 'dark:bg-purple-950/40',
      darkText: 'dark:text-purple-400',
    },
    section: 'diagnostics',
  },
];

interface AndroidAppButtonsProps {
  currentView: string;
  onNavigate: (view: string) => void;
  variant?: 'vertical_list' | 'horizontal_row' | 'both';
  onItemClick?: () => void;
}

/**
 * Android & Tablet App Buttons:
 * Matches the exact design specifications from user mockups:
 * 1. Horizontal squircle app buttons with active vibrant blue state + dot indicator
 * 2. Vertical rounded card list with squircle icons, active royal blue pill with arrow-circle button,
 *    diagnostics divider, and secure core active footer.
 */
export const AndroidAppButtons: React.FC<AndroidAppButtonsProps> = ({
  currentView,
  onNavigate,
  variant = 'both',
  onItemClick,
}) => {
  const handleSelect = (viewId: string) => {
    onNavigate(viewId);
    onItemClick?.();
  };

  const mainButtons = APP_BUTTONS_CONFIG.filter((btn) => btn.section === 'main');
  const diagButtons = APP_BUTTONS_CONFIG.filter((btn) => btn.section === 'diagnostics');

  return (
    <div className="w-full space-y-6 select-none">
      {/* 1. Horizontal App Buttons Row (From Image 2 Top) */}
      {(variant === 'horizontal_row' || variant === 'both') && (
        <div className="w-full">
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
            {mainButtons.map((btn) => {
              const isActive = currentView === btn.id;
              const IconComp = btn.icon;

              return (
                <button
                  key={`h-btn-${btn.id}`}
                  type="button"
                  onClick={() => handleSelect(btn.id)}
                  className="flex flex-col items-center shrink-0 group focus:outline-hidden cursor-pointer"
                >
                  {/* Squircle Button */}
                  <div
                    className={`relative rounded-2xl w-15 h-15 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 ring-2 ring-blue-400/50'
                        : `${btn.color.bg} ${btn.color.darkBg} ${btn.color.text} ${btn.color.darkText} border border-slate-200/60 dark:border-slate-800 shadow-xs hover:shadow-md hover:scale-105`
                    }`}
                  >
                    <IconComp
                      size={26}
                      className={isActive ? 'text-white' : ''}
                    />

                    {/* Purple Notification Dot for AI Consultation */}
                    {btn.hasNotificationDot && !isActive && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>

                  {/* Label Under Button */}
                  <div className="mt-2 flex items-center justify-center gap-1 max-w-[76px] sm:max-w-[82px] text-center">
                    <span
                      className={`text-[11px] leading-tight font-semibold truncate ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {btn.label}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Vertical App Buttons List (From Image 1) */}
      {(variant === 'vertical_list' || variant === 'both') && (
        <div className="w-full space-y-3">
          {/* Main Clinical Buttons */}
          <div className="space-y-2.5">
            {mainButtons.map((btn) => {
              const isActive = currentView === btn.id;
              const IconComp = btn.icon;

              return (
                <button
                  key={`v-btn-${btn.id}`}
                  type="button"
                  onClick={() => handleSelect(btn.id)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.99] flex items-center justify-between gap-3.5 cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 dark:bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25'
                      : 'bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border-slate-150 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Squircle Icon Container */}
                    <div
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : `${btn.color.bg} ${btn.color.darkBg} ${btn.color.text} ${btn.color.darkText}`
                      }`}
                    >
                      <IconComp
                        size={22}
                        className={isActive ? 'text-white' : ''}
                      />
                      {btn.hasNotificationDot && !isActive && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <div className="min-w-0">
                      <h4
                        className={`text-[15px] font-bold tracking-tight leading-snug truncate ${
                          isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {btn.label}
                      </h4>
                      <p
                        className={`text-xs font-medium truncate mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-400'
                        }`}
                      >
                        {btn.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right Element: Circle Arrow when Active, Chevron when Inactive */}
                  {isActive ? (
                    <div className="w-9 h-9 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                      <ArrowRight size={18} className="stroke-[2.5]" />
                    </div>
                  ) : (
                    <ChevronRight
                      size={18}
                      className="text-slate-300 dark:text-slate-600 shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Section Divider: DIAGNOSTICS & PATHOLOGY */}
          <div className="pt-4 pb-1">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
                Diagnostics & Pathology
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          {/* Diagnostics Buttons */}
          <div className="space-y-2.5">
            {diagButtons.map((btn) => {
              const isActive = currentView === btn.id;
              const IconComp = btn.icon;

              return (
                <button
                  key={`v-btn-diag-${btn.id}`}
                  type="button"
                  onClick={() => handleSelect(btn.id)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.99] flex items-center justify-between gap-3.5 cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 dark:bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25'
                      : 'bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border-slate-150 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : `${btn.color.bg} ${btn.color.darkBg} ${btn.color.text} ${btn.color.darkText}`
                      }`}
                    >
                      <IconComp
                        size={22}
                        className={isActive ? 'text-white' : ''}
                      />
                    </div>

                    <div className="min-w-0">
                      <h4
                        className={`text-[15px] font-bold tracking-tight leading-snug truncate ${
                          isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {btn.label}
                      </h4>
                      <p
                        className={`text-xs font-medium truncate mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-400'
                        }`}
                      >
                        {btn.subtitle}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <div className="w-9 h-9 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                      <ArrowRight size={18} className="stroke-[2.5]" />
                    </div>
                  ) : (
                    <ChevronRight
                      size={18}
                      className="text-slate-300 dark:text-slate-600 shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Card: SECURE CORE */}
          <div className="pt-2">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-200 leading-tight">
                    Secure Core
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Your data is encrypted and protected
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
