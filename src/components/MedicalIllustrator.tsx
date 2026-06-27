import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ImageIcon, Download, Share2, ArrowLeft, RefreshCw, 
  Bot, Search, Info, AlertCircle, Shield, Layers, Palette, Eye, Database, Battery, Loader2
} from 'lucide-react';
import { api, User } from '../api';

interface MedicalIllustratorProps {
  user: User | null;
  onRefreshUser?: () => void;
}

export function MedicalIllustrator({ user, onRefreshUser }: MedicalIllustratorProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<{url: string, prompt: string, id: string}[]>(() => {
    const saved = localStorage.getItem('doctorian_gallery');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string | null>(null);
  const [thinkingMessage, setThinkingMessage] = useState('Mapping anatomical vectors...');
  
  // Interactive Chat State Fields
  const [mode, setMode] = useState<'interactive' | 'classic'>('interactive');
  const [chatMessages, setChatMessages] = useState<{sender: 'user' | 'assistant', text: string}[]>(() => {
    return [
      {
        sender: 'assistant',
        text: "🩺 Welcome to the Medical Illustrator. I am Doctorian's visualization engine. Text me what you want to construct, design, or understand (e.g. 'explain synaptic transmission and show neurotransmitters crossing the axon terminal'), and I will discuss it and synthesize a high-fidelity anatomical model automatically!"
      }
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  const isUnlimited = React.useMemo(() => {
    const credString = String(user?.credits || "").toLowerCase();
    return credString.includes("unlimited") || Number(user?.credits) >= 99999;
  }, [user]);

  const numericCredits = React.useMemo(() => {
    if (isUnlimited) return 999999;
    const creditsVal = user?.credits;
    if (typeof creditsVal === "number") return creditsVal;
    const parsed = parseFloat(String(creditsVal || ""));
    return isNaN(parsed) ? 0 : parsed;
  }, [user, isUnlimited]);

  useEffect(() => {
    localStorage.setItem('doctorian_gallery', JSON.stringify(gallery));
  }, [gallery]);

  const LOCAL_ILLUSTRATION_MOCK = "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000&auto=format&fit=crop"; 

  const THINKING_MESSAGES = [
    'Initializing Neural Visualization Core...',
    'Mapping anatomical vectors...',
    'Synthesizing biological textures...',
    'Calibrating clinical lighting...',
    'Cross-referencing medical textbook styles...',
    'Refining structural accuracy...',
    'Optimizing high-fidelity projection...'
  ];

  const triggerIllustrationGeneration = async (generationPrompt: string) => {
    if (!generationPrompt.trim() || isGenerating) return;

    if (numericCredits < 10 && !isUnlimited) {
      setError("Insufficient Neural Energy. 10 credits required for image synthesis.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    // Rotate thinking messages
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[msgIndex]);
    }, 2000);

    try {
      const result = await api.ai.generateImage(generationPrompt, aspectRatio);
      if (result.success) {
        setGeneratedImage(result.imageData);
        const newEntry = { url: result.imageData, prompt: generationPrompt, id: Date.now().toString() };
        setGallery(prev => [newEntry, ...prev.slice(0, 9)]);
        onRefreshUser?.();
      } else {
        throw new Error(result.error || "Synthesis failed.");
      }
    } catch (err: any) {
      setError(err.message || "Visualization synthesis pathways disrupted.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    await triggerIllustrationGeneration(prompt);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAssistantThinking) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsAssistantThinking(true);
    setError(null);

    try {
      const systemInstruction = `You are Doctorian (v2.4), a Medical Visualization core. 
      The user is testing or chatting about medical or anatomical subjects. 
      Help explain the medical concept concisely, and always suggest/include a high-fidelity visual illustration.
      
      At the end of your response, you MUST append a line exactly in this format to trigger visual rendering:
      RENDER_PROMPT: <precise 3D medical style prompt to generate the illustration>
      
      Keep your medical explanation warm and brief (around 40-50 words).`;

      const response = await api.ai.aiChat([
        { role: 'user', text: userMsg }
      ], systemInstruction);

      const aiText = response.text || "Diagnostic query processed.";
      
      // Parse the response for RENDER_PROMPT
      const promptMatch = aiText.match(/RENDER_PROMPT:\s*(.+)$/i);
      let extractedPrompt = "";
      let displayedText = aiText;

      if (promptMatch) {
         extractedPrompt = promptMatch[1].trim();
         displayedText = aiText.replace(/RENDER_PROMPT:.+$/i, '').trim();
      } else {
         extractedPrompt = userMsg;
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: displayedText }]);

      if (extractedPrompt) {
        setPrompt(extractedPrompt);
        setTimeout(() => {
          triggerIllustrationGeneration(extractedPrompt);
        }, 100);
      }
    } catch (err: any) {
      setError(err?.message || "Communication pathway disrupted.");
      setChatMessages(prev => [...prev, { sender: 'assistant', text: "🔬 Connect link disrupted. I was unable to process your prompt synthesis core. Please ensure your neural energy is charged." }]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  const applyPreset = (val: string) => {
    if (mode === 'interactive') {
      setChatInput(val);
      setChatMessages(prev => [...prev, { sender: 'user', text: val }]);
      setIsAssistantThinking(true);
      setError(null);
      (async () => {
        try {
          const systemInstruction = `You are Doctorian (v2.4), a Medical Visualization core. 
          The user is testing or chatting about medical or anatomical subjects. 
          Help explain the medical concept concisely, and always suggest/include a high-fidelity visual illustration.
          
          At the end of your response, you MUST append a line exactly in this format to trigger visual rendering:
          RENDER_PROMPT: <precise 3D medical style prompt to generate the illustration>
          
          Keep your medical explanation warm and brief (around 40-50 words).`;

          const response = await api.ai.aiChat([
            { role: 'user', text: `Explain briefly and suggest a 3D visual illustration for: ${val}` }
          ], systemInstruction);

          const aiText = response.text || "Concept parsed.";
          const promptMatch = aiText.match(/RENDER_PROMPT:\s*(.+)$/i);
          let extractedPrompt = "";
          let displayedText = aiText;

          if (promptMatch) {
            extractedPrompt = promptMatch[1].trim();
            displayedText = aiText.replace(/RENDER_PROMPT:.+$/i, '').trim();
          } else {
            extractedPrompt = val;
          }

          setChatMessages(prev => [...prev, { sender: 'assistant', text: displayedText }]);
          if (extractedPrompt) {
            setPrompt(extractedPrompt);
            triggerIllustrationGeneration(extractedPrompt);
          }
        } catch (err: any) {
          setError(err?.message || "Communication pathway disrupted.");
          setChatMessages(prev => [...prev, { sender: 'assistant', text: "🔬 Connect link disrupted." }]);
        } finally {
          setIsAssistantThinking(false);
        }
      })();
    } else {
      setPrompt(val);
      triggerIllustrationGeneration(val);
    }
  };

  const downloadImage = (url: string | null, fileNamePrompt: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctorian-${fileNamePrompt.slice(0, 20).replace(/\s+/g, '-')}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      <header className="px-6 py-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <Palette size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Medical <span className="text-blue-600">Illustrator</span>
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Advanced Neural Synthesis for Clinical Anatomical Visuals
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Shield size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Clinically Grounded</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Llama 3.1 8B</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
              <Battery size={14} className="text-emerald-600" />
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
                {isUnlimited ? "Unlimited" : `${Math.round(numericCredits)}`} Units
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800/60 pb-5">
                <div className="flex items-center gap-3">
                  <Bot size={18} className="text-blue-600" />
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Synthesis Engine</h2>
                </div>
                
                {/* Segmented Mode Picker */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMode('interactive')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      mode === 'interactive' 
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-md' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Interactive Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('classic')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      mode === 'classic' 
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-md' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Classic Prompt
                  </button>
                </div>
              </div>

              {mode === 'interactive' ? (
                // Interactive Chat / Texting Interface
                <div className="space-y-6">
                  {/* Message History box */}
                  <div className="h-64 overflow-y-auto bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-3xl p-5 space-y-4 flex flex-col scrollbar-thin">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`max-w-[85%] rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600 text-white self-end rounded-tr-none' 
                            : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 self-start rounded-tl-none shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {isAssistantThinking && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 self-start rounded-2xl rounded-tl-none p-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm animate-pulse">
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                        Analyzing with Doctorian Engine...
                      </div>
                    )}
                  </div>

                  {/* Message Input Box */}
                  <div className="flex gap-2.5">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendChatMessage();
                      }}
                      placeholder="Type clinical instructions (e.g. explain neuron firing and generate it)..."
                      className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all focus:ring-1 focus:ring-blue-500"
                      disabled={isAssistantThinking}
                    />
                    <button
                      type="button"
                      onClick={handleSendChatMessage}
                      disabled={!chatInput.trim() || isAssistantThinking}
                      className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-lg shadow-blue-500/20"
                    >
                      <Sparkles size={14} className={isAssistantThinking ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              ) : (
                // Classic Prompt Selector
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                      Visualization Prompt
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-3xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the anatomical structure... e.g., '3D render of the human knee joint showing ACL ligaments and cartilage in high clinical detail'"
                        className="w-full h-40 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: '1:1 Square', value: '1:1' },
                        { label: '4:3 Standard', value: '4:3' },
                        { label: '16:9 Cinema', value: '16:9' }
                      ].map((ratio) => (
                        <button
                          key={ratio.value}
                          onClick={() => setAspectRatio(ratio.value)}
                          className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                            aspectRatio === ratio.value 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                              : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <button 
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="flex-1 flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Synthesizing...
                        </>
                      ) : (
                        <>
                          <Layers size={16} />
                          Synthesize Illustration
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex gap-3">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-amber-900/70 dark:text-amber-400/70 leading-relaxed uppercase">
                  Clinically dense prompts yield superior anatomical projections.
                </p>
              </div>
            </div>

            <div className="space-y-4 px-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biological Templates</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Axonal terminal and synaptic vesicle release",
                  "Cross-section of the cochlea and hair cells",
                  "Nephron filtration unit in the renal cortex",
                  "Double-helix DNA structural architecture",
                  "Sarcomere contraction in skeletal muscle"
                ].map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => applyPreset(s)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 rounded-xl text-[10px] font-bold transition-all border border-transparent hover:border-blue-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group min-h-[500px]">
             <AnimatePresence mode="wait">
               {isGenerating ? (
                 <motion.div 
                   key="loading"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-6"
                 >
                   <div className="relative w-32 h-32">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-full"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-6 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bot size={40} className="text-blue-600 animate-pulse" />
                      </div>
                   </div>
                   <div className="text-center space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 animate-pulse">Neural Matrix Generating</p>
                     <p className="text-[11px] font-bold text-slate-400 uppercase italic px-10">{thinkingMessage}</p>
                   </div>
                 </motion.div>
               ) : generatedImage ? (
                 <motion.div 
                   key="result"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="space-y-6"
                 >
                   <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group/img">
                     <img 
                       src={generatedImage} 
                       alt="Medical Illustration" 
                       className="w-full h-auto min-h-[400px] object-cover transition-transform duration-700 group-hover/img:scale-105"
                       referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                     <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center opacity-0 group-hover/img:opacity-100 translate-y-4 group-hover/img:translate-y-0 transition-all duration-500">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-white tracking-widest">Doctorian AI Synthesis</p>
                          <p className="text-xs text-slate-300 font-medium truncate max-w-[200px]">{prompt}</p>
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => downloadImage(generatedImage, prompt)}
                            className="p-3 bg-white text-slate-900 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                           >
                              <Download size={18} />
                           </button>
                           <button className="p-3 bg-white text-slate-900 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                              <Share2 size={18} />
                           </button>
                        </div>
                     </div>
                   </div>
                   <button 
                    onClick={() => setGeneratedImage(null)}
                    className="w-full py-4 border-2 border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-600 hover:text-blue-600 transition-all"
                   >
                    Generate New Diagnostic Visual
                   </button>
                 </motion.div>
               ) : (
                 <div className="absolute inset-0 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-6 text-center px-10">
                   <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-300 dark:text-slate-700">
                     <ImageIcon size={64} strokeWidth={1} />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Direct Core Projection</h3>
                     <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed max-w-[280px]">
                       Input a clinical prompt on the left to synthesize high-fidelity medical illustrations.
                     </p>
                   </div>
                 </div>
               )}
             </AnimatePresence>

             {error && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="absolute bottom-6 left-6 right-6 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl flex items-center gap-4 text-rose-600 shadow-xl shadow-rose-500/10 z-20"
               >
                 <AlertCircle size={24} className="shrink-0" />
                 <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest leading-tight mb-1">Synthesis Failure</p>
                   <p className="text-[11px] font-bold uppercase">{error}</p>
                 </div>
               </motion.div>
             )}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 flex items-center justify-center rounded-2xl">
                   <Eye size={24} className="text-slate-400" />
                </div>
                <div className="space-y-1">
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Neural Session Gallery</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase">Cached projections from current clinical session</p>
                </div>
              </div>
              
              {gallery.length > 0 && (
                <button 
                  onClick={() => setGallery([])}
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                  Purge Gallery
                </button>
              )}
           </div>
           
           {gallery.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {gallery.map((item) => (
                  <motion.div 
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square group/item rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 cursor-pointer"
                    onClick={() => setGeneratedImage(item.url)}
                  >
                    <img 
                      src={item.url} 
                      alt={item.prompt} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center space-y-2">
                        <p className="text-[8px] font-black uppercase text-white truncate w-full">{item.prompt}</p>
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(item.url, item.prompt);
                        }}
                        className="p-2 bg-white/20 hover:bg-white rounded-lg text-white hover:text-slate-900 transition-all"
                       >
                         <Download size={12} />
                       </button>
                    </div>
                  </motion.div>
                ))}
             </div>
           ) : (
             <div className="flex items-center justify-center py-20 opacity-30 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                      <Search size={32} className="text-slate-300" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biological Registry Empty</p>
                </div>
             </div>
           )}
        </section>
      </main>

      <footer className="px-6 py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Database size={12} className="text-slate-400" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Engine: Neural-Projection.V3 (Llama/DeepSeek)</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <RefreshCw size={12} className="text-slate-400" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Buffer Sync: Established</span>
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            © 2025 Doctorian Neural Matrix
          </p>
        </div>
      </footer>
    </div>
  );
}
