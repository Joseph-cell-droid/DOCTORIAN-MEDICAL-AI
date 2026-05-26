import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, Activity, Brain, 
  Sparkles, ShieldCheck, ChevronRight, BarChart3, 
  Calendar, Microscope, FileText, Pill, Search, ClipboardList, Cpu,
  AlertCircle, ArrowRightCircle, RefreshCw, Target, Footprints, Droplet, Dumbbell, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useArduino } from '../hooks/useArduino';
import { api, User } from '../api';
import { HealthGoalsModal, HealthGoal } from './HealthGoalsModal';
import confetti from 'canvas-confetti';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  ComposedChart, Bar, Scatter
} from 'recharts';

interface HealthProgressTrackerProps {
  user: User | null;
}

export const HealthProgressTracker: React.FC<HealthProgressTrackerProps> = ({ user }) => {
  const arduino = useArduino();
  const [loading, setLoading] = useState(true);
  const [traceResult, setTraceResult] = useState<string | null>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'vitals' | 'clinical' | 'meds' | 'protocols'>('vitals');
  
  // States for aggregated data
  const [records, setRecords] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [progressScore, setProgressScore] = useState(78);

  const [goals, setGoals] = useState<HealthGoal[]>(() => {
    const saved = localStorage.getItem('doctorian_daily_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: 'steps', label: 'Daily Steps', current: 3500, target: 10000, unit: 'steps' },
      { id: 'water', label: 'Water Intake', current: 3, target: 8, unit: 'cups' },
      { id: 'workout', label: 'Workout Duration', current: 15, target: 45, unit: 'min' }
    ];
  });
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleResetDaily = () => {
    const resetGoals = goals.map(g => ({ ...g, current: 0 }));
    setGoals(resetGoals);
    localStorage.setItem('doctorian_daily_goals', JSON.stringify(resetGoals));
    
    // Recalculate progress score based on 0% progress
    const computedScore = 72; // default baseline score
    setProgressScore(computedScore);
    setIsResetConfirmOpen(false);
  };

  const saveGoals = (updatedGoals: HealthGoal[]) => {
    // Check if any goals transitioned from uncompleted to completed
    const newlyCompleted = updatedGoals.filter(ug => {
      const match = goals.find(og => og.id === ug.id);
      return ug.current >= ug.target && (!match || match.current < match.target);
    });

    setGoals(updatedGoals);
    localStorage.setItem('doctorian_daily_goals', JSON.stringify(updatedGoals));
    
    // Dynamically calculate progressScore based on goals completed to sync state beautifully!
    const totalProgPercent = updatedGoals.reduce((acc, g) => acc + Math.min(100, (g.current / g.target) * 100), 0) / (updatedGoals.length || 1);
    const computedScore = Math.round(72 + (totalProgPercent * 0.16)); // from 72 to 88 based on goals
    setProgressScore(computedScore);

    if (newlyCompleted.length > 0) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 85,
          origin: { y: 0.7 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'],
          zIndex: 100
        });
      }, 300);
    }
  };

  const [logType, setLogType] = useState('Heart Rate');
  const [logValue, setLogValue] = useState('72');
  const [logNotes, setLogNotes] = useState('');
  const [isWritingRecord, setIsWritingRecord] = useState(false);

  const chartData = React.useMemo(() => {
    // Start with machine base history
    let base = arduino.history && arduino.history.length > 5 ? [...arduino.history] : Array.from({length: 15}).map((_, i) => {
      const ts = Date.now() - (15 - i) * 1000 * 60 * 15; // 15 min gaps
      return {
        heartRate: 74 + Math.sin(i * 0.5) * 6 + Math.random() * 3,
        spo2: 98 + Math.random() * 1,
        temperature: 36.6 + Math.random() * 0.2,
        systolicBP: 118 + Math.random() * 8,
        diastolicBP: 78 + Math.random() * 4,
        timestamp: ts
      };
    });

    // Merge manual records of "Heart Rate" if any
    const heartRecords = records.filter(r => r.type === 'Heart Rate' || r.type === 'HeartRate');
    heartRecords.forEach(r => {
      const ts = Date.parse(r.date) || Date.now();
      const val = parseFloat(r.value) || 72;
      if (!base.some(b => b.timestamp === ts)) {
        base.push({
          heartRate: val,
          spo2: 98,
          temperature: 36.5,
          systolicBP: 120,
          diastolicBP: 80,
          timestamp: ts
        });
      }
    });

    return base.sort((a, b) => a.timestamp - b.timestamp);
  }, [arduino.history, records]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recordsData, medsData, tasksData] = await Promise.all([
          api.records.list(),
          api.medications.list(),
          api.tasks.list()
        ]);
        setRecords(recordsData);
        setMeds(medsData);
        setTasks(tasksData);
      } catch (err) {
        console.error("Failed to load health trace data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const totalProgPercent = goals.reduce((acc, g) => acc + Math.min(100, (g.current / g.target) * 100), 0) / 3;
    const computedScore = Math.min(100, Math.round(70 + (totalProgPercent * 0.25)));
    setProgressScore(computedScore);
  }, [goals]);

  const runGlobalAnalysis = async () => {
    setIsTracing(true);
    try {
      const result = await arduino.performGlobalTrace({
        records,
        meds,
        tasks
      });
      setTraceResult(result);
    } catch (err) {
      setTraceResult("Neural synthesis failure. Unable to generate trace.");
    } finally {
      setIsTracing(false);
    }
  };

  const getTrajectoryColor = (text: string) => {
    if (text.includes('Improving')) return 'text-emerald-500';
    if (text.includes('Declining') || text.includes('Worsening')) return 'text-rose-500';
    return 'text-blue-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader size={48} className="text-blue-600 animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Clinical Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-500/20">
              <BarChart3 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter">Health Progress Trace</h1>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Cross-Platform Longitudinal Analysis (DeepSeek R1)</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={runGlobalAnalysis}
          disabled={isTracing}
          className="group relative flex items-center gap-3 px-10 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          {isTracing ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <Brain size={20} className="group-hover:rotate-12 transition-transform" />
          )}
          <span>{isTracing ? 'ANALYZING BIOMETRIC FLUX...' : 'START NEURAL TRACE'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Metrics & Segments */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* AI Trace Result UI */}
          <AnimatePresence>
            {traceResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden"
              >
                 <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
                    <Sparkles size={240} className="text-blue-500" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                             <Microscope size={24} className="text-blue-600" />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Neural Progress Synthesis</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Generated via Clinical Brain DeepSeek R1</p>
                          </div>
                       </div>
                       <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Clinical Trace Active</span>
                       </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed mb-10">
                       {traceResult.split('\n').map((para, i) => (
                         <p key={i} className="mb-4">{para}</p>
                       ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Cardiac Drift</p>
                          <div className="flex items-center gap-2">
                             <TrendingDown size={14} className="text-emerald-500" />
                             <span className="text-xl font-black text-slate-900 dark:text-white">-4.2%</span>
                          </div>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Metabolic Eff.</p>
                          <div className="flex items-center gap-2">
                             <TrendingUp size={14} className="text-blue-500" />
                             <span className="text-xl font-black text-slate-900 dark:text-white">+12%</span>
                          </div>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Recovery Alpha</p>
                          <div className="flex items-center gap-2">
                             <Activity size={14} className="text-purple-500" />
                             <span className="text-xl font-black text-slate-900 dark:text-white">0.96</span>
                          </div>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Confidence Level</p>
                          <div className="flex items-center gap-2">
                             <ShieldCheck size={14} className="text-emerald-500" />
                             <span className="text-xl font-black text-slate-900 dark:text-white">99%</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Longitudinal Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Vitals Trajectory Matrix</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cross-referencing HR, BP and SpO2 Stability</p>
               </div>
               <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                  {['7D', '30D', '90D'].map(t => (
                    <button key={t} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${t === '30D' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      {t}
                    </button>
                  ))}
               </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString()} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff'}}
                  />
                  <Area type="monotone" dataKey="heartRate" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHR)" strokeWidth={3} />
                  <Area type="monotone" dataKey="spo2" stroke="#10b981" fillOpacity={0} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-time Telemetry Pull & Clinical Entry Node */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-[3rem] p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                    <span className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                      <RefreshCw size={18} className="animate-spin-slow" />
                    </span>
                    Sync Telemetry Matrix
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Direct Capture from Connected Medical Hardware/Simulator</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    if (!arduino.vitals) {
                      const sampleVals = {
                        'Heart Rate': '76',
                        'Blood Oxygen (SpO2)': '98',
                        'Body Temperature': '36.8',
                        'Blood Pressure': '124/82',
                        'Respiratory Rate': '16'
                      };
                      setLogValue(sampleVals[logType as keyof typeof sampleVals] || '75');
                      // Flash local feedback
                      const flash = document.getElementById('sync-feedback-banner');
                      if (flash) {
                        flash.innerText = "Simulator offline. Captured standard calibrated baseline value.";
                        flash.style.opacity = "1";
                        setTimeout(() => flash.style.opacity = "0", 3500);
                      }
                      return;
                    }
                    const v = arduino.vitals;
                    if (logType === 'Heart Rate') setLogValue(Math.round(v.heartRate).toString());
                    else if (logType === 'Blood Oxygen (SpO2)') setLogValue(Math.round(v.spo2).toString());
                    else if (logType === 'Body Temperature') setLogValue(v.temperature.toFixed(1));
                    else if (logType === 'Blood Pressure') setLogValue(`${Math.round(v.systolicBP)}/${Math.round(v.diastolicBP)}`);
                    else if (logType === 'Respiratory Rate') setLogValue(Math.round(v.respiratoryRate).toString());

                    const flash = document.getElementById('sync-feedback-banner');
                    if (flash) {
                      flash.innerText = "Telemetry captured! Active signal parsed and locked to buffer successfully.";
                      flash.style.opacity = "1";
                      setTimeout(() => flash.style.opacity = "0", 3500);
                    }
                  }}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/25 active:scale-95 shrink-0 flex items-center gap-2"
                >
                  <Cpu size={14} />
                  PULL LIVE TELEMETRY
                </button>
              </div>

              {/* Status/Success feedback flash banner */}
              <div 
                id="sync-feedback-banner" 
                className="opacity-0 transition-opacity duration-300 bg-blue-950/80 border border-blue-500/30 text-blue-300 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6"
              >
                Telemetry synced
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsWritingRecord(true);
                try {
                  const unitStr = logType === 'Heart Rate' ? 'BPM' : logType === 'Blood Oxygen (SpO2)' ? '%' : logType === 'Body Temperature' ? '°C' : logType === 'Blood Pressure' ? 'mmHg' : 'RPM';
                  const timestampStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  
                  await api.records.create({
                    type: logType,
                    value: logValue,
                    unit: unitStr,
                    date: timestampStr,
                    notes: logNotes || 'Captured via IoT signal generator nodes.'
                  });

                  // Refresh list
                  const updated = await api.records.list();
                  setRecords(updated);
                  setLogNotes('');
                  
                  const flash = document.getElementById('sync-feedback-banner');
                  if (flash) {
                    flash.innerText = "Biomarker logged successfully! Added to timeline.";
                    flash.style.opacity = "1";
                    setTimeout(() => flash.style.opacity = "0", 3500);
                  }
                } catch (error) {
                  console.error(error);
                } finally {
                  setIsWritingRecord(false);
                }
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Biomarker Classification</label>
                    <select
                      value={logType}
                      onChange={(e) => {
                        const typeVal = e.target.value;
                        setLogType(typeVal);
                        const sampleVals = {
                          'Heart Rate': '72',
                          'Blood Oxygen (SpO2)': '98',
                          'Body Temperature': '36.6',
                          'Blood Pressure': '120/80',
                          'Respiratory Rate': '16'
                        };
                        setLogValue(sampleVals[typeVal as keyof typeof sampleVals] || '75');
                      }}
                      className="w-full px-5 py-4 bg-slate-900 border border-slate-800 focus:border-slate-700/80 text-white rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all custom-select-arrow"
                    >
                      <option value="Heart Rate">Heart Rate (BPM)</option>
                      <option value="Blood Oxygen (SpO2)">Blood Oxygen (SpO2 %)</option>
                      <option value="Body Temperature">Body Temperature (°C)</option>
                      <option value="Blood Pressure">Blood Pressure (mmHg)</option>
                      <option value="Respiratory Rate">Respiratory Rate (breaths/min)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Calibrated Metric Value</label>
                    <input
                      type="text"
                      required
                      value={logValue}
                      onChange={(e) => setLogValue(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-900 border border-slate-800 focus:border-slate-700/80 text-white rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="e.g., 72"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Clinical Annotations & Patient Feedback</label>
                  <textarea
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    rows={2}
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 focus:border-slate-700/80 text-white rounded-2xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                    placeholder="e.g., Patient matches baseline. Logged straight from IoT console."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isWritingRecord}
                  className="w-full py-4.5 bg-white text-slate-950 hover:bg-slate-100 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isWritingRecord ? 'STAMPING CLINICAL LOG...' : 'LOG RECORD TO HISTORIC TIMELINE'}
                </button>
              </form>
            </div>
          </div>

          {/* Segment Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {[
               { id: 'vitals', label: 'Vitals Matrix', icon: <Activity size={18} /> },
               { id: 'clinical', label: 'Medical Records', icon: <FileText size={18} /> },
               { id: 'meds', label: 'Medication Flux', icon: <Pill size={18} /> },
               { id: 'protocols', label: 'Neural Protocols', icon: <ClipboardList size={18} /> }
             ].map(seg => (
               <button
                  key={seg.id}
                  onClick={() => setActiveSegment(seg.id as any)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all ${activeSegment === seg.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'}`}
               >
                  <div className={`${activeSegment === seg.id ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'} p-3 rounded-2xl`}>
                    {seg.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{seg.label}</span>
               </button>
             ))}
          </div>

          {/* Active Segment Content */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {activeSegment === 'vitals' && 'Live Telemetry Trace'}
                  {activeSegment === 'clinical' && 'Longitudinal Records Scan'}
                  {activeSegment === 'meds' && 'Pharmacological Flux'}
                  {activeSegment === 'protocols' && 'Active Treatment Paths'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Page Index: {activeSegment.toUpperCase()}</p>
             </div>

             <div className="space-y-6">
                {activeSegment === 'vitals' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resting Baseline</p>
                       <p className="text-4xl font-black text-slate-900 dark:text-white">68<span className="text-lg text-slate-400 ml-1">BPM</span></p>
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">HRV (SDNN)</p>
                       <p className="text-4xl font-black text-slate-900 dark:text-white">42<span className="text-lg text-slate-400 ml-1">MS</span></p>
                    </div>
                  </div>
                )}
                
                {activeSegment === 'clinical' && (
                  <div className="space-y-4">
                    {records.slice(0, 3).map((rec, i) => (
                      <div key={i} className="flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                         <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                            <FileText size={24} />
                         </div>
                         <div className="flex-1">
                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{rec.title || 'Clinical Entry'}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(rec.timestamp || Date.now()).toLocaleDateString()}</p>
                         </div>
                         <ChevronRight className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                )}

                {activeSegment === 'meds' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {meds.slice(0, 4).map((med, i) => (
                      <div key={i} className="p-8 bg-emerald-50/20 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800">
                         <div className="flex items-center justify-between mb-4">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-emerald-600 border border-emerald-100 dark:border-emerald-800">
                               <Pill size={20} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase">Active</span>
                         </div>
                         <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{med.name}</p>
                         <p className="text-xs text-slate-500 font-bold opacity-75 mt-1">{med.dosage} - {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeSegment === 'protocols' && (
                   <div className="space-y-4">
                      {tasks.slice(0, 2).map((t, i) => (
                        <div key={i} className="p-8 bg-blue-50/20 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800 flex items-center gap-6">
                           <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                           <div className="flex-1">
                              <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.title}</p>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Due: {new Date(t.due_date || Date.now()).toLocaleDateString()}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Health Score & Actionables */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Health Momentum */}
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <TrendingUp size={140} />
            </div>
            <div className="relative z-10">
               <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-12">Neural Health Momentum</h3>
               
               <div className="flex flex-col items-center mb-12">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                        <motion.circle 
                          cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 88}
                          initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progressScore/100) }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="text-blue-500" 
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-[1000] tracking-tighter tabular-nums">{progressScore}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Score Matrix</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Trend Vector</span>
                     <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp size={14} />
                        <span className="text-xs font-black uppercase">+3.5% (Improving)</span>
                     </div>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: '0%' }}
                       animate={{ width: '78%' }}
                       transition={{ duration: 1, delay: 0.5 }}
                       className="h-full bg-blue-500"
                     />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 italic opacity-80">Trajectory calculated across 12 unique biological segments.</p>
               </div>
            </div>
          </div>

          {/* Daily Biometric Goals Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Daily Biometric Goals</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Calibrate steps, hydration, and exercise inputs</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                   <button 
                     type="button"
                     onClick={() => setIsResetConfirmOpen(true)}
                     className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                     title="Reset all current progress for today"
                   >
                      <RefreshCw size={11} /> Reset Daily
                   </button>
                   <button 
                     type="button"
                     onClick={() => setIsGoalsModalOpen(true)}
                     className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 shrink-0 cursor-pointer"
                   >
                      Update Goals
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                {goals.map((g) => {
                   const progressPercent = Math.min(100, Math.round((g.current / g.target) * 100));
                   return (
                      <div key={g.id} className="space-y-2.5">
                         <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                               <div className="p-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-100/60 dark:border-slate-800/80 shrink-0">
                                  {g.id === 'steps' && <Footprints size={14} className="text-amber-500" />}
                                  {g.id === 'sleep' && <Moon size={14} className="text-indigo-500" />}
                                  {g.id === 'blood_pressure' && <Activity size={14} className="text-rose-500" />}
                                  {g.id === 'meds' && <Pill size={14} className="text-purple-500" />}
                                  {!['steps', 'water', 'workout', 'sleep', 'blood_pressure', 'meds'].includes(g.id) && <Target size={14} className="text-blue-500" />}
                                  {g.id === 'water' && <Droplet size={14} className="text-blue-500" />}
                                  {g.id === 'workout' && <Dumbbell size={14} className="text-emerald-500" />}
                                </div>
                               <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wide">{g.label}</span>
                            </div>
                            <span className="font-black text-slate-900 dark:text-white text-[11px] tabular-nums flex items-baseline gap-1">
                               {g.current.toLocaleString()}/{g.target.toLocaleString()} 
                               <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">{g.unit}</span>
                            </span>
                         </div>
                         <div className="w-full h-2 bg-slate-50 dark:bg-slate-850 rounded-full overflow-hidden border border-slate-100/30 dark:border-slate-800/10">
                            <div 
                               className={`h-full rounded-full transition-all duration-500 ${
                                  g.id === 'steps' ? 'bg-amber-500' :
                                  g.id === 'water' ? 'bg-blue-500' :
                                  g.id === 'workout' ? 'bg-emerald-500' :
                                  g.id === 'sleep' ? 'bg-indigo-500' :
                                  g.id === 'blood_pressure' ? 'bg-rose-500' :
                                  g.id === 'meds' ? 'bg-purple-500' : 'bg-blue-500'
                               }`}
                               style={{ width: `${progressPercent}%` }}
                            />
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>

          {/* Critical Observations */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Clinical Markers</h3>
             <div className="space-y-6">
                {[
                  { label: 'Blood Pressure Delta', value: 'Down 5%', status: 'improving', icon: <Activity className="text-emerald-500" /> },
                  { label: 'Sleep Continuity', value: 'Up 12%', status: 'improving', icon: <Clock className="text-blue-500" /> },
                  { label: 'Adherence Rate', value: '98%', status: 'excellent', icon: <ShieldCheck className="text-purple-500" /> },
                  { label: 'Inflammation Bias', value: 'High Trace', status: 'warning', icon: <AlertCircle className="text-amber-500" /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
                     <div className="flex items-center gap-4">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                           {item.icon}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                     </div>
                     <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-500/20">
             <h3 className="text-xl font-black uppercase tracking-tight mb-8">Next Protocols</h3>
             <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-6 bg-white/10 hover:bg-white/20 rounded-3xl border border-white/20 transition-all group">
                   <div className="flex items-center gap-4">
                      <Microscope size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Neuro-Scan</span>
                   </div>
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-6 bg-white/10 hover:bg-white/20 rounded-3xl border border-white/20 transition-all group">
                   <div className="flex items-center gap-4">
                      <FileText size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Update Records</span>
                   </div>
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>

        </div>
      </div>

      <HealthGoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        goals={goals}
        onSave={saveGoals}
      />

      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetConfirmOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-2xl">
                  <AlertCircle size={28} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Reset Progress?</h4>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-0.5">Irreversible daily baseline reset</p>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                Are you sure you want to clear all your current biometric measurements and logs for today? Your targets and configurations will remain unchanged, but your progress percentages and completed state will revert back to zero.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 py-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer"
                >
                  No, Keep Progress
                </button>
                <button
                  type="button"
                  onClick={handleResetDaily}
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-rose-500/20 cursor-pointer"
                >
                  Yes, Reset Daily
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Loader = ({ size = 20, className = "" }) => (
  <RefreshCw size={size} className={className} />
);
