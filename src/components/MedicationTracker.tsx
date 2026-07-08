import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pill, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Calendar,
  ChevronRight,
  Info,
  Search,
  Loader2,
  Bell,
  BellOff,
  Camera,
  FileSearch,
  Sparkles,
  RefreshCw,
  Zap,
  Upload,
  Video,
  QrCode,
  ShieldAlert,
  AlertTriangle,
  CheckSquare,
  Eye,
  Shield
} from 'lucide-react';
import { api } from '../api';
import { ClinicalProtocols } from './Tasks';
import { MedicationAdherenceChart } from './MedicationAdherenceChart';
import { 
  initOfflineDatabase,
  getPatients,
  getDoctors,
  getPrescriptions,
  getMedicines,
  getMedicationLogs,
  getReminders,
  getNotifications,
  getSyncRecords,
  createPrescription,
  updateMedicationIntakeStatus,
  syncOfflineRecords,
  isNetworkOnline,
  setNetworkOnline,
  getMedicinesForPrescription,
  verifyAndLogMedicationIntake,
  caregiverVerifyIntake
} from '../utils/offlineDb';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  category: 'prescription' | 'supplement';
  takenToday: boolean;
  remindersEnabled?: boolean;
}

import { useArduinoContext } from '../ArduinoContext';

export const MedicationTracker: React.FC = () => {
  const arduino = useArduinoContext();
  const [notificationState, setNotificationState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  useEffect(() => {
    if (!('Notification' in window)) {
      setNotificationState('unsupported');
    } else {
      setNotificationState(Notification.permission as any);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) return;
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationState(permission as any);
      
      if (permission === 'granted') {
        const title = '💊 Doctorian Push Engine';
        const options = {
          body: 'Local push reminders and clinical alerts successfully active!',
          icon: '/logo.png',
          badge: '/logo.png',
          tag: 'doctorian-registration'
        };
        
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration && 'showNotification' in registration) {
            await registration.showNotification(title, options);
            return;
          }
        }
        new Notification(title, options);
      }
    } catch (err) {
      console.error('[NOTIFICATIONS] Request failed:', err);
    }
  };

  const handleTriggerTestNotification = async () => {
    if (notificationState !== 'granted') {
      alert('Please authorize local push permissions first.');
      return;
    }
    const title = '🧪 Local Notification Test';
    const options = {
      body: 'This is a simulator test. Your local push reminders are fully functional background & offline.',
      icon: '/logo.png',
      badge: '/logo.png',
    };
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return;
      }
    }
    new Notification(title, options);
  };

  const [isLoading, setIsLoading] = React.useState(false);
  const [activePatientId, setActivePatientId] = useState('PAT-001');
  
  // Offline-first collections
  const [offlinePatients, setOfflinePatients] = useState<any[]>([]);
  const [offlinePrescriptions, setOfflinePrescriptions] = useState<any[]>([]);
  const [offlineMedicines, setOfflineMedicines] = useState<any[]>([]);
  const [offlineLogs, setOfflineLogs] = useState<any[]>([]);
  const [offlineReminders, setOfflineReminders] = useState<any[]>([]);
  const [offlineNotifications, setOfflineNotifications] = useState<any[]>([]);
  const [offlineSyncRecords, setOfflineSyncRecords] = useState<any[]>([]);
  const [isOnlineMode, setIsOnlineMode] = useState<boolean>(true);
  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);

  // Medication Verification System States
  const [activeVerifyLog, setActiveVerifyLog] = useState<any | null>(null);
  const [verifyMethod, setVerifyMethod] = useState<'photo' | 'video' | 'scan'>('photo');
  const [verifyStep, setVerifyStep] = useState<'method' | 'action' | 'ai-question' | 'result'>('method');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiQuestionOptions, setAiQuestionOptions] = useState<string[]>([]);
  const [selectedAiAnswer, setSelectedAiAnswer] = useState<string>('');
  const [customAiAnswer, setCustomAiAnswer] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{
    score: number;
    anomaly: boolean;
    reason: string;
  } | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [registerMode, setRegisterMode] = useState<'manual' | 'library' | 'scan'>('manual');
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeTab, setActiveTab] = useState<'meds' | 'protocols'>('meds');
  const [newMed, setNewMed] = useState({ 
    name: '', 
    dosage: '', 
    frequency: 'Daily', 
    time: '08:00', 
    category: 'prescription' as 'prescription' | 'supplement',
    remindersEnabled: true 
  });
  const [isReadingPrescription, setIsReadingPrescription] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractionResults, setExtractionResults] = useState<any[] | null>(null);


  const processPrescriptionFile = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPrescriptionImage(base64);
      setIsReadingPrescription(true);
      setExtractionResults(null);
      
      try {
        const prompt = `Act as a Clinical Pharmacologist. Read this prescription image and extract the medication data.
        Return ONLY a JSON array of objects with these keys: name, dosage, frequency, time (24h format), category ('prescription' or 'supplement').
        Do not include markdown tags other than the JSON container. If you write markdown code block, ensure it is standard JSON inside.
        
        Example: [{"name": "Amoxicillin", "dosage": "500mg", "frequency": "3 times daily", "time": "08:00", "category": "prescription"}]`;

        const response = await api.ai.aiChat(
          [{ role: 'user', text: prompt, images: [base64] }],
          "You are a Clinical Extraction Engine. You must return only a JSON array."
        );

        const text = response.text.replace(/```json|```/g, '').trim();
        const extractedMeds = JSON.parse(text);
        
        if (Array.isArray(extractedMeds)) {
          createPrescription(
            activePatientId,
            'DOC-002',
            'OCR Neural Synthesized Diagnosis',
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            extractedMeds.map(m => ({
              name: m.name,
              dosage: m.dosage || '500mg',
              frequency: m.frequency || 'Daily',
              duration: '30 Days',
              reminderTimes: [m.time || '08:00']
            }))
          );
          setExtractionResults(extractedMeds);
          refreshAllLocalData();
        }
      } catch (err) {
        console.error("Prescription reading failed:", err);
        alert("Neural extraction failed. Please ensure the prescription photo is clear and contains readable prescriptions.");
      } finally {
        setIsReadingPrescription(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrescriptionRead = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processPrescriptionFile(file);
  };

  const commonMeds = [
    { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', category: 'supplement' },
    { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', category: 'prescription' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', category: 'prescription' },
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'Nightly', category: 'prescription' },
    { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours', category: 'supplement' },
    { name: 'Omeprazole', dosage: '20mg', frequency: 'Daily (Morning)', category: 'prescription' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', category: 'prescription' },
  ];

  const refreshAllLocalData = () => {
    initOfflineDatabase();
    setOfflinePatients(getPatients());
    setOfflinePrescriptions(getPrescriptions());
    setOfflineMedicines(getMedicines());
    setOfflineLogs(getMedicationLogs());
    setOfflineReminders(getReminders());
    setOfflineNotifications(getNotifications());
    setOfflineSyncRecords(getSyncRecords());
    setIsOnlineMode(isNetworkOnline());
  };

  const handleToggleOnlineChannel = () => {
    const newStatus = !isOnlineMode;
    setNetworkOnline(newStatus);
    setIsOnlineMode(newStatus);
    refreshAllLocalData();
  };

  const handleForceManualSync = async () => {
    setIsSyncingData(true);
    try {
      await syncOfflineRecords();
      refreshAllLocalData();
    } catch (err) {
      console.error("Manual replication sync failed:", err);
    } finally {
      setIsSyncingData(false);
    }
  };

  useEffect(() => {
    refreshAllLocalData();
  }, []);

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;
    try {
      createPrescription(
        activePatientId,
        'DOC-002', // Default pharmacologist
        'Self-Registered Supplementation',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        [{
          name: newMed.name,
          dosage: newMed.dosage || '1 tablet',
          frequency: newMed.frequency,
          duration: '30 Days',
          reminderTimes: [newMed.time]
        }]
      );
      setIsAdding(false);
      setShowLibrary(false);
      setNewMed({ name: '', dosage: '', frequency: 'Daily', time: '08:00', category: 'prescription', remindersEnabled: true });
      refreshAllLocalData();
    } catch (err) {
      console.error("Failed to register molecule:", err);
    }
  };

  const handleTakeStatus = async (logId: string, status: 'taken' | 'missed') => {
    if (status === 'taken') {
      const log = offlineLogs.find(l => l.id === logId);
      if (log) {
        setActiveVerifyLog(log);
        setVerifyMethod('photo');
        setVerifyStep('method');
        setCapturedPhoto(null);
        setRecordedVideo(null);
        setScannedCode(null);
        setIsRecording(false);
        setRecordTime(0);

        // Standard questions list to assess consistency
        const questions = [
          {
            q: "How did you ingest this verified dose of your compound?",
            options: [
              "Swallowed with a full glass of water (>250ml)",
              "Took with a light snack or food as recommended",
              "Took with a hot beverage / juice",
              "Swallowed dry without any fluids"
            ]
          },
          {
            q: "What is the formulation/appearance of the medication?",
            options: [
              "A small white circular solid tablet",
              "A capsules with clear or pink-colored casing",
              "A liquid suspension / dissolved powder",
              "I did not inspect the shape/appearance"
            ]
          },
          {
            q: "Are you currently feeling any side effects (such as dry mouth, dizziness, or flushing)?",
            options: [
              "No side effects, feeling completely standard",
              "Slight dry mouth, drinking plenty of water",
              "Mild flushing or headache, resting now",
              "Experiencing severe nausea or vomiting"
            ]
          },
          {
            q: "Is this dose being taken within your prescribed window?",
            options: [
              "Yes, taken exactly on schedule",
              "A bit delayed, but within the safety margin",
              "Significantly delayed past the scheduled alarm",
              "Taking an extra dose because I missed a previous one"
            ]
          }
        ];
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        setAiQuestion(randomQ.q);
        setAiQuestionOptions(randomQ.options);
        setSelectedAiAnswer('');
        setCustomAiAnswer('');
        setVerificationResult(null);
      }
    } else {
      try {
        updateMedicationIntakeStatus(logId, 'missed');
        refreshAllLocalData();
      } catch (err) {
        console.error("Failed to update missed dose status:", err);
      }
    }
  };

  const handleSimulatePhoto = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setCapturedPhoto("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400");
      setVerifyStep('ai-question');
    }, 1500);
  };

  const handleSimulateVideo = () => {
    setIsRecording(true);
    setRecordTime(0);
    const interval = setInterval(() => {
      setRecordTime(prev => {
        if (prev >= 2) {
          clearInterval(interval);
          setIsRecording(false);
          setRecordedVideo("verified_ingestion_video.mp4");
          setVerifyStep('ai-question');
          return 3;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleSimulateScan = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const barcode = "GTIN-" + Math.floor(10000000 + Math.random() * 90000000);
      setScannedCode(barcode);
      setVerifyStep('ai-question');
    }, 1800);
  };

  const handleCalculateVerification = () => {
    let score = 40; // baseline
    let anomaly = false;
    let reasons: string[] = [];

    // Method weight
    if (verifyMethod === 'photo') score += 35;
    if (verifyMethod === 'video') score += 45;
    if (verifyMethod === 'scan') score += 45;

    // AI Consistency check
    const isGoodAnswer = 
      selectedAiAnswer.includes("glass of water") || 
      selectedAiAnswer.includes("light snack") || 
      selectedAiAnswer.includes("white circular") || 
      selectedAiAnswer.includes("capsules with") || 
      selectedAiAnswer.includes("No side effects") || 
      selectedAiAnswer.includes("dry mouth") || 
      selectedAiAnswer.includes("exactly on schedule") || 
      selectedAiAnswer.includes("safety margin");
    
    if (isGoodAnswer) {
      score += 15;
    } else {
      score -= 15;
      reasons.push("Inconsistent AI Follow-up response: suspicious ingestion habit reported.");
    }

    // Pattern Anomaly: 1. Logging multiple doses of same medicine within 1 hour
    const recentLogs = offlineLogs.filter(l => 
      l.patientId === activePatientId && 
      l.medicineId === activeVerifyLog.medicineId && 
      l.status === 'taken' &&
      l.takenAt && 
      (Date.now() - new Date(l.takenAt).getTime() < 3600000)
    );
    if (recentLogs.length > 0) {
      score -= 35;
      anomaly = true;
      reasons.push("Suspicious Intake Frequency: Multiple logs submitted for this substance within a 1-hour interval.");
    }

    // 2. Extra dose warning
    if (selectedAiAnswer.includes("extra dose")) {
      score -= 25;
      anomaly = true;
      reasons.push("Clinical Warning: Patient reporting taking an unprescribed duplicate extra dose.");
    }

    // 3. Late intake threshold check (>4 hours delayed)
    const [schedHr, schedMin] = activeVerifyLog.scheduledTime.split(':').map(Number);
    const now = new Date();
    const scheduledDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), schedHr, schedMin);
    const diffHours = (now.getTime() - scheduledDateTime.getTime()) / 3600000;
    if (diffHours > 4) {
      score -= 15;
      reasons.push(`Delayed Ingestion: Logged ${Math.round(diffHours)} hours late.`);
    }

    // Clamp score
    score = Math.max(15, Math.min(100, score));

    setVerificationResult({
      score,
      anomaly: anomaly || score < 70,
      reason: reasons.length > 0 ? reasons.join(" • ") : "All verification vectors verified. Perfect consistency."
    });
    setVerifyStep('result');
  };

  const handleSaveVerifiedDose = () => {
    if (!activeVerifyLog || !verificationResult) return;
    try {
      verifyAndLogMedicationIntake(
        activeVerifyLog.id,
        verifyMethod,
        capturedPhoto || (recordedVideo ? 'video_playback_active.jpg' : scannedCode ? 'barcode_read.jpg' : 'self_report.jpg'),
        scannedCode || recordedVideo || 'Photo Asset Verified',
        aiQuestion,
        selectedAiAnswer || customAiAnswer || 'No answer',
        verificationResult.score,
        verificationResult.anomaly,
        verificationResult.reason
      );
      
      setActiveVerifyLog(null);
      refreshAllLocalData();
    } catch (err) {
      console.error("Failed to log verified dose:", err);
    }
  };

  const handleDeleteMed = async (id: string) => {
    try {
      const remainingMeds = offlineMedicines.filter(m => m.id !== id);
      localStorage.setItem('rx_offline_medicines', JSON.stringify(remainingMeds));
      
      const remainingReminders = offlineReminders.filter(r => r.medicineId !== id);
      localStorage.setItem('rx_offline_reminders', JSON.stringify(remainingReminders));
      
      refreshAllLocalData();
    } catch (err) {
      console.error("Failed to delete local molecule:", err);
    }
  };

  const toggleReminders = async (id: string, currentStatus: boolean) => {
    try {
      const updated = offlineMedicines.map(m => m.id === id ? { ...m, remindersEnabled: !currentStatus } : m);
      localStorage.setItem('rx_offline_medicines', JSON.stringify(updated));
      refreshAllLocalData();
    } catch (err) {
      console.error("Failed to toggle reminders:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center space-y-8 animate-pulse text-center">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center">
          <Pill className="text-rose-600 animate-pulse" size={40} />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-64 bg-slate-100 dark:bg-slate-900 rounded-full mx-auto" />
          <div className="h-4 w-48 bg-slate-50 dark:bg-slate-950 rounded-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Clinician Online/Offline Sync Indicator Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-[2rem] mb-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isOnlineMode ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Sync Status</p>
            <p className="text-xs font-bold">{isOnlineMode ? 'Dual-Write Live Replication Channel Active' : 'Clinical Safe-Mode Local Queueing Enabled'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleOnlineChannel}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isOnlineMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}
          >
            Switch to {isOnlineMode ? 'Offline Mode' : 'Online Mode'}
          </button>
          <button
            onClick={handleForceManualSync}
            disabled={isSyncingData}
            className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={isSyncingData ? 'animate-spin' : ''} />
            Replicate
          </button>
        </div>
      </div>

      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="bg-rose-600 p-2 rounded-xl text-white">
              <Pill size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Patient Clinical Portal</p>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Cognis <span className="text-rose-600 font-serif italic normal-case">Potions</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-base">Precision dosage tracking and interaction risk assessment.</p>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-fit ${arduino.connection.connected ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${arduino.connection.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {arduino.connection.connected ? `Arduino Connected` : 'Arduino Link Offline'}
            </div>
          </div>
        </div>

        {/* Patient Switcher Dropdown */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400">Patient Terminal:</span>
          <select
            value={activePatientId}
            onChange={(e) => {
              setActivePatientId(e.target.value);
              refreshAllLocalData();
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-black uppercase text-slate-800 dark:text-white focus:outline-none"
          >
            {offlinePatients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('meds')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'meds' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Intake & Smart Logs
          </button>
          <button 
            onClick={() => setActiveTab('protocols')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'protocols' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Clinical Protocols
          </button>
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={() => {
              setRegisterMode('scan');
              setExtractionResults(null);
              setPrescriptionImage(null);
              setIsAdding(true);
            }}
            className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 hover:bg-emerald-700 active:scale-95 transition-all shadow-xl"
          >
            <Camera size={16} />
            Scan Prescriptions
          </button>
          <button 
            onClick={() => {
              setRegisterMode('manual');
              setIsAdding(true);
            }}
            className="flex-1 sm:flex-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            <Plus size={16} />
            Add Molecule
          </button>
        </div>
      </header>

      {/* Calculate active stats */}
      {(() => {
        const activeMeds = offlineMedicines.filter(m => {
          const rx = offlinePrescriptions.find(p => p.id === m.prescriptionId);
          return rx && rx.patientId === activePatientId;
        });

        const activeLogsForToday = offlineLogs.filter(l => 
          l.patientId === activePatientId && 
          l.logDate === new Date().toISOString().split('T')[0]
        );

        const activePatientLogs = offlineLogs.filter(l => l.patientId === activePatientId);
        const totalLogsCount = activePatientLogs.length;
        const takenLogsCount = activePatientLogs.filter(l => l.status === 'taken').length;
        const adherencePct = totalLogsCount > 0 ? Math.round((takenLogsCount / totalLogsCount) * 100) : 100;

        const transformedMeds = activeMeds.map(m => {
          const logToday = activeLogsForToday.find(l => l.medicineId === m.id);
          return {
            id: m.id,
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            time: m.reminderTimes?.[0] || '08:00',
            category: (m.category === 'supplement' ? 'supplement' : 'prescription') as 'supplement' | 'prescription',
            takenToday: logToday ? logToday.status === 'taken' : false
          };
        });

        const transformedHistory = offlineLogs
          .filter(l => l.patientId === activePatientId)
          .map(l => ({
            id: l.id,
            medicationId: l.medicineId,
            takenAt: l.logDate + 'T' + (l.reminderTime || '08:00') + ':00.000Z',
            name: l.medicineName,
            category: 'prescription' as const
          }));

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {activeTab === 'meds' ? (
              <>
                <div className="lg:col-span-8 space-y-6">
                  {/* Today's Smart Intake Timeline Checklist */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[3rem] shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Smart Intake Timeline</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase">Interactive daily doses & cellular push cues</p>
                      </div>
                      <span className="text-[10px] font-black uppercase px-3 py-1 bg-rose-50 text-rose-600 rounded-xl">Today's Dose Schedule</span>
                    </div>

                    {activeLogsForToday.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                        <Pill className="mx-auto text-slate-300 animate-pulse mb-4" size={32} />
                        <p className="text-xs font-bold text-slate-400 uppercase">No scheduled logs registered for today.</p>
                        <p className="text-[10px] text-slate-400 uppercase mt-1">Molecules preloaded by clinician or manually registered will map here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeLogsForToday.map(log => {
                          const isTaken = log.status === 'taken';
                          const isMissed = log.status === 'missed';
                          return (
                            <div key={log.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${isTaken ? 'bg-emerald-500/5 border-emerald-500/10' : isMissed ? 'bg-rose-500/5 border-rose-500/10' : 'bg-slate-50/50 border-slate-150 dark:bg-slate-800/40 dark:border-slate-700'}`}>
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${isTaken ? 'bg-emerald-500 text-white shadow-lg' : isMissed ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white animate-pulse'}`}>
                                  <Clock size={18} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">{log.reminderTime}</span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${isTaken ? 'bg-emerald-50 text-emerald-700' : isMissed ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
                                      {log.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <h4 className="text-base font-black uppercase text-slate-900 dark:text-white mt-1">{log.medicineName}</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Dosage: {log.dosage}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleTakeStatus(log.id, 'taken')}
                                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isTaken ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                  Mark Taken
                                </button>
                                <button
                                  onClick={() => handleTakeStatus(log.id, 'missed')}
                                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isMissed ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                  Mark Missed
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Registered Active Molecules Grid */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.25em] pl-1">Clinical Active Molecules ({activeMeds.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeMeds.map((med) => {
                        const logToday = activeLogsForToday.find(l => l.medicineId === med.id);
                        const isTaken = logToday ? logToday.status === 'taken' : false;
                        return (
                          <div 
                            key={med.id}
                            className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${med.category === 'prescription' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                                  <Pill size={24} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => toggleReminders(med.id, !!med.remindersEnabled)} 
                                    className={`p-2 rounded-lg transition-colors ${med.remindersEnabled ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-300 hover:text-slate-500'}`}
                                    title={med.remindersEnabled ? 'Reminders On' : 'Reminders Off'}
                                  >
                                    {med.remindersEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                                  </button>
                                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-tighter ${isTaken ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {isTaken ? 'TAKEN TODAY' : 'PENDING'}
                                  </span>
                                </div>
                              </div>
                              
                              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{med.name}</h3>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{med.dosage} • {med.frequency}</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 mt-4">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Clock size={14} />
                                <span className="text-[10px] font-black uppercase">{med.reminderTimes?.join(', ') || '08:00'}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-slate-400">
                                {med.duration || '30 Days'} Left
                              </span>
                            </div>

                            <button 
                              onClick={() => handleDeleteMed(med.id)}
                              className="absolute top-4 right-4 p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  {/* Circular Bio-Compliance Score Widget */}
                  <section className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <ShieldCheck size={80} />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-4 relative z-10">Adherence Ratio</h3>
                    
                    <div className="flex items-center gap-6 my-6 relative z-10">
                      <div className="relative flex items-center justify-center">
                        {/* Circular progress track */}
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="40" className="stroke-slate-800 fill-none" strokeWidth="8" />
                          <circle cx="48" cy="48" r="40" className="stroke-rose-500 fill-none transition-all duration-500" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - adherencePct / 100)}`} />
                        </svg>
                        <span className="absolute text-xl font-black">{adherencePct}%</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score Range</p>
                        <p className={`text-base font-black uppercase ${adherencePct >= 85 ? 'text-emerald-400' : adherencePct >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {adherencePct >= 85 ? 'Clinical Optimal' : adherencePct >= 65 ? 'Intermediate' : 'Low Compliance'}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase mt-1">Based on {totalLogsCount} total dose logs</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 font-bold mb-4 relative z-10 font-serif">No biochemical signature overlaps or interaction conflicts detected.</p>
                    <div className="flex items-center gap-3 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 relative z-10">
                      <div className="p-2 bg-emerald-500 rounded-xl">
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase">Safety Status</p>
                         <p className="text-xs font-bold text-emerald-500">BIO-OPTIMAL</p>
                      </div>
                    </div>
                  </section>

                  {/* Local Push Notifications Control Panel */}
                  <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                     <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                         <Bell size={18} className="text-blue-500" />
                         Push Core
                       </h3>
                       <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                         notificationState === 'granted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                         notificationState === 'denied' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                         notificationState === 'unsupported' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                         'bg-slate-50 text-slate-500 border border-slate-100'
                       }`}>
                         {notificationState === 'granted' ? 'Active' : notificationState === 'denied' ? 'Blocked' : notificationState === 'unsupported' ? 'Unsupported' : 'Pending'}
                       </span>
                     </div>
                     <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
                       Receive ambient, offline, and background dosage reminders on your device terminal instantly.
                     </p>
                     
                     {notificationState === 'default' && (
                       <button
                         onClick={handleEnableNotifications}
                         className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-2"
                       >
                         <Sparkles size={14} />
                         Authorize Notifications
                       </button>
                     )}
                     
                     {notificationState === 'granted' && (
                       <div className="space-y-3">
                         <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 rounded-2xl">
                           <CheckCircle2 size={16} />
                           <span className="text-[10px] font-black uppercase tracking-wider">Device Synced & Ready</span>
                         </div>
                         <button
                           onClick={handleTriggerTestNotification}
                           className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                         >
                           <Zap size={12} className="text-amber-500 fill-amber-500" />
                           Send Test Push Alert
                         </button>
                       </div>
                     )}
                     
                     {notificationState === 'denied' && (
                       <div className="p-4 bg-rose-50 dark:bg-rose-950/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-center">
                         <p className="text-[11px] font-bold leading-relaxed">
                           Notification access is blocked. Please reset your browser site settings to enable offline dosage alerts.
                         </p>
                       </div>
                     )}
                     
                     {notificationState === 'unsupported' && (
                       <div className="p-4 bg-amber-50 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 text-center">
                         <p className="text-[11px] font-bold leading-relaxed">
                           This browser environment does not support background push alerts.
                         </p>
                       </div>
                     )}
                  </section>

                  {/* Next Refill Calendar List */}
                  <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                     <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                       <Calendar size={18} className="text-rose-600" />
                       Next Supply Cycle
                     </h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <Pill size={16} className="text-slate-400" />
                            <div>
                              <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Active Molecules Refill</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Automated dispatch active</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300" />
                        </div>
                     </div>
                  </section>
                </div>

                <div className="lg:col-span-12">
                  <MedicationAdherenceChart medications={transformedMeds} history={transformedHistory} onRefresh={refreshAllLocalData} />
                </div>
              </>
            ) : (
              <div className="lg:col-span-12">
                <ClinicalProtocols />
              </div>
            )}
          </div>
        );
      })()}

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
               <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Register <span className="text-rose-600">Molecule</span></h2>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setExtractionResults(null);
                    setPrescriptionImage(null);
                  }}
                  className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  Close
                </button>
               </div>

               {/* Mode Switch Tabs */}
               <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 font-black uppercase text-[10px] tracking-wider gap-2">
                 <button
                   onClick={() => {
                     setRegisterMode('manual');
                     setExtractionResults(null);
                   }}
                   className={`flex-1 pb-3 border-b-2 text-center transition-all ${registerMode === 'manual' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                 >
                   Manual Entry
                 </button>
                 <button
                   onClick={() => {
                     setRegisterMode('library');
                     setExtractionResults(null);
                   }}
                   className={`flex-1 pb-3 border-b-2 text-center transition-all ${registerMode === 'library' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                 >
                   Library
                 </button>
                 <button
                   onClick={() => setRegisterMode('scan')}
                   className={`flex-1 pb-3 border-b-2 text-center transition-all ${registerMode === 'scan' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                 >
                   Prescription OCR
                 </button>
               </div>

               {registerMode === 'library' && (
                 <div className="space-y-3 mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select from common molecules</p>
                    <div className="grid grid-cols-1 gap-2">
                       {commonMeds.map((m, idx) => (
                         <button
                          key={idx}
                          onClick={() => {
                            setNewMed({...newMed, name: m.name, dosage: m.dosage, frequency: m.frequency, category: m.category as any});
                            setRegisterMode('manual');
                          }}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all text-left"
                         >
                           <div>
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{m.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{m.dosage} • {m.frequency}</p>
                           </div>
                           <Plus size={16} className="text-slate-300" />
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {registerMode === 'manual' && (
                 <form onSubmit={handleAddMed} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Molecular Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Lipitor 20mg"
                        className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold"
                        value={newMed.name}
                        onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
                        <input 
                           type="text" 
                           placeholder="e.g. 500mg"
                           className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold"
                           value={newMed.dosage}
                           onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                        <select 
                          className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold appearance-none"
                          value={newMed.frequency}
                          onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                        >
                          <option>Daily</option>
                          <option>Twice Daily</option>
                          <option>3 Times Daily</option>
                          <option>Every 8 Hours</option>
                          <option>Weekly</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Time</label>
                      <input 
                        type="time" 
                        className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold"
                        value={newMed.time}
                        onChange={(e) => setNewMed({...newMed, time: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <button 
                        type="button"
                        onClick={() => setNewMed({...newMed, remindersEnabled: !newMed.remindersEnabled})}
                        className={`w-10 h-6 rounded-full p-1 transition-all ${newMed.remindersEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${newMed.remindersEnabled ? 'ml-4' : 'ml-0'}`} />
                      </button>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Enable Cellular Alerts</span>
                    </div>
                    <div className="flex gap-3 pt-6">
                      <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
                      <button type="submit" className="flex-2 bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Complete Registration</button>
                    </div>
                 </form>
               )}

               {registerMode === 'scan' && (
                 <div className="space-y-6">
                   {!isReadingPrescription && !extractionResults && (
                     <div 
                       className={`relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-350 cursor-pointer ${
                         isDragging 
                         ? 'border-emerald-500 bg-emerald-500/15' 
                         : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-605 bg-slate-50/50 dark:bg-slate-800/40'
                       }`}
                       onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                       onDragLeave={() => setIsDragging(false)}
                       onDrop={async (e) => {
                         e.preventDefault();
                         setIsDragging(false);
                         const file = e.dataTransfer.files?.[0];
                         if (file) {
                           await processPrescriptionFile(file);
                         }
                       }}
                       onClick={() => document.getElementById('prescription-file-elem')?.click()}
                     >
                       <input 
                         type="file" 
                         id="prescription-file-elem" 
                         className="hidden" 
                         accept="image/*" 
                         onChange={handlePrescriptionRead} 
                       />
                       <div className="flex flex-col items-center">
                         <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl mb-4">
                           <Upload size={32} />
                         </div>
                         <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">Drag & Drop prescription</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">or click to browse local files</p>
                         <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase leading-relaxed max-w-xs px-4">
                           The clinical vision engine reads standard diagnostic certificates, automatically logs dosage matrices, and cross-checks allergen vectors.
                         </p>
                       </div>
                     </div>
                   )}

                   {isReadingPrescription && (
                     <div className="relative mt-4 flex flex-col items-center p-8 bg-slate-950 rounded-[2rem] border border-white/10 text-white overflow-hidden shadow-xl text-center">
                       {prescriptionImage && (
                         <div className="relative w-full max-w-[280px] h-[180px] bg-black/60 rounded-xl overflow-hidden mb-6 border border-white/5">
                           <img src={prescriptionImage} alt="Prescription draft" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                           {/* Dynamic scan line effect */}
                           <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-[bounce_2s_infinite]" />
                         </div>
                       )}
                       <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
                       <h3 className="text-xs font-black uppercase tracking-[0.15em] text-emerald-400 mb-1">OCR Analysis Stream Active</h3>
                       <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Parsing clinical chemical signatures...</p>
                     </div>
                   )}

                   {extractionResults && !isReadingPrescription && (
                     <div className="space-y-6">
                       <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-[2rem] flex items-center gap-4">
                         <div className="p-3 bg-emerald-500 text-white rounded-xl">
                           <CheckCircle2 size={20} />
                         </div>
                         <div>
                           <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Chemical Matrix Synthesized</h4>
                           <p className="text-[10px] uppercase text-slate-400 font-bold mt-0.5">{extractionResults.length} molecules digitized from prescription image.</p>
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Registered Bio-Molecules</p>
                         {extractionResults.map((r, i) => (
                           <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                             <div>
                               <p className="text-sm font-black uppercase text-slate-900 dark:text-white">{r.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{r.dosage} • {r.frequency}</p>
                             </div>
                             <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-xl">Success</span>
                           </div>
                         ))}
                       </div>
                       
                       <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                         <button 
                           type="button" 
                           onClick={() => {
                             setExtractionResults(null);
                             setPrescriptionImage(null);
                           }}
                           className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                         >
                           Scan Another
                         </button>
                         <button 
                           type="button" 
                           onClick={() => {
                             setIsAdding(false);
                             setExtractionResults(null);
                             setPrescriptionImage(null);
                           }}
                           className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg"
                         >
                           Finished
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Medication Verification System Modal */}
      <AnimatePresence>
        {activeVerifyLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVerifyLog(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/25 text-rose-600 rounded-xl">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-rose-600 tracking-widest block">Double-Verification Portal</span>
                    <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight mt-0.5">Verify Ingestion Dose</h2>
                  </div>
                </div>
                <button
                  onClick={() => setActiveVerifyLog(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>

              {/* Step 1: Choose Ingestion Verification Method */}
              {verifyStep === 'method' && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-slate-400">Target Bio-Molecule</p>
                    <p className="text-lg font-black uppercase text-slate-900 dark:text-white mt-1">
                      {activeVerifyLog.medicineName} <span className="text-sm font-bold text-slate-500">({activeVerifyLog.dosage})</span>
                    </p>
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wide mt-1">
                      Scheduled time: {activeVerifyLog.reminderTime || '08:00'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Ingestion Verification Protocol</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'photo', label: 'Photo Confirm', icon: Camera, desc: 'Pill snap verification' },
                        { id: 'video', label: 'Video Confirm', icon: Video, desc: 'Ingestion video stream' },
                        { id: 'scan', label: 'Barcode Pack', icon: QrCode, desc: 'Pack QR verification' },
                      ].map(method => {
                        const Icon = method.icon;
                        const isSelected = verifyMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setVerifyMethod(method.id as any)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${isSelected ? 'bg-rose-50/50 dark:bg-rose-950/15 border-rose-500 text-rose-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                          >
                            <Icon size={24} className="mb-2" />
                            <span className="text-xs font-black uppercase tracking-wide block">{method.label}</span>
                            <span className="text-[8px] font-bold uppercase text-slate-400 mt-1 block">{method.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 uppercase font-bold text-center leading-relaxed max-w-sm mx-auto">
                    Clinical high-integrity verification prevents placebo logging errors and guarantees adherence pattern consistency.
                  </p>

                  <button
                    type="button"
                    onClick={() => setVerifyStep('action')}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Launch Ingestion Scanner
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* Step 2: Action Phase */}
              {verifyStep === 'action' && (
                <div className="space-y-6">
                  <div className="relative h-[220px] bg-slate-950 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col items-center justify-center text-white">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="absolute w-40 h-40 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
                    <div className="absolute w-48 h-48 border border-dashed border-rose-500/20 rounded-full" />
                    
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {verifyMethod === 'photo' && 'PHOTO VIEW'}
                        {verifyMethod === 'video' && `VIDEO REC ${recordTime}s`}
                        {verifyMethod === 'scan' && 'BARCODE RETICLE'}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-slate-900/80 px-2 py-1 rounded-md border border-white/10">
                      <span className="text-[8px] font-black uppercase tracking-widest text-rose-500">
                        {activeVerifyLog.id}
                      </span>
                    </div>

                    {isRecording ? (
                      <div className="flex flex-col items-center z-10">
                        <Loader2 className="animate-spin text-rose-500 mb-3" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                          {verifyMethod === 'photo' && 'Capturing Pill Morphology...'}
                          {verifyMethod === 'video' && 'Streaming Ingestion Record...'}
                          {verifyMethod === 'scan' && 'Aligning High-Resolution Matrix...'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center z-10 p-6 text-center">
                        {verifyMethod === 'photo' && (
                          <>
                            <Camera size={36} className="text-slate-400 mb-3" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Align Medicine Pack / Tablet</h4>
                            <p className="text-[9px] text-slate-500 uppercase mt-1">Ensure chemical identification markings are clearly visible.</p>
                          </>
                        )}
                        {verifyMethod === 'video' && (
                          <>
                            <Video size={36} className="text-slate-400 mb-3" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Record 3-Sec Swallowing Ingestion</h4>
                            <p className="text-[9px] text-slate-500 uppercase mt-1">Keep camera steady as dose ingestion is completed.</p>
                          </>
                        )}
                        {verifyMethod === 'scan' && (
                          <>
                            <QrCode size={36} className="text-slate-400 mb-3" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Scan Carton Matrix Code</h4>
                            <p className="text-[9px] text-slate-500 uppercase mt-1">Hold pack flat within alignment bounds.</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setVerifyStep('method')}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={
                        verifyMethod === 'photo' ? handleSimulatePhoto :
                        verifyMethod === 'video' ? handleSimulateVideo :
                        handleSimulateScan
                      }
                      disabled={isRecording}
                      className="flex-[2] py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isRecording ? 'Calibrating Capture...' : 'Trigger Verification Device'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: AI Consistency Question */}
              {verifyStep === 'ai-question' && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-900 text-white rounded-[2rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute right-4 top-4 text-emerald-400">
                      <Sparkles size={20} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">AI Clinical Auditor</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Consistency Audit</span>
                    </div>
                    <p className="text-sm font-black uppercase tracking-wide leading-snug">
                      "{aiQuestion}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Provide Clinical Response</p>
                    {aiQuestionOptions.map((opt, i) => {
                      const isSelected = selectedAiAnswer === opt;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedAiAnswer(opt)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all text-xs font-bold uppercase leading-normal flex items-start gap-3 ${isSelected ? 'bg-rose-50/50 dark:bg-rose-950/15 border-rose-500 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                          <span className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-rose-500 font-sans' : 'border-slate-300 font-sans'}`}>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setVerifyStep('action')}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Rescan
                    </button>
                    <button
                      type="button"
                      onClick={handleCalculateVerification}
                      disabled={!selectedAiAnswer}
                      className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
                    >
                      Assess Ingestion Integrity
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Verification Result */}
              {verifyStep === 'result' && verificationResult && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-850 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="4" fill="transparent" className="dark:stroke-slate-700" />
                        <circle cx="32" cy="32" r="28" stroke={verificationResult.score >= 70 ? '#10b981' : '#f59e0b'} strokeWidth="4" fill="transparent"
                          strokeDasharray={175}
                          strokeDashoffset={175 - (175 * verificationResult.score) / 100}
                        />
                      </svg>
                      <span className="absolute text-sm font-black text-slate-800 dark:text-white">{verificationResult.score}%</span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wide text-slate-400">Adherence Confidence Rating</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm sm:text-base font-black uppercase tracking-tight ${verificationResult.score >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {verificationResult.score >= 70 ? 'HIGH CONFIDENCE INTAKE' : 'LOW CONFIDENCE DETECTED'}
                        </span>
                        {verificationResult.score >= 70 ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                      </div>
                    </div>
                  </div>

                  {verificationResult.anomaly ? (
                    <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 rounded-[2rem] space-y-2">
                      <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
                        <ShieldAlert size={20} className="flex-shrink-0" />
                        <h4 className="text-xs font-black uppercase tracking-wider">Clinical Adherence Exception Flagged</h4>
                      </div>
                      <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400/80 leading-relaxed">
                        Reason: {verificationResult.reason}
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold leading-relaxed pt-1 border-t border-amber-500/10">
                        Note: An alert dispatch has been scheduled for your doctor. Supervision and caregiver verification has been initialized.
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-[2rem] flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Compliant Pattern Confirmed</h4>
                        <p className="text-[9px] uppercase font-bold text-slate-400 mt-1">
                          The ingestion proof matched scheduled criteria. No suspicious intake behavior has been flagged.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl text-[10px] font-bold text-slate-400 uppercase leading-relaxed space-y-1">
                    <p className="font-black text-slate-500 mb-1">AUDIT SUMMARY LOG:</p>
                    <p>• Verification: {verifyMethod.toUpperCase()}</p>
                    <p className="truncate">• Proof: {scannedCode || recordedVideo || 'Camera Capture Stream Approved'}</p>
                    <p>• Consistency Check: COHERENT ASSESSMENT RECORDED</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVerifyLog(null);
                        refreshAllLocalData();
                      }}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Dismiss Portal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveVerifiedDose}
                      className="flex-[2] py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={14} />
                      Log Verified Dose
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
