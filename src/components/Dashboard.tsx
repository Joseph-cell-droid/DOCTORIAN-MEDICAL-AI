import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Zap, Brain, ShieldCheck, RefreshCw, 
  Bot, Monitor, FileText, Stethoscope, LayoutGrid, 
  Info, Bell, Search, Plus, ArrowRight, ArrowLeft, X, Pill, ChevronRight,
  TrendingUp, Heart, Battery, Droplets, Clock,
  CheckCircle2,
  ListTodo,
  Sparkles, Lightbulb, Quote, Cpu, Wind, Shield, Download, Fingerprint,
  Terminal, Code2, Flame, Trophy, CalendarDays, Gift, Check
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell 
} from 'recharts';
import { SafeResponsiveContainer } from './SafeResponsiveContainer';
import BioSimulation from './BioSimulation';
import { BioSecurity } from './BioSecurity';
import { api } from '../api';
import { WeatherWidget } from './WeatherWidget';
import { AnomalyDetector } from './AnomalyDetector';
import { Vitals, HealthStatus } from '../hooks/useArduino';
import { VitalWaveform } from './VitalWaveform';
import { isCreditsUnlimited, parseCreditsToNumber, formatCredits } from '../utils/creditUtils';
import { translate } from '../utils/translations';

const performanceData = [
  { time: '00:00', value: 82 },
  { time: '04:00', value: 78 },
  { time: '08:00', value: 92 },
  { time: '12:00', value: 88 },
  { time: '16:00', value: 95 },
  { time: '20:00', value: 85 },
  { time: '23:59', value: 90 },
];


interface DashboardProps {
  onNavigate: (view: any) => void;
  user: any;
  aiInsight?: string | null;
  onRefreshInsight: () => void;
  isInsightLoading: boolean;
  onInstall: () => void;
  vitals: Vitals | null;
  healthStatus: HealthStatus | null;
  history: Vitals[];
  onUpdateUser?: (u: any) => void;
  currentLanguage?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  user, 
  aiInsight, 
  onRefreshInsight, 
  isInsightLoading,
  onInstall,
  vitals,
  healthStatus,
  history,
  onUpdateUser,
  currentLanguage = 'English (US)'
}) => {
  const vitalStats = [
    { 
      label: translate('Doctorian AI Core', currentLanguage), 
      value: '99.8%', 
      trend: translate('Optimal', currentLanguage), 
      icon: <Brain size={16} />, 
      color: 'blue',
      details: translate('Primary clinical reasoning layer. Successfully integrated and synchronizing real-time Uganda Ministry of Health Care Guidance protocols, VHT community registry logs, bio-stethoscope diagnostics, and regional patient telemetry with sub-millisecond latencies.', currentLanguage)
    },
    { label: translate('Cardiac Flux', currentLanguage), value: '72 BPM', trend: '+2%', icon: <Heart size={16} />, color: 'rose' },
    { label: translate('Neural Energy', currentLanguage), value: `${formatCredits(user?.credits)} Units`, trend: translate('Resets Daily', currentLanguage), icon: <Battery size={16} />, color: 'emerald' },
    { label: translate('Hydration', currentLanguage), value: '2.4L', trend: '+0.4', icon: <Droplets size={16} />, color: 'cyan' },
  ];

  const [meds, setMeds] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('medical_offline_medications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [workouts, setWorkouts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('medical_offline_workouts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('doctorian_vitality_streak');
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });

  const [lastClaimedDate, setLastClaimedDate] = useState<string>(() => {
    return localStorage.getItem('doctorian_streak_claimed_date') || '';
  });

  const [claimedMilestones, setClaimedMilestones] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('doctorian_claimed_milestones');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [weeklyStatus, setWeeklyStatus] = useState<boolean[]>([true, true, true, true, true, false, false]);

  const [tasks, setTasks] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('doctorian_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse tasks from localStorage", e);
      return [];
    }
  });

  const [appointments, setAppointments] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('doctorian_appointments');
      return saved ? JSON.parse(saved) : [
        { id: '1', specialist: { name: 'Dr. Sarah Johnson' }, date: new Date(Date.now() + 86400000).toISOString(), slot: '10:30 AM', type: 'virtual' }
      ];
    } catch (e) {
      console.error("Failed to parse appointments from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      const savedTasks = localStorage.getItem('doctorian_tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      const savedAppts = localStorage.getItem('doctorian_appointments');
      if (savedAppts) setAppointments(JSON.parse(savedAppts));
      const savedMeds = localStorage.getItem('medical_offline_medications');
      if (savedMeds) setMeds(JSON.parse(savedMeds));
      const savedWorkouts = localStorage.getItem('medical_offline_workouts');
      if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const loadMedsAndWorkouts = async () => {
      try {
        const medsData = await api.medications.list();
        if (medsData) setMeds(medsData);
      } catch (err) {
        console.error("Failed to load meds for streak calculation", err);
      }
      try {
        const workoutsData = await api.workouts.list();
        if (workoutsData) setWorkouts(workoutsData);
      } catch (err) {
        console.error("Failed to load workouts for streak calculation", err);
      }
    };
    loadMedsAndWorkouts();
  }, []);

  useEffect(() => {
    if (meds.length === 0 && workouts.length === 0) {
      return;
    }

    const medsCount = meds.length;
    const medsTakenTodayCount = meds.filter((m: any) => m.takenToday).length;
    
    const today = new Date();
    const workoutToday = workouts.some((w: any) => {
      if (!w.date) return false;
      const d = new Date(w.date);
      return d.getDate() === today.getDate() &&
             d.getMonth() === today.getMonth() &&
             d.getFullYear() === today.getFullYear();
    });

    const medAdherenceToday = medsCount > 0 ? (medsTakenTodayCount / medsCount >= 0.5) : false;
    const adheredToday = medAdherenceToday || workoutToday;

    const complianceDates = new Set<string>();

    workouts.forEach((w: any) => {
      if (w.date) {
        complianceDates.add(new Date(w.date).toDateString());
      }
    });

    meds.forEach((m: any) => {
      if (Array.isArray(m.takenTimes)) {
        m.takenTimes.forEach((t: any) => {
          if (t) {
            complianceDates.add(new Date(t).toDateString());
          }
        });
      }
      if (m.takenToday) {
        complianceDates.add(new Date().toDateString());
      }
    });

    let computedStreak = 0;
    let checker = new Date();
    const todayString = checker.toDateString();

    let hasTodayCompliance = complianceDates.has(todayString) || adheredToday;

    if (hasTodayCompliance) {
      computedStreak = 1;
      checker.setDate(checker.getDate() - 1);
      while (complianceDates.has(checker.toDateString())) {
        computedStreak++;
        checker.setDate(checker.getDate() - 1);
      }
    } else {
      checker.setDate(checker.getDate() - 1);
      while (complianceDates.has(checker.toDateString())) {
        computedStreak++;
        checker.setDate(checker.getDate() - 1);
      }
    }

    const finalStreak = Math.max(computedStreak, streakDays);
    if (finalStreak !== streakDays && finalStreak > 0) {
      setStreakDays(finalStreak);
      localStorage.setItem('doctorian_vitality_streak', finalStreak.toString());
    }

    const dowIndices = [1, 2, 3, 4, 5, 6, 0];
    const currentDow = new Date().getDay();
    const activeDowIndex = dowIndices.indexOf(currentDow);

    const updatedWeekly = [true, true, true, true, true, false, false];
    if (activeDowIndex !== -1) {
      updatedWeekly[activeDowIndex] = adheredToday;
      for (let idx = 0; idx < 7; idx++) {
        const offset = idx - activeDowIndex;
        const targetDayDate = new Date();
        targetDayDate.setDate(targetDayDate.getDate() + offset);
        
        if (offset > 0) {
          updatedWeekly[idx] = false;
        } else if (offset < 0) {
          updatedWeekly[idx] = complianceDates.has(targetDayDate.toDateString());
        }
      }
    }
    setWeeklyStatus(updatedWeekly);

  }, [meds, workouts]);

  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const [activeMetric, setActiveMetric] = useState('performance');
  const [isSosTriggering, setIsSosTriggering] = useState(false);
  
  // High-visibility long-press variables and handlers
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const pressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (isSosTriggering) return;
    setIsPressing(true);
    setLongPressProgress(0);
    const duration = 1200; // 1.2s for highly responsive verification
    const intervalTime = 20;
    const steps = duration / intervalTime;
    let currentStep = 0;

    if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);

    pressIntervalRef.current = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 100);
      setLongPressProgress(progress);
      if (progress >= 100) {
        if (pressIntervalRef.current) {
          clearInterval(pressIntervalRef.current);
          pressIntervalRef.current = null;
        }
        setIsPressing(false);
        setLongPressProgress(0);
        handleSOS();
      }
    }, intervalTime);
  };

  const cancelPress = () => {
    setIsPressing(false);
    setLongPressProgress(0);
    if (pressIntervalRef.current) {
      clearInterval(pressIntervalRef.current);
      pressIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (pressIntervalRef.current) {
        clearInterval(pressIntervalRef.current);
      }
    };
  }, []);
  const [showBioCore, setShowBioCore] = useState(false);
  const [showBioSecurity, setShowBioSecurity] = useState(false);
  const [selectedStat, setSelectedStat] = useState<any>(null);
  const [notifications, setNotifications] = useState<{id: string, text: string, type: 'info' | 'success' | 'warning'}[]>([]);
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [viewMode, setViewMode] = useState<'Real-time' | 'Predictive'>('Real-time');
  
  const [subView, setSubView] = useState<'main' | 'biosecurity' | 'alerts'>('main');
  
  const [systemLogs, setSystemLogs] = useState<{ id: string, event: string, time: string, level: 'low' | 'mid' | 'critical' }[]>([
    { id: '1', event: 'Neural Link Synchronized', time: '12:42', level: 'low' },
    { id: '2', event: 'Metabolic Shift Detected', time: '09:15', level: 'mid' },
    { id: '3', event: 'Node Activation Successful', time: '08:00', level: 'low' },
    { id: '4', event: 'Unauthorized Access Blocked', time: '04:22', level: 'critical' },
  ]);
  
  const addNotification = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, text, type }]);
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDiagnosticLogs(prev => [`[${timeStr}] VITALITY: ${text}`, ...prev.slice(0, 5)]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([
    'COGNIS: Baseline synchronized',
    'BIO: Cardiac flux stabilized',
    'SYS: AES-256 Link Active'
  ]);

  useEffect(() => {
    const intervals = [
      'SYS: Analyzing biomarker drift...',
      'LOG: Cognis load at 42%',
      'BIO: Metabolic sync complete',
      'AUTH: RSA Verification passed',
      'DATA: Encrypted stream open'
    ];
    
    const interval = setInterval(() => {
      setDiagnosticLogs(prev => [intervals[Math.floor(Math.random() * intervals.length)], ...prev.slice(0, 2)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getDynamicData = () => {
    const base = [...performanceData];
    if (viewMode === 'Predictive') {
      return base.map(d => ({ ...d, value: Math.min(100, d.value + (Math.random() * 10 - 5)) }));
    }
    if (timeframe === 'Week') {
      return base.map(d => ({ ...d, value: d.value - 5 }));
    }
    if (timeframe === 'Month') {
      return base.map(d => ({ ...d, value: d.value + 2 }));
    }
    return base;
  };

  const handleSOS = async () => {
    // We remove the confirm prompt for "at once" action as requested, 
    // but keep the button clicking as the trigger mechanism.
    setIsSosTriggering(true);
    try {
      await api.alerts.triggerSOS(user?.displayName || user?.email || 'Anonymous Patient');
      addNotification("CRITICAL: SOS Alert Sequence Initiated. Responsible specialists notified.", "warning");
    } catch (err: any) {
      console.error(err);
      addNotification("SOS sequence failed to initialize. Please contact emergency services manually.", "warning");
    } finally {
      setIsSosTriggering(false);
    }
  };

  const getStatColorClasses = (color: string) => {
    const maps: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-500/20',
      rose: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-500/20',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-500/20',
      cyan: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-500/20',
      amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/20',
    };
    return maps[color] || maps.blue;
  };

  const getStatBgBlurClasses = (color: string) => {
    const maps: Record<string, string> = {
      blue: 'bg-blue-500/5 group-hover:bg-blue-500/10',
      rose: 'bg-rose-500/5 group-hover:bg-rose-500/10',
      emerald: 'bg-emerald-500/5 group-hover:bg-emerald-500/10',
      cyan: 'bg-cyan-500/5 group-hover:bg-cyan-500/10',
      amber: 'bg-amber-500/5 group-hover:bg-amber-500/10',
    };
    return maps[color] || maps.blue;
  };

  return (
    <AnimatePresence mode="wait">
      {subView === 'main' ? (
        <motion.div 
          key="main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6 sm:space-y-12 pb-24 px-4 sm:px-6 lg:px-8"
        >
          {/* AI Wellness Insight Card */}
          <AnimatePresence>
            {aiInsight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mb-12"
              >
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(37,99,235,0.3)] relative overflow-hidden group border border-white/10">
                  {/* Neural Grid Pattern Background */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse" />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 sm:gap-14">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white text-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/20 group-hover:rotate-6 transition-transform duration-500">
                        {isInsightLoading ? <RefreshCw className="animate-spin" size={28} /> : <Sparkles size={32} />}
                      </div>
                      {!isInsightLoading && (
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute -inset-4 bg-white/20 rounded-[2.5rem] blur-xl -z-10"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 text-center lg:text-left space-y-4">
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                          Neural Intelligence Level 5
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-400/20 backdrop-blur-md text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-400/20">
                          <CheckCircle2 size={10} /> Validated Insights
                        </div>
                      </div>
                      
                      <h3 className="text-3xl sm:text-4xl font-[1000] text-white uppercase tracking-tighter leading-[0.9]">
                        Doctorian <br /><span className="text-blue-200">Wellness Protocol</span>
                      </h3>
                      
                      <p className="text-blue-50/90 font-medium text-lg sm:text-xl leading-relaxed max-w-2xl">
                        {isInsightLoading ? "Synchronizing with your metabolic biomarkers..." : aiInsight}
                      </p>

                      <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6">
                         <div className="flex -space-x-2">
                           {[1, 2, 3, 4].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-500 flex items-center justify-center text-[8px] font-black text-white">
                               AI
                             </div>
                           ))}
                         </div>
                         <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest">Trusted by 24,000+ Specialists</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 shrink-0 w-full lg:w-auto">
                      <button 
                        onClick={onRefreshInsight}
                        disabled={isInsightLoading}
                        className="px-10 py-5 bg-white text-blue-900 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-50 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/40"
                      >
                        <RefreshCw size={18} className={isInsightLoading ? "animate-spin" : ""} />
                        {isInsightLoading ? "Syncing..." : "Initialize Update"}
                      </button>
                      <p className="text-center text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Last Neural Sync: 2m ago</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[3rem] p-5 sm:p-10 lg:p-16 shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-800 transition-all group max-w-7xl mx-auto w-full">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
          <Activity size={320} className="w-[160px] h-[160px] sm:w-[320px] sm:h-[320px] text-blue-600" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center">
          <div className="lg:col-span-12 xl:col-span-7 space-y-5 sm:space-y-8 flex flex-col items-center xl:items-start text-center xl:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-10 w-full">
              <div className="flex items-center gap-3 sm:gap-6 justify-center xl:justify-start">
                <div className="w-1.5 h-8 sm:w-2.5 sm:h-12 bg-blue-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)] flex-shrink-0" />
                <div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-[1000] tracking-tighter uppercase leading-tight text-slate-900 dark:text-white text-high-visibility">
                    Cognis <span className="text-blue-600 italic font-serif lowercase tracking-normal">Nexus</span> Control
                  </h1>
                  <p className="text-blue-600 dark:text-blue-400 font-black text-[8px] sm:text-[12px] uppercase tracking-[0.3em] mt-1 sm:mt-2 text-high-visibility text-center xl:text-left">Operational Integrity: 99.9% / Quantum Secure</p>
                </div>
              </div>
              <button 
                onClick={() => setSubView('alerts')}
                className="w-full sm:w-auto group flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <div className="relative">
                  <Bell size={20} className="text-blue-600 dark:text-blue-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-600 rounded-full border-2 border-white dark:border-slate-800" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">Operational Alerts</p>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">3 New Pulses</p>
                </div>
              </button>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-xl lg:text-2xl leading-relaxed max-w-4xl">
              Unified diagnostic interface for {user?.name || user?.displayName || 'Authorized User'}. Real-time biometric synthesis and predictive modeling active.
            </p>

            <div className="flex flex-row items-center flex-wrap gap-6 pt-2 sm:pt-4 w-full justify-center xl:justify-start">
              <button 
                onClick={() => onNavigate('ai_nexus')}
                className="w-auto px-6 sm:px-8 py-3.5 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all font-black text-[10px] sm:text-base uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 border-2 border-transparent"
              >
                <Bot size={20} className="text-white animate-pulse" />
                Doctorian
              </button>

              {/* High-visibility circular SOS next to Doctorian */}
              <div className="flex items-center gap-3 relative select-none">
                <div 
                  className="relative cursor-pointer"
                  onMouseDown={startPress}
                  onMouseUp={cancelPress}
                  onMouseLeave={cancelPress}
                  onTouchStart={startPress}
                  onTouchEnd={cancelPress}
                  onClick={handleSOS}
                >
                  {/* Pulsing Light Aura */}
                  <div className={`absolute inset-0 bg-rose-600 rounded-full blur-xl transition-all duration-300 opacity-60 ${
                    isPressing ? 'scale-125 opacity-100' : 'scale-100 hover:scale-110'
                  }`} />

                  {/* Ring Outline */}
                  <div className={`absolute -inset-2 rounded-full border border-rose-500/30 transition-all duration-300 ${
                    isPressing ? 'scale-110 border-rose-500' : 'scale-100 hover:scale-105 animate-pulse'
                  }`} />

                  {/* Progress Circle SVG */}
                  <svg className="absolute -inset-1 w-[72px] h-[72px] -rotate-90 pointer-events-none z-10">
                    <circle
                      cx="36"
                      cy="36"
                      r="28"
                      stroke="rgba(244, 63, 94, 0.1)"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="36"
                      cy="36"
                      r="28"
                      stroke="rgb(244, 63, 94)"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={(2 * Math.PI * 28) - (longPressProgress / 100) * (2 * Math.PI * 28)}
                      strokeLinecap="round"
                      className="transition-all duration-75"
                    />
                  </svg>

                  {/* Main Circular Button */}
                  <button
                    type="button"
                    disabled={isSosTriggering}
                    className={`relative w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white rounded-full flex flex-col items-center justify-center shadow-[0_12px_24px_rgba(239,68,68,0.4)] border border-rose-400 select-none overflow-hidden transition-all duration-150 ${
                      isPressing ? 'scale-95 shadow-[0_4px_10px_rgba(239,68,68,0.2)]' : 'hover:scale-105'
                    }`}
                  >
                    {isSosTriggering ? (
                      <RefreshCw size={20} className="animate-spin text-white" />
                    ) : (
                      <>
                        <Zap size={18} className={`text-white ${isPressing ? 'scale-110' : 'animate-pulse'}`} />
                        <span className="text-[9px] font-black tracking-widest mt-0.5 uppercase">SOS</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col text-left pl-1">
                  <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">
                    {isSosTriggering ? "DISPATCHED" : isPressing ? "ACTIVATING..." : "EMERGENCY NODE"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono tracking-tight leading-none mt-1">
                    {isSosTriggering ? "All channels notified" : isPressing ? `HOLD (${Math.round(longPressProgress)}%)` : "Click or Hold SOS"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden relative group/logs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Diagnostic Loop</span>
                <RefreshCw size={12} className="text-slate-400 animate-spin-slow" />
              </div>
              <div className="space-y-3 h-[120px] overflow-hidden">
                <AnimatePresence initial={false}>
                  {diagnosticLogs.map((log, i) => (
                    <motion.div 
                      key={log + i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                      <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 leading-none">
                        {log}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div 
              onClick={() => setShowBioCore(true)}
              className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] flex flex-col justify-between group cursor-pointer hover:shadow-2xl transition-all border border-slate-700 h-full min-h-[160px]"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                  <Brain size={24} />
                </div>
                <span className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/30">Interface Ready</span>
              </div>
              <div className="mt-8">
                <h4 className="font-black uppercase tracking-tighter text-white text-2xl">Access <span className="text-blue-400">Bio-Core</span></h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 group-hover:text-white transition-colors">Strategic Simulation Protocol v9.4</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VITALITY STREAK & CLINICAL COMPLIANCE REWARD HQ */}
      <div className="bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center relative select-none">
              <Flame size={28} className="animate-pulse" />
              <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-md animate-ping -z-10" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] block leading-none mb-1">Adherence Engine v1.8</span>
              <h2 className="text-xl sm:text-2xl font-[950] text-slate-900 dark:text-white uppercase tracking-tight">Vitality Adherence Streak</h2>
            </div>
          </div>

          {/* SIMULATION TRUNK (For review and verification purposes) */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-150 dark:border-slate-850 justify-center">
            <p className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1">Enclave Simulator</p>
            <button 
              id="sim-meds-btn"
              onClick={() => {
                const updatedMeds = meds.map(m => ({ ...m, takenToday: true }));
                setMeds(updatedMeds);
                localStorage.setItem('medical_offline_medications', JSON.stringify(updatedMeds));
                addNotification("Simulated medication intake for today! 💊", "success");
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
            >
              + Meds Today
            </button>
            <button 
              id="sim-workout-btn"
              onClick={async () => {
                try {
                  const demoWorkout = {
                    type: 'Cardio Fusion',
                    duration: 45,
                    calories: 320,
                    intensity: 'Moderate' as const,
                    date: new Date().toISOString()
                  };
                  await api.workouts.create(demoWorkout);
                  const updatedWorkouts = await api.workouts.list();
                  setWorkouts(updatedWorkouts);
                  addNotification("Simulated workout logged for today! 🏃‍♂️", "success");
                } catch {
                  addNotification("Failed to add demo activity.", "warning");
                }
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
            >
              + Exercise Today
            </button>
            <button 
              id="sim-boost-streak-btn"
              onClick={() => {
                const next = streakDays + 1;
                setStreakDays(next);
                localStorage.setItem('doctorian_vitality_streak', next.toString());
                addNotification(`Streak boosted manually to ${next} Days! 🔥`, 'success');
              }}
              className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all font-bold"
            >
              Boost Streak +1
            </button>
            <button 
              id="sim-clear-streak-btn"
              onClick={() => {
                setStreakDays(0);
                localStorage.setItem('doctorian_vitality_streak', '0');
                localStorage.removeItem('doctorian_streak_claimed_date');
                setLastClaimedDate('');
                setClaimedMilestones([]);
                localStorage.setItem('doctorian_claimed_milestones', JSON.stringify([]));
                addNotification("Streak reset to 0 Days for testing.", "info");
              }}
              className="px-2 py-1 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all font-bold"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: Streak Fire HUD */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-6 text-center flex flex-col items-center justify-center relative group overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
            <div className="relative mb-6">
              {/* Flame Ring SVG */}
              <div className="w-36 h-36 rounded-full border-4 border-amber-500/15 flex items-center justify-center relative select-none">
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-500/30 animate-spin-slow" />
                <div className="absolute inset-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-full flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-amber-500"
                  >
                    <Flame size={44} />
                  </motion.div>
                </div>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-amber-400 whitespace-nowrap">
                STREAK ACTIVE
              </span>
            </div>

            <h3 className="text-4xl sm:text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter leading-none mt-2">
              {streakDays} <span className="text-lg font-black uppercase tracking-tight text-slate-400 dark:text-slate-500">Days</span>
            </h3>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-350 uppercase tracking-widest mt-3 max-w-xs mx-auto leading-relaxed">
              Consistently taking medications or completing workouts strengthens your vitality loop.
            </p>

            <div className="mt-5 w-full bg-slate-100 dark:bg-slate-850 p-3 rounded-xl border border-slate-150 dark:border-slate-750 flex items-center justify-between text-[10px] font-black uppercase tracking-wide">
              <span className="text-slate-400">Status Today:</span>
              {(meds.some(m => m.takenToday) || workouts.some(w => {
                if(!w.date) return false;
                const d = new Date(w.date);
                return d.getDate() === new Date().getDate() && d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
              })) ? (
                <span className="text-emerald-500 flex items-center gap-1">Adhered & Verified <Check size={12} strokeWidth={3} /></span>
              ) : (
                <span className="text-amber-500">Action Required</span>
              )}
            </div>
          </div>

          {/* MIDDLE: Weekly Compliance Compass */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div className="text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Timeline</span>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md">Mon - Sun</span>
              </div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg sm:text-xl mb-1">Weekly Adherence Map</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mb-6">
                Fulfilling daily protocols lights up your neural nexus. Check medication intakes and logs to complete current days.
              </p>

              {/* Day slots */}
              <div className="grid grid-cols-7 gap-2.5 sm:gap-4 mt-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                  const completed = weeklyStatus[idx];
                  const d = new Date();
                  const currentDay = d.getDay();
                  const dowMap = [1, 2, 3, 4, 5, 6, 0];
                  const todayIdx = dowMap.indexOf(currentDay);
                  const isToday = todayIdx === idx;
                  const isFuture = idx > todayIdx;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all border ${
                        completed 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/15'
                          : isFuture
                            ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-300'
                            : isToday
                              ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse'
                              : 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-400/30 text-rose-500'
                      }`}>
                        {completed ? (
                          <Check size={18} strokeWidth={3} />
                        ) : (
                          <span className="text-xs font-black">{day}</span>
                        )}
                        {isToday && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white dark:border-slate-800" />
                        )}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${isToday ? 'text-blue-500' : isFuture ? 'text-slate-300' : completed ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {isToday ? "TODAY" : completed ? "DONE" : isFuture ? "PEND" : "MISS"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-450">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Full Support Logged</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Current Checklist Day</span>
            </div>
          </div>

          {/* RIGHT: Rewards Larder / Ledger */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="text-left w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adherence Rewards</span>
                <Trophy size={16} className="text-amber-500" />
              </div>
              
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg mb-4">Rewards Station</h3>
              
              {/* Daily Claim Box */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Daily Adherence Bonus</p>
                <div className="text-xl font-black text-slate-900 dark:text-white leading-none">+50 Neural Energy</div>
                {lastClaimedDate === new Date().toDateString() ? (
                  <button 
                    disabled 
                    className="w-full py-2 bg-slate-200 dark:bg-slate-850 text-slate-450 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-not-allowed"
                  >
                    Claimed Today
                  </button>
                ) : (
                  <button 
                    id="claim-daily-reward-btn"
                    onClick={() => {
                      if (localStorage.getItem('doctorian_streak_claimed_date') === new Date().toDateString()) {
                        addNotification("Daily bonus already processed today.", "warning");
                        return;
                      }

                      const updatedCredits = isCreditsUnlimited(user?.credits) ? "Unlimited" : parseCreditsToNumber(user?.credits) + 50;
                      const updatedUser = { ...user, credits: updatedCredits };
                      
                      localStorage.setItem('medical_user', JSON.stringify(updatedUser));
                      localStorage.setItem('doctorian_streak_claimed_date', new Date().toDateString());
                      setLastClaimedDate(new Date().toDateString());

                      if (onUpdateUser) {
                        onUpdateUser(updatedUser);
                      }
                      addNotification("🏆 Daily Adherence Confirmed! +50 Credits successfully loaded.", "success");
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.03] active:scale-95 text-slate-950 text-[10px] font-[1000] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    Claim 50 Credits
                  </button>
                )}
              </div>

              {/* Milestones list */}
              <div className="space-y-3 mt-5">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest leading-none block mb-1">Streak Milestones</p>
                
                {[
                  { days: 3, reward: 100, badge: 'Ignition Beacon' },
                  { days: 5, reward: 200, badge: 'Cellular Synergy' },
                  { days: 7, reward: 500, badge: 'Quantum Mastery' }
                ].map((milestone) => {
                  const isClaimed = claimedMilestones.includes(milestone.days.toString());
                  const canClaim = streakDays >= milestone.days && !isClaimed;
                  
                  return (
                    <div key={milestone.days} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100/50 dark:border-slate-850 text-xs">
                      <div className="flex flex-col text-left">
                        <span className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{milestone.days} Days ({milestone.badge})</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">+{milestone.reward} Credits</span>
                      </div>
                      
                      {isClaimed ? (
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/15 px-2 py-0.5 rounded-md border border-emerald-500/20">Claimed</span>
                      ) : canClaim ? (
                        <button 
                          id={`claim-milestone-${milestone.days}`}
                          onClick={() => {
                            if (claimedMilestones.includes(milestone.days.toString())) return;
                            const next = [...claimedMilestones, milestone.days.toString()];
                            setClaimedMilestones(next);
                            localStorage.setItem('doctorian_claimed_milestones', JSON.stringify(next));

                            const updatedCredits = isCreditsUnlimited(user?.credits) ? "Unlimited" : parseCreditsToNumber(user?.credits) + milestone.reward;
                            const updatedUser = { ...user, credits: updatedCredits };
                            
                            localStorage.setItem('medical_user', JSON.stringify(updatedUser));
                            if (onUpdateUser) {
                              onUpdateUser(updatedUser);
                            }
                            addNotification(`🎉 Milestone Adhered! Completed ${milestone.days}-day run. +${milestone.reward} Credits!`, 'success');
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Claim
                        </button>
                      ) : (
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {vitalStats.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedStat(stat)}
            className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden text-left w-full"
          >
            <div className={`absolute -right-2 -top-2 w-12 h-12 sm:w-20 sm:h-20 rounded-full blur-xl sm:blur-2xl transition-all ${getStatBgBlurClasses(stat.color)}`} />
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform relative z-10 shadow-sm border ${getStatColorClasses(stat.color)}`}>
              {React.cloneElement(stat.icon as any, { size: 20 })}
            </div>
            <p className="text-[10px] sm:text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-none mb-2 sm:mb-2 relative z-10 text-high-visibility">{stat.label}</p>
            <div className="flex items-baseline justify-between relative z-10">
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none text-high-visibility">{stat.value}</h3>
              <span className={`text-[10px] sm:text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : stat.trend === 'Stable' ? 'text-blue-500' : 'text-rose-500'}`}>
                {stat.trend}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Advanced Cognitive & Cellular Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
        {[
          { title: 'Cognis Coherence', value: '0.98', label: 'Quantum Sync', sub: 'Phase Locked', color: 'blue', icon: <Cpu />, details: 'Coherence represents the synchrony between left and right hemispheres.' },
          { title: 'Oxygen Efficiency', value: '42%', label: 'Cellular Flux', sub: 'Optimized', color: 'cyan', icon: <Wind />, details: 'Mitochondrial oxygen utilization rate within targeted muscle tissue.' },
          { title: 'Stress Polarity', value: 'Low', label: 'Cortisol Phase', sub: 'Non-Reactive', color: 'rose', icon: <Zap />, details: 'Autonomic nervous system balance based on skin conductance.' }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => {
              addNotification(`Detailed analysis of ${item.title} available in CognisHub.`, 'info');
              setSelectedStat({...item, trend: 'Optimal', label: item.title});
            }}
            className="bg-slate-900 text-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-white/5 group hover:border-blue-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-6 sm:mb-10">
              <div className={`p-3 sm:p-4 bg-${item.color}-500/20 text-${item.color}-400 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-all`}>
                {React.cloneElement(item.icon as any, { size: 24 })}
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">{item.label}</p>
                <p className="text-[10px] sm:text-sm font-black uppercase text-white/40">{item.sub}</p>
              </div>
            </div>
            <h4 className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{item.title}</h4>
            <p className="text-2xl sm:text-4xl font-black tracking-tighter">{item.value}</p>
            <div className="mt-4 sm:mt-6 flex gap-1 h-1">
              {[...Array(12)].map((_, j) => (
                <div key={j} className={`flex-1 rounded-full ${j < 8 ? `bg-${item.color}-500/50` : 'bg-white/5'} transition-all`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Powerful Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Analytics Hub */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-blue-600" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cognis Performance Index</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Biometric Synthesis</h2>
            </div>
            <div className="flex gap-2">
              {(['Day', 'Week', 'Month'] as const).map(t => (
                <button 
                  key={t} 
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                    timeframe === t 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 p-4 sm:p-8 min-h-[250px] sm:min-h-[300px]">
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={getDynamicData()}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>

          <div className="p-5 sm:p-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stability Score</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase text-high-visibility">98.2<span className="hidden sm:inline text-blue-600 font-serif lowercase italic ml-1">optimal</span></p>
            </div>
            <div>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Activity</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase text-high-visibility">16:42<span className="hidden sm:inline text-emerald-500 text-[10px] ml-1">+12%</span></p>
            </div>
            <div>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase text-high-visibility">Alpha</p>
            </div>
          </div>
        </div>

        {/* Powerful Context Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8">
          {/* Real-time Heart Rate Stream */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm overflow-hidden relative group">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 text-high-visibility">Cardiac Pulse Registry</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter text-high-visibility">{vitals?.heartRate || '--'}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-high-visibility">BPM</span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl sm:rounded-2xl text-rose-600 animate-pulse">
                <Heart size={18} />
              </div>
            </div>
            <div className="h-20 sm:h-24 -mx-2">
              <VitalWaveform 
                data={history.map(h => ({ value: h.heartRate, timestamp: Date.now() }))} 
                color="#e11d48" 
                height={80}
                maxVal={180}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-high-visibility">
              <span>Sync: Secured</span>
              <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500"></div> Connected</span>
            </div>
          </div>

          {/* Anomaly Detection Hub */}
          <AnomalyDetector vitals={vitals} healthStatus={healthStatus} />

          {/* Weather Widget */}
          <WeatherWidget />

          {/* Quick Actions Portal */}
          <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Zap size={100} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-8">Bio-Link<br />Actions</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'Start Clinical Diagnostic', icon: <ArrowRight size={14} />, action: () => onNavigate('ai_nexus') },
                { label: 'Verify Bio-Identity', icon: <Fingerprint size={14} />, action: () => setSubView('biosecurity') },
                { label: 'Log Protocol Task', icon: <Plus size={14} />, action: () => onNavigate('tasks') },
                { label: 'Log Fitness Activity', icon: <Activity size={14} />, action: () => onNavigate('fitness') },
                { label: 'Record Medication', icon: <Pill size={14} />, action: () => onNavigate('meds') },
                { label: 'Scan Vital Matrix', icon: <Activity size={14} />, action: () => onNavigate('vitality') },
                { label: 'Developer API Console', icon: <Terminal size={14} />, action: () => onNavigate('dev_portal') }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action} 
                  className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white text-slate-300 hover:text-slate-900 rounded-2xl border border-white/5 hover:border-white transition-all font-black text-[10px] uppercase tracking-widest group/btn"
                >
                  {item.label} <span className="group-hover/btn:translate-x-1 transition-transform">{item.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Developer API Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-10 rounded-[3rem] border border-slate-700 shadow-xl overflow-hidden relative group cursor-pointer" onClick={() => onNavigate('dev_portal')}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent)]" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Code2 size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Build with<br />Doctorian</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-6">Connect other apps to your neural knowledge base.</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest border-t border-slate-800 pt-4">
                Access Neural API <ArrowRight size={14} />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Terminal size={100} />
            </div>
          </div>

          {/* Activity Metrics & Predictive Row (missing or needs cleanup) */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
            <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
              Activity Metrics
              <Sparkles size={14} className="text-blue-600" />
            </h4>
            <div className="space-y-8">
              {[
                { label: 'Cognis Load', value: 34, color: 'blue', desc: 'Prefrontal cortex activity level.' },
                { label: 'Bio-Entropy', value: 12, color: 'emerald', desc: 'Total system metabolic disorder.' },
                { label: 'Recovery Phase', value: 88, color: 'indigo', desc: 'Anabolic tissue repair progress.' }
              ].map((activity, i) => (
                <div key={i} className="group cursor-help relative" onClick={() => addNotification(`${activity.label} detail logged at 99.9% accuracy.`)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${activity.color}-500 animate-pulse`} />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{activity.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-400">{activity.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${activity.value}%` }}
                      className={`h-full bg-${activity.color}-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)]`}
                    />
                  </div>
                  <p className="mt-2 text-[8px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4">{activity.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Neural Session Queue */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Neural Sessions</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{appointments.length} Scheduled</p>
                </div>
              </div>
              <button onClick={() => onNavigate('specialist')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Plus size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {appointments.slice(0, 2).map((appt) => (
                <div key={appt.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded italic">
                      {appt.type} link
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {appt.slots ? appt.slots.join(', ') : appt.slot}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{appt.specialist.name}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <button 
                      onClick={() => {
                        const updated = appointments.filter(a => a.id !== appt.id);
                        setAppointments(updated);
                        localStorage.setItem('doctorian_appointments', JSON.stringify(updated));
                        addNotification("Neural session aborted. Specialist notified of schedule change.", "info");
                      }}
                      className="text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
                    >
                      Abort
                    </button>
                    <button 
                      onClick={() => {
                        addNotification("Launching secure neural bridge to specialist...", "success");
                        onNavigate('specialist');
                      }}
                      className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Launch Link
                    </button>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="py-8 text-center text-slate-400 space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest">No Active Links</p>
                   <button onClick={() => onNavigate('specialist')} className="text-[9px] font-black text-blue-600 underline">Sync with Specialist</button>
                </div>
              )}
            </div>
          </div>

          {/* Priority Task Protocol Queue */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <ListTodo size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Protocol Queue</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pendingTasks.length} Pending</p>
                </div>
              </div>
              <button onClick={() => onNavigate('tasks')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {pendingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between group relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    task.priority === 'high' ? 'bg-rose-500' : 
                    task.priority === 'medium' ? 'bg-amber-500' : 
                    'bg-blue-500'
                  }`} />
                  <div className="flex items-center gap-3 max-w-[70%] ml-1">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      task.priority === 'high' ? 'bg-rose-500 animate-pulse' : 
                      task.priority === 'medium' ? 'bg-amber-500' : 
                      'bg-blue-500'
                    }`} />
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase truncate leading-tight">{task.title}</h4>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = tasks.map(t => t.id === task.id ? { ...t, completed: true } : t);
                      localStorage.setItem('doctorian_tasks', JSON.stringify(updated));
                      setTasks(updated);
                      addNotification("Protocol verified and marked as complete.", "success");
                    }}
                    className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <ShieldCheck size={32} />
                  <p className="text-[10px] font-black uppercase mt-3 tracking-widest">All Clear</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('tasks')}
              className="mt-6 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
            >
              Manage Strategies
            </button>
          </div>

          {/* Daily Intelligence Briefing */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[350px] relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cognis Briefing</span>
                </div>
                {user?.email?.toLowerCase() === "gloriajayakullo@gmail.com" && (
                  <button 
                    onClick={() => onNavigate('training')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-slate-700 active:scale-95"
                  >
                    <Brain size={12} />
                    Train Neural Model
                  </button>
                )}
              </div>

              <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight mb-4 tracking-tighter">Daily Health <br /><span className="text-blue-600">Cognis</span></h4>
              
              <AnimatePresence mode="wait">
                {isInsightLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                    <div className="h-2.5 w-[90%] bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse delay-75" />
                    <div className="h-2.5 w-[80%] bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse delay-150" />
                  </motion.div>
                ) : (
                  <motion.div key="insight" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="relative">
                      <Quote size={16} className="absolute -left-5 -top-1 text-blue-600/20" />
                      <p className="text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed text-base font-serif">
                        "{aiInsight || 'Initializing metabolic synchronization protocols...'}"
                      </p>
                    </div>
                    
                    {/* Performance Integration */}
                    <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Neural Accuracy</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full w-[99.8%]" />
                          </div>
                          <span className="text-[9px] font-black text-amber-600">99.8%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Model Latency</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[12%]" />
                          </div>
                          <span className="text-[9px] font-black text-blue-600">24ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 font-mono">
                      {['Synthesized', 'AI-Driven', 'Authorized'].map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-[7px] font-black text-slate-400 uppercase tracking-widest rounded border border-slate-100 dark:border-slate-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-6 flex items-center justify-between mt-auto">
              <button 
                onClick={onRefreshInsight} 
                disabled={isInsightLoading}
                className="flex items-center gap-2 text-[8px] font-black text-blue-600 uppercase tracking-widest group disabled:opacity-50"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <RefreshCw size={12} className={isInsightLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </div>
                Sync New Pattern
              </button>
              
              <div className="flex items-center gap-2 text-slate-400">
                <Lightbulb size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Tip System Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Roadmap - NEW FEATURE */}
      <section className="bg-slate-900 text-white rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/3">
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-6">
              Clinical <br /><span className="text-blue-500">Roadmap</span>
            </h2>
            <p className="text-slate-400 font-bold mb-8">
              Your personalized journey toward optimal longevity and neurological health, recalibrated every cycle.
            </p>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Phase Progress</span>
                <span className="text-xl font-black">64%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[64%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {[
              { title: 'Baseline Sync', status: 'Completed', date: 'Oct 12', icon: <RefreshCw />, color: 'blue', view: 'neuro' },
              { title: 'Metabolic Optimization', status: 'In Progress', date: 'Oct 28', icon: <Activity />, color: 'emerald', view: 'vitality' },
              { title: 'DNA Stabilization', status: 'Pending', date: 'Nov 15', icon: <ShieldCheck />, color: 'purple', view: 'monitor' },
              { title: 'Longevity Index Peak', status: 'Upcoming', date: 'Dec 02', icon: <TrendingUp />, color: 'orange', view: 'vitality' },
            ].map((milestone, i) => (
              <button 
                key={i} 
                onClick={() => onNavigate(milestone.view as any)}
                className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-${milestone.color}-500/20 text-${milestone.color}-400 rounded-xl group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(milestone.icon as any, { size: 18 })}
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight leading-none group-hover:text-blue-400 transition-colors">{milestone.title}</h4>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">{milestone.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    milestone.status === 'Completed' ? 'bg-blue-600 text-white' : 
                    milestone.status === 'In Progress' ? 'bg-emerald-600 text-white animate-pulse' : 
                    'bg-white/10 text-slate-400'
                  }`}>
                    {milestone.status}
                  </span>
                  <div className="flex -space-x-1">
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Navigation Suites */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Intelligence Suite</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Bio-Security', subtitle: 'Neural Identity', icon: <Fingerprint />, view: 'biosecurity', color: 'blue', styles: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600', detail: 'Encrypted' },
            { title: 'Cognis Hub', subtitle: 'Synaptic Tracking', icon: <Brain />, view: 'neuro', color: 'purple', styles: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600', detail: 'Active' },
            { title: 'Vital Matrix', subtitle: 'Longevity Index', icon: <Zap />, view: 'vitality', color: 'emerald', styles: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600', detail: 'Optimized' },
            { title: 'Bio-Monitor', subtitle: 'Bio-Telemetry', icon: <Monitor />, view: 'monitor', color: 'cyan', styles: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-600', detail: 'Live' },
            { title: 'Archive', subtitle: 'Clinical Records', icon: <FileText />, view: 'records', color: 'indigo', styles: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600', detail: 'Synced' },
            { title: 'Specialists', subtitle: 'Expert Network', icon: <Stethoscope />, view: 'specialist', color: 'rose', styles: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600', detail: 'Connected' },
            { title: 'System', subtitle: 'Analytics Ops', icon: <Info />, view: 'about', color: 'slate', styles: 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 group-hover:bg-slate-600', detail: 'v5.0.2' },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => {
                if (item.view === 'biosecurity') {
                  setSubView('biosecurity');
                } else {
                  onNavigate(item.view as any);
                }
              }}
              className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all text-left flex flex-col justify-between min-h-[240px] relative overflow-hidden"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${item.styles} group-hover:text-white`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                  {item.detail}
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight mb-1 uppercase leading-none group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-80">{item.subtitle}</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-600/10 group-hover:bg-blue-600 transition-all translate-y-2 group-hover:translate-y-0" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Advanced Simulations */}
      <div className="pt-10">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
          <Brain className="text-blue-600" size={24} />
          AI Predictive Modeling Matrix
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">Biological Forecast</h3>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Quantum Simulation</span>
            </div>
            <div className="h-[300px]">
              <SafeResponsiveContainer width="100%" height="100%">
                <AreaChart data={getDynamicData().map(d => ({ ...d, pred: d.value + (Math.random() * 10 - 5) }))}>
                  <defs>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }}
                  />
                  <XAxis dataKey="time" hide />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="pred" stroke="#10b981" fill="url(#colorPred)" strokeWidth={3} />
                </AreaChart>
              </SafeResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">AI Prediction</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">High probability of peak cognitive performance in the next 12 hours. System stability is projected to increase by 4.2%.</p>
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full" />
            <div className="relative z-10 space-y-8">
              <h3 className="text-xl font-black uppercase tracking-widest leading-none">Wellness Objectives</h3>
              <div className="space-y-6">
                {[
                  { label: "REM Cycle Optimization", progress: 85, color: "blue", tip: "Avoid blue light 2h before primary sleep phase." },
                  { label: "Mitochondrial Flux", progress: 62, color: "emerald", tip: "Maintain Zone 2 aerobic activity for 45 minutes." },
                  { label: "Glycemic Baseline", progress: 94, color: "amber", tip: "Post-prandial glucose levels currently stabilized." }
                ].map((goal, i) => (
                  <div key={i} className="space-y-3 group cursor-help" onClick={() => addNotification(`Wellness Protocol: ${goal.tip}`, 'info')}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full bg-${goal.color}-500`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{goal.label}</span>
                      </div>
                      <span className="text-sm font-black">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        className={`h-full bg-${goal.color}-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => addNotification("New wellness parameters synced with Bio-Core.", "success")}
                className="w-full py-4 mt-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all"
              >
                Sync Custom Goals
              </button>
            </div>
          </div>
        </div>

        {/* Bio-Core Intelligence Modal */}
        <div className="mt-10 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <Cpu className="text-blue-600/20 animate-spin-slow" size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-6">Neural Optimization Bridge</h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[
                { label: "Synaptic Sync", value: "Active", sub: "14ms Latency" },
                { label: "Dopamine Curve", value: "Elevated", sub: "Morning Peak" },
                { label: "Cortisol Drift", value: "Declining", sub: "Stable Baseline" },
                { label: "Bio-Rhythm", value: "Phase 4", sub: "Deep Focus" }
              ].map((m, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{m.value}</p>
                  <p className="text-[10px] text-blue-600 font-bold">{m.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  addNotification("Baseline recalibration initiated. Stay still for 30 seconds.", "success");
                }}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all border border-white/10"
              >
                Recalibrate Baseline
              </button>
              <button 
                onClick={() => {
                  const data = {
                    patient: user?.displayName || user?.email,
                    timestamp: new Date().toISOString(),
                    vitals,
                    healthStatus,
                    systemLogs
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `doctorian_biodata_${new Date().getTime()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  addNotification("Biometric data package compiled and exported successfully.", "success");
                }}
                className="px-8 py-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
              >
                Export Bio-Data
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <BioSimulation />
        </div>

        {/* Clinical Intelligence Overview */}
        <div className="mt-10 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
            <Shield className="text-emerald-500" size={20} />
            System Health Baseline
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Sync Status</span>
              <span className="text-xs font-bold text-emerald-500">LIVE</span>
            </div>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              title: "Neural Efficiency", 
              value: "98.4%", 
              trend: "+0.2%", 
              icon: <Zap className="text-amber-400" />,
              description: "Optimal synaptic response time."
            },
            { 
              title: "Metabolic Flux", 
              value: "Stable", 
              trend: "Syncing", 
              icon: <Activity className="text-emerald-400" />,
              description: "Glucose-insulin dynamics stable."
            },
            { 
              title: "Cellular Longevity", 
              value: "Tier 1", 
              trend: "Optimal", 
              icon: <Shield className="text-blue-400" />,
              description: "Telomere integrity protocols active."
            },
            {
              title: "Deep Sleep Depth",
              value: "2h 45m",
              trend: "+15m",
              icon: <Clock className="text-indigo-400" />,
              description: "Regenerative phase performance."
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  {stat.icon}
                </div>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{stat.trend}</span>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</h4>
              <p className="text-[10px] text-slate-500 leading-tight font-medium">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Predictive Bio-Forecast */}
        <div className="mt-10 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-20 transition-transform duration-500 group-hover:scale-110">
            <Sparkles size={120} className="text-blue-400" />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                <Brain size={12} />
                AI Prognosis Model
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Biological Forecast: Next 48 Hours</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Our clinical intelligence engine has analyzed your current biomarkers. Your cognitive baseline is projected to peak tomorrow at 09:30 AM.</p>
              <div className="flex flex-wrap gap-4">
                <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Stability Rate</p>
                  <p className="text-xl font-black">94.2%</p>
                </div>
                <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Recovery Speed</p>
                  <p className="text-xl font-black">Fast</p>
                </div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <SafeResponsiveContainer width="100%" height="100%">
                <AreaChart data={getDynamicData()}>
                  <defs>
                    <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBio)" strokeWidth={4} />
                </AreaChart>
              </SafeResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bio-Core Intelligence Modal */}
      <AnimatePresence>
        {showBioCore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-[4rem] overflow-hidden shadow-2xl relative border border-white/10 flex flex-col sm:flex-row"
            >
              <button 
                onClick={() => setShowBioCore(false)}
                className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full z-10 transition-all border border-transparent hover:border-slate-200"
              >
                <LayoutGrid size={24} />
              </button>

              <div className="w-full sm:w-1/2 p-12 sm:p-20 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/50">
                <div className="space-y-8">
                  <div className="w-20 h-2 bg-blue-600 rounded-full" />
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-[0.9]">
                    Bio-Core <br /><span className="text-blue-600">Intelligence</span> <br />Matrix
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed max-w-md">
                    Deep-layered biological synthesis engine monitoring your primary somatic feedback loops and synaptic efficiency in real-time.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Cognis Fidelity', value: '99.4%', color: 'blue' },
                    { label: 'Cellular Entropy', value: '0.02', color: 'emerald' },
                    { label: 'Metabolic Sync', value: 'Active', color: 'amber' }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{stat.label}</span>
                      <span className={`text-xl font-black text-${stat.color}-500`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full sm:w-1/2 bg-slate-900 relative p-12 sm:p-20 overflow-hidden flex flex-col justify-center text-center">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] animate-pulse" />
                </div>
                
                <div className="mb-12 relative z-10">
                  <div className="inline-block p-8 bg-blue-600 rounded-[3rem] shadow-[0_0_50px_rgba(37,99,235,0.4)] animate-float">
                    <Brain size={64} className="text-white" />
                  </div>
                </div>

                <h3 className="text-white font-black text-3xl uppercase tracking-tighter mb-4 relative z-10">Cognis Synthesis Active</h3>
                <p className="text-blue-200/60 font-black text-[10px] uppercase tracking-[0.4em] mb-12 relative z-10">Processing Biomarker Stream v5.0.2</p>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <button 
                    onClick={() => {
                      addNotification("Biological scan initiated correctly. Sensor sync in progress.", "success");
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    Initiate Scan
                  </button>
                  <button 
                    onClick={() => {
                      addNotification("Cognis augmentation sequence started. Beta-wave focus increased.", "info");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30"
                  >
                    Cognis Boost
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Detail Modal */}
      <AnimatePresence>
        {selectedStat && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setSelectedStat(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 rounded-2xl bg-blue-600 text-white`}>
                    {selectedStat.icon || <Info />}
                  </div>
                  <button onClick={() => setSelectedStat(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">{selectedStat.label || 'Metric Analysis'}</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{selectedStat.value}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-10">
                  {selectedStat.details || "Continuous monitoring shows a stable pattern within standard medical ranges. Clinical correlation is recommended for any symptomatic changes."}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-black text-emerald-500 uppercase tracking-tight">{selectedStat.trend || 'Normalized'}</p>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Interval</p>
                    <p className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">Last 24 Hours</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    addNotification("Diagnostic report generated and saved to Health Records.", "success");
                    setSelectedStat(null);
                  }}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Download Full Diagnostic
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Notifications */}
      <div className="fixed top-10 right-10 z-[300] pointer-events-none space-y-4">
        <AnimatePresence>
          {notifications.map(note => (
            <motion.div
              key={note.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className={`p-5 rounded-2xl shadow-2xl flex items-center gap-4 border pointer-events-auto ${
                note.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' 
                  : note.type === 'warning'
                  ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400'
                  : 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400'
              }`}
            >
              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                {note.type === 'success' ? <Zap size={16} /> : <Info size={16} />}
              </div>
              <p className="text-xs font-bold leading-tight max-w-[200px]">{note.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Clinical Diagnostic Timeline & Download APK */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 rounded-[2.5rem] p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Diagnostic Logic Chain</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent AI Analytical Steps</p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          <div className="space-y-6">
            {[
              { time: '09:42 AM', label: 'Neural Mapping', desc: 'Synaptic latency verified at 42ms. No cortical anomalies.', status: 'Complete', color: 'bg-emerald-500' },
              { time: '08:15 AM', label: 'Metabolic Baseline', desc: 'Glycemic index synchronized with AM protocol.', status: 'Verified', color: 'bg-emerald-500' },
              { time: 'Yesterday', label: 'Anatomical Synthesis', desc: 'Full-body voxel scan completed. Vitals stable.', status: 'Logged', color: 'bg-blue-500' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="pt-1 w-16 shrink-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.time}</span>
                </div>
                <div className="relative pb-6 last:pb-0 flex-1">
                  {i !== 2 && <div className="absolute left-[-1.3rem] top-3 bottom-0 w-[1px] bg-slate-100 dark:bg-slate-800" />}
                  <div className={`absolute left-[-1.55rem] top-1.5 w-2 h-2 rounded-full ${item.color} ring-4 ring-white dark:ring-slate-900`} />
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">{item.label}</h4>
                    <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">{item.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/30 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Brain size={24} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Clinical Intelligence</h3>
            <p className="text-xs font-medium opacity-80 leading-relaxed mb-8">
              Your biological data is being processed through our Tier-3 neural network for deep diagnostic precision.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[8px] font-black uppercase tracking-widest">Synthesis Progress</span>
                   <span className="text-[10px] font-black tabular-nums">92%</span>
                 </div>
                 <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: '92%' }}
                     className="bg-white h-full"
                   />
                 </div>
              </div>
            </div>
          </div>

          <button
            onClick={onInstall}
            className="w-full mt-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} /> INSTALL TO DEVICE
          </button>
        </motion.div>
      </div>
    </motion.div>
  ) : subView === 'biosecurity' ? (
        <motion.div
          key="biosecurity"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col min-h-[600px] bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-900">
             <button 
               onClick={() => setSubView('main')}
               className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
             >
               <ArrowLeft size={18} />
             </button>
             <div>
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Back to Dashboard</h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol Visualization Ready</p>
             </div>
          </div>
          <div className="flex-1 overflow-hidden">
             <BioSecurity />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="alerts"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col min-h-[600px] bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-900">
             <button 
               onClick={() => setSubView('main')}
               className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
             >
               <ArrowLeft size={18} />
             </button>
             <div>
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Neural Alert Center</h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Log & Operational Feed</p>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 custom-scrollbar smooth-scroll">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               {[
                 { label: 'Critical Alerts', count: systemLogs.filter(l => l.level === 'critical').length, color: 'text-rose-600' },
                 { label: 'Active Monitors', count: 12, color: 'text-blue-600' },
                 { label: 'System Health', count: '99.9%', color: 'text-emerald-600' },
               ].map((stat, i) => (
                 <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.color} tracking-tighter uppercase`}>{stat.count}</p>
                 </div>
               ))}
             </div>

             <div className="space-y-4">
               {systemLogs.map((log) => (
                 <div key={log.id} className="p-5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-between group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        log.level === 'critical' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' :
                        log.level === 'mid' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      }`}>
                        <Bell size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.event}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp: {log.time}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      log.level === 'critical' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none' :
                      'text-slate-400 bg-slate-50 dark:bg-slate-800'
                    }`}>
                      {log.level}
                    </div>
                 </div>
               ))}
             </div>

             <button 
               onClick={() => {
                 setSystemLogs([]);
                 addNotification("Operational logs purged. System baseline cleared.", "success");
               }}
               className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-8 hover:opacity-90 transition-opacity"
             >
               Purge Operational Log
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dashboard;
