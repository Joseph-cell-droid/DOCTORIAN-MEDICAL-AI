import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Square, Sliders, Volume2, ShieldAlert, CheckCircle2, 
  TrendingUp, Cpu, GitFork, ChevronRight, Heart, Brain, 
  Activity, Info, RefreshCw, Layers, Sparkles, Filter, 
  ArrowLeft, Search, HelpCircle, Shield, Database
} from 'lucide-react';

// Clinical Sound Preset Types
type PresetID = 'normal_cardiac' | 'murmur_mitral' | 'bronchial_wheeze' | 'alpha_binaural' | 'none';

interface SoundPreset {
  id: PresetID;
  title: string;
  category: 'Cardiac' | 'Pulmonary' | 'Neurological';
  description: string;
  defaultFrequency: number;
  clinicalSignificance: string;
}

const PRESETS: SoundPreset[] = [
  {
    id: 'normal_cardiac',
    title: 'Normal Sinus Rhythm (S1/S2)',
    category: 'Cardiac',
    description: 'Calculated physiological baseline S1 (lub) and S2 (dub) audio beats.',
    defaultFrequency: 72, // BPM
    clinicalSignificance: 'Indicates healthy closure of atrioventricular and semilunar valves.'
  },
  {
    id: 'murmur_mitral',
    title: 'Mitral Valve Regurgitation Murmur',
    category: 'Cardiac',
    description: 'Damped S1/S2 heartbeat layered with high-frequency ejection systolic noise.',
    defaultFrequency: 85, // BPM
    clinicalSignificance: 'Backflow of blood from left ventricle into left atrium due to valve insufficiency.'
  },
  {
    id: 'bronchial_wheeze',
    title: 'Asthmatic Bronchial Wheeze',
    category: 'Pulmonary',
    description: 'High-pitch continuous respiratory pitch oscillating on inhalation/exhalation.',
    defaultFrequency: 16, // Breaths per min
    clinicalSignificance: 'High-velocity flow through narrowed or spasm-restricted bronchial pathways.'
  },
  {
    id: 'alpha_binaural',
    title: 'Binaural Brainwave (8Hz Alpha Rhythm)',
    category: 'Neurological',
    description: 'Fused stereo binaural beat (200Hz left, 208Hz right) to support neural entrainment.',
    defaultFrequency: 8, // Modulation Hz
    clinicalSignificance: 'Induces calm alert state; models neural cognitive rehabilitation pathways.'
  }
];

export const BiomaticSandbox: React.FC = () => {
  // Web Audio Context states
  const [activePreset, setActivePreset] = useState<PresetID>('none');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(72);
  const [pitch, setPitch] = useState<number>(100); // 100% normal pitch multiplier
  const [volume, setVolume] = useState<number>(50); // 0-100%
  const [synthesizerLog, setSynthesizerLog] = useState<string[]>(['INFO: Acoustic biosphere active. Select a preset to listen.']);

  // Web Audio AudioContext refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playStateRef = useRef<boolean>(false);
  const schedulerTimerRef = useRef<number | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Canvas Oscilloscope ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // CDSS Decision Support states
  const [age, setAge] = useState<number>(45);
  const [sysBP, setSysBP] = useState<number>(135);
  const [temp, setTemp] = useState<number>(37.2);
  const [spo2, setSpo2] = useState<number>(96);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [symptoms, setSymptoms] = useState({
    dehydration: false,
    chestTightness: false,
    confusion: false,
    coughDyspnea: false
  });

  // Dynamic CDSS analysis derived variables
  const getRiskStratification = () => {
    let score = 0;
    const rulesTriggered: string[] = [];

    if (spo2 < 92) {
      score += 4;
      rulesTriggered.push("Hypoxia Alert: SpO2 < 92%");
    } else if (spo2 < 95) {
      score += 2;
      rulesTriggered.push("Borderline Oxygen: SpO2 92-94%");
    }

    if (sysBP >= 180) {
      score += 4;
      rulesTriggered.push("Hypertensive Crisis Level: Systolic BP >= 180 mmHg");
    } else if (sysBP >= 140) {
      score += 2;
      rulesTriggered.push("Stage II Hypertension: Systolic BP >= 140 mmHg");
    } else if (sysBP < 90) {
      score += 2;
      rulesTriggered.push("Hypotension Danger: Systolic BP < 90 mmHg");
    }

    if (temp >= 39.5) {
      score += 3;
      rulesTriggered.push("High Hyperthermia: Temp >= 39.5°C");
    } else if (temp >= 38.0) {
      score += 1;
      rulesTriggered.push("Mild Pyrexia: Temp >= 38.0°C");
    } else if (temp < 35.5) {
      score += 2;
      rulesTriggered.push("Hypothermia Flag: Temp < 35.5°C");
    }

    if (heartRate > 120) {
      score += 3;
      rulesTriggered.push("Tachycardia Shock Marker: HR > 120 BPM");
    } else if (heartRate < 50) {
      score += 2;
      rulesTriggered.push("Bradycardia Risk: HR < 50 BPM");
    }

    if (symptoms.chestTightness) {
      score += 4;
      rulesTriggered.push("Symptom: Acute Chest Constriction / Cardiac Risk");
    }
    if (symptoms.confusion) {
      score += 3;
      rulesTriggered.push("Symptom: Encephalopathic Confusion / Sepsis Sign");
    }
    if (symptoms.coughDyspnea) {
      score += 2;
      rulesTriggered.push("Symptom: Pulmonary Congestion / Dyspnea");
    }
    if (symptoms.dehydration) {
      score += 2;
      rulesTriggered.push("Symptom: Marked Hypovolemia / Severe Dehydration");
    }

    let status: 'NORMAL' | 'ALERT' | 'CRITICAL' = 'NORMAL';
    let advice = "Physiological status is stable. Proceed with standard routine maintenance, health goals tracker logging, and scheduled nutrient tracking.";
    let triageCode = "YELLOW/GREEN (Standard Wellness Care)";

    if (score >= 7) {
      status = 'CRITICAL';
      advice = "🚨 EMERGENCY INTERVENTION PROTOCOL ACTIVE: Critical clinical metrics breached. Initiate Emergency SOS Broadcaster immediately. Prepare localized medical telemetry values and proceed to standard clinic. Force immediate physical care pathway.";
      triageCode = "RED FLAG (CRITICAL CLINICAL CARE PATH)";
    } else if (score >= 3) {
      status = 'ALERT';
      advice = "⚠️ HIGH-RISK OUTPATIENT PROTOCOL: Sub-optimal cardiovascular or thermoregulatory parameters noted. Log temperature metrics hourly under Patient Monitor. Restrict strenuous workouts. Consider telemedicine verification.";
      triageCode = "AMBER (ELEVATED CLINICAL INTERVENTION)";
    }

    return { score, status, advice, triageCode, rulesTriggered };
  };

  const analysis = getRiskStratification();

  // Web Audio synthesis functions
  const stopAudio = () => {
    playStateRef.current = false;
    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.suspend();
      } catch (e) {}
    }
    setIsPlaying(false);
  };

  const startAudio = async (presetId: PresetID) => {
    stopAudio();
    if (typeof window === 'undefined') return;

    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
        
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        
        masterGainRef.current = audioCtxRef.current.createGain();
        masterGainRef.current.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
        
        // Connect nodes
        analyserRef.current.connect(masterGainRef.current);
        masterGainRef.current.connect(audioCtxRef.current.destination);
      }

      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      playStateRef.current = true;
      setIsPlaying(true);
      setSynthesizerLog(prev => [...prev.slice(-4), `SYS: Synthesizer activated for ${presetId.toUpperCase()}`]);

      // Initialize preset sound scheduler loops
      const scheduler = () => {
        if (!playStateRef.current || !audioCtxRef.current || !analyserRef.current) return;

        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;
        const timeMultiplier = bpm / 60; // scale standard seconds

        if (presetId === 'normal_cardiac') {
          // Play physiological heart sound pattern
          // S1 node
          const s1Osc = ctx.createOscillator();
          const s1Gain = ctx.createGain();
          s1Osc.type = 'sine';
          s1Osc.frequency.setValueAtTime(100 * (pitch / 100), now);
          s1Gain.gain.setValueAtTime(0, now);
          s1Gain.gain.linearRampToValueAtTime(0.6, now + 0.01);
          s1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          s1Osc.connect(s1Gain);
          s1Gain.connect(analyserRef.current);
          s1Osc.start(now);
          s1Osc.stop(now + 0.1);

          // S2 node scheduled with 0.14 second delay
          const s2Delay = 0.14 / timeMultiplier;
          const s2Osc = ctx.createOscillator();
          const s2Gain = ctx.createGain();
          s2Osc.type = 'sine';
          s2Osc.frequency.setValueAtTime(120 * (pitch / 100), now + s2Delay);
          s2Gain.gain.setValueAtTime(0, now + s2Delay);
          s2Gain.gain.linearRampToValueAtTime(0.5, now + s2Delay + 0.01);
          s2Gain.gain.exponentialRampToValueAtTime(0.001, now + s2Delay + 0.08);

          s2Osc.connect(s2Gain);
          s2Gain.connect(analyserRef.current);
          s2Osc.start(now + s2Delay);
          s2Osc.stop(now + s2Delay + 0.1);

          // Schedule next full double heartbeat cycle
          const nextInterval = (1000 * 60) / bpm;
          schedulerTimerRef.current = window.setTimeout(scheduler, nextInterval);

        } else if (presetId === 'murmur_mitral') {
          // Systolic Murmur (S1 is blended with wind physical noise before S2)
          // S1 node
          const s1Osc = ctx.createOscillator();
          const s1Gain = ctx.createGain();
          s1Osc.type = 'sine';
          s1Osc.frequency.setValueAtTime(90 * (pitch / 100), now);
          s1Gain.gain.setValueAtTime(0, now);
          s1Gain.gain.linearRampToValueAtTime(0.6, now + 0.01);
          s1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          s1Osc.connect(s1Gain);
          s1Gain.connect(analyserRef.current);
          s1Osc.start(now);
          s1Osc.stop(now + 0.08);

          // Mitral Regurgitation systolic "swish" friction noise
          // Generate simple white noise buffer
          const bufferSize = ctx.sampleRate * 0.12; 
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noiseNode = ctx.createBufferSource();
          noiseNode.buffer = buffer;

          // Bandpass filter to isolate friction swish
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(450 * (pitch / 100), now);
          filter.Q.setValueAtTime(2.0, now);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0, now + 0.01);
          noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.03);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

          noiseNode.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(analyserRef.current);
          noiseNode.start(now + 0.01);
          noiseNode.stop(now + 0.13);

          // S2 node scheduled with 0.14 second delay
          const s2Delay = 0.14 / timeMultiplier;
          const s2Osc = ctx.createOscillator();
          const s2Gain = ctx.createGain();
          s2Osc.type = 'sine';
          s2Osc.frequency.setValueAtTime(110 * (pitch / 100), now + s2Delay);
          s2Gain.gain.setValueAtTime(0, now + s2Delay);
          s2Gain.gain.linearRampToValueAtTime(0.4, now + s2Delay + 0.01);
          s2Gain.gain.exponentialRampToValueAtTime(0.001, now + s2Delay + 0.07);

          s2Osc.connect(s2Gain);
          s2Gain.connect(analyserRef.current);
          s2Osc.start(now + s2Delay);
          s2Osc.stop(now + s2Delay + 0.1);

          // Schedule next heartbeat
          const nextInterval = (1000 * 60) / bpm;
          schedulerTimerRef.current = window.setTimeout(scheduler, nextInterval);

        } else if (presetId === 'bronchial_wheeze') {
          // Continuous breathing cycles layered with squeaky tone (narrow airflow)
          // Standard breath cycle period = 3.5 seconds
          const waveOsc = ctx.createOscillator();
          const waveGain = ctx.createGain();
          waveOsc.type = 'sine';
          // Breath pitch rises and falls slightly to replicate flow
          waveOsc.frequency.setValueAtTime(320 * (pitch / 100), now);
          waveOsc.frequency.linearRampToValueAtTime(360 * (pitch / 100), now + 0.9);
          waveOsc.frequency.linearRampToValueAtTime(290 * (pitch / 100), now + 1.8);

          waveGain.gain.setValueAtTime(0, now);
          waveGain.gain.linearRampToValueAtTime(0.45, now + 0.7);
          waveGain.gain.linearRampToValueAtTime(0.02, now + 1.6);
          waveGain.gain.linearRampToValueAtTime(0.2, now + 2.4);
          waveGain.gain.exponentialRampToValueAtTime(0.001, now + 3.1);

          waveOsc.connect(waveGain);
          waveGain.connect(analyserRef.current);
          waveOsc.start(now);
          waveOsc.stop(now + 3.2);

          // Subdued low friction sound for lung wall expansion
          const bufferSize = ctx.sampleRate * 2.8; 
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noiseSource = ctx.createBufferSource();
          noiseSource.buffer = buffer;

          const hpFilter = ctx.createBiquadFilter();
          hpFilter.type = 'bandpass';
          hpFilter.frequency.setValueAtTime(150, now);
          hpFilter.Q.setValueAtTime(0.7, now);

          const hpGain = ctx.createGain();
          hpGain.gain.setValueAtTime(0, now);
          hpGain.gain.linearRampToValueAtTime(0.04, now + 0.8);
          hpGain.gain.linearRampToValueAtTime(0.001, now + 3.0);

          noiseSource.connect(hpFilter);
          hpFilter.connect(hpGain);
          hpGain.connect(analyserRef.current);
          noiseSource.start(now);
          noiseSource.stop(now + 3.0);

          schedulerTimerRef.current = window.setTimeout(scheduler, 3200);

        } else if (presetId === 'alpha_binaural') {
          // Play continuous dual low frequency waves mapped to left / right stereo ears separately
          // Uses standard StereoPannerNode to separate ears.
          // Channel 1: Left Ear: 200 Hz
          const leftOsc = ctx.createOscillator();
          const leftGain = ctx.createGain();
          const leftPanner = ctx.createStereoPanner();
          leftOsc.frequency.setValueAtTime(200 * (pitch / 100), now);
          leftOsc.type = 'sine';
          leftPanner.pan.setValueAtTime(-1, now); // Left extreme

          leftGain.gain.setValueAtTime(0, now);
          leftGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
          leftGain.gain.linearRampToValueAtTime(0.4, now + 1.9);
          leftGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

          leftOsc.connect(leftGain);
          leftGain.connect(leftPanner);
          leftPanner.connect(analyserRef.current);
          leftOsc.start(now);
          leftOsc.stop(now + 2.1);

          // Channel 2: Right Ear: 208 Hz (making 8Hz differential alpha wave)
          const rightOsc = ctx.createOscillator();
          const rightGain = ctx.createGain();
          const rightPanner = ctx.createStereoPanner();
          rightOsc.frequency.setValueAtTime(208 * (pitch / 100), now);
          rightOsc.type = 'sine';
          rightPanner.pan.setValueAtTime(1, now); // Right extreme

          rightGain.gain.setValueAtTime(0, now);
          rightGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
          rightGain.gain.linearRampToValueAtTime(0.4, now + 1.9);
          rightGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

          rightOsc.connect(rightGain);
          rightGain.connect(rightPanner);
          rightPanner.connect(analyserRef.current);
          rightOsc.start(now);
          rightOsc.stop(now + 2.1);

          schedulerTimerRef.current = window.setTimeout(scheduler, 1950);
        }
      };

      scheduler();

    } catch (e) {
      console.error("[Biomatic Synth] Initialization failed:", e);
      setSynthesizerLog(prev => [...prev, "ERROR: Sound initialization failed. Confirm tab permission."]);
    }
  };

  // Adjust Master volume dynamically during playback
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(volume / 100, audioCtxRef.current.currentTime + 0.05);
    }
  }, [volume]);

  // Adjust preset rate or pitch dynamically
  const selectPreset = (preset: SoundPreset) => {
    setActivePreset(preset.id);
    setBpm(preset.defaultFrequency);
    startAudio(preset.id);
  };

  // Draw smooth acoustic oscilloscope in Canvas
  useEffect(() => {
    let activeCanvas = canvasRef.current;
    if (!activeCanvas) return;

    const canvasCtx = activeCanvas.getContext('2d');
    if (!canvasCtx) return;

    let bufferLength = analyserRef.current?.frequencyBinCount || 256;
    let dataArray = new Uint8Array(bufferLength);

    const drawOscilloscope = () => {
      animationFrameRef.current = requestAnimationFrame(drawOscilloscope);

      const width = activeCanvas.width;
      const height = activeCanvas.height;

      // In dark vs light mode, choose coordinate palettes
      const isDark = document.documentElement.classList.contains('dark') || true;
      canvasCtx.fillStyle = isDark ? '#020617' : '#f8fafc';
      canvasCtx.fillRect(0, 0, width, height);

      // Render gridlines
      canvasCtx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
      canvasCtx.lineWidth = 0.5;
      
      // Horizontal center line
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, height / 2);
      canvasCtx.lineTo(width, height / 2);
      canvasCtx.stroke();
      
      // Vertical grid lines
      for (let x = width / 8; x < width; x += width / 8) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, 0);
        canvasCtx.lineTo(x, height);
        canvasCtx.stroke();
      }

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteTimeDomainData(dataArray);

        canvasCtx.lineWidth = 2.5;
        canvasCtx.lineCap = 'round';
        canvasCtx.lineJoin = 'round';
        
        // Select color according to the active preset type
        const activePresetDetails = PRESETS.find(p => p.id === activePreset);
        let strokeColor = '#3b82f6'; // default blue
        if (activePresetDetails?.category === 'Cardiac') strokeColor = '#f43f5e';
        if (activePresetDetails?.category === 'Pulmonary') strokeColor = '#10b981';
        if (activePresetDetails?.category === 'Neurological') strokeColor = '#a855f7';

        canvasCtx.strokeStyle = strokeColor;
        canvasCtx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // range 0 to 2
          const y = (v * height) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(width, height / 2);
        canvasCtx.stroke();

        // Overlay glowing pulsing effect mapping current volume
        canvasCtx.strokeStyle = strokeColor + '22';
        canvasCtx.lineWidth = 7;
        canvasCtx.stroke();
      } else {
        // Draw standard flatline with small randomized noise ripples to signify system sync
        canvasCtx.strokeStyle = '#64748b';
        canvasCtx.lineWidth = 1.5;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, height / 2);

        const segments = 40;
        const segmentWidth = width / segments;
        for (let i = 0; i <= segments; i++) {
          const rx = i * segmentWidth;
          const ry = (height / 2) + (Math.sin(i * 0.5 + Date.now() * 0.005) * (isPlaying ? 5 : 0.8));
          canvasCtx.lineTo(rx, ry);
        }
        canvasCtx.stroke();
      }
    };

    drawOscilloscope();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, activePreset]);

  // Clean elements on unmount
  useEffect(() => {
    return () => {
      playStateRef.current = false;
      if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div id="biomatic-sandbox-container" className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-full items-start">
      {/* SECTION 1: SYSTEM TITLE HEADER - Fullspan */}
      <div className="col-span-1 xl:col-span-12 p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-xl text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Biological Lab</span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-black tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Local Simulation active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Cpu className="text-blue-500 animate-spin-slow w-8 h-8" /> Biomatic Clinical Sandbox
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Conduct high-fidelity physiological tone synthesizing, acoustic diagnostic auscultations, and real-time Clinical Decision Support (CDSS) algorithm tree mapping.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 self-start md:self-auto shrink-0 font-mono text-[11px] text-slate-400">
            <Database size={13} className="text-blue-400" />
            <span>SQLite Synced. Rules: CDC v2.1</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: LEFT COLUMN - ACOUSTIC SIMULATOR & AUDIO SYNTHESIS */}
      <div className="col-span-1 xl:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-[3rem] shadow-2xl p-6 md:p-8 space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
              <Volume2 className="text-rose-500" /> 1. Acoustic Diagnostic Auscultator
            </h2>
            <div className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
              Audio Wave Active
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clinical Biological Sound Presets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className={`p-4 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                    activePreset === preset.id
                      ? preset.category === 'Cardiac'
                        ? 'border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/20 shadow-md shadow-rose-500/5'
                        : preset.category === 'Pulmonary'
                        ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/5'
                        : 'border-purple-500/50 bg-purple-500/5 dark:bg-purple-950/20 shadow-md shadow-purple-500/5'
                      : 'border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5 min-h-[20px]">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      preset.category === 'Cardiac'
                        ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        : preset.category === 'Pulmonary'
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                        : 'bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                    }`}>
                      {preset.category}
                    </span>
                    {activePreset === preset.id && isPlaying && (
                      <span className="flex gap-0.5 items-end h-3 w-5">
                        <span className="w-0.5 h-full rounded-full bg-current animate-[pulse_0.4s_infinite_alternate]" />
                        <span className="w-0.5 h-1/2 rounded-full bg-current animate-[pulse_0.4s_infinite_alternate_0.1s]" />
                        <span className="w-0.5 h-3/4 rounded-full bg-current animate-[pulse_0.4s_infinite_alternate_0.2s]" />
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-black tracking-tight text-slate-800 dark:text-white leading-snug">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Oscilloscope Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Interactive Frequency Oscilloscope</span>
              {activePreset !== 'none' && (
                <span className="text-[10px] font-mono text-slate-500">Preset: {activePreset.toUpperCase()}</span>
              )}
            </div>
            <div className="relative h-44 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-900 bg-slate-950">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full block" 
                width={650} 
                height={176} 
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-0.5 bg-slate-900/80 border border-slate-800 text-[9px] font-mono uppercase text-slate-400 rounded">
                  Sweep: 1x
                </span>
                <span className="px-2 py-0.5 bg-slate-900/80 border border-slate-800 text-[9px] font-mono uppercase text-slate-400 rounded">
                  Freq analyzer live
                </span>
              </div>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-900/50">
            {/* Play/Stop State Toggle */}
            <div className="flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activePreset === 'none') {
                      selectPreset(PRESETS[0]);
                    } else if (isPlaying) {
                      stopAudio();
                    } else {
                      startAudio(activePreset);
                    }
                  }}
                  id="btn-sandbox-play"
                  className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl w-full text-xs font-black uppercase tracking-wider hover:scale-[1.01] transition-transform ${
                    isPlaying 
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/10'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square size={13} fill="currentColor" /> Mute Signal
                    </>
                  ) : (
                    <>
                      <Play size={13} fill="currentColor" /> Synthesize Preset
                    </>
                  )}
                </button>
              </div>

              {/* Pitch/Speed Tuning Sliders */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400">
                  <span>Frequency Rate: {bpm} {activePreset === 'bronchial_wheeze' ? 'BR' : 'BPM'}</span>
                  <button onClick={() => setBpm(72)} className="text-[9px] text-blue-500 font-extrabold hover:underline">RESET</button>
                </div>
                <input 
                  type="range"
                  min={activePreset === 'bronchial_wheeze' ? 8 : 45}
                  max={activePreset === 'bronchial_wheeze' ? 36 : 160}
                  value={bpm}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value);
                    setBpm(parsed);
                    setSynthesizerLog(prev => [...prev.slice(-3), `USER: Adjusted tone pace to ${parsed}`]);
                  }}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Volume Master Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400">
                  <span className="flex items-center gap-1"><Volume2 size={12} /> Master Gain: {volume}%</span>
                  <button onClick={() => setVolume(40)} className="text-[9px] text-blue-500 font-extrabold hover:underline">RESET</button>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Preset Signature Details Info */}
              {activePreset !== 'none' && (
                <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 space-y-1">
                  <span className="font-extrabold text-[#3b82f6] uppercase block">Auscultation Clinical Note</span>
                  <p>{PRESETS.find(p => p.id === activePreset)?.clinicalSignificance}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: RIGHT COLUMN - DECISION TREES & ALGORITHMS (CDSS) */}
      <div className="col-span-1 xl:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-[3rem] shadow-2xl p-6 md:p-8 space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
              <Cpu className="text-blue-500 animate-spin-slow" /> 2. Clinical Decision Solver (CDSS)
            </h2>
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full leading-relaxed">
              Deterministic Logic
            </span>
          </div>

          {/* Vitals Dials sliders Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Physiological Dial Matrices</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Temp dial */}
              <div className="space-y-1.5 p-3.5 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-905 rounded-2xl text-left">
                <div className="flex justify-between text-[11px] font-extrabold uppercase text-slate-400">
                  <span>Core Temperature</span>
                  <span className={temp >= 38.0 ? 'text-rose-500 font-extrabold' : 'text-slate-500 font-extrabold'}>{temp.toFixed(1)}°C</span>
                </div>
                <input 
                  type="range"
                  min={35.0}
                  max={41.5}
                  step={0.1}
                  value={temp}
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Normal baseline: 36.5°C ~ 37.3°C</p>
              </div>

              {/* SPO2 dial */}
              <div className="space-y-1.5 p-3.5 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-905 rounded-2xl text-left">
                <div className="flex justify-between text-[11px] font-extrabold uppercase text-slate-400">
                  <span>Oxygen saturation (SpO2)</span>
                  <span className={spo2 < 92 ? 'text-red-500 font-extrabold animate-pulse' : 'text-emerald-500 font-extrabold'}>{spo2}%</span>
                </div>
                <input 
                  type="range"
                  min={80}
                  max={100}
                  value={spo2}
                  onChange={(e) => setSpo2(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Normal target is above 95%</p>
              </div>

              {/* Blood Pressure dial */}
              <div className="space-y-1.5 p-3.5 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-905 rounded-2xl text-left">
                <div className="flex justify-between text-[11px] font-extrabold uppercase text-slate-400">
                  <span>Systolic Pressure</span>
                  <span className={sysBP >= 140 ? 'text-amber-500 font-extrabold' : 'text-slate-500 font-extrabold'}>{sysBP} mmHg</span>
                </div>
                <input 
                  type="range"
                  min={80}
                  max={205}
                  value={sysBP}
                  onChange={(e) => setSysBP(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Normative: 90 - 120 mmHg</p>
              </div>

              {/* Heart rate dial */}
              <div className="space-y-1.5 p-3.5 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-905 rounded-2xl text-left">
                <div className="flex justify-between text-[11px] font-extrabold uppercase text-slate-400">
                  <span>Pulse rate (HR)</span>
                  <span className={heartRate > 100 || heartRate < 60 ? 'text-amber-500 font-extrabold' : 'text-slate-500 font-extrabold'}>{heartRate} BPM</span>
                </div>
                <input 
                  type="range"
                  min={40}
                  max={170}
                  value={heartRate}
                  onChange={(e) => setHeartRate(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Resting baseline: 60 - 100 beats</p>
              </div>
            </div>
          </div>

          {/* Symptom check blocks */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clinical Co-factors & High-Risk Anomalies</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'chestTightness', label: 'Chest Tightness', desc: 'Ischemia Risk' },
                { id: 'confusion', label: 'Mental Confusion', desc: 'Sepsis / Hypoxia indicator' },
                { id: 'dehydration', label: 'Fluid Deficit', desc: 'Electrolyte imbalance' },
                { id: 'coughDyspnea', label: 'Severe Dyspnea', desc: 'Productive cough' },
              ].map((sym) => (
                <button
                  key={sym.id}
                  onClick={() => setSymptoms(prev => ({ ...prev, [sym.id]: !prev[sym.id as keyof typeof symptoms] }))}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-center transition-all ${
                    symptoms[sym.id as keyof typeof symptoms]
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/25 shadow-sm'
                      : 'border-slate-100 dark:border-slate-900 bg-slate-50/30 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <span className="text-xs font-bold leading-normal text-slate-800 dark:text-slate-200">{sym.label}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">{sym.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CDSS Dynamic decision tree diagram nodes! */}
          <div className="bg-slate-950 rounded-3xl p-5 border border-slate-900 space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900 pb-3">
              <span className="flex items-center gap-1"><GitFork size={12} className="text-blue-400" /> Active Logic Branches</span>
              <span>CDC WHO Algorithms</span>
            </div>

            {/* Tree nodes layout */}
            <div className="space-y-3">
              {/* Node 1: SPO2 Gate */}
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono border shrink-0 ${
                  spo2 < 92 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 animate-pulse'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                }`}>
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-200 block truncate">Branch Gate: Pulmonary Oxygen Saturation</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Criteria: SpO2 &lt; 92% ? ({spo2}%: {spo2 < 92 ? 'TRUE - HYPOXIA' : 'FALSE - NORMAL'})
                  </span>
                </div>
                {spo2 < 92 ? (
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest shrink-0 animate-pulse">Crit</span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Pass</span>
                )}
              </div>

              {/* Node 2: BP Gate */}
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono border shrink-0 ${
                  sysBP >= 180 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 animate-pulse'
                    : sysBP >= 140 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                }`}>
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-200 block truncate">Branch Gate: Coronary Pressure Baroreflex</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Criteria: Systolic &ge; 140/180 ? ({sysBP} mmHg: {sysBP >= 180 ? 'CRISIS' : sysBP >= 140 ? 'STAGE II' : 'STABLE'})
                  </span>
                </div>
                {sysBP >= 180 ? (
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest shrink-0">Crisis</span>
                ) : sysBP >= 140 ? (
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest shrink-0">Elev</span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Pass</span>
                )}
              </div>

              {/* Node 3: Chest Gate */}
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono border shrink-0 ${
                  symptoms.chestTightness 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 animate-pulse'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                }`}>
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-200 block truncate">Branch Gate: Ischemia / Angina Factors</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Criteria: Pain present ? ({symptoms.chestTightness ? 'TRUE - INFARCTION WARNING' : 'FALSE'})
                  </span>
                </div>
                {symptoms.chestTightness ? (
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest shrink-0">Infarct</span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Safe</span>
                )}
              </div>
            </div>

            {/* Tree Result Output container */}
            <div className={`p-4 rounded-2xl border ${
              analysis.status === 'CRITICAL'
                ? 'border-red-900/40 bg-red-950/20 text-red-100'
                : analysis.status === 'ALERT'
                ? 'border-amber-900/30 bg-amber-950/10 text-amber-100'
                : 'border-emerald-900/30 bg-emerald-950/10 text-emerald-100'
            } text-left`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Assessment Stratum Code
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  analysis.status === 'CRITICAL' ? 'bg-red-550/20 text-red-400' : analysis.status === 'ALERT' ? 'bg-amber-550/20 text-amber-400' : 'bg-emerald-550/20 text-emerald-400'
                }`}>
                  {analysis.triageCode}
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                {analysis.advice}
              </p>
              {analysis.rulesTriggered.length > 0 && (
                <div className="mt-2 text-[9px] text-slate-500 font-mono flex flex-wrap gap-1.5 border-t border-slate-900 pt-2">
                  <span className="font-bold">Triggers:</span>
                  {analysis.rulesTriggered.map((rule, idx) => (
                    <span key={rule} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">
                      {rule}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
