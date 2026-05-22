import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bot, Zap, Crown, ShieldCheck } from 'lucide-react';
import { Billing } from './Billing';

interface SubscriptionModalProps {
  user: any;
  onUpdateUser: (user: any) => void;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function SubscriptionModal({ user, onUpdateUser, onClose, onShowToast }: SubscriptionModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Crown className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Upgrade Neural Protocol</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Baseline Established</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
           <div className="p-4 sm:p-8">
              <div className="mb-12 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <ShieldCheck size={120} />
                </div>
                <div className="relative z-10 max-w-xl">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Neural Limits Reached</h3>
                  <p className="text-blue-100 font-bold leading-relaxed mb-8 text-lg">Your current bandwidth for medical intelligence synthesis has been exhausted. Reactivate your link with a specialized protocol to continue deep-layer clinical diagnostics.</p>
                  <div className="flex flex-wrap gap-4">
                     <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                        <p className="text-[8px] font-black uppercase text-blue-200">Current Status</p>
                        <p className="text-sm font-black">0 Neural Units Remaining</p>
                     </div>
                  </div>
                </div>
              </div>

              <Billing 
                user={user} 
                onUpdateUser={onUpdateUser} 
                onShowToast={onShowToast}
              />
           </div>
        </div>
      </motion.div>
    </div>
  );
}
