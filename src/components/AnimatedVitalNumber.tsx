import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedVitalNumberProps {
  value: number | string;
  decimals?: number;
  duration?: number;
  className?: string;
  showDirectionIndicator?: boolean;
}

/**
 * AnimatedVitalNumber
 * Smoothly counts up or down with cubic easing whenever heart rate, SpO2,
 * or other vital parameters change in the Patient Monitor.
 * Features subtle vertical glide, gentle clinical micro-halo, and tabular numeric stability.
 */
export const AnimatedVitalNumber: React.FC<AnimatedVitalNumberProps> = ({
  value,
  decimals = 0,
  duration = 450,
  className = '',
  showDirectionIndicator = false,
}) => {
  const isNumeric = typeof value === 'number' || (typeof value === 'string' && value !== '--' && !isNaN(parseFloat(value)));
  const targetNum = isNumeric ? (typeof value === 'number' ? value : parseFloat(value)) : null;

  const [displayNum, setDisplayNum] = useState<number | null>(targetNum);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  
  const displayNumRef = useRef<number | null>(targetNum);
  displayNumRef.current = displayNum;
  
  const targetNumRef = useRef<number | null>(targetNum);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    // If incoming value is not a valid number (e.g. '--' or null)
    if (targetNum === null) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setDisplayNum(null);
      setDirection(null);
      targetNumRef.current = null;
      return;
    }

    // Initial mount or transition from non-numeric
    if (displayNumRef.current === null) {
      setDisplayNum(targetNum);
      targetNumRef.current = targetNum;
      return;
    }

    // If target has not changed, do nothing
    if (Math.abs(targetNum - (targetNumRef.current ?? targetNum)) < 0.001) {
      return;
    }

    const startVal = displayNumRef.current;
    const diff = targetNum - startVal;

    if (Math.abs(diff) < 0.01) {
      setDisplayNum(targetNum);
      targetNumRef.current = targetNum;
      return;
    }

    // Determine direction for subtle visual feedback
    const newDir = diff > 0 ? 'up' : 'down';
    setDirection(newDir);
    targetNumRef.current = targetNum;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const startTime = performance.now();
    // Dynamic subtle duration: scales smoothly with delta but never drags on
    const animDuration = Math.min(duration, Math.max(260, Math.abs(diff) * 45));

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / animDuration);

      // Smooth easeOutCubic: 1 - (1 - t)^3
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + diff * ease;

      setDisplayNum(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayNum(targetNum);
        rafRef.current = null;
        // Fade out subtle direction feedback shortly after settling
        timeoutRef.current = setTimeout(() => {
          setDirection(null);
        }, 280);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [targetNum, duration]);

  if (displayNum === null) {
    return <span className={className}>--</span>;
  }

  const formatted = decimals > 0 ? displayNum.toFixed(decimals) : Math.round(displayNum).toString();

  return (
    <span className={`inline-flex items-baseline relative tabular-nums select-none ${className}`}>
      <motion.span
        key={direction ? `anim-${direction}` : 'idle'}
        initial={
          direction === 'up'
            ? { y: 2, opacity: 0.92 }
            : direction === 'down'
            ? { y: -2, opacity: 0.92 }
            : false
        }
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block tabular-nums transition-[filter] duration-300"
        style={{
          filter:
            direction === 'up'
              ? 'drop-shadow(0 0 7px rgba(52, 211, 153, 0.45))'
              : direction === 'down'
              ? 'drop-shadow(0 0 7px rgba(56, 189, 248, 0.45))'
              : 'none',
        }}
      >
        {formatted}
      </motion.span>
      {showDirectionIndicator && (
        <AnimatePresence>
          {direction && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7, x: 2 }}
              animate={{ opacity: 0.85, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className={`text-[10px] ml-1 font-mono align-super font-bold shrink-0 ${
                direction === 'up' ? 'text-emerald-400' : 'text-cyan-400'
              }`}
            >
              {direction === 'up' ? '▲' : '▼'}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </span>
  );
};

export default AnimatedVitalNumber;
