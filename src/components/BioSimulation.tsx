import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  Zap, 
  Activity, 
  Microscope, 
  Database, 
  RefreshCw,
  Cpu,
  Layers,
  Waves,
  Fingerprint,
  Brain
} from 'lucide-react';

import { api } from '../api';
import { parseResponseCredits } from '../utils/creditUtils';

export default function BioSimulation({ user, onUpdateUser }: { user?: any, onUpdateUser?: (u: any) => void }) {
  const [frame, setFrame] = useState(0);
  const [simulationState, setSimulationState] = useState('Stable');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncInsight, setSyncInsight] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleBioSync = async () => {
    setIsSyncing(true);
    setSyncInsight(null);
    try {
      const prompt = "Act as the Bio-Core Intelligence. Provide a brief (2-sentence) neural synchronization insight based on the current system baseline. Focus on synaptic integrity and metabolic flux.";
      const res = await api.ai.aiChat(prompt, "You are the Bio-Core Intelligence node.");
      setSyncInsight(res.text);
      if (res && 'creditsRemaining' in res && res.creditsRemaining !== undefined && user && onUpdateUser) {
        onUpdateUser({ ...user, credits: parseResponseCredits(res.creditsRemaining) });
      }
    } catch (err) {
      console.error("Bio-sync failed:", err);
      setSyncInsight("Neural link desynchronized. Biometric stream requires recalibration.");
    } finally {
      setIsSyncing(false);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 100);
      if (Math.random() > 0.95) {
        setSimulationState(Math.random() > 0.5 ? 'Calibrating' : 'Optimizing');
        setTimeout(() => setSimulationState('Stable'), 2000);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        const y = canvas.height / 2 + Math.sin(i * 0.05 + frame * 0.2) * 15 + Math.cos(i * 0.1 + frame * 0.1) * 5;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [frame]);

  return (
    <div className="p-4 sm:p-8 bg-slate-950 text-white min-h-[450px] sm:min-h-[500px] flex flex-col font-sans relative overflow-hidden group rounded-[2.5rem] border border-slate-900 shadow-xl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 sm:p-12 opacity-5 pointer-events-none">
        <Fingerprint size={240} className="sm:w-[300px] sm:h-[300px]" />
      </div>
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e40af 1px, transparent 0)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="relative z-10 flex flex-col h-full grow">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
              <Microscope className="text-blue-500" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Biological Synthesis Core</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{simulationState}... Iteration {frame}</p>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                <RefreshCw size={10} className="animate-spin text-blue-400" />
                <span className="text-[8px] font-black uppercase text-blue-400">Live Stream</span>
             </div>
          </div>
        </div>

        {/* Dynamic Wave Visualization */}
        <div className="relative h-32 sm:h-48 mb-6 sm:mb-8 bg-slate-900/30 rounded-3xl border border-slate-800/50 flex flex-col items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} width={400} height={100} className="w-full opacity-60" />
          <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none">
             <div className="flex gap-0.5 sm:gap-1">
               {[...Array(16)].map((_, i) => (
                 <motion.div
                   key={i}
                   animate={{
                     height: [8, 32, 8],
                     opacity: [0.2, 0.8, 0.2]
                   }}
                   transition={{
                     duration: 1.5,
                     repeat: Infinity,
                     delay: i * 0.05
                   }}
                   className="w-1 bg-blue-600/45 rounded-full"
                 />
               ))}
             </div>
          </div>
          <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 flex items-center gap-2">
            <Waves size={10} className="text-blue-500" />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500">Signal Integrity: 99.4%</span>
          </div>
        </div>

        {/* DNA Helix visualization (smaller/refined) */}
        <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
           <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin-slow flex items-center justify-center shrink-0">
               <Dna size={16} className="text-blue-500 sm:w-5 sm:h-5" />
           </div>
           <div className="flex-1 min-w-0">
               <div className="flex justify-between mb-1">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Genomic Sequencing</span>
                  <span className="text-[8px] sm:text-[9px] font-black text-blue-500 uppercase">Active</span>
               </div>
               <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ width: ['20%', '80%', '20%'] }} 
                   transition={{ duration: 10, repeat: Infinity }}
                   className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                 />
               </div>
           </div>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 grow">
          <div className="p-4 sm:p-6 bg-slate-900/50 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Cpu size={12} className="text-blue-500 sm:w-3.5 sm:h-3.5" />
              <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase">Process Load</span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter tabular-nums">42.8%</span>
              <div className="flex gap-0.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i < 3 ? 'bg-blue-600' : 'bg-slate-850'}`} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 bg-slate-900/50 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Layers size={12} className="text-purple-500 sm:w-3.5 sm:h-3.5" />
              <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase">Cognis Layers</span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter tabular-nums text-white">LX-9</span>
              <p className="text-[7px] sm:text-[8px] font-bold text-slate-600 uppercase tracking-widest truncate">Auto Sync</p>
            </div>
          </div>
        </div>

        {/* Insight Display */}
        <AnimatePresence>
          {syncInsight && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-600/10 rounded-2xl sm:rounded-[2rem] border border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain size={12} className="text-blue-500 sm:w-3.5 sm:h-3.5" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase text-blue-500 tracking-widest">Core Insight</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-300 italic leading-relaxed">
                "{syncInsight}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <button 
          onClick={handleBioSync}
          disabled={isSyncing}
          className="mt-6 sm:mt-8 group/btn relative overflow-hidden w-full py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 border border-blue-500/50 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
          {isSyncing ? (
            <>Syncing Neural Nodes <RefreshCw size={12} className="animate-spin" /></>
          ) : (
            <>Sync Bio-Core Intelligence <Zap size={12} fill="currentColor" /></>
          )}
        </button>
      </div>
    </div>
  );
}
