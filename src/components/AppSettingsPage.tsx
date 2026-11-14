import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  User, 
  Edit3, 
  Mail, 
  Phone, 
  MapPin, 
  Crown, 
  MessageSquare, 
  FlaskConical, 
  Video, 
  Image as ImageIcon, 
  Activity, 
  Bot, 
  Globe, 
  Mic, 
  RefreshCw, 
  WifiOff, 
  Cloud, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Laptop, 
  HelpCircle, 
  BookOpen, 
  Info, 
  ChevronRight, 
  X, 
  Heart, 
  Calendar, 
  Bell, 
  Stethoscope, 
  ExternalLink,
  Shield,
  Eye,
  Sliders,
  Database,
  Moon,
  Watch
} from 'lucide-react';

interface AppSettingsPageProps {
  onNavigate?: (view: string) => void;
  user?: any;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const AppSettingsPage: React.FC<AppSettingsPageProps> = ({
  onNavigate,
  user,
  addToast,
  isDarkMode = true,
  onToggleTheme
}) => {
  // Navigation helper
  const handleNav = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  const toast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (addToast) {
      addToast(msg, type);
    }
  };

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.displayName || 'Akora Joseph',
    patientId: 'Patient ID: DAI-2026-1187',
    role: 'Verified Patient & Clinician',
    email: user?.email || 'akora.joseph@doctorian.org',
    phone: '+256 700 123 456',
    location: 'Kampala, Uganda'
  });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Settings Tabs: General | Notifications | Appearance | Privacy
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'appearance' | 'privacy'>('general');

  // Interactive Controls State
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('medical_forced_offline') === 'true';
    }
    return false;
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Notifications toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [criticalVitalsSound, setCriticalVitalsSound] = useState(true);

  // Appearance toggles
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Modals
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDataSafetyModalOpen, setIsDataSafetyModalOpen] = useState(false);
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Form inputs
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [supportMessage, setSupportMessage] = useState('');

  // Handle Backup
  const handleBackupNow = () => {
    toast('Generating encrypted local clinical snapshot...', 'info');
    setTimeout(() => {
      const backupData = {
        timestamp: new Date().toISOString(),
        user: profileData,
        settings: {
          language: selectedLanguage,
          voice: voiceAssistantEnabled,
          autoSync: autoSyncEnabled,
          offline: offlineModeEnabled,
          twoFactor: twoFactorEnabled
        },
        version: 'v2.0.0'
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Doctorian_Settings_Backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Backup file downloaded successfully!', 'success');
    }, 600);
  };

  // Handle Clear Cache
  const handleClearCache = () => {
    toast('Temporary query cache and visual assets cleared.', 'success');
  };

  // Handle Export Data
  const handleExportData = () => {
    toast('Preparing complete patient registry and system settings archive...', 'info');
    setTimeout(() => {
      const exportBlob = new Blob([JSON.stringify({
        account: profileData,
        system: {
          appVersion: 'v2.0.0',
          database: 'PostgreSQL',
          node: 'Uganda MoH National Clinical Node'
        },
        exportedAt: new Date().toISOString()
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Doctorian_Clinical_Export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Clinical data exported securely.', 'success');
    }, 600);
  };

  const handleToggleOfflineMode = () => {
    const next = !offlineModeEnabled;
    setOfflineModeEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('medical_forced_offline', next ? 'true' : 'false');
    }
    toast(next ? 'Offline Mode active (Local Cache)' : 'Live Cloud connected', 'info');
  };

  return (
    <div className="w-full doctorian-canvas text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-7 space-y-6 transition-colors duration-300">
      <main className="w-full space-y-6">

        {/* ===================================================================== */}
        {/* SCREEN 9: MOBILE-FIRST SETTINGS PROFILE & MENU STACK (image_2605a2cb) */}
        {/* ===================================================================== */}
        <section className="space-y-4">
          <div className="doctorian-thick-card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src="/portraits/akora_joseph.jpg"
                alt={profileData.name}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-cyan-400/70 shadow-[0_0_20px_rgba(0,210,255,0.35)] shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                  {profileData.name}
                </h2>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-300 mt-0.5">
                  {profileData.patientId}
                </p>
                <button
                  type="button"
                  onClick={() => handleNav('profile')}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-400 cursor-pointer"
                >
                  <Edit3 size={12} />
                  <span>Edit Profile &gt;</span>
                </button>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-500 dark:text-emerald-300 text-[11px] font-black hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified
            </span>
          </div>

          <div className="doctorian-thick-card divide-y divide-slate-200/70 dark:divide-cyan-500/20 overflow-hidden">
            {/* Row 1: Account & Security */}
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-blue-950/35 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-500 dark:text-cyan-400 flex items-center justify-center">
                  <ShieldCheck size={17} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Account &amp; Security</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {/* Row 2: Notifications */}
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-blue-950/35 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-500 dark:text-cyan-300 flex items-center justify-center">
                  <Bell size={17} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {/* Row 3: Language */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-500 dark:text-indigo-300 flex items-center justify-center">
                  <Globe size={17} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Language</span>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  toast(`Language set to ${e.target.value}`, 'success');
                }}
                className="bg-transparent text-xs font-bold text-slate-600 dark:text-cyan-300 cursor-pointer focus:outline-none text-right"
              >
                <option value="English">English &gt;</option>
                <option value="Luganda">Luganda &gt;</option>
                <option value="Swahili">Swahili &gt;</option>
                <option value="French">French &gt;</option>
              </select>
            </div>

            {/* Row 4: Appearance */}
            <button
              type="button"
              onClick={() => onToggleTheme?.()}
              className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-blue-950/35 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-500 dark:text-purple-300 flex items-center justify-center">
                  <Moon size={17} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Appearance</span>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-cyan-300 flex items-center gap-1">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'} <ChevronRight size={15} />
              </span>
            </button>

            {/* Row 5: Offline Mode */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-500 flex items-center justify-center">
                  <WifiOff size={17} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Offline Mode</span>
              </div>
              <button
                type="button"
                onClick={handleToggleOfflineMode}
                aria-label="Toggle Offline Mode"
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  offlineModeEnabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                  offlineModeEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Row 6: Connected Devices */}
            <button
              type="button"
              onClick={() => handleNav('smart_watch')}
              className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-blue-950/35 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-500 flex items-center justify-center">
                  <Watch size={17} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Connected Devices</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {/* Row 7: About Doctorian AI */}
            <button
              type="button"
              onClick={() => setIsAboutModalOpen(true)}
              className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-blue-950/35 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-500 flex items-center justify-center">
                  <Info size={17} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">About Doctorian AI</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* TOP HERO BANNER: App Settings & Tools (Matching Image 3)               */}
        {/* ===================================================================== */}
        <section className="relative w-full doctorian-thick-card overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white min-h-[140px] sm:min-h-[150px] flex items-center justify-between p-6 sm:p-8">
          {/* Modern cyber-clinical ambient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.25),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-blue-900/60 to-transparent pointer-events-none" />

          {/* Left: 3D Gear Icon & Title */}
          <div className="relative z-10 flex items-center gap-4 max-w-xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-cyan-300 shadow-lg shrink-0">
              <SettingsIcon size={32} className="animate-spin-slow stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                App Settings & Tools
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
                Manage your application preferences and explore useful tools
              </p>
            </div>
          </div>

          {/* Right: Cursive Motto & Heart Wave */}
          <div className="relative z-10 hidden md:flex flex-col items-end text-right">
            <span className="text-lg lg:text-xl font-serif italic font-extrabold text-cyan-200 tracking-wide drop-shadow-md">
              Your Health,
            </span>
            <span className="text-lg lg:text-xl font-serif italic font-extrabold text-white tracking-wide drop-shadow-md">
              Our Priority
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-5 w-24">
                <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,10 L30,10 L38,2 L44,18 L50,6 L56,14 L62,10 L100,10" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <Heart size={16} className="text-red-400 fill-red-400 animate-pulse" />
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* ROW 1: Profile Information | Useful Tools | App Settings               */}
        {/* ===================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* 1. Profile Information (Col 3 on LG) */}
          <div className="lg:col-span-3 p-5 doctorian-thick-card flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <User size={16} className="text-blue-600 dark:text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Profile Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Profile</span>
                <ChevronRight size={12} />
              </button>
            </div>

            {/* Avatar & Badges */}
            <div className="flex flex-col items-center text-center space-y-2 py-1">
              <div className="relative w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src="/portraits/akora_joseph.jpg"
                    alt="Akora Joseph"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#09152e] flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {profileData.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {profileData.role}
                </p>
              </div>

              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-950/60 border border-blue-500/25 text-blue-600 dark:text-cyan-400 text-[10px] font-black">
                <Crown size={12} className="text-amber-500 fill-amber-500" />
                <span>Premium User</span>
              </div>
            </div>

            {/* Contact Details List */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span>{profileData.location}</span>
              </div>
            </div>
          </div>

          {/* 2. Useful Tools (Col 5 on LG - 6 colorful tool cards) */}
          <div className="lg:col-span-5 p-5 doctorian-thick-card flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/40">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Useful Tools
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Quick access to powerful features</p>
              </div>
              <button
                type="button"
                onClick={() => handleNav('home')}
                className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Tools</span>
                <ChevronRight size={12} />
              </button>
            </div>

            {/* 6 Quick Tool Cards in 2x3 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              
              {/* Tool 1: AI Assistant */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleNav('ai_nexus')}
                className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-800/60 cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">AI Assistant</h5>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Ask health questions anytime</p>
                </div>
                <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-black flex items-center justify-end">
                  <span>→</span>
                </div>
              </motion.div>

              {/* Tool 2: Lab Analyzer */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleNav('diagnostic_lab')}
                className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/30 border border-purple-200/80 dark:border-purple-800/60 cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                  <FlaskConical size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Lab Analyzer</h5>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Analyze lab results</p>
                </div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-black flex items-center justify-end">
                  <span>→</span>
                </div>
              </motion.div>

              {/* Tool 3: Telemedicine */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleNav('telemedicine')}
                className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <Video size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Telemedicine</h5>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Talk to a doctor online</p>
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-end">
                  <span>→</span>
                </div>
              </motion.div>

              {/* Tool 4: Image Analysis */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleNav('illustrator')}
                className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60 cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/30">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Image Analysis</h5>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Analyze medical images</p>
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-black flex items-center justify-end">
                  <span>→</span>
                </div>
              </motion.div>

              {/* Tool 5: Health Monitor */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleNav('vitality')}
                className="p-3 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/30 border border-cyan-200/80 dark:border-cyan-800/60 cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/30">
                  <Activity size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Health Monitor</h5>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Track your health data</p>
                </div>
                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-black flex items-center justify-end">
                  <span>→</span>
                </div>
              </motion.div>

              {/* Tool 6: Health Robot */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleNav('biomatic')}
                className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/30 border border-indigo-200/80 dark:border-indigo-800/60 cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Bot size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Health Robot</h5>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Control your robot</p>
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-end">
                  <span>→</span>
                </div>
              </motion.div>

            </div>
          </div>

          {/* 3. App Settings (Col 4 on LG - Interactive Toggles) */}
          <div className="lg:col-span-4 p-5 doctorian-thick-card flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/40">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    App Settings
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Customize your Doctorian experience</p>
                </div>
              </div>

              {/* Tabs: General | Notifications | Appearance | Privacy */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mt-3 text-[11px] font-bold">
                {(['general', 'notifications', 'appearance', 'privacy'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`py-1.5 rounded-xl capitalize transition-all cursor-pointer text-center ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-sm font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-3 pt-1 text-xs">
              {activeTab === 'general' && (
                <>
                  {/* Language Selector */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Globe size={15} className="text-blue-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">Language</span>
                    </div>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        toast(`Language changed to ${e.target.value}`, 'success');
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer focus:outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Luganda">Luganda</option>
                      <option value="Swahili">Swahili</option>
                      <option value="French">French</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                  </div>

                  {/* Voice Assistant Switch */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Mic size={15} className="text-indigo-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">Voice Assistant</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceAssistantEnabled(!voiceAssistantEnabled);
                        toast(!voiceAssistantEnabled ? 'Voice Assistant Enabled' : 'Voice Assistant Disabled', 'info');
                      }}
                      className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                        voiceAssistantEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                        voiceAssistantEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Auto Sync Data Switch */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <RefreshCw size={15} className="text-emerald-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">Auto Sync Data</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoSyncEnabled(!autoSyncEnabled);
                        toast(!autoSyncEnabled ? 'Auto Sync Activated' : 'Auto Sync Paused', 'info');
                      }}
                      className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                        autoSyncEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                        autoSyncEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Offline Mode Switch */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <WifiOff size={15} className="text-amber-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">Offline Mode</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOfflineModeEnabled(!offlineModeEnabled);
                        toast(!offlineModeEnabled ? 'Offline Mode active (Local Cache)' : 'Live Cloud connected', 'info');
                      }}
                      className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                        offlineModeEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                        offlineModeEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Data Backup & Clear Cache Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-blue-900/40">
                    <button
                      type="button"
                      onClick={handleBackupNow}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-600/30"
                    >
                      <Cloud size={14} />
                      <span>Backup Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearCache}
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} className="text-slate-400" />
                      <span>Clear Cache</span>
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Email Alerts</span>
                    <button
                      type="button"
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${emailAlerts ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${emailAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">SMS Alerts</span>
                    <button
                      type="button"
                      onClick={() => setSmsAlerts(!smsAlerts)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${smsAlerts ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${smsAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Critical Vitals Sound</span>
                    <button
                      type="button"
                      onClick={() => setCriticalVitalsSound(!criticalVitalsSound)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${criticalVitalsSound ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${criticalVitalsSound ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">High Contrast Text</span>
                    <button
                      type="button"
                      onClick={() => setHighContrast(!highContrast)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${highContrast ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${highContrast ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Reduced Motion</span>
                    <button
                      type="button"
                      onClick={() => setReducedMotion(!reducedMotion)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${reducedMotion ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${reducedMotion ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Your data is strictly encrypted using AES-256 GCM on local nodes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200"
                  >
                    View Privacy Safeguards →
                  </button>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* ===================================================================== */}
        {/* ROW 2: Quick Stats + Your Data is Safe | Health & Privacy | System Info | Need Help */}
        {/* ===================================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Col 1 (Col 3 on LG): Quick Stats + Your Data is Safe card stacked */}
          <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
            
            {/* Quick Stats */}
            <div className="p-4 doctorian-thick-card space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Quick Stats</h4>
                <button type="button" onClick={() => handleNav('records')} className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline">
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* 12 Patients */}
                <div 
                  onClick={() => handleNav('records')}
                  className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-center cursor-pointer hover:shadow-xs transition-shadow"
                >
                  <div className="w-7 h-7 mx-auto rounded-lg bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-1">
                    <Stethoscope size={14} />
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">12</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Patients</div>
                </div>

                {/* 8 Appointments */}
                <div 
                  onClick={() => handleNav('clinical_roadmap')}
                  className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-center cursor-pointer hover:shadow-xs transition-shadow"
                >
                  <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                    <Calendar size={14} />
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">8</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Appts</div>
                </div>

                {/* 5 Alerts */}
                <div 
                  onClick={() => toast('5 Pending Medical Alerts in Clinical Queue', 'info')}
                  className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 text-center cursor-pointer hover:shadow-xs transition-shadow"
                >
                  <div className="w-7 h-7 mx-auto rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
                    <Bell size={14} />
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">5</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Alerts</div>
                </div>
              </div>
            </div>

            {/* Your Data is Safe Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c2247] via-[#091b38] to-[#040e1f] text-white border border-blue-800/60 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-3 min-h-[140px]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Your Data is Safe</h4>
              </div>

              <p className="text-[11px] text-blue-200 leading-snug">
                We use advanced security to protect your health data.
              </p>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsDataSafetyModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm shadow-emerald-500/30"
                >
                  <span>Learn More</span>
                  <ChevronRight size={12} />
                </button>

                <div className="text-cyan-400 text-2xl drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                  🔒
                </div>
              </div>
            </div>

          </div>

          {/* Col 2 (Col 3 on LG): Health & Privacy */}
          <div className="lg:col-span-3 p-5 doctorian-thick-card flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-blue-900/40">
              <ShieldCheck size={16} className="text-blue-600 dark:text-cyan-400" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Health & Privacy
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Manage your data and security</p>
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-blue-900/30">
              
              {/* Change Password */}
              <div 
                onClick={() => setIsChangePasswordOpen(true)}
                className="pt-2 flex items-center justify-between cursor-pointer hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-slate-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">Change Password</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              {/* Two-Factor Authentication */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-emerald-500" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">Two-Factor Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase">
                    {twoFactorEnabled ? 'Enabled' : 'Off'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      toast(!twoFactorEnabled ? '2FA Enabled with Authenticator App' : '2FA Temporarily Disabled', 'info');
                    }}
                    className={`w-8 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      twoFactorEnabled ? 'translate-x-3' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Data Privacy Settings */}
              <div 
                onClick={() => setIsPrivacyModalOpen(true)}
                className="pt-2 flex items-center justify-between cursor-pointer hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-slate-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">Data Privacy Settings</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              {/* Export My Data */}
              <div 
                onClick={handleExportData}
                className="pt-2 flex items-center justify-between cursor-pointer hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download size={14} className="text-slate-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">Export My Data</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              {/* Delete My Account */}
              <div 
                onClick={() => setIsDeleteModalOpen(true)}
                className="pt-2 flex items-center justify-between cursor-pointer text-rose-500 hover:text-rose-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Trash2 size={14} className="text-rose-500" />
                  <span className="font-bold">Delete My Account</span>
                </div>
                <ChevronRight size={14} className="text-rose-400" />
              </div>

            </div>
          </div>

          {/* Col 3 (Col 3 on LG): System Information with 3D Laptop Display */}
          <div className="lg:col-span-3 p-5 doctorian-thick-card flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-blue-600 dark:text-cyan-400" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    System Information
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">App and device details</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>

            {/* Spec Details */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">App Version</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">v2.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Build Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Oct 30, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Database</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">AI Provider</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">LM Studio (Local)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Device</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Windows 11 (64-bit)</span>
              </div>
            </div>

            {/* 3D Laptop Graphic Display */}
            <div className="pt-2 flex items-center justify-center">
              <div className="relative w-28 h-20 bg-slate-800 rounded-t-lg border-2 border-slate-600 flex flex-col items-center justify-center shadow-lg">
                <div className="w-24 h-14 bg-gradient-to-tr from-blue-900 to-cyan-900 rounded flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/20 border border-cyan-400/40 p-0.5 flex items-center justify-center">
                    <img src="/doctorian-logo.png" alt="Doctorian AI" className="w-full h-full object-contain rounded-md" />
                  </div>
                </div>
                {/* Keyboard base */}
                <div className="absolute -bottom-2 w-32 h-2.5 bg-slate-700 rounded-b-lg border-t border-slate-500 shadow-md" />
              </div>
            </div>
          </div>

          {/* Col 4 (Col 3 on LG): Need Help? */}
          <div className="lg:col-span-3 p-5 rounded-3xl bg-white dark:bg-[#09152e] border border-slate-200/90 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-blue-900/40">
              <HelpCircle size={16} className="text-blue-600 dark:text-cyan-400" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Need Help?
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Get support and more help</p>
              </div>
            </div>

            {/* 3 Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsContactSupportOpen(true)}
                className="w-full py-2.5 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Mail size={14} />
                <span>Contact Support</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('help')}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-[#0c1a36] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <BookOpen size={14} />
                <span>View Help Center</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('about')}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-[#0c1a36] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Info size={14} />
                <span>About Doctorian AI</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-semibold pt-1">
              Together for a healthier community ❤️
            </p>
          </div>

        </section>

      </main>

      {/* ===================================================================== */}
      {/* MODALS: Edit Profile, Change Password, Privacy, Support, Delete       */}
      {/* ===================================================================== */}

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Edit Administrator Profile</h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProfileOpen(false);
                    toast('Profile information updated successfully!', 'success');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangePasswordOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Change Security Password</h3>
                <button onClick={() => setIsChangePasswordOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordOpen(false);
                    setPasswords({ current: '', newPass: '', confirm: '' });
                    toast('Password changed securely. Alert sent to Gmail.', 'success');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                >
                  Update Password
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Support Modal */}
      <AnimatePresence>
        {isContactSupportOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Doctorian Priority Support</h3>
                <button onClick={() => setIsContactSupportOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Direct channel to the Doctorian Clinical Systems & IT engineering desk.
              </p>

              <div>
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block mb-1">How can we assist you?</label>
                <textarea
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your inquiry, device sync issue, or clinical node query..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContactSupportOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsContactSupportOpen(false);
                    setSupportMessage('');
                    toast('Support ticket #DOC-9921 generated. Priority dispatch notified.', 'success');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                >
                  Send Inquiry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Your Data is Safe / Privacy Modal */}
      <AnimatePresence>
        {(isDataSafetyModalOpen || isPrivacyModalOpen) && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Security & Privacy Protocol</h3>
                </div>
                <button onClick={() => { setIsDataSafetyModalOpen(false); setIsPrivacyModalOpen(false); }} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                  <h5 className="font-black text-emerald-800 dark:text-emerald-300 mb-1">HIPAA & MOH Uganda Data Standards</h5>
                  <p>All clinical logs, laboratory readings, and doctor-patient consultations are encrypted in transit and at rest using AES-256 and TLS 1.3 encryption.</p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 dark:text-white">Our 4 Core Protections:</h5>
                  <ul className="space-y-1.5 list-disc pl-5">
                    <li><strong className="text-slate-800 dark:text-slate-200">Zero Cloud Leakage:</strong> Raw biometrics process locally on your clinical machine.</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">Granular Role-Based Access:</strong> Only duty physicians with verified MOH medical licenses can decrypt patient medical records.</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">Audit Trail Immutable Log:</strong> Every record access triggers an encrypted timestamped event log.</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">Immediate Data Purge:</strong> You maintain sovereign rights to download or permanently delete your telemetry records anytime.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => { setIsDataSafetyModalOpen(false); setIsPrivacyModalOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Warning Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-red-200 dark:border-red-900 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle size={24} />
                <h3 className="text-base font-black">Delete Account Confirmation</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                This action is permanent and will securely purge your local clinical logs, active duty sessions, and workstation encryption tokens.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
                >
                  Keep Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    toast('Account purge initiated. Reverting to Guest Mode.', 'error');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/30"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Doctorian AI Modal with Embedded Platform Showcase */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl doctorian-thick-card p-6 space-y-4 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Doctorian AI" className="w-9 h-9 object-contain" />
                  <div>
                    <h3 className="text-base font-black">Doctorian AI · Smart Healthcare. Better Life.</h3>
                    <p className="text-xs text-slate-500 dark:text-cyan-300">Your Complete Medical Companion in Your Pocket</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-[#03091a]">
                <img
                  src="/assets/aistudio/image_2605a2cb.png"
                  alt="Doctorian AI Multi-Screen Clinical Architecture"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 pt-1">
                <span>Founder: Akora Joseph • Patient ID: DAI-2026-1187</span>
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="doctorian-cta-btn px-5 py-2 rounded-full text-white font-black text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AppSettingsPage;
