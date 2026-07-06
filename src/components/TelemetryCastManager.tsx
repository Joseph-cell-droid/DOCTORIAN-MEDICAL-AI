import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Smartphone, 
  Wifi, 
  Bluetooth, 
  Heart, 
  Zap, 
  Activity, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Sliders, 
  Database, 
  Send, 
  Check, 
  X,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Fingerprint
} from 'lucide-react';
import { useArduinoContext } from '../ArduinoContext';

export const TelemetryCastManager: React.FC = () => {
  const arduino = useArduinoContext();
  const [castSource, setCastSource] = useState<'watch' | 'icu'>('watch');
  const [isCasting, setIsCasting] = useState(false);
  const [selectedWatchBrand, setSelectedWatchBrand] = useState<'Samsung' | 'Apple' | 'Garmin' | 'Fitbit'>('Samsung');
  const [watchSymmetryPreset, setWatchSymmetryPreset] = useState<'balanced' | 'elevated' | 'hyper' | 'depressed'>('balanced');
  
  // Clinical Machine States
  const [icuChannelCode, setIcuChannelCode] = useState('ICU-BED-09-EMR');
  const [selectedIcuDevice, setSelectedIcuDevice] = useState<'ECG' | 'POLAR_PPG' | 'VENTILATOR'>('ECG');
  const [signalStrength, setSignalStrength] = useState(5);
  const [castLogs, setCastLogs] = useState<{ time: string; msg: string; type: 'info' | 'success' | 'warn' }[]>([]);

  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const addCastLog = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCastLogs(prev => [{ time: timestamp, msg, type }, ...prev.slice(0, 19)]);
  };

  const [isConnecting, setIsConnecting] = useState<'watch' | 'serial' | 'bluetooth' | 'wifi' | null>(null);
  const [wifiInput, setWifiInput] = useState('http://192.168.1.100');

  const handleConnectHealthWatch = async () => {
    setIsConnecting('watch');
    addCastLog("Requesting Web Bluetooth GATT pairing with smart watch...", "info");
    try {
      await arduino.connectHealthWatch();
      addCastLog("Successfully coupled smart watch via Bluetooth!", "success");
    } catch (err: any) {
      addCastLog(`Watch connection failed: ${err.message || err}`, "warn");
    } finally {
      setIsConnecting(null);
    }
  };

  const handleConnectSerial = async () => {
    setIsConnecting('serial');
    addCastLog("Initiating Web Serial handshake with USB health machine...", "info");
    try {
      await arduino.connectSerial();
      addCastLog("Successfully coupled health machine via USB Serial!", "success");
    } catch (err: any) {
      addCastLog(`USB Serial connection failed: ${err.message || err}`, "warn");
    } finally {
      setIsConnecting(null);
    }
  };

  const handleConnectWiFi = async () => {
    setIsConnecting('wifi');
    addCastLog(`Connecting to WiFi health machine endpoint at ${wifiInput}...`, "info");
    try {
      await arduino.connectWiFi(wifiInput);
      addCastLog(`Successfully subscribed to WiFi health machine at ${wifiInput}`, "success");
    } catch (err: any) {
      addCastLog(`WiFi connection failed: ${err.message || err}`, "warn");
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnectDevice = async () => {
    addCastLog("Terminating hardware telemetry socket connection...", "warn");
    try {
      await arduino.disconnect();
      addCastLog("Hardware successfully disconnected.", "info");
    } catch (err: any) {
      addCastLog(`Disconnection warning: ${err.message || err}`, "warn");
    }
  };

  // Draw continuous oscilloscope cast waves based on active cast source
  useEffect(() => {
    if (!isCasting) return;

    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = castSource === 'watch' ? '#10b981' : '#3b82f6';
      ctx.shadowBlur = 8;
      ctx.shadowColor = castSource === 'watch' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.5)';

      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      // Dynamically calculate frequency multiplier from real vital signs if available
      const hrValue = (arduino.connection.connected && arduino.vitals) 
        ? arduino.vitals.heartRate 
        : (watchSymmetryPreset === 'hyper' ? 134 : watchSymmetryPreset === 'elevated' ? 98 : watchSymmetryPreset === 'depressed' ? 46 : 72);
      
      const freqMultiplier = hrValue / 60;

      for (let x = 0; x < canvas.width; x++) {
        let y = canvas.height / 2;

        if (castSource === 'watch') {
          // Photoplethysmogram (PPG) pulse wave style
          const ppgPhase = (x * 0.05 * freqMultiplier - offset) % (2 * Math.PI);
          const sinusPulse = Math.sin(ppgPhase);
          const secondaryDicroticNotch = Math.sin(ppgPhase * 2 + 1) * 0.35;
          y += (sinusPulse + secondaryDicroticNotch) * 18;
        } else {
          // Complex ECG waveform style (P-R-Q-R-S-T sequence)
          const pState = (x - offset * 10) % 120;
          let ecgDelta = 0;
          if (pState > 10 && pState < 20) { // P-wave
            ecgDelta = Math.sin((pState - 10) * Math.PI / 10) * 4;
          } else if (pState >= 28 && pState <= 32) { // Q wave (down)
            ecgDelta = -3;
          } else if (pState > 32 && pState < 40) { // R-peak (steep up)
            ecgDelta = 28 * Math.sin((pState - 32) * Math.PI / 8);
          } else if (pState >= 40 && pState <= 44) { // S-wave (steep down)
            ecgDelta = -10 * Math.sin((pState - 40) * Math.PI / 4);
          } else if (pState > 55 && pState < 75) { // T-wave (rounded dome)
            ecgDelta = Math.sin((pState - 55) * Math.PI / 20) * 7;
          }
          y -= ecgDelta * (watchSymmetryPreset === 'hyper' ? 1.3 : 1.0);
        }

        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Adjust oscilloscope movement speed dynamically
      offset += hrValue > 100 ? 0.06 : hrValue < 60 ? 0.025 : 0.04;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isCasting, castSource, watchSymmetryPreset]);

  // Feed vitals from the casting configuration straight into the main Arduino context
  useEffect(() => {
    if (!isCasting) return;

    const dataPump = setInterval(() => {
      // Check if we are casting a real hardware/watch connection
      const isRealConnectionActive = arduino.connection.connected && arduino.connection.type !== 'demo';
      
      if (isRealConnectionActive) {
        if (arduino.vitals) {
          addCastLog(`Casting live hardware telemetry packet: HR ${Math.round(arduino.vitals.heartRate)} BPM | SpO2 ${Math.round(arduino.vitals.spo2)}% | Temp ${arduino.vitals.temperature}°C`, "success");
        } else {
          addCastLog("Awaiting data packets from connected hardware...", "info");
        }
        return; // Skip simulated vitals overwrite!
      }

      let vitalsDelta = {
        heartRate: 72,
        spo2: 98,
        temperature: 36.6,
        systolicBP: 120,
        diastolicBP: 81,
        respiratoryRate: 15,
        timestamp: Date.now()
      };

      if (castSource === 'watch') {
        const brandNoise = selectedWatchBrand === 'Apple' ? -2 : selectedWatchBrand === 'Garmin' ? 1 : 3;
        
        if (watchSymmetryPreset === 'balanced') {
          vitalsDelta = {
            heartRate: 70 + Math.floor(Math.random() * 4) + brandNoise,
            spo2: 98 - Math.floor(Math.random() * 2),
            temperature: 36.6 + parseFloat((Math.random() * 0.15).toFixed(1)),
            systolicBP: 118 + Math.floor(Math.random() * 4),
            diastolicBP: 79 + Math.floor(Math.random() * 3),
            respiratoryRate: 14 + Math.floor(Math.random() * 2),
            timestamp: Date.now()
          };
        } else if (watchSymmetryPreset === 'elevated') {
          vitalsDelta = {
            heartRate: 98 + Math.floor(Math.random() * 5) + brandNoise,
            spo2: 95 - Math.floor(Math.random() * 3),
            temperature: 37.8 + parseFloat((Math.random() * 0.2).toFixed(1)),
            systolicBP: 135 + Math.floor(Math.random() * 5),
            diastolicBP: 88 + Math.floor(Math.random() * 4),
            respiratoryRate: 20 + Math.floor(Math.random() * 2),
            timestamp: Date.now()
          };
        } else if (watchSymmetryPreset === 'hyper') {
          vitalsDelta = {
            heartRate: 134 + Math.floor(Math.random() * 10) + brandNoise,
            spo2: 89 - Math.floor(Math.random() * 5),
            temperature: 39.4 + parseFloat((Math.random() * 0.3).toFixed(1)),
            systolicBP: 184 + Math.floor(Math.random() * 10),
            diastolicBP: 110 + Math.floor(Math.random() * 6),
            respiratoryRate: 28 + Math.floor(Math.random() * 4),
            timestamp: Date.now()
          };
        } else { // depressed
          vitalsDelta = {
            heartRate: 46 + Math.floor(Math.random() * 4) + brandNoise,
            spo2: 94 - Math.floor(Math.random() * 2),
            temperature: 34.8 + parseFloat((Math.random() * 0.2).toFixed(1)),
            systolicBP: 88 + Math.floor(Math.random() * 5),
            diastolicBP: 56 + Math.floor(Math.random() * 4),
            respiratoryRate: 9 + Math.floor(Math.random() * 2),
            timestamp: Date.now()
          };
        }
      } else { // icu cart cast
        if (selectedIcuDevice === 'ECG') {
          vitalsDelta = {
            heartRate: watchSymmetryPreset === 'hyper' ? 122 : watchSymmetryPreset === 'depressed' ? 52 : 74,
            spo2: 97,
            temperature: 36.8,
            systolicBP: watchSymmetryPreset === 'hyper' ? 148 : 116,
            diastolicBP: watchSymmetryPreset === 'hyper' ? 96 : 76,
            respiratoryRate: watchSymmetryPreset === 'hyper' ? 24 : 15,
            timestamp: Date.now()
          };
        } else if (selectedIcuDevice === 'POLAR_PPG') {
          vitalsDelta = {
            heartRate: 80,
            spo2: 99,
            temperature: 36.1,
            systolicBP: 120,
            diastolicBP: 80,
            respiratoryRate: 14,
            timestamp: Date.now()
          };
        } else { // Ventilator source
          vitalsDelta = {
            heartRate: 84,
            spo2: 89,
            temperature: 37.1,
            systolicBP: 110,
            diastolicBP: 72,
            respiratoryRate: 26,
            timestamp: Date.now()
          };
        }
      }

      // Overdrive telemetry update
      arduino.updateVitals(vitalsDelta);

    }, 1500);

    return () => clearInterval(dataPump);
  }, [isCasting, castSource, selectedWatchBrand, watchSymmetryPreset, selectedIcuDevice, arduino.connection, arduino.vitals]);

  // Start / stop cast handlers
  const toggleCasting = () => {
    if (isCasting) {
      setIsCasting(false);
      
      // If we used a simulated cloud cast, disconnect it.
      // Otherwise, disconnect just the WebSocket relay to keep physical hardware active!
      if (arduino.connection.type === 'cloud') {
        arduino.disconnect();
      } else {
        if (arduino.disconnectWebSocket) {
          arduino.disconnectWebSocket();
        }
      }
      addCastLog("Live casting feed disconnected by administrator.", "warn");
    } else {
      setIsCasting(true);
      
      const hasRealConnection = arduino.connection.connected && 
                                arduino.connection.type !== 'cloud' && 
                                arduino.connection.type !== 'demo' && 
                                arduino.connection.type !== null;

      if (!hasRealConnection) {
        const devName = castSource === 'watch' 
          ? `${selectedWatchBrand} Smart Watch [SCREEN-CAST]`
          : `ICU Bedside Monitor (ID: ${icuChannelCode}) [MIRRORED]`;
        
        arduino.setConnection({
          connected: true,
          type: 'cloud',
          deviceName: devName
        });
        addCastLog(`Establishing simulated mirror stream from ${devName}`, "success");
      } else {
        addCastLog(`REAL HARDWARE ACTIVE: Casting live ${arduino.connection.type.toUpperCase()} telemetry from "${arduino.connection.deviceName}"`, "success");
      }
      
      // Establish background WebSocket stream to broadcast vitals
      arduino.connectWebSocket(true);
      addCastLog("Connected to Neural Relay WebSocket to broadcast live telemetry.", "success");
    }
  };

  const getWatchFaceColor = () => {
    const hr = (arduino.connection.connected && arduino.vitals) 
      ? arduino.vitals.heartRate 
      : (watchSymmetryPreset === 'hyper' ? 134 : watchSymmetryPreset === 'elevated' ? 98 : watchSymmetryPreset === 'depressed' ? 46 : 72);

    if (hr > 140 || hr < 45) return 'from-rose-500/25 to-red-500/15 shadow-rose-950/40 animate-pulse border-red-500';
    if (hr > 100) return 'from-amber-500/20 to-yellow-500/10 shadow-amber-900/10';
    if (hr < 60) return 'from-cyan-500/20 to-blue-500/10 shadow-blue-500/10';
    return 'from-emerald-500/20 to-teal-500/10 shadow-teal-500/20';
  };

  return (
    <div id="telemetry-casting-framework" className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-6 sm:p-8 mb-8 transition-all">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-slate-50 dark:border-slate-800/60 pb-6 text-left">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-3 text-lg sm:text-xl uppercase tracking-tight">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Tv size={20} className={isCasting ? 'animate-pulse' : ''} />
            </div>
            Doctorian Cast & Wearable Mirror Receiver
          </h3>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 ml-1">
            Real Watch connections, Screensharing & ICU Broadcast Emulators 
          </p>
        </div>

        {/* Source Toggle tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-800 shrink-0 select-none">
          <button
            onClick={() => {
              setCastSource('watch');
              addCastLog("Casting source switched to Smartwatch Mirror.", "info");
            }}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              castSource === 'watch' 
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-800' 
                : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            ⌚ Smartwatch Mirror
          </button>
          <button
            onClick={() => {
              setCastSource('icu');
              addCastLog("Casting source switched to Bedside Monitor Console.", "info");
            }}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              castSource === 'icu' 
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-800' 
                : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            🎛️ Clinical ICU Cast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE SENSOR SIMULATOR / SMARTWATCH RENDER */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          {castSource === 'watch' ? (
            <div className="flex flex-col items-center">
              {/* RENDER SMARTWATCH FRAME */}
              <div className="relative w-64 h-64 rounded-full border-[10px] border-slate-800 dark:border-slate-950 bg-slate-950 shadow-2xl p-4 flex flex-col justify-center items-center overflow-hidden">
                {/* Watch ambient screen */}
                <div className={`absolute inset-0 bg-gradient-to-b ${getWatchFaceColor()} opacity-60 transition-colors duration-500`} />
                <div className="absolute top-2 w-full text-center z-10">
                  <span className="text-[7.5px] font-black tracking-widest text-slate-400 uppercase font-mono">
                    {selectedWatchBrand} WATCH OS
                  </span>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center text-white select-none">
                  {/* Heartbeat pulsing effect */}
                  <motion.div
                    animate={isCasting ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: watchSymmetryPreset === 'hyper' ? 0.45 : watchSymmetryPreset === 'depressed' ? 1.5 : 0.85 }}
                    className="p-1 bg-rose-500/10 rounded-full text-rose-500"
                  >
                    <Heart size={24} fill="currentColor" />
                  </motion.div>

                  <div className="mt-1 font-sans">
                    <span className="text-4xl font-[1000] tracking-tighter text-white">
                      {isCasting ? (
                        arduino.vitals?.heartRate ? Math.round(arduino.vitals.heartRate).toString() : (
                          watchSymmetryPreset === 'balanced' ? '72' :
                          watchSymmetryPreset === 'elevated' ? '98' :
                          watchSymmetryPreset === 'hyper' ? '134' : '48'
                        )
                      ) : '--'}
                    </span>
                    <span className="text-[10px] text-rose-400 font-black tracking-wider block -mt-1 uppercase">BPM</span>
                  </div>

                  {/* Tiny status items */}
                  <div className="grid grid-cols-2 gap-2 mt-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 text-[9px] font-bold font-mono">
                    <span className="text-cyan-400">
                      O2: {isCasting ? (arduino.vitals?.spo2 ? Math.round(arduino.vitals.spo2).toString() : (watchSymmetryPreset === 'hyper' ? '88' : '98')) : '--'}%
                    </span>
                    <span className="text-amber-400">
                      C: {isCasting ? (arduino.vitals?.temperature ? arduino.vitals.temperature.toFixed(1) : (watchSymmetryPreset === 'hyper' ? '39.4' : '36.6')) : '--'}°
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-3 w-full text-center z-10">
                  <div className="flex justify-center items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isCasting ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-[7px] font-black uppercase tracking-wider text-slate-400">
                      {isCasting ? 'CASTING LIVE' : 'CAST IS IDLE'}
                    </span>
                  </div>
                </div>

                {/* Simulated watch sensors */}
                <div className="absolute top-1/2 left-0 w-1.5 h-6 bg-slate-700/80 rounded-r-sm shadow cursor-pointer hover:bg-slate-500 active:scale-95 transition-all" />
                <div className="absolute top-1/3 right-0 w-1.5 h-6 bg-slate-700/80 rounded-l-sm shadow cursor-pointer hover:bg-slate-500 active:scale-95 transition-all" />
              </div>

              {/* Watch Selector Switcher */}
              <div className="flex gap-1.5 items-center justify-center p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl mt-4 max-w-[250px]">
                {(['Samsung', 'Apple', 'Garmin', 'Fitbit'] as const).map(brand => (
                  <button
                    key={brand}
                    onClick={() => {
                      setSelectedWatchBrand(brand);
                      addCastLog(`Broadcasting manufacturer firmware updated to: ${brand} Watch Face.`, "success");
                    }}
                    className={`px-2.5 py-1 text-[8.5px] font-black uppercase rounded-lg transition-all ${
                      selectedWatchBrand === brand 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ICU BEDSIDE INTERACTIVE SCREEN */
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[280px] rounded-2xl bg-slate-950 p-4 border border-slate-805 skeleton-glow shadow-2xl relative overflow-hidden text-left font-mono">
                <div className="flex justify-between items-center text-slate-400 text-[8.5px] border-b border-slate-800 pb-2 mb-3">
                  <span className="font-bold flex items-center gap-1">
                    <Activity size={10} className="text-blue-500 animate-pulse" />
                    ICU UNIT CAST
                  </span>
                  <span className="text-amber-500 font-bold">SYS_ONLINE</span>
                </div>

                <div className="space-y-3.5 select-none">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[7px] text-slate-500 uppercase font-black">ECG Lead III</p>
                      <h4 className="text-xl font-extrabold text-blue-400 tracking-tighter">
                        {isCasting ? (
                          (arduino.connection.connected && arduino.vitals)
                            ? Math.round(arduino.vitals.heartRate)
                            : (watchSymmetryPreset === 'hyper' ? '122' : '74')
                        ) : '--'}
                        <span className="text-[9px] text-slate-500 ml-1">/min</span>
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] text-slate-500 uppercase font-black">NIBP SYS / DIA</p>
                      <h5 className="text-[12px] font-bold text-emerald-400 tracking-tight">
                        {isCasting ? (
                          (arduino.connection.connected && arduino.vitals)
                            ? `${Math.round(arduino.vitals.systolicBP)}/${Math.round(arduino.vitals.diastolicBP)}`
                            : (watchSymmetryPreset === 'hyper' ? '148/96' : '116/76')
                        ) : '--'}
                        <span className="text-[7px] text-slate-500 ml-1">mmHg</span>
                      </h5>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-800/40 pt-2">
                    <div>
                      <p className="text-[7px] text-slate-500 uppercase font-black">SPO2 SAT%</p>
                      <h4 className="text-base font-bold text-teal-400 tracking-tighter">
                        {isCasting ? (
                          (arduino.connection.connected && arduino.vitals)
                            ? Math.round(arduino.vitals.spo2)
                            : '97'
                        ) : '--'}
                        <span className="text-[9px] text-slate-500 ml-1">%</span>
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] text-slate-500 uppercase font-black">RESP. RATE</p>
                      <h5 className="text-[12px] font-bold text-red-500 tracking-tight">
                        {isCasting ? (
                          (arduino.connection.connected && arduino.vitals)
                            ? Math.round(arduino.vitals.respiratoryRate)
                            : (watchSymmetryPreset === 'hyper' ? '24' : '15')
                        ) : '--'}
                        <span className="text-[7px] text-slate-500 ml-1">bpm</span>
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800 text-center flex items-center justify-between text-[7px] text-slate-450 font-bold uppercase">
                  <span>KEY: <strong className="text-slate-300">{icuChannelCode}</strong></span>
                  <span className="text-blue-500 animate-pulse">MIRROR STYLES: OK</span>
                </div>
              </div>

              {/* ICU source switcher */}
              <div className="flex gap-1.5 items-center justify-center p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl mt-4 w-full max-w-[260px]">
                {(['ECG', 'POLAR_PPG', 'VENTILATOR'] as const).map(device => (
                  <button
                    key={device}
                    onClick={() => {
                      setSelectedIcuDevice(device);
                      addCastLog(`Ingested casting machine type changed to: ${device} Telemetry.`, "success");
                    }}
                    className={`flex-1 py-1 text-[8.5px] font-black uppercase rounded-lg transition-all ${
                      selectedIcuDevice === device 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {device}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CASTING CONTROLS, SIGNAL CONFIG, LOGS */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-900/40 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
            {/* Real watch simulation modifier controls */}
            <div className="space-y-4">
              <div>
                <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Device Physiology Stream Modifiers</span>
                <h4 className="text-md font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight mt-1">
                  Physiological Wave Mode
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { id: 'balanced', label: 'Homeostatic Normal', color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' },
                  { id: 'elevated', label: 'Tachy/Mild Fever', color: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5' },
                  { id: 'hyper', label: 'Critical Shock', color: 'border-rose-500 text-rose-600 dark:text-rose-450 bg-rose-500/5' },
                  { id: 'depressed', label: 'Deep Bradycardia', color: 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5' }
                ].map(item => {
                  const isActive = watchSymmetryPreset === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setWatchSymmetryPreset(item.id as any);
                        addCastLog(`Smart cast physiological wave shape shifted: ${item.label}`, "info");
                      }}
                      className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        isActive 
                          ? `${item.color} border-2 shadow-sm font-black`
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-750'
                      }`}
                    >
                      {item.label.split(' ')[0]}
                    </button>
                  );
                })}
              </div>

              {/* Active Oscilloscope Cast Waveform Previews */}
              <div className="space-y-2">
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {castSource === 'watch' ? 'Ingested PPG Optical Sensor Pulse Bellows' : 'Demodulated 3-Lead Analog ECG Signal'}
                </span>
                <div className="h-16 relative bg-slate-950 rounded-xl border border-slate-850 overflow-hidden flex items-center">
                  <canvas 
                    ref={ecgCanvasRef} 
                    width={380} 
                    height={64} 
                    className="w-full h-full block absolute inset-0"
                  />
                  {!isCasting && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                        Awaiting device mirror handshake
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mirror Stream Core configuration & pairing parameters */}
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-slate-800/80 md:pl-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Cast Connection Config</span>
                  <h4 className="text-md font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight mt-1">
                    Telemetry Channel
                  </h4>
                </div>

                {castSource === 'watch' ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-3">
                      <Fingerprint className="text-indigo-400 shrink-0" size={16} />
                      <p className="text-[10px] text-slate-550 dark:text-slate-400 font-medium leading-relaxed">
                        To cast real watch screens, ensure security credentials for <strong className="text-slate-900 dark:text-white">GATT telemetry-sync</strong> scopes match Doctorian's dynamic sandbox key.
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Pairing State</span>
                      <span className="text-indigo-500 uppercase font-black font-mono">GATT-BROADCASTING</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mirrored Host Key</label>
                      <input
                        type="text"
                        value={icuChannelCode}
                        onChange={(e) => {
                          setIcuChannelCode(e.target.value.toUpperCase());
                          addCastLog(`Casting receiver bound key modified to: ${e.target.value.toUpperCase()}`, "info");
                        }}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="ICU-BED-09-EMR"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Stream Channel Quality</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((bar) => (
                          <div 
                            key={bar} 
                            className={`w-1 h-3 rounded-sm ${bar <= signalStrength ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-850'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Start Cast and pair stream buttons */}
              <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={toggleCasting}
                  className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-98 ${
                    isCasting 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/10' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/15'
                  }`}
                >
                  {isCasting ? <X size={15} /> : <Play size={13} fill="currentColor" />}
                  <span>{isCasting ? 'Disconnect Mirrored Cast' : 'Mirror Casting Screen Now'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* HARDWARE COUPLING PANEL */}
          <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="text-left">
              <span className="text-[8.5px] font-black uppercase text-indigo-500 tracking-wider">Physical Device Coupling Core</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight mt-0.5">
                🔌 Link Physical Hardware & Smart Watch
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Link clinical biometric machines or real smartwatches to cast actual telemetry data into the platform in real-time.
              </p>
            </div>

            {arduino.connection.connected && arduino.connection.type !== 'demo' ? (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    {arduino.connection.type === 'bluetooth' ? <Bluetooth size={18} className="animate-pulse" /> :
                     arduino.connection.type === 'wifi' ? <Wifi size={18} className="animate-pulse" /> :
                     <Cpu size={18} className="animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block">ACTIVE HARDWARE COUPLED</span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {arduino.connection.deviceName || 'Real Health Sensor'}
                    </h5>
                    <p className="text-[9.5px] text-slate-400 uppercase font-mono tracking-tight">
                      Connection Mode: {arduino.connection.type}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDisconnectDevice}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                >
                  Disconnect Device
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Watch Card */}
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Smartphone size={16} className="text-rose-500" />
                      <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">Smartwatch Link</span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 dark:text-slate-500 leading-relaxed">
                      Connect your physical Apple, Samsung, or Garmin smartwatch using Web Bluetooth GATT services.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectHealthWatch}
                    disabled={isConnecting !== null}
                    className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isConnecting === 'watch' ? <RefreshCw size={12} className="animate-spin" /> : <Bluetooth size={12} />}
                    <span>Link Real Smartwatch</span>
                  </button>
                </div>

                {/* Health Machine Card */}
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Cpu size={16} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">Wired USB Machine</span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 dark:text-slate-500 leading-relaxed">
                      Connect real Arduino boards or ICU biometric machines directly to your computer's USB serial port.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectSerial}
                    disabled={isConnecting !== null}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isConnecting === 'serial' ? <RefreshCw size={12} className="animate-spin" /> : <Cpu size={12} />}
                    <span>Link USB Serial Machine</span>
                  </button>
                </div>

                {/* WiFi Machine Card */}
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 md:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2">
                      <Wifi size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">WiFi Health Machine (HTTP / IoT)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[8.5px] font-black text-slate-450 uppercase">ENDPOINT:</span>
                      <input
                        type="text"
                        value={wifiInput}
                        onChange={(e) => setWifiInput(e.target.value)}
                        className="bg-transparent text-[9.5px] font-bold font-mono text-slate-700 dark:text-slate-300 focus:outline-none w-32"
                        placeholder="http://192.168.1.100"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 text-left">
                    <p className="text-[9.5px] text-slate-400 dark:text-slate-500 max-w-md leading-relaxed">
                      Handshake with IoT health monitors using the local network. Ensure your machine serves valid biometric payloads.
                    </p>
                    <button
                      type="button"
                      onClick={handleConnectWiFi}
                      disabled={isConnecting !== null}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 shrink-0 self-end sm:self-auto cursor-pointer"
                    >
                      {isConnecting === 'wifi' ? <RefreshCw size={12} className="animate-spin" /> : <Wifi size={12} />}
                      <span>Couple Local WiFi Machine</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostic status pipeline logs */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Real Watch & Casting Stream Transceiver Diagnostics
            </h4>
            <div className="bg-slate-950 rounded-2xl border border-slate-805 p-4 font-mono text-[9.5px] leading-relaxed max-h-[140px] overflow-y-auto space-y-2 text-slate-300 shadow-inner">
              {castLogs.length === 0 ? (
                <p className="text-slate-550 italic font-medium p-1">No connection cast packets initialized. Standby.</p>
              ) : (
                castLogs.map((log, index) => (
                  <div key={index} className="flex gap-2.5 items-start">
                    <span className="text-slate-550 font-bold select-none">{log.time}</span>
                    <span className={`px-1 text-[7.5px] font-black tracking-wider uppercase rounded ${
                      log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 
                      log.type === 'warn' ? 'bg-rose-500/10 text-rose-400' : 
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {log.type}
                    </span>
                    <p className={`flex-1 ${
                      log.type === 'success' ? 'text-teal-400 font-semibold' : 
                      log.type === 'warn' ? 'text-rose-400 font-semibold' : 
                      'text-slate-400'
                    }`}>
                      {log.msg}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
