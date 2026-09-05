import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Bot, 
  Monitor, 
  Pill, 
  Layers, 
  ChevronUp, 
  ChevronsRight,
  ChevronsLeft,
  X, 
  Sparkles, 
  Stethoscope, 
  TrendingUp, 
  Palette, 
  UserCheck, 
  UserPlus, 
  Brain, 
  Dna, 
  Cpu, 
  AlertTriangle, 
  Calendar, 
  Activity, 
  Search,
  Check,
  ArrowRightLeft
} from 'lucide-react';

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
  isUrgent?: boolean;
}

// Well-organized, streamlined medical pages with irrelevant internal/modem tools removed
export const ALL_APP_PAGES: PageItem[] = [
  // 1. Core Care & Consultations
  { 
    id: 'home', 
    label: 'Dashboard', 
    subtitle: 'Clinical summary, vitals & wellness', 
    category: 'core', 
    icon: <Home size={16} /> 
  },
  { 
    id: 'ai_nexus', 
    label: 'AI Medical Consult', 
    subtitle: '24/7 conversational physician intelligence', 
    category: 'core', 
    icon: <Bot size={16} /> 
  },
  { 
    id: 'monitor', 
    label: 'Patient Monitor', 
    subtitle: 'Live bio-telemetry stream, BPM & SpO2', 
    category: 'core', 
    icon: <Monitor size={16} /> 
  },
  { 
    id: 'meds', 
    label: 'Precision Pharmacy', 
    subtitle: 'Prescriptions, interactions & alerts', 
    category: 'core', 
    icon: <Pill size={16} /> 
  },
  { 
    id: 'vitality', 
    label: 'Vitality Matrix', 
    subtitle: 'Organ health & biomarker score', 
    category: 'core', 
    icon: <Activity size={16} /> 
  },
  { 
    id: 'clinical_roadmap', 
    label: 'Appointments', 
    subtitle: 'Doctor appointments & visit scheduling', 
    category: 'core', 
    icon: <Calendar size={16} /> 
  },
  { 
    id: 'emergency', 
    label: 'Emergency SOS 911', 
    subtitle: 'Rapid trauma dispatch & medical SOS', 
    category: 'core', 
    icon: <AlertTriangle size={16} />, 
    isUrgent: true 
  },
  
  // 2. Diagnostics & Pathology
  { 
    id: 'symptoms', 
    label: 'Symptom Triage', 
    subtitle: 'Differential AI diagnostic engine', 
    category: 'diag', 
    icon: <Sparkles size={16} /> 
  },
  { 
    id: 'diagnostic_lab', 
    label: 'Lab Analyzer', 
    subtitle: 'Complete blood count & pathology reports', 
    category: 'diag', 
    icon: <Stethoscope size={16} /> 
  },
  { 
    id: 'health_trace', 
    label: 'Timeline Trace', 
    subtitle: 'Longitudinal clinical history & records', 
    category: 'diag', 
    icon: <TrendingUp size={16} /> 
  },
  { 
    id: 'illustrator', 
    label: '3D Anatomical Visuals', 
    subtitle: 'Interactive 3D organ & structural models', 
    category: 'diag', 
    icon: <Palette size={16} /> 
  },
  
  // 3. Specialized Care & Longevity
  { 
    id: 'doctors_dashboard', 
    label: 'Doctor Workstation', 
    subtitle: 'Physician charts & clinical notes', 
    category: 'specialized', 
    icon: <UserCheck size={16} /> 
  },
  { 
    id: 'specialist', 
    label: 'Specialist Directory', 
    subtitle: 'Find verified clinical specialists', 
    category: 'specialized', 
    icon: <UserPlus size={16} /> 
  },
  { 
    id: 'neuro', 
    label: 'Cognis Neural Lab', 
    subtitle: 'Neurological & cognitive assessments', 
    category: 'specialized', 
    icon: <Brain size={16} /> 
  },
  { 
    id: 'genomic_longevity', 
    label: 'Genomics Core', 
    subtitle: 'DNA markers, sequencing & longevity traits', 
    category: 'specialized', 
    icon: <Dna size={16} /> 
  },
  { 
    id: 'fitness', 
    label: 'Longevity Protocols', 
    subtitle: 'Physiological regimens & exercise Rx', 
    category: 'specialized', 
    icon: <Activity size={16} /> 
  },
  { 
    id: 'biomatic', 
    label: 'Clinical Knowledge Hub', 
    subtitle: 'Evidence-based pharmacology & medical index', 
    category: 'specialized', 
    icon: <Cpu size={16} /> 
  },
];

export const PRIMARY_NAV_TABS = [
  { id: 'home', label: 'Home', icon: <Home size={17} /> },
  { id: 'ai_nexus', label: 'AI Consult', icon: <Bot size={17} /> },
  { id: 'monitor', label: 'Monitor', icon: <Monitor size={17} /> },
  { id: 'meds', label: 'Pharmacy', icon: <Pill size={17} /> },
];

/**
 * Checks if the current client is an Android device, a tablet (iPad, Android tablet),
 * or viewed in a mobile/tablet viewport, strictly excluding laptops and desktop computers.
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
  const isIPad = ua.includes('ipad') || 
    (platform.includes('macintel') && navigator.maxTouchPoints > 1 && !ua.includes('iphone'));

  // 3. Dedicated Tablet Detection (Android Tablets, Kindle Fire, Silk, PlayBook)
  const isGenericTablet = /(tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua);

  // 4. Other Mobile Phones (iPhone, iPod, handheld mobile browsers)
  const isMobileHandheld = /(mobi|iphone|ipod|blackberry|iemobile|opera mini)/i.test(ua);

  const width = window.innerWidth;
  const isLargeScreen = width >= 1024;

  // 5. Desktop / Laptop OS Check (Windows, macOS without touch, Linux desktop, ChromeOS laptops)
  const isDesktopOS = (ua.includes('windows nt') || (ua.includes('macintosh') && !isIPad) || ua.includes('x11') || ua.includes('cros')) && !isAndroid;

  // If running on a Desktop OS with typical laptop/desktop screen width (>= 1024px)
  if (isDesktopOS && isLargeScreen) {
    const hasFinePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches;
    const canHover = typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover)').matches;

    // Standard laptop/desktop with mouse or trackpad: strictly hide
    if (hasFinePointer && canHover) {
      return false;
    }

    // Touchscreen laptops (e.g. Surface Laptop, Dell XPS Touch) on desktop OS at >= 1024px: strictly hide
    if (!isAndroid && !isIPad && !isGenericTablet) {
      return false;
    }
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

  // If viewport is mobile/tablet size (< 1024px) -> Show (e.g. testing in responsive viewports)
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
        // Fallback for older browsers
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'diag' | 'specialized'>('all');
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

  // Determine if active view is a secondary tool (not among the 4 primary tabs)
  const isSecondaryActive = !['home', 'ai_nexus', 'monitor', 'meds'].includes(currentView);

  const activePageMeta = useMemo(() => {
    return ALL_APP_PAGES.find(p => p.id === currentView) || ALL_APP_PAGES[0];
  }, [currentView]);

  const categories = [
    { id: 'all', label: 'All Pages', count: ALL_APP_PAGES.length },
    { id: 'core', label: 'Core Care', count: ALL_APP_PAGES.filter(p => p.category === 'core').length },
    { id: 'diag', label: 'Diagnostics', count: ALL_APP_PAGES.filter(p => p.category === 'diag').length },
    { id: 'specialized', label: 'Specialists & Longevity', count: ALL_APP_PAGES.filter(p => p.category === 'specialized').length },
  ];

  const filteredPages = useMemo(() => {
    return ALL_APP_PAGES.filter(page => {
      const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = q === '' || 
        page.label.toLowerCase().includes(q) ||
        page.subtitle.toLowerCase().includes(q) ||
        page.id.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <>
      {/* Expanded Quick Switcher Horizon Modal */}
      <AnimatePresence>
        {isSwitcherOpen && (
          <div className="fixed inset-0 z-[260] pointer-events-none flex flex-col justify-end pb-20 px-3 sm:px-6">
            {/* Minimalist Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSwitcherOpen(false)}
              className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-[4px] pointer-events-auto"
            />

            {/* Well-Organized Pages Drawer */}
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 360 }}
              className="relative w-full max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-3.5 sm:p-4 pointer-events-auto overflow-hidden flex flex-col space-y-3 z-10"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Layers size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Pages & Clinical Modules
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Organized clinical engines & diagnostic suites
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSecondaryActive && activePageMeta && (
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 truncate max-w-[120px]">
                      Active: {activePageMeta.label}
                    </span>
                  )}
                  <button
                    onClick={() => setIsSwitcherOpen(false)}
                    aria-label="Close page menu"
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Search Bar for Quick Filtering */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages (e.g. Vitals, Pharmacy, Specialist, Lab)..."
                  className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Category Pills Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => (
                  <button
                    key={`cat-pill-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedCategory === cat.id ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Organized Pages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar py-1">
                {filteredPages.map((page) => {
                  const isActive = currentView === page.id;
                  return (
                    <button
                      key={`page-grid-item-${page.id}`}
                      onClick={() => {
                        onNavigate(page.id);
                        setIsSwitcherOpen(false);
                      }}
                      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                        isActive
                          ? page.isUrgent
                            ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-500/30'
                            : 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/30'
                          : page.isUrgent
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-100/80'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : page.isUrgent
                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
                            : page.category === 'core'
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                              : page.category === 'diag'
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                      }`}>
                        {page.icon}
                      </div>
                      <div className="truncate flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black truncate leading-tight">
                            {page.label}
                          </span>
                          {page.isUrgent && (
                            <span className="text-[8px] font-black px-1 rounded bg-rose-500 text-white uppercase">
                              SOS
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate leading-normal mt-0.5 ${
                          isActive ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {page.subtitle}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0 ml-1 mt-0.5">
                          <Check size={12} className="stroke-[3] text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Navigation Card: Either Slid into Corner OR Full Bottom Center Card */}
      <AnimatePresence mode="wait">
        {isCornerDocked ? (
          /* ========================================================================= */
          /* CORNER DOCKED STATE: Smart, Highly Visible Pill with >> or << Indicator   */
          /* ========================================================================= */
          <motion.div
            key={`corner-nav-pill-${dockSide}`}
            id="bottom-nav-corner-pill"
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              x: dockSide === 'right' ? 80 : -80 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              x: dockSide === 'right' ? 80 : -80 
            }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className={`fixed bottom-3.5 z-[150] select-none flex items-center gap-1.5 ${
              dockSide === 'right' ? 'right-3' : 'left-3'
            }`}
          >
            {/* The Smart Slideable Corner Capsule */}
            <div 
              onClick={() => toggleCornerDock()}
              title={`Pages Navigation Docked (${dockSide === 'right' ? '<<' : '>>'} Click or slide to expand)`}
              className={`group flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 active:scale-95 shadow-[0_10px_35px_rgba(0,0,0,0.22)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.85)] border-2 ${
                dockSide === 'right'
                  ? 'bg-white dark:bg-slate-900 border-blue-500/80 hover:border-blue-600 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-slate-900 border-blue-500/80 hover:border-blue-600 text-slate-900 dark:text-white'
              }`}
            >
              {/* If on RIGHT corner: Symbol '<<' points left to expand into page */}
              {dockSide === 'right' && (
                <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:-translate-x-0.5 transition-transform">
                  <ChevronsLeft size={17} className="stroke-[2.8] animate-pulse" />
                  <span className="font-mono text-[11px] font-black tracking-tighter -ml-1">{'<<'}</span>
                </div>
              )}

              {/* Active Page Indicator Icon with Status Dot */}
              <div className="relative flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/40">
                  {activePageMeta.icon}
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>

              {/* Smart Labels: Clearly labeled "Pages" with current active module */}
              <div className="flex flex-col text-left pr-0.5 leading-none">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Pages
                  </span>
                  <span className="text-[8px] font-black px-1.5 py-0.2 rounded-md bg-blue-500/15 dark:bg-blue-500/30 text-blue-600 dark:text-blue-300">
                    {dockSide === 'right' ? 'Slide <<' : 'Slide >>'}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[70px] mt-0.5">
                  {activePageMeta.label.split(' ')[0]}
                </span>
              </div>

              {/* If on LEFT corner: Symbol '>>' points right to expand into page */}
              {dockSide === 'left' && (
                <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  <span className="font-mono text-[11px] font-black tracking-tighter -mr-1">{'>>'}</span>
                  <ChevronsRight size={17} className="stroke-[2.8] animate-pulse" />
                </div>
              )}
            </div>

            {/* Quick Side Swap Button (Flip between Left and Right Corner) */}
            <button
              onClick={switchDockSide}
              title={`Switch dock side to ${dockSide === 'right' ? 'left' : 'right'}`}
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <ArrowRightLeft size={13} />
            </button>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* EXPANDED STATE: Slideable Card Holding Page Buttons at Bottom Center      */
          /* ========================================================================= */
          <motion.nav 
            key="expanded-bottom-nav"
            id="bottom-page-nav-card"
            aria-label="Pages Navigation Dock"
            initial={{ 
              opacity: 0, 
              y: 20, 
              scale: 0.96 
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              y: 20, 
              scale: 0.96,
              x: dockSide === 'right' ? 80 : -80
            }}
            transition={{ type: 'spring', damping: 24, stiffness: 340 }}
            drag="x"
            dragConstraints={{ left: -30, right: 30 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > 45) {
                toggleCornerDock('right');
              } else if (info.offset.x < -45) {
                toggleCornerDock('left');
              }
            }}
            className="fixed bottom-2.5 left-2 right-2 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-[140] w-auto max-w-lg select-none"
          >
            {/* The Main Navigation Card */}
            <div className="bg-white/98 dark:bg-slate-900/98 text-slate-900 dark:text-slate-100 border border-slate-300/90 dark:border-slate-750 rounded-full shadow-[0_12px_42px_rgba(0,0,0,0.16)] dark:shadow-[0_12px_42px_rgba(0,0,0,0.75)] backdrop-blur-2xl h-14 px-2 flex items-center justify-between gap-1">
              
              {/* Left Slide-to-Corner Trigger with Symbol '<<' */}
              <button
                onClick={() => toggleCornerDock('left')}
                title="Slide page card to left corner (<<)"
                className="flex items-center justify-center p-2 rounded-full text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <div className="flex items-center">
                  <ChevronsLeft size={15} className="stroke-[2.5]" />
                  <span className="text-[8px] font-black font-mono -ml-0.5">{'<<'}</span>
                </div>
              </button>

              {/* Primary Page Buttons (Home, AI Consult, Monitor, Pharmacy) */}
              <div className="flex-1 grid grid-cols-4 items-center h-full">
                {PRIMARY_NAV_TABS.map((tab, idx) => {
                  const isActive = currentView === tab.id;
                  return (
                    <button
                      key={`primary-page-btn-${tab.id}-${idx}`}
                      data-tab-id={tab.id}
                      onClick={() => {
                        setIsSwitcherOpen(false);
                        onNavigate(tab.id);
                      }}
                      className={`flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-90 cursor-pointer relative ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400 font-bold' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <div className={`px-2.5 py-0.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                        isActive 
                          ? 'bg-blue-600/12 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400' 
                          : 'bg-transparent'
                      }`}>
                        {tab.icon}
                      </div>
                      <span className={`text-[9px] uppercase tracking-tight leading-none truncate mt-0.5 ${
                        isActive ? 'font-black text-blue-600 dark:text-blue-400' : 'font-semibold'
                      }`}>
                        {tab.label}
                      </span>
                      {isActive && (
                        <motion.span 
                          layoutId="activeDockPill" 
                          className="absolute bottom-1 w-3 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" 
                          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* "Pages" Switcher Capsule */}
              <div className="pl-0.5 pr-0.5 shrink-0">
                <button
                  onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 cursor-pointer shadow-xs border text-left ${
                    isSwitcherOpen
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                      : isSecondaryActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                  title="Explore All Clinical Pages and Modules"
                >
                  <Layers size={13} className={isSecondaryActive ? 'animate-pulse' : ''} />
                  <span className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                    {isSecondaryActive && activePageMeta ? activePageMeta.label.split(' ')[0] : 'Pages'}
                  </span>
                  <ChevronUp size={11} className={`stroke-[2.5] transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Right Slide-to-Corner Trigger with Symbol '>>' */}
              <button
                onClick={() => toggleCornerDock('right')}
                title="Slide page card to right corner (>>)"
                className="flex items-center justify-center p-2 rounded-full text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 group"
              >
                <div className="flex items-center">
                  <span className="text-[8px] font-black font-mono -mr-0.5">{'>>'}</span>
                  <ChevronsRight size={15} className="stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};
