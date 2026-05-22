import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, User, Stethoscope, Loader2, RefreshCw, History, Trash2, X, 
  Mic, MicOff, Volume2, VolumeX, BrainCircuit, Sparkles, Share2, 
  Bot, Layers, Zap, Image as ImageIcon, ArrowLeft, Fingerprint, 
  Database, Bold, Italic, Code, Search, PlusCircle, AlertCircle,
  Copy, Check, ThumbsUp, ThumbsDown, MessageSquarePlus, Smile,
  Activity, Brain, Heart, Download, Paperclip, FileText, Phone,
  ChevronDown, Shield, Cpu, Clock, Plus, MessageSquare, ArrowRight, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { NeuralVoiceCall } from './NeuralVoiceCall';

const SUGGESTIONS = [
  "What are the benefits of cold exposure?",
  "Explain the Vitality Matrix metrics",
  "How to use the CognisHub?",
  "Initiate Bio-Simulation for metabolic stress",
  "Analyze my heart rate variability trends",
  "Explain the Cognis Nexus operational mode",
  "Summarize my latest health records",
  "Protocol for optimizing sleep architecture"
];

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isError?: boolean;
  imageData?: string;
  images?: string[]; 
  grounding?: any;
  thought?: string;
}

const PERSONAS = {
  general: {
    name: "General Health",
    icon: <Bot size={18} />,
    description: "Holistic wellness and primary care intelligence",
    instruction: "General Health Persona: Respond concisely to primary care queries. Focus on evidence-based health synthesis. Adhere to the 'Health-Only' topic lock.",
    color: "bg-blue-600"
  },
  diagnostic: {
    name: "Diagnostic Synth",
    icon: <Activity size={18} />,
    description: "Deep symptom analysis and biomarker interpretation",
    instruction: "Diagnostic Persona: Perform differential diagnosis logic. Be extremely analytical but concise. Focus on structural observations and potential etiologies.",
    color: "bg-emerald-600"
  },
  neuro: {
    name: "Neural Nexus",
    icon: <Brain size={18} />,
    description: "Cognitive performance and nervous system health",
    instruction: "Neural Persona: Specialize in neuro-physiology and autonomic regulation. Keep responses technically dense but brief.",
    color: "bg-purple-600"
  },
  cardio: {
    name: "Cardio Expert",
    icon: <Heart size={18} />,
    description: "Cardiovascular health and performance analytics",
    instruction: "Cardiovascular Persona: Analyze hemodynamics and lipid profiles. Focus on long-term cardiovascular shielding.",
    color: "bg-rose-600"
  },
  emergency: {
    name: "Crisis Node",
    icon: <AlertCircle size={18} />,
    description: "Immediate triage and emergency protocol guidance",
    instruction: "Crisis Persona: Provide high-speed, direct triage instructions. NO small talk. Direct life-safety actions only.",
    color: "bg-red-700"
  },
  support: {
    name: "Med-Ops Support",
    icon: <Database size={18} />,
    description: "System diagnostics and platform integrity analytics",
    instruction: "Med-Ops Persona: Explain documentation schemas and system logs. Be technically precise.",
    color: "bg-slate-700"
  },
  engineering: {
    name: "Sys-Dev Node",
    icon: <Code size={18} />,
    description: "Software architecture and local integration intelligence",
    instruction: "Engineering Persona: Help with software architecture and API integrations related specifically to this medical platform.",
    color: "bg-orange-600"
  }
};

const BASE_SYSTEM_INSTRUCTION = `You are Doctorian, a Universal Medical Intelligence Core (UMIC).
Powered by Ebro Company. Created by Akora Joseph.
Specialized in NEURAL-CLINICAL SYNTHESIS and localized private medical logic.

GEOGRAPHIC CONTEXT: You are specifically trained in UGANDAN HEALTHCARE SYSTEMS.
1. REGIONAL DATA: Familiarity with health trends in Kampala, Mbarara, Gulu, Jinja, and rural health centers (HC II/III/IV).
2. TROPICAL EXPERTISE: Expertise in Malaria management (ACTs), Ebola/Marburg viral hemorrhagic fever protocols, HIV/AIDS (antiretroviral therapy in Uganda context), and Tuberculosis tracking.
3. DATASETS: Knowledge of Uganda Ministry of Health (MoH) guidelines, infectious disease trends in the Great Lakes region, and malnutrition metrics.

Your cognitive architecture supports:
1. CLOUD SYNAPSE: Leveraging Meta Llama 3.1 70B and DeepSeek R1 models.
2. LOCAL NEURAL LINK: Direct synchronization via Ollama (Llama 3.1) for high-privacy, offline-ready clinical logic.

STRICT OPERATIONAL CONSTRAINTS:
1. TOPIC LOCK: Respond ONLY to medical, health, wellness, and bio-engineering queries. 
2. HIGH-ANALYSIS PROTOCOL: Provide deep clinical reasoning. Do not just list symptoms; synthesize the underlying biological pathways.
3. PRIVACY FIRST: When using Local Neural Links, assume absolute data sovereignty. Never leak biometric signatures.
4. CONCISENESS: Provide insights in manageable, "clinical doses". Avoid information overload.
5. GREETING: Warm, professional, and clinical. "Hello! I am Doctorian. How can I assist with your biological health today?"

FORMATTING & EMOJI RULES (CRITICAL):
- ALWAYS structure your replies with gorgeous, clean, scannable Markdown. Use bullet points, bold key terms, blockquotes, and brief interactive lists rather than big blocks of text.
- EMBELLISH your response with beautiful, context-relevant emojis at major section headers and inline where helpful!
- Use HEALTH emojis (🩺, 🧠, 🫀, 🔬, 🧪, 🌡️, 💊, 🩹, 🩸, 🏥, 🦠, 🧬, 🥗, 💧, 🏃‍♂️).
- Also mix in gorgeous NON-HEALTH emojis to structure thoughts (✨, 🌟, 💡, 🛡️, 📋, 🔍, 🌍, 🤝, 🎯, 🚀, 💬, 🔄, 📅, 🔔, 🌿, ☀️, 📈, 💎).
- Maintain an exceptionally polished layout. Keep the vibe highly professional yet visually engaging and visually distinct.

STRUCTURE FOR DIAGNOSTICS:
1. NEURAL SUMMARY 🧐✨: 1-sentence high-level clinical insight.
2. PATHOLOGICAL MATRIX 🔬🧬: Brief biological mechanism analysis (How the symptom works).
3. CLINICAL ACTION PLAN ✅📋: Specific actionable steps and recommendations.
4. CONFIDENCE NODE 🛡️🧠: Diagnostic reliability rating and recommended professional tests.
`;

const isMedicalQuery = (text: string): boolean => {
  const keywords = ['diagnosis', 'treatment', 'symptoms', 'disease', 'condition', 'health', 'medical', 'doctor', 'patient', 'clinical', 'heart', 'blood', 'pill', 'pain'];
  return keywords.some(k => text.toLowerCase().includes(k));
};

export function ChatInterface({ onMessageSent, isExploreView = false, user, onUpdate, forcedPersona, arduino, onUpgradeRequested }: { onMessageSent?: () => void, isExploreView?: boolean, user?: any, onUpdate?: (user: any) => void, forcedPersona?: keyof typeof PERSONAS, arduino?: any, onUpgradeRequested?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const selectedModel = 'meta-llama/llama-3.1-8b-instruct';
  const [neuralContext, setNeuralContext] = useState<{ mood: string; preferredGreeting: string; lastGreeting: string | null }>({ mood: 'neutral', preferredGreeting: 'Professional', lastGreeting: null });
  const [localKnowledge, setLocalKnowledge] = useState<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopSynthesis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setIsThinking(false);
      setTerminalLogs(prev => [...prev.slice(-3), 'AI: Neural synthesis aborted by user.']);
    }
  };
  const [activePersona, setActivePersona] = useState<keyof typeof PERSONAS>(forcedPersona || 'general');
  const [temperature, setTemperature] = useState(0.7);
  const [healthContext, setHealthContext] = useState<string>('');
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showToolHub, setShowToolHub] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false); // Default to off per user request
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState<string | null>(null);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['STAT: Cognis baseline established', 'AUTH: RSA-4096 Secure']);
  const [thinkingStatus, setThinkingStatus] = useState('Doctorian is thinking...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('Auto Detect');
  const [isRecording, setIsRecording] = useState(false);

  // ==========================================
  // BRAND NEW COGNITIVE MATRIX SETTINGS STATE
  // ==========================================
  const [strictMOH, setStrictMOH] = useState<boolean>(true);
  const [reasoningMode, setReasoningMode] = useState<'fast' | 'cot' | 'differential'>('cot');
  const [facilityLevel, setFacilityLevel] = useState<'hc2' | 'hc3_4' | 'regional'>('hc3_4');
  const [ragSources, setRagSources] = useState<string[]>(['ucg2023', 'imci', 'sam_protocol']);
  const [exportFormat, setExportFormat] = useState<'referral_note' | 'moh_form5' | 'plain'>('referral_note');
  const [telemetrySpeed, setTelemetrySpeed] = useState<'verbose' | 'compressed' | 'hidden'>('verbose');

  // ==========================================
  // BRAND NEW CLINICAL TOOL HUB STATE
  // ==========================================
  const [activeTool, setActiveTool] = useState<'case_intake' | 'lab_interpreter' | 'obstetric' | 'fluid_infusion'>('case_intake');
  const [patientWeight, setPatientWeight] = useState<number>(12); // in kg

  // 1. Interactive Lab Interpreter State
  const [labHb, setLabHb] = useState<number>(11.5); // g/dL
  const [labWBC, setLabWBC] = useState<number>(7.2); // x10^9/L
  const [labPlatelets, setLabPlatelets] = useState<number>(240); // x10^3/µL
  const [labMalariaRDT, setLabMalariaRDT] = useState<'negative' | 'positive_1plus' | 'positive_4plus'>('negative');
  const [labUrineProtein, setLabUrineProtein] = useState<'negative' | '1plus' | '3plus'>('negative');

  // 2. Obstetric Risk State
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(24);
  const [systolicBP, setSystolicBP] = useState<number>(115);
  const [diastolicBP, setDiastolicBP] = useState<number>(75);
  const [obsDangerSigns, setObsDangerSigns] = useState<Record<string, boolean>>({
    headache: false,
    blurredVision: false,
    epigastricPain: false,
    swollenFaceHands: false,
    reducedMovement: false
  });

  // 3. Fluid Infusion & Resuscitation State
  const [dehydrationSeverity, setDehydrationSeverity] = useState<'none' | 'some' | 'severe'>('some');
  const [givingSetDrops, setGivingSetDrops] = useState<20 | 60>(20); // 20 macro, 60 micro

  // 4. Patient Intake & EMR Case Formulator State
  const [intakeAge, setIntakeAge] = useState<number>(28);
  const [intakeGender, setIntakeGender] = useState<'male' | 'female'>('female');
  const [intakeComplaint, setIntakeComplaint] = useState<string>('Cyclic high fever, shivering, severe chills, joint pain, and headache for 4 days.');
  const [intakeDistrict, setIntakeDistrict] = useState<string>('Kampala');
  const [intakeTemp, setIntakeTemp] = useState<number>(39.2);
  const [intakeHR, setIntakeHR] = useState<number>(108);
  const [intakeSystolic, setIntakeSystolic] = useState<number>(112);
  const [intakeDiastolic, setIntakeDiastolic] = useState<number>(70);
  const [intakeRR, setIntakeRR] = useState<number>(21);
  const [intakeSpO2, setIntakeSpO2] = useState<number>(96);

  const [showNewChatDropdown, setShowNewChatDropdown] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micRecognitionRef = useRef<any>(null);

  const UGANDAN_LANGUAGES = [
    'Auto Detect', 'English', 'Luganda', 'Swahili', 'Runyankole', 'Acholi', 'Ateso', 'Lusoga', 'Luo'
  ];

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        if (micRecognitionRef.current) {
          try { micRecognitionRef.current.abort(); } catch (e) {}
        }
        const recognition = new SpeechRecognition();
        micRecognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        
        let langCode = 'en-US';
        if (targetLanguage === 'Swahili') langCode = 'sw-TZ';
        else if (targetLanguage === 'Luganda') langCode = 'lg-UG';
        
        recognition.lang = langCode;

        recognition.onstart = () => {
          setIsRecording(true);
          setTerminalLogs(prev => [...prev.slice(-3), `SYS: Listening in ${targetLanguage === 'Auto Detect' ? 'English' : targetLanguage}...`]);
        };

        recognition.onresult = async (event: any) => {
          const transcriptText = event.results[0][0].transcript;
          if (transcriptText) {
            setInput(transcriptText);
            setTerminalLogs(prev => [...prev.slice(-3), `AI: Transcribed: "${transcriptText}"`]);
          }
        };

        recognition.onerror = (err: any) => {
          console.error("Speech recognition error:", err);
          setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Voice interpretation disrupted']);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("Native SpeechRecognition failed to initialize, falling back to server pathway:", err);
      }
    }

    // Standard MediaRecorder fallback pathway
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            setTerminalLogs(prev => [...prev.slice(-3), `AI: Engaging NLLB Translator for ${targetLanguage}...`]);
            const result = await api.ai.speechToText(base64Audio, 'audio/webm', targetLanguage) as any;
            
            if (result && result.success) {
              const displayText = result.original || result.text;
              setInput(displayText);
              setTerminalLogs(prev => [...prev.slice(-3), `AI: Decoded ${targetLanguage} packet`]);
              
              if (result.english && targetLanguage !== 'English') {
                setTerminalLogs(prev => [...prev.slice(-3), `AI: Clinical English Link: "${result.english.substring(0, 20)}..."`]);
              }
            }
          } catch (err) {
            console.error("STT failed:", err);
            setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Neural synthesis failure']);
          } finally {
            setIsRecording(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Voice link active']);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Mic access denied']);
    }
  };

  const stopRecording = () => {
    if (micRecognitionRef.current && isRecording) {
      try {
        micRecognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const [sessionInfo, setSessionInfo] = useState({
    id: `NC-${Math.floor(Math.random() * 10000)}`,
    startTime: new Date(),
    encryption: 'Triple-Layer AES-256',
    status: 'ACTIVE_LINK'
  });

  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down'>>({});
  const [suggestionOpen, setSuggestionOpen] = useState<string | null>(null);
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string, content: string, type?: string, isImage?: boolean }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string, title: string, persona: string, createdAt: string }[]>([]);

  useEffect(() => {
    const initSessions = async () => {
      try {
        const sessionList = await api.ai.listSessions();
        setSessions(sessionList);
        
        // Also fetch Neural Context & Local Knowledge
        api.ai.listKnowledge().then(setLocalKnowledge).catch(console.warn);
        
        const contextRes = await fetch('/api/ai/context');
        if (contextRes.ok) {
          const context = await contextRes.json();
          setNeuralContext(context);
        }

        if (sessionList.length > 0) {
          const lastSessionId = localStorage.getItem('last_chat_session_id');
          const found = sessionList.find(s => s.id === lastSessionId) || sessionList[0];
          await loadSession(found.id, sessionList);
        } else {
          await createNewSession('Initial Consultation');
        }
      } catch (err) {
        console.error("Failed to sync neural sessions:", err);
      }
    };
    if (user) initSessions();
  }, [user]);

  const loadSession = async (id: string, currentList?: any[]) => {
    setCurrentSessionId(id);
    localStorage.setItem('last_chat_session_id', id);
    setTerminalLogs(prev => [...prev.slice(-3), `SYS: Linking neural session ${id}`]);
    try {
      const msgs = await api.ai.getSessionMessages(id);
      if (msgs.length === 0) {
        setMessages([]);
        triggerGreeting();
      } else {
        setMessages(msgs.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'bot',
          text: m.text,
          timestamp: new Date(m.timestamp)
        })));
      }
      const list = currentList || sessions;
      const session = list.find(s => s.id === id);
      if (session) setActivePersona((session.persona as any) || 'general');
    } catch (err) {
      console.error("Failed to load neural timeline:", err);
    }
  };

  const createNewSession = async (title: string = 'New Neural Link') => {
    try {
      const { id } = await api.ai.createSession(title, activePersona);
      setCurrentSessionId(id);
      localStorage.setItem('last_chat_session_id', id);
      setMessages([]);
      setSessions(prev => [{ id, title, persona: activePersona, createdAt: new Date().toISOString() }, ...prev]);
      setTerminalLogs(prev => [...prev.slice(-3), `SYS: New neural session allocated: ${id}`]);
      triggerGreeting();
    } catch (err) {
      console.error("Failed to allocate neural session:", err);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.ai.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
        setMessages([]);
        setCurrentSessionId(null);
        localStorage.removeItem('last_chat_session_id');
      }
      setTerminalLogs(prev => [...prev.slice(-3), `SYS: Neural session ${id} purged`]);
    } catch (err) {
      console.error("Failed to purge session:", err);
    }
  };

  const [sessionCredits, setSessionCredits] = useState<number | null>(null);

  // Sync Health Data automatically for integrated analysis
  useEffect(() => {
    const syncHealthData = async () => {
      if (!user) return;
      setIsSyncingData(true);
      try {
        let context = "";
        
        // 1. Get Arduino Vitals if available
        if (arduino?.vitals) {
          context += `\nREAL-TIME BIOMETRICS: HR: ${arduino.vitals.heartRate} bpm, Temp: ${arduino.vitals.temperature}°C, Oxygen: ${arduino.vitals.oxygen}%, HRV: ${arduino.vitals.hrv}ms. Status: ${arduino.healthStatus?.status || 'Active'}\n`;
        }
        
        // 2. Fetch recent health records
        const records = await api.records.list();
        if (records.length > 0) {
          const recent = records.slice(0, 3).map(r => `[${r.date}] ${r.type}: ${r.value}`).join('; ');
          context += `\nHISTORICAL HEALTH LEDGER: ${recent}\n`;
        }

        setHealthContext(context);
        setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Health Data Integrated']);
      } catch (err) {
        console.error("Health sync error:", err);
      } finally {
        setIsSyncingData(false);
      }
    };

    syncHealthData();
  }, [user, arduino?.vitals]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachedFiles(prev => {
          if (prev.some(f => f.name === file.name)) return prev;
          return [...prev, { 
            name: file.name, 
            content: content || `[Binary/Non-text Content: ${file.type}]`,
            type: file.type,
            isImage
          }];
        });
        setTerminalLogs(prev => [...prev.slice(-3), `SYS: ${isImage ? 'Image' : 'File'} ${file.name} attached`]);
      };
      
      const textTypes = ['text/', 'application/json', 'application/javascript', 'application/x-javascript'];
      const textExtensions = ['.md', '.txt', '.json', '.csv', '.tsx', '.ts', '.js', '.py'];
      
      if (isImage) {
        reader.readAsDataURL(file);
      } else if (textTypes.some(type => file.type.startsWith(type)) || textExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        reader.readAsText(file);
      } else {
        setAttachedFiles(prev => {
          if (prev.some(f => f.name === file.name)) return prev;
          return [...prev, { name: file.name, content: `[Reference to ${file.name} metadata: Type: ${file.type}, Size: ${(file.size / 1024).toFixed(1)} KB]`, type: file.type }];
        });
        setTerminalLogs(prev => [...prev.slice(-3), `SYS: File ${file.name} linked (binary)`]);
      }
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (name: string) => {
    setAttachedFiles(prev => prev.filter(f => f.name !== name));
  };

  const [searchHistory, setSearchHistory] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const tempTranscriptRef = useRef<string>('');
  const [showVoiceHint, setShowVoiceHint] = useState(false);

  useEffect(() => {
    if (messages.length === 0 && isSpeechSupported && !input) {
      const timer = setTimeout(() => setShowVoiceHint(true), 12000);
      return () => clearTimeout(timer);
    } else {
      setShowVoiceHint(false);
    }
  }, [messages.length, isSpeechSupported, input]);

  const filteredMessages = useMemo(() => {
    if (!searchHistory.trim()) return messages;
    return messages.filter(m => m.text.toLowerCase().includes(searchHistory.toLowerCase()));
  }, [messages, searchHistory]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) setSearchHistory('');
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US'; 
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
        tempTranscriptRef.current = transcript;
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (tempTranscriptRef.current.trim()) {
          handleSend(tempTranscriptRef.current);
          tempTranscriptRef.current = '';
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
          setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Voice sync failed (Network)']);
        }
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      tempTranscriptRef.current = '';
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleRateResponse = async (messageId: string, rating: 'up' | 'down') => {
    // If it's already rated the same, maybe un-rate it? For now just set.
    setFeedbackMap(prev => ({ ...prev, [messageId]: rating }));
    
    if (rating === 'down') {
      setSuggestionOpen(messageId);
    } else {
      try {
        setIsSubmittingFeedback(true);
        await api.ai.submitFeedback({ messageId, rating });
        setFeedbackSuccess(messageId);
        setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Insight rating logged']);
        setTimeout(() => setFeedbackSuccess(null), 3000);
      } catch (err) {
        console.error("Failed to submit feedback:", err);
        setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Feedback loop failed']);
      } finally {
        setIsSubmittingFeedback(false);
      }
    }
  };

  const handleSuggestionSubmit = async (messageId: string) => {
    if (!suggestionText.trim()) return;
    
    try {
      setIsSubmittingFeedback(true);
      await api.ai.submitFeedback({ 
        messageId, 
        rating: feedbackMap[messageId] || 'down', 
        suggestion: suggestionText 
      });
      setSuggestionOpen(null);
      setSuggestionText('');
      setFeedbackSuccess(messageId);
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Refinement data synced']);
      setTimeout(() => setFeedbackSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Refinement sync failed']);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSelfLearn = async (message: Message) => {
    try {
      setTerminalLogs(prev => [...prev.slice(-3), 'AI: Neural Decoupling for Extraction...']);
      const nodeTitle = `Clinical Insight: ${new Date().toLocaleDateString()}`;
      await api.ai.addKnowledge(nodeTitle, message.text, 'clinical');
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Neural Node Stabilized']);
      setFeedbackSuccess(message.id);
      setTimeout(() => setFeedbackSuccess(null), 3000);
    } catch (err) {
      console.error("Self-learning error:", err);
    }
  };

  const speak = useCallback((text: string, force: boolean = false, msgId?: string) => {
    if (!('speechSynthesis' in window)) return;
    if (!force && !isVoiceActive) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Use a natural sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setIsReadingAloud(msgId);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsReadingAloud(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsReadingAloud(null);
    };
    window.speechSynthesis.speak(utterance);
  }, [isVoiceActive]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsReadingAloud(null);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startNewSession = () => {
    setMessages([]);
    setSessionInfo({
      id: `NC-${Math.floor(Math.random() * 10000)}`,
      startTime: new Date(),
      encryption: 'Triple-Layer AES-256',
      status: 'AUTHENTICATED'
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearChat = () => {
    if (window.confirm("Purge Neural Buffer? This will permanently delete the current session timeline from your local matrix.")) {
      if (currentSessionId) {
        api.ai.deleteSession(currentSessionId).catch(console.error);
        setSessions(prev => prev.filter(s => s.id !== currentSessionId));
      }
      setMessages([]);
      setCurrentSessionId(null);
      localStorage.removeItem('last_chat_session_id');
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Buffer cleared', 'SYS: Diagnostic reset']);
    }
  };

  const downloadReport = () => {
    const reportText = messages.map(m => `[${m.timestamp.toISOString()}] ${m.role.toUpperCase()}:\n${m.text}\n`).join('\n---\n\n');
    const blob = new Blob([`DOCTORIAN CLINICAL REPORT\nSession ID: ${sessionInfo.id}\nGenerated: ${new Date().toLocaleString()}\nPersona: ${PERSONAS[activePersona].name}\n\n${reportText}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-report-${sessionInfo.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: report.md exported']);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm("Prune this message? This action will permanently delete this specific entry from your local matrix.")) {
      try {
        await api.ai.deleteMessage(messageId);
        setMessages(prev => prev.filter(m => m.id !== messageId));
        setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Message deleted successfully']);
      } catch (err) {
        console.error("Message deletion failed, removing from state:", err);
        setMessages(prev => prev.filter(m => m.id !== messageId));
        setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Message removed from UI state']);
      }
    }
  };
  // BRAND NEW CLINICAL TOOL DECISION FUNCTIONS
  // ==========================================

  // 1. Lab Interpreter Calculator
  const getComputedLabInterpretation = () => {
    const findings: string[] = [];
    let severity: 'severe' | 'moderate' | 'normal' = 'normal';
    let label = 'NORMAL / STABILIZED PROFILE';
    let color = 'text-emerald-600 dark:text-emerald-400';
    let border = 'border-emerald-200 dark:border-emerald-950/30';
    let bg = 'bg-emerald-50 dark:bg-emerald-955/10';
    let action = 'Check vital signs. Standard observational care guidelines.';

    // Hemoglobin analysis
    if (labHb < 7.0) {
      findings.push(`Severe Anemia (Hb < 7.0 g/dL, measured: ${labHb})`);
      severity = 'severe';
    } else if (labHb < 11.0) {
      findings.push(`Mild/Moderate Anemia (Hb < 11.0 g/dL, measured: ${labHb})`);
      severity = 'moderate';
    }

    // WBC analysis
    if (labWBC > 11.0) {
      findings.push(`Leukocytosis (High WBC - Suspect Bacterial Infection / Sepsis, measured: ${labWBC})`);
      if (severity === 'normal') severity = 'moderate';
    } else if (labWBC < 4.0) {
      findings.push(`Leukopenia (Low WBC - Suspect Viral Infection / Severe Malaria, measured: ${labWBC})`);
      if (severity === 'normal') severity = 'moderate';
    }

    // Platelets analysis
    if (labPlatelets < 100) {
      findings.push(`Severe Thrombocytopenia (Platelets < 100 x10^3/µL - Hemorrhagic Risk, measured: ${labPlatelets})`);
      severity = 'severe';
    } else if (labPlatelets < 150) {
      findings.push(`Mild Thrombocytopenia (Platelets < 150 x10^3/µL, measured: ${labPlatelets})`);
      if (severity === 'normal') severity = 'moderate';
    }

    // Malaria RDT
    if (labMalariaRDT === 'positive_4plus') {
      findings.push('Severe Malaria Parasitemia (RDT 4+)');
      severity = 'severe';
    } else if (labMalariaRDT === 'positive_1plus') {
      findings.push('Uncomplicated Malaria positive (RDT 1+)');
      if (severity !== 'severe') severity = 'moderate';
    }

    // Urine Protein
    if (labUrineProtein === '3plus') {
      findings.push('Severe Proteinuria (3+ Urine Protein)');
      severity = 'severe';
    } else if (labUrineProtein === '1plus') {
      findings.push('Mild/Moderate Proteinuria (1+ Urine Protein)');
      if (severity !== 'severe') severity = 'moderate';
    }

    if (severity === 'severe') {
      label = 'CRITICAL CLINICAL PATHOLOGY ALERT 🚨';
      color = 'text-rose-600 dark:text-rose-400';
      border = 'border-rose-200 dark:border-rose-950/30';
      bg = 'bg-rose-50 dark:bg-rose-955/20';
      action = 'URGENT: Initiate immediate intravenous stabilization. Administer targeted therapies (such as IV Artesunate for severe malaria, blood transfusion for severe anemia, or Magnesium Sulfate load for eclampsia danger) and fast-track to Regional Referral Hospital.';
    } else if (severity === 'moderate') {
      label = 'MODERATE CLINICAL DEVIATION ⚠️';
      color = 'text-amber-600 dark:text-amber-400';
      border = 'border-amber-200 dark:border-amber-900/30';
      bg = 'bg-amber-50 dark:bg-amber-955/25';
      action = 'MODERATE CARE: Prescribe first-line oral medications (Oral ACT, Oral iron supplements for anemia, or safe antibiotics if focal bacterial source identified). Schedule a strict 48-hour clinical review.';
    }

    return {
      label,
      severity,
      findings: findings.length > 0 ? findings : ['All blood counts and rapid tests are within reference boundaries.'],
      color,
      border,
      bg,
      action
    };
  };

  // ==========================================
  // PATIENT CASE INTAKE & FORMULATOR HELPERS
  // ==========================================
  const applyIntakePreset = (preset: 'malaria' | 'pneumonia' | 'preeclampsia' | 'custom_clear') => {
    if (preset === 'malaria') {
      setIntakeAge(24);
      setIntakeGender('female');
      setIntakeComplaint('Cyclic high fever, shivering, severe chills, joint pain, muscle weakness, and splitting headache for 4 days.');
      setIntakeDistrict('Kampala');
      setIntakeTemp(39.2);
      setIntakeHR(108);
      setIntakeSystolic(112);
      setIntakeDiastolic(70);
      setIntakeRR(21);
      setIntakeSpO2(96);
    } else if (preset === 'pneumonia') {
      setIntakeAge(5);
      setIntakeGender('male');
      setIntakeComplaint('Fast breathing, severe subcostal chest in-drawing, high persistent fever, and irritating dry cough for 2 days.');
      setIntakeDistrict('Gulu');
      setIntakeTemp(38.9);
      setIntakeHR(124);
      setIntakeSystolic(95);
      setIntakeDiastolic(58);
      setIntakeRR(44);
      setIntakeSpO2(91);
    } else if (preset === 'preeclampsia') {
      setIntakeAge(31);
      setIntakeGender('female');
      setIntakeComplaint('Pregnancy age 34 weeks, severe pounding frontal headache, sudden blind spots / flashing lights in eyes, and pronounced swelling of face, hands and legs.');
      setIntakeDistrict('Mbarara');
      setIntakeTemp(36.9);
      setIntakeHR(86);
      setIntakeSystolic(165);
      setIntakeDiastolic(104);
      setIntakeRR(18);
      setIntakeSpO2(98);
    } else {
      setIntakeAge(18);
      setIntakeGender('male');
      setIntakeComplaint('');
      setIntakeDistrict('');
      setIntakeTemp(37.0);
      setIntakeHR(75);
      setIntakeSystolic(120);
      setIntakeDiastolic(80);
      setIntakeRR(16);
      setIntakeSpO2(99);
    }
    setTerminalLogs(prev => [...prev.slice(-3), `SYS: Intake Preset Preset "${preset.toUpperCase()}" loaded.`]);
  };

  const getComputedIntakeSOP = () => {
    const alerts: string[] = [];
    let severity: 'normal' | 'warn' | 'crit' = 'normal';
    
    if (intakeTemp >= 38.5) {
      alerts.push(`Hyperpyrexia/Fever detected (${intakeTemp}°C) - Risk of dehydration & convulsions`);
      severity = 'warn';
    } else if (intakeTemp < 36.0) {
      alerts.push(`Hypothermia alert (${intakeTemp}°C) - Warm resuscitation indicated`);
      severity = 'warn';
    }

    if (intakeSpO2 < 93) {
      alerts.push(`Severe Hypoxia risk (SpO2: ${intakeSpO2}%) - MoH Resuscitation: Immediate oxygen therapy`);
      severity = 'crit';
    }

    if (intakeSystolic >= 160 || intakeDiastolic >= 110) {
      alerts.push(`Pre-Eclampsia/HTN Crisis (${intakeSystolic}/${intakeDiastolic} mmHg) - Severe risk of eclamptic fits`);
      severity = 'crit';
    } else if (intakeSystolic >= 140 || intakeDiastolic >= 90) {
      alerts.push(`Mild/Moderate Gestational or Systolic Hypertension (${intakeSystolic}/${intakeDiastolic} mmHg)`);
      if (severity !== 'crit') severity = 'warn';
    }

    if (intakeAge <= 5) {
      if (intakeRR >= 40) {
        alerts.push(`Pediatric Tachypnea/Fast Breathing (RR: ${intakeRR} bpm) - Critical criteria under MoH guidelines`);
        if (severity !== 'crit') severity = 'warn';
      }
    } else {
      if (intakeRR >= 25) {
        alerts.push(`Adult Tachypnea (RR: ${intakeRR} bpm) - Under hypoxia check`);
        if (severity !== 'crit') severity = 'warn';
      }
    }

    let label = 'ROUTINE CLINICAL CARE INDICATED';
    let color = 'text-emerald-600 dark:text-emerald-400';
    let border = 'border-emerald-200 dark:border-emerald-900/30';
    let bg = 'bg-emerald-50 dark:bg-emerald-950/10';
    let action = 'Patient exhibits stable clinical vital signs. Complete medical diagnostics, run baseline blood/urine indices, support symptoms (antipyretics / hydration) and proceed with localized care.';

    if (severity === 'crit') {
      label = 'CRITICAL PHYSIOLOGICAL EMERGENCY (MOH RED FLAG)';
      color = 'text-rose-600 dark:text-rose-400';
      border = 'border-rose-200 dark:border-rose-900/30';
      bg = 'bg-rose-50 dark:bg-rose-950/15';
      action = 'ALERT: Patient presents with urgent high-risk vital parameters! Administer immediate emergency life-saving stabilization (such as high-flow nasal oxygen, IV lines, or anticonvulsive magnesium sulfate) and arrange premium emergency transport / referral to high-level clinical facility.';
    } else if (severity === 'warn') {
      label = 'ELEVATED INTAKE RISK - PATHWAY SUSPECTED';
      color = 'text-amber-600 dark:text-amber-400';
      border = 'border-amber-200 dark:border-amber-900/30';
      bg = 'bg-amber-50 dark:bg-amber-955/10';
      action = 'Patient vital statistics show moderate deviancies. Screen immediately for localized infections (rapid malaria RDT, urinalysis, or chest auscultation). Initiate appropriate empirical therapeutics and secure re-evaluation details.';
    }

    return { alerts, severity, label, color, border, bg, action };
  };

  const injectCaseIntakeIntoChat = () => {
    const intakeResult = getComputedIntakeSOP();
    const alertsStr = intakeResult.alerts.map(a => `⚠️ ${a}`).join('\n');
    const text = `📋 **Doctorian Unified Clinical Intake Case Report (EMR Draft)**
- **Geographic Node**: region of ${intakeDistrict || 'Unspecified'}, Uganda 🇺🇬

👤 **Patient Demographic Profile**:
- **Age**: ${intakeAge} Years old
- **Gender**: ${intakeGender === 'female' ? 'Female 🚺' : 'Male 🚹'}
- **Chief Complaint**: "${intakeComplaint || 'No active complaint stated.'}"

🌡️ **Intake Vital Sign Measurements**:
- **Body Temperature**: ${intakeTemp}°C
- **Heart Rate**: ${intakeHR} bpm
- **Arterial Blood Pressure**: ${intakeSystolic}/${intakeDiastolic} mmHg
- **Respiratory Rate**: ${intakeRR} bpm
- **Pulse Oximetry (SpO2)**: ${intakeSpO2}%

📊 **Computed Clinical Triage Summary**:
- **Triage Assessment Category**: **${intakeResult.label}**
- **Triggered Physiological Red Flags**:
${alertsStr || '• No high-urgency physiological red flags triggered.'}

🇺🇬 **Official Uganda MoH Care Plan SOP Directive**:
${intakeResult.action}

*Please synthesize an official SOAP note, formulate differential diagnoses under Uganda Clinical Guidelines, highlight severe complications to rule out, suggest diagnostic tests, and lay out an immediate management strategy.*`;

    setInput(text);
    setShowToolHub(false);
    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Clinical Case Intake injected.']);
  };

  const injectLabIntoChat = () => {
    const lab = getComputedLabInterpretation();
    const findingsStr = lab.findings.map(f => `• ${f}`).join('\n');
    const text = `📊 **Doctorian Lab Diagnostic Interpretation Report**
- **Hemoglobin (Hb)**: ${labHb} g/dL
- **White Blood Cell (WBC)**: ${labWBC} x10^9/L
- **Platelet Count**: ${labPlatelets} x10^3/µL
- **Malaria RDT Result**: ${labMalariaRDT === 'positive_4plus' ? 'Positive Severe (4+)' : labMalariaRDT === 'positive_1plus' ? 'Positive Uncomplicated (1+)' : 'Negative'}
- **Urine Protein Level**: ${labUrineProtein === '3plus' ? 'Severe Proteinuria (3+)' : labUrineProtein === '1plus' ? 'Mild Proteinuria (1+)' : 'Negative'}

**Matched Clinical Classification**: **${lab.label}**
**Identified Hematological/Chemical Findings**:
${findingsStr}

**Uganda MoH Emergency / Clinical Directive**:
${lab.action}

*Please synthesize a diagnostic review, state differential considerations matching this lab profile, and lay out an active clinical management plan.*`;

    setInput(text);
    setShowToolHub(false);
    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Lab report injected.']);
  };

  // 2. Obstetric Risk Calculator
  const getComputedObstetricRisk = () => {
    const dangerFlags: string[] = [];
    let state: 'crit' | 'warn' | 'normal' = 'normal';
    let label = 'ROUTINE PERINATAL MONITORING';
    let color = 'text-emerald-600 dark:text-emerald-400';
    let border = 'border-emerald-200 dark:border-emerald-955/30';
    let bg = 'bg-emerald-50 dark:bg-emerald-955/10';
    let directive = 'Schedule routine antenatal care (ANC) assessments. Deliver iron/folic supplements and counsel on proper birth plan preparation.';

    // Check BP thresholds
    const isSevereHTN = systolicBP >= 160 || diastolicBP >= 110;
    const isMildHTN = (systolicBP >= 140 && systolicBP < 160) || (diastolicBP >= 90 && diastolicBP < 110);

    if (isSevereHTN) {
      dangerFlags.push('Severe Hypertension (>= 160/110 mmHg)');
      state = 'crit';
    } else if (isMildHTN) {
      dangerFlags.push('Mild/Moderate Gestational Hypertension (>= 140/90 mmHg)');
      state = 'warn';
    }

    // Gestational checks
    if (gestationalWeeks < 37) {
      dangerFlags.push(`Preterm pregnancy state (${gestationalWeeks} Weeks)`);
    } else if (gestationalWeeks >= 42) {
      dangerFlags.push('Post-term gestational danger state (>= 42 Weeks)');
      state = 'crit';
    }

    // Obstetric Checklist Checked Signs
    Object.entries(obsDangerSigns).forEach(([key, checked]) => {
      if (checked) {
        let labelStr = key;
        if (key === 'headache') labelStr = 'Splitting severe headache';
        if (key === 'blurredVision') labelStr = 'Blurred vision / flashing lights';
        if (key === 'epigastricPain') labelStr = 'Severe epigastric pain';
        if (key === 'swollenFaceHands') labelStr = 'Fluid swelling of face & hands';
        if (key === 'reducedMovement') labelStr = 'Reduced/Absent fetal movement';
        dangerFlags.push(labelStr);
        state = 'crit';
      }
    });

    if (state === 'crit') {
      label = 'CRITICAL OBSTETRIC EMERGENCY ALERT 🚨';
      color = 'text-rose-600 dark:text-rose-400';
      border = 'border-rose-200 dark:border-rose-950/30';
      bg = 'bg-rose-50 dark:bg-rose-955/20';
      directive = 'IMMEDIATE OBSTETRIC EMERGENCY: High risk for severe pre-eclampsia, eclampsia, or placental abruption. Catheterize immediately, initiate intravenous magnesium sulfate loading dose (MoH protocol: 4g IV + 10g IM), control blood pressure with safe agents (such as safe IV hydralazine or oral labetalol), and expedite delivery referral to theater-capable units.';
    } else if (state === 'warn') {
      label = 'OBSTETRIC PRECAUTION MONITORING ⚠️';
      color = 'text-amber-600 dark:text-amber-400';
      border = 'border-amber-200 dark:border-amber-900/30';
      bg = 'bg-amber-50 dark:bg-amber-955/25';
      directive = 'INCREASED ANC VIGILANCE: Gestational hypertension without critical target-organ danger flags. Screen urine for protein daily, monitor blood pressure twice daily, schedule biweekly ultrasound/doppler reviews, and advise on maternal immediate-return warning signs.';
    }

    return {
      label,
      state,
      dangerFlags: dangerFlags.length > 0 ? dangerFlags : ['No pathological blood pressure readings or alarm triggers detected.'],
      color,
      border,
      bg,
      directive
    };
  };

  const injectObstetricIntoChat = () => {
    const obs = getComputedObstetricRisk();
    const flagsStr = obs.dangerFlags.map(f => `• ${f}`).join('\n');
    const text = `🤰 **Doctorian Antenatal & Obstetric Assessment Report**
- **Gestational Age**: ${gestationalWeeks} Weeks
- **Blood Pressure Reading**: ${systolicBP}/${diastolicBP} mmHg

**Computed Obstetric Classification**: **${obs.label}**
**Perinatal / Gestational Risk Parameters**:
${flagsStr}

**Uganda MoH Antenatal Protocol Directive**:
${obs.directive}

*Please synthesize an actionable delivery care plan, highlight pre-eclampsia/eclampsia preventative protocols if indicated, and specify direct fetal health surveillance workflows.*`;

    setInput(text);
    setShowToolHub(false);
    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Perinatal report injected.']);
  };

  // 3. Intravenous Fluid Infusion Calculator
  const getComputedFluidInfusion = () => {
    let title = 'PLAN A: REHYDRATION PROTOCOL';
    let color = 'text-emerald-600 dark:text-emerald-400';
    let border = 'border-emerald-200 dark:border-emerald-955/30';
    let bg = 'bg-emerald-50 dark:bg-emerald-955/10';
    let prescription = '';

    if (dehydrationSeverity === 'severe') {
      title = 'EMERGENCY PLAN C: HYPOVOLEMIC SHOCK RESUSCITATION 🚨';
      color = 'text-rose-600 dark:text-rose-400';
      border = 'border-rose-200 dark:border-rose-950/30';
      bg = 'bg-rose-50 dark:bg-rose-955/20';

      const bolusVolume = patientWeight * 30; // 30 ml/kg bolus
      const secondVolume = patientWeight * 70; // 70 ml/kg maintenance bolus
      const totalVolume = bolusVolume + secondVolume;

      const rateInfantFirst = (bolusVolume / 1.0); // over 1 hr for infant
      const dropRateInfantFirst = Math.round((rateInfantFirst * givingSetDrops) / 60);

      const rateAdultFirst = (bolusVolume / 0.5); // over 30 mins for older children/adults
      const dropRateAdultFirst = Math.round((rateAdultFirst * givingSetDrops) / 60);

      prescription = `CRITICAL DEHYDRATION DETECTED: Immediately establish high-flow intravenous access.
• **Initial Fluid challenge (30 ml/kg)**: Give **${bolusVolume} mL** of Ringer's Lactate / Normal Saline.
  - *If Patient is an Infant (<1yr)*: Infuse over 1 hour (**${rateInfantFirst.toFixed(0)} mL/hr** or **${dropRateInfantFirst} drops/min** using a ${givingSetDrops}-drops/mL admin set).
  - *If Patient is Older Child / Adult (>=1yr)*: Infuse rapidly over 30 minutes (**${rateAdultFirst.toFixed(0)} mL/hr** or **${dropRateAdultFirst} drops/min**).
• **Secondary Maintenance fluid (70 ml/kg)**: Infuse **${secondVolume} mL** over 5 hours (infants) or 2.5 hours (older children). Total fluid resus volume is **${totalVolume} mL**.
• Re-evaluate the child/patient every 15-30 minutes for signs of fluid overload or ongoing vascular collapse.`;
    } else if (dehydrationSeverity === 'some') {
      title = 'CLASSIC PLAN B: ACTIVE ORAL REHYDRATION THERAPY 💧';
      color = 'text-amber-600 dark:text-amber-400';
      border = 'border-amber-200 dark:border-amber-900/30';
      bg = 'bg-amber-50 dark:bg-amber-955/25';

      const orsVolume = patientWeight * 75; // 75 ml/kg matching WHO/MOH standards
      prescription = `SOME DEHYDRATION DETECTED:
• Give ORS (Oral Rehydration Salts) solution over 4 hours at the clinic.
• **ORS Volume Rule (75 ml/kg)**: Administer **${orsVolume} mL** of ORS slowly by cup and clean spoon.
• If child vomits, pause for 10 minutes, then continue giving ORS but much slower (e.g. one spoonful every 2-3 minutes).
• Continue breastfeeding/feeding of child as tolerated. Re-assess child after 4 hours of hydration therapy.`;
    } else {
      prescription = `PREVENTATIVE PLAN A (NO CLINICAL DEHYDRATION):
• Maintain active fluid levels homecare protocol.
• Instruct parents to give extra fluids after every loose watery stool (e.g., 50-100 mL of ORS for children < 2yrs, 100-200 mL for children >=2yrs).
• Maintain full infant feedings and breastfeeds. Show danger signs to parents (sunken eyes, high fever, extreme lethargy) for immediate referral.`;
    }

    return {
      title,
      color,
      border,
      bg,
      prescription
    };
  };

  const injectFluidIntoChat = () => {
    const f = getComputedFluidInfusion();
    const text = `💧 **Doctorian Clinical Fluid & Resuscitation Prescription**
- **Calculated Patient Mass**: ${patientWeight} kg
- **Vascular Dehydration Assessment**: **${dehydrationSeverity.toUpperCase()} DEHYDRATION**
- **Giving Set Drip Standard**: ${givingSetDrops} drops/mL (${givingSetDrops === 20 ? 'Standard Macro Set' : 'Pediatric Micro Set'})

**Uganda MoH Resuscitation Directive Directive**:
**${f.title}**

${f.prescription}

*Please verify these resuscitation flow metrics, draft a complementary nursing tracker sheet, and suggest when standard enteral transition can safely be resumed.*`;

    setInput(text);
    setShowToolHub(false);
    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Resuscitation workflow injected.']);
  };

  const isUserPremium = useMemo(() => {
    return ['gold', 'business', 'silver', 'pro'].includes(user?.subscriptionStatus === 'active' ? user?.subscriptionTier : '') || user?.email?.toLowerCase() === "gloriajayakullo@gmail.com";
  }, [user]);

  const [credits, setCredits] = useState<number | string>(isUserPremium ? 'Unlimited' : (user?.credits ?? 0));

  useEffect(() => {
    if (user?.credits !== undefined) {
      setCredits(user.credits);
    }
  }, [user]);

  const [streamingId, setStreamingId] = useState<string | null>(null);

  const THINKING_PHASES = [
    "Initializing Neural Synapse...",
    "Accessing Medical Knowledge Matrix...",
    "Cross-referencing Clinical Protocols...",
    "Synthesizing Bio-logical Data Flows...",
    "Analyzing Pathophysiological Pathways...",
    "Evaluating Differential Diagnostics...",
    "Decrypting Health Ledger Archives...",
    "Optimizing Diagnostic Reliability..."
  ];

  useEffect(() => {
    let interval: any;
    if (isThinking) {
      let phaseIndex = 0;
      setThinkingStatus(THINKING_PHASES[0]);
      interval = setInterval(() => {
        phaseIndex = (phaseIndex + 1) % THINKING_PHASES.length;
        setThinkingStatus(THINKING_PHASES[phaseIndex]);
      }, 2500);
    } else {
      setThinkingStatus('Doctorian is generating response...');
    }
    return () => clearInterval(interval);
  }, [isThinking]);

  const triggerGreeting = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: 'bot',
      text: '',
      timestamp: new Date(),
    };
    setMessages([botMessagePlaceholder]);
    setStreamingId(botMessageId);

    try {
      setIsThinking(true);
      abortControllerRef.current = new AbortController();
      
      const systemInstruction = `${BASE_SYSTEM_INSTRUCTION}\n\n${PERSONAS[activePersona].instruction}\n\nCURRENT_CONTEXT: ${JSON.stringify(neuralContext)}\n\nURGENT: Initiate GREETING_PROTOCOL. Provide a warm, personalized greeting.`;

      const stream = api.ai.aiChatStream(
        [],
        systemInstruction,
        undefined, // Default to Brain Engine (Llama 3.1 / Gemma 2)
        0.8,
        (meta) => {
          if (meta.credits !== undefined) setCredits(meta.credits);
        },
        abortControllerRef.current.signal,
        false,
        'MINIMAL',
        undefined,
        targetLanguage
      );

      let fullResponseText = "";
      for await (const chunk of stream) {
        if (isThinking) setIsThinking(false);
        fullResponseText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, text: fullResponseText } : m
        ));
      }

      if (currentSessionId && fullResponseText) {
        api.ai.saveMessage(currentSessionId, 'bot', fullResponseText).catch(console.error);
      }
    } catch (error) {
      console.error('Greeting error:', error);
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      setStreamingId(null);
    }
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;

    if (credits !== 'Unlimited' && Number(credits) <= 0) {
      const errorMsg = "Your neural consultation credits have been exhausted. High-tier protocol activation required to continue synthesis.";
      setMessages(prev => [...prev, { 
        id: 'error-' + Date.now(),
        role: 'bot', 
        text: errorMsg, 
        isError: true,
        timestamp: new Date() 
      }]);
      
      if (onUpgradeRequested) {
        setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Quota exceeded. Routing to billing...']);
        onUpgradeRequested();
      }
      return;
    }

    const filesToAttach = [...attachedFiles];
    const images = filesToAttach.filter(f => f.isImage).map(f => f.content);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
      images: images.length > 0 ? images : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (currentSessionId) {
      api.ai.saveMessage(currentSessionId, 'user', textToSend).catch(console.error);
    }

    setTerminalLogs(prev => [...prev.slice(-3), `USER: ${textToSend.slice(0, 20)}...`]);
    setInput('');
    setAttachedFiles([]); 
    setIsLoading(true);
    onMessageSent?.();

    const botMessageId = (Date.now() + 1).toString();
    const promptLower = textToSend.toLowerCase();
    let probableEngine = "Gemma (Clinical)";
    if (images.length > 0) probableEngine = "Llama 3.1 Vision";
    else if (promptLower.includes('analyze') || promptLower.includes('data')) probableEngine = "Mistral 7B (Logic)";
    else if (promptLower.includes('Ollama') || promptLower.includes('reason') || promptLower.includes('think')) probableEngine = "llama 3.1 8b-instruct";
    else if (!isMedicalQuery(promptLower)) probableEngine = "Llama 3.1 8B (Base)";
    setTerminalLogs(prev => [...prev.slice(-3), `AI: Using ${probableEngine} Engine...`]);

    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: 'bot',
      text: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMessagePlaceholder]);
    setStreamingId(botMessageId);

    try {
      setIsThinking(true);
      abortControllerRef.current = new AbortController();
      setTerminalLogs(prev => [...prev.slice(-3), 'AI: Synchronizing Neural pathways...']);
      
      // Artificial delay to show thinking state if requested, but let's make it real-time as much as possible
      // Actually, we can just let it be true until the first chunk comes.
      
      const personaInstruction = PERSONAS[activePersona].instruction;
      const nonImageFiles = filesToAttach.filter(f => !f.isImage);
      const images = filesToAttach.filter(f => f.isImage).map(f => f.content);

      const fileContext = nonImageFiles.length > 0 
        ? `\n\nATTACHED MEDICAL DOCUMENTS:\n${nonImageFiles.map(f => `FILE: ${f.name}\nCONTENT: ${f.content}`).join('\n---\n')}` 
        : '';
      
      const systemInstruction = `${BASE_SYSTEM_INSTRUCTION}\n\nCURRENT SPECIALIZATION: ${personaInstruction}\n\nUSER CLINICAL CONTEXT:\n${healthContext}\n\n${fileContext}`;
      
      const stream = api.ai.aiChatStream(
        [...messages, userMessage].map(m => ({
          role: m.role,
          text: m.text
        })),
        systemInstruction,
        selectedModel,
        activePersona === 'support' ? 0.3 : temperature,
        (meta) => {
          if (meta.credits !== undefined) {
            setCredits(meta.credits);
            if (onUpdate && user) {
              onUpdate({ ...user, credits: meta.credits });
            }
          }
          if (meta.grounding) {
            setMessages(prev => prev.map(m => 
              m.id === botMessageId ? { ...m, grounding: meta.grounding } : m
            ));
          }
          if (meta.thought) {
            setMessages(prev => prev.map(m => 
              m.id === botMessageId ? { ...m, thought: (m.thought || '') + meta.thought } : m
            ));
          }
        },
        abortControllerRef.current.signal,
        false,
        'MINIMAL',
        images,
        targetLanguage
      );

      let fullResponseText = "";
      for await (const chunk of stream) {
        if (isThinking) setIsThinking(false);
        fullResponseText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, text: fullResponseText } : m
        ));
      }

      setTerminalLogs(prev => [...prev.slice(-3), 'AI: Diagnostics synchronized']);
      if (isVoiceActive) speak(fullResponseText);

      if (currentSessionId && fullResponseText) {
        api.ai.saveMessage(currentSessionId, 'bot', fullResponseText).catch(console.error);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }
      console.error('Chat error:', error);
      let errorMsg = "Neural link pathways are currently undergoing high-load optimization. I am moving to local synthesis for your request...";
      if (error.message?.includes('429')) errorMsg = "High-availability mode triggered. Switching to localized clinical weights...";

      setMessages(prev => {
        return prev.map(m => 
          m.id === botMessageId ? { ...m, text: (m.text || "") + `\n\n--- \n**System Notice:** ${errorMsg}`, isError: true } : m
        );
      });
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      setStreamingId(null);
    }
  };

  useEffect(() => {
    const handleInjectMessage = (event: any) => {
      const { text, personaId } = event.detail;
      if (personaId && PERSONAS[personaId as keyof typeof PERSONAS]) {
        setActivePersona(personaId as any);
      }
      handleSend(text);
    };

    window.addEventListener('doctorian:inject_message', handleInjectMessage);
    
    return () => {
      window.removeEventListener('doctorian:inject_message', handleInjectMessage);
    };
  }, [activePersona, handleSend]);

  const applyFormat = (type: 'bold' | 'italic' | 'code') => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const selected = input.substring(start, end);
    let formatted = selected;

    switch (type) {
      case 'bold': formatted = `**${selected}**`; break;
      case 'italic': formatted = `*${selected}*`; break;
      case 'code': formatted = `\`${selected}\``; break;
    }

    const newInput = input.substring(0, start) + formatted + input.substring(end);
    setInput(newInput);
    
    // Reset focus and selection
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = start + (selected ? formatted.length : formatted.length / 2);
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const filteredSuggestions = useMemo(() => {
    if (!input) return [];
    return SUGGESTIONS.filter(s => s.toLowerCase().includes(input.toLowerCase())).slice(0, 4);
  }, [input]);

  const handleSuggestionClick = (s: string) => {
    handleSend(s);
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-950 font-sans overflow-hidden">
      {/* Session Sidebar - Mobile-First Sheet Style */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-white dark:bg-slate-900 z-[201] flex flex-col shadow-2xl"
            >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Clock size={14} className="text-blue-600" /> Neural History
                </h3>
                <button 
                  onClick={() => createNewSession()}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                  title="New Diagnostic Session"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {sessions.map(session => (
                  <motion.div 
                    layout
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className={`group p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden ${
                      currentSessionId === session.id 
                        ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-600/50'
                    }`}
                  >
                    {currentSessionId === session.id && (
                      <motion.div 
                        layoutId="active-bg"
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 -z-10"
                      />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-black uppercase tracking-widest truncate ${currentSessionId === session.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {session.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-[8px] font-bold uppercase tracking-tighter ${currentSessionId === session.id ? 'text-white/60' : 'text-slate-400'}`}>
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter ${currentSessionId === session.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                            {session.persona}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => deleteSession(session.id, e)}
                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${currentSessionId === session.id ? 'hover:bg-white/20 text-white' : 'hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500'}`}
                        title="Purge Session"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                {sessions.length === 0 && (
                  <div className="flex flex-col items-center justify-center pt-20 text-center px-6">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                      <Clock size={20} className="text-slate-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Neural Links established yet</p>
                  </div>
                )}
              </div>

              {/* Dev Node Info */}
              <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Code size={14} className="text-orange-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dev Node Sync</span>
                  </div>
            
                </div>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Core Split Container */}
      <div className="flex-1 flex min-h-0 min-w-0 relative overflow-hidden">
        {/* Main Chat Core */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white dark:bg-slate-950 relative">
        <header className="h-16 lg:h-15 px-4 sm:px-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shrink-0 relative overflow-hidden">
          {/* Top border ambient synapse line */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 opacity-90" />
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-blue-600 transition-colors"
              title="Neural Session History"
            >
              <History size={20} />
            </button>
            <Sparkles size={16} className="text-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Doctorian AI</span>
            
            {/* Active System Pulse Status */}
            <div className="hidden md:flex items-center gap-3 ml-4">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8.5px] font-[1000] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Synapse Core Secure</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 rounded-full">
                <Cpu size={12} className="text-violet-600 dark:text-violet-400 animate-pulse" />
                <span className="text-[8.5px] font-[1000] uppercase tracking-widest text-violet-600 dark:text-violet-400">Ollama Link: Llama 3.1</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* EMR Case Intake & Formulator Trigger */}
            <button 
              onClick={() => setShowToolHub(!showToolHub)} 
              className={`p-2 transition-all flex items-center gap-1.5 rounded-xl border ${showToolHub ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono font-bold' : 'text-slate-400 hover:text-blue-600 border-transparent bg-transparent'}`}
              title="Patient Intake & Case EMR Formulator"
            >
              <FileText size={16} />
              <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Case Intake</span>
            </button>

            {/* Modernized Add Chat button with instant start template dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNewChatDropdown(!showNewChatDropdown)} 
                className={`px-3 py-1.5 transition-all flex items-center gap-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${showNewChatDropdown ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-blue-50/50 dark:bg-slate-900 border-blue-100 dark:border-slate-800 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600'}`}
                title="Smarter Pulse Node Spawn"
              >
                <PlusCircle size={14} className={showNewChatDropdown ? '' : 'animate-pulse'} />
                <span className="hidden sm:inline">New Session</span>
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
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-left"
                    >
                      <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-850">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Clinical Template</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          createNewSession('Clinical Intake Formulator');
                          setActiveTool('case_intake');
                          setShowToolHub(true);
                          setShowNewChatDropdown(false);
                        }}
                        className="w-full text-left p-2.5 bg-blue-50/50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold border border-blue-100/30 rounded-xl transition-all flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 bg-blue-150/40 dark:bg-blue-900/40 rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase leading-none">Intake Formulator</p>
                          <p className="text-[9px] text-slate-500 font-semibold leading-tight mt-1.5">Interactive EHR Patient Intake & SOAP Note Generator</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          createNewSession('Primary Consultation');
                          setActivePersona('general');
                          setShowNewChatDropdown(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 rounded-xl transition-all flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                          <Bot size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none">Primary Care</p>
                          <p className="text-[9px] text-slate-400 font-semibold leading-tight mt-1.5">Primary clinic and baseline wellness guidelines</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          createNewSession('Lab Assessment');
                          setActiveTool('lab_interpreter');
                          setShowToolHub(true);
                          setShowNewChatDropdown(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 rounded-xl transition-all flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                          <Activity size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none">Lab Interpreter</p>
                          <p className="text-[9px] text-slate-400 font-semibold leading-tight mt-1.5">Hb, WBC, Platelets, Urine & Malaria diagnostics</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          createNewSession('Obstetric Assessment');
                          setActiveTool('obstetric');
                          setShowToolHub(true);
                          setShowNewChatDropdown(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-rose-50/50 dark:hover:bg-slate-800/50 rounded-xl transition-all flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 bg-rose-100 dark:bg-rose-900/40 rounded-lg flex items-center justify-center text-rose-600 shrink-0">
                          <AlertCircle size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none">Obstetric Risk</p>
                          <p className="text-[9px] text-slate-400 font-semibold leading-tight mt-1.5">Maternal risk levels & pre-eclampsia checking</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          createNewSession('Fluid Infusion Resus');
                          setActiveTool('fluid_infusion');
                          setShowToolHub(true);
                          setShowNewChatDropdown(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-amber-50/50 dark:hover:bg-slate-800/50 rounded-xl transition-all flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                          <Sparkles size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none">Fluid Infusion</p>
                          <p className="text-[9px] text-slate-400 font-semibold leading-tight mt-1.5">Dehydration severity & mass resuscitation SOPs</p>
                        </div>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:text-blue-600 transition-all animate-spin-slow" title="Doctorian Settings">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar smooth-scroll">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <AnimatePresence initial={false}>
              {messages.length === 0 && !isLoading ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-h-[50vh] flex flex-col items-center justify-center text-center py-10 space-y-12"
                >
                  <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                  >
                      <div className="absolute -inset-12 bg-blue-500/10 dark:bg-blue-400/5 blur-[80px] rounded-full" />
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center relative shadow-2xl border border-slate-100 dark:border-slate-800 ring-1 ring-slate-100 dark:ring-slate-800">
                          <Bot size={32} className="text-blue-600" />
                      </div>
                  </motion.div>

                  <div className="space-y-4">
                      <h2 className="text-4xl sm:text-5xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                          Hello, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user?.displayName || "Agent"}</span>
                      </h2>
                      <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                          How can I help you with your medical journey today?
                      </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {[
                      { icon: <Activity size={18}/>, label: "Check current vitals", text: "What are my current biological baselines?" },
                      { icon: <Shield size={18}/>, label: "Biometric security", text: "Verify my neural link integrity." },
                      { icon: <Search size={18}/>, label: "Symptom check", text: "Analyze a persistent headache." },
                      { icon: <MessageSquare size={18}/>, label: "Specialist relay", text: "Connect me with a cardiologist." }
                  ].map((q, i) => (
                      <button 
                          key={i}
                          onClick={() => handleSend(q.text)}
                          className="group p-5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 rounded-3xl text-left hover:border-blue-500/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                      >
                          <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                  {q.icon}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600">{q.label}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{q.text}</p>
                      </button>
                  ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-12">
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={msg.id || `msg-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 sm:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} group`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ${
                        msg.role === 'user' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : `${PERSONAS[activePersona].color} text-white`
                      }`}>
                        {msg.role === 'user' ? <User size={18} /> : PERSONAS[activePersona].icon}
                      </div>
                      
                      <div className={`flex flex-col space-y-2 ${msg.role === 'user' ? 'max-w-[85%] items-end' : 'flex-1 items-start w-full'}`}>
                        {msg.images && msg.images.length > 0 && (
                          <div className={`flex flex-wrap gap-2 mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.images.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img} 
                                alt={`Clinical context ${idx + 1}`}
                                className="w-24 h-24 sm:w-40 sm:h-40 object-cover rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform" 
                                referrerPolicy="no-referrer"
                              />
                            ))}
                          </div>
                        )}
                        
                        <motion.div 
                          initial={false}
                          className={`text-sm sm:text-base leading-relaxed relative border transition-all ${
                          msg.role === 'user' 
                            ? 'px-5 py-4 sm:px-6 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent rounded-tr-none shadow-xl' 
                            : 'px-0 py-1 bg-transparent text-slate-800 dark:text-slate-100 border-transparent shadow-none w-full'
                          }`}
                        >
                           {msg.role === 'bot' && (
                             <div className="flex items-center gap-1.5 mb-3 border-b border-slate-100/30 dark:border-slate-800/20 pb-2.5">
                               <span className="text-[10px] font-[1000] text-blue-600 dark:text-blue-400 uppercase tracking-widest">Doctorian Intelligence</span>
                               <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                               <span className="text-[10px] font-black uppercase text-slate-400">{PERSONAS[activePersona].name}</span>
                             </div>
                           )}

                           <div className={`prose prose-sm dark:prose-invert max-w-none ${msg.role === 'user' ? 'text-white/90 dark:text-slate-800' : ''}`}>
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                               {msg.text || (isLoading && i === messages.length - 1 ? '...' : '')}
                             </ReactMarkdown>
                           </div>

                           {streamingId === msg.id && (
                             <motion.span 
                               initial={{ opacity: 0 }}
                               animate={{ opacity: [0, 1, 0] }}
                               transition={{ duration: 0.8, repeat: Infinity }}
                               className={`inline-block w-1.5 h-4 ml-1 translate-y-1 rounded-full ${msg.role === 'user' ? 'bg-white' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]'}`}
                             />
                           )}
                        </motion.div>

                        <div className={`flex items-center gap-4 mt-1 px-4 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                             {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <div className="flex items-center gap-2.5">
                             {msg.role === 'bot' && (
                               <>
                                 <button onClick={() => copyToClipboard(msg.text, msg.id)} className="text-slate-400 hover:text-blue-600 transition-colors" title="Copy to clipboard">
                                   {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                                 </button>
                                 <button onClick={() => speak(msg.text, true, msg.id)} className={`transition-colors ${isReadingAloud === msg.id ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'}`} title="Read text aloud">
                                   <Volume2 size={12} />
                                 </button>
                               </>
                             )}
                             <button 
                               onClick={() => handleDeleteMessage(msg.id)} 
                               className="text-slate-400 hover:text-rose-500 transition-colors"
                               title="Prune this entry"
                             >
                               <Trash2 size={12} />
                             </button>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {(isLoading || isThinking) && (
                    <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 relative z-10">
                          <Bot size={18} className="animate-pulse" />
                        </div>
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -inset-1 bg-blue-500/30 rounded-2xl blur-sm"
                        />
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                           <div className="flex items-center gap-3">
                             <div className="relative flex items-center justify-center w-5 h-5">
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-blue-600/30 border-t-blue-600 rounded-full" 
                              />
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                             </div>
                             <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">
                               {thinkingStatus}
                             </span>
                           </div>
                           <div className="flex items-center gap-2">
                            <div className="hidden sm:block h-3 w-px bg-slate-100 dark:bg-slate-800" />
                            <button 
                              onClick={stopSynthesis}
                              className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 group"
                            >
                              <X size={10} className="group-hover:rotate-90 transition-transform" /> Terminate Node
                            </button>
                           </div>
                        </div>
                        
                        {(isThinking || isLoading) && (
                          <div className="flex flex-col gap-3 mt-2 max-w-md bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-100/50 dark:border-slate-800/50 backdrop-blur-sm">
                             <div className="flex items-center justify-between mb-1">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <motion.div 
                                      key={i}
                                      animate={{ height: [4, 12, 4], opacity: [0.3, 1, 0.3] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                      className="w-1 bg-blue-600/40 rounded-full"
                                    />
                                  ))}
                                </div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Neural Stream: Active</span>
                             </div>
                             <div className="space-y-2">
                               <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-600/30 to-transparent"
                                  />
                               </div>
                               <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden w-2/3">
                                  <motion.div 
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.2 }}
                                    className="h-full w-1/4 bg-gradient-to-r from-transparent via-emerald-600/30 to-transparent"
                                  />
                               </div>
                             </div>
                             <div className="flex items-center gap-2 mt-1">
                               <Cpu size={10} className="text-slate-400 animate-spin-slow" />
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Processing Clinical Knowledge Base...</span>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 sm:px-6 py-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/50">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex flex-col bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] sm:rounded-full p-2 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
              {/* Attached Files Preview */}
              <AnimatePresence>
                {attachedFiles.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 px-6 py-4 border-b border-slate-200 dark:border-slate-800"
                  >
                    {attachedFiles.map((file) => (
                      <motion.div 
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        key={file.name}
                        className="group relative flex items-center gap-2 pr-2 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-bold border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
                      >
                        {file.isImage ? (
                          <div className="h-full w-10 shrink-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                            <img 
                              src={file.content} 
                              alt={file.name} 
                              className="h-full w-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="h-full w-10 shrink-0 bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                            <FileText size={16} className="text-blue-500" />
                          </div>
                        )}
                        <span className="max-w-[100px] truncate font-medium">{file.name}</span>
                        <button 
                          onClick={() => removeFile(file.name)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-1 sm:gap-2 pl-3 sm:pl-6 text-sm">
                <textarea 
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Clinical query..."
                  className="flex-1 bg-transparent border-none outline-none py-4 text-[16px] font-medium text-slate-900 dark:text-white placeholder-slate-400 resize-none min-h-[56px] max-h-48"
                  rows={1}
                />
                
                <div className="flex items-center gap-1 sm:gap-2 mb-2 pr-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 sm:p-3 text-slate-400 hover:text-blue-600 transition-all rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                    title="Attach context"
                  >
                    <Paperclip size={18} className="sm:w-5 sm:h-5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    multiple 
                    className="hidden" 
                  />
                  
                  <button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    className={`hidden sm:flex p-3 rounded-full transition-all relative ${isRecording ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    title="Voice input"
                  >
                    <Mic size={20} />
                  </button>

                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() && attachedFiles.length === 0 || isLoading}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-20 shadow-lg shadow-blue-500/20 shrink-0"
                  >
                    {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <ArrowRight size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info - discrete Gemini style */}
          <div className="px-6 py-2 flex items-center justify-center border-t border-slate-50 dark:border-slate-800/20 bg-white dark:bg-slate-950 shrink-0">
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest text-center">
             Doctorian Medical AI may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </div>

      {/* Clinical Tool Hub Panel */}
      <AnimatePresence>
        {showToolHub && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute md:relative inset-y-0 right-0 z-40 w-full sm:w-[420px] shrink-0 border-l border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900 shadow-2xl flex flex-col min-h-0 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center justify-between bg-white dark:bg-slate-950/80 backdrop-blur-md">
              <div>
                <h3 className="text-sm font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-1.5 leading-none">
                  <FileText size={16} className="text-blue-600 animate-pulse" /> EMR Case Intake Core
                </h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Patient Intake & Case Formulator</p>
              </div>
              <button 
                onClick={() => setShowToolHub(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Selector Tabs */}
            <div className="p-2.5 bg-slate-50/50 dark:bg-slate-950/30 flex flex-wrap border-b border-slate-100 dark:border-slate-800/50 gap-1.5 shrink-0">
              <button 
                type="button"
                onClick={() => setActiveTool('case_intake')}
                className={`py-1.5 px-2 text-[8.5px] font-[1000] uppercase tracking-wider rounded-lg transition-all ${activeTool === 'case_intake' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50 font-black' : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white'}`}
              >
                EMR Intake
              </button>
              <button 
                type="button"
                onClick={() => setActiveTool('lab_interpreter')}
                className={`py-1.5 px-2 text-[8.5px] font-[1000] uppercase tracking-wider rounded-lg transition-all ${activeTool === 'lab_interpreter' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50' : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white'}`}
              >
                Lab Interpreter
              </button>
              <button 
                type="button"
                onClick={() => setActiveTool('obstetric')}
                className={`py-1.5 px-2 text-[8.5px] font-[1000] uppercase tracking-wider rounded-lg transition-all ${activeTool === 'obstetric' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50' : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white'}`}
              >
                Obstetric Care
              </button>
              <button 
                type="button"
                onClick={() => setActiveTool('fluid_infusion')}
                className={`py-1.5 px-2 text-[8.5px] font-[1000] uppercase tracking-wider rounded-lg transition-all ${activeTool === 'fluid_infusion' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50' : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white'}`}
              >
                Fluid Resus
              </button>
            </div>

            {/* Scrollable Panels Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTool === 'case_intake' ? (
                <div className="space-y-6 text-left">
                  {/* Case Presets Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Load Patient Case Preset</label>
                    <div className="grid grid-cols-3 gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <button 
                        type="button"
                        onClick={() => applyIntakePreset('malaria')}
                        className="py-2 px-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 text-[9px] font-black uppercase tracking-widest rounded-xl border border-red-200/55 dark:border-red-900/55 transition-all text-center font-bold"
                      >
                        Malaria
                      </button>
                      <button 
                        type="button"
                        onClick={() => applyIntakePreset('pneumonia')}
                        className="py-2 px-1 bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-405 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-[9px] font-black uppercase tracking-widest rounded-xl border border-blue-200/55 dark:border-blue-900/55 transition-all text-center font-bold"
                      >
                        Pneumonia
                      </button>
                      <button 
                        type="button"
                        onClick={() => applyIntakePreset('preeclampsia')}
                        className="py-2 px-1 bg-purple-50 dark:bg-purple-955/20 text-purple-600 dark:text-purple-405 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-[9px] font-black uppercase tracking-widest rounded-xl border border-purple-200/55 dark:border-purple-900/55 transition-all text-center font-bold"
                      >
                        Preeclampsia
                      </button>
                    </div>
                  </div>

                  {/* Demographics inputs */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Age (Years)</label>
                      <input 
                        type="number"
                        min={1}
                        max={120}
                        value={intakeAge}
                        onChange={(e) => setIntakeAge(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biological Gender</label>
                      <div className="flex gap-1.5">
                        <button 
                          type="button"
                          onClick={() => setIntakeGender('female')}
                          className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all ${intakeGender === 'female' ? 'bg-blue-600 text-white border-blue-650 font-bold shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                        >
                          Female
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIntakeGender('male')}
                          className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all ${intakeGender === 'male' ? 'bg-blue-600 text-white border-blue-650 font-bold shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-805 text-slate-500'}`}
                        >
                          Male
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Complaint */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chief Complaint & History</label>
                    <textarea 
                      rows={2}
                      value={intakeComplaint}
                      onChange={(e) => setIntakeComplaint(e.target.value)}
                      placeholder="Fever, shivering, vomiting, severe cough..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white leading-relaxed"
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ugandan District / Node</label>
                    <input 
                      type="text"
                      value={intakeDistrict}
                      onChange={(e) => setIntakeDistrict(e.target.value)}
                      placeholder="e.g. Mbarara, Kampala, Gulu"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Vital Signs Grid */}
                  <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <span className="text-[9px] font-[1000] text-slate-400 uppercase tracking-wider leading-none block">Vital Signs Array</span>
                    
                    {/* Temp Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold text-slate-500">Core Temp</label>
                        <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 font-mono">{intakeTemp}°C</span>
                      </div>
                      <input 
                        type="range" min={35.0} max={42.0} step={0.1}
                        value={intakeTemp} onChange={(e) => setIntakeTemp(Number(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    {/* Sys / Dia BP Sliders */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-bold text-slate-500">Systolic BP</label>
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 font-mono">{intakeSystolic}</span>
                        </div>
                        <input 
                          type="range" min={80} max={200}
                          value={intakeSystolic} onChange={(e) => setIntakeSystolic(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-bold text-slate-500">Diastolic BP</label>
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 font-mono">{intakeDiastolic}</span>
                        </div>
                        <input 
                          type="range" min={40} max={130}
                          value={intakeDiastolic} onChange={(e) => setIntakeDiastolic(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    </div>

                    {/* Heart Rate & Resp Rate Sliders */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-bold text-slate-500">Heart Rate</label>
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 font-mono">{intakeHR} bpm</span>
                        </div>
                        <input 
                          type="range" min={40} max={180}
                          value={intakeHR} onChange={(e) => setIntakeHR(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-bold text-slate-500">Resp Rate</label>
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 font-mono">{intakeRR} rpm</span>
                        </div>
                        <input 
                          type="range" min={10} max={60}
                          value={intakeRR} onChange={(e) => setIntakeRR(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    </div>

                    {/* SpO2 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold text-slate-500">SpO2 (Pulse Ox)</label>
                        <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 font-mono">{intakeSpO2}%</span>
                      </div>
                      <input 
                        type="range" min={70} max={100}
                        value={intakeSpO2} onChange={(e) => setIntakeSpO2(Number(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Computed Outcome */}
                  {(() => {
                    const computed = getComputedIntakeSOP();
                    return (
                      <div className={`p-4 rounded-2xl border ${computed.border} ${computed.bg} space-y-3.5 text-xs transition-colors`}>
                        <div className="flex items-center gap-2">
                          <Activity size={14} className={computed.color} />
                          <span className={`${computed.color} text-[10px] font-[1000] uppercase tracking-wider leading-none`}>{computed.label}</span>
                        </div>
                        {computed.alerts.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ACTIVE RED FLAGS ON ADMISSION</p>
                            <ul className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold space-y-0.5">
                              {computed.alerts.map((a, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-red-500">•</span> {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">MOH CLINICAL DIRECTIVE</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed leading-normal">{computed.action}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Inject Structured EMR Case report button */}
                  <button 
                    type="button"
                    onClick={injectCaseIntakeIntoChat}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-bold font-sans"
                  >
                    Formulate Case Study & Inject
                  </button>
                </div>
              ) : activeTool === 'lab_interpreter' ? (
                <div className="space-y-6 text-left">
                  {/* Hemoglobin slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hemoglobin (Hb) Level</label>
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-blue-600 dark:text-blue-400 font-mono text-xs font-bold border border-blue-100/30">{labHb} g/dL</span>
                    </div>
                    <input 
                      type="range"
                      min={2.0}
                      max={18.0}
                      step={0.1}
                      value={labHb}
                      onChange={(e) => setLabHb(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      {[6.5, 10.5, 13.5].map(v => (
                        <button 
                          type="button"
                          key={v} 
                          onClick={() => setLabHb(v)}
                          className={`py-1 text-[9px] font-mono font-bold rounded-lg border transition-all ${labHb === v ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/15 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                        >
                          {v} g/dL
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* WBC slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">White Blood Cells (WBC)</label>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold border border-indigo-100/30">{labWBC} x10⁹/L</span>
                    </div>
                    <input 
                      type="range"
                      min={1.0}
                      max={25.0}
                      step={0.1}
                      value={labWBC}
                      onChange={(e) => setLabWBC(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      {[3.5, 8.0, 16.5].map(v => (
                        <button 
                          type="button"
                          key={v} 
                          onClick={() => setLabWBC(v)}
                          className={`py-1 text-[9px] font-mono font-bold rounded-lg border transition-all ${labWBC === v ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/15 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                        >
                          {v} x10⁹/L
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Platelets slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platelet Count</label>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/10 rounded-lg text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-100/30">{labPlatelets} x10³/µL</span>
                    </div>
                    <input 
                      type="range"
                      min={10}
                      max={500}
                      step={5}
                      value={labPlatelets}
                      onChange={(e) => setLabPlatelets(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      {[80, 150, 250].map(v => (
                        <button 
                          type="button"
                          key={v} 
                          onClick={() => setLabPlatelets(v)}
                          className={`py-1 text-[9px] font-mono font-bold rounded-lg border transition-all ${labPlatelets === v ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/15 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                        >
                          {v} x10³
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Malaria RDT Selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Malaria RDT Result</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['negative', 'positive_1plus', 'positive_4plus'] as const).map(p => {
                        const labels = {
                          negative: 'Negative',
                          positive_1plus: 'Pos (1+)',
                          positive_4plus: 'Pos (4+ Severe)'
                        };
                        const col = p.startsWith('positive') ? 'text-rose-600 border-rose-500/20 bg-rose-500/5 dark:bg-rose-955/10' : 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-955/10';
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => setLabMalariaRDT(p)}
                            className={`py-2 px-1 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${labMalariaRDT === p ? col + ' border-current' : 'border-slate-100 dark:border-slate-805 text-slate-400 bg-slate-50/50 dark:bg-slate-900/30'}`}
                          >
                            {labels[p]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Urine Protein Selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urine Protein Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['negative', '1plus', '3plus'] as const).map(p => {
                        const labels = {
                          negative: 'Nil / Neg',
                          '1plus': 'Mild (1+)',
                          '3plus': 'Severe (3+)'
                        };
                        const col = p === '3plus' ? 'text-rose-600 border-rose-500/25 bg-rose-500/5 dark:bg-rose-955/10' : p === '1plus' ? 'text-amber-600 border-amber-500/25 bg-amber-500/5 dark:bg-amber-955/10' : 'text-emerald-600 border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-955/10';
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => setLabUrineProtein(p)}
                            className={`py-2 px-1 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${labUrineProtein === p ? col + ' border-current font-black' : 'border-slate-100 dark:border-slate-805 text-slate-400 bg-slate-50/50 dark:bg-slate-900/30'}`}
                          >
                            {labels[p]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lab Result Diagnosis Box */}
                  {(() => {
                    const lab = getComputedLabInterpretation();
                    return (
                      <div className={`p-5 rounded-2xl border ${lab.border} ${lab.bg} space-y-3 transition-colors`}>
                        <div className="flex items-center gap-2">
                          <Activity size={14} className={lab.color} />
                          <span className={`text-[9.5px] font-black uppercase tracking-wider leading-none ${lab.color}`}>{lab.label}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">HEMATOLOGY/BIOCHEMISTRY FINDINGS</p>
                          <ul className="text-[11px] text-slate-750 dark:text-slate-300 font-semibold space-y-1">
                            {lab.findings.map((f, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className={lab.color}>•</span> {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">MOH CLINICAL DIRECTIVE</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-450 font-semibold leading-relaxed leading-normal">{lab.action}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Inject Lab Button */}
                  <button 
                    type="button"
                    onClick={injectLabIntoChat}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-bold"
                  >
                    Inject Lab Results into Chat
                  </button>
                </div>
              ) : activeTool === 'obstetric' ? (
                <div className="space-y-6 text-left">
                  {/* Gestational Weeks slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestational Age</label>
                      <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/10 rounded-lg text-purple-600 dark:text-purple-400 font-mono text-xs font-bold border border-purple-100/30">{gestationalWeeks} Weeks</span>
                    </div>
                    <input 
                      type="range"
                      min={4}
                      max={43}
                      step={1}
                      value={gestationalWeeks}
                      onChange={(e) => setGestationalWeeks(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="grid grid-cols-4 gap-1">
                      {[12, 28, 36, 40].map(v => (
                        <button 
                          type="button"
                          key={v} 
                          onClick={() => setGestationalWeeks(v)}
                          className={`py-1 text-[9px] font-mono font-bold rounded-lg border transition-all ${gestationalWeeks === v ? 'bg-purple-600 text-white border-purple-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/15 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                        >
                          {v} Wk{v === 12 ? 's' : v === 28 ? 's' : v === 36 ? 's' : 's'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blood Pressure reading */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Systolic BP</label>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{systolicBP} mmHg</span>
                      </div>
                      <input 
                        type="range"
                        min={80}
                        max={200}
                        step={5}
                        value={systolicBP}
                        onChange={(e) => setSystolicBP(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diastolic BP</label>
                        <span className="text-xs font-mono font-bold text-slate-705 dark:text-slate-300">{diastolicBP} mmHg</span>
                      </div>
                      <input 
                        type="range"
                        min={40}
                        max={130}
                        step={5}
                        value={diastolicBP}
                        onChange={(e) => setDiastolicBP(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Obstetric Danger Checklist */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestational Alarm Check</label>
                      <span className="text-[8px] font-black uppercase text-slate-405 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">Uganda MoH protocol</span>
                    </div>
                    <div className="space-y-1.5 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-150/10 dark:bg-slate-900/10">
                      {Object.entries(obsDangerSigns).map(([flag, checked]) => {
                        const labelsMap: Record<string, string> = {
                          headache: 'Severe Splitting Headache',
                          blurredVision: 'Blurred Vision or Flashing Lights',
                          epigastricPain: 'Persistent Epigastric Pain',
                          swollenFaceHands: 'Sudden Swelling of Face and Hands',
                          reducedMovement: 'Absent / Reduced Fetal Movement'
                        };
                        return (
                          <label 
                            key={flag}
                            className="flex items-center gap-3 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors"
                          >
                            <input 
                              type="checkbox"
                              checked={checked}
                              onChange={() => setObsDangerSigns(prev => ({ ...prev, [flag]: !prev[flag] }))}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">{labelsMap[flag]}</span>
                              <span className="text-[7px] font-black px-1.5 py-0.5 bg-purple-50 dark:bg-purple-955/25 text-purple-600 dark:text-purple-400 rounded-full tracking-wider uppercase font-mono shrink-0">DANGER SIGN</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Obstetric risk analysis outcome */}
                  {(() => {
                    const obs = getComputedObstetricRisk();
                    return (
                      <div className={`p-5 rounded-2xl border ${obs.border} ${obs.bg} space-y-3 transition-colors`}>
                        <div className="flex items-center gap-2">
                          <Activity size={14} className={obs.color} />
                          <span className={`text-[9.5px] font-[1000] uppercase tracking-wider leading-none ${obs.color}`}>{obs.label}</span>
                        </div>
                        {obs.dangerFlags.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CURRENT PREGNANCY FLAGS</p>
                            <ul className="text-[11px] text-slate-750 dark:text-slate-300 font-semibold space-y-0.5">
                              {obs.dangerFlags.map((f, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className={obs.color}>•</span> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-805">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">MOH EMERGENCY MANAGEMENT ACTION</p>
                          <p className="text-[11px] text-slate-605 dark:text-slate-450 font-semibold leading-relaxed leading-normal">{obs.directive}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Inject Obstetric report button */}
                  <button 
                    type="button"
                    onClick={injectObstetricIntoChat}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-bold"
                  >
                    Inject Obstetric Summary to Chat
                  </button>
                </div>
              ) : (
                <div className="space-y-6 text-left">
                  {/* Fluid Infusion patient weight */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight reference (Body Mass)</label>
                      <span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-900/10 rounded-lg text-sky-600 dark:text-sky-400 font-mono text-xs font-bold border border-sky-100/30">{patientWeight} kg</span>
                    </div>
                    <input 
                      type="range"
                      min={2}
                      max={120}
                      value={patientWeight}
                      onChange={(e) => setPatientWeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600"
                    />
                  </div>

                  {/* Dehydration Severity selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dehydration clinical grade</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['none', 'some', 'severe'] as const).map(p => {
                        const labels = {
                          none: 'None',
                          some: 'Some (Plan B)',
                          severe: 'Severe (Plan C!)'
                        };
                        const col = p === 'severe' ? 'text-rose-600 border-rose-500/25 bg-rose-500/5 dark:bg-rose-955/15' : p === 'some' ? 'text-amber-600 border-amber-500/25 bg-amber-500/5 dark:bg-amber-955/15' : 'text-emerald-600 border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-955/15';
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => setDehydrationSeverity(p)}
                            className={`py-2 px-1 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${dehydrationSeverity === p ? col + ' border-current' : 'border-slate-100 dark:border-slate-800 text-slate-400 bg-slate-50/50 dark:bg-slate-900/30'}`}
                          >
                            {labels[p]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Giving Set Standard Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giving Set Admin Rate Calibration</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([20, 60] as const).map(rate => {
                        const labelStr = rate === 20 ? 'Standard (20 d/mL)' : 'Pediatric (60 d/mL)';
                        return (
                          <button
                            type="button"
                            key={rate}
                            onClick={() => setGivingSetDrops(rate)}
                            className={`py-2 px-1 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${givingSetDrops === rate ? 'text-sky-600 border-sky-500/30 bg-sky-500/5 dark:bg-sky-955/15' : 'border-slate-100 dark:border-slate-800 text-slate-400 bg-slate-50/50 dark:bg-slate-900/30'}`}
                          >
                            {labelStr}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Output Panel Fluid Infusion */}
                  {(() => {
                    const computedFluid = getComputedFluidInfusion();
                    return (
                      <div className={`p-5 rounded-2xl border ${computedFluid.border} ${computedFluid.bg} space-y-3 transition-colors`}>
                        <div className="flex items-center gap-2">
                          <Activity size={14} className={computedFluid.color} />
                          <span className={`text-[9.5px] font-black uppercase tracking-wider leading-none ${computedFluid.color}`}>{computedFluid.title}</span>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">MOH RESUSCITATION REGIMEN PLAN</p>
                          <p className="text-[11px] text-slate-750 dark:text-slate-300 font-semibold leading-relaxed leading-normal whitespace-pre-wrap">{computedFluid.prescription}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Inject Button */}
                  <button 
                    type="button"
                    onClick={injectFluidIntoChat}
                    className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-500/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-bold"
                  >
                    Inject Fluid Prescription into Chat
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Voice Call Modal Integration */}
      <AnimatePresence>
        {showVoiceCallModal && (
          <NeuralVoiceCall 
            user={user} 
            onClose={() => setShowVoiceCallModal(false)} 
          />
        )}
      </AnimatePresence>

      {/* Doctorian AI Core Matrix Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowSettings(false)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-3xl flex flex-col overflow-hidden max-h-[90vh]"
             >
               {/* Header */}
               <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between shrink-0">
                  <div className="text-left">
                    <h3 className="text-lg font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none m-0">Core Matrix Settings</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Control AI Synthesis Parameters</p>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors">
                    <X size={18} />
                  </button>
               </div>

               {/* Scrollable Settings Panel */}
               <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-left">
                  {/* Strict MoH Compliance */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-905/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3 font-sans shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">Strict MoH Compliance</p>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">Restrict guidance to official local guidelines</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStrictMOH(!strictMOH)}
                        className={`w-11 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${strictMOH ? 'bg-blue-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      Enforces hard alignment with the Uganda Ministry of Health guidelines. Disabling offers global clinical best practices.
                    </p>
                  </div>

                  {/* Cognitive Reasoning Engine */}
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">Cognitive Reasoning Engine</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'fast' as const, label: 'Fast (Heuristic)', desc: 'Direct responses' },
                        { id: 'cot' as const, label: 'Standard (CoT)', desc: 'Reason-led findings' },
                        { id: 'differential' as const, label: 'Differential', desc: 'Exhaustive diagnosis' }
                      ].map(mode => (
                        <button 
                          type="button"
                          key={mode.id}
                          onClick={() => setReasoningMode(mode.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${reasoningMode === mode.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500/20'}`}
                        >
                          <p className="text-[9px] font-black uppercase tracking-widest leading-none m-0">{mode.label}</p>
                          <p className={`text-[7px] font-black uppercase mt-1.5 tracking-wide leading-normal ${reasoningMode === mode.id ? 'text-white/85' : 'text-slate-400'}`}>{mode.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Health Facility Capability Tier */}
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">Primary Facility Tier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'hc2' as const, label: 'Health Center II', desc: 'SOP First-line' },
                        { id: 'hc3_4' as const, label: 'Health Center III/IV', desc: 'District Care' },
                        { id: 'regional' as const, label: 'Regional Referral', desc: 'Tertiary Hospital' }
                      ].map(tier => (
                        <button 
                          type="button"
                          key={tier.id}
                          onClick={() => setFacilityLevel(tier.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${facilityLevel === tier.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500/25'}`}
                        >
                          <p className="text-[9px] font-black uppercase tracking-wider leading-none m-0">{tier.label}</p>
                          <p className={`text-[7px] font-black uppercase mt-1.5 tracking-wide leading-normal ${facilityLevel === tier.id ? 'text-white/85' : 'text-slate-400'}`}>{tier.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Guideline Reference Libraries */}
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">MoH Reference Sources (RAG)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'ucg2023', label: 'UCG 2023', desc: 'MoH Clinical SOP' },
                        { id: 'imci', label: 'IMCI Booklet', desc: 'Childhood Illness' },
                        { id: 'sam_protocol', label: 'SAM Protocol', desc: 'Acute Malnutrition' }
                      ].map(lib => {
                        const active = ragSources.includes(lib.id);
                        return (
                          <button 
                            type="button"
                            key={lib.id}
                            onClick={() => setRagSources(prev => prev.includes(lib.id) ? prev.filter(x => x !== lib.id) : [...prev, lib.id])}
                            className={`p-3 rounded-xl border text-left transition-all ${active ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-500/20'}`}
                          >
                            <p className="text-[9px] font-black uppercase tracking-widest leading-none m-0">{lib.label}</p>
                            <p className={`text-[7px] font-black mt-1.5 tracking-wider leading-normal uppercase ${active ? 'text-white/85' : 'text-slate-400'}`}>{lib.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct Export Case Target Template */}
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">Output Case Template</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'referral_note' as const, label: 'Referral Brief', desc: 'Critical Handoff' },
                        { id: 'moh_form5' as const, label: 'Admission Form 5', desc: 'MoH Standard File' },
                        { id: 'plain' as const, label: 'Plain Notes', desc: 'Direct SOP Text' }
                      ].map(fmt => (
                        <button 
                          type="button"
                          key={fmt.id}
                          onClick={() => setExportFormat(fmt.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${exportFormat === fmt.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500/25'}`}
                        >
                          <p className="text-[9px] font-black uppercase tracking-wider leading-none m-0">{fmt.label}</p>
                          <p className={`text-[7px] font-black uppercase mt-1.5 tracking-wide leading-normal ${exportFormat === fmt.id ? 'text-white/85' : 'text-slate-400'}`}>{fmt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core Matrix UI Telemetry Stream */}
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">Operational Telemetry Logs</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'verbose' as const, label: 'Full Logs', desc: 'Diagnostic steps' },
                        { id: 'compressed' as const, label: 'Compressed', desc: 'Compact metrics' },
                        { id: 'hidden' as const, label: 'Deactivated', desc: 'Zero noise stream' }
                      ].map(tel => (
                        <button 
                          type="button"
                          key={tel.id}
                          onClick={() => setTelemetrySpeed(tel.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${telemetrySpeed === tel.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500/25'}`}
                        >
                          <p className="text-[9px] font-black uppercase tracking-wider leading-none m-0">{tel.label}</p>
                          <p className={`text-[7px] font-black uppercase mt-1.5 tracking-wide leading-normal ${telemetrySpeed === tel.id ? 'text-white/85' : 'text-slate-400'}`}>{tel.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               {/* Save button */}
               <div className="p-6 border-t border-slate-50 dark:border-slate-800/50 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                  <button 
                    onClick={async () => {
                      try {
                        await fetch('/api/ai/context', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            neuralContext,
                            strictMOH,
                            reasoningMode,
                            facilityLevel,
                            ragSources,
                            exportFormat,
                            telemetrySpeed
                          })
                        });
                        setShowSettings(false);
                        setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Clinical matrix settings stabilized.']);
                      } catch (e) {
                        setShowSettings(false);
                        setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Clinical settings saved locally.']);
                      }
                    }}
                    className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 active:scale-95 transition-all shadow-xl"
                  >
                    Stabilize Core Settings
                  </button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
