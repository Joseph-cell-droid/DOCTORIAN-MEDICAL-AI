import React from 'react';
import { motion } from 'motion/react';

interface MovingCloudCondensationProps {
  className?: string;
  intensity?: 'soft' | 'medium' | 'deep';
  showDroplets?: boolean;
}

export const MovingCloudCondensation: React.FC<MovingCloudCondensationProps> = ({
  className = '',
  intensity = 'medium',
  showDroplets = true,
}) => {
  const opacityMultiplier = intensity === 'soft' ? 0.4 : intensity === 'deep' ? 0.85 : 0.65;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}>
      {/* Base Atmospheric Vapor Canvas */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: opacityMultiplier }}
      >
        {/* Cloud Layer 1: Top-Left Drifting Cyan/Ice Blue Mist */}
        <motion.div
          animate={{
            x: ['-10%', '12%', '-10%'],
            y: ['-5%', '8%', '-5%'],
            scale: [1, 1.15, 1],
            rotate: [0, 6, 0]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-32 -left-32 w-[650px] h-[550px] rounded-full bg-gradient-to-br from-cyan-400/25 via-sky-500/15 to-transparent blur-[110px] mix-blend-screen"
        />

        {/* Cloud Layer 2: Bottom-Right Shifting Deep Indigo Cloud */}
        <motion.div
          animate={{
            x: ['10%', '-14%', '10%'],
            y: ['8%', '-10%', '8%'],
            scale: [1, 1.2, 1],
            rotate: [0, -8, 0]
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-blue-500/15 to-transparent blur-[130px] mix-blend-screen"
        />

        {/* Cloud Layer 3: Central Swirling Condensation Vapor */}
        <motion.div
          animate={{
            scale: [0.95, 1.18, 0.95],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[750px] rounded-full bg-gradient-to-r from-teal-400/10 via-cyan-300/15 to-blue-400/10 blur-[140px] mix-blend-screen"
        />

        {/* Cloud Layer 4: Organic Cumulus Vector Cloud Shapes */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35 dark:opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="cloudGrad1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cloudGrad2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
            <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="60" />
            </filter>
          </defs>

          {/* Animated SVG Cloud Formations */}
          <g filter="url(#cloudBlur)">
            <motion.ellipse
              cx="30%"
              cy="35%"
              rx="300"
              ry="180"
              fill="url(#cloudGrad1)"
              animate={{
                cx: ['30%', '42%', '30%'],
                cy: ['35%', '28%', '35%'],
                rx: [300, 340, 300]
              }}
              transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.ellipse
              cx="75%"
              cy="65%"
              rx="360"
              ry="220"
              fill="url(#cloudGrad2)"
              animate={{
                cx: ['75%', '63%', '75%'],
                cy: ['65%', '72%', '65%'],
                ry: [220, 260, 220]
              }}
              transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        </svg>

        {/* Glass Condensation Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/5 via-slate-900/10 to-transparent backdrop-blur-[2px]" />

        {/* Floating Moisture Micro-Droplets Sparkle */}
        {showDroplets && (
          <div className="absolute inset-0 pointer-events-none">
            {[
              { top: '15%', left: '20%', size: 4, delay: 0 },
              { top: '25%', left: '75%', size: 3, delay: 1.2 },
              { top: '60%', left: '15%', size: 5, delay: 0.6 },
              { top: '70%', left: '80%', size: 3, delay: 2.1 },
              { top: '40%', left: '50%', size: 6, delay: 1.8 },
              { top: '85%', left: '45%', size: 4, delay: 2.7 },
              { top: '10%', left: '60%', size: 3, delay: 0.9 },
              { top: '50%', left: '88%', size: 5, delay: 3.1 }
            ].map((drop, idx) => (
              <motion.div
                key={`movingcloudcondensation-l140-idx-${idx}`}
                style={{ top: drop.top, left: drop.left, width: drop.size, height: drop.size }}
                animate={{
                  opacity: [0.15, 0.75, 0.15],
                  y: [0, -6, 0],
                  scale: [0.9, 1.2, 0.9]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: drop.delay,
                  ease: 'easeInOut'
                }}
                className="absolute rounded-full bg-cyan-200/80 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
