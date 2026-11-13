import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle,
  Activity,
  HardDrive,
  Video,
  Phone,
  ShieldCheck,
  Stethoscope,
  Pill,
  Radio,
  Zap,
  Globe,
  ArrowRight,
  Layers,
  HeartPulse
} from 'lucide-react';
import { translate } from '../utils/translations';

export interface PageTutorialStep {
  title: string;
  badge: string;
  description: string;
  lugandaDescription?: string;
  swahiliDescription?: string;
  icon: any;
  actionLabel?: string;
  onAction?: () => void;
  tips: string[];
}

export interface PageTutorialData {
  pageId: string;
  pageTitle: string;
  subtitle: string;
  lugandaTitle?: string;
  swahiliTitle?: string;
  steps: PageTutorialStep[];
}

interface PageTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  currentLanguage?: string;
  onNavigate?: (view: string) => void;
  onTriggerAction?: (actionKey: string) => void;
}

export const PageTutorialModal: React.FC<PageTutorialModalProps> = ({
  isOpen,
  onClose,
  currentView,
  currentLanguage = 'English (US)',
  onNavigate,
  onTriggerAction
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [tutorialLang, setTutorialLang] = useState<'en' | 'lg' | 'sw'>(
    currentLanguage.includes('Luganda') ? 'lg' : currentLanguage.includes('Swahili') ? 'sw' : 'en'
  );

  useEffect(() => {
    if (currentLanguage.includes('Luganda')) setTutorialLang('lg');
    else if (currentLanguage.includes('Swahili')) setTutorialLang('sw');
    else setTutorialLang('en');
  }, [currentLanguage]);

  // Reset to first step whenever the current view changes
  useEffect(() => {
    setActiveStepIndex(0);
  }, [currentView]);

  // Comprehensive page tutorial registry for each key module in Doctorian
  const getTutorialContent = (view: string): PageTutorialData => {
    switch (view) {
      case 'home':
      case 'dashboard':
        return {
          pageId: 'home',
          pageTitle: 'Doctorian Priority Clinical Dashboard',
          lugandaTitle: 'Wwebbulaasi y’Obulamu eya Doctorian',
          swahiliTitle: 'Dashibodi ya Afya ya Doctorian',
          subtitle: 'Your central clinical cockpit: live vitals, hourly health tips, and emergency triage at a glance.',
          steps: [
            {
              title: '1. Vitality Matrix & Real-Time Bio-Status',
              badge: 'Bio-Telemetry',
              icon: HeartPulse,
              description: 'Monitors your cardiovascular flux, neural energy, hydration score, and physiological baseline in real-time.',
              lugandaDescription: 'Ekyuma kino kikeba okukuba kw’omutima gwo, amaanyi g’omubiri, n’amazzi mu mubiri mu buli kaseera.',
              swahiliDescription: 'Inafuatilia mapigo ya moyo, nishati ya mwili na kiwango cha maji kwa wakati halisi.',
              tips: [
                'Vitals update dynamically via simulated or physical Arduino Bluetooth bio-sensors',
                'Green badge denotes stable hemodynamic parameters',
                'Red alert indicates immediate clinical attention needed'
              ]
            },
            {
              title: '2. Preventive Care & Hourly MoH Health Tips',
              badge: 'Guidance',
              icon: Sparkles,
              description: 'Provides proactive, localized health recommendations aligned with Uganda Ministry of Health protocols.',
              lugandaDescription: 'Ewa amagezi ag’amangu agakwatagana n’ebiragiro bya Minisitule y’Obulamu eya Uganda ku kwerinda omusujja n’endwadde.',
              swahiliDescription: 'Inatoa ushauri wa kuzuia magonjwa kwa kuzingatia miongozo ya Wizara ya Afya ya Uganda.',
              tips: [
                'Covers malaria prevention (ITN nets), hydration, hypertension salt intake, and hygiene',
                'Click "More Details" to read deep clinical evidence'
              ]
            },
            {
              title: '3. Rapid Emergency SOS & VHT Community Dispatch',
              badge: 'Emergency',
              icon: Zap,
              description: 'One-click emergency gateway connecting to Uganda national ambulance dispatch (911/999) and local VHTs.',
              lugandaDescription: 'Gino mikutu gy’amangu gye weyambisa okufuna ambyulensi oba abasawo ba VHT mu kitundu kyo singa wabaawo obuzibu.',
              swahiliDescription: 'Mfumo wa dharura wa kuita gari la wagonjwa na wahudumu wa afya wa jamii mara moja.',
              actionLabel: 'Explore Emergency Tools',
              onAction: () => onNavigate?.('emergency'),
              tips: [
                'Toll-free hotlines 0800-100-066 / 0800-203-033 pre-loaded',
                'Automatic SMS dispatch with GPS geo-coordinates'
              ]
            }
          ]
        };

      case 'ai_nexus':
        return {
          pageId: 'ai_nexus',
          pageTitle: 'Doctorian Neural Core & AI Nexus Consultation',
          lugandaTitle: 'Omutima gwa Doctorian AI & Okubuuza Abasawo',
          swahiliTitle: 'Kiini cha AI cha Doctorian & Mashauriano',
          subtitle: 'Multi-specialist clinical reasoning layer with voice & video consultations and automated SOAP notes.',
          steps: [
            {
              title: '1. Multi-Specialist Clinical Chatbots',
              badge: 'Specialists',
              icon: Stethoscope,
              description: 'Switch between General Clinical, Pediatric Triage, Cardiology, Infectious Disease, and Obstetric specialists.',
              lugandaDescription: 'Wano osobola okwerondera omusawo gw’oyagala: Ow’abaana, ow’omutima, ow’embuto oba ow’omusujja.',
              swahiliDescription: 'Badili wataalamu wa AI kulingana na mahitaji: Watoto, Moyo, Uzazi, au Magonjwa Ambukizi.',
              tips: [
                'Click the specialist badge on the chat bar to switch persona',
                'Zero-hallucination guardrails trained on WHO & Uganda Clinical Guidelines'
              ]
            },
            {
              title: '2. Upgraded Voice & HD Video Calls',
              badge: 'Telehealth',
              icon: Video,
              description: 'Conduct live audio/video telehealth calls with simulated Uganda clinicians, live vitals overlay, and speech-to-text.',
              lugandaDescription: 'Kola olukiiko lw’eddoboozi oba lwa vidiyo n’omusawo. By’oyogera biwandiikibwa mu kaseera ako ako.',
              swahiliDescription: 'Piga simu ya sauti au video na daktari, huku vipimo vyako vikionyeshwa papo hapo.',
              actionLabel: 'Launch Voice & Video Hub',
              onAction: () => onTriggerAction?.('open_telehealth'),
              tips: [
                'Supports hands-free speech recognition in Luganda and English',
                'Real-time acoustic Milky Way visualizer during voice calls'
              ]
            },
            {
              title: '3. Automated SOAP Clinical Note & Referral Slip',
              badge: 'EHR',
              icon: Layers,
              description: 'Doctorian automatically structures every consultation into Subjective, Objective, Assessment, and Plan (SOAP) records.',
              lugandaDescription: 'Buli lwe mwogera, ekyuma kiwandiika ebiwandiiko ebitongole eby’eddwaliro (SOAP) n’ebbaluwa y’eddagala.',
              swahiliDescription: 'Mazungumzo yako hurekodiwa kiotomatiki katika muundo rasmi wa matibabu wa SOAP tayari kwa hospitali.',
              tips: [
                '1-click export to Google Sheets or PDF referral slip',
                'Stores securely in your lifetime Free 1GB Cloud Vault'
              ]
            }
          ]
        };

      case 'monitor':
        return {
          pageId: 'monitor',
          pageTitle: 'Real-Time Bio-Monitor & Sensor Fusion Console',
          lugandaTitle: 'Ekyuma ekikeba Obulamu mu kaseera ako ako',
          swahiliTitle: 'Dashibodi ya Kufuatilia Vipimo vya Mwili',
          subtitle: 'Live bio-sensor streams, SpO2 & ECG rhythm traces, body temperature, and anomaly thresholds.',
          steps: [
            {
              title: '1. Live Sensor Telemetry Stream',
              badge: 'Sensors',
              icon: Activity,
              description: 'Visualizes continuous telemetry: Heart Rate (BPM), Blood Oxygen (SpO2), Systolic/Diastolic BP, and Core Temp (°C).',
              lugandaDescription: 'Kiraga okukuba kw’omutima, omukka gwa oxygen mu musaayi, puleesa, n’ebbujje ly’omubiri.',
              swahiliDescription: 'Inaonyesha kasi ya mapigo ya moyo, oksijeni ya damu, shinikizo la damu, na joto la mwili.',
              tips: [
                'Normal adult pulse: 60-100 BPM; SpO2 >= 95%',
                'Supports Arduino serial connection and simulated realistic physiology'
              ]
            },
            {
              title: '2. Automated Anomaly Detection & Alerts',
              badge: 'Triage Alerts',
              icon: Zap,
              description: 'Instantly alerts when arrhythmia, hypoxemia (SpO2 < 90%), or hypertensive crisis is detected.',
              lugandaDescription: 'Ekyuma kikuweerawo obubonero singa omutima gukuba bubi oba nga omukka gwa oxygen gusse nnyo.',
              swahiliDescription: 'Inatoa tahadhari ya haraka iwapo mapigo ya moyo au oksijeni itashuka chini ya viwango salama.',
              tips: [
                'Color-coded telemetry badges: Green = Normal, Amber = Borderline, Red = Critical',
                'Telemetry snapshots can be saved directly to your 1GB vault'
              ]
            }
          ]
        };

      case 'symptoms':
        return {
          pageId: 'symptoms',
          pageTitle: 'Intelligent Symptom Triage & Red Flag Checker',
          lugandaTitle: 'Okukebera Obubonero bw’Endwadde',
          swahiliTitle: 'Uchunguzi wa Dalili na Hatari za Magonjwa',
          subtitle: 'Syndromic algorithm assessing clinical urgency and Uganda MoH infectious risk factors.',
          steps: [
            {
              title: '1. Structured Symptom Assessment',
              badge: 'Triage',
              icon: Stethoscope,
              description: 'Select your symptoms (fever, chills, headache, cough, abdominal pain) to run diagnostic probability matching.',
              lugandaDescription: 'Londa obubonero bw’owulira (omusujja, omutwe, ekifuba, olubuto) okumanya obulwadde obuyinza okuba nga bwe bukuluma.',
              swahiliDescription: 'Chagua dalili unazohisi ili mfumo utambue magonjwa yanayowezekana kwa kufuata itifaki za kitabibu.',
              tips: [
                'Includes endemic Uganda conditions like Malaria, Typhoid, Dengue, and Pneumonia',
                'Provides recommended next clinical actions (e.g., mRDT, blood slide, chest X-ray)'
              ]
            },
            {
              title: '2. Red-Flag Danger Signs',
              badge: 'Danger Signs',
              icon: ShieldCheck,
              description: 'Screens for signs requiring immediate physical admission: lethargy, neck stiffness, severe dyspnea, and convulsions.',
              lugandaDescription: 'Ekebera obubonero obw’akabi ennyo obwetaagisa okugenda mu ddwaliro amangu ddala awatali kulwa.',
              swahiliDescription: 'Inakagua dalili za hatari kama vile kukakamaa shingo au kupumua kwa shida zinazohitaji kulazwa hospitalini.',
              tips: [
                'In maternal cases, high BP + headache indicates urgent pre-eclampsia triage',
                'Directly links to ambulance SOS'
              ]
            }
          ]
        };

      case 'pharmacy':
        return {
          pageId: 'pharmacy',
          pageTitle: 'Precision Bio-Pharmacy Depot & Drug Safety Core',
          lugandaTitle: 'Ettundiro ly’Eddagala n’Obukuumi bw’Eddagala',
          swahiliTitle: 'Bohari ya Dawa na Usalama wa Matumizi',
          subtitle: 'Dosage calculations, drug contraindication audits, and Uganda National Drug Authority stock verification.',
          steps: [
            {
              title: '1. Drug Contraindication & Interaction Checker',
              badge: 'Pharmacovigilance',
              icon: Pill,
              description: 'Cross-checks your prescription against known allergies, chronic conditions, and other active medications.',
              lugandaDescription: 'Ekebera eddagala ly’omira okulaba nga terikontana oba okukosa obulamu bwo.',
              swahiliDescription: 'Inachunguza mwingiliano wa dawa ili kuzuia madhara yanayotokana na kunywa dawa zisizoendana.',
              tips: [
                'Prevents adverse drug-drug interactions (e.g., NSAIDs with ACE inhibitors)',
                'Shows pediatric weight-based dosage (mg/kg/day)'
              ]
            },
            {
              title: '2. Local Uganda Pharmacy Stock & Generic Equivalents',
              badge: 'Stock & Cost',
              icon: CheckCircle,
              description: 'Helps locate generic equivalents to reduce healthcare costs across Kampala and regional health centers.',
              lugandaDescription: 'Ekulaga amannya g’eddagala ag’omuwendo oguteebereka mu matundiro g’eddagala agali okumpi.',
              swahiliDescription: 'Inasaidia kupata dawa mbadala zenye gharama nafuu katika maduka ya dawa yaliyo karibu nawe.',
              tips: [
                'Verified against Uganda National Formulary (UNF) standards'
              ]
            }
          ]
        };

      default:
        return {
          pageId: 'storage',
          pageTitle: 'Free 1GB Encrypted Cloud Storage Vault',
          lugandaTitle: 'Kakebe k’Obulamu aka 1GB ku Bwereere',
          swahiliTitle: 'Bohari ya Hifadhi ya GB 1 ya Bure ya Kidijitali',
          subtitle: 'Military-grade AES-256 encrypted space for DICOM X-rays, lab PDFs, and lifetime clinical telemetry.',
          steps: [
            {
              title: '1. Lifetime Free 1.00 GB Medical Quota',
              badge: '1GB Free',
              icon: HardDrive,
              description: 'Every verified user is granted 1,024 MB of real cloud storage for medical records, lab reports, and imaging scans.',
              lugandaDescription: 'Buli mukozesa aweebwa 1GB y’obwereere okutereka ebiwandiiko by’eddwaliro, ebipimo, n’ebifaananyi bya X-ray.',
              swahiliDescription: 'Kila mtumiaji hupewa GB 1 kamili ya bure kuhifadhi ripoti za maabara, picha za eksirei na rekodi za afya.',
              tips: [
                'Visual multi-segment storage bar tracks your consumption in real time',
                'Breakdown categories: EHR Docs, Scans, Labs, Telemetry, and Audio'
              ]
            },
            {
              title: '2. AES-256 Encryption & SHA-256 Bit-Level Proof',
              badge: 'Security',
              icon: ShieldCheck,
              description: 'Each uploaded clinical file is cryptographically hashed and secured with AES-256 privacy-aligned encryption.',
              lugandaDescription: 'Buli fayiro eteekebwamu esibibwa n’amakubo g’ebyokwerinda ag’amaanyi ennyo nga tewali ayinza kugiyingirira.',
              swahiliDescription: 'Kila faili linalohifadhiwa hulindwa kwa usimbaji fiche wa kijeshi wa AES-256 na uthibitisho wa SHA-256.',
              tips: [
                'Two-Factor Authentication (2FA) protects your vault from unauthorized device access',
                '1-click sync saves live telemetry snapshots instantly'
              ]
            }
          ]
        };
    }
  };

  const currentData = getTutorialContent(currentView);
  const currentStep = currentData.steps[activeStepIndex] || currentData.steps[0];
  const StepIcon = currentStep.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100"
      >
        {/* Header with Language Selector & Progress */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <HelpCircle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight uppercase">
                  {tutorialLang === 'lg' && currentData.lugandaTitle ? currentData.lugandaTitle : tutorialLang === 'sw' && currentData.swahiliTitle ? currentData.swahiliTitle : currentData.pageTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Step {activeStepIndex + 1} of {currentData.steps.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentData.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tutorial Language Switcher */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setTutorialLang('en')}
                className={`px-2 py-1 rounded-lg transition-all ${tutorialLang === 'en' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setTutorialLang('lg')}
                className={`px-2 py-1 rounded-lg transition-all ${tutorialLang === 'lg' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                title="Luganda Language"
              >
                LG
              </button>
              <button
                type="button"
                onClick={() => setTutorialLang('sw')}
                className={`px-2 py-1 rounded-lg transition-all ${tutorialLang === 'sw' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                title="Kiswahili Language"
              >
                SW
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
            {currentData.steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  idx <= activeStepIndex ? 'bg-blue-600' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
              <StepIcon size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md bg-blue-500/10">
                {currentStep.badge}
              </span>
              <h4 className="text-lg sm:text-xl font-black mt-1">
                {currentStep.title}
              </h4>
            </div>
          </div>

          {/* Description translated */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
              {tutorialLang === 'lg' && currentStep.lugandaDescription
                ? currentStep.lugandaDescription
                : tutorialLang === 'sw' && currentStep.swahiliDescription
                ? currentStep.swahiliDescription
                : currentStep.description}
            </p>
            {tutorialLang !== 'en' && (
              <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                English Reference: {currentStep.description}
              </p>
            )}
          </div>

          {/* Clinical Insights / Tips */}
          <div className="space-y-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
              {tutorialLang === 'lg' ? 'Ebikulu eby’okumanya:' : tutorialLang === 'sw' ? 'Mambo muhimu ya kuzingatia:' : 'Key Clinical Tips:'}
            </h5>
            <div className="space-y-2">
              {currentStep.tips.map((tip, tIdx) => (
                <div key={tIdx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action trigger button if present */}
          {currentStep.actionLabel && currentStep.onAction && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  currentStep.onAction?.();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              >
                <span>{currentStep.actionLabel}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            disabled={activeStepIndex === 0}
            onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {activeStepIndex < currentData.steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStepIndex((prev) => Math.min(currentData.steps.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span>Next Step</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <CheckCircle size={16} />
                <span>Got it! Start Using</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
