import React from 'react';
// @ts-ignore
import doctorianLogo from '../assets/images/doctorian_logo_1779622956808.png';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText = true }) => {
  const containerSize = size === 'xs' ? 'w-8 h-8' : size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-12 h-12' : size === 'lg' ? 'w-16 h-16' : size === 'xl' ? 'w-24 h-24' : 'w-12 h-12';
  const fontSize = size === 'xs' ? 'text-sm' : size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl';

  return (
    <div className={`flex items-center gap-3 group/logo ${className}`}>
      <div className={`relative ${containerSize} flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200/10`}>
        {/* Dynamic Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-500 rounded-2xl group-hover/logo:scale-105 transition-all duration-500 shadow-lg shadow-blue-500/20" />
        
        {/* High Quality Platform Logo */}
        <img 
          src={doctorianLogo} 
          alt="Doctorian Platform Logo"
          className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-500 group-hover/logo:scale-110"
          referrerPolicy="no-referrer"
        />

        {/* Status Indicator Pulse */}
        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full border border-white dark:border-slate-900 shadow-[0_0_12px_rgba(52,211,153,0.8)] z-20 animate-pulse" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className={`${fontSize} font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none`}>
              Doctorian
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-4 bg-slate-300 dark:bg-slate-700" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 whitespace-nowrap">Link Doctors Network</span>
          </div>
        </div>
      )}
    </div>
  );
};
