import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Heart, Activity, Pill, FileText, AlertCircle, 
  ChevronDown, ChevronUp, Search, X, Check, Copy, 
  Phone, Stethoscope, Baby, Calculator, Zap, ShieldCheck,
  Thermometer, ArrowRight, CornerDownLeft, RefreshCw, EyeOff
} from 'lucide-react';

export interface SmartActionCardProps {
  arduino?: any;
  messages: Array<{ id: string; sender: 'bot' | 'user'; text: string; timestamp: string }>;
  onSendMessage: (text: string) => void;
  onNavigate?: (view: any) => void;
  onOpenVoiceCall: () => void;
  onOpenToolHub: (tab?: 'lab' | 'obstetric' | 'fluid' | 'soap') => void;
  onExportSummary: () => void;
  onShowNotice: (msg: string) => void;
  isUgandaMOHActive: boolean;
  onToggleUgandaMOH: () => void;
}

export interface ClinicalAction {
  id: string;
  category: 'triage' | 'meds' | 'lab' | 'clinical';
  title: string;
  desc: string;
  icon: any;
  badge: string;
  badgeColor: string;
  action: () => void;
  highlight?: boolean;
}

export const SmartActionCard: React.FC<SmartActionCardProps> = ({
  arduino,
  messages,
  onSendMessage,
  onNavigate,
  onOpenVoiceCall,
  onOpenToolHub,
  onExportSummary,
  onShowNotice,
  isUgandaMOHActive,
  onToggleUgandaMOH,
}) => {
  // Minimized state stored in localStorage
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('doctorian_smart_card_minimized') === 'true';
    } catch {
      return false;
    }
  });

  // Floating Deck Popover open state
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'triage' | 'meds' | 'lab' | 'clinical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Dose Calculator Mini-Modal state inside Smart Card
  const [showDoseCalc, setShowDoseCalc] = useState(false);
  const [patientWeight, setPatientWeight] = useState('20');
  const [selectedMed, setSelectedMed] = useState<'coartem' | 'paracetamol' | 'amoxicillin' | 'ors'>('paracetamol');
  const [calculatedDose, setCalculatedDose] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close floating deck on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsDeckOpen(false);
      }
    };
    if (isDeckOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDeckOpen]);

  // Persist minimized state
  const toggleMinimized = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('doctorian_smart_card_minimized', String(next));
      } catch {}
      return next;
    });
  };

  // Sensor telemetry values
  const hr = arduino?.heartRate || 72;
  const spo2 = arduino?.spo2 || 98;
  const temp = arduino?.temperature || 36.8;

  // Real-time NLP Context Analysis of the conversation
  const clinicalContext = useMemo(() => {
    const textCorpus = messages.map((m) => m.text.toLowerCase()).join(' ');
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text.toLowerCase() || '';

    const hasFever = textCorpus.includes('fever') || textCorpus.includes('temp') || textCorpus.includes('chills') || textCorpus.includes('sweat') || temp >= 38.0;
    const hasMalaria = textCorpus.includes('malaria') || textCorpus.includes('coartem') || textCorpus.includes('rdt') || (hasFever && textCorpus.includes('headache'));
    const hasChestPain = textCorpus.includes('chest pain') || textCorpus.includes('angina') || textCorpus.includes('tightness') || textCorpus.includes('breath');
    const hasTachycardia = hr > 100;
    const hasHypoxia = spo2 < 95;
    const hasMeds = textCorpus.includes('dose') || textCorpus.includes('mg') || textCorpus.includes('medication') || textCorpus.includes('tablet') || textCorpus.includes('prescription') || textCorpus.includes('antibiotic');
    const hasPregnancy = textCorpus.includes('pregnant') || textCorpus.includes('trimester') || textCorpus.includes('gestation') || textCorpus.includes('baby') || textCorpus.includes('infant');
    const hasEmergency = textCorpus.includes('emergency') || textCorpus.includes('severe') || textCorpus.includes('unconscious') || textCorpus.includes('convulsion') || hasChestPain || (spo2 < 90);

    return {
      hasFever,
      hasMalaria,
      hasChestPain,
      hasTachycardia,
      hasHypoxia,
      hasMeds,
      hasPregnancy,
      hasEmergency,
      lastUserMsg,
    };
  }, [messages, hr, spo2, temp]);

  // Dynamically compute the Single Best Smart Action (The AI's immediate suggestion)
  const dynamicSmartAction = useMemo(() => {
    if (clinicalContext.hasEmergency || clinicalContext.hasChestPain || clinicalContext.hasHypoxia) {
      return {
        id: 'sos-triage',
        label: clinicalContext.hasHypoxia 
          ? `⚠️ Hypoxia Alert (SpO2 ${spo2}%) • Assess Airway`
          : '🚨 Emergency Triage Protocol (Red Flags)',
        color: 'from-rose-600 to-red-600',
        borderColor: 'border-rose-400/60',
        textColor: 'text-rose-200',
        badge: 'Critical Acuity',
        action: () => onSendMessage(`🚨 URGENT CLINICAL TRIAGE: The patient exhibits critical warning signs (Heart Rate: ${hr} bpm, SpO2: ${spo2}%, Temp: ${temp}°C). Initiate emergency clinical stabilization protocol under Uganda Clinical Guidelines.`),
      };
    }

    if (clinicalContext.hasTachycardia) {
      return {
        id: 'tachy-triage',
        label: `💓 Tachycardia Alert (${hr} bpm) • Assess Rhythm`,
        color: 'from-amber-600 to-orange-600',
        borderColor: 'border-amber-400/60',
        textColor: 'text-amber-200',
        badge: 'Bio-Telemetry',
        action: () => onSendMessage(`Analyze my elevated heart rate telemetry (${hr} bpm, SpO2: ${spo2}%, Temp: ${temp}°C). What are the differential causes (fever, dehydration, arrhythmia, anxiety) and recommended clinical next steps?`),
      };
    }

    if (clinicalContext.hasMalaria || clinicalContext.hasFever) {
      return {
        id: 'malaria-protocol',
        label: '🌡️ Fever & Malaria RDT Workup (UCG 2026)',
        color: 'from-amber-600 to-yellow-600',
        borderColor: 'border-amber-400/60',
        textColor: 'text-amber-200',
        badge: 'MoH Protocol',
        action: () => onSendMessage(`Based on the symptoms of fever and chills, provide the full clinical workup protocol: Malaria Rapid Diagnostic Test (mRDT), CBC differential, and weight-based Artemether-Lumefantrine (AL) dosing per Uganda Clinical Guidelines.`),
      };
    }

    if (clinicalContext.hasMeds) {
      return {
        id: 'drug-safety',
        label: '💊 Verify Drug Interaction & Dose Schedule',
        color: 'from-indigo-600 to-purple-600',
        borderColor: 'border-indigo-400/60',
        textColor: 'text-indigo-200',
        badge: 'Pharmacology',
        action: () => onSendMessage(`Please review the medications discussed: verify contraindications, renal/hepatic dose adjustments, potential adverse interactions, and proper administration timing.`),
      };
    }

    if (clinicalContext.hasPregnancy) {
      return {
        id: 'maternal-triage',
        label: '👶 Maternal Pre-eclampsia & Danger Screening',
        color: 'from-pink-600 to-purple-600',
        borderColor: 'border-pink-400/60',
        textColor: 'text-pink-200',
        badge: 'Maternal ANC',
        action: () => onSendMessage(`Screen for critical maternal danger signs: assess pre-eclampsia indicators (headache, epigastric pain, visual disturbance, proteinuria), fetal movements, and danger signs requiring immediate obstetric referral.`),
      };
    }

    // Default Smart Suggestion
    if (messages.length > 2) {
      return {
        id: 'soap-generation',
        label: '📝 Formulate Clinical SOAP Note',
        color: 'from-blue-600 to-cyan-600',
        borderColor: 'border-cyan-400/60',
        textColor: 'text-cyan-200',
        badge: 'Documentation',
        action: () => onSendMessage(`Formulate a structured clinical SOAP Note (Subjective, Objective, Assessment, Plan) summarizing all symptoms, telemetry findings, differential diagnoses, and evidence-based management recommendations.`),
      };
    }

    return {
      id: 'vitals-analysis',
      label: `💓 Evaluate Live Telemetry (${hr} bpm • ${spo2}% SpO2)`,
      color: 'from-cyan-600 to-blue-600',
      borderColor: 'border-cyan-400/60',
      textColor: 'text-cyan-200',
      badge: 'Live Telemetry',
      action: () => onSendMessage(`Evaluate my live biometric telemetry: Heart Rate is ${hr} bpm, SpO2 is ${spo2}%, Core Temperature is ${temp}°C. Provide a clinical risk stratification and normal range verification.`),
    };
  }, [clinicalContext, hr, spo2, temp, messages.length, onSendMessage]);

  // Comprehensive catalog of all smart clinical actions
  const allActions: ClinicalAction[] = useMemo(() => [
    {
      id: 'vitals-eval',
      category: 'triage',
      title: 'Analyze Live Telemetry',
      desc: `Evaluate real-time biometric stream (${hr} bpm, ${spo2}% SpO2, ${temp}°C)`,
      icon: Heart,
      badge: 'Telemetry',
      badgeColor: 'text-rose-300 bg-rose-500/20 border-rose-500/40',
      highlight: clinicalContext.hasTachycardia || clinicalContext.hasHypoxia,
      action: () => {
        onSendMessage(`Evaluate my current live biometric sensor snapshot: Heart Rate: ${hr} bpm, Blood Oxygen: ${spo2}%, Temperature: ${temp}°C. Give clinical interpretation and risk classification.`);
        onShowNotice("Analyzing biometric vitals...");
      }
    },
    {
      id: 'malaria-ucg',
      category: 'triage',
      title: 'Malaria & Fever Triage',
      desc: 'WHO & Uganda MoH Artemether-Lumefantrine (AL) protocol',
      icon: Thermometer,
      badge: 'MoH Certified',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      highlight: clinicalContext.hasFever || clinicalContext.hasMalaria,
      action: () => {
        onSendMessage(`Provide the full clinical protocol for fever and suspected malaria under Uganda Clinical Guidelines (UCG 2026): mRDT diagnostic criteria, Coartem weight-based regimen, and red flags.`);
        onShowNotice("Loading Uganda MoH Malaria Protocol...");
      }
    },
    {
      id: 'soap-note',
      category: 'clinical',
      title: 'Generate SOAP Note',
      desc: 'Full clinical Subjective, Objective, Assessment & Plan documentation',
      icon: FileText,
      badge: 'EHR Export',
      badgeColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
      action: () => {
        onSendMessage(`Please generate a standardized clinical SOAP Note (Subjective, Objective, Assessment, Plan) summarizing our consultation for patient EHR medical records.`);
        onShowNotice("Generating structured clinical SOAP note...");
      }
    },
    {
      id: 'dose-calc',
      category: 'meds',
      title: 'Rapid Dose Calculator',
      desc: 'Pediatric & adult weight-based dosing for common essential medicines',
      icon: Calculator,
      badge: 'Pharmacology',
      badgeColor: 'text-indigo-300 bg-indigo-500/20 border-indigo-500/40',
      action: () => {
        setShowDoseCalc(true);
        setIsDeckOpen(false);
      }
    },
    {
      id: 'drug-review',
      category: 'meds',
      title: 'Drug Safety & Interactions',
      desc: 'Check contraindications, hepatic/renal cautions, and interactions',
      icon: Pill,
      badge: 'Rx Safety',
      badgeColor: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
      action: () => {
        onSendMessage(`Please evaluate drug safety profiles, renal and hepatic dose adjustments, and contraindications for the medications discussed.`);
        onShowNotice("Checking pharmacotherapy safety...");
      }
    },
    {
      id: 'lab-eval',
      category: 'lab',
      title: 'Lab Test Analyzer',
      desc: 'Evaluate CBC, malaria RDT, blood glucose, and urinalysis biomarkers',
      icon: Activity,
      badge: 'Diagnostics',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
      action: () => {
        onOpenToolHub('lab');
        onShowNotice("Opening Diagnostic Lab Analyzer...");
      }
    },
    {
      id: 'pre-eclampsia',
      category: 'triage',
      title: 'Pre-eclampsia & Maternal Risk',
      desc: 'Obstetric blood pressure triage, proteinuria & danger signs screening',
      icon: Baby,
      badge: 'Maternal Care',
      badgeColor: 'text-pink-300 bg-pink-500/20 border-pink-500/40',
      action: () => {
        onOpenToolHub('obstetric');
        onShowNotice("Opening Obstetric Risk Engine...");
      }
    },
    {
      id: 'fluid-resus',
      category: 'triage',
      title: 'Fluid Resuscitation Calculator',
      desc: 'Dehydration severity & WHO IV Ringer’s Lactate infusion regimen',
      icon: Zap,
      badge: 'Resuscitation',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      action: () => {
        onOpenToolHub('fluid');
        onShowNotice("Opening Infusion Calculator...");
      }
    },
    {
      id: 'voice-telehealth',
      category: 'clinical',
      title: 'Doctorian Voice Call',
      desc: 'Initiate direct telehealth clinical consultation with senior physician',
      icon: Phone,
      badge: 'Live Audio',
      badgeColor: 'text-teal-300 bg-teal-500/20 border-teal-500/40',
      action: () => {
        onOpenVoiceCall();
      }
    },
    {
      id: 'export-report',
      category: 'clinical',
      title: 'Export Consultation Report',
      desc: 'Copy complete SOAP transcript and biometric report to clipboard',
      icon: Copy,
      badge: 'Report',
      badgeColor: 'text-blue-300 bg-blue-500/20 border-blue-500/40',
      action: () => {
        onExportSummary();
      }
    },
    {
      id: 'emergency-sos',
      category: 'triage',
      title: 'Emergency SOS Dispatch',
      desc: 'Immediate emergency protocol activation & ambulance triage guidance',
      icon: AlertCircle,
      badge: 'Critical SOS',
      badgeColor: 'text-rose-300 bg-rose-600/30 border-rose-500/60',
      action: () => {
        onSendMessage(`🚨 EMERGENCY SOS ACTIVATION: Severe acute medical event reported. What are the immediate life-support steps, emergency facility triage, and ambulance dispatch procedures?`);
        onShowNotice("🚨 Emergency protocol activated!");
      }
    }
  ], [hr, spo2, temp, clinicalContext, onSendMessage, onShowNotice, onOpenToolHub, onOpenVoiceCall, onExportSummary]);

  // Filter actions based on search query and category tab
  const filteredActions = useMemo(() => {
    return allActions.filter((a) => {
      const matchesTab = activeTab === 'all' || a.category === activeTab;
      if (!searchQuery.trim()) return matchesTab;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        a.title.toLowerCase().includes(q) || 
        a.desc.toLowerCase().includes(q) || 
        a.badge.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [allActions, activeTab, searchQuery]);

  // Calculate rapid medication dosage
  const handleCalculateDose = () => {
    const wt = parseFloat(patientWeight) || 20;
    let res = '';
    if (selectedMed === 'paracetamol') {
      const doseMg = Math.round(wt * 15);
      res = `Paracetamol for ${wt}kg patient: ${doseMg}mg orally every 4–6 hours as needed (Max ${Math.round(wt * 60)}mg/day). For 120mg/5ml syrup: ${(doseMg / 24).toFixed(1)}ml per dose.`;
    } else if (selectedMed === 'coartem') {
      if (wt < 5) res = `Coartem not recommended under 5kg without specialist review.`;
      else if (wt < 15) res = `Coartem for ${wt}kg (5–14kg): 1 tablet (20mg/120mg) twice daily for 3 days (Total 6 tablets). Take with fatty meal or milk.`;
      else if (wt < 25) res = `Coartem for ${wt}kg (15–24kg): 2 tablets twice daily for 3 days (Total 12 tablets).`;
      else if (wt < 35) res = `Coartem for ${wt}kg (25–34kg): 3 tablets twice daily for 3 days (Total 18 tablets).`;
      else res = `Coartem for ${wt}kg (≥35kg/Adult): 4 tablets twice daily for 3 days (Total 24 tablets).`;
    } else if (selectedMed === 'amoxicillin') {
      const doseMg = Math.round(wt * 25);
      res = `Amoxicillin for ${wt}kg patient (Pneumonia/Bacterial): ${doseMg}mg orally every 8 hours for 5 days. For 250mg/5ml suspension: ${(doseMg / 50).toFixed(1)}ml per dose.`;
    } else {
      const orsMl = Math.round(wt * 75);
      res = `WHO ORS Rehydration for ${wt}kg patient: Administer ${orsMl}ml of clean prepared ORS solution over 4 hours under clinical observation.`;
    }
    setCalculatedDose(res);
  };

  return (
    <div className="relative w-full select-none" ref={popoverRef}>
      
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. ULTRA-COMPACT SMART ACTION BAR (Never Blocks Features)   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-2xl bg-[#071330]/90 border border-cyan-500/30 backdrop-blur-xl shadow-md transition-all">
        
        {/* Left: Dynamic AI Context Smart Action Pill (1-Tap Execution) */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
          
          {/* Smart Suggestion Pill with Pulsing Glow */}
          <button
            type="button"
            onClick={() => {
              dynamicSmartAction.action();
              onShowNotice(`Executing: ${dynamicSmartAction.label}`);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-gradient-to-r ${dynamicSmartAction.color} ${dynamicSmartAction.textColor} border ${dynamicSmartAction.borderColor} shadow-xs hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer group`}
            title="Click to execute AI's top clinical suggestion"
          >
            <Sparkles size={12} className="text-white animate-pulse group-hover:rotate-12 transition-transform" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{dynamicSmartAction.label}</span>
            <ArrowRight size={11} className="text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Real-time Hardware Telemetry Micro-Pill */}
          <button
            type="button"
            onClick={() => {
              onSendMessage(`Analyze live hardware telemetry: Heart Rate is ${hr} bpm, SpO2 is ${spo2}%, Core Temperature is ${temp}°C. Interpret clinical normal ranges.`);
              onShowNotice("Vitals telemetry sent to Doctorian AI");
            }}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-400/60 text-[10.5px] font-mono text-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs group"
            title="Send live sensor telemetry snapshot to AI"
          >
            <Heart size={11} className={`text-rose-400 ${hr > 100 ? 'animate-ping' : 'animate-pulse'} group-hover:scale-110 transition-transform`} />
            <span className="font-bold text-white">{hr} <span className="text-[9px] font-normal text-slate-400">bpm</span></span>
            <span className="text-slate-500 hidden xs:inline">•</span>
            <span className="font-bold text-cyan-300 hidden xs:inline">{spo2}% <span className="text-[9px] font-normal text-slate-400">SpO2</span></span>
          </button>

          {/* Quick Micro-Tool: Rapid Dose Mini-Trigger */}
          <button
            type="button"
            onClick={() => setShowDoseCalc(true)}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-200 hover:text-white text-[10.5px] font-semibold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
            title="Open Rapid Medication Dosing Calculator"
          >
            <Calculator size={11} className="text-indigo-400" />
            <span>Dose Calc</span>
          </button>

          {/* Quick Micro-Tool: SOAP Note */}
          <button
            type="button"
            onClick={() => {
              onSendMessage("Please formulate a complete clinical SOAP Note (Subjective, Objective, Assessment, Plan) based on this consultation.");
              onShowNotice("Formulating clinical SOAP note...");
            }}
            className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 hover:text-white text-[10.5px] font-semibold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
            title="Generate EHR SOAP Note"
          >
            <FileText size={11} className="text-cyan-400" />
            <span>SOAP</span>
          </button>

          {/* Quick Micro-Tool: Emergency SOS */}
          <button
            type="button"
            onClick={() => {
              onSendMessage("🚨 EMERGENCY SOS ACTIVATION: Severe acute medical event reported. What are the immediate life-support steps, emergency facility triage, and ambulance dispatch procedures?");
              onShowNotice("🚨 Emergency protocol activated!");
            }}
            className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 hover:text-rose-100 text-[10.5px] font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
            title="Emergency SOS Dispatch"
          >
            <AlertCircle size={11} className="text-rose-400 animate-pulse" />
            <span>SOS</span>
          </button>
        </div>

        {/* Right: Expandable All Tools Launcher & Minimize Toggle */}
        <div className="flex items-center gap-1 shrink-0 pl-1">
          {/* Deck Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDeckOpen(!isDeckOpen)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
              isDeckOpen
                ? 'bg-cyan-500 text-slate-950 border border-cyan-300 shadow-cyan-500/30'
                : 'bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/50 text-cyan-200 hover:text-white'
            }`}
            title="Open all clinical smart actions & tools"
          >
            <Zap size={11} className={isDeckOpen ? 'text-slate-950' : 'text-cyan-400'} />
            <span>Tools</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-950/40 font-mono">
              {allActions.length}
            </span>
            <ChevronUp size={11} className={`transform transition-transform ${isDeckOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. FLOATING SMART ACTIONS DECK (POPOVER - Non-Blocking)      */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDeckOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-[#06122d]/98 border-2 border-cyan-500/40 rounded-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.25)] backdrop-blur-2xl z-40 overflow-hidden flex flex-col max-h-[380px]"
          >
            {/* Popover Header */}
            <div className="p-3 border-b border-cyan-900/40 flex items-center justify-between bg-gradient-to-r from-[#091a42] to-[#071536]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles size={14} className="text-cyan-200" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span>Clinical Smart Actions</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">
                      WHO & UCG 2026
                    </span>
                  </h4>
                  <p className="text-[10px] text-cyan-300/80">Non-blocking intelligent decision support</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDeckOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Tools Deck"
              >
                <X size={16} />
              </button>
            </div>

            {/* Instant Filter Search Bar */}
            <div className="p-2 border-b border-slate-800/80 bg-[#050e24] flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search size={14} className="absolute left-2.5 text-cyan-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools (e.g. malaria, dose, vitals, soap, pre-eclampsia)..."
                  className="w-full pl-8 pr-7 py-1.5 bg-[#09173b] border border-cyan-500/30 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden transition-all shadow-inner"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'triage', label: 'Triage' },
                  { id: 'meds', label: 'Meds' },
                  { id: 'lab', label: 'Labs' },
                  { id: 'clinical', label: 'Clinical' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1.5 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => {
                        setIsDeckOpen(false);
                        action.action();
                      }}
                      className={`p-2.5 rounded-xl border text-left group cursor-pointer flex items-start gap-2.5 transition-all shadow-xs active:scale-98 ${
                        action.highlight
                          ? 'bg-gradient-to-br from-[#12285e] to-[#0a183a] border-cyan-400/60 hover:border-cyan-300'
                          : 'bg-[#081738]/70 hover:bg-[#0d214f]/90 border-slate-700/60 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                            {action.title}
                          </h5>
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded-md border shrink-0 ${action.badgeColor}`}>
                            {action.badge}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-300/80 mt-0.5 leading-snug line-clamp-2">
                          {action.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredActions.length === 0 && (
                <div className="text-center py-6 text-slate-400 space-y-1.5">
                  <p className="text-xs">No clinical actions match "{searchQuery}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                    }}
                    className="text-xs text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            {/* Popover Footer Advice */}
            <div className="px-3 py-1.5 bg-[#030919] border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-cyan-300/90 font-medium">
                <ShieldCheck size={12} className="text-cyan-400" />
                <span>Uganda Clinical Guidelines & WHO Certified</span>
              </span>
              <button
                type="button"
                onClick={() => setIsDeckOpen(false)}
                className="text-cyan-400 font-bold hover:underline"
              >
                Close (ESC)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. RAPID DRUG DOSE CALCULATOR MODAL (Small, Non-Blocking)   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDoseCalc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#071330] border-2 border-cyan-500/50 rounded-3xl shadow-2xl p-4 sm:p-5 space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <Calculator size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Rapid Medication Dosing</h3>
                    <p className="text-[10px] text-slate-400">Uganda Clinical Guidelines & WHO Formulary</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDoseCalc(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Patient Weight Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">Patient Weight (kg)</label>
                  <span className="font-mono text-cyan-400 font-bold">{patientWeight} kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="3"
                    max="100"
                    step="1"
                    value={patientWeight}
                    onChange={(e) => setPatientWeight(e.target.value)}
                    className="flex-1 accent-cyan-400 cursor-pointer"
                  />
                  <input
                    type="number"
                    value={patientWeight}
                    onChange={(e) => setPatientWeight(e.target.value)}
                    className="w-16 bg-[#040d24] border border-cyan-500/30 rounded-xl px-2 py-1 text-xs text-white text-center font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Medicine Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Select Essential Medication</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'paracetamol', label: 'Paracetamol (Antipyretic)' },
                    { id: 'coartem', label: 'Coartem (AL - Malaria)' },
                    { id: 'amoxicillin', label: 'Amoxicillin (Antibiotic)' },
                    { id: 'ors', label: 'WHO ORS (Rehydration)' },
                  ].map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => setSelectedMed(med.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                        selectedMed === med.id
                          ? 'bg-blue-600/30 border-blue-400 text-white shadow-xs'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {med.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compute Button */}
              <button
                type="button"
                onClick={handleCalculateDose}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:via-cyan-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Compute Exact Dosage Regimen
              </button>

              {/* Result display */}
              {calculatedDose && (
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl space-y-2">
                  <p className="text-xs text-cyan-200 leading-relaxed font-mono">
                    {calculatedDose}
                  </p>
                  <div className="flex items-center gap-2 pt-1 border-t border-cyan-900/40">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDoseCalc(false);
                        onSendMessage(calculatedDose);
                      }}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Insert into Consultation →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(calculatedDose);
                        onShowNotice("Dose copied to clipboard!");
                      }}
                      className="p-1 text-slate-300 hover:text-white"
                      title="Copy dose"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
