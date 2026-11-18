import { api } from '../api';
import { runAutonomousOfflineMedicalAI } from './offlineMedicalAI';
import { sendCallSignal, sendNeuralSignal } from './neuralClient';
import { ClinicianPersona } from './ugandanMedicalLexicon';

export interface CallTranscriptEntry {
  id: string;
  speaker: 'Doctor' | 'Patient' | 'System';
  speakerName: string;
  text: string;
  translatedText?: string;
  time: string;
}

export interface PersistedCallRecord {
  id: string;
  mode: 'video' | 'voice';
  peerName: string;
  peerSpecialty: string;
  language: string;
  durationSec: number;
  startedAt: string;
  roomId: string;
  summary: string;
  transcript: CallTranscriptEntry[];
}

const CALL_HISTORY_KEY = 'doctorian_call_history_v1';

export function createCallRoomId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DR-${num}`;
}

export function getLocalPatientContext(): { name: string; id: string; district: string; vitals: { hr: number; spo2: number; bp: string; temp: number } } {
  let name = 'Patient';
  let id = 'PT-LOCAL';
  let district = 'Kampala';
  let vitals = { hr: 76, spo2: 98, bp: '118/76', temp: 36.7 };

  if (typeof window === 'undefined') return { name, id, district, vitals };
  try {
    const rawUser = localStorage.getItem('medical_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      name = u.displayName || u.name || u.email?.split('@')[0] || 'Patient';
      id = u.patientId || u.id || 'PT-LOCAL';
      district = u.district || u.facility || 'Kampala';
    }
    const rawTelemetry = localStorage.getItem('doctorian_last_telemetry') || localStorage.getItem('arduino_vitals');
    if (rawTelemetry) {
      const v = JSON.parse(rawTelemetry);
      if (v.heartRate || v.bpm) vitals.hr = Number(v.heartRate || v.bpm);
      if (v.spo2) vitals.spo2 = Number(v.spo2);
      if (v.temperature || v.temp) vitals.temp = Number(v.temperature || v.temp);
      if (v.bp) vitals.bp = String(v.bp);
    }
  } catch {
    // keep safe defaults
  }
  return { name, id, district, vitals };
}

export function getCallHistoryRecords(): PersistedCallRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CALL_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCallHistoryRecord(record: PersistedCallRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const prev = getCallHistoryRecords().filter((r) => r.id !== record.id);
    const next = [record, ...prev].slice(0, 30);
    localStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
}

export function playSoftCallTone(kind: 'connect' | 'end' | 'ring'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (kind === 'connect') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.14);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.29);
    } else if (kind === 'end') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.16);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.26);
    } else {
      osc.frequency.setValueAtTime(587.33, now);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.21);
    }

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        // ignore
      }
    }, 500);
  } catch {
    // ignore WebAudio restrictions
  }
}

export function getGreetingForLanguage(clinician: ClinicianPersona, language: string): { primary: string; translation?: string } {
  const lower = language.toLowerCase();
  const inst = clinician.institution.split(',')[0];
  if (lower.includes('luganda')) {
    return { primary: clinician.greetingLuganda, translation: clinician.greetingEnglish };
  }
  if (lower.includes('swahili') || lower.includes('kiswahili')) {
    return { primary: clinician.greetingSwahili, translation: clinician.greetingEnglish };
  }
  if (lower.includes('runyankole') || lower.includes('rukiga')) {
    return {
      primary: `Agandi! Oraire gye? Ndi ${clinician.name} kuruga ${inst}. Ninkuhurira — omubiri gwawe nigwombera guta ebiro ebi?`,
      translation: clinician.greetingEnglish
    };
  }
  if (lower.includes('acholi')) {
    return {
      primary: `Itye nining? An aye ${clinician.name} ki ${inst}. Titini komi tye nining tin?`,
      translation: clinician.greetingEnglish
    };
  }
  if (lower.includes('langi')) {
    return {
      primary: `Itye aber? An aye ${clinician.name} me ${inst}. Konywa tye aber — ngo ame tye atimo komi tin?`,
      translation: clinician.greetingEnglish
    };
  }
  if (lower.includes('iteso') || lower.includes('ateso')) {
    return {
      primary: `Yoga! Ejokona? Araisi eong ${clinician.name} ko ${inst}. Anyoin bo epupi iyong ikapukon lolo?`,
      translation: clinician.greetingEnglish
    };
  }
  if (lower.includes('lusoga')) {
    return {
      primary: `Kodheyo! Oli otya? Ndi ${clinician.name} okuva ku ${inst}. Nkuyambe ntya ku bulamu bwo olwaleero?`,
      translation: clinician.greetingEnglish
    };
  }
  if (lower.includes('lugbara')) {
    return {
      primary: `Mi mi maber? Ama ${clinician.name} ${inst} alia. Mi ma alea ni ngo ra enga drinia?`,
      translation: clinician.greetingEnglish
    };
  }
  if (lower.includes('runyoro') || lower.includes('rutooro')) {
    return {
      primary: `Oraire ota! Ndi ${clinician.name} kuruga ${inst}. Omubiri gwawe niguhurra guta kiro kinu?`,
      translation: clinician.greetingEnglish
    };
  }
  if (lower.includes('rukonjo')) {
    return {
      primary: `Bwakire! Ndi ${clinician.name} erilhua e ${inst}. Wukayowa wuti omu mubiri munabwire?`,
      translation: clinician.greetingEnglish
    };
  }
  if (lower.includes('samia') || lower.includes('lusamia')) {
    return {
      primary: `Mirembe! Ndi ${clinician.name} okhurula e ${inst}. Ohulira otya mu mubiri gwawo leero?`,
      translation: clinician.greetingEnglish
    };
  }
  if (lower.includes('karamojong')) {
    return {
      primary: `Mata! Ejok? Ayong ${clinician.name} alomar ${inst}. Nyon ikoni akwan kon lolo?`,
      translation: clinician.greetingEnglish
    };
  }
  return { primary: clinician.greetingEnglish, translation: clinician.greetingLuganda };
}

function localizeSnippet(language: string, text: string): string | undefined {
  const lower = language.toLowerCase();
  const textLower = text.toLowerCase();
  const isMalariaOrFever = textLower.includes('malaria') || textLower.includes('fever');
  const isVitals = textLower.includes('pressure') || textLower.includes('heart') || textLower.includes('vitals');

  if (lower.includes('luganda')) {
    if (isMalariaOrFever) {
      return 'Kola okukebera omusujja (mRDT), nywa amazzi mangi, era wewalire Coartem ng’omusawo bw’alagidde.';
    }
    if (isVitals) {
      return 'Ebyuma byo biraga omutima gukuba bulungi. Wummula era tova ku ddagala lyo erya pulesa.';
    }
    return 'Ntegedde obubonero bwo. Goberera ebiragiro by’omusawo era nywa amazzi amayonjo agamala.';
  }
  if (lower.includes('swahili') || lower.includes('kiswahili')) {
    if (isMalariaOrFever) {
      return 'Fanya kipimo cha haraka cha malaria (mRDT), kunywa maji mengi, na fuata maagizo ya dawa.';
    }
    if (isVitals) {
      return 'Vipimo vyako vinaonyesha mapigo ya moyo yako shwari. Pumzika na uendelee na dawa zako kama ulivyoelekezwa.';
    }
    return 'Nimepokea dalili zako na vipimo vyako vya moja kwa moja. Endelea kupumzika na kunywa maji.';
  }
  if (lower.includes('runyankole') || lower.includes('rukiga')) {
    return isMalariaOrFever
      ? 'Kora okukyebera omushwija (mRDT), nywa amaizi maingi, kandi ogyendere aha buragizi bwa dakitari.'
      : 'Naahurira obubonero bwawe. Humura gye kandi onywe amaizi maingi amarungi.';
  }
  if (lower.includes('acholi')) {
    return isMalariaOrFever
      ? 'Tim pim me lyeto kom (mRDT), mat pii maleng madwong, ci ilub cik pa daktar i kom yat.'
      : 'Aniang kom lanyut ma itito. Ywe maber ci imat pii maleng madwong.';
  }
  if (lower.includes('langi')) {
    return isMalariaOrFever
      ? 'Tim pim me lyeto (mRDT), mat pii acil adwong, eka ilub cik a daktar.'
      : 'Aniang koppi kede lanyut komi. Wek komi ywe eka imat pii acil.';
  }
  if (lower.includes('iteso') || lower.includes('ateso')) {
    return isMalariaOrFever
      ? 'Kisomaitait akipim naka malaria (mRDT), komat akipi nuipu, kosodi itupit ikisila ke emuron.'
      : 'Apupi eong aomisio kon. Kiyengakin kosodi komat akipi nuipu.';
  }
  if (lower.includes('lusoga')) {
    return isMalariaOrFever
      ? 'Kola okukebera omusudha (mRDT), nywa amaadhi mangi, era ogobere ebiragiro bya dakitari.'
      : 'Ntegeire obubonero bwo. Wummulaku era onywe amaadhi amalonge.';
  }
  if (lower.includes('lugbara')) {
    return 'Ma eri mi ma agapi tro. Mi mvu yi ma driza ku daktari ma azi be.';
  }
  if (lower.includes('runyoro') || lower.includes('rutooro')) {
    return 'Mpulire oburwaire bwawe. Huura kurungi kandi onywe amaizi maingi amarungi.';
  }
  if (lower.includes('rukonjo')) {
    return 'Nabiryowa obulhwere bwawu. Lhuhuka ndeke kandi wunywe amaghetse mangi.';
  }
  if (lower.includes('samia') || lower.includes('lusamia')) {
    return 'Mbulire obulwaye bwao. Humulaho nende onywe amaatsi mangi amalamu.';
  }
  if (lower.includes('karamojong')) {
    return 'Aira ayong ngakiro kon. Kiyengakin kosodi komat ngakipi naalalak.';
  }
  return undefined;
}

export async function generateClinicalCallReply(params: {
  query: string;
  clinician: ClinicianPersona;
  language: string;
  patientName: string;
  vitals: { hr: number; spo2: number; bp: string; temp: number };
  forceOffline?: boolean;
}): Promise<{ reply: string; translation?: string; offlineUsed: boolean }> {
  const { query, clinician, language, patientName, vitals, forceOffline } = params;
  const isOfflineNow =
    Boolean(forceOffline) ||
    (typeof window !== 'undefined' &&
      (localStorage.getItem('medical_forced_offline') === 'true' || navigator.onLine === false));

  if (!isOfflineNow) {
    try {
      const systemInstruction = `You are ${clinician.name} (${clinician.title}, ${clinician.institution}). Answer patient ${patientName} concisely in 2-3 clear spoken sentences suitable for a live voice/video medical consultation in ${language}. Patient live vitals: HR ${vitals.hr} bpm, SpO2 ${vitals.spo2}%, BP ${vitals.bp}, Temp ${vitals.temp}°C.`;
      const res = await api.ai.aiChat([{ role: 'user', text: query }], systemInstruction);
      const rawReply = res?.text || '';
      if (rawReply && rawReply.trim().length > 10 && !rawReply.includes('Connection Unavailable')) {
        const cleanReply = rawReply.replace(/[*_`#]/g, '').trim();
        return {
          reply: cleanReply,
          translation: localizeSnippet(language, cleanReply),
          offlineUsed: false
        };
      }
    } catch {
      // Seamless automatic failover to offline medical AI engine
    }
  }

  // Standalone Offline Medical AI Fallback
  const offlineText = runAutonomousOfflineMedicalAI(query, language);
  const conciseSpoken = offlineText
    .replace(/[*_`#]/g, '')
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .slice(0, 3)
    .join(' ')
    .trim();

  return {
    reply:
      conciseSpoken ||
      `I hear you clearly, ${patientName}. Based on your current vitals (${vitals.hr} bpm, SpO2 ${vitals.spo2}%), let us monitor these symptoms closely and ensure hydration.`,
    translation: localizeSnippet(language, query),
    offlineUsed: true
  };
}

export class TelehealthWebRTCSession {
  private pc: RTCPeerConnection | null = null;
  private roomId: string;
  private mode: 'video' | 'voice';
  private localStream: MediaStream | null = null;
  private onRemoteStream: (stream: MediaStream) => void;
  private onStateChange: (state: 'idle' | 'ringing' | 'connected' | 'ended') => void;
  private signalListener: ((e: Event) => void) | null = null;

  constructor(opts: {
    roomId: string;
    mode: 'video' | 'voice';
    onRemoteStream: (stream: MediaStream) => void;
    onStateChange: (state: 'idle' | 'ringing' | 'connected' | 'ended') => void;
  }) {
    this.roomId = opts.roomId;
    this.mode = opts.mode;
    this.onRemoteStream = opts.onRemoteStream;
    this.onStateChange = opts.onStateChange;
  }

  public setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;
    if (this.pc && stream) {
      const senders = this.pc.getSenders();
      stream.getTracks().forEach((track) => {
        const existing = senders.find((s) => s.track?.kind === track.kind);
        if (existing) {
          void existing.replaceTrack(track);
        } else {
          this.pc?.addTrack(track, stream);
        }
      });
    }
  }

  private ensurePeerConnection(): RTCPeerConnection {
    if (this.pc) return this.pc;
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => pc.addTrack(track, this.localStream!));
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStream(event.streams[0]);
        this.onStateChange('connected');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendCallSignal({
          type: 'call:ice',
          roomId: this.roomId,
          mode: this.mode,
          payload: event.candidate.toJSON()
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') this.onStateChange('connected');
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
        this.onStateChange('ended');
      }
    };

    this.pc = pc;
    return pc;
  }

  public startListening() {
    if (this.signalListener) return;
    this.signalListener = async (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (!detail || detail.roomId !== this.roomId) return;

      try {
        if (detail.type === 'call:accept') {
          const pc = this.ensurePeerConnection();
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendCallSignal({
            type: 'call:offer',
            roomId: this.roomId,
            mode: this.mode,
            payload: offer
          });
        } else if (detail.type === 'call:offer' && detail.payload) {
          const pc = this.ensurePeerConnection();
          await pc.setRemoteDescription(new RTCSessionDescription(detail.payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendCallSignal({
            type: 'call:answer',
            roomId: this.roomId,
            mode: this.mode,
            payload: answer
          });
          this.onStateChange('connected');
        } else if (detail.type === 'call:answer' && detail.payload && this.pc) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(detail.payload));
          this.onStateChange('connected');
        } else if (detail.type === 'call:ice' && detail.payload && this.pc) {
          await this.pc.addIceCandidate(new RTCIceCandidate(detail.payload));
        } else if (detail.type === 'call:hangup') {
          this.onStateChange('ended');
        }
      } catch {
        // Ignore transient SDP/ICE negotiation mismatches
      }
    };

    window.addEventListener('doctorian-call-signal', this.signalListener);
  }

  public sendRoomInvite(targetRole: 'doctor' | 'admin' | 'patient' | 'all' = 'doctor', fromName?: string) {
    this.startListening();
    this.ensurePeerConnection();
    this.onStateChange('ringing');
    sendCallSignal({
      type: 'call:invite',
      roomId: this.roomId,
      mode: this.mode,
      targetRole,
      fromName
    });
    void sendNeuralSignal({
      channel: 'telehealth_calls',
      eventType: 'signal',
      targetRole,
      subject: `Live ${this.mode.toUpperCase()} Consultation Room ${this.roomId}`,
      content: `${fromName || 'User'} opened ${this.mode} consultation room ${this.roomId}. Join using Room ID ${this.roomId}.`,
      payload: { roomId: this.roomId, mode: this.mode },
      priority: 'urgent'
    });
  }

  public joinRoom(roomIdToJoin: string, fromName?: string) {
    this.roomId = roomIdToJoin.trim().toUpperCase();
    this.startListening();
    this.ensurePeerConnection();
    this.onStateChange('ringing');
    sendCallSignal({
      type: 'call:accept',
      roomId: this.roomId,
      mode: this.mode,
      fromName
    });
  }

  public close() {
    if (this.signalListener) {
      window.removeEventListener('doctorian-call-signal', this.signalListener);
      this.signalListener = null;
    }
    try {
      sendCallSignal({
        type: 'call:hangup',
        roomId: this.roomId,
        mode: this.mode
      });
    } catch {}
    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }
  }
}
