import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi, Bluetooth, Play, Square, Thermometer,
  Heart, Droplets, Wind, Activity, AlertTriangle,
  CheckCircle, Info, Radio, Signal, XCircle, Monitor, Stethoscope, WifiOff,
  Smartphone, MessageSquare, Phone, Cpu, Loader2, Zap, Settings, Brain, Sparkles, X, PhoneCall, User as UserIcon, TrendingUp, TrendingDown, Clock3,
  Database, Waves, Dna, Microscope, Layers, Fingerprint, ChevronRight, ShieldAlert, ShieldCheck, RefreshCw, Clock, Download, Share2, AlertCircle
} from 'lucide-react';
import { useArduino, HealthStatus, Vitals } from '../hooks/useArduino';
import { motion, AnimatePresence } from 'motion/react';
import { api, User } from '../api';
import { DoctorVerificationModal } from './DoctorVerificationModal';
import BioSimulation from './BioSimulation';
import CognisAnalytics from './CognisAnalytics';
import { NeuralHealthSummary } from './NeuralHealthSummary';
import { VitalWaveform } from './VitalWaveform';
import { LiveECGMonitor } from './LiveECGMonitor';
import { AnomalyDetector } from './AnomalyDetector';
import { ClinicalCoPilotPanel } from './ClinicalCoPilotPanel';
import { EmergencyRegistry } from './EmergencyRegistry';
import { AlarmHubView } from './AlarmHubView';
import { BiomedicalSimulator } from './BiomedicalSimulator';
import { HistoricalTelemetryChart } from './HistoricalTelemetryChart';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, Cell, Legend
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
  customIndicator?: React.ReactNode;
}> = ({ icon, label, value, unit, color, bgColor, status, isLive, history = [], maxVal, highlight, customIndicator }) => (
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
        {customIndicator && (
          <div className="mt-1">
            {customIndicator}
          </div>
        )}
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

  const rawMap = vitals ? Math.round((vitals.systolicBP + 2 * vitals.diastolicBP) / 3) : 0;
  const map = isNaN(rawMap) ? 0 : rawMap;

  const rawPulsePressure = vitals ? Math.round(vitals.systolicBP - vitals.diastolicBP) : 0;
  const pulsePressure = isNaN(rawPulsePressure) ? 0 : rawPulsePressure;

  const rawShockIndex = (vitals && vitals.systolicBP) ? (vitals.heartRate / vitals.systolicBP) : 0;
  const shockIndex = (isNaN(rawShockIndex) || !isFinite(rawShockIndex)) ? '0.00' : rawShockIndex.toFixed(2);

  const rawCvLoad = vitals ? Math.round((vitals.heartRate * vitals.systolicBP) / 100) : 0;
  const cvLoad = isNaN(rawCvLoad) ? 0 : rawCvLoad;

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
  const [connectionTab, setConnectionTab] = useState<'bluetooth' | 'wifi' | 'serial' | 'cloud' | 'watch'>('bluetooth');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem('doctorian_is_admin');
    return saved === 'true';
  });
  const [adminPin, setAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [isAlarmMuted, setIsAlarmMuted] = useState(true);
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
  const [activeTab, setActiveTab] = useState<'realtime' | 'neural' | 'analytics' | 'emergency' | 'genomics' | 'alarms' | 'registry' | 'simulator'>('realtime');
  
  // Custom Patient & Bed Allocator Registry System
  interface RegisteredPatient {
    id: string;
    name: string;
    bedNumber: string;
    age: string;
    gender: string;
    weight: string;
    bloodType: string;
    phone: string;
    doctorPhone: string;
    mentorPhone: string;
    conditions: string;
    allergies: string;
    vitalsPreset: 'healthy' | 'warning' | 'critical';
  }

  const defaultPatients: RegisteredPatient[] = [
    {
      id: 'patient-joseph',
      name: 'Joseph Brian Obote',
      bedNumber: 'Bed B-01 (Ward A)',
      age: '35',
      gender: 'Male',
      weight: '74',
      bloodType: 'O+',
      phone: '+256787674140',
      doctorPhone: '+256787674140',
      mentorPhone: '+256787674140',
      conditions: 'Controlled Hypertension, Recovering malaria',
      allergies: 'Sulfa Drugs',
      vitalsPreset: 'healthy'
    },
    {
      id: 'patient-sarah',
      name: 'Nakato Sarah Mukasa',
      bedNumber: 'Bed B-02 (ICU-Maternity)',
      age: '29',
      gender: 'Female',
      weight: '68',
      bloodType: 'A-',
      phone: '+256787674140',
      doctorPhone: '+256787674140',
      mentorPhone: '+256787674140',
      conditions: 'Severe Postpartum Preeclampsia, Respiratory Distress',
      allergies: 'Penicillin, NSAIDs',
      vitalsPreset: 'critical'
    },
    {
      id: 'patient-ronald',
      name: 'Okello Ronald Ochieng',
      bedNumber: 'Bed B-03 (Cardiac Wing)',
      age: '62',
      gender: 'Male',
      weight: '82',
      bloodType: 'B+',
      phone: '+256787674140',
      doctorPhone: '+256787674140',
      mentorPhone: '+256787674140',
      conditions: 'Mitral Valve Regurgitation, Mitral Arrhythmia risk',
      allergies: 'Aspirin',
      vitalsPreset: 'warning'
    }
  ];

  const [registeredPatients, setRegisteredPatients] = useState<RegisteredPatient[]>(() => {
    const saved = localStorage.getItem('doctorian_registered_patients');
    return saved ? JSON.parse(saved) : defaultPatients;
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    const saved = localStorage.getItem('doctorian_selected_patient_id');
    return saved || 'patient-joseph';
  });

  const [registryNotification, setRegistryNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const currentCoupledPatientGlobal = registeredPatients.find(p => p.id === selectedPatientId) || defaultPatients[0];

  const triggerRegistryNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setRegistryNotification({ message, type });
    setTimeout(() => setRegistryNotification(null), 4000);
  };

  const couplePatientToMonitor = (patient: RegisteredPatient) => {
    setSelectedPatientId(patient.id);
    
    // Auto-configure initial vitals based on physiological state preset
    let simulatedVitals: Vitals;
    if (patient.vitalsPreset === 'critical') {
      simulatedVitals = {
        heartRate: 145 + Math.random() * 10,
        temperature: 39.8 + Math.random() * 0.5,
        spo2: 84 + Math.random() * 3,
        systolicBP: 195 + Math.random() * 10,
        diastolicBP: 115 + Math.random() * 5,
        respiratoryRate: 32 + Math.random() * 4,
        timestamp: Date.now(),
      };
    } else if (patient.vitalsPreset === 'warning') {
      simulatedVitals = {
        heartRate: 105 + Math.random() * 5,
        temperature: 38.2 + Math.random() * 0.4,
        spo2: 92 + Math.random() * 2,
        systolicBP: 135 + Math.random() * 10,
        diastolicBP: 85 + Math.random() * 5,
        respiratoryRate: 22 + Math.random() * 3,
        timestamp: Date.now(),
      };
    } else {
      simulatedVitals = {
        heartRate: 72 + Math.random() * 5,
        temperature: 36.6 + Math.random() * 0.2,
        spo2: 98 + Math.random() * 1,
        systolicBP: 120 + Math.random() * 5,
        diastolicBP: 80 + Math.random() * 2,
        respiratoryRate: 14 + Math.random() * 2,
        timestamp: Date.now(),
      };
    }

    // Connect simulator or direct update logic
    if (!arduino.connection.connected) {
      arduino.startDemo(patient.vitalsPreset);
    }
    
    // Feed preset instantly only if using the simulated demo engine
    if (!arduino.connection.connected || arduino.connection.type === 'demo') {
      setTimeout(() => {
        arduino.updateVitals(simulatedVitals);
      }, 150);
    }

    // Save selected state
    localStorage.setItem('doctorian_selected_patient_id', patient.id);
    
    // Insert into alarm reports
    addAlarmLog('info', 'Registry Node', patient.bedNumber, `Telemetry coupled to Patient: ${patient.name}`);
    triggerRegistryNotification(`Telemetry monitor active on Bed: ${patient.bedNumber} for ${patient.name}`, 'success');
  };

  React.useEffect(() => {
    localStorage.setItem('doctorian_registered_patients', JSON.stringify(registeredPatients));
  }, [registeredPatients]);

  React.useEffect(() => {
    localStorage.setItem('doctorian_selected_patient_id', selectedPatientId);
  }, [selectedPatientId]);

  // Auto-couple relative patient on account login
  React.useEffect(() => {
    if (user) {
      const savedRelId = localStorage.getItem(`doctorian_relative_link_${user.id}`);
      if (savedRelId) {
        if (registeredPatients.some(p => p.id === savedRelId)) {
          setSelectedPatientId(savedRelId);
        }
      } else {
        // Scan for patient that corresponds to user credentials (matching phone or surname/name) to start tracking instantly
        const relativeMatch = registeredPatients.find(p => 
          (user.phone && (p.phone === user.phone || p.mentorPhone === user.phone)) ||
          p.name.toLowerCase().includes(user.displayName.split(' ')[0].toLowerCase())
        ) || registeredPatients[0];
        
        if (relativeMatch) {
          localStorage.setItem(`doctorian_relative_link_${user.id}`, relativeMatch.id);
          setSelectedPatientId(relativeMatch.id);
          triggerRegistryNotification(`Auto-coupled monitoring tracker to your family relative: ${relativeMatch.name}`, 'info');
        }
      }
    }
  }, [user?.id, registeredPatients]);

  // Bed Transfer Tracking System
  interface BedTransferRecord {
    id: string;
    patientName: string;
    fromBed: string;
    toBed: string;
    timestamp: string;
    reason: string;
  }

  const defaultTransfers: BedTransferRecord[] = [
    {
      id: "transfer-1",
      patientName: "Nakato Sarah Mukasa",
      fromBed: "Bed B-04 (Maternity General)",
      toBed: "Bed B-02 (ICU-Maternity)",
      timestamp: new Date(Date.now() - 3600000 * 2.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      reason: "Postpartum BP spike and respiratory distress, moved for close mechanical ventilation integration"
    },
    {
      id: "transfer-2",
      patientName: "Joseph Brian Obote",
      fromBed: "Bed A-02 (Emergency Pod)",
      toBed: "Bed B-01 (Ward A)",
      timestamp: new Date(Date.now() - 3600000 * 6).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      reason: "Malaria vital spike controlled, transfer to step-down telemetry wing"
    }
  ];

  const [transferHistory, setTransferHistory] = useState<BedTransferRecord[]>(() => {
    const saved = localStorage.getItem('doctorian_bed_transfers');
    return saved ? JSON.parse(saved) : defaultTransfers;
  });

  React.useEffect(() => {
    localStorage.setItem('doctorian_bed_transfers', JSON.stringify(transferHistory));
  }, [transferHistory]);
  const [showSettings, setShowSettings] = useState(false);
  const [isEmergencyCalling, setIsEmergencyCalling] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isDoctorVerifyOpen, setIsDoctorVerifyOpen] = useState(false);
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

  const hrAnalysis = React.useMemo(() => {
    // 1. Calculate Today's Average Heart Rate
    let todayAvg = 74.2;
    const todayHistory = history || [];
    if (todayHistory.length > 0) {
      const sum = todayHistory.reduce((acc, curr) => acc + curr.heartRate, 0);
      todayAvg = sum / todayHistory.length;
    } else if (vitals) {
      todayAvg = vitals.heartRate;
    }

    // 2. Rolling 7-day average baseline based on selected patient's stable reference
    const activePatient = registeredPatients.find(p => p.id === selectedPatientId);
    let baselineHR = 72.5;
    if (activePatient) {
      if (activePatient.id === 'patient-sarah') {
        baselineHR = 75.0; // Her stable non-distressed baseline
      } else if (activePatient.id === 'patient-ronald') {
        baselineHR = 70.0; // His stable cardiac pacemaker baseline
      } else if (activePatient.id === 'patient-joseph') {
        baselineHR = 72.0; // His standard healthy reference
      }
    }
    
    const diff = todayAvg - baselineHR;
    const percentChange = baselineHR > 0 ? (diff / baselineHR) * 100 : 0;
    const isIncreasedMoreThan10 = percentChange > 10;

    return {
      todayAvg,
      baselineHR,
      percentChange,
      isIncreasedMoreThan10
    };
  }, [history, vitals, selectedPatientId, registeredPatients]);

  const getEmergencyContacts = () => {
    const activePatient = registeredPatients.find(p => p.id === selectedPatientId);
    if (activePatient) {
      return [
        { role: 'Patient', phone: activePatient.phone, countryCode: '' },
        { role: 'Doctor', phone: activePatient.doctorPhone, countryCode: '' },
        { role: 'Mentor', phone: activePatient.mentorPhone, countryCode: '' }
      ];
    }
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
  const alarmMode = (localStorage.getItem('doctorian_alarm_trigger_mode') as 'all' | 'emergency_only' | 'disabled') || 'all';
  const shouldShowAlarm = alarmMode !== 'disabled' && (isSustainedCritical || arduino.neuralAlert) && !isCurrentlyAcknowledged;

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

    const alarmMode = (localStorage.getItem('doctorian_alarm_trigger_mode') as 'all' | 'emergency_only' | 'disabled') || 'all';
    if (alarmMode === 'disabled') {
      // Clear active alerts quickly so they don't stay in active references
      Object.keys(activeAlertsRef.current).forEach(key => {
        delete activeAlertsRef.current[key];
      });
      return;
    }

    const currentAlerts = checkVitalAlerts().filter(alert => {
      // Skip warnings if in emergency_only mode
      if (alarmMode === 'emergency_only' && alert.level === 'warning') {
        return false;
      }
      return true;
    });
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
    const alarmMode = (localStorage.getItem('doctorian_alarm_trigger_mode') as 'all' | 'emergency_only' | 'disabled') || 'all';
    if (alarmMode === 'disabled') {
      return;
    }

    if (isCritical && (!lastAlertSent || Date.now() - lastAlertSent > 300000)) { // Alert every 5 minutes if still critical
      const activePatient = registeredPatients.find(p => p.id === selectedPatientId) || defaultPatients[0];
      
      const patientPhone = activePatient?.phone || '+256787674140';
      const doctorPhone = activePatient?.doctorPhone || '+256787674140';
      const mentorPhone = activePatient?.mentorPhone || '+256787674140';

      const alertMessage = `CRITICAL ALERT [RELAY: 0787674140] for Patient: ${activePatient?.name || 'Authorized Client'} in ${activePatient?.bedNumber || 'Assigned Bed'}. Biometrics critical! HR: ${Math.round(vitals?.heartRate || 0)}bpm, SpO2: ${Math.round(vitals?.spo2 || 0)}%, Temp: ${vitals?.temperature.toFixed(1)}°C. Pre-existing Conditions: ${activePatient?.conditions || 'None'}. Clinical action required immediately.`;
      
      // Send SMS to Standard Primary Contacts
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

      // Automated auto-dispatch to stored registered emergency contacts
      let storedContacts: Array<{ role: string; phone: string }> = [];
      try {
        const saved = localStorage.getItem('emergency_contacts');
        if (saved) {
          storedContacts = JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to parse stored emergency contacts:", e);
      }

      // Also trigger emergency dispatch to all custom registered contacts
      storedContacts.forEach(contact => {
        if (contact.phone) {
          const customAlertMessage = `EMERGENCY DISPATCH [RELAY: 0787674140]: Stored Emergency Contact Alert for Patient ${activePatient?.name || 'Authorized Client'}. Status: Critical. HR: ${Math.round(vitals?.heartRate || 0)} BPM, SpO2: ${Math.round(vitals?.spo2 || 0)}%. Urgent clinical attention requested.`;
          api.alerts.sendSms(customAlertMessage, contact.phone)
            .then(res => console.log('✅ Registered contact alert sent:', contact.phone, res.message))
            .catch(err => console.error('❌ Failed to alert custom contact:', contact.phone, err));
        }
      });

      // Initiate Voice Call
      setIsEmergencyCalling(true);
      const hospitalName = user?.hospitalPreference || 'Mulago National Referral Hospital';
      const voiceMessage = `Hello! This is the Doctorian AI Clinical Guardian, an automated patient monitoring intelligence system. We are calling with an urgent physiological update from ${hospitalName}. A critical biometric alarm has been triggered for Patient: ${activePatient?.name || 'Joseph Brian Obote'} in ${activePatient?.bedNumber || 'Bed B-01 (Ward A)'}. Currently, the patient's vitals are in a critical state. The heart rate is ${Math.round(vitals?.heartRate || 0)} beats per minute, the blood oxygen saturation level is at ${Math.round(vitals?.spo2 || 0)} percent, and the system reports pre-existing conditions: ${activePatient?.conditions || 'stable parameters'}. Immediate clinical intervention is required at ${hospitalName}. Please review the patient's telemetry and check on them immediately!`;
      
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
  }, [isCritical, vitals, lastAlertSent, selectedPatientId, registeredPatients]);

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

  const MiniPatientMonitor: React.FC<{ preset: 'healthy' | 'warning' | 'critical'; patientId?: string }> = ({ preset, patientId }) => {
    const [vitals, setVitals] = useState({
      hr: preset === 'critical' ? 142 : preset === 'warning' ? 104 : 72,
      spo2: preset === 'critical' ? 84 : preset === 'warning' ? 92 : 98,
      bpSys: preset === 'critical' ? 180 : preset === 'warning' ? 142 : 120,
      bpDia: preset === 'critical' ? 112 : preset === 'warning' ? 94 : 80,
      rr: preset === 'critical' ? 32 : preset === 'warning' ? 24 : 15,
      temp: preset === 'critical' ? 39.4 : preset === 'warning' ? 38.2 : 36.7
    });

    useEffect(() => {
      const timer = setInterval(() => {
        setVitals(prev => ({
          hr: Math.round(prev.hr + (Math.random() - 0.5) * 2),
          spo2: Math.min(100, Math.max(50, Math.round(prev.spo2 + (Math.random() > 0.8 ? (Math.random() - 0.5) * 2 : 0)))),
          bpSys: Math.round(prev.bpSys + (Math.random() - 0.5) * 1.5),
          bpDia: Math.round(prev.bpDia + (Math.random() - 0.5) * 1),
          rr: Math.round(prev.rr + (Math.random() - 0.5) * 0.8),
          temp: parseFloat((prev.temp + (Math.random() - 0.5) * 0.05).toFixed(1))
        }));
      }, 1200);
      return () => clearInterval(timer);
    }, [preset]);

    const [pulsePhase, setPulsePhase] = useState(0);
    useEffect(() => {
      const animationFrame = setInterval(() => {
        setPulsePhase(p => (p + 1) % 100);
      }, 50);
      return () => clearInterval(animationFrame);
    }, []);

    const getSgPath = () => {
      let pts = [];
      for (let x = 0; x <= 160; x += 4) {
        let y = 15;
        const cycle = (x + pulsePhase * 2) % 60;
        if (cycle > 12 && cycle < 18) {
          y = 2; 
        } else if (cycle >= 18 && cycle < 22) {
          y = 26; 
        } else if (cycle >= 22 && cycle < 28) {
          y = 8; 
        }
        pts.push(`${x},${y}`);
      }
      return `M ${pts.join(' L ')}`;
    };

    const statusColor = preset === 'critical' ? 'text-rose-500 bg-rose-500/10' : preset === 'warning' ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10';

    const isMainCoupledPatient = patientId === selectedPatientId && arduino.connection.connected;
    
    const displayVitals = (isMainCoupledPatient && arduino.vitals) ? {
      hr: Math.round(arduino.vitals.heartRate),
      spo2: Math.round(arduino.vitals.spo2),
      bpSys: Math.round(arduino.vitals.systolicBP),
      bpDia: Math.round(arduino.vitals.diastolicBP),
      rr: Math.round(arduino.vitals.respiratoryRate),
      temp: parseFloat(arduino.vitals.temperature.toFixed(1))
    } : vitals;

    return (
      <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3 font-sans shadow-inner">
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
          <span className="flex items-center gap-1">
            <Activity size={10} className="text-teal-400 rotate-12" />
            Live Vital Node Signal
          </span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-black ${statusColor}`}>
            {preset.toUpperCase()} WAVE
          </span>
        </div>

        <div className="h-10 bg-slate-950 rounded-lg overflow-hidden relative border border-slate-850 flex items-center">
          <svg className="w-full h-8" viewBox="0 0 160 30">
            <path
              d={getSgPath()}
              fill="none"
              stroke={preset === 'critical' ? '#ef4444' : preset === 'warning' ? '#f59e0b' : '#10b981'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute top-1 right-2 text-[8px] font-black font-mono text-slate-600">{isMainCoupledPatient ? 'REAL TIME FEED' : '64HZ DIRECT'}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
            <div className="text-[7px] font-bold text-slate-500 uppercase">Heart Rate</div>
            <div className="text-xs font-black font-mono text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
              <Heart size={8} className="text-red-500 animate-pulse fill-red-500 shrink-0" />
              {displayVitals.hr} <span className="text-[7px] font-normal text-slate-500">BPM</span>
            </div>
          </div>

          <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
            <div className="text-[7px] font-bold text-slate-500 uppercase">SPO2 Oxygen</div>
            <div className="text-xs font-black font-mono text-cyan-400 mt-0.5">
              {displayVitals.spo2}%
            </div>
          </div>

          <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
            <div className="text-[7px] font-bold text-slate-500 uppercase">SYS/DIA BP</div>
            <div className="text-xs font-black font-mono text-amber-400 mt-0.5">
              {displayVitals.bpSys}/{displayVitals.bpDia}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-1.5 bg-slate-950 rounded border border-slate-850 flex items-center justify-between px-2">
            <span className="text-[7px] font-bold text-slate-500 uppercase">Temperature</span>
            <span className="text-[10px] font-black font-mono text-orange-400">{displayVitals.temp}°C</span>
          </div>
          <div className="p-1.5 bg-slate-950 rounded border border-slate-850 flex items-center justify-between px-2">
            <span className="text-[7px] font-bold text-slate-500 uppercase">Resp. Rate</span>
            <span className="text-[10px] font-black font-mono text-blue-400">{displayVitals.rr} RPM</span>
          </div>
        </div>
      </div>
    );
  };

  const ClinicalPatientRegistry: React.FC = () => {
    const [regName, setRegName] = useState('');
    const [regBed, setRegBed] = useState('');
    const [regAge, setRegAge] = useState('');
    const [regGender, setRegGender] = useState('Male');
    const [regWeight, setRegWeight] = useState('');
    const [regBlood, setRegBlood] = useState('O+');
    const [regPhone, setRegPhone] = useState('+256787674140');
    const [regDoc, setRegDoc] = useState('+256787674140');
    const [regMentor, setRegMentor] = useState('+256787674140');
    const [regConditions, setRegConditions] = useState('');
    const [regAllergies, setRegAllergies] = useState('');
    const [regPreset, setRegPreset] = useState<'healthy' | 'warning' | 'critical'>('healthy');
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

    // Editing State
    const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
    const [transferViewMode, setTransferViewMode] = useState<'timeline' | 'table'>('timeline');

    // Display configuration and interactive toggles
    const [registryDisplayMode, setRegistryDisplayMode] = useState<'cards' | 'floorplan'>('floorplan');
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [patientSeverityFilter, setPatientSeverityFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');

    const searchedAndFilteredPatients = (() => {
      return registeredPatients.filter(patient => {
        const query = patientSearchQuery.trim().toLowerCase();
        const nameMatch = patient.name.toLowerCase().includes(query);
        const bedMatch = patient.bedNumber.toLowerCase().includes(query);
        const conditionMatch = patient.conditions.toLowerCase().includes(query);
        const searchMatch = !query || nameMatch || bedMatch || conditionMatch;

        const severityMatch = patientSeverityFilter === 'all' || patient.vitalsPreset === patientSeverityFilter;

        return searchMatch && severityMatch;
      });
    })();
    const [isAutoCleanSmsEnabled, setIsAutoCleanSmsEnabled] = useState<boolean>(() => {
      const saved = localStorage.getItem('doctorian_auto_sms_clean');
      return saved !== 'false';
    });
    const [cleaningStaffSelected, setCleaningStaffSelected] = useState<string>(() => {
      const saved = localStorage.getItem('doctorian_cleaner_phone');
      return saved || '+256787555019';
    });

    interface CleaningSchedule {
      id: string;
      bedNumber: string;
      patientDischarged: string;
      scheduledTime: string;
      phoneNotified: string;
      status: 'Scheduled' | 'SMS Dispatched' | 'Completed';
    }

    const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>(() => {
      const saved = localStorage.getItem('doctorian_cleaning_schedules');
      return saved ? JSON.parse(saved) : [
        {
          id: 'clean-baseline-1',
          bedNumber: 'Bed A-04 (Ward A)',
          patientDischarged: 'Kato Derrick Ssekajja',
          scheduledTime: '08:05 AM',
          phoneNotified: '+256787555019',
          status: 'Completed'
        },
        {
          id: 'clean-baseline-2',
          bedNumber: 'Bed D-03 (ER)',
          patientDischarged: 'Namubiru Maria',
          scheduledTime: '08:24 AM',
          phoneNotified: '+256787555019',
          status: 'SMS Dispatched'
        }
      ];
    });

    // Floor Plan Bed Configuration Master List
    const FLOOR_PLAN_BEDS = [
      // Sections: General Ward A, ICU & High Accuity, Cardiac Care, Emergency Room
      { id: 'A-01', label: 'Bed A-01 (Ward A)', section: 'Ward A (General)' },
      { id: 'A-02', label: 'Bed A-02 (Ward A)', section: 'Ward A (General)' },
      { id: 'A-03', label: 'Bed A-03 (Ward A)', section: 'Ward A (General)' },
      { id: 'A-04', label: 'Bed A-04 (Ward A)', section: 'Ward A (General)' },
      { id: 'A-05', label: 'Bed A-05 (Ward A)', section: 'Ward A (General)' },
      { id: 'A-06', label: 'Bed A-06 (Ward A)', section: 'Ward A (General)' },
      
      { id: 'B-01', label: 'Bed B-01 (Ward A)', section: 'ICU & High Accuity' },
      { id: 'B-02', label: 'Bed B-02 (ICU-Maternity)', section: 'ICU & High Accuity' },
      { id: 'B-03', label: 'Bed B-03 (Cardiac Wing)', section: 'ICU & High Accuity' },
      { id: 'B-04', label: 'Bed B-04 (ICU-Admissions)', section: 'ICU & High Accuity' },
      
      { id: 'C-01', label: 'Bed C-01 (Cardiac Care)', section: 'Cardiac Care Unit' },
      { id: 'C-02', label: 'Bed C-02 (Cardiac Care)', section: 'Cardiac Care Unit' },
      { id: 'C-03', label: 'Bed C-03 (Cardiac Care)', section: 'Cardiac Care Unit' },
      { id: 'C-04', label: 'Bed C-04 (Cardiac Care)', section: 'Cardiac Care Unit' },

      { id: 'D-01', label: 'Bed D-01 (ER)', section: 'Emergency Room' },
      { id: 'D-02', label: 'Bed D-02 (ER)', section: 'Emergency Room' },
      { id: 'D-03', label: 'Bed D-03 (ER)', section: 'Emergency Room' },
      { id: 'D-04', label: 'Bed D-04 (ER)', section: 'Emergency Room' },
    ];

    const getWardSection = (bedNumber: string) => {
      const normalized = bedNumber.toLowerCase();
      if (normalized.includes('icu') || normalized.includes('maternity')) return 'ICU & High Accuity';
      if (normalized.includes('cardiac') || normalized.includes('wing') || normalized.includes('c-')) return 'Cardiac Care Unit';
      if (normalized.includes('emerg') || normalized.includes('observ') || normalized.includes('d-') || normalized.includes('bed b-04')) return 'Emergency Room';
      return 'Ward A (General)';
    };

    const countOccupied = (section: string) => {
      return registeredPatients.filter(p => getWardSection(p.bedNumber) === section).length;
    };

    const wardSections = [
      { name: 'Ward A (General)', capacity: 6, color: '#06b6d4', text: 'text-cyan-500', bg: 'bg-cyan-500/10' },
      { name: 'ICU & High Accuity', capacity: 4, color: '#3b82f6', text: 'text-blue-500', bg: 'bg-blue-500/10' },
      { name: 'Cardiac Care Unit', capacity: 4, color: '#a855f7', text: 'text-purple-500', bg: 'bg-purple-500/10' },
      { name: 'Emergency Room', capacity: 4, color: '#f43f5e', text: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    const chartData = wardSections.map(ws => {
      const occupied = countOccupied(ws.name);
      return {
        name: ws.name,
        Occupied: occupied,
        Available: Math.max(0, ws.capacity - occupied),
        Capacity: ws.capacity
      };
    });

    const totalBedsCount = wardSections.reduce((sum, ws) => sum + ws.capacity, 0);
    const overallOccupied = registeredPatients.length;
    const overallAvailable = Math.max(0, totalBedsCount - overallOccupied);
    const occupancyRate = Math.round((overallOccupied / totalBedsCount) * 100);

    // Save states to persistent localStorage
    useEffect(() => {
      localStorage.setItem('doctorian_cleaning_schedules', JSON.stringify(cleaningSchedules));
    }, [cleaningSchedules]);

    useEffect(() => {
      localStorage.setItem('doctorian_auto_sms_clean', isAutoCleanSmsEnabled.toString());
    }, [isAutoCleanSmsEnabled]);

    useEffect(() => {
      localStorage.setItem('doctorian_cleaner_phone', cleaningStaffSelected);
    }, [cleaningStaffSelected]);

    // Simulated Hygiene staff response logic for real-time visual realism
    useEffect(() => {
      const pendingDispatch = cleaningSchedules.filter(c => c.status === 'SMS Dispatched');
      if (pendingDispatch.length === 0) return;

      const timer = setTimeout(() => {
        setCleaningSchedules(prev => {
          let hasChange = false;
          const updated = prev.map(c => {
            if (c.status === 'SMS Dispatched') {
              hasChange = true;
              return { ...c, status: 'Completed' as const };
            }
            return c;
          });
          if (hasChange) {
            triggerRegistryNotification("Hygiene Node Confirmation: Bed disinfected, sterilized, and returned to clinical intake rotation.", "success");
          }
          return updated;
        });
      }, 15000); // Sterile cleanup takes 15 seconds to simulate staff response

      return () => clearTimeout(timer);
    }, [cleaningSchedules]);

    const findPatientForBed = (bedLabel: string, bedId: string) => {
      const found = registeredPatients.find(p => {
        const pBed = p.bedNumber.toLowerCase();
        const bLabel = bedLabel.toLowerCase();
        const bId = bedId.toLowerCase();
        return pBed === bLabel || pBed.includes(bId) || bLabel.includes(pBed);
      });
      if (!found) return undefined;
      const isFiltered = searchedAndFilteredPatients.some(p => p.id === found.id);
      return isFiltered ? found : undefined;
    };

    const QuickTransferForm: React.FC = () => {
      const [selectedId, setSelectedId] = useState(registeredPatients[0]?.id || '');
      const [targetBedField, setTargetBedField] = useState('');
      const [transferReason, setTransferReason] = useState('');

      // Auto update selected ID if it defaults to empty but patients are available
      useEffect(() => {
        if (!selectedId && registeredPatients.length > 0) {
          setSelectedId(registeredPatients[0].id);
        }
      }, [registeredPatients, selectedId]);

      const currentPatient = registeredPatients.find(p => p.id === selectedId);

      const runExecuteTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) {
          triggerRegistryNotification("Security Lock: Admin credentials required to relocate patient beds.", "error");
          document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        if (!selectedId || !targetBedField.trim()) {
          triggerRegistryNotification("Please select a patient and indicate target bed.", "error");
          return;
        }

        const patientObj = registeredPatients.find(p => p.id === selectedId);
        if (!patientObj) {
          triggerRegistryNotification("Patient record missing.", "error");
          return;
        }

        if (patientObj.bedNumber.trim().toLowerCase() === targetBedField.trim().toLowerCase()) {
          triggerRegistryNotification(`Patient is already allocated to ${targetBedField.trim()}.`, "error");
          return;
        }

        const oldBedValue = patientObj.bedNumber;
        const newBedValue = targetBedField.trim();

        // Perform clinical state mutation
        setRegisteredPatients(prev => prev.map(p => p.id === selectedId ? {
          ...p,
          bedNumber: newBedValue
        } : p));

        // Create transaction history entry
        const latestRecord: BedTransferRecord = {
          id: `transfer-${Date.now()}`,
          patientName: patientObj.name,
          fromBed: oldBedValue,
          toBed: newBedValue,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
          reason: transferReason.trim() || 'Urgent physiological relocation'
        };

        setTransferHistory(prev => [latestRecord, ...prev]);

        // Add automatic discharge alert for cleaning staff on vacated bed
        const newCleaning: CleaningSchedule = {
          id: `clean-${Date.now()}`,
          bedNumber: oldBedValue,
          patientDischarged: patientObj.name,
          scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          phoneNotified: cleaningStaffSelected,
          status: isAutoCleanSmsEnabled ? 'SMS Dispatched' : 'Scheduled'
        };
        setCleaningSchedules(prev => [newCleaning, ...prev]);

        triggerRegistryNotification(
          isAutoCleanSmsEnabled 
            ? `Successfully transferred ${patientObj.name} to ${newBedValue}. SMS dispatched to CleanSquad to disinfect vacated ${oldBedValue}!`
            : `Successfully transferred ${patientObj.name} to ${newBedValue}. Scheduled hygiene team to clean vacated ${oldBedValue}.`, 
          "success"
        );

        // Clear variables
        setTargetBedField('');
        setTransferReason('');
      };

      return (
        <form onSubmit={runExecuteTransfer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Select Patient</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500"
            >
              <option value="" disabled>-- Select Active Patient --</option>
              {registeredPatients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.bedNumber})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Current Bed Assignment</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-1">
              {currentPatient ? currentPatient.bedNumber : 'No patient selected'}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">New Bed Allocation</label>
            <input
              type="text"
              required
              value={targetBedField}
              onChange={e => setTargetBedField(e.target.value)}
              placeholder="e.g. Bed B-02 (ICU)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Reason for relocation</label>
            <input
              type="text"
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              placeholder="e.g. Needs cardiac ventilation telemetry"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow active:scale-95 text-center block cursor-pointer"
          >
            Execute Transfer Alert
          </button>
        </form>
      );
    };

    const handleRegister = (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAdmin) {
        triggerRegistryNotification("Security Lock: Admin credentials required to add or modify patients.", "error");
        document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (!regName.trim() || !regBed.trim()) {
        triggerRegistryNotification('Patient Name and Bed Number are required fields.', 'error');
        return;
      }

      if (editingPatientId) {
        // Find existing to check if bed changed
        const originalPatient = registeredPatients.find(p => p.id === editingPatientId);
        if (originalPatient && originalPatient.bedNumber !== regBed) {
          const newTransfer: BedTransferRecord = {
            id: `transfer-${Date.now()}`,
            patientName: regName,
            fromBed: originalPatient.bedNumber,
            toBed: regBed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
            reason: regConditions || 'Clinical assessment shift'
          };
          setTransferHistory(prev => [newTransfer, ...prev]);
        }

        // Edit Existing Patient List
        setRegisteredPatients(prev => prev.map(p => p.id === editingPatientId ? {
          ...p,
          name: regName,
          bedNumber: regBed,
          age: regAge,
          gender: regGender,
          weight: regWeight,
          bloodType: regBlood,
          phone: regPhone,
          doctorPhone: regDoc,
          mentorPhone: regMentor,
          conditions: regConditions,
          allergies: regAllergies,
          vitalsPreset: regPreset
        } : p));

        triggerRegistryNotification(`Synchronized details for ${regName} safely.`, 'success');
        setEditingPatientId(null);
      } else {
        // Create New Patient
        const newPatient: RegisteredPatient = {
          id: `patient-${Date.now()}`,
          name: regName,
          bedNumber: regBed,
          age: regAge || 'N/A',
          gender: regGender,
          weight: regWeight || 'N/A',
          bloodType: regBlood,
          phone: regPhone || '+256787674140',
          doctorPhone: regDoc || '+256787674140',
          mentorPhone: regMentor || '+256787674140',
          conditions: regConditions || 'Stable standard surveillance',
          allergies: regAllergies || 'Nil known',
          vitalsPreset: regPreset
        };

        setRegisteredPatients(prev => [...prev, newPatient]);
        triggerRegistryNotification(`Successfully registered and allocated ${regName} to ${regBed}!`, 'success');
      }

      // Reset Form fields
      setRegName('');
      setRegBed('');
      setRegAge('');
      setRegGender('Male');
      setRegWeight('');
      setRegBlood('O+');
      setRegPhone('+256787674140');
      setRegDoc('+256787674140');
      setRegMentor('+256787674140');
      setRegConditions('');
      setRegAllergies('');
      setRegPreset('healthy');
      setShowRegistrationForm(false);
    };

    const handleDeregister = (id: string, name: string) => {
      if (!isAdmin) {
        triggerRegistryNotification("Security Lock: Admin credentials required to discharge patients.", "error");
        document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const patientObj = registeredPatients.find(p => p.id === id);
      const vacatedBed = patientObj ? patientObj.bedNumber : 'General Ward Unit';

      if (confirm(`Are you sure you want to discharge and de-register ${name}?`)) {
        setRegisteredPatients(prev => prev.filter(p => p.id !== id));
        if (selectedPatientId === id) {
          const remaining = registeredPatients.filter(p => p.id !== id);
          if (remaining.length > 0) {
            setSelectedPatientId(remaining[0].id);
          }
        }

        // Auto-schedule cleaning SMS alert
        const newCleaning: CleaningSchedule = {
          id: `clean-${Date.now()}`,
          bedNumber: vacatedBed,
          patientDischarged: name,
          scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          phoneNotified: cleaningStaffSelected,
          status: isAutoCleanSmsEnabled ? 'SMS Dispatched' : 'Scheduled'
        };
        setCleaningSchedules(prev => [newCleaning, ...prev]);

        triggerRegistryNotification(
          isAutoCleanSmsEnabled
            ? `Discharged ${name}. Automated CleanSquad dispatch SMS triggered for vacated ${vacatedBed}!`
            : `Discharged ${name}. Handover scheduled for vacated ${vacatedBed}.`,
          'info'
        );
      }
    };

    const handleEditInitiate = (p: RegisteredPatient) => {
      if (!isAdmin) {
        triggerRegistryNotification("Security Lock: Admin credentials required to update profile data.", "error");
        document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      setEditingPatientId(p.id);
      setRegName(p.name);
      setRegBed(p.bedNumber);
      setRegAge(p.age);
      setRegGender(p.gender);
      setRegWeight(p.weight);
      setRegBlood(p.bloodType);
      setRegPhone(p.phone);
      setRegDoc(p.doctorPhone);
      setRegMentor(p.mentorPhone);
      setRegConditions(p.conditions);
      setRegAllergies(p.allergies);
      setRegPreset(p.vitalsPreset);
      setShowRegistrationForm(true);
    };

    return (
      <div className="space-y-10">
        {/* Registry Notification Toast */}
        <AnimatePresence>
          {registryNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] max-w-md w-full p-4 rounded-2xl shadow-xl flex items-center gap-3 border font-bold text-xs ${
                registryNotification.type === 'error' 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : registryNotification.type === 'info'
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}
            >
              {registryNotification.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
              <span>{registryNotification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EHR Administrative Override Controller */}
        <div id="ehr-admin-portal" className={`p-6 sm:p-8 rounded-[2rem] border transition-all ${isAdmin ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-slate-800 dark:text-slate-200 shadow-sm'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${isAdmin ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'}`}>
                {isAdmin ? <CheckCircle size={22} className="animate-pulse" /> : <ShieldAlert size={22} />}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">
                  {isAdmin ? '🛡️ EHR Secure Authorized Session Established' : '🔒 Secure Read-Only Clinical Access'}
                </h3>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                  {isAdmin 
                    ? 'EHR Database modifications, patient relocations, and profile terminations are fully authorized. Change audits require compliance with HIPAA, regional Ministry of Health regulations, and standard patient data logging.' 
                    : 'Changes to patient vital presets, new bed registrations, discharges, and relocation schedules are currently locked under clinical security guidelines. Access PIN is required to unlock clinical database state mutations and overrides.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {isAdmin ? (
                <button
                  onClick={() => {
                    setIsAdmin(false);
                    localStorage.setItem('doctorian_is_admin', 'false');
                    triggerRegistryNotification("Read-only clinical EMR session enforced successfully.", "info");
                  }}
                  className="px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow cursor-pointer"
                >
                  Revoke Clinical Override
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter Admin PIN (Try 1234)"
                      value={adminPin}
                      onChange={e => {
                        setAdminPin(e.target.value);
                        setAdminPinError('');
                      }}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 rounded-xl text-xs font-black placeholder:text-slate-400 outline-none w-full sm:w-56 focus:border-rose-500 text-slate-900 dark:text-white-0"
                    />
                    {adminPinError && (
                      <span className="absolute -bottom-5 left-0 text-[9px] font-bold text-rose-500">{adminPinError}</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (adminPin === '1234') {
                        setIsAdmin(true);
                        localStorage.setItem('doctorian_is_admin', 'true');
                        setAdminPin('');
                        setAdminPinError('');
                        triggerRegistryNotification("EHR override authorized. Multi-channel mutation scope open.", "success");
                      } else {
                        setAdminPinError("Incorrect Security PIN code");
                        triggerRegistryNotification("EHR authentication fail. PIN rejected.", "error");
                      }
                    }}
                    className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md text-center"
                  >
                    Authenticate PIN
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Bed Occupancy Analytics & Automation Center */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-100 dark:bg-slate-900/50 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800">
          
          {/* Left Column (7 cols): Real-Time Bed Occupancy Recharts bar chart */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-850 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-xl shadow-md">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white">Real-Time Bed Occupancy Analytics</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dynamic Recharts Ward Intake Metrics</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 rounded-lg text-[9px] font-black uppercase tracking-wider border border-teal-200/30">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
                  Live Stream
                </div>
              </div>

              {/* Dynamic Capacity Indicators */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Capacity</span>
                  <span className="font-mono text-xl font-black text-slate-900 dark:text-white block mt-0.5">{totalBedsCount}</span>
                  <span className="text-[9px] font-bold text-slate-500 block">Configured beds</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Occupied Beds</span>
                  <span className="font-mono text-xl font-black text-teal-600 dark:text-teal-400 block mt-0.5">{overallOccupied}</span>
                  <span className="text-[9px] font-bold text-slate-500 block">{occupancyRate}% Load rate</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Available/Ready</span>
                  <span className="font-mono text-xl font-black text-blue-600 dark:text-blue-400 block mt-0.5">{overallAvailable}</span>
                  <span className="text-[9px] font-bold text-slate-500 block">Disinfected units</span>
                </div>
              </div>

              {/* Bar Chart representing Ward occupancy */}
              <div className="h-[210px] w-full mt-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px' }}
                      labelStyle={{ fontWeight: 'black', color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}
                      itemStyle={{ color: '#94a3b8', fontSize: '10px' }}
                    />
                    <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                    <Bar dataKey="Occupied" stackId="a" fill="#14b8a6" name="Occupied" radius={[0, 0, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-occ-${index}`} fill={wardSections[index].color} />
                      ))}
                    </Bar>
                    <Bar dataKey="Available" stackId="a" fill="rgba(148, 163, 184, 0.12)" name="Available / Empty" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Scheduled Discharge & Automatic Cleaner Alerts system */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-xl shadow-md">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white-0">Vacated Cleaning Dispatcher</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">SMS-Paging Rules & Schedules</p>
                  </div>
                </div>
              </div>

              {/* Automatic SMS Toggle Control */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200 block">Automatic Discharge SMS Alert</span>
                  <span className="text-[9px] text-slate-500 font-medium leading-tight block">Notifies cleaning staff instantly on patient discharge or relocation events</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAutoCleanSmsEnabled(prev => !prev)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 ${isAutoCleanSmsEnabled ? 'bg-indigo-600 flex justify-end' : 'bg-slate-300 dark:bg-slate-800 flex justify-start'}`}
                >
                  <span className="w-4.5 h-4.5 bg-white rounded-full shadow-md block" />
                </button>
              </div>

              {/* Select Active Cleaning Team */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 pl-0.5 uppercase tracking-wider block">Active On-Duty Clean Team Contact</label>
                <div className="flex items-center gap-2">
                  <select
                    value={cleaningStaffSelected}
                    onChange={e => setCleaningStaffSelected(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-3 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="+256787555019">Hygiene Specialist Crew Alpha (+256 787 555-019)</option>
                    <option value="+256787999882">Infirmary Sanitation Crew Beta (+256 787 999-882)</option>
                    <option value="+256787111222">Hospitaller Disinfection Sector 4 (+256 787 111-222)</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Alerts Output Log */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 pl-0.5 uppercase tracking-wider block">Recent SMS Logs & Scheduled Handover alerts ({cleaningSchedules.length})</span>
                
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {cleaningSchedules.length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 font-bold italic">
                      No vacating events scheduled yet. Try initiating a discharge.
                    </div>
                  ) : (
                    cleaningSchedules.map((schedule) => {
                      const isCompleted = schedule.status === 'Completed';
                      return (
                        <div key={schedule.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-[10px] space-y-1.5 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-slate-800 dark:text-slate-200 uppercase font-bold">{schedule.bedNumber}</strong>
                              <span className="text-slate-400 leading-none block mt-0.5">Discharged: <span className="font-semibold text-slate-700 dark:text-slate-300">{schedule.patientDischarged}</span></span>
                            </div>
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tight rounded-md flex items-center gap-1 ${isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/20' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200/20 animate-pulse'}`}>
                              {isCompleted ? <CheckCircle size={10} /> : <Clock size={10} />}
                              {schedule.status === 'SMS Dispatched' ? 'SMS SENT' : schedule.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-400 border-t border-slate-100 dark:border-slate-850/60 pt-1.5 mt-1 font-mono">
                            <span>Phone: {schedule.phoneNotified}</span>
                            <span>{schedule.scheduledTime}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50 dark:bg-slate-850 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Clinical Bed allocations</h2>
            <p className="text-slate-500 font-medium text-xs mt-1">
              Active Registered Patients: <strong className="text-teal-600 dark:text-teal-400">{registeredPatients.length} occupied beds</strong>. Automatically dispatches alarms to respective mobile nodes.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPatientId(null);
               setRegName(''); setRegBed(''); setRegAge(''); setRegGender('Male'); setRegWeight(''); setRegBlood('O+'); setRegPhone('+256787674140'); setRegDoc('+256787674140'); setRegMentor('+256787674140'); setRegConditions(''); setRegAllergies(''); setRegPreset('healthy');
              setShowRegistrationForm(!showRegistrationForm);
            }}
            className="px-6 py-4 bg-teal-650 hover:bg-teal-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            {showRegistrationForm ? 'Hide Registration Form' : 'Register Patient / Allocate Bed'}
          </button>
        </div>

        {/* Registration Expandable Form */}
        <AnimatePresence>
          {showRegistrationForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleRegister} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl space-y-8">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <UserIcon size={18} className="text-teal-600" />
                  {editingPatientId ? 'Modify Patient & Bed Properties' : 'Record New EMR Patient details'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Patient Name</label>
                    <input 
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Full Name (e.g. Nabasa Claire)"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Bed Number */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Bed Allocation</label>
                    <input 
                      type="text"
                      required
                      value={regBed}
                      onChange={e => setRegBed(e.target.value)}
                      placeholder="e.g. Bed B-04 (ICU)"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Age</label>
                    <input 
                      type="number"
                      value={regAge}
                      onChange={e => setRegAge(e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                    <select
                      value={regGender}
                      onChange={e => setRegGender(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Weight (kg)</label>
                    <input 
                      type="number"
                      value={regWeight}
                      onChange={e => setRegWeight(e.target.value)}
                      placeholder="e.g. 70"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Blood Type */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Blood Type</label>
                    <select
                      value={regBlood}
                      onChange={e => setRegBlood(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Patient Primary Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Patient Mobile Phone</label>
                    <input 
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="+256787674140"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Doctor Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Doctor Phone</label>
                    <input 
                      type="tel"
                      value={regDoc}
                      onChange={e => setRegDoc(e.target.value)}
                      placeholder="+256787674140"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Mentor Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Guardian Mentor Phone</label>
                    <input 
                      type="tel"
                      value={regMentor}
                      onChange={e => setRegMentor(e.target.value)}
                      placeholder="+256787674140"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Clinical Preset */}
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 font-bold">Biometrics Preset</label>
                    <select
                      value={regPreset}
                      onChange={e => setRegPreset(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="healthy">Normal Recovery (Stable HR 72, SpO2 98%)</option>
                      <option value="warning">Mild Risk Warning (Elevated HR 105, SpO2 92%)</option>
                      <option value="critical">Severe Alarm Condition (Critical HR 145, SpO2 84%)</option>
                    </select>
                  </div>

                  {/* Pre-Existing Conditions */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Conditions / Diagnostics</label>
                    <input 
                      type="text"
                      value={regConditions}
                      onChange={e => setRegConditions(e.target.value)}
                      placeholder="e.g. Hypertension, Recovering malaria"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Allergies */}
                  <div className="space-y-2 md:col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Known Allergies</label>
                    <input 
                      type="text"
                      value={regAllergies}
                      onChange={e => setRegAllergies(e.target.value)}
                      placeholder="e.g. Sulfa, Penicillin, Peanuts"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowRegistrationForm(false)}
                    className="px-6 py-3 bg-slate-150 dark:bg-slate-800 text-slate-600 hover:text-slate-800 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    {editingPatientId ? 'Synchronize Record' : 'Allocate Bed & Register'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registry Selector Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex bg-slate-150 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1.5 rounded-2xl w-full sm:w-fit shadow-inner">
            <button
              type="button"
              onClick={() => {
                setRegistryDisplayMode('floorplan');
                triggerRegistryNotification("Switched display to Interactive Ward Floor Plan Map", "info");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer outline-none ${registryDisplayMode === 'floorplan' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              🗺️ Interactive Ward Floor Plan Grid
            </button>
            <button
              type="button"
              onClick={() => {
                setRegistryDisplayMode('cards');
                triggerRegistryNotification("Switched display to Traditional EMR Patient Cards list", "info");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer outline-none ${registryDisplayMode === 'cards' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              📋 Traditional Bed Cards list
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">
            *Clinical overview synchronized on element clicks
          </p>
        </div>

        {/* Real-time Patient Search & Severity Filters Toolbar */}
        <div className="mt-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-805 p-5 rounded-[2.2rem] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs select-none">
              🔍
            </span>
            <input
              type="text"
              value={patientSearchQuery}
              onChange={(e) => setPatientSearchQuery(e.target.value)}
              placeholder="Search patients by name, bed index, diagnoses, or allergies..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl text-[11.5px] font-semibold text-slate-750 dark:text-slate-300 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none shadow-sm transition-all"
            />
          </div>

          {/* Severity Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-405 font-mono mr-1">
              Severity:
            </span>
            {[
              { id: 'all', label: 'All Beds', color: 'bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-950 dark:hover:bg-slate-850 dark:text-slate-300 border-slate-150 dark:border-slate-800', activeColor: 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/10' },
              { id: 'healthy', label: 'Stable', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:hover:bg-emerald-955/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40', activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/10' },
              { id: 'warning', label: 'Warning', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:hover:bg-amber-955/40 dark:text-amber-450 border-amber-100 dark:border-amber-900/40', activeColor: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10' },
              { id: 'critical', label: 'Critical', color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-955/40 dark:text-rose-450 border-rose-100 dark:border-rose-900/40', activeColor: 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/10' }
            ].map(chip => {
              const isActive = patientSeverityFilter === chip.id;
              return (
                <button
                  type="button"
                  key={chip.id}
                  onClick={() => {
                    setPatientSeverityFilter(chip.id as any);
                    triggerRegistryNotification(`Severity Filter: Selected ${chip.label}`, 'info');
                  }}
                  className={`px-4 py-2.5 rounded-xl text-[9.5px] font-[1000] uppercase tracking-wider border cursor-pointer select-none transition-all ${
                    isActive ? chip.activeColor : `${chip.color}`
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8"></div>

        {registryDisplayMode === 'floorplan' ? (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 text-white space-y-6">
              
              {/* Floor Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Layers size={20} className="text-teal-400 rotate-6" />
                    Interactive Ward Floor Plan Grid
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Pulsatile Location Matrix & Real-time Bed Telemetry Map
                  </p>
                </div>
                
                {/* Visual Legends */}
                <div className="flex flex-wrap items-center gap-3.5 text-[9px] font-black uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow shadow-emerald-500/20" /> STABLE</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> WARNING</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> CRITICAL</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-dashed border-slate-600 bg-slate-950/40" /> VACANT</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500 animate-pulse" /> DISINFECTING</span>
                </div>
              </div>

              {/* Floor Plan Main Grid Sections Map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {wardSections.map((section) => {
                  const sectionBeds = FLOOR_PLAN_BEDS.filter(b => b.section === section.name);
                  
                  return (
                    <div key={section.name} className="bg-slate-950/50 p-6 rounded-3xl border border-slate-850 space-y-4">
                      
                      {/* Section Title Banner */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${section.bg} ${section.text}`}>
                          {section.name}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          {sectionBeds.length} Physical Bed Slots
                        </span>
                      </div>

                      {/* Quadrant grid cells */}
                      <div className="grid grid-cols-2 gap-4">
                        {sectionBeds.map(bed => {
                          const patient = findPatientForBed(bed.label, bed.id);
                          const activeCleaning = cleaningSchedules.find(c => c.bedNumber === bed.label && c.status === 'SMS Dispatched');
                          
                          if (patient) {
                            // OCCUPIED bed representation
                            const isSelected = selectedPatientId === patient.id;
                            const level = patient.vitalsPreset;
                            const borderStyle = 
                              level === 'critical' ? 'border-rose-500 ring-rose-500/20 shadow-xl shadow-rose-950/10' :
                              level === 'warning' ? 'border-amber-500 ring-amber-500/10 shadow-lg shadow-amber-950/10' :
                              'border-emerald-550 ring-emerald-500/10 hover:shadow-emerald-900/10';

                            return (
                              <div
                                key={bed.id}
                                onClick={() => {
                                  couplePatientToMonitor(patient);
                                  triggerRegistryNotification(`Coupled telemetry feeds with ${patient.name} (${bed.id})`, "info");
                                }}
                                className={`p-4 bg-slate-900/95 rounded-2xl border transition-all duration-300 relative cursor-pointer group flex flex-col justify-between h-42 ${borderStyle} ${isSelected ? 'ring-4 border-teal-500 dark:border-teal-400' : 'hover:scale-102 border-slate-800'}`}
                              >
                                <div>
                                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 pr-1 leading-none">
                                    <span className="font-extrabold">{bed.id}</span>
                                    <span className="flex items-center gap-1 text-[7px] font-black">
                                      <Activity size={8} className="animate-pulse text-rose-500" />
                                      LIVE
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-black text-white mt-1.5 leading-tight truncate">{patient.name}</h4>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Age: {patient.age} &bull; Blood {patient.bloodType}</p>
                                </div>

                                <div className="space-y-1.5 mt-auto">
                                  {/* Dynamic vitals simulation banner inside grid map */}
                                  <div className="flex items-center gap-1.5 mt-2 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-855">
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${level === 'critical' ? 'bg-rose-500 shadow shadow-rose-500' : level === 'warning' ? 'bg-amber-500 shadow shadow-amber-500' : 'bg-emerald-550 shadow shadow-emerald-500'}`} />
                                    <span className="text-[8px] font-mono font-bold text-slate-300 leading-none font-mono">
                                      {level === 'critical' ? 'HR 145 / SPO2 84%' : level === 'warning' ? 'HR 105 / SPO2 92%' : 'HR 72 / SPO2 98%'}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[8px] font-black uppercase text-teal-400 mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Couple Feed</span>
                                    <span>Stream Node</span>
                                  </div>
                                </div>
                              </div>
                            );
                          } else if (activeCleaning) {
                            // DISINFECTING bed representation
                            return (
                              <div
                                key={bed.id}
                                className="p-3.5 bg-indigo-950/25 rounded-2xl border border-indigo-500/30 flex flex-col justify-between h-42 text-center relative group"
                              >
                                <div className="text-[8px] font-mono text-indigo-400 text-left leading-none">{bed.id}</div>
                                <div className="my-auto space-y-1">
                                  <div className="p-1 px-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-[8px] font-black uppercase tracking-wider inline-flex items-center gap-1 mx-auto animate-pulse">
                                    <Clock size={10} /> Disinfecting
                                  </div>
                                  <span className="text-[8px] text-slate-400 leading-tight block">Cleaning staff alerted via SMS</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCleaningSchedules(prev => prev.map(c => c.id === activeCleaning.id ? { ...c, status: 'Completed' as const } : c));
                                    triggerRegistryNotification(`Sanitization certified for ${bed.id} manually.`, "success");
                                  }}
                                  className="text-[8px] font-black text-indigo-300 hover:text-indigo-100 uppercase tracking-widest border border-indigo-500/20 rounded-lg py-1.5 bg-indigo-950/45 cursor-pointer"
                                >
                                  Sterilize Bed Now
                                </button>
                              </div>
                            );
                          } else {
                            // VACANT clean bed representation
                            return (
                              <div
                                key={bed.id}
                                onClick={() => {
                                  setRegBed(bed.label);
                                  setShowRegistrationForm(true);
                                  triggerRegistryNotification(`Auto-configured admission location to ${bed.id}`, "info");
                                  document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="p-4 bg-slate-950/40 rounded-2xl border border-dashed border-slate-705/60 hover:border-slate-505 hover:bg-slate-900/40 transition-all duration-300 cursor-pointer h-42 flex flex-col justify-between group"
                              >
                                <div className="text-[8px] font-mono text-slate-500 leading-none">{bed.id}</div>
                                <div className="my-auto text-center space-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Vacuum Cleaned</span>
                                  <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-900/30 inline-block">VACANT</span>
                                </div>
                                <span className="text-[8px] text-slate-450 font-black uppercase tracking-widest text-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  + Click to Admit
                                </span>
                              </div>
                            );
                          }
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchedAndFilteredPatients.length === 0 ? (
              <div className="col-span-full py-16 p-10 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-805 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
                <p className="text-4xl select-none">🔬</p>
                <h4 className="text-base font-black uppercase text-slate-800 dark:text-slate-200 tracking-tight">No Patients Match Active Search</h4>
                <p className="text-xs text-slate-400 font-bold max-w-md mx-auto leading-relaxed">
                  Modify the severity filter chips above or adjust your medical keyword criteria to locate the desired beds.
                </p>
              </div>
            ) : (
              searchedAndFilteredPatients.map(patient => {
                const isCurrentlySelected = selectedPatientId === patient.id;
                return (
                  <div 
                    key={patient.id}
                    className={`flex flex-col justify-between p-6 sm:p-8 rounded-[2.2rem] bg-white dark:bg-slate-900 border transition-all duration-300 relative overflow-hidden shadow-sm ${
                      isCurrentlySelected 
                        ? 'border-teal-500 dark:border-teal-800 ring-4 ring-teal-500/10 shadow-xl' 
                        : 'border-slate-100 dark:border-slate-800 hover:shadow-md'
                    }`}
                  >
                    {/* Status indicator badge */}
                    <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full animate-pulse ${
                        patient.vitalsPreset === 'critical' ? 'bg-rose-500 shadow-lg shadow-rose-300 dark:shadow-rose-950' :
                        patient.vitalsPreset === 'warning' ? 'bg-amber-500 shadow-lg shadow-amber-300 dark:shadow-amber-950' : 
                        'bg-emerald-500 shadow-lg shadow-emerald-300 dark:shadow-emerald-950'
                      }`} />
                      <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-tighter bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">{patient.bedNumber}</span>
                    </div>

                    <div className="space-y-5 relative z-10 w-full mb-6">
                      <div>
                        <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest font-sans">Patient Node</h4>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-tight">{patient.name}</h3>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg text-[9px] font-black text-slate-500 uppercase">Age: {patient.age}</span>
                          <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg text-[9px] font-black text-slate-500 uppercase">Gender: {patient.gender}</span>
                          <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg text-[9px] font-black text-slate-500 uppercase">Type: {patient.bloodType}</span>
                          {patient.weight && <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg text-[9px] font-black text-slate-500 uppercase">Wt: {patient.weight}kg</span>}
                        </div>
                      </div>

                      <div className="border-t border-dashed border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 font-bold">Patient Cell:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{patient.phone}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 font-bold">Duty Physician:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{patient.doctorPhone}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 font-bold">Duty Mentor:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{patient.mentorPhone}</span>
                        </div>
                      </div>

                      <div className="space-y-1 bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl text-[11px] border border-slate-100 dark:border-slate-800/80 leading-relaxed font-sans">
                        <p className="text-[9px] font-black text-slate-405 uppercase tracking-widest pl-0.5 mb-1.5">Bioclinical Remarks</p>
                        <div className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">Conditions:</strong> {patient.conditions}</div>
                        <div className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">Allergies:</strong> {patient.allergies}</div>
                        <div className="text-slate-500 dark:text-slate-500 text-[10px] italic mt-2">preset: {patient.vitalsPreset?.toUpperCase()} biometrics drift</div>
                      </div>

                      {/* Individual Patient Live Health Monitors */}
                      <MiniPatientMonitor preset={patient.vitalsPreset} patientId={patient.id} />
                    </div>

                    <div className="flex gap-2.5 mt-auto border-t border-slate-100 dark:border-slate-800 pt-5">
                      {isCurrentlySelected ? (
                        <div className="flex-1 py-3 px-4 bg-teal-550/10 text-teal-600 dark:text-teal-400 rounded-xl text-center font-black text-[10px] uppercase tracking-[0.2em] border border-teal-200/40 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 bg-teal-550 rounded-full animate-ping" />
                          Coupled & Live
                        </div>
                      ) : (
                        <button
                          onClick={() => couplePatientToMonitor(patient)}
                          className="flex-grow py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl font-black text-[10.5px] uppercase tracking-widest transition-all shadow-md active:scale-95"
                        >
                          Couple Monitor
                        </button>
                      )}

                      <div className="flex gap-1.5 justify-end shrink-0">
                        <button
                          onClick={() => handleEditInitiate(patient)}
                          className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-605 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors"
                          title="Edit Profile"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          onClick={() => handleDeregister(patient.id, patient.name)}
                          className="p-3 bg-rose-50 dark:bg-rose-950/10 text-rose-605 rounded-xl hover:bg-rose-150 transition-colors"
                          disabled={registeredPatients.length <= 1}
                          title="Deregister / Discharge"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Patient Bed Transfer Center */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-10 mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                <Clock className="text-teal-600 dark:text-teal-400" size={22} />
                EMR Patient Bed Transfer & Telemetry Hub
              </h3>
              <p className="text-slate-500 font-bold text-xs mt-1">
                Audits all clinical movements, sensor alignment events, and ward re-allocations instantly.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Active Audit Safe
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Quick Transfer Command Tool - XL: 4 Columns */}
            <div className="xl:col-span-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                <Settings size={14} className="text-teal-600" />
                Quick Transfer Tool
              </h4>
              <QuickTransferForm />
            </div>

            {/* Transfers Log Center - XL: 8 Columns */}
            <div className="xl:col-span-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Registry Logs ({transferHistory.length})
                  </h4>
                  <div className="flex bg-slate-150 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => setTransferViewMode('timeline')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        transferViewMode === 'timeline'
                          ? 'bg-teal-600 text-white shadow'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Visual Timeline
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        transferViewMode === 'table'
                          ? 'bg-teal-600 text-white shadow'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Audit Table View
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTransferHistory(defaultTransfers);
                    triggerRegistryNotification("Reset transfer audit history to clinical defaults.", "info");
                  }}
                  className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest hover:opacity-85 text-left"
                >
                  Reset Log to baseline
                </button>
              </div>

              {transferViewMode === 'timeline' ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                  {transferHistory.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-12 text-center text-slate-400 font-bold italic shadow-sm">
                      No patient bed transfer operations logged.
                    </div>
                  ) : (
                    transferHistory.map((transfer, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={transfer.id}
                        className="relative group timeline-node-container"
                      >
                        {/* Connecting dot tag and radar glow wrapper */}
                        <div className="absolute -left-[31px] top-4 z-10 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm border border-teal-200 dark:border-teal-800">
                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                          </div>
                        </div>

                        {/* Interactive Item Block */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            
                            {/* Left clinical transfer nodes */}
                            <div className="space-y-3 flex-grow max-w-full">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black text-xs flex items-center justify-center uppercase shadow-sm border border-teal-200/40 dark:border-teal-800/60">
                                  {transfer.patientName.charAt(0) || 'P'}
                                </span>
                                <div>
                                  <h5 className="font-extrabold text-slate-950 dark:text-slate-100 text-sm leading-none">
                                    {transfer.patientName}
                                  </h5>
                                  <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 tracking-widest uppercase block mt-1 leading-none">
                                    Approved Clinical Migration
                                  </span>
                                </div>
                              </div>

                              {/* Bed Migration Flow Track */}
                              <div className="flex flex-wrap items-center gap-3.5 bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 w-full sm:w-fit">
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Source Base Unit</span>
                                  <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold font-mono mt-1">
                                    {transfer.fromBed}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center p-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600">
                                  <ChevronRight size={14} className="animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Assigned Dest Unit</span>
                                  <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-lg text-[10px] font-black font-mono border border-teal-200/20 mt-1">
                                    {transfer.toBed}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right side audit compliance data */}
                            <div className="lg:text-right flex flex-col justify-between items-start lg:items-end gap-3 min-w-[200px] lg:max-w-[40%]">
                              <div className="bg-amber-50/40 dark:bg-amber-950/10 p-3 rounded-2xl border border-amber-500/10 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-full italic leading-tight">
                                "{transfer.reason}"
                              </div>
                              <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end w-full">
                                <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/20 shadow-sm">
                                  <CheckCircle size={10} className="text-emerald-500" />
                                  EMR Cert Compliance
                                </span>
                                <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500 block font-bold whitespace-nowrap">
                                  {transfer.timestamp}
                                </span>
                              </div>
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                      <thead className="text-[9px] uppercase font-black tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">Patient Node</th>
                          <th className="px-6 py-4">Source Bed</th>
                          <th className="px-6 py-4">Target Bed</th>
                          <th className="px-6 py-4">Reason & Clinical Notes</th>
                          <th className="px-6 py-4 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {transferHistory.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">
                              No bed transfer operations logged during this session window.
                            </td>
                          </tr>
                        ) : (
                          transferHistory.map((transfer) => (
                            <tr 
                              key={transfer.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                            >
                              <td className="px-6 py-4 font-black text-slate-950 dark:text-slate-200">
                                {transfer.patientName}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-slate-50 dark:bg-slate-950 rounded text-[10px] font-bold text-slate-500 font-mono">
                                  {transfer.fromBed}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-teal-50 dark:bg-teal-950/40 rounded text-[10px] font-black text-teal-600 dark:text-teal-400 font-mono">
                                  {transfer.toBed}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 max-w-[240px] truncate" title={transfer.reason}>
                                {transfer.reason}
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-[10px] font-bold text-slate-400">
                                {transfer.timestamp}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8 relative z-10">
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
                  ? 'bg-purple-650 text-white border-purple-600 shadow-lg shadow-purple-200 dark:shadow-purple-900/20'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>NEURAL LINK</span>
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
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <p className="font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wide">Multi-Channel Pairing Protocol</p>
                      <p className="opacity-80">Select any connection channel above to couple your physical ward hardware. For software simulation tests, access the open "Simulator Display" in the navigation tabs above.</p>
                    </div>
                  </div>
                </div>
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
                      <button
                        onClick={() => setActiveTab('registry')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'registry' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        🏥 Bed Registry & Patients
                      </button>
                      <button
                        onClick={() => setActiveTab('simulator')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'simulator' ? 'bg-white dark:bg-slate-900 text-blue-500 shadow-md border border-blue-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Open Display Biomedical Machine Simulator Node"
                      >
                        🔌 Open Simulator Display
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
                <EmergencyRegistry 
                  user={user} 
                  onUpdate={onUpdateUser} 
                  isAdmin={isAdmin} 
                  setIsAdmin={setIsAdmin} 
                />
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
            ) : activeTab === 'registry' ? (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <ClinicalPatientRegistry />
              </div>
            ) : activeTab === 'simulator' ? (
              <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
                <BiomedicalSimulator 
                  arduino={arduino} 
                  patientId={selectedPatientId} 
                  patientName={currentCoupledPatientGlobal?.name} 
                  patientPreset={currentCoupledPatientGlobal?.vitalsPreset} 
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

            {/* Live Patient & Bed Node Assignment Card */}
            {(() => {
              const currentCoupledPatient = registeredPatients.find(p => p.id === selectedPatientId) || defaultPatients[0];
              const isMyRelative = user && (localStorage.getItem(`doctorian_relative_link_${user.id}`) === currentCoupledPatient?.id);
              
              return (
                <div className="mb-8 p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/[0.02] blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start sm:items-center gap-5">
                      <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/40 text-teal-600 rounded-2xl flex items-center justify-center border border-teal-100 dark:border-teal-900/40 shrink-0">
                        <UserIcon size={32} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">Telemetry Node</span>
                          {isMyRelative && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 animate-pulse">
                              <ShieldCheck size={10} /> Tracked Relative
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                          {currentCoupledPatient?.name || 'Joseph Brian Obote'}
                        </h2>
                        
                        {/* Physiological Metadata Tags */}
                        <div className="flex flex-wrap items-center gap-2.5 mt-2 text-[10px] font-bold text-slate-500">
                          <span className="bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">Age: {currentCoupledPatient?.age || '34'}</span>
                          <span className="bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">Gender: {currentCoupledPatient?.gender || 'Male'}</span>
                          <span className="bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">Weight: {currentCoupledPatient?.weight || '78'} kg</span>
                          <span className="bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">Blood Type: {currentCoupledPatient?.bloodType || 'O+'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bed and Clinical Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:text-right shrink-0 lg:max-w-md">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-left sm:text-right">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Assigned Ward Location</span>
                        <span className="text-sm font-black text-teal-600 dark:text-teal-400 uppercase tracking-wide block">
                          {currentCoupledPatient?.bedNumber || 'Bed B-01 (Ward A)'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-start sm:justify-end gap-2 shrink-0">
                        {user ? (
                          !isMyRelative ? (
                            <button
                              type="button"
                              onClick={() => {
                                localStorage.setItem(`doctorian_relative_link_${user.id}`, currentCoupledPatient.id);
                                triggerRegistryNotification(`Linked account tracker to ${currentCoupledPatient.name}!`, 'success');
                              }}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer border border-slate-200/50 dark:border-slate-700"
                            >
                              🔗 Link as My Relative
                            </button>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-xl block">
                              ✅ Sticky Relative Link Set
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 italic">
                            Log in to track relative
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bed History clinical detail and pre-existing conditions */}
                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Clinical Conditions</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        {currentCoupledPatient?.conditions || 'Stable physiological balance, monitoring cardiac presets.'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Patient Allergies</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        {currentCoupledPatient?.allergies || 'No micro-reactions recorded.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Health Status & Anomaly Detection Matrix */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
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
              <ClinicalCoPilotPanel 
                patient={currentCoupledPatientGlobal} 
                vitals={vitals} 
                healthStatus={healthStatus} 
                onSendProtocol={(protocolName) => {
                  triggerRegistryNotification(`Decision Support Action Dispatched: Successfully forwarded ${protocolName} parameters to telemetry routing node.`, "success");
                }}
              />
            </div>

            {/* Heart Rate Rolling Average Alarm Banner */}
            {hrAnalysis.isIncreasedMoreThan10 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transform rotate-12 text-amber-500">
                  <Activity size={120} />
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-amber-500 text-white dark:text-slate-950 rounded-2xl animate-pulse">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-amber-605 dark:text-amber-400">
                      Heart Rate Surge Detected (&gt;10% Shift)
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      The patient's daily average heart rate is currently <span className="font-black text-slate-800 dark:text-slate-100">{Math.round(hrAnalysis.todayAvg)} BPM</span>, which reflects a <span className="font-extrabold text-amber-600">{hrAnalysis.percentChange.toFixed(1)}%</span> increase compared to their rolling 7-day average baseline of <span className="font-black text-slate-800 dark:text-slate-100">{hrAnalysis.baselineHR.toFixed(1)} BPM</span>. Autonomic drift vector warrants immediate review.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex gap-3">
                  <div className="px-5 py-3 bg-amber-500/15 text-amber-602 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
                    Trend Alert Active
                  </div>
                </div>
              </motion.div>
            )}

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
                customIndicator={
                  hrAnalysis.isIncreasedMoreThan10 ? (
                    <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit shrink-0 bg-amber-400 text-slate-900 animate-pulse">
                      <TrendingUp size={12} className="shrink-0" />
                      <span>+{hrAnalysis.percentChange.toFixed(1)}% vs 7d Avg</span>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit shrink-0 bg-white/10 text-white/80">
                      {hrAnalysis.percentChange > 0 ? (
                        <TrendingUp size={12} className="shrink-0" />
                      ) : (
                        <TrendingDown size={12} className="shrink-0" />
                      )}
                      <span>
                        {hrAnalysis.percentChange > 0 ? '+' : ''}
                        {hrAnalysis.percentChange.toFixed(1)}% vs 7d Avg
                      </span>
                    </div>
                  )
                }
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
              <LiveECGMonitor vitals={vitals} addAlarmLog={addAlarmLog} />
            </div>

            {/* Interactive 24-Hour Historical Dual-Axis Chart */}
            <HistoricalTelemetryChart 
              vitals={vitals} 
              selectedPatientId={selectedPatientId} 
              preset={currentCoupledPatientGlobal?.vitalsPreset || 'healthy'} 
            />

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                      <Droplets className="w-5 h-5" />
                    </div>
                    Oxygen Saturation ({timeRange})
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">SpO2 Trend</span>
                </div>
                <div className="h-40 flex items-center justify-center">
                  {displayHistory.length > 0 ? (
                    <div className="w-full h-full">
                      <VitalWaveform 
                        data={displayHistory.map(h => ({ value: h.spo2, timestamp: h.timestamp }))} 
                        color="#06b6d4"
                        height={160}
                        minVal={80}
                        maxVal={100}
                        label="Oxygen Saturation"
                        unit="%"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-slate-700 text-sm font-bold italic">
                      Waiting for data...
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 px-4">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"></div> Current Stream</span>
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div> Hypoxia Threshold (95%)</span>
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
          onClick={() => {
            const isDocAuthed = sessionStorage.getItem('doctor_authenticated') === 'true';
            if (!isDocAuthed) {
              setIsDoctorVerifyOpen(true);
            } else {
              setIsSimulatorOpen(true);
            }
          }}
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
                <BiomedicalSimulator 
                  arduino={arduino} 
                  className="border-0 shadow-none bg-transparent p-0" 
                  patientId={selectedPatientId} 
                  patientName={currentCoupledPatientGlobal?.name} 
                  patientPreset={currentCoupledPatientGlobal?.vitalsPreset} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DoctorVerificationModal
        isOpen={isDoctorVerifyOpen}
        onClose={() => setIsDoctorVerifyOpen(false)}
        onSuccess={() => setIsSimulatorOpen(true)}
        title="Simulation Control Locked"
        description="Patient stimulation and vital wave overrides require active Doctor protocol authentication."
      />
    </div>
  );
};
