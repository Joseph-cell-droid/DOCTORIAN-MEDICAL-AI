import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Calendar,
  Sparkles,
  Smile,
  Zap,
  Eye,
  Moon,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Search,
  Award,
  BarChart2,
  BookOpen,
  Clock,
  Activity,
  Heart,
  ChevronDown,
  RotateCcw,
  Check
} from 'lucide-react';

export interface CognitiveJournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  focusScore: number; // 0 - 100
  mood: 'energized' | 'sharp' | 'calm' | 'reflective' | 'fatigued' | 'overstimulated';
  attentionSpanMins: number; // e.g. 45
  mentalClarityScore: number; // 1 - 10
  reactionLatencyMs: number; // e.g. 175
  cognitiveLoad: 'Optimal' | 'Balanced' | 'Strained' | 'Overloaded';
  sleepQualityPct: number; // 0 - 100
  notes: string;
  tags: string[];
}

const MOOD_CONFIG: Record<CognitiveJournalEntry['mood'], { label: string; emoji: string; color: string; bg: string }> = {
  energized: { label: 'Energized & Vibrant', emoji: '⚡', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  sharp: { label: 'Laser Sharp', emoji: '🎯', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  calm: { label: 'Calm & Centered', emoji: '🧘', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  reflective: { label: 'Deeply Reflective', emoji: '💭', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  fatigued: { label: 'Cognitively Fatigued', emoji: '🥱', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  overstimulated: { label: 'Overstimulated', emoji: '🌧️', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
};

const SUGGESTED_TAGS = [
  'Deep Work',
  'Meditation',
  'Cold Immersion',
  'Caffeine Synced',
  'Fast State',
  'Neuro-Nutrition',
  'Outdoor Sunlight',
  'Screen Overload',
  'Aerobic Exercise',
  'Binaural Beats'
];

const SEED_ENTRIES: CognitiveJournalEntry[] = [
  {
    id: 'entry-seed-1',
    date: new Date(Date.now() - 86400000 * 0).toISOString().slice(0, 10),
    timestamp: new Date().toISOString(),
    focusScore: 88,
    mood: 'sharp',
    attentionSpanMins: 65,
    mentalClarityScore: 9,
    reactionLatencyMs: 168,
    cognitiveLoad: 'Optimal',
    sleepQualityPct: 86,
    notes: 'Exceptional neural focus during complex algorithmic triage. Fasting combined with early morning hydration maintained high alpha-frequency flow state without mid-day slump.',
    tags: ['Deep Work', 'Fast State', 'Outdoor Sunlight']
  },
  {
    id: 'entry-seed-2',
    date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    focusScore: 82,
    mood: 'energized',
    attentionSpanMins: 50,
    mentalClarityScore: 8,
    reactionLatencyMs: 174,
    cognitiveLoad: 'Balanced',
    sleepQualityPct: 80,
    notes: 'Completed 2 consecutive 45-minute sprints with 10-minute active recovery intervals. Sustained mental velocity throughout morning clinical rounds.',
    tags: ['Caffeine Synced', 'Aerobic Exercise']
  },
  {
    id: 'entry-seed-3',
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    focusScore: 74,
    mood: 'calm',
    attentionSpanMins: 40,
    mentalClarityScore: 7,
    reactionLatencyMs: 188,
    cognitiveLoad: 'Balanced',
    sleepQualityPct: 78,
    notes: 'Slight late-afternoon eye strain from prolonged diagnostic screen exposure, mitigated with a 15-minute non-sleep deep rest (NSDR) meditation.',
    tags: ['Meditation', 'Screen Overload']
  },
  {
    id: 'entry-seed-4',
    date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    focusScore: 91,
    mood: 'reflective',
    attentionSpanMins: 75,
    mentalClarityScore: 10,
    reactionLatencyMs: 160,
    cognitiveLoad: 'Optimal',
    sleepQualityPct: 92,
    notes: 'Peak cognitive synchronization after 8.2 hours of uninterrupted restorative sleep. Reaction latency hit multi-week optimal low.',
    tags: ['Deep Work', 'Cold Immersion', 'Neuro-Nutrition']
  }
];

export const CognitiveJournal: React.FC = () => {
  const [entries, setEntries] = useState<CognitiveJournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem('doctorian_cognitive_journal');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return SEED_ENTRIES;
  });

  const [showLogModal, setShowLogModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');

  // Form State
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formFocus, setFormFocus] = useState(80);
  const [formMood, setFormMood] = useState<CognitiveJournalEntry['mood']>('sharp');
  const [formAttentionSpan, setFormAttentionSpan] = useState(45);
  const [formClarity, setFormClarity] = useState(8);
  const [formLatency, setFormLatency] = useState(175);
  const [formLoad, setFormLoad] = useState<CognitiveJournalEntry['cognitiveLoad']>('Optimal');
  const [formSleepQuality, setFormSleepQuality] = useState(85);
  const [formNotes, setFormNotes] = useState('');
  const [formSelectedTags, setFormSelectedTags] = useState<string[]>(['Deep Work']);
  const [saveToast, setSaveToast] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('doctorian_cognitive_journal', JSON.stringify(entries));
    } catch (err) {
      console.warn('Failed to save cognitive journal entries:', err);
    }
  }, [entries]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { avgFocus: 0, avgClarity: 0, avgLatency: 0, totalEntries: 0, streakDays: 0 };
    }
    const totalFocus = entries.reduce((acc, curr) => acc + curr.focusScore, 0);
    const totalClarity = entries.reduce((acc, curr) => acc + curr.mentalClarityScore, 0);
    const totalLatency = entries.reduce((acc, curr) => acc + curr.reactionLatencyMs, 0);
    
    return {
      avgFocus: Math.round(totalFocus / entries.length),
      avgClarity: (totalClarity / entries.length).toFixed(1),
      avgLatency: Math.round(totalLatency / entries.length),
      totalEntries: entries.length,
      streakDays: entries.length >= 3 ? entries.length : 3,
    };
  }, [entries]);

  // Filtered entries in reverse chronological order
  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => {
        if (filterMood !== 'all' && e.mood !== filterMood) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNotes = e.notes.toLowerCase().includes(q);
          const matchTags = e.tags.some((t) => t.toLowerCase().includes(q));
          const matchDate = e.date.includes(q);
          if (!matchNotes && !matchTags && !matchDate) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, filterMood, searchQuery]);

  const toggleTag = (tag: string) => {
    setFormSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: CognitiveJournalEntry = {
      id: `entry-${Date.now()}`,
      date: formDate,
      timestamp: new Date().toISOString(),
      focusScore: Number(formFocus),
      mood: formMood,
      attentionSpanMins: Number(formAttentionSpan),
      mentalClarityScore: Number(formClarity),
      reactionLatencyMs: Number(formLatency),
      cognitiveLoad: formLoad,
      sleepQualityPct: Number(formSleepQuality),
      notes: formNotes.trim() || 'Logged cognitive milestones and steady focus metrics.',
      tags: formSelectedTags,
    };

    setEntries((prev) => [newEntry, ...prev.filter((item) => item.date !== formDate)]);
    setShowLogModal(false);
    setFormNotes('');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetToSeed = () => {
    setEntries(SEED_ENTRIES);
  };

  return (
    <div className="w-full space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-purple-600 text-white shadow-2xl shadow-purple-500/40 border border-purple-400 font-bold text-xs"
          >
            <CheckCircle2 size={18} className="text-purple-200" />
            <span>Cognitive Journal entry recorded successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner & Action Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-[2.5rem] p-6 sm:p-10 border border-purple-500/20 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-purple-300 font-bold">
                Neural Performance Chronology
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-[1000] tracking-tight uppercase">
              Cognitive <span className="text-purple-400">Journal</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Record daily focus index, subjective neuro-affective states, synaptic reaction metrics, and behavioral triggers. Your chronological data unlocks predictive mental clarity forecasting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-purple-600/30 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus size={18} />
              <span>Record Daily Entry</span>
            </button>
            <button
              onClick={handleResetToSeed}
              title="Reset Sample Records"
              className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-purple-500/20">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-purple-500/15">
            <div className="flex items-center gap-1.5 text-purple-300 text-[10px] font-black uppercase tracking-wider mb-1">
              <Zap size={14} className="text-purple-400" />
              <span>Avg Focus Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-[1000] text-white">{stats.avgFocus}</span>
              <span className="text-xs font-mono text-purple-300">/ 100</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-purple-500/15">
            <div className="flex items-center gap-1.5 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-1">
              <Eye size={14} className="text-cyan-400" />
              <span>Mental Clarity</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-[1000] text-white">{stats.avgClarity}</span>
              <span className="text-xs font-mono text-cyan-300">/ 10</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-purple-500/15">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
              <Activity size={14} className="text-emerald-400" />
              <span>Avg Latency</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-[1000] text-white">{stats.avgLatency}</span>
              <span className="text-xs font-mono text-emerald-300">ms</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-purple-500/15">
            <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
              <Award size={14} className="text-amber-400" />
              <span>Journal History</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-[1000] text-white">{stats.totalEntries}</span>
              <span className="text-xs font-mono text-amber-300">Days Logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reflections, tags, or dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
            />
          </div>
        </div>

        {/* Mood Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto shrink-0 pb-1 sm:pb-0">
          <button
            onClick={() => setFilterMood('all')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              filterMood === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Moods
          </button>
          {Object.entries(MOOD_CONFIG).map(([moodKey, cfg]) => (
            <button
              key={moodKey}
              onClick={() => setFilterMood(moodKey)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                filterMood === moodKey
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{cfg.emoji}</span>
              <span className="hidden md:inline">{cfg.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chronological History Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-purple-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Chronological History Log ({filteredEntries.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Sorted by Most Recent</span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Brain size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No journal entries found matching criteria.</p>
            <button
              onClick={() => { setFilterMood('all'); setSearchQuery(''); }}
              className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry, idx) => {
              const moodInfo = MOOD_CONFIG[entry.mood] || MOOD_CONFIG.sharp;
              const formattedDate = new Date(entry.date + 'T12:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900/90 rounded-[2rem] p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    {/* Date and Mood badge */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Calendar size={13} className="text-purple-500" />
                        <span>{formattedDate}</span>
                      </div>

                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-black uppercase tracking-wider ${moodInfo.bg} ${moodInfo.color}`}>
                        <span>{moodInfo.emoji}</span>
                        <span>{moodInfo.label}</span>
                      </div>

                      <div className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 font-bold uppercase">
                        Load: {entry.cognitiveLoad}
                      </div>
                    </div>

                    {/* Delete entry action */}
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all self-end md:self-auto cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Core Metrics strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Focus Index</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg font-[1000] text-slate-900 dark:text-white">{entry.focusScore}%</span>
                        <div className="flex-1 max-w-[60px] h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${entry.focusScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Attention Span</span>
                      <span className="text-lg font-[1000] text-slate-900 dark:text-white mt-0.5 block">
                        {entry.attentionSpanMins} <span className="text-xs text-slate-400 font-normal">mins</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Mental Clarity</span>
                      <span className="text-lg font-[1000] text-cyan-600 dark:text-cyan-400 mt-0.5 block">
                        {entry.mentalClarityScore} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Reaction Speed</span>
                      <span className="text-lg font-[1000] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {entry.reactionLatencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
                      </span>
                    </div>
                  </div>

                  {/* Reflection Notes */}
                  {entry.notes && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal my-2">
                      {entry.notes}
                    </p>
                  )}

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      {entry.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="ml-auto text-[10px] text-slate-400 font-mono">
                        Sleep Rest: {entry.sleepQualityPct}%
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Daily Entry Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Record Cognitive Journal
                    </h3>
                    <p className="text-xs text-slate-400">Capture daily focus, mood, and cognitive performance</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-5">
                {/* Date Input */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                    Entry Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>

                {/* Mood Selector */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                    Dominant Neuro-Affective Mood
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(MOOD_CONFIG).map(([moodKey, cfg]) => {
                      const isSelected = formMood === moodKey;
                      return (
                        <button
                          key={moodKey}
                          type="button"
                          onClick={() => setFormMood(moodKey as any)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400'
                          }`}
                        >
                          <span className="text-lg">{cfg.emoji}</span>
                          <span className="text-[11px] font-bold leading-tight truncate">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Focus Score Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Focus Score ({formFocus}%)
                    </label>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {formFocus >= 85 ? 'Deep Hyperfocus' : formFocus >= 70 ? 'High Focus' : formFocus >= 50 ? 'Steady' : 'Distracted'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={formFocus}
                    onChange={(e) => setFormFocus(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Performance Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      Attention Span (Mins)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="240"
                      value={formAttentionSpan}
                      onChange={(e) => setFormAttentionSpan(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      Mental Clarity (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formClarity}
                      onChange={(e) => setFormClarity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      Latency (ms)
                    </label>
                    <input
                      type="number"
                      min="120"
                      max="350"
                      value={formLatency}
                      onChange={(e) => setFormLatency(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Cognitive Load and Sleep */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      Cognitive Load State
                    </label>
                    <select
                      value={formLoad}
                      onChange={(e) => setFormLoad(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Optimal">Optimal (Low strain)</option>
                      <option value="Balanced">Balanced (Steady pace)</option>
                      <option value="Strained">Strained (Fatigue onset)</option>
                      <option value="Overloaded">Overloaded (Mental burnout)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      Prior Night Sleep Quality ({formSleepQuality}%)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={formSleepQuality}
                      onChange={(e) => setFormSleepQuality(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer mt-2"
                    />
                  </div>
                </div>

                {/* Behavioral Tags */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                    Focus Triggers & Behavioral Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TAGS.map((tag) => {
                      const active = formSelectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            active
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {active ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reflections Notes */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                    Daily Reflections & Observations
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe cognitive workflow, triggers, memory retention, or mental state..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-normal text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
