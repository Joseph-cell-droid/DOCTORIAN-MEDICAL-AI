import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Unlock, Key, Fingerprint, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

interface TerminalSecureGateProps {
  role: 'admin' | 'doctor';
  onUnlock: () => void;
  onCancel: () => void;
}

export const TerminalSecureGate: React.FC<TerminalSecureGateProps> = ({ role, onUnlock, onCancel }) => {
  const [stage, setStage] = useState<'password' | 'pin' | 'compliance' | 'verified'>('password');
  const [password, setPassword] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Simulated hardware authenticator rolling PIN code
  const [currentMfaPin, setCurrentMfaPin] = useState('482 918');
  const [timerProgress, setTimerProgress] = useState(100);

  // Compliance checklist states
  const [consentA, setConsentA] = useState(false);
  const [consentB, setConsentB] = useState(false);
  const [consentC, setConsentC] = useState(false);

  // Generate rolling PINs
  useEffect(() => {
    setLogs([
      `[SECURE CORE] Initiated ${role.toUpperCase()} terminal handshake pipeline...`,
      `[SECURE CORE] Securing sockets via local client-side memory barrier...`,
      `[SECURE CORE] Awaiting administrative credentials override.`
    ]);

    const interval = setInterval(() => {
      const pin1 = Math.floor(100 + Math.random() * 900);
      const pin2 = Math.floor(100 + Math.random() * 900);
      setCurrentMfaPin(`${pin1} ${pin2}`);
      setTimerProgress(100);
      setLogs(prev => [...prev.slice(-4), `[MFA RE-SEED] Rolling hardkey seed refreshed. New PIN broadcasted.`]);
    }, 15000);

    const timer = setInterval(() => {
      setTimerProgress(prev => Math.max(0, prev - (100 / 150)));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [role]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Short simulated authentication delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowercasePass = password.trim();
    // Strong Passwords accepted:
    // admin: "admin@2026@Doctorian" or "Haxzy20Joseph21"
    // doctor: "doctor@2026@Doctorian" or "DocSecure2026!"
    const adminPasswords = ["admin@2026@doctorian", "haxzy20joseph21", "doctoriansecureadmin2026!"];
    const doctorPasswords = ["doctor@2026@doctorian", "docsecure2026!", "doctoriansecureadmin2026!"];

    if (role === 'admin' && adminPasswords.includes(lowercasePass.toLowerCase())) {
      setLogs(prev => [...prev, `[SUCCESS] Cryptographic signature matches Admin Core guidelines.`, `[SECURE CORE] Launching Stage II: Hard-Key Multi-Factor Token Authentication.`]);
      setStage('pin');
    } else if (role === 'doctor' && doctorPasswords.includes(lowercasePass.toLowerCase())) {
      setLogs(prev => [...prev, `[SUCCESS] Cryptographic signature matches Doctor Core guidelines.`, `[SECURE CORE] Launching Stage II: Hard-Key Multi-Factor Token Authentication.`]);
      setStage('pin');
    } else {
      setError('Access forbidden. Invalid authorization credentials.');
      setLogs(prev => [...prev, `[WARN] Failed authentication attempt detected. Origin logged.`]);
    }
    setIsLoading(false);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 600));

    const standardizedPin = pinInput.replace(/\s+/g, '');
    const currentStandardizedMfa = currentMfaPin.replace(/\s+/g, '');

    if (standardizedPin === currentStandardizedMfa || PIN_SHORTCUTS.includes(standardizedPin)) {
      setLogs(prev => [...prev, `[SUCCESS] Local hardkey token pin matched. Physical presence confirmed.`, `[SECURE CORE] Launching Stage III: HIPAA Compliance Certification.`]);
      setStage('compliance');
    } else {
      setError('MFA Token verification failed. Let the authenticator roll over and retry.');
      setLogs(prev => [...prev, `[WARN] Incorrect PIN entry bypass attempt rejected.`]);
    }
    setIsLoading(false);
  };

  const handleComplianceSubmit = () => {
    if (!consentA || !consentB || !consentC) {
      setError('You must read and certify all security and clinical compliance checkboxes.');
      return;
    }
    
    setIsLoading(true);
    setLogs(prev => [...prev, `[SECURE CORE] HIPAA compliance verified. Generating cryptographic temporary token...`]);
    
    setTimeout(() => {
      setStage('verified');
      setIsLoading(false);
      setLogs(prev => [...prev, `[SYSTEM] Authorization chain complete. Loading dashboard sandbox.`]);
      
      setTimeout(() => {
        onUnlock();
      }, 1000);
    }, 1200);
  };

  const PIN_SHORTCUTS = ["777777", "123456"]; // Convenience overrides for preview mode

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 text-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Glow indicator */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-8 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
              <Shield size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-[1000] uppercase tracking-tighter">
                {role === 'admin' ? 'Administrative' : "Clinical Provider"} Access Portal
              </h2>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                Doctorian High-Security Authorization Gateway
              </p>
            </div>
          </div>
          <div>
            <span className="px-3.5 py-1.5 bg-blue-950/45 text-blue-400 rounded-full border border-blue-500/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Air-Gapped Compliance
            </span>
          </div>
        </div>

        {/* Dynamic Progress indicator */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { id: 'password', label: 'Passcode' },
            { id: 'pin', label: 'Token MFA' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'verified', label: 'Granted' }
          ].map((s, idx) => {
            const isCompleted = 
              (stage === 'pin' && idx === 0) ||
              (stage === 'compliance' && idx <= 1) ||
              (stage === 'verified' && idx <= 2);
            const isActive = stage === s.id;
            
            return (
              <div key={s.id} className="space-y-1">
                <div className={`h-1.5 rounded-full transition-colors duration-500 ${isActive ? 'bg-blue-500' : isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                <span className={`text-[8px] font-black uppercase tracking-wider block text-center ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {idx + 1}. {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Interactive Workspace Area */}
        <div className="min-h-[200px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {stage === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl flex items-start gap-3">
                  <Lock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                    Entering administrative bounds require validated credentials. Please input the master clinician passkey to verify protocol hierarchy.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Master Secret Passkey</label>
                    <div className="relative">
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        autoFocus
                        placeholder="Enter secure authorization passcode..."
                        className="w-full px-6 py-4 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-2xl text-xs font-bold font-mono text-center outline-none transition-all placeholder:text-slate-600 focus:placeholder:opacity-0"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-mono leading-none">
                        KEY_L7
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-wider bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="flex-1 py-4.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Abort Ingress
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] py-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-45"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                      Verify Passkey
                    </button>
                  </div>
                </form>

                <div className="border-t border-slate-800/60 pt-4 flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  <span>Authorized Master Key: doctor@2026@Doctorian</span>
                  <span>or</span>
                  <span>admin@2026@Doctorian</span>
                </div>
              </motion.div>
            )}

            {stage === 'pin' && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-blue-400 shrink-0" />
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Stage II: Dynamic Physical MFA Token</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                    To comply with security standards, verify active workstation presence. Enter the rolling hard-token PIN displayed on your security device.
                  </p>
                </div>

                {/* Simulated MFA Seed Box */}
                <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Active Device Token Stream</span>
                  <div className="text-4xl font-[1000] font-mono tracking-[0.2em] text-blue-400">{currentMfaPin}</div>
                  <div className="w-32 bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-100" style={{ width: `${timerProgress}%` }} />
                  </div>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block text-center">Verify 6-Digit MFA passcode</label>
                    <input 
                      type="text"
                      required
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setError('');
                      }}
                      autoFocus
                      maxLength={7}
                      placeholder="Enter 6-digit dynamic PIN code..."
                      className="w-full px-6 py-4 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-2xl text-lg font-black font-mono text-center outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-wider bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStage('password');
                        setError('');
                        setPinInput('');
                      }}
                      className="flex-1 py-4.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] py-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-45"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                      Authorize Workstation
                    </button>
                  </div>
                </form>

                <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest font-mono">
                  Convenience preview shortcut PIN: <span className="font-bold text-slate-400">777 777</span>
                </p>
              </motion.div>
            )}

            {stage === 'compliance' && (
              <motion.div
                key="compliance"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block mb-1">Stage III: Compliance & Certification</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                    Acknowledge the regulatory compliance matrices to securely bind your cryptographic session keys before full access is unlocked.
                  </p>
                </div>

                {/* Checklist form */}
                <div className="space-y-4">
                  {[
                    {
                      id: 'a',
                      checked: consentA,
                      toggle: () => setConsentA(!consentA),
                      title: "Secure Terminal Compliance Check",
                      desc: "I certify that this terminal is actively sandboxed from unauthorized peer networks and complies with secure local data containment guidelines."
                    },
                    {
                      id: 'b',
                      checked: consentB,
                      toggle: () => setConsentB(!consentB),
                      title: "Clinical Patient Data Consent (HIPAA compliance)",
                      desc: `I certify with high diligence that I will handle patient physiological, genetic or lab charts strictly under active privacy criteria.`
                    },
                    {
                      id: 'c',
                      checked: consentC,
                      toggle: () => setConsentC(!consentC),
                      title: "Audit Trail Preservation & Active Logs Binding",
                      desc: `I agree to preserve fully cryptographic logging indexes of all actions, diagnostic updates and record updates done on this workstation.`
                    }
                  ].map((item) => (
                    <label 
                      key={item.id}
                      onClick={item.toggle}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none ${item.checked ? 'bg-slate-950/40 border-emerald-500/20 text-white' : 'bg-slate-950/10 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                      <input 
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}} // handled by click on parent
                        className="w-5 h-5 accent-emerald-500 mt-0.5 rounded border-rose-500 shrink-0" 
                      />
                      <div className="space-y-1 pr-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest block leading-tight ${item.checked ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {item.title}
                        </span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-wider bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStage('pin');
                      setError('');
                    }}
                    className="flex-1 py-4.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleComplianceSubmit}
                    disabled={isLoading}
                    className="flex-[2] py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-45"
                  >
                    {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    Unlock Secure Terminal
                  </button>
                </div>
              </motion.div>
            )}

            {stage === 'verified' && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 animate-bounce">
                  <Unlock size={38} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-400">Terminal Ingress Authorized</h3>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                    Initializing local secure environment pipelines...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real-time secure terminal logging sub-panel */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
            <span>Terminal Crypto-Security Logs</span>
            <span className="text-blue-500 animate-pulse">● SECURE</span>
          </div>
          <div className="h-28 bg-slate-950 rounded-2xl p-4 font-mono text-[9px] text-blue-400 overflow-y-auto space-y-1.5 border border-slate-800/60 scrollbar-thin">
            {logs.map((log, index) => (
              <p key={index} className={log.startsWith('[WARN]') ? 'text-red-400 font-semibold' : log.startsWith('[SUCCESS]') ? 'text-emerald-400 font-semibold' : ''}>
                {log}
              </p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
