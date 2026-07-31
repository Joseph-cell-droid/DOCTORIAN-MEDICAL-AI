// High-Performance Speech-to-Text (STT) and Text-to-Speech (TTS) Engine for Doctorian Telehealth & Voice Assistant

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  gender: 'female' | 'male' | 'neutral';
}

class SpeechEngine {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private isListeningState: boolean = false;
  private isSpeakingState: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis || null;
      this.initVoices();
      if (this.synthesis) {
        this.synthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  // --- VOICE SELECTION ---
  private initVoices() {
    if (!this.synthesis) return;
    const voices = this.synthesis.getVoices();
    if (voices.length === 0) return;

    // Prefer high-quality English clinical voices (Google US English, Natural, Samantha, Karen, Daniel, Alex)
    const preferredNames = [
      'Google US English', 'Google UK English Female', 'Samantha', 'Karen', 'Daniel', 
      'Moira', 'Fiona', 'Victoria', 'Alex', 'Natural'
    ];

    let chosen: SpeechSynthesisVoice | null = null;
    for (const name of preferredNames) {
      const match = voices.find(v => v.name.includes(name));
      if (match) {
        chosen = match;
        break;
      }
    }

    if (!chosen) {
      chosen = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    this.selectedVoice = chosen;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  public setVoiceByName(name: string) {
    const voices = this.getAvailableVoices();
    const match = voices.find(v => v.name === name);
    if (match) {
      this.selectedVoice = match;
    }
  }

  public getSelectedVoiceName(): string {
    return this.selectedVoice?.name || 'Default Medical Voice';
  }

  // --- TEXT TO SPEECH (TTS) ---
  public speak(
    text: string, 
    options?: { 
      rate?: number; 
      pitch?: number; 
      volume?: number; 
      onStart?: () => void; 
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ) {
    if (!this.synthesis) {
      options?.onError?.('Speech Synthesis not supported in this browser.');
      return;
    }

    // Stop any ongoing speech
    this.synthesis.cancel();

    // Clean markdown symbols from text before reading
    const cleanText = text
      .replace(/[*_#~`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/🤖|👋|🩺|🫀|🫁|💊|🧪|📈|🚨|⚠️|💧|🤰|🦟|🧠/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    utterance.onstart = () => {
      this.isSpeakingState = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeakingState = false;
      console.warn('[SpeechEngine TTS Error]', e);
      options?.onError?.(e);
    };

    this.synthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeakingState = false;
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState || (this.synthesis?.speaking ?? false);
  }

  // --- SPEECH TO TEXT (STT) ---
  public isSTTSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
    onStart?: () => void;
  }, options?: { continuous?: boolean; lang?: string }) {
    if (!this.isSTTSupported()) {
      callbacks.onError?.('Speech recognition is not supported on this browser.');
      return;
    }

    this.stopListening();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = options?.continuous ?? true;
    recognition.interimResults = true;
    recognition.lang = options?.lang ?? 'en-US';

    recognition.onstart = () => {
      this.isListeningState = true;
      callbacks.onStart?.();
    };

    recognition.onerror = (event: any) => {
      console.warn('[SpeechEngine STT Error]', event.error);
      callbacks.onError?.(event.error);
    };

    recognition.onend = () => {
      this.isListeningState = false;
      callbacks.onEnd?.();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      if (activeText.trim()) {
        callbacks.onResult(activeText, !!finalTranscript);
      }
    };

    this.recognition = recognition;
    try {
      this.recognition.start();
    } catch (err) {
      callbacks.onError?.('Could not start microphone listener.');
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
    this.isListeningState = false;
  }

  public isListening(): boolean {
    return this.isListeningState;
  }

  // --- WEBAUDIO ANALYSER FOR VISUALIZERS ---
  public async setupMicrophoneAnalyser(): Promise<AnalyserNode | null> {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micStream = stream;

      const source = this.audioCtx.createMediaStreamSource(stream);
      const analyser = this.audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      this.analyser = analyser;
      return analyser;
    } catch (err) {
      console.warn('[SpeechEngine AudioAnalyser Error]', err);
      return null;
    }
  }

  public stopMicrophoneAnalyser() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    this.analyser = null;
  }

  public getAnalyserData(dataArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }
}

export const speechEngine = new SpeechEngine();
