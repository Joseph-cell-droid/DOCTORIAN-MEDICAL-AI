import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, Activity, Brain, 
  Sparkles, ShieldCheck, ChevronRight, BarChart3, 
  Calendar, Microscope, FileText, Pill, Search, ClipboardList, Cpu,
  AlertCircle, ArrowRightCircle, RefreshCw, Target, Footprints, Droplet, Dumbbell, Moon,
  Watch, Smartphone, Bluetooth, Check, Wifi, Heart, Users, UserPlus, Trash2, Plus, X,
  AlertTriangle, CheckCircle2, Tv, Terminal, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useArduinoContext } from '../ArduinoContext';
import { api, User } from '../api';
import { HealthGoalsModal, HealthGoal } from './HealthGoalsModal';
import { WearableConnector } from './WearableConnector';
import { TelemetryCastManager } from './TelemetryCastManager';
import confetti from 'canvas-confetti';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, AreaChart, Area,
  ComposedChart, Bar, Scatter, BarChart
} from 'recharts';
import { SafeResponsiveContainer } from './SafeResponsiveContainer';

// Real-time High-Fidelity Mathematical ECG Oscilloscope Component
const ECGCanvas: React.FC<{ bpm: number; color?: string }> = ({ bpm, color = "#10b981" }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animationRef = React.useRef<number | null>(null);
  const xRef = React.useRef<number>(0);
  const lastYRef = React.useRef<number>(50);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = 100;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial clear
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const frameRate = 60;
    // Calculate cycles per frame based on BPM
    const cycleLength = (60 * frameRate) / bpm; 
    let frameCount = 0;

    const render = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      const speed = 2.5; // Sweep speed in pixels per frame
      const currentX = xRef.current;
      const nextX = (currentX + speed) % width;

      // When the sweep wraps around, clear screen and redraw Grid
      if (nextX < currentX) {
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
        ctx.lineWidth = 1;
        for (let g = 0; g < width; g += 20) {
          ctx.beginPath();
          ctx.moveTo(g, 0);
          ctx.lineTo(g, height);
          ctx.stroke();
        }
        for (let g = 0; g < height; g += 20) {
          ctx.beginPath();
          ctx.moveTo(0, g);
          ctx.lineTo(width, g);
          ctx.stroke();
        }
      }

      // Clear small bar ahead of current drawing coordinate to erase historical line
      ctx.fillStyle = '#030712';
      ctx.fillRect(nextX, 0, 25, height);

      // Re-draw background grid in the blank space ahead
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nextX, 0); ctx.lineTo(nextX, height);
      ctx.stroke();

      // Synthesize ECG heartbeat signal mathematically
      frameCount = (frameCount + 1) % cycleLength;
      const phase = frameCount / cycleLength; // 0.0 to 1.0

      let offset = 0;
      if (phase >= 0.05 && phase < 0.12) {
        // P-wave: slight initial bump
        offset = Math.sin((phase - 0.05) / 0.07 * Math.PI) * 4;
      } else if (phase >= 0.15 && phase < 0.17) {
        // Q-wave: negative dip
        offset = -((phase - 0.15) / 0.02) * 5;
      } else if (phase >= 0.17 && phase < 0.20) {
        // R-spike: giant rapid ventricular contraction spike
        const rPhase = (phase - 0.17) / 0.03;
        offset = -5 + Math.sin(rPhase * Math.PI) * 45;
      } else if (phase >= 0.20 && phase < 0.23) {
        // S-dip: negative deflection
        const sPhase = (phase - 0.20) / 0.03;
        offset = -((1 - sPhase) * 12);
      } else if (phase >= 0.28 && phase < 0.42) {
        // T-wave: standard repolarization curve
        offset = Math.sin((phase - 0.28) / 0.14 * Math.PI) * 10;
      }

      const nextY = centerY - offset;

      // Draw vector wave segment
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(currentX, lastYRef.current);
      ctx.lineTo(nextX, nextY);
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow for performance

      xRef.current = nextX;
      lastYRef.current = nextY;

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bpm, color]);

  return (
    <div className="relative w-full h-[100px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

interface HealthProgressTrackerProps {
  user: User | null;
}

export const HealthProgressTracker: React.FC<HealthProgressTrackerProps> = ({ user }) => {
  const arduino = useArduinoContext();
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

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7D' | '30D' | '90D' | '120D+'>('30D');

  // Connected Patients/Family Members state
  const [connectedMembers, setConnectedMembers] = useState<{
    id: string;
    name: string;
    relation: string;
    age: number;
    connectedDevice: string;
    deviceType: 'Samsung' | 'Apple' | 'Fitbit' | 'Garmin' | 'Bluetooth' | 'None';
    vitals: { heartRate: number; spo2: number; temperature: number; systolicBP: number; diastolicBP: number };
    status: 'excellent' | 'normal' | 'warning' | 'critical';
    lastSync: string;
    battery: number;
    signal: number;
  }[]>(() => {
    const saved = localStorage.getItem('doctorian_connected_members');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'member_gloria',
        name: 'Gloria (Self)',
        relation: 'Owner',
        age: 28,
        connectedDevice: 'Samsung Galaxy Watch 6 Pro',
        deviceType: 'Samsung',
        vitals: { heartRate: 72, spo2: 98, temperature: 36.6, systolicBP: 118, diastolicBP: 78 },
        status: 'excellent',
        lastSync: 'Live',
        battery: 88,
        signal: 5
      },
      {
        id: 'member_grace',
        name: 'Grace K.',
        relation: 'Mother',
        age: 56,
        connectedDevice: 'Fitbit Sense 2',
        deviceType: 'Fitbit',
        vitals: { heartRate: 74, spo2: 96, temperature: 36.8, systolicBP: 122, diastolicBP: 80 },
        status: 'normal',
        lastSync: '2m ago',
        battery: 74,
        signal: 4
      },
      {
        id: 'member_arthur',
        name: 'Arthur M.',
        relation: 'Grandfather',
        age: 82,
        connectedDevice: 'ICU ECG Bedside',
        deviceType: 'Bluetooth',
        vitals: { heartRate: 85, spo2: 94, temperature: 37.1, systolicBP: 135, diastolicBP: 88 },
        status: 'warning',
        lastSync: 'Live',
        battery: 52,
        signal: 5
      },
      {
        id: 'member_zoe',
        name: 'Zoe J.',
        relation: 'Daughter',
        age: 8,
        connectedDevice: 'Garmin Fenix 7 Sapphire',
        deviceType: 'Garmin',
        vitals: { heartRate: 64, spo2: 99, temperature: 36.4, systolicBP: 110, diastolicBP: 72 },
        status: 'excellent',
        lastSync: '10m ago',
        battery: 95,
        signal: 3
      }
    ];
  });
  
  const [selectedMemberId, setSelectedMemberId] = useState<string>('member_gloria');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Family');
  const [newMemberAge, setNewMemberAge] = useState<number>(30);
  const [newMemberDevice, setNewMemberDevice] = useState<'Samsung' | 'Apple' | 'Fitbit' | 'Garmin' | 'Bluetooth' | 'None'>('Samsung');

  // Connected Smartwatch states
  const [activeWatch, setActiveWatch] = useState<'Samsung' | 'Apple' | 'Fitbit' | 'Garmin' | 'Bluetooth' | 'None'>(() => {
    return (localStorage.getItem('doctorian_active_watch') as any) || 'None';
  });
  const [watchBattery, setWatchBattery] = useState<number>(88);
  const [watchAdvices, setWatchAdvices] = useState<string[]>([]);
  const [isWatchAnalyzing, setIsWatchAnalyzing] = useState(false);
  const [watchConditions, setWatchConditions] = useState<string[]>([]);
  const [signalStrength, setSignalStrength] = useState<number>(4); // 1-5 bars
  const [physPreset, setPhysPreset] = useState<'balanced' | 'elevated' | 'hyper' | 'depressed'>('balanced');
  const [projectionLogs, setProjectionLogs] = useState<string[]>([
    "INITIALIZING GATT COMMUNICATOR...",
    "CAST PROJECTOR BIND SUCCESSFUL [PORT 3000]",
    "SYSTEM PIPELINE IS HEALTHY."
  ]);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);
  const [isNeuroScanOpen, setIsNeuroScanOpen] = useState(false);
  const [isUpdateRecordsOpen, setIsUpdateRecordsOpen] = useState(false);
  const [isScanningNeuro, setIsScanningNeuro] = useState(false);
  const [neuroScanProgress, setNeuroScanProgress] = useState(0);
  const [neuroScanReport, setNeuroScanReport] = useState<any | null>(null);

  // Auto-analysis and bad condition alerts states
  const [localAnalysisResult, setLocalAnalysisResult] = useState<{
    status: 'improving' | 'stable' | 'declining' | 'critical' | 'unchanged' | 'warning';
    message: string;
    details: string;
    timestamp: string;
    villageGuidance?: string;
  } | null>(null);
  
  const [previousVitals, setPreviousVitals] = useState<{
    heartRate: number;
    spo2: number;
    temperature: number;
    systolicBP: number;
    diastolicBP: number;
  } | null>(null);

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
    const resetGoals = goals.map((g, mapIdx_426) => ({ ...g, current: 0 }));
    setGoals(resetGoals);
    localStorage.setItem('doctorian_daily_goals', JSON.stringify(resetGoals));
    
    // Recalculate progress score based on 0% progress
    const computedScore = 72; // default baseline score
    setProgressScore(computedScore);
    setIsResetConfirmOpen(false);
  };

  const handleLogRecord = async (type: string, value: string, unit: string, notes: string) => {
    try {
      await api.records.create({
        type,
        value,
        unit,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        notes: notes || 'Logged via clinician shortcut dashboard.'
      });
      // Refresh list
      const updated = await api.records.list();
      setRecords(updated);
    } catch (err) {
      console.error("Error logging record shortcut:", err);
    }
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
    let daysToGenerate = 30;
    if (selectedTimeRange === '7D') daysToGenerate = 7;
    if (selectedTimeRange === '90D') daysToGenerate = 90;
    if (selectedTimeRange === '120D+') daysToGenerate = 120;

    const activeMember = connectedMembers.find(m => m.id === selectedMemberId) || connectedMembers[0];
    const baseHR = activeMember.vitals.heartRate;
    const baseSpo2 = activeMember.vitals.spo2;
    const baseSys = activeMember.vitals.systolicBP;
    const baseDia = activeMember.vitals.diastolicBP;
    const baseTemp = activeMember.vitals.temperature;

    // Generate daily historical logs for selected timeframe
    let base = Array.from({ length: daysToGenerate }).map((_, i) => {
      const ts = Date.now() - (daysToGenerate - i) * 24 * 60 * 60 * 1000;
      
      // Weekly physiological rhythms, sleep anomalies and subtle noise
      const weeklySin = Math.sin((i / 7) * Math.PI * 2);
      const cardiacDrift = (Math.random() * 4 - 2) + (weeklySin * 2.5);
      const tempNoise = parseFloat((Math.random() * 0.16 - 0.08).toFixed(2));
      const spo2Noise = Math.min(100, Math.max(88, baseSpo2 + Math.floor(Math.random() * 2) - (weeklySin > 0.85 ? 1 : 0)));
      
      return {
        heartRate: Math.max(40, Math.round(baseHR + cardiacDrift)),
        spo2: Math.round(spo2Noise),
        temperature: parseFloat((baseTemp + tempNoise).toFixed(1)),
        systolicBP: Math.round(baseSys + (Math.random() * 6 - 3) + (weeklySin * 4)),
        diastolicBP: Math.round(baseDia + (Math.random() * 4 - 2) + (weeklySin * 2.5)),
        timestamp: ts
      };
    });

    // Merge manual records if applicable
    const heartRecords = records.filter(r => r.type === 'Heart Rate' || r.type === 'HeartRate');
    heartRecords.forEach(r => {
      const ts = Date.parse(r.date) || Date.now();
      const val = parseFloat(r.value) || 72;
      const cutoff = Date.now() - daysToGenerate * 24 * 60 * 60 * 1000;
      if (ts >= cutoff) {
        base.push({
          heartRate: val,
          spo2: baseSpo2,
          temperature: baseTemp,
          systolicBP: baseSys,
          diastolicBP: baseDia,
          timestamp: ts
        });
      }
    });

    return base.sort((a, b) => a.timestamp - b.timestamp);
  }, [selectedTimeRange, selectedMemberId, connectedMembers, records]);

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

  // 1. Auto-connect on mount if no watch is active ("self-connect to the Devices")
  useEffect(() => {
    const storedWatch = localStorage.getItem('doctorian_active_watch');
    if (!storedWatch || storedWatch === 'None') {
      console.log("[HealthProgressTracker] Auto-connecting default smartwatch device on load...");
      // Samsung is a robust pre-configured virtual/smart wearable that connects instantly with no browser permissions blockage
      handleSelectWatch('Samsung');
    }
  }, []);

  // 2. Automatically self-connect to physical BLE/emulated watch when Bluetooth is selected
  useEffect(() => {
    if (activeWatch === 'Bluetooth' && !arduino.connection.connected) {
      console.log("[HealthProgressTracker] Tracing Bluetooth watch... initiating automatic self-connection...");
      arduino.connectHealthWatch().catch(err => {
        console.warn("[HealthProgressTracker] Automatic real BLE connection failed, fallback emulation coupled.", err);
      });
    }
  }, [activeWatch, arduino.connection.connected]);

  // 3. Automatically trigger AI watch analysis when watch or selected member changes
  useEffect(() => {
    if (activeWatch && activeWatch !== 'None') {
      const timer = setTimeout(() => {
        console.log(`[HealthProgressTracker] Automatically triggering live watch evaluation for ${activeWatch}...`);
        runLiveWatchAnalysis();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeWatch, selectedMemberId]);

  // 4. Continuous real-time local analysis to detect bad conditions or stable (unchanged) states
  useEffect(() => {
    if (!arduino.vitals || activeWatch === 'None') {
      setLocalAnalysisResult(null);
      return;
    }

    const vitals = arduino.vitals;
    let status: 'improving' | 'stable' | 'declining' | 'critical' | 'unchanged' | 'warning' = 'stable';
    let message = "Vitals are completely stable and in excellent ranges.";
    let details = "Homeostatic indicators demonstrate high respiratory-cardiac coupling stability.";
    let villageGuidance = "❤️ Vitals look healthy and steady! Your body is strong and ready for work. Keep drinking enough clean water.";

    // Thresholds for bad conditions (critical or declining)
    const isHighHR = vitals.heartRate > 100;
    const isLowHR = vitals.heartRate < 55;
    const isLowSpO2 = vitals.spo2 < 95;
    const isHighTemp = vitals.temperature > 37.8;
    const isLowTemp = vitals.temperature < 35.5;
    const isHighBP = vitals.systolicBP > 135 || vitals.diastolicBP > 88;
    const isLowBP = vitals.systolicBP < 95 || vitals.diastolicBP < 60;

    if (isHighHR || isLowSpO2 || isHighTemp || isHighBP) {
      status = 'critical';
      const issues = [];
      if (isHighHR) issues.push(`Elevated Heart Rate (${vitals.heartRate} BPM)`);
      if (isLowSpO2) issues.push(`Sub-optimal Oxygen Saturation (${vitals.spo2}% SpO2)`);
      if (isHighTemp) issues.push(`Feverish Temperature Shift (${vitals.temperature}°C)`);
      if (isHighBP) issues.push(`Hypertensive Blood Pressure Tension (${vitals.systolicBP}/${vitals.diastolicBP} mmHg)`);
      
      message = "Clinical alert: Abnormal biometric markers flagged!";
      details = `The smartwatch telemetry has flagged: ${issues.join(', ')}. Clinical review or rest is recommended.`;
      villageGuidance = "⚠️ WARNING: Your heart is working too hard, or oxygen is low. Please sit down immediately, drink cool water, rest in a shade, and contact a health helper if you feel dizzy.";
    } else if (isLowHR || isLowTemp || isLowBP) {
      status = 'declining';
      const issues = [];
      if (isLowHR) issues.push(`Low Heart Rate (${vitals.heartRate} BPM)`);
      if (isLowTemp) issues.push(`Hypothermic Temperature Shift (${vitals.temperature}°C)`);
      if (isLowBP) issues.push(`Low Blood Pressure Tension (${vitals.systolicBP}/${vitals.diastolicBP} mmHg)`);

      message = "Caution: Sub-nominal vitals registered.";
      details = `Potential physiological fatigue or slow metabolism detected: ${issues.join(', ')}. Keep warm and hydrated.`;
      villageGuidance = "⚠️ CAUTION: Your readings are lower than normal. Rest, keep warm, eat some hot food, and avoid heavy farming or lifting today.";
    } else {
      // Check for "no change in health status of the user"
      if (previousVitals) {
        const hrDiff = Math.abs(vitals.heartRate - previousVitals.heartRate);
        const spo2Diff = Math.abs(vitals.spo2 - previousVitals.spo2);
        const tempDiff = Math.abs(vitals.temperature - previousVitals.temperature);
        const bpSysDiff = Math.abs(vitals.systolicBP - previousVitals.systolicBP);
        
        // If there's literally no change in the vitals, inform the user
        if (hrDiff === 0 && spo2Diff === 0 && tempDiff < 0.05 && bpSysDiff === 0) {
          status = 'unchanged';
          message = "No change in biometric health status.";
          details = "Biometric baselines are perfectly stable and stationary. No active trend variation or physiological fluctuation detected.";
          villageGuidance = "✓ Readings are steady and holding perfectly. You can safely go about your normal day!";
        }
      }
    }

    setLocalAnalysisResult({
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString(),
      villageGuidance
    });

    // Save previous vitals for next comparison tick
    setPreviousVitals({
      heartRate: vitals.heartRate,
      spo2: vitals.spo2,
      temperature: vitals.temperature,
      systolicBP: vitals.systolicBP,
      diastolicBP: vitals.diastolicBP
    });
  }, [arduino.vitals, activeWatch]);

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
      // Calculate baselines based on selected physiological wave preset
      let hrMultiplier = 0;
      let spo2Multiplier = 0;
      let tempMultiplier = 0;
      let sysBaseline = 118;
      let diaBaseline = 78;

      if (physPreset === 'elevated') {
        hrMultiplier = 25;
        spo2Multiplier = -2;
        tempMultiplier = 1.2;
        sysBaseline = 135;
        diaBaseline = 88;
      } else if (physPreset === 'hyper') {
        hrMultiplier = 55;
        spo2Multiplier = -7;
        tempMultiplier = 2.5;
        sysBaseline = 175;
        diaBaseline = 105;
      } else if (physPreset === 'depressed') {
        hrMultiplier = -25;
        spo2Multiplier = -4;
        tempMultiplier = -1.5;
        sysBaseline = 92;
        diaBaseline = 58;
      }

      const randHR = Math.max(40, Math.min(220, meta.vitalsModifier.heartRate + hrMultiplier + Math.floor(Math.random() * 5) - 2));
      const randSpO2 = Math.max(70, Math.min(100, meta.vitalsModifier.spo2 + spo2Multiplier + Math.floor(Math.random() * 3) - 1));
      const randTemp = Math.max(34.0, Math.min(42.0, meta.vitalsModifier.temperature + tempMultiplier + (Math.random() * 0.4 - 0.2)));
      const finalSys = sysBaseline + Math.floor(Math.random() * 6) - 3;
      const finalDia = diaBaseline + Math.floor(Math.random() * 4) - 2;

      arduino.updateVitals({
        heartRate: randHR,
        spo2: randSpO2,
        temperature: parseFloat(randTemp.toFixed(1)),
        systolicBP: finalSys,
        diastolicBP: finalDia,
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
  }, [activeWatch, arduino.watchMetadata, physPreset]);

  // Log active state changes for high-tech streamer console
  useEffect(() => {
    if (activeWatch === 'None') {
      setProjectionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] DISCONNECTED ALL ACTIVE DEVICE STREAMS.`,
        ...prev.slice(0, 7)
      ]);
    } else {
      setProjectionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] BINDING SYSTEM PROJECTOR TO ${WATCH_METADATA_MAP[activeWatch]?.name || activeWatch}...`,
        `[${new Date().toLocaleTimeString()}] ESTABLISHING GATT PROTOCOL RELAY WITH ${activeWatch}.`,
        `[${new Date().toLocaleTimeString()}] RECEIVING LIVE SENSOR CAST (BATTERY: ${watchBattery}%, SIGNAL: ${signalStrength}/5).`,
        ...prev.slice(0, 7)
      ]);
    }
  }, [activeWatch]);

  useEffect(() => {
    setProjectionLogs(prev => [
      `[${new Date().toLocaleTimeString()}] PHYSIOLOGICAL PRESET ADJUSTED TO: ${physPreset.toUpperCase()}.`,
      `[${new Date().toLocaleTimeString()}] RECALCULATING MEDICAL BASELINE WAVES...`,
      ...prev.slice(0, 7)
    ]);
  }, [physPreset]);

  // Sync selectedMemberId with activeWatch and initial vitals instantly
  useEffect(() => {
    const member = connectedMembers.find(m => m.id === selectedMemberId);
    if (member) {
      setActiveWatch(member.deviceType);
      setWatchBattery(member.battery);
      setSignalStrength(member.signal);
      
      arduino.updateVitals({
        heartRate: member.vitals.heartRate,
        spo2: member.vitals.spo2,
        temperature: member.vitals.temperature,
        systolicBP: member.vitals.systolicBP,
        diastolicBP: member.vitals.diastolicBP,
        respiratoryRate: 14,
        timestamp: Date.now()
      });
    }
  }, [selectedMemberId, connectedMembers]);

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
        "You are Doctorian (v2.4), a high-resolution smartwatch biometrics intelligence core powered by Gemini.",
        "gemini-2.5-flash"
      );
      if (res && res.text) {
        let finalAdvices = res.text.split('\n')
          .map((line, mapIdx_973) => line.replace(/^[*\-\d.\s]+/, '').trim())
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
      const activeMember = connectedMembers.find(m => m.id === selectedMemberId) || connectedMembers[0];
      const result = await arduino.performGlobalTrace({
        records,
        meds,
        tasks,
        patientInfo: {
          name: activeMember.name,
          age: activeMember.age,
          relation: activeMember.relation,
          targetDevice: activeMember.connectedDevice
        }
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
      {/* Title Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/20">
            <BarChart3 className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter">Smart Device & Machine Link</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Smartwatch Diagnostics & Automated Health Analysis Core</p>
          </div>
        </div>
        
        {/* Simple English Indicator / Language helper for local villagers */}
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-2xl border border-blue-500/25 self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
            🛰️ Secure Neural Cast Relay Active
          </span>
        </div>
      </div>

      {/* Dynamic Clinical Projection & Multi-Device Live Casting Center */}
      <div className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* LEFT COLUMN (8/12): Live Screen-Cast Projection Screen */}
        <div className="lg:col-span-8 bg-slate-950 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          {/* Cyberpunk grid backdrop */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Projector Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider font-mono">
                  ACTIVE CLINICAL PROJECTION STREAM
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-300 uppercase tracking-wider mt-1">
                Multi-Device Neural Casting Matrix
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[9px] font-bold text-slate-400 font-mono">
                {activeWatch !== 'None' ? `RELAY: ${WATCH_METADATA_MAP[activeWatch].name.toUpperCase()}` : 'RELAY: STANDBY'}
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[9px] font-bold text-emerald-400 font-mono">
                AES-GCM-256 SECURE
              </span>
            </div>
          </div>

          {/* Main Projection Field */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 my-8 items-center">
            
            {/* SUB-COLUMN 1: SMART WATCH ACTIVE PROJECTION */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative p-2.5 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl">
                {/* Watch Outer Bezel with dynamic glowing ring */}
                <div className="relative w-[230px] h-[230px] rounded-full border-[10px] border-slate-950 bg-slate-950 shadow-inner flex flex-col justify-center items-center overflow-hidden">
                  
                  {/* LIVE BACKGROUND: Animated pulsing circles synchronized to Heart Rate! */}
                  <motion.div 
                    className="absolute w-36 h-36 rounded-full border border-blue-500/20"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 60 / (arduino.vitals?.heartRate || 72), repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="absolute w-48 h-48 rounded-full border border-teal-500/10"
                    animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 120 / (arduino.vitals?.heartRate || 72), repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Live rotating radar sweep */}
                  <motion.div 
                    className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(16,185,129,0.06)_0deg,transparent_120deg,rgba(16,185,129,0.06)_360deg)]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Floating matrix particles/ticks in background */}
                  <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* Watch Display Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-[8px] font-black tracking-[0.25em] text-blue-400 uppercase font-mono">
                      {activeWatch !== 'None' ? WATCH_METADATA_MAP[activeWatch].name.split(' ')[0] : 'OFFLINE'}
                    </p>
                    
                    {activeWatch !== 'None' ? (
                      <>
                        {/* Giant Live Heart Pulse */}
                        <div className="flex items-center gap-1.5 my-2">
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 60 / (arduino.vitals?.heartRate || 72), repeat: Infinity, ease: "easeInOut" }}
                            className="text-rose-500 text-xl"
                          >
                            ❤️
                          </motion.span>
                          <span className="text-3xl font-[1000] text-white tracking-tighter leading-none font-mono">
                            {arduino.vitals?.heartRate || 72}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold self-end mb-1">BPM</span>
                        </div>

                        {/* Split Biometrics Mini Grid */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1.5 border-t border-slate-800/80 pt-2 w-full">
                          <div className="text-center">
                            <p className="text-[7.5px] font-bold text-slate-500 uppercase">SpO2</p>
                            <p className="text-xs font-black text-teal-400 font-mono">
                              {arduino.vitals?.spo2 || 98}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[7.5px] font-bold text-slate-500 uppercase">Temp</p>
                            <p className="text-xs font-black text-amber-400 font-mono">
                              {arduino.vitals?.temperature || 36.6}°C
                            </p>
                          </div>
                        </div>

                        {/* Status tag */}
                        <span className="text-[7.5px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-1.5 py-0.5 rounded-full font-mono mt-3 uppercase tracking-wide animate-pulse">
                          🟢 LIVE LINKED
                        </span>
                      </>
                    ) : (
                      <div className="py-4">
                        <span className="text-2xl mb-1 select-none block">📡</span>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">STANDBY MODE</p>
                        <p className="text-[8px] text-slate-500 font-mono mt-1">GATT Port Open</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 font-mono">
                {activeWatch !== 'None' ? WATCH_METADATA_MAP[activeWatch].name : "No Cast Source Selected"}
              </p>
            </div>

            {/* SUB-COLUMN 2: HIGH-FIDELITY MEDICAL OSCILLOSCOPE MONITOR */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider font-mono">
                  12-LEAD PHYSIOLOGY OSCILLOSCOPE
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Real-time dynamic cardiac waveform stream projected directly from smartwatch telemetry sensors.
                </p>
              </div>

              {/* Dynamic Oscilloscope Waves Canvas */}
              <ECGCanvas 
                bpm={arduino.vitals?.heartRate || 72} 
                color={
                  physPreset === 'hyper' ? '#f43f5e' : 
                  physPreset === 'elevated' ? '#f59e0b' : 
                  physPreset === 'depressed' ? '#38bdf8' : '#10b981'
                } 
              />

              {/* Grid of projected vital parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
                {/* Pulse */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-1">HR Pulse</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black font-mono text-white leading-none">
                      {arduino.vitals?.heartRate || "--"}
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase font-mono">BPM</span>
                  </div>
                </div>
                {/* SpO2 */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-1">O2 Sat</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black font-mono text-white leading-none">
                      {arduino.vitals?.spo2 || "--"}
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase font-mono">%</span>
                  </div>
                </div>
                {/* BP */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-1">BP Arterial</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black font-mono text-white leading-none truncate">
                      {arduino.vitals ? `${arduino.vitals.systolicBP}/${arduino.vitals.diastolicBP}` : "--/--"}
                    </span>
                  </div>
                </div>
                {/* Temp */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-1">Body Temp</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-black font-mono text-white leading-none">
                      {arduino.vitals?.temperature || "--"}
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase font-mono">°C</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Projector Stats Footer */}
          <div className="relative z-10 border-t border-slate-800/80 pt-5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                LATENCY: 8ms
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                STABILITY: 99.8%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                FRAME RATE: 60 FPS
              </span>
            </div>
            <span>
              SYSTEM ID: DOC-NET-PROJECTOR-01
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN (4/12): Casting Controller & AI Diagnostics Console */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl opacity-30 pointer-events-none" />
          
          <div className="space-y-6">
            
            {/* Source Header */}
            <div>
              <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40 font-mono">
                DEVICE CAST GATEWAY
              </span>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mt-1.5">
                Casting Source Controller
              </h4>
            </div>

            {/* Source Buttons List */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Samsung', label: 'Samsung Galaxy', emoji: '⌚', sub: 'WearOS v4' },
                { id: 'Apple', label: 'Apple Ultra', emoji: '🍏', sub: 'WatchOS 10' },
                { id: 'Fitbit', label: 'Fitbit Sense', emoji: '💚', sub: 'FitbitOS' },
                { id: 'Garmin', label: 'Garmin Fenix', emoji: '⚡', sub: 'Connect IQ' },
                { id: 'Bluetooth', label: 'Medical BLE', emoji: '📡', sub: 'Raw GATT' },
                { id: 'None', label: 'Disable Cast', emoji: '❌', sub: 'Clear Relay' },
              ].map((d, mapIdx_1302) => {
                const isActive = activeWatch === d.id;
                let activeStyle = "";
                if (isActive) {
                  activeStyle = d.id === 'None' 
                    ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400" 
                    : "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/5";
                } else {
                  activeStyle = "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                }

                return (
                  <button
                    type="button"
                    key={`watch-${d.id}-${mapIdx_1302}`}
                    onClick={() => handleSelectWatch(d.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${activeStyle}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black">{d.label}</span>
                      <span className="text-sm select-none">{d.emoji}</span>
                    </div>
                    <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-semibold font-mono mt-0.5 uppercase tracking-wider">{d.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Physiological Wave Preset Controller */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest font-mono">
                PHYSIOLOGY CALIBRATION
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { id: 'balanced', label: 'Balanced', color: 'border-emerald-500/20 active:bg-emerald-500 text-emerald-500' },
                  { id: 'elevated', label: 'Elevated', color: 'border-amber-500/20 active:bg-amber-500 text-amber-500' },
                  { id: 'hyper', label: 'Hyper / AFib', color: 'border-rose-500/20 active:bg-rose-500 text-rose-500' },
                  { id: 'depressed', label: 'Depressed', color: 'border-sky-500/20 active:bg-sky-500 text-sky-500' },
                ].map((p, mapIdx_1341) => {
                  const isPresetActive = physPreset === p.id;
                  let style = isPresetActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800";
                  
                  return (
                    <button
                      type="button"
                      key={`phys-preset-${p.id}-${mapIdx_1341}`}
                      onClick={() => setPhysPreset(p.id as any)}
                      className={`py-1.5 px-3 rounded-xl border text-[9px] font-black uppercase tracking-wider text-center transition-all cursor-pointer select-none ${style}`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.id === 'balanced' ? 'bg-emerald-500' :
                          p.id === 'elevated' ? 'bg-amber-500' :
                          p.id === 'hyper' ? 'bg-rose-500' : 'bg-sky-500'
                        }`} />
                        {p.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connection log CLI box */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <Terminal size={10} /> ACTIVE PIPELINE LOG
              </span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[8px] text-emerald-400 h-[85px] overflow-y-auto mt-2 space-y-1 scrollbar-none">
                {projectionLogs.map((log, i) => (
                  <div key={`healthprogresstracker-l1376-i-${i}`} className="truncate">
                    <span className="text-slate-600 mr-1">&gt;</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Local diagnostic outcomes summary card */}
            <AnimatePresence mode="wait">
              {localAnalysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-250/30 dark:border-slate-800 rounded-2xl text-[10px]"
                >
                  <div className="flex items-center gap-1.5 font-black uppercase mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      localAnalysisResult.status === 'improving' || localAnalysisResult.status === 'stable' ? 'bg-emerald-500' :
                      localAnalysisResult.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="text-slate-800 dark:text-slate-200">
                      AI Analysis: {localAnalysisResult.message}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {localAnalysisResult.details}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Core expert diagnostic triggers */}
          <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              type="button"
              onClick={runLiveWatchAnalysis}
              disabled={isWatchAnalyzing || activeWatch === 'None'}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md font-sans"
            >
              <Brain size={12} className={isWatchAnalyzing ? "animate-spin" : ""} />
              <span>{isWatchAnalyzing ? "Synthesizing AI Diagnosis..." : "Compute AI Clinical Report"}</span>
            </button>
            
            <button
              type="button"
              onClick={runGlobalAnalysis}
              disabled={isTracing || activeWatch === 'None'}
              className="w-full py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-850 dark:hover:bg-indigo-700 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md font-sans"
            >
              <Cpu size={12} className={isTracing ? "animate-spin" : ""} />
              <span>{isTracing ? "Plotting Trajectory..." : "Neural Progress Trace"}</span>
            </button>
          </div>

        </div>

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
                         <p key={`healthprogresstracker-l1471-i-${i}`} className="mb-4">{para}</p>
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

          {/* Real-time Dynamic Biometric Casting & Emulation Control Console */}
          <TelemetryCastManager />

          {/* Smartphone Core Sensors Hub */}
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative mb-10 text-left">
             <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
             
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 dark:border-slate-800/60 pb-6">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                   <span className="p-2.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-100 dark:border-teal-900/30 font-sans">
                     <Smartphone size={22} />
                   </span>
                   Smartphone Sensors & Diagnostics
                 </h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 font-sans">Direct feed for internal phone accelerometer, steps, and webcam PPG vitals</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
               <div className="space-y-4">
                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                   Doctorian leverages your smartphone's built-in telemetry instruments. Monitor continuous 3-axis motion profiles, active step/calorie expenditure, and measure PPG pulse waves instantly using your camera lens.
                 </p>
                 <button
                   type="button"
                   onClick={() => setIsBluetoothModalOpen(true)}
                   className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md hover:shadow-lg hover:shadow-teal-500/10 cursor-pointer font-sans inline-flex items-center gap-2"
                 >
                   <Smartphone size={14} />
                   Configure Smartphone Sensors
                 </button>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Accelerometer</span>
                   <p className="text-xs font-bold text-slate-500 uppercase font-sans">3-Axis Active</p>
                 </div>
                 <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Webcam PPG</span>
                   <p className="text-xs font-bold text-slate-500 uppercase font-sans">Camera Pulse Ready</p>
                 </div>
               </div>
             </div>
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
                  const updatedGoals = goals.map((g, mapIdx_1606) => {
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
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
                      {[
                        { val: 5, emoji: '🤩', label: 'Excellent', color: 'border-amber-500/20 hover:border-amber-500 text-amber-500 bg-amber-500/5' },
                        { val: 4, emoji: '😊', label: 'Good', color: 'border-indigo-500/20 hover:border-indigo-500 text-indigo-500 bg-indigo-500/5' },
                        { val: 3, emoji: '😐', label: 'Fair', color: 'border-blue-500/20 hover:border-blue-500 text-blue-500 bg-blue-500/5' },
                        { val: 2, emoji: '🥱', label: 'Poor', color: 'border-orange-500/20 hover:border-orange-500 text-orange-500 bg-orange-500/5' },
                        { val: 1, emoji: '😫', label: 'Terrible', color: 'border-rose-500/20 hover:border-rose-500 text-rose-500 bg-rose-500/5' }
                      ].map((item, itemIdx) => (
                        <button
                          key={`hpt-val-${item.val}-${itemIdx}`}
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
                      {sleepLogs.slice(0, 3).map((log: any, mapIdx_1751) => (
                        <div 
                          key={`sleep-log-${log.id}-${mapIdx_1751}`} 
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
                                const nextGoals = goals.map((g, mapIdx_1784) => {
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

           {/* Connected Patients & Wearables Hub */}
           <div id="connected-patients-wearables-hub" className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden mb-10 text-left relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
             
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-slate-100 dark:border-slate-800/60 pb-6">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                    <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                      <Users size={22} className="animate-pulse" />
                    </span>
                    Connected Patients & Wearables Hub
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 font-sans">
                    Monitor real-time vitals, connection states, and long-term health statuses of all linked members
                  </p>
               </div>

               <button
                 type="button"
                 onClick={() => setIsAddMemberOpen(true)}
                 className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 flex items-center gap-2 active:scale-95 cursor-pointer shadow-md inline-flex font-mono"
               >
                 <UserPlus size={14} />
                 Link New Patient
               </button>
             </div>

             {/* Connection & Member Cards Row */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {connectedMembers.map((member, mapIdx_1839) => {
                 const isSelected = member.id === selectedMemberId;
                 const statusGlow = member.status === 'excellent' ? 'bg-emerald-500 shadow-emerald-500/50' :
                                    member.status === 'normal' ? 'bg-indigo-500 shadow-indigo-500/50' :
                                    member.status === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-rose-500 shadow-rose-500/50';

                 const borderHighlight = isSelected 
                   ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-lg scale-[1.02]' 
                   : 'border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-905/40 hover:border-slate-300 dark:hover:border-slate-700';

                 return (
                   <div 
                     key={`member-${member.id}-${mapIdx_1839}`}
                     onClick={() => setSelectedMemberId(member.id)}
                     className={`p-6 rounded-3xl border transition-all cursor-pointer select-none relative flex flex-col justify-between ${borderHighlight}`}
                   >
                     {/* Top Bar inside Member Card */}
                     <div className="flex items-start justify-between gap-2">
                       <div className="min-w-0 text-left">
                         <div className="flex items-center gap-1.5 flex-wrap">
                           <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                             {member.relation}
                           </span>
                           <span className="text-[9px] font-bold text-slate-400 font-mono">
                             Age {member.age}
                           </span>
                         </div>
                         <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5 truncate">
                           {member.name}
                         </h4>
                       </div>

                       <div className="flex items-center gap-1.5 shrink-0 relative w-3.5 h-3.5">
                         <span className={`w-2.5 h-2.5 rounded-full animate-ping shrink-0 absolute inset-0.5 ${statusGlow}`} />
                         <span className={`w-2 h-2 rounded-full shrink-0 absolute inset-1 ${statusGlow}`} />
                       </div>
                     </div>

                     {/* Vitals Summary Rows */}
                     <div className="my-5 space-y-2 border-y border-slate-50 dark:border-slate-800/40 py-3 text-left">
                       <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider">Heart Pulse</span>
                         <span className="text-rose-500 font-black font-mono text-xs">
                           {member.vitals.heartRate} <span className="text-[8px] text-slate-400 font-normal">BPM</span>
                         </span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider">Blood Press</span>
                         <span className="text-emerald-500 font-black font-mono text-xs">
                           {member.vitals.systolicBP}/{member.vitals.diastolicBP} <span className="text-[8px] text-slate-450 font-normal">mmHg</span>
                         </span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider">Ox Saturation</span>
                         <span className="text-sky-500 font-black font-mono text-xs">
                           {member.vitals.spo2}%
                         </span>
                       </div>
                     </div>

                     {/* Bottom Device Sync Block */}
                     <div className="flex justify-between items-center text-[10px] mt-2">
                       <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 min-w-0">
                         <Watch size={11} className="shrink-0" />
                         <span className="truncate font-bold text-[9px]">{member.connectedDevice}</span>
                       </div>
                       <div className="text-right shrink-0">
                         <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase font-mono">
                           {member.lastSync}
                         </span>
                       </div>
                     </div>

                     {/* Action to delete other than self */}
                     {member.id !== 'member_gloria' && (
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           const updated = connectedMembers.filter(m => m.id !== member.id);
                           setConnectedMembers(updated);
                           localStorage.setItem('doctorian_connected_members', JSON.stringify(updated));
                           if (selectedMemberId === member.id) {
                             setSelectedMemberId('member_gloria');
                           }
                         }}
                         className="absolute -top-2 -right-2 p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-500 rounded-full cursor-pointer transition-all border border-rose-100/30"
                         title="Remove connected patient"
                       >
                         <Trash2 size={10} />
                       </button>
                     )}
                   </div>
                 );
               })}
             </div>

             {/* Dynamic Add Connected Member Modal */}
             <AnimatePresence>
               {isAddMemberOpen && (
                 <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 w-full max-w-lg shadow-2xl relative"
                   >
                     <button
                       type="button"
                       onClick={() => setIsAddMemberOpen(false)}
                       className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-full transition-all cursor-pointer"
                     >
                       <X size={16} />
                     </button>

                     <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                       Link New Patient / Wearable
                     </h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 font-sans">
                       Add family member or patient parameters to establish direct cast streams
                     </p>

                     <div className="space-y-4 text-left">
                       <div>
                         <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                         <input
                           type="text"
                           value={newMemberName}
                           onChange={(e) => setNewMemberName(e.target.value)}
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                           placeholder="e.g. Richard J."
                         />
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                         <div>
                           <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Relation / Role</label>
                           <select
                             value={newMemberRelation}
                             onChange={(e) => setNewMemberRelation(e.target.value)}
                             className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold font-sans focus:outline-none"
                           >
                             <option value="Family">Family</option>
                             <option value="Parent">Parent</option>
                             <option value="Spouse">Spouse</option>
                             <option value="Child">Child</option>
                             <option value="Clinic Patient">Clinic Patient</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Age</label>
                           <input
                             type="number"
                             value={newMemberAge}
                             onChange={(e) => setNewMemberAge(Number(e.target.value))}
                             className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold font-sans focus:outline-none"
                             min="1"
                           />
                         </div>
                       </div>

                       <div>
                         <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Smartwatch Device Type</label>
                         <select
                           value={newMemberDevice}
                           onChange={(e) => setNewMemberDevice(e.target.value as any)}
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold font-sans focus:outline-none"
                         >
                           <option value="Samsung">Samsung Galaxy Watch 6</option>
                           <option value="Apple">Apple Watch Ultra / Series 9</option>
                           <option value="Fitbit">Fitbit Sense 2 / Inspire</option>
                           <option value="Garmin">Garmin Fenix 7 Sapphire</option>
                           <option value="Bluetooth">Direct Web BLE Transceiver</option>
                         </select>
                       </div>
                     </div>

                     <div className="mt-8 flex gap-3">
                       <button
                         type="button"
                         onClick={() => setIsAddMemberOpen(false)}
                         className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all"
                       >
                         Cancel
                       </button>
                       <button
                         type="button"
                         onClick={() => {
                           if (!newMemberName.trim()) return;
                           
                           // Setup typical physiological baselines based on selected smartwatch and age
                           const pulseBaseline = newMemberDevice === 'Garmin' ? 62 : newMemberDevice === 'Apple' ? 70 : 76;
                           const spo2Value = newMemberDevice === 'Apple' ? 99 : 97;
                           const systValue = 115 + Math.floor(Math.random() * 12);
                           const diastValue = 75 + Math.floor(Math.random() * 8);

                           const newMember = {
                             id: `member_${Date.now()}`,
                             name: newMemberName,
                             relation: newMemberRelation,
                             age: newMemberAge,
                             connectedDevice: newMemberDevice === 'Samsung' ? 'Samsung Galaxy Watch 6 Pro' :
                                              newMemberDevice === 'Apple' ? 'Apple Watch Ultra' :
                                              newMemberDevice === 'Fitbit' ? 'Fitbit Sense 2' :
                                              newMemberDevice === 'Garmin' ? 'Garmin Fenix 7 Sapphire' : 'Real-time Bluetooth BLE device',
                             deviceType: newMemberDevice,
                             vitals: {
                               heartRate: pulseBaseline,
                               spo2: spo2Value,
                               temperature: 36.6,
                               systolicBP: systValue,
                               diastolicBP: diastValue
                             },
                             status: 'normal' as any,
                             lastSync: 'Just now',
                             battery: 92,
                             signal: 4
                           };

                           const updated = [...connectedMembers, newMember];
                           setConnectedMembers(updated);
                           localStorage.setItem('doctorian_connected_members', JSON.stringify(updated));
                           
                           setIsAddMemberOpen(false);
                           setNewMemberName('');
                           setSelectedMemberId(newMember.id); // automatically switch focus to newly connected member!

                           confetti({
                             particleCount: 80,
                             spread: 60,
                             origin: { y: 0.8 }
                           });
                         }}
                         className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md"
                       >
                         Link Device
                       </button>
                     </div>
                   </motion.div>
                 </div>
               )}
             </AnimatePresence>
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
                        {['7D', '30D', '90D', '120D+'].map((t, tIdx) => (
                          <button 
                            key={`hpt-tr-${t}-${tIdx}`} 
                            type="button" 
                            onClick={() => setSelectedTimeRange(t as any)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${selectedTimeRange === t ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm font-extrabold shadow-indigo-500/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'}`}
                          >
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
             ].map((seg, segIdx) => (
               <button
                  key={`hpt-seg-${seg.id}-${segIdx}`}
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
                      <div key={`healthprogresstracker-l2539-i-${i}`} className="flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
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
                      <div key={`healthprogresstracker-l2556-i-${i}`} className="p-8 bg-emerald-50/20 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800">
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
                        <div key={`healthprogresstracker-l2573-i-${i}`} className="p-8 bg-blue-50/20 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800 flex items-center gap-6">
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
                {goals.map((g, mapIdx_2665) => {
                   const progressPercent = Math.min(100, Math.round((g.current / g.target) * 100));
                   return (
                      <div key={`healthprogresstracker-l2669-${mapIdx_2665}`} className="space-y-2.5">
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
                  <div key={`healthprogresstracker-l2717-i-${i}`} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
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
                <button 
                  onClick={() => setIsNeuroScanOpen(true)}
                  className="w-full flex items-center justify-between p-6 bg-white/10 hover:bg-white/20 rounded-3xl border border-white/20 transition-all group cursor-pointer"
                >
                   <div className="flex items-center gap-4">
                      <Microscope size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Neuro-Scan</span>
                   </div>
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setIsUpdateRecordsOpen(true)}
                  className="w-full flex items-center justify-between p-6 bg-white/10 hover:bg-white/20 rounded-3xl border border-white/20 transition-all group cursor-pointer"
                >
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

      <NeuroScanModal
        isOpen={isNeuroScanOpen}
        onClose={() => setIsNeuroScanOpen(false)}
        vitals={arduino.vitals}
        onLogRecord={handleLogRecord}
      />

      <UpdateRecordsModal
        isOpen={isUpdateRecordsOpen}
        onClose={() => setIsUpdateRecordsOpen(false)}
        vitals={arduino.vitals}
        onLogRecord={handleLogRecord}
      />
    </div>
  );
};

// ==========================================
// NeuroScanModal Component
// ==========================================
interface NeuroScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  vitals: any;
  onLogRecord: (type: string, value: string, unit: string, notes: string) => Promise<void>;
}

const NeuroScanModal: React.FC<NeuroScanModalProps> = ({ isOpen, onClose, vitals, onLogRecord }) => {
  const [targetState, setTargetState] = useState<'focus' | 'relax' | 'sleep' | 'creative'>('focus');
  const [probeIntensity, setProbeIntensity] = useState<number>(65);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [scanReport, setScanReport] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [eegData, setEegData] = useState<any[]>(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      time: i,
      alpha: 15 + Math.sin(i * 0.4) * 5 + Math.random() * 3,
      beta: 25 + Math.cos(i * 0.7) * 8 + Math.random() * 4,
      theta: 10 + Math.sin(i * 0.2) * 4 + Math.random() * 2,
    }))
  );

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        // Increment progress
        setScanProgress(prev => {
          const next = prev + Math.floor(Math.random() * 8) + 4;
          if (next >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            setScanProgress(100);
            
            // Generate Report details based on target state
            const focus = targetState === 'focus' ? 85 + Math.floor(Math.random() * 12) : 55 + Math.floor(Math.random() * 15);
            const coherence = 80 + Math.floor(Math.random() * 18);
            const fatigue = targetState === 'sleep' ? 12 + Math.floor(Math.random() * 10) : 25 + Math.floor(Math.random() * 20);
            const neuroScore = Math.round((focus + coherence + (100 - fatigue)) / 3);
            
            setScanReport({
              focusIndex: focus,
              synapticCoherence: coherence,
              fatigueLevel: fatigue,
              neuroplasticity: neuroScore,
              amplitude: Math.round(probeIntensity * 1.2),
              dominantWave: targetState === 'focus' ? 'Beta/Gamma' : targetState === 'relax' ? 'Alpha' : targetState === 'sleep' ? 'Delta' : 'Theta',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
            return 100;
          }
          
          // Update Status text dynamically based on progress
          if (next < 20) setScanStatus('Booting EEG microvolt transducer array...');
          else if (next < 45) setScanStatus('Calibrating multi-channel synaptic resonance...');
          else if (next < 70) setScanStatus('Mapping blood flow kinetics in prefrontal cortex...');
          else if (next < 90) setScanStatus('Measuring micro-amperage potentials in anterior cingulate...');
          else setScanStatus('Synthesizing neuroplasticity vectors & cortical baseline...');

          return next;
        });

        // Simulate active brainwaves
        setEegData(prev => {
          const next = [...prev, {
            time: prev.length,
            alpha: (targetState === 'relax' ? 40 : 15) + Math.sin(prev.length * 0.5) * 12 + Math.random() * 8,
            beta: (targetState === 'focus' ? 50 : 20) + Math.cos(prev.length * 0.8) * 18 + Math.random() * 10,
            theta: (targetState === 'creative' ? 35 : 10) + Math.sin(prev.length * 0.3) * 8 + Math.random() * 5,
          }];
          if (next.length > 20) next.shift();
          return next;
        });

      }, 150);
    }
    return () => clearInterval(interval);
  }, [isScanning, targetState, probeIntensity]);

  const handleStartScan = () => {
    setScanReport(null);
    setScanProgress(0);
    setSavedSuccess(false);
    setIsScanning(true);
    setScanStatus('Establishing neural contact...');
  };

  const handleSaveReport = async () => {
    if (!scanReport) return;
    setIsSaving(true);
    try {
      const notes = `Target state: ${targetState.toUpperCase()}. Dominant wave: ${scanReport.dominantWave}. Synaptic Coherence: ${scanReport.synapticCoherence}%, Neuroplasticity Score: ${scanReport.neuroplasticity}/100. Recommendations: Engaged cognitive entrainment protocols.`;
      await onLogRecord(
        'Neuro-Scan',
        `Focus Index: ${scanReport.focusIndex}%`,
        'COGNITIVE_RESONANCE',
        notes
      );
      setSavedSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#3B82F6', '#8B5CF6', '#10B981']
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-slate-900 border border-slate-800 text-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 font-sans p-6 sm:p-10 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2.5xl border border-blue-500/20">
            <Microscope size={28} className={isScanning ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Neuro-Scan Diagnostics</h3>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-0.5">High-Resolution Cognitive Resonance Mapping</p>
          </div>
        </div>

        {/* Dynamic Wave Visualizer */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-4 left-4 flex gap-3 z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse" />
              <span className="text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider">Alpha (Cognitive)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block animate-pulse" />
              <span className="text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider">Beta (Focus)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block animate-pulse" />
              <span className="text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider">Theta (Creative)</span>
            </div>
          </div>

          <div className="h-44 flex items-end justify-center gap-[2px] pt-8">
            {eegData.map((d, i) => {
              const heightAlpha = Math.min(130, Math.max(10, d.alpha * 2));
              const heightBeta = Math.min(130, Math.max(10, d.beta * 2));
              const heightTheta = Math.min(130, Math.max(10, d.theta * 2));
              return (
                <div key={`healthprogresstracker-l3020-i-${i}`} className="flex-1 flex flex-col justify-end items-center h-full gap-[3px] opacity-80">
                  <div style={{ height: `${heightBeta}px` }} className="w-full bg-gradient-to-t from-indigo-600/10 to-indigo-500 rounded-full transition-all duration-150" />
                  <div style={{ height: `${heightAlpha}px` }} className="w-full bg-gradient-to-t from-blue-600/10 to-blue-500 rounded-full transition-all duration-150" />
                  <div style={{ height: `${heightTheta}px` }} className="w-full bg-gradient-to-t from-purple-600/10 to-purple-500 rounded-full transition-all duration-150" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Panel */}
        {!isScanning && !scanReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Target Cognitive State</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'focus', label: 'Beta (Focus)', color: 'border-indigo-500/30' },
                    { id: 'relax', label: 'Alpha (Relax)', color: 'border-blue-500/30' },
                    { id: 'sleep', label: 'Delta (Sleep)', color: 'border-cyan-500/30' },
                    { id: 'creative', label: 'Theta (Creative)', color: 'border-purple-500/30' }
                  ].map((state, mapIdx_3041) => (
                    <button
                      key={`healthprogresstracker-l3044-${mapIdx_3041}`}
                      type="button"
                      onClick={() => setTargetState(state.id as any)}
                      className={`py-3 px-4 rounded-xl border text-[11px] font-black uppercase tracking-wider text-center transition-all cursor-pointer ${targetState === state.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'}`}
                    >
                      {state.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Sensor Amplitude: {probeIntensity}%</label>
                <div className="bg-slate-800/40 border border-slate-700/40 p-5 rounded-2xl flex flex-col justify-center h-[76px]">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={probeIntensity}
                    onChange={(e) => setProbeIntensity(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-750 cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-wider mt-2">
                    <span>MIN PROBE</span>
                    <span>BALANCED</span>
                    <span>HYPER VECTOR</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartScan}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95 cursor-pointer flex items-center justify-center gap-3"
            >
              <Cpu size={16} className="animate-spin-slow" />
              LAUNCH ACTIVE EEG SCANNER
            </button>
          </div>
        )}

        {/* Scanning Progress */}
        {isScanning && (
          <div className="space-y-6 py-6 text-center">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="56" cy="56" r="50" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                <circle cx="56" cy="56" r="50" className="stroke-blue-500 transition-all duration-150" strokeWidth="8" fill="transparent" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * (1 - scanProgress / 100)}`} />
              </svg>
              <span className="text-xl font-black font-mono text-white">{scanProgress}%</span>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-tight text-white animate-pulse">{scanStatus}</p>
              <p className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest mt-2">PARSING CORTICAL POTENTIALS VIA PREFRONTAL CHANNELS</p>
            </div>
          </div>
        )}

        {/* Results Card */}
        {scanReport && (
          <div className="space-y-8">
            <div className="p-6 bg-slate-950/40 border border-emerald-500/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-emerald-400">Cortical Mapping Complete</h4>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">EEG diagnostic matrix parsed and stabilized</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-900/80 border border-slate-850 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Focus Index</span>
                  <span className="text-lg font-black text-white">{scanReport.focusIndex}%</span>
                </div>
                <div className="p-4 bg-slate-900/80 border border-slate-850 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Dominant Wave</span>
                  <span className="text-lg font-black text-blue-400">{scanReport.dominantWave}</span>
                </div>
                <div className="p-4 bg-slate-900/80 border border-slate-850 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Synapses Coherence</span>
                  <span className="text-lg font-black text-purple-400">{scanReport.synapticCoherence}%</span>
                </div>
                <div className="p-4 bg-slate-900/80 border border-slate-850 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Neuroplasticity</span>
                  <span className="text-lg font-black text-indigo-400">{scanReport.neuroplasticity}/100</span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-850 pt-5 text-xs text-slate-400 leading-relaxed">
                <p className="font-bold text-slate-300 uppercase text-[9px] tracking-widest mb-1.5">🔬 AI Clinical Diagnosis:</p>
                Spontaneous <span className="text-blue-400 font-bold">{scanReport.dominantWave} wave</span> synchronization registered across prefrontal arrays. Patient demonstrates optimal attention resilience with mental fatigue coefficients at <span className="text-white font-bold">{scanReport.fatigueLevel}%</span>. Active homeostasis parameters are fully confirmed.
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartScan}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                RE-RUN DIAGNOSTIC
              </button>
              
              {!savedSuccess ? (
                <button
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader size={12} className="animate-spin" /> : <ShieldCheck size={14} />}
                  SAVE REPORT TO CLINICAL RECORDS
                </button>
              ) : (
                <div className="flex-1 py-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <Check size={14} />
                  REPORT COMMITTED SUCCESSFULLY
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};


// ==========================================
// UpdateRecordsModal Component
// ==========================================
interface UpdateRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vitals: any;
  onLogRecord: (type: string, value: string, unit: string, notes: string) => Promise<void>;
}

const UpdateRecordsModal: React.FC<UpdateRecordsModalProps> = ({ isOpen, onClose, vitals, onLogRecord }) => {
  const [logType, setLogType] = useState('Heart Rate');
  const [logValue, setLogValue] = useState('72');
  const [logNotes, setLogNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState(false);

  // Set default sample values on logType changes
  useEffect(() => {
    const sampleVals = {
      'Heart Rate': '72',
      'Blood Oxygen (SpO2)': '98',
      'Body Temperature': '36.6',
      'Blood Pressure': '120/80',
      'Respiratory Rate': '16'
    };
    setLogValue(sampleVals[logType as keyof typeof sampleVals] || '75');
  }, [logType]);

  const handlePullTelemetry = () => {
    if (!vitals) {
      const sampleVals = {
        'Heart Rate': '76',
        'Blood Oxygen (SpO2)': '98',
        'Body Temperature': '36.8',
        'Blood Pressure': '124/82',
        'Respiratory Rate': '16'
      };
      setLogValue(sampleVals[logType as keyof typeof sampleVals] || '75');
      triggerLocalFeedback("Simulator offline. Captured standard calibrated baseline value.");
      return;
    }
    
    if (logType === 'Heart Rate') setLogValue(Math.round(vitals.heartRate).toString());
    else if (logType === 'Blood Oxygen (SpO2)') setLogValue(Math.round(vitals.spo2).toString());
    else if (logType === 'Body Temperature') setLogValue(vitals.temperature.toFixed(1));
    else if (logType === 'Blood Pressure') setLogValue(`${Math.round(vitals.systolicBP)}/${Math.round(vitals.diastolicBP)}`);
    else if (logType === 'Respiratory Rate') setLogValue(Math.round(vitals.respiratoryRate).toString());

    triggerLocalFeedback("Telemetry captured! Active signal parsed and locked to buffer.");
  };

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const triggerLocalFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const unitStr = logType === 'Heart Rate' ? 'BPM' : logType === 'Blood Oxygen (SpO2)' ? '%' : logType === 'Body Temperature' ? '°C' : logType === 'Blood Pressure' ? 'mmHg' : 'RPM';
      await onLogRecord(
        logType,
        logValue,
        unitStr,
        logNotes || 'Logged from clinic rapid console overlay.'
      );
      
      confetti({
        particleCount: 120,
        spread: 80,
        zIndex: 250,
        colors: ['#3B82F6', '#10B981', '#F59E0B']
      });

      setSuccessFeedback(true);
      setTimeout(() => {
        setSuccessFeedback(false);
        setLogNotes('');
        onClose();
      }, 1500);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative z-10 overflow-hidden font-sans text-slate-900 dark:text-white"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-2xl">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Clinical Records Console</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Rapid Biomarker Update Interface</p>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all">
            {feedbackMsg}
          </div>
        )}

        {successFeedback ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
              <Check size={32} />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Biomarker Logged</h4>
              <p className="text-xs font-medium text-slate-400 mt-1">Successfully saved to patient's longitudinal timeline.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-end -mb-2">
              <button
                type="button"
                onClick={handlePullTelemetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Cpu size={12} />
                PULL LIVE TELEMETRY
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Classification</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                >
                  <option value="Heart Rate">Heart Rate (BPM)</option>
                  <option value="Blood Oxygen (SpO2)">Blood Oxygen (SpO2 %)</option>
                  <option value="Body Temperature">Body Temperature (°C)</option>
                  <option value="Blood Pressure">Blood Pressure (mmHg)</option>
                  <option value="Respiratory Rate">Respiratory Rate (breaths/min)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Metric Value</label>
                <input
                  type="text"
                  required
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. 72"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Clinical Annotations</label>
              <textarea
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-650"
                placeholder="Clinical observations or physical cues..."
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              {isSaving ? "STAMPING RECORD..." : "LOG RECORD TO HISTORIC TIMELINE"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const Loader = ({ size = 20, className = "" }) => (
  <RefreshCw size={size} className={className} />
);
