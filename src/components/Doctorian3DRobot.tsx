import React from 'react';
import { motion } from 'motion/react';

interface Doctorian3DRobotProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isAvatar?: boolean;
}

export const Doctorian3DRobot: React.FC<Doctorian3DRobotProps> = ({
  size = 'md',
  className = '',
  isAvatar = false,
}) => {
  const dimensions = {
    sm: { w: 44, h: 44 },
    md: { w: 120, h: 120 },
    lg: { w: 170, h: 170 },
  }[size];

  if (isAvatar) {
    return (
      <div 
        className={`relative rounded-full flex items-center justify-center overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.45)] bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 shrink-0 ${className}`}
        style={{ width: dimensions.w, height: dimensions.h }}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-radial from-cyan-500/20 to-transparent blur-xs pointer-events-none" />
        
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full p-0.5"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head Sphere */}
          <circle cx="50" cy="50" r="38" fill="url(#botHeadGrad)" stroke="#38bdf8" strokeWidth="2" />
          {/* Cyan Visor */}
          <rect x="25" y="36" width="50" height="26" rx="13" fill="#030b1e" stroke="#0ea5e9" strokeWidth="1.5" />
          {/* Glowing Visor Eyes (Smiling Curved Arc Eyes) */}
          <path d="M34 49 C36 44, 42 44, 44 49" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <path d="M56 49 C58 44, 64 44, 66 49" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          {/* Ear Pods */}
          <circle cx="12" cy="50" r="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="88" cy="50" r="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
          
          <defs>
            <linearGradient id="botHeadGrad" x1="50" y1="12" x2="50" y2="88" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f8fafc" />
              <stop offset="0.75" stopColor="#e2e8f0" />
              <stop offset="1" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative select-none flex items-center justify-center shrink-0 ${className}`}
      style={{ width: dimensions.w, height: dimensions.h }}
    >
      {/* Background Soft Floating Orb */}
      <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
      <div className="absolute inset-2 bg-blue-600/25 rounded-full blur-xl pointer-events-none" />

      <svg 
        viewBox="0 0 160 160" 
        className="w-full h-full drop-shadow-[0_10px_25px_rgba(6,182,212,0.35)]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floating Ring / Halo */}
        <ellipse cx="80" cy="142" rx="42" ry="7" fill="#0284c7" opacity="0.35" />

        {/* Robot Body / Torso */}
        <path 
          d="M50 115 C50 95, 110 95, 110 115 C110 135, 50 135, 50 115 Z" 
          fill="url(#bodyGrad)" 
          stroke="#38bdf8" 
          strokeWidth="2.5" 
        />

        {/* Stethoscope Tubing around Neck */}
        <path 
          d="M58 98 C56 116, 104 116, 102 98" 
          stroke="#0284c7" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Stethoscope Chest Piece */}
        <circle cx="80" cy="116" r="6" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="80" cy="116" r="2.5" fill="#38bdf8" />

        {/* Medical Cross Chest Emblem */}
        <rect x="77" y="126" width="6" height="14" rx="2" fill="#0ea5e9" />
        <rect x="73" y="130" width="14" height="6" rx="2" fill="#0ea5e9" />

        {/* Floating Spherical Shoulders */}
        <circle cx="44" cy="116" r="9" fill="url(#shoulderGrad)" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="116" cy="116" r="9" fill="url(#shoulderGrad)" stroke="#38bdf8" strokeWidth="2" />

        {/* Head Sphere */}
        <circle cx="80" cy="62" r="38" fill="url(#headGrad)" stroke="#38bdf8" strokeWidth="3" />

        {/* Head Top Antenna / Light */}
        <path d="M80 24 L80 16" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="80" cy="14" r="4" fill="#38bdf8" className="animate-pulse" />

        {/* Ear Pods */}
        <rect x="38" y="52" width="7" height="20" rx="3.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
        <rect x="115" y="52" width="7" height="20" rx="3.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />

        {/* Dark High-Tech Visor Screen */}
        <rect x="52" y="47" width="56" height="30" rx="15" fill="#020a1c" stroke="#0ea5e9" strokeWidth="2" />

        {/* Smiling Cyan Visor Eyes */}
        <motion.path 
          d="M62 61 C64 54, 71 54, 73 61" 
          stroke="#38bdf8" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          fill="none"
          animate={{ strokeWidth: [3.5, 4, 3.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.path 
          d="M87 61 C89 54, 96 54, 98 61" 
          stroke="#38bdf8" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          fill="none"
          animate={{ strokeWidth: [3.5, 4, 3.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Subtle Visor Glass Reflection */}
        <path d="M58 52 C72 49, 90 49, 102 54" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        <defs>
          <linearGradient id="headGrad" x1="80" y1="24" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="0.65" stopColor="#e2e8f0" />
            <stop offset="1" stopColor="#94a3b8" />
          </linearGradient>

          <linearGradient id="bodyGrad" x1="80" y1="95" x2="80" y2="135" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="0.7" stopColor="#cbd5e1" />
            <stop offset="1" stopColor="#64748b" />
          </linearGradient>

          <linearGradient id="shoulderGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};
