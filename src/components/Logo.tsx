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
            src="/logo.png" 
            alt="Doctorian Medical AI Logo"
            className="w-full h-full object-contain z-10 transition-transform duration-500 group-hover/logo:scale-105"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          /* HD Rainbow Petal Neural Cross Fallback SVG */
          <svg className="w-full h-full z-10 p-0.5" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="20" fill="#ffffff" />
            <defs>
              <filter id="fallbackGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00f0ff" floodOpacity="0.4" />
              </filter>
            </defs>
            {/* 8 Rainbow Pinwheel Petals */}
            <g transform="translate(50, 50)">
              {/* Petal 1 - Magenta */}
              <path d="M 0,-15 C -22,-36 -32,-8 -12,0 Z" fill="#e91e63" opacity="0.95" />
              {/* Petal 2 - Crimson Red */}
              <path d="M 0,-15 C -22,-36 -32,-8 -12,0 Z" fill="#f44336" transform="rotate(45)" opacity="0.95" />
              {/* Petal 3 - Orange */}
              <path d="M 0,-15 C -22,-36 -32,-8 -12,0 Z" fill="#ff9800" transform="rotate(90)" opacity="0.95" />
              {/* Petal 4 - Yellow */}
              <path d="M 0,-15 C -22,-36 -32,-8 -12,0 Z" fill="#ffc107" transform="rotate(135)" opacity="0.95" />
              {/* Petal 5 - Lime Green */}
              <path d="M 0,-15 C -22,-36 -32,-8 -12,0 Z" fill="#8bc34a" transform="rotate(180)" opacity="0.95" />
              {/* Petal 6 - Cyan */}
              <path d="M 0,-15 C -22,-36 -32,-8 -12,0 Z" fill="#00e5ff" transform="rotate(225)" opacity="0.95" />
              {/* Petal 7 - Royal Blue */}
              <path d="M 0,-15 C -22,-36 -32,-8 -12,0 Z" fill="#2979ff" transform="rotate(270)" opacity="0.95" />
              {/* Petal 8 - Purple */}
              <path d="M 0,-15 C -22,-36 -32,-8 -12,0 Z" fill="#9c27b0" transform="rotate(315)" opacity="0.95" />
            </g>
            {/* High-Tech Central Neural Cross */}
            <path d="M 43 28 h 14 a 3 3 0 0 1 3 3 v 12 a 3 3 0 0 0 3 3 h 12 a 3 3 0 0 1 3 3 v 14 a 3 3 0 0 1 -3 3 h -12 a 3 3 0 0 0 -3 3 v 12 a 3 3 0 0 1 -3 3 h -14 a 3 3 0 0 1 -3 -3 v -12 a 3 3 0 0 0 -3 -3 h -12 a 3 3 0 0 1 -3 -3 v -14 a 3 3 0 0 1 3 -3 h 12 a 3 3 0 0 0 3 -3 v -12 a 3 3 0 0 1 3 -3 z" fill="#07152d" stroke="#00e5ff" strokeWidth="2" filter="url(#fallbackGlow)" />
            {/* Neural Traces */}
            <line x1="50" y1="50" x2="50" y2="36" stroke="#00f0ff" strokeWidth="1.5" />
            <line x1="50" y1="50" x2="50" y2="64" stroke="#00f0ff" strokeWidth="1.5" />
            <line x1="50" y1="50" x2="36" y2="50" stroke="#00f0ff" strokeWidth="1.5" />
            <line x1="50" y1="50" x2="64" y2="50" stroke="#00f0ff" strokeWidth="1.5" />
            {/* Circuit Nodes */}
            <circle cx="50" cy="36" r="2" fill="#00f0ff" />
            <circle cx="50" cy="64" r="2" fill="#00f0ff" />
            <circle cx="36" cy="50" r="2" fill="#00f0ff" />
            <circle cx="64" cy="50" r="2" fill="#00f0ff" />
            {/* Central Energy Core */}
            <circle cx="50" cy="50" r="7" fill="#031126" stroke="#00f0ff" strokeWidth="1.8" />
            <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
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
