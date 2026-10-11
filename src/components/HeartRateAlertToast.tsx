import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, AlertTriangle, AlertCircle, Bell, BellOff, X, 
  ChevronRight, Activity, ShieldAlert, CheckCircle2, Sliders, Volume2, VolumeX 
} from 'lucide-react';

export interface HeartRateThresholds {
  min: number;
  max: number;
  warningMin: number;
  warningMax: number;
}

interface HeartRateAlertToastProps {
  heartRate?: number | null;
  thresholds?: HeartRateThresholds;
  onUpdateThresholds?: (newThresholds: HeartRateThresholds) => void;
  onInspectECG?: () => void;
  onEmergencyDispatch?: () => void;
  className?: string;
}

export const HeartRateAlertToast: React.FC<HeartRateAlertToastProps> = ({
  heartRate,
  thresholds = { min: 50, max: 120, warningMin: 60, warningMax: 100 },
  onUpdateThresholds,
  onInspectECG,
  onEmergencyDispatch,
  className = '',
}) => {
  const hr = typeof heartRate === 'number' && !isNaN(heartRate) ? Math.round(heartRate) : null;

  // Snooze and dismiss tracking
  const [isSnoozed, setIsSnoozed] = useState<boolean>(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showThresholdAdjuster, setShowThresholdAdjuster] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(true);
  const [normalRecoveryToast, setNormalRecoveryToast] = useState<boolean>(false);

  // Audio Context Ref for warning chime
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastChimeTimeRef = useRef<number>(0);

  // Evaluate violation status
  const alertStatus = useMemo(() => {
    if (hr === null) return null;

    if (hr < thresholds.min) {
      return {
        type: 'critical_bradycardia' as const,
        severity: 'critical' as const,
        title: 'Critical Bradycardia Alert',
        message: `Heart rate is dangerously low at ${hr} BPM (below critical threshold of ${thresholds.min} BPM).`,
        advice: 'Syncope and severe hypoperfusion risk. Check airway and patient responsiveness immediately.',
        color: 'rose',
        accentBg: 'bg-rose-500/20 border-rose-500/50 text-rose-200',
        badgeBg: 'bg-rose-600 text-white',
        pulseGlow: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]',
      };
    }

    if (hr > thresholds.max) {
      return {
        type: 'critical_tachycardia' as const,
        severity: 'critical' as const,
        title: 'Critical Tachycardia Alert',
        message: `Heart rate has spiked to ${hr} BPM (exceeds critical threshold of ${thresholds.max} BPM).`,
        advice: 'Acute ventricular tachycardia or hemodynamic instability. Review ECG rhythm strip now.',
        color: 'rose',
        accentBg: 'bg-rose-500/20 border-rose-500/50 text-rose-200',
        badgeBg: 'bg-rose-600 text-white',
        pulseGlow: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]',
      };
    }

    if (hr < thresholds.warningMin) {
      return {
        type: 'warning_bradycardia' as const,
        severity: 'warning' as const,
        title: 'Bradycardia Threshold Exceeded',
        message: `Heart rate is ${hr} BPM (below resting safe boundary of ${thresholds.warningMin} BPM).`,
        advice: 'Mild resting bradycardia. Monitor for dizziness, fatigue, or conduction block.',
        color: 'amber',
        accentBg: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
        badgeBg: 'bg-amber-600 text-white',
        pulseGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      };
    }

    if (hr > thresholds.warningMax) {
      return {
        type: 'warning_tachycardia' as const,
        severity: 'warning' as const,
        title: 'Tachycardia Threshold Exceeded',
        message: `Heart rate is ${hr} BPM (exceeds resting safe boundary of ${thresholds.warningMax} BPM).`,
        advice: 'Elevated sinus rhythm. Patient may be experiencing fever, dehydration, or clinical anxiety.',
        color: 'amber',
        accentBg: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
        badgeBg: 'bg-amber-600 text-white',
        pulseGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      };
    }

    return null;
  }, [hr, thresholds]);

  // Audio advisory chime
  useEffect(() => {
    if (!alertStatus || soundMuted || isSnoozed) return;

    const now = Date.now();
    // Throttle chime to once every 12 seconds
    if (now - lastChimeTimeRef.current < 12000) return;
    lastChimeTimeRef.current = now;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(alertStatus.severity === 'critical' ? 880 : 660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        alertStatus.severity === 'critical' ? 440 : 550, 
        ctx.currentTime + 0.18
      );

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio autoplay policy
    }
  }, [alertStatus, soundMuted, isSnoozed]);

  // Handle recovery notification when returning from breach to normal
  const prevAlertStatusRef = useRef<typeof alertStatus>(null);
  useEffect(() => {
    if (prevAlertStatusRef.current && !alertStatus && hr !== null) {
      setNormalRecoveryToast(true);
      const timer = setTimeout(() => setNormalRecoveryToast(false), 3500);
      return () => clearTimeout(timer);
    }
    prevAlertStatusRef.current = alertStatus;
  }, [alertStatus, hr]);

  // Handle snooze timer countdown
  useEffect(() => {
    if (!isSnoozed) return;
    const interval = setInterval(() => {
      if (Date.now() >= snoozeUntil) {
        setIsSnoozed(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSnoozed, snoozeUntil]);

  // Handle Snooze Action (60 seconds)
  const handleSnooze = () => {
    setIsSnoozed(true);
    setSnoozeUntil(Date.now() + 60000); // 1 minute snooze
  };

  // If snoozed or dismissed, don't show the main alert
  const shouldShowAlert = Boolean(alertStatus && !isSnoozed && !isDismissed);

  return (
    <div className={`fixed top-4 right-4 sm:top-5 sm:right-6 z-[130] pointer-events-none max-w-md w-[calc(100vw-2rem)] sm:w-auto ${className}`}>
      {/* 1. Main Heart Rate Threshold Breach Toast Alert */}
      <AnimatePresence>
        {shouldShowAlert && alertStatus && (
          <motion.div
            key="hr-alert-toast"
            initial={{ opacity: 0, y: -25, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.94 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className={`pointer-events-auto rounded-2xl p-4 sm:p-5 border backdrop-blur-xl shadow-2xl ${
              alertStatus.severity === 'critical'
                ? 'bg-[#15060b]/95 border-rose-500/60 shadow-rose-950/60'
                : 'bg-[#180f03]/95 border-amber-500/60 shadow-amber-950/60'
            } text-white flex flex-col gap-3 select-none text-left relative overflow-hidden`}
          >
            {/* Ambient top glowing line */}
            <div 
              className={`absolute top-0 left-0 right-0 h-1 ${
                alertStatus.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
              }`} 
            />

            {/* Header: Alert Icon, Title, Live HR Counter & Dismiss */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    alertStatus.severity === 'critical'
                      ? 'bg-rose-500/25 border-rose-400 text-rose-400 animate-pulse'
                      : 'bg-amber-500/25 border-amber-400 text-amber-400'
                  }`}
                >
                  <Heart size={20} className="animate-bounce" fill="currentColor" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                      {alertStatus.title}
                    </h4>
                    <span 
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                        alertStatus.severity === 'critical' 
                          ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50' 
                          : 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                      }`}
                    >
                      {alertStatus.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Safe Boundary: {thresholds.warningMin} – {thresholds.warningMax} BPM • Critical: &lt;{thresholds.min} | &gt;{thresholds.max}
                  </p>
                </div>
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Dismiss Alert"
              >
                <X size={16} />
              </button>
            </div>

            {/* Core Telemetry Message Banner */}
            <div className={`p-3 rounded-xl border ${alertStatus.accentBg} flex items-center justify-between gap-2.5`}>
              <div className="flex items-center gap-2">
                <Activity size={16} className="shrink-0 text-white animate-pulse" />
                <span className="text-xs font-semibold leading-tight text-white">
                  {alertStatus.message}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl sm:text-2xl font-black font-mono leading-none tracking-tight text-white">
                  {hr}
                </span>
                <span className="text-[9px] font-bold text-slate-300 ml-1">BPM</span>
              </div>
            </div>

            {/* Clinical Advisory Description */}
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              {alertStatus.advice}
            </p>

            {/* Expandable Threshold Range Calibration Sliders */}
            {showThresholdAdjuster && onUpdateThresholds && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 border-t border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Calibrate Heart Rate Thresholds
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Live: {hr} BPM
                  </span>
                </div>

                {/* Min Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                    <span>Low Boundary (Bradycardia):</span>
                    <span className="text-cyan-300 font-bold">&lt; {thresholds.warningMin} BPM</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={75}
                    value={thresholds.warningMin}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateThresholds({
                        ...thresholds,
                        warningMin: val,
                        min: Math.min(thresholds.min, val - 10)
                      });
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Max Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                    <span>High Boundary (Tachycardia):</span>
                    <span className="text-rose-300 font-bold">&gt; {thresholds.warningMax} BPM</span>
                  </div>
                  <input
                    type="range"
                    min={85}
                    max={160}
                    value={thresholds.warningMax}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateThresholds({
                        ...thresholds,
                        warningMax: val,
                        max: Math.max(thresholds.max, val + 20)
                      });
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg accent-rose-500 cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
              {/* Left group: Snooze & Mute */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSnooze}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                  title="Snooze Alert for 60 seconds"
                >
                  <BellOff size={13} />
                  <span>Snooze (1m)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundMuted(!soundMuted)}
                  className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    soundMuted 
                      ? 'bg-slate-900/80 border-slate-700 text-slate-400' 
                      : 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                  }`}
                  title={soundMuted ? "Unmute Audio Advisory" : "Mute Audio Advisory"}
                >
                  {soundMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>

                {onUpdateThresholds && (
                  <button
                    type="button"
                    onClick={() => setShowThresholdAdjuster(!showThresholdAdjuster)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
                    title="Calibrate Range Limits"
                  >
                    <Sliders size={13} />
                  </button>
                )}
              </div>

              {/* Right group: Clinical Inspection / Emergency dispatch */}
              <div className="flex items-center gap-1.5">
                {onInspectECG && (
                  <button
                    type="button"
                    onClick={() => {
                      onInspectECG();
                      setIsDismissed(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1"
                  >
                    <Activity size={13} />
                    <span>Inspect ECG &rarr;</span>
                  </button>
                )}

                {alertStatus.severity === 'critical' && onEmergencyDispatch && (
                  <button
                    type="button"
                    onClick={() => {
                      onEmergencyDispatch();
                      setIsDismissed(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1"
                  >
                    <ShieldAlert size={13} />
                    <span>SOS Dispatch</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Normal Recovery Feedback Toast (Appears for 3.5s when HR returns to safe boundary) */}
      <AnimatePresence>
        {normalRecoveryToast && hr !== null && (
          <motion.div
            key="hr-recovery-toast"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="pointer-events-auto rounded-2xl p-3.5 bg-[#03150d]/95 border border-emerald-500/50 shadow-2xl shadow-emerald-950/60 backdrop-blur-xl text-white flex items-center justify-between gap-3 select-none text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  Heart Rate Returned to Normal Range
                </p>
                <p className="text-[10px] text-emerald-300/80 font-mono">
                  Current Pulse: {hr} BPM • Within safe resting bounds ({thresholds.warningMin}–{thresholds.warningMax} BPM)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNormalRecoveryToast(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
