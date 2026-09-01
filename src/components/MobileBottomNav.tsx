import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Bot, 
  Monitor, 
  Pill, 
  Layers, 
  ChevronUp, 
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
  Check
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMenu?: () => void;
}

interface PageItem {
  id: string;
  label: string;
  category: 'core' | 'diag' | 'care' | 'tools';
  icon: React.ReactNode;
  isUrgent?: boolean;
}

const ALL_APP_PAGES: PageItem[] = [
  // Core
  { id: 'home', label: 'Dashboard', category: 'core', icon: <Home size={15} /> },
  { id: 'ai_nexus', label: 'AI Consult', category: 'core', icon: <Bot size={15} /> },
  { id: 'vitality', label: 'Vitality Matrix', category: 'core', icon: <Activity size={15} /> },
  { id: 'meds', label: 'Pharmacy', category: 'core', icon: <Pill size={15} /> },
  { id: 'clinical_roadmap', label: 'Appointments', category: 'core', icon: <Calendar size={15} /> },
  { id: 'emergency', label: 'Emergency 911', category: 'core', icon: <AlertTriangle size={15} />, isUrgent: true },
  
  // Diagnostics
  { id: 'symptoms', label: 'Symptom Triage', category: 'diag', icon: <Sparkles size={15} /> },
  { id: 'diagnostic_lab', label: 'Lab Analyzer', category: 'diag', icon: <Stethoscope size={15} /> },
  { id: 'monitor', label: 'Patient Monitor', category: 'diag', icon: <Monitor size={15} /> },
  { id: 'health_trace', label: 'Timeline Trace', category: 'diag', icon: <TrendingUp size={15} /> },
  { id: 'illustrator', label: '3D Visuals', category: 'diag', icon: <Palette size={15} /> },
  
  // Clinical & Research
  { id: 'doctors_dashboard', label: 'Doctor Station', category: 'care', icon: <UserCheck size={15} /> },
  { id: 'specialist', label: 'Specialists', category: 'care', icon: <UserPlus size={15} /> },
  { id: 'neuro', label: 'Cognitive Lab', category: 'care', icon: <Brain size={15} /> },
  { id: 'genomic_longevity', label: 'Genomics', category: 'care', icon: <Dna size={15} /> },
  { id: 'biomatic', label: 'Knowledge Hub', category: 'care', icon: <Cpu size={15} /> },
  
  // Protocols & Tools
  { id: 'fitness', label: 'Longevity Plan', category: 'tools', icon: <Activity size={15} /> },
  { id: 'gsm_sms_gateway', label: 'SMS Gateway', category: 'tools', icon: <Bot size={15} /> },
];

export const PRIMARY_NAV_TABS = [
  { id: 'home', label: 'Home', icon: <Home size={18} /> },
  { id: 'ai_nexus', label: 'AI Consult', icon: <Bot size={18} /> },
  { id: 'monitor', label: 'Monitor', icon: <Monitor size={18} /> },
  { id: 'meds', label: 'Pharmacy', icon: <Pill size={18} /> },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
}) => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'diag' | 'care' | 'tools'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine if active view is a secondary tool (not among the 4 primary tabs)
  const isSecondaryActive = !['home', 'ai_nexus', 'monitor', 'meds'].includes(currentView);

  const activePageMeta = useMemo(() => {
    return ALL_APP_PAGES.find(p => p.id === currentView);
  }, [currentView]);

  const filteredPages = useMemo(() => {
    return ALL_APP_PAGES.filter(page => {
      const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categories = [
    { id: 'all', label: 'All Pages' },
    { id: 'diag', label: 'Diagnostics' },
    { id: 'care', label: 'Clinical' },
    { id: 'tools', label: 'Protocols' },
  ];

  return (
    <>
      {/* Compact Floating Horizon Ribbon (Replaces the big card) */}
      <AnimatePresence>
        {isSwitcherOpen && (
          <div className="md:hidden fixed inset-0 z-[130] pointer-events-none flex flex-col justify-end pb-20 px-3">
            {/* Minimalist Backdrop with subtle blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSwitcherOpen(false)}
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] pointer-events-auto"
            />

            {/* Compact Floating Capsule Island */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-3 pointer-events-auto overflow-hidden flex flex-col space-y-2.5"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Layers size={13} />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Quick Page Switcher
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Active Page Tag */}
                  {isSecondaryActive && activePageMeta && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 truncate max-w-[110px]">
                      Active: {activePageMeta.label}
                    </span>
                  )}
                  <button
                    onClick={() => setIsSwitcherOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Compact Search & Category Pills Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar py-0.5">
                {categories.map((cat, catIdx) => (
                  <button
                    key={`cat-pill-${cat.id}-${catIdx}`}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Ultra-Smooth Horizontal Scroll Capsule List */}
              <div className="overflow-x-auto custom-scrollbar no-scrollbar py-1 flex items-center gap-2">
                {filteredPages.map((page, idx) => {
                  const isActive = currentView === page.id;
                  return (
                    <button
                      key={`quick-pill-item-${page.id}-${idx}`}
                      onClick={() => {
                        onNavigate(page.id);
                        setIsSwitcherOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-left shrink-0 transition-all active:scale-95 cursor-pointer select-none ${
                        isActive
                          ? page.isUrgent
                            ? 'bg-rose-600 border-rose-500 text-white shadow-sm shadow-rose-500/30'
                            : 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/30'
                          : page.isUrgent
                            ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`p-1 rounded-lg ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : page.isUrgent
                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
                            : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                      }`}>
                        {page.icon}
                      </div>
                      <span className="text-[11px] font-bold whitespace-nowrap">
                        {page.label}
                      </span>
                      {isActive && <Check size={12} className="stroke-[3] ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Floating Capsule Bottom Navigation Dock */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-2.5 left-3 right-3 z-[120] max-w-md mx-auto select-none"
        id="android-mobile-bottom-nav"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/90 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl h-14 px-1.5 flex items-center justify-between">
          {/* Primary 4 Tabs */}
          <div className="flex-1 grid grid-cols-4 items-center h-full">
            {PRIMARY_NAV_TABS.map((tab, idx) => {
              const isActive = currentView === tab.id;
              return (
                <button
                  key={`primary-dock-tab-${tab.id}-${idx}`}
                  data-tab-id={tab.id}
                  onClick={() => {
                    setIsSwitcherOpen(false);
                    onNavigate(tab.id);
                  }}
                  className={`flex flex-col items-center justify-center h-full py-1 text-center transition-all duration-200 active:scale-90 cursor-pointer relative ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 font-bold' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <div className={`px-2.5 py-0.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isActive 
                      ? 'bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
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

          {/* Integrated Quick Switcher Capsule Pill */}
          <div className="pl-1 pr-0.5">
            <button
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 active:scale-95 cursor-pointer shadow-xs border ${
                isSwitcherOpen
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : isSecondaryActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
              title="Explore All Pages & Clinical Modules"
            >
              <Layers size={14} className={isSecondaryActive ? 'animate-pulse' : ''} />
              <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                {isSecondaryActive && activePageMeta ? activePageMeta.label.split(' ')[0] : 'Pages'}
              </span>
              <motion.div
                animate={{ rotate: isSwitcherOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp size={12} className="stroke-[2.5]" />
              </motion.div>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
