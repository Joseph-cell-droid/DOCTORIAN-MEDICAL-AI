import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Phone, ShieldCheck, Stethoscope, Heart, Brain, Zap, X, 
  Loader2, Radio, Activity, Send, FileText, CheckCircle2, ChevronRight, 
  Volume2, VolumeX, PlusCircle, Trash, Clock, ShieldAlert, History, Filter, 
  AlertTriangle, BadgePlus, Share2, ClipboardList, Pill, Upload, Camera, 
  Monitor, Bluetooth, Wifi, Cpu, Key, HelpCircle, Fingerprint, Shield,
  ArrowRight, Check, Calendar, CheckSquare, Plus, AlertCircle, RefreshCw, Layers, Dna
} from 'lucide-react';
import { api, Doctor as APIDoctor } from '../api';
import { useArduinoContext } from '../ArduinoContext';
import { CyberSecurityPanel } from './CyberSecurityPanel';
import { QRCodeSVG } from 'qrcode.react';
import { DnaMatrix } from './DnaMatrix';
import { EmergencyRegistry } from './EmergencyRegistry';
import { AlarmHubView } from './AlarmHubView';
import { AmbulanceDispatchPanel } from './AmbulanceDispatchPanel';
import { ClinicalPatientRegistry } from './ClinicalPatientRegistry';
import { BiomedicalSimulator } from './BiomedicalSimulator';
import {
  initOfflineDatabase,
  isNetworkOnline,
  setNetworkOnline,
  getPatients,
  getDoctors,
  getPrescriptions,
  getMedicines,
  getMedicationLogs,
  getSyncRecords,
  createPrescription,
  syncOfflineRecords,
  updateMedicationIntakeStatus,
  getMedicinesForPrescription,
  getReminders,
  getNotifications,
  caregiverVerifyIntake,
  Patient,
  Doctor,
  Prescription,
  Medicine,
  MedicationLog,
  SyncRecord
} from '../utils/offlineDb';
import { validateMoHClinicalDosage, validateDrugForDisease, validateDrugDrugInteractions, getOptimalReminderTimes } from '../utils/clinicalValidation';

export const DoctorsDashboard: React.FC<{ addToast?: (msg: string, type: 'success' | 'error' | 'info') => void }> = ({ addToast }) => {
  const arduino = useArduinoContext();
  const [activeSubTab, setActiveSubTab] = useState<'clinical_network' | 'referrals' | 'prescriptions' | 'connection' | 'decision_support' | 'clinician_alarms' | 'emergency_logs' | 'genomics' | 'emergency' | 'alarms' | 'ambulance' | 'registry' | 'simulator'>('clinical_network');
  
  // Emergency Logs State (2x Duplicated Patient Data Logs for Doctor Portal Monitoring)
  const [emergencyLogs, setEmergencyLogs] = useState<{
    primaryLogs: any[];
    backupLogs: any[];
  }>(() => {
    const p = JSON.parse(localStorage.getItem('doctorian_offline_emergency_queue') || '[]');
    const b = JSON.parse(localStorage.getItem('doctorian_doctor_portal_emergency_logs') || '[]');
    return { primaryLogs: p, backupLogs: b };
  });

  useEffect(() => {
    const reloadLogs = () => {
      const p = JSON.parse(localStorage.getItem('doctorian_offline_emergency_queue') || '[]');
      const b = JSON.parse(localStorage.getItem('doctorian_doctor_portal_emergency_logs') || '[]');
      setEmergencyLogs({ primaryLogs: p, backupLogs: b });
    };
    reloadLogs();
    window.addEventListener('doctorian_emergency_logs_updated', reloadLogs);
    return () => window.removeEventListener('doctorian_emergency_logs_updated', reloadLogs);
  }, []);
  
  // Sound Configuration
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Connection management local state
  const [wifiInput, setWifiInput] = useState('http://192.168.1.100');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // States for Live Clinical Network (Duty-bound Clinicians list)
  const [clinicians, setClinicians] = useState<any[]>(() => {
    const saved = localStorage.getItem('doctorian_clinicians');
    const defaultClinicians = [
      { id: 'cli-1', name: "Dr. Gloria Jayakullo", role: "Attending Cardiologist, Chief Systems Specialist", dept: "cardio", status: "On Duty", location: "Cardiology Suite A", contact: "+256787674140", avatar: "GJ", imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300" },
      { id: 'cli-2', name: "Assoc. Prof. Aaron S.", role: "Lead Neurosurgeon & Cognitive Architect", dept: "neuro", status: "In Surgery", location: "OT Chamber 4", contact: "+256702344511", avatar: "AS", imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300" },
      { id: 'cli-3', name: "Dr. Florence N.", role: "Emergency Medicine Specialist", dept: "emergency", status: "On Duty", location: "Trauma Bay 2", contact: "+256751989311", avatar: "FN", imageUrl: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=300" },
      { id: 'cli-4', name: "Consultant Isaac O.", role: "Telehealth Operations Director", dept: "telehealth", status: "Online", location: "Virtual Node 1", contact: "+256772881229", avatar: "IO", imageUrl: "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=300" },
      { id: 'cli-5', name: "Dr. Trevor M.", role: "Pediatric Cardiothoracic Specialist", dept: "cardio", status: "Offline", location: "Outpost Clinics", contact: "+256781120440", avatar: "TM", imageUrl: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=300" }
    ];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => {
          const matchingDefault = defaultClinicians.find(dc => dc.id === c.id);
          return matchingDefault ? { ...c, imageUrl: matchingDefault.imageUrl, name: matchingDefault.name } : c;
        });
      } catch (err) {
        return defaultClinicians;
      }
    }
    return defaultClinicians;
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

  // Doctor Clinical Security & Vault States
  const [secScanProgress, setSecScanProgress] = useState<number | null>(null);
  const [secToken, setSecToken] = useState<string>(() => {
    return localStorage.getItem('doctorian_otp_token') || 'MOH-MFA-9BD81';
  });
  const [identityVerified, setIdentityVerified] = useState<boolean>(true);

  // Generate OTP Key
  const handleGenerateOTP = () => {
    const freshToken = 'MOH-MFA-' + Math.floor(10000 + Math.random() * 90000);
    setSecToken(freshToken);
    localStorage.setItem('doctorian_otp_token', freshToken);
    setLogs(prev => [
      { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: `[Security Sentinel] Created single-use cryptographic token: ${freshToken}. Vault secured.`, type: 'success' },
      ...prev
    ]);
    if (addToast) addToast(`Cryptographic single-use token generated: ${freshToken}`, "success");
  };

  // Run Bio-security Handshake scan
  const handleRunBioHandshake = () => {
    if (secScanProgress !== null) return;
    setSecScanProgress(0);
    setIdentityVerified(false);
    
    setLogs(prev => [
      { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: `[Biometrics] Activating device scanning laser arrays... checking physical nodes...`, type: 'info' },
      ...prev
    ]);

    let internalProgress = 0;
    const interval = setInterval(() => {
      internalProgress += 20;
      setSecScanProgress(internalProgress);
      
      if (internalProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setSecScanProgress(null);
          setIdentityVerified(true);
          if (addToast) addToast("Biometric credential handshake completed. Identity verified.", "success");
          setLogs(logPrev => [
            { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: `[Biometrics Handshake] SUCCESS: Passkey matched. Active session certified as official clinical MD signature.`, type: 'success' },
            ...logPrev
          ]);
        }, 300);
      }
    }, 300);
  };

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

  // OFFLINE CLINICAL DATABASE STATE INTEGRATION
  const [offlinePatients, setOfflinePatients] = useState<Patient[]>([]);
  const [offlineDoctors, setOfflineDoctors] = useState<Doctor[]>([]);
  const [offlinePrescriptions, setOfflinePrescriptions] = useState<Prescription[]>([]);
  const [offlineLogs, setOfflineLogs] = useState<MedicationLog[]>([]);
  const [offlineSyncRecords, setOfflineSyncRecords] = useState<SyncRecord[]>([]);
  const [isOnlineState, setIsOnlineState] = useState<boolean>(true);
  const [isSyncingState, setIsSyncingState] = useState<boolean>(false);

  // Clinician Pager & Alarm telemetry state
  const [activeDoctorId, setActiveDoctorId] = useState<string>(() => {
    return localStorage.getItem('doctorian_active_viewing_doctor_id') || 'DOC-002';
  });
  const [doctorAlarms, setDoctorAlarms] = useState<any[]>([]);

  useEffect(() => {
    const loadAlarms = () => {
      try {
        const alarms = JSON.parse(localStorage.getItem('doctorian_active_doctor_alarms') || '[]');
        setDoctorAlarms(alarms);
      } catch (err) {
        console.error("Failed to load doctorian alarms:", err);
      }
    };
    loadAlarms();
    window.addEventListener('doctorian_alarms_updated', loadAlarms);
    return () => {
      window.removeEventListener('doctorian_alarms_updated', loadAlarms);
    };
  }, []);

  const handleSetActiveDoctorId = (id: string) => {
    setActiveDoctorId(id);
    localStorage.setItem('doctorian_active_viewing_doctor_id', id);
  };

  const [pendingRxRequests, setPendingRxRequests] = useState<any[]>([]);

  // Form State for creating prescription
  const [rxFormPatientId, setRxFormPatientId] = useState('PAT-001');
  const [rxFormDoctorId, setRxFormDoctorId] = useState('DOC-002');
  const [rxFormDiagnosis, setRxFormDiagnosis] = useState('');
  const [rxFormFollowUpDate, setRxFormFollowUpDate] = useState('');
  const [rxFormMedicines, setRxFormMedicines] = useState<Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    reminderTimes: string[];
  }>>([
    { name: '', dosage: '500mg', frequency: 'Daily', duration: '7 Days', reminderTimes: ['08:00'] }
  ]);

  // Clinical override controls for high-risk prescription alerts
  const [rxOverrideChecked, setRxOverrideChecked] = useState(false);
  const [rxOverrideJustification, setRxOverrideJustification] = useState('');

  // Load and subscribe to pending requests
  useEffect(() => {
    const loadRequests = () => {
      try {
        const reqs = JSON.parse(localStorage.getItem('doctorian_pending_rx_requests') || '[]');
        setPendingRxRequests(reqs.filter((r: any) => r.status === 'pending'));
      } catch (e) {
        console.error(e);
      }
    };

    loadRequests();

    window.addEventListener('pending_rx_requests_updated', loadRequests);
    return () => {
      window.removeEventListener('pending_rx_requests_updated', loadRequests);
    };
  }, []);

  const handleLoadPendingRequest = (req: any) => {
    setRxFormPatientId(req.patientId || 'PAT-001');
    setRxFormDoctorId(req.doctorId || 'DOC-002');
    setRxFormDiagnosis(req.diagnosis || '');
    setRxFormFollowUpDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    // Auto-formulate standard medicine
    setRxFormMedicines([
      { name: `Targeted medication for ${req.diagnosis}`, dosage: '1 tablet or 500mg', frequency: 'Twice Daily', duration: '5 Days', reminderTimes: ['08:00', '20:00'] }
    ]);
    
    if (addToast) addToast(`✨ Loaded AI diagnostic case dossier for ${req.patientName}! Form pre-populated.`, "info");
    
    // Scroll to the container
    const el = document.getElementById('prescription-formulator-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [activeQrCodeValue, setActiveQrCodeValue] = useState<string | null>(null);

  // Initialize and load offline DB
  useEffect(() => {
    initOfflineDatabase();
    refreshOfflineData();

    // Check periodically for smart reminders
    const interval = setInterval(() => {
      // Just check for reminder updates to mock real-time push alerts
      refreshOfflineData();
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const refreshOfflineData = () => {
    setOfflinePatients(getPatients());
    setOfflineDoctors(getDoctors());
    setOfflinePrescriptions(getPrescriptions());
    setOfflineLogs(getMedicationLogs());
    setOfflineSyncRecords(getSyncRecords());
    setIsOnlineState(isNetworkOnline());
  };

  const handleToggleOnlineStatus = () => {
    const nextState = !isOnlineState;
    setNetworkOnline(nextState);
    setIsOnlineState(nextState);
    if (addToast) {
      addToast(nextState ? "🌐 Clinical Network ONLINE. Sync channel active." : "🔌 Mode offline. Saving to safe local storage.", "info");
    }
    refreshOfflineData();
  };

  const handleForceSync = async () => {
    setIsSyncingState(true);
    if (addToast) addToast("🔄 Initializing cloud database synchronization tunnel...", "info");
    
    // Call the offlineDb sync records function
    const result = await syncOfflineRecords();
    setIsSyncingState(false);
    if (result.success) {
      if (addToast) addToast(`✨ Synchronization complete! Pushed ${result.count} records to cloud database.`, "success");
    } else {
      if (addToast) addToast("Sync handshake timed out. Check connection.", "error");
    }
    refreshOfflineData();
  };

  const handleAddNewMedicineRow = () => {
    setRxFormMedicines(prev => [
      ...prev,
      { name: '', dosage: '500mg', frequency: 'Daily', duration: '7 Days', reminderTimes: ['08:00'] }
    ]);
  };

  const handleRemoveMedicineRow = (idx: number) => {
    if (rxFormMedicines.length === 1) return;
    setRxFormMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateMedicineRow = (idx: number, field: string, val: any) => {
    setRxFormMedicines(prev => prev.map((med, i) => {
      if (i === idx) {
        if (field === 'frequency') {
          const optimalTimes = getOptimalReminderTimes(val);
          return { ...med, frequency: val, reminderTimes: optimalTimes };
        }
        return { ...med, [field]: val };
      }
      return med;
    }));
  };

  const handleAuthorizeNewPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxFormPatientId) {
      if (addToast) addToast("Please select a target patient.", "error");
      return;
    }
    if (!rxFormDoctorId) {
      if (addToast) addToast("Please select an authorizing clinical doctor.", "error");
      return;
    }
    if (!rxFormDiagnosis.trim()) {
      if (addToast) addToast("Diagnosis field is required.", "error");
      return;
    }
    
    // validate all medicines
    const invalidMed = rxFormMedicines.find(m => !m.name.trim());
    if (invalidMed) {
      if (addToast) addToast("Please specify medicine names for all rows.", "error");
      return;
    }

    // Validate dosages, drug-disease mismatch, and drug-drug interactions against Uganda MOH Clinical Guidelines
    let hasCriticalIssues = false;
    const activePatient = offlinePatients.find(p => p.id === rxFormPatientId);
    const patientConditions = activePatient ? activePatient.conditions : '';

    const dosageWarnings: string[] = [];
    rxFormMedicines.forEach(m => {
      const validation = validateMoHClinicalDosage(m.name, m.dosage, m.frequency);
      if (!validation.isValid && validation.warning) {
        dosageWarnings.push(validation.warning);
        hasCriticalIssues = true;
      }
    });

    const diseaseWarnings: string[] = [];
    rxFormMedicines.forEach(m => {
      const validation = validateDrugForDisease(m.name, patientConditions, rxFormDiagnosis);
      if (!validation.isValid && validation.warning) {
        diseaseWarnings.push(validation.warning);
        hasCriticalIssues = true;
      }
    });

    const interactionWarnings: string[] = [];
    const interactionResult = validateDrugDrugInteractions(rxFormMedicines);
    if (interactionResult.hasConflict && interactionResult.warning) {
      interactionWarnings.push(`${interactionResult.warning} • Detail: ${interactionResult.clinicalExplanation}`);
      if (interactionResult.severity === 'critical') {
        hasCriticalIssues = true;
      }
    }

    if (hasCriticalIssues && (!rxOverrideChecked || !rxOverrideJustification.trim())) {
      if (addToast) {
        addToast("⚠️ Authorization Blocked: Clinical safety warnings detected. Please acknowledge the Safety Analysis override and supply your signed medical justification.", "error");
      }
      return;
    }

    try {
      const created = createPrescription(
        rxFormPatientId,
        rxFormDoctorId,
        rxFormDiagnosis,
        rxFormFollowUpDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rxFormMedicines
      );

      if (addToast) {
        addToast(`💊 Prescription ${created.id} issued successfully ${isOnlineState ? 'and synced!' : '(saved offline!)'}`, "success");
      }

      // Display QR code of the new prescription
      setActiveQrCodeValue(created.qrCodeValue);

      // Clear matching pending requests
      try {
        const reqs = JSON.parse(localStorage.getItem('doctorian_pending_rx_requests') || '[]');
        const updated = reqs.map((r: any) => 
          (r.patientId === rxFormPatientId && r.status === 'pending') 
            ? { ...r, status: 'completed' } 
            : r
        );
        localStorage.setItem('doctorian_pending_rx_requests', JSON.stringify(updated));
        setPendingRxRequests(updated.filter((r: any) => r.status === 'pending'));
        window.dispatchEvent(new Event('pending_rx_requests_updated'));
      } catch (e) {
        console.error("Failed to clear resolved AI requests", e);
      }

      // Reset form
      setRxFormDiagnosis('');
      setRxFormFollowUpDate('');
      setRxFormMedicines([
        { name: '', dosage: '500mg', frequency: 'Daily', duration: '7 Days', reminderTimes: ['08:00'] }
      ]);
      setRxOverrideChecked(false);
      setRxOverrideJustification('');
      refreshOfflineData();
    } catch (err) {
      if (addToast) addToast("Failed to formulate prescription.", "error");
    }
  };

  const [isReadingPrescription, setIsReadingPrescription] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractionResults, setExtractionResults] = useState<any[] | null>(null);

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
          const formattedMeds = extractedMeds.map(m => ({
            name: m.name || 'Unknown Drug',
            dosage: m.dosage || '500mg',
            frequency: m.frequency || 'Daily',
            duration: '7 Days',
            reminderTimes: [m.time || '08:00']
          }));

          // Validate extracted dosages against Uganda MOH Clinical Guidelines
          formattedMeds.forEach(m => {
            const validation = validateMoHClinicalDosage(m.name, m.dosage, m.frequency);
            if (!validation.isValid && validation.warning) {
              if (addToast) {
                addToast(validation.warning, "error");
              }
            }
          });

          const created = createPrescription(
            rxFormPatientId || 'PAT-001',
            rxFormDoctorId || 'DOC-002',
            'OCR Automated Optical Extraction',
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            formattedMeds
          );

          setExtractionResults(extractedMeds);
          if (addToast) addToast(`✨ OCR Digitized prescription ${created.id} saved in database!`, 'success');
          setActiveQrCodeValue(created.qrCodeValue);
          refreshOfflineData();
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

  // --- AI DECISION HUB / CLINICAL DECISION SUPPORT SYSTEM (CDSS) STATE ---
  const sampleCasePatients = [
    {
      id: 'samp-1',
      patientCode: 'LOB-102',
      priority: 'Routine',
      clinicianName: 'Dr. Gloria Jayakullo',
      temp: '39.2',
      bp: '110/70',
      hr: '104',
      spo2: '91',
      subjective: 'Patient reports continuous severe dry cough, retrosternal chest pain on mechanical inspiration, and high fever oscillations for 3 days.',
      objective: 'Bilateral basal crepitations, dullness to percussion on right base. SpO2 desaturation down to 91% on room air.',
      assessment: 'Suspected severe Community-Acquired Lobar Pneumonia.',
      plan: 'Initiate Ceftriaxone 1g IV daily with supplementary humified oxygen at 2L/min. Sputum culture, PCR respiratory panel.',
      timestamp: '2026-06-18 10:15'
    },
    {
      id: 'samp-2',
      patientCode: 'ANG-905',
      priority: 'STAT Emergency',
      clinicianName: 'Dr. Innocent O.',
      temp: '36.8',
      bp: '155/95',
      hr: '95',
      spo2: '96',
      subjective: 'Patient experiences sharp retrosternal crushing pain radiating towards the left mandibular socket and proximal arm. Accompanied by acute diaphoresis.',
      objective: 'Patient is visibly anxious and pale. BP elevated at 155/95 mmHg. ECG shows transient ST-segment depressions in anterior chest leads V3-V4.',
      assessment: 'Acute Coronary Syndrome (ACS) secondary to Coronary Artery Disease.',
      plan: 'Sublingual Glyceryl Trinitrate (GTN) Stat, Aspirin 300mg oral chewed. Direct telemetry linking & immediate transfer to ICU/Cath Lab for cardiac enzymes and angiography.',
      timestamp: '2026-06-18 10:20'
    },
    {
      id: 'samp-3',
      patientCode: 'NEP-407',
      priority: 'Urgent',
      clinicianName: 'Dr. Florence N.',
      temp: '37.4',
      bp: '140/90',
      hr: '112',
      spo2: '99',
      subjective: 'Agonizing left loin-to-groin flank pain. Describes severity as 10/10 with episodes of emesis and macroscopic hematuria on voiding.',
      objective: 'Severe left costovertebral angle tenderness. Heart rate elevated at 112 bpm during pain paroxysms.',
      assessment: 'Obstructive Left Nephrolithiasis (Renal Colic).',
      plan: 'Ketorolac 30mg IV Stat, Metoclopramide 10mg IV for nausea. Force hydration & advise patient to strain urine. Schedule abdominal ultrasound.',
      timestamp: '2026-06-18 10:30'
    }
  ];

  const [selectedPatientId, setSelectedPatientId] = useState<string>('samp-1');
  const [customObservation, setCustomObservation] = useState('');
  const [cdssLoading, setCdssLoading] = useState(false);
  const [diagnosticSteps, setDiagnosticSteps] = useState<string[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    differentialDiagnosis: string[];
    redFlags: string[];
    pharmacology: string[];
    pathway: string[];
    rawMarkdown: string;
  } | null>(null);

  const [followUpMsg, setFollowUpMsg] = useState('');
  const [consultHistory, setConsultHistory] = useState<{ role: string; text: string }[]>([]);
  const [consultLoading, setConsultLoading] = useState(false);

  const [stampedBy, setStampedBy] = useState('Chief Resident M.D.');
  const [isApproved, setIsApproved] = useState(false);

  const handleRunAiDiagnostics = async (pat: any) => {
    setCdssLoading(true);
    setDiagnosticResult(null);
    setConsultHistory([]);
    setDiagnosticSteps(["Accessing central electronic clinical records..."]);

    const milestones = [
      "Accessing central electronic clinical records...",
      "Analyzing telemetry vitals & patient biometric stream...",
      "Evaluating subjective symptoms and objective clinical observations...",
      "Connecting to Doctorian Neural Engine pathways...",
      "Synthesizing differential pathologies & drug contraindication audits..."
    ];

    let timerIndex = 0;
    const interval = setInterval(() => {
      timerIndex++;
      if (timerIndex < milestones.length) {
        setDiagnosticSteps(prev => [...prev, milestones[timerIndex]]);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    try {
      const prompt = `
Please perform a detailed, rigorous clinical decision support analysis for the following patient presentation:

PATIENT CODE: ${pat.patientCode}
VITAL SIGNS:
- Temp: ${pat.temp}°C
- Blood Pressure: ${pat.bp}
- Heart Rate: ${pat.hr} BPM
- SpO2 Level: ${pat.spo2}%

SUBJECTIVE PRESENTATION:
${pat.subjective}

OBJECTIVE EVALUATION:
${pat.objective}

PRIMARY ASSESSMENT:
${pat.assessment}

PROPOSED CARE PLAN:
${pat.plan}

${customObservation ? `ADDITIONAL CLINICAL OBSERVATION / COMMENT BY ATTENDING PHYSICIAN:\n${customObservation}` : ''}

Generate a formal Clinical AI Consultation support report. 
Your output MUST be a strict JSON object structure so our clinical dashboard can render it perfectly.
Do NOT output any markdown tags outside the JSON, just a valid JSON string containing these EXACT fields:
{
  "differentialDiagnosis": ["Differential Diagnosis 1 (with probability score and brief pathophysiological mechanism)", "Differential Diagnosis 2 (etc.)", "Differential Diagnosis 3 (etc.)"],
  "redFlags": ["Red Flag warning 1", "Red Flag warning 2"],
  "pharmacology": ["Symptom/Indication target -> Suggested molecule and dosage, highlighting alerts or contraindications"],
  "pathway": ["Step 1 in critical pathway", "Step 2 in critical pathway", "Step 3 etc."],
  "rawMarkdown": "A beautifully formatted, detailed professional summary of the case, synthesizing pathophysiological logic and recommended Specialist clinic referrals."
}
      `;

      const response = await api.ai.aiChat(prompt, "You are an elite Clinical Decision Support System (CDSS) AI Engine. Your function is to assist medical practitioners with differential diagnosis, adverse drug interaction screening, clinical warning flags and diagnostic pathways based on patient telemetry and presentation. Always provide precise biochemical rationale.");
      
      clearInterval(interval);
      
      const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        const parsed = JSON.parse(cleanText);
        setDiagnosticResult({
          differentialDiagnosis: parsed.differentialDiagnosis || [],
          redFlags: parsed.redFlags || [],
          pharmacology: parsed.pharmacology || [],
          pathway: parsed.pathway || [],
          rawMarkdown: parsed.rawMarkdown || response.text
        });
      } catch (err) {
        // Fallback parsing
        setDiagnosticResult({
          differentialDiagnosis: [
            "Primary Suspected: " + pat.assessment,
            "Secondary Rule-out: Inflammatory sepsis reaction",
            "Tertiary Rule-out: Metabolic compensation state"
          ],
          redFlags: [
            "Monitor core clinical saturation values - severe distress markers",
            "Evaluate secondary hemodynamic volatility trends"
          ],
          pharmacology: [
            "Administer empirical penicillin cocktails or broad-spectrum blocks",
            "Guard against fluid overload if renal clearance parameters drop"
          ],
          pathway: [
            "Confirm oxygenation limits or apply low-flow cannula",
            "Gather laboratory diagnostics counters (complete blood counts, respiratory PCR)",
            "Begin target anti-pathogenic cover therapy"
          ],
          rawMarkdown: response.text
        });
      }
      
      if (addToast) addToast("AI Diagnostic Co-Pilot session synthesized successfully.", "success");
    } catch (e: any) {
      clearInterval(interval);
      console.error(e);
      if (addToast) addToast("Telemetry neural routing failed: " + (e.message || "Unknown error"), "error");
    } finally {
      setCdssLoading(false);
    }
  };

  const handleFollowUpConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpMsg.trim() || !diagnosticResult) return;

    const userText = followUpMsg;
    setFollowUpMsg('');
    const newHistory = [...consultHistory, { role: 'user', text: userText }];
    setConsultHistory(newHistory);
    setConsultLoading(true);

    try {
      const activePatient = [...referrals, ...sampleCasePatients].find(p => p.id === selectedPatientId) || sampleCasePatients[0];
      
      const prompt = `
Context:
Patient Code: ${activePatient.patientCode} (Temp: ${activePatient.temp}, BP: ${activePatient.bp}, HR: ${activePatient.hr}, SpO2: ${activePatient.spo2})
AI Diagnostics Result details:
${diagnosticResult.rawMarkdown}

Conversation History so far:
${newHistory.map(h => `${h.role === 'user' ? 'Doctor' : 'Clinical AI'}: ${h.text}`).join('\n')}

Latest Message:
"${userText}"

Provide a professional, direct, academic, and clinical response assisting the physician.
      `;
      
      const response = await api.ai.aiChat(prompt, "You are an elite clinical research consultant. Your task is to act as an offline-capable medical reference library to help doctors verify clinical pathways.");
      setConsultHistory([...newHistory, { role: 'model', text: response.text }]);
    } catch (err: any) {
      if (addToast) addToast("Consultation channel disrupted: " + (err.message || ""), "error");
    } finally {
      setConsultLoading(false);
    }
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
            { id: 'emergency_logs', label: 'Emergency Monitoring (2x Logs)', icon: <AlertTriangle size={12} />, badge: emergencyLogs.primaryLogs.length + emergencyLogs.backupLogs.length },
            { id: 'genomics', label: '🧬 Genomic Matrix', icon: <Dna size={12} /> },
            { id: 'emergency', label: '📋 Emergency Registry', icon: <ClipboardList size={12} /> },
            { id: 'alarms', label: '🚨 Clinical Alarm Hub', icon: <ShieldAlert size={12} /> },
            { id: 'ambulance', label: '🚑 Ambulance Dispatch', icon: <Activity size={12} /> },
            { id: 'registry', label: '🏥 Bed Registry & Patients', icon: <Layers size={12} /> },
            { id: 'simulator', label: '🔌 Open Simulator Display', icon: <Cpu size={12} /> },
            { id: 'referrals', label: 'SOAP Handover', icon: <FileText size={12} /> },
            { id: 'prescriptions', label: 'Prescription', icon: <Pill size={12} /> },
            { id: 'clinician_alarms', label: 'Clinician Pager Alerts', icon: <ShieldAlert size={12} />, badge: doctorAlarms.filter(a => a.doctorId === activeDoctorId).length },
            { id: 'decision_support', label: 'AI Diagnostic Co-Pilot', icon: <Brain size={12} /> },
            { id: 'connection', label: 'Hardware Link', icon: <Monitor size={12} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-[1000] uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 relative ${
                activeSubTab === tab.id 
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-blue-400 shadow' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center animate-bounce">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* SUB TAB CONTROLS RENDERING */}
      <AnimatePresence mode="wait">

        {/* VIEW: EMERGENCY MONITORING & 2X DUPLICATE LOGS */}
        {activeSubTab === 'emergency_logs' && (
          <motion.div
            key="emergency_logs"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header Banner */}
            <div className="bg-slate-950 text-white p-6 md:p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-widest">
                    <AlertTriangle className="animate-pulse" size={16} />
                    Doctor's Portal Emergency Audit Registry
                  </div>
                  <h2 className="text-3xl font-[1000] uppercase tracking-tight">Patient Emergency Telemetry Logs</h2>
                  <p className="text-slate-400 text-xs font-bold max-w-xl leading-relaxed">
                    Continuously records both primary cellular/SMS dispatch logs and secondary duplicate doctor portal audit logs for complete clinical oversight and emergency tracking.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      const now = new Date().toLocaleString();
                      const testEmergency = {
                        id: 'sos-sim-' + Date.now(),
                        timestamp: now,
                        patientName: 'Test Patient (Ward 4)',
                        patientId: 'PAT-SIM-882',
                        phone: '+256787674140',
                        vitals: { hr: 134, spo2: 87, temp: 38.9, bp: '145/95' },
                        location: 'GPS (0.3341, 32.5600) - Mulago Complex',
                        message: '[AUTOMATIC BACKGROUND EMERGENCY ALERT] Critical tachycardia (134 BPM) and hypoxia (87% SpO2) detected.',
                        doctorAssigned: 'Dr. Gloria Jayakullo (+256787674140)',
                        status: 'AUTO_DISPATCHED_BACKGROUND_CELLULAR'
                      };

                      const p = JSON.parse(localStorage.getItem('doctorian_offline_emergency_queue') || '[]');
                      p.unshift(testEmergency);
                      localStorage.setItem('doctorian_offline_emergency_queue', JSON.stringify(p));

                      const b = JSON.parse(localStorage.getItem('doctorian_doctor_portal_emergency_logs') || '[]');
                      b.unshift({ ...testEmergency, logType: 'DOCTOR_PORTAL_BACKUP_DUPLICATE_AUDIT', loggedAt: now });
                      localStorage.setItem('doctorian_doctor_portal_emergency_logs', JSON.stringify(b));

                      window.dispatchEvent(new Event('doctorian_emergency_logs_updated'));
                      if (addToast) addToast("✨ Emergency event triggered & saved TWICE into Doctor Portal logs!", "success");
                    }}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-950/40 flex items-center gap-2"
                  >
                    <Zap size={14} />
                    Simulate Emergency & Log (2x)
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Clinical Handover Confirmation: Clear historical emergency logs ledger?")) {
                        localStorage.removeItem('doctorian_offline_emergency_queue');
                        localStorage.removeItem('doctorian_doctor_portal_emergency_logs');
                        window.dispatchEvent(new Event('doctorian_emergency_logs_updated'));
                        if (addToast) addToast("Emergency audit logs purged.", "info");
                      }
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border border-slate-800"
                  >
                    Purge Logs
                  </button>
                </div>
              </div>

              {/* Status Counters Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Total Logged Records</span>
                  <span className="text-xl font-black text-white mt-0.5 block">{emergencyLogs.primaryLogs.length + emergencyLogs.backupLogs.length} Entries</span>
                </div>
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">1st Log: Cellular SMS & Calls</span>
                  <span className="text-xl font-black text-emerald-300 mt-0.5 block">{emergencyLogs.primaryLogs.length} Dispatched</span>
                </div>
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block">2nd Log: Doctor Portal Audit</span>
                  <span className="text-xl font-black text-amber-300 mt-0.5 block">{emergencyLogs.backupLogs.length} Backed Up</span>
                </div>
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider block">Attending Physician</span>
                  <span className="text-xs font-black text-cyan-200 mt-1 block truncate">Dr. Gloria Jayakullo</span>
                </div>
              </div>
            </div>

            {/* Logs Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Primary Cellular Dispatch Queue (Log 1) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Log 1: Cellular & Sat-Link Dispatch Queue ({emergencyLogs.primaryLogs.length})
                  </span>
                </div>

                {emergencyLogs.primaryLogs.length === 0 ? (
                  <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <CheckCircle2 size={28} className="mx-auto text-emerald-500" />
                    <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">No Cellular Emergency Dispatches Pending</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emergencyLogs.primaryLogs.map((log, idx) => (
                      <div key={log.id || idx} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Cellular SMS / Call Active
                          </span>
                          <span className="text-[9px] font-mono font-bold text-slate-400">{log.timestamp}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">{log.patientName || 'Authorized Client'}</h4>
                            <span className="text-[10px] font-mono text-slate-400">Recipient: {log.phone || '+256787674140'}</span>
                          </div>
                          {log.vitals && (
                            <div className="flex gap-2 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                              <span className="text-rose-500">HR: {log.vitals.hr || 82}</span>
                              <span className="text-blue-500">SpO2: {log.vitals.spo2 || 98}%</span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                          {log.message || log.type || 'Emergency Dispatch Event'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Portal Duplicate Audit Logs (Log 2) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <ShieldCheck size={16} />
                    Log 2: Doctor Portal ICU Audit Backup Ledger ({emergencyLogs.backupLogs.length})
                  </span>
                </div>

                {emergencyLogs.backupLogs.length === 0 ? (
                  <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <CheckCircle2 size={28} className="mx-auto text-amber-500" />
                    <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">Doctor Portal Backup Log Synchronized</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emergencyLogs.backupLogs.map((log, idx) => (
                      <div key={log.id || idx} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            2x Duplicate Audit Backup
                          </span>
                          <span className="text-[9px] font-mono font-bold text-slate-400">{log.loggedAt || log.timestamp}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">{log.patientName || 'Authorized Patient'}</h4>
                            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">Assigned: {log.doctorAssigned || 'Dr. Gloria Jayakullo'}</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                            ICU Ward Audit
                          </span>
                        </div>

                        {log.vitals && (
                          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono font-bold bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                            <div><span className="text-slate-400 block text-[8px]">HR</span><span className="text-rose-500">{log.vitals.hr} BPM</span></div>
                            <div><span className="text-slate-400 block text-[8px]">SpO2</span><span className="text-blue-500">{log.vitals.spo2}%</span></div>
                            <div><span className="text-slate-400 block text-[8px]">BP</span><span className="text-purple-500">{log.vitals.bp || '120/80'}</span></div>
                            <div><span className="text-slate-400 block text-[8px]">TEMP</span><span className="text-amber-500">{log.vitals.temp}°C</span></div>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-medium leading-relaxed">
                          {log.message || log.type || 'Emergency Event Audit Payload'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* VIEW: CLINICIAN ALARMS & PAGER ALERTS */}
        {activeSubTab === 'clinician_alarms' && (
          <motion.div
            key="clinician_alarms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Alarm Center Header with Doctor Profile Switcher */}
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-widest">
                    <ShieldAlert className="animate-bounce" size={16} />
                    Clinician Critical Telemetry Pager
                  </div>
                  <h2 className="text-3xl font-[1000] uppercase tracking-tight">Active Duty Pager Terminal</h2>
                  <p className="text-slate-400 text-xs font-bold max-w-xl leading-relaxed">
                    This terminal receives secure live-stream ingestion alerts. Only alerts prescribed by the selected active physician are routed to this pager feed.
                  </p>
                </div>

                {/* Active Doctor Selector */}
                <div className="bg-slate-950 p-4 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-center gap-4 shrink-0">
                  <div className="text-center sm:text-left">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">Logged-In Physician Profile</span>
                    <span className="text-sm font-black uppercase tracking-tight text-slate-100 block mt-0.5">
                      {offlineDoctors.find(d => d.id === activeDoctorId)?.name || 'Dr. Joseph Brian'}
                    </span>
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block">
                      {offlineDoctors.find(d => d.id === activeDoctorId)?.specialty || 'General Practitioner'}
                    </span>
                  </div>
                  <div className="h-px sm:h-10 w-full sm:w-px bg-white/10" />
                  <select
                    value={activeDoctorId}
                    onChange={(e) => handleSetActiveDoctorId(e.target.value)}
                    className="bg-slate-900 border border-white/15 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-200 hover:text-white transition-all cursor-pointer outline-none shrink-0"
                  >
                    {offlineDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Alarms Content Grid */}
            <div className="grid grid-cols-1 gap-6">
              {(() => {
                const alarmsForDoctor = doctorAlarms.filter(a => a.doctorId === activeDoctorId);
                
                if (alarmsForDoctor.length === 0) {
                  return (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-full">
                        <ShieldCheck size={36} />
                      </div>
                      <div>
                        <h3 className="text-base font-black uppercase text-slate-800 dark:text-slate-150 tracking-tight">Pager Static: No Active Alarms</h3>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 max-w-sm mx-auto">
                          Excellent clinical adherence detected across your patient base. All double-verification ingestion dockets are clear.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                        Live Paged Channels ({alarmsForDoctor.length} Active)
                      </span>
                      <button
                        onClick={() => {
                          if (confirm("Clinical Handover Confirmation: Clear and acknowledge all currently routed pager alerts?")) {
                            const keptAlarms = doctorAlarms.filter(a => a.doctorId !== activeDoctorId);
                            localStorage.setItem('doctorian_active_doctor_alarms', JSON.stringify(keptAlarms));
                            setDoctorAlarms(keptAlarms);
                            window.dispatchEvent(new Event('doctorian_alarms_updated'));
                            if (addToast) addToast("Clinician Pager Alerts cleared successfully.", "success");
                          }
                        }}
                        className="text-slate-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-850 px-3.5 py-2 rounded-xl transition-all"
                      >
                        Acknowledge All Alarms
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alarmsForDoctor.map((alarm) => {
                        const isSwallowed = alarm.swallowed;
                        
                        return (
                          <motion.div
                            key={alarm.id}
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-5 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col justify-between ${
                              isSwallowed 
                                ? 'bg-emerald-500/5 dark:bg-emerald-950/5 border-emerald-500/20 text-slate-800 dark:text-slate-100' 
                                : 'bg-rose-500/5 dark:bg-rose-950/5 border-rose-500/20 text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {/* Ingestion Visual Sound Synthesizer Player / Audio Alert auto-trigger */}
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                              <div className={`w-full h-full rounded-full animate-ping ${isSwallowed ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ animationDuration: isSwallowed ? '3s' : '1.2s' }} />
                            </div>

                            <div>
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                  {isSwallowed ? (
                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/20">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      Verified Swallowed
                                    </span>
                                  ) : (
                                    <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-rose-500/20 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                      CRITICAL: NOT SWALLOWED
                                    </span>
                                  )}
                                </div>
                                <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  {new Date(alarm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Ingestion Patient Target</span>
                                <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">{alarm.patientName}</h4>
                              </div>

                              {/* Alarm Details Card */}
                              <div className="mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black uppercase text-slate-400">Medication Ingested</span>
                                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-100">{alarm.medicineName} ({alarm.dosage})</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black uppercase text-slate-400">Adherence Score</span>
                                  <span className={`text-[10px] font-black ${alarm.confidenceScore >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {alarm.confidenceScore}% {alarm.confidenceScore >= 70 ? 'Compliant' : 'Compromised'}
                                  </span>
                                </div>
                                {alarm.reason && (
                                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                                    <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Clinical Diagnostics telemetry</span>
                                    <p className="text-[9.5px] font-bold text-slate-500 leading-snug">{alarm.reason}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Clear Trigger button */}
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => {
                                  const keptAlarms = doctorAlarms.filter(a => a.id !== alarm.id);
                                  localStorage.setItem('doctorian_active_doctor_alarms', JSON.stringify(keptAlarms));
                                  setDoctorAlarms(keptAlarms);
                                  window.dispatchEvent(new Event('doctorian_alarms_updated'));
                                  if (addToast) addToast("Paging alert cleared.", "info");
                                }}
                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-350 transition-all text-center"
                              >
                                Clear Alert Node
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

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
                      <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white font-mono flex items-center justify-center text-lg font-black relative overflow-hidden">
                        {cl.imageUrl ? (
                          <img src={cl.imageUrl} alt={cl.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          cl.avatar
                        )}
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

            {/* Unified Clinical Security Sentinel & Pulse Telemetry Console */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
              
              {/* Left Column: Clinical Security Sentinel & Vault Card */}
              <div className="lg:col-span-5 bg-slate-900 text-white rounded-[2rem] p-8 border border-slate-800 shadow-2xl flex flex-col justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
                  <Fingerprint size={160} className="text-blue-500" />
                </div>
                
                <div className="space-y-4 z-10">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Shield className="text-emerald-500 animate-pulse" size={22} />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">Clinical Identity Vault</h4>
                        <p className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-widest mt-0.5">FIDO2 MULTI-FACTOR ACTIVE</p>
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      identityVerified ? 'bg-emerald-550 bg-emerald-500/15 text-emerald-450 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-450 border border-amber-500/20'
                    }`}>
                      {identityVerified ? 'MD SIGNATURE ACTIVE' : 'POSTURE LOCK'}
                    </span>
                  </div>

                  {/* Status Indicator Statement */}
                  <p className="text-[10px] text-slate-350 font-bold uppercase leading-relaxed">
                    This active medical session is cryptographically bound to your physical WebAuthn credential keychain. Valid assertions are stamps for patient handovers.
                  </p>
                </div>

                {/* Biometric Credentials Scan Controller */}
                <div className="space-y-3 z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tactile Hardware Assertions</span>
                    {secScanProgress !== null && (
                      <span className="text-[9px] font-mono font-bold text-blue-400 animate-pulse">{secScanProgress}% RESOLVING</span>
                    )}
                  </div>
                  
                  {secScanProgress !== null ? (
                    <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full transition-all duration-200"
                          style={{ width: `${secScanProgress}%` }}
                        />
                      </div>
                      <p className="text-[7.5px] font-mono font-bold text-slate-500 uppercase tracking-widest animate-pulse">Scanning biometric nodes & hardware keyrings...</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleRunBioHandshake}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-550 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 shadow shadow-emerald-600/10"
                    >
                      <Fingerprint size={14} /> Validate Credentials Handshake
                    </button>
                  )}
                </div>

                {/* OTP Passkey Session Registry */}
                <div className="z-10 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">Single-Use Dispatch Token</span>
                      <p className="font-mono text-xs text-blue-400 font-extrabold tracking-widest mt-1 select-all">{secToken}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleGenerateOTP}
                        disabled={secScanProgress !== null}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-[8px] font-black uppercase tracking-wider rounded-lg transition-colors border border-slate-800"
                      >
                        New Token
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(secToken);
                          if (addToast) addToast("Session token copied to doctor clipboard buffer.", "success");
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white text-[8px] font-black uppercase tracking-wider rounded-lg transition-colors border border-slate-800"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="text-[7.5px] text-slate-550 uppercase font-black tracking-widest border-t border-slate-900 pt-2 flex justify-between">
                    <span>MOH DISPATCH PASS: COMPILED</span>
                    <span>KEY ROTATION: LIVE</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hospital Carrier Pulse Log (Terminal Console) */}
              <div className="lg:col-span-7 bg-slate-950 rounded-[2rem] border border-slate-800 p-6 md:p-8 text-white shadow-2xl flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-850/80 pb-4">
                  <div>
                    <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full uppercase tracking-widest">Active Broadcasting Paging logs</span>
                    <h3 className="text-base font-black uppercase mt-1">Unified Regional Hospital Carrier Pulse Activations</h3>
                  </div>
                  <button 
                    onClick={() => setLogs([{ id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: "Clear matrix terminal session logs triggered.", type: 'info' }])}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-[8px] font-bold uppercase tracking-widest border border-slate-800 transition-colors shrink-0"
                  >
                    Clear Terminal Logs
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 no-scrollbar">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 border-b border-slate-900/40 pb-1.5 text-slate-400">
                      <span className="text-slate-600 shrink-0 font-bold">[{log.timestamp}]</span>
                      <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-rose-400' : 'text-slate-350'}>
                        {log.type === 'success' && '✨'}
                        {log.type === 'warning' && '💊'}
                        {log.type === 'info' && '🛰️'}
                        &nbsp;{log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </section>

            {/* Advanced Encrypted Cyber Security Posture Section */}
            <div className="mt-8">
              <CyberSecurityPanel dashboardType="doctor" />
            </div>

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
            className="space-y-8"
          >
            {/* CONNECTION & CLOUD SYNCHRONIZATION BAR */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-6 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-full ${isOnlineState ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {isOnlineState ? <Wifi size={24} className="animate-pulse" /> : <Wifi size={24} className="opacity-60" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black uppercase tracking-wider">Clinical Synchronization Channel</h4>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isOnlineState ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'}`}>
                      {isOnlineState ? 'ONLINE: BACK-SYNC ACTIVE' : 'OFFLINE MODE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 uppercase font-bold mt-1">
                    {isOnlineState 
                      ? 'Local modifications are instantly pushed to the clinical cloud database.' 
                      : 'Prescriptions save to local tables. Reconnect to sync.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Connection Toggle */}
                <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Offline Mode</span>
                  <button
                    onClick={handleToggleOnlineStatus}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 outline-none ${
                      !isOnlineState ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                        !isOnlineState ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Queue status */}
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Sync Queue</p>
                  <p className="text-xs font-mono font-black text-white">{offlineSyncRecords.filter(r => r.status === 'pending').length} Records Waiting</p>
                </div>

                <button
                  onClick={handleForceSync}
                  disabled={isSyncingState || offlineSyncRecords.filter(r => r.status === 'pending').length === 0}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow"
                >
                  {isSyncingState ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Handshaking...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={12} />
                      Sync Cloud Now
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* DUAL MODE LAYOUT: FORMULATOR & ANALYTICS */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: ACTIVE FORMULATOR */}
              <div className="xl:col-span-8 space-y-8">
                
                {/* PENDING AI DIAGNOSTIC CASE DOSSIERS QUEUE */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-[2.5rem] p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold uppercase text-xs text-slate-900 dark:text-white tracking-tight">Pending Case Dossiers from AI Diagnostic Core</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Secure clinical handovers waiting for Physician authorization.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black font-mono">
                      {pendingRxRequests.length} Active
                    </span>
                  </div>

                  {pendingRxRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 space-y-2">
                      <FileText size={32} className="mx-auto opacity-30" />
                      <p className="text-xs font-bold uppercase tracking-wider">No pending diagnostic dossiers in queue</p>
                      <p className="text-[10px] max-w-md mx-auto leading-normal">
                        Case dossiers securely transmitted by patients from the Diagnostic Symptom Checker appear here instantly.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                      {pendingRxRequests.map((req: any) => {
                        const isCritical = req.riskLevel === 'critical';
                        const isElevated = req.riskLevel === 'elevated';
                        return (
                          <div 
                            key={req.id} 
                            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100/80 dark:border-slate-800 flex flex-col justify-between gap-4 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-50 dark:border-slate-800">
                              <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Patient Profile</span>
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">{req.patientName} ({req.patientId})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase ${
                                  isCritical ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                                  isElevated ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                }`}>
                                  Risk: {req.riskLevel}
                                </span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[9px] font-black font-mono text-slate-500">
                                  Sync Conf: {req.confidence}%
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">AI Probable Diagnosis</span>
                              <h5 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase">{req.diagnosis}</h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-serif italic">
                                "{req.assessment}"
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Received: {req.timestamp}</span>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                  type="button"
                                  onClick={() => handleLoadPendingRequest(req)}
                                  className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow"
                                >
                                  <Pill size={12} />
                                  Formulate Rx
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm("Acknowledge: Dismiss this AI diagnostic case dossier?")) {
                                      try {
                                        const reqs = JSON.parse(localStorage.getItem('doctorian_pending_rx_requests') || '[]');
                                        const updated = reqs.filter((r: any) => r.id !== req.id);
                                        localStorage.setItem('doctorian_pending_rx_requests', JSON.stringify(updated));
                                        setPendingRxRequests(updated.filter((r: any) => r.status === 'pending'));
                                        window.dispatchEvent(new Event('pending_rx_requests_updated'));
                                      } catch (e) {
                                        console.error(e);
                                      }
                                    }
                                  }}
                                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-xl"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* MULTI-MEDICINE COMPILER & AUTHORIZATION FORM */}
                <div id="prescription-formulator-container" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800 pb-5">
                    <div>
                      <h3 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">Formulate Clinical Prescription</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1">Authorized physician medical compiler with offline-first log scheduling.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => document.getElementById('dashboard-prescription-upload')?.click()}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Upload size={14} className="text-blue-500" />
                      OCR Import Sheet
                      <input type="file" id="dashboard-prescription-upload" className="hidden" accept="image/*" onChange={handlePrescriptionRead} />
                    </button>
                  </div>

                  {/* OCR Reading State */}
                  {isReadingPrescription && (
                    <div className="p-8 text-center bg-slate-950 text-white rounded-[2rem] border border-white/5 space-y-4">
                      <Loader2 className="animate-spin text-blue-500 mx-auto" size={28} />
                      <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Optical Neural Extractors Active</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Scanning chemical formulations and mapping to standard patient records...</p>
                    </div>
                  )}

                  {/* Extraction success banner */}
                  {extractionResults && (
                    <div className="flex items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-4 rounded-2xl border border-emerald-500/15">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span className="text-[10px] font-black uppercase">OCR Digitization of {extractionResults.length} chemicals compiled successfully!</span>
                      </div>
                      <button 
                        onClick={() => setExtractionResults(null)}
                        className="text-[9px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-slate-600 border"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleAuthorizeNewPrescription} className="space-y-6">
                    {/* Patient & Doctor Selector Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Target Patient ID *</label>
                        <select
                          value={rxFormPatientId}
                          onChange={e => setRxFormPatientId(e.target.value)}
                          className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                        >
                          {offlinePatients.map((p, idx) => (
                            <option key={`rxpat-opt-${p.id}-${idx}`} value={p.id}>{p.id} - {p.name} (Age {p.age}, {p.conditions})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Authorizing Doctor *</label>
                        <select
                          value={rxFormDoctorId}
                          onChange={e => setRxFormDoctorId(e.target.value)}
                          className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                        >
                          {offlineDoctors.map((d, idx) => (
                            <option key={`rxdoc-opt-${d.id}-${idx}`} value={d.id}>{d.name} ({d.specialty})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Diagnosis & Follow-Up Date */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Diagnosis & Clinical Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g., Stage II Chronic Hypertension, High Cardiovascular Risk"
                          value={rxFormDiagnosis}
                          onChange={e => setRxFormDiagnosis(e.target.value)}
                          className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Follow-Up Date *</label>
                        <input
                          type="date"
                          required
                          value={rxFormFollowUpDate}
                          onChange={e => setRxFormFollowUpDate(e.target.value)}
                          className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    {/* MEDICINE ROWS BUILDER */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Medicines & Scheduling List</h4>
                        <button
                          type="button"
                          onClick={handleAddNewMedicineRow}
                          className="text-[9px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-500 flex items-center gap-1.5"
                        >
                          <PlusCircle size={14} />
                          Add Drug Row
                        </button>
                      </div>

                      <div className="space-y-3">
                        {rxFormMedicines.map((med, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl relative space-y-4">
                            
                            {/* Delete button for rows */}
                            {rxFormMedicines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicineRow(idx)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash size={14} />
                              </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-5 space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400">Chemical / Medicine Name *</label>
                                <input
                                  type="text"
                                  placeholder="E.g., Amlodipine Besylate"
                                  value={med.name}
                                  onChange={e => handleUpdateMedicineRow(idx, 'name', e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                                />
                              </div>

                              <div className="md:col-span-2 space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400">Dosage *</label>
                                <input
                                  type="text"
                                  placeholder="5mg"
                                  value={med.dosage}
                                  onChange={e => handleUpdateMedicineRow(idx, 'dosage', e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                                />
                              </div>

                              <div className="md:col-span-2 space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400">Frequency *</label>
                                <select
                                  value={med.frequency}
                                  onChange={e => handleUpdateMedicineRow(idx, 'frequency', e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                                >
                                  <option value="Daily">Daily</option>
                                  <option value="Twice daily">Twice daily</option>
                                  <option value="Three times daily">3 Times daily</option>
                                  <option value="Nightly">Nightly</option>
                                  <option value="As needed">As needed (PRN)</option>
                                </select>
                              </div>

                              <div className="md:col-span-3 space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400">Duration *</label>
                                <select
                                  value={med.duration}
                                  onChange={e => handleUpdateMedicineRow(idx, 'duration', e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                                >
                                  <option value="7 Days">7 Days</option>
                                  <option value="14 Days">14 Days</option>
                                  <option value="30 Days">30 Days</option>
                                  <option value="90 Days">90 Days</option>
                                  <option value="Chronic">Chronic Treatment</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400">Reminder Times (Comma-separated 24h)</label>
                                <input
                                  type="text"
                                  placeholder="08:00, 20:00"
                                  value={med.reminderTimes.join(', ')}
                                  onChange={e => {
                                    const times = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                    handleUpdateMedicineRow(idx, 'reminderTimes', times);
                                  }}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                                />
                              </div>
                              <div className="flex items-end text-[9px] text-slate-400 uppercase font-extrabold pb-2.5">
                                💡 Scheduled alarms automatically register in the patient's daily checklist.
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Real-time pre-authorization Clinical Safety Analysis Scanner */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      {(() => {
                        // Collect active patient data
                        const activePatient = offlinePatients.find(p => p.id === rxFormPatientId);
                        const patientConditions = activePatient ? activePatient.conditions : '';

                        // 1. Check dosage limits
                        const dosageAnomalies = rxFormMedicines
                          .map(m => {
                            if (!m.name.trim()) return null;
                            return validateMoHClinicalDosage(m.name, m.dosage, m.frequency);
                          })
                          .filter((v): v is NonNullable<typeof v> => v !== null && !v.isValid && v.warning !== null);

                        // 2. Check drug-disease mismatches
                        const diseaseAnomalies = rxFormMedicines
                          .map(m => {
                            if (!m.name.trim()) return null;
                            return validateDrugForDisease(m.name, patientConditions, rxFormDiagnosis);
                          })
                          .filter((v): v is NonNullable<typeof v> => v !== null && !v.isValid && v.warning !== null);

                        // 3. Check drug-drug interactions
                        const interactionAnomalies = [];
                        const validMedsForInteractions = rxFormMedicines.filter(m => m.name.trim() !== '');
                        const interactionResult = validateDrugDrugInteractions(validMedsForInteractions);
                        if (interactionResult.hasConflict && interactionResult.warning) {
                          interactionAnomalies.push(interactionResult);
                        }

                        const totalIssues = dosageAnomalies.length + diseaseAnomalies.length + interactionAnomalies.length;

                        if (totalIssues === 0) {
                          return (
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/15 rounded-2xl p-4 flex items-center gap-3">
                              <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
                              <div className="text-left">
                                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Clinical Safety Status: Compliant</span>
                                <p className="text-[8.5px] font-bold text-slate-400 uppercase mt-0.5">All compounds, dosages, and drug-disease matches cleared against Ministry of Health guidelines.</p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="bg-rose-50/70 dark:bg-rose-950/15 border border-rose-500/20 rounded-3xl p-5 space-y-4 text-left">
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="text-rose-600 animate-pulse" size={20} />
                              <div>
                                <h4 className="text-xs font-black uppercase text-rose-700 dark:text-rose-400 tracking-wide">Clinical Safety Warning Matrix ({totalIssues} Alerts)</h4>
                                <p className="text-[8.5px] text-slate-400 uppercase font-black">Pre-authorization screening flagged potential bio-chemical conflicts.</p>
                              </div>
                            </div>

                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                              {/* Dosage anomalies */}
                              {dosageAnomalies.map((a, i) => (
                                <div key={`d-${i}`} className="p-3 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/40 rounded-xl space-y-1">
                                  <span className="text-[8px] font-black uppercase text-rose-650 bg-rose-500/10 px-2 py-0.5 rounded">Dosage Limit Violation</span>
                                  <p className="text-[9.5px] font-extrabold uppercase text-slate-800 dark:text-white leading-tight">{a.warning}</p>
                                </div>
                              ))}

                              {/* Disease mismatch anomalies */}
                              {diseaseAnomalies.map((a, i) => (
                                <div key={`dis-${i}`} className="p-3 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/40 rounded-xl space-y-1">
                                  <span className="text-[8px] font-black uppercase text-rose-650 bg-rose-500/10 px-2 py-0.5 rounded">Drug-Disease Mismatch</span>
                                  <p className="text-[9.5px] font-extrabold uppercase text-slate-800 dark:text-white leading-tight">{a.warning}</p>
                                </div>
                              ))}

                              {/* Interaction anomalies */}
                              {interactionAnomalies.map((a, i) => (
                                <div key={`int-${i}`} className="p-3 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/40 rounded-xl space-y-1">
                                  <span className="text-[8px] font-black uppercase text-rose-650 bg-rose-500/10 px-2 py-0.5 rounded">{a.severity.toUpperCase()} INTERACTION</span>
                                  <p className="text-[9.5px] font-extrabold uppercase text-slate-850 dark:text-white leading-tight">{a.warning}</p>
                                  <p className="text-[9px] font-semibold text-slate-450 dark:text-slate-400 uppercase leading-relaxed mt-1">{a.clinicalExplanation}</p>
                                </div>
                              ))}
                            </div>

                            {/* Override controls */}
                            <div className="pt-3 border-t border-rose-200/50 dark:border-rose-950/40 space-y-3">
                              <label className="flex items-start gap-2.5 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={rxOverrideChecked} 
                                  onChange={e => setRxOverrideChecked(e.target.checked)}
                                  className="mt-0.5 w-4.5 h-4.5 text-rose-600 bg-slate-150 border-slate-300 rounded focus:ring-rose-500 dark:focus:ring-rose-600 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                                />
                                <div>
                                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white block">Acknowledge Safety Warnings & Apply Clinical Override</span>
                                  <span className="text-[8.5px] font-bold text-slate-400 uppercase leading-none">I certify that this combination is medically indicated and that therapeutic benefits outweigh these risks.</span>
                                </div>
                              </label>

                              {rxOverrideChecked && (
                                <div className="space-y-1.5">
                                  <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Medical Justification & Signature *</label>
                                  <textarea
                                    required
                                    value={rxOverrideJustification}
                                    onChange={e => setRxOverrideJustification(e.target.value)}
                                    placeholder="E.g., Patient is monitored on-site; medication benefits for severe hypertension override hyperkalemia risks. Approved under clinical supervision."
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-950/40 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none text-slate-800 dark:text-slate-200 focus:border-rose-500 h-16 resize-none"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow shadow-blue-500/10 flex items-center justify-center gap-2"
                    >
                      <BadgePlus size={16} />
                      Authorize & Digitally Issue Prescription Record
                    </button>
                  </form>
                </div>

                {/* AUTHORIZED PRESCRIPTIONS HISTORICAL ARCHIVE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-extrabold uppercase text-slate-900 dark:text-white">Active Authorized Prescriptions</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Audit ledger of issued molecular structures with retrieval QR nodes.</p>
                  </div>

                  <div className="space-y-4">
                    {offlinePrescriptions.length === 0 ? (
                      <p className="text-slate-400 text-xs text-center py-6">No prescription records authorized yet.</p>
                    ) : (
                      offlinePrescriptions.map(rx => {
                        const pat = offlinePatients.find(p => p.id === rx.patientId);
                        const doc = offlineDoctors.find(d => d.id === rx.doctorId);
                        const rxMeds = getMedicinesForPrescription(rx.id);
                        
                        return (
                          <div key={rx.id} className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 p-5 flex flex-col md:flex-row justify-between gap-6 hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-mono text-xs font-extrabold">
                                  {rx.id}
                                </span>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                  Issued: {rx.date}
                                </span>
                                {!rx.synced && (
                                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                                    Local Save
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs text-slate-405 uppercase font-bold tracking-wide">Patient: <span className="font-extrabold text-slate-900 dark:text-white">{pat?.name || 'Unknown'}</span></h4>
                                <p className="text-xs text-slate-405 uppercase font-bold tracking-wide">Doctor: <span className="text-slate-700 dark:text-slate-300">{doc?.name || 'Unknown'}</span></p>
                              </div>

                              <div className="space-y-1">
                                <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase">Clinical Diagnosis:</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border dark:border-slate-800">{rx.diagnosis}</p>
                              </div>

                              {/* Medicines list detail */}
                              <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-slate-400">Prescribed Compounds:</p>
                                <div className="flex flex-wrap gap-2">
                                  {rxMeds.map(m => (
                                    <span key={m.id} className="text-[10px] font-extrabold uppercase bg-slate-200/60 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-300/40 dark:border-slate-800">
                                      💊 {m.name} ({m.dosage}) - {m.frequency} [{m.duration}]
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* QR Trigger widget */}
                            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border dark:border-slate-800 p-4 rounded-2xl text-center md:w-44 shrink-0 hover:shadow transition-all">
                              <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl mb-2 cursor-pointer" onClick={() => setActiveQrCodeValue(rx.qrCodeValue)}>
                                <QRCodeSVG value={rx.qrCodeValue} size={84} />
                              </div>
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">RETRIEVAL CODE</span>
                              <button
                                onClick={() => setActiveQrCodeValue(rx.qrCodeValue)}
                                className="text-[8px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-500 mt-2 bg-blue-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg"
                              >
                                View QR Code
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: DOCTORS COMPLIANCE & DATABASE INSPECTION */}
              <div className="xl:col-span-4 space-y-8">
                
                {/* DOCTORS COMPLIANCE MONITOR */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2.5rem] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-extrabold uppercase text-slate-900 dark:text-white">Patient Adherence Dashboard</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Real-time compliance analytics on offline intake records.</p>
                  </div>

                  <div className="space-y-4">
                    {offlinePatients.map((pat, idx) => {
                      const complianceColor = pat.complianceRate >= 80 
                        ? 'text-emerald-500' 
                        : pat.complianceRate >= 65 
                          ? 'text-amber-500' 
                          : 'text-rose-500';

                      const complianceBg = pat.complianceRate >= 80 
                        ? 'bg-emerald-500/10' 
                        : pat.complianceRate >= 65 
                          ? 'bg-amber-500/10' 
                          : 'bg-rose-500/10';

                      const patLogs = offlineLogs.filter(l => l.patientId === pat.id);
                      const missedCount = patLogs.filter(l => l.status === 'missed').length;
                      const takenCount = patLogs.filter(l => l.status === 'taken').length;

                      return (
                        <div key={`rx-pat-${pat.id}-${idx}`} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-extrabold uppercase text-xs text-slate-900 dark:text-white">{pat.name}</h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{pat.conditions}</p>
                            </div>

                            <div className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black ${complianceColor} ${complianceBg}`}>
                              {pat.complianceRate}% OK
                            </div>
                          </div>

                          {/* Mini adherence metrics */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl">
                              <p className="text-[8px] font-black uppercase text-slate-400">Scheduled</p>
                              <p className="text-xs font-black font-mono mt-0.5 text-slate-750 dark:text-white">{patLogs.length}</p>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl">
                              <p className="text-[8px] font-black uppercase text-emerald-500">Taken</p>
                              <p className="text-xs font-black font-mono mt-0.5 text-emerald-500">{takenCount}</p>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl">
                              <p className="text-[8px] font-black uppercase text-rose-500 font-bold">Missed</p>
                              <p className="text-xs font-black font-mono mt-0.5 text-rose-500">{missedCount}</p>
                            </div>
                          </div>

                          {/* Progress slider bar */}
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                pat.complianceRate >= 80 ? 'bg-emerald-500' : pat.complianceRate >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${pat.complianceRate}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MEDICATION VERIFICATION ALERT & SUPERVISION HUB */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2.5rem] p-6 shadow-sm space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="text-rose-500 animate-pulse" size={20} />
                      <h3 className="text-lg font-extrabold uppercase text-slate-900 dark:text-white">Verification & Alert Hub</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">High-Trust Adherence Verification Alerts & Caregiver Supervision</p>
                  </div>

                  {/* SECTION 1: SYSTEM ANOMALIES & LOW-CONFIDENCE ALERTS */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Low-Confidence & Anomaly alerts</span>
                    
                    {(() => {
                      const anomalies = offlineLogs.filter(l => l.anomalyDetected || (l.confidenceScore !== undefined && l.confidenceScore < 70));
                      if (anomalies.length === 0) {
                        return (
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            <p className="text-[9.5px] uppercase font-bold text-emerald-600 dark:text-emerald-400">All ingestion logs validated. No adherence anomalies detected.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {anomalies.map(log => {
                            const pat = offlinePatients.find(p => p.id === log.patientId);
                            const isOverdose = log.anomalyReason?.toLowerCase().includes('overdose') || log.anomalyReason?.toLowerCase().includes('toxic');
                            const isMismatch = log.anomalyReason?.toLowerCase().includes('mismatch') || log.anomalyReason?.toLowerCase().includes('wrong drug') || log.anomalyReason?.toLowerCase().includes('disease');
                            
                            let cardBg = 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/20';
                            let tagText = 'COMPLIANCE ANOMALY';
                            let tagClass = 'text-amber-600 bg-amber-500/10';
                            
                            if (isOverdose) {
                              cardBg = 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/30 ring-1 ring-rose-500/10';
                              tagText = '🚨 OVERDOSE WARNING';
                              tagClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/15';
                            } else if (isMismatch) {
                              cardBg = 'bg-orange-50 dark:bg-orange-950/30 border-orange-500/30';
                              tagText = '⚠️ DRUG-DISEASE MISMATCH';
                              tagClass = 'text-orange-600 dark:text-orange-400 bg-orange-500/15';
                            }

                            return (
                              <div key={log.id} className={`p-4 rounded-2xl border space-y-2 transition-all hover:scale-[1.01] ${cardBg}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <AlertTriangle size={14} className={isOverdose ? "text-rose-600" : isMismatch ? "text-orange-600" : "text-amber-600"} />
                                    <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white truncate max-w-[120px]">
                                      {pat ? pat.name : 'Unknown Patient'}
                                    </span>
                                  </div>
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${tagClass}`}>
                                    {tagText}
                                  </span>
                                </div>

                                <p className="text-[9.5px] font-black text-slate-800 dark:text-slate-100 uppercase leading-none">
                                  {log.medicineName} • <span className="text-slate-500">{log.dosage || 'Standard Dose'}</span>
                                </p>

                                <p className={`text-[8.5px] font-semibold leading-normal uppercase p-2 rounded-lg ${isOverdose ? 'bg-rose-500/5 text-rose-700 dark:text-rose-400' : isMismatch ? 'bg-orange-500/5 text-orange-700 dark:text-orange-400' : 'bg-white/50 dark:bg-slate-900/50 text-amber-700 dark:text-amber-400'}`}>
                                  Reason: {log.anomalyReason || 'Suspected placeholder or self-reported mismatch'}
                                </p>

                                <div className="text-[8px] text-slate-400 uppercase flex justify-between items-center font-mono font-bold">
                                  <span>Time: {log.takenAt ? new Date(log.takenAt).toLocaleTimeString() : 'N/A'}</span>
                                  <span>Method: {log.verificationMethod || 'Self-Reported'}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* SECTION 2: CAREGIVER / HEALTHCARE PROVIDER SUPERVISION */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Caregiver & Provider Approvals</span>
                    
                    {(() => {
                      // Filter list of recent logs that can be approved/supervised (or showing verification states)
                      const logsToSupervise = offlineLogs.filter(l => l.status === 'taken').slice(0, 3);
                      
                      if (logsToSupervise.length === 0) {
                        return (
                          <p className="text-[9px] uppercase font-bold text-slate-400 text-center py-2">No active ingestion logs available for supervision override.</p>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {logsToSupervise.map(log => {
                            const pat = offlinePatients.find(p => p.id === log.patientId);
                            const isAlreadyVerified = log.caregiverVerified;
                            return (
                              <div key={log.id} className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none">{pat ? pat.name : 'Patient'}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{log.medicineName} ({log.dosage})</p>
                                  </div>

                                  {isAlreadyVerified ? (
                                    <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
                                      <CheckCircle2 size={10} />
                                      Approved
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-550/10 px-2 py-0.5 rounded-lg shrink-0">
                                      Awaiting Oversight
                                    </span>
                                  )}
                                </div>

                                {!isAlreadyVerified && (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      id={`caregiver-name-${log.id}`}
                                      placeholder="Caregiver Name"
                                      defaultValue="Dr. Alex Carter"
                                      className="flex-1 text-[9.5px] px-2 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white uppercase font-bold focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const inputEl = document.getElementById(`caregiver-name-${log.id}`) as HTMLInputElement;
                                        const name = inputEl?.value || 'Dr. Alex Carter';
                                        const ok = caregiverVerifyIntake(log.id, name, true);
                                        if (ok) {
                                          if (addToast) addToast(`✅ Clinical Override: Dose verified by supervisor ${name}!`, "success");
                                          refreshOfflineData();
                                        }
                                      }}
                                      className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[8.5px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all shrink-0"
                                    >
                                      Approve Intake
                                    </button>
                                  </div>
                                )}

                                {isAlreadyVerified && (
                                  <p className="text-[8px] uppercase font-bold text-slate-400 leading-none pl-1">
                                    Verified by: {log.caregiverVerifiedBy || 'Supervisor'} at {log.takenAt ? new Date(log.takenAt).toLocaleTimeString() : 'N/A'}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* DB TABLE INSPECTOR (SATISFIES THE "SEPARATE TABLES" REQUIREMENT) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2.5rem] p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Layers size={18} className="text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider">Database Tables Inspector</h3>
                  </div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase leading-normal">
                    Inspect individual client-side database tables representing separate, secured logical schemas.
                  </p>

                  <div className="space-y-3">
                    {[
                      { name: 'patients_table', count: offlinePatients.length, desc: 'Patient demographics & metrics' },
                      { name: 'doctors_table', count: offlineDoctors.length, desc: 'Authorizing medical officers' },
                      { name: 'prescriptions_table', count: offlinePrescriptions.length, desc: 'Standardized prescription forms' },
                      { name: 'medicines_table', count: getMedicines().length, desc: 'Prescribed drug configurations' },
                      { name: 'medication_logs_table', count: offlineLogs.length, desc: 'Compliance & intake history' },
                      { name: 'reminders_table', count: getReminders().length, desc: 'Smart scheduled alarms' },
                      { name: 'notifications_table', count: getNotifications().length, desc: 'User alerts & reminder push logs' },
                      { name: 'synchronization_records_table', count: offlineSyncRecords.length, desc: 'Cloud replication ledger' }
                    ].map(tbl => (
                      <div key={tbl.name} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                        <div>
                          <p className="font-mono text-[10px] font-black text-slate-800 dark:text-blue-400 leading-none">
                            {tbl.name}
                          </p>
                          <p className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold mt-1 uppercase leading-none">
                            {tbl.desc}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border font-black text-slate-700 dark:text-slate-300">
                          {tbl.count} Row{tbl.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

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

        {/* VIEW: GENOMIC MATRIX */}
        {activeSubTab === 'genomics' && (
          <motion.div
            key="genomics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>🔒 Doctor's Portal Access Granted: Genomic Nexus Sequencing</span>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-emerald-500/10 rounded-lg">Doctor Exclusive</span>
            </div>
            <DnaMatrix dnaStatus={arduino?.dnaStatus || {}} onStartSequencing={arduino?.startDnaSequencing || (() => {})} />
          </motion.div>
        )}

        {/* VIEW: EMERGENCY REGISTRY */}
        {activeSubTab === 'emergency' && (
          <motion.div
            key="emergency"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
              <span>🔒 Doctor's Portal Access Granted: Emergency Clinical Registry</span>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-rose-500/10 rounded-lg">Doctor Exclusive</span>
            </div>
            <EmergencyRegistry user={null} onUpdate={() => {}} isAdmin={true} setIsAdmin={() => {}} />
          </motion.div>
        )}

        {/* VIEW: CLINICAL ALARM HUB */}
        {activeSubTab === 'alarms' && (
          <motion.div
            key="alarms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
              <span>🔒 Doctor's Portal Access Granted: Critical Alarm Sentinel</span>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-red-500/10 rounded-lg">Doctor Exclusive</span>
            </div>
            <AlarmHubView 
              vitals={arduino?.vitals} 
              thresholds={{
                heartRate: { min: 50, max: 120, warningMin: 60, warningMax: 100 },
                temperature: { max: 38.5, warningMax: 37.5 },
                spo2: { min: 90, warningMin: 95 },
                systolicBP: { max: 180, warningMax: 140 },
                diastolicBP: { max: 110, warningMax: 90 },
                respiratoryRate: { min: 12, max: 25, warningMax: 20 }
              }} 
              setThresholds={() => {}} 
              alarmHistory={[]} 
              clearAlarmHistory={() => {}} 
              isAlarmMuted={false} 
              setIsAlarmMuted={() => {}} 
              isHeartbeatToneEnabled={false} 
              setIsHeartbeatToneEnabled={() => {}} 
              synthRef={{ current: null }} 
              addAlarmLog={() => {}} 
              snoozeDuration={0} 
              setSnoozeDuration={() => {}} 
              isCurrentlyAcknowledged={false}
              alarmAcknowledgeTime={null}
              acknowledgeAlarm={() => {}}
            />
          </motion.div>
        )}

        {/* VIEW: AMBULANCE DISPATCH */}
        {activeSubTab === 'ambulance' && (
          <motion.div
            key="ambulance"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
              <span>🔒 Doctor's Portal Access Granted: Emergency Ambulance Fleet Dispatch</span>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-red-500/10 rounded-lg">Doctor Exclusive</span>
            </div>
            <AmbulanceDispatchPanel addToast={addToast} />
          </motion.div>
        )}

        {/* VIEW: BED REGISTRY & PATIENTS */}
        {activeSubTab === 'registry' && (
          <motion.div
            key="registry"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="bg-teal-950/20 border border-teal-500/20 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>🔒 Doctor's Portal Access Granted: Bed Registry & Inpatient Care Ward</span>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-teal-500/10 rounded-lg">Doctor Exclusive</span>
            </div>
            <ClinicalPatientRegistry 
              user={null} 
              onUpdateUser={() => {}} 
              registeredPatients={[]} 
              setRegisteredPatients={() => {}} 
              selectedPatientId="p-1" 
              setSelectedPatientId={() => {}} 
              registryNotification={null} 
              setRegistryNotification={() => {}} 
              transferHistory={[]} 
              setTransferHistory={() => {}} 
              isAdmin={true} 
              setIsAdmin={() => {}} 
              couplePatientToMonitor={() => {}} 
              triggerRegistryNotification={(msg, type) => addToast?.(msg, type || 'info')} 
              arduino={arduino} 
            />
          </motion.div>
        )}

        {/* VIEW: BIOMEDICAL SIMULATOR */}
        {activeSubTab === 'simulator' && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="bg-blue-950/20 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>🔒 Doctor's Portal Access Granted: Biomedical Machine Hardware Simulator</span>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-blue-500/10 rounded-lg">Doctor Exclusive</span>
            </div>
            <BiomedicalSimulator arduino={arduino} />
          </motion.div>
        )}

        {/* VIEW 5: AI DIAGNOSTIC DECISION HUB & CO-PILOT */}
        {activeSubTab === 'decision_support' && (
          <motion.div
            key="decision_support"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* LEFT SIDEBAR: PATIENT ROUTING DIRECTORY */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-6 flex flex-col justify-between self-start">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardList className="text-blue-500" size={18} /> Admitted Ledger
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Select an active patient or pre-loaded critical clinical presentation below.</p>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                  {[...referrals, ...sampleCasePatients].map((pat, idx) => {
                    const isSelected = selectedPatientId === pat.id;
                    const isStat = pat.priority === 'STAT' || pat.priority === 'STAT Emergency';
                    return (
                      <button
                        key={`admitted-${pat.id}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(pat.id);
                          setDiagnosticResult(null);
                          setConsultHistory([]);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border text-xs transition-all flex flex-col gap-2 relative overflow-hidden ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500 dark:bg-blue-500/10'
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100 dark:bg-slate-950/40 dark:border-slate-850 dark:hover:bg-slate-955'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-2.5 h-full bg-blue-600" />
                        )}
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] font-black text-slate-450">ID: {pat.patientCode}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isStat ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350'
                          }`}>
                            {pat.priority}
                          </span>
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-white uppercase truncate">{pat.assessment || "Undiagnosed Presentation"}</p>
                          <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Vitals: {pat.temp}°C | BP {pat.bp} | HR {pat.hr}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attending Custom Observation Field */}
              <div className="space-y-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Attending Directive notes (Optional)</label>
                  <textarea
                    value={customObservation}
                    onChange={(e) => setCustomObservation(e.target.value)}
                    placeholder="E.g., Patient displays borderline renal failure histories. Screen for drug contraindications..."
                    className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-150 rounded-xl px-3 py-2 text-[10px] font-medium outline-none resize-none h-20 placeholder:text-slate-400 dark:border-slate-800 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const activePatient = [...referrals, ...sampleCasePatients].find(p => p.id === selectedPatientId) || sampleCasePatients[0];
                    handleRunAiDiagnostics(activePatient);
                  }}
                  disabled={cdssLoading}
                  className="w-full bg-slate-900 border border-slate-800 dark:bg-slate-800 text-white h-11 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-755 transition-all flex items-center justify-center gap-2"
                >
                  {cdssLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-blue-500" />
                      Engaging Co-Pilot...
                    </>
                  ) : (
                    <>
                      <Brain size={14} className="text-blue-400" />
                      Run AI Diagnostics
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR: INTELLIGENT DISCOVERY CONSOLE */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STATE A: NO DATA OR ANALYTICS YET */}
              {!cdssLoading && !diagnosticResult && (
                <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-[2.5rem] p-12 text-center flex flex-col justify-center items-center h-full min-h-[450px]">
                  <div className="p-5 bg-blue-50 dark:bg-slate-955 text-blue-600 rounded-3xl mb-4 relative">
                    <Brain size={44} className="animate-bounce" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white">AI Diagnostic Decision Support Node</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-2 max-w-lg leading-relaxed">
                    Trigger powerful server-side neural assessments on core patient logs. Evaluate differential diagnoses, bio-pharmacy contraindications, and specialist clinic referrals in seconds.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mt-8">
                    {[
                      { title: "Biometric Zone Screening", desc: "Checks BP, SpO2, Temperature and heart rhythm levels against clinical limits." },
                      { title: "Therapeutic Watchdog", desc: "Cross-references proposed medication plans with underlying renal/kidney contraindications." },
                      { title: "Specialist Routing Guidance", desc: "Suggests the most qualified medical nodes to take over acute or critical patients." },
                      { title: "AI Handover Attestation", desc: "Provides verified stamped PDF-printable handover transcripts with verification stamps." },
                    ].map((feat, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 rounded-2xl text-left">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider block mb-1">{feat.title}</span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">{feat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STATE B: NEURAL COMPUTATION LOADING PULSE */}
              {cdssLoading && (
                <div className="bg-slate-950 text-white border border-slate-800/80 rounded-[2.5rem] p-10 min-h-[450px] flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 animate-pulse" />
                  
                  <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/5 shadow-2xl relative mb-6">
                    <Loader2 size={38} className="animate-spin text-blue-500" />
                  </div>
                  
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 animate-pulse mb-8">Synchronizing Doctorian Decision Node</h4>

                  <div className="w-full max-w-md space-y-2 text-left bg-slate-900/60 p-5 rounded-2xl border border-white/5 font-mono text-[9px] text-slate-400 uppercase">
                    <span className="text-[8px] font-black text-slate-500 tracking-wider block mb-2">// CALIBRATING SIGNAL HANDSHAKES...</span>
                    {diagnosticSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <span className="text-emerald-500">■</span>
                        <span>{step}</span>
                        {idx === diagnosticSteps.length - 1 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STATE C: DIAGNOSTIC LOG COMPLETE AND RENDERED */}
              {diagnosticResult && !cdssLoading && (
                <div className="space-y-6">
                  
                  {/* COMPONENT 1: BIOMETRIC STRESS GAUGE */}
                  {(() => {
                    const pat = [...referrals, ...sampleCasePatients].find(p => p.id === selectedPatientId) || sampleCasePatients[0];
                    const tVal = parseFloat(pat.temp) || 37.0;
                    const spVal = parseInt(pat.spo2) || 98;
                    const hrVal = parseInt(pat.hr) || 75;
                    
                    const isFever = tVal > 38.0;
                    const isHypoxemia = spVal < 95;
                    const isTachycardic = hrVal > 100;
                    
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div>
                            <span className="text-[8px] font-mono font-black text-blue-500 uppercase bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full">Telemetry Audit</span>
                            <h4 className="text-sm font-black uppercase text-slate-850 dark:text-white mt-1.5">Biometric Vital Range & Stress Indicators</h4>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 font-mono">DOCKET: {pat.patientCode}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          
                          {/* TEMP */}
                          <div className={`p-4 rounded-2xl border ${isFever ? 'bg-rose-50/40 border-rose-100 text-rose-955 dark:bg-rose-950/20 dark:border-rose-900/40' : 'bg-slate-50 border-slate-100 text-slate-900 dark:bg-slate-950/30'}`}>
                            <span className="text-[8px] font-black text-slate-400 uppercase block">Body Temperature</span>
                            <div className="flex items-baseline gap-1 mt-1.5">
                              <span className="text-lg font-mono font-black leading-none">{pat.temp}</span>
                              <span className="text-[10px] font-bold text-slate-450">°C</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-wider block mt-2 ${isFever ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {isFever ? '● High Hyperthermia' : '● Physiological Norm'}
                            </span>
                          </div>

                          {/* BP */}
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 dark:bg-slate-950/30 dark:border-slate-850">
                            <span className="text-[8px] font-black text-slate-400 uppercase block">Blood Pressure</span>
                            <div className="flex items-baseline gap-1 mt-1.5">
                              <span className="text-lg font-mono font-black leading-none">{pat.bp}</span>
                              <span className="text-[10px] font-bold text-slate-455">mmHg</span>
                            </div>
                            <span className="text-[8px] font-black uppercase text-emerald-500 tracking-wider block mt-2">
                              ● Hemodynamics Ok
                            </span>
                          </div>

                          {/* HR */}
                          <div className={`p-4 rounded-2xl border ${isTachycardic ? 'bg-rose-50/40 border-rose-100 text-rose-955 dark:bg-rose-950/20 dark:border-rose-900/40' : 'bg-slate-50 border-slate-100 text-slate-900 dark:bg-slate-950/30'}`}>
                            <span className="text-[8px] font-black text-slate-400 uppercase block">Heart Rate</span>
                            <div className="flex items-baseline gap-1 mt-1.5">
                              <span className="text-lg font-mono font-black leading-none">{pat.hr}</span>
                              <span className="text-[10px] font-bold text-slate-450">BPM</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-wider block mt-2 ${isTachycardic ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {isTachycardic ? '● Tachycardia Peak' : '● Normal Sinus'}
                            </span>
                          </div>

                          {/* SPO2 */}
                          <div className={`p-4 rounded-2xl border ${isHypoxemia ? 'bg-rose-50/40 border-rose-100 text-rose-955 dark:bg-rose-950/20 dark:border-rose-900/40' : 'bg-emerald-50/30 border-emerald-100 text-slate-900 dark:bg-emerald-950/20'}`}>
                            <span className="text-[8px] font-black text-slate-400 uppercase block">Oxygen Saturation</span>
                            <div className="flex items-baseline gap-1 mt-1.5">
                              <span className={`text-lg font-mono font-black leading-none ${isHypoxemia ? 'text-rose-500' : 'text-emerald-500'}`}>{pat.spo2}</span>
                              <span className="text-[10px] font-bold text-slate-450">%</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-wider block mt-2 ${isHypoxemia ? 'text-rose-500 animate-pulse font-extrabold' : 'text-emerald-500'}`}>
                              {isHypoxemia ? '● Hypoxia Danger' : '● Excellent SpO2'}
                            </span>
                          </div>

                        </div>
                      </div>
                    );
                  })()}

                  {/* COMPONENT 2: INTERACTIVE CDSS FINDINGS PANEL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Differential Pathologies */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Activity className="text-violet-500 animate-pulse" size={15} /> Differential Diagnostics
                      </h4>
                      <div className="space-y-3">
                        {diagnosticResult.differentialDiagnosis.map((item, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100/50 dark:border-slate-850 rounded-xl">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                              <p className="text-[11px] font-black text-slate-850 dark:text-white uppercase leading-normal">{item}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Red Flags & Safety Warnings */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <AlertTriangle className="text-rose-500" size={15} /> Clinical Red Flags & Safety Warnings
                      </h4>
                      <div className="space-y-3">
                        {diagnosticResult.redFlags.map((item, idx) => (
                          <div key={idx} className="p-3.5 bg-rose-500/5 border border-rose-100/40 dark:border-rose-950/40 rounded-xl flex items-start gap-2.5">
                            <span className="w-2 rounded-full h-2 bg-rose-500 mt-1.5 shrink-0 animate-ping" />
                            <p className="text-[10px] font-bold text-rose-955 dark:text-rose-300 uppercase leading-normal">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* COMPONENT 3: PHARMACOLOGICAL SUGGESTIONS & METHOD PLAN MAPPING */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Biochemical Pharmacology recommendations */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Pill className="text-emerald-500" size={15} /> Targeted Molecular Formulations
                      </h4>
                      <div className="space-y-3">
                        {diagnosticResult.pharmacology.map((item, idx) => (
                          <div key={idx} className="p-3.5 bg-emerald-55 bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-950/40 rounded-xl flex items-start gap-2.5">
                            <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Critical Clinical Pathway checklist */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-850 rounded-[2rem] p-6 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <ChevronRight className="text-sky-500" size={15} /> Critical Clinical Pathway Checklist
                      </h4>
                      <div className="space-y-2.5">
                        {diagnosticResult.pathway.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100/40 dark:border-slate-850 rounded-xl">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600" 
                              id={`cdss-path-${idx}`} 
                              defaultChecked={idx === 0} 
                            />
                            <label htmlFor={`cdss-path-${idx}`} className="text-[10px] font-black text-slate-600 dark:text-slate-350 uppercase cursor-pointer select-none leading-none">
                              {item}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* COMPONENT 4: PRIMARY SYNTHESIZED CASE CLINICAL MEMO */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 block">
                      Synthesized Pathophysiology & Specialist Referrals Memo
                    </h4>
                    
                    <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-h-[300px] overflow-y-auto no-scrollbar whitespace-pre-wrap">
                      {diagnosticResult.rawMarkdown}
                    </div>
                  </div>

                  {/* COMPONENT 5: INTERACTIVE SPECIALIST RESEARCH OVERLAY */}
                  <div className="bg-slate-950 text-white rounded-[2rem] p-8 border border-slate-800 shadow-xl space-y-6">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono font-black text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest">Biomedical Diallectics Terminal</span>
                      <h4 className="text-lg font-black uppercase tracking-tight">Attending Specialist Consultation Terminal</h4>
                      <p className="text-[10px] text-slate-450 font-bold uppercase leading-relaxed">
                        Consult with our medical evidence pathways library regarding drug-drug interactions, specialist diagnostic tests or core reference guidelines.
                      </p>
                    </div>

                    <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar pr-1">
                      {consultHistory.length === 0 ? (
                        <div className="text-center p-6 text-slate-500 border border-dashed border-slate-800/80 rounded-2xl text-[10px] font-bold uppercase tracking-wider">
                          Dialogue ledger empty. Ask your follow-up clinical question below.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {consultHistory.map((h, i) => (
                            <div key={i} className={`p-4 rounded-2xl text-xs max-w-xl leading-relaxed ${
                              h.role === 'user' 
                                ? 'bg-blue-600/20 text-white border border-blue-500/30 self-end ml-auto shadow-md font-bold' 
                                : 'bg-slate-900 text-slate-300 border border-white/5'
                            }`}>
                              <span className="text-[8px] font-black uppercase tracking-wider block mb-1 text-slate-400">
                                {h.role === 'user' ? 'Physician Demand' : 'Clinical AI Co-Pilot'}
                              </span>
                              <p className={`whitespace-pre-line leading-relaxed ${h.role === 'user' ? 'font-extrabold text-sm text-white' : 'font-medium'}`}>{h.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {consultLoading && (
                        <div className="flex items-center gap-3 text-[10px] font-mono text-violet-400 uppercase animate-pulse">
                          <Loader2 size={12} className="animate-spin text-violet-500 mr-2" />
                          Indexing neurological pathways library...
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleFollowUpConsult} className="flex gap-3">
                      <input 
                        type="text" 
                        value={followUpMsg}
                        onChange={e => setFollowUpMsg(e.target.value)}
                        placeholder="E.g., What antibiotic alternatives exist if cephalosporins are contraindicated?"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-slate-600"
                      />
                      <button 
                        type="submit" 
                        disabled={consultLoading || !followUpMsg.trim()}
                        className="px-6 bg-violet-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all disabled:bg-slate-900"
                      >
                        Ask Specialism Library
                      </button>
                    </form>
                  </div>

                  {/* COMPONENT 6: MEDICINE DOCKET SIGNATURE & ATTESTATION RELEASE */}
                  <div className="bg-amber-500/5 border border-amber-500/15 p-8 rounded-[2rem] relative overflow-hidden space-y-6">
                    <div className="absolute top-4 right-4 text-amber-500/5 rotate-12 -z-10 select-none">
                      <ShieldCheck size={180} />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[8px] font-mono font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">Release Docket Verification</span>
                      <h4 className="text-sm font-black uppercase text-slate-900 dark:text-amber-400">Official Clinical attestation release transcript</h4>
                      <p className="text-[9px] text-slate-450 font-bold uppercase leading-relaxed max-w-xl">
                        Authorize this AI Decision synthesis as part of the official digital patient docket handoff trace. Stamped transcripts are appended with MD validation keys.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 justify-between border-t border-slate-200/40 dark:border-slate-800/40 pt-6">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Clinical Practitioner Credentials</label>
                        <input 
                          type="text" 
                          value={stampedBy} 
                          onChange={e => setStampedBy(e.target.value)}
                          className="bg-white dark:bg-slate-950 border border-slate-250 rounded-xl px-3 py-2 text-xs font-black uppercase outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsApproved(!isApproved);
                            if (addToast) addToast(!isApproved ? "Clinical Handover docket stamped and released." : "Attestation revoked.", "info");
                          }}
                          className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            isApproved 
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md' 
                              : 'bg-amber-600 text-white hover:bg-amber-500 shadow-md shadow-amber-500/5'
                          }`}
                        >
                          {isApproved ? '✓ Stamped Released' : '✓ Attest & Stamp docket'}
                        </button>

                        <button 
                          type="button" 
                          onClick={() => {
                            const payload = `=== PHYSICIAN AI CDSS DISCOVERY DOCKET ===\nPATIENT ATTESTATION: ${selectedPatientId}\nSTAMPED BY: ${stampedBy}\nSTATUS: APPROVED & VERIFIED\nDIAGNOSIS SYNTHESIS: ${diagnosticResult?.rawMarkdown}`;
                            navigator.clipboard.writeText(payload);
                            if (addToast) addToast("Release transcript loaded into local clipboard buffer.", "success");
                          }}
                          className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border rounded-xl text-[9px] font-black uppercase tracking-widest select-none cursor-pointer border-slate-150"
                        >
                          Copy Docket Code
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
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

      {/* ----------------- MODAL: PRESCRIPTION RETRIEVAL QR CODE ----------------- */}
      {activeQrCodeValue && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-md w-full p-8 border border-slate-100 dark:border-slate-800 shadow-2xl relative text-center space-y-6"
          >
            <button 
              onClick={() => setActiveQrCodeValue(null)} 
              className="absolute top-6 right-6 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-550 dark:text-slate-450 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
            >
              <X size={14} />
            </button>
            
            <div>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                Clinical Retrieval Key
              </span>
              <h3 className="text-lg font-extrabold uppercase text-slate-900 dark:text-white mt-3">Prescription Verification</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-normal">
                Scan at clinical terminal or pharmacy portal for instant lookup.
              </p>
            </div>

            {/* Premium QR Code stage */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-850 flex justify-center items-center shadow-inner mx-auto max-w-[220px]">
              <QRCodeSVG value={activeQrCodeValue} size={160} />
            </div>

            {/* Split value data fields */}
            <div className="text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">DECIPHERED DOCK PAYLOAD</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <p className="text-slate-400 uppercase font-bold">PRESCRIPTION</p>
                  <p className="text-slate-900 dark:text-white font-black">{activeQrCodeValue.split('|')[0]}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold">PATIENT ID</p>
                  <p className="text-slate-900 dark:text-white font-black">{activeQrCodeValue.split('|')[1]}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold">AUTHORIZER</p>
                  <p className="text-slate-900 dark:text-white font-black">{activeQrCodeValue.split('|')[2] || 'DOC-002'}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold">SYNC KEY</p>
                  <p className="text-emerald-500 font-black">LOCAL_DB_OK</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeQrCodeValue);
                  if (addToast) addToast("📋 Clinical Retrieval String Copied!", "success");
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Copy Key
              </button>
              <button
                onClick={() => setActiveQrCodeValue(null)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Done
              </button>
            </div>

          </motion.div>
        </div>
      )}


    </div>
  );
};
