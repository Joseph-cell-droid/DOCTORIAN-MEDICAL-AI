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
    size === 'sm' ? 'w-10 h-10' : 
    size === 'md' ? 'w-12 h-12' : 
    size === 'lg' ? 'w-16 h-16' : 
    size === 'xl' ? 'w-24 h-24' : 'w-12 h-12';

  const radiusClass = 
    size === 'xs' ? 'rounded-xl' : 
    size === 'sm' ? 'rounded-2xl' : 
    size === 'md' ? 'rounded-[1.25rem]' : 
    size === 'lg' ? 'rounded-3xl' : 'rounded-[2.25rem]';

  const fontSize = 
    size === 'xs' ? 'text-xs' : 
    size === 'sm' ? 'text-sm' : 
    size === 'md' ? 'text-base sm:text-lg' : 
    size === 'lg' ? 'text-xl' : 'text-3xl';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group/logo select-none ${className}`}>
      {/* App Icon Card Container with Smooth Bent Edges */}
      <div 
        className={`relative ${containerSize} ${radiusClass} flex items-center justify-center overflow-hidden bg-slate-900 dark:bg-slate-900 border border-slate-700/80 dark:border-slate-800 shadow-lg shadow-blue-500/20 dark:shadow-slate-950/60 transition-all duration-300 group-hover/logo:shadow-blue-500/30 group-hover/logo:border-blue-500/60 p-1 shrink-0`}
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
          /* High-Definition Direct Vector Vector Emblem Fallback */
          <svg className="w-full h-full z-10" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="24" fill="#0f172a" />
            <path d="M30 50h40M50 30v40" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" />
            <path d="M25 50h15l5-10 8 20 6-13 6 8h10" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="50" r="8" fill="#10b981" />
          </svg>
        )}

        {/* Live Active Status Indicator Pulse */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900 shadow-[0_0_8px_rgba(52,211,153,0.9)] z-20 animate-pulse" />
      </div>
      
      {showText && (
        <div className="flex flex-col logo-text">
          <div className="flex items-baseline gap-1">
            <span className={`${fontSize} font-[1000] tracking-tight text-slate-900 dark:text-white leading-none`}>
              Doctorian
            </span>
            <span className={`${fontSize} font-[1000] tracking-tight text-blue-600 dark:text-blue-400 leading-none`}>
              AI
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-0.5 w-3 bg-blue-500 rounded-full" />
            <span className="text-[8.5px] sm:text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 whitespace-nowrap">Medical Intelligence</span>
          </div>
        </div>
      )}
    </div>
  );
};


