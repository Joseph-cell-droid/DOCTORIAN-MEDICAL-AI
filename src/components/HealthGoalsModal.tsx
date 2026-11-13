import React, { useState, useEffect } from 'react';
import { 
  X, Footprints, Droplet, Dumbbell, Target, Plus, Minus,
  Sparkles, Check, Flame, Trophy, Moon, Activity, Pill, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export interface HealthGoal {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

interface HealthGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: HealthGoal[];
  onSave: (updatedGoals: HealthGoal[]) => void;
}

export const HealthGoalsModal: React.FC<HealthGoalsModalProps> = ({
  isOpen,
  onClose,
  goals,
  onSave
}) => {
  const [localGoals, setLocalGoals] = useState<HealthGoal[]>([]);
  const [activeTab, setActiveTab] = useState<'progress' | 'targets'>('progress');
  const [toast, setToast] = useState<{ id: string; message: string; sub: string } | null>(null);

  // States for adding custom goals
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newGoalId, setNewGoalId] = useState<'sleep' | 'blood_pressure' | 'meds' | 'custom'>('custom');
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalUnit, setNewGoalUnit] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState<number>(10);

  // Load goals into local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalGoals(JSON.parse(JSON.stringify(goals))); // Deep clone
    }
  }, [isOpen, goals]);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fireConfetti = (goalLabel: string) => {
    // 1. Fireworks / burst confetti
    confetti({
      particleCount: 125,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#F59E0B', '#3B82F6', '#10B981', '#6366F1', '#EC4899'],
      zIndex: 9999
    });

    // 2. Continuous side bursts for premium celebration feel
    const duration = 1.2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 20 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 200);

    // Show beautiful custom notification toast matching our professional aesthetic
    setToast({
      id: Math.random().toString(),
      message: `${goalLabel} Goal Achieved!`,
      sub: `Calibration achieved. Sensors indicate optimal daily biometric output. 🎉`
    });
  };

  const updateGoalCurrent = (id: string, value: number) => {
    setLocalGoals(prev => prev.map((g, mapIdx_95) => {
      if (g.id === id) {
        // Prevent negative values
        const nextVal = Math.max(0, g.current + value);
        if (nextVal >= g.target && g.current < g.target) {
          fireConfetti(g.label);
        }
        return { ...g, current: nextVal };
      }
      return g;
    }));
  };

  const setGoalCurrentDirect = (id: string, value: number) => {
    setLocalGoals(prev => prev.map((g, mapIdx_109) => {
      if (g.id === id) {
        const nextVal = Math.max(0, value);
        if (nextVal >= g.target && g.current < g.target) {
          fireConfetti(g.label);
        }
        return { ...g, current: nextVal };
      }
      return g;
    }));
  };

  const updateGoalTarget = (id: string, target: number) => {
    setLocalGoals(prev => prev.map((g, mapIdx_122) => {
      if (g.id === id) {
        const nextTarget = Math.max(1, target);
        if (g.current >= nextTarget && g.current < g.target) {
          fireConfetti(g.label);
        }
        return { ...g, target: nextTarget };
      }
      return g;
    }));
  };

  const handlePresetChange = (type: 'sleep' | 'blood_pressure' | 'meds' | 'custom') => {
    setNewGoalId(type);
    if (type === 'sleep') {
      setNewGoalLabel('Sleep Duration');
      setNewGoalUnit('hrs');
      setNewGoalTarget(8);
    } else if (type === 'blood_pressure') {
      setNewGoalLabel('Blood Pressure Tracking');
      setNewGoalUnit('times');
      setNewGoalTarget(2);
    } else if (type === 'meds') {
      setNewGoalLabel('Medications Tracker');
      setNewGoalUnit('doses');
      setNewGoalTarget(3);
    } else {
      setNewGoalLabel('');
      setNewGoalUnit('');
      setNewGoalTarget(10);
    }
  };

  const handleAddGoal = () => {
    if (!newGoalLabel.trim() || !newGoalUnit.trim()) {
      setToast({ id: Math.random().toString(), message: 'Missing fields', sub: 'Please provide both a label and a unit.' });
      return;
    }
    const finalId = newGoalId === 'custom' ? `custom_${Date.now()}` : newGoalId;
    
    // Check if goal with same ID already exists to avoid duplication
    if (localGoals.some(g => g.id === finalId)) {
      setToast({ id: Math.random().toString(), message: 'Duplicate Goal', sub: 'A goal with this biometric type already exists.' });
      return;
    }

    const newGoal: HealthGoal = {
      id: finalId,
      label: newGoalLabel.trim(),
      current: 0,
      target: newGoalTarget,
      unit: newGoalUnit.trim()
    };

    setLocalGoals(prev => [...prev, newGoal]);
    setIsAddingCustom(false);
    // Reset inputs
    setNewGoalLabel('');
    setNewGoalUnit('');
    setNewGoalTarget(10);
    setNewGoalId('custom');
  };

  const handleSave = () => {
    onSave(localGoals);
    onClose();
  };

  const getIcon = (id: string, size = 20) => {
    switch (id) {
      case 'steps': return <Footprints size={size} className="text-amber-500 animate-pulse" />;
      case 'water': return <Droplet size={size} className="text-blue-500 animate-pulse" />;
      case 'workout': return <Dumbbell size={size} className="text-emerald-500 animate-pulse" />;
      case 'sleep': return <Moon size={size} className="text-indigo-500 animate-pulse" />;
      case 'blood_pressure': return <Activity size={size} className="text-rose-500 animate-pulse" />;
      case 'meds': return <Pill size={size} className="text-purple-500 animate-pulse" />;
      default: return <Target size={size} className="text-blue-500 animate-pulse" />;
    }
  };

  const getBgColor = (id: string) => {
    switch (id) {
      case 'steps': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/40';
      case 'water': return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/40';
      case 'workout': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/40';
      case 'sleep': return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/40';
      case 'blood_pressure': return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/40';
      case 'meds': return 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-900/40';
      default: return 'bg-slate-50 dark:bg-slate-905 text-slate-600 border-slate-100/50 dark:border-slate-900/40';
    }
  };

  const getAccentBtnColor = (id: string) => {
    switch (id) {
      case 'steps': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20';
      case 'water': return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20';
      case 'workout': return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20';
      case 'sleep': return 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20';
      case 'blood_pressure': return 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20';
      case 'meds': return 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20';
      default: return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-2xl z-10 font-sans overflow-hidden"
          >
            {/* Toast Notification */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute top-4 left-4 right-4 z-50 bg-slate-900 dark:bg-slate-950 border border-blue-500/30 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-[11px] font-[1000] uppercase tracking-wider text-emerald-400 leading-none">
                      {toast.message}
                    </h4>
                    <p className="text-[9px] text-slate-300 font-bold tracking-wide mt-1 leading-tight">
                      {toast.sub}
                    </p>
                  </div>
                  <button
                    onClick={() => setToast(null)}
                    className="p-1.5 px-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[8px] font-black uppercase tracking-widest transition-all"
                  >
                    OK
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Target size={24} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                    Daily Biometric Goals
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                    Align & calibrate daily biological targets
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-2xl mb-6 border border-slate-100/50 dark:border-slate-800/50">
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'progress' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Log Today's Inputs
              </button>
              <button
                onClick={() => setActiveTab('targets')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'targets' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Configure Targets
              </button>
            </div>

            {/* Add Custom Goal Section */}
            <div className="mb-6">
              {!isAddingCustom ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.99] bg-slate-50/40 dark:bg-slate-900/40 text-slate-400"
                >
                  <Plus size={14} /> Add Custom Goal / Template
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-3xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">Configure Biometric Target</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-[9px] font-bold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Preset Template dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Biometric Template</label>
                      <select
                        value={newGoalId}
                        onChange={(e: any) => handlePresetChange(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="custom">✍️ Custom Goal (Manual)</option>
                        <option value="sleep">🛏️ Sleep Duration</option>
                        <option value="blood_pressure">🩺 Blood Pressure Tracking</option>
                        <option value="meds">💊 Medication Adherence</option>
                      </select>
                    </div>

                    {/* Goal Label */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Goal Label Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Sleep Duration"
                        value={newGoalLabel}
                        onChange={(e) => setNewGoalLabel(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Goal Unit */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Unit of Metric</label>
                      <input
                        type="text"
                        placeholder="e.g. hrs, times, doses"
                        value={newGoalUnit}
                        onChange={(e) => setNewGoalUnit(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Target Value */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Daily Target Value</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 8"
                        value={newGoalTarget}
                        onChange={(e) => setNewGoalTarget(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                  >
                    Add Biometric Target
                  </button>
                </motion.div>
              )}
            </div>

            {/* Goals List Content */}
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
              {localGoals.map((goal, mapIdx_410) => {
                const isCompleted = goal.current >= goal.target;
                const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));

                return (
                  <div 
                    key={`healthgoalsmodal-l417-${mapIdx_410}`}
                    className={`p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col gap-5`}
                  >
                    {/* Goal Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl border ${getBgColor(goal.id)}`}>
                          {getIcon(goal.id, 20)}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                            {goal.label}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1.5">
                            Target: {goal.target.toLocaleString()} {goal.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[9px] font-black uppercase">
                            <Trophy size={10} /> Goal Complete
                          </div>
                        ) : (
                          <span className="text-xs font-black text-slate-400 tracking-wider">
                            {percentage}%
                          </span>
                        )}
                        {/* Deleting goals in configure targets mode */}
                        {activeTab === 'targets' && (
                          <button
                            type="button"
                            onClick={() => {
                              setLocalGoals(prev => prev.filter(g => g.id !== goal.id));
                            }}
                            className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-500 dark:text-rose-450 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                            title="Remove this goal"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full">
                      <div className="w-full h-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-800/20">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={`h-full rounded-full ${
                            goal.id === 'steps' ? 'bg-amber-500' : 
                            goal.id === 'water' ? 'bg-blue-500' : 
                            goal.id === 'workout' ? 'bg-emerald-500' : 
                            goal.id === 'sleep' ? 'bg-indigo-500' : 
                            goal.id === 'blood_pressure' ? 'bg-rose-500' : 
                            goal.id === 'meds' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Interactive Dials (Log Progress) */}
                    {activeTab === 'progress' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        {/* Direct input & adjustment */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-800/30">
                          <button
                            type="button"
                            onClick={() => {
                              const step = goal.id === 'steps' ? 500 : 1;
                              updateGoalCurrent(goal.id, -step);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700/60 shadow-sm transition-all active:scale-90"
                          >
                            <Minus size={14} />
                          </button>

                          <div className="flex items-baseline gap-1 text-center font-black">
                            <input
                              type="number"
                              value={goal.current}
                              onChange={(e) => setGoalCurrentDirect(goal.id, parseInt(e.target.value) || 0)}
                              className="w-16 bg-transparent text-center border-none focus:ring-0 p-0 text-sm font-black text-slate-900 dark:text-white"
                            />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{goal.unit}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const step = goal.id === 'steps' ? 500 : 1;
                              updateGoalCurrent(goal.id, step);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700/60 shadow-sm transition-all active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex gap-2">
                          {goal.id === 'steps' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('steps', 1000)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +1K Steps
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('steps', 5000)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +5K Steps
                              </button>
                            </>
                          )}
                          {goal.id === 'water' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('water', 1)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +1 Cup
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('water', 4)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +4 Cups
                              </button>
                            </>
                          )}
                          {goal.id === 'workout' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('workout', 15)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +15 Mins
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('workout', 30)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +30 Mins
                              </button>
                            </>
                          )}
                          {/* Custom & Template Goals Preset buttons */}
                          {goal.id === 'sleep' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('sleep', 1)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +1 Hr
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('sleep', 2)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +2 Hrs
                              </button>
                            </>
                          )}
                          {goal.id === 'blood_pressure' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('blood_pressure', 1)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +1 Check
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('blood_pressure', 2)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +2 Checks
                              </button>
                            </>
                          )}
                          {goal.id === 'meds' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('meds', 1)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +1 Dose
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent('meds', 2)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +2 Doses
                              </button>
                            </>
                          )}
                          {!['steps', 'water', 'workout', 'sleep', 'blood_pressure', 'meds'].includes(goal.id) && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent(goal.id, 1)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +1 {goal.unit}
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGoalCurrent(goal.id, 5)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                              >
                                +5 {goal.unit}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Configure Target Values
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Adjustment Range:</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">{goal.target.toLocaleString()} {goal.unit}</span>
                        </div>
                        <input
                          type="range"
                          min={
                            goal.id === 'steps' ? 1000 : 
                            goal.id === 'water' ? 2 : 
                            goal.id === 'workout' ? 5 : 
                            goal.id === 'sleep' ? 2 : 
                            goal.id === 'blood_pressure' ? 1 : 
                            goal.id === 'meds' ? 1 : 1
                          }
                          max={
                            goal.id === 'steps' ? 25000 : 
                            goal.id === 'water' ? 24 : 
                            goal.id === 'workout' ? 180 : 
                            goal.id === 'sleep' ? 16 : 
                            goal.id === 'blood_pressure' ? 10 : 
                            goal.id === 'meds' ? 10 : 100
                          }
                          step={
                            goal.id === 'steps' ? 500 : 
                            goal.id === 'water' ? 1 : 
                            goal.id === 'workout' ? 5 : 
                            goal.id === 'sleep' ? 1 : 
                            goal.id === 'blood_pressure' ? 1 : 
                            goal.id === 'meds' ? 1 : 1
                          }
                          value={goal.target}
                          onChange={(e) => updateGoalTarget(goal.id, parseInt(e.target.value) || 1)}
                          className="w-full accent-blue-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer transition-all"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4.5 pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest transition-all"
              >
                Reset Changes
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-[2] py-4 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/25 transition-all"
              >
                Sync Today's Metrics
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
