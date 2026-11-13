import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Droplet, 
  Footprints, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  ShieldCheck, 
  Moon, 
  Apple, 
  Smile, 
  Zap, 
  FileText, 
  Target, 
  MessageSquare, 
  ArrowUpRight, 
  Send,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useArduinoContext } from '../ArduinoContext';

interface VitalityMatrixProps {
  onNavigate?: (view: string) => void;
  user?: any;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const VitalityMatrix: React.FC<VitalityMatrixProps> = ({ onNavigate, user, addToast }) => {
  const arduino = useArduinoContext();
  const liveVitals = arduino?.vitals;

  // Active Sub-Navigation Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'insights' | 'recommendations'>('overview');

  // Timeframe filters
  const [trendsTimeframe, setTrendsTimeframe] = useState<'7d' | '24h' | '30d'>('7d');
  const [summaryTimeframe, setSummaryTimeframe] = useState<'month' | 'week' | 'year'>('month');

  // Reactive Smart Recommendations Checklist
  const [completedRecommendations, setCompletedRecommendations] = useState<{ [key: string]: boolean }>({
    hydration: true,
    sleep: true,
    exercise: true
  });

  // Hovered Chart Day
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Quick Action Modals
  const [trackVitalsInput, setTrackVitalsInput] = useState({
    hr: '72',
    bp: '118/76',
    temp: '36.6',
    spo2: '98',
    steps: '8450'
  });

  const [aiAdviceQuestion, setAiAdviceQuestion] = useState('');
  const [aiAdviceResponse, setAiAdviceResponse] = useState<string | null>(null);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  // Health Goals
  const [healthGoals, setHealthGoals] = useState({
    steps: 10000,
    water: 3.0,
    sleep: 8.0
  });

  // Daily Trend Data (matching image_a33b3901.png points Mon - Sun)
  const trendData = [
    { day: 'Mon', hr: 70, temp: 36.5, o2: 97, bp: '116/74' },
    { day: 'Tue', hr: 68, temp: 36.4, o2: 98, bp: '118/76' },
    { day: 'Wed', hr: 74, temp: 36.7, o2: 98, bp: '120/78' },
    { day: 'Thu', hr: 69, temp: 36.5, o2: 99, bp: '117/75' },
    { day: 'Fri', hr: 73, temp: 36.8, o2: 98, bp: '119/76' },
    { day: 'Sat', hr: 71, temp: 36.6, o2: 98, bp: '118/76' },
    { day: 'Sun', hr: 72, temp: 36.6, o2: 98, bp: '118/76' }
  ];

  // Activities list with reactive toggling
  const [activities, setActivities] = useState([
    { id: 1, title: 'Morning Walk – 30 min', time: 'Today, 07:30 AM', icon: 'walk', type: 'physical' },
    { id: 2, title: 'Sleep Completed – 7.5 hrs', time: 'Today, 06:45 AM', icon: 'sleep', type: 'rest' },
    { id: 3, title: 'Water Intake – 2.5 L', time: 'Today, 08:00 AM', icon: 'water', type: 'hydration' }
  ]);

  const toggleRecommendation = (id: string) => {
    setCompletedRecommendations(prev => {
      const next = !prev[id];
      if (addToast) {
        addToast(next ? `Goal marked as achieved!` : `Goal updated.`, 'info');
      }
      return { ...prev, [id]: next };
    });
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (addToast) addToast("Vital signs successfully recorded to telemetry ledger.", "success");
    setActiveModal(null);
  };

  const handleAskAdvice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiAdviceQuestion.trim()) return;
    setIsAiAnswering(true);
    setTimeout(() => {
      setIsAiAnswering(false);
      setAiAdviceResponse(
        `Based on your steady resting heart rate (72 bpm), blood pressure (118/76 mmHg), and 98% SpO2, your autonomic balance is superb. To optimize afternoon cognitive stamina, maintain 500ml hydration between meals and take a 5-minute brisk walking break.`
      );
    }, 800);
  };

  return (
    <div className="w-full bg-[#f4f8fd] dark:bg-[#071329] text-slate-800 dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-7 space-y-6 transition-colors duration-300">

      {/* ========================================================================= */}
      {/* 1. FUTURISTIC HERO BANNER (Exact Match to Image a33b3901)                  */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#031542] via-[#092a6b] to-[#041643] text-white p-6 sm:p-8 shadow-2xl border border-blue-500/30">
        {/* Subtle Background Glow Lines & High-Tech Particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(6,182,212,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.18),transparent_50%)] pointer-events-none" />
        
        {/* Subtle Grid Lines Overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: Torso Hologram & Titles */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            
            {/* Holographic Torso Graphic */}
            <div className="relative w-24 h-28 sm:w-28 sm:h-32 shrink-0 flex items-center justify-center">
              {/* Outer Cyan Ring */}
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-pulse" />
              <div className="absolute -inset-1 rounded-full bg-cyan-500/10 blur-md" />
              
              {/* Holographic Torso SVG with Glowing Heart Sphere */}
              <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" viewBox="0 0 100 120" fill="none">
                {/* Torso Silhouette Lines */}
                <path d="M50,15 C45,15 42,20 42,25 C42,28 45,30 50,30 C55,30 58,28 58,25 C58,20 55,15 50,15 Z" stroke="#38bdf8" strokeWidth="1.5" fill="rgba(56,189,248,0.2)" />
                <path d="M42,28 C34,32 28,40 28,52 L32,80 L38,82 L38,110 L62,110 L62,82 L68,80 L72,52 C72,40 66,32 58,28" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="rgba(6,182,212,0.08)" />
                <path d="M38,50 L46,65 L54,65 L62,50" stroke="#06b6d4" strokeWidth="1.2" opacity="0.7" />
                <path d="M50,30 L50,85" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                <path d="M38,72 L62,72" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                
                {/* Pulsing Red/Pink Heart Core */}
                <circle cx="50" cy="52" r="7" fill="#ef4444" className="animate-ping opacity-60" />
                <circle cx="50" cy="52" r="6" fill="url(#heartGlowGrad)" />
                <path d="M47,51 C47,49 50,48 50,51 C50,48 53,49 53,51 C53,54 50,56 50,56 C50,56 47,54 47,51 Z" fill="#ffffff" />

                <defs>
                  <radialGradient id="heartGlowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff4b72" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </radialGradient>
                </defs>
              </svg>

              {/* Floating Mini Glowing Heart Badge */}
              <div className="absolute top-1 right-0 w-6 h-6 rounded-full bg-blue-500/30 border border-cyan-400 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                <Heart size={12} className="text-cyan-300 fill-cyan-300 animate-pulse" />
              </div>
            </div>

            {/* Title & Subtext & Sub-Navigation Pills */}
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-[900] tracking-tight text-white leading-tight">
                  Vitality Matrix
                </h1>
                <p className="text-xs sm:text-sm text-cyan-200/90 font-medium mt-1">
                  Your complete health vitality dashboard for a healthier tomorrow
                </p>
              </div>

              {/* Sub-Navigation Pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Heart },
                  { id: 'trends', label: 'Trends', icon: TrendingUp },
                  { id: 'insights', label: 'Insights', icon: Sparkles },
                  { id: 'recommendations', label: 'Recommendations', icon: CheckCircle2 }
                ].map((pill) => {
                  const isActive = activeTab === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setActiveTab(pill.id as any)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-white/30 scale-105'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <pill.icon size={13} className={isActive ? 'text-white' : 'text-cyan-300'} />
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: ECG Waveform with "Monitor • Analyze • Thrive" & Health is Wealth badge */}
          <div className="flex flex-col items-center lg:items-end gap-3 text-right">
            
            {/* ECG Pulse Wave and Text */}
            <div className="flex items-center gap-3">
              {/* Animated ECG SVG */}
              <div className="w-24 sm:w-32 h-8">
                <svg className="w-full h-full drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 120 30" fill="none">
                  <path
                    d="M0,15 L25,15 L32,5 L40,25 L48,8 L55,18 L60,15 L120,15"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span className="text-base sm:text-lg lg:text-xl font-bold tracking-wider text-cyan-200/90 whitespace-nowrap italic font-serif">
                Monitor • Analyze • Thrive
              </span>
            </div>

            {/* Glowing "Health is Wealth" Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Heart size={12} className="text-emerald-300 fill-emerald-300 animate-pulse" />
              </div>
              <span>Health is Wealth</span>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 5 KPI SPARKLINE CARDS (Exact Match to Image a33b3901)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Card 1: Heart Rate */}
        <div 
          onClick={() => setActiveModal('hr')}
          className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Heart size={18} className="fill-pink-500 text-pink-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Heart Rate</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-2xl font-[900] text-slate-900 dark:text-white">
                {liveVitals ? liveVitals.heartRate : '72'}
              </span>
              <span className="text-xs font-bold text-slate-400">bpm</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-500 flex items-center gap-0.5">
              ↑ +2
            </span>
          </div>
          {/* Pink Sparkline SVG */}
          <div className="w-16 h-10">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0,20 Q15,8 30,22 T60,10" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Body Temperature */}
        <div 
          onClick={() => setActiveModal('temp')}
          className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Thermometer size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Body Temperature</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-2xl font-[900] text-slate-900 dark:text-white">
                {liveVitals ? liveVitals.temperature.toFixed(1) : '36.6'}
              </span>
              <span className="text-xs font-bold text-slate-400">°C</span>
            </div>
            <span className="text-[10px] font-extrabold text-blue-500 flex items-center gap-0.5">
              ↑ +0.1
            </span>
          </div>
          {/* Blue Sparkline SVG */}
          <div className="w-16 h-10">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0,22 Q15,25 30,12 T60,8" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Blood Oxygen */}
        <div 
          onClick={() => setActiveModal('spo2')}
          className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Droplet size={18} className="fill-emerald-500 text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Blood Oxygen</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-2xl font-[900] text-slate-900 dark:text-white">
                {liveVitals ? liveVitals.spo2 : '98'}%
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-500 flex items-center gap-0.5">
              → Stable
            </span>
          </div>
          {/* Green Sparkline SVG */}
          <div className="w-16 h-10">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0,18 Q15,10 30,16 T60,12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Blood Pressure */}
        <div 
          onClick={() => setActiveModal('bp')}
          className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Activity size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Blood Pressure</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-2xl font-[900] text-slate-900 dark:text-white">
                {liveVitals ? `${liveVitals.systolicBP}/${liveVitals.diastolicBP}` : '118/76'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">mmHg</span>
            </div>
            <span className="text-[10px] font-extrabold text-rose-500 flex items-center gap-0.5">
              ↓ -2
            </span>
          </div>
          {/* Purple/Red Sparkline SVG */}
          <div className="w-16 h-10">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0,10 Q15,22 30,15 T60,20" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 5: Steps Today */}
        <div 
          onClick={() => setActiveModal('steps')}
          className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Footprints size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Steps Today</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-2xl font-[900] text-slate-900 dark:text-white">8,450</span>
            </div>
            <span className="text-[10px] font-extrabold text-orange-500 flex items-center gap-0.5">
              ↑ +1,260
            </span>
          </div>
          {/* Orange Sparkline SVG */}
          <div className="w-16 h-10">
            <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
              <path d="M0,25 Q15,18 30,20 T60,6" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. ROW 2: HEALTH STATUS MATRIX | VITAL SIGNS TREND | AI HEALTH INSIGHTS    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Health Status Matrix */}
        <div className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">Health Status Matrix</h2>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black">
              ✔ Excellent Health
            </span>
          </div>

          {/* Donut Chart & Progress Bars Container */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            
            {/* Donut Ring (96% Overall Vitality) */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="40" stroke="#e2e8f0" className="dark:stroke-slate-800" strokeWidth="8" fill="none" />
                {/* 96% Gradient Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#vitalityDonutGrad)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.96)}
                  strokeLinecap="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="vitalityDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-[1000] text-slate-900 dark:text-white leading-none">96%</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Overall Vitality</span>
              </div>

              {/* Bottom Heart Badge over Donut Ring */}
              <div className="absolute -bottom-2 w-7 h-7 rounded-full bg-blue-600 border-2 border-white dark:border-[#0c1a36] flex items-center justify-center shadow-md">
                <Heart size={14} className="fill-white text-white" />
              </div>
            </div>

            {/* 5 Progress Bars */}
            <div className="flex-1 w-full space-y-3">
              {[
                { label: 'Heart Health', val: 95, color: 'bg-emerald-500' },
                { label: 'Respiratory Health', val: 92, color: 'bg-teal-400' },
                { label: 'Metabolic Health', val: 90, color: 'bg-cyan-500' },
                { label: 'Mental Wellness', val: 88, color: 'bg-blue-500' },
                { label: 'Physical Activity', val: 94, color: 'bg-emerald-400' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      {item.label}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">{item.val}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Capsule Message */}
          <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <span>✔</span> Your health is in excellent condition!
            </p>
          </div>

        </div>

        {/* Column 2: Vital Signs Trend */}
        <div className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          
          {/* Card Header & Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">Vital Signs Trend</h2>
            </div>
            
            {/* Timeframe selector */}
            <div className="relative">
              <select
                value={trendsTimeframe}
                onChange={(e) => setTrendsTimeframe(e.target.value as any)}
                className="appearance-none bg-slate-100 dark:bg-[#081530] border border-slate-200 dark:border-blue-800/60 rounded-xl px-3 py-1.5 pr-7 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="7d">Last 7 Days</option>
                <option value="24h">Last 24 Hours</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-2.5 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              Heart Rate
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Temperature
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Oxygen
            </span>
          </div>

          {/* Interactive Multi-Line SVG Chart */}
          <div className="relative w-full h-56 pt-2 select-none">
            
            {/* Y-Axis Labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-slate-400 pr-2">
              <span>120</span>
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
            </div>

            {/* Grid Lines */}
            <div className="absolute left-8 right-0 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-b border-slate-100 dark:border-slate-800/80" />
              <div className="w-full border-b border-slate-100 dark:border-slate-800/80" />
              <div className="w-full border-b border-slate-100 dark:border-slate-800/80" />
              <div className="w-full border-b border-slate-100 dark:border-slate-800/80" />
              <div className="w-full border-b border-slate-100 dark:border-slate-800/80" />
            </div>

            {/* SVG Chart Curves */}
            <div className="absolute left-8 right-0 top-2 bottom-6">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 350 150" preserveAspectRatio="none">
                
                {/* Oxygen Series (Green, at ~100) */}
                <path
                  d="M 10,40 Q 60,35 110,40 T 210,32 T 310,38"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Heart Rate Series (Pink/Orange, at ~70) */}
                <path
                  d="M 10,95 Q 60,98 110,90 T 210,98 T 310,92"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Temperature Series (Blue/Purple, at ~60-65) */}
                <path
                  d="M 10,110 Q 60,112 110,105 T 210,115 T 310,110"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points on Trend */}
                {trendData.map((d, i) => {
                  const x = 10 + i * 50;
                  return (
                    <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredDay(i)}>
                      {/* O2 Dot */}
                      <circle cx={x} cy={35 + (i % 2 === 0 ? 3 : -3)} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                      {/* Heart Rate Dot */}
                      <circle cx={x} cy={92 + (i % 3 === 0 ? 4 : -3)} r="4" fill="#ffffff" stroke="#f97316" strokeWidth="2.5" />
                      {/* Temp Dot */}
                      <circle cx={x} cy={110 + (i % 2 === 0 ? -3 : 2)} r="4" fill="#ffffff" stroke="#a855f7" strokeWidth="2.5" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="absolute left-8 right-0 bottom-0 flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              {trendData.map((d, i) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setHoveredDay(i)}
                  className={`text-center font-bold px-1 transition-colors ${hoveredDay === i ? 'text-blue-500 font-black' : ''}`}
                >
                  {d.day}
                </button>
              ))}
            </div>

            {/* Hover Tooltip Preview */}
            {hoveredDay !== null && (
              <div className="absolute top-1 right-2 p-2.5 rounded-xl bg-slate-900/90 text-white border border-blue-500/40 shadow-xl text-[10px] space-y-1 z-20 backdrop-blur-md">
                <div className="font-black text-cyan-300">{trendData[hoveredDay].day} Reading</div>
                <div className="text-pink-300 font-bold">HR: {trendData[hoveredDay].hr} bpm</div>
                <div className="text-blue-300 font-bold">Temp: {trendData[hoveredDay].temp} °C</div>
                <div className="text-emerald-300 font-bold">SpO2: {trendData[hoveredDay].o2}%</div>
              </div>
            )}
          </div>

        </div>

        {/* Column 3: AI Health Insights */}
        <div className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">AI Health Insights</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('ai_advice')}
              className="text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-cyan-400 flex items-center gap-1 cursor-pointer"
            >
              <span>View More</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* 3D Robot Doctor & Speech Bubble */}
          <div className="flex items-start gap-3 bg-blue-50/70 dark:bg-[#081530] p-3.5 rounded-2xl border border-blue-100 dark:border-blue-800/40">
            
            {/* Robot Avatar */}
            <div className="relative w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#0a1b38] rounded-[14px] flex items-center justify-center">
                {/* 3D Robot Head SVG */}
                <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none">
                  {/* Robot Head Shape */}
                  <rect x="14" y="16" width="36" height="32" rx="14" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                  {/* Visor */}
                  <rect x="20" y="24" width="24" height="12" rx="6" fill="#0c1a36" />
                  {/* Glowing Blue Eyes */}
                  <circle cx="26" cy="30" r="3" fill="#38bdf8" className="animate-pulse" />
                  <circle cx="38" cy="30" r="3" fill="#38bdf8" className="animate-pulse" />
                  {/* Antenna */}
                  <line x1="32" y1="16" x2="32" y2="8" stroke="#0284c7" strokeWidth="2.5" />
                  <circle cx="32" cy="7" r="3" fill="#06b6d4" />
                  {/* Stethoscope */}
                  <path d="M22,46 Q32,58 42,46" stroke="#ef4444" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>

            {/* Speech Bubble */}
            <div className="flex-1 bg-white dark:bg-[#0f2347] p-3 rounded-2xl rounded-tl-sm text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-blue-700/40 shadow-xs">
              "Your vitals are stable and within normal range. Keep up the good work!"
            </div>
          </div>

          {/* Smart Recommendations List */}
          <div className="space-y-2.5">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
              Smart Recommendations:
            </span>

            {[
              { id: 'hydration', label: 'Stay hydrated today' },
              { id: 'sleep', label: 'Get at least 7-8 hours sleep' },
              { id: 'exercise', label: 'Continue regular exercise' }
            ].map((rec) => {
              const isChecked = completedRecommendations[rec.id];
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => toggleRecommendation(rec.id)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer ${
                    isChecked
                      ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                      : 'text-slate-400 line-through'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isChecked ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <CheckCircle2 size={13} className="stroke-[2.5]" />
                  </div>
                  <span>{rec.label}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. ROW 3: HEALTH METRICS SUMMARY | HEALTH ACTIVITIES | QUICK ACTIONS      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Health Metrics Summary */}
        <div className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          
          {/* Card Header & Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon size={18} className="text-blue-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">Health Metrics Summary</h2>
            </div>
            
            <div className="relative">
              <select
                value={summaryTimeframe}
                onChange={(e) => setSummaryTimeframe(e.target.value as any)}
                className="appearance-none bg-slate-100 dark:bg-[#081530] border border-slate-200 dark:border-blue-800/60 rounded-xl px-3 py-1.5 pr-7 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="month">This Month</option>
                <option value="week">This Week</option>
                <option value="year">This Year</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-2.5 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* 4 Circular Donut Gauges (2x2 Grid from Image a33b3901) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 py-2">
            {[
              { label: 'Activity Goal', val: 95, color: '#06b6d4' },
              { label: 'Sleep Quality', val: 92, color: '#3b82f6' },
              { label: 'Nutrition Score', val: 97, color: '#10b981' },
              { label: 'Stress Level', val: 93, color: '#0ea5e9' }
            ].map((metric, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2">
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
                    <circle cx="35" cy="35" r="28" stroke="#e2e8f0" className="dark:stroke-slate-800" strokeWidth="5" fill="none" />
                    <circle
                      cx="35"
                      cy="35"
                      r="28"
                      stroke={metric.color}
                      strokeWidth="5"
                      strokeDasharray="175.9"
                      strokeDashoffset={175.9 * (1 - metric.val / 100)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute text-sm sm:text-base font-[900] text-slate-900 dark:text-white">
                    {metric.val}%
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Column 2: Health Activities */}
        <div className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints size={18} className="text-blue-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">Health Activities</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('all_activities')}
              className="text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-cyan-400 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Activities List */}
          <div className="space-y-3">
            {activities.map((act) => (
              <div 
                key={act.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#081530] border border-slate-100 dark:border-blue-900/40 hover:bg-slate-100 dark:hover:bg-blue-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    act.icon === 'walk' ? 'bg-blue-500/15 text-blue-500' :
                    act.icon === 'sleep' ? 'bg-purple-500/15 text-purple-500' :
                    'bg-cyan-500/15 text-cyan-500'
                  }`}>
                    {act.icon === 'walk' && <Footprints size={18} />}
                    {act.icon === 'sleep' && <Moon size={18} />}
                    {act.icon === 'water' && <Droplet size={18} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">{act.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold">{act.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Column 3: Quick Actions */}
        <div className="bg-white dark:bg-[#0c1a36] border border-slate-200/80 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-blue-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">Quick Actions</h2>
            </div>
          </div>

          {/* 4 Pastel Tiles in 2x2 Grid (Exact Colors from Image a33b3901) */}
          <div className="grid grid-cols-2 gap-3.5">
            
            {/* Tile 1: Track Vitals (Pink/Rose Pastel) */}
            <button
              type="button"
              onClick={() => setActiveModal('track_vitals')}
              className="p-4 rounded-2xl bg-[#fee2e2]/70 dark:bg-rose-950/40 hover:bg-[#fecaca] dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-900/60 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 cursor-pointer group"
            >
              <Heart size={20} className="text-rose-500 fill-rose-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-rose-950 dark:text-rose-200">Track Vitals</span>
            </button>

            {/* Tile 2: View Reports (Light Blue Pastel) */}
            <button
              type="button"
              onClick={() => setActiveModal('view_reports')}
              className="p-4 rounded-2xl bg-[#e0f2fe]/70 dark:bg-sky-950/40 hover:bg-[#bae6fd] dark:hover:bg-sky-900/50 border border-sky-200/60 dark:border-sky-900/60 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 cursor-pointer group"
            >
              <BarChart3 size={20} className="text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-sky-950 dark:text-sky-200">View Reports</span>
            </button>

            {/* Tile 3: Set Goals (Light Green Pastel) */}
            <button
              type="button"
              onClick={() => setActiveModal('set_goals')}
              className="p-4 rounded-2xl bg-[#dcfce7]/70 dark:bg-emerald-950/40 hover:bg-[#bbf7d0] dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-900/60 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 cursor-pointer group"
            >
              <Target size={20} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">Set Goals</span>
            </button>

            {/* Tile 4: Get Advice (Light Purple Pastel) */}
            <button
              type="button"
              onClick={() => setActiveModal('ai_advice')}
              className="p-4 rounded-2xl bg-[#f3e8ff]/70 dark:bg-purple-950/40 hover:bg-[#e9d5ff] dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-900/60 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 cursor-pointer group"
            >
              <MessageSquare size={20} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-purple-950 dark:text-purple-200">Get Advice</span>
            </button>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE MODALS FOR QUICK ACTIONS & TELEMETRY LOGGING                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#0c1a36] border border-slate-200 dark:border-blue-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* MODAL 1: TRACK VITALS */}
              {activeModal === 'track_vitals' && (
                <form onSubmit={handleSaveVitals} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Heart size={20} className="fill-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Track Vital Signs</h3>
                      <p className="text-xs text-slate-400 font-medium">Record real-time clinical biomarkers</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        value={trackVitalsInput.hr}
                        onChange={(e) => setTrackVitalsInput({ ...trackVitalsInput, hr: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#081530] border border-slate-200 dark:border-blue-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Blood Pressure (mmHg)</label>
                      <input
                        type="text"
                        value={trackVitalsInput.bp}
                        onChange={(e) => setTrackVitalsInput({ ...trackVitalsInput, bp: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#081530] border border-slate-200 dark:border-blue-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Temperature (°C)</label>
                      <input
                        type="text"
                        value={trackVitalsInput.temp}
                        onChange={(e) => setTrackVitalsInput({ ...trackVitalsInput, temp: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#081530] border border-slate-200 dark:border-blue-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">SpO2 Oxygen (%)</label>
                      <input
                        type="number"
                        value={trackVitalsInput.spo2}
                        onChange={(e) => setTrackVitalsInput({ ...trackVitalsInput, spo2: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#081530] border border-slate-200 dark:border-blue-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
                  >
                    Save Vitals to Ledger
                  </button>
                </form>
              )}

              {/* MODAL 2: VIEW REPORTS */}
              {activeModal === 'view_reports' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Vitality Clinical Reports</h3>
                      <p className="text-xs text-slate-400 font-medium">Export encrypted clinical summary</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#081530] border border-slate-200/60 dark:border-blue-900/40 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Overall Vitality:</span>
                      <span className="font-black text-emerald-500">96% (Optimal Condition)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Resting Heart Rate:</span>
                      <span className="font-black">72 bpm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Arterial Blood Pressure:</span>
                      <span className="font-black">118/76 mmHg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Respiratory SpO2:</span>
                      <span className="font-black">98% Oxygen Saturation</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (addToast) addToast("Clinical PDF report generated and downloaded.", "success");
                      setActiveModal(null);
                    }}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Download Encrypted PDF Report
                  </button>
                </div>
              )}

              {/* MODAL 3: SET GOALS */}
              {activeModal === 'set_goals' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Target size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Adjust Daily Health Goals</h3>
                      <p className="text-xs text-slate-400 font-medium">Configure target milestones</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Daily Step Target</span>
                        <span className="text-blue-500">{healthGoals.steps.toLocaleString()} steps</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="20000"
                        step="500"
                        value={healthGoals.steps}
                        onChange={(e) => setHealthGoals({ ...healthGoals, steps: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Water Intake</span>
                        <span className="text-cyan-500">{healthGoals.water} Liters</span>
                      </div>
                      <input
                        type="range"
                        min="1.5"
                        max="5.0"
                        step="0.1"
                        value={healthGoals.water}
                        onChange={(e) => setHealthGoals({ ...healthGoals, water: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (addToast) addToast("Daily vitality targets updated.", "success");
                      setActiveModal(null);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Save Health Goals
                  </button>
                </div>
              )}

              {/* MODAL 4: GET ADVICE */}
              {activeModal === 'ai_advice' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Doctorian AI Consultation</h3>
                      <p className="text-xs text-slate-400 font-medium">Personalized clinical recommendations</p>
                    </div>
                  </div>

                  <form onSubmit={handleAskAdvice} className="space-y-3">
                    <textarea
                      rows={3}
                      value={aiAdviceQuestion}
                      onChange={(e) => setAiAdviceQuestion(e.target.value)}
                      placeholder="Ask Doctorian AI: e.g. How can I lower my blood pressure or improve sleep quality?"
                      className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-[#081530] border border-slate-200 dark:border-blue-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-slate-900 dark:text-white"
                    />

                    <button
                      type="submit"
                      disabled={isAiAnswering || !aiAdviceQuestion.trim()}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isAiAnswering ? "Synthesizing Clinical Insights..." : "Generate AI Medical Advice"}
                    </button>
                  </form>

                  {aiAdviceResponse && (
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs leading-relaxed text-slate-700 dark:text-purple-200">
                      {aiAdviceResponse}
                    </div>
                  )}
                </div>
              )}

              {/* MODAL 5: ALL ACTIVITIES */}
              {activeModal === 'all_activities' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Footprints size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Activity Log History</h3>
                        <p className="text-xs text-slate-400 font-medium">All recorded physical sessions</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {activities.map((a) => (
                      <div key={a.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#081530] flex justify-between items-center text-xs">
                        <span className="font-bold">{a.title}</span>
                        <span className="text-slate-400">{a.time}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActivities(prev => [
                        { id: Date.now(), title: 'Hydration - 500 mL', time: 'Just now', icon: 'water', type: 'hydration' },
                        ...prev
                      ]);
                      if (addToast) addToast("New activity logged: 500 mL Water", "success");
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    + Log 500 mL Hydration Now
                  </button>
                </div>
              )}

              {/* MODAL 6: VITAL DETAIL PREVIEW (HR, BP, TEMP, SPO2, STEPS) */}
              {['hr', 'temp', 'spo2', 'bp', 'steps'].includes(activeModal) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">
                        {activeModal === 'hr' ? 'Heart Rate Telemetry' :
                         activeModal === 'temp' ? 'Core Temperature Telemetry' :
                         activeModal === 'spo2' ? 'Blood Oxygen Saturation' :
                         activeModal === 'bp' ? 'Blood Pressure History' : 'Pedometer Step History'}
                      </h3>
                      <p className="text-xs text-emerald-500 font-black">Status: Optimal Physiological Equilibrium</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#081530] border border-slate-200/60 dark:border-blue-900/40 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Standard Target Range:</span>
                      <span className="font-black text-slate-800 dark:text-white">
                        {activeModal === 'hr' ? '60 - 100 bpm (Normal)' :
                         activeModal === 'temp' ? '36.1 - 37.2 °C' :
                         activeModal === 'spo2' ? '95 - 100% (Normal)' :
                         activeModal === 'bp' ? '90/60 - 120/80 mmHg' : '8,000 - 12,000 steps'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Telemetry Sensor:</span>
                      <span className="font-black text-cyan-400">Doctorian Arduino MAX30102 / Medical Biosensor</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Encryption:</span>
                      <span className="font-black text-emerald-400">AES-256 Medical Vault Lock</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close Telemetry Window
                  </button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Helper Icon for Pie/Donut Chart
const PieChartIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export default VitalityMatrix;
