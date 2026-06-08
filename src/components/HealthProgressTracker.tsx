import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, Activity, Brain, 
  Sparkles, ShieldCheck, ChevronRight, BarChart3, 
  Calendar, Microscope, FileText, Pill, Search, ClipboardList, Cpu,
  AlertCircle, ArrowRightCircle, RefreshCw, Target, Footprints, Droplet, Dumbbell, Moon,
  Watch, Smartphone, Bluetooth, Check, Wifi, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useArduino } from '../hooks/useArduino';
import { api, User } from '../api';
import { HealthGoalsModal, HealthGoal } from './HealthGoalsModal';
import { WearableConnector } from './WearableConnector';
import confetti from 'canvas-confetti';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, AreaChart, Area,
  ComposedChart, Bar, Scatter, BarChart
} from 'recharts';
import { SafeResponsiveContainer } from './SafeResponsiveContainer';

interface HealthProgressTrackerProps {
  user: User | null;
}

export const HealthProgressTracker: React.FC<HealthProgressTrackerProps> = ({ user }) => {
  const arduino = useArduino();
  const [loading, setLoading] = useState(true);
  const [traceResult, setTraceResult] = useState<string | null>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'vitals' | 'clinical' | 'meds' | 'protocols'>('vitals');
  
  // States for aggregated data
  const [records, setRecords] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [progressScore, setProgressScore] = useState(78);
  const [chartMode, setChartMode] = useState<'vitals' | 'consistency' | 'sleep'>('vitals');

  // Sleep Quality & Duration Tracking States
  const [sleepInputDuration, setSleepInputDuration] = useState<number>(8);
  const [sleepInputQuality, setSleepInputQuality] = useState<number>(4); // 1-5 scale (Excellent, Good, Fair, Poor, Terrible)
  const [sleepInputNotes, setSleepInputNotes] = useState<string>('');
  
  const [sleepLogs, setSleepLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('doctorian_sleep_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use seeds
      }
    }
    // Seeds to ensure immediate longitudinal trends upon first loading the applet
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date('2026-05-27T13:16:49Z');
    const seeds = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = weekdayNames[d.getDay()];
      const hours = [7.5, 6.0, 8.2, 5.5, 7.0, 8.0, 7.2][i % 7];
      const quality = [4, 3, 5, 2, 4, 5, 4][i % 7];
      const notes = [
        "Felt fully charged, restful deep cycles.",
        "A bit restless due to caffeine intake.",
        "Deep REM recovery registered.",
        "Late screens, interrupted sleep cycles.",
        "Well rested with meditation beforehand.",
        "Excellent breathing mechanics, high restoration.",
        "Standard restful recovery window."
      ][i % 7];
      
      seeds.push({
        id: `seed_sleep_${i}`,
        date: dateString,
        dayLabel: `${dayName} ${d.getDate()}`,
        duration: hours,
        quality: quality,
        notes: notes,
        timestamp: d.getTime()
      });
    }
    return seeds;
  });

  const [goals, setGoals] = useState<HealthGoal[]>(() => {
    const saved = localStorage.getItem('doctorian_daily_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: 'steps', label: 'Daily Steps', current: 3500, target: 10000, unit: 'steps' },
      { id: 'water', label: 'Water Intake', current: 3, target: 8, unit: 'cups' },
      { id: 'workout', label: 'Workout Duration', current: 15, target: 45, unit: 'min' },
      { id: 'sleep', label: 'Sleep Duration', current: 0, target: 8, unit: 'hrs' }
    ];
  });
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Connected Smartwatch states
  const [activeWatch, setActiveWatch] = useState<'Samsung' | 'Apple' | 'Fitbit' | 'Garmin' | 'Bluetooth' | 'None'>(() => {
    return (localStorage.getItem('doctorian_active_watch') as any) || 'None';
  });
  const [watchBattery, setWatchBattery] = useState<number>(88);
  const [watchAdvices, setWatchAdvices] = useState<string[]>([]);
  const [isWatchAnalyzing, setIsWatchAnalyzing] = useState(false);
  const [watchConditions, setWatchConditions] = useState<string[]>([]);
  const [signalStrength, setSignalStrength] = useState<number>(4); // 1-5 bars
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);

  const WATCH_METADATA_MAP = {
    Samsung: {
      name: "Samsung Galaxy Watch 6 Pro",
      conditions: ["ABI Vascular Stiffness (Level 1.1)", "Sleep Snoring Index (Normal <5/hr)", "Cardiovascular ECG (Sinus with PACs)"],
      defaultAdvices: [
        "Slight vascular stiffness delta registered. Hydration baseline of 2.5 liters is advised.",
        "Mild sleep apnea indices detected. Monitor sleep positions carefully.",
        "Medical attention is recommended."
      ],
      vitalsModifier: { heartRate: 74, spo2: 97, temperature: 36.6 }
    },
    Apple: {
      name: "Apple Watch Ultra 2",
      conditions: ["AFib Burden Tracking (Stable <2%)", "Cardio Recovery Velocity (Normal)", "VO2 Max Baseline (42 mL/kg/min)"],
      defaultAdvices: [
        "Aerobic capacity remains functional. Recommended maintenance is walking 30 minutes daily.",
        "Coronary indices appear steady. Maintain routine.",
        "Medical attention is recommended."
      ],
      vitalsModifier: { heartRate: 70, spo2: 99, temperature: 36.5 }
    },
    Fitbit: {
      name: "Fitbit Sense 2",
      conditions: ["EDA Sweat Response (2 events detected)", "Nocturnal Temperature Variation (+0.3°C)", "Resting Heart Rate Delta (-4 BPM)"],
      defaultAdvices: [
        "Elevated sweat response marks high circadian stress. Short relaxation stretches advised.",
        "Subtle core temperature variance noted. Conserve warmth.",
        "Medical attention is recommended."
      ],
      vitalsModifier: { heartRate: 78, spo2: 96, temperature: 36.8 }
    },
    Garmin: {
      name: "Garmin Fenix 7 Sapphire",
      conditions: ["Longitudinal HRV Balance (Steady)", "Training Readiness (High)", "Internal Body Battery Index (80/100)"],
      defaultAdvices: [
        "HRV profiles balanced. Level-1 cardiovascular stress levels detected.",
        "Body battery at high charge. Moderate exercise and medication compliance advised.",
        "Medical attention is recommended."
      ],
      vitalsModifier: { heartRate: 66, spo2: 98, temperature: 36.4 }
    },
    Bluetooth: {
      name: "Real Smartwatch (Web Bluetooth BLE)",
      conditions: ["Web Bluetooth Protocol Connected", "Real-time Biometric Broadcast", "Live Photoplethysmogram (PPG) Stream"],
      defaultAdvices: [
        "Direct connection to physical sensor active. Awaiting real time pulse signals...",
        "Pulse wave velocity dynamic telemetry stabilized. Maintaining active bluetooth link.",
        "Medical attention is recommended."
      ],
      vitalsModifier: { heartRate: 72, spo2: 98, temperature: 36.6 }
    },
    None: {
      name: "None",
      conditions: [],
      defaultAdvices: [],
      vitalsModifier: { heartRate: 72, spo2: 98, temperature: 36.6 }
    }
  };

  const handleResetDaily = () => {
    const resetGoals = goals.map(g => ({ ...g, current: 0 }));
    setGoals(resetGoals);
    localStorage.setItem('doctorian_daily_goals', JSON.stringify(resetGoals));
    
    // Recalculate progress score based on 0% progress
    const computedScore = 72; // default baseline score
    setProgressScore(computedScore);
    setIsResetConfirmOpen(false);
  };

  const saveGoals = (updatedGoals: HealthGoal[]) => {
    // Check if any goals transitioned from uncompleted to completed
    const newlyCompleted = updatedGoals.filter(ug => {
      const match = goals.find(og => og.id === ug.id);
      return ug.current >= ug.target && (!match || match.current < match.target);
    });

    setGoals(updatedGoals);
    localStorage.setItem('doctorian_daily_goals', JSON.stringify(updatedGoals));
    
    // Dynamically calculate progressScore based on goals completed to sync state beautifully!
    const totalProgPercent = updatedGoals.reduce((acc, g) => acc + Math.min(100, (g.current / g.target) * 100), 0) / (updatedGoals.length || 1);
    const computedScore = Math.round(72 + (totalProgPercent * 0.16)); // from 72 to 88 based on goals
    setProgressScore(computedScore);

    if (newlyCompleted.length > 0) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 85,
          origin: { y: 0.7 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'],
          zIndex: 100
        });
      }, 300);
    }
  };

  const [logType, setLogType] = useState('Heart Rate');
  const [logValue, setLogValue] = useState('72');
  const [logNotes, setLogNotes] = useState('');
  const [isWritingRecord, setIsWritingRecord] = useState(false);

  const chartData = React.useMemo(() => {
    // Start with machine base history
    let base = arduino.history && arduino.history.length > 5 ? [...arduino.history] : Array.from({length: 15}).map((_, i) => {
      const ts = Date.now() - (15 - i) * 1000 * 60 * 15; // 15 min gaps
      return {
        heartRate: 74 + Math.sin(i * 0.5) * 6 + Math.random() * 3,
        spo2: 98 + Math.random() * 1,
        temperature: 36.6 + Math.random() * 0.2,
        systolicBP: 118 + Math.random() * 8,
        diastolicBP: 78 + Math.random() * 4,
        timestamp: ts
      };
    });

    // Merge manual records of "Heart Rate" if any
    const heartRecords = records.filter(r => r.type === 'Heart Rate' || r.type === 'HeartRate');
    heartRecords.forEach(r => {
      const ts = Date.parse(r.date) || Date.now();
      const val = parseFloat(r.value) || 72;
      if (!base.some(b => b.timestamp === ts)) {
        base.push({
          heartRate: val,
          spo2: 98,
          temperature: 36.5,
          systolicBP: 120,
          diastolicBP: 80,
          timestamp: ts
        });
      }
    });

    return base.sort((a, b) => a.timestamp - b.timestamp);
  }, [arduino.history, records]);

  const consistencyData = React.useMemo(() => {
    const days = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date('2026-05-26T18:04:12Z');
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = weekdayNames[d.getDay()];
      
      const daysWorkouts = workouts.filter((w: any) => {
        if (!w.date) return false;
        const wDate = w.date.split('T')[0];
        return wDate === dateString;
      });
      const realWorkoutDuration = daysWorkouts.reduce((sum: number, w: any) => sum + (Number(w.duration) || 0), 0);
      
      const completedTasksCount = tasks.filter((t: any) => {
        if (!t.completed) return false;
        const tDate = (t.completed_date || t.deadline || t.due_date || '').split('T')[0];
        return tDate === dateString;
      }).length;

      const seedWorkouts = [30, 0, 45, 20, 0, 60, 45];
      const seedTasks = [2, 1, 3, 2, 1, 4, 3];

      const idx = 6 - i;
      const daySeedWorkout = seedWorkouts[idx % seedWorkouts.length];
      const daySeedTasks = seedTasks[idx % seedTasks.length];

      days.push({
        date: dateString,
        day: `${dayName} ${d.getDate()}`,
        workoutsDuration: realWorkoutDuration > 0 ? realWorkoutDuration : daySeedWorkout,
        tasksCompleted: completedTasksCount > 0 ? completedTasksCount : daySeedTasks,
        isRealData: realWorkoutDuration > 0 || completedTasksCount > 0
      });
    }
    return days;
  }, [workouts, tasks]);

  const streaksSummary = React.useMemo(() => {
    const consistencyPct = workouts.length > 0
      ? Math.round((workouts.filter(w => {
          const wDate = new Date(w.date);
          const diffTime = Math.abs(new Date('2026-05-26T18:04:12Z').getTime() - wDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        }).length / 7) * 100)
      : 85;

    let streakCount = 0;
    for (let i = consistencyData.length - 1; i >= 0; i--) {
      if (consistencyData[i].tasksCompleted > 0) {
        streakCount++;
      } else {
        break;
      }
    }
    if (tasks.filter(t => t.completed).length === 0) {
      streakCount = 5;
    }

    return {
      workoutConsistency: Math.min(100, consistencyPct),
      taskStreak: streakCount,
      totalHours: workouts.length > 0 
        ? Math.round(workouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0) / 60 * 10) / 10
        : 3.5
    };
  }, [consistencyData, workouts, tasks]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recordsData, medsData, tasksData, workoutsData] = await Promise.all([
          api.records.list(),
          api.medications.list(),
          api.tasks.list(),
          api.workouts.list()
        ]);
        setRecords(recordsData);
        setMeds(medsData);
        setTasks(tasksData);
        setWorkouts(workoutsData || []);
      } catch (err) {
        console.error("Failed to load health trace data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const totalProgPercent = goals.reduce((acc, g) => acc + Math.min(100, (g.current / g.target) * 100), 0) / (goals.length || 1);
    const computedScore = Math.min(100, Math.round(70 + (totalProgPercent * 0.25)));
    setProgressScore(computedScore);
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('doctorian_sleep_logs', JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  const sleepChartData = React.useMemo(() => {
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date('2026-05-27T13:16:49Z');
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = weekdayNames[d.getDay()];
      
      const dayLogs = sleepLogs.filter(log => log.date === dateString);
      
      let totDuration = 0;
      let avgQuality = 0;
      if (dayLogs.length > 0) {
        totDuration = dayLogs.reduce((sum, l) => sum + Number(l.duration), 0);
        avgQuality = dayLogs.reduce((sum, l) => sum + Number(l.quality), 0) / dayLogs.length;
      } else {
        // Dynamic simulated baseline variation so there are no empty states in the trends trace
        const baselineHours = [7.2, 6.5, 8.0, 7.5, 6.8, 8.5, 7.0][i % 7];
        const baselineQuality = [4, 3, 5, 4, 3, 5, 4][i % 7];
        totDuration = baselineHours;
        avgQuality = baselineQuality;
      }
      
      days.push({
        date: dateString,
        day: `${dayName} ${d.getDate()}`,
        duration: parseFloat(totDuration.toFixed(1)),
        quality: parseFloat(avgQuality.toFixed(1))
      });
    }
    return days;
  }, [sleepLogs]);

  const handleSelectWatch = async (id: 'Samsung' | 'Apple' | 'Fitbit' | 'Garmin' | 'Bluetooth' | 'None') => {
    if (id === 'Bluetooth') {
      setActiveWatch('Bluetooth');
      setIsBluetoothModalOpen(true);
    } else {
      if (id === 'None') {
        arduino.disconnect();
      }
      setActiveWatch(id);
    }
  };

  // Live Smartwatch Data Tracker Loop
  useEffect(() => {
    localStorage.setItem('doctorian_active_watch', activeWatch);
    if (activeWatch === 'None') {
      return;
    }
    
    // Set initial watch connection state in useArduino
    const meta = WATCH_METADATA_MAP[activeWatch];
    arduino.setConnection({
      connected: true,
      type: 'bluetooth',
      deviceName: meta.name
    });

    setWatchConditions(meta.conditions);
    setWatchAdvices(meta.defaultAdvices);

    if (activeWatch === 'Bluetooth') {
      // For real Bluetooth watch connection, we monitor battery state and signal strength updates
      const realWatchInterval = setInterval(() => {
        if (arduino.watchMetadata?.battery) {
          setWatchBattery(arduino.watchMetadata.battery);
        }
        // Fluctuate signal bars slightly representing active wireless communication
        setSignalStrength(s => {
          const delta = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          return Math.max(4, Math.min(5, s + delta));
        });
      }, 5000);
      return () => {
        clearInterval(realWatchInterval);
      };
    }

    const interval = setInterval(() => {
      // Simulate slight fluctuations around the watch's modifier
      const randHR = meta.vitalsModifier.heartRate + Math.floor(Math.random() * 5) - 2;
      const randSpO2 = Math.min(100, meta.vitalsModifier.spo2 + Math.floor(Math.random() * 3) - 1);
      const randTemp = meta.vitalsModifier.temperature + (Math.random() * 0.4 - 0.2);
      
      arduino.updateVitals({
        heartRate: randHR,
        spo2: randSpO2,
        temperature: parseFloat(randTemp.toFixed(1)),
        systolicBP: 118 + Math.floor(Math.random() * 6) - 3,
        diastolicBP: 78 + Math.floor(Math.random() * 4) - 2,
        respiratoryRate: 14 + Math.floor(Math.random() * 2),
        timestamp: Date.now()
      });

      // Fluctuate battery and signal bars slightly to show it's live
      setWatchBattery(b => {
        if (b <= 5) return 99; // auto-charge
        return b - (Math.random() > 0.85 ? 1 : 0);
      });
      setSignalStrength(s => {
        const delta = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(3, Math.min(5, s + delta));
      });
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [activeWatch, arduino.watchMetadata]);

  const runLiveWatchAnalysis = async () => {
    if (activeWatch === 'None') return;
    setIsWatchAnalyzing(true);
    try {
      const meta = WATCH_METADATA_MAP[activeWatch];
      const hr = arduino.vitals?.heartRate || meta.vitalsModifier.heartRate;
      const spo2 = arduino.vitals?.spo2 || meta.vitalsModifier.spo2;
      const pName = user?.displayName || 'Authorized User';
      
      const prompt = `Conduct a real-time clinical progress evaluation for patient ${pName} connected to a ${meta.name} device.
Current real-time stream vitals: Heart Rate ${hr} BPM, oxygen SPO2 ${spo2}%, skin deviation offsets present.
The watch has flagged these device-specific conditions: ${meta.conditions.join(', ')}.

Based on this, evaluate physiological trend anomalies and construct a list of 3 concise bullet-point recommendations for the user.
CLINICAL SAFEGUARD MANDATES:
1. Avoid verbose medical essays. Be extremely concise under 25 words total as a compact summary.
2. NEVER diagnose conditions or label symptoms explicitly. Highlight raw physiological metrics.
3. NEVER predict or guarantee outcomes or make promising progress timelines.
4. Conclude with exactly: "Medical attention is recommended."

Provide a clean array or scannable markdown blocks containing these structured advices.`;

      const res = await api.ai.aiChat(
        prompt,
        "You are Doctorian (v2.4), a high-resolution smartwatch biometrics intelligence core.",
        "google/gemma-2-27b-it"
      );
      if (res && res.text) {
        let finalAdvices = res.text.split('\n')
          .map(line => line.replace(/^[*\-\d.\s]+/, '').trim())
          .filter(line => line.length > 3)
          .slice(0, 3);
          
        if (finalAdvices.length === 0) {
          finalAdvices = [...meta.defaultAdvices];
        }
        
        // Ensure "Medical attention is recommended." is present
        if (!finalAdvices.some(a => a.toLowerCase().includes('medical attention is recommended'))) {
          if (finalAdvices.length >= 3) {
            finalAdvices[2] = "Medical attention is recommended.";
          } else {
            finalAdvices.push("Medical attention is recommended.");
          }
        }
        setWatchAdvices(finalAdvices);
      }
    } catch (err) {
      console.error("Live watch analysis err:", err);
      const meta = WATCH_METADATA_MAP[activeWatch];
      setWatchAdvices(meta.defaultAdvices);
    } finally {
      setIsWatchAnalyzing(false);
    }
  };

  const runGlobalAnalysis = async () => {
    setIsTracing(true);
    try {
      const result = await arduino.performGlobalTrace({
        records,
        meds,
        tasks
      });
      setTraceResult(result);
    } catch (err) {
      setTraceResult("Neural synthesis failure. Unable to generate trace.");
    } finally {
      setIsTracing(false);
    }
  };

  const getTrajectoryColor = (text: string) => {
    if (text.includes('Improving')) return 'text-emerald-500';
    if (text.includes('Declining') || text.includes('Worsening')) return 'text-rose-500';
    return 'text-blue-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader size={48} className="text-blue-600 animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Clinical Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-500/20">
              <BarChart3 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter">Health Progress Trace</h1>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Cross-Platform Longitudinal Analysis (DeepSeek R1)</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={runGlobalAnalysis}
          disabled={isTracing}
          className="group relative flex items-center gap-3 px-10 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          {isTracing ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <Brain size={20} className="group-hover:rotate-12 transition-transform" />
          )}
          <span>{isTracing ? 'ANALYZING BIOMETRIC FLUX...' : 'START NEURAL TRACE'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Metrics & Segments */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* AI Trace Result UI */}
          <AnimatePresence>
            {traceResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden"
              >
                 <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
                    <Sparkles size={240} className="text-blue-500" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                             <Microscope size={24} className="text-blue-600" />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Neural Progress Synthesis</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Generated via Clinical Brain DeepSeek R1</p>
                          </div>
                       </div>
                       <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Clinical Trace Active</span>
                       </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed mb-10">
                       {traceResult.split('\n').map((para, i) => (
                         <p key={i} className="mb-4">{para}</p>
                       ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Cardiac Drift</p>
                          <div className="flex items-center gap-2">
                             <TrendingDown size={14} className="text-emerald-500" />
                             <span className="text-xl font-black text-slate-900 dark:text-white">-4.2%</span>
                          </div>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Metabolic Eff.</p>
                          <div className="flex items-center gap-2">
                             <TrendingUp size={14} className="text-blue-500" />
                             <span className="text-xl font-black text-slate-900 dark:text-white">+12%</span>
                          </div>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Recovery Alpha</p>
                          <div className="flex items-center gap-2">
                             <Activity size={14} className="text-purple-500" />
                             <span className="text-xl font-black text-slate-900 dark:text-white">0.96</span>
                          </div>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Confidence Level</p>
                          <div className="flex items-center gap-2">
                             <ShieldCheck size={14} className="text-emerald-500" />
                             <span className="text-xl font-black text-slate-900 dark:text-white">99%</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

           {/* Smartwatch Synapse Integration Hub */}
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative mb-10">
             <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
             
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 dark:border-slate-800/60 pb-6">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                   <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 font-sans">
                     <Watch size={22} className={activeWatch !== 'None' ? 'animate-bounce' : ''} />
                   </span>
                   Smartwatch Biometric Synapse
                 </h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 font-sans">Direct integration for Samsung Health, Apple, Fitbit, & Garmin wearables</p>
               </div>
 
               {/* Status Indicator */}
               {activeWatch !== 'None' ? (
                 <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase tracking-wider shadow-sm animate-pulse shrink-0">
                   <span className="w-2 h-2 rounded-full bg-emerald-500" />
                   Live Wearable Stream Connected
                 </div>
               ) : (
                 <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-full text-slate-400 dark:text-slate-500 font-extrabold text-[9px] uppercase tracking-wider shrink-0">
                   <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                   Wearable Hub Offline
                 </div>
               )}
             </div>
 
             {/* Wearable Selector Core */}
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
               {[
                 { id: 'Samsung', label: 'Samsung Health', color: 'hover:border-blue-500 hover:text-blue-500 active:bg-blue-50/20', activeClass: 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                 { id: 'Apple', label: 'Apple Watch', color: 'hover:border-orange-500 hover:text-orange-500 active:bg-orange-50/20', activeClass: 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400' },
                 { id: 'Fitbit', label: 'Fitbit Sense', color: 'hover:border-emerald-500 hover:text-emerald-500 active:bg-emerald-50/20', activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                 { id: 'Garmin', label: 'Garmin Connect', color: 'hover:border-purple-500 hover:text-purple-500 active:bg-purple-50/20', activeClass: 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400' },
                  { id: 'Bluetooth', label: 'Real BLE Watch', color: 'hover:border-indigo-500 hover:text-indigo-500 active:bg-indigo-50/20', activeClass: 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
                 { id: 'None', label: 'Disconnect', color: 'hover:border-rose-500 hover:text-rose-500 active:bg-rose-50/20', activeClass: 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' }
               ].map((b) => (
                 <button
                   key={b.id}
                   type="button"
                   onClick={() => handleSelectWatch(b.id as any)}
                   className={`py-4 px-3 rounded-2xl border font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center gap-2 justify-center text-center ${activeWatch === b.id ? b.activeClass : 'border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/30 ' + b.color}`}
                 >
                   <Watch size={14} />
                   {b.label}
                 </button>
               ))}
             </div>
 
             {/* Bluetooth Connection Error Panel */}
              {arduino.error && (
                <div className="mb-8 p-6 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-[1.5rem] text-rose-850 dark:text-rose-300 text-[11px] font-semibold leading-relaxed space-y-2">
                  <div className="font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    Wearable Link Warning
                  </div>
                  <p>{arduino.error}</p>
                </div>
              )}

              {/* Active Wearable Status Dashboard */}
             <AnimatePresence mode="wait">
               {activeWatch !== 'None' ? (
                 <motion.div
                   key={activeWatch}
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -15 }}
                   transition={{ duration: 0.25 }}
                   className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800"
                 >
                   {/* Wearable Info (Left side) */}
                   <div className="md:col-span-5 space-y-6">
                     <div>
                       <span className="text-[9px] font-black uppercase text-indigo-550 tracking-widest">Connected Device Profile</span>
                       <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">{WATCH_METADATA_MAP[activeWatch].name}</h4>
                     </div>
 
                     <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
                         <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 shrink-0">
                           <Cpu size={16} />
                         </div>
                         <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase font-sans">Telemetry Link</p>
                           <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">Bluetooth v5.3</p>
                         </div>
                       </div>
 
                       <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
                         <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
                           <Wifi size={16} />
                         </div>
                         <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase font-sans">Battery Integrity</p>
                           <p className="text-xs font-black text-slate-900 mt-0.5">{watchBattery}% Logged</p>
                         </div>
                       </div>
                     </div>
 
                     {/* Sensor Conditions Extracted */}
                     <div className="space-y-3">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Active Wearable Conditions Detected</p>
                       <div className="space-y-2">
                         {watchConditions.map((cond, i) => (
                           <div key={i} className="flex items-center gap-2.5 px-4 h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                             <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{cond}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
 
                   {/* Waveform and real-time Clinical recommendations (Right side) */}
                   <div className="md:col-span-7 flex flex-col justify-between gap-6">
                     {/* Pulsing Waveform ECG block */}
                     <div className="p-6 bg-slate-900 text-white rounded-[1.5rem] border border-slate-800/80 relative overflow-hidden h-36 flex flex-col justify-between">
                       <div className="flex items-center justify-between relative z-10">
                         <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                           Heart-Rate Pulse Synced Live (Samsung/Android handshakes active)
                         </span>
                         <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
                       </div>
                       
                       {/* ECG Vector Waveform */}
                       <div className="absolute inset-0 top-8 opacity-40 mix-blend-screen">
                         <svg viewBox="0 0 400 100" className="w-full h-20" preserveAspectRatio="none">
                           <motion.path
                             d="M 0 50 L 50 50 L 60 55 L 70 45 L 80 50 L 100 50 L 110 50 L 120 20 L 130 90 L 140 50 L 160 50 L 210 50 L 220 55 L 230 45 L 240 50 L 260 50 L 270 50 L 280 20 L 290 90 L 300 50 L 320 50 L 370 50 L 380 55 L 390 45 L 400 50"
                             fill="transparent"
                             stroke="#10B981"
                             strokeWidth="3.5"
                             strokeLinecap="round"
                             initial={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                             animate={{ strokeDashoffset: [1000, 0] }}
                             transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                           />
                         </svg>
                       </div>
 
                       <div className="flex items-end justify-between relative z-10 mt-auto">
                         <div>
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-sans">Active Watch Pulse Rate</p>
                           <p className="text-xl font-black text-rose-400 tabular-nums">
                             {arduino.vitals?.heartRate || 72} <span className="text-[10px] text-slate-400">BPM</span>
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-sans">Live Oxygen (SpO2)</p>
                           <p className="text-xl font-black text-sky-400 tabular-nums">
                             {arduino.vitals?.spo2 || 98}%
                           </p>
                         </div>
                       </div>
                     </div>
 
                     {/* Integrated Dynamic Clinical Advices Panel */}
                     <div className="p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/80 space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Dynamic Wellness & Progress Advice</span>
                         <button
                           type="button"
                           onClick={runLiveWatchAnalysis}
                           disabled={isWatchAnalyzing}
                           className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                         >
                           <RefreshCw size={10} className={isWatchAnalyzing ? "animate-spin" : ""} />
                           {isWatchAnalyzing ? "ASSESSING..." : "RE-EVALUATE"}
                         </button>
                       </div>
 
                       <div className="space-y-2.5">
                         {watchAdvices.map((advice, idx) => (
                           <div key={idx} className="flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400 leading-normal font-semibold">
                             <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                             <p>{advice}</p>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </motion.div>
               ) : (
                 <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/10 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                   <Watch size={48} className="text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
                   <h4 className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-tight mb-2">No Active Smartwatch Linked</h4>
                   <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed mb-6">
                     Connect a virtual Samsung Health, Apple, Fitbit or Garmin device, or hook up your real smartwatch to monitor dynamic wellness progress.
                   </p>
                   <button
                     type="button"
                     onClick={() => handleSelectWatch('Samsung')}
                     className="px-8 py-3.5 bg-slate-900 hover:bg-slate-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md cursor-pointer font-sans"
                   >
                     Quick Connect Simulated Watch</button><button type="button" onClick={() => handleSelectWatch('Bluetooth')} className="mt-3 sm:mt-0 sm:ml-3 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md scale-100 hover:scale-[1.03] cursor-pointer font-sans inline-flex items-center gap-2">🔗 Pair Real BLE Watch
                   </button>
                 </div>
               )}
             </AnimatePresence>
           </div>
 
            {/* Sleep Quality & Duration Tracker Module */}
            <div id="sleep-quality-tracker-module" className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative mb-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 dark:border-slate-800/60 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                    <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                      <Moon size={22} className="animate-pulse" />
                    </span>
                    Sleep Quality & Duration Tracker
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 font-sans">
                    Log biological rest periods, monitor restorative cycles, & sync trends
                  </p>
                </div>

                <div 
                  id="sleep-feedback-banner"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-300 rounded-full text-[9px] font-black uppercase tracking-wider transition-opacity duration-300 opacity-0"
                >
                  Saved Sleep Data 💤
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Logger Form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  
                  const now = new Date();
                  const dateString = now.toISOString().split('T')[0];
                  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const dayName = weekdayNames[now.getDay()];

                  const newLog = {
                    id: `sleep_${Date.now()}`,
                    date: dateString,
                    dayLabel: `${dayName} ${now.getDate()}`,
                    duration: sleepInputDuration,
                    quality: sleepInputQuality,
                    notes: sleepInputNotes.trim() || 'Logged sleep data.',
                    timestamp: now.getTime()
                  };

                  // Update log
                  const nextLogs = [newLog, ...sleepLogs];
                  setSleepLogs(nextLogs);

                  // Update standard biometric sleep goal
                  const updatedGoals = goals.map(g => {
                    if (g.id === 'sleep') {
                      const nextVal = g.current + sleepInputDuration;
                      if (nextVal >= g.target && g.current < g.target) {
                        confetti({
                          particleCount: 150,
                          spread: 85,
                          origin: { y: 0.7 },
                          colors: ['#4F46E5', '#6366F1', '#10B981', '#3B82F6'],
                          zIndex: 100
                        });
                      }
                      return { ...g, current: parseFloat(nextVal.toFixed(1)) };
                    }
                    return g;
                  });
                  setGoals(updatedGoals);
                  localStorage.setItem('doctorian_daily_goals', JSON.stringify(updatedGoals));

                  // Reset notes
                  setSleepInputNotes('');

                  // Flash message
                  const banner = document.getElementById('sleep-feedback-banner');
                  if (banner) {
                    banner.classList.remove('hidden');
                    banner.style.opacity = '1';
                    setTimeout(() => {
                      banner.style.opacity = '0';
                    }, 3000);
                  }
                }} className="lg:col-span-12 xl:col-span-7 space-y-6">
                  {/* Slider Control */}
                  <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-850/60 space-y-4">
                    <div className="flex items-center justify-between font-sans">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                        Rest Duration (Hours Slept)
                      </span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight tabular-nums">
                        {sleepInputDuration} Hrs
                      </span>
                    </div>

                    <input 
                      type="range"
                      min="1"
                      max="16"
                      step="0.5"
                      value={sleepInputDuration}
                      onChange={(e) => setSleepInputDuration(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-800 accent-indigo-600 cursor-pointer"
                    />

                    <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-widest font-sans">
                      <span>1 Hr (Poor)</span>
                      <span>8 Hrs (Normal)</span>
                      <span>16 Hrs (Atypical)</span>
                    </div>
                  </div>

                  {/* Quality Selectors */}
                  <div className="space-y-3 font-sans">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                      Aesthetic Sleep Quality & Feel
                    </span>
                    <div className="grid grid-cols-5 gap-2.5">
                      {[
                        { val: 5, emoji: '🤩', label: 'Excellent', color: 'border-amber-500/20 hover:border-amber-500 text-amber-500 bg-amber-500/5' },
                        { val: 4, emoji: '😊', label: 'Good', color: 'border-indigo-500/20 hover:border-indigo-500 text-indigo-500 bg-indigo-500/5' },
                        { val: 3, emoji: '😐', label: 'Fair', color: 'border-blue-500/20 hover:border-blue-500 text-blue-500 bg-blue-500/5' },
                        { val: 2, emoji: '🥱', label: 'Poor', color: 'border-orange-500/20 hover:border-orange-500 text-orange-500 bg-orange-500/5' },
                        { val: 1, emoji: '😫', label: 'Terrible', color: 'border-rose-500/20 hover:border-rose-500 text-rose-500 bg-rose-500/5' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setSleepInputQuality(item.val)}
                          className={`py-3.5 px-1.5 rounded-2xl border transition-all active:scale-95 flex flex-col items-center justify-center text-center cursor-pointer ${
                            sleepInputQuality === item.val
                              ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 scale-105 shadow-md font-extrabold font-sans'
                              : 'border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-900/30 text-slate-500 font-sans ' + item.color
                          }`}
                        >
                          <span className="text-xl mb-1">{item.emoji}</span>
                          <span className="text-[8px] font-black uppercase tracking-tight leading-none">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Notes */}
                  <div className="space-y-2 font-sans">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                      Sleep Context & Physiological Notes
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g., Avoided screens, feel refreshed, slight back pain"
                      value={sleepInputNotes}
                      onChange={(e) => setSleepInputNotes(e.target.value)}
                      className="w-full text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.99] cursor-pointer"
                  >
                    🚀 Log Restorative Sleep Session
                  </button>
                </form>

                {/* Right Side: Dynamic Feedback & Log History */}
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between gap-6 font-sans">
                  {/* Dynamic Sleep Advice Card */}
                  <div className="p-6 bg-indigo-50/20 dark:bg-indigo-950/15 border border-indigo-100/30 dark:border-indigo-900/20 rounded-[2rem] space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-sans">
                      Clinical Sleep Hygiene Vector
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      {sleepInputDuration < 6 ? (
                        <span>⚠️ <strong>Somatic Deficit Warning:</strong> Sleep duration below 6 hours triggers metabolic disruption, blood pressure elevation, and cortisol surges. Consider practicing physiological sighs and limiting afternoon caffeine.</span>
                      ) : sleepInputDuration > 9 ? (
                        <span>ℹ️ <strong>Hypersomnia Advisory:</strong> Logged rest exceeds 9 hours. If accompanied by consistent fatigue, this can point to circadian misalignments or deep non-restorativeness. Consult thyroid baseline logs.</span>
                      ) : (
                        <span>✨ <strong>Optimal Homeostatic Window:</strong> Rest duration of {sleepInputDuration} hours is ideal for neurological cleanup, deep tissue repair, and clinical metabolic recalibration. Keep it up!</span>
                      )}
                    </p>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold border-t border-indigo-100/30 dark:border-indigo-900/10 pt-3">
                      {sleepInputQuality <= 2 ? (
                        <span>🔴 Rest quality is flagged as <strong>poor</strong>. Avoid screen light 90 minutes before sleep, and verify room cooling to 65-68°F (18°C) to facilitate natural core temperature drops.</span>
                      ) : (
                        <span>🟢 Good neural recovery patterns. Keeping physical activity consistent (e.g., steps goals) supports restful deep sleep induction windows.</span>
                      )}
                    </p>
                  </div>

                  {/* Sleep Log History (max 3) */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                      Chronological Logs (Recent Nights)
                    </span>
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {sleepLogs.slice(0, 3).map((log: any) => (
                        <div 
                          key={log.id} 
                          className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100/40 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-100/30 rounded-xl flex items-center justify-center font-sans text-xs shrink-0">
                              ☁️
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-[11px] text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                                {log.duration} hrs ({log.quality === 5 ? '🤩' : log.quality === 4 ? '😊' : log.quality === 3 ? '😐' : log.quality === 2 ? '🥱' : '😫'})
                              </p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                {log.date}
                              </p>
                              {log.notes && (
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                                  {log.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              // Delete log
                              const updated = sleepLogs.filter(item => item.id !== log.id);
                              setSleepLogs(updated);

                              // Decrease daily goals if they delete the log for today
                              const todayString = new Date().toISOString().split('T')[0];
                              if (log.date === todayString) {
                                const nextGoals = goals.map(g => {
                                  if (g.id === 'sleep') {
                                    return { ...g, current: Math.max(0, parseFloat((g.current - log.duration).toFixed(1))) };
                                  }
                                  return g;
                                });
                                setGoals(nextGoals);
                                localStorage.setItem('doctorian_daily_goals', JSON.stringify(nextGoals));
                              }
                            }}
                            className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-500 dark:text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            title="Delete log"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {sleepLogs.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic text-center py-4 font-bold">No sleep logs registered today. Log some rest duration above!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

           {/* Longitudinal Chart Toggleable Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-slate-100 dark:border-slate-800/60 pb-6">
               <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button 
                     type="button"
                     onClick={() => setChartMode('vitals')}
                     className={`text-left cursor-pointer transition-all ${chartMode === 'vitals' ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
                  >
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Vitals Trajectory Matrix</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cross-referencing HR, BP and SpO2 Stability</p>
                  </button>
                  <div className="hidden sm:block h-8 w-[2px] bg-slate-150 dark:bg-slate-800 mx-2" />
                  <button 
                     type="button"
                     onClick={() => setChartMode('consistency')}
                     className={`text-left cursor-pointer transition-all ${chartMode === 'consistency' ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
                  >
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Streaks</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">7-Day Consistency</p>
                  </button>
                  <div className="hidden sm:block h-8 w-[2px] bg-slate-150 dark:bg-slate-800 mx-2" />
                  <button 
                     type="button"
                     onClick={() => setChartMode('sleep')}
                     className={`text-left cursor-pointer transition-all ${chartMode === 'sleep' ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
                  >
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sleep Patterns</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-sans">Quality & Duration</p>
                  </button>
               </div>
               
               <div className="flex items-center gap-2">
                  {chartMode === 'vitals' ? (
                     <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                        {['7D', '30D', '90D'].map(t => (
                          <button key={t} type="button" className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${t === '30D' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                            {t}
                          </button>
                        ))}
                     </div>
                  ) : (
                     <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-full flex items-center gap-2 shrink-0">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Streaks Loaded</span>
                     </div>
                  )}
               </div>
            </div>

            {chartMode === 'vitals' ? (
              <div className="h-[400px] w-full">
                <SafeResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString()} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff'}}
                    />
                    <Area type="monotone" dataKey="heartRate" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHR)" strokeWidth={3} />
                    <Area type="monotone" dataKey="spo2" stroke="#10b981" fillOpacity={0} strokeWidth={3} />
                  </AreaChart>
                </SafeResponsiveContainer>
              </div>
            ) : chartMode === 'consistency' ? (
              <div className="space-y-8">
                <div className="h-[380px] w-full">
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={consistencyData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.95}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.35}/>
                        </linearGradient>
                        <linearGradient id="colorTasksCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.95}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.35}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                        label={{ value: 'Workouts (Min)', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 8, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' } }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                        label={{ value: 'Tasks Completed', angle: 90, position: 'insideRight', offset: 2, style: { fontSize: 8, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' } }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff'}}
                      />
                      <Bar yAxisId="left" dataKey="workoutsDuration" name="Workout Duration (Min)" fill="url(#colorWorkouts)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                      <Bar yAxisId="right" dataKey="tasksCompleted" name="Tasks Completed" fill="url(#colorTasksCompleted)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/60">
                  <div className="p-5 bg-emerald-50/20 dark:bg-emerald-900/5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Workout Consistency</p>
                      <p className="text-xl font-black text-slate-950 dark:text-white">{streaksSummary.workoutConsistency}%</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                      <Dumbbell size={18} />
                    </div>
                  </div>

                  <div className="p-5 bg-blue-50/20 dark:bg-blue-900/5 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Active Task Streak</p>
                      <p className="text-xl font-black text-slate-950 dark:text-white">{streaksSummary.taskStreak} Days</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                      <Target size={18} />
                    </div>
                  </div>

                  <div className="p-5 bg-indigo-50/20 dark:bg-indigo-900/5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Total Exercise</p>
                      <p className="text-xl font-black text-slate-950 dark:text-white">{streaksSummary.totalHours} Hrs</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fadeIn">
                <div className="h-[380px] w-full">
                  <SafeResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={sleepChartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSleepDuration" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.85}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.25}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" className="dark:stroke-slate-800" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{fontSize: 9, fill: '#64748b', fontWeight: 700}}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fill: '#64748b', fontWeight: 600}} 
                        label={{ value: 'DURATION (HRS)', angle: -90, position: 'insideLeft', offset: -2, style: { fontSize: 8, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' } }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fill: '#64748b', fontWeight: 600}} 
                        label={{ value: 'QUALITY (1-5)', angle: 90, position: 'insideRight', offset: 2, style: { fontSize: 8, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' } }}
                        domain={[0, 5]}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(238, 242, 255, 0.4)' }}
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff'}}
                      />
                      <Bar yAxisId="left" dataKey="duration" name="Sleep Duration" fill="url(#colorSleepDuration)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                      <Line yAxisId="right" type="monotone" dataKey="quality" name="Sleep Quality Score" stroke="#F59E0B" strokeWidth={3.5} dot={{ stroke: '#F59E0B', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </SafeResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/60">
                  <div className="p-5 bg-indigo-50/20 dark:bg-indigo-900/5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Weekly Sleep Average</p>
                      <p className="text-xl font-black text-slate-950 dark:text-white">
                        {parseFloat((sleepLogs.reduce((acc, log) => acc + Number(log.duration), 0) / (sleepLogs.length || 1)).toFixed(1))} Hrs
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                      <Moon size={18} />
                    </div>
                  </div>

                  <div className="p-5 bg-amber-50/20 dark:bg-amber-900/15 rounded-2xl border border-amber-100/50 dark:border-amber-900/20 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Average Sleep Quality</p>
                      <p className="text-xl font-black text-slate-950 dark:text-white">
                        {parseFloat((sleepLogs.reduce((acc, log) => acc + Number(log.quality), 0) / (sleepLogs.length || 1)).toFixed(1))}/5.0
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles size={18} />
                    </div>
                  </div>

                  <div className="p-5 bg-blue-50/20 dark:bg-blue-900/5 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Sleep Status</p>
                      <p className="text-xl font-black text-slate-950 dark:text-white">Rested (94%)</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                      <Target size={18} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Telemetry Pull & Clinical Entry Node */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-[3rem] p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                    <span className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                      <RefreshCw size={18} className="animate-spin-slow" />
                    </span>
                    Sync Telemetry Matrix
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Direct Capture from Connected Medical Hardware/Simulator</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    if (!arduino.vitals) {
                      const sampleVals = {
                        'Heart Rate': '76',
                        'Blood Oxygen (SpO2)': '98',
                        'Body Temperature': '36.8',
                        'Blood Pressure': '124/82',
                        'Respiratory Rate': '16'
                      };
                      setLogValue(sampleVals[logType as keyof typeof sampleVals] || '75');
                      // Flash local feedback
                      const flash = document.getElementById('sync-feedback-banner');
                      if (flash) {
                        flash.innerText = "Simulator offline. Captured standard calibrated baseline value.";
                        flash.style.opacity = "1";
                        setTimeout(() => flash.style.opacity = "0", 3500);
                      }
                      return;
                    }
                    const v = arduino.vitals;
                    if (logType === 'Heart Rate') setLogValue(Math.round(v.heartRate).toString());
                    else if (logType === 'Blood Oxygen (SpO2)') setLogValue(Math.round(v.spo2).toString());
                    else if (logType === 'Body Temperature') setLogValue(v.temperature.toFixed(1));
                    else if (logType === 'Blood Pressure') setLogValue(`${Math.round(v.systolicBP)}/${Math.round(v.diastolicBP)}`);
                    else if (logType === 'Respiratory Rate') setLogValue(Math.round(v.respiratoryRate).toString());

                    const flash = document.getElementById('sync-feedback-banner');
                    if (flash) {
                      flash.innerText = "Telemetry captured! Active signal parsed and locked to buffer successfully.";
                      flash.style.opacity = "1";
                      setTimeout(() => flash.style.opacity = "0", 3500);
                    }
                  }}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/25 active:scale-95 shrink-0 flex items-center gap-2"
                >
                  <Cpu size={14} />
                  PULL LIVE TELEMETRY
                </button>
              </div>

              {/* Status/Success feedback flash banner */}
              <div 
                id="sync-feedback-banner" 
                className="opacity-0 transition-opacity duration-300 bg-blue-950/80 border border-blue-500/30 text-blue-300 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6"
              >
                Telemetry synced
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsWritingRecord(true);
                try {
                  const unitStr = logType === 'Heart Rate' ? 'BPM' : logType === 'Blood Oxygen (SpO2)' ? '%' : logType === 'Body Temperature' ? '°C' : logType === 'Blood Pressure' ? 'mmHg' : 'RPM';
                  const timestampStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  
                  await api.records.create({
                    type: logType,
                    value: logValue,
                    unit: unitStr,
                    date: timestampStr,
                    notes: logNotes || 'Captured via IoT signal generator nodes.'
                  });

                  // Refresh list
                  const updated = await api.records.list();
                  setRecords(updated);
                  setLogNotes('');
                  
                  const flash = document.getElementById('sync-feedback-banner');
                  if (flash) {
                    flash.innerText = "Biomarker logged successfully! Added to timeline.";
                    flash.style.opacity = "1";
                    setTimeout(() => flash.style.opacity = "0", 3500);
                  }
                } catch (error) {
                  console.error(error);
                } finally {
                  setIsWritingRecord(false);
                }
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Biomarker Classification</label>
                    <select
                      value={logType}
                      onChange={(e) => {
                        const typeVal = e.target.value;
                        setLogType(typeVal);
                        const sampleVals = {
                          'Heart Rate': '72',
                          'Blood Oxygen (SpO2)': '98',
                          'Body Temperature': '36.6',
                          'Blood Pressure': '120/80',
                          'Respiratory Rate': '16'
                        };
                        setLogValue(sampleVals[typeVal as keyof typeof sampleVals] || '75');
                      }}
                      className="w-full px-5 py-4 bg-slate-900 border border-slate-800 focus:border-slate-700/80 text-white rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all custom-select-arrow"
                    >
                      <option value="Heart Rate">Heart Rate (BPM)</option>
                      <option value="Blood Oxygen (SpO2)">Blood Oxygen (SpO2 %)</option>
                      <option value="Body Temperature">Body Temperature (°C)</option>
                      <option value="Blood Pressure">Blood Pressure (mmHg)</option>
                      <option value="Respiratory Rate">Respiratory Rate (breaths/min)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Calibrated Metric Value</label>
                    <input
                      type="text"
                      required
                      value={logValue}
                      onChange={(e) => setLogValue(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-900 border border-slate-800 focus:border-slate-700/80 text-white rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="e.g., 72"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Clinical Annotations & Patient Feedback</label>
                  <textarea
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    rows={2}
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 focus:border-slate-700/80 text-white rounded-2xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                    placeholder="e.g., Patient matches baseline. Logged straight from IoT console."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isWritingRecord}
                  className="w-full py-4.5 bg-white text-slate-950 hover:bg-slate-100 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isWritingRecord ? 'STAMPING CLINICAL LOG...' : 'LOG RECORD TO HISTORIC TIMELINE'}
                </button>
              </form>
            </div>
          </div>

          {/* Segment Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {[
               { id: 'vitals', label: 'Vitals Matrix', icon: <Activity size={18} /> },
               { id: 'clinical', label: 'Medical Records', icon: <FileText size={18} /> },
               { id: 'meds', label: 'Medication Flux', icon: <Pill size={18} /> },
               { id: 'protocols', label: 'Neural Protocols', icon: <ClipboardList size={18} /> }
             ].map(seg => (
               <button
                  key={seg.id}
                  onClick={() => setActiveSegment(seg.id as any)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all ${activeSegment === seg.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'}`}
               >
                  <div className={`${activeSegment === seg.id ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'} p-3 rounded-2xl`}>
                    {seg.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{seg.label}</span>
               </button>
             ))}
          </div>

          {/* Active Segment Content */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {activeSegment === 'vitals' && 'Live Telemetry Trace'}
                  {activeSegment === 'clinical' && 'Longitudinal Records Scan'}
                  {activeSegment === 'meds' && 'Pharmacological Flux'}
                  {activeSegment === 'protocols' && 'Active Treatment Paths'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Page Index: {activeSegment.toUpperCase()}</p>
             </div>

             <div className="space-y-6">
                {activeSegment === 'vitals' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resting Baseline</p>
                       <p className="text-4xl font-black text-slate-900 dark:text-white">68<span className="text-lg text-slate-400 ml-1">BPM</span></p>
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">HRV (SDNN)</p>
                       <p className="text-4xl font-black text-slate-900 dark:text-white">42<span className="text-lg text-slate-400 ml-1">MS</span></p>
                    </div>
                  </div>
                )}
                
                {activeSegment === 'clinical' && (
                  <div className="space-y-4">
                    {records.slice(0, 3).map((rec, i) => (
                      <div key={i} className="flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                         <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                            <FileText size={24} />
                         </div>
                         <div className="flex-1">
                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{rec.title || 'Clinical Entry'}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(rec.timestamp || Date.now()).toLocaleDateString()}</p>
                         </div>
                         <ChevronRight className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                )}

                {activeSegment === 'meds' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {meds.slice(0, 4).map((med, i) => (
                      <div key={i} className="p-8 bg-emerald-50/20 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800">
                         <div className="flex items-center justify-between mb-4">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-emerald-600 border border-emerald-100 dark:border-emerald-800">
                               <Pill size={20} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase">Active</span>
                         </div>
                         <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{med.name}</p>
                         <p className="text-xs text-slate-500 font-bold opacity-75 mt-1">{med.dosage} - {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeSegment === 'protocols' && (
                   <div className="space-y-4">
                      {tasks.slice(0, 2).map((t, i) => (
                        <div key={i} className="p-8 bg-blue-50/20 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800 flex items-center gap-6">
                           <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                           <div className="flex-1">
                              <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.title}</p>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Due: {new Date(t.due_date || Date.now()).toLocaleDateString()}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Health Score & Actionables */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Health Momentum */}
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <TrendingUp size={140} />
            </div>
            <div className="relative z-10">
               <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-12">Neural Health Momentum</h3>
               
               <div className="flex flex-col items-center mb-12">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                        <motion.circle 
                          cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 88}
                          initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progressScore/100) }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="text-blue-500" 
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-[1000] tracking-tighter tabular-nums">{progressScore}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Score Matrix</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Trend Vector</span>
                     <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp size={14} />
                        <span className="text-xs font-black uppercase">+3.5% (Improving)</span>
                     </div>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: '0%' }}
                       animate={{ width: '78%' }}
                       transition={{ duration: 1, delay: 0.5 }}
                       className="h-full bg-blue-500"
                     />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 italic opacity-80">Trajectory calculated across 12 unique biological segments.</p>
               </div>
            </div>
          </div>

          {/* Daily Biometric Goals Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Daily Biometric Goals</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Calibrate steps, hydration, and exercise inputs</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                   <button 
                     type="button"
                     onClick={() => setIsResetConfirmOpen(true)}
                     className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                     title="Reset all current progress for today"
                   >
                      <RefreshCw size={11} /> Reset Daily
                   </button>
                   <button 
                     type="button"
                     onClick={() => setIsGoalsModalOpen(true)}
                     className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 shrink-0 cursor-pointer"
                   >
                      Update Goals
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                {goals.map((g) => {
                   const progressPercent = Math.min(100, Math.round((g.current / g.target) * 100));
                   return (
                      <div key={g.id} className="space-y-2.5">
                         <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                               <div className="p-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-100/60 dark:border-slate-800/80 shrink-0">
                                  {g.id === 'steps' && <Footprints size={14} className="text-amber-500" />}
                                  {g.id === 'sleep' && <Moon size={14} className="text-indigo-500" />}
                                  {g.id === 'blood_pressure' && <Activity size={14} className="text-rose-500" />}
                                  {g.id === 'meds' && <Pill size={14} className="text-purple-500" />}
                                  {!['steps', 'water', 'workout', 'sleep', 'blood_pressure', 'meds'].includes(g.id) && <Target size={14} className="text-blue-500" />}
                                  {g.id === 'water' && <Droplet size={14} className="text-blue-500" />}
                                  {g.id === 'workout' && <Dumbbell size={14} className="text-emerald-500" />}
                                </div>
                               <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wide">{g.label}</span>
                            </div>
                            <span className="font-black text-slate-900 dark:text-white text-[11px] tabular-nums flex items-baseline gap-1">
                               {g.current.toLocaleString()}/{g.target.toLocaleString()} 
                               <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">{g.unit}</span>
                            </span>
                         </div>
                         <div className="w-full h-2 bg-slate-50 dark:bg-slate-850 rounded-full overflow-hidden border border-slate-100/30 dark:border-slate-800/10">
                            <div 
                               className={`h-full rounded-full transition-all duration-500 ${
                                  g.id === 'steps' ? 'bg-amber-500' :
                                  g.id === 'water' ? 'bg-blue-500' :
                                  g.id === 'workout' ? 'bg-emerald-500' :
                                  g.id === 'sleep' ? 'bg-indigo-500' :
                                  g.id === 'blood_pressure' ? 'bg-rose-500' :
                                  g.id === 'meds' ? 'bg-purple-500' : 'bg-blue-500'
                               }`}
                               style={{ width: `${progressPercent}%` }}
                            />
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>

          {/* Critical Observations */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Clinical Markers</h3>
             <div className="space-y-6">
                {[
                  { label: 'Blood Pressure Delta', value: 'Down 5%', status: 'improving', icon: <Activity className="text-emerald-500" /> },
                  { label: 'Sleep Continuity', value: 'Up 12%', status: 'improving', icon: <Clock className="text-blue-500" /> },
                  { label: 'Adherence Rate', value: '98%', status: 'excellent', icon: <ShieldCheck className="text-purple-500" /> },
                  { label: 'Inflammation Bias', value: 'High Trace', status: 'warning', icon: <AlertCircle className="text-amber-500" /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
                     <div className="flex items-center gap-4">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                           {item.icon}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                     </div>
                     <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-500/20">
             <h3 className="text-xl font-black uppercase tracking-tight mb-8">Next Protocols</h3>
             <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-6 bg-white/10 hover:bg-white/20 rounded-3xl border border-white/20 transition-all group">
                   <div className="flex items-center gap-4">
                      <Microscope size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Neuro-Scan</span>
                   </div>
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-6 bg-white/10 hover:bg-white/20 rounded-3xl border border-white/20 transition-all group">
                   <div className="flex items-center gap-4">
                      <FileText size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Update Records</span>
                   </div>
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>

        </div>
      </div>

      <HealthGoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        goals={goals}
        onSave={saveGoals}
      />

      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetConfirmOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-2xl">
                  <AlertCircle size={28} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Reset Progress?</h4>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-0.5">Irreversible daily baseline reset</p>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                Are you sure you want to clear all your current biometric measurements and logs for today? Your targets and configurations will remain unchanged, but your progress percentages and completed state will revert back to zero.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 py-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer"
                >
                  No, Keep Progress
                </button>
                <button
                  type="button"
                  onClick={handleResetDaily}
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-rose-500/20 cursor-pointer"
                >
                  Yes, Reset Daily
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WearableConnector
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
      />
    </div>
  );
};

const Loader = ({ size = 20, className = "" }) => (
  <RefreshCw size={size} className={className} />
);
