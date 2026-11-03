import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, VideoOff, Mic, MicOff, X, Sparkles, Send, Play, Square, 
  Activity, Stethoscope, ShieldCheck, Radio, RotateCw, Monitor, Download 
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
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVisual, setCurrentVisual] = useState<string>("3d-heart");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: 'Doctorian Video AI Consultation ready. Describe what medical visualization or video simulation you need to generate.' }
  ]);

  if (!isOpen) return null;

  const handleGenerateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userText = prompt;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setPrompt("");
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const lower = userText.toLowerCase();
      if (lower.includes('brain') || lower.includes('mri')) {
        setCurrentVisual("brain-mri");
      } else if (lower.includes('lung') || lower.includes('chest') || lower.includes('breathing')) {
        setCurrentVisual("lung-scan");
      } else {
        setCurrentVisual("3d-heart");
      }

      setMessages(prev => [
        ...prev, 
        { sender: 'ai', text: `Generated accurate smart video simulation for: "${userText}". Telemetry feed synchronized.` }
      ]);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-slate-900 text-white rounded-[3rem] border border-slate-800 shadow-[0_25px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
        style={{ height: '85vh', maxHeight: '900px' }}
      >
        {/* Phone / Tablet Top Status Bar */}
        <div className="px-8 pt-4 pb-2 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <span>9:41</span>
          <div className="w-32 h-4 bg-slate-950 rounded-full mx-auto flex items-center justify-center gap-1.5 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-blue-400">Doctorian Video AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio size={12} className="text-blue-500 animate-pulse" />
            <span className="text-[10px]">HD 60FPS</span>
          </div>
        </div>

        {/* Top Header */}
        <div className="px-6 py-3 flex items-center justify-between shrink-0 border-b border-slate-800/60 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black tracking-tight uppercase text-white">● Recording Consultation Live</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentVisual(prev => prev === '3d-heart' ? 'brain-mri' : prev === 'brain-mri' ? 'lung-scan' : '3d-heart');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCw size={12} />
              <span>Switch Feed</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Main Video Generation & Simulation Feed Viewport */}
        <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          {/* Simulated Video Feed based on description */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {currentVisual === '3d-heart' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-950/40 via-slate-950 to-indigo-950/40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0,transparent_70%)]" />
                <motion.div 
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-48 h-48 rounded-full bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.4)]"
                >
                  <Activity size={80} className="text-blue-400 animate-pulse" />
                </motion.div>
                <div className="mt-6 text-center z-10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-1">AI Generated Simulation</p>
                  <h3 className="text-lg font-[1000] tracking-tight uppercase text-white">3D Cardiac Telemetry & Valve Dynamics</h3>
                </div>
              </div>
            )}

            {currentVisual === 'brain-mri' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-950/40 via-slate-950 to-indigo-950/40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0,transparent_70%)]" />
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                  className="w-48 h-48 rounded-full bg-purple-600/20 border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_80px_rgba(168,85,247,0.4)]"
                >
                  <ShieldCheck size={80} className="text-purple-400 animate-pulse" />
                </motion.div>
                <div className="mt-6 text-center z-10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-400 mb-1">AI Generated Simulation</p>
                  <h3 className="text-lg font-[1000] tracking-tight uppercase text-white">Neural Synapse & MRI Cross-Section</h3>
                </div>
              </div>
            )}

            {currentVisual === 'lung-scan' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950/40 via-slate-950 to-teal-950/40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0,transparent_70%)]" />
                <motion.div 
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-48 h-48 rounded-full bg-emerald-600/20 border-2 border-emerald-500/50 flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.4)]"
                >
                  <Stethoscope size={80} className="text-emerald-400 animate-pulse" />
                </motion.div>
                <div className="mt-6 text-center z-10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">AI Generated Simulation</p>
                  <h3 className="text-lg font-[1000] tracking-tight uppercase text-white">Pulmonary Oxygenation & Chest CT Scan</h3>
                </div>
              </div>
            )}
          </div>

          {/* Video Generation Loading Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-20 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-400 animate-spin">
                <Sparkles size={32} />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">Generating Smart Medical Video...</h3>
              <p className="text-xs font-medium text-slate-400">Doctorian AI is synthesizing accurate visual simulation based on your prompt.</p>
            </div>
          )}

          {/* Overlay Prompt Bar at bottom of video feed */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <form onSubmit={handleGenerateVideo} className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl">
              <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                <Sparkles size={16} />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you saw and what you want to generate..."
                className="flex-1 bg-transparent border-0 text-xs font-medium text-white placeholder-slate-400 focus:outline-none px-2"
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>Generate</span>
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Call Controls & Copyright */}
        <div className="p-6 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 shrink-0 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                if (onSwitchToVoice) {
                  onClose();
                  onSwitchToVoice();
                }
              }}
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer shadow-md"
              title="Switch to Voice Call"
            >
              <Mic size={20} />
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-2xl transition-all cursor-pointer shadow-md ${
                !isVideoOn 
                  ? 'bg-rose-600 text-white shadow-rose-600/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={onClose}
              className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-lg shadow-red-600/40"
              title="End Video Consultation"
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
