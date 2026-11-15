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
}

export const DoctorianWelcomeCanvas: React.FC<DoctorianWelcomeCanvasProps> = ({
  onSelectPrompt,
  arduino,
  isUgandaMOHActive = true,
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
    <div className="flex-1 flex flex-col items-center justify-center p-2.5 sm:p-4 my-auto max-w-2xl mx-auto w-full space-y-3">
      {/* Screen 4 Greeting Bubble, Checklist & Malaria Sample Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-2.5"
      >
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-[0_0_16px_rgba(0,210,255,0.4)] border-2 border-cyan-300/70 shrink-0">
            <Bot size={18} />
          </div>
          <div className="doctorian-thick-card px-3.5 py-2.5 text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 leading-snug flex-1">
            Hello <strong className="text-blue-600 dark:text-cyan-300">Akora Joseph! 👋</strong>{' '}
            {t("I'm your Doctorian AI assistant. How can I help you today?")}
          </div>
        </div>

        <div className="doctorian-thick-card p-3 sm:p-3.5 space-y-2 ml-0 sm:ml-10">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-white">
            {t('You can ask me about:')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            {[
              { label: t('Symptoms & Treatments'), prompt: 'What are the symptoms of malaria?' },
              { label: t('Medication Information'), prompt: 'Review dosage, schedule, and safety for Amoxicillin 500mg.' },
              { label: t('Health Tips & Advice'), prompt: 'Give me daily preventive health tips based on my vitals.' },
              { label: t('Medical Image Analysis'), prompt: 'How do I interpret my laboratory and diagnostic scan results?' },
              { label: t('And much more...'), prompt: 'What emergency signs require urgent hospital attention?' },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => onSelectPrompt(item.prompt)}
                className="doctorian-thick-tile flex items-center gap-2 text-left px-2.5 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-100 cursor-pointer"
              >
                <CheckCircle2 size={14} className="text-cyan-500 dark:text-cyan-400 shrink-0" />
                <span className="truncate">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Interactive Malaria Sample Thread Preview */}
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-end gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onSelectPrompt('What are the symptoms of malaria?')}
              className="doctorian-cta-btn px-3.5 py-2 rounded-2xl rounded-tr-xs text-xs font-bold text-white cursor-pointer text-left"
            >
              {t('What are the symptoms of malaria?')}
            </motion.button>
            <img
              src="/portraits/akora_joseph.jpg"
              alt="Akora Joseph"
              className="w-7 h-7 rounded-full object-cover border-2 border-cyan-400 shrink-0 shadow-sm"
            />
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,210,255,0.35)] border-2 border-cyan-300/60 shrink-0">
              <Bot size={15} />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onSelectPrompt('What are the symptoms of malaria?')}
              className="doctorian-thick-card p-3 text-left flex-1 cursor-pointer hover:border-cyan-400/70 transition-all space-y-1"
            >
              <p className="text-xs font-black text-slate-900 dark:text-white">
                {t('Malaria commonly causes:')}
              </p>
              <ul className="text-[11px] text-slate-700 dark:text-slate-200 grid grid-cols-2 gap-x-2 gap-y-0.5 pl-0.5 font-medium">
                <li>• {t('Fever and chills')}</li>
                <li>• {t('Headache')}</li>
                <li>• {t('Sweating')}</li>
                <li>• {t('Muscle pain & Fatigue')}</li>
              </ul>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-blue-600 dark:text-cyan-400 pt-0.5">
                {t('Tap for full AI triage & UCG protocol →')}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Top Clinical AI Hero Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 mb-2"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-gradient-to-r dark:from-cyan-950/80 dark:via-blue-950/80 dark:to-purple-950/80 border border-blue-200 dark:border-cyan-400/50 text-blue-700 dark:text-cyan-300 text-[11px] font-bold shadow-sm">
          <Sparkles size={12} className="text-blue-600 dark:text-cyan-400 animate-pulse" />
          <span>Doctorian Clinical Intelligence</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-normal hidden sm:inline">Active Online</span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
          How can I assist your clinical consultation today?
        </h2>

        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-snug">
          Empathetic, evidence-based diagnostic co-pilot incorporating WHO protocols and Uganda Clinical Guidelines (UCG).
        </p>

        {/* Live Telemetry Status Bar */}
        <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#091738]/90 border border-slate-200 dark:border-blue-500/30 text-[11px] text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md flex-wrap justify-center">
          <div className="flex items-center gap-1">
            <Heart size={12} className="text-rose-500 dark:text-rose-400 animate-pulse" />
            <span className="text-slate-500 dark:text-slate-400">HR:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">{hr} bpm</span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-1">
            <Activity size={12} className="text-blue-600 dark:text-cyan-400" />
            <span className="text-slate-500 dark:text-slate-400">SpO2:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">{spo2}%</span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-1">
            <Thermometer size={12} className="text-amber-500 dark:text-amber-400" />
            <span className="text-slate-500 dark:text-slate-400">Temp:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">{temp}°C</span>
          </div>
          {isUgandaMOHActive && (
            <>
              <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                <BookOpen size={12} className="text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-[10px]">UCG Active</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* 4 Categorized Quick-Start Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full"
      >
        {quickConsultations.map((card) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onSelectPrompt(card.prompt)}
              className="p-3 sm:p-3.5 doctorian-thick-card hover:scale-[1.01] transition-all text-left group cursor-pointer flex flex-col justify-between space-y-1.5 backdrop-blur-md"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-sm`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-300/90 font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/60 border border-blue-200 dark:border-cyan-500/30">
                    {card.badge}
                  </span>
                </div>
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-300 group-hover:bg-blue-50 dark:group-hover:bg-cyan-500/20 transition-colors">
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-200 transition-colors leading-tight">
                  {card.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300/90 mt-0.5 leading-snug line-clamp-2">
                  {card.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Rapid One-Tap Clinical Chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="mt-2 w-full flex flex-wrap items-center justify-center gap-1.5"
      >
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Zap size={11} className="text-blue-600 dark:text-cyan-400" />
          <span>Quick Inquiries:</span>
        </span>
        {[
          { label: '🌡️ Malaria Protocol', prompt: 'What is the Uganda MoH first-line protocol for confirmed uncomplicated malaria with Artemether-Lumefantrine?' },
          { label: '💊 Pediatric Dosing', prompt: 'Calculate the weight-based oral paracetamol dose schedule for an 18kg child with fever.' },
          { label: '💓 Vitals Check', prompt: `Interpret my live telemetry snapshot: HR is ${hr} bpm, SpO2 is ${spo2}%, Temp is ${temp}°C.` },
          { label: '👶 Maternal Red Flags', prompt: 'What are the red flag danger signs of pre-eclampsia in the third trimester?' },
          { label: '📝 SOAP Note', prompt: 'Please formulate a structured clinical SOAP Note (Subjective, Objective, Assessment, Plan) based on our consultation.' },
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(chip.prompt)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-[#0a1636]/90 hover:bg-slate-100 dark:hover:bg-[#12285e] border border-slate-200 dark:border-cyan-500/30 hover:border-blue-400 dark:hover:border-cyan-400/70 text-slate-800 dark:text-cyan-200 hover:text-blue-600 dark:hover:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};
