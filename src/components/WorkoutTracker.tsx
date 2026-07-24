import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Clock, 
  Flame, 
  Dumbbell,
  Calendar,
  Zap,
  Target,
  Trophy,
  History,
  TrendingUp,
  AlertCircle,
  X,
  Smartphone,
  Play,
  Pause,
  Square,
  RefreshCw,
  Radio,
  Gauge,
  Footprints,
  Sliders,
  ShieldCheck,
  Check,
  Sparkles,
  Layers,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';

interface Workout {
  id: string;
  type: string;
  duration: number;
  calories: number;
  intensity: 'Low' | 'Moderate' | 'High';
  date: string;
  notes?: string;
}

export const WorkoutTracker: React.FC<{ user: any }> = ({ user }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State for manual logging
  const [type, setType] = useState('Running');
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // REAL-TIME MOTION SENSOR & PEDOMETER STATE
  // ==========================================
  const [isSensorActive, setIsSensorActive] = useState(false);
  const [isWorkoutSessionRunning, setIsWorkoutSessionRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sensorMode, setSensorMode] = useState<'Walking' | 'Running' | 'Cycling' | 'Squats' | 'Jumping Jacks'>('Walking');
  
  // Live Motion Metrics
  const [stepsCount, setStepsCount] = useState(0);
  const [sessionTimerSeconds, setSessionTimerSeconds] = useState(0);
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [calculatedDistanceMeters, setCalculatedDistanceMeters] = useState(0);
  const [currentCadenceBpm, setCurrentCadenceBpm] = useState(0);
  const [sensorPermissionState, setSensorPermissionState] = useState<'granted' | 'prompt' | 'unsupported' | 'simulated'>('prompt');
  
  // Motion Vector & Sensitivity
  const [lastAcceleration, setLastAcceleration] = useState({ x: 0, y: 0, z: 9.81, mag: 9.81 });
  const [sensitivityThreshold, setSensitivityThreshold] = useState(2.2); // m/s^2 above gravity baseline
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<'Walk' | 'Jog' | 'Sprint' | 'Squat'>('Walk');
  const [audioFeedback, setAudioFeedback] = useState(true);

  // Canvas for Motion Waveform
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionHistoryRef = useRef<number[]>([]);
  const lastStepTimestampRef = useRef<number>(0);
  const stepTimestampsBufferRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const simulationIntervalRef = useRef<any>(null);

  useEffect(() => {
    fetchWorkouts();
    checkSensorAvailability();

    return () => {
      stopMotionSensor();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const data = await api.workouts.list();
      setWorkouts(data);
    } catch (err: any) {
      console.error("Failed to fetch workouts:", err);
      setError("Failed to load activity logs.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if DeviceMotionEvent is supported on browser
  const checkSensorAvailability = () => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        setSensorPermissionState('prompt');
      } else {
        setSensorPermissionState('granted');
      }
    } else {
      setSensorPermissionState('unsupported');
      setIsSimulationMode(true);
    }
  };

  // Request iOS permission for accelerometer
  const requestMotionPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setSensorPermissionState('granted');
          startMotionSensor();
        } else {
          setSensorPermissionState('simulated');
          setIsSimulationMode(true);
          alert("Motion sensor permission denied. Switched to Interactive Motion Sensor Simulator mode.");
        }
      } catch (e) {
        console.error("Motion permission error:", e);
        setSensorPermissionState('simulated');
        setIsSimulationMode(true);
      }
    } else {
      setSensorPermissionState('granted');
      startMotionSensor();
    }
  };

  // Start real motion sensor event listener
  const startMotionSensor = () => {
    setIsSensorActive(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('devicemotion', handleDeviceMotion, true);
    }
  };

  const stopMotionSensor = () => {
    setIsSensorActive(false);
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', handleDeviceMotion, true);
    }
  };

  // Process Accelerometer Motion Data
  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    let x = 0, y = 0, z = 0;
    
    if (event.accelerationIncludingGravity) {
      x = event.accelerationIncludingGravity.x || 0;
      y = event.accelerationIncludingGravity.y || 0;
      z = event.accelerationIncludingGravity.z || 0;
    } else if (event.acceleration) {
      x = event.acceleration.x || 0;
      y = event.acceleration.y || 0;
      z = (event.acceleration.z || 0) + 9.81;
    }

    const mag = Math.sqrt(x * x + y * y + z * z);
    setLastAcceleration({ x, y, z, mag });

    // Record into motion buffer for waveform drawing
    motionHistoryRef.current.push(mag);
    if (motionHistoryRef.current.length > 80) {
      motionHistoryRef.current.shift();
    }
    drawMotionWaveform();

    // Peak detection algorithm for steps / reps
    processMotionPeak(mag);
  };

  // Peak detection logic
  const processMotionPeak = (mag: number) => {
    const gravityBaseline = 9.81;
    const threshold = gravityBaseline + sensitivityThreshold;
    const now = Date.now();

    // Check if peak exceeds sensitivity threshold and cooldown time (>320ms)
    if (mag > threshold && (now - lastStepTimestampRef.current) > 320) {
      lastStepTimestampRef.current = now;

      // Update steps count if workout session is running and not paused
      if (isWorkoutSessionRunning && !isPaused) {
        setStepsCount(prev => {
          const newSteps = prev + 1;
          
          // Calculate stride distance (Walking ~0.76m, Running ~1.05m, Jumping Jacks ~0.3m, Squats ~0.5m displacement)
          let stride = 0.76;
          if (sensorMode === 'Running') stride = 1.08;
          if (sensorMode === 'Cycling') stride = 1.85;
          if (sensorMode === 'Jumping Jacks') stride = 0.35;
          if (sensorMode === 'Squats') stride = 0.50;

          setCalculatedDistanceMeters(Math.round(newSteps * stride));

          // Calculate calories burned
          // ~0.04 kcal per step walking, 0.06 running, 0.08 squats/jumping jacks
          let kcalPerStep = 0.042;
          if (sensorMode === 'Running') kcalPerStep = 0.065;
          if (sensorMode === 'Squats' || sensorMode === 'Jumping Jacks') kcalPerStep = 0.085;
          if (sensorMode === 'Cycling') kcalPerStep = 0.055;

          setCalculatedCalories(Math.round(newSteps * kcalPerStep));

          // Vibration feedback on step if enabled
          if (audioFeedback && navigator.vibrate) {
            try { navigator.vibrate(30); } catch (e) {}
          }

          return newSteps;
        });

        // Calculate Cadence (steps / min)
        stepTimestampsBufferRef.current.push(now);
        // keep last 10 step timestamps
        if (stepTimestampsBufferRef.current.length > 10) {
          stepTimestampsBufferRef.current.shift();
        }
        if (stepTimestampsBufferRef.current.length >= 2) {
          const timeDiffSec = (now - stepTimestampsBufferRef.current[0]) / 1000;
          const count = stepTimestampsBufferRef.current.length - 1;
          const bpm = Math.round((count / timeDiffSec) * 60);
          setCurrentCadenceBpm(Math.min(240, bpm));
        }
      }
    }
  };

  // Motion Waveform Canvas Renderer
  const drawMotionWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline gravity line (9.81 m/s^2)
    const baseLineY = height / 2;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, baseLineY);
    ctx.lineTo(width, baseLineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Threshold indicator line
    const thresholdY = baseLineY - (sensitivityThreshold * 6);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(width, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Motion Waveform curve
    const history = motionHistoryRef.current;
    if (history.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = '#10b981'; // Emerald 500
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const stepX = width / 80;
    history.forEach((val, idx) => {
      // Scale val (around 9.81) to canvas Y
      const delta = val - 9.81;
      const y = baseLineY - (delta * 6);
      const x = idx * stepX;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Highlight recent peak
    const lastVal = history[history.length - 1];
    if (lastVal > (9.81 + sensitivityThreshold)) {
      const lastX = (history.length - 1) * stepX;
      const lastY = baseLineY - ((lastVal - 9.81) * 6);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Motion Simulator Loop for Desktop testing
  useEffect(() => {
    if (isSimulationMode && isWorkoutSessionRunning && !isPaused) {
      let intervalMs = 550; // Walk (~110 bpm)
      if (simulationSpeed === 'Jog') intervalMs = 400; // Jog (~150 bpm)
      if (simulationSpeed === 'Sprint') intervalMs = 300; // Sprint (~200 bpm)
      if (simulationSpeed === 'Squat') intervalMs = 1200; // Squat (~50 rpm)

      simulationIntervalRef.current = setInterval(() => {
        const peakMag = 9.81 + sensitivityThreshold + (Math.random() * 3 + 1);
        const x = (Math.random() - 0.5) * 4;
        const y = (Math.random() - 0.5) * 4;
        const z = peakMag;
        
        setLastAcceleration({ x, y, z, mag: peakMag });
        motionHistoryRef.current.push(peakMag);
        if (motionHistoryRef.current.length > 80) motionHistoryRef.current.shift();
        drawMotionWaveform();
        processMotionPeak(peakMag);
      }, intervalMs);
    } else {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    }

    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [isSimulationMode, isWorkoutSessionRunning, isPaused, simulationSpeed, sensitivityThreshold]);

  // Workout Timer Interval
  useEffect(() => {
    if (isWorkoutSessionRunning && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setSessionTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isWorkoutSessionRunning, isPaused]);

  // Start Live Motion Session
  const handleStartWorkoutSession = () => {
    setIsWorkoutSessionRunning(true);
    setIsPaused(false);
    setStepsCount(0);
    setSessionTimerSeconds(0);
    setCalculatedCalories(0);
    setCalculatedDistanceMeters(0);
    setCurrentCadenceBpm(0);
    stepTimestampsBufferRef.current = [];

    if (sensorPermissionState === 'prompt') {
      requestMotionPermission();
    } else {
      startMotionSensor();
    }
  };

  // Pause / Resume Session
  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Reset Session
  const handleResetSession = () => {
    setIsWorkoutSessionRunning(false);
    setIsPaused(false);
    setStepsCount(0);
    setSessionTimerSeconds(0);
    setCalculatedCalories(0);
    setCalculatedDistanceMeters(0);
    setCurrentCadenceBpm(0);
    stopMotionSensor();
  };

  // Save Workout Session to Database
  const handleSaveAndSyncWorkout = async () => {
    if (stepsCount === 0 && sessionTimerSeconds < 5) {
      alert("Please record some motion or steps before saving the session!");
      return;
    }

    try {
      setIsSubmitting(true);
      const sessionMinutes = Math.max(1, Math.round(sessionTimerSeconds / 60));
      let activityType: string = sensorMode;
      if (sensorMode === 'Walking') activityType = 'Walking Pedometer';

      let intensityLvl: 'Low' | 'Moderate' | 'High' = 'Moderate';
      if (currentCadenceBpm > 140 || sensorMode === 'Running') intensityLvl = 'High';
      if (currentCadenceBpm < 80) intensityLvl = 'Low';

      await api.workouts.create({
        type: `${activityType} (${stepsCount} ${sensorMode === 'Squats' ? 'reps' : 'steps'})`,
        duration: sessionMinutes,
        calories: Math.max(5, calculatedCalories),
        intensity: intensityLvl,
        date: new Date().toISOString(),
        notes: `Motion Sensor Recorded Session: ${stepsCount} ${sensorMode === 'Squats' ? 'reps' : 'steps'}, ${calculatedDistanceMeters}m distance, average cadence ${currentCadenceBpm} steps/min.`
      });

      alert(`Workout Session Saved! ${stepsCount} steps synchronized to your medical vault.`);
      handleResetSession();
      fetchWorkouts();
    } catch (err: any) {
      setError("Failed to synchronize motion session to health records.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual Form Submit
  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const guestCalories = duration * (intensity === 'High' ? 12 : intensity === 'Moderate' ? 8 : 5);
      
      await api.workouts.create({
        type,
        duration: Number(duration),
        calories: guestCalories,
        intensity,
        date: new Date().toISOString(),
        notes
      });
      
      setIsAdding(false);
      setType('Running');
      setDuration(30);
      setNotes('');
      fetchWorkouts();
    } catch (err: any) {
      setError("Activity transmission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this activity log?")) return;
    try {
      await api.workouts.delete(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      setError("Failed to delete activity.");
    }
  };

  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);

  // Format timer MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Radio size={12} className="animate-pulse text-emerald-400" />
              Motion Sensor & Pedometer Enabled
            </span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Footprints className="text-emerald-500" />
            VHT Motion & Workout Tracker
          </h2>
          <p className="text-slate-400 font-bold text-sm">Real-time device motion accelerometer tracking, step counter & metabolic log.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
            {isAdding ? "Close Form" : "Manual Log"}
          </button>

          <button 
            onClick={handleStartWorkoutSession}
            disabled={isWorkoutSessionRunning}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/30 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Play size={18} />
            <span>{isWorkoutSessionRunning ? 'Session Active' : 'Start Motion Tracker'}</span>
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 font-bold text-sm"
        >
          <AlertCircle size={20} />
          {error}
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* REAL-TIME MOTION SENSOR & LIVE PEDOMETER TRACKING CONSOLE */}
      {/* ============================================================== */}
      <div className="p-6 md:p-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
              isWorkoutSessionRunning && !isPaused
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Smartphone size={28} className={isWorkoutSessionRunning && !isPaused ? 'animate-bounce' : ''} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  Real-time Device Accelerometer
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  sensorPermissionState === 'granted' && isSensorActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isSimulationMode
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {sensorPermissionState === 'granted' && isSensorActive ? 'Hardware Live (100Hz)' : 'Motion Simulator Active'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                Detects physical body movement, stride frequency, and workout repetition counts via phone sensors.
              </p>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
            {(['Walking', 'Running', 'Cycling', 'Squats', 'Jumping Jacks'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSensorMode(mode)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  sensorMode === mode
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {mode === 'Walking' && '🚶 Walk'}
                {mode === 'Running' && '🏃 Run'}
                {mode === 'Cycling' && '🚴 Cycle'}
                {mode === 'Squats' && '🏋️ Squat'}
                {mode === 'Jumping Jacks' && '🧘 Jacks'}
              </button>
            ))}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Steps / Reps Big Display */}
          <div className="p-6 bg-slate-950/70 border border-slate-800/80 rounded-3xl space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">
                {sensorMode === 'Squats' || sensorMode === 'Jumping Jacks' ? 'Total Reps' : 'Step Count'}
              </span>
              <Footprints size={18} className="text-emerald-400" />
            </div>
            <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
              {stepsCount.toLocaleString()}
            </div>
            <p className="text-[10px] font-bold text-emerald-400/80 uppercase">
              {sensorMode === 'Squats' ? 'Squat Repetitions' : 'Physical Strides Recorded'}
            </p>
          </div>

          {/* Session Timer */}
          <div className="p-6 bg-slate-950/70 border border-slate-800/80 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Workout Duration</span>
              <Clock size={18} className="text-blue-400" />
            </div>
            <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
              {formatTimer(sessionTimerSeconds)}
            </div>
            <p className="text-[10px] font-bold text-blue-400/80 uppercase">
              {isPaused ? 'Session Paused' : isWorkoutSessionRunning ? 'Live Active Timer' : 'Ready To Start'}
            </p>
          </div>

          {/* Distance */}
          <div className="p-6 bg-slate-950/70 border border-slate-800/80 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Distance Covered</span>
              <Gauge size={18} className="text-purple-400" />
            </div>
            <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
              {calculatedDistanceMeters >= 1000 
                ? `${(calculatedDistanceMeters / 1000).toFixed(2)}` 
                : calculatedDistanceMeters}
              <span className="text-sm font-sans font-bold text-slate-400 ml-1">
                {calculatedDistanceMeters >= 1000 ? 'km' : 'm'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-purple-400/80 uppercase">
              Est. Stride Displacement
            </p>
          </div>

          {/* Calories Burned */}
          <div className="p-6 bg-slate-950/70 border border-slate-800/80 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Active Calories</span>
              <Flame size={18} className="text-amber-400" />
            </div>
            <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
              {calculatedCalories}
              <span className="text-sm font-sans font-bold text-slate-400 ml-1">kcal</span>
            </div>
            <p className="text-[10px] font-bold text-amber-400/80 uppercase">
              Cadence: {currentCadenceBpm} {sensorMode === 'Squats' ? 'rpm' : 'steps/min'}
            </p>
          </div>
        </div>

        {/* Live Motion Waveform & Accelerometer Visualizer */}
        <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase text-slate-300 tracking-wider">
                Live Acceleration Waveform ($a_x, a_y, a_z$)
              </span>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
              <span>$a_x$: <strong className="text-blue-400">{lastAcceleration.x.toFixed(1)}</strong></span>
              <span>$a_y$: <strong className="text-emerald-400">{lastAcceleration.y.toFixed(1)}</strong></span>
              <span>$a_z$: <strong className="text-amber-400">{lastAcceleration.z.toFixed(1)}</strong></span>
              <span>Mag: <strong className="text-rose-400">{lastAcceleration.mag.toFixed(1)} m/s²</strong></span>
            </div>
          </div>

          <div className="relative w-full h-32 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={128} 
              className="w-full h-full object-cover"
            />

            {!isWorkoutSessionRunning && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                <Footprints size={32} className="text-slate-600 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Motion Sensor Standing By • Click 'Start Motion Session' Below
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Session Action Controls & Settings */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {!isWorkoutSessionRunning ? (
              <button
                onClick={handleStartWorkoutSession}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play size={18} />
                <span>Start Motion Session</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleTogglePause}
                  className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
                    isPaused 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={handleSaveAndSyncWorkout}
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check size={18} />
                  <span>Save & Sync Session</span>
                </button>

                <button
                  onClick={handleResetSession}
                  className="px-5 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  <RotateCcw size={18} />
                </button>
              </>
            )}

            {sensorPermissionState === 'prompt' && (
              <button
                onClick={requestMotionPermission}
                className="px-4 py-3 bg-purple-600/20 border border-purple-500/40 text-purple-300 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Smartphone size={14} />
                <span>Grant Phone Motion Access</span>
              </button>
            )}
          </div>

          {/* Simulator & Audio Toggles */}
          <div className="flex items-center gap-4 bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setIsSimulationMode(!isSimulationMode)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isSimulationMode
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders size={12} />
              <span>Simulate Motion: {isSimulationMode ? 'ON' : 'OFF'}</span>
            </button>

            {isSimulationMode && (
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-bold uppercase rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="Walk">Walk Pace</option>
                <option value="Jog">Jog Pace</option>
                <option value="Sprint">Sprint Pace</option>
                <option value="Squat">Squat Pace</option>
              </select>
            )}

            <button
              onClick={() => setAudioFeedback(!audioFeedback)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                audioFeedback ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-600 hover:text-slate-400'
              }`}
              title="Step Vibration Feedback"
            >
              {audioFeedback ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <Clock size={24} />
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalMinutes}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Active Minutes</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl group hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
              <Flame size={24} />
            </div>
            <TrendingUp size={16} className="text-orange-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalCalories}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Calories Burned</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <History size={24} />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{workouts.length}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Sessions</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
              <Target size={24} />
            </div>
          </div>
          <div className="text-3xl font-black text-white">88%</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Goal Completion</div>
        </div>
      </div>

      {/* Manual Activity Add Modal / Form */}
      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddWorkout} className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Activity Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option>Running</option>
                    <option>Walking</option>
                    <option>Cycling</option>
                    <option>Swimming</option>
                    <option>Weightlifting</option>
                    <option>Yoga</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration (Minutes)</label>
                  <input 
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Intensity</label>
                  <div className="flex gap-2 p-1 bg-slate-900 border border-slate-700 rounded-xl">
                    {['Low', 'Moderate', 'High'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setIntensity(lvl as any)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                          intensity === lvl 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes (Clinical Context)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your session or any metabolic observations..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white min-h-[100px] focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                  Synchronize Activity
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Timeline */}
      <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <History size={20} className="text-slate-400" />
            Activity Timeline & Pedometer Logs
          </h3>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Last 30 Sessions
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing activity logs...</p>
            </div>
          ) : workouts.length === 0 ? (
            <div className="p-20 text-center">
              <Dumbbell size={48} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-bold mb-1">No activity data logged yet.</p>
              <p className="text-slate-500 text-sm">Start a motion sensor session above to track steps or log a workout manually.</p>
            </div>
          ) : (
            workouts.map((workout) => (
              <motion.div 
                key={workout.id}
                layout
                className="p-6 hover:bg-white/5 transition-colors group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    workout.type.includes('Walking') ? 'bg-emerald-500/10 text-emerald-500' :
                    workout.type.includes('Running') ? 'bg-amber-500/10 text-amber-500' :
                    workout.type.includes('Cycling') ? 'bg-blue-500/10 text-blue-500' :
                    workout.type.includes('Squat') ? 'bg-purple-500/10 text-purple-500' :
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    {workout.type.includes('Walking') ? <Footprints size={20} /> : <Dumbbell size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-black uppercase tracking-tight">{workout.type}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        workout.intensity === 'High' ? 'bg-rose-500/20 text-rose-500' :
                        workout.intensity === 'Moderate' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {workout.intensity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {workout.duration}m</span>
                      <span className="flex items-center gap-1"><Flame size={12} /> {workout.calories} kcal</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(workout.date).toLocaleDateString()}</span>
                    </div>
                    {workout.notes && (
                      <p className="text-xs text-slate-400 mt-2 italic font-medium">"{workout.notes}"</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(workout.id)}
                  className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
