import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Eye, 
  Clock, 
  Globe, 
  Sliders, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Zap, 
  RefreshCw,
  Compass,
  Sparkles
} from 'lucide-react';
import { 
  getThemeSchedulerConfig, 
  saveThemeSchedulerConfig, 
  evaluateThemeSchedule, 
  fetchSolarTimes,
  ThemeSchedulerConfig, 
  SolarEvaluationResult 
} from '../utils/themeScheduler';

interface ThemeSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTheme: (isDark: boolean, isEyeCare: boolean) => void;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ThemeSchedulerModal: React.FC<ThemeSchedulerModalProps> = ({
  isOpen,
  onClose,
  onApplyTheme,
  addToast
}) => {
  const [config, setConfig] = useState<ThemeSchedulerConfig>(getThemeSchedulerConfig());
  const [evaluation, setEvaluation] = useState<SolarEvaluationResult>(evaluateThemeSchedule());
  const [isRefreshingSolar, setIsRefreshingSolar] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getThemeSchedulerConfig();
      setConfig(currentConfig);
      setEvaluation(evaluateThemeSchedule(new Date(), currentConfig));
    }
  }, [isOpen]);

  // Live clock interval
  useEffect(() => {
    if (!isOpen) return;
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setEvaluation(evaluateThemeSchedule(now, config));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleToggleEnabled = () => {
    const updated = saveThemeSchedulerConfig({ enabled: !config.enabled });
    setConfig(updated);
    if (updated.enabled) {
      const evalRes = evaluateThemeSchedule(new Date(), updated);
      onApplyTheme(evalRes.isDarkMode, evalRes.isEyeCareMode);
      addToast?.('✨ Solar Theme Scheduler activated! Themes now adjust automatically.', 'success');
    } else {
      addToast?.('Theme Scheduler paused. Manual controls now active.', 'info');
    }
  };

  const handleModeChange = (mode: ThemeSchedulerConfig['mode']) => {
    const updated = saveThemeSchedulerConfig({ mode });
    setConfig(updated);
    const evalRes = evaluateThemeSchedule(new Date(), updated);
    setEvaluation(evalRes);
    if (updated.enabled) {
      onApplyTheme(evalRes.isDarkMode, evalRes.isEyeCareMode);
    }
  };

  const handleSyncSolar = async () => {
    setIsRefreshingSolar(true);
    const proceedWithCoords = async (lat: number, lon: number) => {
      const result = await fetchSolarTimes(lat, lon);
      setIsRefreshingSolar(false);
      const updated = getThemeSchedulerConfig();
      setConfig(updated);
      const evalRes = evaluateThemeSchedule(new Date(), updated);
      setEvaluation(evalRes);
      if (updated.enabled) {
        onApplyTheme(evalRes.isDarkMode, evalRes.isEyeCareMode);
      }
      if (result) {
        addToast?.(`✨ Solar data synced! Sunrise: ${evalRes.sunriseTimeStr}, Sunset: ${evalRes.sunsetTimeStr}`, 'success');
      } else {
        addToast?.('Using solar time approximation.', 'info');
      }
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => proceedWithCoords(pos.coords.latitude, pos.coords.longitude),
        () => proceedWithCoords(config.latitude || 37.7749, config.longitude || -122.4194),
        { timeout: 5000 }
      );
    } else {
      proceedWithCoords(config.latitude || 37.7749, config.longitude || -122.4194);
    }
  };

  const handleUpdateConfigValue = (key: keyof ThemeSchedulerConfig, val: any) => {
    const updated = saveThemeSchedulerConfig({ [key]: val });
    setConfig(updated);
    const evalRes = evaluateThemeSchedule(new Date(), updated);
    setEvaluation(evalRes);
    if (updated.enabled) {
      onApplyTheme(evalRes.isDarkMode, evalRes.isEyeCareMode);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sun size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Solar Theme Scheduler
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Circadian AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated dark/light & eye-care modes based on solar position and local time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Main Status Display */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                <span className="text-xs font-mono font-bold text-slate-300">Local Time: <strong className="text-white">{currentTimeStr}</strong></span>
              </div>
              <button
                onClick={handleToggleEnabled}
                className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  config.enabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{config.enabled ? 'Scheduler Active' : 'Scheduler Paused'}</span>
              </button>
            </div>

            {/* Current Phase Card */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${
                  evaluation.phaseName === 'Daylight'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : evaluation.phaseName === 'Late Night Circadian'
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                    : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                }`}>
                  {evaluation.phaseName === 'Daylight' ? <Sun size={22} /> : evaluation.phaseName === 'Late Night Circadian' ? <Eye size={22} /> : <Moon size={22} />}
                </div>
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-slate-400">Current Phase</h4>
                  <p className="text-sm font-black text-white">{evaluation.phaseName}</p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${evaluation.isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {evaluation.isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  {evaluation.isEyeCareMode && (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-500/20 text-purple-300">
                      Eye-Care Warm Tint
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">{evaluation.nextChangeMessage}</p>
              </div>
            </div>

            {/* Solar Data Times */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Sun size={14} className="text-amber-400" />
                  <span>Sunrise:</span>
                </span>
                <span className="font-mono font-black text-amber-300">{evaluation.sunriseTimeStr}</span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Moon size={14} className="text-indigo-400" />
                  <span>Sunset:</span>
                </span>
                <span className="font-mono font-black text-indigo-300">{evaluation.sunsetTimeStr}</span>
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
              Scheduling Mode
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'solar', label: 'Solar Geolocation', icon: <Globe size={14} /> },
                { id: 'custom', label: 'Custom Hours', icon: <Sliders size={14} /> },
                { id: 'circadian', label: 'Circadian Only', icon: <Eye size={14} /> }
              ].map((m, mIdx) => (
                <button
                  key={`sched-mode-${m.id}-${mIdx}`}
                  onClick={() => handleModeChange(m.id as any)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    config.mode === m.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Specific Controls */}
          {config.mode === 'solar' && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Geolocation Solar Sync</h4>
                  <p className="text-[11px] text-slate-400">Uses Open-Meteo API to calculate precise sunrise and sunset</p>
                </div>
                <button
                  onClick={handleSyncSolar}
                  disabled={isRefreshingSolar}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={14} className={isRefreshingSolar ? 'animate-spin' : ''} />
                  <span>Sync Solar Data</span>
                </button>
              </div>
            </div>
          )}

          {config.mode === 'custom' && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Day Mode Starts (Sunrise)
                </label>
                <input
                  type="time"
                  value={config.customSunrise}
                  onChange={(e) => handleUpdateConfigValue('customSunrise', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Night Mode Starts (Sunset)
                </label>
                <input
                  type="time"
                  value={config.customSunset}
                  onChange={(e) => handleUpdateConfigValue('customSunset', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* Circadian Eye-Care Late Night Protection */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Eye size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Late Night Circadian Eye-Care</h4>
                  <p className="text-[11px] text-slate-400">Applies warm, glare-reducing amber filter during late hours</p>
                </div>
              </div>

              <button
                onClick={() => handleUpdateConfigValue('autoEyeCare', !config.autoEyeCare)}
                className={`w-12 h-6 rounded-full transition-all cursor-pointer p-1 relative ${
                  config.autoEyeCare ? 'bg-purple-600' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                  config.autoEyeCare ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {config.autoEyeCare && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 uppercase block">
                    Eye Care Start Time
                  </label>
                  <input
                    type="time"
                    value={config.eyeCareStart}
                    onChange={(e) => handleUpdateConfigValue('eyeCareStart', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 uppercase block">
                    Eye Care End Time
                  </label>
                  <input
                    type="time"
                    value={config.eyeCareEnd}
                    onChange={(e) => handleUpdateConfigValue('eyeCareEnd', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              const evalRes = evaluateThemeSchedule(new Date(), config);
              onApplyTheme(evalRes.isDarkMode, evalRes.isEyeCareMode);
              addToast?.('Theme forcesynced with schedule!', 'success');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider hover:bg-amber-500/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Zap size={14} />
            <span>Apply Now</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
