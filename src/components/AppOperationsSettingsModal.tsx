import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, X, Shield, Activity, Radio, Cpu, Bell, Volume2, 
  Database, Lock, Zap, Check, RotateCcw, AlertTriangle, 
  Smartphone, Layers, Clock, Sliders
} from 'lucide-react';
import { 
  getOperationsConfig, 
  saveOperationsConfig, 
  resetOperationsConfig, 
  AppOperationsConfig, 
  OPERATIONS_CONFIG_EVENT 
} from '../utils/appOperationsConfig';

interface AppOperationsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: AppOperationsConfig) => void;
}

export const AppOperationsSettingsModal: React.FC<AppOperationsSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<AppOperationsConfig>(() => getOperationsConfig());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getOperationsConfig());
      setHasUnsavedChanges(false);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getOperationsConfig());
    };
    window.addEventListener(OPERATIONS_CONFIG_EVENT, handleUpdate);
    return () => window.removeEventListener(OPERATIONS_CONFIG_EVENT, handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleToggle = (key: keyof AppOperationsConfig['toggles']) => {
    setConfig(prev => ({
      ...prev,
      toggles: {
        ...prev.toggles,
        [key]: !prev.toggles[key]
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleModeChange = (mode: AppOperationsConfig['operatingMode']) => {
    setConfig(prev => ({ ...prev, operatingMode: mode }));
    setHasUnsavedChanges(true);
  };

  const handleRateChange = (rate: AppOperationsConfig['telemetryRate']) => {
    setConfig(prev => ({ ...prev, telemetryRate: rate }));
    setHasUnsavedChanges(true);
  };

  const handleTimeoutChange = (timeout: AppOperationsConfig['sessionTimeout']) => {
    setConfig(prev => ({ ...prev, sessionTimeout: timeout }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    const saved = saveOperationsConfig(config);
    setConfig(saved);
    setHasUnsavedChanges(false);
    setSaveSuccess(true);
    if (onConfigSaved) onConfigSaved(saved);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    const reset = resetOperationsConfig();
    setConfig(reset);
    setHasUnsavedChanges(false);
    if (onConfigSaved) onConfigSaved(reset);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col text-slate-900 dark:text-white overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-cyan-500/15 border border-blue-500/20 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Application Operations Settings</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure how Doctorian operates and toggle features according to your clinical needs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-left">
          
          {/* SECTION 1: OPERATIONAL MODE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers size={14} className="text-blue-500" />
                <span>Primary Operating Mode</span>
              </label>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                Active: {config.operatingMode.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'standard',
                  title: 'Standard Care',
                  desc: 'Comprehensive clinic workflow with balanced notifications.',
                  badge: 'Recommended'
                },
                {
                  id: 'emergency',
                  title: 'Emergency Triage',
                  desc: 'High-contrast red alerts, audio sirens, and instant QR scan.',
                  badge: 'Critical'
                },
                {
                  id: 'ambulatory',
                  title: 'Ambulatory Mute',
                  desc: 'Silent background telemetry with battery conservation.',
                  badge: 'Quiet'
                }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeChange(m.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    config.operatingMode === m.id
                      ? 'border-blue-600 dark:border-cyan-400 bg-blue-50/70 dark:bg-cyan-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        {m.title}
                      </span>
                      {config.operatingMode === m.id && (
                        <div className="w-4 h-4 rounded-full bg-blue-600 dark:bg-cyan-400 text-white dark:text-slate-950 flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {m.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: FEATURE TOGGLES (WHAT TO USE OR NOT) */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" />
              <span>Feature Toggles (Enable or Disable Operations)</span>
            </label>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden">
              {[
                {
                  key: 'arduinoTelemetry',
                  title: 'Real-time IoT Arduino Sensor Telemetry',
                  desc: 'Stream continuous live heart rate, SpO2, and bio-telemetry pulses.',
                  icon: <Activity size={16} className="text-cyan-500" />
                },
                {
                  key: 'aiVoiceConsultation',
                  title: 'Doctorian AI Diagnostic & Voice Consultation',
                  desc: 'Enable voice synthesis, spoken clinical advice, and conversational AI.',
                  icon: <Radio size={16} className="text-indigo-500" />
                },
                {
                  key: 'biometricSafeAlerts',
                  title: 'Biometric Safe Range Alerts & Red Point Highlighting',
                  desc: 'Automatically flag and pulse out-of-range heart rate and SpO2 in red.',
                  icon: <AlertTriangle size={16} className="text-rose-500" />
                },
                {
                  key: 'hourlyHealthTips',
                  title: 'Hourly Preventive Health Insights & Tips',
                  desc: 'Generate hourly encouraging medical insights on the Dashboard.',
                  icon: <Bell size={16} className="text-blue-500" />
                },
                {
                  key: 'vitalAudioSonifier',
                  title: 'Acoustic Heartbeat Sonification',
                  desc: 'Play rhythmic auditory pulse feedback synchronized with live heart rate.',
                  icon: <Volume2 size={16} className="text-purple-500" />
                },
                {
                  key: 'offlineVaultSync',
                  title: 'Offline Medical Records & QR Code Cache',
                  desc: 'Store emergency patient profiles locally for zero-latency retrieval.',
                  icon: <Database size={16} className="text-emerald-500" />
                },
                {
                  key: 'strict2FA',
                  title: 'Enhanced 2FA & Biometric Passkey Requirement',
                  desc: 'Require biometric device verification or 6-digit TOTP upon clinical sign-in.',
                  icon: <Shield size={16} className="text-amber-500" />
                },
                {
                  key: 'hapticFeedback',
                  title: 'Haptic Vibration Feedback',
                  desc: 'Provide tactile confirmation for QR scans, threshold alerts, and actions.',
                  icon: <Smartphone size={16} className="text-sky-500" />
                }
              ].map((item) => {
                const isEnabled = config.toggles[item.key as keyof AppOperationsConfig['toggles']];
                return (
                  <div 
                    key={item.key}
                    onClick={() => handleToggle(item.key as any)}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="shrink-0">
                      <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                        isEnabled ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: TELEMETRY & SECURITY PREFERENCES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Telemetry Streaming Speed */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-500" />
                <span>Telemetry Sample Frequency</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['100Hz', '1Hz', '0.1Hz'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRateChange(r)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      config.telemetryRate === r
                        ? 'border-blue-600 dark:border-cyan-400 bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {config.telemetryRate === '100Hz' ? 'Real-time oscilloscope precision (higher bandwidth).' : config.telemetryRate === '1Hz' ? 'Standard clinical evaluation rhythm.' : 'Low-frequency battery saving cadence.'}
              </p>
            </div>

            {/* Session Security Timeout */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock size={14} className="text-blue-500" />
                <span>Session Security Timeout</span>
              </label>
              <div className="grid grid-cols-4 gap-1 pt-1">
                {(['15m', '1h', '8h', '30d'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTimeoutChange(t)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      config.sessionTimeout === t
                        ? 'border-blue-600 dark:border-cyan-400 bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Automatic cryptographic logout when inactive.
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              {saveSuccess ? (
                <>
                  <Check size={14} className="text-emerald-300" />
                  <span>Settings Applied!</span>
                </>
              ) : (
                <span>Save Operations</span>
              )}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default AppOperationsSettingsModal;
