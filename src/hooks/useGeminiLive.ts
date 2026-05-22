import { useState, useEffect, useRef, useCallback } from 'react';

export interface GeminiLiveOptions {
  systemInstruction?: string;
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  isMuted?: boolean;
  onTranscript?: (text: string, isModel: boolean) => void;
  onStatusChange?: (status: 'idle' | 'connecting' | 'connected' | 'error') => void;
}

export function useGeminiLive(options: GeminiLiveOptions = {}) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const isMutedRef = useRef(false);
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);

  const {
    systemInstruction = "You are a helpful assistant.",
    voiceName = "Zephyr",
    isMuted = false,
    onTranscript,
    onStatusChange
  } = options;

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const stopCurrentAudio = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // Source might already be stopped
      }
      currentSourceRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    console.log("[GEMINI] Stopping hook session...");
    stopCurrentAudio();
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setStatus('idle');
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, [stopCurrentAudio]);

  const playQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) return;
    
    isPlayingRef.current = true;
    while (audioQueueRef.current.length > 0) {
      const data = audioQueueRef.current.shift();
      if (!data) break;

      if (audioContextRef.current.state === 'suspended') {
        try { await audioContextRef.current.resume(); } catch(e) {}
      }

      // Live API uses 16000Hz as standard.
      const buffer = audioContextRef.current.createBuffer(1, data.length, 16000);
      buffer.getChannelData(0).set(data);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      currentSourceRef.current = source;

      // Output volume analyzer
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      source.connect(analyser);
      analyser.connect(audioContextRef.current.destination);
      
      const updateOutputVolume = () => {
        if (!isPlayingRef.current || currentSourceRef.current !== source) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        setOutputVolume((sum / dataArray.length) / 1.5); 
        requestAnimationFrame(updateOutputVolume);
      };
      
      updateOutputVolume();
      
      await new Promise<void>(resolve => {
        source.onended = () => {
          if (currentSourceRef.current === source) {
            currentSourceRef.current = null;
          }
          setOutputVolume(0);
          resolve();
        };
        source.start();
      });
    }
    isPlayingRef.current = false;
  }, []);

  const connect = useCallback(async () => {
    try {
      console.log("[GEMINI] Initializing WebAudio and WebSocket...");
      setStatus('connecting');
      setError(null);
      
      // Initialize Audio Context at 16000Hz
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ai/live`;
      
      const ws = new WebSocket(wsUrl);
      sessionRef.current = ws;

      ws.onopen = () => {
        console.log("[GEMINI] WebSocket Online. Configuring session...");
        setStatus('connected');
        
        // Send Setup Message
        const setupMsg = {
          type: 'setup',
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } }
            },
            systemInstruction,
            outputAudioTranscription: {},
            inputAudioTranscription: {}
          }
        };
        console.log("[GEMINI] Sending setup:", setupMsg);
        ws.send(JSON.stringify(setupMsg));

        // Start Mic
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          streamRef.current = stream;
          if (!audioContextRef.current) return;

          const source = audioContextRef.current.createMediaStreamSource(stream);
          const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          
          source.connect(processor);
          processor.connect(audioContextRef.current.destination);
          
          processor.onaudioprocess = (e) => {
            if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) {
              setInputVolume(0);
              return;
            }
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Calculate input volume
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            setInputVolume(rms * 100);

            // Convert Float32 to Int16
            const int16Data = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16Data[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
            }
            
            // Base64
            const bytes = new Uint8Array(int16Data.buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64Data = btoa(binary);
            
            ws.send(JSON.stringify({
              audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
            }));
          };
        }).catch(err => {
          console.error("[GEMINI] Mic access failed:", err);
          setError("Microphone access required for voice calls.");
          setStatus('error');
          stop();
        });
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        // Handle Transcript
        if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
          onTranscript?.(message.serverContent.modelTurn.parts[0].text, true);
        }
        
        // Handle Audio Output
        const audioPart = message.serverContent?.modelTurn?.parts?.find((p: any) => p.inlineData);
        if (audioPart?.inlineData?.data) {
          try {
            const binary = atob(audioPart.inlineData.data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            
            // Ensure even byte length for Int16Array
            const alignedLength = Math.floor(bytes.byteLength / 2) * 2;
            const int16Data = new Int16Array(bytes.buffer.slice(0, alignedLength));
            
            const float32Data = new Float32Array(int16Data.length);
            for (let i = 0; i < int16Data.length; i++) float32Data[i] = int16Data[i] / 32768.0;
            
            audioQueueRef.current.push(float32Data);
            playQueue();
          } catch (e) {
            console.error("[GEMINI] Audio decoding failed:", e);
          }
        }

        // Handle Interruption
        if (message.serverContent?.interrupted) {
          console.log("[GEMINI] Interruption received.");
          audioQueueRef.current = [];
          stopCurrentAudio();
        }

        if (message.error) {
          console.error("[GEMINI] Server side error:", message.error);
          setError(message.error);
          setStatus('error');
        }
      };

      ws.onerror = (err) => {
        console.error("[GEMINI] WebSocket error:", err);
        setError("Neural link severed abnormally.");
        setStatus('error');
      };

      ws.onclose = (event) => {
        console.log("[GEMINI] WebSocket Closed:", event.code, event.reason);
        if (event.code !== 1000 && event.code !== 1001) {
          setError(`Disconnected: ${event.reason || 'Network Error'}`);
          setStatus('error');
        } else {
          setStatus('idle');
        }
      };

    } catch (err: any) {
      console.error("[GEMINI] Connection Failed:", err);
      setError(err.message || "Failed to connect");
      setStatus('error');
    }
  }, [systemInstruction, voiceName, onTranscript, playQueue, stopCurrentAudio, stop]);

  const sendMessage = useCallback((text: string) => {
    if (sessionRef.current && sessionRef.current.readyState === WebSocket.OPEN) {
      sessionRef.current.send(JSON.stringify({ text }));
    }
  }, []);

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
