import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, Lightbulb, Pill, AlertTriangle, HelpCircle, 
  Copy, Check, Volume2, VolumeX, ThumbsUp, ThumbsDown, 
  RotateCcw, Sparkles, Activity, ShieldAlert, ChevronRight,
  CheckCircle2, ArrowRight, ChevronDown, ChevronUp, BrainCircuit
} from 'lucide-react';
import { cleanAiResponse, extractInteractiveSuggestions } from '../utils/cleanAiResponse';

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
}

interface ParsedClinicalSection {
  type: 'assessment' | 'actions' | 'medication' | 'warning' | 'questions' | 'general';
  title: string;
  icon: any;
  titleColor: string;
  textColor: string;
  lines: string[];
}

/**
 * Parses raw AI clinical text into clean open-web medical sections without cards.
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

    // 1. Clinical Assessment / Impression Header
    if (
      (trimmed.startsWith('🩺') || lower.includes('clinical assessment') || lower.includes('clinical overview') || lower.includes('impression:')) &&
      (trimmed.length < 65 || trimmed.endsWith(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'assessment',
        title: trimmed.replace(/^#*\s*🩺?\s*/, '').replace(/:$/, ''),
        icon: Stethoscope,
        titleColor: 'text-cyan-300',
        textColor: 'text-slate-200',
        lines: []
      };
      continue;
    }

    // 2. Recommended Actions & Care Plan Header
    if (
      (trimmed.startsWith('💡') || trimmed.startsWith('📋') || lower.includes('recommended actions') || lower.includes('action plan') || lower.includes('management:') || lower.includes('self-care')) &&
      (trimmed.length < 65 || trimmed.endsWith(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'actions',
        title: trimmed.replace(/^#*\s*[💡📋]?\s*/, '').replace(/:$/, ''),
        icon: Lightbulb,
        titleColor: 'text-emerald-300',
        textColor: 'text-slate-200',
        lines: []
      };
      continue;
    }

    // 3. Medication & Treatment Guidance Header
    if (
      (trimmed.startsWith('💊') || lower.includes('medication & care') || lower.includes('medication guidance') || lower.includes('pharmacotherapy') || lower.includes('prescription')) &&
      (trimmed.length < 65 || trimmed.endsWith(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'medication',
        title: trimmed.replace(/^#*\s*💊?\s*/, '').replace(/:$/, ''),
        icon: Pill,
        titleColor: 'text-indigo-300',
        textColor: 'text-slate-200',
        lines: []
      };
      continue;
    }

    // 4. Warning Signs & Red Flags Header
    if (
      (trimmed.startsWith('⚠️') || trimmed.startsWith('🚨') || lower.includes('warning signs') || lower.includes('emergency red flags') || lower.includes('danger signs') || lower.includes('red flags')) &&
      (trimmed.length < 65 || trimmed.endsWith(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'warning',
        title: trimmed.replace(/^#*\s*[⚠️🚨]?\s*/, '').replace(/:$/, ''),
        icon: AlertTriangle,
        titleColor: 'text-rose-400',
        textColor: 'text-rose-100',
        lines: []
      };
      continue;
    }

    // 5. Follow-Up Diagnostic Questions Header
    if (
      (trimmed.startsWith('❓') || lower.includes('follow-up questions') || lower.includes('diagnostic questions') || lower.includes('interactive follow-up')) &&
      (trimmed.length < 65 || trimmed.endsWith(':'))
    ) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'questions',
        title: trimmed.replace(/^#*\s*❓?\s*/, '').replace(/:$/, ''),
        icon: HelpCircle,
        titleColor: 'text-purple-300',
        textColor: 'text-slate-200',
        lines: []
      };
      continue;
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
    <div className="w-full text-slate-100 space-y-3 pt-0.5 group/bot">
      
      {/* 1. Bot Metadata & Clinical Identity Header */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/40">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs tracking-wide">
            <Sparkles size={13} className="text-cyan-400" />
            <span>Doctorian AI</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            Clinical Co-Pilot • Gemini 3.8-Flash
          </span>
          {isEmergency && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold animate-pulse">
              <ShieldAlert size={11} />
              <span>High Acuity Triage</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span>{msg.timestamp}</span>
        </div>
      </div>

      {/* 2. Open-Web Collapsible Thinking / Reasoning State */}
      {(msg.thoughtDuration || (msg.reasoningSteps && msg.reasoningSteps.length > 0)) && (
        <div className="pt-0.5 pb-1">
          <button
            type="button"
            onClick={() => setShowReasoning(!showReasoning)}
            className="inline-flex items-center gap-2 py-1 px-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800/40 transition-colors group cursor-pointer"
          >
            <BrainCircuit size={13} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>{msg.thoughtDuration ? `Thought for ${msg.thoughtDuration}` : 'Reasoning process'}</span>
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
                <div className="mt-1.5 ml-2 pl-3 border-l-2 border-cyan-500/30 py-1.5 space-y-1.5 text-xs text-slate-400 bg-slate-900/20 rounded-r-lg">
                  {(msg.reasoningSteps && msg.reasoningSteps.length > 0 ? msg.reasoningSteps : [
                    'Thinking & evaluating symptom inquiry',
                    'Configured neural clinical weights and telemetry',
                    'Mapped diagnostic pathways against WHO & Uganda protocols',
                    'Synthesized evidence-based clinical guidance'
                  ]).map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 size={12} className="text-cyan-400 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 3. Plain Open-Web Response Content (NO CARDS HOLDING THE TEXT) */}
      <div className={`space-y-3 relative transition-all ${msg.isStreaming ? 'text-slate-100' : ''}`}>
        {parsedSections.length > 1 ? (
          <div className="space-y-4">
            {parsedSections.map((sec, sIdx) => {
              const Icon = sec.icon;

              return (
                <div key={sIdx} className="space-y-2">
                  {/* Clean Plain Section Header */}
                  {sec.title && (
                    <div className="flex items-center gap-2 pt-1 pb-0.5">
                      <div className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider ${sec.titleColor}`}>
                        <Icon size={14} />
                        <span>{sec.title}</span>
                      </div>
                    </div>
                  )}

                  {/* Plain Content Lines */}
                  <div className="space-y-2 text-[14.5px] sm:text-[15px] leading-relaxed">
                    {sec.lines.map((line, lIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={lIdx} className="h-1" />;

                      // Diagnostic Question line
                      if (trimmed.startsWith('❓') || (trimmed.endsWith('?') && sec.type === 'questions')) {
                        return (
                          <div key={lIdx} className="flex items-start gap-2.5 my-2 text-cyan-200 text-sm font-medium">
                            <span className="shrink-0 text-base">❓</span>
                            <span className="leading-relaxed">{trimmed.replace(/^❓\s*/, '')}</span>
                          </div>
                        );
                      }

                      // Bulleted Item
                      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                        const cleanItem = trimmed.replace(/^[•\-]\s*/, '');
                        return (
                          <div key={lIdx} className="flex items-start gap-2.5 text-slate-200 pl-0.5">
                            <div className="mt-1.5 shrink-0">
                              {sec.type === 'actions' ? (
                                <CheckCircle2 size={13} className="text-emerald-400" />
                              ) : sec.type === 'warning' ? (
                                <AlertTriangle size={13} className="text-rose-400" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                              )}
                            </div>
                            <span className="text-[14px] sm:text-[14.5px] leading-relaxed text-slate-200">
                              {cleanItem}
                            </span>
                          </div>
                        );
                      }

                      // Red-flag warning section callout (minimalist border-left rule, not a card)
                      if (sec.type === 'warning') {
                        return (
                          <div key={lIdx} className="border-l-2 border-rose-500/80 pl-3 py-1 my-1.5 text-rose-200/95 leading-relaxed font-normal">
                            {trimmed}
                          </div>
                        );
                      }

                      // Regular Paragraph
                      return (
                        <p key={lIdx} className="text-slate-200 leading-relaxed font-normal">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>

                  {/* Warning Red-Flag Action Prompt if in warning section */}
                  {sec.type === 'warning' && (
                    <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="text-[11px] text-rose-300/80">
                        If warning symptoms persist, visit the nearest medical facility immediately.
                      </span>
                      <button
                        type="button"
                        onClick={() => onSendPrompt("🚨 I am experiencing severe warning symptoms. What emergency facility steps should I take immediately?")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        <AlertTriangle size={12} />
                        <span>Emergency Triage Steps</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Plain Unboxed Text (Open-Web Style) */
          <div className="space-y-2.5 text-[14.5px] sm:text-[15px] leading-relaxed text-slate-200">
            {cleanedText.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={idx} className="h-1.5" />;

              const isHeader = /^[🩺💊💧🌡️🏥💡⚠️✨📋❓📌🚨🧠🫀🔬]/.test(trimmed) && (
                trimmed.endsWith(':') || 
                trimmed.length < 55 || 
                trimmed.includes('Assessment') || 
                trimmed.includes('Actions') || 
                trimmed.includes('Guidance') || 
                trimmed.includes('Signs')
              );

              if (isHeader) {
                return (
                  <div key={idx} className="mt-3 pt-1 font-bold text-cyan-200 flex items-center gap-2 text-sm sm:text-base tracking-wide">
                    <span>{trimmed}</span>
                  </div>
                );
              }

              if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                return (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-200 pl-1">
                    <span className="text-cyan-400 mt-1 shrink-0 text-xs">●</span>
                    <span className="font-normal text-[14px] sm:text-[14.5px] leading-relaxed">
                      {trimmed.replace(/^[•\-]\s*/, '')}
                    </span>
                  </div>
                );
              }

              if (trimmed.startsWith('❓') || (trimmed.endsWith('?') && (trimmed.toLowerCase().includes('how') || trimmed.toLowerCase().includes('have you') || trimmed.toLowerCase().includes('do you')))) {
                return (
                  <div key={idx} className="flex items-start gap-2 my-2 text-cyan-200 font-medium text-sm">
                    <span className="shrink-0 text-base">❓</span>
                    <span>{trimmed.replace(/^❓\s*/, '')}</span>
                  </div>
                );
              }

              return (
                <p key={idx} className="text-slate-200 font-normal leading-relaxed">
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

    </div>
  );
};
