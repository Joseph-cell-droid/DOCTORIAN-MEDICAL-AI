import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

export interface VitalsRangeGuideProps {
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  align?: 'start' | 'center' | 'end';
  className?: string;
  triggerClassName?: string;
  showIconBadge?: boolean;
}

export const BioTelemetryRangeTooltip: React.FC<VitalsRangeGuideProps> = ({
  children,
  position = 'auto',
  align = 'center',
  className = '',
  triggerClassName = '',
  showIconBadge = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [resolvedPosition, setResolvedPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Calculate position relative to viewport boundaries
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      if (position === 'auto') {
        // If closer to the right, align leftward, if closer to bottom, open upwards
        if (rect.bottom + 380 > viewportHeight) {
          setResolvedPosition('top');
        } else {
          setResolvedPosition('bottom');
        }
      } else {
        setResolvedPosition(position);
      }
    }
  }, [isOpen, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center ${triggerClassName}`}
    >
      {children}

      {showIconBadge && (
        <span
          className="ml-1.5 p-0.5 rounded-full text-blue-500 hover:text-blue-600 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors cursor-help inline-flex items-center justify-center"
          title="Clinical acceptable vitals range guide"
          aria-label="Clinical acceptable vitals range guide"
        >
          <Info size={13} className="shrink-0" />
        </span>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: resolvedPosition === 'top' ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: resolvedPosition === 'top' ? 6 : -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className={`absolute z-[9999] w-80 sm:w-96 rounded-2xl p-4 sm:p-5 bg-slate-900/95 dark:bg-slate-950/95 text-slate-100 border border-cyan-500/40 shadow-2xl backdrop-blur-xl pointer-events-auto select-none ${
              resolvedPosition === 'top'
                ? 'bottom-full mb-3'
                : resolvedPosition === 'bottom'
                ? 'top-full mt-3'
                : resolvedPosition === 'left'
                ? 'right-full mr-3 top-1/2 -translate-y-1/2'
                : 'left-full ml-3 top-1/2 -translate-y-1/2'
            } ${
              align === 'start'
                ? 'left-0'
                : align === 'end'
                ? 'right-0'
                : 'left-1/2 -translate-x-1/2'
            } ${className}`}
            style={{
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7), 0 0 25px rgba(6,182,212,0.25)'
            }}
          >
            {/* Header Banner */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-sm shadow-cyan-500/20">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Bio-Telemetry Monitor
                    </h4>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 font-mono">
                      REF GUIDE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Clinical acceptable physiological reference ranges
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tight bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60 shrink-0">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>WHO / MoH</span>
              </div>
            </div>

            {/* Vitals Range Grid */}
            <div className="space-y-3 pt-3">
              {/* 1. HEART RATE (HR) */}
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="text-rose-400 shrink-0 animate-pulse" />
                    <span className="text-xs font-black text-white">Heart Rate (Pulse)</span>
                  </div>
                  <span className="text-[11px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    60 – 100 BPM
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[10px] pt-1">
                  <div className="p-1 rounded bg-slate-900/80 border border-slate-800 text-center">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                      Bradycardia
                    </span>
                    <span className="font-mono font-bold text-amber-400">&lt; 60 BPM</span>
                  </div>
                  <div className="p-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-center">
                    <span className="block text-[8px] uppercase tracking-wider text-emerald-300 font-bold">
                      Normal Resting
                    </span>
                    <span className="font-mono font-bold text-emerald-300">60–100 BPM</span>
                  </div>
                  <div className="p-1 rounded bg-slate-900/80 border border-slate-800 text-center">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                      Tachycardia
                    </span>
                    <span className="font-mono font-bold text-rose-400">&gt; 100 BPM</span>
                  </div>
                </div>
                <p className="text-[9.5px] text-slate-400 mt-1.5 leading-snug">
                  Critical Alarm: <strong className="text-rose-300">&lt; 45 BPM</strong> or <strong className="text-rose-300">&gt; 140 BPM</strong>. (Athletes may naturally rest at 40–55 BPM).
                </p>
              </div>

              {/* 2. OXYGEN SATURATION (SpO2) */}
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Droplets size={14} className="text-cyan-400 shrink-0" />
                    <span className="text-xs font-black text-white">Blood Oxygen (SpO2)</span>
                  </div>
                  <span className="text-[11px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    95% – 100%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[10px] pt-1">
                  <div className="p-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-center">
                    <span className="block text-[8px] uppercase tracking-wider text-emerald-300 font-bold">
                      Optimal
                    </span>
                    <span className="font-mono font-bold text-emerald-300">95%–100%</span>
                  </div>
                  <div className="p-1 rounded bg-amber-950/30 border border-amber-500/30 text-center">
                    <span className="block text-[8px] uppercase tracking-wider text-amber-300 font-bold">
                      Mild Hypoxia
                    </span>
                    <span className="font-mono font-bold text-amber-300">91%–94%</span>
                  </div>
                  <div className="p-1 rounded bg-rose-950/40 border border-rose-500/30 text-center">
                    <span className="block text-[8px] uppercase tracking-wider text-rose-300 font-bold">
                      Critical Hypoxia
                    </span>
                    <span className="font-mono font-bold text-rose-400">&le; 90%</span>
                  </div>
                </div>
                <p className="text-[9.5px] text-slate-400 mt-1.5 leading-snug">
                  Immediate emergency oxygen is required when SpO2 drops to <strong className="text-rose-300">&le; 90%</strong>. COPD target: 88%–92%.
                </p>
              </div>

              {/* 3. QUICK ADDITIONAL VITALS (Temperature & Blood Pressure) */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1">
                    <Thermometer size={12} className="text-amber-400 shrink-0" />
                    <span>Body Temp</span>
                  </div>
                  <p className="font-mono font-bold text-white text-[11px]">36.5°C – 37.5°C</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Fever: &gt; 38.0°C</p>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1">
                    <Stethoscope size={12} className="text-blue-400 shrink-0" />
                    <span>Blood Pressure</span>
                  </div>
                  <p className="font-mono font-bold text-white text-[11px]">90–120 / 60–80</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">mmHg (Resting)</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-medium">
              <span>Standard Adult Clinical Triage Baseline</span>
              <span className="text-cyan-400 font-semibold">Continuous Telemetry Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BioTelemetryRangeTooltip;
