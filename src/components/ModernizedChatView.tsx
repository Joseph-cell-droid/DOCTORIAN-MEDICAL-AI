import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Plus, Menu, Search, Calendar, UserCheck, 
  Lightbulb, Activity, Check, CheckCheck, Loader2,
  Pill, Thermometer, AlertTriangle, Heart, RefreshCw, X,
  ArrowLeft, History, PlusCircle, ChevronDown, Phone, Video,
  BrainCircuit, BookOpen, Volume2, VolumeX, Trash2, Mic, MicOff,
  Camera, Upload, AlertCircle, FileText, Bot, Sparkles, Stethoscope,
  User, ShieldCheck, Monitor, MessageSquare, Clock, Edit2, Play, Pause,
  PhoneOff, Layers, Settings, FileUp, Copy, ThumbsUp, ThumbsDown, MoreHorizontal
} from 'lucide-react';
import { Doctorian3DRobot } from './Doctorian3DRobot';
import { api } from '../api';
import { cleanAiResponse, ensureModernEmojiInteractivity, extractInteractiveSuggestions } from '../utils/cleanAiResponse';

export interface ModernizedChatViewProps {
  user: any;
  onNavigate?: (view: any) => void;
  onOpenMenu?: () => void;
  onUpdate?: (user: any) => void;
  arduino?: any;
  onUpgradeRequested?: () => void;
  currentLanguage?: string;
  onChangeLanguage?: (lang: string) => void;
  onShowNeuralVisualizer?: () => void;
  initialQuery?: string;
  onSwitchToMatrix?: () => void;
}

interface StructuredItem {
  icon: 'pill' | 'thermometer' | 'alert' | 'heart';
  color: 'blue' | 'purple' | 'amber' | 'cyan';
  title: string;
  desc: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  structuredCard?: {
    intro: string;
    items: StructuredItem[];
    followup?: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  persona: string;
  messages: ChatMessage[];
}

const ModernBotMessageBubble: React.FC<{
  msg: ChatMessage;
  onSendPrompt: (prompt: string) => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}> = ({ msg, onSendPrompt, onSpeak, isSpeaking }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const cleanedText = cleanAiResponse(msg.text);
  const interactiveSuggestions = extractInteractiveSuggestions(cleanedText);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = cleanedText.split('\n');

  return (
    <div className="w-full text-slate-100 space-y-3 pt-0.5">
      {/* Bot Identity Header - Minimalist like ChatGPT */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-cyan-300 text-xs tracking-wide">Doctorian AI</span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">• Clinical Intelligence</span>
        </div>
      </div>

      {/* Formatted Content - Generated directly on the page background */}
      <div className="space-y-2.5 text-[14.5px] sm:text-[15px] leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;

          // Check if line is an emoji header
          const isEmojiHeader = /^[🩺💊💧🌡️🏥💡⚠️✨📋❓📌🚨🧠🫀🔬]/.test(trimmed) && (
            trimmed.endsWith(':') || 
            trimmed.length < 55 || 
            trimmed.includes('Assessment') || 
            trimmed.includes('Actions') || 
            trimmed.includes('Guidelines') || 
            trimmed.includes('Care') || 
            trimmed.includes('Signs') || 
            trimmed.includes('Questions')
          );

          if (isEmojiHeader) {
            return (
              <div
                key={idx}
                className="mt-3.5 pt-1.5 pb-0.5 font-semibold text-cyan-200 flex items-center gap-2 text-[14.5px] sm:text-base tracking-wide"
              >
                <span>{trimmed}</span>
              </div>
            );
          }

          // Bullet point
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            return (
              <div key={idx} className="flex items-start gap-2.5 text-slate-200 pl-1">
                <span className="text-cyan-400 mt-1 shrink-0 text-xs">●</span>
                <span className="font-normal text-[14px] sm:text-[14.5px] leading-relaxed">{trimmed.replace(/^[•\-]\s*/, '')}</span>
              </div>
            );
          }

          // Interactive Question line (contains ❓ or ends with question mark)
          if (trimmed.startsWith('❓') || (trimmed.endsWith('?') && (trimmed.toLowerCase().includes('how') || trimmed.toLowerCase().includes('have you') || trimmed.toLowerCase().includes('do you')))) {
            return (
              <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-cyan-950/25 border-l-2 border-cyan-400 text-cyan-200 font-medium text-xs sm:text-sm flex items-start gap-2.5 mt-2">
                <span className="shrink-0 text-sm sm:text-base">❓</span>
                <span>{trimmed.replace(/^❓\s*/, '')}</span>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-slate-200 font-normal leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Structured Recommendation Items (if present) - clean layout on background */}
      {msg.structuredCard && (
        <div className="mt-3 pt-2 space-y-2">
          {msg.structuredCard.items.map((item, idx) => {
            const iconBg = {
              blue: 'bg-blue-600/20 text-blue-400 border-blue-500/40',
              purple: 'bg-purple-600/20 text-purple-400 border-purple-500/40',
              amber: 'bg-amber-600/20 text-amber-400 border-amber-500/40',
              cyan: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40',
            }[item.color];

            const IconComp = {
              pill: Pill,
              thermometer: Thermometer,
              alert: AlertTriangle,
              heart: Heart,
            }[item.icon];

            return (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${iconBg}`}>
                  <IconComp size={15} />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-white leading-tight">
                    {item.title}
                  </h5>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Quick-Response Chips directly on page background */}
      {interactiveSuggestions.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {interactiveSuggestions.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => onSendPrompt(suggestion)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/60 hover:bg-slate-800/80 text-cyan-200 hover:text-white border border-slate-700/60 hover:border-cyan-400/60 transition-all cursor-pointer active:scale-95 text-left"
              >
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Controls Toolbar - ChatGPT style bottom row on background */}
      <div className="flex items-center gap-2 pt-1 text-slate-400 text-xs">
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          title="Copy response"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
        <button
          type="button"
          onClick={() => onSpeak(cleanedText)}
          className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          title="Listen to audio"
        >
          {isSpeaking ? <VolumeX size={14} className="text-cyan-400 animate-pulse" /> : <Volume2 size={14} />}
        </button>
        <button
          type="button"
          onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
          className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer ${feedback === 'up' ? 'text-emerald-400' : 'text-slate-400'}`}
          title="Helpful"
        >
          <ThumbsUp size={14} />
        </button>
        <button
          type="button"
          onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
          className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer ${feedback === 'down' ? 'text-rose-400' : 'text-slate-400'}`}
          title="Not helpful"
        >
          <ThumbsDown size={14} />
        </button>
        <span className="text-[10px] text-slate-500 font-mono ml-auto">{msg.timestamp}</span>
      </div>
    </div>
  );
};

export const ModernizedChatView: React.FC<ModernizedChatViewProps> = ({
  user,
  onNavigate,
  onOpenMenu,
  onUpdate,
  arduino,
  onUpgradeRequested,
  currentLanguage = 'en',
  onChangeLanguage,
  onShowNeuralVisualizer,
  initialQuery,
  onSwitchToMatrix,
}) => {
  // --- DEFAULT SEED CONVERSATION (Empty initially per user request) ---
  const defaultInitialMessages: ChatMessage[] = [];

  // --- STATE MANAGEMENT ---
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('doctorian_modern_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If the saved sessions have the old pre-seeded mock messages, clear them
          return parsed.map((s: ChatSession) => {
            if (s.messages?.some((m: ChatMessage) => m.id === 'bot-1' || m.id === 'bot-2')) {
              return { ...s, messages: [] };
            }
            return s;
          });
        }
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'session-default',
        title: 'New Consultation',
        createdAt: new Date().toISOString(),
        persona: 'General Clinical',
        messages: [],
      },
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>('session-default');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('doctorian_modern_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.messages) {
          if (parsed[0].messages.some((m: ChatMessage) => m.id === 'bot-1' || m.id === 'bot-2')) {
            return [];
          }
          return parsed[0].messages;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Upper Bar Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [showToolHub, setShowToolHub] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<'lab' | 'obstetric' | 'fluid' | 'soap'>('lab');
  const [isUgandaMOHActive, setIsUgandaMOHActive] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showSmartActions, setShowSmartActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callMode, setCallMode] = useState<'video' | 'voice'>('video');
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'chat' | 'records' | 'meds' | 'tools' | 'profile'>('chat');

  // Interactive Tools state
  const [labHb, setLabHb] = useState('11.8');
  const [labWbc, setLabWbc] = useState('9.4');
  const [labPlt, setLabPlt] = useState('220');
  const [labMalaria, setLabMalaria] = useState('Negative');
  const [labResult, setLabResult] = useState<string | null>(null);

  const [obGestation, setObGestation] = useState('28');
  const [obBpSys, setObBpSys] = useState('130');
  const [obBpDia, setObBpDia] = useState('85');
  const [obProtein, setObProtein] = useState('+1');
  const [obResult, setObResult] = useState<string | null>(null);

  const [fluidWeight, setFluidWeight] = useState('65');
  const [fluidDegree, setFluidDegree] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [fluidResult, setFluidResult] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync session changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('doctorian_modern_sessions', JSON.stringify(sessions));
    } catch {
      // storage quota or private mode
    }
  }, [sessions]);

  // Load session messages when currentSessionId changes
  useEffect(() => {
    const sess = sessions.find((s) => s.id === currentSessionId);
    if (sess) {
      setMessages(sess.messages);
    }
  }, [currentSessionId]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle incoming initial query
  useEffect(() => {
    const saved = localStorage.getItem('doctorian_initial_chat_query');
    if (saved) {
      localStorage.removeItem('doctorian_initial_chat_query');
      handleSendMessage(saved);
    } else if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Call timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVoiceCallModal) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [showVoiceCallModal]);

  // Helper to format call time (00:00)
  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- TEXT TO SPEECH ---
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const clean = text.replace(/[*_#`~]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
      setIsSpeaking(false);
    }
  };

  // --- SPEECH RECOGNITION (Voice Dictation) ---
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLanguage === 'sw' ? 'sw-KE' : 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition init failed', e);
      setIsRecording(false);
    }
  };

  // --- STRUCTURED MEDICAL PARSER ---
  const parseClinicalResponse = (text: string): ChatMessage['structuredCard'] | undefined => {
    const lower = text.toLowerCase();
    const hasStructureKeywords = 
      (lower.includes('rest') || lower.includes('fluid') || lower.includes('hydration')) &&
      (lower.includes('fever') || lower.includes('paracetamol') || lower.includes('medication') || lower.includes('pain')) &&
      (lower.includes('doctor') || lower.includes('hospital') || lower.includes('emergency') || lower.includes('seek'));

    if (!hasStructureKeywords) return undefined;

    return {
      intro: text.split('\n')[0] || "Here are key clinical recommendations based on evidence:",
      items: [
        {
          icon: 'pill',
          color: 'blue',
          title: 'Rest & Hydration',
          desc: 'Drink at least 2.5L of clean water or oral rehydration fluids daily and get adequate bed rest.',
        },
        {
          icon: 'thermometer',
          color: 'purple',
          title: 'Symptom Relief',
          desc: 'Paracetamol or prescribed antipyretics may reduce fever. Avoid NSAIDs if dengue/malaria is suspected.',
        },
        {
          icon: 'alert',
          color: 'amber',
          title: 'When to Seek Urgent Care',
          desc: 'If fever exceeds 39°C, lasts >3 days, or is accompanied by stiff neck or shortness of breath, visit a clinic.',
        },
        {
          icon: 'heart',
          color: 'cyan',
          title: 'Follow-up & Monitoring',
          desc: 'Log temperature twice daily in your Health Log or book an instant teleconsultation.',
        },
      ],
      followup: 'Would you like me to set a medication reminder or book a teleconsultation with a doctor?',
    };
  };

  // --- SEND MESSAGE ---
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    // Update active session messages
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: newMsgs, title: s.title === 'New Consultation' ? text.slice(0, 28) : s.title }
          : s
      )
    );

    try {
      let contextNote = '';
      if (isUgandaMOHActive) {
        contextNote += ' Apply Uganda Clinical Guidelines (UCG 2023/2026) and WHO malaria/infectious disease protocols.';
      }
      if (arduino && arduino.heartRate) {
        contextNote += ` Patient real-time telemetry: HR ${arduino.heartRate} bpm, SpO2 ${arduino.spo2 || 98}%, Temp ${arduino.temperature || 36.8}°C.`;
      }

      const prompt = `Patient symptom/inquiry: "${text}".${contextNote} Provide an empathetic, clear, structured medical response. If prescribing or suggesting supportive care, include clear rest/fluids, medication cautions, and warning signs.`;
      
      const clinicalSystemInstruction = 
        "You are Doctorian AI, an advanced modern clinical intelligence assistant.\n" +
        "MANDATORY FORMATTING INSTRUCTIONS:\n" +
        "1. ZERO ASTERISKS: NEVER use double asterisks (**) or single asterisks (*) anywhere in your response. Do not use markdown bolding like **this**. Present all headings, titles, labels, and text cleanly without asterisks.\n" +
        "2. MANDATORY EMOJIS: You MUST always use rich, friendly, and relevant emojis throughout your entire response (e.g. 🩺, 💊, 💧, 🌡️, 🏥, 🍎, 💡, ✨, 📋, ⚠️, ❤️, 🏃‍♂️, 🛌, 🤝, ❓). Every key section, list bullet, and recommendation MUST begin with an emoji to make the consultation vibrant, modern, and engaging.\n" +
        "3. MODERN STRUCTURE: Organize your consultation into clean, easy-to-read sections using emoji badges:\n" +
        "   🩺 Clinical Assessment\n" +
        "   💡 Recommended Actions\n" +
        "   💊 Medication & Care Guidance\n" +
        "   ⚠️ Warning Signs & Safety\n" +
        "   ❓ Interactive Follow-Up Questions\n" +
        "4. INTERACTIVITY: Always conclude with 1 to 2 caring diagnostic questions (with emojis) asking about their symptoms, duration, or comfort to keep the conversation interactive.";

      const response = await api.ai.aiChat(
        prompt,
        clinicalSystemInstruction,
        "gemini-3.8-flash",
        0.6
      );

      const rawBotText = response?.text || "🩺 Thank you for sharing your symptoms. 💧 Please ensure you remain well-hydrated and rest in a cool space. ⚠️ If your symptoms worsen or persist, please visit your nearest clinic. ❓ How long have you been experiencing this?";
      const botText = ensureModernEmojiInteractivity(cleanAiResponse(rawBotText));
      const structured = parseClinicalResponse(botText);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredCard: structured,
      };

      const finalMsgs = [...newMsgs, botMsg];
      setMessages(finalMsgs);
      speakText(botText);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, messages: finalMsgs } : s
        )
      );
    } catch (err) {
      console.warn("Error getting AI response:", err);
      const fallbackText = "🩺 I have recorded your symptom profile. 💧 Please rest, drink oral rehydration fluids, and visit a health center if your fever or pain intensifies. ❓ Can you let me know if you are having any other symptoms?";
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const finalMsgs = [...newMsgs, botMsg];
      setMessages(finalMsgs);
      speakText(fallbackText);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, messages: finalMsgs } : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- SESSION CONTROLS ---
  const createNewSession = (title: string = 'New Consultation', persona: string = 'General Clinical') => {
    const newId = `session-${Date.now()}`;
    const welcomeMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `Hello! I have started a ${title} session. How can I assist you right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const newSession: ChatSession = {
      id: newId,
      title,
      createdAt: new Date().toISOString(),
      persona,
      messages: [welcomeMsg],
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([welcomeMsg]);
    setShowNewChatDropdown(false);
    setIsSidebarOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert("Cannot delete the only session.");
      return;
    }
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      setCurrentSessionId(filtered[0].id);
      setMessages(filtered[0].messages);
    }
  };

  const renameSession = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = prompt("Enter new session title:", currentTitle);
    if (newTitle && newTitle.trim()) {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: newTitle.trim() } : s))
      );
    }
  };

  // Filter messages by search term
  const filteredMessages = searchTerm
    ? messages.filter((m) => m.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-full w-full bg-[#050b1a] text-slate-100 overflow-hidden select-none font-sans relative">
      {/* Top Ambient Synapse Line (Old One Core Aesthetic) */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 opacity-90 shrink-0 z-30" />

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. COMPREHENSIVE UPPER BAR (Enhanced with the Old One's features) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <header className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800/80 bg-[#070e24]/95 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30 shrink-0 gap-2">
        {/* Left Group: Exit, Menu, Sessions History Drawer, Doctorian Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          {/* Exit Button (Old One) */}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('home') : window.history.back()}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 border border-slate-700/80 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0 shadow-xs"
            title="Exit to Dashboard"
          >
            <ArrowLeft size={14} className="stroke-[3] text-cyan-400" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* Menu Drawer Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenMenu) onOpenMenu();
              else setIsSidebarOpen(true);
            }}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0 border border-slate-700/60"
            title="App Navigation Drawer"
          >
            <Menu size={17} />
          </button>

          {/* Neural Sessions History Button (Old One) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 border border-slate-700/80 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0 shadow-xs"
            title="Session History"
          >
            <History size={14} className="text-blue-400 shrink-0" />
            <span className="hidden md:inline">Sessions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-600 text-white shadow-xs">
              {sessions.length}
            </span>
          </button>

          {/* Doctorian AI Brand with Medical Cross (Matches Photo 2 & Old One) */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
            {/* High-Tech Medical Cross Icon */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600/25 border border-blue-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
              <Activity size={18} className="text-cyan-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-black tracking-tight text-white leading-tight truncate">
                  Doctorian <span className="text-blue-500">AI</span>
                </h2>
                <span className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LIVE
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide truncate">
                Your Health, Our Priority
              </p>
            </div>
          </div>
        </div>

        {/* Right Group: + New Chat, Voice & Video Call, Tools Hub, MOH Guidelines, Search, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar py-0.5">
          {/* New Chat Button with Dropdown Templates (Old One) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowNewChatDropdown(!showNewChatDropdown)}
              className="px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl border border-blue-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
              title="Start New Clinical Session"
            >
              <PlusCircle size={13} />
              <span className="hidden sm:inline">New Chat</span>
              <ChevronDown size={11} className={`transform transition-transform ${showNewChatDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showNewChatDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNewChatDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-[#0a1532] border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-left"
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Clinical Template</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => createNewSession('Clinical Intake Formulator', 'SOAP Note')}
                      className="w-full text-left p-2 hover:bg-blue-950/60 rounded-xl transition-all flex items-start gap-2.5 text-blue-300"
                    >
                      <div className="w-7 h-7 bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-400 shrink-0">
                        <FileText size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">Intake Formulator</p>
                        <p className="text-[8px] text-slate-400 font-medium mt-1">EHR SOAP patient intake note generator</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => createNewSession('Primary Care Consultation', 'General Clinical')}
                      className="w-full text-left p-2 hover:bg-blue-950/60 rounded-xl transition-all flex items-start gap-2.5 text-slate-200"
                    >
                      <div className="w-7 h-7 bg-indigo-900/40 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                        <Bot size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none text-white">Primary Care</p>
                        <p className="text-[8px] text-slate-400 font-medium mt-1">General health & symptom triage</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        createNewSession('Lab Assessment', 'Lab Diagnostics');
                        setActiveToolTab('lab');
                        setShowToolHub(true);
                      }}
                      className="w-full text-left p-2 hover:bg-emerald-950/60 rounded-xl transition-all flex items-start gap-2.5 text-emerald-300"
                    >
                      <div className="w-7 h-7 bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-400 shrink-0">
                        <Activity size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">Lab Interpreter</p>
                        <p className="text-[8px] text-slate-400 font-medium mt-1">Hb, WBC, Platelets, Malaria tests</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        createNewSession('Obstetric Assessment', 'Maternal Triage');
                        setActiveToolTab('obstetric');
                        setShowToolHub(true);
                      }}
                      className="w-full text-left p-2 hover:bg-rose-950/60 rounded-xl transition-all flex items-start gap-2.5 text-rose-300"
                    >
                      <div className="w-7 h-7 bg-rose-900/40 rounded-lg flex items-center justify-center text-rose-400 shrink-0">
                        <AlertCircle size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">Obstetric Risk</p>
                        <p className="text-[8px] text-slate-400 font-medium mt-1">Maternal triage & pre-eclampsia checking</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        createNewSession('Fluid Infusion Resus', 'Emergency Care');
                        setActiveToolTab('fluid');
                        setShowToolHub(true);
                      }}
                      className="w-full text-left p-2 hover:bg-amber-950/60 rounded-xl transition-all flex items-start gap-2.5 text-amber-300"
                    >
                      <div className="w-7 h-7 bg-amber-900/40 rounded-lg flex items-center justify-center text-amber-400 shrink-0">
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">Fluid Infusion</p>
                        <p className="text-[8px] text-slate-400 font-medium mt-1">Dehydration severity & mass resuscitation</p>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Dedicated Voice Call Button on Chatbot's Bar */}
          <button
            type="button"
            onClick={() => {
              setCallMode('voice');
              setShowVoiceCallModal(true);
            }}
            className="px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black rounded-xl border border-emerald-400/60 shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 sm:gap-2 cursor-pointer text-[10px] sm:text-xs uppercase tracking-wider shrink-0 transition-all"
            title="Start Doctorian Voice Call"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-800/80 flex items-center justify-center shrink-0">
              <Phone size={12} className="text-emerald-200 animate-pulse" />
            </div>
            <span className="whitespace-nowrap font-black">Voice Call</span>
          </button>

          {/* Clinical Tools Hub Button (Old One) */}
          <button
            type="button"
            onClick={() => setShowToolHub(!showToolHub)}
            className={`px-2.5 py-1.5 transition-all flex items-center gap-1.5 rounded-xl border text-[9px] sm:text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0 shadow-xs ${
              showToolHub 
                ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-purple-500'
            }`}
            title="Clinical Utilities & Calculators Hub"
          >
            <BrainCircuit size={13} className="text-purple-400" />
            <span className="hidden md:inline">Tools Hub</span>
            <ChevronDown size={11} className={`transform transition-transform ${showToolHub ? 'rotate-180' : ''}`} />
          </button>

          {/* MOH Uganda Guidelines Toggle (Old One) */}
          <button
            type="button"
            onClick={() => setIsUgandaMOHActive(!isUgandaMOHActive)}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-xs ${
              isUgandaMOHActive
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
            title="Uganda Ministry of Health Clinical Protocols 2023/2026"
          >
            <BookOpen size={13} className={isUgandaMOHActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
            <span>MOH Guidelines</span>
          </button>

          {/* Audio TTS Speaker Button */}
          <button
            type="button"
            onClick={() => {
              setIsTtsEnabled(!isTtsEnabled);
              if (isTtsEnabled) window.speechSynthesis?.cancel();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isTtsEnabled
                ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:text-white'
            }`}
            title={isTtsEnabled ? 'Disable Automated Voice Reading' : 'Enable Automated Voice Reading'}
          >
            {isTtsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
            title="Search conversation messages"
          >
            <Search size={15} />
          </button>

          {/* Clear / Reset Chat */}
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to clear this consultation?")) {
                setMessages([
                  {
                    id: `bot-${Date.now()}`,
                    sender: 'bot',
                    text: "Conversation cleared. How can I help you today?",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-700/60 transition-colors cursor-pointer hidden sm:flex"
            title="Clear current chat"
          >
            <Trash2 size={15} />
          </button>

          {/* Optional Switcher to Matrix/Console View if requested */}
          {onSwitchToMatrix && (
            <button
              type="button"
              onClick={onSwitchToMatrix}
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 text-slate-300 hover:text-white text-[9px] font-black uppercase tracking-wider cursor-pointer"
              title="Switch to Neural Matrix View"
            >
              <Monitor size={12} className="text-cyan-400" />
              <span>Matrix</span>
            </button>
          )}

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={() => onNavigate?.('profile')}
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-blue-500/50 overflow-hidden bg-slate-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shrink-0"
            title="User Profile"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                {user?.name?.[0] || 'U'}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Expandable Search Input Row */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-[#0a1532] border-b border-slate-800 flex items-center gap-2 shrink-0 z-20"
          >
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chat messages..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-hidden"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchTerm('');
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. CHAT STREAM (No text initially per user request) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 custom-scrollbar flex flex-col">
        {filteredMessages.length === 0 ? (
          /* Blank Waiting Canvas (ChatGPT style clean waiting state) */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto select-none opacity-40">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2.5">
              <Sparkles size={20} className="text-cyan-400" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Doctorian AI is ready. Waiting for your query...
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`w-full flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} py-1 sm:py-2`}
            >
              {msg.sender === 'user' ? (
                /* User Message */
                <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-xl">
                  <div className="bg-[#1d61f2] text-white p-3.5 sm:p-4 rounded-2xl rounded-tr-xs shadow-md shadow-blue-600/15">
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[10px] text-blue-200 font-mono">
                      <span>{msg.timestamp}</span>
                      <CheckCheck size={14} className="text-cyan-300 stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-blue-400/50 overflow-hidden bg-slate-800 flex items-center justify-center mt-0.5 shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-[10px] text-white">
                        {user?.name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Bot Message: Generated directly on page background like ChatGPT, NO CARDS */
                <div className="flex items-start gap-3 sm:gap-4 w-full max-w-3xl">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 border border-cyan-400/30 shrink-0 mt-0.5">
                    <Sparkles size={16} className="text-cyan-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <ModernBotMessageBubble
                      msg={msg}
                      onSendPrompt={(p) => handleSendMessage(p)}
                      onSpeak={(t) => speakText(t)}
                      isSpeaking={isSpeaking}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator - Generated directly on background */}
        {isLoading && (
          <div className="flex items-start gap-3 sm:gap-4 w-full max-w-3xl py-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 border border-cyan-400/30 shrink-0 mt-0.5">
              <Sparkles size={16} className="text-cyan-200 animate-spin" />
            </div>
            <div className="flex items-center gap-2.5 py-1 text-slate-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-300 font-medium">Doctorian AI is formulating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. RAISED CHATBOT TEXT CARD & BOTTOM BUTTONS CARD */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="mt-auto px-3 sm:px-5 pb-3 sm:pb-5 pt-2 bg-gradient-to-t from-[#040816] via-[#050b1a]/95 to-transparent z-20 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-2.5">
          
          {/* TOP: Raised Chatbot Text Card */}
          <div className="relative bg-[#0c183a]/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl shadow-black/70 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            
            {/* TOP LEFT: Prominently displayed Smart Actions Icons */}
            <div className="flex items-center justify-between pb-2 px-1 border-b border-slate-800/70 mb-2 gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 mr-0.5 shrink-0">
                  <Sparkles size={13} className="text-cyan-400" />
                  <span className="hidden xs:inline">Smart Actions:</span>
                </div>

                {/* 1. Medication Reminder */}
                <button
                  type="button"
                  id="smart-action-reminder"
                  onClick={() => onNavigate ? onNavigate('meds') : alert("Medication Reminders opened")}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white text-[11px] font-medium transition-all shadow-xs active:scale-95 group cursor-pointer"
                  title="Set Medication Reminder"
                >
                  <Calendar size={13} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Reminder</span>
                </button>

                {/* 2. Book Doctor */}
                <button
                  type="button"
                  id="smart-action-doctor"
                  onClick={() => {
                    setCallMode('voice');
                    setShowVoiceCallModal(true);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-white text-[11px] font-medium transition-all shadow-xs active:scale-95 group cursor-pointer"
                  title="Book Doctor Consultation"
                >
                  <UserCheck size={13} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Book Doctor</span>
                </button>

                {/* 3. Clinical Advice */}
                <button
                  type="button"
                  id="smart-action-advice"
                  onClick={() => handleSendMessage("Can you provide evidence-based clinical precautions, dosage details, and differential diagnoses?")}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-white text-[11px] font-medium transition-all shadow-xs active:scale-95 group cursor-pointer"
                  title="Clinical Advice & Guidance"
                >
                  <Lightbulb size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Advice</span>
                </button>

                {/* 4. Lab Tests */}
                <button
                  type="button"
                  id="smart-action-lab"
                  onClick={() => {
                    setActiveToolTab('lab');
                    setShowToolHub(true);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:text-white text-[11px] font-medium transition-all shadow-xs active:scale-95 group cursor-pointer"
                  title="Diagnostic Lab Tests"
                >
                  <Activity size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Lab Tests</span>
                </button>

                {/* 5. Vitals */}
                <button
                  type="button"
                  id="smart-action-vitals"
                  onClick={() => {
                    if (arduino) {
                      handleSendMessage(`Analyze my current bio-telemetry: Heart Rate is ${arduino.heartRate || 72} bpm, Blood Oxygen is ${arduino.spo2 || 98}%, Temperature is ${arduino.temperature || 36.7}°C. Are these within normal limits?`);
                    } else {
                      handleSendMessage("Analyze my vital signs snapshot: HR 72 bpm, SpO2 98%, Temp 36.8°C. What is the clinical interpretation?");
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-[11px] font-medium transition-all shadow-xs active:scale-95 group cursor-pointer"
                  title="Analyze Live Vitals"
                >
                  <Heart size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Vitals</span>
                </button>

                {/* 6. Emergency SOS */}
                <button
                  type="button"
                  id="smart-action-sos"
                  onClick={() => handleSendMessage("🚨 EMERGENCY SOS: The patient has severe difficulty breathing and chest pain. Triage emergency protocols immediately!")}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white text-[11px] font-medium transition-all shadow-xs active:scale-95 group cursor-pointer"
                  title="Emergency SOS"
                >
                  <AlertCircle size={13} className="text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden md:inline">SOS</span>
                </button>

                {/* 7. More Actions Trigger & Popover */}
                <div className="relative">
                  <button
                    type="button"
                    id="chatbot-smart-actions-btn"
                    onClick={() => setShowSmartActions(!showSmartActions)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer shadow-xs active:scale-95"
                    title="All Smart Actions"
                  >
                    <MoreHorizontal size={13} />
                    <span className="text-[10px]">All</span>
                  </button>

                  {/* Smart Actions Popup (Floats neatly above without obstructing the input) */}
                  <AnimatePresence>
                    {showSmartActions && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowSmartActions(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute left-0 bottom-full mb-2 w-72 sm:w-80 bg-[#091533]/98 border border-blue-500/40 rounded-2xl shadow-2xl z-40 p-2.5 space-y-1.5 backdrop-blur-2xl"
                        >
                          <div className="flex items-center justify-between px-1.5 py-1 border-b border-slate-800/80">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                              <Sparkles size={13} className="text-cyan-400" />
                              <span>All Smart Clinical Actions</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowSmartActions(false)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {/* 1. Set Reminder */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowSmartActions(false);
                                onNavigate ? onNavigate('meds') : alert("Medication Reminders opened");
                              }}
                              className="p-2 rounded-xl bg-[#0d1c42]/80 hover:bg-[#152a62] border border-blue-500/30 hover:border-blue-400 text-left transition-all cursor-pointer group active:scale-95"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 shrink-0">
                                  <Calendar size={13} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-white truncate group-hover:text-blue-300">Set Reminder</div>
                                  <div className="text-[9px] text-slate-400 truncate">Medication alerts</div>
                                </div>
                              </div>
                            </button>

                            {/* 2. Book a Doctor */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowSmartActions(false);
                                setCallMode('voice');
                                setShowVoiceCallModal(true);
                              }}
                              className="p-2 rounded-xl bg-[#0d1c42]/80 hover:bg-[#152a62] border border-purple-500/30 hover:border-purple-400 text-left transition-all cursor-pointer group active:scale-95"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-400 shrink-0">
                                  <UserCheck size={13} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-white truncate group-hover:text-purple-300">Book a Doctor</div>
                                  <div className="text-[9px] text-slate-400 truncate">Tele-consultation</div>
                                </div>
                              </div>
                            </button>

                            {/* 3. More Advice */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowSmartActions(false);
                                handleSendMessage("Can you provide more evidence-based clinical precautions, dosage details, and differential diagnoses?");
                              }}
                              className="p-2 rounded-xl bg-[#0d1c42]/80 hover:bg-[#152a62] border border-amber-500/30 hover:border-amber-400 text-left transition-all cursor-pointer group active:scale-95"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-amber-600/30 flex items-center justify-center text-amber-400 shrink-0">
                                  <Lightbulb size={13} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-white truncate group-hover:text-amber-300">More Advice</div>
                                  <div className="text-[9px] text-slate-400 truncate">Precautions & info</div>
                                </div>
                              </div>
                            </button>

                            {/* 4. Lab Analysis */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowSmartActions(false);
                                setActiveToolTab('lab');
                                setShowToolHub(true);
                              }}
                              className="p-2 rounded-xl bg-[#0d1c42]/80 hover:bg-[#152a62] border border-emerald-500/30 hover:border-emerald-400 text-left transition-all cursor-pointer group active:scale-95"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-600/30 flex items-center justify-center text-emerald-400 shrink-0">
                                  <Activity size={13} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-white truncate group-hover:text-emerald-300">Lab Analysis</div>
                                  <div className="text-[9px] text-slate-400 truncate">Tests & diagnostics</div>
                                </div>
                              </div>
                            </button>

                            {/* 5. Check Vitals */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowSmartActions(false);
                                if (arduino) {
                                  handleSendMessage(`Analyze my current bio-telemetry: Heart Rate is ${arduino.heartRate || 72} bpm, Blood Oxygen is ${arduino.spo2 || 98}%, Temperature is ${arduino.temperature || 36.7}°C. Are these within normal limits?`);
                                } else {
                                  handleSendMessage("Analyze my vital signs snapshot: HR 72 bpm, SpO2 98%, Temp 36.8°C. What is the clinical interpretation?");
                                }
                              }}
                              className="p-2 rounded-xl bg-[#0d1c42]/80 hover:bg-[#152a62] border border-cyan-500/30 hover:border-cyan-400 text-left transition-all cursor-pointer group active:scale-95"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-cyan-600/30 flex items-center justify-center text-cyan-400 shrink-0">
                                  <Heart size={13} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-white truncate group-hover:text-cyan-300">Check Vitals</div>
                                  <div className="text-[9px] text-slate-400 truncate">Telemetry review</div>
                                </div>
                              </div>
                            </button>

                            {/* 6. Emergency SOS */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowSmartActions(false);
                                handleSendMessage("🚨 EMERGENCY SOS: The patient has severe difficulty breathing and chest pain. Triage emergency protocols immediately!");
                              }}
                              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/40 hover:border-rose-400 text-left transition-all cursor-pointer group active:scale-95"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-rose-600/30 flex items-center justify-center text-rose-400 shrink-0">
                                  <AlertCircle size={13} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-rose-200 truncate group-hover:text-rose-100">Emergency SOS</div>
                                  <div className="text-[9px] text-rose-300/80 truncate">Immediate triage</div>
                                </div>
                              </div>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right: Mode status */}
              <div className="flex items-center gap-1.5 ml-auto text-[10.5px] text-slate-400 font-mono shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden md:inline text-slate-400">Online</span>
              </div>
            </div>

            {/* Plus Action Popup Menu (opens cleanly above the raised text card) */}
            <AnimatePresence>
              {showPlusMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowPlusMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-2 sm:left-4 bottom-full mb-3 w-72 bg-[#09142f] border border-slate-700/90 rounded-2xl shadow-2xl z-40 p-2 space-y-1 text-left backdrop-blur-xl"
                  >
                    <div className="px-2.5 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Attach & Diagnostic Tools
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPlusMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2.5 text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      <Camera size={16} className="text-blue-400 shrink-0" />
                      <span>Upload Lab Report / Medical Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPlusMenu(false);
                        toggleSpeechRecognition();
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2.5 text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      <Mic size={16} className="text-emerald-400 shrink-0" />
                      <span>Voice Dictation Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPlusMenu(false);
                        if (arduino) {
                          setInputVal(`Vitals snapshot: HR=${arduino.heartRate || 74} bpm, SpO2=${arduino.spo2 || 98}%, Temp=${arduino.temperature || 36.6}°C`);
                        } else {
                          setInputVal("Vitals snapshot: HR=72 bpm, SpO2=99%, Temp=36.8°C");
                        }
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2.5 text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      <Activity size={16} className="text-cyan-400 shrink-0" />
                      <span>Attach Current Bio-Telemetry</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPlusMenu(false);
                        handleSendMessage("🚨 EMERGENCY SOS: The patient has severe difficulty breathing and chest pain. Triage emergency protocols immediately!");
                      }}
                      className="w-full text-left p-2.5 hover:bg-rose-950/60 rounded-xl transition-all flex items-center gap-2.5 text-rose-300 text-xs font-semibold cursor-pointer"
                    >
                      <AlertCircle size={16} className="text-rose-400 shrink-0" />
                      <span>Emergency SOS Dispatch</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleSendMessage(`[Attached clinical document: ${file.name}] - Please review and interpret.`);
                }
              }}
            />

            {/* Input Form with Plus Button, Text Input, Mic & Send */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 sm:gap-3"
            >
              {/* Circular Plus Button */}
              <button
                type="button"
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                className="w-10 h-10 rounded-full bg-[#08122a] border border-slate-700 hover:border-blue-500 flex items-center justify-center text-slate-300 hover:text-white shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Attach clinical photo or vitals"
              >
                <Plus size={20} className={showPlusMenu ? 'rotate-45 transition-transform text-blue-400' : 'transition-transform'} />
              </button>

              {/* Pill Input */}
              <div className="flex-1 relative flex items-center bg-[#08122a] rounded-full border border-slate-700/90 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 px-4 py-1.5 transition-all">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Type your clinical question or symptom..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-hidden py-1"
                />

                {/* Voice Dictation Mic inside Pill */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer mr-1 ${
                    isRecording ? 'text-rose-400 animate-pulse bg-rose-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                  title={isRecording ? 'Listening... click to stop' : 'Click to speak'}
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>

              {/* Royal Blue Send Button */}
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
                title="Send Message"
              >
                <Send size={18} className="translate-x-0.5" />
              </button>
            </form>
          </div>

          {/* Medical Disclaimer */}
          <p className="text-[9px] text-center text-slate-400 font-medium tracking-wide">
            Doctorian AI provides clinical decision support • In an emergency, call your local medical facility immediately.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 6. SLIDE-OVER SESSIONS HISTORY DRAWER (Old One Feature) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#070e24] border-r border-slate-800 z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-blue-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Consultation Sessions</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action: + New Session */}
              <div className="p-3 border-b border-slate-800/80">
                <button
                  type="button"
                  onClick={() => createNewSession('New Consultation', 'General Clinical')}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Plus size={16} />
                  <span>Start New Session</span>
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {sessions.map((sess) => {
                  const isActive = currentSessionId === sess.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => {
                        setCurrentSessionId(sess.id);
                        setMessages(sess.messages);
                        setIsSidebarOpen(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-white">{sess.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-400 font-mono">
                            <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {sess.persona}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => renameSession(sess.id, sess.title, e)}
                            className="p-1 rounded text-slate-400 hover:text-white"
                            title="Rename"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => deleteSession(sess.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{sessions.length} sessions stored</span>
                <span className="text-cyan-400 font-bold">Secure Local Vault</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 7. VOICE & VIDEO CONSULTATION SUITE MODAL (Old One Feature) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showVoiceCallModal && (
          <div className="fixed inset-0 z-[200] w-screen h-screen bg-slate-950 flex flex-col font-sans select-none overflow-hidden text-white">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Stethoscope size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black tracking-wide text-white">DOCTORIAN TELEHEALTH SUITE</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> CONNECTED
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-300 font-medium">Dr. Joseph EBRO • Senior Clinical Consultant</p>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCallMode('video')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    callMode === 'video'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video size={13} />
                  <span>HD Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCallMode('voice')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    callMode === 'voice'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone size={13} />
                  <span>Voice Only</span>
                </button>
              </div>

              {/* Close / End Call */}
              <button
                type="button"
                onClick={() => setShowVoiceCallModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-6 bg-gradient-to-b from-slate-950 via-[#06122d] to-slate-950">
              {/* Doctor Avatar / Video */}
              <div className="relative flex flex-col items-center">
                <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border-4 border-cyan-400/50 p-2 shadow-[0_0_50px_rgba(6,182,212,0.35)] relative overflow-hidden bg-gradient-to-b from-blue-900 to-slate-900 flex items-center justify-center">
                  <Doctorian3DRobot size="lg" isAvatar={false} />
                  {/* Waveform Pulse ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-25 pointer-events-none" />
                </div>

                <div className="text-center mt-6 space-y-1">
                  <h3 className="text-xl font-black text-white tracking-wide">Doctorian Tele-Clinical Specialist</h3>
                  <p className="text-xs text-cyan-300 font-mono">Real-Time Audio Consultation • Call Duration: {formatCallTime(callDuration)}</p>
                  <p className="text-xs text-slate-400 max-w-md pt-2">
                    "I am listening to your breathing and symptom reports. Speak freely, and I will analyze clinical risk parameters in real-time."
                  </p>
                </div>

                {/* Animated Audio Frequency Bars */}
                <div className="flex items-center gap-1.5 mt-6 h-8">
                  {[12, 28, 16, 32, 24, 18, 36, 20, 14, 26, 30, 16].map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{ height: [h * 0.4, h, h * 0.4] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.08 }}
                      className="w-1.5 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full"
                      style={{ height: h }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Call Control Dock */}
            <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isCallMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isCallMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isCallMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  speakText("Consultation note generated. Please follow the hydration and fever management protocols outlined in your session.");
                  setShowVoiceCallModal(false);
                }}
                className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
              >
                <PhoneOff size={18} />
                <span>End Consultation</span>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 8. CLINICAL TOOLS HUB MODAL (Old One Feature) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToolHub && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowToolHub(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-[#070e24] border-t border-slate-800 rounded-t-3xl z-50 flex flex-col shadow-2xl overflow-hidden max-w-2xl mx-auto"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={20} className="text-purple-400" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Clinical Tools & Calculators</h3>
                    <p className="text-[10px] text-slate-400">Uganda MoH & WHO Certified Algorithms</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowToolHub(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 p-3 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveToolTab('lab')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeToolTab === 'lab' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Lab Interpreter
                </button>
                <button
                  type="button"
                  onClick={() => setActiveToolTab('obstetric')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeToolTab === 'obstetric' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Obstetric Risk
                </button>
                <button
                  type="button"
                  onClick={() => setActiveToolTab('fluid')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeToolTab === 'fluid' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Fluid Resus
                </button>
                <button
                  type="button"
                  onClick={() => setActiveToolTab('soap')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeToolTab === 'soap' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  SOAP Note
                </button>
              </div>

              {/* Tool Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {activeToolTab === 'lab' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-white text-sm">Automated Lab Interpreter (CBC & Malaria RDT)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hemoglobin (Hb g/dL)</label>
                        <input
                          type="text"
                          value={labHb}
                          onChange={(e) => setLabHb(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">WBC Count (x10^9/L)</label>
                        <input
                          type="text"
                          value={labWbc}
                          onChange={(e) => setLabWbc(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Platelets (x10^9/L)</label>
                        <input
                          type="text"
                          value={labPlt}
                          onChange={(e) => setLabPlt(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Malaria RDT</label>
                        <select
                          value={labMalaria}
                          onChange={(e) => setLabMalaria(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        >
                          <option value="Negative">Negative</option>
                          <option value="Positive (P. falciparum)">Positive (P. falciparum)</option>
                          <option value="Positive (Mixed)">Positive (Mixed)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const hbNum = parseFloat(labHb);
                        let analysis = `Lab Report: Hb is ${labHb} g/dL (${hbNum < 11 ? 'Mild Anemia' : 'Normal range'}). WBC ${labWbc}, Platelets ${labPlt}. Malaria RDT: ${labMalaria}.`;
                        if (labMalaria.includes('Positive')) {
                          analysis += " Immediate Artemether-Lumefantrine (AL) protocol indicated under Uganda MOH Guidelines.";
                        }
                        setLabResult(analysis);
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-colors"
                    >
                      Interpret Lab Results
                    </button>

                    {labResult && (
                      <div className="p-3 bg-blue-950/40 border border-blue-600/40 rounded-xl text-blue-200">
                        <p>{labResult}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowToolHub(false);
                            handleSendMessage(labResult);
                          }}
                          className="mt-2 text-cyan-400 font-bold underline"
                        >
                          Insert into chat consultation →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeToolTab === 'obstetric' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-white text-sm">Obstetric & Pre-eclampsia Risk Engine</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Gestation (Weeks)</label>
                        <input
                          type="text"
                          value={obGestation}
                          onChange={(e) => setObGestation(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Urine Protein</label>
                        <select
                          value={obProtein}
                          onChange={(e) => setObProtein(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        >
                          <option value="Nil">Nil</option>
                          <option value="Trace">Trace</option>
                          <option value="+1">+1</option>
                          <option value="+2">+2 (High)</option>
                          <option value="+3">+3 (Severe)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Systolic BP (mmHg)</label>
                        <input
                          type="text"
                          value={obBpSys}
                          onChange={(e) => setObBpSys(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Diastolic BP (mmHg)</label>
                        <input
                          type="text"
                          value={obBpDia}
                          onChange={(e) => setObBpDia(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const sys = parseInt(obBpSys, 10);
                        const dia = parseInt(obBpDia, 10);
                        const isSevere = sys >= 160 || dia >= 110;
                        const isHigh = sys >= 140 || dia >= 90;
                        let outcome = `Maternal Assessment at ${obGestation} weeks: BP ${sys}/${dia} mmHg with ${obProtein} proteinuria.`;
                        if (isSevere) {
                          outcome += " ⚠️ SEVERE PRE-ECLAMPSIA RISK. Immediate referral, Magnesium Sulfate loading protocol advised.";
                        } else if (isHigh) {
                          outcome += " ⚠️ Moderate Gestational Hypertension / Pre-eclampsia alert. Close monitoring required.";
                        } else {
                          outcome += " Normotensive obstetric parameters. Standard ANC follow-up.";
                        }
                        setObResult(outcome);
                      }}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-white transition-colors"
                    >
                      Calculate Pre-eclampsia Risk
                    </button>

                    {obResult && (
                      <div className="p-3 bg-rose-950/40 border border-rose-600/40 rounded-xl text-rose-200">
                        <p>{obResult}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowToolHub(false);
                            handleSendMessage(obResult);
                          }}
                          className="mt-2 text-cyan-400 font-bold underline"
                        >
                          Insert into chat consultation →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeToolTab === 'fluid' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-white text-sm">Fluid Infusion Resuscitation Calculator</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Patient Weight (kg)</label>
                        <input
                          type="text"
                          value={fluidWeight}
                          onChange={(e) => setFluidWeight(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dehydration Level</label>
                        <select
                          value={fluidDegree}
                          onChange={(e) => setFluidDegree(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                        >
                          <option value="mild">Plan A: Mild / No Dehydration (Home ORS)</option>
                          <option value="moderate">Plan B: Some Dehydration (Clinic ORS)</option>
                          <option value="severe">Plan C: Severe Dehydration (IV Ringer's)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const wt = parseFloat(fluidWeight) || 60;
                        let text = '';
                        if (fluidDegree === 'mild') {
                          text = `Plan A Rehydration for ${wt}kg patient: 100-200ml ORS after each loose stool + maintenance clean water.`;
                        } else if (fluidDegree === 'moderate') {
                          const ors = Math.round(wt * 75);
                          text = `Plan B Rehydration for ${wt}kg patient: Administer ${ors}ml ORS over 4 hours under clinical observation.`;
                        } else {
                          const ivTotal = Math.round(wt * 100);
                          text = `Plan C IV Resuscitation for ${wt}kg patient: Total ${ivTotal}ml IV Ringer's Lactate (30ml/kg in first 30min, then 70ml/kg over 2.5 hours).`;
                        }
                        setFluidResult(text);
                      }}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white transition-colors"
                    >
                      Compute Infusion Regimen
                    </button>

                    {fluidResult && (
                      <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl text-amber-200">
                        <p>{fluidResult}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowToolHub(false);
                            handleSendMessage(fluidResult);
                          }}
                          className="mt-2 text-cyan-400 font-bold underline"
                        >
                          Insert into chat consultation →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeToolTab === 'soap' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold text-white text-sm">Interactive EHR SOAP Generator</h4>
                    <p className="text-slate-400">
                      Click below to generate a standardized clinical SOAP note based on the ongoing consultation messages.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowToolHub(false);
                        handleSendMessage("Please formulate a complete clinical SOAP Note (Subjective, Objective, Assessment, Plan) based on our discussion.");
                      }}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-colors"
                    >
                      Generate SOAP Note from Chat
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
