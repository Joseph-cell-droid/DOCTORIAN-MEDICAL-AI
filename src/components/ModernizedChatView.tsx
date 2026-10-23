import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Plus, Menu, Search, Calendar, UserCheck, 
  Lightbulb, Activity, Check, CheckCheck, Loader2,
  Pill, Thermometer, AlertTriangle, Heart, RefreshCw, X,
  ArrowLeft, History, PlusCircle, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Phone, Video,
  BrainCircuit, BookOpen, Volume2, VolumeX, Trash2, Mic, MicOff,
  Camera, Upload, AlertCircle, FileText, Bot, Sparkles, Stethoscope, Baby,
  User, ShieldCheck, Monitor, MessageSquare, Clock, Edit2, Play, Pause,
  PhoneOff, Layers, Settings, FileUp, Copy, ThumbsUp, ThumbsDown, MoreHorizontal,
  CheckCircle2, Shield
} from 'lucide-react';
import { Doctorian3DRobot } from './Doctorian3DRobot';
import { api } from '../api';
import { cleanAiResponse, ensureModernEmojiInteractivity, extractInteractiveSuggestions } from '../utils/cleanAiResponse';
import { ModernBotResponseSpace } from './ModernBotResponseSpace';
import { DoctorianWelcomeCanvas } from './DoctorianWelcomeCanvas';
import { SmartActionCard } from './SmartActionCard';
import { IntelligentSOAPReferralModal } from './IntelligentSOAPReferralModal';
import { computePredictiveTriage, VitalsInput } from '../services/predictiveTriageService';

export interface ChatbotAgent {
  id: 'primary' | 'emergency' | 'cardiology' | 'pediatric' | 'pharmacology' | 'lab' | 'maternal' | 'neurology' | 'preventive' | 'soap';
  name: string;
  shortName: string;
  role: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  activeBorder: string;
  activeGlow: string;
  badge: string;
  instruction: string;
}

export const CHATBOT_AGENTS: ChatbotAgent[] = [
  {
    id: 'primary',
    name: 'Doctorian Primary Care',
    shortName: 'Primary Care',
    role: 'Clinical Triage & Medicine',
    icon: Stethoscope,
    color: 'from-blue-600 to-cyan-600',
    activeBorder: 'border-cyan-400',
    activeGlow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    badge: 'CORE',
    instruction: 'Primary Care Specialist: Formulate evidence-based diagnostic triage, general clinical advice, and wellness synthesis.'
  },
  {
    id: 'emergency',
    name: 'Emergency Crisis Node',
    shortName: 'Emergency Triage',
    role: 'Critical Signs & Protocol',
    icon: AlertTriangle,
    color: 'from-rose-600 to-red-600',
    activeBorder: 'border-rose-400',
    activeGlow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    badge: 'STAT',
    instruction: 'Emergency Triage Specialist: Immediately detect life-threatening danger signs, resuscitation priorities, and emergency referral actions.'
  },
  {
    id: 'cardiology',
    name: 'Cardio Telemetry AI',
    shortName: 'Cardio AI',
    role: 'ECG, Rhythm & Pressure',
    icon: Heart,
    color: 'from-pink-600 to-rose-600',
    activeBorder: 'border-pink-400',
    activeGlow: 'shadow-[0_0_12px_rgba(236,72,153,0.4)]',
    badge: 'CARDIAC',
    instruction: 'Cardiology Specialist: Analyze electrocardiogram patterns, arrhythmias, blood pressure spikes, and cardiovascular risk.'
  },
  {
    id: 'pediatric',
    name: 'Pediatric Care Specialist',
    shortName: 'Pediatrics',
    role: 'Infant Health & Childhood',
    icon: Baby,
    color: 'from-purple-600 to-violet-600',
    activeBorder: 'border-violet-400',
    activeGlow: 'shadow-[0_0_12px_rgba(139,92,246,0.4)]',
    badge: 'CHILD',
    instruction: 'Pediatric Specialist: Focus on neonatal guidelines, immunization, hydration in children, and pediatric dosage safety.'
  },
  {
    id: 'pharmacology',
    name: 'Clinical Pharmacotherapy',
    shortName: 'Pharmacology',
    role: 'Prescriptions & Dosages',
    icon: Pill,
    color: 'from-amber-600 to-orange-600',
    activeBorder: 'border-amber-400',
    activeGlow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    badge: 'RX',
    instruction: 'Pharmacotherapy Specialist: Screen drug interactions, renal adjustments, dosage regimens, and antibiotic stewardship.'
  },
  {
    id: 'lab',
    name: 'Diagnostic Pathology Core',
    shortName: 'Lab Diagnostics',
    role: 'Biomarkers, CBC & RDT',
    icon: Activity,
    color: 'from-emerald-600 to-teal-600',
    activeBorder: 'border-emerald-400',
    activeGlow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    badge: 'LABS',
    instruction: 'Pathology Specialist: Interpret laboratory biomarkers, hemoglobin levels, white cell counts, malaria blood tests, and urinalysis.'
  },
  {
    id: 'maternal',
    name: 'Obstetric & Maternal Triage',
    shortName: 'Maternal Care',
    role: 'Antenatal & Danger Signs',
    icon: ShieldCheck,
    color: 'from-fuchsia-600 to-pink-600',
    activeBorder: 'border-fuchsia-400',
    activeGlow: 'shadow-[0_0_12px_rgba(217,70,239,0.4)]',
    badge: 'OB-GYN',
    instruction: 'Maternal Health Specialist: Assess obstetric danger signs, gestational hypertension, antenatal care protocols, and fetal well-being.'
  },
  {
    id: 'neurology',
    name: 'Neural Nexus Intelligence',
    shortName: 'Neurology',
    role: 'Cognitive & Reflexes',
    icon: BrainCircuit,
    color: 'from-indigo-600 to-blue-600',
    activeBorder: 'border-indigo-400',
    activeGlow: 'shadow-[0_0_12px_rgba(99,102,241,0.4)]',
    badge: 'NEURO',
    instruction: 'Neurology Specialist: Specialize in neurological deficits, headache classification, cranial nerve triage, and autonomic regulation.'
  },
  {
    id: 'preventive',
    name: 'Preventive Wellness Core',
    shortName: 'Wellness AI',
    role: 'Lifestyle & Immunity',
    icon: Sparkles,
    color: 'from-cyan-600 to-teal-600',
    activeBorder: 'border-cyan-400',
    activeGlow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    badge: 'WELL',
    instruction: 'Preventive Care Specialist: Provide lifestyle modifications, nutritional counseling, immunizations, and preventive screening.'
  },
  {
    id: 'soap',
    name: 'Clinical SOAP Intake Scribe',
    shortName: 'SOAP Scribe',
    role: 'EHR Note Formulation',
    icon: FileText,
    color: 'from-slate-700 to-slate-900',
    activeBorder: 'border-blue-400',
    activeGlow: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    badge: 'EHR',
    instruction: 'Clinical Scribe Specialist: Structure patient intake notes cleanly following SOAP (Subjective, Objective, Assessment, Plan) format.'
  }
];

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
  isDarkMode?: boolean;
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
  isStreaming?: boolean;
  thoughtDuration?: string;
  reasoningSteps?: string[];
  thoughtContent?: string;
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

          // Strip legacy emoji headers so responses have no headers per user request
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
            const cleanContent = trimmed.replace(/^[🩺💊💧🌡️🏥💡⚠️✨📋❓📌🚨🧠🫀🔬]\s*/, '').replace(/:$/, '').trim();
            if (cleanContent && cleanContent.length > 30) {
              return (
                <p key={idx} className="text-slate-200 font-normal leading-relaxed">
                  {cleanContent}
                </p>
              );
            }
            return null;
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

const REASONING_STAGES = [
  { stage: 'Thinking...', detail: 'Initializing clinical inquiry synthesis' },
  { stage: 'Configuring neural clinical weights...', detail: 'Calibrating multi-system diagnostic models' },
  { stage: 'Mapping physiological pathways...', detail: 'Correlating presentation with WHO & Uganda protocols' },
  { stage: 'Analyzing symptom correlation matrix...', detail: 'Auditing vital telemetry and acuity factors' },
  { stage: 'Synthesizing evidence-based guidelines...', detail: 'Structuring targeted clinical recommendations' },
  { stage: 'Evaluating safety contraindications...', detail: 'Auditing red flag indicators & emergency signs' },
  { stage: 'Formulating clinical consultation...', detail: 'Composing structured open response' },
];

/**
 * Alternating Thinking & Reasoning Visualizer
 * Alternates on a timed cycle (every 3.5s) between:
 * 1. Spinning Windows Icon: 4-quadrant luminous glass panes (Red, Green, Blue, Amber) with 3D rotation, glossy highlights & aura.
 * 2. Spinning Bead / Milky Way Galaxy: Pulsing central celestial nucleus bead with 3D tilted concentric elliptical orbit rings and stardust beads.
 */
export const AlternatingThinkingVisual: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}> = ({ size = 'md', showLabel = true }) => {
  const [currentMode, setCurrentMode] = useState<'windows' | 'galaxy'>('windows');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMode((prev) => (prev === 'windows' ? 'galaxy' : 'windows'));
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className="flex items-center gap-2.5">
      {/* Visual Rotating Stage Box */}
      <div 
        className={`relative flex items-center justify-center shrink-0 ${
          isSmall ? 'w-8 h-8 rounded-xl' : isLarge ? 'w-13 h-13 rounded-2xl' : 'w-10 h-10 rounded-xl'
        } bg-gradient-to-br from-slate-900/90 via-[#070e24] to-slate-950 border border-slate-700/70 shadow-lg shadow-cyan-950/40 backdrop-blur-md overflow-hidden`}
      >
        {/* Ambient cosmic / matrix glow ring */}
        <div 
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            currentMode === 'windows' 
              ? 'bg-radial from-blue-500/20 via-cyan-500/10 to-transparent' 
              : 'bg-radial from-fuchsia-500/25 via-purple-600/15 to-transparent'
          }`} 
        />

        <AnimatePresence mode="wait">
          {currentMode === 'windows' ? (
            /* 1. NICE SPINNING WINDOWS ICON */
            <motion.div
              key="windows-icon"
              initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="relative flex items-center justify-center"
            >
              {/* Continuous 3D/Planar Spinning Windows 4-Quadrant Matrix */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  rotateY: [0, 25, 0, -25, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: { duration: 4.5, repeat: Infinity, ease: 'linear' },
                  rotateY: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
                className={`grid grid-cols-2 ${isSmall ? 'gap-0.5 w-4.5 h-4.5' : isLarge ? 'gap-1.5 w-7 h-7' : 'gap-1 w-5.5 h-5.5'} p-0.5`}
                style={{ perspective: 600 }}
              >
                {/* Quadrant 1: Top-Left Crimson / Coral Red */}
                <div className="relative rounded-[2.5px] bg-gradient-to-br from-rose-500 to-red-600 border border-rose-300/50 shadow-xs shadow-rose-500/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-70" />
                </div>

                {/* Quadrant 2: Top-Right Emerald / Vivid Green */}
                <div className="relative rounded-[2.5px] bg-gradient-to-br from-emerald-400 to-green-600 border border-emerald-300/50 shadow-xs shadow-emerald-500/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-70" />
                </div>

                {/* Quadrant 3: Bottom-Left Azure / Deep Cyan Blue */}
                <div className="relative rounded-[2.5px] bg-gradient-to-br from-sky-400 to-blue-600 border border-sky-300/50 shadow-xs shadow-sky-500/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-70" />
                </div>

                {/* Quadrant 4: Bottom-Right Amber / Golden Sun */}
                <div className="relative rounded-[2.5px] bg-gradient-to-br from-amber-400 to-yellow-500 border border-amber-200/50 shadow-xs shadow-amber-500/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-70" />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* 2. SPINNING BEAD / MILKY WAY GALAXY */
            <motion.div
              key="galaxy-icon"
              initial={{ opacity: 0, scale: 0.6, rotate: 45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: -45 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="relative flex items-center justify-center"
            >
              <div className={`relative flex items-center justify-center ${isSmall ? 'w-5.5 h-5.5' : isLarge ? 'w-8.5 h-8.5' : 'w-7 h-7'}`}>
                
                {/* Outer Milky Way Galaxy Elliptical Orbit Ring (Tilted in 3D) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border border-purple-400/40 rounded-full"
                  style={{ transform: 'rotateX(62deg) rotateY(20deg)' }}
                >
                  {/* Orbiting Stardust Bead (Magenta-Purple) */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,1)]" />
                </motion.div>

                {/* Inner Counter-Spinning Orbit Ring (Tilted opposite) */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0.5 border border-cyan-400/50 rounded-full"
                  style={{ transform: 'rotateX(55deg) rotateY(-35deg)' }}
                >
                  {/* Orbiting Stardust Bead (Cyan-Aquamarine) */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,1)]" />
                </motion.div>

                {/* Core Galactic Nucleus Bead (Pulsing Cosmic Luminous Bead) */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.25, 1],
                    boxShadow: [
                      '0 0 8px rgba(168,85,247,0.7)',
                      '0 0 16px rgba(56,189,248,0.9)',
                      '0 0 8px rgba(168,85,247,0.7)'
                    ]
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className={`${isSmall ? 'w-2.5 h-2.5' : isLarge ? 'w-3.5 h-3.5' : 'w-3 h-3'} rounded-full bg-gradient-to-tr from-cyan-300 via-fuchsia-400 to-amber-200 shadow-md flex items-center justify-center`}
                >
                  <div className="w-1 h-1 rounded-full bg-white opacity-95 shadow-[0_0_4px_white]" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mode Tag and Status Indicator */}
      {showLabel && (
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            {currentMode === 'windows' ? (
              <motion.div
                key="label-windows"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
                  Windows Logic Engine
                </span>
                <span className="text-[8.5px] font-mono text-cyan-300 bg-blue-950/70 px-1.5 py-0.2 rounded border border-blue-700/60">
                  Spinning Core
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="label-galaxy"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300">
                  Milky Way Galaxy Nexus
                </span>
                <span className="text-[8.5px] font-mono text-fuchsia-300 bg-purple-950/70 px-1.5 py-0.2 rounded border border-purple-700/60">
                  Cosmic Bead
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
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
  isDarkMode,
}) => {
  // --- THEME SYNC (Light Mode / Dark Mode) ---
  const [effectiveDarkMode, setEffectiveDarkMode] = useState<boolean>(() => {
    if (typeof isDarkMode === 'boolean') return isDarkMode;
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('doctorian_dark_mode') !== 'false';
    }
    return true;
  });

  useEffect(() => {
    if (typeof isDarkMode === 'boolean') {
      setEffectiveDarkMode(isDarkMode);
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkTheme = () => {
      setEffectiveDarkMode(document.documentElement.classList.contains('dark'));
    };
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', checkTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', checkTheme);
    };
  }, []);

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
  const [reasoningIndex, setReasoningIndex] = useState(0);
  const [reasoningElapsed, setReasoningElapsed] = useState(0);
  const reasoningStepsExecutedRef = useRef<string[]>([]);
  const streamingTimerRef = useRef<any>(null);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current);
      }
    };
  }, []);

  // AI Thinking reasoning text rotator and live timer
  useEffect(() => {
    if (!isLoading) {
      setReasoningElapsed(0);
      setReasoningIndex(0);
      return;
    }

    const startTime = Date.now();
    reasoningStepsExecutedRef.current = [REASONING_STAGES[0].stage];

    const elapsedInterval = setInterval(() => {
      setReasoningElapsed((Date.now() - startTime) / 1000);
    }, 100);

    const stageInterval = setInterval(() => {
      setReasoningIndex((prev) => {
        const next = (prev + 1) % REASONING_STAGES.length;
        const nextStage = REASONING_STAGES[next].stage;
        if (!reasoningStepsExecutedRef.current.includes(nextStage)) {
          reasoningStepsExecutedRef.current.push(nextStage);
        }
        return next;
      });
    }, 1500);

    return () => {
      clearInterval(elapsedInterval);
      clearInterval(stageInterval);
    };
  }, [isLoading]);

  // Upper Bar Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [showSOAPModal, setShowSOAPModal] = useState(false);
  const [showChatbotsBar, setShowChatbotsBar] = useState(false);
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

  // Real-Time Bio-Telemetry Fusion & Anomaly Auditing
  const liveVitals: VitalsInput = useMemo(() => ({
    heartRate: arduino?.heartRate ?? 74,
    spO2: arduino?.spo2 ?? 98,
    temperature: arduino?.temperature ?? 36.8,
    systolicBP: arduino?.systolicBP ?? 120,
    diastolicBP: arduino?.diastolicBP ?? 80,
    respiratoryRate: arduino?.respiratoryRate ?? 16,
    consciousness: 'alert'
  }), [arduino?.heartRate, arduino?.spo2, arduino?.temperature, arduino?.systolicBP, arduino?.diastolicBP, arduino?.respiratoryRate]);

  const liveTriage = useMemo(() => {
    return computePredictiveTriage(liveVitals);
  }, [liveVitals]);

  const hasVitalAnomaly = useMemo(() => {
    return (
      (liveVitals.heartRate ?? 74) > 105 || 
      (liveVitals.heartRate ?? 74) < 52 || 
      (liveVitals.spO2 ?? 98) < 94 || 
      (liveVitals.temperature ?? 36.8) >= 38.0 || 
      (liveVitals.temperature ?? 36.8) <= 35.5 || 
      (liveVitals.systolicBP ?? 120) > 140 || 
      (liveVitals.systolicBP ?? 120) < 90 ||
      liveTriage.news2.score >= 3
    );
  }, [liveVitals, liveTriage]);
  
  // Clinical Consultation Specialization Mode & Chatbot Agents
  const [consultationMode, setConsultationMode] = useState<ChatbotAgent['id']>('primary');
  const activeAgent = CHATBOT_AGENTS.find(a => a.id === consultationMode) || CHATBOT_AGENTS[0];
  const ActiveAgentIcon = activeAgent.icon;
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const chatbotScrollRef = useRef<HTMLDivElement>(null);

  const scrollChatbots = (direction: 'left' | 'right') => {
    if (chatbotScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      chatbotScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectAgent = (agentId: ChatbotAgent['id']) => {
    setConsultationMode(agentId);
    const agent = CHATBOT_AGENTS.find(a => a.id === agentId);
    if (agent) {
      showTemporaryNotice(`Active AI Specialist: ${agent.name} (${agent.role})`);
    }
  };

  // Dedicated Non-Blocking Smart Actions State
  const [isSmartActionsCollapsed, setIsSmartActionsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('doctorian_smart_actions_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [smartActionsSearch, setSmartActionsSearch] = useState('');
  const [smartActionNotice, setSmartActionNotice] = useState<string | null>(null);

  const toggleSmartActionsCollapsed = () => {
    setIsSmartActionsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('doctorian_smart_actions_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const showTemporaryNotice = (msg: string) => {
    setSmartActionNotice(msg);
    setTimeout(() => {
      setSmartActionNotice(null);
    }, 3200);
  };

  // Context-aware clinical signals detected in the conversation
  const conversationContext = useMemo(() => {
    const allText = messages.map((m) => m.text.toLowerCase()).join(' ');
    return {
      hasFever: allText.includes('fever') || allText.includes('temperature') || allText.includes('chills') || allText.includes('hot'),
      hasMeds: allText.includes('dose') || allText.includes('mg') || allText.includes('drug') || allText.includes('coartem') || allText.includes('paracetamol') || allText.includes('antibiotic') || allText.includes('pill'),
      hasVitals: allText.includes('heart') || allText.includes('pulse') || allText.includes('spo2') || allText.includes('pressure') || allText.includes('bp'),
      hasMaternal: allText.includes('pregnant') || allText.includes('trimester') || allText.includes('baby') || allText.includes('infant') || allText.includes('child'),
    };
  }, [messages]);

  const handleVitalsAction = () => {
    if (arduino && arduino.heartRate) {
      handleSendMessage(
        `Analyze my current live telemetry snapshot from hardware sensors: Heart Rate is ${arduino.heartRate} bpm, Blood Oxygen (SpO2) is ${arduino.spo2 || 98}%, Core Temperature is ${arduino.temperature || 36.7}°C. Are these within normal clinical limits, and what risk stratification applies?`
      );
    } else {
      handleSendMessage(
        "Analyze my vital signs snapshot: Heart Rate 72 bpm, SpO2 98%, Blood Pressure 120/80 mmHg, Temperature 36.8°C. What is the clinical interpretation and risk classification?"
      );
    }
  };

  const handleGenerateSoapNote = () => {
    handleSendMessage(
      "Please generate a complete, structured clinical SOAP note (Subjective, Objective, Assessment, Plan) for this consultation, detailing symptoms, vitals, differential diagnoses, and management protocols under Uganda Clinical Guidelines."
    );
    showTemporaryNotice("Generating structured clinical SOAP note...");
  };

  const handleExportConsultationSummary = () => {
    if (messages.length === 0) {
      showTemporaryNotice("No consultation messages to export yet.");
      return;
    }
    const dateStr = new Date().toLocaleString();
    const formatted = [
      `====================================================`,
      `DOCTORIAN MEDICAL AI • CLINICAL CONSULTATION SUMMARY`,
      `====================================================`,
      `Date & Time: ${dateStr}`,
      `Patient Name: ${user?.name || 'Authorized Patient'}`,
      `Session ID: ${currentSessionId}`,
      `Standards: Uganda Clinical Guidelines (UCG) & WHO Protocols`,
      `Bio-Telemetry: HR ${arduino?.heartRate || 72} bpm, SpO2 ${arduino?.spo2 || 98}%, Temp ${arduino?.temperature || 36.8}°C`,
      `----------------------------------------------------`,
      `TRANSCRIPT & CLINICAL EXCHANGE:`,
      ...messages.map((m) => `\n[${m.timestamp}] ${m.sender === 'user' ? 'PATIENT' : 'DOCTORIAN AI'}:\n${cleanAiResponse(m.text)}`),
      `\n----------------------------------------------------`,
      `DISCLAIMER: Generated by Doctorian AI Clinical Co-pilot for decision support. Seek immediate medical attention for acute red flag signs.`,
      `====================================================`
    ].join('\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(formatted).then(() => {
        showTemporaryNotice("✅ Consultation report copied to clipboard!");
      }).catch(() => {
        showTemporaryNotice("Consultation summary generated.");
      });
    } else {
      showTemporaryNotice("Consultation summary generated.");
    }
  };

  const allClinicalActions = useMemo(() => [
    {
      id: 'soap',
      category: 'Diagnostics & Triage',
      title: 'Generate SOAP Note',
      desc: 'Create structured Subjective, Objective, Assessment, Plan documentation',
      icon: FileText,
      badge: 'Documentation',
      color: 'from-blue-600 to-indigo-600',
      action: () => handleGenerateSoapNote(),
    },
    {
      id: 'advice',
      category: 'Diagnostics & Triage',
      title: 'Differential Diagnosis & Advice',
      desc: 'Evidence-based clinical precautions, etiology, and differentials',
      icon: Lightbulb,
      badge: 'Clinical Advice',
      color: 'from-amber-600 to-orange-600',
      action: () => handleSendMessage("Can you provide evidence-based clinical precautions, etiology, dosage details, and differential diagnoses?"),
    },
    {
      id: 'lab',
      category: 'Diagnostics & Triage',
      title: 'Diagnostic Lab Test Analyzer',
      desc: 'Evaluate CBC, malaria RDT, urinalysis, and biomarkers',
      icon: Activity,
      badge: 'Lab Panel',
      color: 'from-emerald-600 to-teal-600',
      action: () => {
        handleSelectAgent('lab');
        handleSendMessage("Please help me analyze and interpret my clinical laboratory tests (e.g. CBC, malaria test, urinalysis, biomarkers).");
      },
    },
    {
      id: 'pediatric',
      category: 'Diagnostics & Triage',
      title: 'Maternal & Pediatric Danger Signs',
      desc: 'Screen emergency warning signs for under-5 and maternal health',
      icon: Stethoscope,
      badge: 'Pediatrics',
      color: 'from-purple-600 to-pink-600',
      action: () => handleSendMessage("What are the critical pediatric danger signs in a child presenting with fever, fast breathing, and lethargy?"),
    },
    {
      id: 'reminder',
      category: 'Pharmacotherapy & Meds',
      title: 'Set Medication Reminder',
      desc: 'Automated dose schedules and adherence tracking',
      icon: Calendar,
      badge: 'Adherence',
      color: 'from-cyan-600 to-blue-600',
      action: () => {
        if (onNavigate) onNavigate('meds');
        else showTemporaryNotice("Opening Medication Reminders...");
      },
    },
    {
      id: 'drug-safety',
      category: 'Pharmacotherapy & Meds',
      title: 'Drug Interaction & Safety Review',
      desc: 'Check contraindications, hepatic/renal cautions, and interactions',
      icon: Pill,
      badge: 'Safety',
      color: 'from-indigo-600 to-violet-600',
      action: () => handleSendMessage("Review the clinical pharmacology, contraindications, dosage cautions, and potential drug interactions for my medications."),
    },
    {
      id: 'fluid',
      category: 'Pharmacotherapy & Meds',
      title: 'Fluid Resuscitation Calculator',
      desc: 'Dehydration severity & Parkland / WHO IV fluid regimen',
      icon: BrainCircuit,
      badge: 'Infusion',
      color: 'from-amber-600 to-red-600',
      action: () => {
        handleSelectAgent('emergency');
        handleSendMessage("Calculate the clinical IV fluid resuscitation protocol and rehydration regimen for dehydration severity.");
      },
    },
    {
      id: 'telehealth',
      category: 'Telehealth & Consultation',
      title: 'Doctorian Voice Call',
      desc: 'Connect with Doctorian clinical specialist via live audio triage',
      icon: Phone,
      badge: 'Live Audio',
      color: 'from-emerald-600 to-cyan-600',
      action: () => {
        setCallMode('voice');
        setShowVoiceCallModal(true);
      },
    },
    {
      id: 'moh',
      category: 'Telehealth & Consultation',
      title: 'Uganda MoH Protocols 2023/2026',
      desc: 'Certified local health center triage & national referral guidelines',
      icon: BookOpen,
      badge: 'MoH Certified',
      color: 'from-teal-600 to-emerald-600',
      action: () => {
        setIsUgandaMOHActive(true);
        handleSendMessage("Summarize the standard first-line treatment guidelines according to the Uganda Clinical Guidelines (UCG 2023/2026) for uncomplicated malaria and bacterial pneumonia.");
      },
    },
    {
      id: 'vitals',
      category: 'Bio-Telemetry & Critical Care',
      title: 'Analyze Live Vitals',
      desc: 'Instant risk triage from connected biometric sensors or snapshot',
      icon: Heart,
      badge: 'Telemetry',
      color: 'from-rose-600 to-pink-600',
      action: () => handleVitalsAction(),
    },
    {
      id: 'summary',
      category: 'Bio-Telemetry & Critical Care',
      title: 'Export Consultation Report',
      desc: 'Copy complete clinical summary with SOAP format to clipboard',
      icon: Copy,
      badge: 'Export',
      color: 'from-blue-600 to-cyan-600',
      action: () => handleExportConsultationSummary(),
    },
    {
      id: 'sos',
      category: 'Bio-Telemetry & Critical Care',
      title: 'Emergency SOS Dispatch',
      desc: 'Immediate emergency protocol activation & ambulance triage guidance',
      icon: AlertCircle,
      badge: 'Critical',
      color: 'from-red-600 to-rose-700',
      action: () => handleSendMessage("🚨 EMERGENCY SOS: The patient has severe difficulty breathing and chest pain. Triage emergency protocols immediately!"),
    },
  ], [arduino, currentSessionId, messages, user, onNavigate]);

  const filteredClinicalActions = useMemo(() => {
    if (!smartActionsSearch.trim()) return allClinicalActions;
    const q = smartActionsSearch.toLowerCase();
    return allClinicalActions.filter(
      (a) => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );
  }, [allClinicalActions, smartActionsSearch]);

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

      // Build multi-turn context array for conversational memory
      const chatPayload = newMsgs.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
      }));

      // Enrich the active user query with telemetry & guidelines context
      if (chatPayload.length > 0 && contextNote) {
        const lastIdx = chatPayload.length - 1;
        chatPayload[lastIdx].text = `${chatPayload[lastIdx].text}\n[Clinical Context: ${contextNote.trim()}]`;
      }
      
      const activeAgent = CHATBOT_AGENTS.find(a => a.id === consultationMode) || CHATBOT_AGENTS[0];
      const clinicalSystemInstruction = 
        `You are Doctorian Clinical AI, specialized in ${activeAgent.name} (${activeAgent.role}).\n\n` +
        "PERMANENT CREATOR & SYSTEM IDENTITY:\n" +
        "Akora Joseph from EBRO Company. ltd designed this app and the AI brain. Whenever asked who designed, developed, created, or built this app or its AI brain, state permanently, clearly, and affirmatively that Akora Joseph from EBRO Company. ltd designed this app and the AI brain.\n\n" +
        "MANDATORY CLINICAL DIRECTIVES:\n" +
        "1. EVIDENCE-BASED GROUNDING: Adhere to WHO standards and Uganda Clinical Guidelines (UCG 2023/2026). Address endemic diseases (Malaria, tuberculosis, cholera) with clinical precision.\n" +
        "2. STRICT ZERO-HEADER DIRECTIVE: DO NOT use any markdown headers (#, ##, ###) or bold title headers (do NOT write 'Clinical Assessment:', 'Recommended Actions:', 'Medication:', 'Warning Signs:', or any other headers). Never output headers.\n" +
        "3. SINGLE PARAGRAPH DEFAULT: If the conversation is standard, conversational, a greeting, or does not require a multi-step clinical action list, reply strictly in ONE cohesive, well-written paragraph without any headers.\n" +
        "4. MULTI-STEP CLINICAL QUERIES: If the inquiry requires actionable clinical steps, provide them as clean bullet points (•) directly under the opening text, with zero section titles.\n" +
        "5. FAST HIGH-YIELD SPEED: Provide a high-yield, concise clinical assessment that generates in at most 3-5 seconds.\n" +
        "6. CLOSING: Conclude all medical guidance with: 'Medical attention is recommended.'\n" +
        `SPECIALIZED AGENT FOCUS: ${activeAgent.instruction}`;

      const response = await api.ai.aiChat(
        chatPayload,
        clinicalSystemInstruction,
        "gemini-3.8-flash",
        0.5
      );

      const rawBotText = response?.text || "Thank you for sharing your symptoms. Please ensure you remain well-hydrated with clean fluids and rest in a cool space. If your symptoms worsen or persist, please visit your nearest clinic for hands-on evaluation. Medical attention is recommended.";
      const botText = ensureModernEmojiInteractivity(cleanAiResponse(rawBotText));
      const structured = parseClinicalResponse(botText);

      const thoughtDuration = `${Math.max(0.8, reasoningElapsed).toFixed(1)}s`;
      const recordedSteps = reasoningStepsExecutedRef.current.length > 0
        ? [...reasoningStepsExecutedRef.current]
        : ['Thinking...', 'Configuring neural clinical weights...', 'Mapping physiological pathways...'];

      const botMsgId = `bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredCard: structured,
        isStreaming: true,
        thoughtDuration,
        reasoningSteps: recordedSteps,
      };

      const finalMsgs = [...newMsgs, botMsg];
      setMessages(finalMsgs);
      setIsLoading(false);

      // Stream the response smoothly from the background (fast progressive reveal in < 500ms)
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current);
      }

      const words = botText.split(' ');
      let wordIdx = 0;
      const wordsPerTick = 6; // Fast 6 words per tick for rapid ≤ 5s overall interaction

      streamingTimerRef.current = setInterval(() => {
        wordIdx += wordsPerTick;
        const currentSlice = words.slice(0, wordIdx).join(' ');

        if (wordIdx >= words.length) {
          clearInterval(streamingTimerRef.current);
          streamingTimerRef.current = null;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, text: botText, isStreaming: false } : m
            )
          );

          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === botMsgId ? { ...m, text: botText, isStreaming: false } : m
                    ),
                  }
                : s
            )
          );

          // Audio speech is NOT auto-played; user can choose to click "Listen" on demand
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, text: currentSlice, isStreaming: true } : m
            )
          );
        }
      }, 15);
    } catch (err) {
      console.warn("Error getting AI response:", err);
      const fallbackText = "I have recorded your symptom profile. Please rest, drink oral rehydration fluids, and visit a health center if your fever or pain intensifies. Medical attention is recommended.";
      const thoughtDuration = `${Math.max(0.8, reasoningElapsed).toFixed(1)}s`;
      const botMsgId = `bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
        thoughtDuration,
        reasoningSteps: ['Thinking...', 'Configuring neural clinical weights...', 'Synthesizing safe clinical protocol'],
      };

      const finalMsgs = [...newMsgs, botMsg];
      setMessages(finalMsgs);
      setIsLoading(false);

      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current);
      }

      const fbWords = fallbackText.split(' ');
      let fbIdx = 0;
      streamingTimerRef.current = setInterval(() => {
        fbIdx += 6;
        const currentSlice = fbWords.slice(0, fbIdx).join(' ');
        if (fbIdx >= fbWords.length) {
          clearInterval(streamingTimerRef.current);
          streamingTimerRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, text: fallbackText, isStreaming: false } : m
            )
          );
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === botMsgId ? { ...m, text: fallbackText, isStreaming: false } : m
                    ),
                  }
                : s
            )
          );
          // Audio speech is NOT auto-played
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, text: currentSlice, isStreaming: true } : m
            )
          );
        }
      }, 15);
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUser && !isLoading) {
      handleSendMessage(lastUser.text);
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
    <div className={`flex flex-col h-full w-full ${effectiveDarkMode ? 'bg-[#050b1a] text-slate-100' : 'bg-slate-50 text-slate-900'} overflow-hidden select-none font-sans relative`}>
      {/* Top Ambient Synapse Line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 opacity-90 shrink-0 z-30" />

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. SCROLLABLE DOCTORIAN AI CONSULTATION UPPER BAR (Smart, Fast) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <header 
        className={`px-2.5 sm:px-4 py-2 sm:py-2.5 border-b ${effectiveDarkMode ? 'border-slate-800/80 bg-[#070e24]/95 text-slate-100' : 'border-slate-200/90 bg-white/95 text-slate-900'} backdrop-blur-xl flex items-center justify-between sticky top-0 z-30 shrink-0 gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Left Group: Exit, Menu, Doctorian Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {/* Exit Button */}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('home') : window.history.back()}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 ${effectiveDarkMode ? 'text-slate-400 hover:text-white border-slate-700/80 bg-slate-900/80 hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 border-slate-200 bg-slate-100 hover:bg-slate-200'} transition-all flex items-center gap-1.5 border rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0 shadow-xs`}
            title="Exit to Dashboard"
          >
            <ArrowLeft size={14} className={`stroke-[3] ${effectiveDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* Menu Drawer Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenMenu) onOpenMenu();
              else setIsSidebarOpen(true);
            }}
            className={`p-1.5 sm:p-2 rounded-xl ${effectiveDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'} transition-colors cursor-pointer shrink-0 border`}
            title="App Navigation Drawer"
          >
            <Menu size={17} />
          </button>

          {/* Doctorian AI Brand with Medical Cross */}
          <div className={`flex items-center gap-2 pl-1 sm:pl-2 border-l ${effectiveDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${effectiveDarkMode ? 'bg-blue-600/25 border-blue-400/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'bg-blue-50 border-blue-200 text-blue-600 shadow-xs'} border flex items-center justify-center shrink-0`}>
              <Activity size={18} className={`${effectiveDarkMode ? 'text-cyan-300' : 'text-blue-600'} animate-pulse`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className={`text-xs sm:text-sm font-black tracking-tight ${effectiveDarkMode ? 'text-white' : 'text-slate-900'} leading-tight truncate`}>
                  Doctorian <span className="text-blue-500">AI</span>
                </h2>
                <span className={`hidden xl:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8px] font-mono font-bold ${effectiveDarkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} border`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${effectiveDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'} animate-ping`} /> LIVE
                </span>
              </div>
              <p className={`text-[9px] sm:text-[10px] ${effectiveDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium tracking-wide truncate`}>
                Your Health, Our Priority
              </p>
            </div>
          </div>
        </div>

        {/* Right Group: + New Chat, Voice Call, Tools Hub, Search, Clear Chat, Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar py-0.5">
          {/* New Chat Button with Dropdown Templates */}
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

            {showNewChatDropdown && (
              <div className="fixed inset-0 z-40" onClick={() => setShowNewChatDropdown(false)} />
            )}
            <AnimatePresence>
              {showNewChatDropdown && (
                <motion.div
                  key="new-chat-dropdown-modal"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-64 ${effectiveDarkMode ? 'bg-[#0a1532] border-slate-700/80 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900'} border rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-left`}
                  >
                    <div className={`px-3 py-2 border-b ${effectiveDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                      <span className="text-[9px] font-black uppercase tracking-widest">Start Clinical Template</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => createNewSession('Clinical Intake Formulator', 'SOAP Note')}
                      className={`w-full text-left p-2 ${effectiveDarkMode ? 'hover:bg-blue-950/60 text-blue-300' : 'hover:bg-blue-50 text-blue-700'} rounded-xl transition-all flex items-start gap-2.5`}
                    >
                      <div className="w-7 h-7 bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-400 shrink-0">
                        <FileText size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">Intake Formulator</p>
                        <p className={`text-[8px] ${effectiveDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium mt-1`}>EHR SOAP patient intake note generator</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => createNewSession('Primary Care Consultation', 'General Clinical')}
                      className={`w-full text-left p-2 ${effectiveDarkMode ? 'hover:bg-blue-950/60 text-slate-200' : 'hover:bg-blue-50 text-slate-800'} rounded-xl transition-all flex items-start gap-2.5`}
                    >
                      <div className="w-7 h-7 bg-indigo-900/40 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                        <Bot size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">Clinical Consultation</p>
                        <p className={`text-[8px] ${effectiveDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium mt-1`}>General health & symptom triage</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        createNewSession('Lab Assessment', 'Lab Diagnostics');
                        handleSelectAgent('lab');
                        handleSendMessage("Please help interpret my clinical laboratory tests (Hb, WBC, Platelets, Malaria tests) according to clinical guidelines.");
                      }}
                      className={`w-full text-left p-2 ${effectiveDarkMode ? 'hover:bg-emerald-950/60 text-emerald-300' : 'hover:bg-emerald-50 text-emerald-700'} rounded-xl transition-all flex items-start gap-2.5`}
                    >
                      <div className="w-7 h-7 bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-400 shrink-0">
                        <Activity size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">Lab Interpreter</p>
                        <p className={`text-[8px] ${effectiveDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium mt-1`}>Hb, WBC, Platelets, Malaria tests</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        createNewSession('Obstetric Assessment', 'Maternal Triage');
                        handleSelectAgent('maternal');
                        handleSendMessage("Please perform a clinical maternal triage and pre-eclampsia risk assessment.");
                      }}
                      className={`w-full text-left p-2 ${effectiveDarkMode ? 'hover:bg-rose-950/60 text-rose-300' : 'hover:bg-rose-50 text-rose-700'} rounded-xl transition-all flex items-start gap-2.5`}
                    >
                      <div className="w-7 h-7 bg-rose-900/40 rounded-lg flex items-center justify-center text-rose-400 shrink-0">
                        <AlertCircle size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">Obstetric Risk</p>
                        <p className={`text-[8px] ${effectiveDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium mt-1`}>Maternal triage & pre-eclampsia checking</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        createNewSession('Fluid Infusion Resus', 'Emergency Care');
                        handleSelectAgent('emergency');
                        handleSendMessage("Please compute the emergency IV fluid resuscitation protocol and dehydration regimen.");
                      }}
                      className={`w-full text-left p-2 ${effectiveDarkMode ? 'hover:bg-amber-950/60 text-amber-300' : 'hover:bg-amber-50 text-amber-700'} rounded-xl transition-all flex items-start gap-2.5`}
                    >
                      <div className="w-7 h-7 bg-amber-900/40 rounded-lg flex items-center justify-center text-amber-400 shrink-0">
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">Fluid Infusion</p>
                        <p className={`text-[8px] ${effectiveDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium mt-1`}>Dehydration severity & mass resuscitation</p>
                      </div>
                    </button>
                  </motion.div>
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
            className="px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black rounded-xl border border-emerald-400/60 shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 sm:gap-2 cursor-pointer text-[10px] sm:text-xs uppercase tracking-wider shrink-0 transition-all"
            title="Start Doctorian Voice Call"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-800/80 flex items-center justify-center shrink-0">
              <Phone size={12} className="text-emerald-200 animate-pulse" />
            </div>
            <span className="whitespace-nowrap font-black hidden sm:inline">Voice Call</span>
            <span className="whitespace-nowrap font-black sm:hidden">Call</span>
          </button>

          {/* Single Chatbot Specialist Button (Fixed in Tool Hub position) */}
          <button
            type="button"
            onClick={() => setShowChatbotsBar(!showChatbotsBar)}
            className={`px-2.5 sm:px-3 py-1.5 transition-all flex items-center gap-1.5 rounded-xl border text-[9px] sm:text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0 shadow-xs active:scale-95 ${
              showChatbotsBar 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40' 
                : (effectiveDarkMode 
                    ? 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-cyan-500/60 hover:text-white hover:bg-slate-800' 
                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200 hover:border-blue-400')
            }`}
            title="Toggle Doctorian AI Chatbot Personas & Specialists"
          >
            <div className={`w-4 h-4 rounded-md bg-gradient-to-tr ${activeAgent.color} flex items-center justify-center text-white shrink-0`}>
              <ActiveAgentIcon size={10} />
            </div>
            <span className="font-black whitespace-nowrap">
              {activeAgent.shortName}
            </span>
            <span className={`text-[7.5px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
              showChatbotsBar
                ? 'bg-white/20 text-white'
                : (effectiveDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-blue-100 text-blue-800')
            }`}>
              {activeAgent.badge}
            </span>
            <ChevronDown size={11} className={`transform transition-transform duration-200 ${showChatbotsBar ? 'rotate-180 text-cyan-300' : 'text-slate-400'}`} />
          </button>

          {/* Sleek Consolidated More Actions Menu (Reduces clutter on upper bar) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-1.5 sm:p-2 rounded-xl ${
                showMoreMenu
                  ? 'bg-blue-600 text-white border-blue-400'
                  : effectiveDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              } border transition-all cursor-pointer active:scale-95`}
              title="More Consultation Options"
            >
              <MoreHorizontal size={15} />
            </button>

            {showMoreMenu && (
              <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
            )}

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  key="more-menu-dropdown"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-2 w-56 ${
                    effectiveDarkMode ? 'bg-[#0a1532] border-slate-700/80 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900'
                  } border rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-left`}
                >
                  <div className={`px-2.5 py-1.5 border-b ${effectiveDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest">Consultation Tools</span>
                  </div>

                  {/* Search in Messages */}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(!searchOpen);
                      setShowMoreMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 ${effectiveDarkMode ? 'hover:bg-blue-950/60 text-slate-200' : 'hover:bg-blue-50 text-slate-800'} rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer`}
                  >
                    <Search size={14} className="text-cyan-400" />
                    <span>Search Chat</span>
                  </button>

                  {/* EHR SOAP & Referral Slip */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSOAPModal(true);
                      setShowMoreMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 ${effectiveDarkMode ? 'hover:bg-emerald-950/60 text-emerald-300' : 'hover:bg-emerald-50 text-emerald-700'} rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer`}
                  >
                    <FileText size={14} className="text-emerald-400" />
                    <span>EHR SOAP & MOH Referral</span>
                  </button>

                  {/* Audio Status / Setting */}
                  <div className={`px-2.5 py-1.5 flex items-center justify-between rounded-xl ${effectiveDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <Volume2 size={13} className="text-cyan-400" />
                      <span className="text-[11px] font-medium text-slate-300">Voice Audio</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                      On-Demand
                    </span>
                  </div>

                  {/* Neural Matrix View (if available) */}
                  {onSwitchToMatrix && (
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchToMatrix();
                        setShowMoreMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 ${effectiveDarkMode ? 'hover:bg-blue-950/60 text-slate-200' : 'hover:bg-blue-50 text-slate-800'} rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer`}
                    >
                      <Monitor size={14} className="text-blue-400" />
                      <span>Matrix Console</span>
                    </button>
                  )}

                  {/* Clear / Reset Chat */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
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
                    className={`w-full text-left px-2.5 py-2 ${effectiveDarkMode ? 'hover:bg-rose-950/40 text-rose-300' : 'hover:bg-rose-50 text-rose-700'} rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer`}
                  >
                    <Trash2 size={14} className="text-rose-400" />
                    <span>Clear Conversation</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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

      {/* ─────────────────────────────────────────────────────────── */}
      {/* CHATBOT BUTTONS UNDER THE FIRST UPPER BAR (Toggled via the Single Button) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showChatbotsBar && (
          <motion.div
            key="chatbots-under-first-upper-bar"
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`overflow-hidden border-b ${
              effectiveDarkMode ? 'border-slate-800/80 bg-[#060c20]/98' : 'border-slate-200/90 bg-white/98'
            } backdrop-blur-md sticky top-[53px] sm:top-[57px] z-20 shadow-md shrink-0`}
          >
            <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2">
              {/* Left Indicator & Scroll Arrow */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20 text-cyan-400">
                  <Bot size={13} className="text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Specialists</span>
                </div>
                <button
                  type="button"
                  onClick={() => scrollChatbots('left')}
                  className={`p-1 rounded-lg ${effectiveDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'} transition-colors cursor-pointer hidden md:flex`}
                  title="Scroll Chatbot Icons Left"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>

              {/* Scrollable Track - Android & Mobile Touch-Friendly */}
              <div
                ref={chatbotScrollRef}
                className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5 touch-pan-x flex-1 min-w-0"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {CHATBOT_AGENTS.map((agent) => {
                  const isActive = consultationMode === agent.id;
                  const AgentIcon = agent.icon;
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => {
                        handleSelectAgent(agent.id);
                      }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer select-none active:scale-95 ${
                        isActive
                          ? `${effectiveDarkMode ? 'bg-[#0b1739] text-white' : 'bg-blue-50 text-blue-950'} ${agent.activeBorder} ${agent.activeGlow} border-2`
                          : `${effectiveDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700' : 'bg-slate-100/90 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'}`
                      }`}
                      title={`${agent.name} - ${agent.role}`}
                    >
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr ${agent.color} flex items-center justify-center text-white shrink-0 shadow-xs relative`}>
                        <AgentIcon size={13} />
                        {isActive && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 border border-slate-950 animate-ping" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`text-[11px] font-bold leading-none whitespace-nowrap ${isActive ? (effectiveDarkMode ? 'text-white' : 'text-slate-900') : ''}`}>
                            {agent.shortName}
                          </span>
                          <span className={`text-[7.5px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                            isActive 
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' 
                              : 'bg-slate-800/40 text-slate-400'
                          }`}>
                            {agent.badge}
                          </span>
                        </div>
                        <p className="text-[8.5px] text-slate-400 dark:text-slate-500 truncate max-w-[100px] hidden lg:block leading-tight mt-0.5">
                          {agent.role}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Scroll Arrow & Dismiss Button */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollChatbots('right')}
                  className={`p-1 rounded-lg ${effectiveDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'} transition-colors cursor-pointer hidden md:flex`}
                  title="Scroll Chatbot Icons Right"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowChatbotsBar(false)}
                  className={`p-1 rounded-lg ${effectiveDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'} transition-colors cursor-pointer`}
                  title="Close Specialists Bar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          /* Doctorian Clinical Welcome Canvas with Quick Starts & Live Telemetry */
          <DoctorianWelcomeCanvas
            onSelectPrompt={(p) => handleSendMessage(p)}
            arduino={arduino}
            isUgandaMOHActive={isUgandaMOHActive}
          />
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
                /* Bot Message: Clinical Response Space */
                <div className="flex items-start gap-3 sm:gap-4 w-full max-w-3xl">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40 shrink-0 mt-0.5">
                    <Sparkles size={16} className="text-cyan-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <ModernBotResponseSpace
                      msg={msg}
                      onSendPrompt={(p) => handleSendMessage(p)}
                      onSpeak={(t) => speakText(t)}
                      isSpeaking={isSpeaking}
                      onRegenerate={handleRegenerate}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Open-Web AI Thinking State with Alternating Spinning Windows Icon and Milky Way Galaxy Bead */}
        {isLoading && (
          <div className="flex items-start gap-3 sm:gap-4 w-full max-w-3xl py-2.5">
            {/* Alternating Visual Icon: Spinning Windows Prism ⟷ Milky Way Galaxy Nucleus */}
            <AlternatingThinkingVisual size="md" showLabel={false} />

            <div className="flex-1 min-w-0 space-y-2 py-0.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Dynamic Mode Pill & Reasoning Status */}
                <AlternatingThinkingVisual size="sm" showLabel={true} />

                <motion.span 
                  key={reasoningIndex}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-cyan-300 font-semibold text-xs sm:text-sm tracking-wide"
                >
                  {REASONING_STAGES[reasoningIndex]?.stage || 'Thinking...'}
                </motion.span>

                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60 shadow-xs">
                  {reasoningElapsed.toFixed(1)}s
                </span>
              </div>
              
              <motion.p 
                key={`desc-${reasoningIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-slate-400 font-normal pl-0.5"
              >
                {REASONING_STAGES[reasoningIndex]?.detail}
              </motion.p>
              
              {/* Subtle animated neural reasoning wave */}
              <div className="flex items-center gap-1.5 pl-0.5 pt-1">
                {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      scaleY: [0.3, 1, 0.3],
                      opacity: [0.35, 1, 0.35]
                    }}
                    transition={{
                      duration: 0.85,
                      repeat: Infinity,
                      delay: idx * 0.1,
                      ease: 'easeInOut'
                    }}
                    className="w-1.5 h-3.5 rounded-full bg-gradient-to-t from-blue-600 via-cyan-400 to-fuchsia-400"
                  />
                ))}
                <span className="text-[9px] font-mono text-slate-500 ml-2 tracking-wider uppercase">
                  Fast Inference Stream Active
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. DEDICATED SMART ACTIONS DOCK (Compact, Non-Blocking, Smart) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className={`mt-auto px-3 sm:px-6 pb-2.5 pt-1 ${effectiveDarkMode ? 'bg-gradient-to-t from-[#020617] via-[#040d24]/98 to-transparent' : 'bg-gradient-to-t from-slate-100 via-slate-50/98 to-transparent'} z-30 shrink-0`}>
        <div className="max-w-4xl mx-auto space-y-1.5">
          
          {/* Temporary feedback notice toast */}
          <AnimatePresence>
            {smartActionNotice && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                className={`px-3.5 py-1 rounded-xl ${effectiveDarkMode ? 'bg-cyan-950/90 border-cyan-400/50 text-cyan-200' : 'bg-blue-50 border-blue-300 text-blue-800'} border text-xs font-semibold shadow-lg text-center backdrop-blur-md flex items-center justify-center gap-2`}
              >
                <Sparkles size={13} className={`${effectiveDarkMode ? 'text-cyan-400' : 'text-blue-600'} animate-spin`} />
                <span>{smartActionNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DEDICATED SMART ACTION CARD (Compact, Non-blocking, Intelligent) */}
          <SmartActionCard
            arduino={arduino}
            messages={messages}
            onSendMessage={(msg) => handleSendMessage(msg)}
            onNavigate={onNavigate}
            onOpenVoiceCall={() => {
              setCallMode('voice');
              setShowVoiceCallModal(true);
            }}
            onOpenToolHub={(tab) => {
              if (tab === 'lab') handleSelectAgent('lab');
              else if (tab === 'obstetric') handleSelectAgent('maternal');
              else if (tab === 'fluid') handleSelectAgent('emergency');
              setShowChatbotsBar(true);
            }}
            onExportSummary={handleExportConsultationSummary}
            onShowNotice={showTemporaryNotice}
            isUgandaMOHActive={isUgandaMOHActive}
            onToggleUgandaMOH={() => setIsUgandaMOHActive(!isUgandaMOHActive)}
          />

          {/* RAISED ILLUMINATED CHATBOT TEXT CARD (Clean, Compact, Ergonomic) */}
          <div className={`relative ${effectiveDarkMode ? 'bg-[#071333] sm:bg-[#081842]/98 border-cyan-400/60 shadow-[0_16px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.25)]' : 'bg-white/98 sm:bg-white border-blue-400/80 shadow-xl shadow-blue-500/10'} backdrop-blur-2xl border-2 hover:border-cyan-400 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/30 transition-all overflow-visible`}>
            
            {/* Top Cyan Neon Accent Line */}
            <div className={`absolute -top-[2px] left-6 right-6 h-[2px] ${effectiveDarkMode ? 'bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)]' : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.6)]'} pointer-events-none opacity-100`} />

            {/* Plus Action Popup Menu (opens cleanly above the raised text card) */}
            {showPlusMenu && (
              <div className="fixed inset-0 z-30" onClick={() => setShowPlusMenu(false)} />
            )}
            <AnimatePresence>
              {showPlusMenu && (
                <motion.div
                  key="plus-action-menu-modal"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute left-2 sm:left-4 bottom-full mb-3 w-72 ${effectiveDarkMode ? 'bg-[#09142f] border-slate-700/90 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-2xl'} border rounded-2xl shadow-2xl z-40 p-2 space-y-1 text-left backdrop-blur-xl`}
                >
                  <div className={`px-2.5 py-1.5 border-b ${effectiveDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'} text-[10px] font-bold uppercase tracking-wider`}>
                    Attach & Diagnostic Tools
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlusMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className={`w-full text-left p-2.5 ${effectiveDarkMode ? 'hover:bg-slate-800/80 text-slate-200' : 'hover:bg-slate-100 text-slate-800'} rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer`}
                  >
                    <Camera size={16} className="text-blue-500 shrink-0" />
                    <span>Upload Lab Report / Medical Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPlusMenu(false);
                      toggleSpeechRecognition();
                    }}
                    className={`w-full text-left p-2.5 ${effectiveDarkMode ? 'hover:bg-slate-800/80 text-slate-200' : 'hover:bg-slate-100 text-slate-800'} rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer`}
                  >
                    <Mic size={16} className="text-emerald-500 shrink-0" />
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
                    className={`w-full text-left p-2.5 ${effectiveDarkMode ? 'hover:bg-slate-800/80 text-slate-200' : 'hover:bg-slate-100 text-slate-800'} rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer`}
                  >
                    <Activity size={16} className="text-cyan-500 shrink-0" />
                    <span>Attach Current Bio-Telemetry</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPlusMenu(false);
                      handleSendMessage("🚨 EMERGENCY SOS: The patient has severe difficulty breathing and chest pain. Triage emergency protocols immediately!");
                    }}
                    className="w-full text-left p-2.5 hover:bg-rose-950/60 rounded-xl transition-all flex items-center gap-2.5 text-rose-500 text-xs font-semibold cursor-pointer"
                  >
                    <AlertCircle size={16} className="text-rose-500 shrink-0" />
                    <span>Emergency SOS Dispatch</span>
                  </button>
                </motion.div>
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

            {/* Input Form with Plus Button, High-Contrast Text Input Pill, Mic & Glowing Send Button */}
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
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${effectiveDarkMode ? 'bg-[#0c1c47] hover:bg-[#142c6e] border-cyan-400/60 text-cyan-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-blue-600'} border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-lg active:scale-95`}
                title="Attach clinical photo, document or vitals"
              >
                <Plus size={20} className={showPlusMenu ? 'rotate-45 transition-transform' : 'transition-transform'} />
              </button>

              {/* High-Contrast Pill Input Container */}
              <div className={`flex-1 relative flex items-center ${effectiveDarkMode ? 'bg-[#040c24] border-cyan-400/60 hover:border-cyan-300' : 'bg-slate-100 border-slate-300 hover:border-blue-400'} rounded-full border-2 focus-within:border-cyan-400 px-4 sm:px-5 py-1.5 sm:py-2 transition-all shadow-inner`}>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Type your clinical question or symptom..."
                  className={`w-full bg-transparent text-sm sm:text-base ${effectiveDarkMode ? 'text-white placeholder-slate-300' : 'text-slate-900 placeholder-slate-400'} font-medium focus:outline-hidden py-1`}
                />

                {/* Voice Dictation Mic inside Pill */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2 rounded-full transition-colors cursor-pointer mr-0.5 ${
                    isRecording ? 'text-rose-500 animate-pulse bg-rose-500/20' : (effectiveDarkMode ? 'text-slate-300 hover:text-cyan-300 hover:bg-white/10' : 'text-slate-500 hover:text-blue-600 hover:bg-black/5')
                  }`}
                  title={isRecording ? 'Listening... click to stop' : 'Click to speak'}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>

              {/* Royal Blue / Cyan Gradient Send Button */}
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:via-cyan-400 hover:to-teal-300 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400 dark:disabled:from-slate-800 dark:disabled:via-slate-800 dark:disabled:to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 active:scale-95 transition-all cursor-pointer border border-cyan-300/60"
                title="Send Message"
              >
                <Send size={18} className="translate-x-0.5" />
              </button>
            </form>
          </div>

          {/* High-Legibility Medical Disclaimer */}
          <p className={`text-[10px] sm:text-[11px] text-center ${effectiveDarkMode ? 'text-slate-400/90' : 'text-slate-500'} font-medium tracking-wide`}>
            Doctorian AI provides clinical decision support • In an emergency, call your local medical facility immediately.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 6. SLIDE-OVER SESSIONS HISTORY DRAWER (Old One Feature) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="sidebar-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />
        )}
        {isSidebarOpen && (
          <motion.div
            key="sidebar-drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] ${effectiveDarkMode ? 'bg-[#070e24] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} border-r z-50 flex flex-col shadow-2xl`}
          >
              {/* Drawer Header */}
              <div className={`p-4 border-b ${effectiveDarkMode ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <History size={18} className="text-blue-500" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${effectiveDarkMode ? 'text-white' : 'text-slate-900'}`}>Consultation Sessions</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`p-1.5 rounded-lg ${effectiveDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action: + New Session */}
              <div className={`p-3 border-b ${effectiveDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
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
                          ? 'bg-blue-600/20 border-blue-500 text-blue-600 dark:text-white'
                          : (effectiveDarkMode ? 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300')
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${effectiveDarkMode ? 'text-white' : 'text-slate-900'}`}>{sess.title}</p>
                          <div className={`flex items-center gap-2 mt-1.5 text-[9px] ${effectiveDarkMode ? 'text-slate-400' : 'text-slate-500'} font-mono`}>
                            <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                            <span className={`px-1.5 py-0.5 rounded-md ${effectiveDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
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
      {/* 9. ALL SMART ACTIONS MODAL (Searchable, Categorized, Non-Blocking) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSmartActions && (
          <motion.div
            key="smart-actions-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSmartActions(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-[#071330] border-2 border-cyan-500/50 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[85vh] text-left"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-cyan-900/40 flex items-center justify-between bg-gradient-to-r from-[#091a42] to-[#0b2052]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
                      <Sparkles size={18} className="text-cyan-100" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                          Smart Clinical Actions & Tools
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                          {filteredClinicalActions.length} Actions
                        </span>
                      </div>
                      <p className="text-[11px] text-cyan-300/80">Certified WHO & Uganda MoH Decision Support Suite</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSmartActions(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Instant Search Bar */}
                <div className="p-3 sm:p-3.5 border-b border-slate-800/80 bg-[#050e24]">
                  <div className="relative flex items-center">
                    <Search size={16} className="absolute left-3.5 text-cyan-400" />
                    <input
                      type="text"
                      value={smartActionsSearch}
                      onChange={(e) => setSmartActionsSearch(e.target.value)}
                      placeholder="Search clinical action (e.g. malaria, dose, vitals, soap, reminder, call)..."
                      className="w-full pl-10 pr-9 py-2 bg-[#09173b] border border-cyan-500/30 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden transition-all shadow-inner"
                      autoFocus
                    />
                    {smartActionsSearch && (
                      <button
                        type="button"
                        onClick={() => setSmartActionsSearch('')}
                        className="absolute right-3 text-slate-400 hover:text-white"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categorized Actions Grid */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 custom-scrollbar">
                  {['Diagnostics & Triage', 'Pharmacotherapy & Meds', 'Telehealth & Consultation', 'Bio-Telemetry & Critical Care'].map((category) => {
                    const categoryActions = filteredClinicalActions.filter((a) => a.category === category);
                    if (categoryActions.length === 0) return null;

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">
                            {category}
                          </span>
                          <div className="h-px bg-cyan-900/40 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {categoryActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.id}
                                type="button"
                                onClick={() => {
                                  setShowSmartActions(false);
                                  action.action();
                                }}
                                className="p-3 rounded-2xl bg-gradient-to-br from-[#0c1f4c]/70 to-[#071330]/90 hover:from-[#112d70] hover:to-[#0a1c45] border border-cyan-500/25 hover:border-cyan-400/60 transition-all text-left group cursor-pointer flex items-start gap-3 shadow-md active:scale-98"
                              >
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${action.color} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                                  <Icon size={17} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                                      {action.title}
                                    </h4>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 shrink-0">
                                      {action.badge}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-300/80 mt-0.5 leading-snug line-clamp-2">
                                    {action.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {filteredClinicalActions.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No clinical actions match "{smartActionsSearch}"</p>
                      <button
                        type="button"
                        onClick={() => setSmartActionsSearch('')}
                        className="mt-2 text-xs text-cyan-400 font-bold hover:underline"
                      >
                        Reset search filter
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Advice */}
                <div className="p-3 bg-[#040c1e] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-cyan-300/90 font-medium">
                    <ShieldCheck size={14} className="text-cyan-400" />
                    <span>Evidence-based decision support co-pilot</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSmartActions(false)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
