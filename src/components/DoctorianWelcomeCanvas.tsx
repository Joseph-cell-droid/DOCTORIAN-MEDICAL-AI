import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Stethoscope, Pill, Activity, Baby, 
  ChevronRight, Heart, ShieldCheck, Thermometer,
  Zap, BrainCircuit, BookOpen, CheckCircle2, Bot
} from 'lucide-react';
import { useAppLanguage } from '../utils/translations';

export interface DoctorianWelcomeCanvasProps {
  onSelectPrompt: (prompt: string) => void;
  arduino?: any;
  isUgandaMOHActive?: boolean;
  userName?: string;
  activeModelName?: string;
}

export const DoctorianWelcomeCanvas: React.FC<DoctorianWelcomeCanvasProps> = ({
  onSelectPrompt,
  arduino,
  isUgandaMOHActive = true,
  userName = 'Akora Joseph',
  activeModelName = 'Doctorian Haxzyon',
}) => {
  const [, , t] = useAppLanguage();
  const quickConsultations = [
    {
      id: 'symptom-triage',
      icon: Stethoscope,
      badge: 'Symptom Triage',
      color: 'from-cyan-600 to-blue-600',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      title: 'Acute Symptom Triage',
      description: 'Assess acute symptoms, duration, fever, pain, or chills with clinical differential guidance.',
      prompt: 'I have had a high fever, severe throbbing headache, and joint pains for the past 2 days. Can you provide a clinical assessment, differential possibilities, and recommended next steps?',
    },
    {
      id: 'drug-safety',
      icon: Pill,
      badge: 'Pharmacotherapy',
      color: 'from-indigo-600 to-purple-600',
      borderColor: 'border-indigo-500/40 hover:border-indigo-400',
      title: 'Medication & Interaction Check',
      description: 'Verify indications, contraindications, dosage cautions, and potential drug interactions.',
      prompt: 'Can you review the safety, indications, dosage schedule, and precautions of taking Artemether-Lumefantrine (Coartem) for suspected malaria?',
    },
    {
      id: 'vitals-analysis',
      icon: Activity,
      badge: 'Bio-Telemetry',
      color: 'from-emerald-600 to-teal-600',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      title: 'Vitals & Telemetry Interpretation',
      description: 'Analyze real-time sensor metrics: Heart rate, blood oxygen (SpO2), and core body temperature.',
      prompt: arduino?.heartRate 
        ? `Analyze my live bio-telemetry snapshot: Heart Rate is ${arduino.heartRate} bpm, SpO2 is ${arduino.spo2 || 98}%, Temperature is ${arduino.temperature || 36.8}°C. What is the clinical interpretation?`
        : 'Analyze my vital signs: Heart Rate 104 bpm, SpO2 97%, Blood Pressure 136/88 mmHg, Temperature 38.2°C. What are the clinical risk categories and next steps?',
    },
    {
      id: 'pediatric-maternal',
      icon: Baby,
      badge: 'Maternal & Child Health',
      color: 'from-amber-600 to-rose-600',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      title: 'Maternal & Pediatric Danger Signs',
      description: 'Guidance on infant care, immunization milestones, and emergency warning signs in children.',
      prompt: 'What are the critical pediatric danger signs in a child under 5 presenting with fever, fast breathing, and vomiting?',
    },
  ];

  const hr = arduino?.heartRate || 72;
  const spo2 = arduino?.spo2 || 98;
  const temp = arduino?.temperature || 36.8;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 my-auto max-w-2xl mx-auto w-full space-y-4">
      {/* Compact Clinical Greeting & Live Vitals Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 w-full"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-[#091738]/90 border border-slate-200 dark:border-blue-500/30 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-xs">
          <Bot size={13} className="text-blue-600 dark:text-cyan-400" />
          <span>{activeModelName}</span>
        </div>

        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Hello {userName} — {t('How can I help today?')}
        </h2>

        {/* Single Concise Vitals & Protocol Status Bar */}
        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-xl bg-white/95 dark:bg-[#091738]/90 border border-slate-200 dark:border-blue-500/30 text-[11px] text-slate-700 dark:text-slate-300 shadow-xs flex-wrap justify-center">
          <span className="flex items-center gap-1">
            <Heart size={11} className="text-rose-500 dark:text-rose-400" />
            <span className="text-slate-500 dark:text-slate-400">HR</span>
            <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{hr}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="flex items-center gap-1">
            <Activity size={11} className="text-blue-600 dark:text-cyan-400" />
            <span className="text-slate-500 dark:text-slate-400">SpO2</span>
            <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{spo2}%</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="flex items-center gap-1">
            <Thermometer size={11} className="text-amber-500 dark:text-amber-400" />
            <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{temp}°C</strong>
          </span>
          {isUgandaMOHActive && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300 font-semibold">
                <BookOpen size={11} />
                <span>UCG Ready</span>
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* Clean 2x2 Quick-Start Consultation Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full"
      >
        {quickConsultations.map((card) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onSelectPrompt(card.prompt)}
              className="p-3.5 doctorian-thick-card hover:border-cyan-400/70 transition-all text-left group cursor-pointer flex items-start gap-3"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shrink-0 shadow-xs`}>
                <Icon size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors leading-snug">
                  {t(card.title)}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                  {card.description}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:text-cyan-400 shrink-0 mt-0.5" />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};
