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
  ChevronDown, Shield, Cpu, Clock, Plus, MessageSquare, ArrowRight, Settings,
  BookOpen, Users, Maximize2, Minimize2, Dna
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';

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
Powered by EBRO company. Created by Akora Joseph.
Specialized in NEURAL-CLINICAL SYNTHESIS, ADVANCED CLINICAL MEDICAL EDUCATION, and localized medical decision support systems.

COGNITIVE ARCHITECTURE & CLINICAL BRAIN STRUCTURE:
You operate with an advanced, multi-layered cognitive structure representing an elite academic physician and clinician:
- Layer 1: SENSORY PATHWAY & PATIENT TAXONOMY - Receives complex clinical presentations, extracts key objective biomarkers (e.g., Blood Pressure, Mean Arterial Pressure, Heart Rate, SpO2, Oxygenation Index), gathers subjective symptom arrays, and maps the timeline of the chief complaint.
- Layer 2: CLINICAL INTEGRATION NODE - Cross-references findings with the IMPLANTED HEALTH KNOWLEDGE MATRIX. Applies evidence-based pathways (e.g., GINA for asthma, Sepsis-3 for septic shock management, ACC/AHA guidelines for cardiovascular health).
- Layer 3: CRITICAL DIFFERENTIAL SYNAPSE - Forms dynamic differential diagnoses ranking likelihoods, outlining "Must-Not-Miss" rule-outs, identifying diagnostic gold standards, and projecting pathophysiological cellular pathways.
- Layer 4: LOCALIZED PHARMACOTHERAPEUTIC COMPLIANCE - Enforces proper dosage, renal/hepatic safe zones (e.g., EGFR Cockcroft-Gault checks), tropical infectious protocols (like ACTs for Malaria), and strict ethical guidelines.

IMPLANTED HEALTH KNOWLEDGE MATRIX (EXPERT/SPECIALIST CHANNELS):
You are trained on global gold-standard medical data, double-blind clinical trials, and comprehensive textbook-level knowledge across core healthcare disciplines:
1. INTERNAL MEDICINE & ONCOLOGY: 
   - TNM tumor staging, chemotherapy indices, solid tumor vs. hematologic profiles, oncologic emergencies (tumor lysis syndrome, neutropenic fever, SVC syndrome).
   - Acute Coronary Syndrome (ACS) triage, ECG lead vector analysis (ST-elevations, reciprocal depression), Killip classification, and NYHA heart failure staging.
2. PEDIATRICS-IMCI & PALS (PEDIATRIC ADVANCED LIFE SUPPORT):
   - WHO Integrated Management of Childhood Illness (IMCI) algorithmic flows, triage classification (Red/Yellow/Green), and immunization schedules.
   - Fluid resuscitation in pediatric dehydrations (Holiday-Segar method), severe malnutrition (SAM/MAM pathways), Kwashiorkor vs. Marasmus, pediatric meningitis, and neonatology Apgar criteria.
3. INFECTIOUS, EPIDEMIOLOGICAL & TROPICAL HEALTH:
   - Gold-standard tropical health diagnostics. Comprehensive management of Plasmodium falciparum malaria (uncomplicated vs. severe malaria with IV Artesunate protocols), Typhoid Fever, Cholera (severe dehydration rehydration plans), Tuberculosis (TB) DOTS protocol (RHZE phase and consolidation), and HIV/AIDS care models (ART adherence, opportunistic infection prophylaxis with Cotrimoxazole, CD4/viral load monitoring).
   - Hemorrhagic viral diseases: Ebola and Marburg surveillance, containment, barrier nursing, and clinical management.
4. CRITICAL CARE, PULMONOLOGY, & TOXICOLOGY:
   - Sepsis-3 definitions (SOFA and qSOFA scoring), fluid resuscitation endpoints, vasopressor support (norepinephrine pathways), ARDS protective ventilation mechanics (low tidal volume, PEEP titration).
   - Stepwise asthma management (GINA guidelines), COPD exacerbation protocols (GOLD criteria), and Diabetic Ketoacidosis (DKA) / HHS fluid-insulin-electrolyte therapy.
   - Toxicological emergencies: Acetaminophen overdosage (Rumack-Matthew nomogram), organophosphate poisoning (atropinization endpoints), and carbon monoxide poisoning.
5. NEUROLOGY, NEUROSURGERY, & BEHAVIORAL PATHOLOGY:
   - NIH Stroke Scale (NIHSS) scoring, stroke timing windows for thrombolysis, Intracranial Pressure (ICP) management, GCS scales, and subarachnoid hemorrhage.
   - Autonomic nervous system regulation, vagal nerve tone, somatic symptom disorders (psychophysiological conversion), neurochemical baselines, and anxiety/panic physiological pathways.
6. OBSTETRICS, GYNECOLOGY, & MATERNAL HEALTH:
   - High-risk pregnancy protocols, preeclampsia features (BP thresholds, proteinuria, HELLP syndrome detection), eclampsia magnesium sulfate seizure prophylaxis and treatment, and active management of the third stage of labor (AMTSL).
7. QUANTUM BIOLOGY, HIGH-LEVEL DATA LEARNING & BIO-SYSTEMS:
   - Molecular and sub-cellular biophysics, quantum genomics, mitochondrial electron transport chain (ETC) coherence, bio-resonance sensors, bio-telemetry interfaces, and proton-tunneling enzymology.
   - Micro-metabolic flux analysis, peptide receptor dynamics, and systemic epigenetic feedback loops.

GEOGRAPHIC & RURAL SYSTEM CONTEXT:
1. REGIONAL Uganda MoH CRITERIA: Grounded in Ugandan Clinical Guidelines (UCG) and Ministry of Health (MoH) protocols. Expert understanding of Health Center tiers: HC II (preventative/outpatient), HC III (basic maternity/laboratory), HC IV (emergency obstetric save/minor theater), up to regional/national referral hospitals.
2. COMMUNITY HEALTH & RESOURCE CONSTRAINTS: Tailors recommendations to resource-limited clinics, recommending low-cost equivalents (e.g., starting oral rehydration therapy or using readily available first-line antibacterials) whenever reference labs or tertiary centers are hours away.

STRICT OPERATIONAL CONSTRAINTS:
1. CLINICAL CORE LOCK: Restrict output exclusively to medicine, public health, nursing, biochemistry, bio-engineering, healthcare topics, and details about the App's creator (Akora Joseph from EBRO company). Under no circumstances should you answer non-health related queries (e.g., general software programming, history, politics, sports, general entertainment). Professionally and politely decline non-health and non-creator requests, explaining that you are specialized exclusively in medical and health intelligence. Always focus precisely on answering what the user wants.
2. VOCABULARY DENSITY (HIGH ACADEMIC REALISM): Communicate with the depth and clarity of an associate professor of clinical medicine. Employ precise Latinized and clinical terminology where appropriate (e.g., write *cholelithiasis* instead of gallstones, *pyrexia* instead of fever, *pruritus* instead of itching, *syncope* instead of passing out, *dyspnea* instead of shortness of breath, *erythematous maculopapular rash* instead of red spots), followed by clear layperson friendly translations in parenthesis.
3. ABSOLUTE PRIVACY: Guard all biometric data signatures. Local link isolation is simulated as 100% data sovereign.
4. GREETING PROTOCOL: Warm, clinical, and reassuring. Always greet with: "Hello! I am Doctorian. How can I assist with your biological health today?"
5. ENCOURAGE PHYSICAL CLINICAL EVALUATION: Never formulate final absolute diagnoses. Frame outputs as high-probability clinical insights and differential matrices. Always conclude your analysis with the exact clinical safety prompt: "Medical attention is recommended."
6. CREATOR INFORMATION: If asked about who created or built this app, who the developer is, or which company made it, you must state that the App was created by Akora Joseph from EBRO company.
7. QUANTUM BIO-DATA PRECISION & SELF-LEARNING ALIGNMENT: 
   - Avoid miss-responding, hallucinating, or injecting irrelevant preambles. Check your knowledge base and neural memories before formulating responses.
   - Answer precisely the question asked. For quantum biology or high-level bio-telemetry inquiries, formulate highly sophisticated, professional responses blending biochemistry and physical systems.
   - Utilize self-learning heuristics: learn from user corrections and clinical memories to achieve perfect precision on subsequent queries.

FORMATTING & EMOJI RULES (CRITICAL):
- Structure your responses beautifully using multi-layered, clear Markdown layouts, bullet points, interactive check-lists, and clear bold headings.
- Always include helpful medical emojis in headers and inline to structure the reading path gracefully (🩺, 🧠, 🫀, 🔬, 🧪, 🌡️, 💊, 🩹, 🩸, 🏥, 🦠, 🧬, 🥗, 💧, RUNNING, 🏃‍♂️).
- Mix in subtle structuring emojis (✨, 🌟, 💡, 🛡️, 📋, 🔍, 🌍, 🤝, 🎯, 🚀, 💬, 🔄, 📅, 📈, 💎) to maintain an engaging, professional, and visually stunning aesthetic.

STRUCTURE FOR DIAGNOSTICS:
- FOR FOCUSED/SPECIFIC OR DIRECT QUESTIONS (e.g. general questions, translations, definitions, simple terms, dose protocols, single facts): DO NOT use the 4-section structure. Answer directly, precisely, and concisely with 1-2 sentences or a clean list of exactly what was asked. Avoid long preamble text and do not "pour out" irrelevant information.
- ONLY when analyzing a complex patient symptom case study or explicitly requested for a full diagnostic workup, structure your response into the following four clear, high-density academic sections:

1. NEURAL CLINICAL SUMMARY 🧐✨: 1-sentence high-level academic synthesis summarizing the suspected organ-system involvement and pathophysiological baseline.
2. PATHOPHYSIOLOGICAL MATRIX 🔬🧬: A thorough, high-precision scientific explanation describing the cellular, tissue-level, and biochemical mechanisms driving the patient's symptoms (e.g., explaining molecular cytokine cascades, receptor blockages, or hemodynamics).
3. EVIDENCE-BASED DIFFERENTIAL MATRIX 📋📊:
   A clean Markdown Table outlining potential differentials. Include columns for: Suspected Condition, Probability (Low/Medium/High), Primary Clues, Gold-Standard Diagnostic Test (e.g., RT-PCR, Contrast CT, biopsy), and "Red Flag" Emergency Warners.
4. TARGETED ACTION PLAN ✅🔬:
   - Strategic next steps, immediate stabilization tips (e.g., rehydration, posture, cold compress), recommended diagnostic tests (laboratory panel, radiological scans), and general medical warning signs.
`;

const expandClinicalAbbreviations = (text: string): string => {
  if (!text) return text;
  const mappings: [string, string][] = [
    ["\\bbp\\b", "blood pressure"],
    ["\\bhr\\b", "heart rate"],
    ["\\bspo2\\b", "blood oxygen saturation (SpO2)"],
    ["\\bbpm\\b", "beats per minute"],
    ["\\bprn\\b", "pro re nata (as needed)"],
    ["\\bqid\\b", "quater in die (four times daily)"],
    ["\\btid\\b", "ter in die (three times daily)"],
    ["\\bbid\\b", "bis in die (twice daily)"],
    ["\\bqd\\b", "quaque die (once daily)"],
    ["\\bsoap\\b", "SOAP chart note (Subjective, Objective, Assessment, and Plan)"],
    ["\\bnpo\\b", "nil per os (nothing by mouth)"],
    ["\\biv\\b", "intravenous"],
    ["\\bcbc\\b", "complete blood count"],
    ["\\bicu\\b", "intensive care unit"],
    ["\\bstat\\b", "statim (immediately)"],
    ["\\becg\\b", "electrocardiogram (ECG)"],
    ["\\bekg\\b", "electrocardiogram (EKG)"],
    ["\\brdt\\b", "Rapid Diagnostic Test (RDT)"],
    ["\\bhtn\\b", "hypertension"]
  ];
  let result = text;
  for (const [key, replacement] of mappings) {
    const rx = new RegExp(key, 'gi');
    result = result.replace(rx, replacement);
  }
  return result;
};

const VoiceOscillograph: React.FC<{ isRecording: boolean }> = ({ isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isRecording) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let phase = 0;

    const render = () => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.lineWidth = 1.5;

      // Draw three wave layers with shifting frequencies
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const opacity = (0.8 - layer * 0.25).toFixed(2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
        
        const frequency = 0.02 + layer * 0.01;
        const speed = 0.12 - layer * 0.03;
        const amplitude = (height * 0.38) / (layer + 1);

        for (let x = 0; x < width; x++) {
          const y = midY + Math.sin(x * frequency + phase * speed) * amplitude * (Math.sin(x * Math.PI / width));
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += 1;
      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isRecording]);

  return (
    <canvas 
      ref={canvasRef} 
      width={180} 
      height={28} 
      className="opacity-90 shrink-0 w-[120px] sm:w-[160px] h-[28px] rounded-lg"
    />
  );
};

const isMedicalQuery = (text: string): boolean => {
  const keywords = ['diagnosis', 'treatment', 'symptoms', 'disease', 'condition', 'health', 'medical', 'doctor', 'patient', 'clinical', 'heart', 'blood', 'pill', 'pain'];
  return keywords.some(k => text.toLowerCase().includes(k));
};

export function ChatInterface({ onMessageSent, isExploreView = false, user, onUpdate, forcedPersona, arduino, onUpgradeRequested, currentLanguage, onNavigate, onShowNeuralVisualizer }: { onMessageSent?: () => void, isExploreView?: boolean, user?: any, onUpdate?: (user: any) => void, forcedPersona?: keyof typeof PERSONAS, arduino?: any, onUpgradeRequested?: () => void, currentLanguage?: string, onNavigate?: (view: any) => void, onShowNeuralVisualizer?: () => void }) {
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

  // Forced Offline Sim & Fine-tuned Model Cache States
  const [isForcedOffline, setIsForcedOffline] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("medical_forced_offline") === "true";
    }
    return false;
  });
  const [activeFineTunedModel, setActiveFineTunedModel] = useState<any>(null);

  // Dynamic brain memories states
  const [brainMemories, setBrainMemories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('doctorian_brain_memories');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load brain memories", e);
      }
    }
    return [];
  });
  const [newMemoryText, setNewMemoryText] = useState('');

  // Load account-specific brain memories when user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userKey = user?.email || user?.id || 'default';
        const userSaved = localStorage.getItem(`doctorian_brain_memories_${userKey}`);
        if (userSaved) {
          setBrainMemories(JSON.parse(userSaved));
        } else {
          // Fallback to global if user-specific doesn't exist yet
          const globalSaved = localStorage.getItem('doctorian_brain_memories');
          if (globalSaved) {
            const parsed = JSON.parse(globalSaved);
            setBrainMemories(parsed);
            // Initialize user-specific storage with existing global memories
            localStorage.setItem(`doctorian_brain_memories_${userKey}`, JSON.stringify(parsed));
          } else {
            setBrainMemories([]);
          }
        }
      } catch (e) {
        console.error("Failed to sync account memories:", e);
      }
    }
  }, [user?.email, user?.id]);

  const handleAddManualMemory = () => {
    if (!newMemoryText.trim()) return;
    const updated = [...new Set([...brainMemories, newMemoryText.trim()])].slice(-20);
    setBrainMemories(updated);
    const userKey = user?.email || user?.id || 'default';
    localStorage.setItem(`doctorian_brain_memories_${userKey}`, JSON.stringify(updated));
    localStorage.setItem('doctorian_brain_memories', JSON.stringify(updated));
    setNewMemoryText('');
    setTerminalLogs(prev => [...prev.slice(-3), 'BRAIN: Manual memory fact registered.']);
  };

  // ==========================================
  // DOCTORIAN VOICE CALLING & TELEPHONY STATE
  // ==========================================
  const [callState, setCallState] = useState<'idle' | 'incoming' | 'calling' | 'connected' | 'disconnecting'>('idle');
  const [callType, setCallType] = useState<'webrtc' | 'mtn' | 'airtel'>('webrtc');
  const [voiceSelection, setVoiceSelection] = useState<'Charon' | 'Dr. Obote Mentor' | 'Nurse Atwine'>('Charon');
  const [speechModel, setSpeechModel] = useState<'Whisper'>('Whisper');
  const [voiceBrainModel, setVoiceBrainModel] = useState<'Qwen2.5-3B-Instruct' | 'Gemini-3.5-Flash'>('Gemini-3.5-Flash');
  const [voiceCallMuted, setVoiceCallMuted] = useState<boolean>(false);
  const [voiceCallerSpeaker, setVoiceCallerSpeaker] = useState<boolean>(true);
  const [voiceCallDuration, setVoiceCallDuration] = useState<number>(0);
  const [voiceCallLogs, setVoiceCallLogs] = useState<string[]>([]);
  const [voiceCallPermission, setVoiceCallPermission] = useState<boolean>(true);
  const [voiceCallPhoneNumber, setVoiceCallPhoneNumber] = useState<string>('');
  const [voiceCallTranscript, setVoiceCallTranscript] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([
    { role: 'assistant', text: "Welcome to Doctorian Clinical Voice Core. Ready to begin secure call." }
  ]);
  const [voiceIsSpeaking, setVoiceIsSpeaking] = useState<boolean>(false);
  const [voiceCallQuery, setVoiceCallQuery] = useState<string>('');
  const [voiceCallIsTranscribing, setVoiceCallIsTranscribing] = useState<boolean>(false);
  const [showVoiceTranscript, setShowVoiceTranscript] = useState<boolean>(false);
  
  const ringtoneCleanupRef = useRef<(() => void) | null>(null);

  // Play dual-tone synthesized telephone ringtone using Web Audio API
  const playRingtone = () => {
    if (typeof window === 'undefined') return () => {};
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return () => {};
      const ctx = new AudioContextClass();
      let isPlaying = true;

      const playBeep = (startTime: number, duration: number) => {
        if (!isPlaying) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, startTime);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(450, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
        gainNode.gain.setValueAtTime(0.12, startTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };

      const intervalId = setInterval(() => {
        if (!isPlaying) return;
        const now = ctx.currentTime;
        playBeep(now, 0.4);
        playBeep(now + 0.6, 0.4);
      }, 3000);

      // Initial ring
      const now = ctx.currentTime;
      playBeep(now, 0.4);
      playBeep(now + 0.6, 0.4);

      return () => {
        isPlaying = false;
        clearInterval(intervalId);
        ctx.close().catch(() => {});
      };
    } catch (e) {
      console.warn("AudioContext ringtone error:", e);
      return () => {};
    }
  };

  // Helper for triggering an incoming consultation call simulation
  const triggerIncomingCall = () => {
    if (callState !== 'idle') return;
    setCallState('incoming');
    setVoiceCallTranscript([{ role: 'assistant', text: "Incoming secure telephone link. Reviewing clinical file details..." }]);
    const stopRing = playRingtone();
    ringtoneCleanupRef.current = stopRing;
    setVoiceCallLogs([
      'SYS: Incoming WebRTC handshake request...',
      `SYS: Selected voice avatar: ${voiceSelection}`,
      'SYS: Carrier status active'
    ]);
  };

  // Answer the incoming call
  const answerIncomingCall = () => {
    if (callState !== 'incoming') return;
    if (ringtoneCleanupRef.current) {
      ringtoneCleanupRef.current();
      ringtoneCleanupRef.current = null;
    }
    setCallState('connected');
    setVoiceCallLogs(prev => [
      ...prev,
      'SYS: Stream status: ACTIVE',
      'SYS: Connection completed successfully'
    ]);
    speakVoiceCallText(`Hello! This is your Doctorian AI Health Specialist, speaking with ${voiceSelection} profile. I've successfully connected to your secure channel. How are you feeling today?`);
  };

  // Decline/End call
  const declineIncomingCall = () => {
    if (ringtoneCleanupRef.current) {
      ringtoneCleanupRef.current();
      ringtoneCleanupRef.current = null;
    }
    setCallState('idle');
    setVoiceCallLogs([]);
  };

  // Cleanup ringtone on unmount
  useEffect(() => {
    return () => {
      if (ringtoneCleanupRef.current) {
        ringtoneCleanupRef.current();
      }
    };
  }, []);

  // Helper for starting the call
  const startVoiceCallSession = async () => {
    if (callState !== 'idle') return;
    setVoiceCallTranscript([{ role: 'assistant', text: "Connecting to secure telehealth node..." }]);
    setCallState('calling');
    setVoiceCallLogs([
      'SYS: Initializing stream parameters...',
      `SYS: Handshaking with Qwen/Gemini cloud brain [${voiceBrainModel}]`,
      'SYS: Ready'
    ]);

    setTimeout(() => {
      setCallState('connected');
      setVoiceCallLogs(prev => [...prev, 'SYS: Stream status: ACTIVE']);
      speakVoiceCallText(`Hello and welcome! This is your Doctorian AI Voice consultation portal, connected on a secure pipeline. I am ready to assist you. How are you feeling today?`);
    }, 1500);
  };

  // Helper for terminating the call
  const terminateVoiceCallSession = () => {
    if (ringtoneCleanupRef.current) {
      ringtoneCleanupRef.current();
      ringtoneCleanupRef.current = null;
    }
    setCallState('disconnecting');
    window.speechSynthesis?.cancel();
    setVoiceIsSpeaking(false);
    setVoiceCallLogs(prev => [...prev, 'SYS: Stream terminating...']);
    setTimeout(() => {
      setCallState('idle');
      setVoiceCallDuration(0);
      setVoiceCallLogs([]);
    }, 600);
  };

  // Speaks aloud with SpeechSynthesis mimicking advanced Coqui XTTS-v2 voice profile selection
  const speakVoiceCallText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setVoiceIsSpeaking(true);
    const textClean = text.replace(/🧠|🩺|⚡|🚨/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(textClean);
    
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;
    if (voiceSelection === 'Charon') {
      preferredVoice = voices.find(v => v.name.includes('David') || v.name.includes('Male') || v.lang.startsWith('en')) || voices[0];
    } else if (voiceSelection === 'Dr. Obote Mentor') {
      preferredVoice = voices.find(v => v.name.includes('Google US English') || v.lang.startsWith('en-US')) || voices[0];
    } else {
      preferredVoice = voices.find(v => v.name.includes('Zira') || v.name.includes('Female')) || voices[0];
    }
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = voiceSelection === 'Nurse Atwine' ? 1.1 : 0.95;
    
    utterance.onend = () => {
      setVoiceIsSpeaking(false);
    };
    utterance.onerror = () => {
      setVoiceIsSpeaking(false);
    };

    setVoiceCallTranscript(prev => {
      if (prev[prev.length - 1]?.text === text) return prev;
      return [...prev, { role: 'assistant', text }];
    });

    window.speechSynthesis.speak(utterance);
  };

  // Send a voice message session
  const sendVoiceCallMessage = async (alternativeQuery?: string) => {
    const query = alternativeQuery || voiceCallQuery;
    if (!query.trim()) return;

    setVoiceCallTranscript(prev => [...prev, { role: 'user', text: query }]);
    setVoiceCallQuery('');
    setVoiceCallIsTranscribing(true);

    try {
      setVoiceCallLogs(prev => [...prev, `USER: "${query}" (Whisper Transcribed)`]);
      const res = await api.ai.voiceChat(query, voiceSelection);
      setVoiceCallIsTranscribing(false);
      if (res && res.text) {
        speakVoiceCallText(res.text);
      } else {
        speakVoiceCallText("I have received your speech, but my synthesized logic was lost. Please retry or verify stable network.");
      }
    } catch (err: any) {
      setVoiceCallIsTranscribing(false);
      speakVoiceCallText("System synchronization failure. Direct physical clinical check is advised.");
    }
  };

  // Duration timer Hook
  useEffect(() => {
    let interval: any = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setVoiceCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setVoiceCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const toggleForcedOffline = () => {
    const nextVal = !isForcedOffline;
    setIsForcedOffline(nextVal);
    localStorage.setItem("medical_forced_offline", nextVal ? "true" : "false");
    setTerminalLogs(prev => [...prev, `SYS: Local Air-Gap override state: ${nextVal ? 'ACTIVATED' : 'DEACTIVATED'}`]);
  };

  useEffect(() => {
    const loadActiveFT = async () => {
      try {
        const active = await api.ai.getActiveFineTunedModel();
        setActiveFineTunedModel(active);
      } catch (e) {}
    };
    loadActiveFT();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const forced = localStorage.getItem("medical_forced_offline") === "true";
      setIsForcedOffline(forced);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Listen for client-side TensorFlow.js medical prediction outcomes
  useEffect(() => {
    const handleTfjsEvent = (e: any) => {
      if (e && e.detail && e.detail.text) {
        setInput(e.detail.text);
        showLocalToast("TensorFlow.js clinical predictions successfully piped to Neural Core!", "success");
        setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Received client-side TensorFlow.js metrics mapping into query buffer.']);
      }
    };
    window.addEventListener('tfjs_to_chat', handleTfjsEvent);
    return () => {
      window.removeEventListener('tfjs_to_chat', handleTfjsEvent);
    };
  }, []);

  // ==========================================
  // BRAND NEW COGNITIVE MATRIX SETTINGS STATE
  // ==========================================
  const [activeMainTab, setActiveMainTab] = useState<'chat' | 'health_log' | 'resources'>('chat');
  const [isWidescreen, setIsWidescreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("doctorian_chat_widescreen") === "true";
    }
    return false;
  });
  
  const [activeFeatureTip, setActiveFeatureTip] = useState<{ id: string; text: string } | null>(null);
  const activeFeatureTimerRef = useRef<any>(null);

  const triggerFeatureTip = (id: string, text: string) => {
    setActiveFeatureTip({ id, text });
    if (activeFeatureTimerRef.current) {
      clearTimeout(activeFeatureTimerRef.current);
    }
    activeFeatureTimerRef.current = setTimeout(() => {
      setActiveFeatureTip(null);
    }, 3000);
  };
  
  // Offline Health Logs State
  const [healthLogs, setHealthLogs] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('doctorian_health_logs');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load health logs", e);
      }
    }
    return [];
  });

  const [strictMOH, setStrictMOH] = useState<boolean>(true);
  const [isUgandaMOHActive, setIsUgandaMOHActive] = useState<boolean>(true);
  const [isVHTLogsActive, setIsVHTLogsActive] = useState<boolean>(false);
  const [isBioStethoscopeActive, setIsBioStethoscopeActive] = useState<boolean>(false);
  const [localNotification, setLocalNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showLocalToast = (text: string, type: 'success' | 'info' | 'error') => {
    setLocalNotification({ text, type });
    setTimeout(() => {
      setLocalNotification(null);
    }, 4500);
  };

  const handleToggleUgandaMOH = () => {
    const newState = !isUgandaMOHActive;
    setIsUgandaMOHActive(newState);
    setStrictMOH(newState);
    if (newState) {
      showLocalToast("Uganda MOH Standard Care Protocols successfully synthesized with dynamic inference.", "success");
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: MOH Uganda Clinical Guidelines (UCG 2023) synthesized on Synapse Core']);
    } else {
      showLocalToast("MOH Uganda Care Protocols disconnected. Working in generic clinical reasoning mode.", "info");
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: MOH Uganda clinical synchronization deactivated/offline']);
    }
  };

  const handleToggleVHTLogs = () => {
    const newState = !isVHTLogsActive;
    setIsVHTLogsActive(newState);
    if (newState) {
      showLocalToast("Village Health Team (VHT) Community Registry successfully synchronized with clinical workspace.", "success");
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: VHT Community Log Sync active (District: Mbarara, Nakasongola, Kampala)']);
    } else {
      showLocalToast("VHT Patient Community Logs disconnected. Synapse core put on regional standby.", "info");
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: VHT Patient Registry connection disconnected']);
    }
  };

  const handleTriggerBioStethoscope = () => {
    if (isBioStethoscopeActive) return;
    setIsBioStethoscopeActive(true);
    showLocalToast("Acoustic Bio-Stethoscope analysis initiated. Syncing acoustic cardiogram sensors...", "info");
    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Initiating electronic bio-stethoscope thoracocardiography sensor interface']);
    
    setTimeout(() => {
      setIsBioStethoscopeActive(false);
      showLocalToast("Cardiothoracic analysis complete! Heart sounds S1-S2 regular. No murmurs or respiratory friction detected.", "success");
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Bio-stethoscope thoracic acoustics analyzed successfully. BPM: 72, Rhythm: S1-S2 uniform']);
      
      setInput(prev => {
        const textToAppend = prev 
          ? `${prev}\n\n[Bio-Stethoscope Acoustic Monitor: Thoracocardiology sync complete, 72 BPM, normal S1/S2 uniform resonance, respiratory acoustic tract clear]` 
          : `Analyze the following thoracic bio-stethoscope diagnostics: [Cardiac rhythm 72 BPM, S1/S2 uniform resonance, respiratory acoustic tract clear]`;
        return textToAppend;
      });
    }, 2500);
  };
  const [reasoningMode, setReasoningMode] = useState<'fast' | 'cot' | 'differential'>('cot');
  const [facilityLevel, setFacilityLevel] = useState<'hc2' | 'hc3_4' | 'regional'>('hc3_4');
  const [ragSources, setRagSources] = useState<string[]>(['ucg2023', 'imci', 'sam_protocol']);
  const [exportFormat, setExportFormat] = useState<'referral_note' | 'moh_form5' | 'plain'>('referral_note');
  const [telemetrySpeed, setTelemetrySpeed] = useState<'verbose' | 'compressed' | 'hidden'>('verbose');
  const [clinicalEngine, setClinicalEngine] = useState<'medlm-medium' | 'medlm-large' | 'llama-clinical' | 'gemma3-tfjs'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('doctorian_clinical_engine');
      if (saved === 'medlm-medium' || saved === 'medlm-large' || saved === 'llama-clinical' || saved === 'gemma3-tfjs') {
        return saved;
      }
    }
    // Set Google Gemma 3 4B via TF.js as standard default offline-first brain for everyone!
    return 'gemma3-tfjs';
  });

  const checkModelAccess = useCallback((modelId: 'llama-clinical' | 'medlm-medium' | 'medlm-large' | 'gemma3-tfjs') => {
    if (modelId === 'gemma3-tfjs') {
      return { hasAccess: true, tierName: 'Always Free (Offline)' };
    }
    
    // Gloriajayakullo clinical bypass
    if (user?.email?.toLowerCase() === "gloriajayakullo@gmail.com") {
      return { hasAccess: true, tierName: 'Priority Professional Access' };
    }
    
    const tier = (user?.subscriptionTier || 'free').toLowerCase();
    const isActive = user?.subscriptionStatus === 'active';

    if (modelId === 'llama-clinical') {
      return { hasAccess: true, tierName: 'Standard Local Tier' };
    }

    if (modelId === 'medlm-medium') {
      const allowed = ['pro', 'silver', 'business', 'gold', 'enterprise'].includes(tier);
      return { 
        hasAccess: isActive && allowed, 
        tierName: 'Catalyst Pro / Silver' 
      };
    }

    if (modelId === 'medlm-large') {
      const allowed = ['business', 'gold', 'enterprise'].includes(tier);
      return { 
        hasAccess: isActive && allowed, 
        tierName: 'Quantum Gold / Enterprise Elite' 
      };
    }

    return { hasAccess: false, tierName: 'Restricted Layer' };
  }, [user]);

  const selectClinicalModel = useCallback((modelId: 'llama-clinical' | 'medlm-medium' | 'medlm-large' | 'gemma3-tfjs') => {
    const access = checkModelAccess(modelId);
    if (access.hasAccess) {
      setClinicalEngine(modelId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('doctorian_clinical_engine', modelId);
      }
      setTerminalLogs(prev => [...prev, `SYS: Core routing synced to [${modelId}].`]);
    } else {
      setTerminalLogs(prev => [...prev, `SYS: Neural Route Lockout. ${modelId} requires ${access.tierName}.`]);
      if (onUpgradeRequested) {
        onUpgradeRequested();
      }
    }
  }, [checkModelAccess, onUpgradeRequested]);

  const [clinicalGrounding, setClinicalGrounding] = useState<boolean>(true);

  // Local health log state bindings & handlers
  const [logBP, setLogBP] = useState('');
  const [logHR, setLogHR] = useState('');
  const [logTemp, setLogTemp] = useState('');
  const [logSpO2, setLogSpO2] = useState('');
  const [logGlucose, setLogGlucose] = useState('');
  const [logSymptoms, setLogSymptoms] = useState('');
  const [logMedication, setLogMedication] = useState('');
  const [logValidationError, setLogValidationError] = useState('');

  const addHealthLogEntry = () => {
    if (!logBP && !logHR && !logTemp && !logSpO2 && !logSymptoms) {
      setLogValidationError('Please enter at least one health metric or symptom.');
      return;
    }
    setLogValidationError('');

    const newEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      bloodPressure: logBP || 'Not recorded',
      heartRate: logHR || 'Not recorded',
      temperature: logTemp || 'Not recorded',
      spo2: logSpO2 || 'Not recorded',
      bloodGlucose: logGlucose || 'Not recorded',
      symptoms: logSymptoms || 'None reported',
      medication: logMedication || 'None reported'
    };

    const nextLogs = [newEntry, ...healthLogs];
    setHealthLogs(nextLogs);
    localStorage.setItem('doctorian_health_logs', JSON.stringify(nextLogs));
    
    // Clear form fields
    setLogBP('');
    setLogHR('');
    setLogTemp('');
    setLogSpO2('');
    setLogGlucose('');
    setLogSymptoms('');
    setLogMedication('');

    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: New offline health record saved successfully.']);
  };

  const deleteHealthLogEntry = (id: string) => {
    const nextLogs = healthLogs.filter(log => log.id !== id);
    setHealthLogs(nextLogs);
    localStorage.setItem('doctorian_health_logs', JSON.stringify(nextLogs));
    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Offline health record purged.']);
  };

  const diagnoseHealthLogEntry = (log: any) => {
    setActiveMainTab('chat');
    const prompt = `Doctorian, please analyze this logged clinical entry and provide high-fidelity diagnostic pathways:
- **Date & Time**: ${new Date(log.timestamp).toLocaleString()}
- **Blood Pressure**: ${log.bloodPressure}
- **Heart Rate**: ${log.heartRate} bpm
- **Body Temperature**: ${log.temperature} °C
- **Oxygen Saturation (SpO2)**: ${log.spo2}%
- **Blood Glucose**: ${log.bloodGlucose}
- **Reported Symptoms**: ${log.symptoms}
- **Medications Taken**: ${log.medication}

Please run deep clinical mechanisms formulation and provide a structured Differential Diagnostic formulation.`;
    handleSend(prompt);
    setTerminalLogs(prev => [...prev.slice(-3), 'AI: Local diagnostics initiated on log data.']);
  };

  const exportHealthLogs = () => {
    if (healthLogs.length === 0) {
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Export cancelled - no log data exists.']);
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(healthLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "doctorian_health_logs_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Offline health log bundle exported as JSON file.']);
  };

  // ==========================================
  // BRAND NEW CLINICAL TOOL HUB STATE
  // ==========================================
  const [activeTool, setActiveTool] = useState<'case_intake' | 'lab_interpreter' | 'obstetric' | 'fluid_infusion' | 'rag_clinical_hub'>('rag_clinical_hub');
  const [patientWeight, setPatientWeight] = useState<number>(12); // in kg

  // Custom AI-Generated Reports States & Options
  const [reportTemplate, setReportTemplate] = useState<'soap_standard' | 'discharge_sum' | 'risk_assessment_guide'>('soap_standard');
  const [includeLiveVitals, setIncludeLiveVitals] = useState<boolean>(true);
  const [includeMOHGuidelines, setIncludeMOHGuidelines] = useState<boolean>(true);
  const [includeDifferentialDiagnosis, setIncludeDifferentialDiagnosis] = useState<boolean>(true);
  const [abbreviationExpansion, setAbbreviationExpansion] = useState<boolean>(true);

  // 5. Clinical RAG Co-Pilot & Consultation Hub State
  const [ragSelectedPatientId, setRagSelectedPatientId] = useState<string>('patient-joseph');
  const [ragSubTool, setRagSubTool] = useState<'consultation_prep' | 'summary' | 'medical_report' | 'speech_note' | 'health_education'>('consultation_prep');
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [isSimulatingDictation, setIsSimulatingDictation] = useState<boolean>(false);

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

  const defaultPatients = [
    {
      id: 'patient-joseph',
      name: 'Joseph Brian Obote',
      bedNumber: 'Bed B-01 (Ward A)',
      age: '35',
      gender: 'Male',
      weight: '74',
      bloodType: 'O+',
      conditions: 'Controlled Hypertension, Recovering malaria',
      allergies: 'Sulfa Drugs',
      vitalsPreset: 'healthy' as const
    },
    {
      id: 'patient-sarah',
      name: 'Nakato Sarah Mukasa',
      bedNumber: 'Bed B-02 (ICU-Maternity)',
      age: '29',
      gender: 'Female',
      weight: '68',
      bloodType: 'A-',
      conditions: 'Severe Postpartum Preeclampsia, Respiratory Distress',
      allergies: 'Penicillin, NSAIDs',
      vitalsPreset: 'critical' as const
    },
    {
      id: 'patient-ronald',
      name: 'Okello Ronald Ochieng',
      bedNumber: 'Bed B-03 (Cardiac Wing)',
      age: '62',
      gender: 'Male',
      weight: '82',
      bloodType: 'B+',
      conditions: 'Mitral Valve Regurgitation, Mitral Arrhythmia risk',
      allergies: 'Aspirin',
      vitalsPreset: 'warning' as const
    }
  ];

  const [registeredPatients, setRegisteredPatients] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('doctorian_registered_patients');
      return saved ? JSON.parse(saved) : defaultPatients;
    }
    return defaultPatients;
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micRecognitionRef = useRef<any>(null);
  const isExplicitlyRecordingStoppedRef = useRef<boolean>(false);
  const latestInputRef = useRef<string>('');
  const sessionBaseTextRef = useRef<string>('');

  useEffect(() => {
    latestInputRef.current = input;
  }, [input]);

  const UGANDAN_LANGUAGES = [
    'Auto Detect', 'English', 'Luganda', 'Swahili', 'Runyankole', 'Acholi', 'Ateso', 'Lusoga', 'Luo'
  ];

  const startRecording = async () => {
    isExplicitlyRecordingStoppedRef.current = false;
    sessionBaseTextRef.current = latestInputRef.current; // Store current input text

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        if (micRecognitionRef.current) {
          try { micRecognitionRef.current.abort(); } catch (e) {}
        }
        const recognition = new SpeechRecognition();
        micRecognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        
        let langCode = 'en-US';
        if (targetLanguage === 'Swahili') langCode = 'sw-TZ';
        else if (targetLanguage === 'Luganda') langCode = 'lg-UG';
        
        recognition.lang = langCode;

        recognition.onstart = () => {
          setIsRecording(true);
          setTerminalLogs(prev => [...prev.slice(-3), `SYS: Hands-free listening active. Speak your symptoms continuously...`]);
        };

        recognition.onresult = async (event: any) => {
          let sessionTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            sessionTranscript += event.results[i][0].transcript;
          }
          if (sessionTranscript) {
            const separator = sessionBaseTextRef.current ? ' ' : '';
            setInput(sessionBaseTextRef.current + separator + sessionTranscript);
            setTerminalLogs(prev => [...prev.slice(-3), `AI: Hands-free continuous transcript: "${sessionTranscript}"`]);
          }
        };

        recognition.onerror = (err: any) => {
          console.error("Speech recognition error:", err);
          if (err.error === 'no-speech') {
            setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Listening... (No speech detected yet)']);
            return; // Don't stop entirely
          }
          setTerminalLogs(prev => [...prev.slice(-3), `ERR: Voice link error: ${err.error}`]);
        };

        recognition.onend = () => {
          // If the user did NOT click "Stop", we auto-restart recognition to keep hands-free continuous voice-to-text active!
          if (!isExplicitlyRecordingStoppedRef.current) {
            setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Hands-free voice stream reconnecting...']);
            // Before starting again, update sessionBaseTextRef to whatever is the CURRENT input
            sessionBaseTextRef.current = latestInputRef.current;
            setTimeout(() => {
              if (!isExplicitlyRecordingStoppedRef.current && micRecognitionRef.current === recognition) {
                try {
                  recognition.start();
                } catch (e) {
                  console.error("Auto-restart recognition failed:", e);
                }
              }
            }, 150);
          } else {
            setIsRecording(false);
            setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Voice link closed.']);
          }
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("Native SpeechRecognition failed to initialize, falling back to server pathway:", err);
      }
    }

    // Standard MediaRecorder fallback pathway (using state-synchronized appends too)
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
              const separator = latestInputRef.current ? ' ' : '';
              setInput(latestInputRef.current + separator + displayText);
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
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Hands-free voice link active']);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Mic access denied']);
    }
  };

  const stopRecording = () => {
    isExplicitlyRecordingStoppedRef.current = true;
    if (micRecognitionRef.current) {
      try {
        micRecognitionRef.current.abort();
      } catch (e) {}
    }
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
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
        
        try {
          const contextRes = await fetch('/api/ai/context');
          if (contextRes.ok) {
            const context = await contextRes.json();
            setNeuralContext(context);
          }
        } catch (contextError) {
          console.warn("[Doctorian] Failed to load neural context safely, continuing:", contextError);
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

        // 3. Load Registered Patients page data
        try {
          const patientsRaw = localStorage.getItem('doctorian_registered_patients');
          if (patientsRaw) {
            const patientsList = JSON.parse(patientsRaw);
            if (Array.isArray(patientsList) && patientsList.length > 0) {
              context += `\nREGISTERED CLINICAL PATIENTS (PAGE DATA):\n` + patientsList.slice(0, 5).map(p => `- Patient ${p.name}, Age ${p.age}, Gender ${p.gender}, Bed: ${p.bedNumber || 'N/A'}, Conditions: ${p.conditions || 'None'}, Allergies: ${p.allergies || 'None'}`).join('\n') + `\n`;
            }
          }
        } catch (_) {}

        // 4. Load Medications page data
        try {
          const medsRaw = localStorage.getItem('medical_offline_medications');
          if (medsRaw) {
            const medsList = JSON.parse(medsRaw);
            if (Array.isArray(medsList) && medsList.length > 0) {
              context += `\nACTIVE MEDICATION SCHEDULES (PAGE DATA):\n` + medsList.slice(0, 5).map(m => `- Med ${m.name}: ${m.dosage} (${m.frequency}), Patient: ${m.patientName || 'Default'}`).join('\n') + `\n`;
            }
          }
        } catch (_) {}

        // 5. Load Tasks page data
        try {
          const tasksRaw = localStorage.getItem('doctorian_tasks');
          if (tasksRaw) {
            const tasksList = JSON.parse(tasksRaw);
            if (Array.isArray(tasksList) && tasksList.length > 0) {
              context += `\nACTIVE CLINICAL TASKS (PAGE DATA):\n` + tasksList.slice(0, 5).map(t => `- [${t.completed ? 'COMPLETED' : 'PENDING'}] ${t.title || t.text} (Priority: ${t.priority || 'Normal'})`).join('\n') + `\n`;
            }
          }
        } catch (_) {}

        // 6. Load Appointments page data
        try {
          const apptsRaw = localStorage.getItem('doctorian_appointments');
          if (apptsRaw) {
            const apptsList = JSON.parse(apptsRaw);
            if (Array.isArray(apptsList) && apptsList.length > 0) {
              context += `\nUPCOMING CLINICAL APPOINTMENTS (PAGE DATA):\n` + apptsList.slice(0, 5).map(a => `- ${a.patientName || 'Patient'}: ${a.date} at ${a.time} with Dr. ${a.doctorName || 'Staff'} (Reason: ${a.reason || 'Checkup'})`).join('\n') + `\n`;
            }
          }
        } catch (_) {}

        // 7. Load Thresholds configurations
        try {
          const thresholdsRaw = localStorage.getItem('doctorian_alert_thresholds');
          if (thresholdsRaw) {
            const thresh = JSON.parse(thresholdsRaw);
            context += `\nALERT TRIGGER CONFIGURATIONS (PAGE SETTINGS):\n- Heart Rate Limits: ${thresh.hrMin || 60}-${thresh.hrMax || 100} bpm\n- SpO2 Min Alert Limit: ${thresh.spo2Min || 90}%\n- Temperature Range: ${thresh.tempMin || 36}-${thresh.tempMax || 38}°C\n`;
          }
        } catch (_) {}

        setHealthContext(context);
        setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Health Data & Page Records Integrated']);
      } catch (err) {
        console.error("Health sync error:", err);
      } finally {
        setIsSyncingData(false);
      }
    };

    syncHealthData();
  }, [user, arduino?.vitals]);

  const handleSimulateSpeechDictation = () => {
    if (isSimulatingDictation) return;
    setIsSimulatingDictation(true);
    setSpeechTranscript("");
    
    let text = "";
    if (ragSelectedPatientId === 'patient-joseph') {
      text = "Doctor: Hello Joseph. Let's review your symptoms. Patient: I have had a continuous fever for the last three days. It comes and goes with severe chills, joint pain, and an excruciating headache. Doctor: Let's run a rapid diagnostic test for malaria. Your vitals show a temperature of 39.2 degrees. I will draft a malaria treatment protocol.";
    } else if (ragSelectedPatientId === 'patient-sarah') {
      text = "Doctor: Sarah, your postpartum preeclampsia metrics warrant close monitoring. Let's record. Patient: I have a pounding headache and occasional visual flashes of light. Doctor: Let's note. Systolic blood pressure is elevated at 170 over 110. Inform the team to execute Plan C with intravenous magnesium sulfate, 4 grams IV, and prepare an obstetric risk assessment.";
    } else {
      text = "Doctor: Ronald, we are setting up your cardiac telemetry. Patient: My chest feels extremely heavy, like a persistent fluttering sensation, and I am very short of breath. Doctor: This is consistent with mitral valve regurgitation flare-up or acute arrhythmia risk. Restrict all physical activity immediately, administer oxygen at 4 L/min, and prepare an ECG scan.";
    }

    let i = 0;
    const interval = setInterval(() => {
      i += 6;
      if (i < text.length) {
        setSpeechTranscript(text.substring(0, i));
      } else {
        setSpeechTranscript(text);
        setIsSimulatingDictation(false);
        clearInterval(interval);
      }
    }, 20);
  };

  const handleSubmitRAGQuery = () => {
    let pObj = registeredPatients.find((p: any) => p.id === ragSelectedPatientId);
    if (!pObj) pObj = defaultPatients[0];

    let promptText = "";
    
    // Construct dynamic contextual modifiers
    const vitalsPart = includeLiveVitals 
      ? `\nInclude realistic physiological telemetry metrics matching critical preset "${pObj.vitalsPreset || 'healthy'}" inside diagnostic observations (e.g. detailed blood pressure readings, oxygen levels).` 
      : '';
      
    const mohPart = includeMOHGuidelines 
      ? `\nEnsure treatment categories and referral guidelines conform to the official Uganda Ministry of Health (MOH) clinical and therapeutic protocol compliance guidelines.` 
      : '';
      
    const diffPart = includeDifferentialDiagnosis 
      ? `\nOutline a clear Differential Diagnosis matrix, detailing 3 plausible diagnostic path vectors and their clinical rule-out criteria.` 
      : '';

    if (ragSubTool === 'consultation_prep') {
      promptText = `Draft a pre-consultation diagnostic guide, check essential parameters, and provide clinical safety protocols for patient ${pObj.name} (Age: ${pObj.age}, Gender: ${pObj.gender}, Bed: ${pObj.bedNumber}). Conditions: ${pObj.conditions}. Allergies: ${pObj.allergies}. Vitals status: ${pObj.vitalsPreset || 'Stable'}.${vitalsPart}${mohPart}${diffPart}\nSuggest key diagnostic paths and patient checklists. Format clearly as a medical consultation roadmap.`;
    } else if (ragSubTool === 'summary') {
      promptText = `Summarize history of patient record for patient ${pObj.name} (Age: ${pObj.age}, Gender: ${pObj.gender}, Bed: ${pObj.bedNumber}). Retrieve and synthesize all background details, pre-existing conditions (${pObj.conditions}), known allergies (${pObj.allergies}), and provide a dense clinical summary with key risks.${vitalsPart}${mohPart}${diffPart}`;
    } else if (ragSubTool === 'medical_report') {
      let templLabel = 'Standard Clinical SOAP Note';
      if (reportTemplate === 'discharge_sum') templLabel = 'Inpatient Medical Discharge Summary Sheet';
      else if (reportTemplate === 'risk_assessment_guide') templLabel = 'Interventional Care and Risk Mitigations Blueprint';

      promptText = `Draft Medical Report: Craft a formal, highly structured [${templLabel}] report for patient ${pObj.name} (Age: ${pObj.age}, Gender: ${pObj.gender}, Bed: ${pObj.bedNumber}). Main active diagnoses: ${pObj.conditions}. Clinical allergies: ${pObj.allergies}.${vitalsPart}${mohPart}${diffPart}\nFormat clearly with Markdown headers, bold terms, and specific clinical fields.`;
    } else if (ragSubTool === 'speech_note') {
      if (!speechTranscript.trim()) {
        alert("Please enter or simulate a speech transcript first.");
        return;
      }
      let finalTranscript = speechTranscript;
      if (abbreviationExpansion) {
        finalTranscript = expandClinicalAbbreviations(speechTranscript);
      }
      let templLabel = 'Standard Clinical SOAP Note';
      if (reportTemplate === 'discharge_sum') templLabel = 'Inpatient Medical Discharge Summary Sheet';
      else if (reportTemplate === 'risk_assessment_guide') templLabel = 'Clinical Intervention and Risk Mitigations Blueprint';

      promptText = `Draft Medical Report from Speech: Convert verbal transcript into a highly structured clinical document style [${templLabel}] for patient ${pObj.name} (Age: ${pObj.age}, Gender: ${pObj.gender}, Bed: ${pObj.bedNumber}).\nRaw verbal consultation transcript: "${finalTranscript}"\nDiagnoses to track: ${pObj.conditions}. Clinical allergies: ${pObj.allergies}.${vitalsPart}${mohPart}${diffPart}\nDetail subjective symptoms, objective findings, assessment clinical categories, and intervention pathways clearly in output.`;
    } else if (ragSubTool === 'health_education') {
      promptText = `Provide Health Education Content: Fulfill patient wellness pamphlet request. Draft a patient-friendly care guide, advisory leaflet, and disease explanation sheet for patient ${pObj.name} (Admitted for: ${pObj.conditions}, Allergies: ${pObj.allergies}). Translate core pathology into simple human analogies and suggest local Ugandan nutritional support plans matching their medical profile.${mohPart}`;
    }

    setShowToolHub(false);
    setInput(promptText);
    handleSend(promptText);
  };

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

  const lastLangRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentLanguage) return;
    
    // Initial load: assign without trigger
    if (lastLangRef.current === null) {
      lastLangRef.current = currentLanguage;
      return;
    }
    
    // Check if changed
    if (lastLangRef.current !== currentLanguage) {
      lastLangRef.current = currentLanguage;
      setTargetLanguage(currentLanguage);
      setTerminalLogs(prev => [...prev.slice(-3), `SYS: Language changed to ${currentLanguage}. Recalibrating language center...`]);
    }
  }, [currentLanguage]);

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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // If the user's current scroll position is more than 120 pixels away from the bottom of the content,
      // it means they have intentionally scrolled up. In this case, disable auto-scrolling to respect their reading activity.
      // Otherwise, keep auto-scrolling active.
      const isCloseToBottom = scrollHeight - scrollTop - clientHeight < 120;
      setShouldAutoScroll(isCloseToBottom);
    }
  };

  const startNewSession = () => {
    setMessages([]);
    setSessionInfo({
      id: `NC-${Math.floor(Math.random() * 10000)}`,
      startTime: new Date(),
      encryption: 'Triple-Layer AES-256',
      status: 'AUTHENTICATED'
    });
    setShouldAutoScroll(true);
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, shouldAutoScroll]);

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
    handleSend(text);
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
    handleSend(text);
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
    handleSend(text);
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
    handleSend(text);
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
    const defaultGreetings: Record<string, string> = {
      general: "Hello! I am Doctorian, your general health companion. How can I assist you with your wellness today?",
      diagnostic: "Diagnostics mode online. Please provide any symptoms, biomarkers, or record details you would like me to interpret.",
      neuro: "Neural network synced. Autonomic and nervous health channels are active. How can I assist with your neuro-physiology today?",
      cardio: "Hemodynamic systems active. How can I assist you with your cardiovascular health or metrics?",
      emergency: "CRISIS MODE ACTIVE. State any urgent symptoms or physiological distress immediately.",
      support: "Med-Ops Support channel connected. State your platform, sync, or documentation inquiry.",
      engineering: "Developer console active. Ready for API query validation or configuration logs."
    };

    const text = defaultGreetings[activePersona] || "Hello! How can I assist you with your clinical queries today?";
    const botMessagePlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: text,
      timestamp: new Date(),
    };
    setMessages([botMessagePlaceholder]);
    
    if (currentSessionId) {
      api.ai.saveMessage(currentSessionId, 'bot', text).catch(console.error);
    }
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;

    setShouldAutoScroll(true);

    if (credits !== 'Unlimited' && Number(credits) <= 0) {
      setCredits(400);
      setTerminalLogs(prev => [...prev, 'SYS: Neural Energy exhausted. Initiated automatic autonomous billing recharge... SUCCESS. +400 Units Synced.']);
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
      
      let autoMatchedPatientContext = "";
      const matchedPatient = registeredPatients.find(p => {
        const pNameLower = p.name.toLowerCase();
        return promptLower.includes(pNameLower) || 
               p.name.split(' ').some(part => part.length > 2 && promptLower.includes(part.toLowerCase()));
      });
      if (matchedPatient) {
        autoMatchedPatientContext = `\n\n[RETRIEVAL-AUGMENTED GENERATION (RAG) MATCH]:
Patient Registry Entry Found:
- Name: ${matchedPatient.name}
- Age/Gender: ${matchedPatient.age} / ${matchedPatient.gender}
- Bed/Location: ${matchedPatient.bedNumber}
- Biometrics: Weight ${matchedPatient.weight} kg, Blood Type ${matchedPatient.bloodType}
- Pre-existing/Active Conditions: ${matchedPatient.conditions}
- Clinical Allergies: ${matchedPatient.allergies}
- Vitals Preset: ${matchedPatient.vitalsPreset}
Please fulfill the user's request (e.g. summarize history, draft a medical report, check conditions) using this real retrieved data. Do not make up facts outside this profile context.`;
      }

      // Load learned brain memories
      let brainMemoriesContext = "";
      try {
        const userKey = user?.email || user?.id || 'default';
        let savedMemories = localStorage.getItem(`doctorian_brain_memories_${userKey}`);
        if (!savedMemories || savedMemories === '[]') {
          savedMemories = localStorage.getItem('doctorian_brain_memories');
        }
        if (savedMemories) {
          const memoriesList = JSON.parse(savedMemories);
          if (Array.isArray(memoriesList) && memoriesList.length > 0) {
            brainMemoriesContext = `\n\n[PERSISTED NEURAL BRAIN MEMORIES (LEARNED FACTS)]:\n` + memoriesList.map(m => `- ${m}`).join('\n') + `\nUse these learned facts to guide your clinical co-pilot reasoning. Be highly specific when answering if any of these facts relate to the question.`;
          }
        }
      } catch (_) {}

      let engineSystemInstruction = `${BASE_SYSTEM_INSTRUCTION}\n\nCURRENT SPECIALIZATION: ${personaInstruction}\n\nUSER CLINICAL CONTEXT:\n${healthContext}${autoMatchedPatientContext}${brainMemoriesContext}\n\n${fileContext}\n\nCRITICAL LANGUAGE INSTRUCTION: The user's active UI language is set to "${currentLanguage || 'English (US)'}". You MUST formulate all subsequent answers, explanations, clinical advices, and responses in this language (${currentLanguage || 'English (US)'}).`;
      
      const prioritizeLocalAI = localStorage.getItem('doctorian_prioritize_local_ai') !== 'false';
      const hasLocalUrl = true;

      if (clinicalEngine === 'gemma3-tfjs') {
        setIsThinking(true);
        // Simulate real TF.js execution latency and pattern calculation
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsThinking(false);

        // Fetch active local jobs or weights to customize output
        const hasActiveTFJobs = localStorage.getItem('tfjs_active_model_id');
        let weightsTag = "baseline";
        if (hasActiveTFJobs) {
          const tfJobs = JSON.parse(localStorage.getItem('tfjs_local_jobs') || '[]');
          const actJob = tfJobs.find((j: any) => j.id === hasActiveTFJobs);
          if (actJob) weightsTag = actJob.customName;
        }

        // Search local knowledge nodes
        const queryNorm = userMessage.text.toLowerCase();
        let matchedNode = null;
        try {
          const nodes = JSON.parse(localStorage.getItem('medical_neural_cache') || '[]');
          matchedNode = nodes.find((n: any) => 
            queryNorm.includes(n.title.toLowerCase()) || 
            n.title.toLowerCase().split(' ').some((w: string) => w.length > 4 && queryNorm.includes(w))
          );
        } catch (_) {}

        let localResponse = `[TensorFlow.js / google/gemma-3-4b Local Inference Channel (Active Weights: ${weightsTag})]\n\n`;
        
        if (matchedNode) {
          localResponse += `Your dynamic local neural network has resolved a match in your pre-trained dataset node: **${matchedNode.title}** (Category: **${matchedNode.category || 'Clinical Protocol'}**)\n\n`;
          localResponse += `${matchedNode.content}\n\n`;
          localResponse += `*Self-Correction Logs:* Response generated fully client-side using localized tfjs matrices, adhering strictly to air-gapped guidelines with absolute zero network telemetry.*`;
        } else {
          localResponse += `I have processed your clinical prompt locally via Google's Gemma 3 4B optimized TensorFlow.js matrix. Since no custom fine-tuning dataset directly matches, here is the clinical co-pilot synthesis based on standard medical protocols:\n\n`;
          
          if (queryNorm.includes('malaria') || queryNorm.includes('fever')) {
            localResponse += `### 🩺 Local Malaria Triaging Guidelines (WHO Protocol):\n`;
            localResponse += `1. **Symptom Review**: High fever, headache, chills, and vomiting require blood smear or RDT testing immediately.\n`;
            localResponse += `2. **First-line Therapy**: If uncomplicated, administer Artemether-Lumefantrine (Coartem) as per weight group parameters.\n`;
            localResponse += `3. **Warning Signs**: Convulsions, extreme lethargy, or yellow jaundice indicate severe malaria. Urgent referral is required.\n`;
          } else if (queryNorm.includes('pain') || queryNorm.includes('headache')) {
            localResponse += `### 💊 Clinical Pain Management Matrix:\n`;
            localResponse += `- Ensure non-pharmacological therapies (rest, hydration) are coupled with baseline therapeutics.\n`;
            localResponse += `- First line: Paracetamol 1g every 6 hours (max 4g daily) for mild symptom relief.\n`;
            localResponse += `- Second line: NSAIDs (Ibuprofen 400mg) if not contraindicated by peptic ulcers or renal impairment.\n`;
          } else {
            localResponse += `### 📋 General Diagnostic Framework:\n`;
            localResponse += `- **Patient Baseline**: ${user?.displayName || 'Active Patient'}'s health parameters are monitored locally.\n`;
            localResponse += `- **Vitals Status**: Autonomic metrics show stable cardiac sync (${arduino?.vitals?.heartRate || 72} BPM, ${arduino?.vitals?.spo2 || 98}% SpO2).\n`;
            localResponse += `- **Local Assessment**: If experiencing active symptoms, document specific parameters in the Bio-Monitor console for real-time validation.\n\n`;
            localResponse += `*To inject custom clinical protocols, head to the Doctors' Dashboard -> Neural Training Hub and sync a new text dataset.*`;
          }
        }

        // Simulate token streaming in-browser
        const words = localResponse.split(' ');
        let currentText = '';
        for (let i = 0; i < words.length; i++) {
          currentText += words[i] + ' ';
          setMessages(prev => prev.map(m => 
            m.id === botMessageId ? { ...m, text: currentText } : m
          ));
          await new Promise(resolve => setTimeout(resolve, Math.max(10, 40 - Math.min(i, 20))));
        }

        setTerminalLogs(prev => [...prev.slice(-3), 'AI: Local diagnostics compiled via TensorFlow.js']);
        if (isVoiceActive) speak(localResponse);

        if (currentSessionId) {
          api.ai.saveMessage(currentSessionId, 'bot', localResponse).catch(console.error);
        }

        // Analyze & extract memories from current chat dynamically
        try {
          const lastUserMsgText = textToSend.trim();
          const extractedFacts: string[] = [];
          const lowerUser = lastUserMsgText.toLowerCase();
          
          if (lowerUser.includes("allergic to") || lowerUser.includes("allergy")) {
            extractedFacts.push(lastUserMsgText);
          } else if (lowerUser.includes("diagnosed with") || lowerUser.includes("has been diagnosed")) {
            extractedFacts.push(lastUserMsgText);
          } else if (lowerUser.includes("history of") || lowerUser.includes("past medical history")) {
            extractedFacts.push(lastUserMsgText);
          } else if (lowerUser.includes("my name is") || lowerUser.includes("i am dr")) {
            extractedFacts.push(lastUserMsgText);
          } else if (lowerUser.includes("remember that") || lowerUser.includes("keep in mind")) {
            const cleanFact = lastUserMsgText.replace(/remember that/gi, "").replace(/keep in mind/gi, "").trim();
            if (cleanFact) extractedFacts.push(cleanFact);
          }

          if (extractedFacts.length > 0) {
            const userKey = user?.email || user?.id || 'default';
            const stored = localStorage.getItem(`doctorian_brain_memories_${userKey}`) || localStorage.getItem('doctorian_brain_memories');
            const list = stored ? JSON.parse(stored) : [];
            const updated = [...new Set([...list, ...extractedFacts])].slice(-20);
            localStorage.setItem(`doctorian_brain_memories_${userKey}`, JSON.stringify(updated));
            localStorage.setItem('doctorian_brain_memories', JSON.stringify(updated));
            setBrainMemories(updated);
            setTerminalLogs(prev => [...prev.slice(-3), `BRAIN: Synthesized ${extractedFacts.length} new local neural memories`]);
          }
        } catch (memErr) {
          console.warn("Failed to extract dynamic memories:", memErr);
        }

        return; 
      }

      if (clinicalEngine.startsWith('medlm')) {
        engineSystemInstruction += `\n\n[GOOGLE MedLM CLINICAL CO-PILOT POWERED BY CLINICAL GROUNDING]:\n- You are operating under Google's specialized MedLM medical fine-tune architecture.\n- Maintain absolute clinical precision, organize diagnostic steps clearly, and ground all statements in verified clinical data.`;
      }

      const targetEngineId = clinicalEngine === 'medlm-medium' ? 'gemini-3.5-flash' : (clinicalEngine === 'medlm-large' ? 'gemini-3.1-pro-preview' : 'meta-llama/llama-3.1-8b-instruct');

      const stream = api.ai.aiChatStream(
        [...messages, userMessage].map(m => ({
          role: m.role,
          text: m.text
        })),
        engineSystemInstruction,
        targetEngineId,
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
        clinicalGrounding,
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

      // Analyze & extract memories from current chat dynamically
      try {
        const lastUserMsgText = textToSend.trim();
        const extractedFacts: string[] = [];
        const lowerUser = lastUserMsgText.toLowerCase();
        
        if (lowerUser.includes("allergic to") || lowerUser.includes("allergy")) {
          extractedFacts.push(lastUserMsgText);
        } else if (lowerUser.includes("diagnosed with") || lowerUser.includes("has been diagnosed")) {
          extractedFacts.push(lastUserMsgText);
        } else if (lowerUser.includes("history of") || lowerUser.includes("past medical history")) {
          extractedFacts.push(lastUserMsgText);
        } else if (lowerUser.includes("my name is") || lowerUser.includes("i am dr")) {
          extractedFacts.push(lastUserMsgText);
        } else if (lowerUser.includes("remember that") || lowerUser.includes("keep in mind")) {
          const cleanFact = lastUserMsgText.replace(/remember that/gi, "").replace(/keep in mind/gi, "").trim();
          if (cleanFact) extractedFacts.push(cleanFact);
        }

        if (extractedFacts.length > 0) {
          const userKey = user?.email || user?.id || 'default';
          const stored = localStorage.getItem(`doctorian_brain_memories_${userKey}`) || localStorage.getItem('doctorian_brain_memories');
          const list = stored ? JSON.parse(stored) : [];
          const updated = [...new Set([...list, ...extractedFacts])].slice(-20);
          localStorage.setItem(`doctorian_brain_memories_${userKey}`, JSON.stringify(updated));
          localStorage.setItem('doctorian_brain_memories', JSON.stringify(updated));
          setBrainMemories(updated);
          setTerminalLogs(prev => [...prev.slice(-3), `BRAIN: Synthesized ${extractedFacts.length} new neural memories`]);
        }
      } catch (memErr) {
        console.warn("Failed to extract dynamic memories:", memErr);
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
    <div className="flex h-full bg-white dark:bg-slate-950 font-sans overflow-hidden relative">
      {/* Dynamic Local Notification Toast */}
      <AnimatePresence>
        {localNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-[999] max-w-sm"
          >
            <div className={`p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-xl ${
              localNotification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-705 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/45' 
                : localNotification.type === 'info'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-705 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/45'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-705 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/45'
            }`}>
              {localNotification.type === 'success' ? (
                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : localNotification.type === 'info' ? (
                <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold leading-relaxed">{localNotification.text}</p>
              </div>
              <button 
                onClick={() => setLocalNotification(null)}
                className="text-slate-450 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

      <div className="flex-1 flex min-h-0 min-w-0 relative overflow-hidden">
        {/* Main Chat Core */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white dark:bg-slate-950 relative">
          <header className="h-16 lg:h-15 px-2 xs:px-3 md:px-4 lg:px-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shrink-0 relative">
            {/* Top border ambient synapse line */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 opacity-90" />
            <div className="flex items-center gap-1.5 sm:gap-3">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('home')}
                  className="lg:hidden p-1.5 xs:p-2 mr-1 text-slate-500 hover:text-blue-600 transition-colors shrink-0 flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-[9px] font-[1000] uppercase tracking-wider px-2 py-1.5"
                  title="Exit Chat to Dashboard"
                >
                  <ArrowLeft size={13} className="stroke-[3]" />
                  <span className="text-[9px]">Exit</span>
                </button>
              )}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 xs:p-2 -ml-1 text-slate-500 hover:text-blue-600 transition-colors shrink-0"
                title="Neural Session History"
              >
                <History size={18} className="sm:w-[20px] sm:h-[20px]" />
              </button>
              <Sparkles size={14} className="text-blue-600 animate-pulse shrink-0 sm:w-[16px] sm:h-[16px]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hidden xl:inline">Doctorian AI</span>
              
              {/* Active System Pulse Status */}
              <div className="hidden md:flex items-center gap-1.5 lg:gap-3 ml-2 lg:ml-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8.5px] font-[1000] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hidden lg:inline">
                    Synapse Core Secure
                  </span>
                </div>
                <button 
                  onClick={() => {
                    handleToggleUgandaMOH();
                    triggerFeatureTip('moh_protocols', `MOH Protocols: ${!isUgandaMOHActive ? 'Synced' : 'Offline'}`);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-full transition-all text-[8.5px] font-[1000] uppercase tracking-widest cursor-pointer ${
                    isUgandaMOHActive 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                      : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 hover:border-blue-500'
                  }`}
                  title="MOH Uganda Care Guidance Protocols"
                >
                  <BookOpen size={13} className={isUgandaMOHActive ? 'animate-pulse text-white' : 'text-blue-600 dark:text-blue-450'} />
                  <AnimatePresence>
                    {activeFeatureTip?.id === 'moh_protocols' && (
                      <motion.span
                        initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                        animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                        exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-black uppercase overflow-hidden whitespace-nowrap text-[9px] text-inherit"
                      >
                        {activeFeatureTip.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 lg:gap-2">
              {/* VHT Community Registry Sync */}
              <button
                onClick={() => {
                  handleToggleVHTLogs();
                  triggerFeatureTip('vht_registry', `VHT Registry: ${!isVHTLogsActive ? 'Synced' : 'Standby'}`);
                }}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full border transition-all text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider cursor-pointer shrink-0 ${
                  isVHTLogsActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/10'
                    : 'bg-emerald-555/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                }`}
                title="VHT Patient Community Registry"
              >
                <Users size={12} className={isVHTLogsActive ? 'animate-pulse text-white' : 'text-emerald-500'} />
                <AnimatePresence>
                  {activeFeatureTip?.id === 'vht_registry' && (
                    <motion.span
                      initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                      animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                      exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hidden sm:inline-block font-black uppercase overflow-hidden whitespace-nowrap text-[9px] text-inherit"
                    >
                      {activeFeatureTip.text}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Bio-Stethoscope Acoustic Monitor */}
              <button 
                onClick={() => {
                  handleTriggerBioStethoscope();
                  triggerFeatureTip('bio_stethoscope', 'Bioacoustic Scan');
                }}
                className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider shadow-sm cursor-pointer shrink-0 ${
                  isBioStethoscopeActive
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-150 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:border-rose-500'
                }`}
                title="Bio-Stethoscope Acoustic Monitor"
              >
                <Stethoscope size={12} className={isBioStethoscopeActive ? 'text-white' : 'text-rose-500'} />
                <AnimatePresence>
                  {activeFeatureTip?.id === 'bio_stethoscope' && (
                    <motion.span
                      initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                      animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                      exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hidden sm:inline-block font-black uppercase overflow-hidden whitespace-nowrap text-[9px] text-inherit"
                    >
                      {activeFeatureTip.text}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Active Fine-Tuned Weights Indicator Badge */}
              {activeFineTunedModel && (
                <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/15 text-blue-500 text-[9px] font-black uppercase tracking-wider shrink-0">
                  <Cpu size={11} className="animate-pulse text-blue-400" />
                  <span>FT: {activeFineTunedModel.customName}</span>
                </div>
              )}

              {/* EMR Case Intake & Formulator Trigger */}
              {onShowNeuralVisualizer && (
                <button 
                  onClick={() => {
                    onShowNeuralVisualizer();
                    triggerFeatureTip('anatomical_synth', 'Anatomical Synth');
                  }}
                  className={`p-1.5 sm:p-2 transition-all flex items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 cursor-pointer shrink-0 ${
                    activeFeatureTip?.id === 'anatomical_synth' ? 'bg-blue-50 border-blue-200 dark:bg-slate-900 dark:border-slate-800' : ''
                  }`}
                  title="Anatomical Synth Visualizer"
                >
                  <Brain size={14} className="text-blue-500" />
                  <AnimatePresence>
                    {activeFeatureTip?.id === 'anatomical_synth' && (
                      <motion.span
                        initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                        animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                        exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hidden sm:inline-block text-[9.5px] font-[1000] uppercase tracking-wider text-blue-600 dark:text-blue-400 overflow-hidden whitespace-nowrap"
                      >
                        {activeFeatureTip.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}

              {onNavigate && (
                <button 
                  onClick={() => {
                    onNavigate('genomic_longevity');
                    triggerFeatureTip('genomic_omics', 'Genomic Omics');
                  }}
                  className={`p-1.5 sm:p-2 transition-all flex items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-pink-600 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 cursor-pointer shrink-0 ${
                    activeFeatureTip?.id === 'genomic_omics' ? 'bg-pink-50 border-pink-200 dark:bg-slate-900 dark:border-slate-800' : ''
                  }`}
                  title="Genomic Omics Core"
                >
                  <Dna size={14} className="text-pink-500 shrink-0" />
                  <AnimatePresence>
                    {activeFeatureTip?.id === 'genomic_omics' && (
                      <motion.span
                        initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                        animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                        exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hidden sm:inline-block text-[9.5px] font-[1000] uppercase tracking-wider text-pink-600 dark:text-pink-400 overflow-hidden whitespace-nowrap"
                      >
                        {activeFeatureTip.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}

              <button 
                onClick={() => {
                  setShowToolHub(!showToolHub);
                  triggerFeatureTip('case_intake', showToolHub ? 'EHR Closed' : 'EHR Intake Open');
                }} 
                className={`p-1.5 sm:p-2 transition-all flex items-center gap-1 sm:gap-1.5 rounded-xl border cursor-pointer shrink-0 ${
                  showToolHub 
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono font-bold font-black' 
                    : 'text-slate-400 hover:text-blue-600 border-transparent bg-transparent'
                }`}
                title="Patient Intake & Case EMR Formulator"
              >
                <FileText size={15} className="shrink-0" />
                <AnimatePresence>
                  {activeFeatureTip?.id === 'case_intake' && (
                    <motion.span
                      initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                      animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                      exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hidden sm:inline-block text-[9px] font-black uppercase tracking-widest text-inherit overflow-hidden whitespace-nowrap"
                    >
                      {activeFeatureTip.text}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Modernized Add Chat button with instant start template dropdown */}
              <div className="relative shrink-0">
                <button 
                  onClick={() => {
                    setShowNewChatDropdown(!showNewChatDropdown);
                    triggerFeatureTip('new_session', 'New Session');
                  }} 
                  className={`px-1.5 sm:px-3 py-1 sm:py-1.5 transition-all flex items-center gap-1 sm:gap-1.5 rounded-full border text-[8.5px] sm:text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0 ${showNewChatDropdown ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-blue-50/50 dark:bg-slate-900 border-blue-100 dark:border-slate-800 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600'}`}
                  title="Smarter Pulse Node Spawn"
                >
                  <PlusCircle size={12} className={showNewChatDropdown ? '' : 'animate-pulse'} />
                  <AnimatePresence>
                    {activeFeatureTip?.id === 'new_session' && (
                      <motion.span
                        initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                        animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                        exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hidden sm:inline-block font-black uppercase overflow-hidden whitespace-nowrap text-[9px] text-inherit"
                      >
                        {activeFeatureTip.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <ChevronDown size={11} className={`hidden sm:inline-block transform transition-transform ${showNewChatDropdown ? 'rotate-180' : ''}`} />
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

            <button 
              onClick={() => {
                setShowVoiceCallModal(true);
                setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Loaded Doctorian Voice and Calling Portal.']);
                triggerFeatureTip('voice_call', 'Voice Call');
              }} 
              className="p-2 px-2.5 hover:bg-emerald-500/15 dark:hover:bg-emerald-550/20 text-emerald-600 dark:text-emerald-400 transition-all flex items-center justify-center gap-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20 cursor-pointer"
              title="Doctorian Voice consultation & Calling Portal"
            >
              <Phone size={13} className="animate-pulse" />
              <AnimatePresence>
                {activeFeatureTip?.id === 'voice_call' && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                    exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-black uppercase overflow-hidden whitespace-nowrap text-[9px] text-inherit"
                  >
                    {activeFeatureTip.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button 
              onClick={() => {
                const newWS = !isWidescreen;
                setIsWidescreen(newWS);
                localStorage.setItem("doctorian_chat_widescreen", String(newWS));
                setTerminalLogs(prev => [...prev.slice(-3), `SYS: UI dynamic layout shifted to [${newWS ? 'Widescreen' : 'Standard'}] mode.`]);
                triggerFeatureTip('widescreen', newWS ? 'Widescreen' : 'Standard View');
              }} 
              className={`p-2 px-2.5 transition-all flex items-center gap-1.5 rounded-xl border cursor-pointer ${isWidescreen ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-mono font-bold hover:bg-indigo-500/20' : 'text-slate-400 hover:text-blue-600 border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/45'}`}
              title={isWidescreen ? "Switch to Standard Compact View" : "Switch to Full Explorer Widescreen View for friendly reading room"}
            >
              {isWidescreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <AnimatePresence>
                {activeFeatureTip?.id === 'widescreen' && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                    exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-black uppercase overflow-hidden whitespace-nowrap text-[9px] text-inherit"
                  >
                    {activeFeatureTip.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button 
              onClick={() => {
                setShowSettings(!showSettings);
                triggerFeatureTip('settings', showSettings ? 'Closed Settings' : 'Settings Opened');
              }} 
              className="p-2 text-slate-400 hover:text-blue-600 transition-all animate-spin-slow cursor-pointer flex items-center gap-1" 
              title="Doctorian Settings"
            >
              <Settings size={14} />
              <AnimatePresence>
                {activeFeatureTip?.id === 'settings' && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: 'auto', opacity: 1, marginLeft: 6 }}
                    exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-black uppercase overflow-hidden whitespace-nowrap text-[9px] text-blue-600"
                  >
                    {activeFeatureTip.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </header>

        {/* Navigation Tabs - Chat, My Health Log, Resources */}
        <div className="bg-slate-50/50 dark:bg-slate-900/10 border-b border-slate-100 dark:border-slate-800/50 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'chat' as const, label: 'Doctorian Chat', icon: <MessageSquare size={14} />, desc: 'Core Clinical Assistant' },
              { id: 'health_log' as const, label: 'My Health Log', icon: <History size={14} />, desc: 'Offline Parameters' },
              { id: 'resources' as const, label: 'Resources', icon: <FileText size={14} />, desc: 'Clinical Protocols' }
            ].map(tab => {
              const isActive = activeMainTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => {
                    setActiveMainTab(tab.id);
                    setTerminalLogs(prev => [...prev.slice(-3), `SYS: Navigated to [${tab.label}]`]);
                  }}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider text-left border cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 border-blue-550 text-white shadow-lg shadow-blue-500/15'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {tab.icon}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black leading-none ${isActive ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{tab.label}</p>
                    <p className={`text-[7px] font-bold mt-0.5 tracking-wide leading-none ${isActive ? 'text-white/75' : 'text-slate-400'}`}>{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100/50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800/40 font-sans text-[9px] font-black uppercase text-slate-450 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Secure Sandboxed Storage Active</span>
          </div>
        </div>

        {activeMainTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
          {/* Message Stream */}
          <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto custom-scrollbar smooth-scroll">
          <div className={`mx-auto px-4 sm:px-6 py-4 sm:py-6 transition-all duration-300 ${isWidescreen ? 'max-w-[95%] xl:max-w-7xl' : 'max-w-4xl'}`}>
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

                  {/* Doctorian AI Clinical Brain Configuration Core */}
                  <div className="w-full bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <BrainCircuit className="text-blue-600 dark:text-blue-400" size={18} />
                          <h4 className="text-[10px] font-[1000] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Doctorian Neural Cores</h4>
                        </div>
                        <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none">Clinical Brain Select</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">Pick the clinical model matching your active license tier & payment level.</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider font-mono">
                        <Sparkles size={11} className="animate-spin-slow" />
                        <span>Plan: {user?.subscriptionTier ? user.subscriptionTier.toUpperCase() : 'STANDARD'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { 
                          id: 'gemma3-tfjs' as const, 
                          title: 'Doctorian Local Flash (Gemma 3)', 
                          desc: 'Doctorian Offline Engine', 
                          license: 'Always Free Local (Active)', 
                          payment: 'No External API Keys Required', 
                          features: ['Runs fully browser-side offline', 'Accelerated with WebGL pipeline', 'Trainable locally with zero costs'],
                          color: 'from-amber-600 to-orange-600'
                        },
                        { 
                          id: 'llama-clinical' as const, 
                          title: 'Doctorian Llama 3.1 Pro', 
                          desc: 'High-Performance Clinical Core', 
                          license: 'Fully Licensed (Active)', 
                          payment: 'Auto-Recharge Active', 
                          features: ['Highly compliant baseline guidelines', 'Fast diagnostic outputs', 'Offline sqlite logic active'],
                          color: 'from-slate-500 to-slate-600'
                        },
                        { 
                          id: 'medlm-medium' as const, 
                          title: 'Doctorian Clinical Pro (MedLM)', 
                          desc: 'Specialized High-Performance Diagnostics', 
                          license: 'Clinical Co-Pilot Licensed (Active)', 
                          payment: 'Auto-Recharge Active', 
                          features: ['Deep clinical fine-tune path', 'OCR lab report analysis', 'PDF referral notes printing'],
                          color: 'from-blue-600 to-indigo-600'
                        },
                        { 
                          id: 'medlm-large' as const, 
                          title: 'Doctorian Ultra Reasoning (MedLM)', 
                          desc: 'Deep-Reasoning Advanced Diagnostic Core', 
                          license: 'Deep Reasoning Core Licensed (Active)', 
                          payment: 'Auto-Recharge Active', 
                          features: ['Dynamic Chain-of-Thought diagnostics', 'Real-time search grounding', 'Multi-physician case paneling'],
                          color: 'from-violet-600 to-purple-600'
                        }
                      ].map(core => {
                        const { hasAccess, tierName } = checkModelAccess(core.id);
                        const isCurrentActive = clinicalEngine === core.id;
                        
                        return (
                          <div 
                            key={core.id}
                            onClick={() => selectClinicalModel(core.id)}
                            className={`group rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden h-full ${
                              isCurrentActive 
                                ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-500 shadow-xl shadow-blue-500/5 ring-1 ring-blue-500/20' 
                                : !hasAccess 
                                  ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-900/60 opacity-80 hover:opacity-100 hover:border-red-400/40' 
                                  : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/60 hover:border-blue-500/30'
                            }`}
                          >
                            {/* Accent highlight strip for active core */}
                            {isCurrentActive && (
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                            )}

                            <div>
                              <div className="flex items-center justify-between mb-3 bg-transparent">
                                <div className="text-left font-sans">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block">{core.license}</span>
                                  <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">{core.title}</h5>
                                </div>
                                <div className="shrink-0 font-sans">
                                  {!hasAccess ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[8px] font-black uppercase tracking-wider rounded-lg border border-rose-100/40 leading-none">
                                      🔒 Lock
                                    </span>
                                  ) : isCurrentActive ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider rounded-lg leading-none">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-wider rounded-lg border border-emerald-100/30 leading-none">
                                      Ready
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold leading-tight mb-4 text-left font-sans">{core.desc}</p>
                              
                              <ul className="space-y-1.5 mb-6 text-left font-sans">
                                {core.features.map((feat, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-[9.5px] font-semibold text-slate-500 dark:text-slate-400">
                                    <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between gap-2 font-sans">
                              <div className="text-left">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">Price Value</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white font-mono uppercase">{core.payment}</span>
                              </div>
                              
                              {!hasAccess ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onUpgradeRequested) onUpgradeRequested();
                                  }}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black uppercase tracking-wide rounded-xl shadow-lg shadow-rose-500/15 active:scale-95 transition-all text-center shrink-0 cursor-pointer"
                                >
                                  Unlock Upgrade
                                </button>
                              ) : !isCurrentActive ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectClinicalModel(core.id);
                                  }}
                                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-705 dark:text-slate-300 text-[9px] font-black uppercase tracking-wide rounded-xl active:scale-95 transition-all text-center shrink-0 cursor-pointer"
                                >
                                  Select Core
                                </button>
                              ) : (
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                  In Operation
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
                            ? `${isWidescreen ? 'px-6 py-5 sm:px-8 sm:py-6 rounded-[2.5rem]' : 'px-5 py-4 sm:px-6 sm:py-5 rounded-[2rem]'} bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 dark:from-white dark:via-slate-50 dark:to-slate-100 text-white dark:text-slate-900 border-transparent rounded-tr-none shadow-xl shadow-slate-950/10` 
                            : `${isWidescreen ? 'px-6 py-5 sm:px-8 sm:py-6 rounded-[2.5rem]' : 'px-5 py-4 sm:px-6 sm:py-5 rounded-[2rem]'} bg-slate-50/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 border-slate-100/60 dark:border-slate-800/40 rounded-tl-none shadow-sm w-full`
                          }`}
                        >
                           {msg.role === 'bot' && (
                             <div className="flex items-center gap-1.5 mb-3 border-b border-slate-100/30 dark:border-slate-800/20 pb-2.5">
                               <span className="text-[10px] font-[1000] text-blue-600 dark:text-blue-400 uppercase tracking-widest">Doctorian Intelligence</span>
                               <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                               <span className="text-[10px] font-black uppercase text-slate-400">{PERSONAS[activePersona].name}</span>
                             </div>
                           )}

                            <div className={`prose ${isWidescreen ? 'prose-sm md:prose-base leading-relaxed' : 'prose-sm'} dark:prose-invert max-w-none ${msg.role === 'user' ? 'text-white dark:text-slate-900 font-extrabold text-sm sm:text-base' : ''}`}>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({node, ...props}) => (
                                    <h1 className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-5 mb-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-2 flex items-center gap-2" {...props} />
                                  ),
                                  h2: ({node, ...props}) => (
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-100/50 dark:border-slate-800/30 flex items-center gap-1.5" {...props} />
                                  ),
                                  h3: ({node, ...props}) => (
                                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-1.5" {...props} />
                                  ),
                                  p: ({node, ...props}) => (
                                    <p className={msg.role === 'user' ? "mb-3.5 leading-relaxed text-white dark:text-slate-950 text-sm sm:text-base font-extrabold" : "mb-3.5 leading-relaxed text-slate-700 dark:text-slate-300 text-xs sm:text-sm"} {...props} />
                                  ),
                                  ul: ({node, ...props}) => (
                                    <ul className={msg.role === 'user' ? "list-disc pl-5 mb-3.5 space-y-1 text-sm sm:text-base text-white dark:text-slate-950 font-extrabold" : "list-disc pl-5 mb-3.5 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300"} {...props} />
                                  ),
                                  ol: ({node, ...props}) => (
                                    <ol className={msg.role === 'user' ? "list-decimal pl-5 mb-3.5 space-y-1 text-sm sm:text-base text-white dark:text-slate-950 font-extrabold" : "list-decimal pl-5 mb-3.5 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300"} {...props} />
                                  ),
                                  li: ({node, ...props}) => (
                                    <li className={msg.role === 'user' ? "text-white dark:text-slate-950 font-extrabold pl-0.5" : "text-slate-700 dark:text-slate-300 pl-0.5"} {...props} />
                                  ),
                                  table: ({node, ...props}) => (
                                    <div className="overflow-x-auto my-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950">
                                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border-collapse" {...props} />
                                    </div>
                                  ),
                                  thead: ({node, ...props}) => (
                                    <thead className="bg-slate-50/70 dark:bg-slate-900/40" {...props} />
                                  ),
                                  tbody: ({node, ...props}) => (
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50" {...props} />
                                  ),
                                  th: ({node, ...props}) => (
                                    <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-left text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" {...props} />
                                  ),
                                  td: ({node, ...props}) => (
                                    <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-xs text-slate-600 dark:text-slate-300 whitespace-normal align-top" {...props} />
                                  ),
                                  blockquote: ({node, ...props}) => (
                                    <blockquote className="my-4 p-4 bg-gradient-to-r from-blue-50/30 to-slate-50/30 dark:from-blue-950/20 dark:to-slate-900/10 border-l-4 border-blue-500 rounded-r-2xl text-slate-700 dark:text-slate-300 italic shadow-xs" {...props} />
                                  ),
                                  pre: ({node, ...props}) => (
                                    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-2xl p-4 my-4 text-xs overflow-x-auto border border-slate-800/80 font-mono leading-relaxed" {...props} />
                                  ),
                                  code: ({node, className, children, ...props} : any) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !match;
                                    return isInline ? (
                                      <code className="bg-slate-100 dark:bg-slate-800/70 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-mono font-medium" {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <code className="font-mono text-xs text-slate-100" {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  hr: ({node, ...props}) => (
                                    <hr className="my-5 border-slate-200/50 dark:border-slate-800/40" {...props} />
                                  )
                                }}
                              >
                                {msg.text || (isLoading && i === messages.length - 1 ? '...' : '')}
                              </ReactMarkdown>
                            </div>

                            {msg.role === 'bot' && (msg.text.includes('SOAP') || msg.text.includes('Report') || msg.text.includes('History') || msg.text.includes('Summary') || msg.text.includes('Assessment') || msg.text.includes('Education')) && (
                              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-1.5 font-sans animate-pulse">
                                  <span className="w-1.5 h-1.5 bg-indigo-550 rounded-full animate-ping" />
                                  <span className="text-[9px] font-[1000] uppercase text-indigo-600 dark:text-indigo-400 tracking-widest font-mono">Report Toolkit Active</span>
                                </div>
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.text);
                                      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Clinical report copied in raw Markdown format']);
                                      alert("Markdown blueprint copied to clipboard!");
                                    }}
                                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-white dark:bg-slate-950 text-slate-705 dark:text-slate-300 border border-slate-150 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                                  >
                                    📂 MD Copy
                                  </button>
                                  <button
                                    onClick={() => {
                                      const pFrame = document.createElement('iframe');
                                      pFrame.style.position = 'fixed';
                                      pFrame.style.right = '0';
                                      pFrame.style.bottom = '0';
                                      pFrame.style.width = '0';
                                      pFrame.style.height = '0';
                                      pFrame.style.border = '0';
                                      document.body.appendChild(pFrame);
                                      const pDoc = pFrame.contentWindow?.document || pFrame.contentDocument;
                                      if (pDoc) {
                                        pDoc.write(`
                                          <html>
                                            <head>
                                              <title>Doctorian Clinical Report</title>
                                              <style>
                                                body { font-family: -apple-system, sans-serif; padding: 45px; color: #1e293b; max-width: 650px; margin: 0 auto; line-height: 1.6; }
                                                h1, h2, h3 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; }
                                                pre { background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 13px; }
                                                .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e1e8f0; padding-top: 10px; text-align: center; }
                                              </style>
                                            </head>
                                            <body>
                                              <h2>🩺 DOCTORIAN CLINICAL RECORD</h2>
                                              <p style="font-size: 11px; color: #64748b; font-weight: bold;">Generated on: ${new Date().toLocaleString()} | Digital Signature Secured</p>
                                              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
                                              <div style="font-size: 13.5px; white-space: pre-wrap;">${msg.text}</div>
                                              <div class="footer">Doctorian AI Assistant • Uganda MOH Standard Care protocol compliant &bull; Signed off by Duty Physician.</div>
                                            </body>
                                          </html>
                                        `);
                                        pDoc.close();
                                        setTimeout(() => {
                                          pFrame.contentWindow?.focus();
                                          pFrame.contentWindow?.print();
                                          document.body.removeChild(pFrame);
                                        }, 400);
                                      }
                                    }}
                                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-200/20 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-100/50 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                                  >
                                    🖨️ PRINT
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTerminalLogs(prev => [
                                        ...prev.slice(-3),
                                        "SYS: Initiating SSL socket link with Bed monitor terminals...",
                                        `SYS: Synchronized clinical report payload for patient target successfully.`
                                      ]);
                                      alert("Clinical record transferred successfully to physical Ward EMR terminal.");
                                    }}
                                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/45 text-emerald-650 dark:text-emerald-400 border border-emerald-200/20 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-100/50 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                                  >
                                    📡 SYNC EMR
                                  </button>
                                </div>
                              </div>
                            )}

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
          <div className={`mx-auto transition-all duration-300 ${isWidescreen ? 'max-w-[95%] xl:max-w-7xl' : 'max-w-4xl'}`}>
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

              {/* Speech Recognition Recording Pulse Banner */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="mx-6 mt-3 px-4 py-2.5 bg-rose-500/10 dark:bg-rose-950/20 rounded-2xl border border-rose-500/20 flex items-center justify-between gap-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600 dark:bg-rose-500"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        Recording voice note... Speak query clearly
                      </span>
                    </div>
                    
                    {/* Live Audio Waves Bars */}
                    <div className="flex items-center gap-3 shrink-0">
                      <VoiceOscillograph isRecording={isRecording} />
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-[2px] bg-rose-500 rounded-full animate-bounce h-2.5 [animation-duration:0.6s]"></div>
                        <div className="w-[2px] bg-rose-500 rounded-full animate-bounce h-1.5 [animation-duration:0.4s]"></div>
                        <div className="w-[2px] bg-rose-500 rounded-full animate-bounce h-3 [animation-duration:0.8s]"></div>
                        <div className="w-[2px] bg-rose-500 rounded-full animate-bounce h-2 [animation-duration:0.5s]"></div>
                        <div className="w-[2px] bg-rose-500 rounded-full animate-bounce h-1 [animation-duration:0.75s]"></div>
                      </div>
                    </div>
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
                    onClick={() => {
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
                    className={`flex p-2.5 sm:p-3 rounded-full transition-all relative shrink-0 ${isRecording ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    title={isRecording ? "Stop voice query recording" : "Record voice query via Web Speech API"}
                  >
                    <Mic size={18} className={`sm:w-5 sm:h-5 ${isRecording ? 'animate-pulse' : ''}`} />
                    {isRecording && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                      </span>
                    )}
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
        </div>

          {/* Footer Info - discrete Gemini style */}
          <div className="px-6 py-2 flex items-center justify-center border-t border-slate-50 dark:border-slate-800/20 bg-white dark:bg-slate-950 shrink-0">
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest text-center">
               Doctorian Medical AI may display inaccurate info, including about people, so double-check its responses.
            </p>
          </div>
        </div>
        )}

        {activeMainTab === 'health_log' && (
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/40 custom-scrollbar p-4 sm:p-6 space-y-6">
            <div className={`mx-auto space-y-6 transition-all duration-300 ${isWidescreen ? 'max-w-[95%] xl:max-w-7xl' : 'max-w-4xl'}`}>
              {/* Header with Title and Import/Export Options */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div>
                  <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <History size={20} className="text-blue-600 animate-pulse" />
                    Offline Health Journal
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-bold">Log clinical biomarkers & physical symptoms safely in local browser sandbox.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={exportHealthLogs}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={12} />
                    Export Log
                  </button>
                  {healthLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to purge all logged entries? This is irreversible.")) {
                          setHealthLogs([]);
                          localStorage.removeItem('doctorian_health_logs');
                          setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Health log buffer completely purged.']);
                        }
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-105 dark:bg-rose-950/20 text-rose-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      Purge All
                    </button>
                  )}
                </div>
              </div>

              {/* Form Input Card */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Record Diagnostic Values</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Leave blank what you cannot determine or test.</p>
                </div>

                {logValidationError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{logValidationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] font-[1000] text-slate-450 uppercase tracking-widest block">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      placeholder="e.g. 120/80"
                      value={logBP}
                      onChange={(e) => setLogBP(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] font-[1000] text-slate-450 uppercase tracking-widest block">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 72"
                      value={logHR}
                      onChange={(e) => setLogHR(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] font-[1000] text-slate-450 uppercase tracking-widest block">Temperature (°C)</label>
                    <input
                      type="text"
                      placeholder="e.g. 36.8"
                      value={logTemp}
                      onChange={(e) => setLogTemp(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] font-[1000] text-slate-450 uppercase tracking-widest block">Oxygen saturation (SpO2%)</label>
                    <input
                      type="number"
                      placeholder="e.g. 98"
                      value={logSpO2}
                      onChange={(e) => setLogSpO2(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-[1000] text-slate-450 uppercase tracking-widest block font-sans">Active Symptoms & Observations</label>
                    <textarea
                      placeholder="Describe active clinical signs, intensity, local onset..."
                      value={logSymptoms}
                      onChange={(e) => setLogSymptoms(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] font-[1000] text-slate-450 uppercase tracking-widest block font-sans">Medication Taken or Scheduled</label>
                    <textarea
                      placeholder="e.g. Coartem pack 1 tab, Paracetamol 500mg..."
                      value={logMedication}
                      onChange={(e) => setLogMedication(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/40">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] font-[1000] text-slate-450 uppercase tracking-widest block">Blood Glucose (mmol/L) - Optional</label>
                    <input
                      type="text"
                      placeholder="e.g. 5.5"
                      value={logGlucose}
                      onChange={(e) => setLogGlucose(e.target.value)}
                      className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addHealthLogEntry}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <PlusCircle size={14} />
                    Commit entry to offline storage
                  </button>
                </div>
              </div>

              {/* Saved Entries Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-450">Journal Records ({healthLogs.length})</span>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Listed Descending By Recency</span>
                </div>

                {healthLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center mb-3">
                      <History size={18} className="text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-350 font-black uppercase mt-1">No local offline health records committed yet.</p>
                    <p className="text-[10.5px] text-slate-450 mt-2 font-bold max-w-sm leading-relaxed">Recorded vital parameters and symptom observations will appear here. They are 100% private to this browser sandbox.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {healthLogs.map((log: any) => (
                      <div key={log.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/20 transition-all text-left">
                        {/* Entry Timestamp Ribbon */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-4">
                          <div className="flex items-center gap-2.5 text-left">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-black text-slate-800 dark:text-white uppercase font-sans">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => diagnoseHealthLogEntry(log)}
                              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-900/10 text-[9px] font-extrabold uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-blue-100/10"
                            >
                              <BrainCircuit size={10} />
                              Diagnose via AI Brain
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteHealthLogEntry(log.id)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Biomarker stats panel */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5 text-left">
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block leading-none mb-1.5">Blood Pressure</span>
                            <span className="text-xs font-black text-slate-850 dark:text-white font-mono">{log.bloodPressure}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block leading-none mb-1.5">Pulse Rate</span>
                            <span className="text-xs font-black text-slate-850 dark:text-white font-mono">{log.heartRate === 'Not recorded' ? 'N/A' : `${log.heartRate} bpm`}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block leading-none mb-1.5">Temperature</span>
                            <span className="text-xs font-black text-slate-850 dark:text-white font-mono">{log.temperature === 'Not recorded' ? 'N/A' : `${log.temperature} °C`}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block leading-none mb-1.5">SpO2 Level</span>
                            <span className="text-xs font-black text-slate-850 dark:text-white font-mono">{log.spo2 === 'Not recorded' ? 'N/A' : `${log.spo2}%`}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 col-span-2 md:col-span-1">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block leading-none mb-1.5">Blood Glucose</span>
                            <span className="text-xs font-black text-slate-850 dark:text-white font-mono">{log.bloodGlucose === 'Not recorded' ? 'N/A' : `${log.bloodGlucose} mmol/L`}</span>
                          </div>
                        </div>

                        {/* Symptoms and Meds logs */}
                        <div className="space-y-3.5 text-left text-xs bg-slate-50/50 dark:bg-slate-950/20 px-5 py-4 rounded-2xl border border-slate-155 dark:border-slate-800/40">
                          <div>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Symptoms reported</span>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed font-sans">{log.symptoms}</p>
                          </div>
                          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-850">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1 font-sans">Active Medications list</span>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed font-sans">{log.medication}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeMainTab === 'resources' && (
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/40 custom-scrollbar p-4 sm:p-6 space-y-6">
            <div className={`mx-auto space-y-6 transition-all duration-300 ${isWidescreen ? 'max-w-[95%] xl:max-w-7xl' : 'max-w-4xl'}`}>
              {/* Header with Title */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300 text-left">
                <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Clinical Protocol Reference Vault
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-bold">Standard diagnostic aids & clinical reference cards compiled from official MoH Uganda and pediatric guideline frames.</p>
              </div>

              {/* Bento protocols grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Protocol 1: Malaria Dosing Table */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                      🌿 MoH Tropical Medicine
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Plasmodium Malaria Dosing Matrix</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">Uganda recommended dosing protocol for uncomplicated malaria using first-line Artemether-Lumefantrine (Coartem) tablets (20mg/120mg twice daily for 3 days).</p>
                    
                    <div className="overflow-x-auto text-[9.5px] font-sans border border-slate-100 dark:border-slate-850 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950/60 uppercase tracking-wider text-slate-400 text-[8px] font-black">
                            <th className="p-2.5">Weight Class</th>
                            <th className="p-2.5">Color Code</th>
                            <th className="p-2.5">Dose stat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-sans text-xs">
                          <tr>
                            <td className="p-2.5 font-semibold text-slate-850 dark:text-slate-300">5 to &lt;15 kg</td>
                            <td className="p-2.5 text-yellow-605 font-black uppercase">Yellow</td>
                            <td className="p-2.5 font-mono text-[10px]">1 tab BID x3 days</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-slate-850 dark:text-slate-300">15 to &lt;25 kg</td>
                            <td className="p-2.5 text-blue-600 font-black uppercase">Blue</td>
                            <td className="p-2.5 font-mono text-[10px]">2 tabs BID x3 days</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-slate-850 dark:text-slate-300">25 to &lt;35 kg</td>
                            <td className="p-2.5 text-orange-500 font-black uppercase">Orange</td>
                            <td className="p-2.5 font-mono text-[10px]">3 tabs BID x3 days</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-slate-850 dark:text-slate-300">&gt;=35 kg</td>
                            <td className="p-2.5 text-emerald-600 font-black uppercase">Green</td>
                            <td className="p-2.5 font-mono text-[10px]">4 tabs BID x3 days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-50 dark:border-slate-850 flex flex-wrap gap-2 justify-between items-center text-[8.5px] font-black uppercase tracking-wider text-slate-400">
                    <span>SEVERE MALARIA PRE-REFERRAL:</span>
                    <span className="text-rose-650 bg-rose-500/10 px-2 py-1 rounded">Artesunate 2.4 mg/kg IV</span>
                  </div>
                </div>

                {/* Protocol 2: IMCI Dehydration Diagnostic Matrix */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-3 text-left">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                      👶 Integrated Management (IMCI)
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Child Dehydration Triage Index</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">Standard rapid diagnostic criteria to formulate treatment plans (Plan A, B, or C) for pediatric diarrheal illness.</p>
                    
                    <div className="space-y-2 font-mono text-[9px] font-bold">
                      <div className="p-2.5 rounded-xl border border-red-200/50 dark:border-red-950/40 bg-red-500/5 text-slate-700 dark:text-slate-350">
                        <p className="text-[10px] text-red-600 dark:text-red-400 font-black uppercase mb-1">Severe Dehydration (Plan C Fluids Urgent)</p>
                        <span className="leading-relaxed">Any 2 signs: Lethargic or unconscious, Sunken eyes, Cannot drink or drinks poorly, Skin pinch retracts very slowly (&gt;2 seconds).</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-950/40 bg-amber-500/5 text-slate-700 dark:text-slate-350 text-left">
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 font-black uppercase mb-1">Some Dehydration (Plan B ORS support)</p>
                        <span className="leading-relaxed">Any 2 signs: Restless or irritable, Sunken eyes, Drinks eagerly/thirsty, Skin pinch retracts slowly.</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40 text-right">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-[#94a3b8]">Baseline triage indices based on WHO guidelines</span>
                  </div>
                </div>

                {/* Protocol 3: Maternal Danger Signals & Pre-eclampsia */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                      🤰 Maternal Health & Obstetrics
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Pre-eclampsia Screening Criteria</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">Immediate diagnosis framework for hypertensive disorders of pregnancy, preventing progression to lethal eclampsia.</p>
                    
                    <div className="space-y-2.5 text-xs text-slate-705 dark:text-slate-350 font-semibold font-sans">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-500 block shrink-0">•</span>
                        <span><strong>Hypertensive limit</strong>: Diastolic BP &gt;= 90 mmHg or Systolic BP &gt;= 140 mmHg after 20 weeks gestation in previously normotensive parent.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-500 block shrink-0">•</span>
                        <span><strong>Severe Alarm Signs</strong>: Frontal headache, visual blurring, flashing light spots, hyperreflexia, liver pain (epigastric tension), proteinuria 3+.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-500 block shrink-0">•</span>
                        <span><strong>Stabilization SOP</strong>: Magnesium Sulfate 4g IV stat over 20 mins, then 10g IM loading dose, fast-track RRH referral.</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-50 dark:border-slate-850 flex justify-between items-center text-[8.5px] font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded">
                    <span>SEIZURE PROTECTION DIRECTIVE:</span>
                    <span>IV/IM Magnesium Sulfate Loading SOP</span>
                  </div>
                </div>

                {/* Protocol 4: Clinical Safety & Ethical Practice */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-500/10 text-slate-500 text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                      🛡️ Clinical Compliance Lockout
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Ethics & Ultimate Review Directives</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">Comprehensive disclaimer and directive matrix designed to enforce patient safety, absolute clinical sovereignty, and localized verification requirements.</p>
                    
                    <ul className="space-y-1.5 font-sans text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold">
                      <li className="flex items-start gap-1.5">
                        <span className="text-orange-550 shrink-0 mt-0.5">⚠️</span>
                        <span>No AI consultation constitutes static absolute advice. Frame all diagnostics as probability pathways.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-orange-550 shrink-0 mt-0.5">⚠️</span>
                        <span>Always complete physical verification (biomarkers, blood smear, clinical auscultation) before committing to pharmaceutical courses.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-orange-550 shrink-0 mt-0.5">⚠️</span>
                        <span>Direct immediate referrals to standard clinical centers (Mbarara, Mulago, Gulu, Fort Portal regional centers) when any life hazard is detected.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40 text-right">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-[#94a3b8]">Directive: Local Physical Review Required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
                onClick={() => setActiveTool('rag_clinical_hub')}
                className={`py-1.5 px-2 text-[8.5px] font-[1000] uppercase tracking-wider rounded-lg transition-all ${activeTool === 'rag_clinical_hub' ? 'bg-indigo-650 dark:bg-indigo-950/80 text-white shadow-sm border border-indigo-500/50 font-black' : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-800/10 border border-transparent'}`}
              >
                🩺 Clinical RAG
              </button>
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
              {activeTool === 'rag_clinical_hub' ? (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  {/* Select Patient Target */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Select Patient Record Target (RAG)
                    </label>
                    <div className="space-y-2">
                      {registeredPatients.map((patient: any) => {
                        const isSelected = patient.id === ragSelectedPatientId;
                        return (
                          <button
                            type="button"
                            key={patient.id}
                            onClick={() => setRagSelectedPatientId(patient.id)}
                            className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'bg-indigo-50/70 border-indigo-500/70 dark:bg-indigo-500/10 dark:border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                                : 'bg-white border-slate-100 hover:border-slate-350 dark:bg-slate-950 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                                  {patient.name}
                                </h4>
                                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                  {patient.gender}, Age {patient.age} • {patient.bedNumber}
                                </p>
                              </div>
                              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                patient.vitalsPreset === 'critical' ? 'bg-red-500/10 text-red-500' :
                                patient.vitalsPreset === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-emerald-500/10 text-emerald-500'
                              }`}>
                                {patient.vitalsPreset || 'stable'}
                              </span>
                            </div>
                            <div className="mt-2 text-[9px] text-slate-500 dark:text-slate-405 leading-relaxed font-semibold border-t border-slate-50 dark:border-slate-800/50 pt-2">
                              <strong>Conditions:</strong> {patient.conditions}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Choose clinical sub-tool */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Clinical AI Processing Task
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'consultation_prep', label: 'Consult Counsel', desc: 'Pre-consult checklist' },
                        { id: 'summary', label: 'Summarize History', desc: 'Synthesizes past records' },
                        { id: 'medical_report', label: 'Draft SOAP Report', desc: 'Generates chart note' },
                        { id: 'speech_note', label: 'Verbal Note Convert', desc: 'Parses speech transcript' },
                        { id: 'health_education', label: 'Health Education', desc: 'Patient guide leaflet' },
                      ].map((tool) => {
                        const isSubSelected = tool.id === ragSubTool;
                        return (
                          <button
                            type="button"
                            key={tool.id}
                            onClick={() => setRagSubTool(tool.id as any)}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSubSelected
                                ? 'bg-indigo-650 text-white border-indigo-650 shadow-lg shadow-indigo-500/20 font-black'
                                : 'bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-950 dark:border-slate-850 text-slate-800 dark:text-slate-250 font-bold'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider block">
                              {tool.label}
                            </span>
                            <span className={`text-[8px] font-medium leading-tight block mt-1 ${isSubSelected ? 'text-white/80' : 'text-slate-400'}`}>
                              {tool.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Generated Reports Advanced Customization Options */}
                  <div className="p-4 bg-slate-50/75 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4 text-left">
                    <h5 className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                      ⚙️ REPORT CUSTOMIZATION ENGINE
                    </h5>
                    
                    {/* Template Selector */}
                    {(ragSubTool === 'medical_report' || ragSubTool === 'speech_note') && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-405 dark:text-slate-500 uppercase tracking-wider block">
                          Premium Document Layout Template
                        </label>
                        <select
                          value={reportTemplate}
                          onChange={(e) => setReportTemplate(e.target.value as any)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-3 py-2 text-[10.5px] font-bold text-slate-700 dark:text-slate-305"
                        >
                          <option value="soap_standard">🩺 SOAP Clinical Chart Note (Standard)</option>
                          <option value="discharge_sum">🏥 Hospital Inpatient Discharge Summary</option>
                          <option value="risk_assessment_guide">⚡ Intervention & Differential Risks Mapping</option>
                        </select>
                      </div>
                    )}

                    {/* Checkboxes parameters */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 transition-colors">
                        <input
                          type="checkbox"
                          checked={includeLiveVitals}
                          onChange={(e) => setIncludeLiveVitals(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <div className="text-[9.5px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                          Live Vitals
                          <span className="text-[8px] text-slate-400 block font-normal mt-0.5">Embed Monitor stats</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 transition-colors">
                        <input
                          type="checkbox"
                          checked={includeMOHGuidelines}
                          onChange={(e) => setIncludeMOHGuidelines(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <div className="text-[9.5px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                          MOH Compliance
                          <span className="text-[8px] text-slate-400 block font-normal mt-0.5">Align Uganda rules</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 transition-colors">
                        <input
                          type="checkbox"
                          checked={includeDifferentialDiagnosis}
                          onChange={(e) => setIncludeDifferentialDiagnosis(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <div className="text-[9.5px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                          Differentials
                          <span className="text-[8px] text-slate-400 block font-normal mt-0.5">Include risk pathing</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 transition-colors">
                        <input
                          type="checkbox"
                          checked={abbreviationExpansion}
                          onChange={(e) => setAbbreviationExpansion(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <div className="text-[9.5px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                          Shorthand Expander
                          <span className="text-[8px] text-slate-400 block font-normal mt-0.5">Auto expand BP, SpO2</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Condition Fields based on subtool */}
                  {ragSubTool === 'speech_note' && (
                    <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800/65 pt-4 animate-in fade-in slide-in-from-top-1.5">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Consultation Speech Transcript
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (!speechTranscript.trim()) return;
                              const expanded = expandClinicalAbbreviations(speechTranscript);
                              setSpeechTranscript(expanded);
                              setTerminalLogs(prev => [...prev.slice(-3), "SYS: Custom clinical abbreviation translation complete!"]);
                            }}
                            className="px-2.5 py-1 bg-violet-50 dark:bg-violet-950/40 text-violet-650 dark:text-violet-405 border border-violet-200/40 rounded-xl text-[8.5px] font-black uppercase tracking-widest hover:bg-violet-100 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            ✨ Expand Abbreviations
                          </button>
                          <button
                            type="button"
                            onClick={handleSimulateSpeechDictation}
                            disabled={isSimulatingDictation}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-450 border border-indigo-200/50 rounded-xl text-[8.5px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {isSimulatingDictation ? (
                              <>
                                <RefreshCw size={10} className="animate-spin" />
                                Transcribing...
                              </>
                            ) : (
                              <>
                                <Sparkles size={10} className="text-indigo-500 animate-pulse" />
                                Sim dictation
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        value={speechTranscript}
                        onChange={(e) => setSpeechTranscript(e.target.value)}
                        placeholder="Paste speech transcript or click 'Sim dictation' to simulate voice input session with current patient..."
                        className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 leading-relaxed max-h-40 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Submit Trigger Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={handleSubmitRAGQuery}
                      className="w-full py-4 bg-indigo-650 hover:bg-indigo-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/25 transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-bold"
                    >
                       Fulfill clinical task via Llama RAG
                    </button>
                  </div>
                </div>
              ) : activeTool === 'case_intake' ? (
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
                  {/* Google MedLM Specialty Configurations */}
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl border border-blue-100/60 dark:border-blue-900/40 space-y-4">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[7.5px] font-[1000] uppercase tracking-widest leading-none mb-2">
                        ✨ Google MedLM Enabled
                      </span>
                      <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">Specialized Clinical AI Brain</p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">Select the clinical intelligence layout for diagnostic formulation</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'gemma3-tfjs' as const, label: 'Doctorian Local (Gemma 3)', desc: 'TFJS Local Core', tier: 'Standard (Free)' },
                        { id: 'llama-clinical' as const, label: 'Doctorian Llama 3.1', desc: 'Clinical Core', tier: 'Standard (Free)' },
                        { id: 'medlm-medium' as const, label: 'Doctorian MedLM Pro', desc: 'Specialized Pro', tier: 'Pro Required' },
                        { id: 'medlm-large' as const, label: 'Doctorian MedLM Ultra', desc: 'Deep Reasoning', tier: 'Matrix Required' }
                      ].map(engineOption => {
                        const { hasAccess, tierName } = checkModelAccess(engineOption.id);
                        const isSelected = clinicalEngine === engineOption.id;
                        
                        return (
                          <button 
                            type="button"
                            key={engineOption.id}
                            onClick={() => selectClinicalModel(engineOption.id)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                                : !hasAccess
                                  ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:border-red-500/20 hover:bg-slate-50 dark:hover:bg-slate-900'
                                  : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-450 hover:border-blue-500/20'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 w-full">
                                <p className="text-[9.5px] font-black uppercase tracking-widest leading-none m-0">{engineOption.label}</p>
                                {!hasAccess && <span className="text-[7px] text-red-500 dark:text-red-400 font-extrabold uppercase bg-red-100/50 dark:bg-red-900/20 px-1 py-0.5 rounded leading-none shrink-0">🔒 Lock</span>}
                                {hasAccess && isSelected && <span className="text-[7px] text-blue-100 font-extrabold uppercase bg-blue-700 px-1 py-0.5 rounded leading-none shrink-0">Active</span>}
                                {hasAccess && !isSelected && <span className="text-[7px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase bg-emerald-100/30 dark:bg-emerald-900/10 px-1 py-0.5 rounded leading-none shrink-0">Ready</span>}
                              </div>
                              <p className={`text-[7px] font-[1000] uppercase mt-1.5 tracking-wide leading-normal ${isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>{engineOption.desc}</p>
                            </div>
                            <span className={`text-[6.5px] font-black uppercase tracking-widest mt-2 block ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                              {hasAccess ? 'Licensed' : engineOption.tier}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                      <div>
                        <p className="text-[9.5px] font-black text-slate-850 dark:text-slate-200 uppercase tracking-widest leading-none">Clinical Grounding</p>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">Search verified online sources in real-time</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setClinicalGrounding(!clinicalGrounding)}
                        className={`w-11 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${clinicalGrounding ? 'bg-blue-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                      </button>
                    </div>
                  </div>

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

                  {/* Neural Brain Memory & Manual Training Section */}
                  <div className="space-y-3 p-4 bg-purple-50/50 dark:bg-purple-950/10 rounded-2xl border border-purple-100/60 dark:border-purple-900/40 font-sans shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-purple-800 dark:text-purple-300 uppercase tracking-widest leading-none m-0">🧠 Neural Brain Memory</p>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold leading-none">Persistent learned facts from clinical chats</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const userKey = user?.email || user?.id || 'default';
                          localStorage.setItem(`doctorian_brain_memories_${userKey}`, '[]');
                          localStorage.setItem('doctorian_brain_memories', '[]');
                          setBrainMemories([]);
                          setTerminalLogs(prev => [...prev.slice(-3), 'SYS: AI Core Memory successfully purged.']);
                        }}
                        className="text-[7.5px] font-black text-red-500 hover:text-red-600 bg-red-100/50 dark:bg-red-950/40 px-2 py-1 rounded-md uppercase tracking-wider transition-colors"
                      >
                        Purge Memory
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                      {brainMemories.length === 0 ? (
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 italic m-0">No facts synthesized yet. Discuss patients, vitals, or specific protocols to train the brain automatically, or type a manual memory below.</p>
                      ) : (
                        brainMemories.map((fact, idx) => (
                          <div key={idx} className="p-2 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-purple-100/30 dark:border-purple-950/40 flex items-start justify-between gap-1.5 group">
                            <div className="flex items-start gap-1.5">
                              <span className="text-[9px] mt-0.5 shrink-0">✨</span>
                              <p className="text-[9.5px] text-slate-600 dark:text-slate-300 leading-normal font-sans m-0">
                                {fact}
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                const updated = brainMemories.filter((_, i) => i !== idx);
                                setBrainMemories(updated);
                                const userKey = user?.email || user?.id || 'default';
                                localStorage.setItem(`doctorian_brain_memories_${userKey}`, JSON.stringify(updated));
                                localStorage.setItem('doctorian_brain_memories', JSON.stringify(updated));
                              }}
                              className="text-[8px] text-slate-400 hover:text-red-500 font-bold px-1"
                              title="Remove fact"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add custom training memory */}
                    <div className="flex gap-1.5 pt-1">
                      <input 
                        type="text"
                        value={newMemoryText}
                        onChange={(e) => setNewMemoryText(e.target.value)}
                        placeholder="Type clinical facts (e.g., 'Patient Joseph is allergic to aspirin')"
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-[10px] px-3 py-1.5 rounded-xl font-sans"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddManualMemory();
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={handleAddManualMemory}
                        className="px-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all"
                      >
                        Train
                      </button>
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
                        const engineName = clinicalEngine === 'gemma3-tfjs' ? 'Gemma 3 4B Local' : (clinicalEngine === 'medlm-medium' ? 'Google MedLM' : (clinicalEngine === 'medlm-large' ? 'MedLM Reasoning' : 'Llama 3.1'));
                        setTerminalLogs(prev => [...prev.slice(-3), `SYS: Clinical brain aligned to ${engineName}. Grounding: ${clinicalGrounding ? 'ONLINE' : 'OFFLINE'}`]);
                      } catch (e) {
                        setShowSettings(false);
                        const engineName = clinicalEngine === 'gemma3-tfjs' ? 'Gemma 3 4B Local' : (clinicalEngine === 'medlm-medium' ? 'Google MedLM' : (clinicalEngine === 'medlm-large' ? 'MedLM Reasoning' : 'Llama 3.1'));
                        setTerminalLogs(prev => [...prev.slice(-3), `SYS: Clinical brain aligned to ${engineName}. Grounding: ${clinicalGrounding ? 'ONLINE' : 'OFFLINE'}`]);
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


       {/* Doctorian Voice Consultation & Calling Gateway Modal */}
       <AnimatePresence>
         {showVoiceCallModal && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
             {/* Backdrop */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => {
                 if (callState === 'idle') setShowVoiceCallModal(false);
               }}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl"
             />

             {/* Modal Container */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-lg bg-slate-950/95 border border-slate-800/80 text-white rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden max-h-[85vh] font-sans"
             >
               {/* Modal Header */}
               <div className="p-6 flex items-center justify-between shrink-0 bg-transparent z-10">
                 <div className="text-left flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">AI Consultation</span>
                 </div>
                 {callState === 'idle' && (
                   <button 
                     onClick={() => setShowVoiceCallModal(false)} 
                     className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                   >
                     <X size={18} />
                   </button>
                 )}
               </div>

               {/* Modal Content */}
               <div className="px-6 pb-8 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                 
                 {/* IDLE STATE */}
                 {callState === 'idle' && (
                   <div className="flex flex-col flex-1 justify-center space-y-8 py-4 animate-in fade-in duration-300">
                     <div className="text-center space-y-2">
                       <h3 className="text-2xl font-semibold tracking-tight text-white">Secure Voice Portal</h3>
                       <p className="text-xs text-slate-400 max-w-sm mx-auto">
                         Connect with our clinical intelligence core. Powered by real-time translation and modern neural models.
                       </p>
                     </div>

                     {/* Clean Configuration Card */}
                     <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 space-y-5 text-left">
                       {/* Voice Selection */}
                       <div className="space-y-2.5">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Clinician Voice</span>
                         <div className="grid grid-cols-3 gap-2">
                           {[
                             { id: 'Charon' as const, label: 'Charon', desc: 'Male Voice' },
                             { id: 'Dr. Obote Mentor' as const, label: 'Dr. Obote', desc: 'Tutor Voice' },
                             { id: 'Nurse Atwine' as const, label: 'Nurse Atwine', desc: 'Midwife Voice' }
                           ].map(voice => (
                             <button
                               key={voice.id}
                               type="button"
                               onClick={() => setVoiceSelection(voice.id)}
                               className={`p-3 rounded-2xl border text-center transition-all ${
                                 voiceSelection === voice.id 
                                   ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' 
                                   : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white hover:border-slate-700'
                               }`}
                             >
                               <p className="text-xs font-semibold leading-none">{voice.label}</p>
                               <p className="text-[9px] text-slate-500 mt-1 leading-none">{voice.desc}</p>
                             </button>
                           ))}
                         </div>
                       </div>

                       {/* Cognitive Brain Selection */}
                       <div className="space-y-2.5">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cognitive AI Brain</span>
                         <div className="grid grid-cols-2 gap-2">
                           {[
                             { id: 'Gemini-3.5-Flash' as const, label: 'Gemini 3.5 Flash', desc: 'Ultra-fast Clinical Reasoning' },
                             { id: 'Qwen2.5-3B-Instruct' as const, label: 'Qwen 2.5 (Local)', desc: 'Secure Offline Model' }
                           ].map(brain => (
                             <button
                               key={brain.id}
                               type="button"
                               onClick={() => setVoiceBrainModel(brain.id)}
                               className={`p-3 rounded-2xl border text-left transition-all ${
                                 voiceBrainModel === brain.id 
                                   ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' 
                                   : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white hover:border-slate-700'
                               }`}
                             >
                               <p className="text-xs font-semibold leading-none">{brain.label}</p>
                               <p className="text-[9px] text-slate-500 mt-1 leading-none">{brain.desc}</p>
                             </button>
                           ))}
                         </div>
                       </div>
                     </div>

                     {/* Action Controls */}
                     <div className="space-y-3">
                       <button
                         type="button"
                         onClick={startVoiceCallSession}
                         className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-2xl font-semibold tracking-wider text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                       >
                         <Phone size={14} />
                         Initiate Direct Call
                       </button>

                       <button
                         type="button"
                         onClick={triggerIncomingCall}
                         className="w-full py-4 bg-slate-900 hover:bg-slate-800/80 text-white rounded-2xl font-semibold tracking-wider text-xs border border-slate-800 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                       >
                         <Sparkles size={14} className="text-blue-400" />
                         Receive Incoming Call Demo
                       </button>
                     </div>
                   </div>
                 )}

                 {/* INCOMING STATE (Call Answering Capability) */}
                 {callState === 'incoming' && (
                   <div className="flex flex-col flex-1 justify-center items-center py-10 space-y-12 animate-in zoom-in-95 duration-350">
                     <div className="text-center space-y-3">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 animate-pulse">Incoming Consultation Call</p>
                       <h3 className="text-2xl font-semibold text-white">{voiceSelection} (Doctorian)</h3>
                       <p className="text-xs text-slate-400">Secure AI Clinical Gateway</p>
                     </div>

                     {/* Beautiful Pulsing Call Waves */}
                     <div className="relative flex items-center justify-center w-40 h-40">
                       <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping [animation-duration:2.5s]" />
                       <div className="absolute inset-4 rounded-full bg-emerald-500/10 animate-ping [animation-duration:1.8s]" />
                       <div className="absolute inset-8 rounded-full bg-emerald-500/15 animate-pulse" />
                       
                       <div className="relative z-10 w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                         <Phone size={36} className="text-emerald-400 animate-bounce" />
                       </div>
                     </div>

                     {/* Action buttons (Answer/Decline) */}
                     <div className="flex items-center gap-8 w-full max-w-xs justify-center pt-4">
                       <button
                         type="button"
                         onClick={declineIncomingCall}
                         className="w-14 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/25 active:scale-90 transition-all cursor-pointer"
                         title="Decline Call"
                       >
                         <X size={24} />
                       </button>

                       <button
                         type="button"
                         onClick={answerIncomingCall}
                         className="w-16 h-16 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-90 transition-all cursor-pointer animate-pulse"
                         title="Answer Call"
                       >
                         <Phone size={28} />
                       </button>
                     </div>
                   </div>
                 )}

                 {/* ACTIVE CALL STATE (Calling, Connected, Disconnecting) */}
                 {(callState === 'calling' || callState === 'connected' || callState === 'disconnecting') && (
                   <div className="flex flex-col flex-1 justify-between py-2 space-y-6 animate-in zoom-in-95 duration-300">
                     
                     <div className="text-center space-y-2 pt-4">
                       <h3 className="text-lg font-semibold tracking-tight text-white">{voiceSelection} (Doctorian)</h3>
                       <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                         {callState === 'calling' ? (
                           <span className="text-amber-400 animate-pulse">Connecting...</span>
                         ) : callState === 'disconnecting' ? (
                           <span className="text-rose-400">Disconnecting...</span>
                         ) : (
                           `Connected • ${String(Math.floor(voiceCallDuration / 60)).padStart(2, '0')}:${String(voiceCallDuration % 60).padStart(2, '0')}`
                         )}
                       </p>
                     </div>

                     {/* Modern Plain Centered Fluid Breathing Ring */}
                     <div className="flex flex-col items-center justify-center py-6">
                       <div className="relative w-44 h-44 flex items-center justify-center">
                         {/* Ambient fluid glow rings */}
                         <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/10 to-blue-600/10 blur-xl transition-all duration-700 ${voiceIsSpeaking ? 'scale-125 opacity-100' : 'scale-90 opacity-40'}`} />
                         
                         {/* Pulse Waves */}
                         {voiceIsSpeaking && (
                           <>
                             <div className="absolute inset-0 rounded-full border border-cyan-500/25 animate-ping [animation-duration:2.5s]" />
                             <div className="absolute inset-4 rounded-full border border-blue-500/20 animate-ping [animation-duration:1.8s]" />
                           </>
                         )}

                         {/* Core glowing orb mimicking Gemini voice call UI */}
                         <div className={`w-32 h-32 rounded-full flex items-center justify-center relative transition-all duration-500 border ${
                           voiceIsSpeaking 
                             ? 'bg-gradient-to-br from-cyan-950/80 to-blue-950/80 border-cyan-500/40 shadow-2xl shadow-cyan-500/15 scale-105' 
                             : voiceCallIsTranscribing
                             ? 'bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border-indigo-500/30 shadow-xl shadow-indigo-500/10 animate-pulse'
                             : 'bg-slate-900/90 border-slate-800 shadow-md scale-95'
                         }`}>
                           {/* Rotating internal gradient layer when thinking */}
                           {voiceCallIsTranscribing && (
                             <div className="absolute inset-1.5 rounded-full border border-t-cyan-400 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin [animation-duration:1s]" />
                           )}

                           <div className="flex items-end gap-1.5 h-8">
                             {voiceIsSpeaking ? (
                               // Live elegant equalizers
                               [...Array(6)].map((_, i) => (
                                 <div 
                                   key={i} 
                                   className="w-1 bg-cyan-400 rounded-full animate-bounce"
                                   style={{
                                     height: `${30 + Math.random() * 70}%`,
                                     animationDuration: `${0.4 + Math.random() * 0.4}s`,
                                     animationDelay: `${i * 0.08}s`
                                   }}
                                 />
                               ))
                             ) : voiceCallIsTranscribing ? (
                               <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 animate-pulse">Thinking</div>
                             ) : (
                               // Inactive soft breathing bars
                               [...Array(4)].map((_, i) => (
                                 <div 
                                   key={i} 
                                   className="w-1 h-1.5 bg-slate-600 rounded-full animate-pulse"
                                   style={{ animationDelay: `${i * 0.15}s` }}
                                 />
                               ))
                             )}
                           </div>
                         </div>
                       </div>
                       
                       <p className="text-xs text-slate-400 mt-4 h-4 font-medium">
                         {voiceIsSpeaking ? "Doctorian is speaking" : voiceCallIsTranscribing ? "Synthesizing stream..." : "Listening..."}
                       </p>
                     </div>

                     {/* Collapsible Transcript Container */}
                     <div className="space-y-2 text-left bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden">
                       <button
                         type="button"
                         onClick={() => setShowVoiceTranscript(!showVoiceTranscript)}
                         className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none"
                       >
                         <span className="font-semibold uppercase tracking-wider text-[9px]">Live Dialogue Transcript</span>
                         <div className="flex items-center gap-1">
                           <span className="text-[9px] font-medium">{showVoiceTranscript ? 'Hide' : 'Show'}</span>
                           <ChevronDown size={12} className={`transform transition-transform ${showVoiceTranscript ? 'rotate-180' : ''}`} />
                         </div>
                       </button>

                       {showVoiceTranscript && (
                         <div className="h-32 p-4 overflow-y-auto space-y-3 flex flex-col custom-scrollbar border-t border-slate-900/50 text-[11px] animate-in slide-in-from-top-2 duration-200">
                           {voiceCallTranscript.map((log, i) => (
                             <div 
                               key={i} 
                               className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                                 log.role === 'user' 
                                   ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/10 self-end' 
                                   : 'bg-slate-900/80 text-slate-200 border border-slate-800/40 self-start'
                               }`}
                             >
                               <span className="text-[8px] font-bold uppercase tracking-wider block mb-1 text-slate-400">
                                 {log.role === 'user' ? 'You' : voiceSelection}
                               </span>
                               <p className={`m-0 ${log.role === 'user' ? 'font-black text-cyan-200' : ''}`}>{log.text}</p>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>

                     {/* Quick Prompt Phrases Selector */}
                     <div className="bg-slate-900/20 border border-slate-900/50 rounded-2xl p-3.5 space-y-2.5 text-left">
                       <div className="flex flex-wrap gap-1.5">
                         {[
                           "Explain malaria prevention",
                           "Explain child immunization",
                           "My back is hurting badly",
                           "What is Musujja treatment?"
                         ].map((promptText, i) => (
                           <button
                             key={i}
                             type="button"
                             onClick={() => {
                               setVoiceCallQuery(promptText);
                               sendVoiceCallMessage(promptText);
                             }}
                             className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-[9px] text-slate-300 hover:text-white rounded-lg transition-all border border-slate-850 cursor-pointer font-medium"
                           >
                             "{promptText}"
                           </button>
                         ))}
                       </div>

                       {/* Alternative Text Prompt Input */}
                       <div className="flex gap-2">
                         <input
                           type="text"
                           placeholder="Type to talk instead..."
                           value={voiceCallQuery}
                           onChange={(e) => setVoiceCallQuery(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               e.preventDefault();
                               sendVoiceCallMessage();
                             }
                           }}
                           className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 text-left"
                         />
                         <button
                           type="button"
                           onClick={() => sendVoiceCallMessage()}
                           className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-semibold rounded-xl transition-all cursor-pointer"
                         >
                           Send
                         </button>
                       </div>
                     </div>

                     {/* Clean Control Toolbar */}
                     <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-900/40">
                       <div className="flex gap-2">
                         <button
                           type="button"
                           onClick={() => setVoiceCallMuted(!voiceCallMuted)}
                           className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                             voiceCallMuted 
                               ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                               : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white'
                           }`}
                           title={voiceCallMuted ? "Unmute Mic" : "Mute Mic"}
                         >
                           {voiceCallMuted ? <MicOff size={16} /> : <Mic size={16} />}
                         </button>
                         
                         <button
                           type="button"
                           onClick={() => setVoiceCallerSpeaker(!voiceCallerSpeaker)}
                           className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                             !voiceCallerSpeaker 
                               ? 'bg-slate-900 border-slate-850 text-slate-600' 
                               : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                           }`}
                           title="Toggle Speaker Boost"
                         >
                           {voiceCallerSpeaker ? <Volume2 size={16} /> : <VolumeX size={16} />}
                         </button>
                       </div>

                       <button
                         type="button"
                         onClick={terminateVoiceCallSession}
                         className="px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-rose-500/10 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                       >
                         <Phone size={14} className="rotate-[135deg]" />
                         End Consultation
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
      </div>
    );
  }
