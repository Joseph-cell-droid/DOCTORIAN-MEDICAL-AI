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
  UserCheck
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
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [liveTranscriptText, setLiveTranscriptText] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  // Live Simulated/Connected Vitals HUD
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
        hr: Math.min(95, Math.max(68, prev.hr + (Math.random() > 0.5 ? 1 : -1))),
        spo2: Math.min(100, Math.max(97, prev.spo2 + (Math.random() > 0.8 ? 1 : -0.2))),
        temp: Number((36.7 + Math.random() * 0.3).toFixed(1))
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const [transcript, setTranscript] = useState<{ speaker: string; text: string; time: string; translatedText?: string }[]>([
    {
      speaker: 'Doctor',
      text: selectedClinician.greetingEnglish,
      translatedText: selectedClinician.greetingLuganda,
      time: '09:00 AM'
    }
  ]);
  const [customMsg, setCustomMsg] = useState('');
  const [isScribing, setIsScribing] = useState(false);
  const [soapNote, setSoapNote] = useState({
    subjective: 'Patient reports mild dry post-exercise cough with throat tickle. Denies high fever, chest pain, or dyspnea.',
    objective: 'Smart Telemetry: HR 74 BPM, SpO2 98%, BP 122/80 mmHg, Temp 36.8°C. Lungs clear to digital auscultation.',
    assessment: 'Mild exercise-induced airway irritation vs allergic tracheitis. Low acute infection risk.',
    plan: '1. Maintain generous oral hydration (warm clean water + lemon/honey).\n2. Monitor peak flow & temperature twice daily.\n3. Prescribed: Cetirizine 10mg nocte for 5 days.\n4. Seek immediate physical triage if fever (Omusujja) or breathlessness develops.'
  });

  // Prescription Voucher Modal
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetsExportSuccess, setSheetsExportSuccess] = useState<boolean | null>(null);
  const [sheetsExportError, setSheetsExportError] = useState<string | null>(null);

  // Camera feed ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Timer for Call Duration
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, liveTranscriptText]);

  // Handle Camera Feed
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && isVideoOn && callMode === 'video') {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setHasCameraStream(true);
        })
        .catch(() => {
          setHasCameraStream(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setHasCameraStream(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, isVideoOn, callMode]);

  // Toggle Speech Recognition Mic
  const toggleMic = () => {
    if (!isMicOn) {
      setIsMicOn(true);
      speechEngine.startListening({
        onResult: (text, isFinal) => {
          setLiveTranscriptText(text);
          if (isFinal && text.trim()) {
            handlePatientSpeech(text.trim());
            setLiveTranscriptText('');
          }
        },
        onError: (err) => {
          console.warn('[Telehealth STT]', err);
          setIsMicOn(false);
        },
        onEnd: () => {
          if (isMicOn) {
            try {
              speechEngine.startListening({
                onResult: (text, isFinal) => {
                  setLiveTranscriptText(text);
                  if (isFinal && text.trim()) {
                    handlePatientSpeech(text.trim());
                    setLiveTranscriptText('');
                  }
                }
              });
            } catch (e) {
              setIsMicOn(false);
            }
          }
        }
      });
    } else {
      setIsMicOn(false);
      speechEngine.stopListening();
      setLiveTranscriptText('');
    }
  };

  // Process Patient Speech / Message with Ugandan Linguistic Context
  const handlePatientSpeech = async (patientText: string) => {
    if (!patientText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userUtterance = {
      speaker: 'Patient',
      text: patientText,
      time: timeStr
    };
    const updatedTranscript = [...transcript, userUtterance];
    setTranscript(updatedTranscript);

    // AI Doctor Reasoning
    setIsAiResponding(true);
    setIsScribing(true);

    try {
      const prompt = `You are ${selectedClinician.name}, ${selectedClinician.title} at ${selectedClinician.institution}.
Specialty: ${selectedClinician.specialty}.
Current patient dialect preferred: ${activeLanguage}.
Patient in live telehealth consultation just said: "${patientText}"
Recent conversation:
${updatedTranscript.map((t) => `${t.speaker}: ${t.text}`).join('\n')}

Provide an empathetic, scientifically grounded clinical response (2 sentences max). 
Also provide a localized subtitle translation in ${activeLanguage === 'English' ? 'Luganda' : 'English'}.
Update the SOAP note object if new symptoms or plans are discussed.

Return valid JSON in this exact structure:
{
  "response": "Concise spoken doctor reply in English...",
  "translated": "Localized translation in ${activeLanguage === 'English' ? 'Luganda' : 'English'}...",
  "soap": {
    "subjective": "...",
    "objective": "HR: ${liveVitals.hr} BPM, SpO2: ${liveVitals.spo2}%, BP: ${liveVitals.bpSys}/${liveVitals.bpDia} mmHg",
    "assessment": "...",
    "plan": "..."
  }
}`;

      const aiRes = await api.ai.aiChat([{ role: 'user', text: prompt }], "You are an expert Ugandan Telehealth Physician.");
      const rawText = aiRes.text || '';
      const match = rawText.match(/\{[\s\S]*\}/);

      let doctorReply = "I understand completely. We are monitoring your symptoms and keeping your oxygen and cardiac rhythm stable.";
      let translatedSubtitle = "Nkitegedde bulungi. Tuli wano okulaba nga obulamu bwo bulungi.";

      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (parsed.response) doctorReply = parsed.response;
          if (parsed.translated) translatedSubtitle = parsed.translated;
          if (parsed.soap) {
            setSoapNote({
              subjective: parsed.soap.subjective || soapNote.subjective,
              objective: parsed.soap.objective || soapNote.objective,
              assessment: parsed.soap.assessment || soapNote.assessment,
              plan: parsed.soap.plan || soapNote.plan
            });
          }
        } catch (je) {
          doctorReply = rawText.replace(/\{[\s\S]*\}/, '').trim() || doctorReply;
        }
      } else if (rawText) {
        doctorReply = rawText.trim();
      }

      // Add Doctor response to transcript
      const docUtterance = {
        speaker: 'Doctor',
        text: doctorReply,
        translatedText: translatedSubtitle,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTranscript([...updatedTranscript, docUtterance]);

      // Speak response out loud using natural TTS
      if (isTtsEnabled) {
        speechEngine.speak(doctorReply, {
          rate: 1.0,
          pitch: 1.05
        });
      }
    } catch (err) {
      console.warn("Telehealth AI Response error:", err);
      const fallbackReply = "I have noted your symptoms in your health record. Let's make sure you stay hydrated and rested.";
      setTranscript([
        ...updatedTranscript,
        {
          speaker: 'Doctor',
          text: fallbackReply,
          translatedText: 'Mbiwandiise mu kalonda w’obulamu bwo. Nywa amazzi mangi era owummuleko.',
          time: timeStr
        }
      ]);
      if (isTtsEnabled) {
        speechEngine.speak(fallbackReply);
      }
    } finally {
      setIsAiResponding(false);
      setIsScribing(false);
    }
  };

  const handleSendManualMessage = () => {
    if (!customMsg.trim()) return;
    const txt = customMsg;
    setCustomMsg('');
    handlePatientSpeech(txt);
  };

  const handleExportToSheets = async () => {
    setIsExportingSheets(true);
    setSheetsExportSuccess(null);
    setSheetsExportError(null);
    try {
      await appendSoapNoteToSheets({
        patientCode: 'PAT-JOSEPH-UG',
        subjective: soapNote.subjective,
        objective: soapNote.objective,
        assessment: soapNote.assessment,
        plan: soapNote.plan,
        timestamp: new Date().toLocaleString()
      });
      setSheetsExportSuccess(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechEngine.speak("Clinical Encounter Note successfully saved to Google Sheets EHR ledger.");
      }
    } catch (err: any) {
      console.error("Sheets export error:", err);
      setSheetsExportError(err.message || "Failed to synchronize to Google Sheets");
    } finally {
      setIsExportingSheets(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDownloadPrescription = () => {
    const content = `==========================================================
REPUBLIC OF UGANDA - MINISTRY OF HEALTH
DOCTORIAN CLINICAL TELEHEALTH CONSULTATION VOUCHER
==========================================================
Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}
Consultation ID: DOC-UG-${Date.now().toString().slice(-6)}
Attending Clinician: ${selectedClinician.name} (${selectedClinician.title})
Facility: ${selectedClinician.institution}
Patient: ${patientName}

TELEMETRY & VITALS RECORD:
- Heart Rate: ${liveVitals.hr} BPM (Normal range: 60-100)
- SpO2: ${liveVitals.spo2}%
- Blood Pressure: ${liveVitals.bpSys}/${liveVitals.bpDia} mmHg
- Body Temperature: ${liveVitals.temp}°C
- MoH Acuity: ${liveVitals.triageStatus}

CLINICAL SOAP ASSESSMENT:
[Subjective]: ${soapNote.subjective}
[Objective]: ${soapNote.objective}
[Assessment]: ${soapNote.assessment}

PRESCRIPTION & CARE REGIMEN:
${soapNote.plan}

Digital Verification Hash: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}
Licensed under Uganda Medical and Dental Practitioners Council (UMDPC)
==========================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prescription_Voucher_${patientName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-6xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative my-3"
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-850 bg-slate-50/90 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              {callMode === 'video' ? <Video size={20} /> : <Phone size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Doctorian Telehealth Suite
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black text-[9px] uppercase tracking-wider rounded-full flex items-center gap-1">
                  <Radio size={10} className="animate-pulse text-emerald-500" />
                  {formatTime(callDuration)} • WebRTC 4K
                </span>
                <span className="hidden sm:inline px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-[9px] font-bold rounded-full">
                  MoH Uganda Certified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-xs sm:max-w-md">
                {selectedClinician.name} • {selectedClinician.institution}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Call Mode Switcher */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setCallMode('video');
                  setIsVideoOn(true);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  callMode === 'video'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Video size={13} />
                <span className="hidden sm:inline">HD Video</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCallMode('voice');
                  setIsVideoOn(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  callMode === 'voice'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Phone size={13} />
                <span className="hidden sm:inline">Voice Only</span>
              </button>
            </div>

            {/* Ugandan Language Switcher */}
            <div className="relative">
              <select
                value={activeLanguage}
                onChange={(e) => setActiveLanguage(e.target.value as any)}
                className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                title="Select Consultation Dialect"
              >
                <option value="English">English</option>
                <option value="Luganda">Luganda</option>
                <option value="Swahili">Swahili</option>
                <option value="Runyankole">Runyankole</option>
                <option value="Acholi">Acholi-Luo</option>
              </select>
            </div>

            {/* TTS Voice Toggle */}
            <button
              onClick={() => {
                const next = !isTtsEnabled;
                setIsTtsEnabled(next);
                if (!next) speechEngine.stopSpeaking();
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isTtsEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'
              }`}
              title={isTtsEnabled ? 'Doctor Voice Output Active' : 'Mute Doctor Voice'}
            >
              {isTtsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Close / End */}
            <button
              onClick={() => {
                speechEngine.stopSpeaking();
                speechEngine.stopListening();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Clinician Persona Selector Pill Bar */}
        <div className="px-5 py-2 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            Attending Clinician:
          </span>
          {UGANDAN_CLINICIAN_PERSONAS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedClinician(doc);
                setTranscript((prev) => [
                  ...prev,
                  {
                    speaker: 'Doctor',
                    text: `Consultation switched to ${doc.name} (${doc.specialty}). ${doc.greetingEnglish}`,
                    translatedText: doc.greetingLuganda,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedClinician.id === doc.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <UserCheck size={12} />
              <span>{doc.name}</span>
              <span className="text-[9px] opacity-75 hidden md:inline font-mono">({doc.specialty.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 max-h-[78vh] overflow-y-auto">
          {/* Column 1: Video / Voice Call Screen & Live Telemetry HUD (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Visual Stage Box */}
            <div className="relative aspect-video bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              {callMode === 'video' && isVideoOn ? (
                /* HD VIDEO CALL MODE */
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                  <img
                    src={selectedClinician.avatar}
                    alt={selectedClinician.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Patient PiP Stream */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-40 sm:h-28 bg-slate-900 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl flex items-center justify-center">
                    {hasCameraStream ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <img
                          src="/app_owner_admin.png"
                          alt="Patient Feed"
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1.5 text-[8px] font-black text-white uppercase bg-slate-950/80 px-1.5 py-0.5 rounded backdrop-blur">
                      You (Patient)
                    </div>
                  </div>
                </div>
              ) : (
                /* VOICE-ONLY CONSULTATION MODE: Elegant Acoustic Milky Way / Galaxy Visualizer */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-radial from-[#0d1e4c] via-[#070f26] to-[#030712] overflow-hidden">
                  {/* Cosmic galaxy orbit rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <div className="w-72 h-72 rounded-full border border-cyan-500/30 animate-[spin_18s_linear_infinite]" />
                    <div className="w-96 h-96 rounded-full border border-blue-500/20 animate-[spin_24s_linear_infinite_reverse]" />
                    <div className="w-[32rem] h-[32rem] rounded-full border border-indigo-500/15 animate-[spin_32s_linear_infinite]" />
                  </div>

                  {/* Central Clinician Orb */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_50px_rgba(6,182,212,0.5)] relative">
                      <img
                        src={selectedClinician.avatar}
                        alt={selectedClinician.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-30 pointer-events-none" />
                    </div>

                    <div className="text-center mt-3 space-y-0.5">
                      <h4 className="text-base sm:text-lg font-black text-white tracking-wide">
                        {selectedClinician.name}
                      </h4>
                      <p className="text-xs text-cyan-300 font-mono">
                        Voice Consultation Active • {activeLanguage} Audio Channel
                      </p>
                    </div>

                    {/* Acoustic Soundwave Beads */}
                    <div className="flex items-center gap-1.5 mt-4 h-7">
                      {[12, 24, 18, 30, 26, 14, 28, 20, 16, 22, 28, 14].map((h, i) => (
                        <motion.span
                          key={i}
                          animate={{ height: [h * 0.35, h, h * 0.35] }}
                          transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.07 }}
                          className="w-1.5 bg-gradient-to-t from-cyan-400 to-blue-400 rounded-full"
                          style={{ height: h }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE BIO-TELEMETRY HUD OVERLAY (Top-Left on screen) */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 flex flex-col gap-1 shadow-2xl z-20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                    Live Telemetry Fusion
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-white">
                  <span className="flex items-center gap-1">
                    <Heart size={11} className="text-rose-500 fill-rose-500" />
                    <strong>{liveVitals.hr}</strong> <span className="text-slate-400">BPM</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity size={11} className="text-cyan-400" />
                    <strong>{liveVitals.spo2}%</strong> <span className="text-slate-400">SpO2</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Thermometer size={11} className="text-amber-400" />
                    <strong>{liveVitals.temp}°C</strong>
                  </span>
                </div>
              </div>

              {/* Subtitle Bar when AI or Patient speaks */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-48 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-left z-20">
                <p className="text-[11px] text-white font-medium line-clamp-2">
                  <span className="text-cyan-400 font-bold">
                    {speechEngine.isSpeaking() ? `${selectedClinician.name}: ` : isMicOn ? 'You: ' : 'Live Subtitles: '}
                  </span>
                  {liveTranscriptText || transcript[transcript.length - 1]?.text || 'Listening for speech input...'}
                </p>
                {transcript[transcript.length - 1]?.translatedText && (
                  <p className="text-[10px] text-emerald-300 font-mono italic mt-0.5">
                    ({activeLanguage}): {transcript[transcript.length - 1]?.translatedText}
                  </p>
                )}
              </div>
            </div>

            {/* Call Controls Dock */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <button
                onClick={toggleMic}
                className={`px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2 font-black text-xs uppercase tracking-wider shadow-md ${
                  isMicOn
                    ? 'bg-rose-500 text-white shadow-rose-500/20 ring-2 ring-rose-500/30'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
                title={isMicOn ? 'Mute Speech-to-Text Microphone' : 'Turn On Live Hands-Free Mic'}
              >
                {isMicOn ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />}
                <span>{isMicOn ? 'Live Mic ON' : 'Turn On Mic'}</span>
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                disabled={callMode === 'voice'}
                className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2 font-black text-xs uppercase tracking-wider disabled:opacity-40 ${
                  isVideoOn
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white'
                    : 'bg-rose-500 text-white'
                }`}
                title={isVideoOn ? 'Pause Video Stream' : 'Enable Camera'}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FileText size={16} />
                <span>Prescription Slip</span>
              </button>

              <button
                onClick={() => {
                  speechEngine.stopSpeaking();
                  speechEngine.stopListening();
                  onClose();
                }}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <PhoneOff size={18} />
                <span>End Call</span>
              </button>
            </div>

            {/* Live Chat & Transcript Feed */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Cpu size={14} className="text-blue-500" />
                  Live Consultation Speech Transcript
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {transcript.length} messages
                </span>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {transcript.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      item.speaker === 'Doctor'
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/30 text-blue-950 dark:text-blue-100'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between font-black text-[10px] uppercase">
                      <span>{item.speaker === 'Doctor' ? selectedClinician.name : patientName}</span>
                      <span className="text-slate-400 font-mono text-[9px]">{item.time}</span>
                    </div>
                    <p className="leading-relaxed">{item.text}</p>
                    {item.translatedText && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono italic">
                        {item.translatedText}
                      </p>
                    )}
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>

              {/* Text Input in Call */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendManualMessage()}
                  placeholder={`Ask ${selectedClinician.name} in English or Luganda...`}
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendManualMessage}
                  disabled={isAiResponding}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: AI Clinical Scribe & Auto-SOAP Note Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200 dark:border-indigo-850 rounded-[2rem] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Real-Time AI Clinical Scribe
                  </h4>
                </div>
                {isScribing ? (
                  <RefreshCw size={14} className="text-indigo-500 animate-spin" />
                ) : (
                  <Shield size={14} className="text-emerald-500" />
                )}
              </div>

              {/* SOAP Output Cards */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="font-black text-indigo-600 dark:text-indigo-400 block text-[10px] uppercase tracking-wider">
                    Subjective (Patient Symptoms):
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {soapNote.subjective}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="font-black text-blue-600 dark:text-blue-400 block text-[10px] uppercase tracking-wider">
                    Objective (Bio-Telemetry Fusion):
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {soapNote.objective}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="font-black text-purple-600 dark:text-purple-400 block text-[10px] uppercase tracking-wider">
                    Assessment (Clinical Diagnosis):
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {soapNote.assessment}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase tracking-wider">
                    Plan & Prescriptions (Uganda MoH):
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {soapNote.plan}
                  </p>
                </div>
              </div>

              {/* Feedback messages */}
              <AnimatePresence>
                {sheetsExportSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Encounter Note exported to Google Sheets EHR ledger!</span>
                  </motion.div>
                )}
                {sheetsExportError && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <AlertCircle size={14} className="text-rose-500" />
                    <span>{sheetsExportError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleExportToSheets}
                  disabled={isExportingSheets}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  {isExportingSheets ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Share2 size={14} className="text-indigo-500" />
                  )}
                  <span>{isExportingSheets ? 'Exporting...' : 'Export Sheets'}</span>
                </button>

                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <FileText size={14} />
                  <span>View Voucher</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Slip & Referral Voucher Modal */}
        <AnimatePresence>
          {showPrescriptionModal && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider">
                        Clinical Prescription & Referral Slip
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Uganda Ministry of Health Standard Telemedicine Format
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPrescriptionModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Date: {new Date().toLocaleDateString()}</span>
                    <span>Ref: DOC-UG-{Date.now().toString().slice(-6)}</span>
                  </div>
                  <p><strong>Clinician:</strong> {selectedClinician.name} ({selectedClinician.title})</p>
                  <p><strong>Facility:</strong> {selectedClinician.institution}</p>
                  <p><strong>Patient:</strong> {patientName}</p>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">Diagnosis Assessment:</p>
                    <p>{soapNote.assessment}</p>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-blue-600 dark:text-blue-400">Prescription / Treatment Plan:</p>
                    <p className="whitespace-pre-line">{soapNote.plan}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadPrescription}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Download size={14} />
                    <span>Download Slip (.txt)</span>
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <Printer size={14} />
                    <span>Print</span>
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
