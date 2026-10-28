import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Sparkles,
  Send,
  CheckCircle2,
  PhoneOff,
  RefreshCw,
  Volume2,
  VolumeX,
  Shield,
  Radio,
  Activity,
  Cpu,
  Share2,
  AlertCircle,
  Phone,
  Globe,
  FileText,
  Printer,
  Download,
  Heart,
  Thermometer,
  Layers,
  UserCheck,
  Play,
  Pause,
  MessageSquare,
  Settings,
  ChevronDown,
  Maximize2,
  Minimize2,
  Subtitles,
  Stethoscope,
  BadgeCheck
} from 'lucide-react';
import { api } from '../api';
import { speechEngine } from '../utils/speechEngine';
import { appendSoapNoteToSheets } from '../utils/googleWorkspace';
import { UGANDAN_CLINICIAN_PERSONAS, ClinicianPersona } from '../utils/ugandanMedicalLexicon';

interface TelehealthScribeHubProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  patientName?: string;
  initialMode?: 'video' | 'voice';
}

export const TelehealthScribeHub: React.FC<TelehealthScribeHubProps> = ({
  isOpen,
  onClose,
  doctorName = 'Dr. Gloria Jayakullo',
  patientName = 'Joseph A. (Patient)',
  initialMode = 'video'
}) => {
  // Call Modes
  const [callMode, setCallMode] = useState<'video' | 'voice'>(initialMode);
  const [selectedClinician, setSelectedClinician] = useState<ClinicianPersona>(UGANDAN_CLINICIAN_PERSONAS[0]);
  const [activeLanguage, setActiveLanguage] = useState<'English' | 'Luganda' | 'Swahili' | 'Runyankole' | 'Acholi'>('English');

  // Media Controls
  const [isVideoOn, setIsVideoOn] = useState(initialMode === 'video');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isVideoStreamPlaying, setIsVideoStreamPlaying] = useState(true);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Panels & Views
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Modernized Video Call Advanced Clinical Tools State
  const [isAuscultationActive, setIsAuscultationActive] = useState(false);
  const [auscultationType, setAuscultationType] = useState<'cardiac' | 'pulmonary'>('cardiac');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isPiPSwapped, setIsPiPSwapped] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [doctorSpeechText, setDoctorSpeechText] = useState(selectedClinician.greetingEnglish);
  const [doctorTranslatedText, setDoctorTranslatedText] = useState(selectedClinician.greetingLuganda);

  // Camera & Video
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Live Simulated Vitals HUD
  const [liveVitals, setLiveVitals] = useState({
    hr: 74,
    spo2: 98,
    bpSys: 122,
    bpDia: 80,
    temp: 36.8,
    triageStatus: 'Stable (Uganda MoH Grade 1)'
  });

  // Simulated slight vitals oscillation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLiveVitals((prev) => ({
        ...prev,
        hr: Math.min(115, Math.max(62, prev.hr + (Math.random() > 0.5 ? 1 : -1))),
        spo2: Math.min(100, Math.max(96, prev.spo2 + (Math.random() > 0.7 ? 1 : -1)))
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Call Duration Timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  // Camera capture for patient PiP
  useEffect(() => {
    if (isOpen && callMode === 'video' && isVideoOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 320, height: 240 }, audio: false })
        .then((stream) => {
          cameraStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraStream(true);
        })
        .catch(() => {
          setHasCameraStream(false);
        });
    } else {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
      setHasCameraStream(false);
    }

    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [isOpen, callMode, isVideoOn]);

  // Audio Speech Transcript
  const [transcript, setTranscript] = useState<Array<{
    speaker: 'Doctor' | 'Patient';
    text: string;
    translatedText?: string;
    time: string;
  }>>([
    {
      speaker: 'Doctor',
      text: selectedClinician.greetingEnglish,
      translatedText: selectedClinician.greetingLuganda,
      time: '00:01'
    }
  ]);
  const [customMsg, setCustomMsg] = useState('');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Initial welcome utterance when opening
  useEffect(() => {
    if (isOpen && isTtsEnabled) {
      const greeting =
        activeLanguage === 'Luganda'
          ? selectedClinician.greetingLuganda
          : activeLanguage === 'Swahili'
          ? selectedClinician.greetingSwahili
          : selectedClinician.greetingEnglish;

      speechEngine.speak(greeting, {
        rate: 0.95,
        pitch: 1.05,
        onEnd: () => {}
      });
    }
  }, [isOpen, selectedClinician, activeLanguage]);

  // Live Clinical SOAP Note State
  const [soapNote, setSoapNote] = useState({
    subjective: 'Patient reports mild headache and fatigue over the past 24 hours. No reported chest pain or dyspnea.',
    objective: 'Afebrile at 36.8°C, SpO2 98%, HR 74 bpm regular rhythm. BP 122/80 mmHg. Pupils equal and reactive.',
    assessment: 'Mild tension headache secondary to fatigue. Early viral prodrome vs stress. Acuity: Grade 1 (Mild).',
    plan: '1. Oral hydration & 8h sleep cycle.\n2. Paracetamol 1000mg PRN (max 4g/day).\n3. Re-evaluate if temperature exceeds 38.0°C.'
  });

  // Google Sheets Export State
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetsExportSuccess, setSheetsExportSuccess] = useState(false);
  const [sheetsExportError, setSheetsExportError] = useState<string | null>(null);

  const handleExportToSheets = async () => {
    setIsExportingSheets(true);
    setSheetsExportError(null);
    try {
      await appendSoapNoteToSheets({
        timestamp: new Date().toISOString(),
        patientCode: `${patientName} (${selectedClinician.name})`,
        subjective: soapNote.subjective,
        objective: soapNote.objective,
        assessment: soapNote.assessment,
        plan: soapNote.plan
      });
      setSheetsExportSuccess(true);
      setTimeout(() => setSheetsExportSuccess(false), 4000);
    } catch (err: any) {
      setSheetsExportError(err.message || 'Failed to export to Google Sheets ledger');
    } finally {
      setIsExportingSheets(false);
    }
  };

  const handleSendManualMessage = () => {
    if (!customMsg.trim()) return;
    const userText = customMsg.trim();
    setCustomMsg('');

    const newEntry = {
      speaker: 'Patient' as const,
      text: userText,
      time: formatCallTime(callDuration)
    };
    setTranscript((prev) => [...prev, newEntry]);

    // Doctor rapid intelligent consultation response
    setIsAiResponding(true);
    setTimeout(() => {
      let reply = `Thank you, ${patientName}. I have analyzed your symptoms and your live vitals (HR ${liveVitals.hr}, SpO2 ${liveVitals.spo2}%). Continue resting and follow the prescribed hydration protocol.`;
      let translated = '';

      const lower = userText.toLowerCase();
      if (lower.includes('headache') || lower.includes('pain') || lower.includes('fever')) {
        reply = `Understood. For the headache, ensure adequate hydration and take 500mg Paracetamol after food. If fever develops above 38.0°C, we will initiate rapid malaria testing.`;
        translated = `Ntegedde. Ku mutwe ogwo, nywa amazzi mangi era olye emmere olyoke omire Paracetamol.`;
      } else if (lower.includes('chest') || lower.includes('breath')) {
        reply = `I am closely tracking your bio-telemetry. Your oxygen saturation is currently optimal at ${liveVitals.spo2}%. Please remain seated in a relaxed posture while I review your cardiac telemetry.`;
        translated = `Nsomye ebyuma byo, empewo (SpO2) eri bulungi nnyo. Tuula wansi owummule.`;
      }

      setDoctorSpeechText(reply);
      setDoctorTranslatedText(translated || reply);
      setTranscript((prev) => [
        ...prev,
        {
          speaker: 'Doctor',
          text: reply,
          translatedText: translated || undefined,
          time: formatCallTime(callDuration + 2)
        }
      ]);
      setIsAiResponding(false);

      if (isTtsEnabled) {
        speechEngine.speak(reply, { rate: 0.95 });
      }
    }, 1200);
  };

  const handleSelectClinician = (doc: ClinicianPersona) => {
    setSelectedClinician(doc);
    const greeting =
      activeLanguage === 'Luganda'
        ? doc.greetingLuganda
        : activeLanguage === 'Swahili'
        ? doc.greetingSwahili
        : doc.greetingEnglish;
    const translated = activeLanguage === 'Luganda' ? doc.greetingEnglish : doc.greetingLuganda;
    setDoctorSpeechText(greeting);
    setDoctorTranslatedText(translated);
    setTranscript((prev) => [
      ...prev,
      {
        speaker: 'Doctor',
        text: greeting,
        translatedText: translated,
        time: formatCallTime(callDuration)
      }
    ]);
    if (isTtsEnabled) {
      speechEngine.speak(greeting, { rate: 0.95 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[94vh] text-slate-100"
      >
        {/* ───────────────────────────────────────────────────────── */}
        {/* 1. TOP ARCHITECTURAL APP BAR (Classic, Clean, Uncrowded) */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          {/* Zone 1: Clinician Profile & Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-slate-700 shrink-0 shadow-md">
              <img
                src={selectedClinician.avatar}
                alt={selectedClinician.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {selectedClinician.name}
                </h3>
                <span className="text-[10px] text-cyan-400 font-mono hidden md:inline">
                  {selectedClinician.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  {formatCallTime(callDuration)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{selectedClinician.specialty}</span>
              </div>
            </div>
          </div>

          {/* Zone 2: Mode Switcher (Video vs Voice Call) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCallMode('video');
                setIsVideoOn(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                callMode === 'video'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video size={13} />
              <span>Video</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCallMode('voice');
                setIsVideoOn(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                callMode === 'voice'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone size={13} />
              <span>Voice</span>
            </button>
          </div>

          {/* Zone 3: Language & Close Action */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={activeLanguage}
              onChange={(e: any) => setActiveLanguage(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="Luganda">Luganda</option>
              <option value="Swahili">Swahili</option>
              <option value="Runyankole">Runyankole</option>
              <option value="Acholi">Acholi</option>
            </select>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Consultation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 2. AFRICAN DOCTORS SELECTOR STRIP (Men & Women Specialists) */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="px-3 sm:px-6 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
            <UserCheck size={12} className="text-cyan-400" /> Consult Clinician:
          </span>
          {UGANDAN_CLINICIAN_PERSONAS.map((doc) => {
            const isSelected = selectedClinician.id === doc.id;
            const isWoman = doc.id === 'dr_gloria' || doc.id === 'dr_achan';
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleSelectClinician(doc)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer shadow-sm ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600/40 via-cyan-600/30 to-blue-600/40 text-cyan-200 border border-cyan-400/60 ring-1 ring-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-400 hover:text-slate-100 border border-slate-800'
                }`}
              >
                <div className="relative">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-7 h-7 rounded-xl object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold">{doc.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-white/5 text-slate-400 font-mono">
                      {isWoman ? '👩🏾‍⚕️ Woman' : '👨🏾‍⚕️ Man'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate font-normal">
                    {doc.institution.split(',')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 3. MAIN TELEHEALTH STAGE (Video & Voice Architectural Views) */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className={`flex-1 p-3 sm:p-5 overflow-y-auto flex flex-col justify-center items-center ${isCinemaMode ? 'p-1' : ''}`}>
          
          {/* VIDEO CALL MODE */}
          {callMode === 'video' && isVideoOn ? (
            <div className={`relative w-full ${isCinemaMode ? 'max-w-full h-full' : 'max-w-5xl aspect-video'} bg-slate-950 rounded-3xl overflow-hidden border border-slate-800/90 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex items-center justify-center group transition-all duration-300`}>
              
              {/* PRIMARY FEED (Swappable between Doctor and Patient) */}
              <motion.div
                animate={
                  isVideoStreamPlaying
                    ? {
                        scale: [1, 1.012, 1],
                        x: [-1, 1, -1],
                        y: [-0.8, 0.8, -0.8]
                      }
                    : { scale: 1, x: 0, y: 0 }
                }
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="w-full h-full relative"
              >
                {!isPiPSwapped ? (
                  <>
                    <img
                      src={selectedClinician.avatar}
                      alt={selectedClinician.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/60 pointer-events-none" />
                  </>
                ) : hasCameraStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                    <UserCheck size={48} className="text-slate-600 mb-2" />
                    <p className="text-sm font-bold">Local Patient Camera Active</p>
                  </div>
                )}
              </motion.div>

              {/* TOP HUD: Live Telemetry, Stream Quality & Telemetry Badges */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-20 pointer-events-none">
                {/* Left Telemetry Pill */}
                <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2.5 text-xs font-mono text-slate-300 shadow-xl">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    UltraHD Live
                  </span>
                  <span aria-hidden="true" className="text-slate-700">·</span>
                  <span>HR: <strong className="text-white">{liveVitals.hr}</strong> bpm</span>
                  <span aria-hidden="true" className="text-slate-700">·</span>
                  <span>SpO2: <strong className="text-cyan-400">{liveVitals.spo2}</strong>%</span>
                  <span aria-hidden="true" className="text-slate-700 hidden md:inline">·</span>
                  <span className="hidden md:inline text-slate-400">BP: <strong className="text-white">{liveVitals.bpSys}/{liveVitals.bpDia}</strong></span>
                  <span aria-hidden="true" className="text-slate-700 hidden lg:inline">·</span>
                  <span className="hidden lg:inline text-emerald-400 font-bold flex items-center gap-1">
                    <Shield size={11} /> 256-bit AES WebRTC
                  </span>
                </div>

                {/* Right Quick Toggles */}
                <div className="pointer-events-auto flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsVideoStreamPlaying(!isVideoStreamPlaying)}
                    className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-white/10 transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5 text-xs font-mono shadow-lg"
                    title={isVideoStreamPlaying ? 'Pause video feed simulation' : 'Play video feed simulation'}
                  >
                    {isVideoStreamPlaying ? <Pause size={13} /> : <Play size={13} className="text-emerald-400" />}
                    <span className="text-[10px] font-bold hidden sm:inline">1080p 60fps</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCinemaMode(!isCinemaMode)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer backdrop-blur-md shadow-lg ${
                      isCinemaMode 
                        ? 'bg-blue-600 text-white border-blue-400' 
                        : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-white/10'
                    }`}
                    title={isCinemaMode ? 'Exit Cinema View' : 'Cinematic Theater View'}
                  >
                    {isCinemaMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
              </div>

              {/* IN-VIDEO FLOATING CLINICAL TOOL DOCK (Top-Center) */}
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-lg px-2.5 py-1.5 rounded-2xl border border-cyan-500/30 shadow-2xl">
                {/* 1. Auscultation Simulator Toggle */}
                <button
                  type="button"
                  onClick={() => setIsAuscultationActive(!isAuscultationActive)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAuscultationActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md ring-1 ring-cyan-300'
                      : 'text-cyan-300 hover:bg-cyan-950/60'
                  }`}
                  title="Toggle Digital Stethoscope & Auscultation Sound Simulation"
                >
                  <Stethoscope size={13} />
                  <span>Auscultation</span>
                </button>

                {/* 2. Closed Captions (Subtitles) Toggle */}
                <button
                  type="button"
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    showSubtitles
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                  title="Toggle Live Subtitles Overlay"
                >
                  <Subtitles size={13} />
                  <span>CC Subtitles</span>
                </button>

                {/* 3. Instant Prescription Voucher */}
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(true)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-300 hover:bg-emerald-950/60 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="View Official Verified Rx Voucher"
                >
                  <FileText size={13} />
                  <span>Instant Rx</span>
                </button>

                {/* 4. Swap Feeds */}
                <button
                  type="button"
                  onClick={() => setIsPiPSwapped(!isPiPSwapped)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Swap Doctor and Patient Camera Views"
                >
                  <Layers size={13} />
                  <span className="hidden sm:inline">Swap PiP</span>
                </button>
              </div>

              {/* AUSCULTATION SOUND SIMULATOR OVERLAY */}
              <AnimatePresence>
                {isAuscultationActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-26 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-25 bg-slate-950/92 backdrop-blur-xl border border-cyan-400/50 rounded-2xl p-4 shadow-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                          <Stethoscope size={15} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">Digital Stethoscope Telemetry</h5>
                          <p className="text-[10px] text-cyan-400 font-mono">Live Acoustic Frequency Stream</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAuscultationActive(false)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Mode Toggle: Heart vs Lungs */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAuscultationType('cardiac')}
                        className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                          auscultationType === 'cardiac'
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Heart Sounds (S1 / S2)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuscultationType('pulmonary')}
                        className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                          auscultationType === 'pulmonary'
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Breath Sounds (Vesicular)
                      </button>
                    </div>

                    {/* Animated Phonocardiogram Audio Waveform */}
                    <div className="h-16 bg-slate-900/80 rounded-xl border border-slate-800 p-2 flex items-center justify-center gap-1 overflow-hidden relative">
                      {[14, 28, 42, 22, 50, 18, 36, 44, 20, 52, 26, 40, 16, 48, 30, 24, 46, 20].map((h, idx) => (
                        <motion.div
                          key={idx}
                          animate={{
                            height: [h * 0.2, h, h * 0.2],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{
                            duration: auscultationType === 'cardiac' ? 0.75 : 1.3,
                            repeat: Infinity,
                            delay: idx * 0.04
                          }}
                          className="w-1.5 bg-gradient-to-t from-cyan-400 via-blue-500 to-indigo-400 rounded-full"
                          style={{ height: h }}
                        />
                      ))}
                      <div className="absolute bottom-1 right-2 text-[9px] font-mono text-cyan-300">
                        {auscultationType === 'cardiac' ? '74 BPM • Regular Cadence' : '16 RPM • Clear Vesicular'}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-relaxed font-mono">
                      {auscultationType === 'cardiac'
                        ? '✅ S1 and S2 heart sounds physiologic and clear. No pathological systolic murmur or gallop detected.'
                        : '✅ Bilateral vesicular breath sounds clear to auscultation. No wheezing, crackles, or stridor present.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LIVE CC SUBTITLES OVERLAY BAR (Bottom Center) */}
              <AnimatePresence>
                {showSubtitles && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute bottom-20 left-4 right-4 sm:left-12 sm:right-12 z-20 flex justify-center pointer-events-none"
                  >
                    <div className="bg-slate-950/90 backdrop-blur-xl border border-cyan-400/40 px-4 py-2.5 rounded-2xl max-w-2xl w-full shadow-2xl text-center space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          LIVE CAPTIONS
                        </span>
                        <span className="text-[11px] font-bold text-white">
                          {selectedClinician.name}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                        "{doctorSpeechText}"
                      </p>
                      {doctorTranslatedText && activeLanguage !== 'English' && (
                        <p className="text-[11px] text-cyan-300 font-mono italic">
                          ({activeLanguage}): {doctorTranslatedText}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom-Left Doctor Profile Card & Acoustic Bars */}
              <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-left max-w-sm z-10 shadow-2xl">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedClinician.avatar}
                    alt={selectedClinician.name}
                    className="w-8 h-8 rounded-full object-cover border border-cyan-400/60"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {selectedClinician.name}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 text-[9px] font-bold">
                        Verified Consultant
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {selectedClinician.institution}
                    </p>
                  </div>
                </div>

                {/* Animated Audio Equalizer Waveform */}
                <div className="flex items-center gap-1 mt-2.5 h-3.5">
                  {[8, 14, 18, 12, 22, 16, 24, 10, 18, 14, 20, 12, 16, 8].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={
                        isVideoStreamPlaying
                          ? { height: [4, h, 4], opacity: [0.5, 1, 0.5] }
                          : { height: 4, opacity: 0.3 }
                      }
                      transition={{
                        duration: 0.6 + (i % 3) * 0.15,
                        repeat: Infinity,
                        delay: i * 0.05
                      }}
                      className="w-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full"
                    />
                  ))}
                  <span className="text-[9px] font-mono text-cyan-400 ml-2">Opus 48kHz HD Audio</span>
                </div>
              </div>

              {/* Bottom-Right Patient PiP Window (Interactive Click to Swap) */}
              <button
                type="button"
                onClick={() => setIsPiPSwapped(!isPiPSwapped)}
                className="absolute bottom-4 right-4 w-32 h-24 sm:w-44 sm:h-32 bg-slate-950 rounded-2xl border-2 border-cyan-400/50 hover:border-cyan-300 overflow-hidden shadow-2xl flex items-center justify-center z-15 cursor-pointer group/pip transition-all hover:scale-105"
                title="Click to Swap Feeds (Patient / Doctor)"
              >
                {isPiPSwapped ? (
                  <img
                    src={selectedClinician.avatar}
                    alt={selectedClinician.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : hasCameraStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] p-2 text-center">
                    <UserCheck size={20} className="text-slate-500 mb-1" />
                    <span>You (Patient)</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-bold text-white uppercase bg-slate-950/85 px-1.5 py-0.5 rounded backdrop-blur">
                  <span>{isPiPSwapped ? selectedClinician.name.split(' ')[1] : 'Patient (You)'}</span>
                  <span className="text-cyan-300 group-hover/pip:underline">Swap ⇄</span>
                </div>
              </button>
            </div>
          ) : (
            /* VOICE CALL MODE: THE ROUND CARD WITH SLOWLY SPINNING APP LOGO & REACTIVE ANIMATION */
            <div className="relative w-full max-w-2xl py-8 flex flex-col items-center justify-center">
              
              {/* Concentric Reactive Acoustic Ripple Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.35, 0.05, 0.35]
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-cyan-500/30"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.55, 1],
                    opacity: [0.25, 0, 0.25]
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.8
                  }}
                  className="w-80 h-80 sm:w-[26rem] sm:h-[26rem] rounded-full border border-blue-500/20"
                />
              </div>

              {/* Floating Moving Animation Container */}
              <motion.div
                animate={{
                  y: [-8, 8, -8]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* ───────────────────────────────────────────────────────── */}
                {/* THE MEDIUM-SIZED ROUND CARD WITH SLOWLY SPINNING APP LOGO */}
                {/* ───────────────────────────────────────────────────────── */}
                <div className="relative flex items-center justify-center">
                  
                  {/* Glowing Iridescent Radial Aura */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 via-blue-500/25 to-indigo-500/30 rounded-full blur-xl pointer-events-none animate-pulse" />

                  {/* Outer Orbital Ring */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-2.5 rounded-full border border-cyan-400/40 border-dashed pointer-events-none"
                  />

                  {/* The Round Card */}
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-slate-900 via-[#071330] to-slate-950 p-3.5 border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex items-center justify-center relative overflow-hidden">
                    
                    {/* Slowly Spinning App Logo */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <img
                        src="/logo.png"
                        alt="Doctorian App Logo"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                        onError={(e) => {
                          // Fallback to app svg or styled emblem if logo.png is not loaded
                          (e.target as HTMLImageElement).src = '/logo.svg';
                        }}
                      />
                    </motion.div>

                    {/* Subtle concentric inner lens ring */}
                    <div className="absolute inset-1.5 rounded-full border border-cyan-300/20 pointer-events-none" />
                  </div>
                </div>

                {/* Clinician Identity & Status Details */}
                <div className="text-center mt-6 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <img
                      src={selectedClinician.avatar}
                      alt={selectedClinician.name}
                      className="w-6 h-6 rounded-full object-cover border border-cyan-400"
                    />
                    <h4 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                      {selectedClinician.name}
                    </h4>
                  </div>
                  
                  <p className="text-xs text-slate-400">
                    {selectedClinician.title} • {selectedClinician.institution}
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-1 text-xs text-cyan-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Voice Consultation Active</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{activeLanguage} Audio</span>
                  </div>
                </div>

                {/* Reactive Live Acoustic Soundwave Bars */}
                <div className="flex items-center gap-1.5 mt-5 h-8">
                  {[12, 22, 18, 30, 26, 14, 28, 20, 16, 24, 28, 16, 22, 14].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [h * 0.3, h, h * 0.3],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.75 + (i % 4) * 0.1,
                        delay: i * 0.06
                      }}
                      className="w-1.5 bg-gradient-to-t from-cyan-400 via-blue-500 to-indigo-400 rounded-full"
                      style={{ height: h }}
                    />
                  ))}
                </div>

                <div className="mt-3 text-[10px] font-mono text-slate-500 tracking-wider uppercase">
                  Encrypted VoIP Link • 256-bit AES Channel
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 4. EXPANDABLE DRAWERS (Live Transcript & Clinical Note)   */}
        {/* ───────────────────────────────────────────────────────── */}
        {/* Live Speech Transcript Drawer */}
        <AnimatePresence>
          {showChatDrawer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900 border-t border-slate-800 p-4 space-y-3 shrink-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-400" />
                  Live Multilingual Transcript &amp; Dialogue
                </span>
                <button
                  type="button"
                  onClick={() => setShowChatDrawer(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Hide
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs">
                {transcript.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl ${
                      item.speaker === 'Doctor'
                        ? 'bg-blue-950/60 border border-blue-800/40 text-blue-100'
                        : 'bg-slate-800/80 border border-slate-700/60 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-0.5">
                      <span>{item.speaker === 'Doctor' ? selectedClinician.name : patientName}</span>
                      <span className="font-mono">{item.time}</span>
                    </div>
                    <p className="leading-relaxed">{item.text}</p>
                    {item.translatedText && (
                      <p className="text-[10px] text-cyan-300 font-mono italic mt-1">
                        {item.translatedText}
                      </p>
                    )}
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendManualMessage()}
                  placeholder={`Speak or write to ${selectedClinician.name}...`}
                  className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendManualMessage}
                  disabled={isAiResponding}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Send size={12} />
                  <span>Send</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clinical Note Drawer */}
        <AnimatePresence>
          {showNotesDrawer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900 border-t border-slate-800 p-4 space-y-3 shrink-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <FileText size={14} className="text-cyan-400" />
                  Clinical SOAP Encounter Summary
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportToSheets}
                    disabled={isExportingSheets}
                    className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 size={11} />
                    <span>{isExportingSheets ? 'Exporting...' : 'Export to Sheets'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNotesDrawer(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    Hide
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-400 block text-[10px] uppercase">Subjective:</strong>
                  <p className="text-slate-300 mt-0.5">{soapNote.subjective}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-blue-400 block text-[10px] uppercase">Objective:</strong>
                  <p className="text-slate-300 mt-0.5">{soapNote.objective}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-purple-400 block text-[10px] uppercase">Assessment:</strong>
                  <p className="text-slate-300 mt-0.5">{soapNote.assessment}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-400 block text-[10px] uppercase">Plan &amp; Rx:</strong>
                  <p className="text-slate-300 mt-0.5 whitespace-pre-line">{soapNote.plan}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 5. BOTTOM CONTROL DOCK (Ergonomic, Modern, Interactive)   */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {/* Left Feature Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowChatDrawer(!showChatDrawer)}
              className={`p-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showChatDrawer
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Toggle Live Multilingual Transcript"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Transcript</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNotesDrawer(!showNotesDrawer)}
              className={`p-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showNotesDrawer
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Toggle Clinical Encounter SOAP Notes"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Clinical Notes</span>
            </button>
          </div>

          {/* Center Call Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Microphone Toggle */}
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 ${
                isMicOn
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            {/* Video Camera Toggle */}
            <button
              type="button"
              disabled={callMode === 'voice'}
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40 ${
                isVideoOn && callMode === 'video'
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            {/* Speaker / TTS Audio Toggle */}
            <button
              type="button"
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 ${
                isTtsEnabled
                  ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                  : 'bg-slate-800 text-slate-500'
              }`}
              title={isTtsEnabled ? 'Mute Clinician Voice' : 'Enable Clinician Voice'}
            >
              {isTtsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              title="End Telehealth Consultation"
            >
              <PhoneOff size={16} />
              <span>End Call</span>
            </button>
          </div>

          {/* Right Action: Prescription Voucher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPrescriptionModal(true)}
              className="p-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="View Referral & Prescription Slip"
            >
              <FileText size={15} />
              <span className="hidden md:inline">Prescription Slip</span>
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 6. PRESCRIPTION & REFERRAL VOUCHER MODAL                 */}
        {/* ───────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showPrescriptionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 text-white"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                      Rx
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Official Telehealth Prescription</h4>
                      <p className="text-[10px] text-slate-400">Uganda Ministry of Health Compliant</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>DOCTOR: {selectedClinician.name}</span>
                    <span>PATIENT: {patientName}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 text-slate-200">
                    <p className="font-bold text-cyan-300">Prescription:</p>
                    <p className="whitespace-pre-line mt-1">{soapNote.plan}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window) window.print();
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Printer size={14} />
                    <span>Print Rx Voucher</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
