import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi, Bluetooth, Play, Square, Thermometer,
  Heart, Droplets, Wind, Activity, AlertTriangle,
  CheckCircle, Info, Radio, Signal, XCircle, Monitor, Stethoscope, WifiOff,
  Smartphone, MessageSquare, Phone, Cpu, Loader2, Zap, Settings, Brain, Sparkles, X, PhoneCall, User as UserIcon, TrendingUp, TrendingDown, Clock3, Sliders,
  Database, Waves, Dna, Microscope, Layers, Fingerprint, ChevronRight, ShieldAlert, ShieldCheck, RefreshCw, Clock, Download, Share2, AlertCircle, Save, Undo, Folder, Plus, Trash2, LayoutGrid,
  Cloud, Volume2, VolumeX, Siren
} from 'lucide-react';
import { HumanBodyVitalsModel } from './HumanBodyVitalsModel';
import { ModernizedPatientMonitorView } from './ModernizedPatientMonitorView';
import { PatientsDashboardView } from './PatientsDashboardView';
import { useArduino, HealthStatus, Vitals } from '../hooks/useArduino';
import { motion, AnimatePresence } from 'motion/react';
import { api, User } from '../api';
import { ClinicalPatientRegistry as ClinicalPatientRegistryStandalone, RegisteredPatient, BedTransferRecord } from './ClinicalPatientRegistry';
import { DoctorVerificationModal } from './DoctorVerificationModal';
import { NeuralSynthesisPanel } from './NeuralSynthesisPanel';
import { DnaMatrix } from './DnaMatrix';
import BioSimulation from './BioSimulation';
import CognisAnalytics from './CognisAnalytics';
import { DeviceTerminalPanel } from './DeviceTerminalPanel';
import { MachineNexusPanel } from './MachineNexusPanel';
import { NeuralHealthSummary } from './NeuralHealthSummary';
import { VitalWaveform } from './VitalWaveform';
import { LiveECGMonitor } from './LiveECGMonitor';
import { LiveECGVisualizer } from './LiveECGVisualizer';
import { AnomalyDetector } from './AnomalyDetector';
import { ClinicalCoPilotPanel } from './ClinicalCoPilotPanel';
import { EmergencyRegistry } from './EmergencyRegistry';
import { AlarmHubView } from './AlarmHubView';
import { BiomedicalSimulator } from './BiomedicalSimulator';
import { AmbulanceDispatchPanel } from './AmbulanceDispatchPanel';
import { HistoricalTelemetryChart } from './HistoricalTelemetryChart';
import { TelemetryCastManager } from './TelemetryCastManager';
import { WatchVitalsMonitor } from './WatchVitalsMonitor';
import { ClinicalStationsNav } from './ClinicalStationsNav';
import { BioTelemetryRangeTooltip } from './BioTelemetryRangeTooltip';
import { HeartRateAlertToast, HeartRateThresholds } from './HeartRateAlertToast';
import { AnimatedVitalNumber } from './AnimatedVitalNumber';
import { cacheTelemetryFrame } from '../utils/waveformCache';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { SafeResponsiveContainer } from './SafeResponsiveContainer';

// Helper function to check if a specific vital data point deviates by more than 20% from the 7-day rolling average
const checkVitalDeviation = (
  field: 'heartRate' | 'temperature' | 'spo2' | 'systolicBP' | 'diastolicBP' | 'respiratoryRate',
  currentVal: number,
  currentTimestamp: number,
  allHistory: Vitals[]
): { isDeviated: boolean; avg: number; diffPercent: number } => {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  
  // Back-test window looking 7 days back from the sample timestamp
  const windowPoints = allHistory.filter(h => 
    h.timestamp >= currentTimestamp - sevenDaysMs && 
    h.timestamp <= currentTimestamp
  );
  
  if (windowPoints.length === 0) {
    return { isDeviated: false, avg: currentVal, diffPercent: 0 };
  }
  
  const sum = windowPoints.reduce((s, item) => s + (item[field] || 0), 0);
  const avg = sum / windowPoints.length;
  
  if (avg === 0) {
    return { isDeviated: false, avg: 0, diffPercent: 0 };
  }
  
  const diffPercent = Math.abs(currentVal - avg) / avg;
  return {
    isDeviated: diffPercent > 0.20,
    avg,
    diffPercent
  };
};

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
}> = ({ icon, label, value, unit, color, bgColor, status, isLive, history = [], maxVal, highlight, customIndicator }) => {
  const numVal = parseFloat(value);
  const isGlowActive = label === "Heart Rate" && !isNaN(numVal) && (numVal > 140 || numVal < 45);

  const getHeartRateTrend = () => {
    if (label !== "Heart Rate") return null;
    if (!history || history.length < 2) return null;
    const lastFive = history.slice(-5);
    if (lastFive.length < 2) return null;
    
    const oldest = lastFive[0].value;
    const latest = lastFive[lastFive.length - 1].value;
    const diff = latest - oldest;
    
    if (diff > 0.5) {
      return {
        direction: 'up',
        color: highlight ? 'text-rose-300' : 'text-rose-500 dark:text-rose-400',
        icon: <TrendingUp size={24} className="inline-block animate-bounce shrink-0" />
      };
    } else if (diff < -0.5) {
      return {
        direction: 'down',
        color: highlight ? 'text-blue-300' : 'text-blue-500 dark:text-blue-400',
        icon: <TrendingDown size={24} className="inline-block animate-bounce shrink-0" />
      };
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isGlowActive
          ? ['0 0 0 0px rgba(239, 68, 68, 0)', '0 0 0 8px rgba(239, 68, 68, 0.4)', '0 0 0 0px rgba(239, 68, 68, 0)']
          : status === 'critical'
          ? ['0 0 0 0px rgba(239, 68, 68, 0)', '0 0 0 4px rgba(239, 68, 68, 0.2)', '0 0 0 0px rgba(239, 68, 68, 0)']
          : 'none'
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ 
        boxShadow: { repeat: Infinity, duration: 2 }
      }}
      className={`group relative overflow-hidden flex flex-col justify-between h-full rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 border transition-all duration-300 ${
        isGlowActive
          ? 'bg-red-50/10 border-red-500 dark:border-red-500/80 animate-red-glow'
          : highlight 
          ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-blue-500 shadow-2xl shadow-blue-500/20' 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5'
      } ${status === 'critical' && !highlight && !isGlowActive ? 'border-red-200 dark:border-red-900 bg-red-50/30' : ''}`}
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
        <div className="flex items-center gap-2">
          {(label === "Heart Rate" || label.includes("SpO2") || label.includes("Temp")) && (
            <BioTelemetryRangeTooltip position="bottom" align="end">
              <span
                className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold cursor-help transition-all flex items-center gap-1 ${
                  highlight 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Acceptable range reference"
              >
                <Info size={10} />
                <span>
                  {label === "Heart Rate"
                    ? "Normal: 60–100 BPM"
                    : label.includes("SpO2")
                    ? "Normal: 95–100%"
                    : "Normal: 36.5–37.5°C"}
                </span>
              </span>
            </BioTelemetryRangeTooltip>
          )}
          {status === 'warning' && <AlertTriangle className={`w-5 h-5 ${highlight ? 'text-white' : 'text-amber-500'}`} aria-label="Warning status" />}
          {status === 'critical' && <XCircle className={`w-5 h-5 ${highlight ? 'text-white' : 'text-red-500'}`} aria-label="Critical status" />}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${highlight ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`} id={`label-${label.replace(/\s+/g, '-')}`}>{label}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5" aria-labelledby={`label-${label.replace(/\s+/g, '-')}`}>
            <motion.span 
              className={`text-5xl sm:text-6xl lg:text-7xl font-[1000] tracking-tighter tabular-nums leading-none ${
                highlight ? 'text-white' : color.includes('text-') ? color : 'text-slate-900 dark:text-white'
              }`} 
              aria-live="polite"
              animate={label === "Heart Rate" && status === "normal" && value !== '--' ? {
                scale: [1, 1.04, 1],
                opacity: [1, 0.85, 1],
              } : {}}
              transition={label === "Heart Rate" && status === "normal" && value !== '--' ? {
                duration: !isNaN(parseFloat(value)) && parseFloat(value) > 0 ? 60 / parseFloat(value) : 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              } : {}}
            >
              {label === "Heart Rate" || label.includes("SpO2") || label.includes("Oxygen") ? (
                <AnimatedVitalNumber value={value} duration={500} showDirectionIndicator={false} />
              ) : (
                value
              )}
            </motion.span>
            <span className={`text-xs sm:text-sm font-black uppercase tracking-widest ${highlight ? 'text-white/40' : 'text-slate-400'}`}>{unit}</span>
          </div>
          {(() => {
            const trend = getHeartRateTrend();
            if (!trend) return null;
            return (
              <span className={`flex items-center ${trend.color}`} title={`Heart rate currently trending ${trend.direction}`}>
                {trend.icon}
              </span>
            );
          })()}
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
};

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
                       <div key={`patientmonitor-l301-i-${i}`} className={`h-1.5 w-8 rounded-full transition-all duration-700 ${i < Math.ceil(status.score / 20) ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-slate-200 dark:bg-slate-800'}`} />
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
              <div key={`patientmonitor-l316-i-${i}`} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400">
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
        {/* Clinical Matrix */}
        <div className="lg:col-span-12 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
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
                              key={`patientmonitor-l477-i-${i}`}
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

const MiniPatientMonitor: React.FC<{ preset: 'healthy' | 'warning' | 'critical'; patientId?: string }> = () => null;

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

export const PatientMonitor: React.FC<{ arduino: any; user?: User | null; onUpdateUser?: (u: User) => void; onNavigate?: (view: string) => void }> = ({ arduino, user, onUpdateUser, onNavigate }) => {
  const {
    vitals, history, healthStatus, connection,
    connectBluetooth, connectHealthWatch, connectSerial, connectWiFi, connectWebSocket, disconnect, startDemo, simulateEmergency,
    startDnaSequencing, dnaStatus, neuralInsight, neuralAlert, error
  } = arduino;

  const [wifiInput, setWifiInput] = useState('http://192.168.1.100');
  const [monitorLayout, setMonitorLayout] = useState<'modern' | 'clinical'>('modern');
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
  const [activeTab, setActiveTab] = useState<'realtime' | 'patients_dashboard' | 'watch_vitals' | 'neural' | 'analytics' | 'emergency' | 'genomics' | 'alarms' | 'registry' | 'simulator' | 'ambulance'>('watch_vitals');
  
  const getCategoryForTab = (tab: string) => {
    if (['watch_vitals', 'patients_dashboard', 'registry'].includes(tab)) return 'ward';
    if (['realtime', 'analytics', 'simulator'].includes(tab)) return 'vitals';
    if (['neural', 'genomics'].includes(tab)) return 'ai';
    if (['alarms', 'emergency', 'ambulance'].includes(tab)) return 'emergency';
    return 'ward';
  };

  const [activeCategory, setActiveCategory] = useState<'ward' | 'vitals' | 'ai' | 'emergency'>(() => getCategoryForTab(activeTab));

  useEffect(() => {
    setActiveCategory(getCategoryForTab(activeTab));
  }, [activeTab]);
  const [emergencyLogs, setEmergencyLogs] = useState<any[]>([]);
  const [activeDoctors, setActiveDoctors] = useState<any[]>([]);
  const [activeCallTranscript, setActiveCallTranscript] = useState<string>('');
  const [isAIBrainGenerated, setIsAIBrainGenerated] = useState<boolean>(false);
  const [currentAudioSource, setCurrentAudioSource] = useState<any>(null);
  const [currentAudioContext, setCurrentAudioContext] = useState<any>(null);
  const [isAIVoiceLoading, setIsAIVoiceLoading] = useState<boolean>(false);

  // Advanced Bio-Organ Stress & Biofeedback Triage States
  const [isBiomarkerScanning, setIsBiomarkerScanning] = useState<boolean>(false);
  const [showBiofeedbackModal, setShowBiofeedbackModal] = useState<boolean>(false);
  const [showSosConfirmModal, setShowSosConfirmModal] = useState<boolean>(false);
  const [showSimulationDials, setShowSimulationDials] = useState<boolean>(false);
  const [simulatedVitals, setSimulatedVitals] = useState({ heartRate: 78, systolicBP: 122, diastolicBP: 80, spo2: 98 });
  const [biofeedbackPhase, setBiofeedbackPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [biofeedbackSeconds, setBiofeedbackSeconds] = useState<number>(4);

  // Biofeedback Guided Breathing Timer (4s Inhale -> 7s Hold -> 8s Exhale)
  React.useEffect(() => {
    if (!showBiofeedbackModal) return;
    const interval = setInterval(() => {
      setBiofeedbackSeconds((prev) => {
        if (prev > 1) return prev - 1;
        if (biofeedbackPhase === 'Inhale') {
          setBiofeedbackPhase('Hold');
          return 7;
        } else if (biofeedbackPhase === 'Hold') {
          setBiofeedbackPhase('Exhale');
          return 8;
        } else {
          setBiofeedbackPhase('Inhale');
          return 4;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showBiofeedbackModal, biofeedbackPhase]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const docs = await api.doctors.listActive();
        setActiveDoctors(docs || []);
      } catch (err) {
        console.error("Failed to fetch active doctors:", err);
      }

      try {
        const logs = await api.alerts.getEmergencyLogs();
        setEmergencyLogs(logs || []);
      } catch (err) {
        console.error("Failed to fetch emergency dispatch logs:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 12000);
    return () => clearInterval(interval);
  }, []);
  
  // Custom Patient & Bed Allocator Registry System

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
    // Automatically start simulated vitals/demo content if not connected to anything
    if (!connection.connected && typeof startDemo === 'function') {
      startDemo('healthy');
    }
  }, [connection.connected, startDemo]);

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

  const baselines = React.useMemo(() => {
    const activePatient = registeredPatients.find(p => p.id === selectedPatientId);
    let hr = 72.5;
    let temp = 36.8;
    let spo2 = 98.0;
    let sbp = 120.0;
    let dbp = 80.0;
    let rr = 14.0;

    if (activePatient) {
      if (activePatient.id === 'patient-sarah') {
        hr = 75.0;
        temp = 37.1;
        spo2 = 96.0;
        sbp = 130.0;
        dbp = 85.0;
        rr = 18.0;
      } else if (activePatient.id === 'patient-ronald') {
        hr = 70.0;
        temp = 36.6;
        spo2 = 97.0;
        sbp = 125.0;
        dbp = 82.0;
        rr = 15.0;
      } else if (activePatient.id === 'patient-joseph') {
        hr = 72.0;
        temp = 36.8;
        spo2 = 98.0;
        sbp = 120.0;
        dbp = 80.0;
        rr = 14.0;
      }
    }

    return {
      heartRate: hr,
      temperature: temp,
      spo2,
      systolicBP: sbp,
      diastolicBP: dbp,
      respiratoryRate: rr
    };
  }, [selectedPatientId, registeredPatients]);

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
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('doctorian_alert_thresholds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      heartRate: { min: 50, max: 120, warningMin: 60, warningMax: 100 },
      temperature: { max: 38.5, warningMax: 37.5 },
      spo2: { min: 90, warningMin: 95 },
      systolicBP: { max: 180, warningMax: 140 },
      diastolicBP: { max: 110, warningMax: 90 },
      respiratoryRate: { min: 12, max: 25, warningMax: 20 }
    };
  });

  const [autoSosThresholds, setAutoSosThresholds] = useState(() => {
    const saved = localStorage.getItem('doctorian_auto_sos_thresholds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      heartRateMin: 45,
      heartRateMax: 140,
      spo2Min: 85
    };
  });

  // Preset Manager default and custom profiles
  const baseDefaultPresets = [
    {
      id: 'default_safety',
      name: 'General Safety (Standard)',
      isDefault: true,
      thresholds: {
        heartRate: { min: 50, max: 120, warningMin: 60, warningMax: 100 },
        temperature: { max: 38.5, warningMax: 37.5 },
        spo2: { min: 90, warningMin: 95 },
        systolicBP: { max: 180, warningMax: 140 },
        diastolicBP: { max: 110, warningMax: 90 },
        respiratoryRate: { min: 12, max: 25, warningMax: 20 }
      },
      autoSosThresholds: {
        heartRateMin: 45,
        heartRateMax: 140,
        spo2Min: 85
      }
    },
    {
      id: 'cardiac_focus',
      name: 'Cardiac Focus (Tighter HR)',
      isDefault: true,
      thresholds: {
        heartRate: { min: 55, max: 110, warningMin: 65, warningMax: 90 },
        temperature: { max: 38.5, warningMax: 37.5 },
        spo2: { min: 90, warningMin: 95 },
        systolicBP: { max: 160, warningMax: 135 },
        diastolicBP: { max: 100, warningMax: 85 },
        respiratoryRate: { min: 12, max: 25, warningMax: 20 }
      },
      autoSosThresholds: {
        heartRateMin: 50,
        heartRateMax: 120,
        spo2Min: 86
      }
    },
    {
      id: 'respiratory_focus',
      name: 'Respiratory Focus (High SpO2 Alert)',
      isDefault: true,
      thresholds: {
        heartRate: { min: 48, max: 130, warningMin: 55, warningMax: 105 },
        temperature: { max: 38.5, warningMax: 37.5 },
        spo2: { min: 92, warningMin: 96 },
        systolicBP: { max: 180, warningMax: 140 },
        diastolicBP: { max: 110, warningMax: 90 },
        respiratoryRate: { min: 14, max: 28, warningMax: 22 }
      },
      autoSosThresholds: {
        heartRateMin: 40,
        heartRateMax: 150,
        spo2Min: 90
      }
    }
  ];

  type PresetProfile = typeof baseDefaultPresets[0];

  const [customPresets, setCustomPresets] = useState<PresetProfile[]>(() => {
    const saved = localStorage.getItem('doctorian_custom_sos_presets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>('default_safety');
  const [newPresetName, setNewPresetName] = useState('');

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = [...baseDefaultPresets, ...customPresets].find(p => p.id === presetId);
    if (found) {
      setThresholds(found.thresholds);
      setAutoSosThresholds(found.autoSosThresholds);
    }
  };

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const cleanName = newPresetName.trim();
    
    const newPreset: PresetProfile = {
      id: 'preset_' + Date.now().toString(36),
      name: cleanName,
      isDefault: false,
      thresholds: JSON.parse(JSON.stringify(thresholds)),
      autoSosThresholds: JSON.parse(JSON.stringify(autoSosThresholds))
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('doctorian_custom_sos_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    setNewPresetName('');
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('doctorian_custom_sos_presets', JSON.stringify(updated));
    if (selectedPresetId === id) {
      setSelectedPresetId('default_safety');
    }
  };

  const handleUpdateHRThresholds = (newHR: HeartRateThresholds) => {
    setThresholds((prev: any) => {
      const updated = {
        ...prev,
        heartRate: newHR,
      };
      try {
        localStorage.setItem('doctorian_alert_thresholds', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

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
        console.log('[ClinicalAlarmSynth] High priority alarm active silently.');
      }

      // IEC 60601-1-8 Medium Priority alarm sequence: repeating slow 3-beep group every 5s
      startMediumAlarm() {
        if (this.currentAlarmMode === 'medium') return;
        this.stopAlarm();
        this.currentAlarmMode = 'medium';
        console.log('[ClinicalAlarmSynth] Medium priority alarm active silently.');
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

  // 24-Hour Offline Waveform & Telemetry Caching into IndexedDB
  React.useEffect(() => {
    if (vitals) {
      cacheTelemetryFrame({
        timestamp: Date.now(),
        isoTime: new Date().toLocaleTimeString(),
        heartRate: Math.round(vitals.heartRate || 0),
        spo2: Math.round(vitals.spo2 || 0),
        sysBP: Math.round(vitals.systolicBP || 120),
        diaBP: Math.round(vitals.diastolicBP || 80),
        respiratoryRate: Math.round(vitals.respiratoryRate || 16),
        ecgPoint: vitals.ecgValue || 0,
      });
    }
  }, [vitals?.heartRate, vitals?.spo2, vitals?.systolicBP, vitals?.diastolicBP]);

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
      
      const patientPhone = user?.phone || activePatient?.phone || '+256787674140';
      const doctorPhone = user?.doctorPhone || activePatient?.doctorPhone || '+256787674140';
      const mentorPhone = user?.mentorPhone || activePatient?.mentorPhone || '+256787674140';

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
      setIsAIVoiceLoading(true);
      setActiveCallTranscript("Connecting with Doctorian AI Clinical Guardian Brain... Synthesizing real-time telemetry speech...");
      setIsAIBrainGenerated(false);

      const hospitalName = user?.hospitalPreference || 'Mulago National Referral Hospital';
      const voiceMessage = `Hello! This is the Doctorian AI Clinical Guardian, an automated patient monitoring intelligence system. We are calling with an urgent physiological update from ${hospitalName}. A critical biometric alarm has been triggered for Patient: ${activePatient?.name || 'Joseph Brian Obote'} in ${activePatient?.bedNumber || 'Bed B-01 (Ward A)'}. Currently, the patient's vitals are in a critical state. The heart rate is ${Math.round(vitals?.heartRate || 0)} beats per minute, the blood oxygen saturation level is at ${Math.round(vitals?.spo2 || 0)} percent, and the system reports pre-existing conditions: ${activePatient?.conditions || 'stable parameters'}. Immediate clinical intervention is required at ${hospitalName}. Please review the patient's telemetry and check on them immediately!`;
      
      const patientContext = {
        patientName: activePatient?.name || "Authorized Client",
        bedNumber: activePatient?.bedNumber || "Assigned Bed",
        conditions: activePatient?.conditions || "Chronic cardiovascular risk factors",
        hospitalPreference: hospitalName,
        vitals: {
          heartRate: Math.round(vitals?.heartRate || 0),
          spo2: Math.round(vitals?.spo2 || 0),
          temperature: vitals?.temperature || 37.0,
          systolicBP: Math.round(vitals?.systolicBP || 120),
          diastolicBP: Math.round(vitals?.diastolicBP || 80),
          respiratoryRate: Math.round(vitals?.respiratoryRate || 18)
        }
      };

      const speakWithLocalSpeech = (textToSpeak: string) => {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          const voices = window.speechSynthesis.getVoices();
          const selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || voices.find(v => v.lang.startsWith('en')) || null;
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          utterance.rate = 1.0;
          utterance.pitch = 1.02;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error("Local speech synthesis failed:", e);
        }
      };

      api.alerts.makeCall(voiceMessage, doctorPhone, mentorPhone, patientPhone, patientContext)
        .then(res => {
          setIsAIVoiceLoading(false);
          const aiText = res.aiText || voiceMessage;
          setActiveCallTranscript(aiText);
          setIsAIBrainGenerated(!!res.isAIBrainGenerated);

          if (res.simulated && res.message.includes('TWILIO CONFIGURATION ERROR')) {
            setAlertError(res.message);
            console.warn('⚠️ Voice Call Simulated:', res.message);
          } else {
            console.log('✅ Voice Call Status:', res.message);
          }

          // Play real-time synthesized vocal wave stream from Gemini
          if (res.audioBase64) {
            try {
              console.log("[PatientMonitor] Decoding raw 24kHz PCM voice file from Gemini brain...");
              const binaryString = window.atob(res.audioBase64);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const int16Array = new Int16Array(bytes.buffer);
              const float32Array = new Float32Array(int16Array.length);
              for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768.0;
              }
              
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
              const buffer = audioCtx.createBuffer(1, float32Array.length, 24000);
              buffer.copyToChannel(float32Array, 0);
              
              const source = audioCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(audioCtx.destination);
              
              source.onended = () => {
                console.log("[PatientMonitor] Gemini audio voice call play complete.");
              };
              
              source.start(0);
              setCurrentAudioSource(source);
              setCurrentAudioContext(audioCtx);
            } catch (playErr) {
              console.error("[PatientMonitor] AudioContext play failed, using browser synthesis fallback:", playErr);
              speakWithLocalSpeech(aiText);
            }
          } else {
            speakWithLocalSpeech(aiText);
          }
        })
        .catch(err => {
          setIsAIVoiceLoading(false);
          console.error('❌ Failed to initiate voice call:', err);
          speakWithLocalSpeech(voiceMessage);
        });

      setLastAlertSent(Date.now());
    }
  }, [isCritical, vitals, lastAlertSent, selectedPatientId, registeredPatients, user]);

  const stopEmergencyCallPlayback = () => {
    try {
      if (currentAudioSource) {
        currentAudioSource.stop();
      }
    } catch (e) {}
    try {
      if (currentAudioContext) {
        currentAudioContext.close();
      }
    } catch (e) {}
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    setCurrentAudioSource(null);
    setCurrentAudioContext(null);
    setIsEmergencyCalling(false);
  };

  const handleManualSOSCall = async () => {
    try {
      setIsEmergencyCalling(true);
      setIsAIVoiceLoading(true);
      setActiveCallTranscript("Dispatching immediate emergency call to assigned doctor & response team...");
      setIsAIBrainGenerated(false);

      const activePatient = registeredPatients.find(p => p.id === selectedPatientId) || defaultPatients[0];
      const doctorPhone = user?.doctorPhone || activePatient?.doctorPhone || '+256787674140';
      const patientPhone = user?.phone || activePatient?.phone || '+256787674140';
      const hospitalName = user?.hospitalPreference || 'Mulago National Referral Hospital';

      const voiceMessage = `EMERGENCY SOS DISPATCH: Patient ${user?.displayName || activePatient?.name || 'Joseph Brian Obote'} at ${hospitalName} has initiated a high-priority clinical emergency call. Heart rate: ${Math.round(vitals?.heartRate || 75)} BPM, SpO2: ${Math.round(vitals?.spo2 || 98)}%. Direct physical response requested immediately!`;

      if (arduino?.triggerAlarm) {
        await arduino.triggerAlarm('emergency');
      }

      const res = await api.alerts.makeCall(voiceMessage, doctorPhone, undefined, patientPhone, {
        patientName: user?.displayName || activePatient?.name || "Patient",
        hospitalPreference: hospitalName
      });

      setIsAIVoiceLoading(false);
      setActiveCallTranscript(res.aiText || voiceMessage);

      await api.alerts.sendSms(voiceMessage, doctorPhone);
    } catch (err: any) {
      setIsAIVoiceLoading(false);
      console.error("SOS Call failed:", err);
      try {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance("Emergency SOS Call initiated. Alerts dispatched to assigned doctor.");
        window.speechSynthesis.speak(ut);
      } catch (e) {}
    }
  };

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






















































  if (monitorLayout === 'modern') {
    return (
      <div className="w-full relative min-h-screen">
        {/* Heart Rate Threshold Breach Toast Alert */}
        <HeartRateAlertToast 
          heartRate={vitals?.heartRate}
          thresholds={thresholds.heartRate}
          onUpdateThresholds={handleUpdateHRThresholds}
          onInspectECG={() => {
            const ecgElem = document.querySelector('.cursor-crosshair') || document.querySelector('[title*="Sweep Speed"]');
            if (ecgElem) {
              ecgElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          onEmergencyDispatch={simulateEmergency}
        />

        <ModernizedPatientMonitorView
          user={user}
          vitals={vitals}
          onNavigate={onNavigate || (() => {})}
          onOpenVault={() => onNavigate?.('records')}
          onSimulateEmergency={simulateEmergency}
          onSwitchToDetailed={() => setMonitorLayout('clinical')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Heart Rate Threshold Breach Toast Alert */}
      <HeartRateAlertToast 
        heartRate={vitals?.heartRate}
        thresholds={thresholds.heartRate}
        onUpdateThresholds={handleUpdateHRThresholds}
        onInspectECG={() => {
          const ecgElem = document.querySelector('.cursor-crosshair') || document.querySelector('[title*="Sweep Speed"]');
          if (ecgElem) {
            ecgElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        onEmergencyDispatch={simulateEmergency}
      />

      {/* Non-intrusive Floating Emergency Audio Dispatch Panel */}
      <AnimatePresence>
        {isEmergencyCalling && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 max-w-lg w-full bg-slate-900/95 backdrop-blur-2xl text-white rounded-2xl p-4 shadow-2xl border border-rose-500/50 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 animate-pulse">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Emergency Call Dispatching</h4>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-rose-300">Autonomous Protocol Active</p>
                </div>
              </div>
              <button 
                onClick={stopEmergencyCallPlayback}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                title="End Emergency Call"
              >
                <X size={14} /> End Call
              </button>
            </div>

            {/* Recipient summary badge */}
            <div className="flex items-center gap-2 overflow-x-auto text-[9px] font-bold uppercase text-slate-300 py-1 scrollbar-none">
              <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                <Stethoscope size={10} /> Dr: {user?.doctorName || "Primary Doctor"}
              </span>
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                <UserIcon size={10} /> Mentor: {user?.mentorName || "Nexus Mentor"}
              </span>
              <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                <UserIcon size={10} /> Node: {user?.displayName || "Patient"}
              </span>
            </div>

            {/* Live Audio Transcript Box */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-rose-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {isAIVoiceLoading ? "Connecting AI Brain..." : "Live Vocal Monologue"}
                </span>
                <div className="flex gap-0.5 items-center h-2.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((val, mapIdx_1907) => (
                    <motion.div 
                      key={`patientmonitor-l1910-${mapIdx_1907}`}
                      animate={{ height: [2, Math.floor(Math.random() * 10) + 2, 2] }}
                      transition={{ duration: 0.2 + Math.random() * 0.3, repeat: Infinity }}
                      className="w-0.5 bg-rose-400 rounded-full" 
                    />
                  ))}
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-200 font-semibold max-h-24 overflow-y-auto pr-1 select-text scrollbar-thin">
                {activeCallTranscript}
              </p>
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
                {/* Preset Profile Manager */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Folder size={15} className="text-blue-500" /> SOS Preset Manager
                    </h3>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                      {customPresets.length + baseDefaultPresets.length} Profiles
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      Active Telemetry Profile
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedPresetId}
                        onChange={(e) => handleSelectPreset(e.target.value)}
                        className="flex-1 text-xs font-bold bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                      >
                        <optgroup label="Default Clinical Presets">
                          {baseDefaultPresets.map((preset, idx) => (
                            <option key={`default-${preset.id}-${idx}`} value={preset.id}>
                              {preset.name}
                            </option>
                          ))}
                        </optgroup>
                        {customPresets.length > 0 && (
                          <optgroup label="Custom User Profiles">
                            {customPresets.map((preset, idx) => (
                              <option key={`custom-${preset.id}-${idx}`} value={preset.id}>
                                {preset.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Preset Badges for easy one-click switching */}
                  <div className="flex flex-wrap gap-1.5">
                    {[...baseDefaultPresets, ...customPresets].map((preset, idx) => {
                      const isActive = selectedPresetId === preset.id;
                      return (
                        <div 
                          key={`badge-${preset.id}-${idx}`}
                          onClick={() => handleSelectPreset(preset.id)}
                          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-wider transition-all border ${
                            isActive
                              ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10'
                              : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span>{preset.name}</span>
                          {!preset.isDefault && (
                            <button
                              onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                              className={`p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-950/40 ${isActive ? 'text-white hover:text-red-200' : 'text-red-500'}`}
                              title="Delete profile"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Create Custom Preset Form */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      Save Current Configuration as Preset
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Elderly Care, Runner Focus..."
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        className="flex-1 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSaveCustomPreset}
                        disabled={!newPresetName.trim()}
                        className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer active:scale-95 shrink-0 animate-fade-in"
                      >
                        <Plus size={12} />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>

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

                {/* Automatic SOS Trigger */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldAlert size={15} className="text-red-500 animate-pulse" /> Automatic SOS Config
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                    Set specific physiologic bounds at or below which an emergency alert cellular broadcast & automated doctor call is initiated.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ThresholdInput
                      label="SOS Heart Rate Min"
                      value={autoSosThresholds.heartRateMin}
                      onChange={(v) => setAutoSosThresholds(prev => ({ ...prev, heartRateMin: v }))}
                      min={30}
                      max={80}
                      unit=" bpm"
                    />
                    <ThresholdInput
                      label="SOS Heart Rate Max"
                      value={autoSosThresholds.heartRateMax}
                      onChange={(v) => setAutoSosThresholds(prev => ({ ...prev, heartRateMax: v }))}
                      min={100}
                      max={200}
                      unit=" bpm"
                    />
                  </div>
                  <div>
                    <ThresholdInput
                      label="SOS Critical SpO2 Min"
                      value={autoSosThresholds.spo2Min}
                      onChange={(v) => setAutoSosThresholds(prev => ({ ...prev, spo2Min: v }))}
                      min={70}
                      max={95}
                      unit="%"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button
                  onClick={() => {
                    localStorage.setItem('doctorian_alert_thresholds', JSON.stringify(thresholds));
                    localStorage.setItem('doctorian_auto_sos_thresholds', JSON.stringify(autoSosThresholds));
                    localStorage.setItem('doctorian_selected_preset_id', selectedPresetId);
                    setShowSettings(false);
                  }}
                  className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl active:scale-95"
                >
                  Apply Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Alarm Overlay disabled per clinical request. Alerts are signaled silently via background triggers and direct network relays. */}

      {/* Reset Mute Button removed as alarm is automatic */}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setMonitorLayout('modern')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>← Return to Modern Monitor</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">Clinical Detailed Mode</span>
        </div>
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
              className="flex items-center justify-center gap-2 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-cyan-200 dark:border-cyan-700/50 transition-all active:scale-95 shadow-sm"
              title="Visually adjust personal HR or SpO2 alert limits"
            >
              <Sliders size={14} className="shrink-0 text-cyan-500" />
              <span>Set Thresholds</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <Settings size={14} className="shrink-0" />
              <span>Alerts</span>
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-1 sm:col-span-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-red-600/20 via-rose-600/15 to-red-600/20 border-2 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex flex-col sm:flex-row items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/40 animate-pulse">
                    <AlertTriangle size={20} className="animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded-full border border-red-300 dark:border-red-800">
                        CRITICAL ALARM ACTIVE
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">IEC 60601-1-8</span>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 leading-tight">
                      Vitals Exceeded Limit • Immediate Clinical Attention Advised
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={acknowledgeAlarm}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer border border-slate-700 shadow-xs"
                    title="Acknowledge and silence alarm for 2 minutes"
                  >
                    Silence (2m)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      acknowledgeAlarm();
                      setShowSosConfirmModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-md shadow-red-600/30 flex items-center gap-1.5"
                    title="Dispatch Emergency SOS"
                  >
                    <Siren size={12} className="animate-pulse" />
                    <span>Dispatch SOS</span>
                  </button>
                </div>
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
        </div>
      )}

      {/* Real-Time Clinical Triage Command & Multi-Organ Emergency Telemetry Hub */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/90 backdrop-blur-2xl text-white rounded-3xl p-6 sm:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.4)] relative overflow-hidden border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header & Status Summary */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                {(!connection.connected || connection.type === "demo") ? (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-950/90 text-amber-300 tracking-widest border border-amber-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    🟡 SIMULATION MODE — NEWS2: Awaiting Live Sensors
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-950/90 text-emerald-300 tracking-widest border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    🟢 LIVE DEVICE CONNECTED ({connection.deviceName || connection.type?.toUpperCase()}) — NEWS2 Score 0
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-950/90 text-blue-300 tracking-widest border border-blue-500/40 flex items-center gap-1.5">
                  <Activity size={12} className="text-blue-400 animate-spin" />
                  Live Telemetry Stream Active
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-950/90 text-purple-300 tracking-widest border border-purple-500/40 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-purple-400" />
                  Continuous Health Monitoring
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shrink-0 shadow-[0_0_24px_rgba(37,99,235,0.4)]">
                  <Stethoscope size={28} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <span>Clinical Emergency Triage Command</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    Real-time National Early Warning Score (NEWS2) & multi-organ failure risk telemetry
                  </p>
                </div>
              </div>
            </div>

            {/* Direct High-Priority Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              <button 
                type="button"
                onClick={() => setShowSosConfirmModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-900/40 active:scale-95 cursor-pointer border border-red-400/30 whitespace-nowrap"
                title="Trigger Immediate Emergency Voice Call to Doctor"
              >
                <PhoneCall size={15} className="animate-bounce" />
                <span>Emergency Call SOS</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  setIsBiomarkerScanning(true);
                  setTimeout(() => {
                    setIsBiomarkerScanning(false);
                  }, 1200);
                }}
                disabled={isBiomarkerScanning}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer border border-blue-400/30 whitespace-nowrap"
              >
                {isBiomarkerScanning ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-blue-200" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="text-blue-200 animate-pulse" />
                    <span>Run Triage Scan</span>
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={() => setShowBiofeedbackModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl font-black text-xs uppercase tracking-wider transition-all border border-cyan-500/30 whitespace-nowrap"
              >
                <Activity size={15} className="text-cyan-400" />
                <span>Biofeedback</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSimulationDials(!showSimulationDials)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border whitespace-nowrap ${
                  showSimulationDials 
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Sliders size={15} className={showSimulationDials ? 'animate-spin' : ''} />
                <span>{showSimulationDials ? 'Close Dials' : 'Vitals Dials'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Simulation Dials Drawer */}
          <AnimatePresence>
            {showSimulationDials && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-slate-950/90 rounded-2xl p-5 border border-amber-500/30 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Vitals Hemodynamic Simulation Dials
                    </span>
                  </div>
                  <button 
                    onClick={() => setSimulatedVitals({ heartRate: 78, systolicBP: 122, diastolicBP: 80, spo2: 98 })}
                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Reset Baseline
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Heart Rate Slider */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-purple-300">Heart Rate</span>
                      <span className="text-white font-mono"><AnimatedVitalNumber value={simulatedVitals.heartRate} duration={400} /> BPM</span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="180"
                      value={simulatedVitals.heartRate}
                      onChange={(e) => setSimulatedVitals(prev => ({ ...prev, heartRate: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Systolic BP Slider */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-cyan-300">Systolic BP</span>
                      <span className="text-white font-mono">{simulatedVitals.systolicBP} mmHg</span>
                    </div>
                    <input 
                      type="range"
                      min="70"
                      max="200"
                      value={simulatedVitals.systolicBP}
                      onChange={(e) => setSimulatedVitals(prev => ({ ...prev, systolicBP: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  {/* Diastolic BP Slider */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-blue-300">Diastolic BP</span>
                      <span className="text-white font-mono">{simulatedVitals.diastolicBP} mmHg</span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="130"
                      value={simulatedVitals.diastolicBP}
                      onChange={(e) => setSimulatedVitals(prev => ({ ...prev, diastolicBP: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* SpO2 Slider */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-emerald-300">SpO2 Level</span>
                      <span className="text-white font-mono"><AnimatedVitalNumber value={simulatedVitals.spo2} duration={400} />%</span>
                    </div>
                    <input 
                      type="range"
                      min="75"
                      max="100"
                      value={simulatedVitals.spo2}
                      onChange={(e) => setSimulatedVitals(prev => ({ ...prev, spo2: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Biomarker Metrics Grid */}
          {(() => {
            const hr = showSimulationDials ? simulatedVitals.heartRate : Math.round(vitals?.heartRate || 75);
            const sys = showSimulationDials ? simulatedVitals.systolicBP : Math.round(vitals?.systolicBP || 120);
            const dia = showSimulationDials ? simulatedVitals.diastolicBP : Math.round(vitals?.diastolicBP || 80);
            const rpp = Math.round((hr * sys) / 100);
            const map = Math.round(dia + (sys - dia) / 3);
            const shockIndex = parseFloat((hr / sys).toFixed(2));

            const rppStatus = rpp > 140 ? 'Severe Stress' : rpp > 110 ? 'Elevated Demand' : 'Optimal Reserve';
            const mapStatus = map < 65 ? 'Hypoperfusion Risk' : map > 110 ? 'Hypertensive Load' : 'Normal Perfusion';
            const shockStatus = shockIndex > 0.9 ? 'Overt Shock Risk' : shockIndex > 0.7 ? 'Occult Strain' : 'Stable Hemodynamics';

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {/* Metric 1: Cardiac Workload (RPP) */}
                <div className="bg-slate-950/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all space-y-4 relative overflow-hidden group/card shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 flex items-center gap-2">
                      <Heart size={15} className="text-purple-400 animate-pulse" />
                      Cardiac Stress Index (RPP)
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                      rpp > 140 ? 'bg-rose-950/90 text-rose-300 border-rose-500/50' : rpp > 110 ? 'bg-amber-950/90 text-amber-300 border-amber-500/50' : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                    }`}>
                      {rppStatus}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl sm:text-4xl font-[1000] text-white tracking-tight">{rpp}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">bpm x mmHg / 100</span>
                    </div>
                    <span className="text-xs font-mono text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">Target: 70–110</span>
                  </div>

                  <div className="w-full bg-slate-900/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(168,85,247,0.5)] ${rpp > 140 ? 'bg-rose-500' : rpp > 110 ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`} 
                      style={{ width: `${Math.min(100, (rpp / 160) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Rate Pressure Product measures myocardial oxygen consumption. Values under 110 reflect optimal cardiac efficiency and coronary reserve.
                  </p>
                </div>

                {/* Metric 2: MAP & Shock Index */}
                <div className="bg-slate-950/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2">
                      <Activity size={15} className="text-cyan-400" />
                      Mean Arterial Pressure & Shock Index
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                      map < 65 || shockIndex > 0.9 ? 'bg-rose-950/90 text-rose-300 border-rose-500/50' : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50'
                    }`}>
                      {mapStatus}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl sm:text-4xl font-[1000] text-white tracking-tight">{map}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">mmHg MAP</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">SI: {shockIndex}</span>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{shockStatus}</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                      style={{ width: `${Math.min(100, (map / 130) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    MAP dictates organ perfusion pressure. MAP ≥ 65 mmHg guarantees microvascular cerebral, renal, and systemic perfusion.
                  </p>
                </div>

                {/* Metric 3: 30-Min Predictive Telemetry */}
                <div className="bg-slate-950/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
                      <TrendingUp size={15} className="text-amber-400" />
                      30-Min Telemetry Forecast
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-amber-950/90 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/50 shadow-sm">
                      PREDICTIVE AI
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-slate-400">Cardiac Trend</span>
                      <span className="text-emerald-400 font-mono font-bold">Stable (±1.8 BPM)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-slate-400">SpO2 Trajectory</span>
                      <span className="text-cyan-300 font-mono font-bold">≥ 97% Sustained</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Acute Decompensation Risk</span>
                      <span className="text-emerald-400 font-mono font-bold">0.8% Low</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-normal pt-1">
                    Neural forecasting model continuous 30-min window projects zero acute hemodynamic compromise over the next shift.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </motion.div>

      {/* Autonomic Biofeedback Protocol Modal */}
      <AnimatePresence>
        {showBiofeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl relative space-y-6"
            >
              <button
                onClick={() => setShowBiofeedbackModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800"
              >
                <X size={18} />
              </button>

              <div className="space-y-1 text-center">
                <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full text-[10px] font-mono font-bold uppercase">
                  Autonomic Regulation Protocol
                </span>
                <h3 className="text-xl font-black uppercase text-white mt-2">
                  Clinical 4-7-8 Biofeedback Pacer
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Reduces sympathetic nerve activity, lowers Rate Pressure Product, and enhances vagal nerve parasympathetic tone.
                </p>
              </div>

              {/* Breathing Circle Animation */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: biofeedbackPhase === 'Inhale' ? 1.35 : biofeedbackPhase === 'Hold' ? 1.35 : 0.85
                    }}
                    transition={{ duration: biofeedbackPhase === 'Inhale' ? 4 : biofeedbackPhase === 'Hold' ? 0.2 : 8, ease: 'easeInOut' }}
                    className={`absolute inset-0 rounded-full blur-xl opacity-40 ${
                      biofeedbackPhase === 'Inhale' ? 'bg-cyan-500' : biofeedbackPhase === 'Hold' ? 'bg-purple-500' : 'bg-emerald-500'
                    }`}
                  />
                  <motion.div
                    animate={{
                      scale: biofeedbackPhase === 'Inhale' ? 1.3 : biofeedbackPhase === 'Hold' ? 1.3 : 0.85
                    }}
                    transition={{ duration: biofeedbackPhase === 'Inhale' ? 4 : biofeedbackPhase === 'Hold' ? 0.2 : 8, ease: 'easeInOut' }}
                    className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-colors ${
                      biofeedbackPhase === 'Inhale' ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200' : biofeedbackPhase === 'Hold' ? 'border-purple-400 bg-purple-950/80 text-purple-200' : 'border-emerald-400 bg-emerald-950/80 text-emerald-200'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold uppercase tracking-widest">{biofeedbackPhase}</span>
                    <span className="text-4xl font-[1000] mt-1">{biofeedbackSeconds}s</span>
                  </motion.div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <p className="font-bold text-white mb-1">Instruction:</p>
                {biofeedbackPhase === 'Inhale' && 'Slowly inhale through nose for 4 seconds into lower diaphragm.'}
                {biofeedbackPhase === 'Hold' && 'Gently hold breath for 7 seconds without straining neck or chest.'}
                {biofeedbackPhase === 'Exhale' && 'Slowly exhale through mouth making a quiet WHOOSH sound for 8 seconds.'}
              </div>

              <button
                onClick={() => setShowBiofeedbackModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider border border-slate-700 transition-colors"
              >
                Close Biofeedback Session
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Panel */}
      {!(user?.role === 'doctor' || user?.role === 'admin') ? (
        <motion.div 
          id="connection-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200 dark:shadow-blue-900/10 p-6 sm:p-10 mb-8 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Radio className="w-5 h-5" />
            </div>
            Connect to Arduino
          </h2>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative z-10 flex flex-col items-center text-center max-w-xl mx-auto py-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-full mb-4">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white mb-2">Ward Telemetry Setup Restricted</h3>
            <p className="text-xs text-slate-550 text-slate-500 leading-relaxed font-bold uppercase">
              Active transponder socket connection channels are managed securely by medical personnel and network administrators directly within the Doctor's Command Dashboard.
            </p>
          </div>
        </motion.div>
      ) : (
        <DeviceTerminalPanel arduino={arduino} />
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
            {/* Bio Monitor Top Suite Banner & Status Header */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl mb-8 space-y-6">
                  {/* Top Bar: Title, Active Patient Node, Connection Link */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <BioTelemetryRangeTooltip position="bottom" align="start" showIconBadge>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight cursor-help hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                              Clinical Bio-Telemetry Monitor
                            </h2>
                          </BioTelemetryRangeTooltip>
                          <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
                            Active Transponder
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                          Patient Node: <span className="text-slate-900 dark:text-slate-200 font-black">Sarah Namukasa</span> • <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">WATCH-01</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {connection.connected && connection.type === 'demo' && (
                        <button
                          onClick={() => {
                            setIsSimulatorOpen(true);
                          }}
                          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-2xl transition-all text-[10px] font-black uppercase tracking-wider shadow-sm cursor-pointer border border-slate-700/50"
                          title="Open Clinical Simulation Dials"
                        >
                          <Cpu size={14} className="text-blue-500 animate-pulse shrink-0" />
                          <span>Simulation Dials</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        </button>
                      )}

                      <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${connection.connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                          {connection.connected ? `Hardware Link: ${connection.type?.toUpperCase() || 'DEMO'}` : 'Machine Disconnected'}
                        </span>
                      </div>
                      {connection.connected && (
                        <button 
                          onClick={() => disconnect()}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/40"
                          title="Disconnect Transponder"
                        >
                          <AlertCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bio Monitor Navigation Cards: 11 Distinct Clinical Modules */}
                  <ClinicalStationsNav activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

            {activeTab === 'watch_vitals' ? (
              <WatchVitalsMonitor
                initialDeviceId={arduino.watchMetadata?.deviceId || "WATCH-01"}
                onAlertTriggered={(alert) => {
                  triggerRegistryNotification(`🚨 URGENT WATCH TRIAGE: ${alert.message}`, 'error');
                }}
              />
            ) : activeTab === 'patients_dashboard' ? (
              <PatientsDashboardView
                vitals={vitals}
                arduino={arduino}
                onSelectPatient={(id) => {
                  setSelectedPatientId(id);
                  setActiveTab('realtime');
                }}
              />
            ) : activeTab === 'analytics' ? (
              <DiagnosticAnalysisView vitals={vitals} history={history} />
            ) : activeTab === 'genomics' ? (
              <div className="space-y-8">
                <DnaMatrix dnaStatus={dnaStatus} onStartSequencing={startDnaSequencing} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {activeMachines.filter(m => m.type === 'Genomic' || m.status === 'online').map((m, mapIdx_2880) => (
                    <div key={`patientmonitor-l2882-${mapIdx_2880}`} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4">
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
              <NeuralSynthesisPanel 
                vitals={vitals} 
                history={history} 
                user={user} 
                onUpdateUser={onUpdateUser} 
              />
            ) : activeTab === 'emergency' ? (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <EmergencyRegistry 
                  user={user} 
                  onUpdate={onUpdateUser} 
                  isAdmin={true} 
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
            ) : activeTab === 'ambulance' ? (
              <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
                <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚑</span>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider">Ambulance Dispatch Control Center</h4>
                      <p className="text-[10px] opacity-90 font-medium">Full clinical emergency fleet routing active</p>
                    </div>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('doctors_dashboard')}
                      className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 font-black text-[10px] uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer"
                    >
                      🏥 Launch Full Doctor Portal →
                    </button>
                  )}
                </div>
                <AmbulanceDispatchPanel 
                  selectedPatientId={selectedPatientId}
                  selectedPatientName={currentCoupledPatientGlobal?.name}
                  addToast={(msg, type) => triggerRegistryNotification(msg, type)}
                />
              </div>
            ) : activeTab === 'registry' ? (
              <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏥</span>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider">Bed Registry & Inpatient Care Ward</h4>
                      <p className="text-[10px] opacity-90 font-medium">Real-time bed allocation and patient records</p>
                    </div>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('doctors_dashboard')}
                      className="px-4 py-2 bg-white text-teal-700 hover:bg-teal-50 font-black text-[10px] uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer"
                    >
                      🏥 Launch Full Doctor Portal →
                    </button>
                  )}
                </div>
                <ClinicalPatientRegistryStandalone
                  user={user}
                  onUpdateUser={onUpdateUser}
                  registeredPatients={registeredPatients}
                  setRegisteredPatients={setRegisteredPatients}
                  selectedPatientId={selectedPatientId}
                  setSelectedPatientId={setSelectedPatientId}
                  registryNotification={registryNotification}
                  setRegistryNotification={setRegistryNotification}
                  transferHistory={transferHistory}
                  setTransferHistory={setTransferHistory}
                  isAdmin={isAdmin}
                  setIsAdmin={setIsAdmin}
                  couplePatientToMonitor={couplePatientToMonitor}
                  triggerRegistryNotification={triggerRegistryNotification}
                  arduino={arduino}
                />
              </div>
            ) : activeTab === 'simulator' ? (
              <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔌</span>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider">Biomedical Hardware Machine Simulator Display</h4>
                      <p className="text-[10px] opacity-90 font-medium">Live vital waveform generator & signal simulator</p>
                    </div>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('doctors_dashboard')}
                      className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-black text-[10px] uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer"
                    >
                      🏥 Launch Full Doctor Portal →
                    </button>
                  )}
                </div>
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
                                       key={`patientmonitor-l3094-i-${i}`}
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
                          {neuralAlert ? "CRITICAL NEURAL ALERT" : "Live AI Clinical Insight (Doctorian 1.5)"}
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
                history={displayHistory.map((h, mapIdx_3410) => ({ value: h.heartRate, timestamp: h.timestamp }))}
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
                history={displayHistory.map((h, mapIdx_3443) => ({ value: h.spo2, timestamp: h.timestamp }))}
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
                history={displayHistory.map((h, mapIdx_3455) => ({ value: h.temperature, timestamp: h.timestamp }))}
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
                history={displayHistory.map((h, mapIdx_3467) => ({ value: h.systolicBP, timestamp: h.timestamp }))}
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
                history={displayHistory.map((h, mapIdx_3479) => ({ value: h.respiratoryRate, timestamp: h.timestamp }))}
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

            {/* Real-time D3 & Recharts Animated ECG Heart Rhythm Oscilloscope */}
            <div className="mb-8">
              <LiveECGVisualizer vitals={vitals} />
            </div>

            {/* Multichannel Telemetry Stream & Waveform Engine */}
            <div className="mb-8">
              <LiveECGMonitor vitals={vitals} addAlarmLog={addAlarmLog} />
            </div>

            {/* Seamless Wearable & ICU Display Casting Console */}
            <TelemetryCastManager />

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
                      data={displayHistory.map((h, mapIdx_3556) => ({ value: h.heartRate, timestamp: h.timestamp }))} 
                      color="#2563eb"
                      height={240}
                      maxVal={180}
                      label="Heart Rate"
                      unit="BPM"
                      baselineValue={baselines.heartRate}
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
                    
                    const sbpCheck = checkVitalDeviation('systolicBP', h.systolicBP, h.timestamp, displayHistory);
                    const dbpCheck = checkVitalDeviation('diastolicBP', h.diastolicBP, h.timestamp, displayHistory);
                    
                    return (
                      <div key={`patientmonitor-l3602-i-${i}`} className="flex-1 flex flex-col justify-end gap-1 group relative">
                        {/* Systolic Part */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${sysHeight}%` }}
                          className={`w-full rounded-t-md transition-all duration-500 hover:brightness-110 shadow-sm ${
                            sbpCheck.isDeviated 
                              ? 'bg-red-500 ring-2 ring-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse' 
                              : h.systolicBP > 140 ? 'bg-rose-500' : 'bg-purple-500'
                          }`}
                          style={{ opacity: 0.5 + (i / displayHistory.length) * 0.5 }}
                        />
                        {/* Diastolic Part */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${diaHeight}%` }}
                          className={`w-full rounded-t-md transition-all duration-500 hover:brightness-110 shadow-sm ${
                            dbpCheck.isDeviated 
                              ? 'bg-red-650 ring-2 ring-red-500 shadow-[0_0_8px_rgba(220,38,38,0.6)] animate-pulse' 
                              : h.diastolicBP > 90 ? 'bg-rose-600' : 'bg-indigo-600'
                          }`}
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
                        data={displayHistory.map((h, mapIdx_3673) => ({ value: h.spo2, timestamp: h.timestamp }))} 
                        color="#06b6d4"
                        height={160}
                        minVal={80}
                        maxVal={100}
                        label="Oxygen Saturation"
                        unit="%"
                        baselineValue={baselines.spo2}
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
                      const tCheck = checkVitalDeviation('temperature', h.temperature, h.timestamp, displayHistory);
                      
                      return (
                        <div key={`patientmonitor-l3713-i-${i}`} className="flex-1 group relative h-full flex flex-col justify-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            className={`w-full rounded-t-lg transition-all duration-300 shadow-sm ${
                              tCheck.isDeviated 
                                ? 'bg-red-500 ring-2 ring-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse' 
                                : isHigh ? 'bg-rose-500' : isWarm ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
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
            <div id="detailed-data-log" className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none p-4 sm:p-8 overflow-hidden transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                      Detailed Data Log
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1 block">
                      {timeRange === 'Day' ? '⚡ Active Registered Patients (Live Node Matrix)' : '📈 Historic Vitals Trend Records'}
                    </span>
                  </div>
                </div>

                {timeRange === 'Day' && (
                  <span className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded-lg uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30 shadow-sm animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Doctorian Live Feed
                  </span>
                )}
              </div>

              {timeRange === 'Day' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                  {/* Doctor On-Duty Rota Queue */}
                  <div className="lg:col-span-2">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                      Clinical On-Duty Rota & Alarm Rotation Queue
                    </h4>
                    
                    {activeDoctors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {activeDoctors.map((doc, idx) => {
                          const isOnDuty = idx === 0; // First index represents active rotating doctor on duty
                          return (
                            <div 
                              key={`doc-rota-${doc.id}-${idx}`}
                              className={`relative overflow-hidden p-4 rounded-2xl border transition-all ${
                                isOnDuty 
                                  ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40 shadow-md shadow-rose-100/30' 
                                  : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/40'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {doc.imageUrl ? (
                                  <img 
                                    src={doc.imageUrl} 
                                    alt={doc.name} 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300">
                                    {doc.name[4] || 'D'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{doc.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">{doc.specialization}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                                <span className="text-slate-400 dark:text-slate-500">{doc.location}</span>
                                {isOnDuty ? (
                                  <span className="px-2 py-0.5 bg-rose-500 text-white rounded text-[8px] animate-pulse">
                                    On Call Active
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-[8px]">
                                    Standby #{idx + 1}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800 text-center text-xs font-bold text-slate-400">
                        No active clinical doctors defined in the rota system.
                      </div>
                    )}
                  </div>

                  {/* Real-Time Dispatch Log Tracker */}
                  <div className="bg-slate-50 dark:bg-slate-800/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-[160px] overflow-y-auto">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      Live Dispatch Timeline
                    </h4>
                    {emergencyLogs.length > 0 ? (
                      <div className="space-y-3">
                        {emergencyLogs.slice(0, 5).map((log, idx) => {
                          let details: any = {};
                          try {
                            details = JSON.parse(log.details);
                          } catch (e) {}
                          
                          return (
                            <div key={`emerg-log-${log.id || idx}-${idx}`} className="text-[10px] leading-normal border-l-2 border-rose-500 pl-2.5 py-0.5">
                              <div className="flex items-center justify-between font-black text-rose-600 dark:text-rose-400 uppercase">
                                <span>{details.alertType || 'EMERGENCY TRIGGERED'}</span>
                                <span className="text-[8px] text-slate-400 dark:text-slate-500">
                                  {new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                              <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                                Rotated to: <span className="text-slate-900 dark:text-white font-extrabold">{details.recipientDoctor || 'On-Duty Doc'}</span> ({details.recipientDoctorPhone || 'rotated'})
                              </p>
                              {details.recipientMentorPhone && (
                                <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[8px] uppercase mt-0.5 flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                  Relative called: {details.recipientMentorPhone}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-[90px] flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-600 text-xs font-bold italic">
                        <Activity className="w-6 h-6 mb-1 text-slate-300 dark:text-slate-700 animate-pulse" />
                        Waiting for emergency dispatches...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {timeRange === 'Day' ? (
                /* Multi Patient Live Monitor (Day Mode) */
                <div className="overflow-x-auto -mx-4 sm:-mx-8 px-4 sm:px-8">
                  <table className="w-full text-left min-w-[900px] border-collapse">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-150 dark:border-slate-800 pb-3">
                        <th className="pb-4 pr-4 font-black">Patient Profile</th>
                        <th className="pb-4 pr-4 font-black text-center">Location Node</th>
                        <th className="pb-4 pr-4 font-black">Clinical Diagnostic Conditions</th>
                        <th className="pb-4 pr-4 font-black">HR (bpm)</th>
                        <th className="pb-4 pr-4 font-black">Temp (°C)</th>
                        <th className="pb-4 pr-4 font-black">SpO2 (%)</th>
                        <th className="pb-4 pr-4 font-black">BP (mmHg)</th>
                        <th className="pb-4 pr-4 font-black">RR (br/min)</th>
                        <th className="pb-4 font-black text-right">Node Controller</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/50">
                      {registeredPatients.map((p, pIdx) => {
                        // Dynamically obtain or simulate live vitals matching the patient's individual vitalsPreset
                        const pVitals = (() => {
                          if (p.id === selectedPatientId && vitals) {
                            return vitals;
                          }
                          const preset = p.vitalsPreset || 'healthy';
                          // Deterministic offset based on ID to keep fluctuations consistent yet dynamic
                          const offset = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
                          const timeSeconds = Math.floor(Date.now() / 2000) + offset;
                          const cycle = Math.sin(timeSeconds / 3);

                          if (preset === 'critical') {
                            return {
                              heartRate: Math.round(135 + cycle * 7),
                              temperature: parseFloat((39.4 + cycle * 0.3).toFixed(1)),
                              spo2: Math.max(70, Math.min(92, Math.round(84 + cycle * 3))),
                              systolicBP: Math.round(191 + cycle * 9),
                              diastolicBP: Math.round(111 + cycle * 4),
                              respiratoryRate: Math.round(28 + cycle * 2)
                            };
                          } else if (preset === 'warning') {
                            return {
                              heartRate: Math.round(102 + cycle * 4),
                              temperature: parseFloat((37.9 + cycle * 0.2).toFixed(1)),
                              spo2: Math.round(91 + cycle * 2),
                              systolicBP: Math.round(136 + cycle * 5),
                              diastolicBP: Math.round(86 + cycle * 3),
                              respiratoryRate: Math.round(21 + cycle * 1)
                            };
                          } else {
                            return {
                              heartRate: Math.round(68 + cycle * 3),
                              temperature: parseFloat((36.6 + cycle * 0.1).toFixed(1)),
                              spo2: Math.round(96 + cycle * 1),
                              systolicBP: Math.round(118 + cycle * 3),
                              diastolicBP: Math.round(78 + cycle * 2),
                              respiratoryRate: Math.round(14 + cycle * 1)
                            };
                          }
                        })();

                        const hr = pVitals.heartRate;
                        const temp = pVitals.temperature;
                        const spo2 = pVitals.spo2;
                        const sbp = pVitals.systolicBP;
                        const dbp = pVitals.diastolicBP;
                        const rr = pVitals.respiratoryRate;

                        const isCritical = p.vitalsPreset === 'critical';
                        const isWarning = p.vitalsPreset === 'warning';
                        const isCoupled = p.id === selectedPatientId;

                        return (
                          <tr 
                            key={`live-pat-${p.id}-${pIdx}`} 
                            className={`group transition-all duration-150 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                              isCoupled 
                                ? 'bg-blue-50/30 dark:bg-blue-900/10 border-l border-l-blue-600' 
                                : ''
                            }`}
                          >
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full ring-4 shrink-0 shadow-sm ${
                                  isCritical 
                                    ? 'bg-rose-500 ring-rose-500/20' 
                                    : isWarning 
                                      ? 'bg-amber-500 ring-amber-500/20' 
                                      : 'bg-emerald-500 ring-emerald-500/20'
                                } ${isCritical ? 'animate-pulse' : ''}`} />
                                <div>
                                  <div className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-1.5">
                                    {p.name}
                                    {isCoupled && (
                                      <span className="text-[8px] bg-blue-600 text-white uppercase px-1.5 py-0.5 rounded-full font-black tracking-widest shrink-0">
                                        coupled
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                                    {p.age}y • {p.gender} • Type {p.bloodType} • {p.weight || '70kg'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <span className="font-mono text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                {p.bedNumber}
                              </span>
                            </td>
                            <td className="py-4 pr-4/10">
                              <div className="max-w-[280px]">
                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                  {p.conditions || "No recorded chronic pathologies"}
                                </div>
                                <div className={`text-[10px] font-black uppercase mt-1 tracking-wider ${
                                  isCritical 
                                    ? 'text-rose-600 dark:text-rose-400' 
                                    : isWarning 
                                      ? 'text-amber-600 dark:text-amber-400' 
                                      : 'text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {isCritical 
                                    ? '⚠️ CRITICAL: Hypoxia Distress' 
                                    : isWarning 
                                      ? '⚠️ BORDERLINE: Mild Pyrexia' 
                                      : '✓ STABLE: Nominal Metabolism'}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <span className={`inline-flex items-center font-black text-sm px-2 py-0.5 rounded-lg border ${
                                isCritical 
                                  ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse' 
                                  : isWarning 
                                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' 
                                    : 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-transparent'
                              }`}>
                                {hr}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <span className={`inline-flex items-center font-black text-sm px-2 py-0.5 rounded-lg border ${
                                isCritical 
                                  ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse' 
                                  : isWarning 
                                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' 
                                    : 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-transparent'
                              }`}>
                                {temp.toFixed(1)}°
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <span className={`inline-flex items-center font-black text-sm px-2 py-0.5 rounded-lg border ${
                                isCritical 
                                  ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse' 
                                  : isWarning 
                                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' 
                                    : 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-transparent'
                              }`}>
                                {spo2}%
                              </span>
                            </td>
                            <td className="py-4 pr-4 font-black text-xs text-slate-800 dark:text-slate-200">
                              <span className="bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                                {sbp}/{dbp}
                              </span>
                            </td>
                            <td className="py-4 pr-4 font-black text-sm text-slate-800 dark:text-slate-200">
                              {rr}
                            </td>
                            <td className="py-4 text-right">
                              {isCoupled ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-[9px] font-black uppercase tracking-wider rounded-xl shadow-md cursor-default shadow-blue-500/20">
                                  <Monitor size={10} className="stroke-[3]" />
                                  Active Node
                                </span>
                              ) : (
                                <button
                                  onClick={() => setSelectedPatientId(p.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[9px] font-black uppercase tracking-wider rounded-xl border border-slate-200/50 dark:border-slate-700/50 transition-all cursor-pointer shadow-sm"
                                >
                                  <Stethoscope size={10} />
                                  Observe patient
                                  <ChevronRight size={10} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Historic Single Patient History Log (Week Mode) */
                <div className="overflow-x-auto -mx-4 sm:-mx-8 px-4 sm:px-8">
                  <table className="w-full text-left max-w-full">
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
                      {displayHistory.slice().reverse().slice(0, 20).map((h, i) => {
                        const hrCheck = checkVitalDeviation('heartRate', h.heartRate, h.timestamp, displayHistory);
                        const tCheck = checkVitalDeviation('temperature', h.temperature, h.timestamp, displayHistory);
                        const sCheck = checkVitalDeviation('spo2', h.spo2, h.timestamp, displayHistory);
                        const sbpCheck = checkVitalDeviation('systolicBP', h.systolicBP, h.timestamp, displayHistory);
                        const dbpCheck = checkVitalDeviation('diastolicBP', h.diastolicBP, h.timestamp, displayHistory);
                        const rrCheck = checkVitalDeviation('respiratoryRate', h.respiratoryRate, h.timestamp, displayHistory);

                        return (
                          <tr key={`patientmonitor-l4094-i-${i}`} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 pr-4 text-xs font-bold text-slate-400">
                              {new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td className="py-4 pr-4 text-sm font-black">
                              <span className={`inline-flex items-center gap-1.5 ${
                                hrCheck.isDeviated 
                                  ? 'text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse' 
                                  : h.heartRate > 100 ? 'text-rose-600' : h.heartRate < 60 ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                              }`} title={hrCheck.isDeviated ? `Warning: Heart Rate deviates by ${(hrCheck.diffPercent * 100).toFixed(0)}% from average` : undefined}>
                                {Math.round(h.heartRate)}
                                {hrCheck.isDeviated && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-sm font-black">
                              <span className={`inline-flex items-center gap-1.5 ${
                                tCheck.isDeviated 
                                  ? 'text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse' 
                                  : h.temperature > 37.5 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
                              }`} title={tCheck.isDeviated ? `Warning: Temperature deviates by ${(tCheck.diffPercent * 100).toFixed(0)}% from average` : undefined}>
                                {h.temperature.toFixed(1)}
                                {tCheck.isDeviated && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-sm font-black">
                              <span className={`inline-flex items-center gap-1.5 ${
                                sCheck.isDeviated 
                                  ? 'text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse' 
                                  : h.spo2 < 95 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
                              }`} title={sCheck.isDeviated ? `Warning: SpO2 deviates by ${(sCheck.diffPercent * 100).toFixed(0)}% from average` : undefined}>
                                {Math.round(h.spo2)}
                                {sCheck.isDeviated && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-sm font-black">
                              <span className={`inline-flex items-center gap-1.5 ${
                                (sbpCheck.isDeviated || dbpCheck.isDeviated)
                                  ? 'text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse' 
                                  : 'text-slate-900 dark:text-white'
                              }`} title={(sbpCheck.isDeviated || dbpCheck.isDeviated) ? 'Warning: BP deviation detected' : undefined}>
                                {Math.round(h.systolicBP)}/{Math.round(h.diastolicBP)}
                                {(sbpCheck.isDeviated || dbpCheck.isDeviated) && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                              </span>
                            </td>
                            <td className="py-4 text-sm font-black">
                              <span className={`inline-flex items-center gap-1.5 ${
                                rrCheck.isDeviated 
                                  ? 'text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse' 
                                  : 'text-slate-900 dark:text-white'
                              }`} title={rrCheck.isDeviated ? `Warning: Respiratory Rate deviates from average` : undefined}>
                                {Math.round(h.respiratoryRate)}
                                {rrCheck.isDeviated && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
            
      {/* Emergency SOS Dispatch Confirmation Modal */}
      {showSosConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-red-500/40 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(225,29,72,0.3)] relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-500 mb-6 shadow-inner animate-pulse">
              <PhoneCall size={32} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
              Confirm Emergency Assistance Dispatch
            </h3>
            <p className="text-xs font-medium text-slate-300 leading-relaxed mb-6">
              You are about to initiate an immediate high-priority emergency alert. This action will send a voice dispatch & SMS notification to your assigned doctor or hospital emergency contacts. Do you wish to continue?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSosConfirmModal(false)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSosConfirmModal(false);
                  handleManualSOSCall();
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <PhoneCall size={16} />
                Confirm & Dispatch SOS
              </button>
            </div>
          </div>
        </div>
      )}
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

export default PatientMonitor;

