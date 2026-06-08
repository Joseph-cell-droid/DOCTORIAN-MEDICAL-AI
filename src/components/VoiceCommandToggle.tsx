import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Info, HelpCircle, Navigation, CheckCircle, AlertTriangle, Sparkles, X, Volume2, HelpCircle as HelpIcon, History, Clock, WifiOff, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define the voice command item shape
export interface VoiceCommandHelp {
  phrase: string;
  description: string;
  targetView: string;
}

export interface CommandLog {
  id: string;
  phrase: string;
  targetLabel: string;
  timestamp: string;
}

const VOICE_COMMANDS_HELP: VoiceCommandHelp[] = [
  { phrase: "go home / dashboard", description: "Navigate to Dashboard home", targetView: "home" },
  { phrase: "open monitor / telemetry", description: "Open Patient vital monitor / beds", targetView: "monitor" },
  { phrase: "go to ai / medical assistant", description: "Launch core AI Medical Nexus", targetView: "ai_nexus" },
  { phrase: "open specialist / clinical / emr", description: "Launch Clinical EMR specialist node", targetView: "specialist" },
  { phrase: "go to services / features", description: "Browse digital health services", targetView: "features" },
  { phrase: "open records / charts", description: "View personal health records & reports", targetView: "records" },
  { phrase: "open lab / diagnostics", description: "Go to Diagnostic Lab results", targetView: "diagnostic_lab" },
  { phrase: "open symptoms / check symptoms", description: "Launch interactive Symptom Checker", targetView: "symptoms" },
  { phrase: "open meds / smart meds", description: "View smart medications organizer", targetView: "meds" },
  { phrase: "open fitness / workout", description: "Access biometrics fitness tracker", targetView: "fitness" },
  { phrase: "open emergency", description: "Trigger emergency & first-aid system", targetView: "emergency" },
  { phrase: "open profile", description: "View clinician / patient profile cards", targetView: "profile" },
  { phrase: "open admin / security", description: "Authenticate administrative portal", targetView: "admin" },
  { phrase: "about us / mission", description: "Read About US medical mission", targetView: "about" }
];

interface VoiceCommandToggleProps {
  onNavigate: (view: any) => void;
}

export const VoiceCommandToggle: React.FC<VoiceCommandToggleProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'success' | 'unrecognized' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [commandLogs, setCommandLogs] = useState<CommandLog[]>([]);
  const [showCommandLog, setShowCommandLog] = useState(false);
  const [manualInput, setManualInput] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commandLogTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check speech recognition support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Set up speech recognition instance
  const initRecognition = () => {
    if (recognitionRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setTranscript('Listening for commands...');
      setFeedbackMessage('');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
      
      if (event.error === 'network') {
        setStatus('error');
        setFeedbackMessage('Clinical speech engine is currently offline due to a network connection issue. Hands-free voice is suspended. Please use manual command typing input below.');
      } else if (event.error === 'not-allowed') {
        setStatus('error');
        setFeedbackMessage('Microphone speech authorization was denied. Please adjust your browser permissions or use the manual text console below.');
      } else {
        setStatus('error');
        setFeedbackMessage(`Speech recognition encountered an issue (${event.error}). Please input your clinical command manually below.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      if (activeText.trim()) {
        setTranscript(activeText);
        processSpeech(activeText);
      }
    };

    recognitionRef.current = recognition;
  };

  // Match text against commands and navigate
  const processSpeech = (text: string): boolean => {
    const speechText = text.toLowerCase().trim();
    
    // Commands mapping utilities
    const mappings = [
      { keys: ['go home', 'dashboard', 'main screen', 'welcome', 'homepage'], view: 'home', label: 'Dashboard Home' },
      { keys: ['monitor', 'telemetry', 'beds', 'vitals', 'patient'], view: 'monitor', label: 'Patient Vital Monitor' },
      { keys: ['ai', 'nexus', 'doctor', 'assistant'], view: 'ai_nexus', label: 'AI Medical Nexus' },
      { keys: ['specialist', 'emr', 'ehr', 'clinical'], view: 'specialist', label: 'Clinical EMR Specialist' },
      { keys: ['services', 'features', 'catalogue', 'modules'], view: 'features', label: 'Health Services Feature Catalog' },
      { keys: ['records', 'documents', 'charts', 'history', 'reports'], view: 'records', label: 'Personal Health Records' },
      { keys: ['lab', 'diagnostics', 'testing'], view: 'diagnostic_lab', label: 'Diagnostic Lab' },
      { keys: ['meds', 'medication', 'pharmacy', 'pills'], view: 'meds', label: 'Smart Medications Tracker' },
      { keys: ['symptoms', 'diagnostic checker', 'symptom'], view: 'symptoms', label: 'Interactive Symptom Checker' },
      { keys: ['fitness', 'exercise', 'workout'], view: 'fitness', label: 'Biometrics Fitness Tracker' },
      { keys: ['emergency', 'alert', 'critical'], view: 'emergency', label: 'Emergency First-Aid Hub' },
      { keys: ['profile', 'account', 'me', 'settings'], view: 'profile', label: 'User Profile' },
      { keys: ['admin', 'portal', 'security', 'access', 'administration'], view: 'admin', label: 'Admin Command Center' },
      { keys: ['about us', 'mission', 'about'], view: 'about', label: 'About Us Portal' }
    ];

    for (const mapping of mappings) {
      for (const phrase of mapping.keys) {
        if (speechText.includes(phrase)) {
          triggerSuccessMatch(mapping.view, mapping.label, text);
          return true;
        }
      }
    }

    // Set unrecognized status temporarily
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setStatus('unrecognized');
    setFeedbackMessage(`Command phrase "${text}" was not recognized. Please verify or review the Commands Guide.`);
    feedbackTimeoutRef.current = setTimeout(() => {
      if (isListening) {
        setStatus('listening');
      } else {
        setStatus('idle');
      }
    }, 4500);

    return false;
  };

  const triggerSuccessMatch = (view: string, label: string, spokenText: string) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    
    setStatus('success');
    setFeedbackMessage(`CONFIRMED: Switched to ${label}`);
    onNavigate(view);

    // Generate accurate time string
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Append to command logs (keeping only the last 3 for clinical command log state)
    const newLog: CommandLog = {
      id: Math.random().toString(36).substring(2, 9),
      phrase: spokenText.length > 25 ? spokenText.substring(0, 25) + "..." : spokenText,
      targetLabel: label,
      timestamp: timeStr
    };

    setCommandLogs(prev => [newLog, ...prev].slice(0, 3));
    setShowCommandLog(true);

    // Auto-dismiss the temporary view after 6 seconds to ensure it stays non-cluttering but fully visible
    if (commandLogTimeoutRef.current) clearTimeout(commandLogTimeoutRef.current);
    commandLogTimeoutRef.current = setTimeout(() => {
      setShowCommandLog(false);
    }, 6000);

    // Provide soft voice/audio feedback match
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Opening ${label}`);
      utterance.rate = 1.1;
      utterance.volume = 0.6;
      window.speechSynthesis.speak(utterance);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackMessage('');
      if (isListening) {
        setStatus('listening');
        setTranscript('Listening for commands...');
      } else {
        setStatus('idle');
      }
    }, 4000);
  };

  // Toggle listening/view state
  const handleToggle = () => {
    if (!isSupported) {
      setIsOpen(prev => !prev);
      if (!isOpen) {
        setStatus('error');
        setFeedbackMessage('Speech recognition is unsupported in this browser. Please type commands manually below to navigate.');
      }
      return;
    }

    if (isOpen) {
      // Close the bubble and stop recording
      if (isListening) {
        try {
          recognitionRef.current?.stop();
        } catch (e) {
          console.error(e);
        }
        setIsListening(false);
      }
      setIsOpen(false);
      setFeedbackMessage('');
    } else {
      setIsOpen(true);
      initRecognition();
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
        // Retry initiation in case of edge states
        recognitionRef.current = null;
        initRecognition();
        try {
          recognitionRef.current?.start();
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const phrase = manualInput.trim();
    const matched = processSpeech(phrase);
    if (matched) {
      setManualInput('');
    }
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (commandLogTimeoutRef.current) clearTimeout(commandLogTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const getToggleButtonContent = () => {
    if (!isSupported) {
      return (
        <>
          <MicOff size={18} className="shrink-0 text-slate-400 dark:text-slate-555" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline text-high-visibility whitespace-nowrap shrink-0">
            Console Fallback
          </span>
        </>
      );
    }
    if (isListening) {
      return (
        <>
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <Mic size={18} className="shrink-0 text-rose-500 dark:text-rose-400 relative animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline text-high-visibility whitespace-nowrap shrink-0">
            Voice Listen
          </span>
        </>
      );
    }
    return (
      <>
        <Mic size={18} className="shrink-0 text-slate-500 dark:text-slate-400" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline text-high-visibility whitespace-nowrap shrink-0">
          Voice Control
        </span>
      </>
    );
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Listening Glow */}
      <button
        onClick={handleToggle}
        className={`p-2.5 sm:p-3 rounded-xl transition-all flex items-center gap-2 border shadow-sm shrink-0 w-11 sm:w-auto h-11 sm:h-auto justify-center cursor-pointer relative ${
          isListening
            ? 'bg-rose-100 border-rose-400 text-rose-900 dark:bg-rose-950/80 dark:border-rose-600 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-rose-150'
            : !isSupported
            ? 'bg-slate-50 border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
            : 'bg-slate-100 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755'
        }`}
        aria-label={isListening ? "Mute Clinical Voice Command" : "Activate Clinical Voice Command"}
        title={!isSupported ? "Voice Speech unsupported - Open manual command developer console" : (isListening ? "Voice control active. Click to mute." : "Enable hands-free clinical voice commands")}
        id="voice-command-header-toggle"
        type="button"
      >
        {getToggleButtonContent()}
      </button>

      {/* Subtle Visual Frequency Waveform inside header */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, width: 0, marginRight: 0 }}
            animate={{ opacity: 1, width: '100px', marginRight: '6px' }}
            exit={{ opacity: 0, width: 0, marginRight: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="hidden sm:flex items-center justify-center bg-rose-50/50 dark:bg-rose-955/10 border border-rose-200/40 dark:border-rose-900/40 rounded-xl h-11 px-2.5 overflow-hidden relative shrink-0"
            title="Sensing voice commands..."
          >
            {/* SVG Background Sine Wave */}
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center opacity-60">
              <svg className="w-full h-8" viewBox="0 0 100 32" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.05" />
                    <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M 0,16 Q 25,6 50,16 T 100,16"
                  fill="none"
                  stroke="url(#waveGrad)"
                  strokeWidth="1.5"
                  animate={{
                    d: [
                      "M 0,16 Q 25,6 50,16 T 100,16",
                      "M 0,16 Q 25,26 50,16 T 100,16",
                      "M 0,16 Q 25,6 50,16 T 100,16"
                    ]
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.path
                  d="M 0,16 Q 25,22 50,16 T 100,16"
                  fill="none"
                  stroke="url(#waveGrad)"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                  animate={{
                    d: [
                      "M 0,16 Q 25,22 50,16 T 100,16",
                      "M 0,16 Q 25,10 50,16 T 100,16",
                      "M 0,16 Q 25,22 50,16 T 100,16"
                    ]
                  }}
                  transition={{
                    duration: 1.0,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </svg>
            </div>
            
            {/* Frequency Decibel Overlay bars */}
            <div className="flex items-center gap-[3px] z-10 w-full justify-center">
              {[...Array(6)].map((_, i) => {
                const heights = [
                  [6, 18, 10, 24, 8, 4],
                  [8, 12, 22, 14, 18, 6],
                  [14, 6, 12, 20, 8, 14],
                  [4, 22, 8, 18, 12, 6],
                  [10, 16, 6, 24, 14, 8],
                  [6, 12, 18, 10, 20, 4]
                ][i];
                return (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-rose-500/90 dark:bg-rose-400"
                    animate={{
                      height: heights
                    }}
                    transition={{
                      duration: 0.9 + (i * 0.08),
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Help Button */}
      <button
        onClick={() => setShowCheatSheet(!showCheatSheet)}
        className="p-1 text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer shrink-0"
        title="Voice Assistance Speech Command Cheat Sheet"
        type="button"
      >
        <HelpIcon size={14} />
      </button>

      {/* Command History Toggle Button */}
      {commandLogs.length > 0 && (
        <button
          onClick={() => setShowCommandLog(!showCommandLog)}
          className={`p-1 transition-all cursor-pointer shrink-0 relative ${
            showCommandLog
              ? 'text-rose-500 dark:text-rose-400 scale-110'
              : 'text-slate-400 dark:text-slate-555 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
          title="Toggle Recent Voice Commands Log"
          type="button"
        >
          <History size={14} />
          {/* small dot to show history count or recent activation activity */}
          <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
          </span>
        </button>
      )}

      {/* Temporary Command Log Floating Card */}
      <AnimatePresence>
        {showCommandLog && commandLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="absolute top-14 right-0 z-[150] w-[320px] bg-white dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 p-4 shadow-xl text-left font-sans space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                <History size={12} className="animate-pulse text-rose-500" />
                Speech Pilot History
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[8px] bg-rose-50 dark:bg-rose-955 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Success log
                </span>
                <button
                  type="button"
                  onClick={() => setShowCommandLog(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {commandLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl flex flex-col gap-1 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] bg-rose-50 dark:bg-rose-955/40 text-rose-700 dark:text-rose-450 px-2 py-0.5 rounded font-black max-w-[150px] truncate leading-tight border border-rose-100/20 dark:border-rose-900/10">
                      "{log.phrase}"
                    </span>
                    <span className="text-[8.5px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                      <Clock size={10} className="shrink-0" />
                      {log.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircle size={11} className="text-emerald-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-200 text-[10.5px] font-bold leading-tight">
                      Opened {log.targetLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[8.5px] text-slate-400 dark:text-slate-550 text-center font-bold uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-855">
              Command execution state synced
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating listening indicator bubble */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 z-[150] w-[310px] bg-white dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 p-4 shadow-xl text-left font-sans text-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                {isListening ? (
                  <>
                    <Volume2 size={12} className="animate-bounce" />
                    Hands-Free Pilot Node
                  </>
                ) : (
                  <>
                    <Keyboard size={12} className="text-slate-500" />
                    Pilot Console Input
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={handleToggle}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Minimize Speech Console"
              >
                <X size={14} />
              </button>
            </div>

            {/* Simulated Live Audio Stream Bars */}
            <div className="flex items-end gap-1 px-1 h-3 justify-center">
              {[...Array(12)].map((_, i) => {
                const heightVal = [10, 4, 12, 6, 8, 11, 4, 9, 3, 7, 10, 5][i];
                return (
                  <div
                    key={i}
                    style={{
                      height: isListening ? `${heightVal * 1.2}px` : '3px',
                      transition: `height 0.15s ease-in-out ${i * 0.05}s`
                    }}
                    className={`w-1 rounded-full ${
                      status === 'success' 
                        ? 'bg-emerald-500' 
                        : status === 'error'
                        ? 'bg-rose-300 dark:bg-rose-900/50 animate-pulse'
                        : isListening 
                        ? 'bg-rose-500/80 animate-pulse' 
                        : 'bg-slate-300 dark:bg-slate-705'
                    }`}
                  />
                );
              })}
            </div>

            {isSupported && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-850 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Speech Log</div>
                <p className="font-mono text-xs text-slate-750 dark:text-slate-150 italic leading-snug break-words">
                  {isListening ? `"${transcript}"` : `"Microphone standby / paused."`}
                </p>
              </div>
            )}

            {feedbackMessage && (
              <div className={`p-2.5 rounded-xl border flex items-start gap-2 text-[10.5px] font-bold ${
                status === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300' 
                  : status === 'unrecognized'
                  ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300'
                  : 'bg-rose-50 border-rose-250 text-rose-850 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-350'
              }`}>
                {status === 'success' ? (
                  <CheckCircle size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : status === 'error' ? (
                  <WifiOff size={14} className="shrink-0 text-rose-500 dark:text-rose-450 mt-0.5" />
                ) : (
                  <AlertTriangle size={14} className="shrink-0 text-amber-500 dark:text-amber-450 mt-0.5" />
                )}
                <span className="leading-tight">{feedbackMessage}</span>
              </div>
            )}

            {/* Fallback Manual command form */}
            <form onSubmit={handleManualSubmit} className="space-y-1.5 border-t border-slate-150 dark:border-slate-850 pt-3">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider flex items-center justify-between">
                <span>Manual Command Console</span>
                {!isSupported && (
                  <span className="text-[8.5px] text-amber-500 normal-case font-bold bg-amber-50 dark:bg-amber-955/20 px-1 py-0.5 rounded">
                    ⚠️ Voice Unsupported
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Type navigation (e.g., 'go home')..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  id="clinical-voice-manual-input"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors whitespace-nowrap active:scale-95"
                >
                  Execute
                </button>
              </div>
            </form>

            <div className="text-[9px] text-slate-450 dark:text-slate-500 flex items-center gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-855">
              <Sparkles size={10} className="text-teal-500 shrink-0" />
              <span>Say or type "go home", "open monitor", "open records"...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cheat Sheet Help Modal/Popover */}
      <AnimatePresence>
        {showCheatSheet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 z-[150] w-[330px] bg-white dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-xl text-left font-sans space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-500" />
                <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  Speech Commands Guide
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCheatSheet(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Close Guide"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wide">
              Click the Mic toggle on the left, speak any of these triggers anywhere on the platform:
            </p>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {VOICE_COMMANDS_HELP.map((cmd, i) => (
                <div
                  key={i}
                  className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-850 text-[10px] flex flex-col gap-0.5"
                >
                  <div className="flex items-start gap-1 justify-between">
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                      "{cmd.phrase}"
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[7.5px] font-bold uppercase">
                      {cmd.targetView}
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-450 text-[9px] leading-tight">
                    {cmd.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[9.5px] text-teal-600 dark:text-teal-400 italic text-center font-bold border-t border-slate-100 dark:border-slate-850 pt-2 flex items-center justify-center gap-1">
              <Navigation size={10} className="shrink-0" />
              Hands-free clinical navigation enabled!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
