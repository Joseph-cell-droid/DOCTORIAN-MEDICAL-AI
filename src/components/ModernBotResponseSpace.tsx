import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, Lightbulb, Pill, AlertTriangle, HelpCircle, 
  Copy, Check, Volume2, VolumeX, ThumbsUp, ThumbsDown, 
  RotateCcw, Sparkles, Activity, ShieldAlert, ChevronRight,
  CheckCircle2, ArrowRight, ChevronDown, ChevronUp, BrainCircuit,
  Dna, Clock, ShieldCheck, HeartPulse, Info, FileText
} from 'lucide-react';
import { cleanAiResponse, extractInteractiveSuggestions } from '../utils/cleanAiResponse';
import { MedicalDisclaimer } from './common/MedicalDisclaimer';
import { ClinicalGuidelineEntry } from '../data/ugandaGuidelinesCorpus';

export interface StructuredItem {
  icon: 'pill' | 'thermometer' | 'alert' | 'heart';
  color: 'blue' | 'purple' | 'amber' | 'cyan';
  title: string;
  desc: string;
}

export interface ChatMessage {
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
  citations?: ClinicalGuidelineEntry[];
  outdatedWarnings?: string[];
}

export interface ParsedPrescriptionItem {
  raw: string;
  name: string;
  brand?: string;
  dosage?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  precautions?: string;
}

export interface ParsedClinicalSection {
  type: 'disease' | 'evidence' | 'prescription' | 'actions' | 'warning' | 'questions' | 'general';
  title: string;
  icon: any;
  titleColor: string;
  textColor: string;
  lines: string[];
  prescriptions?: ParsedPrescriptionItem[];
}

/**
 * Parses individual drug prescription lines into structured medication attributes
 */
function parsePrescriptionLine(line: string): ParsedPrescriptionItem {
  const clean = line.replace(/^[•\-\*]\s*/, '').trim();
  if (!clean) return { raw: '', name: '' };

  const pipeParts = clean.split('|').map(p => p.trim());
  if (pipeParts.length >= 2) {
    const firstPart = pipeParts[0];
    let name = firstPart;
    let brand: string | undefined;
    let dosage: string | undefined;

    const brandMatch = firstPart.match(/\(Brand:\s*([^)]+)\)/i) || firstPart.match(/\(([^)]+)\)/);
    if (brandMatch) {
      brand = brandMatch[1].replace(/^Brand:\s*/i, '').trim();
      name = firstPart.replace(/\([^)]+\)/, '').trim();
    }

    if (name.includes(':')) {
      const colonSplit = name.split(':');
      name = colonSplit[0].trim();
      dosage = colonSplit.slice(1).join(':').trim();
    }

    let route: string | undefined;
    let frequency: string | undefined;
    let duration: string | undefined;
    let precautions: string | undefined;

    for (let i = 1; i < pipeParts.length; i++) {
      const part = pipeParts[i];
      const lower = part.toLowerCase();
      if (lower.startsWith('route:')) route = part.replace(/^route:\s*/i, '').trim();
      else if (lower.startsWith('frequency:')) frequency = part.replace(/^frequency:\s*/i, '').trim();
      else if (lower.startsWith('duration:')) duration = part.replace(/^duration:\s*/i, '').trim();
      else if (lower.startsWith('precautions:') || lower.startsWith('precaution:')) precautions = part.replace(/^precautions?:\s*/i, '').trim();
      else if (!dosage && (lower.includes('mg') || lower.includes('tablet') || lower.includes('dose') || lower.includes('capsule'))) dosage = part;
      else if (!frequency && (lower.includes('daily') || lower.includes('hourly') || lower.includes('times') || lower.includes('bd') || lower.includes('tds'))) frequency = part;
      else if (!duration && (lower.includes('day') || lower.includes('week') || lower.includes('month'))) duration = part;
      else if (!precautions) precautions = part;
    }

    return { raw: clean, name, brand, dosage, route, frequency, duration, precautions };
  }

  // Fallback colon format: Drug Name: Dosage, Frequency, Duration
  if (clean.includes(':')) {
    const [namePart, ...rest] = clean.split(':');
    let brand: string | undefined;
    let name = namePart.trim();
    const brandMatch = name.match(/\(Brand:\s*([^)]+)\)/i) || name.match(/\(([^)]+)\)/);
    if (brandMatch) {
      brand = brandMatch[1].replace(/^Brand:\s*/i, '').trim();
      name = name.replace(/\([^)]+\)/, '').trim();
    }
    return {
      raw: clean,
      name,
      brand,
      dosage: rest.join(':').trim()
    };
  }

  return { raw: clean, name: clean };
}

/**
 * Parses raw AI clinical text into structured sections with single suspected disease and drug matrices
 */
function parseClinicalTextIntoSections(rawText: string): ParsedClinicalSection[] {
  const cleaned = cleanAiResponse(rawText);
  if (!cleaned) return [];

  const rawLines = cleaned.split('\n');
  const sections: ParsedClinicalSection[] = [];
  
  let currentSection: ParsedClinicalSection = {
    type: 'general',
    title: '',
    icon: Stethoscope,
    titleColor: 'text-cyan-300',
    textColor: 'text-slate-100',
    lines: []
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentSection.lines.length > 0 && currentSection.lines[currentSection.lines.length - 1] !== '') {
        currentSection.lines.push('');
      }
      continue;
    }

    const lower = trimmed.toLowerCase();

    // 1. SUMMARY / POSSIBLE DIFFERENTIALS (Never presented as a confirmed diagnosis)
    if (
      (trimmed.startsWith('🩺') ||
        /^1\.\s+summary/i.test(trimmed) ||
        /^3\.\s+possible explanations/i.test(trimmed) ||
        lower.includes('possible explanations') ||
        lower.includes('differential diagnoses') ||
        lower.includes('summary of the reported symptoms') ||
        lower.includes('clinical impression')) &&
      (trimmed.length < 95 || trimmed.includes(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'disease',
        title: trimmed.replace(/^#*\s*🩺?\s*/, '').replace(/:$/, '').trim(),
        icon: Stethoscope,
        titleColor: 'text-teal-700 dark:text-teal-300',
        textColor: 'text-slate-800 dark:text-slate-100',
        lines: []
      };
      continue;
    }

    // 2. HISTORY / INVESTIGATIONS / EVIDENCE HEADER
    if (
      (trimmed.startsWith('🧬') ||
        /^2\.\s+relevant information/i.test(trimmed) ||
        /^5\.\s+suggested investigations/i.test(trimmed) ||
        /^9\.\s+evidence sources/i.test(trimmed) ||
        lower.includes('evidence sources') ||
        lower.includes('missing from the history') ||
        lower.includes('suggested investigations')) &&
      (trimmed.length < 95 || trimmed.includes(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'evidence',
        title: trimmed.replace(/^#*\s*🧬?\s*/, '').replace(/:$/, '').trim(),
        icon: Dna,
        titleColor: 'text-sky-700 dark:text-sky-300',
        textColor: 'text-slate-800 dark:text-slate-200',
        lines: []
      };
      continue;
    }

    // 3. MEDICATION INFORMATION HEADER
    if (
      (trimmed.startsWith('💊') ||
        /^7\.\s+medication information/i.test(trimmed) ||
        lower.includes('medication information') ||
        lower.includes('medication suggestions') ||
        lower.includes('pharmacotherapy')) &&
      (trimmed.length < 95 || trimmed.includes(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'prescription',
        title: trimmed.replace(/^#*\s*💊?\s*/, '').replace(/:$/, '').trim(),
        icon: Pill,
        titleColor: 'text-blue-700 dark:text-blue-300',
        textColor: 'text-slate-800 dark:text-slate-200',
        lines: [],
        prescriptions: []
      };
      continue;
    }

    // 4. SUPPORTIVE CARE & RECOMMENDED NEXT STEPS HEADER
    if (
      (trimmed.startsWith('💡') ||
        trimmed.startsWith('📋') ||
        /^4\.\s+clinical urgency/i.test(trimmed) ||
        /^6\.\s+supportive care/i.test(trimmed) ||
        lower.includes('clinical urgency') ||
        lower.includes('supportive care') ||
        lower.includes('recommended next steps')) &&
      (trimmed.length < 95 || trimmed.includes(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'actions',
        title: trimmed.replace(/^#*\s*[💡📋]?\s*/, '').replace(/:$/, '').trim(),
        icon: Lightbulb,
        titleColor: 'text-emerald-700 dark:text-emerald-300',
        textColor: 'text-slate-800 dark:text-slate-200',
        lines: []
      };
      continue;
    }

    // 5. WARNING SIGNS & EMERGENCY RED FLAGS HEADER
    if (
      (trimmed.startsWith('⚠️') ||
        trimmed.startsWith('🚨') ||
        /^8\.\s+emergency warning/i.test(trimmed) ||
        lower.includes('emergency warning signs') ||
        lower.includes('danger signs') ||
        lower.includes('red flags')) &&
      (trimmed.length < 95 || trimmed.includes(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'warning',
        title: trimmed.replace(/^#*\s*[⚠️🚨]?\s*/, '').replace(/:$/, '').trim(),
        icon: AlertTriangle,
        titleColor: 'text-rose-700 dark:text-rose-400',
        textColor: 'text-rose-900 dark:text-rose-100',
        lines: []
      };
      continue;
    }

    // 6. FOLLOW-UP DIAGNOSTIC QUESTIONS HEADER
    if (
      (trimmed.startsWith('❓') || lower.includes('diagnostic follow-up') || lower.includes('follow-up questions') || lower.includes('interactive follow-up')) &&
      (trimmed.length < 85 || trimmed.includes(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'questions',
        title: trimmed.replace(/^#*\s*❓?\s*/, '').replace(/:$/, '').trim(),
        icon: HelpCircle,
        titleColor: 'text-purple-300',
        textColor: 'text-slate-200',
        lines: []
      };
      continue;
    }

    // Process lines in prescription section
    if (currentSection.type === 'prescription' && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.includes('|') || trimmed.includes('mg'))) {
      const parsedMed = parsePrescriptionLine(trimmed);
      if (parsedMed && parsedMed.name) {
        if (!currentSection.prescriptions) currentSection.prescriptions = [];
        currentSection.prescriptions.push(parsedMed);
      }
    }

    // Add line to current section
    currentSection.lines.push(line);
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

export interface ModernBotResponseSpaceProps {
  msg: ChatMessage;
  onSendPrompt: (prompt: string) => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  onRegenerate?: () => void;
}

export const ModernBotResponseSpace: React.FC<ModernBotResponseSpaceProps> = ({
  msg,
  onSendPrompt,
  onSpeak,
  isSpeaking,
  onRegenerate
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [feedbackToast, setFeedbackToast] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const cleanedText = useMemo(() => cleanAiResponse(msg.text), [msg.text]);
  const interactiveSuggestions = useMemo(() => extractInteractiveSuggestions(cleanedText), [cleanedText]);
  const parsedSections = useMemo(() => parseClinicalTextIntoSections(msg.text), [msg.text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(prev => prev === type ? null : type);
    setFeedbackToast(true);
    setTimeout(() => setFeedbackToast(false), 2500);
  };

  // Determine if this is a high-urgency message
  const isEmergency = useMemo(() => {
    const l = cleanedText.toLowerCase();
    return l.includes('emergency') || l.includes('red flag') || l.includes('immediate medical') || l.includes('danger signs') || l.includes('hospital immediately');
  }, [cleanedText]);

  return (
    <div className="w-full text-slate-800 dark:text-slate-100 space-y-3 pt-0.5 group/bot">
      
      {/* 1. Bot Metadata & Clinical Identity Header */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-teal-700 dark:text-cyan-300 font-bold text-xs tracking-wide">
            <Sparkles size={13} className="text-teal-600 dark:text-cyan-400" />
            <span>Doctorian AI</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            Clinical Decision Support
          </span>
          {isEmergency && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
              <ShieldAlert size={11} />
              <span>Urgent Assessment Recommended</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span>{msg.timestamp}</span>
        </div>
      </div>

      {/* 2. Collapsible Reasoning Summary */}
      {(msg.thoughtDuration || (msg.reasoningSteps && msg.reasoningSteps.length > 0)) && (
        <div className="pt-0.5 pb-1">
          <button
            type="button"
            onClick={() => setShowReasoning(!showReasoning)}
            className="inline-flex items-center gap-2 py-1 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
          >
            <BrainCircuit size={13} className="text-teal-600 dark:text-cyan-400" />
            <span>{msg.thoughtDuration ? `Clinical synthesis (${msg.thoughtDuration})` : 'Clinical reasoning steps'}</span>
            {showReasoning ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          
          <AnimatePresence>
            {showReasoning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1.5 ml-2 pl-3 border-l-2 border-teal-500/40 py-1.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-900/20 rounded-r-lg">
                  {(msg.reasoningSteps && msg.reasoningSteps.length > 0 ? msg.reasoningSteps : [
                    'Reviewing reported symptoms, missing history, and vital signs',
                    'Cross-referencing Uganda Clinical Guidelines (UCG) & WHO reference entries',
                    'Listing preliminary differentials alongside emergency red flags for clinician review'
                  ]).map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 size={12} className="text-teal-600 dark:text-cyan-400 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 3. Structured 10-Section Clinical Response Content */}
      <div className="space-y-3.5 relative transition-all">
        {parsedSections.length > 1 ? (
          <div className="space-y-4">
            {parsedSections.map((sec, sIdx) => {
              if (sec.type === 'disease') {
                return (
                  <div key={sIdx} className="rounded-xl p-3.5 sm:p-4 bg-teal-50/70 dark:bg-slate-900/80 border border-teal-200 dark:border-cyan-500/30 shadow-xs space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-2 text-teal-800 dark:text-cyan-300 text-xs font-bold uppercase tracking-wide">
                        <Stethoscope size={15} className="text-teal-600 dark:text-cyan-400 shrink-0" />
                        <span>{sec.title || 'Clinical Summary & Possibilities'}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-teal-600 dark:text-emerald-400" />
                        Not a confirmed diagnosis
                      </span>
                    </div>

                    {sec.lines.length > 0 && (
                      <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-1">
                        {sec.lines.map((l, lIdx) => {
                          const t = l.trim();
                          if (!t) return null;
                          return <p key={lIdx}>{t}</p>;
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // 3.2 EVIDENCE & CAUSE CALLOUT
              if (sec.type === 'evidence') {
                return (
                  <div key={sIdx} className="rounded-xl p-3.5 bg-slate-900/40 border-l-4 border-l-indigo-500 border border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold tracking-wide uppercase">
                      <Dna size={14} className="text-indigo-400" />
                      <span>{sec.title || "Evidence & Pathophysiological Cause"}</span>
                    </div>
                    <div className="text-[14px] leading-relaxed text-slate-300 space-y-1.5">
                      {sec.lines.map((l, lIdx) => {
                        const t = l.trim();
                        if (!t) return null;
                        if (t.startsWith('•') || t.startsWith('-')) {
                          return (
                            <div key={lIdx} className="flex items-start gap-2 pl-1">
                              <span className="text-indigo-400 mt-1 shrink-0 text-xs">●</span>
                              <span>{t.replace(/^[•\-]\s*/, '')}</span>
                            </div>
                          );
                        }
                        return <p key={lIdx}>{t}</p>;
                      })}
                    </div>
                  </div>
                );
              }

              // 3.3 ACCURATE DRUG PRESCRIPTIONS MATRIX
              if (sec.type === 'prescription') {
                const prescriptionsList = sec.prescriptions && sec.prescriptions.length > 0 
                  ? sec.prescriptions 
                  : sec.lines.map(l => parsePrescriptionLine(l)).filter(p => p && p.name);

                return (
                  <div key={sIdx} className="rounded-xl p-3.5 sm:p-4 bg-slate-900/60 border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800/60 pb-2">
                      <div className="flex items-center gap-2 text-blue-300 text-xs font-bold tracking-wide uppercase">
                        <Pill size={15} className="text-blue-400" />
                        <span>{sec.title || "Accurate Drug Prescriptions"}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-[11px] font-mono">
                        {prescriptionsList.length} Guideline Medication{prescriptionsList.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {prescriptionsList.map((med, mIdx) => (
                        <div key={mIdx} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/40 transition-colors space-y-2">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-md bg-blue-500/20 text-blue-300 shrink-0">
                                <Pill size={14} />
                              </span>
                              <div>
                                <span className="font-semibold text-white text-sm">
                                  {med.name}
                                </span>
                                {med.brand && (
                                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                                    Brand: {med.brand}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Prescribed details badges */}
                          <div className="flex flex-wrap gap-1.5 text-xs">
                            {med.dosage && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-200 text-[11px]">
                                <Activity size={10} className="text-cyan-400" />
                                <span>{med.dosage}</span>
                              </span>
                            )}
                            {med.route && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-200 text-[11px]">
                                <span>Route: {med.route}</span>
                              </span>
                            )}
                            {med.frequency && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-200 text-[11px]">
                                <Clock size={10} className="text-emerald-400" />
                                <span>{med.frequency}</span>
                              </span>
                            )}
                            {med.duration && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-200 text-[11px]">
                                <span>Course: {med.duration}</span>
                              </span>
                            )}
                          </div>

                          {med.precautions && (
                            <div className="pt-1 text-[11px] text-amber-300/90 flex items-start gap-1.5 bg-amber-950/20 p-1.5 rounded border border-amber-500/20">
                              <Info size={12} className="text-amber-400 shrink-0 mt-0.5" />
                              <span>{med.precautions}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 3.4 CLINICAL ADVICE & CARE
              if (sec.type === 'actions') {
                return (
                  <div key={sIdx} className="rounded-xl p-3.5 bg-slate-900/50 border border-emerald-500/25 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold tracking-wide uppercase">
                      <Lightbulb size={14} className="text-emerald-400" />
                      <span>{sec.title || "Clinical Advice & Supportive Care"}</span>
                    </div>
                    <div className="space-y-1.5 text-[14px] text-slate-200 leading-relaxed">
                      {sec.lines.map((l, lIdx) => {
                        const t = l.trim();
                        if (!t) return null;
                        return (
                          <div key={lIdx} className="flex items-start gap-2.5 pl-0.5">
                            <CheckCircle2 size={14} className="text-emerald-400 mt-1 shrink-0" />
                            <span>{t.replace(/^[•\-]\s*/, '')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // 3.5 EMERGENCY RED FLAGS
              if (sec.type === 'warning') {
                return (
                  <div key={sIdx} className="rounded-xl p-3.5 bg-rose-950/30 border border-rose-500/40 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-rose-300 text-xs font-bold tracking-wide uppercase">
                        <AlertTriangle size={15} className="text-rose-400 animate-pulse" />
                        <span>{sec.title || "Emergency Red Flags"}</span>
                      </div>
                      <span className="text-[10px] text-rose-300 bg-rose-900/40 px-2 py-0.5 rounded font-mono">
                        Immediate Hospital Escalation
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[14px] text-rose-100/90 leading-relaxed">
                      {sec.lines.map((l, lIdx) => {
                        const t = l.trim();
                        if (!t) return null;
                        return (
                          <div key={lIdx} className="flex items-start gap-2 pl-0.5">
                            <span className="text-rose-400 font-bold shrink-0">⚠️</span>
                            <span>{t.replace(/^[•\-⚠️🚨]\s*/, '')}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="text-[11px] text-rose-300/80">
                        If danger signs persist, present to the nearest Regional Referral Hospital.
                      </span>
                      <button
                        type="button"
                        onClick={() => onSendPrompt("🚨 I am experiencing emergency warning symptoms. What triage steps should I take immediately?")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        <AlertTriangle size={12} />
                        <span>Emergency Triage Steps</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              }

              // 3.6 DIAGNOSTIC FOLLOW-UP QUESTIONS
              if (sec.type === 'questions') {
                return (
                  <div key={sIdx} className="p-3 rounded-lg bg-slate-900/30 border border-purple-500/20 space-y-1.5">
                    <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase">
                      <HelpCircle size={13} className="text-purple-400" />
                      <span>{sec.title || "Diagnostic Follow-Up"}</span>
                    </div>
                    <div className="space-y-1 text-sm text-cyan-200 font-medium">
                      {sec.lines.map((l, lIdx) => {
                        const t = l.trim();
                        if (!t) return null;
                        return (
                          <div key={lIdx} className="flex items-start gap-2">
                            <span className="text-purple-400">❓</span>
                            <span>{t.replace(/^❓\s*/, '')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // 3.7 GENERAL SECTION
              return (
                <div key={sIdx} className="space-y-2 text-[14.5px] leading-relaxed text-slate-200">
                  {sec.lines.map((line, lIdx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={lIdx} className="h-1" />;
                    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-2.5 pl-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 inline-block" />
                          <span>{trimmed.replace(/^[•\-]\s*/, '')}</span>
                        </div>
                      );
                    }
                    return <p key={lIdx}>{trimmed}</p>;
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          /* Plain Open-Web Text Style */
          <div className="space-y-2.5 text-[14.5px] sm:text-[15px] leading-relaxed text-slate-800 dark:text-slate-200">
            {cleanedText.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={idx} className="h-1.5" />;

              // Clinical section header line
              if (/^[🩺🧬💊💡⚠️❓🚨📋📌]/.test(trimmed)) {
                return (
                  <div key={idx} className="pt-2 font-bold text-cyan-300 dark:text-cyan-300 text-sm flex items-center gap-1.5">
                    <span>{trimmed}</span>
                  </div>
                );
              }

              if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                return (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 pl-1">
                    <span className="text-blue-600 dark:text-cyan-400 mt-1 shrink-0 text-xs">●</span>
                    <span className="font-normal text-[14px] sm:text-[14.5px] leading-relaxed">
                      {trimmed.replace(/^[•\-]\s*/, '')}
                    </span>
                  </div>
                );
              }

              if (trimmed.startsWith('❓') || (trimmed.endsWith('?') && (trimmed.toLowerCase().includes('how') || trimmed.toLowerCase().includes('have you') || trimmed.toLowerCase().includes('do you')))) {
                return (
                  <div key={idx} className="flex items-start gap-2 my-2 text-blue-700 dark:text-cyan-200 font-medium text-sm">
                    <span className="shrink-0 text-base">❓</span>
                    <span>{trimmed.replace(/^❓\s*/, '')}</span>
                  </div>
                );
              }

              return (
                <p key={idx} className="text-slate-800 dark:text-slate-200 font-normal leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>
        )}

        {/* Streaming Cursor while generating from background */}
        {msg.isStreaming && (
          <span className="inline-block w-2 h-4.5 ml-1 bg-cyan-400 animate-pulse align-middle rounded-xs shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        )}
      </div>

      {/* 4. Interactive Quick-Response Follow-up Chips (One-Tap Replies) */}
      {!msg.isStreaming && interactiveSuggestions.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium px-0.5">
            <Sparkles size={12} className="text-cyan-400" />
            <span>Interactive Diagnostic Answers (Tap to respond):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {interactiveSuggestions.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => onSendPrompt(suggestion)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-cyan-200 hover:text-white border border-slate-700/70 hover:border-cyan-400 transition-all cursor-pointer shadow-xs active:scale-95 text-left group"
              >
                <span>{suggestion}</span>
                <ChevronRight size={12} className="text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Minimalist Action Controls Toolbar on Plain Page Background */}
      {!msg.isStreaming && (
        <div className="flex items-center gap-1.5 pt-2 text-slate-400 text-xs flex-wrap">
          {/* Copy Note */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all cursor-pointer text-[11px] font-medium"
            title="Copy clinical response"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Listen / Voice Reading with Waveform Animation */}
          <button
            type="button"
            onClick={() => onSpeak(cleanedText)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-[11px] font-medium ${
              isSpeaking 
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-xs' 
                : 'hover:text-white hover:bg-slate-800/60 border-transparent hover:border-slate-700/60'
            }`}
            title={isSpeaking ? "Stop voice narration" : "Listen to audio consultation"}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={13} className="text-cyan-400 animate-pulse" />
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-cyan-400 animate-pulse" />
                  <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-3.5 bg-cyan-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                  <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse" style={{ animationDelay: '450ms' }} />
                </div>
                <span>Reading</span>
              </>
            ) : (
              <>
                <Volume2 size={13} />
                <span>Listen</span>
              </>
            )}
          </button>

          {/* Regenerate Response */}
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all cursor-pointer text-[11px] font-medium"
              title="Regenerate clinical opinion"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          {/* Thumbs Up / Down Feedback */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={() => handleFeedback('up')}
              className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer ${
                feedback === 'up' ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400'
              }`}
              title="Helpful clinical response"
            >
              <ThumbsUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleFeedback('down')}
              className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer ${
                feedback === 'down' ? 'text-rose-400 bg-rose-500/20' : 'text-slate-400'
              }`}
              title="Needs improvement"
            >
              <ThumbsDown size={13} />
            </button>
          </div>

          {/* Feedback Micro-Toast */}
          <AnimatePresence>
            {feedbackToast && (
              <motion.span
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 ml-1"
              >
                Thank you for clinical feedback
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 6. Evidence Citations (WHO / Uganda Clinical Guidelines) */}
      {!msg.isStreaming && msg.citations && msg.citations.length > 0 && (
        <div className="rounded-xl p-3 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <FileText size={13} className="text-teal-600 dark:text-cyan-400" />
            <span>Referenced Clinical Guidelines ({msg.citations.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {msg.citations.map((cit) => (
              <div
                key={cit.id}
                className={`px-2.5 py-1.5 rounded-lg border text-xs ${
                  cit.isOutdated
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5 flex-wrap">
                  <span>{cit.title}</span>
                  {cit.isOutdated && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-200/70 dark:bg-amber-900 text-[10px] font-bold">
                      Outdated — Needs Review
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {cit.sourceOrg} • {cit.version} • Published {cit.publicationDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Medical Disclaimer */}
      {!msg.isStreaming && (
        <MedicalDisclaimer variant="inline" className="mt-3" />
      )}

    </div>
  );
};
