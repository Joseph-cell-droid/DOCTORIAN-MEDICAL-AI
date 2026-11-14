import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Bell,
  BellOff,
  Pill,
  Clock,
  UserCheck,
  Plus,
  Trash2,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Search,
  Lock
} from 'lucide-react';
import {
  TargetedMedicationAlarmSystem,
  TargetedAccountAlarm
} from '../utils/targetedMedicationAlarmSystem';

interface AdminMedicationAlarmManagerProps {
  currentUser: any;
  usersList?: any[];
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminMedicationAlarmManager: React.FC<AdminMedicationAlarmManagerProps> = ({
  currentUser,
  usersList = [],
  onShowToast
}) => {
  const [alarms, setAlarms] = useState<TargetedAccountAlarm[]>([]);
  const [isAuthorizingNew, setIsAuthorizingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [targetAccountEmail, setTargetAccountEmail] = useState('');
  const [targetAccountName, setTargetAccountName] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [route, setRoute] = useState('Oral');
  const [scheduleTimeInput, setScheduleTimeInput] = useState('08:00, 20:00');
  const [instructions, setInstructions] = useState('');
  const [soundType, setSoundType] = useState<'gentle_harp' | 'clinical_chime' | 'vital_bell'>('clinical_chime');
  const [volume, setVolume] = useState(0.7);

  const refreshAlarms = () => {
    setAlarms(TargetedMedicationAlarmSystem.getAllAlarms());
  };

  useEffect(() => {
    refreshAlarms();
    const handleUpdate = () => refreshAlarms();
    window.addEventListener('doctorian:targeted_alarms_updated', handleUpdate);
    return () => window.removeEventListener('doctorian:targeted_alarms_updated', handleUpdate);
  }, []);

  const handleSelectUser = (user: any) => {
    setTargetAccountEmail(user.email || '');
    setTargetAccountName(user.displayName || user.name || user.email.split('@')[0]);
    setTargetAccountId(user.id || user.email);
  };

  const handleAuthorizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetAccountEmail.trim()) {
      onShowToast?.('Please specify a target patient account email.', 'warning');
      return;
    }
    if (!medicationName.trim() || !dosage.trim()) {
      onShowToast?.('Medication name and dosage are required.', 'warning');
      return;
    }

    const scheduleTimes = scheduleTimeInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    TargetedMedicationAlarmSystem.authorizeAlarm(
      {
        id: targetAccountId || targetAccountEmail,
        email: targetAccountEmail,
        displayName: targetAccountName,
        name: targetAccountName
      },
      {
        medicationName,
        dosage,
        route,
        scheduleTimes,
        instructions,
        soundType,
        volume
      },
      currentUser
    );

    onShowToast?.(
      `Authorized medication alarm for ${targetAccountEmail}. Configured exclusively for that account with zero disruption to other accounts.`,
      'success'
    );

    // Reset Form
    setIsAuthorizingNew(false);
    setMedicationName('');
    setDosage('');
    setInstructions('');
    refreshAlarms();
  };

  const handleToggle = (alarmId: string, currentEnabled: boolean) => {
    TargetedMedicationAlarmSystem.toggleAlarm(alarmId, !currentEnabled);
    onShowToast?.(`Alarm ${!currentEnabled ? 'enabled' : 'muted'} for target account.`, 'info');
    refreshAlarms();
  };

  const handleDelete = (alarmId: string) => {
    const remaining = alarms.filter((a) => a.id !== alarmId);
    TargetedMedicationAlarmSystem.saveAllAlarms(remaining);
    onShowToast?.('Targeted medication alarm revoked.', 'info');
    refreshAlarms();
  };

  const handleSimulateTestDispatch = (alarm: TargetedAccountAlarm) => {
    TargetedMedicationAlarmSystem.dispatchTargetedAlarm(alarm);
    onShowToast?.(
      `Test alarm dispatched for account: ${alarm.targetAccountEmail}. Only sessions matching that account will chime.`,
      'info'
    );
  };

  const filteredAlarms = alarms.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.medicationName.toLowerCase().includes(q) ||
      a.targetAccountEmail.toLowerCase().includes(q) ||
      a.targetAccountName.toLowerCase().includes(q) ||
      a.adminAuthorization?.adminName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-[1000] uppercase tracking-tight">
                  Targeted Medication Dose Alarms
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Strict Account Isolation
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                Authorize medication schedules specifically for designated patient accounts. Alarms chime{' '}
                <strong className="text-purple-300">only for the designated patient</strong> and never disturb other users, doctors, or the whole app.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthorizingNew(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-purple-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} />
            Authorize New Dose Alarm
          </button>
        </div>
      </div>

      {/* Authorize New Modal Form */}
      <AnimatePresence>
        {isAuthorizingNew && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthorizingNew(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30 max-h-[90vh] overflow-y-auto z-10 no-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Pill size={18} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Authorize Account Dose Alarm
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthorizingNew(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAuthorizeSubmit} className="mt-6 space-y-4">
                {/* 1. Target Account Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Patient Account Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={targetAccountEmail}
                    onChange={(e) => setTargetAccountEmail(e.target.value)}
                    placeholder="e.g. patient@doctorian.org"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  {/* Quick Select From Known Users */}
                  {usersList.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Or select from registered accounts:
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                        {usersList.slice(0, 8).map((u) => (
                          <button
                            key={u.id || u.email}
                            type="button"
                            onClick={() => handleSelectUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-500/10 text-slate-700 dark:text-slate-300 hover:text-purple-600 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            {u.displayName || u.name || u.email}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Patient Name
                    </label>
                    <input
                      type="text"
                      value={targetAccountName}
                      onChange={(e) => setTargetAccountName(e.target.value)}
                      placeholder="e.g. Gloria Jay Akullo"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Medication Route
                    </label>
                    <select
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Oral">Oral (Tablets/Capsules)</option>
                      <option value="Subcutaneous">Subcutaneous (Insulin/Injectable)</option>
                      <option value="Inhalation">Inhalation (Nebulizer/Inhaler)</option>
                      <option value="Topical">Topical Transdermal</option>
                    </select>
                  </div>
                </div>

                {/* 2. Medication Name & Dosage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={medicationName}
                      onChange={(e) => setMedicationName(e.target.value)}
                      placeholder="e.g. Amlodipine Besylate"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      required
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g. 5mg or 500mg"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* 3. Schedule Times */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Schedule Times (Comma-separated, 24-hr format) *
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleTimeInput}
                    onChange={(e) => setScheduleTimeInput(e.target.value)}
                    placeholder="e.g. 08:00, 14:00, 20:00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    System scheduler evaluates these times strictly against the target account's device time.
                  </p>
                </div>

                {/* 4. Clinical Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Clinical Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Take immediately after meals. Monitor blood pressure 30 minutes after dose."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* 5. Sound Chime Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Account Chime Sound
                    </label>
                    <select
                      value={soundType}
                      onChange={(e) => setSoundType(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="clinical_chime">Three-Tone Clinical Chime</option>
                      <option value="gentle_harp">Gentle Harp Cascade</option>
                      <option value="vital_bell">Vital Bell Resonance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Authorization Signature
                    </label>
                    <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                      <Lock size={13} />
                      {currentUser?.displayName || currentUser?.name || 'Administrator'} (Digital Verified)
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAuthorizingNew(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-purple-500/30 transition-all"
                  >
                    Sign & Authorize Alarm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alarms Table / Cards */}
      <div className="space-y-4">
        {/* Search filter bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient email, medication, or admin..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            {filteredAlarms.length} Targeted Dose Alarms Active
          </span>
        </div>

        {filteredAlarms.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Pill size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No targeted alarms match your filter.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Authorize New Dose Alarm&quot; to configure a medication reminder for a specific account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlarms.map((alarm) => (
              <div
                key={alarm.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Pill size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                          {alarm.medicationName}
                        </h4>
                        <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          {alarm.dosage} • {alarm.route}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggle(alarm.id, alarm.enabled)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={alarm.enabled ? 'Mute alarm' : 'Enable alarm'}
                      >
                        {alarm.enabled ? (
                          <Bell size={18} className="text-purple-600 dark:text-purple-400" />
                        ) : (
                          <BellOff size={18} className="text-slate-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(alarm.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Revoke alarm authorization"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Target Account Badge */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Authorized Target Account:
                      </span>
                      <span className="px-2 py-0.2 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase">
                        Account Specific
                      </span>
                    </div>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {alarm.targetAccountEmail}
                    </p>
                    {alarm.targetAccountName && (
                      <p className="text-[11px] text-slate-500">{alarm.targetAccountName}</p>
                    )}
                  </div>

                  {/* Times Strip */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={12} /> Schedule:
                    </span>
                    {alarm.scheduleTimes.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {alarm.instructions && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {alarm.instructions}
                    </p>
                  )}
                </div>

                {/* Footer with Admin Signature & Test Dispatch */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>
                      Signed by: <strong className="text-slate-600 dark:text-slate-300">{alarm.adminAuthorization?.adminName}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSimulateTestDispatch(alarm)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Simulate alarm trigger - will only chime if logged into target account"
                  >
                    <Send size={12} />
                    Test Trigger
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
