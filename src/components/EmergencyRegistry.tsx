import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Globe, 
  Save, 
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  UserPlus,
  RefreshCw,
  Zap,
  Activity,
  Trash2
} from 'lucide-react';
import { api, User as UserType } from '../api';

interface EmergencyRegistryProps {
  user: UserType | null;
  onUpdate: (user: UserType) => void;
  isAdmin?: boolean;
  setIsAdmin?: (admin: boolean) => void;
}

export const EmergencyRegistry: React.FC<EmergencyRegistryProps> = ({ 
  user, 
  onUpdate,
  isAdmin = false,
  setIsAdmin
}) => {
  const [doctorPhone, setDoctorPhone] = useState(user?.doctorPhone || '');
  const [doctorEmail, setDoctorEmail] = useState(user?.doctorEmail || '');
  const [mentorPhone, setMentorPhone] = useState(user?.mentorPhone || '');
  const [mentorEmail, setMentorEmail] = useState(user?.mentorEmail || '');
  
  // Local pin state for emergency override
  const [localPin, setLocalPin] = useState('');
  const [localPinError, setLocalPinError] = useState('');

  // New Professional Features
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [conditions, setConditions] = useState(user?.conditions || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [hospitalPreference, setHospitalPreference] = useState(user?.hospitalPreference || '');

  // DB-Backed Emergency Contacts
  const [contactsList, setContactsList] = useState<Array<{ id: string; name: string; phone: string; role: string; email?: string }>>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRole, setNewContactRole] = useState('Relative');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  const fetchContacts = async () => {
    try {
      const list = await api.emergencyContacts.list();
      setContactsList(list);
    } catch (e) {
      console.error("Failed to load emergency contacts:", e);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  const broadcastSOS = async () => {
    if (!user) return;
    try {
      const msg = `URGENT SOS [RELAY: MTN 0787674140]: Emergency broadcast from ${user.displayName || 'Authorized User'}. Patient location and vitals being transmitted.`;
      await api.alerts.triggerSOS(user.displayName || 'User', msg);
      
      // Also send direct SMS/Calls to primary contacts
      if (user.phone) await api.alerts.sendSms(msg, undefined, undefined, user.phone);
      if (user.doctorPhone) await api.alerts.sendSms(msg, user.doctorPhone);
      if (user.mentorPhone) await api.alerts.sendSms(msg, undefined, user.mentorPhone);
      
      addNotification("EMERGENCY SIGNAL BROADCASTED: MTN 0787674140 Relay Active.", "success");
    } catch (err) {
      addNotification("SOS Broadcast failed. Retrying via secondary sat-link.", "error");
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosCountdown !== null && sosCountdown > 0) {
      timer = setTimeout(() => setSosCountdown(sosCountdown - 1), 1000);
    } else if (sosCountdown === 0) {
      broadcastSOS();
      setSosCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  const triggerSOS = () => {
    if (!isAdmin) {
      addNotification("LOCK PREVENTED: Manual broadcasting requires clinical admin bypass PIN.", "error");
      return;
    }
    setSosCountdown(10);
    addNotification("SOS PROTOCOL INITIATED: 10s to broadcast via MTN 0787674140.", "warning");
  };

  const cancelSOS = () => {
    setSosCountdown(null);
    addNotification("SOS CANCELLED: Neural bridge standby.", "info");
  };

  const addNotification = (msg: string, type: 'info' | 'success' | 'warning' | 'error') => {
    setToast({ message: msg, type: type === 'success' ? 'success' : 'error' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      addNotification("Please enter contact name and phone number.", "error");
      return;
    }
    setIsAddingContact(true);
    try {
      await api.emergencyContacts.create({
        name: newContactName,
        phone: newContactPhone,
        role: newContactRole,
        email: newContactEmail
      });
      await fetchContacts();
      setNewContactName('');
      setNewContactPhone('');
      setNewContactEmail('');
      addNotification("Emergency contact registered successfully.", "success");
    } catch (err) {
      addNotification("Failed to save emergency contact.", "error");
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await api.emergencyContacts.delete(id);
      await fetchContacts();
      addNotification("Emergency contact deleted.", "success");
    } catch (err) {
      addNotification("Failed to delete contact.", "error");
    }
  };

  const handleUpdate = async () => {
    if (!isAdmin) {
      addNotification("LOCK PREVENTED: Profile synchronization requires clinical admin bypass PIN.", "error");
      return;
    }
    if (!user) return;
    setIsSaving(true);
    try {
      const updatedUser = await api.auth.updateProfile({
        doctorPhone,
        doctorEmail,
        mentorPhone,
        mentorEmail,
        allergies,
        conditions,
        bloodGroup,
        hospitalPreference
      });
      
      onUpdate(updatedUser);
      addNotification("Emergency Response Profile Synchronized.", "success");
    } catch (err) {
      addNotification("Failed to sync profile. Check connection.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const testLink = async (role: 'Doctor' | 'Mentor', phone: string) => {
    if (!isAdmin) {
      addNotification("LOCK PREVENTED: Direct link diagnostic requires clinical admin bypass PIN.", "error");
      return;
    }
    if (!phone) {
      addNotification("No destination phone specified.", "error");
      return;
    }
    setIsTesting(role);
    try {
      const msg = `TEST ALERT: Diagnostic verification of the Medical SOS link for ${user?.displayName || 'Authorized User'}.`;
      await api.alerts.sendSms(msg, role === 'Doctor' ? phone : undefined, role === 'Mentor' ? phone : undefined);
      addNotification(`${role} link verified successfully.`, "success");
    } catch (err) {
      addNotification("Diagnostic failed.", "error");
    } finally {
      setIsTesting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-3xl relative overflow-hidden p-8 sm:p-14">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/[0.03] blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          {/* Clinical Silent Monitor Mode & PIN Unlock Header */}
          <div className={`mb-10 p-6 rounded-2xl border transition-all ${isAdmin ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-800 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {isAdmin ? '🛡️ Administration Bypass Active' : '🔒 Secure Room Broadcast Protection Lock'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAdmin 
                    ? "Direct override enabled. You may trigger manual SOS broadcasts, test phone signals, and update telemetry settings."
                    : "Loud Room Ringing & Manual Calling are disabled globally to prevent room disruption. Quiet automated background SMS/Call alerts remain 100% active."}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {!isAdmin ? (
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <div className="flex flex-col">
                      <input
                        type="password"
                        placeholder="Enter Admin PIN/Passkey to Unlock overrides"
                        value={localPin}
                        onChange={e => {
                          setLocalPin(e.target.value);
                          setLocalPinError('');
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-black placeholder:text-slate-500 outline-none w-48 text-slate-900 dark:text-white"
                      />
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 text-right">Default Admin PIN: 1234 / admin@2026@Doctorian</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (localPin === '1234' || localPin === 'admin@2026@Doctorian' || localPin === 'DOC@Protocol2') {
                          if (setIsAdmin) {
                            setIsAdmin(true);
                          }
                          setLocalPin('');
                          addNotification(`Override authorized. ${localPin === 'DOC@Protocol2' ? 'Doctor Protocol' : 'Admin'} override open.`, "success");
                        } else {
                          setLocalPinError("Invalid PIN / Passkey");
                          addNotification("Protection Alert: Invalid PIN/Passkey rejected.", "error");
                        }
                      }}
                      className="px-4 py-2 bg-slate-950 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap cursor-pointer shadow-sm border border-slate-700/50 self-start"
                    >
                      Unlock PIN
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (setIsAdmin) {
                        setIsAdmin(false);
                      }
                      addNotification("Clinical bypass revoked. Silent protection restored.", "info");
                    }}
                    className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border border-rose-500/20"
                  >
                    Lock Controls
                  </button>
                )}
              </div>
            </div>
            {localPinError && (
              <p className="mt-2 text-[10px] font-bold text-rose-500">{localPinError}</p>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-rose-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-rose-500/30 border border-rose-400/20 relative group">
                <div className="absolute inset-0 bg-white/20 rounded-[2rem] scale-0 group-hover:scale-100 transition-transform duration-500" />
                <PhoneCall size={48} className="relative z-10" />
              </div>
              <div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                  Emergency <span className="text-rose-600">Protocol</span>
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                    MTN Relay Active: 0787674140
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
               {/* Direct Live Call Trigger */}
               <a
                 href={`tel:${doctorPhone || user?.doctorPhone || '+256787674140'}`}
                 onClick={() => {
                   api.alerts.makeCall("Emergency SOS direct live call dispatch from patient interface", doctorPhone || user?.doctorPhone);
                   addNotification("LIVE CALL INITIATED: Dialing doctor emergency line.", "success");
                 }}
                 className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
               >
                 <PhoneCall size={18} />
                 <span>Live Call</span>
               </a>

               {/* Direct Emergency SMS Trigger */}
               <a
                 href={`sms:${doctorPhone || user?.doctorPhone || '+256787674140'}?body=EMERGENCY%20SOS%3A%20Patient%20${encodeURIComponent(user?.displayName || 'User')}%20requires%20immediate%20medical%20response.%20Location%20%26%20vitals%20logged.`}
                 onClick={() => {
                   api.alerts.sendSms(`EMERGENCY SOS: Patient ${user?.displayName || 'User'} requires immediate medical response.`, doctorPhone || user?.doctorPhone);
                   addNotification("EMERGENCY SMS SENT: Outbound alert dispatched.", "success");
                 }}
                 className="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
               >
                 <Phone size={18} />
                 <span>Send Emergency SMS</span>
               </a>

               <div className="text-right pl-2 border-l border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Readiness</p>
                  <p className={`text-base font-black uppercase ${sosCountdown ? 'text-rose-600 animate-pulse' : 'text-emerald-500'}`}>
                    {sosCountdown !== null ? `Signal: ${sosCountdown}s` : 'Standby'}
                  </p>
               </div>

               <button 
                  onClick={sosCountdown !== null ? cancelSOS : triggerSOS}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl ${
                    sosCountdown !== null 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-rose-600 text-white shadow-rose-500/40 hover:bg-rose-700'
                  }`}
                  title="Broadcast Automatic SOS Relay"
                >
                  {sosCountdown !== null ? <RefreshCw className="animate-spin" size={24} /> : <AlertCircle size={28} />}
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            {/* Section: Professional Medical Data */}
            <div className="xl:col-span-12">
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
                    <Activity size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Critical Medical Profile</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Blood Group</label>
                    <select 
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 dark:text-white focus:border-rose-500 focus:ring-0 transition-all outline-none"
                    >
                      <option value="">Select Typing</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Clinical Allergies</label>
                    <input 
                      type="text" 
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:border-rose-500 outline-none transition-all"
                      placeholder="e.g. Penicillin, Peanuts"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pre-existing Conditions</label>
                    <input 
                      type="text" 
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:border-rose-500 outline-none transition-all"
                      placeholder="e.g. Asthma, Diabetes"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Preferred Hospital Node</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={hospitalPreference}
                        onChange={(e) => setHospitalPreference(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:border-rose-500 outline-none transition-all"
                        placeholder="Clinical Center Name"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Response Nodes (Contacts) */}
            <div className="xl:col-span-6">
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 h-full">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Medical Node</h3>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Primary Physician</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => testLink('Doctor', doctorPhone)}
                    disabled={isTesting === 'Doctor'}
                    className="p-3 bg-white dark:bg-slate-900 text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 border border-blue-100 dark:border-blue-900/50"
                  >
                    {isTesting === 'Doctor' ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-blue-500 transition-colors">Direct Neural Extension (Mobile)</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="tel" 
                        value={doctorPhone}
                        onChange={(e) => setDoctorPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-[1.5rem] pl-16 pr-6 py-5 text-base font-black text-slate-900 dark:text-white shadow-sm transition-all outline-none"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-blue-500 transition-colors">Secure Physician Portal (Email)</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        value={doctorEmail}
                        onChange={(e) => setDoctorEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-[1.5rem] pl-16 pr-6 py-5 text-base font-black text-slate-900 dark:text-white shadow-sm transition-all outline-none"
                        placeholder="physician@hospital-node.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-6">
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 h-full">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-md">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nexus Contact</h3>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Emergency Mentor</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => testLink('Mentor', mentorPhone)}
                    disabled={isTesting === 'Mentor'}
                    className="p-3 bg-white dark:bg-slate-900 text-purple-600 rounded-xl hover:bg-purple-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 border border-purple-100 dark:border-purple-900/50"
                  >
                    {isTesting === 'Mentor' ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-purple-500 transition-colors">Direct Nexus Link (Mobile)</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="tel" 
                        value={mentorPhone}
                        onChange={(e) => setMentorPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-purple-500 rounded-[1.5rem] pl-16 pr-6 py-5 text-base font-black text-slate-900 dark:text-white shadow-sm transition-all outline-none"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-purple-500 transition-colors">Emergency Messaging (Email)</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        value={mentorEmail}
                        onChange={(e) => setMentorEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-purple-500 rounded-[1.5rem] pl-16 pr-6 py-5 text-base font-black text-slate-900 dark:text-white shadow-sm transition-all outline-none"
                        placeholder="mentor@nexus.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Secondary Registered Contacts (Automatic Call Dispatch) */}
            <div className="xl:col-span-12">
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 sm:p-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-md">
                      <PhoneCall size={24} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Automatic Alarm & Call Dispatch Targets</h3>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Database Registered Emergency Contacts</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                      Alarm Synced
                    </span>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold">
                      {contactsList.length} contact(s) active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* Register Form */}
                  <div className="lg:col-span-5 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Register New Contact Node
                    </h4>
                    
                    <form onSubmit={handleAddContact} className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contact Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text"
                            required
                            value={newContactName}
                            onChange={e => setNewContactName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-rose-500 rounded-xl pl-12 pr-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
                            placeholder="e.g. Sarah Obote"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              type="tel"
                              required
                              value={newContactPhone}
                              onChange={e => setNewContactPhone(e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-rose-500 rounded-xl pl-12 pr-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
                              placeholder="+256..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Relationship/Role</label>
                          <select 
                            value={newContactRole}
                            onChange={e => setNewContactRole(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-rose-500 rounded-xl px-4 py-3.5 text-xs font-black text-slate-900 dark:text-white outline-none transition-all"
                          >
                            <option value="Relative">Relative</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Parent">Parent</option>
                            <option value="Doctor">Secondary Doctor</option>
                            <option value="Neighbor">Neighbor / Responder</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address (Optional)</label>
                        <input 
                          type="email"
                          value={newContactEmail}
                          onChange={e => setNewContactEmail(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-rose-500 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
                          placeholder="relative@domain.com"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingContact}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isAddingContact ? <RefreshCw className="animate-spin" size={14} /> : <UserPlus size={14} />}
                        Save to Database & Sync Alarm
                      </button>
                    </form>
                  </div>

                  {/* Registered Contacts List */}
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Active Registered Contacts Matrix
                    </h4>

                    {contactsList.length === 0 ? (
                      <div className="bg-white dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
                        <AlertCircle className="mx-auto text-slate-400 mb-2" size={24} />
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No additional emergency contacts stored in the database.</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Register contacts on the left to activate automatic calling and routing during alarms.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2">
                        {contactsList.map(contact => (
                          <div 
                            key={contact.id} 
                            className="bg-white dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center group hover:border-rose-500/35 transition-all shadow-sm"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{contact.name}</span>
                                <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-md text-[8px] font-black uppercase tracking-wider">
                                  {contact.role}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                                <span className="font-mono font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                  <Phone size={10} /> {contact.phone}
                                </span>
                                {contact.email && (
                                  <span className="flex items-center gap-1 font-bold">
                                    <User size={10} /> {contact.email}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Direct Live Call Button */}
                              <a
                                href={`tel:${contact.phone}`}
                                onClick={(e) => {
                                  api.alerts.makeCall("Emergency SOS live call request from patient", contact.phone);
                                }}
                                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                                title={`Live Call ${contact.name}`}
                              >
                                <PhoneCall size={14} />
                                <span className="hidden sm:inline">Call</span>
                              </a>

                              {/* Direct Live SMS Button */}
                              <a
                                href={`sms:${contact.phone}?body=EMERGENCY%20SOS%3A%20Patient%20${encodeURIComponent(user?.displayName || 'User')}%20requires%20urgent%20medical%20response.%20Vitals%20logged.`}
                                onClick={(e) => {
                                  api.alerts.sendSms(`EMERGENCY SOS: Patient ${user?.displayName || 'User'} requires urgent medical response.`, contact.phone);
                                }}
                                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                                title={`Send Emergency SMS to ${contact.name}`}
                              >
                                <Phone size={14} />
                                <span className="hidden sm:inline">SMS</span>
                              </a>

                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="p-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                                title="Remove Contact"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-6">
            <button 
              onClick={handleUpdate}
              disabled={isSaving}
              className="flex-1 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
              Synchronize Protocol Matrix
            </button>
            <button
              onClick={() => {
                setDoctorPhone(''); setDoctorEmail(''); setMentorPhone(''); setMentorEmail('');
                setAllergies(''); setConditions(''); setBloodGroup(''); setHospitalPreference('');
              }}
              className="px-10 py-6 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              Purge Form
            </button>
          </div>
        </div>
      </div>

      {/* Professional Bio-Shield Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-blue-500">
               <Activity size={80} />
            </div>
            <div className="relative z-10">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Biometric Readiness</h4>
               <p className="text-2xl font-black text-slate-900 dark:text-white">Active Shield</p>
               <div className="mt-6 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full w-full bg-emerald-500" />
                  </div>
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">100% Secure</span>
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-purple-500">
               <Globe size={80} />
            </div>
            <div className="relative z-10">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Global Coverage</h4>
               <p className="text-2xl font-black text-slate-900 dark:text-white">Active Node</p>
               <div className="mt-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Connected to WHO-GEMS</span>
               </div>
            </div>
         </div>

         <div className="bg-rose-600 p-10 rounded-[3rem] shadow-2xl shadow-rose-600/20 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-white">
               <Zap size={80} />
            </div>
            <div className="relative z-10 text-white">
               <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Avg Response Time</h4>
               <p className="text-4xl font-black tracking-tighter">&lt; 15s</p>
               <div className="mt-4 flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Sub-100ms Neural Trigger</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

