import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Radio,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Share2,
  AlertTriangle,
  Pill,
  Stethoscope,
  Globe,
  Database,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Wifi,
  WifiOff,
  Layers,
  Heart,
  Thermometer,
  ShieldCheck,
  Languages,
  BookOpen
} from 'lucide-react';
import { api, AmbientScribeRecord, AmbientSoapData } from '../api';
import { Vitals } from '../hooks/useArduino';
import { MedicalDisclaimer } from './common/MedicalDisclaimer';

interface AmbientClinicalScribeProps {
  user: any;
  vitals?: Vitals | null;
  onNavigate?: (view: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AmbientClinicalScribe: React.FC<AmbientClinicalScribeProps> = ({
  user,
  vitals,
  onNavigate,
  onShowToast
}) => {
  // Consultation metadata
  const [patientName, setPatientName] = useState<string>('Sample Patient');
  const [clinicianName, setClinicianName] = useState<string>(user?.displayName || 'Attending Clinician');
  const [language, setLanguage] = useState<'en' | 'lg' | 'sw' | 'ny'>('en');
  const [consentConfirmed, setConsentConfirmed] = useState<boolean>(false);
  const [clinicianReviewed, setClinicianReviewed] = useState<boolean>(false);
  const [isEditingSoap, setIsEditingSoap] = useState<boolean>(false);

  // Audio & Dictation state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeSoapTab, setActiveSoapTab] = useState<'all' | 'S' | 'O' | 'A' | 'P' | 'fhir'>('all');
  const [currentSoapResult, setCurrentSoapResult] = useState<AmbientSoapData | null>(null);
  const [currentFhirReport, setCurrentFhirReport] = useState<any>(null);
  const [encounterSummary, setEncounterSummary] = useState<string>('');
  const [copiedFhir, setCopiedFhir] = useState<boolean>(false);

  // Mesh & Offline Records
  const [records, setRecords] = useState<AmbientScribeRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [meshSyncCount, setMeshSyncCount] = useState<number>(3); // simulated peer nodes in clinic Wi-Fi mesh

  // Audio Visualizer Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer for recording
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Load records on mount
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoadingRecords(true);
    try {
      // 1. Fetch from server API
      const serverRecords = await api.ambientScribe.getRecords().catch(() => []);
      
      // 2. Fetch offline drafts from local storage
      let localDrafts: AmbientScribeRecord[] = [];
      try {
        const cached = localStorage.getItem('doctorian_ambient_scribe_drafts');
        if (cached) localDrafts = JSON.parse(cached);
      } catch (e) {}

      // Merge and deduplicate
      const recordMap = new Map<string, AmbientScribeRecord>();
      serverRecords.forEach(r => recordMap.set(r.id, r));
      localDrafts.forEach(d => {
        if (!recordMap.has(d.id)) {
          recordMap.set(d.id, d);
        }
      });

      setRecords(Array.from(recordMap.values()));
    } catch (err) {
      console.warn("Failed to fetch scribe records:", err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Start Audio & Speech Recognition
  const startRecording = async () => {
    if (!consentConfirmed) {
      onShowToast?.('Please confirm patient verbal or written consent before starting ambient recording.', 'warning');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Web Audio setup for visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      drawVisualizer();

      // Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'sw' ? 'sw-TZ' : language === 'lg' ? 'en-UG' : 'en-US';

        recognition.onresult = (event: any) => {
          let fullText = '';
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript + ' ';
          }
          setTranscript(fullText);
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsRecording(true);
      if (onShowToast) onShowToast("Ambient clinical listening active...", "info");
    } catch (err: any) {
      console.error("Microphone access denied or error:", err);
      if (onShowToast) onShowToast("Microphone access unavailable. You can use sample templates or type.", "warning");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);
  };

  // Canvas visualizer waveform loop
  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0.2, dataArray[i] / 255)})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Quick Preset Sample Consultations (Encounter Templates)
  const loadPresetTemplate = (templateKey: 'malaria' | 'hypertension' | 'respiratory') => {
    stopRecording();
    if (templateKey === 'malaria') {
      setPatientName('Sarah Namubiru (32F)');
      setLanguage('lg');
      setTranscript(
        "Clinician: Oli otya Sarah, ki ekikutawaanya leero? Patient: Omusawo, nina omusujja omungi n'omutwe oguluma ennyo okumala ennaku ssatu. Nze mpulira empewo n'okukankanana buli kawungeezi. N'emmere yonna ennunya sinnywa bulungi. Clinician: Let us inspect and run a malaria rapid test (mRDT). Examination reveals mild pallor, conjunctiva clear, abdomen soft, no organomegaly. Temperature is 38.6°C."
      );
    } else if (templateKey === 'hypertension') {
      setPatientName('Moses Kato (54M)');
      setLanguage('en');
      setTranscript(
        "Clinician: Welcome back Mr. Kato. How have you been feeling since starting the Amlodipine? Patient: Doctor, I feel frequent occipital morning headaches and mild dizziness when getting out of bed. My home blood pressure machine read 156/98 yesterday. Clinician: Let us measure today's pressure and cardiac rhythm. Vitals show BP 154/96 mmHg, pulse 82 bpm, S1 and S2 present, no peripheral ankle edema."
      );
    } else {
      setPatientName('Grace Atim (4F - Mother Dictating)');
      setLanguage('sw');
      setTranscript(
        "Mama: Daktari, mtoto wangu amekuwa na kikohozi kikuu na mafua kwa siku nne. Usiku hapumzii vizuri na anasita kunyonya maziwa. Clinician: Child is responsive, respiratory rate 38/min, chest auscultation reveals mild bilateral expiratory rhonchi, SpO2 96% on room air, temperature 37.8°C. No subcostal chest indrawing noted."
      );
    }
  };

  // Process Transcription -> AI Structured SOAP Note
  const processConsultation = async () => {
    if (!consentConfirmed) {
      onShowToast?.("Patient recording consent must be confirmed before generating a SOAP note.", "warning");
      return;
    }
    if (!transcript.trim()) {
      onShowToast?.("Please record or input a clinical transcript first.", "warning");
      return;
    }

    setIsProcessing(true);
    setClinicianReviewed(false);
    try {
      const patientVitals = vitals
        ? {
            heartRate: vitals.heartRate || 76,
            spo2: vitals.spo2 || 98,
            temperature: vitals.temperature || 37.2,
            bloodPressure: "120/80"
          }
        : {
            heartRate: 78,
            spo2: 98,
            temperature: 37.2,
            bloodPressure: "120/80"
          };

      const result = await api.ambientScribe.generateSoapNote({
        transcript,
        language,
        patientVitals,
        patientName,
        clinicianName,
        consentConfirmed: true
      });

      const rawSoap = result?.scribeResult?.soap || result?.soap;
      if (result?.success && rawSoap) {
        const soapData: AmbientSoapData = {
          subjective: {
            chiefComplaint: rawSoap.subjective?.chiefComplaint || 'See encounter transcript',
            historyOfPresentIllness: rawSoap.subjective?.historyOfPresentIllness || '',
            reviewOfSystems: Array.isArray(rawSoap.subjective?.reviewOfSystems) ? rawSoap.subjective.reviewOfSystems : []
          },
          objective: {
            vitalSigns: rawSoap.objective?.vitalSigns || patientVitals,
            physicalExamFindings: Array.isArray(rawSoap.objective?.physicalExamFindings) ? rawSoap.objective.physicalExamFindings : []
          },
          assessment: {
            primaryDiagnosis: rawSoap.assessment?.primaryDiagnosis || 'Clinical Impression Pending Clinician Review',
            icd10Code: rawSoap.assessment?.icd10Code || 'R69',
            differentialDiagnoses: Array.isArray(rawSoap.assessment?.differentialDiagnoses) ? rawSoap.assessment.differentialDiagnoses : [],
            clinicalTriage: rawSoap.assessment?.clinicalTriage || 'WATCH',
            clinicalSeverityExplanation: rawSoap.assessment?.clinicalSeverityExplanation || 'Requires licensed clinician verification.'
          },
          plan: {
            prescriptions: Array.isArray(rawSoap.plan?.prescriptions) ? rawSoap.plan.prescriptions : [],
            diagnosticOrders: Array.isArray(rawSoap.plan?.diagnosticOrders) ? rawSoap.plan.diagnosticOrders : [],
            patientInstructions: rawSoap.plan?.patientInstructions || { en: 'Follow up with your attending clinician.' },
            followUpDays: rawSoap.plan?.followUpDays || 3,
            redFlagWarnings: Array.isArray(rawSoap.plan?.redFlagWarnings) ? rawSoap.plan.redFlagWarnings : []
          }
        };

        const fhirReport = result?.scribeResult?.fhirDiagnosticReport || {
          resourceType: 'DiagnosticReport',
          status: 'preliminary',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'OTH' }] }],
          code: { text: `Clinical SOAP Encounter (${soapData.assessment.icd10Code})` },
          subject: { display: patientName },
          effectiveDateTime: new Date().toISOString(),
          performer: [{ display: clinicianName }],
          conclusion: `${soapData.assessment.primaryDiagnosis} — Pending clinician sign-off`
        };

        setCurrentSoapResult(soapData);
        setCurrentFhirReport(fhirReport);
        setEncounterSummary(result?.scribeResult?.encounterSummary || "Draft structured — review and edit before clinician sign-off.");

        const newRecord: AmbientScribeRecord = {
          id: `scribe_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          patientName,
          clinicianName,
          encounterDate: new Date().toISOString(),
          audioDurationSeconds: recordingSeconds,
          detectedLanguage: result?.scribeResult?.detectedLanguage || language,
          rawTranscript: transcript,
          subjective: soapData.subjective,
          objective: soapData.objective,
          assessment: soapData.assessment,
          plan: soapData.plan,
          icd10Code: soapData.assessment.icd10Code,
          fhirResource: fhirReport,
          syncStatus: isOnline ? 'CLOUD_PERSISTED' : 'LOCAL_DRAFT',
          createdAt: new Date().toISOString()
        };

        saveDraftLocally(newRecord);
        if (isOnline) {
          await api.ambientScribe.saveRecord(newRecord).catch(() => {});
        }

        setRecords(prev => [newRecord, ...prev.filter(r => r.id !== newRecord.id)]);
        onShowToast?.("SOAP draft generated. Review, edit if needed, and mark Clinician-Reviewed.", "success");
      }
    } catch (err: any) {
      console.error("Failed to generate SOAP note:", err);
      onShowToast?.(err?.message || "Failed to generate SOAP note", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveDraftLocally = (record: AmbientScribeRecord) => {
    try {
      const existing = localStorage.getItem('doctorian_ambient_scribe_drafts');
      let drafts: AmbientScribeRecord[] = existing ? JSON.parse(existing) : [];
      drafts = [record, ...drafts.filter(d => d.id !== record.id)].slice(0, 30);
      localStorage.setItem('doctorian_ambient_scribe_drafts', JSON.stringify(drafts));
    } catch (e) {}
  };

  const syncAllLocalDrafts = async () => {
    try {
      const existing = localStorage.getItem('doctorian_ambient_scribe_drafts');
      if (!existing) return;
      const drafts: AmbientScribeRecord[] = JSON.parse(existing);
      let syncedCount = 0;

      for (const draft of drafts) {
        if (draft.syncStatus === 'LOCAL_DRAFT') {
          await api.ambientScribe.saveRecord({
            ...draft,
            syncStatus: 'CLOUD_PERSISTED'
          }).catch(() => {});
          draft.syncStatus = 'CLOUD_PERSISTED';
          syncedCount++;
        }
      }

      localStorage.setItem('doctorian_ambient_scribe_drafts', JSON.stringify(drafts));
      loadRecords();
      if (onShowToast) onShowToast(`Synchronized ${syncedCount} offline clinical consultations to central registry!`, "success");
    } catch (e) {
      if (onShowToast) onShowToast("Sync failed. Check connectivity.", "error");
    }
  };

  const copyFhirToClipboard = () => {
    if (!currentFhirReport) return;
    navigator.clipboard.writeText(JSON.stringify(currentFhirReport, null, 2));
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
    if (onShowToast) onShowToast("HL7 FHIR JSON copied to clipboard", "success");
  };

  const downloadClinicalSummary = () => {
    if (!currentSoapResult) return;
    const content = `
=============================================================
DOCTORIAN MEDICAL AI - AMBIENT CLINICAL ENCOUNTER NOTE
Encounter Date: ${new Date().toLocaleString()}
Patient: ${patientName}
Attending Clinician: ${clinicianName}
Language Mode: ${language.toUpperCase()}
=============================================================

1. SUBJECTIVE (S):
Chief Complaint: ${currentSoapResult.subjective.chiefComplaint}
History of Present Illness: ${currentSoapResult.subjective.historyOfPresentIllness}
Review of Systems: ${currentSoapResult.subjective.reviewOfSystems?.join(', ')}

2. OBJECTIVE (O):
Vitals:
- Heart Rate: ${currentSoapResult.objective.vitalSigns?.heartRate || 'N/A'} bpm
- SpO2: ${currentSoapResult.objective.vitalSigns?.spo2 || 'N/A'}%
- Blood Pressure: ${currentSoapResult.objective.vitalSigns?.bloodPressure || 'N/A'}
- Temperature: ${currentSoapResult.objective.vitalSigns?.temperature || 'N/A'} °C
Exam Findings:
${currentSoapResult.objective.physicalExamFindings?.map(f => `- ${f}`).join('\n')}

3. ASSESSMENT (A):
Primary Clinical Diagnosis: ${currentSoapResult.assessment.primaryDiagnosis}
ICD-10 Code: ${currentSoapResult.assessment.icd10Code}
Differential Diagnoses: ${currentSoapResult.assessment.differentialDiagnoses?.join(', ')}
Clinical Triage Rating: ${currentSoapResult.assessment.clinicalTriage}
Justification: ${currentSoapResult.assessment.clinicalSeverityExplanation}

4. PLAN (P):
Prescriptions:
${currentSoapResult.plan.prescriptions?.map(p => `- ${p.medication} (${p.dosage}) | Frequency: ${p.frequency} | Duration: ${p.duration}\n  Instructions: ${p.instructions}`).join('\n')}

Diagnostic Orders:
${currentSoapResult.plan.diagnosticOrders?.map(d => `- ${d}`).join('\n')}

Patient Instructions (English):
${currentSoapResult.plan.patientInstructions?.en || 'Routine recovery protocol.'}

Patient Instructions (Luganda / Oluganda):
${currentSoapResult.plan.patientInstructions?.lg || 'N/A'}

Patient Instructions (Swahili / Kiswahili):
${currentSoapResult.plan.patientInstructions?.sw || 'N/A'}

Follow-Up: Within ${currentSoapResult.plan.followUpDays} days.
Red Flag Emergency Signs:
${currentSoapResult.plan.redFlagWarnings?.map(w => `! ${w}`).join('\n')}

=============================================================
FHIR R4 DiagnosticReport / LOINC: 11506-3 (Progress Note)
Doctorian Autonomous Clinical Telemetry Core
=============================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SOAP_Note_${patientName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTriageBadge = (triage?: string) => {
    switch (triage) {
      case 'URGENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">URGENT</span>;
      case 'WATCH':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">WATCH</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">STABLE</span>;
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn font-sans pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 border border-blue-900/30 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles size={14} className="animate-spin text-blue-300" style={{ animationDuration: '4s' }} />
              <span>Offline-First Multilingual Scribe & Mesh Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Doctorian Ambient Clinical Scribe
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Real-time ambient consultation listening, multilingual speech-to-SOAP structuring, ICD-10 coding, and peer-to-peer clinic mesh synchronization built for rural and district hospital workflows.
            </p>
          </div>

          {/* Network & Mesh Node Indicators */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span>{isOnline ? 'Cloud Persist Active' : 'Offline Buffer Mode'}</span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-2">
              <Radio size={16} className="animate-pulse text-blue-400" />
              <span>{meshSyncCount} Local Mesh Peers</span>
            </div>

            <button
              onClick={syncAllLocalDrafts}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Sync Mesh Drafts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Control Station Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recording, Dictation & Patient Context */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope size={18} className="text-blue-600 dark:text-blue-400" />
                <span>Encounter Setup</span>
              </h2>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">HL7 FHIR R4</span>
            </div>

            {/* Patient & Clinician inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Patient Name / ID
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. John Mukasa"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Clinician
                </label>
                <input
                  type="text"
                  value={clinicianName}
                  onChange={(e) => setClinicianName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Dr. Gloria Jayakullo"
                />
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Languages size={13} className="text-blue-500" />
                <span>Primary Language of Consultation</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'en', label: 'English', sub: 'Global' },
                  { id: 'lg', label: 'Oluganda', sub: 'Uganda' },
                  { id: 'sw', label: 'Kiswahili', sub: 'E. Africa' },
                  { id: 'ny', label: 'Runyankole', sub: 'Uganda' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLanguage(item.id as any)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      language === item.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[9px] opacity-75">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Patient Telemetry Badge */}
            <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Telemetry Link:</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                <span>HR: {vitals?.heartRate || 76} bpm</span>
                <span>SpO2: {vitals?.spo2 || 98}%</span>
                <span>{vitals?.temperature || 37.1}°C</span>
              </div>
            </div>

            {/* Audio Recording & Waveform Zone */}
            <div className="relative rounded-2xl bg-slate-900 p-5 text-white overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                    {isRecording ? `Listening... ${recordingSeconds}s` : 'Microphone Ready'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">44.1kHz • AI Clean</span>
              </div>

              {/* Waveform Canvas */}
              <div className="w-full h-16 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                {isRecording ? (
                  <canvas ref={canvasRef} width={380} height={64} className="w-full h-full" />
                ) : (
                  <div className="text-slate-500 text-xs font-mono flex items-center gap-2">
                    <Radio size={14} />
                    <span>Tap record to begin bedside listening</span>
                  </div>
                )}
              </div>

              {/* Big Record Button */}
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 cursor-pointer active:scale-95"
                  >
                    <MicOff size={16} />
                    <span>Stop Listening ({recordingSeconds}s)</span>
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95"
                  >
                    <Mic size={16} />
                    <span>Start Ambient Recording</span>
                  </button>
                )}

                <button
                  onClick={() => setTranscript('')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Clear transcript"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Preset Encounter Templates */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={13} className="text-slate-400" />
                <span>Simulate Clinical Encounter (1-Click)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => loadPresetTemplate('malaria')}
                  className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-black text-amber-700 dark:text-amber-300">Malaria & Fever</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Oluganda • mRDT</div>
                </button>

                <button
                  onClick={() => loadPresetTemplate('hypertension')}
                  className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-black text-blue-700 dark:text-blue-300">Hypertension</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">English • Vitals</div>
                </button>

                <button
                  onClick={() => loadPresetTemplate('respiratory')}
                  className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-300">Pediatric Cough</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Swahili • Chest</div>
                </button>
              </div>
            </div>

            {/* Live Dictation / Transcript Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Raw Dictation / Encounter Transcript
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {transcript.length} characters
                </span>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Doctorian listens to doctor-patient conversation or clinical dictation here..."
              />
            </div>

            {/* Patient Recording Consent Gate */}
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 cursor-pointer">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                <strong className="text-slate-900 dark:text-white">Patient Consent Confirmed:</strong> The patient has given verbal or written consent for clinical audio documentation and AI-assisted SOAP drafting.
              </span>
            </label>

            {/* Execute AI Scribe Action */}
            <button
              onClick={processConsultation}
              disabled={isProcessing || !transcript.trim() || !consentConfirmed}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isProcessing || !transcript.trim() || !consentConfirmed
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Structuring Clinical SOAP Draft...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Structured SOAP Draft & FHIR</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Structured SOAP Note & FHIR Explorer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            {/* Header with Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                  <span>Structured Clinical Note</span>
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {encounterSummary || 'Awaiting consultation transcript processing...'}
                </div>
              </div>

              {/* SOAP & FHIR Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                {[
                  { id: 'all', label: 'Full SOAP' },
                  { id: 'S', label: 'S' },
                  { id: 'O', label: 'O' },
                  { id: 'A', label: 'A' },
                  { id: 'P', label: 'P' },
                  { id: 'fhir', label: 'FHIR JSON' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSoapTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSoapTab === tab.id
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Content Display */}
            {currentSoapResult ? (
              <div className="space-y-4">
                {/* Triage Banner & ICD-10 Code */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getTriageBadge(currentSoapResult.assessment.clinicalTriage)}
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {currentSoapResult.assessment.primaryDiagnosis}
                      </div>
                      <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                        ICD-10: {currentSoapResult.assessment.icd10Code}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingSoap(!isEditingSoap)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isEditingSoap ? 'Done Editing' : 'Edit SOAP'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setClinicianReviewed(true);
                        if (currentFhirReport) {
                          setCurrentFhirReport({
                            ...currentFhirReport,
                            status: 'final',
                            conclusion: `${currentSoapResult.assessment.primaryDiagnosis} — Clinician reviewed & signed by ${clinicianName}`
                          });
                        }
                        onShowToast?.('SOAP note marked as Clinician-Reviewed & Signed.', 'success');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        clinicianReviewed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      <span>{clinicianReviewed ? 'Clinician Signed' : 'Mark Clinician-Reviewed & Sign'}</span>
                    </button>

                    <button
                      onClick={downloadClinicalSummary}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Export TXT</span>
                    </button>

                    <button
                      onClick={copyFhirToClipboard}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedFhir ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedFhir ? 'Copied' : 'Copy FHIR'}</span>
                    </button>
                  </div>
                </div>

                {isEditingSoap && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Clinician SOAP Draft Editor</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Chief Complaint (S)</label>
                        <input
                          type="text"
                          value={currentSoapResult.subjective.chiefComplaint}
                          onChange={(e) => setCurrentSoapResult({
                            ...currentSoapResult,
                            subjective: { ...currentSoapResult.subjective, chiefComplaint: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Working Assessment (A)</label>
                        <input
                          type="text"
                          value={currentSoapResult.assessment.primaryDiagnosis}
                          onChange={(e) => setCurrentSoapResult({
                            ...currentSoapResult,
                            assessment: { ...currentSoapResult.assessment, primaryDiagnosis: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">History of Present Illness (S)</label>
                      <textarea
                        rows={2}
                        value={currentSoapResult.subjective.historyOfPresentIllness}
                        onChange={(e) => setCurrentSoapResult({
                          ...currentSoapResult,
                          subjective: { ...currentSoapResult.subjective, historyOfPresentIllness: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Tab: FHIR JSON Resource */}
                {activeSoapTab === 'fhir' ? (
                  <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-96">
                    <pre>{JSON.stringify(currentFhirReport, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* S - Subjective */}
                    {(activeSoapTab === 'all' || activeSoapTab === 'S') && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black">
                            S • Subjective
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Chief Complaint & History</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Chief Complaint: <span className="font-normal">{currentSoapResult.subjective.chiefComplaint}</span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {currentSoapResult.subjective.historyOfPresentIllness}
                        </div>
                        {currentSoapResult.subjective.reviewOfSystems?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {currentSoapResult.subjective.reviewOfSystems.map((ros, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                                • {ros}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* O - Objective */}
                    {(activeSoapTab === 'all' || activeSoapTab === 'O') && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                            O • Objective
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Vitals & Physical Exam</span>
                        </div>
                        
                        {/* Vitals Pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Heart Rate</div>
                            <div className="text-sm font-black text-rose-500">{currentSoapResult.objective.vitalSigns?.heartRate || '--'} bpm</div>
                          </div>
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">SpO2 Oxygen</div>
                            <div className="text-sm font-black text-blue-500">{currentSoapResult.objective.vitalSigns?.spo2 || '--'}%</div>
                          </div>
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure</div>
                            <div className="text-sm font-black text-indigo-500">{currentSoapResult.objective.vitalSigns?.bloodPressure || '120/80'}</div>
                          </div>
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Temperature</div>
                            <div className="text-sm font-black text-amber-500">{currentSoapResult.objective.vitalSigns?.temperature || '--'} °C</div>
                          </div>
                        </div>

                        {/* Exam Observations */}
                        <div className="space-y-1">
                          {currentSoapResult.objective.physicalExamFindings?.map((finding, idx) => (
                            <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                              <span>{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* A - Assessment */}
                    {(activeSoapTab === 'all' || activeSoapTab === 'A') && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black">
                            A • Assessment
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Diagnosis & Severity</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {currentSoapResult.assessment.primaryDiagnosis} (ICD-10: {currentSoapResult.assessment.icd10Code})
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {currentSoapResult.assessment.clinicalSeverityExplanation}
                        </p>
                        {currentSoapResult.assessment.differentialDiagnoses?.length > 0 && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Differentials: </span>
                            {currentSoapResult.assessment.differentialDiagnoses.join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* P - Plan */}
                    {(activeSoapTab === 'all' || activeSoapTab === 'P') && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black">
                            P • Plan
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Prescriptions & Instructions</span>
                        </div>

                        {/* Prescriptions List */}
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Pill size={14} className="text-purple-500" />
                            <span>Prescriptions & Dosages:</span>
                          </div>
                          {currentSoapResult.plan.prescriptions?.map((rx, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                <span>{rx.medication}</span>
                                <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">{rx.dosage}</span>
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                                {rx.frequency} • Duration: {rx.duration}
                              </div>
                              <div className="text-slate-600 dark:text-slate-300 text-[11px] italic">
                                {rx.instructions}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Localized Patient Advice */}
                        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
                          <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                            <Globe size={13} />
                            <span>Patient Guidance in Local Dialects:</span>
                          </div>
                          {currentSoapResult.plan.patientInstructions?.lg && (
                            <div className="text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-bold text-blue-600 dark:text-blue-400">Oluganda: </span>
                              {currentSoapResult.plan.patientInstructions.lg}
                            </div>
                          )}
                          {currentSoapResult.plan.patientInstructions?.sw && (
                            <div className="text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">Kiswahili: </span>
                              {currentSoapResult.plan.patientInstructions.sw}
                            </div>
                          )}
                          {currentSoapResult.plan.patientInstructions?.en && (
                            <div className="text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-bold text-purple-600 dark:text-purple-400">English: </span>
                              {currentSoapResult.plan.patientInstructions.en}
                            </div>
                          )}
                        </div>

                        {/* Red Flags / Emergency Warnings */}
                        {currentSoapResult.plan.redFlagWarnings?.length > 0 && (
                          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-1">
                            <div className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                              <AlertTriangle size={13} />
                              <span>Emergency Red Flags (Immediate Hospital Return):</span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                              {currentSoapResult.plan.redFlagWarnings.map((flag, idx) => (
                                <div key={idx}>• {flag}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Stethoscope size={28} />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  No Consultation Structured Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Start ambient recording or choose one of the one-click templates on the left to generate clinical notes in English, Oluganda, or Swahili.
                </p>
              </div>
            )}
            <MedicalDisclaimer variant="compact" className="mt-4" />
          </div>

          {/* Past Consultation Records Ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Database size={16} className="text-blue-500" />
                <span>Recent Scribe Records ({records.length})</span>
              </h3>

              <button
                onClick={loadRecords}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw size={12} className={isLoadingRecords ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {records.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {records.slice(0, 10).map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      if (rec.subjective && rec.objective && rec.assessment && rec.plan) {
                        setCurrentSoapResult({
                          subjective: rec.subjective,
                          objective: rec.objective,
                          assessment: rec.assessment,
                          plan: rec.plan
                        });
                        setCurrentFhirReport(rec.fhirResource);
                        setPatientName(rec.patientName);
                        setClinicianName(rec.clinicianName);
                        setEncounterSummary(`Loaded record for ${rec.patientName}`);
                      }
                    }}
                    className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{rec.patientName}</span>
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                          {rec.icd10Code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {rec.assessment?.primaryDiagnosis || rec.rawTranscript?.slice(0, 40) || 'Encounter record'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.syncStatus === 'CLOUD_PERSISTED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {rec.syncStatus === 'CLOUD_PERSISTED' ? 'Cloud' : 'Draft'}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          api.ambientScribe.deleteRecord(rec.id).then(() => {
                            setRecords(prev => prev.filter(r => r.id !== rec.id));
                          }).catch(() => {});
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 font-mono">
                No past records saved yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbientClinicalScribe;
