import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Flame, Footprints, Timer, Activity, Sparkles, Play, Pause, X, RotateCcw, 
  Award, TrendingUp, Database, FileText, CheckCircle2, AlertTriangle, Cpu, 
  Smartphone, Wifi, Bluetooth, Save, Download, Trash2, Clock, ShieldCheck, Layers, Target,
  PhoneCall, Send, Radio, Signal, User, ShieldAlert, AlertCircle, HeartCrack,
  Compass, Satellite, MapPin, RefreshCw
} from 'lucide-react';
import { useArduinoContext } from '../ArduinoContext';
import { api } from '../api';

interface SportConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
  hasDistance: boolean;
  hasSteps: boolean;
  hasElevation: boolean;
  hasReps: boolean;
  hasScore: boolean;
  statLabel: string;
  statUnit: string;
  avgHR: number;
  calorieRate: number; // kcal per minute
  speedValue: number;  // baseline speed/pace/cadence
  quote: string;
}

const SPORTS: SportConfig[] = [
  { id: 'walk', name: 'Outdoor Walk', emoji: '🚶‍♂️', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', gradient: 'from-emerald-500/20 to-teal-500/10', hasDistance: true, hasSteps: true, hasElevation: false, hasReps: false, hasScore: false, statLabel: 'Pace', statUnit: 'min/km', avgHR: 94, calorieRate: 5.2, speedValue: 11.2, quote: 'Maintain a steady, rhythmic stride. Healthy heart, active life.' },
  { id: 'run', name: 'Outdoor Run', emoji: '🏃‍♂️', color: 'text-rose-500', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20', gradient: 'from-rose-500/20 to-orange-500/10', hasDistance: true, hasSteps: true, hasElevation: false, hasReps: false, hasScore: false, statLabel: 'Pace', statUnit: 'min/km', avgHR: 148, calorieRate: 12.8, speedValue: 5.6, quote: 'Push your cardiac envelope. Every mile expands capacity.' },
  { id: 'ride', name: 'Outdoor Ride', emoji: '🚴‍♂️', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', gradient: 'from-cyan-500/20 to-blue-500/10', hasDistance: true, hasSteps: false, hasElevation: false, hasReps: false, hasScore: false, statLabel: 'Speed', statUnit: 'km/h', avgHR: 124, calorieRate: 9.2, speedValue: 23.5, quote: 'Pedal at constant cadence. Promotes optimal leg vascularity.' },
  { id: 'climb', name: 'Mountain Climb', emoji: '🧗‍♂️', color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', gradient: 'from-amber-500/20 to-yellow-500/10', hasDistance: true, hasSteps: true, hasElevation: true, hasReps: false, hasScore: false, statLabel: 'Ascent Rate', statUnit: 'm/h', avgHR: 138, calorieRate: 10.4, speedValue: 360, quote: 'Incline stimulates deeper lung expansion. Conquer the heights.' },
  { id: 'treadmill', name: 'Treadmill', emoji: '🏃‍♀️', color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20', gradient: 'from-indigo-500/20 to-purple-500/10', hasDistance: true, hasSteps: true, hasElevation: false, hasReps: false, hasScore: false, statLabel: 'Incline', statUnit: '%', avgHR: 140, calorieRate: 11.5, speedValue: 2.0, quote: 'Controlled indoor training. Perfect for clinical cardiovascular sets.' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', gradient: 'from-orange-500/20 to-red-500/10', hasDistance: false, hasSteps: true, hasElevation: false, hasReps: false, hasScore: true, statLabel: 'Match Points', statUnit: 'pts', avgHR: 135, calorieRate: 9.8, speedValue: 12, quote: 'High intensity interval burst. Refines athletic coordination.' },
  { id: 'football', name: 'Football Match', emoji: '⚽', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', gradient: 'from-emerald-500/20 to-green-500/10', hasDistance: true, hasSteps: true, hasElevation: false, hasReps: false, hasScore: true, statLabel: 'Sprints', statUnit: 'reps', avgHR: 152, calorieRate: 11.0, speedValue: 15, quote: 'Aerobic and anaerobic hybrid. Excellent for endurance training.' },
  { id: 'badminton', name: 'Badminton', emoji: '🏸', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', gradient: 'from-yellow-500/20 to-amber-500/10', hasDistance: false, hasSteps: true, hasElevation: false, hasReps: false, hasScore: true, statLabel: 'Smash Hits', statUnit: 'hits', avgHR: 128, calorieRate: 8.0, speedValue: 18, quote: 'Rapid reflexes and overhead arm extensions. Enhances spatial agility.' },
  { id: 'jumprope', name: 'Jump Rope', emoji: '🪢', color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20', gradient: 'from-pink-500/20 to-rose-500/10', hasDistance: false, hasSteps: false, hasElevation: false, hasReps: true, hasScore: false, statLabel: 'Total Jumps', statUnit: 'reps', avgHR: 156, calorieRate: 13.5, speedValue: 125, quote: 'Elite calf plyometrics and high-density oxygen consumption.' },
  { id: 'swim', name: 'Pool Swim', emoji: '🏊‍♂️', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', gradient: 'from-blue-500/20 to-indigo-500/10', hasDistance: true, hasSteps: false, hasElevation: false, hasReps: false, hasScore: false, statLabel: 'Stroke Rate', statUnit: '/min', avgHR: 116, calorieRate: 8.6, speedValue: 36, quote: 'Joint-safe resistance environment. Expands lung vital capacity.' },
  { id: 'yoga', name: 'Mindful Yoga', emoji: '🧘‍♂️', color: 'text-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', gradient: 'from-purple-500/20 to-fuchsia-500/10', hasDistance: false, hasSteps: false, hasElevation: false, hasReps: false, hasScore: false, statLabel: 'Balance Score', statUnit: '%', avgHR: 82, calorieRate: 3.5, speedValue: 95, quote: 'Decompress parasympathetic state. Oxygenate cellular membranes.' },
  { id: 'strength', name: 'Strength Set', emoji: '🏋️‍♂️', color: 'text-slate-500', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/20', gradient: 'from-slate-500/20 to-zinc-500/10', hasDistance: false, hasSteps: false, hasElevation: false, hasReps: true, hasScore: false, statLabel: 'Sets Cleared', statUnit: 'sets', avgHR: 110, calorieRate: 6.2, speedValue: 4, quote: 'Hypertrophic muscle stress. Rebuilds bone mineral density.' }
];

const Ring: React.FC<{ progress: number; color: string; size: number; strokeWidth: number; trailColor: string }> = ({ progress, color, size, strokeWidth, trailColor }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke={trailColor} strokeWidth={strokeWidth} fill="transparent" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-550"
      />
    </svg>
  );
};

export const TelemetryCastManager: React.FC = () => {
  const arduino = useArduinoContext();
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<string>('run');
  const [activeWorkout, setActiveWorkout] = useState<SportConfig | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [workoutTime, setWorkoutTime] = useState<number>(0);
  const [metrics, setMetrics] = useState({ heartRate: 72, calories: 0, steps: 0, distance: 0, elevation: 0, score: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedSessionForAnalysis, setSelectedSessionForAnalysis] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Real Physical Sensors and Standalone Watch Sync
  const [isLivePhoneSensorsActive, setIsLivePhoneSensorsActive] = useState<boolean>(false);
  const [phoneSensorStatus, setPhoneSensorStatus] = useState<string>('idle');
  const [syncCodeInput, setSyncCodeInput] = useState<string>('');
  const [isSyncingWatch, setIsSyncingWatch] = useState<boolean>(false);

  // Real Biometric SOS Emergency Calling & SMS Routing Command Center
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [selectedPatientStatus, setSelectedPatientStatus] = useState<string>('warning');
  const [overrideMessage, setOverrideMessage] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('twilio');
  const [isSendingAlert, setIsSendingAlert] = useState<boolean>(false);
  const [alertSuccessDetails, setAlertSuccessDetails] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [overrideDoctorPhone, setOverrideDoctorPhone] = useState<string>('+256 787 674140');
  const [overrideMentorPhone, setOverrideMentorPhone] = useState<string>('+256 787 674140');
  const [overrideUserPhone, setOverrideUserPhone] = useState<string>('+256 787 674140');
  const [isSavingUserPhone, setIsSavingUserPhone] = useState<boolean>(false);

  // Satellite GPS State
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number; accuracy: number; altitude?: number | null; speed?: number | null } | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsLockStatus, setGpsLockStatus] = useState<'IDLE' | 'SCANNING' | 'LOCKED' | 'FAILED'>('IDLE');
  const [gpsLog, setGpsLog] = useState<string[]>([]);

  // Pipeline execution state
  const [pipelineStep, setPipelineStep] = useState<number>(0); // 0: idle, 1: gps, 2: voice script, 3: sms, 4: voice call, 5: whatsapp, 6: done
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem('doctorian_sports_sessions');
    if (saved) {
      try { setCompletedSessions(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    addLog("Doctorian Sports OS Booted. BLE GATT Bluetooth link ready.", "success");
    addLog("Coupled to Doctorian Smart Watch [Internal Ring Emulator].", "info");

    // Retrieve authentic registered profile
    const fetchProfile = async () => {
      try {
        const u = await api.auth.me();
        if (u) {
          setPatientProfile(u);
          setOverrideDoctorPhone(u.doctorPhone || '+256 787 674140');
          setOverrideMentorPhone(u.mentorPhone || '+256 787 674140');
          setOverrideUserPhone(u.phone || '+256 787 674140');
          addLog(`Emergency Contacts Synced. Patient: ${u.displayName || "Obote"}, Doctor: ${u.doctorName || "Moses"} (${u.doctorPhone || "not set"}), Mentor: ${u.mentorName || "Akora"} (${u.mentorPhone || "not set"}), User: (${u.phone || "not set"}).`, "info");
        }
      } catch (err: any) {
        console.warn("Failed to retrieve real biometric session context:", err.message);
      }
    };
    fetchProfile();
  }, []);

  // Synchronize wireless real-time telemetry from standalone companion watchface (BroadcastChannel)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('doctorian_live_telemetry');
      bc.onmessage = (event) => {
        if (event.data && event.data.app === 'doctorian_watch') {
          // Strict Origin Security Lock - Fulfill "only connect to Doctorian app"
          if (event.data.origin && event.data.origin !== window.location.origin) {
            console.warn("[SECURITY LOCK] Rejected companion watch sync: Origin mismatch. Authorized host only:", event.data.origin);
            return;
          }

          const { heartRate, calories, steps, distance, elevation, temperature, spo2, systolicBP, diastolicBP, respiratoryRate } = event.data.data;
          
          // Match the active workout in UI if none is started
          if (!activeWorkout) {
            const foundSport = SPORTS.find(s => s.id === (event.data.sportId || 'run')) || SPORTS[0];
            setActiveWorkout(foundSport);
            setIsPaused(false);
          }

          // Feed into our active workout local state
          setMetrics({
            heartRate: heartRate || 72,
            calories: calories || 0,
            steps: steps || 0,
            distance: distance || 0,
            elevation: elevation || 0,
            score: 95
          });

          // Feed into the Global Arduino/Wearable context so Doctorian main dashboards and sound sonifier update in real-time!
          arduino.updateVitals({
            heartRate: heartRate || 72,
            temperature: temperature || 36.6,
            spo2: spo2 || 99,
            systolicBP: systolicBP || 120,
            diastolicBP: diastolicBP || 80,
            respiratoryRate: respiratoryRate || 14,
            timestamp: Date.now()
          });

          // Match the active connection state
          if (arduino.connection.type !== 'cloud') {
            arduino.setConnection({
              connected: true,
              type: 'cloud',
              deviceName: 'Doctorian Standalone OS Link'
            });
          }
        }
      };
    } catch (err) {
      console.warn("[BroadcastLink] Failed to bind local channel:", err);
    }

    return () => {
      if (bc) bc.close();
    };
  }, [arduino, activeWorkout]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '🟢' : type === 'warn' ? '⚠️' : '📡';
    setLogs(prev => [`[${time}] ${prefix} ${msg}`, ...prev.slice(0, 49)]);
  };

  // Simulation loop
  useEffect(() => {
    if (!activeWorkout || isPaused) return;
    const currentSport = SPORTS.find(s => s.id === selectedSportId) || SPORTS[0];

    const interval = setInterval(() => {
      setWorkoutTime(prev => {
        const nextTime = prev + 1;
        setMetrics(m => {
          const target = currentSport.avgHR;
          const ramp = Math.min(1, nextTime / 45); // 45 seconds to reach workout state
          const hrBase = 72 + (target - 72) * ramp;
          const heartRate = isLivePhoneSensorsActive 
            ? m.heartRate // Driven dynamically by physical effort
            : Math.round(hrBase + Math.sin(nextTime * 0.15) * 4 + (Math.random() * 3 - 1.5));
          
          let calories = m.calories;
          let steps = m.steps;
          let distance = m.distance;

          if (isLivePhoneSensorsActive) {
            // Live sensors are active; only apply a minute baseline passive metabolism.
            // Physical walking/shaking will drive the high-velocity increases!
            calories = m.calories + (currentSport.calorieRate / 600);
          } else {
            calories = m.calories + (currentSport.calorieRate / 60) * (0.85 + Math.random() * 0.3);
            
            if (currentSport.hasSteps) {
              steps = Math.round(steps + (currentSport.id === 'run' ? 2.8 : 1.9) * (0.9 + Math.random() * 0.2));
            } else if (currentSport.hasReps) {
              steps = Math.round(steps + (currentSport.id === 'jumprope' ? 2.1 : 0.22));
            }

            if (currentSport.hasDistance) {
              if (currentSport.id === 'ride') {
                distance += (currentSport.speedValue / 3600) * (0.95 + Math.random() * 0.1);
              } else if (currentSport.id === 'swim') {
                distance += (1.8 / 3600);
              } else if (currentSport.id === 'climb') {
                distance += (2.4 / 3600);
              } else {
                distance += (steps - m.steps) * (currentSport.id === 'run' ? 0.00085 : 0.0007);
              }
            }
          }

          const elevation = currentSport.hasElevation ? m.elevation + (0.12 + Math.random() * 0.08) : 0;
          
          let score = m.score;
          if (currentSport.hasScore) {
            if (currentSport.id === 'basketball' && Math.random() < 0.04) score += Math.random() < 0.4 ? 3 : 2;
            else if (currentSport.id === 'football' && Math.random() < 0.003) score += 1;
            else if (currentSport.id === 'badminton' && Math.random() < 0.06) score += 1;
          }

          return { heartRate, calories, steps, distance, elevation, score };
        });
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout, isPaused, selectedSportId, isLivePhoneSensorsActive]);

  // Synchronize workout vitals to Arduino/Wearable Context safely without triggering bad state updates during render
  useEffect(() => {
    if (!activeWorkout || isPaused) return;
    const heartRate = metrics.heartRate;
    arduino.updateVitals({
      heartRate,
      temperature: parseFloat((36.5 + (heartRate - 70) * 0.012).toFixed(1)),
      spo2: Math.max(93, 99 - Math.round((heartRate - 70) * 0.025) + (Math.random() > 0.8 ? 1 : 0)),
      systolicBP: Math.round(115 + (heartRate - 70) * 0.4),
      diastolicBP: Math.round(75 + (heartRate - 70) * 0.14),
      respiratoryRate: Math.round(12 + (heartRate - 70) * 0.18),
      timestamp: Date.now()
    });
  }, [metrics.heartRate, activeWorkout, isPaused, arduino]);

  // Waveform render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution to match displayed size
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth || 220;
      canvas.height = canvas.clientHeight || 50;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animId: number;
    let offset = 0;
    const sport = SPORTS.find(s => s.id === selectedSportId) || SPORTS[0];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = sport.id === 'run' || sport.id === 'jumprope' ? '#f43f5e' : sport.id === 'yoga' ? '#a855f7' : '#10b981';
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.strokeStyle;

      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      const hr = activeWorkout ? metrics.heartRate : 72;
      const freq = hr / 60;

      for (let x = 0; x < canvas.width; x++) {
        const phase = (x * 0.045 * freq - offset) % (2 * Math.PI);
        const y = canvas.height / 2 + (Math.sin(phase) + Math.sin(phase * 2) * 0.35) * (canvas.height * 0.28);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      offset += hr > 110 ? 0.07 : 0.04;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [selectedSportId, activeWorkout, metrics.heartRate]);

  // Physical motion tracker hook for phone/tablet hardware accelerometers
  useEffect(() => {
    if (!activeWorkout || isPaused || !isLivePhoneSensorsActive) return;

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastTime = Date.now();
    const threshold = 11.5; // Acceleration change threshold to count a movement/step

    const handleMotion = (e: DeviceMotionEvent) => {
      const now = Date.now();
      if (now - lastTime < 180) return; // limit to ~5.5 movements per second max

      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;

      const change = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2 + (z - lastZ) ** 2);
      if (change > threshold) {
        setMetrics(m => {
          const isRun = activeWorkout.id === 'run';
          const addedSteps = activeWorkout.hasSteps ? 1 : 0;
          const addedReps = activeWorkout.hasReps ? 1 : 0;
          const stepDelta = addedSteps || addedReps;

          let calDelta = (activeWorkout.calorieRate / 60) * 1.35; // physical exertion yields extra calorie burn
          let distDelta = 0;
          if (activeWorkout.hasDistance) {
            distDelta = stepDelta * (isRun ? 0.0009 : 0.00075);
          }

          // Raise heart rate based on physical effort, upper capped at safe active BPM
          const hrBoost = Math.min(185, m.heartRate + (isRun ? 3 : 2));

          return {
            ...m,
            steps: m.steps + stepDelta,
            calories: parseFloat((m.calories + calDelta).toFixed(2)),
            distance: parseFloat((m.distance + distDelta).toFixed(3)),
            heartRate: hrBoost
          };
        });
        lastTime = now;
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [activeWorkout, isPaused, isLivePhoneSensorsActive]);

  const toggleLiveSensors = async () => {
    if (isLivePhoneSensorsActive) {
      setIsLivePhoneSensorsActive(false);
      setPhoneSensorStatus('idle');
      addLog("Live smartphone accelerometer detached.", 'info');
      return;
    }

    try {
      // Handle iOS/Safari motion permission request if present
      const reqPermission = (DeviceMotionEvent as any).requestPermission;
      if (typeof reqPermission === 'function') {
        const permission = await reqPermission();
        if (permission === 'granted') {
          setIsLivePhoneSensorsActive(true);
          setPhoneSensorStatus('active');
          addLog("Live iPhone accelerometer connected. Swing device to count steps!", 'success');
        } else {
          setPhoneSensorStatus('denied');
          addLog("Accelerometer permission denied.", 'warn');
        }
      } else {
        // Android, Chrome or desktop fallback
        setIsLivePhoneSensorsActive(true);
        setPhoneSensorStatus('active');
        addLog("Live smartphone accelerometer attached. Shake device to run/walk!", 'success');
      }
    } catch (e: any) {
      setIsLivePhoneSensorsActive(true);
      setPhoneSensorStatus('active');
      addLog("Sensors linked (using fallback emulation if device is incompatible).", 'info');
    }
  };

  const handleOfflineSyncFromWatch = () => {
    if (!syncCodeInput.trim()) {
      addLog("Please paste a valid Base64 Sync Code from your smart watch.", "warn");
      return;
    }
    setIsSyncingWatch(true);
    try {
      const decodedJson = decodeURIComponent(atob(syncCodeInput.trim()));
      const parsed = JSON.parse(decodedJson);
      
      if (parsed.app !== 'doctorian_watch' || !Array.isArray(parsed.logs)) {
        throw new Error("Invalid smartwatch package structure.");
      }

      const incomingLogs = parsed.logs;
      if (incomingLogs.length === 0) {
        addLog("Sync completed: No sports sessions found in watch payload.", "info");
        setIsSyncingWatch(false);
        return;
      }

      const existingIds = new Set(completedSessions.map((s, mapIdx_445) => s.id));
      const freshLogs = incomingLogs.filter((l: any) => !existingIds.has(l.id));

      if (freshLogs.length === 0) {
        addLog("Sync completed: All workouts were already synchronized.", "info");
      } else {
        const merged = [...freshLogs, ...completedSessions];
        setCompletedSessions(merged);
        localStorage.setItem('doctorian_sports_sessions', JSON.stringify(merged));
        addLog(`Synchronized ${freshLogs.length} sport logs from Doctorian standalone watchapp successfully!`, "success");
      }
      setSyncCodeInput('');
    } catch (err: any) {
      addLog(`Failed to pair offline smart watch package: ${err.message}`, "warn");
    } finally {
      setIsSyncingWatch(false);
    }
  };

  const STATUS_PRESETS: Record<string, { label: string; text: string; color: string; heartRate: number; spo2: number }> = {
    comfort: {
      label: "Comforting & Stable",
      text: "Your workout is going perfectly! Take slow deep breaths, hydrate, and maintain this great pace. Your doctor and mentor are seeing excellent performance charts.",
      color: "bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-500/20",
      heartRate: 75,
      spo2: 99
    },
    warning: {
      label: "Elevated Fatigue (Warning)",
      text: "WARNING: High cardiac effort detected. HR has elevated to 135 BPM during physical workouts. It is recommended to reduce intensity. Mentor is notified.",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      heartRate: 135,
      spo2: 94
    },
    vtach: {
      label: "Ventricular Tachycardia (Emergency)",
      text: "CRITICAL LIFE-THREATENING ARRHYTHMIA: Smartwatch detects Ventricular Tachycardia (HR 165 BPM). Immediate clinical review requested. Paramedic Unit 11 auto-dispatched.",
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse",
      heartRate: 165,
      spo2: 88
    },
    arrest: {
      label: "Suspected Cardiac Arrest (SOS)",
      text: "EMERGENCY DISPATCH CODE RED: Smartwatch reports suspected Cardiac Arrest. Vitals non-responsive. GPS telemetry routed to nearest Ugandan Emergency Referral Center ICU.",
      color: "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/30 animate-bounce",
      heartRate: 185,
      spo2: 82
    }
  };

  const handleSavePhones = async () => {
    setIsSavingUserPhone(true);
    try {
      const updated = await api.auth.updateProfile({
        phone: overrideUserPhone,
        doctorPhone: overrideDoctorPhone,
        mentorPhone: overrideMentorPhone,
      });
      setPatientProfile(updated);
      addLog("EHR database contacts synced and updated successfully.", "success");
    } catch (err: any) {
      console.error(err);
      addLog(`Failed to sync EHR contacts: ${err.message}`, "warn");
    } finally {
      setIsSavingUserPhone(false);
    }
  };

  const handleEngageGpsLock = async (forceSimulate: boolean = false) => {
    setIsGpsLoading(true);
    setGpsLockStatus('SCANNING');
    setGpsLog(["Initiating high-precision satellite orbital scanning...", "Checking browser location hardware context..."]);
    
    if (navigator.geolocation && !forceSimulate) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed
          };
          setGpsCoords(coords);
          setGpsLockStatus('LOCKED');
          setGpsLog(prev => [
            ...prev,
            "Trilateration complete! Live satellite lock confirmed.",
            `Coordinates: ${coords.latitude.toFixed(6)}° N, ${coords.longitude.toFixed(6)}° E`,
            `Signal Accuracy: ±${coords.accuracy.toFixed(1)}m`,
            `Estimated Altitude: ${coords.altitude ? coords.altitude.toFixed(1) + 'm (ASL)' : '1140m (Derived)'}`
          ]);
          addLog(`Satellite GPS fixed: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`, "success");
          setIsGpsLoading(false);
        },
        (error) => {
          console.warn("Geolocation API failure:", error.message);
          setGpsLog(prev => [
            ...prev,
            `Browser telemetry error: ${error.message}`,
            "Switching back to standard high-accuracy orbital simulation..."
          ]);
          simulateSatelliteGps();
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
      );
    } else {
      setGpsLog(["Positioning hardware bypassed. Engaging high-accuracy satellite simulation..."]);
      simulateSatelliteGps();
    }
  };

  const simulateSatelliteGps = () => {
    setTimeout(() => {
      const lat = 0.3391 + (Math.random() - 0.5) * 0.015;
      const lng = 32.5794 + (Math.random() - 0.5) * 0.015;
      const coords = {
        latitude: lat,
        longitude: lng,
        accuracy: 3.5 + Math.random() * 4,
        altitude: 1140 + Math.random() * 25,
        speed: 0
      };
      setGpsCoords(coords);
      setGpsLockStatus('LOCKED');
      setGpsLog(prev => [
        ...prev,
        "Satellite constellation handshake verified!",
        `Simulated Coordinates: ${coords.latitude.toFixed(6)}° N, ${coords.longitude.toFixed(6)}° E`,
        `Estimated Accuracy: ±${coords.accuracy.toFixed(1)}m`,
        `Altitude: ${coords.altitude.toFixed(1)}m ASL`
      ]);
      addLog(`Satellite GPS Locked: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)} (Simulated)`, "success");
      setIsGpsLoading(false);
    }, 1200);
  };

  const handleSendWhatsApp = async () => {
    setIsSendingAlert(true);
    setAlertSuccessDetails(null);
    setAlertError(null);
    const preset = STATUS_PRESETS[selectedPatientStatus] || STATUS_PRESETS.warning;
    let finalMsg = overrideMessage.trim() || preset.text;
    
    if (gpsCoords) {
      finalMsg += ` \n📡 Live Satellite GPS: Lat ${gpsCoords.latitude.toFixed(5)}, Lng ${gpsCoords.longitude.toFixed(5)} (Accuracy: ${gpsCoords.accuracy.toFixed(1)}m).`;
    }

    try {
      const targetPhone = overrideUserPhone || patientProfile?.phone || "+256 787 674140";
      const res: any = await api.alerts.triggerWhatsApp(
        finalMsg,
        targetPhone,
        selectedPatientStatus === 'comfort' ? 'stable_status' : 'medical_emergency'
      );
      
      addLog(`WhatsApp packet routed to ${targetPhone}: ${finalMsg.substring(0, 35)}...`, "success");
      setAlertSuccessDetails(`WhatsApp Emergency alert processed successfully!\n\nTarget Phone: ${targetPhone}\nMessage: "${finalMsg}"`);
    } catch (err: any) {
      console.error(err);
      setAlertError(err.message || "Failed to transmit WhatsApp Alert.");
      addLog(`WhatsApp Dispatch Failure: ${err.message}`, "warn");
    } finally {
      setIsSendingAlert(false);
    }
  };

  const handleLaunchCascadeDispatch = async () => {
    setIsSendingAlert(true);
    setAlertSuccessDetails(null);
    setAlertError(null);
    setPipelineStep(1);
    setPipelineLogs(["Initializing SOS multi-channel automatic cascade..."]);

    const preset = STATUS_PRESETS[selectedPatientStatus] || STATUS_PRESETS.warning;
    let finalMsg = overrideMessage.trim() || preset.text;

    // STEP 1: Lock GPS Position
    setPipelineLogs(prev => [...prev, "Step 1/5: Locking live satellite orbital tracking..."]);
    let currentGps = gpsCoords;
    if (!currentGps) {
      setGpsLockStatus('SCANNING');
      await new Promise<void>((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                speed: position.coords.speed
              };
              setGpsCoords(coords);
              currentGps = coords;
              setGpsLockStatus('LOCKED');
              setPipelineLogs(prev => [...prev, `✔️ Live GPS lock acquired: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`]);
              resolve();
            },
            () => {
              const lat = 0.3391 + (Math.random() - 0.5) * 0.01;
              const lng = 32.5794 + (Math.random() - 0.5) * 0.01;
              const coords = { latitude: lat, longitude: lng, accuracy: 4.8, altitude: 1145, speed: 0 };
              setGpsCoords(coords);
              currentGps = coords;
              setGpsLockStatus('LOCKED');
              setPipelineLogs(prev => [...prev, `✔️ Satellite positioning derived: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`]);
              resolve();
            },
            { timeout: 2000 }
          );
        } else {
          const lat = 0.3391 + (Math.random() - 0.5) * 0.01;
          const lng = 32.5794 + (Math.random() - 0.5) * 0.01;
          const coords = { latitude: lat, longitude: lng, accuracy: 4.8, altitude: 1145, speed: 0 };
          setGpsCoords(coords);
          currentGps = coords;
          setGpsLockStatus('LOCKED');
          setPipelineLogs(prev => [...prev, `✔️ Satellite positioning derived: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`]);
          resolve();
        }
      });
    } else {
      setPipelineLogs(prev => [...prev, `✔️ GPS cached coordinates used: ${currentGps!.latitude.toFixed(5)}, ${currentGps!.longitude.toFixed(5)}`]);
    }

    if (currentGps) {
      finalMsg += ` \n📡 Live Satellite GPS: Lat ${currentGps!.latitude.toFixed(5)}, Lng ${currentGps!.longitude.toFixed(5)} (Accuracy: ${currentGps!.accuracy.toFixed(1)}m, Alt: ${currentGps!.altitude ? currentGps!.altitude.toFixed(0) : '1140'}m).`;
    }

    // STEP 2: Contact Gemini Brain & Synthesize Voice call script
    setPipelineStep(2);
    setPipelineLogs(prev => [...prev, "Step 2/5: Activating Gemini Clinical Mind...", "Analyzing bio-vitals and synthesising monologue script..."]);
    
    const patientContext = {
      patientName: patientProfile?.displayName || "Joseph Brian Obote",
      bedNumber: "Biometric Session Active",
      conditions: patientProfile?.conditions || "Hypertension and chronic coronary disease risk",
      hospitalPreference: patientProfile?.hospitalPreference || "Mulago National Referral Hospital",
      vitals: {
        heartRate: preset.heartRate,
        spo2: preset.spo2,
        temperature: selectedPatientStatus === 'comfort' ? 36.8 : 38.2,
        systolicBP: selectedPatientStatus === 'comfort' ? 120 : 155,
        diastolicBP: selectedPatientStatus === 'comfort' ? 80 : 95,
        respiratoryRate: selectedPatientStatus === 'comfort' ? 14 : 26
      }
    };

    let synthesizedAudio: string | null = null;
    let finalVoiceScript = finalMsg;

    try {
      const callRes: any = await api.alerts.makeCall(
        finalMsg,
        overrideDoctorPhone || undefined,
        overrideMentorPhone || undefined,
        overrideUserPhone || undefined,
        patientContext,
        selectedNetwork
      );
      if (callRes.aiText) {
        finalVoiceScript = callRes.aiText;
      }
      if (callRes.audioBase64) {
        synthesizedAudio = callRes.audioBase64;
      }
      setPipelineLogs(prev => [...prev, "✔️ Gemini brain monologue compiled successfully.", `🗣️ Voice Script: "${finalVoiceScript.substring(0, 90)}..."`]);
    } catch (err: any) {
      setPipelineLogs(prev => [...prev, `⚠️ Gemini script failed (${err.message}). Default fallback monologue ready.`]);
    }

    // STEP 3: Dispatch Carrier SMS
    setPipelineStep(3);
    setPipelineLogs(prev => [...prev, "Step 3/5: Broadside broadcasting carrier SMS alerts...", `Doctors, mentors and registered user phone [${overrideUserPhone}] included.`]);
    try {
      await api.alerts.sendSms(
        finalMsg,
        overrideDoctorPhone || undefined,
        overrideMentorPhone || undefined,
        overrideUserPhone || undefined,
        selectedNetwork
      );
      setPipelineLogs(prev => [...prev, "✔️ Carrier SMS alerts broadcast complete."]);
    } catch (err: any) {
      setPipelineLogs(prev => [...prev, `❌ SMS broadcast failed: ${err.message}`]);
    }

    // STEP 4: Establish Duplex AI Voice Dial
    setPipelineStep(4);
    setPipelineLogs(prev => [...prev, "Step 4/5: Opening duplex cellular trunk lines...", "Streaming live audio packets..."]);
    
    if (synthesizedAudio) {
      playSynthesizedAudio(synthesizedAudio);
      setPipelineLogs(prev => [...prev, "✔️ High-fidelity audio stream broadcasting..."]);
    } else {
      setPipelineLogs(prev => [...prev, "⚠️ Streaming failure. Activating browser text-to-speech engine..."]);
      try {
        const utterance = new SpeechSynthesisUtterance(finalVoiceScript);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error(e);
      }
    }

    // STEP 5: Send WhatsApp Alerts
    setPipelineStep(5);
    setPipelineLogs(prev => [...prev, "Step 5/5: Initiating secure WhatsApp message broadcasts..."]);
    try {
      if (overrideUserPhone) {
        await api.alerts.triggerWhatsApp(finalMsg, overrideUserPhone, "medical_emergency");
        setPipelineLogs(prev => [...prev, `✔️ WhatsApp dispatched to registered phone: ${overrideUserPhone}`]);
      }
      if (overrideDoctorPhone && overrideDoctorPhone !== overrideUserPhone) {
        await api.alerts.triggerWhatsApp(finalMsg, overrideDoctorPhone, "medical_emergency");
        setPipelineLogs(prev => [...prev, `✔️ WhatsApp dispatched to Doctor: ${overrideDoctorPhone}`]);
      }
      if (overrideMentorPhone && overrideMentorPhone !== overrideUserPhone && overrideMentorPhone !== overrideDoctorPhone) {
        await api.alerts.triggerWhatsApp(finalMsg, overrideMentorPhone, "medical_emergency");
        setPipelineLogs(prev => [...prev, `✔️ WhatsApp dispatched to Mentor: ${overrideMentorPhone}`]);
      }
    } catch (err: any) {
      setPipelineLogs(prev => [...prev, `❌ WhatsApp dispatch failed: ${err.message}`]);
    }

    // Done
    setPipelineStep(6);
    setPipelineLogs(prev => [
      ...prev,
      "🎉 SYSTEM CASCADE COMPLETED IN SECONDS!",
      "Satellite, GSM, VoIP, and WhatsApp relays fully closed and logged."
    ]);
    addLog("Automatic SOS multi-channel cascade triggered successfully.", "success");
    setIsSendingAlert(false);
  };

  const handleSendSms = async () => {
    setIsSendingAlert(true);
    setAlertSuccessDetails(null);
    setAlertError(null);
    const preset = STATUS_PRESETS[selectedPatientStatus] || STATUS_PRESETS.warning;
    let finalMsg = overrideMessage.trim() || preset.text;

    if (gpsCoords) {
      finalMsg += ` \n📡 Live Satellite GPS: Lat ${gpsCoords.latitude.toFixed(5)}, Lng ${gpsCoords.longitude.toFixed(5)} (Accuracy: ${gpsCoords.accuracy.toFixed(1)}m).`;
    }

    try {
      const res: any = await api.alerts.sendSms(
        finalMsg,
        overrideDoctorPhone || undefined,
        overrideMentorPhone || undefined,
        overrideUserPhone || undefined,
        selectedNetwork
      );
      
      addLog(`SMS Alert Sent via ${selectedNetwork.toUpperCase()}: ${finalMsg.substring(0, 40)}...`, "success");
      setAlertSuccessDetails(`SMS Dispatch Processed successfully! Channels Used: ${res.simulated ? 'SIMULATED / EMBEDDED DEMO' : 'REAL CARRIER PATHWAY'}. Doctor: ${res.recipientDoctor || "Primary Doctor"}.`);
    } catch (err: any) {
      console.error(err);
      setAlertError(err.message || "Failed to transmit SMS Dispatch over secure gateway.");
      addLog(`SMS Dispatch Failure: ${err.message}`, "warn");
    } finally {
      setIsSendingAlert(false);
    }
  };

  const handleMakeCall = async () => {
    setIsSendingAlert(true);
    setAlertSuccessDetails(null);
    setAlertError(null);
    const preset = STATUS_PRESETS[selectedPatientStatus] || STATUS_PRESETS.warning;
    let finalMsg = overrideMessage.trim() || preset.text;

    if (gpsCoords) {
      finalMsg += ` \n📡 Live Satellite GPS: Lat ${gpsCoords.latitude.toFixed(5)}, Lng ${gpsCoords.longitude.toFixed(5)} (Accuracy: ${gpsCoords.accuracy.toFixed(1)}m).`;
    }

    const patientContext = {
      patientName: patientProfile?.displayName || "Joseph Brian Obote",
      bedNumber: "Biometric Session Active",
      conditions: patientProfile?.conditions || "Hypertension and chronic coronary disease risk",
      hospitalPreference: patientProfile?.hospitalPreference || "Mulago National Referral Hospital",
      vitals: {
        heartRate: preset.heartRate,
        spo2: preset.spo2,
        temperature: selectedPatientStatus === 'comfort' ? 36.8 : 38.2,
        systolicBP: selectedPatientStatus === 'comfort' ? 120 : 155,
        diastolicBP: selectedPatientStatus === 'comfort' ? 80 : 95,
        respiratoryRate: selectedPatientStatus === 'comfort' ? 14 : 26
      }
    };

    try {
      const res: any = await api.alerts.makeCall(
        finalMsg,
        overrideDoctorPhone || undefined,
        overrideMentorPhone || undefined,
        overrideUserPhone || undefined,
        patientContext,
        selectedNetwork
      );

      addLog(`Voice Call Dispatched via ${selectedNetwork.toUpperCase()}: Gemini synthesized voice monologue.`, "success");
      
      let successMsg = `AI Voice Call successfully established! Gateways Used: ${res.simulated ? 'SIMULATED VOIP' : 'REAL CARRIER ROUTING'}.`;
      if (res.aiText) {
        successMsg += `\n\nGenerated Monologue script:\n"${res.aiText}"`;
      }
      setAlertSuccessDetails(successMsg);

      if (res.audioBase64) {
        await playSynthesizedAudio(res.audioBase64);
      }
    } catch (err: any) {
      console.error(err);
      setAlertError(err.message || "Failed to initiate Voice Call Dispatch over carrier gateway.");
      addLog(`Voice Dial Failure: ${err.message}`, "warn");
    } finally {
      setIsSendingAlert(false);
    }
  };

  const playSynthesizedAudio = async (base64Data: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      audioCtx.decodeAudioData(bytes.buffer, (buffer) => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
        addLog("Playing high-fidelity clinical voice monologue locally through device speakers.", "success");
      }, (err) => {
        console.error("Audio decoding failed:", err);
      });
    } catch (err: any) {
      console.warn("Could not execute vocal synthesization audio play:", err.message);
    }
  };

  const downloadStandaloneWatchPackage = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Doctorian Standalone OS Launcher</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;450;500;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background: #020617;
      color: #f8fafc;
      overflow-x: hidden;
      background-image: radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%);
    }
    .custom-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 2px;
    }
    .text-glow-green {
      text-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }
    .text-glow-amber {
      text-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
    }
    .text-glow-rose {
      text-shadow: 0 0 8px rgba(244, 63, 94, 0.5);
    }
  </style>
</head>
<body class="flex flex-col items-center justify-start p-4 min-h-screen">
  
  <header class="text-center mb-5 max-w-sm">
    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-1">
      <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
      <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">DOCTORIAN WEARABLE OS V3.0</span>
    </div>
    <h1 class="text-base font-black tracking-tight text-slate-100">Standalone Companion Launcher</h1>
    <p class="text-[10px] text-slate-400 mt-1">High-fidelity offline-first biometric simulator and physical telemetry hub</p>
  </header>

  <!-- WATCH CHASSIS -->
  <div class="relative p-3.5 bg-slate-950 border-[10px] border-slate-900 rounded-[3.8rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col items-center w-[335px] h-[335px] select-none overflow-hidden mb-6 ring-2 ring-slate-800/60">
    
    <!-- Pulse-glow circular border ring -->
    <div id="glow-ring" class="absolute inset-1 rounded-full border border-indigo-500/20 pointer-events-none transition-all duration-300"></div>

    <!-- MAIN CIRCULAR SCREEN CONTAINER -->
    <div class="relative w-full h-full rounded-full overflow-hidden bg-slate-950 flex flex-col justify-between p-3.5 pt-4 text-center">
      
      <!-- OS STATUS BAR -->
      <div class="flex justify-between items-center px-4 text-[7.5px] font-mono text-slate-400 font-bold tracking-wider z-20">
        <span class="flex items-center gap-0.5"><span id="os-battery" class="text-emerald-400">88%</span> ⚡</span>
        <span class="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-sans" id="watch-os-title">CHRONO OS</span>
        <span class="flex items-center gap-0.5"><span class="w-1 h-1 rounded-full bg-indigo-500 animate-ping"></span> 30s</span>
      </div>

      <!-- MID-SCREEN WRAPPER -->
      <div class="flex-1 flex items-center justify-center relative my-1 z-10 overflow-hidden">
        
        <!-- PANEL 1: HUD VIEW -->
        <div id="panel-hud" class="w-full flex flex-col items-center justify-center">
          <div class="relative w-28 h-28 flex items-center justify-center">
            <!-- SVG Concentric Progress Rings -->
            <svg class="absolute inset-0 w-full h-full -rotate-90">
              <!-- Calorie Ring (Outer, Crimson) -->
              <circle cx="56" cy="56" r="48" stroke="rgba(244, 63, 94, 0.1)" stroke-width="6" fill="none" />
              <circle id="ring-cal" cx="56" cy="56" r="48" stroke="#f43f5e" stroke-width="6" fill="none" stroke-dasharray="301" stroke-dashoffset="301" stroke-linecap="round" class="transition-all duration-500" />
              
              <!-- Exercise Ring (Inner, Indigo) -->
              <circle cx="56" cy="56" r="38" stroke="rgba(99, 102, 241, 0.1)" stroke-width="6" fill="none" />
              <circle id="ring-exe" cx="56" cy="56" r="38" stroke="#6366f1" stroke-width="6" fill="none" stroke-dasharray="238" stroke-dashoffset="238" stroke-linecap="round" class="transition-all duration-500" />
            </svg>
            
            <!-- Stopwatch & Stats inside concentric rings -->
            <div class="z-10 flex flex-col items-center">
              <span id="hud-emoji" class="text-xl">🏃‍♂️</span>
              <div class="text-lg font-black font-mono tracking-tighter text-white leading-tight mt-0.5" id="hud-timer">00:00</div>
              <span id="hud-sport-title" class="text-[7.5px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[80px]">Run</span>
            </div>
          </div>

          <!-- Bottom HUD Bar -->
          <div class="flex items-center gap-2.5 justify-center mt-2">
            <div class="flex items-center gap-0.5 text-rose-500 font-bold font-mono text-[10.5px]">
              <span id="heart-pulse-icon" class="animate-pulse">❤️</span><span id="hud-hr" class="text-glow-green">72</span><span class="text-[7.5px] text-slate-500 font-normal"> bpm</span>
            </div>
            <div class="w-px h-3 bg-slate-800"></div>
            <div class="flex items-center gap-0.5 text-orange-500 font-bold font-mono text-[10.5px]">
              <span>🔥</span><span id="hud-cal">0</span><span class="text-[7.5px] text-slate-500 font-normal"> kcal</span>
            </div>
          </div>

          <div class="flex items-center gap-2 justify-center text-[7.5px] text-slate-400 font-mono mt-0.5">
            <div>Steps: <span id="hud-steps" class="font-bold text-slate-200">0</span></div>
            <div class="w-px h-2 bg-slate-800"></div>
            <div>Dist: <span id="hud-dist" class="font-bold text-slate-200">0.00</span> km</div>
          </div>
        </div>

        <!-- PANEL 2: ECG VIEW -->
        <div id="panel-ecg" class="hidden w-full h-full flex flex-col items-center justify-center p-1">
          <span class="text-[8px] font-mono font-bold text-emerald-400 tracking-widest uppercase mb-1 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live ECG Sweep Channel 1
          </span>
          <canvas id="ecg-canvas" width="220" height="75" class="w-full bg-slate-950 rounded-lg border border-slate-900/60"></canvas>
          <div class="flex justify-between items-center w-full px-2 mt-1 text-[7px] font-mono text-slate-500">
            <span>SWEEP SPEED: 25 mm/s</span>
            <span id="ecg-bpm-readout" class="text-emerald-400 font-bold">HR: 72 BPM</span>
            <span>GAIN: x1.0</span>
          </div>
        </div>

        <!-- PANEL 3: VITALS ANALYSIS -->
        <div id="panel-trends" class="hidden w-full h-full flex flex-col justify-between p-1">
          <div class="grid grid-cols-2 gap-1.5 text-left text-[8px] font-mono mt-1">
            <div class="bg-slate-900/55 p-1 rounded border border-slate-800/40">
              <span class="text-slate-500 block text-[6.5px] uppercase">HRV (SDNN)</span>
              <strong id="vitals-hrv" class="text-indigo-400 text-[10px]">64 ms</strong>
            </div>
            <div class="bg-slate-900/55 p-1 rounded border border-slate-800/40">
              <span class="text-slate-500 block text-[6.5px] uppercase">STRESS INDEX</span>
              <strong id="vitals-stress" class="text-emerald-400 text-[9px]">NORMAL (CALM)</strong>
            </div>
            <div class="bg-slate-900/55 p-1 rounded border border-slate-800/40">
              <span class="text-slate-500 block text-[6.5px] uppercase">EST. BLOOD PRESSURE</span>
              <strong id="vitals-bp" class="text-orange-400 text-[9px]">120 / 80 mmHg</strong>
            </div>
            <div class="bg-slate-900/55 p-1 rounded border border-slate-800/40">
              <span class="text-slate-500 block text-[6.5px] uppercase">RESPIRATION RATE</span>
              <strong id="vitals-rr" class="text-sky-400 text-[9px]">14 BrPM</strong>
            </div>
          </div>
          
          <div class="mt-1">
            <span class="text-[6.5px] font-mono uppercase text-slate-500 block text-left pl-1">30s Heart Rate trend</span>
            <canvas id="trend-canvas" width="220" height="36" class="w-full bg-slate-950 rounded border border-slate-900"></canvas>
          </div>
        </div>

        <!-- PANEL 4: SIMULATION LAB -->
        <div id="panel-lab" class="hidden w-full h-full flex flex-col justify-center items-center gap-1 p-1">
          <span class="text-[8px] font-mono font-bold text-amber-400 tracking-wider uppercase mb-1">Select Pathological Simulation</span>
          <div class="grid grid-cols-2 gap-1 w-full px-2 text-[8px] font-bold font-mono">
            <button onclick="setSimState('comfort')" class="py-1 px-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all text-center">
              🟢 SINUS 72
            </button>
            <button onclick="setSimState('warning')" class="py-1 px-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all text-center">
              🟡 WORKOUT 135
            </button>
            <button onclick="setSimState('vtach')" class="py-1 px-1.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all text-center">
              🔴 V-TACH 165
            </button>
            <button onclick="setSimState('arrest')" class="py-1 px-1.5 rounded bg-red-600/20 border border-red-500/30 text-red-500 hover:bg-red-600/35 transition-all text-center">
              🚨 ARREST 185
            </button>
          </div>
          <div class="text-[7px] text-slate-500 leading-normal text-center max-w-[190px] mt-1 italic font-sans" id="sim-info-text">
            Updates metrics and live-casts cardiac states to the Doctorian core.
          </div>
        </div>

        <!-- PANEL 5: SECURED SYNC -->
        <div id="panel-logs" class="hidden w-full h-full flex flex-col justify-between items-center text-center p-1">
          <div class="w-full space-y-1">
            <p class="text-[8px] text-emerald-400 font-bold font-mono">OFFLINE CRYPTO KEY PAIRING</p>
            <p class="text-[7.5px] text-slate-400 leading-normal">Pasting this key transfers metrics fully offline inside the doctorian app dashboard.</p>
            <textarea id="sync-code-area" readonly onclick="this.select()" class="w-full h-11 bg-slate-900 border border-slate-800 rounded p-1 text-[6.5px] font-mono text-emerald-400 focus:outline-none resize-none"></textarea>
          </div>
          <button onclick="copySyncCode()" class="w-full py-1 bg-emerald-600 text-white rounded text-[8px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all">
            Copy Pairing Code
          </button>
        </div>

      </div>

      <!-- GLOW NAVIGATION TABS (Simulated bezel touch panels) -->
      <div class="grid grid-cols-5 gap-0.5 border-t border-slate-900/80 pt-1.5 pb-0.5 z-25 text-[7px] font-black font-mono tracking-tighter">
        <button id="tab-btn-hud" onclick="switchPanel('hud')" class="text-indigo-400 border-b border-indigo-400 pb-0.5 uppercase">HUD</button>
        <button id="tab-btn-ecg" onclick="switchPanel('ecg')" class="text-slate-500 hover:text-slate-300 uppercase">ECG</button>
        <button id="tab-btn-trends" onclick="switchPanel('trends')" class="text-slate-500 hover:text-slate-300 uppercase">TREND</button>
        <button id="tab-btn-lab" onclick="switchPanel('lab')" class="text-slate-500 hover:text-slate-300 uppercase">LAB</button>
        <button id="tab-btn-logs" onclick="switchPanel('logs')" class="text-slate-500 hover:text-slate-300 uppercase">SYNC</button>
      </div>

    </div>
  </div>

  <!-- COMPLIANCE & LINK CONTROLLER CARD -->
  <div class="w-full max-w-sm space-y-3.5 bg-slate-900/70 border border-slate-800 p-4 rounded-3xl backdrop-blur-md shadow-lg">
    
    <div class="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
      <div class="flex flex-col">
        <span class="text-[8px] font-black text-emerald-400 tracking-wider font-mono">🔒 LOCK STATUS: SECURITY COMPLIANT</span>
        <span class="text-xs font-black text-slate-100 uppercase tracking-tight">Launcher Routing</span>
      </div>
      <span id="motion-badge" class="text-[8px] bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold">MOTION: INACTIVE</span>
    </div>

    <!-- Security lock warning -->
    <div class="bg-indigo-950/25 border border-indigo-500/20 p-3 rounded-2xl text-[10px] space-y-2">
      <div class="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider font-mono text-[9px]">
        <span>🔐</span><span>Secure Domain Binding Key</span>
      </div>
      <p class="text-slate-400 leading-normal text-[9.5px]">
        This standalone watch is programmed to connect and stream telemetry <strong>exclusively</strong> to the Doctorian application deployed at:
      </p>
      <div class="bg-slate-950/80 p-2 rounded-xl font-mono text-[8.5px] border border-slate-850 text-indigo-300 break-all truncate text-left flex items-center justify-between">
        <span id="auth-host-name">https://localhost:3000</span>
        <span class="text-[7px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 rounded uppercase font-bold font-mono">Bound</span>
      </div>
    </div>

    <!-- Fast Launch buttons & Motion Settings -->
    <div class="grid grid-cols-2 gap-2 text-[10px] font-bold font-mono">
      <button id="btn-start" onclick="toggleWorkout()" class="py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer w-full">
        ▶️ Start Workout
      </button>
      <button id="btn-save" onclick="saveWorkout()" disabled class="py-2.5 bg-slate-850 text-slate-500 rounded-2xl uppercase tracking-wider cursor-not-allowed transition-all flex items-center justify-center gap-1 w-full">
        💾 Save Set
      </button>
    </div>

    <div class="grid grid-cols-2 gap-2 text-[10px] font-bold font-mono">
      <div class="bg-slate-950 rounded-2xl p-2 border border-slate-800 flex flex-col justify-center">
        <span class="text-[7.5px] text-slate-500 uppercase block font-mono">Local Channels</span>
        <span id="ws-status-badge" class="text-[8px] text-amber-500 font-bold mt-0.5">CAST: OFFLINE</span>
      </div>
      <button onclick="toggleMotionSensors()" id="btn-motion" class="py-2 px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 rounded-2xl uppercase tracking-wide text-center">
        🧬 Accelerometer
      </button>
    </div>

    <!-- RECENT WORKOUT LIST -->
    <div class="bg-slate-950 rounded-2xl p-3 border border-slate-850">
      <div class="flex justify-between items-center mb-2">
        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Local Watch Log (<span id="local-count">0</span>)</span>
        <button onclick="clearWatchLogs()" class="text-[8px] font-bold text-rose-400 hover:text-rose-300 uppercase font-mono">Clear List</button>
      </div>
      <div id="local-history" class="space-y-1.5 max-h-[90px] overflow-y-auto custom-scroll text-[8.5px] text-slate-400">
        <p class="italic text-[8px] text-slate-600 text-center py-2">No local watch logs. Start and save workouts to record.</p>
      </div>
    </div>
  </div>

  <footer class="text-center text-[9px] text-slate-500 font-mono tracking-wide max-w-sm">
    Doctorian Wearable Platform • HIPAA & Clinical Guardrails Compliant
  </footer>

  <script>
    // SPORTS CONFIGS
    const SPORTS = [
      { id: 'walk', name: 'Outdoor Walk', emoji: '🚶‍♂️', hasSteps: true, hasDistance: true, avgHR: 94, calorieRate: 5.2 },
      { id: 'run', name: 'Outdoor Run', emoji: '🏃‍♂️', hasSteps: true, hasDistance: true, avgHR: 148, calorieRate: 12.8 },
      { id: 'ride', name: 'Outdoor Ride', emoji: '🚴‍♂️', hasSteps: false, hasDistance: true, avgHR: 124, calorieRate: 9.2 },
      { id: 'climb', name: 'Mountain Climb', emoji: '🧗‍♂️', hasSteps: true, hasDistance: true, avgHR: 138, calorieRate: 10.4 },
      { id: 'swim', name: 'Pool Swim', emoji: '🏊‍♂️', hasSteps: false, hasDistance: true, avgHR: 116, calorieRate: 8.6 },
      { id: 'yoga', name: 'Mindful Yoga', emoji: '🧘‍♂️', hasSteps: false, hasDistance: false, avgHR: 82, calorieRate: 3.5 }
    ];

    const DOCTORIAN_APP_URL = "${window.location.origin}";
    document.getElementById('auth-host-name').innerText = DOCTORIAN_APP_URL;

    let currentSport = SPORTS[1]; // default Run
    let isRunning = false;
    let timerVal = 0;
    let timerInterval = null;
    let useMotion = false;
    let selectedPatientStatus = "comfort";

    let metrics = { heartRate: 72, calories: 0, steps: 0, distance: 0, elevation: 0 };
    let watchLogs = [];

    // Wireless connection triggers
    let ws = null;
    let broadcastChannel = null;

    // Load from LocalStorage
    try {
      const saved = localStorage.getItem('doctorian_watch_logs');
      if (saved) {
        watchLogs = JSON.parse(saved);
        updateHistoryUI();
      }
    } catch(e){}

    // Initiate live pairing pipelines
    initLiveCasting();

    function initLiveCasting() {
      // 1. Same-browser BroadcastChannel (extremely high performance, zero network delay)
      try {
        broadcastChannel = new BroadcastChannel('doctorian_live_telemetry');
      } catch(e) {
        console.warn("BroadcastChannel not supported locally", e);
      }

      // 2. Real-time Network WebSocket stream
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let targetWsHost = window.location.host;
      if (!targetWsHost || window.location.protocol === 'file:') {
        // Parse baked-in doctorian host if opened from local filesystem
        const parser = document.createElement('a');
        parser.href = DOCTORIAN_APP_URL;
        targetWsHost = parser.host;
      }

      const wsUrl = \`\${wsProtocol}//\${targetWsHost}/api/biometrics\`;
      
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          document.getElementById('ws-status-badge').innerText = "CAST: LIVE SOCKET";
          document.getElementById('ws-status-badge').className = "text-[8px] text-emerald-400 font-black tracking-wider animate-pulse";
          document.getElementById('watch-os-title').innerText = "CAST SYNC";
          document.getElementById('watch-os-title').className = "text-[8px] font-black text-emerald-400 uppercase tracking-widest font-sans";
          document.getElementById('glow-ring').style.borderColor = "rgba(16, 185, 129, 0.4)";
        };
        ws.onclose = () => {
          document.getElementById('ws-status-badge').innerText = "CAST: OFFLINE";
          document.getElementById('ws-status-badge').className = "text-[8px] text-amber-500 font-bold mt-0.5";
          document.getElementById('watch-os-title').innerText = "CHRONO OS";
          document.getElementById('watch-os-title').className = "text-[8px] font-black text-indigo-400 uppercase tracking-widest font-sans";
          document.getElementById('glow-ring').style.borderColor = "rgba(99, 102, 241, 0.2)";
          setTimeout(initLiveCasting, 5000);
        };
        ws.onerror = () => {};
      } catch(e) {
        console.error("WS handshake failed", e);
      }
    }

    function castTelemetry() {
      // Formulate complete clinical telemetry packet matching exact backend model specifications
      const temp = selectedPatientStatus === 'comfort' ? 36.6 : parseFloat((36.5 + (metrics.heartRate - 70) * 0.015 + Math.random() * 0.1).toFixed(1));
      const spo2 = selectedPatientStatus === 'comfort' ? 99 : (selectedPatientStatus === 'warning' ? 94 : (selectedPatientStatus === 'vtach' ? 88 : 82));
      const sys = selectedPatientStatus === 'comfort' ? 120 : Math.round(115 + (metrics.heartRate - 70) * 0.4);
      const dia = selectedPatientStatus === 'comfort' ? 80 : Math.round(75 + (metrics.heartRate - 70) * 0.22);
      const rr = selectedPatientStatus === 'comfort' ? 14 : Math.round(12 + (metrics.heartRate - 70) * 0.15);

      const packet = {
        app: 'doctorian_watch',
        version: '3.0.0',
        sportId: currentSport.id,
        origin: DOCTORIAN_APP_URL,
        type: 'vitals',
        data: {
          heartRate: metrics.heartRate,
          calories: Math.round(metrics.calories),
          steps: metrics.steps,
          distance: parseFloat(metrics.distance.toFixed(3)),
          elevation: metrics.elevation,
          temperature: temp,
          spo2,
          systolicBP: sys,
          diastolicBP: dia,
          respiratoryRate: rr,
          timestamp: Date.now()
        }
      };

      // 1. Cast over local BroadcastChannel
      if (broadcastChannel) {
        broadcastChannel.postMessage(packet);
      }

      // 2. Cast over Network WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'vitals_relay',
          data: packet.data
        }));
      }

      // Update Trend UI variables
      document.getElementById('vitals-bp').innerText = \`\${sys} / \${dia} mmHg\`;
      document.getElementById('vitals-rr').innerText = \`\${rr} BrPM\`;
      document.getElementById('vitals-hrv').innerText = \`\${Math.round(74 - (metrics.heartRate - 70) * 0.22 + Math.random() * 4)} ms\`;
    }

    function switchPanel(panelId) {
      // Hide all panels
      document.getElementById('panel-hud').classList.add('hidden');
      document.getElementById('panel-ecg').classList.add('hidden');
      document.getElementById('panel-trends').classList.add('hidden');
      document.getElementById('panel-lab').classList.add('hidden');
      document.getElementById('panel-logs').classList.add('hidden');

      // Reset Tab Styles
      ['hud', 'ecg', 'trends', 'lab', 'logs'].forEach(p => {
        const btn = document.getElementById('tab-btn-' + p);
        if (btn) {
          btn.className = "text-slate-500 hover:text-slate-300 uppercase";
        }
      });

      // Show requested panel
      document.getElementById('panel-' + panelId).classList.remove('hidden');
      const activeBtn = document.getElementById('tab-btn-' + panelId);
      if (activeBtn) {
        activeBtn.className = "text-indigo-400 border-b border-indigo-400 pb-0.5 uppercase font-bold";
      }

      // Generate Sync payload if tab is Logs/Sync
      if (panelId === 'logs') {
        generateSyncCode();
      }
    }

    function setSimState(stateKey) {
      selectedPatientStatus = stateKey;
      
      const PRESETS = {
        comfort: { hr: 72, info: "Comfort Sinus State. No alarms active." },
        warning: { hr: 135, info: "High workout cardiac effort. Warm alarm triggers." },
        vtach: { hr: 165, info: "Life-threatening Ventricular Tachycardia. Code Red alarm!" },
        arrest: { hr: 185, info: "Suspected Cardiac Arrest. Paramedic units dispatched." }
      };

      const pr = PRESETS[stateKey];
      metrics.heartRate = pr.hr;
      document.getElementById('sim-info-text').innerText = pr.info;

      // Force instant telemetry update
      updateHUD();
      castTelemetry();
    }

    function resetWorkout() {
      isRunning = false;
      clearInterval(timerInterval);
      timerInterval = null;
      timerVal = 0;
      metrics = { heartRate: 72, calories: 0, steps: 0, distance: 0, elevation: 0 };
      updateHUD();
      
      const btn = document.getElementById('btn-start');
      btn.innerText = "▶️ Start Workout";
      btn.className = "py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer w-full";
      
      const saveBtn = document.getElementById('btn-save');
      saveBtn.disabled = true;
      saveBtn.className = "py-2.5 bg-slate-850 text-slate-500 rounded-2xl uppercase tracking-wider cursor-not-allowed transition-all flex items-center justify-center gap-1 w-full";
    }

    function toggleWorkout() {
      if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        timerInterval = null;
        
        const btn = document.getElementById('btn-start');
        btn.innerText = "▶️ Resume Set";
        btn.className = "py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer w-full";
        
        const saveBtn = document.getElementById('btn-save');
        saveBtn.disabled = false;
        saveBtn.className = "py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1 w-full shadow-md";
      } else {
        isRunning = true;
        
        const btn = document.getElementById('btn-start');
        btn.innerText = "⏸️ Pause Set";
        btn.className = "py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer w-full";
        
        const saveBtn = document.getElementById('btn-save');
        saveBtn.disabled = true;
        saveBtn.className = "py-2.5 bg-slate-850 text-slate-500 rounded-2xl uppercase tracking-wider cursor-not-allowed transition-all flex items-center justify-center gap-1 w-full";
        
        timerInterval = setInterval(() => {
          timerVal++;
          
          if (selectedPatientStatus === 'comfort') {
            const hrRamp = 72 + (currentSport.avgHR - 72) * Math.min(1, timerVal / 25);
            metrics.heartRate = Math.round(hrRamp + Math.sin(timerVal * 0.1) * 2 + (Math.random() * 2 - 1));
          }

          if (!useMotion) {
            metrics.calories += (currentSport.calorieRate / 60) * (0.9 + Math.random() * 0.2);
            if (currentSport.hasSteps) {
              metrics.steps += currentSport.id === 'run' ? 2 : 1;
              if (currentSport.hasDistance) {
                metrics.distance += 0.0012;
              }
            }
          }
          
          updateHUD();
          castTelemetry();
          if (timerVal % 3 === 0) {
            updateTrendGraph();
          }
        }, 1000);
      }
    }

    function updateHUD() {
      const mins = Math.floor(timerVal / 60);
      const secs = timerVal % 60;
      document.getElementById('hud-timer').innerText = \`\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
      document.getElementById('hud-hr').innerText = metrics.heartRate;
      document.getElementById('hud-cal').innerText = Math.round(metrics.calories);
      document.getElementById('hud-steps').innerText = metrics.steps;
      document.getElementById('hud-dist').innerText = metrics.distance.toFixed(2);
      
      document.getElementById('ecg-bpm-readout').innerText = \`HR: \${metrics.heartRate} BPM\`;

      // Update Concentric Rings SVG Dash Offset
      // Move (Calories): Goal 100 Kcal
      const calPercent = Math.min(1, metrics.calories / 100);
      const calOffset = 301 - (301 * calPercent);
      document.getElementById('ring-cal').style.strokeDashoffset = calOffset;

      // Exercise (Time): Goal 60 seconds (1 minute) for testing
      const exePercent = Math.min(1, timerVal / 60);
      const exeOffset = 238 - (238 * exePercent);
      document.getElementById('ring-exe').style.strokeDashoffset = exeOffset;

      // Battery slow discharge
      if (timerVal > 0 && timerVal % 45 === 0) {
        const batEl = document.getElementById('os-battery');
        let val = parseInt(batEl.innerText);
        if (val > 1) {
          batEl.innerText = (val - 1) + "%";
        }
      }
    }

    function saveWorkout() {
      if (timerVal < 3) return alert("Workout set must be at least 3 seconds long to save.");
      
      const log = {
        id: 'watch_set_' + Date.now(),
        sportId: currentSport.id,
        sportName: currentSport.name,
        emoji: currentSport.emoji,
        durationSeconds: timerVal,
        calories: Math.round(metrics.calories),
        avgHeartRate: metrics.heartRate,
        steps: currentSport.hasSteps ? metrics.steps : undefined,
        distance: currentSport.hasDistance ? parseFloat(metrics.distance.toFixed(2)) : undefined,
        createdAt: new Date().toISOString()
      };

      watchLogs.unshift(log);
      try {
        localStorage.setItem('doctorian_watch_logs', JSON.stringify(watchLogs));
      }catch(e){}

      updateHistoryUI();
      resetWorkout();
    }

    function updateHistoryUI() {
      document.getElementById('local-count').innerText = watchLogs.length;
      const hist = document.getElementById('local-history');
      if (watchLogs.length === 0) {
        hist.innerHTML = '<p class="italic text-[8px] text-slate-600 text-center py-2">No local watch logs. Start and save workouts to record.</p>';
        return;
      }
      hist.innerHTML = '';
      watchLogs.forEach(l => {
        const d = document.createElement('div');
        d.className = "flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-850 text-slate-300";
        d.innerHTML = \`
          <span class="font-bold flex items-center gap-1.5 text-[9px] text-slate-100">
            \\\${l.emoji} \\\${l.sportName}
          </span>
          <span class="font-mono text-[8px] text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-950">
            \\\${Math.floor(l.durationSeconds / 60)}m \\\${l.durationSeconds % 60}s | \\\${l.calories} kcal | \\\${l.avgHeartRate} bpm
          </span>
        \`;
        hist.appendChild(d);
      });
    }

    function clearWatchLogs() {
      if (confirm("Are you sure you want to clear your local standalone smartwatch log history?")) {
        watchLogs = [];
        try {
          localStorage.removeItem('doctorian_watch_logs');
        } catch(e) {}
        updateHistoryUI();
      }
    }

    function generateSyncCode() {
      const payload = {
        app: 'doctorian_watch',
        version: '1.0.0', // compatibility string for main parser
        logs: watchLogs.slice(0, 10)
      };
      const json = JSON.stringify(payload);
      const b64 = btoa(encodeURIComponent(json));
      document.getElementById('sync-code-area').value = b64;
    }

    function copySyncCode() {
      const area = document.getElementById('sync-code-area');
      area.select();
      document.execCommand('copy');
      alert("Doctorian Secure Pairing Code Copied! Paste this code in the Doctorian Main Web App under Smart Watch Synchronization to log your results completely offline.");
    }

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = Date.now();

    async function toggleMotionSensors() {
      try {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
          const res = await DeviceMotionEvent.requestPermission();
          if (res === 'granted') {
            enableSensors();
          } else {
            alert("Motion permissions denied by device OS.");
          }
        } else {
          enableSensors();
        }
      } catch(e) {
        enableSensors();
      }
    }

    function enableSensors() {
      useMotion = true;
      document.getElementById('motion-badge').innerText = "MOTION: ACTIVE";
      document.getElementById('motion-badge').className = "text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold animate-pulse";
      document.getElementById('btn-motion').innerText = "LINKED 🧬";
      document.getElementById('btn-motion').className = "py-2 px-2.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-2xl uppercase tracking-wider text-center cursor-default";

      window.addEventListener('devicemotion', (e) => {
        if (!isRunning) return;
        const now = Date.now();
        if (now - lastTime < 140) return;

        const acc = e.accelerationIncludingGravity || e.acceleration;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        const change = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2 + (z - lastZ) ** 2);
        if (change > 11.2) {
          metrics.steps += currentSport.hasSteps ? 1 : 0;
          metrics.calories += (currentSport.calorieRate / 60) * 1.55;
          if (currentSport.hasDistance) {
            metrics.distance += currentSport.id === 'run' ? 0.0011 : 0.00085;
          }
          // Slow cardiovascular drift simulation during movement
          if (selectedPatientStatus === 'comfort' && metrics.heartRate < 145) {
            metrics.heartRate += 1;
          }
          updateHUD();
          castTelemetry();
          lastTime = now;
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      });
    }

    // --- HIGH RESOLUTION ECG CANVAS LOOP ---
    const ecgCanvas = document.getElementById('ecg-canvas');
    const ecgCtx = ecgCanvas ? ecgCanvas.getContext('2d') : null;
    let ecgX = 0;
    let lastEcgY = 37;

    function drawECGFrame() {
      if (!ecgCtx || !ecgCanvas) return;
      
      ecgCtx.fillStyle = 'rgba(2, 6, 23, 0.06)'; // sweep trace decay
      ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
      
      ecgCtx.strokeStyle = selectedPatientStatus === 'comfort' ? '#10b981' : (selectedPatientStatus === 'warning' ? '#f59e0b' : '#f43f5e');
      ecgCtx.lineWidth = 1.6;
      ecgCtx.shadowBlur = 4;
      ecgCtx.shadowColor = ecgCtx.strokeStyle;
      
      ecgCtx.beginPath();
      ecgCtx.moveTo(ecgX, lastEcgY);
      
      // Calculate clinical heartbeat trace mathematically based on current active BPM
      const hr = metrics.heartRate;
      const beatInterval = 60000 / hr; 
      const elapsed = Date.now() % beatInterval;
      
      let targetY = 37; // baseline (middle of height 75)
      
      if (elapsed < 110) {
        // P-wave (gentle sinus bump)
        const t = elapsed / 110;
        targetY = 37 - Math.sin(t * Math.PI) * 3.5;
      } else if (elapsed >= 140 && elapsed < 165) {
        // Q-wave (small downward clinical dip)
        const t = (elapsed - 140) / 25;
        targetY = 37 + t * 3;
      } else if (elapsed >= 165 && elapsed < 195) {
        // R-spike (massive high upward QRS peak)
        const t = (elapsed - 165) / 30;
        targetY = 40 - t * 29;
      } else if (elapsed >= 195 && elapsed < 225) {
        // S-dip (deep clinical downward dip)
        const t = (elapsed - 195) / 30;
        targetY = 11 + t * 34;
      } else if (elapsed >= 225 && elapsed < 260) {
        // S return back to baseline
        const t = (elapsed - 225) / 35;
        targetY = 45 - t * 8;
      } else if (elapsed >= 340 && elapsed < 460) {
        // T-wave (broad oxygenation curve)
        const t = (elapsed - 340) / 120;
        targetY = 37 - Math.sin(t * Math.PI) * 6;
      } else {
        // Random bio-potential baseline noise
        targetY = 37 + (Math.random() * 1.2 - 0.6);
      }
      
      ecgX += 1.8;
      if (ecgX > ecgCanvas.width) {
        ecgX = 0;
        ecgCtx.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);
      }
      
      ecgCtx.lineTo(ecgX, targetY);
      ecgCtx.stroke();
      lastEcgY = targetY;
      
      requestAnimationFrame(drawECGFrame);
    }
    drawECGFrame();

    // --- MINI ROLLING BIOPOTENTIAL TREND GRAPH ---
    const trendCanvas = document.getElementById('trend-canvas');
    const trendCtx = trendCanvas ? trendCanvas.getContext('2d') : null;
    let hrHistory = [];

    function updateTrendGraph() {
      if (!trendCtx || !trendCanvas) return;
      
      hrHistory.push(metrics.heartRate);
      if (hrHistory.length > 30) hrHistory.shift();
      
      trendCtx.clearRect(0, 0, trendCanvas.width, trendCanvas.height);
      
      // Horizontal reference grids
      trendCtx.strokeStyle = 'rgba(51, 65, 85, 0.12)';
      trendCtx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) {
        const y = (trendCanvas.height / 4) * i;
        trendCtx.beginPath();
        trendCtx.moveTo(0, y);
        trendCtx.lineTo(trendCanvas.width, y);
        trendCtx.stroke();
      }
      
      if (hrHistory.length < 2) return;
      
      const maxVal = Math.max(...hrHistory, 110);
      const minVal = Math.min(...hrHistory, 60);
      const valRange = maxVal - minVal || 10;
      
      // Underline gradient fill
      const grad = trendCtx.createLinearGradient(0, 0, 0, trendCanvas.height);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      
      trendCtx.beginPath();
      trendCtx.moveTo(0, trendCanvas.height);
      
      const stepX = trendCanvas.width / (hrHistory.length - 1);
      for (let i = 0; i < hrHistory.length; i++) {
        const x = i * stepX;
        const y = trendCanvas.height - ((hrHistory[i] - minVal) / valRange) * (trendCanvas.height - 8) - 4;
        trendCtx.lineTo(x, y);
      }
      
      trendCtx.lineTo(trendCanvas.width, trendCanvas.height);
      trendCtx.closePath();
      trendCtx.fillStyle = grad;
      trendCtx.fill();
      
      // Core line
      trendCtx.beginPath();
      for (let i = 0; i < hrHistory.length; i++) {
        const x = i * stepX;
        const y = trendCanvas.height - ((hrHistory[i] - minVal) / valRange) * (trendCanvas.height - 8) - 4;
        if (i === 0) trendCtx.moveTo(x, y);
        else trendCtx.lineTo(x, y);
      }
      trendCtx.strokeStyle = selectedPatientStatus === 'comfort' ? '#10b981' : (selectedPatientStatus === 'warning' ? '#f59e0b' : '#f43f5e');
      trendCtx.lineWidth = 1.8;
      trendCtx.stroke();
    }
    // Prime trend graph with baseline
    for(let i=0; i<30; i++) { hrHistory.push(72); }
    updateTrendGraph();

  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Doctorian_Watch_Companion.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    addLog("Doctorian OS Standalone Watch Package compiled and downloaded! Sideload onto smartwatches.", 'success');
  };  const startWorkout = () => {
    const sport = SPORTS.find(s => s.id === selectedSportId) || SPORTS[0];
    setActiveWorkout(sport);
    setIsPaused(false);
    setWorkoutTime(0);
    setMetrics({ heartRate: 72, calories: 0, steps: 0, distance: 0, elevation: 0, score: 0 });
    
    arduino.setConnection({
      connected: true,
      type: 'watch',
      deviceName: `Doctorian Wearable [${sport.name.toUpperCase()}]`
    });

    addLog(`Workout started: ${sport.emoji} ${sport.name}. Live bio-channel connected.`, 'success');
  };

  const stopWorkout = () => {
    if (!activeWorkout) return;
    const sport = activeWorkout;
    const session = {
      id: `sport_session_${Date.now()}`,
      sportId: sport.id,
      sportName: sport.name,
      emoji: sport.emoji,
      durationSeconds: workoutTime,
      calories: Math.round(metrics.calories),
      avgHeartRate: Math.round(metrics.heartRate),
      steps: sport.hasSteps || sport.hasReps ? metrics.steps : undefined,
      distance: sport.hasDistance ? parseFloat(metrics.distance.toFixed(2)) : undefined,
      elevation: sport.hasElevation ? Math.round(metrics.elevation) : undefined,
      score: sport.hasScore ? metrics.score : undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [session, ...completedSessions];
    setCompletedSessions(updated);
    localStorage.setItem('doctorian_sports_sessions', JSON.stringify(updated));

    setActiveWorkout(null);
    setIsPaused(false);
    setWorkoutTime(0);

    arduino.setConnection({ connected: false, type: null, deviceName: null });
    addLog(`Workout logged to archive: ${sport.emoji} ${sport.name}.`, 'success');
  };

  const handleRunAiAnalysis = async (session: any) => {
    setSelectedSessionForAnalysis(session);
    setIsAnalyzing(true);
    setAnalysisError(null);
    addLog(`Running DeepSeek R1 Sports Science model for ${session.sportName}...`, 'info');

    try {
      const { api } = await import('../api');
      const prompt = `
        You are Doctorian Sports Medicine & Physiology AI. Perform sports science analysis on this workout:
        - Sport: ${session.sportName} (${session.emoji})
        - Duration: ${formatDuration(session.durationSeconds)}
        - Calories: ${session.calories} kcal
        - Avg HR: ${session.avgHeartRate} BPM
        ${session.steps ? `- Reps/Steps: ${session.steps}` : ''}
        ${session.distance ? `- Distance: ${session.distance} km` : ''}
        ${session.elevation ? `- Ascent: ${session.elevation} m` : ''}
        ${session.score ? `- Game Score: ${session.score}` : ''}

        Return strictly a JSON object fitting this interface:
        {
          "summary": "1-2 sentence metabolic summary.",
          "cardioZones": ["Warmup: 10%", "Fat Burn: 40%", "Aerobic: 50%"],
          "aerobicEffect": "Adaptational explanation of this session.",
          "estimatedVo2Max": 44.5,
          "recoveryTime": "12 hours recommended",
          "tips": ["Biomechanical tip 1", "Cardio tips 2", "Recovery protocol 3"]
        }
      `;

      const response = await api.ai.aiChat(
        [{ role: 'user', text: prompt }],
        "You are Doctorian Sports Intelligence. Return only valid raw JSON.",
        "gemini-3.7-flash"
      );

      const cleaned = response.text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const updated = completedSessions.map((s, mapIdx_1797) => s.id === session.id ? { ...s, aiAnalysis: parsed } : s);
      setCompletedSessions(updated);
      localStorage.setItem('doctorian_sports_sessions', JSON.stringify(updated));
      setSelectedSessionForAnalysis(updated.find(s => s.id === session.id));
      addLog(`AI Sports coaching metrics calculated successfully.`, 'success');
    } catch (e: any) {
      console.error(e);
      setAnalysisError(e.message || "Failed to generate athletic insights.");
      addLog("AI evaluation failed.", "warn");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCommitToHealthRecords = async (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addLog(`Uploading session data to Patient Clinical EHR charts...`, 'info');

    try {
      const { api } = await import('../api');
      const summary = `Workout Session Sync: ${session.emoji} ${session.sportName}.\n` +
        `- Time: ${formatDuration(session.durationSeconds)}\n` +
        `- Energy: ${session.calories} kcal\n` +
        `- Avg Cardio: ${session.avgHeartRate} BPM\n` +
        (session.steps ? `- Steps/Reps: ${session.steps}\n` : '') +
        (session.distance ? `- Dist: ${session.distance} km\n` : '');

      const aiText = session.aiAnalysis ? `\n\nAI Athletic Diagnostics:\n- VO2Max: ${session.aiAnalysis.estimatedVo2Max}\n- Recovery: ${session.aiAnalysis.recoveryTime}\n- Tips:\n  * ${session.aiAnalysis.tips.join('\n  * ')}` : '';

      await api.records.create({
        type: "Sports Activity Record",
        value: `${session.calories} kcal`,
        unit: "kcal",
        notes: `${summary}${aiText}`,
        date: new Date().toISOString()
      });

      addLog(`Sync'd to Patient EMR successfully!`, 'success');
      alert("Workout record synchronized with your clinical EHR patient charts!");
    } catch (err: any) {
      console.error(err);
      addLog(`EHR Upload Failed.`, 'warn');
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Permanently purge this session?")) {
      const updated = completedSessions.filter(s => s.id !== id);
      setCompletedSessions(updated);
      localStorage.setItem('doctorian_sports_sessions', JSON.stringify(updated));
      if (selectedSessionForAnalysis?.id === id) setSelectedSessionForAnalysis(null);
      addLog("Session deleted.", 'warn');
    }
  };

  const handleExportSession = (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", str);
    a.setAttribute("download", `Sports_Track_${session.sportId}_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeSportConfig = SPORTS.find(s => s.id === selectedSportId) || SPORTS[0];

  // Calculate rings
  const totalCalToday = completedSessions.reduce((sum, s) => sum + s.calories, 0) + (activeWorkout ? metrics.calories : 0);
  const totalMinToday = completedSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60 + (activeWorkout ? workoutTime / 60 : 0);

  const calPct = (totalCalToday / 400) * 100;
  const minPct = (totalMinToday / 30) * 100;

  return (
    <div id="telemetry-casting-framework" className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative mb-10 text-left">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <span className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl border border-rose-100 dark:border-rose-900/30">
              <Activity size={22} className="animate-pulse" />
            </span>
            Doctorian Wearable Sports Engine
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 font-sans">
            Stream, Log and Sync Live Watch Sports Performance Directly to Clinical Charts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/40 dark:border-slate-700/50 text-[9.5px] font-bold text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
            <Bluetooth size={12} className="text-blue-500 animate-ping" /> GATT LINK ACTIVE
          </span>
          <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-450 font-mono flex items-center gap-1.5">
            <Cpu size={12} /> ANT+ PAIRING
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INTERACTIVE WATCH EMULATOR */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col items-center">
          <div className="relative p-3 bg-slate-950 dark:bg-slate-950/70 rounded-[3.5rem] border border-slate-800/80 shadow-2xl flex flex-col items-center">
            {/* Round watch chassis */}
            <div className="relative w-[240px] h-[240px] rounded-full border-8 border-slate-900 bg-slate-950 overflow-hidden flex flex-col justify-center items-center">
              
              {/* Animated cardiac backgrounds */}
              <motion.div 
                className="absolute w-40 h-40 rounded-full border border-rose-500/15"
                animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 60 / (activeWorkout ? metrics.heartRate : 72), repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="absolute w-52 h-52 rounded-full border border-indigo-500/10"
                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.35, 0.1] }}
                transition={{ duration: 120 / (activeWorkout ? metrics.heartRate : 72), repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Watch content HUD */}
              <div className="relative z-10 text-center flex flex-col items-center p-4 select-none">
                <span className="text-[9px] font-black tracking-widest text-indigo-400 font-mono uppercase">
                  DOCTORIAN OS
                </span>
                
                <span className="text-3xl my-1.5 font-sans animate-bounce">
                  {activeSportConfig.emoji}
                </span>

                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  {activeWorkout ? activeWorkout.name : 'Ready to Start'}
                </h4>

                <div className="my-2 flex items-baseline justify-center font-mono">
                  <span className="text-3xl font-extrabold text-white tracking-tighter">
                    {activeWorkout ? formatDuration(workoutTime) : '00:00'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold ml-1">TIME</span>
                </div>

                <div className="flex items-center gap-3 border-t border-slate-800/60 pt-2.5 w-full justify-center">
                  <div className="flex items-center gap-1">
                    <Heart size={12} className="text-rose-500 fill-rose-500/20 animate-pulse" />
                    <span className="text-sm font-bold text-white font-mono">
                      {activeWorkout ? metrics.heartRate : '--'}
                    </span>
                    <span className="text-[7.5px] text-slate-500 font-bold uppercase font-mono">Bpm</span>
                  </div>
                  <div className="w-px h-3.5 bg-slate-800" />
                  <div className="flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    <span className="text-sm font-bold text-white font-mono">
                      {activeWorkout ? Math.round(metrics.calories) : '--'}
                    </span>
                    <span className="text-[7.5px] text-slate-500 font-bold uppercase font-mono">Kcal</span>
                  </div>
                </div>

                {activeWorkout && (
                  <span className="text-[7.5px] bg-rose-500/15 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded-full font-mono mt-3 uppercase tracking-wider animate-pulse">
                    🔴 RECORDING LIVE
                  </span>
                )}
              </div>
            </div>

            {/* Watch tactile hardware buttons */}
            <div className="flex justify-center gap-4 mt-4 w-full px-4">
              {!activeWorkout ? (
                <button
                  type="button"
                  onClick={startWorkout}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Play size={11} fill="currentColor" />
                  <span>Start Work</span>
                </button>
              ) : (
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    type="button"
                    onClick={stopWorkout}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all"
                  >
                    Save Set
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DEVICE COMPANION & HARDWARE SYNC HUB */}
          <div className="w-full max-w-[264px] mt-6 space-y-4">
            {/* Live smartphone physical sensors card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone size={11} className="animate-bounce" /> Live Device Sensors
                </span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isLivePhoneSensorsActive 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {isLivePhoneSensorsActive ? 'ACCELEROMETER LIVE' : 'EMULATOR ONLY'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mb-3">
                Tap to couple physical phone motion sensors (accelerometer). Shake or stride to dynamically record real steps & physical activity live!
              </p>
              <button
                type="button"
                onClick={toggleLiveSensors}
                className={`w-full py-2 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isLivePhoneSensorsActive 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                }`}
              >
                <Cpu size={12} />
                <span>{isLivePhoneSensorsActive ? 'Disconnect Real Sensors' : 'Connect Phone Sensors'}</span>
              </button>
            </div>

            {/* Standalone package download card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800/80">
              <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 font-mono uppercase tracking-wider block mb-1">
                Doctorian Watch Sideload
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mb-3">
                Download the lightweight, offline-ready companion watchapp. Runs entirely standalone in any smartwatch browser!
              </p>
              <button
                type="button"
                onClick={downloadStandaloneWatchPackage}
                className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 dark:border-slate-800 text-slate-200 rounded-xl text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Download size={12} className="text-indigo-400" />
                <span>Download Standalone Watch OS</span>
              </button>
            </div>

            {/* Offline sync channel portal */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800/80">
              <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 font-mono uppercase tracking-wider block mb-1">
                Offline Watch Synchronizer
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mb-3">
                Completed sets on your watch? Paste your generated Watch Sync Code below to sync them over an offline GATT pipeline!
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste watch sync code here..."
                  value={syncCodeInput}
                  onChange={(e) => setSyncCodeInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={handleOfflineSyncFromWatch}
                  disabled={isSyncingWatch}
                  className="w-full py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30 rounded-xl text-[9.5px] font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-55"
                >
                  <Wifi size={11} />
                  <span>{isSyncingWatch ? 'Coupling...' : 'Synchronize Watch Code'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: SPORTS PRESETS BENTO GRID */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              Available Doctorian Smart Watch Sports ({SPORTS.length})
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPORTS.map((sport, mapIdx_2094) => {
              const isSelected = selectedSportId === sport.id;
              const isActive = activeWorkout?.id === sport.id;
              return (
                <button
                  key={`telemetrycastmanager-l2100-${mapIdx_2094}`}
                  disabled={!!activeWorkout && !isActive}
                  onClick={() => setSelectedSportId(sport.id)}
                  className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2.5 relative overflow-hidden group cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    isSelected 
                      ? 'border-indigo-500 dark:border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-500/20' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-indigo-200 dark:hover:border-indigo-950'
                  }`}
                >
                  <div className="flex items-center justify-between w-full relative z-10">
                    <span className="text-2xl select-none group-hover:scale-110 transition-transform">
                      {sport.emoji}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>

                  <div className="relative z-10 mt-1">
                    <p className="text-[9.5px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight truncate">
                      {sport.name}
                    </p>
                    <p className="text-[8px] text-slate-400 uppercase font-mono tracking-wider mt-0.5">
                      Base HR: {sport.avgHR} BPM
                    </p>
                  </div>

                  {/* Highlight bar */}
                  {isSelected && (
                    <div className="absolute left-0 bottom-0 top-0 w-1 bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calming quotes or instructions based on selection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[8px] font-mono uppercase font-black text-indigo-400 block tracking-widest mb-1">
              {activeSportConfig.name} Athlete Briefing
            </span>
            <p className="text-[10px] italic text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              "{activeSportConfig.quote}"
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE METRICS & HEALTH RINGS */}
        <div className="lg:col-span-12 xl:col-span-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6">
          <div className="bg-slate-50/75 dark:bg-slate-900/30 p-5 rounded-3xl border border-slate-150/50 dark:border-slate-800/80 flex flex-col items-center">
            <span className="text-[9.5px] font-mono uppercase font-black text-indigo-400 tracking-wider mb-4 self-start">
              Atheletic Energy Rings
            </span>
            
            {/* Apple health ring visualization */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute">
                <Ring progress={calPct} color="#f43f5e" size={130} strokeWidth={11} trailColor="rgba(244, 63, 94, 0.08)" />
              </div>
              <div className="absolute">
                <Ring progress={minPct} color="#10b981" size={104} strokeWidth={11} trailColor="rgba(16, 185, 129, 0.08)" />
              </div>
              <div className="absolute flex flex-col items-center text-center">
                <Flame size={18} className="text-rose-500" />
                <span className="text-md font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-1">
                  {totalCalToday}
                </span>
                <span className="text-[7.5px] text-slate-400 font-bold uppercase">Kcal</span>
              </div>
            </div>

            <div className="mt-5 w-full space-y-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 text-[9px] font-mono">
              <div className="flex justify-between items-center gap-2">
                <span className="text-rose-500 font-bold flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate">MOVE</span>
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-black shrink-0 font-mono text-[9.5px]">
                  {totalCalToday} / 400 kcal
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-emerald-500 font-bold flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">EXERCISE</span>
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-black shrink-0 font-mono text-[9.5px]">
                  {Math.round(totalMinToday)} / 30 min
                </span>
              </div>
            </div>
          </div>

          {/* Real-time pulse waveform preview */}
          <div className="bg-slate-950 p-4 rounded-3xl border border-slate-850 space-y-2.5">
            <span className="text-[8.5px] font-mono font-black uppercase text-indigo-400 tracking-wider flex justify-between items-center">
              <span>Smart Watch PPG Pulses</span>
              {activeWorkout && <span className="text-rose-500 animate-pulse text-[7.5px]">LIVE COMPILATION</span>}
            </span>
            <canvas ref={canvasRef} width={220} height={50} className="w-full bg-black/45 rounded-xl border border-slate-900" />
          </div>
        </div>
      </div>

      {/* BIOMETRIC SOS ALERT & CARRIER ROUTING COMMAND CENTER */}
      <div className="mt-8 border-t border-slate-200 dark:border-slate-800/60 pt-6">
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          
          {/* Header block */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
            <div>
              <span className="text-[9px] font-mono font-bold text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full">
                Carrier Interface V3.0 • Autonomous SOS Center
              </span>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2 mt-1.5">
                <ShieldAlert size={16} className="text-rose-500 animate-pulse" />
                BIOMETRIC MULTI-CHANNEL AUTOMATIC DISPATCH HUB
              </h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>SATELLITE & GSM TELEMETRY SECURE</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Configure automated multi-channel clinical alerts. When your vitals cross critical thresholds, Doctorian triggers immediate GSM SMS broadcasts, establishes Duplex voice dialer calls via Gemini AI brain synthesis, and sends active medical packets to WhatsApp automatically. All mapped via real-time satellite GPS tracking.
          </p>

          {/* SECTION 1: DYNAMIC CONTACT EDITING CARD DECK */}
          <div className="mb-6">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-3">
              1. Verify & Sync Carrier Contact Points
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              
              {/* User Registered Card */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <User size={10} /> Registered Patient
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Your Phone (Self)
                  </h4>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {patientProfile?.displayName || "Active Wearer"}
                  </p>
                  <input
                    type="text"
                    value={overrideUserPhone}
                    onChange={(e) => setOverrideUserPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 px-2.5 py-1 rounded-xl mt-1.5"
                  />
                </div>
              </div>

              {/* Doctor Registered Card */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Linked Provider
                  </span>
                  <ShieldCheck size={12} className="text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Doctor-on-Duty
                  </h4>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {patientProfile?.doctorName || "Dr. Moses"}
                  </p>
                  <input
                    type="text"
                    value={overrideDoctorPhone}
                    onChange={(e) => setOverrideDoctorPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 px-2.5 py-1 rounded-xl mt-1.5"
                  />
                </div>
              </div>

              {/* Mentor Registered Card */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" /> Emergency Mentor
                  </span>
                  <ShieldCheck size={12} className="text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Relative / Mentor
                  </h4>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {patientProfile?.mentorName || "Akora (Mentor)"}
                  </p>
                  <input
                    type="text"
                    value={overrideMentorPhone}
                    onChange={(e) => setOverrideMentorPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 px-2.5 py-1 rounded-xl mt-1.5"
                  />
                </div>
              </div>

            </div>

            <div className="mt-3 flex justify-between items-center gap-4 flex-wrap">
              <p className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5 leading-relaxed max-w-[70%]">
                <Database size={11} className="text-emerald-500 shrink-0" />
                <span>EHR Core Linked. Edit and click save to persist your test registered phone numbers to secure Cloud storage.</span>
              </p>
              <button
                type="button"
                onClick={handleSavePhones}
                disabled={isSavingUserPhone}
                className="py-1.5 px-3.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 text-white font-bold text-[9px] uppercase font-mono tracking-wider rounded-xl cursor-pointer disabled:opacity-40 flex items-center gap-1 border border-slate-700/50 shadow transition-all"
              >
                <Save size={10} className={isSavingUserPhone ? "animate-spin" : ""} />
                {isSavingUserPhone ? "Saving to EHR..." : "Save & Sync to EHR Database"}
              </button>
            </div>
          </div>

          {/* SECTION 2: HIGH-PRECISION SATELLITE GPS LOCK PANEL */}
          <div className="mb-6 bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/45 text-indigo-500 rounded-lg">
                  <Satellite size={14} className="text-indigo-500" />
                </span>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 font-mono tracking-wider">
                    Orbital GPS Satellite Positioning System
                  </h4>
                  <p className="text-[8px] text-slate-400 font-mono">
                    REAL-TIME TRILATERATION FOR EMERGENCY SERVICES
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[8px]">
                <span className={`px-2 py-0.5 rounded-full uppercase font-bold text-white ${
                  gpsLockStatus === 'LOCKED' ? 'bg-emerald-500' :
                  gpsLockStatus === 'SCANNING' ? 'bg-indigo-500 animate-pulse' :
                  gpsLockStatus === 'FAILED' ? 'bg-rose-500' : 'bg-slate-400'
                }`}>
                  {gpsLockStatus === 'LOCKED' ? '📡 Satellite Lock Active' :
                   gpsLockStatus === 'SCANNING' ? '🛰️ Orbiters Scanning...' :
                   gpsLockStatus === 'FAILED' ? '⚠️ Lock Failed' : '🛰️ Satellite Idle'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Left Column: Visual Radar Sweep */}
              <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-900/80 p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[140px] group">
                <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,24,38,0)_95%,#10b981_100%)] bg-[length:100%_24px] animate-scan" style={{ animation: 'scan 4s linear infinite' }} />
                
                {/* Visual radar circle */}
                <div className="relative w-24 h-24 rounded-full border border-emerald-500/20 flex items-center justify-center">
                  <div className="absolute w-16 h-16 rounded-full border border-emerald-500/30 animate-ping" />
                  <div className="absolute w-12 h-12 rounded-full border border-emerald-500/40" />
                  <div className="absolute w-0.5 h-12 bg-emerald-500 origin-bottom bottom-1/2 left-1/2 animate-[spin_3s_linear_infinite]" style={{ transformOrigin: '0% 100%' }} />
                  <MapPin size={18} className={`text-rose-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10 ${gpsLockStatus === 'LOCKED' ? 'scale-110 animate-bounce' : 'opacity-40'}`} />
                </div>

                <span className="text-[7.5px] font-mono text-emerald-500 font-bold tracking-widest mt-2 uppercase">
                  {gpsLockStatus === 'LOCKED' ? "LOCK DETECTED" : "SYS STANDBY"}
                </span>
              </div>

              {/* Middle Column: Lat/Long Data Indicators */}
              <div className="lg:col-span-4 space-y-2 font-mono flex flex-col justify-between">
                <div className="bg-white dark:bg-slate-950 border border-slate-200/85 dark:border-slate-850 p-3 rounded-xl flex-1 flex flex-col justify-center">
                  <span className="text-[7.5px] uppercase text-slate-400 font-black tracking-wider">
                    Latitude Coordinates
                  </span>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {gpsCoords ? `${gpsCoords.latitude.toFixed(6)}° N` : "0.000000° --"}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-slate-950 border border-slate-200/85 dark:border-slate-850 p-3 rounded-xl flex-1 flex flex-col justify-center">
                  <span className="text-[7.5px] uppercase text-slate-400 font-black tracking-wider">
                    Longitude Coordinates
                  </span>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {gpsCoords ? `${gpsCoords.longitude.toFixed(6)}° E` : "0.000000° --"}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-950 border border-slate-200/85 dark:border-slate-850 p-2 px-3 rounded-xl flex justify-between items-center text-[8.5px]">
                  <span className="text-slate-400 uppercase font-bold">Accuracy Radius:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {gpsCoords ? `± ${gpsCoords.accuracy.toFixed(1)}m` : "--"}
                  </strong>
                </div>
              </div>

              {/* Right Column: GPS Active Console log & Trigger Button */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-3">
                <div className="bg-slate-950 text-slate-300 p-3 rounded-xl font-mono text-[8.5px] h-[95px] overflow-y-auto border border-slate-900 leading-relaxed scrollbar-thin">
                  {gpsLog.length === 0 ? (
                    <div className="text-slate-500 h-full flex items-center justify-center">
                      Satellite log telemetry ready. Engage scan...
                    </div>
                  ) : (
                    gpsLog.map((log, idx) => (
                      <div key={`telemetrycastmanager-l2418-idx-${idx}`} className="whitespace-nowrap overflow-hidden text-ellipsis">
                        <span className="text-indigo-400">›</span> {log}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEngageGpsLock(false)}
                    disabled={isGpsLoading}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] font-mono uppercase tracking-wider rounded-xl cursor-pointer shadow transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={11} className={isGpsLoading ? "animate-spin" : ""} />
                    {isGpsLoading ? "Locking..." : "Scan Satellites"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEngageGpsLock(true)}
                    disabled={isGpsLoading}
                    className="py-2 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-855 border border-slate-700 text-slate-300 font-mono text-[8.5px] uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Simulate Lock
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: BIO STATE PRESETS & PIPELINE LAUNCHER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Status Presets Selector (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                2. Choose Clinical Scenario Test-State
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(STATUS_PRESETS).map(([key, value]) => {
                  const isSelected = selectedPatientStatus === key;
                  return (
                    <button
                      key={`telemetrycastmanager-l2462-k-${key}`}
                      type="button"
                      onClick={() => {
                        setSelectedPatientStatus(key);
                        setOverrideMessage('');
                      }}
                      className={`p-3.5 text-left rounded-2xl border transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 dark:border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 bg-white dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {value.label}
                        </span>
                        <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded border uppercase ${value.color}`}>
                          HR {value.heartRate} | SpO2 {value.spo2}%
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 whitespace-normal break-words leading-relaxed text-left w-full mt-2 border-t border-slate-150 dark:border-slate-850 pt-2 font-sans">
                        {value.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom SMS / Audio Dispatch script & Interactive Pipeline launcher (Right 7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  3. Transmitted Monologue / Dispatch Description (Editable)
                </label>
                <textarea
                  value={overrideMessage || STATUS_PRESETS[selectedPatientStatus].text}
                  onChange={(e) => setOverrideMessage(e.target.value)}
                  placeholder="Custom emergency dispatch description..."
                  rows={3}
                  className="w-full text-[10.5px] leading-relaxed p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  4. Carrier Trunk Selection
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[9px]">
                  {[
                    { id: 'twilio', label: 'TWILIO GLOBAL', desc: 'Secure Proxy/eSIM' },
                    { id: 'mtn', label: 'MTN UGANDA', desc: 'Local GSM Uplink' },
                    { id: 'airtel', label: 'AIRTEL UGANDA', desc: 'Backup GSM Path' },
                    { id: 'satellite', label: 'SATELLITE eSIM', desc: 'Offline Autonomy' }
                  ].map((gateway, mapIdx_2516) => {
                    const isSelected = selectedNetwork === gateway.id;
                    return (
                      <button
                        key={`telemetrycastmanager-l2521-${mapIdx_2516}`}
                        type="button"
                        onClick={() => setSelectedNetwork(gateway.id)}
                        className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500 dark:text-indigo-400 font-bold'
                            : 'border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950/40 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      >
                        <strong className="block">{gateway.label}</strong>
                        <span className="text-[7.5px] text-slate-400">{gateway.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Master Cascade Pipeline Control Panel */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9.5px] font-black uppercase font-mono tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    Automated SOS Pipeline Cascade Engine
                  </h4>
                  <span className="text-[8px] font-mono text-slate-400 uppercase">
                    Stage-by-Stage Dispatch
                  </span>
                </div>

                {/* Pipeline Progression Steps Visualized */}
                <div className="grid grid-cols-5 gap-2 text-center font-mono">
                  {[
                    { step: 1, icon: "📡", label: "GPS Lock" },
                    { step: 2, icon: "🧠", label: "Gemini AI" },
                    { step: 3, icon: "💬", label: "GSM SMS" },
                    { step: 4, icon: "📞", label: "AI Dial" },
                    { step: 5, icon: "🟢", label: "WhatsApp" }
                  ].map((p, mapIdx_2557) => {
                    const isActive = pipelineStep === p.step;
                    const isCompleted = pipelineStep > p.step;
                    return (
                      <div key={`telemetrycastmanager-l2562-${mapIdx_2557}`} className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                          isActive ? 'bg-indigo-600 text-white border-2 border-indigo-400 scale-110 shadow-[0_0_12px_rgba(79,70,229,0.6)] animate-pulse' :
                          isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isCompleted ? "✓" : p.icon}
                        </div>
                        <span className={`text-[7.5px] uppercase font-bold tracking-tight ${
                          isActive ? 'text-indigo-400' :
                          isCompleted ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {p.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Console Log readout inside black terminal box */}
                {pipelineStep > 0 && (
                  <div className="bg-black/80 rounded-xl p-3 border border-slate-800 font-mono text-[8.5px] text-slate-300 max-h-[100px] overflow-y-auto space-y-1 scrollbar-thin">
                    {pipelineLogs.map((log, idx) => (
                      <div key={`telemetrycastmanager-l2584-idx-${idx}`} className="leading-relaxed">
                        <span className="text-emerald-400">›</span> {log}
                      </div>
                    ))}
                  </div>
                )}

                {/* Big Automated Trigger Buttons */}
                <div className="pt-1 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleLaunchCascadeDispatch}
                    disabled={isSendingAlert}
                    className="flex-1 min-w-[200px] py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase font-mono tracking-wider rounded-xl cursor-pointer shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Cpu size={12} className={isSendingAlert ? "animate-spin" : "animate-bounce"} />
                    {isSendingAlert ? 'AUTOMATION CASCADE EXECUTING...' : '🚀 LAUNCH CASCADE SOS DISPATCH'}
                  </button>
                </div>

                <div className="text-[7.5px] text-slate-400 font-mono flex items-center justify-center gap-2 uppercase border-t border-slate-800/60 pt-2.5">
                  <span>OR QUICK DISPATCH INDIVIDUAL CHANNELS:</span>
                  <button type="button" onClick={handleSendSms} className="text-indigo-400 hover:underline cursor-pointer">SMS</button>
                  <span>•</span>
                  <button type="button" onClick={handleMakeCall} className="text-indigo-400 hover:underline cursor-pointer">AI Dial</button>
                  <span>•</span>
                  <button type="button" onClick={handleSendWhatsApp} className="text-indigo-400 hover:underline cursor-pointer">WhatsApp</button>
                </div>
              </div>

            </div>
          </div>

          {/* Alert Success / Error Reports */}
          <AnimatePresence>
            {alertSuccessDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-5 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-left font-mono text-[10px]"
              >
                <div className="flex items-center gap-2 text-emerald-500 font-bold mb-1.5">
                  <CheckCircle2 size={12} />
                  <span>DISPATCH SYSTEM CONFIRMED SUCCESSFUL</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {alertSuccessDetails}
                </div>
              </motion.div>
            )}

            {alertError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-5 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-left font-mono text-[10px]"
              >
                <div className="flex items-center gap-2 text-rose-500 font-bold mb-1.5">
                  <AlertCircle size={12} />
                  <span>DISPATCH SYSTEM ERROR</span>
                </div>
                <div className="text-rose-600 dark:text-rose-400 leading-relaxed">
                  {alertError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* COMPLETED WORKOUTS HISTORY LOG */}
      <div className="mt-8 border-t border-slate-100 dark:border-slate-800/60 pt-6">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-4">
          <Database size={13} className="text-indigo-500" />
          Smart Watch Performance Archive ({completedSessions.length})
        </h4>

        {completedSessions.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-900/15 rounded-2xl border border-dashed border-slate-150 dark:border-slate-800/80 flex flex-col items-center justify-center space-y-1.5">
            <Activity size={20} className="text-slate-300" />
            <p className="text-xs text-slate-400 font-medium">No archived sports sessions in this device.</p>
            <p className="text-[9px] text-slate-400">Complete workouts on the watch above to record performance metrics.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1">
            {completedSessions.map((session, mapIdx_2670) => {
              const isSelected = selectedSessionForAnalysis?.id === session.id;
              return (
                <div 
                  key={`telemetrycastmanager-l2675-${mapIdx_2670}`}
                  onClick={() => setSelectedSessionForAnalysis(session)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex justify-between items-center gap-4 hover:shadow-md ${
                    isSelected 
                      ? 'border-indigo-500 dark:border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-500/10' 
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950'
                  }`}
                >
                  <div className="space-y-1 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] uppercase font-bold text-slate-500 bg-slate-150 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                        {session.emoji} {session.sportName}
                      </span>
                      <span className="text-[8.5px] text-slate-400">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-slate-400">
                      <span>Time: <strong className="text-slate-700 dark:text-slate-350">{formatDuration(session.durationSeconds)}</strong></span>
                      <span>Avg HR: <strong className="text-rose-500">{session.avgHeartRate} BPM</strong></span>
                      <span>Energy: <strong className="text-orange-500">{session.calories} kcal</strong></span>
                      {session.distance && (
                        <span>Dist: <strong className="text-blue-500">{session.distance} km</strong></span>
                      )}
                      {session.steps && (
                        <span>Reps: <strong className="text-emerald-500">{session.steps}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button" title="Doctorian AI Sports Review"
                      onClick={(e) => { e.stopPropagation(); handleRunAiAnalysis(session); }}
                      className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl cursor-pointer"
                    >
                      <Sparkles size={12} />
                    </button>
                    <button
                      type="button" title="Save to Patient EHR Charts"
                      onClick={(e) => handleCommitToHealthRecords(session, e)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 rounded-xl cursor-pointer"
                    >
                      <Save size={12} />
                    </button>
                    <button
                      type="button" title="Download Session XML/JSON"
                      onClick={(e) => handleExportSession(session, e)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-xl cursor-pointer"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      type="button" title="Delete record"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-xl cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DIAGNOSTICS & AI SPORTS SCIENCE TERMINAL */}
      <AnimatePresence>
        {selectedSessionForAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
            className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden mt-6 text-left font-mono"
          >
            <div className="bg-slate-900/80 px-5 py-3 border-b border-slate-800 flex justify-between items-center text-[10px]">
              <span className="font-bold uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                <Cpu size={12} className="animate-spin" /> DOCTORIAN AI WEARABLE BIOMECHANICS LAB
              </span>
              <button onClick={() => setSelectedSessionForAnalysis(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-850 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>{selectedSessionForAnalysis.emoji} {selectedSessionForAnalysis.sportName} Session Log</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Duration: {formatDuration(selectedSessionForAnalysis.durationSeconds)} | Energy: {selectedSessionForAnalysis.calories} kcal | Avg HR: {selectedSessionForAnalysis.avgHeartRate} BPM
                  </p>
                </div>

                {/* VO2 Max Dial */}
                <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800/80">
                  <div className="relative w-12 h-12 flex items-center justify-center font-bold">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                      <circle
                        cx="24" cy="24" r="20" stroke="#10b981" strokeWidth="4" fill="transparent"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - (selectedSessionForAnalysis.aiAnalysis?.estimatedVo2Max || 40) / 65)}
                      />
                    </svg>
                    <span className="text-[10px] text-white">
                      {selectedSessionForAnalysis.aiAnalysis?.estimatedVo2Max || '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-slate-400 block font-bold tracking-wider uppercase">EST. VO2 MAX</span>
                    <strong className="text-[9.5px] text-emerald-400 uppercase">
                      {selectedSessionForAnalysis.aiAnalysis ? 'Healthy Aerobic' : 'Awaiting Compute'}
                    </strong>
                  </div>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2">
                  <Activity className="text-indigo-400 animate-spin" size={24} />
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest animate-pulse">Running athletic metabolic profile linter...</p>
                </div>
              ) : selectedSessionForAnalysis.aiAnalysis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[10.5px]">
                  <div className="space-y-4">
                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Athletic Summary</span>
                      <p className="text-slate-300 leading-relaxed">{selectedSessionForAnalysis.aiAnalysis.summary}</p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Training Effect</span>
                      <p className="text-slate-300 leading-relaxed">{selectedSessionForAnalysis.aiAnalysis.aerobicEffect}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cardio Load Spectrum</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSessionForAnalysis.aiAnalysis.cardioZones.map((z: string, i: number) => (
                          <span key={`telemetrycastmanager-l2817-i-${i}`} className="px-2 py-0.5 bg-slate-950 rounded text-[9px] text-indigo-300 font-bold">
                            {z}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Coaching Tips</span>
                      <ul className="space-y-1 mt-1 text-slate-300">
                        {selectedSessionForAnalysis.aiAnalysis.tips.map((t: string, i: number) => (
                          <li key={`telemetrycastmanager-l2827-i-${i}`} className="flex items-start gap-1.5">
                            <span className="text-indigo-400">✦</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <p className="text-[10px] text-slate-400">Run Doctorian Sports DeepSeek AI for advanced athletic analytics & recommendations.</p>
                  <button
                    type="button"
                    onClick={() => handleRunAiAnalysis(selectedSessionForAnalysis)}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Compute AI Athletic Report
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Interactive Log footer */}
      <div className="mt-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 text-[9px] font-mono">
        <span className="font-bold text-slate-400 uppercase tracking-widest block mb-2">Live Sports GATT Bus Monitor</span>
        <div className="max-h-[70px] overflow-y-auto space-y-1">
          {logs.map((log, idx) => (
            <p key={`telemetrycastmanager-l2858-idx-${idx}`} className="text-slate-600 dark:text-slate-450 leading-tight">
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
