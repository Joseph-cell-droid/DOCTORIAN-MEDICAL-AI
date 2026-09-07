import React from 'react';
import { motion } from 'motion/react';
import { Thermometer, Heart, Droplets, Wind } from 'lucide-react';

interface HumanBodyVitalsModelProps {
  temperature?: number;
  heartRate?: number;
  spo2?: number;
  respiratoryRate?: number;
  onSelectNode?: (node: 'temp' | 'heart' | 'spo2' | 'lungs') => void;
}

export const HumanBodyVitalsModel: React.FC<HumanBodyVitalsModelProps> = ({
  temperature = 36.8,
  heartRate = 72,
  spo2 = 98,
  respiratoryRate = 16,
  onSelectNode,
}) => {
  return (
    <div className="relative w-full max-w-sm h-64 sm:h-72 mx-auto flex items-center justify-center select-none overflow-visible">
      {/* Background Holographic Rings & Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-56 h-56 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '24s' }} />
        <div className="absolute w-44 h-44 rounded-full border border-blue-500/30 border-dashed" />
        <div className="absolute w-32 h-32 rounded-full bg-cyan-500/10 blur-xl animate-pulse" />
      </div>

      {/* Human Silhouette Wireframe */}
      <svg 
        viewBox="0 0 200 240" 
        className="w-full h-full max-h-64 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="100" cy="35" r="18" fill="url(#bodyMeshGrad)" stroke="#38bdf8" strokeWidth="1.5" />
        
        {/* Neck */}
        <path d="M94 53 L94 62 L106 62 L106 53" fill="url(#bodyMeshGrad)" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Torso / Upper Body & Shoulders */}
        <path 
          d="M62 76 C72 65, 128 65, 138 76 C148 88, 142 120, 136 148 C132 168, 124 195, 120 220 L108 220 L105 170 L95 170 L92 220 L80 220 C76 195, 68 168, 64 148 C58 120, 52 88, 62 76 Z" 
          fill="url(#bodyMeshGrad)" 
          stroke="#0ea5e9" 
          strokeWidth="1.8" 
        />

        {/* Arms */}
        <path d="M58 80 C50 100, 44 130, 42 150" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <path d="M142 80 C150 100, 156 130, 158 150" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

        {/* Internal Bio-circuit Lines */}
        <path d="M100 62 L100 135" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <path d="M85 92 L115 92" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
        <path d="M80 115 L120 115" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />

        {/* Center Heart Pulse Wave in Torso */}
        <rect x="86" y="98" width="28" height="24" rx="8" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
        <path 
          d="M89 110 L94 110 L97 104 L101 116 L104 107 L107 112 L111 110" 
          stroke="#ffffff" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        <defs>
          <linearGradient id="bodyMeshGrad" x1="100" y1="20" x2="100" y2="220" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="#0369a1" stopOpacity="0.25" />
            <stop offset="1" stopColor="#075985" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>

      {/* 4 Interactive Pulsing Hologram Nodes */}
      {/* 1. Temperature Node (Top Left) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectNode?.('temp')}
        className="absolute top-6 left-4 sm:left-8 w-11 h-11 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer group backdrop-blur-md"
        title={`Body Temperature: ${temperature}°C`}
      >
        <Thermometer size={20} className="group-hover:rotate-12 transition-transform" />
      </motion.button>

      {/* 2. Heart / Pulse Node (Top Right) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectNode?.('heart')}
        className="absolute top-6 right-4 sm:right-8 w-11 h-11 rounded-2xl bg-rose-950/80 border border-rose-400/50 flex items-center justify-center text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer group backdrop-blur-md animate-pulse"
        title={`Heart Rate: ${heartRate} BPM`}
      >
        <Heart size={20} className="fill-rose-500/40 group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* 3. SpO2 Node (Bottom Left) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectNode?.('spo2')}
        className="absolute bottom-6 left-4 sm:left-8 w-11 h-11 rounded-2xl bg-blue-950/80 border border-blue-400/50 flex items-center justify-center text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)] cursor-pointer group backdrop-blur-md"
        title={`SpO2 Blood Oxygen: ${spo2}%`}
      >
        <div className="flex flex-col items-center justify-center">
          <Droplets size={16} />
          <span className="text-[8px] font-black leading-none mt-0.5">O₂</span>
        </div>
      </motion.button>

      {/* 4. Lungs / Respiratory Node (Bottom Right) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectNode?.('lungs')}
        className="absolute bottom-6 right-4 sm:right-8 w-11 h-11 rounded-2xl bg-purple-950/80 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer group backdrop-blur-md"
        title={`Respiration: ${respiratoryRate} bpm`}
      >
        <Wind size={20} className="group-hover:translate-x-0.5 transition-transform" />
      </motion.button>
    </div>
  );
};
