import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Brain, 
  Activity, 
  Lock, 
  Globe, 
  Stethoscope, 
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Bot,
  Heart
} from 'lucide-react';

interface LearnMoreProps {
  onBack: () => void;
}

export const LearnMore: React.FC<LearnMoreProps> = ({ onBack }) => {
  const coreFeatures = [
    {
      icon: Users,
      iconColor: "text-blue-600",
      title: "VHT Coordination",
      description: "Direct relay between rural Village Health Teams and clinical oversight centers. Bridging the 'last mile' of medical support in Uganda.",
      color: "bg-blue-50 dark:bg-blue-900/20",
      offset: "md:translate-y-0"
    },
    {
      icon: Heart,
      iconColor: "text-rose-600",
      title: "Maternal Support",
      description: "Specialized pathways for 'Olubuto' & 'Mimba' health. Real-time monitoring of preeclampsia and postnatal indicators.",
      color: "bg-rose-50 dark:bg-rose-900/20",
      offset: "md:translate-y-8"
    },
    {
      icon: Activity,
      iconColor: "text-emerald-600",
      title: "Logistics Engine",
      description: "Direct Boda-Boda voucher integration. Automated emergency transport dispatching for obstetric crises.",
      color: "bg-emerald-50 dark:bg-emerald-900/20",
      offset: "md:translate-y-16"
    }
  ];

  const systemSpecs = [
    { label: "Core Kernel", value: "Node.js v20+ / ESM", icon: <Zap size={16} /> },
    { label: "Intelligence Grid", value: "Llama 3.1 / Qwen 2.5", icon: <Brain size={16} /> },
    { label: "Data Persistence", value: "SQLite 3 / AES-256", icon: <Lock size={16} /> },
    { label: "Dialect Relay", value: "56+ Luganda/Swahili Vectors", icon: <Globe size={16} /> },
    { label: "Biosecurity", value: "WebAuthn / JWT Hybrid", icon: <Shield size={16} /> },
    { label: "Connectivity", value: "Local Ollama Node Support", icon: <ArrowRight size={16} /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 w-full box-border min-w-0">
      {/* Hero Section */}
      <div className="text-center mb-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-20 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10" />
        
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-10 shadow-sm"
        >
          <Bot size={14} className="text-blue-600" />
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Platform Specification v4.0.2</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-[0.9]"
        >
          Neural <br />Health <span className="text-blue-600">Grid</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-bold px-4"
        >
          Redefining rural maternal health through clinical AI, decentralized logistics, 
          and sub-Saharan clinical protocols.
        </motion.p>
      </div>

      {/* Floating Cards Features */}
      <div className="grid md:grid-cols-3 gap-10 mb-40 relative px-4">
        <div className="hidden md:block absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="hidden md:block absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/10 blur-3xl rounded-full" />
        
        {coreFeatures.map((feature, i) => (
          <motion.div
            key={`learnmore-l101-i-${i}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 + 0.2 }}
            className={`p-10 bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 group hover:border-blue-500 transition-all duration-500 ${feature.offset}`}
          >
            <div className={`w-20 h-20 ${feature.color} rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-lg`}>
              <feature.icon className={feature.iconColor} size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">{feature.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-lg">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* System Information - Modern Bento Layout */}
      <div className="mb-40">
        <div className="flex items-center gap-4 mb-16 justify-center md:justify-start overflow-x-hidden">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 hidden md:block" />
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white shrink-0">System Architecture</h2>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemSpecs.map((spec, i) => (
            <motion.div
              key={`learnmore-l127-i-${i}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 + 0.5 }}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl flex flex-col justify-between group hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all"
            >
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors mb-6">
                {spec.icon}
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{spec.label}</div>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{spec.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Secondary Info Sections */}
      <div className="grid lg:grid-cols-2 gap-10 mb-40">
        <div className="bg-slate-900 rounded-[3.5rem] p-12 sm:p-16 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] group-hover:scale-125 transition-transform duration-700" />
          <h3 className="text-3xl font-black mb-8 uppercase tracking-tighter flex items-center gap-4">
            <Compass className="text-blue-500" /> Clinical VHT Protocol
          </h3>
          <p className="text-slate-400 text-lg font-bold leading-relaxed mb-10">
            Village Health Teams are empowered with offline-sync records, allowing clinical data capture in zero-connectivity environments. 
            Data is synthesized into a secure clinical ledger upon node reconnection.
          </p>
          <div className="flex flex-wrap gap-3">
             {["Maternal Tracking", "Voucher Registry", "Specialist Referral", "Offline Sync"].map((tag, mapIdx_156) => (
               <span key={`learnmore-l158-${mapIdx_156}`} className="px-4 py-2 bg-slate-800 border border-white/5 rounded-full text-xs font-bold text-slate-400 uppercase tracking-widest">{tag}</span>
             ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 sm:p-16 border border-slate-100 dark:border-slate-800 shadow-xl group">
          <h3 className="text-3xl font-black mb-8 uppercase tracking-tighter flex items-center gap-4 text-slate-900 dark:text-white">
            <Bot className="text-emerald-500" /> AI Diagnostic Lab
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-bold leading-relaxed mb-10">
             Our Neural Hub integrates multiple LLM nodes (Gemini, Llama, Qwen) to verify clinical indicators across 56 dialects. 
             Local inference allows high-privacy diagnostic passes without cloud exposure.
          </p>
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Sub-100ms Latency Grid</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Dialect-Aware Medical Taxonomy</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center relative">
        <div className="absolute inset-x-0 -top-20 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mb-20" />
        <div className="mb-10 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Ready to harmonize clinical data?</div>
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-4 px-12 py-6 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition-all active:scale-95 group"
        >
          <span>ACTIVATE NEURAL SYNC</span>
          <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
};
