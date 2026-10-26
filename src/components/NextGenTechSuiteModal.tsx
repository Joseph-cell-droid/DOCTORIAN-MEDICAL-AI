import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Heart,
  Stethoscope,
  Users,
  Mic,
  Radio,
  Layers,
  Activity,
  CheckCircle2,
  Cpu,
  Globe2,
  ChevronRight,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { OpticalPulseScanner } from './OpticalPulseScanner';
import { AcousticDigitalStethoscope } from './AcousticDigitalStethoscope';
import { MultiSpecialistConsensusMatrix } from './MultiSpecialistConsensusMatrix';
import { VocalBiomarkerEngine } from './VocalBiomarkerEngine';
import { OfflineMeshSyncHub } from './OfflineMeshSyncHub';
import { InteractiveOrganTwin } from './InteractiveOrganTwin';
import { translate } from '../utils/translations';
import { isMarianMTModeActive } from '../utils/marianMT';

export type NextGenTechTab = 
  | 'optical_pulse'
  | 'stethoscope'
  | 'consensus_matrix'
  | 'vocal_biomarker'
  | 'mesh_sync'
  | 'organ_twin';

interface NextGenTechSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: NextGenTechTab;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
  currentLanguage?: string;
}

export const NextGenTechSuiteModal: React.FC<NextGenTechSuiteModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'optical_pulse',
  onShowToast,
  currentLanguage = 'English (US)'
}) => {
  const [activeTab, setActiveTab] = useState<NextGenTechTab>(initialTab);
  const [sharedVitals, setSharedVitals] = useState<{ hr: number; hrv: number; respRate: number; spo2Est: number }>({
    hr: 74,
    hrv: 49,
    respRate: 16,
    spo2Est: 98
  });

  const t = (key: string, defaultText?: string) => {
    return translate(defaultText || key, currentLanguage);
  };

  const tabs: {
    id: NextGenTechTab;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    accent: string;
    badge: string;
  }[] = [
    {
      id: 'optical_pulse',
      label: t('nextgen_optical_pulse_title', 'Contactless rPPG Pulse'),
      sublabel: t('nextgen_optical_pulse_sub', 'Camera micro-vascular blood flow'),
      icon: Activity,
      accent: 'from-rose-500 to-pink-600',
      badge: 'Optical'
    },
    {
      id: 'stethoscope',
      label: t('nextgen_stethoscope_title', 'Digital Stethoscope'),
      sublabel: t('nextgen_stethoscope_sub', 'Phonocardiogram & lung acoustics'),
      icon: Stethoscope,
      accent: 'from-blue-500 to-cyan-600',
      badge: 'Acoustic'
    },
    {
      id: 'consensus_matrix',
      label: t('nextgen_consensus_title', 'Specialist AI Matrix'),
      sublabel: t('nextgen_consensus_sub', 'Multi-agent tumor board deliberation'),
      icon: Users,
      accent: 'from-indigo-500 to-purple-600',
      badge: 'Deliberation'
    },
    {
      id: 'vocal_biomarker',
      label: t('nextgen_vocal_title', 'Vocal Biomarkers'),
      sublabel: t('nextgen_vocal_sub', 'Neurological jitter & tremor acoustic analysis'),
      icon: Mic,
      accent: 'from-amber-500 to-orange-600',
      badge: 'Neurologic'
    },
    {
      id: 'mesh_sync',
      label: t('nextgen_mesh_title', 'Offline Mesh Sync'),
      sublabel: t('nextgen_mesh_sub', 'P2P low-bandwidth rural clinical mesh'),
      icon: Radio,
      accent: 'from-emerald-500 to-teal-600',
      badge: 'P2P Mesh'
    },
    {
      id: 'organ_twin',
      label: t('nextgen_twin_title', '4D Organ Twin'),
      sublabel: t('nextgen_twin_sub', 'Real-time biomechanical simulation'),
      icon: Heart,
      accent: 'from-violet-500 to-purple-700',
      badge: 'Biomechanical'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('nextgen_tech_suite_header', 'Next-Generation Clinical AI Intelligence Suite')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Doctorian Pro v4.0
                </span>
                {isMarianMTModeActive() && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <Globe2 size={10} /> Marian MT & Sunbird AI Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('nextgen_tech_suite_desc', 'Breakthrough non-invasive biometrics, acoustic diagnostics, multi-specialist consensus, and biomechanical organ twin.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-150 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Close Suite"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 p-3 sm:px-6 border-b border-slate-150 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md border-transparent scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon size={14} />
                </div>
                <span>{tab.label}</span>
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/30">
          <AnimatePresence mode="wait">
            {activeTab === 'optical_pulse' && (
              <motion.div
                key="tab-optical-pulse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <OpticalPulseScanner
                  onSaveReading={(reading) => {
                    setSharedVitals(reading);
                    if (onShowToast) {
                      onShowToast(
                        `Biometric pulse reading synced: ${reading.hr} BPM | SpO2 ${reading.spo2Est}%`,
                        'success'
                      );
                    }
                  }}
                  onShowToast={onShowToast}
                />
              </motion.div>
            )}

            {activeTab === 'stethoscope' && (
              <motion.div
                key="tab-stethoscope"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AcousticDigitalStethoscope onShowToast={onShowToast} />
              </motion.div>
            )}

            {activeTab === 'consensus_matrix' && (
              <motion.div
                key="tab-consensus"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MultiSpecialistConsensusMatrix onShowToast={onShowToast} />
              </motion.div>
            )}

            {activeTab === 'vocal_biomarker' && (
              <motion.div
                key="tab-vocal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <VocalBiomarkerEngine onShowToast={onShowToast} />
              </motion.div>
            )}

            {activeTab === 'mesh_sync' && (
              <motion.div
                key="tab-mesh"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <OfflineMeshSyncHub onShowToast={onShowToast} />
              </motion.div>
            )}

            {activeTab === 'organ_twin' && (
              <motion.div
                key="tab-organ-twin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <InteractiveOrganTwin
                  liveBpm={sharedVitals.hr}
                  liveSpo2={sharedVitals.spo2Est}
                  onShowToast={onShowToast}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Quick Telemetry Bar */}
        <div className="p-3 sm:px-6 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-bold">
              Neural Telemetry Bus Connected
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              Synced BPM: <strong className="text-blue-600 dark:text-blue-400">{sharedVitals.hr}</strong> | HRV: <strong className="text-emerald-600 dark:text-emerald-400">{sharedVitals.hrv} ms</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onShowToast) onShowToast('Exporting high-resolution diagnostic biometrics packet...', 'info');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              Export Diagnostic Packet
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NextGenTechSuiteModal;
