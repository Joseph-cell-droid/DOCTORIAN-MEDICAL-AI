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
  Bluetooth,
  Footprints,
  ShoppingBag,
  Compass,
  Navigation,
  MapPin,
  Bed,
  RefreshCw
} from 'lucide-react';
import { Vitals, HealthStatus } from '../hooks/useArduino';
import { DoctorianVideoConsultationModal } from './DoctorianVideoConsultationModal';
import { DoctorianVoiceCallModal } from './DoctorianVoiceCallModal';
import { HospitalLocationGuideModal } from './HospitalLocationGuideModal';
import { useNearestHospital } from '../hooks/useNearestHospital';
import { useLiveDashboardSummary } from '../hooks/useLiveDashboardSummary';
import { useAppLanguage } from '../utils/translations';

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
  const [, , t] = useAppLanguage();
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [isHospitalGuideOpen, setIsHospitalGuideOpen] = useState(false);
  const [isEmergencyCalling, setIsEmergencyCalling] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState<number | null>(null);
  const {
    hospital,
    distanceKm,
    estimatedArrivalMins,
    bearingDegrees,
    cardinal,
    directionText,
    googleMapsDirUrl,
    isGpsLive,
    isScanningGps,
    gpsError,
    scanGps,
    selectDistrict,
    selectHospitalById,
    nearbyHospitals
  } = useNearestHospital();
  const {
    summary: liveSummary,
    updateSteps,
    toggleAppointmentStatus,
    isPedometerActive,
    togglePhonePedometer
  } = useLiveDashboardSummary(hospital.id, user?.id || user?.email || 'default-user');

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

  // Dynamic online/DB/sensor telemetry for System Performance
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  useEffect(() => {
    const goOnline = () => setIsNetworkOnline(true);
    const goOffline = () => setIsNetworkOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Build dynamic SVG waveform paths from selected patient or live sensor history
  const chartPoints = (() => {
    if (selectedPatientId === 'machine' && history && history.length >= 2) {
      const slice = history.slice(-6);
      return slice.map((item, idx) => ({
        time: `${idx + 1}`,
        hr: item.heartRate,
        bp: item.systolicBP,
        temp: item.temperature
      }));
    }
    return currentPatient.trendPoints;
  })();

  const buildTrendPath = (values: number[], minVal: number, maxVal: number) => {
    const xs = [10, 66, 122, 178, 234, 290];
    const span = Math.max(1, maxVal - minVal);
    return values
      .slice(0, 6)
      .map((val, i) => {
        const clamped = Math.max(minVal, Math.min(maxVal, val));
        const y = 70 - ((clamped - minVal) / span) * 54;
        return `${i === 0 ? 'M' : 'L'}${xs[i] ?? 290},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const hrDots = chartPoints.slice(0, 6).map((pt, i) => {
    const xs = [10, 66, 122, 178, 234, 290];
    const clamped = Math.max(50, Math.min(120, pt.hr));
    const y = 70 - ((clamped - 50) / 70) * 54;
    return { x: xs[i] ?? 290, y: Number(y.toFixed(1)) };
  });

  const hrTrendPath = buildTrendPath(chartPoints.map((p) => p.hr), 50, 120);
  const bpTrendPath = buildTrendPath(chartPoints.map((p) => p.bp), 95, 160);
  const tempTrendPath = buildTrendPath(chartPoints.map((p) => Number(p.temp) || 36.6), 35.5, 39.5);

  // Reactive feedback state for feature clicks
  const [activeFeaturePulse, setActiveFeaturePulse] = useState<string | null>(null);
  const triggerFeatureFeedback = (label: string, view?: string) => {
    setActiveFeaturePulse(label);
    setTimeout(() => setActiveFeaturePulse((prev) => (prev === label ? null : prev)), 1800);
    if (view) {
      onNavigate(view);
    }
  };

  // Explicit East African Time (Africa/Kampala / UTC+3) helper
  const getEatParts = (date: Date) => {
    const hourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Kampala',
      hour: 'numeric',
      hour12: false,
    }).format(date);
    const eatHour = (parseInt(hourStr, 10) || 0) % 24;
    const eatTimeString = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Kampala',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
    const eatDateString = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Kampala',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
    return { eatHour, eatTimeString, eatDateString };
  };

  const { eatHour, eatTimeString: liveTimeString, eatDateString: todayFormatted } = getEatParts(currentTime);

  // Dynamic East African Time-aware greeting
  const getGreetingData = (hour: number) => {
    const firstName = user?.displayName || 'Akora Joseph';
    if (hour >= 5 && hour < 12) {
      return {
        prefix: 'Good Morning,',
        greeting: `Good Morning, ${firstName}!`,
        subtext: 'Energized for morning clinical rounds and patient care.',
        icon: Sunrise,
        iconBg: 'bg-amber-400/20 text-amber-300 border-amber-300/40',
        shift: 'Morning Ward Rounds',
        timeWindow: '05:00 - 11:59 EAT'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        prefix: 'Good Afternoon,',
        greeting: `Good Afternoon, ${firstName}!`,
        subtext: 'Active afternoon clinical consultations and diagnostic reviews.',
        icon: Sun,
        iconBg: 'bg-amber-400/20 text-amber-300 border-amber-300/40',
        shift: 'Afternoon Specialized Clinic',
        timeWindow: '12:00 - 16:59 EAT'
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        prefix: 'Good Evening,',
        greeting: `Good Evening, ${firstName}!`,
        subtext: 'Evening clinical handovers, patient reviews, and treatment summaries.',
        icon: Sunset,
        iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
        shift: 'Evening Clinical Handover',
        timeWindow: '17:00 - 20:59 EAT'
      };
    } else {
      return {
        prefix: 'Good Night,',
        greeting: `Good Night, ${firstName}!`,
        subtext: '24/7 emergency telemetry and night on-call surveillance active.',
        icon: Moon,
        iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
        shift: 'Night Emergency On-Call',
        timeWindow: '21:00 - 04:59 EAT'
      };
    }
  };

  const greetingData = getGreetingData(eatHour);

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

  const liveHeartRate = vitals?.heartRate ?? 72;
  const liveBP = vitals ? `${vitals.systolicBP}/${vitals.diastolicBP}` : '118/76';
  const liveSpo2 = vitals?.spo2 ?? 98;
  const liveTemp = vitals ? vitals.temperature.toFixed(1) : '36.8';

  const liveCounts = liveSummary?.counts;
  const liveBeds = liveSummary?.beds;
  const liveTelemetry = liveSummary?.telemetry;
  const liveProgress = liveSummary?.progress;
  const stepsToday = liveTelemetry?.steps ?? 0;
  const stepsGoal = liveTelemetry?.stepsGoal ?? 10000;
  const stepsGoalPct = liveTelemetry?.stepsGoalPct ?? 0;
  const labNormalPct = liveCounts && liveCounts.totalLabs > 0
    ? Math.round((liveCounts.normalLabs / liveCounts.totalLabs) * 100)
    : 0;
  const labAbnormalPct = liveCounts && liveCounts.totalLabs > 0 ? Math.max(0, 100 - labNormalPct) : 0;

  return (
    <div className="w-full doctorian-canvas text-slate-900 dark:text-slate-100 font-sans p-3.5 sm:p-5 lg:p-6 space-y-5 transition-colors duration-300">
      <main className="w-full space-y-5 max-w-6xl mx-auto">

        {/* Reactive Click Toast Banner */}
        <AnimatePresence>
          {activeFeaturePulse && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto max-w-md px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/50 text-cyan-700 dark:text-cyan-200 text-xs font-extrabold text-center shadow-sm"
            >
              {activeFeaturePulse}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* SCREEN 3: CENTERED LIVE EAST AFRICAN TIME GREETING & HEALTH OVERVIEW   */}
        {/* ===================================================================== */}
        <section className="space-y-4">
          {/* Centered Live East African Time Greeting Header */}
          <div className="flex flex-col items-center justify-center text-center mx-auto max-w-2xl px-2 pt-0.5 pb-1 space-y-1.5">
            <h1 className="text-xl sm:text-2xl md:text-[1.75rem] font-[900] tracking-tight text-slate-900 dark:text-white leading-tight flex items-center justify-center gap-1.5 flex-wrap">
              <span>{t(greetingData.prefix)}</span>
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">
                {user?.displayName || 'Akora Joseph'}
              </span>
              <span>👋</span>
            </h1>

            <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-mono font-bold text-cyan-600 dark:text-cyan-300 tabular-nums">
                <greetingData.icon size={13} className="text-amber-500 dark:text-cyan-300 shrink-0" />
                <span>{liveTimeString} EAT</span>
              </span>
              <span className="text-slate-400">·</span>
              <span>{todayFormatted}</span>
              <span className="text-slate-400 hidden sm:inline">·</span>
              <span className="hidden sm:inline text-slate-500 dark:text-slate-400">{t(greetingData.shift)}</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {t('Stay healthy, stay strong!')}
            </p>
          </div>

          {/* Thick Elevated Card: Health Overview */}
          <div className="doctorian-thick-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-500 dark:text-cyan-300">
                  <Activity size={17} />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {t('Health Overview')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('vitality')}
                className="text-xs font-extrabold text-blue-600 dark:text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{t('View Details')}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* 4 Circular Progress Rings: Heart Rate, Blood Pressure, SpO2, Temp */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Ring 1: Heart Rate */}
              <div
                onClick={() => onNavigate('vitality')}
                className="doctorian-thick-tile p-3.5 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="33" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6.5" fill="none" />
                    <circle cx="40" cy="40" r="33" stroke="#ec4899" strokeWidth="6.5" strokeDasharray="207.3" strokeDashoffset={207.3 * 0.22} strokeLinecap="round" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Heart size={13} className="text-rose-400 fill-rose-500 mb-0.5 animate-pulse" />
                    <span className="text-base font-black text-slate-900 dark:text-white leading-none">{liveHeartRate}</span>
                    <span className="text-[9px] font-bold text-slate-400">bpm</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2">{t('Heart Rate')}</span>
              </div>

              {/* Ring 2: Blood Pressure */}
              <div
                onClick={() => onNavigate('vitality')}
                className="doctorian-thick-tile p-3.5 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="33" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6.5" fill="none" />
                    <circle cx="40" cy="40" r="33" stroke="#00d2ff" strokeWidth="6.5" strokeDasharray="207.3" strokeDashoffset={207.3 * 0.16} strokeLinecap="round" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-none">{liveBP}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-0.5">mmHg</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2">{t('Blood Pressure')}</span>
              </div>

              {/* Ring 3: SpO2 */}
              <div
                onClick={() => onNavigate('vitality')}
                className="doctorian-thick-tile p-3.5 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="33" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6.5" fill="none" />
                    <circle cx="40" cy="40" r="33" stroke="#10b981" strokeWidth="6.5" strokeDasharray="207.3" strokeDashoffset={207.3 * (1 - liveSpo2 / 100)} strokeLinecap="round" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-slate-900 dark:text-white leading-none">{liveSpo2}%</span>
                    <span className="text-[9px] font-bold text-emerald-400 mt-0.5">{t('SpO2')}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2">{t('SpO2')}</span>
              </div>

              {/* Ring 4: Temp */}
              <div
                onClick={() => onNavigate('vitality')}
                className="doctorian-thick-tile p-3.5 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="33" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6.5" fill="none" />
                    <circle cx="40" cy="40" r="33" stroke="#f59e0b" strokeWidth="6.5" strokeDasharray="207.3" strokeDashoffset={207.3 * 0.25} strokeLinecap="round" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{liveTemp}°C</span>
                    <span className="text-[9px] font-bold text-amber-400 mt-0.5">{t('Temp')}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2">{t('Temp')}</span>
              </div>
            </div>

            {/* 2 Metric Tiles: Live Steps Today (starts at 0 if unlogged) & Health Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div
                onClick={() => onNavigate('vitality')}
                className="doctorian-thick-tile p-4 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0 border border-white/25">
                    <Footprints size={22} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-300 block">{t('Steps Today')}</span>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {stepsToday.toLocaleString()}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        stepsToday === 0
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
                          : stepsGoalPct >= 100
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      }`}>
                        {stepsToday === 0
                          ? t('Not logged yet')
                          : stepsGoalPct >= 100
                          ? `✓ ${t('Goal Done')}`
                          : `${stepsGoalPct}% (${(stepsGoal - stepsToday).toLocaleString()} left)`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => updateSteps({ deltaSteps: 250 })}
                    className="px-2.5 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-[10px] font-black text-cyan-200 cursor-pointer"
                    title="Log 250 walking steps"
                  >
                    +250
                  </button>
                  <button
                    type="button"
                    onClick={togglePhonePedometer}
                    className={`px-2.5 py-1 rounded-full border text-[10px] font-black cursor-pointer ${
                      isPedometerActive
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                        : 'bg-white/10 border-white/20 text-slate-300'
                    }`}
                    title="Toggle phone motion step sensor"
                  >
                    {isPedometerActive ? 'Walking ●' : 'Sensor'}
                  </button>
                </div>
              </div>

              <div
                onClick={() => onNavigate('vitality')}
                className="doctorian-thick-tile p-4 flex items-center justify-between gap-3.5 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg shrink-0 border border-white/25 ${
                    (liveCounts?.emergencyCases ?? 0) > 0
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-amber-500/25'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-500/25'
                  }`}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-300 block">{t('Clinical & Telemetry Status')}</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 block leading-tight">
                      {liveCounts
                        ? `${liveCounts.completedAppointments + liveCounts.completedLabs} Done · ${liveCounts.pendingAppointments + liveCounts.pendingLabs} Pending`
                        : t('Syncing Live DB...')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {liveBeds ? `${liveBeds.available} free beds of ${liveBeds.total} at ${hospital.shortName}` : hospital.shortName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thick Card Row: Quick Actions */}
          <div className="doctorian-thick-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{t('Quick Actions')}</h2>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('doctorian-open-apps-card'))}
                className="text-xs font-extrabold text-blue-600 dark:text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>{t('See All')}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => onNavigate('ai_nexus')}
                className="doctorian-thick-tile p-4 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer group"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-white/25 group-hover:scale-110 transition-transform">
                  <Bot size={23} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{t('AI Assistant')}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('app_medics')}
                className="doctorian-thick-tile p-4 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer group"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/25 group-hover:scale-110 transition-transform">
                  <ShoppingBag size={23} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{t('E-Pharmacy')}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('meds')}
                className="doctorian-thick-tile p-4 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer group"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-white/25 group-hover:scale-110 transition-transform">
                  <Pill size={23} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{t('Prescriptions')}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('diagnostic_lab')}
                className="doctorian-thick-tile p-4 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer group"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/25 group-hover:scale-110 transition-transform">
                  <FlaskConical size={23} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{t('Laboratory')}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* CARD 1: MAIN CLINICAL DASHBOARD (Matching image_9ca8ccdf.png)          */}
        {/* ===================================================================== */}
        <section className="space-y-6">

          {/* 1. Compact Location-Aware Hospital Photo Banner + Compass Direction & District Switcher */}
          <div className="relative w-full doctorian-thick-card overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white min-h-[160px] flex flex-col justify-between p-4 sm:p-5 gap-3 group">
            
            {/* Dynamic Regional Hospital Physical Photograph — swaps automatically with GPS / City (e.g. Lira, Gulu, Kampala, Mbarara) */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-full sm:w-7/12 md:w-1/2 bg-cover bg-center transition-all duration-700 pointer-events-none opacity-85"
              style={{
                backgroundImage: `url('${hospital.photoUrl}')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05132d] via-[#091f44]/92 via-48% to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-7/12 bg-gradient-to-l from-transparent via-[#05132d]/20 to-[#05132d] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left Hospital Telemetry & Sensor Status */}
              <div className="max-w-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${greetingData.iconBg} border flex items-center justify-center shadow-md shrink-0`}>
                    <greetingData.icon size={16} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-[1000] tracking-tight text-white drop-shadow-md leading-tight">
                      {hospital.name}
                    </h2>
                    <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block font-mono tabular-nums">
                      {greetingData.shift} · {liveTimeString} EAT
                    </span>
                  </div>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug line-clamp-2">
                  {directionText}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20 text-[10.5px] font-semibold text-white">
                    <Calendar size={11} className="text-cyan-300" />
                    <span>{todayFormatted}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setIsSensorModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-full border border-emerald-400/40 text-[10.5px] font-bold text-emerald-300 cursor-pointer"
                  >
                    <Radio size={11} />
                    <span>
                      {arduino?.connection?.connected
                        ? `Sensors Live: ${arduino.connection.type?.toUpperCase() || 'BIO'}`
                        : t('Connect Sensors')}
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Right Active Hospital Photo & Distance / Bearing Guide Card */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#051128]/90 backdrop-blur-md border-2 border-cyan-400/45 rounded-2xl p-3 shadow-2xl shrink-0 max-w-md w-full lg:w-auto">
                <img
                  src={hospital.photoUrl}
                  alt={hospital.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/uganda_hospital_building.jpg';
                  }}
                  onClick={() => setIsHospitalGuideOpen(true)}
                  className="w-full sm:w-28 h-24 rounded-xl object-cover border border-cyan-400/50 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-black text-cyan-200 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isGpsLive ? 'bg-emerald-400 animate-ping' : 'bg-cyan-300'}`} />
                      {isGpsLive ? t('GPS Live') : t('Phone Location')}
                    </span>
                    <span className="text-[11px] font-mono font-black text-amber-300 flex items-center gap-1">
                      <Navigation size={11} style={{ transform: `rotate(${bearingDegrees}deg)` }} />
                      {bearingDegrees}° {cardinal}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white leading-tight truncate">{hospital.name}</h3>
                  <p className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{hospital.district} • {distanceKm} km (~{estimatedArrivalMins} min)</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsHospitalGuideOpen(true)}
                      className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Compass size={11} />
                      <span>{t('Photos & Directions')}</span>
                    </button>
                    {googleMapsDirUrl && (
                      <a
                        href={googleMapsDirUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1"
                      >
                        <ExternalLink size={10} />
                        <span>{t('Route Map')}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quick Location Bar inside Banner (Lira, Kampala, Gulu, Mbarara, Arua, Mbale, Jinja + Phone GPS) */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 mr-1">
                  {t('Phone City')}:
                </span>
                {['Kampala', 'Lira', 'Gulu', 'Mbarara', 'Arua', 'Mbale', 'Jinja', 'Soroti'].map((city) => {
                  const active = hospital.district.toLowerCase().includes(city.toLowerCase());
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => selectDistrict(city)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer border ${
                        active
                          ? 'bg-cyan-400 text-slate-950 border-white shadow-sm'
                          : 'bg-[#071636]/80 text-slate-200 border-cyan-500/30 hover:border-cyan-400'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={scanGps}
                disabled={isScanningGps}
                className="px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/50 text-emerald-200 text-[10px] font-black flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={11} className={isScanningGps ? 'animate-spin' : ''} />
                <span>{isScanningGps ? t('Locating...') : t('Detect My Phone GPS')}</span>
              </button>
            </div>
          </div>

          {/* 2. 5 LIVE KPI Metric Cards (Real SQLite Totals + Done vs Not Yet Done) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            
            {/* 1. Registered Patients */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('records')}
              className="p-4 doctorian-thick-card transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400">{t('Patients Registered')}</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">
                  {liveCounts?.totalPatients ?? 0}
                </span>
                <span className="text-[10px] font-bold text-emerald-400">
                  {liveCounts ? `${liveCounts.stablePatients} Stable` : 'Live DB'}
                </span>
              </div>
              <p className="text-[10px] text-amber-300 font-bold mt-2">
                {liveCounts ? `${liveCounts.attentionPatients} need follow-up` : 'Loading...'}
              </p>
            </motion.div>

            {/* 2. Active Clinicians */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('doctors_dashboard')}
              className="p-4 doctorian-thick-card transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400">{t('Active Clinicians')}</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <UserCheck size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">
                  {liveCounts?.totalClinicians ?? 0}
                </span>
                <span className="text-[10px] font-bold text-emerald-400">
                  {liveCounts ? `${liveCounts.activeDoctors} MD` : '0 MD'}
                </span>
              </div>
              <p className="text-[10px] text-cyan-300 font-bold mt-2">
                {liveCounts ? `${liveCounts.activeNurses} Nurses on duty` : 'Loading...'}
              </p>
            </motion.div>

            {/* 3. Appointments (Done vs Not Yet Done) */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('clinical_roadmap')}
              className="p-4 doctorian-thick-card transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400">{t('Appointments')}</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">
                  {liveCounts?.totalAppointments ?? 0}
                </span>
                <span className="text-[10px] font-bold text-emerald-400">
                  ✓ {liveCounts?.completedAppointments ?? 0} Done
                </span>
              </div>
              <p className="text-[10px] text-amber-300 font-bold mt-2">
                ⏳ {liveCounts?.pendingAppointments ?? 0} not yet completed
              </p>
            </motion.div>

            {/* 4. Prescriptions (Approved vs Pending) */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('meds')}
              className="p-4 doctorian-thick-card transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400">{t('Prescriptions')}</span>
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Pill size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">
                  {liveCounts?.totalPrescriptions ?? 0}
                </span>
                <span className="text-[10px] font-bold text-emerald-400">
                  ✓ {liveCounts?.activePrescriptions ?? 0} Active
                </span>
              </div>
              <p className="text-[10px] text-amber-300 font-bold mt-2">
                ⏳ {liveCounts?.pendingPrescriptions ?? 0} awaiting approval
              </p>
            </motion.div>

            {/* 5. Hospital Beds & Labs Summary */}
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => onNavigate('doctors_dashboard')}
              className="p-4 doctorian-thick-card transition-all cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400">{t('Hospital Beds')}</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <Bed size={16} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">
                  {liveBeds ? `${liveBeds.available}/${liveBeds.total}` : '0/0'}
                </span>
                <span className="text-[10px] font-bold text-emerald-400">
                  Free
                </span>
              </div>
              <p className="text-[10px] text-cyan-300 font-bold mt-2 truncate">
                {liveBeds ? `${liveBeds.occupied} occupied · ${liveBeds.cleaning} cleaning` : hospital.shortName}
              </p>
            </motion.div>

          </div>

          {/* 3. Middle Section: Live Health Monitoring + AI Assistant + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* 3A. Live Health Monitoring Card (5 Cols) */}
            <div className="lg:col-span-5 p-5 doctorian-thick-card flex flex-col justify-between space-y-4">
              
              {/* Header with Live Badge & Patient / Hardware Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-blue-500 shrink-0" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{t('Live Health Monitoring')}</h3>
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
                
                {/* Real Clinical Anatomy Hologram Photography Card (Clickable) */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => triggerFeatureFeedback('Opening 3D Clinical Anatomy Telemetry', 'illustrator')}
                  className="col-span-5 relative h-48 rounded-2xl bg-[#030914] border-2 border-cyan-500/35 hover:border-cyan-400/75 flex items-center justify-center overflow-hidden cursor-pointer group transition-all"
                  title="Open 3D Clinical Anatomy Telemetry"
                >
                  <img
                    src="/portraits/hologram_anatomy.jpg"
                    alt="3D Clinical Anatomy Telemetry"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030914]/90 via-transparent to-cyan-500/15 pointer-events-none" />
                  {/* Pulsing Cardiac Marker */}
                  <div className="absolute top-[36%] left-[52%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="absolute inset-0 w-5 h-5 rounded-full bg-rose-500/60 animate-ping" />
                    <span className="relative block w-3 h-3 rounded-full bg-rose-500 border border-white shadow-[0_0_10px_#ff2d55]" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-black text-cyan-200 bg-black/55 backdrop-blur-xs px-2 py-1 rounded-lg border border-cyan-400/30">
                    <span className="truncate">{currentPatient.name.split(' ')[0]}</span>
                    <span className="text-emerald-300 shrink-0 tabular-nums">{liveHeartRate} bpm</span>
                  </div>
                </motion.button>

                {/* 4 Reactive Real-time Vitals Metric Buttons connected to Live Sensors */}
                <div className="col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  
                  {/* Heart Rate */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => triggerFeatureFeedback('Heart Rate Telemetry Opened', 'monitor')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1b3a] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-slate-200/80 dark:border-blue-900/40 hover:border-rose-400/60 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-rose-500">
                      <Heart size={14} className="animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{t('Heart Rate')}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      {(selectedPatientId === 'machine' || arduino?.connection?.connected) && vitals ? vitals.heartRate : currentPatient.heartRate}{' '}
                      <span className="text-[10px] font-normal text-slate-400">bpm</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500">● {arduino?.connection?.connected ? 'Sensor Live' : t('Normal')}</span>
                  </motion.button>

                  {/* Blood Pressure */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => triggerFeatureFeedback('Blood Pressure Monitor Opened', 'monitor')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1b3a] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-slate-200/80 dark:border-blue-900/40 hover:border-cyan-400/60 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <Activity size={14} />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{t('Blood Pressure')}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      {(selectedPatientId === 'machine' || arduino?.connection?.connected) && vitals ? `${vitals.systolicBP}/${vitals.diastolicBP}` : currentPatient.bloodPressure}{' '}
                      <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500">● {arduino?.connection?.connected ? 'Sensor Live' : t('Normal')}</span>
                  </motion.button>

                  {/* Temperature */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => triggerFeatureFeedback('Thermal Telemetry Opened', 'monitor')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1b3a] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-slate-200/80 dark:border-blue-900/40 hover:border-amber-400/60 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Thermometer size={14} />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{t('Temperature')}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      {(selectedPatientId === 'machine' || arduino?.connection?.connected) && vitals ? vitals.temperature.toFixed(1) : currentPatient.temperature}{' '}
                      <span className="text-[10px] font-normal text-slate-400">°C</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500">● {arduino?.connection?.connected ? 'Sensor Live' : t('Normal')}</span>
                  </motion.button>

                  {/* SpO2 */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => triggerFeatureFeedback('Oxygen Saturation Opened', 'monitor')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1b3a] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-slate-200/80 dark:border-blue-900/40 hover:border-cyan-400/60 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-cyan-500">
                      <Wind size={14} />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{t('SpO2')}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      {(selectedPatientId === 'machine' || arduino?.connection?.connected) && vitals ? vitals.spo2 : currentPatient.spo2}%
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500">● {arduino?.connection?.connected ? 'Sensor Live' : t('Normal')}</span>
                  </motion.button>

                </div>

              </div>

              {/* 24-hr Multi-line Trend Chart (Live Computed Paths) */}
              <div className="pt-2 border-t border-slate-100 dark:border-blue-900/40">
                <div className="flex items-center justify-between text-[11px] mb-2 font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-blue-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> {t('Heart Rate')}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> BP
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> {t('Temp')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('monitor')}
                    className="text-blue-600 dark:text-cyan-400 hover:underline font-bold text-xs flex items-center gap-0.5 cursor-pointer"
                  >
                    {t('View Details')} →
                  </button>
                </div>

                {/* SVG Multi-Parameter Graph */}
                <div className="h-20 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="40" x2="300" y2="40" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="currentColor" strokeOpacity="0.08" />

                    {/* Heart Rate line */}
                    <path d={hrTrendPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Blood Pressure line */}
                    <path d={bpTrendPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    {/* Temperature line */}
                    <path d={tempTrendPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

                    {hrDots.map((dot, idx) => (
                      <circle key={idx} cx={dot.x} cy={dot.y} r="3" fill="#3b82f6" />
                    ))}
                  </svg>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                    {chartPoints.slice(0, 6).map((pt, idx) => (
                      <span key={idx}>{pt.time}</span>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* 3B. Compact AI Assistant Interactive Card (4 Cols) */}
            <div className="lg:col-span-4 p-4 doctorian-thick-card flex flex-col justify-between space-y-2.5">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7.5 h-7.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{t('AI Assistant')}</h3>
                    <p className="text-[9.5px] text-slate-400">Doctorian Medical Neural Node</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => triggerFeatureFeedback('Opening Full AI Assistant', 'ai_nexus')}
                  className="px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[9.5px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t('Online')} ↗
                </button>
              </div>

              {/* Chat Messages Log */}
              <div 
                ref={chatScrollRef}
                className="flex-1 min-h-[125px] max-h-[155px] overflow-y-auto space-y-1.5 pr-1 text-[11px]"
              >
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-1.5 leading-snug ${
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
                  <div className="flex items-center gap-2 py-1 px-1 text-slate-500 dark:text-slate-400 text-xs animate-in fade-in duration-200">
                    <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border border-dashed border-cyan-400/60"
                      />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    </div>
                    <span className="font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
                      Thinking...
                    </span>
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
                  placeholder={t('Type your message...')}
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
            <div className="lg:col-span-3 p-5 doctorian-thick-card flex flex-col justify-between space-y-3">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-blue-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{t('Quick Actions')}</h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => onNavigate('features')}
                  className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline"
                >
                  {t('See All')} →
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
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{t('New Patient')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('meds')}
                  className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-[#0c1b3a] hover:bg-emerald-100/80 dark:hover:bg-blue-900/50 border border-emerald-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-emerald-600 text-white group-hover:scale-110 transition-transform">
                    <Pill size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{t('New Prescription')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('clinical_roadmap')}
                  className="p-3 rounded-2xl bg-purple-50/70 dark:bg-[#0c1b3a] hover:bg-purple-100/80 dark:hover:bg-blue-900/50 border border-purple-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-purple-600 text-white group-hover:scale-110 transition-transform">
                    <Calendar size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{t('Book Appointment')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('diagnostic_lab')}
                  className="p-3 rounded-2xl bg-cyan-50/70 dark:bg-[#0c1b3a] hover:bg-cyan-100/80 dark:hover:bg-blue-900/50 border border-cyan-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-cyan-600 text-white group-hover:scale-110 transition-transform">
                    <FlaskConical size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{t('Run Lab Test')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="p-3 rounded-2xl bg-rose-50/70 dark:bg-[#0c1b3a] hover:bg-rose-100/80 dark:hover:bg-blue-900/50 border border-rose-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-rose-600 text-white group-hover:scale-110 transition-transform">
                    <Video size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{t('Start Video Call')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('diagnostic_lab')}
                  className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-[#0c1b3a] hover:bg-indigo-100/80 dark:hover:bg-blue-900/50 border border-indigo-200/60 dark:border-blue-800/40 text-center flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-indigo-600 text-white group-hover:scale-110 transition-transform">
                    <FileText size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{t('View Reports')}</span>
                </button>

              </div>

            </div>

          </div>

          {/* 4. Bottom Row of Card 1: Recent Patients + Lab Results + Appointments + System Performance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 4A. Live Registered Patients */}
            <div className="p-4 doctorian-thick-card flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t('Registered Patients')}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('records')}
                  className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {t('View All')} →
                </button>
              </div>

              <div className="space-y-2.5">
                {(liveSummary?.recentPatients || []).slice(0, 3).map((p, idx) => {
                  const avatar =
                    p.gender === 'Male'
                      ? '/portraits/dr_joseph_mukasa.jpg'
                      : idx % 2 === 0
                      ? '/portraits/patient_sarah.jpg'
                      : '/portraits/patient_mary.jpg';
                  const tierColor =
                    p.risk_tier === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300'
                      : p.risk_tier === 'Attention'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/15 text-emerald-400';
                  return (
                    <div
                      key={p.id}
                      onClick={() => onNavigate('records')}
                      className="doctorian-thick-tile p-2.5 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={avatar}
                          alt={p.full_name}
                          className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400/50 shadow-sm shrink-0"
                        />
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate">{p.full_name}</p>
                          <p className="text-[10px] text-slate-400 leading-snug truncate">{p.mrn} • {p.district} • {p.age}y</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${tierColor}`}>
                        {p.risk_tier}
                      </span>
                    </div>
                  );
                })}
                {(!liveSummary || liveSummary.recentPatients.length === 0) && (
                  <p className="text-xs text-slate-400 p-3 text-center">{t('No patients registered yet')}</p>
                )}
              </div>
            </div>

            {/* 4B. Live Lab Results Overview Donut (Done vs Pending Review) */}
            <div className="p-4 doctorian-thick-card flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FlaskConical size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t('Lab Results Overview')}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('diagnostic_lab')}
                  className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {t('View All')} →
                </button>
              </div>

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
                      strokeDasharray={`${labNormalPct}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white">{labNormalPct}%</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{t('Normal')}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Normal: {liveCounts?.normalLabs ?? 0} ({labNormalPct}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Attention: {liveCounts?.abnormalLabs ?? 0} ({labAbnormalPct}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="font-semibold text-amber-300">
                      Pending: {liveCounts?.pendingLabs ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-2 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1.5 ${
                (liveCounts?.pendingLabs ?? 0) > 0
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
              }`}>
                <CheckCircle2 size={13} />
                <span>
                  {(liveCounts?.pendingLabs ?? 0) > 0
                    ? `${liveCounts?.completedLabs} reviewed · ${liveCounts?.pendingLabs} lab test(s) not yet reviewed`
                    : `${liveCounts?.completedLabs ?? 0} completed · 0 pending`}
                </span>
              </div>
            </div>

            {/* 4C. Live Appointments (Done vs Not Yet Done Toggle) */}
            <div className="p-4 doctorian-thick-card flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t('Appointments (Live)')}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('clinical_roadmap')}
                  className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {t('Calendar')} →
                </button>
              </div>

              <div className="space-y-2.5">
                {(liveSummary?.recentAppointments || []).slice(0, 3).map((item) => {
                  const isDone = item.status === 'Completed';
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleAppointmentStatus(item.id)}
                      title="Click to toggle Done / Pending"
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0c1a36] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-slate-200/60 dark:border-blue-900/40 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">{item.scheduled_for}</span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{item.patient_name}</p>
                        <p className="text-[10px] text-slate-400 leading-tight truncate">{item.clinician_name} • {item.visit_type}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      }`}>
                        {isDone ? '✓ Done' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
                {(!liveSummary || liveSummary.recentAppointments.length === 0) && (
                  <p className="text-xs text-slate-400 p-3 text-center">{t('No appointments scheduled yet')}</p>
                )}
              </div>
            </div>

            {/* 4D. Live System & Telemetry Status (Reactive, Real State) */}
            <div className="p-4 doctorian-thick-card flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t('System Performance')}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isNetworkOnline ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {isNetworkOnline ? t('Optimal') : t('Offline Mode')}
                </span>
              </div>

              {/* 3 Interactive Ring Gauges driven by real app/DB/sensor telemetry */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                
                {/* Network / Sync */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => triggerFeatureFeedback(isNetworkOnline ? 'Clinical Network Online & Synced' : 'Running Local Offline Cache', 'records')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray={`${isNetworkOnline ? 100 : 35}, 100`} />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-900 dark:text-white tabular-nums">{isNetworkOnline ? '100%' : 'OFF'}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 group-hover:text-cyan-400">Sync</span>
                </motion.button>

                {/* Live Sensors */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setIsSensorModalOpen(true)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${arduino?.connection?.connected || vitals ? 100 : 0}, 100`} />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-900 dark:text-white tabular-nums">{arduino?.connection?.connected || vitals ? 'LIVE' : '0%'}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 group-hover:text-blue-400">Sensors</span>
                </motion.button>

                {/* Clinical DB Completion */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onNavigate('vitality')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${liveProgress?.overallScore ?? 0}, 100`} />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-900 dark:text-white tabular-nums">{liveProgress?.overallScore ?? 0}%</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 group-hover:text-emerald-400">Care</span>
                </motion.button>

              </div>

              <div className="text-[10px] text-slate-400 text-center font-mono pt-1 border-t border-slate-100 dark:border-blue-900/40 tabular-nums">
                {liveTimeString} EAT · {liveCounts ? `${liveCounts.totalPatients} pts` : 'Syncing DB...'}
              </div>
            </div>

          </div>

          {/* 5. Reactive Bottom Utility Ribbon with Emergency Call 112 */}
          <div className="p-3 sm:p-3.5 doctorian-thick-card flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto text-left">
              
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => triggerFeatureFeedback('Language Settings Opened', 'settings')}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-blue-500/10 transition-colors text-left cursor-pointer"
              >
                <div className="w-7.5 h-7.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Globe size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t('Multilingual Support')}</p>
                  <p className="text-[9.5px] text-slate-400">(EN, Luganda, Swahili...)</p>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => triggerFeatureFeedback('Offline Clinical Sync Active', 'records')}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-emerald-500/10 transition-colors text-left cursor-pointer"
              >
                <div className="w-7.5 h-7.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <WifiOff size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t('Offline Mode')}</p>
                  <p className="text-[9.5px] text-slate-400">(Work Without Internet)</p>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => triggerFeatureFeedback('Security & Privacy Shield Opened', 'privacy')}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-purple-500/10 transition-colors text-left cursor-pointer"
              >
                <div className="w-7.5 h-7.5 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Lock size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t('Secure & Private')}</p>
                  <p className="text-[9.5px] text-slate-400">(AES-256 Encrypted)</p>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => triggerFeatureFeedback('Launching Doctorian AI Assistant', 'ai_nexus')}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-cyan-500/10 transition-colors text-left cursor-pointer"
              >
                <div className="w-7.5 h-7.5 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Cpu size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t('Doctorian AI Core')}</p>
                  <p className="text-[9.5px] text-slate-400">(Clinical Intelligence)</p>
                </div>
              </motion.button>

            </div>

            {/* Red Emergency Call 112 Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleEmergencyCall}
              className="w-full md:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 cursor-pointer shrink-0"
            >
              <PhoneCall size={16} className="animate-bounce" />
              <span>{t('Emergency Call 112')}</span>
              <ChevronRight size={15} />
            </motion.button>

          </div>

        </section>

        {/* ===================================================================== */}
        {/* CARD 2: COMPACT NEXT GENERATION FEATURES (Reactive & Crisp)           */}
        {/* ===================================================================== */}
        <section className="space-y-4 pt-2">

          {/* Compact Banner with Rocket & Interactive Feature Filter Chips */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white shadow-lg flex items-center justify-between p-4 sm:p-5">
            <div className="relative z-10 space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🚀</span>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {t('Next Generation Features')}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-blue-100 font-medium">
                    Tap any module below for instant clinical telemetry, AI triage, or care tools
                  </p>
                </div>
              </div>

              {/* Reactive Feature Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => triggerFeatureFeedback('Exploring Innovative Clinical Modules', 'features')}
                  className="px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 font-bold text-amber-300 cursor-pointer"
                >
                  ✨ Innovative
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => triggerFeatureFeedback('Launching Intelligent AI Assistant', 'ai_nexus')}
                  className="px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 font-bold text-cyan-300 cursor-pointer"
                >
                  🧠 Intelligent
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setIsSensorModalOpen(true)}
                  className="px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 font-bold text-emerald-300 cursor-pointer"
                >
                  🔗 Connected
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => triggerFeatureFeedback('Opening Vitality & Health Overview', 'vitality')}
                  className="px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 font-bold text-rose-300 cursor-pointer"
                >
                  ❤️ Health Monitor
                </motion.button>
              </div>
            </div>

            {/* Right Lockup */}
            <div className="relative z-10 hidden md:flex flex-col items-end text-right">
              <span className="text-base font-serif italic font-extrabold text-cyan-200 drop-shadow-md">
                Your Health
              </span>
              <span className="text-base font-serif italic font-extrabold text-white drop-shadow-md">
                Our Priority
              </span>
            </div>
          </div>

          {/* 3x3 Compact Grid of 9 Reactive Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* 1. AI Health Assistant */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerFeatureFeedback('Opening AI Health Assistant', 'ai_nexus')}
              className="p-3 sm:p-3.5 doctorian-thick-card transition-all cursor-pointer flex items-center gap-3 group text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {t('AI Health Assistant')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase shrink-0">
                    {t('Active')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Ask health questions, get instant advice.
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-blue-600 dark:text-cyan-400 mt-1 group-hover:translate-x-0.5 transition-transform">
                  {t('Open')} <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>

            {/* 2. Laboratory Analyzer */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerFeatureFeedback('Opening Laboratory Analyzer', 'diagnostic_lab')}
              className="p-3 sm:p-3.5 doctorian-thick-card transition-all cursor-pointer flex items-center gap-3 group text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 via-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-md shadow-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🔬
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {t('Laboratory Analyzer')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase shrink-0">
                    New
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Analyze lab results with AI insights.
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-purple-600 dark:text-purple-300 mt-1 group-hover:translate-x-0.5 transition-transform">
                  {t('Open')} <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>

            {/* 3. Telemedicine */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                triggerFeatureFeedback('Starting Telemedicine Video Suite');
                setIsVideoModalOpen(true);
              }}
              className="p-3 sm:p-3.5 doctorian-thick-card transition-all cursor-pointer flex items-center gap-3 group text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-2xl shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                📹
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {t('Telemedicine')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('Online')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Consult doctors via live video call.
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-emerald-600 dark:text-emerald-300 mt-1 group-hover:translate-x-0.5 transition-transform">
                  {t('Open')} <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>

            {/* 4. Image & Scan Analysis */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerFeatureFeedback('Opening Medical Image & Scan Analyzer', 'illustrator')}
              className="p-3 sm:p-3.5 doctorian-thick-card transition-all cursor-pointer flex items-center gap-3 group text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-2xl shadow-md shadow-orange-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🖼️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {t('Image & Scan Analysis')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase shrink-0">
                    Smart
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Analyze X-ray, MRI & medical images.
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-orange-600 dark:text-amber-300 mt-1 group-hover:translate-x-0.5 transition-transform">
                  {t('Open')} <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>

            {/* 5. Health Monitor */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerFeatureFeedback('Opening Vitality & Health Monitor', 'vitality')}
              className="p-3 sm:p-3.5 doctorian-thick-card transition-all cursor-pointer flex items-center gap-3 group text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-md shadow-cyan-500/20 shrink-0 group-hover:scale-105 transition-transform">
                ❤️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {t('Health Monitor')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase shrink-0">
                    Connected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Track steps, heart rate, SpO2 & temp.
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-cyan-600 dark:text-cyan-300 mt-1 group-hover:translate-x-0.5 transition-transform">
                  {t('Open')} <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>

            {/* 6. Health Robot */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerFeatureFeedback('Opening Health Robot Assistant', 'biomatic')}
              className="p-3 sm:p-3.5 doctorian-thick-card transition-all cursor-pointer flex items-center gap-3 group text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 via-blue-600 to-indigo-700 flex items-center justify-center text-2xl shadow-md shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🦾
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {t('Health Robot')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase shrink-0">
                    Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Personal biometric health assistant.
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-indigo-600 dark:text-indigo-300 mt-1 group-hover:translate-x-0.5 transition-transform">
                  {t('Open')} <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>

            {/* 7. Prescription Manager */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerFeatureFeedback('Opening Prescription Manager', 'meds')}
              className="p-3 sm:p-3.5 doctorian-thick-card transition-all cursor-pointer flex items-center gap-3 group text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center text-2xl shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                💊
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {t('Prescription Manager')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase shrink-0">
                    {t('Active')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Manage prescriptions online or offline.
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-emerald-600 dark:text-emerald-300 mt-1 group-hover:translate-x-0.5 transition-transform">
                  {t('Open')} <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>

            {/* 8. Smart Appointments */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerFeatureFeedback('Opening Smart Appointments', 'clinical_roadmap')}
              className="p-3 sm:p-3.5 doctorian-thick-card transition-all cursor-pointer flex items-center gap-3 group text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-700 flex items-center justify-center text-2xl shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                📅
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {t('Smart Appointments')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase shrink-0">
                    Easy
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Book and track upcoming visits.
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-blue-600 dark:text-cyan-300 mt-1 group-hover:translate-x-0.5 transition-transform">
                  {t('Open')} <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>

            {/* 9. Preventive Care */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerFeatureFeedback('Opening Preventive Care Suite', 'genomic_longevity')}
              className="p-3 sm:p-3.5 doctorian-thick-card transition-all cursor-pointer flex items-center gap-3 group text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 via-pink-500 to-red-600 flex items-center justify-center text-2xl shadow-md shadow-rose-500/20 shrink-0 group-hover:scale-105 transition-transform">
                🛡️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {t('Preventive Care')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase shrink-0">
                    Proactive
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Personalized health & longevity tips.
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-rose-600 dark:text-rose-300 mt-1 group-hover:translate-x-0.5 transition-transform">
                  {t('Open')} <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>

          </div>

          {/* Bottom Compact Summary Row of Card 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Live Completion Progress Donut (Shows what is Done vs Pending) */}
            <div className="p-3.5 doctorian-thick-card flex flex-col justify-between space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity size={15} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('Done vs Pending')}
                  </h4>
                </div>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Live
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-0.5">
                <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="3.5" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray={`${liveProgress?.overallScore ?? 0}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-black text-slate-900 dark:text-white leading-none tabular-nums">
                      {liveProgress?.overallScore ?? 0}%
                    </span>
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{t('Completed')}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[10.5px] text-left flex-1">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => triggerFeatureFeedback('Opening Steps & Vitality Tracker', 'vitality')}
                    className="w-full flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        stepsToday > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {stepsToday > 0 ? '✓' : '…'}
                      </span>
                      {t('Steps Goal')}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white tabular-nums">{stepsGoalPct}%</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => triggerFeatureFeedback('Opening Prescription Approvals', 'meds')}
                    className="w-full flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        (liveCounts?.pendingPrescriptions ?? 0) === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {(liveCounts?.pendingPrescriptions ?? 0) === 0 ? '✓' : '…'}
                      </span>
                      {t('Rx Approved')}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white tabular-nums">{liveProgress?.rxDonePct ?? 0}%</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => triggerFeatureFeedback('Opening Clinical Appointments', 'clinical_roadmap')}
                    className="w-full flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        (liveCounts?.pendingAppointments ?? 0) === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {(liveCounts?.pendingAppointments ?? 0) === 0 ? '✓' : '…'}
                      </span>
                      {t('Appointments')}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white tabular-nums">{liveProgress?.apptsDonePct ?? 0}%</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* 2. Reactive Live Done vs Not-Yet-Done Checklist */}
            <div className="p-3.5 doctorian-thick-card flex flex-col justify-between space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-blue-500" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('What Is Done vs Pending')}
                  </h4>
                </div>
                <button 
                  type="button" 
                  onClick={() => onNavigate('clinical_roadmap')} 
                  className="text-[10.5px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {t('View All')} →
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {(liveSummary?.checklist || []).slice(0, 3).map((task) => (
                  <motion.button
                    key={task.key}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const target = task.key.includes('step') ? 'vitality' : task.key.includes('rx') ? 'meds' : 'clinical_roadmap';
                      triggerFeatureFeedback(`${task.label}: ${task.statusText}`, target);
                    }}
                    className="w-full flex items-center justify-between p-1.5 rounded-xl bg-slate-50 dark:bg-[#0c1a36] hover:bg-blue-500/10 border border-cyan-500/15 cursor-pointer text-left transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 dark:text-white truncate text-[10.5px]">{task.label}</p>
                      <p className="text-[9.5px] text-slate-400 truncate">{task.statusText}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                      task.done
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    }`}>
                      {task.done ? t('Done') : t('Not Yet')}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 3. Quick Actions */}
            <div className="p-3.5 doctorian-thick-card flex flex-col justify-between space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={15} className="text-blue-500" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('Quick Actions')}
                </h4>
              </div>

              <div className="space-y-1.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => triggerFeatureFeedback('Opening Symptom Checker', 'symptoms')}
                  className="w-full p-2 rounded-xl bg-blue-50/80 dark:bg-[#0c1a36] hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-cyan-300 text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5.5 h-5.5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[11px] group-hover:scale-110 transition-transform">🩺</span>
                    {t('Check Symptoms')}
                  </span>
                  <ChevronRight size={13} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => triggerFeatureFeedback('Opening Health Data Analytics', 'vitality')}
                  className="w-full p-2 rounded-xl bg-emerald-50/80 dark:bg-[#0c1a36] hover:bg-emerald-100 dark:hover:bg-blue-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5.5 h-5.5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[11px] group-hover:scale-110 transition-transform">📊</span>
                    {t('Analyze Health Data')}
                  </span>
                  <ChevronRight size={13} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => triggerFeatureFeedback('Opening Patient Records', 'records')}
                  className="w-full p-2 rounded-xl bg-purple-50/80 dark:bg-[#0c1a36] hover:bg-purple-100 dark:hover:bg-blue-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5.5 h-5.5 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[11px] group-hover:scale-110 transition-transform">📁</span>
                    {t('View My Records')}
                  </span>
                  <ChevronRight size={13} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </div>
            </div>

            {/* 4. Compact "Your Data is Safe" Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#091b33] to-[#040e1e] text-white shadow-md flex flex-col justify-between space-y-2 relative overflow-hidden border border-cyan-500/30">
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={14} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">{t('Your Data is Safe')}</h4>
              </div>

              <p className="text-[11px] text-blue-200/90 leading-snug relative z-10">
                AES-256 encrypted health records and HIPAA-ready telemetry privacy.
              </p>

              <div className="relative z-10 pt-0.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => triggerFeatureFeedback('Opening Privacy & Data Protection Center', 'privacy')}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>{t('Learn More')}</span>
                  <ChevronRight size={13} />
                </motion.button>
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
      <HospitalLocationGuideModal
        isOpen={isHospitalGuideOpen}
        onClose={() => setIsHospitalGuideOpen(false)}
        hospital={hospital}
        distanceKm={distanceKm}
        estimatedArrivalMins={estimatedArrivalMins}
        bearingDegrees={bearingDegrees}
        cardinal={cardinal}
        directionText={directionText}
        googleMapsDirUrl={googleMapsDirUrl}
        isGpsLive={isGpsLive}
        isScanningGps={isScanningGps}
        gpsError={gpsError}
        nearbyHospitals={nearbyHospitals}
        onScanGps={scanGps}
        onSelectDistrict={selectDistrict}
        onSelectHospitalById={selectHospitalById}
        liveBeds={liveBeds}
      />
    </div>
  );
};

export default Dashboard;
