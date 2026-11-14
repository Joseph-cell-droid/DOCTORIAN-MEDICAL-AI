import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ShieldCheck } from 'lucide-react';

interface MedicalAISplashProps {
  onDismiss?: () => void;
  autoCloseTimeout?: number; // ms, optional
}

export const MedicalAISplash: React.FC<MedicalAISplashProps> = ({
  onDismiss,
  autoCloseTimeout,
}) => {
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + 3, 100);
      });
    }, 45);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (autoCloseTimeout && onDismiss) {
      const closeTimer = setTimeout(onDismiss, autoCloseTimeout);
      return () => clearTimeout(closeTimer);
    }
  }, [autoCloseTimeout, onDismiss]);

  return (
    <div className="relative w-full min-h-screen bg-[#03091a] doctorian-canvas text-white flex flex-col justify-between items-center px-6 py-8 overflow-hidden select-none">
      {/* Subtle Ambient Bioluminescent Spotlights */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 35%, rgba(6, 182, 212, 0.25), transparent 55%),
            radial-gradient(circle at 50% 88%, rgba(29, 97, 242, 0.28), transparent 60%)
          `,
        }}
      />

      {/* Top Header Strip */}
      <div className="w-full max-w-md flex items-center justify-between text-cyan-300/90 text-xs relative z-10 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#071432]/85 border border-cyan-500/30 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wider text-[11px] text-cyan-200 flex items-center gap-1">
            <ShieldCheck size={13} className="text-cyan-400" /> Doctorian Clinical OS
          </span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0a1c44]/90 hover:bg-blue-600 border border-cyan-400/40 text-cyan-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-[0_4px_16px_rgba(6,182,212,0.25)] active:scale-95"
          >
            <span>Enter App</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Center Medical AI Lockup Matching Reference Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="my-auto flex flex-col items-center text-center relative z-10 max-w-md w-full"
      >
        {/* Glowing Doctorian Emblem */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-8 bg-cyan-500/25 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -inset-3 bg-blue-600/30 rounded-full blur-xl" />
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-[2.2rem] bg-gradient-to-b from-[#0d2455] to-[#050d24] border-2 border-cyan-400/45 shadow-[0_20px_50px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center p-4">
            <img
              src="/logo.png"
              alt="Doctorian AI Emblem"
              className="w-full h-full object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.65)]"
            />
          </div>
        </div>

        {/* Title: Doctorian AI */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
          Doctorian{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(34,211,238,0.5)]">
            AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base font-semibold text-slate-200 tracking-wide mb-7">
          Smart Healthcare. Better Life.
        </p>

        {/* Cyan ECG Heartbeat Pulse Divider */}
        <div className="w-full max-w-[260px] h-10 mb-5 flex items-center justify-center">
          <svg viewBox="0 0 220 36" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="splashEcgGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(6,182,212,0)" />
                <stop offset="30%" stopColor="#22d3ee" />
                <stop offset="70%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="rgba(6,182,212,0)" />
              </linearGradient>
            </defs>
            <path
              d="M0 18 L72 18 L82 18 L89 6 L97 30 L106 3 L115 26 L122 14 L128 18 L220 18"
              fill="none"
              stroke="url(#splashEcgGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.85)]"
            />
          </svg>
        </div>

        {/* Corrected Headline */}
        <p className="text-sm sm:text-base font-medium text-slate-200/95 max-w-xs leading-snug mb-8">
          Revolutionizing Healthcare
          <br />
          Through Artificial Intelligence
        </p>
      </motion.div>

      {/* Bottom Luminous Cyan Particle Waves & Initializing Spinner */}
      <div className="w-full max-w-md flex flex-col items-center relative z-10 pb-4 space-y-4">
        <div className="w-full h-16 overflow-hidden relative opacity-85 pointer-events-none">
          <svg viewBox="0 0 400 70" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveCyan" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(6,182,212,0)" />
                <stop offset="50%" stopColor="rgba(34,211,238,0.8)" />
                <stop offset="100%" stopColor="rgba(6,182,212,0)" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0 45 Q100 10, 200 40 T400 35"
              fill="none"
              stroke="url(#waveCyan)"
              strokeWidth="2"
              animate={{
                d: [
                  'M0 45 Q100 10, 200 40 T400 35',
                  'M0 35 Q100 60, 200 28 T400 48',
                  'M0 45 Q100 10, 200 40 T400 35',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M0 55 Q120 20, 230 50 T400 42"
              fill="none"
              stroke="rgba(59,130,246,0.55)"
              strokeWidth="1.5"
              strokeDasharray="2 5"
              animate={{
                d: [
                  'M0 55 Q120 20, 230 50 T400 42',
                  'M0 42 Q120 65, 230 35 T400 55',
                  'M0 55 Q120 20, 230 50 T400 42',
                ],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        {/* Circular Cyan Progress Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-[3.5px] border-cyan-500/20" />
          <div className="absolute inset-0 rounded-full border-[3.5px] border-transparent border-t-cyan-400 border-r-blue-500 animate-spin drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <span className="text-[10px] font-mono font-bold text-cyan-300 tabular-nums">
            {progress}%
          </span>
        </div>

        <p className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide">
          Initializing Doctorian...
        </p>
      </div>
    </div>
  );
};
