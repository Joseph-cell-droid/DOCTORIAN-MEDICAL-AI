import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Stethoscope, Pill, UserCheck, ClipboardList, Sparkles, 
  ArrowRight, ShieldCheck, Video, Globe, Heart, Activity,
  ChevronRight, HardDrive, Lock
} from 'lucide-react';
import { Doctorian3DRobot } from './Doctorian3DRobot';
import { StorageQuota } from '../utils/storageVaultApi';

interface ModernizedDashboardViewProps {
  onNavigate: (view: any) => void;
  user: any;
  storageQuota: StorageQuota;
  onSearchSubmit?: (query: string) => void;
  onOpenLanguage?: () => void;
}

export const ModernizedDashboardView: React.FC<ModernizedDashboardViewProps> = ({
  onNavigate,
  user,
  storageQuota,
  onSearchSubmit,
  onOpenLanguage,
}) => {
  const [symptomInput, setSymptomInput] = useState('');

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = symptomInput.trim();
    if (!query) return;
    if (onSearchSubmit) {
      onSearchSubmit(query);
    } else {
      localStorage.setItem('doctorian_initial_chat_query', query);
      onNavigate('ai_nexus');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 px-3 sm:px-6 pb-28 pt-2 select-none text-slate-100">
      {/* 1. Header (Exact Photo 1 Top) */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          {/* Logo Cross with Heartline */}
          <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Activity size={22} className="text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                Doctorian <span className="text-blue-500">AI</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
              Your Health, Our Priority
            </p>
          </div>
        </div>

        {/* User Profile Avatar */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="w-10 h-10 rounded-full border-2 border-blue-500/40 overflow-hidden bg-slate-800 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-md"
          title="View Profile"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white uppercase">
              {user?.name?.[0] || 'U'}
            </div>
          )}
        </button>
      </div>

      {/* 2. Hero Card with 3D Robot Doctor (Exact Photo 1) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-5 sm:p-7 shadow-[0_16px_40px_rgba(37,99,235,0.3)] border border-blue-400/30">
        {/* Soft Background Radial Light */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h3 className="text-lg sm:text-xl font-medium text-blue-100">
              Hello,
            </h3>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              How can I help you today?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 font-medium max-w-md leading-relaxed">
              Get instant medical advice, check symptoms, find doctors and more.
            </p>

            {/* Input Pill */}
            <form onSubmit={handleQuerySubmit} className="pt-2 sm:pt-3">
              <div className="relative flex items-center bg-[#071330]/90 backdrop-blur-md rounded-full border border-cyan-400/30 shadow-inner p-1.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 transition-all">
                <Sparkles size={18} className="text-cyan-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="Type your symptoms or ask a question..."
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md cursor-pointer mr-0.5"
                  title="Submit Symptoms Query"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* 3D Medical Robot Doctor */}
          <div className="shrink-0 mt-2 sm:mt-0">
            <Doctorian3DRobot size="md" />
          </div>
        </div>
      </div>

      {/* 3. Modern Storage Vault Card (Preserved & Styled from Previous Turn) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#091228]/80 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            storageQuota.isFull || storageQuota.percentUsed >= 100
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
          }`}>
            <HardDrive size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">1GB Cloud Vault</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                storageQuota.isFull || storageQuota.percentUsed >= 100
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {storageQuota.isFull || storageQuota.percentUsed >= 100 ? 'Quota Full (100%)' : '2FA Secured'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-28 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
                <div 
                  className={`h-full rounded-full transition-all ${
                    storageQuota.isFull || storageQuota.percentUsed >= 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${Math.min(storageQuota.percentUsed, 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {storageQuota.percentUsed.toFixed(1)}% Used
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {storageQuota.isFull || storageQuota.percentUsed >= 100 ? (
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('doctorian_storage_open_billing', 'true');
                onNavigate('billing');
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer animate-pulse"
            >
              Purchase Storage
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('storage_vault')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
            >
              <Lock size={12} />
              <span>Open Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Four Quick Action Cards (Exact Photo 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Check Symptoms */}
        <button
          type="button"
          onClick={() => onNavigate('symptoms')}
          className="group p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1a3a] border border-slate-800/90 hover:border-blue-500/40 shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm group-hover:scale-105 transition-transform">
            <Stethoscope size={20} />
          </div>
          <div className="flex items-center justify-between w-full mt-2">
            <span className="text-xs sm:text-sm font-bold text-white">
              Check Symptoms
            </span>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        {/* Card 2: Medicine Reminder */}
        <button
          type="button"
          onClick={() => onNavigate('meds')}
          className="group p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1a3a] border border-slate-800/90 hover:border-emerald-500/40 shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
            <Pill size={20} />
          </div>
          <div className="flex items-center justify-between w-full mt-2">
            <span className="text-xs sm:text-sm font-bold text-white">
              Medicine Reminder
            </span>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        {/* Card 3: Talk to a Doctor */}
        <button
          type="button"
          onClick={() => onNavigate('doctors')}
          className="group p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1a3a] border border-slate-800/90 hover:border-purple-500/40 shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-sm group-hover:scale-105 transition-transform">
            <UserCheck size={20} />
          </div>
          <div className="flex items-center justify-between w-full mt-2">
            <span className="text-xs sm:text-sm font-bold text-white">
              Talk to a Doctor
            </span>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        {/* Card 4: Health Records */}
        <button
          type="button"
          onClick={() => onNavigate('records')}
          className="group p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1a3a] border border-slate-800/90 hover:border-amber-500/40 shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
            <ClipboardList size={20} />
          </div>
          <div className="flex items-center justify-between w-full mt-2">
            <span className="text-xs sm:text-sm font-bold text-white">
              Health Records
            </span>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>

      {/* 5. Featured Services (Exact Photo 1) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white">
            Featured Services
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Service 1: AI Health Assistant */}
          <button
            type="button"
            onClick={() => onNavigate('ai_nexus')}
            className="p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0c1838] border border-slate-800/90 hover:border-blue-500/30 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI Health Assistant</h4>
                <p className="text-xs text-slate-400">Get personalized health advice 24/7</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Service 2: Telemedicine */}
          <button
            type="button"
            onClick={() => onNavigate('telehealth')}
            className="p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0c1838] border border-slate-800/90 hover:border-purple-500/30 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Video size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Telemedicine</h4>
                <p className="text-xs text-slate-400">Video consultations with licensed doctors</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Service 3: Preventive Care */}
          <button
            type="button"
            onClick={() => onNavigate('vitality')}
            className="p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0c1838] border border-slate-800/90 hover:border-emerald-500/30 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Preventive Care</h4>
                <p className="text-xs text-slate-400">Stay healthy with smart reminders</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Service 4: Multilingual Support */}
          <button
            type="button"
            onClick={() => onOpenLanguage ? onOpenLanguage() : onNavigate('profile')}
            className="p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0c1838] border border-slate-800/90 hover:border-cyan-500/30 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Multilingual Support</h4>
                <p className="text-xs text-slate-400">Communicate in your language</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* 6. "Your Health Matters" Banner (Exact Photo 1) */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-5 sm:p-6 border border-blue-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-md">
            <Heart size={24} className="fill-rose-500/30" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              Your Health Matters
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Take control of your health journey with Doctorian AI.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('records')}
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Get Started</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
