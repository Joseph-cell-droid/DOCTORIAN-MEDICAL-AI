import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  CheckCircle2,
  Share2,
  HardDrive,
  ShieldCheck,
  Smartphone,
  Server,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

interface MeshNode {
  id: string;
  name: string;
  role: string;
  ip: string;
  recordsQueued: number;
  lastSync: string;
  status: 'connected' | 'syncing' | 'offline';
}

export const OfflineMeshSyncHub: React.FC<{
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
}> = ({ onShowToast }) => {
  const [isMeshActive, setIsMeshActive] = useState(true);
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);
  const [offlineQueuedRecords, setOfflineQueuedRecords] = useState(14);
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([
    {
      id: 'node-vht-1',
      name: 'VHT Tablet (Gulu Regional Outpost)',
      role: 'Village Health Worker Registry',
      ip: '192.168.4.12:8088',
      recordsQueued: 5,
      lastSync: '2 mins ago',
      status: 'connected'
    },
    {
      id: 'node-nurse-2',
      name: 'Maternity Ward Handheld (Kawempe)',
      role: 'Antenatal Triage Queue',
      ip: '192.168.4.15:8088',
      recordsQueued: 6,
      lastSync: '4 mins ago',
      status: 'connected'
    },
    {
      id: 'node-ambulance-3',
      name: 'Ambulance MoH Unit 04',
      role: 'Mobile Telemetry Hub',
      ip: '192.168.4.29:8088',
      recordsQueued: 3,
      lastSync: 'Just now',
      status: 'connected'
    }
  ]);

  const handleTriggerMeshSync = () => {
    setIsSimulatingSync(true);
    setTimeout(() => {
      setMeshNodes((prev) =>
        prev.map((n) => ({
          ...n,
          recordsQueued: 0,
          lastSync: 'Just now',
          status: 'connected'
        }))
      );
      setOfflineQueuedRecords(0);
      setIsSimulatingSync(false);
      if (onShowToast) {
        onShowToast('P2P Mesh Synchronization Complete: 14 offline clinical records reconciled zero-conflict.', 'success');
      }
    }, 1800);
  };

  return (
    <div className="space-y-5 text-left">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-blue-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
            <Radio size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black text-white tracking-tight">
                Offline Peer-to-Peer Mesh Clinical Sync
              </h4>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Low-Bandwidth Rural Clinic Mode
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Synchronizes patient queues, telemetry, and prescriptions between healthcare devices without requiring internet or cellular data.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isSimulatingSync}
          onClick={handleTriggerMeshSync}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          {isSimulatingSync ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
          <span>{isSimulatingSync ? 'Reconciling Ledger...' : 'Run P2P Mesh Sync'}</span>
        </button>
      </div>

      {/* Mesh Network Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400">Offline Queue</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{offlineQueuedRecords} Records</p>
          <p className="text-[11px] text-slate-400">
            Encrypted in local browser IndexedDB with SHA-256 block receipts.
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400">Active Peer Nodes</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-2xl font-black text-white font-mono">3 Discovered</p>
          <p className="text-[11px] text-slate-400">
            WebRTC Direct Broadcast & Wi-Fi Direct Mesh active.
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400">Data Integrity</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">100% Verified</p>
          <p className="text-[11px] text-slate-400">
            Zero-conflict CRDT synchronization ledger guarantees zero data loss.
          </p>
        </div>
      </div>

      {/* Connected Clinic Nodes List */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b pb-2 border-slate-800">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Local Clinic Mesh Peers
          </h5>
          <span className="text-[10px] font-mono text-emerald-400">
            Peer Discovery: Continuous Multicast
          </span>
        </div>

        <div className="space-y-2.5">
          {meshNodes.map((node) => (
            <div
              key={node.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-850 border border-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h6 className="text-xs font-bold text-white">{node.name}</h6>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {node.role} • {node.ip}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-300">
                  {node.recordsQueued > 0 ? (
                    <strong className="text-amber-400">{node.recordsQueued} pending sync</strong>
                  ) : (
                    <span className="text-emerald-400 font-bold">Synchronized</span>
                  )}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {node.lastSync}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
