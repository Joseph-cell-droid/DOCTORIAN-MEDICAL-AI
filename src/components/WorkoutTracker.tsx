import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Clock, 
  Flame, 
  Dumbbell,
  Calendar,
  Zap,
  Target,
  Trophy,
  History,
  TrendingUp,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';

interface Workout {
  id: string;
  type: string;
  duration: number;
  calories: number;
  intensity: 'Low' | 'Moderate' | 'High';
  date: string;
  notes?: string;
}

export const WorkoutTracker: React.FC<{ user: any }> = ({ user }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState('Running');
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const data = await api.workouts.list();
      setWorkouts(data);
    } catch (err: any) {
      console.error("Failed to fetch workouts:", err);
      setError("Failed to load neural activity logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const guestCalories = duration * (intensity === 'High' ? 12 : intensity === 'Moderate' ? 8 : 5);
      
      await api.workouts.create({
        type,
        duration: Number(duration),
        calories: guestCalories,
        intensity,
        date: new Date().toISOString(),
        notes
      });
      
      setIsAdding(false);
      setType('Running');
      setDuration(30);
      setNotes('');
      fetchWorkouts();
    } catch (err: any) {
      setError("Neural packet transmission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this activity log?")) return;
    try {
      await api.workouts.delete(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      setError("Failed to delete activity.");
    }
  };

  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Activity className="text-emerald-500" />
            VHT Physical Dashboard
          </h2>
          <p className="text-slate-400 font-bold">Synchronizing metabolic activity and clinical progress.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? "Cancel" : "Log Activity"}
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 font-bold"
        >
          <AlertCircle size={20} />
          {error}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <Clock size={24} />
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalMinutes}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Minutes</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl group hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
              <Flame size={24} />
            </div>
            <TrendingUp size={16} className="text-orange-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalCalories}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Calories Burned</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <History size={24} />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{workouts.length}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Sessions</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
              <Target size={24} />
            </div>
          </div>
          <div className="text-3xl font-black text-white">85%</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Goal Completion</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddWorkout} className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Activity Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option>Running</option>
                    <option>Walking</option>
                    <option>Cycling</option>
                    <option>Swimming</option>
                    <option>Weightlifting</option>
                    <option>Yoga</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration (Minutes)</label>
                  <input 
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Intensity</label>
                  <div className="flex gap-2 p-1 bg-slate-900 border border-slate-700 rounded-xl">
                    {['Low', 'Moderate', 'High'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setIntensity(lvl as any)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                          intensity === lvl 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes (Clinical Context)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your session or any metabolic observations..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white min-h-[100px] focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                  Synchronize Activity
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Timeline */}
      <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <History size={20} className="text-slate-400" />
            Activity Timeline
          </h3>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Last 30 Sessions
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing neural history...</p>
            </div>
          ) : workouts.length === 0 ? (
            <div className="p-20 text-center">
              <Dumbbell size={48} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-bold mb-1">No metabolic data detected.</p>
              <p className="text-slate-500 text-sm">Synchronize your first activity to start tracking progress.</p>
            </div>
          ) : (
            workouts.map((workout) => (
              <motion.div 
                key={workout.id}
                layout
                className="p-6 hover:bg-white/5 transition-colors group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    workout.type === 'Running' ? 'bg-emerald-500/10 text-emerald-500' :
                    workout.type === 'Weightlifting' ? 'bg-purple-500/10 text-purple-500' :
                    workout.type === 'Cycling' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-black uppercase tracking-tight">{workout.type}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        workout.intensity === 'High' ? 'bg-rose-500/20 text-rose-500' :
                        workout.intensity === 'Moderate' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {workout.intensity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {workout.duration}m</span>
                      <span className="flex items-center gap-1"><Flame size={12} /> {workout.calories} kcal</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(workout.date).toLocaleDateString()}</span>
                    </div>
                    {workout.notes && (
                      <p className="text-xs text-slate-400 mt-2 italic font-medium">"{workout.notes}"</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(workout.id)}
                  className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
