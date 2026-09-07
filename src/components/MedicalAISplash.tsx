import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Sparkles, ChevronRight } from 'lucide-react';

interface MedicalAISplashProps {
  onDismiss?: () => void;
  autoCloseTimeout?: number; // ms, optional
}

export const MedicalAISplash: React.FC<MedicalAISplashProps> = ({
  onDismiss,
  autoCloseTimeout,
}) => {
  const [progress, setProgress] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + 2, 100);
      });
    }, 60);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (autoCloseTimeout && onDismiss) {
      const closeTimer = setTimeout(onDismiss, autoCloseTimeout);
      return () => clearTimeout(closeTimer);
    }
  }, [autoCloseTimeout, onDismiss]);

  return (
    <div className="relative w-full min-h-screen bg-[#040816] text-white flex flex-col justify-between items-center px-6 py-8 overflow-hidden select-none">
      {/* Background Neural Grid & Subtle Hex Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6,182,212,0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6,182,212,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top Mobile Status Simulation / Header */}
      <div className="w-full flex items-center justify-between text-cyan-400/80 text-xs font-mono relative z-10 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="tracking-widest uppercase text-[10px] text-cyan-300">NEURAL CORE v3.7</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs transition-all cursor-pointer"
          >
            <span>Enter App</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Center Medical AI Holographic Core (Exact Photo 4) */}
      <div className="my-auto flex flex-col items-center text-center relative z-10 max-w-md w-full">
        {/* Glow Halo */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-10 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -inset-4 bg-blue-600/30 rounded-full blur-xl" />

          {/* Concentric Cyber Rings */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-cyan-400/40 flex items-center justify-center">
            <div className="absolute inset-1 rounded-full border border-cyan-500/20 border-dashed animate-spin" style={{ animationDuration: '30s' }} />
            <div className="w-28 h-28 sm:w-34 sm:h-34 rounded-full border-2 border-cyan-400/60 flex items-center justify-center bg-gradient-to-b from-[#0a1532] to-[#040816] shadow-[0_0_35px_rgba(6,182,212,0.5)]">
              
              {/* Luminous Neon Medical Cross with Nodes */}
              <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_15px_#22d3ee]">
                {/* Circuit Traces */}
                <path d="M20 50 L35 50" stroke="#06b6d4" strokeWidth="2" strokeDasharray="2 2" />
                <path d="M80 50 L65 50" stroke="#06b6d4" strokeWidth="2" strokeDasharray="2 2" />
                <path d="M50 20 L50 35" stroke="#06b6d4" strokeWidth="2" strokeDasharray="2 2" />
                <path d="M50 80 L50 65" stroke="#06b6d4" strokeWidth="2" strokeDasharray="2 2" />

                {/* Vertical Bar */}
                <rect x="42" y="24" width="16" height="52" rx="4" fill="#06b6d4" />
                {/* Horizontal Bar */}
                <rect x="24" y="42" width="52" height="16" rx="4" fill="#06b6d4" />

                {/* Inner Cross Glow */}
                <rect x="45" y="27" width="10" height="46" rx="2" fill="#e0f2fe" opacity="0.9" />
                <rect x="27" y="45" width="46" height="10" rx="2" fill="#e0f2fe" opacity="0.9" />

                {/* Center Core Dot */}
                <circle cx="50" cy="50" r="4" fill="#ffffff" />

                {/* Corner Node Circles */}
                <circle cx="35" cy="35" r="2.5" fill="#38bdf8" />
                <circle cx="65" cy="35" r="2.5" fill="#38bdf8" />
                <circle cx="35" cy="65" r="2.5" fill="#38bdf8" />
                <circle cx="65" cy="65" r="2.5" fill="#38bdf8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title: MEDICAL AI */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider uppercase mb-2">
          MEDICAL <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">AI</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-cyan-300/80 uppercase mb-8">
          SMARTER CARE • HEALTHIER LIVES
        </p>

        {/* Loading Architecture */}
        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-cyan-400">
            <span>LOADING NEURAL ARCHITECTURE...</span>
            <span className="font-bold">{progress}%</span>
          </div>

          {/* Luminous Glowing Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-900 border border-cyan-500/30 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)] p-0.5">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300 shadow-[0_0_10px_#22d3ee]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          {/* 4 Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[0, 1, 2, 3].map((dot) => (
              <span 
                key={dot} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  progress > dot * 25 ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wireframe Wave & Heartbeat Line (Exact Photo 4) */}
      <div className="w-full flex flex-col items-center relative z-10 pb-4">
        {/* Animated Sine Wave Wireframe */}
        <div className="w-full max-w-md h-12 overflow-hidden relative opacity-70 mb-2">
          <svg viewBox="0 0 300 40" className="w-full h-full stroke-cyan-400/60 fill-none" preserveAspectRatio="none">
            <motion.path 
              d="M0 20 Q25 5, 50 20 T100 20 T150 20 T200 20 T250 20 T300 20"
              strokeWidth="1.5"
              animate={{ d: [
                "M0 20 Q25 5, 50 20 T100 20 T150 20 T200 20 T250 20 T300 20",
                "M0 20 Q25 35, 50 20 T100 20 T150 20 T200 20 T250 20 T300 20",
                "M0 20 Q25 5, 50 20 T100 20 T150 20 T200 20 T250 20 T300 20",
              ]}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <path d="M0 20 L300 20" stroke="rgba(6,182,212,0.2)" strokeWidth="0.8" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* Heartbeat Line with Text */}
        <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.3em] text-cyan-400">
          <Activity size={16} className="text-cyan-400 animate-pulse" />
          <span>AI • MEDICINE • YOU</span>
          <Activity size={16} className="text-cyan-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
