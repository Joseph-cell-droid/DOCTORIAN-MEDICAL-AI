import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Phone, ShieldCheck, Stethoscope, Heart, Brain, Zap, X, 
  Loader2, Radio, Activity, Send, FileText, CheckCircle2, ChevronRight, 
  Volume2, VolumeX, PlusCircle, Trash, Clock, ShieldAlert, History, Filter, 
  AlertTriangle, BadgePlus, Share2, ClipboardList, Pill, Upload, Camera, 
  Monitor, Bluetooth, Wifi, Cpu, Key, HelpCircle
} from 'lucide-react';
import { api, Doctor } from '../api';
import { useArduinoContext } from '../ArduinoContext';

export const DoctorsDashboard: React.FC<{ addToast?: (msg: string, type: 'success' | 'error' | 'info') => void }> = ({ addToast }) => {
  const arduino = useArduinoContext();
  const [activeSubTab, setActiveSubTab] = useState<'clinical_network' | 'referrals' | 'prescriptions' | 'connection'>('clinical_network');
  
  // Sound Configuration
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Connection management local state
  const [wifiInput, setWifiInput] = useState('http://192.168.1.100');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // States for Live Clinical Network (Duty-bound Clinicians list)
  const [clinicians, setClinicians] = useState<any[]>(() => {
    const saved = localStorage.getItem('doctorian_clinicians');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'cli-1', name: "Dr. Gloria Jayakullo", role: "Attending Cardiologist, Chief Systems Specialist", dept: "cardio", status: "On Duty", location: "Cardiology Suite A", contact: "+256787674140", avatar: "GJ" },
      { id: 'cli-2', name: "Assoc. Prof. Aaron S.", role: "Lead Neurosurgeon & Cognitive Architect", dept: "neuro", status: "In Surgery", location: "OT Chamber 4", contact: "+256702344511", avatar: "AS" },
      { id: 'cli-3', name: "Dr. Florence N.", role: "Emergency Medicine Specialist", dept: "emergency", status: "On Duty", location: "Trauma Bay 2", contact: "+256751989311", avatar: "FN" },
      { id: 'cli-4', name: "Consultant Isaac O.", role: "Telehealth Operations Director", dept: "telehealth", status: "Online", location: "Virtual Node 1", contact: "+256772881229", avatar: "IO" },
      { id: 'cli-5', name: "Dr. Trevor M.", role: "Pediatric Cardiothoracic Specialist", dept: "cardio", status: "Offline", location: "Outpost Clinics", contact: "+256781120440", avatar: "TM" }
    ];
  });

  // State for Paging Handshakes
  const [pagingStates, setPagingStates] = useState<Record<string, {
    status: 'idle' | 'tunneling' | 'routing' | 'acknowledged';
    progress: number;
    latency?: number;
    key?: string;
  }>>({});

  // Local SOAP referrals records list
  const [referrals, setReferrals] = useState<any[]>(() => {
    const saved = localStorage.getItem('doctorian_referrals');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal open states
  const [showAddClinicianModal, setShowAddClinicianModal] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);

  // New clinician form
  const [newClinician, setNewClinician] = useState({
    name: '',
    role: '',
    dept: 'cardio',
    status: 'On Duty',
    location: '',
    contact: ''
  });

  // New SOAP referral formulation data
  const [soapData, setSoapData] = useState({
    patientCode: '',
    priority: 'Routine',
    clinicianId: '',
    temp: '37.0',
    bp: '120/80',
    hr: '72',
    spo2: '98',
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  // Simulated Medical Action Terminal Log Feed
  const [logs, setLogs] = useState<Array<{ id: string; timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'broadcast' }>>(() => [
    { id: '1', timestamp: new Date().toLocaleTimeString(), message: "Clinical Network live matrix gateway initialized. Standing by.", type: 'info' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), message: "Active telemetry routes synced. 5 regional nodes responsive.", type: 'success' }
  ]);

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem('doctorian_clinicians', JSON.stringify(clinicians));
  }, [clinicians]);

  useEffect(() => {
    localStorage.setItem('doctorian_referrals', JSON.stringify(referrals));
  }, [referrals]);

  // Set up random ambient activity ticker for the live network Activity log
  useEffect(() => {
    const ambientTicks = [
      "Node ROUTER-KLA broadcast validated: SpO2 baseline virtual sync complete",
      "Telehealth supervisor routing optimized via regional Chamber 12",
      "Specialist paging frequencies synchronized: nominal bandwidth",
      "Medical SOAP registry report backup archived in persistent vault",
      "Emergency out-of-bounds trigger systems updated (STANDBY)",
      "Trauma Bay 2 telehealth camera live-feed established",
      "Dr. Gloria Jayakullo verified online telemetry dashboard",
      "Dynamic response latency threshold computed (latency: 18ms)"
    ];

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * ambientTicks.length);
      const isSystemLog = Math.random() > 0.5;
      setLogs(prev => [
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          message: ambientTicks[idx],
          type: isSystemLog ? 'broadcast' : 'info'
        },
        ...prev.slice(0, 14)
      ]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Play audio alarm tone on secure page trigger
  const playPageChime = () => {
    if (isAudioMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, start: number, duration: number, type: 'sine' | 'square' = 'sine') => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime + start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Play double diagnostic chime
      playTone(587.33, 0, 0.15); // D5
      playTone(880, 0.12, 0.3);   // A5
    } catch (e) {
      console.warn("Telemetry audio chime context blocked by browser gesture policies:", e);
    }
  };

  // Page specific clinician node
  const handlePageClinician = (id: string, name: string) => {
    playPageChime();
    
    setLogs(prev => [
      { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: `TRANSMITTING: Pager signal dispatched to Dr. ${name}. Routing carrier wave...`, type: 'info' },
      ...prev
    ]);

    setPagingStates(prev => ({
      ...prev,
      [id]: { status: 'tunneling', progress: 10 }
    }));

    // Step 1: Est encryption tunnel
    setTimeout(() => {
      setPagingStates(prev => ({
        ...prev,
        [id]: { status: 'routing', progress: 50 }
      }));
      setLogs(prev => [
        { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: `ROUTING: Carrier ping packet established securely for node ${id.toUpperCase()}.`, type: 'broadcast' },
        ...prev
      ]);
    }, 1000);

    // Step 2: Verification handshake 
    setTimeout(() => {
      const computedLatency = Math.floor(12 + Math.random() * 28);
      const computedKey = 'SEC-ACK-' + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
      
      setPagingStates(prev => ({
        ...prev,
        [id]: { 
          status: 'acknowledged', 
          progress: 100,
          latency: computedLatency,
          key: computedKey
        }
      }));

      setLogs(prev => [
        { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: `HANDSHAKE SUCCESSFUL: Clinician ${name} terminal responded. Key: ${computedKey} (Latency: ${computedLatency}ms)`, type: 'success' },
        ...prev
      ]);

      if (addToast) {
        addToast(`✨ Telehealth pager verification acknowledged by Dr. ${name}!`, 'success');
      }
    }, 2800);
  };

  // Add clinician node manually
  const handleAddClinicianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinician.name || !newClinician.role || !newClinician.location) {
      if (addToast) addToast("Please fill in all mandatory clinician node properties", "error");
      return;
    }

    const initial = newClinician.name.split(' ').map(n => n[0]).join('');
    const createdNode = {
      id: 'cli-' + Date.now(),
      name: newClinician.name.startsWith('Dr.') ? newClinician.name : `Dr. ${newClinician.name}`,
      role: newClinician.role,
      dept: newClinician.dept,
      status: newClinician.status,
      location: newClinician.location,
      contact: newClinician.contact || '+256700000000',
      avatar: initial ? initial.toUpperCase() : 'MD'
    };

    setClinicians(prev => [...prev, createdNode]);
    
    setLogs(prev => [
      { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: `REGISTERED NODE: Mount points allocated for clinician node: ${createdNode.name.toUpperCase()}.`, type: 'success' },
      ...prev
    ]);

    if (addToast) addToast(`✨ Clinician Node ${createdNode.name} registered success!`, 'success');
    setShowAddClinicianModal(false);
    setNewClinician({ name: '', role: '', dept: 'cardio', status: 'On Duty', location: '', contact: '' });
  };

  const handleRemoveClinician = (id: string, name: string) => {
    if (confirm(`Acknowledge: Unbind and delete node coordinates for ${name}?`)) {
      setClinicians(prev => prev.filter(c => c.id !== id));
      setLogs(prev => [
        { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: `NODE DISCONNECTED: Unbound clinician node parameters for ${name.toUpperCase()}.`, type: 'warning' },
        ...prev
      ]);
      if (addToast) addToast(`Clinician node ${name} unregistered.`, 'info');
    }
  };

  // Submit SOAP Handover referral
  const handlePrepareReferral = (clinicianId: string) => {
    const cl = clinicians.find(c => c.id === clinicianId);
    setSoapData({
      patientCode: 'PAT-' + Math.floor(1000 + Math.random() * 9000),
      priority: 'Routine',
      clinicianId: clinicianId,
      temp: '37.0',
      bp: '120/80',
      hr: '72',
      spo2: '98',
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    });
    setShowReferModal(true);
  };

  const handleSubmitSoapReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = clinicians.find(c => c.id === soapData.clinicianId);
    if (!recipient) {
      if (addToast) addToast("Please select a target clinician node to route SOAP payload", "error");
      return;
    }

    const referral = {
      id: 'ref-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      clinicianId: soapData.clinicianId,
      clinicianName: recipient.name,
      patientCode: soapData.patientCode || 'PAT-' + Math.floor(1000 + Math.random() * 9000),
      priority: soapData.priority,
      temp: soapData.temp || '37.0',
      bp: soapData.bp || '120/80',
      hr: soapData.hr || '72',
      spo2: soapData.spo2 || '98',
      subjective: soapData.subjective || 'Symptom report pending',
      objective: soapData.objective || 'Vitals verified. Active monitoring state',
      assessment: soapData.assessment || 'Differential diagnostics pending',
      plan: soapData.plan || 'Telemetry follow-ups active'
    };

    setReferrals(prev => [referral, ...prev]);

    setLogs(prev => [
      { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: `SOAP HANDOVER RECORDED: Patient ${referral.patientCode} referred to ${referral.clinicianName} (${referral.priority}).`, type: 'success' },
      ...prev
    ]);

    if (addToast) addToast(`✨ SOAP Referrals successfully dispatched to ${recipient.name}!`, "success");
    setShowReferModal(false);
  };

  const handleDeleteReferral = (id: string, code: string) => {
    if (confirm(`Acknowledge: Purge historical ledger docket for ${code}?`)) {
      setReferrals(prev => prev.filter(r => r.id !== id));
      if (addToast) addToast(`SOAP referral database docket ${code} purged.`, 'info');
    }
  };

  // Prescription Digitizer / Process parameters from MedicationTracker
  const [isReadingPrescription, setIsReadingPrescription] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractionResults, setExtractionResults] = useState<any[] | null>(null);
  const [medManualForm, setMedManualForm] = useState({
    name: '',
    dosage: '500mg',
    frequency: 'Daily',
    time: '08:00',
    category: 'prescription' as 'prescription' | 'supplement',
    remindersEnabled: true
  });

  const processPrescriptionFile = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPrescriptionImage(base64);
      setIsReadingPrescription(true);
      setExtractionResults(null);
      
      try {
        const prompt = `Act as a Clinical Pharmacologist. Read this prescription image and extract the medication data.
        Return ONLY a JSON array of objects with these keys: name, dosage, frequency, time (24h format), category ('prescription' or 'supplement').
        Do not include markdown tags other than the JSON container. If you write markdown code block, ensure it is standard JSON inside.
        
        Example: [{"name": "Amoxicillin", "dosage": "500mg", "frequency": "3 times daily", "time": "08:00", "category": "prescription"}]`;

        const response = await api.ai.aiChat(
          [{ role: 'user', text: prompt, images: [base64] }],
          "You are a Clinical Extraction Engine. You must return only a JSON array."
        );

        const text = response.text.replace(/```json|```/g, '').trim();
        const extractedMeds = JSON.parse(text);
        
        if (Array.isArray(extractedMeds)) {
          const addedArray: any[] = [];
          for (const m of extractedMeds) {
             const created = await api.medications.create({
                name: m.name,
                dosage: m.dosage || '500mg',
                frequency: m.frequency || 'Daily',
                time: m.time || '08:00',
                category: m.category || 'prescription',
                remindersEnabled: true
             });
             addedArray.push(created);
          }
          setExtractionResults(addedArray);
          if (addToast) addToast(`✨ Digitized and authorized ${addedArray.length} medications!`, 'success');
        }
      } catch (err) {
        console.error("Prescription reading failed:", err);
        if (addToast) addToast("Neural extraction failed. Please review the photo.", "error");
      } finally {
        setIsReadingPrescription(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrescriptionRead = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processPrescriptionFile(file);
  };

  const handleManualPrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medManualForm.name) {
      if (addToast) addToast("Medication name is a required field", "error");
      return;
    }
    try {
      const created = await api.medications.create({
        name: medManualForm.name,
        dosage: medManualForm.dosage,
        frequency: medManualForm.frequency,
        time: medManualForm.time,
        category: medManualForm.category,
        remindersEnabled: medManualForm.remindersEnabled
      });
      if (addToast) addToast(`💊 Prescription issued for: ${created.name} (${created.dosage})`, "success");
      setMedManualForm({
        name: '',
        dosage: '500mg',
        frequency: 'Daily',
        time: '08:00',
        category: 'prescription',
        remindersEnabled: true
      });
    } catch (e) {
      if (addToast) addToast("Failed to write prescription", "error");
    }
  };


  // Arduino hardware connection handlers
  const handleConnect = async (type: 'bluetooth' | 'serial' | 'wifi' | 'cloud' | 'watch') => {
    setIsConnecting(type);
    try {
      if (type === 'bluetooth') {
        await arduino.connectBluetooth();
      } else if (type === 'serial') {
        await arduino.connectSerial();
      } else if (type === 'wifi') {
        await arduino.connectWiFi(wifiInput);
      } else if (type === 'cloud') {
        await arduino.connectWebSocket();
      } else if (type === 'watch') {
        await arduino.connectHealthWatch();
      }
      if (addToast) addToast(`Coupling initialized for standard bio-monitor ${type.toUpperCase()} interface.`, 'success');
    } catch (err: any) {
      console.error(err);
      if (addToast) addToast(`Hardware link failed: ${err.message || 'Check channel status.'}`, 'error');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = () => {
    arduino.disconnect();
    if (addToast) addToast("Biometric ward telemetry channel closed safely.", "info");
  };

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 md:px-0">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-max">
            <Stethoscope size={12} className="animate-pulse" />
            Clinical Headquarters Zone
          </div>
          <h1 className="text-4xl md:text-5xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter">
            Doctors' <span className="text-blue-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1 max-w-2xl">
            Unified control suite for clinical pager matrix routing, SOAP handovers, patient medication formulation & ward hardware interface binding.
          </p>
        </div>

        {/* Dashboard sub tabs selector */}
        <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-inner gap-1 overflow-x-auto no-scrollbar whitespace-nowrap self-stretch lg:self-auto shrink-0">
          {[
            { id: 'clinical_network', label: 'Network Matrix', icon: <Radio size={12} /> },
            { id: 'referrals', label: 'SOAP Handover', icon: <FileText size={12} /> },
            { id: 'prescriptions', label: 'Prescription', icon: <Pill size={12} /> },
            { id: 'connection', label: 'Hardware Link', icon: <Monitor size={12} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-[1000] uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                activeSubTab === tab.id 
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-blue-400 shadow' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* SUB TAB CONTROLS RENDERING */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: CLINICAL NETWORK & BROADCAST FEED */}
        {activeSubTab === 'clinical_network' && (
          <motion.div
            key="clinical_network"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Online Status and Register Node */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-905 bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-tight">Clinical Routing Node Active</h3>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase leading-relaxed">Direct carrier-frequency paging signals mapped over national clinic channels.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAudioMuted(!isAudioMuted)} 
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-755 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border border-slate-700"
                >
                  {isAudioMuted ? <VolumeX size={13} className="text-rose-450" /> : <Volume2 size={13} className="text-emerald-450" />}
                  {isAudioMuted ? 'Muted' : 'Sound On'}
                </button>

                <button 
                  onClick={() => setShowAddClinicianModal(true)} 
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow shadow-blue-500/20"
                >
                  <PlusCircle size={14} /> Register Node
                </button>
              </div>
            </div>

            {/* Clinician Node list cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clinicians.map((cl) => {
                const pst = pagingStates[cl.id] || { status: 'idle', progress: 0 };
                return (
                  <div key={cl.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2.25rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 relative overflow-hidden">
                    {pst.status === 'acknowledged' && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none border-l border-b border-emerald-500/10" />
                    )}
                    
                    {/* Avatar side */}
                    <div className="flex sm:flex-col items-center gap-4 shrink-0 justify-between sm:justify-start">
                      <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white font-mono flex items-center justify-center text-lg font-black relative">
                        {cl.avatar}
                        <span className={`absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                          cl.status === 'On Duty' || cl.status === 'Online' ? 'bg-emerald-500 animate-pulse' :
                          cl.status === 'In Surgery' ? 'bg-blue-600' : 'bg-slate-400'
                        }`} />
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                        cl.status === 'On Duty' || cl.status === 'Online' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {cl.status}
                      </span>
                    </div>

                    {/* Meta side */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs tracking-tight">{cl.name}</h3>
                          {cl.id.startsWith('cli-') && cl.id !== 'cli-1' && cl.id !== 'cli-2' && cl.id !== 'cli-3' && cl.id !== 'cli-4' && cl.id !== 'cli-5' && (
                            <button onClick={() => handleRemoveClinician(cl.id, cl.name)} className="p-1 hover:bg-rose-50 text-rose-500 rounded"><Trash size={12} /></button>
                          )}
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{cl.role}</p>
                        
                        <div className="flex flex-col gap-0.5 text-[8.5px] font-bold text-slate-405 uppercase mt-3">
                          <span className="flex items-center gap-1"><MapPin size={9} /> {cl.location}</span>
                          <span className="flex items-center gap-1"><Phone size={9} /> {cl.contact}</span>
                        </div>
                      </div>

                      {/* Handshake transceiver loader */}
                      {pst.status !== 'idle' && (
                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[8px] font-black uppercase">
                            <span className={pst.status === 'tunneling' ? 'text-blue-500' : 'text-emerald-500'}>{pst.status}</span>
                            <span>{pst.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full" style={{ width: `${pst.progress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Triggers page */}
                      <div className="flex items-center gap-2 pt-1 font-mono">
                        <button
                          onClick={() => handlePageClinician(cl.id, cl.name)}
                          className="flex-1 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                        >
                          Page Node Pager
                        </button>
                        <button
                          onClick={() => handlePrepareReferral(cl.id)}
                          className="flex-1 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Draft SOAP Handover
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Live Audio Pulse Feed Monitor */}
            <section className="bg-slate-950 rounded-[2rem] border border-slate-800 p-6 md:p-8 text-white shadow-xl flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full uppercase tracking-widest">Active Broadcasting Paging logs</span>
                  <h3 className="text-base font-black uppercase mt-1">Unified Regional Hospital Carrier Pulse Activations</h3>
                </div>
                <button 
                  onClick={() => setLogs([{ id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: "Clear matrix terminal session logs triggered.", type: 'info' }])}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-[8px] font-bold uppercase tracking-widest border border-slate-800 transition-colors"
                >
                  Clear Terminal Logs
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 no-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 border-b border-slate-900/40 pb-1.5 text-slate-350">
                    <span className="text-slate-550 shrink-0 font-bold">[{log.timestamp}]</span>
                    <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-rose-400' : 'text-slate-350'}>
                      {log.type === 'success' && '✨'}
                      {log.type === 'warning' && '💊'}
                      {log.type === 'info' && '🛰️'}
                      &nbsp;{log.message}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* VIEW 2: SOAP REFERRAL DOSSIER LEDGER AND FORMS */}
        {activeSubTab === 'referrals' && (
          <motion.div
            key="referrals"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Form button helper banner */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-800 rounded-[2rem] p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
              <div className="max-w-2xl">
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-violet-250">Uganda MoH-Standards SOAP Handover</span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase mt-1.5">Dispatched Patient Referral SOAP Repositories</h2>
                <p className="text-xs text-white/80 font-medium mt-1 leading-relaxed">
                  Consolidated hospital referral registry dockets under standard Subjective, Objective, Assessment and Plan frameworks. Shared over secure cellular nodes.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (clinicians.length === 0) return;
                  handlePrepareReferral(clinicians[0].id);
                }}
                className="px-6 py-3.5 bg-white text-violet-950 font-[1000] text-xs uppercase tracking-wider rounded-xl shadow-xl hover:bg-violet-50 transition-all shrink-0"
              >
                Assemble Referral Form
              </button>
            </div>

            {/* Referrals list */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-800 dark:text-white">
                <ClipboardList size={16} className="text-violet-500" /> Dispatch Ledger ({referrals.length})
              </h3>

              {referrals.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-12 text-center text-slate-400">
                  <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">No Patient handovers compiled</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Initialize SOAP generation in the actions menu above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all gap-5">
                      <div>
                        {/* Header metadata */}
                        <div className="flex items-center justify-between border-b border-slate-55 border-slate-100 dark:border-slate-800 pb-3 mb-4">
                          <div>
                            <span className="text-[10px] font-black text-slate-450 font-mono">DOCKET: {ref.patientCode}</span>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{ref.timestamp}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase border ${
                              ref.priority === 'STAT' || ref.priority === 'STAT Emergency'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {ref.priority}
                            </span>
                            <button onClick={() => handleDeleteReferral(ref.id, ref.patientCode)} className="p-1 hover:bg-rose-50 text-rose-500 rounded"><Trash size={12} /></button>
                          </div>
                        </div>

                        {/* Recipient clinician */}
                        <p className="text-[8px] font-black text-slate-400 uppercase">Target Care Provider Node</p>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 uppercase mb-4">{ref.clinicianName}</p>

                        {/* Vitals row */}
                        <div className="grid grid-cols-4 gap-1.5 bg-slate-50 dark:bg-slate-950 p-2 text-center rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                          <div>
                            <span className="text-[7px] font-black text-slate-400">TEMP</span>
                            <p className="text-[10px] font-mono font-black mt-0.5 text-slate-850 dark:text-white leading-none">{ref.temp}°C</p>
                          </div>
                          <div className="border-l border-slate-200 dark:border-slate-800">
                            <span className="text-[7px] font-black text-slate-400">BP</span>
                            <p className="text-[10px] font-mono font-black mt-0.5 text-slate-850 dark:text-white leading-none">{ref.bp}</p>
                          </div>
                          <div className="border-l border-slate-200 dark:border-slate-800">
                            <span className="text-[7px] font-black text-slate-400">HR</span>
                            <p className="text-[10px] font-mono font-black mt-0.5 text-slate-850 dark:text-white leading-none">{ref.hr}</p>
                          </div>
                          <div className="border-l border-slate-200 dark:border-slate-800">
                            <span className="text-[7px] font-black text-slate-400">SPO2</span>
                            <p className="text-[10px] font-mono font-black mt-0.5 text-emerald-500 leading-none">{ref.spo2}%</p>
                          </div>
                        </div>

                        {/* SOAP Body */}
                        <div className="space-y-3.5 text-[11px] leading-relaxed">
                          <div>
                            <span className="font-mono text-[9px] font-black text-slate-400 uppercase">S (Subjective)</span>
                            <p className="text-slate-600 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-1.5 rounded-lg border border-slate-50/50">{ref.subjective}</p>
                          </div>
                          <div>
                            <span className="font-mono text-[9px] font-black text-slate-400 uppercase">O (Objective)</span>
                            <p className="text-slate-600 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-1.5 rounded-lg border border-slate-50/50">{ref.objective}</p>
                          </div>
                          <div>
                            <span className="font-mono text-[9px] font-black text-slate-400 uppercase">A (Assessment)</span>
                            <p className="text-slate-800 dark:text-white font-extrabold uppercase bg-slate-50/50 dark:bg-slate-950/20 px-3 py-1.5 rounded-lg border border-slate-50/50">{ref.assessment}</p>
                          </div>
                          <div>
                            <span className="font-mono text-[9px] font-black text-slate-400 uppercase">P (Plan)</span>
                            <p className="text-slate-600 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-1.5 rounded-lg border border-slate-50/50">{ref.plan}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {/* VIEW 3: PRESCRIPTION OCR DIGITIZER AND MANUAL COMPILER */}
        {activeSubTab === 'prescriptions' && (
          <motion.div
            key="prescriptions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left: OCR Scanner */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">Bio-Pharmacy Prescription OCR Scanner</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Digitize traditional diagnostic sheets into standard biochemical molecules in the database.</p>
              </div>

              {!isReadingPrescription && !extractionResults && (
                <div 
                  className={`border-2 border-dashed rounded-[2rem] p-10 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) await processPrescriptionFile(file);
                  }}
                  onClick={() => document.getElementById('dashboard-prescription-upload')?.click()}
                >
                  <input type="file" id="dashboard-prescription-upload" className="hidden" accept="image/*" onChange={handlePrescriptionRead} />
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl mb-4">
                      <Upload size={28} />
                    </div>
                    <span className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest">Select Prescription Sheet</span>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-1">Supports drag-and-drop or local file browser</p>
                  </div>
                </div>
              )}

              {isReadingPrescription && (
                <div className="p-10 text-center bg-slate-950 text-white rounded-[2rem] border border-white/5 space-y-4">
                  <Loader2 className="animate-spin text-emerald-500 mx-auto" size={32} />
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">Synthesizing clinical image tokens</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Connecting to optical character analysis pathways...</p>
                </div>
              )}

              {extractionResults && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-850 p-4 rounded-2xl border border-emerald-500/15">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-black uppercase">OCR digitisation of {extractionResults.length} clinical structures fulfilled successfully.</span>
                  </div>

                  <div className="space-y-2">
                    {extractionResults.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-405 uppercase font-bold tracking-wider">{item.category}</span>
                          <h5 className="font-extrabold uppercase text-xs text-slate-900 dark:text-white mt-0.5">{item.name}</h5>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-black text-xs text-slate-850 dark:text-white leading-none">{item.dosage}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{item.frequency}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => { setExtractionResults(null); setPrescriptionImage(null); }} 
                    className="w-full bg-slate-900 text-white dark:bg-slate-800 h-11 text-[10px] font-black uppercase rounded-xl tracking-widest"
                  >
                    Load New Prescription Sheet
                  </button>
                </div>
              )}
            </div>

            {/* Right: Manual Prescription formulation */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white mb-6">Authorize Medication Record</h3>
              
              <form onSubmit={handleManualPrescribe} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Medication Name</label>
                  <input 
                    type="text" 
                    value={medManualForm.name} 
                    onChange={e => setMedManualForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-150 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="E.g., AMOXICILLIN"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Dosage Size</label>
                    <input 
                      type="text" 
                      value={medManualForm.dosage} 
                      onChange={e => setMedManualForm(prev => ({ ...prev, dosage: e.target.value }))}
                      className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-150 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Category Type</label>
                    <select 
                      value={medManualForm.category} 
                      onChange={e => setMedManualForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-150 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider outline-none"
                    >
                      <option value="prescription">Prescription</option>
                      <option value="supplement">Supplement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Frequency Matrix</label>
                    <input 
                      type="text" 
                      value={medManualForm.frequency} 
                      onChange={e => setMedManualForm(prev => ({ ...prev, frequency: e.target.value }))}
                      className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-150 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Schedule Time</label>
                    <input 
                      type="time" 
                      value={medManualForm.time} 
                      onChange={e => setMedManualForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-150 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest mt-4 shadow shadow-blue-500/10 hover:bg-blue-500 transition-all"
                >
                  Authorize & Issue Prescription
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: ARDUINO TELEMETRY BIOMETRIC CONNECTION MANAGER */}
        {activeSubTab === 'connection' && (
          <motion.div
            key="connection"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Status light card */}
            <div className="bg-slate-950 text-white rounded-[2rem] p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Bluetooth size={140} className="text-blue-500 animate-pulse" />
              </div>
              <div className="space-y-1 z-10">
                <span className="text-[8px] font-mono font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest leading-none">Unified Diagnostics Port</span>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Hardware Telemetry Couple Hub</h3>
                <p className="text-xs text-slate-400 font-bold uppercase leading-relaxed max-w-xl">
                  Connect local clinical hardware sensors (ECG sensor, wearable chips, watch Bluetooth nodes, or SQLite simulators) directly to active patient dashboards.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 z-10">
                <span className={`w-3.5 h-3.5 rounded-full animate-pulse ${arduino.connection.connected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`} />
                <span className="text-xs font-mono font-black uppercase tracking-wider">{arduino.connection.connected ? `COUPLED: ${arduino.connection.deviceName || 'Simulator'}` : 'MACHINE OFFLINE'}</span>
                {arduino.connection.connected && (
                  <button onClick={handleDisconnect} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Disconnect</button>
                )}
              </div>
            </div>

            {/* Quick connection buttons grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { type: 'watch', name: 'Samsung / Health Watch', icon: <PlusCircle size={22} className="text-violet-500" />, desc: 'Bound directly via secure cellular wearables. Uses standard GATT biometric protocols.' },
                { type: 'bluetooth', name: 'HM-10 Arduino BLE Module', icon: <Bluetooth size={22} className="text-blue-500" />, desc: 'Connect to standard physical transceiver modules over Bluetooth.' },
                { type: 'serial', name: 'Serial Port USB Cable', icon: <Cpu size={22} className="text-amber-500" />, desc: 'Bind target machinery straight to USB baud routers.' },
                { type: 'cloud', name: 'Biometric Cloud WebSocket', icon: <Wifi size={22} className="text-emerald-500" />, desc: 'Stream real-time vitals remotely through cloud routing endpoints.' }
              ].map(chan => (
                <div key={chan.type} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">{chan.icon}</div>
                      <h4 className="font-extrabold uppercase text-xs text-slate-900 dark:text-white leading-tight">{chan.name}</h4>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-relaxed">{chan.desc}</p>
                  </div>
                  
                  <button
                    onClick={() => handleConnect(chan.type as any)}
                    disabled={isConnecting !== null || arduino.connection.connected}
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:bg-slate-100 disabled:text-slate-350"
                  >
                    {isConnecting === chan.type ? 'Linking Connection...' : arduino.connection.connected ? 'Another Device Connected' : `Initiate ${chan.name.split(' ')[0]} Channel`}
                  </button>
                </div>
              ))}

              {/* WIFI connection controller specific card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl"><Wifi size={22} className="text-sky-500" /></div>
                    <h4 className="font-extrabold uppercase text-xs text-slate-900 dark:text-white leading-tight">WiFi Transponder Node</h4>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Router IP Endpoint Address</label>
                    <input 
                      type="text" 
                      value={wifiInput} 
                      onChange={e => setWifiInput(e.target.value)}
                      className="w-full bg-slate-50/50 border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleConnect('wifi')}
                  disabled={isConnecting !== null || arduino.connection.connected}
                  className="w-full bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:bg-slate-100"
                >
                  {isConnecting === 'wifi' ? 'Verifying Host...' : 'Authorize WiFi Bridge'}
                </button>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: REGISTER CLINICAL NODE ----------------- */}
      {showAddClinicianModal && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-md w-full p-6 sm:p-8 border border-slate-105 shadow-2xl relative overflow-hidden"
          >
            <button onClick={() => setShowAddClinicianModal(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-650"><X size={18} /></button>
            
            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-2">Register Transponder Node</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 leading-relaxed">Allocate network transponders and paging ports for clinical personnel.</p>
            
            <form onSubmit={handleAddClinicianSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Clinician Full Name</label>
                <input 
                  type="text" 
                  value={newClinician.name} 
                  onChange={e => setNewClinician(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-55 bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-bold outline-none"
                  placeholder="Innocent O."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Medical Role Specialty</label>
                <input 
                  type="text" 
                  value={newClinician.role} 
                  onChange={e => setNewClinician(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-slate-55 bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-bold outline-none"
                  placeholder="Chief Cardiologist"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Department</label>
                  <select 
                    value={newClinician.dept} 
                    onChange={e => setNewClinician(prev => ({ ...prev, dept: e.target.value }))}
                    className="w-full bg-slate-55 bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-bold outline-none"
                  >
                    <option value="cardio">Cardiology</option>
                    <option value="neuro">Neurology</option>
                    <option value="emergency">Emergency</option>
                    <option value="telehealth">Telehealth</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Location</label>
                  <input 
                    type="text" 
                    value={newClinician.location} 
                    onChange={e => setNewClinician(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-slate-55 bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-bold outline-none"
                    placeholder="Chamber 12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Telephone Pager</label>
                <input 
                  type="text" 
                  value={newClinician.contact} 
                  onChange={e => setNewClinician(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-full bg-slate-55 bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-bold outline-none"
                  placeholder="+2567..."
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl font-mono mt-4">Initialize Node Calibration</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ----------------- MODAL: DRAFT SOAP PATIENT REFERRAL ----------------- */}
      {showReferModal && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 border border-slate-105 shadow-2xl relative overflow-hidden"
          >
            <button onClick={() => setShowReferModal(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-650"><X size={18} /></button>
            
            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-2">Compile Secure SOAP Referral</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 leading-relaxed">Directly draft diagnostic presentation inside clinical SOAP registry standards.</p>
            
            <form onSubmit={handleSubmitSoapReferral} className="space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Patient System ID Code</label>
                  <input 
                    type="text" 
                    value={soapData.patientCode} 
                    onChange={e => setSoapData(prev => ({ ...prev, patientCode: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-bold outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Priority Protocol</label>
                  <select 
                    value={soapData.priority} 
                    onChange={e => setSoapData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-bold outline-none"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT Emergency</option>
                  </select>
                </div>
              </div>

              {/* Quick clinical vitals mapping */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border rounded-xl space-y-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Ward Vitals Handshake</span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1 text-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Temp (°C)</span>
                    <input type="text" value={soapData.temp} onChange={e => setSoapData(prev => ({ ...prev, temp: e.target.value }))} className="w-full text-center bg-white dark:bg-slate-900 border rounded-lg py-1.5 px-2 text-xs font-bold outline-none" />
                  </div>
                  <div className="space-y-1 text-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">BP</span>
                    <input type="text" value={soapData.bp} onChange={e => setSoapData(prev => ({ ...prev, bp: e.target.value }))} className="w-full text-center bg-white dark:bg-slate-900 border rounded-lg py-1.5 px-2 text-xs font-bold outline-none" />
                  </div>
                  <div className="space-y-1 text-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">HR (BPM)</span>
                    <input type="text" value={soapData.hr} onChange={e => setSoapData(prev => ({ ...prev, hr: e.target.value }))} className="w-full text-center bg-white dark:bg-slate-905 bg-white dark:bg-slate-900 border rounded-lg py-1.5 px-2 text-xs font-bold outline-none" />
                  </div>
                  <div className="space-y-1 text-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">SpO2 (%)</span>
                    <input type="text" value={soapData.spo2} onChange={e => setSoapData(prev => ({ ...prev, spo2: e.target.value }))} className="w-full text-center bg-white dark:bg-slate-905 bg-white dark:bg-slate-900 border rounded-lg py-1.5 px-2 text-xs font-bold outline-none" />
                  </div>
                </div>
              </div>

              {/* SOAP Body slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 uppercase">S (Subjective symptoms & complaints)</label>
                  <textarea value={soapData.subjective} onChange={e => setSoapData(prev => ({ ...prev, subjective: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-medium h-24 outline-none resize-none" placeholder="Patient reports continuous severe dry cough, retrosternal pain, high fever oscillations for 3 days." />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 uppercase font-mono">O (Objective physical findings / labs)</label>
                  <textarea value={soapData.objective} onChange={e => setSoapData(prev => ({ ...prev, objective: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-medium h-24 outline-none resize-none" placeholder="Hyperexcursions observed. Auscultations show bronchial breath sounds. Temperature stabilized on paracetamol." />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 uppercase">A (Assessment / differential diagnoses)</label>
                  <textarea value={soapData.assessment} onChange={e => setSoapData(prev => ({ ...prev, assessment: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-medium h-24 outline-none resize-none" placeholder="Suspected severe lobar pneumonia, secondary diagnostic rule out: tuberculosis." />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 uppercase">P (Plan / immediate clinical instructions)</label>
                  <textarea value={soapData.plan} onChange={e => setSoapData(prev => ({ ...prev, plan: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-2 px-3 text-xs font-medium h-24 outline-none resize-none" placeholder="Initiate standard MoH lobar pneumonia care bundle. Arrange sputum samples immediately. Monitor oxygenation curves." />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl font-mono mt-4">Route SOAP Handover Payload</button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
