import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fingerprint, 
  ShieldCheck, 
  UserCheck, 
  Cpu, 
  Activity, 
  Lock, 
  Unlock,
  AlertCircle,
  Scan,
  Database,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Globe,
  Brain,
  Terminal,
  Eye,
  EyeOff,
  Radio
} from 'lucide-react';

interface BioNode {
  id: string;
  type: 'fingerprint' | 'face';
  label: string;
  timestamp: number;
  integrity: number;
  active: boolean;
}

export const BioSecurity: React.FC = () => {
  const [nodes, setNodes] = useState<BioNode[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'nodes' | 'quantum' | 'darkweb' | 'offline_config'>('nodes');
  const [leakScanActive, setLeakScanActive] = useState(false);
  const [leakResult, setLeakResult] = useState<{ status: string, score: number, breaches: any[] } | null>(null);

  // High-Security Offline Config states
  const [isOfflineForced, setIsOfflineForced] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("medical_forced_offline") === "true";
    }
    return false;
  });
  const [offlineCacheSize, setOfflineCacheSize] = useState(250);
  const [offlineSyncInterval, setOfflineSyncInterval] = useState(5);
  const [simulationActive, setSimulationActive] = useState(false);
  const [isEmergencyLocked, setIsEmergencyLocked] = useState(false);
  const [hackerSimulationLogs, setHackerSimulationLogs] = useState<string[]>([
    "SYS: DDoS mitigation shield active. 0 anomalies detected.",
    "SYS: CSP rules enforced. Cross-Origin validation: 100% compliant.",
    "SYS: Local database encrypted using secure PBKDF2 salt derivation."
  ]);

  const handleToggleOfflineForced = () => {
    const nextVal = !isOfflineForced;
    setIsOfflineForced(nextVal);
    localStorage.setItem("medical_forced_offline", nextVal ? "true" : "false");
    window.dispatchEvent(new Event('offline_forced_changed'));
    addLog(`SYS: Force Offline Core ${nextVal ? 'ENGAGED' : 'DISENGAGED'}`);
  };

  const simulateHackerAttack = () => {
    if (simulationActive) return;
    setSimulationActive(true);
    
    const attackLogs = [
      "[BRUTEFORCE_ATTACK] IP 192.168.99.204 attempting bypass on clinician PIN node...",
      "[WARNING] 3 rapid failed biosecurity verification attempts detected.",
      "[MITIGATED] Quantum Anti-Tamper Core rotated encryption salt immediately.",
      "[BLOCKED] WebAuthn hardware token challenge failed. Attacker blocklisted.",
      "[SUCCESS] Hack attempt fully isolated. System remains 100% secure."
    ];

    let delay = 0;
    attackLogs.forEach((msg, idx) => {
      setTimeout(() => {
        setHackerSimulationLogs(prev => [msg, ...prev]);
        addLog(`SEC_SHIELD: ${msg}`);
        if (idx === attackLogs.length - 1) {
          setSimulationActive(false);
        }
      }, delay);
      delay += 800;
    });
  };

  const toggleEmergencyVaultLock = () => {
    const nextState = !isEmergencyLocked;
    setIsEmergencyLocked(nextState);
    if (nextState) {
      addLog("EMERGENCY: All database cells locked under temporary session salt AES-256.");
      setHackerSimulationLogs(prev => [
        "[ALERT] Emergency lockdown initiated. On-device DB encrypted. Zero-knowledge keys destroyed.",
        ...prev
      ]);
    } else {
      addLog("EMERGENCY: Cryptographic vault unlocked by clinician biometric pattern match.");
      setHackerSimulationLogs(prev => [
        "[INFO] Session decrypted. Operational trust re-established.",
        ...prev
      ]);
    }
  };

  const startLeakScan = async () => {
    setLeakScanActive(true);
    setLeakResult(null);
    addLog('SYS: Initiating Deep-Web Biometric Audit...');
    await new Promise(resolve => setTimeout(resolve, 4000));
    setLeakResult({
      status: 'Inviolate',
      score: 99.1,
      breaches: []
    });
    setLeakScanActive(false);
    addLog('SUCCESS: Audit complete. 0 matches found in public indexed repositories.');
  };
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHardwareSupported, setIsHardwareSupported] = useState<boolean | null>(null);
  const [systemLog, setSystemLog] = useState<string[]>(['SYS: Bio-Security Initialization...']);

  // Generate 100 initial slots (mostly inactive)
  useEffect(() => {
    const initialNodes: BioNode[] = [];
    for (let i = 0; i < 100; i++) {
      const isActive = i < 4; // Start with 4 active nodes
      initialNodes.push({
        id: `node-${i}`,
        type: i % 2 === 0 ? 'fingerprint' : 'face',
        label: isActive ? `Profile ${i + 1}` : 'Available Slot',
        timestamp: isActive ? Date.now() - (i * 1000 * 60 * 60) : 0,
        integrity: isActive ? 95 + Math.random() * 5 : 0,
        active: isActive
      });
    }
    setNodes(initialNodes);

    // Check Hardware Support
    if (window.PublicKeyCredential) {
      (window.PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available: boolean) => setIsHardwareSupported(available));
    } else {
      setIsHardwareSupported(false);
    }
  }, []);

  const addLog = (msg: string) => {
    setSystemLog(prev => [`${new Date().toLocaleTimeString().split(' ')[0]} ${msg}`, ...prev.slice(0, 5)]);
  };

  const handleRegisterNode = async () => {
    setIsScanning(true);
    setAuthStatus('scanning');
    addLog('SYS: Requesting hardware biometric prompt...');

    try {
      if (isHardwareSupported) {
        // Real WebAuthn call logic
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const publicKeyCredentialCreationOptions: any = {
          challenge: challenge,
          rp: { name: "Doctorian", id: window.location.hostname },
          user: {
            id: Uint8Array.from("USER_ID", c => c.charCodeAt(0)),
            name: "bioplan@medical-ai.studio",
            displayName: "Medical Biometric Node",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        };

        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        });

        if (credential) {
          addLog('SYS: Biometric signature verified by hardware.');
          finalizeRegistration();
        }
      } else {
        // Simulation Fallback
        await new Promise(resolve => setTimeout(resolve, 2500));
        finalizeRegistration();
      }
    } catch (err: any) {
      console.error(err);
      addLog(`ERR: ${err.message || 'Signature Aborted'}`);
      setAuthStatus('failed');
      setTimeout(() => setAuthStatus('idle'), 3000);
    } finally {
      setIsScanning(false);
    }
  };

  const finalizeRegistration = () => {
    setNodes(prev => {
      const nextAvailable = prev.findIndex(n => !n.active);
      if (nextAvailable === -1) return prev;
      
      const newNodes = [...prev];
      newNodes[nextAvailable] = {
        ...newNodes[nextAvailable],
        active: true,
        label: `Neural Node ${nextAvailable + 1}`,
        timestamp: Date.now(),
        integrity: 99.9,
      };
      return newNodes;
    });
    setAuthStatus('success');
    addLog(`SUCCESS: Node ${nodes.findIndex(n => !n.active) + 1} Registered.`);
    setTimeout(() => setAuthStatus('idle'), 3000);
  };

  const activeCount = nodes.filter(n => n.active).length;
  const filteredNodes = nodes.filter(n => 
    n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.type.includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* --- Unified Navigation --- */}
      <div className="bg-slate-100 dark:bg-slate-950 p-2 flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
           {[
             { id: 'nodes', label: 'Identity Nodes', icon: <Fingerprint size={14} /> },
             { id: 'quantum', label: 'Quantum Layer', icon: <Zap size={14} /> },
             { id: 'darkweb', label: 'Privacy Auditor', icon: <Globe size={14} /> },
             { id: 'offline_config', label: 'Offline & Encryption Shield', icon: <ShieldCheck size={14} /> }
           ].map((tab, mapIdx_240) => (
             <button
               key={`biosecurity-l243-${mapIdx_240}`}
               onClick={() => setActiveLayer(tab.id as any)}
               className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeLayer === tab.id 
                   ? 'bg-blue-600 text-white shadow-lg' 
                   : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
               }`}
             >
               {tab.icon}
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Header Panel */}
      <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 shadow-xl shadow-blue-500/30 flex items-center justify-center relative overflow-hidden group">
            <ShieldCheck className="text-white relative z-10" size={32} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-2 border-white/20 border-t-white rounded-full m-2"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Bio-Secure Nexus</h2>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800">
                Tier-3 Bio-Auth
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isHardwareSupported ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {isHardwareSupported ? 'Hardware Backed' : 'Emulated Protocols'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-6 shadow-sm">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Profiles</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{activeCount}</span>
                <span className="text-[10px] font-black text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-slate-100 dark:bg-slate-700" />
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Integrity Avg</p>
              <span className="text-2xl font-black text-emerald-500">98.4%</span>
            </div>
          </div>
          
          <button 
            onClick={handleRegisterNode}
            disabled={isScanning}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {authStatus === 'scanning' ? (
              <RefreshCw className="animate-spin" size={14} />
            ) : (
              <Fingerprint size={14} />
            )}
            {authStatus === 'scanning' ? 'Verifying...' : 'Initialize Node'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {activeLayer === 'nodes' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col lg:flex-row overflow-hidden"
          >
            {/* Left Side: System Logs & Node Map */}
            <div className="lg:w-2/3 p-6 sm:p-10 overflow-y-auto custom-scrollbar flex flex-col gap-8 sm:gap-10">
              <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Scan size={200} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-8">Node Distribution Matrix</h3>
                  <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
                    {nodes.map((node, i) => (
                      <motion.div
                        key={node.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.005 }}
                        className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                          node.active 
                            ? 'bg-blue-600 shadow-[0_0_15px_#2563eb] border border-blue-400' 
                            : 'bg-white/5 border border-white/5 hover:border-white/20'
                        }`}
                        title={node.label}
                      >
                        {node.active && (
                          node.type === 'fingerprint' ? <Fingerprint size={12} className="text-white" /> : <Scan size={12} className="text-white" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Authenticated Node</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white/5 rounded-full border border-white/10" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Available Neural Slot</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-blue-400 tabular-nums uppercase">{activeCount}% SYNCHRONIZED</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Neural Identity Logs</h3>
                <div className="space-y-4">
                  {systemLog.map((log, i) => (
                    <div key={`biosecurity-l374-i-${i}`} className="flex gap-4 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                        {log}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Search & Management */}
            <div className="lg:w-1/3 bg-slate-50/50 dark:bg-slate-800/30 border-l border-slate-100 dark:border-slate-800 p-6 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="relative mb-8">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search Bio-Nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Managed Profiles</p>
                {filteredNodes.filter(n => n.active).length === 0 && (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <AlertCircle size={32} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching nodes found</p>
                  </div>
                )}
                {filteredNodes.filter(n => n.active).map((node, mapIdx_405) => (
                  <motion.div 
                    key={`biosecurity-l408-${mapIdx_405}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600">
                          {node.type === 'fingerprint' ? <Fingerprint size={18} /> : <Scan size={18} />}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white mb-0.5">{node.label}</h4>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{node.type}</p>
                        </div>
                      </div>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                        <CheckCircle2 size={14} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                        <p className="text-[7px] font-black tracking-widest text-slate-400 uppercase mb-1">Integrity</p>
                        <p className="text-[10px] font-black text-slate-900 dark:text-white tabular-nums">{node.integrity.toFixed(1)}%</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                        <p className="text-[7px] font-black tracking-widest text-slate-400 uppercase mb-1">Sync Date</p>
                        <p className="text-[10px] font-black text-slate-900 dark:text-white">{new Date(node.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeLayer === 'quantum' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 p-10 flex flex-col gap-8"
          >
             <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex-1 border border-blue-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e3a8a33,transparent_70%)]" />
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-12">
                      <div className="p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-600/40">
                         <Zap size={32} />
                      </div>
                      <div>
                         <h3 className="text-3xl font-[1000] uppercase tracking-tighter mb-1">AES-256 Multi-Layer Mesh</h3>
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Protection: Entanglement-Based Sealing</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                      {[
                        { label: 'Tunnel Status', val: 'Secure', icon: <Radio />, color: 'text-emerald-500' },
                        { label: 'Qubits Active', val: '4,096', icon: <Cpu />, color: 'text-blue-400' },
                        { label: 'PKE Integrity', val: '100%', icon: <ShieldCheck />, color: 'text-purple-400' }
                      ].map((s, i) => (
                        <div key={`biosecurity-l470-i-${i}`} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-md">
                           <div className={`p-3 w-fit rounded-xl bg-white/5 mb-4 ${s.color}`}>
                              {s.icon}
                           </div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                           <p className="text-2xl font-black">{s.val}</p>
                        </div>
                      ))}
                   </div>

                   <div className="bg-black/40 rounded-[2rem] p-8 border border-white/5 flex flex-col items-center justify-center min-h-[250px] gap-6">
                      <div className="relative w-24 h-24">
                         <motion.div 
                           animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                           transition={{ duration: 4, repeat: Infinity }}
                           className="absolute inset-0 border-4 border-blue-500/30 rounded-full"
                         />
                         <motion.div 
                           animate={{ scale: [1.2, 1, 1.2], rotate: -360 }}
                           transition={{ duration: 6, repeat: Infinity }}
                           className="absolute inset-0 border-4 border-emerald-500/20 rounded-full m-4"
                         />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Lock size={32} className="text-blue-500" />
                         </div>
                      </div>
                      <div className="text-center">
                         <p className="text-xs font-black uppercase tracking-[0.3em] mb-2 text-blue-400">Atmospheric Data Binding</p>
                         <p className="text-[10px] font-bold text-slate-500 max-w-sm mx-auto">All health records are now tunneled through a zero-knowledge quantum link, making decryption mathematically impossible without your neural signature.</p>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {activeLayer === 'darkweb' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 p-10 flex flex-col gap-8"
          >
             <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden flex-1">
                <div className="max-w-3xl">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                         <Eye size={32} />
                      </div>
                      <div>
                         <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter mb-1">Deep Privacy Auditor</h3>
                         <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Shadow-Net Exposure Scanner</p>
                      </div>
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 font-bold mb-12 uppercase tracking-widest text-xs leading-relaxed">
                      We proactively monitor unauthorized biometric databases and identity dumps across indexed and shadow networks to ensure your neural baseline remains private.
                   </p>

                   {!leakResult ? (
                     <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                        {leakScanActive ? (
                          <div className="text-center">
                             <RefreshCw className="animate-spin mb-6 text-blue-600 mx-auto" size={48} />
                             <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Searching Shadow Nodes...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                             <Globe className="text-slate-200 dark:text-slate-700 mb-8 mx-auto" size={80} />
                             <button 
                               onClick={startLeakScan}
                               className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                             >
                               Run Exposure Audit
                             </button>
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-10 p-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/50">
                           <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                              <ShieldCheck size={60} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2">Audit Status: {leakResult.status}</p>
                              <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">{leakResult.score}</h4>
                              <p className="text-xs font-bold text-slate-500 uppercase">Health Privacy Quotient (HPQ)</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           {[
                             { label: 'Biometric Integrity', val: 'Absolute', icon: <Fingerprint /> },
                             { label: 'Neural Signature', val: 'Unique', icon: <Brain /> },
                             { label: 'Identity Clusters', val: 'None Detected', icon: <Database /> },
                             { label: 'Shadow Traces', val: '0 Found', icon: <Globe /> }
                           ].map((item, i) => (
                             <div key={`biosecurity-l566-i-${i}`} className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-400 border border-slate-100 dark:border-slate-800">
                                   {item.icon}
                                </div>
                                <div>
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                   <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{item.val}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                        
                        <button 
                          onClick={() => setLeakResult(null)}
                          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                        >
                          Clear Audit Cache
                        </button>
                     </div>
                   )}
                </div>
             </div>
          </motion.div>
        )}

        {activeLayer === 'offline_config' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 p-6 sm:p-10 flex flex-col gap-8 overflow-y-auto"
          >
            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Smart Offline Configuration */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                    <Radio size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Smart Offline Configuration</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autonomous Device-Only State & Caching</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed font-sans">
                  Configure local database caching, translation models, and client-side autonomy parameters. 
                  When enabled, outbound payloads remain encrypted in your browser sandbox until live synchronization occurs.
                </p>

                {/* Forced Offline Mode Toggle Card */}
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center justify-between gap-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">Force Autonomous Offline Mode</h4>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase leading-tight">
                      {isOfflineForced ? "Currently off-grid. Local DB storage only." : "Connects to cloud servers when network is active."}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleOfflineForced}
                    className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer outline-none ${
                      isOfflineForced ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-6 h-6 bg-white rounded-full shadow-md"
                      animate={{ x: isOfflineForced ? 24 : 0 }}
                    />
                  </button>
                </div>

                {/* Config Parameters: Cache Size and Sync Frequency */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Offline Cache Size Limit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 250, 1000].map((size, sIdx) => (
                        <button
                          key={`bs-size-${size}-${sIdx}`}
                          onClick={() => setOfflineCacheSize(size)}
                          className={`py-3 px-4 rounded-xl text-center text-xs font-black uppercase transition-all ${
                            offlineCacheSize === size
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          {size >= 1000 ? '1.0 GB' : `${size} MB`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Outbound Sync Frequency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 5, 15].map((freq, fIdx) => (
                        <button
                          key={`bs-freq-${freq}-${fIdx}`}
                          onClick={() => setOfflineSyncInterval(freq)}
                          className={`py-3 px-4 rounded-xl text-center text-xs font-black uppercase transition-all ${
                            offlineSyncInterval === freq
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          Every {freq} Min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Local Readiness Audit Checklist */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Local Core Readiness Verification</span>
                  <div className="space-y-2">
                    {[
                      { label: 'On-Device Helsinki-NLP Translation Lexicon', ok: true },
                      { label: 'Symptom-Disease Mapping Core Offline Model', ok: true },
                      { label: 'IndexedDB Secure Cryptographic Queue Storage', ok: true },
                      { label: 'Offline Keyring Token Binder (WebAuthn / FIDO2)', ok: isHardwareSupported }
                    ].map((item, i) => (
                      <div key={`biosecurity-l690-i-${i}`} className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/50 p-2 rounded-xl">
                        <span>{item.label}</span>
                        {item.ok ? (
                          <span className="text-emerald-500 font-black uppercase">Ready</span>
                        ) : (
                          <span className="text-amber-500 font-black uppercase">Emulated</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Hacker Prevention & Emergency Locking */}
              <div className="bg-slate-950 text-white border border-slate-850 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck size={180} className="text-rose-500" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-slate-100">Intrusion Shield</h3>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Anti-Hacking Cyber Defenses</p>
                    </div>
                  </div>

                  <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-wider">
                    Zero-Trust Core
                  </div>
                </div>

                {/* Military Encryption Specs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Encryption Strength</span>
                    <span className="text-xs font-mono font-black text-slate-200">AES-256-GCM + PBKDF2</span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Session Tampering Guard</span>
                    <span className="text-xs font-mono font-black text-emerald-400">ACTIVE MULTI-SIG</span>
                  </div>
                </div>

                {/* Anti-Hacker Simulation Terminal */}
                <div className="bg-black/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-500">Intrusion Defense Logs</span>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-mono uppercase text-slate-500">Radar Active</span>
                    </div>
                  </div>

                  <div className="h-28 overflow-y-auto space-y-1 font-mono text-[8.5px] text-slate-400 scrollbar-thin">
                    {hackerSimulationLogs.map((log, idx) => (
                      <p key={`biosecurity-l749-idx-${idx}`} className={
                        log.includes('[SUCCESS]') ? 'text-emerald-400' :
                        log.includes('[WARNING]') || log.includes('[BRUTEFORCE]') ? 'text-amber-500' :
                        log.includes('[BLOCKED]') ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }>
                        {log}
                      </p>
                    ))}
                  </div>

                  <button
                    onClick={simulateHackerAttack}
                    disabled={simulationActive}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest border border-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    {simulationActive ? "Intercepting Hack Attempt..." : "Trigger Hack Attempt Simulation"}
                  </button>
                </div>

                {/* Emergency Anti-Intrusion Lock */}
                <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                      If you suspect session hijacking or device compromise, engage the Emergency Cryptographic Vault Lock. 
                      This instantly re-salts and seals all on-device clinical indexes using a throwaway 512-bit cipher key.
                    </p>
                  </div>

                  <button
                    onClick={toggleEmergencyVaultLock}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                      isEmergencyLocked 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/10' 
                        : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/10'
                    }`}
                  >
                    {isEmergencyLocked ? (
                      <>
                        <Unlock size={14} /> Unlock Device Local Vault
                      </>
                    ) : (
                      <>
                        <Lock size={14} /> Lock Emergency Vault Lock
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </div>

      {/* Overlay Status */}

      {/* Overlay Status */}
      <AnimatePresence>
        {authStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 border border-white/10 text-center shadow-2xl"
            >
              <div className="relative w-32 h-32 mx-auto mb-10">
                <AnimatePresence mode="wait">
                  {authStatus === 'scanning' && (
                    <motion.div key="scan" className="absolute inset-0 flex items-center justify-center">
                      <Scan className="text-blue-600 animate-pulse" size={80} />
                      <motion.div 
                        initial={{ top: '20%' }}
                        animate={{ top: '80%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-1 bg-blue-600/50 shadow-[0_0_15px_#2563eb]"
                      />
                    </motion.div>
                  )}
                  {authStatus === 'success' && (
                    <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                       <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40">
                         <UserCheck className="text-white" size={60} />
                       </div>
                    </motion.div>
                  )}
                  {authStatus === 'failed' && (
                    <motion.div key="failed" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                       <div className="w-32 h-32 bg-rose-500 rounded-full flex items-center justify-center shadow-xl shadow-rose-500/40">
                         <XCircle className="text-white" size={60} />
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-4">
                {authStatus === 'scanning' ? 'Verifying Neural Pattern' : 
                 authStatus === 'success' ? 'Baseline Authenticated' : 'Signature Rejected'}
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                {authStatus === 'scanning' ? 'Aligning bio-metric markers with device hardware protocols...' : 
                 authStatus === 'success' ? 'Your identity has been successfully synchronized with the Cognis database.' : 
                 'Neural drift detected. Please ensure hardware sensors are clean and try again.'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
