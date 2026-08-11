import React, { useState } from 'react';
import { 
  Bell, BellRing, BellOff, Volume2, VolumeX, Sliders, Database, 
  AlertTriangle, CheckCircle, Info, Radio, Trash2, ShieldAlert,
  Smartphone, MessageSquare, Clock, Zap, Play, Settings, RefreshCw, Activity,
  Heart, Wind, Thermometer, TrendingUp, TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlarmHubViewProps {
  vitals: any;
  thresholds: {
    heartRate: { min: number; max: number; warningMin: number; warningMax: number };
    temperature: { max: number; warningMax: number };
    spo2: { min: number; warningMin: number };
    systolicBP: { max: number; warningMax: number };
    diastolicBP: { max: number; warningMax: number };
    respiratoryRate: { min: number; max: number; warningMax: number };
  };
  setThresholds: React.Dispatch<React.SetStateAction<any>>;
  alarmHistory: {
    id: string;
    timestamp: string;
    priority: 'high' | 'medium' | 'low' | 'info';
    source: string;
    value: string;
    description: string;
    acknowledged: boolean;
  }[];
  clearAlarmHistory: () => void;
  isAlarmMuted: boolean;
  setIsAlarmMuted: (muted: boolean) => void;
  isHeartbeatToneEnabled: boolean;
  setIsHeartbeatToneEnabled: (enabled: boolean) => void;
  synthRef: any;
  addAlarmLog: (priority: 'high' | 'medium' | 'low' | 'info', source: string, value: string, description: string) => void;
  snoozeDuration: number;
  setSnoozeDuration: (duration: number) => void;
  isCurrentlyAcknowledged: boolean;
  alarmAcknowledgeTime: number | null;
  acknowledgeAlarm: () => void;
}

export const AlarmHubView: React.FC<AlarmHubViewProps> = ({
  vitals,
  thresholds,
  setThresholds,
  alarmHistory,
  clearAlarmHistory,
  isAlarmMuted,
  setIsAlarmMuted,
  isHeartbeatToneEnabled,
  setIsHeartbeatToneEnabled,
  synthRef,
  addAlarmLog,
  snoozeDuration,
  setSnoozeDuration,
  isCurrentlyAcknowledged,
  alarmAcknowledgeTime,
  acknowledgeAlarm,
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'info'>('all');
  
  // Real-time critical/warning verification
  const isCurrentlyCritical = vitals ? (
    vitals.heartRate < thresholds.heartRate.min || vitals.heartRate > thresholds.heartRate.max ||
    vitals.temperature > thresholds.temperature.max ||
    vitals.spo2 < thresholds.spo2.min ||
    vitals.systolicBP > thresholds.systolicBP.max ||
    vitals.diastolicBP > thresholds.diastolicBP.max ||
    vitals.respiratoryRate < thresholds.respiratoryRate.min || vitals.respiratoryRate > thresholds.respiratoryRate.max
  ) : false;

  const isCurrentlyWarning = vitals ? (
    !isCurrentlyCritical && (
      vitals.heartRate < thresholds.heartRate.warningMin || vitals.heartRate > thresholds.heartRate.warningMax ||
      vitals.temperature > thresholds.temperature.warningMax ||
      vitals.spo2 < thresholds.spo2.warningMin ||
      vitals.systolicBP > thresholds.systolicBP.warningMax ||
      vitals.diastolicBP > thresholds.diastolicBP.warningMax ||
      vitals.respiratoryRate > thresholds.respiratoryRate.warningMax
    )
  ) : false;

  const getVitalStatus = (name: string, value: number) => {
    if (!vitals) return 'normal';
    switch (name) {
      case 'heartRate':
        if (value < thresholds.heartRate.min || value > thresholds.heartRate.max) return 'critical';
        if (value < thresholds.heartRate.warningMin || value > thresholds.heartRate.warningMax) return 'warning';
        return 'normal';
      case 'spo2':
        if (value < thresholds.spo2.min) return 'critical';
        if (value < thresholds.spo2.warningMin) return 'warning';
        return 'normal';
      case 'temperature':
        if (value > thresholds.temperature.max) return 'critical';
        if (value > thresholds.temperature.warningMax) return 'warning';
        return 'normal';
      case 'systolicBP':
        if (value > thresholds.systolicBP.max) return 'critical';
        if (value > thresholds.systolicBP.warningMax) return 'warning';
        return 'normal';
      case 'diastolicBP':
        if (value > thresholds.diastolicBP.max) return 'critical';
        if (value > thresholds.diastolicBP.warningMax) return 'warning';
        return 'normal';
      case 'respiratoryRate':
        if (value < thresholds.respiratoryRate.min || value > thresholds.respiratoryRate.max) return 'critical';
        if (value > thresholds.respiratoryRate.warningMax) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  // Calculate alarm activity
  const activeAlarmMode = isCurrentlyCritical ? 'high' : isCurrentlyWarning ? 'medium' : 'none';
  
  // Custom synth controls for calibration
  const [testPitch, setTestPitch] = useState<number>(880);
  const [testDuration, setTestDuration] = useState<number>(0.15);
  const [testWave, setTestWave] = useState<'sine' | 'square' | 'triangle' | 'sawtooth'>('triangle');

  const filteredHistory = alarmHistory.filter(log => {
    if (filter === 'all') return true;
    return log.priority === filter;
  });

  const triggerTestTone = () => {
    if (synthRef.current) {
      synthRef.current.playTestTone(testPitch, testDuration, testWave);
      addAlarmLog('info', 'Audio Calibration', `${testPitch} Hz`, `Triggered test alarm tone sequence: ${testPitch}Hz, ${testDuration}s, ${testWave} wave.`);
    }
  };

  const playIecHighTest = () => {
    if (synthRef.current) {
      synthRef.current.initCtx();
      let count = 0;
      const t = setInterval(() => {
        synthRef.current.playTestTone(980, 0.08, 'triangle');
        count++;
        if (count >= 5) clearInterval(t);
      }, 150);
      addAlarmLog('high', 'IEC 60601-1-8', 'Beep Group', 'Simulated 5-pulse high-priority clinical alarm chime sequence.');
    }
  };

  const playIecMediumTest = () => {
    if (synthRef.current) {
      synthRef.current.initCtx();
      let count = 0;
      const t = setInterval(() => {
        synthRef.current.playTestTone(680, 0.15, 'sine');
        count++;
        if (count >= 3) clearInterval(t);
      }, 300);
      addAlarmLog('medium', 'IEC 60601-1-8', 'Beep Group', 'Simulated 3-pulse medium-priority clinical warning pattern.');
    }
  };

  // Helper lists of outbound notifications
  const simulatedPagerLogs = alarmHistory
    .filter(log => log.priority === 'high' || log.priority === 'medium')
    .map((log, mapIdx_165) => ({
      id: `sms-${log.id}`,
      time: log.timestamp,
      recipient: log.priority === 'high' ? 'Attending Physician & Care Team' : 'Head Nurse Relay',
      message: `ALERT DISPATCH: ${log.description}. Please investigate.`,
      status: 'Delivered',
      carrier: 'SMS Relay [TWILIO API]'
    }));

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      
      {/* Upper Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Status & Mute Control Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Active State</h3>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">IEC Safety Calibration</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                isAlarmMuted ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                alarmHistory.some(l => l.priority === 'high') ? 'bg-red-100 dark:bg-red-950/50 text-red-600 animate-pulse' :
                'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
              }`}>
                {isAlarmMuted ? 'SYSTEM MUTED' : 
                 alarmHistory.some(l => l.priority === 'high') ? 'CRITICAL DEV' : 'SAFE PARAMETERS'}
              </span>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Real-time hardware telemetry matches input metrics against custom configured safe intervals. 
              Triggers follow IEC 60601-1-8 standard acoustic specifications using high and medium priority beep sequences.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setIsAlarmMuted(!isAlarmMuted)}
                className={`flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                  isAlarmMuted 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/10' 
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border-transparent'
                }`}
              >
                {isAlarmMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                {isAlarmMuted ? 'UNMUTE AUDIBLES' : 'MUTE AUDIBLES'}
              </button>

              <button
                disabled={!isCurrentlyCritical && !isCurrentlyWarning && !isCurrentlyAcknowledged}
                onClick={() => {
                  if (snoozeDuration === 0) {
                    setSnoozeDuration(120000); // reset back to default 2 minutes
                  }
                  acknowledgeAlarm();
                }}
                className={`flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                  isCurrentlyAcknowledged
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                }`}
              >
                <BellRing size={16} className={isCurrentlyAcknowledged ? 'animate-bounce' : ''} />
                {isCurrentlyAcknowledged 
                  ? 'ALARM SNOOZED' 
                  : `SNOOZE ${snoozeDuration === 60000 ? '1M' : snoozeDuration === 300000 ? '5M' : snoozeDuration === 600000 ? '10M' : '2M'}`
                }
              </button>
            </div>

            {/* Snooze Interval Selection */}
            <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Configure Snooze Interval Limit</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "1 MIN", val: 60000 },
                  { label: "2 MIN", val: 120000 },
                  { label: "5 MIN", val: 300000 },
                  { label: "10 MIN", val: 600000 }
                ].map((opt, oIdx) => (
                  <button
                    key={`snooze-${opt.val}-${oIdx}`}
                    onClick={() => setSnoozeDuration(opt.val)}
                    className={`py-1.5 text-[9px] font-black rounded-lg border transition-all ${
                      snoozeDuration === opt.val
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {isCurrentlyAcknowledged && alarmAcknowledgeTime && snoozeDuration > 0 && (
              <div className="flex items-center justify-between text-[11px] font-medium text-amber-500 bg-amber-50 dark:bg-amber-950/10 p-3 rounded-xl">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  Snoozed until: {new Date(alarmAcknowledgeTime + snoozeDuration).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <button 
                  onClick={() => {
                    // Force disable snooze by resetting snoozeDuration to 0
                    setSnoozeDuration(0);
                    setIsAlarmMuted(false);
                  }}
                  className="underline font-bold hover:text-amber-600"
                >
                  Un-snooze
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pulse Oximeter Cardiogram & Sound Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-2xl">
                  <Activity size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Oximeter Pitch</h3>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Tone Modulation</p>
                </div>
              </div>
              <span className={`w-3 h-3 rounded-full ${isHeartbeatToneEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Provides real-time continuous acoustic tracking of cardiac events. 
              The pitch dynamically changes based on current oxygen levels (SpO2), enabling hand-free safety diagnostics in the theater.
            </p>

            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-slate-400">Current Pitch Calibration</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {vitals ? `${Math.round(480 + ((Math.max(80, Math.min(100, vitals.spo2)) - 80) / 20) * 400)} Hz` : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-500">SpO2: {vitals?.spo2 || 98}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsHeartbeatToneEnabled(!isHeartbeatToneEnabled)}
            className={`w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
              isHeartbeatToneEnabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Radio size={16} className={isHeartbeatToneEnabled ? 'animate-pulse' : ''} />
            {isHeartbeatToneEnabled ? 'HEARTBEAT BEEP: ON' : 'HEARTBEAT BEEP: OFF'}
          </button>
        </div>

        {/* Audio Synthesizer Calibration Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-500 rounded-2xl">
                  <Settings size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Audio Calibrator</h3>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Web Audio API Testbed</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500">Synth Frequency</span>
                  <span className="text-purple-600">{testPitch} Hz</span>
                </div>
                <input 
                  type="range" 
                  min="200" 
                  max="2000" 
                  value={testPitch} 
                  onChange={(e) => setTestPitch(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500">Pulse Duration</span>
                  <span className="text-purple-600">{testDuration} s</span>
                </div>
                <input 
                  type="range" 
                  min="0.05" 
                  max="1.5" 
                  step="0.05" 
                  value={testDuration} 
                  onChange={(e) => setTestDuration(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 block mb-2">Oscillator Waveform</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((wt, wIdx) => (
                    <button
                      key={`wave-${wt}-${wIdx}`}
                      onClick={() => setTestWave(wt)}
                      className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg border transition-all ${
                        testWave === wt 
                          ? 'bg-purple-100 dark:bg-purple-950/50 border-purple-300 text-purple-600' 
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-150 text-slate-500 dark:border-slate-800'
                      }`}
                    >
                      {wt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              onClick={triggerTestTone}
              className="py-3 px-1 text-[10px] font-black uppercase tracking-wider rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center justify-center gap-1.5"
            >
              <Play size={10} /> Test Tone
            </button>
            <button
              onClick={playIecHighTest}
              className="py-3 px-1 text-[10px] font-black uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center gap-1.5"
            >
              <Zap size={10} /> IEC High
            </button>
            <button
              onClick={playIecMediumTest}
              className="py-3 px-1 text-[10px] font-black uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center justify-center gap-1.5"
            >
              <Zap size={10} /> IEC Med
            </button>
          </div>
        </div>

      </div>

      {/* Real-Time Vital Signs Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">Live Guardrails Surveillance Grid</h3>
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Dynamic Patient Status Sentinel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telem_Node v4.1 Connected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {[
            {
              key: 'heartRate',
              label: 'Heart Rate',
              val: vitals?.heartRate ?? 0,
              formattedVal: vitals?.heartRate !== undefined ? `${vitals.heartRate}` : 'N/A',
              unit: 'bpm',
              icon: Heart,
              lowLimit: thresholds.heartRate.min,
              highLimit: thresholds.heartRate.max,
              warningLow: thresholds.heartRate.warningMin,
              warningHigh: thresholds.heartRate.warningMax,
              getRange: () => `Safe: ${thresholds.heartRate.min}-${thresholds.heartRate.max}`,
            },
            {
              key: 'spo2',
              label: 'Oxygen (SpO2)',
              val: vitals?.spo2 ?? 0,
              formattedVal: vitals?.spo2 !== undefined ? `${vitals.spo2}` : 'N/A',
              unit: '%',
              icon: Activity,
              lowLimit: thresholds.spo2.min,
              highLimit: 100,
              warningLow: thresholds.spo2.warningMin,
              warningHigh: 100,
              getRange: () => `Safe: >= ${thresholds.spo2.min}`,
            },
            {
              key: 'temperature',
              label: 'Temperature',
              val: vitals?.temperature ?? 0,
              formattedVal: vitals?.temperature !== undefined ? `${vitals.temperature.toFixed(1)}` : 'N/A',
              unit: '°C',
              icon: Thermometer,
              lowLimit: 35.0,
              highLimit: thresholds.temperature.max,
              warningLow: 36.0,
              warningHigh: thresholds.temperature.warningMax,
              getRange: () => `Safe: <= ${thresholds.temperature.max.toFixed(1)}`,
            },
            {
              key: 'systolicBP',
              label: 'Systolic BP',
              val: vitals?.systolicBP ?? 0,
              formattedVal: vitals?.systolicBP !== undefined ? `${vitals.systolicBP}` : 'N/A',
              unit: 'mmHg',
              icon: TrendingUp,
              lowLimit: 90,
              highLimit: thresholds.systolicBP.max,
              warningLow: 100,
              warningHigh: thresholds.systolicBP.warningMax,
              getRange: () => `Safe: <= ${thresholds.systolicBP.max}`,
            },
            {
              key: 'diastolicBP',
              label: 'Diastolic BP',
              val: vitals?.diastolicBP ?? 0,
              formattedVal: vitals?.diastolicBP !== undefined ? `${vitals.diastolicBP}` : 'N/A',
              unit: 'mmHg',
              icon: TrendingDown,
              lowLimit: 65,
              highLimit: thresholds.diastolicBP.max,
              warningLow: 70,
              warningHigh: thresholds.diastolicBP.warningMax,
              getRange: () => `Safe: <= ${thresholds.diastolicBP.max}`,
            },
            {
              key: 'respiratoryRate',
              label: 'Resp. Rate',
              val: vitals?.respiratoryRate ?? 0,
              formattedVal: vitals?.respiratoryRate !== undefined ? `${vitals.respiratoryRate}` : 'N/A',
              unit: 'rpm',
              icon: Wind,
              lowLimit: thresholds.respiratoryRate.min,
              highLimit: thresholds.respiratoryRate.max,
              warningLow: thresholds.respiratoryRate.min + 2,
              warningHigh: thresholds.respiratoryRate.warningMax,
              getRange: () => `Safe: ${thresholds.respiratoryRate.min}-${thresholds.respiratoryRate.max}`,
            },
          ].map((v, mapIdx_528) => {
            const status = getVitalStatus(v.key, Number(v.val));
            const IconComp = v.icon;

            const cardStyle = 
              status === 'critical' 
                ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-2 ring-red-500/30 animate-pulse duration-1000' 
                : status === 'warning'
                  ? 'border-amber-400 dark:border-amber-400 bg-amber-50/30 dark:bg-amber-950/10'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50';

            const statusLabel = 
              status === 'critical'
                ? 'CRIT DEVIATION'
                : status === 'warning'
                  ? 'WARN LIMIT'
                  : 'NORMAL';

            return (
              <div 
                key={v.key} 
                className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[180px] ${cardStyle}`}
              >
                {/* Visual glow indicator for critical statuses */}
                {status === 'critical' && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      {v.label}
                    </span>
                    <IconComp 
                      size={18} 
                      className={
                        status === 'critical' 
                          ? 'text-red-500 animate-bounce filter drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]' 
                          : status === 'warning'
                            ? 'text-amber-500 animate-pulse'
                            : 'text-slate-400'
                      } 
                    />
                  </div>

                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-4xl font-black tracking-tighter ${
                      status === 'critical' 
                        ? 'text-red-650 dark:text-red-400 font-extrabold' 
                        : status === 'warning'
                          ? 'text-amber-600 dark:text-amber-405'
                          : 'text-slate-800 dark:text-slate-105'
                    }`}>
                      {v.formattedVal}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{v.unit}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-150/50 dark:border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {v.getRange()}
                  </p>
                  <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    status === 'critical'
                      ? 'bg-red-500/10 text-red-500 dark:bg-red-500/20'
                      : status === 'warning'
                        ? 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20'
                  }`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Threshold Tuners Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-2xl">
            <Sliders size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Vitals Guardrails Calibration</h3>
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Safety Alarm Envelope Limits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* HR Guardrails */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Heart Rate limits</span>
              <span className="text-xs font-bold text-red-500">{thresholds.heartRate.min} - {thresholds.heartRate.max} bpm</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                  <span>Critical Minimum</span>
                  <span>{thresholds.heartRate.min}</span>
                </label>
                <input 
                  type="range" min="40" max="80" value={thresholds.heartRate.min}
                  onChange={(e) => setThresholds((prev: any) => ({ ...prev, heartRate: { ...prev.heartRate, min: Number(e.target.value) } }))}
                  className="w-full h-1 accent-red-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                  <span>Critical Maximum</span>
                  <span>{thresholds.heartRate.max}</span>
                </label>
                <input 
                  type="range" min="100" max="180" value={thresholds.heartRate.max}
                  onChange={(e) => setThresholds((prev: any) => ({ ...prev, heartRate: { ...prev.heartRate, max: Number(e.target.value) } }))}
                  className="w-full h-1 accent-red-500"
                />
              </div>
            </div>
          </div>

          {/* SpO2 Guardrails */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Oxygenation limits</span>
              <span className="text-xs font-bold text-blue-500">Min: {thresholds.spo2.min}%</span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 flex justify-between mb-1">
                <span>Critical SpO2 Threshold</span>
                <span>{thresholds.spo2.min}%</span>
              </label>
              <input 
                type="range" min="85" max="96" value={thresholds.spo2.min}
                onChange={(e) => setThresholds((prev: any) => ({ ...prev, spo2: { ...prev.spo2, min: Number(e.target.value) } }))}
                className="w-full h-1 accent-blue-500"
              />
              <p className="text-[9px] text-slate-400 mt-2 font-medium">Standard physiological norms identify SpO2 values under 90% as hypoxic crises.</p>
            </div>
          </div>

          {/* Temperature Guardrails */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Hyperthermia limit</span>
              <span className="text-xs font-bold text-orange-500">Max: {thresholds.temperature.max}°C</span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 flex justify-between mb-1">
                <span>Critical Temperature</span>
                <span>{thresholds.temperature.max}°C</span>
              </label>
              <input 
                type="range" min="37.5" max="40.0" step="0.1" value={thresholds.temperature.max}
                onChange={(e) => setThresholds((prev: any) => ({ ...prev, temperature: { ...prev.temperature, max: Number(e.target.value) } }))}
                className="w-full h-1 accent-orange-500"
              />
              <p className="text-[9px] text-slate-400 mt-2 font-medium">Fever thresholds are managed via micro-degree medical calibrators.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Alarm Log Table & SMS/Pager Logs Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-Time Alarm History Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Telemetry Event Archive</h3>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Acoustic Log Sync Record</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {(['all', 'high', 'medium', 'info'] as const).map((lvl, lIdx) => (
                    <button
                      key={`lvl-${lvl}-${lIdx}`}
                      onClick={() => setFilter(lvl)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                        filter === lvl 
                          ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <button
                  onClick={clearAlarmHistory}
                  title="Clear log"
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-100 dark:border-slate-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[360px] pr-2 no-scrollbar space-y-3">
              <AnimatePresence>
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto text-emerald-400 mb-2" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Telemetry Deviations Registered</p>
                    <p className="text-xs text-slate-400 mt-1">Patient physiological indicators are within expected margins.</p>
                  </div>
                ) : (
                  filteredHistory.map((log, mapIdx_752) => (
                    <motion.div
                      key={`alarmhubview-l755-${mapIdx_752}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                        log.priority === 'high' 
                          ? 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/40 text-red-900 dark:text-red-200' 
                          : log.priority === 'medium'
                          ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-200'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        {log.priority === 'high' ? (
                          <AlertTriangle className="text-red-500 shrink-0" size={16} />
                        ) : log.priority === 'medium' ? (
                          <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                        ) : (
                          <Info className="text-blue-500 shrink-0" size={16} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] font-black uppercase text-slate-400">{log.source}</span>
                          <span className="font-mono text-[9px] text-slate-400 font-bold">{log.timestamp}</span>
                        </div>
                        <p className="text-xs font-bold mt-1 leading-snug">{log.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded-md ${
                            log.priority === 'high' 
                              ? 'bg-red-100 dark:bg-red-950 text-red-600'
                              : log.priority === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                          }`}>
                            value: {log.value}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Simulated Caregiver SMS Outbox Logs (Twilio logs) */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-2xl">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">SMS Alert Outbox</h3>
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Twilio Broadcast Relay Logs</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Critical deviations lasting over 3 seconds trigger automated SMS broadcasts and emergency VoIP robocalls via integration relays to response groups.
            </p>

            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 no-scrollbar">
              {simulatedPagerLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-300 dark:text-slate-700">
                  <MessageSquare className="mx-auto mb-2" size={24} />
                  <p className="text-[10px] font-black uppercase">No Broadcast Dispatches Pending</p>
                </div>
              ) : (
                simulatedPagerLogs.map((sms, mapIdx_825) => (
                  <div key={`alarmhubview-l827-${mapIdx_825}`} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-indigo-600 uppercase tracking-wider">{sms.carrier}</span>
                      <span className="text-slate-400">{sms.time}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 select-all leading-normal">
                      "{sms.message}"
                    </p>
                    <div className="flex justify-between items-center text-[9px] pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Recip: <strong className="text-slate-700 dark:text-slate-300 font-bold">{sms.recipient}</strong></span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-black uppercase">STATUS: {sms.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
            <span>Dispatched Carriers: AWS, TWILIO</span>
            <span>Relay active</span>
          </div>
        </div>

      </div>

    </div>
  );
};

// End of AlarmHubView component
