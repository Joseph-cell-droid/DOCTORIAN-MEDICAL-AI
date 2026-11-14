import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, Key, Lock, Eye, FileText, Download, CheckCircle2, ShieldAlert, Filter, Search, Award } from 'lucide-react';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose }) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'auth' | 'access' | 'ai' | 'prescription'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const mockAuditLogs = [
    {
      id: 'AUD-9081',
      timestamp: '2026-07-31 09:15:22 UTC',
      user: 'Dr. Gloria Jayakullo (ID: DOC-441)',
      role: 'Attending Cardiologist',
      action: 'PATIENT_RECORD_VIEW',
      category: 'access',
      details: 'Accessed Patient Profile PAT-984210 (Joseph A.). AES-256 decryption key issued.',
      status: 'VERIFIED',
      hash: '0x9a81c7f42e19'
    },
    {
      id: 'AUD-9080',
      timestamp: '2026-07-31 09:10:04 UTC',
      user: 'System Autonomous AI (Gemma 27B)',
      role: 'Clinical Co-Pilot Engine',
      action: 'AI_DIAGNOSTIC_CONSULTATION',
      category: 'ai',
      details: 'Generated Multi-Specialist Board Review. 4 Specialist agent tokens initialized.',
      status: 'VERIFIED',
      hash: '0x3b1109aef801'
    },
    {
      id: 'AUD-9079',
      timestamp: '2026-07-31 08:45:10 UTC',
      user: 'Dr. Gloria Jayakullo (ID: DOC-441)',
      role: 'Attending Cardiologist',
      action: 'PRESCRIPTION_DISPATCH',
      category: 'prescription',
      details: 'Issued e-Prescription Rx-7821 for Lisinopril 10mg via MoH Clinical Gateway.',
      status: 'VERIFIED',
      hash: '0x712fa910cd4e'
    },
    {
      id: 'AUD-9078',
      timestamp: '2026-07-31 08:00:15 UTC',
      user: 'Patient Joseph A. (ID: PAT-984210)',
      role: 'Patient User',
      action: 'MFA_AUTHENTICATION',
      category: 'auth',
      details: 'Biometric WebAuthn passkey verification succeeded. IP 192.168.1.104.',
      status: 'VERIFIED',
      hash: '0x10f27c9921e4'
    },
    {
      id: 'AUD-9077',
      timestamp: '2026-07-31 07:30:00 UTC',
      user: 'Arduino ESP32 Telemetry Gateway',
      role: 'IoT Vital Monitor',
      action: 'TELEMETRY_STREAM_SYNC',
      category: 'access',
      details: 'Ingested 1,200 telemetry samples (ECG Lead II, SpO2, Temperature). Zero packet drop.',
      status: 'VERIFIED',
      hash: '0xaa9481bd0177'
    }
  ];

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden relative my-6"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Lock size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Clinical Security Audit Log</h3>
                <span className="px-3 py-0.5 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-black text-[9px] uppercase tracking-wider rounded-full border border-purple-200 dark:border-purple-800">
                  Immutable Cryptographic Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                Full access auditing, zero-trust token tracking, and regulatory compliance logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="self-end sm:self-center p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(['all', 'auth', 'access', 'ai', 'prescription'] as const).map((cat, catIdx) => (
              <button
                key={`audit-cat-${cat}-${catIdx}`}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  filterCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'All Events' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {filteredLogs.map((log, mapIdx_147) => (
            <div
              key={`audittrailmodal-l150-${mapIdx_147}`}
              className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-purple-500/40"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-mono text-[9px] font-black rounded-lg">
                    {log.action}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{log.user}</span>
                  <span className="text-[10px] text-slate-400 font-bold">({log.role})</span>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{log.details}</p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
                  <span>TIME: {log.timestamp}</span>
                  <span>HASH: {log.hash}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>{log.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">
              Encrypted Audit Ledger & Role-Based Access Logging Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <Download size={14} />
              <span>Export Audit Ledger</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
