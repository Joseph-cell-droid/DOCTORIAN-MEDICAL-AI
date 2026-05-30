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
  Clock,
  Smartphone,
  Sliders,
  Database,
  ArrowRight,
  Lock,
  ChevronRight,
  Check
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
  const [activeTab, setActiveTab] = useState<'healthconnect' | 'ble'>('healthconnect');
  
  // Direct BLE States
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [pairingError, setPairingError] = useState<{
    code: string;
    title: string;
    message: string;
    action: string;
  } | null>(null);

  // Health Connect States
  const [hcPermissionsGranted, setHcPermissionsGranted] = useState(false);
  const [hcProvider, setHcProvider] = useState<'samsung' | 'fitbit' | 'gfit' | 'garmin'>('samsung');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPercentage, setSyncPercentage] = useState(0);
  const [hcLogList, setHcLogList] = useState<TelemetryLog[]>([]);
  const [showCodeGuide, setShowCodeGuide] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  const logsEndRef = useRef<HTMLDivElement>(null);
  const hcLogsEndRef = useRef<HTMLDivElement>(null);

  // Helper to add timestamped diagnostic log entries
  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { timestamp: time, type, message }]);
  };

  const addHcLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setHcLogList(prev => [...prev.slice(-49), { timestamp: time, type, message }]);
  };

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

  // Initial setup logs
  useEffect(() => {
    if (isOpen) {
      setLogs([]);
      setPairingError(null);
      setHcLogList([]);
      
      addLog("Initializing Web Bluetooth (BLE) Telemetry framework...", 'info');
      
      addHcLog("Health Connect Client Service Core initialized.", 'info');
      addHcLog("Awaiting OAuth scope configuration & on-device permissions handshake.", 'info');

      const nav = navigator as any;
      if (!nav.bluetooth) {
        addLog("CRITICAL: Web Bluetooth API is not supported in this browser environment.", 'error');
      } else {
        addLog("Web Bluetooth GATT Client API detected.", 'success');
      }
    }
  }, [isOpen]);

  // Auto scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (hcLogsEndRef.current) {
      hcLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hcLogList]);

  // Handler for BLE Pairing
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

  // Helper values for active UI source metadata
  const getProviderLabel = () => {
    switch (hcProvider) {
      case 'samsung': return 'Samsung Health';
      case 'fitbit': return 'Fitbit / Pixel Watch';
      case 'gfit': return 'Google Fit Hub';
      case 'garmin': return 'Garmin Connect';
    }
  };

  const getProviderDevice = () => {
    switch (hcProvider) {
      case 'samsung': return 'Galaxy Watch7 Active';
      case 'fitbit': return 'Google Pixel Watch 3';
      case 'gfit': return 'Android Fossil Gen 6';
      case 'garmin': return 'Fenix 7 Solar Pro';
    }
  };

  // Grant simulated Health Connect permissions
  const handleGrantPermissions = () => {
    addHcLog("Requesting Android package permission intent: 'androidx.health.PERMISSION_READ'...", 'info');
    setTimeout(() => {
      setHcPermissionsGranted(true);
      addHcLog("✓ Heart Rate Read Permission (HeartRateRecord) -> GRANTED.", 'success');
      addHcLog("✓ Oxygen Saturation Read Permission (OxygenSaturationRecord) -> GRANTED.", 'success');
      addHcLog("✓ Skin Temperature Read Permission (SkinTemperatureRecord) -> GRANTED.", 'success');
      addHcLog("✓ Blood Pressure Read Permission (BloodPressureRecord) -> GRANTED.", 'success');
      addHcLog("✓ Sleep Stage Read Permission (SleepSessionRecord) -> GRANTED.", 'success');
      addHcLog("Android Health Connect Client storage manager handshake complete.", 'success');
    }, 800);
  };

  // Synchronize dynamic parameters via Health Connect
  const handleSyncHealthConnect = () => {
    if (!hcPermissionsGranted) {
      addHcLog("MANDATE: Request cannot proceed. Please grant storage client read permissions first.", 'error');
      return;
    }

    setIsSyncing(true);
    setSyncPercentage(0);
    addHcLog(`Connecting to package: 'com.google.android.apps.healthdata' via AIDL binder...`, 'info');
    addHcLog(`Querying active health aggregation session for connected source: ${getProviderLabel()} (${getProviderDevice()})`, 'info');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setSyncPercentage(currentProgress);

      // Trigger realistic procedural pipeline logs per stage
      if (currentProgress === 20) {
        addHcLog(`[GHC SDK] Handshake accepted. Mapping requested record types...`, 'success');
        addHcLog(`[GHC SDK] Authenticated as doctorian-wearable-proxy-id: 'bedeeb5'...`, 'info');
      } else if (currentProgress === 40) {
        addHcLog(`[${getProviderLabel()}] Importing Heart Rate series intervals (last 15 minutes)...`, 'info');
        const randStableHR = selectedPreset === 'critical' ? 142 : selectedPreset === 'warning' ? 104 : 72;
        addHcLog(`[${getProviderLabel()}] Latest ingested heart rate: ${randStableHR} bpm`, 'success');
      } else if (currentProgress === 60) {
        addHcLog(`[${getProviderLabel()}] Importing Blood Oxygen readings series...`, 'info');
        const randSpo2 = selectedPreset === 'critical' ? 82 : selectedPreset === 'warning' ? 92 : 98;
        addHcLog(`[${getProviderLabel()}] Oxygen Saturation reading: ${randSpo2}%`, 'success');
      } else if (currentProgress === 80) {
        addHcLog(`[${getProviderLabel()}] Read Blood Pressure and Body Temperature metrics...`, 'info');
        const temp = selectedPreset === 'critical' ? 39.5 : selectedPreset === 'warning' ? 37.9 : 36.6;
        const sBP = selectedPreset === 'critical' ? 192 : selectedPreset === 'warning' ? 138 : 118;
        const dBP = selectedPreset === 'critical' ? 112 : selectedPreset === 'warning' ? 88 : 78;
        addHcLog(`[${getProviderLabel()}] BP read: ${sBP}/${dBP} mmHg | Temp read: ${temp}°C`, 'info');
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        setIsSyncing(false);

        // Calculate physiological vitals based on selected preset
        let simulatedVitals = {
          heartRate: Math.round(72 + Math.random() * 6),
          temperature: parseFloat((36.6 + Math.random() * 0.2).toFixed(1)),
          spo2: Math.round(97 + Math.random() * 2),
          systolicBP: Math.round(118 + Math.random() * 4),
          diastolicBP: Math.round(78 + Math.random() * 3),
          respiratoryRate: Math.round(14 + Math.random() * 2),
          timestamp: Date.now(),
        };

        if (selectedPreset === 'critical') {
          simulatedVitals = {
            heartRate: Math.round(140 + Math.random() * 10),
            temperature: parseFloat((39.4 + Math.random() * 0.4).toFixed(1)),
            spo2: Math.round(82 + Math.random() * 3),
            systolicBP: Math.round(192 + Math.random() * 10),
            diastolicBP: Math.round(112 + Math.random() * 5),
            respiratoryRate: Math.round(29 + Math.random() * 3),
            timestamp: Date.now(),
          };
        } else if (selectedPreset === 'warning') {
          simulatedVitals = {
            heartRate: Math.round(102 + Math.random() * 6),
            temperature: parseFloat((37.9 + Math.random() * 0.3).toFixed(1)),
            spo2: Math.round(91 + Math.random() * 2),
            systolicBP: Math.round(138 + Math.random() * 6),
            diastolicBP: Math.round(88 + Math.random() * 4),
            respiratoryRate: Math.round(22 + Math.random() * 2),
            timestamp: Date.now(),
          };
        }

        // Forward synced vitals to the Arduino Context EMR interface
        arduino.disconnect();
        arduino.updateVitals(simulatedVitals);
        arduino.setConnection({
          connected: true,
          type: 'demo',
          deviceName: `${getProviderLabel()} [Health Connect]`
        });

        addHcLog(`[GHC SDK] Data Sync Complete. Transmitting payload to Doctorian EMR Core...`, 'success');
        addHcLog(`[Dynamic Vitals Engine] Synced successfully. Live health metrics stabilized!`, 'success');
      }
    }, 200);
  };

  const isBluetoothConnected = arduino.connection.connected && arduino.connection.type === 'bluetooth';
  const isHealthConnectConnected = arduino.connection.connected && arduino.connection.deviceName?.includes('Health Connect');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-lg"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 dark:border-slate-800 shrink-0 gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl relative">
                {(isBluetoothConnected || isHealthConnectConnected) && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 rounded-2xl bg-teal-500/30 dark:bg-teal-400/30"
                  />
                )}
                {activeTab === 'healthconnect' ? (
                  <Smartphone size={24} className="text-teal-500 relative z-10 animate-pulse" />
                ) : (
                  <Bluetooth size={24} className="text-indigo-500 relative z-10 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Real-Time Wearable Hub</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Unified Device Integration Center & API Engine</p>
              </div>
            </div>
            
            {/* Elegant Tab Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-800/80 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setActiveTab('healthconnect')}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === 'healthconnect' 
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-800' 
                    : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🤖 Health Connect Sync
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ble')}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === 'ble' 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-800' 
                    : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📡 Direct Bluetooth GATT
              </button>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-thin">
            
            {/* TAB: GOOGLE HEALTH CONNECT SYNC */}
            {activeTab === 'healthconnect' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Descriptive Architecture Box */}
                <div className="p-6 bg-slate-950 border border-slate-850 rounded-[2rem] text-slate-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 flex-grow max-w-xl text-left">
                      <span className="text-[9px] font-black uppercase tracking-wider text-teal-400 font-mono bg-teal-500/10 px-2 py-1 rounded">
                        Recommended Multi-Service Architecture
                      </span>
                      <h4 className="text-md font-black text-white uppercase tracking-tight">Android Jetpack Health Connect API</h4>
                      <p className="text-[11px] leading-relaxed text-slate-400 font-medium font-sans">
                        Rather than implementing fractured, proprietary APIs for every hardware manufacturer, Doctorian uses Google's central <strong className="text-slate-200">Health Connect</strong> engine. 
                        A single on-device Android service unifies telemetry from **Samsung Health, Fitbit, Pixel Watch, Garmin Connect, and Oura Ring**, consolidating sync protocols into a local, encrypted, unified biometric database.
                      </p>
                    </div>
                    {/* Visual architectural flow */}
                    <div className="grid grid-cols-5 items-center gap-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shrink-0 md:w-80">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-base select-none">⌚</span>
                        <span className="text-[8px] font-bold uppercase text-slate-500">Wearables</span>
                      </div>
                      <div className="text-slate-600 font-bold text-center">➔</div>
                      <div className="flex flex-col items-center gap-1.5 col-span-1 bg-teal-950/40 p-2.5 rounded-xl border border-teal-500/20">
                        <Smartphone size={16} className="text-teal-400" />
                        <span className="text-[8px] font-semibold uppercase text-teal-400">Health Connect</span>
                      </div>
                      <div className="text-slate-600 font-bold text-center">➔</div>
                      <div className="flex flex-col items-center gap-1.5">
                        <Database size={16} className="text-indigo-400" />
                        <span className="text-[8px] font-semibold uppercase text-indigo-400">EMR Server</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Interactive Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Sync Trigger Console */}
                  <div className="md:col-span-7 p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] text-left space-y-6 flex flex-col justify-between">
                    <div className="space-y-5">
                      <div>
                        <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Step 1: Configuration Handshake</span>
                        <h4 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-tight mt-1">Select Synchronization Provider</h4>
                      </div>

                      {/* Provider Logo Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'samsung', label: 'Samsung Health', emoji: '🔬', desc: 'Galaxy Watches' },
                          { id: 'fitbit', label: 'Fitbit App', emoji: '💚', desc: 'Pixel Watch / Charge' },
                          { id: 'garmin', label: 'Garmin Hub', emoji: '⚡', desc: 'Fenix / Instinct' },
                          { id: 'gfit', label: 'Google Fit', emoji: '🔵', desc: 'Android OS' },
                        ].map(p => {
                          const isActive = hcProvider === p.id;
                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => {
                                setHcProvider(p.id as any);
                                addHcLog(`Switched active synchronizer source to: ${p.label}`, 'info');
                              }}
                              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer select-none flex flex-col items-center gap-1.5 ${
                                isActive 
                                  ? 'bg-teal-500/10 dark:bg-teal-950/30 border-teal-500 text-teal-600 dark:text-teal-400 shadow-md shadow-teal-500/5' 
                                  : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-150 dark:border-slate-800/80 text-slate-705 dark:text-slate-300'
                              }`}
                            >
                              <span className="text-lg select-none">{p.emoji}</span>
                              <div>
                                <p className="text-[10px] font-bold tracking-tight">{p.label}</p>
                                <p className="text-[8px] text-slate-400 font-medium">{p.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Step 2: Interactive Authorization Checkbox lists */}
                      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Step 2: Security Permission Scopes</span>
                          {hcPermissionsGranted && (
                            <span className="text-[8px] font-black uppercase font-mono tracking-wider text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 size={10} /> Handshake Ok
                            </span>
                          )}
                        </div>

                        {!hcPermissionsGranted ? (
                          <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3.5">
                            <p className="text-[10.5px] leading-relaxed text-slate-400 font-medium">To test Doctorian API mapping, authenticate the web client to simulate Jetpack permissions.</p>
                            <div className="grid grid-cols-2 gap-2 text-[9.5px] text-slate-400 font-semibold font-mono">
                              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" /> read:heart_rate</div>
                              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" /> read:oxygen_saturation</div>
                              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" /> read:body_temp</div>
                              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" /> read:blood_pressure</div>
                            </div>
                            <button
                              type="button"
                              onClick={handleGrantPermissions}
                              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer relative"
                            >
                              Authorize Health Connect API Client
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 text-emerald-800 dark:text-emerald-400 rounded-2xl flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                              <Check size={16} className="text-emerald-500" />
                            </div>
                            <div className="text-left">
                              <h5 className="text-[11px] font-black uppercase tracking-wider">Device Client Connected</h5>
                              <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">Authorization handshake successfully completed with local storage engine.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step 3: Simulation Parameters */}
                      {hcPermissionsGranted && (
                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
                          <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Step 3: Test Telemetry Preset</span>
                          <div className="flex gap-2 mt-2 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                            {[
                              { id: 'healthy', label: 'Stable Normal', color: 'text-emerald-500' },
                              { id: 'warning', label: 'Mild Warning', color: 'text-amber-500' },
                              { id: 'critical', label: 'Critical Shock', color: 'text-rose-500' },
                            ].map(preset => (
                              <button
                                type="button"
                                key={preset.id}
                                onClick={() => {
                                  setSelectedPreset(preset.id as any);
                                  addHcLog(`Switched simulation payload target to: ${preset.label} biometrics profile`, 'info');
                                }}
                                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all tracking-wider cursor-pointer select-none ${
                                  selectedPreset === preset.id 
                                    ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm' 
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                                }`}
                              >
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${preset.color} bg-current`} />
                                {preset.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/60 mt-4">
                      <button
                        type="button"
                        disabled={!hcPermissionsGranted || isSyncing}
                        onClick={handleSyncHealthConnect}
                        className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg select-none cursor-pointer ${
                          !hcPermissionsGranted 
                            ? 'bg-slate-200 dark:bg-slate-800/60 text-slate-400 border border-slate-300 dark:border-slate-800 cursor-not-allowed shadow-none'
                            : isSyncing 
                              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/20 cursor-wait shadow-none'
                              : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-98'
                        }`}
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw size={15} className="animate-spin text-teal-400" />
                            <span>Synchronizing Telemetry ({syncPercentage}%) ...</span>
                          </>
                        ) : (
                          <>
                            <Database size={15} />
                            <span>{isHealthConnectConnected ? "Refresh Biometric Bundle" : "Sync Biometric Bundle"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Connected Device Stats & Ingest Monitor */}
                  <div className="md:col-span-5 flex flex-col gap-6">
                    {isHealthConnectConnected ? (
                      <div className="p-6 bg-slate-950 text-white rounded-[2rem] border border-slate-850 shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -z-10" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-teal-400 tracking-widest">Database Aggregate Status</span>
                          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-wider">Ready / Connected</span>
                          </div>
                        </div>

                        <div className="my-6 space-y-4">
                          <div className="flex items-end justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                              <Smartphone className="text-teal-400 shrink-0" size={20} />
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase">Provider Client</p>
                                <p className="text-xs font-black text-white uppercase">{getProviderLabel()}</p>
                              </div>
                            </div>
                            <p className="text-[10px] font-semibold text-slate-400 italic">Android Sync Pipeline</p>
                          </div>

                          <div className="flex items-end justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                              <Heart className="text-rose-500 animate-pulse shrink-0" size={20} />
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase">Latest Hear Rate</p>
                                <p className="text-xs font-black text-white uppercase">{getProviderDevice()}</p>
                              </div>
                            </div>
                            <p className="text-2xl font-[1000] tracking-tighter text-white">
                              {arduino.vitals?.heartRate || "--"}<span className="text-[10px] uppercase font-black tracking-normal ml-1">bpm</span>
                            </p>
                          </div>

                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                              <Info className="text-teal-400" size={20} />
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase">Blood Saturation (SpO2)</p>
                                <p className="text-xs font-black text-white uppercase">Pulse Oximeter Aggregation</p>
                              </div>
                            </div>
                            <p className="text-lg font-black tracking-tight text-white">
                              {arduino.vitals?.spo2 || "--"}%
                            </p>
                          </div>

                          <div className="flex justify-between items-center pb-1">
                            <div className="flex items-center gap-3 bg-white/5">
                              <Clock className="text-teal-400" size={20} />
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase">Skin Temp & Resp. Rate</p>
                                <p className="text-xs font-black text-white uppercase">Peripheral Biometrics</p>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-slate-400 text-right font-mono">
                              {arduino.vitals?.temperature}°C | {arduino.vitals?.respiratoryRate}/min
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest leading-none">
                            Synchronized to patient dashboard
                          </span>
                          <button
                            type="button"
                            onClick={handleDisconnect}
                            className="text-[9px] font-black uppercase text-rose-450 hover:underline cursor-pointer"
                          >
                            Sever Sync Connection
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center py-12 flex-grow">
                        <Smartphone className="text-slate-300 dark:text-slate-700 animate-pulse mb-3" size={40} />
                        <h5 className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-tight">No Active Health Connect Pipeline</h5>
                        <p className="text-[11px] font-medium text-slate-400 mt-2 max-w-[220px] leading-relaxed">
                          Once permissions are validated and a synchronized bundle is requested, raw biological values from Samsung Health or Fitbit are compiled and served instantly.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Android SDK Developer Quick Integration Code Panel */}
                <div className="border border-slate-200 dark:border-slate-805 rounded-[2rem] overflow-hidden text-left">
                  <button
                    type="button"
                    onClick={() => setShowCodeGuide(!showCodeGuide)}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950 font-black text-xs uppercase text-slate-850 dark:text-white tracking-wider focus:outline-none cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Cpu size={14} className="text-teal-500" />
                      View Kotlin SDK Integration Guide (Samsung, Fitbit, Pixel)
                    </span>
                    <span className={`text-[10px] font-black uppercase transition-all ${showCodeGuide ? 'rotate-90' : ''}`}>➔</span>
                  </button>

                  <AnimatePresence>
                    {showCodeGuide && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-200 dark:border-slate-850 overflow-hidden"
                      >
                        <div className="p-6 bg-slate-950 text-slate-300 font-mono text-[9.5px] leading-relaxed space-y-4 max-h-[350px] overflow-y-auto">
                          <p className="text-slate-400 italic font-mono mb-4 text-[10.5px]">
                            // Below is the production-ready Jetpack Health Connect SDK integration in Kotlin.
                            <br />// It checks permissions, executes queries, gathers series packets, and pipes it back to our Doctorian REST telemetry proxy.
                          </p>
                          <pre className="text-teal-300 bg-slate-900/60 p-4 rounded-xl border border-white/5 select-text leading-5 overflow-x-auto whitespace-pre">
{`import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant

class HealthConnectService(private val context: Context) {
    private val client by lazy { HealthConnectClient.getOrCreate(context) }

    suspend fun verifyActivePermissions(): Boolean {
        val readPermissions = setOf(
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(OxygenSaturationRecord::class)
        )
        val granted = client.permissionController.getGrantedPermissions()
        return granted.containsAll(readPermissions)
    }

    suspend fun querySamsungFitbitTimeline(startTime: Instant, endTime: Instant): List<HeartRateRecord> {
        val request = ReadRecordsRequest(
            recordType = HeartRateRecord::class,
            timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
        )
        val response = client.readRecords(request)
        return response.records // Standard Kotlin collection of aggregated watch samples
    }
}`}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Collapsible Health Connect Pipeline Diagnostics */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 text-left">
                    <Terminal size={15} className="text-slate-600 dark:text-slate-400" />
                    Android Health Connect AIDL Binder Log Console
                  </h4>
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 font-mono text-[10px] leading-relaxed max-h-[160px] overflow-y-auto space-y-1.5 text-left select-text shadow-inner">
                    {hcLogList.length === 0 ? (
                      <p className="text-slate-500 italic">No storage client signals mapped yet in this session.</p>
                    ) : (
                      hcLogList.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
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
                            log.type === 'success' ? 'text-teal-400' :
                            log.type === 'warn' ? 'text-amber-300' :
                            log.type === 'error' ? 'text-rose-300' :
                            'text-slate-350 font-semibold'
                          }`}>
                            {log.message}
                          </p>
                        </div>
                      ))
                    )}
                    <div ref={hcLogsEndRef} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DIRECT BLE GATT */}
            {activeTab === 'ble' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Sandbox IFrame Warning */}
                {window.self !== window.top && (
                  <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-3xl flex gap-4 items-start text-left">
                    <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">IFrame Hardware Sandbox Detected</h4>
                      <p className="text-[11.5px] font-medium text-amber-700/90 dark:text-amber-400/80 leading-relaxed">
                        Browsers restrict direct Web Bluetooth access inside nested preview frames. For hardware pairing to succeed, please hit the <span className="font-bold">"Open in New Tab"</span> or <span className="font-bold">"Open App"</span> icon in AI Studio's top banner to bypass origin limitations.
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
                      className="p-6 bg-rose-50/95 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl flex gap-4 items-start shadow-sm text-left animate-in"
                    >
                      <AlertTriangle className="text-rose-600 dark:text-rose-450 shrink-0 mt-1" size={22} />
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-[11px] font-black text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                            {pairingError.title}
                          </h4>
                          <span className="text-[8px] font-black uppercase font-mono bg-rose-200/50 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded leading-none shrink-0 tracking-widest">
                            {pairingError.code}
                          </span>
                        </div>
                        <p className="text-[10.5px] font-medium text-rose-800/90 dark:text-rose-300/80 leading-relaxed">
                          {pairingError.message}
                        </p>
                        <div className="pt-2 border-t border-rose-200/40 dark:border-rose-900/20 flex flex-col sm:flex-row sm:items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase text-indigo-650 dark:text-indigo-400 tracking-wider shrink-0">Action Steps:</span>
                          <p className="text-[10px] font-bold text-slate-705 dark:text-slate-300">
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
                  <div className="md:col-span-7 space-y-6 text-left">
                    <div className="p-6 bg-slate-50/55 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between h-full min-h-[220px]">
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
                              : 'bg-slate-55 dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-400'
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
                              : 'bg-slate-100 dark:bg-slate-805 text-slate-500 border border-transparent'
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
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer border border-transparent"
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
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer border border-transparent"
                          >
                            <LogOut size={16} />
                            <span>Disconnect Telemetry</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Vitals Widget (if connected) */}
                  <div className="md:col-span-5 text-left">
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
                            <p className="text-[10px] font-black tracking-widest text-slate-400 font-mono">
                              0x180D, 0x180F
                            </p>
                          </div>
                        </div>

                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center mt-2 font-mono">
                          Secured Bluetooth Low Energy Link
                        </p>
                      </div>
                    ) : (
                      <div className="h-full p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center py-10">
                        <Radio className="text-slate-300 dark:text-slate-750 animate-pulse mb-3" size={40} />
                        <h5 className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-tight">No Active BLE Node</h5>
                        <p className="text-[11px] font-medium text-slate-450 mt-1 max-w-[200px] leading-relaxed">
                          Trigger a peripheral search or click connect to establish a direct local BLE GATT smart link.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct BLE Pairing rules & GATT Compatibility profiles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 text-left">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Fingerprint size={16} className="text-teal-500" />
                      Browser Pairing Guidelines
                    </h4>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="p-1 px-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded text-[9px] font-mono font-black h-fit">1</div>
                        <p className="text-[11px] font-medium text-slate-605 dark:text-slate-405 leading-relaxed">
                          Your physical peripheral or sensor must execute on the <strong className="text-slate-800 dark:text-white">standard Bluetooth Heart Rate GATT Profile [UUID 0x180D]</strong>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="p-1 px-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded text-[9px] font-mono font-black h-fit">2</div>
                        <p className="text-[11px] font-medium text-slate-605 dark:text-slate-405 leading-relaxed">
                          Web Bluetooth features are exclusively supported in <strong className="text-slate-800 dark:text-white">Google Chrome, MS Edge, and Opera</strong>. It is disabled or unsupported in Mozilla Firefox or Safari.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-teal-500" />
                      GATT Bluetooth Compatibility Table
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="p-4 bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[8px] font-black uppercase text-teal-550 dark:text-teal-450 tracking-wider font-mono">Device Profiles</span>
                        <p className="text-xs font-black text-slate-900 dark:text-white mt-1">Smart Ring / Band</p>
                        <p className="text-[9.5px] font-black text-emerald-500 uppercase mt-1">✓ Fully Supported</p>
                      </div>
                      <div className="p-4 bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[8px] font-black uppercase text-teal-550 dark:text-teal-450 tracking-wider font-mono">Protocol Services</span>
                        <p className="text-xs font-black text-slate-900 dark:text-white mt-1">Heart Rate Monitor</p>
                        <p className="text-[9.5px] font-black text-emerald-500 uppercase mt-1">✓ Fully Supported</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Logs Panel for BLE */}
                <div className="pt-4 text-left space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={16} className="text-slate-600 dark:text-slate-400" />
                      Live GATT Telemetry Diagnostic Console
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowLogs(!showLogs)}
                      className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-410 hover:underline cursor-pointer select-none focus:outline-none"
                    >
                      {showLogs ? "Hide Console" : "Show Console"}
                    </button>
                  </div>

                  {showLogs && (
                    <div className="bg-slate-950 rounded-2xl border border-slate-805 p-5 font-mono text-[10px] leading-relaxed max-h-[160px] overflow-y-auto space-y-1.5 select-text shadow-inner">
                      {logs.length === 0 ? (
                        <p className="text-slate-500 italic font-mono">No direct GATT signals logged in this session.</p>
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
                              log.type === 'success' ? 'text-emerald-350 font-semibold' :
                              log.type === 'warn' ? 'text-amber-300 font-semibold' :
                              log.type === 'error' ? 'text-rose-300 font-semibold' :
                              'text-slate-350'
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
            )}

          </div>

          {/* Footer Control Panel */}
          <div className="p-6 bg-slate-55 dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between shrink-0 rounded-b-[2.5rem]">
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400">
              Doctorian Telemetry Stream Interface Model 4.12
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-950 dark:hover:bg-slate-705 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md select-none border border-transparent"
            >
              Minimize Hub
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
