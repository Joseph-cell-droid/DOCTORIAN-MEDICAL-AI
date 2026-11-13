import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Video, 
  X, 
  Settings, 
  Globe, 
  Sparkles, 
  Check, 
  Clock, 
  Play, 
  Pause, 
  RotateCw, 
  Heart, 
  ChevronDown, 
  Calendar, 
  ShieldAlert, 
  Bot, 
  User, 
  Users, 
  PhoneCall 
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
  const [activeCallOption, setActiveCallOption] = useState<'ai' | 'doctor' | 'family' | 'emergency'>('ai');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(157); // 00:02:37
  const [isCallActive, setIsCallActive] = useState(true);

  // Language & Voice
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedVoice, setSelectedVoice] = useState('Natural Voice');

  // Features Toggles
  const [autoTranscript, setAutoTranscript] = useState(true);
  const [realtimeTranslation, setRealtimeTranslation] = useState(true);
  const [smartHealthTips, setSmartHealthTips] = useState(true);
  const [saveCallRecord, setSaveCallRecord] = useState(true);

  // Animated Audio Wave Frequency Levels
  const [audioWaves, setAudioWaves] = useState([20, 45, 75, 95, 60, 80, 40, 65, 90, 50, 70, 35]);

  useEffect(() => {
    if (!isOpen || !isCallActive) return;
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
      setAudioWaves([
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 70) + 20,
        Math.floor(Math.random() * 90) + 20,
        Math.floor(Math.random() * 95) + 30,
        Math.floor(Math.random() * 75) + 25,
        Math.floor(Math.random() * 85) + 20,
        Math.floor(Math.random() * 60) + 20,
        Math.floor(Math.random() * 75) + 25,
        Math.floor(Math.random() * 95) + 30,
        Math.floor(Math.random() * 70) + 20,
        Math.floor(Math.random() * 80) + 20,
        Math.floor(Math.random() * 45) + 15,
      ]);
    }, 150);
    return () => clearInterval(timer);
  }, [isOpen, isCallActive]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-6xl rounded-3xl bg-[#06142e] border border-blue-500/40 text-white shadow-2xl overflow-hidden flex flex-col justify-between my-auto max-h-[95vh]"
        style={{ minHeight: '620px' }}
      >
        
        {/* ===================================================================== */}
        {/* TOP BANNER (Matching image_39a5defe.png)                               */}
        {/* ===================================================================== */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 flex items-center justify-between border-b border-blue-400/30 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-inner">
              <PhoneCall size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Voice Call</h2>
              <p className="text-xs text-blue-100 font-medium">
                Make voice calls, get medical advice, and communicate in any language.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm font-serif italic font-extrabold text-cyan-200">
              Speak · Get Help · Stay Healthy
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Powered by Doctorian AI
            </span>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ===================================================================== */}
        {/* 3-COLUMN MAIN BODY (Matching image_39a5defe.png)                       */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 flex-1 overflow-y-auto">
          
          {/* ------------------------------------------------------------------- */}
          {/* LEFT COLUMN: Call Options & AI Assistant Card (4 Cols)             */}
          {/* ------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Call Options Selector */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={14} className="text-blue-400" />
                <span>Call Options</span>
              </h4>

              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCallOption('ai')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                    activeCallOption === 'ai'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-[#051024] hover:bg-blue-950 text-slate-300 border border-blue-900/40'
                  }`}
                >
                  <Bot size={16} />
                  <span className="truncate">AI Assistant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCallOption('doctor')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                    activeCallOption === 'doctor'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-[#051024] hover:bg-blue-950 text-slate-300 border border-blue-900/40'
                  }`}
                >
                  <User size={16} />
                  <span className="truncate">Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCallOption('family')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                    activeCallOption === 'family'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-[#051024] hover:bg-blue-950 text-slate-300 border border-blue-900/40'
                  }`}
                >
                  <Users size={16} />
                  <span className="truncate">Family</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCallOption('emergency')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                    activeCallOption === 'emergency'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-[#051024] hover:bg-red-950 text-rose-300 border border-red-900/40'
                  }`}
                >
                  <ShieldAlert size={16} />
                  <span className="truncate">Emergency</span>
                </button>
              </div>
            </div>

            {/* Doctorian AI Assistant Card */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-[#040e24] flex items-center justify-center text-xl">
                    🤖
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">Doctorian AI Assistant</h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">Online</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Your personal health assistant. Ask questions, get advice, or request a call with a doctor.
              </p>

              <div className="space-y-1.5 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Voice & Video Call
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Multilingual Support
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Medical Guidance
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCallActive(true);
                  setCallDuration(0);
                }}
                className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Phone size={14} />
                <span>Start Voice Call →</span>
              </button>
            </div>

            {/* Quick Actions Pills */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-2.5">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                <span>Quick Actions</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => alert('Listening for medical query...')}
                  className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 text-center"
                >
                  💬 Ask a Question (Voice)
                </button>

                <button
                  type="button"
                  onClick={() => alert('Opening Doctor call booking...')}
                  className="p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 text-center"
                >
                  📅 Book a Call with Doctor
                </button>

                <button
                  type="button"
                  onClick={() => alert('Dispensing clinical health advice...')}
                  className="p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 text-center"
                >
                  💊 Get Health Tips (Voice)
                </button>

                <button
                  type="button"
                  onClick={() => alert('Translating live conversation...')}
                  className="p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/40 text-center"
                >
                  🌐 Translate Conversation
                </button>
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------------------- */}
          {/* CENTER COLUMN: In Call Display with Pulsing Aura & Wave (4 Cols)   */}
          {/* ------------------------------------------------------------------- */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-gradient-to-b from-[#07173b] to-[#040e24] border border-blue-500/40 shadow-2xl flex flex-col justify-between items-center text-center space-y-6 relative overflow-hidden">
            
            {/* Top Call Timer Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#051126] border border-blue-500/40 text-emerald-400 font-mono font-bold text-xs shadow-inner">
              <Phone size={12} className="animate-pulse" />
              <span>{formatTimer(callDuration)}</span>
            </div>

            {/* In Call... Talking status */}
            <div>
              <h3 className="text-xl font-black text-white">In Call...</h3>
              <p className="text-xs text-cyan-300 font-medium mt-1">
                Talking with Doctorian AI Assistant
              </p>
            </div>

            {/* Glowing Microphone Aura & Animated Frequency Bars */}
            <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-blue-900 to-[#030b1c] border-2 border-cyan-400/60 flex items-center justify-center shadow-[0_0_50px_rgba(0,229,255,0.4)]">
              <div className="absolute inset-2 rounded-full border border-blue-400/30 animate-spin" style={{ animationDuration: '20s' }} />
              
              <div className="p-4 rounded-full bg-blue-600/30 text-white shadow-inner">
                <Mic size={36} className="text-cyan-300 animate-pulse" />
              </div>
            </div>

            {/* Frequency Bars Strip */}
            <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs px-4">
              {audioWaves.map((height, i) => (
                <motion.div
                  key={i}
                  animate={{ height: isMuted ? 4 : `${height}%` }}
                  transition={{ duration: 0.1 }}
                  className="w-1.5 bg-gradient-to-t from-blue-500 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.6)]"
                />
              ))}
            </div>

            {/* Bottom 4 Call Action Buttons */}
            <div className="grid grid-cols-4 gap-3 w-full pt-2">
              
              {/* Mute */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                  isMuted ? 'bg-rose-600 text-white' : 'bg-[#091d44] hover:bg-blue-900/60 text-slate-300'
                }`}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              {/* Speaker */}
              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                  isSpeakerOn ? 'bg-blue-600 text-white' : 'bg-[#091d44] hover:bg-blue-900/60 text-slate-300'
                }`}
              >
                {isSpeakerOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>Speaker</span>
              </button>

              {/* Video Switch */}
              <button
                type="button"
                onClick={onSwitchToVideo}
                className="p-3 rounded-2xl bg-[#091d44] hover:bg-blue-900/60 text-slate-300 flex flex-col items-center justify-center gap-1 text-[10px] font-bold"
              >
                <Video size={16} />
                <span>Video</span>
              </button>

              {/* End Call */}
              <button
                type="button"
                onClick={onClose}
                className="p-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex flex-col items-center justify-center gap-1 text-[10px] font-black shadow-lg shadow-red-600/40"
              >
                <PhoneOff size={16} />
                <span>End Call</span>
              </button>

            </div>

          </div>

          {/* ------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: Language & Voice + Features + History (4 Cols)       */}
          {/* ------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Language & Voice Selector */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-blue-900/40">
                <div className="flex items-center gap-1.5 text-xs font-black text-white">
                  <Globe size={14} className="text-cyan-400" />
                  <span>Language & Voice</span>
                </div>
                <button 
                  type="button"
                  onClick={() => alert('Language preferences saved')}
                  className="text-[10px] text-cyan-400 font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-[#050e20] border border-blue-800/60 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="English">🇺🇸 English</option>
                  <option value="Luganda">🇺🇬 Luganda</option>
                  <option value="Swahili">🇹🇿 Swahili</option>
                  <option value="Runyankole">🇺🇬 Runyankole</option>
                  <option value="Acholi">🇺🇬 Acholi</option>
                </select>

                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-[#050e20] border border-blue-800/60 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="Natural Voice">🎙️ Natural Voice</option>
                  <option value="Clinical Professional">👩‍⚕️ Clinical Professional</option>
                  <option value="Calm & Soothing">🌿 Calm & Soothing</option>
                </select>
              </div>
            </div>

            {/* Call Features Toggles */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-2.5">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-400" />
                <span>Call Features</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Auto Transcript</span>
                  <button
                    type="button"
                    onClick={() => setAutoTranscript(!autoTranscript)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${autoTranscript ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoTranscript ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Real-time Translation</span>
                  <button
                    type="button"
                    onClick={() => setRealtimeTranslation(!realtimeTranslation)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${realtimeTranslation ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${realtimeTranslation ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Smart Health Tips</span>
                  <button
                    type="button"
                    onClick={() => setSmartHealthTips(!smartHealthTips)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${smartHealthTips ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${smartHealthTips ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Save Call Record</span>
                  <button
                    type="button"
                    onClick={() => setSaveCallRecord(!saveCallRecord)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${saveCallRecord ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${saveCallRecord ? 'translate-x-4' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Call History */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-blue-900/40">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-cyan-400" />
                  <span>Call History</span>
                </h4>
                <button type="button" className="text-[10px] text-cyan-400 font-bold hover:underline">
                  View All →
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-2xl bg-[#051024] border border-blue-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <PhoneCall size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-[11px]">Today, 04:15 PM</p>
                      <p className="text-[9px] text-slate-400">AI Health Assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-300">
                    <span>02:37</span>
                    <button type="button" className="p-1 rounded-md bg-blue-600 text-white">
                      <Play size={10} />
                    </button>
                  </div>
                </div>

                <div className="p-2 rounded-2xl bg-[#051024] border border-blue-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <PhoneCall size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-[11px]">Yesterday, 08:20 AM</p>
                      <p className="text-[9px] text-slate-400">Dr. James Okello</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-300">
                    <span>12:14</span>
                    <button type="button" className="p-1 rounded-md bg-blue-600 text-white">
                      <Play size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default DoctorianVoiceCallModal;
