import React, { useState } from 'react';
import { 
  Bot, Cpu, Mic, Palette, Shield, Radio, Zap, Plus, 
  CheckCircle2, Activity, ArrowRight, Sparkles, Stethoscope, Wifi 
} from 'lucide-react';
import { motion } from 'motion/react';

interface BioMonitorCommandCenterProps {
  onSelectFeature?: (featureTitle: string) => void;
  onOpenLiveStatus?: () => void;
}

export const BioMonitorCommandCenter: React.FC<BioMonitorCommandCenterProps> = ({ 
  onSelectFeature, 
  onOpenLiveStatus 
}) => {
  const [activeToast, setActiveToast] = useState<string | null>("Sensor stream active for live patient health status");

  const features = [
    {
      no: "1.",
      icon: <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: "Advanced AI Agents",
      subtitle: "AI Health Intelligence",
      description: "AI that understands patient requests, performs clinical tasks, generates automated reports, searches telemetry, and streamlines hospital workflows.",
      tasks: "5.2k",
      success: "98.9%",
      avg: "42ms",
      workload: 67,
      color: "from-blue-600 to-indigo-600"
    },
    {
      no: "2.",
      icon: <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Offline & On-Device AI",
      subtitle: "Local Edge Processing",
      description: "Run local AI models on wearable sensors, access saved vital information without internet, and synchronise seamlessly when connectivity returns.",
      tasks: "3.8k",
      success: "97.2%",
      avg: "38ms",
      workload: 54,
      color: "from-emerald-600 to-teal-600"
    },
    {
      no: "3.",
      icon: <Mic className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: "Multimodal Interaction",
      subtitle: "Voice & Biometric Feed",
      description: "Voice conversations, speech recognition for clinical notes, image analysis of diagnostic scans, text-to-speech alerts, and live translation.",
      tasks: "7.1k",
      success: "99.4%",
      avg: "31ms",
      workload: 82,
      color: "from-purple-600 to-pink-600"
    },
    {
      no: "4.",
      icon: <Palette className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      title: "Adaptive Modern UI/UX",
      subtitle: "Clinical Glassmorphism",
      description: "Premium interfaces, glassmorphism telemetry cards, smooth animations, dark/light clinical modes, responsive layouts, and personalised dashboards.",
      tasks: "4.5k",
      success: "99.1%",
      avg: "28ms",
      workload: 60,
      color: "from-amber-600 to-orange-600"
    },
    {
      no: "5.",
      icon: <Shield className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      title: "Advanced Security",
      subtitle: "DPPA & Biometric Shield",
      description: "Passkeys, biometric authentication, two-factor authorization, end-to-end telemetry encryption, and strict medical device management.",
      tasks: "8.9k",
      success: "99.9%",
      avg: "19ms",
      workload: 45,
      color: "from-rose-600 to-red-600"
    },
    {
      no: "6.",
      icon: <Radio className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
      title: "Real-Time Connectivity",
      subtitle: "Live Sensor Stream",
      description: "Live sensor messaging, instant emergency notifications, sub-second telemetry synchronization, live dashboards, and background updates.",
      tasks: "12.4k",
      success: "99.7%",
      avg: "15ms",
      workload: 91,
      color: "from-cyan-600 to-blue-600"
    },
    {
      no: "7.",
      icon: <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Smart Automation & Personalization",
      subtitle: "Predictive Vitals Engine",
      description: "Intelligent clinical reminders, predictive anomaly recommendations, automated emergency workflows, user preferences, and interactive widgets.",
      tasks: "6.3k",
      success: "98.5%",
      avg: "35ms",
      workload: 73,
      color: "from-indigo-600 to-violet-600"
    }
  ];

  return (
    <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 space-y-10">
      {/* Top Command Action Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={onOpenLiveStatus}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Create Health Stream</span>
          </button>
          
          <button
            onClick={() => {
              setActiveToast("AI Clinician agent analyzing real-time sensor streams...");
              setTimeout(() => setActiveToast(null), 4000);
            }}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          >
            <Sparkles size={16} className="text-blue-500" />
            <span>Ask AI Clinician</span>
          </button>

          <button
            onClick={() => {
              setActiveToast("Sensor telemetry sync completed successfully.");
              setTimeout(() => setActiveToast(null), 4000);
            }}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          >
            <Activity size={16} className="text-emerald-500" />
            <span>Run Sensor Sync</span>
          </button>
        </div>

        {/* Notification Toast Pill */}
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 px-5 py-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl shadow-sm text-emerald-800 dark:text-emerald-200 text-xs font-black uppercase tracking-wider"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>{activeToast}</span>
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />
          </motion.div>
        )}
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-2">
            <Stethoscope size={16} />
            <span>Real-Time Sensor Health Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight uppercase">
            Your Autonomous Bio-Monitor Workforce
          </h2>
        </div>
        
        <button
          onClick={onOpenLiveStatus}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-400 text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Add Sensor Node</span>
        </button>
      </div>

      {/* Grid of 7 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <motion.div
            key={`biomonitor-feat-${idx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => {
              if (onSelectFeature) onSelectFeature(feat.title);
              if (onOpenLiveStatus) onOpenLiveStatus();
            }}
            className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Icon & Status */}
              <div className="flex items-center justify-between mb-8">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-inner group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                  {feat.no} {feat.subtitle}
                </span>
                <h3 className="text-xl font-[1000] text-slate-900 dark:text-white tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                  {feat.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {feat.description}
              </p>
            </div>

            {/* Bottom Metrics & Progress */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Records</p>
                  <p className="text-xs font-[1000] text-slate-900 dark:text-white">{feat.tasks}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Success</p>
                  <p className="text-xs font-[1000] text-emerald-600 dark:text-emerald-400">{feat.success}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Latency</p>
                  <p className="text-xs font-[1000] text-blue-600 dark:text-blue-400">{feat.avg}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Sensor Workload Sync</span>
                  <span className="text-blue-600 dark:text-blue-400">{feat.workload}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${feat.workload}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full bg-gradient-to-r ${feat.color} rounded-full`}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Open Live Sensor Status</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
