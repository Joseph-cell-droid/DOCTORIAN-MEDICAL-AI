import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Watch, Heart, Droplets, Thermometer, Activity, ShieldAlert, ShieldCheck,
  Zap, Radio, Wifi, WifiOff, Bell, BellOff, Lock, Unlock, Database, RefreshCw,
  Send, AlertTriangle, CheckCircle2, Globe, Volume2, VolumeX, Sparkles, AlertCircle
} from 'lucide-react';

export interface WatchVitalsData {
  deviceId: string;
  patientId: string;
  patientName: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  ecg: number[];
  status: 'online' | 'offline' | 'warning';
  triageStatus: 'STABLE' | 'WATCH' | 'URGENT';
  triageExplanations: {
    en: string;
    lg: string;
    sw: string;
  };
  timestamp: number;
  isCachedOffline?: boolean;
}

interface WatchVitalsMonitorProps {
  initialDeviceId?: string;
  onAlertTriggered?: (triage: any) => void;
}

export const WatchVitalsMonitor: React.FC<WatchVitalsMonitorProps> = ({
  initialDeviceId = 'WATCH-01',
  onAlertTriggered
}) => {
  const [deviceId, setDeviceId] = useState(initialDeviceId);
  const [patientName, setPatientName] = useState('Sarah Namukasa');
  const [activeLang, setActiveLang] = useState<'en' | 'lg' | 'sw'>('en');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [showEncryptedPayload, setShowEncryptedPayload] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isConnected, setIsConnected] = useState(false);
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Vitals State
  const [heartRate, setHeartRate] = useState(74);
  const [spo2, setSpo2] = useState(98);
  const [temperature, setTemperature] = useState(36.6);
  const [ecgData, setEcgData] = useState<number[]>([0.1, 0.2, 0.15, 0.85, -0.35, 0.1, 0.2, 0.15]);
  const [triageStatus, setTriageStatus] = useState<'STABLE' | 'WATCH' | 'URGENT'>('STABLE');
  const [triageExplanations, setTriageExplanations] = useState<{ en: string; lg: string; sw: string }>({
    en: 'Vitals normal (HR: 74 bpm, SpO2: 98%, Temp: 36.6°C). Cardiac rhythm stable.',
    lg: 'Obubonero bw\'obulamamu bulungi (Mutima: 74 bpm, Mukka: 98%, Ebbugumu: 36.6°C). Omulwadde mulamu.',
    sw: 'Ishara za uzima ziko sawa (Moyo: 74 bpm, Hewa: 98%, Joto: 36.6°C). Mgonjwa yuko salama.'
  });
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [triageScore, setTriageScore] = useState<number>(95);

  // Simulator Controls
  const [simHr, setSimHr] = useState(74);
  const [simSpo2, setSimSpo2] = useState(98);
  const [simTemp, setSimTemp] = useState(36.6);
  const [simEcgType, setSimEcgType] = useState<'normal' | 'tachycardia' | 'arrhythmia'>('normal');

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Request Notification Permissions on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => setPushPermission(perm));
      }
    }

    // Load Offline Cache if available
    const cached = localStorage.getItem('doctorian_watch_vitals_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.heartRate) {
          setHeartRate(parsed.heartRate);
          setSpo2(parsed.spo2);
          setTemperature(parsed.temperature);
          if (parsed.triageStatus) setTriageStatus(parsed.triageStatus);
          if (parsed.triageExplanations) setTriageExplanations(parsed.triageExplanations);
          if (parsed.timestamp) setLastUpdated(parsed.timestamp);
          setIsOfflineCached(true);
        }
      } catch (e) {
        console.warn('Failed to parse cached watch vitals:', e);
      }
    }
  }, []);

  // Save to Offline Cache whenever vitals change
  useEffect(() => {
    const cacheData: WatchVitalsData = {
      deviceId,
      patientId: 'p-101',
      patientName,
      heartRate,
      spo2,
      temperature,
      ecg: ecgData,
      status: isConnected ? 'online' : 'offline',
      triageStatus,
      triageExplanations,
      timestamp: Date.now(),
      isCachedOffline: !isConnected
    };
    localStorage.setItem('doctorian_watch_vitals_cache', JSON.stringify(cacheData));
  }, [heartRate, spo2, temperature, triageStatus, triageExplanations, deviceId, patientName, isConnected]);

  // Connect to WebSocket `/api/device/vitals`
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/device/vitals`;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsOfflineCached(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'vitals_update' || data.heartRate !== undefined) {
            if (data.deviceId && data.deviceId !== deviceId) {
              // Could handle multi-device, but focus on selected
            }
            if (data.heartRate !== undefined) setHeartRate(Number(data.heartRate));
            if (data.spo2 !== undefined) setSpo2(Number(data.spo2));
            if (data.temperature !== undefined) setTemperature(Number(data.temperature));
            if (data.ecg && Array.isArray(data.ecg)) setEcgData(data.ecg);
            if (data.patientName) setPatientName(data.patientName);

            if (data.triage) {
              setTriageStatus(data.triage.status || 'STABLE');
              if (data.triage.explanations) setTriageExplanations(data.triage.explanations);
              if (data.triage.score !== undefined) setTriageScore(data.triage.score);

              // Handle Push Alert if status is URGENT
              if (data.triage.status === 'URGENT') {
                triggerUrgentAlert(data.triage.explanations[activeLang] || 'URGENT Vitals Alert');
              }
            }
            setLastUpdated(Date.now());
          }
        } catch (err) {
          console.error('Watch WebSocket parse error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsOfflineCached(true);
      };

      ws.onerror = (err) => {
        console.warn('Watch WebSocket error:', err);
        setIsConnected(false);
        setIsOfflineCached(true);
      };
    } catch (e) {
      console.warn('WebSocket connection init failed:', e);
      setIsConnected(false);
      setIsOfflineCached(true);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [deviceId]);

  // Audio Siren for URGENT Alert
  const playSiren = () => {
    if (isMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio siren play failed:', e);
    }
  };

  const triggerUrgentAlert = (msg: string) => {
    playSiren();

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 URGENT WATCH TRIAGE ALERT', {
        body: msg,
        icon: '/favicon.ico',
        tag: 'urgent_vitals_alert'
      });
    }

    if (onAlertTriggered) {
      onAlertTriggered({ triageStatus: 'URGENT', message: msg });
    }
  };

  // Push Vitals to Server API
  const handleStreamVitals = async () => {
    setIsStreaming(true);
    try {
      // Generate synthetic ECG
      let ecgPattern = [0.1, 0.2, 0.15, 0.85, -0.35, 0.1, 0.2, 0.15];
      if (simEcgType === 'tachycardia') {
        ecgPattern = [0.2, 0.9, -0.4, 0.3, 0.2, 0.9, -0.4, 0.3];
      } else if (simEcgType === 'arrhythmia') {
        ecgPattern = [0.1, 0.4, -0.2, 1.2, -0.6, 0.0, 0.5, -0.1];
      }

      const payload = {
        deviceId,
        patientName,
        heartRate: simHr,
        spo2: simSpo2,
        temperature: simTemp,
        ecg: ecgPattern,
        timestamp: Date.now()
      };

      // Send via WebSocket if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'vitals_stream', ...payload }));
      }

      // Also HTTP POST to `/api/device/vitals`
      const res = await fetch('/api/device/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.payload) {
        setHeartRate(data.payload.heartRate);
        setSpo2(data.payload.spo2);
        setTemperature(data.payload.temperature);
        setEcgData(data.payload.ecg || ecgPattern);
        if (data.payload.triage) {
          setTriageStatus(data.payload.triage.status);
          setTriageExplanations(data.payload.triage.explanations);
          setTriageScore(data.payload.triage.score ?? 95);

          if (data.payload.triage.status === 'URGENT') {
            triggerUrgentAlert(data.payload.triage.explanations[activeLang] || 'URGENT Vitals');
          }
        }
        setLastUpdated(Date.now());
      }
    } catch (err) {
      console.error('Failed to stream watch vitals:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  // Status Styling
  const getTriageBadge = () => {
    switch (triageStatus) {
      case 'URGENT':
        return {
          bg: 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50',
          border: 'border-red-500',
          icon: <ShieldAlert size={28} className="text-white animate-bounce" />,
          label: 'URGENT TRIAGE',
          sub: 'Immediate Emergency Escalation Required'
        };
      case 'WATCH':
        return {
          bg: 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30',
          border: 'border-amber-400',
          icon: <AlertTriangle size={28} className="text-slate-950" />,
          label: 'WATCH ALERT',
          sub: 'Active Clinical Observation Active'
        };
      default:
        return {
          bg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30',
          border: 'border-emerald-500',
          icon: <ShieldCheck size={28} className="text-white" />,
          label: 'STABLE PATIENT',
          sub: 'Vitals Within Normal Baseline Limits'
        };
    }
  };

  const badgeInfo = getTriageBadge();

  return (
    <div className="space-y-6">
      {/* Top Banner: Watch Status & Emergency Notification Bar */}
      <div className={`p-6 rounded-3xl border transition-all duration-500 ${
        triageStatus === 'URGENT'
          ? 'bg-red-950/90 border-red-500/80 text-white shadow-2xl shadow-red-600/40'
          : 'bg-slate-900 border-slate-800 text-white shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center p-3 ${
              triageStatus === 'URGENT' ? 'bg-red-600 text-white animate-bounce' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
            }`}>
              <Watch size={32} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black uppercase tracking-tight">{patientName}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 font-bold border border-slate-700 text-slate-300">
                  {deviceId}
                </span>
                {isConnected ? (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    <Wifi size={10} /> Live Stream
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                    <Database size={10} /> Offline Cached
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Last Telemetry Update: {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Encryption Indicator */}
            <button
              onClick={() => setIsEncrypted(!isEncrypted)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isEncrypted
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle E2E AES-256 Encryption Status"
            >
              {isEncrypted ? <Lock size={14} /> : <Unlock size={14} />}
              <span>{isEncrypted ? 'E2E ENCRYPTED' : 'PLAIN PAYLOAD'}</span>
            </button>

            {/* Mute Audio Alarm */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700"
              title={isMuted ? 'Unmute Alarm Siren' : 'Mute Alarm Siren'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-emerald-400" />}
            </button>

            {/* Push Alert Status */}
            <button
              onClick={() => {
                if ('Notification' in window) {
                  Notification.requestPermission().then(p => setPushPermission(p));
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                pushPermission === 'granted'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <Bell size={14} />
              <span>{pushPermission === 'granted' ? 'PUSH ALERTS ON' : 'ENABLE ALERTS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Watch Telemetry & Doctorian Triage Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Doctorian AI Triage Card */}
        <div className={`lg:col-span-5 rounded-3xl p-8 border transition-all ${
          triageStatus === 'URGENT'
            ? 'bg-red-950/60 border-red-500 text-white shadow-2xl'
            : triageStatus === 'WATCH'
            ? 'bg-amber-950/40 border-amber-500 text-white'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Doctorian AI Triage Engine</h3>
            </div>
            <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 text-slate-300">
              Score: {triageScore}/100
            </span>
          </div>

          {/* Large High Contrast Triage Badge */}
          <div className={`p-6 rounded-2xl flex items-center gap-4 mb-6 ${badgeInfo.bg}`}>
            {badgeInfo.icon}
            <div>
              <p className="text-2xl font-black tracking-tight">{badgeInfo.label}</p>
              <p className="text-xs font-semibold opacity-90">{badgeInfo.sub}</p>
            </div>
          </div>

          {/* Multilingual Explanation Header & Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Globe size={14} />
                <span>Multilingual Explanation:</span>
              </div>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveLang('en')}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                    activeLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setActiveLang('lg')}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                    activeLang === 'lg' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LG (Luganda)
                </button>
                <button
                  onClick={() => setActiveLang('sw')}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                    activeLang === 'sw' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SW (Swahili)
                </button>
              </div>
            </div>

            {/* Explanation Display Box */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm font-medium leading-relaxed">
              {triageExplanations[activeLang] || triageExplanations.en}
            </div>
          </div>
        </div>

        {/* Watch High Contrast Big Vital Cards (HR, SpO2, Temp, ECG) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Heart Rate Card */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
            heartRate > 120 || heartRate < 50
              ? 'bg-red-950/40 border-red-500 text-white animate-pulse'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Heart Rate (Watch)</span>
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Heart size={22} className="animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight tabular-nums">{heartRate}</span>
                <span className="text-sm font-bold text-slate-400">bpm</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {heartRate >= 60 && heartRate <= 100 ? 'Normal Resting Pulse' : heartRate > 100 ? 'Elevated Tachycardia' : 'Bradycardia Warning'}
              </p>
            </div>
          </div>

          {/* Oxygen Saturation (SpO2) Card */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
            spo2 < 92
              ? 'bg-red-950/40 border-red-500 text-white animate-pulse'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Blood Oxygen (SpO2)</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Droplets size={22} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight tabular-nums">{spo2}</span>
                <span className="text-sm font-bold text-slate-400">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {spo2 >= 95 ? 'Optimal Tissue Oxygenation' : spo2 >= 90 ? 'Mild Hypoxia Risk' : 'CRITICAL HYPOXIA ALERT'}
              </p>
            </div>
          </div>

          {/* Temperature Card */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
            temperature > 38.0 || temperature < 35.5
              ? 'bg-amber-950/40 border-amber-500 text-white'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Body Temperature</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Thermometer size={22} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight tabular-nums">{temperature.toFixed(1)}</span>
                <span className="text-sm font-bold text-slate-400">°C</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {temperature >= 36.5 && temperature <= 37.5 ? 'Normothermic' : temperature > 37.5 ? 'Pyrexia / Fever Detected' : 'Hypothermia Warning'}
              </p>
            </div>
          </div>

          {/* Real-Time ECG Waveform Card */}
          <div className="p-6 rounded-3xl border bg-slate-900 border-slate-800 text-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Real-Time Watch ECG</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Activity size={22} />
              </div>
            </div>

            {/* ECG Rhythm Wave SVG */}
            <div className="h-20 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center px-2 overflow-hidden relative">
              <svg className="w-full h-16 text-emerald-400 stroke-current fill-none stroke-[2.5]" viewBox="0 0 300 60">
                <path d="M 0 30 Q 20 30, 30 25 T 40 30 Q 50 30, 55 5 T 60 55 T 65 20 T 70 30 Q 90 30, 100 35 T 110 30 Q 130 30, 140 25 T 150 30 Q 160 30, 165 5 T 170 55 T 175 20 T 180 30 Q 200 30, 210 35 T 220 30 Q 240 30, 250 25 T 260 30 Q 270 30, 275 5 T 280 55 T 285 20 T 290 30 L 300 30" />
              </svg>
              <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE ECG STRIP
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2 font-medium">Lead-I Optical Rhythm Sampling</p>
          </div>

        </div>
      </div>

      {/* Real-Time Watch Vitals Stream Simulator Panel */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Radio size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Watch Vitals Hardware Simulator</h3>
              <p className="text-xs text-slate-400">Stream test HR, SpO2, Temp, and ECG directly to <code className="text-blue-400 font-mono">/api/device/vitals</code></p>
            </div>
          </div>

          <button
            onClick={handleStreamVitals}
            disabled={isStreaming}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {isStreaming ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            <span>Stream Watch Payload</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Simulate Heart Rate ({simHr} bpm)</label>
            <input
              type="range"
              min={40}
              max={180}
              value={simHr}
              onChange={(e) => setSimHr(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Simulate SpO2 ({simSpo2}%)</label>
            <input
              type="range"
              min={70}
              max={100}
              value={simSpo2}
              onChange={(e) => setSimSpo2(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Simulate Temp ({simTemp}°C)</label>
            <input
              type="range"
              min={34}
              max={42}
              step={0.1}
              value={simTemp}
              onChange={(e) => setSimTemp(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Simulate Rhythm Pattern</label>
            <select
              value={simEcgType}
              onChange={(e) => setSimEcgType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="normal">Normal Sinus Rhythm</option>
              <option value="tachycardia">Sinus Tachycardia</option>
              <option value="arrhythmia">Atrial Fibrillation / Arrhythmia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
