import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Video, VideoOff, X, Settings, ChevronDown, 
  Sparkles, ShieldCheck, Activity, Volume2, Radio, Play, Square 
} from 'lucide-react';

interface DoctorianVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToVideo?: () => void;
}

export const DoctorianVoiceCallModal: React.FC<DoctorianVoiceCallModalProps> = ({ 
  isOpen, 
  onClose,
  onSwitchToVideo 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [transcript, setTranscript] = useState("Doctorian AI is listening to your health telemetry & voice...");
  const [audioLevel, setAudioLevel] = useState([40, 65, 80, 50, 90, 70, 45]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setAudioLevel([
        Math.floor(Math.random() * 60) + 30,
        Math.floor(Math.random() * 80) + 20,
        Math.floor(Math.random() * 95) + 40,
        Math.floor(Math.random() * 70) + 30,
        Math.floor(Math.random() * 90) + 50,
        Math.floor(Math.random() * 75) + 30,
        Math.floor(Math.random() * 60) + 20,
      ]);
    }, 150);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-slate-900 text-white rounded-[3rem] border border-slate-800 shadow-[0_25px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
        style={{ aspectRatio: '9/19', maxHeight: '850px' }}
      >
        {/* Phone Top Status Bar */}
        <div className="px-8 pt-4 pb-2 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <span>9:41</span>
          <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto flex items-center justify-center gap-1.5 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-blue-400">Doctorian AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio size={12} className="text-blue-500 animate-pulse" />
            <span className="text-[10px]">5G</span>
          </div>
        </div>

        {/* Top Header */}
        <div className="px-6 py-3 flex items-center justify-between shrink-0 border-b border-slate-800/60">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-full border border-slate-700/50">
            <span className="text-xs font-black tracking-tight text-slate-200">Doctorian Core AI</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Main Central Voice Orb Waveform Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Ambient Glow Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/30 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-8 text-center max-w-xs">
            {/* Glowing Sphere & Waveform */}
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 border border-blue-500/30 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.3)]">
              <div className="absolute inset-2 rounded-full border border-blue-400/20 animate-spin" style={{ animationDuration: '15s' }} />
              
              <div className="flex items-center gap-1.5 h-16 px-4">
                {audioLevel.map((lvl, i) => (
                  <motion.div
                    key={`voice-bar-${i}`}
                    animate={{ height: isMuted ? 4 : `${lvl}%` }}
                    transition={{ duration: 0.1 }}
                    className="w-2 bg-gradient-to-t from-blue-500 via-indigo-400 to-cyan-300 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-[1000] tracking-tight uppercase text-white">
                {isMuted ? "Microphone Muted" : "Doctorian Listening..."}
              </h2>
              <p className="text-xs font-medium text-slate-400 px-4 leading-relaxed">
                {transcript}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Call Controls & Doctorian Copyright Footer */}
        <div className="p-6 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 shrink-0 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                if (onSwitchToVideo) {
                  onClose();
                  onSwitchToVideo();
                }
              }}
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer shadow-md"
              title="Switch to Video Consultation"
            >
              <Video size={20} />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-2xl transition-all cursor-pointer shadow-md ${
                isMuted 
                  ? 'bg-rose-600 text-white shadow-rose-600/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={onClose}
              className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-lg shadow-red-600/40"
              title="End Voice Call"
            >
              <X size={20} className="stroke-[3]" />
            </button>
          </div>

          <div className="pt-2 text-center border-t border-slate-900">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              © Doctorian AI Health Systems. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
