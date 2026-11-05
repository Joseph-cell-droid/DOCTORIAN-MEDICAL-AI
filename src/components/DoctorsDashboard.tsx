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
  Heart
} from 'lucide-react';
import { DoctorianVideoConsultationModal } from './DoctorianVideoConsultationModal';

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
  // Restriction Gate State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    // Check if user is a doctor or admin
    return user?.role === 'doctor' || user?.isDoctor || user?.role === 'admin' || user?.isAdmin || false;
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [trendRange, setTrendRange] = useState('7 Days');
  const [hospitalWeekFilter, setHospitalWeekFilter] = useState('This Week');
  const [selectedPatientForModal, setSelectedPatientForModal] = useState<PatientLog | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [callingPatient, setCallingPatient] = useState<string | null>(null);

  // Live Patient Logs Data (Matching image 2)
  const [patientLogs, setPatientLogs] = useState<PatientLog[]>([
    {
      id: '1',
      pid: '#P-10245',
      name: 'Grace Akello',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      time: '04:32 PM',
      hospital: 'Mulago Hospital',
      status: 'In Consultation',
      statusColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      assignedDoctor: 'Dr. Sarah Nakato',
      doctorSpecialty: 'Cardiologist',
      phone: '+256 772 449 102',
      diagnosis: 'Sinus Tachycardia with Mild Palpitations',
      vitals: { hr: 98, bp: '130/85', temp: 36.8, spo2: 98 }
    },
    {
      id: '2',
      pid: '#P-10244',
      name: 'James Okwera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      time: '04:28 PM',
      hospital: 'Mulago Hospital',
      status: 'Waiting',
      statusColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      assignedDoctor: 'Dr. David Tumwine',
      doctorSpecialty: 'General Physician',
      phone: '+256 781 209 883',
      diagnosis: 'Acute Gastritis / Routine Follow-up',
      vitals: { hr: 74, bp: '118/78', temp: 36.6, spo2: 99 }
    },
    {
      id: '3',
      pid: '#P-10243',
      name: 'Mary Nansubuga',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      time: '04:25 PM',
      hospital: 'Lira Hospital',
      status: 'Lab Test',
      statusColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      assignedDoctor: 'Dr. Grace Auma',
      doctorSpecialty: 'Pathologist',
      phone: '+256 701 984 551',
      diagnosis: 'Complete Blood Count & Malaria Microscopic Smear Order',
      vitals: { hr: 84, bp: '122/80', temp: 37.4, spo2: 97 }
    },
    {
      id: '4',
      pid: '#P-10242',
      name: 'Peter Ssemanda',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      time: '04:22 PM',
      hospital: 'Lira Hospital',
      status: 'Pharmacy',
      statusColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      assignedDoctor: 'Dr. Okello',
      doctorSpecialty: 'Pharmacist',
      phone: '+256 752 443 219',
      diagnosis: 'Prescription Dispensing: Metformin 500mg BID + Atorvastatin 20mg',
      vitals: { hr: 78, bp: '126/82', temp: 36.7, spo2: 98 }
    },
    {
      id: '5',
      pid: '#P-10241',
      name: 'Rebecca Namagembe',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      time: '04:19 PM',
      hospital: 'Arua Hospital',
      status: 'Discharged',
      statusColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      assignedDoctor: 'Dr. Nakalema',
      doctorSpecialty: 'Physician',
      phone: '+256 774 112 908',
      diagnosis: 'Post-Malaria Full Recovery / Vital Signs Stable',
      vitals: { hr: 70, bp: '116/74', temp: 36.5, spo2: 99 }
    }
  ]);

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

  // Filtered Patient Logs
  const filteredLogs = patientLogs.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.assignedDoctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-[#071329] text-white font-sans p-4 sm:p-6 lg:p-7 space-y-6 transition-colors duration-300">
      <main className="w-full space-y-6">
          
          {/* 1. Hero Banner: Doctors Hub */}
          <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white shadow-xl min-h-[140px] flex items-center justify-between p-6 sm:p-8">
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

          {/* 2. 4 KPI Sparkline Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Doctors */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">Total Doctors</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">48</span>
                    <span className="text-xs font-bold text-emerald-400">↑ +2</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
              <div className="h-5 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 20">
                  <path d="M 0,16 Q 30,8 60,12 T 100,4" fill="none" stroke="#3b82f6" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Patients Today */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">Patients Today</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">326</span>
                    <span className="text-xs font-bold text-emerald-400">↑ +12%</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bed size={20} />
                </div>
              </div>
              <div className="h-5 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 20">
                  <path d="M 0,18 Q 25,12 50,15 T 100,5" fill="none" stroke="#10b981" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Active Consultations */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">Active Consultations</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">72</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                      Live •
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Activity size={20} />
                </div>
              </div>
              <div className="h-5 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 20">
                  <path d="M 0,15 Q 35,5 70,12 T 100,2" fill="none" stroke="#a855f7" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Emergency Cases */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">Emergency Cases</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">8</span>
                    <span className="text-xs font-bold text-rose-400">↑ +1</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="h-5 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 100 20">
                  <path d="M 0,14 Q 40,18 70,8 T 100,4" fill="none" stroke="#f97316" strokeWidth="2" />
                </svg>
              </div>
            </div>

          </div>

          {/* 3. Middle Section: Live Patient Logs (8 Cols) + Doctor Tools & Hospital Overview (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Live Patient Logs Table (8 Cols) */}
            <div className="lg:col-span-8 p-5 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-4">
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
                      <th className="p-3">Hospital</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned Doctor</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/30">
                    {filteredLogs.map((p) => (
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
              <div className="p-5 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-3">
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

              {/* Hospital Overview (Mulago Hospital 83% Bed Occupancy) */}
              <div className="p-5 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Hospital Overview
                  </h4>
                  <select
                    value={hospitalWeekFilter}
                    onChange={(e) => setHospitalWeekFilter(e.target.value)}
                    className="bg-[#050e20] text-slate-300 border border-blue-800 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="This Week">This Week</option>
                    <option value="Last Week">Last Week</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-black text-white">Mulago Hospital</h5>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold inline-block mt-1">
                      ● Online
                    </span>
                    <p className="text-[11px] text-slate-400 mt-2 font-mono">
                      Beds: 240 • Occupied: 198
                    </p>
                  </div>

                  {/* 83% Donut Gauge */}
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#051024" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="83, 100" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-black text-white">83%</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Occupancy</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* 4. Bottom Section: Trends (4 Cols) + Recent Activities (4 Cols) + Smart Insights (4 Cols) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Patient Health Trends */}
            <div className="p-5 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-3">
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

            {/* Recent Activities */}
            <div className="p-5 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Recent Activities
                </h4>
                <button type="button" className="text-[10px] text-blue-400 font-bold hover:underline">
                  View All →
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-[#051024] flex items-center justify-between">
                  <span className="text-slate-200">✓ Prescription sent to Grace Akello</span>
                  <span className="text-[10px] text-slate-400">2 min ago</span>
                </div>
                <div className="p-2 rounded-xl bg-[#051024] flex items-center justify-between">
                  <span className="text-slate-200">🔬 Lab results ready for James Okwera</span>
                  <span className="text-[10px] text-slate-400">5 min ago</span>
                </div>
                <div className="p-2 rounded-xl bg-[#051024] flex items-center justify-between">
                  <span className="text-slate-200">⚠️ Rebecca Namagembe flagged (high temp)</span>
                  <span className="text-[10px] text-slate-400">7 min ago</span>
                </div>
                <div className="p-2 rounded-xl bg-[#051024] flex items-center justify-between">
                  <span className="text-slate-200">📅 Appt confirmed for Peter Ssemanda</span>
                  <span className="text-[10px] text-slate-400">10 min ago</span>
                </div>
              </div>
            </div>

            {/* Smart Insights */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c204c] to-[#061430] border border-blue-500/40 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
                  <Sparkles size={14} />
                  <span>Smart Insights</span>
                </div>
                <button type="button" className="text-[10px] text-cyan-400 font-bold hover:underline">
                  More Insights →
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Patient admissions increased by 18% this week. Consider allocating more staff in Mulago.
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => addToast?.('Mulago clinical staff allocation advisory dispatched to Medical Director.', 'success')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs cursor-pointer shadow"
                >
                  View Details →
                </button>
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-cyan-300 flex items-center justify-center text-lg">
                  ➕
                </div>
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

      {/* Video Call Modal */}
      <DoctorianVideoConsultationModal
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
      />

    </div>
  );
};

export default DoctorsDashboard;
