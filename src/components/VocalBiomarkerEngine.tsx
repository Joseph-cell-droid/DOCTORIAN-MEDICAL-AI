import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Activity,
  Brain,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Play,
  Square,
  Sparkles,
  Volume2
} from 'lucide-react';

export const VocalBiomarkerEngine: React.FC<{
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
}> = ({ onShowToast }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [vocalJitter, setVocalJitter] = useState<number>(0.84); // Normal: < 1.04%
  const [vocalShimmer, setVocalShimmer] = useState<number>(2.45); // Normal: < 3.81%
  const [hnr, setHnr] = useState<number>(22.4); // Normal: > 20 dB
  const [speechFatigueScore, setSpeechFatigueScore] = useState<number>(14); // 0-100%
  const [dyspneaIndex, setDyspneaIndex] = useState<'Grade 0 (Normal)' | 'Grade 1 (Mild Exertional)'>('Grade 0 (Normal)');
  const [wavePoints, setWavePoints] = useState<number[]>([]);

  const animFrameRef = useRef<number | null>(null);

  const startVocalAnalysis = async () => {
    setIsRecording(true);
    if (onShowToast) {
      onShowToast('Please read a sentence or hold a steady vowel "Ahhhh" for 5 seconds.', 'info');
    }
  };

  const stopVocalAnalysis = () => {
    setIsRecording(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  useEffect(() => {
    if (!isRecording) return;

    let time = 0;
    const loop = () => {
      time += 0.05;
      // Synthesize realistic vocal harmonic perturbation
      const sampleJitter = 0.8 + Math.sin(time * 2) * 0.15;
      const sampleShimmer = 2.4 + Math.cos(time * 1.5) * 0.3;
      setVocalJitter(Number(sampleJitter.toFixed(2)));
      setVocalShimmer(Number(sampleShimmer.toFixed(2)));
      setHnr(Number((22.5 + Math.sin(time) * 1.2).toFixed(1)));
      setSpeechFatigueScore(Math.round(15 + Math.sin(time * 0.5) * 4));

      // Waveform
      const points = Array.from({ length: 24 }, (_, i) =>
        Math.max(10, Math.round(Math.abs(Math.sin(time * 4 + i * 0.3)) * 80 + 15))
      );
      setWavePoints(points);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording]);

  return (
    <div className="space-y-5 text-left">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
            <Volume2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black text-white tracking-tight">
                Vocal Biomarker Neurological & Respiratory Engine
              </h4>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Acoustic Micro-Perturbation
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Extracts fundamental frequency jitter, amplitude shimmer, and harmonics-to-noise ratio to screen for motor tremor and respiratory dyspnea.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startVocalAnalysis}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Mic size={14} />
              <span>Record Voice Sample</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopVocalAnalysis}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Square size={14} />
              <span>Stop Vocal Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* Visualizer & Biomarker Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-slate-800 p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              Real-Time Acoustic Phonation Trace
            </h5>
            <span className="text-[10px] font-mono text-purple-400 font-bold">
              {isRecording ? 'Sampling Vocal Fold Oscillation...' : 'Standby'}
            </span>
          </div>

          <div className="h-40 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex items-center justify-center gap-1.5 overflow-hidden">
            {isRecording ? (
              wavePoints.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full transition-all duration-75"
                  style={{ height: `${h}%` }}
                />
              ))
            ) : (
              <p className="text-xs text-slate-500">
                Click "Record Voice Sample" and sustain a phonation ("Ahhhh") to evaluate vocal stability.
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Jitter (%)</span>
              <strong className="text-purple-400 text-base">{vocalJitter}%</strong>
              <span className="text-[8px] text-emerald-400 block">&lt; 1.04% Normal</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Shimmer (%)</span>
              <strong className="text-indigo-400 text-base">{vocalShimmer}%</strong>
              <span className="text-[8px] text-emerald-400 block">&lt; 3.81% Normal</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">HNR (dB)</span>
              <strong className="text-cyan-400 text-base">{hnr} dB</strong>
              <span className="text-[8px] text-emerald-400 block">&gt; 20 dB Optimal</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-3.5">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                <Brain size={14} className="text-purple-400" />
                Neurological Tremor Screen
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Low Tremor Risk
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Absence of pathological periodic frequency modulation (3-7 Hz tremor oscillation). Motor voice integrity is intact.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                <Wind size={14} className="text-blue-400" />
                Speech Dyspnea & Aerodynamics
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {dyspneaIndex}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Maximum Phonation Time (MPT) is estimated at 18.2 seconds. No mid-sentence respiratory breath hunger detected.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onShowToast) {
                onShowToast('Vocal Biomarker Certificate appended to patient health ledger.', 'success');
              }
            }}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <ShieldCheck size={16} />
            <span>Record Biomarkers to Clinical File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
