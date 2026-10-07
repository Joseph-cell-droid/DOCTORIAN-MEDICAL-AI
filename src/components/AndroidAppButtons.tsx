import React, { useState, useMemo } from 'react';
import {
  Home,
  Bot,
  Sparkles,
  Monitor,
  Pill,
  Activity,
  Calendar,
  AlertTriangle,
  FlaskConical,
  ShieldCheck,
  HardDrive,
  Folder,
  User,
  Layers,
  Search,
  X,
  Zap,
  CheckCircle2,
  HeartPulse,
  Compass,
  ArrowRight,
  Radio,
  Cpu,
  Info,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BioTelemetryRangeTooltip } from './BioTelemetryRangeTooltip';

export type ClinicalCategory = 'all' | 'triage' | 'telemetry' | 'diagnostics' | 'records';

export interface ClinicalModuleTheme {
  // Transparent card styling
  borderColor: string;
  darkBorderColor: string;
  hoverBorderColor: string;
  hoverBg: string;
  // Icon styling
  iconGradient: string;
  iconShadow: string;
  accentColor: string;
  // Badge styling
  badgeColor: string;
  // Active transparent state styling
  activeBg: string;
  activeBorder: string;
  activeRing: string;
}

export interface IntelligentAppButtonItem {
  id: string;
  label: string;
  subtitle: string;
  category: 'triage' | 'telemetry' | 'diagnostics' | 'records';
  categoryLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  theme: ClinicalModuleTheme;
  badge?: string;
  isUrgent?: boolean;
  // Modern Intelligence & Clinical Features
  intelligenceTag: string;
  guidelineCompliance: string;
  clinicalCapabilities: string[];
  priorityLevel: 'critical' | 'high' | 'standard';
}

export const CLINICAL_MODULES_REGISTRY: IntelligentAppButtonItem[] = [
  // 1. Clinical Dashboard - Electric Blue / Cobalt
  {
    id: 'home',
    label: 'Clinical Dashboard',
    subtitle: 'Vitals stream & overview',
    category: 'triage',
    categoryLabel: 'Core Hub',
    icon: Home,
    intelligenceTag: 'Live Telemetry Stream',
    guidelineCompliance: 'WHO Patient Monitoring Standard',
    clinicalCapabilities: ['Real-Time Vitals Stream', 'Triage Status', 'Activity Matrix'],
    priorityLevel: 'high',
    theme: {
      borderColor: 'border-blue-200/80',
      darkBorderColor: 'dark:border-blue-900/50',
      hoverBorderColor: 'hover:border-blue-500/80 dark:hover:border-blue-400',
      hoverBg: 'hover:bg-blue-500/[0.05] dark:hover:bg-blue-400/[0.06]',
      iconGradient: 'from-blue-600 to-indigo-600',
      iconShadow: 'shadow-blue-500/25',
      accentColor: 'blue',
      badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/80 dark:border-blue-800/60',
      activeBg: 'bg-blue-600/[0.12] dark:bg-blue-500/[0.18]',
      activeBorder: 'border-blue-500 dark:border-blue-400',
      activeRing: 'ring-1 ring-blue-500/30',
    },
  },

  // 2. AI Consultation - Royal Purple / Violet
  {
    id: 'ai_nexus',
    label: 'AI Consultation',
    subtitle: 'WHO & UCG AI co-pilot',
    category: 'triage',
    categoryLabel: 'Clinical AI',
    icon: Bot,
    badge: 'AI CO-PILOT',
    intelligenceTag: 'Gemini 2.5 Diagnostic Engine',
    guidelineCompliance: 'Uganda Clinical Guidelines 2023',
    clinicalCapabilities: ['Differential Triage', 'Symptom Ingestion', 'Evidence Citations'],
    priorityLevel: 'critical',
    theme: {
      borderColor: 'border-purple-200/80',
      darkBorderColor: 'dark:border-purple-900/50',
      hoverBorderColor: 'hover:border-purple-500/80 dark:hover:border-purple-400',
      hoverBg: 'hover:bg-purple-500/[0.05] dark:hover:bg-purple-400/[0.06]',
      iconGradient: 'from-purple-600 to-violet-700',
      iconShadow: 'shadow-purple-500/25',
      accentColor: 'purple',
      badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/80 dark:border-purple-800/60',
      activeBg: 'bg-purple-600/[0.12] dark:bg-purple-500/[0.18]',
      activeBorder: 'border-purple-500 dark:border-purple-400',
      activeRing: 'ring-1 ring-purple-500/30',
    },
  },

  // 3. Symptom Triage - Emerald Green / Mint
  {
    id: 'symptoms',
    label: 'Symptom Triage',
    subtitle: 'Differential diagnosis',
    category: 'triage',
    categoryLabel: 'Diagnostics',
    icon: Sparkles,
    badge: 'SMART TRIAGE',
    intelligenceTag: 'Bayesian Decision Tree',
    guidelineCompliance: 'Integrated Management of Illness (IMCI)',
    clinicalCapabilities: ['Multi-Symptom Scorer', 'Red-Flag Detection', 'Urgency Triage'],
    priorityLevel: 'critical',
    theme: {
      borderColor: 'border-emerald-200/80',
      darkBorderColor: 'dark:border-emerald-900/50',
      hoverBorderColor: 'hover:border-emerald-500/80 dark:hover:border-emerald-400',
      hoverBg: 'hover:bg-emerald-500/[0.05] dark:hover:bg-emerald-400/[0.06]',
      iconGradient: 'from-emerald-500 to-teal-600',
      iconShadow: 'shadow-emerald-500/25',
      accentColor: 'emerald',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800/60',
      activeBg: 'bg-emerald-600/[0.12] dark:bg-emerald-500/[0.18]',
      activeBorder: 'border-emerald-500 dark:border-emerald-400',
      activeRing: 'ring-1 ring-emerald-500/30',
    },
  },

  // 4. Precision Pharmacy - Electric Cyan / Turquoise
  {
    id: 'meds',
    label: 'Precision Pharmacy',
    subtitle: 'Dosage & interactions',
    category: 'triage',
    categoryLabel: 'Pharmacology',
    icon: Pill,
    badge: 'DRUG SAFETY',
    intelligenceTag: 'Cross-Reaction Scanner',
    guidelineCompliance: 'National Essential Medicines List (EMLU)',
    clinicalCapabilities: ['Contraindication Guard', 'Pediatric/Renal Dosing', 'Adverse Alerts'],
    priorityLevel: 'high',
    theme: {
      borderColor: 'border-cyan-200/80',
      darkBorderColor: 'dark:border-cyan-900/50',
      hoverBorderColor: 'hover:border-cyan-500/80 dark:hover:border-cyan-400',
      hoverBg: 'hover:bg-cyan-500/[0.05] dark:hover:bg-cyan-400/[0.06]',
      iconGradient: 'from-cyan-500 to-blue-600',
      iconShadow: 'shadow-cyan-500/25',
      accentColor: 'cyan',
      badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-300/80 dark:border-cyan-800/60',
      activeBg: 'bg-cyan-600/[0.12] dark:bg-cyan-500/[0.18]',
      activeBorder: 'border-cyan-500 dark:border-cyan-400',
      activeRing: 'ring-1 ring-cyan-500/30',
    },
  },

  // 5. Emergency SOS 911/112 - Crimson Ruby / Red
  {
    id: 'emergency',
    label: 'Emergency SOS 911',
    subtitle: '24/7 acute resuscitation',
    category: 'triage',
    categoryLabel: 'Emergency',
    icon: AlertTriangle,
    badge: '24/7 SOS',
    isUrgent: true,
    intelligenceTag: 'Geo-Dispatch & Resuscitation',
    guidelineCompliance: 'Advanced Trauma & Cardiac Life Support',
    clinicalCapabilities: ['1-Tap Dispatch', 'GPS Coordinates', 'Step-by-Step CPR Guide'],
    priorityLevel: 'critical',
    theme: {
      borderColor: 'border-rose-300/80',
      darkBorderColor: 'dark:border-rose-900/60',
      hoverBorderColor: 'hover:border-rose-500 dark:hover:border-rose-400',
      hoverBg: 'hover:bg-rose-500/[0.07] dark:hover:bg-rose-400/[0.08]',
      iconGradient: 'from-rose-600 to-red-600',
      iconShadow: 'shadow-rose-500/30',
      accentColor: 'rose',
      badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300/80 dark:border-rose-800/60 animate-pulse',
      activeBg: 'bg-rose-600/[0.14] dark:bg-rose-500/[0.2]',
      activeBorder: 'border-rose-500 dark:border-rose-400',
      activeRing: 'ring-1 ring-rose-500/30',
    },
  },

  // 6. Bio-Telemetry Monitor - Golden Amber / Solar
  {
    id: 'monitor',
    label: 'Bio-Telemetry Monitor',
    subtitle: 'Real-time ECG & SpO2',
    category: 'telemetry',
    categoryLabel: 'Telemetry',
    icon: Monitor,
    badge: 'LIVE SENSORS',
    intelligenceTag: 'Waveform Telemetry v3.1',
    guidelineCompliance: 'FDA Class II Telemetry Norms',
    clinicalCapabilities: ['Continuous Waveform', 'Arrhythmia Alarm', 'BLE Sensor Sync'],
    priorityLevel: 'high',
    theme: {
      borderColor: 'border-amber-200/80',
      darkBorderColor: 'dark:border-amber-900/50',
      hoverBorderColor: 'hover:border-amber-500/80 dark:hover:border-amber-400',
      hoverBg: 'hover:bg-amber-500/[0.05] dark:hover:bg-amber-400/[0.06]',
      iconGradient: 'from-amber-500 to-orange-600',
      iconShadow: 'shadow-amber-500/25',
      accentColor: 'amber',
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/60',
      activeBg: 'bg-amber-500/[0.12] dark:bg-amber-500/[0.18]',
      activeBorder: 'border-amber-500 dark:border-amber-400',
      activeRing: 'ring-1 ring-amber-500/30',
    },
  },

  // 7. Vitality Matrix - Vivid Magenta / Pink
  {
    id: 'vitality',
    label: 'Vitality Matrix',
    subtitle: 'Cardiovascular trends',
    category: 'telemetry',
    categoryLabel: 'Biometrics',
    icon: Activity,
    badge: 'METABOLIC',
    intelligenceTag: 'Longitudinal AI Trend Analysis',
    guidelineCompliance: 'Cardiovascular Risk Stratification (Framingham)',
    clinicalCapabilities: ['Score Aggregator', 'Metabolic Risk Index', 'Sleep/Recovery Curve'],
    priorityLevel: 'standard',
    theme: {
      borderColor: 'border-pink-200/80',
      darkBorderColor: 'dark:border-pink-900/50',
      hoverBorderColor: 'hover:border-pink-500/80 dark:hover:border-pink-400',
      hoverBg: 'hover:bg-pink-500/[0.05] dark:hover:bg-pink-400/[0.06]',
      iconGradient: 'from-pink-500 to-rose-600',
      iconShadow: 'shadow-pink-500/25',
      accentColor: 'pink',
      badgeColor: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-300/80 dark:border-pink-800/60',
      activeBg: 'bg-pink-600/[0.12] dark:bg-pink-500/[0.18]',
      activeBorder: 'border-pink-500 dark:border-pink-400',
      activeRing: 'ring-1 ring-pink-500/30',
    },
  },

  // 8. Clinical Station Hub - Sky Azure / Blue
  {
    id: 'features',
    label: 'Station Hub',
    subtitle: 'Hardware simulator',
    category: 'telemetry',
    categoryLabel: 'Station',
    icon: Layers,
    badge: 'IOT BRIDGE',
    intelligenceTag: 'Multi-Sensor Simulator & Gateway',
    guidelineCompliance: 'HL7 / FHIR Device Compatibility',
    clinicalCapabilities: ['Virtual Patient Signal', 'Alarm Thresholds', 'Multi-Lead Feed'],
    priorityLevel: 'standard',
    theme: {
      borderColor: 'border-sky-200/80',
      darkBorderColor: 'dark:border-sky-900/50',
      hoverBorderColor: 'hover:border-sky-500/80 dark:hover:border-sky-400',
      hoverBg: 'hover:bg-sky-500/[0.05] dark:hover:bg-sky-400/[0.06]',
      iconGradient: 'from-sky-500 to-blue-600',
      iconShadow: 'shadow-sky-500/25',
      accentColor: 'sky',
      badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/80 dark:border-sky-800/60',
      activeBg: 'bg-sky-600/[0.12] dark:bg-sky-500/[0.18]',
      activeBorder: 'border-sky-500 dark:border-sky-400',
      activeRing: 'ring-1 ring-sky-500/30',
    },
  },

  // 9. Laboratory Analyser - Deep Iris / Indigo
  {
    id: 'diagnostic_lab',
    label: 'Laboratory Analyser',
    subtitle: 'CBC & malaria RDT',
    category: 'diagnostics',
    categoryLabel: 'Pathology',
    icon: FlaskConical,
    badge: 'LAB AI',
    intelligenceTag: 'Optical & Blood Panel Analyser',
    guidelineCompliance: 'WHO Malaria & Hematology Thresholds',
    clinicalCapabilities: ['RDT Strip Vision Scan', 'CBC Differential', 'Critical Lab Alert'],
    priorityLevel: 'high',
    theme: {
      borderColor: 'border-indigo-200/80',
      darkBorderColor: 'dark:border-indigo-900/50',
      hoverBorderColor: 'hover:border-indigo-500/80 dark:hover:border-indigo-400',
      hoverBg: 'hover:bg-indigo-500/[0.05] dark:hover:bg-indigo-400/[0.06]',
      iconGradient: 'from-indigo-600 to-purple-600',
      iconShadow: 'shadow-indigo-500/25',
      accentColor: 'indigo',
      badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300/80 dark:border-indigo-800/60',
      activeBg: 'bg-indigo-600/[0.12] dark:bg-indigo-500/[0.18]',
      activeBorder: 'border-indigo-500 dark:border-indigo-400',
      activeRing: 'ring-1 ring-indigo-500/30',
    },
  },

  // 10. Genomic Matrix - Deep Jade / Teal
  {
    id: 'health_trace',
    label: 'Genomic Matrix',
    subtitle: 'Hereditary biomarkers',
    category: 'diagnostics',
    categoryLabel: 'Genomics',
    icon: HeartPulse,
    badge: 'GENOMICS',
    intelligenceTag: 'Polygenic Risk Scoring',
    guidelineCompliance: 'ClinVar & ACMG Standards',
    clinicalCapabilities: ['Hereditary Predisposition', 'Pharmacogenomics', 'Longevity Profiling'],
    priorityLevel: 'standard',
    theme: {
      borderColor: 'border-teal-200/80',
      darkBorderColor: 'dark:border-teal-900/50',
      hoverBorderColor: 'hover:border-teal-500/80 dark:hover:border-teal-400',
      hoverBg: 'hover:bg-teal-500/[0.05] dark:hover:bg-teal-400/[0.06]',
      iconGradient: 'from-teal-600 to-emerald-600',
      iconShadow: 'shadow-teal-500/25',
      accentColor: 'teal',
      badgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-300/80 dark:border-teal-800/60',
      activeBg: 'bg-teal-600/[0.12] dark:bg-teal-500/[0.18]',
      activeBorder: 'border-teal-500 dark:border-teal-400',
      activeRing: 'ring-1 ring-teal-500/30',
    },
  },

  // 11. Neural Synthesis - Amethyst Violet / Fuchsia
  {
    id: 'neuro',
    label: 'Neural Synthesis',
    subtitle: 'Cognitive mapping',
    category: 'diagnostics',
    categoryLabel: 'Neuro',
    icon: Zap,
    badge: 'NEURO AI',
    intelligenceTag: 'Cognitive State & Stress Biomarkers',
    guidelineCompliance: 'DSM-5 / ICD-11 Neurocognitive Metrics',
    clinicalCapabilities: ['Cortisol / Stress Correlates', 'Neuro-Score', 'Autonomic Tone'],
    priorityLevel: 'standard',
    theme: {
      borderColor: 'border-violet-200/80',
      darkBorderColor: 'dark:border-violet-900/50',
      hoverBorderColor: 'hover:border-violet-500/80 dark:hover:border-violet-400',
      hoverBg: 'hover:bg-violet-500/[0.05] dark:hover:bg-violet-400/[0.06]',
      iconGradient: 'from-violet-600 to-purple-600',
      iconShadow: 'shadow-violet-500/25',
      accentColor: 'violet',
      badgeColor: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-300/80 dark:border-violet-800/60',
      activeBg: 'bg-violet-600/[0.12] dark:bg-violet-500/[0.18]',
      activeBorder: 'border-violet-500 dark:border-violet-400',
      activeRing: 'ring-1 ring-violet-500/30',
    },
  },

  // 12. 1GB Cloud Storage Vault - Ocean Blue / Cyan
  {
    id: 'storage_vault',
    label: '1GB Cloud Vault',
    subtitle: 'Encrypted lab & scans',
    category: 'records',
    categoryLabel: 'Vault',
    icon: HardDrive,
    badge: '1GB FREE',
    intelligenceTag: 'SHA-256 Bit-Check & AES-256',
    guidelineCompliance: 'HIPAA & GDPR Encrypted Cloud Isolation',
    clinicalCapabilities: ['1.00 GB Free Storage', 'SHA-256 Integrity Verification', 'DICOM Scans & Labs'],
    priorityLevel: 'critical',
    theme: {
      borderColor: 'border-blue-200/80',
      darkBorderColor: 'dark:border-blue-900/50',
      hoverBorderColor: 'hover:border-cyan-500/80 dark:hover:border-cyan-400',
      hoverBg: 'hover:bg-cyan-500/[0.05] dark:hover:bg-cyan-400/[0.06]',
      iconGradient: 'from-blue-600 to-cyan-500',
      iconShadow: 'shadow-blue-500/25',
      accentColor: 'cyan',
      badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/80 dark:border-blue-800/60',
      activeBg: 'bg-blue-600/[0.12] dark:bg-blue-500/[0.18]',
      activeBorder: 'border-cyan-500 dark:border-cyan-400',
      activeRing: 'ring-1 ring-cyan-500/30',
    },
  },

  // 13. Electronic Health Records - Titanium Slate / Charcoal
  {
    id: 'records',
    label: 'Health Records EHR',
    subtitle: 'Physician history',
    category: 'records',
    categoryLabel: 'EHR',
    icon: Folder,
    badge: 'SECURE EHR',
    intelligenceTag: 'Structured Longitudinal EHR Record',
    guidelineCompliance: 'FHIR R4 Patient Resource Standard',
    clinicalCapabilities: ['Encounter Timeline', 'SOAP Notes View', 'Encrypted Export'],
    priorityLevel: 'high',
    theme: {
      borderColor: 'border-slate-300/80',
      darkBorderColor: 'dark:border-slate-700/60',
      hoverBorderColor: 'hover:border-slate-500 dark:hover:border-slate-400',
      hoverBg: 'hover:bg-slate-500/[0.05] dark:hover:bg-slate-400/[0.06]',
      iconGradient: 'from-slate-700 to-zinc-800',
      iconShadow: 'shadow-slate-500/25',
      accentColor: 'slate',
      badgeColor: 'bg-slate-500/10 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
      activeBg: 'bg-slate-700/[0.12] dark:bg-slate-600/[0.18]',
      activeBorder: 'border-slate-600 dark:border-slate-400',
      activeRing: 'ring-1 ring-slate-500/30',
    },
  },

  // 14. Appointments & Visits - Sunburst Tangerine / Orange
  {
    id: 'clinical_roadmap',
    label: 'Appointments',
    subtitle: 'Clinician follow-ups',
    category: 'records',
    categoryLabel: 'Visits',
    icon: Calendar,
    badge: 'SCHEDULE',
    intelligenceTag: 'Automated Reminders & Scheduling',
    guidelineCompliance: 'MoH Facility Booking Protocol',
    clinicalCapabilities: ['Calendar Integration', 'SMS Alerts', 'Follow-up Triage'],
    priorityLevel: 'standard',
    theme: {
      borderColor: 'border-orange-200/80',
      darkBorderColor: 'dark:border-orange-900/50',
      hoverBorderColor: 'hover:border-orange-500/80 dark:hover:border-orange-400',
      hoverBg: 'hover:bg-orange-500/[0.05] dark:hover:bg-orange-400/[0.06]',
      iconGradient: 'from-orange-500 to-amber-600',
      iconShadow: 'shadow-orange-500/25',
      accentColor: 'orange',
      badgeColor: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-300/80 dark:border-orange-800/60',
      activeBg: 'bg-orange-500/[0.12] dark:bg-orange-500/[0.18]',
      activeBorder: 'border-orange-500 dark:border-orange-400',
      activeRing: 'ring-1 ring-orange-500/30',
    },
  },

  // 15. Biometric Profile & Settings - Royal Lavender / Plum
  {
    id: 'profile',
    label: 'Biometric Profile',
    subtitle: 'Patient preferences',
    category: 'records',
    categoryLabel: 'Profile',
    icon: User,
    badge: 'PATIENT ID',
    intelligenceTag: 'Biometric Credential Management',
    guidelineCompliance: 'ISO/IEC 27001 Identity Protection',
    clinicalCapabilities: ['Emergency Contacts', 'Allergy Registry', 'Biometric Keys'],
    priorityLevel: 'standard',
    theme: {
      borderColor: 'border-purple-200/80',
      darkBorderColor: 'dark:border-purple-900/50',
      hoverBorderColor: 'hover:border-purple-500/80 dark:hover:border-indigo-400',
      hoverBg: 'hover:bg-purple-500/[0.05] dark:hover:bg-purple-400/[0.06]',
      iconGradient: 'from-purple-600 to-indigo-600',
      iconShadow: 'shadow-purple-500/25',
      accentColor: 'purple',
      badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/80 dark:border-purple-800/60',
      activeBg: 'bg-purple-600/[0.12] dark:bg-purple-500/[0.18]',
      activeBorder: 'border-purple-500 dark:border-purple-400',
      activeRing: 'ring-1 ring-indigo-500/30',
    },
  },

  // 16. Hospital Administration - Forest Green / Olive
  {
    id: 'admin',
    label: 'Hospital Admin',
    subtitle: 'Bed & facility triage',
    category: 'records',
    categoryLabel: 'Facility',
    icon: ShieldCheck,
    badge: 'MOH TRIAGE',
    intelligenceTag: 'Facility Resource Optimization',
    guidelineCompliance: 'National Health Services Directorate',
    clinicalCapabilities: ['Bed Occupancy', 'Oxygen Supply Sensor', 'Staff On-Duty'],
    priorityLevel: 'standard',
    theme: {
      borderColor: 'border-emerald-200/80',
      darkBorderColor: 'dark:border-emerald-900/50',
      hoverBorderColor: 'hover:border-emerald-500/80 dark:hover:border-emerald-400',
      hoverBg: 'hover:bg-emerald-500/[0.05] dark:hover:bg-emerald-400/[0.06]',
      iconGradient: 'from-emerald-700 to-teal-800',
      iconShadow: 'shadow-emerald-700/25',
      accentColor: 'emerald',
      badgeColor: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800/60',
      activeBg: 'bg-emerald-700/[0.12] dark:bg-emerald-600/[0.18]',
      activeBorder: 'border-emerald-600 dark:border-emerald-400',
      activeRing: 'ring-1 ring-emerald-500/30',
    },
  },
];

interface AndroidAppButtonsProps {
  currentView: string;
  onNavigate: (view: string) => void;
  variant?: 'vertical_list' | 'horizontal_row' | 'both';
  onItemClick?: () => void;
}

/**
 * AndroidAppButtons:
 * Renders clinical modules with ultra-modern transparent button backgrounds,
 * vibrant squircle icons, real-time intelligence telemetry tags, and responsive two-column grid.
 */
export const AndroidAppButtons: React.FC<AndroidAppButtonsProps> = ({
  currentView,
  onNavigate,
  onItemClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ClinicalCategory>('all');
  const [previewModule, setPreviewModule] = useState<IntelligentAppButtonItem | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  const handleSelect = (viewId: string) => {
    onNavigate(viewId);
    onItemClick?.();
  };

  // Filter modules intelligently by search query, category and optional quick tag
  const filteredModules = useMemo(() => {
    return CLINICAL_MODULES_REGISTRY.filter((mod) => {
      const matchesCategory = activeCategory === 'all' || mod.category === activeCategory;
      if (!matchesCategory) return false;

      if (selectedTagFilter === 'critical' && mod.priorityLevel !== 'critical') {
        return false;
      }
      if (selectedTagFilter === 'ai' && !mod.badge?.includes('AI') && !mod.intelligenceTag.includes('AI') && !mod.intelligenceTag.includes('Gemini')) {
        return false;
      }
      if (selectedTagFilter === 'live' && !mod.badge?.includes('LIVE') && !mod.intelligenceTag.includes('Live')) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        mod.label.toLowerCase().includes(q) ||
        mod.subtitle.toLowerCase().includes(q) ||
        mod.categoryLabel.toLowerCase().includes(q) ||
        mod.intelligenceTag.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery, selectedTagFilter]);

  // Contextual smart recommendation with active telemetry
  const intelligentTip = useMemo(() => {
    switch (currentView) {
      case 'home':
        return {
          text: 'AI Pulse: Vitals streaming steady. Connect Bio-Telemetry for live ECG & SpO2 wave.',
          actionLabel: 'Launch Telemetry',
          targetView: 'monitor',
          badge: 'Live ECG',
        };
      case 'monitor':
        return {
          text: 'AI Pulse: Ingest live vitals into Bayesian Symptom Triage for differential scoring.',
          actionLabel: 'Smart Triage',
          targetView: 'symptoms',
          badge: 'Differential AI',
        };
      case 'ai_nexus':
        return {
          text: 'AI Pulse: Validate proposed therapeutics with Cross-Reaction Pharmacological Guard.',
          actionLabel: 'Check Pharmacy',
          targetView: 'meds',
          badge: 'Drug Safety',
        };
      case 'meds':
        return {
          text: 'AI Pulse: Store prescriptions and diagnostic scans in 1GB Cloud Storage Vault.',
          actionLabel: 'Open 1GB Vault',
          targetView: 'storage_vault',
          badge: '1GB Free',
        };
      default:
        return {
          text: 'Doctorian OS: Grounded in WHO and Uganda Clinical Guidelines (UCG 2023).',
          actionLabel: 'Consult AI',
          targetView: 'ai_nexus',
          badge: 'Gemini 2.5',
        };
    }
  }, [currentView]);

  const categories: { id: ClinicalCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Modules', count: CLINICAL_MODULES_REGISTRY.length },
    {
      id: 'triage',
      label: 'Triage & Care',
      count: CLINICAL_MODULES_REGISTRY.filter((m) => m.category === 'triage').length,
    },
    {
      id: 'telemetry',
      label: 'Bio-Telemetry',
      count: CLINICAL_MODULES_REGISTRY.filter((m) => m.category === 'telemetry').length,
    },
    {
      id: 'diagnostics',
      label: 'Diagnostics & Lab',
      count: CLINICAL_MODULES_REGISTRY.filter((m) => m.category === 'diagnostics').length,
    },
    {
      id: 'records',
      label: 'Vault & Records',
      count: CLINICAL_MODULES_REGISTRY.filter((m) => m.category === 'records').length,
    },
  ];

  return (
    <div className="w-full space-y-3.5 select-none pb-3">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. LATEST INTELLIGENCE TELEMETRY & CONTEXT ACTION BAR     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/[0.07] via-cyan-500/[0.05] to-indigo-500/[0.07] backdrop-blur-xs border border-cyan-500/30 dark:border-cyan-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                {intelligentTip.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Neural Decision Engine v4.2</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium">
              {intelligentTip.text}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSelect(intelligentTip.targetView)}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs whitespace-nowrap flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
        >
          <span>{intelligentTip.actionLabel}</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. TRANSPARENT SEARCH & CATEGORY FILTER BAR                */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Search Input Bar (Transparent Frosted Glass) */}
        <div className="relative flex items-center">
          <Search
            size={16}
            className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clinical modules, triage, lab or EHR..."
            className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl bg-transparent hover:bg-slate-500/[0.03] focus:bg-slate-500/[0.05] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 dark:focus:border-cyan-400 transition-all backdrop-blur-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Transparent Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs border border-blue-500'
                    : 'bg-transparent hover:bg-slate-500/[0.06] dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modern Quick Intelligence Tags (Transparent Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 shrink-0">
            Quick Filter:
          </span>
          {[
            { id: 'critical', label: '🚨 Critical Triage' },
            { id: 'ai', label: '🤖 AI Co-Pilot' },
            { id: 'live', label: '📡 Live Stream' },
          ].map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTagFilter(selectedTagFilter === tag.id ? null : tag.id)}
              className={`text-[10.5px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer shrink-0 ${
                selectedTagFilter === tag.id
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'bg-transparent border-slate-200/70 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300'
              }`}
            >
              {tag.label}
            </button>
          ))}
          {selectedTagFilter && (
            <button
              type="button"
              onClick={() => setSelectedTagFilter(null)}
              className="text-[10px] text-rose-500 hover:underline font-semibold cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. TRANSPARENT SQUARE BUTTONS IN TWO COLUMNS (grid-cols-2) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-0.5 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {activeCategory === 'all'
              ? 'All Clinical Modules'
              : `${categories.find((c) => c.id === activeCategory)?.label}`}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredModules.length} modules ready
          </span>
        </div>

        {filteredModules.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-transparent">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No clinical modules found matching "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setSelectedTagFilter(null);
              }}
              className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* TWO COLUMNS OF SQUARE BUTTONS WITH TRANSPARENT BACKGROUND */
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {filteredModules.map((btn) => {
              const isActive = currentView === btn.id;
              const IconComp = btn.icon;

              const moduleCard = (
                <div
                  key={`module-${btn.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(btn.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(btn.id);
                    }
                  }}
                  className={`w-full aspect-[1/0.95] sm:aspect-square min-h-[145px] sm:min-h-[160px] p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl text-left transition-all duration-200 active:scale-[0.96] flex flex-col justify-between relative overflow-hidden group cursor-pointer border select-none ${
                    isActive
                      ? `${btn.theme.activeBg} ${btn.theme.activeBorder} ${btn.theme.activeRing} shadow-md`
                      : `bg-transparent ${btn.theme.hoverBg} ${btn.theme.borderColor} ${btn.theme.darkBorderColor} ${btn.theme.hoverBorderColor}`
                  }`}
                >
                  {/* Ambient Subtle Radial Highlight on Hover */}
                  <div
                    className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${
                      isActive
                        ? 'opacity-40 bg-blue-500 dark:bg-blue-400'
                        : 'opacity-0 group-hover:opacity-25 bg-current text-' + btn.theme.accentColor + '-500'
                    }`}
                  />

                  {/* Top Row: Squircle Icon & Badge / Active Status */}
                  <div className="flex items-start justify-between gap-1.5 w-full relative z-10">
                    {/* Modern Squircle Icon Container with Vibrant Gradient */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm ${
                        isActive
                          ? `bg-gradient-to-tr ${btn.theme.iconGradient} text-white shadow-md ring-2 ring-blue-400/40`
                          : `bg-gradient-to-tr ${btn.theme.iconGradient} text-white ${btn.theme.iconShadow}`
                      }`}
                    >
                      <IconComp size={20} className={btn.isUrgent && !isActive ? 'animate-bounce' : ''} />
                    </div>

                    {/* Top-Right Badge or Active Status */}
                    <div className="shrink-0 flex items-center gap-1">
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1 shadow-xs font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>ACTIVE</span>
                        </span>
                      ) : btn.badge ? (
                        <span
                          className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md font-mono tracking-wider border leading-none ${btn.theme.badgeColor}`}
                        >
                          {btn.badge}
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 font-mono">
                          {btn.categoryLabel}
                        </span>
                      )}

                      {/* Info preview icon button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewModule(btn);
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-blue-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={`View ${btn.label} Details`}
                      >
                        <Info size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Middle & Bottom Area: Module Title & Latest Intelligence */}
                  <div className="w-full relative z-10 pt-2">
                    <h4
                      className={`text-[12.5px] sm:text-[14px] font-black tracking-tight leading-snug line-clamp-2 transition-colors ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}
                    >
                      {btn.label}
                    </h4>

                    <p className="text-[10px] sm:text-[11px] leading-tight line-clamp-1 mt-0.5 text-slate-500 dark:text-slate-400 font-medium">
                      {btn.subtitle}
                    </p>

                    {/* Modern Intelligence Telemetry Tag */}
                    <div className="mt-2 flex items-center justify-between gap-1 border-t border-slate-200/50 dark:border-slate-800/60 pt-1.5">
                      <span className="text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        {btn.intelligenceTag}
                      </span>
                      {isActive ? (
                        <CheckCircle2 size={12} className="text-blue-600 dark:text-blue-400 shrink-0 ml-1" />
                      ) : (
                        <div
                          className={`h-1 w-5 rounded-full transition-all duration-300 group-hover:w-8 bg-gradient-to-r ${btn.theme.iconGradient}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );

              if (btn.id === 'monitor') {
                return (
                  <BioTelemetryRangeTooltip
                    key={`module-tip-${btn.id}`}
                    position="top"
                    align="center"
                    triggerClassName="w-full block"
                  >
                    {moduleCard}
                  </BioTelemetryRangeTooltip>
                );
              }

              return moduleCard;
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. CLINICAL STANDARDS & PROTOCOL BADGE                     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="pt-1">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-transparent border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <span className="text-[11px] font-medium leading-tight">
              WHO & Uganda MoH Clinical Guidelines Active
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Encrypted • 256-Bit</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 5. INTELLIGENT MODULE FEATURE PREVIEW DRAWER               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {previewModule && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${previewModule.theme.iconGradient} text-white flex items-center justify-center shadow-md`}
                  >
                    {React.createElement(previewModule.icon, { size: 24 })}
                  </div>
                  <div>
                    <h4 className="text-base font-black">{previewModule.label}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {previewModule.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModule(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Intelligence Details */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Intelligence Engine:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                      {previewModule.intelligenceTag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Clinical Standard:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {previewModule.guidelineCompliance}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Priority Level:</span>
                    <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700">
                      {previewModule.priorityLevel}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-xs mb-1 text-slate-700 dark:text-slate-300">
                    Clinical Capabilities:
                  </p>
                  <ul className="space-y-1">
                    {previewModule.clinicalCapabilities.map((cap, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Check size={13} className="text-emerald-500 shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const target = previewModule.id;
                    setPreviewModule(null);
                    handleSelect(target);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <span>Open {previewModule.label}</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModule(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
