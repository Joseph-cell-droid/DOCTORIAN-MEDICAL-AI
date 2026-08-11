import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { SafeResponsiveContainer } from './SafeResponsiveContainer';
import { 
  Activity, 
  Brain, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Dna, 
  Target, 
  BarChart3,
  Waves,
  Workflow
} from 'lucide-react';

export default function CognisAnalytics() {
  const [activity, setActivity] = useState<number[]>(Array(24).fill(0).map(() => Math.random() * 100));
  const [status, setStatus] = useState('Syncing');
  const [activeBrainRegion, setActiveBrainRegion] = useState<string | null>(null);

  const forecastData = Array(12).fill(0).map((_, i) => ({
    time: `${i * 2}h`,
    load: 40 + Math.random() * 40,
    capacity: 90 + Math.random() * 10
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setActivity(prev => {
        const next = [...prev.slice(1), Math.random() * 100];
        return next;
      });
      const statuses = ['Analyzing', 'Processing', 'Decoding', 'Calibrating'];
      setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-white min-h-[600px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
            <Brain className="text-blue-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Cognis Pathway Analytics</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{status} ... v8.4.2_DELTA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Link Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Connection Map */}
        <div className="lg:col-span-8 bg-slate-900/50 rounded-[3rem] border border-slate-800 p-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12">
              <div>
                 <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">Cognis Synaptic Interface</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Real-time Neural Mapping: Cortex-7</p>
              </div>
              <div className="flex gap-4">
                 {['Alpha', 'Beta', 'Gamma'].map((wave, mapIdx_80) => (
                   <div key={`cognisanalytics-l82-${mapIdx_80}`} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400">
                      {wave} Range
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="h-80 flex items-center justify-center relative">
              {/* Simulated Nodes with brain labels */}
              {[
                { label: 'Frontal', x: 20, y: 30 },
                { label: 'Parietal', x: 50, y: 20 },
                { label: 'Temporal', x: 40, y: 60 },
                { label: 'Occipital', x: 80, y: 50 },
                { label: 'Prefrontal', x: 15, y: 55 }
              ].map((node, i) => (
                <motion.div
                  key={`cognisanalytics-l99-i-${i}`}
                  onHoverStart={() => setActiveBrainRegion(node.label)}
                  onHoverEnd={() => setActiveBrainRegion(null)}
                  animate={{
                    scale: activeBrainRegion === node.label ? 1.4 : [1, 1.1, 1],
                    boxShadow: activeBrainRegion === node.label ? '0 0 20px #2563eb' : '0 0 0px #000'
                  }}
                  className={`absolute p-4 rounded-2xl border transition-all cursor-crosshair z-20 ${
                    activeBrainRegion === node.label 
                      ? 'bg-blue-600 border-blue-400' 
                      : 'bg-slate-950 border-slate-800 group-hover:border-slate-700'
                  }`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                   <p className={`text-[8px] font-black uppercase tracking-widest ${activeBrainRegion === node.label ? 'text-white' : 'text-slate-500'}`}>
                      {node.label}
                   </p>
                </motion.div>
              ))}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full bg-blue-600/5 border border-blue-500/10 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-blue-600/5 border border-blue-500/10 flex items-center justify-center">
                    <Brain size={60} className="text-blue-500/20" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-2 pointer-events-none">
                <span className="text-6xl font-[1000] tracking-tighter block text-white drop-shadow-2xl">98.4%</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Coherence baseline</span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-4 gap-4">
               {[
                 { label: 'Entropy', val: '1.24 bits' },
                 { label: 'Plasticity', val: 'High' },
                 { label: 'Sync Rate', val: '40 Hz' },
                 { label: 'Density', val: '98%' }
               ].map((stat, i) => (
                 <div key={`cognisanalytics-l140-i-${i}`} className="text-center">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xs font-black text-white">{stat.val}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Real-time Waveform / Load Forecast */}
        <div className="lg:col-span-4 bg-slate-900/50 rounded-[3rem] border border-slate-800 p-10 flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">load forecast</h3>
             <BarChart3 size={16} className="text-blue-500" />
          </div>
          
          <div className="flex-1 min-h-[300px] w-full">
             <SafeResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                   <XAxis dataKey="time" hide />
                   <YAxis hide domain={[0, 100]} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff', fontSize: '10px', fontWeight: 900 }}
                     itemStyle={{ color: '#2563eb' }}
                   />
                   <Line type="monotone" dataKey="load" stroke="#2563eb" strokeWidth={3} dot={false} strokeLinecap="round" />
                   <Line type="monotone" dataKey="capacity" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
             </SafeResponsiveContainer>
          </div>

          <div className="mt-8 space-y-6">
             <div className="p-6 bg-slate-950 rounded-[2rem] border border-slate-800">
                <div className="flex justify-between items-end mb-4">
                   <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Peak Prediction</p>
                      <p className="text-xl font-black text-white italic">14:00 Delta</p>
                   </div>
                   <div className="text-right text-emerald-500 font-bold text-xs">+12% Efficient</div>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                   <div className="w-[85%] h-full bg-blue-600 rounded-full shadow-[0_0_10px_#2563eb]" />
                </div>
             </div>
             
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <Workflow size={14} className="text-slate-500" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Auto-Rebalance active</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             </div>
          </div>
        </div>
      </div>

      {/* Insight Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Cognitive Load', val: 'Low', icon: <Zap size={14} />, color: 'text-amber-500' },
          { label: 'Cognis Integrity', val: 'Optimal', icon: <ShieldCheck size={14} />, color: 'text-emerald-500' },
          { label: 'Dna Synthesis', val: 'Active', icon: <Dna size={14} />, color: 'text-blue-500' },
          { label: 'Focus Index', val: '8.4', icon: <Target size={14} />, color: 'text-purple-500' },
        ].map((item, i) => (
          <div key={`cognisanalytics-l205-i-${i}`} className="p-6 bg-slate-900/30 rounded-3xl border border-slate-800/50 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{item.label}</p>
              <p className="text-sm font-black uppercase tracking-tight">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Protocols & Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Active Biological Protocols</h4>
          <div className="space-y-3">
            {[
              { title: 'Cognis Baseline Sync', desc: 'Calibrating synaptic firing rates to circadian rhythms.', status: 'Complete' },
              { title: 'Metabolic Optimization', desc: 'Adjusting glucose uptake efficiency for cognitive-load.', status: 'Active' },
              { title: 'Dopamine Regulation', desc: 'Monitoring reward-pathway stability during focus.', status: 'Standby' },
            ].map((p, i) => (
              <div key={`cognisanalytics-l227-i-${i}`} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between group cursor-default">
                <div>
                  <p className="text-sm font-black uppercase tracking-tight text-slate-200">{p.title}</p>
                  <p className="text-[10px] font-medium text-slate-500">{p.desc}</p>
                </div>
                <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">
                  {p.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Cognis-Clinical Library</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20 hover:bg-blue-600/20 transition-all cursor-pointer group">
              <BarChart3 className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-black uppercase tracking-widest leading-tight">Historical Data Analytics</p>
            </div>
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group">
              <Workflow className="text-slate-500 mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-black uppercase tracking-widest leading-tight">Cognis Modeling Suite</p>
            </div>
          </div>
        </div>
      </div>

      {/* Descriptive Content & Bio-Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/10 h-min">
          <h4 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2">
            <Waves size={14} /> Diagnostic Insight Summary
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl font-medium mb-6">
            The Cognis Pathway Analytic engine detects high synaptic coherence across the frontal cortex. 
            Biological markers suggest optimal metabolic processing. Recommended protocol: Maintain current 
            cognitive engagement and initiate cognitive-regeneration baseline for the next 24-hour cycle.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">
              Generate PDF Report
            </button>
            <button className="px-6 py-3 bg-slate-900 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-800 hover:border-slate-700 transition-colors">
              Export Synapse Data
            </button>
          </div>
        </div>

        <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Live Bio-Sequence</h4>
          <div className="space-y-4 font-mono text-[10px]">
            {['ATCCGTAG', 'GCTTAGCA', 'TAGCCTAG', 'CATGCTAG'].map((seq, i) => (
              <div key={`cognisanalytics-l283-i-${i}`} className="flex justify-between items-center py-2 border-b border-slate-800/50">
                <span className="text-blue-500 font-black">CHRM_{i+1}</span>
                <span className="text-slate-300 tracking-widest">{seq}...</span>
                <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">MATCH</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
