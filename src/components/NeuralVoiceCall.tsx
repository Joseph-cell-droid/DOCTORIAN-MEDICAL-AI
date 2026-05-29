import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  X, Loader2, Sparkles, Activity, Shield, Waves, Brain, 
  Zap, Maximize2, Minimize2, Settings2, Info, Phone
} from 'lucide-react';
import { api } from '../api';
import { useGeminiLive } from '../hooks/useGeminiLive';

interface NeuralVoiceCallProps {
  onClose: () => void;
  user: any;
  vitals?: any;
  healthStatus?: any;
  onRefreshUser?: () => void;
}

export function NeuralVoiceCall({ onClose, user, vitals, healthStatus, onRefreshUser }: NeuralVoiceCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [transcripts, setTranscripts] = useState<{ text: string; isModel: boolean; id: string }[]>([]);

  const safetyShort = localStorage.getItem('doctorian_voice_safety_short') !== 'false';
  const safetyNoDiag = localStorage.getItem('doctorian_voice_safety_nodiag') !== 'false';
  const safetyNoOutcome = localStorage.getItem('doctorian_voice_safety_nooutcome') !== 'false';
  const safetyEncourage = localStorage.getItem('doctorian_voice_safety_encourage') !== 'false';

  const biometricContext = vitals ? `[VISUAL CONTEXT: Patient HR ${vitals.heartRate}, SpO2 ${vitals.spo2}. Overall Stability: ${healthStatus?.overall || 'Stable'}]` : '';

  const systemInstruction = useMemo(() => {
    let rules = `You are Doctorian (v2.4), a Universal Medical Intelligence Core. 
    You are engaging in a real-time voice consultation with ${user?.displayName || 'Authorized User'}.
    
    CORE DIRECTIVE:
    - You are warm, empathetic, and professional.
    - MULTI-LINGUAL: You fluently understand and speak English, Luganda, Swahili, Acholi, Runyankole, Ateso, Lusoga, Lugbara, Karamojong, Rutooro, and more.
    - ACCESSIBILITY: Support non-literate users by using extremely simple language, clear instructions, and local Ugandan health worker personas. Avoid jargon.
    - Focus on active listening.
    
    CLINICAL CONTEXT:
    ${biometricContext}
    
    INTERACTION RULES:`;

    if (safetyShort) {
      rules += `\n    - Keep responses extremely short (under 25 words total, single-sentence response where possible) for high-frequency voice streaming rate.`;
    } else {
      rules += `\n    - Keep responses short (around 20-30 words) for voice flow.`;
    }

    if (safetyNoDiag) {
      rules += `\n    - NEVER diagnose conditions or label symptoms explicitly. Avoid medical classification labels. Instead, observe raw metrics.`;
    }

    if (safetyNoOutcome) {
      rules += `\n    - NEVER predict, guarantee, or state clinical outcomes (e.g. do NOT say 'you will be fine' or make alarming outcome guesses).`;
    }

    if (safetyEncourage) {
      rules += `\n    - ALWAYS encourage getting real offline clinical support and end with a standard directive like 'Medical attention is recommended.'`;
    }

    rules += `\n    - Detect the user's language and match it instantly.\n    - If the user sounds confused, use a village health worker tone with natural analogies.`;

    return rules;
  }, [user?.displayName, biometricContext, safetyShort, safetyNoDiag, safetyNoOutcome, safetyEncourage]);

  const { status, error, connect, stop, sendMessage, inputVolume, outputVolume } = useGeminiLive({
    voiceName: 'Puck',
    isMuted,
    systemInstruction,
    onTranscript: (text, isModel) => {
      setTranscripts(prev => {
        const last = prev[prev.length - 1];
        if (last && last.isModel === isModel) {
          return [...prev.slice(0, -1), { ...last, text: last.text + ' ' + text }];
        }
        return [...prev, { text, isModel, id: Math.random().toString(36).substr(2, 9) }].slice(-3); // Keep last 3 lines
      });
    },
    onStatusChange: (s) => {
      if (s === 'connected') setIsSyncing(false);
    }
  });

  useEffect(() => {
    let interval: any;
    if (status === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    setIsSyncing(true);
    try {
      await api.ai.startVoiceCall();
      if (onRefreshUser) onRefreshUser();
      connect();
    } catch (err: any) {
      console.error(err);
      setIsSyncing(false);
    }
  };

  const endCall = () => {
    stop();
    setTimeout(onClose, 300);
  };

  // Pulse animation for the central node
  const nodeScale = useMemo(() => {
    // Normalize both volumes to a similar visual impact
    const normalizedOutput = outputVolume * 1.2;
    const normalizedInput = inputVolume * 2.0; 
    const vol = status === 'connected' ? (outputVolume > 1 ? normalizedOutput : normalizedInput) : 0;
    return 1 + (Math.min(vol, 100) / 120);
  }, [status, outputVolume, inputVolume]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[110] flex items-center justify-center bg-slate-950 transition-all duration-700 ${isFullScreen ? 'p-0' : 'p-4 sm:p-8'}`}
    >
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            scale: [1, 1 + (outputVolume / 100), 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
            backgroundColor: outputVolume > 10 ? ["rgba(37, 99, 235, 0.1)", "rgba(16, 185, 129, 0.15)", "rgba(37, 99, 235, 0.1)"] : "rgba(37, 99, 235, 0.1)"
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{
            scale: [1, 1 + (inputVolume / 100), 1],
            x: [0, -40, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-emerald-600/10 blur-[130px] rounded-full"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
      </div>

      <motion.div 
        layout
        className={`relative w-full max-w-5xl h-full flex flex-col bg-slate-900/40 backdrop-blur-3xl border border-white/5 shadow-3xl overflow-hidden transition-all duration-500 ${isFullScreen ? 'rounded-0' : 'rounded-[3rem] sm:rounded-[4rem]'}`}
      >
        {/* Header */}
        <div className="p-6 sm:p-10 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 ring-1 ring-white/20">
              <Phone size={24} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-white uppercase tracking-tighter leading-none mb-1">Link Doctors Live</h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {status === 'connected' ? 'Secure Voice Channel' : status === 'connecting' ? 'Establishing Connection' : 'System Ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl transition-all"
            >
              {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button 
              onClick={endCall}
              className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Central Interaction Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <AnimatePresence mode="wait">
            {status === 'idle' ? (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center gap-12"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full border-2 border-white/5 flex items-center justify-center relative">
                    <div className="absolute inset-4 rounded-full border border-blue-500/20 animate-spin-slow" />
                    <Sparkles className="text-blue-500" size={48} />
                  </div>
                </div>
                
                <div className="text-center max-w-sm">
                  <h2 className="text-3xl sm:text-5xl font-[1000] text-white uppercase tracking-tighter mb-4">Voice <span className="text-emerald-500">Consult</span></h2>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed mb-8">
                    Connect with our AI medical assistant for an instant assessment. Supports English, Luganda, Swahili, Acholi, and more.
                  </p>
                  <button 
                    onClick={startCall}
                    disabled={isSyncing}
                    className="group relative px-8 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-2xl shadow-emerald-500/30 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isSyncing ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={18} /> Connecting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        Start Secure Voice Call <Phone size={18} fill="currentColor" />
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center gap-10"
              >
                {/* Transcripts Overlay */}
                <div className="absolute inset-x-0 bottom-[140px] px-8 flex flex-col items-center gap-2 pointer-events-none">
                  {transcripts.map(t => (
                    <motion.div 
                      key={t.id}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-md border border-white/5 ${t.isModel ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-300'}`}
                    >
                      {t.text}
                    </motion.div>
                  ))}
                </div>
                {/* Voice Visualizer */}
                <div className="relative flex items-center justify-center w-full max-w-lg">
                  {/* Outer Rings */}
                  <motion.div 
                    animate={{ 
                      scale: nodeScale,
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 0.1 }}
                    className="absolute w-[150%] h-[150%] bg-blue-500/5 rounded-full blur-2xl"
                  />
                  <div className="absolute w-[110%] h-[110%] rounded-full border border-white/5 border-dashed animate-spin-slow opacity-20" />
                  
                  {/* Main Node */}
                  <motion.div 
                    animate={{ 
                      scale: nodeScale,
                      boxShadow: status === 'connected' ? `0 0 ${40 + outputVolume * 2}px rgba(16, 185, 129, 0.4)` : '0 0 0px transparent'
                    }}
                    transition={{ type: 'spring', damping: 10, stiffness: 200, mass: 0.5 }}
                    className={`w-40 h-40 sm:w-64 sm:h-64 rounded-full border-4 border-white/10 flex items-center justify-center relative z-10 overflow-hidden transition-colors ${outputVolume > 5 ? 'bg-emerald-600/20' : 'bg-slate-800/40'}`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent)]" />
                    
                    {/* Interior Pulse */}
                    <AnimatePresence>
                      {(outputVolume > 5 || inputVolume > 5) && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5"
                        >
                          {[...Array(8)].map((_, i) => (
                            <motion.div 
                              key={i}
                              animate={{ 
                                height: [12, Math.max(12, (outputVolume > 0 ? outputVolume : inputVolume) * (0.8 + Math.random() * 0.5)), 12]
                              }}
                              transition={{ duration: 0.1, repeat: Infinity }}
                              className={`w-1 sm:w-2 rounded-full ${outputVolume > 0 ? 'bg-emerald-400' : 'bg-emerald-500'}`}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {status === 'connecting' && (
                      <Loader2 className="text-emerald-500 animate-spin" size={48} />
                    )}
                    
                    {(status === 'connected' && outputVolume <= 5 && inputVolume <= 5) && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Phone className="text-emerald-500" size={48} />
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tighter tabular-nums">
                      {formatTime(callDuration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 shadow-lg shadow-emerald-500/5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-1.5 h-3 rounded-full ${i <= 3 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Secure Emerald Channel</span>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-3 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest"
                  >
                    {error}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="p-8 sm:p-12 sm:pb-16 flex items-center justify-center gap-6 sm:gap-10 z-20">
          <AnimatePresence>
            {status !== 'idle' && (
              <>
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-5 sm:p-7 rounded-[2rem] transition-all flex items-center justify-center ${isMuted ? 'bg-rose-500 text-white shadow-2xl shadow-rose-500/30 ring-4 ring-rose-500/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 ring-1 ring-white/10'}`}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </motion.button>
                
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={endCall}
                  className="p-7 sm:p-10 bg-rose-600 hover:bg-rose-800 text-white rounded-[2.5rem] sm:rounded-[3rem] shadow-3xl shadow-rose-600/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center ring-4 ring-rose-600/20"
                >
                  <PhoneOff size={32} />
                </motion.button>

                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setIsSpeakerOff(!isSpeakerOff)}
                  className={`p-5 sm:p-7 rounded-[2rem] transition-all flex items-center justify-center ${isSpeakerOff ? 'bg-slate-800 text-slate-500 ring-1 ring-white/10' : 'bg-slate-800 text-slate-400 hover:text-white ring-1 ring-white/10'}`}
                >
                  {isSpeakerOff ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Side Info Overlay */}
        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 pointer-events-none opacity-40">
          <div className="text-right">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Platform Neural Core</span>
            <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-tighter">Unified Intelligence Interface</span>
          </div>
        </div>

        {/* Vitals Sidebar (Mobile/Desktop conditional) */}
        {status === 'connected' && vitals && (
          <div className="absolute top-1/2 -translate-y-1/2 left-8 hidden lg:flex flex-col gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md">
            <div className="flex flex-col items-center">
              <Activity className="text-rose-500 mb-2" size={20} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vitals.heartRate}</span>
              <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">BPM</span>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="text-blue-400 mb-2" size={20} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vitals.spo2}%</span>
              <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">SpO2</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
