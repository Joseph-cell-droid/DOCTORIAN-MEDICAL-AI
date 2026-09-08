import React from 'react';
import { motion } from 'motion/react';

interface HumanBodyVitalsModelProps {
  temperature?: number;
  heartRate?: number;
  spo2?: number;
  respiratoryRate?: number;
  onSelectNode?: (node: 'temp' | 'heart' | 'spo2' | 'lungs') => void;
  className?: string;
}

export const HumanBodyVitalsModel: React.FC<HumanBodyVitalsModelProps> = ({
  temperature = 36.8,
  heartRate = 72,
  spo2 = 98,
  respiratoryRate = 16,
  onSelectNode,
  className = '',
}) => {
  return (
    <div className={`relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center select-none ${className}`}>
      {/* 1. Background Holographic Concentric Radar Circles & Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Soft Radial Ambient Glow */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-blue-600/15 blur-2xl animate-pulse" />

        {/* Outer Circular Orbital Ring */}
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-blue-500/30" />

        {/* Middle Circular Orbital Ring */}
        <div className="absolute w-32 h-32 sm:w-38 sm:h-38 rounded-full border border-cyan-500/20" />

        {/* Inner Circular Orbital Ring */}
        <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-blue-400/25" />

        {/* Cybernetic Accent Arcs */}
        <div 
          className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border-t border-r border-cyan-400/40 animate-spin" 
          style={{ animationDuration: '30s' }} 
        />
      </div>

      {/* 2. Hologram 3D Human Silhouette & Center ECG Heart Shield */}
      <svg 
        viewBox="0 0 200 220" 
        className="w-32 h-32 sm:w-38 sm:h-38 z-10 drop-shadow-[0_0_18px_rgba(6,182,212,0.5)]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head with Contoured 3D Glow */}
        <ellipse cx="100" cy="36" rx="17" ry="20" fill="url(#headGlowGrad)" stroke="#38bdf8" strokeWidth="1.6" />
        <ellipse cx="100" cy="34" rx="12" ry="14" fill="#0284c7" fillOpacity="0.4" />

        {/* Neck */}
        <path d="M93 54 L93 64 L107 64 L107 54 Z" fill="url(#torsoMeshGrad)" stroke="#38bdf8" strokeWidth="1.4" />

        {/* Shoulders, Upper Chest & Torso Contour */}
        <path 
          d="M58 82 C68 68, 132 68, 142 82 C152 96, 145 130, 138 165 C134 185, 126 215, 120 220 L80 220 C74 215, 66 185, 62 165 C55 130, 48 96, 58 82 Z" 
          fill="url(#torsoMeshGrad)" 
          stroke="#0ea5e9" 
          strokeWidth="1.8" 
        />

        {/* Arm Contours */}
        <path d="M54 86 C46 108, 42 140, 40 165" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <path d="M146 86 C154 108, 158 140, 160 165" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />

        {/* Internal Bio-circuit Lines */}
        <path d="M100 64 L100 95" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <path d="M84 90 L116 90" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />

        {/* Center Glowing Heart Shield with Bright White ECG Wave (Exact Photo) */}
        <g transform="translate(82, 92)">
          {/* Shield / Heart badge */}
          <path 
            d="M18 2 C26 2, 33 6, 34 14 C35 24, 25 32, 18 36 C11 32, 1 24, 2 14 C3 6, 10 2, 18 2 Z" 
            fill="#0369a1" 
            fillOpacity="0.95"
            stroke="#38bdf8" 
            strokeWidth="1.8"
            className="drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]"
          />
          {/* Pulsing White ECG Wave */}
          <path 
            d="M5 18 L11 18 L14 10 L18 26 L22 13 L25 21 L31 18" 
            stroke="#ffffff" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="drop-shadow-[0_0_6px_#ffffff]"
          />
        </g>

        <defs>
          <linearGradient id="headGlowGrad" x1="100" y1="16" x2="100" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="0.6" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="1" stopColor="#0369a1" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="torsoMeshGrad" x1="100" y1="64" x2="100" y2="220" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284c7" stopOpacity="0.45" />
            <stop offset="0.4" stopColor="#0369a1" stopOpacity="0.3" />
            <stop offset="1" stopColor="#075985" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* 3. Four Circular Orbital Node Badges (Exact Photo 6) */}

      {/* Node 1: Thermometer (Top-Left, ~11 o'clock) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectNode?.('temp')}
        className="absolute top-1 left-2 sm:left-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#051c38]/95 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.6)] flex items-center justify-center text-cyan-300 cursor-pointer z-20 group backdrop-blur-md"
        title={`Body Temperature: ${temperature}°C`}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-300 group-hover:rotate-6 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" fill="#00e5ff" fillOpacity="0.25" />
          <circle cx="11.5" cy="17.5" r="2" fill="#00e5ff" />
          <path d="M11.5 8v6" stroke="#00e5ff" strokeWidth="2" />
        </svg>
      </motion.button>

      {/* Node 2: Heart (Top-Right, ~2 o'clock) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectNode?.('heart')}
        className="absolute top-1 right-2 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2a0c1b]/95 border border-rose-400/70 shadow-[0_0_14px_rgba(244,63,94,0.6)] flex items-center justify-center text-rose-400 cursor-pointer z-20 group backdrop-blur-md animate-pulse"
        title={`Heart Rate: ${heartRate} BPM`}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" fill="#f43f5e" stroke="#fb7185" strokeWidth="1.5">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </motion.button>

      {/* Node 3: SpO2 Water Droplet (Bottom-Left, ~7:30) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectNode?.('spo2')}
        className="absolute bottom-1 left-2 sm:left-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#061e2b]/95 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.6)] flex items-center justify-center text-cyan-300 cursor-pointer z-20 group backdrop-blur-md"
        title={`SpO2 Blood Oxygen: ${spo2}%`}
      >
        <div className="flex flex-col items-center justify-center leading-none">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-cyan-300" fill="#06b6d4" fillOpacity="0.3" stroke="#22d3ee" strokeWidth="1.8">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span className="text-[7.5px] font-black text-cyan-200 tracking-tighter mt-0.5">O₂</span>
        </div>
      </motion.button>

      {/* Node 4: Anatomical Lungs (Bottom-Right, ~4:30) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectNode?.('lungs')}
        className="absolute bottom-1 right-2 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1d0a2f]/95 border border-purple-400/70 shadow-[0_0_14px_rgba(168,85,247,0.6)] flex items-center justify-center text-purple-300 cursor-pointer z-20 group backdrop-blur-md"
        title={`Respiration Rate: ${respiratoryRate} bpm`}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" fill="#a855f7" fillOpacity="0.3" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Trachea */}
          <path d="M12 3v5" />
          {/* Left Bronchus & Lung lobe */}
          <path d="M12 8c-2 1-3 2-4 4-1.5 3-2 6-1 8 1 2 3 2 4 1 1-1 1.5-3 1.5-6v-7" />
          {/* Right Bronchus & Lung lobe */}
          <path d="M12 8c2 1 3 2 4 4 1.5 3 2 6 1 8-1 2-3 2-4 1-1-1-1.5-3-1.5-6v-7" />
        </svg>
      </motion.button>
    </div>
  );
};

