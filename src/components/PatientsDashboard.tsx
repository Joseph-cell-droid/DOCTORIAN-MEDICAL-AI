import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  AlertTriangle, 
  Heart, 
  Wind, 
  Thermometer, 
  Droplet, 
  Clock, 
  Maximize2, 
  Minimize2, 
  X, 
  Plus, 
  CheckCircle2, 
  Battery, 
  User, 
  Hospital, 
  ShieldAlert, 
  TrendingUp, 
  Volume2, 
  VolumeX, 
  RotateCw,
  FileText,
  ChevronDown
} from 'lucide-react';

interface PatientTelemetry {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  hospital: string;
  ward: string;
  condition: 'Critical' | 'COPD' | 'CAD' | 'Diabetes' | 'Stable';
  tags: string[];
  alertsCount: number;
  hr: number;
  pr: number;
  rr: number;
  spo2: number;
  tempC: number;
  tempF: number;
  bp: string;
  posture: 'Supine' | 'Sitting' | 'Standing';
  ews: number;
  hasSignal: boolean;
  avatar: string;
}

const INITIAL_PATIENTS: PatientTelemetry[] = [
  {
    id: 'UG-123450',
    mrn: 'MRN-88201',
    name: 'Sarah Nakato',
    age: 28,
    gender: 'Female',
    dob: '22 Nov 1996',
    hospital: 'Mulago National Referral Hospital',
    ward: 'Respiratory Ward 10',
    condition: 'Critical',
    tags: ['Critical', 'COPD'],
    alertsCount: 5,
    hr: 142,
    pr: 138,
    rr: 24,
    spo2: 92,
    tempC: 38.4,
    tempF: 101.1,
    bp: '135/88',
    posture: 'Supine',
    ews: 4,
    hasSignal: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'UG-123451',
    mrn: 'MRN-91420',
    name: 'John Doe Mukasa',
    age: 45,
    gender: 'Male',
    dob: '14 May 1979',
    hospital: 'Mbarara Regional Referral Hospital',
    ward: 'Cardiology ICU Bed 4',
    condition: 'Critical',
    tags: ['Critical', 'CAD', 'COPD'],
    alertsCount: 3,
    hr: 118,
    pr: 115,
    rr: 21,
    spo2: 95,
    tempC: 37.8,
    tempF: 100.0,
    bp: '140/92',
    posture: 'Supine',
    ews: 3,
    hasSignal: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'UG-123452',
    mrn: 'MRN-64218',
    name: 'Mary Atim',
    age: 32,
    gender: 'Female',
    dob: '08 Mar 1992',
    hospital: 'Gulu Regional Referral Hospital',
    ward: 'Medical Ward 2B',
    condition: 'Stable',
    tags: ['CAD', 'Stable'],
    alertsCount: 0,
    hr: 72,
    pr: 70,
    rr: 16,
    spo2: 98,
    tempC: 36.6,
    tempF: 97.9,
    bp: '118/76',
    posture: 'Sitting',
    ews: 0,
    hasSignal: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'UG-123453',
    mrn: 'MRN-77312',
    name: 'David Ssemwogerere',
    age: 58,
    gender: 'Male',
    dob: '19 Jan 1966',
    hospital: 'Jinja Regional Referral Hospital',
    ward: 'High Dependency Ward 1',
    condition: 'Critical',
    tags: ['Critical', 'COPD', 'Diabetes'],
    alertsCount: 8,
    hr: 135,
    pr: 130,
    rr: 26,
    spo2: 91,
    tempC: 38.6,
    tempF: 101.5,
    bp: '150/96',
    posture: 'Supine',
    ews: 5,
    hasSignal: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'UG-123454',
    mrn: 'MRN-50192',
    name: 'Florence Nabukenya',
    age: 41,
    gender: 'Female',
    dob: '11 Oct 1983',
    hospital: 'Kiruddu National Referral Hospital',
    ward: 'Renal & Burn Unit 3',
    condition: 'Stable',
    tags: ['Diabetes', 'Stable'],
    alertsCount: 1,
    hr: 80,
    pr: 78,
    rr: 18,
    spo2: 97,
    tempC: 37.0,
    tempF: 98.6,
    bp: '124/80',
    posture: 'Sitting',
    ews: 1,
    hasSignal: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'UG-123455',
    mrn: 'MRN-44910',
    name: 'Emmanuel Otim',
    age: 63,
    gender: 'Male',
    dob: '05 Jul 1961',
    hospital: 'Entebbe Regional Referral Hospital',
    ward: 'Isolation & Observation Ward',
    condition: 'COPD',
    tags: ['COPD', 'Stable'],
    alertsCount: 2,
    hr: 88,
    pr: 85,
    rr: 20,
    spo2: 94,
    tempC: 37.2,
    tempF: 99.0,
    bp: '128/84',
    posture: 'Supine',
    ews: 2,
    hasSignal: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
  }
];

export const PatientsDashboard: React.FC = () => {
  const [patients, setPatients] = useState<PatientTelemetry[]>(INITIAL_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('All Sites');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedPatient, setExpandedPatient] = useState<PatientTelemetry | null>(null);
  const [monitorNotice, setMonitorNotice] = useState<string | null>(null);
  const triggerMonitorNotice = (msg: string) => {
    setMonitorNotice(msg);
    setTimeout(() => setMonitorNotice(prev => (prev === msg ? null : prev)), 3500);
  };

  // Live ECG Waveform Tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => (t + 1) % 1000);
    }, 60);
    return () => clearInterval(timer);
  }, []);

  // Filtered patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHospital = hospitalFilter === 'All Sites' || p.hospital.includes(hospitalFilter);
    const matchesCondition = conditionFilter === 'All' || p.condition === conditionFilter;
    return matchesSearch && matchesHospital && matchesCondition;
  });

  return (
    <div className="w-full min-h-screen bg-[#071329] text-white font-sans pb-16 overflow-x-hidden border-box">
      
      {/* ========================================================================= */}
      {/* TOP HEADER CONTROLS                                                       */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-30 w-full bg-[#091b3b]/95 backdrop-blur-md border-b border-blue-900/40 px-4 sm:px-6 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Title & Count */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Activity size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Patients Dashboard</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-bold border border-blue-500/30">
                  RPM Live Node
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Continuous Bio-Telemetry across Ugandan Referral Centers ({filteredPatients.length} Active Patients)
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Subject ID / Name..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#050e20] border border-blue-800/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Hospital Filter */}
            <select
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              className="bg-[#050e20] border border-blue-800/60 text-xs font-semibold text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="All Sites">All Referral Hospitals</option>
              <option value="Mulago">Mulago National Referral</option>
              <option value="Mbarara">Mbarara Regional Referral</option>
              <option value="Gulu">Gulu Regional Referral</option>
              <option value="Jinja">Jinja Regional Referral</option>
              <option value="Kiruddu">Kiruddu National Referral</option>
              <option value="Entebbe">Entebbe Regional Referral</option>
            </select>

            {/* Condition Filter */}
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="bg-[#050e20] border border-blue-800/60 text-xs font-semibold text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="COPD">COPD</option>
              <option value="CAD">CAD</option>
              <option value="Stable">Stable</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#050e20] border border-blue-800/60 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grid View (Medium Cards)"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="List View"
              >
                <List size={14} />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CARDS CONTAINER (Fits page border with zero overflow)                */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => {
              const isCrit = patient.condition === 'Critical';

              return (
                <motion.div
                  key={patient.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setExpandedPatient(patient)}
                  className={`p-4 rounded-2xl bg-[#091836] border ${
                    isCrit ? 'border-rose-500/50 shadow-rose-950/30' : 'border-blue-900/50'
                  } shadow-md hover:border-cyan-400/80 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={patient.avatar}
                        alt={patient.name}
                        className="w-10 h-10 rounded-full object-cover border border-blue-400/50 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{patient.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">({patient.id})</span>
                        </div>
                        <p className="text-[10px] text-cyan-300 font-medium truncate max-w-[200px] sm:max-w-xs">
                          {patient.hospital} • {patient.ward}
                        </p>
                      </div>
                    </div>

                    {/* Tags & Alerts */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {patient.tags.map((tg, i) => (
                        <span
                          key={i}
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            tg === 'Critical'
                              ? 'bg-rose-500 text-white animate-pulse'
                              : tg === 'COPD'
                              ? 'bg-blue-600 text-white'
                              : tg === 'CAD'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {tg}
                        </span>
                      ))}
                      {patient.alertsCount > 0 && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          {patient.alertsCount} Alerts
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Live ECG Waveform Canvas Strip */}
                  <div className="h-16 w-full rounded-xl bg-[#040b17] border border-blue-950 relative overflow-hidden p-1 flex items-center">
                    <span className="absolute top-1 left-2 text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest z-10">
                      ECG Lead II • 25mm/s
                    </span>

                    {/* Pulsing SVG ECG Line */}
                    <svg className="w-full h-full" viewBox="0 0 300 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`ecgGrad-${patient.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.2" />
                          <stop offset="85%" stopColor="#00e5ff" stopOpacity="1" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M 0,20 L 30,20 L 40,20 L 45,5 L 50,35 L 55,10 L 60,25 L 65,20 L 95,20 L 105,20 L 110,5 L 115,35 L 120,10 L 125,25 L 130,20 L 160,20 L 170,20 L 175,5 L 180,35 L 185,10 L 190,25 L 195,20 L 225,20 L 235,20 L 240,5 L 245,35 L 250,10 L 255,25 L 260,20 L 300,20`}
                        fill="none"
                        stroke={`url(#ecgGrad-${patient.id})`}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]"
                        style={{
                          transform: `translateX(-${(tick * 3) % 65}px)`
                        }}
                      />
                    </svg>

                    {/* Signal status pill */}
                    <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Stream
                    </div>
                  </div>

                  {/* Vitals Grid Bar */}
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    
                    {/* HR */}
                    <div className="p-1.5 rounded-xl bg-[#061127] border border-blue-900/30">
                      <span className="text-[9px] text-slate-400 font-bold block">HR</span>
                      <span className={`text-xs font-black ${patient.hr > 120 ? 'text-rose-400' : 'text-cyan-300'}`}>
                        {patient.hr}
                      </span>
                      <span className="text-[8px] text-slate-500 block">bpm</span>
                    </div>

                    {/* RR */}
                    <div className="p-1.5 rounded-xl bg-[#061127] border border-blue-900/30">
                      <span className="text-[9px] text-slate-400 font-bold block">RR</span>
                      <span className="text-xs font-black text-amber-300">{patient.rr}</span>
                      <span className="text-[8px] text-slate-500 block">brpm</span>
                    </div>

                    {/* SpO2 */}
                    <div className="p-1.5 rounded-xl bg-[#061127] border border-blue-900/30">
                      <span className="text-[9px] text-slate-400 font-bold block">SpO2</span>
                      <span className={`text-xs font-black ${patient.spo2 < 94 ? 'text-rose-400' : 'text-emerald-300'}`}>
                        {patient.spo2}%
                      </span>
                      <span className="text-[8px] text-slate-500 block">O2 Sat</span>
                    </div>

                    {/* TEMP */}
                    <div className="p-1.5 rounded-xl bg-[#061127] border border-blue-900/30">
                      <span className="text-[9px] text-slate-400 font-bold block">TEMP</span>
                      <span className="text-xs font-black text-rose-300">{patient.tempC}°C</span>
                      <span className="text-[8px] text-slate-500 block">{patient.tempF}°F</span>
                    </div>

                    {/* BP */}
                    <div className="p-1.5 rounded-xl bg-[#061127] border border-blue-900/30">
                      <span className="text-[9px] text-slate-400 font-bold block">BP</span>
                      <span className="text-xs font-black text-white">{patient.bp}</span>
                      <span className="text-[8px] text-slate-500 block">mmHg</span>
                    </div>

                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-blue-950 text-[10px]">
                    <span className="text-slate-400 font-mono">
                      EWS: <strong className={patient.ews > 3 ? 'text-rose-400' : 'text-emerald-400'}>{patient.ews}</strong>
                      {' • '}Posture: {patient.posture}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setExpandedPatient(patient); }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-cyan-200 text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <span>Expand Telemetry</span>
                      <Maximize2 size={11} />
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View Mode */
          <div className="rounded-2xl bg-[#091836] border border-blue-900/50 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#050e20] text-slate-400 font-mono uppercase text-[10px] border-b border-blue-900/50">
                  <tr>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Hospital / Ward</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">HR</th>
                    <th className="p-3">RR</th>
                    <th className="p-3">SpO2</th>
                    <th className="p-3">Temp</th>
                    <th className="p-3">BP</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/30">
                  {filteredPatients.map(p => (
                    <tr 
                      key={p.id}
                      onClick={() => setExpandedPatient(p)}
                      className="hover:bg-blue-950/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <img src={p.avatar} alt="" className="w-7 h-7 rounded-full" />
                        <div>
                          <div>{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.id}</div>
                        </div>
                      </td>
                      <td className="p-3 text-[11px] text-cyan-300">{p.hospital}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.condition === 'Critical' ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'}`}>
                          {p.condition}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-cyan-300">{p.hr} bpm</td>
                      <td className="p-3 font-mono text-amber-300">{p.rr} brpm</td>
                      <td className="p-3 font-mono text-emerald-300">{p.spo2}%</td>
                      <td className="p-3 font-mono text-rose-300">{p.tempC}°C</td>
                      <td className="p-3 font-mono text-white">{p.bp}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* EXPANDED FULL VIEW TELEMETRY MODAL (Matching image_07b1528a.png)         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {expandedPatient && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-6xl rounded-3xl bg-[#06142e] border border-blue-500/40 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
            >
              
              {/* Modal Top Nav Bar */}
              <div className="px-5 py-3 bg-[#081b3d] border-b border-blue-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-mono font-bold text-sm">ID: {expandedPatient.id}</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      <Battery size={12} /> 94%
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 pl-3 border-l border-blue-800">
                    <strong className="text-white">{expandedPatient.name}</strong> • {expandedPatient.ward} • DOB: {expandedPatient.dob}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    Updated at: {new Date().toLocaleTimeString()}
                  </span>
                  {monitorNotice && (
                    <span className="px-3 py-1 rounded-lg bg-teal-600/20 border border-teal-400/40 text-teal-200 text-xs font-semibold">
                      {monitorNotice}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      triggerMonitorNotice(`Monitoring suspended for ${expandedPatient.name}`);
                      setExpandedPatient(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs cursor-pointer shadow"
                  >
                    STOP MONITORING
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedPatient(null)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Main Dual Lead Waveform + Telemetry Readings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 flex-1 overflow-y-auto">
                
                {/* Dual Lead Waveform Channels (8 Cols) */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* Channel 1: ECG-A */}
                  <div className="p-3 rounded-2xl bg-[#030914] border border-blue-950 space-y-1 relative">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="text-cyan-400 font-bold">1 mV | 0.2s</span>
                      <span className="text-emerald-400 font-black">ECG-A (Lead II)</span>
                    </div>

                    <div className="h-44 w-full relative overflow-hidden bg-[radial-gradient(#0a2147_1px,transparent_1px)] [background-size:16px_16px]">
                      <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                        <path
                          d="M 0,60 L 60,60 L 70,60 L 75,20 L 82,100 L 88,30 L 95,75 L 100,60 L 160,60 L 170,60 L 175,20 L 182,100 L 188,30 L 195,75 L 200,60 L 260,60 L 270,60 L 275,20 L 282,100 L 288,30 L 295,75 L 300,60 L 360,60 L 370,60 L 375,20 L 382,100 L 388,30 L 395,75 L 400,60 L 460,60 L 470,60 L 475,20 L 482,100 L 488,30 L 495,75 L 500,60 L 600,60"
                          fill="none"
                          stroke="#00e5ff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                          style={{ transform: `translateX(-${(tick * 5) % 100}px)` }}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Channel 2: ECG-B */}
                  <div className="p-3 rounded-2xl bg-[#030914] border border-blue-950 space-y-1 relative">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="text-cyan-400 font-bold">1 mV | 0.2s</span>
                      <span className="text-emerald-400 font-black">ECG-B (Lead V5)</span>
                    </div>

                    <div className="h-44 w-full relative overflow-hidden bg-[radial-gradient(#0a2147_1px,transparent_1px)] [background-size:16px_16px]">
                      <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                        <path
                          d="M 0,60 L 60,60 L 70,60 L 75,25 L 82,95 L 88,35 L 95,70 L 100,60 L 160,60 L 170,60 L 175,25 L 182,95 L 188,35 L 195,70 L 200,60 L 260,60 L 270,60 L 275,25 L 282,95 L 288,35 L 295,70 L 300,60 L 360,60 L 370,60 L 375,25 L 382,95 L 388,35 L 395,70 L 400,60 L 460,60 L 470,60 L 475,25 L 482,95 L 488,35 L 495,70 L 500,60 L 600,60"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                          style={{ transform: `translateX(-${(tick * 5) % 100}px)` }}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Telemetry Bottom Controls Bar */}
                  <div className="p-3 rounded-2xl bg-[#091a38] border border-blue-900/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => triggerMonitorNotice(`Clinical event logged for ${expandedPatient.name}`)}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow"
                      >
                        ADD EVENT
                      </button>

                      <div className="px-3 py-1.5 rounded-xl bg-[#051126] border border-blue-800 text-xs">
                        <span className="text-slate-400">Patient Posture: </span>
                        <strong className="text-cyan-300 font-bold">{expandedPatient.posture}</strong>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-[#051126] border border-blue-800 text-xs flex items-center gap-2">
                        <span className="text-slate-400">EWS:</span>
                        <span className="text-lg font-black text-rose-400 font-mono">{expandedPatient.ews}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-xs text-right">
                        <span className="text-slate-400 text-[10px] block">NIBP (Sys/Dia/MAP)</span>
                        <strong className="text-white font-mono">{expandedPatient.bp} (90) mmHg</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerMonitorNotice('Patient vitals refreshed')}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase cursor-pointer"
                      >
                        UPDATE
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right Parameter Columns (4 Cols) */}
                <div className="lg:col-span-4 space-y-3">
                  
                  {/* Top Action Toggles: ALERTS & TRENDS */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => triggerMonitorNotice(`Active alerts: ${expandedPatient.alertsCount}`)}
                      className="py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                    >
                      <AlertTriangle size={14} />
                      <span>ALERTS ({expandedPatient.alertsCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerMonitorNotice('Longitudinal trend summary updated')}
                      className="py-2.5 rounded-xl bg-[#0c2044] hover:bg-blue-800/60 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-800"
                    >
                      <TrendingUp size={14} />
                      <span>TRENDS</span>
                    </button>
                  </div>

                  {/* Heart Rate Display */}
                  <div className="p-4 rounded-2xl bg-[#030914] border border-blue-900/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Heart size={16} className="animate-pulse" />
                        <span className="text-xs font-black uppercase">HR</span>
                      </div>
                      <span className="text-3xl font-black text-emerald-400 font-mono mt-1 block">
                        {expandedPatient.hr}
                      </span>
                      <span className="text-[10px] text-slate-400">bpm</span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-500">
                      <div>Max: 150</div>
                      <div className="mt-4">Min: 50</div>
                    </div>
                  </div>

                  {/* Pulse Rate Display */}
                  <div className="p-4 rounded-2xl bg-[#030914] border border-blue-900/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-cyan-400">
                        <Activity size={16} />
                        <span className="text-xs font-black uppercase">PR</span>
                      </div>
                      <span className="text-3xl font-black text-cyan-300 font-mono mt-1 block">
                        {expandedPatient.pr}
                      </span>
                      <span className="text-[10px] text-slate-400">bpm</span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-500">
                      <div>12 min ago</div>
                    </div>
                  </div>

                  {/* SpO2 Display */}
                  <div className="p-4 rounded-2xl bg-[#030914] border border-blue-900/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-blue-400">
                        <Wind size={16} />
                        <span className="text-xs font-black uppercase">SpO2</span>
                      </div>
                      <span className="text-3xl font-black text-blue-300 font-mono mt-1 block">
                        {expandedPatient.spo2}%
                      </span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-500">
                      <div>Target: &gt;95%</div>
                    </div>
                  </div>

                  {/* RR Display */}
                  <div className="p-4 rounded-2xl bg-[#030914] border border-blue-900/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Wind size={16} />
                        <span className="text-xs font-black uppercase">RR</span>
                      </div>
                      <span className="text-3xl font-black text-amber-300 font-mono mt-1 block">
                        {expandedPatient.rr}
                      </span>
                      <span className="text-[10px] text-slate-400">brpm</span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-500">
                      <div>Normal: 12-20</div>
                    </div>
                  </div>

                  {/* Skin Temperature Display */}
                  <div className="p-4 rounded-2xl bg-[#030914] border border-blue-900/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-rose-400">
                        <Thermometer size={16} />
                        <span className="text-xs font-black uppercase">Skin Temp</span>
                      </div>
                      <span className="text-2xl font-black text-rose-300 font-mono mt-1 block">
                        {expandedPatient.tempF}°F <span className="text-xs text-slate-400">({expandedPatient.tempC}°C)</span>
                      </span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-500">
                      <div>Norm: 98.6°F</div>
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PatientsDashboard;
