import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface Bubble {
  id: number;
  size: number;
  color: string;
  glowColor: string;
  initialX: number;
  initialY: number;
  targetX: number[];
  targetY: number[];
  duration: number;
  delay: number;
  blur: string;
  opacity: number;
}

export const AmbientBubbleBackground: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  // Generate deterministic, elegant bubble parameters
  const bubbles: Bubble[] = useMemo(() => {
    return [
      {
        id: 1,
        size: 320,
        color: 'from-cyan-500/30 via-blue-600/20 to-transparent',
        glowColor: 'rgba(6, 182, 212, 0.25)',
        initialX: 10,
        initialY: 20,
        targetX: [10, 25, 5, 20, 10],
        targetY: [20, 45, 70, 30, 20],
        duration: 22,
        delay: 0,
        blur: 'blur-3xl',
        opacity: isDarkMode ? 0.35 : 0.2,
      },
      {
        id: 2,
        size: 380,
        color: 'from-purple-600/30 via-indigo-500/20 to-transparent',
        glowColor: 'rgba(147, 51, 234, 0.25)',
        initialX: 75,
        initialY: 60,
        targetX: [75, 55, 85, 65, 75],
        targetY: [60, 25, 10, 45, 60],
        duration: 28,
        delay: 2,
        blur: 'blur-3xl',
        opacity: isDarkMode ? 0.35 : 0.2,
      },
      {
        id: 3,
        size: 260,
        color: 'from-emerald-500/25 via-teal-500/15 to-transparent',
        glowColor: 'rgba(16, 185, 129, 0.2)',
        initialX: 45,
        initialY: 80,
        targetX: [45, 70, 30, 60, 45],
        targetY: [80, 50, 25, 65, 80],
        duration: 25,
        delay: 4,
        blur: 'blur-2xl',
        opacity: isDarkMode ? 0.3 : 0.18,
      },
      {
        id: 4,
        size: 220,
        color: 'from-blue-500/30 via-sky-400/20 to-transparent',
        glowColor: 'rgba(59, 130, 246, 0.25)',
        initialX: 80,
        initialY: 15,
        targetX: [80, 60, 90, 70, 80],
        targetY: [15, 40, 75, 30, 15],
        duration: 19,
        delay: 1,
        blur: 'blur-2xl',
        opacity: isDarkMode ? 0.35 : 0.22,
      },
      {
        id: 5,
        size: 300,
        color: 'from-violet-600/25 via-fuchsia-500/15 to-transparent',
        glowColor: 'rgba(124, 58, 237, 0.2)',
        initialX: 20,
        initialY: 70,
        targetX: [20, 40, 15, 35, 20],
        targetY: [70, 35, 15, 50, 70],
        duration: 31,
        delay: 3,
        blur: 'blur-3xl',
        opacity: isDarkMode ? 0.3 : 0.15,
      },
      {
        id: 6,
        size: 180,
        color: 'from-cyan-400/40 via-emerald-400/20 to-transparent',
        glowColor: 'rgba(34, 211, 238, 0.3)',
        initialX: 60,
        initialY: 35,
        targetX: [60, 35, 75, 50, 60],
        targetY: [35, 75, 45, 15, 35],
        duration: 17,
        delay: 0.5,
        blur: 'blur-2xl',
        opacity: isDarkMode ? 0.4 : 0.25,
      }
    ];
  }, [isDarkMode]);

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-opacity duration-1000"
    >
      {/* Background Subtly Patterned Grid Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] dark:opacity-[0.06]" />

      {/* Floating Animated Ambient Bubbles */}
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          initial={{
            left: `${b.initialX}%`,
            top: `${b.initialY}%`,
            scale: 0.9,
          }}
          animate={{
            left: b.targetX.map((x) => `${x}%`),
            top: b.targetY.map((y) => `${y}%`),
            scale: [0.9, 1.15, 0.95, 1.1, 0.9],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            opacity: b.opacity,
          }}
          className={`absolute rounded-full bg-gradient-to-br ${b.color} ${b.blur} transform -translate-x-1/2 -translate-y-1/2`}
        >
          {/* Inner Specular Highlight Lens Effect for Realistic Bubble Depth */}
          <div className="absolute inset-2 rounded-full border border-white/20 dark:border-white/10 opacity-60 bg-radial from-white/10 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      ))}

      {/* Crisp Medical Bio-Glow Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.4)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,6,23,0.7)_100%)]" />
    </div>
  );
};
