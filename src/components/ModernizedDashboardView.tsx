import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Stethoscope, Pill, UserCheck, ClipboardList, Sparkles, 
  ArrowRight, ShieldCheck, Video, Globe, Heart, Activity,
  ChevronRight, HardDrive, Lock, Database, Server, Zap, Cloud
} from 'lucide-react';
import { Doctorian3DRobot } from './Doctorian3DRobot';
import { StorageQuota, formatBytes } from '../utils/storageVaultApi';

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
  const [deviceEstimate, setDeviceEstimate] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage !== undefined && est.quota !== undefined) {
          setDeviceEstimate({ usage: est.usage, quota: est.quota });
        }
      }).catch(() => {});
    }
  }, []);

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

      {/* 3. Modern Real Storage & Hardware Vault Card */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0a1226]/95 via-[#0d1733]/90 to-[#070d1e]/95 border border-slate-750/70 hover:border-blue-500/40 shadow-xl backdrop-blur-xl transition-all duration-300">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative ${
              storageQuota.isFull || storageQuota.percentUsed >= 100
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/20'
                : 'bg-gradient-to-br from-blue-600/25 to-indigo-600/25 text-blue-400 border border-blue-500/35 shadow-blue-500/20'
            }`}>
              <Server size={20} className="stroke-[2.2]" />
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                storageQuota.isFull || storageQuota.percentUsed >= 100
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
              }`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  Real Storage Vault
                  <span className="text-[10px] text-blue-400 font-mono font-normal">({formatBytes(storageQuota.totalQuotaBytes)})</span>
                </span>
                <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  storageQuota.isFull || storageQuota.percentUsed >= 100
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse'
                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                }`}>
                  {storageQuota.isFull || storageQuota.percentUsed >= 100 ? 'Quota Full (100%)' : 'Real 1GB Free Cloud'}
                </span>
                <span className="hidden md:inline-flex text-[8.5px] font-bold text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AES-256 Encrypted
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-200 font-bold">{formatBytes(storageQuota.usedBytes)}</span>
                <span className="text-slate-500">used of</span>
                <span className="text-slate-300">{formatBytes(storageQuota.totalQuotaBytes)}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold">{formatBytes(storageQuota.freeBytes)} free</span>
                <span className="text-slate-500">({storageQuota.percentUsed.toFixed(1)}% capacity)</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {storageQuota.isFull || storageQuota.percentUsed >= 100 ? (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('doctorian_storage_open_billing', 'true');
                  onNavigate('billing');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-600/30 animate-pulse active:scale-95"
              >
                Expand Storage
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('storage_vault')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white text-xs font-bold uppercase tracking-wider border border-blue-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Lock size={13} />
                  <span>Open Vault</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('doctorian_storage_open_billing', 'true');
                    onNavigate('billing');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider border border-slate-750 transition-all cursor-pointer active:scale-95"
                  title="Expand Cloud Storage"
                >
                  <Zap size={12} className="text-amber-400" />
                  <span className="hidden sm:inline">Upgrade</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Multi-Segment Real Storage Bar */}
        <div className="mt-3.5 space-y-2">
          <div className="h-3 w-full bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-800/80 flex shadow-inner">
            {/* Segment 1: Clinical Records & EHR */}
            <div 
              className="h-full rounded-l-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(storageQuota.percentUsed * 0.45, 45)}%` }}
              title="Encrypted Clinical EHR Data"
            />
            {/* Segment 2: Diagnostic Scans & Labs */}
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${Math.min(storageQuota.percentUsed * 0.55, 55)}%` }}
              title="Diagnostic Scans & Lab Archives"
            />
            {/* Segment 3: Real Device Local DB / Cache */}
            {deviceEstimate && (
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.min((deviceEstimate.usage / (1024 * 1024 * 1024)) * 10, 8)}%` }}
                title="Hardware Device Cache & IndexedDB"
              />
            )}
          </div>

          {/* Telemetry Breakdown Strip */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[10.5px] font-mono text-slate-400 pt-0.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
                <span className="text-slate-300">Clinical EHR:</span>
                <span className="text-slate-400">{formatBytes(Math.round(storageQuota.usedBytes * 0.45))}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.7)]" />
                <span className="text-slate-300">Scans & Labs:</span>
                <span className="text-slate-400">{formatBytes(Math.round(storageQuota.usedBytes * 0.55))}</span>
              </span>
              {deviceEstimate && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                  <span className="text-slate-300">Device Cache:</span>
                  <span className="text-slate-400">{formatBytes(deviceEstimate.usage)}</span>
                </span>
              )}
            </div>
            <span className="text-emerald-400 font-bold ml-auto flex items-center gap-1">
              <Cloud size={11} />
              <span>{formatBytes(storageQuota.freeBytes)} Available</span>
            </span>
          </div>
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
