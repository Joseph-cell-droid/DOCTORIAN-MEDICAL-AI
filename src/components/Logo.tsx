import React from 'react';
import { Stethoscope, BrainCircuit } from 'lucide-react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText = true }) => {
  const iconSize = size === 'xs' ? 16 : size === 'sm' ? 20 : size === 'md' ? 24 : size === 'lg' ? 32 : size === 'xl' ? 48 : 24;
  const containerSize = size === 'xs' ? 'w-8 h-8' : size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-12 h-12' : size === 'lg' ? 'w-16 h-16' : size === 'xl' ? 'w-24 h-24' : 'w-12 h-12';
  const fontSize = size === 'xs' ? 'text-sm' : size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl';

  return (
    <div className={`flex items-center gap-3 group/logo ${className}`}>
      <div className={`relative ${containerSize} flex items-center justify-center`}>
        {/* Dynamic Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-500 rounded-2xl group-hover/logo:scale-105 transition-all duration-500 shadow-lg shadow-blue-500/20" />
        <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-[1px] opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
        
        {/* The Neural Cross Structure */}
        <div className="relative z-10 flex items-center justify-center text-white">
          <div className="absolute w-[70%] h-[20%] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          <div className="absolute h-[70%] w-[20%] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          
          {/* Neural Node Points */}
          <div className="absolute -top-[35%] w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
          <div className="absolute -bottom-[35%] w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
          <div className="absolute -left-[35%] w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
          <div className="absolute -right-[35%] w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
          
          <BrainCircuit size={iconSize * 0.6} className="relative z-20 text-blue-100 opacity-90 group-hover/logo:rotate-12 transition-transform duration-500" />
        </div>

        {/* Status Indicator Pulse */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full border border-white dark:border-slate-900 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
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
