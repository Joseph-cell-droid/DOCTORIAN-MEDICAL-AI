import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Share2, 
  MessageCircle, 
  MoreHorizontal, 
  PhoneOff, 
  X, 
  Sparkles, 
  Heart, 
  Thermometer, 
  Droplet, 
  Wind, 
  Activity, 
  Pill, 
  Clock, 
  ChevronRight, 
  Volume2, 
  Maximize, 
  Wifi, 
  Settings, 
  Check, 
  CheckCircle2,
  FileText,
  User
} from 'lucide-react';

interface DoctorianVideoConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToVoice?: () => void;
}

export const DoctorianVideoConsultationModal: React.FC<DoctorianVideoConsultationModalProps> = ({ 
  isOpen, 
  onClose,
  onSwitchToVoice 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoStopped, setIsVideoStopped] = useState(false);
  const [voiceOnly, setVoiceOnly] = useState(false);
  const [videoMode, setVideoMode] = useState(true);
  const [liveTranslation, setLiveTranslation] = useState(true);
  const [callDuration, setCallDuration] = useState(317); // 05:17
  const [activeSpeech, setActiveSpeech] = useState(
    "Hello! Here is your health summary. Your blood pressure is 118/76 mmHg, temperature is 36.6°C, and SpO2 is 98%. Would you like me to show your prescription or set a medication reminder?"
  );
  const [promptReply, setPromptReply] = useState("I'm here to help you. What would you like to do next?");
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCallDuration(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAction = (action: string) => {
    if (action === 'prescription') {
      setActiveSpeech("Opening Sarah Nakato's digital prescription: Amoxicillin 500mg, 1 capsule every 8 hours with meals for 7 days.");
      setPromptReply("Prescription verified. Dose scheduled for 8:00 PM.");
    } else if (action === 'reminder') {
      setReminderSet(true);
      setActiveSpeech("Medication alarm scheduled for 8:00 PM. Mobile notification relay armed.");
      setPromptReply("Dose reminder set successfully.");
    } else if (action === 'history') {
      setActiveSpeech("Retrieving longitudinal clinical history: 12 clinic visits recorded, zero adverse drug interactions found.");
      setPromptReply("Medical timeline displayed.");
    } else {
      setActiveSpeech("Please ask any medical inquiry. Doctorian clinical core is continuously streaming.");
      setPromptReply("Listening to your audio question...");
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-6xl rounded-3xl bg-[#040d21] border border-blue-500/40 text-white shadow-2xl overflow-hidden flex flex-col justify-between my-auto max-h-[95vh]"
        style={{ minHeight: '620px' }}
      >
        
        {/* ===================================================================== */}
        {/* TOP STATUS BAR (Matching image_0fcaf554.png)                          */}
        {/* ===================================================================== */}
        <div className="px-6 py-3.5 bg-[#05112b]/80 border-b border-blue-900/60 flex items-center justify-between z-20">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Heart size={20} className="fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">Doctorian AI</h3>
              <p className="text-[10px] text-cyan-300 font-medium">Smart Healthcare, Better You</p>
            </div>
          </div>

          {/* Center Call Status Pill */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#07193f] border border-blue-500/40 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white">Live Call | {formatTimer(callDuration)}</span>
            <span className="text-cyan-400 font-mono text-xs">·</span>
            {/* Audio Waveform icon */}
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
              <span className="w-0.5 h-3 bg-cyan-300 animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse delay-150" />
            </div>
            <span className="text-[11px] text-slate-300 font-semibold hidden sm:inline">AI Assistant - Voice & Video</span>
          </div>

          {/* Right Quality & Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#091b3f] text-cyan-300 text-xs font-bold border border-blue-800">
              <span>1080p HD</span>
            </div>
            <div className="flex items-center gap-0.5 text-emerald-400">
              <span className="w-1 h-2 bg-emerald-400 rounded-sm" />
              <span className="w-1 h-3 bg-emerald-400 rounded-sm" />
              <span className="w-1 h-4 bg-emerald-400 rounded-sm" />
            </div>
            <button 
              type="button" 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

        </div>

        {/* ===================================================================== */}
        {/* CENTER MAIN INTERFACE (Hologram + Robot Bubble + Cards Overlay)       */}
        {/* ===================================================================== */}
        <div className="relative flex-1 p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Background Ambient Glow & Hologram Pedestal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Glowing circular pedestal */}
            <div className="absolute bottom-16 w-80 h-32 rounded-full bg-gradient-to-t from-cyan-500/25 to-blue-600/10 blur-xl" />
            <div className="absolute bottom-20 w-72 h-16 rounded-full border-2 border-cyan-400/50 [transform:rotateX(60deg)] animate-pulse" />
            
            {/* 3D Glowing Anatomy Body SVG */}
            <div className="relative z-10 w-48 h-80 flex items-center justify-center opacity-90 drop-shadow-[0_0_25px_rgba(0,229,255,0.7)]">
              <svg className="w-full h-full" viewBox="0 0 100 200" fill="none">
                {/* Silhouette & Nervous System */}
                <ellipse cx="50" cy="22" rx="14" ry="16" stroke="#00e5ff" strokeWidth="1.8" />
                <path d="M47,38 L47,46 M53,38 L53,46" stroke="#00e5ff" strokeWidth="1.8" />
                <path d="M30,48 L70,48 L64,120 L36,120 Z" stroke="#00e5ff" strokeWidth="1.8" />
                <path d="M30,48 L14,90 L8,135 M70,48 L86,90 L92,135" stroke="#00e5ff" strokeWidth="1.8" />
                <path d="M40,120 L36,165 L32,198 M60,120 L64,165 L68,198" stroke="#00e5ff" strokeWidth="1.8" />
                {/* Neural grid lines */}
                <line x1="50" y1="48" x2="50" y2="120" stroke="#00e5ff" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="36" y1="75" x2="64" y2="75" stroke="#00e5ff" strokeWidth="1" strokeDasharray="2 2" />
                {/* Glowing Beating Heart */}
                <circle cx="53" cy="65" r="7" fill="#ff2d55" className="animate-ping" opacity="0.8" />
                <circle cx="53" cy="65" r="5" fill="#ff2d55" className="animate-pulse" />
              </svg>
            </div>
          </div>

          {/* Upper Row: Left Robot Bubble + Center Vitals + Right Info Cards */}
          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Left Column: Doctorian AI Robot & Speech Bubble (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-start gap-3">
                {/* Robot Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-xl flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-full bg-[#030e24] flex items-center justify-center text-2xl">
                    🤖
                  </div>
                </div>

                {/* Speech Bubble */}
                <div className="p-4 rounded-3xl bg-[#07193f]/90 border border-blue-500/40 backdrop-blur-md shadow-xl text-xs space-y-2 relative">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Heart size={14} className="fill-rose-500 text-rose-500" />
                    <span>Doctorian AI Assistant</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-600 text-[9px] text-white font-mono">AI</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {activeSpeech}
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Your Health Oversight Card (4 Cols) */}
            <div className="lg:col-span-4 p-4 rounded-3xl bg-[#07183c]/85 border border-cyan-500/40 backdrop-blur-md shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-blue-900/60">
                <Heart size={16} className="text-cyan-400 fill-cyan-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Your Health Oversight</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-2xl bg-[#040e24]/80 border border-blue-900/40 flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
                    <Heart size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white font-mono">72 bpm</span>
                    <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                  </div>
                </div>

                <div className="p-2 rounded-2xl bg-[#040e24]/80 border border-blue-900/40 flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Wind size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white font-mono">98%</span>
                    <span className="text-[10px] text-slate-400 block">SpO2</span>
                  </div>
                </div>

                <div className="p-2 rounded-2xl bg-[#040e24]/80 border border-blue-900/40 flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <Thermometer size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white font-mono">36.6°C</span>
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                  </div>
                </div>

                <div className="p-2 rounded-2xl bg-[#040e24]/80 border border-blue-900/40 flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400">
                    <Activity size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white font-mono">118/76</span>
                    <span className="text-[10px] text-slate-400 block">BP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Patient Information & Medication Reminder (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              
              {/* Patient Information */}
              <div className="p-3.5 rounded-3xl bg-[#07193f]/90 border border-blue-500/40 backdrop-blur-md shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-blue-900/60">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <User size={14} className="text-cyan-400" />
                    <span>Patient Information</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                    Active
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">
                    JD
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">John Doe</p>
                    <p className="text-[10px] text-slate-400">PID: PT-00124 • Age: 45 • Male</p>
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => handleAction('history')}
                    className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1 ml-auto"
                  >
                    <span>View Profile</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* Medication Reminder */}
              <div className="p-3.5 rounded-3xl bg-[#07193f]/90 border border-blue-500/40 backdrop-blur-md shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-blue-900/60">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Pill size={14} className="text-amber-400" />
                    <span>Medication Reminder</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 font-mono">62%</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Pill size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">Take your Amoxicillin 500mg at 8:00 PM</p>
                    {/* Progress bar */}
                    <div className="w-full bg-[#051126] h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> Next dose in: 1h 55m
                  </span>
                  {reminderSet && <span className="text-emerald-400 font-bold">✓ Armed</span>}
                </div>
              </div>

            </div>

          </div>

          {/* Lower Row: AI Actions (Left) + Bottom Speech Prompt (Center) + Call Features (Right) */}
          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end mt-4">
            
            {/* AI Actions (4 Cols) */}
            <div className="lg:col-span-4 p-3.5 rounded-3xl bg-[#07193f]/90 border border-blue-500/40 backdrop-blur-md shadow-xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold pb-1 border-b border-blue-900/60">
                <Sparkles size={14} />
                <span>AI Actions</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAction('prescription')}
                  className="p-2 rounded-xl bg-[#040e24] hover:bg-blue-600/40 border border-blue-800 text-[10px] font-bold text-left flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText size={12} className="text-cyan-400 shrink-0" />
                  <span className="truncate">Show Prescription</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('reminder')}
                  className="p-2 rounded-xl bg-[#040e24] hover:bg-blue-600/40 border border-blue-800 text-[10px] font-bold text-left flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock size={12} className="text-amber-400 shrink-0" />
                  <span className="truncate">Set Reminder</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('history')}
                  className="p-2 rounded-xl bg-[#040e24] hover:bg-blue-600/40 border border-blue-800 text-[10px] font-bold text-left flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Activity size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">View Medical History</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('question')}
                  className="p-2 rounded-xl bg-[#040e24] hover:bg-blue-600/40 border border-blue-800 text-[10px] font-bold text-left flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle size={12} className="text-purple-400 shrink-0" />
                  <span className="truncate">Ask Question</span>
                </button>
              </div>
            </div>

            {/* Center Prompt Strip (4 Cols) */}
            <div className="lg:col-span-4 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#07193f]/90 border border-blue-500/50 backdrop-blur-md shadow-xl text-xs text-white">
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-2.5 bg-cyan-400 animate-pulse" />
                  <span className="w-0.5 h-4 bg-cyan-300 animate-pulse delay-75" />
                  <span className="w-0.5 h-2 bg-cyan-400 animate-pulse delay-150" />
                </div>
                <span>{promptReply}</span>
              </div>
            </div>

            {/* Right: Call Features Toggles (4 Cols) */}
            <div className="lg:col-span-4 p-3.5 rounded-3xl bg-[#07193f]/90 border border-blue-500/40 backdrop-blur-md shadow-xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold pb-1 border-b border-blue-900/60">
                <Settings size={14} />
                <span>Call Features</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">Voice Only</span>
                  <button
                    type="button"
                    onClick={() => setVoiceOnly(!voiceOnly)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${voiceOnly ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${voiceOnly ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">Video Mode</span>
                  <button
                    type="button"
                    onClick={() => setVideoMode(!videoMode)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${videoMode ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${videoMode ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">Live Translation</span>
                  <button
                    type="button"
                    onClick={() => setLiveTranslation(!liveTranslation)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${liveTranslation ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${liveTranslation ? 'translate-x-4' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ===================================================================== */}
        {/* BOTTOM CALL CONTROLS DOCK (Matching image_0fcaf554.png)                */}
        {/* ===================================================================== */}
        <div className="px-6 py-4 bg-[#05112b]/95 border-t border-blue-900/60 flex items-center justify-center gap-6 z-20">
          
          {/* Mute */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${isMuted ? 'text-rose-400' : 'text-slate-300 hover:text-white'}`}
          >
            <div className={`p-3 rounded-full ${isMuted ? 'bg-rose-600' : 'bg-slate-800 hover:bg-slate-700'} text-white shadow-md`}>
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </div>
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Stop Video */}
          <button
            type="button"
            onClick={() => setIsVideoStopped(!isVideoStopped)}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${isVideoStopped ? 'text-rose-400' : 'text-slate-300 hover:text-white'}`}
          >
            <div className={`p-3 rounded-full ${isVideoStopped ? 'bg-rose-600' : 'bg-slate-800 hover:bg-slate-700'} text-white shadow-md`}>
              {isVideoStopped ? <VideoOff size={18} /> : <Video size={18} />}
            </div>
            <span>{isVideoStopped ? 'Start Video' : 'Stop Video'}</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => {
              setActiveSpeech('Screen sharing preview enabled for active consultation.');
              setPromptReply('Screen sharing active.');
            }}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white"
          >
            <div className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-md">
              <Share2 size={18} />
            </div>
            <span>Share</span>
          </button>

          {/* Chat with notification badge 3 */}
          <button
            type="button"
            onClick={() => {
              setActiveSpeech('Clinical consultation chat channel ready.');
              setPromptReply('3 clinical chat notes available.');
            }}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white relative"
          >
            <div className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-md relative">
              <MessageCircle size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                3
              </span>
            </div>
            <span>Chat</span>
          </button>

          {/* More */}
          <button
            type="button"
            onClick={() => {
              setActiveSpeech('Consultation options: recording, live translation, and clinical summary export.');
              setPromptReply('Options panel active.');
            }}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white"
          >
            <div className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-md">
              <MoreHorizontal size={18} />
            </div>
            <span>More</span>
          </button>

          {/* End Call (Red Button) */}
          <button
            type="button"
            onClick={onClose}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-rose-400"
          >
            <div className="p-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40">
              <PhoneOff size={20} />
            </div>
            <span className="text-white font-black">End Call</span>
          </button>

        </div>

      </motion.div>
    </div>
  );
};

export default DoctorianVideoConsultationModal;
