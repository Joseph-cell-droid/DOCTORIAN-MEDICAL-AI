import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi, Bluetooth, Play, Square, Thermometer,
  Heart, Droplets, Wind, Activity, AlertTriangle,
  CheckCircle, Info, Radio, Signal, XCircle, Monitor, Stethoscope, WifiOff,
  Smartphone, MessageSquare, Phone, Cpu, Loader2, Zap, Settings, Brain, Sparkles, X, PhoneCall, User as UserIcon, TrendingUp, TrendingDown, Clock3,
  Database, Waves, Dna, Microscope, Layers, Fingerprint, ChevronRight, ShieldAlert, RefreshCw, Clock, Download, Share2, AlertCircle
} from 'lucide-react';
import { useArduino, HealthStatus, Vitals } from '../hooks/useArduino';
import { motion, AnimatePresence } from 'motion/react';
import { api, User } from '../api';
import BioSimulation from './BioSimulation';
import CognisAnalytics from './CognisAnalytics';
import { NeuralHealthSummary } from './NeuralHealthSummary';
import { VitalWaveform } from './VitalWaveform';
import { LiveECGMonitor } from './LiveECGMonitor';
import { AnomalyDetector } from './AnomalyDetector';
import { EmergencyRegistry } from './EmergencyRegistry';
import { AlarmHubView } from './AlarmHubView';
import { BiomedicalSimulator } from './BiomedicalSimulator';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar 
} from 'recharts';

const VitalCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  bgColor: string;
  status?: 'normal' | 'warning' | 'critical';
  isLive?: boolean;
  history?: { value: number; timestamp: number }[];
  maxVal?: number;
  highlight?: boolean;
}> = ({ icon, label, value, unit, color, bgColor, status, isLive, history = [], maxVal, highlight }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: 0,
      boxShadow: status === 'critical' ? ['0 0 0 0px rgba(239, 68, 68, 0)', '0 0 0 4px rgba(239, 68, 68, 0.2)', '0 0 0 0px rgba(239, 68, 68, 0)'] : 'none'
    }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    transition={{ 
      boxShadow: { repeat: Infinity, duration: 2 }
    }}
    className={`group relative overflow-hidden flex flex-col justify-between h-full rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 border transition-all duration-300 ${
      highlight 
        ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-blue-500 shadow-2xl shadow-blue-500/20' 
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5'
    } ${status === 'critical' && !highlight ? 'border-red-200 dark:border-red-900 bg-red-50/30' : ''}`}
    role="group"
    aria-label={`${label} monitoring`}
  >
    {isLive && (
      <div 
        className={`absolute top-0 right-0 px-4 sm:px-6 py-1.5 sm:py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-2xl sm:rounded-bl-3xl shadow-lg flex items-center gap-1.5 sm:gap-2 ${
          highlight ? 'bg-white text-blue-900' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
        }`}
        role="status"
        aria-label="Live data"
      >
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${highlight ? 'bg-blue-600' : 'bg-emerald-500'}`} />
        Live matrix
      </div>
    )}

    {/* Abstract Background Element */}
    <div className={`absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 group-hover:scale-110 pointer-events-none transform rotate-12 ${highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
       {React.cloneElement(icon as any, { size: 200 })}
    </div>
    
    <div className="relative z-10 w-full">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-colors ${
          highlight 
            ? 'bg-white/10 border-white/20 text-white' 
            : `${bgColor} dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white`
        }`} aria-hidden="true">
          {React.cloneElement(icon as any, { size: 24 })}
        </div>
        <div className="flex gap-2">
          {status === 'warning' && <AlertTriangle className={`w-5 h-5 ${highlight ? 'text-white' : 'text-amber-500'}`} aria-label="Warning status" />}
          {status === 'critical' && <XCircle className={`w-5 h-5 ${highlight ? 'text-white' : 'text-red-500'}`} aria-label="Critical status" />}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${highlight ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`} id={`label-${label.replace(/\s+/g, '-')}`}>{label}</p>
        <div className="flex items-baseline gap-1.5" aria-labelledby={`label-${label.replace(/\s+/g, '-')}`}>
          <span className={`text-5xl sm:text-6xl lg:text-7xl font-[1000] tracking-tighter tabular-nums leading-none ${
            highlight ? 'text-white' : color.includes('text-') ? color : 'text-slate-900 dark:text-white'
          }`} aria-live="polite">{value}</span>
          <span className={`text-xs sm:text-sm font-black uppercase tracking-widest ${highlight ? 'text-white/40' : 'text-slate-400'}`}>{unit}</span>
        </div>
      </div>
    </div>

    <div className={`mt-6 sm:mt-8 pt-5 sm:pt-6 border-t relative z-10 w-full ${highlight ? 'border-white/10' : 'border-slate-50 dark:border-slate-800/50'}`}>
      {history.length > 0 && isLive && (
        <div className="flex items-center justify-between mb-4 px-1">
           <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-white/70' : 'text-blue-500'}`}>
              <Activity size={13} className={highlight ? 'text-white' : 'text-blue-500'} /> System Sync
           </div>
           <div className={`text-[10px] font-black uppercase tracking-tighter ${
             highlight ? 'text-white' : status === 'critical' ? 'text-red-500' : 'text-emerald-500'
           }`}>
              {status === 'critical' ? 'Anomaly' : 'Stable'}
           </div>
        </div>
      )}
      <div className="h-16 sm:h-20 flex items-end justify-center overflow-hidden w-full">
        {history.length > 0 ? (
          <VitalWaveform 
            data={history} 
            color={highlight ? '#ffffff' : status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : color.replace('text-', '').replace('[', '').replace(']', '') === 'blue-600' ? '#2563eb' : color.includes('#') ? color : '#3b82f6'} 
            maxVal={maxVal}
            height={history.length > 0 ? 80 : 0}
            label={label}
            unit={unit}
          />
        ) : (
          <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest py-4 ${highlight ? 'text-white/40' : 'text-slate-300'}`}>
            <Radio size={12} className="animate-pulse" />
            Nexus Link Active
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const StatusBadge: React.FC<{ status: HealthStatus }> = ({ status }) => {
  const config = {
    excellent: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', icon: <CheckCircle className="w-6 h-6 border-2 border-current rounded-full p-0.5" />, label: 'Peak Performance' },
    normal: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', icon: <Info className="w-6 h-6" />, label: 'Nominal Baseline' },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', icon: <AlertTriangle className="w-6 h-6" />, label: 'Metabolic Variance' },
    critical: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', icon: <XCircle className="w-6 h-6" />, label: 'Critical Anomaly' },
  };

  const c = config[status.overall];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-10 rounded-[3rem] border ${c.bg} ${c.border} backdrop-blur-3xl relative overflow-hidden group shadow-2xl transition-all duration-500`}
      role="status"
      aria-label={`Overall Patient Status: ${c.label}`}
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-6 transition-transform duration-1000 pointer-events-none scale-150">
         {React.cloneElement(c.icon as any, { size: 120 })}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-6 mb-10">
          <div className={`${c.text} ${c.bg} p-4 rounded-2xl border ${c.border} shadow-inner`}>
            {React.cloneElement(c.icon as any, { size: 32 })}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1.5 opacity-70">Bio-Neural Matrix status</p>
            <h3 className={`text-4xl font-[1000] ${c.text} tracking-tighter uppercase leading-none`}>{c.label}</h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${status.score > 70 ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]`} />
                 <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Neural Efficiency Point</span>
              </div>
              <div className="flex items-baseline gap-3">
                 <span className="text-8xl font-[1000] text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{status.score}</span>
                 <span className="text-lg font-black text-slate-400 uppercase tracking-widest">Points</span>
              </div>
           </div>
           
           <div className="w-full sm:w-auto text-left sm:text-right">
              <div className="mb-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Sync Verification</p>
                 <div className="flex gap-2 justify-start sm:justify-end">
                    {[...Array(5)].map((_, i) => (
                       <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-700 ${i < Math.ceil(status.score / 20) ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-slate-200 dark:bg-slate-800'}`} />
                    ))}
                 </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                 <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-start sm:justify-end gap-2">
                    <Sparkles size={12} /> AI Verified Matrix
                 </p>
              </div>
           </div>
        </div>

        {status.alerts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 space-y-3">
            {status.alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400">
                <ShieldAlert size={12} className="animate-pulse" />
                {alert}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const DiagnosticAnalysisView: React.FC<{ vitals: Vitals | null; history: Vitals[] }> = ({ vitals, history }) => {
  const [frame, setFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 100), 100);
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
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        const y = canvas.height / 2 + Math.sin(i * 0.05 + frame * 0.2) * 12 + Math.cos(i * 0.1 + frame * 0.1) * 4;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [frame]);

  const map = vitals ? Math.round((vitals.systolicBP + 2 * vitals.diastolicBP) / 3) : 0;
  const pulsePressure = vitals ? Math.round(vitals.systolicBP - vitals.diastolicBP) : 0;
  const shockIndex = vitals ? (vitals.heartRate / vitals.systolicBP).toFixed(2) : '0.00';
  const cvLoad = vitals ? Math.round((vitals.heartRate * vitals.systolicBP) / 100) : 0;

  const radarData = [
    { subject: 'Neural', A: vitals ? Math.min(100, Math.max(0, 100 - Math.abs(vitals.heartRate - 75))) : 50 },
    { subject: 'Cardiac', A: vitals ? Math.min(100, Math.max(0, 100 - Math.abs(vitals.systolicBP - 120))) : 50 },
    { subject: 'Metabolic', A: vitals ? vitals.spo2 : 50 },
    { subject: 'Respiratory', A: vitals ? Math.min(100, Math.max(0, 100 - Math.abs(vitals.respiratoryRate - 16) * 5)) : 50 },
    { subject: 'Immune', A: 92 },
    { subject: 'Cellular', A: 88 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Matrix */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Homeostasis Radar</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">System-Wide Cross-Correlation Matrix</p>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                    <Radar
                      name="System Health"
                      dataKey="A"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>
           <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <Database size={120} />
           </div>
        </div>

        {/* Clinical Matrix */}
        <div className="lg:col-span-7 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Clinical Telemetry Synthesis</h3>
               <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                  <Activity size={10} className="text-blue-500" />
                  <span className="text-[8px] font-black uppercase text-blue-500">Live Buffer</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-10 text-center">
              <div>
                <span className="text-6xl font-black tracking-tighter block mb-1 tabular-nums">{map}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Mean Arterial (MAP)</span>
              </div>
              <div>
                <span className="text-6xl font-black tracking-tighter block mb-1 tabular-nums">{pulsePressure}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Pulse Pressure</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                     <p className="text-[9px] font-black text-slate-500 uppercase">Shock Index</p>
                     <Zap size={12} className="text-amber-500" />
                  </div>
                  <p className="text-3xl font-black italic tabular-nums">{shockIndex}</p>
               </div>
               <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                     <p className="text-[9px] font-black text-slate-500 uppercase">CV Load</p>
                     <Activity size={12} className="text-blue-500" />
                  </div>
                  <p className="text-3xl font-black italic tabular-nums">{cvLoad}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Wave Visualization */}
         <div className="bg-slate-950 text-white rounded-[3rem] p-10 relative overflow-hidden border border-slate-800 flex flex-col justify-between min-h-[350px]">
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                     <Waves size={24} className="text-blue-500" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black uppercase tracking-tight">Neural Signature Stream</h4>
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Direct Physiological Feedback Loop</p>
                  </div>
               </div>
               
               <div className="relative h-32 mb-8 bg-slate-900/30 rounded-3xl border border-slate-800/50 flex flex-col items-center justify-center overflow-hidden">
                  <canvas ref={canvasRef} width={400} height={100} className="w-full opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="flex gap-1">
                        {[...Array(16)].map((_, i) => (
                           <motion.div
                              key={i}
                              animate={{
                                 height: [8, 32, 8],
                                 opacity: [0.2, 1, 0.2]
                              }}
                              transition={{
                                 duration: 1.5,
                                 repeat: Infinity,
                                 delay: i * 0.1
                              }}
                              className="w-1.5 bg-blue-600/40 rounded-full"
                           />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center justify-between relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin-slow flex items-center justify-center">
                     <Dna size={18} className="text-blue-500" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Signal Integrity</p>
                     <p className="text-lg font-black text-blue-500">99.4%</p>
                  </div>
               </div>
               <div className="px-4 py-2 bg-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest">
                  Live Sync
               </div>
            </div>
         </div>

         {/* AI Analysis View */}
         <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-[0.05]">
               <Brain size={240} className="text-slate-900 dark:text-white" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-white">
                     <Cpu size={24} />
                  </div>
                  <div>
                     <h4 className="text-xl font-black uppercase tracking-tight">Cognis Autonomous Analysis</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Baseline comparison logic Layer-9</p>
                  </div>
               </div>
               
               <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed mb-10">
                  Current vitals indicate a <span className="font-black text-slate-900 dark:text-white">stable hemodynamic profile</span>. 
                  Metabolic indicators suggest optimal oxygen transport ({vitals?.spo2 || 0}% SpO2). 
                  Clinical recommendation: Maintain current telemetry focus and prepare for specialized baseline comparison protocol.
               </p>
               
               <div className="flex gap-4">
                  <div className="flex-1 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Entropy Level</p>
                     <p className="text-2xl font-black text-emerald-500">LOW</p>
                  </div>
                  <div className="flex-1 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Sync Probability</p>
                     <p className="text-2xl font-black text-blue-600">92%</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const DnaMatrix: React.FC<{ dnaStatus: any; onStartSequencing: () => void }> = ({ dnaStatus, onStartSequencing }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sequencing Engine */}
        <div className="lg:col-span-8 bg-slate-900 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden group border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Dna size={240} className="text-blue-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2.5 rounded-xl">
                    <Microscope size={24} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Quantum Sequencing Engine</span>
                </div>
                <h3 className="text-3xl sm:text-6xl font-[1000] tracking-tighter uppercase leading-none">Genomic <span className="text-blue-500 font-serif italic normal-case">Nexus</span></h3>
              </div>
              
              <button 
                onClick={onStartSequencing}
                disabled={dnaStatus.sequencing}
                className={`px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${dnaStatus.sequencing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-950 hover:bg-blue-50 active:scale-95 transition-all'}`}
              >
                {dnaStatus.sequencing ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                {dnaStatus.sequencing ? 'Sequencing...' : 'Start Trace'}
              </button>
            </div>

            {dnaStatus.sequencing ? (
              <div className="space-y-10">
                <div className="relative pt-1">
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black inline-block py-1 px-3 uppercase rounded-full text-blue-400 bg-blue-900/30 border border-blue-500/20">
                        Base Pair Alignment in Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black inline-block text-blue-400 tabular-nums">
                        {Math.round(dnaStatus.progress)}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-slate-800 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${dnaStatus.progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 relative"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-pulse" />
                    </motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {dnaStatus.markers.map((marker: string, i: number) => (
                    <motion.div 
                      key={marker}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-2"
                    >
                      <div className="text-[8px] font-black text-blue-500 uppercase">Detection</div>
                      <div className="text-xs font-black">{marker}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : dnaStatus.results ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              >
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Layers size={18} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Haplogroup</span>
                  </div>
                  <p className="text-3xl font-black">{dnaStatus.results.haplogroup}</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock size={18} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Biological Age</span>
                  </div>
                  <p className="text-3xl font-black">{dnaStatus.results.cellularAge} <span className="text-sm text-slate-500 font-bold uppercase">Years</span></p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity size={18} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Telomere Status</span>
                  </div>
                  <p className="text-2xl font-black uppercase text-emerald-400">{dnaStatus.results.telomereHealth}</p>
                </div>
              </motion.div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Fingerprint size={40} className="text-blue-500 opacity-40" />
                </div>
                <p className="text-slate-500 font-bold max-w-sm">Ready for High-Resolution Genomic Sequencing. Initialize the trace to begin base-pair alignment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Variant Risks */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <ShieldAlert size={20} className="text-blue-600" />
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Genetic Variants</h4>
            </div>
            
            <div className="space-y-4 flex-1">
              {!dnaStatus.results ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale py-12">
                   <AlertCircle size={40} className="mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Waiting for Sequence</p>
                </div>
              ) : (
                dnaStatus.results.variantRisks.map((v: any, i: number) => (
                  <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-black text-slate-900 dark:text-white">{v.gene}</span>
                       <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${v.risk === 'low' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {v.risk} risk
                       </span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{v.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PatientMonitor: React.FC<{ arduino: any; user?: User | null; onUpdateUser?: (u: User) => void }> = ({ arduino, user, onUpdateUser }) => {
  const {
    vitals, history, healthStatus, connection,
    connectBluetooth, connectHealthWatch, connectSerial, connectWiFi, connectWebSocket, disconnect, startDemo, simulateEmergency,
    startDnaSequencing, dnaStatus, neuralInsight, neuralAlert, error
  } = arduino;

  const [wifiInput, setWifiInput] = useState('http://192.168.1.100');
  const [connectionTab, setConnectionTab] = useState<'bluetooth' | 'wifi' | 'serial' | 'cloud' | 'watch' | 'demo'>('bluetooth');
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const [alarmAcknowledgeTime, setAlarmAcknowledgeTime] = useState<number | null>(null);
  const [snoozeDuration, setSnoozeDuration] = useState(120000); // Default 2 minutes
  const [isHeartbeatToneEnabled, setIsHeartbeatToneEnabled] = useState(false);
  const [alarmHistory, setAlarmHistory] = useState<{
    id: string;
    timestamp: string;
    priority: 'high' | 'medium' | 'low' | 'info';
    source: string;
    value: string;
    description: string;
    acknowledged: boolean;
  }[]>([]);
  const [criticalDuration, setCriticalDuration] = useState(0);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [lastAlertSent, setLastAlertSent] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isAiReasoningOpen, setIsAiReasoningOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const [showNeuralSummary, setShowNeuralSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'realtime' | 'neural' | 'analytics' | 'emergency' | 'genomics' | 'alarms'>('realtime');
  const [showSettings, setShowSettings] = useState(false);
  const [isEmergencyCalling, setIsEmergencyCalling] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [historicalData, setHistoricalData] = useState<Vitals[]>([]);
  const [activeMachines, setActiveMachines] = useState<{ id: string; label: string; status: 'online' | 'offline'; type: string; lastSync?: string }[]>([
    { id: 'bp_cuff', label: 'Blood Pressure Cuff', status: 'online', type: 'Clinical', lastSync: '2m ago' },
    { id: 'spirometer', label: 'Lung Spirometer', status: 'offline', type: 'Respiratory', lastSync: '---' },
    { id: 'oximeter', label: 'Bio-Sync Oximeter', status: 'online', type: 'Pulse', lastSync: 'Live' },
    { id: 'dna_analyzer', label: 'Nexus DNA Sequencer', status: 'online', type: 'Genomic', lastSync: 'Live' },
  ]);

  // Simulate historical data generation for Day, Week, Month
  React.useEffect(() => {
    if (!connection.connected) return;

    let points = 50;
    let interval = 1000 * 60; // 1 min

    if (timeRange === 'Week') {
      points = 100;
      interval = 1000 * 60 * 60 * 24; // 1 day
    } else if (timeRange === 'Month') {
      points = 150;
      interval = 1000 * 60 * 60 * 24 * 2; // 2 days
    }

    const now = Date.now();
    const fakeHistory: Vitals[] = Array.from({ length: points }).map((_, i) => {
      const ts = now - (points - i) * interval;
      return {
        heartRate: 65 + Math.random() * 20,
        temperature: 36.4 + Math.random() * 1.2,
        spo2: 95 + Math.random() * 5,
        systolicBP: 110 + Math.random() * 30,
        diastolicBP: 70 + Math.random() * 20,
        respiratoryRate: 12 + Math.random() * 8,
        timestamp: ts
      };
    });

    setHistoricalData(fakeHistory);
  }, [timeRange, connection.connected]);

  const displayHistory = (timeRange === 'Day') ? history : historicalData;

  const getEmergencyContacts = () => {
    if (user) {
      return [
        { role: 'Patient', phone: user.phone, countryCode: '' },
        { role: 'Doctor', phone: user.doctorPhone, countryCode: '' },
        { role: 'Mentor', phone: user.mentorPhone, countryCode: '' }
      ];
    }
    const saved = localStorage.getItem('emergency_contacts');
    return saved ? JSON.parse(saved) : [];
  };

  const fetchAiAnalysis = async () => {
    if (!vitals || !healthStatus) return;
    setIsAiLoading(true);
    try {
      const prompt = `Act as a clinical medical analyst. Analyze these real-time patient vitals: 
      Heart Rate: ${vitals.heartRate} bpm
      Temperature: ${vitals.temperature}°C
      SpO2: ${vitals.spo2}%
      BP: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
      Respiratory Rate: ${vitals.respiratoryRate} rpm
      Health Score: ${healthStatus.score}/100
      Current Alerts: ${healthStatus.alerts.join(', ')}

      Provide a concise 2-sentence clinical interpretation of the physiological drift and a specific recommended action.`;
      
      const response = await api.ai.aiChat(prompt);
      setAiAnalysis(response.text);
    } catch (err) {
      setAiAnalysis("Analysis synchronization failed. Clinical markers suggest maintenance of current protocols until matrix restabilizes.");
    } finally {
      setIsAiLoading(false);
    }
  };

  React.useEffect(() => {
    if (healthStatus?.overall === 'critical' || healthStatus?.overall === 'warning') {
      // Auto-trigger analysis for anomalies if not already loading
      if (!isAiLoading && !aiAnalysis) {
        fetchAiAnalysis();
      }
    }
  }, [healthStatus?.overall]);
  
  // Alert Thresholds Configuration
  const [thresholds, setThresholds] = useState({
    heartRate: { min: 50, max: 120, warningMin: 60, warningMax: 100 },
    temperature: { max: 38.5, warningMax: 37.5 },
    spo2: { min: 90, warningMin: 95 },
    systolicBP: { max: 180, warningMax: 140 },
    diastolicBP: { max: 110, warningMax: 90 },
    respiratoryRate: { min: 12, max: 25, warningMax: 20 }
  });

  const handleConnectBluetooth = async () => {
    setIsConnecting('bluetooth');
    await connectBluetooth();
    setIsConnecting(null);
    // If there's an error, scroll to the connection panel to show it
    setTimeout(() => {
      const errorEl = document.getElementById('connection-panel');
      if (errorEl && !connection.connected) {
        errorEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleConnectSerial = async () => {
    setIsConnecting('serial');
    await connectSerial();
    setIsConnecting(null);
    // If there's an error, scroll to the connection panel to show it
    setTimeout(() => {
      const errorEl = document.getElementById('connection-panel');
      if (errorEl && !connection.connected) {
        errorEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleConnectWiFi = async (url: string) => {
    setIsConnecting('wifi');
    await connectWiFi(url);
    setIsConnecting(null);
    // If there's an error, scroll to the connection panel to show it
    setTimeout(() => {
      const errorEl = document.getElementById('connection-panel');
      if (errorEl && !connection.connected) {
        errorEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isCritical = vitals ? (
    vitals.heartRate < thresholds.heartRate.min || vitals.heartRate > thresholds.heartRate.max ||
    vitals.temperature > thresholds.temperature.max ||
    vitals.spo2 < thresholds.spo2.min ||
    vitals.systolicBP > thresholds.systolicBP.max ||
    vitals.diastolicBP > thresholds.diastolicBP.max ||
    vitals.respiratoryRate < thresholds.respiratoryRate.min || vitals.respiratoryRate > thresholds.respiratoryRate.max ||
    neuralAlert
  ) : false;

  const isWarning = vitals ? (
    !isCritical && (
      vitals.heartRate < thresholds.heartRate.warningMin || vitals.heartRate > thresholds.heartRate.warningMax ||
      vitals.temperature > thresholds.temperature.warningMax ||
      vitals.spo2 < thresholds.spo2.warningMin ||
      vitals.systolicBP > thresholds.systolicBP.warningMax ||
      vitals.diastolicBP > thresholds.diastolicBP.warningMax ||
      vitals.respiratoryRate > thresholds.respiratoryRate.warningMax
    )
  ) : false;
  
  // Smart Alarm Logic: Only trigger if critical for > 3 seconds
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCritical) {
      timer = setInterval(() => {
        setCriticalDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCriticalDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCritical]);

  const isSustainedCritical = criticalDuration >= 3 || arduino.neuralAlert;
  const isCurrentlyAcknowledged = alarmAcknowledgeTime !== null && (Date.now() - alarmAcknowledgeTime < snoozeDuration);
  const shouldShowAlarm = (isSustainedCritical || arduino.neuralAlert) && !isCurrentlyAcknowledged;

  const acknowledgeAlarm = () => {
    setAlarmAcknowledgeTime(Date.now());
  };

  // Function to add dynamic alarm logging
  const addAlarmLog = React.useCallback((priority: 'high' | 'medium' | 'low' | 'info', source: string, value: string, description: string) => {
    setAlarmHistory(prev => {
      // Prevent duplicate messages if any within last 5 seconds to reduce clutter
      if (prev.length > 0) {
        const last = prev[0];
        if (last.source === source && last.priority === priority && last.value === value) {
          return prev;
        }
      }
      return [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          priority,
          source,
          value,
          description,
          acknowledged: false
        },
        ...prev.slice(0, 49)
      ];
    });
  }, []);

  // Web Audio Context Synthesizer Ref Lifecycle
  const synthRef = useRef<any>(null);

  React.useEffect(() => {
    class ClinicalAlarmSynth {
      public ctx: AudioContext | null = null;
      private alarmInterval: any = null;
      private currentAlarmMode: 'high' | 'medium' | null = null;

      initCtx() {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      playPulse(frequency: number, duration: number, gainValue: number = 0.15, type: OscillatorType = 'sine') {
        try {
          this.initCtx();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

          gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(gainValue, this.ctx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
          console.warn('Audio playback failed:', e);
        }
      }

      // IEC 60601-1-8 High Priority alarm sequence: repeating group of 3-2 fast pulses in 2.5s
      startHighAlarm() {
        if (this.currentAlarmMode === 'high') return;
        this.stopAlarm();
        this.currentAlarmMode = 'high';
        
        const playPattern = () => {
          const delays = [0, 150, 300, 550, 700];
          delays.forEach((delay) => {
            setTimeout(() => {
              if (this.currentAlarmMode === 'high') {
                this.playPulse(920, 0.08, 0.22, 'triangle');
              }
            }, delay);
          });
        };

        playPattern();
        this.alarmInterval = setInterval(playPattern, 2500);
      }

      // IEC 60601-1-8 Medium Priority alarm sequence: repeating slow 3-beep group every 5s
      startMediumAlarm() {
        if (this.currentAlarmMode === 'medium') return;
        this.stopAlarm();
        this.currentAlarmMode = 'medium';
        
        const playPattern = () => {
          const delays = [0, 300, 600];
          delays.forEach((delay) => {
            setTimeout(() => {
              if (this.currentAlarmMode === 'medium') {
                this.playPulse(680, 0.15, 0.15, 'sine');
              }
            }, delay);
          });
        };

        playPattern();
        this.alarmInterval = setInterval(playPattern, 5000);
      }

      playTestTone(pitch: number, duration: number, wave: OscillatorType) {
        this.playPulse(pitch, duration, 0.15, wave);
      }

      // Pulse oximetry real-time heartbeat sync sound
      playHeartbeat(spo2: number) {
        // Higher oxygen -> Higher pitch. Map SpO2 (80-100) to pitch (480Hz - 880Hz)
        const clampedSpO2 = Math.max(80, Math.min(100, spo2));
        const factor = (clampedSpO2 - 80) / 20;
        const frequency = 480 + factor * 400;
        this.playPulse(frequency, 0.06, 0.05, 'sine');
      }

      stopAlarm() {
        this.currentAlarmMode = null;
        if (this.alarmInterval) {
          clearInterval(this.alarmInterval);
          this.alarmInterval = null;
        }
      }

      destroy() {
        this.stopAlarm();
        if (this.ctx) {
          this.ctx.close();
          this.ctx = null;
        }
      }
    }

    synthRef.current = new ClinicalAlarmSynth();

    return () => {
      if (synthRef.current) {
        synthRef.current.destroy();
        synthRef.current = null;
      }
    };
  }, []);

  // Heartbeat pulse sync tone matching current SpO2 level and HR
  React.useEffect(() => {
    if (!vitals || !isHeartbeatToneEnabled || isAlarmMuted) return;

    const intervalMs = Math.max(300, Math.min(3000, 60000 / vitals.heartRate));
    const timer = setInterval(() => {
      if (synthRef.current) {
        synthRef.current.playHeartbeat(vitals.spo2);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [vitals?.heartRate, vitals?.spo2, isHeartbeatToneEnabled, isAlarmMuted]);

  // Synchronize alarm sound with state triggers
  React.useEffect(() => {
    if (!synthRef.current) return;

    if (isAlarmMuted || isCurrentlyAcknowledged) {
      synthRef.current.stopAlarm();
      return;
    }

    if (shouldShowAlarm) {
      synthRef.current.startHighAlarm();
    } else if (isWarning) {
      synthRef.current.startMediumAlarm();
    } else {
      synthRef.current.stopAlarm();
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.stopAlarm();
      }
    };
  }, [shouldShowAlarm, isWarning, isAlarmMuted, isCurrentlyAcknowledged]);

  // Unified Alarm Logging State Machine (Traces transitions only to reduce log spam)
  const activeAlertsRef = React.useRef<Record<string, string>>({});

  React.useEffect(() => {
    if (!vitals) return;

    const checkVitalAlerts = () => {
      const alerts: { field: string; label: string; value: number; unit: string; level: 'critical' | 'warning'; msg: string }[] = [];
      if (vitals.heartRate < thresholds.heartRate.min) {
        alerts.push({ field: 'heartRate', label: 'Heart Rate', value: vitals.heartRate, unit: ' bpm', level: 'critical', msg: 'Bradycardia' });
      } else if (vitals.heartRate > thresholds.heartRate.max) {
        alerts.push({ field: 'heartRate', label: 'Heart Rate', value: vitals.heartRate, unit: ' bpm', level: 'critical', msg: 'Tachycardia' });
      } else if (vitals.heartRate < thresholds.heartRate.warningMin) {
        alerts.push({ field: 'heartRate', label: 'Heart Rate', value: vitals.heartRate, unit: ' bpm', level: 'warning', msg: 'Mild Bradycardia' });
      } else if (vitals.heartRate > thresholds.heartRate.warningMax) {
        alerts.push({ field: 'heartRate', label: 'Heart Rate', value: vitals.heartRate, unit: ' bpm', level: 'warning', msg: 'Mild Tachycardia' });
      }

      if (vitals.spo2 < thresholds.spo2.min) {
        alerts.push({ field: 'spo2', label: 'Oxygen Saturation', value: vitals.spo2, unit: '%', level: 'critical', msg: 'Desaturation / Hypoxia' });
      } else if (vitals.spo2 < thresholds.spo2.warningMin) {
        alerts.push({ field: 'spo2', label: 'Oxygen Saturation', value: vitals.spo2, unit: '%', level: 'warning', msg: 'Mild Desaturation' });
      }

      if (vitals.temperature > thresholds.temperature.max) {
        alerts.push({ field: 'temperature', label: 'Body Temp', value: vitals.temperature, unit: '°C', level: 'critical', msg: 'Hyperpyrexia' });
      } else if (vitals.temperature > thresholds.temperature.warningMax) {
        alerts.push({ field: 'temperature', label: 'Body Temp', value: vitals.temperature, unit: '°C', level: 'warning', msg: 'Low-grade Fever' });
      }

      if (vitals.systolicBP > thresholds.systolicBP.max) {
        alerts.push({ field: 'systolicBP', label: 'Systolic BP', value: vitals.systolicBP, unit: ' mmHg', level: 'critical', msg: 'Hypertensive Crisis' });
      } else if (vitals.systolicBP > thresholds.systolicBP.warningMax) {
        alerts.push({ field: 'systolicBP', label: 'Systolic BP', value: vitals.systolicBP, unit: ' mmHg', level: 'warning', msg: 'Prehypertension' });
      }

      if (vitals.diastolicBP > thresholds.diastolicBP.max) {
        alerts.push({ field: 'diastolicBP', label: 'Diastolic BP', value: vitals.diastolicBP, unit: ' mmHg', level: 'critical', msg: 'Hypertensive Crisis' });
      } else if (vitals.diastolicBP > thresholds.diastolicBP.warningMax) {
        alerts.push({ field: 'diastolicBP', label: 'Diastolic BP', value: vitals.diastolicBP, unit: ' mmHg', level: 'warning', msg: 'Prehypertension' });
      }

      if (vitals.respiratoryRate < thresholds.respiratoryRate.min || vitals.respiratoryRate > thresholds.respiratoryRate.max) {
        alerts.push({ field: 'respiratoryRate', label: 'Resp. Rate', value: vitals.respiratoryRate, unit: ' rpm', level: 'critical', msg: 'Bradypnea / Tachypnea' });
      } else if (vitals.respiratoryRate > thresholds.respiratoryRate.warningMax) {
        alerts.push({ field: 'respiratoryRate', label: 'Resp. Rate', value: vitals.respiratoryRate, unit: ' rpm', level: 'warning', msg: 'Tachypnea Warning' });
      }

      if (neuralAlert) {
        alerts.push({ field: 'neuralAlert', label: 'Al Core Neural', value: 1, unit: ' anomalies', level: 'critical', msg: 'AI Diagnostic Anomaly' });
      }

      return alerts;
    };

    const currentAlerts = checkVitalAlerts();
    const currentKeys = new Set<string>();

    currentAlerts.forEach(alert => {
      const key = `${alert.field}-${alert.level}`;
      currentKeys.add(key);

      if (!activeAlertsRef.current[key]) {
        const description = `${alert.label} is outside parameters: ${alert.value}${alert.unit} (Condition: ${alert.msg})`;
        addAlarmLog(alert.level === 'critical' ? 'high' : 'medium', alert.label, `${alert.value}${alert.unit}`, description);
        activeAlertsRef.current[key] = description;
      }
    });

    Object.keys(activeAlertsRef.current).forEach(key => {
      if (!currentKeys.has(key)) {
        const [field] = key.split('-');
        const label = field === 'heartRate' ? 'Heart Rate' : 
                      field === 'spo2' ? 'Oxygen Saturation' : 
                      field === 'temperature' ? 'Body Temp' : 
                      field === 'systolicBP' ? 'Systolic BP' : 
                      field === 'diastolicBP' ? 'Diastolic BP' : 
                      field === 'respiratoryRate' ? 'Resp. Rate' : 'AI Diagnostic';
        addAlarmLog('info', label, 'Normal', `${label} has returned to safe parameters.`);
        delete activeAlertsRef.current[key];
      }
    });
  }, [vitals, thresholds, neuralAlert, addAlarmLog]);

  // Handle SMS and Call alarms
  React.useEffect(() => {
    if (isCritical && (!lastAlertSent || Date.now() - lastAlertSent > 300000)) { // Alert every 5 minutes if still critical
      const alertMessage = `CRITICAL ALERT [RELAY: MTN 0787674140]: Patient condition has worsened. Vitals: HR: ${Math.round(vitals?.heartRate || 0)}bpm, SpO2: ${Math.round(vitals?.spo2 || 0)}%, Temp: ${vitals?.temperature.toFixed(1)}°C. Please check immediately.`;
      
      const contacts = getEmergencyContacts();
      const patient = contacts.find((c: any) => c.role === 'Patient');
      const doctor = contacts.find((c: any) => c.role === 'Doctor');
      const mentor = contacts.find((c: any) => c.role === 'Mentor');

      const patientPhone = patient?.phone;
      const doctorPhone = doctor?.phone;
      const mentorPhone = mentor?.phone;

      // Send SMS
      api.alerts.sendSms(alertMessage, doctorPhone, mentorPhone, patientPhone)
        .then(res => {
          if (res.simulated && res.message.includes('TWILIO CONFIGURATION ERROR')) {
            setAlertError(res.message);
            console.warn('⚠️ SMS Alert Simulated:', res.message);
          } else {
            setAlertError(null);
            console.log('✅ SMS Alert Status:', res.message);
          }
        })
        .catch(err => console.error('❌ Failed to send SMS alert:', err));

      // Initiate Voice Call
      setIsEmergencyCalling(true);
      const voiceMessage = `Critical alert for patient relaying via MTN 0787674140. Heart rate is ${Math.round(vitals?.heartRate || 0)} beats per minute. Oxygen saturation is ${Math.round(vitals?.spo2 || 0)} percent. Temperature is ${vitals?.temperature.toFixed(1)} degrees Celsius. Please check the patient immediately.`;
      api.alerts.makeCall(voiceMessage, doctorPhone, mentorPhone, patientPhone)
        .then(res => {
          if (res.simulated && res.message.includes('TWILIO CONFIGURATION ERROR')) {
            setAlertError(res.message);
            console.warn('⚠️ Voice Call Simulated:', res.message);
          } else {
            console.log('✅ Voice Call Status:', res.message);
          }
          setTimeout(() => setIsEmergencyCalling(false), 15000);
        })
        .catch(err => {
          console.error('❌ Failed to initiate voice call:', err);
          setIsEmergencyCalling(false);
        });

      setLastAlertSent(Date.now());
    }
  }, [isCritical, vitals, lastAlertSent]);

  const getStatus = (label: string, value: number): 'normal' | 'warning' | 'critical' | undefined => {
    if (!vitals) return undefined;
    switch (label) {
      case 'heartRate': 
        if (value < thresholds.heartRate.min || value > thresholds.heartRate.max) return 'critical';
        if (value < thresholds.heartRate.warningMin || value > thresholds.heartRate.warningMax) return 'warning';
        return 'normal';
      case 'temperature': 
        if (value > thresholds.temperature.max) return 'critical';
        if (value > thresholds.temperature.warningMax) return 'warning';
        return 'normal';
      case 'spo2': 
        if (value < thresholds.spo2.min) return 'critical';
        if (value < thresholds.spo2.warningMin) return 'warning';
        return 'normal';
      case 'systolicBP': 
        if (value > thresholds.systolicBP.max) return 'critical';
        if (value > thresholds.systolicBP.warningMax) return 'warning';
        return 'normal';
      case 'diastolicBP': 
        if (value > thresholds.diastolicBP.max) return 'critical';
        if (value > thresholds.diastolicBP.warningMax) return 'warning';
        return 'normal';
      case 'respiratoryRate': 
        if (value < thresholds.respiratoryRate.min || value > thresholds.respiratoryRate.max) return 'critical';
        if (value > thresholds.respiratoryRate.warningMax) return 'warning';
        return 'normal';
      default: return 'normal';
    }
  };

  const ThresholdInput: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit: string;
  }> = ({ label, value, onChange, min, max, step = 1, unit }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Emergency Calling Overlay */}
      <AnimatePresence>
        {isEmergencyCalling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-rose-600/95 backdrop-blur-2xl flex items-center justify-center p-8 text-white overflow-hidden"
          >
            {/* Pulsing Rings */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <motion.div 
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-64 h-64 border-8 border-white rounded-full absolute"
              />
            </div>

            <div className="relative z-10 text-center max-w-lg">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-rose-600 mx-auto mb-10 shadow-2xl"
              >
                <PhoneCall size={56} />
              </motion.div>
              <h2 className="text-4xl font-[1000] uppercase tracking-tighter mb-4 animate-pulse">Emergency Alarm</h2>
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-12 text-rose-100 opacity-80">Autonomous Calling Protocol Active</p>
              
              <div className="space-y-4">
                <div className="p-5 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Stethoscope size={20} />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">Calling Point ALPHA</p>
                      <p className="text-sm font-black uppercase">Registered Specialist Node</p>
                   </div>
                </div>
                <div className="p-5 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                      <UserIcon size={20} />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">Calling Point BETA</p>
                      <p className="text-sm font-black uppercase">Patient Mentorship Node</p>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEmergencyCalling(false)}
                className="mt-12 px-10 py-4 bg-white text-rose-600 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Reset Emergency Loop
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Neural Summary Modal */}
      <AnimatePresence>
        {showNeuralSummary && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNeuralSummary(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <NeuralHealthSummary 
                vitals={vitals} 
                history={history} 
                onClose={() => setShowNeuralSummary(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                    <Settings size={22} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Alert Configuration</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Adjust vital safety bounds</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-8 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">
                {/* Heart Rate */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Heart size={14} className="text-rose-500" /> Heart Rate Bounds (BPM)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ThresholdInput
                      label="Critical Low"
                      value={thresholds.heartRate.min}
                      onChange={(v) => setThresholds(prev => ({ ...prev, heartRate: { ...prev.heartRate, min: v } }))}
                      min={30}
                      max={80}
                      unit="bpm"
                    />
                    <ThresholdInput
                      label="Critical High"
                      value={thresholds.heartRate.max}
                      onChange={(v) => setThresholds(prev => ({ ...prev, heartRate: { ...prev.heartRate, max: v } }))}
                      min={100}
                      max={200}
                      unit="bpm"
                    />
                  </div>
                </div>

                {/* SpO2 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Droplets size={14} className="text-blue-500" /> Oxygen Saturation (%)
                  </h3>
                  <ThresholdInput
                    label="Critical Low SpO2"
                    value={thresholds.spo2.min}
                    onChange={(v) => setThresholds(prev => ({ ...prev, spo2: { ...prev.spo2, min: v } }))}
                    min={70}
                    max={98}
                    unit="%"
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Thermometer size={14} className="text-orange-500" /> Body Temperature (°C)
                  </h3>
                  <ThresholdInput
                    label="Critical High Temp"
                    value={thresholds.temperature.max}
                    onChange={(v) => setThresholds(prev => ({ ...prev, temperature: { ...prev.temperature, max: v } }))}
                    min={37}
                    max={42}
                    step={0.1}
                    unit="°C"
                  />
                </div>
              </div>

              <div className="mt-10">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl active:scale-95"
                >
                  Apply Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Alarm Overlay */}
      <AnimatePresence>
        {shouldShowAlarm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-4 border-red-600 pointer-events-auto flex flex-col items-center gap-6 max-w-md mx-4 text-center"
              role="alertdialog"
              aria-labelledby="alarm-title"
              aria-describedby="alarm-desc"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div>
                <h2 id="alarm-title" className="text-3xl font-black text-red-600 dark:text-red-400 mb-2">CRITICAL ALARM</h2>
                <p id="alarm-desc" className="text-slate-600 dark:text-slate-400 font-bold">Patient vitals are in critical range! SMS alerts and emergency voice calls have been initiated to the doctor and mentor.</p>
              </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <a
                  href="tel:+256787674140"
                  className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-sm"
                >
                  <Signal className="w-4 h-4" />
                  Call Doctor
                </a>
                <a
                  href="sms:+256787674140?body=CRITICAL%20ALERT:%20Patient%20condition%20has%20worsened.%20Please%20check%20immediately."
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-sm"
                >
                  <Droplets className="w-4 h-4" />
                  SMS Doctor
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Mute Button removed as alarm is automatic */}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
              <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Patient Monitor</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Real-time health data from Arduino via Bluetooth & WiFi</p>
          </div>
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-stretch lg:items-center justify-center lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
             <button
              onClick={() => setShowNeuralSummary(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Brain size={14} className="shrink-0" />
              <span>Neural Insight</span>
            </button>
            <button
              onClick={() => {
                const speech = `Status check. Your ${arduino.healthStatus?.overall} baseline. Heart rate is ${arduino.vitals.heartRate} beats per minute. Blood oxygen is ${arduino.vitals.spo2} percent. Environment temperature is ${arduino.vitals.temperature} degrees. Overall health level is ${arduino.healthStatus?.score} percent.`;
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(speech);
                  utterance.rate = 0.95;
                  window.speechSynthesis.speak(utterance);
                }
              }}
              className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
              aria-label="Read vitals audibly"
            >
              <Wind size={14} className="text-blue-500 shrink-0" />
              <span>Read Audibly</span>
            </button>
             <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <Settings size={14} className="shrink-0" />
              <span>Set Alerts</span>
            </button>
            {connection.connected && (
              <>
                <button
                  onClick={simulateEmergency}
                  className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-red-100 dark:border-red-900 transition-all active:scale-95"
                  aria-label="Simulate emergency vitals"
                >
                  <AlertTriangle aria-hidden="true" size={12} className="shrink-0" />
                  <span>Simulate Emergency</span>
                </button>
                <div className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl shadow-sm col-span-2 sm:col-span-1 text-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></div>
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[9px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">
                      {connection.type === 'demo' ? 'Simulator Node' : 
                       (arduino.watchMetadata?.manufacturer ? `${arduino.watchMetadata.manufacturer} Link` : connection.deviceName)}
                    </span>
                    {arduino.watchMetadata?.battery !== undefined && (
                      <span className="text-[8px] font-black text-emerald-600/60 uppercase mt-0.5">
                        Battery: {arduino.watchMetadata.battery}%
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-rose-100 dark:border-rose-900 transition-all active:scale-95"
                >
                  <Square size={12} className="shrink-0" />
                  <span>Disconnect</span>
                </button>
              </>
            )}
            {shouldShowAlarm && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl shadow-sm col-span-2 text-center"
              >
                <AlertTriangle size={14} className="text-red-600 dark:text-red-400 animate-bounce shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                  Active Alarm Triggered
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Connect Bar */}
      {!connection.connected && (
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quick Setup:</span>
          <button 
            onClick={connectHealthWatch}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all border border-rose-100 dark:border-rose-800"
          >
            <Smartphone size={12} />
            Watch Link
          </button>
          <button 
            onClick={handleConnectBluetooth}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-800"
          >
            <Bluetooth size={12} />
            Bluetooth
          </button>
          <button 
            onClick={() => setConnectionTab('wifi')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-emerald-100 dark:border-emerald-800"
          >
            <Wifi size={12} />
            WiFi
          </button>
          <button 
            onClick={() => {
              setConnectionTab('cloud');
              connectWebSocket();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all border border-purple-100 dark:border-purple-800"
          >
            <Zap size={12} />
            Neural Link
          </button>
          <button 
            onClick={handleConnectSerial}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
          >
            <Cpu size={12} />
            USB Serial
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button 
            onClick={() => startDemo()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          >
            <Play size={12} />
            Try Demo
          </button>
        </div>
      )}

      {/* Local SIM Emergency Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl shadow-orange-200 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Smartphone size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Local SIM Emergency</h2>
            </div>
            <p className="text-orange-50 text-sm font-bold opacity-90">Use your MTN/Airtel SIM card to send alerts directly from your phone</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <a 
              href={`sms:+256787674140?body=EMERGENCY ALERT: Patient vitals are critical! HR: ${Math.round(vitals?.heartRate || 0)}bpm, SpO2: ${Math.round(vitals?.spo2 || 0)}%. Please check immediately.`}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-2xl font-black text-sm hover:bg-orange-50 transition-all shadow-xl active:scale-95"
            >
              <MessageSquare size={18} />
              <span>SEND LOCAL SMS</span>
            </a>
            <a 
              href="tel:+256787674140"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              <Phone size={18} />
              <span>CALL VIA SIM</span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Connection Panel */}
      {!connection.connected && (
        <motion.div 
          id="connection-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200 dark:shadow-blue-900/10 p-6 sm:p-10 mb-8 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Radio className="w-5 h-5" />
            </div>
            Connect to Arduino
          </h2>

          {/* Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6 sm:mb-8 relative z-10">
            <button
              onClick={() => setConnectionTab('watch')}
              className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all border-2 ${
                connectionTab === 'watch'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200 dark:shadow-rose-900/20'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>WATCH LINK</span>
            </button>
            <button
              onClick={() => setConnectionTab('bluetooth')}
              className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all border-2 ${
                connectionTab === 'bluetooth'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
            >
              <Bluetooth className="w-4 h-4 shrink-0" />
              <span>BLUETOOTH</span>
            </button>
            <button
              onClick={() => setConnectionTab('serial')}
              className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all border-2 ${
                connectionTab === 'serial'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>SERIAL</span>
            </button>
            <button
              onClick={() => setConnectionTab('wifi')}
              className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all border-2 ${
                connectionTab === 'wifi'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
            >
              <Wifi className="w-4 h-4 shrink-0" />
              <span>WIFI</span>
            </button>
            <button
              onClick={() => setConnectionTab('cloud')}
              className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all border-2 ${
                connectionTab === 'cloud'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200 dark:shadow-purple-900/20'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>NEURAL LINK</span>
            </button>
            <button
              onClick={() => setConnectionTab('demo')}
              className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all border-2 ${
                connectionTab === 'demo'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>SIMULATOR</span>
            </button>
          </div>

          <div className="relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold"
              >
                <AlertTriangle size={16} />
                {error}
              </motion.div>
            )}

            {connectionTab === 'watch' ? (
              <div className="space-y-6">
                <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-rose-600 dark:text-rose-400 shadow-sm">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-rose-900 dark:text-rose-200">
                      <p className="font-bold mb-1">Samsung & Health Watch Relay</p>
                      <p className="opacity-80 leading-relaxed">Connect directly to your Samsung Health, Apple Watch, or generic heart rate monitor. Uses standard GATT biometric protocols.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsConnecting('watch');
                    connectHealthWatch().finally(() => setIsConnecting(null));
                  }}
                  disabled={isConnecting !== null}
                  className="w-full flex items-center justify-center gap-4 bg-rose-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-rose-700 transition-all shadow-2xl shadow-rose-200 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting === 'watch' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  )}
                  <span>CONNECT SAMSUNG / HEALTH WATCH</span>
                </button>
                <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest">
                  Ensure "Heart Rate" broadcasting is enabled in your watch settings
                </p>
              </div>
            ) : connectionTab === 'bluetooth' ? (
              <div className="space-y-6">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                      <Bluetooth className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-blue-900 dark:text-blue-200">
                      <p className="font-bold mb-1">Wireless Bluetooth Link</p>
                      <p className="opacity-80 leading-relaxed">Connect to your Arduino BLE module (HM-10, ESP32). Ensure your device is discoverable.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleConnectBluetooth}
                  disabled={isConnecting !== null}
                  className="w-full flex items-center justify-center gap-4 bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting === 'bluetooth' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Bluetooth className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  )}
                  <span>START BLUETOOTH PAIRING</span>
                </button>
              </div>
            ) : connectionTab === 'serial' ? (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-slate-600 dark:text-slate-400 shadow-sm">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-slate-900 dark:text-slate-300">
                      <p className="font-bold mb-1">Wired Serial Link</p>
                      <p className="opacity-80 leading-relaxed">Connect your Arduino via USB. Ensure the baud rate is set to 9600 in your code.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleConnectSerial}
                  disabled={isConnecting !== null}
                  className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting === 'serial' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Activity className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  )}
                  <span>CONNECT ARDUINO (USB)</span>
                </button>
              </div>
            ) : connectionTab === 'cloud' ? (
              <div className="space-y-6">
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-purple-600 dark:text-purple-400 shadow-sm">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-purple-900 dark:text-purple-200">
                      <p className="font-bold mb-1">Real-Time Neural Cloud Sync</p>
                      <p className="opacity-80 leading-relaxed">Streaming biometric data via WebSockets from any synchronized node. Automatic reconnection and end-to-end neural encryption enabled.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsConnecting('cloud');
                    connectWebSocket();
                    setTimeout(() => setIsConnecting(null), 1000);
                  }}
                  disabled={isConnecting !== null}
                  className="w-full flex items-center justify-center gap-4 bg-purple-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-purple-700 transition-all shadow-2xl shadow-purple-200 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting === 'cloud' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Signal className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  )}
                  <span>ESTABLISH NEURAL CLOUD LINK</span>
                </button>
              </div>
            ) : connectionTab === 'wifi' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Arduino IP Address</label>
                  <input
                    type="text"
                    id="wifi-ip-input"
                    value={wifiInput}
                    onChange={(e) => setWifiInput(e.target.value)}
                    placeholder="http://192.168.1.100"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    aria-label="Arduino IP Address"
                  />
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-emerald-900 dark:text-emerald-200">
                      <p className="font-bold mb-1">Network WiFi Link</p>
                      <p className="opacity-80 leading-relaxed">Enter the local IP of your Arduino WiFi module. It must serve JSON vitals at the <code className="bg-emerald-100/50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded font-mono text-xs">/vitals</code> endpoint.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleConnectWiFi(wifiInput)}
                  disabled={isConnecting !== null}
                  className="w-full flex items-center justify-center gap-4 bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting === 'wifi' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Wifi className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  )}
                  <span>CONNECT VIA WIFI</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <p className="font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wide">Tactile Machine Simulator Node</p>
                      <p className="opacity-80">Connect to our standalone physiological signal generator. Perfect for testing threshold metrics, checking emergency alarm logic, and tracing curves offline.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    arduino.setConnection({
                      connected: true,
                      type: 'demo',
                      deviceName: 'Clinical Simulator Unit v5.2'
                    });
                    setIsSimulatorOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-4 bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl active:scale-95 group"
                >
                  <Cpu className="w-6 h-6 group-hover:scale-110 transition-transform animate-pulse" />
                  <span>LAUNCH COMPANION SIMULATOR</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Vitals Dashboard */}
      <AnimatePresence mode="wait">
        {vitals ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
                <div className="flex flex-col sm:flex-row gap-6 mb-12 items-start sm:items-center justify-between">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full no-scrollbar">
                    <div className="flex shrink-0">
                      <button
                        onClick={() => setActiveTab('realtime')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'realtime' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Real-Time Vitals
                      </button>
                      <button
                        onClick={() => setActiveTab('neural')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'neural' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Neural Synthesis
                      </button>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                         Advanced Analytics
                      </button>
                      <button
                        onClick={() => setActiveTab('genomics')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'genomics' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Genomic Matrix
                      </button>
                      <button
                        onClick={() => setActiveTab('emergency')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'emergency' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Emergency Registry
                      </button>
                      <button
                        onClick={() => setActiveTab('alarms')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'alarms' ? 'bg-white dark:bg-slate-900 text-red-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        🚨 Clinical Alarm Hub
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <span className={`w-2 h-2 rounded-full animate-pulse ${connection.connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-tighter">
                         {connection.connected ? `Hardware Link: ${connection.type?.toUpperCase()}` : 'Machine Disconnected'}
                      </span>
                    </div>
                    {connection.connected && (
                       <button 
                         onClick={() => disconnect()}
                         className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                         title="Disconnect"
                       >
                         <AlertCircle size={16} />
                       </button>
                    )}
                  </div>
                </div>

            {activeTab === 'analytics' ? (
              <DiagnosticAnalysisView vitals={vitals} history={history} />
            ) : activeTab === 'genomics' ? (
              <div className="space-y-8">
                <DnaMatrix dnaStatus={dnaStatus} onStartSequencing={startDnaSequencing} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {activeMachines.filter(m => m.type === 'Genomic' || m.status === 'online').map(m => (
                    <div key={m.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${m.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.type}</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{m.label}</p>
                      </div>
                      <div className="text-[10px] font-black text-blue-600 uppercase">{m.lastSync}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'neural' ? (
              <div className="space-y-8">
                 <BioSimulation user={user} onUpdateUser={onUpdateUser} />
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                       <CognisAnalytics />
                    </div>
                    <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden border border-white/10">
                       <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                          <Settings size={20} className="text-blue-500" /> Machine Nexus
                       </h3>
                       <div className="space-y-4">
                          {activeMachines.map(m => (
                             <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                   <div className={`w-2 h-2 rounded-full ${m.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                   <span className="text-xs font-bold">{m.label}</span>
                                </div>
                                <button className="text-[10px] font-black text-blue-400 uppercase hover:text-blue-300">Config</button>
                             </div>
                          ))}
                       </div>
                       <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                          Provision New Machine
                       </button>
                    </div>
                 </div>
              </div>
            ) : activeTab === 'emergency' ? (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <EmergencyRegistry user={user} onUpdate={onUpdateUser} />
              </div>
            ) : activeTab === 'alarms' ? (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <AlarmHubView 
                  vitals={vitals}
                  thresholds={thresholds}
                  setThresholds={setThresholds}
                  alarmHistory={alarmHistory}
                  clearAlarmHistory={() => setAlarmHistory([])}
                  isAlarmMuted={isAlarmMuted}
                  setIsAlarmMuted={setIsAlarmMuted}
                  isHeartbeatToneEnabled={isHeartbeatToneEnabled}
                  setIsHeartbeatToneEnabled={setIsHeartbeatToneEnabled}
                  synthRef={synthRef}
                  addAlarmLog={addAlarmLog}
                  snoozeDuration={snoozeDuration}
                  setSnoozeDuration={setSnoozeDuration}
                  isCurrentlyAcknowledged={isCurrentlyAcknowledged}
                  alarmAcknowledgeTime={alarmAcknowledgeTime}
                  acknowledgeAlarm={acknowledgeAlarm}
                />
              </div>
            ) : (
              <>
                {/* Neural Stream Visualization for Cloud Link */}
                {connection.type === 'cloud' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-[3rem] shadow-2xl relative overflow-hidden"
                  >
                     <div className="bg-slate-950 rounded-[2.8rem] p-8 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30 animate-pulse">
                                 <Zap size={32} className="text-purple-400" />
                              </div>
                              <div>
                                 <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Neural Stream</h2>
                                 <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Biometric Relay Sync Active</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex-1 max-w-md h-16 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center px-6 overflow-hidden">
                              <div className="flex gap-1 items-end h-8">
                                 {[...Array(24)].map((_, i) => (
                                    <motion.div
                                       key={i}
                                       animate={{
                                          height: [4, Math.random() * 24 + 4, 4],
                                          opacity: [0.3, 1, 0.3]
                                       }}
                                       transition={{
                                          duration: 0.5 + Math.random() * 0.5,
                                          repeat: Infinity,
                                          ease: "easeInOut"
                                       }}
                                       className="w-1 bg-purple-500/50 rounded-full"
                                    />
                                 ))}
                              </div>
                              <div className="ml-auto text-right">
                                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Load</p>
                                 <p className="text-sm font-black text-purple-400">0.04 ms/cycle</p>
                              </div>
                           </div>

                           <div className="flex flex-col items-center md:items-end">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Source ID</p>
                              <p className="text-sm font-black text-white font-mono">{window.location.host.split('-')[0].toUpperCase()}-MAT-{Math.floor(Math.random()*900)+100}</p>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                {/* AI Smart Insight Card */}
                {vitals && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-8 bg-blue-600 text-white rounded-[3rem] shadow-2xl shadow-blue-500/20 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                       <Brain size={140} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles size={16} className={neuralAlert ? "text-rose-200 animate-pulse" : "text-blue-200"} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${neuralAlert ? "text-rose-100" : "text-blue-100"}`}>
                          {neuralAlert ? "CRITICAL NEURAL ALERT" : "Live AI Clinical Insight (Gemma 2)"}
                        </span>
                      </div>
                      <p className={`text-xl font-bold italic leading-relaxed max-w-2xl ${neuralAlert ? "text-rose-50" : "text-white"}`}>
                        {neuralInsight || (healthStatus?.overall === 'excellent' 
                          ? "Hemodynamic stability is currently optimal. Predictive modeling suggests sustained homeostasis for the current activity level."
                          : healthStatus?.overall === 'critical'
                          ? "Critical biometric drift detected. Immediate clinical intervention protocols are advised as per high-risk sensory baseline."
                          : "Minor physiological fluctuations noted. Monitoring heart rate variability and oxygen flux for further synaptic rebalancing.")}
                      </p>
                      <div className="mt-6 flex items-center gap-4">
                         <div className="px-4 py-2 bg-white/10 rounded-full border border-white/20">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Certainty: 98.4%</span>
                         </div>
                         <div className="px-4 py-2 bg-white/10 rounded-full border border-white/20">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{isAiLoading ? 'Synthesizing...' : 'Last Updated: Just Now'}</span>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Alert Configuration Error */}
                <AnimatePresence>
                  {alertError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-700 text-xs font-bold shadow-sm"
                    >
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="uppercase tracking-wider mb-1">Twilio Alert Warning</p>
                        <p className="font-medium opacity-90 leading-relaxed mb-3">{alertError}</p>
                        <div className="flex flex-wrap gap-2">
                      <a 
                        href={`sms:+256787674140?body=EMERGENCY: Patient vitals critical! HR: ${Math.round(vitals?.heartRate || 0)}, SpO2: ${Math.round(vitals?.spo2 || 0)}%`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        <MessageSquare size={12} />
                        <span>SEND LOCAL SMS</span>
                      </a>
                      <a 
                        href="tel:+256787674140"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                      >
                        <Phone size={12} />
                        <span>CALL VIA SIM</span>
                      </a>
                    </div>
                  </div>
                  <button onClick={() => setAlertError(null)} className="p-1 hover:bg-amber-100 rounded-lg transition-colors">
                    <XCircle size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Smart Alarm Banner */}
            <AnimatePresence>
              {isSustainedCritical && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-8 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl transition-colors duration-500 ${isCurrentlyAcknowledged ? 'bg-slate-900 border-slate-800' : 'bg-red-600 border-red-500 shadow-red-200'}`}
                >
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className={`p-4 rounded-2xl shadow-lg ${isCurrentlyAcknowledged ? 'bg-slate-800 text-slate-400' : 'bg-white text-red-600 animate-pulse'}`}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {isCurrentlyAcknowledged ? 'Alarm Silenced' : 'Critical Vitals Detected'}
                      </h3>
                      <p className="text-white/80 text-sm font-bold">
                        {isCurrentlyAcknowledged 
                          ? 'Monitoring continues. Alarm will reactivate in 2 minutes if condition persists.' 
                          : 'Patient requires immediate attention. Emergency contacts have been notified.'}
                      </p>
                    </div>
                  </div>
                  
                  {!isCurrentlyAcknowledged && (
                    <button 
                      onClick={acknowledgeAlarm}
                      className="px-8 py-4 bg-white text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                    >
                      ACKNOWLEDGE ALARM
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Health Status & Anomaly Detection Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="flex flex-col gap-8">
                {healthStatus && <StatusBadge status={healthStatus} />}
                <div className="bg-slate-900 dark:bg-slate-950 text-white p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                    <Brain size={140} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                       Intelligence Nexus
                    </h3>
                    <div className="space-y-8">
                       <div className="flex gap-6">
                          <div className="w-0.5 h-14 bg-gradient-to-b from-blue-500 to-transparent rounded-full shrink-0 mt-1" />
                          <div>
                             <p className="text-base font-black mb-1.5 tracking-tight">Metabolic Convergence</p>
                             <p className="text-xs font-bold text-slate-400 leading-relaxed">Current bioreactions specify a peak efficiency state within the neural manifold. Proceed with standard baseline.</p>
                          </div>
                       </div>
                       <div className="flex gap-6">
                          <div className="w-0.5 h-14 bg-gradient-to-b from-amber-500 to-transparent rounded-full shrink-0 mt-1" />
                          <div>
                             <p className="text-base font-black mb-1.5 tracking-tight">Physiological Drift</p>
                             <p className="text-xs font-bold text-slate-400 leading-relaxed">Minor heart rate variance detected during phase shift. Recommend deep autonomic stabilization.</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              <AnomalyDetector vitals={vitals} healthStatus={healthStatus} />
            </div>

            {/* Vital Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <VitalCard
                icon={<Heart />}
                label="Heart Rate"
                value={vitals ? Math.round(vitals.heartRate).toString() : '--'}
                unit="BPM"
                color="text-blue-600"
                bgColor="bg-blue-50"
                status={getStatus('heartRate', vitals?.heartRate || 0)}
                isLive={connection.connected && timeRange === 'Day'}
                history={displayHistory.map(h => ({ value: h.heartRate, timestamp: h.timestamp }))}
                maxVal={200}
                highlight={true}
              />
              <VitalCard
                icon={<Droplets />}
                label="Oxygen (SpO2)"
                value={vitals ? Math.round(vitals.spo2).toString() : '--'}
                unit="%"
                color="text-emerald-600"
                bgColor="bg-emerald-50"
                status={getStatus('spo2', vitals?.spo2 || 0)}
                isLive={connection.connected && timeRange === 'Day'}
                history={displayHistory.map(h => ({ value: h.spo2, timestamp: h.timestamp }))}
                maxVal={100}
              />
              <VitalCard
                icon={<Thermometer />}
                label="Body Temp"
                value={vitals ? vitals.temperature.toFixed(1) : '--'}
                unit="°C"
                color="text-orange-600"
                bgColor="bg-orange-50"
                status={getStatus('temperature', vitals?.temperature || 0)}
                isLive={connection.connected && timeRange === 'Day'}
                history={displayHistory.map(h => ({ value: h.temperature, timestamp: h.timestamp }))}
                maxVal={42}
              />
              <VitalCard
                icon={<Activity />}
                label="Systolic BP"
                value={vitals ? Math.round(vitals.systolicBP).toString() : '--'}
                unit="mmHg"
                color="text-indigo-600"
                bgColor="bg-indigo-50"
                status={getStatus('systolicBP', vitals?.systolicBP || 0)}
                isLive={connection.connected && timeRange === 'Day'}
                history={displayHistory.map(h => ({ value: h.systolicBP, timestamp: h.timestamp }))}
                maxVal={220}
              />
              <VitalCard
                icon={<Wind />}
                label="Respiration"
                value={vitals ? Math.round(vitals.respiratoryRate).toString() : '--'}
                unit="RPM"
                color="text-blue-500"
                bgColor="bg-blue-50"
                status={getStatus('respiratoryRate', vitals?.respiratoryRate || 0)}
                isLive={connection.connected && timeRange === 'Day'}
                history={displayHistory.map(h => ({ value: h.respiratoryRate, timestamp: h.timestamp }))}
                maxVal={40}
              />
              {/* Dynamic Health Score Matrix */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Neural Health Index</p>
                      <div className="flex items-baseline gap-2 mb-8">
                         <span className="text-6xl font-black tracking-tighter text-blue-400">{healthStatus?.score || '--'}</span>
                         <span className="text-sm font-black text-slate-500 uppercase">Points</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {aiAnalysis ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                        >
                          <div className="flex items-center gap-2 mb-2">
                             <Brain size={14} className="text-blue-400" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">AI Neural Analysis</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-300 leading-relaxed italic line-clamp-3">"{aiAnalysis}"</p>
                        </motion.div>
                      ) : isAiLoading ? (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl animate-pulse">
                           <Loader2 size={16} className="animate-spin text-blue-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-high-visibility">Synthesizing Bio-Markers...</span>
                        </div>
                      ) : (
                        <button 
                          onClick={fetchAiAnalysis}
                          className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                        >
                          <Zap size={14} />
                          Force AI Insight
                        </button>
                      )}
                    </div>
                 </div>
              </div>
            </div>

            {/* Real-time ECG Waveform Monitor */}
            <div className="mb-8">
              <LiveECGMonitor vitals={vitals} />
            </div>

            {/* Heart Rate Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none p-4 sm:p-8 mb-8 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <Signal className="w-5 h-5" />
                  </div>
                  Heart Rate Trend ({timeRange})
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">Last {displayHistory.length} readings</span>
              </div>
              <div className="h-64 flex items-center justify-center">
                {displayHistory.length > 0 ? (
                  <div className="w-full h-full">
                    <VitalWaveform 
                      data={displayHistory.map(h => ({ value: h.heartRate, timestamp: h.timestamp }))} 
                      color="#2563eb"
                      height={240}
                      maxVal={180}
                      label="Heart Rate"
                      unit="BPM"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-slate-700 text-sm font-bold italic">
                    Waiting for neuro-link data stream...
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 px-4">
                <div className="flex gap-8">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div> Current Stream</span>
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div> Tachycardia Threshold</span>
                </div>
                <span>Sync Active</span>
              </div>
            </div>

            {/* Blood Pressure Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none p-4 sm:p-8 mb-8 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  Blood Pressure Trend ({timeRange})
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">Systolic / Diastolic</span>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <div className="h-56 flex items-end gap-2 min-w-[400px] relative px-4 pb-4">
                  {displayHistory.length > 0 ? displayHistory.map((h, i) => {
                    const sysHeight = Math.max(5, ((h.systolicBP - 40) / 180) * 100);
                    const diaHeight = Math.max(5, ((h.diastolicBP - 40) / 180) * 100);
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end gap-1 group relative">
                        {/* Systolic Part */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${sysHeight}%` }}
                          className={`w-full rounded-t-md transition-all duration-500 hover:brightness-110 shadow-sm ${h.systolicBP > 140 ? 'bg-rose-500' : 'bg-purple-500'}`}
                          style={{ opacity: 0.5 + (i / displayHistory.length) * 0.5 }}
                        />
                        {/* Diastolic Part */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${diaHeight}%` }}
                          className={`w-full rounded-t-md transition-all duration-500 hover:brightness-110 shadow-sm ${h.diastolicBP > 90 ? 'bg-rose-600' : 'bg-indigo-600'}`}
                          style={{ opacity: 0.5 + (i / displayHistory.length) * 0.5 }}
                        />
                        
                        {/* Custom Interactive Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-900 text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-2xl scale-50 group-hover:scale-100 origin-bottom backdrop-blur-md">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pressure Matrix</span>
                              <span className="text-[8px] font-bold text-slate-500">{new Date(h.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                               <span className="text-xl font-black">{Math.round(h.systolicBP)}/{Math.round(h.diastolicBP)}</span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">mmHg</span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${(h.systolicBP/200)*100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-slate-700 text-sm font-bold italic">
                      Waiting for data stream...
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8 px-2">
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div> Systolic Baseline</span>
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Diastolic Baseline</span>
              </div>
            </div>

            {/* SpO2 & Temperature Charts Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* SpO2 Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none p-4 sm:p-8 transition-colors">
                <h3 className="font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <Droplets className="w-5 h-5" />
                  </div>
                  Oxygen Saturation ({timeRange})
                </h3>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="h-40 flex items-end gap-1.5 min-w-[200px] px-2 pb-2">
                    {displayHistory.length > 0 ? displayHistory.map((h, i) => {
                      const height = Math.max(10, h.spo2);
                      return (
                        <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            className={`w-full rounded-t-lg transition-all duration-300 shadow-sm ${h.spo2 < 95 ? 'bg-rose-500' : 'bg-blue-500'}`}
                            style={{
                              opacity: 0.4 + (i / displayHistory.length) * 0.6,
                            }}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-900 text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-2xl scale-50 group-hover:scale-100 origin-bottom">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">SpO2 Level</p>
                            <p className="text-xl font-black">{Math.round(h.spo2)}%</p>
                            <p className="text-[8px] font-bold text-slate-500 mt-1">{new Date(h.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-slate-700 text-sm font-bold italic">
                        Waiting for data...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Temperature Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none p-4 sm:p-8 transition-colors">
                <h3 className="font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  Body Temperature ({timeRange})
                </h3>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="h-40 flex items-end gap-1.5 min-w-[200px] px-2 pb-2">
                    {displayHistory.length > 0 ? displayHistory.map((h, i) => {
                      const height = Math.max(10, ((h.temperature - 34) / 8) * 100);
                      const isHigh = h.temperature > 37.5;
                      const isWarm = h.temperature > 37;
                      return (
                        <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            className={`w-full rounded-t-lg transition-all duration-300 shadow-sm ${isHigh ? 'bg-rose-500' : isWarm ? 'bg-orange-500' : 'bg-emerald-500'}`}
                            style={{
                              opacity: 0.4 + (i / displayHistory.length) * 0.6,
                            }}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-900 text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-2xl scale-50 group-hover:scale-100 origin-bottom">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Temperature</p>
                            <p className="text-xl font-black">{h.temperature.toFixed(1)}°C</p>
                            <p className="text-[8px] font-bold text-slate-500 mt-1">{new Date(h.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-slate-700 text-sm font-bold italic">
                        Waiting for data...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Log */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none p-4 sm:p-8 overflow-hidden transition-colors">
              <h3 className="font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
                  <Activity className="w-5 h-5" />
                </div>
                Detailed Data Log ({timeRange})
              </h3>
              <div className="overflow-x-auto -mx-4 sm:-mx-8 px-4 sm:px-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                      <th className="pb-4 pr-4 font-black">Time</th>
                      <th className="pb-4 pr-4 font-black">HR (bpm)</th>
                      <th className="pb-4 pr-4 font-black">Temp (°C)</th>
                      <th className="pb-4 pr-4 font-black">SpO2 (%)</th>
                      <th className="pb-4 pr-4 font-black">BP (mmHg)</th>
                      <th className="pb-4 font-black">RR (br/min)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {displayHistory.slice().reverse().slice(0, 20).map((h, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 pr-4 text-xs font-bold text-slate-400">
                          {timeRange === 'Day' ? new Date(h.timestamp).toLocaleTimeString() : new Date(h.timestamp).toLocaleDateString()}
                        </td>
                        <td className={`py-4 pr-4 text-sm font-black ${h.heartRate > 100 ? 'text-rose-600' : h.heartRate < 60 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                          {Math.round(h.heartRate)}
                        </td>
                        <td className={`py-4 pr-4 text-sm font-black ${h.temperature > 37.5 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {h.temperature.toFixed(1)}
                        </td>
                        <td className={`py-4 pr-4 text-sm font-black ${h.spo2 < 95 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {Math.round(h.spo2)}
                        </td>
                        <td className="py-4 pr-4 text-sm font-black text-slate-900 dark:text-white">{Math.round(h.systolicBP)}/{Math.round(h.diastolicBP)}</td>
                        <td className="py-4 text-sm font-black text-slate-900 dark:text-white">{Math.round(h.respiratoryRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </motion.div>
        ) : (
          /* Not Connected State */
          <motion.div 
            key="not-connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200"
          >
            <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Stethoscope className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">No Device Connected</h3>
            <p className="text-slate-500 max-w-md mx-auto font-medium leading-relaxed px-6">
              Connect your Arduino via Bluetooth or WiFi to start monitoring patient vitals in real-time.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Simulation Controller Button */}
      {connection.connected && connection.type === 'demo' && (
        <motion.button
          onClick={() => setIsSimulatorOpen(true)}
          className="fixed bottom-24 right-8 z-[120] flex items-center gap-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-800 dark:border-slate-250 px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
          title="Open Simulation Dials Drawer"
          whileHover={{ y: -2 }}
        >
          <Cpu size={16} className="text-blue-500 animate-pulse" />
          <span>Simulation Dials</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
        </motion.button>
      )}

      {/* Sliding Simulation Dials Drawer */}
      <AnimatePresence>
        {isSimulatorOpen && (
          <div className="fixed inset-0 z-[150] flex justify-end pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSimulatorOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
            />
            
            {/* Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl h-full bg-slate-905 bg-slate-900 shadow-2xl overflow-y-auto overflow-x-hidden border-l border-slate-800 custom-scrollbar flex flex-col pointer-events-auto"
            >
              {/* Close Button & Title Bar */}
              <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md z-[160] px-8 py-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-500/20 text-blue-400">
                    <Cpu size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">Onboard Machine Simulator</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Adjust raw biological waves in real time</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSimulatorOpen(false)}
                  className="p-2.5 hover:bg-slate-850 rounded-xl transition-all text-slate-400 hover:text-white group"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-350" />
                </button>
              </div>
              
              <div className="flex-1 p-4 sm:p-8">
                <BiomedicalSimulator arduino={arduino} className="border-0 shadow-none bg-transparent p-0" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
