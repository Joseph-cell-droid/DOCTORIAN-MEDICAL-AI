import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Stethoscope, Pill, Activity, Baby, 
  ChevronRight, Heart, ShieldCheck, Thermometer,
  Zap, BrainCircuit, BookOpen
} from 'lucide-react';

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
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto max-w-4xl mx-auto w-full">
      {/* Top Clinical AI Hero Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 mb-6 sm:mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-purple-950/80 border border-cyan-400/50 text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-950/40">
          <Sparkles size={14} className="text-cyan-400 animate-pulse" />
          <span>Doctorian Clinical Intelligence</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] text-emerald-400 font-mono font-normal hidden sm:inline">Active Online</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          How can I assist your clinical consultation today?
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Empathetic, evidence-based diagnostic co-pilot incorporating WHO protocols and Uganda Clinical Guidelines (UCG).
        </p>

        {/* Live Telemetry Status Bar */}
        <div className="inline-flex items-center gap-3 sm:gap-4 px-4 py-2 rounded-2xl bg-[#091738]/90 border border-blue-500/30 text-xs text-slate-300 shadow-md backdrop-blur-md flex-wrap justify-center mt-2">
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-rose-400 animate-pulse" />
            <span className="text-slate-400">Heart Rate:</span>
            <span className="font-bold text-white font-mono">{hr} bpm</span>
          </div>
          <div className="h-3 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-cyan-400" />
            <span className="text-slate-400">SpO2:</span>
            <span className="font-bold text-white font-mono">{spo2}%</span>
          </div>
          <div className="h-3 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Thermometer size={14} className="text-amber-400" />
            <span className="text-slate-400">Temp:</span>
            <span className="font-bold text-white font-mono">{temp}°C</span>
          </div>
          {isUgandaMOHActive && (
            <>
              <div className="h-3 w-px bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-emerald-300">
                <BookOpen size={13} className="text-emerald-400" />
                <span className="font-semibold text-[11px]">UCG Protocols Active</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* 4 Categorized Quick-Start Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full"
      >
        {quickConsultations.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectPrompt(card.prompt)}
              className={`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#0c1f4c]/70 via-[#071330]/80 to-[#040c20]/90 border ${card.borderColor} hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-950/30 transition-all text-left group cursor-pointer flex flex-col justify-between space-y-2.5 backdrop-blur-md`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/90 font-mono px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30">
                    {card.badge}
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/20 transition-colors">
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-1 text-[11px] text-cyan-400/90 font-medium flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Start consultation</span>
                <ChevronRight size={12} />
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Rapid One-Tap Clinical Chips */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 sm:mt-5 w-full flex flex-wrap items-center justify-center gap-2"
      >
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Zap size={12} className="text-cyan-400" />
          <span>Quick Clinical Inquiries:</span>
        </span>
        {[
          { label: '🌡️ Malaria RDT & AL Regimen', prompt: 'What is the Uganda MoH first-line protocol for confirmed uncomplicated malaria with Artemether-Lumefantrine?' },
          { label: '💊 Paracetamol Dosing (Pediatric)', prompt: 'Calculate the weight-based oral paracetamol dose schedule for an 18kg child with fever.' },
          { label: '💓 Bio-Telemetry Interpretation', prompt: `Interpret my live telemetry snapshot: HR is ${hr} bpm, SpO2 is ${spo2}%, Temp is ${temp}°C.` },
          { label: '👶 Pre-eclampsia Danger Signs', prompt: 'What are the red flag danger signs of pre-eclampsia in the third trimester?' },
          { label: '📝 Formulate Clinical SOAP Note', prompt: 'Please formulate a structured clinical SOAP Note (Subjective, Objective, Assessment, Plan) based on our consultation.' },
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(chip.prompt)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#0a1636]/90 hover:bg-[#12285e] border border-cyan-500/30 hover:border-cyan-400/70 text-cyan-200 hover:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};
