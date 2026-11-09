import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'pharmacy';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '' }) => {
  if (variant === 'pharmacy') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            E-pharmacy <span className="text-blue-600">&</span> Medics
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Buy Medicines • Get Medical Care • Stay Healthy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Heart with Cross and ECG */}
      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-600/30 p-2.5 mb-2">
        <svg viewBox="0 0 48 48" className="w-full h-full text-white" fill="none">
          {/* Heart outline */}
          <path
            d="M24 40.5s-16-10.2-16-21.5c0-6 4.7-10.5 10.5-10.5 4.1 0 7.2 2.3 8.5 4.5 1.3-2.2 4.4-4.5 8.5-4.5 5.8 0 10.5 4.5 10.5 10.5 0 11.3-16 21.5-16 21.5z"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Medical cross in upper center */}
          <path
            d="M24 15v8M20 19h8"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Pulse line through lower half */}
          <path
            d="M10 27h6l2.5-4 4 8 3.5-6 2 2h9"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-white font-extrabold text-lg tracking-tight">
        Doctorian AI
      </div>
      <div className="text-[10px] text-blue-200 font-medium tracking-wider uppercase">
        Uganda Clinical OS
      </div>
    </div>
  );
};
