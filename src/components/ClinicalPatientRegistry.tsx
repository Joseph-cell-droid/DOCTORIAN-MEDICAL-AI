import React, { useState, useEffect } from 'react';
import {
  Activity, CheckCircle, Clock, Smartphone, User as UserIcon, XCircle, Settings, Layers, ChevronRight, ShieldAlert, Check,
  Heart, Droplets, Wind, AlertTriangle, Stethoscope, Signal, Monitor, Brain, Cpu, Zap, Sparkles, PhoneCall, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../api';
import { Vitals } from '../hooks/useArduino';
import { SafeResponsiveContainer } from './SafeResponsiveContainer';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export interface RegisteredPatient {
  id: string;
  name: string;
  bedNumber: string;
  age: string;
  gender: string;
  weight: string;
  bloodType: string;
  phone: string;
  doctorPhone: string;
  mentorPhone: string;
  conditions: string;
  allergies: string;
  vitalsPreset: 'healthy' | 'warning' | 'critical';
}

export interface BedTransferRecord {
  id: string;
  patientName: string;
  fromBed: string;
  toBed: string;
  timestamp: string;
  reason: string;
}

export interface CleaningSchedule {
  id: string;
  bedNumber: string;
  patientDischarged: string;
  scheduledTime: string;
  phoneNotified: string;
  status: 'Scheduled' | 'SMS Dispatched' | 'Completed';
}

export interface FloorPlanBed {
  id: string;
  label: string;
  section: string;
}

export const FLOOR_PLAN_BEDS: FloorPlanBed[] = [
  { id: 'A-01', label: 'Bed A-01 (Ward A)', section: 'Ward A (General)' },
  { id: 'A-02', label: 'Bed A-02 (Ward A)', section: 'Ward A (General)' },
  { id: 'A-03', label: 'Bed A-03 (Ward A)', section: 'Ward A (General)' },
  { id: 'A-04', label: 'Bed A-04 (Ward A)', section: 'Ward A (General)' },
  { id: 'A-05', label: 'Bed A-05 (Ward A)', section: 'Ward A (General)' },
  { id: 'A-06', label: 'Bed A-06 (Ward A)', section: 'Ward A (General)' },
  { id: 'B-01', label: 'Bed B-01 (Ward A)', section: 'ICU & High Accuity' },
  { id: 'B-02', label: 'Bed B-02 (ICU-Maternity)', section: 'ICU & High Accuity' },
  { id: 'B-03', label: 'Bed B-03 (Cardiac Wing)', section: 'ICU & High Accuity' },
  { id: 'B-04', label: 'Bed B-04 (ICU-Admissions)', section: 'ICU & High Accuity' },
  { id: 'C-01', label: 'Bed C-01 (Cardiac Care)', section: 'Cardiac Care Unit' },
  { id: 'C-02', label: 'Bed C-02 (Cardiac Care)', section: 'Cardiac Care Unit' },
  { id: 'C-03', label: 'Bed C-03 (Cardiac Care)', section: 'Cardiac Care Unit' },
  { id: 'C-04', label: 'Bed C-04 (Cardiac Care)', section: 'Cardiac Care Unit' },
  { id: 'D-01', label: 'Bed D-01 (ER)', section: 'Emergency Room' },
  { id: 'D-02', label: 'Bed D-02 (ER)', section: 'Emergency Room' },
  { id: 'D-03', label: 'Bed D-03 (ER)', section: 'Emergency Room' },
  { id: 'D-04', label: 'Bed D-04 (ER)', section: 'Emergency Room' }
];

export const defaultTransfers: BedTransferRecord[] = [
  {
    id: "transfer-1",
    patientName: "Nakato Sarah Mukasa",
    fromBed: "Bed B-04 (Maternity General)",
    toBed: "Bed B-02 (ICU-Maternity)",
    timestamp: new Date(Date.now() - 3600000 * 2.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    reason: "Postpartum BP spike and respiratory distress, moved for close mechanical ventilation integration"
  },
  {
    id: "transfer-2",
    patientName: "Joseph Brian Obote",
    fromBed: "Bed A-02 (Emergency Pod)",
    toBed: "Bed B-01 (Ward A)",
    timestamp: new Date(Date.now() - 3600000 * 6).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    reason: "Malaria vital spike controlled, transfer to step-down telemetry wing"
  }
];

export const MiniPatientMonitor: React.FC<{
  preset: 'healthy' | 'warning' | 'critical';
  patientId?: string;
  selectedPatientId: string;
  arduino: any;
}> = ({ preset, patientId, selectedPatientId, arduino }) => {
  const [vitals, setVitals] = useState({
    hr: preset === 'critical' ? 142 : preset === 'warning' ? 104 : 72,
    spo2: preset === 'critical' ? 84 : preset === 'warning' ? 92 : 98,
    bpSys: preset === 'critical' ? 180 : preset === 'warning' ? 142 : 120,
    bpDia: preset === 'critical' ? 112 : preset === 'warning' ? 94 : 80,
    rr: preset === 'critical' ? 32 : preset === 'warning' ? 24 : 15,
    temp: preset === 'critical' ? 39.4 : preset === 'warning' ? 38.2 : 36.7
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setVitals(prev => ({
        hr: Math.round(prev.hr + (Math.random() - 0.5) * 2),
        spo2: Math.min(100, Math.max(50, Math.round(prev.spo2 + (Math.random() > 0.8 ? (Math.random() - 0.5) * 2 : 0)))),
        bpSys: Math.round(prev.bpSys + (Math.random() - 0.5) * 1.5),
        bpDia: Math.round(prev.bpDia + (Math.random() - 0.5) * 1),
        rr: Math.round(prev.rr + (Math.random() - 0.5) * 0.8),
        temp: parseFloat((prev.temp + (Math.random() - 0.5) * 0.05).toFixed(1))
      }));
    }, 1200);
    return () => clearInterval(timer);
  }, [preset]);

  const [pulsePhase, setPulsePhase] = useState(0);
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setPulsePhase(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(animationFrame);
  }, []);

  const getSgPath = () => {
    let pts = [];
    for (let x = 0; x <= 160; x += 4) {
      let y = 15;
      const cycle = (x + pulsePhase * 2) % 60;
      if (cycle > 12 && cycle < 18) {
        y = 2; 
      } else if (cycle >= 18 && cycle < 22) {
        y = 26; 
      } else if (cycle >= 22 && cycle < 28) {
        y = 8; 
      }
      pts.push(`${x},${y}`);
    }
    return `M ${pts.join(' L ')}`;
  };

  const statusColor = preset === 'critical' ? 'text-rose-500 bg-rose-500/10' : preset === 'warning' ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10';

  const isMainCoupledPatient = patientId === selectedPatientId && arduino?.connection?.connected;
  
  const displayVitals = (isMainCoupledPatient && arduino?.vitals) ? {
    hr: Math.round(arduino.vitals.heartRate),
    spo2: Math.round(arduino.vitals.spo2),
    bpSys: Math.round(arduino.vitals.systolicBP),
    bpDia: Math.round(arduino.vitals.diastolicBP),
    rr: Math.round(arduino.vitals.respiratoryRate),
    temp: parseFloat(arduino.vitals.temperature.toFixed(1))
  } : vitals;

  return (
    <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3 font-sans shadow-inner">
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
        <span className="flex items-center gap-1">
          <Activity size={10} className="text-teal-400 rotate-12" />
          Live Vital Node Signal
        </span>
        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${statusColor}`}>
          {preset.toUpperCase()} WAVE
        </span>
      </div>

      <div className="h-10 bg-slate-950 rounded-lg overflow-hidden relative border border-slate-850 flex items-center">
        <svg className="w-full h-8" viewBox="0 0 160 30">
          <path
            d={getSgPath()}
            fill="none"
            stroke={preset === 'critical' ? '#ef4444' : preset === 'warning' ? '#f59e0b' : '#10b981'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute top-1 right-2 text-[8px] font-black font-mono text-slate-600">{isMainCoupledPatient ? 'REAL TIME FEED' : '64HZ DIRECT'}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
          <div className="text-[7px] font-bold text-slate-500 uppercase">Heart Rate</div>
          <div className="text-xs font-black font-mono text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
            <Heart size={8} className="text-red-500 animate-pulse fill-red-500 shrink-0" />
            {displayVitals.hr} <span className="text-[7px] font-normal text-slate-500">BPM</span>
          </div>
        </div>

        <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
          <div className="text-[7px] font-bold text-slate-500 uppercase">SPO2 Oxygen</div>
          <div className="text-xs font-black font-mono text-cyan-400 mt-0.5">
            {displayVitals.spo2}%
          </div>
        </div>

        <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
          <div className="text-[7px] font-bold text-slate-500 uppercase">SYS/DIA BP</div>
          <div className="text-xs font-black font-mono text-amber-400 mt-0.5">
            {displayVitals.bpSys}/{displayVitals.bpDia}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-1.5 bg-slate-950 rounded border border-slate-850 flex items-center justify-between px-2">
          <span className="text-[7px] font-bold text-slate-500 uppercase">Temperature</span>
          <span className="text-[10px] font-black font-mono text-orange-400">{displayVitals.temp}°C</span>
        </div>
        <div className="p-1.5 bg-slate-950 rounded border border-slate-850 flex items-center justify-between px-2">
          <span className="text-[7px] font-bold text-slate-500 uppercase">Resp. Rate</span>
          <span className="text-[10px] font-black font-mono text-blue-400">{displayVitals.rr} RPM</span>
        </div>
      </div>
    </div>
  );
};

export interface ClinicalPatientRegistryProps {
  user: User | null | undefined;
  onUpdateUser?: (u: User) => void;
  registeredPatients: RegisteredPatient[];
  setRegisteredPatients: React.Dispatch<React.SetStateAction<RegisteredPatient[]>>;
  selectedPatientId: string;
  setSelectedPatientId: React.Dispatch<React.SetStateAction<string>>;
  registryNotification: { message: string; type: 'success' | 'error' | 'info' } | null;
  setRegistryNotification: React.Dispatch<React.SetStateAction<{ message: string; type: 'success' | 'error' | 'info' } | null>>;
  transferHistory: BedTransferRecord[];
  setTransferHistory: React.Dispatch<React.SetStateAction<BedTransferRecord[]>>;
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  couplePatientToMonitor: (patient: RegisteredPatient) => void;
  triggerRegistryNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  arduino: any;
}

export const ClinicalPatientRegistry: React.FC<ClinicalPatientRegistryProps> = ({
  user,
  onUpdateUser,
  registeredPatients,
  setRegisteredPatients,
  selectedPatientId,
  setSelectedPatientId,
  registryNotification,
  setRegistryNotification,
  transferHistory,
  setTransferHistory,
  isAdmin,
  setIsAdmin,
  couplePatientToMonitor,
  triggerRegistryNotification,
  arduino
}) => {
  const [regName, setRegName] = useState('');
  const [regBed, setRegBed] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regWeight, setRegWeight] = useState('');
  const [regBlood, setRegBlood] = useState('O+');
  const [regPhone, setRegPhone] = useState('+256787674140');
  const [regDoc, setRegDoc] = useState('+256787674140');
  const [regMentor, setRegMentor] = useState('+256787674140');
  const [regConditions, setRegConditions] = useState('');
  const [regAllergies, setRegAllergies] = useState('');
  const [regPreset, setRegPreset] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  // Editing State
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [transferViewMode, setTransferViewMode] = useState<'timeline' | 'table'>('timeline');

  // Display configuration and interactive toggles
  const [registryDisplayMode, setRegistryDisplayMode] = useState<'cards' | 'floorplan'>('floorplan');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSeverityFilter, setPatientSeverityFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');

  const [isAutoCleanSmsEnabled, setIsAutoCleanSmsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('doctorian_auto_sms_clean');
    return saved !== 'false';
  });

  const [cleaningStaffSelected, setCleaningStaffSelected] = useState<string>(() => {
    const saved = localStorage.getItem('doctorian_cleaner_phone');
    return saved || '+256787555019';
  });

  const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>(() => {
    const saved = localStorage.getItem('doctorian_cleaning_schedules');
    return saved ? JSON.parse(saved) : [
      {
        id: 'clean-baseline-1',
        bedNumber: 'Bed A-04 (Ward A)',
        patientDischarged: 'Kato Derrick Ssekajja',
        scheduledTime: '08:05 AM',
        phoneNotified: '+256787555019',
        status: 'Completed'
      },
      {
        id: 'clean-baseline-2',
        bedNumber: 'Bed D-03 (ER)',
        patientDischarged: 'Namubiru Maria',
        scheduledTime: '08:24 AM',
        phoneNotified: '+256787555019',
        status: 'SMS Dispatched'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('doctorian_cleaning_schedules', JSON.stringify(cleaningSchedules));
  }, [cleaningSchedules]);

  useEffect(() => {
    localStorage.setItem('doctorian_auto_sms_clean', isAutoCleanSmsEnabled.toString());
  }, [isAutoCleanSmsEnabled]);

  useEffect(() => {
    localStorage.setItem('doctorian_cleaner_phone', cleaningStaffSelected);
  }, [cleaningStaffSelected]);

  useEffect(() => {
    const pendingDispatch = cleaningSchedules.filter(c => c.status === 'SMS Dispatched');
    if (pendingDispatch.length === 0) return;

    const timer = setTimeout(() => {
      let hasChange = false;
      setCleaningSchedules(prev => {
        return prev.map(c => {
          if (c.status === 'SMS Dispatched') {
            hasChange = true;
            return { ...c, status: 'Completed' as const };
          }
          return c;
        });
      });
      triggerRegistryNotification("Hygiene Node Confirmation: Bed disinfected, sterilized, and returned to clinical intake rotation.", "success");
    }, 15000);

    return () => clearTimeout(timer);
  }, [cleaningSchedules]);

  const getWardSection = (bedNumber: string) => {
    const normalized = bedNumber.toLowerCase();
    if (normalized.includes('icu') || normalized.includes('maternity')) return 'ICU & High Accuity';
    if (normalized.includes('cardiac') || normalized.includes('wing') || normalized.includes('c-')) return 'Cardiac Care Unit';
    if (normalized.includes('emerg') || normalized.includes('observ') || normalized.includes('d-') || normalized.includes('bed b-04')) return 'Emergency Room';
    return 'Ward A (General)';
  };

  const countOccupied = (section: string) => {
    return registeredPatients.filter(p => getWardSection(p.bedNumber) === section).length;
  };

  const wardSections = [
    { name: 'Ward A (General)', capacity: 6, color: '#06b6d4', text: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { name: 'ICU & High Accuity', capacity: 4, color: '#3b82f6', text: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Cardiac Care Unit', capacity: 4, color: '#a855f7', text: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Emergency Room', capacity: 4, color: '#f43f5e', text: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const chartData = wardSections.map(ws => {
    const occupied = countOccupied(ws.name);
    return {
      name: ws.name,
      Occupied: occupied,
      Available: Math.max(0, ws.capacity - occupied),
      Capacity: ws.capacity
    };
  });

  const totalBedsCount = wardSections.reduce((sum, ws) => sum + ws.capacity, 0);
  const overallOccupied = registeredPatients.length;
  const overallAvailable = Math.max(0, totalBedsCount - overallOccupied);
  const occupancyRate = Math.round((overallOccupied / totalBedsCount) * 100);

  const searchedAndFilteredPatients = (() => {
    return registeredPatients.filter(patient => {
      const query = patientSearchQuery.trim().toLowerCase();
      const nameMatch = patient.name.toLowerCase().includes(query);
      const bedMatch = patient.bedNumber.toLowerCase().includes(query);
      const conditionMatch = patient.conditions.toLowerCase().includes(query);
      const searchMatch = !query || nameMatch || bedMatch || conditionMatch;

      const severityMatch = patientSeverityFilter === 'all' || patient.vitalsPreset === patientSeverityFilter;

      return searchMatch && severityMatch;
    });
  })();

  const findPatientForBed = (bedLabel: string, bedId: string) => {
    const found = registeredPatients.find(p => {
      const pBed = p.bedNumber.toLowerCase();
      const bLabel = bedLabel.toLowerCase();
      const bId = bedId.toLowerCase();
      return pBed === bLabel || pBed.includes(bId) || bLabel.includes(pBed);
    });
    if (!found) return undefined;
    const isFiltered = searchedAndFilteredPatients.some(p => p.id === found.id);
    return isFiltered ? found : undefined;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      triggerRegistryNotification("Security Lock: Admin credentials required to add or modify patients.", "error");
      document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!regName.trim() || !regBed.trim()) {
      triggerRegistryNotification('Patient Name and Bed Number are required fields.', 'error');
      return;
    }

    if (editingPatientId) {
      const originalPatient = registeredPatients.find(p => p.id === editingPatientId);
      if (originalPatient && originalPatient.bedNumber !== regBed) {
        const newTransfer: BedTransferRecord = {
          id: `transfer-${Date.now()}`,
          patientName: regName,
          fromBed: originalPatient.bedNumber,
          toBed: regBed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
          reason: regConditions || 'Clinical assessment shift'
        };
        setTransferHistory(prev => [newTransfer, ...prev]);
      }

      setRegisteredPatients(prev => prev.map(p => p.id === editingPatientId ? {
        ...p,
        name: regName,
        bedNumber: regBed,
        age: regAge,
        gender: regGender,
        weight: regWeight,
        bloodType: regBlood,
        phone: regPhone,
        doctorPhone: regDoc,
        mentorPhone: regMentor,
        conditions: regConditions,
        allergies: regAllergies,
        vitalsPreset: regPreset
      } : p));

      triggerRegistryNotification(`Synchronized details for ${regName} safely.`, 'success');
      setEditingPatientId(null);
    } else {
      const newPatient: RegisteredPatient = {
        id: `patient-${Date.now()}`,
        name: regName,
        bedNumber: regBed,
        age: regAge || 'N/A',
        gender: regGender,
        weight: regWeight || 'N/A',
        bloodType: regBlood,
        phone: regPhone || '+256787674140',
        doctorPhone: regDoc || '+256787674140',
        mentorPhone: regMentor || '+256787674140',
        conditions: regConditions || 'Stable standard surveillance',
        allergies: regAllergies || 'Nil known',
        vitalsPreset: regPreset
      };

      setRegisteredPatients(prev => [...prev, newPatient]);
      triggerRegistryNotification(`Successfully registered and allocated ${regName} to ${regBed}!`, 'success');
    }

    setRegName('');
    setRegBed('');
    setRegAge('');
    setRegGender('Male');
    setRegWeight('');
    setRegBlood('O+');
    setRegPhone('+256787674140');
    setRegDoc('+256787674140');
    setRegMentor('+256787674140');
    setRegConditions('');
    setRegAllergies('');
    setRegPreset('healthy');
    setShowRegistrationForm(false);
  };

  const handleDeregister = (id: string, name: string) => {
    if (!isAdmin) {
      triggerRegistryNotification("Security Lock: Admin credentials required to discharge patients.", "error");
      document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const patientObj = registeredPatients.find(p => p.id === id);
    const vacatedBed = patientObj ? patientObj.bedNumber : 'General Ward Unit';

    if (confirm(`Are you sure you want to discharge and de-register ${name}?`)) {
      setRegisteredPatients(prev => prev.filter(p => p.id !== id));
      if (selectedPatientId === id) {
        const remaining = registeredPatients.filter(p => p.id !== id);
        if (remaining.length > 0) {
          setSelectedPatientId(remaining[0].id);
        }
      }

      const newCleaning: CleaningSchedule = {
        id: `clean-${Date.now()}`,
        bedNumber: vacatedBed,
        patientDischarged: name,
        scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        phoneNotified: cleaningStaffSelected,
        status: isAutoCleanSmsEnabled ? 'SMS Dispatched' : 'Scheduled'
      };
      setCleaningSchedules(prev => [newCleaning, ...prev]);

      triggerRegistryNotification(
        isAutoCleanSmsEnabled
          ? `Discharged ${name}. Automated CleanSquad dispatch SMS triggered for vacated ${vacatedBed}!`
          : `Discharged ${name}. Handover scheduled for vacated ${vacatedBed}.`,
        'info'
      );
    }
  };

  const handleEditInitiate = (p: RegisteredPatient) => {
    if (!isAdmin) {
      triggerRegistryNotification("Security Lock: Admin credentials required to update profile data.", "error");
      document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setEditingPatientId(p.id);
    setRegName(p.name);
    setRegBed(p.bedNumber);
    setRegAge(p.age);
    setRegGender(p.gender);
    setRegWeight(p.weight);
    setRegBlood(p.bloodType);
    setRegPhone(p.phone);
    setRegDoc(p.doctorPhone);
    setRegMentor(p.mentorPhone);
    setRegConditions(p.conditions);
    setRegAllergies(p.allergies);
    setRegPreset(p.vitalsPreset);
    setShowRegistrationForm(true);
  };

  // Quick Transfer states
  const [selectedId, setSelectedId] = useState(registeredPatients[0]?.id || '');
  const [targetBedField, setTargetBedField] = useState('');
  const [transferReason, setTransferReason] = useState('');

  useEffect(() => {
    if (!selectedId && registeredPatients.length > 0) {
      setSelectedId(registeredPatients[0].id);
    }
  }, [registeredPatients, selectedId]);

  const currentPatient = registeredPatients.find(p => p.id === selectedId);

  const runExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      triggerRegistryNotification("Security Lock: Admin credentials required to relocate patient beds.", "error");
      document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!selectedId || !targetBedField.trim()) {
      triggerRegistryNotification("Please select a patient and indicate target bed.", "error");
      return;
    }

    const patientObj = registeredPatients.find(p => p.id === selectedId);
    if (!patientObj) {
      triggerRegistryNotification("Patient record missing.", "error");
      return;
    }

    if (patientObj.bedNumber.trim().toLowerCase() === targetBedField.trim().toLowerCase()) {
      triggerRegistryNotification(`Patient is already allocated to ${targetBedField.trim()}.`, "error");
      return;
    }

    const oldBedValue = patientObj.bedNumber;
    const newBedValue = targetBedField.trim();

    setRegisteredPatients(prev => prev.map(p => p.id === selectedId ? {
      ...p,
      bedNumber: newBedValue
    } : p));

    const latestRecord: BedTransferRecord = {
      id: `transfer-${Date.now()}`,
      patientName: patientObj.name,
      fromBed: oldBedValue,
      toBed: newBedValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      reason: transferReason.trim() || 'Urgent physiological relocation'
    };

    setTransferHistory(prev => [latestRecord, ...prev]);

    const newCleaning: CleaningSchedule = {
      id: `clean-${Date.now()}`,
      bedNumber: oldBedValue,
      patientDischarged: patientObj.name,
      scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      phoneNotified: cleaningStaffSelected,
      status: isAutoCleanSmsEnabled ? 'SMS Dispatched' : 'Scheduled'
    };
    setCleaningSchedules(prev => [newCleaning, ...prev]);

    triggerRegistryNotification(
      isAutoCleanSmsEnabled 
        ? `Successfully transferred ${patientObj.name} to ${newBedValue}. SMS dispatched to CleanSquad to disinfect vacated ${oldBedValue}!`
        : `Successfully transferred ${patientObj.name} to ${newBedValue}. Scheduled hygiene team to clean vacated ${oldBedValue}.`, 
      "success"
    );

    setTargetBedField('');
    setTransferReason('');
  };

  const adminPin = '';
  const [adminPinField, setAdminPinField] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  return (
    <div className="space-y-10 w-full">
      {/* Registry Notification Toast */}
      <AnimatePresence>
        {registryNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] max-w-md w-full p-4 rounded-2xl shadow-xl flex items-center gap-3 border font-bold text-xs ${
              registryNotification.type === 'error' 
                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                : registryNotification.type === 'info'
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}
          >
            {registryNotification.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
            <span>{registryNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EHR Administrative Override Controller */}
      <div id="ehr-admin-portal" className={`p-6 sm:p-8 rounded-[2rem] border transition-all ${isAdmin ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-slate-800 dark:text-slate-200 shadow-sm'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${isAdmin ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'}`}>
              {isAdmin ? <CheckCircle size={22} className="animate-pulse" /> : <ShieldAlert size={22} />}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">
                {isAdmin ? '🛡️ EHR Secure Authorized Session Established' : '🔒 Secure Read-Only Clinical Access'}
              </h3>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                {isAdmin 
                  ? 'EHR Database modifications, patient relocations, and profile terminations are fully authorized. Change audits require compliance with HIPAA, regional Ministry of Health regulations, and standard patient data logging.' 
                  : 'Changes to patient vital presets, new bed registrations, discharges, and relocation schedules are currently locked under clinical security guidelines. Access PIN is required to unlock clinical database state mutations and overrides.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {isAdmin ? (
              <button
                onClick={() => {
                  setIsAdmin(false);
                  localStorage.setItem('doctorian_is_admin', 'false');
                  triggerRegistryNotification("Read-only clinical EMR session enforced successfully.", "info");
                }}
                className="px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow cursor-pointer border-0"
              >
                Revoke Clinical Override
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter Admin PIN/Passkey"
                    value={adminPinField}
                    onChange={e => {
                      setAdminPinField(e.target.value);
                      setAdminPinError('');
                    }}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 rounded-xl text-xs font-black placeholder:text-slate-400 outline-none w-full sm:w-56 focus:border-rose-500 text-slate-900 dark:text-white"
                  />
                  {adminPinError && (
                    <span className="absolute -bottom-5 left-0 text-[9px] font-bold text-rose-500">{adminPinError}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (adminPinField === '1234' || adminPinField === 'admin@2026@Doctorian') {
                      setIsAdmin(true);
                      localStorage.setItem('doctorian_is_admin', 'true');
                      setAdminPinField('');
                      setAdminPinError('');
                      triggerRegistryNotification("EHR override authorized. Multi-channel mutation scope open.", "success");
                    } else {
                      setAdminPinError("Incorrect Security PIN code / Passkey");
                      triggerRegistryNotification("EHR authentication fail. PIN rejected.", "error");
                    }
                  }}
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md text-center border-0"
                >
                  Authenticate PIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Bed Occupancy Analytics & Automation Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-100 dark:bg-slate-900/50 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800">
        
        {/* Left Column (7 cols): Real-Time Bed Occupancy Recharts bar chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-850 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-xl shadow-md">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white">Real-Time Bed Occupancy Analytics</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dynamic Recharts Ward Intake Metrics</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 rounded-lg text-[9px] font-black uppercase tracking-wider border border-teal-200/30">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
                Live Stream
              </div>
            </div>

            {/* Dynamic Capacity Indicators */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Capacity</span>
                <span className="font-mono text-xl font-black text-slate-900 dark:text-white block mt-0.5">{totalBedsCount}</span>
                <span className="text-[9px] font-bold text-slate-500 block">Configured beds</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Occupied Beds</span>
                <span className="font-mono text-xl font-black text-teal-600 dark:text-teal-400 block mt-0.5">{overallOccupied}</span>
                <span className="text-[9px] font-bold text-slate-500 block">{occupancyRate}% Load rate</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Available/Ready</span>
                <span className="font-mono text-xl font-black text-blue-600 dark:text-blue-400 block mt-0.5">{overallAvailable}</span>
                <span className="text-[9px] font-bold text-slate-500 block">Disinfected units</span>
              </div>
            </div>

            {/* Bar Chart representing Ward occupancy */}
            <div className="h-[210px] w-full mt-2 relative">
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px' }}
                    labelStyle={{ fontWeight: 'black', color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}
                    itemStyle={{ color: '#94a3b8', fontSize: '10px' }}
                  />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  <Bar dataKey="Occupied" stackId="a" fill="#14b8a6" name="Occupied" radius={[0, 0, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-occ-${index}`} fill={wardSections[index]?.color || '#14b8a6'} />
                    ))}
                  </Bar>
                  <Bar dataKey="Available" stackId="a" fill="rgba(148, 163, 184, 0.12)" name="Available / Empty" radius={[4, 4, 0, 0]} />
                </BarChart>
              </SafeResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Scheduled Discharge & Automatic Cleaner Alerts system */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-xl shadow-md">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-955 dark:text-white-0">Vacated Cleaning Dispatcher</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">SMS-Paging Rules & Schedules</p>
                </div>
              </div>
            </div>

            {/* Automatic SMS Toggle Control */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200 block">Automatic Discharge SMS Alert</span>
                <span className="text-[9px] text-slate-500 font-medium leading-tight block">Notifies cleaning staff instantly on patient discharge or relocation events</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoCleanSmsEnabled(prev => !prev)}
                className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 border-0 ${isAutoCleanSmsEnabled ? 'bg-indigo-600 flex justify-end' : 'bg-slate-300 dark:bg-slate-800 flex justify-start'}`}
              >
                <span className="w-4.5 h-4.5 bg-white rounded-full shadow-md block" />
              </button>
            </div>

            {/* Select Active Cleaning Team */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 pl-0.5 uppercase tracking-wider block">Active On-Duty Clean Team Contact</label>
              <div className="flex items-center gap-2">
                <select
                  value={cleaningStaffSelected}
                  onChange={e => setCleaningStaffSelected(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-3 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="+256787555019">Hygiene Specialist Crew Alpha (+256 787 555-019)</option>
                  <option value="+256787999882">Infirmary Sanitation Crew Beta (+256 787 999-882)</option>
                  <option value="+256787111222">Hospitaller Disinfection Sector 4 (+256 787 111-222)</option>
                </select>
              </div>
            </div>

            {/* Scheduled Alerts Output Log */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 pl-0.5 uppercase tracking-wider block">Recent SMS Logs & Scheduled Handover alerts ({cleaningSchedules.length})</span>
              
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {cleaningSchedules.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 font-bold italic">
                    No vacating events scheduled yet. Try initiating a discharge.
                  </div>
                ) : (
                  cleaningSchedules.map((schedule) => {
                    const isCompleted = schedule.status === 'Completed';
                    return (
                      <div key={schedule.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-[10px] space-y-1.5 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800 dark:text-slate-200 uppercase font-black font-mono">{schedule.bedNumber}</strong>
                            <span className="text-slate-400 leading-none block mt-0.5">Discharged: <span className="font-semibold text-slate-700 dark:text-slate-300">{schedule.patientDischarged}</span></span>
                          </div>
                          <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tight rounded-md flex items-center gap-1 ${isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/20' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200/20 animate-pulse'}`}>
                            {isCompleted ? <CheckCircle size={10} /> : <Clock size={10} />}
                            {schedule.status === 'SMS Dispatched' ? 'SMS SENT' : schedule.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-400 border-t border-slate-100 dark:border-slate-850/60 pt-1.5 mt-1 font-mono">
                          <span>Phone: {schedule.phoneNotified}</span>
                          <span>{schedule.scheduledTime}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50 dark:bg-slate-850 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Clinical Bed allocations</h2>
          <p className="text-slate-500 font-medium text-xs mt-1">
            Active Registered Patients: <strong className="text-teal-600 dark:text-teal-400">{registeredPatients.length} occupied beds</strong>. Automatically dispatches alarms to respective mobile nodes.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPatientId(null);
            setRegName(''); setRegBed(''); setRegAge(''); setRegGender('Male'); setRegWeight(''); setRegBlood('O+'); setRegPhone('+256787674140'); setRegDoc('+256787674140'); setRegMentor('+256787674140'); setRegConditions(''); setRegAllergies(''); setRegPreset('healthy');
            setShowRegistrationForm(!showRegistrationForm);
          }}
          className="px-6 py-4 bg-teal-650 hover:bg-teal-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 border-0 cursor-pointer"
        >
          {showRegistrationForm ? 'Hide Registration Form' : 'Register Patient / Allocate Bed'}
        </button>
      </div>

      {/* Registration Expandable Form */}
      <AnimatePresence>
        {showRegistrationForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleRegister} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl space-y-8">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <UserIcon size={18} className="text-teal-600" />
                {editingPatientId ? 'Modify Patient & Bed Properties' : 'Record New EMR Patient details'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Patient Name</label>
                  <input 
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Full Name (e.g. Nabasa Claire)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Bed Number */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Bed Allocation</label>
                  <input 
                    type="text"
                    required
                    value={regBed}
                    onChange={e => setRegBed(e.target.value)}
                    placeholder="e.g. Bed B-04 (ICU)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Age</label>
                  <input 
                    type="number"
                    value={regAge}
                    onChange={e => setRegAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                  <select
                    value={regGender}
                    onChange={e => setRegGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Weight (kg)</label>
                  <input 
                    type="number"
                    value={regWeight}
                    onChange={e => setRegWeight(e.target.value)}
                    placeholder="e.g. 70"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Blood Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Blood Type</label>
                  <select
                    value={regBlood}
                    onChange={e => setRegBlood(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Patient Primary Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Patient Mobile Phone</label>
                  <input 
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+256787674140"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Doctor Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Doctor Phone</label>
                  <input 
                    type="tel"
                    value={regDoc}
                    onChange={e => setRegDoc(e.target.value)}
                    placeholder="+256787674140"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Mentor Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Guardian Mentor Phone</label>
                  <input 
                    type="tel"
                    value={regMentor}
                    onChange={e => setRegMentor(e.target.value)}
                    placeholder="+256787674140"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Clinical Preset */}
                <div className="space-y-2 md:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 font-bold">Biometrics Preset</label>
                  <select
                    value={regPreset}
                    onChange={e => setRegPreset(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="healthy">Normal Recovery (Stable HR 72, SpO2 98%)</option>
                    <option value="warning">Mild Risk Warning (Elevated HR 105, SpO2 92%)</option>
                    <option value="critical">Severe Alarm Condition (Critical HR 145, SpO2 84%)</option>
                  </select>
                </div>

                {/* Pre-Existing Conditions */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Conditions / Diagnostics</label>
                  <input 
                    type="text"
                    value={regConditions}
                    onChange={e => setRegConditions(e.target.value)}
                    placeholder="e.g. Hypertension, Recovering malaria"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Allergies */}
                <div className="space-y-2 md:col-span-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Known Allergies</label>
                  <input 
                    type="text"
                    value={regAllergies}
                    onChange={e => setRegAllergies(e.target.value)}
                    placeholder="e.g. Sulfa, Penicillin, Peanuts"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-teal-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="px-6 py-3 bg-slate-150 dark:bg-slate-800 text-slate-605 rounded-xl font-bold text-xs cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-teal-650 hover:bg-teal-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border-0 cursor-pointer"
                >
                  {editingPatientId ? 'Synchronize Record' : 'Allocate Bed & Register'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registry Display Mode & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="flex bg-slate-150 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1.5 rounded-2xl w-full sm:w-fit shadow-inner">
          <button
            type="button"
            onClick={() => {
              setRegistryDisplayMode('floorplan');
              triggerRegistryNotification("Switched display to Interactive Ward Floor Plan Map", "info");
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer outline-none border-0 ${registryDisplayMode === 'floorplan' ? 'bg-teal-600 text-white shadow-md' : 'bg-transparent text-slate-500 hover:text-slate-705 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            🗺️ Interactive Ward Floor Plan Grid
          </button>
          <button
            type="button"
            onClick={() => {
              setRegistryDisplayMode('cards');
              triggerRegistryNotification("Switched display to Traditional EMR Patient Cards list", "info");
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer outline-none border-0 ${registryDisplayMode === 'cards' ? 'bg-teal-600 text-white shadow-md' : 'bg-transparent text-slate-500 hover:text-slate-705 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            📋 Traditional Bed Cards list
          </button>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">
          *Clinical overview synchronized on element clicks
        </p>
      </div>

      {/* Real-time Patient Search & Severity Filters Toolbar */}
      <div className="mt-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-805 p-5 rounded-[2.2rem] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs select-none">
            🔍
          </span>
          <input
            type="text"
            value={patientSearchQuery}
            onChange={(e) => setPatientSearchQuery(e.target.value)}
            placeholder="Search patients by name, bed index, diagnoses, or allergies..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl text-[11.5px] font-semibold text-slate-750 dark:text-slate-300 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none shadow-sm transition-all text-slate-900 dm:text-white"
          />
        </div>

        {/* Severity Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-405 font-mono mr-1">
            Severity:
          </span>
          {[
            { id: 'all', label: 'All Beds', color: 'bg-white hover:bg-slate-50 text-slate-750 dark:bg-slate-950 dark:hover:bg-slate-850 dark:text-slate-300 border-slate-150 dark:border-slate-800', activeColor: 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/10' },
            { id: 'healthy', label: 'Stable', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-750 dark:bg-emerald-955/20 dark:hover:bg-emerald-955/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40', activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/10' },
            { id: 'warning', label: 'Warning', color: 'bg-amber-50 hover:bg-amber-100 text-amber-750 dark:bg-amber-955/20 dark:hover:bg-amber-955/40 dark:text-amber-450 border-amber-100 dark:border-amber-900/40', activeColor: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10' },
            { id: 'critical', label: 'Critical', color: 'bg-rose-50 hover:bg-rose-100 text-rose-750 dark:bg-rose-955/20 dark:hover:bg-rose-955/40 dark:text-rose-450 border-rose-100 dark:border-rose-900/40', activeColor: 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/10' }
          ].map(chip => {
            const isActive = patientSeverityFilter === chip.id;
            return (
              <button
                type="button"
                key={chip.id}
                onClick={() => {
                  setPatientSeverityFilter(chip.id as any);
                  triggerRegistryNotification(`Severity Filter: Selected ${chip.label}`, 'info');
                }}
                className={`px-4 py-2.5 rounded-xl text-[9.5px] font-[1000] uppercase tracking-wider border cursor-pointer select-none transition-all ${
                  isActive ? chip.activeColor : `${chip.color}`
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8"></div>

      {registryDisplayMode === 'floorplan' ? (
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 text-white space-y-6">
            
            {/* Floor Plan Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-0.5">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Layers size={20} className="text-teal-400 rotate-6" />
                  Interactive Ward Floor Plan Grid
                </h3>
                <p className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">
                  Pulsatile Location Matrix & Real-time Bed Telemetry Map
                </p>
              </div>
              
              {/* Visual Legends */}
              <div className="flex flex-wrap items-center gap-3.5 text-[9px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow shadow-emerald-500/20" /> STABLE</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> WARNING</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> CRITICAL</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-dashed border-slate-600 bg-slate-950/40" /> VACANT</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500 animate-pulse" /> DISINFECTING</span>
              </div>
            </div>

            {/* Floor Plan Main Grid Sections Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {wardSections.map((section) => {
                const sectionBeds = FLOOR_PLAN_BEDS.filter(b => getWardSection(b.label) === section.name);
                
                return (
                  <div key={section.name} className="bg-slate-950/50 p-6 rounded-3xl border border-slate-850 space-y-4">
                    
                    {/* Section Title Banner */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${section.bg} ${section.text}`}>
                        {section.name}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">
                        {sectionBeds.length} Physical Bed Slots
                      </span>
                    </div>

                    {/* Quadrant grid cells */}
                    <div className="grid grid-cols-2 gap-4">
                      {sectionBeds.map(bed => {
                        const patient = findPatientForBed(bed.label, bed.id);
                        const activeCleaning = cleaningSchedules.find(c => c.bedNumber === bed.label && c.status === 'SMS Dispatched');
                        
                        if (patient) {
                          const isSelected = selectedPatientId === patient.id;
                          const level = patient.vitalsPreset;
                          const borderStyle = 
                            level === 'critical' ? 'border-rose-500 ring-rose-500/20 shadow-xl shadow-rose-950/10' :
                            level === 'warning' ? 'border-amber-500 ring-amber-500/10 shadow-lg shadow-amber-950/10' :
                            'border-emerald-555 ring-emerald-500/10 hover:shadow-emerald-900/10';

                          return (
                            <div
                              key={bed.id}
                              onClick={() => {
                                couplePatientToMonitor(patient);
                                triggerRegistryNotification(`Coupled telemetry feeds with ${patient.name} (${bed.id})`, "info");
                              }}
                              className={`p-4 bg-slate-900/95 rounded-2xl border transition-all duration-300 relative cursor-pointer group flex flex-col justify-between h-42 ${borderStyle} ${isSelected ? 'ring-4 border-teal-500 dark:border-teal-400' : 'hover:scale-102 border-slate-800'}`}
                            >
                              <div>
                                <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 pr-1 leading-none">
                                  <span className="font-extrabold">{bed.id}</span>
                                  <span className="flex items-center gap-1 text-[7px] font-black">
                                    <Activity size={8} className="animate-pulse text-rose-500" />
                                    LIVE
                                  </span>
                                </div>
                                <h4 className="text-xs font-black text-white mt-1.5 leading-tight truncate">{patient.name}</h4>
                                <p className="text-[8px] text-slate-450 font-bold uppercase mt-1">Age: {patient.age} &bull; Blood {patient.bloodType}</p>
                              </div>

                              <div className="space-y-1.5 mt-auto">
                                <div className="flex items-center gap-1.5 mt-2 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-855">
                                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${level === 'critical' ? 'bg-rose-500 shadow shadow-rose-500' : level === 'warning' ? 'bg-amber-500 shadow shadow-amber-500' : 'bg-emerald-555 shadow shadow-emerald-500'}`} />
                                  <span className="text-[8px] font-mono font-bold text-slate-300 leading-none">
                                    {level === 'critical' ? 'HR 145 / SPO2 84%' : level === 'warning' ? 'HR 105 / SPO2 92%' : 'HR 72 / SPO2 98%'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[8px] font-black uppercase text-teal-400 mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span>Couple Feed</span>
                                  <span>Stream Node</span>
                                </div>
                              </div>
                            </div>
                          );
                        } else if (activeCleaning) {
                          return (
                            <div
                              key={bed.id}
                              className="p-3.5 bg-indigo-950/25 rounded-2xl border border-indigo-500/30 flex flex-col justify-between h-42 text-center relative group"
                            >
                              <div className="text-[8px] font-mono text-indigo-400 text-left leading-none">{bed.id}</div>
                              <div className="my-auto space-y-1">
                                <div className="p-1 px-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-[8px] font-black uppercase tracking-wider inline-flex items-center gap-1 mx-auto animate-pulse">
                                  <Clock size={10} /> Disinfecting
                                </div>
                                <span className="text-[8px] text-slate-450 leading-tight block">Cleaning staff alerted via SMS</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCleaningSchedules(prev => prev.map(c => c.id === activeCleaning.id ? { ...c, status: 'Completed' as const } : c));
                                  triggerRegistryNotification(`Sanitization certified for ${bed.id} manually.`, "success");
                                }}
                                className="text-[8px] font-black text-indigo-300 hover:text-indigo-150 uppercase tracking-widest border border-indigo-500/20 rounded-lg py-1.5 bg-indigo-950/45 cursor-pointer"
                              >
                                Sterilize Bed Now
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={bed.id}
                              onClick={() => {
                                setRegBed(bed.label);
                                setShowRegistrationForm(true);
                                triggerRegistryNotification(`Auto-configured admission location to ${bed.id}`, "info");
                                document.getElementById('ehr-admin-portal')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="p-4 bg-slate-950/40 rounded-2xl border border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-900/40 transition-all duration-300 cursor-pointer h-42 flex flex-col justify-between group text-slate-400"
                            >
                              <div className="text-[8px] font-mono text-slate-500 leading-none">{bed.id}</div>
                              <div className="my-auto text-center space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Vacuum Cleaned</span>
                                <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-900/30 inline-block">VACANT</span>
                              </div>
                              <span className="text-[8px] text-slate-450 font-black uppercase tracking-widest text-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                + Click to Admit
                              </span>
                            </div>
                          );
                        }
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {searchedAndFilteredPatients.length === 0 ? (
            <div className="col-span-full py-16 p-10 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-805 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
              <p className="text-4xl select-none">🔬</p>
              <h4 className="text-base font-black uppercase text-slate-800 dark:text-slate-200 tracking-tight">No Patients Match Active Search</h4>
              <p className="text-xs text-slate-400 font-bold max-w-md mx-auto leading-relaxed">
                Modify the severity filter chips above or adjust your medical keyword criteria to locate the desired beds.
              </p>
            </div>
          ) : (
            searchedAndFilteredPatients.map(patient => {
              const isCurrentlySelected = selectedPatientId === patient.id;
              return (
                <div 
                  key={patient.id}
                  className={`flex flex-col justify-between p-6 sm:p-8 rounded-[2.2rem] bg-white dark:bg-slate-900 border transition-all duration-300 relative overflow-hidden shadow-sm ${
                    isCurrentlySelected 
                      ? 'border-teal-500 dark:border-teal-800 ring-4 ring-teal-500/10 shadow-xl' 
                      : 'border-slate-100 dark:border-slate-800 hover:shadow-md'
                  }`}
                >
                  <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full animate-pulse ${
                      patient.vitalsPreset === 'critical' ? 'bg-rose-500 shadow-lg shadow-rose-300 dark:shadow-rose-950' :
                      patient.vitalsPreset === 'warning' ? 'bg-amber-500 shadow-lg shadow-amber-300 dark:shadow-amber-950' : 
                      'bg-emerald-500 shadow-lg shadow-emerald-300 dark:shadow-emerald-950'
                    }`} />
                    <span className="text-[10px] font-black uppercase text-slate-450 font-mono tracking-tighter bg-slate-50 dark:bg-slate-955 px-2 py-1 rounded">{patient.bedNumber}</span>
                  </div>

                  <div className="space-y-5 relative z-10 w-full mb-6">
                    <div>
                      <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest font-sans">Patient Node</h4>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-tight">{patient.name}</h3>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg text-[9px] font-black text-slate-500 uppercase">Age: {patient.age}</span>
                        <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-955 rounded-lg text-[9px] font-black text-slate-500 uppercase">Gender: {patient.gender}</span>
                        <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-955 rounded-lg text-[9px] font-black text-slate-500 uppercase">Type: {patient.bloodType}</span>
                        {patient.weight && <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-955 rounded-lg text-[9px] font-black text-slate-500 uppercase">Wt: {patient.weight}kg</span>}
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-405 font-bold">Patient Cell:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{patient.phone}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-450 font-bold">Duty Physician:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{patient.doctorPhone}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-450 font-bold">Duty Mentor:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{patient.mentorPhone}</span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl text-[11px] border border-slate-100 dark:border-slate-800/80 leading-relaxed font-sans">
                      <p className="text-[9px] font-black text-slate-405 uppercase tracking-widest pl-0.5 mb-1.5">Bioclinical Remarks</p>
                      <div className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">Conditions:</strong> {patient.conditions}</div>
                      <div className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">Allergies:</strong> {patient.allergies}</div>
                      <div className="text-slate-505 dark:text-slate-505 text-[10px] italic mt-2 font-sans">preset: {patient.vitalsPreset?.toUpperCase()} biometrics drift</div>
                    </div>

                    {/* Live patient monitor preview */}
                    <MiniPatientMonitor preset={patient.vitalsPreset} patientId={patient.id} selectedPatientId={selectedPatientId} arduino={arduino} />
                  </div>

                  <div className="flex gap-2.5 mt-auto border-t border-slate-100 dark:border-slate-805 pt-5">
                    {isCurrentlySelected ? (
                      <div className="flex-1 py-3 px-4 bg-teal-550/10 text-teal-600 dark:text-teal-400 rounded-xl text-center font-black text-[10px] uppercase tracking-[0.2em] border border-teal-200/40 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-teal-555 rounded-full animate-ping" />
                        Coupled & Live
                      </div>
                    ) : (
                      <button
                        onClick={() => couplePatientToMonitor(patient)}
                        className="flex-grow py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl font-black text-[10.5px] uppercase tracking-widest transition-all shadow-md active:scale-95 border-0 cursor-pointer text-center"
                      >
                        Couple Monitor
                      </button>
                    )}

                    <div className="flex gap-1.5 justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditInitiate(patient)}
                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors border-0 cursor-pointer"
                        title="Edit Profile"
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeregister(patient.id, patient.name)}
                        className="p-3 bg-rose-50 dark:bg-rose-950/10 text-rose-600 rounded-xl hover:bg-rose-150 transition-colors border-0 cursor-pointer"
                        disabled={registeredPatients.length <= 1}
                        title="Deregister / Discharge"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Patient Bed Transfer Center */}
      <div className="bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-10 mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
              <Clock className="text-teal-600 dark:text-teal-400" size={22} />
              EMR Patient Bed Transfer & Telemetry Hub
            </h3>
            <p className="text-slate-500 font-bold text-xs mt-1">
              Audits all clinical movements, sensor alignment events, and ward re-allocations instantly.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Active Audit Safe
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 grid-cols-12 xl:grid-cols-12 gap-10">
          {/* Quick Transfer Command Tool */}
          <div className="xl:col-span-4 col-span-12 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
              <Settings size={14} className="text-teal-600" />
              Quick Transfer Tool
            </h4>
            <form onSubmit={runExecuteTransfer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Select Patient</label>
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500"
                >
                  <option value="" disabled>-- Select Active Patient --</option>
                  {registeredPatients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.bedNumber})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Current Bed Assignment</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-1">
                  {currentPatient ? currentPatient.bedNumber : 'No patient selected'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">New Bed Allocation</label>
                <input
                  type="text"
                  required
                  value={targetBedField}
                  onChange={e => setTargetBedField(e.target.value)}
                  placeholder="e.g. Bed B-02 (ICU)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Reason for relocation</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="e.g. Needs cardiac ventilation telemetry"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow active:scale-95 text-center block cursor-pointer border-0"
              >
                Execute Transfer Alert
              </button>
            </form>
          </div>

          {/* Transfers Log Center */}
          <div className="xl:col-span-8 col-span-12 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Registry Logs ({transferHistory.length})
                </h4>
                <div className="flex bg-slate-150 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setTransferViewMode('timeline')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      transferViewMode === 'timeline'
                        ? 'bg-teal-600 text-white shadow'
                        : 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Visual Timeline
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      transferViewMode === 'table'
                        ? 'bg-teal-600 text-white shadow'
                        : 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Audit Table View
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTransferHistory(defaultTransfers);
                  triggerRegistryNotification("Reset transfer audit history to clinical defaults.", "info");
                }}
                className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest hover:opacity-85 text-left border-0 bg-transparent cursor-pointer"
              >
                Reset Log to baseline
              </button>
            </div>

            {transferViewMode === 'timeline' ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                {transferHistory.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-12 text-center text-slate-400 font-bold italic shadow-sm animate-pulse">
                    No patient bed transfer operations logged.
                  </div>
                ) : (
                  transferHistory.map((transfer, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={transfer.id}
                      className="relative group timeline-node-container"
                    >
                      <div className="absolute -left-[31px] top-4 z-10 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm border border-teal-200 dark:border-teal-800">
                          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          
                          <div className="space-y-3 flex-grow max-w-full">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-teal-105 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black text-xs flex items-center justify-center uppercase shadow-sm border border-teal-200/40 dark:border-teal-800/60 font-sans">
                                {transfer.patientName?.charAt(0) || 'P'}
                              </span>
                              <div>
                                <h5 className="font-extrabold text-slate-950 dark:text-slate-105 text-sm leading-none">
                                  {transfer.patientName}
                                </h5>
                                <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 tracking-widest uppercase block mt-1 leading-none font-sans">
                                  Approved Clinical Migration
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3.5 bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 w-full sm:w-fit animate-in fade-in">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Source Base Unit</span>
                                <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-705 dark:text-slate-350 rounded-lg text-[10px] font-bold font-mono mt-1">
                                  {transfer.fromBed}
                                </span>
                              </div>
                              <div className="flex items-center justify-center p-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-605">
                                <ChevronRight size={14} className="animate-pulse" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Assigned Dest Unit</span>
                                <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-lg text-[10px] font-black font-mono border border-teal-200/20 mt-1">
                                  {transfer.toBed}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="lg:text-right flex flex-col justify-between items-start lg:items-end gap-3 min-w-[200px] lg:max-w-[40%]">
                            <div className="bg-amber-50/40 dark:bg-amber-950/10 p-3 rounded-2xl border border-amber-500/10 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-full italic leading-tight">
                              "{transfer.reason}"
                            </div>
                            <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end w-full">
                              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/20 shadow-sm">
                                <CheckCircle size={10} className="text-emerald-505" />
                                EMR Cert Compliance
                              </span>
                              <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-505 block font-bold whitespace-nowrap">
                                {transfer.timestamp}
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm animate-in fade-in duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                    <thead className="text-[9px] uppercase font-black tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Patient Node</th>
                        <th className="px-6 py-4">Source Bed</th>
                        <th className="px-6 py-4">Target Bed</th>
                        <th className="px-6 py-4">Reason & Clinical Notes</th>
                        <th className="px-6 py-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {transferHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic animate-pulse">
                            No bed transfer operations logged during this session window.
                          </td>
                        </tr>
                      ) : (
                        transferHistory.map((transfer) => (
                          <tr 
                            key={transfer.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                          >
                            <td className="px-6 py-4 font-black text-slate-955 dark:text-slate-205">
                              {transfer.patientName}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-50 dark:bg-slate-955 rounded text-[10px] font-bold text-slate-500 font-mono">
                                {transfer.fromBed}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-teal-50 dark:bg-teal-950/40 rounded text-[10px] font-black text-teal-600 dark:text-teal-400 font-mono">
                                {transfer.toBed}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-505 dark:text-slate-405 max-w-[240px] truncate" title={transfer.reason}>
                              {transfer.reason}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-[10px] font-bold text-slate-405">
                              {transfer.timestamp}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
