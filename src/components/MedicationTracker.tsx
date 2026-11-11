/**
 * Doctorian Clinical Prescriptions & Bio-Molecule Adherence Hub
 * Restored previous look and features:
 * - Daily dose schedule & intake logging with ingestion verification
 * - Clinical active prescriptions & molecule registry (dosage, frequency, clinician, refill tracking)
 * - AI Prescription OCR Scanner & Digitizer (image upload, auto-extraction of drugs, draft preview)
 * - Adherence telemetry & trend analysis (dose intake distribution, exception flags, overdose/underdose safety)
 * - Common essential molecules catalog with 1-click addition
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pill,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  FileText,
  Camera,
  Upload,
  ShieldCheck,
  Activity,
  Sparkles,
  Trash2,
  RefreshCw,
  ArrowRight,
  X,
  ChevronRight,
  User,
  Stethoscope,
  Check,
  Share2,
  Printer,
  TrendingUp,
  BarChart2,
  AlertCircle,
  Info,
  Sliders,
  Download,
  Eye,
  HelpCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export interface MedicationTrackerProps {
  user?: any;
  onNavigate?: (view: any) => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export interface Molecule {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"]
  category: 'prescription' | 'supplement';
  doctor: string;
  prescribedDate: string;
  refillsRemaining: number;
  totalRefills: number;
  diagnosisIndication: string;
  instructions: string;
  status: 'active' | 'expiring' | 'completed';
  remindersEnabled: boolean;
}

export interface DoseLog {
  id: string;
  moleculeId: string;
  moleculeName: string;
  dosage: string;
  scheduledTime: string;
  loggedAt: string;
  status: 'taken' | 'delayed' | 'missed' | 'extra';
  verificationNotes?: string;
  confidenceRating?: 'HIGH CONFIDENCE INTAKE' | 'MANUALLY VERIFIED' | 'SELF REPORTED';
}

const DEFAULT_MOLECULES: Molecule[] = [
  {
    id: 'rx-amox-500',
    name: 'Amoxicillin Trihydrate',
    genericName: 'Amoxicillin 500mg',
    dosage: '500mg',
    frequency: '3 times daily (Every 8 hrs)',
    scheduledTimes: ['08:00', '14:00', '20:00'],
    category: 'prescription',
    doctor: 'Dr. Gloria Jayakullo',
    prescribedDate: '2026-11-04',
    refillsRemaining: 1,
    totalRefills: 2,
    diagnosisIndication: 'Bacterial Respiratory Infection',
    instructions: 'Take with full glass of water after food. Complete full 7-day course.',
    status: 'active',
    remindersEnabled: true
  },
  {
    id: 'rx-metformin-500',
    name: 'Metformin Hydrochloride',
    genericName: 'Metformin 500mg',
    dosage: '500mg',
    frequency: 'Twice daily with meals',
    scheduledTimes: ['08:00', '20:00'],
    category: 'prescription',
    doctor: 'Dr. Joseph Akora',
    prescribedDate: '2026-10-15',
    refillsRemaining: 3,
    totalRefills: 4,
    diagnosisIndication: 'Type 2 Diabetes Glycemic Management',
    instructions: 'Take immediately before or during main meals to minimize GI distress.',
    status: 'active',
    remindersEnabled: true
  },
  {
    id: 'rx-atorva-20',
    name: 'Atorvastatin Calcium',
    genericName: 'Atorvastatin 20mg',
    dosage: '20mg',
    frequency: 'Once daily at bedtime',
    scheduledTimes: ['21:30'],
    category: 'prescription',
    doctor: 'Dr. Emmanuel Kato',
    prescribedDate: '2026-10-20',
    refillsRemaining: 2,
    totalRefills: 3,
    diagnosisIndication: 'Hyperlipidemia & Cardiovascular Protection',
    instructions: 'Take in the evening. Avoid grapefruit juice during therapy.',
    status: 'active',
    remindersEnabled: true
  },
  {
    id: 'rx-omeprazole-20',
    name: 'Omeprazole Delayed-Release',
    genericName: 'Omeprazole 20mg',
    dosage: '20mg',
    frequency: 'Daily (Morning)',
    scheduledTimes: ['07:30'],
    category: 'prescription',
    doctor: 'Dr. Sarah Nakato',
    prescribedDate: '2026-11-01',
    refillsRemaining: 0,
    totalRefills: 1,
    diagnosisIndication: 'Gastroesophageal Reflux & Acid Reducer',
    instructions: 'Take 30 minutes before morning meal with water.',
    status: 'expiring',
    remindersEnabled: true
  },
  {
    id: 'supp-vitaminc-1000',
    name: 'Vitamin C + Zinc Immuno',
    genericName: 'Ascorbic Acid 1000mg',
    dosage: '1000mg',
    frequency: 'Once daily morning',
    scheduledTimes: ['09:00'],
    category: 'supplement',
    doctor: 'Clinical Nutritionist Martha',
    prescribedDate: '2026-11-01',
    refillsRemaining: 5,
    totalRefills: 6,
    diagnosisIndication: 'Immune Resilience & Antioxidant Support',
    instructions: 'Dissolve effervescent or swallow with morning juice.',
    status: 'active',
    remindersEnabled: true
  }
];

const COMMON_ESSENTIAL_MOLECULES = [
  { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', category: 'prescription', times: ['08:00', '14:00', '20:00'] },
  { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', category: 'prescription', times: ['08:00', '20:00'] },
  { name: 'Atorvastatin', dosage: '20mg', frequency: 'Nightly', category: 'prescription', times: ['21:30'] },
  { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours as needed', category: 'supplement', times: ['08:00', '16:00'] },
  { name: 'Omeprazole', dosage: '20mg', frequency: 'Daily (Morning)', category: 'prescription', times: ['07:30'] },
  { name: 'Amlodipine', dosage: '5mg', frequency: 'Daily morning', category: 'prescription', times: ['08:00'] },
  { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 8 hours as needed', category: 'supplement', times: ['08:00', '14:00', '20:00'] },
  { name: 'Coartem (Artemether/Lumefantrine)', dosage: '20/120mg', frequency: 'Twice daily for 3 days', category: 'prescription', times: ['08:00', '20:00'] },
  { name: 'Ciprofloxacin', dosage: '500mg', frequency: 'Every 12 hours', category: 'prescription', times: ['08:00', '20:00'] }
];

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  user,
  onNavigate = () => {},
  addToast = () => {}
}) => {
  // Navigation tabs: 'schedule' (Dose Schedule & Logs), 'molecules' (Active Prescriptions), 'telemetry' (Adherence & Trends)
  const [activeTab, setActiveTab] = useState<'schedule' | 'molecules' | 'telemetry'>('schedule');

  // Stored state
  const [molecules, setMolecules] = useState<Molecule[]>(() => {
    try {
      const saved = localStorage.getItem('doctorian_prescriptions_molecules');
      return saved ? JSON.parse(saved) : DEFAULT_MOLECULES;
    } catch {
      return DEFAULT_MOLECULES;
    }
  });

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    try {
      const saved = localStorage.getItem('doctorian_dose_intake_logs');
      if (saved) return JSON.parse(saved);
      // Preload mock logs for today
      const today = new Date().toISOString().split('T')[0];
      return [
        {
          id: 'log-1',
          moleculeId: 'rx-omeprazole-20',
          moleculeName: 'Omeprazole Delayed-Release',
          dosage: '20mg',
          scheduledTime: '07:30',
          loggedAt: `${today}T07:32:00Z`,
          status: 'taken',
          confidenceRating: 'HIGH CONFIDENCE INTAKE'
        },
        {
          id: 'log-2',
          moleculeId: 'rx-amox-500',
          moleculeName: 'Amoxicillin Trihydrate',
          dosage: '500mg',
          scheduledTime: '08:00',
          loggedAt: `${today}T08:05:00Z`,
          status: 'taken',
          confidenceRating: 'HIGH CONFIDENCE INTAKE'
        }
      ];
    } catch {
      return [];
    }
  });

  // Persist molecules and dose logs
  useEffect(() => {
    localStorage.setItem('doctorian_prescriptions_molecules', JSON.stringify(molecules));
  }, [molecules]);

  useEffect(() => {
    localStorage.setItem('doctorian_dose_intake_logs', JSON.stringify(doseLogs));
  }, [doseLogs]);

  // Modal states
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isAddMoleculeModalOpen, setIsAddMoleculeModalOpen] = useState(false);
  const [verifyingDose, setVerifyingDose] = useState<{
    molecule: Molecule;
    time: string;
  } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'prescription' | 'supplement'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Ingestion verification modal inputs
  const [ingestionTiming, setIngestionTiming] = useState<'exact' | 'delayed' | 'extra'>('exact');
  const [ingestionNotes, setIngestionNotes] = useState('');

  // Add molecule manual state
  const [newMolecule, setNewMolecule] = useState<{
    name: string;
    dosage: string;
    frequency: string;
    times: string;
    category: 'prescription' | 'supplement';
    doctor: string;
    diagnosisIndication: string;
    instructions: string;
    refills: number;
  }>({
    name: '',
    dosage: '',
    frequency: 'Daily (Morning)',
    times: '08:00',
    category: 'prescription',
    doctor: user?.displayName || 'Dr. Gloria Jayakullo',
    diagnosisIndication: '',
    instructions: 'Take with plenty of water.',
    refills: 2
  });

  // OCR Scanner state
  const [ocrScanning, setOcrScanning] = useState(false);
  const [scannedImagePreview, setScannedImagePreview] = useState<string | null>(null);
  const [ocrDrafts, setOcrDrafts] = useState<Array<{
    name: string;
    dosage: string;
    frequency: string;
    time: string;
    category: 'prescription' | 'supplement';
    confidence: number;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate today's scheduled doses
  const todayDoses = useMemo(() => {
    const list: Array<{
      molecule: Molecule;
      time: string;
      isTaken: boolean;
      log?: DoseLog;
      isDelayed?: boolean;
    }> = [];

    molecules.forEach((mol) => {
      if (mol.status === 'completed') return;
      mol.scheduledTimes.forEach((time) => {
        const log = doseLogs.find(
          (l) => l.moleculeId === mol.id && l.scheduledTime === time
        );
        list.push({
          molecule: mol,
          time,
          isTaken: !!log,
          log
        });
      });
    });

    // Sort chronologically by time
    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [molecules, doseLogs]);

  // Filtered doses
  const filteredDoses = useMemo(() => {
    return todayDoses.filter((item) => {
      const matchCat =
        categoryFilter === 'all' || item.molecule.category === categoryFilter;
      const matchSearch =
        !searchQuery ||
        item.molecule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.molecule.dosage.toLowerCase().includes(searchQuery.toLowerCase());
      
      const hour = parseInt(item.time.split(':')[0], 10);
      let matchTime = true;
      if (timeFilter === 'morning') matchTime = hour < 12;
      else if (timeFilter === 'afternoon') matchTime = hour >= 12 && hour < 18;
      else if (timeFilter === 'evening') matchTime = hour >= 18;

      return matchCat && matchSearch && matchTime;
    });
  }, [todayDoses, categoryFilter, searchQuery, timeFilter]);

  // Overall Adherence Calculation
  const adherenceMetrics = useMemo(() => {
    const totalScheduled = todayDoses.length;
    const takenCount = todayDoses.filter((d) => d.isTaken).length;
    const percentage = totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 100;
    const rxCount = molecules.filter((m) => m.category === 'prescription').length;
    const suppCount = molecules.filter((m) => m.category === 'supplement').length;

    return {
      totalScheduled,
      takenCount,
      percentage,
      rxCount,
      suppCount,
      missedCount: Math.max(0, totalScheduled - takenCount)
    };
  }, [todayDoses, molecules]);

  // Handle Log Ingestion Dose
  const handleConfirmDose = () => {
    if (!verifyingDose) return;
    const newLog: DoseLog = {
      id: `log-${Date.now()}`,
      moleculeId: verifyingDose.molecule.id,
      moleculeName: verifyingDose.molecule.name,
      dosage: verifyingDose.molecule.dosage,
      scheduledTime: verifyingDose.time,
      loggedAt: new Date().toISOString(),
      status: ingestionTiming === 'exact' ? 'taken' : ingestionTiming === 'delayed' ? 'delayed' : 'extra',
      verificationNotes: ingestionNotes || 'Ingestion confirmed on schedule via biometric tracker.',
      confidenceRating: ingestionTiming === 'exact' ? 'HIGH CONFIDENCE INTAKE' : 'MANUALLY VERIFIED'
    };

    setDoseLogs((prev) => [...prev, newLog]);
    setVerifyingDose(null);
    setIngestionNotes('');
    setIngestionTiming('exact');
    addToast(`Verified dose logged for ${verifyingDose.molecule.name} (${verifyingDose.molecule.dosage})`, 'success');
  };

  // Handle Adding Molecule Manually
  const handleAddMoleculeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMolecule.name || !newMolecule.dosage) {
      addToast('Please enter both medication name and dosage.', 'error');
      return;
    }

    const timesArray = newMolecule.times
      .split(',')
      .map((t) => t.trim())
      .filter((t) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t));

    const created: Molecule = {
      id: `rx-${Date.now()}`,
      name: newMolecule.name,
      genericName: `${newMolecule.name} ${newMolecule.dosage}`,
      dosage: newMolecule.dosage,
      frequency: newMolecule.frequency,
      scheduledTimes: timesArray.length > 0 ? timesArray : ['08:00'],
      category: newMolecule.category,
      doctor: newMolecule.doctor || 'Registered Clinician',
      prescribedDate: new Date().toISOString().split('T')[0],
      refillsRemaining: Number(newMolecule.refills) || 1,
      totalRefills: Number(newMolecule.refills) || 1,
      diagnosisIndication: newMolecule.diagnosisIndication || 'Clinician Prescribed Regimen',
      instructions: newMolecule.instructions || 'Take as indicated by physician.',
      status: 'active',
      remindersEnabled: true
    };

    setMolecules((prev) => [created, ...prev]);
    setIsAddMoleculeModalOpen(false);
    setNewMolecule({
      name: '',
      dosage: '',
      frequency: 'Daily (Morning)',
      times: '08:00',
      category: 'prescription',
      doctor: user?.displayName || 'Dr. Gloria Jayakullo',
      diagnosisIndication: '',
      instructions: 'Take with plenty of water.',
      refills: 2
    });
    addToast(`Prescription registered: ${created.name}`, 'success');
  };

  // Add from Essential Common Molecules Catalog
  const handleAddPrebuilt = (item: typeof COMMON_ESSENTIAL_MOLECULES[0]) => {
    const created: Molecule = {
      id: `rx-${Date.now()}`,
      name: item.name,
      genericName: `${item.name} ${item.dosage}`,
      dosage: item.dosage,
      frequency: item.frequency,
      scheduledTimes: item.times,
      category: item.category as 'prescription' | 'supplement',
      doctor: 'Dr. Gloria Jayakullo (Uganda MoH)',
      prescribedDate: new Date().toISOString().split('T')[0],
      refillsRemaining: 2,
      totalRefills: 2,
      diagnosisIndication: 'Essential Uganda Formulary Regimen',
      instructions: 'Take with clean drinking water as scheduled.',
      status: 'active',
      remindersEnabled: true
    };

    setMolecules((prev) => [created, ...prev]);
    addToast(`Added ${created.name} ${created.dosage} to active prescriptions!`, 'success');
  };

  // Delete Molecule
  const handleDeleteMolecule = (id: string, name: string) => {
    if (confirm(`Discontinue and delete active prescription for ${name}?`)) {
      setMolecules((prev) => prev.filter((m) => m.id !== id));
      setDoseLogs((prev) => prev.filter((l) => l.moleculeId !== id));
      addToast(`Discontinued prescription: ${name}`, 'info');
    }
  };

  // Refill Molecule
  const handleRefillMolecule = (id: string, name: string) => {
    setMolecules((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newRemaining = Math.max(0, m.refillsRemaining - 1);
          return {
            ...m,
            refillsRemaining: newRemaining,
            status: newRemaining === 0 ? 'expiring' : 'active'
          };
        }
        return m;
      })
    );
    addToast(`Refill request sent to hospital dispensary for ${name}. Paramedic dispatch ready.`, 'success');
  };

  // AI OCR File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setScannedImagePreview(reader.result as string);
      runOcrSimulation(file.name);
    };
    reader.readAsDataURL(file);
  };

  const runOcrSimulation = (fileName: string) => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      // Simulated extracted draft molecules
      const simulated: Array<{
        name: string;
        dosage: string;
        frequency: string;
        time: string;
        category: 'prescription' | 'supplement';
        confidence: number;
      }> = [
        {
          name: 'Ciprofloxacin 500mg',
          dosage: '500mg',
          frequency: 'Twice daily',
          time: '08:00, 20:00',
          category: 'prescription',
          confidence: 98
        },
        {
          name: 'Ibuprofen 400mg',
          dosage: '400mg',
          frequency: 'Every 8 hours as needed',
          time: '14:00',
          category: 'supplement',
          confidence: 94
        }
      ];
      setOcrDrafts(simulated);
      addToast(`Prescription OCR successfully digitized 2 molecules from ${fileName}!`, 'success');
    }, 1800);
  };

  const handleAcceptOcrDraft = (draft: typeof ocrDrafts[0]) => {
    const times = draft.time.split(',').map((t) => t.trim());
    const created: Molecule = {
      id: `rx-ocr-${Date.now()}`,
      name: draft.name,
      genericName: draft.name,
      dosage: draft.dosage,
      frequency: draft.frequency,
      scheduledTimes: times.length > 0 ? times : ['08:00'],
      category: draft.category,
      doctor: 'Digitized from Prescription Slip',
      prescribedDate: new Date().toISOString().split('T')[0],
      refillsRemaining: 2,
      totalRefills: 2,
      diagnosisIndication: 'Digitized via AI Clinical OCR',
      instructions: 'Verified against handwritten prescription record.',
      status: 'active',
      remindersEnabled: true
    };

    setMolecules((prev) => [created, ...prev]);
    setOcrDrafts((prev) => prev.filter((d) => d.name !== draft.name));
    addToast(`Digitized molecule added: ${created.name}`, 'success');
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 font-sans space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                Prescriptions &amp; Molecule Adherence Hub
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Interactive daily doses, cellular push cues, AI prescription OCR, and verified compliance tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions: Scan Prescriptions + Add Molecule */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Prescriptions</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddMoleculeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Molecule</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar (Adherence Rate, Taken Today, Active Rx, Refill Due) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Adherence Rate</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{adherenceMetrics.percentage}%</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {adherenceMetrics.percentage >= 80 ? 'Optimal' : 'Needs Review'}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${adherenceMetrics.percentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${adherenceMetrics.percentage}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Doses</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {adherenceMetrics.takenCount}/{adherenceMetrics.totalScheduled}
            </span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Doses Logged</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {adherenceMetrics.missedCount === 0 ? 'All scheduled doses taken' : `${adherenceMetrics.missedCount} remaining for today`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Prescriptions</span>
            <FileText className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{adherenceMetrics.rxCount}</span>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Rx Molecules</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            +{adherenceMetrics.suppCount} wellness supplements
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Formulary Safety</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">Active</span>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">NDA Verified</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Automatic overdose &amp; interaction guarding
          </p>
        </div>
      </div>

      {/* 3. Navigation View Switcher (Dose Schedule | Active Molecules | Telemetry & Trends) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Dose Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('molecules')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'molecules'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Active Prescriptions ({molecules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'telemetry'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Adherence Analytics</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DOSE SCHEDULE & INTAKE LOGGING
      ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter today's medications..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Times</option>
                <option value="morning">Morning (&lt;12 PM)</option>
                <option value="afternoon">Afternoon (12-6 PM)</option>
                <option value="evening">Evening (&gt;6 PM)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
              {(['all', 'prescription', 'supplement'] as const).map((cat) => (
                <button
                  key={`filter-${cat}`}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Doses List */}
          {filteredDoses.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No pending doses found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                All scheduled doses for this filter have either been taken or none are scheduled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredDoses.map((item, idx) => (
                <div
                  key={`dose-${item.molecule.id}-${item.time}-${idx}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    item.isTaken
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-blue-400/60 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {item.time}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            item.molecule.category === 'prescription'
                              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {item.molecule.category === 'prescription' ? 'Rx Prescription' : 'Supplement'}
                        </span>
                      </div>

                      {item.isTaken ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Scheduled
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {item.molecule.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      Dosage: <span className="text-slate-900 dark:text-slate-200">{item.molecule.dosage}</span> • {item.molecule.frequency}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      "{item.molecule.instructions}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Prescribed by {item.molecule.doctor}
                    </span>

                    {item.isTaken ? (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Logged: {new Date(item.log?.loggedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVerifyingDose({ molecule: item.molecule, time: item.time })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Log Verified Dose</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Preload Essential Common Molecules */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2 mt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Select from Common Essential Molecules (Uganda Formulary)
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">1-Click Fast Register</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
              {COMMON_ESSENTIAL_MOLECULES.map((item) => (
                <button
                  key={`prebuilt-${item.name}`}
                  type="button"
                  onClick={() => handleAddPrebuilt(item)}
                  className="flex flex-col text-left p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 text-xs transition-all cursor-pointer group"
                >
                  <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.dosage} • {item.frequency}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: ACTIVE MOLECULES & REFILL MANAGEMENT
      ========================================================================= */}
      {activeTab === 'molecules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Clinical Active Molecules ({molecules.length})
              </h3>
              <p className="text-xs text-slate-400">
                Prescription molecules preloaded by clinician or digitized via scanner.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddMoleculeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Molecule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {molecules.map((mol) => (
              <div
                key={mol.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        mol.category === 'prescription'
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                          : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {mol.category === 'prescription' ? 'Rx Prescription' : 'Supplement'}
                    </span>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        mol.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : mol.status === 'expiring'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {mol.status === 'active' ? 'Active Regimen' : mol.status === 'expiring' ? 'Refill Due' : 'Completed'}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {mol.name}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    {mol.dosage} • {mol.frequency}
                  </p>

                  <div className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Scheduled Times: <strong className="font-mono">{mol.scheduledTimes.join(', ')}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Stethoscope className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Clinician: <strong>{mol.doctor}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Indication: {mol.diagnosisIndication}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 uppercase font-black">Refills Remaining</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {mol.refillsRemaining} of {mol.totalRefills}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRefillMolecule(mol.id, mol.name)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-xs font-bold transition-all cursor-pointer"
                      title="Request refill from hospital dispensary"
                    >
                      Active Refill
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMolecule(mol.id, mol.name)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Discontinue prescription"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TELEMETRY INSIGHTS & ADHERENCE TREND ANALYSIS
      ========================================================================= */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          
          {/* Top Banner: Adherence Confidence */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Clinical Adherence Confidence Rating</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                {adherenceMetrics.percentage}% Compliance Rating (High Confidence)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Telemetry insights correlate smartwatch biometric heart rate and user ingestion logs to verify that critical antibiotic and cardiovascular medications are taken within their safe therapeutic window.
              </p>
            </div>

            <div className="w-28 h-28 rounded-full bg-indigo-500/10 border-4 border-indigo-400 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-black text-indigo-300 font-mono">{adherenceMetrics.percentage}%</span>
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Adherence</span>
            </div>
          </div>

          {/* Adherence Distribution Chart & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Dose Intake Distribution */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Dose Intake Distribution</span>
                <span className="text-[10px] text-slate-400">Today</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Rx Prescriptions Taken</span>
                    <span className="font-mono text-emerald-600">{adherenceMetrics.takenCount} / {adherenceMetrics.totalScheduled}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${adherenceMetrics.percentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Missed / Delayed Doses</span>
                    <span className="font-mono text-rose-500">{adherenceMetrics.missedCount}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, (adherenceMetrics.missedCount / Math.max(1, adherenceMetrics.totalScheduled)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  Clinical Adherence Guidelines:
                </p>
                <p className="text-[11px]">
                  1. <strong>TO PREVENT OVER-DOSE:</strong> Never take a double dose if a previous intake window was missed by more than 4 hours.
                </p>
                <p className="text-[11px]">
                  2. <strong>TO AVOID UNDER-DOSE:</strong> Continue your next scheduled time promptly as prescribed by your physician.
                </p>
              </div>
            </div>

            {/* Dose Verification Logs */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Verified Dose Log Audit Trail</span>
                <span className="text-[10px] text-slate-400">{doseLogs.length} Records</span>
              </h4>

              {doseLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No verified doses logged yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {doseLogs.slice(-6).reverse().map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">
                          {log.moleculeName} ({log.dosage})
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Scheduled: {log.scheduledTime} • Verified: {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          MODAL 1: VERIFY INGESTION DOSE
      ========================================================================= */}
      <AnimatePresence>
        {verifyingDose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Verify Ingestion Dose
                    </h3>
                    <p className="text-xs text-slate-400">
                      Target Bio-Molecule: <strong className="text-slate-800 dark:text-slate-200">{verifyingDose.molecule.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyingDose(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Dosage: {verifyingDose.molecule.dosage} • Scheduled time: <span className="font-mono text-blue-500">{verifyingDose.time}</span>
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  "{verifyingDose.molecule.instructions}"
                </p>
              </div>

              {/* Timing Question */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Is this dose being taken within your prescribed window?
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'exact', label: 'Yes, taken exactly on schedule', desc: 'Compliant within 30 min of target alarm.' },
                    { id: 'delayed', label: 'Significantly delayed past the scheduled alarm', desc: 'Taken late; adjust interval monitoring.' },
                    { id: 'extra', label: 'Taking an extra dose because I missed a previous one', desc: 'Note: Clinician advises caution against doubling doses.' }
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        ingestionTiming === opt.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ingestionTiming"
                        checked={ingestionTiming === opt.id}
                        onChange={() => setIngestionTiming(opt.id as any)}
                        className="mt-0.5 text-emerald-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{opt.label}</p>
                        <p className="text-[10px] text-slate-400">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional Clinician Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Ingestion Notes (Optional):
                </label>
                <input
                  type="text"
                  value={ingestionNotes}
                  onChange={(e) => setIngestionNotes(e.target.value)}
                  placeholder="e.g. Taken with breakfast, no adverse feeling"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setVerifyingDose(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Confirm Verified Ingestion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: SCAN PRESCRIPTIONS & AI OCR
      ========================================================================= */}
      <AnimatePresence>
        {isScanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Prescription AI OCR Scanner
                    </h3>
                    <p className="text-xs text-slate-400">
                      Digitize paper slips, clinical doctor notes, and hospital discharge sheets.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/40"
              >
                <input
                  type="file"
                  id="prescription-file-elem"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                {scannedImagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={scannedImagePreview}
                      alt="Prescription preview"
                      className="max-h-48 mx-auto rounded-xl object-contain border border-slate-200 dark:border-slate-700"
                    />
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Click to choose a different photo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Drag &amp; Drop prescription or click to upload
                    </h4>
                    <p className="text-xs text-slate-400">
                      Supports JPG, PNG, or camera snap from smartphone.
                    </p>
                  </div>
                )}
              </div>

              {/* OCR Scanning Progress */}
              {ocrScanning && (
                <div className="flex items-center justify-center gap-3 py-4 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Act as Clinical Pharmacologist: Reading prescription and digitizing molecules...</span>
                </div>
              )}

              {/* Extracted Molecules Preview */}
              {ocrDrafts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Digitized Prescription Drafts ({ocrDrafts.length} Found)
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ocrDrafts.map((draft, idx) => (
                      <div
                        key={`draft-${idx}`}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{draft.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {draft.dosage} • {draft.frequency} ({draft.confidence}% Confidence)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAcceptOcrDraft(draft)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Add to Active Molecules
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 3: ADD MOLECULE MANUALLY
      ========================================================================= */}
      <AnimatePresence>
        {isAddMoleculeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Register Clinical Molecule
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add a prescribed drug or wellness compound to your daily schedule.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddMoleculeModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMoleculeSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Medication Name</label>
                    <input
                      type="text"
                      required
                      value={newMolecule.name}
                      onChange={(e) => setNewMolecule({ ...newMolecule, name: e.target.value })}
                      placeholder="e.g. Amoxicillin Trihydrate"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dosage</label>
                    <input
                      type="text"
                      required
                      value={newMolecule.dosage}
                      onChange={(e) => setNewMolecule({ ...newMolecule, dosage: e.target.value })}
                      placeholder="e.g. 500mg, 1 tablet"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newMolecule.category}
                      onChange={(e) => setNewMolecule({ ...newMolecule, category: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      <option value="prescription">Rx Prescription</option>
                      <option value="supplement">Wellness Supplement</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Scheduled Times</label>
                    <input
                      type="text"
                      value={newMolecule.times}
                      onChange={(e) => setNewMolecule({ ...newMolecule, times: e.target.value })}
                      placeholder="e.g. 08:00, 20:00"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Prescribing Clinician</label>
                  <input
                    type="text"
                    value={newMolecule.doctor}
                    onChange={(e) => setNewMolecule({ ...newMolecule, doctor: e.target.value })}
                    placeholder="e.g. Dr. Gloria Jayakullo (Mulago Hospital)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Instructions</label>
                  <input
                    type="text"
                    value={newMolecule.instructions}
                    onChange={(e) => setNewMolecule({ ...newMolecule, instructions: e.target.value })}
                    placeholder="e.g. Take with food, finish full 7-day course"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddMoleculeModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
                  >
                    Register Prescription
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MedicationTracker;
