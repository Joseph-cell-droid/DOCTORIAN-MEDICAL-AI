import React, { useState } from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DoctorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const DoctorVerificationModal: React.FC<DoctorVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Clinical Access Required",
  description = "This action requires direct medical officer authentication. Please enter your Doctorian clinical key to proceed."
}) => {
  const [password, setPassword] = useState('DOC@Protocol2');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (password === 'DOC@Protocol2' || password === '1234' || password === 'admin@2026@Doctorian') {
      if (password === 'DOC@Protocol2') {
        sessionStorage.setItem('doctor_authenticated', 'true');
      } else {
        localStorage.setItem('doctorian_is_admin', 'true');
        sessionStorage.setItem('doctor_authenticated', 'true');
      }
      setError('');
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError('Clinical signature invalid. Access denied.');
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl text-center z-10"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="mx-auto w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <ShieldCheck size={28} className="animate-pulse" />
            </div>

            {/* Header */}
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-3 leading-relaxed">
              {description}
            </p>

            {/* Passkey Form */}
            <div className="mt-8 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl flex items-center justify-between gap-3 text-left">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">
                  🗝️ Preselected Key
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-bold leading-none select-all">
                  DOC@Protocol2
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-center text-slate-900 dark:text-white"
                  placeholder="Enter Doctor Key (DOC@...) or Admin PIN (1234)"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] font-black uppercase text-rose-500 tracking-widest text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  className="flex-[2] py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                >
                  Authenticate
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
