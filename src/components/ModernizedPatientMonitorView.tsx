import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Cloud, Brain, Volume2, Bell, AlertTriangle, 
  Wifi, WifiOff, Radio, Shield, Stethoscope, PhoneCall, 
  ChevronRight, Sliders, Play, Waves, X, Check, ArrowRight,
  Heart, Thermometer, Droplets, ShieldAlert, FileText,
  Clock, Gauge, Cpu, CheckCircle2, RefreshCw
} from 'lucide-react';
import { HumanBodyVitalsModel } from './HumanBodyVitalsModel';

interface ModernizedPatientMonitorViewProps {
  user: any;
  vitals?: any;
  onNavigate: (view: any) => void;
  onOpenVault?: () => void;
  onSimulateEmergency?: () => void;
  onSwitchToDetailed?: () => void;
}

export const ModernizedPatientMonitorView: React.FC<ModernizedPatientMonitorViewProps> = ({
  user,
  vitals,
  onNavigate,
  onOpenVault,
  onSimulateEmergency,
  onSwitchToDetailed,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isAudiblePlaying, setIsAudiblePlaying] = useState(false);
  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);
  const [audibleFeedbackText, setAudibleFeedbackText] = useState<string | null>(null);

  // Health Modals
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showBiofeedbackModal, setShowBiofeedbackModal] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [showNews2Modal, setShowNews2Modal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Health Alert Thresholds State
  const [hrMin, setHrMin] = useState(50);
  const [hrMax, setHrMax] = useState(110);
  const [spo2Min, setSpo2Min] = useState(94);
  const [tempMax, setTempMax] = useState(38.0);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [alertsSavedToast, setAlertsSavedToast] = useState(false);

  // Biofeedback Breathing State
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [coherenceScore, setCoherenceScore] = useState(88);

  // Live or fallback values
  const currentTemp = vitals?.temperature ? Number(vitals.temperature).toFixed(1) : '36.8';
  const currentHR = vitals?.heartRate ? Math.round(vitals.heartRate) : 72;
  const currentSpo2 = vitals?.spo2 ? Math.round(vitals.spo2) : 98;
  const currentResp = vitals?.respiratoryRate ? Math.round(vitals.respiratoryRate) : 16;
  const currentSystolicBP = vitals?.systolicBP ? Math.round(vitals.systolicBP) : 120;
  const currentDiastolicBP = vitals?.diastolicBP ? Math.round(vitals.diastolicBP) : 80;

  // Biofeedback cycle timer
  useEffect(() => {
    if (!showBiofeedbackModal) return;
    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev > 1) return prev - 1;
        setBreathPhase((current) => {
          if (current === 'Inhale') return 'Hold';
          if (current === 'Hold') return 'Exhale';
          return 'Inhale';
        });
        return 4;
      });
      setCoherenceScore((prev) => Math.min(99, Math.max(75, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1000);
    return () => clearInterval(interval);
  }, [showBiofeedbackModal]);

  // Calculate NEWS2 Score based on live parameters
  const calculateNews2 = () => {
    let score = 0;
    // Respiration
    if (currentResp <= 8 || currentResp >= 25) score += 3;
    else if (currentResp >= 21) score += 2;
    else if (currentResp >= 9 && currentResp <= 11) score += 1;
    // SpO2
    if (currentSpo2 <= 91) score += 3;
    else if (currentSpo2 <= 93) score += 2;
    else if (currentSpo2 <= 95) score += 1;
    // Heart Rate
    if (currentHR <= 40 || currentHR >= 131) score += 3;
    else if (currentHR >= 111) score += 2;
    else if (currentHR <= 50 || (currentHR >= 91 && currentHR <= 110)) score += 1;
    // Temp
    const t = Number(currentTemp);
    if (t <= 35.0) score += 3;
    else if (t >= 39.1) score += 2;
    else if (t <= 36.0 || t >= 38.1) score += 1;
    return score;
  };

  const news2Score = calculateNews2();

  const handleReadAudibly = () => {
    const text = `Doctorian Patient Monitor live vitals: Heart rate is ${currentHR} beats per minute. Blood oxygen is ${currentSpo2} percent. Body temperature is ${currentTemp} degrees Celsius. Respiration rate is ${currentResp} breaths per minute. System is optimal.`;
    setAudibleFeedbackText(`Speaking live telemetry: HR ${currentHR} bpm, SpO2 ${currentSpo2}%, Temp ${currentTemp}°C`);
    setTimeout(() => setAudibleFeedbackText(null), 7000);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      setIsAudiblePlaying(true);
      utterance.onend = () => setIsAudiblePlaying(false);
      utterance.onerror = () => setIsAudiblePlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTriggerEmergency = () => {
    setEmergencyAlertActive(true);
    if (onSimulateEmergency) {
      onSimulateEmergency();
    }
    setTimeout(() => setEmergencyAlertActive(false), 8000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-3 sm:px-6 pb-28 pt-2 select-none text-slate-100">
      {/* 1. Header (Exact Photo Top) */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          {/* Medical Cross with Heartbeat Logo */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center">
            <div className="w-full h-full bg-[#08132e] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor">
                <path d="M9 3 h6 v5 h5 v6 h-5 v7 h-6 v-7 h-5 v-6 h5 z" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1.2" />
                <path d="M4 12 h4 l1.5 -3 l2.5 6 l2 -4 l1.5 2 h4.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                Doctorian <span className="text-blue-500">AI</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
              Your Health, Our Priority
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onSwitchToDetailed && (
            <button
              type="button"
              onClick={onSwitchToDetailed}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-400/60 text-[11px] font-bold text-slate-200 transition-colors cursor-pointer shadow-sm active:scale-95"
              title="Switch to detailed clinical matrix telemetry view"
            >
              <Activity size={13} className="text-blue-400" />
              <span>Clinical Matrix</span>
            </button>
          )}

          {/* 1GB Free Cloud Vault -> Links to Patient Health Records & Vault */}
          <button
            type="button"
            onClick={() => {
              if (onOpenVault) onOpenVault();
              onNavigate('records');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900 border border-blue-400/40 text-xs font-bold text-cyan-300 transition-colors cursor-pointer shadow-sm active:scale-95"
            title="View Patient Health Records & 1GB Free Cloud Vault"
          >
            <Cloud size={14} className="text-cyan-400" />
            <span>1GB FREE</span>
          </button>

          {/* Profile -> Links to Patient Health Profile */}
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-full border-2 border-blue-500/40 overflow-hidden bg-slate-800 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            title="View Patient Health Profile"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                {user?.name?.[0] || 'U'}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Audible Feedback Toast */}
      <AnimatePresence>
        {audibleFeedbackText && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-2xl bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 text-xs flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-indigo-400 animate-bounce" />
              <span className="font-semibold">{audibleFeedbackText}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setAudibleFeedbackText(null);
                setIsAudiblePlaying(false);
              }}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-900/60"
            >
              Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Alert Toast if Active */}
      <AnimatePresence>
        {emergencyAlertActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-rose-600 text-white flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Emergency Protocol Active: Simulated Medical Attention Triggered
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('emergency')}
                className="px-2.5 py-1 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Open Emergency Center →
              </button>
              <button
                type="button"
                onClick={() => setEmergencyAlertActive(false)}
                className="text-white/80 hover:text-white text-xs font-bold underline"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Hero Card: Patient Monitor with Holographic Human Silhouette */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#09183d] to-[#0c1f4e] border border-blue-500/30 shadow-[0_12px_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Ambient background soft glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-row items-center justify-between gap-2 sm:gap-6">
          {/* Left Column: ECG Wave, Title, Description, System Online -> Clicking opens Vitality Matrix */}
          <button
            type="button"
            onClick={() => onNavigate('vitality')}
            className="flex-1 min-w-0 pr-1 sm:pr-2 flex flex-col justify-center text-left cursor-pointer group"
            title="Click to open comprehensive Vitality Matrix health telemetry"
          >
            {/* Glowing Cyan ECG Pulse Wave Icon */}
            <div className="mb-2 sm:mb-3">
              <svg 
                className="w-10 h-7 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] group-hover:scale-105 transition-transform" 
                viewBox="0 0 40 28" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2 16 L10 16 L14 4 L19 24 L24 9 L27 18 L30 16 L38 16" 
                  stroke="#00e5ff" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>

            {/* Card Title */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors flex items-center gap-2">
              <span>Patient Monitor</span>
              <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-cyan-400" />
            </h2>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mt-1.5 sm:mt-2 max-w-[240px] sm:max-w-xs">
              Real-time health data from Arduino via Bluetooth &amp; WiFi. Tap to inspect telemetry trends.
            </p>

            {/* Status: System Online with glowing green dot */}
            <div className="flex items-center gap-2 mt-4 sm:mt-6 text-xs sm:text-sm font-semibold text-emerald-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_10px_#10b981]" />
              </span>
              <span>System Online &bull; Live Telemetry Feed</span>
            </div>
          </button>

          {/* Right Column: Holographic Torso with Radar Rings & 4 Orbital Nodes */}
          <div className="shrink-0 flex items-center justify-center">
            <HumanBodyVitalsModel
              temperature={Number(currentTemp)}
              heartRate={Number(currentHR)}
              spo2={Number(currentSpo2)}
              respiratoryRate={Number(currentResp)}
              onSelectNode={(node) => {
                if (node === 'heart') {
                  // Heart node -> Cardiac bio-telemetry & Biofeedback
                  setShowBiofeedbackModal(true);
                } else if (node === 'temp') {
                  // Temp node -> Thermoregulation telemetry
                  onNavigate('vitality');
                } else if (node === 'spo2') {
                  // SpO2 node -> Pulse oximetry telemetry
                  onNavigate('vitality');
                } else if (node === 'lungs') {
                  // Lungs node -> Clinical Triage & Respiratory Health
                  onNavigate('symptoms');
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Four Quick Action Tiles (2x2 Grid) -> Every button linked to relevant health data */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tile 1: Neural Insight -> Links to Doctorian AI Clinical Triage & Consultation */}
        <button
          type="button"
          onClick={() => onNavigate('ai_nexus')}
          className="p-4 rounded-2xl bg-[#0a1838] hover:bg-[#0e214d] border border-blue-500/30 transition-all text-left flex items-center justify-between cursor-pointer group shadow-md active:scale-95"
          title="Open Doctorian AI Clinical Intelligence Consultation"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Neural Insight</h4>
              <p className="text-[11px] text-slate-400">AI Health Analysis</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Tile 2: Read Audibly -> Speaks live vitals telemetry */}
        <button
          type="button"
          onClick={handleReadAudibly}
          className="p-4 rounded-2xl bg-[#091530] hover:bg-[#0c1e45] border border-indigo-500/30 transition-all text-left flex items-center justify-between cursor-pointer group shadow-md active:scale-95"
          title="Speak Current Patient Telemetry Out Loud"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Volume2 size={20} className={isAudiblePlaying ? 'animate-bounce text-indigo-300' : ''} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Read Audibly</h4>
              <p className="text-[11px] text-slate-400">Listen to Results</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Tile 3: Set Alerts -> Opens Health Alerts & Safety Thresholds Modal */}
        <button
          type="button"
          onClick={() => setShowAlertsModal(true)}
          className="p-4 rounded-2xl bg-[#091228] hover:bg-[#0c1836] border border-slate-800 hover:border-blue-500/40 transition-all text-left flex items-center justify-between cursor-pointer group shadow-md active:scale-95"
          title="Configure Vitals Safety Limits & Health Alert Thresholds"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Set Alerts</h4>
              <p className="text-[11px] text-slate-400">Configure Safety Bounds</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Tile 4: Simulate Emergency -> Opens Emergency Protocol & Dispatch Options */}
        <button
          type="button"
          onClick={() => setShowEmergencyModal(true)}
          className="p-4 rounded-2xl bg-[#260c14] hover:bg-[#38101e] border border-rose-600/40 transition-all text-left flex items-center justify-between cursor-pointer group shadow-md active:scale-95"
          title="Test Emergency Protocol & Autonomous SOS Dispatch"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-400/50 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors">Simulate Emergency</h4>
              <p className="text-[11px] text-slate-400">Test Scenarios &amp; Dispatch</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-rose-500 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 4. Connection Status Rows -> Interactive links to hardware & telemetry health data */}
      <div className="space-y-2">
        {/* Simulator Node -> Opens Biomedical Hardware Telemetry Diagnostics */}
        <button
          type="button"
          onClick={() => setShowHardwareModal(true)}
          className="w-full p-3.5 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1b3a] border border-slate-800 hover:border-teal-500/40 flex items-center justify-between transition-colors cursor-pointer group text-left shadow-sm"
          title="View Hardware Telemetry & Sensor Diagnostics"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
              <Wifi size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-teal-300 transition-colors">Simulator Node</h4>
              <p className="text-[11px] text-slate-400">Inspect Arduino Sensors &amp; Bluetooth Telemetry</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="group-hover:translate-x-0.5 transition-transform">Hardware Diagnostics &gt;</span>
          </div>
        </button>

        {/* Disconnect / Connect Telemetry */}
        <button
          type="button"
          onClick={() => setIsConnected(!isConnected)}
          className="w-full p-3.5 rounded-2xl bg-[#091228]/80 hover:bg-[#120e18] border border-slate-800 hover:border-rose-500/30 flex items-center justify-between transition-colors cursor-pointer group"
          title={isConnected ? 'Pause Telemetry Streaming' : 'Resume Telemetry Pipeline'}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${isConnected ? 'bg-rose-600/20 border border-rose-500/40 text-rose-400' : 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'} flex items-center justify-center shrink-0`}>
              {isConnected ? <WifiOff size={18} /> : <Wifi size={18} />}
            </div>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {isConnected ? 'Disconnect Telemetry Feed' : 'Connect Telemetry Stream'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isConnected ? 'Pause active continuous telemetry ingest' : 'Initialize live sensor stream pipeline'}
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold ${isConnected ? 'text-rose-400 group-hover:text-rose-300' : 'text-emerald-400 group-hover:text-emerald-300'}`}>
            {isConnected ? 'Disconnect >' : 'Connect >'}
          </span>
        </button>
      </div>

      {/* 5. Triage & Stream Status Bar -> Interactive Clinical Risk Assessment */}
      <div className="p-3.5 rounded-2xl bg-[#091228]/90 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-bold">{isConnected ? 'LIVE STREAM ACTIVE' : 'STREAM PAUSED'}</span>
          </div>
          {/* Clicking NEWS2 opens detailed clinical risk calculation */}
          <button
            type="button"
            onClick={() => setShowNews2Modal(true)}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
            title="Inspect National Early Warning Score calculation"
          >
            <Radio size={14} className="animate-pulse" />
            <span>NEWS2 SCORE: {news2Score} ({news2Score === 0 ? 'LOW RISK' : news2Score <= 4 ? 'MILD RISK' : 'ELEVATED RISK'}) &gt;</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowHardwareModal(true)}
            className="px-3 py-1 rounded-full bg-blue-950/80 hover:bg-blue-900 border border-blue-500/30 text-blue-300 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Waves size={12} />
            Telemetry Stream Diagnostics
          </button>
          <button
            type="button"
            onClick={() => onNavigate('vitality')}
            className="px-3 py-1 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-300 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Shield size={12} />
            Continuous Health Monitoring →
          </button>
        </div>
      </div>

      {/* 6. Clinical Emergency Triage Command -> Every action linked to relevant health data */}
      <div className="p-5 rounded-3xl bg-[#091228]/95 border border-purple-500/30 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Stethoscope size={20} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Clinical Emergency Triage Command
              </h4>
              <p className="text-xs text-slate-400">
                Real-time National Early Warning Score (NEWS2) &amp; multi-organ failure risk telemetry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('symptoms')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Full Triage</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* 4 Action Grid Cards (2x2) -> Fixed routes to actual health data */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Action 1: Emergency Call SOS -> Links to Emergency View & Autonomous Dispatch */}
          <button
            type="button"
            onClick={() => {
              handleTriggerEmergency();
              onNavigate('emergency');
            }}
            className="p-3.5 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/40 text-left flex items-center justify-between group cursor-pointer transition-all shadow-sm active:scale-95"
            title="Open Emergency Response & Ambulance Dispatch"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-400/50 flex items-center justify-center text-rose-400 shrink-0">
                <PhoneCall size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">Emergency Call SOS</h5>
                <p className="text-[10px] text-slate-400">Ambulance &amp; Hospital Route</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Action 2: Run Triage Scan -> Links to Symptom Checker & Clinical Triage */}
          <button
            type="button"
            onClick={() => onNavigate('symptoms')}
            className="p-3.5 rounded-2xl bg-blue-950/40 hover:bg-blue-950/60 border border-blue-500/40 text-left flex items-center justify-between group cursor-pointer transition-all shadow-sm active:scale-95"
            title="Launch Clinical AI Differential Diagnosis & Triage Scan"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 shrink-0">
                <Play size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">Run Triage Scan</h5>
                <p className="text-[10px] text-slate-400">Differential AI Diagnosis</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Action 3: Biofeedback -> Opens Biofeedback & Coherence Guided Breathing */}
          <button
            type="button"
            onClick={() => setShowBiofeedbackModal(true)}
            className="p-3.5 rounded-2xl bg-teal-950/40 hover:bg-teal-950/60 border border-teal-500/40 text-left flex items-center justify-between group cursor-pointer transition-all shadow-sm active:scale-95"
            title="Open Guided Biofeedback & HRV Coherence Exercise"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600/30 border border-teal-400/50 flex items-center justify-center text-teal-400 shrink-0">
                <Activity size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">Biofeedback</h5>
                <p className="text-[10px] text-slate-400">Coherence &amp; HRV Training</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Action 4: Vitals Dials -> Links to Vitality Matrix */}
          <button
            type="button"
            onClick={() => onNavigate('vitality')}
            className="p-3.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-500/40 text-left flex items-center justify-between group cursor-pointer transition-all shadow-sm active:scale-95"
            title="View Real-Time Vitals Dials, Gauges & Trends"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-indigo-400 shrink-0">
                <Sliders size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">Vitals Dials</h5>
                <p className="text-[10px] text-slate-400">Telemetry Matrix &amp; Stats</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 1: HEALTH ALERTS & SAFETY THRESHOLDS */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAlertsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0b1633] border border-blue-500/40 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Vitals Safety &amp; Alert Limits</h3>
                    <p className="text-xs text-slate-400">Configure real-time physiologic thresholds</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAlertsModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {alertsSavedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Alert parameters successfully synchronized!</span>
                </div>
              )}

              {/* Threshold Controls */}
              <div className="space-y-4">
                {/* Heart Rate Bounds */}
                <div className="p-3.5 rounded-2xl bg-[#071126] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Heart size={14} className="text-rose-400" /> Heart Rate Limits (BPM)
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">{hrMin} - {hrMax} bpm</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Low Alarm ({hrMin} bpm)</label>
                      <input
                        type="range"
                        min={40}
                        max={70}
                        value={hrMin}
                        onChange={(e) => setHrMin(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">High Alarm ({hrMax} bpm)</label>
                      <input
                        type="range"
                        min={90}
                        max={160}
                        value={hrMax}
                        onChange={(e) => setHrMax(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SpO2 Minimum */}
                <div className="p-3.5 rounded-2xl bg-[#071126] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Droplets size={14} className="text-cyan-400" /> Critical Low Blood Oxygen (SpO2)
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">&lt; {spo2Min}%</span>
                  </div>
                  <input
                    type="range"
                    min={85}
                    max={96}
                    value={spo2Min}
                    onChange={(e) => setSpo2Min(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <p className="text-[10px] text-slate-400">Triggers hypoxic desaturation warnings below {spo2Min}%</p>
                </div>

                {/* Temperature High Bound */}
                <div className="p-3.5 rounded-2xl bg-[#071126] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Thermometer size={14} className="text-amber-400" /> Pyrexia Alert (Temperature)
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">&gt; {tempMax}°C</span>
                  </div>
                  <input
                    type="range"
                    min={37.5}
                    max={39.5}
                    step={0.1}
                    value={tempMax}
                    onChange={(e) => setTempMax(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                  <p className="text-[10px] text-slate-400">Triggers febrile infection caution above {tempMax}°C</p>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSoundAlerts(!soundAlerts)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      soundAlerts ? 'bg-blue-950/60 border-blue-500/50 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">Audible Sirens</div>
                    <div className="text-[10px] opacity-80">{soundAlerts ? 'Sound Enabled' : 'Muted'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPushAlerts(!pushAlerts)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      pushAlerts ? 'bg-indigo-950/60 border-indigo-500/50 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">Push Notifications</div>
                    <div className="text-[10px] opacity-80">{pushAlerts ? 'Broadcast Active' : 'Disabled'}</div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAlertsModal(false);
                    onNavigate('vitality');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                >
                  Inspect Vitality Matrix →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAlertsSavedToast(true);
                    setTimeout(() => {
                      setAlertsSavedToast(false);
                      setShowAlertsModal(false);
                    }, 1200);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  Save Alert Bounds
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 2: BIOFEEDBACK & COHERENCE GUIDED BREATHING */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBiofeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#08152e] border border-teal-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-8 h-8 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Biofeedback &amp; RSA Coherence</h3>
                    <p className="text-[11px] text-slate-400">Heart rate variability guided breathing</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBiofeedbackModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Breathing Orb */}
              <div className="py-4 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    scale: breathPhase === 'Inhale' ? 1.35 : breathPhase === 'Hold' ? 1.35 : 0.85,
                    borderColor: breathPhase === 'Inhale' ? '#2dd4bf' : breathPhase === 'Hold' ? '#38bdf8' : '#818cf8',
                  }}
                  transition={{ duration: 3.5, ease: "easeInOut" }}
                  className="w-36 h-36 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 border-4 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.3)] relative"
                >
                  <span className="text-xs font-black uppercase tracking-widest text-teal-300">{breathPhase}</span>
                  <span className="text-3xl font-extrabold text-white mt-1">{breathSeconds}s</span>
                </motion.div>
                <p className="text-xs text-slate-400 mt-4">
                  Match your breath with the orb to synchronize vagal tone and stabilize heart rate.
                </p>
              </div>

              {/* Coherence Metrics */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-2xl bg-[#061024] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">HRV Coherence</span>
                  <div className="text-lg font-black text-teal-400 mt-0.5">{coherenceScore}%</div>
                  <span className="text-[9px] text-emerald-400">High Parasympathetic Tone</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#061024] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Real-time Pulse</span>
                  <div className="text-lg font-black text-rose-400 mt-0.5">{currentHR} BPM</div>
                  <span className="text-[9px] text-slate-400">Sinus Rhythm Normal</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowBiofeedbackModal(false);
                    onNavigate('vitality');
                  }}
                  className="text-xs text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
                >
                  Open Vitality Telemetry →
                </button>
                <button
                  type="button"
                  onClick={() => setShowBiofeedbackModal(false)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                >
                  Done Exercise
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 3: BIOMEDICAL HARDWARE & TELEMETRY DIAGNOSTICS */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHardwareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#091530] border border-teal-500/40 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Biomedical Hardware Diagnostics</h3>
                    <p className="text-xs text-slate-400">Arduino Uno R4 / ESP32 Sensor Telemetry Ingest</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHardwareModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sensor Diagnostics List */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-[#061024] border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">Optical Pulse Oximeter (MAX30102)</h5>
                    <p className="text-[10px] text-slate-400">Infrared Plethysmogram &bull; Heart Rate &amp; SpO2</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                    CONNECTED &bull; 100 Hz
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#061024] border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">Clinical Thermistor (DS18B20)</h5>
                    <p className="text-[10px] text-slate-400">Core &amp; Peripheral Thermoregulation Sensor</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                    ONLINE &bull; 0.0625°C Res
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#061024] border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">3-Lead ECG Sensor (AD8232)</h5>
                    <p className="text-[10px] text-slate-400">Lead-I Cardiac Rhythm &amp; Waveform Filter</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                    ACTIVE &bull; SNR 28dB
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2.5 rounded-xl bg-[#071329] border border-slate-800">
                    <div className="text-[10px] text-slate-400">Sampling Rate</div>
                    <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">50 pkt/s</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#071329] border border-slate-800">
                    <div className="text-[10px] text-slate-400">BLE Signal</div>
                    <div className="text-sm font-mono font-bold text-emerald-300 mt-0.5">-58 dBm</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#071329] border border-slate-800">
                    <div className="text-[10px] text-slate-400">Battery Level</div>
                    <div className="text-sm font-mono font-bold text-blue-300 mt-0.5">3.94V (89%)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                {onSwitchToDetailed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowHardwareModal(false);
                      onSwitchToDetailed();
                    }}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold"
                  >
                    Switch to Clinical Hardware Matrix →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowHardwareModal(false);
                      onNavigate('vitality');
                    }}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold"
                  >
                    View Vitality Matrix →
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowHardwareModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 4: NATIONAL EARLY WARNING SCORE (NEWS2) BREAKDOWN */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNews2Modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#091530] border border-cyan-500/40 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Radio size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">NEWS2 Clinical Risk Score</h3>
                    <p className="text-xs text-slate-400">National Early Warning Score acute illness assessment</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNews2Modal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Total Score Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#06182e] to-cyan-950/70 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">Composite Score</div>
                  <div className="text-2xl font-black text-white mt-0.5">NEWS2: {news2Score} Points</div>
                  <div className="text-xs text-slate-300">
                    {news2Score === 0 ? 'Low Clinical Risk - Standard Ward Care' : news2Score <= 4 ? 'Low/Medium Risk - 4 to 6 hourly monitoring' : 'High Clinical Risk - Immediate medical review'}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-mono text-xl font-black">
                  {news2Score}
                </div>
              </div>

              {/* Parameter Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061024] border border-slate-800">
                  <span className="text-slate-300">Respiration Rate ({currentResp} bpm)</span>
                  <span className="font-mono font-bold text-emerald-400">0 Pts (Normal 12-20)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061024] border border-slate-800">
                  <span className="text-slate-300">Oxygen Saturation ({currentSpo2}%)</span>
                  <span className="font-mono font-bold text-emerald-400">0 Pts (&ge; 96% Scale 1)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061024] border border-slate-800">
                  <span className="text-slate-300">Systolic Blood Pressure ({currentSystolicBP} mmHg)</span>
                  <span className="font-mono font-bold text-emerald-400">0 Pts (Normal 111-219)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061024] border border-slate-800">
                  <span className="text-slate-300">Pulse Rate ({currentHR} bpm)</span>
                  <span className="font-mono font-bold text-emerald-400">0 Pts (Normal 51-90)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061024] border border-slate-800">
                  <span className="text-slate-300">Body Temperature ({currentTemp}°C)</span>
                  <span className="font-mono font-bold text-emerald-400">0 Pts (Normal 36.1-38.0)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowNews2Modal(false);
                    onNavigate('symptoms');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  Run Full Clinical Triage Scan →
                </button>
                <button
                  type="button"
                  onClick={() => setShowNews2Modal(false)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 5: EMERGENCY SOS & DISPATCH PROTOCOL */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEmergencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#1f0912] border border-rose-500/50 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} className="animate-bounce" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Emergency Response Protocols</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Connect to paramedic triage, broadcast live GPS bio-telemetry, or launch the autonomous SOS dispatch portal.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmergencyModal(false);
                    onNavigate('emergency');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-between font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall size={18} />
                    <span>Open Emergency Control Center →</span>
                  </div>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmergencyModal(false);
                    handleTriggerEmergency();
                  }}
                  className="w-full p-3.5 rounded-2xl bg-rose-950/60 hover:bg-rose-950/90 border border-rose-500/40 text-rose-200 flex items-center justify-between font-bold text-xs cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert size={18} />
                    <span>Simulate Audio Alarm Siren Only</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="pt-2 border-t border-rose-900/40">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel / Return to Monitor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

