import React from 'react';
import { ShieldAlert, Bot, Cpu, Zap, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export const AccessRestriction: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[80vh] bg-slate-950 relative overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden font-mono text-[8px] leading-none text-emerald-500 break-all">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={`accessrestriction-l11-i-${i}`} className="whitespace-nowrap animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
            ACCESS_DENIED_IDENT_FAILED_CLEARANCE_REQUIRED_SYSTEM_ERROR_0x403_RETRY_ABORTED_ENCRYPTED_DATA_VAULT_DOCTORIAN_SECURE_NODE_
          </div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 space-y-12 max-w-2xl"
      >
        <div className="relative mx-auto w-32 h-32">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-dashed border-rose-500/20"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 rounded-full border border-rose-500/10"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-rose-600/10 rounded-3xl flex items-center justify-center border border-rose-500/30 backdrop-blur-xl">
              <ShieldAlert size={48} className="text-rose-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-rose-600/10 rounded-full border border-rose-600/30">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Critical Clearance Violation</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Neural <span className="text-rose-600">Lockout</span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-400 font-bold leading-relaxed max-w-md mx-auto">
            Biometric hash mismatch. Your clinical identity lacks the diagnostic clearance required to interface with this terminal.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto">
          {[
            { icon: <Lock size={16} />, label: "Encrypted" },
            { icon: <Bot size={16} />, label: "AI Locked" },
            { icon: <Cpu size={16} />, label: "Sys Logged" },
            { icon: <Zap size={16} />, label: "No Pulse" }
          ].map((item, i) => (
            <div key={`accessrestriction-l62-i-${i}`} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col items-center gap-2 opacity-50">
              <div className="text-rose-500">{item.icon}</div>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="pt-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-2xl shadow-white/5"
          >
            Return to Public Node
          </button>
        </div>
      </motion.div>

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-rose-600/30 rounded-tl-3xl" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-rose-600/30 rounded-tr-3xl" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-rose-600/30 rounded-bl-3xl" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-rose-600/30 rounded-br-3xl" />
    </div>
  );
};
