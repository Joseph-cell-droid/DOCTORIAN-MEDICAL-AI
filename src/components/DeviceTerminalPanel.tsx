import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bluetooth, 
  Smartphone, 
  Cpu, 
  Wifi, 
  Zap, 
  Terminal, 
  RefreshCw, 
  Play, 
  Square, 
  Radio, 
  Database, 
  ArrowRight, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Signal, 
  Code, 
  Wrench, 
  Send,
  Trash2,
  Info,
  HelpCircle,
  FileText
} from 'lucide-react';

interface DeviceTerminalPanelProps {
  arduino: any;
}

export const DeviceTerminalPanel: React.FC<DeviceTerminalPanelProps> = ({ arduino }) => {
  const {
    connection,
    connectionLogs,
    addConnectionLog,
    injectRawTelemetry,
    connectBluetooth,
    connectHealthWatch,
    connectSerial,
    connectWiFi,
    connectWebSocket,
    disconnect,
    error,
    vitals
  } = arduino;

  const [activeChannel, setActiveChannel] = useState<'watch' | 'bluetooth' | 'serial' | 'wifi' | 'cloud'>('bluetooth');
  
  // Custom interface parameters
  const [baudRate, setBaudRate] = useState<'9600' | '115200' | '57600'>('9600');
  const [comPort, setComPort] = useState<'COM1' | 'COM3' | 'COM4' | 'COM8' | '/dev/ttyUSB0'>('COM3');
  const [wifiIP, setWifiIP] = useState('http://192.168.1.100');
  const [rawInjection, setRawInjection] = useState('72,36.5,98,120,80,16');
  
  // Simulation parameters for virtual node
  const [isSimulatingNode, setIsSimulatingNode] = useState(false);
  const [simPacketType, setSimPacketType] = useState<'csv' | 'json' | 'checksum'>('csv');
  const [simInterval, setSimInterval] = useState<number>(2000);
  const [simPreset, setSimPreset] = useState<'stable' | 'warning' | 'shock'>('stable');
  const [showSchematic, setShowSchematic] = useState(false);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the raw telemetry logs console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [connectionLogs]);

  // Virtual Microcontroller Emulation Node (Simulating real TX/RX loops)
  useEffect(() => {
    if (!isSimulatingNode) return;

    // Set connection state to emulated serial/bluetooth
    addConnectionLog(`Emulated Microcontroller Node started on virtual channel: ${activeChannel.toUpperCase()}`, "success");
    addConnectionLog(`UART parameters configured: ${baudRate} Baud, 8N1 flow control.`, "info");
    
    const intervalId = setInterval(() => {
      let hr = 72;
      let temp = 36.5;
      let spo2 = 98;
      let sys = 120;
      let dia = 80;
      let rr = 16;

      if (simPreset === 'warning') {
        hr = Math.round(102 + Math.random() * 5);
        temp = parseFloat((37.9 + Math.random() * 0.2).toFixed(1));
        spo2 = Math.round(91 + Math.random() * 2);
        sys = Math.round(138 + Math.random() * 5);
        dia = Math.round(88 + Math.random() * 4);
        rr = Math.round(21 + Math.random() * 2);
      } else if (simPreset === 'shock') {
        hr = Math.round(145 + Math.random() * 10);
        temp = parseFloat((39.6 + Math.random() * 0.4).toFixed(1));
        spo2 = Math.round(83 + Math.random() * 3);
        sys = Math.round(195 + Math.random() * 8);
        dia = Math.round(112 + Math.random() * 6);
        rr = Math.round(31 + Math.random() * 3);
      } else {
        hr = Math.round(68 + Math.random() * 6);
        temp = parseFloat((36.5 + Math.random() * 0.2).toFixed(1));
        spo2 = Math.round(97 + Math.random() * 2);
        sys = Math.round(118 + Math.random() * 4);
        dia = Math.round(78 + Math.random() * 3);
        rr = Math.round(14 + Math.random() * 2);
      }

      let payload = '';
      if (simPacketType === 'json') {
        payload = JSON.stringify({ hr, temp, spo2, sys, dia, rr, ts: Date.now() });
      } else if (simPacketType === 'checksum') {
        // Simulates NMEA-style or specialized clinical packet strings
        const baseString = `$BIO,${hr},${temp},${spo2},${sys},${dia},${rr}`;
        // Simple mock CRC checksum calculation
        let checksum = 0;
        for (let i = 0; i < baseString.length; i++) {
          checksum ^= baseString.charCodeAt(i);
        }
        payload = `${baseString}*${checksum.toString(16).toUpperCase()}\\r\\n`;
      } else {
        // Standard CSV format: HR,TEMP,SPO2,SYS,DIA,RR
        payload = `${hr},${temp},${spo2},${sys},${dia},${rr}`;
      }

      injectRawTelemetry(payload);
    }, simInterval);

    return () => {
      clearInterval(intervalId);
      addConnectionLog("Emulated Microcontroller Node powered down.", "warn");
    };
  }, [isSimulatingNode, simPacketType, simInterval, simPreset, activeChannel, baudRate, injectRawTelemetry, addConnectionLog]);

  const handleManualInject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInjection.trim()) return;
    injectRawTelemetry(rawInjection);
  };

  const startSimulatorNode = () => {
    setIsSimulatingNode(true);
    // Mimic official connection
    arduino.disconnect();
    arduino.setConnection({
      connected: true,
      type: 'demo',
      deviceName: `Emulated ${activeChannel.toUpperCase()} Node`
    });
  };

  const stopSimulatorNode = () => {
    setIsSimulatingNode(false);
    arduino.disconnect();
  };

  const clearLogsConsole = () => {
    // Fill console with reboot sequence
    addConnectionLog("Biometric Receiver buffer cleared.", "info");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-10 mb-8 overflow-hidden relative" id="telemetry-hardware-interface">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Terminal className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Clinical Telemetry Interface</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Physical Device Handshaking, UART Terminal & Core Decoders</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider select-none ${
            connection.connected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connection.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>{connection.connected ? `LINK ACTIVE: ${connection.type?.toUpperCase()}` : 'DISCONNECTED'}</span>
          </div>

          {isSimulatingNode && (
            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider select-none animate-pulse">
              Emulation Active
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-8 relative z-10">
        {[
          { id: 'watch', label: 'WATCH LINK', icon: Smartphone, color: 'hover:border-rose-300 dark:hover:border-rose-800' },
          { id: 'bluetooth', label: 'BLUETOOTH', icon: Bluetooth, color: 'hover:border-blue-300 dark:hover:border-blue-800' },
          { id: 'serial', label: 'USB SERIAL', icon: Cpu, color: 'hover:border-slate-400 dark:hover:border-slate-600' },
          { id: 'wifi', label: 'WIFI LINK', icon: Wifi, color: 'hover:border-emerald-300 dark:hover:border-emerald-800' },
          { id: 'cloud', label: 'NEURAL LINK', icon: Zap, color: 'hover:border-purple-300 dark:hover:border-purple-800' },
        ].map((tab, mapIdx_206) => {
          const isActive = activeChannel === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={`deviceterminalpanel-l212-${mapIdx_206}`}
              onClick={() => {
                setActiveChannel(tab.id as any);
                if (isSimulatingNode) {
                  addConnectionLog(`Channel changed. Reconfiguring emulated channel to: ${tab.id.toUpperCase()}`, "info");
                }
              }}
              className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-2xl text-xs font-black transition-all border-2 select-none cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/10'
                  : `bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 ${tab.color}`
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Setup & Controls, Right Real-Time Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Parameter Configuration & Activation Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6 text-left">
            <div>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest font-mono">Hardware Port Properties</span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">Physical Socket Settings</h3>
            </div>

            {/* Conditionally render form controls per selected activeChannel */}
            {activeChannel === 'serial' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">COM Port</label>
                  <select 
                    value={comPort} 
                    onChange={(e: any) => setComPort(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="COM1">COM1 (Intel Direct)</option>
                    <option value="COM3">COM3 (FTDI USB-Bridge)</option>
                    <option value="COM4">COM4 (Silicon Labs CP210x)</option>
                    <option value="COM8">COM8 (Generic CDC)</option>
                    <option value="/dev/ttyUSB0">/dev/ttyUSB0 (Linux USB)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baud Rate</label>
                  <select 
                    value={baudRate} 
                    onChange={(e: any) => setBaudRate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="9600">9600 bps (Standard)</option>
                    <option value="57600">57600 bps</option>
                    <option value="115200">115200 bps (High-Speed)</option>
                  </select>
                </div>
              </div>
            )}

            {activeChannel === 'wifi' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Arduino ESP8266/ESP32 URL IP Host</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wifiIP}
                    onChange={(e) => setWifiIP(e.target.value)}
                    placeholder="http://192.168.1.100"
                    className="flex-grow px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                  />
                  <span className="bg-slate-200 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-[10px] font-mono text-slate-500 flex items-center">/vitals</span>
                </div>
              </div>
            )}

            {activeChannel === 'bluetooth' && (
              <div className="p-3 bg-blue-550/10 dark:bg-blue-500/5 text-blue-800 dark:text-blue-400 border border-blue-500/10 rounded-2xl text-[10.5px] leading-relaxed font-sans font-medium space-y-1">
                <p className="font-bold">GATT Service Configuration:</p>
                <p className="opacity-80">Primary UUID filter: <strong className="font-mono">0xFFE0</strong> (HM-10 BLE Serial module default)</p>
                <p className="opacity-80">Characteristic descriptor: <strong className="font-mono">0xFFE1</strong> (Notifications enabled)</p>
              </div>
            )}

            {activeChannel === 'watch' && (
              <div className="p-3 bg-rose-550/10 dark:bg-rose-500/5 text-rose-800 dark:text-rose-400 border border-rose-500/10 rounded-2xl text-[10.5px] leading-relaxed font-sans font-medium space-y-1">
                <p className="font-bold">Biometric GATT Characteristics:</p>
                <p className="opacity-80">Heart Rate Service: <strong className="font-mono">0x180D (0x2A37)</strong></p>
                <p className="opacity-80">Pulse Oximeter Service: <strong className="font-mono">0x1822</strong> (Optional)</p>
                <p className="opacity-80">Battery Level Service: <strong className="font-mono">0x180F (0x2A19)</strong></p>
              </div>
            )}

            {activeChannel === 'cloud' && (
              <div className="p-3 bg-purple-550/10 dark:bg-purple-500/5 text-purple-800 dark:text-purple-400 border border-purple-500/10 rounded-2xl text-[10.5px] leading-relaxed font-sans font-medium space-y-1">
                <p className="font-bold">Bi-directional JSON Neural Sync:</p>
                <p className="opacity-80">Channel: <strong className="font-mono">wss://{window.location.host}/api/biometrics</strong></p>
                <p className="opacity-80">Encryption: SHA-256 E2EE End-To-End Bio-Socket Coupling</p>
              </div>
            )}

            {/* Direct Hardware Connect Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (activeChannel === 'bluetooth') await connectBluetooth();
                    if (activeChannel === 'serial') await connectSerial();
                    if (activeChannel === 'watch') await connectHealthWatch();
                    if (activeChannel === 'wifi') await connectWiFi(wifiIP);
                    if (activeChannel === 'cloud') connectWebSocket();
                  }}
                  disabled={connection.connected && connection.type === activeChannel}
                  className="flex-grow flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none transition-all shadow-md shadow-indigo-500/10"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Request Hardware Lock</span>
                </button>

                {connection.connected && (
                  <button
                    onClick={disconnect}
                    className="px-4 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase cursor-pointer select-none transition-all"
                    title="Disconnect device"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
              </div>

              {window.self !== window.top && (activeChannel === 'bluetooth' || activeChannel === 'watch' || activeChannel === 'serial') && (
                <div className="text-[10px] text-amber-600 dark:text-amber-400 leading-normal font-sans font-semibold border-t border-slate-100 dark:border-slate-800 pt-3">
                  ⚠️ <strong>IFrame Restriction Warning:</strong> Direct browser USB/BLE layers might block sandboxed nodes. Use the Emulation node panel below to test all decoders locally!
                </div>
              )}
            </div>
          </div>

          {/* Microcontroller Simulator Node Panel */}
          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 text-left space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest font-mono">Simulate Local Transmitter</span>
                <h3 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">Emulation Control Deck</h3>
              </div>
              <div className={`w-2 h-2 rounded-full ${isSimulatingNode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
            </div>

            <p className="text-[10.5px] leading-relaxed text-slate-400 font-sans font-medium">
              Boot up a virtual clinical Arduino node that broadcasts raw biometric packets continuously onto the UART receiver buffer.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1 text-[10px] text-slate-300 font-sans font-semibold">
              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wider block text-[8px]">Frame Format</label>
                <div className="flex gap-1.5">
                  {(['csv', 'json', 'checksum'] as const).map((fmt, fIdx) => (
                    <button
                      key={`dt-fmt-${fmt}-${fIdx}`}
                      onClick={() => {
                        setSimPacketType(fmt);
                        addConnectionLog(`Emulated frame format switched to: ${fmt.toUpperCase()}`, "info");
                      }}
                      className={`px-2 py-1 rounded text-[8.5px] font-black uppercase transition-all cursor-pointer ${
                        simPacketType === fmt 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-900 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wider block text-[8px]">Patient Vitals Profile</label>
                <div className="flex gap-1.5">
                  {(['stable', 'warning', 'shock'] as const).map((p, pIdx) => (
                    <button
                      key={`dt-p-${p}-${pIdx}`}
                      onClick={() => {
                        setSimPreset(p);
                        addConnectionLog(`Simulated patient biometrics changed to: ${p.toUpperCase()} state`, "info");
                      }}
                      className={`px-2 py-1 rounded text-[8.5px] font-black uppercase transition-all cursor-pointer ${
                        simPreset === p 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-900 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex gap-3">
              {!isSimulatingNode ? (
                <button
                  onClick={startSimulatorNode}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider select-none cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start Emulation Transmitter</span>
                </button>
              ) : (
                <button
                  onClick={stopSimulatorNode}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-wider select-none cursor-pointer transition-all animate-pulse"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Shut Down Emulator Node</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Glowing CRT Console / Live Parser Logs */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="flex-1 flex flex-col bg-slate-950 rounded-[2rem] border border-slate-850 p-6 relative overflow-hidden text-left shadow-2xl">
            
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 select-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 ml-2">TTYACM0 / dev / tsc_receiver_stream</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={clearLogsConsole}
                  className="text-[9px] font-mono font-bold text-slate-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer transition-all"
                  title="Clear Receiver Logs Buffer"
                >
                  <Trash2 size={12} />
                  Clear Console
                </button>

                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8.5px] font-mono font-black text-emerald-500 uppercase">Buffer OK</span>
                </div>
              </div>
            </div>

            {/* Logs Console Scroll Box */}
            <div className="flex-1 min-h-[340px] max-h-[460px] overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 select-text scrollbar-thin text-slate-350 pr-2">
              {connectionLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 py-24 select-none">
                  <Terminal className="w-10 h-10 stroke-1 mb-2 animate-pulse" />
                  <p className="font-mono text-xs">Biometric Receiver Engine Ready.</p>
                  <p className="text-[9px] mt-1 uppercase max-w-xs">Awaiting transponder channel activation or custom payload inject sequence...</p>
                </div>
              ) : (
                connectionLogs.map((log, index) => {
                  let logClass = 'text-slate-400';
                  let badgeColor = 'bg-blue-500/10 text-blue-400';
                  
                  if (log.includes('[SUCCESS]')) {
                    logClass = 'text-emerald-400 font-bold';
                    badgeColor = 'bg-emerald-500/15 text-emerald-400';
                  } else if (log.includes('[WARN]')) {
                    logClass = 'text-amber-350';
                    badgeColor = 'bg-amber-500/15 text-amber-300';
                  } else if (log.includes('[ERROR]')) {
                    logClass = 'text-rose-400 font-black';
                    badgeColor = 'bg-rose-500/20 text-rose-400';
                  } else if (log.includes('RX ')) {
                    logClass = 'text-teal-350';
                    badgeColor = 'bg-teal-500/10 text-teal-400';
                  }

                  // Split timestamp and text
                  const timeMatch = log.match(/^\[(.*?)\] /);
                  const timestamp = timeMatch ? timeMatch[1] : '';
                  const rest = log.replace(/^\[.*?\] /, '');

                  // Detect severity badge
                  const badgeMatch = rest.match(/^\[(.*?)\] /);
                  const badge = badgeMatch ? badgeMatch[1] : 'INFO';
                  const cleanText = rest.replace(/^\[.*?\] /, '');

                  return (
                    <div key={`deviceterminalpanel-l505-index-${index}`} className="flex items-start gap-2 hover:bg-white/2 p-0.5 rounded transition-colors">
                      <span className="text-slate-600 select-none font-bold">{timestamp}</span>
                      <span className={`px-1 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${badgeColor}`}>
                        {badge}
                      </span>
                      <p className={`flex-1 break-all font-semibold ${logClass}`}>
                        {cleanText}
                      </p>
                    </div>
                  );
                })
              )}
              <div ref={consoleEndRef} />
            </div>

            {/* Terminal Manual Injection Input Field */}
            <form onSubmit={handleManualInject} className="mt-4 pt-4 border-t border-white/5 flex gap-2">
              <div className="flex-grow relative flex items-center">
                <span className="absolute left-4 font-mono text-[10px] text-indigo-400 font-black select-none">{'>'}</span>
                <input
                  type="text"
                  value={rawInjection}
                  onChange={(e) => setRawInjection(e.target.value)}
                  placeholder="Insert raw packet, e.g. HR,TEMP,SPO2,SYS,DIA,RR"
                  className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-white/5 rounded-xl font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500/50"
                  aria-label="Raw clinical telemetry packet string"
                />
              </div>
              <button
                type="submit"
                className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                title="Inject raw telemetry frame"
              >
                <Send size={12} />
                <span>Inject</span>
              </button>
            </form>
          </div>

          {/* Quick interactive schematic drawer toggle */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden text-left">
            <button
              onClick={() => setShowSchematic(!showSchematic)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 font-black text-xs uppercase text-slate-850 dark:text-white tracking-wide cursor-pointer focus:outline-none select-none"
            >
              <span className="flex items-center gap-2">
                <Wrench size={14} className="text-indigo-500" />
                Hardware Wiring Pinout & Arduino Sketch Guidelines
              </span>
              <span className="text-slate-400 font-bold">{showSchematic ? "Hide" : "Show"}</span>
            </button>

            <AnimatePresence>
              {showSchematic && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {/* Diagram Column */}
                    <div className="space-y-4 text-left">
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Code size={13} className="text-indigo-500" /> ESP32 / Arduino Pinout Mapping
                      </h4>
                      <p>
                        Connect your physical sensor modules (such as the <strong>MAX30102 PPG pulse sensor</strong> and <strong>DHT22 temperature sensor</strong>) to your microcontroller using these pins:
                      </p>
                      
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-2 font-mono text-[9.5px] leading-5 text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between border-b border-slate-200/50 dark:border-slate-800 pb-1">
                          <strong className="text-indigo-500">MAX30102 SENSOR</strong>
                          <strong>MICROCONTROLLER</strong>
                        </div>
                        <div className="flex justify-between"><span>VIN (Power)</span> <span>➔ 3.3V Pin</span></div>
                        <div className="flex justify-between"><span>GND (Ground)</span> <span>➔ GND Pin</span></div>
                        <div className="flex justify-between"><span>SDA (I2C Data)</span> <span>➔ GPIO 21 (ESP32) / A4 (Nano)</span></div>
                        <div className="flex justify-between border-b border-slate-200/50 dark:border-slate-800 pb-1.5"><span>SCL (I2C Clock)</span> <span>➔ GPIO 22 (ESP32) / A5 (Nano)</span></div>
                        
                        <div className="flex justify-between pt-1 font-bold text-indigo-500">
                          <span>DHT22 SENSOR</span>
                          <span>MICROCONTROLLER</span>
                        </div>
                        <div className="flex justify-between"><span>S (Signal Pin)</span> <span>➔ GPIO 4 (ESP32) / D2 (Nano)</span></div>
                        <div className="flex justify-between"><span>VCC (Power)</span> <span>➔ 5V or 3.3V Pin</span></div>
                      </div>
                    </div>

                    {/* Code Column */}
                    <div className="space-y-4 text-left">
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText size={13} className="text-indigo-500" /> Arduino Sketch Frame Protocol
                      </h4>
                      <p>
                        Flash this lightweight C++ routine onto your board. It samples vitals and prints a standardized, parseable ASCII CSV buffer stream over the USB serial Tx/Rx bus:
                      </p>

                      <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[9px] leading-4 rounded-2xl overflow-x-auto select-all max-h-[160px] overflow-y-auto">
{`void setup() {
  Serial.begin(9600); // Set baud rate
}

void loop() {
  // Sample your physiological hardware sensors
  float heartRate = sampleMAX30102_Pulse();
  float temperature = sampleDHT22_Celsius();
  int spo2 = sampleMAX30102_SpO2();
  int systolicBP = calculateSystolicBP();
  int diastolicBP = calculateDiastolicBP();
  int respRate = estimateRespiratoryRate();

  // Print standardized CSV string to serial bus
  Serial.print(heartRate, 1);     Serial.print(",");
  Serial.print(temperature, 1);   Serial.print(",");
  Serial.print(spo2);             Serial.print(",");
  Serial.print(systolicBP);       Serial.print(",");
  Serial.print(diastolicBP);      Serial.print(",");
  Serial.println(respRate);       // Carriage Return

  delay(2000); // 2 second telemetry cycle
}`}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
