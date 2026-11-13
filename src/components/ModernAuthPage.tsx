import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  Globe,
  HeartPulse,
  KeyRound,
  Lock,
  Mail,
  Moon,
  Phone,
  Pill,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  User as UserIcon,
  UserCheck,
  WifiOff,
  X
} from 'lucide-react';
import { api, User as UserType } from '../api';
import { MedicalDisclaimer } from './common/MedicalDisclaimer';
import { LanguageCode } from '../utils/translations';
import heroClinicImg from '../assets/images/hero_uganda_telehealth_1794559827344.jpg';
import workspacePreviewImg from '../assets/images/clinical_ai_workspace_1794559828037.jpg';

export interface ModernAuthPageProps {
  onSuccess: (user: UserType, isSignUp?: boolean) => void;
  onContinueAsGuest?: () => void | Promise<void>;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  initialMode?: 'login' | 'signup' | 'none';
  currentLanguage?: LanguageCode;
  onChangeLanguage?: (lang: LanguageCode) => void;
}

type AuthModalMode = 'none' | 'signin' | 'signup' | 'recover';
type SignupRole = 'patient' | 'doctor' | 'nurse';

const SUPPORTED_LANGUAGES: LanguageCode[] = [
  'English (US)',
  'Swahili',
  'Luganda',
  'Runyankole-Rukiga',
  'Acholi-Luo',
  'Langi',
  'Iteso',
  'Lusoga'
];

const DEMO_ACCOUNTS = [
  {
    roleLabel: 'Patient Portal',
    email: 'patient@doctorian.org',
    name: 'Grace Namukasa',
    summary: 'Personal vitals, prescriptions, adherence tracking, lab results, and AI guidance.'
  },
  {
    roleLabel: 'Doctor / Clinician',
    email: 'doctor@doctorian.org',
    name: 'Dr. Sarah M. Nakitto',
    summary: 'Patient registry, prescription approval, SOAP documentation, and clinical alerts.'
  },
  {
    roleLabel: 'Nurse / Health Worker',
    email: 'nurse@doctorian.org',
    name: 'Sr. Beatrice Achieng',
    summary: 'Triage vital signs recording, patient observation logs, and referral escalations.'
  },
  {
    roleLabel: 'Hospital Administrator',
    email: 'admin@doctorian.org',
    name: 'Samuel K. Mugisha',
    summary: 'Facility operational overview, staff RBAC permissions, and audit trail review.'
  }
];

export const ModernAuthPage: React.FC<ModernAuthPageProps> = ({
  onSuccess,
  onContinueAsGuest,
  isDarkMode,
  onToggleTheme,
  initialMode = 'none',
  currentLanguage = 'English (US)',
  onChangeLanguage
}) => {
  const [modalMode, setModalMode] = useState<AuthModalMode>(
    initialMode === 'signup' ? 'signup' : initialMode === 'login' ? 'signin' : 'none'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [signupRole, setSignupRole] = useState<SignupRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'ai' | 'vitals'>('ai');

  const openAuthModal = (mode: AuthModalMode, prefillEmail?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (prefillEmail) setEmail(prefillEmail);
    setModalMode(mode);
  };

  const handleQuickDemoSignIn = async (demoEmail: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const user = await api.auth.login(demoEmail, 'Doctorian@2026!');
      onSuccess(user, false);
    } catch (err: any) {
      setEmail(demoEmail);
      setPassword('Doctorian@2026!');
      setModalMode('signin');
      setErrorMsg(err?.message || 'Unable to sign in automatically. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestExplore = async () => {
    setGuestLoading(true);
    try {
      if (onContinueAsGuest) {
        await onContinueAsGuest();
      } else {
        const guest = await api.auth.guestLogin();
        onSuccess(guest, false);
      }
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (modalMode === 'recover') {
      setLoading(true);
      try {
        const res = await api.auth.recover(trimmedEmail);
        setSuccessMsg(res.message || 'Recovery request submitted to facility administration.');
      } catch (err: any) {
        setErrorMsg(err?.message || 'Unable to process recovery request.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (modalMode === 'signup' && displayName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (modalMode === 'signup') {
        const user = await api.auth.signup(trimmedEmail, password, displayName.trim(), signupRole, phone.trim() || undefined);
        onSuccess(user, true);
      } else {
        const user = await api.auth.login(trimmedEmail, password);
        onSuccess(user, false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 flex flex-col">
      {/* Clean 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a href="#top" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2.5">
            <img src="/logo.png" alt="Doctorian AI" className="w-7 h-7 rounded-lg object-contain" />
            <span>Doctorian AI</span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#capabilities" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <a href="#clinical-preview" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0">
              Clinical Preview
            </a>
            <a href="#role-portals" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0">
              Role Portals
            </a>
            <a href="#safety-privacy" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0">
              Safety &amp; Offline
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-14 lg:pb-16">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Clinical Decision Support · Uganda &amp; East Africa
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Clinical intelligence built for safer care across hospitals, clinics, and homes.
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Doctorian AI equips patients, physicians, nurses, and health administrators with structured clinical decision support, electronic health records, remote prescriptions, lab tracking, and offline-ready facility workflows grounded in WHO and Uganda Clinical Guidelines.
              </p>

              {/* Entry Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="px-5 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Patient &amp; Clinician Sign In</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-500 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={handleGuestExplore}
                  disabled={guestLoading}
                  className="px-4 py-3 text-sm font-medium text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  {guestLoading ? 'Opening Demo...' : 'Try Guest Demo'}
                </button>
              </div>

              {/* Workspace Language & Theme Controls (placed cleanly below CTA, not in top bar) */}
              <div className="pt-3 flex flex-wrap items-center gap-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Globe size={15} className="text-slate-500" />
                  <label htmlFor="landing-language-select" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Language:
                  </label>
                  <select
                    id="landing-language-select"
                    value={currentLanguage}
                    onChange={(e) => onChangeLanguage?.(e.target.value as LanguageCode)}
                    className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors"
                >
                  {isDarkMode ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-slate-600" />}
                  <span>{isDarkMode ? 'Light Theme' : 'Dark Theme'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
                <div className="relative flex-1 min-h-[280px] bg-gradient-to-br from-teal-50 to-sky-50 dark:from-slate-800 dark:to-slate-900">
                  <img
                    src={heroClinicImg}
                    alt="Ugandan physician reviewing patient clinical tablet consultation in clinic"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover lg:min-h-[360px]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-5 text-white">
                    <p className="text-xs font-medium text-teal-200">Structured Clinical Support</p>
                    <p className="text-sm font-semibold mt-0.5">
                      Designed for Mulago, regional referral hospitals, Health Centre III/IV teams, and home follow-up.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Prominent Medical Safety Disclaimer */}
          <div className="mt-8">
            <MedicalDisclaimer variant="banner" showEmergencyNotice />
          </div>
        </section>

        {/* Interactive Clinical Assistant & Vitals Preview */}
        <section id="clinical-preview" className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">Live Interface Preview</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  Transparent AI reasoning &amp; vital sign triage
                </h2>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('ai')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activePreviewTab === 'ai'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Clinical AI Output
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('vitals')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activePreviewTab === 'vitals'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Patient Vitals Monitor
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                {activePreviewTab === 'ai' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={18} className="text-teal-600" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          Sample Clinical Decision Support Response
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">UCG 2023 · WHO</span>
                    </div>

                    <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2.5 leading-relaxed">
                      <p>
                        <strong className="text-slate-900 dark:text-white">1. Summary of Symptoms:</strong> Acute fever for 48 hours with chills and body malaise in an adult resident of Kampala.
                      </p>
                      <p>
                        <strong className="text-slate-900 dark:text-white">2. Missing History:</strong> Measured temperature, pregnancy status, recent antimalarial use, vomiting, and pallor.
                      </p>
                      <p>
                        <strong className="text-slate-900 dark:text-white">3. Possible Considerations (Not Confirmed):</strong> Uncomplicated malaria, viral respiratory illness, or enteric fever requiring laboratory verification.
                      </p>
                      <p>
                        <strong className="text-slate-900 dark:text-white">4. Recommended Investigations:</strong> Malaria RDT or blood smear, FBC, and baseline vital signs before starting treatment.
                      </p>
                      <p className="text-red-700 dark:text-red-400 font-medium">
                        <strong>5. Emergency Warning Signs:</strong> Seek immediate hospital care if confusion, persistent vomiting, dark urine, convulsions, or breathing difficulty occur.
                      </p>
                    </div>

                    <MedicalDisclaimer variant="compact" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <HeartPulse size={18} className="text-sky-600" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          Sample Vital Signs &amp; Acuity Overview (Guest Preview)
                        </span>
                      </div>
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Stable</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-500">Heart Rate</div>
                        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">76 <span className="text-xs font-normal text-slate-500">bpm</span></div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-500">Blood Pressure</div>
                        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">118/76</div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-500">SpO2</div>
                        <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">98%</div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-500">Temperature</div>
                        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">36.8°C</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Demonstrates NEWS2 / qSOFA early warning calculation and continuous Arduino or manual vitals logging. Guest mode displays sample readings only and never accesses real patient charts.
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 flex">
                <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={workspacePreviewImg}
                    alt="Doctorian clinical workstation displaying ECG waveforms and laboratory history"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover min-h-[260px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Role Entry Points */}
        <section id="role-portals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">Role-Based Access</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Dedicated clinical workflows for every care role
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Sign in directly with one of the seeded evaluation accounts below (password <span className="font-mono text-slate-800 dark:text-slate-200">Doctorian@2026!</span>) or explore safely in Guest Demo mode.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_ACCOUNTS.map((acct) => (
              <div
                key={acct.email}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">{acct.roleLabel}</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{acct.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{acct.summary}</p>
                  <div className="text-xs font-mono text-slate-500 pt-1">{acct.email}</div>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoSignIn(acct.email)}
                  className="w-full py-2.5 px-3 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 rounded-lg transition-colors"
                >
                  Enter {acct.roleLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Capabilities */}
        <section id="capabilities" className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-8">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">Core Capabilities</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                Integrated medical AI and hospital operations
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div className="md:col-span-2 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2">
                <Stethoscope size={20} className="text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">01. Guideline-Grounded Clinical AI &amp; Medical Imaging</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Structured differential support citing Uganda Clinical Guidelines (UCG 2023) and WHO protocols, alongside preliminary clinical image observation tools for radiographs, skin findings, and lab strips—never replacing specialist verification.
                </p>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2">
                <Pill size={20} className="text-sky-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">02. Smart Remote Prescriptions</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Medication schedules, dose adherence monitoring, refill alerts, and clinician approval tracking.
                </p>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2">
                <FlaskConical size={20} className="text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">03. Laboratory &amp; Vital Triage</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tracks malaria RDT, haemoglobin, urinalysis, and NEWS2 / qSOFA vital sign alerts.
                </p>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2">
                <FileText size={20} className="text-sky-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">04. Voice-to-SOAP &amp; Referrals</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Organizes consultation notes into Subjective, Objective, Assessment, and Plan records with hospital referral slips.
                </p>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2">
                <Building2 size={20} className="text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">05. Facility Administration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Staff account governance, role permissions, prescription oversight, and audit trails for health facilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security, Privacy & Offline Capability */}
        <section id="safety-privacy" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400 font-semibold text-sm">
                <ShieldCheck size={18} />
                <span>Security, Privacy &amp; Honest Governance</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Role-separated clinical data protection
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Authentication sessions use HTTP-only signed tokens, bcrypt password hashing, server-enforced role authorization, and audit logging aligned with Uganda Data Protection and Privacy Act (DPPA 2019) principles. Guest accounts are isolated from real patient records. Doctorian AI is an independent clinical decision-support platform and does not claim official regulatory certification or endorsement by WHO or the Uganda Ministry of Health.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-sky-700 dark:text-sky-400 font-semibold text-sm">
                <WifiOff size={18} />
                <span>Offline-Capable Clinical Continuity</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Built for rural clinics and intermittent connectivity
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Essential reference protocols, medication logs, and field observations persist locally in encrypted browser storage when internet connectivity drops. Once connectivity resumes, pending clinical records synchronize with conflict review so clinicians verify updates before overwriting server records.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>Doctorian AI · Clinical Decision Support &amp; Healthcare Platform · Uganda &amp; East Africa</div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => openAuthModal('signin')} className="hover:text-slate-900 dark:hover:text-white">
              Sign In
            </button>
            <button type="button" onClick={() => openAuthModal('signup')} className="hover:text-slate-900 dark:hover:text-white">
              Register
            </button>
            <button type="button" onClick={() => openAuthModal('recover')} className="hover:text-slate-900 dark:hover:text-white">
              Account Recovery
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Login / Registration / Recovery) */}
      {modalMode !== 'none' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lock size={17} className="text-teal-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {modalMode === 'signin'
                    ? 'Sign in to Doctorian AI'
                    : modalMode === 'signup'
                    ? 'Create Clinical Account'
                    : 'Account Recovery'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalMode('none')}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                aria-label="Close authentication modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {modalMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Grace Namukasa"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Account Role
                    </label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value as SignupRole)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor / Clinician</option>
                      <option value="nurse">Nurse / Health Worker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+256 7XX XXX XXX"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.org"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {modalMode !== 'recover' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl transition-colors"
              >
                {loading
                  ? 'Please wait...'
                  : modalMode === 'signin'
                  ? 'Sign In'
                  : modalMode === 'signup'
                  ? 'Create Account'
                  : 'Request Recovery'}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                {modalMode === 'signin' ? (
                  <>
                    <button type="button" onClick={() => setModalMode('signup')} className="text-teal-700 dark:text-teal-400 font-medium hover:underline">
                      Create an account
                    </button>
                    <button type="button" onClick={() => setModalMode('recover')} className="hover:underline">
                      Forgot password?
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setModalMode('signin')} className="text-teal-700 dark:text-teal-400 font-medium hover:underline">
                    Back to Sign In
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernAuthPage;
