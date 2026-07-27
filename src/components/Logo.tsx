import React, { useState } from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText = true }) => {
  const [imgError, setImgError] = useState(false);

  const containerSize = 
    size === 'xs' ? 'w-8 h-8' : 
    size === 'sm' ? 'w-9 h-9 sm:w-10 sm:h-10' : 
    size === 'md' ? 'w-11 h-11 sm:w-12 sm:h-12' : 
    size === 'lg' ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-20 h-20 sm:w-24 sm:h-24';

  const radiusClass = 
    size === 'xs' ? 'rounded-xl' : 
    size === 'sm' ? 'rounded-xl sm:rounded-2xl' : 
    size === 'md' ? 'rounded-2xl sm:rounded-[1.25rem]' : 
    size === 'lg' ? 'rounded-2xl sm:rounded-3xl' : 'rounded-3xl sm:rounded-[2.25rem]';

  const fontSize = 
    size === 'xs' ? 'text-[11px]' : 
    size === 'sm' ? 'text-xs sm:text-sm' : 
    size === 'md' ? 'text-sm sm:text-base md:text-lg' : 
    size === 'lg' ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl';

  return (
    <div className={`flex items-center gap-2 sm:gap-3 group/logo select-none shrink-0 ${className}`}>
      {/* High-Tech Professional Healthcare Logo Card Container - White Card Base */}
      <div 
        className={`relative ${containerSize} ${radiusClass} flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/60 dark:shadow-slate-950/50 transition-all duration-300 group-hover/logo:shadow-lg group-hover/logo:shadow-blue-500/20 group-hover/logo:border-blue-400/60 p-1 shrink-0`}
      >
        {!imgError ? (
          <img 
            src="/logo.svg" 
            alt="Doctorian Medical AI Logo"
            className="w-full h-full object-contain z-10 transition-transform duration-500 group-hover/logo:scale-105"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          /* HD High-Tech Neural Cross Fallback SVG */
          <svg className="w-full h-full z-10 p-0.5" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="20" fill="#ffffff" />
            {/* Cross Body */}
            <path d="M 40 12 h 20 a 4 4 0 0 1 4 4 v 20 a 4 4 0 0 0 4 4 h 20 a 4 4 0 0 1 4 4 v 20 a 4 4 0 0 1 -4 4 h -20 a 4 4 0 0 0 -4 4 v 20 a 4 4 0 0 1 -4 4 h -20 a 4 4 0 0 1 -4 -4 v -20 a 4 4 0 0 0 -4 -4 h -20 a 4 4 0 0 1 -4 -4 v -20 a 4 4 0 0 1 4 -4 h 20 a 4 4 0 0 0 4 -4 v -20 a 4 4 0 0 1 4 -4 z" fill="#081730" stroke="#00f0ff" strokeWidth="2" />
            {/* Neural Lines */}
            <line x1="50" y1="50" x2="50" y2="24" stroke="#00ffff" strokeWidth="1.5" />
            <line x1="50" y1="50" x2="50" y2="76" stroke="#00ffff" strokeWidth="1.5" />
            <line x1="50" y1="50" x2="24" y2="50" stroke="#00ffff" strokeWidth="1.5" />
            <line x1="50" y1="50" x2="76" y2="50" stroke="#00ffff" strokeWidth="1.5" />
            {/* Corner Nodes */}
            <circle cx="50" cy="24" r="3" fill="#00ffff" />
            <circle cx="50" cy="76" r="3" fill="#00ffff" />
            <circle cx="24" cy="50" r="3" fill="#00ffff" />
            <circle cx="76" cy="50" r="3" fill="#00ffff" />
            {/* Core Circle */}
            <circle cx="50" cy="50" r="10" fill="#020e21" stroke="#00f0ff" strokeWidth="2" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" />
          </svg>
        )}

        {/* Live Active Status Indicator Pulse Dot */}
        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-emerald-400 rounded-full border border-white dark:border-slate-900 shadow-[0_0_8px_rgba(52,211,153,0.9)] z-20 animate-pulse" />
      </div>
      
      {showText && (
        <div className="flex flex-col logo-text shrink-0">
          <div className="flex items-baseline gap-1 leading-none">
            <span className={`${fontSize} font-black tracking-tight text-slate-900 dark:text-white leading-none`}>
              Doctorian
            </span>
            <span className={`${fontSize} font-black tracking-tight text-blue-600 dark:text-blue-400 leading-none`}>
              AI
            </span>
          </div>
          {/* Subtext: Hidden on narrow mobile screens when size is sm/xs to preserve upper bar space */}
          <div className={`items-center gap-1 mt-0.5 ${size === 'sm' || size === 'xs' ? 'hidden sm:flex' : 'flex'}`}>
            <div className="h-0.5 w-2.5 bg-blue-500 rounded-full" />
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Medical Intelligence
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
