import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Watch, 
  Heart, 
  Activity, 
  Thermometer, 
  Droplet, 
  Footprints, 
  Flame, 
  WifiOff, 
  Bluetooth, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  BatteryCharging, 
  Moon, 
  FileText, 
  Download, 
  Sparkles, 
  Cpu, 
  Radio, 
  ChevronDown, 
  ChevronRight, 
  Layers
} from 'lucide-react';

interface DoctorianSmartWatchOSProps {
  onNavigate?: (view: string) => void;
  user?: any;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DoctorianSmartWatchOS: React.FC<DoctorianSmartWatchOSProps> = ({
  onNavigate,
  user,
  addToast
}) => {
  const toast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (addToast) addToast(msg, type);
  };

  const [connectionMode, setConnectionMode] = useState<'near' | 'far'>('near');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(75);
  const [storedDataMB, setStoredDataMB] = useState(472);

  const [activeWatchScreen, setActiveWatchScreen] = useState<
    'main' | 'overview' | 'insights' | 'storage' | 'ecg' | 'sleep' | 'sync' | 'ready'
  >('main');

  const [heartRate, setHeartRate] = useState(72);
  const [steps] = useState(8450);
  const [calories] = useState(412);
  const [temperature] = useState(36.6);
  const [spo2] = useState(98);
  const [bloodPressure] = useState('118/76');

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const val = prev + delta;
        return val < 68 ? 68 : val > 76 ? 76 : val;
      });
      if (connectionMode === 'far') {
        setStoredDataMB(prev => Number((prev + 0.05).toFixed(1)));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [connectionMode]);

  const handleTriggerSync = () => {
    if (connectionMode === 'far') {
      toast('Bringing watch near phone to establish Bluetooth 5.3 link...', 'info');
      setConnectionMode('near');
    }
    
    setIsSyncing(true);
    setActiveWatchScreen('sync');
    setSyncProgress(25);
    
    setTimeout(() => setSyncProgress(65), 600);
    setTimeout(() => setSyncProgress(90), 1200);
    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      setActiveWatchScreen('ready');
      toast(`Synced ${storedDataMB} MB of stored telemetry to Doctorian app!`, 'success');
    }, 1800);
  };

  const handleSaveEcgReport = () => {
    toast('Generating Doctorian Smart Watch Clinical ECG report...', 'info');
    setTimeout(() => {
      const ecgData = {
        device: 'Doctorian Smart Watch OS v2.0',
        patient: user?.displayName || 'Dr. Joseph Akora',
        timestamp: new Date().toISOString(),
        vitals: {
          heartRate: `${heartRate} bpm`,
          rhythm: 'Normal Sinus Rhythm',
          amplitude: '0.85 mV',
          paperSpeed: '25 mm/s',
          spo2: `${spo2}%`,
          temperature: `${temperature} °C`,
          bloodPressure: bloodPressure
        }
      };
      const blob = new Blob([JSON.stringify(ecgData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Doctorian_Watch_ECG_Report_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('ECG Report saved to device storage!', 'success');
    }, 600);
  };

  return (
    <div className="w-full bg-[#030917] text-slate-100 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 select-none font-sans relative overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Header */}
      <header className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#0b1c3d] via-[#091b35] to-[#040f24] border border-blue-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <img 
              src="/assets/aistudio/image_3d2127ab.png" 
              alt="Doctorian AI" 
              className="w-full h-full object-cover rounded-[22px] bg-[#051126]" 
            />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Doctorian</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Smart Watch OS
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200/80 font-medium tracking-wide mt-1">
              Monitor. Store. Analyze. Sync.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Standalone Medical OS
              </span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                {connectionMode === 'near' ? '⚡ Connected to Doctorian App' : '🛰️ Offline Local Storage Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
          <div className="bg-[#051329] border border-blue-900/60 p-2 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-[11px] font-bold text-slate-400 px-2">Watch Location:</span>
            <button
              type="button"
              onClick={() => {
                setConnectionMode('near');
                toast('Watch linked to Doctorian Phone App via Bluetooth 5.3', 'success');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                connectionMode === 'near'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/30 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bluetooth size={13} />
              <span>Near Phone</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setConnectionMode('far');
                toast('Watch moved far away from phone. Storing locally.', 'info');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                connectionMode === 'far'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/30 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <WifiOff size={13} />
              <span>Far Away (Offline)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin text-slate-950" : "text-slate-950"} />
              <span>{isSyncing ? `Syncing (${syncProgress}%)...` : 'Sync Stored Data Now'}</span>
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Physical Watch */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-[#07152e] via-[#051126] to-[#020914] border border-blue-500/20 shadow-2xl relative">
          
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400 mb-4 px-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Watch size={15} />
              Doctorian Watch Hardware
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <BatteryCharging size={15} />
              100% Charging
            </span>
          </div>

          {/* Watch Hardware Frame */}
          <div className="relative w-[280px] sm:w-[310px] h-[370px] sm:h-[400px] flex items-center justify-center">
            
            <div className="absolute -top-6 w-32 h-10 bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-2xl shadow-inner border-t border-slate-700/50" />
            <div className="absolute -bottom-6 w-32 h-10 bg-gradient-to-t from-slate-800 to-slate-900 rounded-b-2xl shadow-inner border-b border-slate-700/50" />

            <div className="relative w-full h-full rounded-[48px] bg-gradient-to-br from-slate-600 via-slate-800 to-slate-950 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.25)] border border-slate-600/60">
              
              <div className="absolute -right-3 top-20 w-3 h-10 bg-gradient-to-r from-slate-700 to-slate-500 rounded-r-md border border-slate-500/50 shadow-md cursor-pointer hover:brightness-125" />
              <div className="absolute -right-2.5 top-34 w-2 h-14 bg-gradient-to-r from-slate-800 to-slate-600 rounded-r-sm border border-slate-600/50 cursor-pointer" />

              <div className="w-full h-full rounded-[38px] bg-black p-4 flex flex-col justify-between overflow-hidden relative border border-white/10 shadow-inner">
                
                <div className="flex items-center justify-between text-white text-[11px] font-bold px-1 pt-1 z-10">
                  <span className="text-[10px] text-cyan-300">Mon, Oct 30</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold">10:24</span>
                    <span className="w-4 h-2 rounded-sm bg-emerald-500 border border-emerald-400 inline-block" />
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-2 z-10 text-center">
                  
                  {activeWatchScreen === 'main' && (
                    <motion.div 
                      key="watch-main"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-center gap-3 mt-2">
                        <div className="relative">
                          <Heart size={38} className="fill-red-500 text-red-500 animate-pulse" />
                          <div className="absolute inset-0 bg-red-500/30 blur-md rounded-full -z-10 animate-ping" />
                        </div>
                        <div className="text-left">
                          <div className="text-3xl font-black text-white tracking-tighter leading-none">
                            {heartRate} <span className="text-xs font-bold text-slate-400">bpm</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 mt-0.5">
                            ✓ Normal Range
                          </span>
                        </div>
                      </div>

                      <div className="h-12 w-full my-1 flex items-center justify-center overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path
                            d="M 0,15 L 15,15 L 20,8 L 25,22 L 30,5 L 35,26 L 40,15 L 55,15 L 60,8 L 65,22 L 70,5 L 75,26 L 80,15 L 100,15"
                            fill="none"
                            stroke="#00e5ff"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="animate-pulse"
                          />
                        </svg>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 px-1">
                        <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                          <Footprints size={13} className="text-cyan-400 mx-auto" />
                          <p className="text-[11px] font-black text-white mt-0.5 leading-none">{steps.toLocaleString()}</p>
                          <span className="text-[7px] text-slate-400 uppercase font-bold">Steps</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                          <Flame size={13} className="text-amber-400 mx-auto" />
                          <p className="text-[11px] font-black text-white mt-0.5 leading-none">{calories}</p>
                          <span className="text-[7px] text-slate-400 uppercase font-bold">Kcal</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                          <Thermometer size={13} className="text-rose-400 mx-auto" />
                          <p className="text-[11px] font-black text-white mt-0.5 leading-none">{temperature}°C</p>
                          <span className="text-[7px] text-slate-400 uppercase font-bold">Temp</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveWatchScreen('overview')}
                        className="w-full py-1.5 rounded-full bg-blue-600/40 hover:bg-blue-600 border border-blue-400/40 text-[10px] font-bold text-cyan-200 flex items-center justify-center gap-1 transition-all cursor-pointer mt-2"
                      >
                        <span>Tap for more</span>
                        <ChevronDown size={12} />
                      </button>
                    </motion.div>
                  )}

                  {activeWatchScreen === 'overview' && (
                    <motion.div 
                      key="watch-overview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col justify-between text-left py-1"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                        <span className="text-[11px] font-black text-white flex items-center gap-1">
                          <Heart size={12} className="text-purple-400 fill-purple-400" />
                          Health Overview
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">10:24</span>
                      </div>

                      <div className="space-y-1 text-xs py-1">
                        <div className="flex items-center justify-between p-1 rounded-lg bg-slate-900/90 border border-slate-800">
                          <span className="text-[10px] text-slate-300">Heart Rate</span>
                          <span className="text-[11px] font-black text-white">{heartRate} bpm</span>
                        </div>
                        <div className="flex items-center justify-between p-1 rounded-lg bg-slate-900/90 border border-slate-800">
                          <span className="text-[10px] text-slate-300">Blood Oxygen</span>
                          <span className="text-[11px] font-black text-white">{spo2}%</span>
                        </div>
                        <div className="flex items-center justify-between p-1 rounded-lg bg-slate-900/90 border border-slate-800">
                          <span className="text-[10px] text-slate-300">Body Temp</span>
                          <span className="text-[11px] font-black text-white">{temperature} °C</span>
                        </div>
                        <div className="flex items-center justify-between p-1 rounded-lg bg-slate-900/90 border border-slate-800">
                          <span className="text-[10px] text-slate-300">Blood Pressure</span>
                          <span className="text-[11px] font-black text-white">{bloodPressure}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveWatchScreen('insights')}
                        className="w-full py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-[10px] font-black text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Next: AI Insights</span>
                        <ChevronRight size={12} />
                      </button>
                    </motion.div>
                  )}

                  {activeWatchScreen === 'insights' && (
                    <motion.div 
                      key="watch-insights"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col justify-between text-left py-1"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                        <span className="text-[11px] font-black text-cyan-300 flex items-center gap-1">
                          <Sparkles size={12} />
                          AI Insights
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">10:25</span>
                      </div>

                      <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[10px] space-y-1">
                        <p className="font-bold text-white leading-tight">
                          "Your vitals are stable and in good condition."
                        </p>
                        <p className="text-[9px] text-emerald-400">✓ No abnormality detected</p>
                        <p className="text-[9px] text-emerald-400">✓ Keep up the good health habits!</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveWatchScreen('storage')}
                        className="w-full py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Check Offline Storage</span>
                        <ChevronRight size={12} />
                      </button>
                    </motion.div>
                  )}

                  {activeWatchScreen === 'storage' && (
                    <motion.div 
                      key="watch-storage"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col justify-between text-center py-1"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-left">
                        <span className="text-[11px] font-black text-cyan-300 flex items-center gap-1">
                          <Cpu size={12} />
                          Offline Storage
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">10:26</span>
                      </div>

                      <div className="my-auto space-y-1">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                          <CheckCircle2 size={22} />
                        </div>
                        <p className="text-xs font-black text-white">Data Stored Successfully</p>
                        <p className="text-sm font-black text-cyan-300 font-mono">{storedDataMB} MB</p>
                        <span className="text-[8px] text-slate-400 uppercase tracking-wider">(Last 7 days offline)</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveWatchScreen('ecg')}
                        className="w-full py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-[10px] font-black text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <span>View Live ECG</span>
                        <ChevronRight size={12} />
                      </button>
                    </motion.div>
                  )}

                  {activeWatchScreen === 'ecg' && (
                    <motion.div 
                      key="watch-ecg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col justify-between text-left py-1"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                        <span className="text-[11px] font-black text-cyan-300 flex items-center gap-1">
                          <Activity size={12} />
                          Live ECG
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">10:27</span>
                      </div>

                      <div className="h-14 w-full bg-[#051126] rounded-xl border border-blue-500/30 p-1 flex items-center justify-center overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path
                            d="M 0,15 L 20,15 L 25,6 L 30,24 L 35,2 L 40,28 L 45,15 L 65,15 L 70,6 L 75,24 L 80,2 L 85,28 L 90,15 L 100,15"
                            fill="none"
                            stroke="#00e5ff"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <div className="flex items-center justify-between text-[10px] px-1 font-bold">
                        <span className="text-emerald-400">✓ Normal Rhythm</span>
                        <span className="text-white">{heartRate} bpm</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveEcgReport}
                        className="w-full py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] font-black text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                      >
                        <Download size={11} />
                        <span>Save Report</span>
                      </button>
                    </motion.div>
                  )}

                  {activeWatchScreen === 'sleep' && (
                    <motion.div 
                      key="watch-sleep"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col justify-between text-left py-1"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                        <span className="text-[11px] font-black text-indigo-300 flex items-center gap-1">
                          <Moon size={12} />
                          Sleep & Wellness
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">06:45</span>
                      </div>

                      <div className="flex items-center justify-center gap-3 py-1">
                        <div className="w-12 h-12 rounded-full border-4 border-cyan-400 flex items-center justify-center text-center">
                          <span className="text-[10px] font-black text-white leading-none">7h 20m</span>
                        </div>
                        <div className="text-[9px] space-y-0.5">
                          <p className="text-cyan-300 font-bold">• Deep: 2h 10m</p>
                          <p className="text-purple-300 font-bold">• Light: 4h 30m</p>
                          <p className="text-pink-300 font-bold">• REM: 0h 40m</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveWatchScreen('main')}
                        className="w-full py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Return to Watch Face</span>
                      </button>
                    </motion.div>
                  )}

                  {activeWatchScreen === 'sync' && (
                    <motion.div 
                      key="watch-sync"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col justify-between text-center py-2"
                    >
                      <span className="text-[11px] font-black text-cyan-300 flex items-center justify-center gap-1">
                        <Bluetooth size={12} className="animate-spin" />
                        Syncing with Doctorian...
                      </span>

                      <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-400/40 mx-auto flex items-center justify-center text-cyan-300">
                        <Heart size={20} className="animate-pulse" />
                      </div>

                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
                        <motion.div 
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${syncProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400 font-black">{syncProgress}%</span>
                    </motion.div>
                  )}

                  {activeWatchScreen === 'ready' && (
                    <motion.div 
                      key="watch-ready"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col justify-between text-center py-2"
                    >
                      <span className="text-[11px] font-black text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 size={12} />
                        Analysis Ready
                      </span>

                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 mx-auto flex items-center justify-center text-emerald-300 shadow-lg">
                        <FileText size={20} />
                      </div>

                      <p className="text-xs font-black text-white">Your health report is ready!</p>

                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigate) onNavigate('records');
                          toast('Opening Clinical Records with synced watch telemetry', 'success');
                        }}
                        className="w-full py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-[10px] font-black text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                      >
                        <span>View on App →</span>
                      </button>
                    </motion.div>
                  )}

                </div>

                {/* Dot Switcher */}
                <div className="flex items-center justify-center gap-1.5 pb-1 z-10">
                  {(['main', 'overview', 'insights', 'storage', 'ecg', 'sleep'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setActiveWatchScreen(s)}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        activeWatchScreen === s ? 'bg-cyan-400 w-3' : 'bg-slate-600 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

              </div>

            </div>

            <div className="absolute -bottom-8 w-44 h-12 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-full border-t border-cyan-400/30 shadow-[0_15px_30px_rgba(0,0,0,0.8)] -z-10 flex items-center justify-center">
              <div className="w-36 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-pulse" />
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center mt-10">
            Interactive Watch OS Simulator. Tap any screen or dot to navigate.
          </p>

        </div>

        {/* Center: 7 Watch Screens Showcase */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" />
              <span>Doctorian Watch OS Interfaces</span>
            </h3>
            <span className="text-xs font-bold text-cyan-400">7 Connected Modules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Screen 1: Health Overview */}
            <div 
              onClick={() => setActiveWatchScreen('overview')}
              className={`p-3.5 rounded-2xl bg-[#071329] border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:border-cyan-400/80 ${
                activeWatchScreen === 'overview' ? 'border-cyan-400 shadow-md shadow-cyan-500/20' : 'border-blue-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="flex items-center gap-1 text-white">
                  <Heart size={12} className="text-purple-400 fill-purple-400" />
                  Health Overview
                </span>
                <span className="text-[9px] text-slate-400 font-mono">10:24</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                  <span className="text-[10px] text-slate-300">Heart Rate</span>
                  <span className="text-[11px] font-black text-white">{heartRate} bpm</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                  <span className="text-[10px] text-slate-300">Blood Oxygen</span>
                  <span className="text-[11px] font-black text-white">{spo2}%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                  <span className="text-[10px] text-slate-300">Body Temp</span>
                  <span className="text-[11px] font-black text-white">{temperature} °C</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                  <span className="text-[10px] text-slate-300">Blood Pressure</span>
                  <span className="text-[11px] font-black text-white">{bloodPressure}</span>
                </div>
              </div>

              <span className="text-[9px] font-bold text-cyan-400 text-center block pt-1">
                Tap to load on watch →
              </span>
            </div>

            {/* Screen 2: AI Insights */}
            <div 
              onClick={() => setActiveWatchScreen('insights')}
              className={`p-3.5 rounded-2xl bg-[#071329] border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:border-cyan-400/80 ${
                activeWatchScreen === 'insights' ? 'border-cyan-400 shadow-md shadow-cyan-500/20' : 'border-blue-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="flex items-center gap-1 text-white">
                  <Sparkles size={12} className="text-cyan-400" />
                  AI Insights
                </span>
                <span className="text-[9px] text-slate-400 font-mono">10:25</span>
              </div>

              <div className="relative h-20 rounded-xl bg-gradient-to-b from-blue-950/60 to-black flex items-center justify-center overflow-hidden border border-cyan-500/20">
                <div className="w-8 h-8 rounded-full bg-cyan-400/20 blur-md absolute" />
                <span className="text-2xl">🧍‍♂️</span>
              </div>

              <div className="text-[9px] space-y-0.5 text-slate-300">
                <p className="font-bold text-white text-[10px]">Vitals are stable</p>
                <p className="text-emerald-400">✓ No abnormality</p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveWatchScreen('insights');
                }}
                className="w-full py-1 rounded-lg bg-blue-600/80 text-[10px] font-bold text-white text-center cursor-pointer"
              >
                View Details →
              </button>
            </div>

            {/* Screen 3: Offline Storage */}
            <div 
              onClick={() => setActiveWatchScreen('storage')}
              className={`p-3.5 rounded-2xl bg-[#071329] border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:border-cyan-400/80 ${
                activeWatchScreen === 'storage' ? 'border-cyan-400 shadow-md shadow-cyan-500/20' : 'border-blue-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="flex items-center gap-1 text-white">
                  <Cpu size={12} className="text-cyan-400" />
                  Offline Storage
                </span>
                <span className="text-[9px] text-slate-400 font-mono">10:26</span>
              </div>

              <div className="text-center py-1 space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={16} />
                </div>
                <p className="text-[10px] font-black text-white">Data Stored</p>
                <p className="text-sm font-black text-cyan-300 font-mono">{storedDataMB} MB</p>
                <span className="text-[8px] text-slate-400">(Last 7 days)</span>
              </div>

              <div className="p-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[8px] text-purple-200 text-center leading-tight">
                Syncs with Doctorian App when connected
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Screen 4: Live ECG */}
            <div 
              onClick={() => setActiveWatchScreen('ecg')}
              className={`p-3.5 rounded-2xl bg-[#071329] border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:border-cyan-400/80 ${
                activeWatchScreen === 'ecg' ? 'border-cyan-400 shadow-md shadow-cyan-500/20' : 'border-blue-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-cyan-400 flex items-center gap-1">
                  <Activity size={12} />
                  Live ECG
                </span>
                <span className="text-[9px] text-slate-400 font-mono">10:27</span>
              </div>

              <div className="h-10 w-full bg-black/60 rounded-lg flex items-center justify-center px-1">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,12 L30,12 L35,4 L40,20 L45,2 L50,22 L55,12 L100,12" fill="none" stroke="#00e5ff" strokeWidth="2" />
                </svg>
              </div>

              <div className="text-[9px] font-bold text-emerald-400 flex items-center justify-between">
                <span>✓ Normal Rhythm</span>
                <span className="text-white">{heartRate} bpm</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEcgReport();
                }}
                className="w-full py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download size={10} />
                <span>Save Report</span>
              </button>
            </div>

            {/* Screen 5: Sleep */}
            <div 
              onClick={() => setActiveWatchScreen('sleep')}
              className={`p-3.5 rounded-2xl bg-[#071329] border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:border-cyan-400/80 ${
                activeWatchScreen === 'sleep' ? 'border-cyan-400 shadow-md shadow-cyan-500/20' : 'border-blue-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-indigo-300 flex items-center gap-1">
                  <Moon size={12} />
                  Sleep
                </span>
                <span className="text-[9px] text-slate-400 font-mono">06:45</span>
              </div>

              <div className="text-center py-0.5">
                <div className="w-9 h-9 rounded-full border-2 border-cyan-400 mx-auto flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">7h 20m</span>
                </div>
                <span className="text-[8px] text-slate-400 font-bold mt-1 block">Good Sleep</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveWatchScreen('sleep');
                }}
                className="w-full py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-[10px] font-bold text-white text-center cursor-pointer"
              >
                Sleep Details →
              </button>
            </div>

            {/* Screen 6: Syncing */}
            <div 
              onClick={() => setActiveWatchScreen('sync')}
              className={`p-3.5 rounded-2xl bg-[#071329] border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:border-cyan-400/80 ${
                activeWatchScreen === 'sync' ? 'border-cyan-400 shadow-md shadow-cyan-500/20' : 'border-blue-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-cyan-300 flex items-center gap-1">
                  <Bluetooth size={12} />
                  Syncing
                </span>
                <span className="text-[9px] text-slate-400 font-mono">Real-time</span>
              </div>

              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 mx-auto flex items-center justify-center text-cyan-300">
                <Heart size={16} className="animate-pulse" />
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-3/4 rounded-full" />
              </div>

              <span className="text-[9px] font-mono text-cyan-400 font-black text-center block">
                {syncProgress}% Complete
              </span>
            </div>

            {/* Screen 7: Analysis Ready */}
            <div 
              onClick={() => setActiveWatchScreen('ready')}
              className={`p-3.5 rounded-2xl bg-[#071329] border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:border-cyan-400/80 ${
                activeWatchScreen === 'ready' ? 'border-cyan-400 shadow-md shadow-cyan-500/20' : 'border-blue-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Analysis Ready
                </span>
                <span className="text-[9px] text-slate-400 font-mono">10:32</span>
              </div>

              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 mx-auto flex items-center justify-center text-emerald-300">
                <FileText size={16} />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigate) onNavigate('records');
                  toast('Viewing report on Doctorian Phone App', 'success');
                }}
                className="w-full py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-black text-white text-center cursor-pointer shadow-sm"
              >
                View on App →
              </button>
            </div>

          </div>

        </div>

        {/* Right: Smart Features & Sync */}
        <div className="lg:col-span-3 space-y-5">
          
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#071633] via-[#051126] to-[#030914] border border-blue-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Smart Features
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  ✨
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">Offline AI Analysis</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Works without phone</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                  🔄
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">Auto Sync</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">When connected</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-400 shrink-0">
                  🔔
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">Health Alerts</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Instant notifications</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                  🔋
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">Long Battery Life</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Up to 7 days</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400 shrink-0">
                  🎛️
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">Multi-Sensor Support</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Heart, SpO2, Temp, etc.</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-900/50 flex items-center gap-2">
              <img src="/assets/aistudio/image_3d2127ab.png" alt="" className="w-5 h-5 rounded-md object-contain" />
              <span className="text-[11px] font-black text-cyan-300">
                Powered by Doctorian AI
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#091b3b] via-[#06142c] to-[#020a17] border border-cyan-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Seamless Sync
              </h3>
            </div>

            <p className="text-xs text-blue-200/90 leading-relaxed font-normal">
              Even if the Doctorian app is far, your watch will continue storing data and generating analysis. Once connected, all information will be synced automatically.
            </p>

            <div className="p-3 rounded-2xl bg-[#040e21] border border-blue-900/60 flex items-center justify-between gap-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Watch size={20} />
                </div>
                <span className="text-[9px] font-bold text-slate-300 mt-1">Watch OS</span>
                <span className="text-[8px] text-cyan-400 font-mono">472 MB</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-1">
                <div className="flex items-center gap-1 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[10px] font-mono font-bold tracking-widest">
                    {connectionMode === 'near' ? 'BLUETOOTH' : 'OFFLINE STORE'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 mt-1 rounded-full animate-pulse" />
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 p-1">
                  <img src="/assets/aistudio/image_3d2127ab.png" alt="" className="w-full h-full object-contain rounded-md" />
                </div>
                <span className="text-[9px] font-bold text-slate-300 mt-1">Doctorian</span>
                <span className="text-[8px] text-emerald-400 font-mono">App Sync</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerSync}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              <span>{connectionMode === 'near' ? 'Trigger Instant Phone Sync' : 'Re-link & Sync Watch'}</span>
            </button>
          </div>

        </div>

      </div>

      <footer className="w-full rounded-2xl bg-[#061229] border border-blue-900/60 p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-300">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck size={14} className="text-cyan-400" />
            Secure & Private
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <WifiOff size={14} className="text-emerald-400" />
            Offline Capable
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Heart size={14} className="text-red-400 fill-red-400" />
            Smart Health Companion
          </span>
        </div>

        <p className="font-serif italic font-extrabold text-white text-xs sm:text-sm tracking-wide">
          Doctorian Smart Watch – <span className="text-cyan-300">Your Health, Always in Your Hands.</span>
        </p>
      </footer>

    </div>
  );
};

export default DoctorianSmartWatchOS;
