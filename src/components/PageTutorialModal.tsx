import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Activity,
  HardDrive,
  Video,
  ShieldCheck,
  Stethoscope,
  Pill,
  Zap,
  ArrowRight,
  Layers,
  HeartPulse,
  Monitor,
  FileText,
  Compass,
  Keyboard
} from 'lucide-react';

export interface PageTutorialStep {
  title: string;
  category: string;
  description: string;
  lugandaDescription?: string;
  swahiliDescription?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  actionLabel?: string;
  targetView?: string;
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
  const [tutorialMode, setTutorialMode] = useState<'page' | 'tour'>('page');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [tutorialLang, setTutorialLang] = useState<'en' | 'lg' | 'sw'>(
    currentLanguage.includes('Luganda') ? 'lg' : currentLanguage.includes('Swahili') ? 'sw' : 'en'
  );

  useEffect(() => {
    if (currentLanguage.includes('Luganda')) setTutorialLang('lg');
    else if (currentLanguage.includes('Swahili')) setTutorialLang('sw');
    else setTutorialLang('en');
  }, [currentLanguage]);

  // Reset step when view or mode changes
  useEffect(() => {
    setActiveStepIndex(0);
  }, [currentView, tutorialMode]);

  const getPageTutorialContent = (view: string): PageTutorialData => {
    switch (view) {
      case 'home':
      case 'dashboard':
        return {
          pageId: 'home',
          pageTitle: 'Clinical Command Dashboard',
          lugandaTitle: 'Wwebbulaasi y’Obulamu eya Doctorian',
          swahiliTitle: 'Dashibodi ya Afya ya Doctorian',
          subtitle: 'Live bio-telemetry, Ministry of Health preventive protocols, and urgent dispatch from one screen.',
          steps: [
            {
              title: 'Vitality Matrix & Live Bio-Telemetry',
              category: 'Bio-Telemetry',
              icon: HeartPulse,
              description: 'Tracks your cardiovascular flux, neural energy balance, hydration level, and physiological baseline continuously.',
              lugandaDescription: 'Ekyuma kino kikeba okukuba kw’omutima gwo, amaanyi g’omubiri, n’amazzi mu mubiri mu buli kaseera.',
              swahiliDescription: 'Inafuatilia mapigo ya moyo, nishati ya mwili na kiwango cha maji kwa wakati halisi.',
              actionLabel: 'Open Bio-Monitor',
              targetView: 'monitor',
              tips: [
                'Supports real Arduino Bluetooth sensors alongside offline clinical simulation',
                'Hemodynamic stability and warning thresholds update in tabular precision',
                'Critical drops escalate automatically to SOS Emergency Dispatch'
              ]
            },
            {
              title: 'Preventive Care & Daily MoH Guidance',
              category: 'Clinical Guidance',
              icon: Activity,
              description: 'Localized preventive recommendations aligned with Uganda Ministry of Health clinical standards.',
              lugandaDescription: 'Ewa amagezi ag’amangu agakwatagana n’ebiragiro bya Minisitule y’Obulamu eya Uganda ku kwerinda omusujja n’endwadde.',
              swahiliDescription: 'Inatoa ushauri wa kuzuia magonjwa kwa kuzingatia miongozo ya Wizara ya Afya ya Uganda.',
              tips: [
                'Covers malaria prevention, hypertension nutrition, and respiratory hygiene',
                'Select any tip card for evidence-backed clinical explanation'
              ]
            },
            {
              title: 'Rapid Emergency SOS & VHT Dispatch',
              category: 'Emergency',
              icon: Zap,
              description: 'Direct gateway to ambulance dispatch (911/999) and Village Health Team (VHT) community responders.',
              lugandaDescription: 'Gino mikutu gy’amangu gye weyambisa okufuna ambyulensi oba abasawo ba VHT mu kitundu kyo singa wabaawo obuzibu.',
              swahiliDescription: 'Mfumo wa dharura wa kuita gari la wagonjwa na wahudumu wa afya wa jamii mara moja.',
              actionLabel: 'Open Emergency Hub',
              targetView: 'emergency',
              tips: [
                'Pre-loaded toll-free national dispatch lines 0800-100-066 and 0800-203-033',
                'Supports instant SMS dispatch with GPS location coordinates'
              ]
            }
          ]
        };

      case 'ai_nexus':
        return {
          pageId: 'ai_nexus',
          pageTitle: 'AI Consultation & Telehealth Studio',
          lugandaTitle: 'Omutima gwa Doctorian AI & Okubuuza Abasawo',
          swahiliTitle: 'Kiini cha AI cha Doctorian & Mashauriano',
          subtitle: 'Multi-specialist clinical reasoning, HD telehealth calls, and structured SOAP note capture.',
          steps: [
            {
              title: 'Multi-Specialist Clinical Personas',
              category: 'Specialists',
              icon: Stethoscope,
              description: 'Switch seamlessly between General Medicine, Pediatrics, Cardiology, Infectious Disease, and Obstetrics.',
              lugandaDescription: 'Wano osobola okwerondera omusawo gw’oyagala: Ow’abaana, ow’omutima, ow’embuto oba ow’omusujja.',
              swahiliDescription: 'Badili wataalamu wa AI kulingana na mahitaji: Watoto, Moyo, Uzazi, au Magonjwa Ambukizi.',
              tips: [
                'Uses Uganda Clinical Guidelines and WHO primary care guardrails',
                'Operates offline with local clinical reasoning models when connectivity drops'
              ]
            },
            {
              title: 'HD Video & Voice Telehealth Calls',
              category: 'Telehealth',
              icon: Video,
              description: 'Conduct live audio or video calls with real-time vitals overlays and speech-to-text transcription.',
              lugandaDescription: 'Kola olukiiko lw’eddoboozi oba lwa vidiyo n’omusawo. By’oyogera biwandiikibwa mu kaseera ako ako.',
              swahiliDescription: 'Piga simu ya sauti au video na daktari, huku vipimo vyako vikionyeshwa papo hapo.',
              actionLabel: 'Launch Telehealth Call',
              onAction: () => onTriggerAction?.('open_telehealth'),
              tips: [
                'Supports live microphone voice capture and acoustic call indicators',
                'Allows switching audio-only low-bandwidth mode on rural networks'
              ]
            },
            {
              title: 'Automated SOAP Notes & Referrals',
              category: 'Clinical Records',
              icon: Layers,
              description: 'Automatically formats consultations into Subjective, Objective, Assessment, and Plan clinical summaries.',
              lugandaDescription: 'Buli lwe mwogera, ekyuma kiwandiika ebiwandiiko ebitongole eby’eddwaliro (SOAP) n’ebbaluwa y’eddagala.',
              swahiliDescription: 'Mazungumzo yako hurekodiwa kiotomatiki katika muundo rasmi wa matibabu wa SOAP tayari kwa hospitali.',
              actionLabel: 'Open EHR Vault',
              targetView: 'records',
              tips: [
                'Exportable to referral slips or saved offline in your encrypted vault'
              ]
            }
          ]
        };

      case 'symptoms':
        return {
          pageId: 'symptoms',
          pageTitle: 'National Symptom Triage & Referral Queue',
          lugandaTitle: 'Okukebera Obubonero bw’Endwadde',
          swahiliTitle: 'Uchunguzi wa Dalili na Hatari za Magonjwa',
          subtitle: 'Interactive NEWS2 clinical scoring, regional hospital queue management, and RBAC privacy shield.',
          steps: [
            {
              title: 'Interactive Symptom Triage Intake',
              category: 'Clinical Triage',
              icon: Stethoscope,
              description: 'Run a structured symptom & vitals assessment to score urgency from Level 1 (Resuscitation) to Level 4 (Stable).',
              lugandaDescription: 'Londa obubonero bw’owulira (omusujja, omutwe, ekifuba, olubuto) okumanya obulwadde obuyinza okuba nga bwe bukuluma.',
              swahiliDescription: 'Chagua dalili unazohisi ili mfumo utambue magonjwa yanayowezekana kwa kufuata itifaki za kitabibu.',
              tips: [
                'Screens fever, dyspnea, chest pain, SpO2, heart rate, and red-flag signs',
                'Newly triaged patients persist directly inside your active hospital queue'
              ]
            },
            {
              title: 'Regional Hospital Filter & Queue Control',
              category: 'Referral Network',
              icon: Activity,
              description: 'Filter live beds and admitted cases across Mulago, Mbarara, Gulu, Jinja, Kiruddu, and Entebbe wards.',
              lugandaDescription: 'Kebera abalwadde n’ebitanda mu malwaliro amanene mu Uganda mu kaseera ako ako.',
              swahiliDescription: 'Chuja wagonjwa na upatikanaji wa vitanda katika hospitali kuu za rufaa za Uganda.',
              tips: [
                'Update triage status directly inside any patient inspection modal',
                'Escalate complex cases straight to AI Consultation or E-Pharmacy'
              ]
            },
            {
              title: 'Role-Based Privacy & Data Protection',
              category: 'Security Shield',
              icon: ShieldCheck,
              description: 'Enforces Uganda Data Protection Act 2019 rules so non-clinicians only inspect authorized personal records.',
              lugandaDescription: 'Ekuuma ebiwandiiko by’abalwadde nga tewali muntu atakkirizibwa ayinza kubikebera.',
              swahiliDescription: 'Inalinda rekodi za wagonjwa kwa kuzingatia Sheria ya Ulinzi wa Data ya Uganda 2019.',
              tips: [
                'Clinicians and Admins unlock complete referral charts; patients see personal files only'
              ]
            }
          ]
        };

      case 'pharmacy':
        return {
          pageId: 'pharmacy',
          pageTitle: 'Verified E-Pharmacy & Dispensary',
          lugandaTitle: 'Ettundiro ly’Eddagala n’Obukuumi bw’Eddagala',
          swahiliTitle: 'Bohari ya Dawa na Usalama wa Matumizi',
          subtitle: 'NDA-verified stock catalog, instant bag management, prescription validation, and order dispatch.',
          steps: [
            {
              title: 'Real-Stock Catalog & OTC/Rx Filtering',
              category: 'Catalog',
              icon: Pill,
              description: 'Browse verified essential medicines with live unit pricing in UGX and Over-the-Counter vs Prescription filters.',
              lugandaDescription: 'Laba eddagala ekkakafu n’emiwendo gyalyo mu siringi za Uganda mu matundiro agakkirizibwa.',
              swahiliDescription: 'Vinjari dawa zilizothibitishwa pamoja na bei na uchujaji wa dawa za kawaida au za cheti.',
              tips: [
                'Add quantities inline without leaving the dispensary catalog',
                'Check pediatric and adult dosing instructions on every medication card'
              ]
            },
            {
              title: 'Secure Checkout, Receipts & Reordering',
              category: 'Dispensary Dispatch',
              icon: CheckCircle2,
              description: 'Submit hospital/home delivery orders with instant printable receipts and one-click prescription reordering.',
              lugandaDescription: 'Tumya eddagala awaka oba ku ddwaliro era ofune lisiiti mu kaseera ako.',
              swahiliDescription: 'Agiza dawa ziletwe nyumbani au hospitalini na upate risiti ya kuchapisha papo hapo.',
              tips: [
                'Transmits encrypted order signals seamlessly online or queues offline'
              ]
            }
          ]
        };

      case 'monitor':
        return {
          pageId: 'monitor',
          pageTitle: 'Live Bio-Monitor & Sensor Fusion',
          lugandaTitle: 'Ekyuma ekikeba Obulamu mu kaseera ako ako',
          swahiliTitle: 'Dashibodi ya Kufuatilia Vipimo vya Mwili',
          subtitle: 'Continuous ECG, SpO2, blood pressure, and temperature waveforms with threshold alerting.',
          steps: [
            {
              title: 'Continuous Physiological Waveforms',
              category: 'Sensors',
              icon: Monitor,
              description: 'Streams real-time heart rate, SpO2 percentage, blood pressure, and core temperature.',
              lugandaDescription: 'Kiraga okukuba kw’omutima, omukka gwa oxygen mu musaayi, puleesa, n’ebbujje ly’omubiri.',
              swahiliDescription: 'Inaonyesha kasi ya mapigo ya moyo, oksijeni ya damu, shinikizo la damu, na joto la mwili.',
              tips: [
                'Normal adult pulse spans 60–100 BPM; healthy resting SpO2 >= 95%',
                'Supports physical Arduino USB/Bluetooth serial streams or offline simulations'
              ]
            },
            {
              title: 'Automated Anomaly Thresholds',
              category: 'Clinical Alerts',
              icon: Zap,
              description: 'Raises immediate visual & audio warnings for hypoxemia (SpO2 < 90%) or acute tachycardia.',
              lugandaDescription: 'Ekyuma kikuweerawo obubonero singa omutima gukuba bubi oba nga omukka gwa oxygen gusse nnyo.',
              swahiliDescription: 'Inatoa tahadhari ya haraka iwapo mapigo ya moyo au oksijeni itashuka chini ya viwango salama.',
              tips: [
                'Sync vital snapshots straight into your encrypted EHR history vault'
              ]
            }
          ]
        };

      default:
        return {
          pageId: 'vault',
          pageTitle: 'Encrypted 1GB Clinical Vault & Records',
          lugandaTitle: 'Kakebe k’Obulamu aka 1GB ku Bwereere',
          swahiliTitle: 'Bohari ya Hifadhi ya GB 1 ya Bure ya Kidijitali',
          subtitle: 'Offline-resilient encrypted storage for lab reports, DICOM imaging, prescriptions, and telemetry.',
          steps: [
            {
              title: '1.00 GB Encrypted Personal Health Vault',
              category: 'Storage Quota',
              icon: HardDrive,
              description: 'Safely store medical scans, immunization records, consultation PDFs, and telemetry captures.',
              lugandaDescription: 'Buli mukozesa aweebwa 1GB y’obwereere okutereka ebiwandiiko by’eddwaliro, ebipimo, n’ebifaananyi bya X-ray.',
              swahiliDescription: 'Kila mtumiaji hupewa GB 1 kamili ya bure kuhifadhi ripoti za maabara, picha za eksirei na rekodi za afya.',
              tips: [
                'Accessible both online and during network blackouts via local indexed persistence',
                'Organized across EHR Docs, Imaging, Lab Results, and Audio Notes'
              ]
            },
            {
              title: 'AES-256 & Session Security Controls',
              category: 'Privacy',
              icon: ShieldCheck,
              description: 'Account-scoped session locking ensures medical files remain isolated to verified account credentials.',
              lugandaDescription: 'Buli fayiro eteekebwamu esibibwa n’amakubo g’ebyokwerinda ag’amaanyi ennyo nga tewali ayinza kugiyingirira.',
              swahiliDescription: 'Kila faili linalohifadhiwa hulindwa kwa usimbaji fiche wa kijeshi wa AES-256.',
              tips: [
                'Supports one-click encrypted JSON export for hospital transfers'
              ]
            }
          ]
        };
    }
  };

  const fullPlatformTour: PageTutorialData = {
    pageId: 'full_tour',
    pageTitle: 'Doctorian Platform Walkthrough',
    lugandaTitle: 'Okuyiga Enkozesa ya Doctorian Yonna',
    swahiliTitle: 'Mwongozo Kamili wa Jukwaa la Doctorian',
    subtitle: 'Jump directly into any clinical module across the workspace.',
    steps: [
      {
        title: 'Clinical Cockpit & Dashboard',
        category: 'Module 01',
        targetView: 'home',
        actionLabel: 'Open Dashboard',
        icon: Activity,
        description: 'Monitor active sync queues, daily health advisories, vital summaries, and launch diagnostic tools.',
        tips: [
          'Check live neurological and preventive Ministry of Health guidance',
          'Open any module from the clean bottom Menu drawer or card tiles'
        ]
      },
      {
        title: 'AI Consultation & Telehealth',
        category: 'Module 02',
        targetView: 'ai_nexus',
        actionLabel: 'Open AI Consultation',
        icon: Stethoscope,
        description: 'Consult multi-specialty AI physicians, launch live video/voice telehealth, and generate structured SOAP notes.',
        tips: [
          'Dedicated distraction-free chat bar pinned cleanly at the bottom',
          'Works even offline using built-in clinical knowledge packs'
        ]
      },
      {
        title: 'National Symptom Triage Queue',
        category: 'Module 03',
        targetView: 'symptoms',
        actionLabel: 'Open Symptom Triage',
        icon: HeartPulse,
        description: 'Score patient urgency using NEWS2 vitals & red-flag intake, inspect hospital queues, and triage referrals.',
        tips: [
          'Press New Symptom Triage to score and admit patients live',
          'Filter across Mulago, Mbarara, Gulu, Jinja, Kiruddu, and Entebbe'
        ]
      },
      {
        title: 'Live Patient & Waveform Monitor',
        category: 'Module 04',
        targetView: 'monitor',
        actionLabel: 'Open Bio-Monitor',
        icon: Monitor,
        description: 'Visualize real-time ECG, SpO2, blood pressure, and temperature waveforms from external sensors or simulations.',
        tips: [
          'Connect Bluetooth/Serial sensors or run built-in clinical telemetry'
        ]
      },
      {
        title: 'Verified E-Pharmacy Dispensary',
        category: 'Module 05',
        targetView: 'pharmacy',
        actionLabel: 'Open E-Pharmacy',
        icon: Pill,
        description: 'Order NDA-verified medicines with live stock status, Rx checks, printable receipts, and rapid reorder.',
        tips: [
          'Switch cleanly between All, OTC, and Prescription categories'
        ]
      },
      {
        title: 'EHR History & Security Systems Hub',
        category: 'Module 06',
        targetView: 'records',
        actionLabel: 'Open Medical Records',
        icon: FileText,
        description: 'Store consultations, medications, and diagnostic files offline-first with strict session & encryption controls.',
        tips: [
          'Export medical records or inspect Help & Security settings anytime'
        ]
      }
    ]
  };

  const activeGuide = tutorialMode === 'page' ? getPageTutorialContent(currentView) : fullPlatformTour;
  const totalSteps = activeGuide.steps.length;
  const safeIndex = Math.min(activeStepIndex, Math.max(0, totalSteps - 1));
  const currentStep = activeGuide.steps[safeIndex] || activeGuide.steps[0];
  const StepIcon = currentStep.icon;

  const handleNext = useCallback(() => {
    if (safeIndex < totalSteps - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [safeIndex, totalSteps, onClose]);

  const handlePrev = useCallback(() => {
    setActiveStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;

  const displayTitle =
    tutorialLang === 'lg' && activeGuide.lugandaTitle
      ? activeGuide.lugandaTitle
      : tutorialLang === 'sw' && activeGuide.swahiliTitle
      ? activeGuide.swahiliTitle
      : activeGuide.pageTitle;

  const displayDescription =
    tutorialLang === 'lg' && currentStep.lugandaDescription
      ? currentStep.lugandaDescription
      : tutorialLang === 'sw' && currentStep.swahiliDescription
      ? currentStep.swahiliDescription
      : currentStep.description;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctorian-tutorial-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-2xl max-h-[90dvh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100"
        >
          {/* Top Header */}
          <div className="px-5 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <HelpCircle size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-blue-600 dark:text-cyan-400">
                    {tutorialMode === 'page' ? 'Page Guide' : 'Platform Tour'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums font-mono">
                    Step {safeIndex + 1} of {totalSteps}
                  </span>
                </div>
                <h3
                  id="doctorian-tutorial-title"
                  className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate mt-0.5"
                >
                  {displayTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {activeGuide.subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Tutorial"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Mode & Language Toolbar */}
          <div className="px-5 py-2.5 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900">
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setTutorialMode('page')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  tutorialMode === 'page'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Compass size={13} />
                <span>This Page</span>
              </button>
              <button
                type="button"
                onClick={() => setTutorialMode('tour')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  tutorialMode === 'tour'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers size={13} />
                <span>Full App Tour</span>
              </button>
            </div>

            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(
                [
                  { code: 'en', label: 'EN', title: 'English' },
                  { code: 'lg', label: 'LG', title: 'Luganda' },
                  { code: 'sw', label: 'SW', title: 'Kiswahili' }
                ] as const
              ).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  title={lang.title}
                  onClick={() => setTutorialLang(lang.code)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tutorialLang === lang.code
                      ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Scrollable Step Content */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Clickable Segmented Progress Indicator */}
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
              {activeGuide.steps.map((step, idx) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  aria-label={`Jump to step ${idx + 1}: ${step.title}`}
                  className="group py-1.5 text-left cursor-pointer focus:outline-none"
                >
                  <div
                    className={`h-1.5 w-full rounded-full transition-colors duration-150 ${
                      idx === safeIndex
                        ? 'bg-blue-600 dark:bg-cyan-400'
                        : idx < safeIndex
                        ? 'bg-blue-300 dark:bg-cyan-700'
                        : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Step Title Lockup */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <StepIcon size={24} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-blue-600 dark:text-cyan-400">{currentStep.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">0{safeIndex + 1}</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                  {currentStep.title}
                </h4>
              </div>
            </div>

            {/* Step Explanation */}
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                {displayDescription}
              </p>
              {tutorialLang !== 'en' && displayDescription !== currentStep.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  English: {currentStep.description}
                </p>
              )}
            </div>

            {/* Clinical Workflow Tips */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
              <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {tutorialLang === 'lg'
                  ? 'Ebikulu eby’okumanya'
                  : tutorialLang === 'sw'
                  ? 'Mambo muhimu ya kuzingatia'
                  : 'Clinical workflow highlights'}
              </h5>
              <ul className="space-y-2">
                {currentStep.tips.map((tip, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contextual Navigation Action */}
            {currentStep.actionLabel && (currentStep.onAction || currentStep.targetView) && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep.onAction) {
                      currentStep.onAction();
                    } else if (currentStep.targetView) {
                      onNavigate?.(currentStep.targetView);
                    }
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
                >
                  <span>{currentStep.actionLabel}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3.5 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeIndex === 0}
                onClick={handlePrev}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Keyboard size={12} />
                <span>Arrows to navigate</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer min-h-[40px]"
              >
                Skip
              </button>

              {safeIndex < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px] whitespace-nowrap shrink-0"
                >
                  <span>Next Step</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px] whitespace-nowrap shrink-0"
                >
                  <CheckCircle2 size={16} />
                  <span>Done</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PageTutorialModal;
