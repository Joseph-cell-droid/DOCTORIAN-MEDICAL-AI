import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, Heart, Ruler, Scale, Calendar, Pill, 
  FileText, Stethoscope, FlaskConical, Plus, ChevronRight, 
  Cloud, Bell, Activity, Check, X
} from 'lucide-react';

interface ModernizedHealthRecordsViewProps {
  user: any;
  onNavigate: (view: any) => void;
  onOpenVault?: () => void;
}

export const ModernizedHealthRecordsView: React.FC<ModernizedHealthRecordsViewProps> = ({
  user,
  onNavigate,
  onOpenVault,
}) => {
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [selectedVitalModal, setSelectedVitalModal] = useState<string | null>(null);

  // Default patient vitals matching Photo 3
  const [vitals, setVitals] = useState({
    bloodType: 'A+',
    height: '175 cm',
    weight: '68 kg',
    lastCheckup: 'Mar 15, 2026',
  });

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 px-3 sm:px-6 pb-28 pt-2 select-none text-slate-100">
      {/* 1. Header (Exact Photo 3 Top) */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
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

        {/* Right Header Badges: 1GB FREE Vault, Bell with red dot, Avatar */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenVault ? onOpenVault() : onNavigate('storage_vault')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900 border border-blue-400/40 text-xs font-bold text-cyan-300 transition-colors cursor-pointer shadow-sm"
            title="1GB Free Cloud Vault"
          >
            <Cloud size={14} className="text-cyan-400" />
            <span>1GB FREE</span>
          </button>

          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-full border-2 border-blue-500/40 overflow-hidden bg-slate-800 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            title="Profile"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                {user?.name?.[0] || 'U'}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 2. Title Header Banner (Exact Photo 3) */}
      <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#091228]/80 border border-slate-800 shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-md">
          <Folder size={24} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
            Health Records
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your complete medical history and prescription tracking, all in one place.
          </p>
        </div>
      </div>

      {/* 3. Four Health Vitals (Exact Photo 3 2x2 Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Vital 1: Blood Type */}
        <button
          type="button"
          onClick={() => setSelectedVitalModal('blood')}
          className="p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1a3a] border border-slate-800/90 hover:border-rose-500/40 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-md group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Heart size={18} />
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Blood Type</span>
            <p className="text-base font-bold text-white mt-0.5">{vitals.bloodType}</p>
          </div>
        </button>

        {/* Vital 2: Height */}
        <button
          type="button"
          onClick={() => setSelectedVitalModal('height')}
          className="p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1a3a] border border-slate-800/90 hover:border-blue-500/40 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-md group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Ruler size={18} />
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Height</span>
            <p className="text-base font-bold text-white mt-0.5">{vitals.height}</p>
          </div>
        </button>

        {/* Vital 3: Weight */}
        <button
          type="button"
          onClick={() => setSelectedVitalModal('weight')}
          className="p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1a3a] border border-slate-800/90 hover:border-emerald-500/40 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-md group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Scale size={18} />
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Weight</span>
            <p className="text-base font-bold text-white mt-0.5">{vitals.weight}</p>
          </div>
        </button>

        {/* Vital 4: Last Checkup */}
        <button
          type="button"
          onClick={() => setSelectedVitalModal('checkup')}
          className="p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1a3a] border border-slate-800/90 hover:border-purple-500/40 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-md group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Calendar size={18} />
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Last Checkup</span>
            <p className="text-base font-bold text-white mt-0.5">{vitals.lastCheckup}</p>
          </div>
        </button>
      </div>

      {/* 4. Prescription Progress Card (Exact Photo 3) */}
      <div className="p-5 rounded-3xl bg-[#091228]/90 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Pill size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Prescription Progress</h4>
              <p className="text-xs text-slate-400">Stay on track with your treatment</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-400">
            <span>20%</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Luminous Gradient Progress Bar (Cyan to Purple) */}
        <div className="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden p-0.5">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 w-[20%] shadow-[0_0_10px_#38bdf8]" />
        </div>

        {/* Stepper Indicator Row (Exact Photo 3) */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]">
              <Check size={10} strokeWidth={3} />
            </div>
            <span className="truncate">Patient Info</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center" />
            <span className="truncate">Diagnosis</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center" />
            <span className="truncate">Medications</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center" />
            <span className="truncate">Complete</span>
          </div>
        </div>
      </div>

      {/* 5. Recent Activity Section (Exact Photo 3) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recent Activity</h3>
          <button
            type="button"
            onClick={() => onNavigate('timeline')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Activity 1: Prescription Updated */}
          <div className="p-3.5 rounded-2xl bg-[#091228]/80 border border-slate-800 flex items-center justify-between hover:bg-[#0c1838] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Prescription Updated</h4>
                <p className="text-[11px] text-slate-400">New medication added to your plan</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-blue-400">
              <span className="text-[11px]">Today, 9:42 AM</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Activity 2: Diagnosis Recorded */}
          <div className="p-3.5 rounded-2xl bg-[#091228]/80 border border-slate-800 flex items-center justify-between hover:bg-[#0c1838] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Stethoscope size={18} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Diagnosis Recorded</h4>
                <p className="text-[11px] text-slate-400">Follow up consultation completed</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-purple-400">
              <span className="text-[11px]">Yesterday, 3:15 PM</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Activity 3: Lab Results */}
          <div className="p-3.5 rounded-2xl bg-[#091228]/80 border border-slate-800 flex items-center justify-between hover:bg-[#0c1838] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <FlaskConical size={18} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Lab Results</h4>
                <p className="text-[11px] text-slate-400">Blood test results available</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-cyan-400">
              <span className="text-[11px]">Mar 14, 2026</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* 6. "+ New Prescription" Prominent Gradient Button (Exact Photo 3) */}
      <button
        type="button"
        onClick={() => setShowAddPrescription(true)}
        className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-600/30 active:scale-98 transition-all flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Plus size={20} />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold">New Prescription</h4>
            <p className="text-xs text-white/80 font-normal">Add a new medication or update your plan</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-white/90" />
      </button>

      {/* Add Prescription Modal */}
      <AnimatePresence>
        {showAddPrescription && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0b152e] border border-blue-500/40 rounded-3xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Pill size={18} className="text-cyan-400" />
                  Add New Medication
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddPrescription(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Medication Name</label>
                  <input
                    type="text"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g., Amoxicillin"
                    className="w-full bg-[#050b1a] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Dosage & Frequency</label>
                  <input
                    type="text"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="e.g., 500mg - Twice daily after meals"
                    className="w-full bg-[#050b1a] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPrescription(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPrescription(false);
                    setNewMedName('');
                    setNewMedDosage('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Save to Records
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
