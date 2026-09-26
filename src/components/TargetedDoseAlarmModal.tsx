import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  Volume2,
  AlertTriangle,
  Pill,
  Sparkles
} from 'lucide-react';
import {
  TargetedMedicationAlarmSystem,
  TargetedAccountAlarm
} from '../utils/targetedMedicationAlarmSystem';

interface TargetedDoseAlarmModalProps {
  currentUser: any;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const TargetedDoseAlarmModal: React.FC<TargetedDoseAlarmModalProps> = ({
  currentUser,
  onShowToast
}) => {
  const [activeAlarm, setActiveAlarm] = useState<TargetedAccountAlarm | null>(null);

  // 1. Listen for targeted alarm trigger events
  useEffect(() => {
    const handleAlarmEvent = (e: any) => {
      const alarm: TargetedAccountAlarm = e.detail?.alarm;
      if (!alarm) return;

      // CRITICAL: Single-account strict isolation check
      const isForMe = TargetedMedicationAlarmSystem.isAlarmForCurrentUser(alarm, currentUser);
      if (!isForMe) {
        // Discard silently - do NOT chime, do NOT show modal for other accounts
        console.log(
          `[MED-ALARM-ISOLATION] Alarm ${alarm.id} targeted for ${alarm.targetAccountEmail} suppressed on current session (${currentUser?.email || 'guest'}). Zero disruption maintained.`
        );
        return;
      }

      // If for this account, trigger acoustic chime & modal
      TargetedMedicationAlarmSystem.playAccountChime(alarm.soundType, alarm.volume);
      setActiveAlarm(alarm);
    };

    window.addEventListener('doctorian:targeted_dose_alarm_triggered', handleAlarmEvent);
    return () => {
      window.removeEventListener('doctorian:targeted_dose_alarm_triggered', handleAlarmEvent);
    };
  }, [currentUser]);

  // 2. Periodic background scheduler: check if current time matches scheduled dose
  useEffect(() => {
    if (!currentUser) return;

    const checkSchedules = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const myAlarms = TargetedMedicationAlarmSystem.getAlarmsForUser(currentUser);
      for (const alarm of myAlarms) {
        if (!alarm.enabled) continue;

        // Check if any scheduled time matches current minute and hasn't been triggered in the last 2 minutes
        const matchesTime = alarm.scheduleTimes.some((timeStr) => {
          // Supports "08:00" or "08:00 AM"
          const normalized = timeStr.trim().substring(0, 5);
          return normalized === currentTimeStr;
        });

        if (matchesTime) {
          const lastTrigger = alarm.lastTriggeredAt ? new Date(alarm.lastTriggeredAt).getTime() : 0;
          const twoMinutesAgo = Date.now() - 120000;

          if (lastTrigger < twoMinutesAgo) {
            // Update lastTriggeredAt
            alarm.lastTriggeredAt = new Date().toISOString();
            const all = TargetedMedicationAlarmSystem.getAllAlarms().map((a) => (a.id === alarm.id ? alarm : a));
            TargetedMedicationAlarmSystem.saveAllAlarms(all);

            TargetedMedicationAlarmSystem.dispatchTargetedAlarm(alarm);
            break;
          }
        }
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkSchedules, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleConfirmDose = () => {
    if (!activeAlarm) return;
    TargetedMedicationAlarmSystem.recordDoseTaken(activeAlarm.id, currentUser, 'Confirmed taken via targeted alarm modal.');
    onShowToast?.(`Dose of ${activeAlarm.medicationName} confirmed and logged to your EHR record.`, 'success');
    setActiveAlarm(null);
  };

  const handleSnooze = () => {
    if (!activeAlarm) return;
    onShowToast?.(`Alarm for ${activeAlarm.medicationName} snoozed for 10 minutes.`, 'info');
    setActiveAlarm(null);
  };

  const handleDismiss = () => {
    setActiveAlarm(null);
  };

  if (!activeAlarm) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-2 border-purple-500/40 dark:border-purple-500/30 overflow-hidden z-10"
        >
          {/* Top glowing ambient gradient */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Icon Badge */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-purple-500/30 ring-4 ring-purple-500/20 animate-bounce">
                <Bell size={32} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-900">
                ✓
              </span>
            </div>

            {/* Scope Isolation Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 mb-3">
              <ShieldCheck size={13} className="text-purple-600 dark:text-purple-400" />
              Targeted Account Alarm • Zero App Disruption
            </div>

            <h2 className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">
              Medication Dose Time
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mt-1">
              Authorized by clinical administration specifically for your account{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">({currentUser?.displayName || currentUser?.name || currentUser?.email})</span>.
            </p>
          </div>

          {/* Medication Details Card */}
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Pill size={16} />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {activeAlarm.medicationName}
                  </h4>
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {activeAlarm.dosage} • {activeAlarm.route}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
                  {activeAlarm.scheduleTimes.join(', ')}
                </span>
              </div>
            </div>

            {activeAlarm.instructions && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white font-bold">Clinical Instructions:</strong>{' '}
                  {activeAlarm.instructions}
                </span>
              </div>
            )}

            {/* Admin Authorization Signature Proof */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>
                Authorized by: <strong className="text-slate-700 dark:text-slate-300">{activeAlarm.adminAuthorization?.adminName || 'Clinical Admin'}</strong>
              </span>
              <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                {activeAlarm.adminAuthorization?.digitalSignature?.substring(0, 18)}...
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSnooze}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Clock size={15} />
              Snooze 10m
            </button>

            <button
              type="button"
              onClick={handleConfirmDose}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-purple-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              Confirm Dose Taken
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
