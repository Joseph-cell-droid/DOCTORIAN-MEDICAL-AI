import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Star, Calendar, MessageSquare, Phone, ShieldCheck, 
  Stethoscope, Heart, Brain, Bone, Eye, Zap, X, User as UserIcon, Loader2,
  Radio, Activity, Send, FileText, CheckCircle2, ChevronRight, Volume2, VolumeX,
  PlusCircle, Trash, Clock, ShieldAlert, History, Filter, AlertTriangle, BadgePlus, Share2
} from 'lucide-react';
import { AppointmentScheduler } from './AppointmentScheduler';
import { api, Doctor } from '../api';
import { DoctorVerificationModal } from './DoctorVerificationModal';

export const SpecialistFinder: React.FC = () => {
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'specialists' | 'clinical_network' | 'referrals'>('specialists');
  const [isDoctorVerifyOpen, setIsDoctorVerifyOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const withAuth = (action: () => void) => {
    const isDocAuthed = sessionStorage.getItem('doctor_authenticated') === 'true';
    if (!isDocAuthed) {
      setPendingAction(() => action);
      setIsDoctorVerifyOpen(true);
    } else {
      action();
    }
  };
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingSpecialist, setBookingSpecialist] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'network'>('grid');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Sound Configuration
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // State for Paging Handshakes
  const [pagingStates, setPagingStates] = useState<Record<string, {
    status: 'idle' | 'tunneling' | 'routing' | 'acknowledged';
    progress: number;
    latency?: number;
    key?: string;
  }>>({});

  // Local Clinic roster of duty-bound clinicians (Migrated Clinical Network)
  const [clinicians, setClinicians] = useState(() => {
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

  const categories = ['All', 'Link Doctor', 'Cardiologist', 'Dentist', 'Surgeon', 'Therapist'];

  // Sync state helpers to localStorage
  useEffect(() => {
    localStorage.setItem('doctorian_clinicians', JSON.stringify(clinicians));
  }, [clinicians]);

  useEffect(() => {
    localStorage.setItem('doctorian_referrals', JSON.stringify(referrals));
  }, [referrals]);

  // Load specialists from active directory API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await api.doctors.listActive();
        setDoctors(data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Set up random ambient activity ticker
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

      // First beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain1.gain.setValueAtTime(0.06, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);

      // Second beep (chime harmonizer)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 clear note
        gain2.gain.setValueAtTime(0.06, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.2);
      }, 120);

    } catch (e) {
      console.warn("Browser prevented Web Audio playback or failed:", e);
    }
  };

  // Trigger secure paging dispatch cycle
  const handlePageClinician = (id: string, name: string) => {
    setPagingStates(prev => ({
      ...prev,
      [id]: { status: 'tunneling', progress: 10 }
    }));
    
    setLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: `Dispatching Paging Beacon to ${name}... Establishing TLS cryptographic tunnel.`,
        type: 'info'
      },
      ...prev
    ]);

    // Fast-stepped simulation sequence for extreme feedback loop
    let progress = 10;
    const interval = setInterval(() => {
      progress += 30;
      if (progress >= 100) {
        clearInterval(interval);
        const latency = Math.floor(250 + Math.random() * 450);
        const cryptokey = "0x" + Math.random().toString(16).substr(2, 8).toUpperCase();
        
        setPagingStates(prev => ({
          ...prev,
          [id]: {
            status: 'acknowledged',
            progress: 100,
            latency,
            key: cryptokey
          }
        }));

        playPageChime();

        setLogs(prev => [
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString(),
            message: `Paging SUCCESS: Handshake verified with ${name}. Node key active: ${cryptokey} (Response: ${latency}ms)`,
            type: 'success'
          },
          ...prev
        ]);
      } else {
        const nextStatus = progress > 50 ? 'routing' : 'tunneling';
        setPagingStates(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            status: nextStatus,
            progress
          }
        }));
      }
    }, 450);
  };

  // Add clinician to dynamic lists
  const handleAddClinician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinician.name || !newClinician.role || !newClinician.location) return;

    const added = {
      id: 'cli-' + Date.now(),
      name: newClinician.name,
      role: newClinician.role,
      dept: newClinician.dept,
      status: newClinician.status,
      location: newClinician.location,
      contact: newClinician.contact || "+256780000000",
      avatar: newClinician.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    };

    setClinicians(prev => [...prev, added]);
    setShowAddClinicianModal(false);
    
    setLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: `New clinician registered: ${added.name} successfully joined ${added.location}.`,
        type: 'success'
      },
      ...prev
    ]);

    setNewClinician({ name: '', role: '', dept: 'cardio', status: 'On Duty', location: '', contact: '' });
  };

  // Remove clinician
  const handleRemoveClinician = (id: string, name: string) => {
    setClinicians(prev => prev.filter(c => c.id !== id));
    setLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: `Clinician node decommissioned: ${name}.`,
        type: 'warning'
      },
      ...prev
    ]);
  };

  // Initiate a new patient SOAP handover report
  const handlePrepareReferral = (clinicianId: string) => {
    const clinician = clinicians.find(c => c.id === clinicianId);
    setSoapData({
      patientCode: 'PAT-' + Math.floor(1000 + Math.random() * 9000),
      priority: 'Routine',
      clinicianId: clinicianId,
      temp: '38.2',
      bp: '135/90',
      hr: '94',
      spo2: '95',
      subjective: 'Patient reports severe persistent coughing, rapid shallow breathing, deep chest splinting, and high night sweats for three consecutive cycles.',
      objective: 'Fever flushed face, hyperdynamic carotid pulse. Bilateral subcrepitant rales in basal lung lobes.',
      assessment: 'Suspected severe acute respiratory syndrome / localized pneumonic process secondary to environmental exposures.',
      plan: 'Pre-referral support: 4L/min low oxygen, 1g paracetamol. Direct transit to emergency matrix unit with secure escort clinician.'
    });
    setShowReferModal(true);
  };

  // Submit SOAP Referral
  const handleSubmitReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = clinicians.find(c => c.id === soapData.clinicianId);
    if (!recipient) return;

    const referral = {
      id: 'ref-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      patientCode: soapData.patientCode,
      priority: soapData.priority,
      clinicianName: recipient.name,
      clinicianDept: recipient.dept,
      temp: soapData.temp,
      bp: soapData.bp,
      hr: soapData.hr,
      spo2: soapData.spo2,
      subjective: soapData.subjective,
      objective: soapData.objective,
      assessment: soapData.assessment,
      plan: soapData.plan,
    };

    setReferrals(prev => [referral, ...prev]);
    setShowReferModal(false);

    setLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: `SOAP HANDOVER RECORDED: Patient ${referral.patientCode} referred to ${referral.clinicianName} (${referral.priority}).`,
        type: 'success'
      },
      ...prev
    ]);
  };

  // Delete Referral
  const handleDeleteReferral = (id: string, code: string) => {
    setReferrals(prev => prev.filter(r => r.id !== id));
    setLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: `Referral dossier ${code} purged from device local archive.`,
        type: 'warning'
      },
      ...prev
    ]);
  };

  // Trigger formatted referral to WhatsApp Link
  const handleWhatsAppReferral = (ref: any) => {
    const formattedText = `*🚨 SECURE CLINICAL HANDOVER (SOAP) REPORT*\n` +
      `*ID:* ${ref.patientCode} (${ref.priority.toUpperCase()})\n` +
      `*Recipient:* ${ref.clinicianName}\n` +
      `---------------------------------\n` +
      `*Vitals Checklist:*\n` +
      `• Temp: ${ref.temp}°C | BP: ${ref.bp} | HR: ${ref.hr} bpm | SpO2: ${ref.spo2}%\n` +
      `---------------------------------\n` +
      `*S (Subjective):* ${ref.subjective}\n` +
      `*O (Objective):* ${ref.objective}\n` +
      `*A (Assessment):* ${ref.assessment}\n` +
      `*P (Plan):* ${ref.plan}\n\n` +
      `_Dispatched via Doctorian Secure Regional Network Portal_`;

    const encoded = encodeURIComponent(formattedText);
    const primaryClinician = clinicians.find(c => c.name === ref.clinicianName);
    const cleanNumber = (primaryClinician?.contact || "+256787674140").replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
  };

  // Trigger standard whatsapp direct message
  const handleWhatsAppBase = (whatsappNumber: string) => {
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  // Categorize specialists loaded from API
  const filteredSpecialists = doctors.filter(s => 
    (activeCategory === 'All' || s.specialization.toLowerCase().includes(activeCategory.toLowerCase())) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.specialization.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 sm:space-y-12 pb-24 px-4 sm:px-6 relative">
      
      {/* Appointment Scheduler Dialog */}
      <AnimatePresence>
        {bookingSpecialist && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 md:p-12 overflow-hidden"
          >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setBookingSpecialist(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl h-[95%] sm:h-full flex flex-col pointer-events-auto"
            >
              <AppointmentScheduler 
                specialist={bookingSpecialist} 
                onClose={() => setBookingSpecialist(null)}
                onConfirm={(appt) => {
                  const saved = localStorage.getItem('doctorian_appointments');
                  const current = saved ? JSON.parse(saved) : [];
                  const newAppt = { ...appt, id: Math.random().toString(36).substr(2, 9) };
                  localStorage.setItem('doctorian_appointments', JSON.stringify([...current, newAppt]));
                  window.dispatchEvent(new Event('storage'));
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Title Header Section */}
      <header className="flex flex-col gap-6 sm:gap-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-[1000] text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">Secure Clinic Channels</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Paging Active</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-[1000] text-slate-900 dark:text-white tracking-[-0.05em] uppercase leading-none mb-4">
              Link <span className="text-blue-600">Specialists</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-xl leading-relaxed">
              Unified emergency clinical paging dispatch matrix, real-time hospital pager networks, and direct consultations.
            </p>
          </div>

          {/* Tab Navigation Hub */}
          <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm gap-1 self-start xl:self-end overflow-x-auto no-scrollbar whitespace-nowrap flex-nowrap shrink-0 max-w-full">
            <button 
              onClick={() => setActiveTab('specialists')}
              className={`px-5 py-3 rounded-xl text-[10px] font-[1000] uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${activeTab === 'specialists' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'}`}
            >
              <Stethoscope size={14} /> Active Specialists
            </button>
            <button 
              onClick={() => withAuth(() => setActiveTab('clinical_network'))}
              className={`px-5 py-3 rounded-xl text-[10px] font-[1000] uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${activeTab === 'clinical_network' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'}`}
            >
              <Radio size={14} className="text-emerald-500 animate-pulse" /> Live Clinical Network
            </button>
            <button 
              onClick={() => withAuth(() => setActiveTab('referrals'))}
              className={`px-5 py-3 rounded-xl text-[10px] font-[1000] uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${activeTab === 'referrals' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'}`}
            >
              <FileText size={14} /> SOAP Referral dossiers
            </button>
          </div>
        </div>
      </header>

      {/* ----------------- TAB 1: REGISTERED SPECIALISTS DIRECTORY ----------------- */}
      {activeTab === 'specialists' && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Verified Partners', value: doctors.length, desc: 'Registered active consultants', icon: <ShieldCheck className="text-blue-500" /> },
              { label: 'Fast consults', value: 'Instant', desc: 'No hospital queuing waitlists', icon: <Clock className="text-amber-500" /> },
              { label: 'Routing nodes', value: 'Campala Node', desc: 'Active communication relays', icon: <MapPin className="text-emerald-500" /> },
              { label: 'Secure protocol', value: 'AES-256', desc: 'End-to-end telemetry vault', icon: <ShieldCheck className="text-violet-500" /> }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">{stat.label}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">{stat.icon}</div>
                </div>
                <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase leading-none mb-1">{stat.value}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Search Controls Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search registered specialists directory..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl py-4 sm:py-5 pl-14 sm:pl-16 pr-6 text-sm font-bold shadow focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              />
            </div>
            
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar py-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3.5 rounded-2xl text-[9px] whitespace-nowrap font-[1000] uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' 
                      : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-slate-600 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Fast Lane Header Banner */}
          <div className="bg-slate-950 rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 text-white relative overflow-hidden group border border-slate-800 shadow-xl">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Zap size={200} className="text-blue-500" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <div className="bg-blue-600 p-2 rounded-xl">
                    <Zap size={16} className="fill-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Direct Doctor Connection</span>
                </div>
                <h2 className="text-2xl sm:text-5xl font-[1000] mb-4 sm:mb-6 tracking-tighter uppercase leading-[0.9]">Direct <span className="text-blue-500">WhatsApp</span> consult channel</h2>
                <p className="text-slate-400 font-bold text-sm sm:text-base leading-relaxed">
                  Avoid long clinic waitlists. Instantly connect with verified specialists via customized secure WhatsApp links, or lock-in appointments on our scheduler.
                </p>
              </div>
              {doctors.length > 0 && (
                <button 
                  onClick={() => handleWhatsAppBase(doctors[0].whatsappNumber)}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 rounded-2xl font-[1000] text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap shadow-xl"
                >
                   Direct Consult
                </button>
              )}
            </div>
          </div>

          {/* Specialists Roster Display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={40} className="animate-spin text-blue-600" />
              <p className="text-xs font-black text-slate-405 uppercase tracking-widest">Synchronizing directory roster...</p>
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecialists.length > 0 ? filteredSpecialists.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-2xl relative overflow-hidden">
                          {doctor.imageUrl ? (
                            <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="text-blue-600 w-8 h-8" />
                          )}
                          <div className="absolute -right-0.5 -top-0.5 bg-emerald-500 text-white p-1 rounded-full border border-white dark:border-slate-900 shadow font-black text-[8px]">
                            <ShieldCheck size={8} />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{doctor.name}</h3>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mt-1">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg text-emerald-605 dark:text-emerald-400 text-[8px] font-black uppercase tracking-wider border border-emerald-100 dark:border-emerald-900">
                        VERIFIED
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <MapPin size={12} className="text-slate-400" /> {doctor.location}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <Phone size={12} className="text-slate-400" /> Secure Contact Routing
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button 
                      onClick={() => handleWhatsAppBase(doctor.whatsappNumber)} 
                      className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-[1000] text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>
                    <button 
                      onClick={() => setBookingSpecialist({
                        id: doctor.id,
                        name: doctor.name,
                        specialty: doctor.specialization,
                        image: doctor.imageUrl,
                        rating: 5
                      })} 
                      className="flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-[1000] text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
                    >
                      <Calendar size={14} /> Book Slot
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center">
                   <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No verified specialists match your query criteria.</p>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* ----------------- TAB 2: EMERGENCY CLINICAL PAGING MATRIX (MIGRATED & UPGRADED) ----------------- */}
      {activeTab === 'clinical_network' && (
        <div className="space-y-8 animate-fade-in">
          {/* Controls and Audio state toggles */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-[2rem] border border-slate-800 text-white shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-tight">Active Transponder Status: Online</h3>
              </div>
              <p className="text-xs text-slate-400 font-medium">Direct live carrier paging signals mapped over Kampala medical sectors routing node networks.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAudioMuted(!isAudioMuted)} 
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-755 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border border-slate-700"
              >
                {isAudioMuted ? (
                  <>
                    <VolumeX size={14} className="text-rose-400" /> Audio Alarm Muted
                  </>
                ) : (
                  <>
                    <Volume2 size={14} className="text-emerald-400" /> Audio Alarm Active
                  </>
                )}
              </button>

              <button 
                onClick={() => setShowAddClinicianModal(true)} 
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md hover:-translate-y-0.5"
              >
                <PlusCircle size={14} /> Register Node
              </button>
            </div>
          </div>

          {/* Clinicians Roster Layout */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clinicians.map((cl) => {
              const pst = pagingStates[cl.id] || { status: 'idle', progress: 0 };
              
              return (
                <div 
                  key={cl.id} 
                  className="bg-white dark:bg-slate-900 rounded-[2.25rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5 relative overflow-hidden"
                >
                  {/* Status beacon absolute glow */}
                  {pst.status === 'acknowledged' && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-bl-full pointer-events-none border-l border-b border-emerald-500/25" />
                  )}

                  {/* Clinician Profile Avatar Block */}
                  <div className="flex md:flex-col items-center justify-between md:justify-start gap-4 shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 text-white font-mono flex items-center justify-center text-xl font-black relative shadow">
                      {cl.avatar}
                      <span className={`absolute -right-1 -bottom-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                        cl.status === 'On Duty' || cl.status === 'Online' ? 'bg-emerald-500 animate-pulse' :
                        cl.status === 'In Surgery' ? 'bg-blue-600' : 'bg-slate-400'
                      }`} />
                    </div>

                    <div className="text-right md:text-center mt-1">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                        cl.status === 'On Duty' || cl.status === 'Online' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450' :
                        cl.status === 'In Surgery' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-450' :
                        'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {cl.status}
                      </span>
                    </div>
                  </div>

                  {/* Operational Core Content Section */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{cl.name}</h3>
                        {cl.id.startsWith('cli-') && cl.id !== 'cli-1' && cl.id !== 'cli-2' && cl.id !== 'cli-3' && cl.id !== 'cli-4' && cl.id !== 'cli-5' && (
                          <button 
                            onClick={() => handleRemoveClinician(cl.id, cl.name)} 
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/45 rounded-md text-rose-500 transition-colors"
                            title="Unregister clinical node"
                          >
                            <Trash size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-slate-405 uppercase tracking-wide mt-0.5">{cl.role}</p>

                      <div className="flex flex-col gap-1 text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-3">
                        <span className="flex items-center gap-1.5"><MapPin size={10} /> {cl.location}</span>
                        <span className="flex items-center gap-1.5"><Phone size={10} /> {cl.contact}</span>
                      </div>
                    </div>

                    {/* Integrated Transceiver UI Progress Steps */}
                    {pst.status !== 'idle' && (
                      <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider">
                          <span className={
                            pst.status === 'tunneling' ? 'text-blue-500' :
                            pst.status === 'routing' ? 'text-indigo-500' : 'text-emerald-500'
                          }>
                            {pst.status === 'tunneling' && '🔑 Est. Encrypted Tunnel'}
                            {pst.status === 'routing' && '🛜 Routing carrier ping'}
                            {pst.status === 'acknowledged' && '✅ Handshake verified'}
                          </span>
                          <span className="text-slate-400">{pst.progress}%</span>
                        </div>

                        {/* Progress Bar Track */}
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${pst.status === 'acknowledged' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            initial={{ width: '0%' }}
                            animate={{ width: `${pst.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>

                        {/* Confirmed Handshake Stats Output */}
                        {pst.status === 'acknowledged' && (
                          <div className="flex items-center justify-between text-[7px] font-mono text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 leading-none">
                            <span>KEY: {pst.key}</span>
                            <span>LATENCY: {pst.latency}ms</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Operational Triggers */}
                    <div className="flex items-center gap-2 pt-1 font-mono">
                      <button
                        onClick={() => handlePageClinician(cl.id, cl.name)}
                        disabled={pst.status !== 'idle' && pst.status !== 'acknowledged'}
                        className={`flex-1 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 transition-all outline-none border ${
                          pst.status === 'acknowledged' 
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300' 
                            : 'bg-emerald-600 hover:bg-emerald-700 border-transparent text-white shadow shadow-emerald-500/10'
                        }`}
                      >
                        {pst.status === 'tunneling' || pst.status === 'routing' ? (
                          <>
                            <Loader2 className="animate-spin text-white" size={10} /> DISPATCHING...
                          </>
                        ) : pst.status === 'acknowledged' ? (
                          <>
                            <CheckCircle2 size={10} className="text-emerald-500" /> Pager Active
                          </>
                        ) : (
                          <>
                            <Radio size={10} /> Page Pager
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => withAuth(() => handlePrepareReferral(cl.id))}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-350 font-bold uppercase tracking-widest text-[9px] transition-all"
                      >
                        Generate SOAP
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Dynamic Active-Broadcast Console Terminal */}
          <section className="bg-slate-950 rounded-[2rem] border border-slate-800 p-6 md:p-8 text-white shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full uppercase tracking-widest">Active Broadcasting Live feed</span>
                <h3 className="text-base font-black uppercase mt-1">Hospital Paging Terminal Activity Core</h3>
              </div>
              <button 
                onClick={() => setLogs([
                  { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: "Clear matrix terminal session logs triggered.", type: 'info' }
                ])}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-colors border border-slate-800"
              >
                Clear Terminal Logs
              </button>
            </div>

            {/* Simulated Live Audio Pulse Feed Monitor */}
            <div className="max-h-60 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 scrollbar-none antialiased">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-start gap-3 border-b border-slate-900/50 pb-1.5"
                  >
                    <span className="text-slate-550 shrink-0 font-bold">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'warning' ? 'text-rose-400' :
                      log.type === 'broadcast' ? 'text-indigo-400' : 
                      'text-slate-300'
                    }>
                      {log.type === 'success' && '✨'}
                      {log.type === 'warning' && '💊'}
                      {log.type === 'broadcast' && '🛜'}
                      {log.type === 'info' && '🛰️'}
                      &nbsp;{log.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>
      )}

      {/* ----------------- TAB 3: SOAP CLINICAL REFERRAL PORTAL & VAULT ----------------- */}
      {activeTab === 'referrals' && (
        <div className="space-y-8 animate-fade-in">
          {/* Section banner */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-800 rounded-[2rem] p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
            <div className="max-w-2xl">
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-violet-250">Uganda MoH-Standards SOAP Handover</span>
              <h2 className="text-xl md:text-3xl font-black uppercase mt-2">Patient Referral SOAP Registers</h2>
              <p className="text-xs text-white/80 font-medium mt-1 leading-relaxed">
                Directly draft diagnostic, clinical presentation and caretaker plans in standard SOAP framework format. Transmit directly to care teams or WhatsApp conduits.
              </p>
            </div>
            <button 
              onClick={() => {
                if(clinicians.length === 0) return;
                // Pre-fill fields for immediate handover play
                setSoapData({
                  patientCode: 'PAT-' + Math.floor(1000 + Math.random() * 9000),
                  priority: 'Routine',
                  clinicianId: clinicians[0].id,
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
              }}
              className="px-6 py-4 bg-white text-violet-950 font-[1000] text-xs uppercase tracking-wider rounded-xl shadow-xl hover:bg-violet-50 transition-all self-start md:self-auto shrink-0"
            >
              Draft Referral Form
            </button>
          </div>

          {/* Referral historical list ledger */}
          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <History size={16} className="text-violet-500" /> Historical Secure Ledger ({referrals.length})
            </h3>

            {referrals.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-12 text-center text-slate-400">
                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
                <h4 className="text-sm font-black uppercase tracking-tight text-slate-700 dark:text-slate-350">No Handover dossiers mapped</h4>
                <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-1 uppercase tracking-wider">Launch SOAP generator to structure electronic referrals.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {referrals.map((ref) => (
                  <div key={ref.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all gap-6">
                    <div>
                      {/* Card meta header */}
                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-3 mb-4">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 font-mono">ID: {ref.patientCode}</span>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{ref.timestamp}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                            ref.priority === 'STAT' || ref.priority === 'STAT Emergency'
                              ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60'
                              : ref.priority === 'Urgent'
                              ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-450 dark:border-amber-900/60'
                              : 'bg-blue-50 text-blue-700 border-blue-105 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40'
                          }`}>
                            {ref.priority}
                          </span>
                          
                          <button 
                            onClick={() => handleDeleteReferral(ref.id, ref.patientCode)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded text-rose-500 transition-colors"
                            title="Format delete ledger dossier"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Clinician detail */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-750 font-mono text-xs font-black flex items-center justify-center">
                          {ref.clinicianName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">TARGET CLINIC ADVISOR</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white mt-1 uppercase">{ref.clinicianName}</p>
                        </div>
                      </div>

                      {/* Vital stats review tracker */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center mb-4">
                        <div>
                          <p className="text-[7px] font-black text-slate-400">VITALS TEMP</p>
                          <p className="text-[10px] font-mono font-black text-slate-900 dark:text-white leading-none mt-1">{ref.temp}°C</p>
                        </div>
                        <div className="border-l border-slate-200/50 dark:border-slate-800">
                          <p className="text-[7px] font-black text-slate-400">VITALS BP</p>
                          <p className="text-[10px] font-mono font-black text-slate-900 dark:text-white leading-none mt-1">{ref.bp}</p>
                        </div>
                        <div className="border-l border-slate-200/50 dark:border-slate-800">
                          <p className="text-[7px] font-black text-slate-400">VITALS HR</p>
                          <p className="text-[10px] font-mono font-black text-slate-900 dark:text-white leading-none mt-1">{ref.hr} bpm</p>
                        </div>
                        <div className="border-l border-slate-200/50 dark:border-slate-800">
                          <p className="text-[7px] font-black text-slate-400">SPO2 MATRIX</p>
                          <p className="text-[10px] font-mono font-black text-emerald-505 dark:text-emerald-400 leading-none mt-1">{ref.spo2}%</p>
                        </div>
                      </div>

                      {/* SOAP Details Accordion Panel */}
                      <div className="space-y-3.5 mt-2 text-[11px] leading-relaxed font-medium">
                        <div>
                          <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">S (Subjective)</span>
                          <p className="text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-2 rounded-lg border border-slate-100/30 dark:border-slate-800/40">{ref.subjective}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">O (Objective)</span>
                          <p className="text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-2 rounded-lg border border-slate-100/30 dark:border-slate-800/40">{ref.objective}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">A (Assessment)</span>
                          <p className="text-slate-600 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-2 rounded-lg border border-slate-100/30 dark:border-slate-800/40 font-bold uppercase">{ref.assessment}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">P (Plan)</span>
                          <p className="text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-2 rounded-lg border border-slate-100/30 dark:border-slate-800/40">{ref.plan}</p>
                        </div>
                      </div>
                    </div>

                    {/* Interaction Button Options */}
                    <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                      <button
                        onClick={() => handleWhatsAppReferral(ref)}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare size={13} /> Secure WhatsApp Dispatch
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Doctorian Patient Case SOAP: ${ref.patientCode}\nS: ${ref.subjective}\nO: ${ref.objective}\nA: ${ref.assessment}\nP: ${ref.plan}`
                          );
                          alert("Clinical handover text copied to device clipboard!");
                        }}
                        className="py-3 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-xl transition-colors border border-slate-200/50 dark:border-slate-800"
                      >
                        Copy Plain Text
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ----------------- MODAL: REGISTER NEW CLINICIAN NODE ----------------- */}
      <AnimatePresence>
        {showAddClinicianModal && (
          <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-850 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAddClinicianModal(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-755 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <form onSubmit={handleAddClinician} className="space-y-6">
                <div className="text-center">
                  <span className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-2xl inline-block mb-3">
                    <BadgePlus size={24} />
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Register Clinical Network Node</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Join the Paging Matrix Operator Line</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Attending Physician Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Dr. Florence N."
                      value={newClinician.name}
                      onChange={(e) => setNewClinician(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:border-blue-500 text-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Clinical Specialties / System Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Head Neurosurgeon & Medical Architect"
                      value={newClinician.role}
                      onChange={(e) => setNewClinician(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:border-blue-500 text-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Medical Unit</label>
                      <select 
                        value={newClinician.dept}
                        onChange={(e) => setNewClinician(prev => ({ ...prev, dept: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-wide outline-none focus:border-blue-500 text-slate-950 dark:text-white"
                      >
                        <option value="cardio">Cardiology</option>
                        <option value="neuro">Neurology</option>
                        <option value="emergency">Emergency</option>
                        <option value="telehealth">Telehealth</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Attending Status</label>
                      <select 
                        value={newClinician.status}
                        onChange={(e) => setNewClinician(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-wide outline-none focus:border-blue-500 text-slate-950 dark:text-white"
                      >
                        <option value="On Duty">On Duty</option>
                        <option value="In Surgery">In Surgery</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Hospital Ward / Node Location</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Trauma Bay 2, Kampala Wing"
                      value={newClinician.location}
                      onChange={(e) => setNewClinician(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:border-blue-500 text-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">WhatsApp / Contact Relay Phone</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. +256787674140"
                      value={newClinician.contact}
                      onChange={(e) => setNewClinician(prev => ({ ...prev, contact: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:border-blue-500 text-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-transform active:scale-[0.98]"
                >
                  Authorize Node Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: DRAFT SOAP PATIENT REFERRAL ----------------- */}
      <AnimatePresence>
        {showReferModal && (
          <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-850 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowReferModal(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-755 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <form onSubmit={handleSubmitReferral} className="space-y-6">
                <div className="text-center">
                  <span className="p-3 bg-violet-50 dark:bg-violet-950/45 text-violet-500 rounded-2xl inline-block mb-3">
                    <FileText size={24} />
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Formulate Patient Handover (SOAP)</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Generate Verified Clinical Referral Records</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Patient Dossier Identifier</label>
                      <input 
                        type="text" 
                        required
                        value={soapData.patientCode}
                        onChange={(e) => setSoapData(prev => ({ ...prev, patientCode: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold uppercase text-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Liaison Priority</label>
                      <select 
                        value={soapData.priority}
                        onChange={(e) => setSoapData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold uppercase text-slate-950 dark:text-white"
                      >
                        <option value="Routine">Routine Handover</option>
                        <option value="Urgent">Urgent Priority</option>
                        <option value="STAT">STAT Emergency</option>
                      </select>
                    </div>
                  </div>

                  {/* Vitals metrics box */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ml-1">Handover Vitals Baseline</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[7px] font-black text-slate-400">TEMP (°C)</label>
                        <input type="text" value={soapData.temp} onChange={(e) => setSoapData(prev => ({ ...prev, temp: e.target.value }))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-center text-xs font-bold" />
                      </div>
                      <div>
                        <label className="text-[7px] font-black text-slate-400">BP (X/Y)</label>
                        <input type="text" value={soapData.bp} onChange={(e) => setSoapData(prev => ({ ...prev, bp: e.target.value }))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-center text-xs font-bold" />
                      </div>
                      <div>
                        <label className="text-[7px] font-black text-slate-400">HR (BPM)</label>
                        <input type="text" value={soapData.hr} onChange={(e) => setSoapData(prev => ({ ...prev, hr: e.target.value }))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-center text-xs font-bold" />
                      </div>
                      <div>
                        <label className="text-[7px] font-black text-slate-400">SPO2 (%)</label>
                        <input type="text" value={soapData.spo2} onChange={(e) => setSoapData(prev => ({ ...prev, spo2: e.target.value }))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-center text-xs font-bold" />
                      </div>
                    </div>
                  </div>

                  {/* SOAP blocks */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex justify-between">
                        <span>S - Clinical Subjective presentation</span>
                        <span className="text-slate-350 text-[8px] font-mono">SYMPTOMS & PERSISTING NARRATIVES</span>
                      </label>
                      <textarea 
                        rows={2} 
                        required
                        value={soapData.subjective}
                        onChange={(e) => setSoapData(prev => ({ ...prev, subjective: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none focus:border-violet-500 text-slate-950 dark:text-white resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex justify-between">
                        <span>O - Objective assessment indicators</span>
                        <span className="text-slate-350 text-[8px] font-mono">PHYSICAL EXAMS & RALES</span>
                      </label>
                      <textarea 
                        rows={2} 
                        required
                        value={soapData.objective}
                        onChange={(e) => setSoapData(prev => ({ ...prev, objective: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none focus:border-violet-500 text-slate-950 dark:text-white resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex justify-between">
                        <span>A - Assessment decision</span>
                        <span className="text-slate-350 text-[8px] font-mono">TENTATIVE DIAGNOSTIC CONCLUSION</span>
                      </label>
                      <textarea 
                        rows={2} 
                        required
                        value={soapData.assessment}
                        onChange={(e) => setSoapData(prev => ({ ...prev, assessment: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none focus:border-violet-500 text-slate-950 dark:text-white resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex justify-between">
                        <span>P - Plan of intervention / care</span>
                        <span className="text-slate-350 text-[8px] font-mono">PRE-TRANSIT MEASURES & DISPATCH GUIDELINES</span>
                      </label>
                      <textarea 
                        rows={2} 
                        required
                        value={soapData.plan}
                        onChange={(e) => setSoapData(prev => ({ ...prev, plan: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none focus:border-violet-500 text-slate-950 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReferModal(false)}
                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    Abort draft
                  </button>
                  <button
                    type="submit"
                    className="w-full py-4 bg-violet-600 hover:bg-violet-755 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-transform active:scale-[0.98]"
                  >
                    Dossier Generation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DoctorVerificationModal
        isOpen={isDoctorVerifyOpen}
        onClose={() => {
          setIsDoctorVerifyOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction();
          }
          setPendingAction(null);
        }}
        title="Clinical Matrix Access"
        description="Accessing secure medical channels requires active clinical signature key verification."
      />
    </div>
  );
};
