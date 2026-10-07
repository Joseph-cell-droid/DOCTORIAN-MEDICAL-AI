import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, Camera, Clock, User, Heart, AlertTriangle, 
  Trash2, X, ChevronRight, FileText, ArrowRight, ShieldCheck,
  Plus
} from 'lucide-react';
import { 
  getRecentQrScans, 
  removeQrScanItem, 
  clearQrScansHistory, 
  ScannedQrHistoryItem, 
  QR_HISTORY_EVENT 
} from '../utils/recentQrScans';
import { MedicalProfileData } from './MedicalQrScannerModal';

interface RecentScannedProfilesWidgetProps {
  onOpenScanner: () => void;
  onSelectProfile: (profile: MedicalProfileData) => void;
  className?: string;
}

export const RecentScannedProfilesWidget: React.FC<RecentScannedProfilesWidgetProps> = ({
  onOpenScanner,
  onSelectProfile,
  className = ''
}) => {
  const [historyItems, setHistoryItems] = useState<ScannedQrHistoryItem[]>(() => getRecentQrScans());

  // Listen for storage and custom history update events
  useEffect(() => {
    const handleUpdate = () => {
      setHistoryItems(getRecentQrScans());
    };

    window.addEventListener(QR_HISTORY_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(QR_HISTORY_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeQrScanItem(id);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearQrScansHistory();
  };

  return (
    <div className={`rounded-3xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col text-left transition-all ${className}`}>
      
      {/* ─────────────────────────────────────────────────────────── */}
      {/* WIDGET HEADER                                               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-7 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-mono">
              Offline Triage History
            </span>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Last {historyItems.length} of 5 Profiles Cached
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
            <span>Recent Scanned Medical Profiles</span>
            {historyItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                {historyItems.length} Active
              </span>
            )}
          </h3>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {historyItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="Clear all 5 saved QR history items"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Clear History</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenScanner}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Open camera to scan a medical QR code"
          >
            <Camera size={14} />
            <span>Scan Medical QR</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* RECENT SCANS LIST / GRID                                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-7">
        {historyItems.length === 0 ? (
          /* Empty State */
          <div className="py-8 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-inner">
              <QrCode size={28} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Medical QR Codes Scanned Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Scan patient wristbands, clinic cards, or emergency ID codes with your camera. The last 5 profiles are automatically cached in local storage for instant 1-tap re-access.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenScanner}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
            >
              <Camera size={14} />
              <span>Launch QR Scanner Now</span>
            </button>
          </div>
        ) : (
          /* Grid of Cached Scanned Patients */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            <AnimatePresence>
              {historyItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onSelectProfile(item.fullProfile)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-cyan-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden text-left"
                >
                  {/* Subtle hover accent glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 group-hover:bg-cyan-500/10 rounded-full blur-xl pointer-events-none transition-all" />

                  {/* Card Header: Avatar & Remove Button */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs uppercase shadow-sm shrink-0">
                          {item.patientName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                            {item.bloodGroup}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                            #{idx + 1} Recent
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Remove from history"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    {/* Patient Name & Identifier */}
                    <div className="mb-2">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {item.patientName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {item.patientId}
                      </p>
                    </div>

                    {/* Critical Allergies & Conditions Snippet */}
                    <div className="space-y-1 my-2 text-[10px]">
                      {item.allergies && item.allergies !== 'None Recorded' && (
                        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold truncate">
                          <AlertTriangle size={10} className="shrink-0" />
                          <span className="truncate">{item.allergies}</span>
                        </div>
                      )}
                      <p className="text-slate-500 dark:text-slate-400 truncate font-medium">
                        {item.conditions}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Timestamp & Action */}
                  <div className="pt-2.5 mt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Clock size={10} />
                      {item.formattedDate}
                    </span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>View File</span>
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
};

export default RecentScannedProfilesWidget;
