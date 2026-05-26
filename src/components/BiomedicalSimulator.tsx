import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Zap, RefreshCw, Activity, Heart, Thermometer, 
  Wind, Droplets, ToggleLeft, ToggleRight, Radio, BellRing,
  Award, Play, Square, Settings, RefreshCw as LoopIcon, Check, HelpCircle, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DoctorVerificationModal } from './DoctorVerificationModal';

export interface SimulatedVitals {
  heartRate: number;
  temperature: number;
  spo2: number;
  systolicBP: number;
  diastolicBP: number;
  respiratoryRate: number;
}

interface BiomedicalSimulatorProps {
  arduino: any;
  onVitalsChange?: (vitals: SimulatedVitals) => void;
  className?: string;
}

export const BiomedicalSimulator: React.FC<BiomedicalSimulatorProps> = ({ 
  arduino, 
  onVitalsChange,
  className = "" 
}) => {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('doctor_authenticated') === 'true');
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Sync isAuthed if sessionStorage updates
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthed(sessionStorage.getItem('doctor_authenticated') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    // Also periodically check in case it was mutated in-page
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Simulator internal settings state (defaults to normal adult rest)
  const [simVitals, setSimVitals] = useState<SimulatedVitals>({
    heartRate: 72,
    temperature: 36.8,
    spo2: 98,
    systolicBP: 120,
    diastolicBP: 80,
    respiratoryRate: 14
  });

  const [connectionState, setConnectionState] = useState<'offline' | 'linking' | 'online'>('offline');
  const [pulseWaveFrame, setPulseWaveFrame] = useState(0);
  const [activePreset, setActivePreset] = useState<string>('nominal');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Sync state initially with arduino if arduino is connected to demo
  useEffect(() => {
    if (arduino.connection?.connected && arduino.connection?.type === 'demo') {
      setConnectionState('online');
      if (arduino.vitals) {
        setSimVitals(arduino.vitals);
      }
    } else {
      setConnectionState('offline');
    }
  }, [arduino.connection?.connected, arduino.connection?.type]);

  // Handle preset selections
  const applyPreset = (presetName: string) => {
    setActivePreset(presetName);
    let vitals: SimulatedVitals;

    switch (presetName) {
      case 'nominal':
        vitals = { heartRate: 72, temperature: 36.6, spo2: 98, systolicBP: 118, diastolicBP: 76, respiratoryRate: 14 };
        break;
      case 'exercise':
        vitals = { heartRate: 152, temperature: 37.9, spo2: 96, systolicBP: 145, diastolicBP: 84, respiratoryRate: 26 };
        break;
      case 'tachycardia':
        vitals = { heartRate: 178, temperature: 37.1, spo2: 91, systolicBP: 165, diastolicBP: 98, respiratoryRate: 24 };
        break;
      case 'sepsis':
        vitals = { heartRate: 118, temperature: 39.4, spo2: 92, systolicBP: 92, diastolicBP: 54, respiratoryRate: 22 };
        break;
      case 'hypoxia':
        vitals = { heartRate: 54, temperature: 36.2, spo2: 81, systolicBP: 104, diastolicBP: 64, respiratoryRate: 9 };
        break;
      case 'shocks':
        vitals = { heartRate: 142, temperature: 35.8, spo2: 86, systolicBP: 78, diastolicBP: 44, respiratoryRate: 28 };
        break;
      default:
        vitals = { heartRate: 72, temperature: 36.8, spo2: 98, systolicBP: 120, diastolicBP: 80, respiratoryRate: 14 };
    }

    setSimVitals(vitals);
    if (connectionState === 'online') {
      arduino.updateVitals({ ...vitals, timestamp: Date.now() });
    }
    if (onVitalsChange) {
      onVitalsChange(vitals);
    }
  };

  // Connect or disconnect the simulator to the main patient monitor system
  const toggleConnection = () => {
    if (connectionState === 'online') {
      arduino.disconnect();
      setConnectionState('offline');
    } else {
      setConnectionState('linking');
      setTimeout(() => {
        arduino.setConnection({
          connected: true,
          type: 'demo',
          deviceName: 'Clinical Simulator Unit v5.2'
        });
        arduino.updateVitals({
          ...simVitals,
          timestamp: Date.now()
        });
        setConnectionState('online');
      }, 1000);
    }
  };

  // Whenever vital sliders change, push to parent or Arduino hook if live
  const updateSingleVital = (metric: keyof SimulatedVitals, value: number) => {
    setActivePreset('custom');
    const updated = {
      ...simVitals,
      [metric]: value
    };
    
    // Safety guard blood pressure relationships (SBP >= DBP + 10)
    if (metric === 'systolicBP' && value < updated.diastolicBP + 10) {
      updated.diastolicBP = Math.max(40, value - 15);
    } else if (metric === 'diastolicBP' && value > updated.systolicBP - 10) {
      updated.systolicBP = Math.min(220, value + 15);
    }

    setSimVitals(updated);
    if (connectionState === 'online') {
      arduino.updateVitals({ ...updated, timestamp: Date.now() });
    }
    if (onVitalsChange) {
      onVitalsChange(updated);
    }
  };

  // Continuous background data stream output to Arduino if connected
  useEffect(() => {
    if (connectionState !== 'online') return;

    const interval = setInterval(() => {
      // Add tiny natural biometric fluctuations
      const drifted: SimulatedVitals = {
        heartRate: Math.max(30, Math.min(200, Math.round(simVitals.heartRate + (Math.random() - 0.5) * 1.5))),
        temperature: parseFloat(Math.max(34.0, Math.min(42.0, simVitals.temperature + (Math.random() - 0.5) * 0.08)).toFixed(1)),
        spo2: Math.max(60, Math.min(100, Math.round(simVitals.spo2 + (Math.random() - 0.5) * 0.5))),
        systolicBP: Math.max(70, Math.min(220, Math.round(simVitals.systolicBP + (Math.random() - 0.5) * 2))),
        diastolicBP: Math.max(40, Math.min(130, Math.round(simVitals.diastolicBP + (Math.random() - 0.5) * 1.2))),
        respiratoryRate: Math.max(5, Math.min(45, Math.round(simVitals.respiratoryRate + (Math.random() - 0.5) * 0.6)))
      };

      // Ensure sanity in SBP/DBP
      if (drifted.systolicBP < drifted.diastolicBP + 10) {
        drifted.systolicBP = drifted.diastolicBP + 15;
      }

      setSimVitals(drifted);
      arduino.updateVitals({
        ...drifted,
        timestamp: Date.now()
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [connectionState, simVitals]);

  // Animate ECG and Waveforms on canvas
  useEffect(() => {
    let frameId: number;
    let localFrame = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dark futuristic oscilloscope grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 12;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw ECG/SpO2 waves side-by-side or combined
      ctx.strokeStyle = connectionState === 'online' ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.shadowBlur = connectionState === 'online' ? 6 : 0;
      ctx.shadowColor = connectionState === 'online' ? '#10b981' : '#3b82f6';
      ctx.beginPath();

      // Adjust wave frequency based on heartRate slider
      const speedFactor = simVitals.heartRate / 72; 
      
      for (let i = 0; i < w; i++) {
        const xArg = (i * 0.08 * speedFactor) + localFrame * 0.05;
        let yOffset = 0;

        // Simulate QRS Peak Complex
        const peakCycle = xArg % (Math.PI * 2);
        if (peakCycle < 0.25) {
          // P Wave
          yOffset = Math.sin(peakCycle * Math.PI * 4) * 8;
        } else if (peakCycle >= 0.3 && peakCycle < 0.45) {
          // QRS negative dip
          yOffset = -5;
        } else if (peakCycle >= 0.45 && peakCycle < 0.6) {
          // R spike (very high positive)
          yOffset = 45;
        } else if (peakCycle >= 0.6 && peakCycle < 0.72) {
          // S dip
          yOffset = -12;
        } else if (peakCycle >= 1.0 && peakCycle < 1.4) {
          // T Wave
          yOffset = Math.sin((peakCycle - 1.0) * Math.PI * 2.5) * 12;
        }

        const y = (h / 2) - yOffset + Math.sin(i * 0.02) * 2; // slight micro-fluctuations
        
        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      localFrame++;
      setPulseWaveFrame(localFrame);
      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [simVitals.heartRate, connectionState]);

  return (
    <div id="biomedical-simulator" className={`bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden ${className}`}>
      {/* Laser Glowing Status Border */}
      <div className={`absolute top-0 inset-x-0 h-1.5 transition-colors duration-500 ${
        connectionState === 'online' ? 'bg-emerald-500 shadow-[0_2px_15px_rgba(16,185,129,0.7)]' : 
        connectionState === 'linking' ? 'bg-amber-500 animate-pulse' : 'bg-blue-600'
      }`} />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:16px_16px] pointer-events-none" />

      {/* Simulator Interface Container */}
      <div className="p-4 sm:p-8 relative z-10 flex flex-col justify-between h-full text-slate-100">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 sm:p-2.5 bg-slate-850 rounded-xl border border-slate-705 text-blue-400">
                <Cpu size={18} className="animate-spin-slow" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Bio-Nexus Companion</span>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  Interactive Signal Generator v5.2
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">Standalone hardware emulator with tactile clinician dials</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle size={12} />
              {showGuide ? 'Hide Guide' : 'Explain Device'}
            </button>
            
            {/* LINK TOGGLE */}
            <button
              onClick={toggleConnection}
              disabled={connectionState === 'linking'}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all border ${
                connectionState === 'online'
                  ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10'
                  : connectionState === 'linking'
                  ? 'bg-amber-550 text-white border-amber-500 animate-pulse'
                  : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow-lg shadow-blue-500/10'
              }`}
            >
              <Radio size={12} className={connectionState === 'online' ? 'animate-pulse' : ''} />
              <span>{
                connectionState === 'online' ? 'COUPLING: CONNECTED' :
                connectionState === 'linking' ? 'CALIBRATING LINK...' : 'CONNECT TO CLINICAL MONITOR'
              }</span>
            </button>
          </div>
        </div>

        {/* Explain Guide Box */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-5 bg-blue-950/40 border border-blue-900/40 rounded-2xl text-xs leading-relaxed text-blue-200"
            >
              <p className="font-bold mb-2 uppercase tracking-wide text-blue-400">⚡ How to Use the Simulator Hardware Companion</p>
              <ol className="list-decimal list-inside space-y-1.5 font-medium">
                <li>This panel simulates direct physical clinical sensors (ECG, Pulse-oximeter, Breath belt).</li>
                <li><strong>Standalone:</strong> You can play with sliders, dials, and preset conditions to study synthetic wave formations.</li>
                <li><strong>Nexus Link:</strong> Click <code className="bg-slate-800 text-slate-300 px-1 rounded">CONNECT TO PATIENT MONITOR</code> to couple the generator. Waveforms, alerts, AI analyses and warning states instantly sync in the main patient view.</li>
                <li>Adjust sliders (e.g., lower SpO2 below 90% or double HR) to instantly test the emergency SMS system & alarm bells.</li>
              </ol>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          {!isAuthed && (
            <div className="absolute inset-0 z-40 bg-slate-900/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center border border-slate-800">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 mb-4 border border-blue-500/20">
                <Lock size={28} className="animate-bounce" />
              </div>
              <h4 className="text-base font-black uppercase tracking-tight text-white mb-2">Tactile Clinician Dials Locked</h4>
              <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed font-semibold">
                This physical ward wave generator is write-protected under Doctor Protocol protection. Please authenticate with clinical passkey.
              </p>
              <button 
                onClick={() => setIsVerifyOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                Unlock Clinician Controls
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Presets and Quick Targets (Left 4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3 block">
                Clinical Preset Profiles
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-2.5">
                {[
                  { id: 'nominal', label: 'Stable Base', desc: 'Typical rest', color: 'hover:border-emerald-500/30' },
                  { id: 'exercise', label: 'Workout Stress', desc: 'Elevated vitals', color: 'hover:border-blue-500/30' },
                  { id: 'tachycardia', label: 'Arrhythmia HR', desc: 'Tachycardic delta', color: 'hover:border-red-500/30' },
                  { id: 'sepsis', label: 'Infectious Pyrexia', desc: 'High temp/fever', color: 'hover:border-amber-500/30' },
                  { id: 'hypoxia', label: 'Hypoxia Event', desc: 'Critical SpO2 dip', color: 'hover:border-purple-500/30' },
                  { id: 'shocks', label: 'Cardiac Shock', desc: 'Low SBP/circulatory', color: 'hover:border-rose-500/30' }
                ].map((p) => {
                  const active = activePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.id)}
                      className={`text-left p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all active:scale-[0.98] ${
                        active
                          ? 'bg-blue-600/10 border-blue-500 text-white shadow-xl shadow-blue-500/5'
                          : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                      } ${p.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-tight truncate">{p.label}</p>
                        {active && <Check size={11} className="text-blue-400 shrink-0" />}
                      </div>
                      <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase mt-0.5 sm:mt-1 tracking-tight truncate opacity-80">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live CRT Ribbon Screen */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden relative group">
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${connectionState === 'online' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <span className="font-mono text-[8px] text-slate-500 tracking-wider">TELEMETRY CRT Osc</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Activity size={12} className="text-emerald-500" /> Active Pulse Waveform
              </p>
              <canvas ref={canvasRef} width={280} height={100} className="w-full h-24 rounded-lg bg-slate-950 border border-slate-900" />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/60 font-mono text-[9px] text-slate-500">
                <span>Signal Speed: {(simVitals.heartRate / 72).toFixed(2)}x</span>
                <span>ECG Amplitude: 45mV</span>
              </div>
            </div>
          </div>

          {/* Dials & Sliding Overrides (Right 8 Cols) */}
          <div className="lg:col-span-8 bg-slate-850/30 border border-slate-800/80 p-4 sm:p-6 md:p-7 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-5 sm:gap-y-6">
            
            {/* Hearth Rate Dial */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-500" /> Cardiac Rate
                </label>
                <span className="font-mono text-base font-black text-rose-400 tracking-wide">
                  {simVitals.heartRate} <span className="text-[10px] text-slate-500">BPM</span>
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                value={simVitals.heartRate}
                onChange={(e) => updateSingleVital('heartRate', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none accent-rose-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>30 (Bradycardia)</span>
                <span>Normal: 60-100</span>
                <span>200 (Flutter)</span>
              </div>
            </div>

            {/* Blood Oxygen SpO2 Dial */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-normal">
                  <Droplets size={14} className="text-blue-400" /> Oxygenation Level
                </label>
                <span className="font-mono text-base font-black text-blue-400 tracking-wide">
                  {simVitals.spo2} <span className="text-[10px] text-slate-500">% O₂</span>
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                value={simVitals.spo2}
                onChange={(e) => updateSingleVital('spo2', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none accent-blue-400"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>60% (Suffocation)</span>
                <span>Safety Cap: 95%+</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            {/* Body Temp Dial */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer size={14} className="text-amber-500" /> Core Thermals
                </label>
                <span className="font-mono text-base font-black text-amber-500 tracking-wide">
                  {simVitals.temperature.toFixed(1)} <span className="text-[10px] text-slate-500">°C</span>
                </span>
              </div>
              <input
                type="range"
                min="340"
                max="425"
                step="1"
                value={simVitals.temperature * 10}
                onChange={(e) => updateSingleVital('temperature', parseInt(e.target.value) / 10)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none accent-amber-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>34.0° (Hypothermia)</span>
                <span>Baseline: 36.5</span>
                <span>42.0° (Hyperpyrexia)</span>
              </div>
            </div>

            {/* Respiration Rate Dial */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wind size={14} className="text-cyan-400" /> Ventilation Speed
                </label>
                <span className="font-mono text-base font-black text-cyan-400 tracking-wide">
                  {simVitals.respiratoryRate} <span className="text-[10px] text-slate-500">RPM</span>
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                value={simVitals.respiratoryRate}
                onChange={(e) => updateSingleVital('respiratoryRate', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>5 Breaths (Apnea)</span>
                <span>Target: 12-18</span>
                <span>45 Breaths (Tachypnea)</span>
              </div>
            </div>

            {/* Systolic Blood Pressure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={14} className="text-purple-500" /> Systolic Pressure
                </label>
                <span className="font-mono text-base font-black text-purple-400 tracking-wide">
                  {simVitals.systolicBP} <span className="text-[10px] text-slate-500">mmHg</span>
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="220"
                value={simVitals.systolicBP}
                onChange={(e) => updateSingleVital('systolicBP', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none accent-purple-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>70mmHg (Hypotension)</span>
                <span>Optimal: 120</span>
                <span>220mmHg (危機 Storm)</span>
              </div>
            </div>

            {/* Diastolic Blood Pressure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-normal">
                  <Award size={14} className="text-purple-400" /> Diastolic Pressure
                </label>
                <span className="font-mono text-base font-black text-purple-300 tracking-wide">
                  {simVitals.diastolicBP} <span className="text-[10px] text-slate-500">mmHg</span>
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="130"
                value={simVitals.diastolicBP}
                onChange={(e) => updateSingleVital('diastolicBP', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none accent-purple-400"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>40mmHg (Distensive)</span>
                <span>Optimal: 80</span>
                <span>130mmHg (Hypertensive)</span>
              </div>
            </div>

          </div>
        </div>
        </div>

        {/* Footer Warning / State Info */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full flex items-center justify-center ${connectionState === 'online' ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                connectionState === 'online' ? 'bg-emerald-500 animate-pulse' : 
                connectionState === 'linking' ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'
              }`} />
            </span>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              {connectionState === 'online' ? (
                <>Streaming: <span className="font-mono text-emerald-400">12v telemetry / CRC checked</span></>
              ) : (
                <>Signal Status: <span className="text-slate-400">Locked in Standalone Simulator Mode</span></>
              )}
            </p>
          </div>

          {connectionState === 'online' && (
            <button
              onClick={() => {
                // Trigger quick emergency surge values to verify the alert network works!
                updateSingleVital('heartRate', 165);
                updateSingleVital('spo2', 84);
                updateSingleVital('temperature', 39.8);
                updateSingleVital('systolicBP', 195);
                updateSingleVital('diastolicBP', 115);
                updateSingleVital('respiratoryRate', 32);
              }}
              className="px-4 py-2 bg-red-600/15 hover:bg-red-650/20 border border-red-500/20 rounded-xl text-[9px] font-black uppercase text-red-400 tracking-widest transition-all"
            >
              🔥 Simulate Critical Spike
            </button>
          )}
        </div>

      </div>
      
      <DoctorVerificationModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onSuccess={() => setIsAuthed(true)}
        title="Clinician Access Granted"
        description="Your credentials have been authenticated. Sliders and wave presets are now unlocked for this session."
      />
    </div>
  );
};
