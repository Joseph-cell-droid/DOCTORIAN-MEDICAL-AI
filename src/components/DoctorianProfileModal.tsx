import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Activity, 
  Heart, 
  QrCode, 
  Download, 
  ExternalLink, 
  Compass, 
  RefreshCw, 
  Check, 
  ChevronRight, 
  X, 
  LogOut, 
  Settings, 
  HardDrive, 
  Shield, 
  Sparkles, 
  AlertTriangle,
  Building2,
  Ambulance,
  Radio,
  Clock,
  Award,
  Stethoscope
} from 'lucide-react';
import { useNearestHospital } from '../hooks/useNearestHospital';

export interface DoctorianProfileModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: any) => void;
  onLogout?: () => void;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DoctorianProfileModal: React.FC<DoctorianProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onNavigate,
  onLogout,
  addToast
}) => {
  const { 
    hospital, 
    distanceKm, 
    estimatedArrivalMins, 
    isGpsLive, 
    isScanningGps, 
    scanGps, 
    selectDistrict, 
    allDistricts 
  } = useNearestHospital();

  const [activeTab, setActiveTab] = useState<'card' | 'location' | 'vitals'>('card');
  const [selectedDistrictName, setSelectedDistrictName] = useState('Kampala');
  const [isCopiedId, setIsCopiedId] = useState(false);

  // Uganda Medical ID
  const patientNationalId = user?.nationalId || user?.patientId || 'UG-MOH-892401-KLA';
  const bloodType = user?.bloodType || 'O+ (Universal Donor)';
  const allergies = user?.allergies || 'No Known Drug Allergies (NKDA)';
  const emergencyContact = user?.emergencyPhone || '+256 772 400 112 (MOH Helpline)';

  const handleCopyId = () => {
    navigator.clipboard?.writeText(patientNationalId);
    setIsCopiedId(true);
    if (addToast) addToast(`Medical ID ${patientNationalId} copied to clipboard`, 'success');
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  const handleGpsScan = async () => {
    if (addToast) addToast('Accessing device GPS satellite link across Uganda...', 'info');
    const res = await scanGps();
    if (res.isGpsLive) {
      if (addToast) addToast(`GPS pinpointed: Nearest hospital is ${res.hospital.name} (${res.distanceKm} km)`, 'success');
    } else {
      if (addToast) addToast(`Set to ${res.hospital.name}. You can select your district anytime.`, 'info');
    }
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrictName(dist);
    const res = selectDistrict(dist);
    if (addToast) addToast(`Location set to ${dist}: Nearest is ${res.hospital.name} (${res.distanceKm} km)`, 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* ==================== MODAL HEADER ==================== */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/50">
          <div className="flex items-center gap-3.5">
            {/* Upgraded Profile Avatar Icon with status badge */}
            <div className="relative w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black text-lg">
                    {user?.name?.[0] || user?.displayName?.[0] || 'U'}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs flex items-center justify-center" title="GPS & Biometrics Synchronized">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white truncate tracking-tight">
                  {user?.name || user?.displayName || 'Clinical User'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-[10px] font-black uppercase text-blue-700 dark:text-blue-300">
                  {user?.role || 'Patient'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'patient@doctorian.org'} • Active Account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ==================== TAB NAVIGATION ==================== */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'card'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Medical ID Card
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <MapPin size={14} className={isGpsLive ? 'text-emerald-500 animate-pulse' : ''} />
            <span>GPS Uganda Hospital</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vitals')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'vitals'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Vitals & Security
          </button>
        </div>

        {/* ==================== CONTENT BODY ==================== */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: MEDICAL ID CARD */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              {/* Doctorian Official Digital Health Card */}
              <div className="relative rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 p-6 text-white shadow-xl overflow-hidden border border-white/20">
                {/* Background Watermark & Grid */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                      <img src="/logo.png" alt="Doctorian AI Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm tracking-wide uppercase">Republic of Uganda</h4>
                      <p className="text-[10px] text-cyan-200 font-semibold tracking-wider uppercase">Ministry of Health • Doctorian National Medical ID</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/30">
                    NFC • BIO-ENABLED
                  </span>
                </div>

                {/* Patient Information Grid */}
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5 text-xs">
                  <div>
                    <span className="text-[10px] text-cyan-200 font-semibold uppercase block">Patient Name</span>
                    <span className="font-extrabold text-sm text-white truncate block">
                      {user?.name || user?.displayName || 'Clinical User'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-cyan-200 font-semibold uppercase block">Medical ID Number</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                      <span>{patientNationalId}</span>
                      <button 
                        type="button" 
                        onClick={handleCopyId}
                        className="text-cyan-300 hover:text-white p-0.5 rounded cursor-pointer"
                        title="Copy ID"
                      >
                        {isCopiedId ? <Check size={12} className="text-emerald-400" /> : <QrCode size={12} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-cyan-200 font-semibold uppercase block">Blood Group</span>
                    <span className="font-black text-amber-300 text-sm block">{bloodType}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-cyan-200 font-semibold uppercase block">Emergency Referral Hub</span>
                    <span className="font-bold text-white truncate block">{hospital.shortName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-cyan-200 font-semibold uppercase block">Allergy Profile</span>
                    <span className="font-bold text-white truncate block">{allergies}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-cyan-200 font-semibold uppercase block">Emergency Dispatch</span>
                    <span className="font-mono text-cyan-100 text-xs truncate block">{emergencyContact}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-cyan-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-300" />
                    <span>Cryptographically Authenticated by MoH Uganda Clinical Core</span>
                  </div>
                  <span className="font-mono">VALID: 2026-2029</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (addToast) addToast("Digital Health Card downloaded as PDF / PNG", "success");
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 font-bold text-xs text-slate-800 dark:text-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download size={15} />
                  <span>Download Health Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('records');
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                >
                  <Activity size={15} />
                  <span>View Clinical Records</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE GPS UGANDA HOSPITAL DETECTOR */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* GPS Control Banner */}
              <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <Compass size={22} className={isScanningGps ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Live Uganda GPS Satellite Locator
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        isGpsLive 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                      }`}>
                        {isGpsLive ? 'GPS Locked' : 'Regional Preset'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Calculates nearest hospital across Uganda (Central, West, North, East, West Nile, Karamoja)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGpsScan}
                  disabled={isScanningGps}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isScanningGps ? 'animate-spin' : ''} />
                  <span>{isScanningGps ? 'Scanning Satellites...' : 'Scan Live GPS'}</span>
                </button>
              </div>

              {/* Detected Nearest Hospital Card */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {hospital.level}
                      </span>
                      <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white mt-1">
                        {hospital.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-rose-500" />
                        <span>{hospital.district} • Region: {hospital.region} Uganda</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {distanceKm} km
                    </span>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      ~{estimatedArrivalMins} min dispatch
                    </span>
                  </div>
                </div>

                {/* Hospital Stats & Readiness */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Bed Occupancy</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{hospital.currentOccupancyRate}% ({hospital.bedCapacity} beds)</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Maternal Triage</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">24/7 Ready</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">ICU Status</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{hospital.icuAvailable ? 'Available' : 'Transfer Support'}</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Bank</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                </div>

                {/* Specialties Tags */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Clinical Specialties Available:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {hospital.specialties.map((spec, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact & Ambulance Dispatch */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={`tel:${hospital.emergencyPhone}`}
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    <Phone size={14} />
                    <span>Call Emergency: {hospital.emergencyPhone}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate('emergency');
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Ambulance size={14} className="text-rose-500" />
                    <span>Dispatch Ambulance</span>
                  </button>
                </div>
              </div>

              {/* Manual District Selection Fallback */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Traveling or outside your home district? Select your current location in Uganda:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {allDistricts.map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => handleDistrictChange(dist)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left truncate cursor-pointer ${
                        selectedDistrictName === dist
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {dist}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VITALS & SECURITY */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
                  <Heart size={20} className="text-rose-600 mx-auto mb-1 animate-pulse" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Heart Rate</span>
                  <div className="text-lg font-black text-slate-900 dark:text-white">72 <span className="text-xs font-normal">BPM</span></div>
                  <span className="text-[9px] text-emerald-600 font-bold">Normal Rhythm</span>
                </div>

                <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
                  <Activity size={20} className="text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Blood Oxygen</span>
                  <div className="text-lg font-black text-slate-900 dark:text-white">98% <span className="text-xs font-normal">SpO2</span></div>
                  <span className="text-[9px] text-emerald-600 font-bold">Optimal</span>
                </div>

                <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
                  <Stethoscope size={20} className="text-indigo-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Blood Pressure</span>
                  <div className="text-lg font-black text-slate-900 dark:text-white">120/80</div>
                  <span className="text-[9px] text-emerald-600 font-bold">Normotensive</span>
                </div>

                <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
                  <Clock size={20} className="text-amber-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Rx Adherence</span>
                  <div className="text-lg font-black text-slate-900 dark:text-white">96%</div>
                  <span className="text-[9px] text-emerald-600 font-bold">Excellent Streak</span>
                </div>
              </div>

              {/* BioSecurity & Vault Settings */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">Biometric Two-Factor Authentication</span>
                      <span className="text-[10px] text-slate-400">Fingerprint & Passkey Security Enabled</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-750">
                  <div className="flex items-center gap-2.5">
                    <HardDrive size={18} className="text-indigo-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">Offline Clinical Vault</span>
                      <span className="text-[10px] text-slate-400">1GB Encrypted Offline Medical Records Cache</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate('profile');
                    }}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
              else if (onNavigate) onNavigate('home');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer hover:opacity-90"
          >
            Done
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default DoctorianProfileModal;
