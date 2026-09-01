import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, User, Plus, Target, ChevronDown, MoreVertical, AlertTriangle, 
  Wifi, Battery, Heart, Activity, Thermometer, Wind, Bed, ShieldAlert, 
  Search, SlidersHorizontal, Sparkles, CheckCircle2, RefreshCw, X, Radio,
  Stethoscope, Eye, Filter, Check, Zap, Gauge
} from 'lucide-react';

export interface PatientTelemetryCard {
  id: string;
  secondaryId: string;
  name: string;
  bed: string;
  department: string;
  battery: number;
  timer: string;
  status: 'normal' | 'warning' | 'critical' | 'syncing';
  hipi: number | null;
  spi: number | null;
  vitals: {
    hr: number | null;
    nibpSystolic: number | null;
    nibpDiastolic: number | null;
    nibpMean: number | null;
    spo2: number | null;
    rr: number | null;
    bt: number | null;
    si: number | null;
  };
}

interface PatientsDashboardViewProps {
  onSelectPatient?: (patientId: string) => void;
  vitals?: any;
  arduino?: any;
}

const INITIAL_PATIENTS: PatientTelemetryCard[] = [
  {
    id: "85903050",
    secondaryId: "1464563",
    name: "Sarah Jenkins",
    bed: "L210C",
    department: "ICU Ward 2",
    battery: 89,
    timer: "00:23",
    status: "normal",
    hipi: 12,
    spi: 7,
    vitals: {
      hr: 97,
      nibpSystolic: 120,
      nibpDiastolic: 90,
      nibpMean: 72,
      spo2: 100,
      rr: 15,
      bt: 36.5,
      si: 1.1
    }
  },
  {
    id: "78103050",
    secondaryId: "8964563",
    name: "Robert Vance",
    bed: "L120A",
    department: "Cardiology",
    battery: 87,
    timer: "00:24",
    status: "warning",
    hipi: 59,
    spi: 62,
    vitals: {
      hr: 101,
      nibpSystolic: 131,
      nibpDiastolic: 97,
      nibpMean: 79,
      spo2: 99,
      rr: 15,
      bt: 36.6,
      si: 1.2
    }
  },
  {
    id: "29103050",
    secondaryId: "6417563",
    name: "Elena Rostova",
    bed: "L410D",
    department: "Neurology",
    battery: 91,
    timer: "00:23",
    status: "normal",
    hipi: 29,
    spi: 14,
    vitals: {
      hr: 91,
      nibpSystolic: 119,
      nibpDiastolic: 91,
      nibpMean: 74,
      spo2: 97,
      rr: 17,
      bt: 36.7,
      si: 1.1
    }
  },
  {
    id: "78103051",
    secondaryId: "4364563",
    name: "David Kim",
    bed: "L120B",
    department: "ICU Ward 2",
    battery: 94,
    timer: "00:03",
    status: "syncing",
    hipi: null,
    spi: null,
    vitals: {
      hr: null,
      nibpSystolic: null,
      nibpDiastolic: null,
      nibpMean: null,
      spo2: null,
      rr: null,
      bt: null,
      si: null
    }
  },
  {
    id: "19103050",
    secondaryId: "3464563",
    name: "Marcus Thorne",
    bed: "L305E",
    department: "Emergency Care",
    battery: 97,
    timer: "00:23",
    status: "critical",
    hipi: 95,
    spi: 65,
    vitals: {
      hr: 101,
      nibpSystolic: 120,
      nibpDiastolic: 85,
      nibpMean: 78,
      spo2: 99,
      rr: 18,
      bt: 38.2,
      si: 1.4
    }
  },
  {
    id: "49103050",
    secondaryId: "7864563",
    name: "Amina Diallo",
    bed: "L410D",
    department: "Cardiology",
    battery: 84,
    timer: "00:24",
    status: "warning",
    hipi: 65,
    spi: 65,
    vitals: {
      hr: 98,
      nibpSystolic: 120,
      nibpDiastolic: 90,
      nibpMean: 77,
      spo2: 98,
      rr: 16,
      bt: 36.8,
      si: 1.1
    }
  }
];

export const PatientsDashboardView: React.FC<PatientsDashboardViewProps> = ({
  onSelectPatient,
  vitals,
  arduino
}) => {
  const [patients, setPatients] = useState<PatientTelemetryCard[]>(INITIAL_PATIENTS);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');
  const [viewSettings, setViewSettings] = useState<string>('6-Grid Standard');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Assign Patient Form State
  const [newPatientId, setNewPatientId] = useState('');
  const [newPatientSecId, setNewPatientSecId] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newBed, setNewBed] = useState('L105A');
  const [newDept, setNewDept] = useState('ICU Ward 2');

  // Live watch vitals fetching & micro-fluctuations
  useEffect(() => {
    const fetchWatchDevices = async () => {
      try {
        const res = await fetch('/api/device/vitals');
        const data = await res.json();
        if (data.success && data.telemetry && Array.isArray(data.telemetry) && data.telemetry.length > 0) {
          const latestWatch = data.telemetry[0];
          setPatients(prev => {
            const exists = prev.some(p => p.id === latestWatch.device_id || p.name === latestWatch.patient_name);
            if (!exists && latestWatch.patient_name) {
              const watchCard: PatientTelemetryCard = {
                id: latestWatch.device_id || "WATCH-01",
                secondaryId: "WATCH-REF",
                name: latestWatch.patient_name || "Watch Patient",
                bed: "Watch Node",
                department: "Wearable Watch Telemetry",
                battery: 92,
                timer: "00:00",
                status: latestWatch.triage_status === 'URGENT' ? 'critical' : latestWatch.triage_status === 'WATCH' ? 'warning' : 'normal',
                hipi: 15,
                spi: 10,
                vitals: {
                  hr: latestWatch.heart_rate,
                  nibpSystolic: 120,
                  nibpDiastolic: 80,
                  nibpMean: 75,
                  spo2: latestWatch.spo2,
                  rr: 16,
                  bt: latestWatch.temperature,
                  si: 1.0
                }
              };
              return [watchCard, ...prev];
            } else {
              return prev.map((p, _idx_226) => {
                if (p.id === latestWatch.device_id || p.name === latestWatch.patient_name) {
                  return {
                    ...p,
                    status: latestWatch.triage_status === 'URGENT' ? 'critical' : latestWatch.triage_status === 'WATCH' ? 'warning' : 'normal',
                    vitals: {
                      ...p.vitals,
                      hr: latestWatch.heart_rate || p.vitals.hr,
                      spo2: latestWatch.spo2 || p.vitals.spo2,
                      bt: latestWatch.temperature || p.vitals.bt
                    }
                  };
                }
                return p;
              });
            }
          });
        }
      } catch (e) {
        // Silently handle if server offline
      }
    };

    fetchWatchDevices();
    const interval = setInterval(() => {
      fetchWatchDevices();
      setPatients(prev => prev.map((pt, _idx_252) => {
        if (pt.status === 'syncing' || !pt.vitals.hr) return pt;
        
        // Random micro-fluctuations in live vitals
        const hrDelta = Math.floor(Math.random() * 3) - 1;
        const newHr = Math.max(50, Math.min(180, (pt.vitals.hr || 90) + hrDelta));
        
        return {
          ...pt,
          vitals: {
            ...pt.vitals,
            hr: newHr
          }
        };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const filteredPatients = patients.filter(pt => {
    if (selectedDepartment === 'All Departments') return true;
    return pt.department.toLowerCase().includes(selectedDepartment.toLowerCase());
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = newPatientId.trim() || Math.floor(10000000 + Math.random() * 90000000).toString();
    const generatedSecId = newPatientSecId.trim() || Math.floor(1000000 + Math.random() * 9000000).toString();
    
    const newCard: PatientTelemetryCard = {
      id: generatedId,
      secondaryId: generatedSecId,
      name: newPatientName.trim() || `Patient ${generatedId.substring(0, 4)}`,
      bed: newBed,
      department: newDept,
      battery: 98,
      timer: "00:01",
      status: "normal",
      hipi: Math.floor(Math.random() * 30),
      spi: Math.floor(Math.random() * 20),
      vitals: {
        hr: 75 + Math.floor(Math.random() * 20),
        nibpSystolic: 120 + Math.floor(Math.random() * 10),
        nibpDiastolic: 80 + Math.floor(Math.random() * 10),
        nibpMean: 75,
        spo2: 98 + Math.floor(Math.random() * 3),
        rr: 14 + Math.floor(Math.random() * 4),
        bt: 36.6,
        si: 1.1
      }
    };

    setPatients([newCard, ...patients]);
    setIsAssignModalOpen(false);
    setNewPatientId('');
    setNewPatientSecId('');
    setNewPatientName('');
  };

  return (
    <div className="w-full bg-[#131422] rounded-[2.5rem] border border-slate-800/80 p-4 sm:p-6 lg:p-8 shadow-2xl text-slate-100 font-sans space-y-6">
      {/* Top Title & Control Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-blue-400 flex items-center justify-center shadow-inner shrink-0">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Patients Dashboard
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Real-time multi-patient clinical telemetry & bed transponder monitor
            </p>
          </div>
        </div>

        {/* Filters & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Department Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="appearance-none bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3.5 py-2 pr-8 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="All Departments">Department: All</option>
              <option value="ICU Ward 2">ICU Ward 2</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Emergency Care">Emergency Care</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* View Settings Dropdown */}
          <div className="relative shrink-0">
            <select
              value={viewSettings}
              onChange={(e) => setViewSettings(e.target.value)}
              className="appearance-none bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3.5 py-2 pr-8 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="6-Grid Standard">View Settings: Grid</option>
              <option value="Compact Telemetry">View Settings: Compact</option>
              <option value="Critical First">View Settings: Critical</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Assign Patient Button (Nice Medium Button matching reference image) */}
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm ml-auto md:ml-0"
          >
            <Target size={14} className="text-rose-400" />
            <span>Assign Patient</span>
          </button>
        </div>
      </div>

      {/* Patients 6-Card Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredPatients.map((card, cardIdx) => {
          const isCritical = card.status === 'critical';
          const isWarning = card.status === 'warning';
          const isSyncing = card.status === 'syncing';

          return (
            <motion.div
              key={`pt-card-${card.id}-${cardIdx}`}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                setSelectedCardId(card.id);
                if (onSelectPatient) onSelectPatient(card.id);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3.5 ${
                isCritical
                  ? 'bg-gradient-to-br from-rose-950/40 via-[#1c1a2e] to-rose-950/30 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-400'
                  : isWarning
                  ? 'bg-gradient-to-br from-amber-950/30 via-[#1a1b2b] to-amber-950/20 border-amber-500/40 hover:border-amber-400/80'
                  : 'bg-[#181928] border-slate-800/90 hover:border-slate-700 hover:bg-[#1f2035]'
              }`}
            >
              {/* Card Header Row 1 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                    <User size={13} />
                  </div>
                  <span className="text-sm font-black text-white tracking-wide">{card.id}</span>
                  <AlertTriangle size={14} className={isCritical ? 'text-rose-400 animate-bounce' : isWarning ? 'text-amber-400' : 'text-amber-400/80'} />
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                  <Battery size={13} className="text-slate-400" />
                  <span>{card.battery}%</span>
                  <Wifi size={13} className="text-blue-400" />
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {card.timer}
                  </span>
                  <button className="text-slate-400 hover:text-white p-0.5">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>

              {/* Card Header Row 2: Secondary ID & HIPI / SPI Status Pills */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                  <span>{card.secondaryId}</span>
                  <span className="text-[10px] text-slate-500">({card.name})</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* HIPI Pill */}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border tracking-wider ${
                    card.hipi === null 
                      ? 'bg-slate-800 text-slate-400 border-slate-700' 
                      : (card.hipi || 0) > 80 
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse' 
                      : (card.hipi || 0) > 40 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    HIPI {card.hipi !== null ? `${card.hipi}%` : '---'}
                  </span>

                  {/* SPI Pill */}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border tracking-wider ${
                    card.spi === null 
                      ? 'bg-slate-800 text-slate-400 border-slate-700' 
                      : (card.spi || 0) > 50 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    SPI {card.spi !== null ? `${card.spi}%` : '---'}
                  </span>
                </div>
              </div>

              {/* Vitals Telemetry Grid inside Card */}
              {isSyncing ? (
                <div className="py-6 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <RefreshCw size={20} className="animate-spin text-blue-400" />
                  <span className="text-xs font-bold tracking-wide uppercase">Calibrating Transponder...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  {/* Column 1: HR & RR */}
                  <div className="space-y-2">
                    {/* HR */}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        <Heart size={11} className="text-indigo-400" /> HR
                      </div>
                      <div className="text-base font-black text-white flex items-baseline gap-1">
                        {card.vitals.hr || '--'} <span className="text-[9px] font-normal text-slate-400">bpm</span>
                      </div>
                    </div>
                    {/* RR */}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        <Wind size={11} className="text-sky-400" /> RR
                      </div>
                      <div className="text-sm font-black text-white flex items-baseline gap-1">
                        {card.vitals.rr || '--'} <span className="text-[9px] font-normal text-slate-400">brpm</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: NIBP & BT */}
                  <div className="space-y-2">
                    {/* NIBP */}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                        <Activity size={11} className="text-rose-400" /> NIBP
                      </div>
                      <div className="text-base font-black text-white leading-none">
                        {card.vitals.nibpSystolic && card.vitals.nibpDiastolic ? `${card.vitals.nibpSystolic}/${card.vitals.nibpDiastolic}` : '--/--'}
                      </div>
                      <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                        ({card.vitals.nibpMean || '--'}) mmHg
                      </div>
                    </div>
                    {/* BT */}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        <Thermometer size={11} className="text-amber-400" /> BT
                      </div>
                      <div className="text-sm font-black text-white flex items-baseline gap-1">
                        {card.vitals.bt || '--.-'} <span className="text-[9px] font-normal text-slate-400">°C</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: SpO2 & SI */}
                  <div className="space-y-2">
                    {/* SpO2 */}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                        <Gauge size={11} className="text-teal-400" /> SpO2
                      </div>
                      <div className="text-base font-black text-white flex items-baseline gap-1">
                        {card.vitals.spo2 || '--'} <span className="text-[9px] font-normal text-slate-400">%</span>
                      </div>
                    </div>
                    {/* SI */}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        <Zap size={11} className="text-purple-400" /> SI
                      </div>
                      <div className="text-sm font-black text-white">
                        {card.vitals.si || '--.-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Row: Bed Location Badge */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs">
                  <Bed size={14} className="text-blue-400" />
                  <span>{card.bed}</span>
                  <span className="text-[10px] text-slate-500 font-normal">| {card.department}</span>
                </div>

                <span className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  View Live <Eye size={12} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Assign Patient Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#181928] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-rose-400" />
                  <h3 className="text-base font-black text-white uppercase tracking-wide">Assign Patient to Telemetry</h3>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jonathan Vance"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Patient Primary ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 85903055"
                      value={newPatientId}
                      onChange={(e) => setNewPatientId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Secondary Reg ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 1464599"
                      value={newPatientSecId}
                      onChange={(e) => setNewPatientSecId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="ICU Ward 2">ICU Ward 2</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Emergency Care">Emergency Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Bed Assignment</label>
                    <input
                      type="text"
                      placeholder="e.g. L210C"
                      value={newBed}
                      onChange={(e) => setNewBed(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider shadow-lg"
                  >
                    Assign & Monitor
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
