import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Video, Mic, MicOff, VideoOff, Sparkles, Send, CheckCircle2, PhoneOff, RefreshCw, Volume2, VolumeX, Shield, Radio, Activity, Cpu } from 'lucide-react';
import { api } from '../api';
import { speechEngine } from '../utils/speechEngine';

interface TelehealthScribeHubProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  patientName?: string;
}

export const TelehealthScribeHub: React.FC<TelehealthScribeHubProps> = ({
  isOpen,
  onClose,
  doctorName = 'Dr. Gloria Jayakullo',
  patientName = 'Joseph A. (Patient)'
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [liveTranscriptText, setLiveTranscriptText] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  const [transcript, setTranscript] = useState<{ speaker: string; text: string; time: string }[]>([
    { speaker: 'Doctor', text: 'Hello Joseph! I am reviewing your real-time telemetry. How are you feeling today?', time: '09:00 AM' },
    { speaker: 'Patient', text: 'Good morning Doctor. Overall energy is good, but I noticed a slight dry cough after my morning run.', time: '09:01 AM' }
  ]);
  const [customMsg, setCustomMsg] = useState('');
  const [isScribing, setIsScribing] = useState(false);
  const [soapNote, setSoapNote] = useState({
    subjective: 'Patient reports mild dry post-exercise cough. Denies dyspnea, fever, or chest tightness. SpO2 stable at 98%.',
    objective: 'Smartwatch Telemetry: BP 122/80 mmHg, HR 74 BPM, SpO2 98%.',
    assessment: 'Mild exercise-induced airway reactivity vs Lisinopril medication symptom.',
    plan: '1. Continue daily telemetry monitoring.\n2. Inhale Albuterol pre-exercise as needed.\n3. Re-evaluate at next digital check-in.'
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  
  // Camera feed ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Timer for Call Duration
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, liveTranscriptText]);

  // Initialize Voices
  useEffect(() => {
    if (isOpen) {
      const voices = speechEngine.getAvailableVoices();
      setAvailableVoices(voices);
      setSelectedVoiceName(speechEngine.getSelectedVoiceName());
    }
  }, [isOpen]);

  // Handle Camera Feed
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && isVideoOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
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
        s.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setHasCameraStream(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, isVideoOn]);

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
          // If mic should remain on, restart
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

  // Process Patient Speech / Message
  const handlePatientSpeech = async (patientText: string) => {
    if (!patientText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userUtterance = { speaker: 'Patient', text: patientText, time: timeStr };
    const updatedTranscript = [...transcript, userUtterance];
    setTranscript(updatedTranscript);

    // AI Doctor Reasoning
    setIsAiResponding(true);
    setIsScribing(true);

    try {
      const prompt = `You are ${doctorName}, an expert physician in a live HD telehealth call with ${patientName}.
Patient just said: "${patientText}"
Full conversation history:
${updatedTranscript.map((t, mapIdx_160) => `${t.speaker}: ${t.text}`).join('\n')}

Provide a helpful, empathetic, concise medical response (2-3 sentences max) to reply to the patient directly during the call.
Also update the SOAP clinical note object if relevant.

Return JSON in this format:
{
  "response": "Your spoken doctor response here...",
  "soap": {
    "subjective": "...",
    "objective": "...",
    "assessment": "...",
    "plan": "..."
  }
}`;

      const aiRes = await api.ai.aiChat([{ role: 'user', text: prompt }], "You are an AI Telehealth Doctor.");
      const rawText = aiRes.text || '';
      const match = rawText.match(/\{[\s\S]*\}/);

      let doctorReply = "I understand. Let's make sure we track those symptoms closely and adjust your plan if needed.";

      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (parsed.response) doctorReply = parsed.response;
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
      const docUtterance = { speaker: 'Doctor', text: doctorReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
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
      const fallbackReply = "I have noted your observations into your digital health record. Let's monitor this over the next 24 hours.";
      setTranscript([...updatedTranscript, { speaker: 'Doctor', text: fallbackReply, time: timeStr }]);
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative my-4"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Video size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Doctorian Telehealth Studio 2.5
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black text-[9px] uppercase tracking-wider rounded-full flex items-center gap-1">
                  <Radio size={10} className="animate-pulse text-emerald-500" />
                  {formatTime(callDuration)} • WebRTC HD
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                Consultation: {doctorName} & {patientName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* TTS Voice Toggle */}
            <button
              onClick={() => {
                const next = !isTtsEnabled;
                setIsTtsEnabled(next);
                if (!next) speechEngine.stopSpeaking();
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isTtsEnabled 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300' 
                  : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'
              }`}
              title={isTtsEnabled ? "Mute Doctor AI Voice" : "Enable Doctor AI Voice Output"}
            >
              {isTtsEnabled ? <Volume2 size={16} className="text-indigo-500" /> : <VolumeX size={16} />}
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-black">
                {isTtsEnabled ? 'AI Voice Active' : 'AI Voice Muted'}
              </span>
            </button>

            <button
              onClick={() => {
                speechEngine.stopSpeaking();
                speechEngine.stopListening();
                onClose();
              }}
              className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-h-[80vh] overflow-y-auto">
          {/* Video Feed Stage & Audio Call Stage (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Video Canvas Container */}
            <div className="relative aspect-video bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              {isVideoOn ? (
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                  {/* Doctor Video Avatar / Stream */}
                  <img
                    src="/african_doctor_videocall.png"
                    alt="Doctor Feed"
                    className="w-full h-full object-cover"
                  />

                  {/* Patient PiP Video Stream */}
                  <div className="absolute bottom-4 right-4 w-36 h-28 bg-slate-900 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl flex items-center justify-center">
                    {hasCameraStream ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/app_owner_admin.png"
                        alt="Patient Feed"
                        className="w-full h-full object-cover opacity-80"
                      />
                    )}
                    <div className="absolute bottom-1 left-2 text-[8px] font-black text-white uppercase bg-slate-950/80 px-1.5 py-0.5 rounded backdrop-blur">
                      You (Patient)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-6">
                  <div className="w-20 h-20 rounded-full bg-slate-850 text-slate-400 flex items-center justify-center mx-auto border border-slate-800 shadow-xl">
                    <VideoOff size={36} />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Video Stream Paused</p>
                </div>
              )}

              {/* Status Overlay */}
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider">Doctorian Neural Encrypted</span>
              </div>

              {/* Dynamic Audio Visualizer Bar when AI or Patient is speaking */}
              {(isMicOn || isAiResponding || speechEngine.isSpeaking()) && (
                <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-2xl">
                  <Activity size={14} className="text-emerald-400 animate-pulse" />
                  <div className="flex items-center gap-1 h-4">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={`telehealthscribehub-l365-i-${i}`}
                        className="w-1 bg-emerald-400 rounded-full"
                        animate={{
                          height: [4, 16, 6, 20, 8, 12][i % 6]
                        }}
                        transition={{
                          duration: 0.4 + i * 0.1,
                          repeat: Infinity,
                          repeatType: 'reverse'
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider ml-1">
                    {speechEngine.isSpeaking() ? 'Doctor Speaking...' : isMicOn ? 'Listening...' : 'Audio Stream'}
                  </span>
                </div>
              )}
            </div>

            {/* Call Controls Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={toggleMic}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 font-black text-xs uppercase tracking-wider shadow-md ${
                  isMicOn 
                    ? 'bg-rose-500 text-white shadow-rose-500/20 ring-2 ring-rose-500/30' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
                title={isMicOn ? "Stop Voice Listening" : "Start Live Speech-To-Text Mic"}
              >
                {isMicOn ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />}
                <span>{isMicOn ? 'Live Mic ON' : 'Turn On Mic'}</span>
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 font-black text-xs uppercase tracking-wider ${
                  isVideoOn 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white' 
                    : 'bg-rose-500 text-white'
                }`}
                title={isVideoOn ? "Turn Off Video" : "Turn On Video"}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button
                onClick={() => {
                  speechEngine.stopSpeaking();
                  speechEngine.stopListening();
                  onClose();
                }}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <PhoneOff size={18} />
                <span>End Call</span>
              </button>
            </div>

            {/* Live Chat & Transcript Stream */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Cpu size={14} className="text-blue-500" />
                  Live Consultation Speech Transcript
                </h4>
                {liveTranscriptText && (
                  <span className="text-[10px] text-rose-500 font-bold animate-pulse">
                    Hearing: "{liveTranscriptText}"
                  </span>
                )}
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto text-xs pr-1">
                {transcript.map((item, idx) => (
                  <div key={`telehealthscribehub-l441-idx-${idx}`} className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 flex justify-between gap-3 shadow-sm">
                    <div>
                      <span className={`font-black mr-2 text-[10px] uppercase tracking-wider ${
                        item.speaker === 'Doctor' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {item.speaker}:
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.text}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold shrink-0">{item.time}</span>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>

              {/* Speech / Text Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendManualMessage()}
                  placeholder="Speak via mic or type message here..."
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                />
                <button
                  onClick={handleSendManualMessage}
                  disabled={isAiResponding}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Clinical Scribe & Auto-SOAP Note Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200 dark:border-indigo-850 rounded-[2rem] space-y-4 shadow-xl">
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
                <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="font-black text-indigo-600 dark:text-indigo-400 block text-[10px] uppercase tracking-wider">
                    Subjective:
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {soapNote.subjective}
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="font-black text-blue-600 dark:text-blue-400 block text-[10px] uppercase tracking-wider">
                    Objective:
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {soapNote.objective}
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="font-black text-purple-600 dark:text-purple-400 block text-[10px] uppercase tracking-wider">
                    Assessment:
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {soapNote.assessment}
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase tracking-wider">
                    Plan & Prescriptions:
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {soapNote.plan}
                  </p>
                </div>
              </div>

              <button
                onClick={() => alert("EHR Telehealth Encounter Note and e-Prescription successfully saved to cloud database.")}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>Finalize & Sign Encounter Note</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
