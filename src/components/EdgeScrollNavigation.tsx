import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, ArrowUp } from 'lucide-react';

interface EdgeScrollNavigationProps {
  currentView: string;
  onNavigateNext?: () => void;
}

export const EdgeScrollNavigation: React.FC<EdgeScrollNavigationProps> = ({ currentView, onNavigateNext }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Strictly DO NOT render on AI Consultation / Chat page (ai_nexus)
  if (currentView === 'ai_nexus') {
    return null;
  }

  useEffect(() => {
    const scrollContainer = document.getElementById('app-scroll-viewport') || window;
    
    const handleScroll = () => {
      const scrollTop = scrollContainer === window 
        ? window.scrollY 
        : (scrollContainer as HTMLElement).scrollTop;
      setIsScrolled(scrollTop > 150);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [currentView]);

  const handleClick = () => {
    if (isScrolled) {
      // If user has scrolled down, smooth scroll back to top of page
      const scrollContainer = document.getElementById('app-scroll-viewport');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (onNavigateNext) {
      // Advance to next page / clinical module
      onNavigateNext();
    }
  };

  return (
    <div className="flex items-center justify-end w-full pt-1 pb-2 shrink-0">
      <motion.button
        whileHover={{ scale: 1.08, x: isScrolled ? 0 : 3, y: isScrolled ? -2 : 0 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all cursor-pointer select-none"
        title={isScrolled ? "Scroll to Top of Page" : "Advance to Next Page"}
        aria-label={isScrolled ? "Scroll to Top of Page" : "Advance to Next Page"}
      >
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {isScrolled ? "Top" : "Next"}
        </span>

        {/* SINGLE ARROW ICON */}
        <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
          {isScrolled ? (
            <ArrowUp size={14} className="stroke-[2.5]" />
          ) : (
            <ArrowRight size={14} className="stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          )}
        </div>
      </motion.button>
    </div>
  );
};
