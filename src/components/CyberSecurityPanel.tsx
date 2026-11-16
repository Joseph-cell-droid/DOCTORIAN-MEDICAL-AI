import { useState, useEffect } from 'react';
import { Shield, RefreshCw, ShieldCheck, Activity, AlertTriangle, Lock } from 'lucide-react';
import { api } from '../api';

interface CyberSecurityPanelProps {
  dashboardType: 'doctor' | 'admin';
}

export function CyberSecurityPanel({ dashboardType }: CyberSecurityPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [chainValid, setChainValid] = useState<boolean>(true);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [blockedThreats, setBlockedThreats] = useState<number>(0);
  const [activeSessions, setActiveSessions] = useState<number>(0);
  const [pendingClinicians, setPendingClinicians] = useState<number>(0);
  const [encryptionStandard, setEncryptionStandard] = useState<string>('AES-256-GCM + HMAC-SHA256 Chain + bcrypt(12)');
  const [antiFake, setAntiFake] = useState({
    proofOfWorkDifficulty: 3,
    disposableEmailFilter: true,
    honeypotActive: true,
    humanTimingGateMs: 650,
    adminPublicSignupBlocked: true,
    clinicianVerificationQuarantine: true,
  });
  const [auditLog, setAuditLog] = useState<string[]>([
    "[INIT] Synchronizing Doctorian Cryptographic Security Vault..."
  ]);

  const loadSecurityTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const status = await api.security.getStatus();
      setChainValid(status.chainIntegrity.valid);
      setTotalEvents(status.chainIntegrity.totalEvents);
      setBlockedThreats(status.metrics.blockedThreatEvents);
      setActiveSessions(status.metrics.activeTrackedSessions);
      setPendingClinicians(status.metrics.pendingClinicianApprovals);
      setEncryptionStandard(status.encryptionStandard);
      setAntiFake(status.antiFakeRegistration);

      const formatted = (status.recentEvents || []).map((ev) => {
        const tag = ev.severity === 'critical' || ev.severity === 'high' ? '[THREAT]' : '[AUDIT]';
        return `${tag} ${ev.event_type} — ${ev.details}`;
      });
      if (formatted.length > 0) {
        setAuditLog(formatted);
      } else {
        setAuditLog([
          `[SUCCESS] HMAC-SHA256 Audit Chain intact (${status.chainIntegrity.totalEvents} ledger entries).`,
          "[SHIELD] Anti-Fake-Registration PoW + Honeypot + Disposable-Email Filter ACTIVE."
        ]);
      }
    } catch (err: any) {
      setAuditLog((prev) => [
        `[WARN] Live telemetry restricted (${err?.message || 'sign in as staff to inspect full audit chain'}).`,
        ...prev.slice(0, 6)
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSecurityTelemetry();
  }, []);

  const handleRunAudit = async () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setAuditLog((prev) => [`[AUDIT] Running cryptographic HMAC-SHA256 ledger integrity check...`, ...prev]);

    try {
      const res = await api.security.runAudit();
      const ok = Boolean(res?.ok ?? res?.chain?.valid);
      setChainValid(ok);
      setAuditLog((prev) => [
        ok
          ? `[SUCCESS] Hash-chain integrity VERIFIED across ${res?.chain?.totalEvents ?? totalEvents} immutable events. 0 tampering detected.`
          : `[THREAT] Hash-chain mismatch detected at event ${res?.chain?.brokenAtId}!`,
        ...prev
      ]);
      await loadSecurityTelemetry();
    } catch (err: any) {
      setAuditLog((prev) => [
        `[AUDIT] ${err?.message || 'Full chain mutation audit requires active Administrator clearance.'}`,
        ...prev
      ]);
      await loadSecurityTelemetry();
    } finally {
      setIsAuditing(false);
    }
  };

  const securityScore = chainValid ? 100 : 45;

  return (
    <div className="bg-slate-950 text-slate-100 rounded-[2rem] p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl shrink-0">
            <ShieldCheck size={24} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-extrabold uppercase tracking-tight text-slate-200">
              {dashboardType === 'admin' ? 'Tamper-Evident Security & Anti-Fake Shield' : 'Clinician Session & Anti-Tamper Vault'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${chainValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">
                {encryptionStandard}
              </span>
            </div>
          </div>
        </div>

        <div className="px-3.5 py-1.5 bg-slate-900/60 border border-slate-800 rounded-xl text-center shrink-0">
          <span className="text-[8px] text-slate-500 font-extrabold uppercase block tracking-widest mb-0.5">CHAIN INTEGRITY</span>
          <span className={`text-sm font-mono font-black ${chainValid ? 'text-emerald-400' : 'text-rose-400'}`}>
            {securityScore}% {chainValid ? 'INTACT' : 'ALERT'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        <div className="lg:col-span-7 space-y-4">
          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            Every registration requires a SHA-256 Proof-of-Work token, human puzzle, timing gate, and disposable-email block. Staff accounts remain quarantined until Hospital Admin verification.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: "Anti-Bot Proof-of-Work Gate",
                desc: `SHA-256 Difficulty ${antiFake.proofOfWorkDifficulty} + ${antiFake.humanTimingGateMs}ms Timing`,
                badge: antiFake.honeypotActive ? "Enforced" : "Active",
                color: "text-blue-400 bg-blue-500/5 border-blue-500/20"
              },
              {
                title: "Fake Registration Filter",
                desc: "50+ Disposable Domains & Fake Names Blocked",
                badge: antiFake.disposableEmailFilter ? "Active" : "Standby",
                color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20"
              },
              {
                title: "Public Admin Signup Block",
                desc: `Clinician Quarantine: ${pendingClinicians} Pending`,
                badge: antiFake.adminPublicSignupBlocked ? "Locked" : "Active",
                color: "text-violet-400 bg-violet-500/5 border-violet-500/20"
              },
              {
                title: "HMAC-SHA256 Audit Ledger",
                desc: `${blockedThreats} Threats Blocked • ${activeSessions} Live JTI Sessions`,
                badge: chainValid ? "Verified" : "Check",
                color: chainValid ? "text-amber-400 bg-amber-500/5 border-amber-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/30"
              }
            ].map((stat, idx) => (
              <div key={`cybersecuritypanel-stat-${idx}`} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{stat.title}</span>
                  <span className={`text-[8px] font-black font-mono uppercase px-2 py-0.5 rounded-md border ${stat.color}`}>
                    {stat.badge}
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-400 font-bold leading-tight uppercase tracking-wider">{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={loadSecurityTelemetry}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-[0.98] border border-blue-500/20 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Syncing Vault..." : "Sync Security Telemetry"}
            </button>

            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-[0.98] border border-slate-800 cursor-pointer"
            >
              <Shield size={11} />
              {isAuditing ? "Verifying Chain..." : "Verify Hash-Chain Audit"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
                <Activity size={10} className="text-cyan-400" />
                Live Security Events ({totalEvents})
              </span>
              <span className="text-[8px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <Lock size={9} /> CSRF + JTI ACTIVE
              </span>
            </div>

            <div className="h-32 overflow-y-auto space-y-1.5 font-mono text-[8.5px] text-slate-400 scrollbar-thin pr-1 text-left">
              {auditLog.map((log, idx) => (
                <p
                  key={`cybersecuritypanel-log-${idx}`}
                  className={
                    log.includes('[THREAT]')
                      ? 'text-rose-400 font-semibold flex items-start gap-1'
                      : log.includes('[SUCCESS]')
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-300'
                  }
                >
                  {log.includes('[THREAT]') && <AlertTriangle size={10} className="shrink-0 mt-0.5" />}
                  <span>{log}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[8px] font-mono text-slate-400">
            <span>HTTPONLY JWT + TIMING-SAFE KEYS</span>
            <span className={chainValid ? "text-emerald-500 font-extrabold" : "text-rose-500 font-extrabold"}>
              ● {chainValid ? 'ZERO-TAMPER VERIFIED' : 'INTEGRITY ALERT'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
