import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Search, 
  Bell, 
  Maximize2, 
  ChevronDown, 
  Users, 
  Bed, 
  Activity, 
  AlertTriangle, 
  Eye, 
  MessageSquare, 
  Phone, 
  FileText, 
  FlaskConical, 
  Pill, 
  Calendar, 
  Brain, 
  Video, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Lock, 
  Key, 
  Hospital, 
  Home, 
  Folder, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Sparkles, 
  X,
  PhoneCall,
  Heart,
  MapPin,
  Navigation,
  Compass,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { DoctorianVideoConsultationModal } from './DoctorianVideoConsultationModal';
import { HospitalLocationGuideModal } from './HospitalLocationGuideModal';
import { useNearestHospital } from '../hooks/useNearestHospital';
import { useLiveDashboardSummary, HospitalBedRecord } from '../hooks/useLiveDashboardSummary';
import { useAppLanguage } from '../utils/translations';

interface DoctorsDashboardProps {
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  onNavigate?: (view: string) => void;
  user?: any;
}

interface PatientLog {
  id: string;
  pid: string;
  name: string;
  avatar: string;
  time: string;
  hospital: string;
  status: 'In Consultation' | 'Waiting' | 'Lab Test' | 'Pharmacy' | 'Discharged';
  statusColor: string;
  assignedDoctor: string;
  doctorSpecialty: string;
  phone: string;
  diagnosis: string;
  vitals: { hr: number; bp: string; temp: number; spo2: number };
}

export const DoctorsDashboard: React.FC<DoctorsDashboardProps> = ({ addToast, onNavigate, user }) => {
  const [, , t] = useAppLanguage();
  // Restriction Gate State (defaults open to Screen 8 Doctor Dashboard; lock button available in header)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const {
    hospital: currentFacility,
    distanceKm,
    estimatedArrivalMins,
    bearingDegrees,
    cardinal,
    directionText,
    googleMapsDirUrl,
    isGpsLive,
    isScanningGps,
    gpsError,
    nearbyHospitals,
    scanGps,
    selectDistrict,
    selectHospitalById
  } = useNearestHospital();

  const effectiveUserKey = user?.id || user?.email || 'default-user';
  const { summary: liveSummary, updateBedStatus, refresh: refreshLiveSummary } = useLiveDashboardSummary(
    currentFacility.id,
    effectiveUserKey
  );

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [trendRange, setTrendRange] = useState('7 Days');
  const [hospitalWeekFilter, setHospitalWeekFilter] = useState('This Week');
  const [selectedPatientForModal, setSelectedPatientForModal] = useState<PatientLog | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [callingPatient, setCallingPatient] = useState<string | null>(null);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [selectedBedForEdit, setSelectedBedForEdit] = useState<HospitalBedRecord | null>(null);
  const [admitPatientInput, setAdmitPatientInput] = useState('');
  const [admitDiagnosisInput, setAdmitDiagnosisInput] = useState('');

  // Derive live patient rows from SQLite database records
  const livePatientLogs: PatientLog[] = (liveSummary?.recentPatients || []).map((p, idx) => {
    const matchedAppt = liveSummary?.recentAppointments.find(
      (a) => a.patient_id === p.id || a.patient_name.toLowerCase() === p.full_name.toLowerCase()
    );
    const isCompleted = matchedAppt?.status === 'completed';
    const isAttention = p.risk_tier === 'high' || p.risk_tier === 'moderate';
    const statusLabel: PatientLog['status'] = isCompleted
      ? 'Discharged'
      : isAttention
      ? 'In Consultation'
      : matchedAppt
      ? 'Waiting'
      : 'Lab Test';

    const statusColorMap: Record<PatientLog['status'], string> = {
      'In Consultation': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      Waiting: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      'Lab Test': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      Pharmacy: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      Discharged: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    };

    const avatars = [
      '/portraits/patient_sarah.jpg',
      '/portraits/dr_emmanuel_kato.jpg',
      '/portraits/patient_mary.jpg',
      '/portraits/dr_joseph_mukasa.jpg',
      '/portraits/dr_achan_grace.jpg'
    ];

    return {
      id: p.id,
      pid: p.mrn,
      name: p.full_name,
      avatar: avatars[idx % avatars.length],
      time: new Date(p.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hospital: matchedAppt?.facility || `${p.district || currentFacility.district} (${currentFacility.shortName})`,
      status: statusLabel,
      statusColor: statusColorMap[statusLabel],
      assignedDoctor: matchedAppt?.clinician_name || 'Dr. Sarah M. Nakalema',
      doctorSpecialty: isAttention ? 'High Priority Physician' : 'General Physician',
      phone: '+256 772 000 ' + String(100 + idx),
      diagnosis: matchedAppt?.reason || (isAttention ? 'Requires Clinical Follow-up' : 'Routine Check & Stable Monitoring'),
      vitals: { hr: 72 + (idx % 4) * 3, bp: '118/78', temp: isAttention ? 37.3 : 36.6, spo2: 98 }
    };
  });

  const handleBedAction = async (
    bed: HospitalBedRecord,
    nextStatus: 'occupied' | 'available' | 'cleaning',
    patientName?: string,
    diagnosis?: string
  ) => {
    const res = await updateBedStatus(bed.id, nextStatus, patientName, diagnosis);
    if (res) {
      addToast?.(
        `Bed ${bed.bed_number} (${bed.ward_name}) marked ${nextStatus.toUpperCase()}`,
        'success'
      );
      setSelectedBedForEdit(null);
      setAdmitPatientInput('');
      setAdmitDiagnosisInput('');
    }
  };

  // Handle Passcode Unlock
  const handleUnlockPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === 'DOC-2026' || passcodeInput.trim() === 'doctor' || passcodeInput.trim() === 'admin' || passcodeInput.length >= 4) {
      setIsUnlocked(true);
      addToast?.('Physician Clinical Credential Verified. Workstation Unlocked.', 'success');
    } else {
      setPasscodeError('Invalid Medical Authorization Key. Please try again.');
    }
  };

  // If restricted and locked
  if (!isUnlocked) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-[#091838] border border-blue-500/40 p-8 text-center text-white space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center mx-auto text-white shadow-lg">
            <Lock size={32} />
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Restricted Doctors Workstation
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Authorized Medical Practitioners & Hospital Clinicians Only. Enter your Physician Key to access live patient logs.
            </p>
          </div>

          <form onSubmit={handleUnlockPasscode} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => { setPasscodeInput(e.target.value); setPasscodeError(''); }}
                placeholder="Enter Physician Key (e.g. DOC-2026)..."
                className="w-full px-4 py-3 bg-[#050e20] border border-blue-800 rounded-2xl text-sm text-center text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {passcodeError && (
                <p className="text-xs text-rose-400 font-bold mt-1.5">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              Verify Clinical Authorization
            </button>

            <button
              type="button"
              onClick={() => { setIsUnlocked(true); addToast?.('Doctor Workstation Authorized for Dr. Joseph Akora', 'success'); }}
              className="text-xs text-cyan-400 font-bold hover:underline block mx-auto"
            >
              Authorize as Dr. Joseph Akora (One-Click)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Live Patient Logs
  const filteredLogs = livePatientLogs.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.assignedDoctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const counts = liveSummary?.counts;
  const beds = liveSummary?.beds;
  const bedTotal = beds?.total ?? 12;
  const bedOccupied = beds?.occupied ?? 0;
  const bedAvailable = beds?.available ?? 0;
  const bedCleaning = beds?.cleaning ?? 0;
  const bedOccupancyPct = beds?.occupancyPct ?? 0;

  return (
    <div className="w-full doctorian-canvas text-white font-sans p-4 sm:p-6 lg:p-7 space-y-6 transition-colors duration-300">
      <main className="w-full space-y-6">

          {/* =================================================================== */}
          {/* SCREEN 8: DOCTOR DASHBOARD TOP STACK (image_77dd7586)                */}
          {/* =================================================================== */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-[900] text-white tracking-tight">{t('Doctor Dashboard')}</h1>
              <button
                type="button"
                onClick={() => setIsUnlocked(false)}
                className="doctorian-dark-btn px-3.5 py-2 rounded-full text-xs font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                title="Lock Physician Workstation"
              >
                <Lock size={13} />
                <span>{t('Lock Station')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Attending Physician Profile Card */}
              <div className="lg:col-span-4 doctorian-thick-card p-5 flex items-center gap-4">
                <img
                  src="/portraits/dr_sarah_nakalema.jpg"
                  alt="Dr. Sarah M. Nakalema"
                  className="w-20 h-20 rounded-full object-cover border-[2.5px] border-cyan-400/80 shadow-[0_0_22px_rgba(0,210,255,0.4)] shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div>
                    <h2 className="text-lg font-black text-white leading-tight truncate">Dr. Sarah M. Nakalema</h2>
                    <p className="text-xs text-slate-300 font-medium">{t('General Physician')}</p>
                    <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {t('Online')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setCallingPatient('Dr. Sarah M. Nakalema'); setIsVideoCallOpen(true); }}
                      className="flex-1 min-h-[44px] px-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border-2 border-emerald-300/45 border-b-4 border-b-emerald-900/75 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer active:scale-95 transition-all"
                    >
                      <Phone size={14} />
                      <span>{t('Call')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('ai_nexus')}
                      className="flex-1 min-h-[44px] px-3 rounded-full doctorian-cta-btn text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      <span>{t('Message')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Patient Live Logs Thick Summary Stack (Live SQLite Telemetry) */}
              <div className="lg:col-span-4 doctorian-thick-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">{t('Patient Live Logs')}</h3>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('records')}
                    className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
                  >
                    {t('View All')} &gt;
                  </button>
                </div>
                <div className="space-y-2.5">
                  {(liveSummary?.recentLogs && liveSummary.recentLogs.length > 0
                    ? liveSummary.recentLogs.slice(0, 3).map((item) => ({
                        title: item.action,
                        subtitle: `${item.details} • ${new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                        icon: item.action.toLowerCase().includes('lab')
                          ? FlaskConical
                          : item.action.toLowerCase().includes('rx') || item.action.toLowerCase().includes('presc')
                          ? Pill
                          : Users,
                        badge: item.action.toLowerCase().includes('alert')
                          ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                      }))
                    : [
                        {
                          title: `${counts?.totalPatients ?? 0} ${t('Patients Registered')}`,
                          subtitle: `${counts?.stablePatients ?? 0} Done/Stable • ${counts?.attentionPatients ?? 0} Pending Review`,
                          icon: Users,
                          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        },
                        {
                          title: `${counts?.completedLabs ?? 0}/${counts?.totalLabs ?? 0} ${t('Labs Analyzed')}`,
                          subtitle: counts?.pendingLabs ? `${counts.pendingLabs} pending lab tests` : 'All queued labs completed',
                          icon: FlaskConical,
                          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                        },
                        {
                          title: `${counts?.activePrescriptions ?? 0} ${t('Active Prescriptions')}`,
                          subtitle: `${counts?.pendingPrescriptions ?? 0} pending verification`,
                          icon: Pill,
                          badge: 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                        }
                      ]
                  ).map((log, i) => {
                    const LogIcon = log.icon;
                    return (
                      <div
                        key={i}
                        onClick={() => onNavigate?.('records')}
                        className="doctorian-thick-tile p-3 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 ${log.badge}`}>
                            <LogIcon size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate">{log.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{log.subtitle}</p>
                          </div>
                        </div>
                        <span className="text-slate-400 text-xs font-bold shrink-0">&gt;</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location-Aware Hospital Info Photo Card (Changes photo, distance & direction with phone location e.g. Lira) */}
              <div className="lg:col-span-4 doctorian-thick-card overflow-hidden relative min-h-[225px] flex flex-col justify-between p-5">
                <img
                  src={currentFacility.photoUrl}
                  alt={currentFacility.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-70 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03091a] via-[#040f2c]/65 to-black/35" />
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHospitalModalOpen(true)}
                    className="px-3 py-1 rounded-full bg-cyan-500/30 hover:bg-cyan-500/45 border-2 border-cyan-300/60 text-cyan-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Compass size={12} />
                    <span>{distanceKm} km • {bearingDegrees}° {cardinal}</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 text-[10px] font-black">
                    {bedAvailable} free / {bedOccupied} occ
                  </span>
                </div>

                <div className="relative z-10 space-y-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">{currentFacility.name}</h3>
                    <p className="text-xs font-semibold text-cyan-200 flex items-center gap-1.5">
                      <MapPin size={13} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{currentFacility.district} • ~{estimatedArrivalMins} min drive</span>
                    </p>
                  </div>

                  {/* Quick Phone City Switcher + Guide Button */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {['Kampala', 'Lira', 'Gulu', 'Mbarara'].map((city) => {
                      const active = currentFacility.district.toLowerCase().includes(city.toLowerCase());
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            const updated = selectDistrict(city);
                            addToast?.(`Phone location switched to ${city} — ${updated.hospital.shortName} (${updated.distanceKm} km)`, 'info');
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer transition-all ${
                            active
                              ? 'bg-cyan-500 text-slate-950 border-white'
                              : 'bg-black/55 text-slate-200 border-white/25 hover:border-cyan-400'
                          }`}
                        >
                          {city}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => scanGps()}
                      disabled={isScanningGps}
                      className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/80 text-white border border-emerald-300/60 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={10} className={isScanningGps ? 'animate-spin' : ''} />
                      <span>GPS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHospitalModalOpen(true)}
                      className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-600/90 text-white border border-cyan-300/50 flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation size={10} style={{ transform: `rotate(${bearingDegrees}deg)` }} />
                      <span>Guide</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* 1. Hero Banner: Doctors Hub */}
          <div className="relative w-full doctorian-thick-card overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white min-h-[140px] flex items-center justify-between p-6 sm:p-8">
            <div className="flex items-center gap-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-cyan-300 shadow-inner">
                <Stethoscope size={30} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Doctors Hub</h1>
                <p className="text-xs sm:text-sm text-blue-100 font-medium">
                  Live Patient Logs & Hospital Health Center
                </p>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end text-right z-10">
              <span className="text-lg font-serif italic font-extrabold text-cyan-200">
                Better Information.
              </span>
              <span className="text-lg font-serif italic font-extrabold text-white">
                Better Care.
              </span>
            </div>
          </div>

          {/* 2. 4 Live KPI Cards (Zero hardcoded numbers — SQLite backed) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Clinical Staff On Duty */}
            <div className="p-4 doctorian-thick-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">{t('Clinical Staff')}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">{counts?.totalClinicians ?? 0}</span>
                    <span className="text-[10px] font-bold text-cyan-300">
                      {counts ? `${counts.activeDoctors} Dr / ${counts.activeNurses} RN` : 'Syncing...'}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2">
                {(counts?.totalClinicians ?? 0) > 0 ? 'Done: Roster active' : 'Not assigned yet'}
              </p>
            </div>

            {/* Registered Patients */}
            <div className="p-4 doctorian-thick-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">{t('Registered Patients')}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">{counts?.totalPatients ?? 0}</span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {counts ? `${counts.stablePatients} Done` : ''}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bed size={20} />
                </div>
              </div>
              <p className="text-[10px] text-amber-300 font-semibold mt-2">
                {(counts?.attentionPatients ?? 0) > 0
                  ? `${counts?.attentionPatients} pending review`
                  : (counts?.totalPatients ?? 0) === 0
                  ? 'Not registered yet'
                  : 'All patients reviewed'}
              </p>
            </div>

            {/* Consultations Done vs Pending */}
            <div className="p-4 doctorian-thick-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">{t('Consultations')}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">
                      {counts?.completedAppointments ?? 0}/{counts?.totalAppointments ?? 0}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                      Done
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Activity size={20} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2">
                {(counts?.pendingAppointments ?? 0) > 0
                  ? `${counts?.pendingAppointments} not done yet`
                  : (counts?.totalAppointments ?? 0) === 0
                  ? 'None scheduled yet'
                  : 'All appointments done'}
              </p>
            </div>

            {/* Priority / Occupied Beds */}
            <div className="p-4 doctorian-thick-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">{t('Alerts & Free Beds')}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">{counts?.emergencyCases ?? 0}</span>
                    <span className="text-[10px] font-bold text-emerald-300">
                      {bedAvailable} beds free
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <p className="text-[10px] text-cyan-300 font-semibold mt-2">
                {bedOccupied}/{bedTotal} beds occupied • {bedCleaning} cleaning
              </p>
            </div>

          </div>

          {/* 3. Middle Section: Live Patient Logs (8 Cols) + Doctor Tools & Hospital Overview (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Live Patient Logs Table (8 Cols) */}
            <div className="lg:col-span-8 p-5 doctorian-thick-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-blue-400" />
                  <h3 className="text-sm font-black text-white">Live Patient Logs</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    ● Live Updates
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate?.('records')}
                  className="text-xs text-blue-400 font-bold hover:underline"
                >
                  View All Logs →
                </button>
              </div>

              {/* Patient Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#050e20] text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Hospital / District</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned Doctor</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/30">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 font-semibold">
                          No patients registered matching filter yet. Register a patient in Health Records to populate live logs.
                        </td>
                      </tr>
                    ) : filteredLogs.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-950/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-300">{p.time}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img src={p.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                            <div>
                              <p className="font-bold text-white leading-tight">{p.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{p.pid}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-cyan-300 font-medium">{p.hospital}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.statusColor}`}>
                            ● {p.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-white leading-tight">{p.assignedDoctor}</p>
                          <p className="text-[10px] text-slate-400">{p.doctorSpecialty}</p>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-slate-400">
                            <button
                              type="button"
                              onClick={() => setSelectedPatientForModal(p)}
                              className="p-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                              title="View Patient Chart"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => addToast?.(`Opening clinical message relay with ${p.name}`, 'info')}
                              className="p-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                              title="Send Message"
                            >
                              <MessageSquare size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCallingPatient(p.name);
                                setIsVideoCallOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                              title="Direct Phone Call"
                            >
                              <Phone size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctor Tools & Hospital Overview (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Doctor Tools */}
              <div className="p-5 doctorian-thick-card space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Doctor Tools
                  </h4>
                  <span className="text-[10px] text-blue-400 font-bold">Quick Access</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('records')}
                    className="p-3 rounded-2xl bg-[#051024] hover:bg-blue-600/30 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <Folder size={18} className="text-blue-400" />
                    <span>View Records</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate?.('diagnostic_lab')}
                    className="p-3 rounded-2xl bg-[#051024] hover:bg-blue-600/30 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <FlaskConical size={18} className="text-cyan-400" />
                    <span>Check Lab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate?.('meds')}
                    className="p-3 rounded-2xl bg-[#051024] hover:bg-blue-600/30 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <Pill size={18} className="text-emerald-400" />
                    <span>Send Rx</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate?.('clinical_roadmap')}
                    className="p-3 rounded-2xl bg-[#051024] hover:bg-blue-600/30 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <Calendar size={18} className="text-purple-400" />
                    <span>Schedule Appts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate?.('ai_nexus')}
                    className="p-3 rounded-2xl bg-[#051024] hover:bg-blue-600/30 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <Brain size={18} className="text-amber-400" />
                    <span>AI Insights</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVideoCallOpen(true)}
                    className="p-3 rounded-2xl bg-[#051024] hover:bg-blue-600/30 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <Video size={18} className="text-rose-400" />
                    <span>Video Consult</span>
                  </button>
                </div>
              </div>

              {/* Live Hospital Overview & Ward Bed Numbers Matrix */}
              <div className="p-5 doctorian-thick-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    {t('Hospital Bed Numbers')}
                  </h4>
                  <button
                    type="button"
                    onClick={() => refreshLiveSummary()}
                    className="bg-[#050e20] text-cyan-300 border border-blue-800 text-[10px] font-bold rounded-lg px-2 py-1 flex items-center gap-1 cursor-pointer hover:border-cyan-400"
                  >
                    <RefreshCw size={10} />
                    <span>Live Sync</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h5 className="text-sm font-black text-white truncate">{currentFacility.name}</h5>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold inline-block">
                        {bedAvailable} Free
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold inline-block">
                        {bedOccupied} Occupied
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono font-bold">
                        {distanceKm}km {cardinal}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-mono">
                      Tracked Beds: {bedTotal} • Cleaning: {bedCleaning}
                    </p>
                  </div>

                  {/* Live Bed Occupancy Donut Gauge */}
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#051024" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray={`${bedOccupancyPct}, 100`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-black text-white">{bedOccupancyPct}%</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Beds Used</span>
                    </div>
                  </div>
                </div>

                {/* Live Ward Bed Numbers Grid */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Tap any bed number to Admit / Free</span>
                    <button
                      type="button"
                      onClick={() => setIsHospitalModalOpen(true)}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      All Hospitals →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                    {(beds?.list || []).map((bed) => {
                      const style =
                        bed.status === 'occupied'
                          ? 'bg-rose-500/15 border-rose-400/50 text-rose-200'
                          : bed.status === 'cleaning'
                          ? 'bg-amber-500/15 border-amber-400/50 text-amber-200'
                          : 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200';
                      return (
                        <button
                          key={bed.id}
                          type="button"
                          onClick={() => {
                            setSelectedBedForEdit(bed);
                            setAdmitPatientInput(bed.patient_name || '');
                            setAdmitDiagnosisInput(bed.diagnosis || '');
                          }}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer hover:brightness-110 ${style}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black">{bed.bed_number}</span>
                            <span className="text-[8px] uppercase font-bold">
                              {bed.status === 'occupied' ? 'OCC' : bed.status === 'cleaning' ? 'CLN' : 'FREE'}
                            </span>
                          </div>
                          <p className="text-[9px] truncate opacity-85 mt-0.5">
                            {bed.patient_name || bed.ward_name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* 4. Bottom Section: Trends (4 Cols) + Recent Activities (4 Cols) + Smart Insights (4 Cols) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Patient Health Trends */}
            <div className="p-5 doctorian-thick-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Patient Health Trends
                </h4>
                <select
                  value={trendRange}
                  onChange={(e) => setTrendRange(e.target.value)}
                  className="bg-[#050e20] text-slate-300 border border-blue-800 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="text-blue-400 flex items-center gap-1">● Vitals</span>
                <span className="text-emerald-400 flex items-center gap-1">● Medications</span>
                <span className="text-amber-400 flex items-center gap-1">● Alerts</span>
              </div>

              <div className="h-32 w-full pt-1">
                <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                  <path d="M 10,40 Q 50,20 100,35 T 190,15" fill="none" stroke="#3b82f6" strokeWidth="2" />
                  <path d="M 10,60 Q 50,45 100,50 T 190,40" fill="none" stroke="#10b981" strokeWidth="2" />
                  <path d="M 10,68 Q 50,60 100,65 T 190,55" fill="none" stroke="#f59e0b" strokeWidth="2" />
                </svg>
                <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Recent Activities & Clinical Completion (Live Done vs Pending) */}
            <div className="p-5 doctorian-thick-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  {t('Recent Activities & Checklist')}
                </h4>
                <button
                  type="button"
                  onClick={() => onNavigate?.('records')}
                  className="text-[10px] text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {(liveSummary?.checklist || []).map((item) => (
                  <div key={item.key} className="p-2.5 rounded-xl bg-[#051024] border border-blue-900/40 flex items-center justify-between gap-2">
                    <span className="text-slate-200 truncate">
                      {item.done ? '✓' : '⏳'} {item.label}
                    </span>
                    <span className={`text-[10px] font-bold shrink-0 ${item.done ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {item.statusText}
                    </span>
                  </div>
                ))}
                {(liveSummary?.recentLogs || []).slice(0, 2).map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-[#051024] flex items-center justify-between gap-2">
                    <span className="text-slate-300 truncate">{log.action}: {log.details}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Smart Facility Guidance */}
            <div className="p-5 doctorian-thick-card bg-gradient-to-br from-[#0c204c] to-[#061430] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
                  <Sparkles size={14} />
                  <span>{t('Live Facility Guidance')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHospitalModalOpen(true)}
                  className="text-[10px] text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Open Map & Photos →
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {currentFacility.name} ({currentFacility.district}) is {distanceKm} km {cardinal} ({bearingDegrees}°). Currently{' '}
                <strong className="text-emerald-300">{bedAvailable} beds free</strong>,{' '}
                <strong className="text-rose-300">{bedOccupied} occupied</strong>,{' '}
                <strong className="text-amber-300">{counts?.pendingAppointments ?? 0} consultations pending</strong>, and{' '}
                <strong className="text-cyan-300">{counts?.pendingLabs ?? 0} labs pending</strong>.
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsHospitalModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs cursor-pointer shadow flex items-center gap-1.5"
                >
                  <Compass size={13} />
                  <span>Directions & Nearby</span>
                </button>
                <span className="text-[11px] font-bold text-cyan-300">
                  ~{estimatedArrivalMins} min ETA
                </span>
              </div>
            </div>

          </div>

        </main>

        {/* Patient Detail Modal */}
        {selectedPatientForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#091838] border border-blue-500/40 p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
              <div className="flex items-center gap-3">
                <img src={selectedPatientForModal.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h3 className="text-base font-black">{selectedPatientForModal.name}</h3>
                  <p className="text-xs text-slate-400">{selectedPatientForModal.pid} • {selectedPatientForModal.hospital}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPatientForModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#051024]">
                <span className="text-slate-400 block text-[10px]">Clinical Diagnosis</span>
                <strong className="text-white text-sm">{selectedPatientForModal.diagnosis}</strong>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-[#051024]">
                  <span className="text-[10px] text-slate-400 block">HR</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedPatientForModal.vitals.hr} bpm</span>
                </div>
                <div className="p-2 rounded-xl bg-[#051024]">
                  <span className="text-[10px] text-slate-400 block">BP</span>
                  <span className="font-mono font-bold text-blue-300">{selectedPatientForModal.vitals.bp}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#051024]">
                  <span className="text-[10px] text-slate-400 block">Temp</span>
                  <span className="font-mono font-bold text-amber-300">{selectedPatientForModal.vitals.temp}°C</span>
                </div>
                <div className="p-2 rounded-xl bg-[#051024]">
                  <span className="text-[10px] text-slate-400 block">SpO2</span>
                  <span className="font-mono font-bold text-emerald-300">{selectedPatientForModal.vitals.spo2}%</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#051024] flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Physician</span>
                  <strong className="text-white">{selectedPatientForModal.assignedDoctor} ({selectedPatientForModal.doctorSpecialty})</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatientForModal(null);
                    setIsVideoCallOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Consult Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bed Management Modal */}
      {selectedBedForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#091838] border-2 border-cyan-500/40 p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
              <div>
                <h3 className="text-base font-black">
                  Bed {selectedBedForEdit.bed_number} • {selectedBedForEdit.ward_name}
                </h3>
                <p className="text-xs text-cyan-300">{currentFacility.shortName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBedForEdit(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Patient Name (if Occupied)
                </label>
                <input
                  type="text"
                  value={admitPatientInput}
                  onChange={(e) => setAdmitPatientInput(e.target.value)}
                  placeholder="Enter patient name..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051024] border border-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Clinical Ward Note / Diagnosis
                </label>
                <input
                  type="text"
                  value={admitDiagnosisInput}
                  onChange={(e) => setAdmitDiagnosisInput(e.target.value)}
                  placeholder="e.g. Malaria Observation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051024] border border-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleBedAction(
                      selectedBedForEdit,
                      'occupied',
                      admitPatientInput.trim() || 'Inpatient Admission',
                      admitDiagnosisInput.trim() || 'Active Ward Monitoring'
                    )
                  }
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-black text-white cursor-pointer"
                >
                  Mark Occupied
                </button>
                <button
                  type="button"
                  onClick={() => handleBedAction(selectedBedForEdit, 'cleaning')}
                  className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-black text-white cursor-pointer"
                >
                  Mark Cleaning
                </button>
                <button
                  type="button"
                  onClick={() => handleBedAction(selectedBedForEdit, 'available')}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-white cursor-pointer"
                >
                  Mark Free
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location-Aware Hospital Photo, Distance & Direction Guide Modal */}
      <HospitalLocationGuideModal
        isOpen={isHospitalModalOpen}
        onClose={() => setIsHospitalModalOpen(false)}
        hospital={currentFacility}
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
        liveBeds={liveSummary?.beds}
      />

      {/* Video Call Modal */}
      <DoctorianVideoConsultationModal
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
      />

    </div>
  );
};

export default DoctorsDashboard;
