import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Monitor, Activity, FileText, Shield, X, 
  ChevronRight, ChevronLeft, Award, HelpCircle, Check, Play
} from 'lucide-react';

interface AppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
  currentView: string;
}

interface Step {
  id: number;
  view: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  actionLabel?: string;
  tips: string[];
}

export const AppTutorial: React.FC<AppTutorialProps> = ({ isOpen, onClose, onNavigate, currentView }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: Step[] = [
    {
      id: 0,
      view: 'home',
      title: 'Clinical Cockpit & Dashboard',
      badge: 'Step 1 of 6',
      icon: <Activity className="text-blue-500 w-6 h-6" />,
      description: 'Welcome to Doctorian! Your central workspace offers a complete overview of clinical indicators, quick health shortcuts, local telemetry connections, and daily neurological tips in a single responsive pane.',
      tips: [
        'Monitor active sync queues and wireless telemetry signals.',
        'View dynamically aggregated summaries of vital recordings.',
        'Launch modular diagnostic checkers directly from shortcut cards.'
      ]
    },
    {
      id: 1,
      view: 'symptoms',
      title: 'AI Symptom Intelligence',
      badge: 'Step 2 of 6',
      icon: <Sparkles className="text-indigo-500 w-6 h-6" />,
      description: 'Analyze symptoms through our local, secure, and privacy-focused Neural Diagnostic Engine. Tap in symptom patterns to compute diagnostic likelihoods, warning matrices, and clinical suggestions.',
      tips: [
        'Add as many details as possible for precise suggestions.',
        'Check physiological probabilities generated locally via offline cache.',
        'Log resolved consultations straight to the EHR history Vault.'
      ]
    },
    {
      id: 2,
      view: 'monitor',
      title: 'Live Patient & Waveform Monitor',
      badge: 'Step 3 of 6',
      icon: <Monitor className="text-emerald-500 w-6 h-6" />,
      description: 'Plot real-time biological waveforms such as cardiac ECG, SpO2 levels, and body heat parameters. Perfect for linking external Bluetooth, WiFi UDP, or Serial Arduino sensors with customizable risk bounds.',
      tips: [
        'Baud rates and COM ports can be calibrated dynamically.',
        'Visual acoustic alarms will trigger if vital bounds are crossed.',
        'Press "Begin Telemetry Stream" to run offline medical simulations.'
      ]
    },
    {
      id: 3,
      view: 'illustrator',
      title: 'Anatomical Generative Illustrator',
      badge: 'Step 4 of 6',
      icon: <Sparkles className="text-amber-500 w-6 h-6" />,
      description: 'Produce high-fidelity medical drawings, organ cross-sections, or skeletal system layers on demand. Simply enter anatomical visual requests to build custom illustrations for medical education or patient profiles.',
      tips: [
        'Export generated visual schemas straight to active patient records.',
        'Request detailed highlights of specific biological nodes and zones.',
        'Use pre-set presets from the quick anatomical catalog.'
      ]
    },
    {
      id: 4,
      view: 'records',
      title: 'EHR records and history vault',
      badge: 'Step 5 of 6',
      icon: <FileText className="text-violet-500 w-6 h-6" />,
      description: 'A dedicated patient history repository. Log workout frequencies, active medication schemes with push alerts, past diagnostic summaries, and ECG captures securely logged to client-side offline storage.',
      tips: [
        'Export unified history documents in encrypted JSON format.',
        'Check cumulative health trends on patient indicator curve panels.',
        'Synchronize offline additions automatically when internet is detected.'
      ]
    },
    {
      id: 5,
      view: 'help',
      title: 'Clinical Systems Hub',
      badge: 'Step 6 of 6',
      icon: <Shield className="text-rose-500 w-6 h-6" />,
      description: 'Your administrative security cockpit. Explore our Help Center FAQs, read Google Workspace OAuth privacy rules, provide continuous feedback directly to lead systems, or trigger the data-wipe "Forgotten Protocol".',
      tips: [
        'Instantly review regulatory policies and AES-250 security guarantees.',
        'Send diagnostic issues via WhatsApp support or systems email.',
        'In critical security crises, force wipe the local memory sandbox.'
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onNavigate(steps[nextStep].view);
    } else {
      // Completed!
      localStorage.setItem('has_seen_tutorial', 'true');
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onNavigate(steps[prevStep].view);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('has_seen_tutorial', 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <div id="tutorial-overlay" className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end p-4 md:p-8 md:items-end">
        
        {/* Shadow Overlay focused around application */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-[1px] pointer-events-auto"
          onClick={handleSkip}
        />

        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 pointer-events-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-805">
                {currentStepData.icon}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-500 tracking-wider">
                  {currentStepData.badge}
                </span>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-850 dark:text-white">
                  {currentStepData.title}
                </h3>
              </div>
            </div>
            
            <button 
              onClick={handleSkip}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              aria-label="Skip Tutorial"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
              {currentStepData.description}
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <HelpCircle size={12} className="text-blue-500" /> Professional Workflow Tips
              </h4>
              <ul className="space-y-2">
                {currentStepData.tips.map((tip, index) => (
                  <li key={`apptutorial-l196-index-${index}`} className="flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Steps points */}
            <div className="flex gap-1.5">
              {steps.map((s, idx) => (
                <div 
                  key={`apptutorial-l211-${idx}`} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-200 dark:bg-slate-800'
                  }`} 
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-605 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel / Skip
              </button>
              
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="p-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 rounded-xl transition-all"
                  aria-label="Previous step"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              <button
                onClick={handleNext}
                className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-500/10 transition-all flex items-center gap-1.5"
              >
                <span>{currentStep === steps.length - 1 ? 'Finish tour' : 'Next'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
