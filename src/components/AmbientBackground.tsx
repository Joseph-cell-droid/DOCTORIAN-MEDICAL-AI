import React from 'react';
import { motion } from 'motion/react';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Top Ambient Glow Orb */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
          x: [0, 20, 0],
          y: [0, -15, 0]
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-indigo-600/0 blur-[130px] dark:from-cyan-500/25 dark:via-blue-600/20 dark:to-indigo-600/0"
      />

      {/* Floating Bottom Left Pulse */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, -25, 0],
          y: [0, 20, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent blur-[140px] dark:from-indigo-600/25 dark:via-purple-600/15"
      />

      {/* Floating Right Emerald Glow (Vitals theme) */}
      <motion.div
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute bottom-10 -right-48 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-emerald-500/15 via-teal-500/10 to-transparent blur-[150px] dark:from-emerald-500/20 dark:via-teal-600/15"
      />
    </div>
  );
};
