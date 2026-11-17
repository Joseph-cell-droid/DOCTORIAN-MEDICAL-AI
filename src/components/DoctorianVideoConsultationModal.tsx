import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  MessageSquare,
  PhoneOff,
  X,
  Phone,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Subtitles,
  ArrowLeftRight,
  Send,
  Pill,
  Activity,
  Shield,
  Users,
  Copy,
  Check,
  WifiOff,
  Clock,
  FileText,
  PhoneCall,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { api, type TelephonyContact, type SmsDispatchRecord } from '../api';
import { UGANDAN_CLINICIAN_PERSONAS, ClinicianPersona } from '../utils/ugandanMedicalLexicon';
import { speechEngine } from '../utils/speechEngine';
import {
  createCallRoomId,
  generateClinicalCallReply,
  getCallHistoryRecords,
  getGreetingForLanguage,
  getLocalPatientContext,
  playSoftCallTone,
  saveCallHistoryRecord,
  TelehealthWebRTCSession,
  CallTranscriptEntry,
  PersistedCallRecord
} from '../utils/telehealthCallEngine';

interface DoctorianVideoConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToVoice?: () => void;
}

export const DoctorianVideoConsultationModal: React.FC<DoctorianVideoConsultationModalProps> = ({
  isOpen,
  onClose,
  onSwitchToVoice
}) => {
  const [selectedClinician, setSelectedClinician] = useState<ClinicianPersona>(UGANDAN_CLINICIAN_PERSONAS[0]);
  const [language, setLanguage] = useState<'English' | 'Luganda' | 'Swahili' | 'Runyankole' | 'Acholi'>('English');
  const [videoQuality, setVideoQuality] = useState<'1080p HD' | '360p Saver'>('1080p HD');

  // Media hardware state
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [isPiPSwapped, setIsPiPSwapped] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Side drawer tabs
  const [activeTab, setActiveTab] = useState<'dialogue' | 'sms' | 'vitals' | 'room'>('dialogue');

  // Call timing & WebRTC state
  const [callSeconds, setCallSeconds] = useState(0);
  const [startedAt] = useState(() => new Date().toISOString());
  const [roomId, setRoomId] = useState(() => createCallRoomId());
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [peerState, setPeerState] = useState<'ai_consult' | 'ringing' | 'connected' | 'ended'>('ai_consult');
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(() =>
    typeof window !== 'undefined' && (localStorage.getItem('medical_forced_offline') === 'true' || !navigator.onLine)
  );

  // Live audio levels (from WebAudio AnalyserNode when mic active)
  const [micSpectrum, setMicSpectrum] = useState<number[]>([18, 28, 42, 34, 52, 38, 26, 20]);
  const [isClinicianSpeaking, setIsClinicianSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Patient context & live transcript
  const [patientCtx] = useState(() => getLocalPatientContext());
  const [transcript, setTranscript] = useState<CallTranscriptEntry[]>(() => {
    const g = getGreetingForLanguage(UGANDAN_CLINICIAN_PERSONAS[0], 'English');
    return [
      {
        id: 'init-1',
        speaker: 'Doctor',
        speakerName: UGANDAN_CLINICIAN_PERSONAS[0].name,
        text: g.primary,
        translatedText: g.translation,
        time: '00:00'
      }
    ];
  });
  const [liveCaption, setLiveCaption] = useState<string>(() => getGreetingForLanguage(UGANDAN_CLINICIAN_PERSONAS[0], 'English').primary);
  const [liveCaptionTranslated, setLiveCaptionTranslated] = useState<string | undefined>(() => getGreetingForLanguage(UGANDAN_CLINICIAN_PERSONAS[0], 'English').translation);
  const [messageInput, setMessageInput] = useState('');
  const [savedHistory, setSavedHistory] = useState<PersistedCallRecord[]>(() => getCallHistoryRecords());
  const [rxSentNotice, setRxSentNotice] = useState<string | null>(null);

  // Registered Doctors & Patients Telephony + Auto-SMS State
  const [directory, setDirectory] = useState<{
    doctors: TelephonyContact[];
    patients: TelephonyContact[];
    emergency: TelephonyContact[];
  }>({ doctors: [], patients: [], emergency: [] });
  const [smsGroup, setSmsGroup] = useState<'doctor' | 'patient'>('doctor');
  const [selectedSmsContact, setSelectedSmsContact] = useState<TelephonyContact | null>(null);
  const [pairedNotifyId, setPairedNotifyId] = useState<string>('');
  const [autoSmsEnabled, setAutoSmsEnabled] = useState<boolean>(true);
  const [customSmsNote, setCustomSmsNote] = useState<string>('');
  const [smsDispatches, setSmsDispatches] = useState<SmsDispatchRecord[]>([]);
  const [isDispatchingSms, setIsDispatchingSms] = useState<boolean>(false);
  const [smsStatusBanner, setSmsStatusBanner] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const webrtcRef = useRef<TelehealthWebRTCSession | null>(null);
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null);
  const micRafRef = useRef<number | null>(null);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Monitor online/offline status cleanly
  useEffect(() => {
    const syncNet = () => {
      setIsOfflineMode(localStorage.getItem('medical_forced_offline') === 'true' || !navigator.onLine);
    };
    window.addEventListener('online', syncNet);
    window.addEventListener('offline', syncNet);
    window.addEventListener('offline_forced_changed', syncNet);
    return () => {
      window.removeEventListener('online', syncNet);
      window.removeEventListener('offline', syncNet);
      window.removeEventListener('offline_forced_changed', syncNet);
    };
  }, []);

  // Call duration timer, soft connect chime, and Registered Phone Directory sync
  useEffect(() => {
    if (!isOpen) return;
    playSoftCallTone('connect');
    const timer = window.setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);

    let cancelled = false;
    void api.telephony.getDirectory().then((dir) => {
      if (cancelled) return;
      setDirectory(dir);
      setSelectedSmsContact((prev) => prev || dir.doctors[0] || dir.patients[0] || null);
    });
    void api.telephony.getLogs().then((logs) => {
      if (cancelled) return;
      if (logs.sms.length > 0) setSmsDispatches(logs.sms);
    });

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isOpen]);

  const handleVideoCallAndSms = useCallback(
    async (targetOverride?: TelephonyContact) => {
      const target = targetOverride || selectedSmsContact;
      if (!target) {
        setSmsStatusBanner('Select a registered doctor or patient first.');
        return;
      }
      setIsDispatchingSms(true);
      playSoftCallTone('ring');
      setPeerState('ringing');
      webrtcRef.current?.sendRoomInvite(target.role === 'patient' ? 'patient' : 'doctor', target.name);

      try {
        const res = await api.telephony.callAndSms({
          roomId,
          callMode: 'video',
          calleeId: target.id,
          calleeName: target.name,
          calleeRole: target.role,
          calleePhone: target.phone,
          autoSendSms: autoSmsEnabled,
          customSmsMessage: customSmsNote.trim() || undefined,
          notifyPatientId: target.role !== 'patient' && pairedNotifyId ? pairedNotifyId : undefined,
          notifyDoctorId: target.role === 'patient' && pairedNotifyId ? pairedNotifyId : undefined
        });

        if (res.smsDispatches?.length > 0) {
          setSmsDispatches((prev) => [...res.smsDispatches, ...prev].slice(0, 25));
          const sentTo = res.smsDispatches.map((s) => `${s.recipientName} (${s.recipientPhone})`).join(' & ');
          setSmsStatusBanner(`Video Invite & Auto-SMS sent to ${sentTo}`);
          setTranscript((prev) => [
            ...prev,
            {
              id: `sys-vsms-${Date.now()}`,
              speaker: 'System',
              speakerName: 'Telephony & Auto-SMS Gateway',
              text: `Video Consultation ringing ${target.name} (${target.phone}). Automatic SMS dispatched to ${sentTo} [${res.smsDispatches[0].providerMessageId}].`,
              time: formatTimer(callSeconds)
            }
          ]);
        } else {
          setSmsStatusBanner(`Video Room ${roomId} ringing ${target.name} (${target.phone}).`);
        }
        setCustomSmsNote('');
      } catch (err: any) {
        setSmsStatusBanner(err?.message || 'Failed to ring / dispatch SMS.');
      } finally {
        setIsDispatchingSms(false);
      }
    },
    [selectedSmsContact, roomId, autoSmsEnabled, customSmsNote, pairedNotifyId, callSeconds]
  );

  // WebRTC Peer Session Lifecycle
  useEffect(() => {
    if (!isOpen) return;
    const session = new TelehealthWebRTCSession({
      roomId,
      mode: 'video',
      onRemoteStream: (stream) => {
        setHasRemoteStream(true);
        setPeerState('connected');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      },
      onStateChange: (st) => {
        if (st === 'ringing') setPeerState('ringing');
        if (st === 'connected') setPeerState('connected');
        if (st === 'ended') {
          setHasRemoteStream(false);
          setPeerState('ai_consult');
        }
      }
    });
    session.startListening();
    webrtcRef.current = session;
    return () => {
      session.close();
      webrtcRef.current = null;
    };
  }, [isOpen, roomId]);

  // Real Camera Media Capture
  useEffect(() => {
    if (!isOpen || !isCameraOn || isScreenSharing) {
      if (localStreamRef.current && !isCameraOn) {
        localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
      }
      if (!isCameraOn && !isScreenSharing) {
        setHasCameraStream(false);
      }
      return;
    }

    let cancelled = false;
    const constraints = videoQuality === '1080p HD'
      ? { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false }
      : { video: { width: { ideal: 480 }, height: { ideal: 360 }, facingMode: 'user' }, audio: false };

    navigator.mediaDevices
      ?.getUserMedia(constraints)
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setHasCameraStream(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        webrtcRef.current?.setLocalStream(stream);
      })
      .catch(() => {
        if (!cancelled) setHasCameraStream(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, isCameraOn, videoQuality, isScreenSharing]);

  // Cleanup all hardware streams when modal closes
  useEffect(() => {
    if (isOpen) return;
    speechEngine.stopListening();
    speechEngine.stopSpeaking();
    speechEngine.stopMicrophoneAnalyser();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
  }, [isOpen]);

  // Process user voice/text query and speak clinical answer
  const handleClinicianTurn = useCallback(
    async (userQuery: string) => {
      const cleaned = userQuery.trim();
      if (!cleaned) return;

      const stamp = formatTimer(callSeconds);
      const patientEntry: CallTranscriptEntry = {
        id: `pt-${Date.now()}`,
        speaker: 'Patient',
        speakerName: patientCtx.name,
        text: cleaned,
        time: stamp
      };
      setTranscript((prev) => [...prev, patientEntry]);
      setIsThinking(true);

      const { reply, translation } = await generateClinicalCallReply({
        query: cleaned,
        clinician: selectedClinician,
        language,
        patientName: patientCtx.name,
        vitals: patientCtx.vitals,
        forceOffline: isOfflineMode
      });

      setIsThinking(false);
      setLiveCaption(reply);
      setLiveCaptionTranslated(translation);

      const docEntry: CallTranscriptEntry = {
        id: `doc-${Date.now()}`,
        speaker: 'Doctor',
        speakerName: selectedClinician.name,
        text: reply,
        translatedText: language !== 'English' ? translation : undefined,
        time: formatTimer(callSeconds + 1)
      };
      setTranscript((prev) => [...prev, docEntry]);

      if (isSpeakerOn) {
        speechEngine.speak(reply, {
          rate: 0.96,
          onStart: () => setIsClinicianSpeaking(true),
          onEnd: () => setIsClinicianSpeaking(false),
          onError: () => setIsClinicianSpeaking(false)
        });
      }
    },
    [callSeconds, isOfflineMode, isSpeakerOn, language, patientCtx.name, patientCtx.vitals, selectedClinician]
  );

  // Real Microphone Analyser & Speech-to-Text when Mic toggled ON
  useEffect(() => {
    if (!isOpen || !isMicOn) {
      speechEngine.stopListening();
      speechEngine.stopMicrophoneAnalyser();
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
      setMicSpectrum([14, 20, 26, 22, 30, 24, 18, 14]);
      return;
    }

    let cancelled = false;
    const dataArray = new Uint8Array(16);

    void speechEngine.setupMicrophoneAnalyser().then((analyser) => {
      if (cancelled || !analyser) return;
      const tick = () => {
        if (cancelled) return;
        speechEngine.getAnalyserData(dataArray);
        const bars = Array.from({ length: 8 }, (_, idx) => {
          const val = dataArray[idx] || 0;
          return Math.max(14, Math.min(100, Math.round((val / 255) * 100) + 12));
        });
        setMicSpectrum(bars);
        micRafRef.current = requestAnimationFrame(tick);
      };
      micRafRef.current = requestAnimationFrame(tick);
    });

    if (speechEngine.isSTTSupported()) {
      speechEngine.startListening(
        {
          onResult: (spoken, isFinal) => {
            if (isFinal && spoken.trim().length > 2) {
              void handleClinicianTurn(spoken);
            }
          }
        },
        { continuous: true, lang: language === 'Swahili' ? 'sw-KE' : 'en-US' }
      );
    }

    return () => {
      cancelled = true;
      speechEngine.stopListening();
      speechEngine.stopMicrophoneAnalyser();
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
    };
  }, [isOpen, isMicOn, language, handleClinicianTurn]);

  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleSelectClinician = (doc: ClinicianPersona) => {
    setSelectedClinician(doc);
    const g = getGreetingForLanguage(doc, language);
    setLiveCaption(g.primary);
    setLiveCaptionTranslated(g.translation);
    setTranscript((prev) => [
      ...prev,
      {
        id: `doc-switch-${Date.now()}`,
        speaker: 'Doctor',
        speakerName: doc.name,
        text: g.primary,
        translatedText: language !== 'English' ? g.translation : undefined,
        time: formatTimer(callSeconds)
      }
    ]);
    if (isSpeakerOn) {
      speechEngine.speak(g.primary, {
        rate: 0.96,
        onStart: () => setIsClinicianSpeaking(true),
        onEnd: () => setIsClinicianSpeaking(false)
      });
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = displayStream;
      setIsScreenSharing(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = displayStream;
      }
      webrtcRef.current?.setLocalStream(displayStream);
      displayStream.getVideoTracks()[0]?.addEventListener('ended', () => {
        setIsScreenSharing(false);
      });
    } catch {
      setLiveCaption('Screen sharing cancelled or unavailable on this browser; camera stream remains ready.');
    }
  };

  const handleSendText = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || isThinking) return;
    const text = messageInput;
    setMessageInput('');
    void handleClinicianTurn(text);
  };

  const handleDispatchPrescription = () => {
    const rxNote = `Telehealth Rx (${selectedClinician.name}): Coartem 20/120mg & Paracetamol 500mg review prepared for ${patientCtx.name}.`;
    setRxSentNotice('Prescription logged to clinical dialogue and E-Pharmacy queue.');
    setTranscript((prev) => [
      ...prev,
      {
        id: `rx-${Date.now()}`,
        speaker: 'System',
        speakerName: 'Clinical Rx Relay',
        text: rxNote,
        time: formatTimer(callSeconds)
      }
    ]);
    setTimeout(() => setRxSentNotice(null), 4000);
  };

  const handleHangUp = () => {
    playSoftCallTone('end');
    speechEngine.stopListening();
    speechEngine.stopSpeaking();
    speechEngine.stopMicrophoneAnalyser();

    saveCallHistoryRecord({
      id: `call-${Date.now()}`,
      mode: 'video',
      peerName: selectedClinician.name,
      peerSpecialty: selectedClinician.specialty,
      language,
      durationSec: callSeconds,
      startedAt,
      roomId,
      summary: liveCaption,
      transcript: transcript.slice(-12)
    });
    setSavedHistory(getCallHistoryRecords());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-slate-950/88 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Doctorian Video Consultation Studio"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        className={`w-full ${
          isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-7xl h-[92vh] max-h-[860px]'
        } rounded-3xl bg-[#070D19] border border-slate-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col`}
      >
        {/* TOP HEADER BAR — Clean 3-zone layout */}
        <header className="px-4 sm:px-6 py-3 bg-[#0C1425] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={selectedClinician.avatar}
              alt={selectedClinician.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {selectedClinician.name}
                </h2>
                <span className="text-xs font-mono tabular-nums text-emerald-400 font-semibold whitespace-nowrap">
                  {formatTimer(callSeconds)}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {selectedClinician.specialty} · Room {roomId}
                {isOfflineMode ? ' · Offline Clinical Engine' : ''}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              aria-label="Select consultation language"
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="Luganda">Luganda</option>
              <option value="Swahili">Kiswahili</option>
              <option value="Runyankole">Runyankole</option>
              <option value="Acholi">Acholi</option>
            </select>

            <button
              type="button"
              onClick={() => setVideoQuality((q) => (q === '1080p HD' ? '360p Saver' : '1080p HD'))}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono font-semibold text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
              title="Switch video resolution for network bandwidth"
            >
              {videoQuality}
            </button>

            {onSwitchToVoice && (
              <button
                type="button"
                onClick={onSwitchToVoice}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch to Voice</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
              aria-label="Toggle expanded view"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleHangUp}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
              aria-label="Close video call"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* MAIN 2-ZONE WORKSPACE: Video Stage + Smart Consultation Drawer */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-5 overflow-hidden">
          {/* LEFT 8 COLS: Primary HD Video Canvas + Live PiP + Captions */}
          <div className="lg:col-span-8 flex flex-col min-h-[280px] sm:min-h-[380px] relative rounded-2xl bg-[#050A14] border border-slate-800 overflow-hidden">
            {/* Primary Frame */}
            <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
              {hasRemoteStream && !isPiPSwapped ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : isPiPSwapped ? (
                hasCameraStream || isScreenSharing ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full ${isScreenSharing ? 'object-contain bg-black' : 'object-cover scale-x-[-1]'}`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white">
                      {patientCtx.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-slate-300">{patientCtx.name} · Camera Off</p>
                  </div>
                )
              ) : (
                <img
                  src={selectedClinician.avatar}
                  alt={selectedClinician.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              )}

              {/* Contrast Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-slate-950/55 pointer-events-none" />

              {/* Top Left Call State & Offline Telemetry Text (Unboxed clean typography) */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none">
                <div className="bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 flex items-center gap-3 text-xs text-slate-200 pointer-events-auto">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Shield className="w-3.5 h-3.5" />}
                    <span>
                      {peerState === 'connected'
                        ? 'Direct WebRTC Peer Linked'
                        : peerState === 'ringing'
                        ? `Calling Room ${roomId}...`
                        : isOfflineMode
                        ? 'Offline Consultation Core'
                        : 'Encrypted Clinical Stream'}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono tabular-nums text-slate-300">
                    HR {patientCtx.vitals.hr} bpm · SpO2 {patientCtx.vitals.spo2}%
                  </span>
                </div>

                {/* Live Audio Waveform Meter */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
                  {micSpectrum.map((level, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isClinicianSpeaking
                          ? 'bg-emerald-400'
                          : isMicOn
                          ? 'bg-cyan-400'
                          : 'bg-slate-600'
                      }`}
                      style={{ height: `${Math.max(4, Math.round((isClinicianSpeaking ? 45 + (i % 3) * 16 : level) * 0.22))}px` }}
                    />
                  ))}
                  <span className="text-[11px] font-mono text-slate-300 ml-1.5">
                    {isClinicianSpeaking ? 'Clinician Speaking' : isMicOn ? 'Mic Live' : 'Mic Muted'}
                  </span>
                </div>
              </div>

              {/* Closed Captions Overlay */}
              <AnimatePresence>
                {showCaptions && liveCaption && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-4 left-4 right-36 sm:right-52 z-10 pointer-events-none"
                  >
                    <div className="bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 max-w-2xl">
                      <p className="text-xs font-semibold text-cyan-300 mb-0.5">
                        {selectedClinician.name} · {language}
                        {isThinking ? ' · Preparing response...' : ''}
                      </p>
                      <p className="text-sm text-white leading-snug">{liveCaption}</p>
                      {liveCaptionTranslated && language !== 'English' && (
                        <p className="text-xs text-slate-300 mt-1">{liveCaptionTranslated}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Swappable Self-View Picture-in-Picture */}
              <button
                type="button"
                onClick={() => setIsPiPSwapped((v) => !v)}
                className="absolute bottom-4 right-4 w-28 h-20 sm:w-44 sm:h-28 rounded-2xl bg-slate-900 border border-white/20 hover:border-cyan-400 overflow-hidden shadow-xl z-20 cursor-pointer group transition-transform active:scale-95"
                title="Swap main video and self camera"
              >
                {isPiPSwapped ? (
                  <img
                    src={selectedClinician.avatar}
                    alt={selectedClinician.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                ) : hasCameraStream || isScreenSharing ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full ${isScreenSharing ? 'object-contain bg-black' : 'object-cover scale-x-[-1]'}`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 text-xs gap-1">
                    <VideoOff className="w-4 h-4 text-slate-500" />
                    <span className="font-medium truncate px-2">{patientCtx.name}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-slate-950/80 flex items-center justify-between text-[10px] text-slate-200">
                  <span className="truncate">{isPiPSwapped ? selectedClinician.name.split(' ')[1] : 'You'}</span>
                  <ArrowLeftRight className="w-3 h-3 text-cyan-400 shrink-0" />
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT 4 COLS: Smart Clinical Consultation Panel */}
          <aside className="lg:col-span-4 flex flex-col min-h-0 rounded-2xl bg-[#0C1425] border border-slate-800 overflow-hidden">
            {/* Segmented Tab Control */}
            <div className="p-2 bg-[#08101E] border-b border-slate-800 grid grid-cols-4 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('dialogue')}
                className={`py-2 px-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'dialogue' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dialogue
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sms')}
                className={`py-2 px-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'sms' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Call &amp; SMS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vitals')}
                className={`py-2 px-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'vitals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Vitals &amp; Rx
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('room')}
                className={`py-2 px-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'room' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Peer &amp; Log
              </button>
            </div>

            {/* Tab 1: Clinician Switcher + Live Transcript & Input */}
            {activeTab === 'dialogue' && (
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Horizontal Clinician Switcher */}
                <div className="px-3 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                  {UGANDAN_CLINICIAN_PERSONAS.map((doc) => {
                    const active = doc.id === selectedClinician.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleSelectClinician(doc)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium shrink-0 cursor-pointer transition-colors border ${
                          active
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <span className="whitespace-nowrap">{doc.name.replace('Dr. ', 'Dr. ')}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Transcript Stream */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                  {transcript.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        item.speaker === 'Patient'
                          ? 'bg-blue-600/20 border border-blue-500/30 text-slate-100 ml-4'
                          : item.speaker === 'System'
                          ? 'bg-emerald-950/50 border border-emerald-700/40 text-emerald-200'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-300">{item.speakerName}</span>
                        <span className="font-mono tabular-nums">{item.time}</span>
                      </div>
                      <p>{item.text}</p>
                      {item.translatedText && (
                        <p className="text-[11px] text-cyan-300 mt-1">{item.translatedText}</p>
                      )}
                    </div>
                  ))}
                  <div ref={transcriptBottomRef} />
                </div>

                {/* Ask by Text or Speech */}
                <form onSubmit={handleSendText} className="p-3 border-t border-slate-800 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Speak or message ${selectedClinician.name}...`}
                    className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || isThinking}
                    className="min-h-[40px] px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Registered Doctors & Patients Video Ring + Automatic SMS */}
            {activeTab === 'sms' && (
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Registered Numbers</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAutoSmsEnabled((v) => !v)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase cursor-pointer border ${
                      autoSmsEnabled
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Auto-SMS: {autoSmsEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSmsGroup('doctor');
                      setPairedNotifyId('');
                      if (directory.doctors[0]) setSelectedSmsContact(directory.doctors[0]);
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                      smsGroup === 'doctor' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Doctors ({directory.doctors.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSmsGroup('patient');
                      setPairedNotifyId('');
                      if (directory.patients[0]) setSelectedSmsContact(directory.patients[0]);
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                      smsGroup === 'patient' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Patients ({directory.patients.length})
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(smsGroup === 'doctor' ? directory.doctors : directory.patients).map((c) => {
                    const isSel = selectedSmsContact?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedSmsContact(c)}
                        className={`w-full px-2.5 py-2 rounded-xl border text-left cursor-pointer flex items-center justify-between gap-2 ${
                          isSel
                            ? 'bg-blue-600/20 border-cyan-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {c.specialty || c.district || c.mrn || c.role}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-cyan-300 shrink-0">{c.phone}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <select
                    value={pairedNotifyId}
                    onChange={(e) => setPairedNotifyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">
                      {smsGroup === 'doctor'
                        ? 'Optional: Also Auto-SMS a registered patient...'
                        : 'Optional: Also Auto-SMS supervising doctor...'}
                    </option>
                    {(smsGroup === 'doctor' ? directory.patients : directory.doctors).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={customSmsNote}
                    onChange={(e) => setCustomSmsNote(e.target.value)}
                    placeholder="Custom SMS video invite or triage note..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />

                  <button
                    type="button"
                    disabled={!selectedSmsContact || isDispatchingSms}
                    onClick={() => void handleVideoCallAndSms()}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isDispatchingSms ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
                    <span>
                      {selectedSmsContact ? `Video Call & Auto-SMS ${selectedSmsContact.name.split(' ')[0]}` : 'Call & Auto-SMS'}
                    </span>
                  </button>

                  {smsStatusBanner && (
                    <p className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-700/40 rounded-xl px-2.5 py-1.5">
                      {smsStatusBanner}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Dispatched SMS Log ({smsDispatches.length})
                  </p>
                  {smsDispatches.slice(0, 6).map((s) => (
                    <div key={s.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white truncate flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          {s.recipientName}
                        </span>
                        <span className="font-mono text-cyan-300 shrink-0">{s.recipientPhone}</span>
                      </div>
                      <p className="text-slate-300 line-clamp-2">{s.messageBody}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Live Patient Vitals & Quick Clinical Prescription */}
            {activeTab === 'vitals' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Patient Session Profile
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{patientCtx.name}</p>
                      <p className="text-xs text-slate-400">
                        {patientCtx.district} · ID {patientCtx.id}
                      </p>
                    </div>
                    <Activity className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400">Heart Rate</p>
                    <p className="text-lg font-mono font-bold tabular-nums text-white mt-0.5">
                      {patientCtx.vitals.hr} bpm
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400">Blood Oxygen</p>
                    <p className="text-lg font-mono font-bold tabular-nums text-cyan-400 mt-0.5">
                      {patientCtx.vitals.spo2}%
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400">Blood Pressure</p>
                    <p className="text-lg font-mono font-bold tabular-nums text-white mt-0.5">
                      {patientCtx.vitals.bp}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400">Temperature</p>
                    <p className="text-lg font-mono font-bold tabular-nums text-white mt-0.5">
                      {patientCtx.vitals.temp}°C
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    One-Tap Clinical Actions
                  </h3>
                  <button
                    type="button"
                    onClick={() => void handleClinicianTurn('Please review my current vital signs and advise next steps.')}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Ask Clinician to Review Live Vitals</span>
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDispatchPrescription}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Generate & Log Telehealth Prescription</span>
                    <Pill className="w-4 h-4" />
                  </button>
                  {rxSentNotice && (
                    <p className="text-xs text-emerald-400 font-medium pt-1">{rxSentNotice}</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Live WebRTC Peer Room Invite & Call History */}
            {activeTab === 'room' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Direct WebRTC Peer Room</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">{roomId}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(roomId);
                        setCopiedRoom(true);
                        setTimeout(() => setCopiedRoom(false), 2000);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedRoom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRoom ? 'Copied ID' : 'Copy ID'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('sms');
                        const doc = directory.doctors[0];
                        if (doc) void handleVideoCallAndSms(doc);
                        else webrtcRef.current?.sendRoomInvite('doctor', patientCtx.name);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
                    >
                      Ring &amp; Auto-SMS Doctor
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={joinRoomInput}
                      onChange={(e) => setJoinRoomInput(e.target.value)}
                      placeholder="Enter peer Room ID (e.g. DR-4812)"
                      className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!joinRoomInput.trim()) return;
                        const target = joinRoomInput.trim().toUpperCase();
                        setRoomId(target);
                        webrtcRef.current?.joinRoom(target, patientCtx.name);
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
                    >
                      Join
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Saved Call History</span>
                  </h3>
                  {savedHistory.length === 0 ? (
                    <p className="text-xs text-slate-500">Completed video & voice consultations are stored here automatically.</p>
                  ) : (
                    savedHistory.slice(0, 5).map((rec) => (
                      <div key={rec.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span className="truncate">{rec.peerName}</span>
                          <span className="font-mono tabular-nums text-cyan-400">{formatTimer(rec.durationSec)}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {rec.mode.toUpperCase()} · {rec.language} · {new Date(rec.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* BOTTOM CONTROL DOCK — Accessible >=44px Touch Targets */}
        <footer className="px-4 sm:px-6 py-3.5 bg-[#0C1425] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCaptions((v) => !v)}
              className={`min-h-[44px] px-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                showCaptions ? 'bg-blue-600/25 text-cyan-300 border border-blue-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Subtitles className="w-4 h-4" />
              <span className="hidden sm:inline">Captions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vitals')}
              className="min-h-[44px] px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Vitals & Rx</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsMicOn((v) => !v)}
              className={`min-h-[44px] min-w-[44px] px-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                isMicOn ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-rose-400" />}
              <span className="hidden sm:inline">{isMicOn ? 'Mic On' : 'Mic Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCameraOn((v) => !v)}
              className={`min-h-[44px] min-w-[44px] px-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                isCameraOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600/20 border border-rose-500/40 text-rose-300'
              }`}
              aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{isCameraOn ? 'Camera' : 'Cam Off'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleScreenShare}
              className={`min-h-[44px] min-w-[44px] px-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                isScreenSharing ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              aria-label="Share screen"
            >
              <MonitorUp className="w-4 h-4" />
              <span className="hidden md:inline">{isScreenSharing ? 'Sharing' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isSpeakerOn) speechEngine.stopSpeaking();
                setIsSpeakerOn((v) => !v);
              }}
              className={`min-h-[44px] min-w-[44px] px-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isSpeakerOn ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700' : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
              aria-label={isSpeakerOn ? 'Mute speaker audio' : 'Enable speaker audio'}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleHangUp}
              className="min-h-[44px] px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-lg shadow-rose-950/50"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>{transcript.length} messages recorded</span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default DoctorianVideoConsultationModal;
