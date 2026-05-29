import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bluetooth, 
  X, 
  Battery, 
  Heart, 
  Cpu, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Radio, 
  RefreshCw, 
  Terminal, 
  LogOut, 
  ShieldAlert,
  Fingerprint,
  Zap,
  Flame,
  Clock
} from 'lucide-react';
import { useArduinoContext } from '../ArduinoContext';

interface WearableConnectorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TelemetryLog {
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export const WearableConnector: React.FC<WearableConnectorProps> = ({ isOpen, onClose }) => {
  const arduino = useArduinoContext();
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [pairingError, setPairingError] = useState<{
    code: string;
    title: string;
    message: string;
    action: string;
  } | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Helper to add timestamped diagnostic log entries
  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { timestamp: time, type, message }]);
  };

  // Add initial log entries & reset errors
  useEffect(() => {
    if (isOpen) {
      setLogs([]);
      setPairingError(null);
      addLog("Initializing Web Bluetooth (BLE) Telemetry framework...", 'info');
      addLog("Detecting host browser Web Bluetooth support...", 'info');
      
      const nav = navigator as any;
      if (!nav.bluetooth) {
        addLog("CRITICAL: Web Bluetooth API is not supported. Use Chrome or Edge on Desktop.", 'error');
      } else {
        addLog("API Detected. Ready to request GATT services.", 'success');
      }

      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        addLog("MANDATE: HTTPS required for Web Bluetooth pairing.", 'warn');
      }

      // Check if inside an iframe
      if (window.self !== window.top) {
        addLog("SANDBOX ALERT: This app is styled inside an AI Studio iframe. Bluetooth requires a New Tab.", 'warn');
      }
    }
  }, [isOpen]);

  // Sync log entries with connection state shifts
  useEffect(() => {
    if (!isOpen) return;

    if (arduino.connection.connected && arduino.connection.type === 'bluetooth') {
      addLog(`Connected successfully to device: ${arduino.connection.deviceName || 'Health Watch'}`, 'success');
      addLog(`Discovered GATT Generic Attribute Server.`, 'info');
      addLog(`Subscribed to Heart Rate Measurement characteristic [UUID: 0x2A37]`, 'success');
      addLog(`Active heart rate streaming established.`, 'success');
      setPairingError(null);
    } else if (!arduino.connection.connected) {
      addLog("Bluetooth hardware hub disconnected / inactive.", 'info');
    }
  }, [arduino.connection.connected, arduino.connection.deviceName, isOpen]);

  // Sync details from watchMetadata when available
  useEffect(() => {
    if (!isOpen) return;
    if (arduino.watchMetadata) {
      if (arduino.watchMetadata.battery !== undefined) {
        addLog(`GATT Battery Service: level read at ${arduino.watchMetadata.battery}%`, 'success');
      }
      if (arduino.watchMetadata.manufacturer) {
        addLog(`GATT Device Information: Manufacturer string is "${arduino.watchMetadata.manufacturer}"`, 'success');
      }
    }
  }, [arduino.watchMetadata, isOpen]);

  // Sync error states
  useEffect(() => {
    if (!isOpen) return;
    if (arduino.error) {
      addLog(`Error: ${arduino.error}`, 'error');
    }
  }, [arduino.error, isOpen]);

  // Auto-scroll diagnostic logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handlePairWatch = async () => {
    setIsScanning(true);
    setPairingError(null);
    addLog("Requesting BLE heart_rate [0x180D] / battery_service [0x180F] nodes...", 'info');
    try {
      await arduino.connectHealthWatch();
      setPairingError(null);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      addLog(`Hardware Link Rejected: ${errMsg}`, 'error');

      let title = "Pairing Failed";
      let message = "An error occurred while attempting to pair with your Bluetooth wearable device.";
      let action = "Check that your device is powered on, has Bluetooth enabled, and is discoverable.";
      let code = "UNKNOWN";

      if (errMsg.includes("cancelled") || errMsg.includes("User cancelled") || err?.name === "NotFoundError") {
        code = "CANCELLED";
        title = "Connection Process Cancelled";
        message = "The Bluetooth pairing request was dismissed or closed by the user.";
        action = "Click 'Scan & Connect BLE' again and select your health smartwatch / heart-rate sensor from the pairing menu chooser.";
      } else if (errMsg.includes("disconnected") || errMsg.includes("GATT") || errMsg.includes("connection lost")) {
        code = "DISCONNECTED";
        title = "Device Disconnected";
        message = "The telemetry link was interrupted or the wearable unexpectedly dropped the GATT server handshake.";
        action = "Ensure your smartwatch is within 5 meters of your computer, has at least 20% battery, and is not already synced with another companion app.";
      } else if (errMsg.includes("SecurityError") || errMsg.includes("iframe") || errMsg.includes("origin") || errMsg.includes("sandbox")) {
        code = "SECURITY_SANDBOX";
        title = "Secure Context Blocked";
        message = "Your browser's security model blocks Web Bluetooth API access inside sandboxed iframe containers.";
        action = "Click the 'Open in New Tab' or 'Open App' icon at the top right of the AI Studio preview window to bypass secure origin constraints.";
      } else if (errMsg.includes("not supported") || !(navigator as any).bluetooth) {
        code = "UNSUPPORTED";
        title = "Browser Bluetooth Unsupported";
        message = "The current browser does not support or expose the Web Bluetooth (BLE) GATT interface.";
        action = "Open this platform inside a modern build of Google Chrome, Microsoft Edge, or Opera on desktop to pair a physical watch.";
      }

      setPairingError({ code, title, message, action });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDisconnect = () => {
    setIsScanning(false);
    arduino.disconnect();
    setPairingError(null);
    addLog("Web Bluetooth telemetry session manually terminated.", 'warn');
  };

  if (!isOpen) return null;

  const isBluetoothConnected = arduino.connection.connected && arduino.connection.type === 'bluetooth';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl relative">
                {isBluetoothConnected && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 rounded-2xl bg-emerald-500/30 dark:bg-emerald-400/30"
                  />
                )}
                <Bluetooth size={24} className={isBluetoothConnected ? "text-emerald-500 relative z-10 animate-pulse" : "relative z-10 animate-pulse"} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Real-Time Wearable Hub</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Physical Bluetooth Smartwatch Bridge (BLE)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content grid */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            {/* Sandbox IFrame Warning */}
            {window.self !== window.top && (
              <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-3xl flex gap-4 items-start">
                <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">IFrame Hardware Sandbox Detected</h4>
                  <p className="text-[11px] font-medium text-amber-700/90 dark:text-amber-400/80 leading-relaxed">
                    Browsers restrict Web Bluetooth access inside nested preview frames. For direct hardware pairing to succeed, please hit the <span className="font-bold">"Open in New Tab"</span> or <span className="font-bold">"Open App"</span> icon in AI Studio's top banner to bypass secure origin limitations.
                  </p>
                </div>
              </div>
            )}

            {/* Connection Error Message panel */}
            <AnimatePresence mode="wait">
              {pairingError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  className="p-6 bg-rose-50/95 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl flex gap-4 items-start shadow-sm"
                >
                  <AlertTriangle className="text-rose-600 dark:text-rose-405 shrink-0 mt-1" size={22} />
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-black text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                        {pairingError.title}
                      </h4>
                      <span className="text-[8px] font-black uppercase font-mono bg-rose-200/50 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded leading-none shrink-0 tracking-widest">
                        {pairingError.code}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-rose-800/90 dark:text-rose-300/80 leading-relaxed">
                      {pairingError.message}
                    </p>
                    <div className="pt-2 border-t border-rose-200/40 dark:border-rose-900/20 flex flex-col sm:flex-row sm:items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase text-indigo-650 dark:text-indigo-400 tracking-wider shrink-0">Action Steps:</span>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {pairingError.action}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPairingError(null)}
                    className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded text-rose-700 dark:text-rose-400 font-bold self-start transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connection Status panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Details Panel */}
              <div className="md:col-span-7 space-y-6">
                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between h-full min-h-[220px]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-black uppercase text-indigo-550 dark:text-indigo-400 tracking-widest">Active Link Interface</span>
                      <h4 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter mt-1 leading-none">
                        {isBluetoothConnected ? arduino.connection.deviceName : "Interface Inactive"}
                      </h4>
                    </div>

                    {/* Highly polished active telemetry status icon with pulsing halo effect */}
                    <div className="relative flex items-center justify-center shrink-0">
                      {isBluetoothConnected && (
                        <>
                          <motion.div
                            animate={{ scale: [1, 2.0, 1], opacity: [0.35, 0, 0.35] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
                            className="absolute w-12 h-12 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                            className="absolute w-10 h-10 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10"
                          />
                        </>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isBluetoothConnected 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10' 
                          : 'bg-slate-50 dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-400'
                      }`}>
                        <Radio size={18} className={isBluetoothConnected ? "animate-pulse" : ""} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        isBluetoothConnected 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-transparent'
                      }`}>
                        {isBluetoothConnected ? (
                          <motion.span
                            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
                          />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                        )}
                        {isBluetoothConnected ? 'Active Link' : 'Disabled'}
                      </span>
                      {isBluetoothConnected && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          <Radio size={10} className="animate-pulse" />
                          BLE Telemetry Stream
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    {!isBluetoothConnected ? (
                      <button
                        onClick={handlePairWatch}
                        disabled={isScanning}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer"
                      >
                        {isScanning ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Pairing Wireless...</span>
                          </>
                        ) : (
                          <>
                            <Bluetooth size={16} />
                            <span>Scan & Connect BLE</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleDisconnect}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer"
                      >
                        <LogOut size={16} />
                        <span>Disconnect Telemetry</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Vitals Widget (if connected) */}
              <div className="md:col-span-5">
                {isBluetoothConnected ? (
                  <div className="h-full p-6 bg-slate-900 text-white rounded-[2rem] border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Active Biometrics</span>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Activity size={14} className="animate-pulse" />
                        <span className="text-[10px] font-bold">1Hz Refresh</span>
                      </div>
                    </div>

                    <div className="my-6 space-y-4">
                      <div className="flex items-end justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <Heart className="text-rose-500 animate-bounce duration-1000 shrink-0" size={22} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Live Pulse Rate</p>
                            <p className="text-xs font-bold text-white uppercase">{arduino.watchMetadata?.manufacturer || "Smartwatch Sensor"}</p>
                          </div>
                        </div>
                        <p className="text-3xl font-[1000] tracking-tighter text-white">
                          {arduino.vitals?.heartRate || "--"}<span className="text-[10px] uppercase font-black tracking-normal ml-1">bpm</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <Battery className="text-emerald-400 shrink-0" size={22} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Battery Level</p>
                            <p className="text-xs font-bold text-white uppercase">Power Source</p>
                          </div>
                        </div>
                        <p className="text-xl font-black tracking-tight text-white">
                          {arduino.watchMetadata?.battery !== undefined ? `${arduino.watchMetadata.battery}%` : "100% (USB)"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Cpu className="text-blue-400 shrink-0" size={22} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">GATT Profiles</p>
                            <p className="text-xs font-bold text-white uppercase">Discovered UUIDs</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400">
                          0x180D, 0x180F
                        </p>
                      </div>
                    </div>

                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center mt-2">
                      Secured Bluetooth Low Energy Link
                    </p>
                  </div>
                ) : (
                  <div className="h-full p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center py-10">
                    <Radio className="text-slate-300 dark:text-slate-700 animate-pulse mb-3" size={40} />
                    <h5 className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-tight">No Active Node</h5>
                    <p className="text-[11px] font-medium text-slate-400 mt-1 max-w-[200px]">
                      Trigger a peripheral search or click connect to establish a real-time smart link.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Supported Wearables & Bluetooth Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint size={16} className="text-indigo-500" />
                  What is needed for a real connection?
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="p-1 px-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-black h-fit">1</div>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                      Your smartwatch or HR chest strap must support the <span className="font-bold text-slate-900 dark:text-white">standard Bluetooth Heart Rate Service (GATT UUID 0x180D)</span>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="p-1 px-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-black h-fit">2</div>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                      Web Bluetooth works on <span className="font-bold text-slate-900 dark:text-white">Google Chrome, Microsoft Edge, Opera</span> or <span className="font-bold text-slate-900 dark:text-white">Bluefy (iOS)</span>. It does not work on Firefox.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="p-1 px-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-black h-fit">3</div>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                      Make sure your smartwatch device is disconnected from your phone's standard companion app before trying to query it here, otherwise it won't broadcast its profile.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-indigo-500" />
                  GATT Bluetooth Compatibility Table
                </h4>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-4 bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[8px] font-black uppercase text-indigo-550 dark:text-indigo-400 tracking-wider">Device Profiles</span>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-1">Smart Ring / Band</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase mt-1">✓ Fully Supported</p>
                  </div>
                  <div className="p-4 bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[8px] font-black uppercase text-indigo-550 dark:text-indigo-400 tracking-wider">Protocol Services</span>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-1">Heart Rate Monitor</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase mt-1">✓ Fully Supported</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Logs Panel */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={16} className="text-slate-600 dark:text-slate-400" />
                  Live GATT Telemetry Diagnostic Console
                </h4>
                <button
                  type="button"
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {showLogs ? "Hide Console" : "Show Console"}
                </button>
              </div>

              {showLogs && (
                <div className="bg-slate-950 rounded-3xl border border-slate-800/80 p-5 font-mono text-[10px] leading-relaxed max-h-[180px] overflow-y-auto space-y-2 select-text shadow-inner">
                  {logs.length === 0 ? (
                    <p className="text-slate-500 italic">No diagnostic signals logged yet in this session.</p>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-slate-500 shrink-0 font-bold">{log.timestamp}</span>
                        <span className={`shrink-0 uppercase font-black tracking-wider text-[8px] px-1 rounded ${
                          log.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' :
                          log.type === 'warn' ? 'bg-amber-500/15 text-amber-400' :
                          log.type === 'error' ? 'bg-rose-500/15 text-rose-400' :
                          'bg-blue-500/15 text-blue-400'
                        }`}>
                          {log.type}
                        </span>
                        <p className={`flex-1 ${
                          log.type === 'success' ? 'text-emerald-300' :
                          log.type === 'warn' ? 'text-amber-300' :
                          log.type === 'error' ? 'text-rose-300' :
                          'text-slate-300'
                        }`}>
                          {log.message}
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Footer controls */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end shrink-0 rounded-b-[2.5rem]">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-950 dark:hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
            >
              Close Hub Controls
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
