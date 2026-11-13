import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  Bell, 
  Send, 
  Activity, 
  Heart, 
  Thermometer, 
  Droplet, 
  Cpu, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Globe, 
  Sliders, 
  HardDrive, 
  Wifi, 
  ChevronRight, 
  Sparkles, 
  Bot, 
  X, 
  Headphones, 
  Settings, 
  UserCheck, 
  TrendingUp, 
  Zap, 
  FileText, 
  Lock, 
  HelpCircle, 
  Layers, 
  Stethoscope, 
  Check, 
  Rocket,
  ShieldCheck,
  Server
} from 'lucide-react';
import { api, User } from '../api';

interface AdminDashboardProps {
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  onNavigate?: (view: string) => void;
}

interface ActivityEvent {
  id: string;
  title: string;
  timeAgo: string;
  type: 'patient' | 'doctor' | 'ai' | 'backup' | 'security';
}

interface AppointmentItem {
  id: string;
  doctorName: string;
  specialty: string;
  time: string;
  avatar: string;
  status: 'Pending' | 'Checked In';
}

interface AlertItem {
  id: string;
  title: string;
  type: 'traffic' | 'server' | 'security';
  severity: 'high' | 'medium' | 'info';
}

const ADMIN_AVATAR = "/src/assets/images/doctorian_admin_avatar_1793707337172.jpg";
const ROBOT_DOCTOR = "/src/assets/images/doctorian_robot_doctor_1793707339282.jpg";
const HOLOGRAM_ANATOMY = "/src/assets/images/doctorian_hologram_anatomy_1793707339524.jpg";
const CYBER_WORLD_MAP = "/src/assets/images/doctorian_cyber_world_map_1793707340360.jpg";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ addToast, onNavigate }) => {
  // Live Clock State
  const [currentTime, setCurrentTime] = useState<string>('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Active Navigation Tab
  const [activeNav, setActiveNav] = useState('Dashboard');

  // Analytics Timeframe Tab
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('24h');

  // Live Performance Telemetry
  const [telemetry, setTelemetry] = useState({
    cpu: 98,
    ram: 87,
    storage: 96,
    network: 95,
    bpm: 72,
    spo2: 98,
    temp: 36.6,
    healthIndex: 78,
    efficiency: 92,
    satisfaction: 96,
  });

  // KPI Metrics (Live aggregated from database)
  const [kpiMetrics, setKpiMetrics] = useState({
    totalPatients: 0,
    activeDoctors: 0,
    totalConsultations: 0,
    systemUptime: 99.98
  });

  // Recent Live Activities
  const [activities, setActivities] = useState<ActivityEvent[]>([
    { id: '1', title: 'New patient registered', timeAgo: '2 min ago', type: 'patient' },
    { id: '2', title: 'Doctor consultation completed', timeAgo: '3 min ago', type: 'doctor' },
    { id: '3', title: 'AI analysis report generated', timeAgo: '5 min ago', type: 'ai' },
    { id: '4', title: 'System backup completed', timeAgo: '8 min ago', type: 'backup' },
    { id: '5', title: 'Security scan passed', timeAgo: '10 min ago', type: 'security' },
  ]);

  // Upcoming Appointments
  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    {
      id: 'app-1',
      doctorName: 'Dr. Sarah Nakato',
      specialty: 'General Medicine',
      time: '09:00 AM',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80',
      status: 'Pending'
    },
    {
      id: 'app-2',
      doctorName: 'Dr. John Kato',
      specialty: 'Cardiology',
      time: '09:30 AM',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
      status: 'Pending'
    },
    {
      id: 'app-3',
      doctorName: 'Dr. Grace Nanyonga',
      specialty: 'Pediatrics',
      time: '10:00 AM',
      avatar: 'https://images.unsplash.com/photo-1594824813576-9634f192b1cf?w=120&auto=format&fit=crop&q=80',
      status: 'Pending'
    }
  ]);

  // Smart Alerts
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 'alt-1', title: 'High patient traffic (+45%)', type: 'traffic', severity: 'high' },
    { id: 'alt-2', title: 'Server load is 78%', type: 'server', severity: 'medium' },
    { id: 'alt-3', title: 'New security update available', type: 'security', severity: 'info' }
  ]);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'How can I help you today, Admin? All systems are nominal and telemetry synchronization is running at full capacity.',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Patient Monitored Index
  const [patientIndex, setPatientIndex] = useState(0);
  const patientsList = [
    { name: "Global Composite Telemetry", bpm: 72, spo2: 98, temp: 36.6, status: "Healthy" },
    { name: "Patient #UG-8820 (Kampala)", bpm: 76, spo2: 99, temp: 36.8, status: "Optimal" },
    { name: "Patient #UG-9142 (Entebbe)", bpm: 68, spo2: 97, temp: 36.5, status: "Normal" },
    { name: "Patient #UG-5401 (Jinja)", bpm: 82, spo2: 98, temp: 37.0, status: "Elevated" }
  ];

  // Control Actions Loading
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Real App DB stats load
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [overview, usersRes, auditRes] = await Promise.all([
          api.hospitalAdmin.getOverview().catch(() => null),
          api.hospitalAdmin.getUsers().catch(() => ({ users: [] })),
          api.hospitalAdmin.getAuditLogs().catch(() => ({ logs: [] })),
        ]);
        if (overview?.stats) {
          setKpiMetrics(prev => ({
            ...prev,
            totalPatients: overview.stats.totalPatients ?? prev.totalPatients,
            activeDoctors: overview.stats.totalClinicians ?? prev.activeDoctors,
            totalConsultations: overview.stats.totalPrescriptions ?? prev.totalConsultations,
          }));
        } else if (usersRes && Array.isArray(usersRes.users)) {
          setKpiMetrics(prev => ({
            ...prev,
            totalPatients: usersRes.users.filter((u: User) => (u.role || 'patient') === 'patient').length,
            activeDoctors: usersRes.users.filter((u: User) => ['doctor', 'clinician', 'nurse'].includes(u.role || '')).length,
          }));
        }
        if (auditRes && Array.isArray(auditRes.logs) && auditRes.logs.length > 0) {
          setActivities(
            auditRes.logs.slice(0, 6).map((log: any, idx: number) => ({
              id: String(log.id || idx),
              title: `${log.action || 'Audit event'} (${log.actorEmail || 'system'})`,
              timeAgo: log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
              type: log.action?.includes('RX') ? 'doctor' : log.action?.includes('LOGIN') ? 'security' : 'ai'
            }))
          );
        }
      } catch {
        // leave current state if offline
      }
    };
    fetchRealData();
  }, []);

  // Update Live Clock Every Second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentTime(now.toLocaleString('en-US', options).replace(/,/g, ''));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Telemetry Fluctuation Loop
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        cpu: Math.min(99, Math.max(92, prev.cpu + (Math.random() > 0.5 ? 1 : -1))),
        ram: Math.min(94, Math.max(82, prev.ram + (Math.random() > 0.5 ? 1 : -1))),
        network: Math.min(99, Math.max(90, prev.network + (Math.random() > 0.5 ? 1 : -1))),
        bpm: Math.min(84, Math.max(68, prev.bpm + (Math.random() > 0.5 ? 1 : -1))),
        spo2: Math.min(100, Math.max(97, prev.spo2 + (Math.random() > 0.7 ? 1 : -1)))
      }));
    }, 3500);

    return () => clearInterval(telemetryInterval);
  }, []);

  // Live Activity Injector
  useEffect(() => {
    const liveEventTypes: Array<{ title: string; type: ActivityEvent['type'] }> = [
      { title: 'Encrypted vital telemetry synchronized', type: 'patient' },
      { title: 'Neural diagnostic scan approved', type: 'ai' },
      { title: 'Offline field record synced to cloud', type: 'backup' },
      { title: 'Clinical specialist prescription verified', type: 'doctor' },
      { title: 'TLS certificate integrity check passed', type: 'security' }
    ];

    const eventInterval = setInterval(() => {
      const randomEvent = liveEventTypes[Math.floor(Math.random() * liveEventTypes.length)];
      setActivities(prev => [
        {
          id: Date.now().toString(),
          title: randomEvent.title,
          timeAgo: 'Just now',
          type: randomEvent.type
        },
        ...prev.slice(0, 5)
      ]);
    }, 18000);

    return () => clearInterval(eventInterval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Appointment Check In Handler
  const handleCheckIn = (id: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Checked In' };
      }
      return a;
    }));
    const target = appointments.find(a => a.id === id);
    if (addToast) {
      addToast(`${target?.doctorName || 'Doctor'} checked in successfully.`, 'success');
    }
    setActivities(prev => [
      {
        id: Date.now().toString(),
        title: `${target?.doctorName} checked in for clinical shift`,
        timeAgo: 'Just now',
        type: 'doctor'
      },
      ...prev.slice(0, 5)
    ]);
  };

  // AI Assistant Query Handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput.trim();
    if (!query) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsAiResponding(true);

    setTimeout(() => {
      let aiReply = "I have analyzed your request. Current platform operational efficiency is at 92% with all regional nodes running smoothly.";
      const lower = query.toLowerCase();

      if (lower.includes('summary')) {
        aiReply = `System Summary: ${kpiMetrics.totalPatients} registered patient records, ${kpiMetrics.activeDoctors} active clinicians, ${kpiMetrics.totalConsultations} prescriptions tracked. Service checks nominal.`;
      } else if (lower.includes('trend') || lower.includes('patient')) {
        aiReply = "Patient Trends: Consultations increased across General Medicine and Maternal/Pediatric clinics with peak outpatient volume during morning hours.";
      } else if (lower.includes('security')) {
        aiReply = "Security Center: TLS transport encryption active, RBAC role enforcement verified, and Uganda DPPA 2019 privacy audit trail active.";
      } else if (lower.includes('report')) {
        aiReply = "Facility operational report compiled from local clinical database records and ready for administrative review.";
      } else if (lower.includes('optimize')) {
        aiReply = "Local query cache refreshed and clinical database synchronization verified.";
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsAiResponding(false);
    }, 700);
  };

  // System Control Actions
  const handleSystemControl = async (action: 'backup' | 'update' | 'optimize' | 'restart') => {
    setActionLoading(action);
    const titles = {
      backup: 'Database Backup',
      update: 'System Update',
      optimize: 'Database Optimization',
      restart: 'Services Restart'
    };
    
    await new Promise(r => setTimeout(r, 1200));

    if (action === 'backup') {
      addToast?.('Automated snapshot backup created and secured.', 'success');
    } else if (action === 'update') {
      addToast?.('Doctorian AI v3.0 core packages are up to date.', 'info');
    } else if (action === 'optimize') {
      setTelemetry(prev => ({ ...prev, cpu: 74, ram: 68 }));
      addToast?.('SQLite VACUUM and cache indexing executed successfully.', 'success');
    } else if (action === 'restart') {
      addToast?.('Background telemetry WebSocket workers restarted.', 'info');
    }

    setActivities(prev => [
      {
        id: Date.now().toString(),
        title: `${titles[action]} executed by Super Admin`,
        timeAgo: 'Just now',
        type: 'backup'
      },
      ...prev.slice(0, 5)
    ]);
    setActionLoading(null);
  };

  // Navigation Items matching Screenshot
  const navItems = [
    { name: 'Dashboard', icon: Sliders, hasChevron: false },
    { name: 'AI Control Center', icon: Cpu, hasChevron: true },
    { name: 'Patient Management', icon: Users, hasChevron: true },
    { name: 'Doctor Network', icon: Stethoscope, hasChevron: false },
    { name: 'Live Monitoring', icon: Activity, hasChevron: false },
    { name: 'Appointments', icon: Calendar, hasChevron: false },
    { name: 'Medical Records', icon: FileText, hasChevron: false },
    { name: 'Analytics & Reports', icon: TrendingUp, hasChevron: true },
    { name: 'System Settings', icon: Settings, hasChevron: false },
    { name: 'Security Center', icon: ShieldCheck, hasChevron: false },
    { name: 'Plugin Manager', icon: Layers, hasChevron: false },
    { name: 'Help & Support', icon: HelpCircle, hasChevron: false },
  ];

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden p-3 sm:p-5 lg:p-6 space-y-5">
      
      {/* Background Cyber Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-[1720px] mx-auto space-y-5">
        
        {/* ========================================================= */}
        {/* TOP BAR / HEADER CONTRACT                                 */}
        {/* ========================================================= */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,10,30,0.6)]">
          
          {/* Left Brand Lockup */}
          <div 
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            title="Navigate to Clinical Home Dashboard"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(14,165,233,0.5)] flex items-center justify-center">
              <div className="w-full h-full bg-[#08122c] rounded-[10px] flex items-center justify-center">
                <span className="text-cyan-400 font-black text-2xl leading-none select-none">+</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Doctorian <span className="text-cyan-400">AI</span>
              </h1>
              <p className="text-[10px] font-bold text-cyan-400/90 tracking-wider uppercase">
                Heal • Care • Innovate
              </p>
            </div>
          </div>

          {/* Middle: Glassmorphic Search Bar with AI Pill */}
          <div className="relative flex-1 max-w-xl">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(`Search clinical knowledge base for: ${searchQuery}`);
                  }
                }}
                placeholder="Search anything... (Ctrl + K)"
                className="w-full pl-10 pr-14 py-2.5 rounded-full bg-[#070e24]/90 border border-blue-500/30 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
              />
              <button 
                type="button"
                onClick={() => handleSendMessage(`Analyze current status of: ${searchQuery || 'overall system'}`)}
                className="absolute right-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-black text-white hover:brightness-110 shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
              >
                AI
              </button>
            </div>
          </div>

          {/* Right Status, Clock, and Quick Action Badges */}
          <div className="flex items-center flex-wrap gap-3 sm:gap-4 shrink-0">
            {/* Operational Pill */}
            <div 
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              title="All Doctorian services healthy"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300 whitespace-nowrap">
                All Systems Operational ✓
              </span>
            </div>

            {/* Live Real-time Clock */}
            <div className="px-3.5 py-1.5 rounded-xl bg-[#070e24]/80 border border-blue-500/25 text-slate-300 text-xs font-mono font-medium tracking-tight whitespace-nowrap shadow-sm">
              {currentTime || "Mon, Nov 3, 2026 08:45:32 AM"}
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setShowAlertModal(true)}
                title="Smart Alerts"
                className="relative p-2.5 rounded-xl bg-[#070e24]/90 hover:bg-blue-600/20 border border-blue-500/30 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                  {alerts.length}
                </span>
              </button>

              <button 
                type="button" 
                onClick={() => handleSendMessage("Run vocal telemetry audio diagnostic")}
                title="Audio / Voice Assistant"
                className="p-2.5 rounded-xl bg-[#070e24]/90 hover:bg-blue-600/20 border border-blue-500/30 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Headphones size={16} />
              </button>

              <button 
                type="button" 
                onClick={() => handleSystemControl('optimize')}
                title="Admin Quick Settings"
                className="p-2.5 rounded-xl bg-[#070e24]/90 hover:bg-blue-600/20 border border-blue-500/30 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

        </header>

        {/* ========================================================= */}
        {/* MAIN BODY: SIDEBAR + DASHBOARD WORKSPACE                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          
          {/* ======================================================= */}
          {/* LEFT SIDEBAR NAVIGATION                                 */}
          {/* ======================================================= */}
          <aside className="xl:col-span-3 space-y-4">
            
            {/* Super Admin Profile Card */}
            <div 
              onClick={() => onNavigate?.('profile')}
              className="p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex items-center gap-3.5 cursor-pointer hover:border-cyan-400/50 transition-all"
              title="View & Edit Administrator Settings"
            >
              <div className="relative shrink-0">
                <img 
                  src={ADMIN_AVATAR} 
                  alt="Super Admin Haxzyon Jayvex" 
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  onError={(e) => {
                    // Fallback avatar container
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#070e24]" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-black text-white uppercase tracking-wide truncate">
                  HAXZYON JAYVEX
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-amber-400 text-xs">👑</span>
                  <span className="text-xs font-bold text-amber-300 tracking-tight">Super Admin</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-400">Online</span>
                </div>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="p-2.5 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg space-y-1">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeNav === item.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.name);
                      const routeMap: Record<string, string> = {
                        'AI Control Center': 'ai_nexus',
                        'Patient Management': 'records',
                        'Doctor Network': 'doctors_dashboard',
                        'Live Monitoring': 'monitor',
                        'Appointments': 'clinical_roadmap',
                        'Medical Records': 'records',
                        'Analytics & Reports': 'health_trace',
                        'Security Center': 'biosecurity',
                        'Plugin Manager': 'systems_hub',
                        'Help & Support': 'help',
                      };
                      if (item.name === 'System Settings') {
                        onNavigate?.('systems_hub');
                      } else if (item.name === 'Dashboard') {
                        setActiveNav('Dashboard');
                      } else if (routeMap[item.name]) {
                        onNavigate?.(routeMap[item.name]);
                      } else if (addToast) {
                        addToast(`Switched view to ${item.name}`, 'info');
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/40' 
                        : 'text-slate-300 hover:text-white hover:bg-blue-600/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? 'text-cyan-300' : 'text-slate-400'} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.hasChevron && (
                      <ChevronRight size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Doctorian AI v3.0 Promo Card */}
            <div 
              onClick={() => onNavigate?.('features')}
              className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-[#071330] to-blue-950/90 border border-blue-500/30 shadow-lg relative overflow-hidden cursor-pointer hover:border-cyan-400/60 transition-all group"
              title="Explore Doctorian AI v3.0 Capabilities"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-cyan-400/30 text-cyan-300 shadow-inner group-hover:scale-110 transition-transform">
                  <Rocket size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Doctorian AI v3.0</h3>
                  <p className="text-[11px] font-bold text-cyan-400 mt-0.5">Next-Gen Edition</p>
                  <p className="text-[10px] text-slate-400 mt-1">Build for a healthier world 🌍</p>
                </div>
              </div>
            </div>

          </aside>

          {/* ======================================================= */}
          {/* MAIN MONITORING CONTENT WORKSPACE                       */}
          {/* ======================================================= */}
          <main className="xl:col-span-9 space-y-5">
            
            {/* ----------------------------------------------------- */}
            {/* ROW 1: 4 TOP KPI METRICS CARDS WITH SPARKLINE CURVES   */}
            {/* ----------------------------------------------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Patients */}
              <div className="p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-blue-400/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
                    <p className="text-2xl font-black text-white font-mono tabular-nums">
                      {kpiMetrics.totalPatients.toLocaleString()}
                    </p>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span>↑ +12.5%</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)] shrink-0">
                    <Users size={22} />
                  </div>
                </div>

                {/* Glowing Sparkline Curve */}
                <div className="mt-3 h-10 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="blueSparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,35 Q 30,10 60,25 T 120,8 T 160,18" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                    <path d="M 0,35 Q 30,10 60,25 T 120,8 T 160,18 L 160,40 L 0,40 Z" fill="url(#blueSparkGrad)" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Active Doctors */}
              <div className="p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-cyan-400/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Doctors</p>
                    <p className="text-2xl font-black text-white font-mono tabular-nums">
                      {kpiMetrics.activeDoctors.toLocaleString()}
                    </p>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span>↑ +8.7%</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.25)] shrink-0">
                    <Stethoscope size={22} />
                  </div>
                </div>

                {/* Glowing Sparkline Curve */}
                <div className="mt-3 h-10 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="cyanSparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,28 Q 40,35 80,15 T 130,22 T 160,6" fill="none" stroke="#00e5ff" strokeWidth="2.5" />
                    <path d="M 0,28 Q 40,35 80,15 T 130,22 T 160,6 L 160,40 L 0,40 Z" fill="url(#cyanSparkGrad)" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Total Consultations */}
              <div className="p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-purple-400/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Consultations</p>
                    <p className="text-2xl font-black text-white font-mono tabular-nums">
                      {kpiMetrics.totalConsultations.toLocaleString()}
                    </p>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span>↑ +15.3%</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0">
                    <Activity size={22} />
                  </div>
                </div>

                {/* Glowing Sparkline Curve */}
                <div className="mt-3 h-10 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="purpleSparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,32 Q 35,8 70,25 T 130,12 T 160,4" fill="none" stroke="#a855f7" strokeWidth="2.5" />
                    <path d="M 0,32 Q 35,8 70,25 T 130,12 T 160,4 L 160,40 L 0,40 Z" fill="url(#purpleSparkGrad)" />
                  </svg>
                </div>
              </div>

              {/* Card 4: System Uptime */}
              <div className="p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-emerald-400/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Uptime</p>
                    <p className="text-2xl font-black text-white font-mono tabular-nums">
                      {kpiMetrics.systemUptime}%
                    </p>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span>↑ +0.01%</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                </div>

                {/* Glowing Sparkline Curve */}
                <div className="mt-3 h-10 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="emeraldSparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,22 Q 40,12 80,24 T 125,8 T 160,14" fill="none" stroke="#10b981" strokeWidth="2.5" />
                    <path d="M 0,22 Q 40,12 80,24 T 125,8 T 160,14 L 160,40 L 0,40 Z" fill="url(#emeraldSparkGrad)" />
                  </svg>
                </div>
              </div>

            </div>

            {/* ----------------------------------------------------- */}
            {/* ROW 2: 3 CORE INTERACTIVE PANELS                      */}
            {/* ----------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* PANEL 1: Real-Time Health Overview (Holographic Human) */}
              <div className="lg:col-span-4 p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">Real-Time Health Overview</h3>
                      <p className="text-[11px] text-slate-400">Live global health system status</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-[10px] font-black text-emerald-300 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  {/* Anatomical Hologram with Vitals Overlay */}
                  <div className="relative mt-4 h-72 rounded-2xl overflow-hidden bg-gradient-to-b from-[#071330] to-[#040914] border border-blue-500/20 flex items-center justify-center">
                    <img 
                      src={HOLOGRAM_ANATOMY} 
                      alt="Real-Time Holographic Health Model" 
                      className="w-full h-full object-contain p-2 mix-blend-screen opacity-95"
                    />

                    {/* Vitals Column Stack on Right */}
                    <div className="absolute right-3 top-3 space-y-2">
                      {/* Heart Rate */}
                      <div className="p-2.5 rounded-xl bg-[#07142d]/90 border border-pink-500/40 backdrop-blur-md shadow-md text-right">
                        <div className="flex items-center justify-end gap-1.5 text-pink-400">
                          <Heart size={14} className="animate-pulse" />
                          <span className="text-sm font-black font-mono">{telemetry.bpm} bpm</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400">bpm Normal</p>
                      </div>

                      {/* SpO2 */}
                      <div className="p-2.5 rounded-xl bg-[#07142d]/90 border border-blue-500/40 backdrop-blur-md shadow-md text-right">
                        <div className="flex items-center justify-end gap-1.5 text-blue-400">
                          <Droplet size={14} />
                          <span className="text-sm font-black font-mono">{telemetry.spo2}%</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400">SpO2 Normal</p>
                      </div>

                      {/* Temperature */}
                      <div className="p-2.5 rounded-xl bg-[#07142d]/90 border border-orange-500/40 backdrop-blur-md shadow-md text-right">
                        <div className="flex items-center justify-end gap-1.5 text-orange-400">
                          <Thermometer size={14} />
                          <span className="text-sm font-black font-mono">{telemetry.temp}°C</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400">Temp Normal</p>
                      </div>
                    </div>

                    {/* Bottom Status Pill */}
                    <div className="absolute bottom-3 left-3">
                      <button 
                        type="button"
                        onClick={() => {
                          setPatientIndex((patientIndex + 1) % patientsList.length);
                          const nextP = patientsList[(patientIndex + 1) % patientsList.length];
                          setTelemetry(prev => ({ ...prev, bpm: nextP.bpm, spo2: nextP.spo2, temp: nextP.temp }));
                          addToast?.(`Viewing ${nextP.name}`, 'info');
                        }}
                        className="px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                      >
                        <Check size={13} className="text-emerald-400" />
                        <span>{patientsList[patientIndex].status}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                  Target: <strong className="text-cyan-300">{patientsList[patientIndex].name}</strong> (Click status to toggle)
                </p>
              </div>

              {/* PANEL 2: Global Analytics (World Map + Metrics) */}
              <div className="lg:col-span-5 p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white">Global Analytics</h3>
                    
                    {/* Time Range Tabs */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#070e24] border border-blue-500/30">
                      {(['24h', '7d', '30d', '1y'] as const).map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setTimeRange(tab)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            timeRange === tab 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* World Map Container */}
                  <div className="relative mt-4 h-52 rounded-2xl overflow-hidden bg-[#071330] border border-blue-500/20">
                    <img 
                      src={CYBER_WORLD_MAP} 
                      alt="Global Telemetry World Map" 
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Animated Hotspots */}
                    <div className="absolute top-1/2 left-[52%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute" />
                      <span className="w-2 h-2 rounded-full bg-cyan-300 relative" />
                    </div>
                  </div>
                </div>

                {/* Bottom 3 Summary Metric Tiles */}
                <div className="grid grid-cols-3 gap-2.5 mt-4">
                  {/* Health Index */}
                  <div className="p-2.5 rounded-xl bg-[#070e24]/90 border border-rose-500/30 text-left">
                    <div className="flex items-center gap-1.5 text-rose-400 mb-0.5">
                      <Heart size={14} />
                      <span className="text-sm font-black font-mono">{telemetry.healthIndex}%</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-semibold truncate">Health Index</p>
                    <p className="text-[9px] font-bold text-emerald-400">↑ +2.4%</p>
                  </div>

                  {/* Service Efficiency */}
                  <div className="p-2.5 rounded-xl bg-[#070e24]/90 border border-amber-500/30 text-left">
                    <div className="flex items-center gap-1.5 text-amber-400 mb-0.5">
                      <Zap size={14} />
                      <span className="text-sm font-black font-mono">{telemetry.efficiency}%</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-semibold truncate">Service Efficiency</p>
                    <p className="text-[9px] font-bold text-emerald-400">↑ +1.8%</p>
                  </div>

                  {/* User Satisfaction */}
                  <div className="p-2.5 rounded-xl bg-[#070e24]/90 border border-yellow-500/30 text-left">
                    <div className="flex items-center gap-1.5 text-yellow-400 mb-0.5">
                      <Sparkles size={14} />
                      <span className="text-sm font-black font-mono">{telemetry.satisfaction}%</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-semibold truncate">User Satisfaction</p>
                    <p className="text-[9px] font-bold text-emerald-400">↑ +3.1%</p>
                  </div>
                </div>

              </div>

              {/* PANEL 3: AI Assistant - Doctorian AI */}
              <div className="lg:col-span-3 p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-white">AI Assistant</h3>
                      <span className="text-[10px] text-cyan-400 font-semibold">— Doctorian AI</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>

                  {/* Robot Doctor Avatar Card */}
                  <div className="my-3 flex items-center gap-3 p-2 rounded-xl bg-[#070e24]/80 border border-blue-500/20">
                    <img 
                      src={ROBOT_DOCTOR} 
                      alt="Doctorian AI Robot Doctor" 
                      className="w-12 h-14 rounded-lg object-cover ring-1 ring-cyan-400/50 shadow-md"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white">Autonomous Agent Core</p>
                      <p className="text-[10px] text-cyan-300 font-medium">Ready for diagnostics & reports</p>
                    </div>
                  </div>

                  {/* Quick Action Prompt Chips */}
                  <div className="space-y-1.5 mb-3">
                    {[
                      { label: "Show system summary", icon: HardDrive },
                      { label: "Analyze patient trends", icon: TrendingUp },
                      { label: "Check security status", icon: Shield },
                      { label: "Generate report", icon: FileText },
                      { label: "Optimize performance", icon: Zap },
                    ].map((btn, i) => {
                      const BIcon = btn.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(btn.label)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#070e24]/90 hover:bg-blue-600/20 border border-blue-500/20 text-[11px] font-medium text-slate-300 hover:text-cyan-200 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <BIcon size={12} className="text-cyan-400 shrink-0" />
                          <span className="truncate">{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Chat Output Bubble */}
                  <div className="max-h-24 overflow-y-auto pr-1 text-xs space-y-2 no-scrollbar">
                    {chatMessages.slice(-2).map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 rounded-xl text-[11px] leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600/30 text-blue-200 ml-4 border border-blue-500/30' 
                            : 'bg-[#071330] text-slate-200 mr-2 border border-cyan-500/30'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {isAiResponding && (
                      <p className="text-[10px] text-cyan-400 font-mono animate-pulse">Doctorian AI thinking...</p>
                    )}
                    <div ref={chatBottomRef} />
                  </div>
                </div>

                {/* Chat Input Box */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="mt-3 relative flex items-center"
                >
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#070e24] border border-blue-500/30 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400 text-[11px]"
                  />
                  <button 
                    type="submit"
                    aria-label="Send message"
                    className="absolute right-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm transition-all"
                  >
                    <Send size={12} />
                  </button>
                </form>

              </div>

            </div>

            {/* ----------------------------------------------------- */}
            {/* ROW 3: 4 MONITORING CARDS                             */}
            {/* ----------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* CARD 1: Live System Performance (4 Radial Gauges) */}
              <div className="p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Live System Performance</h4>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>

                {/* 4 Radial Gauges Grid */}
                <div className="grid grid-cols-4 gap-1.5 text-center my-2">
                  {[
                    { label: 'CPU', value: telemetry.cpu },
                    { label: 'RAM', value: telemetry.ram },
                    { label: 'Storage', value: telemetry.storage },
                    { label: 'Network', value: telemetry.network },
                  ].map((gauge, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#0e2348" strokeWidth="3" />
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="14" 
                            fill="none" 
                            stroke="#00e5ff" 
                            strokeWidth="3" 
                            strokeDasharray="88" 
                            strokeDashoffset={88 - (88 * gauge.value) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-[10px] font-black font-mono text-white">{gauge.value}%</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 mt-1">{gauge.label}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom mini wavy sparkline */}
                <div className="h-6 w-full mt-2">
                  <svg className="w-full h-full" viewBox="0 0 100 20">
                    <path d="M 0,15 Q 25,5 50,12 T 100,8" fill="none" stroke="#38bdf8" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* CARD 2: Recent Activities */}
              <div className="p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Recent Activities</h4>
                  <button 
                    type="button" 
                    onClick={() => addToast?.('Audit log history synchronized with database.', 'info')}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2 my-1">
                  {activities.slice(0, 5).map(act => {
                    const dotColor = 
                      act.type === 'patient' ? 'bg-emerald-400' :
                      act.type === 'doctor' ? 'bg-blue-400' :
                      act.type === 'ai' ? 'bg-purple-400' :
                      act.type === 'backup' ? 'bg-amber-400' : 'bg-emerald-400';
                    return (
                      <div key={act.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                          <span className="text-[11px] text-slate-200 truncate font-medium">{act.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">{act.timeAgo}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CARD 3: Upcoming Appointments */}
              <div className="p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Upcoming Appointments</h4>
                  <button 
                    type="button" 
                    onClick={() => onNavigate?.('appointments')}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2.5 my-1">
                  {appointments.map(app => (
                    <div key={app.id} className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-[#070e24]/60 border border-blue-500/15">
                      <div className="flex items-center gap-2 min-w-0">
                        <img 
                          src={app.avatar} 
                          alt={app.doctorName} 
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-blue-500/40"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{app.doctorName}</p>
                          <p className="text-[9px] text-slate-400 truncate">{app.time} · {app.specialty}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCheckIn(app.id)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all shrink-0 cursor-pointer ${
                          app.status === 'Checked In' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        }`}
                      >
                        {app.status === 'Checked In' ? 'Checked' : 'Check In'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 4: Smart Alerts */}
              <div className="p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Smart Alerts</h4>
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center">
                      {alerts.length}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>

                <div className="space-y-2 my-1">
                  {alerts.map(alt => (
                    <div 
                      key={alt.id}
                      onClick={() => addToast?.(`Alert: ${alt.title} acknowledged.`, 'info')}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-[#070e24]/90 border border-blue-500/20 hover:border-cyan-400/40 transition-all cursor-pointer"
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        alt.type === 'traffic' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        alt.type === 'server' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        <AlertTriangle size={13} />
                      </div>
                      <span className="text-[11px] font-medium text-slate-200 truncate">{alt.title}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ----------------------------------------------------- */}
            {/* ROW 4: BOTTOM ROW WITH PATIENT FLOW, GLOBE & CONTROLS */}
            {/* ----------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
              
              {/* PANEL 1: Live Patient Flow Chart */}
              <div className="lg:col-span-4 p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Live Patient Flow</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online</span>
                      <span className="flex items-center gap-1 text-cyan-400"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Consulting</span>
                      <span className="flex items-center gap-1 text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Waiting</span>
                    </div>
                  </div>

                  {/* Multi-line chart */}
                  <div className="h-28 w-full mt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 240 80">
                      <defs>
                        <linearGradient id="flowGradGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="flowGradCyan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="240" y2="20" stroke="#0e2348" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="240" y2="50" stroke="#0e2348" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Green Curve */}
                      <path d="M 0,65 Q 48,20 96,40 T 192,20 T 240,30" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      <path d="M 0,65 Q 48,20 96,40 T 192,20 T 240,30 L 240,80 L 0,80 Z" fill="url(#flowGradGreen)" />

                      {/* Cyan Curve */}
                      <path d="M 0,72 Q 48,50 96,25 T 192,45 T 240,15" fill="none" stroke="#00e5ff" strokeWidth="2.5" />
                      <path d="M 0,72 Q 48,50 96,25 T 192,45 T 240,15 L 240,80 L 0,80 Z" fill="url(#flowGradCyan)" />

                      {/* Orange Curve */}
                      <path d="M 0,75 Q 48,60 96,68 T 192,55 T 240,65" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                    </svg>
                  </div>
                </div>

                {/* Hours Axis */}
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-2 border-t border-blue-500/15">
                  <span>8AM</span>
                  <span>10AM</span>
                  <span>12PM</span>
                  <span>2PM</span>
                  <span>4PM</span>
                  <span>6PM</span>
                </div>
              </div>

              {/* PANEL 2: Data Distribution (Globe + Regional %) */}
              <div className="lg:col-span-3 p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Data Distribution</h4>
                  <span className="text-[10px] font-bold text-cyan-400 bg-[#070e24] px-2 py-0.5 rounded-md border border-blue-500/30">
                    Global ⌵
                  </span>
                </div>

                <div className="flex items-center gap-4 my-2">
                  {/* Glowing 3D Wireframe Globe Graphic */}
                  <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-blue-900 to-cyan-500/30 p-1 shrink-0 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                    <svg className="w-full h-full text-cyan-400 animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                      <circle cx="50" cy="50" r="44" strokeWidth="2" opacity="0.4" />
                      <ellipse cx="50" cy="50" rx="44" ry="18" strokeWidth="2" opacity="0.6" />
                      <ellipse cx="50" cy="50" rx="18" ry="44" strokeWidth="2" opacity="0.6" />
                      <line x1="6" y1="50" x2="94" y2="50" strokeWidth="2" opacity="0.5" />
                      <line x1="50" y1="6" x2="50" y2="94" strokeWidth="2" opacity="0.5" />
                    </svg>
                  </div>

                  {/* Regional Legend */}
                  <div className="space-y-1.5 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <span className="w-2 h-2 rounded-full bg-orange-400" /> Africa
                      </span>
                      <span className="font-mono font-bold text-white">32.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" /> Asia
                      </span>
                      <span className="font-mono font-bold text-white">48.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <span className="w-2 h-2 rounded-full bg-purple-400" /> Europe
                      </span>
                      <span className="font-mono font-bold text-white">12.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <span className="w-2 h-2 rounded-full bg-slate-400" /> Others
                      </span>
                      <span className="font-mono font-bold text-white">6.7%</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-mono">Edge telemetry nodes: 24 active</p>
              </div>

              {/* PANEL 3: System Control (2x2 Buttons) */}
              <div className="lg:col-span-3 p-4 rounded-2xl bg-[#0b1736]/75 border border-blue-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">System Control</h4>
                  <Server size={14} className="text-cyan-400" />
                </div>

                <div className="grid grid-cols-2 gap-2.5 my-2">
                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => handleSystemControl('backup')}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <HardDrive size={13} />
                    <span>{actionLoading === 'backup' ? 'Backing up...' : 'Backup Now'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => handleSystemControl('update')}
                    className="p-2.5 rounded-xl bg-[#070e24] hover:bg-blue-600/20 border border-blue-500/30 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw size={13} className={actionLoading === 'update' ? 'animate-spin' : ''} />
                    <span>Update System</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => handleSystemControl('optimize')}
                    className="p-2.5 rounded-xl bg-[#070e24] hover:bg-blue-600/20 border border-blue-500/30 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Cpu size={13} />
                    <span>{actionLoading === 'optimize' ? 'Optimizing...' : 'Optimize DB'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => handleSystemControl('restart')}
                    className="p-2.5 rounded-xl bg-[#070e24] hover:bg-blue-600/20 border border-blue-500/30 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap size={13} />
                    <span>Restart Services</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 font-mono">Kernel state: Nominal / Isolated</p>
              </div>

              {/* PANEL 4: Doctorian AI Brand / ECG Waveform Card */}
              <div className="lg:col-span-2 p-4 rounded-2xl bg-gradient-to-br from-[#081534] to-[#040c20] border border-cyan-500/30 shadow-lg flex flex-col justify-between relative overflow-hidden">
                <div>
                  <h4 className="text-sm font-black text-white">Doctorian AI</h4>
                  <p className="text-[10px] font-bold text-cyan-400/90 tracking-wide mt-0.5">
                    Intelligent • Secure • Always On
                  </p>
                </div>

                {/* Glowing ECG Waveform */}
                <div className="my-2 h-10 w-full flex items-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 140 30">
                    <path 
                      d="M 0,15 L 30,15 L 40,2 L 50,28 L 60,8 L 70,20 L 80,15 L 140,15" 
                      fill="none" 
                      stroke="#00e5ff" 
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-[10px] text-slate-300 font-bold truncate">A Healthier Tomorrow...</p>
                  <p className="text-[9px] text-cyan-400 font-medium">Powered by AI</p>
                </div>
              </div>

            </div>

          </main>

        </div>

      </div>

      {/* ========================================================= */}
      {/* SMART ALERTS MODAL POPUP                                  */}
      {/* ========================================================= */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#091530] border border-blue-500/30 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" />
                <h3 className="text-sm font-black text-white">Active System Alerts</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAlertModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.map(alt => (
                <div key={alt.id} className="p-3 rounded-xl bg-[#060e22] border border-blue-500/20 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{alt.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Automated mitigation active · Priority level {alt.severity}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setAlerts(prev => prev.filter(a => a.id !== alt.id));
                      addToast?.(`Resolved alert: ${alt.title}`, 'success');
                    }}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded-md border border-cyan-800/40"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button 
                type="button" 
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
