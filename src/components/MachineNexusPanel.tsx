import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Wind, 
  Activity, 
  Dna, 
  Cpu, 
  RefreshCw, 
  Play, 
  Square, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  Settings, 
  Radio, 
  Network, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Sliders,
  Trash2,
  Database
} from 'lucide-react';

interface MachineNexusPanelProps {
  arduino: any;
}

interface CustomMachine {
  id: string;
  name: string;
  protocol: 'Modbus TCP' | 'CoAP' | 'RS-485 Serial' | 'MQTT' | 'WebSocket';
  endpoint: string;
  sampleRate: number;
  signalType: 'sine' | 'triangular' | 'sawtooth' | 'pulse';
  vitalsTarget: string;
  status: 'active' | 'calibrating' | 'offline';
  logs: string[];
}

export const MachineNexusPanel: React.FC<MachineNexusPanelProps> = ({ arduino }) => {
  const { vitals, updateVitals, addConnectionLog } = arduino;

  // Active Tab: bp (Blood Pressure), spirometer (Lung), ppg (Oximeter), genomics (Nanopore), custom (Provisioner)
  const [activeTab, setActiveTab] = useState<'bp' | 'spirometer' | 'ppg' | 'genomics' | 'custom'>('bp');

  // --- 1. Blood Pressure Cuff States ---
  const [bpState, setBpState] = useState<'idle' | 'inflating' | 'deflating' | 'done'>('idle');
  const [bpPressure, setBpPressure] = useState(0);
  const [bpWave, setBpWave] = useState<number[]>([]);
  const [measuredBP, setMeasuredBP] = useState<{ sys: number; dia: number } | null>(null);
  const bpIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 2. Spirometer States ---
  const [spState, setSpState] = useState<'idle' | 'blowing' | 'analyzed'>('idle');
  const [spBlowingTime, setSpBlowingTime] = useState(0);
  const [spVolumeData, setSpVolumeData] = useState<{ x: number; y: number }[]>([]); // x: Volume (L), y: Flow (L/s)
  const [spMetrics, setSpMetrics] = useState<{ fev1: number; fvc: number; ratio: number; diag: string } | null>(null);
  const spIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 3. Fingertip Oximeter PPG States ---
  const [perfusionIndex, setPerfusionIndex] = useState<number>(4.5); // 0.1% to 20%
  const [noiseLevel, setNoiseLevel] = useState<number>(0.1); // 0 to 1
  const [probePlacement, setProbePlacement] = useState<'Fingertip' | 'Ear Lobe' | 'Toe'>('Fingertip');
  const [ppgPoints, setPpgPoints] = useState<number[]>([]);
  
  // --- 4. Genomics Sequencer States ---
  const [seqActive, setSeqActive] = useState(false);
  const [poreGrid, setPoreGrid] = useState<('active' | 'clogged' | 'calibrating')[]>([]);
  const [dnaBases, setDnaBases] = useState<string[]>([]);
  const [sequencedCount, setSequencedCount] = useState(0);
  const [foundMutations, setFoundMutations] = useState<string[]>([]);
  const seqIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 5. Custom Machine Provisioner States ---
  const [machines, setMachines] = useState<CustomMachine[]>([
    {
      id: 'mac-01',
      name: 'Dräger Evita V500 Ventilator',
      protocol: 'Modbus TCP',
      endpoint: '10.200.4.15:502',
      sampleRate: 50,
      signalType: 'pulse',
      vitalsTarget: 'respiratoryRate',
      status: 'active',
      logs: ['[INIT] Connection to Dräger established.', '[MODBUS] Port 502 bound successfully.', '[DATA] Streaming Tidal Volume and PEEP...']
    },
    {
      id: 'mac-02',
      name: 'B.Braun Infusomat Pump',
      protocol: 'MQTT',
      endpoint: 'mqtt://biomedical.broker.local:1883',
      sampleRate: 5,
      signalType: 'sawtooth',
      vitalsTarget: 'temperature',
      status: 'calibrating',
      logs: ['[INIT] Subscribed to topic: ward/3/syringe/04...', '[MQTT] Handshake pending...', '[CALIBRATE] Self-test loop initiated.']
    }
  ]);

  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineProtocol, setNewMachineProtocol] = useState<'Modbus TCP' | 'CoAP' | 'RS-485 Serial' | 'MQTT' | 'WebSocket'>('Modbus TCP');
  const [newMachineEndpoint, setNewMachineEndpoint] = useState('192.168.1.150:502');
  const [newMachineRate, setNewMachineRate] = useState<number>(10);
  const [newMachineSignal, setNewMachineSignal] = useState<'sine' | 'triangular' | 'sawtooth' | 'pulse'>('sine');
  const [newMachineTarget, setNewMachineTarget] = useState<string>('heartRate');
  const [activeCustomMachineId, setActiveCustomMachineId] = useState<string | null>(null);
  const [customWaveform, setCustomWaveform] = useState<number[]>([]);

  // --- Effects ---

  // 3. PPG Scrolling wave generator
  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.2;
      const baseHeartRate = vitals ? vitals.heartRate : 72;
      const waveFreq = (baseHeartRate / 60) * 1.5; // Scale frequency based on heart rate
      
      // Photoplethysmogram formula: double peak (systolic + dicrotic notch)
      const mainPeak = Math.sin(t * waveFreq);
      const dicroticNotch = 0.35 * Math.sin(t * waveFreq * 2 + 1.2);
      let noise = (Math.random() - 0.5) * noiseLevel * 0.3;
      
      const val = (mainPeak + dicroticNotch + 1.2) * (perfusionIndex / 5) + noise;
      setPpgPoints(prev => [...prev.slice(-50), val]);
    }, 100);

    return () => clearInterval(interval);
  }, [vitals, perfusionIndex, noiseLevel]);

  // 4. Nanopore Sequencer Sensor grid initialization
  useEffect(() => {
    const pores = Array.from({ length: 128 }).map(() => {
      const r = Math.random();
      if (r < 0.1) return 'clogged';
      if (r < 0.2) return 'calibrating';
      return 'active';
    });
    setPoreGrid(pores);
  }, []);

  // --- 1. Blood Pressure Cuff Logic ---
  const startBPCuff = () => {
    if (bpState !== 'idle') return;
    setBpState('inflating');
    setBpPressure(0);
    setBpWave([]);
    setMeasuredBP(null);
    addConnectionLog("Blood pressure cuff inflation sequence initiated.", "info");

    let pressure = 0;
    let tick = 0;

    bpIntervalRef.current = setInterval(() => {
      tick++;
      if (pressure < 160) {
        // Inflate fast
        pressure += 8 + Math.round(Math.random() * 3);
        setBpPressure(pressure);
        // Add minimal noise to wave during inflation
        setBpWave(prev => [...prev.slice(-30), pressure + (Math.random() - 0.5) * 2]);
      } else {
        // Deflation starts!
        setBpState('deflating');
        clearInterval(bpIntervalRef.current!);
        
        let targetSys = 118 + Math.round(Math.random() * 6);
        let targetDia = 76 + Math.round(Math.random() * 6);

        // Overwrite if patient vitals exist
        if (vitals) {
          targetSys = Math.round(vitals.systolicBP);
          targetDia = Math.round(vitals.diastolicBP);
        }

        bpIntervalRef.current = setInterval(() => {
          pressure -= 1.8 + Math.random() * 0.4;
          setBpPressure(Math.round(pressure));

          // Calculate oscillometric beats (pulse amplitude is largest at Mean Arterial Pressure)
          const map = targetDia + (targetSys - targetDia) / 3;
          const distanceToMap = Math.abs(pressure - map);
          const beatAmplitude = Math.max(0.2, 5 - distanceToMap * 0.12);
          
          // Generate a pulse peak if we match a rhythm
          const pulseWave = Math.sin(tick * 0.8) * beatAmplitude;
          setBpWave(prev => [...prev.slice(-40), pressure + pulseWave]);

          // Trigger log ticks for Korotkoff sounds
          if (Math.round(pressure) === targetSys) {
            addConnectionLog(`[KOROTKOFF SOUND] Systolic pressure phase locked at ${targetSys} mmHg`, "success");
          }
          if (Math.round(pressure) === targetDia) {
            addConnectionLog(`[KOROTKOFF SOUND] Diastolic pressure phase locked at ${targetDia} mmHg`, "success");
          }

          if (pressure <= 50) {
            clearInterval(bpIntervalRef.current!);
            setBpState('done');
            setMeasuredBP({ sys: targetSys, dia: targetDia });
            addConnectionLog(`Blood pressure cuff measurement completed. SYS: ${targetSys} DIA: ${targetDia}`, "success");
            
            // Push to central vitals
            if (vitals) {
              updateVitals({
                ...vitals,
                systolicBP: targetSys,
                diastolicBP: targetDia,
                timestamp: Date.now()
              });
            }
          }
        }, 150);
      }
    }, 100);
  };

  const stopBPCuff = () => {
    if (bpIntervalRef.current) clearInterval(bpIntervalRef.current);
    setBpState('idle');
    setBpPressure(0);
    setBpWave([]);
    addConnectionLog("Blood pressure cuff valve manually released.", "warn");
  };

  // --- 2. Lung Spirometer Logic ---
  const startSpirometryTest = () => {
    if (spState === 'blowing') return;
    setSpState('blowing');
    setSpBlowingTime(0);
    setSpVolumeData([]);
    setSpMetrics(null);
    addConnectionLog("Lung spirometer expiratory loop diagnostics started. Patient instructed to blow forcefully...", "info");

    let t = 0;
    spIntervalRef.current = setInterval(() => {
      t += 0.1;
      setSpBlowingTime(t);

      // Math equation for forced expiratory volume (FVC) flow loop
      // Peak flow reached quickly (around 0.2s), then slopes down exponentially as volume empties
      const peakFlow = 8.5 + Math.random() * 1.5; // L/s
      const timeToPeak = 0.25;
      
      let flow = 0;
      let cumulativeVolume = 0;

      if (t < timeToPeak) {
        flow = (t / timeToPeak) * peakFlow;
      } else {
        flow = peakFlow * Math.exp(-(t - timeToPeak) * 0.7);
      }

      // Introduce slightly realistic respiratory muscle shaking
      flow += (Math.random() - 0.5) * 0.25;
      if (flow < 0) flow = 0;

      // Integrate flow to get Volume
      cumulativeVolume = Math.min(4.8, t * 1.25 * (flow + 1.5) / 2);

      // Plot point: Volume (X-axis) vs Flow (Y-axis)
      setSpVolumeData(prev => [...prev, { x: parseFloat(cumulativeVolume.toFixed(2)), y: parseFloat(flow.toFixed(2)) }]);

      if (t >= 4.0 || (t > 1.5 && flow < 0.05)) {
        clearInterval(spIntervalRef.current!);
        setSpState('analyzed');
        
        // Calculate spirometry indicators
        const calculatedFVC = parseFloat(cumulativeVolume.toFixed(2));
        // FEV1: volume expired in first second
        const calculatedFEV1 = parseFloat((calculatedFVC * 0.81).toFixed(2));
        const ratio = Math.round((calculatedFEV1 / calculatedFVC) * 100);

        let diagnosis = "Physiological optimal expiratory volume.";
        if (ratio < 70) {
          diagnosis = "Obstructive Ventilatory Defect detected (Mild Asthma / COPD risk).";
          addConnectionLog("Spirometer Diagnostic Alarm: Expiratory volume ratio under 70%. Obstruction pattern detected.", "error");
        } else if (calculatedFVC < 3.2) {
          diagnosis = "Restrictive Ventilatory Defect pattern (Suspected chest wall / parenchymal resistance).";
          addConnectionLog("Spirometer Diagnostic Notice: Restricted vital capacity. Further thoracic testing required.", "warn");
        } else {
          addConnectionLog(`Spirometer test complete. FEV1/FVC: ${ratio}% (Optimal)`, "success");
        }

        setSpMetrics({
          fev1: calculatedFEV1,
          fvc: calculatedFVC,
          ratio,
          diag: diagnosis
        });
      }
    }, 100);
  };

  // --- 4. Nanopore Sequencer Logic ---
  const toggleNanoporeSequencer = () => {
    if (seqActive) {
      if (seqIntervalRef.current) clearInterval(seqIntervalRef.current);
      setSeqActive(false);
      addConnectionLog("Genomic nanopore sequencer put on standby.", "warn");
    } else {
      setSeqActive(true);
      setDnaBases([]);
      setSequencedCount(0);
      setFoundMutations([]);
      addConnectionLog("Initializing MinION Nanopore ASIC flowcell sequencer...", "info");
      addConnectionLog("Calibrating 512 synthetic lipid-bilayer pores...", "info");

      const basePossibilities = ['A', 'T', 'C', 'G'];
      const mutationCatalog = [
        'BRCA1-Positive (Suspected high risk variant detected at Exon 11)',
        'APOE-ε4 Carrier (Heterozygous, associated with increased late-onset susceptibility)',
        'MTHFR C677T (Homogenous reduction in folate metabolism enzymes)',
        'COL1A1 Optimized (Enhanced baseline collagen structural matrix)',
        'ACTN3 Sprinter Variant (RR genotype, peak athletic power capacity)'
      ];

      seqIntervalRef.current = setInterval(() => {
        // Blit a random base
        const newBase = basePossibilities[Math.floor(Math.random() * 4)];
        setDnaBases(prev => [...prev.slice(-30), newBase]);
        setSequencedCount(prev => {
          const next = prev + Math.round(15 + Math.random() * 10);
          
          // Randomly trigger mutations finding on milestones
          if (next % 400 < 25 && foundMutations.length < 3) {
            const randomMutation = mutationCatalog[Math.floor(Math.random() * mutationCatalog.length)];
            if (!foundMutations.includes(randomMutation)) {
              setFoundMutations(m => [...m, randomMutation]);
              addConnectionLog(`[GENOMICS MUTATION ALIGNMENT] Aligned variant: ${randomMutation}`, "success");
            }
          }
          return next;
        });

        // Jitter some pores status
        setPoreGrid(prev => {
          const copy = [...prev];
          const idxToJitter = Math.floor(Math.random() * copy.length);
          const rand = Math.random();
          copy[idxToJitter] = rand < 0.8 ? 'active' : rand < 0.92 ? 'clogged' : 'calibrating';
          return copy;
        });

      }, 150);
    }
  };

  useEffect(() => {
    return () => {
      if (bpIntervalRef.current) clearInterval(bpIntervalRef.current);
      if (spIntervalRef.current) clearInterval(spIntervalRef.current);
      if (seqIntervalRef.current) clearInterval(seqIntervalRef.current);
    };
  }, []);

  // --- 5. Provision Machine Logic ---
  const handleProvisionMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName.trim()) return;

    const newMach: CustomMachine = {
      id: `mac-${Date.now()}`,
      name: newMachineName,
      protocol: newMachineProtocol,
      endpoint: newMachineEndpoint,
      sampleRate: newMachineRate,
      signalType: newMachineSignal,
      vitalsTarget: newMachineTarget,
      status: 'active',
      logs: [
        `[INIT] Machine registered. Protocol: ${newMachineProtocol}`,
        `[PORT] Listening on node endpoint "${newMachineEndpoint}"...`,
        `[COUPLING] Target vitals bus configured for dynamic parameter: ${newMachineTarget}`
      ]
    };

    setMachines(prev => [...prev, newMach]);
    addConnectionLog(`[BIOMED PROVISIONER] New telemetry node registered: "${newMachineName}"`, "success");
    setNewMachineName('');
  };

  const removeMachine = (id: string) => {
    setMachines(prev => prev.filter(m => m.id !== id));
    if (activeCustomMachineId === id) setActiveCustomMachineId(null);
    addConnectionLog(`[BIOMED PROVISIONER] Telemetry node disconnected and unmapped: ${id}`, "warn");
  };

  // Custom Machine active telemetry wave simulator
  useEffect(() => {
    if (!activeCustomMachineId) return;
    const targetMachine = machines.find(m => m.id === activeCustomMachineId);
    if (!targetMachine || targetMachine.status !== 'active') return;

    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      let val = 0;
      const rate = targetMachine.sampleRate;
      
      if (targetMachine.signalType === 'sine') {
        val = Math.sin(tick * 0.25) * 5 + 10;
      } else if (targetMachine.signalType === 'sawtooth') {
        val = (tick % 10) * 1.5 + 2;
      } else if (targetMachine.signalType === 'triangular') {
        val = Math.abs((tick % 20) - 10) * 1.2;
      } else if (targetMachine.signalType === 'pulse') {
        val = (tick % 15 < 3) ? 18 : 2;
      }

      setCustomWaveform(prev => [...prev.slice(-40), val]);

      // Inject into vitals occasionally to simulate hardware loop integration!
      if (tick % 10 === 0 && vitals) {
        const field = targetMachine.vitalsTarget;
        const currentVal = vitals[field] || 70;
        // Make minor adjustments based on wave
        const adjustedVal = Math.round(currentVal + (val - 7) * 0.15);
        updateVitals({
          ...vitals,
          [field]: Math.max(10, Math.min(250, adjustedVal)),
          timestamp: Date.now()
        });
      }
    }, 120);

    return () => clearInterval(interval);
  }, [activeCustomMachineId, machines, vitals, updateVitals]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-10 mb-8 overflow-hidden relative" id="machine-telemetry-nexus">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Machine Telemetry Nexus</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Biomedical Nodes, Oscillometry, Spirometry & Genomics Alignment</p>
          </div>
        </div>

        {/* Tab List */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {[
            { id: 'bp', label: 'BP Cuff', icon: Heart },
            { id: 'spirometer', label: 'Spirometer', icon: Wind },
            { id: 'ppg', label: 'PPG Oximeter', icon: Activity },
            { id: 'genomics', label: 'Nanopore Sequencer', icon: Dna },
            { id: 'custom', label: 'Provisioner', icon: Plus },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10.5px] font-black uppercase transition-all select-none cursor-pointer ${
                  active 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: BLOOD PRESSURE CUFF */}
        {activeTab === 'bp' && (
          <motion.div
            key="bp"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
          >
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest font-mono">Micro-Controlled Oscillometer</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Sphygmomanometer</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-sans font-medium">
                  Triggers an automated pneumatic inflation cycle up to 160 mmHg. Dynamically parses blood pressure fluctuations (systolic/diastolic Korotkoff pulses) during slow deflation.
                </p>
              </div>

              {/* Pressure display card */}
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800 pb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pneumatic Tube Pressure</span>
                  <span className="text-[9px] font-mono font-bold text-indigo-500">SYS_MAX 160 mmHg</span>
                </div>
                
                <div className="py-4">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {bpPressure}
                  </span>
                  <span className="text-xs font-bold text-slate-400 ml-2">mmHg</span>
                </div>

                <div className="flex gap-2">
                  {bpState === 'idle' || bpState === 'done' ? (
                    <button
                      onClick={startBPCuff}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider select-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play size={12} className="fill-current" />
                      Inflate Cuff (Start Cycle)
                    </button>
                  ) : (
                    <button
                      onClick={stopBPCuff}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-wider select-none cursor-pointer transition-all flex items-center justify-center gap-1.5 animate-pulse"
                    >
                      <Square size={12} className="fill-current" />
                      Release Pressure Valve (Abort)
                    </button>
                  )}
                </div>
              </div>

              {measuredBP && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-1">
                  <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Device Locked Measurement</p>
                  <p className="text-sm font-black text-slate-800 dark:text-white">
                    Systolic: <strong className="text-emerald-500 font-mono">{measuredBP.sys} mmHg</strong> | Diastolic: <strong className="text-emerald-500 font-mono">{measuredBP.dia} mmHg</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="bg-slate-950 rounded-[2rem] p-6 border border-slate-850 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono text-indigo-400 font-black uppercase">Oscillometric Envelope & Pulses (mmHg vs Samples)</span>
                  <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Inflation / Deflation Curve</span>
                  </div>
                </div>

                {/* SVG Live plot */}
                <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-850 min-h-[220px] relative overflow-hidden flex items-end">
                  {bpWave.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 text-center select-none p-4">
                      <Heart className="w-8 h-8 stroke-1 mb-2 animate-bounce" />
                      <p className="font-mono text-[10px] uppercase">Awaiting pneumatic cuff inflation...</p>
                    </div>
                  ) : (
                    <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      
                      {/* Plot line */}
                      <polyline
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={bpWave.map((val, idx) => {
                          const x = (idx / Math.max(40, bpWave.length - 1)) * 400;
                          // Scale pressure: 0 to 180 mmHg mapped to 160 to 10 on SVG
                          const y = 150 - (val / 180) * 140;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    </svg>
                  )}
                </div>

                <div className="mt-4 flex justify-between text-[9px] font-mono text-slate-500">
                  <span>0s (Inflate)</span>
                  <span>Mean Arterial Peak Oscillation</span>
                  <span>Completed (Release Valve)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: LUNG SPIROMETER */}
        {activeTab === 'spirometer' && (
          <motion.div
            key="spirometer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
          >
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest font-mono">Expiratory Flow-Volume Loop</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Standard Spirometer</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-sans font-medium">
                  Measures forced expiratory flow rates. Patients must take a deep inspiration, then blow out with maximum force into the dynamic transducer for at least 3 seconds.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Test Console</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-500">3s Expir. Duration</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blowing Timer</p>
                    <p className="text-2xl font-black font-mono text-emerald-500 mt-1">{spBlowingTime.toFixed(1)}s</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Air volume FVC</p>
                    <p className="text-2xl font-black font-mono text-indigo-500 mt-1">
                      {spVolumeData.length > 0 ? spVolumeData[spVolumeData.length - 1].x.toFixed(2) : '0.00'} L
                    </p>
                  </div>
                </div>

                <button
                  onClick={startSpirometryTest}
                  disabled={spState === 'blowing'}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest select-none cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Wind size={13} className="animate-spin" />
                  <span>Initiate Forced Exhalation</span>
                </button>
              </div>

              {spMetrics && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2 text-xs font-sans">
                  <div className="flex justify-between border-b border-white/5 pb-1 text-[9px] font-bold text-slate-400">
                    <span>SPIROMETRY OUTCOMES</span>
                    <span className="text-emerald-400">STATUS OK</span>
                  </div>
                  <div className="flex justify-between"><span>FEV1 (Forced Vol in 1s):</span> <strong className="font-mono text-white">{spMetrics.fev1} Liters</strong></div>
                  <div className="flex justify-between"><span>FVC (Total Lung Cap):</span> <strong className="font-mono text-white">{spMetrics.fvc} Liters</strong></div>
                  <div className="flex justify-between"><span>FEV1/FVC Ratio:</span> <strong className="font-mono text-emerald-400">{spMetrics.ratio}%</strong></div>
                  <p className="text-[10px] text-slate-400 leading-relaxed border-t border-white/5 pt-2 font-medium">
                    🔍 <strong>Clinical Diagnosis:</strong> {spMetrics.diag}
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="bg-slate-950 rounded-[2rem] p-6 border border-slate-850 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono text-emerald-400 font-black uppercase">Standard Lung Flow-Volume Loop (Flow L/s vs Volume L)</span>
                  <span className="text-[9px] text-slate-500 font-mono">Loop Envelope</span>
                </div>

                {/* SVG Live plot */}
                <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-850 min-h-[220px] relative overflow-hidden flex items-end">
                  {spVolumeData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 text-center select-none p-4">
                      <Wind className="w-8 h-8 stroke-1 mb-2 animate-pulse" />
                      <p className="font-mono text-[10px] uppercase">Awaiting forced expiratory volume breath...</p>
                    </div>
                  ) : (
                    <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      
                      {/* Plot curve */}
                      <path
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={`M 10 150 ` + spVolumeData.map((val) => {
                          // Map volume (0 to 6 L) to SVG X (10 to 390)
                          const x = 10 + (val.x / 6.0) * 380;
                          // Map flow (0 to 12 L/s) to SVG Y (150 to 10)
                          const y = 150 - (val.y / 12.0) * 140;
                          return `L ${x} ${y}`;
                        }).join(' ')}
                      />
                    </svg>
                  )}
                </div>

                <div className="mt-4 flex justify-between text-[9px] font-mono text-slate-500">
                  <span>0.0 Liters (Inspire)</span>
                  <span>Forced Vital Expiratory Capacity (Liters)</span>
                  <span>6.0 Liters (Total Empty)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: PPG OXIMETER */}
        {activeTab === 'ppg' && (
          <motion.div
            key="ppg"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
          >
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest font-mono">Photoplethysmography Sensor Node</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Fingertip Pulse Oximeter</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-sans font-medium">
                  Plots micro-vascular blood flow fluctuations using non-invasive infrared LEDs. Adjust raw perfusion indexes and simulate probe environmental noise factors.
                </p>
              </div>

              {/* Adjusters */}
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GATT Parameter Deck</span>
                  <span className="text-[9px] font-mono font-bold text-rose-500">MAX30102 MCU</span>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perfusion Index (PI%)</label>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{perfusionIndex}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="15.0"
                      step="0.5"
                      value={perfusionIndex}
                      onChange={(e) => setPerfusionIndex(parseFloat(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sensor Environmental Noise</label>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{(noiseLevel * 100).toFixed(0)}% Jitter</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.1"
                      value={noiseLevel}
                      onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Probe Anatomical Site</label>
                    <div className="flex gap-2">
                      {(['Fingertip', 'Ear Lobe', 'Toe'] as const).map(site => (
                        <button
                          key={site}
                          onClick={() => setProbePlacement(site)}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                            probePlacement === site 
                              ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
                              : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-150 dark:border-slate-800'
                          }`}
                        >
                          {site}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="bg-slate-950 rounded-[2rem] p-6 border border-slate-850 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono text-rose-400 font-black uppercase">Infrared Photoplethysmogram (PPG Absorption Wave)</span>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Active Heart Rate: {vitals ? vitals.heartRate : 72} bpm</span>
                  </div>
                </div>

                {/* SVG Live PPG */}
                <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-850 min-h-[220px] relative overflow-hidden flex items-end">
                  {ppgPoints.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 text-center select-none">
                      <Activity className="w-8 h-8 stroke-1 mb-2 animate-pulse" />
                      <p className="font-mono text-[10px] uppercase">Booting PPG Optical diode...</p>
                    </div>
                  ) : (
                    <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                      <path
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={`M 0 80 ` + ppgPoints.map((val, idx) => {
                          const x = (idx / 49) * 400;
                          // Val is centered around 1.2, ranging from 0 to 4. Scale accordingly.
                          const y = 140 - (val / 4.0) * 120;
                          return `L ${x} ${y}`;
                        }).join(' ')}
                      />
                    </svg>
                  )}
                </div>

                <div className="mt-4 flex justify-between text-[9px] font-mono text-slate-500">
                  <span>Systolic Rise (Vascular Outflow)</span>
                  <span>Dicrotic Notch (Aortic Valve Closure)</span>
                  <span>Diastolic Runoff</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: DNA NANOPORE SEQUENCER */}
        {activeTab === 'genomics' && (
          <motion.div
            key="genomics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
          >
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest font-mono">Oxford MinION DNA Transponder</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Nanopore Sequencer</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-sans font-medium">
                  Sequences single-strand nucleotide molecules inside 512 microscopic synthetic lipid-bilayer pore sensors in real-time, matching aligned genetic variants.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ASIC Pore Alignment Status</span>
                  <span className="text-[9px] font-mono font-bold text-purple-500">512 Channels</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nucleotides Read</p>
                    <p className="text-2xl font-black font-mono text-purple-500 mt-1">{sequencedCount} bp</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pore Health OK</p>
                    <p className="text-2xl font-black font-mono text-emerald-500 mt-1">94.5%</p>
                  </div>
                </div>

                <button
                  onClick={toggleNanoporeSequencer}
                  className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest select-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    seqActive 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {seqActive ? <Square size={13} /> : <Play size={13} />}
                  <span>{seqActive ? "Stop Sequencing Flow" : "Ignite Nanopore Flowcell"}</span>
                </button>
              </div>

              {foundMutations.length > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/25 rounded-2xl space-y-1">
                  <p className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Aligned Genomic Variant Matches</p>
                  <ul className="text-[10.5px] font-mono space-y-1.5 text-slate-700 dark:text-slate-300">
                    {foundMutations.map((mut, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-purple-500">🧬</span>
                        <span>{mut}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
              <div className="bg-slate-950 rounded-[2rem] p-6 border border-slate-850">
                <span className="text-[10px] font-mono text-purple-400 font-black uppercase block mb-4">Flowcell Nanopore Sensor Array (Active Readings Matrix)</span>
                
                {/* Active Pore Matrix (Grid of 128 elements) */}
                <div className="grid grid-cols-16 gap-1 p-3 bg-slate-900 rounded-xl border border-slate-850 max-h-[160px] overflow-hidden select-none">
                  {poreGrid.map((state, idx) => {
                    let color = 'bg-emerald-500';
                    if (state === 'clogged') color = 'bg-amber-500';
                    if (state === 'calibrating') color = 'bg-purple-500';
                    return (
                      <div
                        key={idx}
                        className={`w-full aspect-square rounded-[2px] transition-colors duration-300 ${color} ${
                          seqActive && state === 'active' ? 'animate-pulse' : ''
                        }`}
                        title={`Pore #${idx + 1}: ${state.toUpperCase()}`}
                      />
                    );
                  })}
                </div>

                {/* Base Output Log */}
                <div className="mt-4 bg-slate-900 p-4 rounded-xl border border-slate-850 h-[80px] overflow-hidden flex items-center justify-start select-all">
                  {dnaBases.length === 0 ? (
                    <p className="text-xs font-mono text-slate-600 uppercase text-center w-full">Nanopore flowcell on standby...</p>
                  ) : (
                    <div className="w-full text-left font-mono text-xs text-purple-400 font-black uppercase tracking-wider break-all leading-relaxed animate-pulse">
                      {dnaBases.map((base, idx) => {
                        let col = 'text-emerald-400';
                        if (base === 'A') col = 'text-red-400';
                        if (base === 'T') col = 'text-blue-400';
                        if (base === 'G') col = 'text-amber-400';
                        return <span key={idx} className={col}>{base}</span>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: TELEMETRY CUSTOM PROVISIONER */}
        {activeTab === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
          >
            {/* Form to provision new equipment */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest font-mono">Biomedical Engineering Tool</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Provision Telemetry Node</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-sans font-medium">
                  Register custom intensive care hardware. Bind mathematical waveforms to patient vital sign channels to test ward warning thresholds.
                </p>
              </div>

              <form onSubmit={handleProvisionMachine} className="bg-slate-50 dark:bg-slate-950/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Machine Name / Model ID</label>
                  <input
                    type="text"
                    required
                    value={newMachineName}
                    onChange={(e) => setNewMachineName(e.target.value)}
                    placeholder="e.g. Philips Intellivue MX800 Ventilator"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Interface Protocol</label>
                    <select
                      value={newMachineProtocol}
                      onChange={(e: any) => setNewMachineProtocol(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="Modbus TCP">Modbus TCP</option>
                      <option value="CoAP">CoAP (UDP)</option>
                      <option value="RS-485 Serial">RS-485 Serial</option>
                      <option value="MQTT">MQTT Broker</option>
                      <option value="WebSocket">Secure WebSockets</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Network Address Endpoint</label>
                    <input
                      type="text"
                      required
                      value={newMachineEndpoint}
                      onChange={(e) => setNewMachineEndpoint(e.target.value)}
                      placeholder="e.g. 192.168.1.150:502"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Waveform Modulation</label>
                    <select
                      value={newMachineSignal}
                      onChange={(e: any) => setNewMachineSignal(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="sine">Sine (Biological)</option>
                      <option value="triangular">Triangular</option>
                      <option value="sawtooth">Sawtooth</option>
                      <option value="pulse">Pulse Spike</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Sample Frequency</label>
                    <input
                      type="number"
                      min="1"
                      max="250"
                      value={newMachineRate}
                      onChange={(e) => setNewMachineRate(parseInt(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Target Vitals Parameter</label>
                  <select
                    value={newMachineTarget}
                    onChange={(e) => setNewMachineTarget(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="heartRate">Heart Rate (bpm)</option>
                    <option value="temperature">Body Temperature (°C)</option>
                    <option value="spo2">Oxygen Saturation (SpO2%)</option>
                    <option value="respiratoryRate">Respiratory Rate (breaths/m)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest select-none cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/15"
                >
                  <Plus size={13} />
                  <span>Map Telemetry Machine</span>
                </button>
              </form>
            </div>

            {/* List and display of current machines */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="bg-slate-950 rounded-[2rem] p-6 border border-slate-850 flex-1 flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 font-black uppercase block mb-4">Connected biomedical machines portfolio</span>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
                  {machines.length === 0 ? (
                    <div className="py-12 text-center text-slate-600 font-mono text-xs uppercase">No ward machines provisioned. Use the builder.</div>
                  ) : (
                    machines.map(mach => {
                      const isActive = activeCustomMachineId === mach.id;
                      return (
                        <div
                          key={mach.id}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isActive 
                              ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                              : 'bg-slate-900/45 border-slate-850 hover:border-slate-700 text-slate-300'
                          }`}
                          onClick={() => setActiveCustomMachineId(isActive ? null : mach.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${mach.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              <Radio size={15} className="animate-pulse" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight">{mach.name}</p>
                              <p className="text-[9.5px] font-mono text-slate-500 mt-0.5">
                                Protocol: {mach.protocol} | Bind: <span className="text-indigo-400">{mach.vitalsTarget}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-mono uppercase tracking-wider text-slate-400">
                              {mach.endpoint}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMachine(mach.id);
                              }}
                              className="p-1.5 bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-500 rounded-lg cursor-pointer transition-all border border-slate-800"
                              title="Delete machine link"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Subsystem graph displaying waveform of selected custom machine */}
                <div className="mt-4 pt-4 border-t border-white/5 flex-1 min-h-[140px] flex flex-col justify-end">
                  {activeCustomMachineId ? (
                    <div className="space-y-2 text-left h-full flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                        <span>LIVE FREQUENCY MODULATED WAVEFORM ({machines.find(m => m.id === activeCustomMachineId)?.signalType.toUpperCase()})</span>
                        <span className="text-indigo-400">SYNC ACTIVE</span>
                      </div>
                      
                      <div className="flex-1 min-h-[90px] max-h-[110px] bg-slate-900 rounded-xl relative overflow-hidden flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                          <polyline
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2"
                            points={customWaveform.map((val, idx) => {
                              const x = (idx / 39) * 400;
                              // Scale value (0 to 20) to SVG (90 to 10)
                              const y = 90 - (val / 20) * 80;
                              return `${x},${y}`;
                            }).join(' ')}
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-[10px] font-mono text-slate-600 uppercase">
                      Select a provisioned machine node above to view its live frequency oscillograph.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
