import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Bot, 
  Activity, 
  Pill, 
  Calendar as CalendarIcon, 
  FileText, 
  Stethoscope, 
  Sparkles, 
  Monitor, 
  AlertTriangle, 
  Dna, 
  Palette, 
  Brain, 
  Cpu, 
  TrendingUp, 
  Dumbbell, 
  Radio, 
  Shield, 
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  CreditCard,
  LayoutGrid,
  Info
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

interface NavTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isUrgent?: boolean;
}

export const MOBILE_NAV_TABS: NavTabItem[] = [
  // Core Operations & Clinical Navigation
  { id: 'home', label: 'Dashboard', icon: <Home size={17} /> },
  { id: 'ai_nexus', label: 'AI Consult', icon: <Bot size={17} /> },
  { id: 'biomatic', label: 'Knowledge Hub', icon: <Cpu size={17} /> },
  { id: 'diagnostic_lab', label: 'Lab Analyser', icon: <Stethoscope size={17} /> },
  { id: 'monitor', label: 'Bio-Monitor', icon: <Monitor size={17} /> },
  { id: 'doctors_dashboard', label: 'Physicians', icon: <UserCheck size={17} /> },
  
  // High-Frequency Patient Care
  { id: 'meds', label: 'Pharmacy', icon: <Pill size={17} /> },
  { id: 'clinical_roadmap', label: 'Appointments', icon: <CalendarIcon size={17} /> },
  { id: 'records', label: 'EHR Records', icon: <FileText size={17} /> },
  { id: 'emergency', label: '911 SOS', icon: <AlertTriangle size={17} />, isUrgent: true },
  
  // Specialized Suites
  { id: 'symptoms', label: 'Triage', icon: <Sparkles size={17} /> },
  { id: 'specialist', label: 'Specialists', icon: <Stethoscope size={17} /> },
  { id: 'neuro', label: 'Neural Lab', icon: <Brain size={17} /> },
  { id: 'genomic_longevity', label: 'Genomics', icon: <Dna size={17} /> },
  { id: 'illustrator', label: '3D Anatomy', icon: <Palette size={17} /> },
  { id: 'about', label: 'Platform Info', icon: <Info size={17} /> },
  { id: 'biosecurity', label: '2FA Vault', icon: <Shield size={17} /> },
  { id: 'profile', label: 'Medical ID', icon: <UserIcon size={17} /> }
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position for smart slide indicators
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);

  // Center active tab on view change
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector(`[data-tab-id="${currentView}"]`) as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentView]);

  // Smart slide left or right
  const handleSmartSlideRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
  };

  const handleSmartSlideLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
  };

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-[120] bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/50 dark:border-slate-800/80 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl h-16 flex items-center px-1 select-none"
      id="android-mobile-bottom-nav"
    >
      {/* Smart Slide Left Arrow (if scrolled right) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={handleSmartSlideLeft}
          className="absolute left-1 z-10 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-90 transition-all cursor-pointer"
          title="Slide Left"
          aria-label="Slide Left"
        >
          <ChevronLeft size={14} className="stroke-[2.5]" />
        </button>
      )}

      {/* Horizontally Scrollable Pages Container */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth w-full h-full px-2 py-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {MOBILE_NAV_TABS.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={`mobile-tab-${tab.id}`}
              data-tab-id={tab.id}
              onClick={() => onNavigate(tab.id)}
              style={{ scrollSnapAlign: 'center' }}
              className={`flex flex-col items-center justify-center min-w-[62px] max-w-[72px] shrink-0 h-full py-1 text-center transition-all duration-150 active:scale-95 cursor-pointer relative ${
                isActive 
                  ? tab.isUrgent 
                    ? 'text-rose-600 dark:text-rose-400' 
                    : 'text-blue-600 dark:text-blue-400 font-bold' 
                  : tab.isUrgent
                    ? 'text-rose-500/80 hover:text-rose-600'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive 
                  ? tab.isUrgent
                    ? 'bg-rose-500/10 scale-105'
                    : 'bg-blue-500/10 scale-105' 
                  : ''
              }`}>
                {tab.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-tight mt-0.5 leading-none whitespace-nowrap truncate max-w-[58px]">
                {tab.label}
              </span>
              {isActive && (
                <motion.span 
                  layoutId="activeAndroidTabIndicator" 
                  className={`absolute bottom-0.5 w-5 h-0.5 rounded-full ${
                    tab.isUrgent ? 'bg-rose-600' : 'bg-blue-600 dark:bg-blue-400'
                  }`} 
                />
              )}
            </button>
          );
        })}

        {/* Smart Slide "More" Button placed at end of quick list */}
        {canScrollRight && (
          <button
            type="button"
            onClick={handleSmartSlideRight}
            className="flex flex-col items-center justify-center min-w-[58px] shrink-0 h-full py-1 text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 active:scale-95 transition-all cursor-pointer"
            title="Slide to view more pages"
          >
            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 shadow-2xs flex items-center justify-center">
              <ChevronRight size={16} className="animate-pulse stroke-[2.5]" />
            </div>
            <span className="text-[8.5px] font-black uppercase tracking-wider mt-0.5 leading-none">
              More ➔
            </span>
          </button>
        )}
      </div>

      {/* Smart Slide Right Floating Arrow (when more pages available) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={handleSmartSlideRight}
          className="absolute right-1 z-10 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md border border-slate-200/80 dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 active:scale-90 transition-all cursor-pointer"
          title="Slide to next pages"
          aria-label="Slide to next pages"
        >
          <ChevronRight size={14} className="stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};
