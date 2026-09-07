import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pill, Activity, Bell, Search, RefreshCw, 
  Wifi, WifiOff, FileText, Plus, ChevronRight, 
  Calendar, CheckCircle2, QrCode, AlertCircle, X, ShieldCheck
} from 'lucide-react';

interface ModernizedMedicationViewProps {
  user: any;
  onNavigate: (view: any) => void;
  onScanPrescription?: () => void;
}

export const ModernizedMedicationView: React.FC<ModernizedMedicationViewProps> = ({
  user,
  onNavigate,
  onScanPrescription,
}) => {
  const [activeTab, setActiveTab] = useState<'intake' | 'protocols'>('intake');
  const [isOnline, setIsOnline] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [moleculeName, setMoleculeName] = useState('');
  const [moleculesList, setMoleculesList] = useState<string[]>([]);

  const handleAddMolecule = () => {
    if (!moleculeName.trim()) return;
    setMoleculesList((prev) => [...prev, moleculeName.trim()]);
    setMoleculeName('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-3 sm:px-6 pb-28 pt-2 select-none text-slate-100">
      {/* 1. Top Header (Exact Photo 5 Top) */}
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

        <div className="flex items-center gap-2">
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
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Search"
          >
            <Search size={18} />
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

      {/* 2. Clinical Sync Status Card (Exact Photo 5) */}
      <div className="p-4 rounded-2xl bg-[#091228]/90 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Clinical Sync Status
            </span>
          </div>
          <h4 className="text-sm font-bold text-white leading-tight">
            Dual-Write Live Replication Channel Active
          </h4>
          <p className="text-xs text-slate-400">
            Your data is secure and up to date.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ONLINE
            </span>
          </div>
        </div>

        {/* Right Sub-Box */}
        <div className="p-2.5 rounded-xl bg-[#0d1c3e]/60 border border-blue-500/20 flex flex-col gap-2 shrink-0 sm:min-w-[180px]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <RefreshCw size={13} className="text-emerald-400" />
              <span>Last Sync</span>
            </div>
            <span className="text-emerald-400 font-semibold text-[11px]">Just now &gt;</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isOnline ? <WifiOff size={13} /> : <Wifi size={13} />}
            <span>{isOnline ? 'Switch to Offline Mode' : 'Switch to Online Mode'}</span>
          </button>
        </div>
      </div>

      {/* 3. Patient Clinical Portal Banner (Exact Photo 5) */}
      <button
        type="button"
        onClick={() => onNavigate('portal')}
        className="w-full p-3.5 rounded-2xl bg-[#091228]/80 hover:bg-[#0c1838] border border-slate-800 flex items-center justify-between transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold text-sm shrink-0">
            {user?.name?.[0] || 'P'}
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-white">Patient Clinical Portal</h4>
            <p className="text-xs text-slate-400">Access patient tools and clinical features</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </button>

      {/* 4. COGNIS Potions & Arduino Grid (Exact Photo 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card 1: COGNIS Potions */}
        <button
          type="button"
          onClick={() => onNavigate('cognis_hub')}
          className="p-4 rounded-2xl bg-[#091228]/80 hover:bg-[#0d1a3a] border border-slate-800 hover:border-purple-500/30 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-sm">
              <Pill size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">COGNIS Potions</h4>
              <p className="text-xs text-slate-400">Precision dosage tracking and interaction risk assessment.</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Card 2: Arduino Link Offline */}
        <div className="p-4 rounded-2xl bg-[#091228]/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-sm">
              <WifiOff size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Arduino Link</h4>
              <p className="text-xs text-slate-400">Hardware Telemetry Stream</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-[10px] font-bold text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            OFFLINE
          </span>
        </div>
      </div>

      {/* 5. Scan Prescriptions & Add Molecule Buttons (Exact Photo 5) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onScanPrescription ? onScanPrescription() : onNavigate('camera')}
          className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-98 transition-all cursor-pointer"
        >
          <FileText size={16} />
          <span>Scan Prescriptions &gt;</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 active:scale-98 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Molecule +</span>
        </button>
      </div>

      {/* 6. Pill Tab Switcher: Intake & Smart Logs | Clinical Protocols */}
      <div className="flex items-center p-1 rounded-full bg-[#081024] border border-slate-800 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('intake')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'intake'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Intake & Smart Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('protocols')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'protocols'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Clinical Protocols
        </button>
      </div>

      {/* 7. Smart Intake Timeline (Exact Photo 5) */}
      <div className="p-5 rounded-3xl bg-[#091228]/90 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            INTERACTIVE DAILY DOSES & CELLULAR PUSH CUES
          </span>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <Calendar size={13} />
            <span>Today's Dose Schedule &gt;</span>
          </button>
        </div>

        {/* Empty / Molecule Log Container */}
        {moleculesList.length === 0 ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Pill size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              No scheduled logs registered for today.
            </p>
            <p className="text-xs text-slate-500">
              Molecules preloaded by clinician or manually
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {moleculesList.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Pill size={16} className="text-teal-400" />
                  <span className="text-xs font-bold text-white">{m}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">Active Scheduled</span>
              </div>
            ))}
          </div>
        )}

        {/* Full-width gradient action button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Molecule &gt;</span>
        </button>
      </div>

      {/* Add Molecule Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0b152e] border border-teal-500/40 rounded-3xl p-5 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="text-sm font-bold flex items-center gap-2 text-teal-300">
                  <Pill size={16} />
                  Add New Molecule
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Molecule / Formulation Name
                </label>
                <input
                  type="text"
                  value={moleculeName}
                  onChange={(e) => setMoleculeName(e.target.value)}
                  placeholder="e.g. Zinc Gluconate 50mg"
                  className="w-full bg-[#050b1a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMolecule}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                >
                  Register
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
