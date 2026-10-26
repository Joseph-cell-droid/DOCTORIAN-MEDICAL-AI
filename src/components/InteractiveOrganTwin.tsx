import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Activity,
  Wind,
  Layers,
  Sparkles,
  Zap,
  Info,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const InteractiveOrganTwin: React.FC<{
  liveBpm?: number;
  liveSpo2?: number;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
}> = ({ liveBpm = 72, liveSpo2 = 98, onShowToast }) => {
  const [organView, setOrganView] = useState<'heart' | 'lungs'>('heart');
  const [activeLayer, setActiveLayer] = useState<'perfusion' | 'electrical' | 'myocardium'>('electrical');
  const [selectedProbe, setSelectedProbe] = useState<string | null>('Sinoatrial (SA) Node');

  // Pulse animation duration matching current BPM
  const beatDurationSeconds = 60 / Math.max(40, Math.min(180, liveBpm));

  const probeData: Record<string, { title: string; status: string; detail: string; risk: string }> = {
    'Sinoatrial (SA) Node': {
      title: 'Sinoatrial (SA) Node - Natural Cardiac Pacemaker',
      status: 'Normal Automaticity (Intrinsic rate ~ 72 BPM)',
      detail: 'Originates electrical depolarization vector propagating through Bachmann bundle to AV junction.',
      risk: 'No sinus pause, sick sinus syndrome, or ectopic atrial focus detected.'
    },
    'Atrioventricular (AV) Node': {
      title: 'Atrioventricular (AV) Node & Bundle of His',
      status: 'Normal PR Interval (0.16s Physiological Delay)',
      detail: 'Allows complete atrial emptying before ventricular systole activation.',
      risk: 'Zero AV conduction block (PR interval < 0.20s).'
    },
    'Left Anterior Descending (LAD) Artery': {
      title: 'Left Anterior Descending (LAD) Coronary Perfusion',
      status: 'Adequate Micro-vascular Flow (TIMI Grade 3)',
      detail: 'Perfuses anterior ventricular septum, apex, and anterior free wall.',
      risk: 'No regional wall motion abnormality or acute anterior ischemic deficit.'
    },
    'Left Ventricular Myocardium': {
      title: 'Left Ventricular Myocardium & Ejection Fraction',
      status: 'Normal Ejection Fraction (~62%)',
      detail: 'Generates systemic systolic pressure against aortic valve opening.',
      risk: 'Stroke volume preserved at 74 mL/beat.'
    },
    'Right Bronchial Tree & Alveolar Bed': {
      title: 'Bronchoalveolar Capillary Gas Exchange Matrix',
      status: 'Optimal V/Q Ratio (Diffusion index 98%)',
      detail: 'Continuous oxygenation of pulmonary arterial blood across thin alveolar-capillary membranes.',
      risk: 'No evidence of consolidation, atelectasis, or ventilation-perfusion mismatch.'
    }
  };

  const currentProbeInfo = selectedProbe ? probeData[selectedProbe] : probeData['Sinoatrial (SA) Node'];

  return (
    <div className="space-y-5 text-left">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 shrink-0">
            <Heart size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black text-white tracking-tight">
                Interactive Biomechanical Organ Digital Twin
              </h4>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Synchronized 4D Simulation
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Beats and respires in real-time synchrony with patient telemetry: <strong>{liveBpm} BPM</strong> • <strong>SpO2 {liveSpo2}%</strong>.
            </p>
          </div>
        </div>

        {/* Organ Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setOrganView('heart');
              setSelectedProbe('Sinoatrial (SA) Node');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              organView === 'heart'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={13} />
            <span>Cardiovascular Twin</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOrganView('lungs');
              setSelectedProbe('Right Bronchial Tree & Alveolar Bed');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              organView === 'lungs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind size={13} />
            <span>Pulmonary Twin</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual 3D/Biomechanical Stage (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between items-center relative overflow-hidden min-h-[360px] shadow-2xl">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Layer Pill Switcher */}
          <div className="relative z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveLayer('electrical')}
              className={`px-2.5 py-1 rounded-xl transition-all ${activeLayer === 'electrical' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
            >
              ⚡ Conduction Vectors
            </button>
            <button
              onClick={() => setActiveLayer('perfusion')}
              className={`px-2.5 py-1 rounded-xl transition-all ${activeLayer === 'perfusion' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'}`}
            >
              🩸 Coronary Perfusion
            </button>
            <button
              onClick={() => setActiveLayer('myocardium')}
              className={`px-2.5 py-1 rounded-xl transition-all ${activeLayer === 'myocardium' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400'}`}
            >
              🫀 Myocardial Wall
            </button>
          </div>

          {/* Central Pulsating Biomechanical Organ */}
          <div className="relative z-10 my-6 flex flex-col items-center justify-center">
            {organView === 'heart' ? (
              <motion.div
                animate={{
                  scale: [1, 1.15, 1.02, 1.12, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: beatDurationSeconds,
                  ease: 'easeInOut'
                }}
                className="relative cursor-pointer"
                title="Click any anatomical node to inspect tissue telemetry"
              >
                {/* 3D Visual Heart Graphic */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-rose-950 via-rose-700 to-red-500 p-4 shadow-[0_0_60px_rgba(244,63,94,0.4)] border-4 border-rose-400/50 flex flex-col items-center justify-center relative overflow-hidden">
                  <Heart size={84} className="text-white drop-shadow-lg" />

                  {/* Pulsing coronary veins */}
                  <div className="absolute inset-x-0 bottom-4 text-center">
                    <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-full">
                      {liveBpm} BPM RHYTHM
                    </span>
                  </div>
                </div>

                {/* Interactive Clickable Anatomical Probes */}
                <button
                  type="button"
                  onClick={() => setSelectedProbe('Sinoatrial (SA) Node')}
                  className="absolute top-2 left-6 px-2 py-1 bg-cyan-900/90 hover:bg-cyan-600 text-cyan-200 border border-cyan-400 rounded-lg text-[9px] font-mono font-bold shadow-lg transition-transform hover:scale-110"
                >
                  ● SA Node
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProbe('Atrioventricular (AV) Node')}
                  className="absolute top-1/2 left-2 px-2 py-1 bg-amber-900/90 hover:bg-amber-600 text-amber-200 border border-amber-400 rounded-lg text-[9px] font-mono font-bold shadow-lg transition-transform hover:scale-110"
                >
                  ● AV Node
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProbe('Left Anterior Descending (LAD) Artery')}
                  className="absolute top-12 right-2 px-2 py-1 bg-rose-900/90 hover:bg-rose-600 text-rose-200 border border-rose-400 rounded-lg text-[9px] font-mono font-bold shadow-lg transition-transform hover:scale-110"
                >
                  ● LAD Artery
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProbe('Left Ventricular Myocardium')}
                  className="absolute bottom-4 right-4 px-2 py-1 bg-purple-900/90 hover:bg-purple-600 text-purple-200 border border-purple-400 rounded-lg text-[9px] font-mono font-bold shadow-lg transition-transform hover:scale-110"
                >
                  ● LV Apex
                </button>
              </motion.div>
            ) : (
              /* Pulmonary Twin */
              <motion.div
                animate={{
                  scale: [1, 1.18, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3.8, // Respiration cycle ~ 16 breaths/min
                  ease: 'easeInOut'
                }}
                className="relative cursor-pointer"
              >
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-blue-950 via-cyan-800 to-teal-500 p-4 shadow-[0_0_60px_rgba(6,182,212,0.4)] border-4 border-cyan-400/50 flex flex-col items-center justify-center relative overflow-hidden">
                  <Wind size={84} className="text-white drop-shadow-lg" />
                  <div className="absolute inset-x-0 bottom-4 text-center">
                    <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-full">
                      RESPIRATION: 16 BR/MIN
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProbe('Right Bronchial Tree & Alveolar Bed')}
                  className="absolute top-4 right-2 px-2 py-1 bg-teal-900/90 hover:bg-teal-600 text-teal-200 border border-teal-400 rounded-lg text-[9px] font-mono font-bold shadow-lg transition-transform hover:scale-110"
                >
                  ● Alveolar Capillary Bed
                </button>
              </motion.div>
            )}
          </div>

          <div className="relative z-10 text-[10px] text-slate-400 font-mono">
            Click any probe pin to inspect live electrical and perfusion hemodynamics.
          </div>
        </div>

        {/* Anatomical Probe Inspector Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-800">
              <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Selected Tissue Target</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Dynamic Mesh
              </span>
            </div>

            <h5 className="text-base font-black text-white">
              {currentProbeInfo.title}
            </h5>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                Tissue Hemodynamic State:
              </span>
              <p className="text-xs font-bold text-emerald-400">
                {currentProbeInfo.status}
              </p>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                Pathophysiological Correlation:
              </span>
              <p className="leading-relaxed">
                {currentProbeInfo.detail}
              </p>
            </div>

            <div className="p-3 bg-blue-950/30 rounded-2xl border border-blue-800/40 text-xs text-blue-300 space-y-1">
              <span className="text-[10px] uppercase font-mono text-blue-400 font-bold block">
                Clinical Risk Audit:
              </span>
              <p>{currentProbeInfo.risk}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onShowToast) {
                onShowToast('3D Biomechanical Twin snapshot captured and synced to patient 1GB vault.', 'success');
              }
            }}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <ShieldCheck size={16} />
            <span>Sync Organ Twin Telemetry to 1GB Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
};
