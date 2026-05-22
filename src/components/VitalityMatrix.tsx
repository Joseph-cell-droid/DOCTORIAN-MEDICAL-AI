import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useArduinoContext } from '../ArduinoContext';
import { 
  Dna, 
  Activity, 
  Zap, 
  Heart, 
  Scale, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Target,
  FlaskConical,
  Brain,
  Award,
  Settings,
  X,
  Plus,
  Play,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

export const VitalityMatrix: React.FC = () => {
  const arduino = useArduinoContext();
  const vitals = arduino?.vitals;

  const [isLoading, setIsLoading] = useState(true);
  const [longevityScore, setLongevityScore] = useState(89);
  const [activeSystem, setActiveSystem] = useState<string | null>(null);

  const systemHealthData = [
    { subject: 'Neural', A: vitals ? Math.min(100, Math.max(10, Math.round(100 - Math.abs(vitals.heartRate - 72) * 0.4))) : 95, fullMark: 100 },
    { subject: 'Cardiac', A: vitals ? Math.min(100, Math.max(10, Math.round(100 - Math.abs(vitals.systolicBP - 120) * 0.6 - Math.abs(vitals.diastolicBP - 80) * 0.4))) : 88, fullMark: 100 },
    { subject: 'Metabolic', A: vitals ? Math.min(100, Math.max(10, Math.round(vitals.spo2))) : 92, fullMark: 100 },
    { subject: 'Respiratory', A: vitals ? Math.min(100, Math.max(10, Math.round(100 - Math.abs(vitals.respiratoryRate - 16) * 1.5))) : 82, fullMark: 100 },
    { subject: 'Immune', A: vitals ? Math.min(100, Math.max(10, Math.round(100 - Math.abs(vitals.temperature - 36.8) * 8))) : 91, fullMark: 100 },
    { subject: 'Cellular', A: vitals ? Math.min(100, Math.max(10, Math.round(85 + (vitals.spo2 - 95) * 1.5))) : 85, fullMark: 100 },
  ];

  const [metabolicAge, setMetabolicAge] = useState(24);
  const [actualAge, setActualAge] = useState(32);
  const [showProtocols, setShowProtocols] = useState(false);
  const [viewMode, setViewMode] = useState<'real-time' | 'predictive'>('real-time');
  const [predictionParams, setPredictionParams] = useState({
    timeframe: 90,
    intensity: 'optimal' as 'conservative' | 'optimal' | 'aggressive',
    dataWeight: 'blended' as 'historical' | 'blended' | 'recent'
  });

  // Real-Time Lifestyle Sandbox Controls
  const [sleepHours, setSleepHours] = useState(7.5);
  const [directSunExposure, setDirectSunExposure] = useState(30);
  const [weeklyFastingDuration, setWeeklyFastingDuration] = useState(16);
  const [calorieDeficit, setCalorieDeficit] = useState(0); // in kcal
  const [hiitSessions, setHiitSessions] = useState(2);
  const [activeModel, setActiveModel] = useState<'gero' | 'metabo' | 'sympathetic'>('gero');

  // Scanning Neural Simulation Network
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [scanStep, setScanStep] = useState("Projections calibrated");

  const triggerReforecastSim = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStep("Initializing deep neural net model weights...");
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setScanProgress(currentProgress);
      
      if (currentProgress === 30) {
        setScanStep("Ingesting real-time micro-fluctuations and heartbeat drift...");
      } else if (currentProgress === 60) {
        setScanStep("Synthesizing lifestyle covariates and computing nonlinear regression trajectories...");
      } else if (currentProgress === 85) {
        setScanStep("Resolving epigenetic methylation targets and optimizing autophagy limits...");
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        setScanStep("Real-time neural projection weights fully converged!");
        setTimeout(() => setIsScanning(false), 1200);
      }
    }, 120);
  };

  // Dynamically calculate dynamic prediction curve based on chosen parameters and live vitals
  const baseMetabolic = vitals ? Math.min(100, Math.max(20, Math.round(92 - Math.abs(vitals.heartRate - 70) * 0.2))) : 82;
  const baseRegen = vitals ? Math.min(100, Math.max(20, Math.round(vitals.spo2 * 0.95))) : 78;
  const intensityFactor = predictionParams.intensity === 'aggressive' ? 1.4 : predictionParams.intensity === 'conservative' ? 0.7 : 1.0;

  // Real-time recalculation multiplier based on user sandbox variables!
  const lifestyleFactor = (
    (sleepHours - 7.5) * 0.12 + 
    (directSunExposure - 30) * 0.0015 + 
    (weeklyFastingDuration - 16) * 0.02 + 
    (calorieDeficit > 0 ? calorieDeficit * 0.0003 : calorieDeficit * 0.00015) + 
    (hiitSessions - 2) * 0.065
  );

  const effectiveIntensity = intensityFactor + lifestyleFactor;

  // Active prediction model adjustment
  const modelMetabolicScale = activeModel === 'metabo' ? 1.3 : activeModel === 'sympathetic' ? 0.75 : 1.0;
  const modelRegenScale = activeModel === 'metabo' ? 0.85 : activeModel === 'sympathetic' ? 1.35 : 1.15;

  const predictiveData = Array.from({ length: 7 }, (_, index) => {
    const dayVal = Math.round((predictionParams.timeframe / 6) * index);
    const progressFactor = index / 6; // 0 to 1
    const metabolicGrowth = Math.round(12 * progressFactor * effectiveIntensity * modelMetabolicScale);
    const regenGrowth = Math.round(15 * progressFactor * effectiveIntensity * modelRegenScale);

    return {
      day: `Day ${dayVal}`,
      metabolic: Math.min(100, baseMetabolic + metabolicGrowth),
      regeneration: Math.min(100, baseRegen + regenGrowth),
    };
  });
  
  // Rituals state
  const [rituals, setRituals] = useState([
    { label: 'Cold Exposure', time: 720, total: 900, active: true }, // in seconds
    { label: 'Red Light Therapy', time: 0, total: 600, active: false },
    { label: 'Fasting Window', time: 15120, total: 57600, active: true }, // 16h = 57600s
  ]);

  const hrVal = vitals?.heartRate ?? 72;
  const rawHrv = Math.round(135 - (hrVal * 0.75));

  const hrvHistory = [
    { day: 'Mon', value: Math.round(rawHrv * 0.95), type: 'actual' },
    { day: 'Tue', value: Math.round(rawHrv * 0.98), type: 'actual' },
    { day: 'Wed', value: rawHrv, type: 'actual' },
    { day: 'Thu', value: Math.round(rawHrv * 0.96), type: 'actual' },
    { day: 'Fri', value: Math.round(rawHrv * 1.02), type: 'actual' },
    { day: 'Sat', value: Math.round(rawHrv * 0.99), type: 'actual' },
    { day: 'Sun', value: Math.round(rawHrv * 1.01), type: 'actual' },
    ...(viewMode === 'predictive' ? [
      { day: 'Mon*', value: Math.round(rawHrv * 1.06 * effectiveIntensity), type: 'predicted' },
      { day: 'Tue*', value: Math.round(rawHrv * 1.09 * effectiveIntensity), type: 'predicted' },
      { day: 'Wed*', value: Math.round(rawHrv * 1.13 * effectiveIntensity), type: 'predicted' },
    ] : [])
  ];

  const currentRhr = Math.round(hrVal * 0.94);
  const predictedRhr = Math.max(38, Math.round(hrVal * 0.88 - (sleepHours - 7.5) * 1.3 - (hiitSessions - 2) * 0.6));

  const currentHrv = rawHrv;
  const predictedHrv = Math.round(rawHrv * (1.12 + (sleepHours - 7.5) * 0.045 + (hiitSessions - 2) * 0.025));

  const currentVo2 = vitals ? parseFloat((42.4 + (180 - vitals.heartRate) * 0.06).toFixed(1)) : 54.2;
  const predictedVo2 = vitals ? parseFloat((45.2 + (180 - vitals.heartRate) * 0.08 + (hiitSessions - 2) * 0.75 + (sleepHours - 7.5) * 0.3).toFixed(1)) : 56.8;

  const currentGFlux = vitals ? parseFloat((1.2 + (vitals.temperature - 36.5) * 0.15).toFixed(1)) : 1.4;
  const predictedGFlux = vitals ? parseFloat((1.5 + (vitals.temperature - 36.5) * 0.22 + (weeklyFastingDuration - 16) * 0.03 + (calorieDeficit !== 0 ? 0.12 : 0)).toFixed(1)) : 1.6;

  const metrics = [
    { label: 'VO2 MAX', value: viewMode === 'predictive' ? predictedVo2.toString() : currentVo2.toString(), unit: 'ml/kg/min', icon: <Activity />, color: 'text-blue-500', trend: viewMode === 'predictive' ? `+${(predictedVo2 - currentVo2).toFixed(1)}` : '+4.2%' },
    { label: 'RHR', value: viewMode === 'predictive' ? predictedRhr.toString() : currentRhr.toString(), unit: 'bpm', icon: <Heart />, color: 'text-rose-500', trend: viewMode === 'predictive' ? `-${currentRhr - predictedRhr}` : '-2 bpm' },
    { label: 'G-FLUX', value: viewMode === 'predictive' ? predictedGFlux.toString() : currentGFlux.toString(), unit: 'ratio', icon: <Scale />, color: 'text-purple-500', trend: viewMode === 'predictive' ? `+${(predictedGFlux - currentGFlux).toFixed(1)}` : 'Stable' },
    { label: 'HRV', value: viewMode === 'predictive' ? predictedHrv.toString() : currentHrv.toString(), unit: 'ms', icon: <Zap />, color: 'text-amber-500', trend: viewMode === 'predictive' ? `+${predictedHrv - currentHrv}ms` : '+8ms' },
  ];

  // Update indices incrementally as vitals drift in real-time
  useEffect(() => {
    if (!vitals) return;
    const baseLongevity = Math.min(100, Math.max(30, Math.round(
      95 
      - Math.abs(vitals.heartRate - 70) * 0.1
      - (100 - vitals.spo2) * 1.5
      - Math.abs(vitals.temperature - 36.6) * 2.0
      - Math.abs(vitals.systolicBP - 120) * 0.08
    )));
    
    const baseMetabolicAge = Math.min(50, Math.max(18, Math.round(
      28 
      + Math.abs(vitals.heartRate - 70) * 0.08 
      + (100 - vitals.spo2) * 0.4
      + Math.abs(vitals.systolicBP - 120) * 0.05
    )));

    if (viewMode === 'predictive') {
      const sandboxLongevityBonus = Math.round(
        (sleepHours - 7.5) * 1.8 + 
        (directSunExposure - 30) * 0.06 + 
        (weeklyFastingDuration - 16) * 0.25 + 
        (hiitSessions - 2) * 1.2
      );
      setLongevityScore(Math.min(99, Math.max(40, baseLongevity + sandboxLongevityBonus)));

      const sandboxMetabolicBonus = Math.round(
        (sleepHours - 7.5) * 0.5 + 
        (weeklyFastingDuration - 16) * 0.15 + 
        (calorieDeficit !== 0 ? 0.8 : 0) +
        (hiitSessions - 2) * 0.4
      );
      setMetabolicAge(Math.max(18, baseMetabolicAge - sandboxMetabolicBonus));
    } else {
      setLongevityScore(baseLongevity);
      setMetabolicAge(baseMetabolicAge);
    }
  }, [vitals?.heartRate, vitals?.spo2, vitals?.temperature, vitals?.systolicBP, viewMode, sleepHours, directSunExposure, weeklyFastingDuration, hiitSessions, calorieDeficit]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    const interval = setInterval(() => {
      setRituals(prev => prev.map(r => {
        if (r.active && r.time > 0) {
          return { ...r, time: r.time - 1 };
        }
        return r;
      }));
    }, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'Completed';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRitual = (index: number) => {
    setRituals(prev => prev.map((r, i) => i === index ? { ...r, active: !r.active } : r));
  };

  const hrvData = [65, 68, 72, 70, 75, 71, 72]; // Last 7 days

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center">
          <Dna className="text-emerald-500 animate-spin-slow" size={48} />
        </div>
        <div className="space-y-4 text-center">
          <div className="h-10 w-64 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto" />
          <div className="h-4 w-48 bg-slate-50 dark:bg-slate-900 rounded-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl mt-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white dark:bg-slate-950 min-h-screen font-sans">
      <header className="mb-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-6 py-2 rounded-full border border-slate-100 dark:border-slate-800 mb-8"
        >
          <Dna size={18} className="text-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Personalized longevity analytics</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-6 drop-shadow-sm">
          VITALITY<span className="text-emerald-500">MATRIX</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto font-serif">
          "The science of longevity integrated with real-time performance tracking for a superior health outcome."
        </p>

        <div className="mt-12 flex items-center justify-center">
          <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => setViewMode('real-time')}
              className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                viewMode === 'real-time' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-black/20' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Real-time
            </button>
            <button
              onClick={() => setViewMode('predictive')}
              className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                viewMode === 'predictive' 
                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Zap size={14} className={viewMode === 'predictive' ? 'animate-pulse' : ''} />
              AI Predictive
            </button>
          </div>
        </div>
      </header>

      {/* --- System Health Radar Matrix --- */}
      <section className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Homeostasis Radar</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">System-Wide Cross-Correlation Matrix</p>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={systemHealthData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                  <Radar
                    name="System Health"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Dna size={120} />
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-slate-900 text-white rounded-[3rem] p-10 flex-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Zap size={140} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg">
                    <Brain size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Neural Performance</p>
                    <h4 className="text-2xl font-black uppercase tracking-tight">Cortex Sync active</h4>
                 </div>
              </div>
              <p className="text-slate-400 font-bold leading-relaxed mb-8 max-w-lg">
                Your neural oscillation patterns are currently synchronized at 40Hz (Gamma state), optimal for deep clinical focus and rapid pattern recognition.
              </p>
              <div className="flex gap-4">
                 {[
                   { label: 'Latency', val: '12ms' },
                   { label: 'Buffer', val: '99%' },
                   { label: 'Drift', val: '0.01%' }
                 ].map((stat, i) => (
                   <div key={i} className="px-6 py-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-sm font-black uppercase">{stat.val}</p>
                   </div>
                 ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-blue-600">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biological Age</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">26.4 yr</p>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                 <span className="text-[8px] font-black text-emerald-600 uppercase">-5.6 yr</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group cursor-pointer hover:border-purple-500/50 transition-all">
               <div className="flex items-center gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl text-purple-600">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimization</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">92%</p>
                </div>
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Top Row Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Longevity Card */}
            <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 p-12 opacity-5 scale-150 group-hover:scale-[1.6] transition-transform duration-700 pointer-events-none">
                <FlaskConical size={200} />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between gap-12">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                        {viewMode === 'predictive' ? 'Projected Integrity' : 'Biological Integrity'}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xs leading-relaxed">
                        {viewMode === 'predictive' 
                          ? 'Based on your current trajectory, you are projected to reach the 98th percentile within 12 weeks.'
                          : 'Your cellular health is performing in the 94th percentile for your demographic.'}
                      </p>
                    </div>
                    
                    <div className="flex gap-12">
                      <div className="cursor-pointer group" onClick={() => setMetabolicAge(prev => prev > 20 ? prev - 1 : 25)}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-emerald-500 transition-colors">
                          {viewMode === 'predictive' ? 'Projected Metabolic Age' : 'Metabolic Age'}
                        </p>
                        <p className="text-4xl font-black text-emerald-500">
                          {viewMode === 'predictive' ? metabolicAge - 2 : metabolicAge}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Actual Age</p>
                        <p className="text-4xl font-black text-slate-900 dark:text-white">{actualAge}</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-emerald-100 dark:shadow-emerald-950/20 border border-emerald-50 dark:border-emerald-900/10 cursor-help"
                    onClick={() => setLongevityScore(prev => prev > 98 ? 80 : prev + 1)}
                  >
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                        <motion.circle 
                          cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                          strokeDasharray={351} 
                          initial={{ strokeDashoffset: 351 }}
                          animate={{ strokeDashoffset: 351 - (351 * longevityScore) / 100 }} 
                          className="text-emerald-500" 
                          strokeLinecap="round" 
                        />
                      </svg>
                      <span className="absolute text-2xl font-black text-slate-900 dark:text-white">{longevityScore}%</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6">Longevity Index</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metabolic Efficiency - NEW */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                     <FlaskConical size={60} />
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight mb-6">
                    {viewMode === 'predictive' ? 'Projected Autophagy' : 'Autophagy Progress'}
                  </h4>
                  <div className="flex items-end gap-6 mb-8 text-center">
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Cellular Cleanup</p>
                        <p className="text-3xl font-black text-emerald-500">
                          {viewMode === 'predictive' ? 'Optimized' : 'Active'}
                        </p>
                     </div>
                     <div className="flex-1 border-x border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Target Fast</p>
                        <p className="text-3xl font-black">{viewMode === 'predictive' ? '18h' : '15h'}</p>
                     </div>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                     <div 
                       className="bg-emerald-500 h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                       style={{ width: viewMode === 'predictive' ? '95%' : '82%' }}
                     />
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {viewMode === 'predictive' ? 'Future Glucose Path' : 'Glucose Stability'}
                      </h4>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${viewMode === 'predictive' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 leading-relaxed italic">
                      {viewMode === 'predictive' 
                        ? 'Projected stability index based on ritual adherence.'
                        : 'Optimal glycemic control detected. 24h peak: 112 mg/dL.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex gap-1 items-end h-8">
                        {[16, 24, 12, 18, 30, 22, 14, 10, 8, 12].map((h, i) => (
                           <div key={i} className={`w-2 rounded-full transition-all duration-500 ${i > 6 ? 'bg-emerald-100 dark:bg-emerald-900/40 opacity-50' : 'bg-blue-100 dark:bg-blue-900/40'}`} style={{ height: h, display: i > 6 && viewMode !== 'predictive' ? 'none' : 'block' }} />
                        ))}
                     </div>
                     <span className={`text-2xl font-black tracking-tighter ${viewMode === 'predictive' ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {viewMode === 'predictive' ? '99.9%' : '99.8%'}
                     </span>
                  </div>
               </div>
            </div>

            {metrics.map((metric, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${metric.color}`}>
                      {metric.icon}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span className="text-xs font-black text-emerald-500">{metric.trend}</span>
                    </div>
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric.label}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{metric.value}</span>
                    <span className="text-xs font-bold text-slate-400">{metric.unit}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dedicated HRV Analysis Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Zap className="text-amber-500" size={24} />
                  {viewMode === 'predictive' ? 'Bio-AI Predictive Trajectory' : 'HRV Bio-Analytic History'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {viewMode === 'predictive' ? 'Projected Parasympathetic Dominance' : 'Autonomic Nervous System Balace (7-Day Trace)'}
                </p>
              </div>
              <div className="flex gap-4">
                {viewMode === 'predictive' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Predictive mode active</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${viewMode === 'predictive' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Recovery</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg cursor-pointer">
                  <Info size={16} className="text-slate-400" />
                </div>
              </div>
            </div>

            <div className="h-80 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hrvHistory}>
                  <defs>
                    <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#0f172a',
                      color: '#fff'
                    }}
                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                    labelStyle={{ fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', opacity: 0.5 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={viewMode === 'predictive' ? '#10b981' : '#f59e0b'} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill={`url(#${viewMode === 'predictive' ? 'hrvPredictiveGradient' : 'hrvGradient'})`} 
                    animationDuration={2000}
                  />
                  {viewMode === 'predictive' && (
                    <defs>
                      <linearGradient id="hrvPredictiveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { label: viewMode === 'predictive' ? 'Projected Avg' : 'Weekly Avg', value: viewMode === 'predictive' ? '76.2ms' : '70.4ms' },
                { label: viewMode === 'predictive' ? 'Future Peak' : 'Highest Peak', value: viewMode === 'predictive' ? '82ms' : '75ms' },
                { label: 'ANS State', value: 'Parasympathetic' }
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-400 mb-8">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Premium Bio-Hack</span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Longevity Rituals</h3>
              <p className="text-slate-400 text-sm font-bold mb-10 leading-relaxed">Optimizing your biological clock through specialized cold exposure and intermittent fasting protocols.</p>
              
              <div className="space-y-4 mb-10">
                {rituals.map((task, i) => (
                  <motion.div 
                    key={i} 
                    layout
                    onClick={() => toggleRitual(i)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${task.active ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/5 bg-white/5 opacity-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${task.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      <span className="text-sm font-black">{task.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{formatTime(task.time)}</span>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={() => setShowProtocols(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Configure Protocols
              </button>
            </div>
          </section>

          <section className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center justify-between uppercase tracking-tight">
              {viewMode === 'predictive' ? 'AI Projected Targets' : 'Performance Targets'}
              <Target size={20} className={viewMode === 'predictive' ? 'text-emerald-500' : 'text-slate-400'} />
            </h4>
            <div className="space-y-6">
              {[
                { label: 'Cellular Recovery', progress: viewMode === 'predictive' ? 94 : 85 },
                { label: 'Hormonal Balance', progress: viewMode === 'predictive' ? 78 : 62 },
                { label: 'Liver Detoxification', progress: viewMode === 'predictive' ? 55 : 41 },
              ].map((target, i) => (
                <div key={i} className="cursor-help group">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                      {target.label}
                    </span>
                    <span className="text-xs font-black text-slate-400 tracking-tight">
                      {target.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      key={`${viewMode}-${i}`}
                      initial={{ width: 0 }} 
                      animate={{ width: `${target.progress}%` }} 
                      transition={{ duration: 1.5, ease: "easeOut" }} 
                      className={`h-full rounded-full ${viewMode === 'predictive' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
                <Award size={24} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Elite Benchmarking</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Compare with Top 1%</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* --- Predictive Bio-Markers Section --- */}
      <section className="mt-16 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
        <div className="p-8 sm:p-12">
          
          {/* Section Header with General Model Config & Model Variant Selection */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600/10 p-2 rounded-xl text-blue-600">
                  <TrendingUp size={20} />
                </div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Neural Forecasting Sandbox</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
                Predictive <span className="text-blue-600 font-serif italic normal-case lowercase animate-pulse">Bio-Markers</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">
                Connect live biological feeds with real-time lifestyle adjustments to simulate telomeric decay, autonomic balance, and cellular regeneration curves.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Timeframe (Days)</label>
                <div className="flex gap-2">
                  {[30, 90, 180].map(d => (
                    <button 
                      key={d}
                      onClick={() => {
                        setPredictionParams(p => ({ ...p, timeframe: d }));
                        triggerReforecastSim();
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${predictionParams.timeframe === d ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-slate-600'}`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Intensity</label>
                <div className="flex gap-2">
                  {['conservative', 'optimal', 'aggressive'].map(i => (
                    <button 
                      key={i}
                      onClick={() => {
                        setPredictionParams(p => ({ ...p, intensity: i as any }));
                        triggerReforecastSim();
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black capitalize transition-all ${predictionParams.intensity === i ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-slate-600'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Model Variant Selector Menu */}
          <div className="mb-10 p-3 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3">
            {[
              { id: 'gero', label: 'Gero-Aging (DNA & Telomere Health)', desc: 'Forecasts cellular longevity, epigenetic age markers, and chromosome integrity index.' },
              { id: 'metabo', label: 'Metabolic & Autophagy Core', desc: 'Predictive insulin sensitivity pathways, peak autophagy progress rates, and caloric transport efficiency.' },
              { id: 'sympathetic', label: 'Sympathetic Balancer (CNS)', desc: 'Autonomic system resonance trends, projected heart rate variability milestones, and biological rest ratios.' }
            ].map(modelOpt => (
              <button
                key={modelOpt.id}
                onClick={() => {
                  setActiveModel(modelOpt.id as any);
                  triggerReforecastSim();
                }}
                className={`flex-1 p-5 rounded-2.5xl transition-all text-left border ${
                  activeModel === modelOpt.id 
                    ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/5 dark:shadow-blue-500/10' 
                    : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/40'
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${activeModel === modelOpt.id ? 'text-blue-500' : 'text-slate-400'}`}>
                  {modelOpt.label}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                  {modelOpt.desc}
                </p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* Left Column: Model Live View, Predictions Curves, and Environmental Sandbox */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Forecast Card and Real-Time Neural Calibrator Feed */}
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
                
                {/* Visual Neural Net Scanning Banner */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-x-0 top-0 bg-blue-600 text-white py-3 px-6 text-xs font-black uppercase tracking-widest flex items-center justify-between z-20"
                    >
                      <div className="flex items-center gap-2">
                        <Brain size={14} className="animate-spin" />
                        <span>{scanStep}</span>
                      </div>
                      <span className="font-mono">{scanProgress}%</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mb-8 mt-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-blue-600 animate-pulse" />
                    Real-Time Prognostic Trajectory Core
                  </h3>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metabolic</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regenerative</span>
                     </div>
                  </div>
                </div>

                <div className="h-[380px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictiveData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="metabolicGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="regenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                        domain={[20, 100]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '1rem', 
                          padding: '1rem',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="metabolic" 
                        stroke="#2563eb" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#metabolicGradient)" 
                        animationDuration={1500}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="regeneration" 
                        stroke="#10b981" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#regenGradient)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic Bio-Environmental Environmental Sandbox Controls row */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Settings size={16} className="text-emerald-500 animate-spin-slow" />
                      Dynamic Epigenetic Sandbox Controls
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Adjust lifestyle predictors to run immediate micro-regressions</p>
                  </div>
                  <button 
                    onClick={triggerReforecastSim}
                    className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Recalibrate Model
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Slider 1: Sleep Duration */}
                  <div className="p-4 bg-white dark:bg-slate-950 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Sleep Architecture</span>
                      <span className="text-xs font-black text-blue-500">{sleepHours} Hours / Night</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="10"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => {
                        setSleepHours(Number(e.target.value));
                        if (!isScanning) triggerReforecastSim();
                      }}
                      className="w-full accent-blue-600 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Correlates deep & circadian REM recovery cycles</p>
                  </div>

                  {/* Slider 2: Sunlight Exposure */}
                  <div className="p-4 bg-white dark:bg-slate-950 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Direct Helio-Exposure (Sun)</span>
                      <span className="text-xs font-black text-amber-500">{directSunExposure} Minutes / Day</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="10"
                      value={directSunExposure}
                      onChange={(e) => {
                        setDirectSunExposure(Number(e.target.value));
                        if (!isScanning) triggerReforecastSim();
                      }}
                      className="w-full accent-amber-500 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Modulates cellular ATP synthesis & circadian clock</p>
                  </div>

                  {/* Slider 3: Fasting window */}
                  <div className="p-4 bg-white dark:bg-slate-950 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Intermittent Fasting Window</span>
                      <span className="text-xs font-black text-purple-500">{weeklyFastingDuration} Hours / Fast</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      step="1"
                      value={weeklyFastingDuration}
                      onChange={(e) => {
                        setWeeklyFastingDuration(Number(e.target.value));
                        if (!isScanning) triggerReforecastSim();
                      }}
                      className="w-full accent-purple-500 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Adjusts targeted lysosomal clean-up (Autophagy index)</p>
                  </div>

                  {/* Slider 4: Cardiorespiratory HIIT sessions */}
                  <div className="p-4 bg-white dark:bg-slate-950 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Cardiorespiratory HIIT Load</span>
                      <span className="text-xs font-black text-emerald-500">{hiitSessions} Sessions / Week</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={hiitSessions}
                      onChange={(e) => {
                        setHiitSessions(Number(e.target.value));
                        if (!isScanning) triggerReforecastSim();
                      }}
                      className="w-full accent-emerald-500 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Drives VO2 max expansion & stroke volume capability</p>
                  </div>
                </div>

                {/* Optional Caloric Offset Button Slider */}
                <div className="mt-5 p-4 bg-white dark:bg-slate-950 rounded-[1.5rem] border border-slate-105 dark:border-slate-800/80">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Caloric Partition Shift</span>
                    <span className="text-xs font-black text-indigo-505 dark:text-indigo-400">
                      {calorieDeficit === 0 ? 'Equilibrium (Isocaloric)' : calorieDeficit > 0 ? `Deficit: -${calorieDeficit} kcal` : `Surplus: +${Math.abs(calorieDeficit)} kcal`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-500"
                    max="500"
                    step="100"
                    value={calorieDeficit * -1}
                    onChange={(e) => {
                      setCalorieDeficit(Number(e.target.value) * -1);
                      if (!isScanning) triggerReforecastSim();
                    }}
                    className="w-full accent-indigo-500 h-1 bg-slate-101 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Affects mitochondrial density vs metabolic signaling</p>
                </div>
              </div>
            </div>

            {/* Right Column: Outcomes Cards, Confidence Rating, and LIVE BIOMETRICS DRIFT correlation ticker */}
            <div className="xl:col-span-4 space-y-6">
              
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between min-h-[190px]">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">AI PROJECTED AUTOPHAGIC REACH</p>
                   <h4 className="text-3xl font-black tracking-tight text-emerald-400">
                     {activeModel === 'metabo' ? Math.round(92 + (weeklyFastingDuration - 16) * 1.5) : Math.round(82 + (weeklyFastingDuration - 16) * 1.0)}% Efficacy
                   </h4>
                </div>
                <div className="flex items-center gap-3 text-emerald-300">
                   <Zap size={18} />
                   <p className="text-xs font-medium leading-tight text-slate-300">
                     Lysosomal degradation of damaged proteins peaked based on custom fasting window parameters.
                   </p>
                </div>
              </div>

              <div className="bg-emerald-500 text-white rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[190px] shadow-lg shadow-emerald-500/20">
                <div>
                   <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2">Cellular Age Delta</p>
                   <h4 className="text-3xl font-black tracking-tight select-none">
                     {(-1.8 - (sleepHours - 7.5) * 0.45 - (weeklyFastingDuration - 16) * 0.08 - (hiitSessions - 2) * 0.18).toFixed(1)} Years
                   </h4>
                </div>
                <div className="flex items-center gap-3 text-white">
                   <Clock size={18} />
                   <p className="text-xs font-semibold leading-tight">
                     Biological decay slows in real-time. Telomere length stabilization forecasted at Day 45.
                   </p>
                </div>
              </div>

              {/* Real-Time Correlation Drift Ticker Card */}
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Biometrics Drift Impact</h4>
                  <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <p className="font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-1">
                      Cardiovascular Drift
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Live HR at <span className="font-bold text-blue-500">{vitals?.heartRate ?? 72} bpm</span> is pulling the longevity index prediction <span className="font-black text-emerald-500">{(vitals && vitals.heartRate < 75) ? 'UPWARD' : 'DOWNWARD'}</span> by <span className="font-bold">{(Math.abs((vitals?.heartRate ?? 72) - 72) * 0.18).toFixed(2)}%</span>.
                    </p>
                  </div>
                  
                  <div className="text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <p className="font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-1">
                      Mitochondrial Saturation
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      O2 levels at <span className="font-bold text-blue-500">{vitals?.spo2 ?? 98}%</span> establishes cellular transcription efficiency at <span className="font-bold text-emerald-500">{((vitals?.spo2 ?? 98) * 0.95).toFixed(1)}%</span>.
                    </p>
                  </div>

                  <div className="text-xs">
                    <p className="font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-1">
                      Thermoregulation Flux
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Core temperature of <span className="font-bold text-blue-500">{vitals?.temperature ?? 36.8}°C</span> shifts baseline metabolic regression calculations, optimizing cellular homeostasis.
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Confidence Tracker */}
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Simulation Confidence Limit</h4>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                    {Math.min(98, Math.round(92 + (sleepHours > 7 ? 2 : -2) + (hiitSessions > 1 ? 1 : -1)))}%
                  </span>
                  <span className="text-emerald-500 text-xs font-black mb-1 flex items-center gap-1">
                    <TrendingUp size={14} /> +{(sleepHours > 7) ? '2' : '0'}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(98, Math.round(92 + (sleepHours > 7 ? 2 : -2) + (hiitSessions > 1 ? 1 : -1)))}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showProtocols && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowProtocols(false)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white z-10"
              >
                <X size={28} />
              </button>

              <div className="p-12">
                <div className="flex items-center gap-4 mb-2">
                  <Settings size={32} className="text-emerald-500" />
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Protocol Configuration</h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold mb-12 uppercase tracking-widest text-[10px]">Customize your biological enhancement schedule</p>

                <div className="space-y-6">
                  {[
                    { name: 'Cold Exposure', interval: 'Daily', intensity: 'Advanced (2°C)', icon: <Zap size={18} /> },
                    { name: 'Red Light Therapy', interval: '3x Weekly', intensity: 'Standard', icon: <Scale size={18} /> },
                    { name: 'Fast Autophagy', interval: '16/8 Window', intensity: 'Intermittent', icon: <Heart size={18} /> },
                    { name: 'Hyperbaric Oxygen', interval: 'Monthly', intensity: 'Clinical', icon: <Activity size={18} /> },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 group hover:border-emerald-500/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                          {p.icon}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{p.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{p.interval} • {p.intensity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
                          <Play size={20} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex gap-4">
                  <button className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all text-white">
                    Save Changes
                  </button>
                  <button className="px-8 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Plus size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
