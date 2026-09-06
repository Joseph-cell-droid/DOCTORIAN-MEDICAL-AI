import React from 'react';
import {
  Activity,
  Radio,
  Zap,
  User as UserIcon,
  Brain,
  TrendingUp,
  Stethoscope,
  Database,
  Sliders,
  Dna,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export type ClinicalStationTab =
  | 'realtime'
  | 'patients_dashboard'
  | 'watch_vitals'
  | 'neural'
  | 'analytics'
  | 'emergency'
  | 'genomics'
  | 'alarms'
  | 'registry'
  | 'simulator'
  | 'ambulance';

interface ClinicalStationsNavProps {
  activeTab: ClinicalStationTab;
  setActiveTab: (tab: ClinicalStationTab) => void;
}

export const ClinicalStationsNav: React.FC<ClinicalStationsNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="space-y-8 my-4">
      {/* Header Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Activity size={16} />
          </div>
          <span className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Clinical Telemetry Stations & Modules
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            11 Dedicated Stations
          </span>
        </div>
        <span className="text-xs font-medium text-slate-400">
          Click any station card below to launch that clinical workspace
        </span>
      </div>

      {/* Section 1: Telemetry & Real-Time Monitoring (5 Cards) */}
      <div className="space-y-3">
        <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
          <Radio size={13} className="text-blue-500" />
          <span>Telemetry & Real-Time Monitoring</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4.5 sm:gap-4">
          {/* 1. Watch Vitals & Triage */}
          <button
            type="button"
            onClick={() => setActiveTab('watch_vitals')}
            className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px] gap-3.5 border cursor-pointer group ${
              activeTab === 'watch_vitals'
                ? 'bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent border-rose-500 dark:border-rose-400 shadow-md ring-2 ring-rose-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-rose-400/60 dark:hover:border-rose-500/60 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div
                className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'watch_vitals'
                    ? 'bg-gradient-to-br from-rose-600 to-amber-600 text-white shadow-xs'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                <Zap size={18} className={activeTab === 'watch_vitals' ? 'animate-pulse' : ''} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                WS Live
              </span>
            </div>
            <div className="min-w-0 space-y-1">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
                Watch Vitals & Triage
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                Wearable telemetry & triage stream
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold mt-auto">
              <span className={activeTab === 'watch_vitals' ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-400'}>
                {activeTab === 'watch_vitals' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={14}
                className={activeTab === 'watch_vitals' ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>

          {/* 2. Patients Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('patients_dashboard')}
            className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px] gap-3.5 border cursor-pointer group ${
              activeTab === 'patients_dashboard'
                ? 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-blue-400/60 dark:hover:border-blue-500/60 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div
                className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'patients_dashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                <UserIcon size={18} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shrink-0 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                6 Live
              </span>
            </div>
            <div className="min-w-0 space-y-1">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
                Patients Dashboard
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                Multi-patient ward overview & telemetry
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold mt-auto">
              <span className={activeTab === 'patients_dashboard' ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-400'}>
                {activeTab === 'patients_dashboard' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={14}
                className={activeTab === 'patients_dashboard' ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>

          {/* 3. Real-Time Vitals */}
          <button
            type="button"
            onClick={() => setActiveTab('realtime')}
            className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px] gap-3.5 border cursor-pointer group ${
              activeTab === 'realtime'
                ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500 dark:border-emerald-400 shadow-md ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60 dark:hover:border-emerald-500/60 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div
                className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'realtime'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <Activity size={18} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0 whitespace-nowrap">
                Waveforms
              </span>
            </div>
            <div className="min-w-0 space-y-1">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
                Real-Time Vitals
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                Live ECG, SpO2 & telemetry stream
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold mt-auto">
              <span className={activeTab === 'realtime' ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-400'}>
                {activeTab === 'realtime' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={14}
                className={activeTab === 'realtime' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>

          {/* 4. Neural Synthesis */}
          <button
            type="button"
            onClick={() => setActiveTab('neural')}
            className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px] gap-3.5 border cursor-pointer group ${
              activeTab === 'neural'
                ? 'bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border-cyan-500 dark:border-cyan-400 shadow-md ring-2 ring-cyan-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-cyan-400/60 dark:hover:border-cyan-500/60 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div
                className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'neural'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                }`}
              >
                <Brain size={18} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shrink-0 whitespace-nowrap">
                Gemini 3.7
              </span>
            </div>
            <div className="min-w-0 space-y-1">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
                Neural Synthesis
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                AI cognitive reasoning & triage
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold mt-auto">
              <span className={activeTab === 'neural' ? 'text-cyan-600 dark:text-cyan-400 font-black' : 'text-slate-400'}>
                {activeTab === 'neural' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={14}
                className={activeTab === 'neural' ? 'text-cyan-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>

          {/* 5. Advanced Analytics */}
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px] gap-3.5 border cursor-pointer group ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-transparent border-purple-500 dark:border-purple-400 shadow-md ring-2 ring-purple-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-purple-400/60 dark:hover:border-purple-500/60 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div
                className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                }`}
              >
                <TrendingUp size={18} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shrink-0 whitespace-nowrap">
                Trends
              </span>
            </div>
            <div className="min-w-0 space-y-1">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
                Advanced Analytics
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                Clinical metrics & cohorts
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold mt-auto">
              <span className={activeTab === 'analytics' ? 'text-purple-600 dark:text-purple-400 font-black' : 'text-slate-400'}>
                {activeTab === 'analytics' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={14}
                className={activeTab === 'analytics' ? 'text-purple-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Section 2: Ward & Fleet Operations (3 Bottom Buttons) */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Stethoscope size={15} className="text-teal-500" />
            <span>Ward & Fleet Operations</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
            Hospital Logistics
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {/* 6. 🏥 Bed Registry */}
          <button
            type="button"
            onClick={() => setActiveTab('registry')}
            className={`p-5 sm:p-6 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[165px] gap-4 border cursor-pointer group ${
              activeTab === 'registry'
                ? 'bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border-teal-500 dark:border-teal-400 shadow-lg ring-2 ring-teal-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-teal-400/60 dark:hover:border-teal-500/60 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`w-11 h-11 rounded-xl p-2.5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'registry'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                }`}
              >
                <Database size={20} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 shrink-0 whitespace-nowrap">
                Ward Map
              </span>
            </div>
            <div className="min-w-0 space-y-1.5">
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug flex items-center gap-2.5 break-words">
                <span className="text-xl shrink-0 leading-none">🏥</span>
                <span>Bed Registry</span>
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                Inpatient bed allocation, department ward maps & occupancy
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold mt-auto">
              <span className={activeTab === 'registry' ? 'text-teal-600 dark:text-teal-400 font-black' : 'text-slate-400 dark:text-slate-500'}>
                {activeTab === 'registry' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={15}
                className={activeTab === 'registry' ? 'text-teal-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>

          {/* 7. 🚑 Ambulance */}
          <button
            type="button"
            onClick={() => setActiveTab('ambulance')}
            className={`p-5 sm:p-6 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[165px] gap-4 border cursor-pointer group ${
              activeTab === 'ambulance'
                ? 'bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent border-red-500 dark:border-red-400 shadow-lg ring-2 ring-red-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-red-400/60 dark:hover:border-red-500/60 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`w-11 h-11 rounded-xl p-2.5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'ambulance'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
              >
                <Radio size={20} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 shrink-0 whitespace-nowrap">
                Fleet SOS
              </span>
            </div>
            <div className="min-w-0 space-y-1.5">
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug flex items-center gap-2.5 break-words">
                <span className="text-xl shrink-0 leading-none">🚑</span>
                <span>Ambulance</span>
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                Emergency vehicle GPS dispatch, tracking & field units
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold mt-auto">
              <span className={activeTab === 'ambulance' ? 'text-red-600 dark:text-red-400 font-black' : 'text-slate-400 dark:text-slate-500'}>
                {activeTab === 'ambulance' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={15}
                className={activeTab === 'ambulance' ? 'text-red-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>

          {/* 8. 🔌 Simulator */}
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`p-5 sm:p-6 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[165px] gap-4 border cursor-pointer group ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent border-indigo-500 dark:border-indigo-400 shadow-lg ring-2 ring-indigo-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`w-11 h-11 rounded-xl p-2.5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'simulator'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                <Sliders size={20} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shrink-0 whitespace-nowrap">
                HW Dials
              </span>
            </div>
            <div className="min-w-0 space-y-1.5">
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug flex items-center gap-2.5 break-words">
                <span className="text-xl shrink-0 leading-none">🔌</span>
                <span>Simulator</span>
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                Hardware dial generator & physiological stress emulator
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold mt-auto">
              <span className={activeTab === 'simulator' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-400 dark:text-slate-500'}>
                {activeTab === 'simulator' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={15}
                className={activeTab === 'simulator' ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Section 3: Genomic Matrix, Emergency Registry, Clinical Alarm Hub (3 Bottom Buttons) */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck size={15} className="text-rose-500" />
            <span>Genomics & Critical Clinical Emergency</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            Critical Protocols
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {/* 9. Genomic Matrix */}
          <button
            type="button"
            onClick={() => setActiveTab('genomics')}
            className={`p-5 sm:p-6 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[165px] gap-4 border cursor-pointer group ${
              activeTab === 'genomics'
                ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500 dark:border-emerald-400 shadow-lg ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60 dark:hover:border-emerald-500/60 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`w-11 h-11 rounded-xl p-2.5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'genomics'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <Dna size={20} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0 whitespace-nowrap">
                DNA Matrix
              </span>
            </div>
            <div className="min-w-0 space-y-1.5">
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug break-words">
                Genomic Matrix
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                DNA biomarker sequencing, genetic risk profiling & longevity
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold mt-auto">
              <span className={activeTab === 'genomics' ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-400 dark:text-slate-500'}>
                {activeTab === 'genomics' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={15}
                className={activeTab === 'genomics' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>

          {/* 10. Emergency Registry */}
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`p-5 sm:p-6 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[165px] gap-4 border cursor-pointer group ${
              activeTab === 'emergency'
                ? 'bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent border-rose-500 dark:border-rose-400 shadow-lg ring-2 ring-rose-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-rose-400/60 dark:hover:border-rose-500/60 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`w-11 h-11 rounded-xl p-2.5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'emergency'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                <AlertTriangle size={20} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0 whitespace-nowrap">
                Code Red
              </span>
            </div>
            <div className="min-w-0 space-y-1.5">
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug break-words">
                Emergency Registry
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                Acute trauma triage logs, intake records & physician dispatch
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold mt-auto">
              <span className={activeTab === 'emergency' ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-400 dark:text-slate-500'}>
                {activeTab === 'emergency' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={15}
                className={activeTab === 'emergency' ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>

          {/* 11. Clinical Alarm Hub */}
          <button
            type="button"
            onClick={() => setActiveTab('alarms')}
            className={`p-5 sm:p-6 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[165px] gap-4 border cursor-pointer group ${
              activeTab === 'alarms'
                ? 'bg-gradient-to-br from-amber-500/10 via-red-500/5 to-transparent border-amber-500 dark:border-amber-400 shadow-lg ring-2 ring-amber-500/30'
                : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-amber-400/60 dark:hover:border-amber-500/60 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`w-11 h-11 rounded-xl p-2.5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'alarms'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                <AlertCircle size={20} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0 whitespace-nowrap">
                Thresholds
              </span>
            </div>
            <div className="min-w-0 space-y-1.5">
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug break-words">
                Clinical Alarm Hub
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                Audible siren limits, threshold parameters & alert acknowledgement
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold mt-auto">
              <span className={activeTab === 'alarms' ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-400 dark:text-slate-500'}>
                {activeTab === 'alarms' ? '● Station Active' : 'Switch Station'}
              </span>
              <ChevronRight
                size={15}
                className={activeTab === 'alarms' ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
