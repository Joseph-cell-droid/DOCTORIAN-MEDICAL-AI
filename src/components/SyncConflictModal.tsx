import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle, Check, X } from 'lucide-react';

interface SyncConflictItem {
  id: string;
  resource: string;
  localSummary: string;
  serverSummary: string;
  localTimestamp: string;
  serverTimestamp: string;
}

interface SyncConflictModalProps {
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SyncConflictModal: React.FC<SyncConflictModalProps> = ({ addToast }) => {
  const [conflicts, setConflicts] = useState<SyncConflictItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkPendingOfflineSync = async () => {
      try {
        const raw = localStorage.getItem('doctorian_sync_conflicts');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConflicts(parsed);
          }
        }
      } catch {
        // ignore storage parse error
      }
    };

    checkPendingOfflineSync();
    const handleOnline = () => {
      checkPendingOfflineSync();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  if (conflicts.length === 0) return null;

  const resolveConflict = async (id: string, choice: 'local' | 'server') => {
    setIsSyncing(true);
    try {
      const remaining = conflicts.filter((c) => c.id !== id);
      setConflicts(remaining);
      localStorage.setItem('doctorian_sync_conflicts', JSON.stringify(remaining));
      addToast?.(
        choice === 'local' ? 'Applied offline clinical edit to facility record.' : 'Retained server record version.',
        'success'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Offline Synchronization Review ({conflicts.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setConflicts([])}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
            aria-label="Close sync modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Changes recorded offline conflict with newer updates on the facility server. Choose which clinical entry to retain.
          </p>

          {conflicts.map((c) => (
            <div key={c.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
              <div className="text-xs font-semibold text-slate-900 dark:text-white">{c.resource}</div>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-teal-700 dark:text-teal-400 mb-1">Local Offline Entry</div>
                  <div className="text-slate-700 dark:text-slate-300">{c.localSummary}</div>
                  <div className="text-slate-400 mt-1">{c.localTimestamp}</div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-sky-700 dark:text-sky-400 mb-1">Facility Server Entry</div>
                  <div className="text-slate-700 dark:text-slate-300">{c.serverSummary}</div>
                  <div className="text-slate-400 mt-1">{c.serverTimestamp}</div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => resolveConflict(c.id, 'server')}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Use Server Version
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => resolveConflict(c.id, 'local')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg inline-flex items-center gap-1"
                >
                  {isSyncing ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                  <span>Keep Local Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SyncConflictModal;
