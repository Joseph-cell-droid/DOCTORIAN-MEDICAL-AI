import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Cloud, Brain, Volume2, Bell, AlertTriangle, 
  Wifi, WifiOff, Radio, Shield, Stethoscope, PhoneCall, 
  ChevronRight, Sliders, Play, Waves
} from 'lucide-react';
import { HumanBodyVitalsModel } from './HumanBodyVitalsModel';

interface ModernizedPatientMonitorViewProps {
  user: any;
  vitals?: any;
  onNavigate: (view: any) => void;
  onOpenVault?: () => void;
  onSimulateEmergency?: () => void;
}

export const ModernizedPatientMonitorView: React.FC<ModernizedPatientMonitorViewProps> = ({
  user,
  vitals,
  onNavigate,
  onOpenVault,
  onSimulateEmergency,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isAudiblePlaying, setIsAudiblePlaying] = useState(false);
  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);

  // Live or fallback values
  const currentTemp = vitals?.temperature ? Number(vitals.temperature).toFixed(1) : '36.8';
  const currentHR = vitals?.heartRate ? Math.round(vitals.heartRate) : 72;
  const currentSpo2 = vitals?.spo2 ? Math.round(vitals.spo2) : 98;
  const currentResp = vitals?.respiratoryRate ? Math.round(vitals.respiratoryRate) : 16;

  const handleReadAudibly = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Doctorian Patient Monitor live vitals: Heart rate is ${currentHR} beats per minute. Blood oxygen is ${currentSpo2} percent. Body temperature is ${currentTemp} degrees Celsius. Respiration rate is ${currentResp} breaths per minute. System is optimal.`;
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
      {/* 1. Header (Exact Photo 6 Top) */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Activity size={22} className="text-cyan-300" />
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
          <button
            type="button"
            onClick={() => onOpenVault ? onOpenVault() : onNavigate('storage_vault')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900 border border-blue-400/40 text-xs font-bold text-cyan-300 transition-colors cursor-pointer shadow-sm"
            title="1GB Free Cloud Vault"
          >
            <Cloud size={14} className="text-cyan-400" />
            <span>1GB FREE</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-full border-2 border-blue-500/40 overflow-hidden bg-slate-800 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            title="Profile"
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

      {/* Emergency Alert Toast if Active */}
      {emergencyAlertActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-rose-600 text-white flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Emergency Simulation Active: Immediate Clinical Attention Simulated
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEmergencyAlertActive(false)}
            className="text-white/80 hover:text-white text-xs font-bold underline"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* 2. Hero Card: Patient Monitor with Holographic Human Silhouette (Exact Photo 6) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#091228]/95 border border-blue-500/30 shadow-[0_12px_40px_rgba(6,182,212,0.15)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Activity size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Patient Monitor
              </h3>
              <p className="text-xs text-slate-400">
                Real-time health data from Arduino via Bluetooth &amp; WiFi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>System Online</span>
          </div>
        </div>

        {/* The Glowing Holographic Body Model */}
        <div className="py-2">
          <HumanBodyVitalsModel
            temperature={Number(currentTemp)}
            heartRate={Number(currentHR)}
            spo2={Number(currentSpo2)}
            respiratoryRate={Number(currentResp)}
          />
        </div>

        {/* Live Metrics Row below Hologram */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Temp</span>
            <span className="text-xs sm:text-sm font-bold text-cyan-300">{currentTemp}°C</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Heart</span>
            <span className="text-xs sm:text-sm font-bold text-rose-300">{currentHR} BPM</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">SpO2</span>
            <span className="text-xs sm:text-sm font-bold text-blue-300">{currentSpo2}%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Resp</span>
            <span className="text-xs sm:text-sm font-bold text-purple-300">{currentResp} bpm</span>
          </div>
        </div>
      </div>

      {/* 3. Four Quick Action Tiles (Exact Photo 6 2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tile 1: Neural Insight */}
        <button
          type="button"
          onClick={() => onNavigate('ai_nexus')}
          className="p-4 rounded-2xl bg-[#0a1838] hover:bg-[#0e214d] border border-blue-500/30 transition-all text-left flex items-center justify-between cursor-pointer group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Neural Insight</h4>
              <p className="text-[11px] text-slate-400">AI Health Analysis</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Tile 2: Read Audibly */}
        <button
          type="button"
          onClick={handleReadAudibly}
          className="p-4 rounded-2xl bg-[#091530] hover:bg-[#0c1e45] border border-indigo-500/30 transition-all text-left flex items-center justify-between cursor-pointer group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Volume2 size={20} className={isAudiblePlaying ? 'animate-bounce' : ''} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Read Audibly</h4>
              <p className="text-[11px] text-slate-400">Listen to Results</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Tile 3: Set Alerts */}
        <button
          type="button"
          onClick={() => onNavigate('alarms')}
          className="p-4 rounded-2xl bg-[#091228] hover:bg-[#0c1836] border border-slate-800 transition-all text-left flex items-center justify-between cursor-pointer group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Set Alerts</h4>
              <p className="text-[11px] text-slate-400">Get Notified</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Tile 4: Simulate Emergency */}
        <button
          type="button"
          onClick={handleTriggerEmergency}
          className="p-4 rounded-2xl bg-[#260c14] hover:bg-[#38101e] border border-rose-600/40 transition-all text-left flex items-center justify-between cursor-pointer group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-400/50 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Simulate Emergency</h4>
              <p className="text-[11px] text-slate-400">Test Scenarios</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-rose-500 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 4. Connection Status Rows (Exact Photo 6) */}
      <div className="space-y-2">
        {/* Simulator Node */}
        <div className="p-3.5 rounded-2xl bg-[#091228]/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
              <Wifi size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Simulator Node</h4>
              <p className="text-[11px] text-slate-400">Connect to Simulation Server</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected &gt;</span>
          </div>
        </div>

        {/* Disconnect */}
        <button
          type="button"
          onClick={() => setIsConnected(!isConnected)}
          className="w-full p-3.5 rounded-2xl bg-[#091228]/80 hover:bg-[#120e18] border border-slate-800 hover:border-rose-500/30 flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <WifiOff size={18} />
            </div>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {isConnected ? 'Disconnect' : 'Connect Telemetry'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isConnected ? 'Close Connection' : 'Initialize Telemetry Pipeline'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-400 group-hover:text-rose-300">
            &gt;
          </span>
        </button>
      </div>

      {/* 5. Triage & Stream Status Bar (Exact Photo 6) */}
      <div className="p-3.5 rounded-2xl bg-[#091228]/90 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-bold">SIMULATION MODE</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Radio size={14} className="animate-pulse" />
            <span>NEWS2: AWAITING LIVE SERVER</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-[11px] font-medium flex items-center gap-1.5">
            <Waves size={12} />
            Live Telemetry Stream Active
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-[11px] font-medium flex items-center gap-1.5">
            <Shield size={12} />
            Continuous Health Monitoring
          </span>
        </div>
      </div>

      {/* 6. Clinical Emergency Triage Command (Exact Photo 6) */}
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
          <ChevronRight size={18} className="text-slate-400 shrink-0" />
        </div>

        {/* 4 Action Grid Cards (2x2) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Action 1: Emergency Call SOS */}
          <button
            type="button"
            onClick={handleTriggerEmergency}
            className="p-3.5 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/40 text-left flex items-center justify-between group cursor-pointer transition-all shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-400/50 flex items-center justify-center text-rose-400 shrink-0">
                <PhoneCall size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Emergency Call SOS</h5>
                <p className="text-[10px] text-slate-400">Quick help when needed</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-rose-400" />
          </button>

          {/* Action 2: Run Triage Scan */}
          <button
            type="button"
            onClick={() => onNavigate('triage')}
            className="p-3.5 rounded-2xl bg-blue-950/40 hover:bg-blue-950/60 border border-blue-500/40 text-left flex items-center justify-between group cursor-pointer transition-all shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 shrink-0">
                <Play size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Run Triage Scan</h5>
                <p className="text-[10px] text-slate-400">Start analysis</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400" />
          </button>

          {/* Action 3: Biofeedback */}
          <button
            type="button"
            onClick={() => onNavigate('bio_simulation')}
            className="p-3.5 rounded-2xl bg-teal-950/40 hover:bg-teal-950/60 border border-teal-500/40 text-left flex items-center justify-between group cursor-pointer transition-all shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600/30 border border-teal-400/50 flex items-center justify-center text-teal-400 shrink-0">
                <Activity size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Biofeedback</h5>
                <p className="text-[10px] text-slate-400">Live vitals &amp; trends</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-teal-400" />
          </button>

          {/* Action 4: Vitals Dials */}
          <button
            type="button"
            onClick={() => onNavigate('vitality')}
            className="p-3.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-500/40 text-left flex items-center justify-between group cursor-pointer transition-all shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-indigo-400 shrink-0">
                <Sliders size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Vitals Dials</h5>
                <p className="text-[10px] text-slate-400">View detailed stats</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
