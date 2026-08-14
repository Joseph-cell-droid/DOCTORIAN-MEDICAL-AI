import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, X, Mic, Eye, EyeOff, Sun, Moon, Clock, Activity, Bell, 
  Headphones, VolumeX, Music, Home, Bot, Dna, Palette, Brain, Cpu, 
  Stethoscope, Monitor, TrendingUp, Zap, Pill, Info, Shield, FileText, 
  Search, AlertTriangle, Dumbbell, Code, CreditCard, Sparkles, FolderHeart,
  Sliders, ArrowRight, UserCheck, Radio, Volume2, Volume1, Play, CheckCircle2
} from 'lucide-react';
import { VoiceCommandToggle } from './VoiceCommandToggle';

interface WindowsSystemsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  isOffline: boolean;
  isEyeCareMode: boolean;
  setIsEyeCareMode: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  setIsThemeSchedulerOpen: (val: boolean) => void;
  vibrateCriticalAlert: () => void;
  addToast: (msg: string, type?: "info" | "success" | "error") => void;
  handleOpenAdminInfo: () => void;
  hasNotification: boolean;
  isAudioMenuOpen: boolean;
  setIsAudioMenuOpen: (val: boolean) => void;
  vitalsAudioEnabled: boolean;
  toggleVitalsAudio: () => void;
  vitalsAudioVolume: number;
  handleVitalsVolumeChange: (val: number) => void;
  soundscapeEnabled: boolean;
  toggleSoundscapeGlobal: () => void;
  soundscapeVolume: number;
  handleSoundscapeVolChangeGlobal: (val: number) => void;
  soundscapePreset: string;
  changePresetGlobal: (preset: any) => void;
}

export interface HubPageItem {
  id: string;
  title: string;
  category: 'Clinical & Care' | 'AI & Analytics' | 'Records & Labs' | 'System & Security';
  description: string;
  audioPrompt: string; // Plain-language speech for illiterates / non-readers
  icon: React.ReactNode;
  color: string;
  badge?: string;
  pictogramEmoji: string;
}

export const ALL_HUB_PAGES: HubPageItem[] = [
  { 
    id: 'home', 
    title: "Home & Clinical Dashboard", 
    category: "Clinical & Care", 
    description: "Main overview of patient health & key telemetry metrics", 
    audioPrompt: "Home page. View your overall body vitals, patient summary, and main health status.",
    icon: <Home size={22} />, 
    color: "text-blue-600 bg-blue-500/15 border-blue-500/30",
    pictogramEmoji: "🏠",
    badge: "Dashboard"
  },
  { 
    id: 'ai_nexus', 
    title: "AI Doctor & Medical Chat", 
    category: "AI & Analytics", 
    description: "Multi-modal AI assistant for clinical reasoning and health questions", 
    audioPrompt: "AI Doctor Chat. Speak or type your medical symptoms to get instant clinical guidance.",
    icon: <Bot size={22} />, 
    color: "text-purple-600 bg-purple-500/15 border-purple-500/30",
    pictogramEmoji: "🤖",
    badge: "AI Doctor"
  },
  { 
    id: 'diagnostic_lab', 
    title: "Diagnostic Lab & Blood Tests", 
    category: "Records & Labs", 
    description: "Pathology results, blood panels, and lab analyses", 
    audioPrompt: "Blood Tests and Laboratory. View blood sample results, lab reports, and medical tests.",
    icon: <Stethoscope size={22} />, 
    color: "text-emerald-600 bg-emerald-500/15 border-emerald-500/30",
    pictogramEmoji: "🩸",
    badge: "Blood Tests"
  },
  { 
    id: 'doctors_dashboard', 
    title: "Doctors Workstation", 
    category: "Clinical & Care", 
    description: "EHR workstation, patient queue, and clinical notes", 
    audioPrompt: "Doctors Workstation. Access doctor medical notes and patient consultation lists.",
    icon: <UserCheck size={22} />, 
    color: "text-cyan-600 bg-cyan-500/15 border-cyan-500/30",
    pictogramEmoji: "🩺",
    badge: "Clinicians"
  },
  { 
    id: 'monitor', 
    title: "Real-Time Bio-Monitor", 
    category: "Clinical & Care", 
    description: "Live telemetry stream for heart rate, SpO2 & ECG", 
    audioPrompt: "Heart and Vital Bio Monitor. Watch live heart pulse, oxygen levels, and body signals.",
    icon: <Monitor size={22} />, 
    color: "text-indigo-600 bg-indigo-500/15 border-indigo-500/30",
    pictogramEmoji: "📈",
    badge: "Heart Monitor"
  },
  { 
    id: 'specialist', 
    title: "Specialist & Telehealth Directory", 
    category: "Clinical & Care", 
    description: "Connect with certified medical specialists & doctors", 
    audioPrompt: "Specialist Doctor Finder. Find expert doctors and start video health consultations.",
    icon: <Stethoscope size={22} />, 
    color: "text-purple-600 bg-purple-500/15 border-purple-500/30",
    pictogramEmoji: "👨‍⚕️",
    badge: "Find Doctor"
  },
  { 
    id: 'genomic_longevity', 
    title: "Genomic Longevity & DNA", 
    category: "AI & Analytics", 
    description: "DNA variant risk profiling and longevity indicators", 
    audioPrompt: "Genomic DNA Analysis. Check genetic health risk factors and longevity indicators.",
    icon: <Dna size={22} />, 
    color: "text-rose-600 bg-rose-500/15 border-rose-500/30",
    pictogramEmoji: "🧬",
    badge: "DNA Longevity"
  },
  { 
    id: 'records', 
    title: "Medical Records & Prescriptions", 
    category: "Records & Labs", 
    description: "Medical history archives, PDFs, and prescriptions", 
    audioPrompt: "Medical Records File. Open your medical history files, doctor prescriptions, and health documents.",
    icon: <FolderHeart size={22} />, 
    color: "text-amber-600 bg-amber-500/15 border-amber-500/30",
    pictogramEmoji: "📁",
    badge: "Records"
  },
  { 
    id: 'symptoms', 
    title: "Symptom Triage Assistant", 
    category: "AI & Analytics", 
    description: "Interactive triage tool with differential diagnosis", 
    audioPrompt: "Symptom Checker. Select where your body hurts to get instant first-aid recommendations.",
    icon: <Sparkles size={22} />, 
    color: "text-violet-600 bg-violet-500/15 border-violet-500/30",
    pictogramEmoji: "✨",
    badge: "Check Pain"
  },
  { 
    id: 'vitality', 
    title: "Vitality Matrix & Energy", 
    category: "AI & Analytics", 
    description: "Energy scores, sleep tracking & wellness metrics", 
    audioPrompt: "Vitality and Energy Score. See your daily sleep quality, stamina, and energy levels.",
    icon: <Zap size={22} />, 
    color: "text-orange-600 bg-orange-500/15 border-orange-500/30",
    pictogramEmoji: "⚡",
    badge: "Energy Score"
  },
  { 
    id: 'meds', 
    title: "Medication & Pharmacy Tracker", 
    category: "Records & Labs", 
    description: "Dosage schedules, interaction alerts & refills", 
    audioPrompt: "Pills and Pharmacy Tracker. Check your medicine pill schedule and dosage reminders.",
    icon: <Pill size={22} />, 
    color: "text-pink-600 bg-pink-500/15 border-pink-500/30",
    pictogramEmoji: "💊",
    badge: "Pill Schedule"
  },
  { 
    id: 'illustrator', 
    title: "3D Organ & Body Visualizer", 
    category: "AI & Analytics", 
    description: "3D anatomical models and organ visualization", 
    audioPrompt: "3D Organ Body Visualizer. Look at interactive 3D human body and anatomical models.",
    icon: <Palette size={22} />, 
    color: "text-amber-600 bg-amber-500/15 border-amber-500/30",
    pictogramEmoji: "🫀",
    badge: "3D Body"
  },
  { 
    id: 'neuro', 
    title: "CognisHub Brain AI", 
    category: "AI & Analytics", 
    description: "Neuro-cognitive assessment and brainwave tracking", 
    audioPrompt: "Brain and Memory AI. Test cognitive memory, focus score, and neural brain health.",
    icon: <Brain size={22} />, 
    color: "text-violet-600 bg-violet-500/15 border-violet-500/30",
    pictogramEmoji: "🧠",
    badge: "Brain AI"
  },
  { 
    id: 'biomatic', 
    title: "Biomatic Clinical Sandbox", 
    category: "AI & Analytics", 
    description: "Simulate organ response & dosage scenarios", 
    audioPrompt: "Biomatic Clinical Simulator. Test drug dosage effects and body organ responses.",
    icon: <Cpu size={22} />, 
    color: "text-cyan-600 bg-cyan-500/15 border-cyan-500/30",
    pictogramEmoji: "💻",
    badge: "Simulator"
  },
  { 
    id: 'health_trace', 
    title: "Clinical Activity Timeline", 
    category: "Records & Labs", 
    description: "Comprehensive timeline of clinical activities", 
    audioPrompt: "Clinical Timeline. Review past medical checks, hospital visits, and treatment history.",
    icon: <TrendingUp size={22} />, 
    color: "text-blue-600 bg-blue-500/15 border-blue-500/30",
    pictogramEmoji: "📊",
    badge: "Timeline"
  },
  { 
    id: 'emergency', 
    title: "Emergency Dispatch & Panic Alert", 
    category: "Clinical & Care", 
    description: "Urgent 911 alert protocol and panic broadcast", 
    audioPrompt: "EMERGENCY PANIC BUTTON. Tap here immediately to call emergency ambulance and first responders!",
    icon: <AlertTriangle size={22} />, 
    color: "text-red-600 bg-red-500/15 border-red-500/30",
    pictogramEmoji: "🚨",
    badge: "URGENT 911"
  },
  { 
    id: 'fitness', 
    title: "Workout & Exercise Tracker", 
    category: "Clinical & Care", 
    description: "Exercise logs, VO2 max estimation & cardio", 
    audioPrompt: "Physical Fitness Tracker. Record your daily walking, cardio workouts, and steps.",
    icon: <Dumbbell size={22} />, 
    color: "text-emerald-600 bg-emerald-500/15 border-emerald-500/30",
    pictogramEmoji: "🏋️",
    badge: "Workouts"
  },
  { 
    id: 'gsm_sms_gateway', 
    title: "GSM Serial Modem & SMS Gateway", 
    category: "System & Security", 
    description: "Connect GSM module via Serial AT commands, process incoming SMS with local AI", 
    audioPrompt: "GSM Text Message Gateway. Send SMS text messages and run cellular modem AT serial commands.",
    icon: <Radio size={22} />, 
    color: "text-emerald-600 bg-emerald-500/15 border-emerald-500/30",
    pictogramEmoji: "📻",
    badge: "GSM SMS"
  },
  { 
    id: 'biosecurity', 
    title: "Bio-Security & Cyber Vault", 
    category: "System & Security", 
    description: "Zero-knowledge encryption keys & access logs", 
    audioPrompt: "Bio Security Vault. Protect medical account passwords, encryption keys, and security logs.",
    icon: <Shield size={22} />, 
    color: "text-red-600 bg-red-500/15 border-red-500/30",
    pictogramEmoji: "🛡️",
    badge: "Security"
  },
  { 
    id: 'billing', 
    title: "Subscription & Credit Management", 
    category: "System & Security", 
    description: "Manage subscription tiers and AI credits", 
    audioPrompt: "Subscription Billing. Check your membership credits and account billing history.",
    icon: <CreditCard size={22} />, 
    color: "text-blue-600 bg-blue-500/15 border-blue-500/30",
    pictogramEmoji: "💳",
    badge: "Billing"
  },
  { 
    id: 'dev_portal', 
    title: "Developer Portal & APIs", 
    category: "System & Security", 
    description: "REST & GraphQL API endpoints, webhooks & SDKs", 
    audioPrompt: "Developer API Portal. Integration keys, webhook links, and software development tools.",
    icon: <Code size={22} />, 
    color: "text-slate-600 bg-slate-500/15 border-slate-500/30",
    pictogramEmoji: "💻",
    badge: "Developer"
  },
  { 
    id: 'features', 
    title: "Platform Capabilities & Specs", 
    category: "System & Security", 
    description: "Comprehensive summary of Doctorian features", 
    audioPrompt: "Platform Features list. Read full system specifications and app capability guide.",
    icon: <Sliders size={22} />, 
    color: "text-teal-600 bg-teal-500/15 border-teal-500/30",
    pictogramEmoji: "⚙️",
    badge: "Features"
  },
  { 
    id: 'about', 
    title: "About Doctorian Medical", 
    category: "System & Security", 
    description: "System release notes, build information & credits", 
    audioPrompt: "About Doctorian System. Information about system software developers and version release.",
    icon: <Info size={22} />, 
    color: "text-slate-600 bg-slate-500/15 border-slate-500/30",
    pictogramEmoji: "ℹ️",
    badge: "System Info"
  },
  { 
    id: 'help', 
    title: "Help Center & Documentation", 
    category: "System & Security", 
    description: "Guides, tutorials & support desk ticket system", 
    audioPrompt: "Help Center. Get tutorial instructions and ask for user support assistance.",
    icon: <Info size={22} />, 
    color: "text-teal-600 bg-teal-500/15 border-teal-500/30",
    pictogramEmoji: "❓",
    badge: "User Help"
  },
  { 
    id: 'privacy', 
    title: "Privacy Policy & Security", 
    category: "System & Security", 
    description: "HIPAA compliance standards & privacy settings", 
    audioPrompt: "Privacy Policy. Read how your personal medical data is kept private and secure.",
    icon: <Shield size={22} />, 
    color: "text-rose-600 bg-rose-500/15 border-rose-500/30",
    pictogramEmoji: "🔒",
    badge: "Privacy"
  },
  { 
    id: 'terms', 
    title: "Terms of Service & Regulatory Legal", 
    category: "System & Security", 
    description: "User agreements, licenses & legal disclaimers", 
    audioPrompt: "Terms of Service. Read regulatory legal terms, user agreements, and medical licenses.",
    icon: <FileText size={22} />, 
    color: "text-slate-600 bg-slate-500/15 border-slate-500/30",
    pictogramEmoji: "📜",
    badge: "Legal"
  }
];

export const WindowsSystemsHubModal: React.FC<WindowsSystemsHubModalProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  isOffline,
  isEyeCareMode,
  setIsEyeCareMode,
  isDarkMode,
  setIsDarkMode,
  setIsThemeSchedulerOpen,
  vibrateCriticalAlert,
  addToast,
  handleOpenAdminInfo,
  hasNotification,
  isAudioMenuOpen,
  setIsAudioMenuOpen,
  vitalsAudioEnabled,
  toggleVitalsAudio,
  vitalsAudioVolume,
  handleVitalsVolumeChange,
  soundscapeEnabled,
  toggleSoundscapeGlobal,
  soundscapeVolume,
  handleSoundscapeVolChangeGlobal,
  soundscapePreset,
  changePresetGlobal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [autoVoiceHover, setAutoVoiceHover] = useState<boolean>(false);

  if (!isOpen) return null;

  // Speak plain language audio prompt for illiterate/non-reader accessibility
  const speakText = (text: string, id?: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower, clear speech
      utterance.pitch = 1.0;
      
      if (id) setSpeakingId(id);

      utterance.onend = () => {
        setSpeakingId(null);
      };
      utterance.onerror = () => {
        setSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
      addToast(`🔊 Speaking: "${text.substring(0, 45)}..."`, "info");
    } else {
      addToast("Audio speech synthesis is not supported on this browser.", "error");
    }
  };

  const handleSpeakAll = () => {
    const speechSummary = "Welcome to Doctorian Systems Hub. Here are the main sections: 1. Doctor and Clinical Care. 2. AI Doctor Chat and Symptom Checker. 3. Blood Tests, Records, and Medications. 4. Emergency Panic Alert and Systems. Tap any button to open a page, or tap the speaker icon on any card to hear what it does.";
    speakText(speechSummary, 'all');
  };

  const categories = [
    { label: 'All Pages', value: 'All', icon: '🌐' },
    { label: 'Clinical & Care', value: 'Clinical & Care', icon: '🩺' },
    { label: 'AI & Analytics', value: 'AI & Analytics', icon: '🤖' },
    { label: 'Records & Labs', value: 'Records & Labs', icon: '🩸' },
    { label: 'System & Security', value: 'System & Security', icon: '🛡️' }
  ];

  const filteredPages = ALL_HUB_PAGES.filter(page => {
    const matchesSearch = 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || page.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-4 sm:p-5 flex flex-col max-h-[88vh] overflow-hidden relative z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                <LayoutGrid size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Windows Systems Hub
                  <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                    Menu
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Select any workstation or tap <span className="text-blue-600 dark:text-blue-400 font-semibold">🔊 Audio</span> for voice prompt
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all cursor-pointer"
              aria-label="Close Systems Hub"
            >
              <X size={18} />
            </button>
          </div>

          {/* Voice Assist Bar */}
          <div className="mt-2.5 px-3 py-2 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-xl border border-blue-900/60 shadow-xs flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔊</span>
              <span className="text-[11px] font-bold text-slate-200">
                Voice Assistant & Audio Guidance
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeakAll}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                <Volume2 size={12} className={speakingId === 'all' ? 'animate-bounce' : ''} />
                <span>Read All</span>
              </button>

              <button
                onClick={() => {
                  const nextVal = !autoVoiceHover;
                  setAutoVoiceHover(nextVal);
                  addToast(nextVal ? "🎙️ Touch/Hover voice guide enabled" : "Touch voice guide disabled", "info");
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all border cursor-pointer ${
                  autoVoiceHover 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <span>{autoVoiceHover ? '✓ Auto-Voice' : 'Touch Voice'}</span>
              </button>
            </div>
          </div>

          {/* Quick Controls Toolbar */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <button
                onClick={() => {
                  const forced = localStorage.getItem("medical_forced_offline");
                  const nextVal = forced === "true" ? "false" : "true";
                  localStorage.setItem("medical_forced_offline", nextVal);
                  window.dispatchEvent(new Event('storage'));
                  const isForced = nextVal === "true";
                  addToast(
                    isForced 
                      ? "🛡️ Local Offline Core Engaged." 
                      : "⚡ Online Core Synced.",
                    isForced ? "info" : "success"
                  );
                }}
                className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60 transition-all cursor-pointer"
                title="Toggle Local Offline Core"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isOffline ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {isOffline ? 'Off-Grid' : 'Live Sync'}
                </span>
              </button>

              <div className="flex items-center justify-center p-1 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60">
                <VoiceCommandToggle onNavigate={(v) => { onNavigate(v); onClose(); }} />
              </div>

              <button
                onClick={() => setIsEyeCareMode(!isEyeCareMode)}
                className={`flex items-center justify-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isEyeCareMode 
                    ? 'bg-amber-100/80 border-amber-400 text-amber-950 dark:bg-amber-950/40 dark:border-amber-600 dark:text-amber-200' 
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Toggle Eye Care Warm Filter"
              >
                {isEyeCareMode ? <Eye size={13} className="text-amber-500 animate-pulse" /> : <EyeOff size={13} />}
                <span className="text-[10px] font-bold truncate">Eye Care</span>
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Toggle Dark / Light Theme"
              >
                {isDarkMode ? <Sun size={13} className="text-amber-500" /> : <Moon size={13} className="text-indigo-400" />}
                <span className="text-[10px] font-bold truncate">{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>

              <button
                onClick={() => { setIsThemeSchedulerOpen(true); onClose(); }}
                className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer"
                title="Solar Theme Scheduler"
              >
                <Clock size={13} className="text-amber-500" />
                <span className="text-[10px] font-bold truncate">Solar</span>
              </button>

              <button
                onClick={() => { setIsAudioMenuOpen(!isAudioMenuOpen); }}
                className={`flex items-center justify-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isAudioMenuOpen
                    ? 'bg-blue-100/85 border-blue-400 text-blue-950 dark:bg-blue-950/40 dark:border-blue-600 dark:text-blue-200'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Audio Soundscape & Vitals Sonification"
              >
                {vitalsAudioEnabled || soundscapeEnabled ? (
                  <Headphones size={13} className="text-rose-500 animate-bounce" />
                ) : (
                  <VolumeX size={13} className="text-slate-400" />
                )}
                <span className="text-[10px] font-bold truncate">Audio</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Category Filters */}
          <div className="pt-2 pb-1.5 space-y-2 shrink-0">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search pages (e.g., Doctor, Blood, Lab, Emergency)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Buttons Grid with Top-Left Icons and Professional Layout */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar py-1 my-1">
            {filteredPages.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <Search size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold">No pages found matching "{searchQuery}"</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="text-xs font-bold text-blue-500 hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredPages.map((page) => {
                  const isActive = currentView === page.id;
                  const isSpeaking = speakingId === page.id;

                  return (
                    <button
                      key={page.id}
                      type="button"
                      onMouseEnter={() => {
                        if (autoVoiceHover) speakText(page.audioPrompt, page.id);
                      }}
                      onClick={() => {
                        onNavigate(page.id);
                        onClose();
                        addToast(`Opened ${page.title}`, "success");
                      }}
                      className={`group relative flex flex-col justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                        isActive 
                          ? 'bg-blue-500/10 border-blue-500 shadow-sm ring-1 ring-blue-500/40' 
                          : 'bg-slate-50/80 dark:bg-slate-850/70 border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Top Bar with Icon in Top-Left and Badge/Audio in Top-Right */}
                      <div className="flex items-start justify-between gap-1 w-full mb-1.5">
                        {/* Top-Left: Icon Badge + Pictogram */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className={`p-1.5 rounded-lg border ${page.color} shrink-0`}>
                            {page.icon}
                          </div>
                          <span className="text-base shrink-0 leading-none" role="img" aria-label={page.title}>
                            {page.pictogramEmoji}
                          </span>
                        </div>

                        {/* Top-Right: Category Tag & Audio Read Button */}
                        <div className="flex items-center gap-1 shrink-0">
                          {page.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {page.badge}
                            </span>
                          )}
                          <button
                            type="button"
                            title="Hear page voice prompt"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(page.audioPrompt, page.id);
                            }}
                            className={`p-1 rounded-md border transition-all cursor-pointer ${
                              isSpeaking
                                ? 'bg-amber-400 text-slate-950 border-amber-300 animate-bounce'
                                : 'bg-white/90 dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <Volume2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description in Professional Button Format */}
                      <div className="w-full space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {page.title}
                          </h3>
                          {isActive && (
                            <span className="text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shrink-0">
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 font-normal">
                          {page.description}
                        </p>
                      </div>

                      {/* Bottom Direct CTA Indicator */}
                      <div className="mt-1.5 pt-1 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-[9px] font-bold text-blue-600 dark:text-blue-400 w-full group-hover:translate-x-0.5 transition-transform">
                        <span>Open</span>
                        <ArrowRight size={10} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
            <span>{filteredPages.length} workstations • Voice-ready</span>
            <span className="font-mono text-[9px]">Doctorian Hub</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

