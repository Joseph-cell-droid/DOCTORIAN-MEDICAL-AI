import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Activity, Heart, Volume2, VolumeX, Pause, Play, RotateCcw, 
  Sliders, Maximize2, Minimize2, Shield, AlertTriangle, 
  CheckCircle2, Info, Sparkles, Download, Layers, Eye
} from 'lucide-react';
import { SafeResponsiveContainer } from './SafeResponsiveContainer';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ReferenceLine, ReferenceArea 
} from 'recharts';

export type ECGLead = 'Lead II' | 'Lead I' | 'Lead III' | 'V1' | 'V5';
export type ECGRhythmType = 'normal' | 'tachycardia' | 'bradycardia' | 'pvc' | 'afib';
export type ECGGridTheme = 'cyber' | 'paper' | 'dark';

interface LiveECGVisualizerProps {
  vitals?: {
    heartRate: number;
    spo2?: number;
    temperature?: number;
    respiratoryRate?: number;
    systolicBP?: number;
    diastolicBP?: number;
  } | null;
  className?: string;
  compact?: boolean;
  onOpenDetailedTelemetry?: () => void;
}

export const LiveECGVisualizer: React.FC<LiveECGVisualizerProps> = ({
  vitals,
  className = '',
  compact = false,
  onOpenDetailedTelemetry,
}) => {
  // 1. Core State
  const baseHR = vitals?.heartRate && vitals.heartRate > 30 && vitals.heartRate < 220 ? vitals.heartRate : 74;
  const [simulatedHR, setSimulatedHR] = useState<number>(baseHR);
  const [selectedLead, setSelectedLead] = useState<ECGLead>('Lead II');
  const [rhythmType, setRhythmType] = useState<ECGRhythmType>('normal');
  const [sweepSpeed, setSweepSpeed] = useState<number>(25); // 12.5, 25, 50 mm/s
  const [gain, setGain] = useState<number>(1.0); // 0.5x, 1x, 2x
  const [gridTheme, setGridTheme] = useState<ECGGridTheme>('cyber');
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [showAnalysisTab, setShowAnalysisTab] = useState<boolean>(false);
  const [lastRPeakTime, setLastRPeakTime] = useState<number>(0);
  const [isHeartFlashing, setIsHeartFlashing] = useState<boolean>(false);

  // Sync simulated HR with live vitals if not manually overridden
  useEffect(() => {
    if (vitals?.heartRate) {
      setSimulatedHR(vitals.heartRate);
    }
  }, [vitals?.heartRate]);

  // Audio Context for authentic QRS heart beep tone
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playQRSBeep = useCallback(() => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (!audioCtxRef.current) return;

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Clinical pleth/ECG pitch modulated slightly by SpO2 or HR
      const frequency = vitals?.spo2 ? 550 + (vitals.spo2 - 90) * 15 : 750;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Short 60ms click/beep with rapid decay
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.065);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // Audio autoplay restriction handling
    }
  }, [audioEnabled, vitals?.spo2]);

  // Canvas and animation references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Buffer state
  const bufferSize = 800; // Number of sample points across screen
  const samplesRef = useRef<number[]>(new Array(bufferSize).fill(0));
  const sweepIndexRef = useRef<number>(0);
  const phaseRef = useRef<number>(0); // 0 to 1 representing position in cardiac cycle
  const prevWasPeakRef = useRef<boolean>(false);

  // Calculate live intervals based on current HR
  const currentBPM = rhythmType === 'tachycardia' ? Math.max(118, simulatedHR + 30) : 
                     rhythmType === 'bradycardia' ? Math.min(48, simulatedHR - 25) : 
                     simulatedHR;

  const cycleDurationSec = 60 / currentBPM; // e.g. 0.81s for 74 BPM

  // Clinical parameters estimation
  const prIntervalMs = Math.round(155 * Math.sqrt(cycleDurationSec));
  const qrsDurationMs = rhythmType === 'pvc' ? 142 : 84;
  const qtIntervalMs = Math.round(390 * Math.sqrt(cycleDurationSec));
  const qtcIntervalMs = Math.round(qtIntervalMs / Math.sqrt(cycleDurationSec));

  // Lead voltage multiplier
  const leadMultiplier = useMemo(() => {
    switch (selectedLead) {
      case 'Lead I': return 0.8;
      case 'Lead II': return 1.15; // standard rhythm strip
      case 'Lead III': return 0.75;
      case 'V1': return -0.65; // inverted/deep S in V1
      case 'V5': return 1.45; // tall lateral R wave
      default: return 1.0;
    }
  }, [selectedLead]);

  // Compute physiological ECG waveform voltage at a given cycle phase (0.0 to 1.0)
  const computeECGVoltage = useCallback((phase: number, rType: ECGRhythmType, leadMul: number): number => {
    let voltage = 0;

    // Normal cardiac cycle component phases (normalized to 0..1):
    // P wave: 0.10 - 0.22
    // PR segment: 0.22 - 0.32
    // Q dip: 0.32 - 0.35
    // R spike: 0.35 - 0.40
    // S dip: 0.40 - 0.45
    // ST segment: 0.45 - 0.55
    // T wave: 0.55 - 0.75
    // Diastolic baseline: 0.75 - 1.00

    if (rType === 'afib') {
      // Fibrillatory baseline (no distinct P wave, fine irregular oscillations)
      voltage += 0.05 * Math.sin(phase * 40 * Math.PI) + 0.03 * Math.cos(phase * 23 * Math.PI);
    } else {
      // P wave: smooth low hill
      if (phase >= 0.12 && phase <= 0.24) {
        const pPhase = (phase - 0.18) / 0.06;
        voltage += 0.14 * Math.exp(-pPhase * pPhase * 3.5);
      }
    }

    if (rType === 'pvc' && Math.random() < 0.25) {
      // Occasional Wide bizarre PVC complex
      if (phase >= 0.30 && phase <= 0.52) {
        const pvcPhase = (phase - 0.41) / 0.08;
        voltage += -1.4 * Math.exp(-pvcPhase * pvcPhase * 2.8) + 0.3 * Math.sin(pvcPhase * 3);
      }
    } else {
      // Normal Q-R-S
      // Q wave (small downward deflection)
      if (phase >= 0.33 && phase <= 0.36) {
        const qPhase = (phase - 0.345) / 0.015;
        voltage -= 0.15 * Math.exp(-qPhase * qPhase * 4);
      }

      // R wave (sharp, tall positive deflection)
      if (phase >= 0.36 && phase <= 0.41) {
        const rPhase = (phase - 0.385) / 0.02;
        voltage += 1.25 * Math.exp(-rPhase * rPhase * 6.5);
      }

      // S wave (negative deflection rebound)
      if (phase >= 0.41 && phase <= 0.46) {
        const sPhase = (phase - 0.435) / 0.02;
        voltage -= 0.38 * Math.exp(-sPhase * sPhase * 4.5);
      }
    }

    // T wave: smooth rounded ventricular repolarization peak
    if (phase >= 0.56 && phase <= 0.74) {
      const tPhase = (phase - 0.65) / 0.09;
      voltage += 0.32 * Math.exp(-tPhase * tPhase * 3.2);
    }

    // Micro physiological noise (subtle biological realism, 0.01 mV)
    voltage += (Math.sin(phase * 70) * 0.015) + (Math.random() - 0.5) * 0.012;

    return voltage * leadMul;
  }, []);

  // Main high-framerate D3 / Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimestamp) / 1000); // delta seconds
      lastTimestamp = now;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      if (!isFrozen) {
        // Advance cycle phase by dt / cycleDuration
        // Speed scale: 25 mm/s is standard (factor 1.0)
        const speedFactor = sweepSpeed / 25;
        const phaseIncrement = (dt / cycleDurationSec) * speedFactor;
        
        phaseRef.current = (phaseRef.current + phaseIncrement) % 1.0;

        // Detect R-wave peak for audio beep and visual pulse
        const isNearPeak = phaseRef.current >= 0.37 && phaseRef.current <= 0.41;
        if (isNearPeak && !prevWasPeakRef.current) {
          playQRSBeep();
          setIsHeartFlashing(true);
          setLastRPeakTime(Date.now());
          setTimeout(() => setIsHeartFlashing(false), 150);
          prevWasPeakRef.current = true;
        } else if (!isNearPeak) {
          prevWasPeakRef.current = false;
        }

        // Calculate voltage with gain
        const rawVoltage = computeECGVoltage(phaseRef.current, rhythmType, leadMultiplier);
        const amplifiedVoltage = rawVoltage * gain;

        // Advance sweep buffer
        const sweepAdvance = Math.max(1, Math.round(dt * (sweepSpeed * 8)));
        for (let i = 0; i < sweepAdvance; i++) {
          sweepIndexRef.current = (sweepIndexRef.current + 1) % bufferSize;
          samplesRef.current[sweepIndexRef.current] = amplifiedVoltage;
        }
      }

      // --- D3 Scales Configuration ---
      // Map sample index to X [0, width]
      const xScale = d3.scaleLinear()
        .domain([0, bufferSize - 1])
        .range([0, width]);

      // Map millivolts to Y [height, 0] (centered around 0 mV at height/2)
      // Standard: 1 mV = 10mm. Total vertical domain around ±1.8 mV
      const yDomain = 1.8;
      const yScale = d3.scaleLinear()
        .domain([-yDomain, yDomain])
        .range([height - 8, 8]);

      // --- Draw Grid ---
      ctx.clearRect(0, 0, width, height);

      // Grid background fill
      if (gridTheme === 'paper') {
        ctx.fillStyle = '#fff9f5';
        ctx.fillRect(0, 0, width, height);

        // 1mm minor pink grid
        ctx.strokeStyle = '#fed7aa';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const stepXMinor = width / 80;
        const stepYMinor = height / 40;
        for (let x = 0; x <= width; x += stepXMinor) {
          ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += stepYMinor) {
          ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();

        // 5mm major coral grid
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        for (let x = 0; x <= width; x += stepXMinor * 5) {
          ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += stepYMinor * 5) {
          ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else if (gridTheme === 'cyber') {
        // Clinical Dark Cyber Phosphor
        ctx.fillStyle = '#030a18';
        ctx.fillRect(0, 0, width, height);

        // Subtle 1mm minor cyan lines
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const stepX = width / 80;
        const stepY = height / 40;
        for (let x = 0; x <= width; x += stepX) {
          ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += stepY) {
          ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();

        // 5mm major lines with higher contrast
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let x = 0; x <= width; x += stepX * 5) {
          ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += stepY * 5) {
          ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else {
        // Minimal Dark
        ctx.fillStyle = '#060d1f';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const step = 40;
        for (let x = 0; x <= width; x += step) {
          ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += step) {
          ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      // --- Draw 1 mV Calibration Pulse on Far Left ---
      // Standard 10mm/mV calibration pulse (0 mV -> 1.0 mV -> 0 mV)
      const calibWidth = 14;
      const calibX = 12;
      const yZero = yScale(0);
      const yOneMv = yScale(1.0 * gain);

      ctx.save();
      ctx.strokeStyle = gridTheme === 'paper' ? '#ea580c' : '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(calibX, yZero);
      ctx.lineTo(calibX + 3, yZero);
      ctx.lineTo(calibX + 3, yOneMv);
      ctx.lineTo(calibX + calibWidth - 3, yOneMv);
      ctx.lineTo(calibX + calibWidth - 3, yZero);
      ctx.lineTo(calibX + calibWidth, yZero);
      ctx.stroke();

      // Calibration label
      ctx.fillStyle = gridTheme === 'paper' ? '#9a3412' : '#22d3ee';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('1mV', calibX, yOneMv - 4);
      ctx.restore();

      // --- Draw Real-Time Oscilloscope Waveform with D3 Interpolation ---
      const currentIndex = sweepIndexRef.current;
      const eraseWidth = 24; // Width of dark beam gap ahead of current sweep

      ctx.save();
      // Waveform styling
      if (gridTheme === 'paper') {
        ctx.strokeStyle = '#c2410c'; // Deep clinical red
        ctx.lineWidth = 2.0;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = '#00f0ff'; // Bright glowing cyan
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Draw segment from after erase gap to buffer end (old trail)
      ctx.beginPath();
      let started = false;
      const startOld = (currentIndex + eraseWidth) % bufferSize;
      
      for (let i = startOld; i < bufferSize; i++) {
        const x = xScale(i);
        const y = yScale(samplesRef.current[i] || 0);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 2. Draw segment from index 0 to current sweep head (fresh live signal)
      ctx.beginPath();
      started = false;
      for (let i = 0; i <= currentIndex; i++) {
        const x = xScale(i);
        const y = yScale(samplesRef.current[i] || 0);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw the glowing beam head dot (Oscilloscope sweep point)
      if (!isFrozen) {
        const headX = xScale(currentIndex);
        const headY = yScale(samplesRef.current[currentIndex] || 0);

        ctx.beginPath();
        ctx.arc(headX, headY, 4, 0, Math.PI * 2);
        ctx.fillStyle = gridTheme === 'paper' ? '#ea580c' : '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.fill();

        // Draw vertical faint sweep indicator line
        ctx.beginPath();
        ctx.moveTo(headX, 0);
        ctx.lineTo(headX, height);
        ctx.strokeStyle = gridTheme === 'paper' ? 'rgba(234, 88, 12, 0.25)' : 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore(); // restore waveform style
      ctx.restore(); // restore DPR scale

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    isFrozen, sweepSpeed, gain, gridTheme, rhythmType, 
    leadMultiplier, cycleDurationSec, computeECGVoltage, playQRSBeep
  ]);

  // Handle Resize for Retina Display Clarity
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvasRef.current.width = Math.max(1, Math.floor(rect.width * dpr));
      canvasRef.current.height = Math.max(1, Math.floor(rect.height * dpr));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pre-generate frozen multi-beat rhythm strip for Recharts analysis modal/tab
  const analysisChartData = useMemo(() => {
    const points = [];
    const totalPoints = 180;
    for (let i = 0; i < totalPoints; i++) {
      const timeMs = Math.round((i / totalPoints) * 3200); // 3.2 seconds
      const phase = (timeMs / 1000 / cycleDurationSec) % 1.0;
      const mv = computeECGVoltage(phase, rhythmType, leadMultiplier);
      
      // Tag peaks for annotations
      let annotation: string | undefined = undefined;
      if (Math.abs(phase - 0.18) < 0.02) annotation = 'P';
      else if (Math.abs(phase - 0.345) < 0.01) annotation = 'Q';
      else if (Math.abs(phase - 0.385) < 0.01) annotation = 'R';
      else if (Math.abs(phase - 0.435) < 0.01) annotation = 'S';
      else if (Math.abs(phase - 0.65) < 0.02) annotation = 'T';

      points.push({
        time: timeMs,
        timeSec: (timeMs / 1000).toFixed(2),
        voltage: Number(mv.toFixed(3)),
        annotation
      });
    }
    return points;
  }, [cycleDurationSec, rhythmType, leadMultiplier, computeECGVoltage]);

  // Rhythm classification text
  const rhythmInterpretation = useMemo(() => {
    if (rhythmType === 'afib') return { label: 'Atrial Fibrillation (AFib)', badge: 'Irregular Arrhythmia', color: 'rose' };
    if (rhythmType === 'pvc') return { label: 'Sinus Rhythm with Ectopic PVCs', badge: 'Ventricular Ectopy', color: 'amber' };
    if (currentBPM > 100) return { label: 'Sinus Tachycardia', badge: 'Elevated HR', color: 'amber' };
    if (currentBPM < 60) return { label: 'Sinus Bradycardia', badge: 'Low HR', color: 'blue' };
    return { label: 'Normal Sinus Rhythm (NSR)', badge: 'Cardio-Optimal', color: 'emerald' };
  }, [rhythmType, currentBPM]);

  return (
    <div className={`w-full rounded-3xl bg-[#040d21] border border-cyan-500/35 shadow-[0_12px_45px_rgba(3,105,161,0.25)] overflow-hidden flex flex-col ${className}`}>
      {/* ─── Top Telemetry Status Header ─── */}
      <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#061433] via-[#091b42] to-[#05112c] border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-3 text-left">
        {/* Left: Lead Badge & Live Rhythm Classification */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-sm">
            <Activity size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                {selectedLead} Telemetry Strip
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                rhythmInterpretation.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                rhythmInterpretation.color === 'rose' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                rhythmInterpretation.color === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}>
                {rhythmInterpretation.badge}
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80 font-mono tracking-wide mt-0.5">
              {rhythmInterpretation.label} • 25 mm/s • 10 mm/mV
            </p>
          </div>
        </div>

        {/* Center / Right: Live Heart Rate Vital Sign Big Digit */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5 bg-slate-950/60 px-3.5 py-1.5 rounded-2xl border border-cyan-500/30">
            <Heart 
              size={18} 
              className={`transition-transform duration-150 ${
                isHeartFlashing ? 'text-rose-500 scale-125' : 'text-rose-400 scale-100'
              }`}
              fill={isHeartFlashing ? '#f43f5e' : 'transparent'}
            />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {currentBPM}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                BPM
              </span>
            </div>
          </div>

          {/* Audio Beep & Freeze Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                audioEnabled 
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={audioEnabled ? "Mute QRS Heart Beat Audio Tone" : "Enable Clinical QRS Heart Tone"}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              type="button"
              onClick={() => setIsFrozen(!isFrozen)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isFrozen 
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isFrozen ? "Resume Live Streaming" : "Freeze Trace for Clinical Inspection"}
            >
              {isFrozen ? <Play size={16} /> : <Pause size={16} />}
            </button>

            <button
              type="button"
              onClick={() => setShowAnalysisTab(!showAnalysisTab)}
              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                showAnalysisTab 
                  ? 'bg-purple-600 border-purple-400 text-white shadow-md' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Toggle D3/Recharts P-Q-R-S-T Interval Analysis"
            >
              <Layers size={13} />
              <span className="hidden sm:inline">Intervals</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main ECG Oscilloscope Canvas Screen ─── */}
      <div 
        ref={containerRef} 
        className="w-full relative h-[180px] sm:h-[220px] md:h-[260px] overflow-hidden select-none bg-[#030a18]"
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block cursor-crosshair"
        />

        {/* Frozen Badge Overlay */}
        {isFrozen && (
          <div className="absolute top-3 left-4 px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-1.5 pointer-events-none">
            <Pause size={12} />
            <span>Trace Frozen (Hold Mode)</span>
          </div>
        )}

        {/* Live Calibration Mark Badge */}
        <div className="absolute bottom-2.5 left-4 flex items-center gap-2 pointer-events-none text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
          <span>Speed: {sweepSpeed} mm/s</span>
          <span>•</span>
          <span>Gain: {gain}x</span>
          <span>•</span>
          <span>Lead: {selectedLead}</span>
        </div>
      </div>

      {/* ─── Expandable D3 / Recharts Detailed Interval Analysis Strip ─── */}
      {showAnalysisTab && (
        <div className="p-4 sm:p-5 bg-[#030816] border-t border-cyan-900/40 text-left space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Recharts Diagnostic Rhythm Strip &amp; P-Q-R-S-T Calipers
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Lead II Synchronized High-Resolution Sample Window (3.2s)
            </span>
          </div>

          {/* Multi-beat Interactive Recharts Area */}
          <div className="h-[140px] sm:h-[160px] w-full relative bg-[#02050f] rounded-2xl p-2 border border-slate-800/80">
            <SafeResponsiveContainer width="100%" height="100%">
              <LineChart data={analysisChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0a193d" />
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  fontSize={9} 
                  tickFormatter={(val) => `${val}ms`}
                />
                <YAxis 
                  domain={[-1.5, 2.0]} 
                  stroke="#475569" 
                  fontSize={9} 
                  tickFormatter={(val) => `${val}mV`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-[10px] font-mono shadow-xl text-white">
                          <p className="font-bold text-cyan-300">Time: {data.time} ms</p>
                          <p>Voltage: {data.voltage} mV</p>
                          {data.annotation && (
                            <p className="text-purple-300 font-bold mt-0.5">Component: {data.annotation} Wave</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
                <ReferenceLine y={1.0} stroke="rgba(6, 182, 212, 0.4)" strokeDasharray="2 2" />
                <Line 
                  type="monotone" 
                  dataKey="voltage" 
                  stroke="#00f0ff" 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </SafeResponsiveContainer>
          </div>

          {/* Clinical Measurement Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400">PR Interval</span>
              <p className="text-sm sm:text-base font-black font-mono text-cyan-300 mt-0.5">{prIntervalMs} ms</p>
              <span className="text-[8px] text-emerald-400 font-bold">Normal (120-200ms)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400">QRS Duration</span>
              <p className="text-sm sm:text-base font-black font-mono text-cyan-300 mt-0.5">{qrsDurationMs} ms</p>
              <span className="text-[8px] text-emerald-400 font-bold">Normal (&lt;120ms)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400">QT / QTc Interval</span>
              <p className="text-sm sm:text-base font-black font-mono text-cyan-300 mt-0.5">{qtIntervalMs} / {qtcIntervalMs} ms</p>
              <span className="text-[8px] text-emerald-400 font-bold">Normal (&lt;440ms)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400">ST Elevation</span>
              <p className="text-sm sm:text-base font-black font-mono text-emerald-300 mt-0.5">+0.01 mV</p>
              <span className="text-[8px] text-emerald-400 font-bold">Isoelectric (Safe)</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bottom Interactive Calibration & Lead Strip Controls ─── */}
      <div className="p-3 sm:p-4 bg-[#05112a] border-t border-cyan-900/30 flex flex-wrap items-center justify-between gap-3 text-left">
        {/* Left: Lead Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mr-1 hidden xs:inline">
            Lead:
          </span>
          {(['Lead II', 'Lead I', 'Lead III', 'V1', 'V5'] as ECGLead[]).map((lead) => (
            <button
              key={lead}
              type="button"
              onClick={() => setSelectedLead(lead)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedLead === lead 
                  ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lead}
            </button>
          ))}
        </div>

        {/* Middle: Clinical Simulation Mode (Normal, Tachy, Brady, PVC, AFib) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mr-1 hidden sm:inline">
            Rhythm:
          </span>
          {(['normal', 'tachycardia', 'bradycardia', 'pvc', 'afib'] as ECGRhythmType[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setRhythmType(mode)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold capitalize transition-all cursor-pointer ${
                rhythmType === mode 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Right: Sweep Speed, Gain, and Grid Theme */}
        <div className="flex items-center gap-2">
          {/* Sweep Speed Selector */}
          <select
            value={sweepSpeed}
            onChange={(e) => setSweepSpeed(Number(e.target.value))}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 cursor-pointer focus:outline-none"
            title="Sweep Speed (mm/s)"
          >
            <option value={12.5}>12.5 mm/s</option>
            <option value={25}>25 mm/s</option>
            <option value={50}>50 mm/s</option>
          </select>

          {/* Voltage Gain Selector */}
          <select
            value={gain}
            onChange={(e) => setGain(Number(e.target.value))}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 cursor-pointer focus:outline-none"
            title="Voltage Gain (mm/mV)"
          >
            <option value={0.5}>0.5x Gain</option>
            <option value={1.0}>1.0x Gain</option>
            <option value={2.0}>2.0x Gain</option>
          </select>

          {/* Grid Paper Style */}
          <button
            type="button"
            onClick={() => setGridTheme(gridTheme === 'cyber' ? 'paper' : gridTheme === 'paper' ? 'dark' : 'cyber')}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] font-mono uppercase font-bold cursor-pointer transition-colors"
            title="Cycle Grid Theme (Cyber / Paper / Dark)"
          >
            {gridTheme}
          </button>
        </div>
      </div>
    </div>
  );
};
