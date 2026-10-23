import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ImageIcon, Download, Share2, ArrowLeft, RefreshCw, 
  Bot, Search, Info, AlertCircle, Shield, Layers, Palette, Eye, Database, Battery, Loader2, Play, Pause, Activity,
  Video, Film, Volume2, VolumeX, Maximize2, Sliders, Radio, Clock, Compass, BookOpen, Clapperboard, Flame, Heart, Cpu
} from 'lucide-react';
import { api, User } from '../api';
import { ThreeAnatomyViewer } from './ThreeAnatomyViewer';

interface MedicalIllustratorProps {
  user: User | null;
  onRefreshUser?: () => void;
}

export interface VideoData {
  id?: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  prompt: string;
  interestCategory: string;
  duration: number;
  fps: number;
  narrationScript: string;
  chapters: { time: number; label: string; description: string }[];
  keyframes: { time: number; image: string; caption: string }[];
}

export function MedicalIllustrator({ user, onRefreshUser }: MedicalIllustratorProps) {
  // Mode: Image vs Video vs Real-time Three.js 3D Model
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'threejs'>('image');

  // Common Prompt State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinkingMessage, setThinkingMessage] = useState('Mapping anatomical vectors...');

  // Image Generation State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Video Generation & Customization State
  const [interestCategory, setInterestCategory] = useState<string>('Cardiology');
  const [videoStyle, setVideoStyle] = useState<string>('3D Cinematic');
  const [cameraMotion, setCameraMotion] = useState<string>('Orbit 360°');
  const [videoDuration, setVideoDuration] = useState<number>(10);
  const [enableNarration, setEnableNarration] = useState<boolean>(true);
  const [generatedVideo, setGeneratedVideo] = useState<VideoData | null>(null);

  // Video Player Controls State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoVolume, setVideoVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);

  // Gallery
  const [gallery, setGallery] = useState<{url: string, prompt: string, id: string, type: 'image' | 'video', title?: string}[]>(() => {
    const saved = localStorage.getItem('doctorian_illustrator_gallery');
    return saved ? JSON.parse(saved) : [];
  });

  // Image Animation Playing State
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(true);
  const [animationMode, setAnimationMode] = useState<'scan' | 'pulse' | 'layer'>('scan');
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  // Interactive Chat State Fields
  const [mode, setMode] = useState<'interactive' | 'classic'>('interactive');
  const [chatMessages, setChatMessages] = useState<{sender: 'user' | 'assistant', text: string, video?: VideoData}[]>(() => {
    return [
      {
        sender: 'assistant',
        text: "🩺 Welcome to Doctorian's Medical Illustrator & 4K Video Studio! Select your area of interest (e.g. Cardiology, Neurology, Cell Biology) and describe any anatomical process. I will synthesize both still high-fidelity 3D illustrations AND motion videos with clinical narration!"
      }
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  const isUnlimited = useMemo(() => {
    const credString = String(user?.credits || "").toLowerCase();
    return credString.includes("unlimited") || Number(user?.credits) >= 99999;
  }, [user]);

  const numericCredits = useMemo(() => {
    if (isUnlimited) return 999999;
    const creditsVal = user?.credits;
    if (typeof creditsVal === "number") return creditsVal;
    const parsed = parseFloat(String(creditsVal || ""));
    return isNaN(parsed) ? 0 : parsed;
  }, [user, isUnlimited]);

  useEffect(() => {
    localStorage.setItem('doctorian_illustrator_gallery', JSON.stringify(gallery));
  }, [gallery]);

  // Handle Speech Narration
  const speakNarration = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsNarrating(true);
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopNarration = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  };

  const THINKING_MESSAGES_IMAGE = [
    'Initializing Neural Visualization Core...',
    'Mapping anatomical vectors...',
    'Synthesizing biological textures...',
    'Calibrating clinical lighting...',
    'Cross-referencing medical textbook styles...',
    'Refining structural accuracy...',
    'Optimizing high-fidelity projection...'
  ];

  const THINKING_MESSAGES_VIDEO = [
    'Constructing 4K volumetric spatial grid...',
    'Calculating fluid dynamics & cellular motion...',
    'Rendering camera path & orbit kinematics...',
    'Synthesizing clinical audio voiceover narration...',
    'Compiling high-frame-rate medical animation...',
    'Finalizing neural video stream buffer...'
  ];

  const INTEREST_CATEGORIES = [
    { name: 'Cardiology', icon: '🫀', description: 'Heart mechanics, valve motion & vascular flow' },
    { name: 'Neurology', icon: '🧠', description: 'Synapses, brain networks & action potentials' },
    { name: 'Cell Biology', icon: '🔬', description: 'Mitosis, organelle transport & phagocytosis' },
    { name: 'Genetics', icon: '🧬', description: 'DNA replication, transcription & CRISPR editing' },
    { name: 'Surgery', icon: '🩺', description: 'Surgical entry, instrumentation & suturing' },
    { name: 'Pharmacology', icon: '💊', description: 'Receptor binding, drug absorption & inhibition' },
    { name: 'Ophthalmology', icon: '👁️', description: 'Retinal light transduction & ocular optics' },
  ];

  const USER_INTEREST_PRESETS: Record<string, string[]> = {
    Cardiology: [
      "Blood flow through heart valves during cardiac cycle",
      "Coronary artery occlusion and stent expansion fly-through",
      "Electrical conduction system firing through AV node",
      "Aortic valve leaflet kinematics in high resolution"
    ],
    Neurology: [
      "Synaptic neurotransmitter vesicles crossing axon cleft",
      "3D fly-through of cerebral cortex neural pathway",
      "Myelinated axon action potential saltatory conduction",
      "Dopamine receptor activation in striatal neurons"
    ],
    "Cell Biology": [
      "Macrophage engulfing pathogen via phagocytosis",
      "Cellular mitosis chromosome separation by spindle fibers",
      "Mitochondrial ATP synthase enzyme rotational motor",
      "Endoplasmic reticulum protein transport vesicles"
    ],
    Genetics: [
      "DNA double helix unzipping by helicase during replication",
      "CRISPR-Cas9 protein binding and cutting target DNA sequence",
      "Ribosome translating mRNA strand into peptide chain",
      "Chromatin folding and histone protein packaging"
    ],
    Surgery: [
      "Laparoscopic trocar placement and peritoneal insufflation",
      "Micro-vascular anastomosis suturing under surgical scope",
      "Robotic surgical arm executing precision tissue incision",
      "Total knee replacement prosthetic alignment and insertion"
    ],
    Pharmacology: [
      "Monoclonal antibody targeting tumor cell surface receptor",
      "Liposomal drug carrier fusing with cell membrane",
      "Enzyme competitive inhibitor blocking active site",
      "G-protein coupled receptor conformational signal cascade"
    ],
    Ophthalmology: [
      "Light ray refraction through cornea, lens, and photoreceptors",
      "Retinal ganglion cell signal transmission down optic nerve",
      "Phacoemulsification cataract extraction ultrasonic probe",
      "Intraocular pressure fluid dynamics through Trabecular meshwork"
    ]
  };

  const triggerIllustrationGeneration = async (generationPrompt: string) => {
    if (!generationPrompt.trim() || isGenerating) return;

    if (numericCredits < 10 && !isUnlimited) {
      setError("Insufficient Neural Energy. 10 credits required for image synthesis.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % THINKING_MESSAGES_IMAGE.length;
      setThinkingMessage(THINKING_MESSAGES_IMAGE[msgIndex]);
    }, 2000);

    try {
      const result = await api.ai.generateImage(generationPrompt, aspectRatio);
      if (result.success) {
        setGeneratedImage(result.imageData);
        const newEntry = { 
          url: result.imageData, 
          prompt: generationPrompt, 
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'image' as const
        };
        setGallery(prev => [newEntry, ...prev.slice(0, 11)]);
        onRefreshUser?.();
      } else {
        throw new Error(result.error || "Image synthesis failed.");
      }
    } catch (err: any) {
      setError(err.message || "Visualization synthesis pathways disrupted.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const triggerVideoGeneration = async (generationPrompt: string) => {
    if (!generationPrompt.trim() || isGenerating) return;

    if (numericCredits < 15 && !isUnlimited) {
      setError("Insufficient Neural Energy. 15 credits required for video rendering.");
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setError(null);
    stopNarration();

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % THINKING_MESSAGES_VIDEO.length;
      setThinkingMessage(THINKING_MESSAGES_VIDEO[msgIndex]);
    }, 2200);

    try {
      const result = await api.ai.generateVideo({
        prompt: generationPrompt,
        interestCategory,
        style: videoStyle,
        duration: videoDuration,
        cameraMotion,
        aspectRatio
      });

      if (result.success && result.videoData) {
        setGeneratedVideo(result.videoData);
        const newEntry = {
          url: result.videoData.videoUrl,
          prompt: generationPrompt,
          id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'video' as const,
          title: result.videoData.title
        };
        setGallery(prev => [newEntry, ...prev.slice(0, 11)]);
        onRefreshUser?.();

        if (enableNarration && result.videoData.narrationScript) {
          setTimeout(() => {
            speakNarration(result.videoData.narrationScript);
          }, 600);
        }
      } else {
        throw new Error(result.error || "Video rendering failed.");
      }
    } catch (err: any) {
      setError(err.message || "Video synthesis pathways disrupted.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (mediaType === 'image') {
      await triggerIllustrationGeneration(prompt);
    } else {
      await triggerVideoGeneration(prompt);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAssistantThinking) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsAssistantThinking(true);
    setError(null);

    try {
      const systemInstruction = `You are Doctorian (v2.4), a Medical Visualization and 4K Video Synthesis core. 
      The user is asking or chatting about a medical or anatomical topic of interest (${interestCategory}). 
      Provide a clear, brief medical explanation (40-50 words), and suggest a visual prompt.
      
      At the end of your response, append a line exactly in this format to trigger rendering:
      RENDER_PROMPT: <precise anatomical prompt>
      
      Also specify the target media type:
      MEDIA_TYPE: ${mediaType.toUpperCase()}
      
      Keep your explanation warm, professional, and educational.`;

      const response = await api.ai.aiChat([
        { role: 'user', text: userMsg }
      ], systemInstruction);

      const aiText = response.text || "Medical interest query processed.";
      
      const promptMatch = aiText.match(/RENDER_PROMPT:\s*(.+)$/im);
      let extractedPrompt = "";
      let displayedText = aiText;

      if (promptMatch) {
        extractedPrompt = promptMatch[1].trim();
        displayedText = aiText.replace(/RENDER_PROMPT:.+$/im, '').replace(/MEDIA_TYPE:.+$/im, '').trim();
      } else {
        extractedPrompt = userMsg;
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: displayedText }]);

      if (extractedPrompt) {
        setPrompt(extractedPrompt);
        setTimeout(() => {
          if (mediaType === 'image') {
            triggerIllustrationGeneration(extractedPrompt);
          } else {
            triggerVideoGeneration(extractedPrompt);
          }
        }, 100);
      }
    } catch (err: any) {
      setError(err?.message || "Communication pathway disrupted.");
      setChatMessages(prev => [...prev, { sender: 'assistant', text: "🔬 Medical link disrupted. Please check neural energy allocation." }]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  const applyPreset = (val: string) => {
    setPrompt(val);
    if (mode === 'interactive') {
      setChatInput(val);
      setChatMessages(prev => [...prev, { sender: 'user', text: val }]);
      setIsAssistantThinking(true);
      setError(null);
      (async () => {
        try {
          const systemInstruction = `You are Doctorian (v2.4), a Medical Visualization & Video core. 
          Explain briefly (40 words) and suggest a visualization for: ${val} in category ${interestCategory}.
          At the end append: RENDER_PROMPT: <precise medical prompt>`;

          const response = await api.ai.aiChat([
            { role: 'user', text: `Explain briefly and render visualization for: ${val}` }
          ], systemInstruction);

          const aiText = response.text || "Concept parsed.";
          const promptMatch = aiText.match(/RENDER_PROMPT:\s*(.+)$/im);
          let extractedPrompt = "";
          let displayedText = aiText;

          if (promptMatch) {
            extractedPrompt = promptMatch[1].trim();
            displayedText = aiText.replace(/RENDER_PROMPT:.+$/im, '').trim();
          } else {
            extractedPrompt = val;
          }

          setChatMessages(prev => [...prev, { sender: 'assistant', text: displayedText }]);
          if (extractedPrompt) {
            if (mediaType === 'image') {
              triggerIllustrationGeneration(extractedPrompt);
            } else {
              triggerVideoGeneration(extractedPrompt);
            }
          }
        } catch (err: any) {
          setError(err?.message || "Communication pathway disrupted.");
        } finally {
          setIsAssistantThinking(false);
        }
      })();
    } else {
      if (mediaType === 'image') {
        triggerIllustrationGeneration(val);
      } else {
        triggerVideoGeneration(val);
      }
    }
  };

  const downloadMedia = (url: string | null, fileNamePrompt: string, isVid: boolean = false) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctorian-${isVid ? 'video' : 'illustration'}-${fileNamePrompt.slice(0, 20).replace(/\s+/g, '-')}-${Date.now()}.${isVid ? 'mp4' : 'png'}`;
    a.click();
  };

  const togglePlayVideo = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Header */}
      <header className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 rounded-2xl text-white shadow-lg shadow-blue-500/20 flex items-center justify-center">
                {mediaType === 'video' ? <Video size={22} className="animate-pulse" /> : <Palette size={22} />}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                  Medical <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">Illustrator & Video Studio</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">
                  Generate 4K Anatomical Models & Dynamic Educational Video Animations based on your interests
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Media Type Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMediaType('image');
                  stopNarration();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  mediaType === 'image'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon size={14} />
                <span>3D Still Illustration</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  stopNarration();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  mediaType === 'video'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Video size={14} />
                <span>4K Video</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-teal-400 text-slate-950 font-black rounded-md uppercase">4K</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType('threejs');
                  stopNarration();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  mediaType === 'threejs'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Cpu size={14} />
                <span>Interactive 3D</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-cyan-400 text-slate-950 font-black rounded-md uppercase">Three.js</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <Battery size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 tracking-wider">
                {isUnlimited ? "Unlimited" : `${Math.round(numericCredits)}`} Units
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-10">
        
        {/* User Interest Categories Selector */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Compass size={18} className="text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                Select Area of Clinical Interest
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Tailors visual physics & cellular motion
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {INTEREST_CATEGORIES.map((cat, mapIdx_516) => {
              const isSelected = interestCategory === cat.name;
              return (
                <button
                  key={`medicalillustrator-l521-${mapIdx_516}`}
                  onClick={() => {
                    setInterestCategory(cat.name);
                    setError(null);
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-200 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/60 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{cat.icon}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider truncate">{cat.name}</p>
                    <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 line-clamp-1">{cat.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Studio Panel & Viewer Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Generator Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              
              {/* Header with Mode Selector */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <Bot size={18} className="text-blue-600" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
                    {mediaType === 'video' ? 'Video Rendering Engine' : 'Illustration Engine'}
                  </h2>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMode('interactive')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      mode === 'interactive' 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Interactive Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('classic')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      mode === 'classic' 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Direct Prompt
                  </button>
                </div>
              </div>

              {/* Interactive Chat vs Direct Prompt */}
              {mode === 'interactive' ? (
                <div className="space-y-4">
                  <div className="h-60 overflow-y-auto bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 space-y-3 flex flex-col scrollbar-thin">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={`medicalillustrator-l594-idx-${idx}`} 
                        className={`max-w-[90%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600 text-white self-end rounded-tr-none' 
                            : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 self-start rounded-tl-none shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {isAssistantThinking && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 self-start rounded-2xl rounded-tl-none p-3.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm animate-pulse">
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                        Doctorian processing {interestCategory} query...
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendChatMessage();
                      }}
                      placeholder={`Describe what to visualize in ${interestCategory}...`}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all"
                      disabled={isAssistantThinking}
                    />
                    <button
                      type="button"
                      onClick={handleSendChatMessage}
                      disabled={!chatInput.trim() || isAssistantThinking}
                      className="px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <Sparkles size={14} className={isAssistantThinking ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                      {mediaType === 'video' ? 'Video Scene & Motion Prompt' : 'Anatomical Model Prompt'}
                    </label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        mediaType === 'video' 
                          ? `Describe video action in ${interestCategory}... e.g., '3D fly-through of synaptic neurotransmitter transmission across the synaptic cleft'`
                          : `Describe 3D anatomical model... e.g., 'High-resolution cross-section of nephron filtration unit in kidney'`
                      }
                      className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all resize-none"
                    />
                  </div>

                  {/* Video-Specific Options */}
                  {mediaType === 'video' && (
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      
                      {/* Render Style */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                          Visual Render Style
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            '3D Cinematic',
                            '2D Animated Blueprint',
                            'Microscopic Timelapse',
                            'Endoscopic Fly-Through',
                            'X-Ray Thermal Dynamics'
                          ].map((st, stIdx) => (
                            <button
                              key={`mi-style-${st}-${stIdx}`}
                              type="button"
                              onClick={() => setVideoStyle(st)}
                              className={`py-2 px-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                videoStyle === st
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Camera Motion & Duration */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                            Camera Motion
                          </label>
                          <select
                            value={cameraMotion}
                            onChange={(e) => setCameraMotion(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-600"
                          >
                            <option value="Orbit 360°">Orbit 360°</option>
                            <option value="Fly-Through">Fly-Through</option>
                            <option value="Cellular Micro-Zoom">Cellular Micro-Zoom</option>
                            <option value="Pan & Tilt">Pan & Tilt</option>
                            <option value="Exploded View">Exploded View</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                            Duration & FPS
                          </label>
                          <div className="flex gap-1.5">
                            {[5, 10, 15].map((dur, durIdx) => (
                              <button
                                key={`mi-dur-${dur}-${durIdx}`}
                                type="button"
                                onClick={() => setVideoDuration(dur)}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                                  videoDuration === dur
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {dur}s (60fps)
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Audio Narration Toggle */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Volume2 size={16} className="text-blue-600" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Clinical Voiceover Narration</p>
                            <p className="text-[9px] text-slate-400">Narrates physiological actions as video plays</p>
                          </div>
                        </div>
                        <input 
                          type="checkbox"
                          checked={enableNarration}
                          onChange={(e) => setEnableNarration(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <button 
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:opacity-95 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Synthesizing {mediaType === 'video' ? '4K Video...' : '3D Illustration...'}</span>
                      </>
                    ) : (
                      <>
                        {mediaType === 'video' ? <Video size={16} /> : <Palette size={16} />}
                        <span>Generate {mediaType === 'video' ? '4K Video Animation' : '3D Illustration'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Category-Specific Inspiration Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {interestCategory} Topic Presets
                  </span>
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">Click to load</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {(USER_INTEREST_PRESETS[interestCategory] || USER_INTEREST_PRESETS.Cardiology).map((preset, i) => (
                    <button 
                      key={`medicalillustrator-l778-i-${i}`}
                      onClick={() => applyPreset(preset)}
                      className="text-left px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-[10px] font-medium transition-all border border-slate-200/50 dark:border-slate-700/60 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Video & Image Output Stage */}
          <div className="lg:col-span-7 space-y-6 min-h-[500px]">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center min-h-[500px] space-y-6 text-center shadow-sm"
                >
                  <div className="relative w-36 h-36">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-full"
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-6 border-4 border-teal-500/20 border-t-teal-500 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {mediaType === 'video' ? (
                        <Film size={44} className="text-blue-600 animate-pulse" />
                      ) : (
                        <Bot size={44} className="text-blue-600 animate-pulse" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 max-w-md">
                    <p className="text-xs font-black uppercase tracking-[0.3em] bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent animate-pulse">
                      Synthesizing {mediaType === 'video' ? '4K Video Animation' : 'High-Fidelity Model'}
                    </p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic">
                      "{thinkingMessage}"
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                        Category: {interestCategory}
                      </span>
                      {mediaType === 'video' && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-full">
                          Style: {videoStyle}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : mediaType === 'threejs' ? (
                /* THREE.JS REAL-TIME 3D ANATOMICAL STUDIO */
                <motion.div 
                  key="threejs-studio"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <ThreeAnatomyViewer 
                    initialOrgan={
                      interestCategory === 'Neurology' ? 'brain' : 
                      interestCategory === 'Orthopedics' ? 'spine' : 'heart'
                    } 
                  />
                </motion.div>
              ) : mediaType === 'video' && generatedVideo ? (
                /* VIDEO RENDER STAGE */
                <motion.div 
                  key="video-result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative group">
                    
                    {/* Video Player */}
                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                      <video
                        ref={videoRef}
                        src={generatedVideo.videoUrl}
                        poster={generatedVideo.thumbnailUrl}
                        className="w-full h-full object-cover"
                        loop
                        playsInline
                        onError={(e) => {
                          // Fallback to resilient video CDN if original URL fails to load
                          const target = e.currentTarget;
                          if (!target.dataset.fallbackTried) {
                            target.dataset.fallbackTried = "true";
                            target.src = "https://cdn.coverr.co/videos/coverr-doctor-explaining-a-diagnosis-4622/1080p.mp4";
                            target.load();
                            target.play().catch(() => {});
                          }
                        }}
                        onTimeUpdate={() => {
                          if (videoRef.current) {
                            setVideoCurrentTime(videoRef.current.currentTime);
                          }
                        }}
                        onEnded={() => setIsVideoPlaying(false)}
                      />

                      {/* Video Overlay Specs */}
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider">4K Medical Stream</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[10px] font-bold text-cyan-300 uppercase">{generatedVideo.interestCategory}</span>
                      </div>

                      {/* Video Narration Floating Indicator */}
                      {isNarrating && (
                        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-blue-600/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white shadow-lg animate-pulse">
                          <Volume2 size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Clinical Narration Playing</span>
                        </div>
                      )}

                      {/* Play Big Overlay Button if Paused */}
                      {!isVideoPlaying && (
                        <button
                          type="button"
                          onClick={togglePlayVideo}
                          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                        >
                          <Play size={28} className="ml-1" />
                        </button>
                      )}
                    </div>

                    {/* Video Custom Control Bar */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
                      
                      {/* Scrubber Timeline */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-400 font-bold w-10">
                          {Math.floor(videoCurrentTime)}s
                        </span>
                        <input
                          type="range"
                          min="0"
                          max={generatedVideo.duration || 10}
                          step="0.1"
                          value={videoCurrentTime}
                          onChange={(e) => {
                            const t = parseFloat(e.target.value);
                            setVideoCurrentTime(t);
                            if (videoRef.current) videoRef.current.currentTime = t;
                          }}
                          className="flex-1 accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-slate-400 font-bold w-10 text-right">
                          {generatedVideo.duration}s
                        </span>
                      </div>

                      {/* Controls Buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={togglePlayVideo}
                            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all cursor-pointer"
                          >
                            {isVideoPlaying ? <Pause size={16} /> : <Play size={16} />}
                          </button>

                          {/* Narration Reader Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isNarrating) {
                                stopNarration();
                              } else {
                                speakNarration(generatedVideo.narrationScript);
                              }
                            }}
                            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                              isNarrating ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                            title="Play/Pause Clinical Audio Narration"
                          >
                            <Volume2 size={16} />
                            <span className="text-[10px] uppercase font-black">{isNarrating ? 'Stop Voice' : 'Voice Narration'}</span>
                          </button>

                          {/* Speed Selector */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-1">
                            {[0.5, 1, 1.5, 2].map((speed, spdIdx) => (
                              <button
                                key={`mi-speed-${speed}-${spdIdx}`}
                                type="button"
                                onClick={() => {
                                  setPlaybackSpeed(speed);
                                  if (videoRef.current) videoRef.current.playbackRate = speed;
                                }}
                                className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold transition-all ${
                                  playbackSpeed === speed ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => downloadMedia(generatedVideo.videoUrl, generatedVideo.prompt, true)}
                            className="p-2 bg-slate-800 hover:bg-blue-600 rounded-xl text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Download size={14} />
                            <span className="text-[10px] uppercase font-black hidden sm:inline">Export MP4</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Narration Card */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-600">
                        <BookOpen size={16} />
                        <h4 className="text-xs font-black uppercase tracking-wider">AI Clinical Educational Narration</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Interactive Audio-Visual</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      "{generatedVideo.narrationScript}"
                    </p>
                  </div>

                  {/* Storyboard Keyframe Timeline */}
                  {generatedVideo.chapters && generatedVideo.chapters.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Clapperboard size={16} className="text-teal-500" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Video Motion Storyboard Breakdown
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {generatedVideo.chapters.map((ch, idx) => (
                          <div 
                            key={`medicalillustrator-l1011-idx-${idx}`}
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.currentTime = ch.time;
                                setVideoCurrentTime(ch.time);
                              }
                            }}
                            className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-black text-teal-600 dark:text-teal-400 uppercase">Chapter {idx + 1}</span>
                              <span className="font-mono text-slate-400 font-bold">{ch.time}s</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{ch.label}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{ch.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setGeneratedVideo(null)}
                    className="w-full py-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-600 hover:text-blue-600 transition-all cursor-pointer"
                  >
                    Synthesize New Educational Video
                  </button>
                </motion.div>
              ) : generatedImage ? (
                /* IMAGE RENDER STAGE */
                <motion.div 
                  key="image-result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group">
                    <div className="relative overflow-hidden">
                      <img 
                        src={generatedImage} 
                        alt="Medical Illustration" 
                        className="w-full h-auto min-h-[420px] object-cover transition-transform duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.fallbackTried) {
                            target.dataset.fallbackTried = "true";
                            target.src = "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80";
                          }
                        }}
                      />
                      {isPlayingAnimation && animationMode === 'scan' && (
                        <motion.div
                          animate={{ top: ['-10%', '110%'] }}
                          transition={{ duration: 2.5 / animationSpeed, repeat: Infinity, ease: 'linear' }}
                          className="absolute left-0 right-0 h-16 bg-gradient-to-b from-cyan-500/0 via-cyan-400/40 to-cyan-500/0 border-b-2 border-cyan-400 pointer-events-none shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                        />
                      )}
                      
                      {/* Control Pill */}
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-white/20 text-white shadow-xl">
                        <button
                          type="button"
                          onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
                            isPlayingAnimation ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isPlayingAnimation ? <Pause size={14} /> : <Play size={14} />}
                          <span>{isPlayingAnimation ? 'Animating' : 'Play Anim'}</span>
                        </button>
                        <div className="flex items-center gap-1 border-l border-white/20 pl-2">
                          {(['scan', 'pulse', 'layer'] as const).map((m, mIdx) => (
                            <button
                              key={`mi-anim-${m}-${mIdx}`}
                              type="button"
                              onClick={() => setAnimationMode(m)}
                              className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                                animationMode === m ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Doctorian 3D Anatomical Render</p>
                        <p className="text-xs text-slate-300 font-medium truncate max-w-[300px]">{prompt}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => downloadMedia(generatedImage, prompt, false)}
                          className="p-3 bg-white text-slate-900 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-xl cursor-pointer"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setGeneratedImage(null)}
                    className="w-full py-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-600 hover:text-blue-600 transition-all cursor-pointer"
                  >
                    Generate New Diagnostic Visual
                  </button>
                </motion.div>
              ) : (
                /* EMPTY STATE */
                <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
                  <div className="p-6 bg-blue-50 dark:bg-blue-950/50 rounded-3xl text-blue-600 dark:text-blue-400">
                    {mediaType === 'video' ? <Video size={48} /> : <ImageIcon size={48} />}
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      {mediaType === 'video' ? '4K Medical Video Studio' : 'Direct Core Projection'}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                      Select your clinical interest above and input a prompt to generate high-definition {mediaType === 'video' ? 'educational videos with clinical narration' : '3D anatomical illustrations'}.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Neural Session Gallery */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
                <Eye size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                  Neural Session Media Gallery
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Saved videos and illustrations from active session</p>
              </div>
            </div>

            {gallery.length > 0 && (
              <button 
                onClick={() => setGallery([])}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
              >
                Clear Gallery
              </button>
            )}
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gallery.map((item, gIdx) => (
                <div 
                  key={`gal-${item.id || gIdx}-${gIdx}`}
                  onClick={() => {
                    if (item.type === 'video') {
                      setMediaType('video');
                      setGeneratedVideo({
                        videoUrl: item.url,
                        thumbnailUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop',
                        title: item.title || item.prompt,
                        prompt: item.prompt,
                        interestCategory: interestCategory,
                        duration: 10,
                        fps: 60,
                        narrationScript: `Visualizing ${item.prompt} in detail.`,
                        chapters: [],
                        keyframes: []
                      });
                    } else {
                      setMediaType('image');
                      setGeneratedImage(item.url);
                    }
                  }}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer group hover:scale-[1.02] transition-all bg-slate-950"
                >
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover opacity-80" 
                      muted 
                      playsInline
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallbackTried) {
                          target.dataset.fallbackTried = "true";
                          target.src = "https://cdn.coverr.co/videos/coverr-doctor-explaining-a-diagnosis-4622/1080p.mp4";
                        }
                      }}
                    />
                  ) : (
                    <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )}

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[8px] font-black uppercase tracking-wider text-white">
                    {item.type === 'video' ? 'Video 4K' : '3D Image'}
                  </div>

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center space-y-2">
                    <p className="text-[9px] font-bold text-white line-clamp-2">{item.prompt}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadMedia(item.url, item.prompt, item.type === 'video');
                      }}
                      className="p-1.5 bg-white/20 hover:bg-white rounded-lg text-white hover:text-slate-900 transition-all"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <Search size={28} className="text-slate-300 mx-auto" />
              <p className="text-[10px] font-black uppercase text-slate-400">Gallery empty</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MedicalIllustrator;
