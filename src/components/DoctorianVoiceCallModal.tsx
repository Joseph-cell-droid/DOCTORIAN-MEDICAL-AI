import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  X,
  Globe,
  Clock,
  Send,
  ShieldAlert,
  UserCheck,
  Users,
  Stethoscope,
  WifiOff,
  Play,
  Copy,
  Check,
  MessageSquare,
  CheckCircle2,
  PhoneCall,
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

interface DoctorianVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToVideo?: () => void;
}

type CallRecipientType = 'ai' | 'doctor' | 'family' | 'emergency';

export const DoctorianVoiceCallModal: React.FC<DoctorianVoiceCallModalProps> = ({
  isOpen,
  onClose,
  onSwitchToVideo
}) => {
  const [recipientType, setRecipientType] = useState<CallRecipientType>('ai');
  const [selectedClinician, setSelectedClinician] = useState<ClinicianPersona>(UGANDAN_CLINICIAN_PERSONAS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Luganda' | 'Swahili' | 'Runyankole' | 'Acholi'>('English');
  const [selectedVoiceRate, setSelectedVoiceRate] = useState<'normal' | 'clear' | 'calm'>('normal');

  // Call Media Controls
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const [startedAt] = useState(() => new Date().toISOString());
  const [roomId, setRoomId] = useState(() => createCallRoomId());
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(() =>
    typeof window !== 'undefined' && (localStorage.getItem('medical_forced_offline') === 'true' || !navigator.onLine)
  );

  // Live Audio Waveform & Speech state
  const [audioBars, setAudioBars] = useState<number[]>(Array(16).fill(18));
  const [isClinicianSpeaking, setIsClinicianSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState<CallTranscriptEntry[]>(() => {
    const g = getGreetingForLanguage(UGANDAN_CLINICIAN_PERSONAS[0], 'English');
    return [
      {
        id: 'voice-init-1',
        speaker: 'Doctor',
        speakerName: UGANDAN_CLINICIAN_PERSONAS[0].name,
        text: g.primary,
        translatedText: g.translation,
        time: '00:00'
      }
    ];
  });
  const [voiceInputText, setVoiceInputText] = useState('');
  const [patientCtx] = useState(() => getLocalPatientContext());
  const [callHistory, setCallHistory] = useState<PersistedCallRecord[]>(() => getCallHistoryRecords());
  const [statusNotice, setStatusNotice] = useState<string>('Ready — tap Microphone to speak or place Call + Auto-SMS.');

  // Registered Doctors & Patients Telephony + Auto-SMS State
  const [directory, setDirectory] = useState<{
    doctors: TelephonyContact[];
    patients: TelephonyContact[];
    emergency: TelephonyContact[];
  }>({ doctors: [], patients: [], emergency: [] });
  const [directoryTab, setDirectoryTab] = useState<'doctor' | 'patient'>('doctor');
  const [selectedContact, setSelectedContact] = useState<TelephonyContact | null>(null);
  const [pairedNotifyId, setPairedNotifyId] = useState<string>('');
  const [autoSmsEnabled, setAutoSmsEnabled] = useState<boolean>(true);
  const [customSmsText, setCustomSmsText] = useState<string>('');
  const [manualSmsText, setManualSmsText] = useState<string>('');
  const [smsDispatches, setSmsDispatches] = useState<SmsDispatchRecord[]>([]);
  const [isPlacingCallSms, setIsPlacingCallSms] = useState<boolean>(false);

  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const webrtcRef = useRef<TelehealthWebRTCSession | null>(null);
  const rafRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // Monitor offline state
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

  // Live Call Timer + Chime + Load Registered Doctor/Patient Directory
  useEffect(() => {
    if (!isOpen) return;
    playSoftCallTone('connect');
    const timer = window.setInterval(() => setCallSeconds((s) => s + 1), 1000);

    let cancelled = false;
    void api.telephony.getDirectory().then((dir) => {
      if (cancelled) return;
      setDirectory(dir);
      setSelectedContact((prev) => prev || dir.doctors[0] || dir.patients[0] || null);
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

  // WebRTC Peer Audio Room
  useEffect(() => {
    if (!isOpen) return;
    const session = new TelehealthWebRTCSession({
      roomId,
      mode: 'voice',
      onRemoteStream: (stream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
        }
        setStatusNotice(`Connected live audio with peer in Room ${roomId}.`);
      },
      onStateChange: (st) => {
        if (st === 'ringing') setStatusNotice(`Ringing peer room ${roomId}...`);
        if (st === 'connected') setStatusNotice(`Live peer voice channel active (${roomId}).`);
      }
    });
    session.startListening();
    webrtcRef.current = session;
    return () => {
      session.close();
      webrtcRef.current = null;
    };
  }, [isOpen, roomId]);

  // Cleanup hardware on close
  useEffect(() => {
    if (isOpen) return;
    speechEngine.stopListening();
    speechEngine.stopSpeaking();
    speechEngine.stopMicrophoneAnalyser();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [isOpen]);

  const speakRate = selectedVoiceRate === 'clear' ? 0.88 : selectedVoiceRate === 'calm' ? 0.92 : 1.0;

  const processVoiceQuery = useCallback(
    async (spokenText: string) => {
      const cleaned = spokenText.trim();
      if (!cleaned) return;

      const userEntry: CallTranscriptEntry = {
        id: `pt-v-${Date.now()}`,
        speaker: 'Patient',
        speakerName: patientCtx.name,
        text: cleaned,
        time: formatTimer(callSeconds)
      };
      setActiveTranscript((prev) => [...prev, userEntry]);
      setIsThinking(true);
      setStatusNotice('Processing clinical audio response...');

      const { reply, translation, offlineUsed } = await generateClinicalCallReply({
        query: cleaned,
        clinician: selectedClinician,
        language: selectedLanguage,
        patientName: patientCtx.name,
        vitals: patientCtx.vitals,
        forceOffline: isOfflineMode
      });

      setIsThinking(false);
      setStatusNotice(
        offlineUsed
          ? 'Responded via Offline Clinical Voice Engine.'
          : `Live consultation response from ${selectedClinician.name}.`
      );

      const docEntry: CallTranscriptEntry = {
        id: `doc-v-${Date.now()}`,
        speaker: 'Doctor',
        speakerName: recipientType === 'emergency' ? 'Emergency Dispatch 112' : selectedClinician.name,
        text: reply,
        translatedText: selectedLanguage !== 'English' ? translation : undefined,
        time: formatTimer(callSeconds + 1)
      };
      setActiveTranscript((prev) => [...prev, docEntry]);

      if (isSpeakerOn) {
        speechEngine.speak(reply, {
          rate: speakRate,
          onStart: () => setIsClinicianSpeaking(true),
          onEnd: () => setIsClinicianSpeaking(false),
          onError: () => setIsClinicianSpeaking(false)
        });
      }
    },
    [callSeconds, isOfflineMode, isSpeakerOn, patientCtx.name, patientCtx.vitals, recipientType, selectedClinician, selectedLanguage, speakRate]
  );

  // Real Microphone Analyser & Speech-to-Text
  useEffect(() => {
    if (!isOpen || !isMicOn) {
      speechEngine.stopListening();
      speechEngine.stopMicrophoneAnalyser();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setAudioBars(Array(16).fill(14));
      return;
    }

    let cancelled = false;
    const freq = new Uint8Array(32);

    void speechEngine.setupMicrophoneAnalyser().then((analyser) => {
      if (cancelled) return;
      if (!analyser) {
        setStatusNotice('Microphone permission unavailable; type below or check browser permissions.');
        return;
      }
      setStatusNotice('Microphone active — speak naturally.');
      const tick = () => {
        if (cancelled) return;
        speechEngine.getAnalyserData(freq);
        const bars = Array.from({ length: 16 }, (_, i) => {
          const val = freq[i] || 0;
          return Math.max(14, Math.min(96, Math.round((val / 255) * 95) + 12));
        });
        setAudioBars(bars);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    });

    if (speechEngine.isSTTSupported()) {
      speechEngine.startListening(
        {
          onResult: (spoken, isFinal) => {
            if (isFinal && spoken.trim().length > 2) {
              void processVoiceQuery(spoken);
            }
          }
        },
        { continuous: true, lang: selectedLanguage === 'Swahili' ? 'sw-KE' : 'en-US' }
      );
    }

    return () => {
      cancelled = true;
      speechEngine.stopListening();
      speechEngine.stopMicrophoneAnalyser();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, isMicOn, selectedLanguage, processVoiceQuery]);

  // Animate wave smoothly while clinician TTS is speaking even if user mic is muted
  useEffect(() => {
    if (!isClinicianSpeaking || isMicOn) return;
    const t = window.setInterval(() => {
      setAudioBars(Array.from({ length: 16 }, (_, i) => 24 + ((Date.now() / 70 + i * 19) % 62)));
    }, 110);
    return () => window.clearInterval(t);
  }, [isClinicianSpeaking, isMicOn]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTranscript]);

  const triggerCallAndAutoSms = useCallback(
    async (contactOverride?: TelephonyContact) => {
      const target = contactOverride || selectedContact;
      if (!target) {
        setStatusNotice('Select a registered doctor or patient first.');
        return;
      }

      setIsPlacingCallSms(true);
      playSoftCallTone('ring');
      webrtcRef.current?.sendRoomInvite(target.role === 'patient' ? 'patient' : 'doctor', target.name);

      try {
        const res = await api.telephony.callAndSms({
          roomId,
          callMode: 'voice',
          calleeId: target.id,
          calleeName: target.name,
          calleeRole: target.role,
          calleePhone: target.phone,
          autoSendSms: autoSmsEnabled,
          customSmsMessage: customSmsText.trim() || undefined,
          notifyPatientId: target.role !== 'patient' && pairedNotifyId ? pairedNotifyId : undefined,
          notifyDoctorId: target.role === 'patient' && pairedNotifyId ? pairedNotifyId : undefined
        });

        if (res.smsDispatches?.length > 0) {
          setSmsDispatches((prev) => [...res.smsDispatches, ...prev].slice(0, 25));
          const summaryPhones = res.smsDispatches.map((s) => `${s.recipientName} (${s.recipientPhone})`).join(' & ');
          setStatusNotice(`Calling ${target.name} (${target.phone}) · Auto-SMS sent to ${summaryPhones}`);
          setActiveTranscript((prev) => [
            ...prev,
            {
              id: `sys-sms-${Date.now()}`,
              speaker: 'System',
              speakerName: 'GSM Auto-SMS Gateway',
              text: `Voice Call initiated to ${target.name} (${target.phone}). Automatic SMS dispatched to ${summaryPhones} [${res.smsDispatches[0].providerMessageId}].`,
              time: formatTimer(callSeconds)
            }
          ]);
        } else {
          setStatusNotice(`Voice Call ringing ${target.name} (${target.phone}) in Room ${roomId}.`);
        }
        setCustomSmsText('');
      } catch (err: any) {
        setStatusNotice(err?.message || 'Unable to place call / SMS.');
      } finally {
        setIsPlacingCallSms(false);
      }
    },
    [selectedContact, roomId, autoSmsEnabled, customSmsText, pairedNotifyId, callSeconds]
  );

  const handleSendQuickSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !manualSmsText.trim() || isPlacingCallSms) return;
    setIsPlacingCallSms(true);
    try {
      const res = await api.telephony.sendSms({
        recipientId: selectedContact.id,
        recipientName: selectedContact.name,
        recipientRole: selectedContact.role,
        recipientPhone: selectedContact.phone,
        message: manualSmsText.trim()
      });
      if (res.sms) {
        setSmsDispatches((prev) => [res.sms, ...prev].slice(0, 25));
        setStatusNotice(`Direct SMS delivered to ${selectedContact.name} (${selectedContact.phone}).`);
      }
      setManualSmsText('');
    } catch (err: any) {
      setStatusNotice(err?.message || 'SMS send failed.');
    } finally {
      setIsPlacingCallSms(false);
    }
  };

  const handleRecipientSwitch = (type: CallRecipientType) => {
    setRecipientType(type);
    if (type === 'doctor') {
      setDirectoryTab('doctor');
      const doc = directory.doctors[0];
      if (doc) {
        setSelectedContact(doc);
        void triggerCallAndAutoSms(doc);
      } else {
        webrtcRef.current?.sendRoomInvite('doctor', patientCtx.name);
        setStatusNotice(`Paging on-call clinician in Room ${roomId} via WebRTC mesh...`);
      }
    } else if (type === 'emergency') {
      playSoftCallTone('ring');
      const emg = directory.emergency[0];
      if (emg) {
        void triggerCallAndAutoSms(emg);
      }
      const alertText = 'Emergency Triage Priority active. State your exact location and chief symptom immediately.';
      setStatusNotice('Emergency 112 Priority Voice Line + Auto-SMS Active.');
      if (isSpeakerOn) speechEngine.speak(alertText, { rate: 0.98 });
    } else if (type === 'family') {
      setDirectoryTab('patient');
      if (directory.patients[0]) setSelectedContact(directory.patients[0]);
      setStatusNotice(`Select a registered patient below to call & dispatch automatic SMS (Room ${roomId}).`);
    } else {
      setStatusNotice('AI Clinical Voice Physician ready online or offline.');
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceInputText.trim() || isThinking) return;
    const txt = voiceInputText;
    setVoiceInputText('');
    void processVoiceQuery(txt);
  };

  const handleHangUp = () => {
    playSoftCallTone('end');
    speechEngine.stopListening();
    speechEngine.stopSpeaking();
    speechEngine.stopMicrophoneAnalyser();

    saveCallHistoryRecord({
      id: `vcall-${Date.now()}`,
      mode: 'voice',
      peerName: recipientType === 'emergency' ? 'Emergency Triage 112' : selectedClinician.name,
      peerSpecialty: selectedClinician.specialty,
      language: selectedLanguage,
      durationSec: callSeconds,
      startedAt,
      roomId,
      summary: activeTranscript[activeTranscript.length - 1]?.text || 'Voice consultation',
      transcript: activeTranscript.slice(-12)
    });
    setCallHistory(getCallHistoryRecords());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-slate-950/88 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Doctorian Voice Call Studio"
    >
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-6xl max-h-[92vh] rounded-3xl bg-[#070D19] border border-slate-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* TOP BAR */}
        <header className="px-4 sm:px-6 py-3.5 bg-[#0C1425] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Voice Consultation Studio</h2>
              <p className="text-xs text-slate-400 truncate">
                {selectedClinician.name} · {selectedLanguage}
                {isOfflineMode ? ' · Offline Clinical Core' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              {formatTimer(callSeconds)}
            </span>
            {onSwitchToVideo && (
              <button
                type="button"
                onClick={onSwitchToVideo}
                className="min-h-[40px] px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch to Video</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleHangUp}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
              aria-label="Close voice call"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 3-COLUMN STUDIO BODY */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5 overflow-y-auto">
          {/* LEFT 4 COLS: Recipient Selector & Quick Prompts */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0C1425] border border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Call Line</h3>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'ai', label: 'Clinical AI', icon: Stethoscope },
                    { id: 'doctor', label: 'Ring Doctor', icon: UserCheck },
                    { id: 'family', label: 'Family / Carer', icon: Users },
                    { id: 'emergency', label: 'Emergency 112', icon: ShieldAlert }
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  const active = recipientType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleRecipientSwitch(opt.id)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors border ${
                        active
                          ? opt.id === 'emergency'
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Peer Room ID</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(roomId);
                    setCopiedRoom(true);
                    setTimeout(() => setCopiedRoom(false), 1800);
                  }}
                  className="font-mono font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  <span>{roomId}</span>
                  {copiedRoom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Registered Doctors & Patients Call + Automatic SMS Card */}
            <div className="p-4 rounded-2xl bg-[#0C1425] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Registered Phone Directory</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setAutoSmsEnabled((v) => !v)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
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
                    setDirectoryTab('doctor');
                    setPairedNotifyId('');
                    if (directory.doctors[0]) setSelectedContact(directory.doctors[0]);
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    directoryTab === 'doctor' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Doctors ({directory.doctors.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDirectoryTab('patient');
                    setPairedNotifyId('');
                    if (directory.patients[0]) setSelectedContact(directory.patients[0]);
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    directoryTab === 'patient' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Patients ({directory.patients.length})
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {(directoryTab === 'doctor' ? directory.doctors : directory.patients).map((c) => {
                  const isSel = selectedContact?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedContact(c)}
                      className={`w-full px-2.5 py-2 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        isSel
                          ? 'bg-blue-600/20 border-cyan-400 text-white'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
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

              <div className="space-y-2 pt-1 border-t border-slate-800">
                <select
                  value={pairedNotifyId}
                  onChange={(e) => setPairedNotifyId(e.target.value)}
                  aria-label="Also auto-SMS paired contact"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">
                    {directoryTab === 'doctor'
                      ? 'Optional: Also Auto-SMS a registered patient...'
                      : 'Optional: Also Auto-SMS supervising doctor...'}
                  </option>
                  {(directoryTab === 'doctor' ? directory.patients : directory.doctors).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={customSmsText}
                  onChange={(e) => setCustomSmsText(e.target.value)}
                  placeholder="Optional custom SMS alert note..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <button
                  type="button"
                  disabled={!selectedContact || isPlacingCallSms}
                  onClick={() => void triggerCallAndAutoSms()}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                >
                  {isPlacingCallSms ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PhoneCall className="w-4 h-4" />
                  )}
                  <span className="truncate">
                    {selectedContact
                      ? `Call & Auto-SMS ${selectedContact.name.split(' ')[0]}`
                      : 'Call & Dispatch Auto-SMS'}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0C1425] border border-slate-800 space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Voice Topics</h3>
              {[
                'Check malaria symptoms and dosage guidance',
                'Review my current blood pressure and heart rate',
                'Give hydration and fever care instructions'
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void processVoiceQuery(prompt)}
                  disabled={isThinking}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-200 cursor-pointer transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* CENTER 4 COLS: Acoustic Stage + Spectrum + Primary Controls */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0C1425] border border-slate-800 flex flex-col items-center justify-between text-center space-y-5">
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isOfflineMode ? 'Offline Mode' : 'Encrypted VoIP'}</span>
              </span>
              <span className="font-mono tabular-nums text-slate-300">
                HR {patientCtx.vitals.hr} · SpO2 {patientCtx.vitals.spo2}%
              </span>
            </div>

            {/* Active Clinician Acoustic Portrait */}
            <div className="flex flex-col items-center space-y-3 py-2">
              <div className="relative">
                <div
                  className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 transition-all duration-300 ${
                    isMicOn || isClinicianSpeaking
                      ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-[0_0_32px_rgba(6,182,212,0.35)]'
                      : 'bg-slate-800'
                  }`}
                >
                  <img
                    src={selectedClinician.avatar}
                    alt={selectedClinician.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover object-top"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {recipientType === 'emergency' ? 'Emergency Dispatch 112' : selectedClinician.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedClinician.institution}</p>
                <p className="text-xs text-cyan-300 font-medium mt-2">{statusNotice}</p>
              </div>
            </div>

            {/* Real Audio Frequency Bars */}
            <div className="flex items-end justify-center gap-1.5 h-12 w-full max-w-xs px-2" aria-hidden="true">
              {audioBars.map((val, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isClinicianSpeaking
                      ? 'bg-emerald-400'
                      : isMicOn
                      ? 'bg-cyan-400'
                      : 'bg-slate-700'
                  }`}
                  style={{ height: `${Math.max(12, val)}%` }}
                />
              ))}
            </div>

            {/* Ergonomic Call Control Bar */}
            <div className="grid grid-cols-4 gap-2.5 w-full pt-2">
              <button
                type="button"
                onClick={() => setIsMicOn((v) => !v)}
                className={`min-h-[52px] rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                  isMicOn ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-rose-400" />}
                <span>{isMicOn ? 'Live' : 'Speak'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isSpeakerOn) speechEngine.stopSpeaking();
                  setIsSpeakerOn((v) => !v);
                }}
                className={`min-h-[52px] rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                  isSpeakerOn ? 'bg-slate-800 text-cyan-300' : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>Speaker</span>
              </button>

              <button
                type="button"
                onClick={() => onSwitchToVideo?.()}
                disabled={!onSwitchToVideo}
                className="min-h-[52px] rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer disabled:opacity-40"
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </button>

              <button
                type="button"
                onClick={handleHangUp}
                className="min-h-[52px] rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End</span>
              </button>
            </div>
          </div>

          {/* RIGHT 4 COLS: Language, Transcript Input & Saved Call History */}
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
            <div className="p-4 rounded-2xl bg-[#0C1425] border border-slate-800 space-y-2.5 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  aria-label="Call language"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Luganda">Luganda</option>
                  <option value="Swahili">Kiswahili</option>
                  <option value="Runyankole">Runyankole</option>
                  <option value="Acholi">Acholi</option>
                </select>

                <select
                  value={selectedVoiceRate}
                  onChange={(e) => setSelectedVoiceRate(e.target.value as any)}
                  aria-label="Voice pace"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="normal">Normal Pace</option>
                  <option value="clear">Clear &amp; Slow</option>
                  <option value="calm">Calm Bedside</option>
                </select>
              </div>

              <select
                value={selectedClinician.id}
                onChange={(e) => {
                  const found = UGANDAN_CLINICIAN_PERSONAS.find((d) => d.id === e.target.value);
                  if (found) setSelectedClinician(found);
                }}
                aria-label="Select physician"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {UGANDAN_CLINICIAN_PERSONAS.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Transcript & Type Fallback */}
            <div className="flex-1 min-h-[180px] p-3.5 rounded-2xl bg-[#0C1425] border border-slate-800 flex flex-col">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 shrink-0">
                Live Voice Transcript
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                {activeTranscript.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl ${
                      item.speaker === 'Patient'
                        ? 'bg-blue-600/20 border border-blue-500/30 text-slate-100'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="font-semibold">{item.speakerName}</span>
                      <span className="font-mono tabular-nums">{item.time}</span>
                    </div>
                    <p>{item.text}</p>
                    {item.translatedText && (
                      <p className="text-[11px] text-cyan-300 mt-1">{item.translatedText}</p>
                    )}
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>

              <form onSubmit={handleSendText} className="mt-2.5 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={voiceInputText}
                  onChange={(e) => setVoiceInputText(e.target.value)}
                  placeholder="Type if mic is unavailable..."
                  className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!voiceInputText.trim() || isThinking}
                  className="min-h-[38px] px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shrink-0"
                  aria-label="Send voice prompt"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Live SMS Dispatch Receipts & Manual Follow-up SMS */}
            <div className="p-3.5 rounded-2xl bg-[#0C1425] border border-emerald-500/30 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Auto-SMS Dispatch Receipts ({smsDispatches.length})</span>
                </h3>
              </div>

              {smsDispatches.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Place a call above to automatically dispatch SMS alerts to registered doctor &amp; patient numbers.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {smsDispatches.slice(0, 5).map((s) => (
                    <div key={s.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white truncate flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          {s.recipientName}
                        </span>
                        <span className="font-mono text-cyan-300 shrink-0">{s.recipientPhone}</span>
                      </div>
                      <p className="text-slate-300 line-clamp-2">{s.messageBody}</p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {s.gatewayProvider} · {s.providerMessageId} · {s.status.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedContact && (
                <form onSubmit={handleSendQuickSms} className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={manualSmsText}
                    onChange={(e) => setManualSmsText(e.target.value)}
                    placeholder={`SMS ${selectedContact.name} (${selectedContact.phone})...`}
                    className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!manualSmsText.trim() || isPlacingCallSms}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-bold cursor-pointer shrink-0"
                  >
                    Send SMS
                  </button>
                </form>
              )}
            </div>

            {/* Real Saved Call History */}
            <div className="p-3.5 rounded-2xl bg-[#0C1425] border border-slate-800 space-y-2 shrink-0">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent Calls</span>
              </h3>
              {callHistory.length === 0 ? (
                <p className="text-xs text-slate-500">Your completed consultations will be saved here.</p>
              ) : (
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {callHistory.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between text-xs bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{rec.peerName}</p>
                        <p className="text-[11px] text-slate-400">{rec.mode} · {rec.language}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono tabular-nums text-cyan-400">{formatTimer(rec.durationSec)}</span>
                        <button
                          type="button"
                          onClick={() => speechEngine.speak(rec.summary, { rate: speakRate })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white cursor-pointer"
                          title="Replay summary audio"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorianVoiceCallModal;
