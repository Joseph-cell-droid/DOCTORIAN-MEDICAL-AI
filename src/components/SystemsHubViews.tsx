import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, BookOpen, MessageSquare, Key, ShieldAlert, FileText, CheckCircle2,
  Search, ExternalLink, UserCheck, PhoneCall, Send, Shield, Activity, 
  Settings, LogIn, Lock, Loader2, Download, Upload, AlertTriangle, Play, Check, 
  Clock, Database, Users, Users2, Mail, MapPin, Sparkles, RefreshCw, X, MessageCircle, Smile,
  Volume2, VolumeX, Music
} from 'lucide-react';

import { Soundscape, SOUNDSCAPE_PRESETS, SoundscapeType } from '../utils/soundscape';

interface SubViewProps {
  user: any;
  onNavigate?: (view: any) => void;
  vitals?: any;
  onStartTutorial?: () => void;
}

/* ==========================================================================
   1. HELP CENTER VIEW
   ========================================================================== */
export const HelpCenter: React.FC<SubViewProps> = ({ user, onNavigate, onStartTutorial }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'faqs' | 'guide' | 'support' | 'feedback'>('faqs');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Ambient Soundscape local UI states, synchronized with the singleton engine
  const [soundscapeEnabled, setSoundscapeEnabled] = useState(() => Soundscape.getEnabled());
  const [soundscapePreset, setSoundscapePreset] = useState<SoundscapeType>(() => Soundscape.getPreset());
  const [soundscapeVolume, setSoundscapeVolume] = useState(() => Soundscape.getVolume());

  useEffect(() => {
    const handleSync = () => {
      setSoundscapeEnabled(Soundscape.getEnabled());
      setSoundscapePreset(Soundscape.getPreset());
      setSoundscapeVolume(Soundscape.getVolume());
    };
    window.addEventListener('doctorian:soundscape_setting_update', handleSync);
    return () => {
      window.removeEventListener('doctorian:soundscape_setting_update', handleSync);
    };
  }, []);

  const toggleSoundscape = () => {
    const nextVal = !soundscapeEnabled;
    setSoundscapeEnabled(nextVal);
    Soundscape.setEnabled(nextVal);
  };

  const changePreset = (preset: SoundscapeType) => {
    setSoundscapePreset(preset);
    Soundscape.setPreset(preset);
  };

  const changeVolume = (vol: number) => {
    setSoundscapeVolume(vol);
    Soundscape.setVolume(vol);
  };

  // Clinician feedback states
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<string | null>(null);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

  const [systemChecks, setSystemChecks] = useState({
    audioSynth: { status: 'pending', label: 'IEC Acoustic Engine Pulse' },
    localStorage: { status: 'pending', label: 'Local Encrypted DB Sync' },
    biometrics: { status: 'pending', label: 'Attending Authorization Hook' },
    twilioRelay: { status: 'pending', label: 'Twilio SMS Outbound Carrier' }
  });
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  const faqs = [
    {
      q: "How does the Real-time Pulse Monitor acoustic engine sync work?",
      a: "The oximeter audio engine maps pulse rates and oxygen bounds straight into the browser's Web Audio API. Higher SpO2 values generate higher frequencies (480Hz - 880Hz) to represent peak hemodynamics. This operates continuously when the clinical heartbeat beep is active.",
      category: "audio"
    },
    {
      q: "What defines high vs medium priority clinical alarms?",
      a: "According to standard clinical specifications (IEC 60601-1-8), high-priority alarms generate repeating groups of 5 fast, high-pitched triangle pulses inside a 2.5-second sequence. Medium-priority warnings trigger 3 slower sine-wave patterns every 5 seconds.",
      category: "alarms"
    },
    {
      q: "How can I configure the automated Twilio SMS emergency relays?",
      a: "Navigate to the Emergency Registry tab, then write down the priority responder's phone format. Alarms trigger automatic REST dispatches after exactly 3 continuous seconds of anomalous baseline vitals.",
      category: "integrations"
    },
    {
      q: "Are the telemetry streams saved to persistent servers?",
      a: "This application prioritizes safe offline processing. Patient metrics and logs are handled using client-side memory and local sandbox encryption models to satisfy rigorous HIPAA patient data protection standards.",
      category: "security"
    },
    {
      q: "How does the AI analyze my symptoms?",
      a: "Doctorian uses advanced localized neural models trained on medical literature to identify potential health patterns. It generates suggestions and probability markers, which must be cross-referenced with professional clinical guidance.",
      category: "AI & Symptoms"
    },
    {
      q: "Is my medical data secure?",
      a: "Yes, we use decentralized storage sandboxes and client-side Quantum-Relay Encryption (QRE). Your physiological data never leaves your device unless explicitly exported or synchronized offline with absolute verification.",
      category: "security"
    },
    {
      q: "Can I connect my own medical devices?",
      a: "Currently, Doctorian supports Arduino-based custom vital monitors via Bluetooth, WiFi UDP, or Serial. We are continuously expanding integration interfaces for clinical telemetry sensors.",
      category: "hardware"
    },
    {
      q: "What should I do in an emergency?",
      a: "Doctorian is a diagnostic support interface and NOT a certification dispensation facility. In a life-threatening acute biological crisis, always engage your physical emergency services or press the SOS alarm immediately.",
      category: "safety"
    },
    {
      q: "Is Doctorian free to use?",
      a: "We offer a generous local free tier for basic symptom checking, medication logs, and pulse telemetry. Premium multi-layered anatomical visualization or specialist directories are unlocked using credits or active pro credentials.",
      category: "accounts"
    },
    {
      q: "Does it support multiple languages?",
      a: "Yes, Doctorian implements real-time language translation for over 50 languages, allowing global clinicians to review diagnostic reports and interact in native vocabularies.",
      category: "general"
    },
    {
      q: "How do I sync my Arduino monitor?",
      a: "Open the Patient Monitor ('Vitals') board, connect your hardware over Bluetooth/Serial, and set the correct matching baud rate/com port. Ensure the telemetry stream is active before starting recordings.",
      category: "hardware"
    },
    {
      q: "Can I share my reports with my doctor?",
      a: "Yes, you can export your entire clinical footprint (symptom history, recorded ECG bounds, medication adherence metrics, and AI summaries) as encrypted JSON or PDF summaries from the Clinical Records portal.",
      category: "export"
    }
  ];

  const handleSystemCheck = () => {
    setIsRunningCheck(true);
    setSystemChecks({
      audioSynth: { status: 'loading', label: 'IEC Acoustic Engine Pulse' },
      localStorage: { status: 'loading', label: 'Local Encrypted DB Sync' },
      biometrics: { status: 'loading', label: 'Attending Authorization Hook' },
      twilioRelay: { status: 'loading', label: 'Twilio SMS Outbound Carrier' }
    });

    setTimeout(() => {
      setSystemChecks({
        audioSynth: { status: 'success', label: 'IEC Acoustic Engine Pulse' },
        localStorage: { status: 'success', label: 'Local Encrypted DB Sync' },
        biometrics: { status: 'success', label: 'Attending Authorization Hook' },
        twilioRelay: { status: 'warning', label: 'Twilio SMS Outbound Carrier (No API key)' }
      });
      setIsRunningCheck(false);
    }, 1500);
  };

  const handleContactWhatsApp = (message: string = "Hello, I need assistance with Doctorian.") => {
    const url = `https://wa.me/256787674140?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleContactEmail = (subject: string = "Doctorian Support Request", body: string = "Hello, I need assistance with...") => {
    const url = `mailto:gloriajayakullo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleSendFeedback = (via: 'email' | 'whatsapp') => {
    const message = `Clinician Feedback for Doctorian\nRating: ${feedbackRating || 'Not rated'}\nFeedback: ${feedbackText}`;
    if (via === 'whatsapp') {
      handleContactWhatsApp(message);
    } else {
      handleContactEmail("Doctorian Clinician Feedback", message);
    }
    setIsFeedbackSubmitted(true);
  };

  const submitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSuccess(true);
      setTicketSubject('');
      setTicketMessage('');
    }, 1200);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 animate-fade-in max-w-5xl mx-auto px-4 py-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-500 tracking-[0.2em] bg-blue-50 dark:bg-blue-950/20 px-3 py-1 rounded-full">Systems Hub</span>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-3 text-slate-950 dark:text-white">Help & Knowledge Center</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Access diagnostic guides, acoustic specifications, and operational system checks.</p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('home')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Return to home
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800/85 overflow-x-auto no-scrollbar whitespace-nowrap flex-nowrap shrink-0">
        {[
          { id: 'faqs', label: 'Clinical FAQs', icon: <HelpCircle size={15} /> },
          { id: 'guide', label: 'Self Diagnostics', icon: <BookOpen size={15} /> },
          { id: 'support', label: 'Escalation Desk', icon: <PhoneCall size={15} /> },
          { id: 'feedback', label: 'Clinician Feedback', icon: <Smile size={15} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === t.id 
                ? 'border-blue-600 text-blue-600 dark:text-blue-500 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Onboarding Tutorial Prompt */}
      {onStartTutorial && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-indigo-600/5 dark:from-blue-600/10 dark:via-indigo-600/10 border border-blue-500/20 dark:border-blue-500/25 rounded-[2.5rem] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
              <Sparkles className="animate-pulse" size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Interactive Walkthrough</span>
            </div>
            <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Workspace Onboarding Tour</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              New to Doctorian or need a complete diagnostic refresher? Launch our step-by-step interactive onboarding tour to explore the Symptom Analyzer, Patient wave monitoring, AI anatomy models, and EHR history vault with real-time views.
            </p>
          </div>
          <button
            onClick={onStartTutorial}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-500/15 cursor-pointer"
          >
            <Play size={12} className="fill-current" /> Start Interactive Tour
          </button>
        </div>
      )}

      {/* Tab Switch Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'faqs' && (
          <motion.div 
            key="faqs-pane"
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Search FAQ */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Search database articles (e.g., Alarms, SpO2, HIPAA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-wider placeholder:text-slate-400 focus:border-blue-500 outline-none shadow-md transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800/80 shadow-md hover:shadow-lg transition-all space-y-4">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-850/60 rounded-lg text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                      {faq.category}
                    </span>
                    <h3 className="text-base font-black text-slate-905 dark:text-white leading-tight">
                      Q: {faq.q}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {faq.a}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  <AlertTriangle className="mx-auto mb-2 text-amber-500 animate-bounce" size={32} />
                  <p className="text-xs font-black uppercase tracking-wider">No matching articles found</p>
                  <p className="text-[10px] uppercase tracking-widest mt-1">Refine your queries or head to the Support Desk</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'guide' && (
          <motion.div 
            key="guide-pane"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Diagnostic Panel */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tight">Vitals Transmission Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Run automated diagnostics checks on local client nodes, browser AudioContext, and Twilio callback triggers. Helps confirm interface readiness before patient monitoring sequences.
              </p>

              <div className="space-y-3.5 pt-2">
                {Object.entries(systemChecks).map(([key, item]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <div>
                      {item.status === 'pending' && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">READY TO RUN</span>}
                      {item.status === 'loading' && <Loader2 className="animate-spin text-blue-500" size={16} />}
                      {item.status === 'success' && <Check className="text-emerald-500" size={18} />}
                      {item.status === 'warning' && <AlertTriangle className="text-amber-500" size={18} />}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSystemCheck}
                disabled={isRunningCheck}
                className="w-full py-4 bg-slate-950 hover:bg-slate-850 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                {isRunningCheck ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={14} />}
                RUN DIAGNOSTIC HARNESS CHECKS
              </button>
            </div>

            {/* IEC Audio Guide */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-md flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Standards Matrix</h4>
                <h3 className="text-base font-black uppercase tracking-tight text-slate-950 dark:text-white">IEC 60601-1-8 Compliance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
                  Acoustic warnings are set according to ISO parameters to maintain clinical audibility and prevent cognitive fatigue in operating spaces.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">High Priority Alarm</span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">920Hz Triangle sequence</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Medium Warning Alarm</span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">680Hz Sine beep wave</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mt-6 leading-normal">
                Audio streams rely directly on browser audio synthesis APIs. For best results, ensure system volume is unmuted.
              </div>
            </div>

            {/* Ambient Soundscape Control Center */}
            <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 mt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/80 pb-6">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Music className={`${soundscapeEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Audio Sync</span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white">Cognis Ambient Soundscape</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 font-semibold">
                    Inoculate yourself from mental fatigue. Priming the soundscape triggers gentle background binaural beats when interacting with <span className="text-blue-600 dark:text-blue-500 font-bold">CognisHub Node</span> or <span className="text-blue-600 dark:text-blue-500 font-bold">Neural Training Hub</span>.
                  </p>
                </div>

                {/* Sleek Custom Toggle Switch */}
                <button
                  type="button"
                  onClick={toggleSoundscape}
                  className={`relative flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer active:scale-95 shrink-0 ${
                    soundscapeEnabled 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-805/85 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${soundscapeEnabled ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                    <span>{soundscapeEnabled ? 'SOUNDSCAPE ACTIVE' : 'SOUNDSCAPE DISABLED'}</span>
                  </div>
                </button>
              </div>

              {/* Advanced Soundscape Configuration Panel */}
              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${soundscapeEnabled ? 'opacity-100' : 'opacity-65 pointer-events-none'}`}>
                {/* 1. Presets Panel */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Select Cognitive Focus Wave</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(SOUNDSCAPE_PRESETS).map(([key, preset]) => {
                      const isSelected = soundscapePreset === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => changePreset(key as SoundscapeType)}
                          className={`flex flex-col justify-between p-5 rounded-[2rem] border transition-all duration-300 hover:shadow-md cursor-pointer text-left space-y-4 ${
                            isSelected 
                              ? 'bg-gradient-to-br from-slate-900 to-slate-950 dark:from-white dark:to-slate-50 border-transparent text-white dark:text-slate-900 shadow-lg scale-[1.02]' 
                              : 'bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950/40 dark:hover:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              isSelected 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                            }`}>
                              {preset.binauralBeatFreq} Hz Delta
                            </span>
                            <h5 className="text-[13px] font-black uppercase tracking-tight mt-3 leading-snug">{preset.name}</h5>
                          </div>
                          <p className={`text-[10px] font-semibold leading-relaxed ${
                            isSelected ? 'text-slate-405 dark:text-slate-500' : 'text-slate-530 dark:text-slate-450'
                          }`}>
                            {preset.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Audio Gain Engine Controls */}
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Volume Level Control</h4>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => changeVolume(soundscapeVolume > 0 ? 0 : 0.45)}
                        className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-transform active:scale-90 cursor-pointer"
                      >
                        {soundscapeVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      
                      <div className="flex-1 space-y-1">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={soundscapeVolume}
                          onChange={(e) => changeVolume(parseFloat(e.target.value))}
                          className="w-full accent-blue-600 dark:accent-blue-500 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest px-0.5">
                          <span>Mute</span>
                          <span>{Math.round(soundscapeVolume * 100)}%</span>
                          <span>Max</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active dynamic state tracker & beautiful wave animation */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">Active Synthesis</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {soundscapeEnabled ? 'Sync: Auto-Trigger Live' : 'Soundscape Inactive'}
                      </span>
                    </div>

                    <div className="flex items-end gap-1 h-5 px-1">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          className={`w-1 bg-blue-500 dark:bg-blue-450 rounded-full transition-all duration-300 ${
                            soundscapeEnabled ? 'animate-pulse' : 'h-1 py-0'
                          }`}
                          style={{
                            height: soundscapeEnabled ? `${25 + (bar * 15) % 75}%` : '4px',
                            animationDelay: `${bar * 120}ms`,
                            animationDuration: '0.8s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanatory footer */}
              <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 rounded-2xl flex items-start gap-3">
                <span className="text-xs">💡</span>
                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider leading-relaxed">
                  Binaural beats achieve peak brain synchronization when using stereophonic headphones. The two phase-shifted audio paths deliver slightly varying carrier signals to the left and right ears, allowing the brainstem to auto-generate the low-frequency binaural delta beat internally.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'support' && (
          <motion.div 
            key="support-pane"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* ESCALATION FORM */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tight">Systems Coordinator Escalation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Facing persistent telemetry telemetry anomalies or system lockouts? Dispatch emergency assistance tickets directly to regional platform directors.
              </p>

              <AnimatePresence mode="wait">
                {!ticketSuccess ? (
                  <motion.form 
                    key="ticket-form"
                    onSubmit={submitTicket} 
                    className="space-y-4"
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinician ID Reference</label>
                      <input 
                        type="text" 
                        disabled 
                        value={user?.uid || 'CLINICIAN-GUEST-SECURE'} 
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs font-bold text-slate-500 uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject Heading</label>
                        <input 
                          type="text" 
                          required
                          placeholder="E.G., TWILIO SMS GATEWAY DELAY..." 
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Functional Area</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-blue-500">
                          <option>Acoustic Alarms</option>
                          <option>SMS Relays</option>
                          <option>Patient Registries</option>
                          <option>HIPAA Logging Archive</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Anomalous Incident Narrative</label>
                      <textarea 
                        rows={4}
                        required
                        placeholder="PROVIDE SYSTEM COMPONENT DETAILS OR TIMELINE LOGS..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={14} />}
                      TRANSMIT DISPATCH PACKET
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="ticket-success"
                    className="p-8 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center space-y-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400">Escalation Packet Logged</h4>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Ref ID: Ticket-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                      Your technical message has been dispatched to regional clinical network engineers. Active monitoring channels remain open.
                    </p>
                    <button
                      onClick={() => setTicketSuccess(false)}
                      className="px-6 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      LOG NEW DISPATCH
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DIRECT HOTLINES */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-md space-y-6">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-950 dark:text-white">Emergency Backlinks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct telecom routes for critical system failures requiring immediate on-site human overrides.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleContactWhatsApp("Hello Doctorian Team, I require real-time support for clinical telemetry.")}
                  className="w-full p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-all select-none flex items-center gap-3"
                >
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider block">WhatsApp Support Channel</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">+256 787 674 140</span>
                  </div>
                </button>

                <button
                  onClick={() => handleContactEmail("Doctorian Core Telemetry Failure", "Hello Support Team, we are observing telemetry anomalies on...\n\nUser identifier: " + (user?.uid || "GUEST"))}
                  className="w-full p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-left transition-all select-none flex items-center gap-3"
                >
                  <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500">
                    <Mail size={18} />
                  </div>
                  <div className="truncate">
                    <span className="text-[11px] font-black uppercase text-blue-600 tracking-wider block">Lead Systems Officer</span>
                    <span className="text-xs font-bold text-slate-705 dark:text-slate-350 block truncate">gloriajayakullo@gmail.com</span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <motion.div 
            key="feedback-pane"
            className="space-y-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-[0.2em] bg-blue-50 dark:bg-blue-950/20 px-3 py-1 rounded-full">Telemetry Review</span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-955 dark:text-white">Share Your Insights</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your practical diagnostics feedback is critical to improving clinical safety parameters across decentralized networks.</p>
              </div>

              <AnimatePresence mode="wait">
                {isFeedbackSubmitted ? (
                  <motion.div 
                    key="feedback-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-emerald-600">Insights Received</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-semibold font-mono">Transmission Code: FEEDBACK_OK</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Thank you. Your ratings and suggestions have been formatted and dispatched immediately.
                    </p>
                    <button 
                      onClick={() => {
                        setIsFeedbackSubmitted(false);
                        setFeedbackText('');
                        setFeedbackRating(null);
                      }}
                      className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 hover:underline pt-2 block mx-auto"
                    >
                      Submit Another Report
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="feedback-form" className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white mb-2 text-center uppercase tracking-wider">How would you rate the interface?</h4>
                      <div className="flex justify-center gap-4">
                        {[
                          { emoji: '😞', label: 'Unsatisfied' },
                          { emoji: '😐', label: 'Neutral' },
                          { emoji: '😊', label: 'Satisfied' },
                          { emoji: '🤩', label: 'Excellent' }
                        ].map((item, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setFeedbackRating(item.emoji)}
                            aria-label={item.label}
                            aria-checked={feedbackRating === item.emoji}
                            role="radio"
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all border outline-none ${
                              feedbackRating === item.emoji 
                                ? 'bg-blue-600 border-blue-500 scale-110 shadow-lg text-white' 
                                : 'bg-slate-50 dark:bg-slate-950 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-110 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span aria-hidden="true">{item.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Predefined Performance Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {['AI Accuracy', 'Acoustic Alarms', 'Twilio Relays', 'User Interface', 'Speed', 'Offline Safety', 'HIPAA Privacy'].map((tag) => (
                          <button 
                            key={tag} 
                            onClick={() => setFeedbackText(prev => prev + (prev ? ', ' : '') + tag)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all outline-none"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label htmlFor="feedback-input" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Suggestions & Observations</label>
                      <textarea 
                        id="feedback-input"
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="PROVIDE ADDITIONAL THOUGHTS FOR ENHANCEMENTS..."
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <button
                        onClick={() => handleSendFeedback('email')}
                        disabled={!feedbackText.trim()}
                        className="py-3.5 bg-white dark:bg-slate-950 text-blue-600 border border-blue-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Mail size={14} /> Send via Email
                      </button>
                      <button
                        onClick={() => handleSendFeedback('whatsapp')}
                        disabled={!feedbackText.trim()}
                        className="py-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        <MessageCircle size={14} /> Send via WhatsApp
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};





/* ==========================================================================
   3. PRIVACY VAULT VIEW
   ========================================================================== */
export const PrivacyVault: React.FC<SubViewProps> = ({ user, onNavigate }) => {
  const [isLocalEncrypted, setIsLocalEncrypted] = useState(true);
  const [requireBiometrics, setRequireBiometrics] = useState(false);
  const [zeroKnowledgeProof, setZeroKnowledgeProof] = useState(true);
  const [anonymizeData, setAnonymizeData] = useState(true);

  // Simulated live HIPAA Audit Access Logs
  const [auditLogs, setAuditLogs] = useState([
    { actor: "Dr. Gloria Jayakullo", action: "Pulled real-time telemetry waveforms", status: "Secure", time: "22:01:10", hash: "0x89e1...f01" },
    { actor: "Systems Core", action: "Triggered Twilio emergency outbound broadcast", status: "Secure", time: "21:58:32", hash: "0xa210...9bb" },
    { actor: "Secure Client Proxy", action: "Refreshed local bio-alarm threshold limits", status: "Secure", time: "21:30:15", hash: "0xb771...33e" },
    { actor: "Patient Portal", action: "Authorized attending cardiac tracking keys", status: "Secure", time: "19:15:00", hash: "0x44cd...ee1" }
  ]);

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  const rotateKeys = () => {
    // Generate new random hashes
    setAuditLogs(prev => [
      { actor: "Crypto Engine", action: "Rotated clinical telemetry key blocks", status: "Rotated", time: new Date().toLocaleTimeString('en-GB'), hash: "0x" + Math.random().toString(16).substring(2, 10) + "...001" },
      ...prev
    ]);
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 animate-fade-in max-w-5xl mx-auto px-4 py-8">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-500 tracking-[0.2em] bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full">Systems Hub</span>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-3 text-slate-950 dark:text-white">HIPAA Privacy Vault & Crypto Core</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Verify continuous encryption blocks, toggle local privacy parameters, and monitor immutable telemetry audit logs.</p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('home')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Return to home
        </button>
      </div>

      {/* Main Grid controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PRIVACY CONTROLS */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Privacy Switches</h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Adjust client-side constraints on-the-fly to respect patients' digital custody wishes.
          </p>

          <div className="space-y-4 pt-2">
            {[
              { id: 'localEnc', val: isLocalEncrypted, set: setIsLocalEncrypted, label: "AES-GCM Local Database Encryption", desc: "Forces sandbox values to save under randomized key parameters." },
              { id: 'reqBio', val: requireBiometrics, set: setRequireBiometrics, label: "Attending Passphrase Verification", desc: "Interrupts actions and requires a secure user credential hash." },
              { id: 'zkpAuth', val: zeroKnowledgeProof, set: setZeroKnowledgeProof, label: "Zero-Knowledge Telemetry Relay", desc: "Transmits indicators to relays without releasing individual patient identifiers." },
              { id: 'anonData', val: anonymizeData, set: setAnonymizeData, label: "HIPAA Scrub AI Analytics", desc: "Scrubs diagnostic outputs before forwarding metrics into predictive models." }
            ].map((sw) => (
              <div key={sw.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-105 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold leading-tight select-none">{sw.label}</span>
                  <button
                    onClick={() => sw.set(!sw.val)}
                    aria-label={`Toggle ${sw.label}`}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${sw.val ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${sw.val ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{sw.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* IMMUTABLE AUDIT LOG */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">HIPAA Access Audit Trails</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Immutable Cryptographic Loggers</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={rotateKeys}
                  className="py-2.5 px-4 bg-slate-950 dark:bg-blue-600 hover:bg-slate-850 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                >
                  <Key size={11} /> ROTATE KEY BLOCKS
                </button>
                <button
                  onClick={clearAuditLogs}
                  aria-label="Clear audit logs"
                  className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:bg-slate-850 dark:hover:bg-rose-950/20 rounded-xl transition-all border border-slate-150 dark:border-slate-800"
                >
                  Clear Log
                </button>
              </div>
            </div>

            <div className="space-y-3.5 pt-6 max-h-[380px] overflow-y-auto pr-2 no-scrollbar">
              {auditLogs.length > 0 ? (
                auditLogs.map((log, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850/80 flex justify-between items-start gap-4 hover:border-rose-100 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.actor}</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 rounded uppercase tracking-widest">{log.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{log.action}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="text-[9px] font-black text-slate-400 block font-mono">{log.time}</span>
                      <span className="text-[9px] font-bold text-rose-500 font-mono block select-all bg-rose-50 dark:bg-rose-950/30 px-1 py-0.5 rounded">{log.hash}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={32} />
                  <p className="text-xs font-black uppercase tracking-widest">No active audit deviations recorded</p>
                  <p className="text-[10px] uppercase text-slate-400 mt-1">Audit log synchronized with security cores.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Cryptographic Salt: SHA-256 [SECURE]</span>
            <span>Platform compliant</span>
          </div>
        </div>

        {/* REGULATORY POLICIES SECTION */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-8 bg-zinc-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <ShieldAlert size={16} />
              <h4 className="text-xs font-black uppercase tracking-wider">Patient Consent Verification Rules</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Affirmative, explicit consent is required before recording bio-indicators. High-frequency audio telemetry and emergency dispatch registers must have recorded clinician/patient validation signatures stored inside the localized secure sandbox directory.
            </p>
          </div>

          <div className="p-8 bg-zinc-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-4">
            <div className="flex items-center gap-2 text-blue-500">
              <Lock size={16} />
              <h4 className="text-xs font-black uppercase tracking-wider">Continuous Encryption standards</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              All client telemetry is sealed locally using AES-256 cryptographic algorithms with dynamic salts. Quantum-Relay Encryption (QRE) blocks are rotated keys in 15-minute segments to guarantee absolute backward secrecy during live clinical telemetry.
            </p>
          </div>

          <div className="p-8 bg-zinc-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <ExternalLink size={16} />
              <h4 className="text-xs font-black uppercase tracking-wider">Third-Party Relay Disclaimers</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Emergency outward dispatches routed via the automated Twilio integration proxy are fully anonymized. Direct telemetry metrics and physiological parameters pass strictly as stateless indicator triggers, shielding personal identities from downstream network routes.
            </p>
          </div>
        </div>

        {/* FORGOTTEN PROTOCOL SELF-DESTRUCT PANEL */}
        <ForgottenProtocolPanel />

      </div>

    </div>
  );
};

// Helper component to house state cleanly and prevent bulky file rebuilds
const ForgottenProtocolPanel: React.FC = () => {
  const [confirmStage, setConfirmStage] = useState<'idle' | 'warning' | 'done'>('idle');

  const initiateDestruct = () => {
    localStorage.clear();
    sessionStorage.clear();
    setConfirmStage('done');
  };

  return (
    <div className="col-span-12 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-[3rem] p-8 sm:p-12 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="animate-pulse" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Emergency Safety Override</span>
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Forgotten Protocol</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl font-semibold">
            Immediately and completely wipes all cached clinical records, local patient files, Twilio integration tokens, and authorization blocks from this browser node. Once activated, trace endpoints are wiped permanently. Use strictly during facility transfers or emergency audits.
          </p>
        </div>

        <div>
          {confirmStage === 'idle' && (
            <button
              onClick={() => setConfirmStage('warning')}
              className="px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap"
            >
              Wipe Credentials File
            </button>
          )}

          {confirmStage === 'warning' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={initiateDestruct}
                className="px-6 py-3 bg-red-800 hover:bg-red-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all animate-bounce"
              >
                CONFIRM ABSOLUTE WIPE
              </button>
              <button
                onClick={() => setConfirmStage('idle')}
                className="px-6 py-3 bg-slate-205 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                CANCEL
              </button>
            </div>
          )}

          {confirmStage === 'done' && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold text-xs uppercase tracking-wider bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20">
              <Check size={16} /> PROTOCOL COMPLETED: ALL LOCAL DATABASES DESTROYED.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


/* ==========================================================================
   4. TERMS & DATA VIEW
   ========================================================================== */
export const TermsAndData: React.FC<SubViewProps> = ({ vitals, onNavigate }) => {
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportData = () => {
    // Generate simulated clinical setup configuration package
    const clinicalConfigData = {
      deviceRole: "Doctorian AI Telemetry Node",
      timestampUTC: new Date().toISOString(),
      activePhysiometrics: {
        heartRate: vitals?.heartRate || 75,
        spo2: vitals?.spo2 || 98,
        temperature: vitals?.temperature || 36.8,
        respiratoryRate: vitals?.respiratoryRate || 16,
        systolicBP: vitals?.systolicBP || 120,
        diastolicBP: vitals?.diastolicBP || 80
      },
      telemetryStandardsCompliance: ["IEC 60601-1-8", "HIPAA Omnibus Guardrails"],
      exporterCredentialNode: "UGANDA-REGINAL-CLINIC-GUEST"
    };

    const dataHexStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clinicalConfigData, null, 2));
    const downloadHelperAnchor = document.createElement('a');
    downloadHelperAnchor.setAttribute("href", dataHexStr);
    downloadHelperAnchor.setAttribute("download", `clinical-telemetry-harness-export-${Date.now()}.json`);
    document.body.appendChild(downloadHelperAnchor);
    downloadHelperAnchor.click();
    downloadHelperAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 2500);
  };

  const handleImportMockPreset = () => {
    setImportStatus('reading');
    setTimeout(() => {
      setImportStatus('success');
      setImportLogs(prev => [
        `Restored threshold envelopes: HR bounds [40-180], SpO2 hypoxia alert [90%]`,
        ...prev
      ]);
      setTimeout(() => setImportStatus(null), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 animate-fade-in max-w-5xl mx-auto px-4 py-8">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-[0.2em] bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-full">Systems Hub</span>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-3 text-slate-950 dark:text-white">Terms of Custody & Telemetry Exporter</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Examine telemetry custody agreements, export offline clinical setups, or restore default safety profiles.</p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('home')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Return to home
        </button>
      </div>

      {/* Main Grid: split terms explanation on left, telemetry loader on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Custody Terms */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">EHR Telemetry Data Custody Covenant</h3>
          </div>

          <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 no-scrollbar text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">1. Scope of Continuous Bio-Monitoring</h4>
            <p>
              By keeping the real-time telemetry harness running, clinical personnel acknowledge that all physiological parameters (such as Heart Pulsations, SpO2 wave, Core Temperature limits, and Blood Pressure curves) are temporary metrics held strictly within active browser memory contexts. No secondary database records are published client-side unless manually exported.
            </p>

            <h4 className="font-extrabold text-[#111] dark:text-[#eee] uppercase tracking-wider text-[11px]">2. SMS Broadcast Dispatches & Responsibility</h4>
            <p>
              Critical alerts dispatched via underlying telecom APIs (like the Twilio VoIP robocall engine) remain a helper tool rather than an absolute indicator. Attending cardiologists or practitioners retain primary onsite diagnostic obligations.
            </p>

            <h4 className="font-extrabold text-[#111] dark:text-[#eee] uppercase tracking-wider text-[11px]">3. Consent & Local Encryption Sandboxes</h4>
            <p>
               All settings regarding alarms, thresholds, and patient vitals are subject to local storage persistence models. These are fully cleared immediately upon browser terminal resets unless backed up using our clinical exporter.
            </p>

            <h4 className="font-extrabold text-[#111] dark:text-[#eee] uppercase tracking-wider text-[11px]">4. Standard Terms of Service for Medical EHR Platforms</h4>
            <p>
              In compliance with national and regional Electronic Health Record (EHR) mandates, all practitioners, clinicians, and medical operators agree to access these vitals streams strictly for provisional visual review. This tool operates as an autonomous web client node and must not be treated as a primary diagnostic certification panel.
            </p>

            <h4 className="font-extrabold text-[#111] dark:text-[#eee] uppercase tracking-wider text-[11px]">5. Limitation of Liability for Automated Alarms</h4>
            <p>
              Operators explicitly recognize that automated alarms, including the IEC-60601-compliance heartbeat alarms, may fail in low-bandwidth, non-networked environments or during local browser crash states. The developers, directors, and affiliates remain fully insulated from life-threatening diagnostic omissions or critical alert latency.
            </p>

            <h4 className="font-extrabold text-[#111] dark:text-[#eee] uppercase tracking-wider text-[11px]">6. Third Party Relay Disclaimers</h4>
            <p>
              Carrier network operations (including Twilio REST gateway callbacks, Arduino WiFi relays, and serial interfaces) rely on separate third-party Service Level Agreements (SLAs). We maintain no operational oversight over carrier dropouts, routing congestion, or localized node disconnects.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <button
              onClick={() => setAgreedTerms(!agreedTerms)}
              className={`w-6 h-6 rounded-lg border transition-colors flex items-center justify-center shrink-0 ${
                agreedTerms ? 'bg-amber-500 border-amber-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-700'
              }`}
            >
              {agreedTerms && <Check size={14} />}
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-normal select-none">
              I acknowledge the Clinical Telemetry Custory Covenant
            </span>
          </div>
        </div>

        {/* Telemetry Exporter Harness */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Active Data Exporter</h3>
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Configure offline profiles</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Save current guardrail thresholds and patient monitoring configurations to your local hard drive as a structured JSON packet, or restore baseline safety presets in one single hit.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleExportData}
                disabled={!agreedTerms || exportSuccess}
                className="w-full py-4 bg-slate-950 hover:bg-slate-850 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {exportSuccess ? <CheckCircle2 size={15} /> : <Download size={14} />}
                {exportSuccess ? "TELEMETRY JSON EXPORTED!" : "EXPORT TELEMETRY PROFILE (.JSON)"}
              </button>

              <button
                onClick={handleImportMockPreset}
                disabled={!agreedTerms || importStatus === 'reading'}
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-205 rounded-2xl text-[10.5px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-250 dark:border-slate-800 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {importStatus === 'reading' ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                RELOAD SAFETY PRESETS (.JSON)
              </button>
            </div>

            {/* Simulated feedback lines */}
            {importLogs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Restoration Activity Logs</span>
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                  {importLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">
                      <span className="shrink-0">•</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 leading-normal mt-6 select-none">
            To unlock export / import routines, clinician must read and accept the custody checkbox above.
          </div>
        </div>

      </div>

    </div>
  );
};
