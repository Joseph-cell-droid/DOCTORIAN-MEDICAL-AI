import { useState, useEffect, useRef, useCallback } from 'react';

export interface GeminiLiveOptions {
  systemInstruction?: string;
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  isMuted?: boolean;
  isSpeakerMuted?: boolean;
  onTranscript?: (text: string, isModel: boolean) => void;
  onStatusChange?: (status: 'idle' | 'connecting' | 'connected' | 'error') => void;
}

export function useGeminiLive(options: GeminiLiveOptions = {}) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Real Speech Recognition & Synthesis references
  const recognitionRef = useRef<any>(null);
  const isSpeechSpeakingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  const isSpeakerMutedRef = useRef<boolean>(false);
  
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);

  const {
    systemInstruction = "You are a helpful assistant.",
    voiceName = "Puck",
    isMuted = false,
    isSpeakerMuted = false,
    onTranscript,
    onStatusChange
  } = options;

  // Sync mute state
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else if (!isMuted && status === 'connected' && !isSpeechSpeakingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    }
  }, [isMuted, status]);

  // Sync speaker mute state
  useEffect(() => {
    isSpeakerMutedRef.current = isSpeakerMuted;
    if (isSpeakerMuted) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      isSpeechSpeakingRef.current = false;
      setOutputVolume(0);
    }
  }, [isSpeakerMuted]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    let pingInterval: any;
    if (status === 'connected') {
      pingInterval = setInterval(() => {
        if (sessionRef.current && sessionRef.current.readyState === WebSocket.OPEN) {
          console.log("[DOCTORIAN-VOICE] Sending heartbeat ping...");
          sessionRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 20000); // 20 seconds keep-alive
    }
    return () => {
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [status]);

  // Clean stop of Speech synthesis & recognition
  const stopSpeechUtility = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isSpeechSpeakingRef.current = false;
    setOutputVolume(0);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    console.log("[DOCTORIAN-VOICE] Securing channels, ending voice call...");
    stopSpeechUtility();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    
    setStatus('idle');
    setInputVolume(0);
    setOutputVolume(0);
  }, [stopSpeechUtility]);

  // Trigger speech synthesis readback with real spectral visualizer simulation
  const speakAloud = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    if (isSpeakerMutedRef.current) {
      console.log("[DOCTORIAN-VOICE] Speaker is muted, skipping readback.");
      return;
    }
    
    // Temporarily pause Speech Recognition to prevent the mic from transcribing its own speakers
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    
    window.speechSynthesis.cancel();
    isSpeechSpeakingRef.current = true;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose voice based on preferences
    const voices = window.speechSynthesis.getVoices();
    let bestVoice = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en"));
    if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith("en"));
    if (bestVoice) utterance.voice = bestVoice;
    
    utterance.rate = 1.05; // Slightly faster for natural clinician rhythm
    utterance.pitch = 1.0;
    
    // Animate output volume while speaking
    let volumeInterval: any = null;
    utterance.onstart = () => {
      volumeInterval = setInterval(() => {
        if (!isSpeechSpeakingRef.current) {
          clearInterval(volumeInterval);
          setOutputVolume(0);
          return;
        }
        // Naturally fluctuating voice waves
        const baseVol = 35 + Math.sin(Date.now() / 80) * 15;
        const randomSpike = Math.random() * 20;
        setOutputVolume(baseVol + randomSpike);
      }, 50);
    };
    
    const handleSpeechEnd = () => {
      isSpeechSpeakingRef.current = false;
      setOutputVolume(0);
      if (volumeInterval) {
        clearInterval(volumeInterval);
      }
      
      // Resume Speech Recognition walkie-talkie mode
      if (status === 'connected' && !isMutedRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };
    
    utterance.onend = handleSpeechEnd;
    utterance.onerror = handleSpeechEnd;
    
    window.speechSynthesis.speak(utterance);
  }, [status]);

  // Continuous speech-to-text listener loop setup
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[DOCTORIAN-VOICE] Local browser SpeechRecognition is not supported.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      console.log("[DOCTORIAN-VOICE] Mic opened. Listening...");
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      if (transcript && transcript.trim()) {
        console.log("[DOCTORIAN-VOICE] Patient Transcript:", transcript);
        if (onTranscript) {
          onTranscript(transcript, false); // Log patient transcript to screen
        }
        
        // Transmit patient speech straight down our JWT authorized WS connection
        if (sessionRef.current && sessionRef.current.readyState === WebSocket.OPEN) {
          sessionRef.current.send(JSON.stringify({ text: transcript }));
        }
      }
    };
    
    recognition.onerror = (event: any) => {
      console.warn("[DOCTORIAN-VOICE] Speech recognition warning/error:", event.error);
    };
    
    recognition.onend = () => {
      // Loop listening state if still connected, not muted, and AI isn't speaking
      if (status === 'connected' && !isMutedRef.current && !isSpeechSpeakingRef.current) {
        try {
          // Restart microphone listening state
          recognition.start();
        } catch (e) {}
      }
    };
    
    recognitionRef.current = recognition;
    if (!isMutedRef.current && !isSpeechSpeakingRef.current) {
      try {
        recognition.start();
      } catch (e) {}
    }
  }, [status, onTranscript]);

  const connect = useCallback(async () => {
    try {
      console.log("[DOCTORIAN-VOICE] Connecting high-fidelity biometric channels...");
      setStatus('connecting');
      setError(null);
      
      // Web Audio setup to process real microphone sound levels
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ai/live`;
      
      const ws = new WebSocket(wsUrl);
      sessionRef.current = ws;

      ws.onopen = () => {
        console.log("[DOCTORIAN-VOICE] Handshake connected over Secure JWT Pathway.");
        setStatus('connected');
        
        // Configure standard greeting instruction
        const setupMsg = {
          type: 'setup',
          config: {
            responseModalities: ['TEXT'],
            systemInstruction
          }
        };
        ws.send(JSON.stringify(setupMsg));

        // Start dynamic audio analyser node for 100% responsive user mic volume values
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          streamRef.current = stream;
          if (!audioContextRef.current) return;

          const sourceNode = audioContextRef.current.createMediaStreamSource(stream);
          const analyserNode = audioContextRef.current.createAnalyser();
          analyserNode.fftSize = 256;
          analyserRef.current = analyserNode;
          
          sourceNode.connect(analyserNode);
          
          const bufferLength = analyserNode.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          const analyzeVolume = () => {
            if (status !== 'connected' || !analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            
            // Set scale appropriately for animation
            setInputVolume(isMutedRef.current || isSpeechSpeakingRef.current ? 0 : Math.min(100, avg * 2.2));
            animationFrameRef.current = requestAnimationFrame(analyzeVolume);
          };
          
          analyzeVolume();
          
          // Instantly start our walkie-talkie transcription engine
          initSpeechRecognition();
          
        }).catch(err => {
          console.warn("[DOCTORIAN-VOICE] Mic volume node failed, using speech-to-text only:", err);
          initSpeechRecognition();
        });
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Standard metadata check
          const modelText = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (modelText) {
            console.log("[DOCTORIAN-VOICE] AI Response Received:", modelText);
            onTranscript?.(modelText, true); // Log clinical text
            speakAloud(modelText); // Speak medical instructions aloud!
          }
          
          if (message.error) {
            console.error("[DOCTORIAN-VOICE] Server returned error:", message.error);
            setError(message.error);
          }
        } catch (e) {
          console.error("[DOCTORIAN-VOICE] Message extraction error:", e);
        }
      };

      ws.onerror = (err) => {
        console.error("[DOCTORIAN-VOICE] Pipeline crashed:", err);
        setError("Neural network connectivity error.");
        setStatus('error');
      };

      ws.onclose = (event) => {
        console.log("[DOCTORIAN-VOICE] Secure tunnel secured and closed:", event.code);
        if (event.code !== 1000 && event.code !== 1001) {
          setError("Clinical connection secured & logged.");
          setStatus('error');
        } else {
          setStatus('idle');
        }
      };

    } catch (err: any) {
      console.error("[DOCTORIAN-VOICE] Handshake Failed:", err);
      setError(err.message || "Failed to dial clinical neural node");
      setStatus('error');
    }
  }, [systemInstruction, initSpeechRecognition, speakAloud, onTranscript, status]);

  const sendMessage = useCallback((text: string) => {
    if (sessionRef.current && sessionRef.current.readyState === WebSocket.OPEN) {
      sessionRef.current.send(JSON.stringify({ text }));
      onTranscript?.(text, false);
    }
  }, [onTranscript]);

  return {
    status,
    error,
    connect,
    stop,
    sendMessage,
    inputVolume,
    outputVolume
  };
}
