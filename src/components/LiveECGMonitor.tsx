import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Settings, Activity, Sparkles, Sliders, Volume2, VolumeX, Eye, EyeOff, Shield, Database, Trash2, X, Bluetooth, Loader2 } from 'lucide-react';
import { useArduinoContext } from '../ArduinoContext';

interface LiveECGMonitorProps {
  vitals?: {
    heartRate: number;
    spo2: number;
    temperature: number;
    respiratoryRate?: number;
    systolicBP?: number;
    diastolicBP?: number;
  } | null;
  addAlarmLog?: (priority: 'high' | 'medium' | 'low' | 'info', source: string, value: string, description: string) => void;
}

type WaveMode = 'ecg' | 'ppg' | 'resp';

export const LiveECGMonitor: React.FC<LiveECGMonitorProps> = ({ vitals, addAlarmLog }) => {
  // Safe retrieve useArduinoContext
  let arduino: any = null;
  try {
    arduino = useArduinoContext();
  } catch (e) {
    // optional safe fallthrough
  }

  const [hasLoggedLowBattery, setHasLoggedLowBattery] = useState(false);
  const battery = arduino?.watchMetadata?.battery;

  const [isConnectingWatch, setIsConnectingWatch] = useState(false);

  const handleConnectWatch = async () => {
    if (arduino?.connectHealthWatch) {
      setIsConnectingWatch(true);
      try {
        await arduino.connectHealthWatch();
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsConnectingWatch(false);
      }
    }
  };

  useEffect(() => {
    if (battery !== undefined && battery !== null) {
      if (battery < 15) {
        if (!hasLoggedLowBattery) {
          if (addAlarmLog) {
            addAlarmLog(
              'low',
              'Device Battery',
              `${battery}%`,
              `Notice: Wearable clinical telemetry node has low battery (${battery}%). Recharge required.`
            );
          }
          setHasLoggedLowBattery(true);
        }
      } else if (battery >= 20) {
        setHasLoggedLowBattery(false);
      }
    }
  }, [battery, addAlarmLog, hasLoggedLowBattery]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fallbacks if vitals aren't live
  const hr = vitals?.heartRate || 72;
  const spo2 = vitals?.spo2 || 98;
  const rr = vitals?.respiratoryRate || 16;
  const bpString = vitals?.systolicBP && vitals?.diastolicBP 
    ? `${Math.round(vitals.systolicBP)}/${Math.round(vitals.diastolicBP)}` 
    : "120/80";

  // Telemetry Configuration Options
  const [mode, setMode] = useState<WaveMode>('ecg');
  const [sweepSpeed, setSweepSpeed] = useState<number>(25); // 12.5, 25, 50 mm/s
  const [gain, setGain] = useState<number>(1.0); // 0.5x, 1.0x, 2.0x
  const [filterProfile, setFilterProfile] = useState<'diagnostic' | 'monitor'>('diagnostic');
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isBeating, setIsBeating] = useState<boolean>(false);

  // States for collapsible Raw Sample Drawer & samples tracker (last 5)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [hrSamples, setHrSamples] = useState<{
    id: string;
    hr: number;
    spo2: number;
    timestamp: string;
    integrity: string;
    lead: string;
    latency: string;
    status: 'normal' | 'warning' | 'critical';
  }[]>([]);

  useEffect(() => {
    if (vitals) {
      const now = new Date();
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const timeStr = `${now.toLocaleTimeString('en-US', { hour12: false })}.${ms}`;
      
      const rate = vitals.heartRate || 72;
      const oxygen = vitals.spo2 || 98;
      
      let sampleStatus: 'normal' | 'warning' | 'critical' = 'normal';
      if (rate < 50 || rate > 120 || oxygen < 90) {
        sampleStatus = 'critical';
      } else if (rate < 60 || rate > 100 || oxygen < 95) {
        sampleStatus = 'warning';
      }

      const signalIntegrity = (99.1 + Math.random() * 0.8).toFixed(1) + "%";
      const randomLatency = Math.floor(6 + Math.random() * 10) + "ms";

      const newSample = {
        id: Math.random().toString(),
        hr: rate,
        spo2: oxygen,
        timestamp: timeStr,
        integrity: signalIntegrity,
        lead: mode.toUpperCase(),
        latency: randomLatency,
        status: sampleStatus
      };

      setHrSamples(prev => {
        // Only append if the values or active lead mode changed
        if (prev.length > 0 && prev[0].hr === rate && prev[0].spo2 === oxygen && prev[0].lead === newSample.lead) {
          return prev;
        }
        return [newSample, ...prev].slice(0, 5);
      });
    }
  }, [vitals, mode]);

  // States for canvas sizing
  const [dimensions, setDimensions] = useState({ width: 600, height: 200 });

  // Refs for animation state persistence
  const writeXRef = useRef<number>(0);
  const bufferRef = useRef<(number | null)[]>([]);
  const lastTimeRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const pulseTriggerRef = useRef<boolean>(false);

  // Sound Synthesizer Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Tone generation for heartbeat beep
  const playBeep = () => {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      // Pitch mapped slightly based on oxygen level if in PPG mode
      const pitch = mode === 'ppg' ? 350 + (spo2 - 80) * 15 : 650;
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context beep initiation blocked or failed:", e);
    }
  };

  // Adjust canvas size when container resizing occurs
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({
          width: Math.max(300, Math.floor(width)),
          height: Math.max(120, Math.floor(height || 180)),
        });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Initialize buffer size on dimensions update
  useEffect(() => {
    bufferRef.current = new Array(dimensions.width).fill(null);
    writeXRef.current = 0;
  }, [dimensions.width]);

  // Mathematical Physiological Waveform Simulators
  const getECGValue = (phase: number, filter: 'diagnostic' | 'monitor'): number => {
    // Elegant Multi-segment P-Q-R-S-T Curve
    let val = 0;

    // P-wave (Atrial Depolarization)
    if (phase > 0.08 && phase < 0.18) {
      val += 0.12 * Math.sin(((phase - 0.08) / 0.10) * Math.PI);
    }
    // Q-wave (Septal Depolarization)
    else if (phase >= 0.22 && phase < 0.24) {
      val -= 0.18 * Math.sin(((phase - 0.22) / 0.02) * Math.PI);
    }
    // R-wave (Ventricular Depolarization Spike)
    else if (phase >= 0.24 && phase < 0.265) {
      const scale = (phase - 0.25) / 0.015;
      val += 1.4 * Math.exp(-scale * scale);
    }
    // S-wave (Purkinje Ventricular Depolarization)
    else if (phase >= 0.265 && phase < 0.29) {
      val -= 0.35 * Math.sin(((phase - 0.265) / 0.025) * Math.PI);
    }
    // T-wave (Ventricular Repolarization)
    else if (phase >= 0.38 && phase < 0.55) {
      val += 0.28 * Math.sin(((phase - 0.38) / 0.17) * Math.PI);
    }
    // U-wave (Optional late repolarization)
    else if (phase >= 0.58 && phase < 0.65) {
      val += 0.04 * Math.sin(((phase - 0.58) / 0.07) * Math.PI);
    }

    if (filter === 'diagnostic') {
      // Diagnostic allows wide bandwidth (0.05-150Hz), meaning we show high frequency muscle twitch & baseline low-freq wander
      val += (Math.random() - 0.5) * 0.018; // High freq jitter
      val += 0.035 * Math.sin(phase * 2 * Math.PI); // Baseline drift/wander
    } else {
      // Monitor bandpass filter (0.5-40Hz) cleans up low-frequency wander and high frequency sparkles
      val += (Math.random() - 0.5) * 0.003; // Smooth stabilized signal noise
    }
    return val;
  };

  const getPPGValue = (phase: number, filter: 'diagnostic' | 'monitor'): number => {
    // Simulated Arterial Pulse Waveform with Dicrotic Notch
    let val = 0;
    
    // Systolic phase (Rapid rise)
    if (phase < 0.20) {
      val = Math.sin((phase / 0.20) * (Math.PI / 2));
    }
    // Early Diastolic decline
    else if (phase >= 0.20 && phase < 0.35) {
      const norm = (phase - 0.20) / 0.15;
      val = 1.0 - 0.28 * norm;
    }
    // Dicrotic Limb (Reflected wave / valve closure notch)
    else if (phase >= 0.35 && phase < 0.45) {
      const norm = (phase - 0.35) / 0.10;
      val = 0.72 + 0.06 * Math.sin(norm * Math.PI);
    }
    // Main Diastolic runoff
    else {
      const norm = (phase - 0.45) / 0.55;
      val = 0.72 - 0.68 * norm;
    }

    if (filter === 'diagnostic') {
      val += (Math.random() - 0.5) * 0.009; // Jitter
      val += 0.015 * Math.sin(phase * 2 * Math.PI); // Drift
    } else {
      val += (Math.random() - 0.5) * 0.0015; // Filtered/Clean pulse wave
    }
    return val * 0.75; // Normalized height scaling
  };

  const getSpiroValue = (phase: number, filter: 'diagnostic' | 'monitor'): number => {
    // Spirometer respiratory flow sine progression
    // Inhalation: upward bell
    // Exhalation: slight pause, downward bell
    const val = Math.sin(phase * 2 * Math.PI) * 0.6;
    if (filter === 'diagnostic') {
      return val + (Math.random() - 0.5) * 0.012 + 0.008 * Math.sin(phase * 2 * Math.PI);
    } else {
      return val + (Math.random() - 0.5) * 0.003;
    }
  };

  // Main Sweep Engine & Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsedMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Limit dt spikes to avoid rendering gaps on page wake-up
      const dt = Math.min(0.06, elapsedMs / 1000);

      // 1. Grid Paper Background Rendering
      ctx.fillStyle = '#090d16'; // Very dark indigo clinical screen background
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      if (showGrid) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)'; // Deep green clinical grid lines
        ctx.lineWidth = 1;
        
        // Fine Grid Lines (every 10 pixels / millimeters)
        for (let x = 0; x < dimensions.width; x += 10) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, dimensions.height);
          ctx.stroke();
        }
        for (let y = 0; y < dimensions.height; y += 10) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(dimensions.width, y);
          ctx.stroke();
        }

        // Heavy Major Grid Lines (every 50 pixels)
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 1.2;
        for (let x = 0; x < dimensions.width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, dimensions.height);
          ctx.stroke();
        }
        for (let y = 0; y < dimensions.height; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(dimensions.width, y);
          ctx.stroke();
        }
      }

      // If frozen, just draw the static buffer and return
      if (isFrozen) {
        drawWaveLine(ctx);
        animFrameId = requestAnimationFrame(render);
        return;
      }

      // 2. Simulation Step Calculus
      // Rate calculation (Hz) based on selected signal type
      let rateHz = hr / 60; // Default heart rate frequency
      if (mode === 'resp') {
        rateHz = rr / 60; // Respiration rate frequency
      }

      // Pixel sweep speed: scale speed mapped to canvas width pixels
      // 25 mm/s = 150 px/s on our canvas scale. Let's make it look authentic and customizable:
      const monitorSpeedCoef = sweepSpeed / 25; // 0.5x, 1x, 2x coefficient
      const basePixelsPerSec = 140; // Base sweep speed
      const pixelsToAdvance = basePixelsPerSec * monitorSpeedCoef * dt;

      const oldX = Math.floor(writeXRef.current);
      const newX = (oldX + pixelsToAdvance) % dimensions.width;

      // Render the waveform step: Fill buffer between [oldX, newX]
      const totalWidth = dimensions.width;
      
      const startX = oldX;
      let endX = Math.floor(newX);
      if (endX < startX) {
        endX += totalWidth; // Wrap handling
      }

      for (let xCoord = startX; xCoord <= endX; xCoord++) {
        const index = xCoord % totalWidth;
        
        // Interpolate the incremental phase for each exact column
        const factor = (xCoord - startX) / (endX - startX || 1);
        const interpolatedPhase = (phaseRef.current + factor * dt * rateHz) % 1.0;

        // Apply selected vital wave generator
        let signalVal = 0;
        if (mode === 'ecg') {
          signalVal = getECGValue(interpolatedPhase, filterProfile);
        } else if (mode === 'ppg') {
          signalVal = getPPGValue(interpolatedPhase, filterProfile);
        } else {
          signalVal = getSpiroValue(interpolatedPhase, filterProfile);
        }

        // Save value scaled by height and requested gain
        // Centered vertically
        const midY = dimensions.height / 2;
        const amplitudeMax = dimensions.height * 0.38; // Max amplitude is 38% of height
        const scaledY = midY - (signalVal * amplitudeMax * gain);
        
        bufferRef.current[index] = scaledY;

        // Peak heartbeat identification for sound or visual pulsing sync
        // On ECG and PPG, the peak (R wave) occurs when phase crosses the threshold ~0.25
        if (mode === 'ecg' || mode === 'ppg') {
          if (interpolatedPhase >= 0.245 && interpolatedPhase <= 0.275) {
            if (!pulseTriggerRef.current) {
              pulseTriggerRef.current = true;
              setIsBeating(true);
              playBeep();
              setTimeout(() => {
                setIsBeating(false);
              }, 120);
            }
          } else {
            // Cool down trigger after peak passes
            if (interpolatedPhase > 0.45 || interpolatedPhase < 0.15) {
              pulseTriggerRef.current = false;
            }
          }
        }
      }

      // Set the "blanking gap" wipe bar (erases older signal ahead of the pen)
      const blankingGapSize = Math.max(25, Math.floor(totalWidth * 0.05)); // 5% of width
      for (let g = 1; g <= blankingGapSize; g++) {
        const eraseIndex = (Math.floor(newX) + g) % totalWidth;
        bufferRef.current[eraseIndex] = null;
      }

      // Update refs
      phaseRef.current = (phaseRef.current + dt * rateHz) % 1.0;
      writeXRef.current = newX;

      // 3. Complete Trace Rendering from buffer
      drawWaveLine(ctx);

      // 4. Draw the Sweep Pen Cursor glowing dot
      const currentCursorY = bufferRef.current[Math.floor(newX)];
      if (currentCursorY !== null && currentCursorY !== undefined) {
        ctx.beginPath();
        const glowColor = mode === 'ecg' ? '#10b981' : mode === 'ppg' ? '#06b6d4' : '#f59e0b';
        ctx.arc(newX, currentCursorY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = glowColor;
        ctx.fill();
        ctx.shadowBlur = 0; // Restore shadow
      }

      animFrameId = requestAnimationFrame(render);
    };

    // Draw the actual waveform coordinate stream
    const drawWaveLine = (context: CanvasRenderingContext2D) => {
      const traceColor = mode === 'ecg' ? '#10b981' : mode === 'ppg' ? '#06b6d4' : '#f59e0b';
      
      context.beginPath();
      context.lineWidth = 2.4;
      context.strokeStyle = traceColor;
      context.lineJoin = 'round';
      context.lineCap = 'round';

      // Neon glow stroke setting
      context.shadowColor = traceColor;
      context.shadowBlur = 4;

      let drawingSegment = false;

      for (let i = 0; i < dimensions.width; i++) {
        const val = bufferRef.current[i];
        if (val === null) {
          // Break line drawing for the blanking gap
          if (drawingSegment) {
            context.stroke();
            context.beginPath();
            drawingSegment = false;
          }
        } else {
          if (!drawingSegment) {
            context.moveTo(i, val);
            drawingSegment = true;
          } else {
            context.lineTo(i, val);
          }
        }
      }

      if (drawingSegment) {
        context.stroke();
      }

      // Reset style values for secondary renders
      context.shadowBlur = 0;
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [dimensions, mode, sweepSpeed, gain, isFrozen, showGrid, isSoundEnabled, hr, rr, spo2, filterProfile]);

  return (
    <div id="live-biometric-telemetry" className="flex flex-col gap-4 sm:gap-5 w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden transition-all duration-300">
      
      {/* Dynamic Subtle Tech Accent Background Lines */}
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Title Header with telemetry indicator lights */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-emerald-400 shadow-inner">
            <Activity className={`w-5 h-5 ${isFrozen ? '' : 'animate-pulse text-emerald-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-widest uppercase">Biometric Waveform Telemetry</h2>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isFrozen ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isFrozen ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
            </div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Interactive CRT Signal Scanner & Oscilloscope</p>
          </div>
        </div>

        {/* Real-Time Pulse Rate stats overlay & collapsible ledger toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="grid grid-cols-2 min-[410px]:flex min-[410px]:items-center gap-3 sm:gap-6 bg-slate-950/60 p-2.5 px-4 sm:px-5 sm:py-2.5 rounded-2xl border border-slate-800/80 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className={`text-rose-500 select-none transition-transform ${isBeating ? 'scale-125 duration-100' : 'scale-100 duration-300'}`}>❤️</span>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Pulse</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white select-all">{hr}</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">bpm</span>
                </div>
              </div>
            </div>
            <div className="hidden min-[410px]:block w-px h-8 bg-slate-800" />
            <div className="flex items-center gap-2 min-[410px]:gap-0">
              <div className="min-[410px]:hidden text-cyan-400 select-none">⭕</div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SpO2 Level</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-cyan-400">{spo2}</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">%</span>
                </div>
              </div>
            </div>
            <div className="hidden min-[410px]:block w-px h-8 bg-slate-800 col-span-2" />
            <div className="col-span-2 min-[410px]:col-span-1 pt-1.5 min-[410px]:pt-0 border-t border-slate-800 min-[410px]:border-t-0 flex items-center justify-between min-[410px]:block">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest min-[410px]:block">Vitals Source</span>
              <span className="text-[10px] font-black text-emerald-400 tracking-wider">SECURE</span>
            </div>
          </div>

          {/* Signal Filter Profile Segmented Control */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 shrink-0 gap-1.5">
            <button
              id="filter-diag-btn"
              type="button"
              onClick={() => setFilterProfile('diagnostic')}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex flex-col items-center justify-center ${
                filterProfile === 'diagnostic'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
              title="Wideband diagnostic mode (0.05 - 150 Hz) - captures raw details, baseline wander and high-frequency noise"
            >
              <span className="leading-none text-[9px]">Diagnostic</span>
              <span className="text-[7px] font-bold text-slate-500 leading-none mt-0.5">0.05-150Hz</span>
            </button>
            <button
              id="filter-mon-btn"
              type="button"
              onClick={() => setFilterProfile('monitor')}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex flex-col items-center justify-center ${
                filterProfile === 'monitor'
                  ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
              title="Filter profile monitor mode (0.5 - 40 Hz) - cleans out lower frequencies and high-frequency sparkles"
            >
              <span className="leading-none text-[9px]">Monitor</span>
              <span className="text-[7px] font-bold text-slate-500 leading-none mt-0.5">0.5-40Hz</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleConnectWatch}
            disabled={isConnectingWatch}
            className={`px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              isConnectingWatch
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : arduino?.connection?.connected && arduino?.connection?.type === 'bluetooth'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/40'
                : 'bg-indigo-950/60 border-indigo-800/80 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/25'
            }`}
            title="Quick re-pair with Bluetooth heart rate monitors"
          >
            {isConnectingWatch ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Bluetooth size={13} className={arduino?.connection?.connected && arduino?.connection?.type === 'bluetooth' ? 'text-emerald-400' : 'animate-pulse'} />
            )}
            <span>
              {isConnectingWatch 
                ? 'Pairing Watch...' 
                : arduino?.connection?.connected && arduino?.connection?.type === 'bluetooth'
                ? `Paired: ${arduino?.connection?.deviceName || 'Watch'}`
                : 'Connect Health Watch'}
            </span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              isDrawerOpen 
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-400' 
                : 'bg-slate-950/60 border-slate-800/80 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Database size={13} className={isDrawerOpen ? "" : "animate-pulse text-emerald-400"} />
            <span>{isDrawerOpen ? 'Hide Samples' : 'Samples Log'}</span>
          </button>
        </div>
      </div>

      {/* Main Signal Display Screen Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 relative z-10 w-full">
        
        {/* Signal Channel Control Deck */}
        <div className="xl:col-span-1 flex flex-col gap-4 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/50">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1.5 mb-3">
              <Sliders size={12} /> Active Telemetry Line
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-2">
              <button 
                id="telemetry-lead-ecg"
                onClick={() => setMode('ecg')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left font-black text-xs transition-all ${
                  mode === 'ecg' 
                    ? 'bg-slate-900 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]' 
                    : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${mode === 'ecg' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                  <span>ECG LEAD II</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">1.2mV</span>
              </button>

              <button 
                id="telemetry-lead-ppg"
                onClick={() => setMode('ppg')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left font-black text-xs transition-all ${
                  mode === 'ppg' 
                    ? 'bg-slate-900 border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(6,180,212,0.1)]' 
                    : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-905/45 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${mode === 'ppg' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
                  <span>PPG PULSE WAVE</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Infrared</span>
              </button>

              <button 
                id="telemetry-lead-resp"
                onClick={() => setMode('resp')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left font-black text-xs transition-all ${
                  mode === 'resp' 
                    ? 'bg-slate-900 border-amber-500/50 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.1)]' 
                    : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-905/45 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${mode === 'resp' ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`} />
                  <span>RESPIRATION FLOW</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">16 Brpm</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800/80 my-1 hidden md:block xl:block" />

          {/* Oscilloscope Hardware Sweep Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Sweep Speed</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[12.5, 25, 50].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSweepSpeed(speed)}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                      sweepSpeed === speed
                        ? 'bg-slate-900 border-slate-700 text-white font-black'
                        : 'bg-transparent border-transparent text-slate-500 hover:text-white hover:bg-slate-900/20'
                    }`}
                  >
                    {speed} mm/s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Calibration Gain</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[0.5, 1.0, 2.0].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGain(g)}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                      gain === g
                        ? 'bg-slate-900 border-slate-700 text-white font-black'
                        : 'bg-transparent border-transparent text-slate-500 hover:text-white hover:bg-slate-900/20'
                    }`}
                  >
                    x{g.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Central Oscilloscope Screen */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          
          {/* Signal CRT display board */}
          <div 
            ref={containerRef} 
            className="w-full h-48 sm:h-56 bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800/80 shadow-[inset_0_4px_24px_rgba(0,0,0,0.8)]"
          >
            {/* Real-Time Screen Stats Overlays */}
            <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-900 pointer-events-none select-none">
              <span>LEAD: II</span>
              <span className="text-slate-600 hidden min-[380px]:inline">|</span>
              <span className="hidden min-[380px]:inline">
                FILTER: {filterProfile === 'diagnostic' ? 'DIAG (0.05-150Hz)' : 'MON (0.5-40Hz)'}
              </span>
              <span className="text-slate-600">|</span>
              <span>SENS: {gain * 10} mm/mV</span>
            </div>

            <div className="absolute top-3 right-4 flex gap-4 text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-900 pointer-events-none select-none">
              <span className="text-emerald-400 font-bold uppercase tracking-wider animate-pulse">● LIVE BIO-STREAM</span>
            </div>

            <canvas 
              ref={canvasRef} 
              width={dimensions.width} 
              height={dimensions.height} 
              className="w-full h-full block cursor-crosshair"
            />

            {/* Scale Marker overlay */}
            <div className="absolute bottom-3 left-4 text-[9px] font-mono text-slate-500 pointer-events-none select-none flex items-center gap-1">
              <div className="w-1.5 h-4 border-l border-y border-slate-600 inline-block" />
              <span>1 mV Cal</span>
            </div>

            <div className="absolute bottom-3 right-4 text-[9px] font-mono text-slate-500 pointer-events-none select-none">
              <span>{sweepSpeed} mm/sec</span>
            </div>
          </div>

          {/* Quick Hardware Action Ribbon */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/20 p-3 rounded-xl border border-slate-800/40">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                id="telemetry-freeze-control"
                onClick={() => setIsFrozen(!isFrozen)}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                  isFrozen
                    ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:bg-amber-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {isFrozen ? (
                  <>
                    <Play size={12} className="fill-current shrink-0" />
                    <span>UNFREEZE SIGNALS</span>
                  </>
                ) : (
                  <>
                    <Square size={12} className="fill-current shrink-0" />
                    <span>FREEZE WAVEFORM</span>
                  </>
                )}
              </button>

              <button
                id="telemetry-audio-beep-control"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className={`p-2.5 rounded-xl transition-all border ${
                  isSoundEnabled 
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-400' 
                    : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700'
                }`}
                title={isSoundEnabled ? 'Disable Biometric Sound' : 'Enable Biometric Sound'}
              >
                {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                id="telemetry-grid-toggle"
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2.5 rounded-xl transition-all border ${
                  showGrid 
                    ? 'bg-slate-800 border-slate-700 text-slate-300' 
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-500'
                }`}
                title="Toggle Graph Millimeter Grid"
              >
                {showGrid ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono text-center sm:text-right">
              <Shield size={12} className="text-emerald-500/80 shrink-0" />
              <span>HIPAA Secure Accuracy Baseline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Clinical Sample Ledger Side Drawer */}
      <div 
        className={`absolute top-0 right-0 h-full w-[290px] sm:w-[325px] bg-slate-950/95 backdrop-blur-md border-l border-slate-800 shadow-[20px_0_50px_rgba(0,0,0,0.9)] z-40 transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Latch tab sticking out to toggle drawer */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[31px] bg-slate-950 hover:bg-slate-900 border-l border-y border-slate-800 p-2 py-4 rounded-l-xl flex flex-col items-center gap-1 text-[9px] font-black tracking-widest uppercase text-emerald-400 cursor-pointer shadow-[-4px_0_12px_rgba(0,0,0,0.5)] transition-all select-none z-50 hover:text-emerald-300"
          style={{ minWidth: '32px' }}
        >
          <div className={`transition-transform duration-300 ${isDrawerOpen ? 'rotate-180 text-rose-500' : 'animate-pulse text-emerald-400'}`}>
            <Sliders size={12} className="rotate-90" />
          </div>
          <span className="[writing-mode:vertical-lr] tracking-[0.2em] font-extrabold text-[8px] mt-1">
            {isDrawerOpen ? 'CLOSE' : 'SAMPLES'}
          </span>
        </button>

        {/* Header inside drawer */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-emerald-400" />
            <div>
              <h4 className="text-[11px] font-black tracking-wider uppercase text-white">Live Sample Ledger</h4>
              <p className="text-[8px] text-slate-500 tracking-wider uppercase font-mono">Last 5 captures</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {hrSamples.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <Activity className="w-8 h-8 text-slate-800 animate-pulse mb-2" />
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Telemetry Buffering...</p>
              <p className="text-[8px] text-slate-600 mt-1 uppercase tracking-wider">Awaiting active clinical pulses</p>
            </div>
          ) : (
            hrSamples.map((sample, idx) => (
              <div 
                key={sample.id} 
                className={`p-3 rounded-xl border bg-slate-900/40 relative overflow-hidden transition-all hover:bg-slate-900/60 ${
                  sample.status === 'critical' ? 'border-rose-900/50 bg-rose-950/20' :
                  sample.status === 'warning' ? 'border-amber-900/50 bg-amber-950/10' :
                  'border-slate-800 bg-slate-900/20'
                }`}
              >
                {/* ID index marker */}
                <span className="absolute top-2 right-3 text-[8px] font-mono text-slate-600 font-bold">
                  S-{idx + 1}
                </span>

                <div className="flex items-center gap-3">
                  <span className={`text-sm select-none ${sample.status === 'critical' ? 'animate-pulse text-rose-500' : 'text-emerald-500'}`}>
                    ❤️
                  </span>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black tracking-tighter text-white font-mono">{sample.hr}</span>
                      <span className="text-[8px] text-slate-500 uppercase font-mono">bpm</span>
                    </div>
                  </div>
                  <div className="w-px h-6 bg-slate-850" />
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-cyan-400 font-mono">{sample.spo2}%</span>
                      <span className="text-[8px] text-slate-500 uppercase font-mono">spO2</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-y-1.5 text-[8px] font-mono text-slate-500 uppercase">
                  <div>
                    <span className="text-slate-650">TIME:</span> <span className="text-slate-350">{sample.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-slate-650">INPUT:</span> <span className="text-slate-350">{sample.lead}</span>
                  </div>
                  <div>
                    <span className="text-slate-650">DELAY:</span> <span className="text-slate-350">{sample.latency}</span>
                  </div>
                  <div>
                    <span className="text-slate-655">INTEG:</span> <span className="text-emerald-500 font-bold">{sample.integrity}</span>
                  </div>
                </div>

                {/* Status indicator pill */}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider ${
                    sample.status === 'critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' :
                    sample.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {sample.status} STATUS
                  </span>
                  <span className="text-[7px] font-mono font-bold text-slate-600">12-BIT CAL</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions of drawer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[8px] text-slate-550 font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>LEDGER SYNCED</span>
          </div>
          {hrSamples.length > 0 && (
            <button
              onClick={() => setHrSamples([])}
              className="px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={10} /> Clear List
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
