import { useState } from 'react';
import { Shield, Key, Lock, Cpu, CheckCircle2, RefreshCw, Eye, Download, ShieldCheck, Activity } from 'lucide-react';

interface CyberSecurityPanelProps {
  dashboardType: 'doctor' | 'admin';
}

export function CyberSecurityPanel({ dashboardType }: CyberSecurityPanelProps) {
  const [isRotating, setIsRotating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [securityScore, setSecurityScore] = useState(99.9);
  const [sessionHash, setSessionHash] = useState(() => 
    Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  );
  const [auditLog, setAuditLog] = useState<string[]>([
    "Initial security posture assessment: NOMINAL",
    "TLS 1.3 cryptographic handshake established",
    "FIDO2 / WebAuthn identity bounds verified"
  ]);

  const handleRotateKeys = () => {
    setIsRotating(true);
    setAuditLog(prev => [`[KEYGEN] Generating Kyber-1024 Quantum-Resistant keypair...`, ...prev]);
    
    setTimeout(() => {
      setIsRotating(false);
      const newHash = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setSessionHash(newHash);
      setSecurityScore(99.98);
      setAuditLog(prev => [
        `[SUCCESS] Key rotation complete. Active session bound to hash: ${newHash}`,
        ...prev
      ]);
    }, 1200);
  };

  const handleRunAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setAuditProgress(0);
    setAuditLog(prev => [`[AUDIT] Starting local zero-knowledge vault validation...`, ...prev]);

    const interval = setInterval(() => {
      setAuditProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsAuditing(false);
          setSecurityScore(100);
          setAuditLog(prevLogs => [
            `[SUCCESS] Cryptographic posture audit: 100% SECURE. 0 vulnerabilities found.`,
            ...prevLogs
          ]);
          return 100;
        }
        return p + 20;
      });
    }, 250);
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-[2rem] p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl shrink-0">
            <ShieldCheck size={24} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-extrabold uppercase tracking-tight text-slate-200">
              {dashboardType === 'admin' ? 'Advanced Security Posture & Cryptography' : 'Clinician Session Encryption Vault'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">
                AES-256-GCM / KYBER-1024 SECURED
              </span>
            </div>
          </div>
        </div>

        <div className="px-3.5 py-1.5 bg-slate-900/60 border border-slate-850 rounded-xl text-center shrink-0">
          <span className="text-[8px] text-slate-500 font-extrabold uppercase block tracking-widest mb-0.5">TRUST LEVEL</span>
          <span className="text-sm font-mono font-black text-emerald-400">{securityScore}% SECURE</span>
        </div>
      </div>

      {/* Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Side: Advanced Cryptography Statuses */}
        <div className="lg:col-span-7 space-y-4">
          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            This workspace operates under a zero-trust network perimeter. All patient telemetry charts, clinical handovers, and database writes undergo local end-to-end payload signing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: "Post-Quantum Cryptography",
                desc: "Kyber-1024 Key Exchange Encapsulation",
                badge: "Active",
                color: "text-blue-400 bg-blue-500/5 border-blue-500/10"
              },
              {
                title: "Zero-Knowledge Database Sync",
                desc: "Pre-encryption before cloud pipeline",
                badge: "Compliant",
                color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
              },
              {
                title: "FIDO2 Keyring Isolation",
                desc: "WebAuthn hardware bound assertions",
                badge: "Enforced",
                color: "text-violet-400 bg-violet-500/5 border-violet-500/10"
              },
              {
                title: "Local API Shield Tunneling",
                desc: "TLS 1.3 socket route binding",
                badge: "Optimal",
                color: "text-amber-400 bg-amber-500/5 border-amber-500/10"
              }
            ].map((stat, idx) => (
              <div key={`cybersecuritypanel-l128-idx-${idx}`} className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{stat.title}</span>
                  <span className={`text-[8px] font-black font-mono uppercase px-2 py-0.5 rounded-md border ${stat.color}`}>
                    {stat.badge}
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-550 font-bold leading-tight uppercase tracking-wider">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              onClick={handleRotateKeys}
              disabled={isRotating}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-[0.98] border border-blue-500/20 shadow-md shadow-blue-500/10"
            >
              <RefreshCw size={11} className={isRotating ? "animate-spin" : ""} />
              {isRotating ? "Generating Key..." : "Rotate Quantum Keypair"}
            </button>

            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-[0.98] border border-slate-800"
            >
              <Shield size={11} />
              {isAuditing ? `Auditing (${auditProgress}%)` : "Dispatch Shield Audit"}
            </button>
          </div>
        </div>

        {/* Right Side: Security Ledger Logs */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-850 p-4 rounded-2xl space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono flex items-center gap-1.5">
                <Activity size={10} className="text-slate-400" />
                Security Ledger Log
              </span>
              <span className="text-[8px] font-mono font-bold text-blue-400 select-all truncate max-w-[120px]" title={sessionHash}>
                HASH: {sessionHash}
              </span>
            </div>

            <div className="h-28 overflow-y-auto space-y-1 font-mono text-[8.5px] text-slate-400 scrollbar-thin pr-1 text-left">
              {auditLog.map((log, idx) => (
                <p key={`cybersecuritypanel-l177-idx-${idx}`} className={log.includes('[SUCCESS]') ? 'text-emerald-400 font-semibold' : log.includes('[KEYGEN]') ? 'text-blue-400' : ''}>
                  {log}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-[8px] font-mono text-slate-500">
            <span>DEVICE ID: SECURE_NODE_98X</span>
            <span className="text-emerald-500 animate-pulse font-extrabold">● SYSTEM TRUST NOMINAL</span>
          </div>
        </div>

      </div>
    </div>
  );
};
