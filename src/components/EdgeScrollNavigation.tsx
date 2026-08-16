import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface EdgeScrollNavigationProps {
  currentView: string;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
}

export const EdgeScrollNavigation: React.FC<EdgeScrollNavigationProps> = ({ 
  currentView, 
  onNavigateNext,
  onNavigatePrev
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Do not render on AI Consultation page (ai_nexus)
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

  const handleScrollTop = () => {
    const scrollContainer = document.getElementById('app-scroll-viewport');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 md:right-8 z-[75] flex items-center gap-2 pointer-events-auto">
      {/* Floating Scroll to Top Pill */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleScrollTop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/45 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-md backdrop-blur-md cursor-pointer transition-all"
            title="Scroll to Top"
          >
            <ArrowUp size={12} className="stroke-[2.5] text-blue-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">Top</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Integrated Back / Forward Cohesive Dock */}
      <div className="flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-md">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.04, x: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNavigatePrev}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer font-extrabold text-[9px] uppercase tracking-wider whitespace-nowrap"
          title="Go to Previous Module"
        >
          <ArrowLeft size={12} className="stroke-[3]" />
          <span>Prev</span>
        </motion.button>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 self-center mx-1" />

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.04, x: 1 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNavigateNext}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer font-extrabold text-[9px] uppercase tracking-wider whitespace-nowrap"
          title="Go to Next Module"
        >
          <span>Next</span>
          <ArrowRight size={12} className="stroke-[3]" />
        </motion.button>
      </div>
    </div>
  );
};
