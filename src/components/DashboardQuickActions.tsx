import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellOff,
  Lightbulb,
  Sparkles,
  Activity,
  Pill,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  VolumeX,
  Clock,
  UserCheck,
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Mic
} from 'lucide-react';
import { VitalsSonifier } from '../utils/vitalsSonifier';
import {
  TargetedMedicationAlarmSystem,
  TargetedAccountAlarm
} from '../utils/targetedMedicationAlarmSystem';

export interface DashboardQuickActionsProps {
  user: any;
  hourlyTipEnabled: boolean;
  onToggleHourlyTip: (enabled: boolean) => void;
  onNavigate?: (view: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export type TargetedMedAlarm = TargetedAccountAlarm;

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  user,
  hourlyTipEnabled,
  onToggleHourlyTip,
  onNavigate,
  onShowToast
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // 1. Silence Vitals Alerts state
  const [silenceVitalsAlerts, setSilenceVitalsAlerts] = useState<boolean>(() => {
    try {
      return localStorage.getItem('doctorian_silence_vitals_alerts') === 'true';
    } catch {
      return false;
    }
  });

  // 2. High Precision vs Eco Telemetry
  const [ecoTelemetryMode, setEcoTelemetryMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('doctorian_eco_telemetry') === 'true';
    } catch {
      return false;
    }
  });

  // 3. Bedside Night Low-Lumens Mode
  const [bedsideNightMode, setBedsideNightMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('doctorian_bedside_night_mode') === 'true';
    } catch {
      return false;
    }
  });

  // 4. Account-Specific Medication Dose Alarm
  const [targetedAlarms, setTargetedAlarms] = useState<TargetedAccountAlarm[]>(() => {
    return TargetedMedicationAlarmSystem.getAlarmsForUser(user);
  });

  useEffect(() => {
    const refreshUserAlarms = () => {
      setTargetedAlarms(TargetedMedicationAlarmSystem.getAlarmsForUser(user));
    };

    refreshUserAlarms();
    window.addEventListener('doctorian:targeted_alarms_updated', refreshUserAlarms);
    return () => {
      window.removeEventListener('doctorian:targeted_alarms_updated', refreshUserAlarms);
    };
  }, [user]);

  const [activeAccountAlarmModal, setActiveAccountAlarmModal] = useState<TargetedAccountAlarm | null>(null);

  // Sync Vitals Alerts Silence toggle
  const handleToggleSilenceVitals = () => {
    const next = !silenceVitalsAlerts;
    setSilenceVitalsAlerts(next);
    try {
      localStorage.setItem('doctorian_silence_vitals_alerts', String(next));
      // Mute/unmute the sonifier as well so auditory feedback is quieted
      VitalsSonifier.setEnabled(!next);
      window.dispatchEvent(
        new CustomEvent('doctorian:vitals_sound_setting_update', {
          detail: { enabled: !next }
        })
      );
    } catch {}

    const msg = next
      ? '🔇 Vitals anomaly alarms silenced for bedside rest.'
      : '🔔 Vitals anomaly alarms are now LIVE and will chime on threshold alerts.';
    onShowToast?.(msg, next ? 'info' : 'success');
  };

  // Sync Hourly Health-Tip toggle
  const handleToggleHourlyTip = () => {
    const next = !hourlyTipEnabled;
    onToggleHourlyTip(next);
    const msg = next
      ? '✨ Hourly clinical AI health tips enabled on your dashboard.'
      : '💡 Hourly health tips hidden for a simplified, low-clutter view.';
    onShowToast?.(msg, next ? 'success' : 'info');
  };

  // Sync Eco Telemetry toggle
  const handleToggleEcoTelemetry = () => {
    const next = !ecoTelemetryMode;
    setEcoTelemetryMode(next);
    try {
      localStorage.setItem('doctorian_eco_telemetry', String(next));
      window.dispatchEvent(
        new CustomEvent('doctorian:eco_telemetry_update', {
          detail: { ecoMode: next }
        })
      );
    } catch {}

    const msg = next
      ? '🌱 Eco Telemetry active: background sensor refresh throttled to save device battery.'
      : '⚡ 60Hz High-Precision live telemetry stream restored.';
    onShowToast?.(msg, 'info');
  };

  // Sync Bedside Night Mode toggle
  const handleToggleBedsideMode = () => {
    const next = !bedsideNightMode;
    setBedsideNightMode(next);
    try {
      localStorage.setItem('doctorian_bedside_night_mode', String(next));
      if (next) {
        document.documentElement.classList.add('doctorian-bedside-dim');
      } else {
        document.documentElement.classList.remove('doctorian-bedside-dim');
      }
    } catch {}

    const msg = next
      ? '🌙 Bedside Night Mode engaged: glare minimized for sleep monitoring.'
      : '☀️ Standard clinical display contrast restored.';
    onShowToast?.(msg, 'info');
  };

  // Toggle specific account alarm
  const handleToggleAccountAlarm = (alarmId: string) => {
    const alarm = targetedAlarms.find((a) => a.id === alarmId);
    if (!alarm) return;
    const nextState = !alarm.enabled;
    TargetedMedicationAlarmSystem.toggleAlarm(alarmId, nextState);
    onShowToast?.(`Medication alarm ${nextState ? 'enabled' : 'muted'} specifically for this account.`, 'success');
  };

  // Mark dose taken
  const handleMarkDoseTaken = (alarmId: string) => {
    TargetedMedicationAlarmSystem.recordDoseTaken(alarmId, user);
    setActiveAccountAlarmModal(null);
    onShowToast?.('✅ Dose confirmed taken. Logged to your personal clinical record.', 'success');
  };

  // Test account alarm specifically
  const handleTestAccountAlarm = (alarm: TargetedAccountAlarm) => {
    TargetedMedicationAlarmSystem.dispatchTargetedAlarm(alarm);
  };

  const activeAlarmsCount = targetedAlarms.filter((a) => a.enabled).length;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xl transition-all relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Sliders size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">
                Quick Actions
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono uppercase tracking-wider">
                1-Tap Toggles
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Instantly toggle vital alarms, hourly health tips & account-specific medication alerts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title={isExpanded ? 'Collapse Quick Actions' : 'Expand Quick Actions'}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Quick Action Toggles Grid */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 pt-1"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* 1. SILENCE VITALS ALERTS TOGGLE */}
              <div
                role="button"
                tabIndex={0}
                onClick={handleToggleSilenceVitals}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleSilenceVitals();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between text-left group ${
                  silenceVitalsAlerts
                    ? 'bg-amber-500/10 border-amber-500/40 dark:border-amber-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      silenceVitalsAlerts
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {silenceVitalsAlerts ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </div>

                  {/* Switch Pill */}
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      silenceVitalsAlerts ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                      className={`w-5 h-5 rounded-full bg-white shadow-sm ${
                        silenceVitalsAlerts ? 'ml-auto' : 'ml-0'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      Vitals Sound Alert
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                        silenceVitalsAlerts
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {silenceVitalsAlerts ? 'Muted' : 'Live'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {silenceVitalsAlerts
                      ? 'Anomaly alarms silenced for uninterrupted rest'
                      : 'Audio chimes active for abnormal BP, SpO2 & HR'}
                  </p>
                </div>
              </div>

              {/* 2. HOURLY HEALTH-TIP DISPLAY TOGGLE */}
              <div
                role="button"
                tabIndex={0}
                onClick={handleToggleHourlyTip}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleHourlyTip();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between text-left group ${
                  hourlyTipEnabled
                    ? 'bg-blue-500/10 border-blue-500/40 dark:border-blue-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      hourlyTipEnabled
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    <Lightbulb size={18} />
                  </div>

                  {/* Switch Pill */}
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      hourlyTipEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                      className={`w-5 h-5 rounded-full bg-white shadow-sm ${
                        hourlyTipEnabled ? 'ml-auto' : 'ml-0'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      Hourly Health-Tip
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                        hourlyTipEnabled
                          ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {hourlyTipEnabled ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {hourlyTipEnabled
                      ? 'AI cellular vitality & clinical tips displayed'
                      : 'Tips hidden for a simplified, low-distraction view'}
                  </p>
                </div>
              </div>

              {/* 3. ECO / CONTINUOUS WAVEFORM STREAM */}
              <div
                role="button"
                tabIndex={0}
                onClick={handleToggleEcoTelemetry}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleEcoTelemetry();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between text-left group ${
                  ecoTelemetryMode
                    ? 'bg-emerald-500/10 border-emerald-500/40 dark:border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      ecoTelemetryMode
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    <Activity size={18} />
                  </div>

                  {/* Switch Pill */}
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      ecoTelemetryMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                      className={`w-5 h-5 rounded-full bg-white shadow-sm ${
                        ecoTelemetryMode ? 'ml-auto' : 'ml-0'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      Eco Sensor Mode
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                        ecoTelemetryMode
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {ecoTelemetryMode ? 'Battery Saver' : '60Hz Pro'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {ecoTelemetryMode
                      ? 'Throttles sensor refresh to extend phone battery'
                      : 'Full precision high-speed waveform rendering'}
                  </p>
                </div>
              </div>

              {/* 4. BEDSIDE NIGHT LOW-LUMENS MODE */}
              <div
                role="button"
                tabIndex={0}
                onClick={handleToggleBedsideMode}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleBedsideMode();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between text-left group ${
                  bedsideNightMode
                    ? 'bg-indigo-500/10 border-indigo-500/40 dark:border-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      bedsideNightMode
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {bedsideNightMode ? <Moon size={18} /> : <Sun size={18} />}
                  </div>

                  {/* Switch Pill */}
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      bedsideNightMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                      className={`w-5 h-5 rounded-full bg-white shadow-sm ${
                        bedsideNightMode ? 'ml-auto' : 'ml-0'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      Bedside Low-Lumens
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                        bedsideNightMode
                          ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {bedsideNightMode ? 'Active' : 'Standard'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {bedsideNightMode
                      ? 'Gentle amber-night illumination for resting state'
                      : 'Standard contrast for daytime clinical viewing'}
                  </p>
                </div>
              </div>

              {/* 5. AMBIENT MULTILINGUAL SOAP SCRIBE */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (onNavigate) onNavigate('ambient_scribe');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onNavigate) onNavigate('ambient_scribe');
                  }
                }}
                className="p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between text-left group bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border-blue-500/30 hover:border-blue-500/60 hover:shadow-md hover:shadow-blue-500/10 col-span-1 sm:col-span-2 lg:col-span-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                      <Mic size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Ambient Clinical SOAP Scribe
                      </span>
                      <span className="ml-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        Offline & Mesh Ready
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    Launch Scribe →
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Real-time bedside consultation listening, multilingual speech-to-SOAP structuring (English, Oluganda, Kiswahili), ICD-10 coding, and peer mesh sync for clinic tablets.
                </p>
              </div>
            </div>

            {/* 5. TARGETED ACCOUNT-SPECIFIC MEDICATION DOSE ALARMS (Authorized by Admin) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 border border-purple-200/80 dark:border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0 mt-0.5 sm:mt-0">
                  <Pill size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                      Targeted Account Medication Alarms
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      <ShieldCheck size={11} />
                      Admin-Authorized for {user?.name || user?.displayName || 'This Account Only'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Isolated to this session only. Other clinic devices and general app accounts are never disturbed.
                  </p>
                </div>
              </div>

              {/* Doses Strip & Test Trigger */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                {targetedAlarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleAccountAlarm(alarm.id)}
                      className="cursor-pointer focus:outline-none"
                      title={alarm.enabled ? 'Mute this dose alarm' : 'Enable this dose alarm'}
                    >
                      {alarm.enabled ? (
                        <Bell size={14} className="text-purple-600 dark:text-purple-400 animate-pulse" />
                      ) : (
                        <BellOff size={14} className="text-slate-400" />
                      )}
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-none">
                        {alarm.medicationName.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                        {alarm.scheduleTimes ? alarm.scheduleTimes.join(', ') : (alarm as any).scheduleTime || '08:00'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestAccountAlarm(alarm)}
                      className="text-[9.5px] px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                      {alarm.status === 'taken' || alarm.takenToday ? 'Taken ✓' : 'Alarm Test'}
                    </button>
                  </div>
                ))}

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('meds')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer shrink-0"
                  >
                    Manage Rx →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account-Specific Dose Alarm Modal Trigger */}
      <AnimatePresence>
        {activeAccountAlarmModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAccountAlarmModal(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-500/30 overflow-hidden text-center z-10"
            >
              <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border-2 border-purple-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Bell size={28} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 mb-3">
                <ShieldCheck size={12} />
                Targeted Account Dose Reminder
              </div>

              <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">
                {activeAccountAlarmModal.medicationName}
              </h3>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
                {activeAccountAlarmModal.dosage} • Scheduled for {activeAccountAlarmModal.scheduleTimes ? activeAccountAlarmModal.scheduleTimes.join(', ') : activeAccountAlarmModal.scheduleTime || '08:00'}
              </p>

              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Target Account:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeAccountAlarmModal.targetAccountName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Authorization:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {activeAccountAlarmModal.adminAuthorization?.adminName || activeAccountAlarmModal.authorizedByAdmin || 'Clinical Administrator'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Broadcast Scope:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    Single Account Only (No app disruption)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveAccountAlarmModal(null)}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Snooze 10m
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkDoseTaken(activeAccountAlarmModal.id)}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  Mark Taken
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
