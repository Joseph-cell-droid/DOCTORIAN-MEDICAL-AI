import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Activity, Zap, Sparkles, RefreshCw, Cpu, Waves, ShieldCheck, 
  Sliders, AlertTriangle, ChevronRight, CheckCircle2, FileText, Download, Play, Pause, BarChart2
} from 'lucide-react';
import { NeuralHealthSummary } from './NeuralHealthSummary';
import { Vitals } from '../hooks/useArduino';

interface NeuralSynthesisPanelProps {
  vitals: Vitals | null;
  history: Vitals[];
  user?: any;
  onUpdateUser?: (updated: any) => void;
}

export const NeuralSynthesisPanel: React.FC<NeuralSynthesisPanelProps> = ({
  vitals,
  history,
  user,
  onUpdateUser
}) => {
  // EEG Band States
  const [eegBands, setEegBands] = useState({
    alpha: 10.4, // Hz 8-12
    beta: 22.1,  // Hz 13-30
    theta: 5.6,  // Hz 4-7
    gamma: 41.8  // Hz 30-100
  });

  const [modulationMode, setModulationMode] = useState<'standard' | 'focused' | 'deep_rest' | 'clinical_gamma'>('standard');
  const [samplingFrequency, setSamplingFrequency] = useState<number>(500); // 500 Hz
  const [artifactFilter, setArtifactFilter] = useState<boolean>(true);
  const [isPlayingWaveform, setIsPlayingWaveform] = useState<boolean>(true);
  const [activeCardTab, setActiveCardTab] = useState<'bands' | 'synaptic' | 'report'>('bands');

  // Animated wave simulation
  useEffect(() => {
    if (!isPlayingWaveform) return;
    const interval = setInterval(() => {
      setEegBands({
        alpha: +(10.0 + Math.sin(Date.now() / 800) * 1.8).toFixed(1),
        beta: +(22.0 + Math.cos(Date.now() / 600) * 3.2).toFixed(1),
        theta: +(5.5 + Math.sin(Date.now() / 1200) * 0.9).toFixed(1),
        gamma: +(41.5 + Math.cos(Date.now() / 400) * 4.5).toFixed(1)
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isPlayingWaveform]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-6 sm:p-10 text-white border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Brain size={220} className="text-indigo-400 animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-400">
                <Brain size={22} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">
                Doctorian Neural Biosignal Engine
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-[1000] tracking-tighter uppercase leading-tight">
              Neural <span className="text-indigo-400 font-serif italic normal-case">Synthesis Matrix</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-semibold max-w-2xl mt-2 leading-relaxed">
              Real-time cortical EEG spectral power density, synaptic neurotransmitter telemetry, and AI-driven neural diagnostic synthesis.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPlayingWaveform(!isPlayingWaveform)}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              {isPlayingWaveform ? <Pause size={14} className="text-indigo-400" /> : <Play size={14} className="text-emerald-400" />}
              {isPlayingWaveform ? 'Pause Telemetry' : 'Resume Telemetry'}
            </button>
            <div className="px-4 py-2.5 bg-indigo-900/40 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              500 Hz Live Link
            </div>
          </div>
        </div>

        {/* Quick Tab Selector */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCardTab('bands')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeCardTab === 'bands' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Waves size={14} /> EEG Spectral Bands
          </button>
          <button
            onClick={() => setActiveCardTab('synaptic')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeCardTab === 'synaptic' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Zap size={14} /> Synaptic & Biomarker Metrics
          </button>
          <button
            onClick={() => setActiveCardTab('report')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeCardTab === 'report' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sparkles size={14} /> AI Neural Summary Report
          </button>
        </div>
      </div>

      {/* CARD TAB 1: EEG SPECTRAL BANDS & WAVEFORM CARDS */}
      {activeCardTab === 'bands' && (
        <div className="space-y-8">
          {/* 4 EEG Band Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Alpha Wave */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Alpha (8 - 12 Hz)
                </span>
                <Waves size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-[1000] text-slate-900 dark:text-white tabular-nums">{eegBands.alpha} <span className="text-xs text-slate-400 font-bold">Hz</span></p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Parieto-Occipital Baseline</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-400">
                <span>Power: 14.2 µV²</span>
                <span className="text-emerald-500">Relaxed Awake</span>
              </div>
            </div>

            {/* Beta Wave */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  Beta (13 - 30 Hz)
                </span>
                <Activity size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-[1000] text-slate-900 dark:text-white tabular-nums">{eegBands.beta} <span className="text-xs text-slate-400 font-bold">Hz</span></p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Frontal Active Motor Cortex</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-400">
                <span>Power: 8.7 µV²</span>
                <span className="text-blue-500">Active Cognition</span>
              </div>
            </div>

            {/* Theta Wave */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-50 dark:bg-purple-950/40 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                  Theta (4 - 7 Hz)
                </span>
                <Brain size={18} className="text-purple-500" />
              </div>
              <div>
                <p className="text-3xl font-[1000] text-slate-900 dark:text-white tabular-nums">{eegBands.theta} <span className="text-xs text-slate-400 font-bold">Hz</span></p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Hippocampal Memory State</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-400">
                <span>Power: 4.1 µV²</span>
                <span className="text-purple-500 font-bold">Subconscious Sync</span>
              </div>
            </div>

            {/* Gamma Wave */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  Gamma (30 - 100 Hz)
                </span>
                <Zap size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-[1000] text-slate-900 dark:text-white tabular-nums">{eegBands.gamma} <span className="text-xs text-slate-400 font-bold">Hz</span></p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Synaptic Binding Load</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-400">
                <span>Power: 18.9 µV²</span>
                <span className="text-amber-500">High Peak Focus</span>
              </div>
            </div>
          </div>

          {/* Interactive Waveform Monitor & Parameters Controls Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h3 className="text-xl font-[1000] uppercase tracking-tight flex items-center gap-2">
                  <Activity className="text-indigo-400" size={20} /> Live Cortical Waveform Telemetry
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Multi-channel synthesized EEG signal trace stream</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sliders size={14} className="text-indigo-400" /> Sampling:
                  <select
                    value={samplingFrequency}
                    onChange={(e) => setSamplingFrequency(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value={250}>250 Hz</option>
                    <option value={500}>500 Hz (MoH Baseline)</option>
                    <option value={1000}>1000 Hz (High Res)</option>
                  </select>
                </label>

                <button
                  onClick={() => setArtifactFilter(!artifactFilter)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                    artifactFilter 
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Filter: {artifactFilter ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Simulated Live SVG Waveform */}
            <div className="h-40 w-full bg-slate-950/80 rounded-2xl border border-slate-800 p-4 relative flex items-center overflow-hidden">
              <svg className="w-full h-full stroke-indigo-400 fill-none" viewBox="0 0 500 100" preserveAspectRatio="none">
                <path
                  d={`M 0,50 ${Array.from({ length: 50 }).map((_, i) => {
                    const x = (i + 1) * 10;
                    const y = 50 + Math.sin((i + Date.now() / 200)) * 25 * (isPlayingWaveform ? 1 : 0) + Math.cos(i) * 8;
                    return `L ${x},${y}`;
                  }).join(' ')}`}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="absolute top-3 left-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                Channel C3-P3 (Left Parieto-Central)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARD TAB 2: SYNAPTIC & BIOMARKER METRICS */}
      {activeCardTab === 'synaptic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Seizure Spike Monitor</h4>
                <p className="text-[10px] font-bold text-slate-400">Cortical Paroxysmal Detector</p>
              </div>
            </div>
            <p className="text-3xl font-[1000] text-emerald-600 dark:text-emerald-400">0 <span className="text-xs font-bold text-slate-400">Spikes / 24h</span></p>
            <p className="text-xs font-semibold text-slate-500 mt-2">No epileptiform discharge waveforms detected.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Cpu size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Neuro-Vascular Autoregulation</h4>
                <p className="text-[10px] font-bold text-slate-400">CBFV Alignment Index</p>
              </div>
            </div>
            <p className="text-3xl font-[1000] text-blue-600 dark:text-blue-400">1.04 <span className="text-xs font-bold text-slate-400">Optimal Index</span></p>
            <p className="text-xs font-semibold text-slate-500 mt-2">Cerebral blood flow velocity matched to arterial pressure.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                <Sparkles size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Synaptic Biomarkers</h4>
                <p className="text-[10px] font-bold text-slate-400">S100B / NSE / BDNF Levels</p>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">BDNF (Plasticity):</span>
                <span className="text-slate-900 dark:text-white">28.4 ng/mL</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">S100B (Astrocytic):</span>
                <span className="text-emerald-500">0.04 µg/L (Normal)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARD TAB 3: AI NEURAL SUMMARY REPORT */}
      {activeCardTab === 'report' && (
        <div className="h-full">
          <NeuralHealthSummary 
            vitals={vitals} 
            history={history} 
          />
        </div>
      )}
    </div>
  );
};
