import React, { useState, useEffect } from 'react';
import { 
  X, Footprints, Droplet, Dumbbell, Target, Plus, Minus,
  Sparkles, Check, Flame, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface HealthGoal {
  id: 'steps' | 'water' | 'workout';
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

  // Load goals into local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalGoals(JSON.parse(JSON.stringify(goals))); // Deep clone
    }
  }, [isOpen, goals]);

  const updateGoalCurrent = (id: 'steps' | 'water' | 'workout', value: number) => {
    setLocalGoals(prev => prev.map(g => {
      if (g.id === id) {
        // Prevent negative values
        const nextVal = Math.max(0, g.current + value);
        return { ...g, current: nextVal };
      }
      return g;
    }));
  };

  const setGoalCurrentDirect = (id: 'steps' | 'water' | 'workout', value: number) => {
    setLocalGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextVal = Math.max(0, value);
        return { ...g, current: nextVal };
      }
      return g;
    }));
  };

  const updateGoalTarget = (id: 'steps' | 'water' | 'workout', target: number) => {
    setLocalGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextTarget = Math.max(1, target);
        return { ...g, target: nextTarget };
      }
      return g;
    }));
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
      default: return null;
    }
  };

  const getBgColor = (id: string) => {
    switch (id) {
      case 'steps': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/40';
      case 'water': return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/40';
      case 'workout': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/40';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600';
    }
  };

  const getAccentBtnColor = (id: string) => {
    switch (id) {
      case 'steps': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20';
      case 'water': return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20';
      case 'workout': return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20';
      default: return 'bg-slate-500';
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
            className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-2xl z-10 font-sans"
          >
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
            <div className="flex bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-2xl mb-8 border border-slate-100/50 dark:border-slate-800/50">
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

            {/* Goals List Content */}
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
              {localGoals.map((goal) => {
                const isCompleted = goal.current >= goal.target;
                const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));

                return (
                  <div 
                    key={goal.id}
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
                            goal.id === 'water' ? 'bg-blue-500' : 'bg-emerald-500'
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
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
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
                        </div>
                      </div>
                    ) : (
                      // Configure Target Values
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Adjustment Range:</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-255">{goal.target.toLocaleString()} {goal.unit}</span>
                        </div>
                        <input
                          type="range"
                          min={goal.id === 'steps' ? 1000 : goal.id === 'water' ? 2 : 5}
                          max={goal.id === 'steps' ? 25000 : goal.id === 'water' ? 24 : 180}
                          step={goal.id === 'steps' ? 500 : goal.id === 'water' ? 1 : 5}
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
