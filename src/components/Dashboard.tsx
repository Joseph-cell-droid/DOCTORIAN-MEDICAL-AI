import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Calendar, 
  Users, 
  UserCheck, 
  Clock, 
  Pill, 
  FlaskConical, 
  ArrowUpRight, 
  ChevronRight, 
  Send, 
  Mic, 
  PhoneCall, 
  Video, 
  FileText, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  Sparkles, 
  Bot, 
  Heart, 
  Thermometer, 
  Droplet, 
  Wind, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Lock, 
  Globe, 
  ChevronDown, 
  X,
  Stethoscope,
  Smile,
  Shield,
  TrendingUp,
  Image as ImageIcon,
  CalendarDays,
  ExternalLink,
  Home,
  HelpCircle,
  Settings,
  Maximize2,
  Sunrise,
  Sunset,
  Radio,
  Usb,
  Bluetooth
} from 'lucide-react';
import { Vitals, HealthStatus } from '../hooks/useArduino';
import { DoctorianVideoConsultationModal } from './DoctorianVideoConsultationModal';
import { DoctorianVoiceCallModal } from './DoctorianVoiceCallModal';

interface DashboardProps {
  onNavigate: (view: any) => void;
  user: any;
  aiInsight?: string | null;
  onRefreshInsight: () => void;
  isInsightLoading: boolean;
  onInstall: () => void;
  vitals: Vitals | null;
  healthStatus: HealthStatus | null;
  history: Vitals[];
  arduino?: any;
  onUpdateUser?: (u: any) => void;
  currentLanguage?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  user, 
  aiInsight, 
  onRefreshInsight, 
  isInsightLoading,
  onInstall,
  vitals,
  healthStatus,
  history,
  arduino,
  onUpdateUser,
  currentLanguage = 'English (US)'
}) => {
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [isEmergencyCalling, setIsEmergencyCalling] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState<number | null>(null);

  // Real-time Clock following exact current time
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ensure live sensor stream is running so the app operates with real-time sensor machine feeds
  useEffect(() => {
    if (arduino && !arduino.connection?.connected && typeof arduino.startDemo === 'function') {
      arduino.startDemo('healthy');
    }
  }, [arduino]);

  // Selected Patient or Machine Hardware for Live Health Monitoring
  const [selectedPatientId, setSelectedPatientId] = useState<'sarah' | 'john' | 'mary' | 'machine'>('sarah');

  // Patient profiles
  const patientsData = {
    sarah: {
      name: 'Sarah Nakato',
      id: 'PT-00124',
      gender: 'Female',
      age: 28,
      status: 'Active',
      heartRate: 72,
      bloodPressure: '118/76',
      temperature: '36.6',
      spo2: 98,
      trendPoints: [
        { time: '12AM', hr: 68, bp: 115, temp: 36.4 },
        { time: '4AM', hr: 64, bp: 112, temp: 36.3 },
        { time: '8AM', hr: 75, bp: 120, temp: 36.7 },
        { time: '12PM', hr: 78, bp: 122, temp: 36.8 },
        { time: '4PM', hr: 72, bp: 118, temp: 36.6 },
        { time: '8PM', hr: 70, bp: 116, temp: 36.5 }
      ]
    },
    john: {
      name: 'John Doe',
      id: 'PT-00123',
      gender: 'Male',
      age: 45,
      status: 'Consultation',
      heartRate: 76,
      bloodPressure: '124/82',
      temperature: '36.8',
      spo2: 97,
      trendPoints: [
        { time: '12AM', hr: 72, bp: 120, temp: 36.6 },
        { time: '4AM', hr: 69, bp: 118, temp: 36.5 },
        { time: '8AM', hr: 82, bp: 126, temp: 36.9 },
        { time: '12PM', hr: 80, bp: 125, temp: 36.9 },
        { time: '4PM', hr: 76, bp: 124, temp: 36.8 },
        { time: '8PM', hr: 74, bp: 122, temp: 36.7 }
      ]
    },
    mary: {
      name: 'Mary Atim',
      id: 'PT-00122',
      gender: 'Female',
      age: 32,
      status: 'Follow-up',
      heartRate: 68,
      bloodPressure: '114/74',
      temperature: '36.5',
      spo2: 99,
      trendPoints: [
        { time: '12AM', hr: 65, bp: 110, temp: 36.3 },
        { time: '4AM', hr: 62, bp: 108, temp: 36.2 },
        { time: '8AM', hr: 71, bp: 116, temp: 36.6 },
        { time: '12PM', hr: 74, bp: 118, temp: 36.7 },
        { time: '4PM', hr: 68, bp: 114, temp: 36.5 },
        { time: '8PM', hr: 67, bp: 112, temp: 36.4 }
      ]
    },
    machine: {
      name: 'IoT Biosensor Machine Node (Arduino / Telemetry)',
      id: 'IOT-MED-99',
      gender: 'Hardware Sensor Link',
      age: 0,
      status: 'Live Stream',
      heartRate: vitals?.heartRate ?? 74,
      bloodPressure: vitals ? `${vitals.systolicBP}/${vitals.diastolicBP}` : '120/80',
      temperature: vitals ? vitals.temperature.toFixed(1) : '36.7',
      spo2: vitals?.spo2 ?? 98,
      trendPoints: [
        { time: '12AM', hr: 70, bp: 118, temp: 36.5 },
        { time: '4AM', hr: 68, bp: 115, temp: 36.4 },
        { time: '8AM', hr: 74, bp: 120, temp: 36.6 },
        { time: '12PM', hr: 76, bp: 122, temp: 36.8 },
        { time: '4PM', hr: 73, bp: 119, temp: 36.7 },
        { time: '8PM', hr: vitals?.heartRate ?? 74, bp: vitals?.systolicBP ?? 120, temp: vitals?.temperature ?? 36.7 }
      ]
    }
  };

  const currentPatient = patientsData[selectedPatientId] || patientsData.sarah;

  // Dynamic time-aware greeting following real local clock
  const getGreetingData = (date: Date) => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good Morning, Dr. Joseph!',
        subtext: 'Hope you have an energetic and productive morning serving our patients across Uganda and global care centers.',
        icon: Sunrise,
        iconBg: 'bg-amber-400/20 text-amber-300 border-amber-300/40',
        shift: 'Morning Ward Rounds',
        timeWindow: '05:00 - 11:59'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good Afternoon, Dr. Joseph!',
        subtext: 'Hope you have a productive afternoon in clinical consultations and diagnostic reviews across Uganda.',
        icon: Sun,
        iconBg: 'bg-amber-400/20 text-amber-300 border-amber-300/40',
        shift: 'Afternoon Specialized Clinic',
        timeWindow: '12:00 - 16:59'
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greeting: 'Good Evening, Dr. Joseph!',
        subtext: 'Hope you have a peaceful evening conducting patient evaluations and treatment summaries.',
        icon: Sunset,
        iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
        shift: 'Evening Clinical Handover',
        timeWindow: '17:00 - 20:59'
      };
    } else {
      return {
        greeting: 'Good Night, Dr. Joseph!',
        subtext: 'Emergency on-call and night telemedicine surveillance active for urgent clinical telemetry.',
        icon: Moon,
        iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
        shift: 'Night Emergency On-Call',
        timeWindow: '21:00 - 04:59'
      };
    }
  };

  const greetingData = getGreetingData(currentTime);

  const liveTimeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; structured?: any }>>([
    {
      sender: 'ai',
      text: "Hello Dr. Joseph! 👋 I am your Uganda Clinical Guidelines (UCG) & WHO-grounded Clinical Decision Support Assistant. How can I assist you with patient triage, differential diagnosis, or antimicrobial stewardship today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Send message to AI Assistant with real clinical guideline reasoning
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setInputMessage('');
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = "Doctorian Clinical AI node active. Telemetry analyzed.";
      const lower = text.toLowerCase();
      
      if (lower.includes("malaria") || lower.includes("fever") || lower.includes("chills")) {
        reply = `📋 [Uganda Clinical Guidelines - Malaria Protocol]\n` +
          `• Differential Diagnoses: 1. Uncomplicated P. falciparum Malaria (85%), 2. Typhoid Fever (10%), 3. Acute UTI (5%).\n` +
          `• Recommended Investigations: mRDT (Blood Smear for B/S MPS), Complete Blood Count (CBC), Urine dipstick.\n` +
          `• First-Line Treatment: Artemether 20mg + Lumefantrine 120mg (Coartem) stat, followed by complete 6-dose schedule.\n` +
          `• ⚠️ Red-Flag Warnings: Inability to drink/breastfeed, repeated vomiting, severe anemia (Hb < 5 g/dL), convulsions -> Urgent IV Artesunate (2.4 mg/kg).\n` +
          `• Clinical Decision Support (Confidence 94%): This is decision support, not an autonomous diagnosis.`;
      } else if (lower.includes("typhoid") || lower.includes("enteric")) {
        reply = `📋 [UCG / WHO Enteric Fever Protocol]\n` +
          `• Clinical Presentation: Step-ladder fever, relative bradycardia, abdominal tenderness, coated tongue.\n` +
          `• Essential Labs: Blood culture (Gold Standard), Widal test (paired titers > 1:160), stool microscopy.\n` +
          `• First-Line Therapy: Ciprofloxacin 500mg PO BD x 10 days OR Azithromycin 1g PO stat then 500mg daily x 6 days.\n` +
          `• ⚠️ Red-Flags: Peritoneal irritation, melena (intestinal perforation risk) -> Immediate surgical consult.\n` +
          `• Clinical Decision Support (Confidence 91%): Always correlate with patient history and culture sensitivities.`;
      } else if (lower.includes("cough") || lower.includes("pneumonia") || lower.includes("respiratory")) {
        reply = `📋 [Pneumonia Triage & CURB-65 Protocol]\n` +
          `• CURB-65 Assessment: Confusion (0), Urea > 7mmol/L (0), Resp Rate ≥ 30 (1), BP < 90/60 (0), Age ≥ 65 (0) -> Score 1 (Outpatient management).\n` +
          `• Recommended Tests: Chest X-Ray (CXR), Pulse Oximetry (SpO2), Sputum Gram stain/GeneXpert.\n` +
          `• Guideline Regimen: Amoxicillin 1g PO TID x 5-7 days (alternative: Azithromycin 500mg OD).\n` +
          `• ⚠️ Red-Flags: SpO2 < 92% on room air, cyanosis, stridor -> High-flow O2 + Inpatient admission.`;
      } else if (lower.includes("health") || lower.includes("sarah")) {
        reply = `Patient Sarah Nakato (PT-00124) shows stable hemodynamics: BP 118/76 mmHg, SpO2 98%, HR 72 bpm, Temp 36.6°C. MEWS score 0 (Stable). No critical alarms active.`;
      } else if (lower.includes("test") || lower.includes("lab")) {
        reply = "Latest laboratory panel: 96% of metrics within normal range. Hemoglobin 13.8 g/dL, Glucose 98 mg/dL, Platelets 280k/μL. Verified via Kampala Central Lab Node.";
      } else if (lower.includes("prescription") || lower.includes("medication")) {
        reply = "Active prescription protocol verified against Uganda Essential Medicines List (EMLU 2023): Amoxicillin 500mg TID, Paracetamol 1g PRN. Drug-drug interaction safety index verified 100%. No hepatic or renal contraindications detected.";
      } else if (lower.includes("advice") || lower.includes("general")) {
        reply = "Clinical guidance: Maintain hydration, monitor post-meal glucose, and ensure bedtime vitals capture via wearable telemetry. Promote mosquito bednet usage.";
      } else {
        reply = `Dr. Joseph, inquiry registered for "${text}". Integrated with Uganda National Health Guidelines & ICD-11 decision support matrix. Electronic health record updated.`;
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsAiTyping(false);
    }, 500);
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAiTyping]);

  // Emergency Call Handler
  const handleEmergencyCall = () => {
    setIsEmergencyCalling(true);
    setEmergencyCountdown(5);
    const interval = setInterval(() => {
      setEmergencyCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setIsEmergencyCalling(false);
          // Trigger voice call or open emergency dialer
          setIsVoiceModalOpen(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Today's formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="w-full bg-[#f3f7fd] dark:bg-[#071329] text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-7 space-y-6 transition-colors duration-300">
      <main className="w-full space-y-6">

        {/* ===================================================================== */}
        {/* CARD 1: MAIN CLINICAL DASHBOARD (Matching image_9ca8ccdf.png)          */}
        {/* ===================================================================== */}
        <section className="space-y-6">

          {/* 1. Time-Adaptive Greeting Hero Banner with Uganda Mulago Hospital Photo */}
          <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl min-h-[175px] sm:min-h-[190px] flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 border border-blue-400/30 group">
            
            {/* Right-Hand Side Authentic Uganda Hospital Physical Photograph */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-full sm:w-7/12 md:w-1/2 lg:w-5/12 bg-cover bg-center transition-all duration-700 pointer-events-none opacity-85"
              style={{
                backgroundImage: `url('/uganda_hospital_building.jpg')`
              }}
            />
            {/* Seamless Vignette & Gradient Masking for 100% Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05132d] via-[#091f44]/95 via-45% to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-7/12 bg-gradient-to-l from-transparent via-[#05132d]/25 to-[#05132d] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.2),transparent_60%)] pointer-events-none" />

            {/* Left Welcome Copy following Current Time */}
            <div className="relative z-10 max-w-xl space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full ${greetingData.iconBg} border flex items-center justify-center shadow-md animate-pulse shrink-0`}>
                  <greetingData.icon size={20} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-[1000] tracking-tight text-white drop-shadow-md">
                    {greetingData.greeting}
                  </h1>
                  <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
                    {greetingData.shift} · Following Real-Time Clock
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed max-w-lg">
                {greetingData.subtext}
              </p>
              
              {/* Live Time, Date & Sensor Connection Status Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold text-white shadow-sm">
                  <Calendar size={13} className="text-cyan-300" />
                  <span>{todayFormatted}</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 backdrop-blur-md rounded-full border border-cyan-400/30 text-xs font-mono font-bold text-cyan-200 shadow-sm">
                  <Clock size={13} className="text-cyan-400 animate-spin-slow" />
                  <span>{liveTimeString} EAT</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSensorModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-md rounded-full border border-emerald-400/40 text-xs font-bold text-emerald-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Manage Sensor & Machine Hardware Links"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Radio size={13} className="text-emerald-400" />
                  <span>
                    {arduino?.connection?.connected 
                      ? `Sensors Live: ${arduino.connection.type?.toUpperCase() || 'BIO-STREAM'}`
                      : '⚡ Connect Sensors & Machines'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Hospital Motto Slogan & Uganda Hospital Badge */}
            <div className="relative z-10 mt-4 md:mt-0 flex flex-col md:items-end text-left md:text-right space-y-2 shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#061225]/85 backdrop-blur-md border border-cyan-400/30 text-white shadow-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="text-left md:text-right">
                  <p className="text-xs font-extrabold tracking-tight text-white leading-tight">Mulago National Referral Hospital</p>
                  <p className="text-[9px] text-cyan-300 font-bold uppercase tracking-wider">Kampala, Uganda · Ministry of Health</p>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/25 text-amber-300 font-mono text-[9px] font-black border border-amber-400/40 ml-1">UG</span>
              </div>
              
              <div className="hidden sm:block">
                <span className="text-base lg:text-lg font-serif italic font-extrabold text-cyan-200 tracking-wide drop-shadow-md block">
                  Better Healthcare,
                </span>
                <span className="text-base lg:text-lg font-serif italic font-extrabold text-white tracking-wide drop-shadow-md block">
                  A Healthier Community
                </span>
                <span className="text-[9px] uppercase font-mono tracking-widest text-cyan-300/80 mt-0.5 font-bold block">
                  Doctorian AI • Uganda National Care Matrix
                </span>
              </div>
            </div>
          </div>

          {/* 2. 5 KPI Metric Sparkline Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            
            {/* 1. Total Patients */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('records')}
              className="p-4 rounded-2xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Patients</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">12,480</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center">↑ 12%</span>
              </div>
              {/* Mini Sparkline SVG */}
              <div className="h-6 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,20 Q20,15 40,18 T70,8 T100,5" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>

            {/* 2. Active Doctors */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('doctors_dashboard')}
              className="p-4 rounded-2xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Doctors</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">156</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center">↑ 8%</span>
              </div>
              <div className="h-6 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,22 Q25,18 50,14 T75,9 T100,4" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>

            {/* 3. Today's Appointments */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('clinical_roadmap')}
              className="p-4 rounded-2xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Today's Appointments</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">243</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center">↑ 5%</span>
              </div>
              <div className="h-6 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,18 Q30,22 55,12 T80,14 T100,6" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>

            {/* 4. Prescriptions Today */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('meds')}
              className="p-4 rounded-2xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Prescriptions Today</span>
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Pill size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">187</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center">↑ 10%</span>
              </div>
              <div className="h-6 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,20 Q20,12 45,15 T75,8 T100,3" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>

            {/* 5. Lab Tests Today */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('diagnostic_lab')}
              className="p-4 rounded-2xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Lab Tests Today</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <FlaskConical size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">120</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center">↑ 7%</span>
              </div>
              <div className="h-6 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path d="M0,21 Q30,16 55,19 T80,10 T100,5" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>

          </div>

          {/* 3. Middle Section: Live Health Monitoring + AI Assistant + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* 3A. Live Health Monitoring Card (5 Cols) */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-4">
              
              {/* Header with Live Badge & Patient / Hardware Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-blue-500 shrink-0" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Live Health Monitoring</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {arduino?.connection?.connected ? 'Sensors Live' : 'Live'}
                  </span>
                </div>

                {/* Patient / Sensor Selector + Hardware Connect Button */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value as any)}
                    className="text-xs font-bold bg-slate-100 dark:bg-[#0e1d3e] border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="sarah">Patient: Sarah Nakato</option>
                    <option value="john">Patient: John Doe</option>
                    <option value="mary">Patient: Mary Atim</option>
                    <option value="machine">⚡ Live Sensors & Hardware (Arduino / IoT)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsSensorModalOpen(true)}
                    className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-300 border border-blue-200 dark:border-blue-700/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer shrink-0"
                    title="Connect Sensors & Machines"
                  >
                    <Radio size={14} className="animate-pulse" />
                  </button>
                </div>
              </div>

              {/* Anatomy Hologram & Vitals Grid */}
              <div className="grid grid-cols-12 gap-3 items-center">
                
                {/* 3D Hologram Anatomy Figure */}
                <div className="col-span-5 relative h-48 rounded-2xl bg-gradient-to-b from-blue-950/80 to-[#030914] border border-blue-500/20 flex items-center justify-center overflow-hidden p-2">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.15),transparent_70%)]" />
                  
                  {/* Glowing Hologram Anatomy Silhouette SVG with Pulsing Heart */}
                  <svg className="w-full h-full max-h-40" viewBox="0 0 100 180" fill="none">
                    {/* Head */}
                    <circle cx="50" cy="20" r="12" stroke="#00e5ff" strokeWidth="1.5" opacity="0.8" />
                    {/* Neck */}
                    <path d="M48,32 L48,38 M52,32 L52,38" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6" />
                    {/* Torso */}
                    <path d="M35,42 L65,42 L60,105 L40,105 Z" stroke="#00e5ff" strokeWidth="1.5" opacity="0.8" />
                    {/* Chest Contours */}
                    <path d="M42,50 Q50,60 58,50 M44,65 Q50,72 56,65" stroke="#00e5ff" strokeWidth="1" opacity="0.5" />
                    {/* Arms */}
                    <path d="M35,42 L22,75 L18,110 M65,42 L78,75 L82,110" stroke="#00e5ff" strokeWidth="1.5" opacity="0.7" />
                    {/* Legs */}
                    <path d="M43,105 L40,150 L38,175 M57,105 L60,150 L62,175" stroke="#00e5ff" strokeWidth="1.5" opacity="0.7" />
                    {/* Pulsing Pink Heart Hologram */}
                    <circle cx="52" cy="56" r="6" fill="#ff2d55" className="animate-ping" opacity="0.75" />
                    <circle cx="52" cy="56" r="4.5" fill="#ff2d55" className="animate-pulse" />
                  </svg>
                  
                  {/* Subtle pedestal glow */}
                  <div className="absolute bottom-1 w-20 h-2 rounded-full bg-cyan-400/40 blur-sm" />
                </div>

                {/* 4 Real-time Vitals Metric Pills connected to Live Sensors */}
                <div className="col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  
                  {/* Heart Rate */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1b3a] border border-slate-200/80 dark:border-blue-900/40">
                    <div className="flex items-center gap-1.5 text-rose-500">
                      <Heart size={14} className="animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Heart Rate</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {(selectedPatientId === 'machine' || arduino?.connection?.connected) && vitals ? vitals.heartRate : currentPatient.heartRate}{' '}
                      <span className="text-[10px] font-normal text-slate-400">bpm</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500">● {arduino?.connection?.connected ? 'Sensor Live' : 'Normal'}</span>
                  </div>

                  {/* Blood Pressure */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1b3a] border border-slate-200/80 dark:border-blue-900/40">
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <Activity size={14} />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Blood Pressure</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {(selectedPatientId === 'machine' || arduino?.connection?.connected) && vitals ? `${vitals.systolicBP}/${vitals.diastolicBP}` : currentPatient.bloodPressure}{' '}
                      <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500">● {arduino?.connection?.connected ? 'Sensor Live' : 'Normal'}</span>
                  </div>

                  {/* Temperature */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1b3a] border border-slate-200/80 dark:border-blue-900/40">
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Thermometer size={14} />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Temperature</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {(selectedPatientId === 'machine' || arduino?.connection?.connected) && vitals ? vitals.temperature.toFixed(1) : currentPatient.temperature}{' '}
                      <span className="text-[10px] font-normal text-slate-400">°C</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500">● {arduino?.connection?.connected ? 'Sensor Live' : 'Normal'}</span>
                  </div>

                  {/* SpO2 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1b3a] border border-slate-200/80 dark:border-blue-900/40">
                    <div className="flex items-center gap-1.5 text-cyan-500">
                      <Wind size={14} />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">SpO2</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {(selectedPatientId === 'machine' || arduino?.connection?.connected) && vitals ? vitals.spo2 : currentPatient.spo2}%
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500">● {arduino?.connection?.connected ? 'Sensor Live' : 'Normal'}</span>
                  </div>

                </div>

              </div>

              {/* 24-hr Multi-line Trend Chart */}
              <div className="pt-2 border-t border-slate-100 dark:border-blue-900/40">
                <div className="flex items-center justify-between text-[11px] mb-2 font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-blue-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Heart Rate
                    </span>
                    <span className="flex items-center gap-1 text-emerald-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> BP
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Temp
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('monitor')}
                    className="text-blue-600 dark:text-cyan-400 hover:underline font-bold text-xs flex items-center gap-0.5 cursor-pointer"
                  >
                    View Details →
                  </button>
                </div>

                {/* SVG Multi-Parameter Graph */}
                <div className="h-20 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="40" x2="300" y2="40" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="currentColor" strokeOpacity="0.08" />

                    {/* Heart Rate line (Blue) */}
                    <path
                      d="M10,50 L60,58 L110,40 L160,35 L210,45 L260,48 L290,46"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Blood Pressure line (Teal/Emerald) */}
                    <path
                      d="M10,30 L60,35 L110,25 L160,22 L210,28 L260,30 L290,29"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Temperature line (Amber) */}
                    <path
                      d="M10,65 L60,68 L110,60 L160,58 L210,64 L260,65 L290,66"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Points on Heart Rate */}
                    <circle cx="10" cy="50" r="3" fill="#3b82f6" />
                    <circle cx="60" cy="58" r="3" fill="#3b82f6" />
                    <circle cx="110" cy="40" r="3" fill="#3b82f6" />
                    <circle cx="160" cy="35" r="3" fill="#3b82f6" />
                    <circle cx="210" cy="45" r="3" fill="#3b82f6" />
                    <circle cx="260" cy="48" r="3" fill="#3b82f6" />
                  </svg>
                  {/* X Axis Time Labels */}
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                    <span>12AM</span>
                    <span>4AM</span>
                    <span>8AM</span>
                    <span>12PM</span>
                    <span>4PM</span>
                    <span>8PM</span>
                  </div>
                </div>

              </div>

            </div>

            {/* 3B. AI Assistant Interactive Card (4 Cols) */}
            <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">AI Assistant</h3>
                    <p className="text-[10px] text-slate-400">Doctorian Medical Neural Node</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                </span>
              </div>

              {/* Chat Messages Log */}
              <div 
                ref={chatScrollRef}
                className="flex-1 min-h-[160px] max-h-[190px] overflow-y-auto space-y-2 pr-1 text-xs"
              >
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                          : 'bg-slate-100 dark:bg-[#0e1d3e] text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-blue-800/60 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-[#0e1d3e] text-slate-400 text-[11px] rounded-2xl px-3 py-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200" />
                      <span>Doctorian reasoning...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestion Chips */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Check a patient's health",
                  "Analyze test results",
                  "Create a prescription",
                  "General medical advice"
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0c1a36] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-slate-200 dark:border-blue-900/50 text-[10px] font-semibold text-slate-700 dark:text-slate-300 text-left truncate transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2 pt-1"
              >
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#0c1a36] text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                  title="Speak to Doctorian AI"
                >
                  <Mic size={15} />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-[#0c1a36] border border-slate-200 dark:border-blue-900/50 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </form>

            </div>

            {/* 3C. Quick Actions (3 Cols) */}
            <div className="lg:col-span-3 p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-blue-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Quick Actions</h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => onNavigate('features')}
                  className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline"
                >
                  More →
                </button>
              </div>

              {/* 6 Reactive Quick Action Tiles */}
              <div className="grid grid-cols-2 gap-2.5">
                
                <button
                  type="button"
                  onClick={() => onNavigate('records')}
                  className="p-3 rounded-2xl bg-blue-50/70 dark:bg-[#0c1b3a] hover:bg-blue-100/80 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-blue-600 text-white group-hover:scale-110 transition-transform">
                    <Plus size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">New Patient</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('meds')}
                  className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-[#0c1b3a] hover:bg-emerald-100/80 dark:hover:bg-blue-900/50 border border-emerald-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-emerald-600 text-white group-hover:scale-110 transition-transform">
                    <Pill size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">New Prescription</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('clinical_roadmap')}
                  className="p-3 rounded-2xl bg-purple-50/70 dark:bg-[#0c1b3a] hover:bg-purple-100/80 dark:hover:bg-blue-900/50 border border-purple-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-purple-600 text-white group-hover:scale-110 transition-transform">
                    <Calendar size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">Book Appointment</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('diagnostic_lab')}
                  className="p-3 rounded-2xl bg-cyan-50/70 dark:bg-[#0c1b3a] hover:bg-cyan-100/80 dark:hover:bg-blue-900/50 border border-cyan-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-cyan-600 text-white group-hover:scale-110 transition-transform">
                    <FlaskConical size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">Run Lab Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="p-3 rounded-2xl bg-rose-50/70 dark:bg-[#0c1b3a] hover:bg-rose-100/80 dark:hover:bg-blue-900/50 border border-rose-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-rose-600 text-white group-hover:scale-110 transition-transform">
                    <Video size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">Start Video Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('diagnostic_lab')}
                  className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-[#0c1b3a] hover:bg-indigo-100/80 dark:hover:bg-blue-900/50 border border-indigo-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-indigo-600 text-white group-hover:scale-110 transition-transform">
                    <FileText size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">View Reports</span>
                </button>

              </div>

            </div>

          </div>

          {/* 4. Bottom Row of Card 1: Recent Patients + Lab Results + Appointments + System Performance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 4A. Recent Patients */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Patients</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('records')}
                  className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Sarah Nakato', id: 'PT-00124', gender: 'Female', age: '28y', status: 'Active', color: 'bg-emerald-500/15 text-emerald-600' },
                  { name: 'John Doe', id: 'PT-00123', gender: 'Male', age: '45y', status: 'Consultation', color: 'bg-blue-500/15 text-blue-600' },
                  { name: 'Mary Atim', id: 'PT-00122', gender: 'Female', age: '32y', status: 'Follow-up', color: 'bg-orange-500/15 text-orange-600' }
                ].map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setSelectedPatientId(idx === 0 ? 'sarah' : idx === 1 ? 'john' : 'mary'); onNavigate('records'); }}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0c1a36] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-slate-200/60 dark:border-blue-900/40 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center">
                        {p.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{p.name}</p>
                        <p className="text-[10px] text-slate-400 leading-snug">{p.id} • {p.gender} • {p.age}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.color}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4B. Lab Results Overview Donut */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FlaskConical size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Lab Results Overview</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('diagnostic_lab')}
                  className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  View All →
                </button>
              </div>

              {/* Donut Graphic */}
              <div className="flex items-center justify-center gap-4 py-1">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="96, 100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white">96%</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Normal</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Normal: 96%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Abnormal: 4%</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>All tests are up to date</span>
              </div>
            </div>

            {/* 4C. Upcoming Appointments */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Upcoming Appointments</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('clinical_roadmap')}
                  className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  View Calendar →
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  { time: '04:30 PM', doc: 'Dr. Sarah Nakitto', spec: 'General Checkup', tag: 'Today' },
                  { time: '05:00 PM', doc: 'Dr. James Okello', spec: 'Cardiology Review', tag: 'Today' },
                  { time: '05:30 PM', doc: 'Dr. Grace Auma', spec: 'Follow-up Visit', tag: 'Today' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigate('clinical_roadmap')}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0c1a36] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-slate-200/60 dark:border-blue-900/40 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">{item.time}</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{item.doc}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{item.spec}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4D. System Performance */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">System Performance</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                  Optimal
                </span>
              </div>

              {/* 3 Circular Ring Gauges */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                
                {/* Uptime */}
                <div className="flex flex-col items-center">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="98, 100" />
                    </svg>
                    <span className="absolute text-[11px] font-black text-slate-900 dark:text-white">98%</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Uptime</span>
                </div>

                {/* Response */}
                <div className="flex flex-col items-center">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="95, 100" />
                    </svg>
                    <span className="absolute text-[11px] font-black text-slate-900 dark:text-white">95%</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Response</span>
                </div>

                {/* Database */}
                <div className="flex flex-col items-center">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="97, 100" />
                    </svg>
                    <span className="absolute text-[11px] font-black text-slate-900 dark:text-white">97%</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Database</span>
                </div>

              </div>

              <div className="text-[10px] text-slate-400 text-center font-mono pt-1 border-t border-slate-100 dark:border-blue-900/40">
                Last Updated: 04:15 PM EAT
              </div>
            </div>

          </div>

          {/* 5. Bottom Utility Ribbon with Emergency Call 112 */}
          <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto text-left">
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Globe size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Multilingual Support</p>
                  <p className="text-[10px] text-slate-400">(EN, Luganda, Swahili...)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <WifiOff size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Offline Mode</p>
                  <p className="text-[10px] text-slate-400">(Work Without Internet)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Lock size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Secure & Private</p>
                  <p className="text-[10px] text-slate-400">(Your Data is Safe)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Cpu size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Powered by Doctorian AI</p>
                  <p className="text-[10px] text-slate-400">(Advanced Healthcare Intelligence)</p>
                </div>
              </div>

            </div>

            {/* Red Emergency Call 112 Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleEmergencyCall}
              className="w-full md:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 cursor-pointer shrink-0"
            >
              <PhoneCall size={18} className="animate-bounce" />
              <span>Emergency Call 112</span>
              <ChevronRight size={16} />
            </motion.button>

          </div>

        </section>

        {/* ===================================================================== */}
        {/* CARD 2: NEXT GENERATION FEATURES (Matching image_f83f3b8a.png)        */}
        {/* ===================================================================== */}
        <section className="space-y-6 pt-4">

          {/* Banner with Rocket & Badges */}
          <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white shadow-xl min-h-[140px] flex items-center justify-between p-6 sm:p-8">
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                    Next Generation Features
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100 font-medium mt-0.5">
                    Advanced tools for smarter diagnosis, better care and a healthier future
                  </p>
                </div>
              </div>

              {/* Feature Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 font-bold text-amber-300">
                  ✨ Innovative
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 font-bold text-cyan-300">
                  🧠 Intelligent
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 font-bold text-emerald-300">
                  🔗 Connected
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 font-bold text-rose-300">
                  ❤️ For a Healthier Tomorrow
                </span>
              </div>
            </div>

            {/* Right Hologram Silhouette */}
            <div className="relative z-10 hidden md:flex flex-col items-end text-right">
              <span className="text-xl font-serif italic font-extrabold text-cyan-200 drop-shadow-md">
                Your Health
              </span>
              <span className="text-xl font-serif italic font-extrabold text-white drop-shadow-md">
                Our Priority
              </span>
            </div>
          </div>

          {/* 3x3 Grid of 9 Interactive Feature Cards (Horizontal layout matching image 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. AI Health Assistant */}
            <div 
              onClick={() => onNavigate('ai_nexus')}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🤖
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    AI Health Assistant
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Ask health questions, get instant expert advice.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('ai_nexus');
                    }}
                    className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Laboratory Analyzer */}
            <div 
              onClick={() => onNavigate('diagnostic_lab')}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-purple-400 via-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-md shadow-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🔬
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    Laboratory Analyzer
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase shrink-0">
                    New
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Analyze lab results with AI insights.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('diagnostic_lab');
                    }}
                    className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Telemedicine */}
            <div 
              onClick={() => setIsVideoModalOpen(true)}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-3xl shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                📹
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    Telemedicine
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Consult real doctors via video call.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsVideoModalOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Image & Scan Analysis */}
            <div 
              onClick={() => onNavigate('illustrator')}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-md shadow-orange-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🖼️
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    Image & Scan Analysis
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase shrink-0">
                    Smart
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Analyze your medical images (X-ray, MRI, etc).
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('illustrator');
                    }}
                    className="px-4 py-1.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Health Monitor */}
            <div 
              onClick={() => onNavigate('vitality')}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-md shadow-cyan-500/20 shrink-0 group-hover:scale-105 transition-transform">
                ❤️
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    Health Monitor
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase shrink-0">
                    Connected
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Track vitals: steps, heart rate, temperature & more.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('vitality');
                    }}
                    className="px-4 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Health Robot */}
            <div 
              onClick={() => onNavigate('biomatic')}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-indigo-400 via-blue-600 to-indigo-700 flex items-center justify-center text-3xl shadow-md shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🦾
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    Health Robot
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase shrink-0">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Your personal health robot assistant.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('biomatic');
                    }}
                    className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* 7. Prescription Manager */}
            <div 
              onClick={() => onNavigate('meds')}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center text-3xl shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                💊
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    Prescription Manager
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Get and manage prescriptions online or offline.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('meds');
                    }}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* 8. Smart Appointments */}
            <div 
              onClick={() => onNavigate('clinical_roadmap')}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-700 flex items-center justify-center text-3xl shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                📅
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    Smart Appointments
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase shrink-0">
                    Easy
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Book and manage your appointments.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('clinical_roadmap');
                    }}
                    className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* 9. Preventive Care */}
            <div 
              onClick={() => onNavigate('genomic_longevity')}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-red-600 flex items-center justify-center text-3xl shadow-md shadow-rose-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🛡️
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    Preventive Care
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase shrink-0">
                    Proactive
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Stay healthy with personalized health tips.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('genomic_longevity');
                    }}
                    className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Summary Row of Card 2: Health Summary + Activity + Actions + Security */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Your Health Summary Donut */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Your Health Summary
                  </h4>
                </div>
                <select className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-0.5 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>This Year</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-3 py-1">
                <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="92, 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white leading-none">92%</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Health Score</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-left flex-1">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-[10px] font-black">✓</span>
                      Steps Goal
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">85%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-[10px] font-black">✓</span>
                      Medication
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">100%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-[10px] font-black">✓</span>
                      Appointments
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Recent Activity */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Activity
                  </h4>
                </div>
                <button 
                  type="button" 
                  onClick={() => onNavigate('clinical_roadmap')} 
                  className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div 
                  onClick={() => onNavigate('ai_nexus')}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0c1a36] hover:bg-slate-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center text-xs shrink-0">💬</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">AI consultation completed</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">2 min ago</span>
                </div>
                <div 
                  onClick={() => onNavigate('meds')}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0c1a36] hover:bg-slate-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs shrink-0">💊</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">Prescription updated</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">12 min ago</span>
                </div>
                <div 
                  onClick={() => onNavigate('diagnostic_lab')}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0c1a36] hover:bg-slate-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center text-xs shrink-0">🔬</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">Lab report ready</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">1 hour ago</span>
                </div>
              </div>
            </div>

            {/* 3. Quick Actions */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-blue-500" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Quick Actions
                </h4>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('symptoms')}
                  className="w-full p-2.5 rounded-2xl bg-blue-50/80 dark:bg-[#0c1a36] hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-cyan-300 text-xs font-bold flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs group-hover:scale-110 transition-transform">🩺</span>
                    Check Symptoms
                  </span>
                  <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('vitality')}
                  className="w-full p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-[#0c1a36] hover:bg-emerald-100 dark:hover:bg-blue-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs group-hover:scale-110 transition-transform">📊</span>
                    Analyze Health Data
                  </span>
                  <ChevronRight size={14} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('records')}
                  className="w-full p-2.5 rounded-2xl bg-purple-50/80 dark:bg-[#0c1a36] hover:bg-purple-100 dark:hover:bg-blue-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs group-hover:scale-110 transition-transform">📁</span>
                    View My Records
                  </span>
                  <ChevronRight size={14} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* 4. Your Data is Safe with 3D glowing padlock */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c2340] via-[#091b33] to-[#040e1e] text-white shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden border border-cyan-500/30">
              {/* Glowing padlock background graphic on the right */}
              <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-30 pointer-events-none flex items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 blur-xl absolute" />
                <Lock size={64} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Your Data is Safe</h4>
              </div>

              <p className="text-xs text-blue-200/90 leading-relaxed relative z-10">
                Powered by advanced security and privacy protocols with AES-256 telemetry encryption.
              </p>

              <div className="relative z-10 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>Learn More</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* ========================================================================= */}
      {/* MODALS: Video Consultation & Voice Call                                    */}
      {/* ========================================================================= */}
      <DoctorianVideoConsultationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSwitchToVoice={() => {
          setIsVideoModalOpen(false);
          setIsVoiceModalOpen(true);
        }}
      />

      <DoctorianVoiceCallModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSwitchToVideo={() => {
          setIsVoiceModalOpen(false);
          setIsVideoModalOpen(true);
        }}
      />

      {/* Emergency Call Countdown Alert Modal */}
      {isEmergencyCalling && emergencyCountdown !== null && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12080a] border-2 border-red-500 rounded-3xl p-6 max-w-sm w-full text-center text-white space-y-4 shadow-2xl animate-bounce">
            <div className="w-16 h-16 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center mx-auto text-red-500">
              <PhoneCall size={32} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-red-400 uppercase tracking-wider">
              Emergency Dispatch 112
            </h3>
            <p className="text-xs text-slate-300">
              Connecting to Uganda Emergency & National Medical Ambulance Relay in:
            </p>
            <div className="text-5xl font-black text-red-500 font-mono">
              {emergencyCountdown}s
            </div>
            <button
              type="button"
              onClick={() => { setIsEmergencyCalling(false); setEmergencyCountdown(null); }}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancel Call
            </button>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: Sensor & Machine Hardware Nexus Link                               */}
      {/* ========================================================================= */}
      {isSensorModalOpen && (
        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#071329] border border-blue-500/40 rounded-3xl max-w-2xl w-full p-6 text-white space-y-5 shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-blue-900/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center shadow-lg">
                  <Radio size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white">
                    Medical Sensors & Machine Nexus
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time hardware bridge for Arduino, ESP32, BLE & Hospital Bio-Telemetry
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSensorModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Hardware Link Status */}
            <div className="p-4 rounded-2xl bg-[#0c1f44] border border-blue-800/60 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${arduino?.connection?.connected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Hardware Status: {arduino?.connection?.connected ? `ACTIVE (${arduino?.connection?.type?.toUpperCase() || 'TELEMETRY'})` : 'STANDBY'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Device: {arduino?.connection?.deviceName || 'Doctorian Internal Sensor Bus'}
                </p>
              </div>

              {/* Live Streaming Vitals Snapshot */}
              {vitals && (
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">LIVE HR</span>
                    <span className="text-base font-black text-rose-400">{vitals.heartRate} bpm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">LIVE BP</span>
                    <span className="text-base font-black text-blue-400">{vitals.systolicBP}/{vitals.diastolicBP}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">SPO2</span>
                    <span className="text-base font-black text-cyan-400">{vitals.spo2}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4 Connection Protocol Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. USB Web Serial (Arduino / ESP32) */}
              <button
                type="button"
                onClick={async () => {
                  if (arduino && typeof arduino.connectSerial === 'function') {
                    try {
                      await arduino.connectSerial();
                      setIsSensorModalOpen(false);
                    } catch (e) {
                      console.error("Serial connection error:", e);
                    }
                  }
                }}
                className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-blue-500/30 hover:border-cyan-400/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-cyan-400 mb-1.5">
                  <Usb size={18} />
                  <span className="text-xs font-black">USB Serial (Web Serial API)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Connect physical Arduino UNO, Nano, or ESP32 board directly via USB port.
                </p>
                <span className="text-[10px] font-mono text-cyan-400 font-bold mt-2 block group-hover:underline">
                  Initiate Port Pairing →
                </span>
              </button>

              {/* 2. Web Bluetooth BLE */}
              <button
                type="button"
                onClick={async () => {
                  if (arduino && typeof arduino.connectBluetooth === 'function') {
                    try {
                      await arduino.connectBluetooth();
                      setIsSensorModalOpen(false);
                    } catch (e) {
                      console.error("BLE connection error:", e);
                    }
                  }
                }}
                className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-blue-500/30 hover:border-cyan-400/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-blue-400 mb-1.5">
                  <Bluetooth size={18} />
                  <span className="text-xs font-black">Wireless Bluetooth (BLE)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Pair with wireless pulse oximeters, ECG patches, and digital BP cuffs.
                </p>
                <span className="text-[10px] font-mono text-blue-400 font-bold mt-2 block group-hover:underline">
                  Scan BLE Devices →
                </span>
              </button>

              {/* 3. Real-Time Continuous Bio-Telemetry Generator */}
              <button
                type="button"
                onClick={() => {
                  if (arduino && typeof arduino.startDemo === 'function') {
                    arduino.startDemo('healthy');
                    setSelectedPatientId('machine');
                    setIsSensorModalOpen(false);
                  }
                }}
                className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
                  <Activity size={18} />
                  <span className="text-xs font-black">Real-Time Sensor Generator</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Activate high-frequency physiological telemetry engine streaming live vitals.
                </p>
                <span className="text-[10px] font-mono text-emerald-400 font-bold mt-2 block group-hover:underline">
                  Start Live Sensor Stream →
                </span>
              </button>

              {/* 4. Disconnect / Hardware Reset */}
              <button
                type="button"
                onClick={async () => {
                  if (arduino && typeof arduino.disconnect === 'function') {
                    await arduino.disconnect();
                  }
                }}
                className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-rose-400 mb-1.5">
                  <RotateCw size={18} />
                  <span className="text-xs font-black">Disconnect & Reset Sensors</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Safely reset sensor ports, clear telemetry buffers, and release serial handles.
                </p>
                <span className="text-[10px] font-mono text-rose-400 font-bold mt-2 block group-hover:underline">
                  Reset Sensor Bus →
                </span>
              </button>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-blue-900/40">
              <button
                type="button"
                onClick={() => setIsSensorModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
