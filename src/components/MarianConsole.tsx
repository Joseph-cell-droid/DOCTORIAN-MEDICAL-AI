import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Terminal, 
  Cpu, 
  Check, 
  Download, 
  RefreshCw, 
  Trash2, 
  Globe, 
  Play, 
  AlertCircle 
} from 'lucide-react';
import { 
  MarianMTRegistry, 
  subscribeMarianLogs, 
  clearMarianLogs, 
  isMarianMTModeActive, 
  setMarianMTModeActive,
  addMarianLog
} from '../utils/marianMT';

interface MarianConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  downloadedLanguages: string[];
  onDownloadLanguage: (lang: string) => void;
  currentLanguage: string;
}

export function MarianConsole({ 
  isOpen, 
  onClose, 
  downloadedLanguages, 
  onDownloadLanguage, 
  currentLanguage 
}: MarianConsoleProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [playgroundText, setPlaygroundText] = useState('Welcome back, doctor. Patient heart rate is elevated.');
  const [playgroundTarget, setPlaygroundTarget] = useState('Luganda');
  const [playgroundResult, setPlaygroundResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [backend, setBackend] = useState<'WebGPU' | 'WebAssembly' | 'WebGL'>('WebGPU');
  const [isOfflineActive, setIsOfflineActive] = useState(() => isMarianMTModeActive());
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeMarianLogs((newLogs) => {
      setLogs(newLogs);
    });
    return unsubscribe;
  }, [isOpen]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleToggleMode = () => {
    const nextState = !isOfflineActive;
    setIsOfflineActive(nextState);
    setMarianMTModeActive(nextState);
  };

  const handleRunPlayground = async () => {
    if (!playgroundText.trim()) return;
    setIsTranslating(true);
    setPlaygroundResult('');
    
    try {
      const { runMarianInference } = await import('../utils/marianMT');
      const result = await runMarianInference(playgroundText, playgroundTarget);
      setPlaygroundResult(result);
    } catch (err) {
      setPlaygroundResult('Translation pipeline error.');
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[90vh] max-h-[800px] text-slate-100"
      >
        {/* Glow Decors */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                MarianMT Neural Sandbox
                <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Helsinki-NLP Core
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Local Translation & Model Compilation Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Inner Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          
          {/* Left Panel: Logs & Model Specs */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Mode Controls */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOfflineActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isOfflineActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider">
                    {isOfflineActive ? 'MarianMT Offline Mode: ACTIVE' : 'MarianMT Offline Mode: DISABLED'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {isOfflineActive ? 'All text translations computed browser-side' : 'Falling back to dynamic cloud APIs'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleMode}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                  isOfflineActive 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10' 
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                {isOfflineActive ? 'Toggle Hybrid Cloud' : 'Enable Offline Engine'}
              </button>
            </div>

            {/* Neural Log Terminal */}
            <div className="flex-1 min-h-[220px] bg-slate-950 border border-slate-855 rounded-3xl p-4 flex flex-col overflow-hidden font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3 shrink-0">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider font-sans">Neural Inference Output Stream</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLogs([])}
                    title="Clear Terminal Logs"
                    className="p-1 rounded hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[11px] leading-relaxed select-text scrollbar-none">
                {logs.length === 0 ? (
                  <div className="text-slate-600 italic h-full flex items-center justify-center font-sans uppercase text-[10px] tracking-widest">
                    No active neural inferences recorded in session buffer.
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={`marianconsole-l190-index-${index}`} className="flex items-start gap-2 border-l border-slate-900 pl-2">
                      <span className="text-slate-600 shrink-0 select-none text-[9px] mt-0.5">[{log.timestamp}]</span>
                      <span className={`shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded leading-none ${
                        log.type === 'success' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-950' :
                        log.type === 'error' ? 'bg-red-950/40 text-red-400 border border-red-950' :
                        log.type === 'neural' ? 'bg-blue-950/40 text-blue-400 border border-blue-950' :
                        log.type === 'warn' ? 'bg-amber-950/40 text-amber-400 border border-amber-950' :
                        'bg-slate-900 text-slate-400'
                      }`}>
                        {log.type}
                      </span>
                      <span className={
                        log.type === 'success' ? 'text-emerald-300 font-semibold' :
                        log.type === 'error' ? 'text-red-300 font-semibold' :
                        log.type === 'neural' ? 'text-blue-200' :
                        log.type === 'warn' ? 'text-amber-300' :
                        'text-slate-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

          {/* Right Panel: Model Spec, Provider, Playground */}
          <div className="w-full md:w-[320px] flex flex-col gap-6 shrink-0">
            {/* Specs & Hardware */}
            <div className="bg-slate-950/30 border border-slate-800 rounded-3xl p-5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-between">
                <span>Model Calibration</span>
                <Globe size={12} className="text-blue-400" />
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Pipeline</span>
                  <span className="font-mono text-[10px] font-bold text-blue-400">Helsinki-NLP/opus-mt</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Layers</span>
                  <span className="font-mono text-xs font-bold text-slate-200">12 (6 enc / 6 dec)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Params Size</span>
                  <span className="font-mono text-xs font-bold text-slate-200">~74.4M fp16 weights</span>
                </div>

                {/* Provider select */}
                <div className="pt-3 border-t border-slate-855 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Hardware Acceleration</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['WebGPU', 'WebAssembly', 'WebGL'] as const).map((prov, mapIdx_244) => (
                      <button
                        key={`marianconsole-l247-${mapIdx_244}`}
                        onClick={() => {
                          setBackend(prov);
                          addMarianLog('info', `HARDWARE: Target computation backend changed to ${prov}. Re-binding shader matrices...`);
                        }}
                        className={`py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                          backend === prov
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800/60'
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Neural Playground */}
            <div className="bg-slate-950/30 border border-slate-800 rounded-3xl p-5 flex-1 flex flex-col">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Play size={10} className="text-emerald-400" />
                <span>Sandbox Inference Unit</span>
              </h3>

              <div className="flex-1 flex flex-col gap-3 min-h-0">
                {/* Target language */}
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-1">Target Language</label>
                  <select
                    value={playgroundTarget}
                    onChange={(e) => setPlaygroundTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500 uppercase"
                  >
                    {Object.keys(MarianMTRegistry).map((lang, mapIdx_281) => (
                      <option key={`marianconsole-l283-${mapIdx_281}`} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                {/* Text Input */}
                <div className="flex-1 flex flex-col min-h-[90px]">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-1">Source Text (English)</label>
                  <textarea
                    value={playgroundText}
                    onChange={(e) => setPlaygroundText(e.target.value)}
                    className="w-full flex-1 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500 resize-none font-sans"
                    placeholder="Enter text to translate..."
                  />
                </div>

                {/* Result output */}
                {playgroundResult && (
                  <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <div className="text-[8px] font-black uppercase tracking-widest text-blue-400">Translated Result</div>
                    <div className="text-xs font-bold text-slate-100 mt-1">{playgroundResult}</div>
                  </div>
                )}

                <button
                  onClick={handleRunPlayground}
                  disabled={isTranslating}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-blue-500/15"
                >
                  {isTranslating ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      Inference running...
                    </>
                  ) : (
                    <>
                      <Play size={12} />
                      Run Neural Translation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
